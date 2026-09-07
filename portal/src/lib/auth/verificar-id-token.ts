/*
 * VERIFICACIÓN DE IDENTIDAD EN EL EDGE — sin SDK, sin lecturas facturables (§107).
 *
 * POR QUÉ EXISTE: el portal necesita endpoints que solo pueda usar el equipo (el primero: subir fotos
 * a R2). Hasta ahora toda la superficie pública era de solo-lectura anónima, así que no había ninguna
 * forma de contestar «¿quién eres?» en el Worker. Las opciones descartadas y por qué:
 *
 *   · `firebase-admin` → NO corre en Workers, y el gate `verify:data` lo prohíbe en todo `portal/src`.
 *   · Un secreto compartido en el cliente → un secreto que viaja al navegador no es un secreto.
 *   · Preguntarle a Firestore por el rol → una lectura facturable por subida, y el modelo de permisos
 *     del proyecto ya decidió lo contrario en §99: **el permiso viaja en el token**, no se consulta.
 *
 * Lo que queda es lo correcto: verificar el ID token de Firebase con WebCrypto, que es RS256 sobre
 * claves públicas de Google. Cero dependencias, cero lecturas, y el MISMO claim (`admin`) que ya usan
 * las Security Rules — así que una puerta no puede abrirse cuando la otra está cerrada.
 *
 * ⚠️ ESTO NO SUSTITUYE A LAS RULES. Es la puerta del Worker, que es el único sitio donde se puede
 * decidir quién escribe en R2 (a R2 no llegan las Rules de Firebase). Para Firestore, la frontera
 * sigue siendo el ruleset.
 */

/** Endpoint JWK de Google para ID tokens de Firebase. VERIFICADO en vivo: `{keys:[{kty,alg,use,kid,n,e}]}`. */
const URL_JWK = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

/** Tolerancia de reloj. Los relojes del edge y de Google no son el mismo; 60 s es el uso habitual. */
const HOLGURA_S = 60;

/** Respaldo si la respuesta de Google no trae `max-age` (no debería pasar; Google lo manda). */
const TTL_JWK_MS = 60 * 60 * 1000;

export interface TokenVerificado {
  uid: string;
  email?: string;
  /** Claim `admin`, puesto por `claimsStaffSync` desde `usuarios/{uid}` (§99). Es el MISMO que leen las Rules. */
  admin: boolean;
  rol?: string;
}

export type MotivoRechazo =
  | 'ausente'
  | 'malformado'
  | 'algoritmo'
  | 'emisor'
  | 'expirado'
  | 'aun-no-valido'
  | 'sin-sujeto'
  | 'clave-desconocida'
  | 'firma'
  | 'jwk-no-disponible';

export type ResultadoToken =
  | { ok: true; token: TokenVerificado }
  | { ok: false; motivo: MotivoRechazo };

/** `Authorization: Bearer <token>` → el token, o `null`. Tolerante con espacios, estricto con el esquema. */
export function tokenDeCabecera(cabecera: string | null): string | null {
  if (!cabecera) return null;
  const m = cabecera.trim().match(/^Bearer\s+(.+)$/i);
  const t = m?.[1]?.trim();
  return t ? t : null;
}

/** base64url → bytes. `atob` existe en Workers; el relleno y los dos caracteres cambiados los ponemos nosotros. */
// El tipo lleva `<ArrayBuffer>` a propósito: `crypto.subtle.verify` exige un `BufferSource` con un
// ArrayBuffer CONCRETO, y un `Uint8Array` genérico (cuyo buffer podría ser `SharedArrayBuffer`) ya no
// encaja en TS 7. Construirlo sobre un ArrayBuffer explícito lo resuelve sin castings.
function desdeBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function jsonDeBase64Url(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(new TextDecoder().decode(desdeBase64Url(s))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface JwkGoogle {
  kid: string;
  kty: string;
  alg: string;
  n: string;
  e: string;
  use?: string;
}

/**
 * Caché de las claves públicas en ámbito de módulo.
 *
 * SEGURO pese a la doctrina anti-estado del proyecto: son claves PÚBLICAS de Google, iguales para todo
 * el mundo y sin nada del visitante dentro. Y es lo que evita una petición de red por cada subida.
 * Se respeta el `max-age` que manda Google, que es quien sabe cuándo rota.
 */
let cacheJwk: { hasta: number; claves: Map<string, JwkGoogle> } | null = null;

async function clavesDeGoogle(
  fetchImpl: typeof fetch,
  ahoraMs: number,
): Promise<Map<string, JwkGoogle> | null> {
  if (cacheJwk && cacheJwk.hasta > ahoraMs) return cacheJwk.claves;
  let resp: Response;
  try {
    resp = await fetchImpl(URL_JWK);
  } catch {
    return cacheJwk?.claves ?? null; // red caída: mejor la copia vieja que cerrar el panel entero
  }
  if (!resp.ok) return cacheJwk?.claves ?? null;

  let cuerpo: { keys?: JwkGoogle[] };
  try {
    cuerpo = (await resp.json()) as { keys?: JwkGoogle[] };
  } catch {
    return cacheJwk?.claves ?? null;
  }
  if (!Array.isArray(cuerpo.keys) || !cuerpo.keys.length) return cacheJwk?.claves ?? null;

  const maxAge = (resp.headers.get('cache-control') ?? '').match(/max-age=(\d+)/)?.[1];
  const ttl = maxAge ? Number(maxAge) * 1000 : TTL_JWK_MS;
  const claves = new Map(cuerpo.keys.filter((k) => k?.kid).map((k) => [k.kid, k]));
  cacheJwk = { hasta: ahoraMs + ttl, claves };
  return claves;
}

/** Solo para tests: olvida las claves cacheadas. */
export function _olvidarClaves(): void {
  cacheJwk = null;
}

export interface OpcionesVerificacion {
  projectId: string;
  fetchImpl?: typeof fetch;
  /** Milisegundos "ahora". Inyectable para poder probar expiración sin esperar una hora. */
  ahoraMs?: number;
}

/**
 * Verifica un ID token de Firebase. Devuelve el motivo del rechazo, no solo `false`: un endpoint que
 * dice «no autorizado» sin más convierte cualquier fallo de reloj en una tarde de depuración.
 *
 * ORDEN A PROPÓSITO: primero las comprobaciones baratas que solo pueden RECHAZAR (forma, algoritmo,
 * emisor, caducidad) y después la firma, que cuesta red y criptografía. Rechazar mirando datos que aún
 * no están firmados es seguro —nunca se ACEPTA nada por ellos—, y evita que cualquiera con un token
 * inventado nos haga trabajar. Lo que jamás se hace es al revés: ningún camino devuelve `ok` sin haber
 * verificado la firma.
 */
export async function verificarIdToken(
  token: string | null,
  opciones: OpcionesVerificacion,
): Promise<ResultadoToken> {
  if (!token) return { ok: false, motivo: 'ausente' };

  const partes = token.split('.');
  if (partes.length !== 3) return { ok: false, motivo: 'malformado' };
  const [b64Cabecera, b64Carga, b64Firma] = partes;

  const cabecera = jsonDeBase64Url(b64Cabecera);
  const carga = jsonDeBase64Url(b64Carga);
  if (!cabecera || !carga) return { ok: false, motivo: 'malformado' };

  // `alg` FIJO a RS256. Aceptar lo que diga la cabecera es el agujero clásico del JWT: con `none` o
  // con un HMAC cuya "clave" es la pública de Google, cualquiera se firma sus propios tokens.
  if (cabecera.alg !== 'RS256') return { ok: false, motivo: 'algoritmo' };
  const kid = typeof cabecera.kid === 'string' ? cabecera.kid : '';
  if (!kid) return { ok: false, motivo: 'malformado' };

  const { projectId } = opciones;
  if (carga.aud !== projectId) return { ok: false, motivo: 'emisor' };
  if (carga.iss !== `https://securetoken.google.com/${projectId}`) return { ok: false, motivo: 'emisor' };

  const ahoraMs = opciones.ahoraMs ?? Date.now();
  const ahoraS = Math.floor(ahoraMs / 1000);
  const exp = typeof carga.exp === 'number' ? carga.exp : 0;
  const iat = typeof carga.iat === 'number' ? carga.iat : 0;
  if (!exp || exp + HOLGURA_S < ahoraS) return { ok: false, motivo: 'expirado' };
  if (iat - HOLGURA_S > ahoraS) return { ok: false, motivo: 'aun-no-valido' };

  const uid = typeof carga.sub === 'string' ? carga.sub.trim() : '';
  if (!uid) return { ok: false, motivo: 'sin-sujeto' };

  const claves = await clavesDeGoogle(opciones.fetchImpl ?? fetch, ahoraMs);
  if (!claves) return { ok: false, motivo: 'jwk-no-disponible' };
  const jwk = claves.get(kid);
  if (!jwk) return { ok: false, motivo: 'clave-desconocida' };

  let valida = false;
  try {
    const clave = await crypto.subtle.importKey(
      'jwk',
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    valida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      clave,
      desdeBase64Url(b64Firma),
      new TextEncoder().encode(`${b64Cabecera}.${b64Carga}`),
    );
  } catch {
    valida = false;
  }
  if (!valida) return { ok: false, motivo: 'firma' };

  return {
    ok: true,
    token: {
      uid,
      email: typeof carga.email === 'string' ? carga.email : undefined,
      admin: carga.admin === true,
      rol: typeof carga.rol === 'string' ? carga.rol : undefined,
    },
  };
}

/** ¿Es del equipo? Espeja `esStaff()` de las Rules: el claim `admin`, nada más. */
export function esStaff(t: TokenVerificado): boolean {
  return t.admin === true;
}

/** ¿Puede escribir contenido? Espeja `esEditorOMas()` de las Rules. */
export function esEditorOMas(t: TokenVerificado): boolean {
  return esStaff(t) && (t.rol === 'super_admin' || t.rol === 'editor');
}
