/*
 * SOLICITUD DE ESTANCIA (§122) — lo que se puede pedir y lo que se le dice a quien lo pide.
 *
 * Hoy NO es una reserva: es una solicitud. El pago protegido (Wompi custodia) es de Ola 2 y está
 * detrás del gate del abogado, así que aquí no se mueve un peso ni se bloquea un calendario. Esa
 * diferencia no es un matiz legal: alguien que cree tener alojamiento confirmado para sus vacaciones
 * y llega a Cartagena sin nada tiene un problema serio, y lo tuvo por lo que decía nuestra pantalla.
 *
 * Este módulo es puro a propósito: las fechas son donde están los casos límite, y probarlos no debe
 * exigir un servidor. Lo usan el endpoint (que impone) y la página (que avisa antes de enviar) — una
 * regla, un dueño ([[L-45]]).
 */

/** Tope de noches de una estancia. Más que esto es un arriendo, y ese es otro producto y otra ley. */
export const NOCHES_MAX = 90;

/** Tope de huéspedes por solicitud. Por encima es un evento, y eso se cotiza hablando. */
export const HUESPEDES_MAX = 20;

/** Con cuánta antelación como mínimo. 0 = hoy mismo vale. */
export const DIAS_MINIMOS = 0;

export type ProblemaReserva =
  | 'sin-llegada'
  | 'sin-salida'
  | 'llegada-en-pasado'
  | 'salida-antes-de-llegada'
  | 'demasiadas-noches'
  | 'huespedes-invalidos';

export interface EntradaReserva {
  llegada?: string; // YYYY-MM-DD
  salida?: string;
  huespedes?: number;
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Noches entre dos días. 0 si las fechas no sirven — nunca NaN, que se propaga y ensucia el total. */
export function noches(llegada: string, salida: string): number {
  if (!DIA.test(llegada) || !DIA.test(salida)) return 0;
  const a = Date.parse(`${llegada}T00:00:00Z`);
  const b = Date.parse(`${salida}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/**
 * Qué impide aceptar la solicitud.
 *
 * `salida-antes-de-llegada` incluye el caso de MISMO día: una estancia de cero noches no es una
 * estancia. El widget deja elegir las dos fechas por separado, así que ese estado es alcanzable con
 * dos clics y sin querer.
 */
export function problemasDeReserva(e: EntradaReserva, hoy: string): ProblemaReserva[] {
  const out: ProblemaReserva[] = [];
  const llegada = (e.llegada ?? '').slice(0, 10);
  const salida = (e.salida ?? '').slice(0, 10);

  if (!DIA.test(llegada)) out.push('sin-llegada');
  if (!DIA.test(salida)) out.push('sin-salida');

  if (DIA.test(llegada) && DIA.test(salida)) {
    if (llegada < hoy) out.push('llegada-en-pasado');
    const n = noches(llegada, salida);
    if (n <= 0) out.push('salida-antes-de-llegada');
    else if (n > NOCHES_MAX) out.push('demasiadas-noches');
  } else if (DIA.test(llegada) && llegada < hoy) {
    out.push('llegada-en-pasado');
  }

  const h = e.huespedes;
  if (!Number.isInteger(h) || (h as number) < 1 || (h as number) > HUESPEDES_MAX) {
    out.push('huespedes-invalidos');
  }
  return out;
}

export function explicarProblemaReserva(p: ProblemaReserva): string {
  const t: Record<ProblemaReserva, string> = {
    'sin-llegada': 'Falta la fecha de llegada.',
    'sin-salida': 'Falta la fecha de salida.',
    'llegada-en-pasado': 'La llegada no puede ser antes de hoy.',
    'salida-antes-de-llegada': 'La salida tiene que ser al menos un día después de la llegada.',
    'demasiadas-noches': `Para estancias de más de ${NOCHES_MAX} noches hablamos de arriendo: escríbenos y lo vemos.`,
    'huespedes-invalidos': `Dinos cuántas personas son (entre 1 y ${HUESPEDES_MAX}).`,
  };
  return t[p];
}

/**
 * La frase que verá quien lea el correo del lead.
 *
 * Se construye aquí y no en la plantilla del correo porque el correo lo manda una Cloud Function del
 * LEGACY que no se puede desplegar hasta el cutover: lo que no venga escrito en el documento, no
 * aparece. Mandar los datos crudos y confiar en que alguien los junte es cómo un lead se convierte
 * en una llamada preguntando lo que ya estaba escrito.
 */
export function resumenReserva(e: Required<EntradaReserva>): string {
  const n = noches(e.llegada, e.salida);
  const p = n === 1 ? 'noche' : 'noches';
  const h = e.huespedes === 1 ? 'huésped' : 'huéspedes';
  return `Corta estancia · ${e.llegada} → ${e.salida} (${n} ${p}) · ${e.huespedes} ${h}`;
}
