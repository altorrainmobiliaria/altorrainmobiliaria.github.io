/*
 * CERTIFICACIÓN AL PROPIETARIO — lo que el mandante necesita para declarar (§168).
 *
 * Es la TERCERA de las cuatro formalidades del esquema canon-neto bajo mandato (`43-OPERACION`), y
 * la única que no tenía código. Las otras tres: facturar el canon por cuenta del mandante, facturar
 * la comisión con IVA, y contabilidad separada.
 *
 * ⚖️ BASE VERIFICADA, leída del texto y no de una nota. `D.1625/2016 art. 1.2.4.11`, literal:
 *   · «El mandatario practicará al momento del pago o abono en cuenta, todas las retenciones del
 *     impuesto sobre la renta, ventas, y timbre establecidas en las normas vigentes, **teniendo en
 *     cuenta para el efecto la calidad del mandante**.»
 *   · «El mandatario deberá **identificar en su contabilidad los ingresos recibidos para el mandante
 *     y los pagos y retenciones efectuadas por cuenta de este**.»
 *   · Y el mandante declara esos ingresos **«según la información que le suministre el mandatario»**
 *     — de ahí sale la obligación de entregársela, que es lo que este módulo produce.
 *
 * ⚠️ LO QUE **NO** PUDE VERIFICAR, y por eso no se afirma: la nota del kit decía que la certificación
 * va «bajo la gravedad del juramento». Busqué el texto del artículo en fuente oficial y ese inciso no
 * aparece en lo que pude leer. Puede estar en una parte del decreto que no alcancé — pero **una
 * fórmula jurídica que no se ha leído no se escribe en un documento que firma la empresa**. El
 * certificado sale sin esa fórmula; si aparece verificada, se añade. (§3.3.)
 *
 * 🔒 EL INVARIANTE, heredado de §166: los totales del certificado son EXACTAMENTE la suma de las
 * liquidaciones que lo componen. Un certificado que no cuadra con los giros del año es peor que no
 * tenerlo: le desordena la declaración a quien confía en él.
 *
 * Función pura: no lee red, no formatea moneda, no sabe de pantallas. Solo suma y comprueba.
 */

import type { COP } from './shared';
import type { Liquidacion } from './liquidacion';

/** Un mes ya liquidado, con su período. El certificado se arma con varios. */
export interface MesCertificado {
  /** `YYYY-MM`, el mismo formato que `Pago.periodo`. */
  periodo: string;
  liquidacion: Liquidacion;
}

export interface Parte {
  nombre: string;
  /** NIT o cédula. Va en el certificado porque sin él no sirve para declarar. */
  documento: string;
}

export interface Certificacion {
  mandatario: Parte;
  mandante: Parte;
  /** Períodos incluidos, ordenados. El primero y el último acotan lo certificado. */
  periodos: string[];
  desde: string;
  hasta: string;
  /** Ingresos recibidos POR CUENTA del mandante: el canon, que es su ingreso, no el nuestro. */
  ingresosRecibidos: COP;
  /** Pagos hechos por su cuenta: cuota de copropiedad + honorarios + IVA. */
  pagosPorSuCuenta: COP;
  /** Desglose de esos pagos, porque «pagos» a secas no le sirve a nadie para declarar. */
  detallePagos: { cuotaCopropiedad: COP; honorarios: COP; ivaHonorarios: COP };
  /** Retenciones practicadas por su cuenta y giradas a la DIAN. */
  retencionesPracticadas: COP;
  /** Lo efectivamente girado. */
  netoGirado: COP;
  /** Meses incluidos. Sirve para detectar un año con huecos de un vistazo. */
  meses: number;
}

/** `YYYY-MM` válido de verdad: mes entre 01 y 12, no cualquier par de dígitos. */
const PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Arma la certificación de un conjunto de meses.
 *
 * ⚠️ **Ordena por período y NO confía en el orden de entrada**: un certificado cuyo «desde» sale de
 * `meses[0]` miente en cuanto alguien pasa los meses al revés, y nadie lo notaría — las dos fechas
 * seguirían pareciendo fechas.
 */
export function certificar(mandatario: Parte, mandante: Parte, meses: MesCertificado[]): Certificacion {
  const orden = [...meses].sort((a, b) => a.periodo.localeCompare(b.periodo));
  const periodos = orden.map((m) => m.periodo);
  const sum = (f: (l: Liquidacion) => COP) => orden.reduce((t, m) => t + f(m.liquidacion), 0);

  return {
    mandatario,
    mandante,
    periodos,
    desde: periodos[0] ?? '',
    hasta: periodos[periodos.length - 1] ?? '',
    /*
     * El ingreso del propietario es el CANON. La cuota de copropiedad cobrada APARTE nunca fue suya:
     * pasó por nosotros camino de la PH, y meterla aquí le inflaría el ingreso declarado con un
     * dinero que no recibió.
     *
     * 🔴 Pero la versión anterior la restaba DOS VECES (§263): la quitaba del ingreso **y** la
     * volvía a listar como pago hecho por su cuenta. El papel no cuadraba consigo mismo —
     * `ingresos − pagos − retenciones` daba exactamente una cuota MENOS que el neto girado—, y es el
     * papel que el propietario le lleva a su contador para declarar renta.
     *
     * Y al arreglarlo aparece lo que el defecto tapaba: **los dos casos son fiscalmente distintos**.
     * Si la cuota se cobra APARTE, no es ingreso suyo ni pago suyo: es dinero de paso. Si va DENTRO
     * del canon, el canon entero sí es su ingreso y pagar la PH sí es un pago hecho por su cuenta
     * (y un gasto que puede deducir). Por eso el dominio devuelve `canon` y `phIncluidaEnCanon`:
     * deducirlo desde `cobroAlArrendatario` es imposible sin esa bandera.
     */
    ingresosRecibidos: sum((l) => l.canon),
    pagosPorSuCuenta: sum((l) => (l.phIncluidaEnCanon ? l.giroAPH : 0) + l.honorarios + l.ivaHonorarios),
    detallePagos: {
      cuotaCopropiedad: sum((l) => (l.phIncluidaEnCanon ? l.giroAPH : 0)),
      honorarios: sum((l) => l.honorarios),
      ivaHonorarios: sum((l) => l.ivaHonorarios),
    },
    retencionesPracticadas: sum((l) => l.retencionCanon),
    netoGirado: sum((l) => l.giroAlPropietario),
    meses: orden.length,
  };
}

/**
 * Lo que impide emitir un certificado. No lanza: devuelve qué está mal.
 *
 * El caso que más importa es **`periodos-repetidos`**: certificar dos veces el mismo mes duplica un
 * ingreso en la declaración de otra persona. Es el único problema de esta lista que produce un
 * documento que PARECE correcto y le hace daño a quien lo usa.
 */
export function problemasDeCertificacion(c: Certificacion): string[] {
  const p: string[] = [];
  if (!c.meses) p.push('sin-periodos');
  if (!c.mandante.documento.trim()) p.push('mandante-sin-documento');
  if (!c.mandatario.documento.trim()) p.push('mandatario-sin-documento');
  /*
   * 🔴 Comprobar que el documento NO ESTE VACIO daba falsa seguridad: el certificado salio
   * meses con `901.xxx.xxx-1` cableado, un marcador de posicion que pasaba la validacion sin
   * pestanear (§263). Y no es un informe interno: la frase impresa dice «hace constar», y el
   * D.1625/2016 art. 1.2.4.11 hace que el propietario declare SEGUN lo que el mandatario le
   * certifique. Un documento de identificacion colombiano son digitos con puntos, guiones o
   * espacios: cualquier LETRA delata un relleno.
   */
  const conLetras = (d: string) => /[a-zA-Z]/.test(d);
  if (c.mandante.documento.trim() && conLetras(c.mandante.documento)) p.push('mandante-documento-relleno');
  if (c.mandatario.documento.trim() && conLetras(c.mandatario.documento)) p.push('mandatario-documento-relleno');
  if (c.periodos.some((x) => !PERIODO.test(x))) p.push('periodo-invalido');
  if (new Set(c.periodos).size !== c.periodos.length) p.push('periodos-repetidos');
  if (c.netoGirado < 0) p.push('neto-negativo');
  return p;
}

/** Explica un problema para quien lo lee, no para quien lo programó. */
export function explicarProblemaCertificacion(codigo: string): string {
  switch (codigo) {
    case 'sin-periodos':
      return 'No hay ningún mes liquidado para certificar.';
    case 'mandante-sin-documento':
      return 'Falta el NIT o la cédula del propietario. Sin ese dato el certificado no le sirve para declarar.';
    case 'mandatario-sin-documento':
      return 'Falta el NIT de ALTORRA en el certificado.';
    case 'mandante-documento-relleno':
      return 'El documento del propietario lleva letras: parece un relleno, no una cédula o un NIT reales.';
    case 'mandatario-documento-relleno':
      return 'El NIT de ALTORRA lleva letras: es un marcador de posición, y este papel se entrega para declarar renta.';
    case 'periodo-invalido':
      return 'Hay un período que no tiene la forma AAAA-MM con un mes entre 01 y 12.';
    case 'periodos-repetidos':
      return 'Hay un mes repetido. Certificarlo dos veces le duplicaría el ingreso en la declaración.';
    case 'neto-negativo':
      return 'El neto girado sale negativo. Revisa las liquidaciones antes de emitir.';
    default:
      return 'Hay un dato que impide emitir el certificado.';
  }
}

/**
 * ¿Faltan meses entre el primero y el último? Un año con huecos no es un error —puede que el contrato
 * empezara en marzo— pero **el certificado tiene que decirlo**, porque quien lo recibe va a asumir que
 * cubre el período completo. Devuelve los períodos ausentes, en orden.
 */
export function mesesFaltantes(c: Certificacion): string[] {
  if (c.meses < 2) return [];
  const tiene = new Set(c.periodos);
  const faltan: string[] = [];
  const [a0, m0] = c.desde.split('-').map(Number);
  const [a1, m1] = c.hasta.split('-').map(Number);
  for (let a = a0, m = m0; a < a1 || (a === a1 && m <= m1); m === 12 ? ((a += 1), (m = 1)) : (m += 1)) {
    const p = `${a}-${String(m).padStart(2, '0')}`;
    if (!tiene.has(p)) faltan.push(p);
  }
  return faltan;
}
