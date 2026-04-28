# PLAN-MEJORAS.md — Altorra Inmobiliaria

> **Plan activo de mejoras.** Documento vivo. Se actualiza con cada micro-fase.
> Última actualización: 2026-04-16
> Rama de trabajo: `claude/analyze-competitor-features-ilXY4`

---

## 0. PROPÓSITO DE ESTE DOCUMENTO

Este es el **plan de mejoras activo** del portal. Complementa a:

- `CLAUDE.md` — constitución del proyecto (reglas, schema, paleta).
- `ALTORRACARSCLAUDE.md` — referencia arquitectónica de Altorra Cars.
- `AVANCES.md` — bitácora append-only de micro-fases completadas.
- `DEPLOY-RUNBOOK.md` — pasos del dueño para desplegar Firebase.

**Cuando entres a una sesión nueva, lee este archivo primero** para saber qué sigue.

---

## 1. CONTEXTO COMPETITIVO

### 1.1 Posición actual según IA

En búsquedas tipo "mejores inmobiliarias de Cartagena" en ChatGPT:
- **#1** en varias búsquedas (el competidor #2 es Altis Group).
- **#2** en otras (el #1 suele ser una inmobiliaria con +50 años + blog + SEO trabajado).

### 1.2 Diagnóstico para saltar a #1 definitivo

Dos frentes complementarios:

**Frente A — Superar a Altis (cuando somos #1):**
- Marca aspiracional + inversión inteligente.
- Especialización en inversión (ROI, Airbnb, valorización).
- Internacionalización (EN, US/CA/ES).
- Máquina de leads (CRM + nurturing + WhatsApp tracking).
- Nicho definido (Airbnb / lujo / sobre planos).

**Frente B — Superar a Inmobiliaria Cartagena (cuando somos #2):**
- Blog estratégico (50+ artículos, 2-3/semana).
- Landing pages por intención ("Comprar apto en Cartagena", "Invertir en Barú").
- SEO técnico (speed, schema, titles optimizados).
- Contenido de autoridad (estudios, guías, análisis).
- Optimización para IA (Q&A estructurado, autoridad temática).
- Backlinks + Google Business + YouTube.

**Los dos frentes se cruzan** en: contenido útil + SEO técnico + sistemas de lead.

### 1.3 Auditoría vs Altorra Cars (referencia)

Cars ya tiene lo que Inmobiliaria necesita a nivel técnico:
- Hero con autocomplete inteligente (Levenshtein + recientes + "/" shortcut).
- Trust bar con stats en vivo.
- Featured Week Banner con arrows/dots.
- Modal wizard 3 pasos con country selector (10 países).
- Página de búsqueda con filtros colapsables + sort + chips.
- CRM básico en admin.
- Cloud Functions para email.
- Generación SEO por Actions.

El código ya existe en nuestro repo (database.js, cache-manager.js, featured-week-banner.js, etc.), **falta activarlo y pulirlo**.

---

## 2. ESTRUCTURA DE BLOQUES

El plan se organiza en **5 bloques** paralelizables:

| Bloque | Foco | Objetivo |
|--------|------|----------|
| **A** | Paridad con Cars | Home + búsqueda al nivel de Cars |
| **B** | Inteligencia y conversión | Comparador, historial, similares, wizard, simulador |
| **C** | Posicionamiento "Altis-killer" | Marca premium + inversión + internacional |
| **D** | Máquina de leads | CRM + nurturing + WhatsApp tracking + dashboard |
| **E** | Autoridad SEO e IA | Blog + landings + schema + backlinks + contenido |

**Principio guía:** 1 micro-fase = 1 commit pequeño (1-3 archivos), testeable solo.

---

## 3. RUTA CRÍTICA Y ORDEN

```
FASE 0 (ya hecha)  → Firebase config, Firestore reglas, código base
FASE 1 (activa)    → Bloque A (paridad Cars) + Bloque E en paralelo
FASE 2             → Bloque B (inteligencia) + seguir con E
FASE 3             → Bloque C (Altis-killer)
FASE 4             → Bloque D (máquina de leads completo)
```

**Por qué empezar por A y E en paralelo:**
- A es visible y de alto impacto UX (valida el pipeline Firebase).
- E es el frente SEO/IA que toma más tiempo en dar frutos — mientras antes se empiece, mejor.

---

## 4. BLOQUE A — PARIDAD CON CARS

### A1 — Hero search inteligente

| # | Micro-fase | Estado | Commit |
|---|-----------|--------|--------|
| A1a | Búsquedas recientes + atajo "/" | ✅ DONE | `2ca4d44` |
| A1b | Agrupación por barrio/tipo con contador | ✅ DONE | `606be98` |
| A1c | ARIA completa + indicador fuzzy "~" | ✅ DONE | `67fac1f` |

**Archivos:** `js/smart-search.js`, `index.html`, `style.css`.

### A2 — Trust bar con stats en vivo

| # | Micro-fase | Estado |
|---|-----------|--------|
| A2 | 2 stats dinámicos (propiedades, ciudades) + 1 fijo con icono | ✅ DONE (`bc11aa9`) |

**IDs:** `#trustStatPropiedades`, `#trustStatCiudades`.
**Archivos:** `index.html`, `js/database.js` (getter de stats).

### A3 — Featured Week Banner activo

| # | Micro-fase | Estado |
|---|-----------|--------|
| A3 | Arrows + dots + auto-rotación (patrón `#fw-*` de Cars) | ✅ DONE (`072ed3a`) |

**IDs:** `#fw-banner`, `#fw-track`, `#fw-dots`, `#fw-prev`, `#fw-next`, `#fw-live`.
**Archivos:** `index.html`, `js/featured-week-banner.js`, `style.css`.

### A4 — Carrusel "Recién publicadas" unificado

| # | Micro-fase | Estado |
|---|-----------|--------|
| A4 | Un solo carrusel con las últimas N propiedades | ✅ DONE `e8fda09` |

**Archivos:** `index.html`, `scripts.js`, `style.css`.

### A5 — Sección "Categorías" visuales

| # | Micro-fase | Estado |
|---|-----------|--------|
| A5 | Grid de tarjetas: Apartamento, Casa, Lote, Oficina, Local, Bodega | ✅ DONE `ca139db` |

**Archivos:** `index.html`, `style.css` (SVG inline, sin imágenes externas).

### A6 — Sección "Barrios premium"

| # | Micro-fase | Estado |
|---|-----------|--------|
| A6 | Bocagrande, Manga, Castillogrande, Centro Histórico, Crespo, Manzanillo | ✅ DONE `61dbd8a` |

**Archivos:** `index.html`, `style.css` (sin JS, enlaces con `?search=`).

### A7 — Testimonials desde Firestore

| # | Micro-fase | Estado |
|---|-----------|--------|
| A7 | Sección testimonios visible + contenedor #google-reviews | ✅ DONE `14c3450` |

**Archivos:** `index.html`, `style.css` (JS ya existía en `scripts.js` sección #2).

### A8 — Página `busqueda.html` avanzada

| # | Micro-fase | Estado |
|---|-----------|--------|
| A8 | Filtros colapsables + sort + chips activos + contador | ✅ DONE `f88102e` |

**Archivos:** `busqueda.html` (nuevo), `js/listado-propiedades.js`.

### A9 — Ordenamiento + paginación + searchTermBanner

| # | Micro-fase | Estado |
|---|-----------|--------|
| A9 | Sort dropdown + paginación + banner "Resultados para: × " | ✅ DONE `f88102e` |

### A10 — Promo banner editable desde admin

| # | Micro-fase | Estado |
|---|-----------|--------|
| A10 | `config/promo` editable + render en home | ✅ DONE `7e45b05` |

### A11 — Sección "Todo en un lugar" (3 columnas)

| # | Micro-fase | Estado |
|---|-----------|--------|
| A11 | Comprar / Arrendar / Invertir con CTAs | ✅ DONE (`322513c`) |

### A12 — CTA "Publica tu propiedad" que abre wizard

| # | Micro-fase | Estado |
|---|-----------|--------|
| A12 | Wrapper del wizard de B4 con flujo "publicar" | ✅ DONE |

---

## 5. BLOQUE B — INTELIGENCIA Y CONVERSIÓN

| # | Micro-fase | Estado |
|---|-----------|--------|
| B1 | Activar comparador de propiedades (JS ya existe) | ✅ DONE |
| B2 | Historial de visitas en home y detalle | ✅ DONE (ya integrado) |
| B3 | "Propiedades similares" en detalle (barrio+tipo+precio±20%) | ✅ DONE |
| B4 | Modal wizard 3 pasos "Agenda visita" (patrón Cars) | ✅ DONE |
| B5 | Selector multi-país en formularios (10 países Cars) | ✅ DONE |
| B6 | Simulador hipotecario: gráfica amortización + export PDF | ✅ DONE |
| B7 | Lead scoring automático en Cloud Function onNewSolicitud | ✅ DONE |

---

## 6. BLOQUE C — ALTIS-KILLER (marca premium + inversión + internacional)

| # | Micro-fase | Estado |
|---|-----------|--------|
| C1 | Rediseño hero premium (overlay + ambient + partículas + badge) | ✅ DONE |
| C2 | Página `invertir.html` con ROI por zona + cases | ✅ DONE |
| C3 | Calculadora rentabilidad Airbnb (ocupación × tarifa × gastos) | ✅ DONE |
| C4 | Landing `renta-turistica.html` dedicada | ✅ DONE |
| C5 | Badges premium en cards ("ROI %", "Ocupación %") | ✅ DONE |
| C6 | i18n inglés con toggle ES/EN | ✅ DONE |
| C7 | Página `foreign-investors.html` (US/CA/ES) + FAQ fiscal | ✅ DONE |
| C8 | Sección "Propiedades exclusivas" (prioridad ≥ 90) | ✅ DONE |

---

## 7. BLOQUE D — MÁQUINA DE LEADS

| # | Micro-fase | Estado |
|---|-----------|--------|
| D1 | CRM Kanban en admin (nuevo → contactado → visita → cierre) | ✅ DONE |
| D2 | Nurturing email: secuencia 5 correos por tipo de solicitud | ✅ DONE |
| D3 | WhatsApp tracking con UTM + logging en Firestore analytics | ✅ DONE |
| D4 | Blog inversionista (seed 3 posts) | ✅ DONE |
| D5 | Newsletter funcional con plantillas | ✅ DONE |
| D6 | Dashboard analytics en admin (views, leads, conversión) | ✅ DONE |

---

## 8. BLOQUE E — AUTORIDAD SEO E IA

### E1 — SEO técnico base

| # | Micro-fase | Estado |
|---|-----------|--------|
| E1.1 | Meta titles + descriptions optimizados (todas las *.html) | ✅ DONE `ee38585` |
| E1.2 | Canonical + og/twitter tags consistentes | ✅ DONE `ee38585` |
| E1.3 | JSON-LD: RealEstateAgent + LocalBusiness + BreadcrumbList | ✅ DONE `786a3af` |
| E1.4 | Sitemap.xml dinámico (desde Firestore) | ✅ DONE |
| E1.5 | Performance: preload LCP + lazy loading + compresión | ✅ DONE |

### E2 — Landing pages por intención

| # | Micro-fase | Estado |
|---|-----------|--------|
| E2.1 | "Comprar apartamento en Cartagena" (Bocagrande/Manga/Castillogrande) | ✅ DONE |
| E2.2 | "Arrendar apartamento en Cartagena" por barrio | ✅ DONE |
| E2.3 | "Invertir en Cartagena" (Airbnb + renta turística) | ✅ DONE |
| E2.4 | "Propiedades en Barú" / "Propiedades en La Boquilla" | ✅ DONE |
| E2.5 | "Lotes campestres Cartagena" (competir contra Altis) | ✅ DONE |

**Meta: 20-30 landings SEO en 3 meses.**

### E3 — Blog estratégico

| # | Micro-fase | Estado |
|---|-----------|--------|
| E3.1 | Estructura `blog.html` + `blog-post.html` + colección `blog` | ✅ DONE |
| E3.2 | Seed: "¿Vale la pena invertir en Cartagena 2026?" | ✅ DONE |
| E3.3 | Seed: "Mejores zonas para Airbnb en Cartagena" | ✅ DONE |
| E3.4 | Seed: "Impuestos inmobiliarios Colombia: guía 2026" | ✅ DONE |
| E3.5 | Plantilla editorial + calendario de publicación (2-3/semana) | ✅ DONE |

**Meta: 50+ artículos en 6 meses.**

### E4 — Autoridad temática / contenido IA

| # | Micro-fase | Estado |
|---|-----------|--------|
| E4.1 | FAQ estructurado por sección (JSON-LD FAQPage) | ✅ DONE |
| E4.2 | Guías descargables ("Guía del inversionista 2026") — lead magnet | ✅ DONE |
| E4.3 | Página "Estudios de mercado" (valorización por zona) | ✅ DONE |
| E4.4 | Glosario inmobiliario (long-tail SEO + Q&A IA) | ✅ DONE |

### E5 — Off-page

| # | Micro-fase | Estado |
|---|-----------|--------|
| E5.1 | LocalBusiness JSON-LD enriquecido (sync con Google Business) | ✅ DONE |
| E5.2 | Sala de prensa con kit descargable + embed badge | ✅ DONE |
| E5.3 | Hub de videos con `CollectionPage` JSON-LD | ✅ DONE |

### F1 — Reorganización home y fundamento

| # | Micro-fase | Estado |
|---|-----------|--------|
| F1.1 | Reorganizar secciones del index + fix meta/OG/hreflang | ✅ DONE |
| F1.2 | Bloque "Recursos del inversionista" (4 cards en home) | ✅ DONE |
| F1.3 | FAQ home + JSON-LD FAQPage | ✅ DONE |
| F1.4 | Bloque foreign investors EN | ✅ DONE |
| F1.5 | JSON-LD WebSite + SearchAction global | ✅ DONE |

### F2 — Performance / Core Web Vitals

| # | Micro-fase | Estado |
|---|-----------|--------|
| F2.1 | Fix LCP/CLS/INP (i18n defer, CSS al head) | ✅ DONE |
| F2.2 | Lazy-load 9 scripts via requestIdleCallback | ✅ DONE |
| F2.3 | Verificar lazy loading en imágenes dinámicas | ✅ DONE |
| F2.4 | Service Worker precache + version bump | ✅ DONE |

### F3 — UX / Accesibilidad

| # | Micro-fase | Estado |
|---|-----------|--------|
| F3.1 | Auditoría accesibilidad (contraste, ARIA, focus) | ✅ DONE |
| F3.2 | Navegación móvil — menú hamburguesa accesible | ✅ DONE |

### F4 — Datos y precisión

| # | Micro-fase | Estado |
|---|-----------|--------|
| F4.1 | Verificar precios, ROI, fechas de propiedades reales vs documentación | ✅ DONE |
| F4.2 | Fact-check de números en guía 2026 / estudio mercado / glosario | ✅ DONE |
| F4.3 | Actualizar redes sociales y datos de contacto consistentes en todo el sitio | ✅ DONE |

### F5 — Funcionalidad nueva

| # | Micro-fase | Estado |
|---|-----------|--------|
| F5.1 | Comparador de propiedades (2-3 lado a lado) | ✅ DONE (pre-existente) |
| F5.2 | Mapa interactivo de propiedades (Leaflet/MapLibre) | ✅ DONE (pre-existente) |
| F5.3 | Simulador hipotecario mejorado (UVR, fija, plazo) | ✅ DONE (pre-existente) |
| F5.4 | "Propiedades similares" en detalle | ✅ DONE (pre-existente) |

### F6 — Móvil / Touch

| # | Micro-fase | Estado |
|---|-----------|--------|
| F6.1 | Revisión móvil-first de cada página clave | ✅ DONE |
| F6.2 | Touch gestures en carruseles (swipe nativo + indicadores) | ✅ DONE |

### F7 — Conversión

| # | Micro-fase | Estado |
|---|-----------|--------|
| F7.1 | Optimizar formularios (validación inline, autosave) | ✅ DONE (pre-existente) |
| F7.2 | Exit-intent popup con lead magnet (guía 2026) | ✅ DONE |

### F8 — Mantenimiento técnico

| # | Micro-fase | Estado |
|---|-----------|--------|
| F8.1 | Eliminar código muerto (scripts no usados, CSS no aplicado) | ✅ DONE |
| F8.2 | Consolidar utilidades (AltorraUtils) | ✅ DONE |
| F8.3 | Limpieza adicional: render.js + push-notifications.js | ✅ DONE |

### G — Navegación, descubribilidad y cross-linking

| # | Micro-fase | Estado |
|---|-----------|--------|
| G1 | Menú Inversión en header + herramientas en footer + tools section en index | ✅ DONE |
| G2 | Cross-link bars en 5 páginas clave + og:image en 3 blog posts | ✅ DONE |
| G3 | Cross-link bars en contacto + invertir | ✅ DONE |

---

## 9. PROGRESO

### 9.1 Sprint actual

**Sprint 2 (activo):** Bloque G — navegación y cross-linking.

### 9.2 Completadas

| Fecha | Fase | Commit | Notas |
|-------|------|--------|-------|
| 2026-04-16 | A1a | `2ca4d44` | Recientes en localStorage + atajo "/" |
| 2026-04-16 | A1b | `606be98` | Sugerencias agrupadas barrio/tipo/ciudad con contador |
| 2026-04-16 | A1c | `67fac1f` | ARIA combobox + indicador fuzzy "~" en typo-match |
| 2026-04-16 | A2  | `bc11aa9` | Trust bar con stats en vivo (propiedades/ciudades) |
| 2026-04-16 | A3  | `072ed3a` | Featured Week Banner como carrusel top-3 con auto-rotación |
| 2026-04-16 | A11 | `322513c` | Sección "Todo en un lugar" 3 columnas CTA |
| 2026-04-17 | A4  | `e8fda09` | Carrusel "Recién publicadas" unificado con chips |
| 2026-04-17 | A5  | `ca139db` | Grid "Explora por tipo" con 6 categorías SVG |
| 2026-04-17 | A6  | `61dbd8a` | Barrios premium: 6 zonas de Cartagena |
| 2026-04-17 | A7  | `14c3450` | Testimonios con rating bar + contenedor reviews |
| 2026-04-17 | E1.1+E1.2 | `ee38585` | Meta tags, canonical y OG en 9 páginas |
| 2026-04-17 | E1.3 | `786a3af` | JSON-LD RealEstateAgent + LocalBusiness + BreadcrumbList |
| 2026-04-17 | A8+A9 | `f88102e` | busqueda.html unificada + chips activos + banner |
| 2026-04-17 | A10 | `7e45b05` | Promo banner Firestore config/promo + dismiss |

### 9.3 Siguiente

**Bloques A-G + F8 completados.** Todo el plan está implementado. Posibles siguientes pasos:
- Nuevas landing pages SEO (más barrios, más ciudades).
- Optimización de Core Web Vitals con Lighthouse audit.
- Migración Firebase (Etapa 0-1 del CLAUDE.md).

---

## 10. CONVENCIONES DE TRABAJO

1. **1 micro-fase = 1 commit** en la rama de trabajo.
2. **Nombres de commit:** `feat(area): X.Y — descripción corta`.
3. **Antes de push:** `/security-review` en la rama.
4. **Después de escribir:** `/simplify` para quitar over-engineering.
5. **Si una micro-fase crece a >3 archivos:** partir en dos sobre la marcha.
6. **Nunca abrir PR** sin permiso explícito del dueño.
7. **Respetar `CLAUDE.md`:** no cambiar `--gold`/`--accent`, sin frameworks, `limit()` en queries, caché local primero.
8. **Al cerrar una micro-fase:** actualizar este archivo (estado ✅ DONE + commit) y `AVANCES.md` (entrada append).
9. **Al abrir sesión nueva:** leer `PLAN-MEJORAS.md` § 9.3 "Siguiente".

---

## 11. LEYENDA DE ESTADOS

- ✅ **DONE** — Implementado, commiteado.
- 🟡 **IN PROGRESS** — Se está trabajando ahora.
- ⏭️ **NEXT** — La siguiente micro-fase a abordar.
- 🔲 **TODO** — Pendiente en el backlog.
- 🚫 **BLOCKED** — Requiere acción del dueño (ver `DEPLOY-RUNBOOK.md`).

---

*Fin de PLAN-MEJORAS.md — v1.0 (2026-04-16)*
