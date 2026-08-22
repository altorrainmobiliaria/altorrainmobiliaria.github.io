# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). **Qué sigue y en qué estado está → el bloque de ARRANQUE EN
> FRÍO de la bitácora** (no se repite aquí). Dev: `npm --prefix portal run dev` (4321); mockups en
> `portal/design/mockups/` (10); fidelidad → [[L-29]]/[[L-24]]/[[L-28]].
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
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" · obra AEO. | 🔄 | gate=CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº **RNT** · dirección física y COMERCIAL · abogado (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño | gate=obra |
| **TODO-CEREBRO** | 🧠 **Mantenimiento del cerebro** (ya NO en pausa: 20-ago Daniel levantó el límite de capacidad). **TODO-23** kernel hardening K-01/02/04/05/09 (§30.4) · **TODO-24** ssotFact de paleta + cache al portal en el CUTOVER · **TODO-28** #7 sello >90d · **TODO-32(b)** [[M-09]] a los hermanos + banner de costo (solo baja con commits de PRODUCTO) · **TODO-40** ✅ cerrado. Capacidad y gates a medias → absorbidos por **TODO-45**. | 🔄 | §84·§87·§90·§96 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-44** | 🖥️ **CRUD CERRADO**: R2 + identidad en el edge (§107) · alta (§108) · listado con «¿se ve?» (§110) · edición (§111). Resta cola de verificación y export. ⚠️ Nada ha corrido con un claim real: paso 1.5 del runbook. | 🟢 | §111 |
| **TODO-30** | 🗺️ **MapLibre ✅ COMPLETO (§55)** — falta SOLO la vista en foreground (rAF congelado en pestañas automatizadas, [[L-39]] → la confirma Daniel). Luego: wiring forms→`solicitudes`. | 🟢 vista | §55.9 |
| **TODO-39** | 🌊 **OLA 1 ✅ 13 de 13** (§91-§96 → `00`). (a) ✅ «Avalúo» RESUELTO en §105 (queda 1 pregunta suya → pelota 11); (b) el **go/no-go de ola** con Daniel (MEGA-PLAN §4.4). | 🟢 código listo | §105 |
| **TODO-22** | **CATÁLOGO completo, ficha incluida (§97)**. Datos reales = fases 3-4 del runbook; luego fichas al sitemap. | 🟢 cutover | §102 |
| **TODO-42** | 🔑 **Claim de staff — CÓDIGO LISTO, falta desplegar** (§99) = **fase 1 del runbook**, aislada y se puede hacer HOY (no toca reglas). ⏭️ **Daniel**: (1) me confirma el deploy — concede permisos de admin, prefiero que lo sepas; (2) pulsa «Sincronizar permisos» en admin.html → Usuarios; (3) abre `/gestion`. | 🟡 deploy | §102 |
| **TODO-45** | 🔬 **Deuda de la auditoría #8** (§109, tabla en la bóveda). Por orden: (a) **capa semántica de `00` congelada 24 ADRs** — el ruteo que funciona hoy es la bitácora, así que ESTO va ANTES de podarla; (b) `degrade()` 🟠 cuando un gate hace 0 comparaciones (el ✅ inmerecido: #27 perdona 90 rutas por basename, #16 aprueba «CF 9» contra 11); (c) el **índice revienta en ~4 ADRs**, no en 92 → fila nueva ≤200c bloqueante; (d) umbrales en DÍAS en un repo que corre en COMMITS; (e) `33` por encima del tope. | 🔴 | §109 |
| **TODO-46** | 📅 **GESTIÓN v1** (ítem 13). ✅ agenda pura (§112) + `crearContrato` con el gate del depósito (§113). Falta la PANTALLA, expedientes/pagos/novedades y adjuntos privados (B5). Herramienta DIARIA del dueño. | 🔴 | §113 |
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
> **§102: el cutover ya no se improvisa** → **`specs/CUTOVER-RUNBOOK.md`** manda (6 fases, verificación
> y vuelta atrás). De ahí salió que `PUBLIC_SITE_ENV` no se declaraba en el CI: TODO build salía
> `noindex`. Ya son 3 perillas por variable de repositorio.
>
> **§103: el panel viejo escribe OTRO modelo** — esquemas incompatibles en la MISMA colección ⇒ lo que
> se crea allá pasa el filtro y se cae luego: índice vacío, cero errores. Ya se reporta
> (`esquema-legacy`), pero el catálogo sigue vacío ⇒ el CRUD es requisito del cutover, no mejora.
>
> **Lo siguiente, en orden**: (1) **el cutover** — el CRUD ya no lo bloquea y la fase 4 se puede
> hacer · (2) **TODO-45**, la deuda de la auditoría · (3) **TODO-30**, la vista del mapa, que solo confirma Daniel
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
> **(10) 📧 RESEND — el último gate de las alertas (§96)**: dominio verificado + clave = **fase 0.2 del
> runbook** (detalle allá). Sin eso el digest NO falla, solo no envía. Gratis y **no depende del Gmail
> roto**, que es otro asunto y va al final por decisión tuya.
> **(11) ⚖️ ¿ALTORRA contrata un avaluador inscrito en el RAA?** De eso, y solo de eso, depende si se
> quedan «Avalúos» (menú Gestión) y «Avalúo y fotografía profesional» (plan Premium). Todo lo demás ya
> dejó de llamarse avalúo (§105). Si la respuesta es no, se quitan esas dos y listo.
> **(9) 📣 PAUTA — al final por decisión tuya (21-ago); aplazarla es seguro** porque la campaña de humo
> **solo muerde el día que recargues saldo** ([[D-15]]). **Antes de recargar un peso**: sesión de Meta
> de Altorra ([[D-16c]]), filtro SOLO `Entrega=Activo` + rango Máximo ([[D-15b]] — «Anuncios activos»
> esconde los zombies).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: los ESTATUTOS MANDAN y se abren ANTES de auditar ([[LD-05]]) ·
> docs 13 y 23 RETIRADOS · ⚠️ Word y manual **NUNCA a mano**: se GENERAN (§68).
