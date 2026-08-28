/*
 * ⚰️ CUARENTENA (2026-08-28, §262) — NO se ejecuta. Se conserva por si alguna de sus comprobaciones
 * hace falta otra vez; se retira porque su MODELO del sitio dejó de existir, no porque estuviera mal
 * escrito.
 *
 * Estaba ROTO en Windows desde vaya usted a saber cuándo (`URL.pathname` → `C:\C:\…`, ENOENT en la
 * primera llamada) y nadie lo notó porque su `npm test` no lo invocaba ningún CI ni ningún hook.
 * Arreglada la ruta y acotado al legacy, seguía dando **193 errores y 64 avisos, todos falsos**:
 * exigía `og:title`, `og:description` y `meta description` a los 63 stubs de redirección —que
 * redirigen en 0 segundos— y `<title>`/`lang` a dos FRAGMENTOS de HTML que por definición no los
 * llevan. Un guion que grita 257 veces sin razón no lo lee nadie: es ruido con forma de gate.
 *
 * DÓNDE VIVE AHORA CADA COSA QUE SÍ SERVÍA:
 *   · escaneo de secretos  → `scripts/verify-secretos.mjs` (10 patrones sobre TODO el repo, no 3
 *     sobre HTML y `js/`; probado en negativo y cableado al CI y al hook)
 *   · enlaces internos     → `portal/scripts/verify-enlaces.mjs` (entiende rutas SSR y el mapa de 301)
 *   · meta y estructura    → `verify:seo` y `verify:build`
 *   · frescura de deploy-info.json → nada, a propósito: §261 midió que su consumidor está muerto.
 */

#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * ⚠️ El `.replace` de la letra de unidad NO es opcional en Windows (§262). `URL.pathname` devuelve
 * `/C:/Users/…`, y `join()` lo convierte en `C:\C:\Users\…`: `ENOENT` en la PRIMERA llamada, así que
 * este archivo llevaba **sin poder ejecutarse** el tiempo que llevara ahí. Nadie lo notó porque
 * `npm test` de la raíz no lo invoca ningún CI ni ningún hook — un guion roto y además no llamado.
 * `scripts/verify-contratos-legacy.mjs` ya traía esta misma corrección; aquí faltaba.
 */
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/\/$/, '');
const BASE = 'https://altorrainmobiliaria.co';
let errors = 0;
let warnings = 0;

function fail(file, msg) { console.error(`  ✗ ${file}: ${msg}`); errors++; }
function warn(file, msg) { console.warn(`  ⚠ ${file}: ${msg}`); warnings++; }
function pass(msg) { console.log(`  ✓ ${msg}`); }

/*
 * ALCANCE: el LEGACY, y solo el legacy (§262).
 *
 * Este validador es anterior al portal y su comprobador de enlaces asume un sitio PLANO —resuelve
 * `/comprar` como `comprar.html`—. Apuntado contra el build de Astro daba **4945 «errores»**, todos
 * falsos, y un guion que grita 4945 veces no lo lee nadie: es ruido con forma de gate.
 *
 * Del portal ya se ocupan gates correctos y cableados al CI (`verify:enlaces` para los enlaces,
 * `verify:seo` y `verify:build` para meta y estructura). Lo que NO tenía casi nada es justo lo que
 * este archivo sabe mirar: los ficheros del sitio viejo que **el dominio sigue sirviendo** —donde
 * vivió la fuga del móvil personal (§250)—. Se le devuelve ese alcance en vez de jubilarlo.
 */
const FUERA = new Set(['node_modules', 'functions', 'portal', '_legacy', 'backups', 'design', 'skills', 'docs', 'specs', 'tests']);

function findHtml(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || FUERA.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { findHtml(full, results); continue; }
    if (entry.endsWith('.html') && !entry.startsWith('_')) results.push(full);
  }
  return results;
}

const htmlFiles = findHtml(ROOT);
console.log(`\nValidating ${htmlFiles.length} HTML files...\n`);

// ─── Test 1: Every public page has required meta tags ─────────────────────────
console.log('── Meta tags ──');
const SKIP_META = [
  'header.html', 'footer.html', 'snippets/', 'blog-post.html',
  'servicios-mantenimiento.html', 'servicios-mudanzas.html',
  'turismo-inmobiliario.html',
];
const SKIP_FILES = ['google', 'snippets/', 'header.html', 'footer.html'];
let metaOk = 0;

for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');

  if (rel.startsWith('p/') || rel.startsWith('og/')) continue;
  if (SKIP_META.some(s => rel.includes(s))) continue;
  if (html.includes('noindex')) continue;
  if (rel.startsWith('google')) continue;

  if (!html.includes('<title>')) fail(rel, 'missing <title>');
  if (!html.includes('name="description"')) fail(rel, 'missing meta description');
  if (!html.includes('og:title')) fail(rel, 'missing og:title');
  if (!html.includes('og:description')) fail(rel, 'missing og:description');
  if (!html.includes('lang="es"') && !html.includes('lang="en"')) fail(rel, 'missing lang attribute');
  metaOk++;
}
pass(`${metaOk} pages checked for meta tags`);

// ─── Test 2: JSON-LD validity ─────────────────────────────────────────────────
console.log('\n── JSON-LD ──');
let jsonldCount = 0;
let jsonldValid = 0;

for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  const regex = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    jsonldCount++;
    try {
      const data = JSON.parse(match[1]);
      if (!data['@context'] || !data['@type']) {
        fail(rel, 'JSON-LD missing @context or @type');
      } else {
        jsonldValid++;
      }
    } catch (e) {
      fail(rel, `invalid JSON-LD: ${e.message}`);
    }
  }
}
pass(`${jsonldValid}/${jsonldCount} JSON-LD blocks valid`);

// ─── Test 3: BreadcrumbList coverage ──────────────────────────────────────────
console.log('\n── BreadcrumbList ──');
let breadcrumbCount = 0;
const noBreadcrumb = [];
const SKIP_BREADCRUMB = [
  'header.html', 'footer.html', 'snippets/', 'blog-post.html', 'google',
];

for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  if (rel.startsWith('p/') || rel.startsWith('og/') || rel === 'index.html') continue;
  if (rel === '404.html' || rel === 'gracias.html' || rel === 'admin.html') continue;
  if (rel.startsWith('blog/_')) continue;
  if (SKIP_BREADCRUMB.some(s => rel.includes(s))) continue;

  const html = readFileSync(file, 'utf8');
  if (html.includes('noindex')) continue;

  if (html.includes('BreadcrumbList')) {
    breadcrumbCount++;
  } else {
    noBreadcrumb.push(rel);
  }
}
pass(`${breadcrumbCount} pages have BreadcrumbList`);
if (noBreadcrumb.length > 0) {
  for (const p of noBreadcrumb) warn(p, 'missing BreadcrumbList');
}

// ─── Test 4: Internal links not broken ────────────────────────────────────────
console.log('\n── Internal links ──');
let linkChecked = 0;
let linkBroken = 0;

for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  const hrefRegex = /href="([^"#?]+)"/g;
  let m;
  if (rel.includes('snippets/')) continue;

  while ((m = hrefRegex.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('data:') || href === '' || href.startsWith('$')) continue;

    const resolved = href.startsWith('/')
      ? join(ROOT, href)
      : join(ROOT, rel.includes('/') ? rel.substring(0, rel.lastIndexOf('/')) : '', href);

    const cleanPath = resolved.split('?')[0].split('#')[0];
    linkChecked++;

    if (!existsSync(cleanPath)) {
      fail(rel, `broken link → ${href}`);
      linkBroken++;
    }
  }
}
pass(`${linkChecked - linkBroken}/${linkChecked} internal links valid`);

// ─── Test 5: deploy-info.json freshness ───────────────────────────────────────
console.log('\n── deploy-info.json ──');
try {
  const info = JSON.parse(readFileSync(join(ROOT, 'data/deploy-info.json'), 'utf8'));
  const age = Date.now() - new Date(info.version).getTime();
  const days = Math.floor(age / 86400000);
  if (days > 7) {
    warn('data/deploy-info.json', `version is ${days} days old`);
  } else {
    pass(`deploy-info.json is ${days} day(s) old`);
  }
} catch (e) {
  fail('data/deploy-info.json', `cannot read: ${e.message}`);
}

// ─── Test 6: No secrets or credentials in repo ────────────────────────────────
console.log('\n── Security ──');
const SECRETS_PATTERNS = [
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /ghp_[0-9A-Za-z]{36}/,
  /sk-[0-9A-Za-z]{48}/,
];
// Note: Firebase API keys (AIza...) are public by design and excluded from checks

let secretsFound = 0;
for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  for (const pat of SECRETS_PATTERNS) {
    if (pat.test(content)) {
      fail(rel, `possible secret matching ${pat.source}`);
      secretsFound++;
    }
  }
}

const jsFiles = findHtml(ROOT).length === 0 ? [] :
  readdirSync(join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => join(ROOT, 'js', f));
for (const file of jsFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf8');
  for (const pat of SECRETS_PATTERNS) {
    if (pat.test(content)) {
      fail(rel, `possible secret matching ${pat.source}`);
      secretsFound++;
    }
  }
}
if (secretsFound === 0) pass('No secrets detected in HTML/JS files');

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${errors} errors, ${warnings} warnings`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(errors > 0 ? 1 : 0);
