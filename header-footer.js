/* header-footer.js */
/* Carga header/footer externos y habilita la navegación (desktop + móvil) */
(function () {
  function initNavigation() {
    // ===== Desktop: paneles (hover/focus/click) =====
    (function () {
      const MARGIN = 12;
      let open = null;
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      function reset(panel) {
        panel.style.left = panel.style.top = panel.style.width = panel.style.right = '';
      }
      function hide(obj) {
        if (!obj) return;
        obj.btn && obj.btn.setAttribute('aria-expanded', 'false');
        obj.panel.classList.remove('menu-visible');
        obj.panel.style.display = 'none';
        obj.panel.setAttribute('aria-hidden', 'true');
        reset(obj.panel);
        if (open && open.panel === obj.panel) open = null;
      }
      function placeAndShow(btn, panel, size) {
        if (window.innerWidth <= 860) return;
        if (open && open.panel !== panel) hide(open);

        reset(panel);
        panel.style.display = 'block';
        panel.style.visibility = 'hidden';
        panel.style.position = 'fixed';
        panel.style.maxHeight = Math.max(260, window.innerHeight - (MARGIN * 2)) + 'px';
        panel.classList.toggle('panel-mega', size === 'mega');
        panel.classList.toggle('panel-compact', size !== 'mega');

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
        const id = btn.getAttribute('data-panel');
        const panel = document.getElementById(id);
        const item = btn.closest('.nav-item');
        const size = item ? (item.dataset.size || 'compact') : 'compact';
        if (!panel) return;

        let openTimer = null;
        let closeTimer = null;

        const show = () => {
          clearTimeout(closeTimer);
          openTimer = setTimeout(() => placeAndShow(btn, panel, size), 60);
        };
        const hideLater = () => {
          clearTimeout(openTimer);
          closeTimer = setTimeout(() => hide({ panel, btn }), 120);
        };

        if (supportsHover) {
          btn.addEventListener('pointerenter', show);
          btn.addEventListener('pointerleave', hideLater);
          panel.addEventListener('pointerenter', () => { clearTimeout(closeTimer); clearTimeout(openTimer); });
          panel.addEventListener('pointerleave', hideLater);
        }

        btn.addEventListener('click', (e) => {
          if (window.innerWidth > 860) {
            e.preventDefault();
            if (panel.classList.contains('menu-visible')) hide({ panel, btn });
            else placeAndShow(btn, panel, size);
          }
        });

        btn.addEventListener('focus', show);
        btn.addEventListener('blur', () => setTimeout(() => {
          if (!panel.contains(document.activeElement)) hideLater();
        }, 60));
      });

      document.addEventListener('click', (e) => {
        if (e.target.closest('nav') || e.target.closest('.menu-panel')) return;
        document.querySelectorAll('.menu-panel.menu-visible').forEach((p) => hide({ panel: p, btn: null }));
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.menu-panel.menu-visible').forEach((p) => hide({ panel: p, btn: null }));
        }
      });
      window.addEventListener('resize', () => {
        document.querySelectorAll('.menu-panel').forEach((p) => {
          p.classList.remove('menu-visible');
          p.style.display = 'none';
          p.setAttribute('aria-hidden', 'true');
          reset(p);
        });
        document.querySelectorAll('.nav-btn[data-panel]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
        open = null;
      });
    })();

    // ===== Móvil: drawer =====
    (function () {
      const toggle = document.getElementById('navToggle');
      const drawer = document.getElementById('mobileMenu');
      const backdrop = document.getElementById('drawerBackdrop');
      if (!toggle || !drawer || !backdrop) return;

      let lastFocus = null;
      function focusable(root) {
        return root.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      }
      function setDrawerHeight() {
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        drawer.style.height = (window.innerHeight - headerH) + 'px';
      }
      function clearDrawerHeight() { drawer.style.height = ''; }

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
        window.removeEventListener('resize', setDrawerHeight);
        window.removeEventListener('orientationchange', setDrawerHeight);
        setTimeout(() => { drawer.hidden = true; clearDrawerHeight(); }, 200);
        lastFocus && lastFocus.focus();
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
          if (els.length === 0) return;
          const first = els[0], last = els[els.length - 1];
          if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
          else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
        }
      });
      window.addEventListener('resize', () => { if (window.innerWidth > 860 && !drawer.hidden) closeDrawer(); });
    })();
  }

  function loadHeaderFooterAndNav() {
    const headerPH = document.getElementById('header-placeholder');
    const footerPH = document.getElementById('footer-placeholder');

    // HEADER
    (function () {
      const oldHeader = document.querySelector('body > header');
      if (oldHeader) {
        if (headerPH && oldHeader.contains(headerPH)) oldHeader.replaceWith(headerPH);
        else oldHeader.remove();
      }
      if (headerPH) {
        fetch('header.html')
          .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
          .then(html => { headerPH.innerHTML = html; initNavigation(); })
          .catch(err => console.warn('No se pudo cargar header.html', err));
      }
    })();

    // FOOTER
    (function () {
      const oldFooter = document.querySelector('body > footer');
      if (oldFooter) {
        if (footerPH && oldFooter.contains(footerPH)) oldFooter.replaceWith(footerPH);
        else oldFooter.remove();
      }
      if (footerPH) {
        fetch('footer.html')
          .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
          .then(html => { footerPH.innerHTML = html; })
          .catch(err => console.warn('No se pudo cargar footer.html', err));
      }
    })();
  }

  document.addEventListener('DOMContentLoaded', loadHeaderFooterAndNav);
})();
