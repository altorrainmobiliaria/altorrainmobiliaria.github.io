/*
 * SOLICITUD DE ESTANCIA (§122) — lo que se puede pedir y lo que se le dice a quien lo pide.
 *
 * Hoy NO es una reserva: es una solicitud. El pago protegido (Wompi custodia) es de Ola 2 y espera la
 * cuenta de comercio del dueño —lo legal ya se dictaminó (§165)—, así que aquí no se mueve un peso ni
 * se bloquea un calendario. Esa
 * diferencia no es un matiz legal: alguien que cree tener alojamiento confirmado para sus vacaciones
 * y llega a Cartagena sin nada tiene un problema serio, y lo tuvo por lo que decía nuestra pantalla.
 *
 * Este módulo es puro a propósito: las fechas son donde están los casos límite, y probarlos no debe
 * exigir un servidor. Lo usan el endpoint (que impone) y la página (que avisa antes de enviar) — una
 * regla, un dueño ([[L-45]]).
 */

import type { COP } from './shared';
import type { Precio } from './propiedades';
import { pesos } from './dinero';

/**
 * Tope de noches de una estancia. Desde 30 días ya no es hospedaje: es un arriendo, y ese es otro
 * producto y otra ley (Ley 820 de 2003).
 *
 * ⚖️ La frontera la pone la ley, no el negocio. El contrato de hospedaje es el que dura «por un plazo
 * inferior a 30 días» (Ley 300 de 1996 art. 79, modificado por la Ley 2068 de 2020 art. 21), y presta
 * servicios de vivienda turística quien arrienda «por periodos inferiores a 30 días» (Ley 1101 de 2006
 * art. 3 par. 1, modificado por la Ley 2068 art. 37). Una estancia de N noches dura N días —de la
 * llegada a la salida—, así que 29 es la última que cabe por debajo de 30. Antes valía 90, y dejaba
 * pedir como «estancia» lo que la ley llama arriendo (§330).
 */
export const NOCHES_MAX = 29;

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
 * LO QUE CUESTA UNA ESTADÍA, DESGLOSADO (§312).
 *
 * 🔴 POR QUÉ EXISTE. `Precio.precioAseo` afirmaba en su propio comentario que «se suma al total de la
 * estadía; el total se muestra desde la card», y ese total **no existía en ningún sitio**: aquí se
 * contaban las noches y nunca se multiplicaban (el comentario de `noches()` llega a hablar de «el
 * total», que tampoco existía), y `catalogo.precioDisplay` devuelve la noche pelada. La única cuenta
 * del repo vivía en literales de una página demo. Familia de [[L-87]].
 *
 * ⚖️ Y NO ES SOLO ORDEN: el Estatuto del Consumidor (Ley 1480/2011 art. 26) exige el precio TOTAL
 * desde el principio. Es la misma norma que `ficha.ts` ya cita contra el *drip pricing* del doble-precio
 * de arriendo; lo que allí es la administración, aquí es el aseo.
 *
 * 🎯 DEVUELVE EL DESGLOSE, NO UN NÚMERO. Un total sin partes es tan opaco como una noche sin total:
 * quien lo lee no puede comprobarlo ni saber qué cambia si se queda una noche menos. La doctrina de
 * transparencia de este portal es enseñar los sumandos, no solo la suma.
 *
 * ⚠️ **EL ASEO SE COBRA UNA VEZ, NO POR NOCHE.** Es lo que dice el campo y lo que hace el mercado.
 * Multiplicarlo sería inflar la cuenta justo en el cargo que más molesta al huésped.
 *
 * ⛔ **NO HAY CARGO POR SERVICIO, y su ausencia es la decisión.** La página demo cobraba al huésped un
 * `SERVICE_RATE = 0.1` que (a) no tiene campo en `Precio`, (b) contradice el tarifario SELLADO
 * (`content/tarifas.ts`: la línea de alojamiento va con `cifra: null` —«no está decidida y se dice»— y
 * la paga **el propietario**, no el huésped) y (c) el MEGA-PLAN declara pendiente «por definir con el
 * rail de pago». Un porcentaje que nadie decidió, cobrado a un consumidor, es peor que omitir el total:
 * omitir calla, esto AFIRMA. Si algún día existe, entra como campo del modelo y con el gate del dueño.
 *
 * `null` —y no un cero— cuando no hay precio por noche o las fechas no dan una estadía: un cero
 * afirmaría que es gratis.
 */
export interface DesgloseEstadia {
  noches: number;
  precioNoche: COP;
  /** `precioNoche × noches`. */
  alojamiento: COP;
  /** Una sola vez por estadía. `0` cuando no se cobra. */
  aseo: COP;
  total: COP;
}

export function desgloseEstadia(
  precio: Pick<Precio, 'precioNoche' | 'precioAseo'> | undefined,
  llegada: string,
  salida: string,
): DesgloseEstadia | null {
  const porNoche = precio?.precioNoche;
  if (typeof porNoche !== 'number' || !Number.isFinite(porNoche) || porNoche <= 0) return null;

  const n = noches(llegada, salida);
  if (n <= 0 || n > NOCHES_MAX) return null;

  const aseo = aseoDe(precio);
  const alojamiento = porNoche * n;
  return { noches: n, precioNoche: porNoche, alojamiento, aseo, total: alojamiento + aseo };
}

/**
 * El aseo que de verdad se cobra, una vez por estadía. Dueño único: lo usan el desglose y la ficha,
 * que decide con él si pinta la línea de limpieza — si cada uno lo leyera a su manera, la ficha
 * podría enseñar una línea de limpieza que el total no suma.
 *
 * Un aseo negativo o no finito se trata como ausente, no se resta: un cargo que BAJA el total es un
 * dato corrupto, y arrastrarlo publicaría una cifra menor que la que se va a cobrar.
 */
export function aseoDe(precio: Pick<Precio, 'precioAseo'> | undefined): COP {
  const bruto = precio?.precioAseo;
  return typeof bruto === 'number' && Number.isFinite(bruto) && bruto > 0 ? bruto : 0;
}

/** Una línea del desglose tal como se lee: el concepto a la izquierda y su importe a la derecha. */
export interface LineaDesglose {
  concepto: string;
  valor: string;
}

/** El desglose ESCRITO, listo para pintar. La limpieza es `null` cuando no se cobra: no hay línea en cero. */
export interface DesgloseEscrito {
  alojamiento: LineaDesglose;
  limpieza: LineaDesglose | null;
  total: string;
}

/**
 * Las líneas que ve el huésped (§329). Las escribe UN solo sitio porque las pintan DOS: el servidor
 * en el HTML de la ficha y el navegador cada vez que cambian las fechas. Con dos redacciones, la
 * página diría «3 noches» al cargar y «3 noche» al tocar un campo.
 *
 * ⛔ Sin línea de «servicio»: ver `desgloseEstadia` — no existe un cargo así y su ausencia es la
 * decisión.
 */
export function lineasDesglose(d: DesgloseEstadia): DesgloseEscrito {
  return {
    alojamiento: {
      concepto: `${pesos(d.precioNoche)} × ${d.noches} ${d.noches === 1 ? 'noche' : 'noches'}`,
      valor: pesos(d.alojamiento),
    },
    limpieza: d.aseo > 0 ? { concepto: 'Tarifa de limpieza', valor: pesos(d.aseo) } : null,
    total: pesos(d.total),
  };
}

/** `YYYY-MM-DD` + N días, contado en UTC para que un cambio de horario no se coma ni repita un día. */
export function sumarDias(dia: string, n: number): string {
  const t = Date.parse(`${dia}T00:00:00Z`);
  if (!DIA.test(dia) || !Number.isFinite(t)) return '';
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Las fechas con las que abre el panel: llegada dentro de una semana, tres noches. Son las del
 * mockup y las de /estancias, y viven aquí para que el HTML del servidor y el navegador propongan
 * la MISMA estadía — y el total que se lee al cargar sea el de las fechas que se ven.
 */
export function fechasSugeridas(hoy: string): { llegada: string; salida: string } {
  return { llegada: sumarDias(hoy, 7), salida: sumarDias(hoy, 10) };
}

/**
 * El día de HOY en Cartagena, `YYYY-MM-DD` — el único «hoy» de una estancia (§329). Lo usan el
 * endpoint (al validar la llegada), la ficha (al proponer fechas) y el navegador (mínimo del
 * calendario). Con tres relojes distintos, de 7 de la noche a medianoche el servidor —en UTC, ya
 * «mañana»— rechazaba una llegada «hoy» que la ficha dejaba elegir; y la fecha que importa es la del
 * lugar donde está el alojamiento, no la del huso de quien lo mira.
 *
 * Colombia no tiene horario de verano: UTC−5 fijo, sin depender de la base de zonas horarias del
 * runtime (Worker, navegador o Node). `ahora` se inyecta para poder probar los bordes.
 */
export function hoyEnCartagena(ahora: Date = new Date()): string {
  return new Date(ahora.getTime() - 5 * 3_600_000).toISOString().slice(0, 10);
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
    'demasiadas-noches': `Una estancia por días llega hasta ${NOCHES_MAX} noches; desde ${NOCHES_MAX + 1} ya es un arriendo: escríbenos y lo vemos.`,
    'huespedes-invalidos': `Dinos cuántas personas son (entre 1 y ${HUESPEDES_MAX}).`,
  };
  return t[p];
}

/** Lo que responde `/api/solicitud` cuando NO acepta la solicitud (400, 413 o 422). */
export interface RechazoSolicitud {
  ok?: boolean;
  reason?: string;
  mensajes?: string[];
}

/**
 * Lo que lee el visitante cuando `/api/solicitud` no acepta su solicitud de estancia (§329). Los dos
 * paneles (la ficha y /estancias) solo leían `mensajes`, que trae únicamente el rechazo por FECHAS: un
 * teléfono o un nombre rechazados salían como «No pudimos enviar la solicitud. Intenta de nuevo», y
 * reintentar con el mismo dato da el mismo 422 — un bucle sin salida. Cada `reason` del endpoint dice
 * aquí QUÉ corregir.
 */
export function explicarRechazoSolicitud(r: RechazoSolicitud | null): string {
  if (r?.mensajes?.length) return r.mensajes.join(' ');
  switch (r?.reason) {
    case 'telefono':
      return 'Revisa tu WhatsApp: escribe el número completo; puedes usar espacios, puntos, +, - o paréntesis.';
    case 'nombre':
      return 'Revisa tu nombre: escríbelo sin enlaces.';
    case 'autorizacion':
      return 'Marca la autorización de datos para poder responderte.';
    default:
      return 'No pudimos enviar la solicitud. Intenta de nuevo o escríbenos por WhatsApp.';
  }
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
