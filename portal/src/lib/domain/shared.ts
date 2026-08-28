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

/**
 * Situación del inmueble frente al reglamento de PROPIEDAD HORIZONTAL, para uso turístico.
 *
 * 🔴 EL SILENCIO NO AUTORIZA, y por eso este tipo tiene tres valores y no dos. Para prestar
 * alojamiento turístico en un inmueble sometido a PH, el reglamento debe permitirlo **previamente y
 * de manera expresa** (D.1074/2015 art. 2.2.4.1.2.2 num. 8 — el prestador lo DECLARA al inscribir el
 * RNT; requisito confirmado por el Consejo de Estado al negar su nulidad). La destinación de las
 * unidades privadas la manda el reglamento (Ley 675/2001 art. 18 num. 1) y la copropiedad puede
 * sancionar el incumplimiento (art. 59).
 *
 * Un reglamento que CALLA cae en `sin-autorizacion`, igual que el que prohíbe: son distintos para el
 * propietario —el silencio se puede convertir en permiso llevándolo a votación de la asamblea— pero
 * idénticos para nosotros HOY, que es lo único que este campo decide. Modelarlo con un booleano
 * dejaría el silencio del lado del «sí» por omisión, que es justo el error que se quiere impedir.
 */
export const SITUACIONES_PH = ['no-aplica', 'autoriza-expreso', 'sin-autorizacion'] as const;
export type SituacionPH = (typeof SITUACIONES_PH)[number];

/** Tipo de inmueble. Valores PRO; confirmar contra el Excel del dueño (`ALTORRA_Excel_Desplegables_OK.xlsx`). */
export const TIPOS_INMUEBLE = [
  'apartamento', 'casa', 'apartaestudio', 'local', 'oficina',
  'bodega', 'lote', 'finca', 'casa_lote', 'consultorio', 'edificio', 'otro',
] as const;
export type TipoInmueble = (typeof TIPOS_INMUEBLE)[number];

/**
 * UN SOLO VOCABULARIO DE TIPO — la puerta de entrada nombraba cosas que el sistema no tiene (§265).
 *
 * 🔴 El desplegable del hero ofrecía **«Penthouse»**, y `TIPOS_INMUEBLE` no lo contiene: ninguna
 * propiedad puede guardarse jamás con ese tipo, así que esa opción no podía devolver un solo
 * resultado — nunca. Y al revés, omitía cinco tipos que sí existen (apartaestudio, oficina, bodega,
 * consultorio, edificio) que `/alertas` sí deja elegir: se podía crear una ALERTA de bodega y no se
 * podía BUSCAR una. Dos listas escritas a mano para la misma cosa, que es como se desincronizan.
 *
 * Esta tabla es el único puente. Es **explícita a propósito**: la alternativa —quitar la «s» final
 * para singularizar— acierta con «Casas» y falla con «Locales» → «locale», que no existe, y falla
 * EN SILENCIO devolviendo cero resultados. Una tabla que no cubre un caso se ve en su test; un
 * stemming que no lo cubre se ve cuando un cliente no encuentra nada.
 *
 * ⚠️ «penthouse» → `apartamento` es un ENSANCHAMIENTO deliberado, no una equivalencia: en la
 * taxonomía un penthouse es un apartamento, así que quien lo elija verá apartamentos. Es mejor que
 * cero, y es reversible. **Decisión pendiente del dueño**: o se retira la etiqueta del selector, o
 * el catálogo gana un distintivo propio. Hoy no se puede distinguir con los campos que hay.
 */
const ALIAS_TIPO: Readonly<Record<string, TipoInmueble>> = {
  apartamento: 'apartamento', apartamentos: 'apartamento', apto: 'apartamento', aptos: 'apartamento',
  penthouse: 'apartamento', penthouses: 'apartamento',
  casa: 'casa', casas: 'casa',
  apartaestudio: 'apartaestudio', apartaestudios: 'apartaestudio',
  local: 'local', locales: 'local',
  oficina: 'oficina', oficinas: 'oficina',
  bodega: 'bodega', bodegas: 'bodega',
  lote: 'lote', lotes: 'lote',
  finca: 'finca', fincas: 'finca',
  casa_lote: 'casa_lote', 'casa lote': 'casa_lote', 'casas lote': 'casa_lote',
  consultorio: 'consultorio', consultorios: 'consultorio',
  edificio: 'edificio', edificios: 'edificio',
  otro: 'otro', otros: 'otro',
};

/**
 * Traduce a tipo canónico lo que ESCRIBE la interfaz (una etiqueta, un plural, un sinónimo comercial)
 * o lo que llega por la URL. Devuelve `null` cuando no reconoce: quien llama decide qué hacer con lo
 * desconocido, y `null` es visible — un `'otro'` por defecto se colaría como si fuera un dato.
 */
export function tipoCanonico(v: string): TipoInmueble | null {
  const k = v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
  return ALIAS_TIPO[k] ?? null;
}

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
