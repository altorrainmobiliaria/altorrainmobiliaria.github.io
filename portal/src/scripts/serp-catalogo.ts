// Isla del CATÁLOGO REAL en el SERP (ADR §59) — shell prerenderizado + isla JSON (stack sellado R5).
//
// Por defecto NO hace NADA (`PUBLIC_CATALOGO_SOURCE=demo`): el SERP sigue mostrando el demo tal cual,
// cero regresión. En `live` pide `/api/catalogo/{operacion}.json` y reemplaza las cards y los pines
// del mapa con el inventario REAL. El cutover es un FLIP DE FLAG, no un cambio de código (§54.4 cond.6).
//
// 🎯 El markup de la card NO se duplica aquí: se CLONA de un `<template>` que renderiza el propio
// `PropertyCard.astro`. Así el HTML tiene UN dueño y no puede divergir del componente (L-29).

import { setMarkers, type PinData } from './altorra-map';
// La composición de URLs de media tiene UN dueño (`lib/media`). La isla tenía su propia copia y
// esa copia devolvía la clave RELATIVA cuando no hay base configurada, así que la misma foto
// resolvía distinto según la ruta desde la que se pintara. Dos copias, dos comportamientos.
import { urlMedia } from '../lib/media';

type Operacion = 'venta' | 'arriendo' | 'alojamiento';

interface CatalogoItem {
  id: string;
  slug: string;
  titulo: string;
  operacion: Operacion;
  tipo: string;
  precio: number;
  sector: string;
  coords: { lat: number; lng: number } | null;
  hab?: number;
  ban?: number;
  area?: number;
  thumb: string;
  badges?: string[];
  pub: string;
}

const FUENTE = (import.meta.env.PUBLIC_CATALOGO_SOURCE as string | undefined) ?? 'demo';
/** Override de la URL del JSON (pruebas con fixture; en prod = la ruta del Worker). */
const URL_OVERRIDE = import.meta.env.PUBLIC_CATALOGO_URL as string | undefined;
const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

const etiquetaBadge = (op: Operacion): string =>
  op === 'venta' ? 'En venta' : op === 'arriendo' ? 'Arriendo' : 'Corta estancia';

const sufijoPrecio = (op: Operacion): string => (op === 'arriendo' ? '/mes' : op === 'alojamiento' ? '/noche' : '');

/** Precio completo de la card: "$1.450.000.000". */
const precioCard = (v: number): string => `$${nf.format(v)}`;

/** Precio COMPACTO del pin del mapa: "$1.450M" · "$8,5M/mes" · "$400K/noche". */
function precioPin(v: number, op: Operacion): string {
  const suf = sufijoPrecio(op);
  if (v < 1_000_000) return `$${nf.format(Math.round(v / 1000))}K${suf}`;
  const millones = v / 1_000_000;
  const txt =
    millones >= 100
      ? nf.format(Math.round(millones))
      : millones.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  return `$${txt}M${suf}`;
}

/**
 * Ficha del inmueble — la ruta CANÓNICA (§97). Antes apuntaba a `/ficha?id=…`, que hoy responde un 301
 * hacia aquí: enlazar el destino final ahorra un salto por card y evita repartir el posicionamiento
 * entre dos URLs. El `slug` manda; sin slug, el id, que siempre existe.
 */
const hrefFicha = (it: CatalogoItem): string => `/inmueble/${encodeURIComponent(it.slug || it.id)}`;

function texto(root: ParentNode, sel: string, valor: string | null): void {
  const el = root.querySelector<HTMLElement>(sel);
  if (!el) return;
  if (valor === null) el.remove();
  else el.textContent = valor;
}

/** Rellena un clon del `<template>` de PropertyCard con los datos reales. */
function construirCard(tpl: HTMLTemplateElement, it: CatalogoItem, idx: number): DocumentFragment | null {
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  const card = frag.querySelector<HTMLElement>('.alt-pcard');
  if (!card) return null;

  card.dataset.pin = String(idx);
  // Clave ESTABLE para favoritos: el id del documento, que no cambia nunca. Derivarlo de la URL
  // ataba lo guardado en localStorage al formato del enlace, y ese formato ya cambió una vez (§97).
  card.dataset.inmId = it.id;

  const img = frag.querySelector<HTMLImageElement>('.alt-pcard__media img');
  if (img) {
    img.src = urlMedia(it.thumb);
    img.alt = it.titulo;
  }
  texto(frag, '.alt-pcard__badge', etiquetaBadge(it.operacion));
  texto(frag, '.alt-pcard__zona', it.sector);

  // Specs: el template trae los 3; se ELIMINA el que no tenga dato (no se inventa, L-29).
  const specs = frag.querySelectorAll<HTMLElement>('.alt-pcard__specs span');
  const valores = [it.hab, it.ban, it.area != null ? `${it.area} m²` : undefined];
  specs.forEach((sp, i) => {
    const v = valores[i];
    if (v == null) {
      sp.remove();
      return;
    }
    // Conserva el <svg> del icono y reemplaza SOLO el texto que va después.
    const nodoTexto = Array.from(sp.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
    if (nodoTexto) nodoTexto.nodeValue = String(v);
    else sp.append(String(v));
  });

  const enlaceTitulo = frag.querySelector<HTMLAnchorElement>('.alt-pcard__title a');
  if (enlaceTitulo) {
    enlaceTitulo.href = hrefFicha(it);
    enlaceTitulo.textContent = it.titulo;
  }
  const orbe = frag.querySelector<HTMLAnchorElement>('.alt-pcard__orb');
  if (orbe) {
    orbe.href = hrefFicha(it);
    orbe.setAttribute('aria-label', `Ver ${it.titulo}`);
  }

  // PRECIO — reconstrucción DETERMINISTA: [texto][sufijo?]. Se hace en este ORDEN a propósito: insertar
  // ANTES de eliminar el sufijo (si se elimina primero, `insertBefore` con esa referencia lanza
  // NotFoundError — el nodo ya no es hijo). El template no trae texto de precio (placeholder ""), así
  // que no se puede depender de encontrar un nodo de texto previo.
  const precio = frag.querySelector<HTMLElement>('.alt-pcard__price');
  if (precio) {
    precio.querySelector('.alt-pcard__price-lbl')?.remove(); // "Desde" es del demo; el dato real es exacto
    const sfx = precio.querySelector<HTMLElement>('.alt-pcard__price-sfx');
    for (const n of Array.from(precio.childNodes)) if (n.nodeType === Node.TEXT_NODE) n.remove();
    precio.insertBefore(document.createTextNode(precioCard(it.precio)), sfx); // sfx null ⇒ al final
    const suf = sufijoPrecio(it.operacion);
    if (suf) {
      if (sfx) sfx.textContent = suf;
    } else sfx?.remove();
  }
  return frag;
}

function mensaje(grid: HTMLElement, titulo: string, detalle: string): void {
  grid.replaceChildren();
  const box = document.createElement('div');
  box.className = 'serp-msg';
  box.setAttribute('role', 'status');
  const h = document.createElement('p');
  h.className = 'serp-msg__t';
  h.textContent = titulo;
  const p = document.createElement('p');
  p.className = 'serp-msg__d';
  p.textContent = detalle;
  // `appendChild` y NO `append`: los tipos de Cloudflare Workers fusionan su `Element.append(string)`
  // (HTMLRewriter) con el `Element` del DOM y la sobrecarga con Node deja de existir.
  box.appendChild(h);
  box.appendChild(p);
  grid.appendChild(box);
}

export async function bootCatalogo(): Promise<void> {
  if (FUENTE !== 'live') return; // modo DEMO: no tocar nada

  const grid = document.querySelector<HTMLElement>('.serp-grid');
  const tpl = document.querySelector<HTMLTemplateElement>('#tpl-pcard');
  const raiz = document.querySelector<HTMLElement>('[data-serp]');
  if (!grid || !tpl || !raiz) return;

  const operacion = raiz.dataset.serp ?? 'comprar';
  const url = URL_OVERRIDE ?? `/api/catalogo/${operacion}.json`;

  // "Cargar más" es paginación aún NO implementada: en live no se promete lo que no hay.
  document.querySelector<HTMLElement>('.serp-more')?.remove();

  let items: CatalogoItem[] = [];
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    const body = (await res.json()) as { ok?: boolean; items?: CatalogoItem[] };
    if (!res.ok || body.ok === false || !Array.isArray(body.items)) {
      mensaje(grid, 'No pudimos cargar el catálogo', 'Vuelve a intentarlo en unos minutos.');
      setMarkersSeguro(raiz, []);
      return;
    }
    items = body.items;
  } catch {
    mensaje(grid, 'No pudimos cargar el catálogo', 'Revisa tu conexión e inténtalo de nuevo.');
    setMarkersSeguro(raiz, []);
    return;
  }

  // Contador honesto (el shell trae un número de demo). Se escribe SOLO el nodo de texto inicial del
  // h1: envolverlo en un <span> heredaría el estilo de `.serp-h1 span` (el "en Cartagena…") y rompería
  // la tipografía sellada (§3.2).
  // Elemento propio y no «el primer nodo de texto con contenido»: aquel dependía de que el HTML
  // empezara por el número, así que un espacio de más delante lo dejaba sin rellenar en silencio
  // — y lo que quedaba en pantalla era el conteo inventado del build (§123).
  const nodoNum = document.querySelector<HTMLElement>('[data-serp-n]');
  if (nodoNum) nodoNum.textContent = `${items.length} `;

  if (items.length === 0) {
    mensaje(grid, 'Aún no hay propiedades publicadas', 'Muy pronto encontrarás aquí nuestro inventario.');
    setMarkersSeguro(raiz, []);
    return;
  }

  // Una card defectuosa NO puede tumbar el listado entero (lección de este mismo desarrollo: una
  // excepción a mitad del bucle dejaba la página con los datos del demo y sin señal visible).
  const frag = document.createDocumentFragment();
  let fallidas = 0;
  items.forEach((it, i) => {
    try {
      const card = construirCard(tpl, it, i);
      if (card) frag.appendChild(card);
      else fallidas++;
    } catch {
      fallidas++;
    }
  });
  if (fallidas) console.warn(`[catalogo] ${fallidas} card(s) no se pudieron construir`);
  if (!frag.childNodes.length) {
    mensaje(grid, 'No pudimos mostrar el catálogo', 'Estamos trabajando en ello.');
    setMarkersSeguro(raiz, []);
    return;
  }
  grid.replaceChildren(frag);
  // AVISO de que hay cards nuevas en el DOM. `BaseLayout` escucha este evento para re-cablear los
  // corazones de favoritos, y nadie lo despachaba: en `live`, TODAS las cards del SERP salían con el
  // corazón muerto — se pintaba, se podía pulsar y no guardaba nada, sin un error en consola.
  document.dispatchEvent(new CustomEvent('altorra:catalogo-pintado'));

  // Pines del mapa: SOLO los que tienen coordenadas (card sí, pin no — contrato del §57).
  const pines: PinData[] = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => it.coords != null)
    .map(({ it, i }) => ({ i, lat: it.coords!.lat, lng: it.coords!.lng, label: precioPin(it.precio, it.operacion) }));
  setMarkersSeguro(raiz, pines);
}

/** El mapa puede no haber montado (WebGL ausente): nunca romper el listado por eso. */
function setMarkersSeguro(raiz: HTMLElement, pines: PinData[]): void {
  const mapa = raiz.querySelector<HTMLElement>('[data-alt-map]');
  if (!mapa) return;
  try {
    setMarkers(mapa, pines);
    // Los pines ESQUEMÁTICOS del shell son del demo: en live sobran.
    mapa.querySelectorAll('[data-schematic][data-pin-idx]').forEach((p) => p.remove());
  } catch {
    /* el mapa no montó; el listado sigue funcionando */
  }
}
