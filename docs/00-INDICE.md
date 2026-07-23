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
| Verificar UI (screenshot/computed/scroll/interacción · panel congelado vs Chrome) | hoja `31-VERIFICACION-UI` (L-22/L-26/L-28 completas; lápidas en `30`) |
| Project ID, cuentas IAM, deploy, secrets | `50-CONFIG-INFRA` |
| Competencia/mercado inmobiliario, benchmark | `40-LOBULOS` → `41-MERCADO` |
| Legal Colombia: Ley 820/RNT/Habeas Data/pagos/firma/SIC — gates de features y agenda abogado | `40-LOBULOS` → `42-LEGAL` (detalle: `specs/R3-LEGAL-COLOMBIA-2026-07.md`) |
| El "por qué" de una decisión / detalle histórico | este índice → `99-HISTORIAL` (offset) |
| Decisión cara de revertir (2ª opinión externa) | `15-CONSEJO-EXTERNO` |
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
| §15 | **Arranque Fable 5**: misión GREENFIELD + liderazgo kernel ×4 + MODO OBRA live (mantenimiento + 65 redirects + SW v5 kill-switch). Obsoleta TODO-01..08 del sitio viejo. ⟦FABLE-5⟧ | 114 |
| §16 | **STACK sellado** (W-11): Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre+Resend + adenda Gemini (veto-Firestore refutado) → `specs/R5-STACK-2026-07.md`. ⟦FABLE-5⟧ | 128 |
| §17 | **MEGA-PLAN por olas** (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT) + relevo a Opus (Fable audita por ola). ⟦FABLE-5⟧ | 138 |
| §18 | **Programa R0-R5 COMPLETO en un día** (~74 agentes · 6 workflows · live) + cierre de planificación Fable. ⟦FABLE-5⟧ | 145 |
| §19 | **Ola 0.1 scaffold** del portal (Astro+Cloudflare Workers, híbrido `output:server`, capa de datos FINA, CI gated). Gotcha: `main` = entrypoint unificado (→ L-14). ⟦OPUS-4.8⟧ | 152 |
| §20 | **Repaso estratégico del plan con Fable 5** (auditoría final pre-ejecución): dossier del corpus (7 lectores + 2ª pasada FTI-01) + 12 omisiones corregidas (abogado en 2 · DIAN/Wompi a O1 · candado 1B→O2 · continuidad DNS/email). SSoT ejecución → `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md`. ⟦OPUS-4.8+FABLE-5⟧ | 162 |
| §51 | **CEREBRO v2 · F1 ejecutada**: kernel CANÓNICO en `brain-private/kernel/` + `brain:pull` (1 línea npm/repo) + **gate #0 BLOQUEANTE** (hash vs stamp + versión vs canónico) · **×4 flipeados v1.4.1** (test: fix propagado <2 min) · bersaglio "divergente" era CRLF · cars/bersaglio deuda visible (7/8 problemas reales). ⟦FABLE-5⟧ | 859 |
| §50 | **CEREBRO v2 · F0 ejecutada** (Daniel aprobó): kernel **v1.3** — #6b/#11 muertos · #1⊂#10 · #13 resoluble · +5c ⚰️ · +7b bóveda-fs · +tableFile · masa-neta 491≤492 · ssotFact paleta · **offsite OneDrive PROBADO** (SPOF-disco muerto). Siguiente: F1 kernel único. ⟦FABLE-5⟧ | 847 |
| §49 | **Auditoría Nivel-2 #4** (encargo Daniel pre-TODO-30): SANO · retrieval 5/5 · 2 mentiras en boot curadas · **TODO-30 blindado** (tiles sellados + criterio de mapa + home excluida) · **M-03** (recurso compartido → gate EN el recurso) · TODO-31 SPOF/costo (proxy commits 49%>30%). ⟦FABLE-5⟧ | 834 |
| §48 | **TODO-27 CERRADO — HOME+PUBLICAR FIEL** (4 hallazgos): maneras 04 texto + journal imgs · publicar h2 persiste + padding. Re-audit 4/4 + 2 críticos 0 nuevas. 🏁 **6 páginas fieles** (balance §43-§48: 35 MEDIA/BAJA + 3 ALTA fantasma + 3 íconos). ⟦OPUS-4.8⟧ | 806 |
| §47 | **TODO-27: SERP FIEL** (7 + ALTA arriendo, `[operacion].astro`): /comprar=4 venta + /arrendar=1 arriendo reales (sin listings inventados) · Más filtros · sombra scroll · 3ª vía · precios pelados. Corazón unificado; arrendar 1 card→Daniel. Re-audit 8/8. ⟦OPUS-4.8⟧ | 767 |
| §46 | **TODO-27: ESTANCIAS FIEL** (8 + 2 íconos, `estancias.astro`): galería mosaico+"Ver 18 fotos" · reserva prellena fechas · breadcrumb · Interior=villa-modern · orden cabecera · íconos Terraza/WiFi. Re-audit 8/8. ⟦OPUS-4.8⟧ | 733 |
| §45 | **TODO-27: TURISMO FIEL** (8 hallazgos, `turismo.astro`): #inversión→copy+grid-3-cards-vidrio+CTA (sin foto) · zonas card-blanca-foto-arriba + kicker + "Ver estadías →" · copy/CTA/eyebrow/hero/email. Re-audit 8+1 → 8/8 FIEL, crítico 0 nuevas. Bóveda `2026-07-18-turismo-reaudit-*`. ⟦OPUS-4.8⟧ | 700 |
| §44 | **brain-kit v1.0** (encargo Daniel): kit de neurogénesis portable (MacBook, Node+Firebase) — kernel fork + plantillas §G + 38 skills + 5 agents + runbook 10 fases (F7 minería TRIAJE · F9 escaneo+comité+consejo). Verif. adversarial 4 rompedores: 25 hallazgos (1 bloqueante) aplicados; 0 fugas. ZIP Desktop; kit en `GitHub/brain-kit/`. ⟦FABLE-5⟧ | 668 |
| §43 | **TODO-27: FICHA FIEL** (8 + 1 del crítico, `ficha.astro`): specs/sello-retirado/favorito-toggle/badge · POI-íconos/flecha/banda-cierre/miniatura · **ALTA 3ª card que §32.24 nunca tocó (`3a66a69` era HOME) → Crespo**. Re-audit 9+1 → 8/9. L-28 recurrió (computed miente con `transition`). Bóveda `2026-07-18-ficha-reaudit-*`. ⟦OPUS-4.8⟧ | 629 |
| §42 | **HUMO MONTADA (pausa) y §42.8 ENCENDIDA — "Activo"** (extensión Chrome, Daniel en vivo): campaña `120250036063330588` Leads+CTWA $4.000/día · Cartagena+40km · pieza v4 + chat USTED sin formulario · 5 auto-mejoras IA apagadas · revisión de Meta APROBÓ. Desviaciones: edad 25 (tope A+), idiomas Todos. Gotcha página default de CARS → L-32. ⟦FABLE-5⟧ | 595 |
| §41 | **TODO-28 #2 ✅ candado del boot** (`boot-gate.mjs` bloqueante + poda router + one-in-one-out) + fix kernel ✅-falso ×3 + HUMO bloqueada por rollout Ads-MCP (runbook en bóveda). ⟦FABLE-5⟧ | 566 |
| §40 | **Meta 100% operativo + pieza de humo APROBADA** (embudo `pauta-captacion §0b` + L-31) + caja negra anti-saturación (TODO-28 #1, session-handoff). ⟦FABLE-5⟧ | 530 |
| §39 | **Constancias ×3 COMPLETAS + pauta de humo + cierre**: cars `6a26ba83` con no-verify AUTORIZADO (Daniel) → TODO-20 CERRADO tras 8 días (×3 ✅); campaña de HUMO ~COP 5k → playbook §4b; WhatsApp Web no quita "Sin conexión" (abrir app en el teléfono); relevo curado §33-§39 (un día completo de sesión Fable). ⟦FABLE-5⟧ | 516 |
| §38 | **Meta Business ORDENADO**: cuenta ads reclamada al portafolio + píxel `1032884172712946` + inventario `activos-meta.md`; gotcha: Business Suite en pestaña de fondo NO renderiza. ⟦FABLE-5⟧ | 489 |
| §37 | **Skill `pauta-captacion`** (orquestadora: playbook + gates go/no-go) + 8 parches de vigencia (CTWA→Leads · AEM muerto · CAPI $0 vía Worker · benchmarks ❓→ planilla CPQL propia). Crudo/blueprint en bóveda. ⟦FABLE-5⟧ | 463 |
| §36 | **Lote 2 TikTok + BACKLOG acumulador** (`compartido-marketing/BACKLOG-material-tiktok.md` = SSoT cross-proyecto) + 2 plantillas ad-creative + guías Nova. ⟦FABLE-5⟧ | 443 |
| §35 | **Material TikTok + minería marketingskills** (linaje Corey Haines MIT → 9 adopciones curadas: `paid-ads` v2.2 · `ad-creative` v2.8 · video/offers/loops/image). ⟦FABLE-5⟧ | 419 |
| §34 | **Masterclass de captación adoptada** (`marketing-psicologico-conversion`) + Housing Meta NO aplica a pauta→Colombia (verificado en fuente primaria; caducable L-30) + voz EN FORJA. ⟦FABLE-5⟧ | 397 |
| §33 | **Skills visibilidad corregidas** (→ L-30: FAQPage muerto · Offer-sin-price inválido) + **Auditoría Nivel-2 #3** (retrieval 5/5 · M-02 · bóveda respaldada · memoria espejada) + comité futuro-del-cerebro (Obsidian=downgrade) → TODO-28. ⟦FABLE-5⟧ | 353 |
| §32 | **Saga fidelidad + elevación del portal** (L-23→L-29): home 17/17 (§32.15) · `.alt-rail` + 5 cards NO intercambiables (§32.10-.13) · home-map ilustrado (§32.18) · re-audit adversarial → 35 pendientes = TODO-27. Síntesis en bóveda 07-17. ⟦OPUS-4.8⟧ | 293 |
| §31 | **Ola 1: GESTIÓN** (`/gestion`, panel admin) — 8º y último mockup → **portal COMPLETO (8/8)**. Sidebar navy + KPIs + tabla pipeline + actividad + demanda; segmentado 3 roles (Admin/Aliado/Propietario) en JS vanilla sin innerHTML; noindex (prop `BaseLayout`); datos DEMO. 0 off-palette. ⟦OPUS-4.8⟧ | 283 |
| §30 | **Auditoría Nivel-2 del cerebro #2** (post-Ola 1): SANO + retrieval funcional; 7 hallazgos in-repo curados (F-01 `05` rezagada→**M-01** 1ª meta-lección) + 10 kernel (Sonda 7)→TODO-23/24/25. GC pareado (boot<target). ⟦OPUS-4.8⟧ | 264 |
| §29 | **Ola 1: TURISMO** (`/turismo`) — HITO: todas las públicas mockup-backed LIVE. ⟦OPUS-4.8⟧ | 257 |
| §28 | **Ola 1: ESTANCIAS** (`/estancias`): detalle alojamiento + widget de reserva funcional (pago Wompi = Ola 2). ⟦OPUS-4.8⟧ | 251 |
| §27 | **Ola 1: 404 + PUBLICAR** (`/publicar`): form avalúo client-side + 4 pasos + 3 planes. ⟦OPUS-4.8⟧ | 243 |
| §26 | **Ola 1: FICHA de inmueble** (`/ficha`): galería + aside sticky (CTA/sello/asesora) + similares. ⟦OPUS-4.8⟧ | 233 |
| §25 | **Ola 1: SERP resultados** (`[operacion].astro` → /comprar+/arrendar): filtros glass + aside mapa esquemático (MapLibre real → TODO-30). ⟦OPUS-4.8⟧ | 223 |
| §24 | **Ola 1: Header compartido + HOME parte 1** (`Header.astro` nav 3 capas + hero neumórfico + buscador segmentado). ⟦OPUS-4.8⟧ | 207 |
| §23 | **D1 design system** (de los 8 mockups): DUAL-MODE (blanco / neu `#E6EDF2` / navy) · `tokens.css`+`base`+`components` · styleguide `/design-system` · a11y AA · §23.8 paleta oficial · §23.9 tipografía Cormorant/Hanken. → L-22. ⟦OPUS-4.8⟧ | 193 |
| §22 | **Ola 0.7 (parte 3/3): capa de datos `client.ts`** (lecturas públicas Firestore REST + Workers Caching, edge-safe). Decisión Fuerte OD1 `[REVISAR-FABLE]`: comité ×3 cazó BLOCKER de decode (mapa/array vacío) + anti-traversal + memo footgun + TTL por-PoP. Gate empírico: tsc + vitest 26/26 + astro build + verify:data + T6 rules 15/15 (emulador; confirma inexistente→403). ⟦OPUS-4.8⟧ | 181 |
| §21 | **Ola 0.2: portal VIVO en Cloudflare Workers staging** (`altorra-portal.altorrainmobiliaria.workers.dev`): dueño creó cuenta CF+R2+token+secrets (guiado, Fincaraíz), CI desplegó. Verificado en vivo (home+SSR+noindex+favicon). KV auto-provisionado, R2 conectado. Gotcha: registrar subdominio workers.dev antes del 1er deploy (→ L-16). ⟦OPUS-4.8⟧ | 173 |
| §52 | **CEREBRO v2 · F2 piloto** (TODO-32): 💓 heartbeat (sidecar `.estado-auto` — el 05 pierde lo derivable; costo-cerebro midió 52% 🔴) · 🧊 consolidación-en-frío · 📦 brain:archive (este ADR nació de él) · punto ciego gate #0 cazado EN VIVO → v1.5.1 compara contenido. ⟦FABLE-5⟧ | 871 |
| §53 | **CEREBRO v2 · F3 — 🏁 v2 NÚCLEO COMPLETO** (TODO-32): gate #14 escala con gracia (probado con cars: gap 22 → WARN) · 🧭 banner en cristiano en cada boot · skill `mantenimiento-general` (ejecutor, jamás calendario) · kernel v1.6.0 ×4 · bundles frescos. Restos: hooks hermanos + TODO-31 c/d. ⟦FABLE-5⟧ | 881 |
| §54 | **TODO-22: §22 auditado ✅ + OD-Catálogo = B doc-índice SELLADA** (comité 3/3 + Gemini convergió doble-ciego §54.8 · rebuild total idempotente · gates G1-G12+2 · purga Workers Cache ~GLOBAL verificada en docs vivas · `s-maxage` desactiva SWR → deuda headers a la obra). ⟦FABLE-5⟧ | 891 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` · `00-INDICE` (este) · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL`) · `50-CONFIG-INFRA`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
