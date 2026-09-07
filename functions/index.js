/**
 * functions/index.js — Altorra Inmobiliaria
 * Cloud Functions (Node 20, us-central1)
 *
 * FUNCIONES:
 *   onSolicitudStatusChanged → Firestore update solicitudes/{id}
 *                              Envía email al cliente cuando el estado cambia
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
 *
 * ⚠️ DEPLOY — NO despliegues este codebase ENTERO (26-ago-2026, §217):
 *   `firebase deploy --only functions` alcanza a los DOS codebases (`default` y `portal`) y
 *   CREARÍA funciones que hoy NO están desplegadas a propósito:
 *     · aquí:   processNurturingEmails, sendNewsletter — nurturing APAGADO (§192: sus plantillas
 *               enlazan al sitio retirado, y el SMTP de Gmail sigue caído con 535-5.7.8).
 *     · portal: catalogoBarrido, alertasDigest — programadas; alertasDigest espera la clave de
 *               Resend, y entre las dos consumen 2 de los 3 jobs gratuitos de Cloud Scheduler.
 *   Despliega SIEMPRE por nombre:  firebase deploy --only functions:default:<nombre>
 *   Y para RETIRAR una función, quítala del CÓDIGO **y** de producción:
 *     firebase functions:delete <nombre> --region us-central1
 *   Borrarla solo de producción la deja a un deploy de volver — le pasó a `onNewSolicitud`,
 *   que estuvo meses retirada en Firebase y viva en este archivo (§217).
 *
 * EMULADOR LOCAL:
 *   firebase emulators:start --only functions,firestore
 */

'use strict';

const { onDocumentUpdated, onDocumentWritten }
  = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule }         = require('firebase-functions/v2/scheduler');
const { defineSecret }       = require('firebase-functions/params');
const { initializeApp }      = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth }            = require('firebase-admin/auth');
const nodemailer             = require('nodemailer');
// Aleatoriedad CRIPTOGRÁFICA para la credencial inicial (§131). `Math.random()` no sirve aquí: es
// predecible, y una contraseña inicial predecible es una puerta abierta hasta que alguien la cambie.
const { randomBytes }        = require('crypto');

initializeApp();
const db   = getFirestore();
const auth = getAuth();

// ── Secrets ────────────────────────────────────────────────────────────────
const EMAIL_USER = defineSecret('EMAIL_USER');
const EMAIL_PASS = defineSecret('EMAIL_PASS');

// ── Constantes ─────────────────────────────────────────────────────────────
const REGION       = 'us-central1';
const ADMIN_EMAIL  = 'info@altorrainmobiliaria.co';
const SITE_NAME    = 'Altorra Inmobiliaria';

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

// ── Nurturing email sequences ──────────────────────────────────────────
// Each sequence: array of { dayOffset, subject, bodyFn(data, extra) }
// Step 0 = day of creation (lo envia el portal via Resend, no este codebase), steps 1+ = follow-ups

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
// 1. onSolicitudStatusChanged — Email al cliente cuando el admin actualiza estado
//
// ⛔ REEMPLAZADA (27-ago, ADR 235) por `avisoEstadoSolicitud` del codebase PORTAL, que manda por
//    Resend, tiene tipos y 13 pruebas. Esta lleva meses mandando por el Gmail roto (535-5.7.8):
//    captura el error, lo escribe en un log que nadie abre, y quien movio el estado cree que el
//    cliente fue avisado.
//
// ⚠️ SIGUE DESPLEGADA a proposito, y la retirada va EMPAREJADA con el despliegue de la nueva:
//    mientras la clave de Resend siga con su centinela ninguna de las dos envia nada, asi que
//    borrar esta hoy no arregla nada y deja un hueco si la otra tarda. Los dos pasos van juntos:
//      firebase deploy --only functions:portal:avisoEstadoSolicitud
//      firebase functions:delete onSolicitudStatusChanged
//    Hacer solo el primero deja DOS triggers sobre `solicitudes`; solo el segundo, ninguno.
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
// 2. createManagedUserV2 — Crear usuario admin con rol
// ══════════════════════════════════════════════════════════════════════════
exports.createManagedUserV2 = onCall(
  { region: REGION },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);

    const { email, nombre, rol = 'editor' } = request.data;
    if (!email || !nombre) {
      throw new HttpsError('invalid-argument', 'Se requieren email y nombre.');
    }
    if (!['super_admin', 'editor', 'viewer'].includes(rol)) {
      throw new HttpsError('invalid-argument', 'Rol inválido.');
    }

    /*
     * §131 — NADIE INVENTA LA CONTRASEÑA DE NADIE.
     *
     * Antes esta función recibía `password` desde el formulario: el administrador tecleaba la clave de
     * otra persona y se la mandaba por WhatsApp. Esa clave quedaba en un chat para siempre y la sabían
     * DOS personas — la titular de la cuenta y quien se la puso.
     *
     * Ahora se genera aquí una credencial aleatoria que **no ve nadie, nunca**: no se devuelve, no se
     * registra, no se guarda. Solo existe para que la cuenta pueda crearse. Acto seguido, quien invita
     * dispara el correo de «elige tu contraseña» y la persona escoge la suya.
     *
     * 32 bytes de `randomBytes` en base64url ≈ 256 bits de entropía: no es adivinable ni por accidente
     * ni a propósito, que es justo lo que pide OWASP ASVS 6.4.1 de una credencial inicial.
     */
    const claveEfimera = randomBytes(32).toString('base64url');

    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password: claveEfimera,
        displayName: nombre,
      });
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

    await anotar('usuario-creado', request.auth.uid, {
      objetivo: userRecord.uid, detalle: `${email} como ${rol}`,
    });
    return { success: true, uid: userRecord.uid };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 3. deleteManagedUserV2 — Eliminar usuario admin
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
    await anotar('usuario-eliminado', request.auth.uid, { objetivo: uid });
    return { success: true };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 6b. suspenderUsuarioV2 — apagar el acceso SIN borrar la cuenta (§131)
// ══════════════════════════════════════════════════════════════════════════
/*
 * Por qué hacía falta: la única salida era «Eliminar», que borra la cuenta de Auth y el documento.
 * Es irreversible, y casi nunca es lo que uno quiere. Cuando alguien se va —o se va de vacaciones, o
 * hay una duda que aclarar— lo que hace falta es cortarle el acceso HOY y poder devolvérselo mañana.
 * Obligar a elegir entre «no hacer nada» y «destruir» hace que se elija no hacer nada.
 *
 * Cómo corta de verdad: escribe `activo` en `usuarios/{uid}`, y eso dispara `claimsStaffSync`, que
 * relee el documento, pone `admin:false` y **revoca los tokens**. O sea, la sesión abierta en otro
 * dispositivo muere en el acto, no dentro de una hora. Aquí no se toca el claim a mano a propósito:
 * un solo camino hacia los permisos es lo que evita que dos sitios digan cosas distintas.
 */
exports.suspenderUsuarioV2 = onCall({ region: REGION }, async (request) => {
  await requireSuperAdmin(request.auth?.uid);

  const { uid, activo } = request.data || {};
  if (!uid || typeof activo !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Se requieren uid y activo (booleano).');
  }
  // Suspenderse a uno mismo deja el sistema sin nadie que pueda reactivar a nadie.
  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'No puedes suspenderte a ti mismo.');
  }

  const ref  = db.collection('usuarios').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Usuario no existe en /usuarios.');

  // Si se suspende al ÚLTIMO super_admin activo, nadie podría volver a entrar a administrar.
  if (!activo && snap.data().rol === 'super_admin') {
    const vivos = await db.collection('usuarios').where('rol', '==', 'super_admin').get();
    const otros = vivos.docs.filter((d) => d.id !== uid && d.data().activo !== false);
    if (!otros.length) {
      throw new HttpsError('failed-precondition',
        'Es el único super admin activo: suspenderlo dejaría el panel sin quien lo administre.');
    }
  }

  await ref.update({
    activo,
    actualizadoEn:  FieldValue.serverTimestamp(),
    actualizadoPor: request.auth.uid,
  });
  await anotar(activo ? 'usuario-reactivado' : 'usuario-suspendido', request.auth.uid, { objetivo: uid });

  return { success: true, activo };
});

// ══════════════════════════════════════════════════════════════════════════
// 4. updateUserRoleV2 — Cambiar el rol de un usuario admin
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

    const rolAnterior = snap.data().rol;
    await ref.update({
      rol,
      actualizadoEn:  FieldValue.serverTimestamp(),
      actualizadoPor: request.auth.uid,
    });
    await anotar('rol-cambiado', request.auth.uid, {
      objetivo: uid, detalle: `${rolAnterior} → ${rol}`,
    });

    return { success: true };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 5. processNurturingEmails — seguimiento comercial a leads.
//
// 🔴 EL HORARIO ERA ILEGAL, y no de una forma discutible (§172). Corría `every 6 hours`, que en UTC
//    dispara a las 00/06/12/18 — o sea, en hora de Colombia, **a la 1 de la madrugada** y también los
//    domingos. La **Ley 2300 de 2023** extiende a los mensajes comerciales las mismas reglas de la
//    cobranza: solo **lunes a viernes de 7:00 a 19:00 y sábados de 8:00 a 15:00**, y **NUNCA domingos
//    ni festivos**. Un correo comercial de madrugada no es un detalle de cortesía: es una infracción.
//    Ahora el cron vive dentro de la ventana y en la zona horaria de Bogotá, no en UTC.
//
// ⚠️ LO QUE ESTE CRON **NO** RESUELVE, y hay que resolver ANTES de desplegarla: los **festivos**.
//    Colombia tiene 18 al año y varios caen entre semana. El calendario ya existe y está probado
//    (`portal/src/lib/domain/calendario-co.ts`, `esFestivo`), pero vive en el codebase del PORTAL y
//    esta Function es del legacy: no se puede importar. **Duplicar el algoritmo aquí sería peor**
//    —dos calendarios que se separan sin avisar—, así que la salida correcta es mover el nurturing al
//    codebase del portal cuando se decida encenderlo.
//
// 🚫 SIGUE SIN DESPLEGARSE. Estado REVISADO el 2026-08-26 (§192) — de tres razones quedan dos, y
//    apareció una CUARTA que no estaba escrita:
//    ✅ (1) La contraseña de Gmail YA NO BLOQUEA: el portal manda por Resend desde §188. Si el
//       nurturing se mueve allí, hereda ese camino y no necesita el SMTP roto.
//    ⏳ (2) Los festivos siguen sin resolver AQUÍ, y la salida sigue siendo la que ya decía este
//       comentario: mover el nurturing al portal, donde `calendario-co.ts` ya existe y está probado.
//    🔴 (3) NUEVO — **las plantillas apuntan al sitio RETIRADO**. Las 8 URLs que envían
//       (`avaluo` · `contacto` · `detalle-propiedad` · `invertir` · `propiedades-comprar` ·
//       `publicar-propiedad` · `quienes-somos` · `renta-turistica`) SÍ tienen redirect —comprobado
//       una a una contra `portal/src/lib/seo/redirects.ts`, ninguna daría 404—, **pero
//       `/detalle-propiedad.html?id=X` redirige a `/comprar` y PIERDE la propiedad**: el correo dice
//       «Ver la propiedad que te interesó» y aterriza en el listado genérico. Para leads viejos no
//       tiene arreglo (esos inmuebles ya no existen); para los nuevos, el enlace correcto es
//       `/inmueble/<slug>`, que solo se puede construir desde el portal.
//    ⚖️ (4) Y encenderlo sigue siendo una **decisión de negocio**, no fontanería.
//    ⇒ Conclusión: mover el nurturing al portal resuelve (1), (2) y (3) de una vez. Portarlo tal cual
//      aquí no resuelve ninguna, y **reescribir las plantillas en el legacy sería trabajo tirado**.
// ══════════════════════════════════════════════════════════════════════════
// ⛔ NO DESPLEGADA (a propósito) — ver la advertencia de DEPLOY en la cabecera (§217).
exports.processNurturingEmails = onSchedule(
  {
    // 9:00 y 15:00, de lunes a viernes, hora de Colombia: dentro de la ventana con margen sobrado.
    schedule: '0 9,15 * * 1-5',
    timeZone: 'America/Bogota',
    region: REGION,
    secrets: [EMAIL_USER, EMAIL_PASS],
  },
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

// ══════════════════════════════════════════════════════════════════════════
// 6. sendNewsletter — Send newsletter to all active subscribers
//    Callable by super_admin from admin panel
// ══════════════════════════════════════════════════════════════════════════
// ⛔ NO DESPLEGADA (a propósito) — ver la advertencia de DEPLOY en la cabecera (§217).
exports.sendNewsletter = onCall(
  { region: REGION, secrets: [EMAIL_USER, EMAIL_PASS] },
  async (request) => {
    await requireSuperAdmin(request.auth?.uid);

    const { subject, body, template } = request.data || {};
    if (!subject) throw new HttpsError('invalid-argument', 'Se requiere subject.');

    // Get all active subscribers
    const snap = await db.collection('newsletter')
      .where('activo', '==', true)
      .limit(200)
      .get();

    if (snap.empty) return { success: true, sent: 0, message: 'No hay suscriptores activos.' };

    // Build email HTML from template or custom body
    const templates = {
      nuevas_propiedades: (name) => wrapEmail(`
        <p>Hola${name ? ' <strong>' + name + '</strong>' : ''},</p>
        <p>Tenemos <strong>nuevas propiedades</strong> disponibles que podrían interesarte.</p>
        ${body || '<p>Visita nuestro catálogo para ver las últimas adiciones.</p>'}
        ${cta('Ver propiedades nuevas', SITE_URL + '/propiedades-comprar.html')}
        <p style="color:#9ca3af;font-size:.75rem;text-align:center">
          <a href="${SITE_URL}" style="color:#9ca3af">Cancelar suscripción</a>
        </p>`),
      mercado: (name) => wrapEmail(`
        <p>Hola${name ? ' <strong>' + name + '</strong>' : ''},</p>
        <h2 style="color:#111;font-size:1.1rem;margin:16px 0 8px">Análisis de mercado</h2>
        ${body || '<p>Te compartimos las últimas tendencias del mercado inmobiliario en Cartagena.</p>'}
        ${cta('Leer más en el blog', SITE_URL + '/blog.html')}
        <p style="color:#9ca3af;font-size:.75rem;text-align:center">
          <a href="${SITE_URL}" style="color:#9ca3af">Cancelar suscripción</a>
        </p>`),
      personalizado: () => wrapEmail(`
        ${body || '<p>Contenido del newsletter.</p>'}
        <p style="color:#9ca3af;font-size:.75rem;text-align:center">
          <a href="${SITE_URL}" style="color:#9ca3af">Cancelar suscripción</a>
        </p>`),
    };

    const tmpl = templates[template] || templates.personalizado;
    const transporter = createTransporter(EMAIL_USER.value(), EMAIL_PASS.value());
    let sent = 0, errors = 0;

    for (const doc of snap.docs) {
      const sub = doc.data();
      try {
        await transporter.sendMail({
          from:    `"${SITE_NAME}" <${EMAIL_USER.value()}>`,
          to:      sub.email,
          subject: subject,
          html:    tmpl(sub.nombre || ''),
        });
        sent++;
      } catch (err) {
        console.error(`[Newsletter] Error enviando a ${sub.email}:`, err.message);
        errors++;
      }
    }

    // Log the send
    await db.collection('newsletter_sends').add({
      subject,
      template: template || 'personalizado',
      totalSubscribers: snap.size,
      sent,
      errors,
      sentBy: request.auth.uid,
      sentAt: FieldValue.serverTimestamp(),
    });

    return { success: true, sent, errors, total: snap.size };
  }
);

// ══════════════════════════════════════════════════════════════════════════
// 7. CLAIMS DE STAFF — el documento manda, el token es su espejo
//
// EL PROBLEMA QUE RESUELVE (ADR §99): las reglas del PORTAL definen su gate de staff como
// `request.auth.token.admin == true` —un custom claim— tanto en Firestore
// (`portal/firebase/firestore.rules`) como en Storage (`portal/firebase/storage.rules`, que guarda
// cédulas y contratos escaneados). Y ese claim NO LO PONÍA NADIE: `setCustomUserClaims` no aparecía
// en todo el proyecto. `isStaff()` era insatisfacible, así que el día del cutover el back-office
// habría quedado inaccesible para todos, el dueño incluido.
//
// POR QUÉ UN CLAIM Y NO UN `get()` EN LAS REGLAS: un `get()` dentro de una regla se ejecuta —y se
// FACTURA— aunque la petición acabe denegada. Y en este portal `request.auth != null` no es un estado
// raro: `/ingresar` deja entrar a cualquiera con un Gmail. Un bucle desde la consola del navegador
// vaciaría las 50.000 lecturas diarias del free-tier sin ser staff. Un claim cuesta CERO lecturas.
// Además las reglas de Storage no pueden leer Firestore, así que el claim es el único mecanismo que
// arregla las dos mitades a la vez.
//
// POR QUÉ VIVE AQUÍ, en el codebase del LEGACY, y no en el del portal: la fuente de verdad es la
// colección `usuarios`, que el dueño ya administra desde `admin.html`, y este archivo ya tiene todo
// lo necesario (`onDocumentWritten`, `getAuth`, `requireSuperAdmin`). Así esto se despliega SOLO, sin
// tocar una línea de reglas y sin esperar al cutover: el claim empieza a existir hoy y está verificado
// semanas antes de que alguien lo necesite.
// ══════════════════════════════════════════════════════════════════════════

/** Roles del legacy que dan acceso al back-office del portal. */
const ROLES_STAFF = ['super_admin', 'editor', 'viewer'];

/**
 * Documento de `usuarios` → claims que le tocan.
 *
 * `activo === true` ESTRICTO, no `!= false`: es lista blanca, no lista negra. Un `"false"` tecleado
 * como TEXTO en la consola de Firebase no debe conceder acceso, y un documento al que le falte el
 * campo tampoco — `js/admin-auth.js` ya rechaza esos, así que toda cuenta que hoy funciona lo trae.
 *
 * El `rol` viaja en el claim desde el primer despliegue aunque hoy nadie lo mire: sin él, afinar
 * permisos por rol más adelante obligaría a re-emitir el token de todo el mundo.
 */
function claimDesdeDoc(d) {
  const vivo = !!d && d.activo === true && d.bloqueado !== true;
  const staff = vivo && ROLES_STAFF.includes(d.rol);
  return { admin: staff, rol: staff ? d.rol : null };
}

/**
 * Deja el claim de un uid igual a lo que dice su documento. Idempotente y convergente.
 *
 * RELEE EL DOCUMENTO en vez de usar el payload del evento: los triggers son at-least-once y sin orden
 * garantizado, así que un reintento viejo que llegue DESPUÉS de una revocación dejaría el claim pegado
 * en «concedido». Releyendo, cualquier orden de llegada converge al estado real.
 */
async function sincronizarClaim(uid) {
  const snap = await db.collection('usuarios').doc(uid).get();
  const objetivo = claimDesdeDoc(snap.exists ? snap.data() : undefined);

  let usuario;
  try {
    usuario = await auth.getUser(uid);
  } catch {
    // Documento sin cuenta de Auth: casi siempre un uid mal copiado a mano en la consola. Se reporta
    // y se sigue; no es un fallo que deba reintentarse eternamente.
    console.error(`[claims] usuarios/${uid} no tiene cuenta en Auth (¿uid mal copiado?)`);
    return false;
  }

  // La revocación va ANTES del corte por idempotencia, y a propósito: revocar es idempotente (solo
  // adelanta `tokensValidAfterTime`). Si en una pasada anterior el claim se escribió pero la
  // revocación falló, el reintento saldría por el `return false` de abajo y no revocaría NUNCA.
  if (!objetivo.admin) await auth.revokeRefreshTokens(uid);

  const actual = usuario.customClaims || {};
  if (actual.admin === objetivo.admin && (actual.rol ?? null) === objetivo.rol) return false;

  // Se preservan los claims ajenos: este proceso es dueño de `admin` y `rol`, de nada más.
  await auth.setCustomUserClaims(uid, { ...actual, ...objetivo });
  console.info(`[claims] ${uid} → admin=${objetivo.admin} rol=${objetivo.rol}`);
  return true;
}

/**
 * Cualquier cambio en `usuarios/{uid}` re-sincroniza su claim. Alta, cambio de rol, desactivación y
 * borrado entran todos por aquí.
 *
 * `retry: true` es SEGURO porque `sincronizarClaim` es idempotente y relee el estado real. Y no hay
 * bucle posible: esta función escribe en Auth, jamás en `usuarios`.
 */
exports.claimsStaffSync = onDocumentWritten(
  { document: 'usuarios/{uid}', region: REGION, retry: true },
  async (event) => {
    await sincronizarClaim(event.params.uid);
  },
);

/**
 * Backfill y reconciliación a demanda — la palanca del día cero y la cura de cualquier deriva.
 *
 * La guarda es `requireSuperAdmin`, que lee el DOCUMENTO y no el claim. Por eso funciona cuando
 * todavía no hay ni un claim puesto: no hace falta service account, ni consola, ni descargar claves.
 *
 * Pagina de verdad. Un `limit()` pelado dejaría al staff a partir del tope sin sincronizar y —peor—
 * el barrido de huérfanos de abajo lo leería como «no está en la lista» y le revocaría el acceso.
 */
exports.sincronizarClaimsV2 = onCall({ region: REGION }, async (request) => {
  await requireSuperAdmin(request.auth?.uid);

  const vivos = new Set();
  let ultimo = null;
  let censoCompleto = false;
  const PAGINA = 200;

  for (;;) {
    let q = db.collection('usuarios').orderBy('__name__').limit(PAGINA);
    if (ultimo) q = q.startAfter(ultimo);
    const page = await q.get();
    for (const d of page.docs) {
      vivos.add(d.id);
      await sincronizarClaim(d.id);
    }
    if (page.size < PAGINA) {
      censoCompleto = true;
      break;
    }
    ultimo = page.docs[page.size - 1];
  }

  // HUÉRFANOS: alguien con el claim puesto y sin documento (se borró el usuario sin pasar por aquí).
  // ⚠️ FUSIBLE: solo se barre si el censo salió COMPLETO y con al menos un vivo. Un censo parcial
  // —porque una página falló— jamás puede interpretarse como «revócaselo a todos».
  let huerfanos = 0;
  if (censoCompleto && vivos.size > 0) {
    let token;
    do {
      // `listUsers(1000)` a secas MIENTE en silencio por encima de 1000 cuentas: hay que paginar.
      const page = await auth.listUsers(1000, token);
      for (const u of page.users) {
        if (u.customClaims?.admin === true && !vivos.has(u.uid)) {
          await auth.setCustomUserClaims(u.uid, { ...u.customClaims, admin: false, rol: null });
          await auth.revokeRefreshTokens(u.uid);
          huerfanos++;
        }
      }
      token = page.pageToken;
    } while (token);
  }

  console.info(`[claims] backfill: ${vivos.size} sincronizados · ${huerfanos} huérfanos revocados`);
  return { ok: true, sincronizados: vivos.size, huerfanos, censoCompleto };
});


// ══════════════════════════════════════════════════════════════════════════
// 8. registrarEvento — la BITÁCORA de acceso y de cambios (§130)
// ══════════════════════════════════════════════════════════════════════════
/*
 * `auditLog` llevaba desde siempre declarada en las Security Rules —con permisos, con la regla de
 * inmutabilidad y todo— y NADIE escribía en ella. Una bitácora declarada y vacía es peor que no
 * tenerla: el día que pase algo, quien la abra creerá que hubo registro.
 *
 * Por qué la escribe el SERVIDOR y no el navegador:
 *   · La regla anterior era `create: if esEditorOMas()`, o sea que la redactaba el propio vigilado.
 *     Podía inventarse entradas, o simplemente no escribir la que le incomodara.
 *   · Aquí el uid, el correo y el rol NO vienen del cuerpo de la llamada: se leen del token que ya
 *     verificó Firebase, y del documento de `usuarios`. El cliente solo puede decir QUÉ hizo, nunca
 *     QUIÉN es.
 *   · La IP la ve esta Function; el navegador no puede mentir sobre ella.
 *
 * ⚠️ Lo que esta bitácora NO ve, dicho aquí para que nadie lo descubra tarde: los intentos FALLIDOS.
 * Un login que falla nunca llega a nuestro backend, así que registrarlos exige las *blocking
 * functions* del proveedor (`beforeUserSignedIn`), que son de Identity Platform.
 */
const ACCIONES_VALIDAS = new Set([
  'acceso', 'salida', 'password-cambiada', 'usuario-creado', 'usuario-eliminado',
  'rol-cambiado', 'usuario-suspendido', 'usuario-reactivado', 'claims-sincronizados',
  'sesiones-cerradas', 'segundo-factor-retirado',
  // La BÓVEDA (§143). Abrir un documento con datos de un tercero es un ACCESO, y una bóveda sin
  // bitácora de accesos es un archivador con la llave puesta. `objetivo` lleva el id del documento.
  'documento-abierto', 'documento-retirado',
  // El PERFIL DE INQUILINO (§153). Aquí los papeles son de alguien de FUERA del equipo —cédula,
  // nómina— y quien los abre es quien los revisa. Mismo criterio que la bóveda: si algún día
  // alguien pregunta quién vio la cédula de un aspirante, o hay respuesta o no la hay.
  'perfil-abierto', 'perfil-dictaminado',
  // ALTA DE CUENTA (§154). No es telemetría: es la PRUEBA de la autorización de habeas data. La
  // Ley 1581 (art. 9) y el Decreto 1377 (art. 5) piden que el responsable CONSERVE prueba de que
  // el titular autorizó, y esta entrada la trae completa y escrita por el servidor: uid verificado,
  // correo, IP, navegador y fecha. Una casilla marcada en un formulario, sin esto, no prueba nada.
  'cuenta-creada',
]);

exports.registrarEvento = onCall({ region: REGION }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Se requiere sesión.');

  const accion = String(request.data?.accion || '').slice(0, 40);
  if (!ACCIONES_VALIDAS.has(accion)) {
    throw new HttpsError('invalid-argument', `Acción no reconocida: ${accion}`);
  }

  // El perfil se relee: el rol que importa es el que hay AHORA en la base, no el que el token
  // arrastre desde hace una hora (los claims viajan dentro del token y se renuevan cada 60 min).
  let perfil = {};
  try {
    const snap = await db.collection('usuarios').doc(uid).get();
    if (snap.exists) perfil = snap.data();
  } catch (e) {
    console.warn('[auditLog] no se pudo leer el perfil de', uid, e.message);
  }

  // `rawRequest` es el Request de Express que hay debajo del callable. Detrás de un balanceador la
  // IP del cliente va en `x-forwarded-for`, y es una LISTA: la primera es la del cliente, las demás
  // son los saltos. Quedarse con la última daría siempre la del proxy de Google.
  const cabeceras = request.rawRequest?.headers || {};
  const reenviada = String(cabeceras['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = reenviada || request.rawRequest?.ip || null;

  const entrada = {
    accion,
    uid,
    email:      request.auth.token?.email || perfil.email || null,
    rol:        perfil.rol || null,
    origen:     String(request.data?.origen || 'desconocido').slice(0, 40),
    // `detalle` es lo ÚNICO que viene del cliente sin verificar. Se guarda como texto y acotado,
    // para que no pueda usarse ni para inflar el documento ni para colar estructuras.
    detalle:    request.data?.detalle ? String(request.data.detalle).slice(0, 300) : null,
    objetivo:   request.data?.objetivo ? String(request.data.objetivo).slice(0, 128) : null,
    ip,
    userAgent:  String(cabeceras['user-agent'] || '').slice(0, 200) || null,
    // Segundo factor: hoy siempre `null` porque no hay MFA. Cuando lo haya, el token traerá
    // `firebase.sign_in_second_factor` y esta columna dirá, por cada entrada, si se pasó o no.
    segundoFactor: request.auth.token?.firebase?.sign_in_second_factor || null,
    creadoEn:   FieldValue.serverTimestamp(),
  };

  await db.collection('auditLog').add(entrada);
  return { ok: true };
});

// ══════════════════════════════════════════════════════════════════════════
// 9. cerrarMisSesiones — la única forma real de cerrar sesión en OTRO dispositivo
// ══════════════════════════════════════════════════════════════════════════
/*
 * QUÉ RESUELVE. Hasta hoy, si a alguien le robaban el computador con el panel abierto, no había
 * nada que hacer: cerrar sesión en un navegador no cierra los demás. La sesión de Firebase se
 * sostiene con un *refresh token* que vive en cada dispositivo y se renueva solo; el navegador no
 * puede tocar los de los otros. El servidor sí — `revokeRefreshTokens` los invalida TODOS.
 *
 * POR QUÉ NO ACEPTA UN `uid`. A propósito: se revoca el del token verificado de quien llama, y
 * punto. Si aceptara un uid, cualquiera con sesión podría echar a otro del sistema, y eso es una
 * negación de servicio con nombre de función de seguridad. Para el caso legítimo —el dueño echando
 * a alguien que ya no trabaja aquí— ya existe `suspenderUsuarioV2`, que además deja constancia.
 *
 * ⚠️ LÍMITE HONESTO, y hay que decirlo: revocar el refresh token NO mata el token de acceso que ya
 * esté en circulación. Ese caduca solo, en menos de una hora. O sea que cerrar las sesiones corta el
 * acceso «en cuanto expire lo que ya tenía», no «en este mismo segundo». Las Rules pueden hacerlo
 * inmediato si comprueban `auth.token.auth_time`, y eso queda anotado como trabajo futuro en vez de
 * fingir que este botón hace más de lo que hace.
 */
exports.cerrarMisSesiones = onCall({ region: REGION }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Se requiere sesión.');

  await getAuth().revokeRefreshTokens(uid);
  await anotar('sesiones-cerradas', uid, { objetivo: uid });

  return { ok: true };
});

// ══════════════════════════════════════════════════════════════════════════
// 10. retirarSegundoFactorDe — el rescate cuando alguien pierde el teléfono
// ══════════════════════════════════════════════════════════════════════════
/*
 * POR QUÉ EXISTE. Un segundo factor bien hecho no tiene puerta trasera: quien pierde el teléfono no
 * entra, y eso es exactamente lo que lo hace valer. Pero un equipo sin ninguna forma de rescate
 * termina no activándolo nunca — o peor, activándolo y quedándose sin panel. Firebase no emite
 * códigos de respaldo para TOTP (no existen en su API), así que el rescate tiene que ser una persona.
 *
 * QUIÉN PUEDE. Solo un super_admin, y NUNCA sobre sí mismo: si pudiera quitarse el suyo, bastaría
 * con el computador desatendido de un dueño para desactivar la protección de la cuenta más
 * poderosa del sistema. El dueño que se quede fuera de su propia cuenta se rescata desde la consola
 * de Google Cloud, con una credencial distinta — que es justo el aislamiento que se busca.
 *
 * Queda ESCRITO en la bitácora, con quién lo hizo y a quién. Un rescate silencioso es
 * indistinguible de un abuso.
 */
exports.retirarSegundoFactorDe = onCall({ region: REGION }, async (request) => {
  await requireSuperAdmin(request.auth?.uid);

  const { uid } = request.data || {};
  if (!uid || typeof uid !== 'string') {
    throw new HttpsError('invalid-argument', 'Se requiere el uid de la persona.');
  }
  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition',
      'No puedes retirarte tu propio segundo factor desde aquí: hazlo en «Mi seguridad», que pide tu contraseña.');
  }

  const usuario = await getAuth().getUser(uid).catch(() => null);
  if (!usuario) throw new HttpsError('not-found', 'Esa cuenta no existe.');

  const inscritos = usuario.multiFactor?.enrolledFactors || [];
  if (!inscritos.length) {
    throw new HttpsError('failed-precondition', 'Esa cuenta no tiene segundo factor activo.');
  }

  // Se vacía la lista entera: el caso real es «perdí el teléfono», no «quiero quitar uno de tres».
  await getAuth().updateUser(uid, { multiFactor: { enrolledFactors: [] } });
  // Y se le cierran las sesiones: si alguien pidió este rescate porque le robaron el dispositivo,
  // dejarle las sesiones vivas al ladrón vaciaría de sentido el rescate.
  await getAuth().revokeRefreshTokens(uid);
  await anotar('segundo-factor-retirado', request.auth.uid, {
    objetivo: uid,
    detalle: `retirados ${inscritos.length} factor(es)`,
  });

  return { ok: true, retirados: inscritos.length };
});

/** Uso interno: escribe en la bitácora sin pasar por el callable (para las Functions de usuarios). */
async function anotar(accion, actorUid, campos = {}) {
  try {
    await db.collection('auditLog').add({
      accion, uid: actorUid, origen: 'servidor',
      ...campos,
      creadoEn: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    // Nunca tumbar la operación por no poder anotarla.
    console.error('[auditLog] fallo al anotar', accion, e.message);
  }
}
