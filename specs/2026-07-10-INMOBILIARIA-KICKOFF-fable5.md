# 🏛️ KICKOFF ALTORRA INMOBILIARIA — paquete de arranque (Fable 5, 2026-07-10)

> **SSoT de la misión "el mejor portal inmobiliario" (altorrainmobiliaria.co).** Producido en el chat
> de cars (ADR §302 cars) por mandato del dueño: cars EN PAUSA; inmobiliaria = prioridad #1 y NUEVO
> LÍDER del cerebro ×4. El chat de inmobiliaria lee este archivo PRIMERO **junto con el mandato
> VERBATIM del dueño** (`2026-07-10-INMOBILIARIA-MANDATO-DUENO-verbatim.md`, mismo directorio — este
> kickoff es la síntesis operativa; el verbatim es la FUENTE) y copia ambos a su repo como specs madre.
> División de modelos: **Fable 5 = investigación/planificación/auditoría · Opus 4.8 = implementación**
> (tag por commit; protocolo Fable-audita-Opus = cars §300 aplica ×4).
>
> ⛔ **REGLA INNEGOCIABLE (corrección del dueño, mismo día): DESDE CERO ABSOLUTO.** Del sitio actual
> NO le gusta NADA (diseño anticuado/genérico, fue su primera web): **cero reutilización de código,
> diseño o arquitectura del sitio viejo** — greenfield total, infraestructura excelente, todo bien
> pensado de inicio a fin, "no empezar desde la basura". Lo ÚNICO que se cosecha del viejo: DATOS
> reales (propiedades/usuarios), historial SEO (URLs viejas → mapa de redirects 301), documentos
> legales/operativos y el APRENDIZAJE del cerebro. Las 8 CFs y el código viejo sirven solo como
> REFERENCIA de lectura (qué lógica existía), jamás como base.

---

## §1 · Identidad LEGAL (validada contra documentos reales, 2026-07-10)

Fuente: `C:\Users\romad\Downloads\ALTORRA Company (Legal)\RUT y Cámara de Comercio\` (leída con pdftotext).

- **Razón social**: **ALTORRA COMPANY S.A.S** · **NIT 902063965-4** · domicilio Cartagena, Bolívar.
- **Matrícula mercantil** 10011978 (06-may-2026, Cámara de Comercio de Cartagena) · Grupo NIIF III (microempresa).
- **Pequeña Empresa Joven (Ley 1780/2016)** ✅ certificada → beneficios de matrícula/renovación que hay que aprovechar (verificar alcance vigente con contador).
- **Objeto social** (prioritario): administración, compra, venta, **arrendamiento, corretaje y avalúos de bienes raíces** + marketing propio; también vehículos (línea cars), contabilidad/asesoría y marketing para terceros. → **UNA sola persona jurídica, dos líneas de negocio** (inmobiliaria + cars). El portal es de la línea inmobiliaria; la marca sombrilla legal es ALTORRA COMPANY S.A.S.
- Contacto registral: `altorracompanysas@gmail.com` · 3235016747 · Manzana E Lote 6, Santa Lucía, Cartagena.
- Capital: autorizado $50M / suscrito y pagado $1M.
- ⚠️ **GATE LEGAL — Matrícula de Arrendador (Ley 820/2003 art. 28 + D. 051/2004 + decretos distritales)**: la solicitud (EXT-AMC-26-0060455) recibió **OBSERVACIONES** de la Alcaldía (oficio AMC-OFI-0074376-2026, 25-may): ALTORRA opera como "inmobiliaria digital" sin establecimiento físico. **Estado actual = A VERIFICAR con el dueño** (¿se subsanó?). Sin matrícula NO se debe ejercer arrendamiento/intermediación de vivienda urbana formalmente → es requisito del negocio de arriendos, y además un SELLO de confianza para el portal ("matrícula de arrendador Nº X" en el footer = ventaja competitiva alineada al eslogan). Skill `legal-colombia` + gate de abogado para todo texto legal público.
- Otros docs en la carpeta: RUT ×2, certificado de matrícula, Cámara actualizada 09-06, Estatutos, Representante Legal (Daniel de Jesús Romero Martínez, según oficio) — inventariados, no leídos a fondo (fase R2).

## §2 · Identidad de MARCA v1 (dada por el dueño; mejorable en fase R4)

- **Eslogan**: **Seguridad · Legalidad · Confianza**.
- **Quiénes somos**: inmobiliaria con sede en Cartagena de Indias D.T. y C., cobertura local. Compra/venta de inmuebles, avalúos comerciales, administración y arriendo, asesoría legal y turismo inmobiliario. Servicio integral; socio estratégico que protege y potencia la inversión.
- **Misión**: transformar decisiones inmobiliarias en experiencias seguras y rentables; acompañamiento integral y cercano (compra, venta, administración, arriendo, avalúos, asesoría legal); ética, excelencia, servicio humano y transparente.
- **Visión**: inmobiliaria líder en la región Caribe con proyección nacional; innovación, calidad, cumplimiento riguroso; la opción preferida en soluciones inmobiliarias seguras y respaldadas legalmente.
- **Valores**: Transparencia · Compromiso · Confianza · Innovación · Excelencia.
- Nota del dueño: texto viejo, mejorable — la fase R4 (marketing/copy) lo refina SIN perder la esencia; "ALTORRA S.A.S." en el texto viejo → corregir a la razón social real donde aplique legalmente (footer legal exige la razón social exacta + NIT).
- Branding existente: logos/artes en `…\ALTORRA Inmobiliaria\Branding y Membretes\` (PNG logo + piezas "Seguridad Legalidad Confianza").

## §3 · Modelo de negocio del portal (visión del dueño, 2026-07-10)

**Líneas principales** (foco):
1. **Venta de inmuebles** (captados por ALTORRA).
2. **Administración de inmuebles** (contratos reales ya operando — ver §4 activos).
3. **Arriendo tradicional / larga estancia**.
4. **Arriendo de corta estancia** (turístico — Cartagena; ojo regulación específica: RNT, Ley 2068, normas de PH).

**Secundaria/futura**: turismo inmobiliario / tours (gancho; sin convenios aún — se integra al plan más adelante, NO en el MVP).

**El portal NO es solo vitrina propia** — es plataforma de 3 lados:
- **B2C listado propio**: inmuebles captados por ALTORRA (venta/arriendo).
- **Marketplace por SUSCRIPCIÓN (self-service)**: "Véndelo tú mismo / Arriéndalo tú mismo / Nosotros lo hacemos por ti" — propietarios pagan suscripción para publicar y gestionar; upsell al servicio full de ALTORRA. (Modelo de monetización = suscripciones/planes → Wompi.)
- **Portal de ALIADOS/BROKERS**: gestión de sus propiedades y clientes en un solo lugar — seguimiento de prospectos, citas/visitas/tareas, reporte y control de equipo en tiempo real. (El CRM de cars + doctrina de panel `43-UX` de cars son la base; vertical real-estate de la skill `crm-architect` ya existe.)
- **Panel admin ALTORRA**: inventario + CRM + automatización de tareas repetitivas del sector, superior al de cars y diseñado para inmobiliaria.

**Competencia declarada (superar, no imitar)**: ciencuadras.com · metrocuadrado.com · fincaraiz.com.co · coninsa.co · araujoysegovia.com · arenasinmobiliaria.co (+ las que la investigación encuentre). Referentes mundiales a estudiar: Zillow/Redfin/Realtor (US), Idealista/Fotocasa (ES), Rightmove/Zoopla (UK), QuintoAndar (BR — modelo de arriendo digital SIN codeudor, MUY relevante), Airbnb/Booking (corta estancia), Properati/Mercado Libre Inmuebles (LatAm).

## §4 · Activos EXISTENTES (no partir de cero ciego — verificado 2026-07-10)

1. **Repo `altorrainmobiliaria.github.io`** (dominio live `altorrainmobiliaria.co`): técnicamente tiene catálogo Firestore (5 propiedades), admin SPA, 8 Cloud Functions, SEO (13 landings, 43 BreadcrumbList, 130+ JSON-LD, blog) — pero **el dueño lo declaró BASURA de diseño/producto (su primera web) → NADA de esto se reutiliza como base** (regla innegociable ↑). **COSECHA permitida, únicamente**: (a) los DATOS reales (las 5 propiedades, usuarios/solicitudes si existen) migrados al modelo nuevo; (b) el inventario de URLs indexadas → **mapa de redirects 301** al sitio nuevo (no quemar el poco SEO ganado); (c) el análisis de competidores del PR #79 como insumo de R1; (d) lectura de referencia de la lógica vieja SOLO para no olvidar requisitos. Deploy actual lo ejecuta el DUEÑO (→ renegociar en el nuevo chat: en cars delegó todo el git+deploy a Claude — replicar ese modelo).
2. **Cerebro inmobiliaria** instalado 2026-06-09 (kernel canónico + manifest + githooks + lóbulo `41-MERCADO` con análisis de competidores). Joven (7 lecciones), con `_legacy/AVANCES.md` (3420 líneas de historia destilable). Payload de sinapsis PENDIENTE: `~/.claude/skills/sinapsis-cerebros/references/import-inmobiliaria-2026-07-10.md` (5 lecciones Firebase/dinero listas para pegar).
3. **Documentos maestros del dueño** (`C:\Users\romad\Downloads\ALTORRA Company (Legal)\`): ALTORRA_Sistema_Operativo_Integral (v1 y v2) · Protocolo Maestro v2 · Configuración WA + Biblioteca de Scripts v4 · Capacitación PROTOCOLO DE ATENCIÓN DE LEADS (PDF/PPTX) · **DOCUMENTOS FALTANTES** (lista curada: contrato de intermediación, ficha técnica, autorización de comercialización, ACM, calificación BANT, promesa de compraventa, seguimiento post-visita D0-D8, docs de arrendamiento…) · contratos REALES de administración y arrendamiento + otrosíes · fichas técnicas/inventarios Excel · cotizaciones · evidencias. **`all_docx_content.txt` (690KB) = todos los docx ya parseados a texto** — mina de oro para R2/R3. El dueño advierte: incompletos y sin validar → la investigación los AUDITA, no los asume.
4. **Cerebro compartido ×4**: skills globales (auditoria-financiera · caza-bugs §2b · comite-expertos · sinapsis-cerebros · proceso-decision-fuerte · crm-architect con vertical real-estate · **HUB de visibilidad completo: ssg-static-prerender/semantic-schema-aeo/ga4-lead-tracking/maps-gbp-local/search-console/product-feeds/image-pipeline — con vertical RealEstateAgent vía tenant_config** · optimizacion-rendimiento-web · wompi-colombia-api-v1 · legal-colombia · opus-interino-protocolo) + W-11 flujo fuerte + doctrina de panel (cars `43-UX §Doctrina-panel`) + lecciones CRM de cars (L-26..L-34, dataScope, RBAC 82 flags, supresión Ley 1581).

## §5 · Programa de INVESTIGACIÓN (Fable 5 lo ejecuta en el chat nuevo; deep-research + workflows acotados)

> Regla: cada fase produce un ARTEFACTO en el cerebro de inmobiliaria (lóbulo/spec), con fuentes citadas
> y claims verificados (doctrina §3.3 + minería bersaglio §183: premisa-primero + spot-check propio).

- **R0 · Inventario de COSECHA + estado real** (1 sesión): datos reales a migrar (5 propiedades, usuarios/solicitudes) + censo de URLs indexadas → mapa de redirects 301 + documentos maestros del dueño (auditarlos, completarlos, mapear al producto) + estado real Firebase (proyectos, billing, quotas) + estado matrícula de arrendador. NADA del código/diseño viejo entra al plan como base. Artefacto: inventario de cosecha + plan de migración de datos.
- **R1 · Competencia Colombia — con TRES lentes por portal** (mandato del dueño): **(a)** deep-research/fuentes; **(b)** análisis desde código (SEO, estructura de URLs, schema, stack detectable); **(c)** **NAVEGACIÓN LIVE vía la extensión Claude-in-Chrome** — recorrer de verdad búsqueda, ficha de inmueble, flujo de publicación, registro y planes de pago de cada uno. Portales: los 6 declarados + los que aparezcan (Habi, La Haus, Properati CO…). Por cada uno: modelo de negocio, features/planes, UX, SEO, portal de aliados, debilidades explotables. Partir del `41-MERCADO` existente (PR #79) — actualizar, no repetir. Artefacto: matriz competitiva + oportunidades.
- **R2 · Referentes mundiales** (mismas TRES lentes, incluida la navegación live): Zillow/Redfin/Idealista/Rightmove/QuintoAndar/Airbnb — qué features definen "nivel top" (estimador de valor, tours virtuales, verificación de identidad, firma digital, scoring de inquilino SIN codeudor, mapas/polígonos, alertas guardadas). Artefacto: catálogo de features nivel-mundo con juicio adopt/adapt/discard para Cartagena.
- **R3 · Legal + seguridad + documental Colombia** (skill `legal-colombia`, fuentes .gov.co, gate abogado): Ley 820 (arriendo vivienda urbana + matrícula arrendador), corretaje/comisiones usos mercantiles, avalúos (registro RAA/Ley 1673 — QUIÉN puede avaluar), Habeas Data Ley 1581 (portal maneja PII masiva), corta estancia (RNT obligatorio, Ley 2068, reglamentos PH), SIC/protección al consumidor para marketplace, contratos digitales/firma electrónica (Ley 527), prevención de lavado (SARLAFT básico inmobiliario — sector obligado UIAF). Artefacto: lóbulo 42-LEGAL de inmobiliaria + checklist de cumplimiento del portal.
- **R4 · Operación + marketing**: destilar los docs maestros del dueño (protocolo de leads, scripts WA) + benchmarks de conversión inmobiliaria + SEO local Cartagena (keywords, GBP) + estrategia de contenido. Artefacto: playbook operativo v2 + plan de visibilidad (skills del HUB).
- **R5 · Síntesis → MEGA-PLAN**: producto (MVP → olas), arquitectura (sella stack §6 vía W-11 COMPLETO: comité + Gemini + verificación), modelo de datos, roadmap por olas con gates de dueño (dinero/legal). Artefacto: `specs/MEGA-PLAN-INMOBILIARIA` en su repo = SSoT de ejecución para Opus.

**Skills nuevas**: crear DESPUÉS de R1-R3 (cristalizar investigación verificada, no antes — anti-M-08 de cars): candidatas `inmobiliaria-colombia-legal` (o ampliar `legal-colombia`), `portal-inmobiliario-features` (catálogo nivel-mundo), `arriendo-corta-estancia-co`. El dueño ya autorizó crearlas.

## §6 · STACK candidato (recomendación Fable 5 — SELLAR con W-11 completo en el chat nuevo, NO adoptar a ciegas)

> Principios: arranque $0 · escala sin re-plataformar · SEO-first (el negocio ES búsqueda local) ·
> aprovechar la expertise real de los cerebros (Firebase dominado ×3 repos; no migrar de balde — cars M-24).

| Capa | Candidato | Por qué / costo |
|---|---|---|
| DNS/CDN/hosting | **Cloudflare (free) + Cloudflare Pages** | El dominio .co YA existe (el bloqueo de cars era el dominio, aquí no aplica). Bandwidth ilimitado, previews por PR, headers custom, repo puede ser PRIVADO. Deploy en segundos. |
| Framework público | **Astro 5 (SSG+SSR híbrido, adapter Cloudflare)** | Listings = SEO puro: miles de fichas pre-renderizadas + rutas SSR para búsqueda; islands para interactividad; rendimiento top por defecto. Reemplaza el patrón "SSG casero por cron" de cars con build real. |
| Backend/datos | **Firebase: Auth + Firestore + Functions gen2 + FCM** (free tier → Blaze al escalar) | Expertise más profunda del ecosistema (rules adversariales, CRM canónico, ingestión transaccional, supresión 1581 — todo portable de cars). El costo de re-aprender otro backend NO se justifica hoy. |
| Imágenes | **Cloudflare R2 (10GB free, cero egress) + pipeline WebP/AVIF** (skill `image-pipeline`) | Las fotos de inmuebles son EL peso del portal; egress gratis es decisivo vs Firebase Storage. |
| Búsqueda | Fase 1: Firestore (índices + facetas precomputadas) · Fase 2 (gate de volumen ~>2-3k listings o facetas complejas): **Typesense** (self-host barato) o Algolia | No pagar búsqueda dedicada antes de necesitarla; diseñar el modelo de datos para poder indexar después. |
| Mapas | Fase 1: **MapLibre GL + tiles libres (Protomaps/OpenFreeMap)** · Fase 2: Google Maps/Mapbox (crédito free) | Mapa de resultados y ficha desde el día 1 sin factura. |
| Pagos/suscripciones | **Wompi** (skills `wompi-*` in-house, probado LIVE en bersaglio con webhooks blindados §181) | Colombiano, PSE/tarjetas/Nequi; el método anti-fugas ya existe. |
| Panel admin/CRM | **SPA Vite + Firebase modular** (patrón `admin-app` de cars, probado) + `crm-architect` vertical real-estate + doctrina `43-UX` | Reuso masivo verificado; el CRM de cars es el borrador de éste. |
| Visibilidad | GA4 + GSC + **HUB de visibilidad ×7 skills (vertical RealEstateAgent)** + GBP | Ya construido en el ecosistema (cars TODO-42); es enchufar el tenant. |
| CI/repo | GitHub (repo NUEVO, privado si se quiere) + Actions → Cloudflare Pages | Flujo conocido; deploy delegado a Claude como en cars. |

**Lo que NO** (con razón): no Vercel/Next por defecto (lock-in y costo al escalar SSR; Astro cubre mejor el perfil SEO-listings) · no migrar Firestore→SQL hoy (re-aprendizaje sin necesidad; re-evaluar si el marketplace exige joins/reportes pesados — gate explícito en el MEGA-PLAN) · no microservicios (YAGNI) · no n8n/infra externa de arranque (Decisión Fuerte aparte, bersaglio la parqueó).

## §6b · Pipeline de DISEÑO — "Claude Design" (mandato del dueño, añadido 2026-07-10)

> El diseño es CARRIL PROPIO del plan, no un sub-punto de implementación: el dueño detesta lo
> genérico del sitio viejo y pide diseñar la web con las herramientas de diseño de Claude. Regla
> W-11: toda UI no trivial lleva MOCKUP aprobado ANTES de código. Herramienta central **verificada
> en esta máquina**: **Claude Design (claude.ai/design) vía tool `DesignSync` + skill `/design-sync`**
> — proyecto de design-system en la cuenta claude.ai del dueño, sincronizado componente a componente
> desde el repo (incremental, nunca replace total). Complementos: Stitch MCP (`create_design_system`,
> `generate_screen_from_text`, `generate_variants`) · mockups inline `visualize`/`show_widget` · Canva ·
> skills anti-genérico (`frontend-design`, `design-taste-frontend`, `impeccable`, `high-end-visual-design`, `theme-factory`).

- **D0 · Dirección de marca** (tras R1/R2, informada por sus hallazgos UX): 2-3 direcciones visuales COMPARATIVAS como mockups, partiendo del branding real (`Branding y Membretes`: logo + "Seguridad·Legalidad·Confianza") y del posicionamiento premium-confianza. **El dueño ELIGE la dirección** (su decisión = gusto/marca; lo técnico lo decide Claude).
- **D1 · Design System PRIMERO**: tokens (color/tipografía/espaciado/radios/sombras/motion) + componentes base del dominio (botón, card de inmueble, filtros, formularios, mapa, badges de estado, galería) como biblioteca en el repo → **sync a un proyecto Claude Design** ("ALTORRA Inmobiliaria DS": `DesignSync create_project` → `finalize_plan` → `write_files`). El pane de claude.ai/design = **catálogo VIVO que el dueño ve siempre**.
- **D2 · Mockups de pantallas clave ANTES de implementar cada una**: home · resultados de búsqueda con mapa · ficha de inmueble · flujo "publica tu inmueble" · portal broker · panel admin. Cada pantalla se maqueta SOBRE los tokens D1 → aprobación del dueño → recién ahí Opus implementa **réplica EXACTA**.
- **D3 · Gate de fidelidad visual**: la validación funcional NO caza defectos de diseño (cars M-23) → cada implementación se valida VISUALMENTE (screenshot vs mockup + ojo del dueño en live vía extensión Chrome).
- **D4 · El DS es SSoT anti-deriva**: ningún componente nuevo nace en el código sin pasar por el design system; el proyecto Claude Design se re-sincroniza con `/design-sync` en cada ola.
- Arranque: la PRIMERA llamada a `DesignSync` le pedirá al dueño autorizar el scope de diseño en su login de claude.ai — un clic (checklist §8).

## §7 · TRASPASO DE LIDERAZGO DEL CEREBRO (cars → inmobiliaria; mandato del dueño)

Estado actual: operador-cars = escritor único del kernel/§G (L-31 ×cerebros). **Nuevo líder = operador-inmobiliaria.** Protocolo (lo ejecuta el chat nuevo; cars ya dejó constancia en su ADR §302):

1. **Asumir kernel-writer**: inmobiliaria pasa a ser el ÚNICO que edita `scripts/brain-check.mjs`/`brain-diff.mjs` y la §G cross-repo; propaga byte-idéntico ×4 (check #11). Cars queda como un peer más.
2. **Actualizar la constancia en cada cerebro** (vía payloads de `sinapsis-cerebros` si el harness bloquea writes cross-repo — regla 5 de la skill): la regla "escritor único = cars" cambia a "= inmobiliaria" en las lecciones/gobernanza que la citan (cars L-31/§G · bersaglio su L-31 · insema).
3. **Potenciar el cerebro propio ANTES de construir** (mandato "sin vacíos, super memoria"): aplicar su payload de sinapsis pendiente · correr `auditoria-cerebro` (Nivel-2) · destilar `_legacy/AVANCES.md` (Fase B pendiente desde la instalación) · re-verificar el 05 contra Firebase/git reales (su propio flag lo pide desde 2026-06-15) · adoptar de cars lo que le falte de gobernanza (W-11, workflows 60, protocolo Fable-audita-Opus §300 cars, TODO-28 §G ×4 — que AHORA lidera él).
4. **Sinapsis**: actualizar el mapa de la skill `sinapsis-cerebros §1` (líder = inmobiliaria) al asumir.

## §8 · CHECKLIST DEL DUEÑO (registros/accesos — todo $0 hoy)

1. **Cloudflare**: crear cuenta (free) y delegar los nameservers de `altorrainmobiliaria.co` (necesito saber en qué registrador está el dominio). — habilita Pages/R2/DNS.
2. **Dominio**: confirmar acceso al registrador (usuario/renovación al día).
3. **Firebase**: confirmar acceso al proyecto actual de inmobiliaria (consola) y si está en plan Spark o Blaze.
4. **Google Search Console**: confirmar propiedad del dominio (hay SEO previo — no perder historial).
5. **Google Business Profile** de ALTORRA Inmobiliaria (si no existe, crearlo — R4 lo optimiza).
6. **Matrícula de Arrendador**: estado real del trámite EXT-AMC-26-0060455 (¿se subsanaron las observaciones del oficio AMC-OFI-0074376-2026?). Es gate del negocio de arriendos.
7. **Wompi**: NADA aún (se abre cuando el marketplace de suscripciones esté por lanzar).
8. Mantener a mano la carpeta `ALTORRA Company (Legal)` (será fuente de R0/R2/R3).
9. **Claude Design**: cuando el chat nuevo invoque `DesignSync` por primera vez, aprobar el permiso de diseño en tu login de claude.ai (un clic) — habilita el catálogo vivo en claude.ai/design.

## §9 · PÁGINA DE MANTENIMIENTO (copy listo — implementa el chat nuevo en el repo actual, 1 commit)

**Copy aprobable (es-CO, tono de marca):**

> **ALTORRA Inmobiliaria**
> *Seguridad · Legalidad · Confianza*
>
> # Estamos construyendo algo grande
>
> Nuestra casa digital está en plena transformación: un nuevo portal inmobiliario pensado para que
> comprar, vender o arrendar en Cartagena sea más simple, más seguro y más transparente que nunca.
>
> Mientras tanto, seguimos atendiéndote como siempre:
> 📱 WhatsApp **+57 323 501 6747** · ✉️ **altorracompanysas@gmail.com**
>
> Vuelve pronto — lo que viene te va a encantar.
>
> — pie: *ALTORRA COMPANY S.A.S · NIT 902063965-4 · Cartagena de Indias, Colombia*

**Implementación**: página única estática (logo de `Branding y Membretes` + fondo oscuro elegante + oro de marca), `meta robots noindex` NO (mejor `index` con title "ALTORRA Inmobiliaria — Nuevo portal en construcción" para no perder el dominio en Google), y **mantener vivas las URLs con redirect 302 a la home** (no 404 masivo = no quemar el SEO existente mientras dura la obra). Formulario/CTA = WhatsApp directo (no perder leads durante la construcción).

## §10 · PROMPT DE ARRANQUE del chat nuevo (pegar tal cual en el chat de altorrainmobiliaria)

```
ARRANQUE ALTORRA INMOBILIARIA (Fable 5). Soy el dueño, Daniel. Este chat ASUME desde hoy:
(a) el LIDERAZGO del cerebro multi-proyecto (kernel + §G, antes en cars), y
(b) la misión: construir el MEJOR portal inmobiliario — altorrainmobiliaria.co — DESDE CERO ABSOLUTO.

Lee PRIMERO, en este orden (rutas cross-repo, solo lectura), y copia ambos a tu repo como specs madre:
1. ..\altorracars.github.io\specs\2026-07-10-INMOBILIARIA-KICKOFF-fable5.md      ← paquete de arranque (SSoT operativa)
2. ..\altorracars.github.io\specs\2026-07-10-INMOBILIARIA-MANDATO-DUENO-verbatim.md ← mi mandato completo en MIS palabras

REGLA INNEGOCIABLE — DESDE CERO DE VERDAD: del sitio actual NO me gusta NADA (diseño anticuado y
genérico, fue mi primera web). NO se reutiliza ni código, ni diseño, ni arquitectura del sitio viejo.
Greenfield total: infraestructura excelente y todo bien pensado de inicio a fin. Lo ÚNICO que se
cosecha: DATOS reales (propiedades/usuarios), historial SEO (URLs viejas → redirects 301), documentos
legales/operativos y el APRENDIZAJE del cerebro.

Ejecuta en orden:
0. Boot de tu cerebro + aplica tu payload de sinapsis (~/.claude/skills/sinapsis-cerebros/references/
   import-inmobiliaria-2026-07-10.md) + brain:check en verde.
1. Asume el liderazgo del kernel (§7 del kickoff) y actualiza la skill sinapsis-cerebros.
2. Página de mantenimiento LIVE en el dominio actual (§9, copy ya aprobado) + redirects 301/302 —
   sin 404 masivos, sin quemar el SEO, sin perder leads (CTA a WhatsApp).
3. Potencia tu cerebro (§7.3): auditoría Nivel-2 + destilar _legacy + re-verificar tu 05 vs realidad.
4. Investigación R0→R5 (§5). Para CADA portal competidor y referente mundial usa TRES lentes:
   (a) deep-research/fuentes · (b) análisis desde código (SEO/URLs/schema/stack) · (c) NAVEGACIÓN
   LIVE vía la extensión Claude-in-Chrome (recorre búsqueda, ficha, publicación, registro y planes
   de: ciencuadras, metrocuadrado, fincaraiz, coninsa, araujoysegovia, arenasinmobiliaria + Zillow/
   Idealista/QuintoAndar/Airbnb y los que encuentres). Artefactos al cerebro; skills inmobiliarias
   nuevas cuando la investigación esté VERIFICADA (no antes).
5. Sella el stack (§6 candidato: Cloudflare Pages + Astro + Firebase + R2 + Wompi + MapLibre) con el
   flujo fuerte W-11 COMPLETO: comité de expertos + consejo externo (Gemini) + verificación de cada claim.
6. Pipeline de DISEÑO "Claude Design" (§6b): dirección de marca en mockups comparativos (yo elijo la
   dirección) → design system PRIMERO (tokens + componentes del dominio) sincronizado a un proyecto
   Claude Design en mi cuenta claude.ai vía DesignSync + /design-sync (catálogo vivo que yo veo) →
   mockup aprobado de CADA pantalla clave ANTES de codearla → implementación réplica-exacta con gate
   de fidelidad VISUAL. Cero diseño genérico (skills frontend-design/design-taste/impeccable).
7. MEGA-PLAN del portal por olas (R5, con el diseño como carril propio) → Opus 4.8 implementa;
   Fable 5 audita al cierre de cada ola (protocolo Fable-audita-Opus, cars §300).

Reglas permanentes: Fable 5 planifica/investiga/audita · Opus 4.8 implementa (tag por commit) · yo
solo decido dinero/legal/go-no-go. Español SIEMPRE. Autonomía total: no me preguntes opciones
técnicas ni de diseño — decide tú bajo tu propia recomendación y ejecuta. Mi checklist de registros
está en el §8 del kickoff — pídeme lo que te falte de ahí.
```

## Checklist

- [x] Identidad legal validada contra PDFs reales (Cámara: ALTORRA COMPANY S.A.S, NIT 902063965-4, matrícula 10011978, objeto social inmobiliario — pdftotext 2026-07-10)
- [x] Gate legal detectado: matrícula de arrendador EN TRÁMITE con observaciones (oficio AMC-OFI-0074376-2026, Ley 820 art. 28)
- [x] Activos inventariados: cosecha de datos/SEO/docs + cerebro instalado 2026-06-09 + all_docx_content.txt (§4; greenfield total confirmado por el dueño 2026-07-10)
- [x] Mandato del dueño preservado VERBATIM (`2026-07-10-INMOBILIARIA-MANDATO-DUENO-verbatim.md`)
- [ ] Chat inmobiliaria arrancado con el prompt §10
- [ ] Payload sinapsis aplicado en inmobiliaria
- [ ] Liderazgo del kernel transferido (§7) y constancias ×4 actualizadas
- [ ] Página de mantenimiento live (§9)
- [ ] R0-R5 ejecutadas (artefactos en el cerebro de inmobiliaria)
- [ ] Stack sellado vía W-11 (§6)
- [ ] MEGA-PLAN emitido (SSoT de ejecución para Opus)
