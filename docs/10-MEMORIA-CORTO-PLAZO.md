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
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · priorizar warns en truncado `--boot` · circularidad boot-budget. Flujo obligatorio: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4. | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy aún se sirve). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro** — #1-#6 ✅ (§40-§41, §51-§52) y **#8 ✅ shard de `30` → hoja `32` (§68)**. Vivo: **#7** sello de vencimiento >90d (candidato a resonancia). El banner de costo marca **55% 🔴** (mes 1; >30% dos meses → PODAR doctrina). | 🟡 #7 | $0 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre real ✅ CÓDIGO COMPLETO (§55)** — tiles por Worker+Range, verificado E2E. **Falta SOLO la vista en foreground** (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel en su Chrome). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — decisiones ANTES de construir (§60.3)**: dirección exacta = OMITIR (PII) · financiación = disclaimer legal o se omite la cifra · asesor = `asesorId` vs bloque genérico · POIs fuera en v1. Regla: bloque sin dato se OMITE (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§68)**. Kit 00-23 + membrete (`43`). Póliza ✅ · FE-DIAN ⏸️ · 03/04 blindados (§66). **Los 22 restantes AUDITADOS ✅ (§68)** — faltan por APLICAR los **134 vivos**, uno a la vez. | 🔄 aplicar §68 | §66/§68 · `43` |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — 🏁 NÚCLEO COMPLETO ✅** (F0-F3, §50-§53; kernel **v1.6.0** ×4). **Restos**: (a) hook SessionStart en los 3 hermanos · (b) PODA REAL de doctrina si el banner >30% dos meses. Mensual: el banner avisa → skill `mantenimiento-general`. | 🟡 restos a/b | §53 |
| **TODO-35** | 🛡️ **El kit legal no tiene linter** (auditoría #5, N5-05 · CRÍTICO): `brain:check` protege la doc del negocio con 16 chequeos; los **24 documentos que la empresa FIRMA** solo tienen el gate de marcas. **Ningún gate cruza documento↔documento** — por eso el `00-LEEME` proclamó la figura derogada sin que nadie lo notara. Construir chequeos de consistencia (figura · cifras vs 01/02 · remisiones · URLs declaradas). | 🔴 abierto | §69 |
| **TODO-31** | 🛡️ **SPOF del sistema** (de la auditoría #4; perdió su fila → restituida en §69): (a) todo ×4 —repos, bóveda, espejos— cuelga de **1 cuenta + 1 disco**: falta bundle offsite mensual · (b) **canario del harness**: el boot cuelga de hooks SessionStart y si cambia el schema muere EN SILENCIO · (c) recovery codes: los verifica Daniel. | 🔴 a/b | §49·§69 |

---

## 📝 Bitácora (efímera)

> **▶ 🔥 PAUTA BERSAGLIO semana1 EN VIVO (27-jul→3-ago)**: campaña `120250983749280439` · adset
> `120250983973160439` · **$13.000/día** · 3 anuncios OK. ⛔ NO editar días 1-7. Plan+umbrales → bóveda
> `2026-07-27-plan-pauta-semana1-SINTESIS.md`. **Pelota Daniel**: guion WhatsApp al equipo + precios amatista/dúo.
>
> **▶ ⚖️ KIT — lo ya decidido y ya pagado vive en ADR §66 · §67 · §68** (figura en nombre propio · pagaré
> retirado · gate de emisión · fuente única del manual). 🛑 **NO RELANZAR** el comité R3 (18,8M tok) ni la
> auditoría B-03: crudos en bóveda `2026-07-28-comite-r3-contratos/` y `2026-07-28-auditoria-kit-b03/`.
>
> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo): **(1) B-04** — sin contrato de usuario con
> DataCrédito/TransUnion **NO se puede consultar a nadie** aunque el arrendatario firme, y el doc 04 ya se lo
> anuncia: ¿afiliarse, o apoyarse solo en la aseguradora? · **(2) publicar la Política de Datos** en
> `/legal/politica-tratamiento-datos` (los 24 docs ya la declaran ahí; es despliegue, no decisión) ·
> **(3)** Nº de matrícula y RNT (al cierre de obra) + vetar/ajustar los 6 estándares del `02 §2`.
>
> **▶ 🔍 B-03 CERRADA (113 agentes): 191 brutos → 57 refutados → 134 VIVOS (14 críticos), SIN APLICAR.**
> ⚠️ En **33 de los 42 serios el escéptico dictaminó que la corrección propuesta ROMPE algo** (79%): se aplica
> el `remedio_mejor`, no el del auditor (LD-01 a escala). Lo gordo: el **`00-LEEME` proclama la figura
> DEROGADA** —es la primera hoja— · **`11-HOSPEDAJE`** retiene el 100% (ineficaz, Ley 1480 art. 43.5) e IVA de
> un servicio no prestado · **`13-ACCIONISTAS` es infirmable** (pena sin monto, supramayoría en blanco).
> Leer `SINTESIS-CURADA.md` de la bóveda; NO relanzar (12,8M tok).
>
> **⏭️ LO QUE SIGO YO** (backlog **B-01..B-04**, bóveda `_notas/BACKLOG-REVISION-KIT.md`): **(1) aplicar los
> 191 hallazgos de B-03**, uno a uno · (2) copiar el kit a `…\KIT ALTORRA` (los Word de allá son del 28-jul).
> ✅ Cerrados en §68/§69: art. 1096 · fuente única del manual · las marcas (los `⟦PENDIENTE⟧` **se quedan**:
> el manual los declara como convención, LD-03) · auditoría Nivel-2 #5.
>
> ⚠️ **Ni los Word ni el manual maestro se editan a mano**: se GENERAN (`generar-documentos.ps1` ·
> `ensamblar-manual.ps1`, §68). Editar el maestro directo fue lo que duplicó y desincronizó el capítulo 2.
