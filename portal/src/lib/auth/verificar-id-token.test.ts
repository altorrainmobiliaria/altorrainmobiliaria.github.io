import { beforeEach, describe, expect, it } from 'vitest';
import {
  _olvidarClaves,
  esEditorOMas,
  esStaff,
  tokenDeCabecera,
  verificarIdToken,
} from './verificar-id-token';

// Verificación de ID tokens en el edge (§107). Las pruebas NO usan tokens de mentira: generan un par
// de claves RSA de verdad con WebCrypto, firman el JWT y sirven la clave pública como haría Google. Si
// el camino criptográfico estuviera mal —el base64url, el orden de los campos del JWK, el algoritmo—
// una prueba con un token inventado pasaría igual y no nos enteraríamos hasta producción.

const PROJECT = 'altorra-inmobiliaria-345c6';
const KID = 'kid-de-prueba';
const AHORA_MS = 1_787_000_000_000;
const AHORA_S = Math.floor(AHORA_MS / 1000);

function b64url(bytes: Uint8Array | string): string {
  const bin = typeof bytes === 'string' ? bytes : String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let par: CryptoKeyPair;
let jwkPublica: Record<string, unknown>;

async function clavesDePrueba() {
  if (par) return;
  par = (await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;
  const jwk = await crypto.subtle.exportKey('jwk', par.publicKey);
  jwkPublica = { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig', kid: KID };
}

/** Firma un JWT RS256 de verdad con la clave de prueba. */
async function firmar(
  carga: Record<string, unknown>,
  cabecera: Record<string, unknown> = { alg: 'RS256', kid: KID, typ: 'JWT' },
): Promise<string> {
  await clavesDePrueba();
  const cuerpo = `${b64url(JSON.stringify(cabecera))}.${b64url(JSON.stringify(carga))}`;
  const firma = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', par.privateKey, new TextEncoder().encode(cuerpo)),
  );
  return `${cuerpo}.${b64url(firma)}`;
}

/** Carga válida por defecto: lo que emite Firebase para una sesión buena. */
function carga(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    sub: 'uid-daniel',
    email: 'daniel@altorrainmobiliaria.co',
    iat: AHORA_S - 60,
    exp: AHORA_S + 3600,
    admin: true,
    rol: 'super_admin',
    ...over,
  };
}

/** `fetch` falso que sirve el JWK como lo sirve Google. */
function fetchJwk(claves: unknown[] = [jwkPublica], opciones: { status?: number; maxAge?: number } = {}) {
  return (async () =>
    new Response(JSON.stringify({ keys: claves }), {
      status: opciones.status ?? 200,
      headers: { 'cache-control': `public, max-age=${opciones.maxAge ?? 3600}` },
    })) as unknown as typeof fetch;
}

const verificar = (t: string | null, fetchImpl?: typeof fetch, ahoraMs = AHORA_MS) =>
  verificarIdToken(t, { projectId: PROJECT, fetchImpl: fetchImpl ?? fetchJwk(), ahoraMs });

beforeEach(async () => {
  await clavesDePrueba();
  _olvidarClaves();
});

describe('tokenDeCabecera', () => {
  it('saca el token del esquema Bearer, tolerando espacios', () => {
    expect(tokenDeCabecera('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    expect(tokenDeCabecera('  bearer   abc.def.ghi  ')).toBe('abc.def.ghi');
  });

  it('no acepta otro esquema ni una cabecera vacía', () => {
    expect(tokenDeCabecera('Basic abc')).toBeNull();
    expect(tokenDeCabecera('Bearer')).toBeNull();
    expect(tokenDeCabecera('Bearer    ')).toBeNull();
    expect(tokenDeCabecera(null)).toBeNull();
  });
});

describe('✅ el camino bueno', () => {
  it('acepta un token REAL firmado con la clave que sirve el JWK', async () => {
    const r = await verificar(await firmar(carga()));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.token.uid).toBe('uid-daniel');
    expect(r.token.email).toBe('daniel@altorrainmobiliaria.co');
    expect(r.token.admin).toBe(true);
    expect(r.token.rol).toBe('super_admin');
  });

  it('encuentra su clave aunque Google sirva varias (rota y mantiene las viejas)', async () => {
    const otra = { ...jwkPublica, kid: 'otro-kid' };
    const r = await verificar(await firmar(carga()), fetchJwk([otra, jwkPublica]));
    expect(r.ok).toBe(true);
  });
});

describe('🔴 lo que NO puede pasar', () => {
  it('rechaza una firma que no corresponde al cuerpo (token manipulado)', async () => {
    const bueno = await firmar(carga());
    const [c, , f] = bueno.split('.');
    // Se cambia la carga por una con admin:true inventado, conservando la firma original.
    const cargaFalsa = b64url(JSON.stringify(carga({ sub: 'uid-intruso' })));
    const r = await verificar(`${c}.${cargaFalsa}.${f}`);
    expect(r).toEqual({ ok: false, motivo: 'firma' });
  });

  it('rechaza `alg: none` — el agujero clásico del JWT', async () => {
    const cab = b64url(JSON.stringify({ alg: 'none', kid: KID, typ: 'JWT' }));
    const cga = b64url(JSON.stringify(carga()));
    const r = await verificar(`${cab}.${cga}.`);
    expect(r).toEqual({ ok: false, motivo: 'algoritmo' });
  });

  it('rechaza HS256 aunque venga bien formado (confusión de algoritmo)', async () => {
    const r = await verificar(await firmar(carga(), { alg: 'HS256', kid: KID, typ: 'JWT' }));
    expect(r).toEqual({ ok: false, motivo: 'algoritmo' });
  });

  it('rechaza un token de OTRO proyecto de Firebase', async () => {
    const r = await verificar(await firmar(carga({ aud: 'otro-proyecto' })));
    expect(r).toEqual({ ok: false, motivo: 'emisor' });
  });

  it('rechaza un emisor que no es securetoken de NUESTRO proyecto', async () => {
    const r = await verificar(await firmar(carga({ iss: 'https://securetoken.google.com/otro' })));
    expect(r).toEqual({ ok: false, motivo: 'emisor' });
  });

  it('rechaza un token caducado, y tolera 60 s de desfase de reloj', async () => {
    const caducado = await firmar(carga({ exp: AHORA_S - 120 }));
    expect(await verificar(caducado)).toEqual({ ok: false, motivo: 'expirado' });
    // Justo dentro de la holgura: sigue valiendo. Sin esto, un reloj un poco atrasado echa a la gente.
    const alFilo = await firmar(carga({ exp: AHORA_S - 30 }));
    expect((await verificar(alFilo)).ok).toBe(true);
  });

  it('rechaza un token emitido en el futuro', async () => {
    const r = await verificar(await firmar(carga({ iat: AHORA_S + 600 })));
    expect(r).toEqual({ ok: false, motivo: 'aun-no-valido' });
  });

  it('rechaza sin sujeto: un token sin uid no identifica a nadie', async () => {
    expect(await verificar(await firmar(carga({ sub: '   ' })))).toEqual({ ok: false, motivo: 'sin-sujeto' });
  });

  it('rechaza si su `kid` no está entre las claves de Google', async () => {
    const r = await verificar(await firmar(carga()), fetchJwk([{ ...jwkPublica, kid: 'ninguno' }]));
    expect(r).toEqual({ ok: false, motivo: 'clave-desconocida' });
  });

  it('token ausente o con forma que no es JWT', async () => {
    expect(await verificar(null)).toEqual({ ok: false, motivo: 'ausente' });
    expect(await verificar('')).toEqual({ ok: false, motivo: 'ausente' });
    expect(await verificar('no-es-un-jwt')).toEqual({ ok: false, motivo: 'malformado' });
    expect(await verificar('a.b')).toEqual({ ok: false, motivo: 'malformado' });
  });
});

describe('las claves de Google: caché y caída de red', () => {
  it('cachea: dos verificaciones seguidas hacen UNA sola petición', async () => {
    let llamadas = 0;
    const f = (async () => {
      llamadas++;
      return new Response(JSON.stringify({ keys: [jwkPublica] }), {
        headers: { 'cache-control': 'public, max-age=3600' },
      });
    }) as unknown as typeof fetch;
    const t = await firmar(carga());
    await verificar(t, f);
    await verificar(t, f);
    expect(llamadas).toBe(1);
  });

  it('vuelve a pedirlas cuando el max-age caduca', async () => {
    let llamadas = 0;
    const f = (async () => {
      llamadas++;
      return new Response(JSON.stringify({ keys: [jwkPublica] }), {
        headers: { 'cache-control': 'public, max-age=10' },
      });
    }) as unknown as typeof fetch;
    const t = await firmar(carga());
    await verificar(t, f, AHORA_MS);
    await verificar(t, f, AHORA_MS + 20_000);
    expect(llamadas).toBe(2);
  });

  it('si Google no responde y no hay copia, NO se cuela nadie', async () => {
    const roto = (async () => {
      throw new Error('red caída');
    }) as unknown as typeof fetch;
    const r = await verificar(await firmar(carga()), roto);
    expect(r).toEqual({ ok: false, motivo: 'jwk-no-disponible' });
  });

  it('si Google no responde pero hay copia vieja, se sigue trabajando', async () => {
    const t = await firmar(carga());
    await verificar(t); // llena la caché
    const roto = (async () => {
      throw new Error('red caída');
    }) as unknown as typeof fetch;
    expect((await verificar(t, roto)).ok).toBe(true);
  });
});

/*
 * ⚠️ ESTE BLOQUE SE LLAMABA «los roles espejan a las Rules» y NO abría el archivo de Rules ni una vez
 * (§179): comprobaba que estas funciones hacen lo que esta misma prueba espera, que es otra cosa. El
 * nombre prometía una verificación que no ocurría — la especie del comentario «cambia aquí y solo
 * aquí» de §178. Lo que sí prueba es útil y se queda; el ESPEJO de verdad, comparando estas listas
 * contra `firebase/firestore.rules`, lo hace ahora `verify:data`.
 */
describe('qué decide cada rol (el espejo contra las Rules lo comprueba `verify:data`)', () => {
  const t = (over: Record<string, unknown> = {}) =>
    ({ uid: 'u', admin: true, rol: 'editor', ...over }) as never;

  it('staff = el claim `admin`, ni más ni menos', () => {
    expect(esStaff(t())).toBe(true);
    expect(esStaff(t({ admin: false }))).toBe(false);
    // Un rol sin el claim NO es staff: es justo lo que impide que baste con escribir `rol` en un sitio.
    expect(esStaff(t({ admin: false, rol: 'super_admin' }))).toBe(false);
  });

  it('escribir contenido es de editor o super_admin, no de viewer', () => {
    expect(esEditorOMas(t({ rol: 'super_admin' }))).toBe(true);
    expect(esEditorOMas(t({ rol: 'editor' }))).toBe(true);
    expect(esEditorOMas(t({ rol: 'viewer' }))).toBe(false);
    expect(esEditorOMas(t({ rol: undefined }))).toBe(false);
  });
});
