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
  diaPago?: number; // 1..28
  honorariosPct?: number; // administración
  ivaSobreHonorarios?: boolean;
  vigenciaInicio: ISODate;
  vigenciaFin: ISODate; // alerta de renovación a 4 meses (preaviso legal 3 — Ley 820), derivada de aquí
  renovacionAutomatica: boolean;
  incrementoIPC?: boolean;
  /** Garantía — en VIVIENDA NUNCA depósito en dinero (OD9 / art. 16 Ley 820). La CF de creación de
   *  contrato valida `garantia` contra `vertical` (rechaza cualquier depósito si vertical === 'vivienda'). */
  garantia?: { tipo: TipoGarantia; detalle?: string };
  docs?: string[]; // adjuntos en Storage privado (B5)
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
