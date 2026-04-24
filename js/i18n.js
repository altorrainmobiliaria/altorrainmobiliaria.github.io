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
