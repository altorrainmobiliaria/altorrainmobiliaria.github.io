/**
 * upload-to-firestore.mjs
 * Migra las propiedades de properties/data.json a Firestore.
 *
 * USO:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccount.json"
 *   node scripts/upload-to-firestore.mjs
 *
 * REQUISITOS:
 *   - Proyecto Firebase creado: altorra-inmobiliaria
 *   - Service account descargado desde Firebase Console
 *   - npm install (firebase-admin instalado)
 *
 * SEGURIDAD: Nunca commitear serviceAccount.json al repositorio.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL   = 'https://altorrainmobiliaria.co';

// ── Inicializar Firebase Admin ──────────────────────────────────────────────
initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
const db = getFirestore();

// ── Leer data.json ──────────────────────────────────────────────────────────
const dataPath = join(__dirname, '..', 'properties', 'data.json');
const rawData  = JSON.parse(readFileSync(dataPath, 'utf8'));

// ── Mapeo de campos: data.json → Firestore schema ───────────────────────────
function mapProperty(p) {
  return {
    // ── Identificación
    id:       p.id,
    titulo:   p.title,
    slug:     buildSlug(p),

    // ── Clasificación
    tipo:      p.type      || 'apartamento',
    operacion: p.operation || 'comprar',
    estado:    p.available === 0 ? 'no_disponible' : 'disponible',

    // ── Ubicación
    ciudad:   p.city        || 'Cartagena',
    barrio:   p.neighborhood || '',
    direccion: '',           // omitido por privacidad — agregar desde admin
    coords:   p.coords      || null,
    estrato:  p.strata      || null,

    // ── Características
    precio:          p.price       || 0,
    admin_fee:       p.admin_fee   || null,
    habitaciones:    p.beds        || null,
    banos:           p.baths       || null,
    sqm:             p.sqm         || null,
    sqm_terreno:     null,
    garajes:         p.garages     || null,
    piso:            p.floor       || null,
    ano_construccion: p.year_built || null,
    amoblado:        false,        // ajustar manualmente desde admin

    // ── Multimedia (URLs locales — migrar a Storage en Etapa 4)
    imagen:    p.image      ? BASE_URL + p.image : '',
    imagenes:  (p.images    || []).map(img => BASE_URL + img),
    imagen_og: p.shareImage ? BASE_URL + p.shareImage : '',

    // ── Amenidades
    features:  p.features   || [],

    // ── Texto
    descripcion: p.description || '',

    // ── SEO / Ranking
    featured:    !!p.featured,
    prioridad:   p.highlightScore || 0,
    disponible:  p.available !== 0,

    // ── Metadata Firestore
    createdAt:  p.added ? Timestamp.fromDate(new Date(p.added)) : FieldValue.serverTimestamp(),
    updatedAt:  FieldValue.serverTimestamp(),
    _version:   1,
    creadoPor:  'script-migracion',
  };
}

function buildSlug(p) {
  const parts = [p.type, p.neighborhood || p.city, p.id]
    .join('-')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar acentos
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return parts;
}

// ── Subir a Firestore ────────────────────────────────────────────────────────
async function upload() {
  console.log(`\n🚀 Iniciando migración de ${rawData.length} propiedades...\n`);

  const batch = db.batch();

  for (const raw of rawData) {
    const mapped = mapProperty(raw);
    const ref    = db.collection('propiedades').doc(mapped.id);
    batch.set(ref, mapped);
    console.log(`  ✓ ${mapped.id} — ${mapped.titulo}`);
  }

  await batch.commit();
  console.log('\n✅ Propiedades subidas correctamente.');

  // Crear documento system/meta para el cache-manager
  await db.collection('system').doc('meta').set({
    lastModified: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ system/meta creado.');

  // Crear config/general con datos de contacto
  await db.collection('config').doc('general').set({
    telefono_whatsapp: '573002439810',
    telefono_display:  '+57 300 243 9810',
    email_contacto:    'info@altorrainmobiliaria.co',
    instagram:         'https://www.instagram.com/altorrainmobiliaria',
    facebook:          'https://www.facebook.com/share/16MEXCeAB4/',
    tiktok:            'https://www.tiktok.com/@altorrainmobiliaria',
    slogan:            'Gestión integral en soluciones inmobiliarias',
  }, { merge: true });
  console.log('✅ config/general creado.');

  // Crear config/counters para códigos únicos
  await db.collection('config').doc('counters').set({
    propiedadCodeSeq: rawData.length,  // siguiente código empieza después de los existentes
    totalPropiedades: rawData.length,
    totalCiudades: 1,
  }, { merge: true });
  console.log('✅ config/counters creado.');

  // Verificar conteo final
  const snap = await db.collection('propiedades').count().get();
  console.log(`\n📊 Total propiedades en Firestore: ${snap.data().count}`);
  console.log('\n🎉 Migración completada.\n');
}

upload().catch(err => {
  console.error('\n❌ Error en la migración:', err.message);
  process.exit(1);
});
