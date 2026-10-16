/// <reference types="astro/client" />
/// <reference path="../worker-configuration.d.ts" />

interface ImportMetaEnv {
  /** URL del basemap .pmtiles (default = ruta Worker `/tiles/cartagena.pmtiles`). Opcional. */
  readonly PUBLIC_PMTILES_URL?: string;
  /** Fuente del catálogo del SERP: `demo` (default, datos de muestra) | `live` (índice real §54). */
  readonly PUBLIC_CATALOGO_SOURCE?: 'demo' | 'live';
  /** Override de la URL del JSON del catálogo (pruebas con fixture; default = `/api/catalogo/{op}.json`). */
  readonly PUBLIC_CATALOGO_URL?: string;
  /** Base pública de los binarios en R2 (thumbs). Vacío ⇒ la key se usa tal cual. */
  readonly PUBLIC_MEDIA_BASE?: string;
  /** SOLO DESARROLLO: base REST del emulador de Firestore (`http://127.0.0.1:8080/v1`). Ver `FIRESTORE_DESARROLLO`. */
  readonly FIRESTORE_EMULATOR_URL?: string;
  /** SOLO DESARROLLO: host de los emuladores de Auth y Firestore para el NAVEGADOR (`127.0.0.1`). Ver `auth.ts`. */
  readonly PUBLIC_EMULADORES_PANEL?: string;
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
