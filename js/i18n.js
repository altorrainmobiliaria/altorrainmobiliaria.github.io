(function () {
  'use strict';

  const STORAGE_KEY = 'altorra:lang';
  const DEFAULT_LANG = 'es';

  const DICT = {
    en: {
      // Nav
      'nav.home':              'Home',
      'nav.buy':               'Buy',
      'nav.rent':              'Rent',
      'nav.vacation':          'Vacation rental',
      'nav.invest':            'Invest',
      'nav.favorites':         'Favorites',
      'nav.publish':           'List property',
      'nav.contact':           'Contact',
      'nav.about':             'About us',

      // Hero / home
      'hero.badge':            '⭐ #1 Real Estate in Cartagena',
      'hero.search.placeholder': 'Neighborhood, city, type...',
      'hero.search.button':    'Search',
      'hero.cta.invest':       'Invest in Cartagena',
      'hero.cta.publish':      'List my property',

      // Property cards
      'card.viewDetails':      'View details',
      'card.whatsapp':         'WhatsApp',
      'card.beds':             'beds',
      'card.baths':            'baths',
      'card.forSale':          'For sale',
      'card.forRent':          'For rent',
      'card.vacation':         'Vacation',

      // Filters
      'filter.title':          'Filters',
      'filter.type':           'Type',
      'filter.city':           'City',
      'filter.neighborhood':   'Neighborhood',
      'filter.price':          'Price',
      'filter.beds':           'Bedrooms',
      'filter.baths':          'Bathrooms',
      'filter.area':           'Area (m²)',
      'filter.apply':          'Apply',
      'filter.clear':          'Clear',

      // Forms
      'form.name':             'Full name',
      'form.phone':            'Phone / WhatsApp',
      'form.email':            'Email',
      'form.message':          'Message',
      'form.submit':           'Send',
      'form.required':         'Required',
      'form.sending':          'Sending...',
      'form.success':          'Message sent. We will contact you soon.',

      // Common
      'common.price':          'Price',
      'common.from':           'from',
      'common.month':          'month',
      'common.night':          'night',
      'common.contact':        'Contact',
      'common.schedule':       'Schedule visit',
      'common.calculateROI':   'Calculate Airbnb ROI',
      'common.loading':        'Loading...',
      'common.noResults':      'No results',
      'common.language':       'Language',

      // Invest page
      'invest.title':          'Invest in Cartagena',
      'invest.subtitle':       'ROI analysis by zone, real success stories and investment opportunities.',
      'invest.why':            'Why invest in Cartagena?',
      'invest.roi':            'Estimated ROI by zone',
      'invest.cases':          'Investment cases',
      'invest.cta':            'Ready to invest?',

      // Vacation page
      'vacation.title':        'Convert your property into tourism income',
      'vacation.subtitle':     'We manage your property on Airbnb, Booking and direct channels.',
      'vacation.services':     'What we do for you',
      'vacation.how':          'How it works',
      'vacation.faq':          'FAQ',

      // Footer
      'footer.about':          'About',
      'footer.services':       'Services',
      'footer.legal':          'Legal',
      'footer.contact':        'Contact',
      'footer.privacy':        'Privacy policy',
      'footer.rights':         'All rights reserved.',
    }
  };

  const state = {
    lang: DEFAULT_LANG
  };

  function t(key, fallback) {
    if (state.lang === 'es') return fallback || key;
    const dict = DICT[state.lang] || {};
    return dict[key] || fallback || key;
  }

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function detectLang() {
    const stored = getStoredLang();
    if (stored === 'es' || stored === 'en') return stored;
    const nav = (navigator.language || 'es').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'es';
  }

  function applyTranslations() {
    document.documentElement.setAttribute('lang', state.lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (!el.hasAttribute('data-i18n-original')) {
        el.setAttribute('data-i18n-original', el.textContent);
      }
      const original = el.getAttribute('data-i18n-original');
      el.textContent = t(key, original);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(function (pair) {
        const parts = pair.split(':').map(function (s) { return s.trim(); });
        if (parts.length !== 2) return;
        const attrName = parts[0];
        const key = parts[1];
        const origKey = 'data-i18n-original-' + attrName;
        if (!el.hasAttribute(origKey)) {
          el.setAttribute(origKey, el.getAttribute(attrName) || '');
        }
        el.setAttribute(attrName, t(key, el.getAttribute(origKey)));
      });
    });
    updateToggleUI();
  }

  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    state.lang = lang;
    setStoredLang(lang);
    applyTranslations();
    window.dispatchEvent(new CustomEvent('altorra:lang-changed', { detail: { lang: lang } }));
  }

  function toggle() {
    setLang(state.lang === 'es' ? 'en' : 'es');
  }

  function injectCSS() {
    if (document.getElementById('i18n-css')) return;
    const s = document.createElement('style');
    s.id = 'i18n-css';
    s.textContent = `
      .lang-toggle{
        position:fixed;top:calc(var(--header-h, 72px) + 12px);right:12px;z-index:1200;
        display:inline-flex;align-items:center;gap:4px;
        background:rgba(255,255,255,.95);
        backdrop-filter:blur(8px);
        border:1px solid rgba(212,175,55,.35);
        border-radius:999px;padding:4px;
        box-shadow:0 4px 14px rgba(17,24,39,.10);
        font-family:Poppins,system-ui,sans-serif;
      }
      .lang-toggle button{
        background:transparent;border:none;
        padding:5px 11px;font-size:.8rem;font-weight:700;
        color:#6b7280;cursor:pointer;border-radius:999px;
        font-family:inherit;letter-spacing:.5px;
        transition:background .15s,color .15s;
      }
      .lang-toggle button.active{
        background:linear-gradient(135deg,#d4af37,#ffb400);
        color:#000;
      }
      .lang-toggle button:not(.active):hover{color:#d4af37}
      @media(max-width:540px){
        .lang-toggle{top:auto;bottom:90px;right:12px}
      }
    `;
    document.head.appendChild(s);
  }

  function mountToggle() {
    if (document.getElementById('altorra-lang-toggle')) return;
    injectCSS();
    const wrap = document.createElement('div');
    wrap.className = 'lang-toggle';
    wrap.id = 'altorra-lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language selector');
    wrap.innerHTML = `
      <button type="button" data-lang="es" aria-label="Español">ES</button>
      <button type="button" data-lang="en" aria-label="English">EN</button>
    `;
    wrap.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      setLang(btn.getAttribute('data-lang'));
    });
    document.body.appendChild(wrap);
    updateToggleUI();
  }

  function updateToggleUI() {
    const wrap = document.getElementById('altorra-lang-toggle');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-lang]').forEach(function (b) {
      const active = b.getAttribute('data-lang') === state.lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function init() {
    state.lang = detectLang();
    applyTranslations();
    mountToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AltorraI18n = { t: t, setLang: setLang, toggle: toggle, getLang: function () { return state.lang; } };
})();
