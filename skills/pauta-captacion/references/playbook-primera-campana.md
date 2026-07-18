# Playbook — Primera campaña de captación de propietarios (verificado 2026-07-18)

> Investigación completa (4 frentes + fuentes) → bóveda `2026-07-18-investigacion-pauta-crudo.json` +
> `2026-07-18-blueprint-pauta.md`. Los ❓ son BENCHMARK-NO-OFICIAL: solo orden de magnitud, el dato real
> lo produce la cuenta. **Re-verificar URLs/features al montar** (L-30).

## 1. Objetivo y por qué
- **Objetivo: Leads (Clientes potenciales)** — único que permite instant forms y soporta WhatsApp como
  ubicación de conversión con "Maximizar conversaciones". El objetivo "Mensajes" fue RETIRADO (los 11
  objetivos viejos → 6 vigentes: Awareness/Traffic/Engagement/Leads/App/Sales).
  Oficial: facebook.com/business/help/387294348401675 · help/451202588606868 · help/447934475640650
- **Pieza principal: CTWA (click-to-WhatsApp)** — el cierre de ALTORRA es WhatsApp y "conversación" es el
  evento más frecuente/barato (mitigación oficial de learning limited: help/112167992830700). Message
  template: saludo + pregunta sugerida "¿Qué inmueble quieres entregar en arriendo o venta?"
- **Segunda pieza (misma campaña): Instant Form "Higher Intent"** + pregunta filtro ("¿El inmueble es
  tuyo?") + verificación OTP del teléfono — la palanca OFICIAL de calidad (help/252352181957512 ·
  help/761812391313386). **NUNCA optimizar por conversiones web con píxel inmaduro.**

## 2. Estructura
**1 campaña · 1 conjunto (máx 2) · 2-4 anuncios.** CBO viene por defecto en Leads — no pelearlo
(help/458847204894307). Naming: `META_Leads_CTWA_Propietarios-CTG_<año>Q<n>`.
Por API/conector MCP: `OUTCOME_LEADS` · `destination_type='WHATSAPP'` · `billing_event='IMPRESSIONS'`
(developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-whatsapp/).
**Contrato de seguridad: todo se crea EN PAUSA; cambios de dinero exigen "sí" explícito de Daniel.**

## 3. Audiencia
**Advantage+ audience AMPLIA** (default; "we recommend targeting as broadly as possible" —
help/793748385630490). Límites duros: ubicación **Cartagena + área metropolitana** · edad mínima 28
❓(criterio propio — validar con breakdown demográfico al día 14) · español. **CERO intereses como límite**
(a lo sumo sugerencia). El filtro "propietario" lo hacen: copy con identity-trigger ("propietario en
Cartagena"), la pregunta del form y la conversación. Housing/Special Ad Category NO aplica a pauta→Colombia
(Meta verificado §34; espejo Google: support.google.com/adspolicy/answer/16701755).

## 4. Creativos (del Brief — bóveda `pauta/`)
- Piezas **ARRIENDO + VENTA** con los números REALES (matrícula) visibles — ambos registros YA EXISTEN;
  Daniel entrega los números al cierre de obra (gate §1 del SKILL.md). **RENTA CORTA espera su RNT visible.**
- Estáticas primero (Andromeda, `paid-ads §Meta`) · copy largo · variantes por plantillas de `ad-creative`
  (incl. Search-Bar y Offer-Deadline ALTORRA) · voz por `catalogo-voz-altorra §6.3` (sin "precios desde",
  sin superlativos, sin barrios estigmatizados) · dolor con salida (`marketing-psicologico §10`).

## 5. Presupuesto COP
- **COP 40.000-60.000/día ≈ 1,2-1,8M/mes** ❓ (síntesis de fuentes CO + criterio; piso ~600k/mes sin señal ❓).
- Reglas OFICIALES: Meta ya NO publica mínimos fijos — **Ads Manager alerta el mínimo real en COP al crear el
  conjunto** (help/203183363050448); "cost per result goal" exige diario ≥5× el objetivo (no usarlo al inicio).
- **Learning limited A PROPÓSITO**: los ~50 eventos de optimización/semana (oficial, vigente) exigirían ~COP
  1M/semana — inviable. El diseño (1 campaña/1 conjunto/amplio/evento frecuente) ES la mitigación oficial.
- Expectativas ❓: CPM Colombia USD 2-4 (~15% del promedio global; 2 fuentes independientes) · CPL bruto
  pesimista USD 10 ≈ COP 40k (banda LatAm 5-15) · CPQL 35-60 ❓. **Captación de PROPIETARIOS no tiene
  benchmark público — nuestra planilla CPQL ES el benchmark.** TRM ~4.000-4.300 ❓: confirmar al presupuestar.

## 6. Tracking (fase 0 → fase 1)
- **Fase 0 (lanzamiento)**: optimización por conversaciones = in-platform, NO requiere píxel. GA4
  `whatsapp_click` en la landing (`ga4-lead-tracking`, Consent Mode v2) + **planilla manual CPQL** (¿dueño
  real? ¿inmueble en Cartagena?) desde el día 1.
- **Fase 1 (semanas 1-2, en paralelo)**: píxel/dataset (UN id — help/750785952855662) + `Contact` en onclick
  de wa.me + `Lead` en form (bloques oficiales: developers.facebook.com/docs/meta-pixel/reference; la receta
  compuesta es práctica de industria ❓ — validar en Test Events) + **CAPI vía Cloudflare Worker** con
  `event_id` UUID compartido (dedup 48h: …/conversions-api/deduplicate-pixel-and-server-events), em/ph
  SHA-256, IP de `CF-Connecting-IP`, token = secret del Worker (JAMÁS en repo). Zaraz = alternativa solo
  tras validar server-side en Test Events ❓. CAPI Gateway de Meta: DESCARTADO (AWS/GCP, rompe zero-budget).
- Mapa de nombres: `whatsapp_click`(GA4) ↔ `Contact`(Meta) · `generate_lead`(GA4) ↔ `Lead`(Meta).
- Semana 1 con CAPI vivo: auditar las 5 pestañas de Events Manager (cobertura ≥75%, dedup, EMQ, freshness —
  help/1541268312717919). EMQ: email y fbc = prioridad ALTA, teléfono MEDIA (clave en flujo WhatsApp-céntrico).

## 7. Kill / Keep / Scale — primeras 2 semanas
- **Días 1-7: NO TOCAR NADA** (targeting/creativo/evento/presupuesto >±20% = edición significativa que
  resetea el aprendizaje — oficial help/112167992830700). Solo observar: entrega, comentarios, calidad de
  conversaciones.
- **Día 7 — diagnóstico** (`meta-ads-diagnostico`): CTR ≥1-1,5% ❓ · conversación/clic 50-60% ❓ · costo por
  conversación. CTR <0,8% sostenido → problema de CREATIVO: preparar variante y lanzarla como anuncio NUEVO
  (nunca editar el vivo).
- **Día 14 — decisión** (umbral de evidencia: ~3× CPA objetivo gastado o ~100 clics):
  - **KILL** pieza: CPL >USD 15 (~COP 60k) ❓ sostenido, o conversaciones mayormente NO-propietarios →
    cambiar ÁNGULO/filtro, no el targeting.
  - **KEEP**: CPL USD 5-15 ❓ y ≥40% de conversaciones = propietarios reales.
  - **SCALE**: CPL <USD 10 con calidad → +20% cada 5 días, nunca +30%.
  - **La métrica que manda es CPQL-propietario** (planilla), no el CPL de Ads Manager — método TCPL del
    `meta-decision-system` re-anclado a COP (§4 del SKILL.md).
- **Retargeting: 0% al inicio** (no hay audiencia) — revisar a las 4-6 semanas con ~1.000 visitantes ❓.

## 8. Huecos SIN fuente oficial (cerrarlos con dato propio)
CPL/CPQL de PROPIETARIOS (no existe público → planilla desde día 1, recalibrar día 14) · CPM/CPL Colombia
(terceros, rangos 6x) · receta Contact+dedup (validar Test Events) · "website > form en intención" (consenso,
no doc → usar Higher Intent+OTP oficial) · split retargeting (Meta no prescribe) · mínimos COP (alerta del
Ads Manager) · Zaraz server-side (validar) · TRM (confirmar) · edad propietario (breakdown día 14) ·
WhatsApp Flows (verificar disponibilidad en la cuenta) · CPC keywords Cartagena (Keyword Planner, fase 2).
