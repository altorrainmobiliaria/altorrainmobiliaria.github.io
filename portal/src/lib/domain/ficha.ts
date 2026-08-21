/*
 * FICHA DE INMUEBLE — modelo de VISTA (lógica pura, sin Astro y sin red).
 *
 * QUÉ RESUELVE: la ficha es la única página del portal donde el diseño pide MÁS de lo que el modelo de
 * datos tiene. El ADR §60 lo inventarió campo por campo y encontró 4 bloques sin fuente. La tentación
 * —rellenarlos con los valores de la maqueta— es exactamente el error que más caro ha salido en este
 * proyecto: contenido inventado que se ve legítimo (L-29). Aquí vive la regla contraria, aplicada una
 * vez y en un solo sitio:
 *
 *   **UN BLOQUE SIN DATO SE OMITE. JAMÁS HEREDA EL VALOR DEL DEMO.**
 *
 * Por eso casi todas estas funciones devuelven listas que pueden venir VACÍAS o `null`, y la plantilla
 * decide no pintar la sección. Un `?? '—'` en cualquiera de ellas rompería el contrato entero.
 *
 * LOS 4 BLOQUES SIN FUENTE, y qué se hace con cada uno (§60.2/.3):
 *  (a) **Dirección exacta** → NO se pinta NUNCA. No es que falte el dato: está PROHIBIDO en el
 *      documento público (es PII y riesgo de seguridad; vive en `captaciones`). Se muestra barrio y
 *      ciudad, que es lo que un portal serio publica.
 *  (b) **Financiación** («Desde $7.9M/mes») → se OMITE. No está modelada y además es una afirmación
 *      financiera sobre un crédito: eso tiene carril legal propio y no se improvisa.
 *  (c) **Asesor con nombre** → no existe en el modelo. Default honesto de §60.3: bloque genérico del
 *      equipo con el WhatsApp REAL del negocio. Inventar «María Restrepo» sería inventar una persona.
 *  (d) **POIs con minutos** → se OMITEN. Requieren una fuente de tiempos de viaje, que es un costo
 *      recurrente; los del demo eran ilustrativos.
 */

import type { COP, ISODate, Operacion, TipoInmueble } from './shared';
import type { Propiedad } from './propiedades';
import type { CatalogoResumen } from './catalogo';
import { operacionAShard } from './catalogo';

// ─────────────────────────────────────────────────────────────────────────────
// FORMATO
// ─────────────────────────────────────────────────────────────────────────────

const NF = new Intl.NumberFormat('es-CO');
const COP_FMT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const pesos = (v: COP): string => COP_FMT.format(v);

/** Sufijo del precio según la operación. Pintar un canon mensual sin «/mes» lo convierte en otra cosa. */
export const sufijoPrecio = (op: Operacion): string =>
  op === 'arriendo' ? ' / mes' : op === 'alojamiento' ? ' / noche' : '';

export const etiquetaBadge = (op: Operacion): string =>
  op === 'venta' ? 'En venta' : op === 'arriendo' ? 'Arriendo' : 'Corta estancia';

export const rutaOperacion = (op: Operacion): string =>
  op === 'venta' ? '/comprar' : op === 'arriendo' ? '/arrendar' : '/estancias';

export const etiquetaOperacionRuta = (op: Operacion): string =>
  op === 'venta' ? 'Comprar' : op === 'arriendo' ? 'Arrendar' : 'Estancias';

const TIPO_LABEL: Record<TipoInmueble, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  apartaestudio: 'Apartaestudio',
  local: 'Local',
  oficina: 'Oficina',
  bodega: 'Bodega',
  lote: 'Lote',
  finca: 'Finca',
  casa_lote: 'Casa lote',
  consultorio: 'Consultorio',
  edificio: 'Edificio',
  otro: 'Inmueble',
};
export const etiquetaTipo = (t: TipoInmueble): string => TIPO_LABEL[t] ?? 'Inmueble';

// ─────────────────────────────────────────────────────────────────────────────
// PRECIO — el bloque donde una etiqueta equivocada cambia el significado del número
// ─────────────────────────────────────────────────────────────────────────────

export interface PrecioFicha {
  etiqueta: string;
  valor: string;
  /** Línea secundaria REAL (precio por m², administración). Vacía si no hay nada que decir. */
  sub: string;
}

/**
 * Precio de display. Devuelve `null` si la propiedad no tiene precio para su operación: una ficha sin
 * precio se publica sin el bloque, nunca con un cero ni con un «Consultar» que nadie escribió.
 *
 * El $/m² se calcula SOLO si existen las dos cifras; y solo en venta, porque un «precio por metro» de
 * un canon mensual no significa nada para un arrendatario.
 */
export function precioFicha(p: Propiedad): PrecioFicha | null {
  const op = p.operacion;
  const valor = op === 'venta' ? p.precio?.valorVenta : op === 'arriendo' ? p.precio?.canon : p.precio?.precioNoche;
  if (valor == null) return null;

  const etiqueta = op === 'venta' ? 'Precio de venta' : op === 'arriendo' ? 'Canon mensual' : 'Precio por noche';

  const partes: string[] = [];
  const area = p.specs?.areaConstruidaM2 ?? p.specs?.areaPrivadaM2;
  if (op === 'venta' && area && area > 0) partes.push(`${pesos(Math.round(valor / area))} / m²`);
  if (op === 'arriendo') {
    // DOBLE-PRECIO: el diferenciador de transparencia del plan. Los TRES casos se dicen, incluido el
    // incómodo. Si la administración va aparte y no sabemos cuánto es, CALLARLO hace que el visitante
    // asuma que está incluida y descubra el sobrecosto al firmar: eso es «drip pricing» y en Colombia
    // lo persigue el Estatuto del Consumidor (Ley 1480 art. 26, precio total desde el principio).
    if (p.precio?.adminIncluidaEnCanon) partes.push('Administración incluida');
    else if (p.precio?.administracion != null) partes.push(`+ administración ${pesos(p.precio.administracion)}`);
    else partes.push('Administración aparte (consúltala)');
  }
  if (op === 'alojamiento' && p.precio?.precioAseo != null) {
    partes.push(`Aseo ${pesos(p.precio.precioAseo)} por estadía`);
  }

  return { etiqueta, valor: `${pesos(valor)}${sufijoPrecio(op)}`, sub: partes.join(' · ') };
}

/** Valor numérico del precio para la operación (JSON-LD y comparaciones). `null` si no hay. */
export function valorPrecio(p: Propiedad): COP | null {
  if (p.operacion === 'venta') return p.precio?.valorVenta ?? null;
  if (p.operacion === 'arriendo') return p.precio?.canon ?? null;
  return p.precio?.precioNoche ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECS Y FICHA TÉCNICA — solo lo que existe
// ─────────────────────────────────────────────────────────────────────────────

/** Clave del icono en la plantilla. La plantilla es dueña del SVG; aquí solo se nombra cuál va. */
export type IconoSpec = 'hab' | 'bano' | 'area' | 'parqueadero' | 'estrato' | 'anio' | 'piso';

export interface SpecVisible {
  icono: IconoSpec;
  valor: string;
  etiqueta: string;
}

/**
 * Specs destacadas. El demo pintaba SEIS siempre; aquí salen las que tengan dato y en el mismo orden.
 * Una propiedad con 3 specs muestra 3: la rejilla se adapta y nadie ve una casilla vacía.
 */
export function specsVisibles(p: Propiedad): SpecVisible[] {
  const s = p.specs ?? {};
  const out: SpecVisible[] = [];
  if (s.habitaciones != null) {
    out.push({ icono: 'hab', valor: String(s.habitaciones), etiqueta: s.habitaciones === 1 ? 'Habitación' : 'Habitaciones' });
  }
  if (s.banos != null) out.push({ icono: 'bano', valor: String(s.banos), etiqueta: s.banos === 1 ? 'Baño' : 'Baños' });
  // El rótulo SIGUE al campo que se usó. Rotular «Construidos» un área PRIVADA publica un dato falso
  // sobre el que un comprador decide, y además el índice del catálogo hace ese mismo fallback rotulado
  // como construidos (`catalogo.ts`), así que copiarlo a ciegas propagaba el error a la ficha.
  if (s.areaConstruidaM2 != null) {
    out.push({ icono: 'area', valor: `${NF.format(s.areaConstruidaM2)} m²`, etiqueta: 'Construidos' });
  } else if (s.areaPrivadaM2 != null) {
    out.push({ icono: 'area', valor: `${NF.format(s.areaPrivadaM2)} m²`, etiqueta: 'Privados' });
  }
  if (s.parqueaderos != null) {
    out.push({ icono: 'parqueadero', valor: String(s.parqueaderos), etiqueta: s.parqueaderos === 1 ? 'Parqueadero' : 'Parqueaderos' });
  }
  if (s.estrato != null) out.push({ icono: 'estrato', valor: String(s.estrato), etiqueta: 'Estrato' });
  if (s.antiguedadAnios != null) {
    out.push({
      icono: 'anio',
      valor: s.antiguedadAnios === 0 ? 'Nuevo' : String(s.antiguedadAnios),
      etiqueta: s.antiguedadAnios === 0 ? 'Estreno' : s.antiguedadAnios === 1 ? 'Año' : 'Años',
    });
  }
  return out;
}

/** Filas de la ficha técnica. Mismo criterio: fila sin dato, fila que no existe. */
export function fichaTecnica(p: Propiedad): Array<[string, string]> {
  const s = p.specs ?? {};
  const filas: Array<[string, string]> = [];
  filas.push(['Tipo', etiquetaTipo(p.tipo)]);
  if (s.piso != null) filas.push(['Piso', String(s.piso)]);
  if (s.areaPrivadaM2 != null) filas.push(['Área privada', `${NF.format(s.areaPrivadaM2)} m²`]);
  if (s.areaConstruidaM2 != null) filas.push(['Área construida', `${NF.format(s.areaConstruidaM2)} m²`]);
  if (s.banosSociales != null) filas.push(['Baños sociales', String(s.banosSociales)]);
  if (s.tipoParqueadero && s.tipoParqueadero !== 'ninguno') {
    const t = { cubierto: 'Cubierto', descubierto: 'Descubierto', comunal: 'Comunal' } as Record<string, string>;
    filas.push(['Parqueadero', t[s.tipoParqueadero] ?? s.tipoParqueadero]);
  }
  if (s.cuartoUtil) filas.push(['Cuarto útil', 'Sí']);
  if (p.precio?.administracion != null) {
    // Si va INCLUIDA en el canon, la fila lo dice. Antes el aside decía «Administración incluida» y
    // esta fila, tres secciones más abajo, decía «Administración $1.200.000 / mes»: la misma página
    // afirmando dos cosas distintas sobre lo que hay que pagar cada mes.
    const nota = p.precio.adminIncluidaEnCanon ? ' (incluida en el canon)' : ' / mes';
    filas.push(['Administración', `${pesos(p.precio.administracion)}${nota}`]);
  }
  if (s.estrato != null) filas.push(['Estrato', String(s.estrato)]);
  if (p.codigoLegacy) filas.push(['Código', p.codigoLegacy]);
  // RNT: OBLIGATORIO y visible en alojamiento (gate B3). Si la propiedad es turística y NO lo trae, la
  // fila no se inventa: el hueco es la señal de que esa publicación no debería estar viva.
  if (p.operacion === 'alojamiento' && p.rnt) filas.push(['RNT', p.rnt]);
  return filas;
}

// ─────────────────────────────────────────────────────────────────────────────
// AMENIDADES — vocabulario REAL del proyecto, más un humanizador para lo que no conozca
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Etiquetas de las amenidades que el modelo usa hoy (las mismas 12 del seed, que es el único sitio
 * donde el vocabulario está escrito). Una clave desconocida NO se descarta: se humaniza y se muestra,
 * porque el dato lo puso una persona y esconderlo sería perder inventario real.
 */
const AMENIDAD_LABEL: Record<string, string> = {
  piscina: 'Piscina',
  gimnasio: 'Gimnasio',
  ascensor: 'Ascensor',
  porteria24h: 'Portería 24 horas',
  balcon: 'Balcón',
  aireAcondicionado: 'Aire acondicionado',
  vistaAlMar: 'Vista al mar',
  cocinaIntegral: 'Cocina integral',
  zonaBBQ: 'Zona BBQ',
  jacuzzi: 'Jacuzzi',
  terraza: 'Terraza',
  parqueaderoVisitantes: 'Parqueadero de visitantes',
};

/** `vistaAlMar` → «Vista al mar». Separa camelCase y pone mayúscula inicial. */
export function humanizarAmenidad(clave: string): string {
  const txt = clave
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return txt ? txt[0].toUpperCase() + txt.slice(1) : clave;
}

/**
 * Amenidades a mostrar. SOLO las marcadas `true`: en este modelo `false` significa «no la tiene», y
 * pintarla sería justo lo contrario de lo que dice el dato.
 */
export function amenidadesVisibles(p: Propiedad): string[] {
  const marcadas = Object.entries(p.amenidades ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => AMENIDAD_LABEL[k] ?? humanizarAmenidad(k));
  const otras = (p.otrasAmenidades ?? []).map((s) => String(s).trim()).filter(Boolean);
  return [...new Set([...marcadas, ...otras])];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIANZA — frescura e historial, que es lo que un portal serio enseña y los demás esconden
// ─────────────────────────────────────────────────────────────────────────────

/**
 * «Confirmada hace N días». Devuelve `null` si nunca se confirmó: no se rellena con la fecha de
 * creación, que respondería otra pregunta (cuándo se publicó, no cuándo se verificó que sigue viva).
 */
export function frescuraTexto(p: Propiedad, ahora: Date = new Date()): string | null {
  const iso = p.ultimaConfirmacion;
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const dias = Math.floor((ahora.getTime() - t) / 86_400_000);
  if (dias < 0) return null;
  if (dias === 0) return 'Confirmada hoy';
  if (dias === 1) return 'Confirmada ayer';
  if (dias < 31) return `Confirmada hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'Confirmada hace un mes' : `Confirmada hace ${meses} meses`;
}

/** `2026-05-01` → «mayo de 2026». Una fecha ISO en pantalla se lee como un dato de sistema, no como
 *  información para una persona; y el día exacto de un cambio de precio no aporta nada. */
export function fechaLegible(iso: ISODate): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(t));
}

export interface CambioPrecio {
  /** Ya formateada para leer («mayo de 2026»), no ISO. */
  fecha: string;
  valor: string;
  /** Dirección respecto al cambio anterior. `null` en el primer registro (no hay contra qué comparar). */
  direccion: 'baja' | 'sube' | null;
}

/**
 * Historial de precio, del más reciente al más antiguo. Se publica porque enseñar que un precio bajó
 * es una señal honesta y verificable; esconderlo es lo que hace todo el mercado.
 * Sin historial (o con un solo registro y sin precio actual) devuelve lista vacía.
 */
export function historialPrecio(p: Propiedad): CambioPrecio[] {
  const bruto = (p.priceHistory ?? []).filter((e) => e && Number.isFinite(Date.parse(e.fecha)) && e.valor != null);
  if (!bruto.length) return [];
  const asc = [...bruto].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
  return asc
    .map((e, i) => ({
      fecha: fechaLegible(e.fecha),
      valor: pesos(e.valor),
      direccion: i === 0 ? null : e.valor < asc[i - 1].valor ? ('baja' as const) : e.valor > asc[i - 1].valor ? ('sube' as const) : null,
    }))
    .reverse();
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMILARES — del índice ya cargado, sin una sola lectura extra
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Propiedades similares: misma operación (el índice ya viene por shard), NUNCA ella misma, y con el
 * mismo sector primero. Sin puntuaciones inventadas: se ordena por cercanía de sector y luego por
 * precio parecido, que es lo que compara una persona mirando dos fichas.
 */
export function similares(items: readonly CatalogoResumen[], p: Propiedad, tope = 3): CatalogoResumen[] {
  const shard = operacionAShard(p.operacion);
  const precio = valorPrecio(p);
  const sector = (p.geo?.barrio ?? '').toLowerCase();

  return [...items]
    .filter((r) => r.id !== p.id && operacionAShard(r.operacion) === shard)
    .sort((a, b) => {
      const sa = (a.sector ?? '').toLowerCase() === sector ? 0 : 1;
      const sb = (b.sector ?? '').toLowerCase() === sector ? 0 : 1;
      if (sa !== sb) return sa - sb;
      if (precio == null) return 0;
      return Math.abs(a.precio - precio) - Math.abs(b.precio - precio);
    })
    .slice(0, tope);
}

// ─────────────────────────────────────────────────────────────────────────────
// GATES DE PUBLICACIÓN — lo que decide si una ficha se puede enseñar, y cómo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ¿Se puede PUBLICAR esta ficha?
 *
 * Hoy hay un solo caso que la bloquea, y es legal, no de datos: **alojamiento turístico sin RNT**.
 * El Registro Nacional de Turismo es obligatorio para prestar servicios de hospedaje y anunciarse sin
 * él expone a cierre inmediato del establecimiento (verificación legal de `43 §Marco legal`, gate B3).
 * El tipo lo deja opcional porque el modelo es permisivo; la ley no lo es.
 *
 * Fail-closed A PROPÓSITO: ante la duda no se publica. Una propiedad que desaparece del portal es un
 * problema de datos que alguien arregla en una tarde; una multa por publicidad ilegal, no.
 */
export function publicable(p: Propiedad): boolean {
  if (p.operacion === 'alojamiento' && !p.rnt?.trim()) return false;
  return true;
}

/**
 * ¿Se puede exhibir la matrícula de arrendador en ESTA ficha?
 *
 * La habilitación es MUNICIPAL: la matrícula 6636 la expidió la Alcaldía de Cartagena y ampara la
 * actividad en Cartagena. Enseñarla junto a un inmueble de otra ciudad afirmaría una habilitación que
 * no existe allí. Y solo aplica al arriendo, que es donde la Ley 820 art. 31 la exige en la publicidad.
 */
export function exhibeMatricula(p: Propiedad): boolean {
  if (p.operacion !== 'arriendo') return false;
  return clave(p.geo?.ciudad ?? '').startsWith('cartagena');
}

/** Normaliza para comparar (sin tildes ni mayúsculas). Local a este módulo. */
function clave(s: string): string {
  return s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase().trim();
}

export interface AvisoEstado {
  titulo: string;
  detalle: string;
  /** `false` cuando ya no tiene sentido ofrecer una visita (el inmueble se cerró). */
  admiteVisita: boolean;
}

/**
 * Aviso cuando la propiedad NO está disponible. Devuelve `null` si lo está.
 *
 * Por qué existe: las Rules dejan públicos los estados `reservado` y `cerrado` (la ficha de un inmueble
 * cerrado se conserva por SEO y por historial). Sin este aviso, esa ficha muestra precio y un botón
 * «Agendar visita» como si nada — y quien escribe pierde el tiempo, y nosotros la credibilidad. Es el
 * mismo caso del listing fabricado, solo que fabricado por omisión.
 */
export function avisoEstado(p: Propiedad): AvisoEstado | null {
  if (p.estado === 'disponible') return null;
  if (p.estado === 'reservado') {
    return {
      titulo: 'Reservado',
      detalle: 'Este inmueble tiene una reserva en curso. Si se cae, te avisamos: escríbenos y te lo apartamos de primero.',
      admiteVisita: false,
    };
  }
  if (p.estado === 'cerrado') {
    return {
      titulo: p.operacion === 'venta' ? 'Vendido' : 'Ya arrendado',
      detalle: 'Este negocio ya se cerró. Dejamos la publicación como referencia; podemos buscarte algo parecido en la misma zona.',
      admiteVisita: false,
    };
  }
  return { titulo: 'No disponible', detalle: 'Esta publicación no está activa en este momento.', admiteVisita: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO PÚBLICO Y CONTACTO
// ─────────────────────────────────────────────────────────────────────────────

/** Ubicación publicable: barrio y ciudad. La dirección exacta NO entra aquí ni en ningún otro sitio. */
export function ubicacionPublica(p: Propiedad): string {
  const barrio = p.geo?.barrio?.trim();
  const ciudad = p.geo?.ciudad?.trim() || 'Cartagena de Indias';
  return barrio ? `${barrio}, ${ciudad}` : ciudad;
}

export function tituloSeo(p: Propiedad): string {
  return `${p.titulo} · ${ubicacionPublica(p)} — ALTORRA`;
}

/**
 * Meta description a partir de datos REALES. Si la descripción del inmueble es corta, se completa con
 * hechos (tipo, operación, barrio), nunca con adjetivos de relleno.
 */
export function descripcionSeo(p: Propiedad): string {
  const base = (p.descripcion ?? '').replace(/\s+/g, ' ').trim();
  // «Apartamento arriendo en Manga» no lo escribiría una persona. `etiquetaOperacion` da la forma
  // correcta («en arriendo», «en venta», «por días») y de paso la description deja de sonar a plantilla.
  const comoSeDice = p.operacion === 'venta' ? 'en venta' : p.operacion === 'arriendo' ? 'en arriendo' : 'por días';
  const hechos = `${etiquetaTipo(p.tipo)} ${comoSeDice} en ${ubicacionPublica(p)}.`;
  const texto = base.length >= 80 ? base : `${hechos} ${base}`.trim();
  return texto.length > 158 ? `${texto.slice(0, 155).trimEnd()}…` : texto;
}

/** Mensaje de WhatsApp con el inmueble identificado: sin esto el asesor no sabe de cuál le hablan. */
export function mensajeWhatsApp(p: Propiedad, intencion: 'visita' | 'info'): string {
  const que = intencion === 'visita' ? 'quisiera agendar una visita' : 'quisiera más información';
  return `Hola ALTORRA, ${que} sobre ${p.titulo} en ${ubicacionPublica(p)} (código ${p.id}).`;
}

export interface Miga {
  nombre: string;
  href: string | null;
}

/** Migas de pan: Inicio › Operación › Zona › Título. La última no lleva enlace (es la página actual). */
export function migas(p: Propiedad, slugZona?: string): Miga[] {
  const out: Miga[] = [
    { nombre: 'Inicio', href: '/' },
    { nombre: etiquetaOperacionRuta(p.operacion), href: rutaOperacion(p.operacion) },
  ];
  const barrio = p.geo?.barrio?.trim();
  if (barrio) {
    // Si el barrio tiene landing propia (§92), la miga lleva ALLÍ y no al SERP genérico: es la página
    // que de verdad responde «cómo es este barrio», y de paso el enlazado interno apunta a contenido
    // en vez de a un listado. El slug se pasa desde fuera para que el dominio no dependa del contenido.
    // Sin landing propia, la miga va SIN enlace. Apuntarla a `/comprar` metía la misma URL dos veces
    // en el BreadcrumbList (la del nivel anterior y esta), que es una ruta que no lleva a ningún sitio
    // nuevo y un breadcrumb con un peldaño repetido.
    out.push({ nombre: barrio, href: slugZona ? `/zona/${slugZona}` : null });
  }
  out.push({ nombre: p.titulo, href: null });
  return out;
}

/** URL canónica de una ficha. El slug manda; sin slug, el id (que siempre existe). */
export function rutaFicha(p: Pick<Propiedad, 'id' | 'slug'>): string {
  return `/inmueble/${encodeURIComponent(p.slug || p.id)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD — mismo criterio que §95: se declara lo que se puede sostener, y nada más
// ─────────────────────────────────────────────────────────────────────────────

/** Tipo schema.org del inmueble. Lo comercial no tiene subtipo residencial: `Place` es lo honesto. */
function tipoSchema(t: TipoInmueble): string {
  if (t === 'apartamento' || t === 'apartaestudio') return 'Apartment';
  if (t === 'casa' || t === 'casa_lote' || t === 'finca') return 'House';
  return 'Place';
}

/**
 * `RealEstateListing` de UNA propiedad. Convive con el `RealEstateAgent` que `BaseLayout` emite en
 * todas las rutas (§95): varios bloques JSON-LD por documento son válidos y responden preguntas
 * distintas — quién vende, y qué se vende.
 *
 * AUSENCIAS DELIBERADAS, en la línea de §95.3:
 *  · **sin `streetAddress`**: la dirección exacta está prohibida en el documento público. Un
 *    `PostalAddress` con localidad y país es válido; uno con una calle inventada es una mentira que
 *    Google indexa.
 *  · **sin `aggregateRating` ni `review`**: no hay reseñas por inmueble. Inventarlas es lo que sanciona
 *    la SIC y por lo que Google aplica acciones manuales.
 *  · **sin `numberOfRooms` cuando no hay dato**: cada propiedad se declara solo con lo que trae.
 */
export function jsonLdInmueble(p: Propiedad, urlAbsoluta: string, imagenes: string[]): Record<string, unknown> {
  const precio = valorPrecio(p);
  const area = p.specs?.areaConstruidaM2 ?? p.specs?.areaPrivadaM2;

  const lugar: Record<string, unknown> = {
    '@type': tipoSchema(p.tipo),
    name: p.titulo,
    address: {
      '@type': 'PostalAddress',
      // `addressLocality` es la CIUDAD. Poner el barrio aquí borra la ciudad del address estructurado
      // y le dice a un motor de respuestas que «Castillogrande» es una localidad de Bolívar. El barrio
      // viaja en el nombre y en el texto de la página, que es donde significa lo que significa.
      addressLocality: p.geo?.ciudad || 'Cartagena de Indias',
      addressRegion: 'Bolívar',
      addressCountry: 'CO',
    },
  };
  // `numberOfRooms` y `numberOfBathroomsTotal` son propiedades de `Accommodation`. Colgarlas de un
  // `Place` genérico (que es lo honesto para un local o una bodega) produce markup que valida pero no
  // significa nada. En lo comercial se omiten; el área sí es válida en cualquier `Place`.
  const esResidencial = tipoSchema(p.tipo) !== 'Place';
  if (esResidencial && p.specs?.habitaciones != null) lugar.numberOfRooms = p.specs.habitaciones;
  if (esResidencial && p.specs?.banos != null) lugar.numberOfBathroomsTotal = p.specs.banos;
  if (area != null) lugar.floorSize = { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' };
  // ⛔ SIN `geo`. `Propiedad.geo.lat/lng` es el CENTROIDE APROXIMADO DEL BARRIO, no la posición del
  // inmueble (lo dice el propio modelo, y el mapa lo advierte en pantalla). Declararlo como
  // `GeoCoordinates` de la propiedad convierte una aproximación en una afirmación de precisión, legible
  // por máquina y contrastable. Mismo criterio que §95.3 con `streetAddress`: se omite lo que no se
  // puede sostener. El mapa visible sigue estando; lo que no se hace es CERTIFICARLO.
  const amen = amenidadesVisibles(p);
  if (amen.length) {
    lugar.amenityFeature = amen.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true }));
  }

  const doc: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    url: urlAbsoluta,
    name: p.titulo,
    description: descripcionSeo(p),
    datePosted: p.createdAt,
    about: lugar,
  };
  if (imagenes.length) doc.image = imagenes;

  if (precio != null) {
    const oferta: Record<string, unknown> = {
      '@type': 'Offer',
      priceCurrency: 'COP',
      availability: p.estado === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      // Vocabulario GoodRelations, que es el que schema.org usa para distinguir vender de arrendar.
      // Sin esto, un canon mensual y un precio de venta se leen igual desde fuera.
      businessFunction:
        p.operacion === 'venta'
          ? 'http://purl.org/goodrelations/v1#Sell'
          : 'http://purl.org/goodrelations/v1#LeaseOut',
    };
    if (p.operacion === 'venta') {
      oferta.price = precio;
    } else {
      oferta.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: precio,
        priceCurrency: 'COP',
        unitText: p.operacion === 'arriendo' ? 'MES' : 'NOCHE',
      };
    }
    doc.offers = oferta;
  }

  return doc;
}
