/**
 * country-phone.js — Selector de país para campos de teléfono
 * Altorra Inmobiliaria
 *
 * Enhances any <input type="tel"> by prepending a country code dropdown.
 * Works on static forms (contacto.html, publicar-propiedad.html) and
 * dynamically generated forms (detalle-propiedad.html).
 */
(function () {
  'use strict';

  var COUNTRIES = [
    { code: '+57',  flag: '\u{1F1E8}\u{1F1F4}', name: 'Colombia' },
    { code: '+1',   flag: '\u{1F1FA}\u{1F1F8}', name: 'EE.UU.' },
    { code: '+34',  flag: '\u{1F1EA}\u{1F1F8}', name: 'España' },
    { code: '+52',  flag: '\u{1F1F2}\u{1F1FD}', name: 'México' },
    { code: '+507', flag: '\u{1F1F5}\u{1F1E6}', name: 'Panamá' },
    { code: '+51',  flag: '\u{1F1F5}\u{1F1EA}', name: 'Perú' },
    { code: '+593', flag: '\u{1F1EA}\u{1F1E8}', name: 'Ecuador' },
    { code: '+58',  flag: '\u{1F1FB}\u{1F1EA}', name: 'Venezuela' },
    { code: '+56',  flag: '\u{1F1E8}\u{1F1F1}', name: 'Chile' },
    { code: '+54',  flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
  ];

  var CSS_ID = 'country-phone-css';

  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '.cp-wrap{display:flex;gap:6px;align-items:stretch}',
      '.cp-select{width:90px;padding:8px 6px;border:1px solid #d1d5db;border-radius:8px;font-size:.85rem;font-family:inherit;background:#fff;cursor:pointer;flex-shrink:0}',
      '.cp-select:focus{border-color:var(--gold,#d4af37);outline:none;box-shadow:0 0 0 3px rgba(212,175,55,.12)}',
      '.cp-wrap input[type="tel"]{flex:1;min-width:0}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function buildSelect() {
    var sel = document.createElement('select');
    sel.className = 'cp-select';
    sel.setAttribute('aria-label', 'Código de país');
    sel.name = '_countryCode';
    COUNTRIES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.flag + ' ' + c.code;
      if (c.code === '+57') opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  function enhance(input) {
    if (input.dataset.cpEnhanced) return;
    input.dataset.cpEnhanced = 'true';

    var wrap = document.createElement('div');
    wrap.className = 'cp-wrap';

    var sel = buildSelect();
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(sel);
    wrap.appendChild(input);
  }

  function enhanceAll() {
    document.querySelectorAll('input[type="tel"]:not([data-cp-enhanced])').forEach(enhance);
  }

  injectCSS();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll);
  } else {
    enhanceAll();
  }

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.matches && node.matches('input[type="tel"]:not([data-cp-enhanced])')) {
          enhance(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('input[type="tel"]:not([data-cp-enhanced])').forEach(enhance);
        }
      }
    }
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

})();
