# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (cierre 2026-07-18, sesión Fable §33)

> **Dos frentes abiertos, en este orden:**
>
> **FRENTE 1 — TODO-27: cerrar los MEDIA/BAJA de fidelidad del portal** (§32.24). **FICHA ✅ (§43) · TURISMO ✅ (§45) · ESTANCIAS ✅ (§46) · SERP ✅ (§47).**
> La síntesis de bóveda `2026-07-17-reauditoria-fidelidad-sintesis.md` es AUTOCONTENIDA (§33 la parcheó): lista 1:1
> + tabla página→mockup→impl + bloque **"Qué NO corregir (intencional)"** — leerla ANTES de tocar. Pendientes (4, los
> más livianos): **home 2 · publicar 2.** ⚠️ Los "ALTA ✅" de la síntesis madre NO son de fiar 1:1 (la 3ª card de la FICHA
> §43 y los 5 listings de /arrendar §47 nunca se corrigieron); el crítico caza íconos SVG bespoke fuera de lista (ficha/estancias).
> 🔸 **PENDIENTE de Daniel (§47)**: ¿/arrendar con 1 card honesto hasta Firestore, o cards demo marcadas?
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
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD**: 13 ALTA ✅ · **FICHA (§43)·TURISMO (§45)·ESTANCIAS (§46)·SERP (§47) ✅** · **4 MEDIA/BAJA pendientes**: home 2 · publicar 2. Método L-29: diff vs `.dc.html` + re-audit adversarial. 🔸 pend. Daniel: /arrendar 1 card (§47). | 🔄 OPUS | Frente 1 |
| **TODO-28** | 🧠 **Endurecer el cerebro** (comité §33, crudo en bóveda): #1 ✅ (caja negra, §40) · **#2 ✅ 07-18 (§41)**: `boot-gate.mjs` bloqueante + poda −982c + one-in-one-out §G.5 + fix kernel ×3 · #3 ✅ · **sigue #4** `brain:kernel-pull` · #5 índice `00` generado · #6 métrica costo-del-cerebro (>30% = bandera roja) · #7 sello de vencimiento (>90d). | 🔄 sigue #4 | $0 |
| **TODO-29** | 📣 **PAUTA**: skill ✅ · Meta ordenado ✅ · humo montada ✅ · **HUMO ENCENDIDA 07-18 ✅ (§42.8)** — anuncio "Activo" (revisión aprobó), $4.000/día vs prepago ~$5k → muere sola ~1 día. **VIGILAR (no tocar)**: entrega/CPM real · chats entrantes (responder; saludo auto ya sale) · planilla CPQL desde el 1er lead · al agotarse el saldo verificar FACTURACIÓN → cierra fontanería §4b y calibra la CAMPAÑA REAL (gate = cierre de obra: matrícula/RNT + privacidad + píxel+GA4 + landing). | 🔥 VOLANDO | no tocar 7d |

---

## 📝 Bitácora (efímera)

> **2026-07-18 (OPUS-4.8 — §47)**: **TODO-27 serp ✅** — 7 hallazgos + el ALTA de /arrendar (5 listings inventados,
> nunca corregido). /comprar=4 venta + /arrendar=1 arriendo REALES (sin fakes) · Más filtros responde · sombra scroll
> · 3ª vía vertical · precios pelados. Re-audit 7+1 → 8/8 FIEL, 0 fallos tooling, 0 nuevas. 2 decisiones: arrendar 1
> card (🔸→Daniel) · corazón unificado. Aprendizaje: páginas con PropertyCard = 0 deriva de íconos SVG (vs ficha/estancias).
> Bóveda `2026-07-18-serp-reaudit-*`. Sigue TODO-27: home 2 · publicar 2.

> **2026-07-18 (OPUS-4.8 — §46)**: **TODO-27 estancias ✅** — 8 hallazgos (galería mosaico + "Ver 18 fotos" · reserva
> prellena fechas · breadcrumb · Interior=villa-modern · orden cabecera) + 2 íconos del crítico. Re-audit 8+1 → 8/8 FIEL.
> Bóveda `2026-07-18-estancias-reaudit-*`.

> *(Bitácora 07-17/07-18 §32-§45 + brain-kit §44 + relevo a Opus podados — consolidados en ADR §32.14-.24 / §41-§45 + L-28/L-29/L-32 + bóveda. Serie fidelidad: ficha §43 · turismo §45 · estancias §46; el crítico de completitud caza íconos SVG fuera de lista. Constraints vivos → TODO-23/27/28/29 + 05. §G.4 GC.)*
