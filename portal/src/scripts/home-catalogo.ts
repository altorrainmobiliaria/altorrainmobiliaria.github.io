/*
 * LA PORTADA, CABLEADA AL CATÁLOGO REAL (§277).
 *
 * §276 dejó la portada honesta y, al hacerlo, dejó a la vista lo que el relleno tapaba: **ninguna de
 * sus secciones de inventario leía el índice**. Se apagaban en producción y no las encendía nadie.
 * Esto las enciende.
 *
 * TRES DECISIONES QUE NO SON DE PINTAR:
 *
 * 1. 🧬 **El marcado NO se escribe aquí.** Se clona de un `<template>` que renderiza el mismo
 *    `PropertyCard.astro` que usa el resto del sitio, y se rellena con `construirCard()`, la misma
 *    función que usa el SERP. Escribir aquí un segundo constructor de tarjetas habría sido el gemelo
 *    de §271 con otro nombre — y el que se quedaría sin actualizar sería siempre este.
 *
 * 2. 🩹 **Un fallo cae hacia el ESTADO HONESTO, nunca hacia el relleno.** Si la red falla o el shard
 *    viene vacío, la sección dice que no hay nada publicado. Es lo contrario de lo que hacía antes:
 *    ante la duda, enseñaba inventario inventado. *Un error debe dejar menos en pantalla, no más.*
 *
 * 3. 💸 **Una petición por shard y ninguna a Firestore.** Estos JSON los sirve el Worker desde su
 *    caché de borde, con `cache-tag` purgable por la Function de escritura (§54). La portada es la
 *    página más visitada del sitio: si leyera Firestore, sería la que se come el free-tier.
 */
import { construirCard, FUENTE, URL_OVERRIDE, type CatalogoItem } from './catalogo-card';

/** Ruta pública → shard. Las mismas tres que sirve `api/catalogo/[operacion].json.ts`. */
type RutaCatalogo = 'comprar' | 'arrendar' | 'estancias';

/**
 * Una sección de la portada que se alimenta del catálogo.
 *
 * `set` es el atributo que la marca en el HTML; `cuantas` es el tope, que existe porque estas
 * secciones son un escaparate y no un listado: el listado completo es el SERP, y para eso está el
 * «Ver todas» que ya llevaban.
 */
interface Seccion {
  set: string;
  ruta: RutaCatalogo;
  cuantas: number;
  vacio: string;
}

const SECCIONES: readonly Seccion[] = [
  { set: 'destacadas', ruta: 'comprar', cuantas: 2, vacio: 'Todavía no hay destacadas publicadas.' },
  { set: 'arriendo', ruta: 'arrendar', cuantas: 3, vacio: 'Todavía no hay inmuebles en arriendo publicados.' },
];

/** Los más recientes primero. `pub` es una fecha ISO, así que ordena bien como texto. */
const porFecha = (a: CatalogoItem, b: CatalogoItem): number => (b.pub ?? '').localeCompare(a.pub ?? '');

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

  const tpl = document.querySelector<HTMLTemplateElement>('#tpl-home-pcard');
  if (!tpl) return;

  // Un fetch por shard, y solo de los shards que alguna sección pide.
  const rutas = [...new Set(SECCIONES.map((s) => s.ruta))];
  const porRuta = new Map<RutaCatalogo, CatalogoItem[] | null>();
  await Promise.all(rutas.map(async (r) => { porRuta.set(r, await traerShard(r)); }));

  for (const seccion of SECCIONES) {
    const caja = document.querySelector<HTMLElement>(`[data-home-set="${seccion.set}"]`);
    if (!caja) continue;

    // `?? null` porque `Map.get` añade `undefined` al lado de mi `null`, y son el mismo caso: no
    // tenemos datos. Sin esto habría un tercer estado sin tratar, y el compilador lo dijo.
    const items = porRuta.get(seccion.ruta) ?? null;
    // `null` (falló la red) y `[]` (no hay inventario) se dicen distinto: el primero se puede
    // reintentar recargando, el segundo no. Decir «no hay nada» cuando lo que pasó es que no
    // pudimos preguntarlo es la mentira cómoda de siempre.
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
    [...items].sort(porFecha).slice(0, seccion.cuantas).forEach((it, i) => {
      try {
        const card = construirCard(tpl, it, i);
        if (card) frag.appendChild(card);
        else fallidas++;
      } catch {
        fallidas++;
      }
    });
    if (fallidas) console.warn(`[home] ${fallidas} card(s) no se pudieron construir en «${seccion.set}»`);
    // Si NINGUNA se pudo construir, la sección queda con su estado honesto y no medio pintada.
    caja.replaceChildren(frag.childNodes.length ? frag : parrafoVacio(seccion.vacio));
  }

  // Las cards nuevas necesitan que alguien vuelva a cablear sus corazones de favoritos: es el mismo
  // evento que despacha el SERP, y olvidarlo dejaba TODOS los corazones muertos sin un solo error.
  document.dispatchEvent(new CustomEvent('altorra:catalogo-pintado'));
}
