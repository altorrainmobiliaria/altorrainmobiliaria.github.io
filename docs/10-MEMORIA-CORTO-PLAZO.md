# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (cierre 2026-07-18, sesión Fable §33)

> **Dos frentes abiertos, en este orden:**
>
> **FRENTE 1 — TODO-27 ✅ CERRADO (§48)**: las **6 páginas del portal FIELES** al mockup (ficha §43 · turismo §45 ·
> estancias §46 · serp §47 · home+publicar §48). 35 MEDIA/BAJA + 3 ALTA "fantasma" (marcados ✅ pero nunca corregidos:
> ficha 3ª card · estancias galería · serp /arrendar) + 3 íconos del crítico. Método L-29 validado. Detalle → §43-§48 + bóveda.
> **Go-forward del portal Ola 1** (NO es TODO-27): las 6 páginas fieles YA están LIVE en staging (la CI auto-despliega
> cada push, §3.3). /arrendar = **1 card honesto hasta Firestore** (Daniel decidió 07-18). Fronts abiertos: MapLibre
> real · datos Firestore (TODO-22, carril Fable) · wiring forms→`solicitudes` (gate legal Ley 1581).
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
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda): #1 ✅ (caja negra, §40) · **#2 ✅ 07-18 (§41)**: `boot-gate.mjs` bloqueante + poda −982c + one-in-one-out §G.5 + fix kernel ×3 · #3 ✅ · **sigue #4** `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento (>90d). | 🔄 sigue #4 | $0 |
| **TODO-29** | 📣 **PAUTA**: skill ✅ · Meta ordenado ✅ · humo montada ✅ · **HUMO ENCENDIDA 07-18 ✅ (§42.8)** — anuncio "Activo" (revisión aprobó), $4.000/día vs prepago ~$5k → muere sola ~1 día. **VIGILAR (no tocar)**: entrega/CPM real · chats entrantes (responder; saludo auto ya sale) · planilla CPQL desde el 1er lead · al agotarse el saldo verificar FACTURACIÓN → cierra fontanería §4b y calibra la CAMPAÑA REAL (gate = cierre de obra: matrícula/RNT + privacidad + píxel+GA4 + landing). | 🔥 VOLANDO | no tocar 7d |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (OPUS-4.8 — §48)**: **🏁 TODO-27 ✅ CERRADO** — las **6 páginas del portal fieles al mockup** (ficha
> §43 · turismo §45 · estancias §46 · serp §47 · home+publicar §48). 35 MEDIA/BAJA + **3 ALTA "fantasma"** (marcados ✅
> pero nunca corregidos → contar contra la FUENTE, L-29) + 3 íconos del crítico. 5 workflows de re-audit adversarial
> (~4.3M tok). Go-forward del portal → ver Foco (MapLibre/Firestore/forms/decisión /arrendar). Bóveda `2026-07-18-*-reaudit-*`.

> *(Bitácora 07-17/07-18 §32-§47 + brain-kit §44 + serie de fidelidad §43-§48 podados — consolidados en ADR + L-28/L-29/L-32 + bóveda. Constraints vivos → TODO-23/28/29 + 05. §G.4 GC.)*
