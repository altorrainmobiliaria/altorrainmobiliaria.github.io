/**
 * MAPA DE 301 — sitio viejo (GitHub Pages) → portal nuevo (Workers).
 *
 * Es GATE DEL CUTOVER (MEGA-PLAN §OLA 1 ítem 11, ADR §90). El sitio viejo tiene histórico en
 * Search Console; mover el DNS sin este mapa tira ese histórico a un 404 y se pierde el ranking
 * ganado. Un 301 conserva la señal; un 404 la borra.
 *
 * INVENTARIO REAL (contado, no estimado — `ls *.html` en la raíz del repo el 2026-08-21):
 * 59 en raíz + 7 en `/blog` + 6 en `/p` + 2 en `/snippets` = **74 archivos**.
 * De esos, **65 son URLs públicas** y entran aquí; **9 son técnicos** y NO se redirigen (§NO-TOCAR).
 *
 * ⚠️ Estas cifras se corrigieron el 2026-08-21 tras CONTARLAS contra el disco (ADR §95.6): decían
 * «68 públicas + 6 técnicas», y esa aritmética que no cerraba escondía que **`/invertir.html` no
 * tenía redirect** y habría dado 404 tras el cutover. Si vuelves a tocar esta lista, re-corre el
 * conteo contra el disco en vez de fiarte del comentario: fue el descuadre lo que delató el hueco.
 *
 * REGLA DE DESTINO: se redirige a la página que responde la MISMA intención, nunca "todo a la home"
 * — un 301 masivo a `/` Google lo trata como soft-404 y no transfiere señal. Cuando la superficie
 * ideal aún no existe (landings de barrio, Rango ALTORRA), se apunta al destino más cercano que SÍ
 * existe y se deja marcado con `pendiente` para re-apuntarlo cuando se construya. Re-apuntar un 301
 * más tarde es barato y no pierde señal; mandarlo a un 404 hoy sí la pierde.
 */

import { ZONAS } from "../content/zonas";

export interface Redirect {
  /** Ruta vieja tal cual la conoce Google, con `.html`. */
  de: string;
  /** Ruta nueva en el portal. */
  a: string;
  /** Si la superficie definitiva todavía no existe: a qué hay que re-apuntarlo al construirla. */
  pendiente?: string;
}

/**
 * Barrios → su landing `/zona/<slug>` (ADR §92). Se DERIVAN de `ZONAS`, que es el nodo dueño del
 * censo de zonas: al añadir una zona en `zonas.ts`, su redirect aparece solo.
 *
 * ⚠️ **Aquí decía «así es IMPOSIBLE (…) un 301 apuntando a una landing que nadie construyó». Era
 * media verdad, y por serlo hacía daño** (§259): la derivación garantiza el 1:1 entre el censo de
 * zonas y sus reglas, pero NO que `/zona/<slug>` llegue a construirse — y no dice absolutamente
 * nada de los ~53 redirects MANUALES de abajo, cuyos destinos son cadenas escritas a mano. Quien
 * leyera esa frase cerraría la búsqueda justo antes de mirar lo que sí podía romperse.
 * Ahora lo comprueba un gate de verdad: la sonda 2b de `verify-enlaces.mjs` exige que **los 28
 * destinos existan en el build**, y falla nombrando el que no.
 *
 * Excepción `baru`: en el sitio viejo su URL era `/propiedades-baru.html`, no `/baru.html`, así que
 * su entrada va abajo a mano. Las demás siguen el patrón `/<slug>.html`.
 */
const REDIRECTS_BARRIOS: Redirect[] = ZONAS
  .filter((z) => z.slug !== 'baru')
  .map((z) => ({ de: `/${z.slug}.html`, a: `/zona/${z.slug}` }));

const REDIRECTS_MANUALES: Redirect[] = [
  // ── Listados y operación ────────────────────────────────────────────────────────────────────
  { de: '/index.html', a: '/' },
  { de: '/propiedades-comprar.html', a: '/comprar' },
  { de: '/propiedades-arrendar.html', a: '/arrendar' },
  { de: '/propiedades-alojamientos.html', a: '/estancias' },
  { de: '/propiedades-baru.html', a: '/zona/baru' },
  { de: '/comprar-apartamento-cartagena.html', a: '/comprar?tipo=apartamento' },
  { de: '/arrendar-apartamento-cartagena.html', a: '/arrendar?tipo=apartamento' },
  { de: '/lotes-campestres-cartagena.html', a: '/comprar?tipo=lote' },
  { de: '/busqueda.html', a: '/comprar' },
  { de: '/colecciones.html', a: '/comprar' },
  { de: '/mapa.html', a: '/comprar' },              // el SERP nuevo YA trae el mapa MapLibre (§55)

  // ── Turismo / corta estancia ────────────────────────────────────────────────────────────────
  { de: '/renta-turistica.html', a: '/turismo' },
  { de: '/turismo-inmobiliario.html', a: '/turismo' },

  // ── Inversión ───────────────────────────────────────────────────────────────────────────────
  { de: '/invertir.html', a: '/invertir' },
  { de: '/invertir-airbnb-cartagena.html', a: '/invertir' },
  { de: '/guia-inversionista-2026.html', a: '/invertir' },
  { de: '/foreign-investors.html', a: '/invertir' },
  { de: '/simulador.html', a: '/invertir' },
  { de: '/simulador-notarial.html', a: '/invertir' },

  // ⚠️ B13: JAMÁS llamar "avalúo" a nuestra estimación (en Colombia es actividad regulada, Ley
  // 1673/2013). Su destino definitivo ya existe: el Rango ALTORRA (ADR §94), que dice con esas
  // palabras que es orientativo y no un avalúo con validez legal. Era el último `pendiente` del mapa.
  { de: '/avaluo.html', a: '/rango-altorra' },

  // ── Editorial / blog ────────────────────────────────────────────────────────────────────────
  { de: '/blog.html', a: '/journal' },
  { de: '/blog-post.html', a: '/journal' },
  { de: '/blog/por-que-invertir-cartagena-2026.html', a: '/journal' },
  { de: '/blog/vale-la-pena-invertir-cartagena-2026.html', a: '/journal' },
  { de: '/blog/mejores-zonas-airbnb-cartagena.html', a: '/journal' },
  { de: '/blog/impuestos-inmobiliarios-colombia-2026.html', a: '/journal' },
  { de: '/blog/guia-legal-inversionistas-extranjeros.html', a: '/journal' },
  { de: '/blog/renta-turistica-vs-arriendo-tradicional.html', a: '/journal' },
  { de: '/estudios-mercado-cartagena.html', a: '/journal' },
  { de: '/arrendar-vs-comprar.html', a: '/journal' },
  { de: '/costos-cierre.html', a: '/journal' },
  { de: '/glosario-inmobiliario.html', a: '/journal' },
  { de: '/recursos.html', a: '/journal' },
  { de: '/videos.html', a: '/journal' },
  { de: '/prensa.html', a: '/journal' },

  // ── Servicios y aliados ─────────────────────────────────────────────────────────────────────
  { de: '/servicios-mantenimiento.html', a: '/aliados' },
  { de: '/servicios-mudanzas.html', a: '/aliados' },
  { de: '/casos-exito.html', a: '/aliados' },

  // ── Captación y cuenta ──────────────────────────────────────────────────────────────────────
  { de: '/publicar-propiedad.html', a: '/publicar' },
  { de: '/favoritos.html', a: '/favoritos' },

  // ── Institucional y legal ───────────────────────────────────────────────────────────────────
  { de: '/privacidad.html', a: '/privacidad' },
  { de: '/quienes-somos.html', a: '/' },
  { de: '/equipo.html', a: '/' },
  { de: '/contacto.html', a: '/' },                 // el contacto vive en los CTA de WhatsApp del portal
  { de: '/faq.html', a: '/' },
  { de: '/gracias.html', a: '/' },

  // ── Fichas de inmueble ──────────────────────────────────────────────────────────────────────
  // No existe correspondencia id-viejo → id-nuevo (el catálogo se rehizo, §56-§60). Un producto
  // retirado se manda a su categoría: es lo que Google espera y no finge que el inmueble sigue ahí.
  { de: '/detalle-propiedad.html', a: '/comprar' },
  { de: '/p/0000.html', a: '/comprar' },
  { de: '/p/101-27.html', a: '/comprar' },
  { de: '/p/102-11402.html', a: '/comprar' },
  { de: '/p/103-B305.html', a: '/comprar' },
  { de: '/p/104-01.html', a: '/comprar' },
  { de: '/p/105-4422.html', a: '/comprar' },
];

export const REDIRECTS: Redirect[] = [...REDIRECTS_BARRIOS, ...REDIRECTS_MANUALES];

/**
 * §NO-TOCAR — rutas del sitio viejo que NO se redirigen, y por qué. Están aquí para que nadie las
 * "complete" por simetría en el futuro.
 *
 * - `/googlec4e47cae776946d9.html` → 🔴 archivo de verificación de propiedad de Search Console.
 *   Redirigirlo o borrarlo = PERDER la propiedad en GSC y con ella el histórico. Debe seguir
 *   respondiendo 200 con su contenido original.
 * - `/admin.html`  → consola legacy de consulta, sigue en uso (CLAUDE.md §1). No es pública.
 * - `/404.html`    → es la página de error, no un destino.
 * - `/header.html`, `/footer.html`, `/snippets/*.html`, `/blog/_plantilla-post.html` → fragmentos
 *   inyectados por JS y plantillas: nunca fueron URLs públicas ni están indexadas.
 * - `/limpiar-cache.html` → utilidad de soporte del legacy.
 */
export const NO_REDIRIGIR = [
  '/googlec4e47cae776946d9.html',
  '/admin.html',
  '/404.html',
  '/header.html',
  '/footer.html',
  '/limpiar-cache.html',
  '/blog/_plantilla-post.html',
  '/snippets/detalle-share.html',
  '/snippets/inject-jsonld.html',
] as const;

/** Índice O(1) para el middleware: no recorre el array en cada request. */
const MAPA = new Map(REDIRECTS.map((r) => [r.de, r.a]));

/**
 * Devuelve el destino del 301 para un pathname, o `null` si no hay que redirigir.
 * Tolera la barra final y las mayúsculas del path, que Google sí distingue pero los enlaces viejos no.
 */
export function resolverRedirect(pathname: string): string | null {
  if (!pathname.endsWith('.html')) return null;      // atajo: el portal nuevo no usa `.html`
  return MAPA.get(pathname) ?? MAPA.get(pathname.toLowerCase()) ?? null;
}
