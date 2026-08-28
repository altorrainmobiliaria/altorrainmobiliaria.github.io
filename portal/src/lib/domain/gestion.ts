// Módulo GESTIÓN (back-office de administración de arriendos). Las 4 entidades nacen en el día 1
// (mandato del dueño: modelar tarde = remodelar caro). Sus features aterrizan en Ola 1.13 (v1),
// Ola 2.0 (v2: cobro Wompi) y Ola 3 (v3: portales propietario/inquilino) — el schema prevé los 3 niveles.
import type { ISODate, COP, Vertical, Versioned, Auditable } from './shared';
import type { TipoGarantia } from './propiedades';

/** Acta de entrega por espacios (FORMATO INVENTARIO): estado Bueno/Regular/Malo, entrega vs recibo. */
export type EstadoBRM = 'B' | 'R' | 'M';
export interface ItemInventario {
  espacio: string; // "Cocina", "Habitación 1", ...
  elemento?: string;
  estadoEntrega?: EstadoBRM;
  estadoRecibo?: EstadoBRM;
  observacion?: string;
}

/**
 * `expedientes` — agregado RAÍZ (1 por inmueble administrado). Enlaza `contratos`/`pagos`/`novedades`
 * por FK (`expedienteId`), no por subcolección → permite queries cross-expediente (vencimiento/mora).
 * `estado` = "Estado-arriendo" del Excel del dueño.
 */
export const ESTADOS_EXPEDIENTE = ['activo', 'preaviso', 'finalizado'] as const;
export type EstadoExpediente = (typeof ESTADOS_EXPEDIENTE)[number];

export interface Expediente extends Versioned, Auditable {
  id: string;
  propiedadId?: string; // si el inmueble también vive en el catálogo público
  codigoLegacy?: string; // ALT-AR-*
  estado: EstadoExpediente;
  inventario?: ItemInventario[]; // acta de entrega
  notas?: string;
}

/** `contratos` — administración y arriendo (top-level con `expedienteId`). */
export const TIPOS_CONTRATO = ['administracion', 'arriendo'] as const;
export type TipoContrato = (typeof TIPOS_CONTRATO)[number];

export const ESTADOS_CONTRATO = ['vigente', 'en_renovacion', 'preaviso', 'terminado'] as const;
export type EstadoContrato = (typeof ESTADOS_CONTRATO)[number];

export interface ParteContrato {
  nombre: string;
  documento?: string;
  contacto?: string;
}

export interface Contrato extends Versioned, Auditable {
  id: string;
  expedienteId: string;
  tipo: TipoContrato;
  vertical: Vertical; // legal-by-design: hace ejecutable el gate OD9 server-side (garantía vs vivienda)
  estado: EstadoContrato;
  partes: { propietario?: ParteContrato; arrendatario?: ParteContrato; codeudor?: ParteContrato };
  canon?: COP;
  /**
   * Administración PACTADA en el contrato. Distinta de `Precio.administracion` del inmueble, que es la
   * cifra del ANUNCIO: aquí está la que de verdad se firmó, y es la que se cobra y se concilia.
   * Va SEPARADA del canon por doctrina (nada de cuotas escondidas) aunque se cobren juntos.
   */
  administracion?: COP;
  /** Si va dentro del canon, no se suma aparte al cobrarle al arrendatario. */
  adminIncluidaEnCanon?: boolean;
  diaPago?: number; // 1..28
  /**
   * Honorarios de administración en **PORCENTAJE, 0-100** — `10` significa 10 %, no 1000 %.
   *
   * ⚠️ La unidad se declara aquí porque los dos extremos de este campo la entendieron distinto y
   * costaba dinero: el formulario pide «Honorarios %» con marcador `10`, este validador acepta
   * hasta 100, y `liquidacion.ts` espera una **fracción** (rechaza cualquier cosa > 0.5, y su
   * propio comentario llama a esto «el error de dedo que más caro sale aquí»). Resultado: un
   * contrato normal del 10 % no se podía liquidar. La conversión ocurre UNA vez, al construir la
   * `EntradaLiquidacion`, y en ningún otro sitio.
   */
  honorariosPct?: number;
  ivaSobreHonorarios?: boolean;
  vigenciaInicio: ISODate;
  vigenciaFin: ISODate; // alerta de renovación a 4 meses (preaviso legal 3 — Ley 820), derivada de aquí
  renovacionAutomatica: boolean;
  incrementoIPC?: boolean;
  /** Garantía — en VIVIENDA NUNCA depósito en dinero (OD9 / art. 16 Ley 820). La CF de creación de
   *  contrato valida `garantia` contra `vertical` (rechaza cualquier depósito si vertical === 'vivienda'). */
  garantia?: { tipo: TipoGarantia; detalle?: string };
  docs?: string[]; // adjuntos en Storage privado (B5)
  /**
   * El preaviso de terminación, con su evidencia postal (§187 · `domain/preaviso.ts`).
   *
   * ⚠️ VIVE AQUÍ, en el contrato, y no en una colección aparte, porque su efecto depende de
   * `vigenciaFin`: separarlos permitiría que existiera un preaviso cuya fecha límite nadie puede
   * calcular. Y por eso mismo `estado: 'preaviso'` NO se teclea: lo pone el servidor **solo cuando
   * la evidencia surte efecto**. Un preaviso impuesto tarde se guarda igual —pasó— pero el contrato
   * sigue `vigente` y se prorroga, que es lo que de verdad ocurrió.
   */
  preaviso?: PreavisoRegistrado;
}

/** Lo que queda archivado cuando alguien registra un preaviso, con quién y cuándo lo hizo. */
export interface PreavisoRegistrado {
  quien: 'arrendador' | 'arrendatario';
  redactadoEl: ISODate;
  operador: string;
  guia: string;
  /** La fecha que DECIDE: cuándo se entregó al operador postal, no cuándo se redactó. */
  impuestoEl: ISODate;
  entregadoEl?: ISODate;
  /** Veredicto calculado por el servidor al registrar, congelado para no recalcularlo distinto. */
  /**
   * `falta-titulo-del-arrendador` (§263): el aviso es VÁLIDO y llegó a tiempo, pero cuando quien
   * avisa es el arrendador eso por sí solo no termina el contrato — le falta la indemnización de
   * tres meses (art. 22 num. 7) o la causal especial con caución de seis (num. 8).
   */
  efecto: 'termina' | 'se-prorroga' | 'falta-titulo-del-arrendador';
  /** Id del documento de la bóveda con el escaneo de la constancia, si ya se subió. */
  constanciaDocId?: string;
  registradoEn: ISODate;
  registradoPor: string;
}

/** `pagos` — un doc por período × contrato × tipo (OD6). docId determinista incluye `tipo`. Mora en `config/gestion`. */
export const TIPOS_PAGO = ['canon_inquilino', 'payout_propietario', 'honorarios', 'servicios_publicos'] as const;
export type TipoPago = (typeof TIPOS_PAGO)[number];

export const ESTADOS_PAGO = ['pendiente', 'al_dia', 'parcial', 'mora'] as const;
export type EstadoPago = (typeof ESTADOS_PAGO)[number];

export interface Pago extends Versioned, Auditable {
  id: string;
  expedienteId: string;
  contratoId: string;
  periodo: string; // YYYY-MM
  tipo: TipoPago;
  montoEsperado: COP;
  montoRecibido?: COP;
  fechaVencimiento: ISODate;
  fechaPago?: ISODate;
  estado: EstadoPago;
  diasMora?: number;
  moraTier?: number; // según escalones de config/gestion (default PRO día 5/10/15/30/45)
  // En Ola 2 este mismo doc absorbe la conciliación Wompi (registro manual en v1).
}

/** `novedades` — tickets inquilino/propietario (posventa, PQRS ≤ 48h). */
export const ESTADOS_NOVEDAD = ['PENDIENTE', 'EN CURSO', 'HECHO', 'CERRADO'] as const;
export type EstadoNovedad = (typeof ESTADOS_NOVEDAD)[number];

export interface Novedad extends Versioned, Auditable {
  id: string;
  expedienteId: string;
  reportadoPor: 'inquilino' | 'propietario' | 'admin';
  tipo: string; // "reparación" | "queja" | "solicitud" | ...
  descripcion: string;
  estado: EstadoNovedad;
  slaVencimiento?: ISODate; // PQRS ≤ 48h
  resolucion?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANTES DEL CONTRATO (§113) — el modelo es el dueño de lo que lo hace válido
// ─────────────────────────────────────────────────────────────────────────────

export type ProblemaContrato =
  | 'sin-expediente'
  | 'sin-partes'
  | 'sin-vigencia'
  | 'vigencia-invertida'
  | 'sin-canon'
  | 'dia-pago-invalido'
  | 'honorarios-invalidos'
  | 'deposito-en-vivienda';

/**
 * ¿Qué le impide a este contrato ser válido?
 *
 * Vive en el MODELO y no en la Cloud Function que lo va a usar, por la razón de siempre en este
 * proyecto: la validación tiene que poder correrse también en el formulario, y dos copias de una regla
 * divergen ([[L-45]]). La Function es quien la IMPONE —es la única que puede, porque estas colecciones
 * nacen con `allow write: if false`— pero la regla es del modelo.
 *
 * 🔴 EL GATE QUE NO ES DE DATOS: **en vivienda urbana el depósito en dinero está PROHIBIDO** (art. 16
 * de la Ley 820, y arts. 15 y 18 lo cierran para las formas indirectas y «con otro nombre»). Cobrarlo
 * expone a multa de hasta 100 SMLMV y pone en riesgo la propia matrícula de arrendador. El tipo de
 * garantía ya se llama `deposito_no_vivienda` para que nadie pueda decir que no lo sabía; esto lo hace
 * ejecutable. En arriendo COMERCIAL sí es válido, y por eso el gate mira la `vertical` y no el tipo.
 */
export function problemasDeContrato(c: Partial<Contrato>): ProblemaContrato[] {
  const out: ProblemaContrato[] = [];
  if (!c.expedienteId?.trim()) out.push('sin-expediente');

  const partes = c.partes ?? {};
  const alguien = [partes.propietario, partes.arrendatario, partes.codeudor].some((p) => p?.nombre?.trim());
  if (!alguien) out.push('sin-partes');

  const ini = (c.vigenciaInicio ?? '').slice(0, 10);
  const fin = (c.vigenciaFin ?? '').slice(0, 10);
  if (!ini || !fin) out.push('sin-vigencia');
  else if (fin <= ini) out.push('vigencia-invertida');

  if (c.tipo === 'arriendo') {
    if (!c.canon || c.canon <= 0) out.push('sin-canon');
    // 1..28 y no 1..31: febrero. El modelo ya lo dice; aquí se impone.
    if (c.diaPago != null && (!Number.isInteger(c.diaPago) || c.diaPago < 1 || c.diaPago > 28)) {
      out.push('dia-pago-invalido');
    }
  }

  if (c.honorariosPct != null && (c.honorariosPct <= 0 || c.honorariosPct > 100)) {
    out.push('honorarios-invalidos');
  }

  if (c.vertical === 'vivienda' && c.garantia?.tipo === 'deposito_no_vivienda') {
    out.push('deposito-en-vivienda');
  }

  return out;
}

/** El problema, dicho para quien está registrando el contrato. */
export function explicarProblemaContrato(p: ProblemaContrato): string {
  switch (p) {
    case 'sin-expediente':
      return 'Falta a qué expediente pertenece el contrato.';
    case 'sin-partes':
      return 'Hace falta al menos una parte con nombre (propietario o arrendatario).';
    case 'sin-vigencia':
      return 'Faltan las fechas de inicio y fin. De ellas salen los avisos de renovación.';
    case 'vigencia-invertida':
      return 'La fecha de fin tiene que ser posterior a la de inicio.';
    case 'sin-canon':
      return 'Un contrato de arriendo necesita su canon mensual.';
    case 'dia-pago-invalido':
      return 'El día de pago debe estar entre 1 y 28, para que exista en todos los meses.';
    case 'honorarios-invalidos':
      return 'El porcentaje de honorarios debe estar entre 0 y 100.';
    case 'deposito-en-vivienda':
      return 'En arriendo de VIVIENDA el depósito en dinero está prohibido por el art. 16 de la Ley 820 (multa de hasta 100 SMLMV y riesgo para la matrícula). Usa póliza o codeudor; el depósito solo vale en arriendo comercial.';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INVARIANTES DEL EXPEDIENTE Y DE LA NOVEDAD (§118) — mismo criterio que §113:
// el modelo es el dueño de lo que lo hace válido, y la Function los IMPONE con estos mismos
// predicados. Una regla, un dueño ([[L-45]]).
// ─────────────────────────────────────────────────────────────────────────────

export type ProblemaExpediente = 'sin-estado' | 'sin-referencia';

/**
 * Qué le falta a un expediente para poder guardarse.
 *
 * `sin-referencia` es el que de verdad importa: un expediente sin `propiedadId` NI `codigoLegacy` es
 * una carpeta sobre nada. Después le colgarán contratos, pagos y novedades por FK, y nadie sabrá de
 * qué inmueble hablan — y como el enlace es por FK y no por subcolección, no hay forma de deducirlo
 * más tarde. Barato de exigir ahora, imposible de arreglar con datos encima.
 */
export function problemasDeExpediente(e: Partial<Expediente>): ProblemaExpediente[] {
  const out: ProblemaExpediente[] = [];
  if (!e.estado || !ESTADOS_EXPEDIENTE.includes(e.estado)) out.push('sin-estado');
  if (!e.propiedadId?.trim() && !e.codigoLegacy?.trim()) out.push('sin-referencia');
  return out;
}

export function explicarProblemaExpediente(p: ProblemaExpediente): string {
  const t: Record<ProblemaExpediente, string> = {
    'sin-estado': 'Falta el estado del arriendo (activo, preaviso o finalizado).',
    'sin-referencia': 'Falta decir de qué inmueble es: elige uno del catálogo o escribe su código ALT-AR-*.',
  };
  return t[p];
}

export type ProblemaNovedad =
  | 'sin-expediente'
  | 'sin-tipo'
  | 'sin-descripcion'
  | 'cerrada-sin-resolucion';

/**
 * Qué le falta a una novedad.
 *
 * `cerrada-sin-resolucion` es un gate de VERDAD, no de forma: cerrar un ticket sin escribir qué se
 * hizo deja el mismo rastro que no haberlo atendido, y a los tres meses —cuando el inquilino
 * reclame lo mismo— nadie podrá decir si se resolvió. Es el «✅ inmerecido» de la operación: un
 * estado que afirma más de lo que respalda.
 */
export function problemasDeNovedad(n: Partial<Novedad>): ProblemaNovedad[] {
  const out: ProblemaNovedad[] = [];
  if (!n.expedienteId?.trim()) out.push('sin-expediente');
  if (!n.tipo?.trim()) out.push('sin-tipo');
  if (!n.descripcion?.trim()) out.push('sin-descripcion');
  if ((n.estado === 'HECHO' || n.estado === 'CERRADO') && !n.resolucion?.trim()) {
    out.push('cerrada-sin-resolucion');
  }
  return out;
}

export function explicarProblemaNovedad(p: ProblemaNovedad): string {
  const t: Record<ProblemaNovedad, string> = {
    'sin-expediente': 'Falta el expediente al que pertenece.',
    'sin-tipo': 'Falta de qué es: reparación, queja, solicitud…',
    'sin-descripcion': 'Falta contar qué pasó.',
    'cerrada-sin-resolucion': 'Para darla por resuelta hay que escribir qué se hizo.',
  };
  return t[p];
}
