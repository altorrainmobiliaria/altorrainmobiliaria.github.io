/**
 * featured-week-banner.js — Banner de propiedad destacada de la semana
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars featured-week-banner.js
 *
 * Lógica de selección (en orden de prioridad):
 *   1. Propiedad con mayor `prioridad` (0-100) del catálogo
 *   2. Si empate, prefiere `featured: true`
 *   3. Si empate, la más reciente (createdAt más alto)
 *
 * Renderiza una tarjeta destacada dentro del selector indicado.
 * Se rota semanalmeante (la semana ISO determina cuál mostrar).
 *
 * API pública: window.FeaturedBanner
 */

(function () {
  'use strict';

  const CACHE_KEY = 'altorra:featured-banner';
  const CACHE_TTL = 60 * 60 * 1000; // 1 hora

  /* ─── Semana ISO actual ──────────────────────────────────── */
  function isoWeek(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return d.getUTCFullYear() + '-W' + Math.ceil((((d - yearStart) / 86400000) + 1) / 7).toString().padStart(2, '0');
  }

  /* ─── Selección de propiedad ─────────────────────────────── */
  function selectFeatured(properties) {
    if (!properties?.length) return null;

    const available = properties.filter(p =>
      p.available !== false && p.disponible !== false
    );
    if (!available.length) return null;

    // Ordenar: prioridad desc → featured desc → addedAt/createdAt desc
    return [...available].sort((a, b) => {
      const pa = a.prioridad || a.highlightScore || 0;
      const pb = b.prioridad || b.highlightScore || 0;
      if (pb !== pa) return pb - pa;
      const fa = a.featured ? 1 : 0;
      const fb = b.featured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      const da = a.added || (a.createdAt?.toMillis?.() || 0);
      const db = b.added || (b.createdAt?.toMillis?.() || 0);
      return db - da;
    })[0];
  }

  /* ─── Formatear precio ──────────────────────────────────── */
  function formatCOP(n) {
    if (!n) return '';
    if (n >= 1_000_000_000) return '$ ' + (n / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
    if (n >= 1_000_000)     return '$ ' + (n / 1_000_000).toFixed(0) + 'M';
    return '$ ' + new Intl.NumberFormat('es-CO').format(n);
  }

  /* ─── Renderizar banner ─────────────────────────────────── */
  function renderBanner(container, prop) {
    if (!container || !prop) return;

    const id      = prop.id || prop._docId || '';
    const href    = `detalle-propiedad.html?id=${encodeURIComponent(id)}`;
    const imgSrc  = prop.image || prop.imagen || '';
    const title   = prop.title || prop.titulo || 'Propiedad destacada';
    const city    = prop.city  || prop.ciudad || '';
    const barrio  = prop.neighborhood || prop.barrio || '';
    const precio  = formatCOP(prop.price || prop.precio);
    const op      = prop.operation || prop.operacion || '';

    const specs = [];
    const beds  = prop.beds  || prop.habitaciones || 0;
    const baths = prop.baths || prop.banos        || 0;
    const sqm   = prop.sqm   || 0;
    if (beds)  specs.push(`${beds} hab.`);
    if (baths) specs.push(`${baths} baños`);
    if (sqm)   specs.push(`${sqm} m²`);

    const opLabels = { comprar: 'En venta', arrendar: 'En arriendo', dias: 'Por días' };

    container.innerHTML = `
      <article class="featured-banner" aria-label="Propiedad destacada de la semana">
        <div class="featured-banner__img">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${title}" loading="lazy" decoding="async"/>`
            : `<div class="featured-banner__img-ph"></div>`}
          <span class="featured-banner__badge">⭐ Destacada de la semana</span>
          ${op ? `<span class="featured-banner__op-badge">${opLabels[op] || op}</span>` : ''}
        </div>
        <div class="featured-banner__info">
          <p class="featured-banner__loc">${[city, barrio].filter(Boolean).join(' · ')}</p>
          <h3 class="featured-banner__title">${title}</h3>
          ${specs.length ? `<p class="featured-banner__specs">${specs.join(' · ')}</p>` : ''}
          ${precio ? `<p class="featured-banner__price">${precio}</p>` : ''}
          <a class="featured-banner__cta" href="${href}">Ver propiedad →</a>
        </div>
      </article>`;

    injectStyles();
  }

  /* ─── Estilos ───────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('featured-banner-styles')) return;
    const s = document.createElement('style');
    s.id = 'featured-banner-styles';
    s.textContent = `
      .featured-banner {
        display: flex;
        gap: 0;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(212,175,55,.25);
        box-shadow: 0 8px 32px rgba(212,175,55,.12);
        background: #fff;
        max-width: var(--page-max, 1200px);
        margin: 0 auto;
        min-height: 220px;
      }
      .featured-banner__img {
        position: relative;
        width: 45%;
        flex-shrink: 0;
        background: #f3f4f6;
        overflow: hidden;
      }
      .featured-banner__img img {
        width: 100%; height: 100%; object-fit: cover; display: block;
      }
      .featured-banner__img-ph {
        width: 100%; height: 100%; min-height: 200px;
        background: linear-gradient(135deg, #f9f5e7, #ede8d5);
      }
      .featured-banner__badge {
        position: absolute; top: 12px; left: 12px;
        background: var(--gold, #d4af37); color: #111;
        font-size: .75rem; font-weight: 800;
        padding: 4px 10px; border-radius: 999px;
      }
      .featured-banner__op-badge {
        position: absolute; bottom: 12px; left: 12px;
        background: rgba(0,0,0,.7); color: #fff;
        font-size: .75rem; font-weight: 700;
        padding: 3px 10px; border-radius: 999px;
      }
      .featured-banner__info {
        flex: 1;
        padding: 28px 32px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
      }
      .featured-banner__loc   { font-size: .82rem; color: var(--muted, #6b7280); margin: 0; }
      .featured-banner__title { font-size: 1.3rem; font-weight: 800; color: var(--text, #111827); margin: 0; }
      .featured-banner__specs { font-size: .9rem; color: var(--muted, #6b7280); margin: 0; }
      .featured-banner__price { font-size: 1.6rem; font-weight: 800; color: var(--gold, #d4af37); margin: 4px 0; }
      .featured-banner__cta {
        display: inline-block; align-self: flex-start; margin-top: 8px;
        padding: 10px 22px; border-radius: 12px;
        background: linear-gradient(90deg, var(--accent, #ffb400), #ffd95e);
        color: #111; font-weight: 800; text-decoration: none; font-size: .95rem;
        transition: transform .15s ease, box-shadow .15s ease;
      }
      .featured-banner__cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212,175,55,.25); }
      @media (max-width: 640px) {
        .featured-banner { flex-direction: column; }
        .featured-banner__img { width: 100%; height: 200px; }
        .featured-banner__info { padding: 20px; }
        .featured-banner__price { font-size: 1.3rem; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── Inicializar en un contenedor ──────────────────────── */
  async function init(selector) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!container) return;

    // Cache por 1 hora (evitar re-renderizar en cada scroll/refresh)
    const cached = (() => {
      try {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (c.week === isoWeek() && c.prop && Date.now() - c.ts < CACHE_TTL) return c.prop;
      } catch { /* ignore */ }
      return null;
    })();

    if (cached) { renderBanner(container, cached); return; }

    // Obtener propiedad desde propertyDB o esperar
    const getDB = () => new Promise(resolve => {
      if (window.propertyDB?.isLoaded) return resolve(window.propertyDB);
      window.addEventListener('altorra:db-ready', () => resolve(window.propertyDB), { once: true });
    });

    try {
      const db   = await getDB();
      const all  = db.getRanked ? db.getRanked() : (db._data || []);
      const prop = selectFeatured(all);

      if (!prop) { container.style.display = 'none'; return; }

      // Guardar en cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ week: isoWeek(), prop, ts: Date.now() }));
      } catch { /* ignore */ }

      renderBanner(container, prop);
    } catch (err) {
      console.warn('[FeaturedBanner] Error:', err);
      container.style.display = 'none';
    }
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.FeaturedBanner = { init, renderBanner, selectFeatured, clearCache: () => localStorage.removeItem(CACHE_KEY) };

})();
