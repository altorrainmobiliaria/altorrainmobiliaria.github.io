/**
 * featured-week-banner.js — Banner carrusel de destacadas de la semana
 * Altorra Inmobiliaria
 *
 * Patrón: Altorra Cars featured-week-banner.js (carrusel)
 *
 * Lógica de selección (en orden de prioridad):
 *   1. Propiedad con mayor `prioridad` (0-100) del catálogo
 *   2. Si empate, prefiere `featured: true`
 *   3. Si empate, la más reciente (createdAt más alto)
 *   → Se toman las TOP 3 para el carrusel
 *
 * Controles:
 *   - Rotación automática cada 6s (pausa al hover/focus)
 *   - Flechas prev/next (#fw-prev / #fw-next)
 *   - Dots indicadores (#fw-dots)
 *   - aria-live en #fw-live
 *
 * API pública: window.FeaturedBanner.init(selector)
 */
(function () {
  'use strict';

  const ROTATE_MS = 6000;
  const MAX_SLIDES = 3;
  const CACHE_KEY = 'altorra:featured-banner';

  const state = { slides: [], idx: 0, timer: null, paused: false, container: null };

  /* ─── Selección ──────────────────────────────────────────── */
  function selectFeatured(properties) {
    if (!properties?.length) return [];
    const available = properties.filter(p =>
      p.available !== false && p.disponible !== false
    );
    if (!available.length) return [];
    const sorted = [...available].sort((a, b) => {
      const pa = a.prioridad || a.highlightScore || 0;
      const pb = b.prioridad || b.highlightScore || 0;
      if (pb !== pa) return pb - pa;
      const fa = a.featured ? 1 : 0;
      const fb = b.featured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      const da = a.added || a.createdAt?.toMillis?.() || 0;
      const db = b.added || b.createdAt?.toMillis?.() || 0;
      return db - da;
    });
    return sorted
      .filter(p => (p.prioridad || p.highlightScore || 0) > 0 || p.featured)
      .slice(0, MAX_SLIDES);
  }

  /* ─── Formateo ──────────────────────────────────────────── */
  function formatCOP(n) {
    if (!n) return '';
    if (n >= 1_000_000_000) return '$ ' + (n / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
    if (n >= 1_000_000)     return '$ ' + (n / 1_000_000).toFixed(0) + 'M';
    return '$ ' + new Intl.NumberFormat('es-CO').format(n);
  }
  function esc(s){ return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c])); }

  /* ─── Render de slide ───────────────────────────────────── */
  function slideHtml(prop) {
    const id    = prop.id || prop._docId || '';
    const href  = 'detalle-propiedad.html?id=' + encodeURIComponent(id);
    const img   = prop.image || prop.imagen || '';
    const title = prop.title || prop.titulo || 'Propiedad destacada';
    const city  = prop.city  || prop.ciudad || '';
    const barrio = prop.neighborhood || prop.barrio || '';
    const price = formatCOP(prop.price || prop.precio);
    const op    = prop.operation || prop.operacion || '';
    const opLabels = { comprar: 'En venta', arrendar: 'En arriendo', dias: 'Por días' };

    const specs = [];
    const beds  = prop.beds  || prop.habitaciones || 0;
    const baths = prop.baths || prop.banos        || 0;
    const sqm   = prop.sqm   || 0;
    if (beds)  specs.push(beds + ' hab.');
    if (baths) specs.push(baths + ' baños');
    if (sqm)   specs.push(sqm + ' m²');

    return (
      '<a class="fw-slide" href="' + href + '" aria-label="' + esc(title) + '">' +
        '<div class="fw-media">' +
          (img
            ? '<img src="' + esc(img) + '" alt="' + esc(title) + '" loading="lazy" decoding="async">'
            : '<div class="fw-media-ph"></div>') +
          '<span class="fw-badge">⭐ Destacada de la semana</span>' +
          (op ? '<span class="fw-op">' + esc(opLabels[op] || op) + '</span>' : '') +
        '</div>' +
        '<div class="fw-body">' +
          ((city || barrio) ? '<p class="fw-loc">' + esc([city, barrio].filter(Boolean).join(' · ')) + '</p>' : '') +
          '<h3 class="fw-title">' + esc(title) + '</h3>' +
          (specs.length ? '<p class="fw-specs">' + esc(specs.join(' · ')) + '</p>' : '') +
          (price ? '<p class="fw-price">' + esc(price) + '</p>' : '') +
          '<span class="fw-cta">Ver propiedad →</span>' +
        '</div>' +
      '</a>'
    );
  }

  /* ─── Shell del carrusel (solo 1 vez por container) ──── */
  function ensureShell(container) {
    if (container.querySelector('#fw-banner')) return;
    container.innerHTML =
      '<div id="fw-banner" class="fw-banner" role="region" aria-label="Carrusel de propiedades destacadas">' +
        '<button type="button" id="fw-prev" class="fw-nav fw-prev" aria-label="Destacada anterior">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' +
        '<div class="fw-viewport">' +
          '<div id="fw-track" class="fw-track"></div>' +
        '</div>' +
        '<button type="button" id="fw-next" class="fw-nav fw-next" aria-label="Destacada siguiente">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
        '<div id="fw-dots" class="fw-dots" role="tablist" aria-label="Ir a destacada"></div>' +
        '<div id="fw-live" class="visually-hidden" aria-live="polite"></div>' +
      '</div>';
  }

  /* ─── Estilos inline (una sola vez) ──────────────────── */
  function injectStyles() {
    if (document.getElementById('fw-styles')) return;
    const s = document.createElement('style');
    s.id = 'fw-styles';
    s.textContent =
      '.fw-banner{position:relative;max-width:var(--page-max,1200px);margin:0 auto}' +
      '.fw-viewport{overflow:hidden;border-radius:20px;border:1px solid rgba(212,175,55,.25);box-shadow:0 8px 32px rgba(212,175,55,.12);background:#fff}' +
      '.fw-track{display:flex;transition:transform .5s cubic-bezier(.22,.61,.36,1);will-change:transform}' +
      '.fw-slide{flex:0 0 100%;display:flex;text-decoration:none;color:inherit;min-height:240px}' +
      '.fw-media{position:relative;width:45%;flex-shrink:0;background:#f3f4f6;overflow:hidden}' +
      '.fw-media img{width:100%;height:100%;object-fit:cover;display:block}' +
      '.fw-media-ph{width:100%;height:100%;min-height:220px;background:linear-gradient(135deg,#f9f5e7,#ede8d5)}' +
      '.fw-badge{position:absolute;top:12px;left:12px;background:var(--gold,#d4af37);color:#111;font-size:.75rem;font-weight:800;padding:4px 10px;border-radius:999px}' +
      '.fw-op{position:absolute;bottom:12px;left:12px;background:rgba(0,0,0,.7);color:#fff;font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:999px}' +
      '.fw-body{flex:1;padding:28px 32px;display:flex;flex-direction:column;justify-content:center;gap:6px}' +
      '.fw-loc{font-size:.82rem;color:var(--muted,#6b7280);margin:0}' +
      '.fw-title{font-size:1.3rem;font-weight:800;color:var(--text,#111827);margin:0}' +
      '.fw-specs{font-size:.9rem;color:var(--muted,#6b7280);margin:0}' +
      '.fw-price{font-size:1.6rem;font-weight:800;color:var(--gold,#d4af37);margin:4px 0}' +
      '.fw-cta{display:inline-block;align-self:flex-start;margin-top:8px;padding:10px 22px;border-radius:12px;background:linear-gradient(90deg,var(--accent,#ffb400),#ffd95e);color:#111;font-weight:800;font-size:.95rem;transition:transform .15s ease,box-shadow .15s ease}' +
      '.fw-slide:hover .fw-cta{transform:translateY(-2px);box-shadow:0 8px 20px rgba(212,175,55,.25)}' +
      '.fw-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:999px;background:#fff;border:0;box-shadow:0 8px 22px rgba(0,0,0,.14);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#111;z-index:2;transition:transform .15s ease,box-shadow .15s ease}' +
      '.fw-nav:hover{transform:translateY(-50%) scale(1.06);box-shadow:0 12px 28px rgba(0,0,0,.18)}' +
      '.fw-prev{left:-10px}.fw-next{right:-10px}' +
      '.fw-dots{display:flex;gap:8px;justify-content:center;margin-top:14px}' +
      '.fw-dot{width:8px;height:8px;border-radius:999px;background:rgba(212,175,55,.35);border:0;padding:0;cursor:pointer;transition:background .2s ease,transform .2s ease}' +
      '.fw-dot.is-active{background:var(--gold,#d4af37);transform:scale(1.25)}' +
      '.fw-dot:hover{background:var(--gold,#d4af37)}' +
      '@media (max-width:640px){.fw-slide{flex-direction:column;min-height:0}.fw-media{width:100%;height:200px}.fw-body{padding:20px}.fw-price{font-size:1.3rem}.fw-prev{left:6px}.fw-next{right:6px}}';
    document.head.appendChild(s);
  }

  /* ─── Render del carrusel ───────────────────────────── */
  function render() {
    const container = state.container;
    if (!container) return;
    const section = container.closest('section');

    if (!state.slides.length) {
      try { localStorage.removeItem(CACHE_KEY); } catch {}
      if (section) section.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    if (section) section.style.display = '';
    ensureShell(container);

    const track = document.getElementById('fw-track');
    const prev  = document.getElementById('fw-prev');
    const next  = document.getElementById('fw-next');
    const dots  = document.getElementById('fw-dots');

    track.innerHTML = state.slides.map(slideHtml).join('');

    if (dots) {
      dots.innerHTML = state.slides.map((_, i) =>
        '<button type="button" class="fw-dot" role="tab" data-idx="' + i + '" aria-label="Ir a destacada ' + (i + 1) + '"></button>'
      ).join('');
      dots.querySelectorAll('.fw-dot').forEach(btn => {
        btn.addEventListener('click', () => { setSlide(parseInt(btn.dataset.idx, 10)); restart(); });
      });
    }

    const single = state.slides.length <= 1;
    if (prev) prev.hidden = single;
    if (next) next.hidden = single;
    if (dots) dots.hidden = single;

    setSlide(0);

    // Cache del top-id (solo para debug/telemetría)
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ids: state.slides.map(p => p.id),
        ts:  Date.now(),
      }));
    } catch {}
  }

  function setSlide(i) {
    if (!state.slides.length) return;
    state.idx = (i + state.slides.length) % state.slides.length;
    const track = document.getElementById('fw-track');
    if (track) track.style.transform = 'translateX(' + (-state.idx * 100) + '%)';
    const dots = document.getElementById('fw-dots');
    if (dots) {
      dots.querySelectorAll('.fw-dot').forEach((d, j) => {
        d.classList.toggle('is-active', j === state.idx);
        d.setAttribute('aria-selected', j === state.idx ? 'true' : 'false');
      });
    }
    const live = document.getElementById('fw-live');
    const p = state.slides[state.idx];
    if (live && p) live.textContent = 'Mostrando: ' + (p.title || p.titulo || 'propiedad destacada');
  }

  function tick() { if (!state.paused) setSlide(state.idx + 1); }
  function start() { stop(); if (state.slides.length > 1) state.timer = setInterval(tick, ROTATE_MS); }
  function stop()  { if (state.timer) { clearInterval(state.timer); state.timer = null; } }
  function restart() { start(); }

  function wireControls() {
    const banner = document.getElementById('fw-banner');
    const prev   = document.getElementById('fw-prev');
    const next   = document.getElementById('fw-next');
    if (!banner) return;
    if (prev && !prev.dataset.bound) {
      prev.dataset.bound = '1';
      prev.addEventListener('click', () => { setSlide(state.idx - 1); restart(); });
    }
    if (next && !next.dataset.bound) {
      next.dataset.bound = '1';
      next.addEventListener('click', () => { setSlide(state.idx + 1); restart(); });
    }
    if (!banner.dataset.bound) {
      banner.dataset.bound = '1';
      banner.addEventListener('mouseenter', () => { state.paused = true; });
      banner.addEventListener('mouseleave', () => { state.paused = false; });
      banner.addEventListener('focusin',  () => { state.paused = true; });
      banner.addEventListener('focusout', () => { state.paused = false; });
    }
  }

  /* ─── Wait DB + refresh ─────────────────────────────── */
  function getDB() {
    return new Promise(resolve => {
      if (window.propertyDB?.isLoaded) return resolve(window.propertyDB);
      window.addEventListener('altorra:db-ready', () => resolve(window.propertyDB), { once: true });
      setTimeout(() => resolve(window.propertyDB || null), 10000);
    });
  }

  function refreshFromDB() {
    const db = window.propertyDB;
    if (!db || !db.isLoaded) return;
    const all = db.getRanked ? db.getRanked() : (db.properties || []);
    state.slides = selectFeatured(all);
    render();
    wireControls();
    start();
  }

  /* ─── Init público ──────────────────────────────────── */
  async function init(selector) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!container) return;
    state.container = container;

    injectStyles();
    try {
      const db = await getDB();
      if (!db) { container.style.display = 'none'; return; }
      refreshFromDB();

      const onRefresh = () => refreshFromDB();
      window.addEventListener('altorra:db-refreshed', onRefresh);
      window.addEventListener('altorra:cache-invalidated', onRefresh);
    } catch (err) {
      console.warn('[FeaturedBanner] Error:', err);
      container.style.display = 'none';
    }
  }

  window.FeaturedBanner = {
    init,
    selectFeatured,
    clearCache: () => { try { localStorage.removeItem(CACHE_KEY); } catch {} },
  };
})();
