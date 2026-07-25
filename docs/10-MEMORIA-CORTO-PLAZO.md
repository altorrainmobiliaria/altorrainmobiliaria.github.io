# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-24 · pivote de misión §61)

> **⭐ FRENTE 0 — FUNDACIÓN OPERATIVA (nuevo arco, mandato Daniel 2026-07-24) = TODO-34 ← SIGUIENTE (sesión
> fresca Fable)**: armar la inmobiliaria COMPLETA con datos reales (procesos, legal, docs, capacitaciones);
> Claude = abogado + todos los empleados a la vez; cerebro dual Code+Chat. Plan F1-F4 en la fila TODO-34.
>
> **FRENTE 1 — portal**: TODO-27 ✅ · TODO-30 mapa ✅ (§55, falta vista foreground) · catálogo §56-§59 ✅
> hasta la FRONTERA pre-cutover (§60). Método fidelidad → L-29/L-24/L-28; mockups en `portal/design/mockups/`.
>
> **FRENTE 2 — PAUTA ✅ LISTA-PARA-ENCENDER** (§33-§37; humo → flag 📣 de `05`; SSoT = skill `pauta-captacion`).
> El encendido REAL converge con el CIERRE DE OBRA → "sí" de Daniel.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` (SSoT) + ADR §23-§23.9.
> Dev: `npm --prefix portal run dev` (4321). (La VOZ sí está EN FORJA — memoria.)
>
> **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención
> documentada: el mapa real de TODO-30, ver su fila) · (c) datos del portal = DEMO (`client.ts` listo) · (d) NUNCA
> dinero sin gate · JAMÁS el 323… personal · sin gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS
> copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · priorizar warns en truncado `--boot` · circularidad boot-budget. Las sentencias §49 (kill-list #6b/#11 · #13 · #1⊂#10 · gate #7b · tableFile) **✅ EJECUTADAS en F0 (§50)**. Flujo obligatorio de cambios: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4 (masa-neta ≤ 0). | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07, regex anclada) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy AÚN se sirve — conservar hasta entonces). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro**: #1-#3 ✅ (§40-§41) · **#4 ✅ `brain:pull` (F1 §51)** · #5 filas del índice auto vía `brain:archive` ✅ (§52; generador completo = opcional) · **#6 ✅ AUTOMATIZADA en el heartbeat** (§52: % por paths en cada boot — hoy **52% 🔴, mes 1 de medición**; >30% dos meses → PODAR doctrina) · #7 sello de vencimiento en hechos >90d (pendiente — candidato a resonancia). | 🟡 #7 | $0 |
| **TODO-29** | 📣 **PAUTA**: humo encendida 07-18 → estado vivo en flag 📣 de `05`. **Paso siguiente**: al agotarse el saldo, verificar FACTURACIÓN → cierra fontanería §4b → calibra la CAMPAÑA REAL (gate = cierre de obra). | 🔥 vigilar | no tocar 7d |
| **TODO-30** | 🗺️ **MapLibre real ✅ CÓDIGO COMPLETO (§55/.8/.9)** — tiles por Worker+Range, verificado E2E con pmtiles.js (z10/12/14 desde staging). **Falta SOLO la vista en foreground** (rAF congelado en pestañas automatizadas, L-34/`31` → la confirma Daniel en su Chrome). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§59; frontera verificada §60)**. Para ver datos reales: (1) **deploy COORDINADO en el cutover** (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. **Lo demás está BLOQUEADO por causas reales (§60.4)**: ficha dinámica → 4 bloques sin dato, 2 con filo legal (§60.2/.3) · botón Republicar → `gestion` SIN auth · purga HMAC → secreto CF (dueño). | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — decisiones ANTES de construir (§60.3)**: (a) dirección exacta = OMITIR siempre (PII) · (b) financiación = legal define disclaimer o se omite la cifra · (c) asesor = `asesorId` en el modelo vs bloque genérico "Equipo ALTORRA" · (d) POIs = omitir en v1. Regla: en real, bloque sin dato se OMITE (jamás heredar el demo). Sus insumos legales saldrán de TODO-34. | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61 = SSoT del arco: mandato + corpus 83 docs con operación VIVA + gaps)**. **PLAN F1-F4 (Fable orquesta, sesión fresca)**: F1 ingesta+triaje del corpus **100% LOCAL** (143 archivos en `Downloads/ALTORRA Company (Legal)/`, Drive ya volcado — §61.8; atajo: `all_docx_content.txt`) · F2 investigación web + consejo externo (`15 §0b`) · F3 neurogénesis (lóbulo OPERACIÓN + skills financiero·legal·contable·administración·arriendos larga/corta + **cerebro DUAL Code+Chat**) · F4 entregables reales (manuales·contratos faltantes·checklists·capacitaciones). Gates: legal best-effort `.gov.co` · L-29 nada inventado · docs del dueño traen ERRORES → triaje. | ⭐ SIGUIENTE (Fable) | §61 |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — APROBADO por Daniel (2026-07-20)**. SSoT = bóveda `2026-07-20-cerebro-v2-sintesis-propuesta.md` + regla de admisión de maquinaria. **F0 ✅ (§50)** kill-list + offsite probado · **F1 ✅ (§51)**: canónico en `brain-private/kernel/` + `brain:pull` + gate #0 BLOQUEANTE — **×4 en v1.4.1, fix propagado <2 min**. Deuda visible en hermanos (cars 7 · bersaglio 8 problemas + auditorías vencidas) = SUS carriles. `core.hooksPath` diferido a F2/F3. **🏁 v2 NÚCLEO COMPLETO ✅** (F0 §50 · F1 §51 · F2 §52 · F3 §53, kernel **v1.6.0** ×4): las 4 clases de dolor probadas quedaron imposibles-por-diseño o empujadas-por-gate. **Restos vivos**: (a) F2-s2 — cablear hook SessionStart en los 3 hermanos (kernelFiles+settings; carril de cada repo, la instrucción vive en la skill) · (b) **PODA REAL de doctrina** cuando la métrica del banner marque >30% dos meses (criterio de salida — hoy 52% 🔴, mes 1 de medición) · (c) TODO-31: solo queda la verificación de Daniel (recovery codes). Mantenimiento mensual: el banner avisa TOCA → Daniel dice "haz el mantenimiento mensual" → skill `mantenimiento-general`. | 🟡 restos a/b/c | §53 · bóveda |

---

## 📝 Bitácora (efímera)

> **▶ RELEVO A SESIÓN FRESCA (2026-07-24, cierre del arco portal → arranca FUNDACIÓN)**: en 2 días quedó
> **TODO-30 mapa ✅** (§55) y **TODO-22 catálogo ✅ hasta la frontera pre-cutover** (§56-§59; frontera y ficha
> → §60). 🏷️ Implementador = **Opus 5** desde hoy (históricos NO se reescriben). **⭐ SIGUIENTE = TODO-34
> FUNDACIÓN (sesión fresca, FABLE orquesta)** — su fila trae corpus+gaps+plan F1-F4; arranque: leer §61(+.8);
> corpus 100% LOCAL (143 archivos, RUT+Cámara 09-06-2026 — Drive innecesario).
> **Accionables vivos**: (a) 🔁 sinapsis `15 §0b` a cars/bersaglio (SUS sesiones) · (b) ⚠️ HUMO: verificar
> Ads Manager (TODO-29) · (c) ⛔ NO tocar: diseño sellado · deuda de hermanos · kernel local (→ TODO-23).
