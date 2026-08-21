# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). **Qué sigue y en qué estado está → el bloque de ARRANQUE EN
> FRÍO de la bitácora** (no se repite aquí). Dev: `npm --prefix portal run dev` (4321); mockups en
> `portal/design/mockups/` (9); fidelidad → [[L-29]]/[[L-24]]/[[L-28]].
> **⏸️ EN PAUSA**: fundación (TODO-34) y pauta (TODO-29, SSoT = skill `pauta-captacion`).
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` + ADR §23-§23.9.
> **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21 + las pelotas de la bitácora.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención:
> el mapa de TODO-30) · (c) datos del portal = DEMO · (d) NUNCA dinero sin gate · JAMÁS el 323… personal · sin
> gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" (T9) · deploy de rules · 0.4 obra AEO. | 🔄 | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº **RNT** · dirección física y COMERCIAL · abogado (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño | gate=obra |
| **TODO-CEREBRO** | 🧠 **Mantenimiento del cerebro** (ya NO en pausa: 20-ago Daniel levantó el límite de capacidad). **TODO-23** kernel hardening K-01/02/04/05/09 (§30.4) · **TODO-24** ssotFact de paleta + cache al portal en el CUTOVER · **TODO-28** #7 sello >90d · **TODO-38** (§90) gates a medias: #27 sin `creas` · #5 existencia≠corrección · `§NN` sueltos sin gate · **TODO-32(b)** [[M-09]] a los hermanos + banner de costo (solo baja con commits de PRODUCTO) · **TODO-40** ✅ shard de `30` hecho (L-01..L-21 → `35`, §97) y `33` destilado. QUEDA `00` (25k/24k) con `00a` casi lleno → `00b` o destilar filas; NO subir techos ([[M-05]]). | 🔄 | §84·§87·§90·§96 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-44** | 🖥️ **Admin v1 — falta la otra mitad** (ítem 10). ✅ puerta de acceso (§98) + bandeja de leads REAL (§101). Resta **CRUD de propiedades**, cola de verificación y export. **No lo gatea nadie**: el ruleset fusionado ya permite la escritura por rol (§100). | 🟢 | §101 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, [[L-39]] → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-39** | 🌊 **OLA 1 ✅ 13 de 13** (§91-§96 → `00`). Queda SOLO lo que no es código: (a) ⚠️ **tuya (§94.6)**: «Avalúo» sale en `Header`/`Footer` y B13 lo PROHÍBE (Ley 1673), la skill de voz sí lo usa — dos fuentes del cerebro en contradicción legal; (b) el **go/no-go de ola** con Daniel (MEGA-PLAN §4.4). | 🟢 código listo | §96 |
| **TODO-22** | **CATÁLOGO — código COMPLETO, incluida la FICHA (§97)**. Los pasos para datos reales son las **fases 3-4 del `specs/CUTOVER-RUNBOOK.md`** (§102), no se repiten aquí; resta después: fichas al sitemap, derivadas del índice. | 🟢 cutover | §102 |
| **TODO-42** | 🔑 **Claim de staff — CÓDIGO LISTO, falta desplegar** (§99). El claim se deriva de `usuarios/{uid}` con un trigger, en el codebase del legacy, y se despliega SOLO (no toca reglas). Es la **fase 1 del runbook** (§102) y se puede hacer HOY, aislada: no toca ni una línea de reglas. ⏭️ **Daniel**: (1) me confirma el deploy — concede permisos de admin, prefiero que lo sepas; (2) pulsa «Sincronizar permisos» en admin.html → Usuarios; (3) abre `/gestion` y ve el panel. | 🟡 deploy | §99 · §102 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa**. Kit auditado; van **28/92** leves. ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea: el kit no se firma hasta el cierre de obra. Ledger → bóveda. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (2026-08-21, 2ª foto del día)
>
> **Frente activo: TERMINAR EL MEGA-PLAN** (web + sistema). Daniel el 21-ago: *«las campañas al final,
> nos interesa terminar la página web y el sistema, todo el mega plan»*; **Meta ads y el Gmail roto van
> al FINAL, por decisión suya**. **Opus 5 para TODO**, esfuerzo Max, agentes y workflows LIBRES bajo tu
> juicio (levantó ese límite el 20-ago).
>
> **🌊 OLA 1 CERRADA EN CÓDIGO: 13 de 13** (§91-§96) y **el portal público COMPLETO**: 25 páginas (censo
> → `21`), leads REALES en `solicitudes` (§88, §94), alertas con digest diario (§96), la ficha dinámica
> `/inmueble/<slug>` (§97), Workers Caching encendido y `/gestion` tras puerta (§98). Lo que falta de
> OLA 1 ya no es código: el go/no-go del dueño y la contradicción de «Avalúo» (§94.6).
>
> **§102: el cutover ya no se improvisa** → **`specs/CUTOVER-RUNBOOK.md`** es el SSoT del orden: seis
> fases, quién hace cada paso, verificación con evidencia y vuelta atrás. Salió de ahí un hallazgo
> grande: `PUBLIC_SITE_ENV` **no se declaraba en el CI**, así que todo build del repo salía `noindex`
> — el del cutover incluido. Ya son 3 perillas por variable de repositorio, con defaults seguros.
>
> **Lo siguiente, en orden**: (1) **el cutover**, con el runbook en la mano (claims y reglas LISTOS y
> probados, §99-§100) · (2) **TODO-22**, el catálogo REAL · (3) **TODO-30**, la vista del mapa, que solo confirma Daniel
> ([[L-39]]) · (4) **OLA 2**: el abogado gatea el RAIL DE PAGO, **no toda la ola** — reléela antes de
> darla por bloqueada ([[L-40]] ya cobró 3 veces, [[M-11]]).
>
> ⚠️ **Antes de tocar código, lee `34-DOCTRINA-CODIGO`** (trigger 🖥️) y, si el síntoma te suena, `30`:
> [[L-33]] (`locals.runtime.env` removido en Astro v6) YA cobró dos veces, y [[L-41]] (cabeceras
> inmutables en los redirect) explica por qué un endpoint puede dar 500 SOLO en staging.



> **▶ BERSAGLIO** (dueño → `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`; doctrina →
> `meta-ads-diagnostico`): pauta CERRADA y 6 zombies apagados ✅20-ago. ⏭️ **VIVO**: 26 conversaciones
> sin leer (9+ días) en su WhatsApp · avisarle a **Kary**.

> **⏭️ PELOTAS DE DANIEL** (no las puedo cerrar yo):
> **(1) 🔴 rotar la contraseña de aplicación de Gmail**: `onNewSolicitud` falla con `535-5.7.8` y es la MISMA Function que avisará los leads del portal nuevo. Lanzar sin rotarla = perderlos sin evidencia, igual que se perdieron los 16 del sitio viejo (exportados antes, `43`).
> **(2)** Política V2 ✅ live. Queda TU visto bueno para abrir **«Crear cuenta»** en `/ingresar` (§90).
> **(3) B-04** — sin contrato con DataCrédito/TransUnion **NO se puede consultar a nadie**: ¿afiliarse, o solo aseguradora?
> **(4)** verificar los **recovery codes** (§72).
> **(5)** Nº de **RNT** + vetar los 6 estándares del `02 §2`.
> **(6)** ¿**Google** como proveedor de acceso habilitado en Firebase? Sin evidencia; el interruptor es tuyo.
> **(7)** decidir la **tasa de mora del doc 03** (B-05: 1,5×IBC vs 6%) — un párrafo, y las 5 remisiones
> lo heredan solas.
> **(8)** `/publicar` **no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo nuevo o re-pesar?
> **(10) 📧 RESEND — el último gate de las alertas (§96).** El sistema está construido y probado, pero no
> manda un solo correo hasta que existan dos cosas tuyas: (a) el **dominio `altorrainmobiliaria.co`
> verificado en Resend** (registros DNS en Hostinger) y (b) el secreto
> `firebase functions:secrets:set RESEND_API_KEY`. Sin eso el digest NO falla: aplica las bajas, no
> envía y lo deja escrito en el log. Es gratis (3.000/mes · 100/día) y **no depende del Gmail roto**,
> que es otro asunto y va al final por decisión tuya.
> **(9) 📣 PAUTA — al final por decisión tuya (21-ago); aplazarla es seguro** porque la campaña de humo
> **solo muerde el día que recargues saldo** ([[D-15]]). **Antes de recargar un peso**: sesión de Meta
> de Altorra ([[D-16c]]), filtro SOLO `Entrega=Activo` + rango Máximo ([[D-15b]] — «Anuncios activos»
> esconde los zombies).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: los ESTATUTOS MANDAN y se abren ANTES de auditar ([[LD-05]]) ·
> docs 13 y 23 RETIRADOS · ⚠️ Word y manual **NUNCA a mano**: se GENERAN (§68).
