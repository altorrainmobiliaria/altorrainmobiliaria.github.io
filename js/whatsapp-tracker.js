/**
 * whatsapp-tracker.js — WhatsApp click tracking with UTM + Firestore logging
 * Altorra Inmobiliaria
 *
 * Intercepts all wa.me clicks, appends UTM params to the message,
 * and logs the event to Firestore collection `analytics_events`.
 */

(function () {
  'use strict';

  var WA_PHONE = '573002439810';

  function getPageContext() {
    var path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'home';
    var params = new URLSearchParams(window.location.search);
    return {
      page: path,
      propertyId: params.get('id') || null,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
    };
  }

  function buildUTMSuffix(source, medium, campaign) {
    return '\n\n---\nRef: ' + source + '/' + medium + '/' + campaign;
  }

  function extractPropertyFromPage() {
    var title = document.querySelector('.prop-title, .property-title, h1');
    var id = new URLSearchParams(window.location.search).get('id');
    return {
      id: id || null,
      title: title ? title.textContent.trim().slice(0, 80) : null,
    };
  }

  function categorizeSource(link) {
    var el = link;
    if (el.classList.contains('whatsapp-float')) return 'float_button';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.contact-section, .contact-form, form')) return 'contact_form';
    if (el.closest('.property-actions, .prop-actions')) return 'property_card';
    if (el.closest('.cta-section, .publish-section')) return 'cta_section';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.sidebar, aside')) return 'sidebar';
    return 'inline';
  }

  async function logToFirestore(eventData) {
    try {
      if (!window.db) return;
      var mods = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      var ref = mods.collection(window.db, 'analytics_events');
      await mods.addDoc(ref, Object.assign({}, eventData, {
        createdAt: mods.serverTimestamp(),
      }));
    } catch (e) {
      // Non-critical — don't block user
    }
  }

  function handleWhatsAppClick(e) {
    var link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;

    var ctx = getPageContext();
    var source = categorizeSource(link);
    var property = extractPropertyFromPage();

    // Build UTM campaign string
    var campaign = ctx.page;
    if (property.id) campaign += '_' + property.id;

    // Append UTM tracking suffix to the WhatsApp message
    var href = link.getAttribute('href') || '';
    var url;
    try {
      url = new URL(href.startsWith('http') ? href : 'https:' + href);
    } catch (_) {
      return; // malformed, let it pass
    }

    var existingText = url.searchParams.get('text') || '';
    var utmSuffix = buildUTMSuffix('web', source, campaign);
    url.searchParams.set('text', existingText + utmSuffix);
    link.setAttribute('href', url.toString());

    // Log to Firestore (async, non-blocking)
    var eventData = {
      type: 'whatsapp_click',
      source: source,
      page: ctx.page,
      propertyId: property.id,
      propertyTitle: property.title,
      referrer: ctx.referrer,
      userAgent: navigator.userAgent.slice(0, 200),
      screenWidth: window.innerWidth,
      lang: document.documentElement.lang || 'es',
    };

    logToFirestore(eventData);

    // Also track in Firebase Analytics if available
    if (window.AltorraAnalytics && window.AltorraAnalytics.track) {
      window.AltorraAnalytics.track('whatsapp_click_detailed', {
        source: source,
        page: ctx.page,
        property_id: property.id,
      });
    }
  }

  // Intercept all WhatsApp clicks (capture phase for priority)
  document.addEventListener('click', handleWhatsAppClick, true);

  // Also handle dynamically added links via MutationObserver
  // (header/footer loaded by components.js)
  var observer = new MutationObserver(function () {
    // No action needed — click delegation handles new links automatically
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.AltorraWhatsApp = {
    buildLink: function (text, source) {
      var ctx = getPageContext();
      var utm = buildUTMSuffix('web', source || 'api', ctx.page);
      return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text + utm);
    },
    track: function (source, propertyId) {
      logToFirestore({
        type: 'whatsapp_click',
        source: source || 'api',
        page: getPageContext().page,
        propertyId: propertyId || null,
      });
    },
  };
})();
