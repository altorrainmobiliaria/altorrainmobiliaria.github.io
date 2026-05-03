/**
 * sector-properties.js — Render dinámico de propiedades por sector.
 *
 * Uso en una landing de sector (ej. serena-del-mar.html):
 *   <section class="lp-s">
 *     <h2>Propiedades disponibles en Serena del Mar</h2>
 *     <div id="sector-properties"
 *          data-sector="Serena del Mar"
 *          data-fallback-search="Serena+del+Mar"></div>
 *   </section>
 *   <script defer src="js/sector-properties.js"></script>
 *
 * Filtra propertyDB por barrio (búsqueda parcial case-insensitive).
 * Si no hay inventario disponible, muestra CTA de contacto.
 */
(function () {
  'use strict';

  const MAX_CARDS = 6;

  const _u = window.AltorraUtils || {};
  const formatCOP = (n) =>
    _u.formatCOP
      ? _u.formatCOP(n)
      : n == null ? '—' : '$ ' + Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const escapeHtml = (s) =>
    _u.escapeHtml
      ? _u.escapeHtml(s)
      : String(s || '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  function detailHref(id) {
    return id ? `detalle-propiedad.html?id=${encodeURIComponent(id)}` : '#';
  }

  function pickImage(p) {
    const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo || (Array.isArray(p.images) && p.images[0]);
    if (!raw) return 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';
    const str = String(raw);
    if (/^https?:\/\//i.test(str) || str.startsWith('/')) return str;
    return '/' + str.replace(/^\.?\//, '');
  }

  function operationLabel(op) {
    if (op === 'arrendar') return 'En arriendo';
    if (op === 'dias' || op === 'alojamientos') return 'Por días';
    return 'En venta';
  }

  function buildCard(p) {
    const title = escapeHtml(p.title || 'Propiedad');
    const beds = p.beds != null ? `${p.beds}H` : '';
    const baths = p.baths != null ? `${p.baths}B` : '';
    const sqm = p.sqm != null ? `${p.sqm}m²` : '';
    const specs = [beds, baths, sqm].filter(Boolean).join(' · ');
    const price = formatCOP(p.price);
    const href = detailHref(p.id);
    const img = pickImage(p);
    const op = escapeHtml(operationLabel(p.operation));

    return `
      <a class="sector-card" href="${href}" data-id="${escapeHtml(p.id || '')}" aria-label="${title}">
        <div class="sector-card-media">
          <img src="${escapeHtml(img)}" alt="${title}" loading="lazy" decoding="async"/>
          <span class="sector-card-badge">${op}</span>
        </div>
        <div class="sector-card-body">
          <h3 class="sector-card-title">${title}</h3>
          ${specs ? `<p class="sector-card-specs">${escapeHtml(specs)}</p>` : ''}
          <div class="sector-card-price">${escapeHtml(price)}</div>
        </div>
      </a>
    `;
  }

  function renderEmpty(container, sectorName, fallbackSearch) {
    const safeName = escapeHtml(sectorName);
    const searchUrl = `propiedades-comprar.html?search=${encodeURIComponent(fallbackSearch || sectorName)}`;
    const wa = `https://wa.me/573002439810?text=${encodeURIComponent('Hola Altorra, quiero ser notificado cuando publiquen propiedades en ' + sectorName + '.')}`;
    container.innerHTML = `
      <div class="sector-empty">
        <p><strong>No tenemos inventario activo en ${safeName} en este momento.</strong></p>
        <p>Las propiedades en este sector se mueven rápido. Déjanos tu contacto y te avisamos primero cuando llegue una nueva.</p>
        <div class="sector-empty-ctas">
          <a class="sector-empty-btn primary" href="${wa}" target="_blank" rel="noopener">Avisarme por WhatsApp</a>
          <a class="sector-empty-btn ghost" href="${searchUrl}">Ver toda la disponibilidad</a>
        </div>
      </div>
    `;
  }

  function renderSkeletons(container, n) {
    let html = '<div class="sector-grid">';
    for (let i = 0; i < n; i++) {
      html += `
        <div class="sector-card sector-card-skeleton" aria-hidden="true">
          <div class="sector-card-media sk"></div>
          <div class="sector-card-body">
            <div class="sk-line w-80"></div>
            <div class="sk-line w-60"></div>
            <div class="sk-line w-40"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function render(container, props, sectorName, fallbackSearch) {
    if (!props.length) {
      renderEmpty(container, sectorName, fallbackSearch);
      return;
    }
    const cards = props.slice(0, MAX_CARDS).map(buildCard).join('');
    const seeAll = `propiedades-comprar.html?search=${encodeURIComponent(fallbackSearch || sectorName)}`;
    container.innerHTML = `
      <div class="sector-grid">${cards}</div>
      <div class="sector-see-all">
        <a href="${seeAll}">Ver toda la disponibilidad en ${escapeHtml(sectorName)} →</a>
      </div>
    `;
  }

  async function waitForDB(timeoutMs = 8000) {
    if (window.propertyDB && window.propertyDB.isLoaded) return window.propertyDB;
    return new Promise((resolve) => {
      const onReady = () => resolve(window.propertyDB || null);
      window.addEventListener('altorra:db-ready', onReady, { once: true });
      setTimeout(() => resolve(window.propertyDB || null), timeoutMs);
    });
  }

  async function init() {
    const container = document.getElementById('sector-properties');
    if (!container) return;

    const sectorName = container.dataset.sector || '';
    const fallbackSearch = container.dataset.fallbackSearch || sectorName;
    if (!sectorName) {
      console.warn('[sector-properties] data-sector missing');
      return;
    }

    renderSkeletons(container, 3);

    const db = await waitForDB();
    if (!db) {
      renderEmpty(container, sectorName, fallbackSearch);
      return;
    }

    let props = [];
    try {
      props = db.filter({ barrio: sectorName, sort: 'newest' }) || [];
    } catch (err) {
      console.warn('[sector-properties] filter error', err);
    }

    if (!props.length) {
      const q = sectorName.toLowerCase();
      const all = db.filter({ sort: 'newest' }) || [];
      props = all.filter((p) => {
        const haystack = [
          p.neighborhood, p.title, p.city, (p.features || []).join(' '),
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    render(container, props, sectorName, fallbackSearch);

    if (window.AltorraFavoritos && typeof window.AltorraFavoritos.init === 'function') {
      try { window.AltorraFavoritos.init(); } catch (_) { /* ignore */ }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
