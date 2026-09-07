/**
 * migrate-images-to-storage.mjs
 * Sube las imágenes locales del repo a Firebase Cloud Storage y actualiza
 * las URLs en los documentos de Firestore.
 *
 * USO:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccount.json"
 *   node scripts/migrate-images-to-storage.mjs
 *
 *   # Solo subir imágenes sin actualizar Firestore (dry-run):
 *   DRY_RUN=1 node scripts/migrate-images-to-storage.mjs
 *
 * REQUISITOS:
 *   - Proyecto Firebase configurado
 *   - Service account con permisos Storage + Firestore
 *   - npm install (firebase-admin + sharp instalados)
 *
 * SEGURIDAD: Nunca commitear serviceAccount.json al repositorio.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync, statSync } from 'fs';
import { readdir } from 'fs/promises';
import { extname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DRY_RUN   = process.env.DRY_RUN === '1';
// Bucket real del proyecto (ver firebase-config.js). Override con STORAGE_BUCKET env.
const BUCKET    = process.env.STORAGE_BUCKET || 'altorra-inmobiliaria-345c6.firebasestorage.app';

// ── Mapa: carpeta local → propiedadId ──────────────────────────────────────
const FOLDER_MAP = {
  'allure':   '101-27',
  'fmia':     '102-11402',
  'serena':   '103-B305',
  'fotoprop': '104-01',
  'Milan':    '105-4422',
};

// Extensiones de imagen aceptadas
const IMG_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif']);

// ── Inicializar Firebase Admin ────────────────────────────────────────────
initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  storageBucket: BUCKET,
});
const db      = getFirestore();
const storage = getStorage().bucket();

// ── Subir un archivo a Cloud Storage ──────────────────────────────────────
async function uploadFile(localPath, destPath) {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Subiría: ${localPath} → gs://${BUCKET}/${destPath}`);
    return `https://storage.googleapis.com/${BUCKET}/${encodeURIComponent(destPath)}`;
  }

  const ext         = extname(localPath).toLowerCase();
  const contentType = ext === '.webp' ? 'image/webp'
                    : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                    : ext === '.png' ? 'image/png'
                    : 'image/webp';

  await storage.upload(localPath, {
    destination: destPath,
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Hacer el archivo público
  await storage.file(destPath).makePublic();

  const url = `https://storage.googleapis.com/${BUCKET}/${encodeURIComponent(destPath).replace(/%2F/g, '/')}`;
  console.log(`  ✅ Subido: ${basename(localPath)} → ${url}`);
  return url;
}

// ── Procesar una carpeta ───────────────────────────────────────────────────
async function processFolder(folderName, propId) {
  const folderPath = join(ROOT, folderName);

  if (!existsSync(folderPath)) {
    console.log(`⚠️  Carpeta no encontrada: ${folderPath}`);
    return null;
  }

  const files = await readdir(folderPath);
  const imgFiles = files.filter(f => IMG_EXTS.has(extname(f).toLowerCase()));

  if (!imgFiles.length) {
    console.log(`⚠️  Sin imágenes en ${folderName}/`);
    return null;
  }

  console.log(`\n📁 Procesando ${folderName}/ (${imgFiles.length} imágenes → propiedadId: ${propId})`);

  const uploadedUrls = [];
  let mainImageUrl   = null;

  for (const file of imgFiles) {
    const localPath = join(folderPath, file);
    const destPath  = `propiedades/${propId}/${file}`;

    try {
      const url = await uploadFile(localPath, destPath);
      uploadedUrls.push(url);

      // La primera imagen (o la que se llame igual que la carpeta) es la principal
      const nameWithoutExt = basename(file, extname(file)).toLowerCase();
      if (!mainImageUrl || nameWithoutExt === folderName.toLowerCase()) {
        mainImageUrl = url;
      }
    } catch (err) {
      console.error(`  ❌ Error subiendo ${file}:`, err.message);
    }
  }

  return { propId, urls: uploadedUrls, mainUrl: mainImageUrl || uploadedUrls[0] };
}

// ── Actualizar URLs en Firestore ───────────────────────────────────────────
async function updateFirestore(propId, mainUrl, allUrls) {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Actualizaría Firestore propiedades/${propId}`);
    console.log(`    imagen:   ${mainUrl}`);
    console.log(`    imagenes: [${allUrls.length} URLs]`);
    return;
  }

  const ref = db.collection('propiedades').doc(propId);
  const snap = await ref.get();

  if (!snap.exists) {
    console.log(`  ⚠️  Documento ${propId} no existe en Firestore — solo subidas las imágenes`);
    return;
  }

  await ref.update({
    imagen:    mainUrl,
    imagenes:  allUrls,
    updatedAt: new Date(),
  });

  console.log(`  ✅ Firestore actualizado: propiedades/${propId}`);
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Altorra Inmobiliaria — Migración de imágenes');
  console.log(`  Bucket: ${BUCKET}`);
  console.log(`  Modo: ${DRY_RUN ? 'DRY-RUN (sin cambios reales)' : 'PRODUCCIÓN'}`);
  console.log('═══════════════════════════════════════════════════\n');

  const results = [];

  for (const [folder, propId] of Object.entries(FOLDER_MAP)) {
    const result = await processFolder(folder, propId);
    if (result) results.push(result);
  }

  if (!results.length) {
    console.log('\n⚠️  No se procesó ninguna carpeta.');
    return;
  }

  console.log('\n─── Actualizando Firestore ───────────────────────');
  for (const { propId, mainUrl, urls } of results) {
    await updateFirestore(propId, mainUrl, urls);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ Migración completada');
  console.log(`  ${results.length} carpetas procesadas`);
  console.log(`  ${results.reduce((n, r) => n + r.urls.length, 0)} imágenes en total`);
  if (!DRY_RUN) {
    console.log('\n  PRÓXIMO PASO:');
    console.log('  Verificar que las URLs carguen en el navegador, luego');
    console.log('  puedes eliminar las carpetas locales con:');
    console.log('  git rm -r allure/ fmia/ serena/ fotoprop/ Milan/');
    console.log('  git commit -m "chore: eliminar imágenes locales migradas a Cloud Storage"');
  }
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err);
  process.exit(1);
});
