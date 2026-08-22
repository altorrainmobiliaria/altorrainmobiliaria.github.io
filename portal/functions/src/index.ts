// Cloud Functions del PORTAL — codebase `portal`, AISLADO del legacy (ADR §58).
// Dos trabajos: mantener el índice de catálogo `indices/catalogo-{shard}` (decisión §54) y mandar el
// digest diario de alertas guardadas (§96). La lógica de negocio vive en `src/lib/domain/*` (pura) y
// la plomería en `catalogo-rebuild.ts` y `alertas-digest.ts` (testeables). Aquí SOLO se registran los
// triggers.
//
// ⚠️ CLOUD SCHEDULER: el free tier son 3 jobs. Aquí se consumen 2 (`catalogoBarrido` y
//    `alertasDigest`). Queda UNO. El siguiente cron que se añada debe entrar en un job existente.
//
// ⚠️ DEPLOY = COORDINADO con el cutover (TODO-17): comparte proyecto Firebase con el legacy.
//    `firebase deploy --only functions:portal --config portal/firebase/firebase.json`

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DOC_CONTROL, lineasReporte, rebuildCatalogo } from './catalogo-rebuild';
import { correrDigest, lineasDigest } from './alertas-digest';

// Escrituras de GESTION: la UNICA puerta a `contratos` (y pronto expedientes/pagos/novedades),
// que nacen con `allow write: if false` por decision de §100. Re-exportado para que quede
// registrado como Function del codebase `portal`.
export {
  actualizarNovedad,
  crearContrato,
  crearExpediente,
  crearNovedad,
  registrarPago,
} from './gestion-escritura';

/**
 * Clave de la API de Resend. Es un SECRETO gestionado (Secret Manager), nunca una variable de entorno
 * en claro: una clave de envío filtrada permite mandar correo firmado con nuestro dominio.
 * Se carga con `firebase functions:secrets:set RESEND_API_KEY` (lo hace el dueño → `50-CONFIG-INFRA`).
 * Sin ella el digest NO falla: aplica las bajas, no envía, y lo deja dicho en el log.
 */
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

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
 * DIGEST DIARIO de alertas guardadas (§96). Una sola corrida al día, a las 7:00 de Cartagena: es la
 * hora a la que se abre el correo, y concentrar el envío evita el goteo que entrena a la gente a
 * ignorarlo.
 *
 * `retry: false` a propósito, al revés que el rebuild del catálogo: reintentar un envío de correo no
 * es idempotente y duplicaría mensajes. Lo que no salió hoy sale mañana, porque `ultimoEnvio` solo
 * avanza cuando el envío se aceptó.
 */
export const alertasDigest = onSchedule(
  {
    schedule: '0 7 * * *',
    region: REGION,
    timeZone: 'America/Bogota',
    secrets: [RESEND_API_KEY],
    // El lote puede llegar a 90 correos en una sola petición a Resend; 120s da margen de sobra sin
    // dejar la Function colgada si la API no responde.
    timeoutSeconds: 120,
    retryCount: 0,
  },
  async () => {
    const reporte = await correrDigest(db(), { apiKeyResend: RESEND_API_KEY.value() });
    for (const l of lineasDigest(reporte)) logger.info(l);
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
