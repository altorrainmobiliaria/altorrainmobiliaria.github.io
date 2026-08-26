/*
 * LIQUIDACIÓN MENSUAL DEL MANDATO — qué se le cobra al arrendatario, qué retiene ALTORRA y cuánto
 * llega de verdad al propietario (§166).
 *
 * POR QUÉ EXISTE. `gestion.ts` ya modela `contratos` y `pagos`, e incluso tiene el tipo
 * `payout_propietario`… pero **nadie calculaba su monto**. Hoy esa cuenta se hace a mano, y es la
 * cuenta que el propietario mira cada mes: si baila un peso, lo nota. Este módulo la vuelve una
 * función pura, probada, con las reglas fiscales explícitas en vez de en la cabeza de alguien.
 *
 * 🔴 LA DECISIÓN QUE MÁS IMPORTA, y va contra lo que decía la nota del kit: **la retención del 3,5 %
 * sobre el canon NO es una constante**. Depende de quién PAGA: solo hay retención si el arrendatario
 * es agente de retención (una empresa, típicamente). El caso normal de este negocio —una familia
 * arrendando vivienda— **no retiene nada**. Codificarla como fija habría hecho que a cada propietario
 * de vivienda le apareciera un descuento del 3,5 % que nadie le practicó: dinero que no cuadra, en el
 * documento donde menos se perdona. Por eso es una BANDERA EXPLÍCITA y su valor por defecto es `false`.
 * (`D.1625/2016 art. 1.2.4.11`: en el mandato, el mandatario practica las retenciones «teniendo en
 * cuenta la calidad del mandante» — la obligación se hereda, no se inventa.)
 *
 * ⚖️ El esquema (canon-neto bajo mandato) y sus CUATRO formalidades están verificados en `43-OPERACION`:
 * facturar el canon por cuenta del mandante · facturar la comisión con IVA · certificación al
 * propietario · contabilidad separada. Este módulo produce los números de las dos primeras y de la
 * tercera; la cuarta es contable y vive fuera del código.
 *
 * ⚠️ NO decide si se puede cobrar. Eso lo gobierna §165 (dictamen del recaudo) y sus tres condiciones,
 * más las cuentas del dueño (Wompi, RNT, DIAN). Aquí solo se hace la aritmética, que no mueve un peso.
 */

import type { COP } from './shared';

/**
 * Tarifa sellada de administración de vivienda: **10 % + IVA sobre el cargo mensual integral**
 * (`docs/43-OPERACION`, tarifario 2026; publicada en `/precios`). Es el DEFAULT: cada contrato puede
 * pactar la suya en `honorariosPct`, y entonces manda la del contrato.
 */
export const HONORARIOS_ADMIN_VIVIENDA = 0.1;

/** IVA general colombiano. Parámetro, no verdad eterna: si cambia la tarifa, cambia aquí y solo aquí. */
export const IVA = 0.19;

/**
 * Retención en la fuente por arrendamiento de bien inmueble. **Solo aplica si quien paga es agente de
 * retención** — ver la nota de cabecera. Fuente: tarifario de retenciones vigente 2026.
 */
export const RETEFUENTE_ARRENDAMIENTO = 0.035;

/** Retención sobre honorarios/comisiones a persona jurídica. Solo si el PROPIETARIO es agente de retención. */
export const RETEFUENTE_HONORARIOS_PJ = 0.11;

export interface EntradaLiquidacion {
  /** Canon pactado del período. Obligatorio y > 0. */
  canon: COP;
  /** Cuota de administración de la copropiedad. Se cobra y se gira a la PH: **no es ingreso de nadie más**. */
  administracionPH?: COP;
  /** Si la cuota de PH ya está DENTRO del canon, no se suma aparte al cobrar. */
  adminIncluidaEnCanon?: boolean;
  /** Porcentaje de honorarios pactado (0..1). Sin él, la tarifa sellada. */
  honorariosPct?: number;
  /** ¿La comisión lleva IVA? Por defecto sí. */
  ivaSobreHonorarios?: boolean;
  /** ¿El ARRENDATARIO es agente de retención? Casi siempre `false` en vivienda. */
  arrendatarioEsAgenteRetencion?: boolean;
  /** ¿El PROPIETARIO es agente de retención (persona jurídica)? Entonces retiene sobre la comisión. */
  propietarioEsAgenteRetencion?: boolean;
}

export interface Liquidacion {
  /** Lo que se le factura al arrendatario en el período. */
  cobroAlArrendatario: COP;
  /** Base de los honorarios = «cargo mensual integral» (canon + cuota PH cuando aplique). */
  baseHonorarios: COP;
  honorarios: COP;
  ivaHonorarios: COP;
  /** Retenida al canon y girada a la DIAN por cuenta del propietario. 0 si no aplica. */
  retencionCanon: COP;
  /** Retenida a la comisión de ALTORRA por el propietario. 0 si no aplica. */
  retencionHonorarios: COP;
  /** Lo que se gira a la administración de la copropiedad. Ni de ALTORRA ni del propietario. */
  giroAPH: COP;
  /** Lo que le llega al propietario. Es el número que él mira. */
  giroAlPropietario: COP;
  /** Lo que le queda a ALTORRA después de la retención sobre su comisión (sin contar el IVA, que es de la DIAN). */
  netoAltorra: COP;
}

/** Al peso. En COP no hay centavos en la práctica, y arrastrar decimales es como se pierde un peso. */
const alPeso = (n: number): COP => Math.round(n);

/**
 * Calcula la liquidación de un período.
 *
 * ⚠️ **Invariante que la hace confiable, y está probado**: lo que entra es EXACTAMENTE lo que sale.
 * `cobroAlArrendatario === giroAlPropietario + honorarios + ivaHonorarios + retencionCanon + giroAPH`
 * — con la comisión ya descontada del giro. Un peso perdido al redondear es un peso que alguien tiene
 * que explicar, así que el giro al propietario se calcula por DIFERENCIA y no por su propia fórmula:
 * así el redondeo no puede abrir un hueco, solo moverlo un peso.
 */
export function liquidarPeriodo(e: EntradaLiquidacion): Liquidacion {
  const canon = alPeso(e.canon);
  const ph = alPeso(e.administracionPH ?? 0);
  const phSeCobraAparte = ph > 0 && !e.adminIncluidaEnCanon;

  const cobroAlArrendatario = canon + (phSeCobraAparte ? ph : 0);

  /*
   * El «cargo mensual integral» del tarifario es canon + cuota de PH. Si la cuota va DENTRO del canon,
   * el canon ya la contiene y sumarla otra vez cobraría honorarios dos veces sobre lo mismo.
   */
  const baseHonorarios = e.adminIncluidaEnCanon ? canon : canon + ph;

  const pct = e.honorariosPct ?? HONORARIOS_ADMIN_VIVIENDA;
  const honorarios = alPeso(baseHonorarios * pct);
  const ivaHonorarios = (e.ivaSobreHonorarios ?? true) ? alPeso(honorarios * IVA) : 0;

  const retencionCanon = e.arrendatarioEsAgenteRetencion ? alPeso(canon * RETEFUENTE_ARRENDAMIENTO) : 0;
  const retencionHonorarios = e.propietarioEsAgenteRetencion
    ? alPeso(honorarios * RETEFUENTE_HONORARIOS_PJ)
    : 0;

  /*
   * 🔴 La cuota va a la copropiedad SIEMPRE que exista, la cobre el arrendatario aparte o venga dentro
   * del canon. La primera versión de esto solo la giraba cuando se cobraba aparte, y eso dejaba al
   * propietario pagándole a la PH por su cuenta justo en el caso en que él cree tenerlo delegado —
   * la clase de detalle que se descubre cuando llega el requerimiento de la administración.
   * Es coherente con la tarifa: los honorarios se cobran sobre el «cargo mensual integral», y no se
   * cobra comisión sobre un dinero que no se maneja.
   */
  const giroAPH = ph;

  // Por DIFERENCIA, a propósito: ver el invariante de arriba.
  const giroAlPropietario =
    cobroAlArrendatario - giroAPH - honorarios - ivaHonorarios - retencionCanon;

  return {
    cobroAlArrendatario,
    baseHonorarios,
    honorarios,
    ivaHonorarios,
    retencionCanon,
    retencionHonorarios,
    giroAPH,
    giroAlPropietario,
    netoAltorra: honorarios - retencionHonorarios,
  };
}

/**
 * Lo que impide liquidar, en orden de gravedad. Mismo patrón que `problemasDeVenta`: la función NO
 * lanza — devuelve qué está mal para que la pantalla lo diga con palabras.
 */
export function problemasDeLiquidacion(e: EntradaLiquidacion): string[] {
  const p: string[] = [];
  if (!Number.isFinite(e.canon) || e.canon <= 0) p.push('canon-invalido');
  if (e.administracionPH !== undefined && (!Number.isFinite(e.administracionPH) || e.administracionPH < 0)) {
    p.push('administracion-invalida');
  }
  if (e.honorariosPct !== undefined && (!(e.honorariosPct >= 0) || e.honorariosPct > 0.5)) {
    /*
     * El tope del 50 % no es legal, es de cordura: un honorario mayor que medio canon es casi siempre
     * un porcentaje escrito como 10 en vez de 0.10 — el error de dedo que más caro sale aquí.
     */
    p.push('honorarios-fuera-de-rango');
  }
  if (e.adminIncluidaEnCanon && !e.administracionPH) p.push('admin-incluida-sin-cuota');
  return p;
}

/** Explica un problema en el idioma de quien lo lee, no en el del código. */
export function explicarProblema(codigo: string): string {
  switch (codigo) {
    case 'canon-invalido':
      return 'El canon tiene que ser un valor mayor que cero.';
    case 'administracion-invalida':
      return 'La cuota de administración no puede ser negativa.';
    case 'honorarios-fuera-de-rango':
      return 'El porcentaje de honorarios va entre 0 y 0,5. Si escribiste 10 queriendo decir 10 %, va como 0.1.';
    case 'admin-incluida-sin-cuota':
      return 'Dice que la administración va incluida en el canon, pero no hay cuota registrada.';
    default:
      return 'Hay un dato del contrato que no permite liquidar.';
  }
}
