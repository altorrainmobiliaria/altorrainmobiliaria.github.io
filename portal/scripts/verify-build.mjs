#!/usr/bin/env node
// Verifica el CABLEADO HÍBRIDO del build — materializa la mitigación del riesgo
// sellado R2/R3 ("rendering mal cableado", specs/R5-STACK). Corre en CI tras
// `astro build` (job `build` de portal-ci.yml). Falla ruidosamente (exit 1).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok, detail });

// 1. Página ESTÁTICA prerenderizada (el `export const prerender = true` funcionó).
check('index estático prerenderizado (dist/client/index.html)', existsSync(resolve(root, 'dist/client/index.html')));

// 2. Worker SSR construido (render on-demand en el edge).
check('worker SSR construido (dist/server/entry.mjs)', existsSync(resolve(root, 'dist/server/entry.mjs')));

// 3. /api/health es SSR: NO debe existir como asset estático prerenderizado.
const h = resolve(root, 'dist/client/api/health');
check('/api/health es SSR (no estático)', !existsSync(h) && !existsSync(`${h}.html`) && !existsSync(resolve(h, 'index.html')));

// 4. Config de deploy generada con main + assets binding + directory.
const wj = resolve(root, 'dist/server/wrangler.json');
let wOk = false, wDetail = 'no existe';
if (existsSync(wj)) {
  try {
    const cfg = JSON.parse(readFileSync(wj, 'utf8'));
    wOk = Boolean(cfg.main && cfg.assets?.binding && cfg.assets?.directory);
    wDetail = `main=${cfg.main} · assets.binding=${cfg.assets?.binding} · dir=${cfg.assets?.directory}`;
  } catch (e) {
    wDetail = `JSON inválido: ${e.message}`;
  }
}
check('wrangler.json generado (main + assets)', wOk, wDetail);

// 5. La config de DEPLOY real (portal/wrangler.jsonc, JSONC) declara el entrypoint unificado + bindings.
//    verify-build antes solo miraba el artefacto generado; esto cubre la config que de verdad despliega.
const wjc = resolve(root, 'wrangler.jsonc');
let dOk = false, dDetail = 'no existe';
if (existsSync(wjc)) {
  const txt = readFileSync(wjc, 'utf8');
  const hasMain = txt.includes('@astrojs/cloudflare/entrypoints/server');
  const hasAssets = /"binding":\s*"ASSETS"/.test(txt);
  const hasR2 = /"binding":\s*"R2_MEDIA"/.test(txt);
  /*
   * 🔴 `run_worker_first` con `/*.html` ES EL GATE DEL MAPA DE 301 (§145). Sin él, la capa de assets
   * de Cloudflare responde ANTES que el Worker y sirve `404.html`: el middleware —que resuelve el
   * redirect en su primera línea— no llega a ejecutarse nunca. Medido en staging: las 65 URLs del
   * sitio viejo devolvían 404, no 301. Se comprueba aquí porque quitar una línea de una config no
   * rompe nada visible; solo apaga, en silencio, la preservación de años de posicionamiento.
   */
  const hasWorkerFirst = /"run_worker_first"\s*:\s*\[[^\]]*"\/\*\.html"/.test(txt);
  /*
   * 🔴 `html_handling: drop-trailing-slash` — la MISMA clase de candado, y por la misma razón (§150).
   * Sin esta clave el valor por defecto es `auto-trailing-slash` y `/journal` responde 307 hacia
   * `/journal/`: los enlaces internos, el sitemap, el canonical y el destino de los 65 redirects
   * dicen una forma y el servidor prefiere la otra. Nadie lo nota —el navegador sigue el salto— y
   * el precio se paga en señales contradictorias y en cadenas de redirección.
   */
  const hasSinBarra = /"html_handling"\s*:\s*"drop-trailing-slash"/.test(txt);
  dOk = hasMain && hasAssets && hasR2 && hasWorkerFirst && hasSinBarra;
  dDetail = `main-entrypoint=${hasMain} · ASSETS=${hasAssets} · R2_MEDIA=${hasR2} · run_worker_first(/*.html)=${hasWorkerFirst} · html_handling(sin barra)=${hasSinBarra}`;
}
check('wrangler.jsonc de deploy (entrypoint + bindings + los 301 alcanzables)', dOk, dDetail);

// 6. INDEXABILIDAD — el candado que evita el fallo más caro y más silencioso del cutover.
//    Todo el portal se indexa SOLO si se compila con PUBLIC_SITE_ENV=production; por defecto sale
//    `noindex, nofollow`. Eso protege al staging, pero significa que un build de producción hecho
//    SIN la variable publica el sitio nuevo pidiéndole a Google que lo desindexe — y se ve perfecto
//    para un humano. La skill `search-console-setup-y-diagnostico` lo llama "el bug clásico".
//    En producción esto FALLA el build; fuera de producción AVISA, para que nadie despliegue a
//    ciegas al dominio real. (ADR §90 · MEGA-PLAN OLA 1 ítem 11.)
const ES_PROD = process.env.PUBLIC_SITE_ENV === 'production';
const home = resolve(root, 'dist/client/index.html');
const robots = resolve(root, 'dist/client/robots.txt');
const homeTxt = existsSync(home) ? readFileSync(home, 'utf8') : '';
const robotsTxt = existsSync(robots) ? readFileSync(robots, 'utf8') : '';
const tieneNoindex = /noindex/i.test(homeTxt);
const bloqueaTodo = /^\s*Disallow:\s*\/\s*$/im.test(robotsTxt);

if (ES_PROD) {
  check(
    'indexable en PRODUCCIÓN (sin noindex residual, robots abierto)',
    !tieneNoindex && !bloqueaTodo && /Sitemap:/i.test(robotsTxt),
    `noindex-en-home=${tieneNoindex} · robots-Disallow-total=${bloqueaTodo} · sitemap-declarado=${/Sitemap:/i.test(robotsTxt)}`,
  );
} else {
  check('staging correctamente NO indexable', tieneNoindex && bloqueaTodo, `noindex=${tieneNoindex} · Disallow=${bloqueaTodo}`);
  console.log(
    '\n⚠️  Este build es NO INDEXABLE (PUBLIC_SITE_ENV != production).\n' +
    '   Correcto para staging. Si esto va al dominio REAL, Google desindexa el sitio:\n' +
    '   el cutover se construye con  PUBLIC_SITE_ENV=production  (checklist en docs/50-CONFIG-INFRA).\n',
  );
}

/*
 * ── META-GATE: ¿algún `verify:*` se quedó sin cablear al CI? (§142) ──────────────────────────────
 *
 * `verify:data` existía desde Ola 0 y NO LO CORRÍA NADIE — ni el CI ni la rutina. Vigila el free-tier
 * (cero SDK de Firestore en el portal, cero `onSnapshot`, cero lista sin acotar) y llevaba meses
 * siendo decorativo; lo puse en rojo yo mismo dos veces en un día sin enterarme.
 *
 * Es exactamente el chequeo #25 del linter del cerebro —«un gate que nadie invoca no protege nada»—
 * y el portal no lo tenía. Vive aquí, en el gate del CABLEADO, porque de eso trata: de que la
 * plomería esté conectada.
 */
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const ciPath = resolve(root, '..', '.github/workflows/portal-ci.yml');
const ci = existsSync(ciPath) ? readFileSync(ciPath, 'utf8') : '';
const gates = Object.keys(pkg.scripts ?? {}).filter((k) => k.startsWith('verify:'));
const sueltos = gates.filter((g) => !ci.includes(`npm run ${g}`));
check(
  `los ${gates.length} gates verify:* están cableados al CI`,
  ci !== '' && sueltos.length === 0,
  sueltos.length ? `sin cablear: ${sueltos.join(', ')} — un gate que nadie invoca no protege nada` : '',
);

/*
 * Y que `npm run verify` los corra TODOS (§157).
 *
 * Por qué existe este segundo candado: el de arriba comprueba que el CI los invoque, y eso llega
 * TARDE — el CI corre después de empujar. En local hay que acordarse de siete nombres, y el día que
 * uno se olvida se empuja creyendo que está todo verde. Pasó: se corrieron cinco de siete y `verify:css`
 * salió rojo en el CI, con el commit ya escrito diciendo «los 7 en verde».
 * El atajo `npm run verify` arregla eso, pero solo si NO se queda atrás — así que se comprueba que
 * nombre a nombre los contenga. *Un atajo que envejece es peor que no tenerlo: se confía en él.*
 */
const agregado = pkg.scripts?.verify ?? '';
const fuera = gates.filter((g) => !agregado.includes(`npm run ${g}`));
check(
  '`npm run verify` corre TODOS los gates',
  agregado !== '' && fuera.length === 0,
  fuera.length
    ? `fuera del atajo: ${fuera.join(', ')} — en local nadie recuerda ${gates.length} nombres`
    : `${gates.length} gates en un solo comando`,
);


/*
 * ── SONDA: o dices `noindex`, o estás en el SITEMAP (§162) ─────────────────────────────────────
 *
 * QUÉ CAZA. Una página pública que nadie metió al sitemap. No rompe nada, no sale en ninguna
 * consola: simplemente Google tarda semanas en descubrirla, o no la descubre. `/nosotros` nació el
 * 26-ago, se enlazó desde el header y el pie de las 74 páginas… y quedó fuera del sitemap.
 *
 * 🔴 LO QUE HACE ESTE FALLO ESPECIALMENTE CRUEL: `sitemap.xml.ts` **predijo su propia avería**. Su
 * comentario dice, textualmente, que las zonas y los artículos se DERIVAN «porque el olvido más
 * común al añadir contenido es no meterlo al sitemap». La lista de páginas fijas siguió siendo
 * manual, y el olvido llegó por ahí. *Un comentario que nombra el riesgo no lo mitiga: lo documenta.*
 *
 * LA REGLA, y es una equivalencia en los DOS sentidos:
 *   · una página que NO declara `noindex` DEBE estar en el sitemap;
 *   · una página que SÍ lo declara NO puede estar.
 * Sin la segunda mitad, la primera se cumple metiéndolo todo — incluido el panel interno.
 *
 * ⚠️ SE MIRA EL FUENTE PARA `noindex`, no el HTML construido, y es deliberado: en un build de
 * staging TODAS las páginas llevan `noindex` (es lo que protege al staging, §90), así que el
 * artefacto no puede distinguir «interna» de «pública» y el gate pasaría siempre. Es el caso raro en
 * el que el fuente dice la verdad y el artefacto no.
 */
const PAGES_DIR = resolve(root, 'src/pages');
const sitemapPath = resolve(root, 'dist/client/sitemap.xml');

/**
 * Excepciones, cada una con su razón — que es la única forma honesta de excluir algo:
 * · `/404`   la página de error no se anuncia; se sirve con estado 404 y ya declara `noindex`.
 * · rutas con comodín (`[slug]`): sus URLs reales las derivan `ZONAS` y la colección del Journal,
 *   y eso ya se comprueba abajo contando las que SÍ salieron.
 */
const SIN_SITEMAP = new Set(['/404']);

function astroPages(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = resolve(dir, n);
    if (statSync(p).isDirectory()) astroPages(p, acc);
    else if (n.endsWith('.astro')) acc.push(p);
  }
  return acc;
}

if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf8');
  const enSitemap = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/'),
  );

  const faltan = [];
  const sobran = [];
  for (const f of astroPages(PAGES_DIR)) {
    const rel = relative(PAGES_DIR, f).replace(/\\/g, '/').replace(/\.astro$/, '');
    if (rel.includes('[')) continue; // dinámicas: sus URLs se derivan, no se declaran
    const ruta = rel === 'index' ? '/' : `/${rel}`;
    if (SIN_SITEMAP.has(ruta)) continue;
    const src = readFileSync(f, 'utf8');
    const interna = /\bnoindex\b/.test(src);
    if (!interna && !enSitemap.has(ruta)) faltan.push(ruta);
    if (interna && enSitemap.has(ruta)) sobran.push(ruta);
  }

  const detalle = [
    faltan.length ? `PÚBLICAS y fuera del sitemap: ${faltan.join(', ')} → o entran en \`RUTAS\` de \`src/pages/sitemap.xml.ts\`, o llevan \`noindex\`` : '',
    sobran.length ? `\`noindex\` y ANUNCIADAS (le pides que indexe lo que le prohíbes): ${sobran.join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  check(
    `sitemap ⇄ páginas: o \`noindex\`, o anunciada (${enSitemap.size} URLs)`,
    !faltan.length && !sobran.length,
    detalle,
  );
} else {
  console.log('ℹ️  sin `dist/client/sitemap.xml`: la sonda del sitemap no corre (el CI siempre lo tiene).');
}

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  if (!c.ok) failed++;
}
if (failed) {
  console.error(`\n❌ verify:build — ${failed} verificación(es) fallaron: cableado híbrido roto (R2/R3).`);
  process.exit(1);
}
console.log('\n✅ verify:build — cableado híbrido correcto (estática + SSR).');
