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
//    `firebase deploy --only functions:portal:<nombre> --project altorra-inmobiliaria-345c6` DESDE LA RAIZ.
//    ⚠️ El comando con `--config portal/firebase/firebase.json` que habia aqui NO FUNCIONA y nunca
//    funciono (§140): `source: '../functions'` se sale del directorio del proyecto.

import { onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { motivoNoContacto, explicarNoContacto } from '../../src/lib/domain/calendario-co';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DOC_CONTROL, lineasReporte, rebuildCatalogo } from './catalogo-rebuild';
import { correrDigest, lineasDigest } from './alertas-digest';
import { construirTriggerLead } from './lead-aviso';
import { construirTriggerEstado } from './solicitud-estado';

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

// La BÓVEDA del expediente (gate B5, §142). Tres puertas: reservar la ruta, confirmar contra el
// objeto REAL de Storage, y retirar dejando constancia. El archivo lo sube el navegador directo a
// Storage; lo que NO se delega al navegador es decidir dónde escribe ni cuánto pesa lo que subió.
export { confirmarDocumento, prepararDocumento, retirarDocumento } from './documentos';

// PIPELINE DE VENTA (Ola 2 · GESTIÓN v2, §151). `ventas` nace con `allow write: if false`: el
// ORDEN legal de las 7 etapas y el folio de matrícula al registrar no pueden depender de que el
// formulario se acuerde de aplicarlos.
export { crearVenta, moverVenta } from './venta-escritura';

// PREAVISO DE TERMINACION (Ola 2, ADR 233). Puerta unica: el estado `preaviso` del contrato lo
// DERIVA el servidor del veredicto de la evidencia postal, nunca lo teclea el formulario. Un
// preaviso impuesto tarde se archiva igual y el contrato NO cambia de estado: se prorroga.
export { registrarPreaviso } from './preaviso-escritura';

// La bitacora que el ruleset ya daba por hecha y nadie habia escrito (§263): cinco llamadas del
// portal apuntaban a `registrarEvento`, incluida la prueba del consentimiento de habeas data.
export { registrarEvento } from './auditoria';

// PERFIL DE INQUILINO 1→N (Ola 2, §152). Es el ÚNICO sitio del sistema donde escribe alguien de
// FUERA del equipo, así que el `uid` sale del token y jamás del cuerpo de la llamada.
export {
  confirmarSoporte,
  enviarPerfil,
  guardarPerfil,
  prepararSoporte,
  revisarPerfil,
} from './perfil-escritura';

/**
 * Clave de la API de Resend. Es un SECRETO gestionado (Secret Manager), nunca una variable de entorno
 * en claro: una clave de envío filtrada permite mandar correo firmado con nuestro dominio.
 * Se carga con `firebase functions:secrets:set RESEND_API_KEY` (lo hace el dueño → `50-CONFIG-INFRA`).
 * Sin ella el digest NO falla: aplica las bajas, no envía, y lo deja dicho en el log.
 */
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

/**
 * ⚠️ UN SECRETO QUE NADIE TIENE BLOQUEA EL CODEBASE ENTERO (§140).
 *
 * `defineSecret()` se evalúa al CARGAR el módulo, y la CLI exige que todos los parámetros del codebase
 * se puedan resolver **antes** de desplegar — aunque despliegues un subconjunto que no los usa. O sea:
 * mientras no exista `RESEND_API_KEY` en Secret Manager, no se puede desplegar NI UNA de las nueve
 * funciones de este codebase, incluidas las cinco puertas de escritura de GESTIÓN, que no tienen nada
 * que ver con el correo. El runbook pedía estrenar tres de ellas en la fase 1 y desplegarlas en la
 * fase 3, detrás del gate de Resend; el acoplamiento no estaba escrito en ningún sitio.
 *
 * La salida: el secreto EXISTE con este valor centinela, que significa «todavía no configurado». El
 * digest ya sabía qué hacer sin clave —aplicar las bajas y no enviar—, así que se traduce el centinela
 * a cadena vacía y ese camino se reutiliza tal cual. Cuando el dueño entregue la clave real, basta
 * sobreescribir el secreto: no hay que tocar código.
 */
const RESEND_SIN_CONFIGURAR = 'SIN-CONFIGURAR';
const claveResend = (): string => {
  const v = RESEND_API_KEY.value();
  return v === RESEND_SIN_CONFIGURAR ? '' : v;
};

const REGION = 'us-central1';

/**
 * COALESCENCIA de ráfagas (mejora deliberada sobre el debounce del legacy `onPropertyChange`, §58.2 — retirado en §217):
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
 * DIGEST DIARIO de alertas guardadas (§96). Una sola corrida al día por la mañana: es la hora a la
 * que se abre el correo, y concentrar el envío evita el goteo que entrena a la gente a ignorarlo.
 *
 * 🔴 A LAS 8:00 Y DE LUNES A SÁBADO, no a las 7:00 todos los días (§172). La **Ley 2300 de 2023**
 * extiende a los mensajes comerciales la ventana de la cobranza: L-V de 7:00 a 19:00, **sábados de
 * 8:00 a 15:00** y **nunca domingos ni festivos**. A las 7:00 el sábado se está fuera por una hora, y
 * el domingo se está fuera del todo. La hora se mueve una hora —coste pequeño— y se gana el sábado
 * entero de forma legal.
 *
 * ⚖️ Y sí, esto es discutible: quien se suscribió a una alerta PIDIÓ recibirla, y se puede argumentar
 * que es un servicio solicitado y no publicidad. Se elige la lectura conservadora porque el coste de
 * respetarla es una hora y dieciocho días al año, y el de equivocarse es una multa — y porque el
 * eslogan de esta marca empieza por «Legalidad».
 *
 * `retry: false` a propósito, al revés que el rebuild del catálogo: reintentar un envío de correo no
 * es idempotente y duplicaría mensajes. Lo que no salió hoy sale mañana, porque `ultimoEnvio` solo
 * avanza cuando el envío se aceptó.
 */
export const alertasDigest = onSchedule(
  {
    schedule: '0 8 * * 1-6',
    region: REGION,
    timeZone: 'America/Bogota',
    secrets: [RESEND_API_KEY],
    // El lote puede llegar a 90 correos en una sola petición a Resend; 120s da margen de sobra sin
    // dejar la Function colgada si la API no responde.
    timeoutSeconds: 120,
    retryCount: 0,
  },
  async () => {
    /*
     * El cron sabe de días de la semana y de horas, pero NO de festivos — y Colombia tiene 18 al año,
     * varios entre semana. El guardia va aquí, con el calendario del dominio (`calendario-co`), que
     * los calcula en vez de leerlos de una lista que caduca cada 31 de diciembre.
     */
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const hora = Number(
      new Date().toLocaleString('en-GB', { timeZone: 'America/Bogota', hour: '2-digit', hour12: false }),
    );
    const motivo = motivoNoContacto(hoy, hora);
    if (motivo) {
      // Se registra y se sale. Lo que no salió hoy sale mañana: `ultimoEnvio` solo avanza al enviar.
      logger.info(`[alertasDigest] no se envía (${hoy} ${hora}h): ${explicarNoContacto(motivo)}`);
      return;
    }

    const reporte = await correrDigest(db(), { apiKeyResend: claveResend() });
    for (const l of lineasDigest(reporte)) logger.info(l);
  },
);

/**
 * AVISO DE LEAD NUEVO (§188) — sustituye al camino roto de la Function legacy.
 *
 * El aviso lo mandaba `onNewSolicitud` del legacy por SMTP de Gmail con una contraseña de aplicación
 * caída: así se perdieron los 16 leads del sitio viejo, sin que nadie se enterara en 126 días. Aquí
 * sale por Resend, que ya usa el digest — y como el secreto YA EXISTE con centinela, registrar esta
 * Function no bloquea el despliegue del codebase (§140).
 *
 * Sin clave real no falla: registra que no envió y deja el lead guardado igual. Lo que NO hace es
 * llevar guardia de la Ley 2300 — este correo va a ALTORRA, no a un consumidor (ver el módulo).
 */
export const avisoLeadNuevo = construirTriggerLead(REGION, [RESEND_API_KEY], claveResend);

/*
 * AVISO AL CLIENTE cuando cambia el estado de su solicitud (ADR 235). Reemplaza a la legacy
 * `onSolicitudStatusChanged`, que lleva meses mandando por el Gmail roto: captura el error, lo
 * escribe en un log que nadie abre, y quien movio el estado cree que el cliente fue avisado.
 * Aqui va por Resend, con tipos y con pruebas.
 */
export const avisoEstadoSolicitud = construirTriggerEstado(
  REGION,
  [RESEND_API_KEY],
  claveResend,
  onDocumentUpdated,
  { info: (m) => logger.info(m), error: (m) => logger.error(m) },
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
