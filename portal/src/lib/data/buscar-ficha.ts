/*
 * BÚSQUEDA de la propiedad que pinta una ficha. Lo usan las DOS rutas que llevan a una ficha, para que
 * la resolución tenga un solo dueño y no se pueda arreglar en una y romper en la otra.
 *
 * EL PROBLEMA QUE RESUELVE: en este portal NO se puede consultar Firestore por un campo. La capa de
 * datos es un GET puntual por id de documento y las queries están PROHIBIDAS por el gate
 * `verify:data` (una query no acotada es la forma más rápida de tirar el free-tier). Así que una URL
 * bonita como `/inmueble/apartamento-castillogrande-inm-…` no se puede resolver preguntándole a la
 * base «dame el que tenga este slug».
 *
 * LA SALIDA: el índice de catálogo (`indices/catalogo-{shard}`) ya contiene `{id, slug}` de TODAS las
 * publicadas, y la ficha lo necesita igualmente para las «propiedades similares». O sea que el slug se
 * resuelve con una lectura que de todos modos íbamos a hacer, y el memo por-request del cliente hace
 * que pedirla dos veces en el mismo render sea UN solo fetch.
 *
 * COSTE por visita, contado (free-tier, §3.2):
 *   · id canónico              → 1 lectura (la propiedad) + 1 (el shard, para similares) = **2**
 *   · slug del shard de venta  → 1 (índice venta) + 1 (propiedad) + 0 (el shard ya está memoizado) = **2**
 *   · slug del último shard    → 3 (índices) + 1 (propiedad) = **4**
 *   · slug inexistente         → hasta 3, y la respuesta 404 se cachea para absorber el escaneo
 */

import type { DataClient } from './client';
import type { Propiedad } from '../domain/propiedades';
import type { CatalogoResumen, CatalogoShard } from '../domain/catalogo';
import { CATALOGO_SHARDS, operacionAShard } from '../domain/catalogo';

/** Id canónico de propiedad: `INM-YYYYMM-XXXX` (contador atómico, OD8). */
export const ID_PROPIEDAD_RE = /^INM-\d{6}-\d{4}$/i;

export type ResultadoFicha =
  | { estado: 'ok'; p: Propiedad; similares: CatalogoResumen[] }
  /** No existe, no está publicada, o el id no tiene forma válida. Las tres se ven IGUAL desde fuera
   *  a propósito (anti-enumeración, [[L-20]]): si «no publicada» diera un error distinto de «no
   *  existe», cualquiera podría sondear qué borradores tenemos. */
  | { estado: 'no-encontrada' }
  /** Fallo transitorio (red, Firestore caído). NO se cachea y NO se disfraza de 404: un 404 cacheado
   *  por un fallo de red esconde una propiedad viva durante todo el TTL. */
  | { estado: 'error' };

type LecturaShard = { ok: true; items: CatalogoResumen[] } | { ok: false };

/**
 * Lee un shard del índice DISTINGUIENDO «vacío» de «falló».
 *
 * Es la diferencia entre un 404 correcto y uno mentiroso: un shard que todavía no existe es
 * estado-cero legítimo (§54.4) y significa «no hay nada publicado»; un fallo de red significa «no
 * sé». Si los dos devolvieran lista vacía, un hipo de Firestore convertiría todas las fichas en 404
 * — y ese 404 se queda CACHEADO, así que el inmueble desaparece del portal mucho después de que la
 * red se recupere.
 */
async function leerShard(cliente: DataClient, shard: CatalogoShard): Promise<LecturaShard> {
  const r = await cliente.catalogo.get(shard);
  if (!r.ok) return { ok: false };
  return { ok: true, items: r.data.items };
}

export type ResolucionSlug =
  | { estado: 'ok'; id: string; shard: CatalogoShard }
  | { estado: 'no-encontrada' }
  | { estado: 'error' };

/**
 * Resuelve un slug a un id recorriendo los shards EN SERIE y parando en el primero que acierte.
 *
 * En serie y no en paralelo a propósito: en paralelo son SIEMPRE 3 lecturas y 3 descargas del índice
 * completo, incluso cuando la respuesta estaba en el primero. En serie, una propiedad en venta —la
 * mayoría— cuesta UNA. Se paga con algo de latencia en los shards 2 y 3, que es el caso raro.
 *
 * El orden es FIJO (venta, arriendo, días) para que dos propiedades con el mismo slug en shards
 * distintos resuelvan siempre a la misma, y no a una u otra según cómo respondiera la red.
 */
export async function resolverSlug(cliente: DataClient, slug: string): Promise<ResolucionSlug> {
  const clave = slug.trim().toLowerCase();
  if (!clave) return { estado: 'no-encontrada' };

  let huboFallo = false;
  for (const shard of CATALOGO_SHARDS) {
    const r = await leerShard(cliente, shard);
    if (!r.ok) {
      huboFallo = true;
      continue;
    }
    const hit = r.items.find((it) => (it.slug ?? '').toLowerCase() === clave);
    if (hit) return { estado: 'ok', id: hit.id, shard };
  }
  // Si algún shard NO se pudo leer, no se puede afirmar que el slug no exista: puede estar justo ahí.
  return huboFallo ? { estado: 'error' } : { estado: 'no-encontrada' };
}

/**
 * Busca la propiedad de una ficha a partir del parámetro de la URL, que puede ser un id canónico o un
 * slug. Devuelve también las candidatas a «similares» del mismo shard, sin una lectura extra.
 */
export async function buscarFicha(cliente: DataClient, parametro: string): Promise<ResultadoFicha> {
  const clave = (parametro ?? '').trim();
  if (!clave) return { estado: 'no-encontrada' };

  let id = clave;
  if (ID_PROPIEDAD_RE.test(clave)) {
    // Los ids de Firestore SÍ distinguen mayúsculas y el nuestro es siempre `INM-…` en mayúscula. La
    // expresión acepta cualquier caja para que `/inmueble/inm-202607-0001` no acabe en un 404 absurdo.
    id = clave.toUpperCase();
  } else {
    const hit = await resolverSlug(cliente, clave);
    if (hit.estado === 'error') return { estado: 'error' };
    // Sin índice todavía no hay forma de resolver un slug: es «no encontrada», no un error del
    // servidor. El día que el catálogo real exista, esto empieza a encontrar solo.
    if (hit.estado === 'no-encontrada') return { estado: 'no-encontrada' };
    id = hit.id;
  }

  const r = await cliente.propiedades.get(id);
  if (!r.ok) return { estado: r.reason === 'error' ? 'error' : 'no-encontrada' };

  // Para «similares». Si este shard falla, la ficha se publica igual SIN similares: perder una banda
  // de recomendaciones no justifica esconder el inmueble.
  const shard = await leerShard(cliente, operacionAShard(r.data.operacion));
  return { estado: 'ok', p: r.data, similares: shard.ok ? shard.items : [] };
}
