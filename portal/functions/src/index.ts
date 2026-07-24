// Cloud Functions del PORTAL — codebase `portal`, AISLADO del legacy (ADR §58).
// Único trabajo hoy: mantener el índice de catálogo `indices/catalogo-{shard}` (decisión §54).
// La lógica del índice vive en `src/lib/domain/catalogo.ts` (pura, §57) y la plomería en
// `catalogo-rebuild.ts` (testeable contra el emulador). Aquí SOLO se registran los triggers.
//
// ⚠️ DEPLOY = COORDINADO con el cutover (TODO-17): comparte proyecto Firebase con el legacy.
//    `firebase deploy --only functions:portal --config portal/firebase/firebase.json`

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DOC_CONTROL, lineasReporte, rebuildCatalogo } from './catalogo-rebuild';

const REGION = 'us-central1';

/**
 * COALESCENCIA de ráfagas (mejora deliberada sobre el debounce del legacy `onPropertyChange`, §58.2):
 * el debounce clásico DESCARTA la última edición si nadie más edita después. Aquí una edición dentro de
 * la ventana no se pierde: marca `pending` y el barrido (cada 5 min) la ejecuta. Resultado: edición
 * normal = instantánea; import masivo = 1 rebuild por ventana + 1 de cola; NADA queda sin reflejar.
 */
const VENTANA_MS = 60_000;
/** Reconciliación de respaldo: si no hubo rebuild en 24h, el barrido lo fuerza igual (auto-curación). */
const RECONCILIAR_MS = 24 * 60 * 60 * 1000;

if (getApps().length === 0) initializeApp();
const db = () => getFirestore();

async function estadoControl(): Promise<{ lastRunMs: number; pending: boolean }> {
  const snap = await db().doc(DOC_CONTROL).get();
  const data = snap.exists ? (snap.data() as { lastRun?: string; pending?: boolean }) : undefined;
  const ms = data?.lastRun ? Date.parse(data.lastRun) : NaN;
  return { lastRunMs: Number.isFinite(ms) ? ms : 0, pending: data?.pending === true };
}

async function rebuildYLoguear(motivo: string): Promise<void> {
  const reporte = await rebuildCatalogo(db(), motivo);
  for (const l of lineasReporte(reporte)) logger.info(l);
}

/**
 * Cualquier escritura en `propiedades` reconstruye el índice. `retry: true` es SEGURO porque el rebuild
 * es idempotente y converge (§57.2) — así un fallo transitorio no deja el índice desfasado.
 */
export const catalogoOnPropiedadWrite = onDocumentWritten(
  { document: 'propiedades/{propId}', region: REGION, retry: true },
  async () => {
    const { lastRunMs } = await estadoControl();
    if (lastRunMs && Date.now() - lastRunMs < VENTANA_MS) {
      // Dentro de la ventana: NO se descarta — se encola para el barrido (anti-pérdida).
      await db().doc(DOC_CONTROL).set({ pending: true }, { merge: true });
      logger.info('[catalogo] en ventana de coalescencia → encolado (pending=true)');
      return;
    }
    await rebuildYLoguear('onWrite');
  },
);

/**
 * Barrido: ejecuta la cola de la coalescencia y hace de RECONCILIADOR de respaldo (§54.4 cond.5).
 * Un solo job de Cloud Scheduler cubre ambos roles (el free tier de Scheduler es escaso — 3 jobs).
 */
export const catalogoBarrido = onSchedule(
  { schedule: 'every 5 minutes', region: REGION, timeZone: 'America/Bogota' },
  async () => {
    const { lastRunMs, pending } = await estadoControl();
    const vencido = !lastRunMs || Date.now() - lastRunMs > RECONCILIAR_MS;
    if (!pending && !vencido) return;
    await rebuildYLoguear(pending ? 'barrido-pendiente' : 'reconciliacion');
  },
);

/**
 * "Republicar catálogo" — palanca HUMANA de cero conocimiento técnico para el panel `gestion`
 * (§54.4 cond.5): si algo se ve raro, un botón lo reconstruye desde el estado real.
 */
export const catalogoRepublicar = onCall({ region: REGION }, async (request) => {
  if (request.auth?.token?.admin !== true) {
    throw new HttpsError('permission-denied', 'Solo el staff puede republicar el catálogo.');
  }
  const reporte = await rebuildCatalogo(db(), 'republicar-manual');
  for (const l of lineasReporte(reporte)) logger.info(l);
  return {
    ok: true,
    actualizado: reporte.snapshotAt,
    publicadas: reporte.leidas,
    omitidas: reporte.omitidas,
  };
});
