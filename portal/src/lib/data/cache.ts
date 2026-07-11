// Helpers de CACHÉ para los CALLERS (páginas/endpoints). Este módulo NO cachea nada por sí mismo.
//
// El caché real es **Workers Caching** (`cache:{enabled:true}` en wrangler ≥4.69.0), que se sienta
// DELANTE del Worker: un hit devuelve la respuesta SIN ejecutar el Worker → CERO lecturas Firestore.
// "The cache belongs to the Worker, not to a domain" → funciona igual en staging (*.workers.dev) y en
// prod (sello T8, verificado contra docs vivas de Cloudflare). El caller setea `Cache-Control` + el
// header `Cache-Tag` en SU Response; la purga selectiva la dispara la Cloud Function `onWrite`
// (endpoint interno autenticado por HMAC de tiempo constante → `ctx.cache.purge({ tags })`).
//
// ⚠️ POR QUÉ TTL LARGO (no corto): Workers Cache es POR-PoP (data-center). Un `s-maxage` bajo multiplica
// las revalidaciones —y por tanto las lecturas Firestore— por el nº de PoPs con tráfico. Teniendo
// purga-por-tag (que ya invalida al editar), la frescura la da la PURGA, no un TTL corto (comité OD1).
// `stale-while-revalidate` se OMITE a propósito: no está verificado que Workers Cache lo honre y pelearía
// con la purga; TTL efectivo = `s-maxage`.

/** Tags de purga selectiva (deben coincidir con los que emite la Cloud Function al escribir). */
export const cacheTagProp = (id: string): string => `prop:${id}`;
export const cacheTagConfig = (doc: string): string => `config:${doc}`;
export const cacheTagDisp = (propiedadId: string): string => `disp:${propiedadId}`;

/** Ficha / config: casi-estáticos; frescura por purga → 1 día. */
export const CACHE_CONTROL_FICHA = 'public, s-maxage=86400';
/** Disponibilidad: time-sensitive (anti doble-reserva) → TTL corto + purga en el `onWrite`. */
export const CACHE_CONTROL_DISPONIBILIDAD = 'public, s-maxage=60';
/** No disponible / no encontrado: respuesta GENÉRICA (no filtra existencia); TTL corto para absorber
 *  escaneos de ids inexistentes sin pegarle al origen en cada golpe. */
export const CACHE_CONTROL_NOT_FOUND = 'public, s-maxage=120';
/** Respuestas autenticadas / privadas: JAMÁS entran al caché (T2 — auth ⇒ no-store). */
export const CACHE_CONTROL_PRIVATE = 'private, no-store';
