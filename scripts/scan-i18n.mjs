#!/usr/bin/env node
/**
 * scan-i18n.mjs — Escáner avanzado de frases traducibles
 *
 * Recorre todos los HTML públicos, extrae el texto visible en español
 * y lista las frases que NO están en el diccionario actual de js/i18n.js.
 *
 * Uso: node scripts/scan-i18n.mjs
 *      node scripts/scan-i18n.mjs --unused    (lista claves del dict no usadas)
 *      node scripts/scan-i18n.mjs --file=ruta (escanea solo un archivo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SKIP_PAGES = new Set([
  'admin.html', 'header.html', 'footer.html', 'googlec4e47cae776946d9.html',
  'limpiar-cache.html', '404.html',
]);

// Cargar diccionario actual
function loadDict() {
  const i18n = fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8');
  const dict = new Set();
  // Regex para extraer claves del objeto ES_TO_EN
  const re = /'((?:[^'\\]|\\.)*)'\s*:\s*'(?:[^'\\]|\\.)*'/g;
  let m;
  while ((m = re.exec(i18n)) !== null) {
    dict.add(m[1].replace(/\\'/g, "'"));
  }
  return dict;
}

// Extraer texto visible de un HTML (quitar scripts, styles, tags, atributos)
function extractText(html) {
  // Quitar comentarios HTML
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Quitar <script>, <style>, <noscript>
  html = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Quitar JSON-LD inline
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const frases = [];

  // Texto entre tags
  const textRe = />([^<>]+)</g;
  let m;
  while ((m = textRe.exec(html)) !== null) {
    const t = m[1].trim();
    if (t && /[áéíóúñ¿¡]|[a-zA-Z]{3,}/.test(t) && t.length >= 2 && t.length < 200) {
      // Saltar URLs, números solos, símbolos
      if (!/^https?:\/\//.test(t) && !/^[\d\s.,$€%]+$/.test(t)) {
        frases.push(t);
      }
    }
  }

  // Atributos: placeholder, alt, aria-label, title, content (de meta description/og:*)
  const attrRe = /\b(placeholder|alt|aria-label|title|content)\s*=\s*["']([^"']+)["']/gi;
  while ((m = attrRe.exec(html)) !== null) {
    const t = m[2].trim();
    if (t && /[áéíóúñ¿¡]|[a-zA-Z]{3,}/.test(t) && t.length >= 2 && t.length < 200) {
      if (!/^https?:\/\//.test(t) && !/^[\d\s.,$€%]+$/.test(t) && !/^#[0-9a-f]+$/i.test(t)) {
        frases.push(t);
      }
    }
  }

  return frases;
}

// Heurística: ¿esta frase parece estar en español?
const ES_INDICATORS = /\b(el|la|los|las|un|una|unos|unas|de|en|por|para|con|sin|sobre|que|es|son|y|o|tu|tus|su|sus|te|me|se|lo|al|del|no|más|como|qué|cuál|cómo|dónde|cuándo|este|esta|estos|estas|ese|esa|esos|esas|todo|todos|toda|todas|propiedad|propiedades|cartagena|altorra|casa|apartamento|arriendo|venta|precio|zona|barrio|ciudad|mes|anual|año|invertir|comprar|arrendar|ver|hola|contacto|teléfono|correo|email)\b/i;

function looksSpanish(s) {
  return ES_INDICATORS.test(s) || /[áéíóúñ¿¡Ñ]/.test(s);
}

function main() {
  const onlyFile = process.argv.find(a => a.startsWith('--file='))?.split('=')[1];
  const showUnused = process.argv.includes('--unused');

  const dict = loadDict();
  console.log(`📚 Diccionario actual: ${dict.size} entradas\n`);

  // Colectar HTMLs
  function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'functions', 'og', 'p', 'snippets'].includes(entry.name)) continue;
        walk(full, files);
      } else if (entry.name.endsWith('.html')) {
        files.push(full);
      }
    }
    return files;
  }

  let htmlFiles = walk(ROOT);
  if (onlyFile) {
    htmlFiles = htmlFiles.filter(f => f.endsWith(onlyFile));
  }

  const missingByFile = new Map();      // file → [frases no traducidas]
  const allFrases = new Set();          // frases únicas totales
  const usedDictKeys = new Set();       // claves del dict que aparecen en HTML

  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file);
    const name = path.basename(file);
    if (SKIP_PAGES.has(name)) continue;

    const html = fs.readFileSync(file, 'utf8');
    const frases = extractText(html);
    const missing = [];

    for (const f of frases) {
      allFrases.add(f);
      if (dict.has(f)) {
        usedDictKeys.add(f);
      } else if (looksSpanish(f)) {
        missing.push(f);
      }
    }

    if (missing.length) missingByFile.set(rel, [...new Set(missing)]);
  }

  if (showUnused) {
    console.log('🧹 Claves del diccionario que NO aparecen en ningún HTML:\n');
    let n = 0;
    for (const k of dict) {
      if (!usedDictKeys.has(k)) {
        console.log(`  • ${k}`);
        n++;
      }
    }
    console.log(`\nTotal: ${n}`);
    return;
  }

  // Output
  let totalMissing = 0;
  for (const [file, missing] of missingByFile) {
    console.log(`\n📄 ${file} — ${missing.length} frases faltantes:`);
    for (const f of missing.slice(0, 25)) {
      console.log(`  ✗ ${f}`);
    }
    if (missing.length > 25) console.log(`  ... +${missing.length - 25} más`);
    totalMissing += missing.length;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 RESUMEN:`);
  console.log(`   Archivos HTML escaneados: ${htmlFiles.length - [...SKIP_PAGES].filter(f => htmlFiles.some(h => h.endsWith(f))).length}`);
  console.log(`   Frases únicas encontradas: ${allFrases.size}`);
  console.log(`   Diccionario usado: ${usedDictKeys.size}/${dict.size} entradas`);
  console.log(`   Frases faltantes (en español): ${totalMissing}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Volcado completo a archivo
  const allMissing = new Set();
  for (const arr of missingByFile.values()) arr.forEach(f => allMissing.add(f));
  const outFile = path.join(ROOT, 'scripts', 'i18n-missing.txt');
  fs.writeFileSync(outFile, [...allMissing].sort().join('\n'));
  console.log(`\n✓ Lista completa volcada a: scripts/i18n-missing.txt`);
}

main();
