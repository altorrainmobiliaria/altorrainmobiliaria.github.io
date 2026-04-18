/**
 * wizard-publicar.js — Modal wizard "Publica tu propiedad" (3 pasos)
 * Altorra Inmobiliaria
 *
 * Paso 1: Tipo de inmueble + operación + ciudad
 * Paso 2: Datos de contacto (nombre, email, teléfono con country selector)
 * Paso 3: Confirmación → envía a Firestore solicitudes tipo publicar_propiedad
 *
 * API: window.AltorraPublishWizard.open()
 */
(function () {
  'use strict';

  var COLLECTION = 'solicitudes';
  var REDIRECT = 'https://altorrainmobiliaria.co/gracias.html';

  var COUNTRIES = [
    { code: '+57',  flag: '\u{1F1E8}\u{1F1F4}' },
    { code: '+1',   flag: '\u{1F1FA}\u{1F1F8}' },
    { code: '+34',  flag: '\u{1F1EA}\u{1F1F8}' },
    { code: '+52',  flag: '\u{1F1F2}\u{1F1FD}' },
    { code: '+507', flag: '\u{1F1F5}\u{1F1E6}' },
    { code: '+51',  flag: '\u{1F1F5}\u{1F1EA}' },
    { code: '+593', flag: '\u{1F1EA}\u{1F1E8}' },
    { code: '+58',  flag: '\u{1F1FB}\u{1F1EA}' },
    { code: '+56',  flag: '\u{1F1E8}\u{1F1F1}' },
    { code: '+54',  flag: '\u{1F1E6}\u{1F1F7}' },
  ];

  var TIPOS = ['Apartamento', 'Casa', 'Lote', 'Oficina', 'Local', 'Bodega'];
  var OPERACIONES = ['Vender', 'Arrendar', 'Rentar por días'];

  var modal = null;
  var step = 1;
  var fd = {};

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  function injectCSS() {
    if (document.getElementById('pub-wz-css')) return;
    var s = document.createElement('style');
    s.id = 'pub-wz-css';
    s.textContent = [
      '.pwz-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}',
      '.pwz-overlay.visible{opacity:1}',
      '.pwz-modal{background:#fff;border-radius:18px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.18);padding:28px 24px;position:relative;transform:translateY(20px);transition:transform .25s}',
      '.pwz-overlay.visible .pwz-modal{transform:translateY(0)}',
      '.pwz-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--muted,#6b7280);line-height:1}',
      '.pwz-dots{display:flex;gap:8px;margin-bottom:20px}',
      '.pwz-dot{flex:1;height:4px;border-radius:4px;background:#e5e7eb;transition:background .2s}',
      '.pwz-dot.active{background:var(--gold,#d4af37)}.pwz-dot.done{background:var(--gold,#d4af37);opacity:.5}',
      '.pwz-title{font-size:1.15rem;font-weight:800;margin:0 0 4px}.pwz-sub{font-size:.85rem;color:var(--muted,#6b7280);margin:0 0 20px}',
      '.pwz-field{margin-bottom:14px}.pwz-label{display:block;font-size:.82rem;font-weight:600;margin:0 0 5px}',
      '.pwz-input,.pwz-select{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:10px;font-size:.92rem;font-family:inherit}',
      '.pwz-input:focus,.pwz-select:focus{border-color:var(--gold,#d4af37);outline:none;box-shadow:0 0 0 3px rgba(212,175,55,.12)}',
      '.pwz-row{display:flex;gap:10px;margin-bottom:14px}.pwz-row>*{flex:1}',
      '.pwz-phone{display:flex;gap:8px}.pwz-cc{width:100px;padding:10px 8px;border:1px solid #d1d5db;border-radius:10px;font-size:.88rem;background:#fff}',
      '.pwz-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}',
      '.pwz-chip{padding:8px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.88rem;font-weight:600;cursor:pointer;background:#fff;transition:all .15s}',
      '.pwz-chip:hover{border-color:var(--gold,#d4af37);background:rgba(212,175,55,.06)}',
      '.pwz-chip.sel{border-color:var(--gold,#d4af37);background:var(--gold,#d4af37);color:#000}',
      '.pwz-actions{display:flex;gap:10px;margin-top:20px}',
      '.pwz-btn{flex:1;padding:12px;border-radius:12px;font-size:.92rem;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .15s}',
      '.pwz-back{background:#f3f4f6;color:var(--text,#111827)}.pwz-back:hover{background:#e5e7eb}',
      '.pwz-next{background:linear-gradient(135deg,var(--gold,#d4af37),var(--accent,#ffb400));color:#000}.pwz-next:hover{filter:brightness(1.06)}',
      '.pwz-summary{background:#fafafa;border-radius:12px;padding:16px;margin-bottom:16px}',
      '.pwz-sr{display:flex;justify-content:space-between;padding:6px 0;font-size:.85rem}',
      '.pwz-sr span:first-child{color:var(--muted,#6b7280)}.pwz-sr span:last-child{font-weight:700}',
      '.pwz-err{color:#dc2626;font-size:.8rem;margin-top:4px;display:none}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function buildModal() {
    var ov = document.createElement('div');
    ov.className = 'pwz-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Publicar propiedad');
    ov.innerHTML = '<div class="pwz-modal">'
      + '<button class="pwz-close" aria-label="Cerrar">&times;</button>'
      + '<div class="pwz-dots"><div class="pwz-dot"></div><div class="pwz-dot"></div><div class="pwz-dot"></div></div>'
      + '<div id="pwzBody"></div></div>';
    ov.querySelector('.pwz-close').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    return ov;
  }

  function updateDots() {
    modal.querySelectorAll('.pwz-dot').forEach(function (d, i) {
      d.classList.remove('active', 'done');
      if (i + 1 === step) d.classList.add('active');
      else if (i + 1 < step) d.classList.add('done');
    });
  }

  function chipHtml(arr, key) {
    return arr.map(function (v) {
      return '<button type="button" class="pwz-chip' + (fd[key] === v ? ' sel' : '') + '" data-key="' + key + '" data-val="' + v + '">' + v + '</button>';
    }).join('');
  }

  function step1() {
    return '<h3 class="pwz-title">Datos del inmueble</h3>'
      + '<p class="pwz-sub">Paso 1 de 3 — ¿Qué tipo de propiedad quieres publicar?</p>'
      + '<div class="pwz-field"><label class="pwz-label">Tipo de inmueble *</label>'
      + '<div class="pwz-chips" id="pwzTipoChips">' + chipHtml(TIPOS, 'tipo') + '</div>'
      + '<div class="pwz-err" id="pwzTipoErr">Selecciona un tipo</div></div>'
      + '<div class="pwz-field"><label class="pwz-label">Operación *</label>'
      + '<div class="pwz-chips" id="pwzOpChips">' + chipHtml(OPERACIONES, 'operacion') + '</div>'
      + '<div class="pwz-err" id="pwzOpErr">Selecciona una operación</div></div>'
      + '<div class="pwz-row"><div class="pwz-field"><label class="pwz-label">Ciudad *</label>'
      + '<input class="pwz-input" id="pwzCiudad" placeholder="Cartagena" value="' + esc(fd.ciudad || '') + '"/>'
      + '<div class="pwz-err" id="pwzCiudadErr">Ingresa la ciudad</div></div>'
      + '<div class="pwz-field"><label class="pwz-label">Precio aprox. (COP)</label>'
      + '<input class="pwz-input" id="pwzPrecio" type="number" placeholder="500000000" value="' + (fd.precio || '') + '"/></div></div>'
      + '<div class="pwz-actions"><button class="pwz-btn pwz-next" id="pwzNext1">Siguiente →</button></div>';
  }

  function step2() {
    var ccOpts = COUNTRIES.map(function (c) {
      return '<option value="' + c.code + '"' + (c.code === (fd.cc || '+57') ? ' selected' : '') + '>' + c.flag + ' ' + c.code + '</option>';
    }).join('');
    return '<h3 class="pwz-title">Tus datos de contacto</h3>'
      + '<p class="pwz-sub">Paso 2 de 3 — Para que podamos contactarte</p>'
      + '<div class="pwz-field"><label class="pwz-label">Nombre completo *</label>'
      + '<input class="pwz-input" id="pwzNombre" value="' + esc(fd.nombre || '') + '" placeholder="Tu nombre"/>'
      + '<div class="pwz-err" id="pwzNombreErr">Ingresa tu nombre</div></div>'
      + '<div class="pwz-field"><label class="pwz-label">Email *</label>'
      + '<input class="pwz-input" id="pwzEmail" type="email" value="' + esc(fd.email || '') + '" placeholder="tu@email.com"/>'
      + '<div class="pwz-err" id="pwzEmailErr">Email inválido</div></div>'
      + '<div class="pwz-field"><label class="pwz-label">Teléfono *</label>'
      + '<div class="pwz-phone"><select class="pwz-cc" id="pwzCC">' + ccOpts + '</select>'
      + '<input class="pwz-input" id="pwzTel" type="tel" value="' + esc(fd.tel || '') + '" placeholder="300 123 4567"/></div>'
      + '<div class="pwz-err" id="pwzTelErr">Ingresa tu teléfono</div></div>'
      + '<div class="pwz-field"><label class="pwz-label">Descripción breve (opcional)</label>'
      + '<textarea class="pwz-input" id="pwzDesc" rows="2" placeholder="Detalles adicionales…">' + esc(fd.desc || '') + '</textarea></div>'
      + '<div class="pwz-actions"><button class="pwz-btn pwz-back" id="pwzBack2">← Atrás</button>'
      + '<button class="pwz-btn pwz-next" id="pwzNext2">Siguiente →</button></div>';
  }

  function step3() {
    var phone = (fd.cc || '+57') + ' ' + (fd.tel || '');
    return '<h3 class="pwz-title">Confirma tu solicitud</h3>'
      + '<p class="pwz-sub">Paso 3 de 3 — Revisa los datos</p>'
      + '<div class="pwz-summary">'
      + '<div class="pwz-sr"><span>Tipo</span><span>' + esc(fd.tipo) + '</span></div>'
      + '<div class="pwz-sr"><span>Operación</span><span>' + esc(fd.operacion) + '</span></div>'
      + '<div class="pwz-sr"><span>Ciudad</span><span>' + esc(fd.ciudad) + '</span></div>'
      + (fd.precio ? '<div class="pwz-sr"><span>Precio</span><span>$ ' + Number(fd.precio).toLocaleString('es-CO') + '</span></div>' : '')
      + '<div class="pwz-sr"><span>Nombre</span><span>' + esc(fd.nombre) + '</span></div>'
      + '<div class="pwz-sr"><span>Email</span><span>' + esc(fd.email) + '</span></div>'
      + '<div class="pwz-sr"><span>Teléfono</span><span>' + esc(phone) + '</span></div>'
      + (fd.desc ? '<div class="pwz-sr"><span>Descripción</span><span>' + esc(fd.desc) + '</span></div>' : '')
      + '</div>'
      + '<div class="pwz-actions"><button class="pwz-btn pwz-back" id="pwzBack3">← Atrás</button>'
      + '<button class="pwz-btn pwz-next" id="pwzSubmit">Enviar solicitud ✓</button></div>';
  }

  function goTo(s) {
    step = s;
    var body = modal.querySelector('#pwzBody');
    if (s === 1) body.innerHTML = step1();
    else if (s === 2) body.innerHTML = step2();
    else body.innerHTML = step3();
    updateDots();
    wire();
  }

  function showE(id) { var el = document.getElementById(id); if (el) el.style.display = 'block'; }
  function hideE(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }

  function val1() {
    var ok = true;
    hideE('pwzTipoErr'); hideE('pwzOpErr'); hideE('pwzCiudadErr');
    fd.ciudad = (document.getElementById('pwzCiudad')?.value || '').trim();
    fd.precio = document.getElementById('pwzPrecio')?.value || '';
    if (!fd.tipo) { showE('pwzTipoErr'); ok = false; }
    if (!fd.operacion) { showE('pwzOpErr'); ok = false; }
    if (!fd.ciudad) { showE('pwzCiudadErr'); ok = false; }
    return ok;
  }

  function val2() {
    var ok = true;
    hideE('pwzNombreErr'); hideE('pwzEmailErr'); hideE('pwzTelErr');
    fd.nombre = (document.getElementById('pwzNombre')?.value || '').trim();
    fd.email = (document.getElementById('pwzEmail')?.value || '').trim();
    fd.tel = (document.getElementById('pwzTel')?.value || '').trim();
    fd.cc = document.getElementById('pwzCC')?.value || '+57';
    fd.desc = (document.getElementById('pwzDesc')?.value || '').trim();
    if (!fd.nombre) { showE('pwzNombreErr'); ok = false; }
    if (!fd.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)) { showE('pwzEmailErr'); ok = false; }
    if (!fd.tel || fd.tel.length < 7) { showE('pwzTelErr'); ok = false; }
    return ok;
  }

  function wire() {
    // Chips
    modal.querySelectorAll('.pwz-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var key = c.dataset.key;
        var parent = c.parentElement;
        parent.querySelectorAll('.pwz-chip').forEach(function (x) { x.classList.remove('sel'); });
        c.classList.add('sel');
        fd[key] = c.dataset.val;
      });
    });
    var n1 = document.getElementById('pwzNext1');
    if (n1) n1.addEventListener('click', function () { if (val1()) goTo(2); });
    var b2 = document.getElementById('pwzBack2');
    if (b2) b2.addEventListener('click', function () { goTo(1); });
    var n2 = document.getElementById('pwzNext2');
    if (n2) n2.addEventListener('click', function () { if (val2()) goTo(3); });
    var b3 = document.getElementById('pwzBack3');
    if (b3) b3.addEventListener('click', function () { goTo(2); });
    var sub = document.getElementById('pwzSubmit');
    if (sub) sub.addEventListener('click', submit);
  }

  async function submit() {
    var btn = document.getElementById('pwzSubmit');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
    var phone = (fd.cc || '+57') + ' ' + fd.tel;
    try {
      if (window.db) {
        var m = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        await m.addDoc(m.collection(window.db, COLLECTION), {
          nombre: fd.nombre,
          email: fd.email,
          telefono: phone,
          tipo: 'publicar_propiedad',
          origen: 'wizard-publicar-home',
          estado: 'pendiente',
          createdAt: m.serverTimestamp(),
          updatedAt: m.serverTimestamp(),
          emailSent: false,
          requiereCita: false,
          datosExtra: {
            tipoInmueble: fd.tipo,
            operacion: fd.operacion,
            ciudad: fd.ciudad,
            precioAproximado: fd.precio ? Number(fd.precio) : null,
            descripcion: fd.desc || '',
          },
        });
      }
      window.location.href = REDIRECT;
    } catch (err) {
      console.error('[PublishWizard]', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar solicitud ✓'; }
    }
  }

  function open() {
    fd = {};
    step = 1;
    injectCSS();
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

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal) close(); });

  window.AltorraPublishWizard = { open: open, close: close };
})();
