/*
 * LOS 301 DEL SITIO VIEJO — una sola ruta que los cubre todos (§145).
 *
 * POR QUÉ ESTA RUTA Y NO LA CONFIG DE ASTRO. Primero declaré los 65 redirects en `astro.config.mjs`.
 * Funcionaron **28**. Los otros **37 quedaron muertos**: Astro los marcó `prerender: true` —según una
 * heurística sobre el destino— y **no emitió el archivo estático correspondiente**, así que nadie los
 * servía y respondían 404. Medido uno por uno en el manifiesto construido, no supuesto.
 *
 * Pelearse con esa heurística es frágil: depende de si el destino es estático, y eso cambia cada vez
 * que una página gana o pierde su `prerender`. Una ruta con parámetro-resto es **SSR por
 * construcción**, cubre cualquier `.html` del legacy —incluidos los de `/blog/…`— y usa el MISMO mapa
 * que ya es dueño de la lista. Un mecanismo, una fuente.
 *
 * ⚠️ NO se traga los 404 legítimos: solo responde a rutas terminadas en `.html`, que el portal nuevo
 * no usa en ninguna de sus direcciones. Lo que no esté en el mapa sigue siendo un 404 honesto.
 *
 * ⚠️ Y depende de `run_worker_first` en `wrangler.jsonc`: sin eso, la capa de assets de Cloudflare
 * responde ANTES que el Worker y esta ruta no llega a ejecutarse. `verify:build` lo vigila.
 */

import type { APIRoute } from 'astro';
import { resolverRedirect } from '../lib/seo/redirects';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const destino = resolverRedirect(url.pathname);
  if (destino) {
    // 301 y no 302: el traslado es DEFINITIVO, y es lo que hace que Google transfiera la autoridad
    // de la dirección vieja a la nueva. Un 302 mantendría indexada la vieja y no traspasaría nada.
    return new Response(null, { status: 301, headers: { location: destino } });
  }

  /*
   * No está en el mapa: 404 de verdad. Se devuelve una página mínima a propósito en vez de intentar
   * renderizar la 404 bonita — esta ruta existe para redirigir, y hacerla depender del render de otra
   * página añadiría una forma de fallar a un camino cuyo trabajo es no fallar.
   */
  return new Response('No encontrado.', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
