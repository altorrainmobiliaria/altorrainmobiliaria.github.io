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

    // ═══ Landing: Comprar apartamento ═══
    'Guia de compra 2026':            'Buying guide 2026',
    'Comprar Apartamento en':         'Buy an Apartment in',
    'Precios por zona, pasos legales y las mejores oportunidades del mercado inmobiliario en la Heroica.':
      'Prices by zone, legal steps and the best opportunities in the Cartagena real estate market.',
    'Zonas para comprar apartamento': 'Zones to buy an apartment',
    'Cartagena ofrece opciones para todos los presupuestos y estilos de vida.':
      'Cartagena offers options for every budget and lifestyle.',
    'Premium':                        'Premium',
    'Consolidada':                    'Established',
    'Emergente':                      'Emerging',
    'Valorización':                   'Appreciation',
    'Estrato':                        'Stratum',
    'Pasos para comprar tu apartamento': 'Steps to buy your apartment',
    'El proceso completo, desde la búsqueda hasta la escrituración.':
      'The complete process, from search to deed.',
    'Define tu presupuesto':          'Define your budget',
    'Incluye cuota inicial (30%), gastos notariales (1-2%), impuestos de registro y cuota de administración mensual.':
      'Include down payment (30%), notary fees (1-2%), registration taxes and monthly maintenance fee.',
    'Elige la zona':                  'Choose the zone',
    'Considera tu objetivo: vivienda, inversión o renta turística. Cada zona tiene un perfil diferente de rentabilidad.':
      'Consider your goal: living, investment or vacation rental. Each zone has a different profitability profile.',
    'Visita propiedades':             'Visit properties',
    'Agenda visitas presenciales o virtuales. Verifica el estado real del inmueble, zonas comunes y administración.':
      'Schedule in-person or virtual visits. Verify the property\'s real condition, common areas and management.',
    'Estudio de títulos':             'Title study',
    'Un abogado revisa el certificado de libertad y tradición, verifica que no haya embargos, hipotecas o litigios.':
      'A lawyer reviews the title certificate, checks for liens, mortgages or litigation.',
    'Oferta y negociación':           'Offer and negotiation',
    'Presenta una oferta formal. Negocia precio, forma de pago y plazos. Se firma promesa de compraventa.':
      'Submit a formal offer. Negotiate price, payment terms and deadlines. Sign a purchase promise.',
    'Escrituración':                  'Deed execution',
    'Firma ante notaría, pago de impuestos de registro y escrituración. Registro en Oficina de Instrumentos Públicos.':
      'Sign at notary, pay registration taxes. Register at the Public Instruments Office.',
    'Consejos clave antes de comprar': 'Key tips before buying',
    'Lo que los expertos recomiendan verificar antes de firmar.':
      'What experts recommend verifying before signing.',
    'Revisa el certificado de libertad y tradición': 'Review the title certificate',
    'Asegúrate de que no existan gravámenes, embargos o anotaciones pendientes sobre el inmueble.':
      'Make sure there are no encumbrances, liens or pending notes on the property.',
    'Consulta la administración':     'Check the HOA',
    'Verifica el monto de la cuota, el estado financiero del edificio y si hay derramas o cuotas extras pendientes.':
      'Verify the fee amount, the building\'s financial status and any pending special assessments.',
    'Confirma los metros reales':     'Confirm the real square meters',
    'El área privada escriturada puede diferir del área construida. Pide el plano actualizado.':
      'The deeded private area may differ from the built area. Request the updated floor plan.',
    'Evalúa riesgos ambientales':     'Assess environmental risks',
    'En zonas costeras, verifica la resistencia a salinidad, nivel de inundación y estado de la estructura.':
      'In coastal areas, verify salinity resistance, flood level and structural condition.',
    'Calcula el retorno real':        'Calculate the real return',
    'Si es inversión, proyecta el ROI considerando administración, impuestos, vacancia y costos de operación Airbnb.':
      'If it\'s an investment, project the ROI considering HOA, taxes, vacancy and Airbnb operating costs.',
    'Contrata un abogado inmobiliario': 'Hire a real estate lawyer',
    'El costo es mínimo comparado con el riesgo. Un profesional verifica títulos, redacta contratos y protege tu inversión.':
      'The cost is minimal compared to the risk. A professional verifies titles, drafts contracts and protects your investment.',
    'Preguntas frecuentes':           'Frequently asked questions',
    'Resolvemos las dudas más comunes sobre comprar en Cartagena.':
      'We answer the most common questions about buying in Cartagena.',
    '¿Cuánto cuesta un apartamento en Cartagena?': 'How much does an apartment in Cartagena cost?',
    '¿Qué documentos necesito para comprar?': 'What documents do I need to buy?',
    '¿Un extranjero puede comprar apartamento en Colombia?':
      'Can a foreigner buy an apartment in Colombia?',
    '¿Cuáles son los costos adicionales de la compra?':
      'What are the additional costs of buying?',
    '¿Qué zona es mejor para inversión?': 'Which zone is best for investment?',
    '¿Listo para encontrar tu apartamento?': 'Ready to find your apartment?',
    'Nuestros asesores te acompañan en todo el proceso: búsqueda, negociación, estudio legal y escrituración.':
      'Our advisors accompany you throughout the process: search, negotiation, legal study and deed execution.',
    'Ver propiedades en venta':       'View properties for sale',
    'Hablar con un asesor':           'Talk to an advisor',

    // ═══ Landing: Arrendar apartamento ═══
    'Arriendos 2026':                 'Rentals 2026',
    'Arrendar Apartamento en':        'Rent an Apartment in',
    'Cánones por zona, contratos seguros y asesoría legal para encontrar tu hogar ideal en la Heroica.':
      'Rent prices by zone, secure contracts and legal advice to find your ideal home in Cartagena.',
    'Precios de arriendo por zona':   'Rental prices by zone',
    'Cánones mensuales actualizados para apartamentos en las principales zonas de Cartagena.':
      'Updated monthly rent rates for apartments in the main areas of Cartagena.',
    'Amoblados':                      'Furnished',
    'Vista al mar':                   'Ocean view',
    'Portería 24h':                   '24h Concierge',
    'Familiar':                       'Family-friendly',
    'Tranquilo':                      'Quiet',
    'Bien conectado':                 'Well connected',
    'Moderno':                        'Modern',
    'Cerca aeropuerto':               'Near airport',
    'Precio accesible':               'Affordable',
    'Residencial':                    'Residential',
    'Vista bahía':                    'Bay view',
    'Colegios':                       'Schools',
    'Económico':                      'Budget',
    'Playa':                          'Beach',
    'En desarrollo':                  'Developing',
    'Colonial':                       'Colonial',
    'Cultural':                       'Cultural',
    'Turístico':                      'Touristic',
    '¿Qué necesitas para arrendar?':  'What do you need to rent?',
    'Documentos y requisitos habituales en Cartagena.':
      'Usual documents and requirements in Cartagena.',
    'Cédula de ciudadanía o pasaporte vigente (extranjeros)':
      'National ID card or valid passport (foreigners)',
    'Certificado laboral con antigüedad y salario, o declaración de renta':
      'Employment certificate with tenure and salary, or income tax return',
    'Referencias personales y comerciales (2 de cada una)':
      'Personal and commercial references (2 of each)',
    'Fiador con finca raíz o póliza de arrendamiento (Seguros Bolívar, Sura, Liberty)':
      'Guarantor with real estate or rental insurance (Bolívar, Sura, Liberty)',
    'Depósito de garantía: generalmente 1-2 meses de canon anticipado':
      'Security deposit: usually 1-2 months rent in advance',
    'Contrato mínimo de 12 meses (Ley 820 de 2003)':
      'Minimum 12-month contract (Law 820 of 2003)',
    'Arriendo tradicional vs. por días': 'Traditional rental vs. short-term',
    'Comparación para propietarios que quieren arrendar su apartamento.':
      'Comparison for owners who want to rent their apartment.',
    'Aspecto':                        'Aspect',
    'Arriendo tradicional':           'Traditional rental',
    'Arriendo por días':              'Short-term rental',
    'Ingreso mensual':                'Monthly income',
    'Gestión':                        'Management',
    'Desgaste':                       'Wear and tear',
    'Regulación':                     'Regulation',
    'Mejor para':                     'Best for',
    'Mínima':                         'Minimal',
    'Alta (limpieza, check-in)':      'High (cleaning, check-in)',
    'Bajo':                           'Low',
    'Medio-Alto':                     'Medium-High',
    'Ley 820 clara':                  'Clear Law 820',
    'RNT obligatorio':                'RNT required',
    'Estabilidad':                    'Stability',
    'Maximizar ingreso':              'Maximize income',
    '¿Quieres gestionar tu propiedad en renta turística?':
      'Want to manage your property as a vacation rental?',
    'Conoce nuestro servicio →':      'Learn about our service →',
    'Encuentra tu apartamento ideal': 'Find your ideal apartment',
    'Te ayudamos con la búsqueda, verificación legal y firma de contrato con todas las garantías.':
      'We help with the search, legal verification and contract signing with all guarantees.',
    'Ver arriendos disponibles':      'View available rentals',
    'Contactar asesor':               'Contact advisor',
    '¿Cuánto cuesta arrendar un apartamento en Cartagena?':
      'How much does it cost to rent an apartment in Cartagena?',
    '¿Qué documentos necesito para arrendar en Cartagena?':
      'What documents do I need to rent in Cartagena?',
    '¿Cuánto dura un contrato de arriendo en Colombia?':
      'How long is a rental contract in Colombia?',

    // ═══ Landing: Invertir Airbnb ═══
    'Renta turistica 2026':           'Vacation rental 2026',
    'Invertir en Airbnb en':          'Invest in Airbnb in',
    'Zonas con mayor ocupación, ROI esperado, costos operativos y todo lo que necesitas saber para invertir en renta turística.':
      'Zones with highest occupancy, expected ROI, operating costs and everything you need to know to invest in vacation rentals.',
    'ROI por zona para Airbnb':       'ROI by zone for Airbnb',
    'Rentabilidad estimada basada en ocupación promedio y tarifas de mercado 2026.':
      'Estimated profitability based on average occupancy and 2026 market rates.',
    'ROI Alto':                       'High ROI',
    'ROI Medio-Alto':                 'Medium-High ROI',
    'Tarifa/noche':                   'Rate/night',
    'ROI neto anual':                 'Net annual ROI',
    'Costos operativos de un Airbnb': 'Airbnb operating costs',
    'Lo que debes incluir en tu proyección financiera antes de invertir.':
      'What you must include in your financial projection before investing.',
    'Administración del edificio':    'Building HOA',
    'Cuota fija mensual':             'Fixed monthly fee',
    'Servicios públicos':             'Utilities',
    'Agua, luz, gas, internet, TV':   'Water, electricity, gas, internet, TV',
    'Limpieza':                       'Cleaning',
    'Por check-out (2-4 por semana)': 'Per check-out (2-4 per week)',
    'Lavandería':                     'Laundry',
    'Sábanas, toallas, mantelería':   'Sheets, towels, linens',
    'Amenities y suministros':        'Amenities and supplies',
    'Jabón, papel, café, agua':       'Soap, paper, coffee, water',
    'Reparaciones, pintura, AC':      'Repairs, painting, AC',
    'Comisión plataforma':            'Platform commission',
    'Airbnb: 3% host + 14% guest':    'Airbnb: 3% host + 14% guest',
    'Operador / Co-host':             'Operator / Co-host',
    'Si delegas la gestión':          'If you delegate management',
    'Usa nuestra':                    'Use our',
    'calculadora de rentabilidad':    'profitability calculator',
    'para proyectar tu ROI con estos costos.': 'to project your ROI with these costs.',
    'Requisitos legales':             'Legal requirements',
    'Cumplir con la ley protege tu inversión y evita multas.':
      'Complying with the law protects your investment and avoids fines.',
    'Registro Nacional de Turismo (RNT)': 'National Tourism Registry (RNT)',
    'obligatorio desde 2019 para todo alojamiento turístico. Se tramita en la Cámara de Comercio de Cartagena. Vigencia: 1 año renovable.':
      'mandatory since 2019 for all tourist accommodation. Filed at the Cartagena Chamber of Commerce. Validity: 1 year renewable.',
    'Autorización del edificio':      'Building authorization',
    'muchas copropiedades requieren aprobación de la asamblea para permitir renta por días. Verifica el reglamento de propiedad horizontal antes de comprar.':
      'many buildings require HOA approval for short-term rentals. Check the condo bylaws before buying.',
    'Impuestos':                      'Taxes',
    'debes declarar los ingresos por renta turística como renta ordinaria. Si facturas más de 3.500 UVT/año, debes registrarte como responsable de IVA (19%).':
      'you must declare vacation rental income as ordinary income. If you bill more than 3,500 UVT/year, you must register as a VAT payer (19%).',
    'Reporte DANE':                   'DANE Report',
    'los operadores de alojamiento deben reportar estadísticas de ocupación al DANE a través del sistema PST.':
      'accommodation operators must report occupancy statistics to DANE through the PST system.',
    'Seguro de responsabilidad civil': 'Liability insurance',
    'recomendado para protegerte contra daños a huéspedes o terceros. Airbnb incluye AirCover pero un seguro propio es más completo.':
      'recommended to protect against damages to guests or third parties. Airbnb includes AirCover but your own insurance is more complete.',
    '¿Quieres invertir en renta turística?': 'Want to invest in vacation rentals?',
    'Identificamos las mejores oportunidades y te ayudamos con la compra, adecuación y operación de tu Airbnb.':
      'We identify the best opportunities and help you with the purchase, setup and operation of your Airbnb.',
    'Ver propiedades para inversión': 'View investment properties',
    'Servicio de renta turística':    'Vacation rental service',
    '¿Cuánto se gana con Airbnb en Cartagena?': 'How much do you earn with Airbnb in Cartagena?',
    '¿Necesito RNT para Airbnb en Cartagena?': 'Do I need RNT for Airbnb in Cartagena?',
    '¿Cuál es la mejor zona para Airbnb en Cartagena?': 'Which is the best zone for Airbnb in Cartagena?',

    // ═══ Landing: Barú / La Boquilla ═══
    'Zonas emergentes 2026':          'Emerging zones 2026',
    'Propiedades en':                 'Properties in',
    'Las zonas con mayor potencial de valorización en la región de Cartagena. Lotes, casas y apartamentos frente al mar.':
      'The zones with the highest appreciation potential in the Cartagena region. Lots, houses and oceanfront apartments.',
    'Dos destinos, una oportunidad':  'Two destinations, one opportunity',
    'Barú y La Boquilla son los polos de desarrollo más importantes fuera del casco urbano de Cartagena.':
      'Barú and La Boquilla are the most important development hubs outside the Cartagena urban area.',
    'Isla de Barú':                   'Barú Island',
    'El nuevo destino de lujo del Caribe colombiano': 'The new luxury destination in the Colombian Caribbean',
    'Expansión urbana con frente de playa': 'Urban expansion with beachfront',
    'Distancia a Cartagena':          'Distance to Cartagena',
    'Distancia al centro':            'Distance to downtown',
    'Acceso':                         'Access',
    'Vía Anillo Vial':                'Via Ring Road',
    'Playa Blanca — la más visitada de Colombia': 'Playa Blanca — the most visited beach in Colombia',
    'Proyectos hoteleros internacionales en desarrollo': 'International hotel projects under development',
    'Lotes desde 500 m² con acceso a playa': 'Lots from 500 m² with beach access',
    'Anillo Vial de Barú redujo el tiempo de acceso': 'The Barú Ring Road reduced access time',
    'Potencial de renta turística premium': 'Premium vacation rental potential',
    'Proyectos nuevos con amenidades completas': 'New projects with full amenities',
    'Centro comercial Serrezuela Mall a 10 min': 'Serrezuela Mall shopping center 10 min away',
    'Frente de playa con deportes acuáticos': 'Beachfront with water sports',
    'Gastronomía local reconocida':   'Renowned local gastronomy',
    'Precios hasta 60% menores que Bocagrande': 'Prices up to 60% lower than Bocagrande',
    '¿Por qué invertir ahora?':       'Why invest now?',
    'El momento ideal es antes del boom — y estos destinos están en plena curva de crecimiento.':
      'The ideal moment is before the boom — and these destinations are in full growth curve.',
    'Infraestructura en desarrollo':  'Infrastructure under development',
    'El Anillo Vial de Barú, la ampliación del aeropuerto y nuevas vías aceleran la conectividad y el turismo.':
      'The Barú Ring Road, airport expansion and new roads accelerate connectivity and tourism.',
    'Precios aún accesibles':         'Prices still affordable',
    'Los precios por m² en estas zonas son 40-60% menores que en Bocagrande. La plusvalía compensa en 3-5 años.':
      'Prices per m² in these zones are 40-60% lower than Bocagrande. Appreciation pays off in 3-5 years.',
    'Turismo en auge':                'Booming tourism',
    'Barú recibe más de 1 millón de visitantes al año. Hoteles de cadenas internacionales están llegando.':
      'Barú receives more than 1 million visitors per year. International chain hotels are arriving.',
    'Estilo de vida':                 'Lifestyle',
    'Playa, naturaleza y tranquilidad a minutos de la ciudad. Perfecto para retiro, segunda vivienda o Airbnb.':
      'Beach, nature and tranquility minutes from the city. Perfect for retirement, second home or Airbnb.',
    '¿Interesado en Barú o La Boquilla?': 'Interested in Barú or La Boquilla?',
    'Te conectamos con las mejores oportunidades antes de que lleguen al mercado abierto.':
      'We connect you with the best opportunities before they reach the open market.',
    'Ver propiedades disponibles':    'View available properties',
    'Consultar por WhatsApp':         'Inquire via WhatsApp',

    // ═══ Landing: Lotes campestres ═══
    'Terrenos y lotes 2026':          'Land & lots 2026',
    'Lotes Campestres en':            'Country Lots in',
    'Terrenos, fincas y lotes rurales en las zonas con mayor potencial de desarrollo cerca de la Heroica.':
      'Land, farms and rural lots in the zones with the highest development potential near Cartagena.',
    'Zonas disponibles':              'Available zones',
    'Las mejores ubicaciones para lotes campestres en la región de Cartagena.':
      'The best locations for country lots in the Cartagena region.',
    'Barú — Zona Playa':              'Barú — Beach Zone',
    'Isla de Barú, a 45 min de Cartagena': 'Barú Island, 45 min from Cartagena',
    'Turbaco':                        'Turbaco',
    'A 20 min de Cartagena, vía principal': '20 min from Cartagena, main road',
    'Arjona':                         'Arjona',
    'A 30 min por la Troncal':        '30 min via the Highway',
    'Zona Norte — La Boquilla':       'North Zone — La Boquilla',
    'Corredor norte, cerca a la ciudad': 'North corridor, near the city',
    'Lotes desde':                    'Lots from',
    'Turístico / Resort':             'Tourism / Resort',
    'Residencial / Finca':            'Residential / Farm',
    'Agrícola / Ganadero':            'Agricultural / Livestock',
    'Construcción / Mixto':           'Construction / Mixed',
    'Lotes frente al mar o con acceso a playa. Zona en pleno desarrollo turístico con proyectos hoteleros de cadenas internacionales.':
      'Oceanfront lots or with beach access. Area in full tourist development with international chain hotel projects.',
    'Clima más fresco que Cartagena. Conjuntos campestres cerrados con seguridad. Ideal para casa de descanso o residencia permanente.':
      'Cooler climate than Cartagena. Gated country communities with security. Ideal for vacation home or permanent residence.',
    'Terrenos amplios a precios accesibles. Ideal para proyectos agropecuarios, glamping o fincas recreativas.':
      'Large tracts at affordable prices. Ideal for agricultural projects, glamping or recreational farms.',
    'La expansión natural de Cartagena. Lotes urbanos y suburbanos para proyectos inmobiliarios o vivienda unifamiliar.':
      'The natural expansion of Cartagena. Urban and suburban lots for real estate projects or single-family homes.',
    'Usos para tu lote':              'Uses for your lot',
    'Múltiples opciones de desarrollo según tu objetivo de inversión.':
      'Multiple development options based on your investment goal.',
    'Casa campestre':                 'Country house',
    'Diseña tu hogar rodeado de naturaleza. Fines de semana, retiro o residencia permanente.':
      'Design your home surrounded by nature. Weekends, retreat or permanent residence.',
    'Glamping / Ecoturismo':          'Glamping / Ecotourism',
    'Turismo experiencial en auge. Retorno alto con inversión inicial moderada.':
      'Booming experiential tourism. High returns with moderate initial investment.',
    'Proyecto agrícola':              'Agricultural project',
    'Cultivos tropicales, cacao, coco o ganadería con acceso a mercados de Cartagena.':
      'Tropical crops, cocoa, coconut or livestock with access to Cartagena markets.',
    'Desarrollo inmobiliario':        'Real estate development',
    'Lotes urbanos para construir y vender. Alta demanda en zonas de expansión.':
      'Urban lots to build and sell. High demand in expansion zones.',
    'Antes de comprar un lote: verifica': 'Before buying a lot: verify',
    'Aspectos legales y técnicos que debes revisar antes de invertir en terreno.':
      'Legal and technical aspects to review before investing in land.',
    'Certificado de libertad':        'Title certificate',
    'Verifica que el lote no tenga embargo, hipoteca, litigio o falsa tradición.':
      'Verify the lot has no liens, mortgages, litigation or false title.',
    'Uso del suelo (POT)':            'Land use (POT)',
    'Confirma que el Plan de Ordenamiento Territorial permite el uso que planeas.':
      'Confirm the Territorial Planning Plan allows the use you plan.',
    '¿Hay acceso a agua, luz y alcantarillado? Si no, ¿cuánto cuesta llevarlos?':
      'Is there access to water, electricity and sewage? If not, how much does it cost to bring them?',
    'Acceso vial':                    'Road access',
    'Servidumbre de paso, estado de la vía y distancia a la carretera principal.':
      'Right of way, road condition and distance to the main highway.',
    'Riesgo ambiental':               'Environmental risk',
    'Zonas inundables, manglares protegidos, retiro de cuerpos de agua.':
      'Flood zones, protected mangroves, water body setbacks.',
    'Linderos y topografía':          'Boundaries and topography',
    'Levantamiento topográfico y verificación de linderos con colindantes.':
      'Topographic survey and boundary verification with neighbors.',
    '¿Buscas un lote campestre?':     'Looking for a country lot?',
    'Te ayudamos a encontrar el terreno ideal y verificamos toda la documentación legal.':
      'We help you find the ideal land and verify all legal documentation.',
    'Ver propiedades':                'View properties',
    'Solicitar asesoría':             'Request consultation',

    // ═══ Contacto ═══
    'Contactar por WhatsApp':         'Contact via WhatsApp',
    'Información de contacto':        'Contact information',
    'Teléfono:':                      'Phone:',
    'Email:':                         'Email:',
    'Ciudad:':                        'City:',
    'Cartagena de Indias, Bolívar (CO)': 'Cartagena de Indias, Bolívar (CO)',
    'Lun–Sáb 8:00–18:00':             'Mon–Sat 8:00–18:00',
    'Generador de mensaje inteligente': 'Smart message generator',
    'Arma un mensaje claro y abre WhatsApp con un toque.':
      'Compose a clear message and open WhatsApp with one tap.',
    'Interés':                        'Interest',
    'Barrio / zona (opcional)':       'Neighborhood / area (optional)',
    'Quiero información':             'I want information',
    'Esta semana':                    'This week',
    'Cuéntanos brevemente cómo podemos ayudarte…':
      'Tell us briefly how we can help you…',
    'Autorizo el tratamiento de mis datos para recibir información relacionada con los servicios de Altorra.':
      'I authorize the processing of my data to receive information about Altorra\'s services.',
    'Publicar propiedad':             'List property',

    // ═══ Blog ═══
    'Guías de inversión inmobiliaria en Cartagena':
      'Real estate investment guides in Cartagena',
    'Vista de Cartagena':             'View of Cartagena',
    'Propiedad en renta':             'Rental property',
    'min lectura':                    'min read',
    '¿Por qué invertir en Cartagena en 2026?':
      'Why invest in Cartagena in 2026?',
    'Cartagena se consolida como uno de los mercados inmobiliarios más atractivos de Latinoamérica. Descubre las razones clave y los datos que respaldan esta tendencia.':
      'Cartagena is consolidating as one of the most attractive real estate markets in Latin America. Discover the key reasons and data behind this trend.',
    'Renta turística vs arriendo tradicional: ¿Qué es más rentable?':
      'Vacation rental vs traditional rental: which is more profitable?',
    'Comparamos ingresos, ocupación, gastos y ROI real entre ambas modalidades para propiedades en las zonas premium de Cartagena.':
      'We compare income, occupancy, expenses and real ROI between both modalities for properties in premium Cartagena areas.',
    'Guía legal para inversionistas extranjeros en Colombia':
      'Legal guide for foreign investors in Colombia',
    'Todo lo que necesitas saber sobre impuestos, visas de inversionista, escrituración y trámites para comprar propiedad en Colombia.':
      'Everything you need to know about taxes, investor visas, deed execution and procedures to buy property in Colombia.',
    'Guías, análisis de mercado y consejos para invertir en bienes raíces en Cartagena de Indias.':
      'Guides, market analysis and tips to invest in real estate in Cartagena de Indias.',
    'Inversión':                      'Investment',
    'Rentabilidad':                   'Profitability',
    'Legal':                          'Legal',

    // ═══ Detalle de propiedad comunes ═══
    'Detalles':                       'Details',
    'Mapa':                           'Map',
    'Compartir':                      'Share',
    'Solicitar visita':               'Request visit',
    'Habitaciones':                   'Bedrooms',
    'Garajes':                        'Parking spaces',
    'Piso':                           'Floor',
    'Estudio de títulos y acompañamiento legal': 'Title study and legal accompaniment',
    'Asesoría jurídica y acompañamiento integral.': 'Legal advice and comprehensive accompaniment.',
    'Año de construcción':            'Year built',
    'Administración':                 'HOA fee',
    'Cuota administración':           'Monthly HOA',
    'COP':                            'COP',
    'Ver más':                        'See more',
    'Ver menos':                      'See less',
    'Cerrar':                         'Close',
    'Enviar solicitud':               'Send request',
    'Tu nombre':                      'Your name',
    'Tu teléfono':                    'Your phone',
    'Tu email':                       'Your email',
    'Tu mensaje':                     'Your message',

    // ═══ Privacidad / Legal ═══
    'Política de privacidad':         'Privacy Policy',
    'Términos y condiciones':         'Terms and conditions',
    '1. Responsable del Tratamiento': '1. Data Controller',
    '2. Alcance y Base Legal':        '2. Scope and Legal Basis',
    '3. Datos que recopilamos':       '3. Data we collect',
    '4. Finalidades del tratamiento': '4. Purpose of processing',
    '5. Legitimación':                '5. Legal basis',
    '6. Conservación':                '6. Data retention',
    '7. Compartición y transferencias': '7. Sharing and transfers',
    '8. Derechos del titular (ARCO)': '8. Data subject rights (ARCO)',
    '9. Seguridad de la información': '9. Information security',
    '10. Menores de edad':            '10. Minors',
    '11. Cookies y analítica':        '11. Cookies and analytics',
    '12. Canales de contacto':        '12. Contact channels',

    // ═══ Propiedad: listados ═══
    'Cargar más':                     'Load more',
    'Resultados de búsqueda':         'Search results',
    'Filtros':                        'Filters',
    'Limpiar filtros':                'Clear filters',
    'Aplicar':                        'Apply',
    'Tipo':                           'Type',
    'Operación':                      'Operation',
    'Barrio':                         'Neighborhood',
    'Presupuesto mínimo':             'Min budget',
    'Presupuesto máximo':             'Max budget',
    'Habitaciones mínimas':           'Min bedrooms',
    'Baños mínimos':                  'Min bathrooms',
    'Área mínima (m²)':               'Min area (m²)',
    'Área máxima (m²)':               'Max area (m²)',
    'Buscar propiedades':             'Search properties',
    'Buscar propiedad':               'Search property',
    'No se encontraron resultados.':  'No results found.',
    'Relevancia':                     'Relevance',
    'Más antiguos':                   'Oldest',

    // ═══ Favoritos ═══
    'Mis Favoritos':                  'My Favorites',
    'Agregar a favoritos':            'Add to favorites',
    'Quitar de favoritos':            'Remove from favorites',
    'Aún no tienes favoritos':        'You don\'t have favorites yet',
    'Explora el catálogo y guarda las propiedades que te interesan.':
      'Browse the catalog and save the properties you\'re interested in.',

    // ═══ Publicar propiedad ═══
    'Publica tu propiedad':           'List your property',
    'Llena el formulario y nos pondremos en contacto contigo en menos de 24 horas.':
      'Fill out the form and we\'ll contact you within 24 hours.',
    'Tipo de inmueble':               'Property type',
    'Ciudad':                         'City',
    'Dirección aproximada':           'Approximate address',
    'Precio aproximado':              'Approximate price',
    'Descripción breve':              'Brief description',
    'Subir fotos':                    'Upload photos',

    // ═══ Avalúo ═══
    'Avalúo comercial gratuito':      'Free property appraisal',
    'Solicita un avalúo':             'Request an appraisal',
    'Nuestros peritos evalúan tu propiedad en 48 horas.':
      'Our experts evaluate your property in 48 hours.',

    // ═══ Gracias ═══
    'Gracias por tu mensaje':         'Thank you for your message',
    'Hemos recibido tu solicitud y nos pondremos en contacto contigo en menos de 24 horas.':
      'We\'ve received your request and will contact you within 24 hours.',
    'Volver al inicio':               'Back to home',

    // ═══ Simulador ═══
    'Simulador de crédito':           'Mortgage simulator',
    'Estima tu cuota mensual en segundos. Solo ingresa el precio, la cuota inicial y el plazo.':
      'Estimate your monthly payment in seconds. Just enter the price, down payment and term.',
    '¿Cómo funciona el simulador?':   'How does the simulator work?',
    'Ingresa el precio':              'Enter the price',
    'El valor total de la propiedad que quieres financiar.':
      'The total value of the property you want to finance.',
    'Define la cuota inicial':        'Define the down payment',
    'Mínimo 30% para créditos no-VIS. 20% para VIS con subsidio.':
      'Minimum 30% for non-VIS loans. 20% for VIS with subsidy.',
    'Elige el plazo':                 'Choose the term',
    'Hasta 30 años. A mayor plazo, menor cuota pero más intereses totales.':
      'Up to 30 years. Longer term means lower payment but more total interest.',
    'Las tasas de referencia son orientativas. Consulta con tu banco para condiciones reales.':
      'Reference rates are indicative. Check with your bank for actual conditions.',

    // ═══ Genéricos útiles ═══
    'Próximamente':                   'Coming soon',
    'Disponible':                     'Available',
    'Reservado':                      'Reserved',
    'Vendido':                        'Sold',
    'Arrendado':                      'Rented',
    'Nuevo':                          'New',
    'Destacado':                      'Featured',
    'Exclusivo':                      'Exclusive',
    'Amoblado':                       'Furnished',
    'Sin amoblar':                    'Unfurnished',
    'Vista':                          'View',
    'Balcón':                         'Balcony',
    'Terraza':                        'Terrace',
    'Piscina':                        'Pool',
    'Gimnasio':                       'Gym',
    'Ascensor':                       'Elevator',
    'Seguridad 24/7':                 '24/7 Security',
    'Zona BBQ':                       'BBQ area',
    'Aire acondicionado':             'Air conditioning',
    'Zona de lavado':                 'Laundry area',
    'Jardín':                         'Garden',
    'Parqueadero visitantes':         'Visitor parking',

    // ═══ Index / Home específicos ═══
    'Saltar al contenido':            'Skip to content',
    'Saltar al contenido principal':  'Skip to main content',
    'Buscador rápido':                'Quick search',
    'Código de propiedad':            'Property code',
    'Confianza y cobertura':          'Trust and coverage',
    'Ver propiedades en arriendo':    'View rental properties',
    'Explorar inversión en renta turística': 'Explore vacation rental investment',
    'Filtrar por operación':          'Filter by operation',
    'Desplazar carrusel a la izquierda': 'Scroll carousel left',
    'Desplazar carrusel a la derecha': 'Scroll carousel right',
    'Ver apartamentos':               'View apartments',
    'Ver casas':                      'View houses',
    'Ver lotes':                      'View lots',
    'Ver oficinas':                   'View offices',
    'Ver locales comerciales':        'View retail spaces',
    'Ver bodegas':                    'View warehouses',
    'Ver propiedades en Bocagrande':  'View properties in Bocagrande',
    'Ver propiedades en Manga':       'View properties in Manga',
    'Ver propiedades en Castillogrande': 'View properties in Castillogrande',
    'Ver propiedades en Centro Histórico': 'View properties in Historic Center',
    'Ver propiedades en Crespo':      'View properties in Crespo',
    'Ver propiedades en Manzanillo':  'View properties in Manzanillo',

    // ═══ Renta turística específicos ═══
    'Convierte tu propiedad en':      'Turn your property into',
    'ingresos turísticos':            'tourism income',
    'Gestionamos tu propiedad en Airbnb, Booking y canales directos. Tú recibes los ingresos, nosotros nos encargamos de todo.':
      'We manage your property on Airbnb, Booking and direct channels. You receive the income, we handle everything.',
    'Ingreso vs arriendo tradicional': 'Income vs traditional rental',
    'Atención a huéspedes':           'Guest support',
    'Sesión fotográfica con fotógrafo especializado en interiores y tour virtual 360°.':
      'Photo shoot with photographer specialized in interiors and 360° virtual tour.',
    'Airbnb, Booking, Vrbo, Expedia y canales directos con pricing dinámico.':
      'Airbnb, Booking, Vrbo, Expedia and direct channels with dynamic pricing.',
    'Recibimos al huésped, verificamos ID, entregamos llaves y cerramos la estadía.':
      'We welcome the guest, verify ID, hand over keys and close the stay.',
    'Equipo de limpieza tras cada check-out con kit de bienvenida y reposición.':
      'Cleaning team after each check-out with welcome kit and restocking.',
    'Reparaciones menores, gestión de fallas y red de aliados (plomería, electricidad).':
      'Minor repairs, fault management and network of partners (plumbing, electrical).',
    'Respuesta inmediata a consultas en español, inglés y francés.':
      'Immediate response to inquiries in Spanish, English and French.',
    'Dashboard con ingresos, ocupación, reseñas y optimización de tarifas.':
      'Dashboard with income, occupancy, reviews and rate optimization.',
    'Transferencia mensual con desglose detallado. Tú solo te ocupas de cobrar.':
      'Monthly transfer with detailed breakdown. You just collect.',
    'Visitamos tu propiedad y analizamos potencial, tarifa óptima y ocupación proyectada.':
      'We visit your property and analyze potential, optimal rate and projected occupancy.',
    'Sesión de fotos, inventario, dotación si se requiere y publicación en todas las plataformas.':
      'Photo session, inventory, furnishing if needed and publishing on all platforms.',
    'Recibimos reservas, atendemos huéspedes, gestionamos limpieza y mantenimiento.':
      'We receive bookings, attend to guests, manage cleaning and maintenance.',
    'Transferencia mensual con reporte completo. Optimizamos tarifas mes a mes.':
      'Monthly transfer with complete report. We optimize rates month by month.',
    'Característica':                 'Feature',
    'Flexibilidad de uso personal':   'Personal use flexibility',
    'Sí, cuando quieras':              'Yes, whenever you want',
    'Bloqueado 1-3 años':             'Locked 1-3 years',
    'Riesgo de morosidad':            'Default risk',
    'Desgaste de la propiedad':       'Property wear',

    // ═══ Invertir específicos ═══
    'Invertir en':                    'Invest in',
    'Cartagena':                      'Cartagena',
    'Análisis de rentabilidad por zona, casos de éxito reales y oportunidades de inversión inmobiliaria en la Heroica.':
      'Profitability analysis by zone, real success cases and real estate investment opportunities in Cartagena.',
    'Cartagena ha registrado una valorización promedio del 8-12% anual en zonas premium como Bocagrande y Castillogrande.':
      'Cartagena has recorded an average appreciation of 8-12% annually in premium areas like Bocagrande and Castillogrande.',
    'Con más de 4 millones de turistas al año, la demanda de alojamiento por días genera retornos superiores al arriendo tradicional.':
      'With more than 4 million tourists per year, short-term accommodation demand generates higher returns than traditional rental.',
    'Nuevos proyectos de infraestructura (TransCaribe, Puerto de Cruceros, aeropuerto) impulsan la valorización.':
      'New infrastructure projects (TransCaribe, Cruise Port, airport) drive appreciation.',
    'Compradores de EE.UU., Canadá y Europa buscan propiedades en Cartagena por el tipo de cambio favorable y calidad de vida.':
      'Buyers from the US, Canada and Europe seek properties in Cartagena for the favorable exchange rate and quality of life.',
    'Zona más demandada por turistas. Apartamentos frente al mar con alta ocupación en temporada alta (dic-mar, jun-jul).':
      'Most demanded zone by tourists. Oceanfront apartments with high occupancy in high season (Dec-Mar, Jun-Jul).',
    'Exclusiva zona residencial con vista al mar. Propiedades de lujo con alta plusvalía y demanda creciente de extranjeros.':
      'Exclusive residential zone with ocean view. Luxury properties with high appreciation and growing foreign demand.',
    'Barrio bohemio con restaurantes y vida cultural. Atrae turistas que buscan autenticidad cartagenera a mejor precio.':
      'Bohemian neighborhood with restaurants and cultural life. Attracts tourists seeking Cartagena authenticity at better prices.',
    'Patrimonio UNESCO. Las propiedades coloniales reformadas son las más rentables en Airbnb de toda Colombia.':
      'UNESCO Heritage. Restored colonial properties are the most profitable on Airbnb in all of Colombia.',
    'Zona en expansión con proyectos nuevos. Excelente relación precio-rendimiento. Ideal para inversión a mediano plazo.':
      'Expansion zone with new projects. Excellent price-performance ratio. Ideal for medium-term investment.',
    'Propiedades exclusivas de playa con las tarifas por noche más altas de la región. Temporadas pico generan ingresos significativos.':
      'Exclusive beach properties with the highest nightly rates in the region. Peak seasons generate significant income.',
    'Barú / Islas':                   'Barú / Islands',
    'Apartamento en Bocagrande':      'Apartment in Bocagrande',
    '2 hab · 85 m² · Vista al mar':   '2 bed · 85 m² · Ocean view',
    'Casa Colonial en Centro':        'Colonial House in Historic Center',
    'Apto en La Boquilla':            'Apt in La Boquilla',
    'Valorización est.':              'Est. appreciation',
    '+12% anual':                     '+12% annual',
    '+10% anual':                     '+10% annual',
    '+9% anual':                      '+9% annual',
    '+8% anual':                      '+8% annual',
    '+7% anual':                      '+7% annual',
    'Calculadora de rentabilidad Airbnb': 'Airbnb profitability calculator',

    // ═══ Quiénes somos ═══
    'Experiencias que inspiran confianza': 'Experiences that inspire trust',
    'Somos el aliado que protege y potencia tu inversión':
      'We are the partner that protects and empowers your investment',
    'Tu inversión y tu hogar merecen más que una simple transacción: merecen seguridad, legalidad y confianza.':
      'Your investment and home deserve more than a simple transaction: they deserve security, legality and trust.',
    'Misión':                         'Mission',
    'Visión':                         'Vision',
    'Información clara, decisiones sustentadas y comunicación honesta.':
      'Clear information, informed decisions and honest communication.',
    'Acompañamiento integral con responsabilidad y cercanía.':
      'Comprehensive accompaniment with responsibility and closeness.',
    'Seguridad jurídica y procesos rigurosos en cada etapa.':
      'Legal security and rigorous processes at every stage.',
    'Innovación':                     'Innovation',
    'Mejora continua y soluciones modernas para potenciar resultados.':
      'Continuous improvement and modern solutions to boost results.',
    'Calidad superior en servicio, gestión y cumplimiento.':
      'Superior quality in service, management and compliance.',
    'Opiniones de nuestros clientes': 'Our clients\' opinions',
    'Escribir mi reseña':             'Write my review',
    '¿Hablamos sobre tu propiedad?':  'Let\'s talk about your property?',
    'Altorra responde con seguridad jurídica, calidez profesional y resultados.':
      'Altorra responds with legal security, professional warmth and results.',
    'Contactar a Altorra':            'Contact Altorra',
    'Ir a contacto':                  'Go to contact',
    'Familia y asesor inmobiliario en un ambiente cálido, luz de tarde':
      'Family and real estate advisor in a warm atmosphere, afternoon light',

    // ═══ Avalúo ═══
    'Ingresa los datos de tu propiedad y nuestros expertos te contactarán con una estimación del valor de mercado.':
      'Enter your property details and our experts will contact you with a market value estimate.',
    'Datos de la propiedad':          'Property details',
    'Ingresa tu nombre':              'Enter your name',
    'Número válido (10 dígitos)':     'Valid number (10 digits)',
    'Correo electrónico *':           'Email *',
    'Ingresa un correo válido':       'Enter a valid email',
    'Tipo de propiedad *':            'Property type *',
    'Selecciona el tipo':             'Select type',
    '¿Para qué necesita el avalúo?':  'What do you need the appraisal for?',
    'Vender la propiedad':            'Sell the property',
    'Solicitar crédito':              'Request a loan',
    'Herencia / sucesión':            'Inheritance / succession',
    'Ciudad *':                       'City *',
    'Ingresa la ciudad':              'Enter the city',
    'Barrio / Sector':                'Neighborhood / Area',
    '5 o más':                        '5 or more',
    'Precio de referencia (COP) — opcional': 'Reference price (COP) — optional',
    'Información adicional':          'Additional information',
    'Basado en precio/m² promedio de mercado en tu zona. El avalúo oficial de nuestros expertos puede diferir.':
      'Based on average market price/m² in your area. The official appraisal by our experts may differ.',
    'Solicitar avalúo gratuito':      'Request free appraisal',
    '¡Solicitud recibida!':           'Request received!',
    'Un asesor de Altorra se comunicará contigo en menos de 24 horas hábiles con la estimación de tu propiedad.':
      'An Altorra advisor will contact you within 24 business hours with your property estimate.',
    '🏆 ¿Por qué elegir Altorra?':    '🏆 Why choose Altorra?',

    // ═══ Publicar propiedad ═══
    'Vende, arrienda o renta tu inmueble con el respaldo de Altorra Inmobiliaria.':
      'Sell, rent or lease your property with the backing of Altorra Inmobiliaria.',
    '¿Por qué publicar con Altorra?': 'Why publish with Altorra?',
    'Difusión en múltiples canales de venta y arriendo.':
      'Exposure across multiple sales and rental channels.',
    'Amplia red de clientes potenciales.': 'Wide network of potential clients.',
    'Nos encargamos de todo el proceso por ti.':
      'We handle the entire process for you.',
    'Completa el siguiente formulario y un asesor de Altorra se pondrá en contacto contigo para ayudarte a publicar tu inmueble.':
      'Fill out the following form and an Altorra advisor will contact you to help list your property.',
    'Teléfono de contacto':           'Contact phone',
    'Precio estimado (COP)':          'Estimated price (COP)',
    'Descripción de la propiedad':    'Property description',
    'Casa moderna y elegante':        'Modern and elegant house',
    'Cuéntanos: habitaciones, baños, m², parqueadero, amenidades, cercanías...':
      'Tell us: bedrooms, bathrooms, m², parking, amenities, nearby...',

    // ═══ Favoritos ═══
    'Propiedades que has guardado':   'Properties you saved',
    'Limpiar todo':                   'Clear all',
    'No tienes favoritos aún':        'No favorites yet',
    'Explora propiedades y agrega tus favoritos': 'Browse properties and add your favorites',
    'Revisa las propiedades que guardaste como favoritos en Altorra Inmobiliaria.':
      'Review the properties you saved as favorites at Altorra Inmobiliaria.',

    // ═══ Servicios (mantenimiento, mudanzas, turismo) ═══
    'Servicio próximamente':          'Service coming soon',
    'Servicio no disponible en este momento': 'Service not available at this time',
    'Muy pronto estará disponible con Altorra Inmobiliaria':
      'Very soon available with Altorra Inmobiliaria',
    'Estamos afinando los últimos detalles para ofrecerte una experiencia de primer nivel. En breve podrás acceder a este servicio con la seguridad, legalidad y confianza de Altorra.':
      'We\'re fine-tuning the last details to offer you a first-class experience. Soon you\'ll be able to access this service with Altorra\'s security, legality and trust.',
    'Te redirigimos al inicio en':    'Redirecting to home in',
    'Volver al inicio ahora':         'Go back to home now',
    'Si prefieres, guarda esta página y vuelve más tarde. Estamos trabajando para ti.':
      'If you prefer, save this page and come back later. We\'re working for you.',
    'Este servicio aún no está disponible. Muy pronto estará disponible con Altorra Inmobiliaria.':
      'This service is not yet available. Very soon available with Altorra Inmobiliaria.',
    'Muy pronto con Altorra Inmobiliaria': 'Very soon with Altorra Inmobiliaria',
    'Estamos preparando este servicio para ti.': 'We\'re preparing this service for you.',
    'Pausar o reanudar contador':     'Pause or resume timer',
    'Experiencias exclusivas en Cartagena': 'Exclusive experiences in Cartagena',
    'Renta de yates':                 'Yacht rental',
    'Navega la bahia y las Islas del Rosario con estilo':
      'Sail the bay and Rosario Islands in style',
    'Pasadias en islas':              'Island day trips',
    'Playa, sol y mar en las mejores islas de Cartagena':
      'Beach, sun and sea at Cartagena\'s best islands',
    'Planes completos para grupos, familias y parejas':
      'Complete plans for groups, families and couples',
    'Recorre la ciudad amurallada con guias expertos':
      'Tour the walled city with expert guides',

    // ═══ Blog posts - titles ═══
    '¿Por qué invertir en Cartagena en 2026? Guía Completa | Altorra':
      'Why invest in Cartagena in 2026? Complete Guide | Altorra',
    'Análisis completo de las razones por las que Cartagena es uno de los mejores destinos para inversión inmobiliaria en Latinoamérica en 2026.':
      'Complete analysis of why Cartagena is one of the best real estate investment destinations in Latin America in 2026.',
    '15 de abril, 2026 · 8 min lectura': 'April 15, 2026 · 8 min read',
    '10 de abril, 2026 · 10 min lectura': 'April 10, 2026 · 10 min read',
    '5 de abril, 2026 · 12 min lectura': 'April 5, 2026 · 12 min read',
    '1. Valorización constante':      '1. Steady appreciation',
    '2. Boom del turismo':            '2. Tourism boom',
    '3. Infraestructura en expansión': '3. Expanding infrastructure',
    '4. Demanda internacional':       '4. International demand',
    '5. Diversificación de zonas':    '5. Zone diversification',
    '6. Zonas con mayor potencial':   '6. Zones with highest potential',
    '¿Vale la pena invertir?':        'Is it worth investing?',

    // ═══ Privacidad ═══
    'Conozca cómo recopilamos, usamos y protegemos sus datos personales. Seguridad • Legalidad • Confianza.':
      'Learn how we collect, use and protect your personal data. Security • Legality • Trust.',
    '(en adelante, "Altorra") es responsable del tratamiento de los datos personales recolectados a través de sus canales digitales y presenciales.':
      '(hereinafter "Altorra") is responsible for the processing of personal data collected through its digital and in-person channels.',
    'Consentimiento del titular, ejecución de contratos o diligencias precontractuales, cumplimiento de obligaciones legales e interés legítimo para seguridad y mejora del servicio.':
      'Data subject consent, contract execution or pre-contractual steps, legal obligation compliance and legitimate interest for security and service improvement.',
    'Conservamos los datos por el tiempo necesario para la finalidad, relación contractual y plazos legales. Luego se suprimirán o anonimizarán.':
      'We retain data for as long as necessary for the purpose, contractual relationship and legal terms. Then it will be deleted or anonymized.',
    'Acceso, Rectificación, Cancelación/Supresión y Oposición; revocar consentimiento o presentar quejas ante la SIC.':
      'Access, Rectification, Cancellation/Deletion and Opposition; revoke consent or file complaints with SIC.',
    'Aceptar todas':                  'Accept all',
    'Mapa':                           'Map',

    // ═══ Foreign investors (inverso: EN → ES también en ES_TO_EN para coherencia bidireccional) ═══
    'Complete guide for US, Canadian and Spanish investors buying property in Cartagena, Colombia. Legal, tax and financing information.':
      'Guía completa para inversionistas de EE.UU., Canadá y España que compran propiedad en Cartagena, Colombia.',

    // ═══ Varios faltantes útiles ═══
    'Cargando propiedades...':        'Loading properties...',
    'Error al cargar':                'Loading error',
    'Inténtalo de nuevo':             'Try again',
    'Página':                         'Page',
    'de':                             'of',
    'Siguiente':                      'Next',
    'Anterior':                       'Previous',
    'Compartir en WhatsApp':          'Share on WhatsApp',
    'Compartir en Facebook':          'Share on Facebook',
    'Compartir en Twitter':           'Share on Twitter',
    'Copiar enlace':                  'Copy link',
    'Enlace copiado':                 'Link copied',
    'Suscríbete':                     'Subscribe',
    'Newsletter':                     'Newsletter',
    'Recibe las mejores oportunidades directamente en tu correo.':
      'Receive the best opportunities directly in your email.',
    'Suscribirme':                    'Subscribe me',
    'Suscripción exitosa':            'Subscription successful',
    'Ya estás suscrito':              'You are already subscribed',
    'Gracias por suscribirte':        'Thank you for subscribing',
    'Agendar visita':                 'Schedule visit',
    'Selecciona fecha':               'Select date',
    'Selecciona hora':                'Select time',
    'Confirmar cita':                 'Confirm appointment',

    // ═══ Blog post 1: Por qué invertir en Cartagena 2026 ═══
    '¿Por qué invertir en Cartagena en 2026? | Altorra Inmobiliaria':
      'Why invest in Cartagena in 2026? | Altorra Real Estate',
    'El mercado inmobiliario de Cartagena ha mantenido una valorización promedio anual del':
      'Cartagena\'s real estate market has maintained an average annual appreciation of',
    'en las zonas premium durante la última década. Barrios como Bocagrande, Castillogrande y el Centro Histórico lideran esta tendencia gracias a su ubicación estratégica y demanda internacional.':
      'in premium areas during the last decade. Neighborhoods like Bocagrande, Castillogrande and the Historic Center lead this trend thanks to their strategic location and international demand.',
    'Valorización anual promedio':    'Average annual appreciation',
    'Ocupación Airbnb promedio':      'Average Airbnb occupancy',
    'Precio m² promedio COP':         'Average price/m² COP',
    'Este flujo turístico se traduce directamente en demanda de alojamiento de corta estancia, beneficiando a propietarios que operan bajo el modelo de renta turística.':
      'This tourist flow translates directly into demand for short-term accommodation, benefiting owners who operate under the vacation rental model.',
    'Los proyectos de infraestructura en curso transforman la ciudad:':
      'Ongoing infrastructure projects are transforming the city:',
    'Centro de Convenciones ampliado': 'Expanded Convention Center',
    '— aumenta el turismo MICE':       '— increases MICE tourism',
    'Nuevo corredor vial de Crespo':  'New Crespo road corridor',
    '— conectividad al aeropuerto':   '— airport connectivity',
    'Desarrollo de Serena del Mar':   'Serena del Mar development',
    '— nueva zona premium al norte':  '— new premium zone to the north',
    'Modernización del Puerto de Cruceros': 'Cruise Port modernization',
    '— más capacidad':                '— more capacity',
    'Colombia ofrece condiciones favorables para inversionistas extranjeros:':
      'Colombia offers favorable conditions for foreign investors:',
    'Sin restricciones para la compra de inmuebles por extranjeros':
      'No restrictions on property purchases by foreigners',
    'Visa de inversionista con inversión mínima de ~$85.000 USD':
      'Investor visa with minimum investment of ~$85,000 USD',
    'Tratados de doble tributación con múltiples países':
      'Double taxation treaties with multiple countries',
    'Repatriación libre de capitales y ganancias':
      'Free repatriation of capital and profits',
    'Comparado con otros mercados del Caribe, Cartagena ofrece mejor relación precio/rentabilidad:':
      'Compared to other Caribbean markets, Cartagena offers better price/profitability ratio:',
    'Cartagena:':                     'Cartagena:',
    'Cancún:':                        'Cancún:',
    'Precio m² desde $2.5M COP (~$600 USD), ROI 8-14%':
      'Price/m² from $2.5M COP (~$600 USD), ROI 8-14%',

    // ═══ Blog post 2: Renta turística vs tradicional ═══
    '5 de 5 estrellas':               '5 out of 5 stars',
    'Caso real: Apartamento en Bocagrande': 'Real case: Apartment in Bocagrena',
    'Arriendo tradicional es ideal si:': 'Traditional rental is ideal if:',
    'Renta turística es ideal si:':    'Vacation rental is ideal if:',
    'Buscas un flujo de caja garantizado con mínimo esfuerzo':
      'You seek guaranteed cash flow with minimal effort',
    'Buscas maximizar ingresos y aceptas variabilidad estacional':
      'You seek to maximize income and accept seasonal variability',
    'Comparación directa':            'Direct comparison',
    'Comparación detallada de ingresos, ocupación, gastos y ROI entre renta turística y arriendo tradicional en Cartagena.':
      'Detailed comparison of income, occupancy, expenses and ROI between vacation rental and traditional rental in Cartagena.',

    // ═══ Blog post 3: Guía legal extranjeros ═══
    '1. ¿Pueden los extranjeros comprar propiedad en Colombia?':
      '1. Can foreigners buy property in Colombia?',
    '2. Proceso de compra paso a paso': '2. Step-by-step buying process',
    '3. Impuestos al comprar':         '3. Taxes when buying',
    '4. Impuestos recurrentes':        '4. Recurring taxes',
    '5. Visa de inversionista (Tipo M)': '5. Investor visa (M type)',
    '6. Financiamiento para extranjeros': '6. Financing for foreigners',
    '7. Repatriación de capitales':    '7. Capital repatriation',
    'Certificado de inversión registrada, pasaporte vigente, antecedentes limpios':
      'Registered investment certificate, valid passport, clean background',
    'Colombia garantiza el derecho a repatriar:': 'Colombia guarantees the right to repatriate:',
    'Algunos bancos financian hasta el 70% del valor del inmueble':
      'Some banks finance up to 70% of the property value',
    '350 salarios mínimos (~$120M COP / ~$28.000 USD en 2026)':
      '350 minimum wages (~$120M COP / ~$28,000 USD in 2026)',
    'Aplica si el patrimonio líquido en Colombia supera ~$1.5M USD (2026)':
      'Applies if liquid equity in Colombia exceeds ~$1.5M USD (2026)',
    'Comprar sin abogado:':           'Buying without a lawyer:',
    '15% sobre la utilidad (precio venta - precio compra ajustado por inflación)':
      '15% on profit (sale price - purchase price adjusted for inflation)',
    '15% en Colombia + escala IRPF ahorro en España (19-28%). Convenio evita doble imposición.':
      '15% in Colombia + IRPF savings scale in Spain (19-28%). Treaty avoids double taxation.',
    '35% sobre alquileres brutos a no residentes. Crédito fiscal en España.':
      '35% on gross rents to non-residents. Tax credit in Spain.',
    '0.3% - 1.2% del avalúo catastral anual (varía por municipio y estrato)':
      '0.3% - 1.2% of annual cadastral appraisal (varies by municipality and stratum)',
    '1.67% del valor':                '1.67% of value',
    '1% del valor':                   '1% of value',

    // ═══ Más útiles ═══
    'Tu inversión y tu hogar merecen seguridad, legalidad y confianza.':
      'Your investment and home deserve security, legality and trust.',
    'ALTORRA':                        'ALTORRA',
    'ALTORRA S.A.S. — Inmobiliaria en Cartagena especializada en compra, venta, avalúos, administración, arriendo y asesoría legal inmobiliaria.':
      'ALTORRA S.A.S. — Cartagena real estate specialized in buying, selling, appraisals, management, rental and legal advice.',
    'ALTORRA S.A.S. — Tu inversión y tu hogar merecen seguridad, legalidad y confianza.':
      'ALTORRA S.A.S. — Your investment and home deserve security, legality and trust.',
    'Presentación Altorra':           'Altorra presentation',
    'Hero de Contacto':               'Contact Hero',
    'Contacto Altorra':               'Contact Altorra',
    'Contacta a Altorra Inmobiliaria en Cartagena. Asesoría en compra, venta, arriendo, avalúos y servicios legales inmobiliarios.':
      'Contact Altorra Real Estate in Cartagena. Advice on buying, selling, rental, appraisals and legal real estate services.',
    'Contacta a Altorra Inmobiliaria. Asesoría en compra, venta, arriendo y avalúos en Cartagena.':
      'Contact Altorra Real Estate. Advice on buying, selling, rental and appraisals in Cartagena.',

    // ═══ Busqueda avanzada ═══
    'Buscar Propiedades en Cartagena | Altorra Inmobiliaria':
      'Search Properties in Cartagena | Altorra Real Estate',
    'Buscar Propiedades | Altorra Inmobiliaria': 'Search Properties | Altorra Real Estate',
    'Busca entre todas las propiedades de Altorra Inmobiliaria en Cartagena.':
      'Search all Altorra Real Estate properties in Cartagena.',
    'Busca entre todas las propiedades de Altorra Inmobiliaria: venta, arriendo y alojamientos por días en Cartagena. Filtros avanzados por tipo, precio, área y más.':
      'Search all Altorra Real Estate properties: sale, rental and vacation rentals in Cartagena. Advanced filters by type, price, area and more.',
    'Ciudad, barrio, código o característica...':
      'City, neighborhood, code or feature...',

    // ═══ Mapa ═══
    'Mapa de Propiedades | Altorra Inmobiliaria': 'Property Map | Altorra Real Estate',
    'Explora todas las propiedades disponibles en un mapa interactivo de Cartagena.':
      'Explore all available properties on an interactive map of Cartagena.',
    'Ver en lista':                   'View as list',
    'Ver en mapa':                    'View on map',

    // ═══ Detalle propiedad extras ═══
    'Consulta características, precio y fotos de esta propiedad en Cartagena.':
      'Check features, price and photos of this property in Cartagena.',
    'Consulta características, precio, ubicación y fotos de esta propiedad en Altorra Inmobiliaria, Cartagena.':
      'Check features, price, location and photos of this property at Altorra Real Estate, Cartagena.',

    // ═══ Meta tags comunes ═══
    'Alojamientos por Días en Cartagena | Altorra Inmobiliaria':
      'Vacation Rentals in Cartagena | Altorra Real Estate',
    'Alquila apartamentos y casas por días en Cartagena. Alojamientos amoblados para turismo y vacaciones con Altorra Inmobiliaria.':
      'Rent apartments and houses by the day in Cartagena. Furnished vacation accommodations with Altorra Real Estate.',
    'Alquila apartamentos y casas por días en Cartagena. Alojamientos amoblados para turismo y vacaciones.':
      'Rent apartments and houses by the day in Cartagena. Furnished vacation accommodations.',
    'Apartamentos, casas y lotes en venta en Cartagena y ciudades vecinas. Asesoría jurídica, financiera y acompañamiento integral con Altorra Inmobiliaria.':
      'Apartments, houses and lots for sale in Cartagena and neighboring cities. Legal, financial and comprehensive support with Altorra Real Estate.',
    'Apartamentos, casas y lotes en venta en Cartagena. Asesoría jurídica y financiera integral.':
      'Apartments, houses and lots for sale in Cartagena. Comprehensive legal and financial advice.',
    'Arrienda apartamentos y casas en Cartagena con contratos seguros y respaldo jurídico.':
      'Rent apartments and houses in Cartagena with secure contracts and legal backing.',
    'Arrienda apartamentos y casas en Cartagena con contratos seguros y respaldo jurídico. Administración integral de inmuebles con Altorra Inmobiliaria.':
      'Rent apartments and houses in Cartagena with secure contracts and legal backing. Comprehensive property management with Altorra Real Estate.',
    'Arrienda apartamento en Cartagena por zona: Bocagrande, Manga, Crespo, Pie de la Popa. Precios actualizados, contratos seguros y asesoría legal.':
      'Rent an apartment in Cartagena by zone: Bocagrande, Manga, Crespo, Pie de la Popa. Updated prices, secure contracts and legal advice.',
    'Precios de arriendo por zona, contratos seguros y asesoría legal para arrendar en Cartagena.':
      'Rental prices by zone, secure contracts and legal advice to rent in Cartagena.',
    'Altorra Inmobiliaria en Cartagena: compra, venta, arriendo y avalúos de propiedades con asesoría jurídica, financiera y acompañamiento integral.':
      'Altorra Real Estate in Cartagena: buying, selling, rental and property appraisals with legal, financial and comprehensive support.',
    'Altorra Inmobiliaria | Propiedades en Cartagena':
      'Altorra Real Estate | Properties in Cartagena',
    'Altorra Inmobiliaria | Propiedades en Cartagena — Compra, Arriendo y Avalúos':
      'Altorra Real Estate | Properties in Cartagena — Buying, Rental and Appraisals',
    'Compra, arrienda o invierte en propiedades en Cartagena con asesoría jurídica y financiera integral.':
      'Buy, rent or invest in properties in Cartagena with comprehensive legal and financial advice.',
    'Altorra Inmobiliaria':           'Altorra Real Estate',

    // ═══ Alert, toast y mensajes del sistema ═══
    'Datos actualizados':             'Data updated',
    'Guardado correctamente':         'Saved successfully',
    'Eliminado correctamente':        'Deleted successfully',
    'Operación exitosa':              'Operation successful',
    'Error inesperado':               'Unexpected error',
    'Por favor intenta de nuevo':     'Please try again',
    'Por favor completa los campos':  'Please complete the fields',
    'Revisa tu conexión':             'Check your connection',
    'Sin resultados':                 'No results',

    // Page titles & metas (batch 1)
    'Comprar Apartamento en Cartagena | Altorra Inmobiliaria': 'Buy Apartment in Cartagena | Altorra Real Estate',
    'Comprar Apartamento en Cartagena | Guía por Zonas | Altorra Inmobiliaria': 'Buy Apartment in Cartagena | Neighborhood Guide | Altorra Real Estate',
    'Arrendar Apartamento en Cartagena | Altorra Inmobiliaria': 'Rent Apartment in Cartagena | Altorra Real Estate',
    'Arrendar Apartamento en Cartagena | Por Zona | Altorra Inmobiliaria': 'Rent Apartment in Cartagena | By Zone | Altorra Real Estate',
    'Invertir en Cartagena | Altorra Inmobiliaria': 'Invest in Cartagena | Altorra Real Estate',
    'Invertir en Cartagena | ROI y Oportunidades | Altorra Inmobiliaria': 'Invest in Cartagena | ROI & Opportunities | Altorra Real Estate',
    'Invertir en Airbnb en Cartagena | Altorra Inmobiliaria': 'Invest in Airbnb in Cartagena | Altorra Real Estate',
    'Invertir en Airbnb en Cartagena | ROI y Zonas Rentables | Altorra Inmobiliaria': 'Invest in Airbnb in Cartagena | ROI & Best Zones | Altorra Real Estate',
    'Lotes Campestres en Cartagena | Altorra Inmobiliaria': 'Country Lots in Cartagena | Altorra Real Estate',
    'Lotes Campestres en Cartagena | Fincas y Terrenos | Altorra Inmobiliaria': 'Country Lots in Cartagena | Farms & Land | Altorra Real Estate',
    'Propiedades en Barú y La Boquilla | Altorra Inmobiliaria': 'Properties in Barú & La Boquilla | Altorra Real Estate',
    'Propiedades en Venta en Cartagena | Altorra Inmobiliaria': 'Properties for Sale in Cartagena | Altorra Real Estate',
    'Propiedades en Arriendo en Cartagena | Altorra Inmobiliaria': 'Properties for Rent in Cartagena | Altorra Real Estate',
    'Renta Turística en Cartagena | Altorra': 'Vacation Rental in Cartagena | Altorra',
    'Renta Turística en Cartagena | Gestión Airbnb | Altorra Inmobiliaria': 'Vacation Rental in Cartagena | Airbnb Management | Altorra Real Estate',
    'Renta turística vs arriendo tradicional | Altorra Inmobiliaria': 'Vacation rental vs long-term rental | Altorra Real Estate',
    'Turismo Inmobiliario | Altorra': 'Real Estate Tourism | Altorra',
    'Turismo Inmobiliario | Altorra Inmobiliaria': 'Real Estate Tourism | Altorra Real Estate',
    'Servicio próximamente | Altorra Inmobiliaria': 'Service coming soon | Altorra Real Estate',
    'Contacto | Altorra Inmobiliaria': 'Contact | Altorra Real Estate',
    'Quiénes Somos | Altorra Inmobiliaria': 'About Us | Altorra Real Estate',
    'Mis Favoritos | Altorra Inmobiliaria': 'My Favorites | Altorra Real Estate',
    'Mapa de propiedades | Altorra': 'Property Map | Altorra',
    'Mapa de propiedades | Altorra Inmobiliaria': 'Property Map | Altorra Real Estate',
    'Simulador hipotecario | Altorra': 'Mortgage Calculator | Altorra',
    'Simulador de crédito hipotecario | Altorra Inmobiliaria': 'Mortgage Calculator | Altorra Real Estate',
    'Avalúo comercial gratuito | Altorra': 'Free commercial appraisal | Altorra',
    'Solicitar avalúo comercial | Altorra Inmobiliaria': 'Request commercial appraisal | Altorra Real Estate',
    'Política de Privacidad | Altorra Inmobiliaria': 'Privacy Policy | Altorra Real Estate',
    'Publica tu Propiedad | Altorra Inmobiliaria': 'List your Property | Altorra Real Estate',
    'Detalle de Propiedad | Altorra Inmobiliaria': 'Property Details | Altorra Real Estate',
    'Propiedad en Altorra Inmobiliaria': 'Property at Altorra Real Estate',
    'Blog Inversionista | Altorra Inmobiliaria': 'Investor Blog | Altorra Real Estate',
    'Blog Inversionista — Altorra Inmobiliaria': 'Investor Blog — Altorra Real Estate',
    'Foreign Investors Guide | Altorra Inmobiliaria': 'Foreign Investors Guide | Altorra Real Estate',
    'Foreign Investors Guide | Buy Property in Cartagena | Altorra': 'Foreign Investors Guide | Buy Property in Cartagena | Altorra',
    'Guía legal para inversionistas extranjeros en Colombia | Altorra Inmobiliaria': 'Legal guide for foreign investors in Colombia | Altorra Real Estate',
    '¡Gracias! | Altorra Inmobiliaria': 'Thank you! | Altorra Real Estate',

    // Meta descriptions (batch 1)
    'Guía completa para comprar apartamento en Cartagena: precios por zona (Bocagrande, Manga, Castillogrande, Crespo), consejos legales y las mejores oportunidades.':
      'Complete guide to buying an apartment in Cartagena: prices by zone (Bocagrande, Manga, Castillogrande, Crespo), legal tips and the best opportunities.',
    'Precios por zona, consejos legales y oportunidades para comprar apartamento en Cartagena de Indias.':
      'Prices by zone, legal advice and opportunities to buy an apartment in Cartagena de Indias.',
    'Guía para invertir en Airbnb en Cartagena: zonas con mayor ocupación, ROI esperado, costos operativos y requisitos legales (RNT). Análisis de mercado 2026.':
      'Guide to investing in Airbnb in Cartagena: zones with highest occupancy, expected ROI, operating costs and legal requirements (RNT). 2026 market analysis.',
    'ROI, ocupación por zona y guía legal para invertir en renta turística en Cartagena.':
      'ROI, occupancy by zone and legal guide to invest in vacation rental in Cartagena.',
    'Descubre las mejores zonas para invertir en Cartagena. Análisis de ROI por barrio, casos de éxito y oportunidades de renta turística.':
      'Discover the best zones to invest in Cartagena. ROI analysis by neighborhood, success cases and vacation rental opportunities.',
    'ROI por zona, casos de éxito y oportunidades de inversión inmobiliaria en Cartagena de Indias.':
      'ROI by zone, success cases and real estate investment opportunities in Cartagena de Indias.',
    'Lotes campestres y fincas en venta cerca de Cartagena: Barú, Turbaco, Arjona y zona norte. Precios, extensiones y oportunidades de inversión rural.':
      'Country lots and farms for sale near Cartagena: Barú, Turbaco, Arjona and northern zone. Prices, sizes and rural investment opportunities.',
    'Lotes campestres, fincas y terrenos en venta cerca de Cartagena. Precios y oportunidades.':
      'Country lots, farms and land for sale near Cartagena. Prices and opportunities.',
    'Propiedades en venta en Barú y La Boquilla, Cartagena: lotes, casas y apartamentos frente al mar. Precios, valorización y oportunidades de inversión 2026.':
      'Properties for sale in Barú and La Boquilla, Cartagena: lots, houses and beachfront apartments. Prices, appreciation and 2026 investment opportunities.',
    'Lotes, casas y apartamentos frente al mar en Barú y La Boquilla. Inversión con alta valorización.':
      'Lots, houses and beachfront apartments in Barú and La Boquilla. High-appreciation investment.',
    'Gestión integral de renta turística en Cartagena. Maximiza ingresos de tu propiedad con Airbnb, Booking y nuestros canales directos.':
      'Full-service vacation rental management in Cartagena. Maximize your property income with Airbnb, Booking and our direct channels.',
    'Experiencias turísticas en Cartagena: renta de yates, pasadías en islas, paquetes turísticos y tours históricos. Muy pronto con Altorra Inmobiliaria.':
      'Tourist experiences in Cartagena: yacht rentals, island day trips, travel packages and historical tours. Coming soon with Altorra Real Estate.',
    'Artículos sobre inversión inmobiliaria en Cartagena: guías, análisis de mercado, renta turística y consejos legales para inversionistas.':
      'Articles on real estate investment in Cartagena: guides, market analysis, vacation rental and legal advice for investors.',
    'Calcula tu cuota mensual estimada para un crédito hipotecario en Colombia. Simula plazo, tasa y cuota inicial al instante.':
      'Calculate your estimated monthly payment for a mortgage loan in Colombia. Instantly simulate term, rate and down payment.',
    'Calcula tu cuota mensual estimada para comprar propiedad en Colombia.': 'Calculate your estimated monthly payment to buy property in Colombia.',
    'Solicita un avalúo comercial de tu propiedad con Altorra Inmobiliaria. Recibirás una estimación del valor de mercado sin costo.':
      'Request a commercial appraisal of your property with Altorra Real Estate. You will receive a market value estimate at no cost.',
    'Explora propiedades en venta, arriendo y alojamiento en el mapa interactivo.': 'Explore properties for sale, rent and accommodation on the interactive map.',
    'Explora todas las propiedades disponibles de Altorra Inmobiliaria en el mapa. Filtra por tipo, operación y ciudad.':
      'Explore all available Altorra Real Estate properties on the map. Filter by type, operation and city.',
    'Explora todas las propiedades disponibles en el mapa. Filtra por operación, tipo o ciudad.': 'Explore all available properties on the map. Filter by operation, type or city.',
    'Todo lo que necesitas saber sobre impuestos, visas, escrituración y trámites para comprar propiedad en Colombia como extranjero.':
      'Everything you need to know about taxes, visas, deeds and procedures to buy property in Colombia as a foreigner.',
    'Tratamiento de datos personales conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013 en Colombia.':
      'Personal data processing under Colombian Law 1581 of 2012 and Decree 1377 of 2013.',
    'Publica tu inmueble en Altorra Inmobiliaria. Vende o arrienda tu propiedad en Cartagena con acompañamiento profesional.':
      'List your property with Altorra Real Estate. Sell or rent your property in Cartagena with professional support.',
    'Vende o arrienda tu propiedad en Cartagena con acompañamiento profesional de Altorra.': 'Sell or rent your property in Cartagena with Altorra\'s professional support.',
    'Propiedades guardadas como favoritos en Altorra Inmobiliaria.': 'Properties saved as favorites at Altorra Real Estate.',
    'Cartagena se consolida como uno de los mercados inmobiliarios más atractivos de Latinoamérica. Descubre las razones clave para invertir en 2026.':
      'Cartagena has become one of the most attractive real estate markets in Latin America. Discover the key reasons to invest in 2026.',

    // Listings / Search / Filters
    'Filtros de búsqueda':            'Search filters',
    'Filtra por zona':                'Filter by zone',
    'Habitaciones, amoblado, área…':  'Bedrooms, furnished, area…',
    'Precio mínimo (COP)':            'Minimum price (COP)',
    'Precio máximo (COP)':            'Maximum price (COP)',
    'Área mín. (m²)':                 'Min. area (m²)',
    'Área máx. (m²)':                 'Max. area (m²)',
    'Precio: Menor a Mayor':          'Price: Low to High',
    'Precio: Mayor a Menor':          'Price: High to Low',
    'Más Recientes':                  'Most recent',
    'Baños':                          'Bathrooms',
    'Ej. Cartagena':                  'E.g. Cartagena',
    'Toda Cartagena':                 'All Cartagena',
    'En venta':                       'For sale',
    'En arriendo':                    'For rent',
    'propiedades':                    'properties',
    'Mapa de':                        'Map of',
    'Haz clic en cada marker para ver precio, specs y acceder al detalle.': 'Click each marker to see price, specs and access the details.',
    'Visualiza dónde está cada propiedad antes de agendaruna visita.': 'See where each property is before scheduling a visit.',
    '¿Por qué usar el mapa?':         'Why use the map?',
    'Limita la búsqueda por barrio o zona de la ciudad que más te interesa.': 'Narrow your search by the neighborhood or zone of the city you\'re most interested in.',

    // Contact / Publicar / Thank you
    'Conéctate con Nosotros':         'Connect with us',
    'Envíanos un mensaje':            'Send us a message',
    'Estamos listos para ayudarte a encontrar tu próximo hogar o inversión.': 'We\'re ready to help you find your next home or investment.',
    'Te responderemos en el menor tiempo posible.': 'We will reply as soon as possible.',
    'Correo:':                        'Email:',
    'Teléfono':                       'Phone',
    'Teléfono/WhatsApp:':             'Phone/WhatsApp:',
    'Dirección de contacto:':         'Contact address:',
    'Cartagena de Indias, Bolívar – Colombia': 'Cartagena de Indias, Bolívar – Colombia',
    'Llámanos o escríbenos por WhatsApp:': 'Call us or message us on WhatsApp:',
    'WhatsApp Altorra':               'WhatsApp Altorra',
    '📞 ¿Prefieres hablar?':          '📞 Prefer to talk?',
    '🔒 Tus datos están seguros':     '🔒 Your data is safe',
    '¡Gracias! Recibimos tu mensaje': 'Thank you! We received your message',
    'Tu caso quedó':                  'Your case has been',
    'ID de seguimiento:':             'Tracking ID:',
    'Un profesional de':              'A professional from',
    'se comunicará contigo muy pronto. Si necesitas una atención inmediata, escríbenos por WhatsApp.': 'will contact you very soon. If you need immediate assistance, message us on WhatsApp.',
    'Serás redirigido al':            'You will be redirected to',
    '¿Qué sigue?':                    'What\'s next?',
    'Publica tu propiedad con Altorra': 'List your property with Altorra',
    '¿En cuánto lo tienes valuado?':  'What is your asking price?',
    'Cuéntanos más sobre la propiedad (remodelaciones, estado, etc.)': 'Tell us more about the property (renovations, condition, etc.)',
    'Validaremos tu solicitud y uno de nuestros asesores te contactará pronto.': 'We\'ll validate your request and one of our advisors will contact you soon.',

    // Avalúo
    'Avalúo comercial':               'Commercial appraisal',
    'Solicita el avalúo de tu propiedad. Nuestros expertos te contactarán con una estimación del valor de mercado.':
      'Request your property appraisal. Our experts will contact you with a market value estimate.',
    'Más de 10 años de experiencia en el mercado inmobiliario de Cartagena y la región Caribe. Avalúos basados en datos reales del mercado.':
      'Over 10 years of experience in the Cartagena and Caribbean real estate market. Appraisals based on real market data.',
    'Respuesta en menos de 24 horas hábiles. El avalúo preliminar es gratuito. Si necesitas avalúo oficial con certificado, nuestro equipo te cotiza el servicio.':
      'Response in less than 24 business hours. The preliminary appraisal is free. If you need an official certified appraisal, our team will provide a quote.',
    'Toda la información que compartes es confidencial y se usa únicamente para preparar tu avalúo. No compartimos datos con terceros.':
      'All information you share is confidential and used only to prepare your appraisal. We do not share data with third parties.',
    'menos de 24h':                   'less than 24h',
    'Solicitar asesoría legal':       'Request legal advice',
    '¿Necesitas asesoría legal personalizada?': 'Need personalized legal advice?',
    'Nuestro equipo jurídico te guía en todo el proceso de compra como inversionista extranjero.':
      'Our legal team guides you through the entire purchase process as a foreign investor.',
    'Solicitar avalúo comercial | Altorra Inmobiliaria': 'Request commercial appraisal | Altorra Real Estate',

    // Simulador
    'Simula cuánto puedes ganar con tu propiedad en renta turística.': 'Simulate how much you can earn with your property in vacation rental.',
    'Ingresa el precio, tarifa por noche y ocupación estimada para ver tu ROI.': 'Enter the price, nightly rate and estimated occupancy to see your ROI.',
    'Usa nuestra calculadora para estimar el ROI de tu propiedad según zona y modalidad.':
      'Use our calculator to estimate your property\'s ROI by zone and operation type.',
    '¿Quieres calcular tu rentabilidad?': 'Want to calculate your profitability?',

    // Privacidad
    'Política de Privacidad':         'Privacy Policy',
    'Cómo recopilamos, usamos y protegemos su información personal.': 'How we collect, use and protect your personal information.',
    'Última actualización:':          'Last updated:',
    'Índice de secciones':            'Table of contents',
    'Documento conforme a la':        'Document compliant with',
    'Ley 1581 de 2012':               'Law 1581 of 2012',
    'Decreto 1377 de 2013':           'Decree 1377 of 2013',
    '(en adelante, “Altorra”) es responsable del tratamiento de los datos personales recolectados a través de sus canales digitales y presenciales.':
      '(hereinafter, "Altorra") is responsible for processing personal data collected through its digital and in-person channels.',
    'Identificación y contacto: nombre, cédula/NIT, correo, teléfono, ciudad.': 'Identification and contact: name, ID/tax ID, email, phone, city.',
    'Información del inmueble: dirección aproximada, características, fotos provistas por el titular.': 'Property information: approximate address, characteristics, photos provided by the owner.',
    'Preferencias y registros derivados del servicio y la relación comercial.': 'Preferences and records derived from the service and commercial relationship.',
    'Datos técnicos mínimos: IP, dispositivo, navegador, páginas visitadas (analítica).': 'Minimal technical data: IP, device, browser, pages visited (analytics).',
    'No tratamos categorías especiales (sensibles) salvo que sean necesarias y con consentimiento explícito.':
      'We do not process special (sensitive) categories unless necessary and with explicit consent.',
    'Prestar servicios de compra, venta, arriendo, administración, avalúos y asesoría jurídica.': 'Provide services for purchase, sale, rental, administration, appraisals and legal advice.',
    'Responder solicitudes, cotizaciones y agendar visitas.': 'Respond to requests, quotes and schedule visits.',
    'Envío de comunicaciones informativas y/o comerciales (con opción de cancelación).': 'Sending informational and/or commercial communications (with opt-out option).',
    'Verificación de identidad y prevención de fraude.': 'Identity verification and fraud prevention.',
    'Mejora de experiencia digital, seguridad, métricas y cumplimiento de obligaciones legales.':
      'Improvement of digital experience, security, metrics and compliance with legal obligations.',
    'Podemos compartir datos con encargados (hosting, mensajería, analítica, CRM) bajo acuerdos de confidencialidad. Posibles transferencias internacionales con salvaguardas adecuadas.':
      'We may share data with processors (hosting, messaging, analytics, CRM) under confidentiality agreements. Possible international transfers with adequate safeguards.',
    'No vendemos datos personales. Revelamos información solo por mandato legal o autoridad competente.': 'We do not sell personal data. We disclose information only by legal mandate or competent authority.',
    'Control de acceso, cifrado en tránsito (HTTPS), copias de seguridad y principio de mínimo privilegio para encargados.':
      'Access control, encryption in transit (HTTPS), backups and principle of least privilege for processors.',
    'Incluya nombre completo, documento, solicitud y medio de respuesta.': 'Include full name, ID, request and response method.',
    '(asunto: “Derechos de datos personales”).': '(subject: "Personal data rights").',
    'Plazos: consultas hasta 10 días hábiles y reclamos hasta 15.': 'Timeframes: inquiries up to 10 business days and claims up to 15.',
    'Cookies técnicas necesarias y, eventualmente, de medición. Puede aceptar o rechazar las de medición en este aviso.':
      'Necessary technical cookies and, eventually, measurement cookies. You can accept or reject measurement cookies in this notice.',
    'Puede cambiar su decisión borrando las cookies del navegador.': 'You can change your decision by deleting browser cookies.',
    'Rechazar medición':              'Reject measurement',
    'utilizamos cookies necesarias y de medición para mejorar su experiencia.': 'we use necessary and measurement cookies to improve your experience.',
    'No dirigimos servicios a menores de 18 años. Si tratamos datos por relación con sus acudientes, será bajo interés superior del menor y consentimiento del representante.':
      'We do not direct services to minors under 18. If we process data due to relations with their guardians, it will be under the best interests of the minor and the representative\'s consent.',
    'Para preguntas o reclamos sobre datos personales contáctenos por estos medios. También puede acudir a la Superintendencia de Industria y Comercio (SIC).':
      'For questions or complaints about personal data, contact us through these channels. You may also contact the Superintendence of Industry and Commerce (SIC).',
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
  var MIGRATION_KEY = 'altorra:i18n-migration-v3';

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }

  // One-time migration: reset any stale 'en' cache from a previous broken version.
  // After this runs once per browser, users get Spanish by default.
  try {
    if (localStorage.getItem(MIGRATION_KEY) !== '1') {
      localStorage.setItem(STORAGE_KEY, 'es');
      localStorage.setItem(MIGRATION_KEY, '1');
    }
  } catch (e) {}

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

  // Traducción de sub-strings (frases dentro de párrafos)
  // Solo aplica claves >= 20 chars para evitar reemplazos falsos en palabras cortas.
  function translateSubstrings(text, map) {
    for (var k in map) {
      if (!map.hasOwnProperty(k)) continue;
      if (k.length < 20) continue;
      if (text.indexOf(k) !== -1) {
        text = text.split(k).join(map[k]);
      }
    }
    return text;
  }

  function translatePage() {
    var toEN = (state.lang === 'en');
    var map = toEN ? ES_TO_EN : EN_TO_ES;
    var phMap = toEN ? PLACEHOLDER_ES_EN : PLACEHOLDER_EN_ES;

    translateDOM(document.body, map, phMap);
    document.documentElement.setAttribute('lang', state.lang);

    // Page title — exact match o substring
    var t = document.title;
    if (map[t]) {
      document.title = map[t];
    } else {
      document.title = translateSubstrings(t, map);
    }

    // Meta description + og:description + og:title
    var metas = document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[property="og:title"],meta[property="twitter:description"],meta[property="twitter:title"]');
    for (var mi = 0; mi < metas.length; mi++) {
      var m = metas[mi];
      var c = m.getAttribute('content');
      if (!c) continue;
      if (map[c]) {
        m.setAttribute('content', map[c]);
      } else {
        var translated = translateSubstrings(c, map);
        if (translated !== c) m.setAttribute('content', translated);
      }
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
      '.lang-toggle{position:fixed;top:calc(var(--header-h,72px)+14px);right:14px;z-index:1200;' +
      'display:inline-flex;align-items:center;gap:3px;background:#fff;' +
      'border:2px solid #d4af37;border-radius:999px;' +
      'padding:3px;box-shadow:0 6px 20px rgba(17,24,39,.18),0 2px 6px rgba(212,175,55,.25);' +
      'font-family:Poppins,system-ui,sans-serif;transition:transform .18s,box-shadow .18s}' +
      '.lang-toggle:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(17,24,39,.22),0 4px 10px rgba(212,175,55,.35)}' +
      '.lang-toggle button{background:transparent;border:none;padding:6px 13px;font-size:.82rem;' +
      'font-weight:800;color:#6b7280;cursor:pointer;border-radius:999px;font-family:inherit;' +
      'letter-spacing:.8px;transition:background .15s,color .15s;min-width:36px}' +
      '.lang-toggle button.active{background:linear-gradient(135deg,#d4af37,#ffb400);color:#000;' +
      'box-shadow:inset 0 1px 2px rgba(0,0,0,.08)}' +
      '.lang-toggle button:not(.active):hover{color:#d4af37;background:rgba(212,175,55,.08)}' +
      '@media(max-width:540px){.lang-toggle{top:auto;bottom:100px;right:14px}}';
    document.head.appendChild(s);
  }

  function mountToggle() {
    if (document.getElementById('altorra-lang-toggle')) return;
    if (!document.body) {
      // body aún no está listo — reintentar
      requestAnimationFrame(mountToggle);
      return;
    }
    injectCSS();
    var wrap = document.createElement('div');
    wrap.className = 'lang-toggle notranslate';
    wrap.id = 'altorra-lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / Idioma');
    // translate="no" para que Google Translate del navegador NO afecte el botón
    wrap.setAttribute('translate', 'no');
    // Estilos inline como fallback por si el CSS no carga o es sobreescrito
    wrap.style.cssText =
      'position:fixed !important;' +
      'top:calc(var(--header-h,72px) + 14px);right:14px;' +
      'z-index:2147483000 !important;' +
      'display:inline-flex !important;align-items:center;gap:3px;' +
      'background:#fff !important;border:2px solid #d4af37 !important;' +
      'border-radius:999px;padding:3px;' +
      'box-shadow:0 6px 20px rgba(17,24,39,.18);' +
      'font-family:Poppins,system-ui,sans-serif;' +
      'visibility:visible !important;opacity:1 !important;pointer-events:auto !important;';
    wrap.innerHTML =
      '<button type="button" data-lang="es" aria-label="Español" translate="no" ' +
        'style="background:transparent;border:none;padding:6px 13px;font-size:.82rem;' +
        'font-weight:800;color:#6b7280;cursor:pointer;border-radius:999px;' +
        'letter-spacing:.8px;min-width:36px;font-family:inherit">ES</button>' +
      '<button type="button" data-lang="en" aria-label="English" translate="no" ' +
        'style="background:transparent;border:none;padding:6px 13px;font-size:.82rem;' +
        'font-weight:800;color:#6b7280;cursor:pointer;border-radius:999px;' +
        'letter-spacing:.8px;min-width:36px;font-family:inherit">EN</button>';
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.getAttribute('data-lang'));
    });
    // En móvil: mover abajo sobre el WhatsApp flotante
    if (window.matchMedia && window.matchMedia('(max-width:540px)').matches) {
      wrap.style.top = 'auto';
      wrap.style.bottom = '100px';
    }
    document.body.appendChild(wrap);
    updateToggle();

    // Safety net: re-inyectar si algo lo borra
    var reinjectCount = 0;
    var reinjectInterval = setInterval(function () {
      reinjectCount++;
      if (reinjectCount > 6) { clearInterval(reinjectInterval); return; }
      if (!document.getElementById('altorra-lang-toggle') && document.body) {
        document.body.appendChild(wrap);
        updateToggle();
      }
    }, 1000);
  }

  function updateToggle() {
    var wrap = document.getElementById('altorra-lang-toggle');
    if (!wrap) return;
    var btns = wrap.querySelectorAll('button[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute('data-lang') === state.lang;
      btns[i].classList.toggle('active', isActive);
      if (isActive) {
        btns[i].style.background = 'linear-gradient(135deg,#d4af37,#ffb400)';
        btns[i].style.color = '#000';
        btns[i].style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,.08)';
      } else {
        btns[i].style.background = 'transparent';
        btns[i].style.color = '#6b7280';
        btns[i].style.boxShadow = 'none';
      }
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
    // Idioma por defecto: ESPAÑOL. Solo se usa EN si el usuario lo eligió explícitamente.
    if (stored !== 'es' && stored !== 'en') {
      state.lang = 'es';
      setStored('es'); // persist default
    } else {
      state.lang = stored;
    }

    // El HTML está en español nativamente. Si el usuario eligió EN,
    // traducimos todo después de que header/footer/contenido dinámico cargue.
    mountToggle();
    startObserver();

    if (state.lang === 'en') {
      translatePage();
      setTimeout(translatePage, 600);
      setTimeout(translatePage, 1500);
      setTimeout(translatePage, 3000);
    }

    // Re-traducir después de que los componentes se carguen
    window.addEventListener('altorra:components-ready', function () {
      if (state.lang === 'en') setTimeout(translatePage, 100);
    });

    // Re-traducir cuando la base de datos cargue (tarjetas de propiedades)
    window.addEventListener('altorra:db-ready', function () {
      if (state.lang === 'en') setTimeout(translatePage, 200);
    });
  }

  // Bootstrap: monta el toggle lo antes posible y corre init al cargar el DOM
  // Esto garantiza que el botón aparezca incluso si hay errores en otros scripts.
  function earlyMount() {
    if (document.body && !document.getElementById('altorra-lang-toggle')) {
      try { mountToggle(); } catch (e) {}
    }
  }
  earlyMount();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      earlyMount();
      init();
    });
  } else {
    init();
  }
  // Último recurso: si aún no apareció en 1.5s, forzarlo
  setTimeout(earlyMount, 1500);

  window.AltorraI18n = {
    t: function (txt) { return state.lang === 'en' ? (ES_TO_EN[txt] || txt) : txt; },
    setLang: setLang,
    toggle: function () { setLang(state.lang === 'es' ? 'en' : 'es'); },
    getLang: function () { return state.lang; }
  };
})();
