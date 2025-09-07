<script>
/* Carga header/footer externos e inicializa la navegación (una sola vez) */
(function () {
  if (window.__altorraHeaderFooter__) return;
  window.__altorraHeaderFooter__ = true;

  // Inserta HTML externo en un placeholder y ejecuta un callback
  function inject(placeholderId, url, afterMount) {
    const host = document.getElementById(placeholderId);
    if (!host) return;
    fetch(url, { cache: "no-cache" })
      .then((r) => r.text())
      .then((html) => {
        host.innerHTML = html;
        afterMount && afterMount();
      })
      .catch((e) => console.warn("No se pudo cargar", url, e));
  }

  function initHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    /* =========== MENÚ DESKTOP (hover/click) =========== */
    const MARGIN = 12;
    let open = null;

    const panels = document.querySelectorAll(".menu-panel");
    const isDesktop = () => window.innerWidth > 860;

    function reset(p) {
      p.style.left = p.style.top = p.style.width = p.style.maxWidth = p.style.right = "";
    }
    function hideNow(obj) {
      if (!obj) return;
      obj.btn && obj.btn.setAttribute("aria-expanded", "false");
      obj.panel.classList.remove("menu-visible");
      obj.panel.style.display = "none";
      obj.panel.setAttribute("aria-hidden", "true");
      reset(obj.panel);
      if (open && open.panel === obj.panel) open = null;
    }
    function placeAndShow(btn, panel, size) {
      if (!isDesktop()) return;
      if (open && open.panel !== panel) hideNow(open);

      reset(panel);
      panel.style.display = "block";
      panel.style.visibility = "hidden";
      panel.style.position = "fixed";
      panel.style.maxHeight = Math.max(260, window.innerHeight - MARGIN * 2) + "px";
      if (size === "mega") {
        panel.style.width = Math.min(920, window.innerWidth - MARGIN * 2) + "px";
      } else {
        panel.style.width = "auto";
        panel.style.maxWidth = Math.min(520, window.innerWidth - MARGIN * 2) + "px";
      }

      const pre = panel.getBoundingClientRect();
      const b = btn.getBoundingClientRect();

      let left = size === "mega"
        ? Math.round(b.left + b.width / 2 - pre.width / 2)
        : Math.round(Math.min(b.left, window.innerWidth - pre.width - MARGIN));
      left = Math.max(MARGIN, Math.min(left, window.innerWidth - pre.width - MARGIN));

      let top = Math.round(b.bottom + 8);
      if (top + pre.height > window.innerHeight - MARGIN) {
        top = Math.round(b.top - pre.height - 8);
        if (top < MARGIN) top = MARGIN;
      }

      panel.style.left = left + "px";
      panel.style.top = top + "px";
      panel.style.visibility = "visible";
      panel.classList.add("menu-visible");
      panel.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      open = { panel, btn };
    }

    // Eventos por botón
    document.querySelectorAll(".nav-btn[data-panel]").forEach((btn) => {
      const id = btn.getAttribute("data-panel");
      const panel = document.getElementById(id);
      const item = btn.closest(".nav-item");
      const size = item ? item.dataset.size || "compact" : "compact";
      let openTimer = null, closeTimer = null;

      const supportsHover = matchMedia("(hover: hover)").matches;

      const show = () => {
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => placeAndShow(btn, panel, size), 60);
      };
      const hide = () => {
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => hideNow({ panel, btn }), 120);
      };

      if (supportsHover) {
        btn.addEventListener("pointerenter", show);
        btn.addEventListener("pointerleave", hide);
        panel.addEventListener("pointerenter", () => {
          clearTimeout(closeTimer);
          clearTimeout(openTimer);
        });
        panel.addEventListener("pointerleave", hide);
      }

      btn.addEventListener("click", (e) => {
        if (isDesktop()) {
          e.preventDefault();
          if (panel.classList.contains("menu-visible")) hideNow({ panel, btn });
          else placeAndShow(btn, panel, size);
        }
      });

      btn.addEventListener("focus", show);
      btn.addEventListener("blur", () =>
        setTimeout(() => {
          if (!panel.contains(document.activeElement)) hide();
        }, 60)
      );
    });

    // Cerrar al hacer click fuera / ESC / resize
    document.addEventListener("click", (e) => {
      if (e.target.closest("nav") || e.target.closest(".menu-panel")) return;
      document.querySelectorAll(".menu-panel.menu-visible").forEach((p) =>
        hideNow({ panel: p, btn: null })
      );
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".menu-panel.menu-visible").forEach((p) =>
          hideNow({ panel: p, btn: null })
        );
      }
    });
    window.addEventListener("resize", () => {
      document.querySelectorAll(".menu-panel").forEach((p) => {
        p.classList.remove("menu-visible");
        p.style.display = "none";
        p.setAttribute("aria-hidden", "true");
        reset(p);
      });
      document.querySelectorAll(".nav-btn[data-panel]").forEach((b) =>
        b.setAttribute("aria-expanded", "false")
      );
      open = null;
    });

    /* =========== MENÚ MÓVIL (drawer) =========== */
    const toggle = document.getElementById("navToggle");
    const drawer = document.getElementById("mobileMenu");
    const backdrop = document.getElementById("drawerBackdrop");
    if (toggle && drawer && backdrop) {
      let lastFocus = null;
      const isTouch = matchMedia("(hover: none)").matches || "ontouchstart" in window;

      const focusables = (root) =>
        root.querySelectorAll(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );

      function setDrawerHeight() {
        const h =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue("--header-h")
          ) || 72;
        drawer.style.height = (window.innerHeight - h) + "px";
      }

      function openDrawer() {
        lastFocus = document.activeElement;
        drawer.hidden = false;
        setDrawerHeight();
        window.addEventListener("resize", setDrawerHeight);
        window.addEventListener("orientationchange", setDrawerHeight);

        requestAnimationFrame(() => {
          drawer.classList.add("open");
          backdrop.classList.add("open");
          document.body.style.overflow = "hidden";
          toggle.setAttribute("aria-expanded", "true");

          // 🔒 Evitamos el borde azul: no enfocamos un enlace en móviles.
          // Enfocamos el título (o el contenedor) con tabindex -1.
          const title = drawer.querySelector("#mobileMenuTitle");
          if (!isTouch) {
            // En escritorio mantengo foco navegable.
            const first = focusables(drawer)[0];
            first && first.focus();
          } else if (title) {
            title.setAttribute("tabindex", "-1");
            title.focus({ preventScroll: true });
          } else {
            drawer.setAttribute("tabindex", "-1");
            drawer.focus({ preventScroll: true });
          }
        });
      }

      function closeDrawer() {
        drawer.classList.remove("open");
        backdrop.classList.remove("open");
        document.body.style.overflow = "";
        toggle.setAttribute("aria-expanded", "false");
        requestAnimationFrame(() => {
          drawer.hidden = true;
          lastFocus && lastFocus.focus();
        });
        drawer.style.height = "";
        window.removeEventListener("resize", setDrawerHeight);
        window.removeEventListener("orientationchange", setDrawerHeight);
      }

      toggle.addEventListener("click", () => {
        drawer.classList.contains("open") ? closeDrawer() : openDrawer();
      });
      backdrop.addEventListener("click", closeDrawer);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
      });

      // Cerrar si paso a escritorio
      window.addEventListener("resize", () => {
        if (window.innerWidth > 860 && drawer.classList.contains("open")) {
          closeDrawer();
        }
      });
    }
  }

  // Montaje cuando el DOM está listo
  document.addEventListener("DOMContentLoaded", function () {
    inject("header-placeholder", "header.html", initHeader);
    inject("footer-placeholder", "footer.html");
  });
})();
</script>
