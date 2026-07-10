# 🌊 MEGA-PLAN — Portal ALTORRA Inmobiliaria (greenfield, por olas)

> **SSoT del roadmap** (ADR §17). Escrito por Fable 5 (2026-07-10) sobre la investigación completa
> R0-R5 verificada. **Opus 4.8 implementa; Fable audita al cierre de cada ola** (protocolo cars §300 +
> skill `opus-interino-protocolo`). El dueño decide: dinero, legal, go/no-go de cada ola, y la dirección
> de marca en D0. Los detalles viven en los specs R1-R5 — este plan REFERENCIA, no duplica.

## 0 · Principios innegociables (de todo lo aprendido)

1. **El stack es el del ADR §16** (`specs/R5-STACK-2026-07.md`) — Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre. Sus 7 fallos Q1-Q7 y 5 riesgos con mitigación son VINCULANTES.
2. **Los 17 gates legales B1-B17** (`docs/42-LEGAL.md` + spec R3) se respetan por diseño: B1 (Habeas Data) bloquea el PRIMER formulario; B2/B9 (retención de fondos) bloquean el flujo de dinero del booking, NO el resto del vertical.
3. **Diferenciales fundacionales** (R1): corta estancia con booking real (hueco total del mercado CO) · transparencia radical de precios y costos · frescura verificada · publicación generosa a particulares · WhatsApp-first sin gating.
4. **Marca**: dorado · plata · blanco · azul turquí — **SIN negro**. Contacto público: +57 300 243 9810 · info@altorrainmobiliaria.co. El Nº de matrícula de arrendador va en el footer y en cada aviso de arriendo (B4).
5. **Free-tier sagrado**: catálogo cacheado/prerenderizado, `limit()` default 9, cero `onSnapshot` público, imágenes públicas SOLO en R2, alerta de reads/día.
6. **Cero diseño genérico**: nada se codea sin mockup aprobado (carril D). Voz cartagenera cálida (vs. tono frío del rival local).
7. **SEO/AEO**: JSON-LD server-rendered en TODO, fichas permanentes, og:image dinámica pre-generada; **no pedir reindexación hasta publicar contenido sustantivo** (regla de oro R4).

## 1 · Estrategia de repo y despliegue (decisión de arquitectura operativa)

- **MISMO repo** (`altorrainmobiliaria.github.io`): el cerebro vive aquí y la delegación git ya funciona. El portal nuevo se construye en el directorio **`portal/`** (proyecto Astro autocontenido) con CI propio → **Cloudflare Workers** (staging continuo en `*.workers.dev` desde el día 1).
- **GH Pages sigue sirviendo la página de obra** en el dominio hasta el cutover. Cutover = decisión del dueño (go/no-go Ola 1): NS de Hostinger → Cloudflare, dominio al Worker, mapa 301 de las 63 URLs viejas (censo R0) servido por el Worker. GH Pages queda como fósil apagable.
- Limpieza del sitio viejo del working tree (js/, css/, HTML viejos): **al cutover**, no antes (git history los retiene; L-13 nos enseñó a no fiarnos de deploys invisibles).

## 2 · Carril D — Diseño "Claude Design" (paralelo a las olas, kickoff §6b)

| Fase | Entregable | Gate |
|---|---|---|
| **D0** | 3 direcciones de marca en mockups comparativos (home+ficha en cada dirección; paleta oro/plata/blanco/navy; insumos: bóveda `ui-referentes/` + R2 §1) | **el DUEÑO elige** |
| **D1** | Design system PRIMERO: tokens + componentes del dominio (card canónica con doble-precio, search-pill, chips, galería-mosaico, badges de confianza, breadcrumb con conteos) | sync a proyecto Claude Design (claude.ai del dueño) vía DesignSync + `/design-sync` |
| **D2** | Mockup aprobado de CADA pantalla clave ANTES de codearla | aprobación del dueño por pantalla |
| **D3** | Implementación réplica-exacta | skills `frontend-design`/`impeccable` |
| **D4** | Gate de fidelidad VISUAL (captura vs mockup) | Fable audita en cierre de ola |

## 3 · Las olas

### 🌊 OLA 0 — Fundaciones (sin gates externos; arranca YA)
1. **Scaffold `portal/`**: Astro + adapter CF (`output:'server'`, `prerender=true` explícito por página estática), TypeScript, estructura de capas (la capa de acceso a datos FINA es obligatoria — R4 del juez), CI GitHub Actions → Workers staging.
2. **Cuenta Cloudflare** (dueño crea, gratis) + R2 bucket + Worker. Firebase: reglas/Functions nuevas en `portal/firebase/` (el proyecto `altorra-inmobiliaria-345c6` se REUSA; las 7 CFs legacy se apagan al cutover).
3. **D0 + D1** (carril D arriba). Tokens desde la elección del dueño.
4. **Página de obra ENRIQUECIDA** (AEO — quick win en GH Pages actual): servicios, zonas, FAQPage JSON-LD, sello matrícula — protege el ranking ChatGPT ANTES de cualquier reindexación.
5. **GBP + citaciones locales** (necesita dirección física → pregunta 🔴 R4 al dueño).
6. **Textos legales v1** (gate B1): política de datos + aviso de privacidad + T&C (plantillas de R3 §5; validación abogado ANTES de captar el primer lead del portal nuevo).
7. Modelo de datos v1 (Firestore): `propiedades` (schema desde destilado R0 + los .xlsx FTI-01 del dueño — 2ª pasada pendiente del crítico R4), `solicitudes` (taxonomía R0), `disponibilidad` (corta estancia), `config`. Índices compuestos DECLARADOS de antemano (tope 200).

### 🌊 OLA 1 — MVP público (el portal que reemplaza la obra) · gate de salida: cutover DNS
Superficies (todas con mockup D2 aprobado):
1. **Home** (search-pill + categorías + zonas + trust).
2. **SERP** por operación (shell estático + isla client sobre JSON paginado; mapa split-view MapLibre con pins de precio; filtros chips; noindex).
3. **Ficha** (SSR + edge-cache + purga onWrite): galería-mosaico, doble-precio en arriendo, frescura visible + `priceHistory`, JSON-LD completo (B3/B4: RNT y matrícula visibles), og:image pre-generada, similares, CTA WhatsApp sin gating + agendar visita con slots.
4. **Landings SSG**: 13+ sectores (contenido editorial REAL por barrio — R1 op.9) + landings de intención; breadcrumb con conteos.
5. **Corta estancia SIN dinero** (gate B2 pendiente de abogado): búsqueda por fechas/huéspedes, calendario por propiedad, **solicitud de reserva → confirmación del anfitrión → coordinación por WhatsApp**. Campo RNT BLOQUEANTE en el alta de alojamiento + declaración PH (B3). El rail de pago entra en Ola 2 tras el gate.
6. **Publica tu propiedad**: wizard 3 pasos generoso (gratis, 15+ fotos, sin caducidad 90 días — R1 op.6), verificación humana → sello "Verificado por ALTORRA" (op.13 adelantada como proceso).
7. **Página de PRECIOS pública** (op.7 — diferenciador gratis; tarifas 2026 → pregunta 🔴 al dueño).
8. **Alertas** guardadas solo-email + digest diario (Resend 100/día — tope verificado).
9. **Rango ALTORRA + Rentímetro turístico** (landing multi-step contacto-primero; rangos manuales de 10 barrios v1; NUNCA llamarlo "avalúo" — B13).
10. **Admin v1** (SPA tras Auth): CRUD propiedades, cola de verificación, leads con SLA 5-min (proceso del dueño, R4), export.
11. SEO técnico: sitemaps segmentados regenerados por CI, 301 map listo para cutover, GSC.
12. **Leads**: colección `solicitudes` + scoring server-side (destilado R0) + notificación email/WhatsApp al admin.

### 🌊 OLA 2 — Dinero + arriendo digital (post-gate abogado B2/B9 + tarifas selladas)
1. **Booking con pago protegido Wompi** (diseño (a) del ADR §16: mandato + estados retenido/liberado/reversado + webhook idempotente + reversión art. 51). Skills `wompi-*` + `auditoria-financiera` (L-12: método ANTES de construir).
2. **Portal de aliados self-service** (op.11): precios públicos (ancla Proppit $200-300K/mes — nosotros por valor), panel de leads con trazabilidad (el listón de Fincaraíz OV es bajísimo), suscripción Wompi.
3. **Perfil de inquilino reutilizable 1→N** (QuintoAndar-criollo Fase 0: checklist documental + revisión humana SLA 24h; docs privados en Firebase Storage con B5).
4. Monetización particulares (destacados) — SOLO cuando haya liquidez de tráfico.
5. WhatsApp Business API (plantillas) si el volumen lo pide.

### 🌊 OLA 3 — Expansión (con el motor girando)
Garantía de arriendo con aseguradora local (B11, QuintoAndar-criollo Fase 1-2) · loop inversión→renta turística (op.14) · pagos recurrentes de canon + payout · tripwire de búsqueda → Typesense Cloud · Índice ALTORRA (data trimestral) · app propietarios.

## 4 · Protocolo de arranque para OPUS 4.8 (léelo tú, Opus, al asumir)

1. **Boot normal del cerebro** (§G.1: CLAUDE.md + 05 + 10) + skill `opus-interino-protocolo`. Este plan + los specs R1-R5 + `docs/42-LEGAL.md` son tu contexto de misión. NO re-investigues lo ya verificado.
2. **Empiezas por OLA 0 ítem 1** (scaffold `portal/`). Cada ítem: IAP §3.4 → mockup si es UI (carril D — NADA de UI sin mockup aprobado) → implementar → `verify` end-to-end en staging → commit específico + push (delegado) → 10 al día.
3. **Nunca**: tocar el flujo de dinero antes del gate B2/B9 · pedir reindexación a Google · publicar el nº personal del dueño · usar negro en la marca · `onSnapshot` público · comprometer un gasto sin el dueño.
4. **Tag `OPUS-4.8`** en cada commit. Al cerrar cada ola: consolidación §G.3 + aviso al dueño para el go/no-go + queda pendiente auditoría Fable (cuando su cuota vuelva).
5. Preguntas abiertas al dueño (no bloquean Ola 0 salvo lo marcado): 🔴 razón social/NIT definitiva · 🔴 tarifas 2026 · 🔴 dirección física (GBP) · adenda Gemini del stack (se integra como ADR §16-adenda cuando llegue).

## 5 · Gates del dueño (resumen de decisiones que solo Daniel toma)
Go/no-go de cada ola · elección D0 · cutover DNS (Hostinger→Cloudflare) · todo gasto (>$0) · contratación del abogado para la mesa B2/B9 + validación de textos legales · tarifas comerciales · mostrar la matrícula (certificado al final).
