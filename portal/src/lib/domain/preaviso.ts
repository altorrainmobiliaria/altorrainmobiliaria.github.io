/*
 * PREAVISO DE TERMINACIÓN — lo que convierte una intención en un acto que surte efecto (§187).
 *
 * §185 dictaminó que el preaviso **no puede ser 100 % digital**: los arts. 22 num. 7 y 24 de la
 * Ley 820 piden DOS cosas —que el aviso sea *escrito* **y** que vaya *«a través del servicio postal
 * autorizado»*— y la Ley 527 da equivalente funcional del escrito y de la firma, **no de un canal de
 * entrega**. De ahí salió la conclusión que este módulo materializa: *el producto no debe ENVIAR el
 * preaviso, debe INSTRUMENTARLO.*
 *
 * 🔴 EL INVARIANTE, y es el que justifica el módulo entero: **un preaviso sin evidencia postal no es
 * un preaviso.** Es una intención. Y la diferencia no es formal: si no surte efecto, el contrato se
 * PRORROGA —otro año entero— y nadie se entera hasta que el propietario quiere disponer del inmueble
 * y no puede. Por eso `efecto()` distingue explícitamente «termina» de «no termina, se prorroga» en
 * vez de devolver un booleano: el segundo caso hay que poder decirlo con todas las letras.
 *
 * ⏱️ LA TRAMPA DE FECHAS que este módulo existe para cerrar: **cuenta la fecha de IMPOSICIÓN**, no la
 * de redacción ni la de entrega. Lo que se firma un lunes y se lleva al operador el viernes, para la
 * ley se avisó el viernes. Es el error de bolsillo del negocio —«ya lo tenía escrito»— y cuesta un
 * año de prórroga.
 *
 * Puro: `hoy` se inyecta. No sabe de Firestore ni de pantallas.
 */

import type { ISODate } from './shared';
import { MESES_PREAVISO_LEY_820, sumarMeses } from './agenda';

/*
 * El plazo legal (3 meses) NO se re-escribe aquí: su dueño es `agenda.ts`, donde ya viven las reglas
 * de tiempo del contrato, y de él deriva también la alerta interna. Un segundo 3 en este archivo
 * sería el gemelo de §178 esperando a que alguien arregle uno solo.
 */

export const QUIENES_PREAVISAN = ['arrendador', 'arrendatario'] as const;
export type QuienPreavisa = (typeof QUIENES_PREAVISAN)[number];

/**
 * La prueba de que el aviso viajó por donde la ley manda. Sin esto no hay preaviso (§185).
 *
 * `operador` es el postal HABILITADO (4-72, Servientrega…), no un mensajero cualquiera: lo que aporta
 * el canal es que un tercero autorizado certifique la entrega.
 */
export interface EvidenciaPostal {
  operador: string;
  /** Número de guía: es lo que permite rastrear y, el día del pleito, probar. */
  guia: string;
  /** Cuándo se ENTREGÓ AL OPERADOR. **Ésta es la fecha que cuenta para el plazo.** */
  impuestoEl: ISODate;
  /** Cuándo llegó al destinatario, si ya consta. No mueve el plazo; refuerza la prueba. */
  entregadoEl?: ISODate;
}

export interface Preaviso {
  contratoId: string;
  quien: QuienPreavisa;
  /** Cuándo se redactó. NO es la fecha que cuenta — ver la trampa de la cabecera. */
  redactadoEl: ISODate;
  evidencia?: EvidenciaPostal;
}

/** Último día en que se puede IMPONER el preaviso para que termine el contrato en su vencimiento. */
export function fechaLimite(vigenciaFin: ISODate): ISODate {
  return sumarMeses(vigenciaFin.slice(0, 10), -MESES_PREAVISO_LEY_820);
}

export type ProblemaPreaviso =
  | 'sin-evidencia-postal'
  | 'sin-operador'
  | 'sin-guia'
  | 'sin-fecha-de-imposicion'
  | 'impuesto-tarde';

/**
 * Qué le falta a este preaviso para surtir efecto. Vacío = termina el contrato en su vencimiento.
 *
 * No lanza: devuelve razones, como el resto del dominio. Y el orden importa — primero lo que impide
 * que EXISTA el aviso (la evidencia), después lo que impide que llegue A TIEMPO.
 */
export function problemasDePreaviso(p: Preaviso, vigenciaFin: ISODate): ProblemaPreaviso[] {
  const out: ProblemaPreaviso[] = [];
  const e = p.evidencia;
  if (!e) {
    out.push('sin-evidencia-postal');
    return out;
  }
  if (!e.operador?.trim()) out.push('sin-operador');
  if (!e.guia?.trim()) out.push('sin-guia');
  if (!e.impuestoEl?.trim()) {
    out.push('sin-fecha-de-imposicion');
    return out;
  }
  // La fecha que manda es la de IMPOSICIÓN. Comparación lexicográfica: en ISO-8601 equivale a la
  // cronológica, y evita construir fechas —que es donde se cuela un desfase de zona horaria.
  if (e.impuestoEl.slice(0, 10) > fechaLimite(vigenciaFin)) out.push('impuesto-tarde');
  return out;
}

/**
 * El efecto REAL, dicho con todas las letras.
 *
 * `se-prorroga` no es «falló»: es que el contrato sigue vivo otro periodo, y quien lo lea tiene que
 * entender eso y no un error técnico. Un booleano habría dejado esa consecuencia sin nombre.
 */
export function efecto(
  p: Preaviso,
  vigenciaFin: ISODate,
): 'termina' | 'se-prorroga' | 'falta-titulo-del-arrendador' {
  if (problemasDePreaviso(p, vigenciaFin).length) return 'se-prorroga';
  /*
   * 🔴 EL CANAL NO ES EL DERECHO (§263). Esto devolvía «termina» en cuanto la constancia postal
   * estaba completa y a tiempo — para CUALQUIERA de las dos partes. Y no es simétrico:
   *
   *  · el ARRENDATARIO sí termina en el vencimiento con solo avisar, sin causal y sin pagar
   *    (Ley 820 art. 24);
   *  · el ARRENDADOR no tiene esa puerta. El art. 22 num. 7 le sirve **durante las prórrogas** y le
   *    exige **pagar tres meses de arriendo**; para terminar **al vencimiento** necesita el num. 8:
   *    causal especial (ocuparlo, demolerlo, venderlo) **y una caución de seis meses**.
   *
   * El dato para distinguirlos —`p.quien`— llevaba aquí desde el principio y nadie lo miraba, así
   * que el panel le confirmaba POR ESCRITO al propietario que su contrato terminaba. Llegaba la
   * fecha, el inquilino no se iba, y quien se lo había asegurado era ALTORRA.
   *
   * Este tercer estado NO dice «se prorroga» —el aviso es válido y el reloj corrió— sino que falta
   * el título con el que el arrendador puede exigir la restitución. Es una diferencia que el
   * propietario tiene que poder leer.
   */
  return p.quien === 'arrendador' ? 'falta-titulo-del-arrendador' : 'termina';
}

/** Lo que le falta al arrendador, dicho para quien lo va a leer y no para quien lo programó. */
export const TITULO_DEL_ARRENDADOR =
  'El aviso está bien puesto y a tiempo, pero por sí solo NO termina el contrato cuando quien avisa ' +
  'es el arrendador: la Ley 820 le pide además pagar tres meses de arriendo si termina durante las ' +
  'prórrogas (art. 22 num. 7), o invocar una causal especial —ocuparlo, demolerlo o entregarlo ' +
  'vendido— y constituir una caución de seis meses para terminar al vencimiento (num. 8). El ' +
  'arrendatario, en cambio, sí puede irse solo con el aviso (art. 24).';

/** El problema, dicho para quien está mirando la pantalla y tiene que hacer algo hoy. */
export function explicarProblemaPreaviso(m: ProblemaPreaviso): string {
  switch (m) {
    case 'sin-evidencia-postal':
      return 'No hay constancia de envío por servicio postal autorizado. Sin ella esto no es un preaviso: es una intención, y el contrato se prorroga igual (Ley 820 arts. 22.7 y 24).';
    case 'sin-operador':
      return 'Falta el operador postal. Tiene que ser uno habilitado: lo que vale es que un tercero autorizado certifique la entrega.';
    case 'sin-guia':
      return 'Falta el número de guía. Es lo que permite rastrear el envío y probarlo el día que haga falta.';
    case 'sin-fecha-de-imposicion':
      return 'Falta la fecha en que se entregó al operador. Es la fecha que cuenta para el plazo, no la de redacción.';
    case 'impuesto-tarde':
      return 'Se impuso después del límite: los 3 meses se cuentan desde que se entrega al operador. El contrato se prorroga por un periodo más.';
  }
}
