/**
 * firestore-meter.js — Altorra Inmobiliaria
 * Contador local de lecturas Firestore para monitorear el tier gratuito
 * (50.000 lecturas/día).
 *
 * IMPORTANTE: esta medición es LOCAL, por navegador y sesión. NO suma
 * entre dispositivos. Es una señal cualitativa para detectar spikes —
 * la fuente de verdad sigue siendo Firebase Console.
 *
 * API pública (window.AltorraMeter):
 *   AltorraMeter.add(n, source?)   → suma n lecturas al día actual
 *   AltorraMeter.today()           → número de lecturas hoy (local)
 *   AltorraMeter.last7Days()       → [{date, reads}] últimos 7 días
 *   AltorraMeter.reset()           → borra todas las claves del meter
 *   AltorraMeter.renderWidget(id)  → pinta widget en el contenedor
 *
 * Eventos emitidos en window:
 *   altorra:reads-updated  → cada vez que se suma → {today, added, source}
 *
 * Almacenamiento:
 *   localStorage, clave `altorra:reads:YYYY-MM-DD`
 *   Auto-purga de claves con más de 7 días al cargar.
 */

(function () {
  'use strict';

  const PREFIX           = 'altorra:reads:';
  const KEEP_DAYS        = 7;
  const TIER_DAILY_LIMIT = 50000;   // Firestore tier gratuito / Blaze sin costo

  function dateKey(d = new Date()) {
    // ISO YYYY-MM-DD en hora local del navegador
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function readNum(key) {
    try {
      const v = parseInt(localStorage.getItem(key), 10);
      return Number.isFinite(v) ? v : 0;
    } catch (_) { return 0; }
  }

  function writeNum(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (_) {}
  }

  function add(n = 1, source = '') {
    if (!Number.isFinite(n) || n <= 0) return 0;
    const key  = PREFIX + dateKey();
    const next = readNum(key) + n;
    writeNum(key, next);
    try {
      window.dispatchEvent(new CustomEvent('altorra:reads-updated', {
        detail: { today: next, added: n, source }
      }));
    } catch (_) {}
    return next;
  }

  function today() {
    return readNum(PREFIX + dateKey());
  }

  function last7Days() {
    const out = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = dateKey(d);
      out.push({ date: iso, reads: readNum(PREFIX + iso) });
    }
    return out;
  }

  function reset() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch (_) {}
  }

  // Auto-purga claves con más de KEEP_DAYS días
  function cleanup() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
      const cutoffKey = dateKey(cutoff);
      const toDel = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(PREFIX)) continue;
        const ds = k.slice(PREFIX.length);
        if (ds < cutoffKey) toDel.push(k);
      }
      toDel.forEach(k => localStorage.removeItem(k));
    } catch (_) {}
  }

  /* ─── Widget DOM ────────────────────────────────────────── */

  function thresholdClass(reads) {
    const pct = reads / TIER_DAILY_LIMIT;
    if (pct >= 0.9)  return 'meter--red';
    if (pct >= 0.6)  return 'meter--amber';
    return 'meter--green';
  }

  function formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function renderWidget(containerId) {
    const root = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    if (!root) return;

    const paint = () => {
      const t    = today();
      const pct  = Math.min(100, Math.round((t / TIER_DAILY_LIMIT) * 100));
      const cls  = thresholdClass(t);
      const days = last7Days();
      const max  = Math.max(1, ...days.map(d => d.reads));

      root.innerHTML = `
        <div class="admin-card meter-card ${cls}">
          <div class="admin-card-header">
            <h2>Consumo Firestore <small style="font-weight:400;color:var(--muted,#6b7280)">— solo esta sesión</small></h2>
          </div>
          <div class="admin-card-body">
            <div class="meter-number">
              <strong>${formatNum(t)}</strong>
              <span class="meter-of">/ ${formatNum(TIER_DAILY_LIMIT)} lecturas hoy (${pct}%)</span>
            </div>
            <div class="meter-bar" role="progressbar"
                 aria-valuenow="${t}" aria-valuemin="0" aria-valuemax="${TIER_DAILY_LIMIT}">
              <div class="meter-bar-fill" style="width:${pct}%"></div>
            </div>
            <table class="meter-table" aria-label="Lecturas últimos 7 días">
              <thead><tr><th>Día</th><th>Lecturas</th><th>Tendencia</th></tr></thead>
              <tbody>
                ${days.map(d => {
                  const w = Math.round((d.reads / max) * 100);
                  const isToday = d.date === dateKey();
                  return `<tr${isToday ? ' class="today"' : ''}>
                    <td>${d.date}${isToday ? ' <em>(hoy)</em>' : ''}</td>
                    <td>${formatNum(d.reads)}</td>
                    <td><div class="meter-spark" style="width:${w}%"></div></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
            <p class="meter-disclaimer">
              Medición local del navegador actual. No suma entre dispositivos ni usuarios.
              La fuente oficial es Firebase Console → Usage &amp; Billing.
            </p>
          </div>
        </div>
      `;
    };

    paint();

    // Refresco en vivo cuando se suman lecturas
    if (!root.dataset.meterBound) {
      root.dataset.meterBound = '1';
      window.addEventListener('altorra:reads-updated', () => {
        // Repinta solo si el widget sigue en DOM
        if (document.body.contains(root)) paint();
      });
    }
  }

  cleanup();

  window.AltorraMeter = {
    add,
    today,
    last7Days,
    reset,
    renderWidget,
    TIER_DAILY_LIMIT,
  };

  try {
    console.log(`[AltorraMeter] Cargado ✅ (lecturas hoy: ${today()})`);
  } catch (_) {}
})();
