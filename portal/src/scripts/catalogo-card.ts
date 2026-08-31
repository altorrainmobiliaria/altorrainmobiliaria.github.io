/*
 * LO COMPARTIDO DEL CATÁLOGO — el ítem, de dónde se lee, y cómo se pinta una tarjeta (§277).
 *
 * Vive aparte porque lo usan DOS islas: la del SERP (`serp-catalogo.ts`) y la de la portada
 * (`home-catalogo.ts`). Al principio la portada importaba directamente del SERP, y el gate
 * `verify:css` lo cazó por un camino inesperado: se quejó de que la portada «busca ids que la página
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
// El tipo de operación y la etiqueta del badge tienen DUEÑO en el dominio; aquí había copias a mano
// (§277). Las cazó `verify:simbolos` al exportarlas: por separado las dos eran legítimas, y por eso
// no las veía ningún otro gate.
import { etiquetaBadge } from '../lib/domain/ficha';
import type { Operacion } from '../lib/domain/shared';

export interface CatalogoItem {
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

export const FUENTE = (import.meta.env.PUBLIC_CATALOGO_SOURCE as string | undefined) ?? 'demo';
/** Override de la URL del JSON (pruebas con fixture; en prod = la ruta del Worker). */
export const URL_OVERRIDE = import.meta.env.PUBLIC_CATALOGO_URL as string | undefined;
export const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });



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
 * Ficha del inmueble — la ruta CANÓNICA (§97). Antes apuntaba a `/ficha?id=…`, que hoy responde un 301
 * hacia aquí: enlazar el destino final ahorra un salto por card y evita repartir el posicionamiento
 * entre dos URLs. El `slug` manda; sin slug, el id, que siempre existe.
 */
export const hrefFicha = (it: CatalogoItem): string => `/inmueble/${encodeURIComponent(it.slug || it.id)}`;

export function texto(root: ParentNode, sel: string, valor: string | null): void {
  const el = root.querySelector<HTMLElement>(sel);
  if (!el) return;
  if (valor === null) el.remove();
  else el.textContent = valor;
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
    const suf = sufijoCompacto(it.operacion);
    if (suf) {
      if (sfx) sfx.textContent = suf;
    } else sfx?.remove();
  }
  return frag;
}
