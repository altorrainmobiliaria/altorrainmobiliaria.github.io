# 🗂️ 00 — ÍNDICE SINÁPTICO (Altorra Inmobiliaria)

> Dos capas: (1) **enrutamiento semántico** (síntoma/tema → neurona) para no escanear el cerebro;
> (2) **mapa § → línea** del `99-HISTORIAL` para leerlo por offset (regla de oro anti-saturación, §0).
> ⚠️ Las líneas son **pistas** (pueden desincronizarse). `npm run brain:check` valida el desync.
> 🛡️ **`npm run brain:index` AUTO-RECONCILIA la columna Línea** desde los headers de `99` (cura el drift; guardián de cars TODO-32/§14). 🪦 **Tombstone**: `> ⛔ REEMPLAZADO POR §M` bajo un ADR superado = NO lo apliques, ve a §M (el guardián valida que §M exista).

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona)

| Si necesitas… | Ve a |
|---|---|
| Decisión Fuerte / auditoría / revisión / diseño-UI no trivial (¿aplico el flujo del dueño?) | 🔁 `60-WORKFLOWS` **W-11** (COMPLETO o nada + 3 artefactos: mockup·prompt-Gemini·prompt-Chrome) + skill `proceso-decision-fuerte` |
| Diseño YA sellado del portal (paleta/superficies/tipografía/glass/neumorfismo · retrieval, NO re-decidir) | `99 §23` (D1 dual-mode · Cormorant/Hanken · paleta oficial) + `portal/src/styles/tokens.css` (SSoT) |
| Identidad, stack, reglas absolutas, gobernanza | `CLAUDE.md` |
| Estado actual (build/cache/branch/flags) | `05-ESTADO-GLOBAL` |
| ¿Está desplegado? / antes de afirmar qué hay en PRODUCCIÓN / "ya pusheé" | `git fetch` + `git log origin/main` SIEMPRE; el `05` se auto-marca "no re-verificado" → NO autoritativo sin git real (§3.3) |
| En qué se está trabajando / pendientes (TODO-NN) | `10-MEMORIA-CORTO-PLAZO` |
| Dónde vive un componente, flujo, **schema Firestore**, blog | `20-MEMORIA-ESPACIAL` |
| Un bug/síntoma que "te suena", receta, gotcha | `30-LECCIONES` |
| Project ID, cuentas IAM, deploy, secrets | `50-CONFIG-INFRA` |
| Competencia/mercado inmobiliario, benchmark | `40-LOBULOS` → `41-MERCADO` |
| Legal Colombia: Ley 820/RNT/Habeas Data/pagos/firma/SIC — gates de features y agenda abogado | `40-LOBULOS` → `42-LEGAL` (detalle: `specs/R3-LEGAL-COLOMBIA-2026-07.md`) |
| El "por qué" de una decisión / detalle histórico | este índice → `99-HISTORIAL` (offset) |
| Decisión cara de revertir (2ª opinión externa) | `15-CONSEJO-EXTERNO` |
| "No se actualiza el sitio tras editar admin" (⚰️ LEGACY — sitio viejo retirado, NO aplica al portal) | `30 L-06` (cache `system/meta` → onSnapshot) |
| "Access denied / permission-denied al login" | `30 L-01`/`L-02` |
| Deploy de Cloud Functions falla (Eventarc) | `30 L-07` + `50-CONFIG-INFRA` |
| smart-search / hero / replicar patrón de cars | `99 §10` (§12 rescatado) |

---

## 📚 Mapa de ADRs § → línea (99-HISTORIAL)

> `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.

| § | Tema | Línea |
|---|---|---|
| §01 | Etapa 0: Firebase + primer admin (0-C Eventarc) | 12 |
| §02 | Etapas 1-3: frontend dinámico + forms + admin SPA | 18 |
| §03 | Catálogo 100% Firestore (data.json eliminado) | 22 |
| §04 | Etapas 4-8: Storage/SEO/favoritos/analytics/comercial | 27 |
| §05 | Bloques A-D: features confianza/conversión | 32 |
| §06 | SEO E1-E5 + landings de sector | 38 |
| §07 | Bloques F-I: perf/UX/nav + expansión SEO | 42 |
| §08 | Auditoría profunda 2026-05-04 (gaps J1-J5) | 47 |
| §09 | Mega-Plan Fases 1-12 + FAQs masivas | 52 |
| §10 | §12 rescatado: smart-search + referencia Cars 1:1 | 58 |
| §11 | Instalación del cerebro neuronal (2026-06-09) | 80 |
| §12 | Auditoría Nivel-2 #1 REAL (mata la fachada del deepAudit) | 92 |
| §13 | Consejo Externo: corrección factual "el provider (Antigravity) SÍ ve el repo, solo-lectura" + skill comité ×4. Propagación de cars §224. ⟦OPUS-4.8⟧ | 100 |
| §14 | Guardián del índice `brain-index.mjs`: auto-reconcilia §→línea + valida tombstones (de cars TODO-32/§229). ⟦OPUS-4.8⟧ | 104 |
| §15 | **Arranque Fable 5**: misión GREENFIELD (specs madre en `specs/`) + liderazgo kernel ×4 asumido + MODO OBRA live (mantenimiento + 65 redirects + SW v5 kill-switch). Obsoleta TODO-01..06/08 del sitio viejo. ⟦FABLE-5⟧ | 114 |
| §16 | **STACK sellado** (W-11 COMPLETO): Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre+Typesense-tripwire+Resend. Fallos Q1-Q7 + adenda Gemini (integrada: 4 adopciones, veto-Firestore refutado) → `specs/R5-STACK-2026-07.md`. ⟦FABLE-5⟧ | 128 |
| §17 | **MEGA-PLAN por olas** (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT del roadmap) + relevo a Opus 4.8 (protocolo §4 del plan; Fable audita por ola). ⟦FABLE-5⟧ | 138 |
| §18 | **Programa R0-R5 COMPLETO en un día** (~74 agentes · 6 workflows · live) + cierre de la sesión de planificación Fable; colas menores absorbidas por el plan. ⟦FABLE-5⟧ | 145 |
| §19 | **Ola 0.1 scaffold** del portal (Astro 7 + @astrojs/cloudflare v14 + Workers Static Assets): híbrido `output:server` (index estático + `/api/health` SSR), capa de datos FINA, CI gated. Verificado build/dry-run/dev-live + revisión ×4 lentes. Gotcha: `main` = entrypoint unificado (→ L-14). ⟦OPUS-4.8⟧ | 152 |
| §20 | **Repaso estratégico del plan con Fable 5** (auditoría final pre-ejecución, dueño al 6% de cuota): Opus armó el dossier de todo el corpus (7 lectores + 2ª pasada FTI-01), Fable ratificó/corrigió + 12 omisiones. Correcciones: abogado partido en 2 (toque i gatea cutover) · DIAN/Wompi a Ola 1 · plumbing Wompi tras concepto · candado 1B→Ola 2 · continuidad DNS/email (O1). SSoT ejecución → `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md`. 2 ediciones de kernel pre-aprobadas. ⟦OPUS-4.8+FABLE-5⟧ | 162 |
| §32 | **Fidelidad + ELEVACIÓN de diseño**: el portal DIFIERE de los mockups (Daniel lo cazó → L-24; mapa 7 páginas §32.2). Mandato: fusión neu+skeu+glass+liquid, app-like, premium sin choque (§32.3). **Header v3** (glass full-bleed + emblema oficial Canva + íconos Lucide/Simple embebidos [astro-icon rompe Workers, L-23] + auto-hide) + **Hero** carrusel. **§32.8 `#arriendo`→LISTA + filtro administración** (corregido 07-16). **§32.9 AUDITORÍA de la home**: mapa definitivo de las **17 secciones** (10 AUSENTES · 3 DIVERGENTES —`#cerca` debe ser **buscador+MAPA**, no grilla— · 4 FIELES); `#destacadas` `disenoPropio:false` ⇒ `PropertyCard` NO es el villano; **`.arail` = riel compartido ×4** (venta/estancias/valoradas/proyectos) ⇒ 1 `Rail`+1 `LuCard`. **§32.10 base de riel** `.alt-rail`+`LuCard` (reusable ×4) + **#venta** fiel; corrige un BUG del mockup (sus flechas de carrusel no funcionan: botones en un `[data-railwrap]` hermano del riel) → L-26 (renderer del panel CONGELADO: rAF=0, sin eventos `scroll`, sin captura). Crudo+síntesis en bóveda. WIP: rebuild fiel (TODO-27). ⟦OPUS-4.8⟧ | 292 |
| §31 | **Ola 1: GESTIÓN** (`/gestion`, panel admin) — 8º y último mockup → **portal COMPLETO (8/8)**. Sidebar navy + KPIs + tabla pipeline + actividad + demanda; segmentado 3 roles (Admin/Aliado/Propietario) en JS vanilla sin innerHTML; noindex (prop `BaseLayout`); datos DEMO. 0 off-palette. ⟦OPUS-4.8⟧ | 282 |
| §30 | **Auditoría Nivel-2 del cerebro #2** (post-Ola 1): SANO + retrieval funcional; 7 hallazgos in-repo curados (F-01 `05` rezagada→**M-01** 1ª meta-lección) + 10 kernel (Sonda 7)→TODO-23/24/25. GC pareado (boot<target). ⟦OPUS-4.8⟧ | 264 |
| §29 | **Ola 1: TURISMO** (`/turismo`) — landing turismo+inversión (hero + zonas + experiencias + sección inversión navy + CTA). **HITO: todas las páginas públicas mockup-backed LIVE** (home/SERP/ficha/publicar/estancias/turismo). 0 off-palette. ⟦OPUS-4.8⟧ | 257 |
| §28 | **Ola 1: ESTANCIAS** (`/estancias`): detalle de alojamiento + galería + amenidades + host + **widget de reserva funcional** (fechas → recalcula noches/subtotal/servicio/total; aseo=tarifa fija + stepper huéspedes). Pago Wompi = Ola 2. 0 off-palette. ⟦OPUS-4.8⟧ | 251 |
| §27 | **Ola 1: 404 + PUBLICAR** (`/publicar`): hero + formulario de avalúo (validación+éxito client-side; POST a solicitudes pendiente) + 4 pasos + 3 planes (Gratis/Premium navy/Élite). 404 con Header/Footer. Viaje comprador+vendedor LIVE. 0 off-palette. ⟦OPUS-4.8⟧ | 243 |
| §26 | **Ola 1: FICHA de inmueble** (`/ficha`): galería + specs + aside sticky (precio + CTA WhatsApp + sello Verificado por ALTORRA + asesora + financiación) + amenidades + ficha técnica + ubicación esquemática + similares (PropertyCard). Sin gráficas. 0 off-palette. ⟦OPUS-4.8⟧ | 233 |
| §25 | **Ola 1: SERP resultados** (`[operacion].astro` dinámico → /comprar + /arrendar): barra de filtros glass + grid PropertyCard + aside sticky con mapa esquemático (MapLibre real pendiente) + footer. Reusa Header/Footer/PropertyCard. Verificado 0 off-palette. ⟦OPUS-4.8⟧ | 223 |
| §24 | **Ola 1: Header compartido + HOME (parte 1)** — `Header.astro` (nav sticky 3 capas, data-driven, glass, drawer, contacto REAL) + `index.astro` home (hero neumórfico + buscador segmentado + "Cuatro maneras"). Verificado: 0 errores, 0 colores off-palette. Pendiente parte 2: secciones restantes + `Footer.astro` + optimizar imágenes (WebP). ⟦OPUS-4.8⟧ | 207 |
| §23 | **Ola 1 · D1: sistema de diseño (tokens + primitivas)** extraído de los 8 mockups aprobados vía workflow (9 extractores → síntesis `--alt-*` → crítica a11y). Modelo DUAL-MODE (blanco plano default / neumórfico `#E6EDF2` en home+nav / navy sección). `tokens.css`+`base.css`+`components.css`+fuentes en BaseLayout + styleguide `/design-system`. A11y endurecido (cuerpo/oro-enlace fallaban AA → corregidos; foco/reduced-motion/estado semántico). Ratificaciones CERRADAS (§23.8 paleta oficial · §23.9 tipografía Cormorant/Hanken + disciplina solo-paleta). Verificado por computed styles en vivo (→ L-22). ⟦OPUS-4.8⟧ | 193 |
| §22 | **Ola 0.7 (parte 3/3): capa de datos `client.ts`** (lecturas públicas Firestore REST + Workers Caching, edge-safe). Decisión Fuerte OD1 `[REVISAR-FABLE]`: comité ×3 cazó BLOCKER de decode (mapa/array vacío) + anti-traversal + memo footgun + TTL por-PoP. Gate empírico: tsc + vitest 26/26 + astro build + verify:data + T6 rules 15/15 (emulador; confirma inexistente→403). ⟦OPUS-4.8⟧ | 181 |
| §21 | **Ola 0.2: portal VIVO en Cloudflare Workers staging** (`altorra-portal.altorrainmobiliaria.workers.dev`): dueño creó cuenta CF+R2+token+secrets (guiado, Fincaraíz), CI desplegó. Verificado en vivo (home+SSR+noindex+favicon). KV auto-provisionado, R2 conectado. Gotcha: registrar subdominio workers.dev antes del 1er deploy (→ L-16). ⟦OPUS-4.8⟧ | 173 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` · `00-INDICE` (este) · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL`) · `50-CONFIG-INFRA`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
