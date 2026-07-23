// Endpoint del CATÁLOGO público (OD-Catálogo §54): sirve el índice denormalizado como JSON para que la
// isla del SERP pinte cards + filtre client-side + alimente los pins del mapa (TODO-30) + "similares".
// On-demand (lee Firestore por REST vía la capa de datos); Workers Caching se sienta DELANTE (edge-only,
// purgeable por la Function `onWrite` con el tag `catalogo:{shard}`). NINGUNA Function en el camino de render.
//
// Rutas: /api/catalogo/comprar.json · /arrendar.json · /estancias.json → shards venta|arriendo|dias.

export const prerender = false;

import type { APIRoute } from 'astro';
import { rutaAShard } from '../../../lib/domain/catalogo';
import { cacheTagCatalogo, CACHE_CONTROL_CATALOGO, CACHE_CONTROL_NOT_FOUND, CACHE_CONTROL_PRIVATE } from '../../../lib/data/cache';

export const GET: APIRoute = async ({ params, locals }) => {
  const shard = rutaAShard(params.operacion ?? '');
  if (!shard) {
    // Ruta que no mapea a un shard: 404 genérico, cache corto para absorber escaneos.
    return json({ ok: false, reason: 'not-found' }, 404, CACHE_CONTROL_NOT_FOUND);
  }

  const r = await locals.altorra.catalogo.get(shard);
  if (!r.ok) {
    // unavailable = reglas rotas o red (transitorio). Estado EXPLÍCITO, NO vacío (§54.4 cond.2); sin caché.
    return json({ ok: false, reason: 'unavailable' }, 503, CACHE_CONTROL_PRIVATE);
  }

  // Forma pública limpia (no filtra el id interno del doc índice). El vacío canónico sale como items:[].
  const body = { ok: true, shard, version: r.data._version, actualizado: r.data.actualizado, items: r.data.items };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': CACHE_CONTROL_CATALOGO,
      'cache-tag': cacheTagCatalogo(shard),
    },
  });
};

function json(payload: unknown, status: number, cacheControl: string): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
}
