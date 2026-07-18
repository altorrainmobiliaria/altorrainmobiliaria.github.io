# 🛠️ Inventario de Skills (catálogo del repo `skills/`)

> **Hoja de detalle** (no neurona) enlazada desde `40-LOBULOS-DOMINIO.md §Recursos
> Externos`. Catálogo completo de las skills que viven en `skills/` del repo, para
> consultar al disparar **Trigger 🔵 §G.2** ("¿qué skill tengo para X?"). On-demand:
> NO se auto-carga. Mantener al añadir/quitar/renombrar una skill (Reflejo de Frescura §G.4).
>
> **Sincronizado al SET CANÓNICO** (cars/bersaglio) el 2026-06-21 por el operador cars. Auditoría base: 2026-06-03.
> **Re-auditado 2026-07-18** (ADR §33, workflow 4 agentes): conteos reales HOY = **94 carpetas en `skills/` del repo · 35 en `~/.claude/skills/`**; 7 user-level sin catalogar AÑADIDAS abajo; wiring re-verificado.

---

## ⚠️ Verdad del wiring (leer primero — corrige un supuesto común) — re-verificado 2026-07-18

`skills/` del repo **NO es la fuente** de las skills que Claude tiene cargadas en sesión (eso sigue siendo cierto).

- `~/.claude/settings.json` (user-level) → habilita **~190 plugins** de `claude-plugins-official` (ya NO "solo superpowers": firebase, code-review, session-report, code-modernization, code-simplifier, frontend-design y decenas más).
- `~/.claude/skills/` (user-level) → **35 skills** (gobernanza + portables + dominio + paquete Wompi + voces de marca). Las portables están VERSIONADAS en `skills/` del repo (fuente git-trackeada) y se copian a mano a `~/.claude/skills/` — **mantener la pareja en SYNC** (la auditoría 2026-07-18 cazó 5 gemelas derivadas: proceso-decision-fuerte con 109 líneas de atraso, validacion-live-chrome, meta-ads-diagnostico, optimizacion-rendimiento-web y el `onboarding-…-hub.md` AUSENTE en user-level — todas re-sincronizadas).
- `.claude/settings.json` **de proyecto SÍ existe** (318 chars, sin secretos): cablea el hook SessionStart → `brain-check.mjs --boot`. Versionado en el repo desde 2026-07-18 (G-04).
- El namespace `anthropic-skills:*` (~100 skills) que Claude ve es **bundle del entorno/build** (set oficial de Anthropic), independiente del repo.

**Conclusión**: el solape de nombres entre `skills/` (repo) y las skills cargadas es en gran
parte **coincidencia** (el cliente curó el repo a partir de esos mismos sets). El repo es un
**recurso de referencia paralelo** (como ya dice `40-LOBULOS §Recursos Externos`), NO el origen
de mis capacidades. Implicaciones:

- La mayoría de skills del repo **SÍ tienen contraparte usable** vía tool `Skill` (✅ abajo).
- **6 skills son "repo-only"** (⚠️): NO tengo contraparte instalada → invocarlas vía `Skill` fallaría; sirven como documentación/fuente.
- Las **anomalías estructurales** (🔧) NO romperían mi config (el repo no es la fuente), pero ensucian el repo y romperían la carga **si algún día** se cablea `skills/` como plugin.

**Leyenda Disp.**: ✅ contraparte instalada usable vía `Skill` · ⚠️ repo-only (no instalada) · 🔧 anomalía estructural (no carga tal cual).

---

## 🌐 Paquete de Visibilidad (propagado por el HUB Altorra Cars · ADR §244 cars · 2026-06-25)
> ✅ **ACTUALIZADO 2026-07-18 (ADR §33)** con los aprendizajes VERIFICADOS en producción de bersaglio
> (doc fuente: `bersaglio/docs/superpowers/specs/2026-07-17-aprendizajes-SEO-AEO-GEO-para-skills.md`):
> `Offer` sin `price` = INVÁLIDO (omitir offers, nunca PreOrder-sin-price) · `FAQPage` SIN rich result desde
> may-2026 (la FAQ es tarea de CONTENIDO visible) · `aggregateRating` SOLO reseñas propias on-site (las del GBP
> = self-serving prohibido) · "Solicitar indexación" = solo descubrimiento · CONTAR ≠ MUESTREAR · truco geo del
> GBP · patrón cáscara-noindex+horneada. Copias repo + user-level + `~/.claude/agents/seo-auditor.md` en SYNC.
> ⚠️ Las copias repo de **cars/bersaglio** quedaron atrás → las porta cada operador (doc fuente en bersaglio).
> 7 skills PORTABLES (vertical JewelryStore/AutoDealer/RealEstateAgent vía `tenant_config.json`) + agente
> `seo-auditor` (read-only), propagadas **byte-idénticas** desde el HUB (Altorra Cars). Arquitectura HUB
> **IoC + core-funciones-puras + D′ vendored**. La IMPLEMENTACIÓN en este sitio (tenant_config + templates +
> `visibility-core` + wiring) la hace la sesión de ESTE proyecto, con datos REALES del dueño (cero-demo).
> Onboarding/checklist → `skills/ssg-static-prerender/references/onboarding-nuevo-proyecto-al-hub.md`.
> Reglas: schema-en-HTML-del-build · cero-demo · status:published · slug inmutable · NAP maestro · Consent Mode v2.

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `ssg-static-prerender` | Hornear HTML real por ítem en el build (la BASE; lleva la arquitectura HUB + `tenant_config` + contrato IoC del core en `references/`). | ✅ |
| `semantic-schema-aeo` | Structured data por tipo de página + AEO (ser citado por IA; 20% código/80% off-page). FUSIÓN schema+answer-engine. | ✅ |
| `ga4-lead-tracking` | GA4 por LEAD (no purchase) + Consent Mode v2 (Ley 1581) + links WhatsApp trazables (dark-social). | ✅ |
| `maps-gbp-local` | Local pack #1 / GBP: 3 ejes + NAP maestro + LocalBusiness schema + reseñas reales + inventario en GBP. | ✅ |
| `search-console-setup-y-diagnostico` | Alta GSC + árbol de diagnóstico "no salgo en Google" + bucle mensual + API histórico. | ✅ |
| `product-feeds` | Feeds en el build por vertical (Merchant/Vehicle+Local Inventory/FincaRaíz-Metrocuadrado) — empujar catálogo. | ✅ |
| `image-pipeline` | WebP/AVIF + srcset + `width/height` (CWV) + `ImageObject` + alt real + EXIF geo opcional. NUNCA upscaling. | ✅ |
| `optimizacion-rendimiento-web` | **Playbook agéntico de rendimiento web** (medir→priorizar→implementar réplica-EXACTA→verificar LIVE→iterar por página): self-host fuentes+`unicode-range` · dieta JS · critical-path CSS · imágenes/LCP · SW/cache · diferir terceros. ORQUESTA las hermanas (SEO/imágenes/`validacion-live-chrome`/`caza-bugs`), no las duplica. VIVA (cada página enriquece el catálogo) + script `fetch-fonts.mjs`. Portable ×4. Origen §297 cars (self-host fonts → 0 req a Google, verif live). | ✅ repo+user |
| `seo-auditor` *(agente)* | Auditor read-only de visibilidad: verifica el HTML del build vs las reglas (schema-en-HTML, cero-demo, noindex, NAP, CWV). | ✅ agente |

---

## 🧬 Proceso / Desarrollo (superpowers + dev)

> Las 14 de `superpowers` están **doble-disponibles** (`superpowers:` y `anthropic-skills:`).

| Skill (name) | Carpeta (si difiere) | Para qué | Disp. |
|---|---|---|---|
| `brainstorming` | | Explorar intención/requisitos ANTES de construir | ✅ |
| `spec-kit` | | **Spec-Driven Development** (método GitHub spec-kit, MIT): idea→spec→clarify→plan→tasks→analyze→implement con [NEEDS CLARIFICATION]+constitución+test-first. Plantillas en `references/` + subagentes `spec-analyze`/`plan-auditor`. Para features NUEVAS no triviales. Global+repo (2026-06-25). | ✅ |
| `writing-plans` | | Escribir plan de implementación multi-paso | ✅ |
| `executing-plans` | | Ejecutar un plan con checkpoints de revisión | ✅ |
| `subagent-driven-development` | | Ejecutar plan con subagentes en la sesión | ✅ |
| `dispatching-parallel-agents` | | Despachar 2+ tareas independientes en paralelo | ✅ |
| `test-driven-development` | | TDD: test antes que implementación | ✅ |
| `systematic-debugging` | | Debug metódico ante bug/fallo/comportamiento raro | ✅ |
| `verification-before-completion` | | Verificar antes de declarar "hecho" | ✅ |
| `caza-bugs` | | **Reflejo al TOCAR/ROZAR** un subsistema con estado observable → recorrer su CAMINO VIVO end-to-end desde estado-cero (vacío→1 y N→vacío + recarga), no solo el diff; + escalada calibrada (N0 barato / N1 pesado). NO es `systematic-debugging` (bug ya visible) ni `verification-before-completion` (claim final). Portable. Origen ADR §90 bersaglio + W-10. | ✅ |
| `requesting-code-review` | | Pedir revisión de código | ✅ |
| `receiving-code-review` | | Recibir/aplicar feedback de revisión | ✅ |
| `finishing-a-development-branch` | | Cerrar una rama de desarrollo | ✅ |
| `using-git-worktrees` | | Trabajar con git worktrees aislados | ✅ |
| `using-superpowers` | | Cómo descubrir/usar skills (boot) | ✅ |
| `writing-skills` | | Escribir/editar skills | ✅ |
| `skill-creator` | tiene sub-dup `skill-creator/skill-creator/` | Crear/optimizar/evaluar skills | ✅ |
| `code-simplifier` | `code-simplifier/code-simplifier.md` | Simplificar código sin cambiar conducta (= subagente, NO SKILL.md) | ⚠️🔧 |
| `code-modernization` | `agents/`+`commands/` | Modernizar legacy (= PLUGIN de comandos/agentes, NO skill) | ⚠️🔧 |

---

## 🎨 Diseño / UX / Frontend

> El "taste bundle" vive **anidado** en `taste-skill-main/<sub>/SKILL.md` (14 skills en una carpeta).

| Skill (name) | Carpeta (si difiere) | Para qué | Disp. |
|---|---|---|---|
| `frontend-design` | | UI front-end production-grade, anti-genérico | ✅ |
| `impeccable` | | Diseñar/auditar/pulir interfaces (UX, jerarquía, motion) | ✅ |
| `emil-design-eng` | | Filosofía Emil Kowalski: pulido fino de UI | ✅ |
| `animate` | `animate-skill-main` | Animaciones/transiciones web (React/Next) | ✅ |
| `design-taste-frontend` | `taste-skill-main/taste-skill` | Anti-slop: landing/portfolio/redesign con gusto | ✅ |
| `design-taste-frontend-v1` | `taste-skill-main/taste-skill-v1` | Variante v1 del anterior | ⚠️ |
| `redesign-existing-projects` | `taste-skill-main/redesign-skill` | Elevar a premium sin romper funcionalidad | ✅ |
| `minimalist-ui` | `taste-skill-main/minimalist-skill` | Estética minimalista | ✅ |
| `industrial-brutalist-ui` | `taste-skill-main/brutalist-skill` | Estética brutalista industrial | ✅ |
| `high-end-visual-design` | `taste-skill-main/soft-skill` | Diseño visual high-end | ✅ |
| `brandkit` | `taste-skill-main/brandkit` | Brand boards / sistemas de identidad | ✅ |
| `stitch-design-taste` | `taste-skill-main/stitch-skill` | Gusto de diseño con Stitch | ✅ |
| `gpt-taste` | `taste-skill-main/gpt-tasteskill` | Criterio de diseño estilo GPT | ✅ |
| `image-to-code` | `taste-skill-main/image-to-code-skill` | Convertir imagen → código UI | ✅ |
| `imagegen-frontend-web` | `taste-skill-main/imagegen-frontend-web` | Generación de imágenes para front web | ✅ |
| `imagegen-frontend-mobile` | `taste-skill-main/imagegen-frontend-mobile` | Idem mobile | ✅ |
| `full-output-enforcement` | `taste-skill-main/output-skill` | Forzar salida completa (anti-truncado) | ✅ |
| `canvas-design-creative` | | Arte/posters/PDF/PNG por filosofía de diseño | ✅ |
| `accessibility-audit` | | **Creada en Altorra** (§48): framework WCAG 2.2 AA portable | ✅ |

---

## 🔍 SEO / Contenido / Arquitectura de sitio

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `seo-audit` | Auditoría SEO técnica/on-page | ✅ |
| `ai-seo` | Optimizar para motores de IA (AEO/GEO) | ✅ |
| `schema-markup` | Datos estructurados / rich snippets | ✅ |
| `programmatic-seo` | SEO programático a escala | ✅ |
| `site-architecture` | Arquitectura de información del sitio | ✅ |
| `content-strategy` | Estrategia de contenido / topic clusters | ✅ |
| `competitor-alternatives` | Páginas "vs"/alternativas (SEO+ventas) | ✅ |

---

## 📣 Marketing / Growth / Conversión (CRO)

| Skill (name) | Carpeta (si difiere) | Para qué | Disp. |
|---|---|---|---|
| `copywriting` | | Copy de páginas (hero, pricing, CTAs) | ✅ |
| `copy-editing` | | Editar/pulir copy existente | ✅ |
| `ad-creative` | | Creatividades/variaciones de anuncios | ✅ |
| `cold-email` | | Cold email B2B + secuencias | ✅ |
| `email-sequence` | | Secuencias de email lifecycle/warm | ✅ |
| `sales-enablement` | | Material de habilitación de ventas (decks, one-pagers, battlecards) | ✅ |
| `social-content` | | Contenido para redes | ✅ |
| `marketing-ideas` | | Ideación de marketing | ✅ |
| `marketing-psychology` | | Palancas psicológicas de marketing | ✅ |
| `community-marketing` | | Construir/crecer comunidad | ✅ |
| `launch-strategy` | | Estrategia de lanzamiento | ✅ |
| `lead-magnets` | | Imanes de leads | ✅ |
| `free-tool-strategy` | | Herramientas gratis como growth | ✅ |
| `referral-program` | | Programas de referidos | ✅ |
| `paid-ads` | | Estrategia/targeting de paid ads | ✅ |
| `pricing-strategy` | | Estrategia de precios | ✅ |
| `product-marketing-context` | | Contexto de product marketing | ✅ |
| `revops` | | Revenue operations | ✅ |
| `customer-research` | | Investigación de clientes / VOC / ICP | ✅ |
| `churn-prevention` | | Reducir churn / flujos de cancelación | ✅ |
| `ab-test-setup` | | Diseñar A/B tests y experimentación | ✅ |
| `analytics-tracking` | | Tracking/medición (GA4, eventos) | ✅ |
| `page-cro` | | CRO a nivel página | ✅ |
| `form-cro` | | CRO de formularios | ✅ |
| `popup-cro` | | CRO de popups | ✅ |
| `onboarding-cro` | | CRO de onboarding | ✅ |
| `signup-flow-cro` | | CRO del flujo de registro | ✅ |
| `paywall-upgrade-cro` | | CRO de paywall/upgrade in-app | ✅ |
| `ecommerce` | | Patrones de e-commerce | ✅ |

---

## 🌐 Investigación web / Firecrawl / Council

| Skill (name) | Carpeta (si difiere) | Para qué | Disp. |
|---|---|---|---|
| `firecrawl` | `firecrawl-cli` | Firecrawl CLI (raíz) | ✅ |
| `firecrawl-agent` | | Agente Firecrawl | ✅ |
| `firecrawl-crawl` | | Crawl de sitios | ✅ |
| `firecrawl-scrape` | | Scrape de páginas | ✅ |
| `firecrawl-search` | | Búsqueda web | ✅ |
| `firecrawl-map` | | Mapear URLs de un sitio | ✅ |
| `firecrawl-download` | | Descargar contenido | ✅ |
| `firecrawl-interact` | | Interacción con páginas | ✅ |
| `llm-council` | `claude-skills-llm-council-main` | Panel de varios LLMs para deliberar | ✅ |

---

## 🚗 Dominio Altorra / Asesoría

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `crm-architect` | **Framework de la reconstrucción del CRM** (Firebase+Firestore+Functions, verticales concesionario+inmobiliario, RBAC+Ley 1581). Universal multi-industria. **Versionada en `skills/`** (§171) + global + bundle. | ✅ repo+user |
| `legal-colombia` | Guardrail + método legal para negocios **colombianos** (fuentes `.gov.co`, gate abogado; bloquea plugins legales US). Portable. **Versionada en `skills/`** (§171). | ✅ repo+user |
| `comite-expertos` | Comité de expertos ×3 que mejora una respuesta (expertos por tema + peer-review anónimo + presidente; 2ª voz Gemini en Decisión Fuerte). Portable. **Versionada en `skills/`** (§171). | ✅ repo+user |
| `arquitecto-software` | Piensa como arquitecto ANTES de codear (6 lentes + IAP). Domain-neutral. **Versionada en `skills/`** (§171). | ✅ repo+user |
| `Asesor_Critico_Honesto` (`asesor-critico-honesto`) | Feedback crítico honesto sobre ideas/planes | ✅ |
| `proceso-decision-fuerte` | Pipeline Decisión Fuerte (verificar→comité→Gemini→verificar cada claim→veredicto→impl por fase) para lo caro de revertir. Portable. | ✅ |
| `validacion-live-chrome` | Validación LIVE post-merge vía extensión Claude-in-Chrome (Claude la maneja DIRECTO; 7 dimensiones adversariales). Portable. | ✅ |
| `anti-codigo-muerto` | Caza/cuarentena de código muerto/viejo (anti-Knight-Capital); gate `deadcode:check`. Portable. | ✅ |
| `meta-ads-diagnostico` | Diagnóstico de campañas Meta Ads (FB/IG). Portable. | ✅ |
| `catalogo-voz-altorra` | **SSoT de la voz escrita de Altorra** (web/pauta/redes/WhatsApp/Journal): esencia (calidez ownable + cobertura "donde otros no llegan" + prueba legal matrícula/RNT), reglas duras + checklist anti-IA + Test de Alma, aforismos, copy por superficie, plantillas por canal. Nace del comité ×capas (15 agentes) que reprobó el borrador de Gemini y reescribió en voz propia (2026-07-11). Versionada en `skills/` + user. **Voz ÚNICA, NO derivada de ninguna marca.** | ✅ repo+user |

---

## 🧰 Meta Claude Code

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `claude-automation-recommender` | Analiza el repo y recomienda automatizaciones de Claude Code (hooks/subagentes/skills/plugins/MCP). Read-only. | ✅ repo+user (instalada — corregido 2026-07-18) |
| `claude-md-improver` | Audita y mejora archivos CLAUDE.md contra plantillas. | ✅ repo+user (instalada — corregido 2026-07-18) |
| `session-report` | Genera reporte HTML de uso de sesiones Claude Code (tokens/cache/subagentes). | ✅ repo+user (instalada — corregido 2026-07-18) |

## 🏛️ Gobernanza / dominio user-level (catalogadas 2026-07-18 — antes AUSENTES del inventario, violación §G.4)

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `sinapsis-cerebros` | Enruta consultas a las lecciones de los cerebros HERMANOS (cars/bersaglio/insema) + payloads de import/constancias entre repos. ⚠️ Sus 4 payloads 2026-07-10 (liderazgo ×3 + import bersaglio) siguen SIN aplicar por los operadores destino. | ✅ user |
| `auditoria-financiera` | Auditoría forense de flujos de dinero anti-fugas (portable). | ✅ user |
| `cms-dinamico` | Patrones de CMS dinámico sobre Firestore (contenido editable sin deploy). | ✅ user |
| `pos-facturacion-retail` | Semántica POS real (anulación vs devolución, arqueo, DIAN). | ✅ user |
| `publicar-web-produccion` | Guía genérica de publicación a producción (dominio/DNS/SSL/checklist). | ✅ user |
| `opus-interino-protocolo` | Protocolo cuando el modelo activo NO es el titular (Opus interino). | ✅ user |
| `catalogo-voz-bersaglio` | ⚠️ **Voz de OTRA marca (Bersaglio Jewelry) — JAMÁS aplicar a Altorra** (la voz Altorra = `catalogo-voz-altorra`). Instalada user-level por ser compartida entre proyectos. | ✅ user |

### 🕳️ Huérfana detectada (2026-07-18 — decisión del dueño pendiente, TODO-30)
`.agents/skills/marketing-psicologico-conversion/SKILL.md` (untracked, creada 2026-07-12 21:16, 11 min antes del
`Brief_Diseño_Piezas_Captacion.docx` — misma tarea de piezas de captación; convención `.agents/` de una herramienta
ajena al cerebro). Masterclass de psicología de conversión para piezas de captación inmobiliaria con la paleta
Altorra hardcodeada. NO duplica `marketing-psychology` (genérica, inglés). ⚠️ Su tono agresivo de dolor choca con
`catalogo-voz-altorra`. Hoy es INERTE (ni el tool Skill ni el cerebro la ven). Opciones: adoptarla (mover a
`skills/` + filtro de voz) o cuarentenar en `_legacy/`. NO borrar (límite de guardián).

---

## 🔧 Carpetas en `skills/` que NO son skills (anomalías a resolver)

> **✅ Limpieza 2026-06-03**: resueltas 4 de 7. Quedan 3 (contenido real / cosmético — ver Estado).

| Carpeta | Diagnóstico | Estado |
|---|---|---|
| ~~`accessibility-audit-workspace/`~~ | Artefacto residual del eval de `skill-creator` (solo `trigger-eval.json`) | ✅ **BORRADA** |
| ~~`example-plugin/`~~ | Plantilla de ejemplo (no real) | ✅ **BORRADA** |
| ~~`ecommerce skills/`~~ | Espacio en el nombre → rompía loaders | ✅ **RENOMBRADA** → `ecommerce/` |
| ~~`SKILL-canvas-design/`~~ | Archivo mal nombrado (loader busca `SKILL.md`) | ✅ **RENOMBRADA** → `canvas-design-creative/SKILL.md` |
| `code-modernization/` | Es un PLUGIN (commands/agents), no una skill | ⏳ **NO tocada** — contenido real (límite de guardián: no borrar). Reclasificar si se decide. |
| `code-simplifier/` | Def de SUBAGENTE (`model: opus`), no `SKILL.md` | ⏳ **NO tocada** — contenido real. Reubicar a agentes si se decide. |
| `taste-skill-main/`, `animate-skill-main/`, `claude-skills-llm-council-main/` | Bundles `-main`: carpeta ≠ `name` canónico | ⏳ **cosmético** (skip: renombrarlos ensucia el commit con 100+ paths; el `name:` interno es lo que carga) |

> **Nota de impacto**: como `skills/` del repo NO está cableado como fuente de mis skills,
> estas anomalías **no degradan** mi capacidad actual — son higiene de repo + a prueba de futuro.

---

## ✅ Resumen de reconciliación (actualizado 2026-07-18, ADR §33)

- **94 carpetas** en `skills/` del repo · **35 skills** en `~/.claude/skills/` — TODAS mapeadas en este inventario
  (las 94 repo-side ya lo estaban; las 7 user-level faltantes se catalogaron arriba).
- **Repo-only real**: solo `design-taste-frontend-v1`. `code-simplifier`/`code-modernization` quedaron cubiertas
  por sus **plugins oficiales** habilitados (la carpeta del repo sigue siendo anomalía estructural 🔧).
- **Anomalías**: 4/7 resueltas el 2026-06-03; 3 quedan (2 = contenido real no-skill, 1 = bundles cosméticos).
- **Regla de mantenimiento aprendida (2026-07-18)**: al editar una skill portable, editar **AMBAS copias**
  (repo + user-level) o sincronizar por copia — la deriva de gemelas fue el hallazgo más repetido de la auditoría.
| `auditoria-cerebro` (2026-06-09) | 🔬 Auditoría Nivel-2 del cerebro (sondas falsables: fidelidad/frescura/retrieval-drill/MEMORY.md; cierra con GC pareado + deepAudit). Nace del comité v6 (ADR §173 cars). Byte-idéntica ×3. | ✅ repo+user |

---

## 💳 Wompi Colombia API v1 — paquete externo (instalado 2026-06-26)

Paquete desarrollado por el dueño (Antigravity) para integraciones de pago Wompi Colombia API v1. Auditado por workflow de 63 agentes (KB de 30 módulos). Instalado global (`~/.claude/skills/` + `~/.claude/agents/`) y versionado en `skills/wompi-colombia-api-v1/` (paquete completo: `plugin/` + agentes + `WAKB/` 30 módulos + `references/`). Uso futuro: **suscripciones en Altorra Cars**; en uso en Bersaglio.

| Skill / Agente | Tipo | Qué hace |
|---|---|---|
| `wompi-colombia-api-v1` | skill maestro | Integración completa API v1 (tarjetas, PSE, Nequi, efectivo) |
| `wompi-api-core` | skill | Núcleo transaccional (transacciones, fuentes de pago, tokens) |
| `wompi-webhooks-validator` | skill | Validación criptográfica (SHA-256) + idempotencia de webhooks |
| `wompi_support_agent` | agente | Diagnóstico errores HTTP/transaccionales (401/404/422, DECLINED, webhooks) |
| `wompi_qa_agent` | agente | Planes de prueba + edge cases (idempotencia, doble-gasto, firma falsa) |
