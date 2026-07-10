// Cliente de datos — SKELETON (frontera arquitectónica).
//
// La implementación real es Ola 0 ítem 7 (modelo de datos v1). El MECANISMO de acceso
// desde el edge (REST de Firestore vs. Cloud Function vs. client SDK) es una decisión de
// diseño de ese ítem — `firebase-admin` NO corre en Workers — y NO se prejuzga aquí
// (protocolo interino R6: las decisiones fuertes se diseñan, no se ejecutan a la ligera).
//
// Este archivo existe para que la frontera "todo dato pasa por src/lib/data" sea real en
// código desde el día 1, no solo una convención escrita.

export type DataClient = {
  readonly ready: boolean;
};

export function getDataClient(): DataClient {
  throw new Error(
    '[portal] Capa de acceso a datos no implementada — pendiente de Ola 0 ítem 7 (modelo de datos v1).',
  );
}
