/**
 * MAPA DE 301 — sitio viejo (GitHub Pages) → portal nuevo (Workers).
 *
 * Es GATE DEL CUTOVER (MEGA-PLAN §OLA 1 ítem 11, ADR §90). El sitio viejo tiene histórico en
 * Search Console; mover el DNS sin este mapa tira ese histórico a un 404 y se pierde el ranking
 * ganado. Un 301 conserva la señal; un 404 la borra.
 *
 * INVENTARIO REAL (contado, no estimado — `ls *.html` en la raíz del repo el 2026-08-21):
 * 59 en raíz + 7 en `/blog` + 6 en `/p` + 2 en `/snippets` = 74 archivos.
 * De esos, 68 fueron URLs públicas y entran aquí; 6 son técnicos y NO se redirigen (ver §NO-TOCAR).
 *
 * REGLA DE DESTINO: se redirige a la página que responde la MISMA intención, nunca "todo a la home"
 * — un 301 masivo a `/` Google lo trata como soft-404 y no transfiere señal. Cuando la superficie
 * ideal aún no existe (landings de barrio, Rango ALTORRA), se apunta al destino más cercano que SÍ
 * existe y se deja marcado con `pendiente` para re-apuntarlo cuando se construya. Re-apuntar un 301
 * más tarde es barato y no pierde señal; mandarlo a un 404 hoy sí la pierde.
 */

export interface Redirect {
  /** Ruta vieja tal cual la conoce Google, con `.html`. */
  de: string;
  /** Ruta nueva en el portal. */
  a: string;
  /** Si la superficie definitiva todavía no existe: a qué hay que re-apuntarlo al construirla. */
  pendiente?: string;
}

/** Los 13 barrios que el sitio viejo tenía como landing propia (MEGA-PLAN OLA 1 ítem 4). */
export const BARRIOS = [
  'alto-bosque', 'cielo-mar', 'el-cabrero', 'el-laguito', 'karibana', 'la-boquilla',
  'manzanillo-del-mar', 'marbella', 'pie-de-la-popa', 'san-diego', 'serena-del-mar', 'tierrabomba',
] as const;

/**
 * Barrios → SERP filtrado por zona. Es un destino REAL y temático (no la home), así que el 301
 * transfiere. Al construir `/zona/<slug>` (ítem 4) se re-apunta: ahí es donde vive el contenido
 * editorial por barrio que el sitio viejo sí tenía y hoy no tenemos.
 */
const REDIRECTS_BARRIOS: Redirect[] = BARRIOS.map((b) => ({
  de: `/${b}.html`,
  a: `/comprar?zona=${b}`,
  pendiente: `/zona/${b}`,
}));

const REDIRECTS_MANUALES: Redirect[] = [
  // ── Listados y operación ────────────────────────────────────────────────────────────────────
  { de: '/index.html', a: '/' },
  { de: '/propiedades-comprar.html', a: '/comprar' },
  { de: '/propiedades-arrendar.html', a: '/arrendar' },
  { de: '/propiedades-alojamientos.html', a: '/estancias' },
  { de: '/propiedades-baru.html', a: '/comprar?zona=baru', pendiente: '/zona/baru' },
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
  { de: '/invertir-airbnb-cartagena.html', a: '/invertir' },
  { de: '/guia-inversionista-2026.html', a: '/invertir' },
  { de: '/foreign-investors.html', a: '/invertir' },
  { de: '/simulador.html', a: '/invertir' },
  { de: '/simulador-notarial.html', a: '/invertir' },

  // ⚠️ B13: JAMÁS llamar "avalúo" a nuestra estimación. La superficie correcta es el Rango ALTORRA
  // (OLA 1 ítem 9), que no existe todavía. Mientras tanto va a `/publicar`, que es donde el
  // propietario que quería saber cuánto vale su casa ACTÚA — y es captación, no una página muerta.
  { de: '/avaluo.html', a: '/publicar', pendiente: '/rango-altorra' },

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
