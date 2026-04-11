/**
 * delete-all-properties.mjs
 * Borra TODAS las propiedades de la colección `propiedades` en Firestore.
 *
 * USO:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccount.json"
 *   node scripts/delete-all-properties.mjs              # borra todas
 *   node scripts/delete-all-properties.mjs 101-27 104-01  # borra solo las indicadas
 *
 * DRY RUN (simulación sin borrar):
 *   $env:DRY_RUN = "1"; node scripts/delete-all-properties.mjs
 *
 * SEGURIDAD:
 *   - Pide confirmación antes de borrar (a menos que pases --yes)
 *   - Usa la misma credencial que upload-to-firestore.mjs
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createInterface } from 'readline';

// ── Inicializar Firebase Admin ──────────────────────────────────────────────
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath) {
  console.error('❌ Falta la variable GOOGLE_APPLICATION_CREDENTIALS.');
  console.error('   PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\Users\\romad\\sa-altorra-inmobiliaria.json"');
  process.exit(1);
}

initializeApp({ credential: cert(credPath) });
const db = getFirestore();

// ── Parsear argumentos ──────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const yesFlag  = args.includes('--yes') || args.includes('-y');
const ids      = args.filter(a => !a.startsWith('-'));
const dryRun   = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

// ── Pregunta al usuario ─────────────────────────────────────────────────────
function ask(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

// ── Borrar una subcolección (auditLog) recursivamente ───────────────────────
async function deleteSubcollection(docRef, subName) {
  const sub = await docRef.collection(subName).listDocuments();
  if (!sub.length) return 0;
  const batch = db.batch();
  sub.forEach(ref => batch.delete(ref));
  await batch.commit();
  return sub.length;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🗑️  Script: borrar propiedades de Firestore');
  console.log(`   Proyecto: ${process.env.GCLOUD_PROJECT || '(del service account)'}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN (no borra nada)' : 'BORRADO REAL'}\n`);

  // 1. Listar documentos a borrar
  const colRef = db.collection('propiedades');
  let docs;
  if (ids.length) {
    console.log(`📋 Filtrando a IDs específicos: ${ids.join(', ')}`);
    const snaps = await Promise.all(ids.map(id => colRef.doc(id).get()));
    docs = snaps.filter(s => s.exists).map(s => s.ref);
    const missing = ids.filter((id, i) => !snaps[i].exists);
    if (missing.length) console.log(`   ⚠️  No encontradas: ${missing.join(', ')}`);
  } else {
    const snap = await colRef.get();
    docs = snap.docs.map(d => d.ref);
  }

  if (!docs.length) {
    console.log('✅ No hay propiedades para borrar. Firestore ya está vacío.');
    return;
  }

  console.log(`\n📦 Propiedades a borrar (${docs.length}):`);
  docs.forEach(ref => console.log(`   • ${ref.id}`));

  // 2. Confirmación
  if (!yesFlag && !dryRun) {
    const answer = await ask(`\n⚠️  ¿Borrar estas ${docs.length} propiedades y sus auditLogs? (escribe "si" para confirmar): `);
    if (answer.trim().toLowerCase() !== 'si' && answer.trim().toLowerCase() !== 'sí') {
      console.log('❌ Cancelado por el usuario.');
      process.exit(0);
    }
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No se borró nada. Quita $env:DRY_RUN para ejecutar de verdad.');
    return;
  }

  // 3. Borrar (con subcolección auditLog)
  let ok = 0, auditTotal = 0, fail = 0;
  for (const ref of docs) {
    try {
      const auditCount = await deleteSubcollection(ref, 'auditLog');
      await ref.delete();
      ok++;
      auditTotal += auditCount;
      console.log(`   ✅ ${ref.id} borrada${auditCount ? ` (+ ${auditCount} logs)` : ''}`);
    } catch (err) {
      fail++;
      console.error(`   ❌ ${ref.id} falló:`, err.message);
    }
  }

  // 4. Invalidar cache (system/meta.lastModified) para forzar recarga del frontend
  try {
    await db.collection('system').doc('meta').set(
      { lastModified: new Date() },
      { merge: true }
    );
    console.log('\n🔄 system/meta.lastModified actualizado — el frontend recargará.');
  } catch (err) {
    console.warn('⚠️  No se pudo actualizar system/meta:', err.message);
  }

  console.log(`\n📊 Resumen: ${ok} borradas, ${fail} fallidas, ${auditTotal} logs eliminados.`);
  if (fail > 0) process.exit(1);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});
