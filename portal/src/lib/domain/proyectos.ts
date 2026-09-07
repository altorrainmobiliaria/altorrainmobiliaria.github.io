/*
 * OBRA NUEVA — el modelo de un PROYECTO (§284). Diseño decidido en §270 contra los dos líderes del
 * mercado colombiano; esto es su primera pieza construida.
 *
 * ┌─ LO QUE UN PROYECTO NO ES ──────────────────────────────────────────────────────────────────┐
 * Un proyecto **no es un inmueble con campos extra**. Es un contenedor de TIPOLOGÍAS: «Torre Marea»
 * no se vende, se venden sus apartamentos de 1, 2 y 3 alcobas. Los dos líderes coinciden en que la
 * ficha AGRUPA —nunca una unidad por ficha— y en la granularidad de Metrocuadrado: 3-6 tipologías
 * nombradas, no las 19 unidades reales de Fincaraíz. Con un índice pre-construido y la regla de cero
 * datos inventados, «Desde $X» es honesto y un feed de disponibilidad por unidad no existe.
 * └─────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * DOS DECISIONES QUE NO SON DE ESTRUCTURA:
 *
 * 1. 💰 **El precio del proyecto NO se teclea: se DERIVA de sus tipologías.** Es lo que bloqueaba la
 *    vertical —el índice guarda `precio` como UN entero y un proyecto tiene rango— y la salida no es
 *    añadir dos campos que alguien rellena a mano, sino calcular el rango de lo que ya hay. Un
 *    «Desde $450M» que no coincide con ninguna tipología es imposible por construcción, no por
 *    disciplina (§281 aplicada al precio).
 *
 * 2. 🧾 **Un proyecto existe si tiene LICENCIA DE CONSTRUCCIÓN.** No es burocracia: en Colombia la
 *    licencia es un acto administrativo de la curaduría urbana, PÚBLICO y comprobable por número.
 *    Es la diferencia entre «este desarrollo existe» y «alguien nos mandó unos renders». §270 dejó
 *    un gate que exige declarar cada proyecto servido con su fuente; este campo es esa fuente, en el
 *    dato en vez de en un manifest.
 *
 * ⚠️ Y `porcentajeVendido` NO es un número suelto. «70% vendido» es una afirmación de urgencia —de
 * las que persigue la Ley 1480— y no la mide ALTORRA: la dice la constructora. O viene con QUIÉN lo
 * dijo y CUÁNDO, o no viaja.
 */
import type { COP, ISODate, Versioned, Auditable, TipoInmueble } from './shared';

/** Estado de obra. Los tres que los líderes tratan como verticales SEO separadas (§270, `41-MERCADO`). */
export const ESTADOS_OBRA = ['preventa', 'construccion', 'entrega-inmediata'] as const;
export type EstadoObra = (typeof ESTADOS_OBRA)[number];

export const ETIQUETA_ESTADO_OBRA: Readonly<Record<EstadoObra, string>> = {
  preventa: 'En preventa',
  construccion: 'En construcción',
  'entrega-inmediata': 'Entrega inmediata',
};

/**
 * Una TIPOLOGÍA: «Apartamento 2 alcobas», no la unidad 402.
 *
 * `desde` es el precio de la tipología. Se llama así y no `precio` a propósito: dentro de una
 * tipología hay unidades con precios distintos según piso y vista, y el número que se publica es el
 * de entrada. Nombrarlo `precio` invitaría a leerlo como «cuesta esto».
 */
export interface Tipologia {
  /** Nombre comercial, tal cual lo usa la constructora: «Tipo A», «2 alcobas», «Duplex». */
  nombre: string;
  tipo: TipoInmueble;
  areaM2: number;
  habitaciones: number;
  banos: number;
  desde: COP;
  /** Unidades disponibles de esta tipología, si la constructora lo informa. Ausente ≠ cero. */
  disponibles?: number;
}

/** Un dato que ALTORRA no mide y por tanto no puede afirmar sola. */
export interface DatoDeTercero<T> {
  valor: T;
  /** Quién lo dijo. Sin esto es un rumor con formato de dato. */
  fuente: string;
  /** Cuándo lo dijo. Un «70% vendido» de hace ocho meses es falso aunque fuera cierto entonces. */
  fecha: ISODate;
}

export interface Proyecto extends Versioned, Auditable {
  /** PRY-YYYYMM-XXXX. Namespace propio, como su URL: un proyecto no es un `INM-…` (§270). */
  id: string;
  slug: string;
  nombre: string;
  constructora: string;
  /**
   * Número de la licencia de construcción y curaduría que la expidió. **Obligatorio para publicar**
   * — es lo que hace comprobable que el desarrollo existe.
   */
  licenciaConstruccion?: string;
  curaduria?: string;
  estadoObra: EstadoObra;
  /** Entrega estimada, en ISO. Es una ESTIMACIÓN y la ficha tiene que decirlo con esa palabra. */
  entregaEstimada?: ISODate;
  descripcion: string;
  /** Barrio y ciudad; nunca la dirección exacta, igual que en las propiedades. */
  geo: { ciudad: string; barrio: string; lat?: number; lng?: number };
  tipologias: Tipologia[];
  imagenes: string[];
  imagenPortada?: string;
  /** Sala de ventas: dirección y horario. Es del proyecto, no de ALTORRA. */
  salaDeVentas?: { direccion: string; horario: string };
  cuotaInicialPct?: number;
  /** ¿Aplica a subsidio de vivienda? Es un hecho normativo del proyecto, no una promesa comercial. */
  subsidio?: boolean;
  porcentajeVendido?: DatoDeTercero<number>;
  estado: 'borrador' | 'disponible' | 'agotado' | 'inactivo';
  publicadoEn?: ISODate;
}

/** El rango de precios, DERIVADO de las tipologías. `null` si no hay ninguna con precio usable. */
export interface RangoPrecio {
  desde: COP;
  hasta: COP;
}

/**
 * Calcula el rango. **Es la única forma de obtener el precio de un proyecto** — no hay campo que
 * teclear, así que no puede desviarse de sus tipologías.
 *
 * Descarta las tipologías sin precio usable en vez de arrastrarlas: un cero o un `NaN` colado
 * pondría el «Desde» en 0, que es la clase de cifra que se publica y nadie mira dos veces.
 */
export function rangoDePrecios(tipologias: readonly Tipologia[]): RangoPrecio | null {
  const precios = tipologias
    .map((t) => t.desde)
    .filter((p): p is COP => typeof p === 'number' && Number.isFinite(p) && p > 0);
  if (!precios.length) return null;
  return { desde: Math.min(...precios), hasta: Math.max(...precios) };
}

/** Motivos por los que un proyecto NO puede salir al portal. Mismo patrón que `catalogo.ts` (§104). */
export const PROBLEMAS_PROYECTO = [
  'estado-no-publicado',
  'sin-nombre',
  'sin-constructora',
  'sin-licencia',
  'sin-tipologias',
  'sin-precio',
  'sin-imagen',
  'sin-slug',
  'vendido-sin-fuente',
] as const;
export type ProblemaProyecto = (typeof PROBLEMAS_PROYECTO)[number];

const ESTADOS_PUBLICADOS: ReadonlySet<Proyecto['estado']> = new Set(['disponible', 'agotado']);

/**
 * Qué le falta a este proyecto para poder publicarse.
 *
 * 🎯 Devuelve una LISTA y no un booleano por la misma razón que en el catálogo: «no se publica» no
 * ayuda a nadie; «le falta la licencia» sí. Y es lo que permite que el panel enseñe el motivo en vez
 * de que el operador descubra por su cuenta que su proyecto no aparece.
 */
export function problemasParaPublicarProyecto(p: Proyecto): ProblemaProyecto[] {
  const out: ProblemaProyecto[] = [];
  if (!ESTADOS_PUBLICADOS.has(p.estado)) out.push('estado-no-publicado');
  if (!p.nombre?.trim()) out.push('sin-nombre');
  if (!p.slug?.trim()) out.push('sin-slug');
  if (!p.constructora?.trim()) out.push('sin-constructora');
  if (!p.licenciaConstruccion?.trim()) out.push('sin-licencia');
  if (!p.tipologias?.length) out.push('sin-tipologias');
  else if (!rangoDePrecios(p.tipologias)) out.push('sin-precio');
  if (!p.imagenes?.length) out.push('sin-imagen');
  // Un porcentaje vendido sin quién lo dijo es una afirmación de urgencia sin respaldo: bloquea.
  if (p.porcentajeVendido && !p.porcentajeVendido.fuente?.trim()) out.push('vendido-sin-fuente');
  return out;
}

export const puedePublicarseProyecto = (p: Proyecto): boolean =>
  problemasParaPublicarProyecto(p).length === 0;

/** El problema, dicho para quien está rellenando el formulario — no para quien escribió el código. */
export function explicarProblemaProyecto(m: ProblemaProyecto): string {
  switch (m) {
    case 'estado-no-publicado':
      return 'Está en un estado que no sale al portal. Solo lo ve el equipo.';
    case 'sin-nombre':
      return 'Falta el nombre del proyecto. Es el titular de su ficha y de su tarjeta.';
    case 'sin-slug':
      return 'Falta la dirección web del proyecto. Sin ella no hay ficha a la que enlazar.';
    case 'sin-constructora':
      return 'Falta la constructora. En obra nueva quien vende es ella, y el visitante tiene derecho a saber quién construye.';
    case 'sin-licencia':
      return 'Falta el número de licencia de construcción. Es lo que permite comprobar que el proyecto existe; sin ella estaríamos publicando unos renders.';
    case 'sin-tipologias':
      return 'No tiene ni una tipología. Un proyecto se vende por sus tipos de apartamento, y sin ninguno no hay nada que ofrecer.';
    case 'sin-precio':
      return 'Ninguna tipología tiene precio. El «Desde» del listado sale de ellas, así que no se puede calcular.';
    case 'sin-imagen':
      return 'No tiene imágenes. La tarjeta del listado no se puede pintar.';
    case 'vendido-sin-fuente':
      return 'El porcentaje vendido no dice quién lo informó. «70% vendido» es una afirmación de urgencia: o se sabe quién la hizo y cuándo, o no se publica.';
  }
}

/*
 * ══ JSON-LD DE UN PROYECTO — un `Offer` por TIPOLOGÍA (§285) ═══════════════════════════════════
 *
 * El patrón sale de la investigación de julio (bóveda `2026-07-10-r1-competencia`), donde se midió
 * lo que hace La Haus: `RealEstateListing` con un **array de Offers, uno por tipología**, cada uno
 * con `itemOffered: Accommodation` y sus specs. Es el único competidor colombiano con datos
 * estructurados serios — los demás tienen JSON-LD en cero.
 *
 * ⛔ **Y NO se usa `AggregateOffer`**, aunque un «desde/hasta» lo pida a gritos. Su definición
 * literal es *«cuando un ÚNICO producto está asociado a múltiples ofertas — el mismo par de zapatos
 * ofrecido por distintos comerciantes»*. Lo nuestro es lo contrario: un desarrollo con unidades
 * DISTINTAS. Emitirlo sería markup que no significa lo que queremos decir, que es exactamente por lo
 * que §271 no inventó un `@type: Penthouse`. El rango lo puede calcular quien lea las ofertas.
 *
 * 🐛 **El bug de La Haus, evitado a propósito**: su ficha sirve `"url": "undefined/pd/medellin/vitral"`
 * —una variable sin resolver en el SSR— y eso convierte su dato estructurado en basura para un
 * rastreador. Aquí la URL absoluta ENTRA COMO PARÁMETRO y si no es absoluta se rechaza: un JSON-LD
 * roto no falla, se indexa.
 *
 * AUSENCIAS DELIBERADAS, en la línea de §95.3 y de `jsonLdInmueble`:
 *  · sin `streetAddress` — la dirección exacta no va en el documento público.
 *  · sin `aggregateRating` — no hay reseñas de proyectos, e inventarlas es lo que sanciona la SIC.
 *  · sin `priceValidUntil` — La Haus pone un año. En preventa los precios suben: afirmar que un
 *    «desde» vale doce meses es prometer algo que no controlamos.
 */

/** El vendedor de una obra nueva es la CONSTRUCTORA, no ALTORRA (§270). Se declara como tal. */
const vendedor = (constructora: string) => ({ '@type': 'Organization', name: constructora });

/**
 * `RealEstateListing` del proyecto. **Devuelve `null` si el proyecto no se puede publicar**: un dato
 * estructurado es una afirmación legible por máquina, y no vamos a afirmar en JSON lo que la propia
 * página se niega a mostrar.
 */
export function jsonLdProyecto(
  p: Proyecto,
  urlAbsoluta: string,
  imagenes: readonly string[] = [],
): Record<string, unknown> | null {
  if (!puedePublicarseProyecto(p)) return null;
  // La URL tiene que ser absoluta y estar resuelta. Es el bug de La Haus, y se corta aquí.
  if (!/^https?:\/\//.test(urlAbsoluta) || urlAbsoluta.includes('undefined')) return null;

  const ofertas = p.tipologias
    .filter((t) => Number.isFinite(t.desde) && t.desde > 0)
    .map((t) => {
      const alojamiento: Record<string, unknown> = {
        '@type': 'Accommodation',
        name: t.nombre,
      };
      if (Number.isFinite(t.habitaciones)) alojamiento.numberOfRooms = t.habitaciones;
      if (Number.isFinite(t.banos)) alojamiento.numberOfBathroomsTotal = t.banos;
      if (Number.isFinite(t.areaM2) && t.areaM2 > 0) {
        alojamiento.floorSize = { '@type': 'QuantitativeValue', value: t.areaM2, unitCode: 'MTK' };
      }
      return {
        '@type': 'Offer',
        priceCurrency: 'COP',
        price: t.desde,
        // GoodRelations, igual que en la ficha de inmueble: sin esto no se distingue vender de arrendar.
        businessFunction: 'http://purl.org/goodrelations/v1#Sell',
        availability: p.estado === 'agotado' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        seller: vendedor(p.constructora),
        itemOffered: alojamiento,
      };
    });

  const lugar: Record<string, unknown> = {
    '@type': 'Place',
    name: p.nombre,
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.geo.ciudad,
      addressCountry: 'CO',
    },
  };

  const doc: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    url: urlAbsoluta,
    name: p.nombre,
    description: p.descripcion,
    datePosted: p.publicadoEn ?? p.createdAt,
    about: lugar,
    offers: ofertas,
  };
  if (imagenes.length) doc.image = [...imagenes];
  return doc;
}
