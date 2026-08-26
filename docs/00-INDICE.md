# 🗂️ 00 — ÍNDICE SINÁPTICO (Altorra Inmobiliaria)

> Dos capas: (1) **enrutamiento semántico** (síntoma/tema → neurona) para no escanear el cerebro;
> (2) **mapa § → línea** del `99-HISTORIAL` para leerlo por offset (regla de oro anti-saturación, §0).
> ⚠️ Las líneas son **pistas** (pueden desincronizarse). `npm run brain:check` valida el desync.
> 🛡️ **`npm run brain:index` AUTO-RECONCILIA la columna Línea** desde los headers de `99` (cura el drift; guardián de cars TODO-32/§14). 🪦 **Tombstone**: `> ⛔ REEMPLAZADO POR §M` bajo un ADR superado = NO lo apliques, ve a §M (el guardián valida que §M exista).

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona)

| Si necesitas… | Ve a |
|---|---|
| Decisión Fuerte / auditoría / revisión / diseño-UI no trivial (¿aplico el flujo del dueño?) | 🔁 `60-WORKFLOWS` **W-11** (COMPLETO o nada + 3 artefactos: mockup·prompt-Gemini·prompt-Chrome) + skill `proceso-decision-fuerte` |
| Diseño YA sellado del portal (paleta/superficies/tipografía/glass/neumorfismo · retrieval, NO re-decidir) | `99 §23` (D1 dual-mode · Cormorant/Hanken · paleta oficial) + `portal/src/styles/tokens.css` (SSoT) |
| Identidad, reglas absolutas, gobernanza | `CLAUDE.md` (router) |
| **Voy a escribir o editar CÓDIGO** (CSS/JS/HTML/Astro): stack real de los 2 mundos · performance · CSS del legacy · observadores/concurrencia | 🖥️ `34-DOCTRINA-CODIGO` (hoja de `30`; salió del router en §84) |
| Estado actual (build/cache/branch/flags) | `05-ESTADO-GLOBAL` |
| ¿Está desplegado? / antes de afirmar qué hay en PRODUCCIÓN / "ya pusheé" | `git fetch` + `git log origin/main` SIEMPRE; el `05` se auto-marca "no re-verificado" → NO autoritativo sin git real (§3.3) |
| En qué se está trabajando / pendientes (TODO-NN) | `10-MEMORIA-CORTO-PLAZO` |
| Dónde vive un componente, flujo, **schema Firestore**, blog | `20-MEMORIA-ESPACIAL` |
| Un bug/síntoma que "te suena", receta, gotcha | `30-LECCIONES` |
| Mapa (MapLibre/Protomaps/pmtiles/tiles/marcadores/R2 tiles) · binding CF desde ruta SSR | `99 §55` + `30 L-33` (`cloudflare:workers`) + `50 §Tiles` (subir .pmtiles) |
| **Funciona en dev pero NO en producción** (Cloudflare) · el mapa no carga en prod | `30 L-34` (Workers Static Assets IGNORA `Range`; `astro dev` SÍ lo honra → paridad dev↔prod FALSA) + `99 §55.9` |
| **¿Quién firma como ARRENDADOR?** figura de firma · mandato sin representación · quién demanda | `99 §66` (ALTORRA en NOMBRE PROPIO, C.Co. 1262 — decidido y blindado; el propietario NO es parte) + `42-LEGAL` |
| Catálogo (índice denormalizado `indices/*` · `catalogo.get` · `/api/catalogo` · SERP con datos reales) | `99 §54`decisión · `§56`lectura · `§57`núcleo · `§58`Functions · `§59`SERP+flag · **`§60`frontera+ficha** · `30 L-35`/`L-36` |
| Verificar UI (screenshot/computed/scroll/interacción · panel congelado vs Chrome) | hoja `31-VERIFICACION-UI` (L-22/L-26/L-28 completas; lápidas en `30`) |
| Redactar/corregir/renumerar/retirar un entregable legal u operativo · auditar documentos | hoja `32-LECCIONES-DOCUMENTALES` (familia `LD-NN` completa; antes eran `L-31..L-34` "del kit", ADR §68) |
| El cerebro me falló COMO MEMORIA (nodo stale, ruteo errado, regla mala) · meta-aprendizajes `M-NN` | hoja `33-LECCIONES-META.md` (stub en `30`, detalle allá) |
| **Algo societario**: precio de acciones · mayorías · quién manda · pleito entre socios · quién es gerente | 📜 **ESTATUTOS V5 primero** (`Downloads/ALTORRA Company (Legal)/Estatutos/`) — mandan sobre todo el kit. Resumen y qué NO cubren → `99 §70` |
| **Encender el portal** / cutover / DNS / «¿por qué sale noindex?» / orden de despliegue | 🚀 `specs/CUTOVER-RUNBOOK.md` (SSoT del orden; 6 fases con verificación y vuelta atrás) |
| **Dar de alta, editar o listar un inmueble** desde el panel · «¿por qué no aparece lo que guardé?» | `99 §108` alta · `§110` listado+columna «¿se ve?» · `§111` edición · mapa en `21` |
| **Subir una foto** / R2 / «¿quién puede escribir en el bucket?» / verificar identidad en el edge | `99 §107` (JWT RS256 con WebCrypto; a R2 NO llegan las Rules) |
| **El catálogo sale VACÍO** y no hay ningún error · una propiedad que no aparece | `99 §103` (esquema del panel viejo) · `§104` (RNT) · `problemasParaPublicar()` en `domain/catalogo.ts` dice el motivo |
| **¿Puedo llamarlo «avalúo»?** · usar en publicidad el nombre de una profesión regulada | `99 §105` + `42-LEGAL §9` (Ley 1673/RAA) + skill `legal-colombia` |
| **Permisos del panel**: claim de staff, `isStaff()`, quién ve `/gestion`, ruleset fusionado | `99 §99` claim · `§100` ruleset único (desplegar el del portal MATABA `admin.html`) |
| **Alertas guardadas / digest diario / Resend** | `99 §96` (gate vivo: clave + dominio verificado → fase 0.2 del runbook) |
| **La ficha de inmueble** (`/inmueble/<slug>`, slug, gate de publicación, Open Graph) | `99 §97` + `§111` (el slug se CONGELA al crear) |
| **Auditoría del cerebro**: qué falla, qué gate quitar, por qué un ✅ puede no valer | `99 §109` (la clase del *✅ inmerecido*) + tabla en la bóveda |
| **Vencimientos, renovaciones, mora, pagos del canon** · «¿qué vence esta semana?» | `99 §112` (agenda pura, `hoy` inyectado) + `domain/gestion.ts` el modelo |
| **Registrar un contrato** · depósito/garantía · «¿puedo pedir un mes de depósito?» | `99 §113` (callable `crearContrato`; en VIVIENDA el depósito está PROHIBIDO, art. 16 Ley 820) |
| **Cobrar el canon, honorarios, IVA, giro al propietario** · «¿cuánto le toca al dueño?» | `99 §115` (`cifrasDePago`: el IVA va sobre los honorarios, la administración no es del propietario) |
| **Una tabla/lista sale despintada, sin rejilla ni tarjeta** · «el CSS no aplica y no falla nada» | `99 §117` (Astro acota con `data-astro-cid`; los nodos de runtime no lo llevan → `npm run verify:css`) |
| **PQRS, tickets del inquilino, plazo de 48h** · «¿qué se me está pasando?» | `99 §118` (`estadoDeSla` vive con la mora en `agenda.ts`; no se cierra sin escribir qué se hizo) |
| **Exportar a CSV/Excel** · «se abre con las columnas corridas» · «¿esto es seguro?» | `99 §119` (RFC 4180 + BOM + anti-fórmula CWE-1236: `src/lib/domain/csv.ts`) |
| **Reseñas / testimonios / rating en el sitio** · «es solo la maqueta» | `99 §122` (fabricarlos es Ley 1480; secciones dependientes de datos, no borradas) |
| **«En local pasa y en CI falla»** · el sitio vivo contradice al repo | `99 §125` ([[L-48]]: un prerrequisito GENERADO y gitignored; que lo genere el propio script) |
| Project ID, cuentas IAM, deploy, secrets | `50-CONFIG-INFRA` |
| Competencia/mercado inmobiliario, benchmark | `40-LOBULOS` → `41-MERCADO` |
| Legal Colombia: Ley 820/RNT/Habeas Data/pagos/firma/SIC — gates de features y agenda abogado | `40-LOBULOS` → `42-LEGAL` (detalle: `specs/R3-LEGAL-COLOMBIA-2026-07.md`) |
| **Operación real del negocio**: tarifas y estándares · procesos · matrícula/RNT · **cómo se GENERAN los documentos corporativos** (no se editan a mano) | `40-LOBULOS` → `43-OPERACION` |
| El "por qué" de una decisión / detalle histórico | este índice → `99-HISTORIAL` (offset) |
| Decisión cara de revertir (2ª opinión externa) | `15-CONSEJO-EXTERNO` |
| "Access denied / permission-denied al login" | `30 L-01`/`L-02` |
| Deploy de Cloud Functions falla (Eventarc) | `30 L-07` + `50-CONFIG-INFRA` |
| smart-search / hero / replicar patrón de cars | `99 §10` (§12 rescatado) |
| ¿Una regla de SEO/rich-results sigue vigente? (FAQPage, price, GBP, indexación) | `30 L-30` (features del SERP mueren: fecha+fuente primaria) + skills del paquete de visibilidad (corregidas 2026-07-18, `99 §33`) |
| Skills: qué hay, dónde vive cada una, parejas repo↔user | `docs/skills-inventory.md` (re-auditado 2026-07-18; editar AMBAS copias) |

---

## 📚 Mapa de ADRs § → línea (99-HISTORIAL)

> `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.

| § | Tema | Línea |
|---|---|---|
| §01-§20 | 🗄️ **Era del sitio viejo (RETIRADO) + arranque del cerebro** — 20 filas movidas al shard `docs/00a-INDICE-HISTORICO.md` (§85). El kernel lee ambos índices como UNO. | → `00a` |
| §21-§60 | 🏗️ **Era de CONSTRUCCIÓN del greenfield** (scaffold, modelo de datos, design system, las superficies del portal, mapa y catálogo) — 40 filas movidas al shard `docs/00b-INDICE-CONSTRUCCION.md` (§100). El kernel lee los tres índices como UNO. | → `00b` |
| §66-§90 | 🏛️ **Era de FUNDACIÓN** (kit societario de 24 docs, gates legales, operación real del dueño, auditorías del cerebro y el cierre de OLA 1) — 25 filas movidas al shard `docs/00c-INDICE-FUNDACION.md` (§116). El kernel lee los cuatro índices como UNO. | → `00c` |
| §91-§120 | 🏗️ **Era de CONSTRUCCIÓN DEL PORTAL** (SERP, ficha, alertas, precios, ruleset fusionado, leads, R2 y el runbook del cutover) — 30 filas movidas al shard `docs/00d-INDICE-PORTAL.md` (§156). El kernel lee los cinco índices como UNO. | → `00d` |
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
| §65 | **TODO-34 F4-w2 ✅: MANUAL MAESTRO (10 caps) + mercado → sistema documental 00-23 COMPLETO**. Tarifas comerciales adoptadas-vetables con costumbre certificada · FE gratuita DIAN soporta mandato nativo · prompt consejo externo del manual listo. | 1006 |
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
| §161 | 🍞 **Migas de pan: 8 copias del mismo bloque y 10 páginas públicas sin ninguna** (las 4 legales incluidas). Helper puro + prop `miga` en `BaseLayout`. Migración con FOTO PREVIA: 23 idénticas byte a byte, 0 cambiadas. | 6147 |
| §162 | 🗺️ **`/nosotros` no estaba en el sitemap** — y el archivo había PREDICHO ese olvido en su propio comentario. Regla nueva: o `noindex`, o anunciada, en los dos sentidos. La sonda mira el FUENTE, y ahí está el porqué. | 6189 |
| §163 | 🏚️ **El cutover podía publicar 38 enlaces a un inmueble que NO EXISTE**. El interruptor estaba cableado; faltaba quien hiciera ruido al olvidarlo. Gemelo del candado de indexabilidad: los dos se ven perfectos. | 6238 |
| §164 | 🔬 **Auditoría Nivel-2 #11** (disparada por el linter, que BLOQUEÓ un commit). La receta del boot crónico llevaba 2 ediciones MAL APUNTADA: el router es el 59% y su cap no disparaba nunca. Cap 25k→19k. | 6280 |
| §165 | ⚖️ **El «gate del abogado» no existía** (Daniel: «mi abogado eres tú»). Dictamen propio: el recaudo de cánones NO es captación masiva (`D.1068/2015 art. 2.18.2.1`), con 3 condiciones de diseño vinculantes. | 6339 |
| §166 | 💵 **La liquidación del mandato**: `payout_propietario` existía como tipo y nadie calculaba su monto. La retefuente del 3,5% NO es constante (depende de quién paga). Invariante: entra = sale, probado con 112 combinaciones. | 6404 |
| §167 | 🧾 **La liquidación como COMPROBANTE**, no calculadora: cada línea dice a quién va el peso, y el cuadre se ve. Y `verify:css` no veía NI UNA clase del módulo — la buena práctica (cero `innerHTML`) lo dejaba ciego. | 6451 |
| §168 | 📄 **Certificación al propietario** (3.ª formalidad del mandato). El kit daba por hecho un «bajo la gravedad del juramento» que NO aparece en la norma: no se escribe lo que no se ha leído. El ingreso es el CANON, no lo cobrado. | 6505 |
| §169 | 🪝 **El webhook de Wompi**, la pieza de más riesgo del carril: no da errores, da cobros dobles. Tres trampas conocidas + una CUARTA propia (validar la firma ANTES que la idempotencia, o se puede tumbar un cobro ajeno). | 6551 |
| §170 | 🔐 **La máquina del mandato**: liberar es una DECISIÓN (retracto de 5 días hábiles, art. 47) y no el efecto de un `APPROVED`. Y «reversado» puede esconder una deuda: prohibir la transición no evita el contracargo, evita VERLO. | 6604 |
| §171 | 🛡️ **La garantía de arriendo**, el último gate «sin investigar»: solo como AGENCIA del asegurador, con su carta de autorización previa (Ley 510/99 art. 101). Corredor no se puede ser; garantía propia, jamás. | 6652 |
| §172 | ⏰ **La Ley 2300 SÍ aplica** a la prospección comercial, no solo a la cobranza — y DOS programadas escribían fuera de ventana (una a la 1 de la madrugada). Nace el calendario de festivos, calculado y no copiado. | 6708 |
| §173 | 🪧 **Una regla escrita da la sensación de estar APLICADA** (M-25, 4× en un día). El panel decía «Tu avalúo» con la prohibición en CUATRO sitios. Sonda nueva + shard de `33` → `37`, que ya iba por la tercera recomendación. | 6773 |
| §174 | 🏠 **El reglamento de PH que CALLA no autoriza** (D.1074 · L.675 18.1): gate de 3 estados. Y **855 pruebas que el CI no corría**. Nace [[M-26]]. ⚠️ §174.3 tenía un dato FALSO → §175. | 6822 |
| §175 | 🎭 **El gate que PREGUNTA en vez de fallar**: `astro check` sin `@astrojs/check` sale **exit 0**. Un día de «Tipos ✅» sin mirar nada, y el CI **nunca estuvo rojo**. Nace [[L-57]]. | 6930 |
| §176 | 💸 **Webhook de Wompi**: mapea a TRANSICIÓN, no a estado — un evento tardío pisaría un mandato ya girado. `anotar`+500 nunca juntos. Enum duplicado → `Exclude`. Y las 9 Functions sin gate de tipos. | 6987 |
| §177 | 🧪 **141 pruebas fuera de todo gate**, y la línea base ROJA por mi §174. «Necesitan Java» había caducado: 24 s. `test:rules` al CI. `firebase-tools` sin declarar = 3ª vez. + atomicidad del webhook. | 7060 |
| §178 | 👯 **Barrido de GEMELOS** (mismo nombre exportado desde 2 módulos): dos `IVA`, tres `COP_FMT`, dos `etiquetaTipo` (singular vs plural). Gate `verify:simbolos` con deuda congelada. | 7114 |
| §64 | **TODO-34 F4-w1 ✅: KIT FUNDACIONAL 14 docs + Word + `00-LEEME`** (10 redactores + 5 auditores → 37 fixes aplicados). Patrón redactor→auditor-adversarial→aplicador PROBADO. | 996 |
| §63 | **TODO-34 F2 ✅: verificación legal 6 frentes .gov.co + Gemini integrado**. RUB vencido→YA · CE SAGRILAFT derogada 02-jul-26 · 5 prácticas ILEGALES · canon-neto legal (4 formalidades de mandato) · §63.8 cero contratos vigentes → F4 reordenado. | 985 |
| §62 | **TODO-34 F1 ✅: triaje del corpus (143, 9 lectores) → nace `43-OPERACION`**: doble NIT · matrícula sin resolución · gerente sin mayoría · KYC→FONPRECON · tarifario inexistente. | 975 |
| §61 | ⭐ **PIVOTE DE MISIÓN: Fundación Operativa (TODO-34)** — armar la inmobiliaria con datos reales (Claude = abogado + empleados · cerebro dual). Corpus: 83 docs + operación VIVA. Plan F1-F4. | 965 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
