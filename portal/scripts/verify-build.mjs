#!/usr/bin/env node
// Verifica el CABLEADO HÍBRIDO del build — materializa la mitigación del riesgo
// sellado R2/R3 ("rendering mal cableado", specs/R5-STACK). Corre en CI tras
// `astro build` (job `build` de portal-ci.yml). Falla ruidosamente (exit 1).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  dOk = hasMain && hasAssets && hasR2 && hasWorkerFirst;
  dDetail = `main-entrypoint=${hasMain} · ASSETS=${hasAssets} · R2_MEDIA=${hasR2} · run_worker_first(/*.html)=${hasWorkerFirst}`;
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
