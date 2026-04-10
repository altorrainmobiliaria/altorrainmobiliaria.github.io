/**
 * contact-forms.js — Altorra Inmobiliaria
 * Gestión de formularios de contacto → Firestore (colección `solicitudes`).
 * Reemplaza el envío a FormSubmit.
 *
 * Formularios gestionados:
 *   #contactForm      → contacto.html        → tipo: contacto_propiedad / otro
 *   #contactPropForm  → detalle-propiedad.html → tipo: contacto_propiedad
 *   #publishForm      → publicar-propiedad.html → tipo: publicar_propiedad
 *
 * Comportamiento:
 *   - Si window.db está disponible → guarda en Firestore → redirige a gracias.html
 *   - Si window.db no está listo   → espera altorra:firebase-ready (timeout 8 s)
 *   - Si Firebase no responde      → fallback a FormSubmit (acción original del form)
 *
 * Anti-spam:
 *   - Campo honeypot oculto (name="_honey") — si tiene valor, se descarta silenciosamente
 *   - Rate-limit simple: 1 envío cada 30 s por sesión (localStorage)
 */

(function () {
  'use strict';

  const REDIRECT_URL  = 'https://altorrainmobiliaria.co/gracias.html';
  const COLLECTION    = 'solicitudes';
  const RATE_LIMIT_MS = 30 * 1000;  // 30 segundos entre envíos
  const FB_WAIT_MS    = 8000;        // tiempo máximo esperando Firebase

  // ── Helpers ───────────────────────────────────────────────────────────────
  function rateCheck() {
    try {
      const last = parseInt(localStorage.getItem('altorra:lastFormSend') || '0', 10);
      if (Date.now() - last < RATE_LIMIT_MS) return false;
      localStorage.setItem('altorra:lastFormSend', String(Date.now()));
      return true;
    } catch (_) { return true; }
  }

  function showFormError(form, msg) {
    let el = form.querySelector('.form-feedback');
    if (!el) {
      el = document.createElement('div');
      el.className = 'form-feedback';
      el.style.cssText = 'margin-top:12px;padding:12px 16px;border-radius:8px;font-weight:600;font-size:.95rem';
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.insertAdjacentElement('afterend', el);
      else form.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = '#fef2f2';
    el.style.color = '#dc2626';
    el.style.display = 'block';
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Enviando…';
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalText || 'Enviar';
      btn.disabled = false;
    }
  }

  // ── Esperar Firebase (con timeout) ────────────────────────────────────────
  function waitForFirebase() {
    return new Promise((resolve) => {
      if (window.db) return resolve(true);
      const timer = setTimeout(() => resolve(false), FB_WAIT_MS);
      window.addEventListener('altorra:firebase-ready', () => {
        clearTimeout(timer);
        resolve(!!window.db);
      }, { once: true });
    });
  }

  // ── Envío principal a Firestore ───────────────────────────────────────────
  async function submitToFirestore(payload) {
    const { collection, addDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

    await addDoc(collection(window.db, COLLECTION), {
      ...payload,
      estado:       'pendiente',
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
      emailSent:    false,
      requiereCita: false,
    });
  }

  // ── Formulario: contacto.html (#contactForm) ──────────────────────────────
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (!rateCheck()) {
        showFormError(form, 'Por favor espera unos segundos antes de enviar otro mensaje.');
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      setLoading(btn, true);

      const nombre   = (form.querySelector('[name="Nombre"]')?.value   || '').trim();
      const email    = (form.querySelector('[name="Email"]')?.value    || '').trim();
      const telefono = (form.querySelector('[name="Teléfono"]')?.value || '').trim();
      const motivo   = (form.querySelector('[name="Motivo"]')?.value   || '').trim();
      const mensaje  = (form.querySelector('[name="Mensaje"]')?.value  || '').trim();

      // Mapear motivo → tipo Firestore
      const tipoMap = {
        'Comprar':               'contacto_propiedad',
        'Arriendo':              'contacto_propiedad',
        'Por días':              'contacto_propiedad',
        'Publicar propiedad':    'publicar_propiedad',
        'Avalúos':               'solicitud_avaluo',
        'Servicios jurídicos':   'solicitud_juridica',
        'Servicios contables':   'solicitud_contable',
      };
      const tipo = tipoMap[motivo] || 'otro';

      const firebaseReady = await waitForFirebase();
      if (!firebaseReady) {
        // Fallback: enviar con FormSubmit (acción original)
        form.submit();
        return;
      }

      try {
        await submitToFirestore({
          nombre, email, telefono, tipo,
          origen: 'contacto',
          datosExtra: { mensaje, motivo },
        });
        window.location.href = REDIRECT_URL;
      } catch (err) {
        console.error('[ContactForms] Error guardando en Firestore:', err);
        setLoading(btn, false);
        showFormError(form, 'Hubo un error al enviar. Por favor intenta de nuevo.');
      }
    });
  }

  // ── Formulario: detalle-propiedad.html (#contactPropForm) ─────────────────
  // El form se genera dinámicamente en el JS de detalle, así que usamos
  // delegación de eventos en el documento.
  function initDetallePropForm() {
    document.addEventListener('submit', async (e) => {
      const form = e.target;
      if (!form || form.id !== 'contactPropForm') return;
      e.preventDefault();

      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (!rateCheck()) {
        showFormError(form, 'Por favor espera unos segundos antes de enviar.');
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      setLoading(btn, true);

      const nombre      = (form.querySelector('[name="Nombre"]')?.value       || '').trim();
      const email       = (form.querySelector('[name="Email"]')?.value        || '').trim();
      const telefono    = (form.querySelector('[name="Teléfono"]')?.value     || '').trim();
      const mensaje     = (form.querySelector('[name="Mensaje"]')?.value      || '').trim();
      const propId      = (form.querySelector('[name="propiedadId"]')?.value  || '').trim();
      const propTitulo  = (form.querySelector('[name="propiedadTitulo"]')?.value || '').trim();

      const firebaseReady = await waitForFirebase();
      if (!firebaseReady) { form.submit(); return; }

      try {
        await submitToFirestore({
          nombre, email, telefono,
          tipo:   'contacto_propiedad',
          origen: 'detalle-propiedad',
          datosExtra: { mensaje, propiedadId: propId, propiedadTitulo: propTitulo },
        });
        window.location.href = REDIRECT_URL;
      } catch (err) {
        console.error('[ContactForms] Error en detalle-propiedad:', err);
        setLoading(btn, false);
        showFormError(form, 'Hubo un error al enviar. Por favor intenta de nuevo.');
      }
    });
  }

  // ── Formulario: publicar-propiedad.html (#publishForm) ────────────────────
  function initPublishForm() {
    const form = document.getElementById('publishForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (!rateCheck()) {
        showFormError(form, 'Por favor espera unos segundos antes de enviar.');
        return;
      }

      const btn = form.querySelector('[type="submit"]');
      setLoading(btn, true);

      const nombre      = (form.querySelector('[name="Nombre"]')?.value       || '').trim();
      const email       = (form.querySelector('[name="Email"]')?.value        || '').trim();
      const telefono    = (form.querySelector('[name="Teléfono"]')?.value     || '').trim();
      const ciudad      = (form.querySelector('[name="Ciudad"]')?.value       || '').trim();
      const operacion   = (form.querySelector('[name="Operación"]')?.value    || '').trim();
      const tipoInmueble = (form.querySelector('[name="Tipo"]')?.value        || '').trim();
      const precio      = (form.querySelector('[name="Precio"]')?.value       || '').trim();
      const descripcion = (form.querySelector('[name="Descripción"]')?.value  || '').trim();

      const firebaseReady = await waitForFirebase();
      if (!firebaseReady) { form.submit(); return; }

      try {
        await submitToFirestore({
          nombre, email, telefono,
          tipo:   'publicar_propiedad',
          origen: 'publicar-propiedad',
          datosExtra: {
            ciudad, operacion, tipoInmueble,
            precioAproximado: precio ? Number(precio) : null,
            descripcion,
          },
        });
        window.location.href = REDIRECT_URL;
      } catch (err) {
        console.error('[ContactForms] Error en publicar-propiedad:', err);
        setLoading(btn, false);
        showFormError(form, 'Hubo un error al enviar. Por favor intenta de nuevo.');
      }
    });
  }

  // ── Arranque ───────────────────────────────────────────────────────────────
  function init() {
    initContactForm();
    initDetallePropForm();
    initPublishForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[ContactForms] Módulo cargado ✅');
})();
