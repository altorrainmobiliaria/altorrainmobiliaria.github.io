/* Altorra — Carga y cacheo de header/footer + inicialización de navegación accesible */
(function () {
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  /* ===== Config de caché (ajusta cuando cambie header/footer) ===== */
  const CACHE_VERSION = '2025-09-07.1';          // 🔁 Súbela si editas header.html o footer.html
  const TTL_MS = 1000 * 60 * 60 * 24 * 7;        // 7 días (puedes cambiarlo)
  const LS_PREFIX = 'altorra:fragment:';

  function cacheKey(url) { return `${LS_PREFIX}${url}::${CACHE_VERSION}`; }

  function readCache(url) {
    try {
      const raw = localStorage.getItem(cacheKey(url));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.html || !obj.t) return null;
      if (Date.now() - obj.t > TTL_MS) return null;
      return obj.html;
    } catch {
      return null;
    }
  }

  function writeCache(url, html) {
    try {
      const payload = JSON.stringify({ html, t: Date.now() });
      localStorage.setItem(cacheKey(url), payload);
    } catch {
      // Si localStorage falla (cuota/privado), no bloquea la UI
    }
  }

  function setHTML(host, html, after) {
    host.innerHTML = html;
    if (typeof after === 'function') {
      // Vuelve a enlazar eventos porque el DOM es nuevo
      try { after(); } catch (e) { console.warn('init después de inyección falló:', e); }
    }
  }

  /* Inyecta con caché + revalidación background */
  function inject(id, url, after) {
    const host = document.getElementById(id);
    if (!host) return;

    const cached = readCache(url);
    if (cached) {
      setHTML(host, cached, after);
      // Revalida en segundo plano para no bloquear el LCP
      fetch(url, { cache: 'no-cache' })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {
          if (html && html !== cached) {
            writeCache(url, html);
            setHTML(host, html, after); // Reinyecta y re-enlaza eventos
          }
        })
        .catch(() => { /* silencio */ });
    } else {
      // Primera carga: fetch normal y luego cachea
      fetch(url, { cache: 'no-cache' })
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(html => {
          writeCache(url, html);
          setHTML(host, html, after);
        })
        .catch(e => console.warn('No se pudo cargar', url, e));
    }
  }

  /* ===== Navegación (misma UI, sin cambios de diseño) ===== */
  function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    /* --- Desktop: menús con paneles --- */
    const isDesktop = () => window.innerWidth > 860;
    const panels = document.querySelectorAll('.menu-panel');
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
      const pre = panel;
      pre.style.visibility = 'hidden';
      pre.classList.add('menu-visible');
      pre.setAttribute('aria-hidden', 'false');

      // Medimos para colocar al lado del botón
      const w = pre.offsetWidth || 320;
      let left = Math.round(b.left + (b.width / 2) - (w / 2));
      left = Math.max(12, Math.min(left, window.innerWidth - w - 12));

      // Por debajo si cabe, si no, por encima
      const h = pre.offsetHeight || 200;
      let top = Math.round(b.bottom + 8);
      if (top + h > window.innerHeight - 12) {
        top = Math.round(b.top - h - 8);
        if (top < 12) top = 12;
      }

      pre.style.left = left + 'px';
      pre.style.top = top + 'px';
      pre.style.visibility = 'visible';
      btn.setAttribute('aria-expanded', 'true');
      open = { panel: pre, btn };
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
        // Hover/Focus
        ['mouseenter', 'focusin'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) place(btn, panel); });
        });
        // Salida
        ['mouseleave', 'focusout'].forEach(ev => {
          btn.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
          if (panel) panel.addEventListener(ev, () => { if (isDesktop()) scheduleHide(panel, btn); });
        });
      });

      // Escape y click fuera
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) {
          hideNow(open.panel, open.btn);
        }
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
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');

    function isOpen() { return drawer && !drawer.hasAttribute('hidden'); }
    function openDrawer() {
      if (!drawer) return;
      drawer.removeAttribute('hidden');
      drawer.setAttribute('aria-modal', 'true');
      toggle && toggle.setAttribute('aria-expanded', 'true');
      backdrop && backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // focus primer link
      const firstLink = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }
    function closeDrawer() {
      if (!drawer) return;
      drawer.setAttribute('hidden', '');
      drawer.setAttribute('aria-modal', 'true');
      toggle && toggle.setAttribute('aria-expanded', 'false');
      backdrop && backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggle && toggle.focus({ preventScroll: true });
    }

    if (toggle && drawer) {
      toggle.addEventListener('click', () => { isOpen() ? closeDrawer() : openDrawer(); });
      backdrop && backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeDrawer(); });

      // Trap de foco simple
      drawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      });

      // Si el viewport pasa a desktop con el drawer abierto, ciérralo
      window.addEventListener('resize', () => { if (isDesktop() && isOpen()) closeDrawer(); });
    }

    // Inicialización de menús desktop
    setupDesktopMenus();
  }

  /* ===== Inicio ===== */
  document.addEventListener('DOMContentLoaded', function () {
    inject('header-placeholder', 'header.html', initHeader);
    inject('footer-placeholder', 'footer.html', null);
  });
})();
