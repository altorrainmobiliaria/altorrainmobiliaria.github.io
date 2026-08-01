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
| **TODO-23** | 🔧 **Kernel hardening RESTANTE** (owner=INMOBILIARIA): K-01/02/04/05/09 (§30.4) · warns en truncado `--boot` · circularidad boot-budget · **6 chequeos de la auditoría de insemastereo (#17-#22, §73)** — el **#17 (leer el git del PROPIO repo)** habría cazado su `05` mintiendo el día 1. Flujo obligatorio: editar CANÓNICO → bump `VERSION` → `brain:pull` ×4. | 🟡 K restantes | §50 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07) · re-apuntar cache/ssotFact al portal en el CUTOVER (K-10/G-12). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro** — #1-#6 ✅ (§40-§41, §51-§52) y **#8 ✅ shard de `30` → hoja `32` (§68)**. Vivo: **#7** sello de vencimiento >90d (candidato a resonancia). Costo → TODO-32(b). | 🟡 #7 | $0 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada y fontanería §4b OK (estado → flag 📣 de `05`). Resta **calibrar la campaña REAL**, gateada por el cierre de obra. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30** | 🗺️ **MapLibre real ✅ CÓDIGO COMPLETO (§55)** — tiles por Worker+Range, verificado E2E. **Falta SOLO la vista en foreground** (rAF congelado en pestañas automatizadas, L-34 → la confirma Daniel en su Chrome). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-22** | **CATÁLOGO — completo hasta la FRONTERA pre-cutover (§56-§60)**. Para datos reales: (1) deploy COORDINADO en el cutover (rules + `functions:portal`) · (2) `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades. Lo demás BLOQUEADO por causas reales (§60.4); insumos legales de la ficha → TODO-33. | 🟢 cutover | §60 |
| **TODO-33** | 🧾 **FICHA dinámica — decisiones ANTES de construir (§60.3)**: dirección exacta = OMITIR (PII) · financiación = disclaimer legal o se omite la cifra · asesor = `asesorId` vs bloque genérico · POIs fuera en v1. Regla: bloque sin dato se OMITE (jamás heredar el demo). | 🔵 decisión | §60 |
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§71)**. Kit 00-22 + membrete (`43`). Póliza ✅ · FE-DIAN ⏸️ · 03/04 blindados (§66) · **14 críticos + 23 altos de B-03 aplicados (§70·§71)**. Restan **85 leves** (⚠️ sin escéptico). Retirados: 13 y 23. | 🟢 leves | §71 · `43` |
| **TODO-32** | 🧠 **CEREBRO v2 ×4** (§50-§53; kernel v1.6.0 ×4). **(a) ✅ CERRADO §72**: heartbeat+handoff+canario ya corren en los 3 hermanos. **(b) vivo**: el banner >30% en LOS CUATRO (cars 43 · bersaglio 61 · insema 56 · inmo 56) — 2º mes ⇒ toca PODA REAL, no añadir. | 🟡 poda (b) | §72 |
| **TODO-36** | ⚖️ **Trinquete de boot ×4**: bersaglio ✅ destilado (30k→26.7k; llevaba tiempo SIN poder commitear su cerebro, §73) · **cars +4.1k pendiente** · después `boot-gate` en los 3. Y `brain-kit/` (plantilla) congelado **pre-v1.6.0**: un cerebro nuevo nace viejo. | 🟡 cars | §73 |
| **TODO-35** | 🛡️ **Linter del kit legal — ARRANCADO (§71.8)**: el generador ya cruza documento↔documento en 2 frentes (cicatrices de redacción con lookbehind de abreviaturas · versión de la Política calculada del doc 07, aborta si alguien declara otra). **Faltan**: cifras vs `01`/`02` · remisiones (cláusulas/numerales/filas, [[LD-04]]) · URLs declaradas · figura del arrendador. | 🟡 2 de 6 | §71 · §69 |
| **TODO-31** | 🛡️ **SPOF** (§49·§69): (a) ✅ bundles offsite en OneDrive, 5 repos, último 23-jul — el heartbeat lo vigila · (b) ✅ canario de boot ×4 (§72) · (c) **recovery codes: los verifica Daniel** — único resto. | ⏸️ dueño (c) | §72 |

---

## 📝 Bitácora (efímera)

> **▶ 🔥 PAUTA BERSAGLIO semana 2 VIVA · 🔁 REVISAR LUNES 3-AGO** — `120251090001200439`: Cartagena ciudad
> +0km · $8.000/día · fin 10-ago · precio pegado a SU producto (topos $2.280.000 / pulseras 10-20-30M).
> S1: **0 ventas de 33 chats**. **PARADA**: sin 1 venta ni 3 visitas al 10-ago → NO recargar.
> Todo → bóveda `2026-07-31-pauta-bersaglio-escala-SINTESIS.md` 🛑 NO RELANZAR · skill
> `meta-ads-diagnostico` D-1..D-12. **Daniel**: margen de 3 piezas · foto de topo en oreja.
>
> **▶ ⚖️ KIT — lo decidido y ya pagado vive en §66-§68 y §70-§71. 🛑 NO RELANZAR** el comité R3, la auditoría
> B-03 ni los 12 planificadores — crudos en bóveda (`2026-07-28-comite-r3-contratos/` ·
> `2026-07-28-auditoria-kit-b03/` · `2026-07-31-kit-b03-altos/`).
>
> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo): **(1) B-04** — sin contrato de usuario con
> DataCrédito/TransUnion **NO se puede consultar a nadie** aunque el arrendatario firme, y el doc 04 ya se lo
> anuncia: ¿afiliarse, o apoyarse solo en la aseguradora? · **(2) publicar la Política de Datos V2** en
> `/legal/politica-tratamiento-datos` — despliegue, no decisión, y ahora los 24 docs la fijan en **V2 ·
> 28-07-2026**: lo que se publique debe ser ese texto (§71.3) · **(3)** Nº de matrícula y RNT (al cierre de
> obra) + vetar/ajustar los 6 estándares del `02 §2`.
>
> Quedan **85 leves** SIN escéptico: *sin verificar*, no *confirmados* — aplicarlos en lote es el error del
> §70.6. Método que funcionó → [[LD-06]].
>
> 📜 **LOS ESTATUTOS MANDAN sobre el kit** (V5, art. 8º/13º/24º) — qué resuelven → §70.2 y la cabecera de
> `ESTATUTOS-V5.md`. [[LD-05]]: abre el documento madre ANTES de auditar. ⛔ **Doc 13 RETIRADO** el 31-jul
> por decisión de Daniel; riesgos asumidos escritos en su banner.
>
> **⏭️ LO QUE SIGO YO**: los 85 leves. Backlog B-01..B-04 en la bóveda.
> ✅ 31-jul: los 22 Word vivos regenerados en `…\KIT ALTORRA`; el 13 y el 23 movidos a `_RETIRADOS (no firmar)\`.
> ✅ `.auditoria-contratos/` refrescado desde la fuente viva **+ `ESTATUTOS-V5.md`** (LD-05: el documento
> madre entra al paquete de contexto; gitignored — lleva las cédulas de los 3 socios, JAMÁS commitear).
>
> ⚠️ **Ni los Word ni el manual maestro se editan a mano**: se GENERAN (`generar-documentos.ps1` ·
> `ensamblar-manual.ps1`, §68). Editar el maestro directo fue lo que duplicó y desincronizó el capítulo 2.
