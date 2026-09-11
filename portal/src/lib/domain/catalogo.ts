// Catálogo DENORMALIZADO — decisión OD-Catálogo §54 (comité ×3 + Gemini, doc-índice denormalizado).
// El índice `indices/catalogo-{shard}` es un doc que la Cloud Function `onWrite(propiedades)` mantiene con
// los RESÚMENES de las propiedades PUBLICADAS (rebuild TOTAL idempotente, §54.4). El cliente lo lee como
// un GET puntual por id (NO viola `verify:data`) + Workers Caching. Alimenta: cards del SERP + filtros
// client-side + pins del mapa (TODO-30) + "similares" de la ficha. Solo-lectura pública.

import { OPERACIONES } from './shared';
import type { AgregadoResenas } from './resenas';
import type { ISODate, COP, Operacion, TipoInmueble, EstadoPropiedad } from './shared';
import { portadaDe, motivoLegalNoPublicable } from './propiedades';
import type { MotivoLegal, Propiedad } from './propiedades';
import {
  rangoDePrecios,
  tipologiaDeEntrada,
  problemasParaPublicarProyecto,
  esPublicadoProyecto,
} from './proyectos';
import type { ProblemaProyecto, Proyecto, Tipologia } from './proyectos';

/** Shards del índice por operación (doc `indices/catalogo-{shard}`). Sharding desde el día 1 (§54.4): el
 *  límite de 1 MiB por doc coincide con el tripwire de búsqueda (~2K listings) → el mecanismo expira donde debe. */
export const CATALOGO_SHARDS = ['venta', 'arriendo', 'dias'] as const;
export type CatalogoShard = (typeof CATALOGO_SHARDS)[number];

/** Operación del dominio → shard del índice (alojamiento = corta estancia → 'dias'). */
export function operacionAShard(op: Operacion): CatalogoShard {
  return op === 'venta' ? 'venta' : op === 'arriendo' ? 'arriendo' : 'dias';
}

/** Ruta pública (/comprar · /arrendar · /estancias) → shard. `null` si la ruta no mapea a un shard. */
export function rutaAShard(ruta: string): CatalogoShard | null {
  const r = ruta.toLowerCase();
  if (r === 'comprar' || r === 'venta') return 'venta';
  if (r === 'arrendar' || r === 'arriendo') return 'arriendo';
  if (r === 'estancias' || r === 'dias' || r === 'alojamiento') return 'dias';
  return null;
}

/**
 * Qué hay al otro lado de la card. Desde §284 el índice mezcla DOS entidades en el mismo shard de
 * venta: inmuebles de la colección `propiedades` y proyectos de obra nueva de `proyectos`.
 */
export const CLASES_FICHA = ['inmueble', 'proyecto'] as const;
export type ClaseFicha = (typeof CLASES_FICHA)[number];

/**
 * Resumen DENORMALIZADO de una propiedad publicada (~0.4-0.6KB). Contrato del comité (§54.4): TÍTULO y SLUG
 * son OBLIGATORIOS (sin ellos no se pinta una card ni se enlaza la ficha — refutación a Gemini). Se EXCLUYE
 * a propósito (vive en la ficha SSR, no inflar el índice): descripción, galería, amenities, historial, PII.
 */
export interface CatalogoResumen {
  id: string; // doc id → link a ficha + emparejamiento card↔pin (data-pin-idx)
  slug: string; // URL de la ficha
  titulo: string; // título de la card
  operacion: Operacion;
  tipo: TipoInmueble;
  precio: COP; // display: valorVenta | canon | precioNoche según operación
  /**
   * Techo del rango, solo en OBRA NUEVA (§284): un proyecto no cuesta un número, cuesta
   * **desde-hasta**. Un inmueble corriente NO lo lleva y su intervalo degenera al punto
   * `[precio, precio]` — por eso `precio` sigue significando lo mismo para todos (lo que se ordena
   * y lo que se muestra) y nadie tuvo que cambiar de campo. Quien filtre por precio compara
   * SOLAPE, no pertenencia: `precioHasta ?? precio` es el techo de cualquier item.
   */
  precioHasta?: COP;
  /**
   * Qué clase de ficha hay al otro lado del enlace. **Ausente = `inmueble`**, que es el 99 % de los
   * items: escribir la constante en cada uno costaría ~21 bytes × N contra el tope de 1 MiB del
   * shard (§54.4) sin decir nada nuevo — la misma economía que ya siguen `badges`, `hab` y `resenas`.
   * Se lee SIEMPRE por `claseDe()`, nunca a pelo, para que el default viva en un solo sitio.
   *
   * 🎯 No es decoración: es lo que decide la RUTA (`/proyecto/…` vs `/inmueble/…`). Sin este campo,
   * inyectar obra nueva en el shard de venta habría enlazado cada proyecto a `/inmueble/PRY-…`, que
   * es un 404 con aspecto de card correcta.
   */
  clase?: ClaseFicha;
  sector: string; // geo.barrio (filtro + "similares")
  coords: { lat: number; lng: number } | null; // centroide; null → card SÍ, pin NO (mapa TODO-30)
  hab?: number;
  ban?: number;
  area?: number; // m² construidos
  thumb: string; // key R2 del thumb (<150KB); el front compone la URL base (NO hardcodear dominio)
  badges?: string[]; // máx 2, opcional
  pub: ISODate; // updatedAt (orden 'recientes' + desempate similares)
  /**
   * Calificación agregada (§281) — viaja al índice porque «mejor valoradas» es una sección de la
   * PORTADA, y abrir una ficha por tarjeta para leer una nota sería pagar el free-tier por adorno.
   * Ausente = esta propiedad no tiene reseñas suficientes; NO es un cero.
   */
  resenas?: AgregadoResenas;
}

/**
 * Documento `indices/catalogo-{shard}`. SIEMPRE existe (seed `{items:[]}` al deploy; despublicar el último
 * escribe lista VACÍA, no borra — §54.4 cond. 2). Lo escribe SOLO la Function (Admin SDK). El cliente que
 * lo lee sintetiza este mismo shape para el vacío canónico cuando el doc aún no existe (estado-cero legítimo).
 */
export interface CatalogoIndice {
  _version: number; // concurrencia optimista (L-09); 0 en el vacío canónico sintetizado por el cliente
  items: CatalogoResumen[];
  actualizado?: ISODate; // epoch/ISO del último rebuild (debug de frescura); ausente en el vacío canónico
}

/** Vacío canónico que el cliente devuelve cuando el índice aún no existe (NO es error — es estado-cero). */
export function catalogoVacio(): CatalogoIndice {
  return { _version: 0, items: [] };
}

/** Lector ÚNICO de `clase`: el default «inmueble» vive aquí y en ningún otro sitio. */
export const claseDe = (r: Pick<CatalogoResumen, 'clase'>): ClaseFicha => r.clase ?? 'inmueble';

/**
 * DUEÑO ÚNICO de «¿a qué URL lleva esta card?». Antes había DOS respuestas escritas aparte —
 * `hrefFicha()` en el script de las cards y un `/ficha?id=…` en el correo del digest— y las dos
 * daban por hecho que todo item del índice es un inmueble. En el momento en que obra nueva entra al
 * shard de venta esa suposición produce 404 con aspecto de acierto: card correcta, foto correcta,
 * precio correcto, enlace muerto. Es la clase de fallo que no rompe nada y se indexa (§285.3).
 *
 * El `slug` manda; sin slug, el id, que siempre existe. Se enlaza el destino FINAL (nunca
 * `/ficha?id=`, que responde un 301): ahorra un salto por card y no reparte el posicionamiento
 * entre dos URLs.
 */
export function rutaDeResumen(r: Pick<CatalogoResumen, 'clase' | 'slug' | 'id'>): string {
  const s = encodeURIComponent(r.slug || r.id);
  return claseDe(r) === 'proyecto' ? `/proyecto/${s}` : `/inmueble/${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL ÍNDICE (camino de ESCRITURA, §54.4) — lógica PURA y determinista.
// La ejecuta la Cloud Function `onWrite(propiedades)` con un REBUILD TOTAL idempotente. Vive aquí (dominio)
// y no en la Function para que sea testeable sin emulador y para que el CONTRATO tenga un solo dueño.
// ─────────────────────────────────────────────────────────────────────────────

/** Estados que SÍ salen en el catálogo público — espeja la whitelist de `firestore.rules`. */
export const ESTADOS_PUBLICADOS: readonly EstadoPropiedad[] = ['disponible', 'reservado', 'cerrado'];

export function esPublicada(p: Pick<Propiedad, 'estado'>): boolean {
  return ESTADOS_PUBLICADOS.includes(p.estado);
}

/** Precio de DISPLAY según la operación (doble-precio de arriendo → se muestra el canon). */
export function precioDisplay(p: Pick<Propiedad, 'operacion' | 'precio'>): COP | null {
  if (p.operacion === 'venta') return p.precio?.valorVenta ?? null;
  if (p.operacion === 'arriendo') return p.precio?.canon ?? null;
  return p.precio?.precioNoche ?? null; // alojamiento
}

/** Motivos de omisión de un INMUEBLE — el vocabulario de `propiedades`. */
export type MotivoInmueble = 'sin-precio' | 'sin-imagen' | 'sin-titulo' | 'esquema-legacy' | MotivoLegal;

/**
 * Motivo por el que algo PUBLICADO no pudo entrar al índice (se REPORTA, no se oculta en silencio).
 *
 * Los dos vocabularios se mantienen SEPARADOS y solo se unen aquí, en el contenedor: un inmueble no
 * puede estar «sin-licencia» y un proyecto no puede estar «sin-rnt». Fundirlos en una lista sola
 * habría obligado al formulario de alta de inmuebles a explicar motivos que su pantalla no puede
 * producir — y un desplegable de errores imposibles es ruido que enseña a ignorar los reales.
 */
export interface OmitidaCatalogo {
  id: string;
  motivo: MotivoInmueble | ProblemaProyecto;
}

/**
 * ¿Este documento lo escribió el PANEL VIEJO? (§103)
 *
 * Los dos mundos comparten la colección `propiedades` y escriben modelos INCOMPATIBLES: `admin.html`
 * deja campos planos (`barrio`, `habitaciones`, `coords`), un `precio` entero y una `operacion` de la
 * ruta vieja (`comprar|arrendar|dias`), mientras el portal espera `geo`/`specs` anidados, un `precio`
 * como objeto y `venta|arriendo|alojamiento`. Y `leerPublicadas()` hace un `as Propiedad` a ciegas:
 * el documento viejo COMPILA, pasa el filtro de publicadas y solo revienta al leerlo.
 *
 * Por qué existe esta función en vez de dejar que falle sola: sin ella el documento cae en
 * `sin-precio` — un motivo que manda a buscar un precio que SÍ está, solo que en otra forma. El
 * síntoma (índice vacío, SERP sin resultados, cero errores) ya es bastante difícil sin encima un
 * diagnóstico que apunta al sitio equivocado.
 *
 * La detección NO adivina: mira las dos cosas que el modelo sellado define de forma cerrada — que la
 * `operacion` esté en `OPERACIONES` y que `precio` sea un objeto. Basta una para delatarlo, porque una
 * migración a medias es tan inservible como ninguna.
 */
export function esEsquemaLegacy(p: Pick<Propiedad, 'operacion' | 'precio'>): boolean {
  const precio: unknown = p.precio;
  return !OPERACIONES.includes(p.operacion) || (precio != null && typeof precio !== 'object');
}

/**
 * TODOS los motivos por los que esta propiedad NO entraría al índice, en orden de gravedad.
 *
 * DUEÑO ÚNICO de las condiciones (§108). Antes vivían inline dentro de `propiedadAResumen`, que
 * devuelve solo el PRIMERO porque para el índice basta con saber que se omite. El formulario de alta
 * necesita justo lo contrario: enseñarlos TODOS de una vez, o el operador arregla el título, guarda,
 * y solo entonces descubre que además falta el precio. Extraerlos aquí permite las dos cosas sin que
 * nadie duplique una condición — que es exactamente cómo se abrió el hueco de §103.
 */
export function motivosDeOmision(p: Propiedad): MotivoInmueble[] {
  const out: MotivoInmueble[] = [];
  if (!p.titulo) out.push('sin-titulo');
  // ANTES que nada lo demás: un documento del panel viejo no tiene «un campo mal», tiene OTRO modelo.
  if (esEsquemaLegacy(p)) out.push('esquema-legacy');
  // 🔴 GATE LEGAL antes que los de datos (§104). `publicable()` bloqueaba la FICHA de un alojamiento
  // sin RNT, pero el índice no lo llamaba: la card habría salido en /estancias con foto y precio —
  // que es EXACTAMENTE la publicidad de hospedaje sin registro que el gate B3 existe para impedir— y
  // encima enlazando a una ficha que devuelve 404. El mismo guardián en TODOS los lectores ([[L-45]]).
  // Se pregunta por el MOTIVO, no por el sí/no: son dos papeles distintos y el operador tiene que
  // saber cuál le falta.
  const legal = motivoLegalNoPublicable(p);
  if (legal) out.push(legal);
  if (precioDisplay(p) == null) out.push('sin-precio');
  if (!portadaDe(p)) out.push('sin-imagen');
  return out;
}

/**
 * Propiedad → resumen del catálogo. Devuelve `null` + motivo si NO puede pintar una card honesta
 * (sin precio / sin imagen / sin título): mejor omitir y REPORTAR que mostrar una card rota o inventar datos (L-29).
 */
export function propiedadAResumen(p: Propiedad): { resumen: CatalogoResumen } | { omitida: OmitidaCatalogo } {
  // El PRIMER motivo es el que se reporta: para el índice basta con saber que no entra, y el primero
  // es el más grave por el orden en que se evalúan. La lista completa es para quien está EDITANDO.
  const motivos = motivosDeOmision(p);
  if (motivos.length) return { omitida: { id: p.id, motivo: motivos[0] } };
  const precio = precioDisplay(p) as COP;
  const thumb = portadaDe(p);

  // Badges SOLO desde flags REALES del dominio (nada inventado, L-29); máx 2.
  const badges: string[] = [];
  if (p.verificadoAltorra) badges.push('verificado');
  if (p.featured) badges.push('destacado');

  return {
    resumen: {
      id: p.id,
      slug: p.slug ?? p.id,
      titulo: p.titulo,
      operacion: p.operacion,
      tipo: p.tipo,
      precio,
      sector: p.geo?.barrio ?? '',
      // Centroide del barrio; sin coords → card SÍ, pin NO (contrato del mapa, TODO-30).
      coords: p.geo?.lat != null && p.geo?.lng != null ? { lat: p.geo.lat, lng: p.geo.lng } : null,
      hab: p.specs?.habitaciones,
      ban: p.specs?.banos,
      area: p.specs?.areaConstruidaM2 ?? p.specs?.areaPrivadaM2,
      thumb,
      ...(badges.length ? { badges: badges.slice(0, 2) } : {}),
      pub: p.updatedAt,
    },
  };
}

/**
 * OBRA NUEVA → resumen del catálogo (§284.5). **Ésta es la pieza que desbloqueaba la vertical**: el
 * MEGA-PLAN la nombra como el único impedimento real («mientras el índice no admita rango, la
 * vertical no cabe aunque sobre tiempo»), y no era de calendario sino de contrato.
 *
 * Tres decisiones, todas del mismo principio — **derivar, no teclear** (§284.3):
 *  · el precio sale de `rangoDePrecios()`, así que un «Desde $450M» que no case con ninguna
 *    tipología es imposible por construcción;
 *  · el tipo/hab/baños/área salen de la tipología de ENTRADA, la que pone esa cifra, para que la
 *    card no describa un apartamento que no se vende;
 *  · los motivos de omisión son los de `problemasParaPublicarProyecto()`, el MISMO predicado que
 *    usan la ficha y el gate — el escritor invoca al lector en vez de repetir sus condiciones.
 *
 * `estado-no-publicado` no llega hasta aquí: lo filtra `construirIndices` antes, igual que con las
 * propiedades. Un borrador no se «omite», simplemente no se mira.
 */
export function proyectoAResumen(p: Proyecto): { resumen: CatalogoResumen } | { omitida: OmitidaCatalogo } {
  const problemas = problemasParaPublicarProyecto(p).filter((m) => m !== 'estado-no-publicado');
  if (problemas.length) return { omitida: { id: p.id, motivo: problemas[0] } };

  // Los tres no-null están garantizados por los problemas de arriba (sin-precio / sin-tipologias /
  // sin-imagen bloquean antes de llegar): se afirman aquí y el test lo fija, en vez de fingir
  // defensas que nunca corren.
  const rango = rangoDePrecios(p.tipologias) as { desde: COP; hasta: COP };
  const entrada = tipologiaDeEntrada(p.tipologias) as Tipologia;
  const thumb = p.imagenPortada ?? p.imagenes[0];

  return {
    resumen: {
      id: p.id,
      slug: p.slug,
      titulo: p.nombre,
      // Un proyecto se VENDE. Va al shard de venta y aparece en /comprar junto a lo usado, que es el
      // eje ortogonal nuevo/usado del diseño (§270) y no una sección aparte del menú.
      operacion: 'venta',
      tipo: entrada.tipo,
      precio: rango.desde,
      // Solo viaja si de verdad hay rango: un proyecto de una sola tipología NO es un intervalo, y
      // escribir `hasta === desde` invitaría a pintar «Desde $450M hasta $450M».
      ...(rango.hasta > rango.desde ? { precioHasta: rango.hasta } : {}),
      clase: 'proyecto',
      sector: p.geo.barrio ?? '',
      coords: p.geo.lat != null && p.geo.lng != null ? { lat: p.geo.lat, lng: p.geo.lng } : null,
      hab: entrada.habitaciones,
      ban: entrada.banos,
      area: entrada.areaM2,
      thumb,
      // CLAVE, no etiqueta — igual que 'verificado'/'destacado'. «En preventa» es texto de pantalla y
      // vive en `ETIQUETA_ESTADO_OBRA`, del lado de la vista.
      badges: [p.estadoObra],
      pub: p.updatedAt,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EL CONTRATO DEL ESCRITOR (§108) — lo que el formulario de alta debe preguntarse ANTES de guardar
// ─────────────────────────────────────────────────────────────────────────────

/** Un motivo de omisión de INMUEBLE, más el que solo tiene sentido para quien está editando. */
export type ProblemaPublicacion = MotivoInmueble | 'estado-no-publicado';

/**
 * ¿Por qué esta propiedad NO se vería en el catálogo si se guardara así?
 *
 * ESTA ES LA RESPUESTA A §103. El defecto de fondo de aquel caso no fue el esquema viejo: fue que el
 * ESCRITOR y el LECTOR no compartían las reglas, así que se podía guardar algo que el catálogo
 * descartaba en silencio. La defensa no es «acordarse de validar»: es que el escritor **llame** a los
 * predicados del lector en vez de reproducir sus condiciones. Si mañana el índice añade un motivo, el
 * formulario se entera solo — y si alguien lo rompe, lo caza el test del contrato.
 *
 * ⚠️ `estado-no-publicado` NO siempre es un problema: guardar un borrador es legítimo y frecuente. Es
 * el formulario quien decide si avisar, según lo que el operador haya elegido. Se devuelve porque la
 * pregunta que contesta esta función es «¿se vería?», y un borrador no se ve.
 */
export function problemasParaPublicar(p: Propiedad): ProblemaPublicacion[] {
  const out: ProblemaPublicacion[] = [];
  if (!esPublicada(p)) out.push('estado-no-publicado');
  out.push(...motivosDeOmision(p));
  return out;
}

/**
 * El problema, dicho para una persona que está rellenando un formulario.
 *
 * Cada texto dice QUÉ falta y QUÉ consecuencia tiene, porque «sin-imagen» a secas no le explica a
 * nadie que su inmueble no va a aparecer en ningún listado.
 */
export function explicarProblema(m: ProblemaPublicacion): string {
  switch (m) {
    case 'estado-no-publicado':
      return 'Está en un estado que no sale al portal (borrador, en verificación o inactivo). Solo lo ve el equipo.';
    case 'sin-titulo':
      return 'Falta el título. Sin él no se puede pintar la tarjeta del listado.';
    case 'esquema-legacy':
      return 'Este documento tiene el formato del panel antiguo. Hay que volver a capturarlo desde aquí.';
    case 'sin-rnt':
      return 'Un alojamiento turístico necesita su número de RNT para poder anunciarse. Es obligación legal, no un dato de más.';
    case 'sin-autorizacion-ph':
      return 'Falta declarar que el reglamento de la copropiedad autoriza EXPRESAMENTE el alquiler por días. Que el reglamento no lo prohíba no basta: si calla, no autoriza. Si el inmueble no está en propiedad horizontal, márcalo como tal.';
    case 'sin-precio':
      return 'Falta el precio de la operación elegida (venta, canon de arriendo o precio por noche).';
    case 'sin-imagen':
      return 'No hay ninguna foto. Sin portada el inmueble no aparece en los listados.';
  }
}

export interface IndiceConstruido {
  items: CatalogoResumen[];
  actualizado: ISODate;
}
export interface ResultadoIndices {
  /** SIEMPRE los 3 shards (aunque vacíos): despublicar el último escribe lista VACÍA, no borra (§54.4 cond.2). */
  indices: Record<CatalogoShard, IndiceConstruido>;
  omitidas: OmitidaCatalogo[];
}

/**
 * REBUILD TOTAL de los 3 shards desde el estado VIVO de `propiedades` **y de `proyectos`**.
 * **Idempotente y determinista** (mismo input → mismo output byte-a-byte): ordena por `pub` desc y
 * desempata por `id` asc, así dos ejecuciones concurrentes convergen al MISMO doc (§54.4 cond.1:
 * patch incremental PROHIBIDO).
 *
 * 🏗️ La obra nueva entra al shard de **venta**, no a un cuarto shard suyo. Pesó el free-tier: el
 * SERP de `/comprar` lee UN doc, y separarlos lo habría convertido en dos GET por visita en la
 * página más transitada del portal — pagar el doble en la caliente para ahorrar un `if` en la fría.
 * Un cuarto shard además habría obligado a fusionar y reordenar en los cuatro consumidores (SERP,
 * mapa, similares, digest), que es donde se desincronizan las listas.
 *
 * `proyectos` es OPCIONAL a propósito: las pruebas que solo miran inmuebles no tienen que aprender
 * una vertical que no les toca.
 */
export function construirIndices(
  propiedades: Propiedad[],
  actualizado: ISODate,
  proyectos: Proyecto[] = [],
): ResultadoIndices {
  const indices: Record<CatalogoShard, IndiceConstruido> = {
    venta: { items: [], actualizado },
    arriendo: { items: [], actualizado },
    dias: { items: [], actualizado },
  };
  const omitidas: OmitidaCatalogo[] = [];

  for (const p of propiedades) {
    if (!esPublicada(p)) continue; // borradores/inactivos JAMÁS entran (anti-oráculo §54.4 cond.4)
    const r = propiedadAResumen(p);
    if ('omitida' in r) {
      omitidas.push(r.omitida);
      continue;
    }
    indices[operacionAShard(p.operacion)].items.push(r.resumen);
  }

  for (const p of proyectos) {
    if (!esPublicadoProyecto(p)) continue; // misma regla que arriba: un borrador no se mira
    const r = proyectoAResumen(p);
    if ('omitida' in r) {
      omitidas.push(r.omitida);
      continue;
    }
    indices.venta.items.push(r.resumen);
  }

  for (const shard of CATALOGO_SHARDS) {
    indices[shard].items.sort((a, b) => (a.pub === b.pub ? a.id.localeCompare(b.id) : a.pub < b.pub ? 1 : -1));
  }
  return { indices, omitidas };
}
