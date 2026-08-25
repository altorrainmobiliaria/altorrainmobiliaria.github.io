/*
 * VERIFICACIÓN DE PROPIEDAD DE SEARCH CONSOLE — servida por el Worker, con 200 y sin redirecciones.
 *
 * 🔴 POR QUÉ ES UNA RUTA Y NO UN ARCHIVO EN `public/` (§145).
 *
 * Estaba en `public/`, y ahí lo sirve la capa de assets de Cloudflare — que por defecto **quita el
 * `.html` y redirige**. Medido: hoy, en GitHub Pages, esta dirección responde **200**; en el Worker
 * responde **307** hacia la versión sin extensión. O sea que el cutover CAMBIA el comportamiento del
 * único archivo que sostiene la propiedad del sitio en Search Console — y perderla no cuesta un
 * error visible: cuesta el histórico entero y la capacidad de reenviar el sitemap.
 *
 * Como ruta del Worker, la dirección responde **200 con el contenido exacto**, igual que hoy, sin
 * depender de cómo la capa de assets trate las extensiones.
 *
 * ⚠️ **Este archivo es ahora el DUEÑO ÚNICO del contenido.** La copia de `public/` se retiró a
 * propósito: dos fuentes para el mismo token es cómo se actualiza una y se olvida la otra, y aquí
 * «la otra» es la que Google lee.
 *
 * ⛔ NO renombrar, NO redirigir, NO borrar. Está en `NO_REDIRIGIR` de `lib/seo/redirects.ts` por la
 * misma razón.
 */

import type { APIRoute } from 'astro';

export const prerender = false;

/** El token, literal. Lo emite Google y no se deriva de nada: se copia tal cual. */
const TOKEN = 'google-site-verification: googlec4e47cae776946d9.html';

export const GET: APIRoute = () =>
  new Response(TOKEN, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Se cachea poco: si algún día hay que rotar la verificación, no se quiere esperar un día.
      'cache-control': 'public, max-age=300',
    },
  });
