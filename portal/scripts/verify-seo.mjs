#!/usr/bin/env node
/*
 * 🔎 verify:seo — el TÍTULO y la DESCRIPCIÓN de cada página que Google va a ver.
 *
 * POR QUÉ EXISTE. El 2026-08-27 se midieron las 43 páginas construidas: **9 compartían la misma
 * descripción** —entre ellas `/comprar`, `/arrendar`, `/publicar` y `/turismo`, o sea las que
 * venden—, tres títulos se pasaban de los ~60 caracteres que Google muestra y tres descripciones
 * de los ~155. Nada de eso rompe nada: la página carga perfecta y el resultado en el buscador sale
 * cortado o con un resumen que Google se inventa. Es la familia de §228, que arregló lo mismo en el
 * journal **y solo en el journal** — el arreglo enumerado a mano otra vez (§218).
 *
 * QUÉ JUZGA, Y QUÉ NO. **Solo lo anunciado en el sitemap.** Una página fuera de él (el panel, el
 * design system, favoritos, el 404) no la indexa nadie: exigirle un título comercial sería ruido, y
 * el ruido es como se aprende a ignorar un gate. El denominador se imprime siempre: un ✅ sobre cero
 * páginas es indistinguible de un ✅ sobre todas ([[L-56]]).
 *
 * LOS LÍMITES no son leyes: Google corta por PÍXELES, no por caracteres. Son el umbral práctico por
 * debajo del cual casi nada se trunca. Por eso avisan con margen y solo BLOQUEAN lo que ya está mal.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const CLIENT = join(raiz, 'dist', 'client');
const TITULO_MAX = 60;
const DESC_MAX = 155;
const DESC_MIN = 70;

if (!existsSync(CLIENT)) {
  console.error('❌ verify:seo — no hay `dist/client`. Corre `npm run build` antes: este gate juzga el');
  console.error('   HTML SERVIDO, no el fuente, porque el título lo compone el layout (§230 · L-50).');
  process.exit(1);
}

/** Descripciones que se comparten A PROPÓSITO, con su motivo. Añadir aquí es una decisión. */
const COMPARTIDA_OK = new Map([
  [
    '/',
    'La portada: el texto de marca ES su descripción correcta, no un relleno heredado.',
  ],
  [
    '/estancias',
    'Anuncia alojamiento por días y el RNT todavía no está (§178-§179). Escribirle publicidad ' +
      'mejor AMPLÍA la superficie de anuncio justo en lo que hoy es el bloqueo legal. Se le pone ' +
      'descripción propia el día que llegue el número, no antes.',
  ],
]);

const html = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? html(join(d, e.name)) : e.name.endsWith('.html') ? [join(d, e.name)] : [],
  );

const rutaDe = (f) =>
  '/' + relative(CLIENT, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');

const sitemapP = join(CLIENT, 'sitemap.xml');
if (!existsSync(sitemapP)) {
  console.error('❌ verify:seo — falta `sitemap.xml`: sin él no sé qué páginas ve Google y este gate');
  console.error('   no podría comparar contra nada.');
  process.exit(1);
}
const anunciadas = new Set(
  [...readFileSync(sitemapP, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const p = new URL(m[1]).pathname;
    return p.length > 1 ? p.replace(/\/$/, '') : '/';
  }),
);

const desescapa = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const paginas = [];
for (const f of html(CLIENT)) {
  const ruta = rutaDe(f).replace(/\/$/, '') || '/';
  if (!anunciadas.has(ruta)) continue;
  const doc = readFileSync(f, 'utf8');
  // Solo la cabecera: un <title> dentro de un <svg> del logo no es el de la página.
  const fin = doc.toLowerCase().indexOf('</head>');
  const cab = fin > 0 ? doc.slice(0, fin) : doc;
  const t = cab.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const d = cab.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  paginas.push({
    ruta,
    titulo: t ? desescapa(t[1].replace(/\s+/g, ' ').trim()) : '',
    desc: d ? desescapa(d[1].trim()) : '',
  });
}

const fallos = [];
const avisos = [];

for (const p of paginas) {
  if (!p.titulo) fallos.push(`${p.ruta} — sin <title>`);
  else if (p.titulo.length > TITULO_MAX)
    fallos.push(`${p.ruta} — título de ${p.titulo.length} (máx ${TITULO_MAX}): «${p.titulo}»`);
  if (!p.desc) fallos.push(`${p.ruta} — sin meta description`);
  else if (p.desc.length > DESC_MAX)
    fallos.push(`${p.ruta} — descripción de ${p.desc.length} (máx ${DESC_MAX})`);
  else if (p.desc.length < DESC_MIN)
    avisos.push(`${p.ruta} — descripción de ${p.desc.length}, corta (mín útil ${DESC_MIN})`);
}

/*
 * Duplicados. Es el hallazgo caro: una descripción repetida le dice a Google que las páginas son
 * la misma cosa, y acaba escribiendo él el resumen de la que quiere posicionar.
 */
const porDesc = new Map();
for (const p of paginas) {
  if (!p.desc) continue;
  if (!porDesc.has(p.desc)) porDesc.set(p.desc, []);
  porDesc.get(p.desc).push(p.ruta);
}
for (const [desc, rutas] of porDesc) {
  if (rutas.length < 2) continue;
  const sinPermiso = rutas.filter((r) => !COMPARTIDA_OK.has(r));
  if (sinPermiso.length > 1) {
    fallos.push(
      `descripción COMPARTIDA por ${rutas.length} páginas sin declararlo: ${sinPermiso.join(', ')}\n` +
        `      «${desc.slice(0, 90)}…»`,
    );
  }
}

const porTitulo = new Map();
for (const p of paginas) {
  if (!p.titulo) continue;
  if (!porTitulo.has(p.titulo)) porTitulo.set(p.titulo, []);
  porTitulo.get(p.titulo).push(p.ruta);
}
for (const [t, rutas] of porTitulo) {
  if (rutas.length > 1) fallos.push(`título REPETIDO en ${rutas.join(', ')}: «${t}»`);
}

if (!paginas.length) {
  console.error('❌ verify:seo — cero páginas anunciadas encontradas. O el sitemap está vacío o las');
  console.error('   rutas no casan: un ✅ aquí sería sobre nada.');
  process.exit(1);
}

for (const a of avisos) console.log(`ℹ️  verify:seo — ${a}`);

if (fallos.length) {
  console.error('');
  console.error('❌ verify:seo — lo que Google mostraría de estas páginas está mal:');
  console.error('');
  for (const f of fallos) console.error(`   ${f}`);
  console.error('');
  console.error('   No rompe la página: rompe el resultado de búsqueda, que es donde empieza el cliente.');
  process.exit(1);
}

/*
 * Lo que este gate NO pudo juzgar, dicho en voz alta. Una ruta SSR (`prerender = false`) no deja
 * HTML que abrir, así que su título y su descripción los compone el worker en cada petición y aquí
 * no hay artefacto que medir. Callarlo dejaría que herede el ✅ de las demás — que es exactamente
 * la regla 1 de [[L-59]]: si un lado no se puede LEER, ese par no es verificable y hay que DECIRLO.
 */
const juzgadas = new Set(paginas.map((p) => p.ruta));
const sinJuzgar = [...anunciadas].filter((r) => !juzgadas.has(r));

const compartidas = [...COMPARTIDA_OK.keys()].filter((r) => anunciadas.has(r)).length;
console.log(
  `✅ verify:seo — ${paginas.length} de ${anunciadas.size} página(s) anunciadas en el sitemap ` +
    `(el sitio construye ${html(CLIENT).length}): título ≤${TITULO_MAX}, descripción ` +
    `${DESC_MIN}-${DESC_MAX}, ninguna repetida` +
    (compartidas ? ` · ${compartidas} comparten descripción con su motivo declarado` : '') +
    '.',
);
if (sinJuzgar.length) {
  console.log(
    `ℹ️  verify:seo — ${sinJuzgar.length} anunciada(s) NO juzgada(s) por ser SSR (sin HTML que abrir; ` +
      `su cabecera la compone el worker): ${sinJuzgar.join(', ')}`,
  );
}
