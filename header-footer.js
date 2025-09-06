/* Carga header y footer externos (SIN etiquetas <script> aquí) */
(function () {
  function ensurePlaceholder(id) {
    let ph = document.getElementById(id);
    if (!ph) {
      ph = document.createElement('div');
      ph.id = id;
      document.body.insertAdjacentElement(
        id === 'header-placeholder' ? 'afterbegin' : 'beforeend',
        ph
      );
    }
    return ph;
  }

  async function inject(part, url) {
    const ph = ensurePlaceholder(part === 'header' ? 'header-placeholder' : 'footer-placeholder');
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      ph.innerHTML = await res.text();
      return true;
    } catch (e) {
      console.warn(`No se pudo cargar ${url}`, e);
      return false;
    }
  }

  async function loadHeaderFooter() {
    // Si había un <header> o <footer> “viejo” en el HTML, lo quitamos con cuidado
    const hp = ensurePlaceholder('header-placeholder');
    const fp = ensurePlaceholder('footer-placeholder');

    const oldHeader = document.querySelector('body > header');
    if (oldHeader && !oldHeader.contains(hp)) oldHeader.remove();

    const oldFooter = document.querySelector('body > footer');
    if (oldFooter && !oldFooter.contains(fp)) oldFooter.remove();

    // Rutas relativas al directorio actual (funciona dentro de /serena/)
    const headerOk = await inject('header', 'header.html');
    await inject('footer', 'footer.html');

    // Cuando el header esté presente, inicializamos navegación (definida en scripts.js)
    // scripts.js también la invoca en DOMContentLoaded; esto es un “por si acaso”.
    if (headerOk && typeof window.initNavigation === 'function') {
      try { window.initNavigation(); } catch (e) { console.warn('initNavigation falló', e); }
    }

    // Disparamos un evento útil por si alguna otra parte quiere engancharse.
    document.dispatchEvent(new CustomEvent('altorra:header-ready'));
  }

  document.addEventListener('DOMContentLoaded', loadHeaderFooter);
})();
