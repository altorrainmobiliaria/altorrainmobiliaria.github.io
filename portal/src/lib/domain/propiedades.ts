import type {
  ISODate, COP, Versioned, Auditable, Operacion, Vertical, TipoInmueble, EstadoPropiedad, Geo,
} from './shared';

/** Precio con DOBLE-PRECIO en arriendo (canon + administración) — diferenciador de transparencia (R1). */
export interface Precio {
  moneda: 'COP';
  // venta
  valorVenta?: COP;
  // arriendo
  canon?: COP;
  administracion?: COP;
  adminIncluidaEnCanon?: boolean;
  // alojamiento (corta estancia)
  precioNoche?: COP;
  precioAseo?: COP; // se suma al total de la estadía; el total se muestra desde la card
}

export interface PriceHistoryEntry {
  fecha: ISODate;
  valor: COP;
}

/** Specs físicas — subset PÚBLICO de FTI-01. */
export interface SpecsInmueble {
  habitaciones?: number;
  banos?: number;
  banosSociales?: number;
  areaConstruidaM2?: number;
  areaPrivadaM2?: number;
  estrato?: number;
  parqueaderos?: number;
  tipoParqueadero?: 'cubierto' | 'descubierto' | 'comunal' | 'ninguno';
  cuartoUtil?: boolean; // "depósito/cuarto útil" físico — NO confundir con depósito-garantía (prohibido, OD9)
  piso?: number;
  antiguedadAnios?: number;
}

/** Amenidades como mapa booleano; libres van en `otrasAmenidades`. */
export type Amenidades = Record<string, boolean>;

/**
 * `propiedades` — PROYECCIÓN PÚBLICA (marketing/SEO). Lectura pública.
 * ⛔ JAMÁS incluir PII de propietario, dirección exacta, matrícula inmobiliaria ni comisión → `captaciones`.
 */
export interface Propiedad extends Versioned, Auditable {
  id: string;              // INM-YYYYMM-XXXX (canónico, inmutable, contador atómico — OD8)
  codigoLegacy?: string;   // ALT-*/ALT-AR-* (alias operativo del dueño)
  operacion: Operacion;
  vertical: Vertical;      // legal-by-design
  tipo: TipoInmueble;
  estado: EstadoPropiedad;
  titulo: string;
  descripcion: string;
  slug?: string;
  geo: Geo;                // barrio/zona; nunca dirección exacta
  specs: SpecsInmueble;
  amenidades: Amenidades;
  otrasAmenidades?: string[];
  precio: Precio;
  priceHistory?: PriceHistoryEntry[];
  /** RNT — OBLIGATORIO y bloqueante cuando `operacion==='alojamiento'` (gate B3). */
  rnt?: string;
  /** Multimedia: SIEMPRE URLs de R2 (derivados WebP fijos). NUNCA servir originales. */
  imagenes: string[];
  imagenPortada?: string;
  featured?: boolean;
  prioridad?: number;
  verificadoAltorra?: boolean; // sello "Verificado por ALTORRA" (op.13)
  verificadoEn?: ISODate;
  ultimaConfirmacion?: ISODate; // frescura: re-confirmar 30-60d → inactivo (nunca borrar)
}

/** Garantía de arriendo (OD9): en VIVIENDA el depósito en dinero está PROHIBIDO (art. 16 Ley 820). */
export const TIPOS_GARANTIA = ['poliza', 'codeudor', 'deposito_no_vivienda'] as const;
export type TipoGarantia = (typeof TIPOS_GARANTIA)[number];

/**
 * `captaciones` — INTERNO / PII (admin-only). MISMO `id` que la `propiedad`.
 * Rules: default deny-all; lectura solo editor+. NUNCA lectura pública (gate Habeas Data B1/B5).
 */
export interface Captacion extends Versioned, Auditable {
  id: string; // = propiedad.id
  propietario: {
    nombre: string;
    cedula?: string;   // PII sensible → preferible Storage privado + autorización explícita (B5)
    telefono?: string;
    email?: string;
  };
  direccionExacta?: string;       // NUNCA público
  matriculaInmobiliaria?: string; // registro ORIP del inmueble — interno
  comisionPct?: number;           // comisión pactada — interno
  situacionJuridica?: string;
  impuestoPredialAnual?: COP;
  notasInternas?: string;
}

/**
 * `disponibilidad` — corta estancia, RACE-SAFE por diseño (unidad de fecha inmutable).
 * docId sugerido `${propiedadId}_${fecha}`. La reserva se hace SIEMPRE server-side (Admin SDK en
 * Function) dentro de una transacción que lee disponibilidad DENTRO de la transacción (anti-overbooking,
 * gate de salida de Ola 2). El SCHEMA se sella ya; el rail de pago entra en Ola 2.
 */
export const ESTADOS_DISPONIBILIDAD = ['libre', 'bloqueado', 'reservado'] as const;
export type EstadoDisponibilidad = (typeof ESTADOS_DISPONIBILIDAD)[number];

export interface Disponibilidad extends Versioned {
  propiedadId: string;
  fecha: string; // YYYY-MM-DD (unidad inmutable)
  estado: EstadoDisponibilidad;
  reservaId?: string;
}
