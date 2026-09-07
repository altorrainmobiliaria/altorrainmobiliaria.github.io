import { defineMiddleware } from 'astro:middleware';
import { getDataClient } from './lib/data/client';
import { resolverRedirect } from './lib/seo/redirects';

// STAGING NO INDEXABLE (mitigación O3/T1 + O13 del plan endurecido).
// Regla: nada se indexa salvo que el build sea explícitamente de PRODUCCIÓN
// (PUBLIC_SITE_ENV === 'production'). Por defecto => noindex. Así el staging en
// *.workers.dev nunca envenena el SEO del lanzamiento, y NO dependemos del host
// (que no forma parte del cache-key en Workers Caching — O13). El cutover a prod
// se hace construyendo con PUBLIC_SITE_ENV=production.
//
// Nota: el middleware corre en rutas SSR (on-demand). Las páginas ESTÁTICAS
// prerenderizadas llevan además la <meta name="robots"> en BaseLayout (mismo gate),
// porque el asset estático se sirve sin invocar el Worker.
const IS_PRODUCTION = import.meta.env.PUBLIC_SITE_ENV === 'production';

export const onRequest = defineMiddleware(async (context, next) => {
  // 301 del sitio viejo → portal nuevo. Va PRIMERO y corta el request: no tiene sentido montar la
  // capa de datos ni renderizar para algo que se va a redirigir. Las rutas `.html` del legacy no
  // existen como asset estático en este build, así que el Worker las recibe y llegan hasta aquí.
  // Es GATE DEL CUTOVER: sin esto, el histórico de Search Console del sitio viejo cae en 404.
  const destino = resolverRedirect(context.url.pathname);
  if (destino) {
    return context.redirect(destino, 301);
  }

  // Capa de datos: 1 instancia POR-REQUEST (memo request-scoped; evita el footgun del estado de módulo
  // que PERSISTE entre requests del mismo isolate en Workers — comité OD1). Lazy: no toca la red hasta
  // un `.get()`, así el overhead en rutas que no leen datos es nulo. La config pública (apiKey/projectId)
  // sale de import.meta.env/constante; el override por env de runtime (wrangler [vars]) es hook post-MVP.
  context.locals.altorra = getDataClient();
  const response = await next();
  if (IS_PRODUCTION) return response;

  // ⚠️ CABECERAS INMUTABLES (cazado en vivo el 2026-08-21, ADR §96). `Response.redirect()` devuelve
  // una respuesta cuyas cabeceras NO se pueden tocar: `set()` lanza «Can't modify immutable headers»
  // y el request entero acaba en 500. Eso alcanzaba a TODO endpoint que responda con un redirect, o
  // sea al fallback SIN JavaScript de los formularios de leads (`api/solicitud`, `api/alerta`), que
  // es justo el camino que nadie prueba en el navegador porque el JS lo tapa.
  // Solo pasa fuera de producción, que es donde se verifica todo: es decir, exactamente donde más
  // engaña. Se reconstruye la respuesta en vez de perderla.
  try {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  } catch {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
});
