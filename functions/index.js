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
const { defineSecret }       = require('firebase-functions/params');
const { initializeApp }      = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
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

// ══════════════════════════════════════════════════════════════════════════
// 1. onNewSolicitud — Email al admin cuando llega un lead nuevo
// ══════════════════════════════════════════════════════════════════════════
exports.onNewSolicitud = onDocumentCreated(
  { document: 'solicitudes/{solicitudId}', region: REGION, secrets: [EMAIL_USER, EMAIL_PASS] },
  async (event) => {
    const data = event.data.data();

    // Idempotencia: no enviar si ya se envió
    if (data.emailSent) return;

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
          <div style="margin-top:20px;padding:12px;background:#fafafa;border-radius:6px;font-size:.85rem;color:#6b7280">
            ID del lead: ${event.params.solicitudId}
          </div>
        </div>
      </div>`;

    try {
      const transporter = createTransporter(EMAIL_USER.value(), EMAIL_PASS.value());
      await transporter.sendMail({
        from:    `"${SITE_NAME}" <${EMAIL_USER.value()}>`,
        to:      ADMIN_EMAIL,
        subject: `[Lead] ${tipoLabel} — ${data.nombre || 'Sin nombre'}`,
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
