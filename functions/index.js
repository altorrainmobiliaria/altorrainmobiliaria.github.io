/**
 * functions/index.js — Altorra Inmobiliaria
 * Cloud Functions (Node 20, us-central1)
 *
 * FUNCIONES:
 *   onNewSolicitud           → Firestore create solicitudes/{id}
 *                              Envía email al admin con los datos del lead
 *   onSolicitudStatusChanged → Firestore update solicitudes/{id}
 *                              Envía email al cliente cuando el estado cambia
 *   onPropertyChange         → Firestore write propiedades/{id}
 *                              Dispara GitHub Actions para regenerar SEO (debounce 5 min)
 *   triggerSeoRegeneration   → HTTPS callable (solo super_admin)
 *                              Fuerza regeneración SEO manualmente desde el admin
 *   createManagedUserV2      → HTTPS callable (solo super_admin)
 *                              Crea usuario Firebase Auth + documento en /usuarios
 *   deleteManagedUserV2      → HTTPS callable (solo super_admin)
 *                              Elimina usuario Firebase Auth + documento en /usuarios
 *   updateUserRoleV2         → HTTPS callable (solo super_admin)
 *                              Actualiza el rol de un usuario en /usuarios/{uid}
 *
 * SECRETS (configurar con: firebase functions:secrets:set SECRET_NAME):
 *   EMAIL_USER   → cuenta Gmail remitente (ej. notificaciones@altorrainmobiliaria.co)
 *   EMAIL_PASS   → app password de Gmail (16 caracteres, sin espacios)
 *   GITHUB_PAT   → Personal Access Token con permiso repo + workflow
 *
 * DEPLOY:
 *   cd functions && npm install
 *   firebase deploy --only functions
 *
 * EMULADOR LOCAL:
 *   firebase emulators:start --only functions,firestore
 */

'use strict';

const { onDocumentCreated, onDocumentUpdated, onDocumentWritten }
  = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule }         = require('firebase-functions/v2/scheduler');
const { defineSecret }       = require('firebase-functions/params');
const { initializeApp }      = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth }            = require('firebase-admin/auth');
const nodemailer             = require('nodemailer');
const https                  = require('https');

initializeApp();
const db   = getFirestore();
const auth = getAuth();

// ── Secrets ────────────────────────────────────────────────────────────────
const EMAIL_USER = defineSecret('EMAIL_USER');
const EMAIL_PASS = defineSecret('EMAIL_PASS');
const GITHUB_PAT = defineSecret('GITHUB_PAT');

// ── Constantes ─────────────────────────────────────────────────────────────
const REGION       = 'us-central1';
const ADMIN_EMAIL  = 'info@altorrainmobiliaria.co';
const SITE_NAME    = 'Altorra Inmobiliaria';
const GITHUB_OWNER = 'altorrainmobiliaria';
const GITHUB_REPO  = 'altorrainmobiliaria.github.io';
const SEO_EVENT    = 'property-changed';

// ── Helper: crear transporter de Nodemailer ───────────────────────────────
function createTransporter(user, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

// ── Helper: formatear COP ─────────────────────────────────────────────────
function formatCOP(n) {
  if (!n) return '';
  return '$\u00a0' + Number(n).toLocaleString('es-CO') + '\u00a0COP';
}

// ── Helper: verificar rol de super_admin ─────────────────────────────────
async function requireSuperAdmin(uid) {
  if (!uid) throw new HttpsError('unauthenticated', 'Se requiere autenticación.');
  const snap = await db.collection('usuarios').doc(uid).get();
  if (!snap.exists || snap.data().rol !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Solo super_admin puede realizar esta acción.');
  }
}

// ── Helper: disparar GitHub Actions repository_dispatch ──────────────────
function triggerGitHubActions(pat, eventType = SEO_EVENT) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ event_type: eventType });
    const options = {
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      method:   'POST',
      headers:  {
        'Accept':        'application/vnd.github+json',
        'Authorization': `Bearer ${pat}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent':    SITE_NAME,
      },
    };
    const req = https.request(options, (res) => {
      if (res.statusCode === 204) return resolve(true);
      reject(new Error('GitHub API status: ' + res.statusCode));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Debounce para onPropertyChange (evitar disparos repetidos) ───────────
// Guarda un timestamp en system/seoDebounce; solo dispara si pasaron 5 min
const SEO_DEBOUNCE_MS = 5 * 60 * 1000;

async function shouldTriggerSeo() {
  try {
    const ref  = db.collection('system').doc('seoDebounce');
    const snap = await ref.get();
    const last = snap.exists ? snap.data().lastTriggered?.toMillis() : 0;
    if (Date.now() - (last || 0) < SEO_DEBOUNCE_MS) return false;
    await ref.set({ lastTriggered: FieldValue.serverTimestamp() });
    return true;
  } catch (_) { return true; }
}

// ── Helper: lead scoring automático ─────────────────────────────────────
function calculateLeadScore(data) {
  let score = 0;
  const extra = data.datosExtra || {};

  // Type of inquiry (higher intent = higher score)
  const typeScores = {
    agenda_visita:       30,
    contacto_propiedad:  25,
    solicitud_credito:   20,
    publicar_propiedad:  15,
    solicitud_avaluo:    15,
    solicitud_juridica:  10,
    solicitud_contable:  10,
    otro:                 5,
  };
  score += typeScores[data.tipo] || 5;

  // Completeness of contact data
  if (data.nombre)   score += 5;
  if (data.email)    score += 10;
  if (data.telefono) score += 10;

  // Has a specific property (higher intent)
  if (extra.propiedadId) score += 10;

  // High-value property (price > 1B COP)
  if (extra.precioAproximado > 1_000_000_000) score += 10;
  else if (extra.precioAproximado > 500_000_000) score += 5;

  // Message length (effort = interest)
  const msg = extra.mensaje || '';
  if (msg.length > 100) score += 5;
  else if (msg.length > 30) score += 2;

  // Scheduling a visit with specific date = high intent
  if (data.requiereCita && extra.fecha) score += 10;

  // Business hours bonus (Mon-Fri 8am-6pm Colombia = UTC-5)
  const now = new Date();
  const colombiaHour = (now.getUTCHours() - 5 + 24) % 24;
  const day = now.getUTCDay();
  if (day >= 1 && day <= 5 && colombiaHour >= 8 && colombiaHour <= 18) score += 5;

  // Classify: hot (70+), warm (40-69), cold (<40)
  let tier;
  if (score >= 70) tier = 'hot';
  else if (score >= 40) tier = 'warm';
  else tier = 'cold';

  return { score, tier };
}

// ── Nurturing email sequences ──────────────────────────────────────────
// Each sequence: array of { dayOffset, subject, bodyFn(data, extra) }
// Step 0 = day of creation (handled by onNewSolicitud), steps 1+ = follow-ups

const SITE_URL = 'https://altorrainmobiliaria.co';

function wrapEmail(content) {
  return `<div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#d4af37;padding:20px;border-radius:8px 8px 0 0;text-align:center">
      <h1 style="color:#000;margin:0;font-size:1.3rem">${SITE_NAME}</h1>
      <p style="color:#000;margin:4px 0 0;font-size:.85rem">Gestión Integral en Soluciones Inmobiliarias</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 8px 8px">
      ${content}
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0 12px"/>
      <p style="font-size:.75rem;color:#9ca3af;text-align:center">
        ${SITE_NAME} · Cartagena, Colombia<br/>
        <a href="mailto:${ADMIN_EMAIL}" style="color:#d4af37">${ADMIN_EMAIL}</a> ·
        <a href="https://wa.me/573002439810" style="color:#d4af37">+57 300 243 9810</a><br/>
        <a href="${SITE_URL}" style="color:#d4af37">altorrainmobiliaria.co</a>
      </p>
    </div></div>`;
}

function cta(text, url) {
  return `<p style="text-align:center;margin:20px 0"><a href="${url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(90deg,#d4af37,#ffb400);color:#000;font-weight:700;text-decoration:none;border-radius:8px">${text}</a></p>`;
}

const NURTURING_SEQUENCES = {
  contacto_propiedad: [
    { dayOffset: 1, subject: 'Más sobre la propiedad que te interesó',
      bodyFn: (d, ex) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Gracias por tu interés en ${ex.propiedadTitulo ? `<strong>${ex.propiedadTitulo}</strong>` : 'nuestras propiedades'}. Queremos asegurarnos de que tengas toda la información que necesitas.</p>
        <p>Nuestro equipo de asesores está disponible para responder cualquier pregunta sobre la propiedad, el barrio, la documentación legal y las opciones de financiamiento.</p>
        ${cta('Ver la propiedad', ex.propiedadId ? `${SITE_URL}/detalle-propiedad.html?id=${ex.propiedadId}` : `${SITE_URL}/propiedades-comprar.html`)}
        <p style="color:#6b7280;font-size:.9rem">¿Prefieres hablar directamente? <a href="https://wa.me/573002439810" style="color:#d4af37">Escríbenos por WhatsApp</a>.</p>`) },
    { dayOffset: 3, subject: 'Propiedades similares que podrían interesarte',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>En Altorra Inmobiliaria renovamos nuestro catálogo constantemente. Te invitamos a explorar propiedades similares que podrían ajustarse a lo que buscas.</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Apartamentos con vista al mar en Bocagrande</li>
          <li>Casas amplias en Castillogrande y Manga</li>
          <li>Oportunidades de inversión en Cartagena</li>
        </ul>
        ${cta('Explorar propiedades', `${SITE_URL}/propiedades-comprar.html`)}`) },
    { dayOffset: 7, subject: '¿Te gustaría agendar una visita personalizada?',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Sabemos que comprar o arrendar una propiedad es una decisión importante. Por eso ofrecemos <strong>visitas personalizadas</strong> sin compromiso para que conozcas el inmueble en detalle.</p>
        <p>Durante la visita podrás:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Recorrer la propiedad con un asesor experto</li>
          <li>Conocer el barrio y sus servicios</li>
          <li>Recibir asesoría legal y financiera gratuita</li>
        </ul>
        ${cta('Agendar visita', `${SITE_URL}/contacto.html`)}`) },
    { dayOffset: 14, subject: 'Tu asesor inmobiliario está disponible',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Queremos recordarte que nuestro equipo sigue a tu disposición. Ya sea que estés listo para avanzar o necesites más tiempo para decidir, estamos aquí para ayudarte.</p>
        <p>En Altorra Inmobiliaria ofrecemos:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Respaldo jurídico en cada operación</li>
          <li>Avalúos profesionales certificados</li>
          <li>Administración integral de propiedades</li>
        </ul>
        ${cta('Contactar un asesor', `${SITE_URL}/contacto.html`)}
        <p style="color:#9ca3af;font-size:.8rem;text-align:center">Este es nuestro último correo de seguimiento. No recibirás más mensajes automáticos.</p>`) },
  ],

  publicar_propiedad: [
    { dayOffset: 1, subject: 'Así promocionamos tu propiedad en Altorra',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Recibimos tu solicitud para publicar tu propiedad. En Altorra Inmobiliaria nos encargamos de todo el proceso de comercialización:</p>
        <ul style="color:#374151;line-height:1.8">
          <li><strong>Fotografía profesional</strong> y tour virtual</li>
          <li><strong>Publicación multicanal</strong> en portales y redes sociales</li>
          <li><strong>Asesoría legal</strong> para contratos seguros</li>
          <li><strong>Atención a compradores</strong> calificados</li>
        </ul>
        ${cta('Conocer nuestros servicios', `${SITE_URL}/quienes-somos.html`)}`) },
    { dayOffset: 3, subject: '¿Por qué vender con Altorra Inmobiliaria?',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Elegir la inmobiliaria correcta marca la diferencia. Estos son algunos beneficios de publicar con nosotros:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>🏆 Inmobiliaria #1 en Cartagena en Google Maps</li>
          <li>📊 Estrategia de precio basada en avalúos reales</li>
          <li>🔒 Verificación legal de escrituras y tradición</li>
          <li>🌐 Exposición internacional a compradores</li>
        </ul>
        ${cta('Publicar mi propiedad', `${SITE_URL}/publicar-propiedad.html`)}`) },
    { dayOffset: 7, subject: 'Avalúo gratuito para tu propiedad',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Para ayudarte a definir el mejor precio de venta, te ofrecemos un <strong>avalúo preliminar sin costo</strong>.</p>
        <p>Nuestros avalúos consideran:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Ubicación y estrato</li>
          <li>Estado del inmueble</li>
          <li>Precios del mercado actual</li>
          <li>Potencial de valorización</li>
        </ul>
        ${cta('Solicitar avalúo gratuito', `${SITE_URL}/avaluo.html`)}`) },
    { dayOffset: 14, subject: '¿Listo para vender? Tu asesor te espera',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Sabemos que vender una propiedad requiere confianza. En Altorra Inmobiliaria hemos ayudado a cientos de propietarios en Cartagena a cerrar operaciones exitosas.</p>
        <p>Agenda una cita con uno de nuestros asesores — sin compromiso.</p>
        ${cta('Agendar cita', `${SITE_URL}/contacto.html`)}
        <p style="color:#9ca3af;font-size:.8rem;text-align:center">Este es nuestro último correo de seguimiento.</p>`) },
  ],

  solicitud_avaluo: [
    { dayOffset: 1, subject: 'Tu solicitud de avalúo: qué esperar',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Recibimos tu solicitud de avalúo. Un asesor se pondrá en contacto contigo en las próximas 24 horas para coordinar la visita técnica.</p>
        <p><strong>¿Qué incluye nuestro avalúo?</strong></p>
        <ul style="color:#374151;line-height:1.8">
          <li>Inspección técnica del inmueble</li>
          <li>Análisis comparativo del mercado</li>
          <li>Informe escrito con valoración certificada</li>
          <li>Recomendaciones para maximizar el valor</li>
        </ul>
        ${cta('Más sobre avalúos', `${SITE_URL}/avaluo.html`)}`) },
    { dayOffset: 5, subject: 'Tendencias del mercado inmobiliario en Cartagena',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Mientras preparamos tu avalúo, te compartimos datos clave del mercado inmobiliario en Cartagena para 2026:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Valorización promedio anual: 8-12% en zonas premium</li>
          <li>Demanda creciente de renta turística</li>
          <li>Nuevos proyectos en Bocagrande y Crespo</li>
        </ul>
        <p>¿Necesitas ayuda adicional? Ofrecemos servicios completos de gestión inmobiliaria.</p>
        ${cta('Ver nuestros servicios', `${SITE_URL}/invertir.html`)}`) },
    { dayOffset: 10, subject: 'Servicios adicionales para tu propiedad',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Además de avalúos, en Altorra Inmobiliaria ofrecemos un portafolio completo de servicios:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Administración de inmuebles</li>
          <li>Servicios jurídicos especializados</li>
          <li>Gestión de renta turística</li>
          <li>Mantenimiento y reparaciones</li>
        </ul>
        ${cta('Explorar servicios', `${SITE_URL}/quienes-somos.html`)}
        <p style="color:#9ca3af;font-size:.8rem;text-align:center">Este es nuestro último correo de seguimiento.</p>`) },
  ],

  gestion_renta_turistica: [
    { dayOffset: 1, subject: 'Así gestionamos tu renta turística',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Recibimos tu interés en nuestro servicio de gestión de renta turística. Te explicamos cómo funciona:</p>
        <ol style="color:#374151;line-height:1.8">
          <li><strong>Evaluación:</strong> Visitamos tu propiedad y evaluamos su potencial</li>
          <li><strong>Preparación:</strong> Fotografía profesional y publicación en plataformas</li>
          <li><strong>Operación:</strong> Gestión de reservas, limpieza y atención al huésped</li>
          <li><strong>Liquidación:</strong> Reportes mensuales y pago directo a tu cuenta</li>
        </ol>
        ${cta('Más detalles', `${SITE_URL}/renta-turistica.html`)}`) },
    { dayOffset: 3, subject: '¿Cuánto puede rentar tu propiedad en Cartagena?',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Las propiedades en Cartagena generan <strong>rendimientos atractivos</strong> en renta turística:</p>
        <table style="width:100%;border-collapse:collapse;font-size:.9rem;margin:16px 0">
          <tr style="background:#f9fafb"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Bocagrande</strong></td><td style="padding:8px;border:1px solid #e5e7eb">8-12% ROI anual</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Centro Histórico</strong></td><td style="padding:8px;border:1px solid #e5e7eb">10-14% ROI anual</td></tr>
          <tr style="background:#f9fafb"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Castillogrande</strong></td><td style="padding:8px;border:1px solid #e5e7eb">7-10% ROI anual</td></tr>
        </table>
        <p>Usa nuestra calculadora para estimar tu rentabilidad específica.</p>
        ${cta('Calcular mi ROI', `${SITE_URL}/invertir.html`)}`) },
    { dayOffset: 7, subject: 'Renta turística vs arriendo tradicional',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>¿Sabías que la renta turística puede generar <strong>hasta 3x más ingresos</strong> que el arriendo tradicional en Cartagena?</p>
        <p>Con Altorra no tienes que preocuparte por nada. Nos encargamos de la operación completa: reservas, limpieza, mantenimiento, atención al huésped y reportes.</p>
        ${cta('Solicitar asesoría', `${SITE_URL}/renta-turistica.html`)}`) },
    { dayOffset: 14, subject: 'Tu propiedad puede empezar a rentar hoy',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>No dejes tu propiedad vacía. En Altorra Inmobiliaria activamos tu inmueble para renta turística en menos de 2 semanas.</p>
        <p>Contacta a tu asesor hoy y comienza a generar ingresos pasivos.</p>
        ${cta('Empezar ahora', `${SITE_URL}/contacto.html`)}
        <p style="color:#9ca3af;font-size:.8rem;text-align:center">Este es nuestro último correo de seguimiento.</p>`) },
  ],

  _default: [
    { dayOffset: 3, subject: 'Conoce todos los servicios de Altorra Inmobiliaria',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Gracias por contactarnos. En Altorra Inmobiliaria ofrecemos una gama completa de servicios inmobiliarios:</p>
        <ul style="color:#374151;line-height:1.8">
          <li>Compra y venta de inmuebles</li>
          <li>Arriendo y administración</li>
          <li>Renta turística</li>
          <li>Avalúos y servicios legales</li>
        </ul>
        ${cta('Explorar servicios', `${SITE_URL}/quienes-somos.html`)}`) },
    { dayOffset: 7, subject: 'Estamos aquí para ayudarte',
      bodyFn: (d) => wrapEmail(`
        <p>Hola <strong>${d.nombre || 'estimado cliente'}</strong>,</p>
        <p>Solo queríamos recordarte que nuestro equipo está disponible para cualquier consulta inmobiliaria.</p>
        <p>Puedes contactarnos por WhatsApp, email o visitarnos en nuestra oficina en Cartagena.</p>
        ${cta('Contactar ahora', `${SITE_URL}/contacto.html`)}
        <p style="color:#9ca3af;font-size:.8rem;text-align:center">Este es nuestro último correo de seguimiento.</p>`) },
  ],
};

function getNurturingSequence(tipo) {
  return NURTURING_SEQUENCES[tipo] || NURTURING_SEQUENCES._default;
}

// ══════════════════════════════════════════════════════════════════════════
// 1. onNewSolicitud — Email al admin cuando llega un lead nuevo
// ══════════════════════════════════════════════════════════════════════════
exports.onNewSolicitud = onDocumentCreated(
  { document: 'solicitudes/{solicitudId}', region: REGION, secrets: [EMAIL_USER, EMAIL_PASS] },
  async (event) => {
    const data = event.data.data();

    // Idempotencia: no enviar si ya se envió
    if (data.emailSent) return;

    // Lead scoring
    const { score, tier } = calculateLeadScore(data);

    // Initialize nurturing sequence (follow-up emails over days)
    const sequence = getNurturingSequence(data.tipo);
    const firstStep = sequence[0];
    const nextAt = new Date(Date.now() + firstStep.dayOffset * 86400000);
    await event.data.ref.update({
      leadScore: score,
      leadTier: tier,
      nurturing: {
        step:         0,
        completed:    false,
        unsubscribed: false,
        nextEmailAt:  Timestamp.fromDate(nextAt),
        sequenceType: data.tipo || '_default',
        totalSteps:   sequence.length,
      },
    });

    const extra   = data.datosExtra || {};
    const tipo    = data.tipo || 'contacto';
    const tipoLabel = {
      contacto_propiedad:  'Contacto sobre propiedad',
      publicar_propiedad:  'Solicitud para publicar',
      solicitud_avaluo:    'Solicitud de avalúo',
      solicitud_juridica:  'Consulta jurídica',
      solicitud_contable:  'Consulta contable',
      otro:                'Otro',
    }[tipo] || tipo;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#d4af37;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="color:#000;margin:0;font-size:1.4rem">${SITE_NAME}</h1>
          <p style="color:#000;margin:4px 0 0;font-size:.9rem">Nuevo lead recibido</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 8px 8px">
          <h2 style="margin:0 0 16px;font-size:1.1rem;color:#111">${tipoLabel}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:.95rem">
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;width:140px">Nombre</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6"><strong>${data.nombre || '—'}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Teléfono</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6"><a href="tel:${data.telefono}">${data.telefono || '—'}</a></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Email</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6"><a href="mailto:${data.email}">${data.email || '—'}</a></td></tr>
            ${extra.propiedadTitulo ? `
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Propiedad</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6">${extra.propiedadTitulo} (ID: ${extra.propiedadId || '—'})</td></tr>` : ''}
            ${extra.mensaje ? `
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Mensaje</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6">${extra.mensaje}</td></tr>` : ''}
            ${extra.tipoInmueble ? `
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Inmueble</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6">${extra.tipoInmueble} en ${extra.ciudad || '—'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Precio est.</td>
                <td style="padding:8px;border-bottom:1px solid #f3f4f6">${formatCOP(extra.precioAproximado) || '—'}</td></tr>` : ''}
            <tr><td style="padding:8px;color:#6b7280">Origen</td>
                <td style="padding:8px">${data.origen || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:${tier === 'hot' ? '#fef2f2' : tier === 'warm' ? '#fffbeb' : '#f9fafb'};border-radius:6px;font-size:.85rem;border-left:4px solid ${tier === 'hot' ? '#ef4444' : tier === 'warm' ? '#f59e0b' : '#9ca3af'}">
            <strong style="color:${tier === 'hot' ? '#dc2626' : tier === 'warm' ? '#d97706' : '#6b7280'}">
              ${tier === 'hot' ? '🔥 HOT' : tier === 'warm' ? '🟡 WARM' : '🔵 COLD'} — Score: ${score}/100
            </strong>
            <span style="color:#6b7280;margin-left:8px">ID: ${event.params.solicitudId}</span>
          </div>
        </div>
      </div>`;

    try {
      const transporter = createTransporter(EMAIL_USER.value(), EMAIL_PASS.value());
      await transporter.sendMail({
        from:    `"${SITE_NAME}" <${EMAIL_USER.value()}>`,
        to:      ADMIN_EMAIL,
        subject: `[${tier.toUpperCase()}] ${tipoLabel} — ${data.nombre || 'Sin nombre'}`,
        html,
      });
      // Marcar como enviado (idempotencia)
      await event.data.ref.update({ emailSent: true, emailSentAt: FieldValue.serverTimestamp() });
    } catch (err) {
      console.error('[onNewSolicitud] Error enviando email:', err.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 2. onSolicitudStatusChanged — Email al cliente cuando el admin actualiza estado
// ══════════════════════════════════════════════════════════════════════════
exports.onSolicitudStatusChanged = onDocumentUpdated(
  { document: 'solicitudes/{solicitudId}', region: REGION, secrets: [EMAIL_USER, EMAIL_PASS] },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    // Solo actuar si el estado cambió y el cliente tiene email
    if (before.estado === after.estado) return;
    if (!after.email) return;

    const estadoLabel = {
      en_gestion: 'En gestión — un asesor te contactará pronto',
      cerrado:    'Cerrado — gracias por contactarnos',
      pendiente:  'Pendiente de revisión',
    }[after.estado] || after.estado;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#d4af37;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="color:#000;margin:0;font-size:1.4rem">${SITE_NAME}</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 8px 8px">
          <p>Hola <strong>${after.nombre || 'cliente'}</strong>,</p>
          <p>El estado de tu solicitud ha sido actualizado:</p>
          <div style="margin:16px 0;padding:16px;background:#f9fafb;border-left:4px solid #d4af37;border-radius:4px">
            <strong>${estadoLabel}</strong>
          </div>
          <p style="color:#6b7280;font-size:.9rem">Si tienes alguna pregunta, contáctanos a
            <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a> o al
            <a href="https://wa.me/573002439810">+57 300 243 9810</a>.
          </p>
        </div>
      </div>`;

    try {
      const transporter = createTransporter(EMAIL_USER.value(), EMAIL_PASS.value());
      await transporter.sendMail({
        from:    `"${SITE_NAME}" <${EMAIL_USER.value()}>`,
        to:      after.email,
        subject: `Tu solicitud en ${SITE_NAME} — ${estadoLabel}`,
        html,
      });
    } catch (err) {
      console.error('[onSolicitudStatusChanged] Error enviando email:', err.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 3. onPropertyChange — Dispara GitHub Actions para regenerar SEO
// ══════════════════════════════════════════════════════════════════════════
exports.onPropertyChange = onDocumentWritten(
  { document: 'propiedades/{propId}', region: REGION, secrets: [GITHUB_PAT] },
  async () => {
    const ok = await shouldTriggerSeo();
    if (!ok) {
      console.log('[onPropertyChange] Debounce activo — SEO omitido');
      return;
    }
    try {
      await triggerGitHubActions(GITHUB_PAT.value());
      console.log('[onPropertyChange] GitHub Actions disparado ✅');
    } catch (err) {
      console.error('[onPropertyChange] Error disparando GitHub Actions:', err.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 4. triggerSeoRegeneration — Forzar regeneración SEO desde el admin
// ══════════════════════════════════════════════════════════════════════════
exports.triggerSeoRegeneration = onCall(
  { region: REGION, secrets: [GITHUB_PAT] },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);
    try {
      await triggerGitHubActions(GITHUB_PAT.value());
      // Resetear debounce para que la próxima edición también dispare
      await db.collection('system').doc('seoDebounce').delete();
      return { success: true, message: 'GitHub Actions disparado correctamente.' };
    } catch (err) {
      throw new HttpsError('internal', 'Error disparando GitHub Actions: ' + err.message);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 5. createManagedUserV2 — Crear usuario admin con rol
// ══════════════════════════════════════════════════════════════════════════
exports.createManagedUserV2 = onCall(
  { region: REGION },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);

    const { email, password, nombre, rol = 'editor' } = request.data;
    if (!email || !password || !nombre) {
      throw new HttpsError('invalid-argument', 'Se requieren email, password y nombre.');
    }
    if (!['super_admin', 'editor', 'viewer'].includes(rol)) {
      throw new HttpsError('invalid-argument', 'Rol inválido.');
    }

    let userRecord;
    try {
      userRecord = await auth.createUser({ email, password, displayName: nombre });
    } catch (err) {
      throw new HttpsError('already-exists', 'Error creando usuario: ' + err.message);
    }

    await db.collection('usuarios').doc(userRecord.uid).set({
      nombre,
      email,
      rol,
      activo:    true,
      bloqueado: false,
      creadoEn:  FieldValue.serverTimestamp(),
      creadoPor: request.auth.uid,
    });

    return { success: true, uid: userRecord.uid };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 6. deleteManagedUserV2 — Eliminar usuario admin
// ══════════════════════════════════════════════════════════════════════════
exports.deleteManagedUserV2 = onCall(
  { region: REGION },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);

    const { uid } = request.data;
    if (!uid) throw new HttpsError('invalid-argument', 'Se requiere uid.');
    if (uid === request.auth.uid) {
      throw new HttpsError('failed-precondition', 'No puedes eliminarte a ti mismo.');
    }

    try {
      await auth.deleteUser(uid);
    } catch (err) {
      throw new HttpsError('not-found', 'Usuario no encontrado: ' + err.message);
    }

    await db.collection('usuarios').doc(uid).delete();
    return { success: true };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 7. updateUserRoleV2 — Cambiar el rol de un usuario admin
// ══════════════════════════════════════════════════════════════════════════
exports.updateUserRoleV2 = onCall(
  { region: REGION },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);

    const { uid, rol } = request.data || {};
    if (!uid || !rol) {
      throw new HttpsError('invalid-argument', 'Se requieren uid y rol.');
    }
    if (!['super_admin', 'editor', 'viewer'].includes(rol)) {
      throw new HttpsError('invalid-argument', 'Rol inválido.');
    }
    if (uid === request.auth.uid && rol !== 'super_admin') {
      throw new HttpsError('failed-precondition', 'No puedes quitarte tu propio rol de super_admin.');
    }

    const ref = db.collection('usuarios').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Usuario no existe en /usuarios.');
    }

    await ref.update({
      rol,
      actualizadoEn:  FieldValue.serverTimestamp(),
      actualizadoPor: request.auth.uid,
    });

    return { success: true };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 8. processNurturingEmails — Scheduled: send follow-up emails
//    Runs every 6 hours, queries solicitudes due for next nurturing email
// ══════════════════════════════════════════════════════════════════════════
exports.processNurturingEmails = onSchedule(
  { schedule: 'every 6 hours', region: REGION, secrets: [EMAIL_USER, EMAIL_PASS] },
  async () => {
    const now = Timestamp.now();

    const snap = await db.collection('solicitudes')
      .where('nurturing.completed', '==', false)
      .where('nurturing.unsubscribed', '==', false)
      .where('nurturing.nextEmailAt', '<=', now)
      .limit(50)
      .get();

    if (snap.empty) {
      console.log('[Nurturing] No hay emails pendientes.');
      return;
    }

    const transporter = createTransporter(EMAIL_USER.value(), EMAIL_PASS.value());
    let sent = 0, errors = 0;

    for (const doc of snap.docs) {
      const data = doc.data();
      const nurt = data.nurturing;
      if (!data.email) continue;

      const seqType = nurt.sequenceType || '_default';
      const sequence = getNurturingSequence(seqType);
      const step = nurt.step;

      if (step >= sequence.length) {
        await doc.ref.update({ 'nurturing.completed': true });
        continue;
      }

      const entry = sequence[step];
      const extra = data.datosExtra || {};

      try {
        const html = entry.bodyFn(data, extra);
        await transporter.sendMail({
          from:    `"${SITE_NAME}" <${EMAIL_USER.value()}>`,
          to:      data.email,
          subject: entry.subject,
          html,
        });

        const nextStep = step + 1;
        const isLast = nextStep >= sequence.length;

        const update = {
          'nurturing.step': nextStep,
          'nurturing.completed': isLast,
          'nurturing.lastSentAt': FieldValue.serverTimestamp(),
        };

        if (!isLast) {
          const nextEntry = sequence[nextStep];
          const createdAt = data.createdAt?.toDate() || new Date();
          const nextDate = new Date(createdAt.getTime() + nextEntry.dayOffset * 86400000);
          update['nurturing.nextEmailAt'] = Timestamp.fromDate(nextDate);
        }

        await doc.ref.update(update);
        sent++;
      } catch (err) {
        console.error(`[Nurturing] Error enviando a ${data.email}:`, err.message);
        errors++;
      }
    }

    console.log(`[Nurturing] Procesados: ${sent} enviados, ${errors} errores.`);
  }
);
