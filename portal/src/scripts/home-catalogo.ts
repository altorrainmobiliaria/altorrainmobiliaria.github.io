/*
 * LA PORTADA, CABLEADA AL CATÁLOGO REAL (§277 · §279).
 *
 * §276 dejó la portada honesta y, al hacerlo, dejó a la vista lo que el relleno tapaba: **ninguna de
 * sus secciones de inventario leía el índice**. Se apagaban en producción y no las encendía nadie.
 * Esto las enciende: destacadas, arriendo, venta, estancias y «publicadas recientemente».
 *
 * CUATRO DECISIONES QUE NO SON DE PINTAR:
 *
 * 1. 🧬 **El marcado NO se escribe aquí.** Cada sección clona un `<template>` que renderiza su propio
 *    componente —`PropertyCard`, `LuCard`, `StayCard`— y este módulo solo RELLENA los nodos. Escribir
 *    aquí una segunda versión de esas tarjetas habría sido el gemelo de §271 con otro nombre.
 *
 * 2. 🚫 **Lo que el índice no guarda, no se inventa: se QUITA.** `LuCard` sabe pintar un lema, unos
 *    círculos de color y un número de tipologías; el catálogo no guarda nada de eso, así que esos
 *    nodos ni se emiten. La tarjeta sale más sobria que en el mockup, y eso es exactamente lo que
 *    corresponde. *La alternativa —rellenarlos con algo plausible— es como empezó todo esto.*
 *
 * 3. 🩹 **Un fallo cae hacia el ESTADO HONESTO, nunca hacia el relleno.** Y «no hay inventario» y
 *    «no pudimos preguntarlo» se dicen DISTINTO: el segundo se arregla recargando, el primero no.
 *
 * 4. 💸 **Una petición por shard y ninguna a Firestore.** Estos JSON los sirve el Worker desde su
 *    caché de borde (§54). La portada es la página más visitada: si leyera Firestore, sería la que
 *    se come el free-tier.
 */
import { construirCard, FUENTE, URL_OVERRIDE, hrefFicha, precioCard, sufijoCompacto, texto, type CatalogoItem } from './catalogo-card';
import { etiquetaBadge } from '../lib/domain/ficha';
import { etiquetaTipo, tipoCanonico } from '../lib/domain/shared';
import { notaVisible, textoNota } from '../lib/domain/resenas';
import { haceCuanto } from '../lib/domain/tiempo';
import { urlMedia } from '../lib/media';

/** Ruta pública → shard. Las mismas tres que sirve `api/catalogo/[operacion].json.ts`. */
type RutaCatalogo = 'comprar' | 'arrendar' | 'estancias';

/** Construye el nodo de una tarjeta a partir de su plantilla. `null` = no se pudo. */
type Pintor = (tpl: HTMLTemplateElement, it: CatalogoItem, i: number) => DocumentFragment | null;

interface Seccion {
  /** Atributo que marca el contenedor en el HTML. */
  set: string;
  ruta: RutaCatalogo;
  /** Id de la plantilla de su tarjeta. */
  tpl: string;
  /** Tope: estas secciones son un ESCAPARATE, no un listado — el listado es el SERP. */
  cuantas: number;
  /** Por qué se ordena. `fecha` (lo último que entró) salvo «valoradas», que se ordena por NOTA. */
  orden?: 'fecha' | 'nota';
  vacio: string;
  pintar: Pintor;
}

/** Los más recientes primero. `pub` es una fecha ISO, así que ordena bien como texto. */
const porFecha = (a: CatalogoItem, b: CatalogoItem): number => (b.pub ?? '').localeCompare(a.pub ?? '');

/**
 * De mayor nota a menor. Lo que NO tiene nota enseñable va al final y `pintarRank` lo descarta —
 * ordenar por un promedio ausente pondría lo desconocido por delante de lo bueno.
 */
const porNota = (a: CatalogoItem, b: CatalogoItem): number =>
  (notaVisible(b.resenas)?.promedio ?? -1) - (notaVisible(a.resenas)?.promedio ?? -1);

const fechaDe = (it: CatalogoItem): Date | null => {
  const t = Date.parse(it.pub ?? '');
  return Number.isFinite(t) ? new Date(t) : null;
};

/** Etiqueta legible del tipo, o cadena vacía si el valor no es del vocabulario. */
const tipoLegible = (it: CatalogoItem): string => {
  const t = tipoCanonico(it.tipo ?? '');
  return t ? etiquetaTipo(t) : '';
};

/** Precio con su sufijo compacto: «$450.000.000» · «$4.200.000/mes». */
const precioConSufijo = (it: CatalogoItem): string => `${precioCard(it.precio)}${sufijoCompacto(it.operacion)}`;

/** Imagen y enlace, que son iguales en las tres tarjetas. */
function media(frag: DocumentFragment, it: CatalogoItem, selImg: string): void {
  const img = frag.querySelector<HTMLImageElement>(selImg);
  if (img) {
    img.src = urlMedia(it.thumb);
    // El `alt` describe lo que se ve, y lo que sabemos del inmueble es su tipo y su zona.
    img.alt = [tipoLegible(it), it.sector].filter(Boolean).join(' en ') || it.titulo;
  }
  for (const a of Array.from(frag.querySelectorAll<HTMLAnchorElement>('a[href]'))) a.href = hrefFicha(it);
}

/** Tarjeta grande del carrusel de venta (`LuCard`). */
const pintarLu: Pintor = (tpl, it) => {
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  if (!frag.querySelector('.alt-lucard')) return null;
  media(frag, it, '.alt-lucard__img');
  texto(frag, '.alt-lucard__zona', it.sector || null);
  texto(frag, '.alt-lucard__title a', it.titulo);
  texto(frag, '.alt-lucard__badge', etiquetaBadge(it.operacion));
  texto(frag, '.alt-lucard__price', precioConSufijo(it));

  // Specs: se construyen las que HAY, con su separador entre medias. Si no hay ninguna, el bloque
  // entero se va — una fila de puntos sin datos es peor que no tener fila.
  const specs = frag.querySelector<HTMLElement>('.alt-lucard__specs');
  if (specs) {
    const partes = [
      it.hab != null ? `${it.hab} hab.` : null,
      it.ban != null ? `${it.ban} baños` : null,
      it.area != null ? `${it.area} m²` : null,
    ].filter((x): x is string => x !== null);
    if (!partes.length) specs.remove();
    else {
      const dentro = document.createDocumentFragment();
      partes.forEach((p, i) => {
        if (i > 0) {
          const dot = document.createElement('span');
          dot.className = 'alt-lucard__dot';
          dot.setAttribute('aria-hidden', 'true');
          dentro.appendChild(dot);
        }
        const s = document.createElement('span');
        s.textContent = p;
        dentro.appendChild(s);
      });
      specs.replaceChildren(dentro);
    }
  }
  return frag;
};

/** Tarjeta de alojamiento por días (`StayCard`). */
const pintarStay: Pintor = (tpl, it) => {
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  if (!frag.querySelector('.alt-staycard')) return null;
  media(frag, it, '.alt-staycard__img');
  texto(frag, '.alt-staycard__t', it.titulo);
  // ⚠️ `meta` es OBLIGATORIO en la tarjeta y el mockup lo llenaba con «Vista al mar · 6 huéspedes».
  // El índice no guarda ni la vista ni el aforo. Se compone con lo que SÍ consta —zona y tipo—, que
  // es información de verdad; inventar un número de huéspedes en un alojamiento sería, además de
  // falso, la clase de dato con el que alguien reserva.
  texto(frag, '.alt-staycard__meta', [it.sector, tipoLegible(it)].filter(Boolean).join(' · ') || null);
  texto(frag, '.alt-staycard__price b', precioCard(it.precio));
  return frag;
};

/** Posiciones del mosaico bento, en el orden del mockup. Son LAYOUT, no dato. */
const RANURAS = [
  { col: 'span 2', row: 'span 2', size: 'xl' },
  { col: '4', row: 'span 2', size: 'md' },
  { col: '3', row: '1', size: 'sm' },
  { col: '3', row: '2', size: 'sm' },
  { col: 'span 2', row: '3', size: 'md' },
  { col: '3', row: '3', size: 'sm' },
  { col: '4', row: '3', size: 'sm' },
] as const;

const HACE_POCO_MS = 7 * 24 * 60 * 60 * 1000;

/** Tile del mosaico «Publicadas recientemente». */
const pintarTile: Pintor = (tpl, it, i) => {
  const ranura = RANURAS[i];
  if (!ranura) return null;
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  const tile = frag.querySelector<HTMLElement>('.home-rec__tile');
  if (!tile) return null;
  tile.className = `home-rec__tile home-rec__tile--${ranura.size}`;
  tile.style.gridColumn = ranura.col;
  tile.style.gridRow = ranura.row;
  media(frag, it, 'img');
  texto(frag, '.home-rec__tag', [etiquetaBadge(it.operacion), it.sector].filter(Boolean).join(' · '));
  texto(frag, '.home-rec__t', it.titulo);
  texto(frag, '.home-rec__price', precioConSufijo(it));

  const fecha = fechaDe(it);
  // «hace 2 h» se CALCULA. Estaba escrito a mano en el build y era falso el minuto siguiente (§276).
  texto(frag, '.home-rec__time', fecha ? haceCuanto(fecha) : null);
  // Y «Nuevo» solo si lo es de verdad: una semana. Un badge que llevan todos no distingue nada.
  const esNuevo = fecha != null && Date.now() - fecha.getTime() < HACE_POCO_MS;
  if (!esNuevo) frag.querySelector('.home-rec__new')?.remove();
  return frag;
};

/**
 * «Mejor valoradas» — la única sección que puede quedarse vacía teniendo inventario (§281).
 *
 * 🎯 Y eso es correcto: pinta solo lo que tiene nota QUE SE PUEDA ENSEÑAR, y `notaVisible()` exige
 * un mínimo de reseñas. Con inventario recién publicado no habrá ninguna, y la sección lo dirá — que
 * es exactamente lo contrario de lo que hacía antes, cuando enseñaba cuatro notas inventadas.
 *
 * El orden es por NOTA, no por fecha: es lo único que justifica que la sección se llame así.
 */
const pintarRank: Pintor = (tpl, it, i) => {
  const nota = notaVisible(it.resenas);
  if (!nota) return null; // sin nota enseñable no entra: la sección es de valoradas, no de todas
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  if (!frag.querySelector('.alt-rankcard')) return null;
  media(frag, it, '.alt-rankcard__media img');
  texto(frag, '.alt-rankcard__rank', String(i + 1).padStart(2, '0'));
  texto(frag, '.alt-rankcard__zona', it.sector || null);
  texto(frag, '.alt-rankcard__t', it.titulo);
  texto(frag, '.alt-rankcard__price', precioConSufijo(it));
  // La nota y su recuento van JUNTOS, en un solo texto: es la regla 3 de §281 hecha marcado.
  texto(frag, '.alt-rankcard__rate', textoNota(nota));
  return frag;
};

const SECCIONES: readonly Seccion[] = [
  { set: 'venta', ruta: 'comprar', tpl: '#tpl-home-lucard', cuantas: 5, vacio: 'Todavía no hay propiedades en venta publicadas.', pintar: pintarLu },
  { set: 'destacadas', ruta: 'comprar', tpl: '#tpl-home-pcard', cuantas: 2, vacio: 'Todavía no hay destacadas publicadas.', pintar: construirCard },
  { set: 'arriendo', ruta: 'arrendar', tpl: '#tpl-home-pcard', cuantas: 3, vacio: 'Todavía no hay inmuebles en arriendo publicados.', pintar: construirCard },
  { set: 'estancias', ruta: 'estancias', tpl: '#tpl-home-staycard', cuantas: 5, vacio: 'Todavía no hay alojamientos por días publicados.', pintar: pintarStay },
  { set: 'valoradas', ruta: 'estancias', tpl: '#tpl-home-rankcard', cuantas: 4, orden: 'nota', vacio: 'Aún no hay propiedades con reseñas suficientes para valorarlas.', pintar: pintarRank },
  { set: 'recientes', ruta: 'comprar', tpl: '#tpl-home-tile', cuantas: RANURAS.length, vacio: 'Estamos preparando la publicación del inventario. Escríbenos por WhatsApp y te contamos qué tenemos disponible hoy.', pintar: pintarTile },
];

async function traerShard(ruta: RutaCatalogo): Promise<CatalogoItem[] | null> {
  const url = URL_OVERRIDE ?? `/api/catalogo/${ruta}.json`;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    const body = (await res.json()) as { ok?: boolean; items?: CatalogoItem[] };
    if (!res.ok || body.ok === false || !Array.isArray(body.items)) return null;
    return body.items;
  } catch {
    return null;
  }
}

/** El párrafo de vacío que ya usa la portada, para no inventar una clase nueva. */
function parrafoVacio(texto: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.className = 'home-vacio';
  p.textContent = texto;
  return p;
}

export async function bootHomeCatalogo(): Promise<void> {
  if (FUENTE !== 'live') return; // modo DEMO: las tarjetas de muestra son del diseño, no se tocan.

  // Un fetch por shard, y solo de los shards que alguna sección pide. Cinco secciones, tres
  // peticiones — porque tres de ellas beben del mismo.
  const rutas = [...new Set(SECCIONES.map((s) => s.ruta))];
  const porRuta = new Map<RutaCatalogo, CatalogoItem[] | null>();
  await Promise.all(rutas.map(async (r) => { porRuta.set(r, await traerShard(r)); }));

  let pintadas = 0;
  for (const seccion of SECCIONES) {
    const caja = document.querySelector<HTMLElement>(`[data-home-set="${seccion.set}"]`);
    const tpl = document.querySelector<HTMLTemplateElement>(seccion.tpl);
    if (!caja || !tpl) continue;

    // `?? null` porque `Map.get` añade `undefined` al lado de mi `null`, y son el mismo caso: no
    // tenemos datos. Sin esto habría un tercer estado sin tratar, y el compilador lo dijo.
    const items = porRuta.get(seccion.ruta) ?? null;
    if (items === null) {
      caja.replaceChildren(parrafoVacio('No pudimos cargar esta sección. Recarga la página en un momento.'));
      continue;
    }
    if (!items.length) {
      caja.replaceChildren(parrafoVacio(seccion.vacio));
      continue;
    }

    const frag = document.createDocumentFragment();
    let fallidas = 0;
    const ordenados = seccion.orden === 'nota' ? [...items].sort(porNota) : [...items].sort(porFecha);
    ordenados.slice(0, seccion.cuantas).forEach((it, i) => {
      try {
        const card = seccion.pintar(tpl, it, i);
        if (card) frag.appendChild(card);
        else fallidas++;
      } catch {
        fallidas++;
      }
    });
    if (fallidas) console.warn(`[home] ${fallidas} card(s) no se pudieron construir en «${seccion.set}»`);
    // Si NINGUNA se pudo construir, la sección queda con su estado honesto y no medio pintada.
    if (frag.childNodes.length) {
      caja.replaceChildren(frag);
      pintadas++;
    } else {
      caja.replaceChildren(parrafoVacio(seccion.vacio));
    }
  }

  // Las cards nuevas necesitan que alguien vuelva a cablear sus corazones de favoritos: es el mismo
  // evento que despacha el SERP, y olvidarlo dejaba TODOS los corazones muertos sin un solo error.
  // Solo se despacha si de verdad hay tarjetas: un evento sobre una página vacía no avisa de nada.
  if (pintadas) document.dispatchEvent(new CustomEvent('altorra:catalogo-pintado'));
}
