# 🧬 R0 — DESTILADO DE _LEGACY (workflow wf_a8b895c6, 9 agentes, 2026-07-10)

> Síntesis del conocimiento del sitio viejo ANTES de retirarlo (greenfield ADR §15). El crudo completo
> vive en `../brain-private/altorrainmobiliaria/research-archive/2026-07-10-r0-destilado-legacy-workflow-crudo.txt`.
> Estos son REQUISITOS abstractos e inteligencia — NO especificaciones de re-implementación del código viejo.

## 1. Requisitos de producto que el portal nuevo NO debe olvidar

### 1.1 Prioridad alta

#### Catálogo multi-operación con filtros avanzados y paginación
Tres verticales (comprar/arrendar/alojamientos por días) + página de búsqueda global cross-operación con selector Todas/Venta/Arriendo/Por días. Filtros combinables: operación, tipo, ciudad, barrio, precio min/max (con sufijo contextual COP / /mes / /noche), habitaciones, baños, m², estrato, garajes, piso, año, amenidades, destacado, texto libre. Paginación limit(9) (nunca queries sin limit), sort, chips removibles por filtro activo + banner "Resultados para: X ✕" con re-render unificado. Landings prefiltradas vía query params ?search/?type/?city. Categorías visuales tipo Airbnb (chips: Frente al mar, Centro histórico, Con piscina, Vista al mar, Nuevo, Inversión) como quick-win. Ranking editorial: prioridad manual 0-100 + featured (+1000) + highlightScore + bonus recencia.

#### Búsqueda inteligente unificada
Motor con corrección de typos (Damerau-Levenshtein con indicador visual "~"), sinónimos del dominio, parseo de presupuesto en lenguaje natural ("apartamento barato en Bocagrande máx 500 millones"), re-ranking por clicks. Autocompletado con patrón ARIA combobox completo (aria-activedescendant, aria-expanded, navegación por teclado), sugerencias agrupadas por barrio/tipo/ciudad con badge "N propiedades", búsquedas recientes (últimas 5, localStorage) y atajo global "/". Consulta la capa de datos viva (no JSON estático) e invalida su índice al refrescarse el catálogo. Declarado superior al de Cars; vocabulario (sinónimos, TYPE_LABEL) cosechable. busqueda.html?q= habilita el sitelinks searchbox de Google.

#### Ficha de propiedad enriquecida (detalle)
Detalle por ?id= con: galería inmersiva full-screen (swipe, zoom, thumbnails, counter), propiedades similares por scoring multi-criterio (barrio +3, tipo +2, operación +2, ciudad +1, precio ±30% +2; umbral ≥3, hasta 4, sección auto-oculta), share WhatsApp/email/QR/copiar-link, CTA flotante sticky mobile, deep-link ?compare= y ?precio= hacia comparador/simulador. Roadmap validado: video tour, tour 360, plano, POIs de zona, historial de precio, indicador de demanda con analytics reales.

#### Captación de leads multi-tipo a BD propia
TODOS los formularios escriben en colección solicitudes (nunca solo email de terceros — FormSubmit solo como fallback si la BD no responde en 8s). Taxonomía de tipos madurada: contacto_propiedad, publicar_propiedad, solicitud_avaluo, solicitud_juridica, solicitud_contable, solicitud_credito, agenda_visita, gestion_renta_turistica, descarga_guia, otro. Campo origen + datosExtra contextual. Email automático al admin al crear (con flag emailSent de idempotencia) y al cliente al cambiar estado. Honeypot anti-spam, rate limiting 30s, validación en tiempo real (email/teléfono CO/nombre), selector multi-país en teléfonos (10 países, prefijo concatenado — clave por mercado extranjero de Cartagena). Lead scoring 0-100 server-side al crear (tipo + completitud + propiedad específica + valor >1B/+500M + mensaje >100 chars + cita + horario laboral CO) → tier hot ≥70 / warm 40-69 / cold, reflejado en subject/badge del email.

#### Wizards de conversión de 3 pasos
(a) "Agendar visita": datos personales (selector país) → fecha (30 días) + 8 slots horarios (patrón config/bookedSlots de Cars para disponibilidad) → confirmación; lead agenda_visita con requiereCita=true; solo si la propiedad está disponible. (b) "Publicar/consigna tu propiedad": tipo (6 chips) + operación + ciudad + precio aprox → contacto → confirmación; lead publicar_propiedad con fallback a formulario completo; patrón Tristan: situaciones de venta con iconos + barra de progreso. Ambos alimentan el CRM.

#### WhatsApp como canal primario de conversión con tracking
Botón flotante (CSS en <head> para evitar CLS), mensajes pre-armados contextuales por página, deep links wa.me por propiedad. Interceptar todos los wa.me para: detectar fuente del click (float/hero/form/card/CTA/footer/inline), añadir sufijo UTM al mensaje ("Ref: web/source/campaign") para atribución en la conversación, y loguear evento en analytics_events (page, propertyId, referrer, userAgent, screenWidth, lang). Crítico: WhatsApp es el canal #1 de conversión en Colombia.

#### SEO programático de fichas de propiedad + sitemap por CI
Página estática /p/{id}.html por propiedad con canonical + OG + Twitter Card + JSON-LD RealEstateListing + <noscript> para crawlers + variable PRERENDERED para hidratar sin query params; imagen OG 1200×630 (Sharp). Pipeline: cambio en BD → CF onPropertyChange con debounce 5 min → repository_dispatch → CI regenera + schedule respaldo cada 4h + regeneración manual desde admin (callable solo super_admin). Sitemap dinámico regenerado (estáticas + propiedades), curado con prioridades (home 1.0, listados/landings 0.9, detalle/inversión 0.8, blog 0.7-0.8, servicios 0.5, privacidad 0.3), changefreq por tipo y lastmod FIJO para estáticas / updatedAt real para ítems. Fallback a data.json si faltan credenciales — debe ser RUIDOSO. Escala objetivo: 100+ páginas por combinación zona×tipo×operación×precio. Slug legible inmutable ({tipo}-{nombre}-{barrio}-{id}) con mapa id→slug, patrón Cars.

#### Datos estructurados JSON-LD completos (SEO + AEO)
Dual RealEstateAgent + LocalBusiness enriquecido (nombre, logo, teléfonos, email, dirección Cartagena/Bolívar/CO, geo, slogan, foundingDate, knowsLanguage es/en, currenciesAccepted COP/USD, openingHoursSpecification, areaServed 7 lugares, hasOfferCatalog con 7 servicios, sameAs redes+YouTube). BreadcrumbList dinámico por página (43-51 páginas en el viejo, cifra discrepante entre docs), RealEstateListing en detalle y /p/, FAQPage en home y 5+ landings (rich snippets + visibilidad en respuestas de IA — el viejo rankeaba #1-#2 en ChatGPT para "mejores inmobiliarias de Cartagena"), WebSite+SearchAction hacia busqueda.html?q=, Place con GPS reales en landings de sector, DefinedTermSet (glosario), Article/BlogPosting, CollectionPage (videos). Todos ya validados ante Google.

#### Higiene SEO on-page por página
Títulos con "Cartagena" formato "Página | Altorra Inmobiliaria" (55-60 chars, keyword al inicio + año), meta descriptions 140-160 chars con keywords, canonical en TODAS las indexables, OG completos y consistentes, noindex deliberado en gracias/servicios auxiliares, hreflang bidireccional ES/EN (home ↔ foreign-investors). Title home validado: "Apartamentos y casas en Cartagena | Comprar, Arrendar, Invertir | Altorra Inmobiliaria".

#### Landing pages programáticas por sector y por intención
(a) 17-18 sectores de Cartagena cubiertos por el viejo (Zona Norte: Serena del Mar, Karibana, Manzanillo, La Boquilla, Cielo Mar, Barcelona de Indias; Centro: Centro Histórico, Getsemaní, San Diego; Península: Bocagrande, Castillogrande, El Laguito; Residenciales: Manga, Crespo, Marbella, El Cabrero, Pie de la Popa, Alto Bosque) — cada una con hero, stats band (valorización, precio/m², distancia), amenidades, bloque inversión ROI/plusvalía, perfil del comprador, CTA WhatsApp, 6+ cross-links, Schema.org Place con GPS reales, propiedades dinámicas embebidas. (b) Landings por intención transaccional con datos duros y FAQPage: comprar-apartamento-cartagena, arrendar-apartamento-cartagena, invertir-airbnb-cartagena, propiedades-baru, lotes-campestres-cartagena (creada para competir contra Altis). Meta histórica: 20-30 landings en 3 meses. Activo único: A&S tiene 0.

#### Panel admin SPA con RBAC y CRUD completo
Roles super_admin/editor/viewer con matriz de permisos (delete solo super_admin, anti auto-eliminación/auto-degradación). CRUD propiedades con slug automático, código único de negocio INM-YYYYMM-XXXX (contador atómico por transaction, inmutable, nunca reutilizado), optimistic locking _version (create=1, update=+1 en transacción, validado en rules; bypass explícito super_admin como en Cars), estados, subida de imágenes con compresión en navegador (Canvas; config: máx 2MB, 1200px, calidad 0.75, jpeg/png/webp), gestión de leads con realtime SOLO en la sección activa + badge pendientes, gestión de usuarios vía funciones callable con requireSuperAdmin, CRUD reseñas, utilidades de tabla (paginación/sort/búsqueda/export CSV), migración automática idempotente de schema (patrón migrateVehicleSchema de Cars). Criterio de éxito: publicar desde el navegador y verla en el sitio en <5 min.

#### Hardening de sesión admin
Bloqueo tras 5 intentos fallidos / auto-desbloqueo 15 min — pero moverlo a lado servidor (el patrón viejo con loginAttempts en Firestore de escritura pública es manipulable), timeout de sesión 8h + expiración por inactividad 30 min con advertencia, carga de perfil con retry 3x + backoff, 2FA SMS opcional con dispositivos de confianza 30 días (fingerprint + IP anonimizada), presencia en tiempo real RTDB con onDisconnect().remove() y heartbeat.

#### CRM pipeline de leads con scoring
Kanban drag & drop 4 columnas (Nuevo → Contactado → Visita → Cierre) con actualización de estado directa en BD, cards con nombre/tipo/propiedad/teléfono/fecha relativa, lead score con tier color-coded hot/warm/cold, toggle lista/kanban, observaciones del admin por lead. El schema de leads nace con estado "visita" y scoring desde el día 1 (en el viejo se añadió después con mapeo legacy). Semilla del CRM del portal nuevo; los leads históricos son activo comercial de primer orden.

#### Ciclo de vida del inventario con protección y registro de ventas
Estados disponible/reservado/vendido/arrendado/borrador; ítems vendidos protegidos contra edición; registro de operaciones/ventas con exportación (patrón admin-operations de Cars). Registrar transacciones cerradas desde el día 1 habilita stats de impacto reales como prueba social (contadores tipo Habi).

#### Favoritos con sync multi-dispositivo
Offline-first (siempre localStorage, funciona sin cuenta), Firebase Anonymous Auth cuando hay backend, merge bidireccional local↔remoto al iniciar, evento de actualización para re-render en vivo, badge contador en nav, página dedicada. API estable drop-in ya probada en el viejo (completado). Gap explícito vs Airbnb/Compass que el viejo cerró.

#### Vertical de alojamientos por días nivel Airbnb
CORE del negocio corta estancia: calendario de disponibilidad gestionable desde admin, búsqueda por fechas (solo muestra disponibles), precio por noche con desglose, reseñas de huéspedes multi-criterio (limpieza/comunicación/ubicación/valor), checklist de amenidades, reglas de la casa (check-in/out, mascotas, depósito), categorías turísticas, solicitud de reserva con fechas+huéspedes que notifica al admin. (Bloque I del MEGA-PLAN, no implementado en el viejo.)

#### Vertical de inversión con datos cuantitativos por zona
Página invertir con grid de zonas (precio/m², ROI anual, ocupación Airbnb, perfil de inversor) + 3 casos de éxito con desglose financiero real (ROI 9.6%-14.4%). Calculadora de rentabilidad Airbnb (precio, tarifa/noche, % ocupación, 6 rubros de gastos → neto mensual, ROI anual, payback; pre-llenable desde detalle; CTA WhatsApp con parámetros) — "ningún competidor local la tenía". Badges automáticos "ROI ~X%" y "% ocupación" en cards por mapa de 12 barrios (solo compra, excluyendo lotes/bodegas, normalización de tildes). Sección "Propiedades exclusivas" (prioridad ≥90, auto-oculta con <3). Comparativo de zonas para inversionistas. TODA cifra declara su base (bruto vs neto, fuente, fecha) desde una fuente única de datos de mercado.

#### Suite de calculadoras financieras colombianas
Simulador hipotecario con amortización francesa: sliders cuota inicial 10-50%, plazo 5-30 años, tasa 8-24% E.A., presets VIS/no-VIS, modalidades UVR vs tasa fija, tabla de amortización, gráfica capital/intereses, export PDF, ?precio= precargado desde detalle, genera lead solicitud_credito, FAQ propia. Roadmap validado: gastos notariales (impuestos, notaría, registro, boleta fiscal), costos de cierre (escrituración, retención en la fuente), arriendo vs compra, comparador de créditos bancarios — específicos de legislación colombiana que ningún portal genérico modela.

#### Landing de captación de propietarios para gestión de renta turística
Funnel dedicado a propietarios que quieren monetizar vía Airbnb/Booking: catálogo de 8 servicios de gestión, proceso en 4 pasos, tabla comparativa renta turística vs arriendo tradicional, FAQ, formulario con lead tipo gestion_renta_turistica. Encaja directo con la vertical "administración + corta estancia" del portal nuevo.

#### Internacionalización ES/EN + página para inversionistas extranjeros
i18n con toggle ES/EN, auto-detección (localStorage → navigator.language → ES), traducción de textContent y atributos, evento de cambio de idioma; el viejo llegó a 1174 entradas/100% cobertura — pero NUNCA como script monolítico síncrono (i18n.js de 138KB fue el mayor cuello de LCP). foreign-investors.html 100% EN con lang/og:locale/hreflang: por qué Cartagena, 6 pasos de compra remota, tabs fiscales por país (US: FBAR/FATCA/8938; CA: T1135; ES: Modelo 720), 8 FAQ, disclaimers. Integrada a la navegación desde el día 1 (en el viejo quedó huérfana meses). Segmento extranjero es pilar del negocio.

#### Mapa interactivo de propiedades
El viejo convergió a Leaflet (open source, costo cero, sin API key) con markers diferenciados por operación, InfoWindow con imagen+specs+CTA, filtros sobre el mapa, carga lazy del SDK; requiere coords {lat,lng} por propiedad. Si se usa Google Maps: key restringida por referrer y degradación elegante ("Mapa no disponible" si falta). Aspiracional: split-view listado+mapa con toggle mobile (patrón Airbnb/Metrocuadrado).

#### Cache multicapa con doble señal + guardarraíl free-tier
L1 Memory → L2 IndexedDB → L3 localStorage (→ L4 SW Cache), TTL 5 min catálogo. DOS señales de invalidación independientes: (1) system/meta.lastModified escuchado con onSnapshot (1 doc, barato) para cambios de datos del admin; (2) deploy-info.json bumpeado por CI, polleado cada 10 min, para deploys de código — con banner "Nueva versión" + grace period 30s anti-loop. Restricción de producto: TODO cabe en free-tier (Firestore 50K lecturas/día): nunca onSnapshot en colecciones completas desde público, siempre limit(), caché antes de red, imágenes <200KB, debounce en functions, schedules máx 4h. Conservar concepto firestore-meter (medidor de lecturas en cliente) y diseñar invalidación de grano fino (el full-reload por señal del viejo amenazaba el tope). Consultas admin acotadas (últimos 200 leads / 500 eventos).

#### Disciplina de performance + PWA
Cero scripts render-blocking: no críticos vía defer/requestIdleCallback (patrón probado: 21→13 script tags, 0 render-blocking), CSS crítico y de componentes flotantes en <head>, budget LCP<2.5s / CLS<0.1, skeleton screens, lazy loading con blur placeholder, loading=lazy + decoding=async below-fold, fetchpriority solo LCP, WebP thumbnails <150KB. PWA: SW versionado (altorra-pwa-vN, bump automático desde CI) con estrategias por asset — .json Network Only, HTML network-first con fallback, imágenes network-first, CSS/JS stale-while-revalidate, precache solo shell inmutable, skipWaiting + notificación.

#### Accesibilidad WCAG como estándar
Skip links en todas las páginas, focus rings visibles con el gold de marca (nunca outline:none sin reemplazo), touch targets min 44px (WCAG 2.5.8), focus trap en drawer móvil (Tab cycling, Escape, backdrop), carruseles táctiles scroll-snap + momentum iOS + fade hint, aria-live en regiones dinámicas (trust bar, banner destacada), dots con tablist ARIA, role=dialog/aria-modal en popups, event delegation con data-action (nunca onclick inline) + escapeHtml() obligatorio en innerHTML (XSS).

#### Alertas de búsqueda guardada / newsletter segmentada
"Avísame cuando haya X en Y < Z" → suscriptores guardados con sus criterios (operación, tipo, ciudad, presupuesto máx) como base para alertas por email/push, detección de duplicados con reactivación, barra flotante de captura con delay 5s en páginas clave, plantillas de envío (nuevas_propiedades, mercado, personalizado) restringido a super_admin con log en newsletter_sends, fallback a proveedor externo. Retención y remarketing orgánico.

#### Config global editable + centralización de claves opcionales
Teléfonos, email, redes, slogan en BD (config/general) — regla "NO hardcodear URLs". Un único bloque window.AltorraKeys (gmapsApiKey, vapidKey) como único punto que el dueño edita; cada feature dependiente degrada limpio si su key falta (mapa muestra mensaje, botón push se oculta, requestPermission retorna null). Nunca placeholders con aspecto de key real dispersos.

#### Prueba social y confianza
Reseñas gestionadas desde BD (autor, rating, texto, fecha, fuente google|directo, activa, orden) con CRUD admin, carga con timeout y fallback a JSON estático, rating bar Google Maps (★5.0) + enlace al perfil. Stats de impacto animadas con datos REALES del inventario (# propiedades, # ciudades — trust bar reactiva). Roadmap validado: logos de alianzas, proceso visual "¿Cómo funciona?", comparativa "Altorra vs vender solo", casos de éxito, certificaciones (Lonja de Cartagena).

#### Analytics de funnel + dashboard admin
GA4 + auto-tracking (page_view, whatsapp_click, external_click, time_on_page) + eventos de negocio (trackPropertyView, trackSearch, trackFilterApplied, trackFormSubmit, trackFavorite) con buffer local. Dashboard admin: stat cards (propiedades, leads totales/pendientes, reseñas, WhatsApp clicks, suscriptores), leads por tipo, WhatsApp por fuente, timeline 30 días, embudo de conversión por etapa del pipeline, top propiedades vistas, top búsquedas. Medir visita → búsqueda → detalle → contacto → cierre. KPIs blog: PV/post, tiempo >2min, rebote <65%, conversión blog→lead >1%.

### 1.2 Prioridad media

- **Nurturing automatizado por email según tipo de lead** — Secuencias de 2-4 emails (día 1, 3, 7, 14) diferenciadas por tipo de solicitud (5 secuencias definidas: contacto_propiedad, publicar_propiedad, solicitud_avaluo, gestion_renta_turistica, default), templates HTML branded (oro, Poppins) con CTA, job scheduled cada 6h que consulta leads con nurturing.nextEmailAt vencido (requiere índice compuesto), metadatos inicializados al crear el lead. Email marketing: bienvenida → sugeridas → reporte mensual.
- **Home modular por secciones data-driven** — Carrusel "Recién publicadas" UNIFICADO con chips Todas/Venta/Arriendo/Por días filtrando en memoria, máx 12, skeletons, "Ver todo" contextual (lección: 3 carruseles separados fragmentan con inventario pequeño). Hub de 3 caminos (Comprar/Arrendar/Invertir) con ARIA completa. Grid de categorías por tipo (6 tipos con icono, enlaces estáticos ?type=). Sección "Sectores de Cartagena" en 4 grupos geográficos neutrales con taglines. Banner "Destacada de la semana" (top-3 por prioridad/featured, rotación 6s con pausa hover/focus, rotación semanal ISO, cache 1h, validada contra BD viva, edge cases 0/1 slides). Trust bar con stats vivos. FAQ con JSON-LD. Bloque foreign investors EN. Sección herramientas gratuitas. Todas reactivas a eventos de invalidación de datos.
- **Comparador de propiedades (hasta 3)** — Selección desde cards, bandeja flotante con thumbnails, modal con tabla side-by-side (precio, m², habitaciones, baños, garajes, estrato, piso, barrio, tipo, operación), highlight del mejor valor por fila, comparación de amenidades check/cross, persistencia local, deep-link ?compare=. Diferenciador: pocos competidores lo tienen. Integrar por hooks del renderer, no MutationObserver (el viejo falló silenciosamente por contrato data-id implícito).
- **Historial "Vistas recientemente"** — Últimas 10 propiedades visitadas, localStorage + sync asíncrono a BD por usuario (subcolección favoritos/{uid}/historial). CRÍTICO: pruning contra la BD viva — si una propiedad ya no existe se elimina del cache y la sección se auto-oculta.
- **Blog dual: estático SEO-first + dinámico CMS** — Dos vías por intención de ranking: (A) HTML estático prerenderizado para artículos pilar (plantilla con placeholders + sync a BD + sitemap + BlogPosting JSON-LD); (B) documento en colección blog renderizado vía blog-post.html?slug= para contenido táctico, con meta/OG/JSON-LD inyectados al vuelo, fallback estático inmediato para proteger LCP, <noscript> para crawlers y timeout 5s. Categorías canónicas: Inversión, Rentabilidad, Legal & Fiscal, Análisis, Mercado, Guías (una por post). Lineamientos: título 55-60 chars keyword+año, description 140-160, slug 3-6 palabras sin tildes, H2 cada ~250 palabras, CTA final, cadencia 2-3/semana. Línea editorial ganadora: inversión.
- **Suite de contenido de autoridad / AEO** — Guía del inversionista anual como lead magnet gated (~5.500 palabras, desbloqueo tras formulario con lead dedicado, persistido en cliente, @media print para PDF, Article JSON-LD, banners de distribución); estudio de mercado trimestral por zona con KPIs y metodología/fuentes transparentes (Lonja Bolívar, Cotelco, AirDNA, DANE, BanRep) — credibilidad ante Google y AI Search; glosario de 44 términos con nav alfabética, buscador NFD sin acentos, referencias cruzadas y DefinedTermSet; sala de prensa con KPIs citables, boilerplates, voceros, embed badge que genera backlinks dofollow; hub de videos YouTube (filtros, youtube-nocookie, CollectionPage); FAQ 30+ y guías de barrio con datos reales. Centro de recursos.
- **Sync admin→público en vivo sin recarga** — Red de eventos globales (firebase-ready, altorra:db-ready, db-refreshed, cache-invalidated) para que un cambio del admin se propague sin F5: listados, carruseles, destacada, historial, buscador, mapa, comparador y detalle re-renderizan. Consumidores suscritos SIN {once:true}. Readiness por servicio (await waitForDB() y análogos para Functions/Storage) contra races del SDK diferido.
- **UX de estado-cero sin flash** — Secciones data-driven arrancan con display:none inline y se revelan SOLO al llegar datos reales; nunca placeholders "Cargando…" visibles que desaparecen; secciones vacías se ocultan enteras. Verificar siempre las dos fronteras: crear el 1er ítem y borrar el último.
- **Avalúo con estimación + AVM** — Formulario de avalúo con estimación orientativa en tiempo real por ciudad/tipo (precio/m² de mercado) → lead solicitud_avaluo, sidebar del proceso, CTA WhatsApp, honeypot. Evolución: estimador automático de precio tipo Habimetro (barrio + m² + tipo + habitaciones → estimado) — proyecto clave de la matriz, versión básica primero.
- **Perfiles de asesores + portal de aliados/brokers** — Página equipo + perfil individual con URL propia (/equipo/nombre) con foto, bio, especialidades, WhatsApp directo, propiedades activas, reseñas; "tu asesor asignado" en cada ficha. Base broker: patrón Cars de concesionarios (nombre, teléfono, responsable) + consignaciones de particulares (concesionario='_particular') — base directa para el portal de brokers y captación por terceros del producto nuevo. Gap vs Compass/KW/Remax.
- **Audit log inmutable + trazabilidad** — auditLog global INMUTABLE (create editor+, delete solo super_admin) + subcolección auditLog por propiedad {accion, campo, antes, despues, usuario, timestamp}, visor en admin con paginación. Roadmap: rollback visual con timeline.
- **Arquitectura de enlazado interno deliberada** — Menú dropdown de Inversión en header, sub-sección Herramientas en footer, sección de herramientas en home, barras de cross-linking contextual en 7+ páginas de alto tráfico — distribución de autoridad SEO y descubribilidad (en el viejo 10+ páginas solo eran alcanzables por deep link). Solo enlazar páginas que EXISTEN (el viejo tuvo 3 links 404 en footer); check de links internos en CI.
- **Nomenclatura geográfica neutral (guía editorial)** — Decisión editorial vigente: nunca "Barrios premium"/"Zonas premium"/"gated community" — usar "Sectores de Cartagena", agrupación geográfica (no por estrato), "urbanización cerrada", "residencial familiar"; ningún grupo de sectores recibe estilo visual privilegiado. El posicionamiento premium va en el contenido, no en la clasificación.
- **Backup exportable + evolución de schema** — Script de export de todas las colecciones a JSON local (Timestamps→ISO, directorio configurable) — respaldo/portabilidad. Migración automática de schema en admin (una vez por sesión, idempotente, no destructiva, batch máx 500, DEFAULTS para backfill). Enums de estado evolucionan por mapeo legacy en lectura, no migración masiva.
- **Pagos en línea** — Único gap donde A&S superaba a Altorra: pagos de arriendo/administración in-platform. Necesario para el marketplace por suscripción y la administración de arriendos del portal nuevo.
- **Chatbot/asistente IA conversacional de búsqueda** — Tipo MIA de Ciencuadras: conversa → filtra → muestra opciones → conecta con asesor. Gap vs competencia; proyecto clave de la matriz impacto/esfuerzo.
- **Dashboard privado del propietario/inversionista** — Portal privado: mis propiedades, rentabilidad, valorización, reportes. Mapea al área de propietarios del servicio de administración de inmuebles del portal nuevo.
- **Cumplimiento y confianza** — Términos, privacidad, cookies con banner de consentimiento, 404 personalizada, gracias post-envío, robots.txt con Disallow de admin, archivo de verificación de Search Console, páginas institucionales y de servicios.
- **Runbook de deploy para el dueño** — Práctica operativa a replicar: documento ejecutable (DEPLOY-RUNBOOK.md) con comandos PowerShell exactos, checklist de verificación y troubleshooting para los pasos que solo el dueño ejecuta (Claude commitea, el dueño despliega).

### 1.3 Prioridad baja / ideas

- **Banner promocional editable desde CMS**: doc config/promo (activo, texto, enlace, enlaceTexto, id) editable desde admin, render en home sin deploy, dismissable con persistencia por ID, 1 sola lectura con timeout, sin listeners en vivo.
- **Exit-intent popup con lead magnet**: desktop mouseout clientY<5 / mobile 45s inactividad, 1 vez por sesión + supresión 7 días, excluido de contacto/gracias/admin, integrado con newsletter, fallback si Firebase no está, accesible (role=dialog, Escape).
- **Notificaciones push web**: Web Push FCM con VAPID key, tokens en BD (push_tokens/{token}), botón toggle auto-oculto si no hay key configurada, flujo retorna null sin errores; alertas de nuevas propiedades.
- **Productividad admin avanzada**: drafts auto-guardados cada 10s con visibilidad colaborativa (drafts_activos), restauración al reabrir, dirty-check anti-writes, preview en tiempo real pre-publicación, atajos de teclado, duplicar ítem, batch ops, theme toggle.
- **Colecciones curadas de propiedades**: "Frente al mar", "Centro histórico", "Top 5 para invertir este mes", "Mejores ROI en Barú" — patrón Sotheby's/Compass.

## 2. Datos y activos a COSECHAR (migración al modelo nuevo)

| Activo | Tipo | Detalle/schema |
|---|---|---|
| Firestore `propiedades` + properties/data.json — catálogo real (5 propiedades) | datos de negocio | IDs y precios COP reales: 101-27 Apartamento Allure Bocagrande ($5.350M), 102-11402 Milán Amoblado ($386M), 103-B305 Trevi-Serena ($565M), 104-01 Casa Country ($380M), 105-4422 Milán Moderno ($350M). Ya subidas a Firestore (npm run upload); espejo fallback en properties/data.json. Schema Firestore (el más completo): docID=id, titulo, slug SEO, tipo (apartamento\|casa\|lote\|oficina\|bodega\|local), operacion (comprar\|arrendar\|dias), estado (disponible\|reservado\|vendido\|arrendado), ciudad, barrio, direccion, coords{lat,lng}, estrato, precio (COP entero), admin_fee, habitaciones, banos, sqm, sqm_terreno, garajes, piso, ano_construccion, amoblado, imagen, imagenes[] (Storage URLs), imagen_og (1200×630), features[], descripcion, featured, prioridad 0-100/highlightScore, disponible, createdAt/updatedAt, _version, creadoPor. Tabla de mapeo data.json→Firestore documentada (title→titulo, beds→habitaciones, available 1/0→bool, added string→Timestamp). |
| Firestore `solicitudes` — leads históricos (CRM) | datos de negocio | Historial de leads reales, activo comercial de primer orden. Schema final: nombre, telefono (con prefijo país), email, tipo (taxonomía completa: contacto_propiedad, publicar_propiedad, solicitud_avaluo, solicitud_juridica, solicitud_contable, solicitud_credito, agenda_visita, gestion_renta_turistica, descarga_guia_inversionista_2026, otro), origen (página), estado (pendiente/en_gestion/visita/cerrado — "visita" añadido con mapeo legacy), datosExtra{propiedadId, propiedadTitulo, mensaje, tipoInmueble, ciudad, precioAproximado}, createdAt/updatedAt, emailSent (idempotencia), requiereCita, leadScore (0-100), leadTier (hot/warm/cold), nurturing.nextEmailAt (metadatos inicializados por onNewSolicitud). Creación pública, lectura solo admin. |
| Firestore `resenas` + reviews.json — 10 reseñas Google reales | datos de negocio | 10 reseñas reales de clientes (fuente Google Maps) en reviews.json (fallback estático); vigentes en colección resenas con schema: autor, rating 1-5, texto, fecha, fuente (google\|directo), activa, orden. Rating agregado exhibido: 5.0. Cosechar AMBAS fuentes (textos/autores/ratings) para sembrar la prueba social del portal nuevo. |
| Firestore `usuarios` + cuenta super_admin real | cuenta/auth | Firebase Auth email info@altorrainmobiliaria.co, UID J1sXuV78OhPA5KyCoWNYFVQehF23, doc usuarios/J1sXuV78OhPA5KyCoWNYFVQehF23 {rol:'super_admin', activo:true, bloqueado:false}. Schema colección: docID=Auth UID; nombre, email, rol (super_admin\|editor\|viewer), activo, bloqueado, creadoEn, creadoPor. |
| Firestore `blog` — 6-7 posts publicados + plantilla | contenido | Schema (docID=slug): slug, titulo, resumen (140-160 chars, doble uso como meta description), categoria (Inversión\|Rentabilidad\|Legal & Fiscal\|Análisis\|Mercado\|Guías), imagen (1200×630, hosteada en i.postimg.cc), fecha Timestamp, tiempoLectura, publicado, url (versión estática opcional), contenido HTML, autor, _version, createdAt/updatedAt. Posts reales reutilizables: por-que-invertir-cartagena-2026 (~1200 palabras), renta-turistica-vs-arriendo-tradicional (~1000), guia-legal-inversionistas-extranjeros (~1400), impuestos-inmobiliarios-colombia-2026, mejores-zonas-airbnb-cartagena, vale-la-pena-invertir-en-cartagena-2026. Versiones HTML estáticas en /blog/ + plantilla blog/_plantilla-post.html con placeholders. Lectura pública, escritura editor+ con _version. Seed vía scripts/upload-blog-posts.mjs (merge idempotente). |
| Firestore config/system — documentos de configuración | config | config/general: telefono_whatsapp 573002439810, telefono_display +57 300 243 9810, email_contacto info@altorrainmobiliaria.co, IG/FB/TikTok @altorrainmobiliaria, slogan "Gestión integral en soluciones inmobiliarias". config/counters: totalPropiedades, totalCiudades + secuencia de código único. config/promo: {activo, texto, enlace, enlaceTexto, id}. system/meta: {lastModified} (señal de invalidación de caché). loginAttempts/{hashEmail}: {intentos, bloqueado, ultimoIntento}. auditLog global + subcolección por propiedad {accion, campo, antes, despues, usuario, timestamp}. |
| Firestore `analytics_events` — atribución de conversión | datos/telemetría | Eventos whatsapp_click con schema: type, source, page, propertyId, propertyTitle, referrer, userAgent, screenWidth, lang. Valioso para conocer fuentes de conversión históricas. Reglas: create público / read autenticado. |
| Firestore `newsletter` + `newsletter_sends` | datos de negocio | Suscriptores opt-in con sus criterios de búsqueda guardados (operación, tipo, ciudad, presupuesto máx — base para alertas segmentadas) y flag activo; log de envíos en newsletter_sends. Lista de emails = activo comercial directo a migrar. Reglas: create+update público / read autenticado. |
| Firestore `favoritos` + `push_tokens` | datos de usuario | favoritos/{uid} + subcolección favoritos/{uid}/historial (vistas recientes por usuario, con auth anónima); push_tokens/{token} para FCM. |
| Imágenes de propiedades — Cloud Storage + carpetas del repo | activos multimedia | Migradas a gs://altorra-inmobiliaria-345c6.firebasestorage.app bajo propiedades/{id}/*.webp con URLs actualizadas en Firestore (URL pública tipo https://storage.googleapis.com/altorra-inmobiliaria-345c6.firebasestorage.app/propiedades/101-27/allure.webp). Carpetas de origen en el repo mapeadas a IDs: allure/→101-27, fmia/→102-11402, serena/→103-B305, fotoprop/→104-01, Milan/→105-4422. Bucket us-central1, lectura pública, máx 5MB solo imágenes. Además /og/ con imágenes OG 1200×630 generadas por CI. |
| Dataset unificado de mercado por zona de Cartagena (curado a mano) | datos de mercado | Cosechar de varios artefactos: Zona Norte 2025-2026 (Serena del Mar $9-15M/m² +12-15% anual; Karibana $11-18M +10-12% golf PGA; Manzanillo $7-11M +9-12%; La Boquilla $6-9M +10-14% líder ROI Airbnb; Cielo Mar $5-8M +8-10%; Barcelona de Indias $5-7M +7-9%). Sectores H2 (El Laguito $10-15M +7-9%; Marbella $7-11M +6-8%; San Diego $15-30M +8-11% UNESCO Airbnb 9-13%; Pie de la Popa $4-6M; Alto Bosque $5-8M; El Cabrero $8-12M doble frente de agua). KPIs E4.3 por 6 zonas tradicionales (precio m², tarifa Airbnb, ocupación, valorización YoY, ROI, ticket promedio). Mapa de 12 barrios con rangos ROI/ocupación en js/investment-badges.js. Casos de éxito con desglose financiero (ROI 9.6-14.4%). Datos de lotes en Turbaco y Arjona. Coordenadas GPS reales de los 17 sectores (Schema Place). Fuentes citadas: Camacol, La Galería Inmobiliaria, Lonja de Cartagena/Bolívar, MetroCuadrado, Cotelco, AirDNA, DANE, BanRep. Lección asociada: unificar en UNA fuente que todas las páginas consuman, declarando bruto/neto/fecha. |
| Contenido de autoridad redactado (reutilizable tal cual) | contenido | Guía del Inversionista 2026 (~5.500 palabras, 9 capítulos: mercado, ROI por 6 zonas, Airbnb vs arriendo, impuestos por estrato/IVA/INC/ganancia ocasional, financiación 4 vías, due diligence 20 puntos, 10 errores, compra desde el exterior con poder/Form 4/visa M, calendario tributario — guia-inversionista-2026.html 524 líneas). Glosario inmobiliario 44 términos A-V con referencias cruzadas + DefinedTermSet (485 líneas). Kit de prensa (6 KPIs citables, 3 boilerplates 50/120/240 palabras, 3 voceros, tabla de datos legales, embed badge HTML). Contenido fiscal EN para extranjeros (US: FBAR/FATCA/8938; CA: T1135; ES: Modelo 720/IRPF/Patrimonio + 8 FAQ de compra remota, regulación 2025). FAQ del home (5 preguntas con FAQPage). Estudio de mercado (estudios-mercado-cartagena.html ~417 líneas). Taxonomía de 12 videos en 4 categorías con meta (zona, duración, idioma). Textos de las 17-18 landings de sector. |
| Diccionario i18n ES→EN (1174 entradas) | contenido | js/i18n.js con 1174 entradas cubriendo el 100% de las 1213 frases del sitio viejo (~800 según snapshot anterior; la cifra final fue 1174). Par ES/EN de terminología inmobiliaria de Cartagena reutilizable para el i18n del portal nuevo aunque el HTML se retire. |
| Secuencias y templates de nurturing email | config/contenido | 5 secuencias en functions/index.js con cadencia día 1/3/7/14 y temas por tipo de lead; templates HTML con branding (oro, Poppins) y CTAs. Índice compuesto requerido en firestore.indexes.json (nurturing.nextEmailAt sobre solicitudes). |
| Scripts admin-SDK reutilizables (extraer datos antes del greenfield) | tooling de datos | scripts/upload-to-firestore.mjs (seed 5 propiedades + crea system/meta, config/general, config/counters), scripts/migrate-images-to-storage.mjs (STORAGE_BUCKET configurable, DRY_RUN=1), scripts/backup-firestore.mjs (export completo a JSON, Timestamps→ISO, OUTPUT_DIR), scripts/upload-blog-posts.mjs (merge idempotente), scripts/generate-properties.mjs (SEO desde Firestore) / tools/generate_og_pages.js (fallback data.json, og.config.json con baseUrl). SA JSON local: C:\Users\romad\sa-altorra-inmobiliaria.json (gitignored). |
| Secrets y credenciales existentes | credenciales | Secret Manager del proyecto: EMAIL_USER, EMAIL_PASS (app password Gmail), GITHUB_PAT (permiso repo+workflow). GitHub Actions: GOOGLE_APPLICATION_CREDENTIALS_JSON (contenido del SA JSON; un snapshot lo reporta pendiente — verificar). Keys pendientes del dueño para window.AltorraKeys: gmapsApiKey (restringida por referrer a https://altorrainmobiliaria.co/*) y vapidKey (FCM Web Push); measurementId GA4 ya configurado (Etapa 7 completada). |
| Datos de negocio e identidad de marca | config/brand | WhatsApp +57 300 243 9810 (wa.me/573002439810), tel +57 323 501 6747, email info@altorrainmobiliaria.co (migrado desde altorrainmobiliaria@gmail.com), IG/FB/TikTok @altorrainmobiliaria, dominio altorrainmobiliaria.co, slogan "Gestión integral en soluciones inmobiliarias". JSON-LD LocalBusiness con foundingDate, knowsLanguage es/en, currenciesAccepted COP/USD, horarios estructurados, areaServed 7 lugares, catálogo de 7 servicios, sameAs con YouTube. Identidad visual intocable: Poppins 300/500/700/800, --gold #d4af37, --accent #ffb400, --bg #fff, --text #111827, --muted #6b7280, --header-h 72px, --page-max 1200px, --card-r 18px, footer #0b0b0b, botón gradient gold→accent texto #000, cards hover translateY(-4px). |
| Taxonomía de dominio + vocabulario del buscador | datos de referencia | Tipos: apartamento, casa, lote, oficina, local, bodega. Operaciones: comprar, arrendar, dias. Barrios con taglines de marketing: Bocagrande (frente al mar/valorización), Manga (tradición/bahía), Castillogrande (exclusividad), Centro Histórico (UNESCO/renta turística), Crespo (aeropuerto), Manzanillo (playa privada/proyectos nuevos). Vocabulario del smart-search: sinónimos, TYPE_LABEL en español, parseo de presupuesto, ranking por clicks. Claves localStorage vivas: altorra:hero-recent-searches (máx 5), cache TTL 5 min. |
| Inteligencia de mercado y planificación (MEGA-PLAN) | conocimiento/backlog | Benchmark de 15 competidores (Compass, Sotheby's, KW, Remax CO, Habi, Metrocuadrado, Ciencuadras, Araujo y Segovia, Airbnb, KeyHome, Tristan, etc.) fechado 2026-05-05 (revalidar frescura). Análisis del competidor directo A&S: fortalezas (5 ciudades, 16 alianzas, pagos en línea) y 10 debilidades explotables (sin blog, sin equipo visible, sin testimonios, sin calculadoras, sin favoritos, sin guías de barrio). Matriz impacto/esfuerzo + backlog de 85 features en 11 bloques + roadmap 12 fases — usar como CATÁLOGO, no como plan secuencial. Inventario de paridad mínima ("lo que Altorra YA TIENE" al 2026-05-05). Backlog editorial Q2-Q3 2026 con keyword research hecho (~9 títulos mayo + 8 junio + ~18 ideas por categoría). |
| Activos SEO generados + contrato de versión de deploy | activos SEO/config | Carpeta /p/ (páginas OG por propiedad, 6 generadas) y /og/ (imágenes 1200×630) — insumo directo del mapa 301. sitemap.xml final curado ~30 URLs con prioridades/changefreq. robots.txt + archivo de verificación GSC. data/deploy-info.json {version, commit/sha, ref} bumpeado por Actions (contrato: escribir solo si hubo cambios reales; el frontend lo pollea cada 10 min). |
| Referencia arquitectónica Altorra Cars (NO contiene datos de la inmobiliaria) | meta/referencia | Repo hermano altorracars/altorracars.github.io (proyecto Firebase altorra-cars, distinto). Cosechable como PLANTILLA probada en producción: schemas de inventario/usuarios/solicitudes/satélites, matriz de reglas Firestore (inventario read público / _version / delete super_admin; loginAttempts público = riesgo conocido), reglas RTDB de presencia (.read a nivel colección + .indexOn ['online'] + onDisconnect), UPLOAD_CONFIG de imágenes (2MB/1200px/0.75), patrón trustedDevices 2FA, geolocalización sin key vía get.geojs.io, directorio legacy /v/ para backward-compat de URLs, backups/ con snapshots. Divergencias a decidir: Cars usa Compat SDK v11.3.0 + Node 22 + functions v7; inmobiliaria usaba Modular v12.9.0 + Node 20 + functions v6. |

## 3. Lecciones nuevas candidatas (evaluar contra L-01..L-12 antes de admitir a docs/30)

### C-01 — Fallbacks de CI: detección de secrets a nivel de JOB + fallback RUIDOSO
**Disparador:** Workflow que ramifica según exista un secret (credenciales Firebase vs fallback data.json).
**Causa:** Doble fallo en og-publish.yml: (1) el if a nivel de step leía una env que solo existe dentro del propio step → siempre truthy, el fallback nunca se activaba; (2) cuando el fallback SÍ corre, lo hace en silencio con build verde → el sitio publica SEO stale desde data.json sin que nadie lo note.
**Fix:** Definir la señal a nivel de JOB (env: HAS_FIREBASE_CREDS: ${{ secrets.X != '' }}) y ramificar steps contra esa env; log explícito de qué rama corrió y warning/fallo si la fuente primaria no está disponible — verificar en logs, no solo el status verde.

### C-02 — Bucket por defecto de proyectos Firebase nuevos es .firebasestorage.app, no .appspot.com
**Disparador:** Script/SDK admin que construya el nombre del bucket a mano.
**Causa:** Script de migración hardcodeaba la convención vieja; el proyecto real usa altorra-inmobiliaria-345c6.firebasestorage.app.
**Fix:** Nunca hardcodear el bucket: leerlo de env (STORAGE_BUCKET) con default verificado contra la consola del proyecto real.

### C-03 — Todo httpsCallable del frontend debe tener contraparte desplegada verificada
**Disparador:** Cerrar una feature de admin que invoca Cloud Functions callable.
**Causa:** admin-users.js llamaba updateUserRoleV2 pero la función no existía en functions/index.js — "código listo" en frontend con backend hueco, sin error en build.
**Fix:** Auditar 1:1 cada httpsCallable contra las exports reales de functions/index.js antes de marcar listo; en funciones de roles añadir requireSuperAdmin + guard anti-auto-degradación.

### C-04 — Claves opcionales del frontend: centralizar y degradar, nunca placeholders "de aspecto real"
**Disparador:** Features que dependen de API keys de terceros (Maps, VAPID/push).
**Causa:** Placeholders con aspecto de key real dispersos en varios archivos — riesgo de confusión/exposición y UI rota si nadie los reemplaza.
**Fix:** Un único bloque window.AltorraKeys como punto de edición del dueño; cada consumidor degrada limpio si falta su key (mapa muestra mensaje, botón push se oculta, requestPermission retorna null).

### C-05 — Todo flujo de conversión define su degradación (nunca perder un lead)
**Disparador:** Implementar cualquier captura de leads que dependa de Firebase/BD.
**Causa:** Sin fallback, un fallo de Firebase pierde el lead (exit-intent, formularios).
**Fix:** Proveedor secundario (FormSubmit con timeout 8s / mailto / WhatsApp) o acción alternativa que no pierda al usuario (redirigir a la guía).

### C-06 — Flash de placeholders en secciones dependientes de datos
**Disparador:** HTML renderiza secciones visibles con "Cargando…" y el JS las oculta después.
**Causa:** El orden render-HTML → query-BD → ocultar produce flash de ~500ms de UI que desaparece, muy visible con inventario vacío.
**Fix:** Secciones data-driven arrancan con display:none inline y se revelan SOLO cuando la BD devuelve datos reales; eliminar placeholders que nunca deberían verse.

### C-07 — Listeners con {once:true} rompen el sync en vivo
**Disparador:** Consumidores de eventos de datos (db-ready/db-refreshed).
**Causa:** El primer evento consume la suscripción: la primera carga funciona pero los refrescos posteriores nunca repintan.
**Fix:** Consumidores que deben reflejar cambios en vivo se suscriben SIN once:true y re-renderizan en cada db-refreshed.

### C-08 — Caches locales muestran entidades eliminadas (pruning obligatorio)
**Disparador:** Historial de visitas / banner destacada / cualquier cache derivado del catálogo.
**Causa:** localStorage/caches derivados no se validan contra la BD viva; los ítems borrados sobreviven indefinidamente.
**Fix:** Todo cache local derivado se poda contra la BD viva en cada refresh; si el ítem ya no existe, se elimina y las secciones dependientes se auto-ocultan.

### C-09 — Features que decoran DOM ajeno por MutationObserver: contrato implícito y deuda encubierta
**Disparador:** Añadir info a componentes renderizados por otro módulo (badges en cards, botones de comparador) sin tocar el renderer.
**Causa:** Doble evidencia: el comparador buscaba .card[data-id] y las tarjetas se renderizaban sin data-id (falla silenciosa); investment-badges e i18n acumularon observers globales por conveniencia.
**Fix:** El renderer de cards expone puntos de extensión explícitos (hooks/slots/pipeline de decoradores); todo renderer emite data-id como contrato formal; prohibido acoplar features por observación del DOM a posteriori.

### C-10 — El sync en vivo de grano grueso multiplica lecturas y amenaza el free-tier
**Disparador:** Diseñar invalidación de caché del catálogo.
**Causa:** Una señal (onSnapshot sobre system/meta) → recarga COMPLETA del catálogo en cada cliente conectado; con tráfico alto se acerca al límite de 50K lecturas/día.
**Fix:** Invalidación de grano fino (delta/por-documento o versión por colección), presupuestar lecturas por sesión y monitorear consumo desde el día 1 (firestore-meter).

### C-11 — RTDB: queries orderByChild exigen .read y .indexOn al NIVEL DE LA COLECCIÓN (complementa la lección RTDB existente)
**Disparador:** Widget realtime que consulta una colección RTDB completa (presencia).
**Causa:** Triple bug: .read solo a nivel /presence/$uid impedía la query de colección; sin .indexOn ['online'] RTDB rechaza orderByChild; el código hacía return silencioso si el SDK diferido no había cargado — ni falla ruidosa ni datos.
**Fix:** .read auth!=null a nivel de colección + .indexOn del campo consultado + retry cuando el SDK diferido no está listo + error callback visible + filtro de sesiones stale >5 min.

### C-12 — Módulo compartido reescrito pero nunca cargado: fallo silencioso total
**Disparador:** Cambiar el mecanismo de carga de un script compartido en un sitio multi-página sin bundler.
**Causa:** Se reescribió i18n.js y se removió su carga dinámica desde components.js, pero ninguna de las 21 páginas tenía <script> propio — sistema muerto sin error visible.
**Fix:** Al cambiar cómo se carga un módulo, grep del src en TODAS las páginas para verificar exactamente una vía de carga, y probar end-to-end en una página distinta a la del desarrollo; mantener inventario de qué páginas incluyen cada script compartido.

### C-13 — Contenido público que debe rankear: prerender/estático; dinámico solo lo táctico
**Disparador:** Renderizar contenido above-the-fold desde la BD en una página pública indexable / decidir arquitectura de blog.
**Causa:** El render 100% client-side degrada LCP, deja la página vacía para crawlers sin JS y no rankea bien.
**Fix:** Patrón validado: fallback estático hardcoded inmediato + <noscript> con el contenido + timeout de fallback (5s); el sitio viejo convergió a blog dual — HTML estático SEO-first para artículos pilar (BlogPosting + sitemap) y Firestore dinámico solo para contenido efímero. La decisión es por intención de ranking, no por comodidad.

### C-14 — Evolucionar enums de estado sobre datos vivos: mapear legacy en la capa de lectura, no migrar
**Disparador:** Añadir un estado intermedio a un pipeline (leads, reservas) con documentos existentes.
**Causa:** Se añadió "visita" al flujo de leads cuando ya había leads con los estados viejos.
**Fix:** Retrocompatibilidad por mapeo en la UI (pendiente→Nuevo, en_gestion→Contactado, cerrado→Cierre): cero escrituras, cero riesgo, los documentos migran al ser tocados. Diseñar enums asumiendo que crecerán.

### C-15 — Ediciones mecánicas masivas: partir en lotes verificables
**Disparador:** Cambio mecánico que toca cientos de entradas o decenas de archivos (diccionarios, renombrados, migraciones).
**Causa:** La expansión del i18n a 1174 entradas no cabía en una sola operación.
**Fix:** Partir en lotes con commits separados (+93, +58, +111, +62), cada uno verificable independientemente; aplica igual a scripts de migración de datos.

### C-16 — En vanilla JS sin bundler los helpers se duplican en silencio
**Disparador:** Crear el 2º módulo que necesite formatear moneda/escapar HTML.
**Causa:** Cada archivo era una IIFE con helpers locales — 13 copias de formatCOP y 6 de escapeHtml antes de detectarlo.
**Fix:** window.AltorraUtils (o módulo ES compartido) desde el día uno; patrón de delegación con fallback para legacy: var _u=window.AltorraUtils||{}; formatCOP delega si existe.

### C-17 — outline:none sin reemplazo = regresión de accesibilidad que llega a producción
**Disparador:** Cualquier CSS que toque :focus / outline.
**Causa:** Una regla quitó el outline "por estética" en drawer y menú y nadie lo notó hasta auditoría.
**Fix:** Nunca eliminar outline sin sustituto visible; anillos de focus con el gold de marca (rgba(212,175,55,.4)), reforzar :focus-visible; auditar focos en drawer, cards, botones, summary.

### C-18 — Links en footer/nav a páginas que no existen (creadas "por adelantado")
**Disparador:** Construir header/footer o añadir secciones de servicios.
**Causa:** El footer enlazaba 3 páginas de servicios que nunca se crearon — 3 links 404 en producción.
**Fix:** Solo enlazar páginas existentes; idealmente check de links internos en CI.

### C-19 — Cifras de mercado (ROI) inconsistentes entre páginas si no declaran su base
**Disparador:** Publicar cualquier cifra de ROI/rentabilidad/valorización en más de una página.
**Causa:** La guía mostraba ROI bruto y la landing Airbnb ROI neto — mismos conceptos, números distintos, contradicción aparente ante el usuario y Google.
**Fix:** Toda cifra declara su base (bruto vs neto, fuente, fecha) en el propio texto; datos de mercado en una fuente única que todas las páginas consuman, no hardcodeados por página.

### C-20 — Un solo script síncrono pesado puede ser el mayor cuello de LCP
**Disparador:** Diseñar la estrategia de carga de scripts/i18n.
**Causa:** i18n.js (138KB) cargaba sincrónico y era el mayor recurso render-blocking; además CSS de componente flotante en <body> generaba CLS.
**Fix:** i18n y todo script no crítico con defer/requestIdleCallback (patrón idle: 21→13 script tags, 0 render-blocking); CSS de componentes flotantes siempre en <head>.

### C-21 — Migraciones transversales: por inventario de páginas + barrido de huérfanos, no por feature
**Disparador:** Migrar cualquier contrato transversal (formularios, SDK, header) o cerrar una fase de refactor.
**Causa:** Doble evidencia: 4 páginas quedaron con action de FormSubmit y 3 sin firebase-config tras migrar formularios (encontradas meses después); 5 archivos JS huérfanos (~1.057 líneas de código muerto) sin referencia en ningún HTML.
**Fix:** Mantener inventario canónico de páginas; al migrar, barrido grep sobre TODAS antes de cerrar; barrido de referencias reales desde HTML (no comentarios) al final de cada migración y borrar lo huérfano en el mismo PR.

### C-22 — Idempotencia con flag emailSent en triggers de email
**Disparador:** Cloud Function que envía email/notificación al crearse un documento.
**Causa:** Los triggers Firestore son at-least-once; sin marca de idempotencia el admin recibe emails duplicados.
**Fix:** El documento lleva emailSent:false y la función lo marca true tras enviar; verificar el flag antes de enviar.

### C-23 — Debounce de 5 min entre cambio de BD y regeneración SEO
**Disparador:** Trigger onWrite de catálogo que encadena CI/CD externo.
**Causa:** Cada write dispararía un run de Actions; una sesión de edición del admin quemaría invocaciones y minutos.
**Fix:** onPropertyChange aplica debounce de 5 minutos antes del repository_dispatch; schedule de respaldo máx cada 4h.

### C-24 — No cachear snippets HTML (header/footer) en localStorage con TTL largo
**Disparador:** Componentes compartidos inyectados por JS en sitios estáticos.
**Causa:** Caché localStorage de 7 días: cambios de navegación tardaban hasta una semana en llegar a usuarios recurrentes.
**Fix:** fetch() simple + Promise.all y dejar el caching al navegador vía HTTP headers, con inyección condicional de modals.

### C-25 — Rate-limiting de login basado en Firestore con reglas públicas es manipulable
**Disparador:** Diseñar anti-brute-force del panel admin.
**Causa:** loginAttempts con allow read, create, update: if true (necesario porque el chequeo ocurre antes de autenticar) permite a cualquier cliente leer/resetear/inflar contadores.
**Fix:** No replicar: mover el control a lado servidor (Cloud Function / Identity Platform blocking functions) o al menos impedir update/delete público.

### C-26 — Invalidación de caché: DOS señales independientes Y monitorear que la señal no se congele
**Disparador:** Diseñar la capa de caché del catálogo.
**Causa:** Una sola señal deja un canal ciego (cambios de datos no cambian la versión de deploy y viceversa); además deploy-info.json quedó CONGELADO meses (gap J4) y el mecanismo murió sin síntoma.
**Fix:** Doble señal (doc meta lastModified vía onSnapshot + deploy-info.json polleado 10 min); el bump debe ser automático en CI (bump-version.yml) Y monitoreado con un check que compare fecha de deploy-info vs último deploy real.

### C-27 — Sitemap: lastmod fijo, nunca la fecha actual
**Disparador:** Generar/regenerar sitemap.xml en CI.
**Causa:** Google ignora lastmod si el sitemap siempre reporta la fecha del día.
**Fix:** lastmod fijo para estáticas y dinámico (updatedAt del documento) solo para ítems que realmente cambiaron.

### C-28 — GSC no reintenta un sitemap que falló en el primer fetch
**Disparador:** Sitemap nuevo o corregido que no aparece procesado en Search Console.
**Causa:** Google intentó fetchar el sitemap con errores y no reintentó solo.
**Fix:** Re-enviar manualmente en GSC + ping a Google tras corregirlo.

### C-29 — No construir dashboards de consumo con estimaciones hardcodeadas
**Disparador:** Tentación de mostrar métricas de cuota/free-tier en el panel admin.
**Causa:** No existe API client-side para medir consumo real de Storage/Firestore; el widget usaba constantes aproximadas = datos falsos con confianza injustificada.
**Fix:** Solo mostrar métricas medibles de verdad; monitoreo de cuotas en la consola GCP/Firebase.

### C-30 — clearAndReload sin grace period = loop infinito de recargas
**Disparador:** Invalidación de cache por deploy con auto-reload.
**Causa:** Tras limpiar cache y recargar, la validación de versión puede re-disparar antes de que el nuevo deploy-info se estabilice.
**Fix:** Grace period de 30s post-clearAndReload durante el cual no se vuelve a validar/recargar.

### C-31 — Workflow CI que commitea se re-dispara a sí mismo
**Disparador:** Cualquier workflow que genere y commitee artefactos a main.
**Causa:** El push del commit generado re-dispara el workflow (loop recursivo).
**Fix:** Commit con "[skip ci]" + commitear SOLO si hay cambios reales (diff no vacío) antes de bumpear deploy-info/SW/versiones.

### C-32 — Librerías de iconos por atributo no procesan el DOM inyectado
**Disparador:** Renders dinámicos (tablas, listas) en un admin con iconos declarativos (lucide).
**Causa:** createIcons() solo convierte los <i data-lucide> presentes al ejecutarse; el HTML inyectado después queda con iconos invisibles.
**Fix:** Helper refreshIcons() tras CADA innerHTML con iconos; init en DOMContentLoaded con fallback al load del script CDN.

### C-33 — Event delegation crashea con nodos hijos SVG
**Disparador:** Delegación de clicks en contenedores con botones que llevan iconos SVG.
**Causa:** e.target puede ser un nodo interno de SVG cuyo tipo rompe closest() directo.
**Fix:** Helper closestAction(e) que verifica nodeType antes de closest('[data-action]'); junto con la prohibición de onclick inline.

### C-34 — reCAPTCHA + SMS 2FA: el fallback Enterprise→v2 necesita render explícito
**Disparador:** Implementar 2FA por SMS con Firebase Auth Phone Provider.
**Causa:** Sin .render() explícito el fallback falla y los SMS no salen; contenedor DOM sucio e idioma por defecto degradan la UX.
**Fix:** .render() explícito, limpieza del contenedor entre intentos, useDeviceLanguage() para SMS en español, manejar expired-callback.

### C-35 — Carga diferida del SDK crea races en el admin (páginas en blanco)
**Disparador:** Scripts de admin que usan globals de SDKs cargados en segundo lote (Functions/Storage/RTDB).
**Causa:** Si un script usa window.functions antes de que el lote diferido resuelva, queda undefined y la página se ve en blanco; refrescar "lo arregla".
**Fix:** Nunca asumir globals de SDKs diferidos: promesas/eventos de readiness POR SERVICIO (patrón altorra:db-ready) y await antes de usar.

### C-36 — Roadmap monolítico multi-mes sobre negocio vivo queda obsoleto antes de recorrerlo
**Disparador:** Tentación de escribir otro mega-plan secuencial de fases al planificar el portal nuevo.
**Causa:** El MEGA-PLAN (2026-05-05) fijó 6-9 meses en 12 fases; el mandato greenfield del dueño (2026-07-10) lo superó en ~2 meses.
**Fix:** Conservar el catálogo de features como BACKLOG priorizado por impacto/esfuerzo, planificando en entregables cortos re-priorizables (specs por vertical), nunca en plan secuencial multi-mes.

### C-37 — El benchmark competitivo (sobre todo del competidor directo local) define los diferenciadores
**Disparador:** Antes de definir el feature set del portal nuevo.
**Causa:** Las 85 features del MEGA-PLAN derivaron del análisis de 15 competidores; lo más accionable fueron las debilidades de Araujo y Segovia — cada una se convirtió en eje de diferenciación.
**Fix:** Repetir el ejercicio al arrancar (los competidores habrán evolucionado desde 2026-05): re-verificar qué sigue siendo gap de A&S/Habi/Ciencuadras y diseñar contra el estado ACTUAL, reutilizando la estructura del §1 como plantilla.

### C-38 — El naming comercial puede ser clasista sin intención — agrupar por geografía, no por estrato
**Disparador:** Nombrar categorías de zonas/segmentos en la UI pública.
**Causa:** "Barrios premium"/"Zonas premium" y CSS diferenciado por zona (.barrio-card-norte) jerarquizaban socialmente los sectores; hubo que renombrar y ecualizar.
**Fix:** Nomenclatura geográfica neutral desde el día 1 ("Sectores de Cartagena", "Zona Norte", "urbanización cerrada"); ningún grupo recibe estilo visual privilegiado; lo premium va en el contenido.

### C-39 — El sitio viejo cerró sin tests automatizados (deuda reconocida)
**Disparador:** Cualquier refactor transversal en un código base sin red de seguridad.
**Causa:** Todo el QA fue manual (gap J5); con ~20 módulos JS y 8 CFs, cada cambio exigía re-verificación humana completa.
**Fix:** El portal nuevo nace con al menos smoke tests del camino crítico (búsqueda, detalle, formulario→lead, admin CRUD) integrados al CI.

## 4. Hechos de infraestructura verificables

- Proyecto Firebase: altorra-inmobiliaria-345c6 (Project Number 794130975989), Firestore Standard en nam5 modo producción, Functions en us-central1, cuenta CLI altorrainmobiliaria@gmail.com, repo local C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io. OJO: la doc temprana usaba "altorra-inmobiliaria" a secas — el ID con sufijo -345c6 es el verificado.
- Bucket de Storage real: altorra-inmobiliaria-345c6.firebasestorage.app (NO .appspot.com); estructura propiedades/{id}/*.webp; URL pública vía storage.googleapis.com; us-central1; rules: lectura pública de imágenes, escritura solo admins, máx 5MB solo imágenes.
- Servicios activados: Firestore, Auth (email/contraseña + anónimo), Storage, RTDB (us-central1, modo bloqueado), Secret Manager, GA4 con measurementId configurado; reglas de los 4 servicios desplegadas.
- Cloud Functions del sitio viejo (Node 20, firebase-functions ^6, firebase-admin ^13, nodemailer): onNewSolicitud (onCreate solicitudes → email admin + lead scoring + init nurturing), onSolicitudStatusChanged (onUpdate → email cliente), onPropertyChange (onWrite propiedades → debounce 5 min → repository_dispatch), triggerSeoRegeneration (callable, solo super_admin), createManagedUserV2, deleteManagedUserV2, updateUserRoleV2 (callables con verifySuperAdmin + guards anti-auto-degradación/eliminación), processNurturingEmails (scheduled cada 6h, requiere índice compuesto nurturing.nextEmailAt en firestore.indexes.json), sendNewsletter (callable super_admin, log en newsletter_sends). MEGA-PLAN citaba "8 CFs productivas"; el deploy quedó en estado PARCIAL documentado en DEPLOY-RUNBOOK.md — verificar con "firebase functions:list" antes de asumir infra viva.
- IAM requerido para deploy de Functions gen2: service-794130975989@gcp-sa-eventarc.iam.gserviceaccount.com → roles/eventarc.serviceAgent; 794130975989@cloudbuild.gserviceaccount.com → roles/cloudbuild.builds.builder; 794130975989-compute@developer.gserviceaccount.com → Cloud Run Invoker. APIs: cloudbuild.googleapis.com, eventarc.googleapis.com, run.googleapis.com, pubsub. Comando: firebase deploy --only functions --account altorrainmobiliaria@gmail.com. Cleanup policy: imágenes de contenedor se borran a los 30 días.
- Secrets: EMAIL_USER, EMAIL_PASS (app password Gmail) y GITHUB_PAT (repo+workflow) creados en Secret Manager (vía defineSecret()); GOOGLE_APPLICATION_CREDENTIALS_JSON como secret de GitHub Actions (un snapshot lo reporta pendiente — verificar). SA JSON local gitignored: C:\Users\romad\sa-altorra-inmobiliaria.json.
- CI/CD: og-publish.yml genera /p/{id}.html + /og/*.png + sitemap; triggers: push a main, schedule "0 */4 * * *" (tope acordado 4h), repository_dispatch [property-changed], workflow_dispatch; usa env de JOB HAS_FIREBASE_CREDS para elegir Firestore (scripts/generate-properties.mjs) vs fallback data.json (tools/generate_og_pages.js); bump-version.yml bumpea data/deploy-info.json en cada push (añadido tras el gap J4 de deploy-info congelado).
- Service Worker: CACHE_NAME formato altorra-pwa-vN; llegó a v4 (2026-04-26) con precache de 11 recursos del shell; bump v2→v3 (2026-04-24) por cambio de carga de i18n confirma la convención de bump ante cambios del shell; cliente invalida con Ctrl+Shift+R.
- Reglas Firestore verificadas: RBAC super_admin/editor/viewer con funciones hasProfile/getUserRole/isSuperAdmin/isEditorOrAbove + locking optimista _version (validVersion/validCreateVersion); propiedades read público; solicitudes create público / read auth; analytics_events create público / read auth; newsletter create+update público / read auth; blog read público / write editor+ con _version; loginAttempts read/write PÚBLICO (riesgo conocido, no replicar); default deny-all. RTDB rules de presencia con guards por sesión; database.rules.json SIEMPRE requiere deploy manual (firebase deploy --only database).
- Frontend: Firebase SDK v12.9.0 MODULAR (ESM vía CDN gstatic) en dos fases — crítica (App+Auth+Firestore con persistencia multi-tab) y diferida (Storage, Functions us-central1, Analytics, RTDB); globals window.db/auth/storage/functions/rtdb + evento altorra:db-ready. Cars (repo referencia) usa Compat v11.3.0 + Node 22 + functions v7 — el portal nuevo debe elegir UNO.
- Claves frontend esperadas en js/firebase-config.js bloque window.AltorraKeys: gmapsApiKey (Maps JavaScript API restringida por HTTP referrer a https://altorrainmobiliaria.co/* + *.altorrainmobiliaria.co + localhost) y vapidKey (FCM Web Push, formato "BNxD...") — pendientes de que el dueño las pegue; sin ellas mapa muestra "no disponible" y botón de alertas se oculta.
- Dominio altorrainmobiliaria.co con archivo CNAME en el repo (NO borrar), verificado HTTP 200; 301 desde altorrainmobiliaria.github.io resuelto (17 archivos corregidos); email oficial migrado de altorrainmobiliaria@gmail.com a info@altorrainmobiliaria.co. Hosting: GitHub Pages, push a main = auto-deploy.
- Usuario super_admin real en producción: usuarios/J1sXuV78OhPA5KyCoWNYFVQehF23 {rol:'super_admin', activo:true, bloqueado:false}; login del panel con info@altorrainmobiliaria.co. Error "Missing or insufficient permissions" en admin = falta doc en /usuarios/{uid} o rol insuficiente.
- Documentos Firestore de sistema requeridos para el boot: system/meta, config/general, config/counters (creados por scripts/upload-to-firestore.mjs).
- Scripts npm del repo viejo: npm run upload (poblar Firestore desde data.json), npm run migrate-images (fotos a Storage, DRY_RUN=1 soportado), npm run backup (export Firestore a JSON), npm run generate (páginas SEO); scripts/upload-blog-posts.mjs (seed blog, merge idempotente). package.json: única dep de producción firebase ^12.9.0; devDeps firebase-admin ^13 y sharp ^0.33.
- Flujo E2E verificado en el sitio viejo: editar propiedad en admin → updatedAt en Firestore → onPropertyChange dispara og-publish.yml tras 5 min → /p/{id}.html refleja cambios. Diagnóstico: firebase functions:list y firebase functions:log --account altorrainmobiliaria@gmail.com.
- Límites free-tier Blaze vigilados: Firestore 50K lecturas/20K escrituras/20K deletes por día y 1GiB; Auth 50K MAU; Storage 5GB + 1GB/día descarga; Functions 2M invocaciones/mes; RTDB 1GB + 10GB/mes. El sync en vivo del catálogo fue señalado como riesgo de acercarse al tope de lecturas. Existía js/firestore-meter.js (medidor de lecturas en cliente).
- Formularios en producción: pipeline Firebase (colección solicitudes) con fallback automático a FormSubmit hacia info@altorrainmobiliaria.co, rate limiting 30s y honeypot (js/contact-forms.js).
- El mapa usaba Leaflet (open source, sin API key, costo cero) con markers por operación en js/mapa-propiedades.js (versión final; una versión anterior dependía de Google Maps key).
- Scripts idle-loaded vía requestIdleCallback en el viejo: analytics.js, whatsapp-tracker.js, newsletter.js, firestore-meter.js (head) + wizard-publicar.js, historial-visitas.js, featured-week-banner.js, investment-badges.js, exclusivas.js (body) — patrón que dejó 0 scripts render-blocking.
- Repo de referencia arquitectónica: altorracars/altorracars.github.io (proyecto Firebase altorra-cars, authDomain altorra-cars.firebaseapp.com, Storage altorra-cars.firebasestorage.app) — distinto proyecto; WhatsApp de Cars +573235016747 (distinto del de inmobiliaria); Cars mantiene /v/ legacy para backward-compat de URLs y backups/ con snapshots Firestore; geolocalización sin key vía get.geojs.io/v1/ip/geo.json; tooling Biome 1.9.4 + Lucide v0.468.0.
- Runbook operativo del dueño: DEPLOY-RUNBOOK.md con 6 bloqueantes y comandos PowerShell exactos (fix Eventarc, npm run upload, migrate-images, secret de Actions, Maps key, VAPID key). Nota de fiabilidad: varios snapshots documentan momentos distintos (pendientes que luego se cerraron); el estado real al retiro del sitio (2026-07-10) debe verificarse en vivo, no asumirse de los docs.

## 5. SEO: URLs, keywords y patrones valiosos

### URLs

- Dominio canónico: https://altorrainmobiliaria.co (CNAME; 301 desde altorrainmobiliaria.github.io ya resuelto) — base de todo el mapa 301.
- Patrón SEO programático por propiedad: /p/{id}.html (canonical + OG + Twitter Card + JSON-LD RealEstateListing + noscript) — URL compartible en redes, candidata #1 al mapa 301; IDs vivos: /p/101-27.html, /p/102-11402.html, /p/103-B305.html, /p/104-01.html, /p/105-4422.html; imágenes OG indexables /og/{id}.jpg 1200×630.
- URLs núcleo a mapear en 301: / (index.html), /propiedades-comprar.html, /propiedades-arrendar.html, /propiedades-alojamientos.html, /detalle-propiedad.html?id={id} (y ?compare={id}), /busqueda.html (y ?q= — SearchAction/sitelinks searchbox), /contacto.html, /publicar-propiedad.html, /favoritos.html, /quienes-somos.html (#reseñas — las reseñas viven ahí, nav "Nuestro equipo"→"Reseñas"), /privacidad.html, /404.html, /admin.html.
- Páginas noindex deliberadas (no necesitan 301 SEO): gracias.html, servicios-mantenimiento.html, servicios-mudanzas.html, turismo.
- URLs de herramientas con potencial de keyword: /simulador.html (acepta ?precio=), /mapa.html, /avaluo.html.
- URLs de la vertical inversión: /invertir.html, /renta-turistica.html, /foreign-investors.html (EN, hreflang), /guia-inversionista-2026.html (priority 0.8), /estudios-mercado-cartagena.html (0.8), /glosario-inmobiliario.html (0.7), /prensa.html (0.6), /videos.html (0.7), /turismo-inmobiliario.html.
- Landings por intención (equity SEO): /comprar-apartamento-cartagena.html, /arrendar-apartamento-cartagena.html, /invertir-airbnb-cartagena.html, /propiedades-baru.html, /lotes-campestres-cartagena.html (creada para competir contra Altis).
- Landings de sector (priority 0.8-0.9): /serena-del-mar.html, /karibana.html, /manzanillo-del-mar.html, /la-boquilla.html, /cielo-mar.html, /el-laguito.html, /marbella.html, /san-diego.html, /pie-de-la-popa.html, /alto-bosque.html, /el-cabrero.html; sectores adicionales cubiertos: Bocagrande, Manga, Castillogrande, Centro Histórico, Crespo, Getsemaní, Barcelona de Indias, Tierrabomba, Barú — las URLs exactas de las 13 landings originales NO están listadas en los docs: extraerlas del sitemap.xml del repo viejo para el mapa 301.
- Blog: /blog.html, /blog/por-que-invertir-cartagena-2026.html, /blog/renta-turistica-vs-arriendo-tradicional.html, /blog/guia-legal-inversionistas-extranjeros.html, patrón dinámico /blog-post.html?slug={slug}; slugs adicionales vivos: impuestos-inmobiliarios-colombia-2026, mejores-zonas-airbnb-cartagena, vale-la-pena-invertir-en-cartagena-2026; plantilla blog/_plantilla-post.html.

### Keywords

- Title del home que funcionó: "Apartamentos y casas en Cartagena | Comprar, Arrendar, Invertir | Altorra Inmobiliaria"; formato general "Página | Altorra Inmobiliaria" con "Cartagena" en todos los títulos; claim de hero: "Inmobiliaria #1 en Cartagena".
- Keywords transaccionales validadas: comprar apartamento Cartagena, arrendar apartamento Cartagena, invertir Airbnb Cartagena, lotes campestres Cartagena, propiedades Barú, apartamento en venta Cartagena, arriendo, alojamientos por días.
- Keywords informacionales de las FAQ: ROI Cartagena, cuota inicial crédito hipotecario, tasa hipotecaria 2026, costos de cierre, UVR vs tasa fija, renta turística vs arriendo tradicional, atención bilingüe, gastos notariales compra vivienda colombia, vivir en Bocagrande.
- Keywords EN para extranjeros: buy property Cartagena for US/CA/ES investors, FBAR, FATCA, Form 8938, T1135, Modelo 720, investor visa Colombia, remote closing.
- Backlog editorial con keyword research hecho (mayo-junio 2026): roi apartamento cartagena; bocagrande vs castillogrande; due diligence compra inmueble colombia; visa inversionista colombia; mercado inmobiliario cartagena; rnt cartagena como tramitar; hipoteca extranjero colombia; getsemani inversion airbnb; errores comprar propiedad cartagena; IVA/INC renta turística; La Boquilla la próxima Bocagrande; Colombia vs México inversión USD; contrato arrendamiento modelo; avalúo comercial vs catastral; impuesto predial Cartagena 2026; nómadas digitales Cartagena.
- Entidades geográficas SEO (patrón "{sector} cartagena" / "propiedades en {sector}"): Bocagrande, Castillogrande, Manga, Centro Histórico, Getsemaní, San Diego, El Laguito, Marbella, El Cabrero, Pie de la Popa, Alto Bosque, Crespo, La Boquilla, Cielo Mar, Manzanillo del Mar, Serena del Mar, Karibana, Barcelona de Indias, Tierrabomba, Barú, Turbaco, Arjona.
- Keywords de barrio con ángulo de marketing: Bocagrande frente al mar, Manga vista a la bahía, Castillogrande exclusividad, Centro Histórico patrimonio UNESCO renta turística, Crespo cerca al aeropuerto, Manzanillo playa privada proyectos nuevos; keywords de tipo: apartamento, casa, lote, oficina, local, bodega.

### Patrones

- Query params que el listado interpreta (considerar en redirecciones): ?search={barrio}, ?type={tipo}, ?city={ciudad}, ?q={query}, ?compare={id}, ?precio={valor}, ?slug={slug}.
- sitemap.xml final curado ~30 URLs con prioridades (home 1.0, listados/landings 0.9, detalle/inversión 0.8, blog 0.7-0.8, servicios 0.5, privacidad 0.3) y changefreq por tipo; robots.txt con Disallow admin; archivo de verificación GSC en raíz.
- Schemas JSON-LD ya validados ante Google: RealEstateAgent + LocalBusiness dual enriquecido, BreadcrumbList (43 páginas según PLAN / 51 según MEGA-PLAN — cifra discrepante), RealEstateListing, FAQPage en home y 5+ landings, WebSite+SearchAction, Place con GPS en sectores, DefinedTermSet (glosario), Article/BlogPosting, CollectionPage (videos).
- Posicionamiento en IA: el sitio viejo rankeaba #1-#2 en respuestas de ChatGPT para "mejores inmobiliarias de Cartagena" (competidores citados: Altis Group, Inmobiliaria Cartagena) — estrategia: autoridad temática + Q&A estructurado.
- Reglas de slug editorial: minúsculas, guiones, sin tildes/ñ, 3-6 palabras; título 55-60 chars con keyword al inicio + año; meta description 140-160 chars; categorías blog canónicas: Inversión, Rentabilidad, Legal & Fiscal, Análisis, Mercado, Guías.
- Patrones portables de Cars (no son URLs a 301): slug de detalle inmutable {tipo}-{nombre}-{barrio}-{id} con mapa id→slug en JSON, páginas por taxonomía (análogo: /barrios/{slug}.html), landings estáticas por categoría, directorio legacy /v/{id} como precedente de estrategia de backward-compat, plantilla zona×tipo×operación×precio ("apartamentos-en-venta-bocagrande", "casas-cartagena-500-millones").
