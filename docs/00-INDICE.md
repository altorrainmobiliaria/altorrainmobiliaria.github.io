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
| ¿Una regla de SEO/rich-results sigue vigente? (FAQPage, price, GBP, indexación) | `30 L-30` (features del SERP mueren: fecha+fuente primaria) + skills del paquete de visibilidad (corregidas 2026-07-18, `99 §33`) |
| Skills: qué hay, dónde vive cada una, parejas repo↔user | `docs/skills-inventory.md` (re-auditado 2026-07-18; editar AMBAS copias) |

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
| §20 | **Repaso estratégico del plan con Fable 5** (auditoría final pre-ejecución): dossier del corpus (7 lectores + 2ª pasada FTI-01) + 12 omisiones corregidas (abogado en 2 · DIAN/Wompi a O1 · candado 1B→O2 · continuidad DNS/email). SSoT ejecución → `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md`. ⟦OPUS-4.8+FABLE-5⟧ | 162 |
| §46 | **TODO-27: ESTANCIAS FIEL** (8 hallazgos + 2 íconos del crítico, `estancias.astro`): galería mosaico + "Ver 18 fotos" (reemplazan la tira inventada) · reserva prellena fechas+min · breadcrumb retirado · Interior=villa-modern · orden cabecera (rating→sello) · íconos Terraza/WiFi. Re-audit 8+1 (~930k tok): 8/8 FIEL + crítico 2 nuevas. ⟦OPUS-4.8⟧ | 732 |
| §45 | **TODO-27: TURISMO FIEL** (8 hallazgos, `turismo.astro`): #inversión→copy+grid-3-cards-vidrio+CTA (sin foto) · zonas card-blanca-foto-arriba + kicker + "Ver estadías →" · copy/CTA/eyebrow/hero/email. Re-audit 8+1 → 8/8 FIEL, crítico 0 nuevas. Bóveda `2026-07-18-turismo-reaudit-*`. ⟦OPUS-4.8⟧ | 699 |
| §44 | **brain-kit v1.0** (encargo Daniel): kit de neurogénesis portable (MacBook, Node+Firebase) — kernel fork + plantillas §G + 38 skills + 5 agents + runbook 10 fases (F7 minería TRIAJE · F9 escaneo+comité+consejo). Verif. adversarial 4 rompedores: 25 hallazgos (1 bloqueante) aplicados; 0 fugas. ZIP Desktop; kit en `GitHub/brain-kit/`. ⟦FABLE-5⟧ | 667 |
| §43 | **TODO-27: FICHA FIEL** (8 + 1 del crítico, `ficha.astro`): specs/sello-retirado/favorito-toggle/badge · POI-íconos/flecha/banda-cierre/miniatura · **ALTA 3ª card que §32.24 nunca tocó (`3a66a69` era HOME) → Crespo**. Re-audit 9+1 → 8/9. L-28 recurrió (computed miente con `transition`). Bóveda `2026-07-18-ficha-reaudit-*`. ⟦OPUS-4.8⟧ | 628 |
| §42 | **HUMO MONTADA (pausa) y §42.8 ENCENDIDA — "Activo"** (extensión Chrome, Daniel en vivo): campaña `120250036063330588` Leads+CTWA $4.000/día · Cartagena+40km · pieza v4 + chat USTED sin formulario · 5 auto-mejoras IA apagadas · revisión de Meta APROBÓ. Desviaciones: edad 25 (tope A+), idiomas Todos. Gotcha página default de CARS → L-32. ⟦FABLE-5⟧ | 594 |
| §41 | **TODO-28 #2 ✅: candado del boot** (gate `boot-gate.mjs` bloqueante en pre-commit + poda router −982c netos + one-in-one-out §G.5) + **fix kernel** (imprimía ✅ falso en leve-exceso; propagado byte-idéntico ×3) + **HUMO bloqueado por rollout Ads-MCP de Meta** (2ª verificación 07-18; runbook de montaje listo en bóveda `2026-07-18-humo/`) + wording stale corregido: escritor del kernel = INMOBILIARIA, no cars. ⟦FABLE-5⟧ | 565 |
| §40 | **Meta 100% operativo + pieza de humo APROBADA (embudo completo) + TODO-28 #1**: WhatsApp Conectado+página (CTWA listo) · IG cerrado VÍA CELULAR (OAuth web bugueado) · Centro de seguridad (dominio+protección; alerta residual ≠ gate) · pieza v4 en USTED por embudo §0b (Ads Library 390 ads + banco §9b + comité ×3; L-31) APROBADA por Daniel · caja negra anti-saturación (session-handoff + hooks). Retomar: campaña EN PAUSA · TODO-28 #2+ · lotes TikTok. ⟦FABLE-5⟧ | 529 |
| §39 | **Constancias ×3 COMPLETAS + pauta de humo + cierre**: cars `6a26ba83` con no-verify AUTORIZADO (Daniel) → TODO-20 CERRADO tras 8 días (×3 ✅); campaña de HUMO ~COP 5k → playbook §4b; WhatsApp Web no quita "Sin conexión" (abrir app en el teléfono); relevo curado §33-§39 (un día completo de sesión Fable). ⟦FABLE-5⟧ | 515 |
| §38 | **Meta Business ORDENADO en vivo + cerebros ×4 alineados**: cuenta ads reclamada al portafolio (permanente, ok Daniel) + renombrada · píxel `1032884172712946` creado · inventario completo en `pauta-captacion/references/activos-meta.md` (pendientes-dueño: login IG · WhatsApp "Sin conexión" · saldo) · gotcha: Business Suite en pestaña de fondo NO renderiza. Constancias liderazgo ✅ bersaglio `486640f` + insema `a042494` (pushed) · cars staged-bloqueado por su pre-commit (cap preexistente) · 15 skills re-sincronizadas por repo. ⟦FABLE-5⟧ | 488 |
| §37 | **Skill `pauta-captacion` + 8 parches de vigencia** (investigación 4 frentes vs doc OFICIAL fechada): objetivo Mensajes RETIRADO (CTWA→Leads) · audiencia amplia+CBO oficial · learning-limited a propósito (COP chico) · AEM/verify-domain MUERTO · CAPI $0 vía Worker CF · Google: Maximize-Clicks primero, 15conv/30d, cambio 17-ago-2026 · benchmarks ❓ (captación de PROPIETARIOS sin benchmark → planilla CPQL propia). Skill orquestadora repo+user con gates go/no-go (números al cierre de obra) + playbook 1ª campaña + setup en orden. Crudo/blueprint/workflow en bóveda. ⟦FABLE-5⟧ | 462 |
| §36 | **Lote 2 TikTok + guías Nova + BACKLOG acumulador**: creado `brain-private/compartido-marketing/BACKLOG-material-tiktok.md` (SSoT cross-proyecto de lotes con estado); 2 plantillas nuevas en ad-creative (Search-Bar + Offer-Deadline con urgencia VERDADERA) — 3 de los 4 formatos YA existían; matiz "pruebas de Meta" (apagar lo que rompe marca, dejar entrega, UI ❓); 5-sistemas transcritos al backlog; guías Nova = conector oficial Meta YA instalado (validación de cuentas con Daniel — clasificador bloquea autónoma) + skill v1.0.0 ya superada. ⟦FABLE-5⟧ | 442 |
| §35 | **Material TikTok procesado + minería marketingskills**: 40 ganchos + cronograma mini-embudo + feed/reels + horarios❓ → skills; humo tumbado (claim 65%→94% "Karpathy" NO existe en el repo; sus 4 principios ya son §3.2-3.6). LINAJE: nuestras ~34 de marketing = copias v1.x del repo de Corey Haines (MIT) → **9 adopciones curadas**: REFRESH `paid-ads` v2.2 (meta-decision-system TCPL = base de pauta) + `ad-creative` v2.8 · 🆕 video/offers/marketing-loops/image (user+repo) · competitor-profiling/prospecting/marketing-council (repo) · references de ab-test-setup/copywriting reparadas · tools/ descartado (APIs muertas). ⟦FABLE-5⟧ | 418 |
| §34 | **Masterclass de captación ADOPTADA + Housing verificado + libre albedrío** (aclaración Daniel): huérfana = SUYA (TikTok→Antigravity) → adoptada como `marketing-psicologico-conversion` (+paso 8, +§10 guardarraíles pauta CO); Brief leído/respaldado en bóveda `pauta/`; **Meta Special Ad Category (Housing) verificado en fuente primaria: NO aplica a pauta→Colombia** (sí a pauta→EE.UU./Canadá; caducable L-30); principios nuevos en memoria: skills=herramientas con libre albedrío · voz EN FORJA (confianza→#1→ROI→leads→orgánico). ⟦FABLE-5⟧ | 396 |
| §33 | **Aprendizajes SEO/AEO/GEO → skills + Auditoría Nivel-2 #3 + Comité futuro-del-cerebro** (encargo Daniel): 4 skills de visibilidad CORREGIDAS con verdad de producción bersaglio (Offer-sin-price INVÁLIDO · FAQPage sin rich result may-2026 · aggregateRating solo on-site · "Solicitar indexación"=solo descubrimiento → **L-30**) + 32 hallazgos en ~30 skills curados (ALTA: contratos Wompi OPUESTOS ante firma inválida → unificado) + 5 gemelas repo↔user re-sincronizadas + inventario al día. Cerebro: retrieval 5/5 · REINCIDENCIA M-01 (05 59 commits atrás) → **M-02** (consolidación AUTOMÁTICA, no prometida) · **toda la bóveda estaba SIN commitear** → respaldada+pusheada · memoria harness espejada (`memory-mirror/`, cierra K-06) · settings.json versionado. Comité unánime: el cerebro es la arquitectura CORRECTA a $0 (Obsidian=downgrade; RAG/Letta rechazados); 7 mejoras → TODO-28. ⟦FABLE-5⟧ | 352 |
| §32 | **Fidelidad + ELEVACIÓN de diseño del portal (saga)**: Daniel cazó que el portal DIFERÍA de los mockups (L-24) → mandato neu+skeu+glass (§32.3) · Header v3 + Hero · **home COMPLETA 17/17** (el lienzo de la home es NEU `#eaf0f7`, §32.15) · 4 carruseles con `.alt-rail` compartido y **6 cards NO intercambiables** · Estancias/Publicar/SERP · fix sistémico `[hidden]`. **Re-auditoría adversarial §32.23-.24**: "fidelidad lograda" era PREMATURA → 13 ALTA ✅ · **35 MEDIA/BAJA pendientes (TODO-27; ficha=8 la más urgente)**; 3 de 6 defectos los introdujo Opus "corrigiendo" (L-29). Método: diff vs `.dc.html` + re-auditar ANTES de decir "fiel". Síntesis AUTOCONTENIDA → bóveda `2026-07-17-reauditoria-fidelidad-sintesis.md`. Lecciones L-23/L-26/L-27/L-28/L-29. Detalle completo → `99 §32`. ⟦OPUS-4.8⟧ | 292 |
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
