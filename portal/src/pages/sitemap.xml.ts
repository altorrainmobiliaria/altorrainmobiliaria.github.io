import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ZONAS } from '../lib/content/zonas';
import { fechaISO } from '../lib/content/journal';

/**
 * `sitemap.xml` (MEGA-PLAN §OLA 1 ítem 11 · ADR §90).
 *
 * Se construye a mano y no con `@astrojs/sitemap` a propósito: el integrador barre TODAS las rutas
 * emitidas, y aquí hay tres que JAMÁS deben entrar (`/gestion`, `/design-system`, `/404`) más las
 * rutas SSR de ficha, que dependen de datos que hoy son DEMO (§56-§60). Declarar la lista a mano es
 * unas líneas más y hace imposible filtrar una página interna al sitemap por descuido.
 *
 * ⚠️ Regla operativa de la skill `search-console-setup-y-diagnostico`: al AÑADIR URLs hay que
 * RE-ENVIAR el sitemap en GSC. El contador "N descubiertas" refleja la última lectura de Google,
 * no el archivo de hoy — si no se reenvía, las URLs nuevas simplemente no existen para Google.
 *
 * Las URLs SIEMPRE se emiten sobre el dominio de producción (`site` de astro.config), nunca sobre
 * el host del request: un sitemap que se auto-referencia a *.workers.dev enseñaría el staging.
 */
export const prerender = true;

interface Entrada {
  ruta: string;
  /** 0.0–1.0 — importancia RELATIVA dentro de este sitio, no una nota absoluta. */
  prioridad: number;
  frecuencia: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /**
   * Fecha REAL de la última modificación, cuando se sabe. Sin esto todas las URLs declaran la fecha
   * del build, que es mentira barata: Google aprende a ignorar un `lastmod` que cambia entero cada
   * despliegue, y entonces deja de servir para lo unico que sirve — avisar de lo que SÍ cambió.
   */
  lastmod?: string;
}

/**
 * Solo páginas públicas con contenido propio. Ausentes a propósito:
 * · `/gestion` · `/design-system` · `/404`   → internas (además llevan `noindex` en BaseLayout).
 * · `/favoritos` · `/ingresar`               → utilidades del usuario, sin contenido indexable.
 * · `/ficha`                                → andamio DEMO (§97): un inmueble que no existe.
 * · fichas de inmueble (`/inmueble/<slug>`)  → la ruta ya existe (§97); las URLs entran cuando el
 *   catálogo deje de ser DEMO. Se derivarán del índice, como las zonas se derivan de `ZONAS`. NO se
 *   hace ya porque hoy el índice está vacío y ataría el build a una lectura de red que, si falla,
 *   dejaría el sitemap sin fichas SIN dar error. Es paso de cutover (TODO-22).
 * (las landings de barrio `/zona/<slug>` SÍ entran: se derivan de `ZONAS` al final de la lista).
 */
const RUTAS: Entrada[] = [
  { ruta: '/', prioridad: 1.0, frecuencia: 'daily' },
  { ruta: '/comprar', prioridad: 0.9, frecuencia: 'daily' },
  { ruta: '/arrendar', prioridad: 0.9, frecuencia: 'daily' },
  { ruta: '/estancias', prioridad: 0.8, frecuencia: 'weekly' },
  { ruta: '/publicar', prioridad: 0.8, frecuencia: 'monthly' },
  // Precios: diferenciador del plan (op.7) y la pregunta nº1 que llega por WhatsApp.
  { ruta: '/precios', prioridad: 0.8, frecuencia: 'monthly' },
  // Rango ALTORRA: captación de PROPIETARIOS, que es de donde sale el inventario.
  { ruta: '/rango-altorra', prioridad: 0.8, frecuencia: 'monthly' },
  // Alertas (§96). Entra aunque sea una utilidad, al revés que `/favoritos` e `/ingresar`: explica un
  // servicio con palabras propias y responde una intención real («que me avisen cuando salga algo»).
  // `/alertas/baja` NO entra: lleva un token en la URL y es `noindex` por eso mismo.
  { ruta: '/alertas', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/turismo', prioridad: 0.7, frecuencia: 'weekly' },
  { ruta: '/invertir', prioridad: 0.7, frecuencia: 'weekly' },
  { ruta: '/journal', prioridad: 0.6, frecuencia: 'weekly' },
  { ruta: '/aliados', prioridad: 0.5, frecuencia: 'monthly' },
  // Legales: prioridad baja pero SÍ indexables — son señal de confianza y la matrícula de
  // arrendador debe ser públicamente verificable (Ley 820 art. 31).
  { ruta: '/terminos', prioridad: 0.3, frecuencia: 'yearly' },
  { ruta: '/privacidad', prioridad: 0.3, frecuencia: 'yearly' },
  { ruta: '/habeas-data', prioridad: 0.3, frecuencia: 'yearly' },
  { ruta: '/legal/politica-tratamiento-datos', prioridad: 0.3, frecuencia: 'yearly' },
];

/**
 * Landings de zona (ADR §92). Se DERIVAN de `ZONAS` para que una landing nueva entre al sitemap
 * sola: el olvido más común al añadir contenido es no meterlo al sitemap, y entonces Google tarda
 * semanas o no la descubre. ⚠️ Al añadir zonas hay que RE-ENVIAR el sitemap en GSC (§50 cutover).
 */
const RUTAS_ZONA: Entrada[] = ZONAS.map((z) => ({
  ruta: `/zona/${z.slug}`,
  prioridad: 0.7,
  frecuencia: 'monthly',
}));

/**
 * Artículos del Journal (TODO-48). Se DERIVAN de la colección por la misma razón que las zonas: el
 * olvido más común al publicar es no meter la URL en el sitemap, y entonces el artículo existe para
 * quien tenga el enlace y para nadie más. Cada uno declara su fecha real de publicación o revisión.
 */
async function rutasDelJournal(): Promise<Entrada[]> {
  const artículos = await getCollection('journal');
  return artículos.map((a) => ({
    ruta: `/journal/${a.id}`,
    prioridad: 0.6,
    frecuencia: 'yearly' as const,
    lastmod: fechaISO(a.data.actualizado ?? a.data.fecha),
  }));
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.origin ?? 'https://altorrainmobiliaria.co').replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = [...RUTAS, ...RUTAS_ZONA, ...(await rutasDelJournal())].map(
    ({ ruta, prioridad, frecuencia, lastmod: propio }) => `  <url>
    <loc>${base}${ruta}</loc>
    <lastmod>${propio ?? lastmod}</lastmod>
    <changefreq>${frecuencia}</changefreq>
    <priority>${prioridad.toFixed(1)}</priority>
  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
