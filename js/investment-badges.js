(function () {
  'use strict';

  const ZONE_DATA = {
    'bocagrande':       { roi: [9, 14],  ocu: [65, 80], label: 'Alto ROI' },
    'castillogrande':   { roi: [8, 12],  ocu: [60, 75], label: 'Alto ROI' },
    'manga':            { roi: [7, 10],  ocu: [55, 70], label: 'ROI medio' },
    'centro':           { roi: [10, 16], ocu: [70, 85], label: 'Alto ROI' },
    'centro historico': { roi: [10, 16], ocu: [70, 85], label: 'Alto ROI' },
    'getsemani':        { roi: [10, 14], ocu: [65, 80], label: 'Alto ROI' },
    'la boquilla':      { roi: [8, 11],  ocu: [50, 65], label: 'ROI medio' },
    'boquilla':         { roi: [8, 11],  ocu: [50, 65], label: 'ROI medio' },
    'baru':             { roi: [12, 18], ocu: [45, 70], label: 'Alto ROI' },
    'barú':             { roi: [12, 18], ocu: [45, 70], label: 'Alto ROI' },
    'crespo':           { roi: [7, 10],  ocu: [55, 68], label: 'ROI medio' },
    'marbella':         { roi: [7, 10],  ocu: [58, 70], label: 'ROI medio' },
  };

  function normalizeZone(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function getZoneData(p) {
    const keys = [p.neighborhood, p.barrio, p.city, p.ciudad];
    for (const k of keys) {
      const z = ZONE_DATA[normalizeZone(k)];
      if (z) return z;
    }
    return null;
  }

  function isInvestmentSuitable(p) {
    const op = String(p.operation || p.operacion || '').toLowerCase();
    if (op !== 'comprar') return false;
    const type = String(p.type || p.tipo || '').toLowerCase();
    if (type === 'lote' || type === 'bodega') return false;
    return !!getZoneData(p);
  }

  function getBadgesHTML(p) {
    if (!isInvestmentSuitable(p)) return '';
    const z = getZoneData(p);
    if (!z) return '';
    const roiAvg = Math.round((z.roi[0] + z.roi[1]) / 2);
    const ocuAvg = Math.round((z.ocu[0] + z.ocu[1]) / 2);
    return `
      <span class="ib-badge ib-roi" title="ROI Airbnb estimado">📈 ROI ~${roiAvg}%</span>
      <span class="ib-badge ib-ocu" title="Ocupación Airbnb estimada">🏖️ ${ocuAvg}% ocup.</span>
    `;
  }

  function injectCSS() {
    if (document.getElementById('ib-css')) return;
    const s = document.createElement('style');
    s.id = 'ib-css';
    s.textContent = `
      .ib-badge{
        display:inline-flex;align-items:center;gap:4px;
        padding:4px 10px;border-radius:999px;
        font-size:.72rem;font-weight:700;letter-spacing:.2px;
        box-shadow:0 2px 8px rgba(17,24,39,.12);
        backdrop-filter:blur(6px);
        line-height:1;
      }
      .ib-roi{
        background:linear-gradient(135deg,rgba(212,175,55,.95),rgba(255,180,0,.95));
        color:#000;
      }
      .ib-ocu{
        background:rgba(255,255,255,.92);
        color:#111827;
        border:1px solid rgba(212,175,55,.4);
      }
      .card .badges .ib-badge{margin-top:2px}
    `;
    document.head.appendChild(s);
  }

  function inject() {
    injectCSS();
    document.querySelectorAll('.card[data-id]').forEach(function (card) {
      if (card.querySelector('.ib-badge')) return;
      const id = card.getAttribute('data-id');
      const prop = findProperty(id);
      if (!prop) return;
      const html = getBadgesHTML(prop);
      if (!html) return;
      const badges = card.querySelector('.badges');
      if (badges) badges.insertAdjacentHTML('beforeend', html);
    });
  }

  function findProperty(id) {
    if (!window.propertyDB) return null;
    if (typeof window.propertyDB.getPropertyById === 'function') {
      return window.propertyDB.getPropertyById(id);
    }
    if (Array.isArray(window.propertyDB.properties)) {
      return window.propertyDB.properties.find(function (x) { return String(x.id) === String(id); });
    }
    return null;
  }

  function init() {
    injectCSS();
    setTimeout(inject, 300);

    const observer = new MutationObserver(function (muts) {
      for (const m of muts) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && (node.matches?.('.card[data-id]') || node.querySelector?.('.card[data-id]'))) {
            inject();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('altorra:db-ready', inject);
    window.addEventListener('altorra:db-refreshed', inject);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AltorraInvestmentBadges = { getBadgesHTML: getBadgesHTML, inject: inject };
})();
