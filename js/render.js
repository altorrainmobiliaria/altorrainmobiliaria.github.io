/**
 * render.js — Altorra Inmobiliaria
 * Funciones de renderizado de tarjetas de propiedades.
 *
 * API pública (window.AltorraRender):
 *   AltorraRender.propertyCard(prop)       → <article> DOM element
 *   AltorraRender.skeleton(count)          → <div> DOM element con skeletons
 *   AltorraRender.renderList(props, root)  → llena #root con tarjetas
 *   AltorraRender.showEmpty(root, msg?)    → muestra estado vacío
 *   AltorraRender.showError(root, msg?)    → muestra estado de error
 */

(function () {
  'use strict';

  const PHONE    = '573002439810';
  const COMPANY  = 'Altorra Inmobiliaria';
  const PLACEHOLDER = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';

  // ── Utilidades ─────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    }[c]));
  }

  function formatCOP(n) {
    if (!n && n !== 0) return '';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function capitalize(s) {
    s = String(s || '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function getPriceLabel(p) {
    if (!p.price) return '';
    const formatted = '$ ' + formatCOP(p.price) + ' COP';
    const op = String(p.operation || '').toLowerCase();
    if (op === 'arrendar' || op === 'arriendo') return formatted + ' / mes';
    if (op === 'dias'     || op === 'alojamientos') return formatted + ' / noche';
    return formatted;
  }

  function buildWhatsAppLink(p) {
    const detailUrl = new URL('detalle-propiedad.html?id=' + encodeURIComponent(p.id), location.href).href;
    const price     = getPriceLabel(p);
    const text      = `Hola ${COMPANY}, me interesa "${p.title}" (ID: ${p.id}) en ${p.city}${price ? ' por ' + price : ''}. ¿Podemos hablar? ${detailUrl}`;
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  }

  function isFav(id) {
    try {
      const raw = localStorage.getItem('altorra:favoritos');
      const favs = raw ? JSON.parse(raw) : [];
      return Array.isArray(favs) && favs.includes(String(id));
    } catch (_) { return false; }
  }

  // ── Tarjeta de propiedad ──────────────────────────────────────────────────
  function propertyCard(p) {
    const imgSrc  = p.image
      ? (p.image.startsWith('http') || p.image.startsWith('/') ? p.image : '/' + p.image)
      : PLACEHOLDER;
    const favored = isFav(p.id);
    const opLabel = capitalize(p.operation === 'dias' ? 'Alojamiento' : p.operation);
    const isNew   = p.added && (Date.now() - new Date(p.added).getTime()) < 30 * 86400000;

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = esc(p.id);

    card.innerHTML = `
      <div class="media">
        <div class="img-skeleton" aria-hidden="true"></div>
        <img
          class="property-img"
          src="${esc(imgSrc)}"
          alt="${esc(p.title || 'Propiedad')}"
          loading="lazy"
          decoding="async"
        />
        <div class="property-badges">
          ${p.featured ? '<span class="badge badge-featured">Destacado</span>' : ''}
          ${isNew      ? '<span class="badge badge-new">Nuevo</span>' : ''}
          <span class="badge badge-op">${esc(opLabel)}</span>
        </div>
        <button
          class="fav-btn${favored ? ' fav-btn--active' : ''}"
          type="button"
          aria-label="${favored ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
          aria-pressed="${favored}"
          data-prop-id="${esc(p.id)}"
        ><span class="heart">${favored ? '♥' : '♡'}</span></button>
      </div>
      <div class="meta">
        <h3 class="property-title">${esc(p.title)}</h3>
        <p class="property-location">${p.neighborhood ? esc(p.neighborhood) + ' · ' : ''}${esc(p.city)}</p>
        <p class="property-specs">${
          [
            p.beds  ? p.beds  + ' hab.'  : '',
            p.baths ? p.baths + ' baños' : '',
            p.sqm   ? p.sqm   + ' m²'   : '',
          ].filter(Boolean).join(' · ')
        }</p>
        <div class="property-footer">
          <span class="property-price">${esc(getPriceLabel(p))}</span>
        </div>
        <div class="cta">
          <a class="btn btn-primary" href="detalle-propiedad.html?id=${encodeURIComponent(p.id)}">
            Ver detalles
          </a>
          <a class="btn btn-ghost" href="${esc(buildWhatsAppLink(p))}" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
      </div>
    `;

    // Eliminar skeleton cuando la imagen carga
    const img = card.querySelector('.property-img');
    const skl = card.querySelector('.img-skeleton');
    if (img && skl) {
      img.addEventListener('load',  () => skl.remove(), { once: true });
      img.addEventListener('error', () => { img.src = PLACEHOLDER; skl.remove(); }, { once: true });
    }

    // Clic en la tarjeta (no en los botones)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.cta') || e.target.closest('.fav-btn')) return;
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(p.id);
    });

    return card;
  }

  // ── Skeletons de carga ────────────────────────────────────────────────────
  function skeleton(count = 6) {
    const wrap = document.createElement('div');
    wrap.className = 'skeleton-grid';
    wrap.setAttribute('aria-busy', 'true');
    wrap.setAttribute('aria-label', 'Cargando propiedades...');
    for (let i = 0; i < count; i++) {
      wrap.innerHTML += `
        <div class="card card--skeleton" aria-hidden="true">
          <div class="media skeleton-img"></div>
          <div class="meta">
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>`;
    }
    return wrap;
  }

  // ── Renderizar lista en un contenedor ─────────────────────────────────────
  function renderList(props, root, { replace = true } = {}) {
    if (!root) return;
    if (replace) root.innerHTML = '';

    const fragment = document.createDocumentFragment();
    props.forEach(p => fragment.appendChild(propertyCard(p)));
    root.appendChild(fragment);

    // Inicializar favoritos si el módulo está disponible
    if (window.AltorraFavoritos && typeof window.AltorraFavoritos.syncButtons === 'function') {
      window.AltorraFavoritos.syncButtons();
    }

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('altorra:properties-rendered', { detail: { count: props.length } }));
    }, 50);
  }

  // ── Estados vacío / error ─────────────────────────────────────────────────
  function showEmpty(root, msg = 'No se encontraron propiedades con los filtros seleccionados.') {
    if (!root) return;
    root.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;display:block;opacity:.4">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3 style="margin:0 0 8px;font-size:1.1rem">Sin resultados</h3>
        <p style="margin:0;font-size:.95rem">${esc(msg)}</p>
      </div>`;
  }

  function showError(root, msg = 'Error al cargar propiedades. Por favor, recarga la página.') {
    if (!root) return;
    root.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;display:block;opacity:.4">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 style="margin:0 0 8px;font-size:1.1rem">Error al cargar</h3>
        <p style="margin:0 0 16px;font-size:.95rem">${esc(msg)}</p>
        <button onclick="location.reload()" class="btn btn-primary" style="font-size:.9rem;padding:10px 20px">
          Recargar página
        </button>
      </div>`;
  }

  // ── API global ─────────────────────────────────────────────────────────────
  window.AltorraRender = { propertyCard, skeleton, renderList, showEmpty, showError };

  console.log('[AltorraRender] Módulo cargado ✅');
})();
