// Catálogo DENORMALIZADO — decisión OD-Catálogo §54 (comité ×3 + Gemini, doc-índice denormalizado).
// El índice `indices/catalogo-{shard}` es un doc que la Cloud Function `onWrite(propiedades)` mantiene con
// los RESÚMENES de las propiedades PUBLICADAS (rebuild TOTAL idempotente, §54.4). El cliente lo lee como
// un GET puntual por id (NO viola `verify:data`) + Workers Caching. Alimenta: cards del SERP + filtros
// client-side + pins del mapa (TODO-30) + "similares" de la ficha. Solo-lectura pública.

import type { ISODate, COP, Operacion, TipoInmueble } from './shared';

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
