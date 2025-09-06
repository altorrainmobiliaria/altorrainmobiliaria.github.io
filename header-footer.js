<script>
/* Load external header and footer and initialize navigation */
function loadHeaderFooterAndNav() {
  const headerPH = document.getElementById('header-placeholder');
  const footerPH = document.getElementById('footer-placeholder');

  // ---- HEADER: eliminar/reemplazar sin destruir el placeholder
  (function handleHeader(){
    const oldHeader = document.querySelector('body > header');
    if (oldHeader) {
      if (headerPH && oldHeader.contains(headerPH)) {
        oldHeader.replaceWith(headerPH);
      } else {
        oldHeader.remove();
      }
    }
    if (headerPH) {
      fetch('header.html')
        .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
        .then(html => { headerPH.innerHTML = html; initNavigation(); })
        .catch(err => console.warn('No se pudo cargar header.html', err));
    }
  })();

  // ---- FOOTER: eliminar/reemplazar sin destruir el placeholder
  (function handleFooter(){
    const oldFooter = document.querySelector('body > footer');
    if (oldFooter) {
      if (footerPH && oldFooter.contains(footerPH)) {
        oldFooter.replaceWith(footerPH);
      } else {
        oldFooter.remove();
      }
    }
    if (footerPH) {
      fetch('footer.html')
        .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
        .then(html => { footerPH.innerHTML = html; })
        .catch(err => console.warn('No se pudo cargar footer.html', err));
    }
  })();
}

document.addEventListener('DOMContentLoaded', loadHeaderFooterAndNav);

/* Initialize navigation (desktop menus and mobile drawer) */
/* (deja tu initNavigation() tal cual está ahora) */
</script>
