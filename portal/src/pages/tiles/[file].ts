// Ruta que sirve el basemap `.pmtiles` desde R2 (binding R2_MEDIA) — TODO-30 / honra el sello
// "binarios a R2" (R5). pmtiles.js lee el archivo con HTTP RANGE requests: esta ruta DEBE soportar
// el header `Range` (206 + Content-Range), o el mapa no carga. On-demand (lee R2 en runtime).
//
// El dueño sube el extracto UNA vez (credencial suya, Fincaraíz):
//   wrangler r2 object put altorra-portal-media/cartagena.pmtiles --file=cartagena.pmtiles --remote
// Hasta entonces, el 404 mantiene el ESQUEMÁTICO sellado (degradación limpia en el cliente).

export const prerender = false;

import type { APIRoute } from 'astro';
// Bindings de Cloudflare: `Astro.locals.runtime.env` fue REMOVIDO en Astro v6 (@astrojs/cloudflare v14);
// la vía vigente es el módulo virtual `cloudflare:workers` (L-14/L-19: verificar el stack, no la memoria).
import { env } from 'cloudflare:workers';

// Solo nombres de archivo simples con extensión .pmtiles (anti path-traversal; las Rules de R2 no aplican aquí).
const NAME_RE = /^[a-z0-9._-]+\.pmtiles$/i;

// El basemap cambia rara vez -> caché largo. La purga (si se re-sube) la haría el flujo de deploy.
const CACHE = 'public, max-age=86400, s-maxage=604800';

/** "bytes=start-end" | "bytes=start-" | "bytes=-N" -> rango R2 (tipo global de Cloudflare).
 *  `null` = servir completo. Las 3 ramas producen variantes válidas del union R2Range. */
function parseRange(header: string | null): R2Range | null {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, s, e] = m;
  if (s === '' && e === '') return null;
  if (s === '') return { suffix: Number(e) }; // ultimos N bytes
  if (e === '') return { offset: Number(s) }; // desde N hasta el final
  return { offset: Number(s), length: Number(e) - Number(s) + 1 };
}

export const GET: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';
  if (!NAME_RE.test(file)) return new Response('Not found', { status: 404 });

  const bucket = env.R2_MEDIA;
  if (!bucket) return new Response('R2 no disponible', { status: 503 });

  const range = parseRange(request.headers.get('range'));

  let obj: R2ObjectBody | null;
  try {
    obj = await bucket.get(file, range ? { range } : undefined);
  } catch {
    // Rango insatisfacible u otro fallo de R2.
    return new Response('Range Not Satisfiable', { status: 416 });
  }
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers({
    'content-type': 'application/octet-stream',
    'accept-ranges': 'bytes',
    'cache-control': CACHE,
    etag: obj.httpEtag,
  });

  const served = obj.range as { offset?: number; length?: number } | undefined;
  if (range && served) {
    const start = served.offset ?? 0;
    const len = served.length ?? obj.size - start;
    headers.set('content-range', `bytes ${start}-${start + len - 1}/${obj.size}`);
    headers.set('content-length', String(len));
    return new Response(obj.body, { status: 206, headers });
  }

  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { status: 200, headers });
};

// pmtiles puede sondear con HEAD antes de los range GET.
export const HEAD: APIRoute = async ({ params }) => {
  const file = params.file ?? '';
  if (!NAME_RE.test(file)) return new Response(null, { status: 404 });
  const bucket = env.R2_MEDIA;
  if (!bucket) return new Response(null, { status: 503 });
  const head = await bucket.head(file);
  if (!head) return new Response(null, { status: 404 });
  return new Response(null, {
    status: 200,
    headers: {
      'content-type': 'application/octet-stream',
      'accept-ranges': 'bytes',
      'content-length': String(head.size),
      'cache-control': CACHE,
      etag: head.httpEtag,
    },
  });
};
