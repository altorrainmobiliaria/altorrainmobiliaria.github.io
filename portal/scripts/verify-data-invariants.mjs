#!/usr/bin/env node
// GATE de invariantes de datos (free-tier sagrado). Convierte de HONOR a LINTER las reglas que el
// comité OD1 marcó como "removibles en un PR silencioso": el portal NUNCA usa el SDK de Firestore ni
// `onSnapshot`, y NUNCA hace lecturas de LISTA/QUERY no acotadas (`:runQuery`/`:listDocuments`). Toda
// lectura pública pasa por la capa `src/lib/data` (GET puntual REST). Falla ruidosamente (exit 1).
//
// El catálogo público (grillas comprar/arrendar/alojamientos) NO se sirve por list de Firestore: se
// resuelve por SSG a build-time (Admin SDK, cero lecturas runtime) o por doc-índice denormalizado
// (1 GET) mantenido por Cloud Function — decisión de Ola 1 (ver src/lib/data/README.md).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const srcDir = resolve(root, 'src');

// Patrón → por qué está prohibido.
const FORBIDDEN = [
  { re: /\bimport\b[^\n]*['"]firebase-admin/, why: "SDK 'firebase-admin' (no corre en Workers; escrituras = Cloud Functions)" },
  { re: /\bimport\b[^\n]*['"]firebase\/(firestore|app|auth|functions|storage|database|analytics)/, why: 'SDK cliente de Firebase (la capa de datos usa REST, no el SDK)' },
  { re: /\.onSnapshot\s*\(/, why: 'onSnapshot (listener realtime — prohibido en superficies públicas, free-tier)' },
  { re: /[:/](runQuery|listDocuments)\b/, why: 'endpoint REST de lista/query (lectura no acotada — usar GET puntual o doc-índice)' },
];

const SKIP_FILE = /\.test\.ts$/;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(p);
    if ((ext === '.ts' || ext === '.astro' || ext === '.tsx' || ext === '.mjs') && !SKIP_FILE.test(p)) files.push(p);
  }
})(srcDir);

const violations = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) violations.push({ file: relative(root, file), line: i + 1, why, code: line.trim() });
    }
  });
}

if (violations.length) {
  console.error(`❌ verify:data — ${violations.length} violación(es) de invariantes de datos (free-tier):\n`);
  for (const v of violations) console.error(`  ${v.file}:${v.line} — ${v.why}\n    > ${v.code}`);
  console.error('\nToda lectura pública pasa por src/lib/data (GET puntual REST). Ver src/lib/data/README.md.');
  process.exit(1);
}
console.log(`✅ verify:data — ${files.length} archivos escaneados: sin SDK de Firestore, sin onSnapshot, sin lista/query no acotada.`);
