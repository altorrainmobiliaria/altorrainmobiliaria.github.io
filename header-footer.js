// header-footer.js
// Injects external header.html and footer.html into placeholders and initializes nav behavior.
// IMPORTANT: This file must NOT be wrapped in <script> tags.

(function () {
  const byId = (id) => document.getElementById(id);

  async function injectHTML(placeholderId, url) {
    const ph = byId(placeholderId);
    if (!ph) return null;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const html = await res.text();
      ph.innerHTML = html;
      return ph;
    } catch (e) {
      console.warn("Failed to inject", url, e);
      return null;
    }
  }

  function initNavigation() {
    // Desktop dropdowns (hover/click)
    (function(){
      const MARGIN = 12;
      const supportsHover = window.matchMedia("(hover: hover)").matches;
      let open = null;

      function resetPanelStyles(panel){
        panel.style.left=''; panel.style.top=''; panel.style.width=''; panel.style.maxWidth=''; panel.style.right='';
      }
      function hideImmediate(obj){
        if(!obj) return;
        obj.btn && obj.btn.setAttribute('aria-expanded','false');
        obj.panel.classList.remove('menu-visible');
        obj.panel.style.display='none';
        obj.panel.setAttribute('aria-hidden','true');
        resetPanelStyles(obj.panel);
        if(open && open.panel === obj.panel) open = null;
      }
      function placeAndShow(btn, panel, size){
        if(window.innerWidth <= 860) return;
        if(open && open.panel !== panel) hideImmediate(open);

        resetPanelStyles(panel);
        panel.style.display = 'block';
        panel.style.visibility = 'hidden';
        panel.style.position = 'fixed';
        panel.style.maxHeight = Math.max(260, window.innerHeight - (MARGIN*2)) + 'px';

        if(size === 'mega'){
          panel.style.width = Math.min(920, window.innerWidth - (MARGIN*2)) + 'px';
        } else {
          panel.style.width = 'auto';
          panel.style.maxWidth = Math.min(520, window.innerWidth - (MARGIN*2)) + 'px';
        }

        const preRect = panel.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();

        let left;
        if(size === 'mega'){
          left = Math.round(bRect.left + bRect.width/2 - preRect.width/2);
          left = Math.max(MARGIN, Math.min(left, window.innerWidth - preRect.width - MARGIN));
        } else {
          left = Math.round(Math.min(bRect.left, window.innerWidth - preRect.width - MARGIN));
          left = Math.max(left, MARGIN);
        }

        let top = Math.round(bRect.bottom + 8);
        if(top + preRect.height > window.innerHeight - MARGIN){
          top = Math.round(bRect.top - preRect.height - 8);
          if(top < MARGIN) top = MARGIN;
        }

        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.visibility = 'visible';
        panel.classList.add('menu-visible');
        panel.setAttribute('aria-hidden','false');
        btn.setAttribute('aria-expanded','true');
        open = {panel, btn};
      }

      document.querySelectorAll('.nav-btn[data-panel]').forEach(btn=>{
        const panelId = btn.getAttribute('data-panel');
        const panel = document.getElementById(panelId);
        const item = btn.closest('.nav-item');
        const size = item ? (item.dataset.size || 'compact') : 'compact';
        let openTimer=null, closeTimer=null;

        const show = ()=> { clearTimeout(closeTimer); openTimer = setTimeout(()=>{ placeAndShow(btn, panel, size); }, 60); };
        const hide = ()=> { clearTimeout(openTimer); closeTimer = setTimeout(()=>{ hideImmediate({panel, btn}); }, 120); };

        if(supportsHover){
          btn.addEventListener('pointerenter', show);
          btn.addEventListener('pointerleave', hide);
          panel.addEventListener('pointerenter', ()=> { clearTimeout(closeTimer); clearTimeout(openTimer); });
          panel.addEventListener('pointerleave', hide);
        }

        btn.addEventListener('click', (e)=> {
          if(window.innerWidth > 860){
            e.preventDefault();
            if(panel.classList.contains('menu-visible')) hideImmediate({panel, btn});
            else placeAndShow(btn, panel, size);
          }
        });

        // keyboard focus on desktop only; mobile will not auto-focus anything
        btn.addEventListener('focus', show);
        btn.addEventListener('blur', ()=> setTimeout(()=>{ if(!panel.contains(document.activeElement)) hide(); }, 60));
      });

      document.addEventListener('click', (e)=>{
        if(e.target.closest('nav') || e.target.closest('.menu-panel')) return;
        document.querySelectorAll('.menu-panel.menu-visible').forEach(p=> hideImmediate({panel:p, btn:null}));
      });
      document.addEventListener('keydown', (e)=> {
        if(e.key === 'Escape'){
          document.querySelectorAll('.menu-panel.menu-visible').forEach(p=> hideImmediate({panel:p, btn:null}));
        }
      });
      window.addEventListener('resize', ()=> {
        document.querySelectorAll('.menu-panel').forEach(p=> { p.classList.remove('menu-visible'); p.style.display='none'; p.setAttribute('aria-hidden','true'); resetPanelStyles(p); });
        document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.setAttribute('aria-expanded','false'));
        open = null;
      });
    })();

    // Mobile drawer (no autofocus to avoid blue outline)
    (function(){
      const toggle = document.getElementById('navToggle');
      const drawer = document.getElementById('mobileMenu');
      const backdrop = document.getElementById('drawerBackdrop');
      if(!toggle || !drawer || !backdrop) return;

      function setDrawerHeight(){
        const root = document.documentElement;
        const custom = parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 72;
        drawer.style.height = (window.innerHeight - custom) + 'px';
      }
      function clearDrawerHeight(){ drawer.style.height = ''; }

      function openDrawer(){
        drawer.hidden = false;
        setDrawerHeight();
        window.addEventListener('resize', setDrawerHeight);
        window.addEventListener('orientationchange', setDrawerHeight);
        requestAnimationFrame(()=>{
          drawer.classList.add('open');
          backdrop.classList.add('open');
          document.body.style.overflow='hidden';
          toggle.setAttribute('aria-expanded','true');
          // intentionally do NOT autofocus any element to avoid blue outline on iOS
        });
      }
      function closeDrawer(){
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow='';
        toggle.setAttribute('aria-expanded','false');
        window.removeEventListener('resize', setDrawerHeight);
        window.removeEventListener('orientationchange', setDrawerHeight);
        setTimeout(()=>{ drawer.hidden = true; clearDrawerHeight(); }, 200);
      }

      toggle.addEventListener('click', ()=> drawer.classList.contains('open') ? closeDrawer() : openDrawer());
      backdrop.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
      window.addEventListener('resize', ()=> { if(window.innerWidth > 860 && drawer.classList.contains('open')) closeDrawer(); });
    })();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // Basic tap highlight removal scoped to drawer/toggle.
    const style = document.createElement("style");
    style.textContent = `
      /* Remove blue focus outline only inside the mobile drawer */
      .drawer a:focus, .drawer button:focus, #navToggle:focus { outline: none !important; box-shadow: none !important; }
      .drawer a, .drawer button, #navToggle { -webkit-tap-highlight-color: transparent; }
    `;
    document.head.appendChild(style);

    await injectHTML("header-placeholder", "header.html");
    await injectHTML("footer-placeholder", "footer.html");
    initNavigation();
  });
})();
