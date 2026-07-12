# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> ⚡ **HILO ACTIVO — Ola 1 · Carril D. D0 CERRADO · DISEÑO ENTREGADO · D1 (design system) ✅ SELLADO Y VERIFICADO EN VIVO (ADR §23). AHORA = construir la HOME real.**
> Daniel entregó el diseño (8 mockups `.dc.html`: Portal/Resultados/Ficha/Estancias/Publica/Gestion/Header/Turismo
> + assets de marca + su `VISION.md` con la paleta ALTORRA + **neumorfismo** sobre el sistema premium) →
> **ingerido en `portal/design/`** (mockups + assets + screenshots, versionado). Faltan de propagar el neumorfismo:
> Precios, landings de barrio, panel de usuario (favoritos/alertas/perfil inquilino), Rango+Rentímetro, Journal,
> portal Aliados/Brokers, panel Admin — se construyen cuando toque su superficie. **AHORA (Opus toma las riendas,
> Carta de Derechos del PLAN-ENDURECIDO):** construir Ola 1 réplica-exacta de los mockups sobre el scaffold
> `portal/` (Astro 7 + CF Workers + capa de datos ya lista). Orden: **D1 ✅ (tokens+base+primitivas `.alt-*`+styleguide `/design-system`, ADR §23)
> → HOME (réplica de `ALTORRA Portal.dc.html`) → SERP+mapa → ficha → estancias → publica → precios/landings/panel-usuario/rango/journal/aliados/admin.**
> ⚠️ **El diseño real es DUAL-MODE, NO "Liquid Glass"**: blanco plano `#FFFFFF` (default, contenido) + neumorfismo `#eaf0f7` (SOLO home+nav) + navy `#062743` (secciones). Tipografía = **Cormorant Garamond + Hanken Grotesk** (no Cardo/Helvetica-Now → `[RATIFICAR-DUEÑO]`).
> 🚦 **BLOQUEO #1 = LOTE-DUEÑO** (PLAN-ENDURECIDO §4): sin secrets Cloudflare (R2/token/CF_DEPLOY) Opus queda en
> dev-local; + abogado toque (i) gatea cutover; + RNT/cifras/matrícula. Pedirlo como UN lote.** La voz de
> Altorra ya se deliberó (comité ×capas de 15 agentes REPROBÓ el borrador de Gemini/Antigravity y la
> reescribió en voz propia) y vive en la skill **`catalogo-voz-altorra`** (repo `skills/` + `~/.claude/skills/`;
> crudo+síntesis en bóveda `2026-07-11-comite-voz-altorra-*`). ⚠️ **NO es hermana de Bersaglio: voz ÚNICA y
> auténtica.** **AHORA:** construir la **HOME** replicando `ALTORRA Portal.dc.html` sobre las primitivas D1
> (styleguide viva en `/design-system`). **Pendiente ratificación del dueño** (§9 skill + ADR §23):
> tú/usted (dual recomendado) · matrícula real (mockups traen `000000`) · RNT real (blocker alojamientos) ·
> contacto oficial (mockups traen `+57 605 123 4567`/`hola@altorra.co` FALSOS) · ubicación eslogan · horario WhatsApp.
> **Diseño: paleta ✅ (§23.8) · tipografía ✅ Cormorant+Hanken (§23.9) · disciplina de color ✅ (solo paleta, oro predomina).**
> **Decidido en D0 (todo en memoria `identidad-marca-inmobiliaria` + `sello-marca-altorra`):** posicionamiento
> **"premium que no excluye"** (lujo+transparencia+calidez; cobertura total; Caribe→nacional) · misión/visión ·
> **eslogan "Seguridad, Legalidad y Confianza"** · paleta **oro/plata DOMINAN (logo), navy discreto, blanco,
> + ocre muralla APROBADO** · sello tipográfico **ALTORRA=Cardo / INMOBILIARIA=Helvetica Now** · lenguaje visual
> **Liquid Glass premium (ref Bersaglio, pero SELLO PROPIO, NO copia; Bersaglio NO es marca hermana)** · editorial
> SOLO en sección "Journal Inmobiliario" · anti-patrones de voz DUROS (sin guiones "—", sin texto literal/funcional,
> sin genérico). ⚠️ **Corrección D1**: lo entregado NO es "Liquid Glass" sino **neumorfismo (home/nav) + flat (contenido) + navy (secciones)** = DUAL-MODE (ADR §23; el "Liquid Glass" era el modelo viejo pre-entrega).
> Board mockup v3 = Artifact `d056097f-ea5d-46ee-9b5a-8959ea3791b3`. Comité D0 crudo → bóveda
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
| **TODO-17** | **Ola 0 — ejecución Opus** (guía = `PLAN-ENDURECIDO-FABLE-2026-07-10.md`): ✅ 0.1 scaffold (§19) · ✅ 0.2 staging LIVE (§21) · ✅ brief abogado (O9) · ✅ FTI-01. **0.7 modelo de datos**: ✅ parte 1 tipos (`62916e1`) · ✅ parte 2 rules+indexes+storage ×3 (`1750f10`) · ✅ **parte 3/3 = capa de datos `client.ts`+REST+cache+tests+gate (OD1, §22 `[REVISAR-FABLE]`, comité ×3)** · ✅ **E2E de la capa de datos con SEED (21/21 emulador: 6 E2E + 15 rules, §22.8)**. **Falta 0.7**: SOLO el E2E "tras cache" (Workers Caching en staging desplegado, gate T9) + deploy de rules (coordinado con retiro legacy — NO ahora). Siguen 0.3 D0/**D1 ✅** (ADR §23) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-18** | **Carril D — Diseño**. ✅ **D0 CERRADO** (posicionamiento + paleta + eslogan/misión/visión + voz destilada en skill `catalogo-voz-altorra`). ✅ **DISEÑO ENTREGADO** por Daniel (8 mockups en `portal/design/`). ✅ **D1 SELLADO** (ADR §23 + §23.8 + §23.9): `tokens.css`+`base.css`+`components.css`+fuentes+styleguide, dual-mode, a11y AA. **Paleta OFICIAL** (§23.8) + **disciplina de color estricta** (§23.9: solo paleta, fondo blanco, DORADO predomina, estados navy+oro+ícono SIN verde/rojo) + **Liquid Glass sutil + card "vitrina"** (neumorfismo protagonista). **Tipografía ✅ DECIDIDA** (Cormorant Garamond + Hanken Grotesk). ▶ **SIGUIENTE**: construir la HOME (réplica `ALTORRA Portal.dc.html`). **Ratificaciones de diseño: TODAS cerradas**; queda operativo: tú/usted · matrícula/RNT/contacto reales (mockups traen placeholders). | 🔄 OPUS | oro/plata mandan; navy discreto; SIN negro |
| **TODO-19** | **Potenciar cerebro** (kickoff §7.3): auditoría Nivel-2 (vence ~2026-07-15, staleDays) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones candidatas C-01..C-39 (R0) contra `30` | 🔄 | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads listos en la skill; los aplican los operadores cars/bersaglio/insema en su próxima sesión | ⏸️ externo | |
| **TODO-21** | **Lote-dueño #0** — ✅ **Cloudflare (cuenta+R2+token+secrets+CF_DEPLOY_ENABLED)** hecho (portal LIVE §21). Restante: ⏰ **RNT decreto cierra 2026-07-11** · permiso DesignSync (1 clic, al 1er sync) · allowlist git push/merge en `.claude/settings.json` (opcional — el push ya funciona) · contratar abogado con brief (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`, listo) · elegir D0 (cuando Opus entregue 3 direcciones). Lotes 1/2/3 → PLAN-ENDURECIDO §4. | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable de la Ola 0** (protocolo cars §300) al volver su cuota. **Cola viva** (carta de derechos §3): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) decisión DIFERIDA del catálogo público (SSG build-time vs doc-índice denormalizado, Ola 1). ~~(c) `platformProxy` inválido~~ ✅ RESUELTO (quitada la opción; adapter v14 sobre Cloudflare Vite plugin auto-emula bindings — L-19). | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

> **2026-07-11 (OPUS 4.8 — Ola 1 · D1 design system)**: sellé D1 (ADR §23) vía workflow `altorra-d1-token-extract`
> (9 extractores → síntesis `--alt-*` → crítica a11y; crudo en bóveda `2026-07-11-d1-tokens-*`). Autoré
> `{tokens,base,components}.css`+fuentes+styleguide `/design-system`. Hallazgos: diseño **DUAL-MODE, NO "Liquid Glass"**;
> la crítica cazó que CUERPO `#6b7c93`+meta `#98a9ba` fallaban AA (no solo el oro) → endurecí con calculadora WCAG.
> Verifiqué EN VIVO por computed styles (no captura → L-22). **PRÓXIMO:** HOME real (réplica `ALTORRA Portal.dc.html`).

> **2026-07-11 (OPUS 4.8 — Carril D · D0, DISEÑO + visión)**: probé el mockup del index en varias vueltas
> (v3 Liquid Glass → v4 editorial → v5 "Vitrina de orfebre" del panel de 6 agentes, ganadora 9/9). Daniel
> **rechazó todas mi mano** (muy "a IA", circo de color, gráficas que no pidió, decoraciones inventadas: sol/
> murallas). **DECISIÓN: Opus NO hace el mockup a mano.** Flujo nuevo: **Opus entrega un PROMPT de la visión →
> Daniel lo genera en su "Claude Design" → descarga → Opus REFINA.** Le entregué (a) el **prompt del index** y
> (b) **`specs/VISION-FUNCIONAL-PRODUCTO.md`** (visión funcional completa del producto, destilada del MEGA-PLAN —
> para que Design entienda el ecosistema). Reglas grabadas en `identidad-marca-inmobiliaria`: **blanco/oro/plata
> mandan, turquí/ocre mínimos** (mucho azul = "circo"), **NO gráficas/charts, NO decoraciones inventadas**,
> ALTORRA siempre MAYÚSCULA, premium NO folksy. **PRÓXIMO:** Daniel genera en Claude Design → me pasa el output → refino.

> **2026-07-11 (OPUS 4.8 — Carril D · D0, VOZ)**: Daniel pegó la guía de voz de **Gemini/Antigravity**.
> Corrí `proceso-decision-fuerte` + `comite-expertos` como **workflow acotado de 15 agentes** (diagnóstico
> → peer-review anónimo → reescritura → síntesis). **Veredicto: guía de Gemini REPROBADA** (eje en
> transparencia = paridad, no en la calidez ownable; claims de liderazgo ilegales para greenfield;
> garantías de resultado; sellos huecos; faltaba multicanal). Reescrita en **voz propia** → skill
> **`catalogo-voz-altorra`** (repo `skills/` + `~/.claude/skills/`). **Verifiqué §3.3 sobre el comité (no
> acaté a ciegas):** cacé 2 fallos del propio comité, **L-VOZ-1** (su barrido "cero raya larga" mintió: 11
> em-dash estructurales, los limpié) y **L-VOZ-2** (alucinó una matrícula `AMC-OFI-...`, dejé placeholder).
> Citas legales en cuarentena (legal-colombia + abogado). Crudo+síntesis en bóveda (`2026-07-11-comite-voz-altorra-*`).
> **PRÓXIMO:** mockup Liquid Glass con la voz. ADR formal + L-VOZ-1/2 a `30` al cierre de D0.

> *(Bitácora D0-marca del 07-11 podada — consolidada en las memorias `identidad-marca-inmobiliaria` +
> `sello-marca-altorra`, el comité D0 crudo en bóveda `2026-07-11-comite-d0-marca-crudo.json`, y ADR §23. §G.4 GC.)*

> *(Bitácora del 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-21 +
> `PLAN-ENDURECIDO`: staging §21, capa de datos+E2E §22/§22.8, platformProxy L-19. §G.4 GC.)*
