/* =========================
   scripts.js  (site-wide)
   ========================= */

/* ---------- Util ---------- */
const isTouchLike = () =>
  window.matchMedia('(hover: none)').matches ||
  'ontouchstart' in window;

/* ---------- Init after header is present ---------- */
function onHeaderReady(cb) {
  let done = false;
  const tryRun = () => {
    if (done) return true;
    const hasHeader =
      document.querySelector('header') &&
      (document.getElementById('navToggle') ||
       document.querySelector('.nav-btn[data-panel]'));
    if (hasHeader) {
      done = true;
      cb();
      return true;
    }
    return false;
  };
  if (!tryRun()) {
    const mo = new MutationObserver(() => {
      if (tryRun()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
}

/* ==================================================
   1) Navegación: desktop menus + drawer móvil
   ================================================== */
function initNavigation() {
  /* --- Desktop dropdowns --- */
  (function () {
    const MARGIN = 12;
    let open = null;
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    const resetPanelStyles = (panel) => {
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.maxWidth = '';
      panel.style.right = '';
    };

    const hideImmediate = (obj) => {
      if (!obj) return;
      obj.btn && obj.btn.setAttribute('aria-expanded', 'false');
      obj.panel.classList.remove('menu-visible');
      obj.panel.style.display = 'none';
      obj.panel.setAttribute('aria-hidden', 'true');
      resetPanelStyles(obj.panel);
      if (open && open.panel === obj.panel) open = null;
    };

    const placeAndShow = (btn, panel, size) => {
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
    };

    document.querySelectorAll('.nav-btn[data-panel]').forEach((btn) => {
      const panelId = btn.getAttribute('data-panel');
      const panel = document.getElementById(panelId);
      if (!panel) return;
      const item = btn.closest('.nav-item');
      const size = item ? (item.dataset.size || 'compact') : 'compact';
      let openTimer = null, closeTimer = null;

      const show = () => {
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => placeAndShow(btn, panel, size), 60);
      };
      const hide = () => {
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => hideImmediate({ panel, btn }), 120);
      };

      if (supportsHover) {
        btn.addEventListener('pointerenter', show);
        btn.addEventListener('pointerleave', hide);
        panel.addEventListener('pointerenter', () => {
          clearTimeout(closeTimer);
          clearTimeout(openTimer);
        });
        panel.addEventListener('pointerleave', hide);
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
      document.querySelectorAll('.menu-panel.menu-visible')
        .forEach((p) => hideImmediate({ panel: p, btn: null }));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.menu-panel.menu-visible')
          .forEach((p) => hideImmediate({ panel: p, btn: null }));
      }
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.menu-panel').forEach((p) => {
        p.classList.remove('menu-visible');
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
        resetPanelStyles(p);
      });
      document.querySelectorAll('.nav-btn[data-panel]')
        .forEach((b) => b.setAttribute('aria-expanded', 'false'));
      open = null;
    });
  })();

  /* --- Drawer móvil --- */
  (function () {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!toggle || !drawer || !backdrop) return;

    let lastFocus = null;

    const focusable = (root) =>
      root.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    const setDrawerHeight = () => {
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      drawer.style.height = (window.innerHeight - headerH) + 'px';
    };
    const clearDrawerHeight = () => { drawer.style.height = ''; };

    function openDrawer() {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      setDrawerHeight();
      window.addEventListener('resize', setDrawerHeight);
      window.addEventListener('orientationchange', setDrawerHeight);
      requestAnimationFrame(() => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        toggle.setAttribute('aria-expanded', 'true');
        const el = focusable(drawer)[0];
        el && el.focus();
      });
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      clearDrawerHeight();
      window.removeEventListener('resize', setDrawerHeight);
      window.removeEventListener('orientationchange', setDrawerHeight);
      setTimeout(() => {
        drawer.hidden = true;
        lastFocus && lastFocus.focus();
      }, 200);
    }

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
      if (e.key === 'Tab' && !drawer.hidden) {
        const els = Array.from(focusable(drawer));
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });

    // Cerrar drawer al tocar un enlace y quitar recuadro azul (iOS/Android)
    drawer.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (isTouchLike()) setTimeout(() => link.blur(), 40);
      closeDrawer();
    });

    // Inyectar fix CSS (móviles) por si la página no cargó style.css aún
    (function injectFocusRingFix() {
      if (!isTouchLike()) return;
      if (document.getElementById('drawer-focus-fix')) return;
      const style = document.createElement('style');
      style.id = 'drawer-focus-fix';
      style.textContent = `
@media (hover: none) {
  .drawer a:focus,
  .drawer a:focus-visible,
  .drawer a:active,
  .drawer button:focus,
  .drawer button:focus-visible,
  .drawer button:active { outline: none !important; box-shadow: none !important; }
  .drawer a, .drawer button { -webkit-tap-highlight-color: transparent; }
}`;
      document.head.appendChild(style);

      drawer.addEventListener('pointerup', (ev) => {
        const el = ev.target && ev.target.closest && ev.target.closest('a,button');
        if (!el) return;
        setTimeout(() => el.blur && el.blur(), 0);
      }, { passive: true });
    })();
  })();
}

/* Arrancar navegación cuando el header ya esté inyectado */
onHeaderReady(initNavigation);

/* ==================================================
   2) Carruseles (flechas)
   ================================================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.arrow').forEach((btn) => {
      const targetId = btn.dataset.target;
      const root = document.getElementById(targetId);
      if (!root) return;
      btn.addEventListener('click', () => {
        const card = root.querySelector('.card');
        if (!card) return;
        const gap = parseFloat(getComputedStyle(root).gap) || 12;
        const step = card.getBoundingClientRect().width + gap;
        const dir = btn.classList.contains('left') ? -1 : 1;
        root.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  });
})();

/* ==================================================
   3) Buscador rápido del hero
   ================================================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quickSearch');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const op = document.getElementById('op')?.value || 'comprar';
      const type = document.getElementById('f-type')?.value || '';
      const city = encodeURIComponent(document.getElementById('f-city')?.value || '');
      const min = document.getElementById('f-min')?.value || '';
      const max = document.getElementById('f-max')?.value || '';
      const map = { comprar:'propiedades-comprar.html', arrendar:'propiedades-arrendar.html', alojar:'propiedades-alojamientos.html' };
      const dest = map[op] || 'propiedades-comprar.html';
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (type) params.set('type', type);
      if (min) params.set('min', min);
      if (max) params.set('max', max);
      const query = params.toString();
      window.location.href = dest + (query ? '?' + query : '');
    });
  });
})();

/* ==================================================
   4) Lazy loading img
   ================================================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  });
})();

/* ==================================================
   5) Reseñas (si existe reviews.json)
   ================================================== */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const wrap = document.getElementById('google-reviews');
    if (!wrap) return;
    fetch('reviews.json')
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then((reviews) => {
        if (!Array.isArray(reviews) || !reviews.length) return;
        let sample = reviews.slice();
        sample.sort(() => Math.random() - 0.5);
        sample = sample.slice(0, 3);
        wrap.innerHTML = '';
        sample.forEach((r) => {
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
      })
      .catch(() => {});
  });
})();

/* ==================================================
   6) Propiedades del home desde properties/data.json
   ================================================== */
(function () {
  function formatCOP(n) {
    if (!n && n !== 0) return '';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])
    );
  }
  function buildCardElement(p, mode) {
    const article = document.createElement('article');
    article.className = 'card';
    article.setAttribute('role', 'listitem');

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = escapeHtml(p.title || 'Propiedad');
    const raw = p.image || p.img || p.img_url || p.imgUrl || p.photo;
    if (raw) img.src = raw.startsWith('/') ? raw : '/' + raw;
    else img.src = 'https://i.postimg.cc/0yYb8Y6r/placeholder.png';

    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('h3');
    title.innerHTML = escapeHtml(p.title || 'Sin título');

    const specs = document.createElement('div');
    specs.style.color = 'var(--muted)';
    const parts = [];
    if (p.beds) parts.push(p.beds + 'H');
    if (p.baths) parts.push(p.baths + 'B');
    if (p.sqm) parts.push(p.sqm + ' m²');
    specs.textContent = parts.join(' · ');

    const priceRow = document.createElement('div');
    priceRow.style.marginTop = '8px';
    priceRow.style.fontWeight = '800';
    priceRow.style.color = 'var(--gold)';
    let priceLabel = '';
    if (p.price) {
      if (mode === 'arriendo') priceLabel = '$' + formatCOP(p.price) + ' COP / mes';
      else if (mode === 'dias') priceLabel = '$' + formatCOP(p.price) + ' COP / noche';
      else priceLabel = '$' + formatCOP(p.price) + ' COP';
    }
    priceRow.textContent = priceLabel;

    body.appendChild(title);
    body.appendChild(specs);
    body.appendChild(priceRow);

    article.appendChild(img);
    article.appendChild(body);
    article.addEventListener('click', function () {
      const id = p.id || '';
      window.location.href = 'detalle-propiedad.html?id=' + encodeURIComponent(id);
    });
    return article;
  }

  async function loadPropsByOperation(operation) {
    try {
      const res = await fetch('properties/data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      return data.filter((item) => String(item.operation).toLowerCase() === String(operation).toLowerCase());
    } catch {
      return [];
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const pages = [
      { operation: 'comprar', targetId: 'carouselVenta', mode: 'venta' },
      { operation: 'arrendar', targetId: 'carouselArriendo', mode: 'arriendo' },
      { operation: 'dias', targetId: 'carouselDias', mode: 'dias' }
    ];
    if (!pages.some((p) => document.getElementById(p.targetId))) return;

    const results = await Promise.all(
      pages.map((pg) => loadPropsByOperation(pg.operation).then((arr) => ({ arr, pg })))
    );

    results.forEach((result) => {
      const pg = result.pg;
      const target = document.getElementById(pg.targetId);
      if (!target) return;

      target.innerHTML = '';
      const arr = result.arr || [];
      if (!arr.length) {
        const note = document.createElement('div');
        note.style.padding = '12px';
        note.style.color = 'var(--muted)';
        note.textContent = 'Sin propiedades para mostrar.';
        target.appendChild(note);
        return;
      }
      const max = 8;
      arr.slice(0, max).forEach((p) => {
        const card = buildCardElement(p, pg.mode);
        target.appendChild(card);
      });
    });
  });
})();

/* ==================================================
   7) Service Worker
   ================================================== */
(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
})();
