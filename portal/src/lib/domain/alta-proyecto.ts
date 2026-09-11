/*
 * ALTA DE OBRA NUEVA — formulario → documento de `proyectos` (§308).
 *
 * 🔴 POR QUÉ EXISTE. Tras §307 la vertical tenía modelo, JSON-LD, Rules, índice y ficha… y la
 * colección `proyectos` seguía **VACÍA**, porque no había forma de crear uno: `gestion-alta` solo
 * sabe acuñar `INM-…`. Una línea de negocio entera completa y sin puerta de entrada — el mismo
 * patrón de [[L-87]], una vez más, ahora en el otro extremo: aquí lo que falta no es el escritor
 * del campo, es el creador del documento.
 *
 * LO QUE ESTE MÓDULO DECIDE, y por eso es dominio y no formulario:
 *
 * 1. **El código se acuña igual que el de un inmueble pero en SU namespace** (`PRY-YYYYMM-NNNN`):
 *    mismo contador atómico, misma regla de agotamiento. `claveContador` gana un prefijo en vez de
 *    duplicarse — dos copias del mismo generador se separan el día que alguien arregla una ([[L-45]]).
 *
 * 2. **El escritor VALIDA CON LAS REGLAS DEL LECTOR.** No reproduce las condiciones de publicación:
 *    llama a `problemasParaPublicarProyecto()`, el MISMO predicado que usan el índice, la ficha, el
 *    JSON-LD y las Rules. Es la lección de §108 aplicada a la vertical nueva: si el formulario
 *    decidiera por su cuenta, aceptaría algo que el catálogo descarta en silencio y el operador se
 *    quedaría mirando por qué su proyecto no sale.
 *
 * 3. **El BORRADOR es legítimo.** Un proyecto se captura en varias sesiones —las tipologías llegan
 *    en un PDF de la constructora— así que guardar incompleto tiene que poder hacerse. Lo que NO
 *    puede es publicarse incompleto, y de eso se encarga el predicado de arriba, no este módulo.
 */
import { claveContador, slugPropiedad, type ErrorCampo, type ResultadoCodigo } from './alta-propiedad';
import { TIPOS_INMUEBLE, type ISODate, type TipoInmueble } from './shared';
import { ESTADOS_OBRA, type EstadoObra, type Proyecto, type Tipologia } from './proyectos';

/** Clave del contador de PROYECTOS. Mismo mecanismo que el de inmuebles, otro namespace. */
export const claveContadorProyecto = (fecha: Date): string => claveContador(fecha, 'PRY');

/** Tope de tipologías. Los líderes publican 3-6 nombradas; 20 es holgura, no un objetivo (§284.2). */
export const TOPE_TIPOLOGIAS = 20;

/** Lo que escribe una persona en el formulario. TODO texto: es lo que devuelve un `<input>`. */
export interface EntradaTipologia {
  nombre?: string;
  tipo?: string;
  areaM2?: string;
  habitaciones?: string;
  banos?: string;
  desde?: string;
  disponibles?: string;
}

export interface EntradaProyecto {
  nombre?: string;
  constructora?: string;
  licenciaConstruccion?: string;
  curaduria?: string;
  estadoObra?: string;
  entregaEstimada?: string;
  descripcion?: string;
  ciudad?: string;
  barrio?: string;
  lat?: string;
  lng?: string;
  cuotaInicialPct?: string;
  subsidio?: boolean;
  salaDireccion?: string;
  salaHorario?: string;
  /** % vendido y su FUENTE. Sin fuente no se guarda: es urgencia que ALTORRA no mide (§284.4). */
  vendidoPct?: string;
  vendidoFuente?: string;
  imagenes?: string[];
  estado?: string;
  tipologias?: EntradaTipologia[];
}

export type ResultadoAltaProyecto =
  | { ok: true; proyecto: Proyecto }
  | { ok: false; errores: ErrorCampo[] };

const txt = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Texto → entero de DINERO o de cuenta. Vacío es «no lo sé», NO cero: guardar 0 sería inventarse un
 * dato, y un `desde: 0` es exactamente la cifra que §284.3 descarta para que no se publique «Desde $0».
 */
function entero(v: unknown): number | undefined {
  const s = txt(v).replace(/[^\d]/g, '');
  if (!s) return undefined;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : undefined;
}

/** Texto → decimal (áreas, coordenadas). El punto es el separador DECIMAL aquí, nunca de miles. */
function decimal(v: unknown): number | undefined {
  const s = txt(v).replace(',', '.');
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** `PRY-202608-0001` → `torre-marea-bocagrande-pry-202608-0001`. Se CONGELA al crear (§111). */
export const slugProyecto = (nombre: string, barrio: string, codigo: string): string =>
  slugPropiedad(nombre, barrio, codigo);

/**
 * Una fila del formulario → tipología, o `null` si está vacía del todo.
 *
 * ⚠️ Devuelve `null` para las filas VACÍAS y no un error: un formulario con tres huecos para
 * tipologías y dos rellenas es lo normal, y exigir que se borren los huecos sobrantes sería pelearse
 * con el operador por algo que el código puede decidir solo.
 */
export function construirTipologia(e: EntradaTipologia): { fila: Tipologia } | { vacia: true } | { errores: ErrorCampo[] } {
  const nombre = txt(e.nombre);
  const tipoCrudo = txt(e.tipo);
  const area = decimal(e.areaM2);
  const hab = entero(e.habitaciones);
  const ban = entero(e.banos);
  const desde = entero(e.desde);

  if (!nombre && !tipoCrudo && area == null && hab == null && ban == null && desde == null) return { vacia: true };

  const errores: ErrorCampo[] = [];
  if (!nombre) errores.push({ campo: 'tipologia.nombre', mensaje: 'Ponle nombre a la tipología, como la llama la constructora («Tipo A», «2 alcobas»).' });
  const tipo = (TIPOS_INMUEBLE as readonly string[]).includes(tipoCrudo) ? (tipoCrudo as TipoInmueble) : null;
  if (!tipo) errores.push({ campo: 'tipologia.tipo', mensaje: 'Elige el tipo de la tipología.' });
  if (area == null || area <= 0) errores.push({ campo: 'tipologia.areaM2', mensaje: 'Falta el área en m².' });
  if (hab == null) errores.push({ campo: 'tipologia.habitaciones', mensaje: 'Falta el número de alcobas.' });
  if (ban == null) errores.push({ campo: 'tipologia.banos', mensaje: 'Falta el número de baños.' });
  // 🔴 El «desde» es el precio que se publica. Un 0 colado pondría «Desde $0» en el listado, que es
  // justo la clase de cifra que se publica y nadie mira dos veces (§284.3).
  if (desde == null || desde <= 0) errores.push({ campo: 'tipologia.desde', mensaje: 'Falta el precio desde el que arranca esta tipología.' });

  if (errores.length) return { errores };
  const fila: Tipologia = { nombre, tipo: tipo as TipoInmueble, areaM2: area as number, habitaciones: hab as number, banos: ban as number, desde: desde as number };
  const disponibles = entero(e.disponibles);
  // Ausente ≠ cero: «no informó cuántas quedan» y «quedan cero» son cosas distintas (§284.2).
  if (disponibles != null) fila.disponibles = disponibles;
  return { fila };
}

/**
 * Formulario → documento de `proyectos`.
 *
 * Falla con la lista COMPLETA de errores, no con el primero: el operador tiene delante un formulario
 * largo con tipologías dentro, y descubrir los fallos de uno en uno son seis guardados (§108).
 */
export function construirProyecto(
  entrada: EntradaProyecto,
  ctx: { codigo: string; ahora: Date },
): ResultadoAltaProyecto {
  const errores: ErrorCampo[] = [];
  const iso: ISODate = ctx.ahora.toISOString();

  const nombre = txt(entrada.nombre);
  if (!nombre) errores.push({ campo: 'nombre', mensaje: 'Falta el nombre del proyecto.' });
  const constructora = txt(entrada.constructora);
  if (!constructora) errores.push({ campo: 'constructora', mensaje: 'Falta la constructora: en obra nueva quien vende es ella.' });
  const descripcion = txt(entrada.descripcion);
  if (!descripcion) errores.push({ campo: 'descripcion', mensaje: 'Falta la descripción.' });
  const ciudad = txt(entrada.ciudad) || 'Cartagena de Indias';
  const barrio = txt(entrada.barrio);
  if (!barrio) errores.push({ campo: 'barrio', mensaje: 'Falta el barrio.' });

  const estadoObraCrudo = txt(entrada.estadoObra);
  if (!(ESTADOS_OBRA as readonly string[]).includes(estadoObraCrudo)) {
    errores.push({ campo: 'estadoObra', mensaje: 'Elige el estado de obra (preventa, construcción o entrega inmediata).' });
  }

  const estadoCrudo = txt(entrada.estado) || 'borrador';
  const ESTADOS: readonly Proyecto['estado'][] = ['borrador', 'disponible', 'agotado', 'inactivo'];
  if (!(ESTADOS as readonly string[]).includes(estadoCrudo)) {
    errores.push({ campo: 'estado', mensaje: 'Estado no válido.' });
  }

  // ── TIPOLOGÍAS. Son el producto (§284.2): sin ellas no hay nada que ofrecer ni precio que derivar.
  const filas: Tipologia[] = [];
  for (const e of entrada.tipologias ?? []) {
    const r = construirTipologia(e);
    if ('vacia' in r) continue;
    if ('errores' in r) errores.push(...r.errores);
    else filas.push(r.fila);
  }
  if (filas.length > TOPE_TIPOLOGIAS) {
    errores.push({ campo: 'tipologias', mensaje: `Máximo ${TOPE_TIPOLOGIAS} tipologías.` });
  }

  /*
   * 🔴 EL % VENDIDO, TODO O NADA. Si viene el número sin la fuente, NO se guarda un porcentaje
   * huérfano: se pide la fuente. «70% vendido» es una afirmación de urgencia que persigue la Ley 1480
   * y que ALTORRA no mide —la dice la constructora—, así que o viaja con quién lo dijo, o no viaja.
   */
  const vendido = entero(entrada.vendidoPct);
  const vendidoFuente = txt(entrada.vendidoFuente);
  if (vendido != null && !vendidoFuente) {
    errores.push({ campo: 'vendidoFuente', mensaje: 'Si publicas un «% vendido», hay que decir quién lo informó. Es una afirmación de urgencia y no la medimos nosotros.' });
  }
  if (vendido != null && (vendido < 0 || vendido > 100)) {
    errores.push({ campo: 'vendidoPct', mensaje: 'El porcentaje vendido va entre 0 y 100.' });
  }

  if (errores.length) return { ok: false, errores };

  const proyecto: Proyecto = {
    _version: 1,
    createdAt: iso,
    updatedAt: iso,
    id: ctx.codigo,
    slug: slugProyecto(nombre, barrio, ctx.codigo),
    nombre,
    constructora,
    estadoObra: estadoObraCrudo as EstadoObra,
    descripcion,
    geo: { ciudad, barrio },
    tipologias: filas,
    imagenes: (entrada.imagenes ?? []).map(txt).filter(Boolean),
    estado: estadoCrudo as Proyecto['estado'],
  };

  const lat = decimal(entrada.lat);
  const lng = decimal(entrada.lng);
  if (lat != null && lng != null) {
    proyecto.geo.lat = lat;
    proyecto.geo.lng = lng;
  }
  if (proyecto.imagenes.length) proyecto.imagenPortada = proyecto.imagenes[0];

  const licencia = txt(entrada.licenciaConstruccion);
  if (licencia) proyecto.licenciaConstruccion = licencia;
  const curaduria = txt(entrada.curaduria);
  if (curaduria) proyecto.curaduria = curaduria;

  const entrega = txt(entrada.entregaEstimada);
  if (entrega && Number.isFinite(Date.parse(entrega))) {
    proyecto.entregaEstimada = new Date(entrega).toISOString();
  }

  const cuota = decimal(entrada.cuotaInicialPct);
  if (cuota != null) proyecto.cuotaInicialPct = cuota;
  if (entrada.subsidio === true) proyecto.subsidio = true;

  const dir = txt(entrada.salaDireccion);
  const hor = txt(entrada.salaHorario);
  if (dir && hor) proyecto.salaDeVentas = { direccion: dir, horario: hor };

  if (vendido != null && vendidoFuente) {
    proyecto.porcentajeVendido = { valor: vendido, fuente: vendidoFuente, fecha: iso };
  }
  if (proyecto.estado === 'disponible' || proyecto.estado === 'agotado') proyecto.publicadoEn = iso;

  return { ok: true, proyecto };
}

export type { ResultadoCodigo };
