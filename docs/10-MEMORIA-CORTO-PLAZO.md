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
| **TODO-CEREBRO** | 🧠 **Mantenimiento** (sin pausa desde 20-ago). **TODO-23** kernel: ~~K-01+K-04~~ ✅ (§219: los gates publican COBERTURA); K-05 ABIERTO; K-02/K-09 ✅ (§208) + de §143: el #27 debe resolver el nombre contra la CARPETA del nodo (hoy acepta la mayoría por basename) y los umbrales del #16 ir en COMMITS. K-11 (era «K-10»: código ocupado y mal citado) ✅ CERRADO (§205·§207). **TODO-24** ~~ssotFact de paleta~~ ✅ hecho; queda el cache EN EL CUTOVER · ~~**TODO-28** sellos~~ ✅ CERRADO (§206: era el #16, y ya son 30d, no 90) · **TODO-32(b)** [[M-09]] a los hermanos. | 🔄 | §84·§143·§146 |
| **TODO-29** | 📣 **PAUTA Altorra**: humo cerrada (estado → flag 📣 de `05`). Resta calibrar la campaña REAL. | ⏸️ gate obra | `pauta-captacion` §10 |
| **TODO-30 · 22** | 🗺️ **MapLibre COMPLETO (§55)** — falta solo la vista en foreground, la confirma Daniel ([[L-39]]) · 🏠 **CATÁLOGO con ficha (§97)**: datos reales = fases 3-4 del runbook, luego fichas al sitemap. | 🟢 | §55.9 · §102 |
| **TODO-46** | 📅 **GESTIÓN v1 COMPLETA** y desplegada → §112-§118, §140-§142, §148. ⏭️ Falta **aprobar el mockup** y **ESTRENARLA con datos reales** (runbook 1.5-1.6): es lo único que verifica el render en vivo. | 🟢 | §148 |
| **TODO-47** | 🚪 **ACCESO — el 2FA ya se puede USAR** → §129-§138. ⏭️ **Daniel**: inscribir su 2FA (clave manual; el QR se aplazó, §137.5) · verificar su correo. ⏭️ **Mío, DESPUÉS de que él se inscriba**: exigirlo en las Rules —antes NO, expulsa a todos— · el QR verificable · **puerta única** (mockup APROBADO, con la desviación del paso 2 → §137.6). | 🟢 Daniel | §137 |
| **TODO-48** | 📰 **JOURNAL publicado** (§147, §195): las 4 categorías estrenadas, cada afirmación con su norma .gov.co citada, mockup **APROBADO**. ⏭️ Falta: RE-ENVIAR el sitemap en GSC. | 🟢 | §147 |
| **TODO-49** | 🏷️ **OLA 2**. Compraventa + perfil de inquilino → §151-§153, §155. **RAIL DE PAGO COMPLETO y probado contra el emulador** (§166-§170, §176-§177, §185-§187): liquidación, certificación, mandato, preaviso y el webhook. ⏭️ Lo que falta NO es código: el endpoint espera a `WOMPI_EVENTS_SECRET` (§140) = cuentas de Daniel. | 🟢 Daniel | §176·§165 |
| **TODO-34** | ⭐ ⏸️ **FUNDACIÓN OPERATIVA — en pausa**. Kit auditado; van **28/92** leves. ⚠️ sin escéptico ⇒ uno por uno, NUNCA en lote (§70.6). No bloquea: el kit no se firma hasta el cierre de obra. Ledger → bóveda. | ⏸️ 28/92 | §87 · `43` |

---

## 📝 Bitácora (efímera)

> ### 🏗️ ARRANQUE EN FRÍO — lee esto y ya sabes dónde estás (21-ago)
>
> **Frente activo: TERMINAR EL MEGA-PLAN** (web + sistema). Daniel el 21-ago: *«las campañas al final,
> nos interesa terminar la página web y el sistema, todo el mega plan»*; **Meta ads y el Gmail roto van
> al FINAL, por decisión suya**. **Opus 5 para TODO**, esfuerzo Max, agentes y workflows LIBRES bajo tu
> juicio (levantó ese límite el 20-ago).
>
> **🌊 OLA 1 = 13/13 EN CÓDIGO** (§138; censo → `21`) **pero NO cerrada**: ningún camino ha escrito
> aún en Firestore real y la base está VACÍA (medido). Manda **`specs/CUTOVER-RUNBOOK.md`** (§102,
> §140): estrenar los caminos (1.4-1.8) → inventario → cutover. El resto, en PELOTAS.
> **OLA 2**: el «gate del abogado» NO EXISTE — el abogado soy yo (Daniel, 26-ago) → TODO-49, §165. **Agenda legal a CERO** (§194).
>
> 🎭 **UN ✅ NO PRUEBA QUE MIRARA** (§174-§177, §195): 8 gates cableados **tras** hallarlos verdes
> sin mirar nada; `verify:claims` no abría el journal. **El CI nunca estuvo rojo**: lo afirmé sin mirar.
>
> ⚠️ **ESTE nodo está FUERA de los dos mecanismos de frescura** —ni fecha que el gate lea, ni marcador
> `verificado-vivo`— y el arreglo está **especificado, no hecho** (§208; de ahí que un tercio de los
> pendientes mintiera, §204-§210). 📄 Brief de Daniel (memoria `brief-lanzamiento-artifact`): **si
> cambias el reparto 🤖/🧑 o las PELOTAS, ábrelo en el MISMO turno** — ningún gate lo ve envejecer (§211).
>
> 🏨 **Alojamiento lleva DOS gates**: RNT + reglamento de PH que autorice EXPRESAMENTE (§178-§179).
>
> 📬 **LEADS**: el aviso sale por **Resend** desde el portal, no por el Gmail caído (§188-§192).
> ⏭ Nurturing **apagado** (§192: sus plantillas enlazan al sitio retirado).
>
> ⏭️ **La evidencia postal NO tiene interfaz** (§204): sin fecha de IMPOSICIÓN el preaviso puede ser ineficaz y el contrato se prorroga un año. Encargo escrito. *El control de PH ya estaba HECHO.*
>
> 🔻 **El panel LEGACY no tiene NINGUNA red** —ni tipos, ni tests, ni build— y se le cazaron 4 fallos
> que solo vio la consola del dueño (§133-§136). Si un gate pasa, pregunta **qué abre** ([[L-52]]) —y **cuántos**
> (§219)—; córrelos con **`npm --prefix portal run verify`**, no de memoria.


> 🔬 **Auditoría N2 #14** (§218): 5 de 10 REINCIDENTES, un hilo — *arreglos correctos con el alcance
> enumerado a mano*. ⏭ **Abiertos**: patrones de `verify:claims` (van CON el arreglo de las páginas) ·
> boot al 100 % · «promesa sin mecanismo». 🎯 **Un plural que delimita un universo es un COMANDO.**

> 🔀 **26-ago — el censo saltó a las HERMANAS** (§216, vivas): Bersaglio e INSEMA **LIMPIAS**. **Cars**:
> `4.9 · 247 reseñas` sin fuente en el pie de **65 páginas** + stats que su spec dejó «a confirmar» en mayo
> ⇒ **LEGAL-08/09** en su `42-LEGAL` (push a su `dev`; no a `main`).
> **▶ BERSAGLIO** — estado vivo en su nodo dueño: `../bersagliojewelry.github.io/docs/44-PAUTA-META.md`.

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
> ~~(7) tasa de mora~~ **cerrada, no era tuya** (§181) · ~~(2)(5)(6)~~ cerradas antes.

> **⏸️ EN PAUSA, reanudable y sin bloquear nada**: 64 leves del kit (ledger en bóveda) · [[M-09]] a los
> 3 hermanos (TODO-32b) · backlog B-01..B-05. 🛑 **NO RELANZAR** el comité R3, la auditoría B-03 ni los
> 12 planificadores: está pagado y en la bóveda (`2026-07-28-*` · `2026-07-31-kit-b03-altos/`).

> 📜 **Kit (⏸️ pausa · dueño → `43`)**: reglas vivas en [[LD-05]] y §68.
