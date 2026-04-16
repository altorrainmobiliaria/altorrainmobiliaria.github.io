/* Altorra — Carga de header/footer + navegación accesible + mejoras UX
 *
 * Fase C (2026-04-15):
 *   - Cache localStorage eliminado → fetch con cache HTTP del navegador
 *     (el header ya no queda desactualizado tras un deploy)
 *   - Scroll-aware: header gana shadow/intensidad al hacer scroll
 *   - Active-link: resalta el ítem del nav según la URL actual
 *   - Purga one-shot de claves legacy `altorra:fragment:*` en localStorage
 */
(function () {
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  /* ===== Purga one-shot de caché legacy (Fase C) ===== */
  try {
    const LEGACY_PREFIX = 'altorra:fragment:';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) localStorage.removeItem(k);
    }
  } catch { /* storage no disponible, no crítico */ }

  /* ===== Inyección simple con cache HTTP del navegador ===== */
  function setHTML(host, html, after) {
    host.innerHTML = html;
    if (typeof after === 'function') {
      try { after(); } catch (e) { console.warn('[Altorra] init post-inyección falló:', e); }
    }
  }

  function inject(id, url, after) {
    const host = document.getElementById(id);
    if (!host) return;
    fetch(url, { cache: 'default' })  // usa HTTP cache del navegador
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(html => setHTML(host, html, after))
      .catch(e => console.warn('[Altorra] No se pudo cargar', url, e));
  }

  /* ===== Scroll-aware header ===== */
  function initScrollAware() {
    const header = document.querySelector('header');
    if (!header) return;

    const heroEl = document.querySelector('.hero');
    const threshold = heroEl ? 80 : 8;

    // Si hay hero, arranca con efecto glass (translúcido + blur)
    if (heroEl) header.classList.add('header-glass');

    let ticking = false;
    const update = () => {
      const past = window.scrollY > threshold;
      header.classList.toggle('scrolled', past);
      if (heroEl) header.classList.toggle('header-glass', !past);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  /* ===== Active-link: resalta el ítem del nav según URL ===== */
  function initActiveLink() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    // Mapa URL → panel-id / href del botón activo
    const propiedades = ['propiedades-comprar.html', 'propiedades-arrendar.html',
                         'propiedades-alojamientos.html', 'detalle-propiedad.html'];
    const servicios   = ['servicios-mantenimiento.html', 'servicios-mudanzas.html', 'turismo-inmobiliario.html'];

    let activeSelector = null;
    if (propiedades.includes(path))          activeSelector = '[data-panel="panel-propiedades"]';
    else if (servicios.includes(path))       activeSelector = '[data-panel="panel-servicios"]';
    else if (path === 'quienes-somos.html')  activeSelector = '.nav-btn[href="quienes-somos.html"]';
    else if (path === 'contacto.html')       activeSelector = '.nav-btn[href="contacto.html"]';

    if (!activeSelector) return;
    const el = document.querySelector(activeSelector);
    if (el) el.classList.add('is-active');
  }

  /* ===== Navegación (paneles desktop + drawer móvil) ===== */
  function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    /* --- Desktop: menús con paneles --- */
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
      let left = Math.round(b.left + (b.width / 2) - (w / 2));
      left = Math.max(12, Math.min(left, window.innerWidth - w - 12));

      const h = panel.offsetHeight || 200;
      let top = Math.round(b.bottom + 8);
      if (top + h > window.innerHeight - 12) {
        top = Math.round(b.top - h - 8);
        if (top < 12) top = 12;
      }

      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.visibility = 'visible';
      btn.setAttribute('aria-expanded', 'true');
      open = { panel, btn };
    }

    function scheduleHide(panel, btn) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => hideNow(panel, btn), 120);
    }

    function setupDesktopMenus() {
      const items = header.querySelectorAll('.nav-item');
      items.forEach(item => {
        const btn = item.querySelector('.nav-btn[data-panel]');
        if (!btn) return;
        const panel = getPanel(btn);
        ['mouseenter', 'focusin'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
        });
        ['mouseleave', 'focusout'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) hideNow(open.panel, open.btn);
      });
      document.addEventListener('click', (e) => {
        if (!open) return;
        const insidePanel = open.panel.contains(e.target);
        const insideBtn = open.btn.contains(e.target);
        if (!insidePanel && !insideBtn) hideNow(open.panel, open.btn);
      });

      window.addEventListener('resize', () => {
        if (open && isDesktop()) place(open.btn, open.panel);
        if (open && !isDesktop()) hideNow(open.panel, open.btn);
      });
    }

    /* --- Móvil: drawer con backdrop y focus trap --- */
    const toggle   = document.getElementById('navToggle');
    const drawer   = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');

    function isOpen() { return drawer && drawer.classList.contains('open'); }

    function openDrawer() {
      if (!drawer) return;
      drawer.removeAttribute('hidden');
      drawer.classList.add('open');
      toggle && toggle.setAttribute('aria-expanded', 'true');

      if (backdrop) {
        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';

      const firstLink = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      drawer.setAttribute('hidden', '');
      toggle && toggle.setAttribute('aria-expanded', 'false');

      if (backdrop) {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
      toggle && toggle.focus({ preventScroll: true });
    }

    if (toggle && drawer) {
      toggle.addEventListener('click', () => { isOpen() ? closeDrawer() : openDrawer(); });
      backdrop && backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeDrawer(); });

      drawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      });

      window.addEventListener('resize', () => { if (window.innerWidth > 860 && isOpen()) closeDrawer(); });
    }

    setupDesktopMenus();
    initScrollAware();
    initActiveLink();
  }

  /* ===== Inicio ===== */
  document.addEventListener('DOMContentLoaded', function () {
    inject('header-placeholder', 'header.html', initHeader);
    inject('footer-placeholder', 'footer.html', null);
  });
})();
