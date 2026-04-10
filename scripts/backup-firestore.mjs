/**
 * backup-firestore.mjs
 * Exporta todas las colecciones de Firestore a archivos JSON locales.
 *
 * USO:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccount.json"
 *   node scripts/backup-firestore.mjs
 *
 *   # Para especificar directorio de salida:
 *   OUTPUT_DIR=./backups/2026-04-10 node scripts/backup-firestore.mjs
 *
 * SEGURIDAD: Los archivos generados pueden contener datos sensibles.
 * Nunca commitearlos al repositorio (están en .gitignore).
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname }            from 'path';
import { fileURLToPath }            from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

const TIMESTAMP  = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
const OUT_DIR    = process.env.OUTPUT_DIR || join(ROOT, 'backups', TIMESTAMP);

// Colecciones a respaldar
const COLLECTIONS = [
  'propiedades',
  'solicitudes',
  'resenas',
  'usuarios',
  'config',
  'system',
];

// ── Inicializar Firebase Admin ────────────────────────────────────────────
initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
const db = getFirestore();

// ── Exportar una colección a JSON ──────────────────────────────────────────
function tsToString(val) {
  // Convertir Timestamps de Firestore a string ISO
  if (val && typeof val === 'object') {
    if (typeof val.toDate === 'function') return val.toDate().toISOString();
    if (typeof val === 'object' && !Array.isArray(val)) {
      return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, tsToString(v)]));
    }
    if (Array.isArray(val)) return val.map(tsToString);
  }
  return val;
}

async function backupCollection(colName) {
  console.log(`  📥 ${colName}...`);
  const snap = await db.collection(colName).get();

  const docs = snap.docs.map(d => ({
    _id:  d.id,
    _ref: d.ref.path,
    ...tsToString(d.data()),
  }));

  const filePath = join(OUT_DIR, `${colName}.json`);
  writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
  console.log(`  ✅ ${colName}.json — ${docs.length} documentos`);
  return docs.length;
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Altorra Inmobiliaria — Backup Firestore');
  console.log(`  Destino: ${OUT_DIR}`);
  console.log('═══════════════════════════════════════════════════\n');

  mkdirSync(OUT_DIR, { recursive: true });

  let total = 0;
  for (const col of COLLECTIONS) {
    try {
      total += await backupCollection(col);
    } catch (err) {
      console.warn(`  ⚠️  Error en ${col}: ${err.message}`);
    }
  }

  // Metadata del backup
  const meta = {
    timestamp:   new Date().toISOString(),
    collections: COLLECTIONS,
    totalDocs:   total,
  };
  writeFileSync(join(OUT_DIR, '_meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  ✅ Backup completado: ${total} documentos totales`);
  console.log(`  📁 Directorio: ${OUT_DIR}`);
  console.log('\n  ⚠️  IMPORTANTE: No commitear esta carpeta al repo.');
  console.log('     Los backups pueden contener datos sensibles.');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err);
  process.exit(1);
});
