// Tipos compartidos del dominio ALTORRA — modelo de datos v1 (Ola 0.7, ADR §19/§20).
// Los datos llegan al edge vía REST de Firestore (OD1) → los Timestamp se serializan como ISO string.

/** Fecha/hora ISO 8601 (RFC3339). */
export type ISODate = string;
/** Monto en pesos colombianos (COP), entero. */
export type COP = number;

/** Concurrencia optimista (L-04 / §3.5): `_version:1` al crear, `+1` por transacción de escritura. */
export interface Versioned {
  _version: number;
}
export interface Auditable {
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Operación comercial del inmueble. */
export const OPERACIONES = ['venta', 'arriendo', 'alojamiento'] as const;
export type Operacion = (typeof OPERACIONES)[number];

/**
 * Vertical LEGAL (legal-by-design): gobierna qué gates aplican. vivienda ≠ comercial ≠ turístico
 * (p.ej. depósito prohibido solo en vivienda — OD9; RNT solo en turístico — B3).
 */
export const VERTICALES = ['vivienda', 'comercial', 'turistico'] as const;
export type Vertical = (typeof VERTICALES)[number];

/** Tipo de inmueble. Valores PRO; confirmar contra el Excel del dueño (`ALTORRA_Excel_Desplegables_OK.xlsx`). */
export const TIPOS_INMUEBLE = [
  'apartamento', 'casa', 'apartaestudio', 'local', 'oficina',
  'bodega', 'lote', 'finca', 'casa_lote', 'consultorio', 'edificio', 'otro',
] as const;
export type TipoInmueble = (typeof TIPOS_INMUEBLE)[number];

/** Estado de publicación en el catálogo. */
export const ESTADOS_PROPIEDAD = [
  'borrador', 'en_verificacion', 'disponible', 'reservado', 'inactivo', 'cerrado',
] as const;
export type EstadoPropiedad = (typeof ESTADOS_PROPIEDAD)[number];

/**
 * Jerarquía geográfica (FTI-01: Ciudad → Zona/Sector → Barrio).
 * ⛔ El documento PÚBLICO nunca lleva dirección exacta; lat/lng = centroide aproximado del barrio.
 */
export interface Geo {
  ciudad: string;
  zona?: string;
  barrio: string;
  lat?: number;
  lng?: number;
}
