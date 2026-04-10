/**
 * generate-properties.mjs
 * Genera páginas SEO /p/{id}.html desde Firestore y regenera sitemap.xml
 *
 * Patrón: Altorra Cars generate-vehicles.mjs
 *
 * USO:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccount.json"
 *   node scripts/generate-properties.mjs
 *
 * VARIABLES DE ENTORNO OPCIONALES:
 *   BASE_URL    — override para la URL base (default: https://altorrainmobiliaria.co)
 *   OUTPUT_DIR  — override para el directorio de salida (default: ../p)
 *   DRY_RUN=1   — muestra qué haría sin escribir archivos
 *
 * Este script es ejecutado por GitHub Actions en:
 *   - Cada push a main
 *   - Cada repository_dispatch con type: property-changed
 *   - Schedule: cada 4 horas
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname }       from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const BASE_URL  = process.env.BASE_URL || 'https://altorrainmobiliaria.co';
const OUT_DIR   = process.env.OUTPUT_DIR ? join(ROOT, process.env.OUTPUT_DIR) : join(ROOT, 'p');
const DRY_RUN   = process.env.DRY_RUN === '1';

// ── Firebase Admin ──────────────────────────────────────────────────────────
initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
const db = getFirestore();

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatCOP(n) {
  if (!n) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function escAttr(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTitle(p) {
  const parts = [p.titulo || p.title || 'Propiedad'];
  if (p.sqm)          parts.push(`${p.sqm} m²`);
  if (p.habitaciones) parts.push(`${p.habitaciones}H`);
  if (p.banos)        parts.push(`${p.banos}B`);
  return parts.join(' · ') + ' | Altorra';
}

function buildDescription(p) {
  const loc   = [p.ciudad, p.barrio].filter(Boolean).join(', ') || 'Colombia';
  const tipo  = p.tipo        || 'propiedad';
  const op    = p.operacion   || 'comprar';
  const precio = formatCOP(p.precio);
  const specs = [];
  if (p.sqm)          specs.push(`${p.sqm} m²`);
  if (p.habitaciones) specs.push(`${p.habitaciones} hab.`);
  if (p.banos)        specs.push(`${p.banos} baños`);
  return `${loc} · ${tipo} en ${op} · ${specs.join(' · ')} · ${precio}`;
}

function buildJsonLd(p, pageUrl, imageUrl) {
  const id = p.id || p._docId;
  const ld = {
    '@context': 'https://schema.org',
    '@type':    'RealEstateListing',
    name:        p.titulo || p.title || 'Propiedad Altorra',
    url:         pageUrl,
    description: p.descripcion || buildDescription(p),
    image:       imageUrl ? [imageUrl] : [],
    address: {
      '@type':           'PostalAddress',
      addressLocality:    p.ciudad    || 'Cartagena',
      streetAddress:      p.barrio    || '',
      addressRegion:      'Bolívar',
      addressCountry:     'CO',
    },
    offers: {
      '@type':        'Offer',
      price:           p.precio || 0,
      priceCurrency:  'COP',
      availability:   'https://schema.org/InStock',
    },
  };

  if (p.sqm) {
    ld.floorSize = { '@type': 'QuantitativeValue', value: p.sqm, unitCode: 'MTK' };
  }
  if (p.habitaciones) {
    ld.numberOfRooms = p.habitaciones;
  }
  if (p.coords?.lat && p.coords?.lng) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: p.coords.lat, longitude: p.coords.lng };
  }

  return JSON.stringify(ld);
}

// ── Generar HTML de una propiedad ─────────────────────────────────────────
function buildPropertyPage(p) {
  const id       = String(p.id || p._docId || '');
  const detailUrl = `${BASE_URL}/detalle-propiedad.html?id=${encodeURIComponent(id)}`;
  const pageUrl   = `${BASE_URL}/p/${id}.html`;
  const ogImage   = p.imagen_og || p.imagen || p.image || `${BASE_URL}/og/${id}.jpg`;
  const title     = buildTitle(p);
  const desc      = escAttr(buildDescription(p));
  const jsonLd    = buildJsonLd(p, pageUrl, ogImage);

  // Datos para prerender (usados por detalle-propiedad.html si JS está desactivado)
  const prerender = {
    id,
    titulo:      p.titulo || p.title || '',
    tipo:        p.tipo   || '',
    operacion:   p.operacion || '',
    ciudad:      p.ciudad || '',
    barrio:      p.barrio || '',
    precio:      p.precio || 0,
    habitaciones: p.habitaciones || p.beds || 0,
    banos:       p.banos  || p.baths || 0,
    sqm:         p.sqm    || 0,
    garajes:     p.garajes || p.garages || 0,
    imagen:      p.imagen  || p.image  || '',
    descripcion: (p.descripcion || p.description || '').slice(0, 500),
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escAttr(title)}</title>
<link rel="canonical" href="${escAttr(pageUrl)}"/>
<meta http-equiv="refresh" content="0; url=${escAttr(detailUrl)}"/>
<meta name="description" content="${desc}"/>
<meta name="robots" content="index, follow"/>

<!-- Open Graph -->
<meta property="og:site_name" content="Altorra Inmobiliaria"/>
<meta property="og:type"      content="website"/>
<meta property="og:url"       content="${escAttr(pageUrl)}"/>
<meta property="og:title"     content="${escAttr(title)}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image"     content="${escAttr(ogImage)}"/>
<meta property="og:image:width"  content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:locale"    content="es_CO"/>

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image"/>
<meta name="twitter:title"       content="${escAttr(title)}"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image"       content="${escAttr(ogImage)}"/>

<!-- JSON-LD -->
<script type="application/ld+json">${jsonLd}</script>

<!-- Prerender data (para crawlers sin JS) -->
<script>window.PRERENDERED_PROPERTY_ID="${escAttr(id)}";</script>

<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
         background: #fff; color: #111827; margin: 0; padding: 32px; }
  .card { max-width: 640px; margin: 40px auto; border: 1px solid #e5e7eb;
          border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
  .card img { width: 100%; height: 240px; object-fit: cover; display: block; }
  .info { padding: 24px; }
  .info h1 { font-size: 1.2rem; margin-bottom: 8px; color: #111827; }
  .info p  { color: #6b7280; font-size: .9rem; margin-bottom: 4px; }
  .price   { font-size: 1.4rem; font-weight: 800; color: #d4af37; margin: 12px 0; }
  .cta { display: inline-block; margin-top: 12px; padding: 12px 24px;
         background: linear-gradient(90deg, #d4af37, #ffb400); color: #111;
         font-weight: 800; border-radius: 12px; text-decoration: none; }
</style>
</head>
<body>
<!-- Redirige automáticamente a detalle-propiedad.html — contenido de respaldo para crawlers -->
<noscript>
<div class="card">
  ${prerender.imagen ? `<img src="${escAttr(prerender.imagen)}" alt="${escAttr(prerender.titulo)}" loading="eager"/>` : ''}
  <div class="info">
    <h1>${escAttr(prerender.titulo)}</h1>
    <p>${escAttr(prerender.ciudad)}${prerender.barrio ? ' · ' + escAttr(prerender.barrio) : ''}</p>
    <p>${escAttr(prerender.tipo)} · ${escAttr(prerender.operacion)}</p>
    <p>${prerender.habitaciones ? prerender.habitaciones + ' hab. · ' : ''}${prerender.banos ? prerender.banos + ' baños · ' : ''}${prerender.sqm ? prerender.sqm + ' m²' : ''}</p>
    <p class="price">${escAttr(formatCOP(prerender.precio))}</p>
    <a class="cta" href="${escAttr(detailUrl)}">Ver propiedad completa</a>
  </div>
</div>
</noscript>
<script>window.location.replace("${escAttr(detailUrl)}");</script>
</body>
</html>`;
}

// ── Generar sitemap.xml ───────────────────────────────────────────────────
function buildSitemap(properties) {
  const staticPages = [
    { url: '/',                           priority: '1.0', changefreq: 'weekly' },
    { url: '/propiedades-comprar.html',   priority: '0.9', changefreq: 'daily'  },
    { url: '/propiedades-arrendar.html',  priority: '0.9', changefreq: 'daily'  },
    { url: '/propiedades-alojamientos.html', priority: '0.8', changefreq: 'daily' },
    { url: '/quienes-somos.html',         priority: '0.6', changefreq: 'monthly'},
    { url: '/contacto.html',              priority: '0.7', changefreq: 'monthly'},
    { url: '/publicar-propiedad.html',    priority: '0.7', changefreq: 'monthly'},
    { url: '/favoritos.html',             priority: '0.5', changefreq: 'monthly'},
    { url: '/servicios-mantenimiento.html', priority: '0.6', changefreq: 'monthly'},
    { url: '/servicios-mudanzas.html',    priority: '0.6', changefreq: 'monthly'},
  ];

  const now = new Date().toISOString().split('T')[0];

  const staticEntries = staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${now}</lastmod>
  </url>`).join('');

  const propEntries = properties.map(p => {
    const id = String(p.id || p._docId || '');
    return `
  <url>
    <loc>${BASE_URL}/p/${id}.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${BASE_URL}/detalle-propiedad.html?id=${encodeURIComponent(id)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${now}</lastmod>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${propEntries}
</urlset>`;
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Altorra Inmobiliaria — Generación SEO');
  console.log(`  BASE_URL: ${BASE_URL}`);
  console.log(`  OUT_DIR:  ${OUT_DIR}`);
  console.log(`  Modo: ${DRY_RUN ? 'DRY-RUN' : 'PRODUCCIÓN'}`);
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Cargar propiedades disponibles de Firestore
  console.log('📥 Cargando propiedades desde Firestore...');
  const snap = await db.collection('propiedades')
    .where('disponible', '==', true)
    .get();

  const properties = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  console.log(`   ${properties.length} propiedades disponibles encontradas.\n`);

  if (!properties.length) {
    console.log('⚠️  Sin propiedades disponibles — no se generan páginas.');
    return;
  }

  // 2. Crear directorio de salida
  if (!DRY_RUN) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  // 3. Generar /p/{id}.html para cada propiedad
  let generated = 0;
  for (const p of properties) {
    const id       = String(p.id || p._docId || '');
    const html     = buildPropertyPage(p);
    const filePath = join(OUT_DIR, `${id}.html`);

    if (DRY_RUN) {
      console.log(`  [DRY-RUN] Generaría: ${filePath}`);
    } else {
      writeFileSync(filePath, html, 'utf8');
      console.log(`  ✅ /p/${id}.html`);
    }
    generated++;
  }

  // 4. Regenerar sitemap.xml
  const sitemapPath = join(ROOT, 'sitemap.xml');
  const sitemap     = buildSitemap(properties);

  if (DRY_RUN) {
    console.log(`\n  [DRY-RUN] Generaría: ${sitemapPath}`);
  } else {
    writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`\n  ✅ sitemap.xml regenerado (${properties.length} propiedades + páginas estáticas)`);
  }

  // 5. Actualizar data/deploy-info.json (para cache-manager del frontend)
  const deployInfoPath = join(ROOT, 'data', 'deploy-info.json');
  const deployInfo = {
    version: new Date().toISOString(),
    commit:  process.env.GITHUB_SHA || 'local',
    ref:     process.env.GITHUB_REF || 'local',
    propiedades: generated,
  };

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Actualizaría: ${deployInfoPath}`);
  } else {
    writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2), 'utf8');
    console.log(`  ✅ data/deploy-info.json actualizado`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  ✅ ${generated} páginas SEO generadas`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err);
  process.exit(1);
});
