import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!IS_PRODUCTION) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
