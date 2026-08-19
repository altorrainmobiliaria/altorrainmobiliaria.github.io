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
| **TODO-34** | ⭐ **FUNDACIÓN OPERATIVA (§61-§71)**. Kit 00-22 + membrete (`43`). Póliza ✅ · FE-DIAN ⏸️ · 03/04 blindados (§66) · **14 críticos + 23 altos de B-03 aplicados (§70·§71)**. Los "85 leves" son **92** y van **28 procesados** (§86-§87): 18 aplicados · 6 moot · 4 ya resueltos · **2 remedios refutados**. ⚠️ sin escéptico ⇒ **uno por uno, nunca en lote** (§70.6). **⏸️ PAUSADO 19-ago por Daniel** para volcar el esfuerzo en la PÁGINA; no bloquea nada (el kit no se firma hasta el cierre de obra). Ledger reanudable → bóveda `2026-08-03-leves-b03-LEDGER.md`. | ⏸️ 28/92 | §87 · `43` |
| **TODO-32** | 🧠 **CEREBRO v2 ×4** (§50-§53; versión del kernel → su stamp, no aquí). **(a) ✅ CERRADO §72**. **(b)**: la **poda del router de inmobiliaria ✅ HECHA (§84)** — boot 31.4k→28.4k (99,8%→90,3%) sin subir el techo, con criterio nuevo [[M-09]]. **(i) bersaglio ✅ PODADO (su §195)**: 17c → 1.3k de margen. Medición 03-ago de los 4: inmo 94,3% · cars 94,5% · bersaglio 95,8% · **insema 98,5% (427c)** ⏸️ — insema queda SIN podar a propósito: está en pausa y su cerebro es de 10 nodos, sin hoja hija donde recibir doctrina; crearla por 1.5k fragmenta más de lo que ahorra. Su dedup barato (tabla §0 ↔ triggers §G.2 + prosa de G.4) vale ~1.2k **sin mover una sola regla** → hacerlo si vuelve a moverse. (ii) el **banner de costo** (57%) NO baja podando: solo con commits de PRODUCTO. | 🟡 (ii) costo | §84·§195 |

---

## 📝 Bitácora (efímera)

> **▶ 01/03-ago + 19-ago — CONSOLIDADO, el relato vive en sus ADRs**: **§87** lotes 2-3 de los leves
> (28/92; el grupo "retirados" no era moot y los documentos de FIRMA salieron 7/7 vivos, con la retención
> repartida por mitades) ·: §81/§82 (candado de boot al kernel · 6 gates
> del kit) · **§83** auditoría Nivel-2 #6 · **§84** poda del router ([[M-09]]) · **§85** TODO-37 cerrado y
> kernel ×4 ([[M-07]] forma 2) + **B-05** (la mora del kit a dos tasas: decisión de Daniel, un párrafo).
>
> **▶ 🔥 PAUTA BERSAGLIO — ⏰ LA FECHA DE PARADA YA PASÓ (era el 10-ago; hoy es 19)**. `120251090001200439`,
> $8.000/día. S1 cerró con **0 ventas de 33 chats** y la regla escrita era: sin 1 venta ni 3 visitas al
> 10-ago, **NO recargar**. **Nadie verificó el resultado ni cortó** — preguntárselo a Daniel. Detalle →
> bóveda `2026-07-31-pauta-bersaglio-escala-SINTESIS.md` · skill `meta-ads-diagnostico`.
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
> **▶ 🏗️ 19-ago (§88): el formulario de captación ya NO pierde los leads.** `/publicar` era demo. Ahora
> `/api/solicitud` → `solicitudes` con el contrato del legacy, **y funciona sin JavaScript**. Se pudo hoy
> porque las reglas VIVAS ya traen `allow create: if true` (consultadas, no leídas del repo). Verificado
> end-to-end contra Firestore real y desplegado en staging. [[L-33]] volvió a cobrar (`locals.runtime.env`).
>
> **🔴 DESTAPADO AL PROBAR — el aviso de leads está ROTO en producción**: `onNewSolicitud` dispara y falla
> con `535-5.7.8 Username and Password not accepted`. **Hoy ningún lead le avisa a nadie, tampoco los del
> sitio viejo.** Además el documento queda sin `leadScore`/`nurturing`, lo que sugiere —sin verificar— que
> la Function desplegada no es la del repo. → **pelota de Daniel**: rotar la contraseña de aplicación.
>
> **⏭️ 🏗️ FRENTE ACTIVO DESDE EL 19-AGO: CONSTRUIR LA PÁGINA.** Daniel congela cerebro y kit —el 73% del
> trabajo del mes era mantenimiento y la web no avanzaba— y el esfuerzo se vuelca al portal. **Opus 5 para
> TODO** (fase de implementación), esfuerzo Max, sin ultracode.
> **Siguiente en la página**: `/ingresar` y `/favoritos` están enlazadas en el header y dan **404** — son
> las 2 pantallas del mockup que nunca se construyeron, y **no tienen mockup propio**, así que necesitan el
> tuyo antes (callejón b). Decisión abierta: el form de `/publicar` **no pide correo** (fiel al mockup) y
> eso hace que un propietario real llegue etiquetado `[COLD]` — o se añade el campo, o se re-pesa el scoring.
> **En pausa, reanudables y sin bloquear nada**: los 64 leves restantes del kit (ledger en bóveda) ·
> [[M-09]] a los 3 hermanos (TODO-32b) · Backlog **B-01..B-05** en la bóveda.
>
> ⚠️ **Ni los Word ni el manual maestro se editan a mano**: se GENERAN (`generar-documentos.ps1` ·
> `ensamblar-manual.ps1`, §68). Editar el maestro directo fue lo que duplicó y desincronizó el capítulo 2.
