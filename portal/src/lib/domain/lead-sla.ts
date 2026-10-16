/*
 * EL PLAZO DE 5 MINUTOS DE CADA LEAD (§330) — el reloj que la bandeja de `/gestion` no tenía.
 *
 * El proceso del dueño (R4, `43-OPERACION`) pide responder a cada lead en menos de 5 minutos, y la
 * Ola 1 lo pedía en el panel («leads con SLA 5-min»). Hasta aquí la bandeja enseñaba «hace 12 min»
 * y nada más: nadie podía saber qué lead se estaba pasando de plazo, ni dejar constancia de que ya
 * lo había atendido.
 *
 * Es puro a propósito: el reloj es donde están los casos límite (festivos, el cierre de las 19:00,
 * un PC con la hora mal), y probarlos no debe exigir ni un navegador ni una base de datos. No se
 * GUARDA ningún vencimiento: se calcula al pintar, así que corregir una regla corrige todos los leads.
 *
 * ⚖️ EL RELOJ SOLO CORRE EN EL HORARIO LEGAL DE CONTACTO. La Ley 2300 de 2023 prohíbe el mensaje
 * comercial fuera de lunes a viernes de 7 a 19 y sábados de 8 a 15, y nunca en domingo ni festivo
 * (`calendario-co.ts`, dueño de esas horas: aquí no se copian). Un reloj de 24 horas pintaría en oro,
 * a las once de la noche, la urgencia de un mensaje que la ley prohíbe enviar — y todo lead nocturno
 * amanecería «vencido», con lo que la cifra dejaría de significar nada. Así, un lead de las 18:58
 * gasta 2 minutos hoy y los otros 3 mañana a partir de las 7:00.
 */

import { esFestivo, motivoNoContacto, VENTANA_CONTACTO, type MotivoNoContacto } from './calendario-co';

/** El compromiso del dueño (R4): primer contacto en menos de 5 minutos. */
export const MINUTOS_SLA_LEAD = 5;

/**
 * Desde cuándo se mide. Los leads anteriores entraron cuando el panel no tenía con qué registrar el
 * contacto: ponerles «Vencido · hace 9 días» sería un veredicto sobre algo que nadie podía hacer.
 * Se pintan como antes («hace 9 días») y se pueden cerrar con el mismo botón, sin inventarles una
 * hora. Es la hora del despliegue con margen (UTC).
 */
export const SLA_LEAD_DESDE = '2026-10-16T15:45:00.000Z'; // 10:45 de Cartagena: el push + margen de despliegue

/**
 * Los estados que significan «nadie lo ha atendido todavía»: el del formulario (`pendiente`, que es
 * lo que exigen las Rules al crear) y el canónico del modelo (`nuevo`, `crm.ts`). El vacío lo
 * normaliza ya el panel a `pendiente`, pero se acepta igual.
 */
export const ESTADOS_SIN_CONTACTO: readonly string[] = ['pendiente', 'nuevo', ''];

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;
/** Colombia no tiene horario de verano: UTC−5 fijo, sin depender de la base de husos del navegador. */
const DESFASE_COLOMBIA = 5 * HORA;
/**
 * Cuántos días se recorren buscando una ventana. La racha más larga sin ninguna en Colombia es de
 * dos o tres días (domingo y lunes festivo; jueves y viernes santos): quince es holgura, y un tope
 * evita que un error de fechas convierta un repintado en un bucle.
 */
const MAX_DIAS = 15;

/**
 * Cuánto puede ir por delante del reloj del PC una hora de entrada antes de tratarla como inválida.
 * Los leads los fecha el servidor; un PC atrasado unos minutos es normal, diez ya no. Lo usa también
 * el cursor del sondeo del panel: un `createdAt` en 2099 —el `create` de las Rules es anónimo y no
 * mira la fecha— lo dejaría ciego para siempre.
 */
export const MARGEN_FUTURO_MS = 10 * 60_000;

const fechaColombia = (ms: number): string => new Date(ms - DESFASE_COLOMBIA).toISOString().slice(0, 10);
const diaSiguiente = (fecha: string): string =>
  new Date(Date.parse(`${fecha}T00:00:00Z`) + DIA).toISOString().slice(0, 10);

/**
 * El tramo de contacto permitido de una fecha de Colombia, en milisegundos UTC, o `null` si ese día
 * no se puede escribir (domingo o festivo). Las horas salen de `VENTANA_CONTACTO`.
 */
export function ventanaDelDia(fecha: string): { abre: number; cierra: number } | null {
  const base = Date.parse(`${fecha}T00:00:00Z`);
  if (!Number.isFinite(base)) return null;
  const dow = new Date(base).getUTCDay();
  if (dow === 0 || esFestivo(fecha)) return null;
  const v = dow === 6 ? VENTANA_CONTACTO.sabado : VENTANA_CONTACTO.semana;
  const medianoche = base + DESFASE_COLOMBIA;
  return { abre: medianoche + v.desde * HORA, cierra: medianoche + v.hasta * HORA };
}

/** Recorre los tramos permitidos a partir de `desde` hasta que `cb` devuelva `true`. */
function recorrerVentanas(desde: number, cb: (inicio: number, cierra: number) => boolean): boolean {
  let fecha = fechaColombia(desde);
  for (let i = 0; i < MAX_DIAS; i++) {
    const v = ventanaDelDia(fecha);
    if (v && v.cierra > desde && cb(Math.max(v.abre, desde), v.cierra)) return true;
    fecha = diaSiguiente(fecha);
  }
  return false;
}

/** ¿Se puede escribir a un cliente en este instante? */
export const enVentana = (ms: number): boolean => {
  const v = ventanaDelDia(fechaColombia(ms));
  return v !== null && ms >= v.abre && ms < v.cierra;
};

/** Por qué no se puede escribir en este instante (`null` = sí se puede), con la regla de `calendario-co`. */
export function motivoFueraDeVentana(ms: number): MotivoNoContacto | null {
  const d = new Date(ms - DESFASE_COLOMBIA);
  return motivoNoContacto(d.toISOString().slice(0, 10), d.getUTCHours());
}

/** El primer instante, desde `ms` incluido, en que se puede escribir. */
export function aperturaSiguiente(ms: number): number {
  let r = ms;
  recorrerVentanas(ms, (inicio) => ((r = inicio), true));
  return r;
}

/**
 * Cuándo vence el plazo de un lead que entró en `inicio`: los minutos se gastan SOLO dentro del
 * horario permitido. Si no encontrara ventana (no ocurre: ver `MAX_DIAS`), cae al reloj de pared en
 * vez de devolver un plazo infinito.
 */
export function vencimientoEnHorario(inicio: number, minutos = MINUTOS_SLA_LEAD): number {
  let quedan = minutos * MIN;
  let r = inicio + quedan;
  recorrerVentanas(inicio, (desde, cierra) => {
    if (quedan <= cierra - desde) {
      r = desde + quedan;
      return true;
    }
    quedan -= cierra - desde;
    return false;
  });
  return r;
}

/**
 * Milisegundos de horario permitido entre dos instantes. Pensado para tramos CORTOS —los que caben
 * antes de un vencimiento—: más allá de `MAX_DIAS` deja de sumar, y quien lo llama nunca lo necesita.
 */
export function msEnVentana(desde: number, hasta: number): number {
  if (!(hasta > desde)) return 0;
  let total = 0;
  recorrerVentanas(desde, (inicio, cierra) => {
    if (inicio >= hasta) return true;
    total += Math.min(cierra, hasta) - inicio;
    return cierra >= hasta;
  });
  return total;
}

/** Lo que el panel necesita saber de un lead para su reloj. */
export interface DatosSla {
  estado: string;
  createdAt: Date | null;
  contactadoAt: Date | null;
}

/** Por qué un lead no recibe veredicto. */
export type SinMedir = 'anterior' | 'otro-panel' | 'sin-hora';

export type SlaLead =
  /** Corre ahora: se puede escribir y quedan `restanMs` de horario. */
  | { fase: 'en-plazo'; abierto: true; restanMs: number; venceMs: number }
  /** Fuera de horario y sin vencer: el reloj espera a `reanudaMs`. */
  | { fase: 'pausa'; abierto: true; restanMs: number; venceMs: number; reanudaMs: number }
  /** Se pasó: `retrasoMs` de reloj de pared desde el vencimiento. */
  | { fase: 'vencido'; abierto: true; retrasoMs: number; venceMs: number }
  /** Ya se marcó. `tardoMs` = horario gastado hasta el clic (si fue a tiempo); `retrasoMs` = cuánto se pasó. */
  | { fase: 'contactado'; abierto: false; aTiempo: boolean; tardoMs: number; retrasoMs: number }
  /** Sin veredicto, y diciendo por qué. `abierto` = todavía nadie lo marcó. */
  | { fase: 'sin-medir'; abierto: boolean; porque: SinMedir };

/**
 * El reloj de un lead en el instante `ahora`.
 *
 * Orden de la decisión, y por qué:
 *   1. Con `contactadoAt` el reloj está PARADO. Solo hay veredicto si el lead entró ya midiéndose.
 *   2. Sin él, un estado que no es «sin contacto» (`en_gestion` del panel viejo, `cerrado`…) lo
 *      atendió alguien por otro camino que no guarda la hora: se para sin veredicto. Su `updatedAt`
 *      NO sirve de hora de contacto — es la del ÚLTIMO cambio, que puede ser una visita posterior.
 *   3. Sin hora de entrada o anterior a `desde` → abierto, sin veredicto.
 *   4. El resto: vencido, corriendo o en pausa.
 *
 * Las horas: `createdAt` la pone el servidor al guardar el lead y `contactadoAt` el servidor al
 * marcarlo; `ahora` es el reloj del PC. Si el PC va atrasado, «quedan» se topa a los 5 minutos y
 * nunca sale negativo.
 */
export function slaDeLead(l: DatosSla, ahora: number, desde = Date.parse(SLA_LEAD_DESDE)): SlaLead {
  const entro = l.createdAt?.getTime();
  const valida = typeof entro === 'number' && Number.isFinite(entro);

  if (l.contactadoAt) {
    const clic = l.contactadoAt.getTime();
    if (!valida || entro > clic + MARGEN_FUTURO_MS) return { fase: 'sin-medir', abierto: false, porque: 'sin-hora' };
    if (entro < desde) return { fase: 'sin-medir', abierto: false, porque: 'anterior' };
    const vence = vencimientoEnHorario(entro);
    const aTiempo = clic <= vence;
    return {
      fase: 'contactado',
      abierto: false,
      aTiempo,
      tardoMs: msEnVentana(entro, Math.min(clic, vence)),
      retrasoMs: aTiempo ? 0 : clic - vence,
    };
  }
  if (!ESTADOS_SIN_CONTACTO.includes(l.estado)) return { fase: 'sin-medir', abierto: false, porque: 'otro-panel' };
  // Una entrada más de 10 minutos en el futuro no la escribió ningún servidor nuestro (los dos que
  // crean leads ponen su propia hora): se trata como «sin hora» y no corre, o pintaría un «Quedan
  // 5 min» eterno arriba de la tabla y en el título de la pestaña.
  if (!valida || entro > ahora + MARGEN_FUTURO_MS) return { fase: 'sin-medir', abierto: true, porque: 'sin-hora' };
  if (entro < desde) return { fase: 'sin-medir', abierto: true, porque: 'anterior' };

  const vence = vencimientoEnHorario(entro);
  if (ahora >= vence) return { fase: 'vencido', abierto: true, retrasoMs: ahora - vence, venceMs: vence };
  const restanMs = Math.min(MINUTOS_SLA_LEAD * MIN, msEnVentana(Math.max(ahora, entro), vence));
  if (enVentana(ahora)) return { fase: 'en-plazo', abierto: true, restanMs, venceMs: vence };
  return { fase: 'pausa', abierto: true, restanMs, venceMs: vence, reanudaMs: aperturaSiguiente(ahora) };
}

/** Lo que cuenta el tablero. */
export interface ResumenSla {
  /** Nadie lo ha marcado todavía, se mida o no. */
  sinContactar: number;
  /** Medidos y a tiempo de cumplir (corriendo o en pausa). */
  enPlazo: number;
  /** Medidos y ya fuera de plazo. */
  vencidos: number;
}

export function resumenSla(leads: readonly DatosSla[], ahora: number, desde?: number): ResumenSla {
  const r: ResumenSla = { sinContactar: 0, enPlazo: 0, vencidos: 0 };
  for (const l of leads) {
    const s = slaDeLead(l, ahora, desde);
    if (!s.abierto) continue;
    r.sinContactar += 1;
    if (s.fase === 'vencido') r.vencidos += 1;
    else if (s.fase === 'en-plazo' || s.fase === 'pausa') r.enPlazo += 1;
  }
  return r;
}

/* ── Cómo se dice, en cristiano ────────────────────────────────────────────────────────────── */

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const dosCifras = (n: number): string => String(n).padStart(2, '0');

/** «10:42», hora de Colombia. */
export function horaColombia(ms: number): string {
  const d = new Date(ms - DESFASE_COLOMBIA);
  return `${d.getUTCHours()}:${dosCifras(d.getUTCMinutes())}`;
}

/** «16 oct, 10:42», hora de Colombia. */
export function fechaHoraColombia(ms: number): string {
  const d = new Date(ms - DESFASE_COLOMBIA);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}, ${horaColombia(ms)}`;
}

/** «hoy a las 7:00» · «mañana a las 7:00» · «el lunes 19 a las 8:00». */
export function cuandoColombia(ms: number, ahora: number): string {
  const f = fechaColombia(ms);
  const hora = `a las ${horaColombia(ms)}`;
  if (f === fechaColombia(ahora)) return `hoy ${hora}`;
  if (f === diaSiguiente(fechaColombia(ahora))) return `mañana ${hora}`;
  const d = new Date(ms - DESFASE_COLOMBIA);
  return `el ${DIAS_SEMANA[d.getUTCDay()]} ${d.getUTCDate()} ${hora}`;
}

/** Lo que queda: se redondea hacia ABAJO, para no prometer un minuto que no hay. */
export function textoQuedan(ms: number): string {
  const m = Math.floor(ms / MIN);
  if (m >= 2) return `quedan ${m} min`;
  if (m === 1) return 'queda 1 min';
  return 'menos de 1 min';
}

/** Un retraso o una espera: se redondea en CONTRA nuestra (un retraso de 20 s ya es «1 min»). */
export function textoDuracion(ms: number): string {
  // Horas y días salen del minuto YA redondeado: sacarlos de los milisegundos crudos daba «0 h»
  // entre los 59 y los 60 minutos (59:30 → 60 min → no es «< 60» → 0 h).
  const m = Math.max(1, Math.ceil(ms / MIN));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1 día' : `${d} días`;
}

/** Lo que tardó un contacto A TIEMPO: como mucho son 5 minutos, así que no hacen falta horas. */
const textoTardo = (ms: number): string => (ms < MIN ? 'menos de 1 min' : `${Math.ceil(ms / MIN)} min`);

/** Lo que pinta la celda del plazo. `texto: null` = sin veredicto (la celda dice «hace X», como antes). */
export interface VistaSla {
  texto: string | null;
  /** Oro solo si hay que actuar Y se puede actuar ahora: fuera de horario nada empuja a escribir. */
  tono: 'gold' | 'navy';
  titulo: string;
}

const MAYUS = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function vistaSla(s: SlaLead, ahora: number, contactadoAt: Date | null = null): VistaSla {
  const actuable = enVentana(ahora);
  switch (s.fase) {
    case 'en-plazo':
      return {
        texto: MAYUS(textoQuedan(s.restanMs)),
        tono: actuable ? 'gold' : 'navy',
        titulo: `El primer contacto se pide en menos de ${MINUTOS_SLA_LEAD} minutos, contados dentro del horario permitido de contacto.`,
      };
    case 'pausa':
      return {
        // Corto a propósito: «En pausa · quedan 3 min» medía 150 px y no cabía en la columna.
        texto: s.restanMs >= MIN ? `En pausa · ${Math.floor(s.restanMs / MIN)} min` : 'En pausa · <1 min',
        tono: 'navy',
        titulo: `Fuera del horario permitido de contacto (Ley 2300 de 2023). ${MAYUS(textoQuedan(s.restanMs))} del plazo, que sigue ${cuandoColombia(s.reanudaMs, ahora)}.`,
      };
    case 'vencido':
      return {
        texto: `Vencido · +${textoDuracion(s.retrasoMs)}`,
        tono: actuable ? 'gold' : 'navy',
        titulo: `Se pasó ${textoDuracion(s.retrasoMs)} del plazo de ${MINUTOS_SLA_LEAD} minutos.`,
      };
    case 'contactado': {
      const cuando = contactadoAt ? `Marcado como contactado el ${fechaHoraColombia(contactadoAt.getTime())} (hora de Colombia). ` : '';
      return {
        texto: s.aTiempo ? `A tiempo · ${textoTardo(s.tardoMs)}` : `Tarde · +${textoDuracion(s.retrasoMs)}`,
        tono: 'navy',
        titulo: `${cuando}Se mide hasta el clic en «Marcar contactado», no hasta el mensaje.`,
      };
    }
    default:
      return {
        texto: null,
        tono: 'navy',
        titulo:
          s.porque === 'anterior'
            ? `Entró antes de que el panel midiera el plazo de ${MINUTOS_SLA_LEAD} minutos.`
            : s.porque === 'otro-panel'
              ? 'Se atendió en el panel anterior, que no guarda la hora del contacto.'
              : `Este lead no trae hora de entrada: su plazo no se puede medir.`,
      };
  }
}

/** Una línea para el CSV: el mismo veredicto, sin adornos. */
export function textoCsvSla(s: SlaLead): string {
  switch (s.fase) {
    case 'en-plazo':
      return 'En plazo';
    case 'pausa':
      return 'En pausa (fuera de horario)';
    case 'vencido':
      return `Vencido (+${textoDuracion(s.retrasoMs)})`;
    case 'contactado':
      return s.aTiempo ? `A tiempo (${textoTardo(s.tardoMs)})` : `Tarde (+${textoDuracion(s.retrasoMs)})`;
    default:
      return 'Sin medir';
  }
}
