# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual

> **🏗️ FRENTE ACTIVO = LA PÁGINA** (portal). Qué sigue → el **ARRANQUE EN FRÍO** de la bitácora.
> Dev: `npm --prefix portal run dev` (4321); mockups en `portal/design/mockups/`; fidelidad →
> [[L-29]]/[[L-24]]/[[L-28]]. **⏸️ EN PAUSA**: fundación (TODO-34) y pauta (TODO-29 → `pauta-captacion`).
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
| **TODO-17 · 21** | **Ola 0 restos** (E2E "tras cache" · obra AEO) · **lote-dueño**: RNT, dirección COMERCIAL, abogado (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ | gate=obra/cutover |
| **TODO-CEREBRO** | 🧠 **Mantenimiento** (sin pausa desde 20-ago). **TODO-24**: queda el cache EN EL CUTOVER. ⚠️ **Cars: auditoría Nivel-2 con 39 días de retraso** (medido 31-ago). ⏭ INSEMA tiene una rama de cerebro esperando TU merge. (Cerrados: TODO-23 → §221 · TODO-28 → §206 · **TODO-32(b)** → [[M-09]] ×4 + kernel repartido ×4, versión en su stamp.) | 🔄 | §84·§143·§146 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30 · 22** | 🗺️ **MapLibre COMPLETO (§55)** — falta solo la vista en foreground, la confirma Daniel ([[L-39]]) · 🏠 **CATÁLOGO con ficha (§97)**: datos reales = fases 3-4 del runbook, luego fichas al sitemap. | 🟢 | §55.9 · §102 |
| **TODO-46** | 📅 **GESTIÓN v1 COMPLETA** y desplegada → §112-§118, §140-§142, §148. ⏭️ Falta **aprobar el mockup** y **ESTRENARLA con datos reales** (runbook 1.5-1.6): es lo único que verifica el render en vivo. | 🟢 | §148 |
| **TODO-47** | 🚪 **ACCESO — el 2FA ya se puede USAR** → §129-§138. ⏭ **Daniel**: inscribir su 2FA (clave manual, §137.5) y verificar su correo. ⏭ **Mío, DESPUÉS**: exigirlo en las Rules —antes NO, expulsa a todos—, el QR verificable y la puerta única (§137.6). | 🟢 Daniel | §137 |
| **TODO-48** | 📰 **JOURNAL publicado** (§147, §195): las 4 categorías estrenadas, cada afirmación con su norma .gov.co citada, mockup **APROBADO**. ⏭️ Falta: RE-ENVIAR el sitemap en GSC. | 🟢 | §147 |
| **TODO-49** | 🏷️ **OLA 2**. Compraventa + perfil de inquilino → §151-§153, §155. **rail de pago completo, probado contra el emulador** (§166-§187). ⏭️ Lo que falta NO es código: el endpoint espera a `WOMPI_EVENTS_SECRET` (§140) = cuentas de Daniel. | 🟢 Daniel | §176·§165 |
| **TODO-50** | 🧱 **CEREBRO LLENO — eran DOS problemas** (§269). ✅ `30`: shard `39`, 240→**193 L**. ✅ Boot: **31387** (margen 21c→113c) al soltar un hecho DUPLICADO entre dos always-on, vía [[M-09]] (§269.8). Sigue apretado, pero con método. | 🟡 mío | §269 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa**. Kit auditado; van **28/92** leves. ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (21-ago)
>
> **Frente activo: TERMINAR EL MEGA-PLAN.** Daniel (21-ago): *«las campañas al final, nos interesa
> terminar la página web y el sistema, todo el mega plan»* — Meta ads y el Gmail roto, al FINAL.
> **Opus 5 para TODO**, esfuerzo Max, agentes y workflows LIBRES bajo tu juicio (20-ago).
>
> **🌊 OLA 1 = 13/13 EN CÓDIGO** (§138; censo → `21`) **pero NO cerrada**: ningún camino ha escrito
> aún en Firestore real y la base está VACÍA (medido). Manda **`specs/CUTOVER-RUNBOOK.md`** (§102,
> §140): estrenar los caminos (1.4-1.8) → inventario → cutover. El resto, en PELOTAS.
> **OLA 2**: el «gate del abogado» NO EXISTE — el abogado soy yo (Daniel, 26-ago) → TODO-49, §165. **Agenda legal a CERO** (§194).
>
> 🎭 **UN ✅ NO PRUEBA QUE MIRARA** — la familia entera, con sus ocho formas, en `38-GATES-QUE-MIENTEN`.
>
> 🗓️ **última actualización: 2026-08-28.** Esta pizarra NO lleva `verificado-vivo` **a propósito**:
> afirmaría que verifiqué cada pendiente contra la realidad, y es falso. 📄 Brief de Daniel (memoria
> `brief-lanzamiento-artifact`): si cambias el reparto 🤖/🧑 o las PELOTAS, **ábrelo en el MISMO
> turno** — ningún gate lo ve envejecer (§211).
>
> 🏨 Alojamiento: RNT + PH los BLOQUEAN las Rules (§234) y el build (§240) — no se describe aquí.
>
> 📬 **CORREO** → Resend: lead nuevo (§188) y aviso de estado (§235). La legacy se retira EMPAREJADA con el despliegue. Nurturing apagado (§192).
>
> 🔻 **El panel LEGACY no tiene red** —ni tipos, ni tests, ni build— y así se le colaron 4 fallos (§133-§136).
> Si un gate pasa, pregunta **qué abre** ([[L-52]]) y **cuántos** (§219): **`npm --prefix portal run verify`** ≠ los 10 gates.

> 🎯 **AQUÍ VOY (31-ago).** Barrido del portal CERRADO (§271-§279): la web ya no publica nada que no
> pueda respaldar — ni filtros de adorno, ni clientes inventados en el panel, ni los ~25 inmuebles
> falsos que la PORTADA habría sacado en producción. Sus 5 secciones beben del catálogo real.
> ⭐ **Daniel decidió las dos (31-ago)**: `/publicar` cambia sus 3 cifras falsas por credenciales
> verificables (§280) y la calificación ENTRA al modelo (§281), diseñada para no poder inventarse:
> agregado que solo escribe el servidor, negado al staff en las Rules, y sin mínimo de reseñas no
> hay nota. ⏭ **Falta el flujo que ESCRIBE reseñas** (quién, atado a qué reserva, y la Function que
> recalcula): hasta entonces «mejor valoradas» dice que no hay valoraciones, que es la verdad.
> 🏗️ **Obra nueva**: diseñada y metida en el MEGA-PLAN, no en el backlog (§270) — no cabe hoy por
> una razón MEDIDA: el índice guarda `precio` como UN entero y un proyecto tiene RANGO.

> 🔬 **Auditoría #17 (§268)** — parcial: sondas 3/4/7 piden subagentes. Las 2 abiertas de la #16
> re-verificadas: **premisas siguen ciertas**. ⚠️ N17-04 sigue abierto → **TODO-50**.
> ⏭ **Vivo, y es TUYO**: las cinco cifras del 5.3 (`specs/PROPUESTA-CIFRAS-CUTOVER.md`) · qué
> carpetas dejan de servirse en el dominio (N16-29) · los 13 correos del `50` (N16-30).

> 🔀 **Hermanas** (§216): Cars → LEGAL-08/09 de su `42-LEGAL` · Bersaglio → su `44-PAUTA-META.md`.

> **⏭️ PELOTAS DE DANIEL — ordenadas por lo que DESBLOQUEAN** (§188; antes era una lista plana de 13).
>
> **🅰️ Sin esto no se lanza**
> **(10) 📧 RESEND: dominio + clave** — gratis, ~30 min, **no depende del Gmail roto**, y el secreto ya
> existe con centinela (§140). Desbloquea el digest de alertas **y, con el cambio de abajo, el aviso de
> cada lead**. Si solo haces UNA cosa, es ésta.
> **(1) 🔻 Gmail — YA NO ES TUYA (baja de A a nada)**: los leads del portal dependían de la Function
> legacy con SMTP roto (`535-5.7.8`). Moverlos a Resend lo mata, y eso lo hago yo (§188). *Dos pelotas
> se funden en una credencial.* Solo vuelve a ser tuya si quieres conservar el correo legacy.
>
> **🅱️ Desbloquean una función concreta (una respuesta corta cada una)**
> **(4b) Nº de RNT** — sin él NO se puede publicar ni un alojamiento por días: el gate lo bloquea.
> **(13) 🛡️ Carta de autorización de CADA aseguradora** — gratis, la expide ella. Sin ella gestionar
> pólizas es intermediación irregular aunque el resto esté impecable (§171 · Ley 510/99 art. 101).
> **(11) ⚖️ ¿tienes avaluador inscrito en el RAA?** Sí/no. De eso depende si se quedan «Avalúos» y
> «Avalúo y fotografía profesional» o se retiran (§105).
> **(12) 💳 ¿«Crédito de Vivienda» y «Pagos en Línea» son servicios REALES?** Los retiré del menú
> (§159.4). Una frase basta; el segundo es el carril de Wompi y espera TU cuenta igual.
> **(8) `/publicar` no pide correo** (fiel al mockup) ⇒ el propietario llega `[COLD]`: ¿campo o re-pesar?
> **(47) 🚪 inscribe tu 2FA** — hasta que lo hagas no puedo exigirlo en las Rules (antes expulsaría a todos).
>
> **🅲 No bloquean nada hoy**
> **(3) B-04 DataCrédito** (solo si quieres screening propio) · **(4a) recovery codes** (§72, higiene,
> 5 min) · **(9) 📣 PAUTA** — aplazada por ti y **aplazarla es SEGURO**: solo muerde el día que recargues
> saldo ([[D-15]]); antes de eso, sesión de Meta ([[D-16c]]) + filtro `Entrega=Activo` ([[D-15b]]).

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: reglas vivas en [[LD-05]] y §68.
