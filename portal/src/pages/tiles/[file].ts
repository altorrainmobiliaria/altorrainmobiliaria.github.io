// Sirve el basemap `.pmtiles` CON soporte de RANGE (TODO-30 / ADR §55.9). pmtiles.js lee el archivo con
// HTTP range-requests; **Cloudflare Workers Static Assets IGNORA el header Range** (devuelve 200 + archivo
// entero) → servir el .pmtiles como asset estático PLANO rompe el mapa. Este Worker lee el asset por el
// binding ASSETS y TROCEA el rango él mismo (206 + Content-Range). El .pmtiles vive en `public/basemap/`.
//
// Bindings CF: `import { env } from 'cloudflare:workers'` (L-33). On-demand (no prerender).

export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const NAME_RE = /^[a-z0-9._-]+\.pmtiles$/i;
const CACHE = 'public, max-age=86400, s-maxage=604800';

// Cache module-scope del buffer del basemap. SEGURO pese a OD1: el .pmtiles es INMUTABLE por deploy
// (un deploy nuevo = isolate nuevo) → no hay estado mutable cross-request. Evita re-leer 3.3 MB por range.
const bufCache = new Map<string, ArrayBuffer>();

async function loadAsset(file: string, reqUrl: string): Promise<ArrayBuffer | null> {
  const hit = bufCache.get(file);
  if (hit) return hit;
  const assets = (env as { ASSETS?: { fetch: (req: Request) => Promise<Response> } }).ASSETS;
  if (!assets) return null;
  const resp = await assets.fetch(new Request(new URL(`/basemap/${file}`, reqUrl)));
  if (!resp.ok) return null;
  const buf = await resp.arrayBuffer();
  bufCache.set(file, buf);
  return buf;
}

/** "bytes=start-end" | "bytes=start-" | "bytes=-N" → offsets absolutos [start,end]. `null` = servir completo. */
function parseRange(header: string | null, size: number): { start: number; end: number } | null {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, s, e] = m;
  if (s === '' && e === '') return null;
  let start: number;
  let end: number;
  if (s === '') {
    const n = Number(e);
    if (n <= 0) return null;
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(s);
    end = e === '' ? size - 1 : Math.min(Number(e), size - 1);
  }
  if (start > end || start >= size) return null;
  return { start, end };
}

const baseHeaders = (): Record<string, string> => ({
  'content-type': 'application/octet-stream',
  'accept-ranges': 'bytes',
  'cache-control': CACHE,
});

export const GET: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';
  if (!NAME_RE.test(file)) return new Response('Not found', { status: 404 });

  const buf = await loadAsset(file, request.url);
  if (!buf) return new Response('Not found', { status: 404 });
  const size = buf.byteLength;

  const range = parseRange(request.headers.get('range'), size);
  if (range) {
    const slice = buf.slice(range.start, range.end + 1);
    return new Response(slice, {
      status: 206,
      headers: {
        ...baseHeaders(),
        'content-range': `bytes ${range.start}-${range.end}/${size}`,
        'content-length': String(slice.byteLength),
      },
    });
  }
  // Rango presente pero insatisfacible → 416.
  if (request.headers.get('range')) {
    return new Response('Range Not Satisfiable', { status: 416, headers: { 'content-range': `bytes */${size}` } });
  }
  return new Response(buf, { status: 200, headers: { ...baseHeaders(), 'content-length': String(size) } });
};

export const HEAD: APIRoute = async ({ params, request }) => {
  const file = params.file ?? '';
  if (!NAME_RE.test(file)) return new Response(null, { status: 404 });
  const buf = await loadAsset(file, request.url);
  if (!buf) return new Response(null, { status: 404 });
  return new Response(null, {
    status: 200,
    headers: { ...baseHeaders(), 'content-length': String(buf.byteLength) },
  });
};
