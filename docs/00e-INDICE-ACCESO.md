# 🗂️ 00e — ÍNDICE DE ACCESO Y CUTOVER (§121-§160 · el panel, su puerta y la maquinaria de producción)

> **Quinto shard de rango de `00-INDICE`** (ADR §196). El kernel descubre las hermanas por PATRÓN
> (`00[a-z]?-INDICE*.md`) y trata a las seis como UN índice: los chequeos #3 (desync), #5a (ADRs
> indexados) y #9 (consolidado) leen todas. Mover filas aquí **no** las saca del cerebro.
>
> **Por qué ESTAS**: es el tramo en que el panel dejó de ser código y pasó a tener dueño dentro —
> recuperación de contraseña, 2FA de punta a punta, las cinco puertas de escritura, la bóveda— y en
> el que se armó lo que lo pone en producción: los índices que nunca se desplegaron, el codebase que
> no podía desplegarse, el mapa de 301 que jamás se ejecutó y los gates que miraban a otro lado.
> Historia CERRADA: se consulta, no se edita.

| § | Qué decidió | Línea en `99` |
|---|---|---|
| §121 | 🔢 **Gate #29**: las cifras que el cerebro afirma se CUENTAN contra el código. El «CF 9» era 11, con el sello fresco. | 4076 |
| §122 | 🏖️ **Estancias**: el botón «Reservar» no enviaba nada y las reseñas eran inventadas (Ley 1480). Solicitud real + secciones dependientes de datos. | 4110 |
| §123 | 📊 **20 cifras inventadas en la home** + gate `verify:claims`: una cifra publicada tiene que tener quien la firme. Kernel v1.14.0 (`x-`). | 4167 |
| §124 | 🚀 **Fase 1 DESPLEGADA** (claims): el alcance del runbook se estrechó a mano — `functions:default` habría encendido los correos de nurturing. Paré antes del backfill. | 4223 |
| §125 | 🔴 **El CI llevaba 8 corridas rojo** desde el commit que añadió el gate: nada de §113-§123 se desplegó. Prerrequisito generado + ignorado = local ≠ CI. | 4270 |
| §126 | 🔘 **El runbook mandaba a pulsar un botón que no existía** — el paso que bloquea el cutover. Construido; ningún gate caza un elemento de UI prometido por un spec. | 4318 |
| §127 | 🔬 **Auditoría #9** (parcial, sin subagentes): 6 hallazgos, 4 cerrados el mismo día. Los encontró USAR el cerebro, no sondearlo. | 4363 |
| §128 | 🔑 **El dueño no podía entrar a su panel**: sin recuperación de contraseña, y leyendo el placeholder como si fuera la cuenta. | 4394 |
| §129 | 🚪 **El candado del acceso también dejaba fuera al dueño**: `loginAttempts` es abierto y el id es el hash del correo ⇒ bloqueo dirigido, y encima se saltea. 9 huecos, mockup de puerta única, skill `acceso-y-autenticacion`. | 4432 |
| §130 | 🔐 **El 2FA de cars decide en una variable del navegador** (la sesión ya existe al pedir el código). `loginAttempts` retirado · bitácora que alguien escribe · rol en `/gestion` · [[L-50]]. | 4484 |
| §131 | 🎟️ **Invitar en vez de inventar la contraseña ajena** (`randomBytes` que no ve nadie + enlace) y **suspender en vez de borrar** (escribe `activo` ⇒ el trigger revoca tokens). Guarda del último super_admin. | 4557 |
| §132 | 🔓 **Un `gcloud auth login` tumbó el muro de la consola**: 4 de 5 pendientes pasaron a API. Identity Platform · TOTP · clave 6→12 · **TODO-42 lo cerró el trigger** · fase 2 EN VIVO (404→403). | 4606 |
| §133 | 👁️ **Los avisos del login no se han visto NUNCA**: el CSS pedía `.visible`, el JS quitaba `hidden`. Texto escrito, altura 0px. + el CSS se servía nuevo y llegaba viejo (sin `?v=`). Sonda: medir `display` Y ALTURA. | 4670 |
| §134 | 🧱 **Los 14 índices no se desplegaron NUNCA**: al `firebase.json` raíz le faltaba la clave `indexes` y la CLI decía «Deploy complete» igual. Una consulta rota tumbaba el panel entero por `Promise.all`. | 4721 |
| §135 | 🚪 **La persistencia offline dejaba al dueño fuera**: una pestaña vieja sin sesión hacía de «principal» y las lecturas salían sin credencial. Se retira (también cacheaba PII en disco). Mi hipótesis era falsa; la corrigió su consola. | 4784 |
| §136 | 🔻 **Cambié un contrato y olvidé un callsite**: `onAuthStateChanged` leía `.activo` sobre el envoltorio → expulsaba al entrar. + di una causa FALSA sin comprobarla, 24h después de §135.2. Gate nuevo, probado en los dos sentidos. | 4849 |
| §137 | 🔐 **2FA TOTP de punta a punta**: el orden son TRES pasos —resolver → inscribir → exigir— y faltaba el 1º. `/seguridad` nueva. Sin QR, sin códigos de respaldo, sin «confiar 30 días»: cada ausencia con su razón. | 4902 |
| §138 | 🛡️ **Tres gates que miraban a otro lado**: `tsc` no lee los `.astro` (15 errores ocultos) · `var(--x)` inexistente se descarta en silencio · el gate de cifras no veía las EDITORIALES. Misma falla con tres caras. | 4963 |
| §139 | 🕹️ **Media interfaz del panel, muda**: a un `viewer` no se le cableaba el menú, y 4 controles no hacían nada. Gate `verify:controles`, con sus 3 falsos positivos corregidos ANTES de encenderlo. | 5010 |
| §140 | 🚀 **El codebase `portal` nunca se había desplegado, y no podía**: el comando del runbook fallaba siempre · un secreto ausente bloqueaba las 9 · el `ignore` se comía el punto de entrada. 5 puertas de GESTIÓN VIVAS. | 5078 |
| §141 | 🧪 **Las 5 puertas de escritura, probadas contra el emulador** antes de que el dueño las estrene (16 pruebas, con los RECHAZOS). Destapó **4 copias de `firebase-admin`** con registros de apps distintos. | 5143 |
| §142 | 🗄️ **La BÓVEDA del expediente** (B5): no es subir archivos, es saber QUÉ FALTA. Nunca `getDownloadURL` (enlace público). Y `verify:data` **existía y no lo corría nadie** → meta-gate de cableado. | 5180 |
| §143 | 🔬 **TODO-45 no era deuda del repo**: los 92 basename son buena escritura, y el arreglo vive en el KERNEL → movida a TODO-23. + la sonda de ids miraba media página (63 ids de módulos, sin cubrir). | 5251 |
| §144 | 🚀 **La fase 3 del cutover no era indivisible**: 2 de las 4 Functions que faltaban NO son programadas y no comprometían nada. Desplegadas — el índice del catálogo ya se reconstruye solo. | 5296 |
| §145 | 🔴 **El mapa de 301 llevaba SIEMPRE sin ejecutarse** — y mi 1ª causa fue equivocada. Astro no corre el middleware en rutas que no existen. 64/65 verificados uno por uno. + `/admin.html` muere en el cutover. | 5323 |
| §146 | 🔬 **Auditoría Nivel-2 #10**: los hallazgos salieron de EJECUTAR el runbook, no de leer el cerebro. 2 reincidencias (runbook no ensayado → M-23 · BOOT al 99% crónico). `verify:data` no lo corría nadie; 3 gates miraban donde no hacía falta. | 5396 |
| §147 | 📰 **El Journal, publicado**: 4 artículos con su norma .gov.co citada. Ley e interpretación se ven DISTINTAS a propósito; `fuentes` obligatoria = sin fuente NO compila; la lectura se calcula. | 5442 |
| §148 | 🔎 **La bóveda ya se puede LEER**: quién abrió cada documento. Solo el super_admin (lleva IP de terceros) · ni IP ni ciudad, aunque estén · prueba nueva: `get` y `list` NO son el mismo permiso. | 5516 |
| §149 | ✂️ **El mapa del portal se parte en dos**: sale el back-office a `22-MAPA-GESTION` (−2422c en `21`). Frontera por PRODUCTO, no por tamaño: un shard por volumen se vuelve a llenar. Boot −23c. | 5569 |
| §150 | ↩️ **Todo el sitio redirigía a su forma CON barra** (307), desde el primer deploy: cadena en los 65 redirects y canonical peleado con el servidor. `drop-trailing-slash` + gate. Paso 5.5 ENSAYADO. | 5599 |
| §151 | 🏷️ **Pipeline de compraventa, 7 etapas** (Ola 2). La venta se perfecciona con el REGISTRO, no con la escritura (art. 756 C.C.): `vendida()` solo en registro y la pantalla grita en escritura. No es un kanban, a propósito. | 5646 |
| §152 | 🪪 **Perfil de inquilino 1→N** (Ola 2): el ÚNICO sitio donde escribe alguien de FUERA — el `uid` sale del token, nunca del cuerpo. Sin central de riesgo (ilegal sin contrato) y sin cobrar al aspirante. | 5705 |
| §153 | ⏱️ **La revisión del perfil**: la cola se ordena por ESPERA, no por llegada — una promesa de 24h sin dónde verse es un deseo. Sin puntaje (sería inventar la central de riesgo). Abrir un soporte queda escrito. | 5767 |
| §154 | 🔓 **«Crear cuenta» ABIERTA** (visto bueno del dueño). Sesión ≠ permisos: el claim no viaja con el alta. Y la casilla de habeas data deja PRUEBA en el servidor — sin ella, marcarla no prueba nada. | 5813 |
| §155 | 🪪 **«Mi perfil», el lado del arrendatario**: una página PÚBLICA que habla con Firebase SIN cargar Firebase (REST + ID token). Cada requisito dice qué SIRVE; el estado dice cuánto falta. | 5860 |
| §156 | ✂️ **Cuarto shard del índice** (§91-§120 → `00d`): tocó el tope 4 veces en un día y las 4 se pagó comprimiendo filas buenas. Comprimir vale contra la grasa; contra la historia cerrada, mudar. | 5911 |
| §157 | 🧰 **Corrí 5 gates de 7 y escribí «los 7 en verde»**. El arreglo no es acordarse mejor: `npm run verify` + un candado que comprueba que el atajo no se quede atrás. Reincidencia de [[L-56]] por el lado humano. | 5942 |
| §158 | 🏗️ **`/invertir` deja de ser un «próximamente»**: es destino de DOS redirects con años indexados, y el cartel prometía una «rentabilidad por zona» que no existe verificada. | 5973 |
| §159 | 👻 **Dos anclas fantasma en las 74 páginas** (`#nosotros`, `#servicios`: 468 enlaces muertos en el menú). El hueco vivía en la JUNTURA de dos gates. Nacen `/nosotros` y `/aliados`. | 6000 |
| §160 | 🔬 **Barrido agregado del build**: 4 defectos (título legal DUPLICADO, 2FA sin nombre accesible, el héroe leyendo sus 4 titulares) y **2 falsos hallazgos verificados**. Un comentario mío cegó a su propio gate. | 6071 |
