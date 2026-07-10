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
  dOk = hasMain && hasAssets && hasR2;
  dDetail = `main-entrypoint=${hasMain} · ASSETS=${hasAssets} · R2_MEDIA=${hasR2}`;
}
check('wrangler.jsonc de deploy (entrypoint unificado + bindings)', dOk, dDetail);

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
