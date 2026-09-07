#!/usr/bin/env node
/**
 * fix-i18n-macro.mjs — Corrector macro robusto del sistema i18n
 *
 * 1. Añade <meta name="google" content="notranslate"> y lang="es" correcto a TODAS las páginas
 * 2. Añade <meta http-equiv="content-language" content="es">
 * 3. Verifica que i18n.js esté cargado en todas las páginas públicas
 * 4. Bump del service worker CACHE_NAME para forzar refresh
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Páginas que NO necesitan i18n (admin, redirects, verification)
const SKIP_I18N = new Set([
  'admin.html', 'header.html', 'footer.html',
  'googlec4e47cae776946d9.html', 'limpiar-cache.html',
]);

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

const stats = {
  filesScanned: 0,
  notranslateAdded: 0,
  contentLangAdded: 0,
  i18nAdded: 0,
  langFixed: 0,
};

for (const file of walk(ROOT)) {
  const name = path.basename(file);
  stats.filesScanned++;

  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // 1. Asegurar lang="es" en <html>
  if (!/<html[^>]*\slang\s*=\s*["']es["']/i.test(html)) {
    if (/<html\b/i.test(html)) {
      if (/<html[^>]*\slang\s*=/i.test(html)) {
        html = html.replace(/<html([^>]*)\slang\s*=\s*["'][^"']*["']/i, '<html$1 lang="es"');
      } else {
        html = html.replace(/<html\b/i, '<html lang="es"');
      }
      stats.langFixed++;
    }
  }

  // 2. Añadir <meta name="google" content="notranslate"> si no existe
  //    Esto previene que Chrome traduzca automáticamente la página
  if (!SKIP_I18N.has(name) && !/name\s*=\s*["']google["']\s+content\s*=\s*["']notranslate["']/i.test(html)) {
    // Insertar después de <meta charset=...>
    html = html.replace(
      /(<meta\s+charset\s*=\s*["'][^"']*["']\s*\/?>)/i,
      '$1\n  <meta name="google" content="notranslate"/>\n  <meta http-equiv="content-language" content="es"/>'
    );
    stats.notranslateAdded++;
    stats.contentLangAdded++;
  }

  // 3. Verificar que i18n.js esté cargado (páginas públicas)
  if (!SKIP_I18N.has(name) && !/i18n\.js/.test(html)) {
    // Insertar antes de </body>
    const tag = '  <script defer src="js/i18n.js"></script>\n';
    if (html.includes('</body>')) {
      html = html.replace('</body>', tag + '</body>');
      stats.i18nAdded++;
    }
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
  }
}

// 4. Bump service worker CACHE_NAME
const swPath = path.join(ROOT, 'service-worker.js');
let sw = fs.readFileSync(swPath, 'utf8');
const currentVersion = sw.match(/CACHE_NAME\s*=\s*['"]altorra-pwa-v(\d+)['"]/);
if (currentVersion) {
  const newV = parseInt(currentVersion[1], 10) + 1;
  sw = sw.replace(
    /CACHE_NAME\s*=\s*['"]altorra-pwa-v\d+['"]/,
    `CACHE_NAME = 'altorra-pwa-v${newV}'`
  );
  fs.writeFileSync(swPath, sw);
  console.log(`🔄 Service Worker CACHE_NAME: v${currentVersion[1]} → v${newV}`);
}

console.log('\n📊 Correcciones aplicadas:');
console.log(`   Archivos HTML escaneados: ${stats.filesScanned}`);
console.log(`   lang="es" corregido en <html>: ${stats.langFixed}`);
console.log(`   <meta name="google" content="notranslate">: ${stats.notranslateAdded}`);
console.log(`   <meta http-equiv="content-language">: ${stats.contentLangAdded}`);
console.log(`   i18n.js agregado: ${stats.i18nAdded}`);
console.log('\n✓ Corrección macro completada.');
