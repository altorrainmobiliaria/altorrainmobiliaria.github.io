// Cliente REST de Firestore — BAJO NIVEL, edge-safe (SOLO fetch/URL globales; prohibido
// firebase-admin, el SDK firebase/firestore, node:* o Buffer — no corren en Cloudflare Workers).
//
// Es la ÚNICA pieza que habla HTTP con Firestore. Decodifica el formato REST tipado de Firestore
// a objetos JS planos. Diseñado read-only para lecturas PÚBLICAS anónimas (apiKey pública + Security
// Rules como frontera real — ver `firebase/firestore.rules`).
//
// Endurecido por revisión adversarial ×3 (comité OD1, Decisión Fuerte [REVISAR-FABLE]):
//  · mapas/arrays VACÍOS llegan SIN la clave interna (`{mapValue:{}}` / `{arrayValue:{}}`) → defaults.
//  · despacho por PRESENCIA de clave, no por truthiness (si no, `booleanValue:false`/`nullValue:null`
//    se corromperían a `undefined`).
//  · `getDoc` NUNCA lanza: fallo de red/abort/JSON malformado → `{ok:false, reason:'error'}`.

const FS_BASE = 'https://firestore.googleapis.com/v1';
const DEFAULT_DATABASE = '(default)';

/** Valor tipado del REST de Firestore (subset que produce nuestro schema del dominio). */
export type FsValue =
  | { stringValue: string }
  | { integerValue: string } // ⚠️ LLEGA COMO STRING
  | { doubleValue: number | string } // puede llegar como 'NaN'/'Infinity'
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string } // ISO 8601 (dominio ISODate)
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { bytesValue: string } // base64
  | { mapValue: { fields?: Record<string, FsValue> } }
  | { arrayValue: { values?: FsValue[] } };

/** Documento tal como lo devuelve `GET .../documents/{path}`. */
export interface FsDocument {
  name: string; // projects/{p}/databases/{d}/documents/{coll}/{docId}
  fields?: Record<string, FsValue>;
  createTime?: string;
  updateTime?: string;
}

export type LowLevelResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; reason: 'not-found' | 'denied' | 'error'; status?: number };

export interface GetDocOptions {
  apiKey: string;
  projectId: string;
  signal?: AbortSignal;
  /** Inyectable para tests (por defecto el `fetch` global del runtime). */
  fetchImpl?: typeof fetch;
  /** Override de la base REST (por defecto Firestore real). Solo para el emulador local en tests E2E. */
  baseUrl?: string;
  /**
   * ID token de la sesión, para leer un documento que las Rules reservan a su titular (§155).
   *
   * Existe para que una página PÚBLICA pueda leer lo suyo **sin arrastrar el SDK de Firestore**: la
   * `apiKey` sola identifica el proyecto y no autoriza nada, así que sin esto una lectura protegida
   * responde 403. Es el mismo contrato de siempre —edge-safe, solo `fetch`, no lanza nunca—, solo
   * que con la sesión puesta.
   */
  idToken?: string;
}

/**
 * Decodifica un valor REST → JS. Despacha por PRESENCIA de clave (`'x' in v`), NUNCA por truthiness,
 * para no corromper `booleanValue:false` ni `nullValue:null` (comité OD1).
 */
export function decodeValue(v: FsValue): unknown {
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  // COP y `_version` son enteros < 2^53 → `Number()` es exacto (no hace falta BigInt).
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return typeof v.doubleValue === 'string' ? Number(v.doubleValue) : v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue; // se deja como ISO string (dominio ISODate)
  if ('nullValue' in v) return null;
  if ('referenceValue' in v) return v.referenceValue;
  if ('bytesValue' in v) return v.bytesValue;
  if ('geoPointValue' in v) return { lat: v.geoPointValue.latitude, lng: v.geoPointValue.longitude };
  if ('mapValue' in v) {
    const fields = v.mapValue.fields ?? {}; // mapa VACÍO llega sin `fields` (comité BLOCKER)
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) out[k] = decodeValue(val);
    return out;
  }
  if ('arrayValue' in v) {
    const values = v.arrayValue.values ?? []; // array VACÍO llega sin `values` (comité BLOCKER)
    return values.map(decodeValue);
  }
  console.warn('[firestore-rest] tipo de valor REST desconocido:', Object.keys(v as object)[0]);
  return undefined;
}

/**
 * Decodifica un documento REST → objeto plano. Deriva `id` del último segmento de `name`, y
 * `createdAt`/`updatedAt` de la metadata REST SOLO si el doc no trae los suyos (el dominio los tiene).
 */
export function decodeDocument(doc: FsDocument): Record<string, unknown> {
  const fields = doc.fields ?? {};
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(fields)) out[k] = decodeValue(val);
  const idFromName = doc.name.split('/').pop();
  if (out.id === undefined && idFromName) out.id = idFromName;
  if (out.createdAt === undefined && doc.createTime) out.createdAt = doc.createTime;
  if (out.updatedAt === undefined && doc.updateTime) out.updatedAt = doc.updateTime;
  return out;
}

/**
 * GET puntual de un documento. `segments` es un ARRAY estructurado (p.ej. `['propiedades', id]`) que se
 * codifica segmento-a-segmento y JAMÁS se re-parte por '/', para que un id malicioso (`../config/gestion`)
 * no pueda hacer path-traversal (comité OD1: `encodeURIComponent('..')` NO neutraliza el `..`). La validación
 * de la FORMA del id vive en `client.ts` (defensa en profundidad; las Rules son la frontera real).
 *
 * No lanza NUNCA: mapea status (200/404/403/otro) y captura fallos de red/abort/JSON.
 */
export async function getDoc(segments: readonly string[], opts: GetDocOptions): Promise<LowLevelResult> {
  const { apiKey, projectId, signal, fetchImpl = globalThis.fetch, baseUrl = FS_BASE, idToken } = opts;
  const path = segments.map((s) => encodeURIComponent(s)).join('/');
  const url =
    `${baseUrl}/projects/${encodeURIComponent(projectId)}/databases/${DEFAULT_DATABASE}/documents/${path}` +
    `?key=${encodeURIComponent(apiKey)}`;
  try {
    const cabeceras: Record<string, string> = { accept: 'application/json' };
    if (idToken) cabeceras.authorization = `Bearer ${idToken}`;
    const res = await fetchImpl(url, { method: 'GET', headers: cabeceras, signal });
    if (res.status === 200) {
      const json = (await res.json()) as FsDocument;
      return { ok: true, data: decodeDocument(json) };
    }
    if (res.status === 404) return { ok: false, reason: 'not-found', status: 404 };
    if (res.status === 403) return { ok: false, reason: 'denied', status: 403 };
    return { ok: false, reason: 'error', status: res.status };
  } catch {
    // Red / DNS / timeout / AbortError / body no-JSON → contrato "nunca lanza" (comité OD1).
    return { ok: false, reason: 'error' };
  }
}

// ─── ESCRITURA (añadido §88 — leads del formulario público) ─────────────────────────────────────
// La capa nació read-only. La ÚNICA escritura pública que existe es la creación de un lead en
// `solicitudes`, cuya Rule dice `allow create: if true` (verificada contra las reglas VIVAS el
// 2026-08-19, no contra el archivo del repo). Sigue el mismo contrato que las lecturas: edge-safe
// (solo `fetch`/`URL`), sin SDK, y **no lanza NUNCA**.

/** Codifica un valor JS → formato REST tipado. Inverso de `decodeValue`, acotado a lo que escribimos. */
export function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    // Los enteros DEBEN viajar como string (`integerValue`); si no, Firestore los guarda como double
    // y `_version`/precios dejarían de comparar igual que los que escribe el legacy.
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') {
    const fields: Record<string, FsValue> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) fields[k] = encodeValue(val);
    return { mapValue: { fields } };
  }
  // bigint/symbol/function no aparecen en nuestro dominio: se degradan a null en vez de romper el POST.
  return { nullValue: null };
}

export type CreateResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'denied' | 'error'; status?: number };

/**
 * Crea un documento con id auto-generado en una colección de primer nivel.
 *
 * `collection` NO se interpola cruda: se `encodeURIComponent`a igual que los segmentos de `getDoc`
 * (el mismo hallazgo del comité OD1 sobre path-traversal aplica a la escritura).
 *
 * Las Security Rules son la frontera real: si la Rule niega, esto devuelve `denied` — nunca lanza.
 */
export async function createDoc(
  collection: string,
  data: Record<string, unknown>,
  opts: GetDocOptions,
): Promise<CreateResult> {
  const { apiKey, projectId, signal, fetchImpl = globalThis.fetch, baseUrl = FS_BASE } = opts;
  const url =
    `${baseUrl}/projects/${encodeURIComponent(projectId)}/databases/${DEFAULT_DATABASE}` +
    `/documents/${encodeURIComponent(collection)}?key=${encodeURIComponent(apiKey)}`;
  const fields: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = encodeValue(v);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ fields }),
      signal,
    });
    if (res.status === 200) {
      const json = (await res.json()) as FsDocument;
      // `name` = projects/…/documents/{coll}/{docId} → el id es el último segmento.
      return { ok: true, id: (json.name || '').split('/').pop() || '' };
    }
    if (res.status === 403) return { ok: false, reason: 'denied', status: 403 };
    return { ok: false, reason: 'error', status: res.status };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
