/*
 * ALTA DE PROPIEDAD — la mitad PURA del formulario del panel (§108).
 *
 * Convierte lo que una persona teclea en un documento `Propiedad` del modelo SELLADO, o en una lista
 * de errores por campo. Vive aquí y no en el componente por la razón de siempre: esto es lo que hay
 * que poder probar sin navegador, sin Firestore y sin sesión — y es donde están las decisiones.
 *
 * LO QUE ESTE MÓDULO NO HACE: no habla con Firestore, no acuña el número de secuencia (eso exige una
 * transacción) y no sube fotos. Recibe el `id` ya acuñado y las CLAVES de las imágenes ya subidas.
 */

import { claveValida } from '../media-subida';
import { precioDisplay, problemasParaPublicar, type ProblemaPublicacion } from './catalogo';
import type { Amenidades, AutorizacionPH, Precio, PriceHistoryEntry, SpecsInmueble } from './propiedades';
import type { Propiedad } from './propiedades';
import { reparosParaSellar } from './verificacion';
import {
  ESTADOS_PROPIEDAD,
  OPERACIONES,
  SITUACIONES_PH,
  TIPOS_INMUEBLE,
  VERTICALES,
  type COP,
  type Geo,
  type ISODate,
  type EstadoPropiedad,
  type Operacion,
  type SituacionPH,
  type TipoInmueble,
  type Vertical,
} from './shared';

// ─────────────────────────────────────────────────────────────────────────────
// EL CÓDIGO: `INM-YYYYMM-NNNN`
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La clave del contador para un mes. El código lleva el año-mes dentro, así que el contador es
 * MENSUAL: uno global daría códigos como `INM-202608-0193` en el primer alta de agosto, donde el mes y
 * el número no tendrían ninguna relación. El precio es un documento con una clave por mes, que no es
 * precio ninguno.
 */
export function claveContador(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  return `INM-${y}${m}`;
}

/** Tope de la secuencia mensual. `NNNN` son 4 dígitos y el resto del sistema lo da por hecho. */
export const TOPE_SECUENCIA = 9999;

export type ResultadoCodigo = { ok: true; codigo: string } | { ok: false; motivo: 'secuencia-agotada' };

/**
 * `INM-202608-0007`.
 *
 * Si la secuencia del mes se agota, se FALLA en vez de seguir contando. Un `INM-202608-10000` no casa
 * con `ID_PROPIEDAD_RE` de `buscar-ficha`, así que la ficha devolvería 404 para un inmueble que existe
 * — un fallo silencioso y desconcertante a cambio de no querer parar. Con 9.999 altas en un mes, parar
 * y avisar es lo correcto.
 */
export function codigoPropiedad(claveMes: string, secuencia: number): ResultadoCodigo {
  if (!Number.isInteger(secuencia) || secuencia < 1 || secuencia > TOPE_SECUENCIA) {
    return { ok: false, motivo: 'secuencia-agotada' };
  }
  return { ok: true, codigo: `${claveMes}-${String(secuencia).padStart(4, '0')}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// EL SLUG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Texto → trozo de URL. NFD primero para separar la tilde de su letra y poder quitarla.
 *
 * ⚠️ La versión que hay en el generador de semilla hace `toLowerCase().replace(/[^a-z]+/g, '-')`, y esa
 * clase **borra los dígitos y convierte cada tilde en un guion**: «Centro Histórico» sale
 * `centro-hist-rico` y «Villa 7» sale `villa-`. Copiarla era lo cómodo; por eso se escribe aquí bien.
 */
export function aTrozoUrl(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * El slug público del inmueble: `apartamento-bocagrande-inm-202608-0007`.
 *
 * El código va SIEMPRE al final, y no por estética. El índice del catálogo lo escribe una Function con
 * retardo (ventana de coalescencia + barrido), así que dos altas seguidas no pueden comprobar la
 * unicidad la una contra la otra: si el slug no llevara algo único por construcción, chocarían en
 * silencio y `resolverSlug` resolvería siempre a la primera del orden fijo de shards.
 *
 * Y se congela al crear: regenerarlo al editar cambia la URL pública de un inmueble ya indexado, que
 * es uno de los defectos del panel viejo.
 */
export function slugPropiedad(tipo: string, barrio: string, codigo: string): string {
  const partes = [aTrozoUrl(tipo), aTrozoUrl(barrio), aTrozoUrl(codigo)].filter(Boolean);
  return partes.join('-');
}

// ─────────────────────────────────────────────────────────────────────────────
// LA VERTICAL — decide qué gates LEGALES aplican, así que se falla del lado protector
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_COMERCIALES: readonly TipoInmueble[] = ['local', 'oficina', 'bodega', 'consultorio', 'edificio'];

/**
 * Vertical SUGERIDA a partir de la operación y el tipo. Es una sugerencia, no un veredicto: el
 * operador la confirma, porque hay inmuebles mixtos que ninguna heurística acierta.
 *
 * POR QUÉ IMPORTA: la vertical gobierna los gates legales — el RNT en turístico, y sobre todo la
 * PROHIBICIÓN de depósito en garantía en vivienda (art. 16 Ley 820). Equivocarse hacia «vivienda»
 * solo prohíbe de más; equivocarse hacia «comercial» permitiría cobrar un depósito ilegal. Por eso
 * ante la duda se sugiere **vivienda**: es el lado que protege, no el cómodo.
 *
 * `alojamiento` manda sobre el tipo: un apartamento alquilado por noches es turístico aunque sea el
 * mismo inmueble que el mes que viene se arriende por meses.
 */
export function verticalSugerida(operacion: Operacion, tipo: TipoInmueble): Vertical {
  if (operacion === 'alojamiento') return 'turistico';
  if (TIPOS_COMERCIALES.includes(tipo)) return 'comercial';
  return 'vivienda';
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUIR EL DOCUMENTO
// ─────────────────────────────────────────────────────────────────────────────

/** Lo que llega del formulario. Todo texto, como sale de un `<input>`. */
export interface EntradaAlta {
  operacion: string;
  tipo: string;
  vertical?: string;
  estado?: string;
  titulo: string;
  descripcion?: string;
  ciudad: string;
  zona?: string;
  barrio: string;
  lat?: string | number;
  lng?: string | number;
  rnt?: string;
  /** Situación frente al reglamento de PH. Solo se exige en `alojamiento`. Ver `SITUACIONES_PH`. */
  situacionPH?: string;
  /** Quién declara (uid del operador), cuando la sesión lo sabe. */
  declaradaPor?: string;
  /** Precio: solo se usa el que corresponde a la operación. */
  valorVenta?: string | number;
  canon?: string | number;
  administracion?: string | number;
  precioNoche?: string | number;
  habitaciones?: string | number;
  banos?: string | number;
  areaConstruidaM2?: string | number;
  estrato?: string | number;
  parqueaderos?: string | number;
  piso?: string | number;
  pisosTotales?: string | number;
  /** CLAVES de R2 devueltas por `/api/media/subir`. Nunca URLs. */
  imagenes?: string[];
  amenidades?: Amenidades;
}

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

export interface ContextoAlta {
  /** Código ya acuñado (`INM-YYYYMM-NNNN`). Lo produce la transacción del contador. */
  codigo: string;
  /** Instante del alta. Inyectable: `createdAt`/`updatedAt` tienen que ser deterministas en los tests. */
  ahora: Date;
}

export type ResultadoAlta =
  | { ok: true; propiedad: Propiedad }
  | { ok: false; errores: ErrorCampo[] };

const txt = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * DECIMAL en notación de máquina: el punto es la coma decimal. Para coordenadas y áreas.
 *
 * Una cadena vacía NO es cero: es «no lo sé», y guardar 0 sería inventarse un dato.
 */
function numeroDecimal(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * DINERO en notación colombiana: `$ 450.000.000` son cuatrocientos cincuenta millones, no 450.
 *
 * Va SEPARADO de `numeroDecimal` a propósito, y no por comodidad. Aquí el punto separa MILES; en una
 * coordenada el mismo punto es el decimal. Un único parser «listo» que intentara adivinar cuál es cuál
 * pondría `lat: 10.399` en la latitud **10399** — un inmueble de Cartagena aparecería en mitad del
 * Ártico, sin error ninguno. Dos dominios distintos, dos funciones.
 *
 * Se admite la coma como decimal (`1.500,50`) porque es lo que escribe la gente, aunque en precios de
 * inmueble los céntimos no pinten nada: rechazarlo sería pedirle al operador que escriba como la
 * máquina.
 */
function numeroCop(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const limpio = String(v).replace(/[^\d.,-]/g, '');
  if (!limpio) return undefined;
  const ultimoPunto = limpio.lastIndexOf('.');
  const ultimaComa = limpio.lastIndexOf(',');
  let normalizado: string;
  if (ultimaComa > ultimoPunto) {
    // `1.500,50` → el último separador es la coma, así que es el decimal.
    normalizado = limpio.replace(/\./g, '').replace(',', '.');
  } else if (ultimoPunto > -1 && ultimaComa === -1 && /\.\d{3}(?!\d)/.test(limpio)) {
    // Solo puntos y el último grupo tiene 3 dígitos: `450.000.000` = miles.
    normalizado = limpio.replace(/\./g, '');
  } else {
    normalizado = limpio.replace(/,/g, '');
  }
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : undefined;
}

/** Entero positivo o `undefined`. Para specs, donde un 0 sí es un dato válido (0 parqueaderos). */
function entero(v: unknown, minimo = 0): number | undefined {
  const n = numeroDecimal(v);
  if (n == null) return undefined;
  const i = Math.trunc(n);
  return i >= minimo ? i : undefined;
}

/**
 * Formulario → `Propiedad` del modelo sellado, o los errores POR CAMPO.
 *
 * Devuelve TODOS los errores de una vez: un formulario que revela los fallos de uno en uno obliga a
 * guardar cinco veces para enterarse de cinco cosas. Y valida el precio SEGÚN la operación, porque el
 * dato que hay que exigir cambia con ella — pedir «valor de venta» en un arriendo es cómo se acaba
 * guardando un canon en el campo equivocado.
 */
export function construirPropiedad(entrada: EntradaAlta, ctx: ContextoAlta): ResultadoAlta {
  const errores: ErrorCampo[] = [];
  const err = (campo: string, mensaje: string) => errores.push({ campo, mensaje });

  const operacion = txt(entrada.operacion) as Operacion;
  if (!(OPERACIONES as readonly string[]).includes(operacion)) {
    err('operacion', 'Elige si es venta, arriendo o alojamiento por días.');
  }
  const tipo = txt(entrada.tipo) as TipoInmueble;
  if (!(TIPOS_INMUEBLE as readonly string[]).includes(tipo)) err('tipo', 'Elige el tipo de inmueble.');

  const estado = (txt(entrada.estado) || 'borrador') as EstadoPropiedad;
  if (!(ESTADOS_PROPIEDAD as readonly string[]).includes(estado)) err('estado', 'Estado no válido.');

  const titulo = txt(entrada.titulo);
  if (!titulo) err('titulo', 'El título es obligatorio: es lo que se lee en la tarjeta del listado.');

  // La CIUDAD es obligatoria y no se rellena sola. Sin ella la ficha y el JSON-LD callan (§106) y la
  // matrícula de arrendador se oculta — o sea, un arriendo anunciado sin la habilitación que exige la
  // Ley 820 art. 31. Es el campo donde un hueco se convierte en un problema legal.
  const ciudad = txt(entrada.ciudad);
  if (!ciudad) err('ciudad', 'La ciudad es obligatoria (de ella depende que se muestre la matrícula de arrendador).');
  const barrio = txt(entrada.barrio);
  if (!barrio) err('barrio', 'El barrio es obligatorio: es la ubicación que se publica.');

  const rnt = txt(entrada.rnt);
  if (operacion === 'alojamiento' && !rnt) {
    err('rnt', 'Un alojamiento turístico necesita su número de RNT para poder anunciarse (obligación legal).');
  }

  // La OTRA mitad del gate B3. Se pide junto al RNT porque son la misma decisión: si el inmueble
  // puede prestar alojamiento turístico o no. `/invertir` lleva meses diciéndole al comprador que
  // «el reglamento debe autorizarlo expresamente» y este formulario no lo preguntaba (§174).
  const situacionPH = txt(entrada.situacionPH) as SituacionPH;
  if (operacion === 'alojamiento') {
    if (!situacionPH) {
      err('situacionPH', 'Falta decir qué dice el reglamento de la copropiedad sobre el alquiler por días.');
    } else if (!(SITUACIONES_PH as readonly string[]).includes(situacionPH)) {
      err('situacionPH', 'Situación de propiedad horizontal no válida.');
    } else if (situacionPH === 'sin-autorizacion') {
      // NO es un dato que falte: es la respuesta, y la respuesta es que no se puede anunciar. Se
      // bloquea aquí y no solo en `publicable()` para que nadie lo guarde creyendo que ya está.
      err(
        'situacionPH',
        'Si el reglamento no autoriza EXPRESAMENTE el alquiler por días, el inmueble no se puede anunciar por días. ' +
          'El silencio del reglamento no vale como permiso; el camino es llevarlo a votación de la asamblea.',
      );
    }
  }

  const precio = precioDeEntrada(operacion, entrada, err);

  const imagenes = (entrada.imagenes ?? []).map((i) => txt(i)).filter(Boolean);
  if (!imagenes.length) {
    err('imagenes', 'Hace falta al menos una foto: sin portada el inmueble no aparece en los listados.');
  }
  const ajenas = imagenes.filter((i) => !claveValida(i));
  if (ajenas.length) {
    err('imagenes', `Hay ${ajenas.length} imagen(es) que no vienen de nuestro almacenamiento. Vuelve a subirlas.`);
  }

  // La que ELIGE el operador manda; la sugerencia solo rellena cuando no eligió. (Escrito en tres
  // líneas a propósito: la versión de una sola línea con `||` y `?:` pisaba la elección del operador.)
  const verticalDada = txt(entrada.vertical);
  const puedeSugerir =
    (OPERACIONES as readonly string[]).includes(operacion) && (TIPOS_INMUEBLE as readonly string[]).includes(tipo);
  const vertical = (verticalDada || (puedeSugerir ? verticalSugerida(operacion, tipo) : '')) as Vertical;
  if (!(VERTICALES as readonly string[]).includes(vertical)) err('vertical', 'Vertical no válida.');

  if (errores.length) return { ok: false, errores };

  const geo: Geo = { ciudad, barrio };
  const zona = txt(entrada.zona);
  if (zona) geo.zona = zona;
  const lat = numeroDecimal(entrada.lat);
  const lng = numeroDecimal(entrada.lng);
  // Las dos o ninguna: una coordenada sola no ubica nada y el contrato del mapa las quiere en pareja.
  if (lat != null && lng != null) {
    geo.lat = lat;
    geo.lng = lng;
  }

  const specs: SpecsInmueble = {};
  const asignar = <K extends keyof SpecsInmueble>(k: K, v: SpecsInmueble[K]) => {
    if (v !== undefined) specs[k] = v;
  };
  asignar('habitaciones', entero(entrada.habitaciones));
  asignar('banos', entero(entrada.banos));
  asignar('areaConstruidaM2', numeroDecimal(entrada.areaConstruidaM2));
  asignar('estrato', entero(entrada.estrato, 1));
  asignar('parqueaderos', entero(entrada.parqueaderos));
  asignar('piso', entero(entrada.piso, 1));
  asignar('pisosTotales', entero(entrada.pisosTotales, 1));

  const iso = ctx.ahora.toISOString();
  const propiedad: Propiedad = {
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
    id: ctx.codigo,
    operacion,
    vertical,
    tipo,
    estado,
    titulo,
    descripcion: txt(entrada.descripcion),
    slug: slugPropiedad(tipo, barrio, ctx.codigo),
    geo,
    specs,
    amenidades: entrada.amenidades ?? {},
    precio,
    imagenes,
    imagenPortada: imagenes[0],
  };
  if (rnt) propiedad.rnt = rnt;
  if (operacion === 'alojamiento') {
    const declaracion: AutorizacionPH = { situacion: situacionPH, declaradaEn: iso };
    const quien = txt(entrada.declaradaPor);
    if (quien) declaracion.declaradaPor = quien;
    propiedad.autorizacionPH = declaracion;
  }

  // 💲 El PRECIO DE SALIDA abre el historial (§305). Sin esta línea el primer cambio de precio dejaría
  // UNA entrada suelta, y con una sola no hay contra qué comparar: la ficha no podría decir «bajó»,
  // que es justo la transparencia que este portal vende. La serie empieza el día que se publica.
  const salida = precioDisplay(propiedad);
  if (salida != null) propiedad.priceHistory = [{ fecha: iso, valor: salida }];

  return { ok: true, propiedad };
}

/**
 * Código PROVISIONAL para evaluar un formulario a medio llenar.
 *
 * El código real lo acuña la transacción al guardar, pero el aviso de «¿se vería?» tiene que poder
 * responder ANTES — mientras la persona escribe. Este valor nunca se guarda: solo existe para que
 * `construirPropiedad` pueda armar un documento y preguntarle al lector.
 */
export const CODIGO_PROVISIONAL = 'INM-000000-0000';

export interface RevisionAlta {
  /** Lo que impide construir el documento. Se pinta junto a su campo. */
  errores: ErrorCampo[];
  /** Si se pudo construir: por qué NO se vería en el catálogo (vacío = se ve). */
  problemas: ProblemaPublicacion[];
  /** `true` solo si, guardándolo así, aparecería en el portal. */
  seVeria: boolean;
}

/**
 * Revisa el formulario en vivo: qué falta y si el resultado se vería.
 *
 * Existe para que el panel pueda decirlo ANTES de guardar. El sistema sabe exactamente qué le falta a
 * una ficha para salir en el catálogo —lo sabe el índice, y `problemasParaPublicar` se lo pregunta a
 * él, no a una copia— así que dejar que alguien guarde y descubra el silencio después sería esconder
 * a propósito una respuesta que ya tenemos.
 */
export function revisarAlta(entrada: EntradaAlta, ahora: Date): RevisionAlta {
  const r = construirPropiedad(entrada, { codigo: CODIGO_PROVISIONAL, ahora });
  if (!r.ok) return { errores: r.errores, problemas: [], seVeria: false };
  const problemas = problemasParaPublicar(r.propiedad);
  return { errores: [], problemas, seVeria: problemas.length === 0 };
}

/**
 * Lo que un inmueble YA TIENE y una edición no puede reinventar. Se captura al ABRIR el formulario.
 */
/**
 * Tope del historial en el documento. El `priceHistory` vive en el doc de la propiedad, que se LEE
 * entero en cada ficha SSR: dejarlo crecer sin fin es pagar lectura por un dato que nadie mira más
 * allá de las últimas filas. Diez cambios de precio son muchos más de los que tiene un inmueble real.
 *
 * Se recortan los MÁS VIEJOS y la serie queda CONTIGUA. Conservar el primero y saltar al final sería
 * más interesante de leer y dejaría un hueco mudo: `historialPrecio()` calcula «subió/bajó»
 * comparando entradas consecutivas, y una serie con agujeros no avisa de que le faltan tramos.
 */
export const TOPE_HISTORIAL_PRECIO = 10;

/**
 * El historial de precio DESPUÉS de esta edición (§305).
 *
 * 🔴 POR QUÉ EXISTE. `Propiedad.priceHistory` estaba declarado desde Ola 0, la ficha lo pinta y
 * `historialPrecio()` lo lee con sus pruebas… y **nadie lo escribía nunca**: el comentario del campo
 * llegó a decir «la Function que escribe lo poda», nombrando algo que no existía. La sección de
 * historial de la ficha —uno de los diferenciales declarados del portal, «transparencia radical de
 * precios»— iba a estar vacía para siempre. Y encima `guardarEdicion` escribe el documento COMPLETO
 * (`tx.set` sin merge), así que aunque alguien lo hubiera llenado, la siguiente edición lo borraba:
 * es el mismo mecanismo que se llevó por delante el sello de verificación en §263.
 *
 * 🎯 LO ESCRIBE EL SERVIDOR, DERIVÁNDOLO DEL CAMBIO REAL. No viaja en `EntradaAlta` y no debe:
 * *un historial que el interesado puede redactar no es un historial* (§151). Se compara el precio de
 * display anterior con el nuevo y solo eso decide si hay entrada.
 *
 * ⚠️ **Una edición que NO toca el precio no añade nada.** Corregir una errata del título no es un
 * cambio de precio, y sin esta condición la ficha acabaría enseñando catorce filas idénticas y un
 * inmueble parecería volátil por culpa de las comas que le arreglaron.
 */
export function historialActualizado(opciones: {
  anterior?: readonly PriceHistoryEntry[];
  precioNuevo: COP | null;
  /** ¿La serie previa sigue siendo comparable? `false` cuando cambió la OPERACIÓN (ver abajo). */
  comparable: boolean;
  ahora: Date;
}): PriceHistoryEntry[] {
  /*
   * ⚠️ NO recibe el «precio anterior». La primera versión lo pedía y no lo miraba: el precio anterior
   * ES la última entrada de la serie, por construcción. Un parámetro que nadie lee miente sobre lo
   * que la función necesita y, peor, invita a pasarle un valor calculado de otra forma — el día que
   * los dos discrepen, gana el que no se usa y nadie entiende por qué.
   */
  const { anterior, precioNuevo, comparable, ahora } = opciones;
  const previo = (anterior ?? []).filter((e) => e && typeof e.valor === 'number' && Number.isFinite(Date.parse(e.fecha)));

  // Sin precio nuevo no hay nada que anotar; el inmueble además no es publicable (`sin-precio`).
  if (precioNuevo == null) return [...previo];

  const entrada: PriceHistoryEntry = { fecha: ahora.toISOString(), valor: precioNuevo };

  /*
   * 🎯 CAMBIÓ LA OPERACIÓN ⇒ SERIE NUEVA. Un inmueble que pasa de venta a arriendo no «bajó de
   * $600.000.000 a $3.500.000»: son dos productos distintos con dos precios que no se comparan. Dejar
   * la serie anterior pintaría la caída más espectacular del portal, y sería mentira. Es el mismo
   * error que evita `numeroDeDinero` frente a `numeroDecimal`: dos dominios bajo un mismo tipo.
   */
  if (!comparable || !previo.length) return [entrada];

  // Mismo precio ⇒ no hubo cambio de precio, hubo una edición. No se anota.
  if (previo[previo.length - 1].valor === precioNuevo) return [...previo];

  return [...previo, entrada].slice(-TOPE_HISTORIAL_PRECIO);
}

export interface BaseEdicion {
  id: string;
  /** CONGELADO. Regenerarlo cambiaría la URL pública de un inmueble ya indexado. */
  slug: string;
  createdAt: string;
  /**
   * El PRECIO y el HISTORIAL que ya tenía el documento. Viajan por la misma razón que el sello de
   * §263: la edición reescribe el documento entero, así que lo que no se le pase se pierde en
   * silencio — y aquí «en silencio» significa que el historial de precios se vacía solo.
   */
  priceHistory?: PriceHistoryEntry[];
  /**
   * La OPERACIÓN que tenía. Decide si la serie de precios sigue siendo comparable: pasar de venta a
   * arriendo no es una bajada de precio, es otro producto. Ausente ⇒ se trata como no comparable, que
   * es el lado conservador (serie nueva, nunca una caída inventada).
   */
  operacion?: Operacion;
  /**
   * La última CONFIRMACIÓN de vigencia (§306). Va por la misma puerta que el sello y el historial, y
   * por la misma razón: el documento se reescribe entero. ⚠️ Se CONSERVA tal cual, nunca se renueva
   * al editar — confirmar es un acto deliberado, y estamparlo al guardar haría que corregir una
   * errata le dijera a un comprador «Confirmada hoy».
   */
  ultimaConfirmacion?: ISODate;
  /** El `_version` que se leyó al abrir. Es el testigo del control de concurrencia. */
  version: number;
  /**
   * El sello «Verificado por ALTORRA» que YA tenía. No viaja en el formulario —se pone aparte, con
   * `merge: true`— y la edición reemplaza el documento entero, así que sin esto desaparecía en
   * silencio en cada guardado (§263).
   */
  verificadoAltorra?: true;
  verificadoEn?: string;
  /**
   * La declaración de PH que YA tenía. Se conserva para no rejuvenecer su fecha: `declaradaEn` vale
   * como evidencia precisamente por decir CUÁNDO se afirmó, y corregir una errata del título no es
   * volver a afirmarlo. Si el operador CAMBIA la situación, entonces sí es una declaración nueva y
   * la fecha se renueva.
   */
  autorizacionPH?: AutorizacionPH;
}

/**
 * Formulario → documento ACTUALIZADO.
 *
 * Reutiliza toda la validación del alta y luego impone lo que no le toca decidir a una edición:
 *
 * · **El `slug` NO se regenera.** Es la URL pública. Recalcularlo cada vez que alguien corrige una
 *   errata del título —que es justo lo que hace el panel viejo— rompe el enlace que ya está en Google,
 *   en WhatsApp y en el correo que alguien mandó. Se congela al crear y se queda.
 * · **`createdAt` es del alta**, no de la última edición. Si se pisara, la «frescura» del inmueble se
 *   rejuvenecería sola cada vez que se toca un precio.
 * · **`_version` sube exactamente uno**, que es lo que espera la regla `versionValida()` del ruleset.
 */
export function construirEdicion(entrada: EntradaAlta, base: BaseEdicion, ahora: Date): ResultadoAlta {
  const r = construirPropiedad(entrada, { codigo: base.id, ahora });
  if (!r.ok) return r;
  const propiedad: Propiedad = {
    ...r.propiedad,
    slug: base.slug || r.propiedad.slug,
    createdAt: base.createdAt || r.propiedad.createdAt,
    _version: base.version + 1,
  };
  // Misma situación declarada que antes ⇒ misma declaración, misma fecha. Solo cambia si cambió.
  const previa = base.autorizacionPH;
  if (previa && propiedad.autorizacionPH && previa.situacion === propiedad.autorizacionPH.situacion) {
    propiedad.autorizacionPH = { ...propiedad.autorizacionPH, ...previa };
  }

  /*
   * 🔴 EL SELLO SOBREVIVÍA A NADA (§263). `guardarEdicion` escribe el documento COMPLETO —`tx.set`
   * sin `merge`— y el sello se pone por separado con `merge: true`, así que no venía del formulario
   * y desaparecía en cada edición. En SILENCIO: nadie lo veía irse, y la insignia «Verificado por
   * ALTORRA» simplemente dejaba de salir en la ficha.
   *
   * Se conserva, pero NO a ciegas: solo mientras el inmueble editado siga cumpliendo lo que el
   * sello exigía (publicable, fotos suficientes, área). Si la edición se lleva por delante uno de
   * esos requisitos, el sello cae — que es lo correcto: certificaba justo eso. Así el sello no
   * miente ni se pierde por accidente.
   */
  if (base.verificadoAltorra && reparosParaSellar(propiedad).length === 0) {
    propiedad.verificadoAltorra = true;
    if (base.verificadoEn) propiedad.verificadoEn = base.verificadoEn;
  }

  /*
   * 💲 EL HISTORIAL DE PRECIO (§305). `construirPropiedad` acaba de sembrar una serie NUEVA con el
   * precio del formulario —correcto al crear, destructivo al editar—, así que aquí se sustituye por
   * la serie real: la que ya tenía más la entrada de este cambio, si es que lo hubo.
   *
   * `comparable` es falso cuando cambió la OPERACIÓN: venta y arriendo no comparten escala de precio
   * y encadenarlas pintaría una caída espectacular que nunca ocurrió.
   */
  propiedad.priceHistory = historialActualizado({
    anterior: base.priceHistory,
    precioNuevo: precioDisplay(propiedad),
    comparable: base.operacion === propiedad.operacion,
    ahora,
  });
  if (!propiedad.priceHistory.length) delete propiedad.priceHistory;

  // 🕘 La confirmación de vigencia SOBREVIVE a la edición, sin renovarse (§306). Renovarla aquí
  // convertiría cualquier guardado en un «Confirmada hoy» delante de un comprador.
  if (base.ultimaConfirmacion) propiedad.ultimaConfirmacion = base.ultimaConfirmacion;

  return { ok: true, propiedad };
}

/** Lo que se guarda al abrir el formulario para poder editar sin inventar nada. */
export function baseDe(p: Propiedad): BaseEdicion {
  return {
    id: p.id,
    slug: p.slug ?? '',
    createdAt: p.createdAt,
    version: typeof p._version === 'number' ? p._version : 0,
    // 💲 §305: sin estos dos, cada edición vaciaba el historial de precio — el documento se reescribe
    // ENTERO, así que lo que no pase por aquí desaparece. Mismo mecanismo que se llevó el sello (§263).
    operacion: p.operacion,
    ...(p.priceHistory?.length ? { priceHistory: p.priceHistory } : {}),
    ...(p.ultimaConfirmacion ? { ultimaConfirmacion: p.ultimaConfirmacion } : {}),
    ...(p.autorizacionPH ? { autorizacionPH: p.autorizacionPH } : {}),
    ...(p.verificadoAltorra ? { verificadoAltorra: true as const, verificadoEn: p.verificadoEn } : {}),
  };
}

/**
 * Documento existente → valores del formulario. El camino inverso de `construirPropiedad`.
 *
 * Los números se devuelven como TEXTO, que es lo que un `<input>` sabe recibir, y un campo ausente
 * vuelve como cadena vacía en vez de «undefined»: el formulario no debe enseñar la palabra undefined
 * jamás, y un 0 escrito ahí sería inventarse un dato que nadie puso.
 */
export function entradaDe(p: Propiedad): EntradaAlta {
  const n = (v: number | undefined) => (v == null ? '' : String(v));
  return {
    operacion: p.operacion ?? '',
    tipo: p.tipo ?? '',
    vertical: p.vertical ?? '',
    estado: p.estado ?? '',
    titulo: p.titulo ?? '',
    descripcion: p.descripcion ?? '',
    ciudad: p.geo?.ciudad ?? '',
    zona: p.geo?.zona ?? '',
    barrio: p.geo?.barrio ?? '',
    lat: n(p.geo?.lat),
    lng: n(p.geo?.lng),
    rnt: p.rnt ?? '',
    // Sin esta línea, editar el precio de un alojamiento borraba la declaración de PH y el guardado
    // fallaba pidiendo un dato que el inmueble YA tenía.
    situacionPH: p.autorizacionPH?.situacion ?? '',
    valorVenta: n(p.precio?.valorVenta),
    canon: n(p.precio?.canon),
    administracion: n(p.precio?.administracion),
    precioNoche: n(p.precio?.precioNoche),
    habitaciones: n(p.specs?.habitaciones),
    banos: n(p.specs?.banos),
    areaConstruidaM2: n(p.specs?.areaConstruidaM2),
    estrato: n(p.specs?.estrato),
    parqueaderos: n(p.specs?.parqueaderos),
    piso: n(p.specs?.piso),
    pisosTotales: n(p.specs?.pisosTotales),
    imagenes: [...(p.imagenes ?? [])],
    amenidades: { ...(p.amenidades ?? {}) },
  };
}

/** El precio depende de la operación, y solo se guarda el campo que le corresponde. */
function precioDeEntrada(
  operacion: Operacion,
  e: EntradaAlta,
  err: (campo: string, mensaje: string) => void,
): Precio {
  const precio: Precio = { moneda: 'COP' };
  if (operacion === 'venta') {
    const v = numeroCop(e.valorVenta);
    if (!v || v <= 0) err('valorVenta', 'El valor de venta es obligatorio.');
    else precio.valorVenta = v;
  } else if (operacion === 'arriendo') {
    const c = numeroCop(e.canon);
    if (!c || c <= 0) err('canon', 'El canon mensual es obligatorio.');
    else precio.canon = c;
    const a = numeroCop(e.administracion);
    // La administración va SEPARADA del canon a propósito: juntarlas es la queja clásica del
    // arrendatario y la doctrina de voz del proyecto lo exige desglosado.
    if (a != null && a > 0) precio.administracion = a;
  } else if (operacion === 'alojamiento') {
    const n = numeroCop(e.precioNoche);
    if (!n || n <= 0) err('precioNoche', 'El precio por noche es obligatorio.');
    else precio.precioNoche = n;
  }
  return precio;
}
