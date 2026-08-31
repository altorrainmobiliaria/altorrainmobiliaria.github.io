import type {
  ISODate, COP, Versioned, Auditable, Operacion, Vertical, TipoInmueble, EstadoPropiedad, Geo,
  SituacionPH,
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
  /**
   * Cuántos pisos tiene el EDIFICIO. Es el dato que vuelve verificable la palabra «penthouse» (§271).
   *
   * 🎯 Un penthouse es el ÚLTIMO piso — así lo modela Fincaraíz, como el último valor de su filtro
   * «Piso»— y `schema.org/Penthouse` ni siquiera existe (404). Con `piso` solo no se puede saber:
   * el 14 es el último en una torre de 14 y no lo es en una de 30. Con los dos números, se DERIVA.
   *
   * ⛔ La alternativa era una casilla «¿es penthouse?». Se descartó: todo propietario de un último
   * piso llama penthouse a su apartamento, y una etiqueta que pone el interesado no la puede sellar
   * nadie — choca de frente con la promesa «Verificado por ALTORRA». Un número se comprueba mirando
   * el edificio; un adjetivo, no.
   */
  pisosTotales?: number;
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
  /** Capado a los últimos N cambios en la proyección pública (la Function que escribe lo poda) — doc lean. */
  priceHistory?: PriceHistoryEntry[];
  /** RNT — OBLIGATORIO y bloqueante cuando `operacion==='alojamiento'` (gate B3). */
  rnt?: string;
  /**
   * La OTRA mitad del gate B3: autorización del reglamento de PH para el uso turístico.
   * Bloqueante en `alojamiento` igual que el RNT. Ausente = sin declarar = no se publica.
   */
  autorizacionPH?: AutorizacionPH;
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

/**
 * La PORTADA del inmueble, o `''` si no hay ninguna imagen.
 *
 * DUEÑO ÚNICO a propósito (§106). Había tres lectores de este par de campos y no coincidían: el índice
 * y el Open Graph usaban `imagenPortada ?? imagenes[0]` —donde `??` solo cae al respaldo si el valor es
 * `null`/`undefined`, NO si es cadena vacía— mientras el componente de la ficha usaba `|| `, que sí
 * cae. Con `imagenPortada: ''` el resultado era una ficha con su galería completa y, a la vez, sin card
 * en el listado y sin imagen al compartir el enlace — que en este negocio es el canal principal.
 *
 * Una cadena vacía es AUSENCIA de portada, no una portada llamada «». [[L-45]](e).
 */
export function portadaDe(p: Pick<Propiedad, 'imagenPortada' | 'imagenes'>): string {
  return p.imagenPortada?.trim() || p.imagenes?.find((i) => i?.trim()) || '';
}

/*
 * ⬇️ Vivía en `ficha.ts` y se mudó AQUÍ en §104. Razón: no es un detalle de la vista de ficha, es
 * un INVARIANTE LEGAL del modelo, y el catálogo también tiene que respetarlo — pero `catalogo.ts`
 * no puede importar de `ficha.ts` sin crear un ciclo. El modelo es el dueño de sus invariantes.
 */
/**
 * Declaración sobre el reglamento de propiedad horizontal. La hace el OPERADOR al dar de alta, y
 * queda fechada: sin fecha no hay declaración que oponer el día que alguien pregunte.
 *
 * ⚖️ POR QUÉ DECLARAR Y NO VERIFICAR. La norma pone la declaración en cabeza del PRESTADOR
 * (D.1074/2015 art. 2.2.4.1.2.2 num. 8), y no existe norma que obligue al portal a leerse cada
 * reglamento. Exigir copia de todos sería inventarnos un deber que la ley no impone y frenar el
 * inventario entero por una cautela que nadie pidió. Pero la declaración se GUARDA, porque el riesgo
 * que sí nos toca es el de publicidad engañosa (Ley 1480/2011) y en Cartagena la restitución de
 * destinación en el Centro Histórico no es teórica.
 */
export interface AutorizacionPH {
  situacion: SituacionPH;
  /** Instante ISO de la declaración. Es la evidencia; por eso no es opcional. */
  declaradaEn: ISODate;
  /** Quién declaró (uid del operador), cuando la sesión lo sabe. */
  declaradaPor?: string;
  /**
   * Clave R2 del reglamento o del acta de asamblea, cuando se adjunte.
   * Hoy NADIE la exige y el gate no la mira: el campo existe porque el proyecto de decreto de 2026
   * pasaría de DECLARAR a PROBAR, y ese día el cambio es llenar un campo, no migrar un modelo.
   */
  documento?: string;
}

/** El motivo LEGAL por el que una ficha no se puede publicar, o `null` si no hay ninguno. */
export type MotivoLegal = 'sin-rnt' | 'sin-autorizacion-ph';

/**
 * ¿Qué le impide LEGALMENTE publicarse a esta ficha?
 *
 * Los dos motivos son del alojamiento turístico y son ACUMULATIVOS en la ley, pero se devuelve solo
 * el primero porque el operador arregla de uno en uno y cada uno manda a buscar un papel distinto.
 * Devolver el motivo en vez de un booleano es lo que permite que el mensaje diga la verdad: cuando
 * los dos gates compartían el código `sin-rnt`, a quien le faltaba el permiso de la copropiedad se le
 * mandaba a buscar el RNT que ya tenía.
 *
 * (1) **Sin RNT**: el Registro Nacional de Turismo es obligatorio para prestar hospedaje, y
 *     anunciarse sin él expone a cierre inmediato (`43 §Marco legal`, gate B3).
 * (2) **Sin autorización de PH**: el reglamento debe autorizar el uso turístico de forma EXPRESA;
 *     el silencio no sirve (ver `SITUACIONES_PH`). Publicar una unidad de un edificio que no lo
 *     permite expone al propietario a las sanciones del art. 59 de la Ley 675 y a nosotros a haberlo
 *     anunciado sabiendo que no se podía.
 *
 * Fail-closed A PROPÓSITO: ante la duda no se publica. Una propiedad que desaparece del portal es un
 * problema de datos que alguien arregla en una tarde; una multa por publicidad ilegal, no.
 */
export function motivoLegalNoPublicable(p: Propiedad): MotivoLegal | null {
  if (p.operacion !== 'alojamiento') return null;
  if (!p.rnt?.trim()) return 'sin-rnt';
  if (p.autorizacionPH?.situacion !== 'no-aplica' && p.autorizacionPH?.situacion !== 'autoriza-expreso') {
    return 'sin-autorizacion-ph';
  }
  return null;
}

/**
 * ¿Se puede PUBLICAR esta ficha? Azúcar sobre `motivoLegalNoPublicable` para los lectores a los que
 * les basta el sí/no (la ficha, que solo decide entre 200 y 404).
 */
export function publicable(p: Propiedad): boolean {
  return motivoLegalNoPublicable(p) === null;
}
