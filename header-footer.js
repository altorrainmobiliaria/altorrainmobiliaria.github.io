// header-footer.js
// Inserta header/footer y gestiona la navegación sin mostrar el borde azul en móvil.
(() => {
  const HEADER_URL = 'header.html';
  const FOOTER_URL = 'footer.html';

  // Parche visual: eliminar focus ring / tap highlight en el drawer móvil y botón Menú
  const patchCSS = `
    #navToggle, .drawer a { -webkit-tap-highlight-color: transparent; }
    #navToggle:focus, #navToggle:focus-visible { outline: none !important; box-shadow: none !important; }
    .drawer a:focus, .drawer a:focus-visible, .drawer a:active { outline: none !important; box-shadow: none !important; }
    .drawer a::-moz-focus-inner{ border:0 !important; }
  `;
  const styleTag = document.createElement('style');
  styleTag.setAttribute('data-altorra', 'focus-patch');
  styleTag.textContent = patchCSS;
  document.head.appendChild(styleTag);

  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  function ensurePlaceholder(id, position /* 'start' | 'end' */) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      if (position === 'start') {
        document.body.insertBefore(el, document.body.firstChild || null);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  async function inject(url, placeholderId, position) {
    const ph = ensurePlaceholder(placeholderId, position);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      ph.innerHTML = await res.text();
      return ph;
    } catch (e) {
      console.warn(`[header-footer] No se pudo cargar ${url}:`, e);
      return ph;
    }
  }

  function initNavigation() {
    if (window.__ALTORRA_NAV_INIT__) return;
    window.__ALTORRA_NAV_INIT__ = true;

    // ===== Menús (desktop) =====
    const MARGIN = 12;
    let open = null;
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    function resetPanelStyles(panel) {
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.maxWidth = '';
    }
    function hideImmediate(obj) {
      if (!obj) return;
      try { obj.btn && obj.btn.setAttribute('aria-expanded', 'false'); } catch(_) {}
      obj.panel.classList.remove('menu-visible');
      obj.panel.style.display = 'none';
      obj.panel.setAttribute('aria-hidden', 'true');
      resetPanelStyles(obj.panel);
      if (open && open.panel === obj.panel) open = null;
    }
    function placeAndShow(btn, panel, size) {
      if (window.innerWidth <= 860) return;
      if (open && open.panel !== panel) hideImmediate(open);

      resetPanelStyles(panel);
      panel.style.display = 'block';
      panel.style.visibility = 'hidden';
      panel.style.position = 'fixed';
      panel.style.maxHeight = Math.max(260, window.innerHeight - (MARGIN * 2)) + 'px';

      if (size === 'mega') {
        panel.style.width = Math.min(920, window.innerWidth - (MARGIN * 2)) + 'px';
      } else {
        panel.style.width = 'auto';
        panel.style.maxWidth = Math.min(520, window.innerWidth - (MARGIN * 2)) + 'px';
      }

      const preRect = panel.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();

      let left;
      if (size === 'mega') {
        left = Math.round(bRect.left + bRect.width / 2 - preRect.width / 2);
        left = Math.max(MARGIN, Math.min(left, window.innerWidth - preRect.width - MARGIN));
      } else {
        left = Math.round(Math.min(bRect.left, window.innerWidth - preRect.width - MARGIN));
        left = Math.max(left, MARGIN);
      }

      let top = Math.round(bRect.bottom + 8);
      if (top + preRect.height > window.innerHeight - MARGIN) {
        top = Math.round(bRect.top - preRect.height - 8);
        if (top < MARGIN) top = MARGIN;
      }

      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.visibility = 'visible';
      panel.classList.add('menu-visible');
      panel.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      open = { panel, btn };
    }

    document.querySelectorAll('.nav-btn[data-panel]').forEach((btn) => {
      const panelId = btn.getAttribute('data-panel');
      const panel = document.getElementById(panelId);
      const item = btn.closest('.nav-item');
      const size = item ? (item.dataset.size || 'compact') : 'compact';
      let openTimer = null, closeTimer = null;

      const show = () => { clearTimeout(closeTimer); openTimer = setTimeout(() => placeAndShow(btn, panel, size), 60); };
      const hide = () => { clearTimeout(openTimer); closeTimer = setTimeout(() => hideImmediate({ panel, btn }), 100); };

      if (supportsHover) {
        btn.addEventListener('pointerenter', show, { passive: true });
        btn.addEventListener('pointerleave', hide, { passive: true });
        panel.addEventListener('pointerenter', () => { clearTimeout(closeTimer); clearTimeout(openTimer); }, { passive: true });
        panel.addEventListener('pointerleave', hide, { passive: true });
      }

      btn.addEventListener('click', (e) => {
        if (window.innerWidth > 860) {
          e.preventDefault();
          if (panel.classList.contains('menu-visible')) hideImmediate({ panel, btn });
          else placeAndShow(btn, panel, size);
        }
      });

      btn.addEventListener('focus', show);
      btn.addEventListener('blur', () => setTimeout(() => {
        if (!panel.contains(document.activeElement)) hide();
      }, 60));
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('nav') || e.target.closest('.menu-panel')) return;
      document.querySelectorAll('.menu-panel.menu-visible').forEach((p) => hideImmediate({ panel: p, btn: null }));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.menu-panel.menu-visible').forEach((p) => hideImmediate({ panel: p, btn: null }));
      }
    });
    window.addEventListener('resize', () => {
      document.querySelectorAll('.menu-panel').forEach((p) => {
        p.classList.remove('menu-visible');
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
        resetPanelStyles(p);
      });
      document.querySelectorAll('.nav-btn[data-panel]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      open = null;
    });

    // ===== Drawer (móvil) =====
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!toggle || !drawer || !backdrop) return;

    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;

    function setDrawerHeight() {
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      drawer.style.height = (window.innerHeight - headerH) + 'px';
    }
    function openDrawer() {
      drawer.hidden = false;
      setDrawerHeight();
      window.addEventListener('resize', setDrawerHeight);

      requestAnimationFrame(() => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        toggle.setAttribute('aria-expanded', 'true');

        // ⚠️ No enfoques nada en dispositivos táctiles (evita el recuadro azul).
        if (!isTouch) {
          const el = drawer.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
          el && el.focus();
        } else {
          // Asegúrate de que ningún elemento mantenga el foco
          try { document.activeElement && document.activeElement.blur(); } catch(_) {}
        }
      });
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      window.removeEventListener('resize', setDrawerHeight);
      setTimeout(() => { drawer.hidden = true; }, 180);
      // No devolver foco al botón para que no dibuje ring en iOS
      try { document.activeElement && document.activeElement.blur(); } catch(_) {}
    }

    toggle.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  }

  ready(async () => {
    await inject(HEADER_URL, 'header-placeholder', 'start');
    initNavigation();
    await inject(FOOTER_URL, 'footer-placeholder', 'end');
  });
})();
