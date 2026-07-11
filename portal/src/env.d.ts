/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Capa de acceso a datos — 1 instancia POR-REQUEST (la cablea `middleware.ts`). */
    altorra: import('./lib/data/client').DataClient;
  }
}
