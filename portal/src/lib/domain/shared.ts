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

/**
 * Tipo de inmueble. Valores PRO; confirmar contra el Excel del dueño (`ALTORRA_Excel_Desplegables_OK.xlsx`).
 *
 * 🏝️ `cabana` y `parqueadero` se añaden en §271 con criterio explícito —aparece en ≥2 líderes del
 * mercado + es real en Cartagena + ALTORRA lo publicaría—: Fincaraíz y Ciencuadras listan
 * **Parqueadero**, que en las torres de Bocagrande se vende y se arrienda SUELTO y es una unidad
 * registral propia; y Fincaraíz lista **Cabaña**, que es lo que hay en Barú, Tierrabomba y La
 * Boquilla — o sea el inventario natural de la cuarta línea de negocio, la corta estancia.
 *
 * ⛔ Se DESCARTARON con el mismo criterio: `habitación` (dos líderes la tienen, pero nuestro modelo
 * es inmueble completo con RNT, y el arriendo por habitación es otra operación y otro marco legal) y
 * `casa campestre` (se pisa con `finca` y `casa_lote`: un tipo que el asesor no sabe cuál elegir
 * hace más daño que uno que falta).
 *
 * 🎯 Se hace AHORA porque la base está VACÍA: no hay una sola ficha que migrar. Ampliar la taxonomía
 * después es re-clasificar inventario a mano.
 *
 * La clave va sin tilde y sin ñ como `casa_lote`: viaja en URLs. La etiqueta sí las lleva, y
 * `tipoCanonico` quita los diacríticos, así que «Cabaña» resuelve sola.
 */
export const TIPOS_INMUEBLE = [
  'apartamento', 'casa', 'apartaestudio', 'cabana', 'local', 'oficina',
  'bodega', 'parqueadero', 'lote', 'finca', 'casa_lote', 'consultorio', 'edificio', 'otro',
] as const;
export type TipoInmueble = (typeof TIPOS_INMUEBLE)[number];

/**
 * LA LISTA QUE VE EL VISITANTE — una sola, derivada, y sin `otro` (§270).
 *
 * 🔴 Había DOS listas escritas a mano: el buscador de la portada ofrecía seis tipos y `/alertas`
 * once. Se podía pedir aviso de una bodega y no se podía buscar una. Y el hero ofrecía además
 * «Penthouse», que no es un tipo — lo que hacía que esa opción no pudiera devolver nada nunca.
 *
 * 🎯 Verificado contra los dos líderes del mercado colombiano: Fincaraíz (15 tipos) y Metrocuadrado
 * (12) exponen una lista PLANA, CERRADA y CORTA de categorías físicas, y **ninguno de los dos ofrece
 * un «Otro» al público**. Tiene sentido: el tipo es la clave de partición del inventario y alimenta
 * la URL y la miga de pan. «Otro» es un cajón que devuelve cosas heterogéneas — el mismo pecado que
 * «Penthouse», al revés. Se queda para la captación interna, donde sí sirve.
 *
 * Deriva de `TIPOS_INMUEBLE` a propósito: mientras fueran dos listas separadas, se separaban solas.
 */
export const TIPOS_PUBLICOS = TIPOS_INMUEBLE.filter((t) => t !== 'otro');

/**
 * Cómo se NOMBRA cada tipo en pantalla. Las dos formas viven aquí, junto a la lista que nombran: el
 * singular lo usa un selector («Apartamento») y el plural, la prosa de una alerta («te avisamos de
 * Apartamentos en Bocagrande»). Estaban en ficheros distintos y el singular no existía — por eso el
 * buscador de la portada tenía sus seis etiquetas escritas a mano.
 *
 * Tabla explícita y no una transformación: capitalizar y cambiar «_» por espacio funciona para los
 * once de hoy y falla el día que entre un tipo cuyo nombre no siga esa regla. Una tabla que no cubre
 * un caso lo dice en su test; una regla lista, no.
 */
const ETIQUETA: Readonly<Record<TipoInmueble, { uno: string; varios: string }>> = {
  apartamento: { uno: 'Apartamento', varios: 'Apartamentos' },
  casa: { uno: 'Casa', varios: 'Casas' },
  apartaestudio: { uno: 'Apartaestudio', varios: 'Apartaestudios' },
  local: { uno: 'Local', varios: 'Locales' },
  oficina: { uno: 'Oficina', varios: 'Oficinas' },
  bodega: { uno: 'Bodega', varios: 'Bodegas' },
  lote: { uno: 'Lote', varios: 'Lotes' },
  finca: { uno: 'Finca', varios: 'Fincas' },
  cabana: { uno: 'Cabaña', varios: 'Cabañas' },
  parqueadero: { uno: 'Parqueadero', varios: 'Parqueaderos' },
  casa_lote: { uno: 'Casa lote', varios: 'Casas lote' },
  consultorio: { uno: 'Consultorio', varios: 'Consultorios' },
  edificio: { uno: 'Edificio', varios: 'Edificios' },
  otro: { uno: 'Otro', varios: 'Inmuebles' },
};

/** Para un selector: «Apartamento». */
export const etiquetaTipo = (t: TipoInmueble): string => ETIQUETA[t].uno;
/** Para la prosa: «te avisamos de Apartamentos en Bocagrande». */
export const etiquetaTipoPlural = (t: TipoInmueble): string => ETIQUETA[t].varios;

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
 * ⚠️ «penthouse» → `apartamento` es un ENSANCHAMIENTO, no una equivalencia, y desde §270 vive SOLO
 * aquí: la etiqueta salió del selector público. La tabla la sigue aceptando porque **una URL vieja
 * tiene que seguir resolviendo** —sé liberal con lo que aceptas y estricto con lo que emites— pero
 * ya no se OFRECE, porque ofrecerla es prometer que el sistema sabe distinguir un penthouse, y hoy no
 * sabe. Vuelve el día que las fichas lleven su piso: `schema.org/Penthouse` **no existe** (404), así
 * que la señal honesta es `floorLevel`, que es un hecho verificable y no una etiqueta que se pone
 * solo el dueño del último piso.
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
  cabana: 'cabana', cabanas: 'cabana',
  parqueadero: 'parqueadero', parqueaderos: 'parqueadero', garaje: 'parqueadero', garajes: 'parqueadero',
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
