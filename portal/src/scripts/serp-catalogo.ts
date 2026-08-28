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
import { pesos } from '../lib/domain/dinero';
import { tipoCanonico } from '../lib/domain/shared';

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

/** Precio completo de la card: "$1.450.000.000". Por la puerta unica (dinero.ts), no a mano. */
const precioCard = (v: number): string => pesos(v);

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

/**
 * Ordena el catálogo según la opción elegida en «Ordenar por» (§264).
 *
 * ⚠️ El criterio se lee del TEXTO de la opción, que es lo único que el HTML declara — sus `<option>`
 * no llevan `value`, y añadirlos sería tocar el marcado aprobado. Se compara en minúsculas y por la
 * parte distintiva de cada frase, para que una tilde o una mayúscula no lo rompa en silencio.
 *
 * NUNCA muta la lista que recibe: «Relevancia» es el orden en que lo entrega el servidor, y perderlo
 * haría que esa opción dejara de poder volver.
 */
export function ordenarCatalogo(items: readonly CatalogoItem[], textoOpcion: string): CatalogoItem[] {
  const t = textoOpcion.toLowerCase();
  const copia = [...items];
  if (t.includes('menor a mayor')) return copia.sort((a, b) => a.precio - b.precio);
  if (t.includes('mayor a menor')) return copia.sort((a, b) => b.precio - a.precio);
  if (t.includes('reciente')) return copia.sort((a, b) => (b.pub ?? '').localeCompare(a.pub ?? ''));
  return copia;
}

export interface Busqueda {
  /** Texto libre: el visitante escribe una zona, no elige de una lista. */
  zona: string;
  /** Tipo canónico del dominio (`TIPOS_INMUEBLE`), no la etiqueta comercial. */
  tipo: string;
}

/**
 * LEE LA INTENCIÓN DEL VISITANTE — que hasta ahora se tiraba a la basura (§265).
 *
 * 🔴 El buscador del hero manda `zona` y `tipo` por GET a `/comprar`, y **nadie los leía**: ni la
 * página ni esta isla. Medido en el navegador: se busca «Bocagrande / Casa» y se aterriza en una
 * página titulada «Propiedades en Cartagena de Indias» con la caja rellenada con OTRA cosa. La
 * primera interacción del visitante con el sitio —el buscador del hero es la puerta de entrada— era
 * la que se descartaba en silencio.
 */
export function busquedaDeUrl(search: string): Busqueda {
  const q = new URLSearchParams(search);
  return { zona: (q.get('zona') ?? '').trim(), tipo: (q.get('tipo') ?? '').trim() };
}

/** Compara sin tildes ni mayúsculas: lo que llega por una URL viene como venga. */
const norm = (v: string): string =>
  v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * ¿Este inmueble responde a lo que se buscó?
 *
 * El TIPO se compara ya canonizado por las DOS partes: lo que llega por la URL y lo que guarda el
 * catálogo. Comparar las cadenas crudas haría que «Casa» (con mayúscula, como lo manda el
 * formulario) no casara con `casa` — y el fallo sería CERO RESULTADOS, que no se distingue de «no
 * hay nada en esa zona».
 *
 * La ZONA se acepta **en las dos direcciones** porque es texto libre: «bocagrande» encuentra el
 * sector «Bocagrande» (contiene), y «casa en bocagrande» también (contenido). Se exige ≥3 caracteres
 * al lado corto para que una letra suelta no lo empareje con todo.
 */
export function coincideBusqueda(it: { sector: string; tipo: string }, b: Busqueda): boolean {
  if (b.tipo) {
    const buscado = tipoCanonico(b.tipo);
    if (!buscado || tipoCanonico(it.tipo ?? '') !== buscado) return false;
  }
  if (b.zona) {
    const z = norm(b.zona);
    const sec = norm(it.sector ?? '');
    if (!z || !sec) return false;
    const encaja = (z.length >= 3 && sec.includes(z)) || (sec.length >= 3 && z.includes(sec));
    if (!encaja) return false;
  }
  return true;
}

/** NUNCA muta la lista que recibe: el orden que entrega el servidor es «Relevancia» y hay que poder volver. */
export function filtrarCatalogo(items: readonly CatalogoItem[], b: Busqueda): CatalogoItem[] {
  if (!b.zona && !b.tipo) return [...items];
  return items.filter((it) => coincideBusqueda(it, b));
}

/**
 * Escribe en la página LO QUE SE BUSCÓ. La caja y el H1 traían «Cartagena de Indias» escrito a mano
 * en el HTML: mostraban siempre lo mismo dijera lo que dijera la URL. Se marcan con `data-` en vez
 * de por posición — «el último span» se rompe en cuanto alguien añade uno (§123).
 */
export function reflejarBusqueda(b: Busqueda): void {
  if (!b.zona) return;
  const caja = document.querySelector<HTMLInputElement>('.serp-search input[name="zona"]');
  if (caja) caja.value = b.zona;
  const zona = document.querySelector<HTMLElement>('[data-serp-zona]');
  if (zona) zona.textContent = `en ${b.zona}`;
}

/**
 * Deja la caja de búsqueda lista para volver a buscar SIN perder el tipo elegido.
 *
 * Corre en los DOS modos —a diferencia de `bootCatalogo`, que en demo no toca nada— porque navegar
 * no depende del inventario: la caja tiene que funcionar aunque las tarjetas sean de muestra. Lo
 * único que hace es copiar el `tipo` de la URL al campo oculto; el envío lo hace el `<form>` solo.
 */
export function bootBuscador(): void {
  const oculto = document.querySelector<HTMLInputElement>('[data-serp-tipo]');
  if (oculto) oculto.value = busquedaDeUrl(location.search).tipo;
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

  // Contador honesto (el shell trae un número de demo). Va en su PROPIO elemento y no en «el primer
  // nodo de texto con contenido»: aquel dependía de que el HTML empezara por el número, así que un
  // espacio de más delante lo dejaba sin rellenar en silencio — y lo que quedaba en pantalla era el
  // conteo inventado del build (§123).
  //
  // ⚠️ Aquí vivía un aviso de que envolverlo en un `<span>` rompería la tipografía sellada. Era
  // cierto, se envolvió igual, y el número llevaba desde entonces en la tipografía del cuerpo. Ya
  // no aplica: el estilo pequeño se acotó a `[data-serp-zona]` en vez de a «todo span» (§265).
  // La intención del visitante se aplica ANTES de contar: un contador que cuenta el catálogo entero
  // mientras la lista enseña un subconjunto es la misma clase de mentira que el «128» inventado.
  const busqueda = busquedaDeUrl(location.search);
  reflejarBusqueda(busqueda);
  const hayBusqueda = Boolean(busqueda.zona || busqueda.tipo);
  const visibles = filtrarCatalogo(items, busqueda);

  const nodoNum = document.querySelector<HTMLElement>('[data-serp-n]');
  if (nodoNum) nodoNum.textContent = `${visibles.length} `;
  // «1 Propiedades» es lo que se lee en cuanto una búsqueda deja un solo resultado — y una búsqueda
  // por zona los deja a menudo. El sustantivo tiene su nodo justamente para poder concordar.
  const nodoSust = document.querySelector<HTMLElement>('[data-serp-sust]');
  if (nodoSust) nodoSust.textContent = visibles.length === 1 ? 'Propiedad' : 'Propiedades';

  if (visibles.length === 0) {
    // Los dos ceros NO son el mismo cero, y decirlos igual deja al visitante sin saber qué hacer:
    // «no hay inventario» se espera, «no hay NADA DE LO QUE PEDISTE» se corrige cambiando la búsqueda.
    if (hayBusqueda) {
      mensaje(
        grid,
        'No encontramos inmuebles con esa búsqueda',
        'Prueba con otra zona o quita el filtro de tipo para ver todo el inventario.',
      );
    } else {
      mensaje(grid, 'Aún no hay propiedades publicadas', 'Muy pronto encontrarás aquí nuestro inventario.');
    }
    setMarkersSeguro(raiz, []);
    return;
  }

  /*
   * PINTAR y ORDENAR se separan porque el `<select>` de «Ordenar por» tiene que repintar (§264).
   * Ese control lleva desde el principio en la página con sus cuatro opciones escritas y **no hacía
   * nada**: se podía elegir «Precio: menor a mayor» y la lista se quedaba igual. Un control que
   * responde al clic y no cambia nada es peor que no tenerlo — enseña que la web está rota.
   */
  const pintar = (lista: CatalogoItem[]): void => {
    // Una card defectuosa NO puede tumbar el listado entero (lección de este mismo desarrollo: una
    // excepción a mitad del bucle dejaba la página con los datos del demo y sin señal visible).
    const frag = document.createDocumentFragment();
    let fallidas = 0;
    lista.forEach((it, i) => {
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
    // ⚠️ Va también en cada REORDEN: las cards son nuevas, y sin esto los corazones morirían al
    // cambiar el orden — exactamente el mismo fallo, un año después.
    document.dispatchEvent(new CustomEvent('altorra:catalogo-pintado'));

    // Pines del mapa: SOLO los que tienen coordenadas (card sí, pin no — contrato del §57).
    // El índice sale de ESTA lista, no de la original: es lo que empareja cada pin con su card.
    const pines: PinData[] = lista
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.coords != null)
      .map(({ it, i }) => ({ i, lat: it.coords!.lat, lng: it.coords!.lng, label: precioPin(it.precio, it.operacion) }));
    setMarkersSeguro(raiz, pines);
  };

  pintar(visibles);

  /*
   * El criterio se lee del TEXTO de la opción, que es lo único que el HTML declara — no llevan
   * `value`, y añadirlos sería tocar el marcado aprobado. Se compara en minúsculas y por su parte
   * distintiva, para que una tilde o un cambio de mayúscula no lo rompa en silencio.
   */
  const orden = document.getElementById('serp-order') as HTMLSelectElement | null;
  if (orden) {
    orden.addEventListener('change', () => {
      // Se reordena lo VISIBLE: ordenar el catálogo entero repintaría lo que la búsqueda excluyó.
      pintar(ordenarCatalogo(visibles, orden.selectedOptions[0]?.textContent ?? ''));
    });
  }
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
