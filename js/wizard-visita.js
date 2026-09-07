/**
 * wizard-visita.js — Modal wizard 3 pasos "Agenda tu visita"
 * Altorra Inmobiliaria
 *
 * API: window.AltorraWizard.open({ propiedadId, propiedadTitulo })
 */
(function () {
  'use strict';

  var COLLECTION = 'solicitudes';
  var REDIRECT = 'https://altorrainmobiliaria.co/gracias.html';

  /* ─── Country codes ─────────────────────────────────────── */
  var COUNTRIES = [
    { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
    { code: '+1',   flag: '🇺🇸', name: 'Estados Unidos' },
    { code: '+34',  flag: '🇪🇸', name: 'España' },
    { code: '+52',  flag: '🇲🇽', name: 'México' },
    { code: '+507', flag: '🇵🇦', name: 'Panamá' },
    { code: '+51',  flag: '🇵🇪', name: 'Perú' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
    { code: '+56',  flag: '🇨🇱', name: 'Chile' },
    { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  ];

  /* ─── Time slots ────────────────────────────────────────── */
  var SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  var modal = null;
  var currentStep = 1;
  var formData = {};
  var propInfo = {};

  /* ─── Inject CSS ────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('wizard-visita-css')) return;
    var s = document.createElement('style');
    s.id = 'wizard-visita-css';
    s.textContent = [
      '.wz-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s ease}',
      '.wz-overlay.visible{opacity:1}',
      '.wz-modal{background:#fff;border-radius:18px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.18);padding:28px 24px;position:relative;transform:translateY(20px);transition:transform .25s ease}',
      '.wz-overlay.visible .wz-modal{transform:translateY(0)}',
      '.wz-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--muted,#6b7280);line-height:1}',
      '.wz-close:hover{color:var(--text,#111827)}',
      '.wz-steps{display:flex;gap:8px;margin-bottom:24px}',
      '.wz-step-dot{flex:1;height:4px;border-radius:4px;background:#e5e7eb;transition:background .2s}',
      '.wz-step-dot.active{background:var(--gold,#d4af37)}',
      '.wz-step-dot.done{background:var(--gold,#d4af37);opacity:.5}',
      '.wz-title{font-size:1.15rem;font-weight:800;margin:0 0 4px;color:var(--text,#111827)}',
      '.wz-subtitle{font-size:.85rem;color:var(--muted,#6b7280);margin:0 0 20px}',
      '.wz-label{display:block;font-size:.82rem;font-weight:600;margin:0 0 5px;color:var(--text,#111827)}',
      '.wz-input{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:10px;font-size:.92rem;font-family:inherit;outline:none;transition:border .15s}',
      '.wz-input:focus{border-color:var(--gold,#d4af37);box-shadow:0 0 0 3px rgba(212,175,55,.12)}',
      '.wz-row{display:flex;gap:10px;margin-bottom:14px}',
      '.wz-row>*{flex:1}',
      '.wz-field{margin-bottom:14px}',
      '.wz-phone-row{display:flex;gap:8px}',
      '.wz-country-select{width:110px;padding:10px 8px;border:1px solid #d1d5db;border-radius:10px;font-size:.88rem;font-family:inherit;background:#fff;cursor:pointer}',
      '.wz-phone-input{flex:1}',
      '.wz-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}',
      '@media(max-width:480px){.wz-slots{grid-template-columns:repeat(2,1fr)}}',
      '.wz-slot{padding:10px 0;border:1px solid #e5e7eb;border-radius:10px;font-size:.82rem;font-weight:600;cursor:pointer;text-align:center;transition:all .15s;background:#fff}',
      '.wz-slot:hover{border-color:var(--gold,#d4af37);background:rgba(212,175,55,.06)}',
      '.wz-slot.selected{border-color:var(--gold,#d4af37);background:var(--gold,#d4af37);color:#000}',
      '.wz-actions{display:flex;gap:10px;margin-top:20px}',
      '.wz-btn{flex:1;padding:12px 0;border-radius:12px;font-size:.92rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;font-family:inherit}',
      '.wz-btn-back{background:#f3f4f6;color:var(--text,#111827)}',
      '.wz-btn-back:hover{background:#e5e7eb}',
      '.wz-btn-next{background:linear-gradient(135deg,var(--gold,#d4af37),var(--accent,#ffb400));color:#000}',
      '.wz-btn-next:hover{filter:brightness(1.06)}',
      '.wz-btn-next:disabled{opacity:.5;cursor:not-allowed}',
      '.wz-summary{background:#fafafa;border-radius:12px;padding:16px;margin-bottom:16px}',
      '.wz-summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:.85rem}',
      '.wz-summary-row span:first-child{color:var(--muted,#6b7280)}',
      '.wz-summary-row span:last-child{font-weight:700;color:var(--text,#111827)}',
      '.wz-error{color:#dc2626;font-size:.8rem;margin-top:4px;display:none}',
      '.wz-prop-badge{background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:10px;padding:10px 14px;margin-bottom:18px;font-size:.85rem;font-weight:600;color:var(--text,#111827)}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ─── Escape HTML ───────────────────────────────────────── */
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  /* ─── Build modal HTML ──────────────────────────────────── */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay';
    overlay.id = 'wizardVisitaOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Agendar visita');

    overlay.innerHTML = '<div class="wz-modal">'
      + '<button class="wz-close" aria-label="Cerrar">&times;</button>'
      + '<div class="wz-steps"><div class="wz-step-dot"></div><div class="wz-step-dot"></div><div class="wz-step-dot"></div></div>'
      + '<div id="wzBody"></div>'
      + '</div>';

    overlay.querySelector('.wz-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  /* ─── Step renderers ────────────────────────────────────── */
  function renderStep1() {
    var countryOpts = COUNTRIES.map(function (c) {
      return '<option value="' + c.code + '"' + (c.code === '+57' ? ' selected' : '') + '>'
        + c.flag + ' ' + c.code + '</option>';
    }).join('');

    return '<div class="wz-prop-badge">📍 ' + esc(propInfo.propiedadTitulo || 'Propiedad') + '</div>'
      + '<h3 class="wz-title">Tus datos de contacto</h3>'
      + '<p class="wz-subtitle">Paso 1 de 3 — Te contactaremos para confirmar</p>'
      + '<div class="wz-field"><label class="wz-label" for="wzNombre">Nombre completo *</label>'
      + '<input class="wz-input" id="wzNombre" type="text" placeholder="Tu nombre" value="' + esc(formData.nombre || '') + '" required/>'
      + '<div class="wz-error" id="wzNombreErr">Ingresa tu nombre</div></div>'
      + '<div class="wz-field"><label class="wz-label" for="wzEmail">Email *</label>'
      + '<input class="wz-input" id="wzEmail" type="email" placeholder="tu@email.com" value="' + esc(formData.email || '') + '" required/>'
      + '<div class="wz-error" id="wzEmailErr">Ingresa un email válido</div></div>'
      + '<div class="wz-field"><label class="wz-label">Teléfono *</label>'
      + '<div class="wz-phone-row">'
      + '<select class="wz-country-select" id="wzCountry">' + countryOpts + '</select>'
      + '<input class="wz-input wz-phone-input" id="wzTel" type="tel" placeholder="300 123 4567" value="' + esc(formData.telefono || '') + '" required/>'
      + '</div>'
      + '<div class="wz-error" id="wzTelErr">Ingresa tu teléfono</div></div>'
      + '<div class="wz-actions">'
      + '<button class="wz-btn wz-btn-next" id="wzNext1">Siguiente →</button>'
      + '</div>';
  }

  function renderStep2() {
    var today = new Date();
    var minDate = today.toISOString().split('T')[0];
    var max = new Date(today); max.setDate(max.getDate() + 30);
    var maxDate = max.toISOString().split('T')[0];

    var slotsHtml = SLOTS.map(function (s) {
      var sel = formData.hora === s ? ' selected' : '';
      return '<button type="button" class="wz-slot' + sel + '" data-slot="' + s + '">' + s + '</button>';
    }).join('');

    return '<h3 class="wz-title">Elige fecha y hora</h3>'
      + '<p class="wz-subtitle">Paso 2 de 3 — Selecciona tu disponibilidad</p>'
      + '<div class="wz-field"><label class="wz-label" for="wzFecha">Fecha de visita *</label>'
      + '<input class="wz-input" id="wzFecha" type="date" min="' + minDate + '" max="' + maxDate + '" value="' + (formData.fecha || '') + '" required/>'
      + '<div class="wz-error" id="wzFechaErr">Selecciona una fecha</div></div>'
      + '<div class="wz-field"><label class="wz-label">Hora preferida *</label>'
      + '<div class="wz-slots" id="wzSlots">' + slotsHtml + '</div>'
      + '<div class="wz-error" id="wzHoraErr">Selecciona un horario</div></div>'
      + '<div class="wz-field"><label class="wz-label" for="wzNotas">Notas adicionales (opcional)</label>'
      + '<textarea class="wz-input" id="wzNotas" rows="2" placeholder="Algo que debamos saber…">' + esc(formData.notas || '') + '</textarea></div>'
      + '<div class="wz-actions">'
      + '<button class="wz-btn wz-btn-back" id="wzBack2">← Atrás</button>'
      + '<button class="wz-btn wz-btn-next" id="wzNext2">Siguiente →</button>'
      + '</div>';
  }

  function renderStep3() {
    var fullPhone = (formData.countryCode || '+57') + ' ' + (formData.telefono || '');
    return '<h3 class="wz-title">Confirma tu visita</h3>'
      + '<p class="wz-subtitle">Paso 3 de 3 — Revisa los datos antes de enviar</p>'
      + '<div class="wz-summary">'
      + '<div class="wz-summary-row"><span>Propiedad</span><span>' + esc(propInfo.propiedadTitulo || '—') + '</span></div>'
      + '<div class="wz-summary-row"><span>Nombre</span><span>' + esc(formData.nombre) + '</span></div>'
      + '<div class="wz-summary-row"><span>Email</span><span>' + esc(formData.email) + '</span></div>'
      + '<div class="wz-summary-row"><span>Teléfono</span><span>' + esc(fullPhone) + '</span></div>'
      + '<div class="wz-summary-row"><span>Fecha</span><span>' + esc(formData.fecha) + '</span></div>'
      + '<div class="wz-summary-row"><span>Hora</span><span>' + esc(formData.hora) + '</span></div>'
      + (formData.notas ? '<div class="wz-summary-row"><span>Notas</span><span>' + esc(formData.notas) + '</span></div>' : '')
      + '</div>'
      + '<div class="wz-actions">'
      + '<button class="wz-btn wz-btn-back" id="wzBack3">← Atrás</button>'
      + '<button class="wz-btn wz-btn-next" id="wzSubmit">Confirmar visita ✓</button>'
      + '</div>';
  }

  /* ─── Update dots ───────────────────────────────────────── */
  function updateDots() {
    var dots = modal.querySelectorAll('.wz-step-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.remove('active', 'done');
      if (i + 1 === currentStep) dots[i].classList.add('active');
      else if (i + 1 < currentStep) dots[i].classList.add('done');
    }
  }

  /* ─── Navigate ──────────────────────────────────────────── */
  function goTo(step) {
    currentStep = step;
    var body = modal.querySelector('#wzBody');
    if (step === 1) body.innerHTML = renderStep1();
    else if (step === 2) body.innerHTML = renderStep2();
    else if (step === 3) body.innerHTML = renderStep3();
    updateDots();
    wireEvents();
  }

  /* ─── Validation ────────────────────────────────────────── */
  function showErr(id) { var el = document.getElementById(id); if (el) el.style.display = 'block'; }
  function hideErr(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }

  function validateStep1() {
    var ok = true;
    var nombre = (document.getElementById('wzNombre')?.value || '').trim();
    var email = (document.getElementById('wzEmail')?.value || '').trim();
    var tel = (document.getElementById('wzTel')?.value || '').trim();

    hideErr('wzNombreErr'); hideErr('wzEmailErr'); hideErr('wzTelErr');

    if (!nombre) { showErr('wzNombreErr'); ok = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('wzEmailErr'); ok = false; }
    if (!tel || tel.length < 7) { showErr('wzTelErr'); ok = false; }

    if (ok) {
      formData.nombre = nombre;
      formData.email = email;
      formData.telefono = tel;
      formData.countryCode = document.getElementById('wzCountry')?.value || '+57';
    }
    return ok;
  }

  function validateStep2() {
    var ok = true;
    var fecha = (document.getElementById('wzFecha')?.value || '').trim();
    var notas = (document.getElementById('wzNotas')?.value || '').trim();

    hideErr('wzFechaErr'); hideErr('wzHoraErr');

    if (!fecha) { showErr('wzFechaErr'); ok = false; }
    if (!formData.hora) { showErr('wzHoraErr'); ok = false; }

    if (ok) {
      formData.fecha = fecha;
      formData.notas = notas;
    }
    return ok;
  }

  /* ─── Wire events per step ──────────────────────────────── */
  function wireEvents() {
    var next1 = document.getElementById('wzNext1');
    if (next1) next1.addEventListener('click', function () { if (validateStep1()) goTo(2); });

    var back2 = document.getElementById('wzBack2');
    if (back2) back2.addEventListener('click', function () { goTo(1); });

    var next2 = document.getElementById('wzNext2');
    if (next2) next2.addEventListener('click', function () { if (validateStep2()) goTo(3); });

    var back3 = document.getElementById('wzBack3');
    if (back3) back3.addEventListener('click', function () { goTo(2); });

    var submit = document.getElementById('wzSubmit');
    if (submit) submit.addEventListener('click', handleSubmit);

    var slotsContainer = document.getElementById('wzSlots');
    if (slotsContainer) {
      slotsContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.wz-slot');
        if (!btn) return;
        slotsContainer.querySelectorAll('.wz-slot').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        formData.hora = btn.dataset.slot;
        hideErr('wzHoraErr');
      });
    }
  }

  /* ─── Submit to Firestore ───────────────────────────────── */
  async function handleSubmit() {
    var btn = document.getElementById('wzSubmit');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    var fullPhone = (formData.countryCode || '+57') + ' ' + formData.telefono;

    try {
      if (window.db) {
        var mod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        await mod.addDoc(mod.collection(window.db, COLLECTION), {
          nombre: formData.nombre,
          email: formData.email,
          telefono: fullPhone,
          tipo: 'agenda_visita',
          origen: 'detalle-propiedad',
          estado: 'pendiente',
          createdAt: mod.serverTimestamp(),
          updatedAt: mod.serverTimestamp(),
          emailSent: false,
          requiereCita: true,
          datosExtra: {
            propiedadId: propInfo.propiedadId || '',
            propiedadTitulo: propInfo.propiedadTitulo || '',
            fecha: formData.fecha,
            hora: formData.hora,
            notas: formData.notas || '',
            paisCode: formData.countryCode || '+57',
          },
        });
      }
      window.location.href = REDIRECT;
    } catch (err) {
      console.error('[WizardVisita] Error:', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar visita ✓'; }
      var actions = btn?.parentElement;
      if (actions) {
        var errDiv = actions.querySelector('.wz-error');
        if (!errDiv) {
          errDiv = document.createElement('div');
          errDiv.className = 'wz-error';
          errDiv.style.display = 'block';
          errDiv.style.textAlign = 'center';
          errDiv.style.marginTop = '8px';
          actions.appendChild(errDiv);
        }
        errDiv.textContent = 'Error al enviar. Intenta de nuevo.';
        errDiv.style.display = 'block';
      }
    }
  }

  /* ─── Open / Close ──────────────────────────────────────── */
  function open(opts) {
    opts = opts || {};
    propInfo = { propiedadId: opts.propiedadId || '', propiedadTitulo: opts.propiedadTitulo || '' };
    formData = {};
    currentStep = 1;
    injectStyles();

    if (!modal) modal = buildModal();
    goTo(1);
    requestAnimationFrame(function () { modal.classList.add('visible'); });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(function () { if (modal) { modal.remove(); modal = null; } }, 250);
  }

  /* ─── ESC key ───────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal) close();
  });

  /* ─── API ───────────────────────────────────────────────── */
  window.AltorraWizard = { open: open, close: close };

})();
