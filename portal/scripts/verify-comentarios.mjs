#!/usr/bin/env node
/*
 * COMENTARIOS INTERNOS QUE VIAJAN AL HTML PÚBLICO.
 *
 * QUÉ CAZA. Un comentario HTML (`<!-- … -->`) escrito en una plantilla `.astro` NO es una nota
 * privada: Astro lo copia TAL CUAL al HTML que recibe el visitante, y cualquiera lo lee con «ver
 * código fuente». 📊 Medido el 5-oct sobre el build local, antes de convertirlos: **245 comentarios,
 * 14.626 bytes, en las 45 páginas prerenderizadas**, salidos de 77 escritos en 9 ficheros — 4 de
 * ellos en `Header` y `Footer`, que los repiten en cada página. Y no eran solo rótulos de sección:
 * `/turismo` publicaba que una cifra de retorno «fabricada» era «riesgo legal», `/gestion` explicaba
 * cómo se globaliza el CSS del panel y qué función decide la visibilidad de un inmueble, y la home
 * contaba qué handle del mockup «NO es el real». El de `/gestion` salía incluso DESPUÉS de `</html>`.
 *
 * POR QUÉ UN GATE Y NO UNA COSTUMBRE. No rompe nada: compila, la página se pinta igual y ningún otro
 * gate lo ve — `verify:claims` y `verify:controles` QUITAN los comentarios antes de leer, justamente
 * porque no son texto visible. Pero el código fuente de una página es público, y las notas internas
 * de una inmobiliaria sobre sus riesgos legales o sobre cómo funciona su panel no se publican. Hacerlo
 * bien no cuesta nada: `{/* … *\/}` es el comentario de Astro, se queda en el fuente y no viaja.
 *
 * LAS DOS MITADES, y por qué no basta con una.
 *   · El HTML SERVIDO (`dist/client`) es lo que de verdad importa, pero solo contiene las páginas
 *     PRERENDERIZADAS. La ficha (`/inmueble/[slug]`), el proyecto (`/proyecto/[slug]`), `/ficha` y
 *     `/alertas` las compone el Worker en cada visita y NO existen como fichero: un comentario en
 *     `FichaInmueble.astro` no aparecería en ningún `.html` de `dist`, y este gate diría verde.
 *   · Por eso se mira también la PLANTILLA: la parte de MARCADO de cada `.astro` de `src` —sin
 *     frontmatter, sin `<script>` ni `<style>` (ahí `<!--` es JS o CSS, no un comentario HTML) y sin
 *     los propios `{/* *\/}`—, y el cuerpo de los markdown de `src/content`, que el build convierte en
 *     HTML con sus comentarios dentro.
 *
 * ⚠️ LO QUE NO MIRA, dicho para que el verde no se lea como más de lo que es: un `<!--` metido en un
 * string del FRONTMATTER que luego se emite con `set:html` en una ruta SSR (en una prerenderizada lo
 * caza la mitad del HTML servido), y el HTML que el navegador crea con `innerHTML`, que no está en el
 * código fuente de la página.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const SRC = join(raiz, 'src');
const DIST = join(raiz, 'dist', 'client');

/**
 * Comentarios que SÍ pueden llegar al HTML, cada uno con su motivo. ⚠️ Añadir aquí es una decisión
 * que se explica, no un trámite para que el CI calle: un aviso de licencia o una marca que un tercero
 * exige conservar entran con su porqué; una nota nuestra, nunca — para eso está `{/* *\/}`.
 *
 * Hoy solo están las dos MARCAS DE EJECUCIÓN de Astro, y las dos aparecen CERO veces (el portal es
 * vanilla: ni `client:*` ni `server:defer`). Se declaran por adelantado porque no son texto nuestro:
 * el runtime las BUSCA en el DOM, y quitarlas rompería la función que las emite. Sin declararlas, el
 * día que alguien use una isla este gate gritaría sobre algo correcto — y un gate que grita en falso
 * enseña a ignorarlo entero.
 */
const PERMITIDOS = new Map([
  [
    '<!--[if astro]>server-island-start<![endif]-->',
    'marca de `server:defer` (Astro 7): el script de la isla recorre los hermanos hacia atrás hasta este nodo comentario para saber qué reemplazar.',
  ],
  [
    '<!--astro:end-->',
    'marca de las islas hidratadas (`client:*`): cierra el contenido renderizado de la isla para que <astro-island await-children> sepa cuándo están todos sus hijos.',
  ],
]);

/** Sustituye un tramo por espacios conservando los saltos de línea: las líneas reportadas siguen siendo las del fichero. */
const enBlanco = (m) => m.replace(/[^\n]/g, ' ');

/**
 * Lo que NO es marcado en un HTML: dentro de <script> y <style> un «<!--» es JS o CSS.
 * ⚠️ Las etiquetas AUTOCERRADAS (`<script src="…" />`, válidas en .astro) se blanquean PRIMERO: si no,
 * la regex de bloque las tomaba como apertura y blanqueaba todo hasta el siguiente `</script>`,
 * marcado incluido — y un comentario real en medio quedaba a ciegas (revisión adversarial del 5-oct).
 */
function marcadoDeHtml(html) {
  return html
    .replace(/<(script|style)\b[^>]*\/>/gi, enBlanco)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, enBlanco);
}

/*
 * La parte de MARCADO de un `.astro`: fuera el frontmatter, los `{/* *\/}` y los <script>/<style>.
 *
 * ⚠️ EL ORDEN IMPORTA. Los `{/* *\/}` van ANTES que <script>/<style>, para que un comentario de Astro
 * que MENCIONE «<script>» no abra un tramo falso que se trague marcado real hasta el próximo
 * `</script>`. Y el cuerpo del comentario termina en el PRIMER `*\/`: con un `[\s\S]*?` a secas, un
 * `{/* x *\/ return; }` dentro de un script se estira hasta el siguiente `*\/}` del marcado y deja
 * en blanco todo lo de en medio — un verde sobre líneas que nadie miró. 📊 Medido con las dos
 * variantes ingenuas sobre los casos de la sonda de abajo: las dos ven 0 donde hay 1.
 */
function marcadoDeAstro(texto) {
  return marcadoDeHtml(
    texto
      .replace(/^\uFEFF?\s*---\r?\n[\s\S]*?\r?\n---/, enBlanco)
      .replace(/\{\s*\/\*(?:(?!\*\/)[\s\S])*\*\/\s*\}/g, enBlanco),
  );
}

/** El cuerpo de un markdown: fuera el frontmatter y el código (ahí `<!--` se publica escapado, como texto). */
function marcadoDeMarkdown(texto) {
  return texto
    .replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---/, enBlanco)
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, enBlanco)
    .replace(/`[^`\n]*`/g, enBlanco);
}

/** Cada `<!--` del marcado, con su línea y el comentario entero (o hasta el final si no se cierra). */
function comentarios(marcado, original) {
  const out = [];
  for (const m of marcado.matchAll(/<!--/g)) {
    const fin = original.indexOf('-->', m.index + 4);
    const entero = original.slice(m.index, fin === -1 ? undefined : fin + 3);
    if (PERMITIDOS.has(entero)) continue;
    out.push({ linea: original.slice(0, m.index).split('\n').length, entero });
  }
  return out;
}

const deAstro = (t) => comentarios(marcadoDeAstro(t), t);
const deMarkdown = (t) => comentarios(marcadoDeMarkdown(t), t);
const deHtml = (t) => comentarios(marcadoDeHtml(t), t);

/*
 * 🧪 SONDA DEL DETECTOR — corre en cada ejecución, antes de mirar nada real.
 *
 * Un gate cuya señal no se prueba contra su propio caso es una declaración de intenciones. Los casos
 * con 0 son los controles NEGATIVOS —frontmatter, <script>, <style>, `{/* *\/}`, código en markdown,
 * marcas del framework—: sin ellos, «caza lo que debe» y «caza todo» se ven igual de verdes. Los de
 * 1 son las tres formas en que el defecto ya se dio —dentro de un elemento, multilínea, y suelto en el
 * nivel superior después del layout (el de `/gestion`, que acababa detrás de `</html>`)— y las dos
 * trampas del propio detector descritas en `marcadoDeAstro`, que dejarían un comentario real a ciegas.
 */
for (const [nombre, fn, texto, esperados] of [
  ['astro: dentro de un elemento', deAstro, '---\nconst a = 1;\n---\n<main>\n  <!-- nota interna -->\n</main>', 1],
  ['astro: multilínea tras el layout', deAstro, '---\n---\n<Layout></Layout>\n<!--\n  arquitectura\n-->\n<style is:global>.a{}</style>', 1],
  ['astro: `{/* *\/}` dentro de un script no se estira', deAstro, '---\n---\n<script>if (a) {/* x */ return; }</script>\n<p><!-- nota --></p>\n<div>{/* fin */}</div>', 1],
  ['astro: un <script … /> autocerrado no se come lo que sigue', deAstro, '---\n---\n<script src="/x.js" />\n<p><!-- nota --></p>\n<script>y()</script>', 1],
  ['astro: «<script>» citado en un `{/* *\/}`', deAstro, '---\n---\n<div>{/* el <script> de abajo */}</div>\n<p><!-- nota --></p>\n<script>x()</script>', 1],
  ['astro: lo que NO es marcado', deAstro, "---\nconst s = '<!-- js -->'; // <!--\n---\n<div>{/* <!-- citado --> */}</div>\n<script>if (a <!--b) {}</script>\n<script is:inline type=\"application/ld+json\">{\"x\":\"<!--\"}</script>\n<style>/* <!-- */</style>", 0],
  ['markdown: en el cuerpo', deMarkdown, '---\ntitulo: x\n---\n\nTexto.\n\n<!-- borrador -->\n', 1],
  ['markdown: en código', deMarkdown, '---\ntitulo: x\n---\n\n```html\n<!-- ejemplo -->\n```\n\nY en línea: `<!-- x -->`.\n', 0],
  ['html: comentario propio', deHtml, '<html><body><p>Hola</p><!-- nota --></body></html>', 1],
  ['html: script, style y marcas de Astro', deHtml, '<html><body><script>a<!--b</script><style>/*<!--*/</style><!--[if astro]>server-island-start<![endif]--><!--astro:end--></body></html>', 0],
]) {
  const n = fn(texto).length;
  if (n !== esperados) {
    console.error(`❌ verify:comentarios — la sonda del detector falla en «${nombre}»: esperaba ${esperados}, salió ${n}.`);
    console.error('   Con el detector roto, este gate diría verde (o rojo) sin haber mirado de verdad.');
    process.exit(1);
  }
}

function ficheros(dir, filtro, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) ficheros(p, filtro, acc);
    else if (filtro(n)) acc.push(p);
  }
  return acc;
}
const rel = (p) => relative(raiz, p).replace(/\\/g, '/');

const plantillas = ficheros(SRC, (n) => n.endsWith('.astro'));
const markdown = ficheros(join(SRC, 'content'), (n) => /\.mdx?$/.test(n));
const servidos = ficheros(DIST, (n) => n.endsWith('.html'));

/*
 * Un denominador vacío no es un verde. Sin plantillas, o sin HTML construido, el barrido no ocurre —
 * y un barrido que no ocurre no puede pasar en silencio.
 */
if (!plantillas.length) {
  console.error('❌ verify:comentarios — no encontré ni un `.astro` en src/: no habría mirado nada.');
  process.exit(1);
}
if (!servidos.length) {
  console.error('❌ verify:comentarios — no hay HTML en `dist/client`: corre `npm run build` antes.');
  console.error('   Sin build, la mitad que mira lo que de verdad se sirve no correría.');
  process.exit(1);
}

const hallazgos = [];
for (const f of plantillas) for (const c of deAstro(readFileSync(f, 'utf8'))) hallazgos.push({ donde: `${rel(f)}:${c.linea}`, ...c });
for (const f of markdown) for (const c of deMarkdown(readFileSync(f, 'utf8'))) hallazgos.push({ donde: `${rel(f)}:${c.linea}`, ...c });
const enFuente = hallazgos.length;
for (const f of servidos) for (const c of deHtml(readFileSync(f, 'utf8'))) hallazgos.push({ donde: rel(f), ...c });

/*
 * ⚠️ UN `dist/` RANCIO MIENTE EN LOS DOS SENTIDOS: da rojo por un comentario que ya se quitó, o verde
 * sobre una página que ya no es así. Mismo candado que `verify:claims`: si el fuente es más nuevo que
 * el HTML, se rompe en vez de tranquilizar. En CI no salta nunca, porque allí el build va justo antes.
 */
const masNuevo = (fs) => fs.reduce((max, f) => Math.max(max, statSync(f).mtimeMs), 0);
const desfase = masNuevo([...plantillas, ...markdown]) - masNuevo(servidos);
if (desfase > 0) {
  console.error(`❌ verify:comentarios — el HTML de \`dist/\` es más VIEJO que la fuente (${(desfase / 3.6e6).toFixed(1)} h de desfase).`);
  console.error('   Barrer un build rancio da un veredicto sobre una superficie que ya no existe.');
  console.error('   Corre `npm run build` y repite.');
  if (hallazgos.length) console.error(`   (Aun así, en la FUENTE hay ${enFuente} comentario(s) HTML: ver abajo.)`);
}

const ssr = plantillas.filter((f) => /export const prerender = false/.test(readFileSync(f, 'utf8'))).length;

if (hallazgos.length) {
  console.error(`❌ verify:comentarios — ${hallazgos.length} comentario(s) HTML que llegan (o llegarían) al código fuente PÚBLICO:\n`);
  for (const h of hallazgos.slice(0, 40)) {
    console.error(`   ${h.donde}  ${h.entero.replace(/\s+/g, ' ').slice(0, 100)}`);
  }
  if (hallazgos.length > 40) console.error(`   … y ${hallazgos.length - 40} más.`);
  console.error('\n   `<!-- … -->` en una plantilla NO es privado: Astro lo copia al HTML y cualquiera lo lee con');
  console.error('   «ver código fuente». Escríbelo como comentario de Astro, `{/* … */}`: se queda en el fuente y');
  console.error('   no viaja. Si DEBE ser público (licencia, marca de un tercero), decláralo en PERMITIDOS CON su motivo.');
  process.exit(1);
}
if (desfase > 0) process.exit(1);

console.log(
  `✅ verify:comentarios — 0 comentarios HTML propios en ${plantillas.length} plantilla(s) .astro ` +
    `(${ssr} página(s) SSR que el build no prerenderiza, cubiertas por la fuente), ${markdown.length} markdown ` +
    `y ${servidos.length} página(s) HTML servidas; ${PERMITIDOS.size} marca(s) del framework declaradas con su motivo.`,
);
