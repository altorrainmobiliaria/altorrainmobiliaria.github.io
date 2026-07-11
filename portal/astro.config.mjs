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
    // Bindings (R2/KV de wrangler.jsonc) se emulan AUTOMÁTICAMENTE en `astro dev`: el adapter v14 se
    // construye sobre el Cloudflare Vite plugin, que corre el dev server dentro de workerd REAL (ya no
    // un proxy → por eso `platformProxy` se removió del tipo `Options`, L-19). Bindings remotos = opt-in
    // por-binding con `"remote": true` en wrangler.jsonc (no lo usamos: locales en dev).
    // Imágenes: derivados fijos, NUNCA transform al vuelo en el edge
    // (fallo Q5 + refutación Gemini #3). 'compile' procesa en build, no en runtime.
    imageService: 'compile',
  }),
});
