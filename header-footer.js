/* Altorra header & footer loader + robust menu controller
   - Evita menús "congelados" con un único controlador global y timers centralizados
   - No modifica el look: sólo comportamiento
*/
(function(){
  if (window.__altorraHeaderInit__) return;
  window.__altorraHeaderInit__ = true;

  // Helpers ------------------------------------------------------------
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }
  const isDesktop = () => window.innerWidth > 860;

  // Inject header/footer ------------------------------------------------
  async function inject(id, url){
    const host = document.getElementById(id);
    if(!host) return;
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      host.innerHTML = await res.text();
      if(id === 'header-placeholder') initHeader();
    }catch(e){
      console.warn('Fragment load failed:', url, e);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    inject('header-placeholder', 'header.html');
    inject('footer-placeholder', 'footer.html');
  });

  // Header behaviour ---------------------------------------------------
  function initHeader(){
    const header = $('header');
    if(!header) return;

    // ===== Desktop dropdowns (one controller, no duplicates) =====
    let open = null;
    let hideTimer = null;

    function resetPanelStyles(p){
      if(!p) return;
      p.style.left=''; p.style.top=''; p.style.width=''; p.style.maxWidth=''; p.style.right=''; p.style.visibility='';
    }

    function placeAndShow(btn, panel){
      if(!panel || !btn) return;
      // Cierra el que estuviera abierto
      if(open && open.panel !== panel) hideImmediate(open.panel, open.btn);
      clearTimeout(hideTimer);

      // Medición y posicionamiento
      panel.style.display = 'block';
      panel.style.visibility = 'hidden';
      panel.style.position = 'fixed';
      panel.style.maxHeight = Math.max(260, window.innerHeight - 24) + 'px';

      const isMega = (btn.closest('.nav-item')?.dataset.size || 'compact') === 'mega';
      if(isMega){
        panel.style.width = Math.min(920, window.innerWidth - 24) + 'px';
      }else{
        panel.style.width = 'auto';
        panel.style.maxWidth = Math.min(520, window.innerWidth - 24) + 'px';
      }

      const preRect = panel.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();

      let left;
      if(isMega){
        left = Math.round(bRect.left + bRect.width/2 - preRect.width/2);
        left = Math.max(12, Math.min(left, window.innerWidth - preRect.width - 12));
      }else{
        left = Math.round(Math.min(bRect.left, window.innerWidth - preRect.width - 12));
        left = Math.max(left, 12);
      }

      let top = Math.round(bRect.bottom + 8);
      if(top + preRect.height > window.innerHeight - 12){
        top = Math.round(bRect.top - preRect.height - 8);
        if(top < 12) top = 12;
      }

      panel.style.left = left + 'px';
      panel.style.top  = top + 'px';
      panel.style.visibility = 'visible';
      panel.classList.add('menu-visible');
      panel.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      open = {panel, btn};
    }

    function hideImmediate(panel, btn){
      if(!panel) return;
      btn && btn.setAttribute('aria-expanded','false');
      panel.classList.remove('menu-visible');
      panel.style.display = 'none';
      panel.setAttribute('aria-hidden','true');
      resetPanelStyles(panel);
      if(open && open.panel === panel) open = null;
    }

    // Delegamos eventos en el header para evitar escuchas duplicadas
    header.addEventListener('pointerenter', function(e){
      if(!isDesktop()) return;
      const btn = e.target.closest('.nav-btn[data-panel]');
      if(btn){
        const panel = document.getElementById(btn.getAttribute('data-panel'));
        placeAndShow(btn, panel);
      }
    }, true);

    header.addEventListener('click', function(e){
      // Click en botón en desktop: actuar como hover, no navegar
      const btn = e.target.closest('.nav-btn[data-panel]');
      if(btn && isDesktop()){
        e.preventDefault();
        const panel = document.getElementById(btn.getAttribute('data-panel'));
        if(open && open.panel === panel){
          hideImmediate(panel, btn);
        }else{
          placeAndShow(btn, panel);
        }
      }
    });

    // Cierre cuando el puntero sale del header o del panel abierto
    function scheduleClose(){
      clearTimeout(hideTimer);
      hideTimer = setTimeout(()=> {
        if(open) hideImmediate(open.panel, open.btn);
      }, 120);
    }
    header.addEventListener('pointerleave', function(){
      if(!isDesktop()) return;
      scheduleClose();
    });

    // Mantener abierto si entramos a un panel
    $all('.menu-panel').forEach(p=>{
      p.addEventListener('pointerenter', ()=> clearTimeout(hideTimer));
      p.addEventListener('pointerleave', scheduleClose);
    });

    // Cierre por click fuera
    document.addEventListener('pointerdown', function(e){
      if(!open) return;
      if(e.target.closest('header') || e.target.closest('.menu-panel')) return;
      hideImmediate(open.panel, open.btn);
    });

    // Cierre por ESC y por resize
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && open) hideImmediate(open.panel, open.btn);
    });
    window.addEventListener('resize', function(){
      if(open) hideImmediate(open.panel, open.btn);
    });

    // ===== Drawer móvil =====
    const toggle = $('#navToggle', header);
    const drawer = $('#mobileMenu', header.parentElement || document);
    const backdrop = $('#drawerBackdrop', header.parentElement || document);
    if(toggle && drawer && backdrop){
      let lastFocus = null;
      const focusable = root => root.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');

      function setDrawerHeight(){
        const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        drawer.style.height = (window.innerHeight - h) + 'px';
      }
      function openDrawer(){
        lastFocus = document.activeElement;
        drawer.hidden = false;
        setDrawerHeight();
        requestAnimationFrame(()=>{
          drawer.classList.add('open');
          backdrop.classList.add('open');
          document.body.style.overflow='hidden';
          toggle.setAttribute('aria-expanded','true');
          const el = focusable(drawer)[0];
          el && el.focus();
        });
        window.addEventListener('resize', setDrawerHeight);
        window.addEventListener('orientationchange', setDrawerHeight);
      }
      function closeDrawer(){
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow='';
        toggle.setAttribute('aria-expanded','false');
        window.removeEventListener('resize', setDrawerHeight);
        window.removeEventListener('orientationchange', setDrawerHeight);
        setTimeout(()=>{ drawer.hidden = true; drawer.style.height=''; }, 200);
        lastFocus && lastFocus.focus();
      }

      toggle.addEventListener('click', ()=>{
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        expanded ? closeDrawer() : openDrawer();
      });
      backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', e=>{
        if(e.key === 'Escape' && !drawer.hidden) closeDrawer();
        if(e.key === 'Tab' && !drawer.hidden){
          const els = Array.from(focusable(drawer));
          if(!els.length) return;
          const first = els[0], last = els[els.length-1];
          if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
          else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
        }
      });
      window.addEventListener('resize', ()=> { if(isDesktop() && !drawer.hidden) closeDrawer(); });
    }
  }
})();
