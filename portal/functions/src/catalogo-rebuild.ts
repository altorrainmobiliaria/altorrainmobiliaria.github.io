// REBUILD del índice de catálogo — plomería del camino de ESCRITURA (ADR §54/§57/§58).
// Vive SEPARADO de `index.ts` (que solo registra triggers) para poder testearlo contra el EMULADOR:
// importar `index.ts` en un test registraría Cloud Functions reales. La lógica de NEGOCIO (qué entra al
// índice y en qué orden) NO está aquí: vive en `src/lib/domain/catalogo.ts`, ya probada pura (§57).

import type { Firestore } from 'firebase-admin/firestore';
import {
  construirIndices,
  ESTADOS_PUBLICADOS,
  CATALOGO_SHARDS,
  type CatalogoShard,
  type OmitidaCatalogo,
} from '../../src/lib/domain/catalogo';
import type { Propiedad } from '../../src/lib/domain/propiedades';

/** Tope de seguridad del rebuild: alineado al tripwire de búsqueda (~2K listings, §54.4 cond.1). */
export const LIMITE_SEGURIDAD = 2000;
/** Aviso operativo cuando un shard se acerca al límite de 1 MiB por doc de Firestore (§54.4). */
export const AVISO_BYTES_SHARD = 700_000;
/** Doc de control del rebuild. Vive en `indices/` pero NO está en la allow-list de las Rules ⇒ es PRIVADO. */
export const DOC_CONTROL = 'indices/_control';

export const refShard = (shard: CatalogoShard): string => `indices/catalogo-${shard}`;

export interface ReporteRebuild {
  snapshotAt: string;
  motivo: string;
  leidas: number;
  porShard: Record<CatalogoShard, { items: number; bytes: number; escrito: boolean }>;
  omitidas: OmitidaCatalogo[];
}

/**
 * Normaliza una fecha de Firestore a ISO. Acepta `Timestamp` (lo que escribe el Admin SDK) y `string`
 * (lo que escribe el seed) — L-17: nunca asumir la forma del dato; ausente ⇒ epoch (orden determinista).
 */
export function normFecha(v: unknown): string {
  if (v && typeof (v as { toDate?: unknown }).toDate === 'function') {
    return (v as { toDate(): Date }).toDate().toISOString();
  }
  if (typeof v === 'string') return v;
  return new Date(0).toISOString();
}

/** Lee las propiedades PUBLICADAS (whitelist del dominio = la de las Rules) con tope de seguridad. */
export async function leerPublicadas(db: Firestore): Promise<Propiedad[]> {
  const snap = await db
    .collection('propiedades')
    .where('estado', 'in', [...ESTADOS_PUBLICADOS])
    .limit(LIMITE_SEGURIDAD)
    .get();

  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      ...data,
      id: (data.id as string) ?? d.id,
      createdAt: normFecha(data.createdAt),
      updatedAt: normFecha(data.updatedAt),
    } as Propiedad;
  });
}

/**
 * REBUILD TOTAL idempotente de los 3 shards (§54.4 cond.1). La query va FUERA de la transacción (leer 2K
 * docs dentro sería inviable); la transacción solo toca los 3 docs del índice + el control.
 *
 * **Guarda anti-adelantamiento**: si el doc ya tiene un `actualizado` MÁS NUEVO que este `snapshotAt`,
 * NO se escribe — así un rebuild lento que arrancó antes no pisa el resultado de uno que arrancó después
 * (el riesgo real de dos triggers concurrentes; la idempotencia sola no lo cubre porque los snapshots
 * de lectura son distintos). Con esto, el índice converge SIEMPRE al estado más reciente observado.
 */
export async function rebuildCatalogo(db: Firestore, motivo: string): Promise<ReporteRebuild> {
  const snapshotAt = new Date().toISOString();
  const propiedades = await leerPublicadas(db);
  const { indices, omitidas } = construirIndices(propiedades, snapshotAt);

  const porShard = {} as ReporteRebuild['porShard'];

  await db.runTransaction(async (tx) => {
    const refs = CATALOGO_SHARDS.map((s) => ({ shard: s, ref: db.doc(refShard(s)) }));
    const previos = await Promise.all(refs.map(({ ref }) => tx.get(ref)));

    refs.forEach(({ shard, ref }, i) => {
      const prev = previos[i];
      const prevData = prev.exists ? (prev.data() as { _version?: number; actualizado?: string }) : undefined;
      const items = indices[shard].items;
      const bytes = JSON.stringify(items).length;

      // Un rebuild MÁS NUEVO ya aterrizó → este es viejo: no pisar.
      if (prevData?.actualizado && prevData.actualizado > snapshotAt) {
        porShard[shard] = { items: items.length, bytes, escrito: false };
        return;
      }
      // set SIN merge: el doc ES el índice completo (rebuild total, no parche) — L-09.
      tx.set(ref, { _version: (prevData?._version ?? 0) + 1, items, actualizado: snapshotAt });
      porShard[shard] = { items: items.length, bytes, escrito: true };
    });

    // El DESGLOSE por motivo va al doc de control, no solo al log: es la única señal que se puede
    // mirar sin abrir Cloud Logging, y «omitidas: 5» a secas no dice si falta una foto o si los
    // documentos son del panel viejo (§103). Son 4 claves, no un doc gordo.
    tx.set(
      db.doc(DOC_CONTROL),
      {
        lastRun: snapshotAt,
        pending: false,
        motivo,
        leidas: propiedades.length,
        omitidas: omitidas.length,
        omitidasPorMotivo: contarPorMotivo(omitidas),
      },
      { merge: true },
    );
  });

  return { snapshotAt, motivo, leidas: propiedades.length, porShard, omitidas };
}

/** Cuántas omitidas por cada motivo — `{ 'esquema-legacy': 5 }` responde solo la pregunta del cutover. */
export function contarPorMotivo(omitidas: OmitidaCatalogo[]): Record<string, number> {
  return omitidas.reduce<Record<string, number>>((acc, o) => {
    acc[o.motivo] = (acc[o.motivo] ?? 0) + 1;
    return acc;
  }, {});
}

/** Líneas de log del reporte — las omitidas y el tamaño son SEÑAL operativa, no ruido (§57.2). */
export function lineasReporte(r: ReporteRebuild): string[] {
  const out = [
    `[catalogo] rebuild(${r.motivo}) · leídas=${r.leidas} · ` +
      CATALOGO_SHARDS.map((s) => `${s}=${r.porShard[s]?.items ?? 0}${r.porShard[s]?.escrito ? '' : '(omitido:adelantado)'}`).join(' · '),
  ];
  for (const s of CATALOGO_SHARDS) {
    const b = r.porShard[s]?.bytes ?? 0;
    if (b > AVISO_BYTES_SHARD) {
      out.push(`[catalogo] ⚠️ shard ${s} = ${b} bytes (> ${AVISO_BYTES_SHARD}); acercándose al límite de 1 MiB por doc`);
    }
  }
  if (r.omitidas.length) {
    const porMotivo = r.omitidas.reduce<Record<string, string[]>>((acc, o) => {
      (acc[o.motivo] ??= []).push(o.id);
      return acc;
    }, {});
    for (const [motivo, ids] of Object.entries(porMotivo)) {
      out.push(`[catalogo] ⚠️ ${ids.length} publicada(s) fuera del catálogo por "${motivo}": ${ids.slice(0, 10).join(', ')}`);
    }
  }
  return out;
}
