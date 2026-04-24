#!/usr/bin/env node
/**
 * upload-blog-posts.mjs
 * Sube los 3 posts seed a la colección `blog` de Firestore.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service-account.json \
 *     node scripts/upload-blog-posts.mjs
 *
 * - Los posts existen también como HTML estáticos en /blog/*.html como fallback SEO.
 * - Las páginas dinámicas usarán /blog-post.html?slug={slug}.
 */
import admin from 'firebase-admin';

admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'altorra-inmobiliaria'
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

const POSTS = [
  {
    slug: 'por-que-invertir-cartagena-2026',
    titulo: '¿Por qué invertir en Cartagena en 2026?',
    resumen: 'Cartagena se consolida como uno de los mercados inmobiliarios más atractivos de Latinoamérica. Descubre las razones clave y los datos que respaldan esta tendencia.',
    categoria: 'Inversión',
    imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
    fecha: new Date('2026-04-15T00:00:00Z'),
    tiempoLectura: 8,
    publicado: true,
    // Fallback a la página estática si alguien la comparte directo
    url: 'blog/por-que-invertir-cartagena-2026.html',
    contenido: `
      <p>Cartagena se ha convertido en uno de los mercados inmobiliarios más dinámicos del Caribe latinoamericano. En 2026, la ciudad combina un flujo turístico récord, una economía diversificada y una infraestructura en expansión que empuja al alza los precios y la ocupación en renta corta.</p>
      <h2>Razones clave</h2>
      <ul>
        <li><strong>Turismo internacional creciente:</strong> más de 2 millones de visitantes internacionales al año.</li>
        <li><strong>Patrimonio UNESCO:</strong> demanda premium sostenida para propiedades en el Centro Histórico.</li>
        <li><strong>Proyectos viales:</strong> nuevos accesos hacia La Boquilla y Barú aumentan la valorización.</li>
        <li><strong>Oferta Airbnb consolidada:</strong> ocupación promedio del 60-70% en zonas premium.</li>
      </ul>
      <h2>¿Qué zonas tienen mejor ROI?</h2>
      <p>Getsemaní y La Boquilla ofrecen el mejor balance riesgo-retorno: menor ticket inicial que Bocagrande con proyección de valorización del 8-12% anual.</p>
      <blockquote>Invertir en Cartagena en 2026 no es solo comprar un inmueble: es entrar en un mercado con vientos de cola macro, demográficos y turísticos.</blockquote>
    `.trim()
  },
  {
    slug: 'renta-turistica-vs-arriendo-tradicional',
    titulo: 'Renta turística vs arriendo tradicional: ¿Qué es más rentable?',
    resumen: 'Comparamos ingresos, ocupación, gastos y ROI real entre ambas modalidades para propiedades en las zonas premium de Cartagena.',
    categoria: 'Rentabilidad',
    imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
    fecha: new Date('2026-04-10T00:00:00Z'),
    tiempoLectura: 10,
    publicado: true,
    url: 'blog/renta-turistica-vs-arriendo-tradicional.html',
    contenido: `
      <p>Toda decisión de inversión inmobiliaria en Cartagena pasa por esta pregunta: ¿renta turística o arriendo tradicional?</p>
      <h2>Caso práctico</h2>
      <p>Apartamento de 2 habitaciones en Bocagrande valorado en $500.000.000 COP.</p>
      <h3>Escenario A — Renta turística</h3>
      <ul>
        <li>Tarifa promedio por noche: $450.000 COP</li>
        <li>Ocupación: 65% (≈ 19,5 noches/mes)</li>
        <li>Gastos operativos + comisión Altorra: ~35%</li>
        <li><strong>ROI anual: 11,5%</strong></li>
      </ul>
      <h3>Escenario B — Arriendo tradicional</h3>
      <ul>
        <li>Renta mensual: $3.500.000 COP</li>
        <li>Ocupación: 100%</li>
        <li>Gastos: ~15%</li>
        <li><strong>ROI anual: 6,2%</strong></li>
      </ul>
      <h2>¿Cuándo conviene cada opción?</h2>
      <p>La renta turística casi duplica el ingreso neto, pero requiere gestión profesional o un operador dedicado. El arriendo tradicional es estable y predecible, ideal si no quieres involucrarte en la operación.</p>
    `.trim()
  },
  {
    slug: 'guia-legal-inversionistas-extranjeros',
    titulo: 'Guía legal para inversionistas extranjeros en Colombia',
    resumen: 'Todo lo que necesitas saber sobre impuestos, visas de inversionista, escrituración y trámites para comprar propiedad en Colombia.',
    categoria: 'Legal',
    imagen: 'https://i.postimg.cc/FHy13q2M/pexels-rdne-8293700.jpg',
    fecha: new Date('2026-04-05T00:00:00Z'),
    tiempoLectura: 12,
    publicado: true,
    url: 'blog/guia-legal-inversionistas-extranjeros.html',
    contenido: `
      <p>Colombia permite a extranjeros comprar propiedad con los mismos derechos que los nacionales. No hay restricciones geográficas salvo zonas de frontera y áreas militares.</p>
      <h2>Paso 1 — Obtener NIT</h2>
      <p>Necesitas un número de identificación tributaria (NIT) en la DIAN. Se tramita con pasaporte.</p>
      <h2>Paso 2 — Registrar la inversión extranjera</h2>
      <p>Toda entrada de divisas debe registrarse ante el Banco de la República mediante el formulario de declaración de cambio. Esto protege tu derecho a repatriar ganancias.</p>
      <h2>Paso 3 — Due diligence del inmueble</h2>
      <ul>
        <li>Certificado de Tradición y Libertad actualizado</li>
        <li>Paz y salvo de administración e impuesto predial</li>
        <li>Verificación de gravámenes e hipotecas</li>
      </ul>
      <h2>Paso 4 — Promesa de compraventa</h2>
      <p>Contrato privado con depósito del 10-30%. Puede ejecutarse por poder desde el exterior.</p>
      <h2>Paso 5 — Escritura pública y registro</h2>
      <p>Firma ante notario, pago de impuesto de registro (~1,67%) e inscripción en la Oficina de Instrumentos Públicos.</p>
      <h2>Visa de inversionista</h2>
      <p>La inversión inmobiliaria sobre cierto monto califica para la visa M — Migrante — de inversionista, renovable hasta por 3 años.</p>
    `.trim()
  }
];

async function run() {
  console.log(`Subiendo ${POSTS.length} posts a la colección blog...`);
  for (const p of POSTS) {
    const docRef = db.collection('blog').doc(p.slug);
    const existing = await docRef.get();
    const payload = {
      ...p,
      fecha: admin.firestore.Timestamp.fromDate(p.fecha),
      updatedAt: now,
      _version: existing.exists ? (existing.data()._version || 1) + 1 : 1
    };
    if (!existing.exists) payload.createdAt = now;
    await docRef.set(payload, { merge: true });
    console.log(`  ✓ ${p.slug}`);
  }
  console.log('Listo.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
