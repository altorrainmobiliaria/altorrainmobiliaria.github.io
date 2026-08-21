// Catálogo DENORMALIZADO — decisión OD-Catálogo §54 (comité ×3 + Gemini, doc-índice denormalizado).
// El índice `indices/catalogo-{shard}` es un doc que la Cloud Function `onWrite(propiedades)` mantiene con
// los RESÚMENES de las propiedades PUBLICADAS (rebuild TOTAL idempotente, §54.4). El cliente lo lee como
// un GET puntual por id (NO viola `verify:data`) + Workers Caching. Alimenta: cards del SERP + filtros
// client-side + pins del mapa (TODO-30) + "similares" de la ficha. Solo-lectura pública.

import { OPERACIONES } from './shared';
import type { ISODate, COP, Operacion, TipoInmueble, EstadoPropiedad } from './shared';
import { publicable } from './propiedades';
import type { Propiedad } from './propiedades';

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
  sector: string; // geo.barrio (filtro + "similares")
  coords: { lat: number; lng: number } | null; // centroide; null → card SÍ, pin NO (mapa TODO-30)
  hab?: number;
  ban?: number;
  area?: number; // m² construidos
  thumb: string; // key R2 del thumb (<150KB); el front compone la URL base (NO hardcodear dominio)
  badges?: string[]; // máx 2, opcional
  pub: ISODate; // updatedAt (orden 'recientes' + desempate similares)
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

/** Motivo por el que una propiedad PUBLICADA no pudo entrar al índice (se REPORTA, no se oculta en silencio). */
export interface OmitidaCatalogo {
  id: string;
  motivo: 'sin-precio' | 'sin-imagen' | 'sin-titulo' | 'esquema-legacy' | 'sin-rnt';
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
 * Propiedad → resumen del catálogo. Devuelve `null` + motivo si NO puede pintar una card honesta
 * (sin precio / sin imagen / sin título): mejor omitir y REPORTAR que mostrar una card rota o inventar datos (L-29).
 */
export function propiedadAResumen(p: Propiedad): { resumen: CatalogoResumen } | { omitida: OmitidaCatalogo } {
  if (!p.titulo) return { omitida: { id: p.id, motivo: 'sin-titulo' } };
  // ANTES que nada lo demás: un documento del panel viejo no tiene «un campo mal», tiene OTRO modelo.
  if (esEsquemaLegacy(p)) return { omitida: { id: p.id, motivo: 'esquema-legacy' } };
  // 🔴 GATE LEGAL antes que los de datos (§104). `publicable()` bloqueaba la FICHA de un alojamiento
  // sin RNT, pero el índice no lo llamaba: la card habría salido en /estancias con foto y precio —
  // que es EXACTAMENTE la publicidad de hospedaje sin registro que el gate B3 existe para impedir— y
  // encima enlazando a una ficha que devuelve 404. El mismo guardián en TODOS los lectores ([[L-45]]).
  if (!publicable(p)) return { omitida: { id: p.id, motivo: 'sin-rnt' } };
  const precio = precioDisplay(p);
  if (precio == null) return { omitida: { id: p.id, motivo: 'sin-precio' } };
  const thumb = p.imagenPortada ?? p.imagenes?.[0];
  if (!thumb) return { omitida: { id: p.id, motivo: 'sin-imagen' } };

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
 * REBUILD TOTAL de los 3 shards desde el estado VIVO de `propiedades`. **Idempotente y determinista**
 * (mismo input → mismo output byte-a-byte): ordena por `pub` desc y desempata por `id` asc, así dos
 * ejecuciones concurrentes convergen al MISMO doc (§54.4 cond.1: patch incremental PROHIBIDO).
 */
export function construirIndices(propiedades: Propiedad[], actualizado: ISODate): ResultadoIndices {
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

  for (const shard of CATALOGO_SHARDS) {
    indices[shard].items.sort((a, b) => (a.pub === b.pub ? a.id.localeCompare(b.id) : a.pub < b.pub ? 1 : -1));
  }
  return { indices, omitidas };
}
