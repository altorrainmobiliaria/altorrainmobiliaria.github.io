# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-24 · pivote de misión §61)

> **⭐ FRENTE 0 — FUNDACIÓN OPERATIVA = TODO-34 (mandato Daniel 24-jul)**: armar la inmobiliaria COMPLETA con datos
> reales (procesos, legal, docs, capacitaciones); Claude = abogado + todos los empleados a la vez. Plan en TODO-34.
>
> **FRENTE 1 — portal**: TODO-27 ✅ · TODO-30 mapa ✅ (falta vista foreground) · catálogo §56-§59 ✅ hasta la
> FRONTERA pre-cutover (§60). Fidelidad → L-29/L-24/L-28; mockups en `portal/design/mockups/`.
>
> **FRENTE 2 — PAUTA ✅ LISTA-PARA-ENCENDER** (§33-§37; SSoT = skill `pauta-captacion`). El encendido REAL
> converge con el CIERRE DE OBRA → "sí" de Daniel.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` + ADR §23-§23.9.
> Dev: `npm --prefix portal run dev` (4321). **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención:
> el mapa de TODO-30) · (c) datos del portal = DEMO · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin
> gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · priorizar warns en truncado `--boot` · circularidad boot-budget. Flujo obligatorio: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4. | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy aún se sirve). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro**: #1-#3 ✅ (§40-§41) · **#4 ✅ `brain:pull` (F1 §51)** · #5 filas del índice auto vía `brain:archive` ✅ (§52; generador completo = opcional) · **#6 ✅ AUTOMATIZADA en el heartbeat** (§52: % por paths en cada boot — hoy **52% 🔴, mes 1 de medición**; >30% dos meses → PODAR doctrina) · #7 sello de vencimiento >90d (candidato a resonancia) · **#8 SHARD de `30`** (rebasó el tope; venía al 96% — extraer familia a hermana, no recortar más). | 🟡 #7 #8 | $0 |
| **TODO-29** | 📣 **PAUTA**: humo encendida 07-18 → estado vivo en flag 📣 de `05`. **Paso siguiente**: al agotarse el saldo, verificar FACTURACIÓN → cierra fontanería §4b → calibra la CAMPAÑA REAL (gate = cierre de obra). | 🔥 vigilar | no tocar 7d |
| **TODO-30** | 🗺️ **MapLibre real ✅ CÓDIGO COMPLETO (§55)** — tiles por Worker+Range, verificado E2E. **Falta SOLO la vista en foreground** (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel en su Chrome). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — decisiones ANTES de construir (§60.3)**: dirección exacta = OMITIR (PII) · financiación = disclaimer legal o se omite la cifra · asesor = `asesorId` vs bloque genérico · POIs fuera en v1. Regla: bloque sin dato se OMITE (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§66)**. Sistema documental **00-23 COMPLETO** + **membrete corporativo** (los 24 Word se generan, `43 §Documentos corporativos`). Póliza **DECIDIDA ✅** El Libertador + sus 2 cambios de proceso propagados · **FE-DIAN ⏸️ CONGELADA** · **contratos 03/04 blindados → ADR §66** (pagaré retirado · ALTORRA arrienda en nombre propio · dictámenes propios). Pelotas y acciones → `00-LEEME`. | 🔄 EN CURSO | §66 · `43` |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — 🏁 NÚCLEO COMPLETO ✅** (F0 §50 · F1 §51 · F2 §52 · F3 §53; kernel **v1.6.0** ×4; SSoT de la propuesta en bóveda). **Restos vivos**: (a) cablear hook SessionStart en los 3 hermanos (carril de cada repo; instrucción en la skill) · (b) **PODA REAL de doctrina** cuando el banner marque >30% dos meses (hoy 52% 🔴, mes 1) · (c) TODO-31: solo falta la verificación de Daniel (recovery codes). Mantenimiento mensual: el banner avisa → Daniel pide "haz el mantenimiento mensual" → skill `mantenimiento-general`. | 🟡 restos a/b/c | §53 · bóveda |

---

## 📝 Bitácora (efímera)

> **▶ 🔥 PAUTA BERSAGLIO semana1 EN VIVO (27-jul→3-ago)**: campaña `120250983749280439` · adset
> `120250983973160439` · **$13.000/día** · 3 anuncios aprobados. Plan+umbrales → bóveda
> `2026-07-27-plan-pauta-semana1-SINTESIS.md`; cuentas/IVA → `activos-meta §Bersaglio`. ⛔ NO editar días 1-7.
> **Pelota Daniel**: guion WhatsApp al equipo (Tania/Daniela/Kary 9:30-18:30) + precios amatista/dúo.
>
> **▶ ⚖️ BLINDAJE DE CONTRATOS → ADR §66 (28-jul)**. Pagaré RETIRADO · **ALTORRA arrienda EN NOMBRE PROPIO**
> (C.Co. 1262; decisión de Claude bajo delegación, revierte la del 27-jul por el art. 74 CGP) · dictámenes propios
> en vez de "pendiente de abogado" (*"el abogado mío eres tú"*). Comité ×6 + consejo ×2: 136→126 hallazgos.
> **Aplicadas ya** (2 commits en bóveda; detalle íntegro en §66).
>
> **⏭️ FALTA (sesión fresca, en este orden):**
> 1. **Última tanda del doc 04**: limpiar notas ⟦⟧ y ⟦PENDIENTE⟧ del texto que se firma (una dice "pendiente de
>    abogado" y otra confiesa que un texto no se verificó) · NOTA PARA DANIEL desactualizada (dice que la figura de
>    firma sigue abierta) · mérito ejecutivo (VIGÉSIMA CUARTA) enumera de menos · recibos sin imputación de pago ·
>    inventario/silencio · "valor de bien nuevo" · codeudor. **Síntesis con el texto exacto** →
>    `scratchpad/comite-sintesis.md` (items 12-30); si se perdió → output del workflow `ww4v7o1wr`.
> 2. **Comité ACOTADO de re-revisión** sobre los contratos ya corregidos, con foco en lo que **nadie ha auditado**:
>    la figura de ALTORRA arrendadora en nombre propio y el fondo de reserva frente al art. 16.
> 3. **Consejo externo R3** = caza de REGRESIONES sobre el texto final, entregándole el registro de cambios
>    (protocolo de 3 rondas → skill `proceso-decision-fuerte` §🥊). **El prompt va EN EL CHAT.**
> 4. Cierre: cuando una ronda no produzca hallazgo CRÍTICO ni MAYOR confirmado. Luego regenerar Word + copiar a
>    `Downloads\ALTORRA Company (Legal)\…\KIT ALTORRA`.
>
> ⚠️ **No volver a pedir el nº de matrícula** (Daniel lo entrega al cierre de obra). **No editar los Word a mano.**
>
> **▶ 🖨️ MEMBRETE CORPORATIVO ✅ (28-jul)**: los 24 Word se **generan** desde el contrato REAL de ALTORRA
> (Century Gothic 9 · Carta · códigos CAD/CAR+21). Detalle → `43 §Documentos corporativos`.
