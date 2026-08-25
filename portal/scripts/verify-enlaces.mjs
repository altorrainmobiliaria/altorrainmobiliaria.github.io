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
