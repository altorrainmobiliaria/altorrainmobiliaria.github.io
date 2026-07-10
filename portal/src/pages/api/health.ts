import type { APIRoute } from 'astro';

// Endpoint ON-DEMAND (SSR en el edge Worker). Es la PRUEBA VIVA de que el render
// dinámico corre en Cloudflare Workers — la 2ª frontera del scaffold (la 1ª es la
// página estática prerenderizada). Objetivo de verificación en staging:
//   curl https://<worker>.workers.dev/api/health  =>  { ok: true, ... }
export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const body = {
    ok: true,
    service: 'altorra-portal',
    stage: 'ola-0-scaffold',
    renderedAt: new Date().toISOString(),
    path: new URL(request.url).pathname,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};
