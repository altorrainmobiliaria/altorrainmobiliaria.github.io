/**
 * analytics.js — Analytics con Firebase Analytics + fallback localStorage
 * Altorra Inmobiliaria
 *
 * Estrategia dual:
 *   1. Si Firebase Analytics está disponible (window.firebaseAnalytics):
 *      envía eventos con logEvent() de GA4.
 *   2. Siempre también guarda en localStorage (buffer local) para:
 *      - El dashboard de admin (estadísticas del dispositivo actual)
 *      - Funcionar sin conexión / sin Firebase
 *
 * Eventos que se rastrean automáticamente:
 *   page_view, property_view, whatsapp_click, external_click,
 *   search, favorite_added, favorite_removed, time_on_page,
 *   contact_form_submit, filter_applied
 *
 * API pública: window.AltorraAnalytics
 */

(function () {
  'use strict';

  /* ─── Config ───────────────────────────────────────────── */
  const LS_KEY    = 'altorra:analytics';
  const SESS_KEY  = 'altorra:session';
  const MAX_LS    = 500;   // máximo de eventos en localStorage

  /* ─── ID de sesión anónimo (no identifica al usuario) ──── */
  function getSessionId() {
    let id = sessionStorage.getItem(SESS_KEY);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(SESS_KEY, id);
    }
    return id;
  }

  /* ─── Firebase Analytics (lazy) ────────────────────────── */
  async function fbLogEvent(name, params = {}) {
    try {
      if (!window.firebaseAnalytics) return;
      const { logEvent } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js');
      logEvent(window.firebaseAnalytics, name, params);
    } catch { /* no crítico */ }
  }

  /* ─── localStorage buffer ───────────────────────────────── */
  function lsPush(event) {
    try {
      const events = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      events.push(event);
      while (events.length > MAX_LS) events.shift();
      localStorage.setItem(LS_KEY, JSON.stringify(events));
    } catch { /* cuota excedida — silencioso */ }
  }

  /* ─── track() — función principal ──────────────────────── */
  function track(eventName, properties = {}) {
    const event = {
      name:       eventName,
      properties,
      session:    getSessionId(),
      path:       window.location.pathname,
      timestamp:  Date.now(),
    };

    // 1. Buffer local (siempre)
    lsPush(event);

    // 2. Firebase Analytics (asíncrono, si disponible)
    fbLogEvent(eventName, {
      page_path: window.location.pathname,
      page_title: document.title,
      ...properties,
    });
  }

  /* ─── Estadísticas del buffer local ────────────────────── */
  function getStats() {
    try {
      const events = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      const stats  = {
        totalEvents:    events.length,
        pageViews:      {},
        topProperties:  {},
        searchTerms:    {},
        whatsappClicks: 0,
        favoritesAdded: 0,
      };

      events.forEach(ev => {
        if (ev.name === 'page_view') {
          stats.pageViews[ev.path] = (stats.pageViews[ev.path] || 0) + 1;
        }
        if (ev.name === 'property_view' && ev.properties?.id) {
          const id = ev.properties.id;
          stats.topProperties[id] = (stats.topProperties[id] || 0) + 1;
        }
        if (ev.name === 'search' && ev.properties?.query) {
          const q = ev.properties.query.toLowerCase().trim();
          if (q) stats.searchTerms[q] = (stats.searchTerms[q] || 0) + 1;
        }
        if (ev.name === 'whatsapp_click')  stats.whatsappClicks++;
        if (ev.name === 'favorite_added')  stats.favoritesAdded++;
      });

      return stats;
    } catch (err) {
      return { error: err.message };
    }
  }

  /* ─── Auto-tracking ─────────────────────────────────────── */
  function initAutoTracking() {
    // Page view
    track('page_view', {
      referrer:    document.referrer,
      page_title:  document.title,
    });

    // Clicks en WhatsApp
    document.addEventListener('click', (e) => {
      if (e.target.closest('a[href*="wa.me"]')) {
        track('whatsapp_click', { page: window.location.pathname });
      }
    });

    // Clicks en enlaces externos
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a?.href && !a.href.includes(window.location.hostname) && !a.href.startsWith('tel:') && !a.href.startsWith('mailto:')) {
        track('external_click', { url: a.href, text: (a.textContent || '').trim().slice(0, 60) });
      }
    });

    // Tiempo en página
    const _startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const duration = Math.round((Date.now() - _startTime) / 1000);
      if (duration > 2) {
        track('time_on_page', { duration_seconds: duration, page: window.location.pathname });
      }
    });

    // Enviar page_view a Firebase cuando Analytics esté listo (puede llegar tarde)
    window.addEventListener('altorra:firebase-full-ready', () => {
      fbLogEvent('page_view', {
        page_path:  window.location.pathname,
        page_title: document.title,
        page_referrer: document.referrer,
      });
    }, { once: true });
  }

  /* ─── Helpers para módulos externos ────────────────────── */
  function trackPropertyView(id, title, operacion) {
    track('property_view', { id, title: (title || '').slice(0, 80), operacion });
  }

  function trackSearch(query, resultsCount) {
    track('search', { query: (query || '').slice(0, 100), results_count: resultsCount });
  }

  function trackFilterApplied(filters) {
    track('filter_applied', filters);
  }

  function trackFormSubmit(formType, origen) {
    track('contact_form_submit', { form_type: formType, origen });
  }

  function trackFavorite(action, propId) {
    track(action === 'add' ? 'favorite_added' : 'favorite_removed', { prop_id: propId });
  }

  /* ─── API pública ───────────────────────────────────────── */
  window.AltorraAnalytics = {
    track,
    getStats,
    trackPropertyView,
    trackSearch,
    trackFilterApplied,
    trackFormSubmit,
    trackFavorite,
    enable:  () => {},   // compatible con API anterior
    disable: () => {},
    clear:   () => { localStorage.removeItem(LS_KEY); },
  };

  /* ─── Bootstrap ─────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoTracking);
  } else {
    initAutoTracking();
  }

})();
