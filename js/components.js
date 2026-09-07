/**
 * components.js — Altorra Inmobiliaria
 * Inyección dinámica de header, footer y modals.
 * Reemplaza header-footer.js con el patrón de Altorra Cars.
 *
 * Diferencias vs header-footer.js:
 *   - Sin caché localStorage para fragmentos HTML
 *     (el navegador gestiona HTTP Cache-Control)
 *   - Carga modals dinámicamente desde snippets/modals.html
 *   - API pública window.AltorraComponents
 *
 * Uso en HTML:
 *   <script src="js/components.js" defer></script>
 *   (reemplaza <script src="header-footer.js">)
 */

(function () {
  'use strict';

  if (window.__altorraComponentsInit__) return;
  window.__altorraComponentsInit__ = true;

  // ── Carga de un fragmento HTML en un placeholder ─────────────────────────
  async function loadComponent(placeholderId, url) {
    const host = document.getElementById(placeholderId);
    if (!host) return false;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      host.innerHTML = await res.text();
      return true;
    } catch (err) {
      console.warn('[Components] No se pudo cargar', url, err.message);
      return false;
    }
  }

  // ── Carga assets CSS/JS dinámicos ─────────────────────────────────────────
  function loadAsset(src, type = 'script') {
    return new Promise((resolve) => {
      if (type === 'style') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = src;
        link.onload  = resolve;
        link.onerror = resolve;
        document.head.appendChild(link);
      } else {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src   = src;
        s.defer = true;
        s.onload  = resolve;
        s.onerror = resolve;
        document.body.appendChild(s);
      }
    });
  }

  // ── Navegación: menús desktop + drawer móvil ──────────────────────────────
  // (Lógica idéntica a header-footer.js para mantener el mismo comportamiento)
  function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const isDesktop = () => window.innerWidth > 860;
    let open = null, hideTimer = null;

    function getPanel(btn) {
      const id = btn.getAttribute('data-panel');
      return id ? document.getElementById(id) : null;
    }

    function hideNow(panel, btn) {
      if (!panel) return;
      panel.classList.remove('menu-visible');
      panel.setAttribute('aria-hidden', 'true');
      panel.style.visibility = 'hidden';
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (open && open.panel === panel) open = null;
    }

    function place(btn, panel) {
      if (!btn || !panel) return;
      if (open && open.panel !== panel) hideNow(open.panel, open.btn);
      clearTimeout(hideTimer);

      const b = btn.getBoundingClientRect();
      panel.style.visibility = 'hidden';
      panel.classList.add('menu-visible');
      panel.setAttribute('aria-hidden', 'false');

      const w = panel.offsetWidth || 320;
      let left = Math.round(b.left + b.width / 2 - w / 2);
      left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
      const h = panel.offsetHeight || 200;
      let top = Math.round(b.bottom + 8);
      if (top + h > window.innerHeight - 12) {
        top = Math.round(b.top - h - 8);
        if (top < 12) top = 12;
      }

      panel.style.left = left + 'px';
      panel.style.top  = top + 'px';
      panel.style.visibility = 'visible';
      btn.setAttribute('aria-expanded', 'true');
      open = { panel, btn };
    }

    function scheduleHide(panel, btn) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => hideNow(panel, btn), 120);
    }

    function setupDesktopMenus() {
      header.querySelectorAll('.nav-item').forEach(item => {
        const btn   = item.querySelector('.nav-btn[data-panel]');
        if (!btn) return;
        const panel = getPanel(btn);
        ['mouseenter', 'focusin'].forEach(ev => {
          btn.addEventListener(ev,   () => { if (isDesktop()) place(btn, panel); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
        });
        ['mouseleave', 'focusout'].forEach(ev => {
          btn.addEventListener(ev,   () => { if (isDesktop()) scheduleHide(panel, btn); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) hideNow(open.panel, open.btn);
      });
      document.addEventListener('click', (e) => {
        if (!open) return;
        if (!open.panel.contains(e.target) && !open.btn.contains(e.target)) {
          hideNow(open.panel, open.btn);
        }
      });
      window.addEventListener('resize', () => {
        if (open && isDesktop())  place(open.btn, open.panel);
        if (open && !isDesktop()) hideNow(open.panel, open.btn);
      });
    }

    // Drawer móvil
    const toggle   = document.getElementById('navToggle');
    const drawer   = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');

    const isOpen = () => drawer && drawer.classList.contains('open');

    function openDrawer() {
      if (!drawer) return;
      drawer.removeAttribute('hidden');
      drawer.classList.add('open');
      toggle && toggle.setAttribute('aria-expanded', 'true');
      if (backdrop) { backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden', 'false'); }
      document.body.style.overflow = 'hidden';
      const first = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      if (first) first.focus({ preventScroll: true });
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      drawer.setAttribute('hidden', '');
      toggle && toggle.setAttribute('aria-expanded', 'false');
      if (backdrop) { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); }
      document.body.style.overflow = '';
      toggle && toggle.focus({ preventScroll: true });
    }

    if (toggle && drawer) {
      toggle.addEventListener('click', () => isOpen() ? closeDrawer() : openDrawer());
      backdrop && backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeDrawer(); });
      drawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const foc = drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!foc.length) return;
        const first = foc[0], last = foc[foc.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      });
      window.addEventListener('resize', () => { if (window.innerWidth > 860 && isOpen()) closeDrawer(); });
    }

    setupDesktopMenus();

    // Marcar página activa en el nav
    const current = window.location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('a[href]').forEach(a => {
      if (a.getAttribute('href') === current) a.setAttribute('aria-current', 'page');
    });
  }

  // ── Detect base path for subdirectory pages (e.g. blog/) ───────────────
  function getBasePath() {
    const s = document.querySelector('script[src*="components.js"]');
    if (s) {
      const src = s.getAttribute('src') || '';
      const idx = src.lastIndexOf('js/components.js');
      if (idx > 0) return src.slice(0, idx);
    }
    return '';
  }

  // ── Función principal de carga ─────────────────────────────────────────────
  async function loadAllComponents() {
    const base = getBasePath();
    // 1. Header + footer en paralelo
    const [headerOk] = await Promise.all([
      loadComponent('header-placeholder', base + 'header.html'),
      loadComponent('footer-placeholder', base + 'footer.html'),
    ]);

    // 2. Inicializar navegación tras inyectar el header
    if (headerOk) initHeader();

    // 3. Modals: cargar solo si no están ya en el DOM
    //    (snippets/modals.html existirá a partir de Etapa 2)
    if (!document.querySelector('#contacto-modal')) {
      const modalsContainer = document.getElementById('modals-container');
      if (modalsContainer) {
        // Intentar cargar — si no existe el archivo aún, falla silenciosamente
        fetch(base + 'snippets/modals.html')
          .then(r => r.ok ? r.text() : Promise.reject())
          .then(html => {
            modalsContainer.innerHTML = html;
            loadAsset(base + 'js/contact-forms.js');
          })
          .catch(() => { /* modals aún no creados — OK */ });
      }
    }

    window.dispatchEvent(new CustomEvent('altorra:components-ready'));
  }

  // ── Arranque ───────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
  } else {
    loadAllComponents();
  }

  // ── API pública ────────────────────────────────────────────────────────────
  window.AltorraComponents = { loadComponent, loadAsset, initHeader };

  console.log('[AltorraComponents] Módulo cargado ✅');
})();
