# 🌍 R2 — REFERENTES MUNDIALES (features nivel-top verificadas · workflow wf_33d311a2, 17 agentes, 2026-07-10)

> Artefacto R2 (kickoff §5). 8 referentes (Zillow·Redfin·Realtor·Idealista·Rightmove·Zoopla·QuintoAndar·Fotocasa);
> mecánicas load-bearing re-verificadas adversarialmente. Airbnb/Booking → ya en R1 §4. Crudo completo:
> `../brain-private/altorrainmobiliaria/research-archive/2026-07-10-r2-referentes-mundo-crudo.txt`.

---

## 1. Catálogo de features nivel-mundo (por dominio, adopt/adapt/discard)

*Catálogo consolidado nivel-mundo — dedup de los 8 portales investigados (nota original de síntesis: al momento de sintetizar habían llegado 7 completos + QuintoAndar cortado en su sección SEO; el detalle completo de los 8 se reconstruyó después vía `detalle`, usado íntegro en la §6 de este documento).*

> ⚠️ Nota de método (de la síntesis original): el dataset de síntesis llegó truncado — Zillow, Redfin, realtor.com, idealista, Rightmove y Zoopla completos; QuintoAndar cortado en su sección SEO (features + modelo de negocio sí completos); el 8º referente (Fotocasa) no había llegado en el payload de síntesis (sí está completo en `detalle`, §6.8). Los veredictos integran las correcciones adversariales: ítems marcados **[CORREGIDO]** / **[NO-VERIFICABLE]**.

### 1.1 Búsqueda / Mapa
- **Búsqueda de una línea con autocompletado de barrios** (Zillow hero, idealista, Habi ya lo clonó) — **ADOPT**: input único operación+texto con autocompletado de los 13 sectores de Cartagena; toda la complejidad después de la primera búsqueda, no antes.
- **Split-view mapa/cards** (validado Airbnb en R1; Zillow/Redfin/Zoopla) — **ADOPT**: Leaflet gratis, inventario chico = filtrado client-side, cero reads extra.
- **Polígono dibujado + multizona** (Zillow draw ×5 áreas, Redfin, idealista `shape=` polyline en URL CONFIRMADO, Rightmove draw-a-search, Zoopla; realtor **[NO-VERIFICABLE]** por bloqueo bot) — **ADAPT en 2 fases**: Fase 1 MVP = multi-selección de sectores curados como filtro guardable (cubre 90% del valor); Fase 2 = leaflet-draw + turf.booleanPointInPolygon client-side sobre el JSON paginado, polígono serializado en la URL (patrón idealista) para compartir/guardar como alerta.
- **Polígonos precargados semánticos** ("a X cuadras de la playa / ciudad amurallada", derivado de Zoopla) — **ADOPT**: carga semántica turística que ningún límite administrativo captura.
- **Travel-time / isócronas** (Zoopla) — **DISCARD**: APIs de isócronas cuestan; en ciudad compacta el barrio es el proxy.
- **Filtros apilables con URL indexable** (Zillow) — **ADAPT**: solo landings curadas pre-renderizadas se indexan; búsquedas con querystring en noindex (ver SEO).
- **Tres buscadores en el hero** (Rightmove: comprar/arrendar/precios vendidos) — **ADAPT**: tercer tab = "¿Cuánto renta tu propiedad por noches?" (más diferenciador que precios de venta dado el hueco de corta estancia).

### 1.2 Ficha / Media
- **Contrato de datos uniforme + fallback visible** (Rightmove "Ask agent", Zoopla Material Information "TBC") — **ADOPT**: esquema fijo (precio, admin, estrato, año, m², parqueadero, fecha publicado/rebajado); campo vacío → "Pregúntale al asesor" con deep-link WhatsApp. Presión social de completitud sin moderación manual.
- **Historial de precios + días publicado + "Rebajado el X"** (Redfin **[CORREGIDO]**: la narrativa de cruzado de transparencia está INVERTIDA en 2026 — Redfin Early Access/Compass ya ocultan DOM y price-drops en pre-market; idealista "actualizado hace 3 días"; realtor "[Updated 7/10]"; QuintoAndar tags) — **ADOPT sin la letra chica**: subcolección `priceHistory` en Firestore + badges de frescura. Lección de la corrección: Altorra NO replica la opacidad selectiva; transparencia total como marca.
- **Costo total desglosado en card y ficha** (QuintoAndar: "R$3.700 aluguel / R$3.941 total", verificado en render) — **ADOPT**: canon+admin=total; en corta estancia noche+aseo+servicio=total estadía. Costo ~cero, anti-Properati.
- **Tour 360 / video / floor plan** (Zillow 3D Home: +60% views, +72% shares medidos; idealista lo vende 69,9–299€; realtor sindica Matterport) — **ADAPT**: Pannellum/Marzipano (JS libre, vanilla-compatible) + video vertical formato WhatsApp/IG; campo `tour_url` con embeds lazy-facade (doctrina §3.1). Prioridad corta estancia donde el tour ES la decisión. **DISCARD** Matterport/self-tour smart locks.
- **Capas de datos de entorno en ficha** (realtor First Street: 5 riesgos climáticos) — **ADAPT con datos abiertos CO**: riesgo inundación/arroyos (IDEAM/POT), distancia a playa, ruido nocturno por zona, normativa turística por edificio. **DISCARD** proyecciones a 30 años. La ficha como "expediente de decisión" que se comparte por WhatsApp.
- **Calculadoras embebidas en el punto de decisión** (Zoopla hipoteca+stamp duty en ficha) — **ADAPT**: crédito hipotecario (tasas públicas bancos CO) + gastos notariales (table stakes, Ciencuadras ya la tiene) + la inversa turística: "este apto a $X se paga con N noches/mes".
- **Página permanente que nunca muere** (Zillow off-market/zpid, realtor ID M-xxxxx, idealista `/inmueble/{id}`) — **ADOPT**: `/p/{id}` cambia a estado "vendido/arrendado" visible, jamás 404. Anti-avisos-zombis pro-SEO.
- **Páginas de edificio/conjunto con CTA de captación** (Zillow claim-your-home adaptado) — **ADAPT**: páginas permanentes de edificios de Bocagrande/Manga/Centro con histórico + "¿tienes una propiedad aquí? véndela/arriéndala con Altorra". Astro SSG gratis.
- **Badges de media en cards SERP** (Rightmove: nº fotos, floorplan, tour, "Reduced on") — **ADOPT**.

### 1.3 Confianza / Verificación
- **Verificación de identidad del publicador** (Zillow landlord+SSN **[NO-VERIFICABLE en detalle]** — 403, solo título; Redfin identidad en 1er tour CONFIRMADO) — **ADOPT**: cédula + CTL o predial → badge "Propietario verificado" con fecha; verificación manual humana = ventaja a escala Cartagena, no limitación.
- **Verificación de huésped pre-reserva** (Redfin Direct Access adaptado) — **ADOPT**: foto de documento antes de confirmar reserva de corta estancia. Pieza del pago protegido.
- **"Salirse del canal = señal de fraude"** (Zillow: chat+aplicación+pago dentro; idealista chat cerrado) — **ADAPT invertido**: en CO el canal es WhatsApp y el gating es queja transversal (R1) → **DISCARD chat cerrado** (idealista); el DINERO sí queda dentro (reserva solo vía Wompi, nunca anticipos por fuera) + copy educativo antifraude + tracking clic-a-WhatsApp GA4.
- **Frescura como UI de primera clase** ("verificado el DD/MM", "actualizado hace X días" — idealista, realtor, realtor refresh 15-min CONFIRMADO) — **ADOPT**: `updatedAt` humanizado + re-confirmación periódica de disponibilidad. Ataca la queja pública #1 del mercado CO.
- **Reviews solo post-transacción verificada** (realtor: reviews de cierre separadas de recomendaciones abiertas) — **ADOPT** para aliados y para huéspedes de corta estancia: no gameable por arquitectura.
- **Trust delegado en profesionales regulados / cero particulares** (Rightmove Companies House + redress) — **DISCARD como modelo** (el lado 2 de particulares ES el hueco CO) pero **ADAPT el principio**: vetting de entrada para aliados B2B (RUT + Cámara de Comercio + matrícula de arrendador) y frontera dura particular/profesional (idealista: agencia no publica como particular; campo `tipoAnunciante` + moderación) — **ADOPT**.
- **Número de registro turístico visible** (idealista RD 1312/2024: badge de legalidad) — **ADOPT**: badge "RNT verificado" en fichas de corta estancia. Al procesar pagos, Altorra probablemente está OBLIGADA a exigirlo → gate legal R3.
- **Vistoria/inventario entrada-salida con evidencia** (QuintoAndar: agendada auto, informe en app, ventana de 5 días) — **ADOPT versión checklist**: PDF fotográfico firmado por ambas partes (Cloud Function); sirve a arriendo largo Y turnover turístico. Es lo que hace ejecutable cualquier garantía de daños.

### 1.4 Arriendo sin codeudor (detalle completo → §3)
- **Scoring digital de inquilino** (QuintoAndar: renta ≥2,5×, suma hasta 4 personas, burós+judicial) — **ADAPT**: reglas + revisión humana SLA 24h, nada de ML al inicio.
- **Aplicación/perfil portátil 1→N** (Zillow $35/30 días ilimitadas CONFIRMADO vigente; Experian soft-pull + CIC) — **ADAPT**: perfil reutilizable en Firestore/Storage (cédula, carta laboral, extractos, referencias) adjuntable con 1 clic a N solicitudes; badge "perfil completo". El patrón 1→N es oro copiable YA, sin centrales.
- **Pre-cualificación iniciada por el inquilino + certificado portable** (idealista 2025: certificado de renta máxima cubierta, compartible por WhatsApp; Garantía 5,4% renta anual) — **ADAPT**: "el inquilino paga por ser creíble" encaja con cultura de afianzadora CO; certificado compartible por WhatsApp es nativo del canal.
- **Garantía al propietario** (QuintoAndar Pagamento Garantido: paga el día 12 aunque no le paguen, daños hasta R$50k, póliza Fairfax SUSEP) — **ADAPT SIN balance propio**: integrar aseguradora/afianzadora local con precio público → gate legal R3 (actividad aseguradora reservada).
- **Pagos de renta online + recordatorios** (Zillow: ACH gratis/débito $9.95/crédito 2.95% vía Stripe+Plaid CONFIRMADO; **[CORREGIDO]**: credit-building es OPT-IN, tier gratis solo Experian, CreditClimb $20/año para 3 burós; depósito real 3-5 días hábiles, 7-10 el primero) — **ADAPT**: Wompi PSE (análogo ACH) + tarjeta con fee trasladado + recordatorios WhatsApp vía Cloud Function programada. Sustituto del credit-building: "certificado de buen pagador Altorra" tras N pagos puntuales → validar en R3 que no constituya reporte crediticio regulado.
- **Firma digital end-to-end** (QuintoAndar DocuSign mismo día; idealista gratis eIDAS; realtor Avail por estado) — **ADAPT**: Ley 527/1999; PDF autogenerado + OTP a WhatsApp/email + hash SHA-256 + timestamp en Firestore; ZapSign free-tier si se necesita proveedor. Nivel de firma exigible → gate legal R3.
- **Lead enriquecido + checklist de proceso del inquilino** (Rightmove Lead-to-Keys / Renter Checklist) — **ADOPT**: formulario que pre-captura ocupación/ingresos/fecha de mudanza (gratis, solo UX) + página de estado del proceso por lead. Humanización que nadie tiene en CO.

### 1.5 AVM / Data
- **AVM puro** (Zillow Zestimate **[CORREGIDO]**: cifras del claim eran de 2021, hoy ~1.9% on-market / ~7.0-7.5% off, cobertura >104M; Redfin Estimate CONFIRMADO 1.86%/7.22% con 500+ datapoints; Zoopla **[CORREGIDO]**: el consumer muestra cifra puntual + rangos, no solo rango, y "regresión hedónica" es **[NO-VERIFICABLE]** — solo declaran ML; realtor 3 AVMs de terceros; Rightmove banda de confianza CONFIRMADA; idealista CONFIRMADO 8-12% urbano; QuintoAndar QPreço) — **ADAPT unánime de los 7**: sin MLS ni registro de cierres abierto en CO, AVM real es inviable → **"Rango Altorra"** = mediana $/m² por barrio+tipo de la base propia, SIEMPRE rango con banda de confianza honesta y metodología visible ("basado en N propiedades similares en {barrio}"). La lección de Rightmove: la honestidad estadística convierte mejor que la falsa precisión.
- **Rentímetro turístico** (síntesis propia — ningún referente ni rival CO lo tiene) — **ADOPT/CREAR**: ADR × ocupación estimada por zona, tabla curada a mano; alimenta el loop inversión→renta turística (Ola 3 R1). El AVM diferencial de Cartagena.
- **Claim your home / Mi Propiedad** (Zillow claim, Zoopla My Home 6M+ usuarios CONFIRMADO y 400k homeowner→seller en 2025 CONFIRMADO, Rightmove Track: refresh 30 días + hasta 200 propiedades CONFIRMADO) — **ADAPT**: doc "Mi Propiedad" por usuario Auth + email trimestral con comparables nuevos del barrio + medidor de demanda emulado con conteo de búsquedas/favoritos. La fábrica de inventario más barata que existe: captura al vendedor años antes.
- **Widget de valoración contacto-PRIMERO** (Zoopla — **[CORREGIDO]**: el producto se llama Zoopla Valuation Tool, "SmartVal" era de Boomin, quebrado; Redfin /what-is-my-home-worth con Allow explícito en robots CONFIRMADO) — **ADOPT**: multi-step en las 13 landings: barrio→tipo→m²→WhatsApp del dueño→rango + "un asesor lo afina gratis en 24h". El ORDEN (lead antes del resultado) es la clave copiable.
- **Índice de precios publicable** (Rightmove HPI CONFIRMADO: asking prices ~200k avisos/mes, citado por prensa; Redfin Data Center) — **ADOPT**: "Índice Altorra Cartagena" trimestral con muestra declarada (con 30-50 avisos ya es honesto) + nota a medios locales. Refuerza posición #1-2 en ChatGPT.
- **Páginas de mercado por zona con data viva** (Rightmove sold-prices **[CORREGIDO menor]**: Land Registry publica el 20º día HÁBIL, no el día 20; Redfin housing-market ×4 entidades; Zoopla house-prices) — **ADAPT**: las 13 landings evolucionan a mini-páginas de mercado con data REAL propia (mediana $/m², nº avisos, días publicados, precio/noche). Regla anti-Arenas: sin inventario o contenido real, NO hay página.
- **Compete Score / benchmarks en flujos** (Redfin "71% de ofertas incluyó inspección") — **DISCARD hasta tener volumen de señales**; instrumentar los datos desde el día 1 para habilitarlo después.

### 1.6 Alertas / Retención
- **Saved search + alertas multi-frecuencia + trigger de bajada de precio** (los 7; idealista CONFIRMADO con matiz — bajadas van en el digest diario; Redfin **[CORREGIDO]**: "3h más rápido que Zillow" es estudio de 2017, pre-Zillow-brokerage, NO citar como vigente; el "70% en <5 min" sí vigente) — **ADOPT**: colección `savedSearches` + Cloud Function onCreate/onUpdate que matchea (N pequeño = trivial) → email (Trigger Email/Resend free) + push FCM. Frecuencia elegible. Con inventario propio la frescura es nativa: publicar la promesa "te avisamos el mismo día" (feature medible y comunicable, lección Redfin).
- **Registro solo-email al guardar / login solo al guardar** (idealista CONFIRMADO; Zillow) — **ADOPT**: conversión anónimo→lead en un campo; anti-gating (patrón CO que mata funnels).
- **Alerta por WhatsApp** (QuintoAndar Farejar multicanal) — **ADAPT**: email+push MVP; deep-link wa.me con resumen; WhatsApp API de pago pospuesta.
- **Favoritos compartidos + comentarios (co-buyer)** (realtor 2024, Realtor.com+ 2026) — **ADOPT**: AltorraFavoritos ya existe; añadir link compartido pareja/familia con comentarios por propiedad. La decisión inmobiliaria es multi-persona y nadie en CO lo soporta; costo casi cero.

### 1.7 Herramientas de agente / aliado (lado 3)
- **Leads success-fee pay-at-close** (Zillow Flex 35-40%; Redfin Partner 30-35% con fee schedule PÚBLICO; realtor ReadyConnect **[CORREGIDO]**: tabla vigente post-nov-2024 = arriendos 20%, seller 40%, buyer 28-40% sobre comisión bruta, y el flujo de leads 2025 está flojo — no idealizar el grifo) — **ADAPT — ES el modelo del lado 3**: leads gratis a brokers cartageneros + fee de éxito pactado (20-30%) al cierre verificado, tarifas PUBLICADAS (anti-B2B-opaco de R1). Mitigar el cierre por-honor con contrato de referido firmado + seguimiento WhatsApp. Registrar `lead.source` + timestamp (atribución first-touch) desde el día 1 aunque se cobre en Ola 3.
- **Suscripción de visibilidad por zona** (realtor Connections Plus **[CORREGIDO]**: el lead no-exclusivo va a 3-5 agentes, no 2; Market VIP se firma a nivel brokerage $3-10k/mes; Zillow Premier; idealista subidón/destacado con cupos y decay) — **ADAPT Ola 2-3**: "Destacado de barrio" vía Wompi recurrente. **NUNCA** el dark pattern de enrutar el lead a alguien distinto del publicador sin decirlo.
- **Panel de aliado con métricas y comparativa** (Rightmove Plus: Market Share, Best Price Guide) — **ADAPT mini**: leads + tiempos de respuesta + views por ficha + comparativa anónima vs promedio; generador PDF de comparables desde el inventario. **DISCARD** Opportunity Manager (requiere data de todo el mercado).
- **CRM completo / super-app** (Zillow Workspace ~$1B en adquisiciones; idealista/tools; Zoopla Alto) — **DISCARD como suite**; rescatar solo inbox de leads con estados (nuevo/contactado/visita/cerrado) + cruce simple demanda↔inventario en el panel admin existente.
- **Escaparate/micrositio del aliado** (idealista) — **ADOPT**: `/aliado/{slug}` con logo, matrícula, verificación, inventario y reviews post-cierre.
- **Directorio con reviews verificadas por transacción** (realtor) — **ADOPT**: escalera natural "gratis-pero-lead-a-la-red / pago-y-el-lead-es-tuyo".
- **Programa de referidos con tabla pública** (QuintoAndar: R$100 por publicar, 10% del 1er arriendo, R$1.000 por venta; R$2M+ pagados) — **ADOPT tabla criolla** de captación de inventario.
- **Advisor humano que valida el lead de vendedor** (realtor/UpNest: llamada en minutos) — **ADOPT**: WhatsApp en <5 min, no call center. El vendedor es el usuario más valioso (trae inventario) y el peor atendido.
- **Referidos que PAGAN al aliado** (Zoopla Progression: £100 conveyancing, £400 hipoteca) — **ADAPT tardío**: alianzas notaría/abogado CTL/banco compartiendo fee con el aliado que trae el negocio.

### 1.8 Monetización
- **Freemium generoso + upgrade de pago único** (Zillow $39.99/90 días CONFIRMADO; escalera $0→premium→success-fee de Rentals +39%) — **ADAPT**: publicación gratuita generosa (hueco vs Ciencuadras 3/90días) → destacado Wompi pago único ~$30-50k COP. Activar en Ola 2: vender ranking sin liquidez mata la confianza (lección del decay de idealista).
- **Pay-per-lease / fee al cierre** (Zillow Lease Connect; ver 1.7) — **ADAPT**: el pricing de éxito desbloquea al cliente que la suscripción espanta.
- **Booking fee de corta estancia con pago protegido** (lección estructural Redfin/Rocket: el dinero está en la transacción y adyacentes, no en el clasificado) — **ADOPT**: monetización #1 del MVP.
- **Media como producto** (idealista book 69,9€/tour 199€/video 299€) — **ADAPT**: pack foto+tour de pago a particulares/aliados con fotógrafo local + filtro "con video/tour" en SERP.
- **Venta de data B2B** (idealista/data, Hometrack 80%±10% CONFIRMADO como cifra auto-reportada) — **DISCARD por años**; instrumentar el exhaust de datos desde el día 1.
- **Incentivos condicionados PUBLICADOS con números exactos** (Redfin Sign & Save 0.25-0.5%, fee schedules públicos) — **ADOPT como principio transversal**: "sabes lo que pagas antes de firmar" — golpea la opacidad verificada de A&S (8%/3%+IVA escondidos) y Arenas (~10%+20% mercadeo).
- **Screening pagado por el aplicante** (Zillow $35; realtor Avail/TransUnion) — **ADAPT**: cobro Wompi único cuando entre verificación con centrales → gate legal R3 (habeas data + límites de cobros al arrendatario).
- **Cross-sell financiero** (hipotecas Zillow $199M/Zoopla Mojo/realtor) — **ADAPT tardío**: referido a banco aliado, sin originación propia.

---

## 2. Top 10 features para el MVP de Cartagena

*Orden por impacto/esfuerzo, coherentes con las 14 oportunidades de R1.*

1. **Booking de corta estancia con pago protegido Wompi + verificación de huésped** — R1 ops #1-2 (hueco de mercado verificado: NINGÚN portal CO tiene booking real y el único que lo roza tiene fraude documentado). Mecánica: calendario + precio/noche + desglose total estadía + wizard multi-step de reserva (patrón Redfin Direct) + retención hasta check-in + foto de documento del huésped (Redfin identity-first) + badge RNT. Impacto: diferencial fundacional + primera línea de ingreso. Esfuerzo: medio (Wompi skills ya en el cerebro). ⚠️ Depende de 2 gates legales R3 (retención de fondos, RNT) — diseñar en paralelo, no lanzar antes del gate.
2. **Frescura + historial de precios visibles en toda card y ficha** — "Publicado hace X · Actualizado el X · Verificado el X" + subcolección `priceHistory` + badge "Bajó de precio" (idealista/realtor/QuintoAndar; Redfin corregido como advertencia de no copiar su opacidad 2026). Ataca la queja pública #1 del mercado CO (avisos zombis). Esfuerzo: casi nulo (un array + UI).
3. **Transparencia total de costos** — precio total desglosado en card (QuintoAndar dos-precios), comisiones y tarifas PUBLICADAS con números exactos (Redfin/realtor fee schedules). R1: opacidad es patrón transversal CO; esto es diferenciador gratis. Esfuerzo: casi nulo, es contenido + convicción.
4. **SEO/AEO compuesto de ficha y sitemap** — JSON-LD server-rendered [RealEstateListing + Product/Offer + SingleFamilyResidence + BreadcrumbList] (patrón realtor verificado en vivo; roto en el 100% del mercado CO según R1), meta description como micro-ficha con datos vivos, title con "[Actualizado D/M]", sitemaps segmentados por estado (nuevas/rebajadas/vendidas) regenerados por el CI existente (og-publish.yml) + og:image dinámica para WhatsApp. Esfuerzo: bajo (CI ya existe). Impacto: rich results y AEO sin dueño en CO.
5. **Saved searches + alertas con registro solo-email** — matching en Cloud Function onCreate, email+push FCM, trigger de bajada de precio, frecuencia elegible, promesa publicada "te avisamos el mismo día" (síntesis Zillow/Redfin/idealista/Rightmove; login solo al GUARDAR, nunca para ver — anti-gating R1). Es la máquina de leads con intención declarada. Esfuerzo: bajo, free-tier limpio.
6. **Sello "Verificado por Altorra"** — cédula + CTL o predial del publicador, revisión manual, badge con fecha + re-confirmación periódica de disponibilidad (realtor trust-por-fuente adaptado sin MLS; Ola 2 de R1 adelantada porque es la condición de confianza del resto). La escala Cartagena hace viable la verificación humana. Esfuerzo: bajo-medio (proceso, no software).
7. **"Agendar visita" con selector fecha/hora como CTA primario** — slots del asesor en Firestore + confirmación WhatsApp (Redfin Book It Now + QuintoAndar self-service; videollamada WhatsApp para comprador del exterior). Convierte interés en cita en vez de formulario genérico; nadie en Cartagena lo tiene. Esfuerzo: bajo.
8. **Fichas permanentes + estados visibles + páginas de edificio/zona** — vendido/arrendado nunca 404 (Zillow/realtor), páginas de edificios emblemáticos con CTA "¿tienes propiedad aquí?" (claim-your-home criollo). SEO acumulativo + honestidad anti-zombi + fábrica de captación de inventario. Esfuerzo: bajo (Astro/CI existente).
9. **Perfil de inquilino reutilizable 1→N** — checklist documental (cédula, carta laboral, extractos, referencias) en Storage, adjuntable con 1 clic a N solicitudes, badge "perfil completo" (Zillow portable application sin el buró; embrión del modelo QuintoAndar). Mata la fricción #1 del arriendo sin depender de Datacrédito. Esfuerzo: medio-bajo. Escalación con centrales/garantía → R3.
10. **"Rango Altorra" + Rentímetro turístico con captura contacto-primero** — landing "¿Cuánto vale/renta tu propiedad?" multi-step: barrio→tipo→m²→WhatsApp→rango honesto con banda de confianza + "un asesor lo afina en 24h" (Zoopla Valuation Tool + Redfin lead magnet + QPreço; el rentímetro por noche no lo tiene NADIE en CO). Es el flypaper de dueños = inventario, el activo más escaso. Esfuerzo: medio (tabla curada a mano por sector). Frontera MVP→Ola 2: lanzar la landing con rangos manuales de 10 barrios ya vale.

**Fuera del MVP a propósito** (alto valor, mal timing): polígono dibujado (multi-sector primero), garantía de arriendo y scoring con centrales (gate legal + partner), pagos recurrentes de canon con repasse (Ola 2, tras el rail de booking), destacados de pago (sin liquidez matan confianza), CRM/panel aliados completo (empezar manual con WhatsApp + Firestore), Índice Altorra (trimestre 2, cuando haya muestra).

---

## 3. 🔑 QuintoAndar a fondo: arriendo digital SIN codeudor y su versión colombiana

### 3.1 La arquitectura del modelo (por qué funciona como sistema, no como features sueltas)
QuintoAndar eliminó fiador, depósito y notaría reemplazándolos por una cadena donde cada eslabón hace posible el siguiente: **scoring** (filtra el riesgo) → **garantía** (absorbe el riesgo residual y convence al propietario) → **rail de pagos propio** (hace ejecutable la garantía y financia todo) → **firma digital** (cierra sin fricción) → **vistoria** (hace ejecutable la cobertura de daños). Quitar un eslabón rompe el sistema: sin garantía, el scoring es solo una promesa; sin rail de pagos, la garantía no se puede fondear ni ejecutar.

### 3.2 Scoring del inquilino
- CTA "Fazer avaliação" desde la ficha (3er nivel: visita → propuesta → evaluación).
- Requisito núcleo: **renta ≥2,5× (arriendo + condominio + IPTU)**, con posibilidad de **sumar ingresos de hasta 4 personas** (clave para parejas e informalidad — verificado en ficha real).
- Insumos: identidad, comprobación de ingresos, burós de crédito, procesos judiciales como demandado, oscilaciones de gasto e historial de pagos compatible.
- Motor: big data + regresión estadística + IA del equipo de crédito. El propietario NO ve los datos crudos, solo la aprobación (privacidad por diseño).
- Resultado: contrato sin fiador, sin depósito, en horas.
- *Verificación adversarial:* **CORREGIDO** — el 2,5× es sobre renta BRUTA e incluye también el seguro de incendio (arriendo+condominio+IPTU+seguro-incendio), no solo arriendo+condominio+IPTU; las 4 personas quedan TODAS como responsables legales del contrato.

### 3.3 Garantía al propietario (Pagamento Garantido) — EL producto
- El propietario recibe arriendo + IPTU **el día 12 de cada mes aunque el inquilino no pague**; QuintoAndar paga de caja y cobra por su cuenta.
- **Daños hasta R$50.000** al fin del contrato: mediación → QuintoAndar paga al dueño → persigue al inquilino. La vistoria de entrada/salida (tercerizada, agendada automáticamente 2 días antes, informe en app con ventana de comentarios de 5 días) es la evidencia que la hace ejecutable.
- Respaldo: **póliza de Fairfax Brasil (SUSEP FIP 04669)** + absorción por volumen. **R$200M+ pagados desde 2015**.
- Cómo se financia: NO es un cargo aparte — la **taxa de administração del 9,3% mensual (mín. R$160) ES la prima**. Insight central: la garantía no es un seguro que se revende; es el producto, y la comisión mensual es su prima.
- *Verificación adversarial:* **CORREGIDO** — el 9,3% es un TECHO ("hasta 9,3%") con piso mínimo de R$160/mes, vigente para anuncios publicados desde jun-2024 (contratos anteriores tienen tasas distintas); el Pagamento Garantido aplica solo a propietarios bajo plan de administración QuintoAndar; la ventana de comentarios de la vistoria tiene fuentes oficiales contradictorias (5 días vs 15 días corridos).

### 3.4 Economía completa (quién paga qué)
- **Propietario**: corretagem = 1 mes de arriendo (descontada del primer repasse, financiable vía partner MOVA) + 9,3% mensual sobre arriendo neto.
- **Inquilino**: taxa de serviço mensual (~R$103 sobre canon de R$4.000 ≈ 2,6%, vista en ficha real) + seguro de incendio obligatorio (R$51). Paga UN solo boleto mensual (canon+condominio+seguro+taxa); QuintoAndar reparte y muestra el desglose en "Entenda seu Repasse".
- **Costos variables, no fijos**: corretores freelance con CRECI pagados por evento (R$100 por inmueble publicado por referido, 10% del primer arriendo, R$1.000 por venta); vistoriadores tercerizados.
- **Firma**: DocuSign el mismo día, 4 niveles de autenticación, sin notaría, validez plena. *Verificación:* **CONFIRMADO**, con matices aditivos — plazo máximo de 72h para firmar, contrato activo solo cuando firman TODAS las partes, almacenamiento 5 años.

### 3.5 Versión colombiana viable (Wompi + aseguradora local + gate legal)
**Principio rector: Altorra NO absorbe riesgo con balance propio ni emite garantías** — eso es actividad aseguradora reservada a entidades vigiladas por la Superfinanciera (gate legal duro). El modelo criollo re-ensambla la cadena con piezas locales:

**Fase 0 (MVP, sin partner, sin gate legal):**
- Perfil de inquilino reutilizable 1→N en Firestore/Storage (docs: cédula, carta laboral, extractos, referencias) + badge "perfil completo".
- Scoring por REGLAS en Cloud Function (renta ≥2,5× canon+admin, suma de 2-4 ingresos) + revisión humana con SLA 24h. Nada de ML: reglas + humano ya supera al mercado CO.
- Vistoria criolla: checklist fotográfico de entrada/salida como PDF generado (Cloud Function) firmado por ambas partes — sirve también al turnover de corta estancia.
- ⚠️ Dato legal estructural a favor: la **Ley 820/2003 prohíbe exigir depósitos en arriendo de vivienda urbana** — en Colombia "sin depósito" no es un diferencial de QuintoAndar a copiar, es la LEY; el mercado lo resuelve con codeudor o estudio de aseguradora, y ahí está exactamente la fricción que Altorra digitaliza.

**Fase 1 (garantía con partner):**
- Integrar/revender el **seguro de arrendamiento** de una aseguradora/afianzadora local (Sura, El Libertador, Bolívar, afianzadoras — costo de mercado ~1 canon/año o ~5-8% mensual según producto) como capa de garantía, con **precio PÚBLICO en la web** (el mercado CO lo oculta todo) y vinculación digitalizada por Altorra (upload de docs → radicación → aprobación visible en checklist tipo Renter Checklist de Rightmove).
- Consulta a centrales (Datacrédito/TransUnion CO) solo al llegar a propuesta seria, como gasto por transacción cobrado al aplicante vía Wompi — condicionada al gate R3 de habeas data (autorización previa expresa, Ley 1266/2008 + 1581/2012) y a validar quién puede legalmente consultar.
- El certificado de pre-cualificación portable (patrón idealista 2025, invertido: el inquilino paga por ser creíble) compartible por WhatsApp — nativo del canal CO.
- Rol de Altorra frente al seguro: validar en R3 si opera como tomador por cuenta ajena, canal de comercialización o mero referenciador — la intermediación de seguros está regulada.

**Fase 2 (rail de pagos y repasse):**
- Inquilino paga UN cobro mensual vía **Wompi** (PSE fee bajo = análogo ACH gratis; tarjeta con fee trasladado al que la elige, patrón Zillow) → payout al propietario con desglose visible en su panel ("Entenda seu Repasse" criollo). Empezar con conciliación manual + panel de estado; automatizar con webhooks Wompi (skill ya en el cerebro).
- Recordatorios de pago por WhatsApp vía Cloud Function programada (free-tier).
- "Certificado de buen pagador Altorra" tras N pagos puntuales — valor real para el siguiente arriendo; validar en R3 que no constituya actividad de central de riesgo (Altorra no puede reportar comportamiento crediticio; el certificado debe ser una constancia privada de hechos, no un score).
- **Firma**: Ley 527/1999 valida firma electrónica simple — contrato PDF autogenerado + OTP WhatsApp/email + hash SHA-256 + timestamp en Firestore como trilla de evidencia; ZapSign (free-tier CO) si se quiere proveedor. Nivel exigible y valor probatorio → R3.

**Qué NO copiar**: absorber impago con caja propia (imposible free-tier e ilegal sin licencia), la nómina de vistoriadores (checklist propio basta a escala Cartagena), y el chat cerrado (WhatsApp es el canal; el dinero es lo que queda dentro de la plataforma).

**Secuencia con el resto del MVP**: el rail de pagos de corta estancia (booking Wompi) se construye PRIMERO y es el mismo músculo técnico que luego cobra cánones mensuales — Ola 2 hereda la infraestructura de la oportunidad #1 de R1.

---

## 4. SEO mundial que el mercado CO no usa

*Patrones de los referentes, con origen verificado.*

1. **Sitemaps segmentados por ESTADO del ciclo de vida del aviso** — Zillow (13 sitemaps: for-sale, pending, sold, off-market, buildings…), Redfin (57 por entidad y vertical), Rightmove (474 hijos geo-segmentados con changefreq=daily), Zoopla (10 por vertical). El ciclo de vida completo es superficie SEO: nada muere. → Altorra: sitemaps por operación + estado (nuevas/rebajadas/vendidas/alojamientos), regenerados por el CI existente.
2. **Push de indexación por EVENTO, no por crawl** — realtor.com (verificado en vivo): feeds RSS 2.0 separados para new/price-change/sold/open-house/new-rental, sharded por estado, con hub PubSubHubbub declarado = Google indexa el cambio en minutos. Redfin permite explícitamente su RSS de newest listings a bots. → Altorra: RSS de nuevos avisos + ping a Google desde GitHub Actions.
3. **Frescura EN el title tag** — realtor.com: "4666 Ackee Rd… [Updated 7/10]" + JSON-LD con datePosted/lastReviewed. Rightmove: titles del HPI con mes/año. Redfin: "2026 … as of June". → Añadir "[Actualizado D/M]" cuando cambie precio/estado; nadie en CO lo hace.
4. **Meta description como micro-ficha con datos vivos** — realtor.com ("View 72 photos… 4 bed, 3 bath… listed at $489,000. MLS #S5153331"), idealista (conteo dinámico + precio mínimo: "3.009 anuncios…, a partir de 10.300 euros"). El H1 con conteo vivo grita liquidez al SERP. → Plantillas con N fotos, alcobas, precio, barrio.
5. **robots.txt como decisión de NEGOCIO bot-por-bot** — Zillow (Allow quirúrgico solo de patrones canónicos terminados en $, anti crawl-trap de facetas), Rightmove (GPTBot solo a /mortgages: AEO selectivo), realtor.com (bloquea AI-training pero da Allow especial a social bots en fichas CON parámetro ?cid= para medir shares), Redfin (cero bloqueo a GPTBot/ClaudeBot — apertura AEO). → Altorra hace lo INVERSO de los que bloquean IA: permitir GPTBot/ClaudeBot/PerplexityBot explícitamente (su posición #1-2 en ChatGPT es un activo verificado) + Allow a social bots con ?cid= para medir WhatsApp.
6. **Taxonomía ubicación-primero + facetas semánticas indexables SOLO curadas** — Zillow (/{ciudad}/{tipo}/ → /{ciudad}/{feature}/), idealista (/venta-viviendas/{municipio}/{barrio}/ + prefijo /con-terraza/), Zoopla (mesh {tipo}×{lugar}×{beds}×{feature} con la regla de oro: solo generar la página si tiene inventario o contenido real). → /cartagena/{barrio}/{tipo}-{operacion}/ sobre las 13 landings existentes; noindex a querystrings. El anti-patrón está documentado en casa: las ~465 landings VACÍAS de Arenas (R1).
7. **URL de ficha con ID estable que sobrevive a todo** — Zillow ({slug}_{zpid}), realtor.com (M-xxxxx permanente, off-market muestra historial en vez de 404), idealista (/inmueble/{id} SIN slug — trade-off deliberado: el SEO de keywords lo cargan las landings, no las fichas). → /p/{id} ya existe; añadir slug legible y jamás borrar fichas: cambian de estado.
8. **Paginación path-based crawleable** — idealista (/pagina-2.htm, no query param), realtor.com (link directo a la última página en HTML crudo).
9. **JSON-LD compuesto server-rendered** — realtor.com verificado en vivo ([ViewAction + SingleFamilyResidence + Product/Offer + RealEstateListing] + BreadcrumbList), Zoopla por capas (SearchResultsPage+ItemList+Product en SERP, RealEstateListing en ficha). **Hallazgo contrarian**: idealista tiene CERO JSON-LD y Rightmove no lo mostró — ganan por arquitectura+autoridad, no por schema. Lección de doble filo: el schema no sustituye la arquitectura de URLs, PERO para un entrante sin autoridad que compite por AEO (Altorra) sigue siendo ventaja, y en CO está roto en TODOS los rivales (R1). [Zillow/Redfin JSON-LD: NO-VERIFICABLE por anti-bot.]
10. **Data programática propia como contenido inimitable + imán de backlinks** — Rightmove sold prices (open data Land Registry humanizada con fotos propias, 1.95M resultados solo Londres) y HPI mensual citado por toda la prensa UK; Redfin Data Center descargable; realtor.com research económico citado por medios. → Sin registro abierto CO: "Índice Altorra Cartagena" trimestral con data propia declarando la muestra + páginas /precios/{barrio} con asking prices e histórico propio.
11. **hreflang masivo con UI traducida sobre las MISMAS URLs** — idealista (16+ idiomas con prefijo /en/, /fr/ — solo interfaz traducida). Directamente relevante: el comprador USA/Europa de Cartagena. Nadie en CO lo hace.
12. **Editorial separado del sitemap transaccional + E-E-A-T de autores** — realtor.com (130 sitemaps de contenido, 111 shards ≈ >100k artículos, author-sitemap y news-sitemap), Rightmove (WordPress con sitemap propio). → Blog Altorra ya existe: sistematizar guías por intención + autores con perfil (dueño + asesores) + widget de conversión contextual por artículo.
13. **Prerender total como decisión de SEO** — Redfin construyó react-server (SSR streaming open-source) explícitamente "para impulsar tráfico orgánico". → Valida el patrón Altorra: HTML completo para bots vía SSG/prerender (mejor aún que SSR para free-tier); NUNCA fichas client-side-only.

---

## 5. Gates legales para R3 (features que exigen validación colombiana ANTES de diseñarse)

**Bloque A — Dinero y pagos (bloquean la oportunidad #1 del MVP):**
1. **Pago protegido / retención de fondos en corta estancia**: ¿puede Altorra retener el dinero del huésped hasta el check-in o debe estructurarse 100% dentro de Wompi (split payments/marketplace) para no configurar captación ilegal ni actividad de pagos vigilada? Definir el rol exacto (agente de cobro vs beneficiario) y su tratamiento tributario (RUT, facturación, IVA sobre comisión de servicio).
2. **Recaudo de cánones y payout al propietario (Ola 2)**: mismo análisis para pagos recurrentes de arriendo — mandato de administración, contrato de recaudo, y si administrar inmuebles exige **matrícula de arrendador** (Ley 820/2003 y normas municipales/departamentales) desde qué umbral.
3. **Estatuto del Consumidor en reservas online (Ley 1480/2011)**: derecho de retracto (5 días hábiles) y reversión de pagos (art. 51) aplicados a reservas turísticas pagadas online — impacta directamente el diseño de políticas de cancelación y del "pago protegido".

**Bloque B — Corta estancia / turismo:**
4. **RNT obligatorio**: confirmar la norma vigente exacta (Ley General de Turismo + decretos) y si la PLATAFORMA que procesa pagos está obligada a verificar el RNT antes de publicar (análogo español RD 1312/2024, donde procesar pagos SUBE las obligaciones). Diseño del badge "RNT verificado" condicionado a esto.
5. **Propiedad horizontal (Ley 675/2001)**: renta turística prohibida por reglamento en muchos edificios — ¿qué responsabilidad asume la plataforma al publicar un alojamiento en un edificio que la prohíbe? ¿Se exige declaración del propietario o verificación del reglamento?

**Bloque C — Arriendo digital sin codeudor (bloquean Fases 1-2 del modelo QuintoAndar criollo):**
6. **Garantía al propietario**: la absorción de riesgo de impago es actividad ASEGURADORA reservada (EOSF, vigilancia Superfinanciera) — Altorra no puede emitir garantías propias. Validar la estructura con aseguradora/afianzadora local y el rol permitido de Altorra (¿tomador por cuenta ajena? ¿canal de comercialización registrado? la intermediación de seguros está regulada).
7. **Consulta a centrales de riesgo**: Ley 1266/2008 (habeas data financiero) + Ley 1581/2012 — autorización previa expresa del inquilino, finalidad, quién está legitimado para consultar Datacrédito/TransUnion, y si el costo puede trasladarse al aplicante.
8. **Cobros al arrendatario**: la Ley 820/2003 restringe qué se le puede cobrar al arrendatario de vivienda urbana (y PROHÍBE depósitos) — validar la legalidad del fee de "estudio/verificación" pagado por el aplicante (patrón Zillow $35) y de la taxa de servicio mensual (patrón QuintoAndar) en vivienda vs comercial.
9. **"Certificado de buen pagador" Altorra**: emitir constancias de comportamiento de pago roza la actividad de central de información crediticia (regulada por Ley 1266) — definir el formato que NO constituya reporte crediticio (constancia privada de hechos, con autorización del titular, sin score).
10. **Firma electrónica de contratos de arriendo**: Ley 527/1999 + Decreto 2364/2012 — qué nivel (firma electrónica simple OTP+hash vs firma digital certificada) da valor probatorio suficiente para un contrato de arrendamiento y para el proceso de restitución; qué evidencias guardar (trilla en Firestore).

**Bloque D — Datos personales y contenido:**
11. **Tratamiento de datos del perfil de inquilino** (cédulas, extractos, cartas laborales en Storage): política de tratamiento Ley 1581/2012, registro de bases de datos (RNBD) si aplica por activos, retención, y seguridad exigible.
12. **Publicación de datos del inmueble/propietario** (CTL/matrícula usados para el sello "Verificado"): qué se puede mostrar públicamente vs solo verificar internamente.
13. **Reviews de inquilinos/propietarios/huéspedes**: responsabilidad de la plataforma por contenido de terceros + datos personales en reseñas; reglas de publicación post-transacción.
14. **Fotos y derechos**: uso de fotos aportadas por publicadores (licencia en T&C) y derechos de imagen en tours/videos.

**Bloque E — Modelo B2B (lado 3):**
15. **Fee de éxito sobre comisión de aliados**: naturaleza del contrato de referido, si el corretaje de Altorra + reparto con brokers exige formalidades (y si el aliado debe acreditar matrícula/idoneidad); facturación del success fee.

**Regla operativa para R3**: ningún feature del Bloque A-C se diseña en detalle antes de su gate; los del Bloque D-E se diseñan con placeholder legal (T&C + política de datos redactables en paralelo). Ejecutar con skill `legal-colombia` + marca de Decisión Fuerte (§G.2 🛰️: arquitectura de pagos y garantía = caras de revertir; considerar consejo externo antes de fijar el modelo de retención de fondos).

---

## 6. Fichas por referente (detalle verificado)

### 6.1 — Zillow (zillow.com)

**Panorama**: referente mundial. Marketplace inmobiliario #1 de EE.UU.: ~5.2M páginas indexadas, ~33M visitas orgánicas/mes (~80% del tráfico es orgánico), 104M viviendas con estimación de valor. Stack: Next.js+React con módulos federados sobre AWS/Kubernetes; backend Java/Node/Python(IA)/Go. Anti-bot agresivo (403 a fetch directo de home/SERP/ficha).

**Modelo de negocio**: audiencia gratuita masiva monetizada del lado profesional. FY2025 (10-K): $2.6B total (+16%). (1) Residential $1.7B: Premier Agent (share-of-voice por zona) + Flex (leads gratis, success fee 35-40% solo al cerrar, por invitación) + Listing Showcase (SaaS de media). (2) Rentals $630M (+39%, motor de crecimiento): multifamily paga CPL/CPC/CPC; Lease Connect cobra solo al firmar; landlords pequeños publican gratis + upgrade $39.99/90 días + $35 de aplicación que paga el inquilino. (3) Mortgages $199M. Patrón maestro: cada fricción de la transacción se convierte en producto que retiene a ambos lados.

**Features nivel-top**:
- **Zestimate (AVM neuronal)** — ADAPT. Red neuronal única (CNN + fully-connected) que reemplazó ~1.000 modelos locales; cubre las 104M viviendas del país (no solo listadas), usa registros públicos + fotos (detecta acabados de valor). *Verificación:* CORREGIDO — el error 6.9% citado es de 2021; vigente 2025-2026 es ~1.9% on-market / ~7.0-7.5% off-market, cobertura hoy >104M. Cómo adaptarla: sin MLS, AVM neuronal es inviable — construir "Rango Altorra" por comparables propios + "Rentímetro turístico" (nadie en CO lo tiene). Fuente: zillow.com/tech/building-the-neural-zestimate, deeplearning.ai/the-batch.
- **Aplicación portátil de inquilino + screening** — ADAPT. $35 una vez → aplicación única (Experian soft-pull + CIC) válida para ilimitadas propiedades por 30 días; gratis para el landlord. *Verificación:* CONFIRMADO, vigente sin cambios materiales. Cómo adaptarla: perfil de inquilino reutilizable en Firestore/Storage adjuntable con 1 clic a N solicitudes; verificación manual en vez de Datacrédito (no free-tier). Fuente: zillow.com/rental-manager/tenant-screening.
- **Pagos de renta online + autopay + credit building** — ADAPT. ACH gratis, débito $9.95, crédito 2.95% vía Stripe+Plaid; reporte a burós como incentivo de adopción. *Verificación:* CORREGIDO — el credit-building es OPT-IN y el tier gratis solo reporta a Experian (no "burós" plural); CreditClimb ($20/año, 3 burós) es de nov-2025; depósito real 3-5 días hábiles (7-10 el primero), no "≤5" siempre. Cómo adaptarla: Wompi PSE como análogo de ACH + "certificado de buen pagador Altorra" como sustituto del credit-building (validar en R3 que no sea reporte crediticio regulado). Fuente: zillow.zendesk.com.
- **Firma digital / leases e-sign** — ADAPT. Landlord genera/sube contrato, firma electrónica dentro del flujo, archivado junto al historial. Cómo adaptarla: Ley 527/1999 valida firma simple; PDF + OTP + hash SHA-256 en Firestore, sin proveedor certificado en fase 1. Fuente: zillow.com/rental-manager.
- **Premier Agent / Flex** — ADAPT. Flex: leads gratis, ruteados por conversión, success fee 35-40% de comisión SOLO al cierre. Cómo adaptarla: ES el modelo para el lado 3 de Altorra — leads gratis a brokers + fee de éxito pactado (20-30%) al cierre verificado, con contrato de referido firmado (mitiga cierre por-honor). Fuente: zillow.com/z/flex-performance-terms.
- **Listing Showcase / 3D Home + floor plan** — ADAPT. Captura ~45min con app gratis → tour 3D + plano interactivo con IA; +60% views, +72% shares medidos. Cómo adaptarla: visor Pannellum/Marzipano (JS libre) para tours propios, priorizado en corta estancia. Fuente: zillow.com/3d-home/faq.
- **Búsqueda por polígono dibujado + multi-área** — ADOPT. Draw hasta 5 áreas simultáneas, filtros apilables con URLs indexables. Cómo adaptarla: Leaflet + leaflet-draw + turf.booleanPointInPolygon client-side sobre inventario propio (cero backend). Fuente: zillow.com/news/new-draw-your-own-search-on-zillow-com.
- **Saved searches + alertas instantáneas** — ADOPT. Frecuencia elegible (instant/diaria/semanal); es la máquina de captura de emails. Cómo adaptarla: Cloud Function onCreate + colección savedSearches + email/WhatsApp; login solo al guardar, nunca para buscar. Fuente: zillow.zendesk.com/articles/213395508.
- **Páginas off-market + "claim your home"** — ADAPT. Página permanente por vivienda (aunque no esté en venta) con Zestimate/historial; el dueño la "reclama" y puede vender desde ahí. Cómo adaptarla: páginas permanentes de EDIFICIOS de Cartagena con CTA "¿tienes propiedad aquí?"; fichas nunca borradas, solo cambian de estado. Fuente: robots.txt zillow.com.
- **Verificación de identidad del landlord + antifraude** — ADOPT. Verificación de identidad para publicar/cobrar; chat/aplicación/pago dentro de la plataforma = salirse es la señal de alarma. Cómo adaptarla: verificación manual de cédula + CTL/predial → badge "Propietario verificado"; pago de reserva solo vía Wompi. Fuente: zillow.com/learn/how-to-spot-rental-scams.
- **Super-app del agente (Workspace)** — DISCARD como suite. Adquisiciones (~$500M ShowingTime, $400M Follow Up Boss) para poseer el workflow del agente. Rescatar solo un panel de aliado minimalista. Fuente: inman.com/2023/11/01.
- **Rentals como motor de ingresos (Lease Connect)** — ADAPT. Segmento que más crece (+39%, $630M); pay-per-lease solo al firmar. Cómo adaptarla: valida la escalera gratis→premium→success-fee de Altorra; instrumentar lead.source + timestamp desde el día 1. Fuente: zillow.com/multifamily-knowledge-center.

**Patrones SEO**: taxonomía ubicación-primero (/{ciudad}/{tipo}/ → /{feature}/); robots.txt quirúrgico (Allow solo patrones canónicos terminados en $); sitemaps segmentados por estado del listing (13 sitemaps: for-sale/pending/sold/off-market/...); URL de ficha con ID estable ({slug}_{zpid}); reglas específicas para bots IA (Allow selectivo a social bots con parámetro de tracking en tours 3D). NO verificado: JSON-LD real de fichas (403 anti-bot) — usar el estándar del vertical (RealEstateListing+SingleFamilyResidence+Offer) como spec.

**Lecciones UX**: buscador de una línea como hero; la estimación de valor crea hábito de "volver a mirar tu propia casa"; cobrar al lado con más urgencia (inquilino paga screening único); mantener todo dentro de la plataforma = "salirse" es la señal de fraude; floor plan/tour 3D es conversión medida, no decoración; polígono dibujado captura intención real mejor que filtros de barrio; login solo al guardar; pricing de éxito desbloquea oferta que la suscripción espanta; freemium generoso en publicación; páginas nunca mueren (estados visibles).

**Veredictos del verificador** (confiabilidad general: **alta**):
- Zestimate: **CORREGIDO** — cifras de 2021 desactualizadas; vigente 2025-26 ~1.9%/~7.0-7.5%, cobertura >104M.
- Aplicación portátil $35/30 días: **CONFIRMADO**, vigente sin cambios materiales (salvo ajustes estatales/locales puntuales).
- Pagos + credit building: **CORREGIDO** — reporte a burós es opt-in y solo Experian en tier gratis (CreditClimb $20/año, nov-2025, cubre 3 burós); depósito real 3-5 días hábiles, 7-10 el primero.

---

### 6.2 — Redfin (redfin.com)

**Panorama**: brokerage digital + portal de búsqueda #2 de EE.UU.; adquirido por Rocket Companies (jul-2025, $1.75B all-stock). redfin.com bloquea fetch directo (405/403) — lente código cubierta vía robots.txt + sitemaps + fuentes secundarias.

**Modelo de negocio**: brokerage de comisión reducida usado como motor de demanda: (1) listing fee 1.5-2% al vender (1% si también compras con Redfin en 365 días); (2) rebate "Sign & Save" 0.25-0.5% al comprador; (3) Partner Agent Program: leads no cubiertos se enrutan a agentes externos que pagan 30-35% de referral SOLO al cierre; (4) post-Rocket, el brokerage es loss leader para originar hipotecas + título + cierre; (5) licenció inventario multifamily a Zillow por $100M upfront (bajo escrutinio FTC sep-2025). Lección: el portal gratuito es adquisición; el dinero está en la transacción y adyacentes.

**Features nivel-top**:
- **Data transparente en ficha (historial de precios + DOM)** — ADOPT. Acceso MLS directo como brokerage; timeline completo de eventos del aviso. *Verificación:* CORREGIDO — la narrativa de "cruzado de la transparencia" está INVERTIDA en 2026: tras la alianza Rocket-Compass (feb-2026) y el lanzamiento de "Redfin Early Access" (may-2026), Redfin ya oculta DOM y price-drops en listings pre-mercado. Cómo adaptarla: subcolección `priceHistory` + badges de frescura, SIN replicar la opacidad selectiva que Redfin ya practica. Fuente: redfin.com/about/data-quality-on-redfin.
- **Frescura + alertas instantáneas** — ADOPT. 70% de listings nuevos indexados en <5 min; alertas email/push con frecuencia elegible. *Verificación:* CORREGIDO — el claim "3h más rápido que Zillow, 18h que Trulia" es un estudio de 2017, previo a que Zillow se volviera brokerage (2021); no citar como vigente. El "70% en <5 min" sí vigente. Cómo adaptarla: Cloud Function onCreate + matching contra savedSearches; publicar "te avisamos el mismo día". Fuente: redfin.com/news/dang_thats_fast.
- **Redfin Estimate (AVM)** — ADAPT. ML sobre 500+ datapoints; error mediano 1.86% on-market / 7.22% off-market, publicado con honestidad. *Verificación:* CONFIRMADO casi textual. Cómo adaptarla: "Rango Altorra" = mediana $/m² por sector + ajuste manual del asesor; página "¿Cuánto vale tu propiedad?" multi-step. Fuente: redfin.com/redfin-estimate.
- **Tours multi-modalidad (Book It Now, self-tour, video-chat)** — ADAPT. Botón de tour con selector fecha/hora; verificación de identidad obligatoria en 1er tour; self-tour solo en vacías con smart lock. Cómo adaptarla: adoptar "Agendar visita" con selector fecha/hora + videollamada WhatsApp agendada; DISCARD self-tour con smart locks. Fuente: redfin.com/news/redfin-book-it-now.
- **Verificación de identidad en el 1er tour** — ADAPT. Protege al vendedor/propiedad y filtra curiosos. Cómo adaptarla: verificación ligera en visitas presenciales; foto de documento antes de confirmar reserva de corta estancia. Fuente: support.redfin.com.
- **Redfin Direct (oferta sin agente, wizard con benchmarks)** — ADAPT. Wizard de 55 preguntas con datos agregados de ofertas previas del mercado. Cómo adaptarla: wizard multi-step para reservar corta estancia con Wompi; wizard de oferta/interés con contexto de mercado cuando haya volumen. Fuente: redfin.com/news/redfin-direct-unrepresented-buyers.
- **Partner Agent Program** — ADOPT. Leads no cubiertos enrutados a agentes externos, 30-35% de comisión SOLO al cerrar, cero costo upfront, estándares de servicio públicos. Cómo adaptarla: ES el blueprint del lado 3 de Altorra — pay-at-close + fee schedule publicado (diferenciador vs B2B opaco CO). Fuente: partneragents.redfin.com.
- **Sign & Save (incentivo temprano)** — ADAPT. 0.25-0.5% de vuelta al cliente que firma compromiso temprano. Cómo adaptarla: principio de incentivo condicionado PUBLICADO con números exactos (no el rebate en sí, que no aplica en CO). Fuente: investors.redfin.com.
- **Páginas programáticas de mercado (/housing-market)** — ADOPT. Matriz geografía×intención con data viva (mediana, DOM, Compete Score); 57 sitemaps. Cómo adaptarla: las 13 landings de sector evolucionan a mini-páginas de mercado con data real propia; Compete Score discard hasta tener volumen. Fuente: redfin.com/city/17151/CA/San-Francisco/housing-market.
- **Búsqueda por polígono + multi-área + guardar como alerta** — ADAPT. Draw + Save Search con el polígono como filtro. Cómo adaptarla: Fase 1 multi-selección de sectores; Fase 2 Leaflet+turf client-side. Fuente: support.redfin.com/articles/360025724771.
- **Stack SSR para SEO (react-server)** — ADOPT. Framework propio open-source, streaming, motivado explícitamente por SEO. Cómo adaptarla: valida el stack Astro SSG de Altorra (mejor aún que SSR para free-tier). Fuente: redfin.com/news/announcing-react-server.

**Patrones SEO**: 57 sitemaps segmentados por entidad/vertical (city/county/zip/neighborhood/school/agent_profiles/rentals); RSS de newest listings explícitamente permitido a bots; robots.txt quirúrgico (bloquea APIs internas, Allow explícito a lead magnets como /what-is-my-home-worth); cero bloqueo a GPTBot/ClaudeBot (apertura AEO deliberada); Data Center descargable como imán de backlinks. JSON-LD: NO VERIFICADO (anti-bot).

**Lecciones UX**: CTA primario es una ACCIÓN con horario, no un formulario; transparencia radical (DOM, price-drops, error del AVM publicado) ES el marketing; benchmarks de datos propios reducen ansiedad de decisión; velocidad de notificación es feature medible y comunicable; incentivos económicos PUBLICADOS con números exactos; regalar data agregada compra backlinks/AEO; verificar identidad ANTES del contacto físico destraba inventario.

**Veredictos del verificador** (confiabilidad general: **media**):
- Data transparente/DOM: **CORREGIDO** — narrativa de transparencia invertida en 2026 (Redfin Early Access/Compass ocultan DOM y price-drops en pre-market).
- Frescura/alertas: **CORREGIDO** — comparación "3h/18h más rápido" es estudio de 2017, desactualizado; "70% en 5min" sí vigente.
- Redfin Estimate: **CONFIRMADO** casi textual (1.86%/7.22%, 500+ datapoints, daily/weekly).

---

### 6.3 — realtor.com (Move Inc., News Corp)

**Panorama**: portal #2 de EE.UU.; posicionamiento = "el portal de los datos precisos y del agente profesional" (marca REALTOR® licenciada NAR). ~18M visitantes/mes.

**Modelo de negocio**: B2B2C puro — el consumidor nunca paga. (1) Suscripciones de leads por ZIP (Connections Plus, Market VIP...) vendidas 6-12 meses; (2) referidos success-fee (~30% del revenue en su pico): ReadyConnect Concierge cobra 30-38%(histórico)/20-40%(vigente post-nov-2024) de comisión SOLO al cierre; (3) media adyacente (hipotecas, seguros); (4) rentals: Avail (SaaS freemium) + screening pagado por el aplicante. Moat: licencias de datos de ~500+ MLSs.

**Features nivel-top**:
- **ReadyConnect Concierge (ex-Opcity)** — ADAPT. Call center llama al lead en minutos, lo califica en vivo, dispara alerta al primer agente que reclama (live-transfer); $0 upfront, fee al cierre. *Verificación:* CORREGIDO — fee vigente post-11/11/2024 es arriendos 20%, seller 40%, buyer 28-40% sobre comisión bruta (no el rango viejo 30-38%); el flujo de leads 2025 está flojo. Cómo adaptarla: ES el modelo para el lado 3 — sin call center, lead entra por WhatsApp, se califica con 3 preguntas, se enruta al aliado, fee pactado 10-25% al cierre. Fuente: support.therealbrokerage.com.
- **Connections Plus / Market VIP** — ADAPT. Suscripción por ZIP $200-$1000+/mes. *Verificación:* CORREGIDO — el lead no-exclusivo se comparte entre 3-5 agentes (no "hasta 2"); Market VIP se firma a nivel BROKERAGE, no agente individual. Cómo adaptarla: pool de brokers chico en Cartagena → "Destacado de barrio" vía Wompi recurrente en Ola 2-3, sin dark pattern de desviar el lead sin decirlo. Fuente: hooquest.com/leads/realtor-com.
- **Verificación de listados vía MLS + refresh 15 min** — ADAPT. Confianza por FUENTE (feeds MLS con agentes responsables), ID permanente M-xxxxx. *Verificación:* CONFIRMADO — mecanismo vigente; matiz: la ventaja de velocidad "vs Zillow 24-48h" ya no aplica (Zillow tiene feeds MLS directos desde 2021). Cómo adaptarla: sello "Verificado por Altorra" (visita/video + CTL + identidad) con fecha visible; /p/{id} nunca muere. Fuente: go-beyond-mls.com.
- **Contenido educativo industrial** — ADAPT. 130 sitemaps de contenido (111 shards ≈ >100k artículos), autores con E-E-A-T, research económico citado por medios. Cómo adaptarla: guías evergreen por intención + hyper-local con data real del inventario propio + autores con perfil. Fuente: realtor.com/sitemap_index.xml.
- **RealEstimate (AVM de 3 proveedores)** — ADAPT. Muestra 3 AVMs externos + promedio (2,4%/7,5% error); comunica honestidad al mostrar desacuerdo. Cómo adaptarla: "Rango Altorra" siempre como rango con metodología visible, no cifra única. Fuente: realestatewitch.com.
- **Datos de entorno y riesgo (First Street)** — ADAPT. 5 scores de riesgo climático 1-10 por parcela + FEMA flood zone. Cómo adaptarla: riesgo inundación/arroyos IDEAM/POT, distancia a playa, ruido nocturno, normativa turística — DISCARD proyecciones a 30 años. Fuente: realestatenews.com/2024/03/13.
- **Alertas + colaboración co-comprador (Realtor.com+)** — ADOPT. Saved search sincronizada + cuentas vinculadas comparten favoritos/comentarios privados. Cómo adaptarla: AltorraFavoritos + búsqueda guardada con FCM/email + favoritos compartidos con comentarios. Fuente: inman.com/2026/01/21.
- **Avail (suite para propietarios particulares)** — ADAPT. Flujo end-to-end: publicar → aplicación → screening TransUnion → contrato con firma electrónica → cobro online. Cómo adaptarla: playbook exacto del lado 2 — publicación gratuita generosa + plantilla de contrato + firma OTP+hash + cobro Wompi + scoring básico pagado por el aplicante. Fuente: avail.com.
- **RealChoice Selling / UpNest** — ADAPT. Advisor humano valida intención → 3-5 propuestas de agentes que compiten mostrando comisión y servicios. Cómo adaptarla: advisor humano por WhatsApp que valida CADA lead de venta + transparencia de propuesta (comisión y servicios publicados de antemano). Fuente: prnewswire.com/news-releases/realtorcom-acquires-upnest-301564136.html.
- **Directorio de agentes con reviews verificadas** — ADOPT. Reviews solo de transacción cerrada, separadas de "recomendaciones" abiertas; ranking por completitud. Cómo adaptarla: perfil público de aliado con reviews post-cierre verificado, escalera "gratis-lead-a-la-red / pago-lead-tuyo". Fuente: nar.realtor.
- **Tours 3D por sindicación (Matterport)** — ADAPT. El portal no produce media, solo renderiza el embed del agente. Cómo adaptarla: aceptar embeds estándar (YouTube/Kuula/Matterport) como campo `tour_url`, render lazy-facade. Fuente: matterport.com/industries/real-estate.
- **Búsqueda por mapa con polígonos** — ADAPT, NO VERIFICADO (bloqueo bot en SERP hidratada). Cómo adaptarla: polígonos de barrio curados valen más que dibujo libre en Cartagena; geohash + filtro client-side.
- **Stack anti-scraping + robots.txt selectivo** — ADAPT. Bloquea crawlers de AI-training pero permite social bots con `?cid=` en fichas para medir shares. Cómo adaptarla: Altorra hace lo inverso en AI (permitir GPTBot/ClaudeBot); sí copiar el Allow a social bots con tracking de campaña. Fuente: realtor.com/robots.txt (verificado en vivo).

**Patrones SEO**: frescura como señal explícita en title ("[Updated 7/10]") + JSON-LD con datePosted/lastReviewed; sitemaps por EVENTO (RSS 2.0 sharded con hub PubSubHubbub, indexación en minutos); meta description como micro-ficha con datos vivos (MLS# como señal de confianza); JSON-LD compuesto server-rendered ([ViewAction+SingleFamilyResidence+Product+RealEstateListing]+BreadcrumbList+Organization); URLs semánticas con ID permanente que nunca muere; sitemaps hyper-local (escuelas como entidades); 111 shards de contenido + author-sitemap.

**Lecciones UX**: frescura visible ataca la queja #1 CO; home organizada por intención (nav plana: /sell, /rentals, /landlords...); página de propiedad permanente; co-buyer linking mete al portal en la conversación de pareja; reviews solo de transacción cerrada; lead $0-upfront con fee al cierre elimina fricción B2B; humano en el loop multiplica conversión del lead más valioso; ficha como "expediente de decisión".

**Veredictos del verificador** (confiabilidad general: **media**):
- ReadyConnect Concierge: **CORREGIDO** — fee vigente post-nov-2024 es 20%/40%/28-40% (no 30-38%); flujo de leads 2025 reportado como flojo.
- Connections Plus/Market VIP: **CORREGIDO** — lead compartido entre 3-5 agentes (no 2); Market VIP a nivel brokerage $3.000-$10.000+/mes.
- Verificación MLS + refresh 15min: **CONFIRMADO** — mecanismo vigente; ventaja de velocidad vs Zillow ya no aplica (Zillow tiene feeds MLS desde 2021); Realtor.com+ lanzado ene-2026.

---

### 6.4 — idealista (idealista.com)

**Panorama**: líder de clasificados inmobiliarios en España (+Italia/Portugal), ~1.2M anuncios activos. Propiedad de Cinven. Referente mundial en búsqueda por polígono, alertas y monetización de clasificados puros (no interviene en la transacción).

**Modelo de negocio**: clasificados puros multicapa. (1) Particulares: 2 anuncios gratis, luego pago; upsells (subidón ~11,90€/24h, destacado ~46,90€/mes); (2) profesionales: suscripción obligatoria (agencias no pueden usar cuentas personales) desde ~60€/mes; (3) media: book 69,9€, tour 199€, video 299€; (4) idealista/tools: CRM SaaS para agencias; (5) idealista/data: B2B valoración masiva para bancos (ECO 805/2003); (6) hipotecas + Garantía de Inquilino (5,4% renta anual, pagada por el inquilino).

**Features nivel-top**:
- **Búsqueda por polígono dibujado + multizona** — ADAPT. Polígono codificado como polyline en URL (`shape=`), compartible/guardable. *Verificación:* CONFIRMADO con precisión — `shape` es query param sobre rutas `/areas/<operación>-<tipo>/`. Cómo adaptarla: Leaflet+draw+turf en cliente; serializar polígono en URL para búsqueda guardada. Fuente: idealista.com/news (2016).
- **Búsquedas guardadas + alertas (instantánea/digest/bajada de precio)** — ADOPT. Registro nuevo solo pide EMAIL. *Verificación:* CONFIRMADO — matiz: las bajadas de precio llegan principalmente en el digest diario, no como canal instantáneo separado. Cómo adaptarla: Cloud Function + savedSearches + email/digest diario; captura solo-email como patrón de conversión clave. Fuente: idealista.com/ayuda/articulos/how-to-subscribe-to-the-alerts-service.
- **AVM gratuito "Valora tu vivienda" + idealista/data B2B** — ADAPT. Rango mín/estimado/máx en ~1 min, error 8-12% urbano. *Verificación:* CONFIRMADO casi punto por punto. Cómo adaptarla: mediana €/m² por barrio propia + ajustes simples, siempre en rango; diferencial: rentabilidad turística por noche. Fuente: idealista.com/data/asesoramiento-inmobiliario-tecnologico/valoracion-automatica.
- **Perfil de anunciante profesional (frontera dura particular/profesional)** — ADOPT. Agencias no pueden publicar como particular; escaparate con inventario completo. Cómo adaptarla: `/aliado/{slug}` + campo `tipoAnunciante` + moderación desde el día 1. Fuente: inmocms.com.
- **Escalera de monetización de visibilidad** — ADAPT. Subidón ~11,90€/24h, destacado ~46,90€/mes con cupos; decay natural de los gratis. Cómo adaptarla: destacados incluidos por plan (cupo) + destacado suelto vía Wompi — activar en Ola 2, no MVP (vender ranking sin liquidez mata confianza). Fuente: idealista.com/en/propietarios/anuncio-destacado.
- **Pre-cualificación de inquilino + Garantía de Inquilino** — ADAPT. Inquilino se pre-califica online → certificado de renta máxima cubierta compartible; Garantía 5,4% renta anual paga el inquilino. Cómo adaptarla: "perfil de arrendatario" self-service + alianza con afianzadora local; certificado compartible por WhatsApp. Fuente: idealista.com/en/news/.../851980.
- **Firma digital + contratos de alquiler online** — ADAPT. Plantilla guiada o PDF propio → firma eIDAS, gratis para particulares. Cómo adaptarla: Ley 527/1999; hoja de visita/reserva como PDF + firma simple (ZapSign free-tier CO); para corta estancia priorizar el booking sobre la firma. Fuente: idealista.com/news/.../779387.
- **Media como producto (book/tour/video)** — ADAPT. Book 69,9€, tour 360 199€, video 299€; filtro "visita virtual" en SERP. Cómo adaptarla: pack foto+tour de pago a particulares/aliados (fotógrafo local) + filtro "con video/tour"; priorizar video corto vertical sobre tour 360. Fuente: idealista.com/particulares/visita-virtual.
- **idealista/tools (CRM SaaS con "cruces")** — ADAPT. Inbox unificado + matching automático demanda↔inventario + multipublicación. Cómo adaptarla: versión mínima en panel aliados — inbox por propiedad + estados + cruce simple demanda-inventario; NO construir CRM completo. Fuente: idealista.com/tools.
- **Número de registro turístico visible (RD 1312/2024)** — ADOPT. Badge de legalidad; excluidos quienes no procesan pagos. Cómo adaptarla: badge "RNT verificado" — Altorra al procesar pagos Wompi probablemente DEBE exigirlo → gate legal R3. Fuente: infobae.com/espana/2025/06/10.
- **Chat interno cerrado + anti-fraude** — DISCARD. Mensajería propia, educa a NO salir de la plataforma. Cómo adaptarla: en CO el canal es WhatsApp (gating es queja transversal R1); compensar con tracking clic-a-WhatsApp GA4 + badge Verificado/RNT. Fuente: idealista.com/news/foro.
- **Señales de frescura y transparencia** — ADOPT. "Anuncio actualizado hace 3 días" prominente. Cómo adaptarla: `updatedAt` humanizado + badge "verificado hace X"; ataca la queja #1 del mercado CO. Fuente: ficha archivada idealista (2024).

**Patrones SEO**: arquitectura URL jerárquica (/venta-viviendas/{municipio}/{barrio}/ + facetas /con-terraza/); ficha con URL mínima /inmueble/{id}/ sin slug (trade-off deliberado); H1/meta con conteo dinámico y precio mínimo; **hallazgo contrarian: CERO JSON-LD** en home/SERP/ficha — gana por arquitectura+autoridad, no schema (para Altorra el JSON-LD sigue siendo ventaja porque el mercado CO lo tiene roto); robots.txt bloquea todas las ordenaciones/combinaciones de filtros; hreflang masivo (16+ idiomas, misma URL, solo UI traducida); sitemap no declarado (404, descubrimiento por linking interno).

**Lecciones UX**: guardar búsqueda pide solo email; buscador de la home es UNA línea; frescura es UI de primera clase; decay de visibilidad gratis empuja el upsell; certificado de pre-cualificación se comparte por WhatsApp fuera del portal; cada herramienta gratuita captura un dato de intención distinto.

**Veredictos del verificador** (confiabilidad general: **alta**):
- Polígono dibujado + multizona: **CONFIRMADO** con precisiones (shape es query param sobre `/areas/`; toolkit exacto de dibujo no verificable).
- Búsquedas guardadas/alertas: **CONFIRMADO** — bajadas de precio van principalmente en el digest diario, no instantáneas.
- AVM "Valora tu vivienda" + idealista/data: **CONFIRMADO** casi punto por punto (matices en cifra exacta de error urbano 8-12% vs ±10% según fuente).

---

### 6.5 — Rightmove (rightmove.co.uk)

**Panorama**: portal #1 UK, FY25 revenue £425.1M (+9%). Modelo B2B2C puro.

**Modelo de negocio**: suscripción POR SUCURSAL + paquetes escalonados (base → Optimiser Edge → Ascend) + productos premium a la carta. ARPA 2025 = £1,530/mes (+6%), 62% del crecimiento vino de VENTA DE PRODUCTOS, no de subir precios. Áreas de crecimiento (Commercial + hipotecas + Rental Services) crecen ~25% CAGR, ya 7% del revenue. CERO FSBO: solo agentes registrados (Companies House + redress scheme) pueden publicar.

**Features nivel-top**:
- **Sold Prices públicos (/house-prices/{location}.html)** — ADAPT. Ingesta mensual de HM Land Registry + join con historial de listings propio; 1.95M resultados solo Londres. *Verificación:* CORREGIDO — Land Registry publica al 20º día HÁBIL de cada mes, no "el día 20". Cómo adaptarla: páginas /precios/{barrio} con asking prices históricos propios + avalúo catastral si es consultable. Fuente: rightmove.co.uk/house-prices/london.html.
- **Valoración instantánea (AVM) + Track my property** — ADAPT. Estimado con banda de confianza explícita; refresh cada 30 días; hasta 200 propiedades trackeadas. *Verificación:* CONFIRMADO en detalle (incluye equity tracker vigente, lanzado abr-may 2026). Cómo adaptarla: estimador de renta turística por zona + "avalúo orientativo" por m²/barrio con banda de confianza honesta. Fuente: rightmove.co.uk/house-value.html.
- **House Price Index mensual** — ADOPT. Índice de asking prices (~200k avisos/mes) citado por medios UK. *Verificación:* CONFIRMADO. Cómo adaptarla: "Índice Altorra Cartagena" trimestral con muestra declarada (30-50 avisos ya es honesto). Fuente: rightmove.co.uk/news/house-price-index.
- **Rightmove Plus (Best Price Guide, Market Share, Opportunity Manager)** — ADAPT. Panel B2B con reporte de comparables en vivo + benchmarking competitivo + IA que predice vendedores. Cómo adaptarla: dashboard mini de aliado (leads, views, comparativa anónima); DISCARD Opportunity Manager (requiere data de todo el mercado). Fuente: rmplus.rightmove.co.uk.
- **Trust model: solo profesionales regulados** — DISCARD como modelo (Altorra SÍ quiere particulares). Cómo adaptarla: ADOPTAR el principio en 2 capas — vetting de aliados B2B + sello "Verificado" opcional para particulares. Fuente: customerfaq.rightmove.co.uk.
- **Draw-a-search + saved searches + alertas** — ADAPT. Polígono guardado con nombre; frecuencia INSTANT/diaria/3d/semanal, incluyendo rebajados. Cómo adaptarla: alertas guardadas por barrio+filtros (fase 1), polígono geo-caro en Firestore como fase 2. Fuente: faq.rightmove.co.uk/articles/7000048757.
- **Lead to Keys — Rental Services integrado** — ADAPT. Lead enriquecido + referencing 1-clic + firma digital + move-in monies + Renter Checklist. Cómo adaptarla: formulario de arriendo que pre-captura ocupación/ingresos; checklist digital del proceso; depósito vía Wompi. Fuente: rentalservices.rightmove.co.uk.
- **SEO programático a escala (474 sitemaps)** — ADOPT. Sitemap index geo-segmentado, changefreq=daily; GPTBot con acceso selectivo solo a /mortgages/. Cómo adaptarla: sitemap segmentado por barrio vía CI existente; decisión consciente sobre AI bots (Altorra: PERMITIR, lo inverso de Rightmove). Fuente: rightmove.co.uk/robots.txt.
- **Contrato de datos uniforme con fallback "Ask agent"** — ADOPT. Esquema fijo de campos, vacío = "Ask agent" en vez de ocultar. Cómo adaptarla: esquema fijo CO (precio, admin, estrato, año, m², parqueadero) con fallback "Pregúntale al asesor" + deep-link WhatsApp. Fuente: rightmove.co.uk/properties/109460051.
- **Sold prices en el hero (3 buscadores)** — ADAPT. Buy/Rent/House Prices como buscadores paralelos. Cómo adaptarla: tercer tab "¿Cuánto renta tu propiedad por noches?" (más diferenciador que precios de venta). Fuente: rightmove.co.uk.

**Patrones SEO**: URLs semánticas estables (/properties/{id}, /property-for-sale/{Location}-{locId}.html, /house-prices/{location}.html); sitemap de 474 hijos por geografía; robots.txt como arma (bloquea facetas/scrapers, Allow selectivo a GPTBot solo /mortgages/); programmatic SEO sobre open data (Land Registry + fotos propias + interlinking geográfico); editorial separado en WordPress. JSON-LD no visible en fetches (no verificado si se inyecta client-side).

**Lecciones UX**: tres buscadores paralelos en el hero; fallback "Ask agent" en campos vacíos; alertas con frecuencia elegible + trigger de bajada; Track my property crea visita recurrente; banda de confianza honesta en el AVM; lead enriquecido en arriendos; checklist de proceso en tiempo real; badges de estado y media en SERP; B2B se gana con herramientas de captación, no solo visibilidad.

**Veredictos del verificador** (confiabilidad general: **alta**):
- Sold Prices: **CORREGIDO** — HM Land Registry publica al 20º día HÁBIL, no "el día 20" calendario.
- Valoración instantánea + Track my property: **CONFIRMADO** en detalle, incluido equity tracker vigente 2026.
- House Price Index: **CONFIRMADO** (metodología oficial verificada, ~200k avisos/mes, ~95% del mercado nuevo).

---

### 6.6 — Zoopla (zoopla.co.uk)

**Panorama**: portal #2 UK tras Rightmove, propiedad de Houseful Ltd (Silver Lake). Houseful opera Homes (Zoopla, Mojo), Software (Alto CRM), Data & Risk (Hometrack, ~50M valoraciones/año, usado por 18 de los 20 mayores lenders UK). Tesis: gana por DATA, no por inventario.

**Modelo de negocio**: B2B puro. (1) Suscripción mensual por oficina; (2) premium listings/featured agents; (3) leads cost-per-lead por postcode (Prospect Plus); (4) referidos que PAGAN al agente (Progression Portal: hipoteca hasta £400, conveyancing £100); (5) venta de data/AVM a bancos vía Hometrack; (6) white-label del AVM a agentes (Zoopla Valuation Tool). Particulares NO pueden publicar directo.

**Features nivel-top**:
- **Zoopla Estimate (AVM, motor Hometrack)** — ADAPT. Coeficientes por atributo aplicados a cada dirección del país; recalculado mensualmente; 80% dentro de ±10% del avalúo de perito. *Verificación:* CONFIRMADO en precisión (matiz: 18 de 20 lenders, no 13 de 15); CORREGIDO en presentación — el consumer SÍ muestra cifra puntual + rangos (el "solo rango sin cifra" es del producto B2B); "regresión hedónica" es NO-VERIFICABLE (Hometrack solo declara "ML"). Cómo adaptarla: "Estimador Altorra" = rango de $/m² por barrio+tipo desde histórico propio, siempre en rango + CTA WhatsApp. Fuente: help.zoopla.co.uk, hometrack.com.
- **My Home (reclama tu casa)** — ADOPT. Dashboard con valor/equity/demanda; 6M+ homeowners; 400k pasaron a vendedor en 2025. *Verificación:* CONFIRMADO ambas cifras. Cómo adaptarla: doc "Mi Propiedad" por usuario + email trimestral con comparables + medidor de demanda emulado con búsquedas/favoritos. Fuente: zoopla.co.uk/my-home.
- **SmartVal / Zoopla Valuation Tool (AVM white-label)** — ADOPT. Lead capturado ANTES de mostrar el resultado; rango sin cifra exacta. *Verificación:* CORREGIDO — el nombre "SmartVal" pertenecía a Boomin (portal quebrado en 2022); el producto real de Zoopla se llama "Zoopla Valuation Tool". Cómo adaptarla: widget multi-step "¿Cuánto vale tu propiedad?" en las 13 landings — contacto PRIMERO, resultado después. Fuente: thenegotiator.co.uk.
- **House Prices / datos de zona** — ADAPT. Jerarquía por área con 25 transacciones reales + drill-down por dirección (UPRN); páginas por dirección bloqueadas en robots.txt. Cómo adaptarla: "Datos de zona Cartagena" por barrio con $/m² propio + tarifa/noche y ocupación (Zoopla no tiene esto). Fuente: zoopla.co.uk/house-prices/london.
- **Draw-your-search + Travel time search** — ADAPT/DISCARD. Polígono a mano alzada guardable; isócronas de tiempo de viaje. Cómo adaptarla: draw-your-search ADOPT (Leaflet/turf gratis); travel time DISCARD (APIs cuestan, ciudad compacta). Fuente: zoopla.co.uk/for-sale/property/london.
- **Alertas guardadas (Create alert)** — ADOPT. Cualquier criterio + polígono guardable; badge "Reduced on" alimenta la alerta. Cómo adaptarla: doc de criterios en Firestore + Cloud Function programada cada 4h. Fuente: zoopla.co.uk/for-sale/property/london.
- **SEO programático: mesh {tipo}×{lugar}×{beds}×{feature}** — ADOPT. JSON-LD por capas (SearchResultsPage+ItemList+Product en SERP; RealEstateListing en ficha); robots.txt esculpe el crawl. Cómo adaptarla: patrón exacto para Astro SSG — regla de oro: solo generar la página si tiene inventario o contenido real (anti-Arenas). Fuente: zoopla.co.uk/robots.txt.
- **Suite B2B: Alto CRM + Prospect Plus + Progression Portal** — ADAPT. El agente COBRA por referir (conveyancing £100, hipoteca hasta £400). Cómo adaptarla: panel self-service con precios públicos + programa de referidos con notaría/banco compartiendo fee. DISCARD construir un CRM tipo Alto. Fuente: zoopla.co.uk/press/releases.
- **Modelo de confianza: agents-only + Material Information obligatoria** — ADAPT. Verificación delegada al vetting del agente; campos de transparencia obligatorios muestran "TBC/Ask agent". Cómo adaptarla: NO copiar agents-only (Altorra quiere particulares); sí el principio de campos obligatorios con "por confirmar" en vez de omitir. Fuente: business.zoopla.co.uk.
- **Calculadoras de affordability embebidas** — ADAPT. Hipoteca/stamp duty en la ficha junto al precio, con partner bancario. Cómo adaptarla: calculadora de crédito hipotecario CO + gastos notariales + la inversa turística ("se paga con N noches/mes"). Fuente: zoopla.co.uk/for-sale/details/73528593.

**Patrones SEO**: crawl sculpting agresivo (indexa /for-sale/, /to-rent/, /house-prices/; bloquea /search/, /property/ por dirección); mesh programático de long-tails con URL estable; JSON-LD por capas (roto en el 100% del mercado CO); 10 sitemaps por vertical; separación contenido/transacción (/guides/, /discover/, /house-prices/, /home-values/). Stack Next.js SSR — equivalente Altorra: Astro SSG con regla anti-Arenas.

**Lecciones UX**: mostrar RANGO nunca cifra exacta; el dueño de casa es usuario de primera clase; badge "Reduced on {fecha}" visible; lo que falta se declara ("TBC"), no se oculta; herramientas de poder como botones de primer nivel en la SERP; calculadoras embebidas en el punto de decisión; educar al vendedor con data (medidor de demanda) en vez de discurso.

**Veredictos del verificador** (confiabilidad general: **media**):
- Precisión AVM Hometrack (80%/±10%): **CONFIRMADO** (matiz: 18 de 20 lenders, cifra auto-publicada).
- Recalculo mensual: **CONFIRMADO**.
- Rango vs cifra exacta en el consumer: **CORREGIDO** — el sitio consumer SÍ muestra cifra puntual + rangos; "solo rango" es del producto B2B (Zoopla Valuation Tool).
- Metodología "regresión hedónica": **NO-VERIFICABLE** — ninguna fuente pública lo confirma; Hometrack solo declara "ML"/"modelado estadístico sofisticado".
- Fuentes de datos del modelo: **CORREGIDO** — se omiten EPCs/Ordnance Survey/Royal Mail; "valoraciones hipotecarias" no está listada como insumo del modelo consumer.
- My Home (6M+ usuarios, 400k homeowner→seller 2025): **CONFIRMADO** ambas cifras.
- SmartVal: **CORREGIDO** — nombre erróneo (era de Boomin, quebrado 2022); el producto real es "Zoopla Valuation Tool", mecánica sí coincide.

---

### 6.7 — QuintoAndar (quintoandar.com.br)

**Panorama**: Brasil. Marketplace de arriendo residencial digital end-to-end + compra/venta. Referente mundial del "arriendo sin fiador". Escala: 65.430 listings solo en São Paulo, mapas en 75 ciudades, 62 sitemaps hijos.

**Modelo de negocio**: owner-pays con management recurrente. (1) Corretagem = 1 mes de arriendo, pagada por el PROPIETARIO; (2) taxa de administração hasta 9,3% mensual (mín. R$160) — fondea la garantía; (3) inquilino paga taxa de serviço (~2,6%) + seguro incendio (R$51); (4) cross-sell financiero; (5) corretores freelance pagados por evento. Riesgo de impago absorbido por volumen + póliza Fairfax Brasil (SUSEP FIP 04669). Ver §3 para el detalle completo del modelo.

**Features nivel-top** (ver también §3 para el desglose extendido de scoring/garantía/firma/pagos):
- **Arriendo sin fiador — scoring digital** — ADAPT. Renta ≥2,5×, suma hasta 4 personas, big data+regresión+IA. *Verificación:* CORREGIDO — el 2,5× incluye también el seguro de incendio; las 4 personas quedan TODAS como responsables legales. Fuente: quintoandar.com.br/guias/como-alugar/aluguel-sem-fiador.
- **Garantía al propietario (Pagamento Garantido)** — ADAPT SIN balance propio. Paga el día 12 aunque no le paguen; daños hasta R$50k; póliza Fairfax/SUSEP. *Verificación:* CORREGIDO — 9,3% es techo con piso R$160, vigente desde jun-2024; aplica solo a plan de administración QuintoAndar. Fuente: sobre.quintoandar.com.br/garantia.
- **Firma digital end-to-end** — ADAPT. DocuSign mismo día, 4 niveles de autenticación. *Verificación:* CONFIRMADO con matices aditivos (plazo 72h, almacenamiento 5 años). Fuente: quintoandar.com.br/guias/.../assinatura-eletronica-quintoandar.
- **Pagos por plataforma + repasse transparente** — ADOPT. Un boleto mensual, repasse al dueño día 12 con desglose ("Entenda seu Repasse"). Cómo adaptarla: rol exacto de Wompi en el stack — pago recurrente → payout con desglose visible. Fuente: mkt.quintoandar.com.br/entenda-seu-repasse.
- **QPreço (AVM de arriendo y venta)** — ADAPT. Cruza listings propios + transacciones públicas; rango + comparables + insights de demanda. Cómo adaptarla: ya en roadmap Ola 2 — promedio por barrio desde Firestore + rangos manuales mensuales, vendido como "referencia de mercado" no AVM de precisión. Fuente: quintoandar.com.br/ajuda/artigo/qpreco.
- **Visitas agendadas self-service + red de corretores freelance** — ADAPT. Agendamiento self-service; corretores pagados por evento; tabla de referidos pública. Cómo adaptarla: calendario de slots en Firestore + confirmación WhatsApp; tabla de referidos criolla como programa de captación. Fuente: quintoandar.com.br/ajuda/artigo/tudo-que-voce-precisa-saber-sobre-visitas.
- **Transparencia de costo total en card y ficha** — ADOPT. Dos precios ("R$3.700 aluguel / R$3.941 total"). Cómo adaptarla: canon+admin=total en cards; corta estancia noche+aseo+servicio=total. Fuente: SERP/ficha real verificada en render.
- **Alertas "Farejar imóvel" multicanal** — ADAPT. Alertas por WhatsApp, email o push. Cómo adaptarla: savedSearches + Cloud Function programada → email + link wa.me; WhatsApp API de pago pospuesta. Fuente: quintoandar.com.br/guias/manual-imobiliario.
- **SEO programático multinivel industrial** — ADAPT. 62 sitemaps hijos por tipo de página, granularidad hasta CALLE y EDIFICIO/condominio; H1 con inventario vivo. Cómo adaptarla: Astro SSG con páginas por barrio + por edificio (Cartagena es ciudad de torres con nombre propio), todas con contenido real. Fuente: quintoandar.com.br/sitemap-v2.xml.
- **Ficha de detalle con escalera de conversión** — ADOPT. Tres CTAs en escalera de compromiso (Agendar visita → Fazer proposta → Fazer avaliação); breadcrumbs hasta nivel calle. Cómo adaptarla: escalera Agendar visita → Reservar/Ofertar → WhatsApp directo sin gating. Fuente: ficha real quintoandar.com.br/imovel/892786114.
- **Búsqueda con IA generativa (texto/voz + visión sobre fotos)** — DISCARD para MVP. Costo de inferencia incompatible con free-tier y <500 listings. Fuente: startupi.com.br.
- **Media/imágenes: CDN con transformaciones dinámicas** — ADOPT. 40+ fotos por listing, CDN con transforms WebP. Cómo adaptarla: adoptar el estándar de cantidad (20-40 fotos en turística); skill image-pipeline ya cubre la doctrina. Fuente: cozy-assets.quintoandar.com.br.
- **Portal de propietario separado (self-service)** — ADAPT. Subdominio propio con calculadoras, tarifas, demostrativo de repasse. Cómo adaptarla: área /propietarios dentro del mismo sitio Astro (sin subdominio). Fuente: proprietario.quintoandar.com.br.

**Patrones SEO**: sitemap índice → 62 hijos particionados por TIPO de página (listings, búsquedas ciudad×barrio×calle×tipo, condominios, guías, POIs); URL con slug descriptivo DESPUÉS del id; H1 con inventario vivo; malla interna (footer + breadcrumbs a nivel calle + similares ×2 + FAQ en SERP); robots.txt quirúrgico que además PODA experimentos programáticos fallidos (50+ categorías POI viejas bloqueadas — lección: retirar vía robots, no dejar pudrir). JSON-LD: NO VERIFICADO (render markdown no expone `<script>`).

**Lecciones UX**: escalera de compromiso en la ficha (nunca un solo "contáctenos"); doble precio siempre visible; mensaje "Sem fiador. Sem depósito. Sem filas." como hero (vender lo que el usuario NO sufrirá); el lado oferta es un producto completo; tags de frescura en cards; alertas multicanal con WhatsApp; vistoria con informe fotográfico comentable da credibilidad a cualquier garantía; POIs concretos en vez de mapa genérico; scoring inclusivo con la informalidad laboral (hasta 4 personas).

**Veredictos del verificador** (confiabilidad general: **alta**):
- Scoring (2,5×, hasta 4 personas): **CORREGIDO** — el 2,5× incluye seguro-incêndio además de arriendo+condominio+IPTU; las 4 personas son TODAS responsables legales.
- Pagamento Garantido (día 12, daños hasta R$50k, Fairfax/SUSEP, 9,3%, R$200M+ pagados): **CORREGIDO** — 9,3% es techo con piso R$160 (vigente desde jun-2024, contratos previos tienen tasas distintas); aplica solo al plan de administración QuintoAndar; ventana de comentarios de vistoria con fuentes oficiales contradictorias (5 vs 15 días).
- Firma digital DocuSign: **CONFIRMADO**, con matices aditivos (72h plazo, almacenamiento 5 años, activo solo con todas las firmas).

---

### 6.8 — Fotocasa (fotocasa.es)

**Panorama**: 2º portal inmobiliario de España (Adevinta Spain), rival directo de idealista. Ecosistema multi-dominio: fotocasa.es + pro.fotocasa.es + hipotecas.fotocasa.es (CaixaBank) + research.fotocasa.es + datavenues.com + blog en carpeta. Sindica inventario en Fotocasa + habitaclia + Milanuncios.

**Modelo de negocio**: 3 capas. (1) B2B suscripción (packs Pro Start/Basic/Premium, precios NO públicos — B2B semi-opaco igual que CO); (2) C2C freemium + pay-per-boost (2 gratis/categoría, boosts €29,95-€119,95); (3) servicios adyacentes por lead-gen (hipotecas CaixaBank, seguro de impago Grupo Mutua, seguros hogar, CRM). El AVM gratuito alimenta la capa 1: vendedor tasado → lead vendido/derivado a agencias suscritas.

**Features nivel-top**:
- **Índice de precios Fotocasa** — ADAPT. Precio medio €/m² mensual desde 2005, solo pisos/áticos, granularidad hasta calle; citado por Banco de España. *Verificación:* CONFIRMADO (matiz: serie de alquiler arranca dic-2006, no ene-2005 como la de venta). Cómo adaptarla: "Índice Altorra Cartagena" mensual desde Firestore + páginas /precios/cartagena/{barrio}/. Fuente: fotocasa.es/indice-precio-vivienda.
- **AVM — Tasación online gratuita** — ADAPT. Resultado SIN gate de email/teléfono; monetización después vía CTAs. *Verificación:* CONFIRMADO. Cómo adaptarla: estimador por barrio + renta larga Y turística por noche, sin gating, CTA doble "Publícalo gratis"/"Véndelo con un aliado". Fuente: fotocasa.es/en/tasacion-online.
- **Freemium C2C + boost pay-per-visibility** — ADOPT. 2 gratis/categoría, venta 365d/alquiler 180d, renovación 1-clic; boosts €29,95(7d)/€119,95(30d). *Verificación:* CONFIRMADO (catálogo de pago más amplio: destacado ~€24,95, ocultar dirección €9,95). Cómo adaptarla: gratis generoso + caducidad con renovación 1-clic + boost cobrado por Wompi (~$30.000-$120.000 COP). Fuente: ayuda.fotocasa.es/articles/8264613982226.
- **Seguro de impago de alquiler + scoring digital** — ADAPT. Producto white-label de aseguradora; scoring con 4 datos en ~2 min. Cómo adaptarla: canal de leads con comisión de colocación hacia afianzadoras CO (El Libertador, Bolívar); scoring propio DISCARD (requiere burós no free-tier). Fuente: fotocasa.es/seguro-impago.
- **DataVenues + "captación de particulares" (B2B)** — ADAPT. SaaS que cruza datos con catastro/AEAT/INE; agencias ven contacto de FSBO para captarlos. Cómo adaptarla: versión ética — cola OPT-IN de "particulares que quieren asesoría"; DISCARD venta de contactos sin consentimiento (viola Ley 1581/2012). Fuente: datavenues.com.
- **Búsqueda en mapa: "Dibuja tu zona" + capa de calor** — ADAPT. Polígono con el dedo + heat-map de €/m². Cómo adaptarla: Leaflet+turf client-side + polígonos de barrio pre-dibujados coloreados por precio del índice Altorra. Fuente: prensa.fotocasa.es.
- **Alertas guardadas + conversión de lead en suscriptor** — ADOPT. Checkbox "Quiero recibir alertas" DENTRO del formulario de contacto de cada ficha; selector de motivo pre-cualifica el lead. Cómo adaptarla: saved_searches en Firestore + GitHub Actions cada 4h; copiar checkbox + selector de motivo en el flujo WhatsApp-first. Fuente: fotocasa.es/user/alerts.
- **Ficha: transparencia radical + calculadora financiera embebida** — ADOPT. Honorarios explícitos, simulador de hipoteca inline, "Sello de calidad"; debilidad: CERO datos de zona en la ficha. Cómo adaptarla: comisiones públicas + simulador crédito CO + SUPERAR a fotocasa incluyendo precio medio de barrio en la ficha (algo que fotocasa no hace). Fuente: ficha real fotocasa.es/es/comprar/vivienda/cartagena.
- **Gramática de URLs + disciplina de crawl** — ADOPT. Atributos del inmueble en el slug de la ficha; robots.txt bloquea todo parámetro duplicador; H1 con conteo vivo. Cómo adaptarla: Astro SSG con slugs de atributos + robots bloqueando ?orden=/?precio=; sin JSON-LD detectado en fotocasa = hueco que Altorra puede superar. Fuente: fotocasa.es/robots.txt.
- **Índice de Negociación (gap oferta vs demanda)** — DISCARD. Requiere volumen de señal de demanda que un portal greenfield no tiene. Fuente: blogprofesional.fotocasa.es.
- **Tours 3D / media enriquecida (B2B) — firma digital ausente** — ADAPT. Tours 3D ya commodity en todos los packs Pro; firma digital NO encontrada como producto core. Cómo adaptarla: fotos 360 + video vertical en fichas destacadas/turísticas; firma digital DISCARD en MVP. Fuente: pro.fotocasa.es/soluciones-packs.

**Patrones SEO**: URL = keyword (atributos del inmueble como slug de ficha); disciplina de crawl budget (Disallow de todo parámetro duplicador + 30+ scrapers bloqueados); árbol programático de datos paralelo al de anuncios (/indice-precio-vivienda/); H1 con conteo vivo; interlinking masivo (80+ enlaces/SERP + breadcrumb de 4 niveles); blog en carpeta (no subdominio) concentra autoridad; **hueco del referente: sin JSON-LD detectado** en home/SERP/ficha — terreno donde Altorra puede superar tanto a fotocasa como al mercado CO.

**Lecciones UX**: checkbox de alertas dentro del formulario de contacto = adquisición a costo cero; selector de motivo pre-cualifica el lead; home como hub de 4 herramientas-embudo; AVM sin gate de email/teléfono maximiza completions; precio traducido a cuota mensual cambia el frame mental; transparencia radical de honorarios; caducidad con renovación 1-clic mata avisos zombis; "Dibuja tu zona" + heat-map como buscador principal; debilidad aprovechable: la ficha no cruza su propio índice con el dato de zona — Altorra sí puede cerrar ese loop.

**Veredictos del verificador** (confiabilidad general: **alta**):
- Índice de precios: **CONFIRMADO** (matiz: serie de alquiler arranca dic-2006, no ene-2005).
- AVM/tasación online: **CONFIRMADO** (incluye % de fiabilidad del dato, dato adicional no capturado en el claim original).
- Freemium C2C + boosts: **CONFIRMADO** en precios exactos (€29,95/€119,95 IVA incl.); catálogo de pago más amplio de lo descrito (destacado ~€24,95, ocultar dirección €9,95, subir posiciones €9,95).

---

*Fin del documento. Ver crudo íntegro (investigación completa por portal + fuentes exhaustivas + los 17 logs de agentes del workflow) en `../brain-private/altorrainmobiliaria/research-archive/2026-07-10-r2-referentes-mundo-crudo.txt`.*
