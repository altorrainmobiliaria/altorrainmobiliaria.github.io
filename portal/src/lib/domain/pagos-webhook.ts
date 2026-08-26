/*
 * WEBHOOK DE PAGOS — el PLAN, decidido sin tocar la base (§176).
 *
 * `wompi-evento.ts` juzga el evento (¿auténtico? ¿nuevo?) y `mandato.ts` gobierna las transiciones.
 * Falta la pieza que los une: dado un evento y el mandato como está HOY, **qué hay que escribir**.
 * Vive aquí y no en la Cloud Function por la razón de siempre en este proyecto: esto es lo que hay
 * que poder probar sin emulador, sin red y sin dinero — y es donde están las decisiones. La Function
 * queda como lo que debe ser, un ejecutor: abre transacción, aplica el plan, responde el código.
 *
 * 🔴 LAS TRES DECISIONES QUE ESTE MÓDULO ENCIERRA, y que se equivocan en silencio si no se piensan:
 *
 *   1. **Un evento tardío NO puede caminar el mandato hacia atrás.** Wompi reintenta hasta 3 veces en
 *      24 h y los eventos llegan desordenados, así que un `PENDING` puede aterrizar DESPUÉS de que el
 *      dinero ya se giró al propietario. Escribir el estado directamente lo dejaría en `esperando` —
 *      es decir, borraría del sistema que la plata ya salió. Por eso se pasa por `mover()`, que
 *      choca contra `PERMITIDAS` y rechaza el movimiento solo. Y ese rechazo **no es un error**: es
 *      el sistema funcionando, así que se anota y se responde 200.
 *
 *   2. **Referencia desconocida ⇒ 500, y NO se anota.** Es la única salida no-200 del módulo y va
 *      contra la regla general (§169: a Wompi se le responde 200 casi siempre). El motivo: si el
 *      mandato todavía no existe porque el documento se está escribiendo en este mismo instante,
 *      descartar el evento pierde un pago de verdad. Un 500 gasta un reintento y lo recupera. Lo
 *      importante es lo segundo: **si se anotara la clave, el reintento llegaría y se descartaría
 *      como duplicado** — que es justo el pago perdido que se quería evitar. Anotar y fallar es la
 *      combinación que no puede darse nunca.
 *
 *   3. **`PENDING` no mueve nada.** No existe la transición «volver a esperando»: un mandato nace
 *      esperando, así que el evento no aporta. Se anota (para no volver a mirarlo) y se responde 200.
 */

import {
  claveIdempotente,
  decidir,
  explicarVeredicto,
  referenciaDelEvento,
  transicionDesdeWompi,
  type EventoWompi,
  type Veredicto,
} from './wompi-evento';
import { mover, type Mandato } from './mandato';

/** Colecciones que toca el carril. El libro de eventos es SOLO para idempotencia. */
export const COL_EVENTOS_WOMPI = 'wompiEventos';
export const COL_MANDATOS = 'mandatos';

export interface EntradaWebhook {
  evento: EventoWompi;
  /** SHA-256 de `cadenaAFirmar`, en hex. Lo calcula quien tenga criptografía. */
  checksumCalculado: string | null;
  /** ¿Ya se procesó esta clave? Lo consulta el ejecutor DENTRO de la transacción. */
  yaVisto: boolean;
  /** El mandato tal como está ahora, o `null` si no hay documento con esa referencia. */
  mandato: Mandato | null;
  /** `YYYY-MM-DD` en Bogotá. Inyectado: el retracto no se prueba con el reloj del servidor. */
  hoy: string;
}

export interface PlanWebhook {
  veredicto: Veredicto | 'referencia-desconocida';
  /** 200 salvo la referencia desconocida, que es la única que conviene que Wompi reintente. */
  codigo: 200 | 500;
  clave: string | null;
  referencia: string | null;
  /** El mandato YA MOVIDO, listo para escribir. `null` = no se escribe ningún mandato. */
  mandatoNuevo: Mandato | null;
  /** ¿Anotar la clave en el libro de idempotencia? NUNCA junto a un código 500. */
  anotar: boolean;
  /** Para el log. Un rechazo que nadie puede auditar es un rechazo que nadie va a creer. */
  detalle: string;
}

const plan = (p: Partial<PlanWebhook> & Pick<PlanWebhook, 'veredicto' | 'detalle'>): PlanWebhook => ({
  codigo: 200,
  clave: null,
  referencia: null,
  mandatoNuevo: null,
  anotar: false,
  ...p,
});

/**
 * Qué escribir ante un evento. **No toca nada**: devuelve el plan y el ejecutor lo aplica.
 *
 * El orden de las preguntas es el de `decidir()` —primero la firma, después la idempotencia— y no se
 * reordena: apuntar en la lista antes de comprobar el carné permitiría a un atacante ocupar la clave
 * de un evento legítimo para que el de verdad se descartara como duplicado.
 */
export function planDelEvento(e: EntradaWebhook): PlanWebhook {
  const clave = claveIdempotente(e.evento);
  const recibido = e.evento.signature?.checksum ?? null;
  const yaVistas = e.yaVisto && clave ? new Set([clave]) : new Set<string>();

  const veredicto = decidir(e.evento, recibido, e.checksumCalculado, yaVistas);
  if (veredicto !== 'procesar') {
    // Ni firma inválida, ni duplicado, ni malformado escriben NADA — tampoco anotan: un evento que no
    // se pudo autenticar no tiene derecho a ocupar una clave del libro.
    return plan({ veredicto, clave, detalle: explicarVeredicto(veredicto) });
  }

  const referencia = referenciaDelEvento(e.evento);
  if (!referencia) {
    return plan({
      veredicto: 'malformado',
      clave,
      detalle: 'El evento es auténtico pero no trae `transaction.reference`: no se sabe a qué mandato aplica.',
    });
  }

  if (!e.mandato) {
    // La ÚNICA salida con 500, y a propósito sin anotar (ver decisión 2 de la cabecera).
    return plan({
      veredicto: 'referencia-desconocida',
      codigo: 500,
      clave,
      referencia,
      detalle:
        `No existe mandato con referencia «${referencia}». Se responde 500 SIN anotar la clave para ` +
        'que el reintento de Wompi lo recupere si el documento se estaba creando.',
    });
  }

  const estadoWompi = String(e.evento.data?.transaction?.['status'] ?? '');
  const transicion = transicionDesdeWompi(estadoWompi);
  if (!transicion) {
    return plan({
      veredicto: 'procesar',
      clave,
      referencia,
      anotar: true,
      detalle: `«${estadoWompi}» no pide mover el mandato (sigue en «${e.mandato.estado}»). Se anota y ya.`,
    });
  }

  const r = mover(e.mandato, transicion, e.hoy);
  if (!r.ok) {
    // Rechazo LEGÍTIMO: el evento llegó tarde o desordenado. Se anota para no re-evaluarlo y se
    // responde 200 — reintentarlo daría el mismo resultado tres veces.
    return plan({
      veredicto: 'procesar',
      clave,
      referencia,
      anotar: true,
      detalle:
        `El mandato está en «${e.mandato.estado}» y no admite «${transicion}» ` +
        `(${r.problemas.join(', ')}). Se ignora el movimiento: un evento tardío no camina hacia atrás.`,
    });
  }

  return plan({
    veredicto: 'procesar',
    clave,
    referencia,
    mandatoNuevo: r.mandato,
    anotar: true,
    detalle: `«${estadoWompi}» → «${transicion}»: el mandato pasa de «${e.mandato.estado}» a «${r.mandato.estado}».`,
  });
}

/**
 * INVARIANTE del carril, comprobable sobre cualquier plan: **nunca se anota una clave junto a un
 * código 500**. Si eso pasara, el reintento que iba a salvar el pago llegaría y se descartaría como
 * duplicado. Se expone como función para que la prueba lo recorra sobre todos los casos y para que el
 * ejecutor pueda afirmarlo antes de escribir.
 */
export function planCoherente(p: PlanWebhook): boolean {
  if (p.codigo === 500 && p.anotar) return false;
  // Y no se escribe un mandato sin dejar constancia de que el evento se procesó.
  if (p.mandatoNuevo && !p.anotar) return false;
  return true;
}
