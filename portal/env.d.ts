/// <reference types="astro/client" />

// Tipado del entorno del edge (Cloudflare Workers) para `Astro.locals`.
// Los bindings reales (R2, KV, secrets) se declaran en wrangler.jsonc y se
// tipan en `Env` vía `npm run cf-types` (genera worker-configuration.d.ts,
// gitignorado). Antes de generarlo, `astro build` no typechequea, así que no rompe.
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
