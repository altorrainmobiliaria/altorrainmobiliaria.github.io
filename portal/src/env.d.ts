/// <reference types="astro/client" />
/// <reference path="../worker-configuration.d.ts" />

interface ImportMetaEnv {
  /** URL del basemap .pmtiles (default = ruta R2 `/tiles/cartagena.pmtiles`). Opcional. */
  readonly PUBLIC_PMTILES_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type CfRuntime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends CfRuntime {
    /** Capa de acceso a datos — 1 instancia POR-REQUEST (la cablea `middleware.ts`). */
    altorra: import('./lib/data/client').DataClient;
  }
}
