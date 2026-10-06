/*
 * /ESTANCIAS, CABLEADA AL CATÁLOGO REAL.
 *
 * La página dejó de ser una casa de ejemplo con precio: pinta los alojamientos del shard `dias` con
 * la MISMA tarjeta y el MISMO pintor que la portada (`pintarStay`, en `catalogo-card`), y ese pintor
 * no deja salir un precio por noche sin su RNT al lado. Sin inventario, lo dice.
 *
 * A diferencia de la portada, esto ES el listado: no hay tope. Recortar en silencio escondería
 * alojamientos publicados sin que nadie supiera que existen.
 *
 * No despacha `altorra:catalogo-pintado`: ese aviso solo sirve para re-cablear corazones, y la
 * plantilla de esta página no los trae (`favorito={false}` en `estancias.astro`).
 */
import {
  datosStayCard,
  FUENTE,
  masRecientePrimero,
  parrafoVacio,
  pintarStay,
  TEXTO_ERROR_CARGA,
  TEXTO_SIN_ALOJAMIENTOS,
  traerShard,
  type CatalogoItem,
} from './catalogo-card';

/** ¿Se puede anunciar como estadía? Un ítem malformado que lanza cae él solo, no el listado. */
function esEstadiaAnunciable(it: CatalogoItem): boolean {
  try {
    return datosStayCard(it) !== null;
  } catch {
    return false;
  }
}

export async function bootEstanciasCatalogo(): Promise<void> {
  if (FUENTE !== 'live') return; // modo DEMO: el HTML ya trae el vacío honesto, no hay nada que pedir.

  const caja = document.querySelector<HTMLElement>('[data-estancias-set]');
  const tpl = document.querySelector<HTMLTemplateElement>('#tpl-estancias-staycard');
  if (!caja || !tpl) return;
  // La clase es `:global(.est-vacio)` en `estancias.astro`: el párrafo lo crea el JS.
  const vacio = (t: string): void => caja.replaceChildren(parrafoVacio('est-vacio', t));

  // Todo fallo termina en un texto: sin esto, una excepción dejaba «Cargando alojamientos…» para
  // siempre, porque el `catch` de la página no pinta nada.
  try {
    const items = await traerShard('estancias');
    if (items === null) {
      vacio(TEXTO_ERROR_CARGA);
      return;
    }

    // Se filtra ANTES de ordenar: lo que no es anunciable como estadía no se pinta.
    const anunciables = items.filter(esEstadiaAnunciable);
    const fuera = items.length - anunciables.length;
    if (fuera) console.warn(`[estancias] ${fuera} ítem(s) del shard sin pintar: no son alojamiento con un RNT exhibible`);

    const frag = document.createDocumentFragment();
    let fallidas = 0;
    anunciables.sort(masRecientePrimero).forEach((it, i) => {
      try {
        const card = pintarStay(tpl, it, i);
        if (card) frag.appendChild(card);
        else fallidas++;
      } catch {
        fallidas++;
      }
    });
    if (fallidas) console.warn(`[estancias] ${fallidas} tarjeta(s) no se pudieron construir`);

    if (!frag.childNodes.length) {
      vacio(TEXTO_SIN_ALOJAMIENTOS);
      return;
    }
    caja.replaceChildren(frag);
  } catch {
    vacio(TEXTO_ERROR_CARGA);
  } finally {
    // La región deja de estar «ocupada» y el lector de pantalla anuncia lo que quedó en ella.
    caja.removeAttribute('aria-busy');
  }
}
