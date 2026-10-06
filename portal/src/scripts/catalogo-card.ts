/*
 * LO COMPARTIDO DEL CATÁLOGO — el ítem, de dónde se lee, y cómo se pinta una tarjeta (§277).
 *
 * Vive aparte porque lo usan TRES islas: la del SERP (`serp-catalogo.ts`), la de la portada
 * (`home-catalogo.ts`) y la de `/estancias` (`estancias-catalogo.ts`), que pinta la MISMA `StayCard`
 * que la portada con el mismo pintor. Al principio la portada importaba directamente del SERP, y el
 * gate `verify:css` lo cazó por un camino inesperado: se quejó de que la portada «busca ids que la página
 * NO declara» —`serp-order`, el desplegable de ordenar del SERP—, porque importar ese módulo
 * arrastra el módulo ENTERO, con su boot, su mapa y sus selectores.
 *
 * 🎯 El gate tenía razón por debajo de su propio mensaje: el problema no era el id, era el
 * ACOPLAMIENTO. Extraer lo común lo deshace, y de paso la portada deja de arrastrar el mapa y la
 * liquidación del SERP para pintar dos tarjetas.
 *
 * 🧬 El markup de la card NO se escribe aquí: se CLONA de un `<template>` que renderiza el propio
 * `PropertyCard.astro`. Así el HTML tiene UN dueño y no puede divergir del componente (L-29).
 */
import { urlMedia } from '../lib/media';
import { pesos } from '../lib/domain/dinero';
import { esAnunciable, rutaDeResumen } from '../lib/domain/catalogo';
import type { CatalogoResumen } from '../lib/domain/catalogo';
import { numeroRnt, textoRnt } from '../lib/domain/rnt';
// El tipo de operación y la etiqueta del badge tienen DUEÑO en el dominio; aquí había copias a mano
// (§277). Las cazó `verify:simbolos` al exportarlas: por separado las dos eran legítimas, y por eso
// no las veía ningún otro gate.
import { etiquetaBadgeResumen } from '../lib/domain/ficha';
import { etiquetaTipo, tipoCanonico } from '../lib/domain/shared';
import type { Operacion } from '../lib/domain/shared';

/**
 * Lo que sirve `api/catalogo/[operacion].json`. **NO es un tipo nuevo**: es exactamente el
 * `CatalogoResumen` del dominio, que es quien construye ese JSON.
 *
 * 🔴 Aquí había una copia A MANO de esa interfaz. Se mantuvieron iguales hasta que el dominio ganó
 * un campo (la calificación, §281) y la copia no — y lo cazó el COMPILADOR, no una revisión. Es el
 * gemelo de §271 con otro disfraz: dos declaraciones del mismo concepto, cada una correcta por su
 * cuenta, y ningún error hasta que las comparas. Ahora hay un dueño y esto es un alias.
 */
export type CatalogoItem = CatalogoResumen;

export const FUENTE = (import.meta.env.PUBLIC_CATALOGO_SOURCE as string | undefined) ?? 'demo';
/** Override de la URL del JSON (pruebas con fixture; en prod = la ruta del Worker). */
export const URL_OVERRIDE = import.meta.env.PUBLIC_CATALOGO_URL as string | undefined;
export const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** Ruta pública → shard. Las mismas tres que sirve `api/catalogo/[operacion].json.ts`. */
export type RutaCatalogo = 'comprar' | 'arrendar' | 'estancias';

/** Construye el nodo de una tarjeta a partir de su plantilla. `null` = no se pudo, o no se debe. */
export type Pintor = (tpl: HTMLTemplateElement, it: CatalogoItem, i: number) => DocumentFragment | null;

/**
 * Los dos estados honestos que comparten la portada y `/estancias`, con las mismas palabras (§276).
 * «No hay inventario» y «no pudimos preguntarlo» se dicen DISTINTO: el segundo se arregla recargando.
 */
export const TEXTO_SIN_ALOJAMIENTOS = 'Todavía no hay alojamientos por días publicados.';
export const TEXTO_ERROR_CARGA = 'No pudimos cargar esta sección. Recarga la página en un momento.';

/**
 * Los más recientes primero. `pub` es una fecha ISO, así que ordena bien como texto.
 *
 * ⚠️ Un `pub` que no sea texto cuenta como «sin fecha» (al final): un `sort` que lanza no descarta
 * UN ítem, tumba la sección entera y la deja en «Cargando…».
 */
const pubDe = (it: CatalogoItem): string => (typeof it?.pub === 'string' ? it.pub : '');
export const masRecientePrimero = (a: CatalogoItem, b: CatalogoItem): number => pubDe(b).localeCompare(pubDe(a));

/**
 * El shard de una ruta, o `null` si no se pudo leer. Una petición por shard y ninguna a Firestore:
 * estos JSON los sirve el Worker desde su caché de borde (§54).
 */
export async function traerShard(ruta: RutaCatalogo): Promise<CatalogoItem[] | null> {
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

/**
 * El párrafo de un estado vacío o de error, con la clase de la página que lo pide.
 *
 * ⚠️ `verify:css` NO ve una clase que llega por parámetro: quien llame declara la suya en
 * `:global()`, porque este nodo lo crea el JS y no lleva el atributo con el que Astro acota.
 */
export function parrafoVacio(clase: string, texto: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.className = clase;
  p.textContent = texto;
  return p;
}

/**
 * Sufijo COMPACTO, sin espacios: «$8,5M/mes» · «$400K/noche».
 *
 * ⚠️ Hay otro `sufijoPrecio` en `lib/domain/ficha.ts` y devuelve « / mes», CON espacios. No es una
 * copia mal hecha: la ficha tiene sitio de sobra y el pin de un mapa no. Compartían nombre, que es
 * el gemelo peor —mismo tipo, salida distinta, y las dos se leen bien— así que este dice en el suyo
 * para qué es. Importar el equivocado compilaría y cambiaría el texto en silencio.
 */
export const sufijoCompacto = (op: Operacion): string => (op === 'arriendo' ? '/mes' : op === 'alojamiento' ? '/noche' : '');

/** Precio completo de la card: "$1.450.000.000". Por la puerta unica (dinero.ts), no a mano. */
export const precioCard = (v: number): string => pesos(v);

/**
 * Monto en COP, corto y legible: `$450M`, `$1.200M`, `$850K`.
 *
 * ⚠️ Vive SEPARADO de `precioPin` porque §273 lo necesita sin el sufijo de operación (el rótulo de
 * un chip dice «Hasta $500M», no «Hasta $500M/mes»). Se extrae en vez de copiarse: un TERCER
 * formateador de precios es justo el gemelo que §271 acaba de pagar.
 */
export function montoCorto(v: number): string {
  if (v < 1_000_000) return `$${nf.format(Math.round(v / 1000))}K`;
  const millones = v / 1_000_000;
  const txt =
    millones >= 100
      ? nf.format(Math.round(millones))
      : millones.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  return `$${txt}M`;
}

/** Precio COMPACTO del pin del mapa: "$1.450M" · "$8,5M/mes" · "$400K/noche". */
export function precioPin(v: number, op: Operacion): string {
  return `${montoCorto(v)}${sufijoCompacto(op)}`;
}

/**
 * El pin de UN ITEM del catálogo (§310). Un proyecto de obra nueva no cuesta su `precio`: ése es el
 * de entrada, y un pin que diga «$450M» a secas afirma un precio que no existe.
 *
 * Se antepone «Desde» y no un «+» detrás: el signo hay que descifrarlo y encima se confunde con un
 * «más de», que es lo contrario de lo que dice el dato. Cabe: el pin ya estira con el sufijo «/mes».
 */
export const precioPinItem = (it: CatalogoItem): string =>
  (it.precioHasta != null && it.precioHasta > it.precio ? 'Desde ' : '') + precioPin(it.precio, it.operacion);

/**
 * Ficha del item — la ruta CANÓNICA (§97). **Delega en `rutaDeResumen`, el dueño único** (§284.5):
 * desde que obra nueva entra al mismo shard de venta, «la URL de una card» dejó de tener una sola
 * respuesta, y tenerla escrita aquí Y en el correo del digest era la forma de que una de las dos se
 * quedara vieja. Se conserva el nombre porque lo usan tres scripts; lo que ya no tiene es lógica.
 */
export const hrefFicha = (it: CatalogoItem): string => rutaDeResumen(it);

export function texto(root: ParentNode, sel: string, valor: string | null): void {
  const el = root.querySelector<HTMLElement>(sel);
  if (!el) return;
  if (valor === null) el.remove();
  else el.textContent = valor;
}

/** Etiqueta legible del tipo, o cadena vacía si el valor no es del vocabulario. */
const tipoLegible = (it: CatalogoItem): string => {
  const t = tipoCanonico(it.tipo ?? '');
  return t ? etiquetaTipo(t) : '';
};

/** Imagen y enlace, que son iguales en las tarjetas que se clonan de un `<template>`. */
export function rellenarMedia(frag: DocumentFragment, it: CatalogoItem, selImg: string): void {
  const img = frag.querySelector<HTMLImageElement>(selImg);
  if (img) {
    img.src = urlMedia(it.thumb);
    // El `alt` describe lo que se ve, y lo que sabemos del inmueble es su tipo y su zona.
    img.alt = [tipoLegible(it), it.sector].filter(Boolean).join(' en ') || it.titulo;
  }
  for (const a of Array.from(frag.querySelectorAll<HTMLAnchorElement>('a[href]'))) a.href = hrefFicha(it);
}

/** Rellena un clon del `<template>` de PropertyCard con los datos reales. */
export function construirCard(tpl: HTMLTemplateElement, it: CatalogoItem, idx: number): DocumentFragment | null {
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
  // El sello lo decide el DOMINIO (§310): un proyecto en preventa no dice «En venta», dice «En
  // preventa» — que es lo que cambia la decisión de quien mira.
  texto(frag, '.alt-pcard__badge', etiquetaBadgeResumen(it));
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
    // El «Desde» del template se quita porque el precio de un inmueble es EXACTO… pero el de un
    // proyecto de obra nueva no lo es: es el de su tipología más barata (§284). Ahí la etiqueta del
    // mockup deja de ser adorno del demo y pasa a ser la única palabra que hace cierta la cifra —
    // sin ella la card afirma que el desarrollo cuesta $450M, que es la clase de dato correcto y
    // frase falsa que §280 tuvo que arrancar de `/publicar`. Se REUTILIZA el elemento del mockup; no
    // se inventa ninguno.
    const etiqueta = precio.querySelector('.alt-pcard__price-lbl');
    if (it.precioHasta != null && it.precioHasta > it.precio) {
      if (etiqueta) etiqueta.textContent = 'Desde';
    } else etiqueta?.remove();
    const sfx = precio.querySelector<HTMLElement>('.alt-pcard__price-sfx');
    for (const n of Array.from(precio.childNodes)) if (n.nodeType === Node.TEXT_NODE) n.remove();
    precio.insertBefore(document.createTextNode(precioCard(it.precio)), sfx); // sfx null ⇒ al final
    const suf = sufijoCompacto(it.operacion);
    if (suf) {
      if (sfx) sfx.textContent = suf;
    } else sfx?.remove();
  }
  return frag;
}

/** Lo que pinta una `StayCard`, decidido sin DOM. */
export interface DatosStayCard {
  titulo: string;
  /** Zona y tipo, que es lo que SÍ consta; `null` si no consta ninguno (el nodo se quita). */
  meta: string | null;
  precio: string;
  /** «RNT 100001», por `textoRnt`: va pegado al precio, en el mismo anuncio. */
  rnt: string;
}

/**
 * LA TARJETA DE ALOJAMIENTO, FAIL-CLOSED (Ley 300/1996).
 *
 * Una `StayCard` es publicidad de hospedaje: foto y precio por noche. La ley exige el número del RNT
 * en TODA publicidad de alojamiento turístico, así que la respuesta a «¿y si no hay número?» no es
 * una tarjeta sin él: es NINGUNA tarjeta (`null`). `esAnunciable` va primero porque es el dueño de
 * «¿esto se puede anunciar?» (y el que no se cae con un ítem que ni es un objeto); el `numeroRnt` de
 * después da el número que se exhibe.
 *
 * Venta y arriendo tampoco: esta tarjeta dice «COP noche», y un apartamento de $450 millones «por
 * noche» es un dato falso con aspecto de anuncio.
 *
 * ⚠️ `meta` se compone con zona y tipo. El índice no guarda la vista ni el aforo, y un número de
 * huéspedes inventado en un alojamiento es la clase de dato con el que alguien reserva.
 */
export function datosStayCard(it: CatalogoItem): DatosStayCard | null {
  if (!esAnunciable(it) || it.operacion !== 'alojamiento') return null;
  const numero = numeroRnt(it.rnt);
  if (numero === null) return null;
  return {
    titulo: it.titulo,
    meta: [it.sector, tipoLegible(it)].filter(Boolean).join(' · ') || null,
    precio: precioCard(it.precio),
    rnt: textoRnt(numero),
  };
}

/**
 * Tarjeta de alojamiento por días (`StayCard`), clonada de su `<template>`. La usan la portada y
 * `/estancias`. Sin `datosStayCard` no hay tarjeta, y sin el hueco `[data-rnt]` en la plantilla
 * tampoco: un precio por noche no sale sin el sitio donde va su RNT.
 */
export const pintarStay: Pintor = (tpl, it) => {
  const datos = datosStayCard(it);
  if (!datos) return null;
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  const card = frag.querySelector<HTMLElement>('.alt-staycard');
  const rnt = card?.querySelector<HTMLElement>('[data-rnt]');
  if (!card || !rnt) return null;
  rellenarMedia(frag, it, '.alt-staycard__img');
  texto(frag, '.alt-staycard__t', datos.titulo);
  texto(frag, '.alt-staycard__meta', datos.meta);
  texto(frag, '.alt-staycard__price b', datos.precio);
  rnt.textContent = datos.rnt;
  // La plantilla nace con `title=""` y su corazón diría «Guardar  en favoritos» (en /estancias la
  // plantilla no lo trae: `favorito={false}`).
  frag.querySelector('.alt-staycard__fav')?.setAttribute('aria-label', `Guardar ${datos.titulo} en favoritos`);
  return frag;
};
