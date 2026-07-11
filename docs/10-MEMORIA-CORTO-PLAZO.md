# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> 🏛️ **AUDITORÍA FABLE HECHA (2026-07-10, ADR §20)** — la ejecución se rige por
> `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md` (GANA sobre el MEGA-PLAN donde corrija). Opus LISTO para
> Olas 0→3 sin Fable. ✅ **Portal LIVE en staging** (`altorra-portal.altorrainmobiliaria.workers.dev`, ADR §21).
> ⏰ **LOTE-DUEÑO restante** (RNT decreto cierra 2026-07-11 · permiso DesignSync · allowlist git · abogado
> toque (i) · elección D0) → TODO-21. Cuenta Cloudflare ✅ hecha.
>
> ⚡ **RELEVO A OPUS 4.8 — construir la OLA 0 del MEGA-PLAN** (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT
> del roadmap; protocolo de arranque en su §4). La planificación COMPLETA (R0-R5, ADR §15-§18) terminó
> 2026-07-10: stack sellado (§16, W-11 completo con Gemini integrado), plan por olas (§17) con módulo
> GESTIÓN (§3b) y regla visión-PRO. Reglas permanentes: Fable planifica/audita · Opus implementa (tag
> por commit) · dueño decide dinero/legal/go-no-go · español · autonomía total. Fable audita al cierre
> de cada ola (cuota vuelve ~jueves).
>
> **🚫 Callejones / cuidados (NO reintentar)**:
> (a) ⛔ **NADA del sitio/código/diseño viejo como base** — regla innegociable del dueño (solo lectura de referencia; sus TODO/gaps están obsoletos, ADR §15.7).
> (b) **Writes cross-repo BLOQUEADOS** (sinapsis regla 5) → payloads en `references/` de la skill.
> (c) **Los docs internos del dueño tienen ERRORES** (él lo advierte): verdad del dominio, NO estándar — visión PRO obligatoria (MEGA-PLAN §3b; ej.: listan depósitos prohibidos por Ley 820 art. 16).
> (d) **NUNCA UI sin mockup aprobado** (carril D) · **NUNCA dinero sin gate B2/B9** · **NUNCA pedir reindexación** antes del contenido sustantivo (regla AEO) · **JAMÁS el nº personal del dueño** (323…) en la web.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 — ejecución Opus** (guía = `PLAN-ENDURECIDO-FABLE-2026-07-10.md`): ✅ 0.1 scaffold (§19) · ✅ 0.2 staging LIVE (§21) · ✅ brief abogado (O9) · ✅ FTI-01. **0.7 modelo de datos**: ✅ parte 1 tipos (`62916e1`) · ✅ parte 2 rules+indexes+storage ×3 (`1750f10`) · ✅ **parte 3/3 = capa de datos `client.ts`+REST+cache+tests+gate (OD1, §22 `[REVISAR-FABLE]`, comité ×3)** · ✅ **E2E de la capa de datos con SEED (21/21 emulador: 6 E2E + 15 rules, §22.8)**. **Falta 0.7**: SOLO el E2E "tras cache" (Workers Caching en staging desplegado, gate T9) + deploy de rules (coordinado con retiro legacy — NO ahora). Siguen 0.3 D0 · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-18** | **Carril D — Diseño D0-D4**: direcciones de marca comparativas (dueño elige) → design system → DesignSync a claude.ai → mockup por pantalla → gate fidelidad. Insumo: bóveda `ui-referentes/` | 🔮 OPUS (D0 en Ola 0.3) | paleta SIN negro |
| **TODO-19** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones candidatas C-01..C-39 (R0) contra `30` | 🔄 | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-21** | **Lote-dueño #0** — ✅ **Cloudflare (cuenta+R2+token+secrets+CF_DEPLOY_ENABLED)** hecho (portal LIVE §21). Restante: ⏰ **RNT decreto cierra 2026-07-11** · permiso DesignSync (1 clic, al 1er sync) · allowlist git push/merge en `.claude/settings.json` (opcional — el push ya funciona) · contratar abogado con brief (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`, listo) · elegir D0 (cuando Opus entregue 3 direcciones). Lotes 1/2/3 → PLAN-ENDURECIDO §4. | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable de la Ola 0** (protocolo cars §300) al volver su cuota. **Cola viva** (carta de derechos §3): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) decisión DIFERIDA del catálogo público (SSG build-time vs doc-índice denormalizado, Ola 1). ~~(c) `platformProxy` inválido~~ ✅ RESUELTO (quitada la opción; adapter v14 sobre Cloudflare Vite plugin auto-emula bindings — L-19). | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

> **2026-07-11 (OPUS 4.8 — E2E de la capa de datos con SEED + fusión skill navegador, pedido de Daniel)**:
> Daniel pidió generar propiedades para desbloquear (no hay inventario). Hecho: generador SEMILLA realista
> (`firebase/seed/generar-propiedades.mjs`, Cartagena; imágenes Picsum por URL — NO Google/derechos) + seam
> `baseUrl` + **E2E `e2e-datalayer.test.ts`** (siembra emulador → lee con cliente REAL → decode). **21/21
> emulador** (§22.8). Bug de test cazado (aislamiento por projectId → L-21). ⚠️ Para VER propiedades
> renderizadas falta la **Ola 1** (grillas+ficha, gated en D0 — no hago UI sin mockup). Fusioné la skill
> global `validacion-live-chrome` §0.5: navegador integrado (default) vs extensión Chrome (solo con login
> del dueño) + copyright. Commit: código + cerebro.

> **2026-07-11 (OPUS 4.8 — fix `platformProxy` del adapter v14, tarea derivada)**: la opción `platformProxy`
> se removió en `@astrojs/cloudflare` v14 (ahora sobre el Cloudflare Vite plugin → bindings de `wrangler.jsonc`
> auto-emulados en workerd real). Fix = quitar la línea de `astro.config.mjs`. Verificado: `tsc` limpio +
> `astro dev` sirve SSR+estático + build/gates verdes. Cierra cola Fable (c). Detalle → L-19.

> **2026-07-11 (OPUS 4.8 — Ola 0.7 parte 3/3 CERRADA: capa de datos `client.ts`, Decisión Fuerte OD1)**:
> pipeline `proceso-decision-fuerte` (núcleo seco) → evidencia docs vivas (Cloudflare Workers Caching en
> workers.dev ✅ + Firestore REST anónimo pasa por rules ✅) → **comité ×3** (workflow; crudo → bóveda
> `2026-07-11-comite-od1-client-ts-crudo.json`) → veredicto (verifiqué cada claim). Implementado edge-safe:
> `firestore-rest.ts` (decoder + `getDoc` never-throws) · `client.ts` (`getDataClient`, repos, guardas
> anti-traversal + colapso denied/404→unavailable + memo por-request) · `cache.ts` (tags + Cache-Control TTL
> largo+purga) · `middleware.ts` → `locals.altorra` · gate `verify:data`. **Hallazgo**: apiKey pública YA
> estaba en el repo (`js/firebase-config.js`) — NO hubo que pedirla. **Gate empírico REAL**: tsc estricto
> limpio · vitest 26/26 · astro build · verify:data · **T6 rules 15/15 emulador** (confirma inexistente→403).
> ADR §22 `[REVISAR-FABLE]` + L-17..L-20. **Pre-existente cazado**: `platformProxy` inválido en adapter v14
> (→ cola Fable). Commit pendiente (código + cerebro). Daniel: nada que hacer.

> **2026-07-11 (OPUS 4.8 — Ola 0.2: portal VIVO en staging)**: guié al dueño paso a paso (Fincaraíz, sin
> tocar credenciales) → cuenta Cloudflare + R2 (bucket `altorra-portal-media`) + API token + secrets +
> `CF_DEPLOY_ENABLED` → CI desplegó a Workers. **Verificado en vivo**: `altorra-portal.altorrainmobiliaria.workers.dev`
> (home 200 + noindex · `/api/health` SSR 200 + `X-Robots-Tag` · favicon 200). KV `SESSION` auto-provisionado
> (F1 no se materializó), R2 conectado. Gotcha: registrar subdominio workers.dev antes del 1er deploy (L-16 · ADR §21).
> También: brief abogado listo (§O9, `specs/BRIEF-ABOGADO-2026-07-10.md`) · noindex safeguard (T1/O3) · O10 hecho.
> **Siguiente**: Ola 0.7 modelo de datos (desbloqueado, verificable E2E en staging vivo).

> **2026-07-10 (FABLE 5 — RATIFICACIÓN FINAL, 2ª pasada)**: dictamen íntegro; apéndice vinculante en el
> PLAN-ENDURECIDO (gana al cuerpo). T1 corregida (staging noindex = solo header, sin Disallow) · T8 corregida
> (Workers Caching con purga por tags, NO Cache API en workers.dev; wrangler 4.110 ✅) · O13 (cache-key sin
> host → mitigar al cutover) · Carta de derechos sellada (Opus no pregunta lo técnico; Daniel = 6 categorías).
> Cuenta Cloudflare CREADA por el dueño (ID → `50`) · O10 ejecutada (scrapes → bóveda). ADR §20.8.
> **Siguiente**: bucket R2 + token + secrets con el dueño → CF_DEPLOY_ENABLED → 1er deploy staging + noindex.

> **2026-07-10 (FABLE 5 — repaso estratégico final del plan, pedido por el dueño al 6% de cuota)**: Opus
> armó el dossier de auditoría de todo el corpus (7 lectores en paralelo, +2ª pasada FTI-01 ya hecha) →
> Fable ratificó (~40 decisiones, 4 correcciones de timing, 12 omisiones) → **ADR §20** +
> `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md` (SSoT de EJECUCIÓN). Correcciones: abogado partido en 2
> (toque (i) gatea el cutover), DIAN/Wompi a Ola 1, plumbing Wompi tras concepto, candado 1B→Ola 2,
> continuidad DNS/email en cutover (O1, ROJA). 2 ediciones de kernel pre-aprobadas por Fable (carve-out
> §3.2/§4 ✅ · derogación "abogado=Ola 2"). Veredicto: **Opus LISTO para Olas 0→3 sin Fable**.
> **Siguiente**: presentar el lote-dueño #0 a Daniel (URGENTE — RNT vence mañana).

> *(Bitácora del 2026-07-10 podada — consolidada en ADRs §15-§20 + specs R0-R5 + PLAN-ENDURECIDO. §G.4 GC.)*
