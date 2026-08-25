/*
 * GATE — enlaces internos que apuntan a una ruta que NO EXISTE.
 *
 * EL DEFECTO QUE CAZA. Un enlace hacia una página que nadie construyó. No rompe el build, no aparece
 * en la consola de quien desarrolla, y solo se descubre cuando alguien lo pulsa y se come un 404 —
 * es decir, cuando ya es un visitante real.
 *
 * LO QUE COSTÓ. §89: el header enlazaba a `/ingresar` y esa página **no existía**. Estuvo dando 404
 * desde que el portal existe, en el enlace de «entrar» — el más importante de la cabecera. Nadie lo
 * vio porque nadie lo pulsa mientras construye otra cosa.
 *
 * ⚠️ POR QUÉ MIRA EL BUILD Y NO EL CÓDIGO FUENTE. Escribí dos versiones que leían `src/` y las dos
 * pasaron en verde con un enlace roto delante:
 *   · la 1ª solo veía `href="/algo"` literal, y el pie de página construye los suyos desde un ARRAY;
 *   · la 2ª leía también las cadenas del frontmatter… y entonces acusaba a `/mes` y `/noche`, que son
 *     sufijos de precio, y a un `/avaluo.html` escrito dentro de un COMENTARIO.
 * El problema de fondo era adivinar qué cadena es un enlace. En el HTML CONSTRUIDO no hay que
 * adivinar: cada `<a href>` ya está resuelto, los comentarios no existen y los arrays ya se pintaron.
 * *Cuando el fuente obliga a adivinar, mira el artefacto* — la misma lección que [[L-50]].
 *
 * ALCANCE. Enlaces internos absolutos (`/algo`). Externos, `mailto:`, `tel:` y `#ancla` quedan fuera:
 * comprobarlos exige red, y un gate que necesita internet deja de correr el día que el CI tiene un
 * mal minuto.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(RAIZ, 'src');
const PAGES = join(SRC, 'pages');
const DIST = join(RAIZ, 'dist', 'client');

if (!existsSync(DIST)) {
  console.log('ℹ️  verify:enlaces — no hay `dist/`; corre `npm run build` antes. (En el CI siempre lo hay.)');
  process.exit(0);
}

function archivos(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) archivos(p, acc);
    else acc.push(p);
  }
  return acc;
}

/* ── 1. Qué rutas SIRVE el sitio ────────────────────────────────────────────────────────────────
 * Dos fuentes, porque este portal es híbrido: lo prerenderizado existe como archivo en `dist/`, y lo
 * que se sirve en el servidor (la ficha, los endpoints) solo existe como ruta en `src/pages`.        */
const patrones = [];

// (a) SSR y dinámicas: del árbol de `src/pages`.
for (const f of archivos(PAGES)) {
  const rel = relative(PAGES, f).replace(/\\/g, '/');
  if (!/\.(astro|ts|js)$/.test(rel)) continue;
  let r = '/' + rel.replace(/\.(astro|ts|js)$/, '');
  r = r.replace(/\/index$/, '/');
  if (r !== '/' && r.endsWith('/')) r = r.slice(0, -1);
  if (r === '') r = '/';

  /*
   * ⚠️ Un comodín de PRIMER NIVEL se traga todo: `[operacion].astro` vive en la raíz, así que como
   * `^/[^/]+$` haría pasar por válida CUALQUIER dirección de un tramo. Si la ruta declara sus valores
   * literales en `getStaticPaths` (`params: { operacion: 'comprar' }`), esos son los únicos que sirve.
   */
  const dinamicos = r.match(/\[[^\]]+\]/g);
  if (dinamicos?.length === 1) {
    const literales = [...readFileSync(f, 'utf8').matchAll(/params:\s*\{\s*\w+:\s*'([^']+)'/g)].map((m) => m[1]);
    if (literales.length) {
      for (const v of literales) patrones.push(new RegExp('^' + r.replace(/\[[^\]]+\]/, v) + '$'));
      continue;
    }
  }
  patrones.push(new RegExp('^' + r.replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+') + '$'));
}

// (b) Lo prerenderizado y los archivos sueltos: existen de verdad en `dist/`.
const enDist = (p) => {
  const limpio = p.replace(/\/$/, '');
  return (
    existsSync(join(DIST, limpio, 'index.html')) ||
    existsSync(join(DIST, limpio)) ||
    (limpio === '' && existsSync(join(DIST, 'index.html')))
  );
};

/** `/api/…` responde a peticiones del JavaScript; no es un destino de navegación. */
const NO_NAVEGABLE = /^\/(api|_astro|_worker|tiles)\//;

const existe = (href) => {
  const limpio = (href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/');
  return enDist(limpio === '/' ? '' : limpio) || patrones.some((re) => re.test(limpio));
};

/* ── 2. Todos los enlaces del HTML servido ─────────────────────────────────────────────────────── */
const rotos = [];
const vistos = new Set();

for (const f of archivos(DIST)) {
  if (!f.endsWith('.html')) continue;
  const pagina = '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const m of readFileSync(f, 'utf8').matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const href = m[1];
    if (NO_NAVEGABLE.test(href)) continue;
    const clave = pagina + ' → ' + href;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    if (!existe(href)) rotos.push({ pagina, href });
  }
}

if (rotos.length) {
  console.error('❌ verify:enlaces — enlaces internos hacia rutas que NO EXISTEN:');
  console.error('');
  for (const r of rotos) console.error(`   en ${r.pagina}  →  ${r.href}`);
  console.error('');
  console.error('   Nadie lo ve mientras construye: se descubre cuando un visitante se come el 404.');
  console.error('   Pasó con `/ingresar` en el header, y llevaba roto desde que el portal existe (§89).');
  process.exit(1);
}

console.log(`✅ verify:enlaces — ${vistos.size} enlace(s) interno(s) del HTML servido: todos resuelven.`);

/*
 * ── Sonda 2: COBERTURA DEL MAPA DE 301 — el gate del cutover (§145) ────────────────────────────
 *
 * QUÉ CAZA. Una URL del sitio viejo que no esté ni redirigida ni declarada como intencionalmente
 * no-redirigida. Ese hueco no se nota el día del cutover: se nota **meses después**, cuando alguien
 * llega desde Google a una dirección que lleva años indexada y se come un 404. Para entonces la
 * posición ya se perdió y no hay forma de saber cuánta.
 *
 * POR QUÉ AHORA. `redirects.ts` ya tenía la respuesta bien hecha: 65 redirigidas + una lista
 * `NO_REDIRIGIR` con NUEVE excepciones, cada una con su razón escrita —incluida la del archivo de
 * verificación de Search Console, que si se redirige **pierde la propiedad y con ella el histórico**—.
 * Lo que no tenía es quien la hiciera cumplir: la lista estaba **exportada y sin un solo consumidor**.
 * Una declaración que nada comprueba envejece sola, y esta envejece justo hasta el cutover.
 *
 * ⚠️ Tras el cutover los `.html` viejos se borran del árbol (decisión del MEGA-PLAN §1). Entonces
 * este chequeo pasará porque no habrá nada que cubrir, y eso es correcto: su trabajo habrá terminado.
 */
const LEGACY_FUERA = new Set(['portal', 'node_modules', '_legacy', '.git', 'dist', 'skills', 'docs', 'specs']);
function htmlLegacy(dir, base, acc = []) {
  for (const n of readdirSync(dir)) {
    if (LEGACY_FUERA.has(n) || n.startsWith('.')) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) htmlLegacy(p, base, acc);
    else if (n.endsWith('.html')) acc.push('/' + relative(base, p).replace(/\\/g, '/'));
  }
  return acc;
}

const REPO = join(RAIZ, '..');
const fuenteRed = join(RAIZ, 'src/lib/seo/redirects.ts');
if (existsSync(fuenteRed)) {
  const red = readFileSync(fuenteRed, 'utf8');
  const zonasSrc = join(RAIZ, 'src/lib/content/zonas.ts');
  const cubiertas = new Set([...red.matchAll(/de:\s*'([^']+)'/g)].map((m) => m[1]));
  // Las de barrio se DERIVAN de `ZONAS`; `baru` no, porque en el sitio viejo tenía otra dirección.
  if (existsSync(zonasSrc)) {
    for (const m of readFileSync(zonasSrc, 'utf8').matchAll(/slug: '([a-z-]+)'/g)) {
      if (m[1] !== 'baru') cubiertas.add(`/${m[1]}.html`);
    }
  }
  const bloque = red.slice(red.indexOf('export const NO_REDIRIGIR'));
  for (const m of bloque.slice(0, bloque.indexOf('];')).matchAll(/'(\/[^']+)'/g)) cubiertas.add(m[1]);

  const viejas = htmlLegacy(REPO, REPO);
  const huerfanas = viejas.filter((v) => !cubiertas.has(v)).sort();
  if (huerfanas.length) {
    console.error('');
    console.error('❌ verify:enlaces — URLs del sitio viejo SIN 301 y sin declararse como excepción:');
    console.error('');
    for (const h of huerfanas) console.error(`   ${h}`);
    console.error('');
    console.error('   El día del cutover eso es un 404 para quien llegue desde Google, y la posición');
    console.error('   ganada se pierde sin aviso. O le das su `{de, a}` en `redirects.ts`, o la añades');
    console.error('   a `NO_REDIRIGIR` CON SU RAZÓN escrita — que es lo que hace útil a esa lista.');
    process.exit(1);
  }
  console.log(`✅ verify:enlaces — las ${viejas.length} URLs del sitio viejo están cubiertas por el mapa de 301.`);
}
