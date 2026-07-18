# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (cierre 2026-07-18, sesión Fable §33)

> **Dos frentes abiertos, en este orden:**
>
> **FRENTE 1 — TODO-27: cerrar los MEDIA/BAJA de fidelidad del portal** (§32.24). **FICHA ✅ (§43) · TURISMO ✅ (§45).**
> La síntesis de bóveda `2026-07-17-reauditoria-fidelidad-sintesis.md` es AUTOCONTENIDA (§33 la parcheó): lista 1:1
> + tabla página→mockup→impl + bloque **"Qué NO corregir (intencional)"** — leerla ANTES de tocar. Pendientes (19):
> **estancias 8 · serp 7 · home 2 · publicar 2.** ⚠️ Los "ALTA ✅" de la síntesis madre NO son de fiar
> 1:1: la 3ª card ALTA de la FICHA nunca se corrigió (§43, el commit `3a66a69` era HOME) — verificar cada ALTA vs mockup.
> **MÉTODO (L-29/L-24)**: bloque del `.dc.html` → corregir TEXTUAL → re-auditar adversarial ANTES de decir "fiel".
> NUNCA inventar. Capas: build → estructura → computed (miente con `transition`, L-28) → screenshot Chrome → diff
> vs fuente. Reusar piezas hechas (`.alt-rail`, `.alt-btn-sweep`, 6 cards NO intercambiables — ver síntesis).
>
> **FRENTE 2 — PAUTA: ✅ LISTA-PARA-ENCENDER** (§33-§37). SSoT = skill **`pauta-captacion`**
> (orquestadora: playbook 1ª campaña + setup en orden + gates + vigencia oficial fechada). Encendido converge
> con el CIERRE DE OBRA (números matrícula/RNT + privacidad publicada + píxel/GA4 + landing verificada →
> campaña EN PAUSA → "sí" de Daniel). Lotes TikTok → verificar → backlog `compartido-marketing/` → skills.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `tokens.css` + ADR §23-§23.9 + memorias): navy `#062743` · blanco ·
> oro `#D4AF37` · plata `#BFC3C9` · grises fríos; fondo blanco, ORO predomina, sin verde/rojo/negro; Cormorant +
> Hanken; neu+glass DUAL-MODE. Dev: `npm --prefix portal run dev` (4321). (La VOZ sí está EN FORJA — memoria.)
>
> **🚦 BLOQUEADORES (solo Daniel)**: **matrícula y RNT YA EXISTEN** ✅ (2026-07-18) — los NÚMEROS los entrega al
> CIERRE DE OBRA (web lista y confiable primero; hasta entonces footer `000000` y CERO pauta — Ley 820 art. 31
> exige el nº en publicidad de arriendo). Falta: dirección física. Contacto oficial ✅.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup · (c) datos del
> portal = DEMO (`client.ts` listo) · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin gráficas · ALTORRA
> MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: entrega de Nº matrícula + Nº RNT (ya existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-22** | **Auditoría Fable**: (a) ADR §22 `[REVISAR-FABLE]` (capa de datos); (b) decisión catálogo público SSG vs doc-índice (gatea datos reales). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (owner=**INMOBILIARIA**, escritor único ×4 — el wording "cars" era stale, §41): K-01/02/04/05/09 + §33: priorizar warns en truncado `--boot` · gate #7 debe ver GIT de la bóveda · circularidad boot-budget. 1er fix aplicado 07-18 (✅-falso, §41); resto de K abiertos. | 🔴 kernel | §33 G-09 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07, regex anclada) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy AÚN se sirve — conservar hasta entonces). K-06 ✅ CERRADO §33 (espejo en bóveda). | 🟡 abierto | |
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD**: 13 ALTA ✅ · **FICHA ✅ (§43) · TURISMO ✅ (§45)** · **19 MEDIA/BAJA pendientes**: estancias 8 · serp 7 · home 2 · publicar 2. Método L-29: diff vs `.dc.html` + re-audit adversarial. ⚠️ verificar los "ALTA ✅" de cada página 1:1 (uno se había perdido en la ficha). | 🔄 OPUS | Frente 1 |
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda): #1 ✅ (caja negra, §40) · **#2 ✅ 07-18 (§41)**: `boot-gate.mjs` bloqueante + poda −982c + one-in-one-out §G.5 + fix kernel ×3 · #3 ✅ · **sigue #4** `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento (>90d). | 🔄 sigue #4 | $0 |
| **TODO-29** | 📣 **PAUTA**: skill ✅ · Meta ordenado ✅ · humo montada ✅ · **HUMO ENCENDIDA 07-18 ✅ (§42.8)** — anuncio "Activo" (revisión aprobó), $4.000/día vs prepago ~$5k → muere sola ~1 día. **VIGILAR (no tocar)**: entrega/CPM real · chats entrantes (responder; saludo auto ya sale) · planilla CPQL desde el 1er lead · al agotarse el saldo verificar FACTURACIÓN → cierra fontanería §4b y calibra la CAMPAÑA REAL (gate = cierre de obra: matrícula/RNT + privacidad + píxel+GA4 + landing). | 🔥 VOLANDO | no tocar 7d |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (OPUS-4.8 — §45)**: **TODO-27 turismo ✅** — 8 hallazgos (T1 #inversión a copy+grid-3-cards+CTA sin
> foto · T2-T3 copy/CTA · T4-T5 zonas card-blanca+kicker+"Ver estadías" · T6-T8 eyebrow/hero/email). Verificado build+
> HTML+DOM vivo + re-audit adversarial (8+1 agentes → 8/8 FIEL, crítico 0 nuevas). Bóveda `2026-07-18-turismo-reaudit-*`.
> Sigue TODO-27: estancias 8 · serp 7 · home 2 · publicar 2.

> **2026-07-18 (FABLE-5 — §44)**: **brain-kit v1.0 ✅ ENTREGADO** — kit de neurogénesis para el amigo de Daniel
> (ZIP en `Desktop\brain-kit-v1.0.zip`; Daniel lo pasa por WhatsApp; instala el Fable del amigo con
> `INSTALACION-FABLE.md`). Verificación adversarial 4 rompedores → 25 hallazgos (1 bloqueante) TODOS aplicados;
> 0 fugas. Fuente del kit: `GitHub/brain-kit/` (futuras versiones = editar → re-verificar → re-zipear).
> Detalle → §44 + bóveda `2026-07-18-brain-kit-verificacion-*`.

> **2026-07-18 (OPUS-4.8 — §43)**: **TODO-27 ficha ✅** — 8 hallazgos + la 3ª card ALTA que §32.24 nunca tocó
> (`3a66a69` era HOME, no la ficha) + 1 del crítico de completitud. Verificado: build + DOM vivo + toggle real +
> **re-audit adversarial** (9+1 agentes → 8/9 FIEL). L-28 recurrió (computed miente con `transition`). Bóveda `2026-07-18-ficha-reaudit-*`.

> *(Bitácora 07-17/07-18 §32-§42 + relevo a Opus podados — consolidados en ADR §32.14-.24 / §41 / §42 / §43 + L-29/L-32 + bóveda. Constraints vivos → TODO-23/27/28/29 + 05. §G.4 GC.)*
