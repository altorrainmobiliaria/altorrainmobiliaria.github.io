(function () {
  'use strict';

  var STORAGE_KEY = 'altorra:lang';

  var ES_TO_EN = {
    // Nav / Header
    'Propiedades':                    'Properties',
    'Servicios':                      'Services',
    'Nosotros':                       'About us',
    'Contacto':                       'Contact',
    'Menú':                           'Menu',
    'Comprar':                        'Buy',
    'Arrendar':                       'Rent',
    'Rentar por días':                'Vacation rental',
    'Gestión inmobiliaria':           'Property management',
    'Administración de inmuebles':    'Property administration',
    'Avalúos':                        'Appraisals',
    'Mantenimiento y reparaciones':   'Maintenance & repairs',
    'Mudanzas y logística':           'Moving & logistics',
    'Asesoría legal y contable':      'Legal & accounting',
    'Servicios jurídicos':            'Legal services',
    'Servicios contables':            'Accounting services',
    'Gestión de contratos':           'Contract management',
    'Turismo inmobiliario':           'Real estate tourism',
    'Yates, pasadías en islas y experiencias en Cartagena': 'Yachts, island day trips & experiences in Cartagena',
    'Mis Favoritos':                  'My Favorites',
    'Ir a Mis Favoritos':             'Go to My Favorites',
    'Por días':                       'Vacation',
    'Empresa':                        'Company',
    'Quiénes somos':                  'About us',
    'Yates, pasadías y experiencias en Cartagena': 'Yachts, island tours & experiences in Cartagena',

    // Hero
    '⭐ Inmobiliaria #1 en Cartagena': '⭐ #1 Real Estate Agency in Cartagena',
    'Gestión Integral en Soluciones Inmobiliarias': 'Comprehensive Real Estate Solutions',
    'Seguridad • Legalidad • Confianza': 'Security • Legality • Trust',
    'Buscar':                         'Search',
    'Cualquiera':                     'Any',
    'Apartamento':                    'Apartment',
    'Casa':                           'House',
    'Lote':                           'Lot',
    'Oficina':                        'Office',

    // Trust bar
    'propiedades activas':            'active properties',
    'ciudades cubiertas':             'cities covered',
    'Respaldo legal y financiero':    'Legal & financial backing',

    // Hub
    'Todo en un':                     'All in one',
    'lugar':                          'place',
    'Elige tu camino. Te guiamos con asesoría legal, financiera y comercial.': 'Choose your path. We guide you with legal, financial and commercial advice.',
    'Apartamentos, casas y lotes con escritura y antecedentes verificados.': 'Apartments, houses and lots with verified titles and background checks.',
    'Ver propiedades en venta →':     'View properties for sale →',
    'Contratos con respaldo jurídico y opción de administración integral.': 'Contracts with legal backing and optional full property management.',
    'Ver propiedades en arriendo →':  'View rental properties →',
    'Invertir':                       'Invest',
    'Renta turística en Cartagena con estimación de ocupación y rentabilidad.': 'Short-term rental in Cartagena with occupancy and ROI estimates.',
    'Ver oportunidades de inversión →': 'View investment opportunities →',

    // Publish
    '¿Quieres publicar tu propiedad?': 'Want to list your property?',
    'Si tienes un inmueble para vender, arrendar o rentar por días, Altorra te ayuda a promocionarlo de forma rápida y segura.': 'If you have a property to sell, rent or lease, Altorra helps you market it quickly and safely.',
    'Publicar mi propiedad':          'List my property',

    // Recent
    'Recién':                         'Recently',
    'publicadas':                     'listed',
    'Todas':                          'All',
    'Venta':                          'Sale',
    'Arriendo':                       'Rental',
    'Ver todo →':                     'View all →',

    // Exclusivas
    '✨ Colección privada':           '✨ Private collection',
    'Exclusivas':                     'Exclusive',

    // Categories
    'Explora por':                    'Explore by',
    'tipo':                           'type',
    'Encuentra exactamente lo que buscas.': 'Find exactly what you\'re looking for.',
    'Local':                          'Retail',
    'Bodega':                         'Warehouse',

    // Neighborhoods
    'Barrios':                        'Neighborhoods',
    'Las zonas más exclusivas de Cartagena.': 'The most exclusive areas in Cartagena.',
    'Frente al mar · Alta valorización': 'Beachfront · High appreciation',
    'Tradición · Vista a la bahía':   'Tradition · Bay view',
    'Exclusividad · Tranquilidad':    'Exclusivity · Tranquility',
    'Patrimonio UNESCO · Renta turística': 'UNESCO Heritage · Vacation rental',
    'Playa privada · Proyectos nuevos': 'Private beach · New developments',

    // Featured
    'Propiedad destacada':            'Featured property',
    'de la semana':                   'of the week',

    // Testimonials
    'Lo que dicen nuestros':          'What our',
    'clientes':                       'clients say',

    // Cards
    'Ver detalles':                   'View details',

    // Footer
    'Administración, Arriendo y Venta de Inmuebles': 'Property Management, Rental & Sales',
    'Servicios Legales Especializados': 'Specialized Legal Services',
    'Administración':                 'Management',
    'Privacidad':                     'Privacy',
    '© 2025 Altorra Inmobiliaria — Hecho con confianza.': '© 2025 Altorra Inmobiliaria — Built with trust.',

    // Listing pages
    'Propiedades en Venta':           'Properties for Sale',
    'Propiedades en Arriendo':        'Properties for Rent',
    'Alojamientos por Días':          'Vacation Rentals',
    'Resultados de Búsqueda':         'Search Results',
    'Ordenar por':                    'Sort by',
    'Más recientes':                  'Newest',
    'Menor precio':                   'Lowest price',
    'Mayor precio':                   'Highest price',
    'No se encontraron propiedades.': 'No properties found.',

    // Detail
    'Descripción':                    'Description',
    'Características':                'Features',
    'Ubicación':                      'Location',
    'Precio':                         'Price',
    'Enviar mensaje':                 'Send message',
    'Avisarme':                       'Notify me',
    '📅 Agendar visita':             '📅 Schedule visit',
    '📊 Calcular rentabilidad Airbnb': '📊 Calculate Airbnb ROI',
    'Propiedades similares':          'Similar properties',

    // Contact
    'Contáctanos':                    'Contact us',
    'Nombre completo':                'Full name',
    'Nombre completo *':              'Full name *',
    'Teléfono / WhatsApp':            'Phone / WhatsApp',
    'Teléfono / WhatsApp *':          'Phone / WhatsApp *',
    'Correo electrónico':             'Email',
    'Email *':                        'Email *',
    'Mensaje':                        'Message',
    'Mensaje (opcional)':             'Message (optional)',
    'Enviar':                         'Send',
    'Enviar consulta':                'Send inquiry',

    // Invest page
    '📈 Guía de inversión 2026':      '📈 Investment guide 2026',
    '¿Por qué invertir en Cartagena?': 'Why invest in Cartagena?',
    'Una de las ciudades con mayor plusvalía y demanda turística de Colombia.': 'One of Colombia\'s cities with the highest appreciation and tourism demand.',
    'ROI estimado por zona':          'Estimated ROI by zone',
    'Rentabilidad anual estimada según tipo de operación y ubicación.': 'Estimated annual return by operation type and location.',
    'Casos de inversión':             'Investment cases',
    'Ejemplos reales de rentabilidad en propiedades gestionadas con Altorra.': 'Real profitability examples from Altorra-managed properties.',
    '¿Listo para invertir?':          'Ready to invest?',
    'Nuestros asesores te ayudan a encontrar la propiedad ideal para tu perfil de inversión.': 'Our advisors help you find the ideal property for your investment profile.',
    'Ver propiedades':                'Browse properties',
    'Calculadora Airbnb':             'Airbnb Calculator',
    'Abrir calculadora':              'Open calculator',
    'Valorización constante':         'Steady appreciation',
    'Renta turística':                'Vacation rental',
    'Desarrollo urbano':              'Urban development',
    'Demanda internacional':          'International demand',
    'ROI Airbnb':                     'Airbnb ROI',
    'ROI Arriendo':                   'Rental ROI',
    'Precio m²':                      'Price/m²',
    'Ocupación':                      'Occupancy',
    'Alto ROI':                       'High ROI',
    'ROI medio':                      'Mid ROI',
    'Inversión total':                'Total investment',
    'Tarifa/noche Airbnb':            'Airbnb rate/night',
    'Ocupación promedio':             'Average occupancy',
    'Ingreso mensual bruto':          'Gross monthly income',
    'Gastos mensuales':               'Monthly expenses',
    'Ingreso neto mensual':           'Net monthly income',
    'ROI anual':                      'Annual ROI',
    'Arriendo mensual':               'Monthly rent',

    // Renta turística
    '🏖️ Gestión profesional de renta turística': '🏖️ Professional vacation rental management',
    '¿Qué hacemos por ti?':           'What do we do for you?',
    'Gestión integral 360° para maximizar la rentabilidad de tu propiedad.': 'Full 360° management to maximize your property returns.',
    'Cómo funciona':                  'How it works',
    'En 4 pasos convertimos tu propiedad en un activo rentable.': 'In 4 steps we turn your property into a profitable asset.',
    'Renta turística vs arriendo tradicional': 'Vacation rental vs traditional lease',
    'Compara qué opción maximiza tus ingresos.': 'Compare which option maximizes your income.',
    'Preguntas frecuentes':           'Frequently asked questions',
    '¿Tienes propiedad pero no tiempo?': 'Own property but have no time?',
    'Déjanos la gestión. Tú solo recibes los ingresos.': 'Let us manage. You just collect the income.',
    'Solicitar asesoría':             'Request consultation',
    'Calcular mi ROI':                'Calculate my ROI',
    'Quiero más información':         'I want more information',
    'Calcular rentabilidad':          'Calculate profitability',
    'Evaluación':                     'Assessment',
    'Preparación':                    'Preparation',
    'Operación':                      'Operations',
    'Liquidación':                    'Settlement',
    'Fotografía profesional':         'Professional photography',
    'Publicación multicanal':         'Multi-channel listing',
    'Limpieza profesional':           'Professional cleaning',
    'Mantenimiento':                  'Maintenance',
    'Atención 24/7':                  '24/7 Guest support',
    'Reportes mensuales':             'Monthly reports',
    'Pagos directos':                 'Direct payments',
    'Quiero una asesoría':            'I want a consultation',
    'Te contactamos en menos de 24 horas.': 'We\'ll contact you within 24 hours.',
    'Quiero información sobre gestión de renta turística': 'I want info on vacation rental management',
    'Tipo de propiedad':              'Property type',

    // Barrios / Neighborhoods extra
    'premium':                        'premium',
    'Cerca al aeropuerto · Residencial': 'Near airport · Residential',
    'Selección curada de las propiedades más codiciadas de Cartagena.': 'A curated selection of Cartagena\'s most coveted properties.',
    'Ver en Google →':                'View on Google →',
    '5.0 en Google Maps':             '5.0 on Google Maps',
    'Página no encontrada':           'Page not found',
    'Lo sentimos, la página que buscas no existe o fue movida. Usa el buscador para encontrar propiedades o navega a una de nuestras secciones principales.': 'Sorry, the page you\'re looking for doesn\'t exist or has been moved. Use the search to find properties or browse our main sections.',
    'Inicio':                         'Home',
    'Propiedades en venta':           'Properties for sale',
    'Propiedades en arriendo':        'Properties for rent',
    'Alojamientos turísticos':        'Vacation accommodations',
    'Volver al home':                 'Back to home',
    'Publicar':                       'List',
    'Vende tu propiedad':             'Sell your property',
    'Escríbenos':                     'Write to us',
    'Gracias':                        'Thank you',
    'Hemos recibido tu solicitud.':   'We have received your request.',

    // Blog
    'Blog':                           'Blog',
    'Inversionista':                  'Investor',
    'Leer artículo →':               'Read article →',
    '← Volver al blog':              '← Back to blog',

    // Misc
    'Mis favoritos':                  'My favorites',
    'Cargando...':                    'Loading...',
    'Error al enviar. Intenta de nuevo.': 'Error sending. Please try again.',
    'Guardar favorito':               'Save favorite',
    'Simulador de crédito hipotecario': 'Mortgage calculator',
  };

  // Build EN→ES reverse
  var EN_TO_ES = {};
  for (var k in ES_TO_EN) {
    if (ES_TO_EN.hasOwnProperty(k)) EN_TO_ES[ES_TO_EN[k]] = k;
  }

  var PLACEHOLDER_ES_EN = {
    '🔍 Buscar por palabra clave':    '🔍 Search by keyword',
    'Ciudad (ej. Cartagena)':         'City (e.g. Cartagena)',
    'Código (ej. c-p1)':              'Code (e.g. c-p1)',
    '$ Presupuesto':                  '$ Budget',
    'Buscar por nombre, email…':      'Search by name, email…',
    'Cuéntanos sobre tu propiedad...': 'Tell us about your property...',
    'Escribe tu mensaje aquí...':     'Write your message here...',
  };
  var PLACEHOLDER_EN_ES = {};
  for (var pk in PLACEHOLDER_ES_EN) {
    if (PLACEHOLDER_ES_EN.hasOwnProperty(pk)) PLACEHOLDER_EN_ES[PLACEHOLDER_ES_EN[pk]] = pk;
  }

  var state = { lang: 'es' };

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }

  // ── Core translation ──

  var SKIP = { SCRIPT:1, STYLE:1, TEXTAREA:1, CODE:1, PRE:1, NOSCRIPT:1 };

  function translateDOM(root, map, phMap) {
    // 1) All elements: check childNodes that are text
    var els = root.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (SKIP[el.tagName]) continue;
      if (el.closest('svg') || el.closest('script') || el.closest('style')) continue;

      // Direct text children
      for (var j = 0; j < el.childNodes.length; j++) {
        var child = el.childNodes[j];
        if (child.nodeType !== 3) continue; // text node only
        var raw = child.nodeValue;
        var trimmed = raw.trim();
        if (trimmed.length < 2) continue;
        if (map[trimmed]) {
          child.nodeValue = raw.replace(trimmed, map[trimmed]);
        }
      }

      // Placeholder
      if (el.hasAttribute('placeholder')) {
        var ph = el.getAttribute('placeholder');
        if (phMap[ph]) el.setAttribute('placeholder', phMap[ph]);
      }

      // aria-label
      if (el.hasAttribute('aria-label')) {
        var al = el.getAttribute('aria-label');
        if (map[al]) el.setAttribute('aria-label', map[al]);
      }
    }

    // 2) <option> text
    var opts = root.querySelectorAll('select option');
    for (var oi = 0; oi < opts.length; oi++) {
      var optTxt = opts[oi].textContent.trim();
      if (map[optTxt]) opts[oi].textContent = map[optTxt];
    }
  }

  function translatePage() {
    var toEN = (state.lang === 'en');
    var map = toEN ? ES_TO_EN : EN_TO_ES;
    var phMap = toEN ? PLACEHOLDER_ES_EN : PLACEHOLDER_EN_ES;

    translateDOM(document.body, map, phMap);
    document.documentElement.setAttribute('lang', state.lang);

    // Page title
    if (toEN) {
      document.title = document.title
        .replace('Altorra Inmobiliaria', 'Altorra Real Estate')
        .replace('Propiedades en Venta', 'Properties for Sale')
        .replace('Propiedades en Arriendo', 'Properties for Rent')
        .replace('Alojamientos por Días', 'Vacation Rentals')
        .replace('Detalle de Propiedad', 'Property Detail')
        .replace('Invertir en Cartagena', 'Invest in Cartagena')
        .replace('Renta Turística en Cartagena', 'Vacation Rental in Cartagena');
    } else {
      document.title = document.title
        .replace('Altorra Real Estate', 'Altorra Inmobiliaria')
        .replace('Properties for Sale', 'Propiedades en Venta')
        .replace('Properties for Rent', 'Propiedades en Arriendo')
        .replace('Vacation Rentals', 'Alojamientos por Días')
        .replace('Property Detail', 'Detalle de Propiedad')
        .replace('Invest in Cartagena', 'Invertir en Cartagena')
        .replace('Vacation Rental in Cartagena', 'Renta Turística en Cartagena');
    }
  }

  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    if (lang === state.lang) return;
    state.lang = lang;
    setStored(lang);
    translatePage();
    updateToggle();
    window.dispatchEvent(new CustomEvent('altorra:lang-changed', { detail: { lang: lang } }));
  }

  // ── Toggle button ──

  function injectCSS() {
    if (document.getElementById('i18n-css')) return;
    var s = document.createElement('style');
    s.id = 'i18n-css';
    s.textContent =
      '.lang-toggle{position:fixed;top:calc(var(--header-h,72px)+12px);right:12px;z-index:1200;' +
      'display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.95);' +
      'backdrop-filter:blur(8px);border:1px solid rgba(212,175,55,.35);border-radius:999px;' +
      'padding:4px;box-shadow:0 4px 14px rgba(17,24,39,.10);font-family:Poppins,system-ui,sans-serif}' +
      '.lang-toggle button{background:transparent;border:none;padding:5px 11px;font-size:.8rem;' +
      'font-weight:700;color:#6b7280;cursor:pointer;border-radius:999px;font-family:inherit;' +
      'letter-spacing:.5px;transition:background .15s,color .15s}' +
      '.lang-toggle button.active{background:linear-gradient(135deg,#d4af37,#ffb400);color:#000}' +
      '.lang-toggle button:not(.active):hover{color:#d4af37}' +
      '@media(max-width:540px){.lang-toggle{top:auto;bottom:90px;right:12px}}';
    document.head.appendChild(s);
  }

  function mountToggle() {
    if (document.getElementById('altorra-lang-toggle')) return;
    injectCSS();
    var wrap = document.createElement('div');
    wrap.className = 'lang-toggle';
    wrap.id = 'altorra-lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language');
    wrap.innerHTML =
      '<button type="button" data-lang="es" aria-label="Español">ES</button>' +
      '<button type="button" data-lang="en" aria-label="English">EN</button>';
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.getAttribute('data-lang'));
    });
    document.body.appendChild(wrap);
    updateToggle();
  }

  function updateToggle() {
    var wrap = document.getElementById('altorra-lang-toggle');
    if (!wrap) return;
    var btns = wrap.querySelectorAll('button[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute('data-lang') === state.lang;
      btns[i].classList.toggle('active', isActive);
    }
  }

  // ── MutationObserver: translate new DOM nodes when lang is EN ──

  function startObserver() {
    var observer = new MutationObserver(function (muts) {
      if (state.lang === 'es') return;
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) {
            translateDOM(added[j], ES_TO_EN, PLACEHOLDER_ES_EN);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Init ──

  function init() {
    var stored = getStored();
    state.lang = (stored === 'en') ? 'en' : 'es';
    mountToggle();
    startObserver();

    // If lang is EN, translate everything after a short delay
    // (gives header/footer time to inject)
    if (state.lang === 'en') {
      translatePage();
      setTimeout(translatePage, 600);
      setTimeout(translatePage, 1500);
    }

    // Also re-translate after components load
    window.addEventListener('altorra:components-ready', function () {
      if (state.lang === 'en') setTimeout(translatePage, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AltorraI18n = {
    t: function (txt) { return state.lang === 'en' ? (ES_TO_EN[txt] || txt) : txt; },
    setLang: setLang,
    toggle: function () { setLang(state.lang === 'es' ? 'en' : 'es'); },
    getLang: function () { return state.lang; }
  };
})();
