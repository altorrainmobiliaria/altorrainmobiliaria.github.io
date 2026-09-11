/*
 * DISPONIBILIDAD DE CORTA ESTANCIA — las noches que ocupa una estancia, y quién las bloquea.
 *
 * ┌─ POR QUÉ ESTE MÓDULO EXISTE ────────────────────────────────────────────────────────────────┐
 * El schema de `disponibilidad` se selló en Ola 0 (`propiedades.ts`) con su regla escrita al lado:
 * *«la reserva se hace SIEMPRE server-side dentro de una transacción que lee disponibilidad DENTRO
 * de la transacción (anti-overbooking)»*. Y `firestore.rules` lo remata: `allow write: if false`,
 * «la reserva es transaccional y vive en una Function».
 *
 * 🔴 Esa Function NO EXISTÍA (medido el 2026-09-10: ninguna de las 24 del portal escribe
 * `disponibilidad`). O sea un contrato sellado, con sus Rules cerradas, apuntando a un hueco: nadie
 * podía marcar una noche como ocupada por ningún camino. Y el rail de pago —que sí está construido—
 * podía completar un cobro sin que las fechas se hubieran retenido jamás.
 * └─────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * 🎯 **LA UNIDAD ES LA NOCHE, Y EL DÍA DE SALIDA NO ES UNA NOCHE.** Es la decisión entera de este
 * módulo y el sitio donde se equivoca todo el mundo, en las dos direcciones y las dos caras caro:
 *
 *   · Si la salida SE CUENTA como ocupada, dos estancias seguidas —una que se va el 13 y otra que
 *     llega el 13— chocan sin motivo. El anfitrión pierde una reserva perfectamente compatible y no
 *     se entera nunca de por qué su calendario está más vacío de lo que debería.
 *   · Si la llegada NO se cuenta, se solapan de verdad: dos personas duermen la misma noche en la
 *     misma cama. Ése es el fallo que hace que alguien llegue a Cartagena con sus vacaciones pagadas
 *     y sin dónde dormir.
 *
 * Por eso el intervalo es **semiabierto `[llegada, salida)`** y está probado por los dos extremos,
 * incluida la pareja adyacente que NO debe chocar. El vocabulario lo refleja: la función se llama
 * `nochesDeEstancia`, no `diasDeEstancia` — un nombre que diga «días» invita a incluir la salida.
 *
 * Módulo PURO a propósito: las fechas son donde viven los casos límite y probarlos no puede exigir
 * un emulador. La transacción —lo único que no se puede probar sin servidor— vive en la Function, y
 * su prueba de CARRERA es el gate de salida de Ola 2 (MEGA-PLAN §4.5, adenda Gemini).
 */
import type { Disponibilidad, EstadoDisponibilidad } from './propiedades';

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const MS_DIA = 86_400_000;

/**
 * DUEÑO ÚNICO del id de un documento de disponibilidad. Vivía escrito a mano dentro de
 * `data/client.ts`; ahora ese lector y la Function que escribe componen la clave con la MISMA
 * función. Dos formas de construir la misma clave es cómo se escribe en un sitio y se lee en otro.
 */
export const docIdDisponibilidad = (propiedadId: string, fecha: string): string => `${propiedadId}_${fecha}`;

/**
 * Las noches que OCUPA una estancia: `[llegada, salida)`. La salida NO está — quien se va el 13
 * deja la cama libre la noche del 13 (ver la cabecera; es la decisión del módulo).
 *
 * Devuelve `[]` ante cualquier entrada que no sirva —formato malo, salida antes que llegada, misma
 * fecha— en vez de lanzar: quien llama decide, y una lista vacía es imposible de confundir con una
 * reserva válida. Cero noches NO es una estancia, y `reserva.ts` ya lo rechaza con su propio motivo.
 */
export function nochesDeEstancia(llegada: string, salida: string): string[] {
  if (!DIA.test(llegada) || !DIA.test(salida)) return [];
  const a = Date.parse(`${llegada}T00:00:00Z`);
  const b = Date.parse(`${salida}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return [];

  const out: string[] = [];
  for (let t = a; t < b; t += MS_DIA) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** Una noche que impide reservar, con el motivo REAL: no es lo mismo vendida que cerrada por el anfitrión. */
export interface NocheOcupada {
  fecha: string;
  estado: Exclude<EstadoDisponibilidad, 'libre'>;
}

/**
 * ¿Cuál de estas noches NO se puede tomar?
 *
 * 🎯 **Una noche SIN documento está LIBRE.** Es el estado-cero legítimo y el caso normal: el
 * calendario no se siembra, se va escribiendo a medida que alguien reserva. Tratar la ausencia como
 * «no sé, mejor bloqueo» dejaría un inmueble nuevo imposible de reservar el día que se publica.
 *
 * Se le pasan los documentos YA LEÍDOS —no los lee él— porque en la Function tienen que leerse
 * DENTRO de la transacción: un módulo puro que fuera a buscarlos por su cuenta sería exactamente el
 * pre-chequeo fuera de la transacción que abre la ventana de doble reserva.
 *
 * `bloqueado` y `reservado` pesan igual para decidir (las dos impiden), pero viajan DISTINTAS para
 * contarlo: «esas noches ya están vendidas» y «el anfitrión cerró esas fechas» no son el mismo
 * mensaje, y quien pregunta merece el suyo.
 */
export function nochesOcupadas(
  noches: readonly string[],
  leidos: ReadonlyMap<string, Pick<Disponibilidad, 'estado'> | undefined>,
): NocheOcupada[] {
  const out: NocheOcupada[] = [];
  for (const fecha of noches) {
    const d = leidos.get(fecha);
    if (!d) continue; // sin documento = libre (estado-cero legítimo)
    if (d.estado === 'libre') continue;
    out.push({ fecha, estado: d.estado });
  }
  return out;
}

/** El choque, dicho para una persona. Nunca una lista cruda de fechas ISO sin explicar qué son. */
export function explicarOcupadas(ocupadas: readonly NocheOcupada[]): string {
  if (!ocupadas.length) return '';
  const vendidas = ocupadas.filter((o) => o.estado === 'reservado').map((o) => o.fecha);
  const cerradas = ocupadas.filter((o) => o.estado === 'bloqueado').map((o) => o.fecha);
  const partes: string[] = [];
  if (vendidas.length) {
    partes.push(`${vendidas.length === 1 ? 'La noche' : 'Las noches'} del ${vendidas.join(', ')} ya ${vendidas.length === 1 ? 'está reservada' : 'están reservadas'}`);
  }
  if (cerradas.length) {
    partes.push(`el anfitrión cerró ${cerradas.length === 1 ? 'la noche' : 'las noches'} del ${cerradas.join(', ')}`);
  }
  return `${partes.join(' y ')}.`;
}
