# 🛠️ Inventario de Skills (catálogo del repo `skills/`)

> **Hoja de detalle** (no neurona) enlazada desde `40-LOBULOS-DOMINIO.md §Recursos
> Externos`. Catálogo completo de las skills que viven en `skills/` del repo, para
> consultar al disparar **Trigger 🔵 §G.2** ("¿qué skill tengo para X?"). On-demand:
> NO se auto-carga. Mantener al añadir/quitar/renombrar una skill (Reflejo de Frescura §G.4).
>
> **Sincronizado al SET CANÓNICO** (cars/bersaglio = 79 carpetas, incl. `caza-bugs`) el 2026-06-21 por el operador cars (62→79, emparejado ×4). Auditoría base del set: 2026-06-03.

---

## ⚠️ Verdad del wiring (leer primero — corrige un supuesto común)

`skills/` del repo **NO es la fuente** de las skills que Claude tiene cargadas en sesión.
Verificado el 2026-06-03 leyendo la config real:

- `~/.claude/settings.json` → **solo** habilita el plugin `superpowers@claude-plugins-official` (14 skills de proceso).
- `~/.claude/skills/` (user-level) → 7 skills de gobernanza. **Desde 2026-06-09 (ADR §171), las 4 portables (`crm-architect`, `legal-colombia`, `comite-expertos`, `arquitecto-software`) están VERSIONADAS en `skills/` del repo** (descontaminadas/domain-neutral, byte-idénticas en los 3 repos) → el repo es la fuente git-trackeada; se copian a `~/.claude/skills/` manualmente (no aparecen en el panel de personalización).
- **NO** existe `.claude/settings.json` de proyecto, ni `plugin.json`/`marketplace.json` en el repo, ni un plugin `anthropic-skills` instalado.
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

## 🧬 Proceso / Desarrollo (superpowers + dev)

> Las 14 de `superpowers` están **doble-disponibles** (`superpowers:` y `anthropic-skills:`).

| Skill (name) | Carpeta (si difiere) | Para qué | Disp. |
|---|---|---|---|
| `brainstorming` | | Explorar intención/requisitos ANTES de construir | ✅ |
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

---

## 🧰 Meta Claude Code (repo-only — NO instaladas)

| Skill (name) | Para qué | Disp. |
|---|---|---|
| `claude-automation-recommender` | Analiza el repo y recomienda automatizaciones de Claude Code (hooks/subagentes/skills/plugins/MCP). Read-only. | ⚠️ repo-only |
| `claude-md-improver` | Audita y mejora archivos CLAUDE.md contra plantillas. | ⚠️ repo-only |
| `session-report` | Genera reporte HTML de uso de sesiones Claude Code (tokens/cache/subagentes). | ⚠️ repo-only |

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

## ✅ Resumen de reconciliación

- **~82 skills usables** (✅) tienen contraparte instalada vía `Skill` (bundle `anthropic-skills:*` + plugin `superpowers:*` + `~/.claude/skills/crm-architect`).
- **6 repo-only** (⚠️, sin contraparte instalada): `claude-automation-recommender`, `claude-md-improver`, `session-report`, `code-simplifier`, `code-modernization`, `design-taste-frontend-v1`.
- **Anomalías**: 4/7 resueltas el 2026-06-03 (2 borradas + 2 renombradas); 3 quedan (2 = contenido real no-skill, 1 = bundles cosméticos).
- El cerebro ahora **mapea el 100%** del contenido de `skills/` (antes solo nombraba ~12 en ejemplos + 2 creadas).
| `auditoria-cerebro` (2026-06-09) | 🔬 Auditoría Nivel-2 del cerebro (sondas falsables: fidelidad/frescura/retrieval-drill/MEMORY.md; cierra con GC pareado + deepAudit). Nace del comité v6 (ADR §173 cars). Byte-idéntica ×3. |
