/*
 * WEBHOOK DE PAGOS — el EJECUTOR (§176). Aquí no se decide nada.
 *
 * Todo el juicio —autenticidad, idempotencia, qué transición, cuándo NO moverse— vive en
 * `src/lib/domain/pagos-webhook.ts`, que es puro y lo cubren 15 pruebas que sí corren en CI. Este
 * archivo hace lo único que el dominio no puede hacer: hablar con Firestore y con la criptografía.
 * La división no es estética: la lógica de un carril de dinero probada solo contra un emulador que el
 * CI no levanta es lógica sin red ([[L-56]]).
 *
 * 🔒 LA TRANSACCIÓN ES EL PUNTO. Anotar la clave y mover el mandato tienen que ser **atómicos**. Si
 * se anotara primero y el movimiento fallara, el reintento de Wompi llegaría, encontraría la clave y
 * se descartaría como duplicado: un pago aprobado que nunca se acredita, sin un solo error en los
 * logs. Por eso ambas escrituras van en el mismo `runTransaction`, y la idempotencia se vuelve a
 * comprobar DENTRO — la lectura de fuera es una optimización, la de dentro es la garantía.
 *
 * ⚠️ NO ESTÁ REGISTRADO EN `index.ts` TODAVÍA, y es deliberado (§140). El endpoint necesita
 * `defineSecret('WOMPI_EVENTS_SECRET')`, y `defineSecret()` se evalúa al CARGAR el módulo: la CLI
 * exige resolver TODOS los parámetros del codebase antes de desplegar cualquiera de ellos. Registrar
 * esto hoy dejaría las nueve Functions actuales —incluidas las cinco puertas de GESTIÓN— sin poder
 * desplegarse hasta que el secreto exista en Secret Manager, y el secreto solo lo puede crear Daniel.
 * Cuando exista (con centinela `SIN-CONFIGURAR`, como `RESEND_API_KEY`), el alta son cinco líneas en
 * `index.ts`: `onRequest` con `secrets: [WOMPI_EVENTS_SECRET]` llamando a `atenderEvento`.
 */

import { createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import {
  COL_EVENTOS_WOMPI,
  COL_MANDATOS,
  planCoherente,
  planDelEvento,
  type PlanWebhook,
} from '../../src/lib/domain/pagos-webhook';
import { cadenaAFirmar, type EventoWompi } from '../../src/lib/domain/wompi-evento';
import type { Mandato } from '../../src/lib/domain/mandato';

/** SHA-256 en hex. Wompi firma con SHA-256 simple y el secreto como SUFIJO — **no** es HMAC. */
export function sha256Hex(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex');
}

/** La fecha de HOY en Bogotá. El retracto se cuenta en días hábiles colombianos, no en UTC. */
export function hoyEnBogota(ahora: Date): string {
  return ahora.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export interface ResultadoWebhook {
  codigo: 200 | 500;
  plan: PlanWebhook;
}

/**
 * Atiende un evento de principio a fin. Devuelve el código que hay que responderle a Wompi.
 *
 * El `secreto` vacío (centinela `SIN-CONFIGURAR` sin traducir) haría que la firma NUNCA coincidiera y
 * todo evento legítimo se rechazara como falsificado — en silencio y con 200. Por eso se comprueba
 * antes y se responde 500: si el carril está mal configurado, que Wompi reintente y que quede ruido.
 */
export async function atenderEvento(
  db: Firestore,
  evento: EventoWompi,
  secreto: string,
  ahora: Date,
): Promise<ResultadoWebhook> {
  if (!secreto) {
    const plan: PlanWebhook = {
      veredicto: 'referencia-desconocida',
      codigo: 500,
      clave: null,
      referencia: null,
      mandatoNuevo: null,
      anotar: false,
      detalle: 'WOMPI_EVENTS_SECRET sin configurar: no se puede validar nada. Se responde 500 a propósito.',
    };
    return { codigo: 500, plan };
  }

  const cadena = cadenaAFirmar(evento, secreto);
  const checksumCalculado = cadena === null ? null : sha256Hex(cadena);
  const hoy = hoyEnBogota(ahora);

  return db.runTransaction(async (tx) => {
    // ── LECTURAS PRIMERO (Firestore lo exige, y además es el orden correcto) ──────────────────
    const clavePrevia = planDelEvento({
      evento,
      checksumCalculado,
      yaVisto: false,
      mandato: null,
      hoy,
    }).clave;

    const refEvento = clavePrevia ? db.collection(COL_EVENTOS_WOMPI).doc(clavePrevia) : null;
    const yaVisto = refEvento ? (await tx.get(refEvento)).exists : false;

    // La referencia se necesita para leer el mandato, y sale del mismo evento.
    const ref = evento.data?.transaction?.['reference'];
    const referencia = typeof ref === 'string' && ref.trim() ? ref.trim() : null;
    const refMandato = referencia ? db.collection(COL_MANDATOS).doc(referencia) : null;
    const snapMandato = refMandato ? await tx.get(refMandato) : null;
    const mandato = snapMandato?.exists ? (snapMandato.data() as Mandato) : null;

    const plan = planDelEvento({ evento, checksumCalculado, yaVisto, mandato, hoy });

    // Cinturón: el invariante del dominio se afirma ANTES de escribir. Si alguna vez se rompiera,
    // preferimos un 500 ruidoso a anotar una clave que haga desaparecer el reintento.
    if (!planCoherente(plan)) {
      return { codigo: 500 as const, plan };
    }

    // ── ESCRITURAS ────────────────────────────────────────────────────────────────────────────
    if (plan.anotar && refEvento) {
      tx.set(refEvento, {
        recibidoEl: ahora.toISOString(),
        referencia: plan.referencia,
        veredicto: plan.veredicto,
        detalle: plan.detalle,
      });
    }
    if (plan.mandatoNuevo && refMandato) {
      tx.set(refMandato, plan.mandatoNuevo, { merge: true });
    }

    return { codigo: plan.codigo, plan };
  });
}

/** Lo que se escribe en el log. Un veredicto sin rastro es un veredicto que nadie puede auditar. */
export function lineasWebhook(r: ResultadoWebhook): string[] {
  const p = r.plan;
  const salida = [`[wompi] ${p.veredicto} → HTTP ${r.codigo} · ${p.detalle}`];
  if (p.clave) salida.push(`[wompi] clave=${p.clave} referencia=${p.referencia ?? '—'} anotada=${p.anotar}`);
  if (p.mandatoNuevo) salida.push(`[wompi] mandato ${p.mandatoNuevo.id} → ${p.mandatoNuevo.estado}`);
  return salida;
}
