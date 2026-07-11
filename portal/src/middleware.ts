import { defineMiddleware } from 'astro:middleware';
import { getDataClient } from './lib/data/client';

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
  // Capa de datos: 1 instancia POR-REQUEST (memo request-scoped; evita el footgun del estado de módulo
  // que PERSISTE entre requests del mismo isolate en Workers — comité OD1). Lazy: no toca la red hasta
  // un `.get()`, así el overhead en rutas que no leen datos es nulo. La config pública (apiKey/projectId)
  // sale de import.meta.env/constante; el override por env de runtime (wrangler [vars]) es hook post-MVP.
  context.locals.altorra = getDataClient();
  const response = await next();
  if (!IS_PRODUCTION) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
