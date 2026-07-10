# 🏭 R4 — OPERACIÓN + MARKETING (destilado de docs maestros + SEO local · workflow wf_ca9ed63b, 11 agentes, 2026-07-10)

> Artefacto R4 (kickoff §5). Fuente: documentos maestros INTERNOS del dueño (674KB) + investigación SEO
> local. ⚠️ Los datos de tarifas/procesos son del negocio — el crudo vive en la bóveda privada
> (`research-archive/2026-07-10-r4-operacion-marketing-crudo.txt`), NO en este repo público: aquí va lo
> operativo NO sensible. Crítico de completitud incluido (§6).

## 1. El negocio según sus propios docs (destilado operativo)

### ALTORRA Inmobiliaria — El negocio según sus propios documentos

#### 1. Identidad y datos duros
- **Marca comercial:** ALTORRA Inmobiliaria · **Slogan oficial:** "Gestión Integral en Soluciones Inmobiliarias" (perfil WhatsApp Business v1/v2, Scripts v4 §1).
- **Sede:** Cartagena de Indias, Bolívar. **Web:** altorrainmobiliaria.co · **Email público:** info@altorrainmobiliaria.co · **WhatsApp público:** +57 300 243 9810 (contratos + Scripts v4).
- **CEO / rep. legal:** Daniel De Jesús Romero Martínez (firma "CEO – ALTORRA Inmobiliaria", Informes Apto 1721).
- **Horario:** L–V 9:00–18:00, Sáb 9:00–14:00 (perfil WA) — ⚠️ el mensaje de ausencia v1 dice 8:00–19:00 (sin unificar).
- **Caras visibles de contenido:** Dani y Joha ("Tours inmobiliarios", Marketing.docx).
- **Sistema documental legal interno:** código ODL-02, v01, 11/08/2025.
- **⚠️ ALERTA DE IDENTIDAD JURÍDICA (crítica):** los **contratos** dicen **ALTORRA S.A.S., NIT 901.976.611-7**; el **JSON-LD del sitio en vivo** (DATOS B) declara **ALTORRA COMPANY S.A.S, NIT 902063965-4**. Además existen estatutos de DOS entidades ("Estatutos ALTORRA COMPANY S.A.S" y "ESTATUTOS-ALTORRA INMOBILIARIA S.AS", fuera de rango). Hay probable estructura holding+operadora. Impacta footer, schema RealEstateAgent, GBP y citaciones NAP → ver `preguntas_dueno` #1.

#### 2. Líneas de negocio confirmadas (6)
Compra/venta · Arriendo (larga estancia) · **Administración de inmuebles** (motor de ingreso recurrente) · Avalúos/ACM · Servicios legales especializados · **Turismo** (alojamientos por días, pasadías en finca, yates — Cartagena). Menú de bienvenida WA 1-5 (Scripts v4 §2.1) es la arquitectura de servicios del portal.

#### 3. Tarifas consolidadas (con discrepancias marcadas)
| Servicio | Tarifa ALTORRA | Nota |
|---|---|---|
| Venta | **2–3%** del precio | Cobro SIEMPRE al cierre (escritura). % exacto vive en `INFORMACION TARIFARIOS 2026.docx` (placeholder en scripts). |
| Captación arriendo (honorario inicial) | **50–100%** del primer canon | |
| Administración mensual | **8–12%** del canon (contratos reales: **10% + IVA**) | Ingreso recurrente y estable. |
| Referido (sin gestión) | **1–1.5%** del negocio | |
| Venta a arrendatario del inmueble administrado | **3%** del valor de venta | Exigible a la escritura (cláusula 14ª admin). |
| Gestión sin administración (solo conseguir inquilino) | 1/2/3 cánones (<3a / 3-9a / ≥10a) | Se cobra del 1er pago del arrendatario. |
| Póliza arrendamiento | **⚠️ 50–80% de un canon** (Sistema Op.) vs **50–70% del canon anual** (Scripts) | La paga el arrendatario; cubre 12 meses. |
| Cláusula penal admin / arriendo | 2 SMLMV / 3 cánones | |
| Arras o separación | **⚠️ 10–20% / 10–30% / 5–10%** (3 cifras sin unificar) | |
| Pauta Meta Ads | desde **$15.000/día** por inmueble | Argumento central de exclusividad. |
| Portales (Fincaraíz/Metrocuadrado) | desde **$80.000/mes** | |
| Exclusividad (Contrato de Intermediación) | **60 días** | |
| Gastos de cierre | Notaría 50/50 comprador-vendedor · retención al vendedor · registro ORIP al comprador | |
- **Interno, NUNCA al cliente:** comisión al asesor (detalle → bóveda privada) de la comisión cobrada.
- **Decisiones >$1M** requieren autorización escrita de la Dirección.

#### 4. Procesos núcleo
- **Embudo de 5 fases:** 01 Captación → 02 Comercialización → 03 Cierre → 04 Legalización → 05 Administración ("saltarse una fase = 90% de los problemas", Sistema Op. §3).
- **Regla de oro nº1 (SLA):** responder todo lead en **<5 minutos** — "el 50% de los leads se van con el primer asesor que responde" (repetida en 5 docs). **"Lo que no está en el CRM NO EXISTE."**
- **Calificación BANT obligatoria ANTES de mostrar propiedades** (Budget, Authority, Need, Time). Solo se agenda visita si califica; exigir que **todos los decisores** asistan.
- **Captación propietario — 5 preguntas obligatorias por teléfono:** titularidad/poder ("sin titularidad no hay negocio"), motivación, urgencia, precio esperado, situación legal (hipoteca/embargo/litigio).
- **Regla anti-sobreprecio:** NO captar si el propietario insiste en **>10% sobre el ACM**.
- **ACM:** mínimo 3 comparables reales, precio por m², informe escrito — ⚠️ tolerancia de área **±15% (Sistema) vs ±20% (Protocolo)**.
- **Seguimiento post-visita D0/D1/D3/D5/D8** → nurturing mensual ("el 80% de cierres NO ocurren en la 1ª visita").
- **Máx. 3 opciones por envío** ("el exceso paraliza la decisión").
- **Protocolo de mora:** ⚠️ arranque **Día 1 (Protocolo) vs Día 5 (Sistema Op.)** → Día 15 carta extrajudicial → Día 30 activar garantía/aviso jurídico → Día 45 restitución (proceso 3-8 meses).
- **Administración:** recaudo días 1-5, giro al propietario antes del día 10 (Sistema) / 5 días hábiles (contratos), descontando comisión; **cuenta bancaria SEPARADA (regla absoluta)**; inspección semestral con informe fotográfico firmado por el CEO; PQRS ≤48h.
- **Estudio de arrendatario:** 3-5 días hábiles; DataCrédito + TransUnión; la **aprobación final SIEMPRE la da el propietario, no ALTORRA**.
- **Legalización V1-V5** + cumplimiento: Habeas Data (Ley 1581/2012), SAGRILAFT, declaración origen de fondos, listas OFAC/ONU. Certificado de tradición ≤30 días.
- **Pipeline CRM 9 estados** (Nuevo→Contactado→Calificado→Visita Agendada→Visita Realizada→Oferta Presentada→Cerrado / Nurturing / Descartado) espejado en **19 etiquetas WhatsApp** (5 prospección + 4 negociación + 6 tipo de lead + 4 canal de origen: WhatsApp/Instagram/Portal Web/Referido).
- **10 KPIs semanales** (CPL <$35.000, ≥50 leads/mes, cierre ≥10%, mora <5%, NPS >8, ≤60 días venta/30 arriendo, ≥4 captaciones/mes…), revisión cada lunes 30 min.

#### 5. Voz y posicionamiento
- **Manifiesto:** "No vendemos inmuebles. Construimos confianza, resolvemos problemas y acompañamos a las personas en una de las decisiones más importantes de su vida."
- **Lema operativo:** "¡Responde rápido! · ¡Califica siempre! · ¡Muestra con pasión! · ¡Haz seguimiento implacable!"
- **Anclas por servicio:** administración → "Usted descansa. Nosotros trabajamos."; avalúo → "En ALTORRA no damos precios al aire"; venta → "Con ALTORRA usted no paga hasta que vendamos" (a éxito); contratos → "La transparencia total hace parte del servicio ALTORRA".
- **Registro dual:** "tú" cercano con leads por WhatsApp; "usted" respetuoso con propietarios y llamadas formales. Personalización obligatoria con [Nombre].
- **Ética explícita:** nunca atacar a la competencia, urgencia solo si es real, transparencia radical (mostrar el contrato antes de firmar).
- **Copywriting:** vender **estilo de vida, no metros cuadrados**; "la primera impresión determina el 70% de la decisión emocional".
- **Misión/Visión/5 Valores** (Transparencia, Compromiso, Confianza, Innovación, Excelencia) redactados en Marketing.docx — listos para "Nosotros".

#### 6. Stack, marco legal y aliados
- **Stack definido por el dueño:** HubSpot CRM (gratis), Wasi (opcional), WhatsApp Business, Meta Ads, Google Drive, FirmaVirtual/DocuSign, Canva Pro, GA4 + Meta Pixel. (⚠️ El portal greenfield corre en Firebase modular — ver CLAUDE.md; conviven ambos mundos.)
- **Marco legal citado:** Ley 820/2003 (arrendamiento, IPC, mínimo 1 año, preaviso 3 meses, indemnización 3 cánones), Ley 1579/2012 (ORIP), C. Civil 1857-2045 (compraventa/arras), Ley 1581/2012 (Habeas Data), SAGRILAFT (obligatorio para inmobiliarias), Ley 675/2001 (PH), art. 422 CGP (contratos como título ejecutivo).
- **Aliados:** codeudor institucional F&B Soluciones Jurídicas SAS (NIT 901.561.601-1); crédito hipotecario con Bancolombia, Banco de Bogotá, Davivienda, Colpatria (trámite 2-4 semanas); centrales DataCrédito/TransUnión.
- **Prueba de operación real:** contratos de administración y arriendo vigentes desde ago-2025 (clientes reales), inspecciones semestrales ejecutadas → materia prima de señales de confianza para el portal.

#### 7. Discrepancias internas a resolver ANTES de codificar contenido
1) NIT/razón social (901.976.611-7 ALTORRA S.A.S vs 902063965-4 ALTORRA COMPANY S.A.S). 2) Ingresos arrendatario **2x vs 2.5x** canon. 3) Arras/separación **10-20% vs 10-30% vs 5-10%**. 4) Protocolo de mora arranca **Día 1 vs Día 5**. 5) ACM área **±15% vs ±20%**. 6) Póliza **50-80% de un canon vs 50-70% del canon anual**. 7) Horario **9-18 vs 8-19**. 8) % de comisión (rango vs cifra publicable). Todas alimentan `preguntas_dueno`.

## 2. Contenido reutilizable para el portal

### Inventario de contenido listo para el portal (qué es · dónde vive · para qué página)

#### A. Microcopy conversacional / chat / contacto
- **Menú de bienvenida WA 5 opciones** (Scripts v4 §2.1) → chatbot del portal + página `/contacto` (define IA de servicios: comprar/arrendar · vender · administración · avalúo · turismo).
- **Mensaje de ausencia con horarios** (Scripts v4 §2.2) → footer + widget de contacto.
- **Descripción de perfil de negocio** ("Gestión Integral… 🏠 Administración 🚪 Compra/venta/arriendo 👨‍⚖️ Servicios Legales") → meta description / bio / hero.

#### B. FAQs listas (de las 25 respuestas rápidas WhatsApp, Scripts v4 §4 / v2 §4)
- **/garantias** (codeudor / póliza 50-70% canon anual / pagaré) → página "Requisitos del arrendatario".
- **/notaria** (escrituración 50/50, retención vendedor, registro ORIP comprador) → guía del comprador.
- **/docarriendo, /doccompra, /docpropietario** (documentos por perfil) → páginas de requisitos + formularios.
- **FAQ "¿puedo salir antes del año?"** (Ley 820: mínimo 1 año, preaviso 3 meses, indemnización 3 cánones) → arrendatarios.
- **FAQ "¿cuánto tarda mi estudio?"** (día 1-2 docs, 2-3 DataCrédito, 3-4 capacidad, 4-5 decisión del propietario; 3-5 hábiles) → arrendatarios.
- **/reservatour + /checkin** (anticipo 50%, saldo al llegar, Nequi/Daviplata; check-in 3PM/check-out 12PM) → página Turismo.

#### C. Landings de servicio (copy central)
- **Administración** — pitch "Usted descansa. Nosotros trabajamos." + 6 checkmarks + protocolo de mora con fechas (Scripts v4 /administracion, 5.4) → landing "Administración de inmuebles" (dirigida a propietarios, prioridad del funnel).
- **Avalúo/ACM** — "En ALTORRA no damos precios al aire" + 4 bullets del método + CTA visita sin costo (Scripts v4 /avaluo) → landing `/avaluo` como **lead magnet** (nunca calcular precio online: capturar el lead).
- **Vende tu propiedad** — argumentario de exclusividad + qué incluye (fotografía pro, video 360°, Meta Ads +$15.000/día, portales) + comisión a éxito (Scripts v4 2.4, Protocolo Fase 2B) → landing "Vende/consigna con ALTORRA".
- **Separación/compra en 4 pasos** (carta de intención → negociación → promesa con minuta → arras) → "¿Cómo comprar con ALTORRA?".

#### D. Formularios y flujos (materia prima)
- **BANT (/filtrobant) + perfiles /comprarperfil, /arrendarperfil** con la pregunta estrella negativa "¿Qué es lo que definitivamente NO aceptarías en el inmueble?" → campos del formulario de búsqueda/lead y filtro de exclusión diferenciador.
- **5 preguntas de captación (/captar)** → formulario `publicar-propiedad` (encadenar firma de intermediación ANTES de publicar).
- **Estructura de copy de ficha** (gancho emocional + beneficios + datos técnicos m²/alcobas/baños/estrato/admin + precio + CTA) → plantilla de listings.
- **Guiones de seguimiento D0/D1/D3/D5/D8 + nurturing mensual** → automatizaciones de email/WhatsApp del CRM.

#### E. Argumentarios / banco de objeciones (blog + entrenamiento + chatbot)
- Objeciones "está muy cara", "vi una similar más barata", "tengo reportes en DataCrédito", "la póliza es cara", "no quiero exclusividad", "la comisión es alta", "lo voy a pensar" (Protocolo Fase 3, Scripts v4 Parte 7).
- **3 técnicas de cierre** (urgencia / alternativa / resumen) — uso interno de asesores.

#### F. Plantillas legales (páginas de servicio + generador en el panel admin)
- **Contrato de Administración** (20 cláusulas, ODL-02) y **Contrato de Arrendamiento** (21 cláusulas, Ley 820) → base del generador de contratos del admin y de las páginas de servicio.
- **Formato de Otrosí** (prórroga/ajuste de canon) → renovaciones.
- **Informe de Inspección Semestral** (por áreas + anexo fotográfico) → **feature diferenciadora: portal del propietario con informes descargables**.
- **Disclaimer/AVISO LEGAL de simulador** (texto íntegro de ALTORRA Cars, con checkbox obligatorio que bloquea el botón) → directamente adaptable al **simulador de crédito hipotecario** del portal.

#### G. Marca, educación y confianza
- **Misión, Visión y 5 Valores** (Marketing.docx) + **Manifiesto "No vendemos inmuebles…"** → página "Nosotros" + footer.
- **Tabla de 7 errores críticos de inmobiliarias** (Sistema Op. §16) → serie de blog educativo + argumentario "por qué trabajar con ALTORRA".
- **Tabla de marco legal Colombia** (Ley 820, 1579, 1581, SAGRILAFT, Ley 675, C. Civil) → páginas legales + contenido **AEO**.
- **Checklist de preparación del inmueble para fotos** → guía descargable para propietarios (lead magnet).
- **Glosario comercial** (ACM, BANT, SLA, tradición, paz y salvo…) → páginas educativas SEO + tooltips del admin.
- **Elementos obligatorios de promesa/contrato** → checklists educativos del portal.

> **URLs ya "quemadas" en la operación (Scripts v2):** `/propiedades-comprar`, `/propiedades-arrendar`, `/turismo` circulan en 25 plantillas de WhatsApp — el portal DEBE honrarlas o redirigir 301. Las v1 apuntan a `altorrainmobiliaria.github.io/*.html` → 301 al dominio propio.

## 3. Inventario documental (qué hay, qué falta, qué no tocar)

### Inventario documental

#### Categorías
1. **Operativos maestros (la biblia del negocio).** Sistema Operativo Integral v1 y v2, Protocolo Maestro v2, cvcf.docx (Protocolo de Atención de Leads), Configuración WhatsApp + Biblioteca de Scripts v4 (y "Reparado").
2. **Contratos y formatos legales (ODL-02).** Contrato de Administración (modelo + 2 instancias reales), Contrato de Arrendamiento actualizado (Ley 820), 2 Otrosíes, 2 Informes de Inspección Semestral (Apto 1721 v1/v2).
3. **Marketing.** Borrador documento maestro Marketing (Misión/Visión/Valores + estrategia + estructura de equipo + KPIs), Estandarización WhatsApp Business v1 y v2.
4. **Referencia interna.** GLOSARIO.docx, DOCUMENTOS FALTANTES (meta-doc: catálogo de todo lo que falta crear).
5. **Entidad hermana ALTORRA Cars (patrón reutilizable, NO inmobiliaria).** Analisis IA.docx (simulador financiero + disclaimers legales).
6. **Registrales/fuera de rango (no destilados, críticos).** Estatutos ALTORRA COMPANY S.A.S, ESTATUTOS-ALTORRA INMOBILIARIA S.AS, INFORMACION TARIFARIOS 2026.docx.

#### Top archivos (mayor valor para el portal)
1. **ALTORRA_Sistema_Operativo_Integral(_v2).docx** — biblia operativa: tarifas, procesos, roles, KPIs, escalabilidad, marco legal.
2. **ALTORRA_Protocolo_Maestro_v2.docx** — atención de leads de la captación al cierre; scripts por escenario A1/A2/B/C/D.
3. **ALTORRA_Configuracion_WA_y_Biblioteca_Scripts_v4.docx** — 25 respuestas rápidas, pipeline de 19 etiquetas, flujos end-to-end (materia prima de FAQs y chatbot).
4. **MODELO CONTRATO ADMINISTRACIÓN – ALTORRA SAS.docx** + **CONTRATO DE ARRENDAMIENTO – ACTUALIZADO.docx** — plantillas legales para el generador del admin.
5. **Borrador documento maestro Marketing.docx** — Misión/Visión/Valores + plan de contenidos + KPIs de marketing.
6. **GLOSARIO.docx** — definiciones para páginas educativas SEO/AEO y tooltips.

#### Huecos (lo que falta o quedó fuera de alcance)
- **INFORMACION TARIFARIOS 2026.docx** — contiene los % oficiales de comisión (venta/admin) que en los scripts son placeholder `[%]`. **No destilado.** Bloquea publicar cifras.
- **Estatutos de ambas entidades** — resuelven la razón social/NIT definitivos para footer/schema. **No destilados.**
- **Catálogo DOCUMENTOS FALTANTES** — decenas de formatos aún por CREAR (ficha técnica, autorización de comercialización, formato ACM, checklist fotográfico, oferta formal, promesa, solicitud de póliza, reporte mensual al propietario, notificaciones de mora, PQRS, habeas data, SAGRILAFT, aprobación de decisiones críticas, tablero KPIs, actas). Existen como lista, no como plantillas.
- **Analisis IA.docx (Cars)** — cortado; simulador financiero completo fuera de rango.
- **Datos de tracción** (# ventas, # inmuebles administrados, años, testimonios) — no consolidados; necesarios para señales de confianza/AEO.

#### Sensibles — NUNCA publicar en el portal (uso interno / PII)
- **Números de cuenta bancaria** (Bancolombia de recaudo y depósito, y la de giro a un propietario) — dato financiero.
- **PII de clientes reales:** nombres, cédulas, matrículas inmobiliarias, direcciones exactas de apartamentos y beneficiaria por fallecimiento de 3+ contratos vigentes.
- **CC del CEO** y **teléfono personal de Daniel** (el 323…; solo publicar el +57 300 243 9810).
- **Email interno** altorrasas@gmail.com (público solo info@altorrainmobiliaria.co).
- **Comisión al asesor (detalle → bóveda privada)**, márgenes, KPIs internos y todo doc marcado "CONFIDENCIAL – USO INTERNO" (scripts, protocolos).
- **Datos del codeudor institucional** F&B Soluciones Jurídicas SAS y su representante — PII de tercero.

## 4. Plan SEO local Cartagena

### Plan SEO local + protección del activo AEO/marca + GBP

#### 1. Mapa keyword → página (13 clusters consolidados)
**Patrón ganador verificado:** la única inmobiliaria local que le gana a los portales (ACR Inmobiliaria) usa (a) landings por barrio con URL `/apartamentos-en-venta-en-{barrio}-cartagena` y (b) artículos editoriales de inversión. ALTORRA replica esa arquitectura con mejor stack (SSG + sitemap en CI).

| # | Cluster (keyword madre) | Página ALTORRA | Prioridad |
|---|---|---|---|
| 1 | apartamentos en venta bocagrande | `/comprar/bocagrande-cartagena` | **Alta** |
| 2 | casas en venta getsemani / centro histórico (lujo) | `/comprar/centro-historico-getsemani` | **Alta** |
| 3 | apartamentos en venta crespo | `/comprar/crespo-cartagena` | **Alta** |
| 4 | apartamentos la boquilla / morros (frente al mar) | `/comprar/la-boquilla-morros` + **fichas por edificio** (Morros Epic/Vitri/922, Palmetto…) | Alta / Media |
| 5 | apartamentos serena del mar (vivienda nueva) | `/comprar/serena-del-mar` | **Alta** |
| 6 | apartamentos en arriendo cartagena (+ Manga) | `/propiedades-arrendar` + `/arriendo/{barrio}-cartagena` | **Alta** (top-10 sin inmobiliarias locales = hueco) |
| 7 | apartamentos por días (corta estancia) | `/turismo` + `/turismo/{barrio}` + por edificio | Media |
| 8 | invertir en finca raíz cartagena / extranjeros (ES+EN) | `/invertir` + blog editorial ES→EN | Media |
| 9 | cuánto vale mi apartamento (avalúo) | **Herramienta `/avaluo`** (lead magnet, NO precio automático) | **Alta** |
| 10 | rentabilidad airbnb / cuánto renta por noche | **Calculadora `/calculadora-renta-airbnb-cartagena`** por barrio | **Alta (hueco más limpio del mapa)** |
| 11 | vender/consignar mi apartamento cartagena | `/vender` + `publicar-propiedad` (comisiones y proceso explícitos) | **Alta (competencia local débil)** |
| 12 | inmobiliarias en cartagena (navegacional) | Home + **GBP** (el local pack manda) | Media |
| 13 | proyectos vivienda nueva / sobre planos | vertical proyectos | **Baja — posponer** hasta tener inventario de proyectos aliados |

**Reconciliación de rutas:** honrar `/propiedades-comprar`, `/propiedades-arrendar`, `/turismo` (quemadas en WhatsApp v2) como índices de vertical; añadir encima las landings-barrio `/comprar/{barrio}-cartagena`. Redirigir 301 las viejas `altorrainmobiliaria.github.io/*.html`.

**Huecos limpios a atacar primero (bajo esfuerzo, alto retorno):** calculadora de renta por noche en español (hoy solo blogs genéricos + herramientas en inglés), avaluo con foco Cartagena (Ciencuadras cobra $20.000 → fricción explotable), y landing "vender" (competencia local anticuada; Paul Juan rankea solo por publicar su 3%).

#### 2. Protección del activo AEO/marca (URGENTE — ventana de semanas)
El ranking #1-2 en ChatGPT y el #1 orgánico de marca viven HOY del **caché del sitio viejo** (github.io). Cuando Google/Bing recrawleen y lo reemplacen por la página "en construcción" (1 URL, sin contenido), el activo AI cae.
- **ORDEN CRÍTICO:** publicar contenido sustantivo (quiénes somos, servicios, zonas, señales de confianza, FAQPage schema) **ANTES** de pedir reindexación. Pedir recrawl con página vacía **acelera la destrucción del snippet rico**.
- Consolidar en **Search Console** (verificación ya presente en index.html): confirmar dominio .co, enviar sitemap, vigilar migración github.io → .co por el 301 (ya funciona).
- Registrar **Bing Webmaster Tools** + sitemap — **Bing es la fuente de browsing de ChatGPT** (hoy sin verificar).
- Mantener **JSON-LD RealEstateAgent** + añadir **FAQPage**; `sameAs` a Instagram (y FB/TikTok). robots.txt ya permite GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot — **no bloquear**.
- **⚠️ Corregir la inconsistencia NIT/razón social del JSON-LD** (902063965-4 / ALTORRA COMPANY S.A.S) contra los contratos (901.976.611-7 / ALTORRA S.A.S): datos estructurados inconsistentes dañan E-E-A-T (depende de `preguntas_dueno` #1).
- **Monitoreo semanal:** snippet de la SERP de marca, respuesta de ChatGPT/Perplexity a "mejores inmobiliarias de Cartagena", y estado de indexación.

#### 3. Plan Google Business Profile (activo local #1, hoy inexistente)
- **Crear + verificar GBP** (acción del DUEÑO): categoría "Agencia inmobiliaria"; NAP exacto +57 300 243 9810 · info@altorrainmobiliaria.co · Cartagena de Indias · altorrainmobiliaria.co. Requiere definir si hay **dirección física publicable** (ver `preguntas_dueno`).
- **Reseñas:** arrancar captación con clientes reales ya existentes (los propietarios/arrendatarios de los contratos vigentes).
- **Citaciones NAP (4-6):** perfil de inmobiliaria en **Fincaraíz** ("Inmobiliaria Verificada") y **Ciencuadras**, Páginas Amarillas Colombia, directorio de la Cámara de Comercio de Cartagena — **misma razón social/NIT en todas** (definir cuál). Claude prepara textos/datos; el dueño crea cuentas.
- Enlazar y mantener **Instagram** (#2 de marca) y activar/verificar **Facebook y TikTok** @altorrainmobiliaria (no indexados).

## 5. Preguntas al dueño

### Preguntas para Daniel (lo que los docs no responden — priorizado, dedup)

#### 🔴 Bloqueantes (frenan footer, schema, GBP, publicar cifras)
1. **Razón social y NIT definitivos.** Los contratos dicen **ALTORRA S.A.S. NIT 901.976.611-7**; el sitio en vivo declara **ALTORRA COMPANY S.A.S NIT 902063965-4**; existen estatutos de DOS entidades. ¿Cuál es la operadora inmobiliaria y cuál va en footer, JSON-LD y todas las citaciones NAP? ¿Hay estructura holding + operadora?
2. **Comisiones oficiales publicables 2026.** Los docs dan rangos (venta 2-3%, admin 8-12%) y los scripts tienen placeholder `[%]`; el archivo `INFORMACION TARIFARIOS 2026.docx` no se destiló. ¿Publicamos cifra fija en la web (como Paul Juan con su 3%, que rankea por eso) o mantenemos "a éxito"/rango? Dime los números oficiales.
3. **Dirección física para GBP y citaciones.** ¿Hay sede/oficina visitable en Cartagena con dirección publicable, o el negocio opera sin dirección visible (solo zona)? Define el tipo de ficha de Google Business.

#### 🟠 Unificación de contenido (discrepancias entre docs a resolver antes de codificar)
4. **Ingresos mínimos del arrendatario: ¿2x o 2.5x el canon?** (4 docs discrepan; el codeudor es 3x).
5. **Arras/separación: ¿10-20%, 10-30% o 5-10%?** Una sola cifra oficial para la web.
6. **Protocolo de mora: ¿arranca Día 1 o Día 5?** (Protocolo vs Sistema Operativo).
7. **Póliza de arrendamiento: ¿50-80% de un canon o 50-70% del canon anual?** Y **¿cuál es la aseguradora aliada?** (nombre no aparece en los docs).
8. **Horario oficial: ¿9-18 / Sáb 9-14 o 8-19?** (perfil vs mensaje de ausencia).
9. **Tolerancia de área del ACM: ¿±15% o ±20%?**

#### 🟡 Alcance y roadmap del portal
10. **Datos de tracción para señales de confianza/AEO:** años de operación, # de propiedades administradas, # de ventas cerradas, testimonios autorizados. (Los contratos prueban operación real desde ago-2025 — ¿qué cifras puedo publicar?)
11. **Turismo:** ¿inventario propio de alojamientos/fincas/yates o intermediación? ¿La vertical entra ahora o en una fase posterior?
12. **Simulador de crédito hipotecario:** ¿replicamos el patrón probado en ALTORRA Cars (checkbox legal que bloquea el botón)? ¿Con qué bancos y tasas de referencia (Bancolombia/Bogotá/Davivienda/Colpatria)?
13. **Contenido en inglés** para el segmento extranjero de inversión: ¿lo priorizamos desde ya (el hueco EN lo llena hoy thelatinvestor sin competidor local)?
14. **Redes:** ¿están activos Facebook y TikTok bajo @altorrainmobiliaria? (no aparecen indexados; solo Instagram).
15. **Vertical de proyectos nuevos/sobre planos:** ¿habrá inventario de proyectos aliados? De eso depende construir o posponer el cluster 13.

## 6. Crítico de completitud (qué faltó y cómo cerrarlo)

- ESQUEMA DE PROPIEDAD SIN DESTILAR: FTI-01 - FICHA TECNICA DEL INMUEBLE.xlsx y ALTORRA_Excel_Desplegables_OK.xlsx definen el schema de campos y las taxonomias/enums de filtros del portal, y NO se destilaron. La sintesis solo tiene 'estructura de copy de ficha' (D), no el modelo de datos real. Es el hueco de mayor apalancamiento: R5 construira el data model Firestore y los filtros a ciegas.

- SESGO DOCX (meta-hueco): la destilacion se apoya en all_docx_content.txt, que solo captura texto de .docx. Todo .xlsx/.pdf/.png/Gantt quedo sub-leido — y ahi viven los activos de mayor valor: FTI-01/Desplegables (xlsx), INFORMACION TARIFARIOS 2026 (pdf), Camara de Comercio y RUT (pdf), logo y slogan (png). Hay que leer explicitamente las fuentes no-docx antes de R5.

- RNT AUSENTE (blocker legal de Turismo): el Registro Nacional de Turismo es obligatorio en Colombia para operar alojamiento turistico/por dias, y no se menciona en NINGUNA parte de la sintesis, pese a que Turismo figura como linea de negocio (2) y como cluster/landing SEO (7). El mega-plan lanzaria la vertical Turismo sin habilitacion legal.

- PRIVACIDAD/HABEAS DATA + T&C + AUTORIZACION DE DATOS NO EXISTEN Y SON BLOQUEANTES: el inventario los marca como inexistentes y obligatorios ANTES de captar leads; la sintesis los trata como 'contenido/disclaimer' (F) y no como blocker de arranque. El portal captura leads dia 1, asi que esto frena el go-live, no es un nice-to-have.

- VERTICAL VENTA SIN INSTRUMENTO LEGAL: no hay contrato de corretaje/consignacion ni promesa de compraventa/estudio de titulos (huecos del inventario). Pero 'vender con ALTORRA' es cluster SEO Alta prioridad (11) y el generador de contratos del admin solo cubre administracion+arriendo+otrosi+inspeccion. R5 lamentaria una landing de ventas y un generador sin su plantilla legal.

- DATOS REGISTRALES NO EXTRAIDOS: la matricula de arrendador subsanada (AMC-OFI-0074376-2026, habilitacion legal clave y trust signal que cruza gates B1-B17) y el certificado de Camara de Comercio actualizado (fecha de constitucion = anos de operacion, objeto social, razon social) no se leyeron. Estos resuelven PARCIALMENTE la pregunta de traccion (#10) y la de razon social/NIT (#1) sin depender del dueno.

- Plan_Video_Captacion_ALTORRA.docx NO DESTILADO: documento de la categoria Marketing/Captacion (raiz del corpus) con la estrategia de video/tours (las 'caras visibles' Dani y Joha). Insumo directo para el copy de fichas, la produccion de video de listings y la captacion — quedo fuera.

- BRANDING REAL + GANTT NO DESTILADOS: existen logo oficial (ALTORRA INMOBILIARIA.png), slogan visual (Seguridad Legalidad Confianza.png), membrete SAS, firma y un Gantt (roadmap/cronograma). La sintesis dice 'no hay brand book' pero ignora estos activos existentes. Ademas hay POSIBLE DISCREPANCIA DE SLOGAN: 'Seguridad, Legalidad, Confianza' (branding) vs. 'Gestion Integral en Soluciones Inmobiliarias' (perfil) — sin unificar.

- SEO SIN DATOS DE VOLUMEN/DIFICULTAD: la priorizacion Alta/Media/Baja de los 13 clusters se asevera sin una sola cifra de search volume ni keyword difficulty. Ademas, claims competitivos centrales van sin evidencia/fecha citada: 'ACR es la unica local que le gana a los portales', 'Paul Juan rankea solo por publicar su 3%', 'thelatinvestor llena el hueco EN sin competidor', 'Bing es la fuente de browsing de ChatGPT'. Son la base de la estrategia y estan sin respaldo verificable.

- ALTORRA-PILOTO-main NO DESTILADO (solo marcado como riesgo): el piloto inmobiliario real mal archivado bajo Cars (detalle-propiedad, publicar-propiedad, 13 servicios-*.html) es referencia directa de arquitectura, rutas e inventario de paginas del portal. Su URL structure y las 13 paginas de servicio deberian reconciliarse con la arquitectura SEO de R5 y con las rutas ya 'quemadas' en WhatsApp — no se hizo.
