# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (cierre 2026-07-18, sesión Fable §33)

> **Dos frentes abiertos, en este orden:**
>
> **FRENTE 1 — TODO-27: cerrar los 35 hallazgos MEDIA/BAJA de fidelidad del portal** (§32.24).
> La síntesis de bóveda `2026-07-17-reauditoria-fidelidad-sintesis.md` es AUTOCONTENIDA (§33 la parcheó): lista 1:1
> + tabla página→mockup→impl + bloque **"Qué NO corregir (intencional)"** — leerla ANTES de tocar. Por página:
> **ficha 8 (LA MÁS URGENTE, sin tocar)** · turismo 8 · estancias 8 · serp 7 · home 2 · publicar 2.
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
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD**: 13 ALTA ✅ · **35 MEDIA/BAJA pendientes** (ficha 8 = primero). Síntesis de bóveda ya AUTOCONTENIDA (§33). Método L-29: diff vs `.dc.html` + re-auditar adversarial. | 🔄 OPUS | Frente 1 |
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda): #1 ✅ (caja negra, §40) · **#2 ✅ 07-18 (§41)**: `boot-gate.mjs` bloqueante + poda −982c + one-in-one-out §G.5 + fix kernel ×3 · #3 ✅ · **sigue #4** `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento (>90d). | 🔄 sigue #4 | $0 |
| **TODO-29** | 📣 **PAUTA — skill `pauta-captacion` CONSTRUIDA** ✅ (§37: playbook 1ª campaña Leads+CTWA+Higher-Intent · setup en orden · CAPI-Worker $0 · 8 parches de vigencia · CPQL propia = benchmark). **Qué falta para ENCENDER** (converge con cierre de obra): números matrícula/RNT (Daniel) · política de privacidad publicada · píxel+GA4 en el portal · landing verificada → campaña EN PAUSA → "sí" de Daniel. WhatsApp↔página FB ✅ (07-18, Conectado + CTWA listo). Mientras: lotes TikTok al backlog + creativos con `ad-creative`+Brief. | 🟢 lista p/encender | gate=obra |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (FABLE-5 — §41, 2ª sesión del día)**: HUMO: Ads-MCP **re-verificado → la cuenta SIGUE sin
> habilitar** (rollout Meta) → montaje reducido a runbook de 10 min (bóveda `2026-07-18-humo/
> montaje-ads-manager-runbook.md`; por MCP si habilita, o EN VIVO con Daniel — NUNCA UI de dinero desatendida).
> **TODO-28 #2 ✅** (gate + poda + fix kernel propagado ×3) → **ADR §41**. 📌 `multimedia/Piezas/*.jpeg` suelto
> = duplicado EXACTO (md5) del fondo Flow ya respaldado en bóveda → no commitear; Daniel decide si lo borra.
> **▶ RETOMAR**: (1) reintentar Ads-MCP al abrir sesión (`ads_get_ad_accounts`) → montar HUMO **EN PAUSA**
> (runbook listo; saldo = pendiente-dueño; dinero = "sí" aparte) · (2) **TODO-28 #4** (`brain:kernel-pull`)
> → #5-#7 · (3) **lotes TikTok / creativos backlog** (embudo §0b). (Ficha del portal sigue en Opus — Frente 1.)

> *(Bitácora 07-17 §32 podada — consolidada en ADR §32.14-.24 + L-29 + síntesis de bóveda. §G.4 GC.)*
