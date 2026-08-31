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
import { etiquetaTipo, tipoCanonico } from '../lib/domain/shared';

import {
  construirCard,
  FUENTE,
  URL_OVERRIDE,
  hrefFicha,
  montoCorto,
  precioPin,
  sufijoCompacto,
  texto,
  type CatalogoItem,
} from './catalogo-card';


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
  /** Precio en COP. `null` a un lado = sin límite por ese lado (§273). */
  precioMin: number | null;
  precioMax: number | null;
  /** MÍNIMOS: en un portal «3 habitaciones» significa «3 o más», nunca «exactamente 3». */
  habMin: number | null;
  banMin: number | null;
  /** Área construida en m². */
  areaMin: number | null;
}

/**
 * Un número de la URL, o `null`.
 *
 * 🎯 Cualquier basura —texto, negativo, vacío, `2..5`— se convierte en `null` y **jamás** en un
 * filtro de cero. Un `Number('abc')` da `NaN` y una comparación con `NaN` es siempre falsa: el
 * visitante habría visto CERO RESULTADOS por una URL mal copiada, y cero resultados no se distingue
 * de «no hay nada en esa zona» (la misma clase de fallo mudo que §265).
 */
const numeroDeUrl = (v: string | null): number | null => {
  if (v == null) return null;
  const limpio = v.trim();
  // Solo dígitos y separadores de miles. Quitar «todo lo que no sea dígito» parecía equivalente y NO
  // lo era: convertía `hab=-2` en un filtro de 2 habitaciones que nadie pidió. Lo cazó su prueba.
  if (!/^[\d.,\s]+$/.test(limpio)) return null;
  const n = Number(limpio.replace(/[.,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * La CIUDAD no es un sector — y por eso no filtra (§273).
 *
 * 🔴 Cazado recorriendo el camino vivo: la caja venía con `value="Cartagena de Indias"` escrito a
 * mano en el HTML, así que CUALQUIER envío del formulario mandaba esa zona. Ningún sector del
 * catálogo se llama así (son Bocagrande, Manga, Crespo…), de modo que el filtro los excluía todos:
 * se elegía «4+ habitaciones», la URL llevaba `hab=4` correctamente, el chip se encendía… y salían
 * CERO resultados. El filtro funcionaba; lo que sobraba era una zona que el visitante nunca escribió.
 *
 * Se arregla en las dos puntas: la caja pasa a `placeholder` (una sugerencia no se envía), y aquí
 * la ciudad se normaliza a «sin zona» — porque alguien SÍ puede escribirla, y en un portal que solo
 * opera en Cartagena responderle «no encontramos nada» sería absurdo.
 *
 * Se normaliza en la FRONTERA y no dentro del filtro: así el contador, el mensaje de cero
 * resultados y `hayCriterio` quedan bien sin que ninguno tenga que conocer el caso especial.
 */
const CIUDAD = ['cartagena', 'cartagena de indias', 'cartagena, bolivar', 'cartagena bolivar'];
const zonaUtil = (z: string): string => (CIUDAD.includes(norm(z)) ? '' : z);

/**
 * LEE LA INTENCIÓN DEL VISITANTE — que hasta §265 se tiraba a la basura.
 *
 * 🔴 El buscador del hero manda `zona` y `tipo` por GET a `/comprar`, y **nadie los leía**: ni la
 * página ni esta isla. Medido en el navegador: se busca «Bocagrande / Casa» y se aterriza en una
 * página titulada «Propiedades en Cartagena de Indias» con la caja rellenada con OTRA cosa. La
 * primera interacción del visitante con el sitio —el buscador del hero es la puerta de entrada— era
 * la que se descartaba en silencio.
 *
 * 🎯 Y por eso los filtros de §273 viajan también por la URL y no en un estado de JS: una búsqueda
 * es COMPARTIBLE (se pega en un WhatsApp y llega igual), sobrevive a recargar, y el formulario que
 * ya existía la envía sin que nadie tenga que sincronizar dos copias de lo mismo.
 */
export function busquedaDeUrl(search: string): Busqueda {
  const q = new URLSearchParams(search);
  return {
    zona: zonaUtil((q.get('zona') ?? '').trim()),
    tipo: (q.get('tipo') ?? '').trim(),
    precioMin: numeroDeUrl(q.get('precioMin')),
    precioMax: numeroDeUrl(q.get('precioMax')),
    habMin: numeroDeUrl(q.get('hab')),
    banMin: numeroDeUrl(q.get('ban')),
    areaMin: numeroDeUrl(q.get('area')),
  };
}

/** Compara sin tildes ni mayúsculas: lo que llega por una URL viene como venga. */
const norm = (v: string): string =>
  v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Lo que el filtro necesita de una ficha. Los numéricos son opcionales: no toda ficha los trae. */
type Filtrable = { sector: string; tipo: string; precio?: number; hab?: number; ban?: number; area?: number };

/**
 * ¿Este inmueble está POR ENCIMA del mínimo que se pidió?
 *
 * 🎯 La decisión que no es obvia: **si la ficha no trae el dato, NO pasa**. La alternativa —dejar
 * pasar lo desconocido— enseñaría, a quien pide 3 habitaciones, inmuebles de los que no sabemos
 * cuántas tienen; y este portal vende «Verificado por ALTORRA». Un dato que no está no es un sí.
 * El precio del rigor es inventario oculto, y por eso el mensaje de cero resultados dice cómo
 * aflojar la búsqueda en vez de dejar al visitante en una pantalla vacía.
 */
const alMenos = (valor: number | undefined, minimo: number | null): boolean =>
  minimo == null || (typeof valor === 'number' && valor >= minimo);

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
 *
 * Los NUMÉRICOS (§273) son rangos y mínimos, y se aplican con `alMenos` / comparación directa.
 */
export function coincideBusqueda(it: Filtrable, b: Busqueda): boolean {
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
  if (b.precioMin != null && !alMenos(it.precio, b.precioMin)) return false;
  if (b.precioMax != null && !(typeof it.precio === 'number' && it.precio <= b.precioMax)) return false;
  if (!alMenos(it.hab, b.habMin)) return false;
  if (!alMenos(it.ban, b.banMin)) return false;
  if (!alMenos(it.area, b.areaMin)) return false;
  return true;
}

/**
 * ¿Pidió algo el visitante? **UNA sola enumeración de los criterios**, y por eso está exportada.
 *
 * 🎯 La usan el filtro (para no recorrer la lista sin motivo) y el mensaje de cero resultados (para
 * saber cuál de los dos ceros contar). Tenerla escrita dos veces es exactamente el gemelo de §271:
 * el día que entre un filtro nuevo, alguien actualizaría UNA de las dos y la otra seguiría dando una
 * respuesta correcta por su cuenta. No hay error hasta que las comparas.
 */
export const hayCriterio = (b: Busqueda): boolean =>
  Boolean(b.zona || b.tipo || b.precioMin || b.precioMax || b.habMin || b.banMin || b.areaMin);

/** NUNCA muta la lista que recibe: el orden que entrega el servidor es «Relevancia» y hay que poder volver. */
export function filtrarCatalogo(items: readonly CatalogoItem[], b: Busqueda): CatalogoItem[] {
  if (!hayCriterio(b)) return [...items];
  return items.filter((it) => coincideBusqueda(it, b));
}

/** Rótulo del chip de precio: «Hasta $500M» · «Desde $200M» · «$200M – $500M» · null si no hay nada. */
function rotuloPrecio(b: Busqueda): string | null {
  const { precioMin: min, precioMax: max } = b;
  if (min != null && max != null) return `${montoCorto(min)} – ${montoCorto(max)}`;
  if (max != null) return `Hasta ${montoCorto(max)}`;
  if (min != null) return `Desde ${montoCorto(min)}`;
  return null;
}

/**
 * Escribe en la página LO QUE SE BUSCÓ: la caja, el titular y **cada control de filtro** (§273).
 *
 * La caja y el H1 traían «Cartagena de Indias» escrito a mano en el HTML: mostraban siempre lo mismo
 * dijera lo que dijera la URL. Se marcan con `data-` en vez de por posición — «el último span» se
 * rompe en cuanto alguien añade uno (§123).
 *
 * 🎯 Los filtros se rellenan por NOMBRE DE CAMPO, no uno a uno: el nombre del control es el mismo
 * que el parámetro de la URL, así que añadir un filtro nuevo es añadir un `<input>` con su nombre y
 * su fila en `Busqueda`, sin tocar esta función. Y el rótulo del chip enseña el valor activo porque
 * un chip encendido que sigue diciendo «Precio» obliga a abrirlo para saber qué se pidió.
 */
export function reflejarBusqueda(b: Busqueda): void {
  if (b.zona) {
    const caja = document.querySelector<HTMLInputElement>('.serp-search input[name="zona"]');
    if (caja) caja.value = b.zona;
    const zona = document.querySelector<HTMLElement>('[data-serp-zona]');
    if (zona) zona.textContent = `en ${b.zona}`;
  }

  const valores: Record<string, string> = {
    tipo: b.tipo,
    precioMin: b.precioMin?.toString() ?? '',
    precioMax: b.precioMax?.toString() ?? '',
    hab: b.habMin?.toString() ?? '',
    ban: b.banMin?.toString() ?? '',
    area: b.areaMin?.toString() ?? '',
  };
  for (const [nombre, valor] of Object.entries(valores)) {
    const campo = document.querySelector(`.serp-f [name="${nombre}"]`) as HTMLInputElement | HTMLSelectElement | null;
    if (campo) campo.value = valor;
  }

  const rotulos: Record<string, string | null> = {
    tipo: b.tipo ? etiquetaTipo(tipoCanonico(b.tipo) ?? 'otro') : null,
    precio: rotuloPrecio(b),
    hab: b.habMin != null ? `${b.habMin}+ hab` : null,
    mas: b.banMin != null || b.areaMin != null ? 'Más filtros •' : null,
  };
  for (const [clave, rotulo] of Object.entries(rotulos)) {
    const chip = document.querySelector<HTMLElement>(`.serp-f[data-f="${clave}"]`);
    if (!chip) continue;
    const texto = chip.querySelector<HTMLElement>('[data-f-label]');
    if (texto && rotulo) texto.textContent = rotulo;
    const summary = chip.querySelector<HTMLElement>('summary');
    if (summary) summary.toggleAttribute('data-activo', rotulo != null);
  }
}

/**
 * Deja la barra de filtros mostrando lo que se pidió, y lista para volver a pedir.
 *
 * Corre en los DOS modos —a diferencia de `bootCatalogo`, que en demo no toca nada— porque navegar
 * no depende del inventario: los controles tienen que reflejar la URL aunque las tarjetas sean de
 * muestra. El envío lo hace el `<form method="get">` solo; aquí no hay ningún manejador de clic.
 */
export function bootBuscador(): void {
  reflejarBusqueda(busquedaDeUrl(location.search));
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
  const hayBusqueda = hayCriterio(busqueda);
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
        'Prueba con otra zona, o afloja los filtros de tipo y precio para ver más inventario.',
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
