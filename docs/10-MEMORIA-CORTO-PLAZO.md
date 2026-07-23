# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-20, auditoría Nivel-2 #4 → §49)

> **FRENTE 1 — portal**: TODO-27 ✅ CERRADO → §43-§48 + L-29 + bóveda. **Siguiente = TODO-30 (MapLibre, EN FRESCO —
> su fila ya trae tiles sellados + criterio de mapa)**. Método de fidelidad → L-29/L-24/L-28 (`30`); piezas
> reusables → `99 §32.10-.13` (5 cards NO intercambiables + `.alt-rail`/`.alt-btn-sweep`); mockups en `portal/design/mockups/`.
>
> **FRENTE 2 — PAUTA: ✅ LISTA-PARA-ENCENDER** (§33-§37; estado vivo de la humo → flag 📣 de `05`). SSoT = skill
> **`pauta-captacion`** (playbook 1ª campaña + setup en orden + gates + vigencia fechada). El encendido de la campaña
> REAL converge con el CIERRE DE OBRA (números matrícula/RNT + privacidad + píxel/GA4 + landing → EN PAUSA → "sí" de Daniel).
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
| **TODO-30** | 🗺️ **MapLibre real — IMPLEMENTADO (§55, Opus 2026-07-23)**: isla `altorra-map.ts` + ruta R2 `tiles/[file].ts` + fallback esquemático; 5 gates verdes + camino vivo (marcadores+card↔pin+404 limpio; bug 500 `locals.runtime.env`→`cloudflare:workers` cazado). **Faltan 2 compuertas para CERRAR**: (a) generar+subir `cartagena.pmtiles` a R2 (`50 §Tiles`; go-pmtiles) · (b) verif. VISUAL en Chrome del dueño. Luego: wiring forms→`solicitudes`. | 🟡 2 compuertas | §55 |
| **TODO-22** | **OBRA del catálogo (§54 sellada)**: LECTURA ✅ (§56: `catalogo.get`+rules `indices`+ruta `/api/catalogo`+tests 33 unit/20 rules; ruta DORMIDA, SERP sigue demo). **Falta ESCRITURA**: subsistema de Cloud Functions en el portal + Function `onWrite(propiedades)` rebuild-TOTAL idempotente + debounce/purga/seed/reconciliación (§56.7 + gates §54.5); deploy=cutover. Luego wiring SERP tras flag demo\|live. | 🟡 escritura | §56 |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — APROBADO por Daniel (2026-07-20)**. SSoT = bóveda `2026-07-20-cerebro-v2-sintesis-propuesta.md` + regla de admisión de maquinaria. **F0 ✅ (§50)** kill-list + offsite probado · **F1 ✅ (§51)**: canónico en `brain-private/kernel/` + `brain:pull` + gate #0 BLOQUEANTE — **×4 en v1.4.1, fix propagado <2 min**. Deuda visible en hermanos (cars 7 · bersaglio 8 problemas + auditorías vencidas) = SUS carriles. `core.hooksPath` diferido a F2/F3. **🏁 v2 NÚCLEO COMPLETO ✅** (F0 §50 · F1 §51 · F2 §52 · F3 §53, kernel **v1.6.0** ×4): las 4 clases de dolor probadas quedaron imposibles-por-diseño o empujadas-por-gate. **Restos vivos**: (a) F2-s2 — cablear hook SessionStart en los 3 hermanos (kernelFiles+settings; carril de cada repo, la instrucción vive en la skill) · (b) **PODA REAL de doctrina** cuando la métrica del banner marque >30% dos meses (criterio de salida — hoy 52% 🔴, mes 1 de medición) · (c) TODO-31: solo queda la verificación de Daniel (recovery codes). Mantenimiento mensual: el banner avisa TOCA → Daniel dice "haz el mantenimiento mensual" → skill `mantenimiento-general`. | 🟡 restos a/b/c | §53 · bóveda |

---

## 📝 Bitácora (efímera)

> **▶ 2026-07-23 (día completo — durable en ADRs §49-§56; aquí solo lo vivo)**: Fable cerró el carril cerebro
> (v2 §49-§53 · TODO-31 CERRADO incl. códigos 2FA de Daniel · consejo `15 §0b` · TODO-22 decisión §54+.8).
> Opus implementó **TODO-30 mapa** (§55, 2 compuertas: tiles+Chrome) y la **LECTURA del catálogo** (§56).
> **Accionables vivos**: (a) 🔁 sinapsis: cars/bersaglio portan `15 §0b` en SU sesión (`sinapsis-cerebros`) ·
> (b) ⚠️ HUMO a D+5 seguro agotada → verificar Ads Manager con navegador (TODO-29 · fontanería §4b) ·
> (c) ⛔ NO tocar: diseño sellado · deuda de hermanos (SUS sesiones) · kernel local (flujo → TODO-23).
> **SIGUIENTE Opus**: mitad de ESCRITURA del catálogo (TODO-22 · Function, §56.7) o cerrar TODO-30 (tiles).
