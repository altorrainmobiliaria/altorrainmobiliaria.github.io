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
| **TODO-17** | **Ola 0 — ejecución Opus** (guía = `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md`): ✅ 0.1 scaffold (§19) · ✅ **0.2 staging LIVE** (§21, verificado) · ✅ brief abogado (O9) · ✅ FTI-01 2ª pasada. ▶ **AHORA 0.7 modelo de datos** (DESBLOQUEADO: schema TS 8 colecciones + `firestore.rules` + `indexes` + `client.ts` REST edge; PUBLIC/`captaciones`-PII; GESTIÓN día-1; verificar E2E en staging vivo). Siguen 0.3 D0 (needs dueño) · 0.4 obra AEO · 0.6 textos legales DRAFT. | 🔄 OPUS | abogado toque (i) = gate CUTOVER |
| **TODO-18** | **Carril D — Diseño D0-D4**: direcciones de marca comparativas (dueño elige) → design system → DesignSync a claude.ai → mockup por pantalla → gate fidelidad. Insumo: bóveda `ui-referentes/` | 🔮 OPUS (D0 en Ola 0.3) | paleta SIN negro |
| **TODO-19** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones candidatas C-01..C-39 (R0) contra `30` | 🔄 | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-21** | **Lote-dueño #0** — ✅ **Cloudflare (cuenta+R2+token+secrets+CF_DEPLOY_ENABLED)** hecho (portal LIVE §21). Restante: ⏰ **RNT decreto cierra 2026-07-11** · permiso DesignSync (1 clic, al 1er sync) · allowlist git push/merge en `.claude/settings.json` (opcional — el push ya funciona) · contratar abogado con brief (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`, listo) · elegir D0 (cuando Opus entregue 3 direcciones). Lotes 1/2/3 → PLAN-ENDURECIDO §4. | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable de la Ola 0** (protocolo cars §300) al volver su cuota | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

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

> **2026-07-10 (OPUS 4.8 — arranque Ola 0)**: ítem 1 scaffold `portal/` construido y verificado
> end-to-end (build · `wrangler deploy --dry-run` · **`wrangler dev` live** · `verify:build` 5/5) →
> commit `e0751a5` pusheado (portal-ci corre en el runner de GitHub). Config Astro 7 / adapter v14
> verificada contra docs autoritativas, NO de memoria (§3.3): `main` = entrypoint unificado (L-14).
> Revisión adversarial ×4 lentes (crudo → bóveda) → fixes aplicados (aislamiento inbound de
> bump-version.yml, prereqs de deploy documentados, wranglerVersion pin, verify #5). ADR §19 + L-14/L-15.
> **Siguiente en esta sesión**: guiar al dueño en la creación de la cuenta Cloudflare (Ola 0.2).

> **2026-07-10 (SESIÓN DE PLANIFICACIÓN FABLE — cerrada, ADR §15-§18)**: en un día: obra live verificada
> (+ caza del bug Jekyll L-13) → R0-R4 completas (~74 agentes, 6 workflows, 3 lentes live con protocolo
> de login del dueño) → stack sellado con W-11 completo (comité ×3 + juez + fallos Q1-Q7 + Gemini
> integrado: 4 adopciones, veto-Firestore refutado) → MEGA-PLAN por olas + módulo GESTIÓN + visión-PRO.
> Decisiones del dueño incorporadas: razón social ALTORRA COMPANY SAS (vieja a liquidación, ver `50`) ·
> tarifas v1 delegadas · GBP existe→reclamar · propiedades viejas descartadas · matrícula obtenida.
> Detalle → ADRs §15-§18 + specs R0-R5 + MEGA-PLAN. **Siguiente sesión = OPUS 4.8: "arranca la Ola 0"**.
