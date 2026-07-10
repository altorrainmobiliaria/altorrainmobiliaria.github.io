// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Stack SELLADO — ADR §16 / specs/R5-STACK-2026-07.md:
//   Cloudflare Workers (Static Assets, NO Pages) + Astro híbrido por superficie.
//
// output:'server' => render on-demand por defecto. Cada página ESTÁTICA declara
// `export const prerender = true` EXPLÍCITO. Esto materializa la mitigación del
// riesgo sellado R2/R3 ("rendering mal cableado"): el modo de cada ruta es
// explícito y verificable en CI (scripts/verify-build.mjs), nunca implícito.
export default defineConfig({
  // TRIPWIRE (ítem 4 AEO/SEO): `site` = dominio de PRODUCCIÓN. Staging sirve en *.workers.dev;
  // canonical/sitemap/og deben volverse conscientes del entorno antes de emitir URLs (no en ítem 1).
  site: 'https://altorrainmobiliaria.co',
  output: 'server',
  adapter: cloudflare({
    // Emula bindings (R2/KV/secrets de wrangler.jsonc) en `astro dev`.
    platformProxy: { enabled: true },
    // Imágenes: derivados fijos, NUNCA transform al vuelo en el edge
    // (fallo Q5 + refutación Gemini #3). 'compile' procesa en build, no en runtime.
    imageService: 'compile',
  }),
});
