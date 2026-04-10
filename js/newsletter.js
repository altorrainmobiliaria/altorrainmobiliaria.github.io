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

  window.AltorraNewsletter = { renderForm, subscribe, unsubscribe, getStored };

})();
