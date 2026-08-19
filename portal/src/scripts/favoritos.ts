// Favoritos del portal (§89) — isla client-side, sin dependencias.
//
// DECISIÓN: los favoritos viven en `localStorage`, NO detrás del login. El mockup lo plantea así
// —«Ingresar para sincronizarlos», «se sincronizan en todos tus dispositivos»—: el acceso es para
// SINCRONIZAR, no la puerta de entrada. Un corazón que exige crear cuenta es un corazón que nadie
// toca, y la captación del portal se juega justo ahí.
//
// La ficha guardada es una INSTANTÁNEA leída del DOM en el momento del clic (foto, badge, zona,
// título, precio, enlace). Así `/favoritos` se pinta sin ir a la red y funciona igual con el
// catálogo en demo o en vivo. Contrapartida asumida: si el inmueble cambia de precio, la tarjeta
// guardada queda vieja hasta que se vuelva a visitar — se refresca contra `/api/catalogo` cuando el
// catálogo pase a `live` (TODO-22).

const CLAVE = 'altorra:favoritos:v1';
const MAX = 60; // tope sano: nadie guarda 60 inmuebles, y evita reventar localStorage

export interface FavoritoGuardado {
  id: string;
  href: string;
  img: string;
  alt: string;
  badge: string;
  zona: string;
  titulo: string;
  precio: string;
  precioLabel: string;
  precioSufijo: string;
  specs: { tipo: string; valor: string }[];
  guardadoEn: string; // ISO
}

/** Evento que emite el módulo cuando la lista cambia (lo escuchan la página y los contadores). */
export const EVENTO = 'altorra:favoritos';

function leerCrudo(): FavoritoGuardado[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(v) ? (v as FavoritoGuardado[]) : [];
  } catch {
    // localStorage deshabilitado (modo privado de Safari), cuota llena o JSON corrupto:
    // los favoritos son una comodidad, JAMÁS deben romper la página que los usa.
    return [];
  }
}

function escribir(lista: FavoritoGuardado[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* sin espacio o sin permiso: se pierde el guardado, no la navegación */
  }
}

function avisar(): void {
  document.dispatchEvent(new CustomEvent(EVENTO, { detail: { total: listar().length } }));
}

export function listar(): FavoritoGuardado[] {
  return leerCrudo();
}

export function tiene(id: string): boolean {
  return leerCrudo().some((f) => f.id === id);
}

export function quitar(id: string): void {
  escribir(leerCrudo().filter((f) => f.id !== id));
  avisar();
}

/**
 * Toma la instantánea de una `.alt-pcard` ya renderizada. Lee del DOM en vez de exigir que cada
 * card duplique sus datos en un `data-` (serían ~300 bytes de más POR CARD en cada listado).
 */
export function instantanea(card: HTMLElement, id: string): FavoritoGuardado {
  const t = (sel: string) => card.querySelector(sel)?.textContent?.trim() || '';
  const img = card.querySelector<HTMLImageElement>('.alt-pcard__media img');
  const enlace = card.querySelector<HTMLAnchorElement>('a[href]');
  return {
    id,
    href: enlace?.getAttribute('href') || `/ficha?id=${encodeURIComponent(id)}`,
    img: img?.getAttribute('src') || '',
    alt: img?.getAttribute('alt') || '',
    badge: t('.alt-pcard__badge'),
    zona: t('.alt-pcard__zona'),
    titulo: t('.alt-pcard__title'),
    // El precio vive DENTRO de `.alt-pcard__price` junto a su etiqueta y su sufijo, como nodos
    // hermanos de texto suelto. Se extraen aparte y el numero se obtiene restandolos, que es la
    // unica forma de no guardar "Desde$1.450.000.000/mes" pegado en una sola cadena.
    precio: (() => {
      const p = card.querySelector('.alt-pcard__price');
      if (!p) return '';
      return [...p.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim() || '')
        .join('')
        .trim();
    })(),
    precioLabel: t('.alt-pcard__price-lbl'),
    precioSufijo: t('.alt-pcard__price-sfx'),
    // Cada spec viaja CON su tipo (bed|bath|area). Guardar solo los valores obligaba a confiar en
    // el orden, y el orden cambia en cuanto una card omite una spec (un lote no tiene banos).
    specs: [...card.querySelectorAll<HTMLElement>('.alt-pcard__specs span')].map((s) => ({
      tipo: s.dataset.spec || '',
      valor: s.textContent?.trim() || '',
    })),
    guardadoEn: new Date().toISOString(),
  };
}

/** Alterna y devuelve el estado NUEVO (true = quedó guardado). */
export function alternar(card: HTMLElement, id: string): boolean {
  const lista = leerCrudo();
  const i = lista.findIndex((f) => f.id === id);
  if (i >= 0) {
    lista.splice(i, 1);
    escribir(lista);
    avisar();
    return false;
  }
  lista.unshift(instantanea(card, id)); // el último guardado va primero
  escribir(lista);
  avisar();
  return true;
}

/** Id estable de una card: el `id` de su enlace a la ficha. */
export function idDeCard(card: HTMLElement): string {
  const href = card.querySelector<HTMLAnchorElement>('a[href]')?.getAttribute('href') || '';
  const m = href.match(/[?&]id=([^&#]+)/);
  if (m) return decodeURIComponent(m[1]);
  // Sin id en la URL (cards demo): se usa el título normalizado, que es estable dentro del sitio.
  const titulo = card.querySelector('.alt-pcard__title')?.textContent?.trim() || '';
  return titulo.toLowerCase().replace(/\s+/g, '-').slice(0, 60) || href;
}

/**
 * Cablea TODOS los corazones de la página y deja el estado visual sincronizado.
 * Idempotente: se puede llamar otra vez cuando una isla inyecte cards nuevas (el SERP lo hace).
 */
export function cablearCorazones(raiz: ParentNode = document): void {
  raiz.querySelectorAll<HTMLElement>('.alt-pcard').forEach((card) => {
    const btn = card.querySelector<HTMLButtonElement>('.alt-pcard__fav');
    if (!btn || btn.dataset.favCableado === '1') return;
    btn.dataset.favCableado = '1';
    const id = idDeCard(card);
    const pintar = (activo: boolean) => {
      btn.setAttribute('aria-pressed', String(activo));
      btn.setAttribute('aria-label', activo ? 'Quitar de favoritos' : 'Guardar en favoritos');
    };
    pintar(tiene(id));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // el título y el orbe son enlaces; frenar aquí evita cualquier navegación colateral
      pintar(alternar(card, id));
    });
  });
}
