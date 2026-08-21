import type { APIRoute } from 'astro';

/**
 * `robots.txt` CONSCIENTE DEL ENTORNO (MEGA-PLAN §OLA 1 ítem 11 · ADR §90).
 *
 * Mismo gate que `BaseLayout` y el middleware: solo un build con `PUBLIC_SITE_ENV=production`
 * abre el sitio a los rastreadores. Cualquier otro build (staging en *.workers.dev, preview local)
 * emite un `Disallow: /` total, para que el staging jamás compita con el dominio real.
 *
 * ⚠️ El fallo clásico que esto NO puede prevenir solo: llegar al cutover SIN poner la variable.
 * Entonces el portal nuevo sale con `Disallow: /` + `noindex` y Google desindexa el dominio, en
 * silencio y con el sitio viéndose perfecto. Por eso el aviso vive también en `scripts/verify-build.mjs`,
 * que lo grita en cada build, y en el checklist de cutover de `docs/50-CONFIG-INFRA`.
 *
 * Prerender: la indexabilidad es una decisión de BUILD (la env se resuelve al compilar), no de
 * request. Servirlo estático es correcto y sale del edge sin invocar el Worker.
 */
export const prerender = true;

const ES_PRODUCCION = import.meta.env.PUBLIC_SITE_ENV === 'production';

/**
 * Rastreadores de IA generativa: se ADMITEN a propósito (estrategia AEO — que ChatGPT/Perplexity/
 * Claude puedan citar a ALTORRA cuando alguien pregunta por inmuebles en Cartagena). No es un
 * descuido: es el mismo motivo por el que el sitio publica JSON-LD.
 */
const BOTS_IA = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended'];

/** Rutas internas: nunca se rastrean, ni siquiera en producción. */
const PRIVADAS = ['/gestion', '/design-system', '/api/'];

export const GET: APIRoute = ({ site }) => {
  const base = (site?.origin ?? 'https://altorrainmobiliaria.co').replace(/\/$/, '');

  const cuerpo = ES_PRODUCCION
    ? [
        '# ALTORRA Inmobiliaria — producción',
        'User-agent: *',
        'Allow: /',
        ...PRIVADAS.map((p) => `Disallow: ${p}`),
        '',
        '# Rastreadores de IA: admitidos a propósito (AEO)',
        ...BOTS_IA.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
        `Sitemap: ${base}/sitemap.xml`,
        '',
      ]
    : [
        '# STAGING — no indexable por diseño.',
        '# Si ves esto en altorrainmobiliaria.co, el build de producción salió SIN',
        '# PUBLIC_SITE_ENV=production. Es un incidente de SEO: corrígelo y redespliega.',
        'User-agent: *',
        'Disallow: /',
        '',
      ];

  return new Response(cuerpo.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
