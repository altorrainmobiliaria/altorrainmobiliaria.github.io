/* Lazy load de todas las imágenes */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
});

/* Reseñas dinámicas (con rutas robustas) */
(function () {
  const wrap = document.getElementById('google-reviews');
  const fallback = document.getElementById('reviews-fallback');
  if (!wrap) return;

  const candidates = ['reviews.json', '/reviews.json', '../reviews.json'];

  async function loadReviews() {
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const reviews = await res.json();
        if (Array.isArray(reviews) && reviews.length) {
          if (fallback) fallback.hidden = true;
          let sample = reviews.slice();
          sample.sort(() => Math.random() - 0.5);
          sample = sample.slice(0, 3);
          wrap.innerHTML = '';
          sample.forEach(function (r) {
            const card = document.createElement('article');
            card.className = 'review-card';
            const head = document.createElement('div');
            head.className = 'review-head';
            const name = document.createElement('div');
            name.textContent = r.author;
            const stars = document.createElement('div');
            stars.className = 'review-stars';
            const rating = Math.round(parseFloat(r.rating) || 0);
            stars.textContent = '★★★★★'.slice(0, rating);
            stars.setAttribute('aria-label', rating + ' de 5');
            const time = document.createElement('div');
            time.style.marginLeft = 'auto';
            time.style.color = '#6b7280';
            time.style.fontSize = '.9rem';
            time.textContent = r.time || '';
            head.appendChild(name);
            head.appendChild(stars);
            head.appendChild(time);
            const body = document.createElement('p');
            body.className = 'review-text';
            body.textContent = r.content;
            card.appendChild(head);
            card.appendChild(body);
            wrap.appendChild(card);
          });
          return; // éxito
        }
      } catch (e) { /* intenta siguiente */ }
    }
    console.warn('No fue posible cargar reviews.json desde ninguna ruta candidata.');
  }

  loadReviews();
})();

/* Navegación (mega-menu escritorio + drawer móvil) */
function initNavigation() {
  // --- Menús de escritorio ---
  (function () {
    const buttons = document.querySelectorAll('.nav-btn[data-panel]');
    if (!buttons.length) return;

    let current = null;
    const MARGIN = 12;

    function hideImmediate(obj) {
      const panel = obj.panel, btn = obj.btn;
      panel.classList.remove('menu-visible');
      panel.style.display = 'none';
      panel.setAttribute('aria-hidden', 'true');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    function resetPanelStyles(panel) {
      panel.style.top = '';
      panel.style.left = '';
      panel.style.right = '';
      panel.style.width = '';
      panel.style.maxHeight = Math.max(260, window.innerHeight - (MARGIN * 2)) + 'px';
    }
    function placeAndShow(btn, panel, size) {
      resetPanelStyles(panel);
      panel.style.display = 'block';
      panel.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');

      const bRect = btn.getBoundingClientRect();
      if (size === 'mega') {
        panel.classList.add('panel-mega');
        panel.style.top = Math.round(bRect.bottom + 8) + 'px';
        let left = Math.round(bRect.left + bRect.width / 2 - panel.offsetWidth / 2);
        left = Math.max(MARGIN, Math.min(left, window.innerWidth - panel.offsetWidth - MARGIN));
        panel.style.left = left + 'px';
      } else {
        panel.classList.add('panel-compact');
        panel.style.top = Math.round(bRect.bottom + 8) + 'px';
        let left = Math.round(Math.min(bRect.left, window.innerWidth - panel.offsetWidth - MARGIN));
        left = Math.max(MARGIN, left);
        panel.style.left = left + 'px';
      }

      current = { panel, btn };
    }

    buttons.forEach(function (btn) {
      const id = btn.getAttribute('data-panel');
      const panel = document.getElementById(id);
      const size = btn.closest('.nav-item')?.dataset.size || 'compact';
      if (!panel) return;

      btn.addEventListener('mouseenter', () => placeAndShow(btn, panel, size));
      btn.addEventListener('focus', () => placeAndShow(btn, panel, size));
      btn.addEventListener('click', (e) => {
        if (window.innerWidth > 860) {
          e.preventDefault();
          if (panel.classList.contains('menu-visible')) {
            hideImmediate({ panel, btn });
            current = null;
          } else {
            placeAndShow(btn, panel, size);
          }
        }
      });
      panel.addEventListener('mouseleave', () => hideImmediate({ panel, btn }));
      panel.addEventListener('blur', () => hideImmediate({ panel, btn }));
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('nav') || e.target.closest('.menu-panel')) return;
      document.querySelectorAll('.menu-panel.menu-visible').forEach(function (p) {
        hideImmediate({ panel: p, btn: null });
      });
      document.querySelectorAll('.nav-btn[data-panel]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      current = null;
    });
    window.addEventListener('resize', function () {
      document.querySelectorAll('.menu-panel').forEach(function (p) {
        p.classList.remove('menu-visible');
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
        resetPanelStyles(p);
      });
      document.querySelectorAll('.nav-btn[data-panel]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      current = null;
    });
  })();

  // --- Drawer móvil ---
  (function () {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!toggle || !drawer || !backdrop) return;

    let lastFocus = null;
    const focusable = (root) =>
      root.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    function setDrawerHeight() {
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      drawer.style.height = (window.innerHeight - headerH) + 'px';
    }
    function clearDrawerHeight() {
      drawer.style.height = '';
    }

    function openDrawer() {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      setDrawerHeight();
      window.addEventListener('resize', setDrawerHeight);
      window.addEventListener('orientationchange', setDrawerHeight);
      requestAnimationFrame(function () {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        toggle.setAttribute('aria-expanded', 'true');
        const el = focusable(drawer)[0];
        if (el) el.focus();
      });
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      window.removeEventListener('resize', setDrawerHeight);
      window.removeEventListener('orientationchange', setDrawerHeight);
      setTimeout(function () {
        drawer.hidden = true;
        clearDrawerHeight();
      }, 200);
      if (lastFocus) lastFocus.focus();
    }

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
      if (e.key === 'Tab' && !drawer.hidden) {
        const els = Array.from(focusable(drawer));
        if (els.length === 0) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && !drawer.hidden) closeDrawer();
    });
  })();
}

/* Garantizamos que initNavigation se ejecute cuando el DOM (y header externo) ya están listos */
document.addEventListener('DOMContentLoaded', function () {
  try { initNavigation(); } catch (e) { /* no romper nada */ }
});
