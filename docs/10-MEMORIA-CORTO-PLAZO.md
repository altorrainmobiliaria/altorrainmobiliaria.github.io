# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-31 · pivote de misión §61)

> **⭐ FRENTE 0 — FUNDACIÓN OPERATIVA = TODO-34 (mandato Daniel 24-jul)**: armar la inmobiliaria COMPLETA con datos
> reales (procesos, legal, docs, capacitaciones); Claude = abogado + todos los empleados a la vez. Plan en TODO-34.
>
> **FRENTE 1 — portal**: TODO-27 ✅ · TODO-30 mapa ✅ (falta vista foreground) · catálogo §56-§59 ✅ hasta la
> FRONTERA pre-cutover (§60). Fidelidad → L-29/L-24/L-28; mockups en `portal/design/mockups/`.
> **FRENTE 2 — PAUTA ✅ LISTA-PARA-ENCENDER** (§33-§37; SSoT = skill `pauta-captacion`), converge con el CIERRE DE OBRA.
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
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (T9) · deploy de rules (en el cutover, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · warns en truncado `--boot` · circularidad boot-budget · en cola #18-#22 + #17-bis (§73.5). Flujo obligatorio: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4. ⚠️ `brain-kit` sigue SIN git. | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07) · re-apuntar cache/ssotFact al portal en el CUTOVER (K-10/G-12). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro** — #1-#6 ✅ (§40-§41, §51-§52) y **#8 ✅ shard de `30` → hojas `32` (§68) y `33`-meta (§76)**. Vivo: **#7** sello de vencimiento >90d (candidato a resonancia). Costo → TODO-32(b). | 🟡 #7 | $0 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — 4 decisiones ANTES de construir (§60.3)**: dirección exacta · financiación · asesor · POIs. Regla: **bloque sin dato se OMITE** (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§71)**. Kit 00-22 + membrete (`43`). Póliza ✅ · FE-DIAN ⏸️ · 03/04 blindados (§66) · **14 críticos + 23 altos de B-03 aplicados (§70·§71)**. Restan **85 leves** (⚠️ sin escéptico). Retirados: 13 y 23. | 🟢 leves | §71 · `43` |
| **TODO-37** | 🔬 **Hallazgos vivos de la auditoría #6** (tabla → bóveda `2026-08-02-auditoria-cerebro-nivel2-6-inmobiliaria.md`): **los 18 sin escéptico YA VERIFICADOS** (13 con escéptico + 2 por mí; 5 ya estaban cerrados): 2 refutados, el resto degradado a *baja*. **40/44 aplicados** (§83 + lotes 1-7). Quedan **4 abiertos de baja severidad** con su arreglo escrito en la tabla de la bóveda. Anti-engorde: no se retira ningún gate (§83.8). | 🟡 4 bajas | §83 |
| **TODO-32** | 🧠 **CEREBRO v2 ×4** (§50-§53; versión del kernel → su stamp, no aquí). **(a) ✅ CERRADO §72**: heartbeat+handoff+canario ya corren en los 3 hermanos. **(b) vivo**: el banner >30% en LOS CUATRO (cars 43 · bersaglio 61 · insema 56 · inmo 56) — 2º mes ⇒ toca PODA REAL, no añadir. | 🟡 poda (b) | §72 |

---

## 📝 Bitácora (efímera)

> **▶ 🔬 02-ago (§83): AUDITORÍA Nivel-2 #6 — 109 brutos → 44 vivos** (47 refutados). En el kernel:
> #9 era ciego a la fila ✅ sin ADR · borrar una clave del manifest apagaba gates · el boot mentía con
> "cache verificada" · nace #26. Tabla → bóveda. **v1.9.1**: el #7 no veía las carpetas de deliberación —
> la más cara llevaba meses sin fila. El workflow no murió: se **colgó** 37 h con el panel en verde → [[M-08]].
>
> **▶ 01-ago: §81 TODO-36** (candado de boot al kernel, [[M-07]]) · **§82 TODO-35** (6 gates del kit,
> [[LD-07]] · correrlos con `generar-documentos.ps1 -SoloGates`). Detalle en sus ADRs.
>
> **▶ 🔥 PAUTA BERSAGLIO · 🔁 REVISAR LUNES 3-AGO** — `120251090001200439`: $8.000/día, fin 10-ago. S1: **0
> ventas de 33 chats**. **PARADA: sin 1 venta ni 3 visitas al 10-ago → NO recargar.** Detalle → bóveda
> `2026-07-31-pauta-bersaglio-escala-SINTESIS.md` 🛑 NO RELANZAR · skill `meta-ads-diagnostico` D-1..D-12.
> **Daniel**: margen de 3 piezas · foto de topo en oreja.
>
> **▶ ⚖️ KIT — lo decidido y pagado vive en §66-§68 y §70-§71. 🛑 NO RELANZAR** el comité R3, la auditoría
> B-03 ni los 12 planificadores — crudos en bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).
>
> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo): **(1) B-04** — sin contrato de usuario con
> DataCrédito/TransUnion **NO se puede consultar a nadie** aunque el arrendatario firme, y el doc 04 ya se lo
> anuncia: ¿afiliarse, o apoyarse solo en la aseguradora? · **(2) publicar la Política de Datos V2** en
> `/legal/politica-tratamiento-datos` — despliegue, no decisión, y ahora los 24 docs la fijan en **V2 ·
> 28-07-2026**: lo que se publique debe ser ese texto (§71.3) · **(3)** verificar los **recovery codes** (último resto del SPOF, §72) · **(4)** Nº de matrícula y RNT (al cierre de
> obra) + vetar/ajustar los 6 estándares del `02 §2`.
>
> 📜 **LOS ESTATUTOS MANDAN sobre el kit** (V5, art. 8º/13º/24º) → §70.2. [[LD-05]]: abre el documento madre
> ANTES de auditar; entra al paquete de contexto pero es **gitignored** (cédulas de los 3 socios).
> ⛔ **Doc 13 RETIRADO** el 31-jul por Daniel; riesgos asumidos, en su banner.
>
> **⏭️ LO QUE SIGO YO**: los 85 leves del kit (TODO-34) + los vivos de la auditoría (TODO-37). Backlog
> B-01..B-04 en la bóveda.
>
> ⚠️ **Ni los Word ni el manual maestro se editan a mano**: se GENERAN (`generar-documentos.ps1` ·
> `ensamblar-manual.ps1`, §68). Editar el maestro directo fue lo que duplicó y desincronizó el capítulo 2.
