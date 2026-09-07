(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     newsletter.js  — Suscripción a alertas de propiedades por email
     Guarda en Firestore colección `newsletter` con criterios de búsqueda.
     Una Cloud Function (o GitHub Actions job) lee esta colección y
     envía emails cuando lleguen propiedades que coincidan.

     API pública: window.AltorraNewsletter.{renderForm, subscribe, unsubscribe}
  ────────────────────────────────────────────────────────────────*/

  const LS_KEY = 'altorra:newsletter';

  function getStored() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (_) { return null; }
  }

  function setStored(data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) {}
  }

  async function subscribe(email, criteria = {}) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email inválido');
    }

    const doc = {
      email:    email.toLowerCase().trim(),
      activo:   true,
      criteria: {
        operacion:  criteria.operacion  || null,   // comprar | arrendar | dias | null (todas)
        tipo:       criteria.tipo       || null,   // apartamento | casa | lote | null
        ciudad:     criteria.ciudad     || null,
        precioMax:  criteria.precioMax  || null,
        precioMin:  criteria.precioMin  || null,
        habitacionesMin: criteria.habitacionesMin || null,
      },
    };

    let saved = false;

    if (window.db) {
      try {
        const { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc: fsDoc } =
          await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

        // Verificar si ya existe
        const q    = query(collection(window.db, 'newsletter'), where('email', '==', doc.email));
        const snap = await getDocs(q);

        if (!snap.empty) {
          // Reactivar suscripción existente
          await updateDoc(fsDoc(window.db, 'newsletter', snap.docs[0].id), {
            activo: true, criteria: doc.criteria, updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(window.db, 'newsletter'), {
            ...doc, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          });
        }
        saved = true;
      } catch (err) {
        console.warn('[Newsletter] Firestore error:', err);
      }
    }

    // Siempre guardar en localStorage como confirmación local
    setStored({ email: doc.email, criteria: doc.criteria, savedAt: Date.now() });

    // Fallback FormSubmit si no guardó en Firestore
    if (!saved) {
      await formsubmitFallback(email, criteria);
    }

    window.AltorraAnalytics?.trackFormSubmit?.('newsletter', 'newsletter');
    return true;
  }

  async function unsubscribe(email) {
    if (!email) { email = getStored()?.email; }
    if (!email) return;

    if (window.db) {
      try {
        const { collection, query, where, getDocs, updateDoc, doc: fsDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

        const q    = query(collection(window.db, 'newsletter'), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await updateDoc(fsDoc(window.db, 'newsletter', d.id), {
            activo: false, updatedAt: serverTimestamp(),
          });
        }
      } catch (_) {}
    }

    localStorage.removeItem(LS_KEY);
  }

  async function formsubmitFallback(email, criteria) {
    // Enviar a FormSubmit como datos del suscriptor (sin redirigir)
    try {
      await fetch('https://formsubmit.co/ajax/info@altorrainmobiliaria.co', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({
          _subject: 'Nueva suscripción newsletter | Altorra',
          email,
          operacion:  criteria.operacion  || 'todas',
          tipo:       criteria.tipo       || 'todos',
          ciudad:     criteria.ciudad     || 'todas',
          presupuesto: criteria.precioMax ? `hasta ${criteria.precioMax.toLocaleString('es-CO')}` : 'cualquiera',
        }),
      });
    } catch (_) {}
  }

  /* ── Renderizar widget de suscripción ── */
  function renderForm(containerId, opts = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const stored    = getStored();
    const subscribed = stored && stored.email;

    if (subscribed) {
      el.innerHTML = `
        <div style="background:linear-gradient(135deg,#fffdf4,#fff7d4);border:1.5px solid #d4af37;border-radius:16px;padding:24px;text-align:center">
          <div style="font-size:1.6rem;margin-bottom:8px">✅</div>
          <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">¡Ya estás suscrito!</h3>
          <p style="font-size:.82rem;color:#6b7280;margin:0 0 14px">
            Recibirás alertas en <strong>${esc(stored.email)}</strong> cuando lleguen propiedades que coincidan con tu búsqueda.
          </p>
          <button id="_nlUnsub" style="padding:7px 16px;border:1.5px solid #d4af37;border-radius:8px;background:#fff;color:#d4af37;font-weight:700;font-size:.8rem;cursor:pointer;font-family:Poppins,sans-serif">
            Cancelar suscripción
          </button>
        </div>`;
      el.querySelector('#_nlUnsub').addEventListener('click', async () => {
        await unsubscribe(stored.email);
        renderForm(containerId, opts);
      });
      return;
    }

    el.innerHTML = `
      <div style="background:#f9fafb;border-radius:16px;padding:24px">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">${esc(opts.title || 'Alertas de propiedades')}</h3>
        <p style="font-size:.82rem;color:#6b7280;margin:0 0 16px">${esc(opts.desc || 'Recibe un email cuando lleguen propiedades que coincidan con lo que buscas.')}</p>
        <div id="_nlMsg" style="display:none;padding:8px 12px;border-radius:8px;font-size:.82rem;margin-bottom:12px"></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <input id="_nlEmail" type="email" placeholder="tu@correo.com"
                 style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.88rem;font-family:Poppins,sans-serif;outline:none;width:100%;box-sizing:border-box"
                 maxlength="120" autocomplete="email"/>
          ${opts.showFilters !== false ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <select id="_nlOp" style="${selectStyle()}">
              <option value="">Cualquier operación</option>
              <option value="comprar">Comprar</option>
              <option value="arrendar">Arrendar</option>
              <option value="dias">Por días</option>
            </select>
            <select id="_nlTipo" style="${selectStyle()}">
              <option value="">Cualquier tipo</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="lote">Lote</option>
              <option value="oficina">Oficina</option>
            </select>
            <input id="_nlCiudad" type="text" placeholder="Ciudad (opcional)"
                   style="${selectStyle()}padding-right:10px" maxlength="60"/>
            <input id="_nlPresupuesto" type="number" placeholder="Presupuesto máx. (COP)"
                   style="${selectStyle()}padding-right:10px" min="0"/>
          </div>` : ''}
          <button id="_nlBtn"
                  style="padding:11px;border:none;border-radius:10px;background:linear-gradient(135deg,#d4af37,#ffb400);color:#000;font-weight:800;font-size:.9rem;cursor:pointer;font-family:Poppins,sans-serif">
            Suscribirme gratis
          </button>
        </div>
        <p style="font-size:.72rem;color:#9ca3af;margin:10px 0 0;text-align:center">
          Sin spam. Puedes cancelar en cualquier momento.
        </p>
      </div>`;

    el.querySelector('#_nlBtn').addEventListener('click', async () => {
      const email   = el.querySelector('#_nlEmail').value.trim();
      const msg     = el.querySelector('#_nlMsg');
      const btn     = el.querySelector('#_nlBtn');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.style.display = 'block';
        msg.style.background = '#fee2e2';
        msg.style.color = '#b91c1c';
        msg.textContent = 'Ingresa un correo electrónico válido';
        el.querySelector('#_nlEmail').focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Suscribiendo…';

      const criteria = {};
      const opEl     = el.querySelector('#_nlOp');
      const tipoEl   = el.querySelector('#_nlTipo');
      const ciudadEl = el.querySelector('#_nlCiudad');
      const presupEl = el.querySelector('#_nlPresupuesto');
      if (opEl?.value)     criteria.operacion  = opEl.value;
      if (tipoEl?.value)   criteria.tipo       = tipoEl.value;
      if (ciudadEl?.value) criteria.ciudad     = ciudadEl.value.trim();
      if (presupEl?.value) criteria.precioMax  = Number(presupEl.value);

      try {
        await subscribe(email, criteria);
        msg.style.display = 'block';
        msg.style.background = '#dcfce7';
        msg.style.color = '#166534';
        msg.textContent = '¡Suscripción confirmada! Revisa tu correo.';
        setTimeout(() => renderForm(containerId, opts), 1800);
      } catch (err) {
        msg.style.display = 'block';
        msg.style.background = '#fee2e2';
        msg.style.color = '#b91c1c';
        msg.textContent = err.message || 'Error al suscribir. Intenta de nuevo.';
        btn.disabled = false;
        btn.textContent = 'Suscribirme gratis';
      }
    });
  }

  function selectStyle() {
    return 'padding:9px 10px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.82rem;font-family:Poppins,sans-serif;color:#111827;background:#fff;outline:none;width:100%;box-sizing:border-box;';
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Floating bar (auto-shows after 5s on public pages) ── */
  function injectBarCSS() {
    if (document.getElementById('nl-bar-css')) return;
    var s = document.createElement('style');
    s.id = 'nl-bar-css';
    s.textContent = [
      '.nl-bar{position:fixed;bottom:0;left:0;right:0;z-index:1100;',
      'background:linear-gradient(135deg,#0b0b0b,#1a1a2e);color:#fff;',
      'padding:14px 20px;transform:translateY(100%);transition:transform .4s ease;',
      'box-shadow:0 -4px 20px rgba(0,0,0,.3);font-family:Poppins,system-ui,sans-serif}',
      '.nl-bar.visible{transform:translateY(0)}',
      '.nl-bar-inner{max-width:800px;margin:0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
      '.nl-bar-text{flex:1;min-width:180px}',
      '.nl-bar-text h4{margin:0;font-size:.9rem;font-weight:700;color:#d4af37}',
      '.nl-bar-text p{margin:3px 0 0;font-size:.78rem;color:#9ca3af}',
      '.nl-bar-form{display:flex;gap:8px;flex:1;min-width:260px}',
      '.nl-bar-form input{flex:1;padding:9px 12px;border:1px solid #374151;border-radius:8px;',
      'background:#1f2937;color:#fff;font-size:.88rem;font-family:inherit}',
      '.nl-bar-form input::placeholder{color:#6b7280}',
      '.nl-bar-form input:focus{outline:none;border-color:#d4af37}',
      '.nl-bar-form button{padding:9px 18px;border:none;border-radius:8px;',
      'background:linear-gradient(90deg,#d4af37,#ffb400);color:#000;font-weight:700;',
      'font-size:.82rem;cursor:pointer;white-space:nowrap;font-family:inherit}',
      '.nl-bar-close{position:absolute;top:6px;right:10px;background:none;border:none;',
      'color:#6b7280;font-size:1.1rem;cursor:pointer;padding:4px}',
      '.nl-bar-close:hover{color:#fff}',
      '.nl-bar-msg{text-align:center;font-size:.8rem;margin-top:4px}',
      '.nl-bar-msg.ok{color:#22c55e}.nl-bar-msg.err{color:#ef4444}',
      '@media(max-width:600px){.nl-bar-inner{flex-direction:column;text-align:center}',
      '.nl-bar-form{width:100%}}',
    ].join('');
    document.head.appendChild(s);
  }

  function dismissBar() {
    try { localStorage.setItem('altorra:nl-bar-off', '1'); } catch (_) {}
    var bar = document.getElementById('nl-floating-bar');
    if (bar) bar.classList.remove('visible');
  }

  function showBar() {
    var stored = getStored();
    if (stored && stored.email) return;
    try { if (localStorage.getItem('altorra:nl-bar-off') === '1') return; } catch (_) {}
    if (window.location.pathname.includes('admin')) return;

    injectBarCSS();
    var bar = document.createElement('div');
    bar.id = 'nl-floating-bar';
    bar.className = 'nl-bar';
    bar.setAttribute('role', 'complementary');
    bar.innerHTML = [
      '<button class="nl-bar-close" aria-label="Cerrar" onclick="AltorraNewsletter.dismissBar()">&times;</button>',
      '<div class="nl-bar-inner">',
      '<div class="nl-bar-text"><h4>Recibe oportunidades de inversión</h4>',
      '<p>Propiedades nuevas y análisis de mercado en tu email.</p></div>',
      '<form class="nl-bar-form" id="nl-bar-form">',
      '<input type="email" id="nl-bar-email" placeholder="Tu correo electrónico" required/>',
      '<button type="submit">Suscribirme</button>',
      '</form></div>',
      '<div id="nl-bar-msg" class="nl-bar-msg"></div>',
    ].join('');
    document.body.appendChild(bar);

    bar.querySelector('#nl-bar-form').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var email = bar.querySelector('#nl-bar-email').value.trim();
      var msgEl = bar.querySelector('#nl-bar-msg');
      var btn   = bar.querySelector('button[type="submit"]');
      try {
        btn.disabled = true; btn.textContent = '…';
        await subscribe(email, {});
        msgEl.className = 'nl-bar-msg ok';
        msgEl.textContent = '¡Suscrito! Recibirás las mejores oportunidades.';
        setTimeout(dismissBar, 2500);
      } catch (err) {
        msgEl.className = 'nl-bar-msg err';
        msgEl.textContent = err.message || 'Error. Intenta de nuevo.';
        btn.disabled = false; btn.textContent = 'Suscribirme';
      }
    });

    setTimeout(function () { bar.classList.add('visible'); }, 5000);
  }

  function initBar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBar);
    } else {
      showBar();
    }
  }

  initBar();

  window.AltorraNewsletter = { renderForm, subscribe, unsubscribe, getStored, dismissBar };

})();
