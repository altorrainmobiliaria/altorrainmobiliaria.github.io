# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> ⚡ **HILO ACTIVO — Carril D · D0 (marca), en curso; SIGUIENTE = deliberar la VOZ.** Retomar en el chat
> NUEVO cuando Daniel pegue la respuesta de **Gemini/Antigravity** al prompt de voz: invocar
> **`comite-expertos` + `asesor-critico-honesto`** → deliberar la voz de Altorra sobre lo que dijo
> Antigravity (verificar cada pieza contra la marca, NO acatar a ciegas) → destilar en la skill
> **`catalogo-voz-altorra`** (hermana de la de Bersaglio). Luego: rehacer el mockup con el look **Liquid
> Glass** real + sign-off D0 → **D1** (sistema de diseño).
> **Decidido en D0 (todo en memoria `identidad-marca-inmobiliaria` + `sello-marca-altorra`):** posicionamiento
> **"premium que no excluye"** (lujo+transparencia+calidez; cobertura total; Caribe→nacional) · misión/visión ·
> **eslogan "Seguridad, Legalidad y Confianza"** · paleta **oro/plata DOMINAN (logo), navy discreto, blanco,
> + ocre muralla APROBADO** · sello tipográfico **ALTORRA=Cardo / INMOBILIARIA=Helvetica Now** · lenguaje visual
> **Liquid Glass premium (ref Bersaglio, pero SELLO PROPIO, NO copia; Bersaglio NO es marca hermana)** · editorial
> SOLO en sección "Journal Inmobiliario" · anti-patrones de voz DUROS (sin guiones "—", sin texto literal/funcional,
> sin genérico). Board mockup v3 = Artifact `d056097f-ea5d-46ee-9b5a-8959ea3791b3`. Comité D0 crudo → bóveda
> `2026-07-11-comite-d0-marca-crudo.json` (volteó la recomendación: la calidez es lo ownable, no la transparencia).
>
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
| **TODO-18** | **Carril D — Diseño D0-D4**. **D0 EN CURSO**: ✅ posicionamiento + paleta/jerarquía + eslogan/misión/visión + sello tipográfico + lenguaje visual (Liquid Glass) + acento ocre — todo en memoria de marca. ✅ comité D0 ×3 (crudo en bóveda). ✅ prompt de voz entregado a Daniel (Gemini). ▶ **SIGUIENTE (chat nuevo)**: respuesta Gemini → `comite-expertos`+`asesor-critico-honesto` → deliberar voz → skill `catalogo-voz-altorra` → rehacer mockup Liquid Glass → sign-off D0. Luego D1 (design system) → D2 (mockup por pantalla). | 🔄 OPUS | oro/plata mandan; navy discreto; SIN negro |
| **TODO-19** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones candidatas C-01..C-39 (R0) contra `30` | 🔄 | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-21** | **Lote-dueño #0** — ✅ **Cloudflare (cuenta+R2+token+secrets+CF_DEPLOY_ENABLED)** hecho (portal LIVE §21). Restante: ⏰ **RNT decreto cierra 2026-07-11** · permiso DesignSync (1 clic, al 1er sync) · allowlist git push/merge en `.claude/settings.json` (opcional — el push ya funciona) · contratar abogado con brief (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`, listo) · elegir D0 (cuando Opus entregue 3 direcciones). Lotes 1/2/3 → PLAN-ENDURECIDO §4. | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable de la Ola 0** (protocolo cars §300) al volver su cuota. **Cola viva** (carta de derechos §3): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) decisión DIFERIDA del catálogo público (SSG build-time vs doc-índice denormalizado, Ola 1). ~~(c) `platformProxy` inválido~~ ✅ RESUELTO (quitada la opción; adapter v14 sobre Cloudflare Vite plugin auto-emula bindings — L-19). | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

> **2026-07-11 (OPUS 4.8 — Carril D · D0 marca, sesión larga con Daniel; CIERRE por saturación)**:
> definido el posicionamiento **"premium que no excluye"** + misión/visión + eslogan **"Seguridad, Legalidad
> y Confianza"**; corregida la jerarquía de paleta (**oro/plata mandan = logo; navy discreto**); acento **ocre
> muralla APROBADO**; sello tipográfico **Cardo (ALTORRA) + Helvetica Now (INMOBILIARIA)** con tracking/leading
> exactos; lenguaje visual **Liquid Glass** (ref Bersaglio pero **sello propio**, editorial solo en "Journal
> Inmobiliario"). Todo → memoria `identidad-marca-inmobiliaria` + `sello-marca-altorra`. Corrí **comité D0 ×3**
> (crudo → bóveda `2026-07-11-comite-d0-marca-crudo.json`): volteó mi recomendación (calidez = ownable, no la
> transparencia; A=cliché de lujo genérico; oro-texto reprueba contraste). Board mockup v3 publicado (Artifact
> `d056097f…`). Entregué a Daniel el **prompt final de voz** para Antigravity/Gemini. Aprendí anti-patrones de
> voz de Daniel (sin guiones "—", sin texto literal/funcional). **PRÓXIMO (chat nuevo)**: pega respuesta Gemini
> → `comite-expertos`+`asesor-critico-honesto` deliberan la voz → skill `catalogo-voz-altorra`.

> *(Bitácora del 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-21 +
> `PLAN-ENDURECIDO`: staging §21, capa de datos+E2E §22/§22.8, platformProxy L-19. §G.4 GC.)*
