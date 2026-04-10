/**
 * historial-visitas.js — Historial de propiedades vistas recientemente
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars historial-visitas.js
 *
 * Guarda en localStorage las últimas N propiedades visitadas.
 * Si Firebase Auth está disponible, sincroniza con Firestore:
 *   favoritos/{uid}/historial (array de items)
 *
 * Uso:
 *   - En detalle-propiedad.html: AltorraHistorial.add(prop)
 *   - En home / listados: AltorraHistorial.render('#contenedor', limit)
 *
 * API pública: window.AltorraHistorial
 */

(function () {
  'use strict';

  const LS_KEY  = 'altorra:historial';
  const MAX_ITEMS = 10;  // máximo de propiedades en el historial

  /* ─── localStorage ──────────────────────────────────────── */
  function lsGet() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function lsSet(items) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch { /* cuota excedida */ }
  }

  /* ─── Agregar propiedad al historial ───────────────────── */
  function add(prop) {
    if (!prop?.id) return;

    let items = lsGet();

    // Eliminar si ya existía (para mover al frente)
    items = items.filter(p => String(p.id) !== String(prop.id));

    // Insertar al frente
    items.unshift({
      id:        String(prop.id),
      title:     prop.title     || prop.titulo     || '',
      city:      prop.city      || prop.ciudad      || '',
      price:     prop.price     || prop.precio      || 0,
      image:     prop.image     || prop.imagen      || '',
      operation: prop.operation || prop.operacion   || '',
      beds:      prop.beds      || prop.habitaciones|| 0,
      baths:     prop.baths     || prop.banos       || 0,
      sqm:       prop.sqm       || 0,
      type:      prop.type      || prop.tipo        || '',
      visitedAt: Date.now(),
    });

    // Truncar al límite
    if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
    lsSet(items);

    // Analytics
    window.AltorraAnalytics?.trackPropertyView?.(prop.id, prop.title || prop.titulo, prop.operation || prop.operacion);

    // Sync asíncrono con Firebase (no bloquea)
    _syncToFirebase(items);
  }

  /* ─── Sync con Firestore (opcional) ────────────────────── */
  async function _syncToFirebase(items) {
    if (!window.auth || !window.db) return;
    const user = window.auth.currentUser;
    if (!user) return;
    try {
      const { doc, setDoc, serverTimestamp } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      await setDoc(doc(window.db, 'favoritos', user.uid), {
        historial: items.slice(0, MAX_ITEMS),
        historialUpdatedAt: serverTimestamp(),
      }, { merge: true });
    } catch { /* no crítico */ }
  }

  /* ─── Renderizar en un contenedor HTML ──────────────────── */
  function render(selector, limit = 4) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!container) return;

    const items = lsGet().slice(0, limit);
    if (!items.length) {
      container.style.display = 'none';
      return;
    }

    container.style.display = '';

    const formatCOP = (n) => {
      if (!n) return '';
      return '$ ' + new Intl.NumberFormat('es-CO').format(n);
    };

    container.innerHTML = items.map(p => {
      const specs = [];
      if (p.beds || p.baths) specs.push(`${p.beds || 0}H · ${p.baths || 0}B`);
      if (p.sqm) specs.push(`${p.sqm} m²`);

      return `
      <a class="historial-card" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}"
         aria-label="${p.title || 'Propiedad'}">
        <div class="historial-img">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title || ''}" loading="lazy" decoding="async"/>`
            : `<div class="historial-img-placeholder"></div>`}
        </div>
        <div class="historial-info">
          <p class="historial-title">${p.title || 'Propiedad'}</p>
          ${p.city ? `<p class="historial-city">${p.city}</p>` : ''}
          ${specs.length ? `<p class="historial-specs">${specs.join(' · ')}</p>` : ''}
          ${p.price ? `<p class="historial-price">${formatCOP(p.price)}</p>` : ''}
        </div>
      </a>`;
    }).join('');
  }

  /* ─── Estilos inyectados ────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('historial-styles')) return;
    const style = document.createElement('style');
    style.id = 'historial-styles';
    style.textContent = `
      .historial-section { margin: 40px auto; max-width: var(--page-max, 1200px); padding: 0 16px; }
      .historial-section h2 { font-size: 1.4rem; font-weight: 800; color: var(--text, #111827); margin-bottom: 16px; }
      .historial-row {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      }
      .historial-card {
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(17,24,39,.07);
        box-shadow: 0 4px 14px rgba(17,24,39,.05);
        text-decoration: none;
        color: inherit;
        transition: transform .18s ease, box-shadow .18s ease;
        background: #fff;
      }
      .historial-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 28px rgba(17,24,39,.10);
      }
      .historial-img {
        width: 100%;
        height: 130px;
        background: #f3f4f6;
        overflow: hidden;
        flex-shrink: 0;
      }
      .historial-img img { width: 100%; height: 100%; object-fit: cover; }
      .historial-img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
      .historial-info { padding: 10px 12px; }
      .historial-title {
        font-size: .88rem;
        font-weight: 700;
        color: var(--text, #111827);
        margin: 0 0 3px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .historial-city  { font-size: .78rem; color: var(--muted, #6b7280); margin: 0 0 2px; }
      .historial-specs { font-size: .78rem; color: var(--muted, #6b7280); margin: 0 0 4px; }
      .historial-price { font-size: .9rem; font-weight: 800; color: var(--gold, #d4af37); margin: 0; }
    `;
    document.head.appendChild(style);
  }

  /* ─── Renderizar sección completa (incluye título) ──────── */
  function renderSection(containerSel, limit = 4, title = 'Vistas recientemente') {
    injectStyles();
    const wrap = typeof containerSel === 'string'
      ? document.querySelector(containerSel)
      : containerSel;
    if (!wrap) return;

    const items = lsGet().slice(0, limit);
    if (!items.length) { wrap.style.display = 'none'; return; }

    wrap.style.display = '';
    wrap.innerHTML = `
      <section class="historial-section" aria-label="${title}">
        <h2>${title}</h2>
        <div class="historial-row"></div>
      </section>`;
    render(wrap.querySelector('.historial-row'), limit);
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.AltorraHistorial = {
    add,
    get:           lsGet,
    render,
    renderSection,
    clear:         () => { lsSet([]); },
  };

})();
