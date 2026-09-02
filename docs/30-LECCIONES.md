# 🧪 30 — LECCIONES (Memoria Procedimental · Altorra Inmobiliaria)

> Trigger de Experiencia (§G.2): ANTES de una op riesgosa/repetitiva o si un síntoma "te suena". Gotchas + recetas.
> Formato `### L-NN — <título>` (disparador + causa + fix). Varias son **heredadas de Altorra Cars** (mismo patrón
> arquitectónico) — destiladas de `_legacy/AVANCES.md §"ERRORES CONOCIDOS"`.
> 🧩 **Hojas hijas**: `31-VERIFICACION-UI.md` — L-22/L-26/L-28 COMPLETAS (verificación de UI: panel congelado ·
> Chrome · computed vs transition) · `37-META-FUNDACIONALES.md` — el detalle de **M-01..M-10** (shard del 26-ago; las vivas siguen en `33`) ·
> `33a-LECCION-QUE-NO-DISPARA.md` — **M-11 · M-24..M-26 · M-28**: la lección escrita que no llegó a tiempo (§289) ·
> `32-LECCIONES-DOCUMENTALES.md` — rama **legal/documental** (`LD-NN`: contratos, manual, formatos).
> ⚠️ **Aquí solo va lo TÉCNICO.** Las viejas `L-31..L-34` "del kit" se mudaron a `32` como **LD-01..LD-04**
> el 2026-07-28 porque **colisionaban** con las L-31..L-34 de esta hoja (ADR §68 · [[M-04]]). Un ADR anterior que diga "L-33" hablando del kit se refiere a **LD-03**.

---

## Lecciones (L-NN)

> 🧩 **`L-01`..`L-21` y `L-49`**: casi todas MIGRADAS al maestro — cuerpo íntegro en
> `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` y stub en `35-LECCIONES-PLATAFORMA.md`, donde `L-03` sí
> sigue entera. Aquí queda el titular, que es lo que hace falta para reconocer el síntoma.

### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado) ⇒ **migrada al maestro**: [[INMO:L-01]]
### L-02 — RTDB `permission_denied` en presencia ⇒ **migrada al maestro**: [[INMO:L-02]]
### L-03 — Firestore "Failed to obtain primary lease"
### L-04 — ⚗️ FUSIONADA en L-09 (merge:true vs rules/upsert) — regla viva **aquí, en L-09**: `set()` SIN merge para CREAR, `update()` para EDITAR (el puntero apuntaba a `CLAUDE.md §3.5`, que se mudó a `34-DOCTRINA-CODIGO` en la poda §84; el dueño del hecho siempre fue L-09)
### L-05 — ⚰️ (sitio viejo retirado §15) Modals inyectados fuera de index → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md`
### L-06 — ⚰️ (sitio viejo retirado §15) Invalidación de cache `system/meta`→onSnapshot → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` (resucitar si el cutover reusa SW/onSnapshot)
### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc ⇒ **migrada al maestro**: [[INMO:L-07]]
### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) ⇒ **migrada al maestro**: [[INMO:L-08]]
### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes ⇒ **migrada al maestro**: [[INMO:L-09]]
### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado ⇒ **migrada al maestro**: [[INMO:L-10]]
### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs ⇒ **migrada al maestro**: [[INMO:L-11]]
### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir ⇒ **migrada al maestro**: [[INMO:L-12]]
### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO ⇒ **migrada al maestro**: [[INMO:L-13]]
### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria ⇒ **migrada al maestro**: [[INMO:L-14]]
### L-15 — Windows: `wrangler dev` deja un `workerd.exe` huérfano que bloquea `dist/` (`EPERM` en el siguiente build) ⇒ **migrada al maestro**: [[INMO:L-15]]
### L-16 — Primer deploy a Cloudflare Workers: registrar el subdominio `workers.dev` ANTES (falla en CI no-interactivo) ⇒ **migrada al maestro**: [[INMO:L-16]]
### L-17 — Decodificar el REST de Firestore: mapas/arrays VACÍOS y despacho por clave ⇒ **migrada al maestro**: [[INMO:L-17]]
### L-18 — Cloudflare: DOS cachés distintas; en `workers.dev` solo sirve **Workers Caching** ⇒ **migrada al maestro**: [[INMO:L-18]]
### L-19 — `@astrojs/cloudflare` v14: `locals.runtime` deprecado/sin tipo; `platformProxy` removido ⇒ **migrada al maestro**: [[INMO:L-19]]
### L-20 — Firestore Rules: un `get` de doc INEXISTENTE con `resource.data` en la regla → 403, no 404 ⇒ **migrada al maestro**: [[INMO:L-20]]
### L-21 — Aislar tests que comparten un emulador Firestore: projectId PROPIO por archivo ⇒ **migrada al maestro**: [[INMO:L-21]]
### L-49 — 🎛️ La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate la ve → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`** ⇒ **migrada al maestro**: [[INMO:L-49]]
### L-53 — 🔐 Firebase MFA (TOTP): pide el código DESPUÉS de la contraseña, `enroll()` revoca las demás sesiones, y NO existen códigos de respaldo ⇒ **migrada al maestro**: [[INMO:L-53]]
### L-54 — 🌩️ Los tipos de Cloudflare Workers PISAN el DOM: `Element.append` deja de ser la del navegador (usa `appendChild`)
### L-55 — 🧬 Varias copias del MISMO SDK = varios registros: `app/no-app` con la app ya inicializada, y el error no nombra versiones
### L-44 — 🔐 Un ruleset se REEMPLAZA, no se fusiona: dos ficheros con el mismo nombre, uno gana → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`** ⇒ **migrada al maestro**: [[INMO:L-44]]
### L-43 — 🔑 Un identificador ESTABLE no se deriva de la URL: cambia la ruta y se te queda huérfano lo guardado *(2026-08-21, ADR §97.7)* ⇒ **migrada al maestro**: [[INMO:L-43]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-42 — 🚧 Lo escrito en un COMENTARIO no está desplegado: reglas, config y premisas → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`** ⇒ **migrada al maestro**: [[INMO:L-42]]
### L-41 — 🧱 Las cabeceras de `Response.redirect()` son INMUTABLES: un middleware que hace `headers.set()` revienta todo redirect *(2026-08-21, ADR §96.6b)* ⇒ **migrada al maestro**: [[INMO:L-41]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-40 — 🚪 «Gateado por el dueño» merece releerse: el gate puede cubrir UNA PARTE del alcance → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`** ⇒ **migrada al maestro**: [[INMO:L-40]]
### L-39 — 🕵️ `document.visibilityState:"hidden"` congela el `rAF` → un mapa que NO carga por eso PARECE un bug de librería, con evidencia falsa incluida *(2026-08-20, TODO-30)* ⇒ **migrada al maestro**: [[INMO:L-39]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-36 — 🧩 Rellenar un `<template>` clonado: el placeholder VACÍO no crea nodo de texto, y una excepción a mitad deja la UI VIEJA en pantalla — coherente por fuera, mentirosa por dentro *(SERP §59)* ⇒ **migrada al maestro**: [[INMO:L-36]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-35 — 🏁 Un rebuild IDEMPOTENTE no basta: dos ejecuciones concurrentes leen snapshots DISTINTOS y la vieja puede aterrizar de última *(catálogo §58; portable a todo derivado/materialized view)* ⇒ **migrada al maestro**: [[INMO:L-35]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-34 — 🧊 Cloudflare Workers Static Assets IGNORA el header `Range` (200 + archivo entero) — mata pmtiles y todo lo que lea por rangos; y `astro dev` SÍ honra Range → **paridad dev↔prod FALSA** *(TODO-30, ADR §55.9, cazado en PROD por Daniel)* ⇒ **migrada al maestro**: [[INMO:L-34]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-33 — 🗺️ Astro v6+/@astrojs/cloudflare v14: `Astro.locals.runtime.env` fue REMOVIDO → `import { env } from 'cloudflare:workers'`; y maplibre-gl v6 = named exports (sin default) *(TODO-30, ADR §55, cazado EN VIVO)* ⇒ **migrada al maestro**: [[INMO:L-33]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-32 — 🪤 En Ads Manager multi-marca, los DEFAULTS traen la marca hermana: verificar página/número/identidad ANTES de seguir *(montaje HUMO, ADR §42, 2026-07-18)* ⇒ **migrada al maestro**: [[INMO:L-32]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-31 — 🎯 El proceso creativo es un EMBUDO, no una skill; y la 1ª pasada "correcta" puede violar la voz *(mandato Daniel + pieza de humo, 2026-07-18)*
**Disparador**: la 1ª pieza de captación salió técnicamente bien pero (a) creé usando solo Brief+voz, sin barrer el backlog TikTok ni la Ads Library (Daniel tuvo que recordármelos: "el proceso debe ser pro, no 1 skill"), y (b) el copy trató de TÚ a un PROPIETARIO cuando el catálogo §3.1 exige USTED (ancla: "Usted descansa, nosotros nos encargamos") y sonó "robot" (comprimido sin calidez). **Reglas**: (1) toda pieza que va a DINERO pasa el **embudo de `pauta-captacion §0b`** (grounding sweep completo → ≥3 candidatos → filtro de voz → comité ×3 lentes → Daniel → métricas→iteración); (2) el REGISTRO se verifica ANTES de escribir (propietario=usted, lead comprador=tú); (3) cumplir reglas duras ≠ tener el alma: el filtro incluye la cadencia gold y leer la pieza EN VOZ ALTA; (4) receta visual sellada: la IA genera solo el FONDO (sin texto); tipografía/logo van por HTML+Playwright.

### L-30 — ⏳ Las features del SERP MUEREN: toda regla de SEO/rich-results lleva FECHA + FUENTE PRIMARIA y se re-verifica antes de portarse *(ADR §33; verificado en prod bersaglio 2026-07-17)* ⇒ **migrada al maestro**: [[INMO:L-30]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-29 — 🕵️ El contenido INVENTADO se ve BIEN: solo lo caza CONTAR contra la fuente, con un auditor adversarial *(ADR §32.24; el mismo fallo de método de §24-29, ahora en MI trabajo)* ⇒ **migrada al maestro**: [[INMO:L-29]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-28 — 🎭 `getComputedStyle` MIENTE en toda propiedad con `transition` (invierte L-22) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá) ⇒ **migrada al maestro**: [[INMO:L-28]]
### L-62 — 🔍 Sonda de semántica que mira el elemento y no su ANCESTRO: 4 de 5 señales falsas (`<template>`, `hidden`, atributo desnudo) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
### L-68 — 🎭 Una override que COMPILA y se SIRVE puede perder en silencio: `@media` NO aporta especificidad → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
### L-69 — 🎭 Retirar un dato de UNA pantalla y dejarlo en otra es ESCONDERLO; el comentario que certifica la retirada lo vuelve invisible → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-63 — 💸 Dos validadores CORRECTOS del mismo campo y ninguno comprueba que hablen de la misma UNIDAD (un contrato del 10 % no se podía liquidar) → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-64 — 🪤 Un gate NUEVO se queda en verde de TRES formas (contar el marcador · medir por cercanía · leer una alternativa como si fueran dos) → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-65 — 🌗 Un gate con **exención de entorno** da un verde que nadie ha visto fallar JAMÁS (el RNT «bloqueaba el build» mientras el build pasaba a diario) → 🧩 **shard `38a-ARMADO-DEL-GATE.md`**
### L-70 — 🚦 El PREDICADO que decide si un gate llega a correr es parte del gate: 55 de 100 commits entraron sin escáner de secretos en un repo público → 🧩 **shard `38a-ARMADO-DEL-GATE.md`**
### L-71 — 🚦 Un ANCLA borrada DESARMA su gate en silencio (el #4 lleva 9 días omitido y sigue el ✅), y nadie mide cuántos chequeos CORRIERON → 🧩 **shard `38a-ARMADO-DEL-GATE.md`**
### L-72 — 🔴 Un gate que miente en ROJO viene con una INSTRUCCIÓN: el espejo emparejaba por orden físico de las líneas y el único arreglo obediente que compilaba dejaba en 404 cada inmueble reservado → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-73 — 🕳️ Un hook que emite JSON firma un CONTRATO con el esquema del harness: el PreCompact llevaba 44 días descartado en la raíz — 0/15 entregas, 13 fallos invisibles → 🧩 **shard `38a-ARMADO-DEL-GATE.md`**
### L-74 — 🎭 Un `\b` casa DETRÁS de los dos puntos: `[[CARS:L-01]]` se leyó `L-01` y resolvió contra OTRA lección, en VERDE → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-26 — 🖥️ Panel integrado = renderer CONGELADO (rAF 0 frames) · juicio visual SIEMPRE por Chrome → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá, incl. corrección capital + variante resize) ⇒ **migrada al maestro**: [[INMO:L-26]]
### L-24 — Verificar un build contra el MOCKUP por ESTRUCTURA (checklist de secciones), no solo por color *(Ola 1, ADR §32; el dueño cazó lo que la verificación no)* ⇒ **migrada al maestro**: [[INMO:L-24]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-23 — `astro-icon` es INCOMPATIBLE con el runtime Cloudflare Workers (dev): "module is not defined" *(Ola 1 header, ADR §32)* ⇒ **migrada al maestro**: [[INMO:L-23]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### L-22 — 🖥️ Verificar UI por computed styles vs captura (el panel desincroniza/timeout el screenshot) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá) ⇒ **migrada al maestro**: [[INMO:L-22]]
---

### L-45 — 🔀 Dos escritores, una colección, dos modelos: el `as T` a ciegas convierte «datos viejos» en «catálogo vacío sin errores» *(2026-08-21, ADR §103)* ⇒ **migrada al maestro**: [[INMO:L-45]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

## Guardarraíles de diseño (vinculantes)
- **Carga de propiedades**: SIEMPRE `limit(9)` paginado, NUNCA todo el catálogo (free-tier).
- **Caché frontend 3 capas**: Memory + IndexedDB + localStorage (reducir lecturas Firestore); TTL 5 min CRÍTICO.
- **Deploy de reglas es MANUAL** (`firebase deploy --only firestore:rules`) — NO automático.
- **Formularios** → Firestore `solicitudes` + Cloud Function email. ⚰️ El gap J2 (FormSubmit residual) era del sitio viejo RETIRADO (§15 obsoletó TODO-01..08) → `_legacy/LECCIONES-SITIO-VIEJO.md`.

---

### L-38 — 🖼️ `srcset` puede EMPEORAR el peso cuando la MISMA foto sirve a huecos de tamaños dispares *(2026-08-20, portal)* ⇒ **migrada al maestro**: [[INMO:L-38]]
Cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (punto de retorno del ABORT).

### M-01 — El tablero `05` se rezaga cuando la realidad avanza si el CIERRE no lo re-fresca en el mismo commit
### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación debe ser AUTOMÁTICA, no prometida
### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales POR-OPERADOR: el gate debe vivir EN EL RECURSO
### M-04 — Un ID lo asigna quien escribe, y dos frentes escribiendo en paralelo colisionan en silencio
### M-05 — Un techo que se mueve para alcanzarlo no es un techo
### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, las tres dan ✅
### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado (el 4º repo no tenía pre-commit)
### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega
### M-09 — El always-on se ganó por importancia y nunca se perdió por desuso: el criterio es frecuencia × costo de omisión
### M-11 — Escribir la lección NO la aplica: si el PENDIENTE no se re-etiqueta, el cerebro la ignora otra vez → 🧩 **shard `33a-LECCION-QUE-NO-DISPARA.md`**
### M-23 — Un paso de procedimiento que nadie ha ejecutado no es documentación: es una HIPÓTESIS, y se comprueba el peor día *(auditoría #10, §140 · §145)*
### M-10 — Un gate cubre UNA DIRECCIÓN; la doctrina promete las DOS — y el ✅ se lee como cobertura total
### M-24 — Una lección CORRECTA archivada bajo el disparador equivocado no dispara: se redacta por su condición mínima detectable, no por la escena en que se descubrió *(§160)* → 🧩 **shard `33a-LECCION-QUE-NO-DISPARA.md`**
### M-25 — Una regla ESCRITA da la sensación de estar APLICADA: si nadie la vigila, es una nota, no una regla — y cuanto mejor escrita, más engaña *(4× el 26-ago: §162, §163, §172, §173)* → 🧩 **shard `33a-LECCION-QUE-NO-DISPARA.md`**
### M-26 — Un nodo que se consulta CUANDO ALGO FALLA no puede evitar el fallo: la lección estaba bien escrita y en su sitio, pero el router solo llevaba a ella DESPUÉS *(§174)* → 🧩 **shard `33a-LECCION-QUE-NO-DISPARA.md`**
### M-27 — Una sonda ad-hoc debe imprimir su COBERTURA, no solo su resultado: «no encontré nada» es indistinguible de «no miré en ningún sitio» *(§202)*
### M-28 — Un remedio colocado DESPUÉS del punto de no retorno no protege de nada, y encima tranquiliza: si vuelves a caer teniendo la lección delante, el defecto es de su REDACCIÓN *(§216.8)* → 🧩 **shard `33a-LECCION-QUE-NO-DISPARA.md`**
### M-29 — Un gate que infiere una CAUSA de una CORRELACIÓN debe escribir su premisa al lado: caduca cuando cambias de COSTUMBRES, no de código, y entonces no hay diff que la delate *(§216.9 · detalle en `33`)*
### M-30 — Identificador INVENTADO ×4 en una noche (constante, helper, enum de una regla de seguridad, estado): escribir de memoria en vez de leer → 🧩 **shard `33-LECCIONES-META.md`**
### M-31 — 🎯 Un hallazgo que escribí YO apuntaba al nodo que acababa de TOCAR, no al que peor estaba: un remedio sin denominador es una corazonada con formato de tabla → 🧩 **shard `33-LECCIONES-META.md`**
### M-32 — ⚙️ Un hecho que ya BLOQUEA un gate no pertenece a un nodo always-on: se paga en cada arranque y la copia es la que envejece · y **aplica la regla, no la narres** → 🧩 **shard `33-LECCIONES-META.md`**
### M-34 — 🎯 Normalizar dentro del INSTRUMENTO no protege lo que mides A MANO junto a él: comparé `git show` (LF) contra disco (CRLF) y una cifra falsa casi ordena podar conocimiento real → 🧩 **shard `33-LECCIONES-META.md`**
### M-35 — 🧱 Ocho neuronas al 100 % a la vez: el cerebro no engordaba, se quedó SIN SITIO — y el reflejo que manda capturar antes de cerrar no tenía dónde escribir → 🧩 **shard `33-LECCIONES-META.md`**

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> 🧩 **Mudadas a `60-WORKFLOWS §Gobernanza`** el 2026-07-28 (ADR §68): hablan de CÓMO se conduce la
> maquinaria (Chrome live · comité/workflow acotado · asesor externo), que es el dominio de `60`, no una lección de bug. Vinculantes igual.

### 🧰 Utillaje → `docs/36-LECCIONES-UTILLAJE.md`
Las lecciones donde miente la HERRAMIENTA y no el código (shell, intérprete, `grep`, CI, orquestador,
mockups) viven en su hoja. Aquí queda su TÍTULO —igual que con las `M-` de `33`— para que `30` siga
siendo el índice de todas y una cita `[[L-NN]]` resuelva sin salir de aquí (§125).

### L-25 — En `pipeline()` de Workflow las etapas ≥2 reciben `(prevResult, originalItem, index)`: NO captures el ítem por closure *(ADR §32.9, auditoría de fidelidad de la home)* ⇒ **migrada al maestro**: [[INMO:L-25]]
### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)* ⇒ **migrada al maestro**: [[INMO:L-27]]
### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar: el mockup se trae por MCP, no por URL *(2026-08-19, ADR §89)* ⇒ **migrada al maestro**: [[INMO:L-37]]
### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO ⇒ **migrada al maestro**: [[INMO:L-46]]
### L-66 — 🪤 Dos herramientas con el MISMO nombre no miden ni apuntan a lo mismo: `/tmp` cambia de sitio · y una fila de 260c es 261 para el gate, que lee con CRLF → 🧩 **shard `36-LECCIONES-UTILLAJE.md`**
### M-33 — 🎭 Un hallazgo abierto que invoca una regla del cerebro **sin abrir el gate que la ejecuta** es una opinión — 3 de 13 eran FALSOS → 🧩 **shard `37-META-FUNDACIONALES.md`**
### L-67 — 🎭 Bumpear una constante que **no lee nadie** (el `CACHE_NAME` del SW), y anotarlo como protección → 🧩 **shard `36-LECCIONES-UTILLAJE.md`**
### L-47 — 🐍 `open(p,'w').write(open(p).read()+X)` **borra el archivo**: el truncado ocurre antes de la lectura *(§118)* ⇒ **migrada al maestro**: [[INMO:L-47]]
### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)* ⇒ **migrada al maestro**: [[INMO:L-48]]
### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla entera, en silencio *(§130)* ⇒ **migrada al maestro**: [[INMO:L-50]]
### L-51 — Un «Deploy complete!» puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)* ⇒ **migrada al maestro**: [[INMO:L-51]]
### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre**: `tsc` no lee los `.astro`, y un `var(--x)` inexistente se descarta sin avisar *(§138)* ⇒ **migrada al maestro**: [[INMO:L-52]]
### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE: escribirlo es la mitad, cablearlo es la otra *(§142)* → 🧩 **shard `38a-ARMADO-DEL-GATE.md`**
### L-57 — 🎭 Una herramienta sin su prerrequisito puede **PREGUNTAR en vez de fallar**, y sin terminal eso sale **exit 0**: el gate afirma haber pasado sin mirar nada *(§175)*
### L-58 — 🎭 Un gate puede imprimir un número CIERTO de una comparación que no significa nada: un porcentaje sin su denominador auditado es decoración *(§193)*
### L-59 — 📋 Enumera los pares «declarado ↔ desplegado» y compáralos uno a uno: lo que no se puede LEER no es un par verificable, es un sello *(§198)*
### L-60 — 🔀 Antes de desplegar un trigger, mira quién MÁS escucha ese evento: dos escritores del mismo campo no fallan, discrepan a veces *(§199)*
### L-61 — 🔐 Comprobar que las REGLAS están desplegadas, desde fuera y sin credenciales → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
