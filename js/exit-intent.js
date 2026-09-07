(function () {
  'use strict';

  var SHOWN_KEY = 'altorra:exitShown';
  var DISMISS_KEY = 'altorra:exitDismissed';
  var MOBILE_DELAY = 45000;

  function wasShown() {
    return sessionStorage.getItem(SHOWN_KEY) === '1';
  }

  function wasDismissedRecently() {
    try {
      var ts = parseInt(localStorage.getItem(DISMISS_KEY), 10);
      if (!ts) return false;
      return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
    } catch (_) { return false; }
  }

  function markShown() {
    sessionStorage.setItem(SHOWN_KEY, '1');
  }

  function markDismissed() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (_) {}
  }

  function isContactOrThanks() {
    var p = location.pathname;
    return p.indexOf('contacto') !== -1 || p.indexOf('gracias') !== -1 || p.indexOf('admin') !== -1;
  }

  function buildPopup() {
    var overlay = document.createElement('div');
    overlay.id = 'exit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Oferta especial');
    overlay.innerHTML =
      '<div class="exit-card">' +
        '<button class="exit-close" aria-label="Cerrar">&times;</button>' +
        '<div class="exit-icon">📘</div>' +
        '<h2 class="exit-title">Antes de irte...</h2>' +
        '<p class="exit-sub">Descarga gratis la <strong>Guía del Inversionista 2026</strong> — ROI por zona, proceso legal y tributación en Cartagena.</p>' +
        '<form class="exit-form" id="exitForm">' +
          '<input type="email" name="email" placeholder="Tu correo electrónico" required autocomplete="email" aria-label="Email"/>' +
          '<button type="submit" class="exit-btn">Descargar guía gratis</button>' +
        '</form>' +
        '<p class="exit-alt">O <a href="guia-inversionista-2026.html">léela directamente aquí</a></p>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#exit-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:exitFadeIn .25s ease}' +
      '@keyframes exitFadeIn{from{opacity:0}to{opacity:1}}' +
      '.exit-card{background:#fff;border-radius:20px;padding:32px 28px;max-width:420px;width:100%;text-align:center;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.18);animation:exitSlideUp .3s ease}' +
      '@keyframes exitSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '.exit-close{position:absolute;top:12px;right:14px;background:none;border:0;font-size:1.6rem;cursor:pointer;color:#6b7280;line-height:1;padding:4px 8px;border-radius:8px}' +
      '.exit-close:hover{background:rgba(0,0,0,.06)}' +
      '.exit-icon{font-size:2.4rem;margin-bottom:10px}' +
      '.exit-title{font-size:1.3rem;font-weight:800;margin:0 0 8px;color:#111827}' +
      '.exit-sub{font-size:.92rem;color:#6b7280;line-height:1.5;margin:0 0 18px}' +
      '.exit-sub strong{color:#111827}' +
      '.exit-form{display:flex;gap:8px}' +
      '.exit-form input{flex:1;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .2s}' +
      '.exit-form input:focus{border-color:#d4af37}' +
      '.exit-btn{padding:11px 18px;border:0;border-radius:10px;background:linear-gradient(90deg,#ffb400,#ffd95e);color:#111;font-weight:700;font-size:.92rem;cursor:pointer;white-space:nowrap;transition:transform .15s}' +
      '.exit-btn:hover{transform:translateY(-1px)}' +
      '.exit-alt{font-size:.8rem;color:#9ca3af;margin:12px 0 0}' +
      '.exit-alt a{color:#d4af37;font-weight:600}' +
      '@media(max-width:480px){.exit-form{flex-direction:column}.exit-card{padding:24px 20px}}' +
      '@media(prefers-reduced-motion:reduce){#exit-overlay,.exit-card{animation:none}}';

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function close() {
      markShown();
      markDismissed();
      overlay.remove();
      style.remove();
    }

    overlay.querySelector('.exit-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });

    var form = document.getElementById('exitForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[name="email"]').value;
      if (window.AltorraNewsletter) {
        window.AltorraNewsletter.subscribe(email, { operacion: null })
          .then(function () {
            form.innerHTML = '<p style="color:#10b981;font-weight:700;font-size:.95rem">Listo — revisa tu correo.</p>';
            setTimeout(close, 2500);
          })
          .catch(function () {
            window.location.href = 'guia-inversionista-2026.html';
          });
      } else {
        window.location.href = 'guia-inversionista-2026.html';
      }
    });

    markShown();
    overlay.querySelector('input').focus();
  }

  function show() {
    if (wasShown() || wasDismissedRecently() || isContactOrThanks()) return;
    buildPopup();
  }

  if (typeof document === 'undefined') return;

  var isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile) {
    setTimeout(function () { show(); }, MOBILE_DELAY);
  } else {
    document.addEventListener('mouseout', function handler(e) {
      if (e.clientY > 5) return;
      show();
      document.removeEventListener('mouseout', handler);
    });
  }
})();
