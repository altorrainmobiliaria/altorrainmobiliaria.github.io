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
| §91 | 🔎 **SEO técnico de OLA 1**: `PUBLIC_SITE_ENV` se leía en 2 sitios y no se declaraba en ninguno ⇒ **todo build salía `noindex`**, el del cutover también. Mapa de 68 URLs → 301, `robots`/`sitemap` conscientes del entorno, candado en `verify:build` #6. | 2464 |
| §92 | 🗺️ **13 landings de zona** (ítem 4): redirects y sitemap **derivados de `ZONAS`**, imposibles de desincronizar. CERO datos cuantitativos (el portal ya se quemó con listings fabricados). Al pasar: el portal no tenía **ni un JSON-LD** ni `canonical`. | 2520 |
| §93 | 💰 **`/precios`** (ítem 7, «el diferenciador gratis»): las cifras SELLADAS de `43`, no las del MEGA-PLAN, que están SUPERADAS. Lo no decidido se dice. ⚠️ §93.6: el footer dice «Avalúo gratis» y B13 lo prohíbe — dos fuentes del cerebro en contradicción legal. | 2560 |
| §94 | 🏷️ **Rango ALTORRA** (ítem 9): parecía gateado por Daniel y NO lo estaba — es contacto-primero, así que sin número en pantalla los rangos no son prerrequisito. Cierra el último `pendiente` del mapa de 301. B13: dice que NO es un avalúo (Ley 1673). Arregla 2 integraciones mudas: `origen` hardcodeado y la allow-list de zonas con 6 de 13. | 2598 |
| §95 | 🔖 **JSON-LD del negocio** en todas las rutas (`RealEstateAgent`, desde `BaseLayout`). Lo valioso son las 2 ausencias deliberadas: **sin `streetAddress`** (falta la dirección comercial) y **sin `aggregateRating`** (no hay reseñas; inventarlas la sanciona la SIC). | 2640 |
| §96 | 🔔 **Alertas guardadas + digest diario** (ítem 8) → **OLA 1 = 13/13**. Matching con UN dueño (web y Function importan el mismo módulo); la baja es **POST, nunca GET**. Al pasar, 3 bugs PREVIOS: `solicitudes` moría en el cutover · redirect + `headers.set()` = 500 sin JS ([[L-41]]) · habeas data a medias en el Rango ([[LD-08]]). | 2686 |
| §97 | 🏠 **La ficha dinámica** (TODO-33): el gate de §60 estaba sobre INVENTAR los 4 bloques sin fuente, no sobre construir — [[L-40]] por 3ª vez. Ruta canónica `/inmueble/<slug>`. Lo grave lo cazó la revisión adversarial: **no comprobaba que la propiedad estuviera publicada** ([[L-42]]). | 2771 |
| §98 | 🔌 **Dos premisas que no eran ciertas**: Workers Caching llevaba sin habilitar desde Ola 0 (todo `s-maxage` era INERTE) y el panel de gestión no tenía puerta. Auditar ANTES de encender salvó un token en caché. 🔴 Y el hallazgo gordo: **`isStaff()` es insatisfacible** — nadie pone nunca el claim, así que el back-office moriría al desplegar las reglas. | 2858 |
| §99 | 🔑 **Decisión Fuerte: el claim de staff** (TODO-42). Se DERIVA de `usuarios/{uid}` con un trigger, en el codebase del legacy, y se despliega SOLO. Mató el `get()` en reglas con coste verificado (se factura aunque deniegue, y `/ingresar` da sesión a cualquiera). 🎁 De regalo: desplegar las reglas del portal tal cual **mata `admin.html`** → TODO-43. | 2914 |
| §100 | 🔐 **Ruleset ÚNICO y fusionado** (TODO-43): había DOS con el mismo nombre y Firestore no fusiona — desplegar el del portal **mataba `admin.html`**. Permisos por CLAIM (cero lecturas), escape de staff en `propiedades`, y 2 agujeros del ruleset VIVO cerrados (`system` y `newsletter`). Storage igual: el deny en la raíz tapaba las fotos públicas. **80 tests de emulador**. | 2992 |
| §101 | 📥 **Bandeja de leads REAL** en el panel (ítem 10, 1ª mitad): los leads entraban desde §88 y solo se veían en la consola de Firebase, con el correo roto. Consulta acotada, sin listeners, teléfono como enlace a WhatsApp. Si falla, **borra los de muestra** — enseñarlos haría llamar a gente que no existe. | 3054 |
| §102 | 🚀 **El runbook del cutover** (`specs/CUTOVER-RUNBOOK.md`) + el interruptor que el CI **no declaraba**: `PUBLIC_SITE_ENV` no existía en ningún sitio del repo, así que TODO build de la historia salía `noindex` — incluido el que iba al cutover. Ahora 3 perillas por variable de repositorio (defaults seguros) y seis fases en orden, cada una con verificación y vuelta atrás. | 3104 |
| §103 | 🔀 **Dos escritores, un almacén, dos modelos**: `admin.html` y el portal escriben `propiedades` con esquemas incompatibles → índice vacío y cero errores. Motivo propio `esquema-legacy`. | 3162 |
| §104 | ⚖️ **El gate del RNT protegía la ficha y dejaba pasar la card**. `publicable()` se muda al MODELO; motivo `sin-rnt`. | 3219 |
| §105 | ⚖️ **«Avalúo»**: `42-LEGAL §9` no veta la palabra, veta atribuirse la actividad regulada (Ley 1673/RAA). Corte por quién produce el número. | 3266 |
| §106 | 🔎 **Recon del alta + 2 defectos vivos** (`geo.ciudad` vacía → arriendo sin matrícula; `imagenPortada:''` → sin card ni imagen al compartir). Dueño único. | 3323 |
| §107 | 📤 **Subida a R2 + identidad en el edge** (TODO-44, eslabón 1): `R2_MEDIA` llevaba desde Ola 0 sin una línea de código, y sin portada no hay card. A R2 **no llegan las Rules**, así que el Worker verifica el ID token con WebCrypto (mismo claim `admin`, cero lecturas, `alg` fijo). Devuelve la CLAVE, nunca la URL. ⚠️ El `put` real no se ha ejercitado: depende de la fase 1 del runbook. | 3389 |
| §108 | 🏗️ **El alta de propiedades** (dominio + transacción). `problemasParaPublicar()` LLAMA a los predicados del lector. Dos parsers numéricos: miles vs decimal. | 3443 |
| §109 | 🔬 **Auditoría Nivel-2 #8** — la 1ª que dispara el GATE, no una persona. Su aporte es una CLASE: el **✅ inmerecido** (el #27 aprueba tras perdonar 90 rutas por basename; el #16 aprueba «CF 9» contra 11 exports). Un gate con 0 comparaciones debe DEGRADAR. GC: se borra §4 (su gate no puede cruzar nada). ⚠️ El índice revienta en ~4 ADRs, no en 92. | 3506 |
| §110 | 📋 **Listado de inmuebles**: se podía crear y no volver a verlo. La columna «¿se ve?» NO sale del estado —engaña en dos casos reales— sino de `problemasParaPublicar()`. | 3565 |
| §111 | ✏️ **Editar un inmueble** (CRUD cerrado). El compare-and-set va en el CLIENTE: la regla del servidor no ata al super_admin, que es quien usa el panel. Slug y `createdAt` congelados. | 3605 |
| §112 | 📅 **Agenda operativa** (GESTIÓN v1, 1er trozo): el modelo no derivaba nada. Aviso de renovación a 4 meses (el legal son 3), mora por escalones el día exacto, y `setMonth` desborda. | 3647 |
| §113 | ⚖️ **`crearContrato`** impone el gate del art. 16 (depósito prohibido en vivienda). Y el portal **no tenía typecheck**: 4 errores, uno en `main` desde §101. | 3695 |
| §114 | 📋 **Pantalla de contratos**: agenda arriba, lista debajo. La callable se llama por HTTP para no ensanchar `verify:data`. El nav se rutea por ID, no por posición. | 3745 |
| §115 | 💵 **Pagos**: las cifras las deriva el contrato, no el teclado. IVA sobre honorarios (nunca sobre el canon) e id determinista contra el cobro duplicado. | 3788 |
| §116 | 🗂️ **Tercer shard del índice** (§66-§90 → `00c`): el corte es semántico y el cap se MIDE, no se elige. | 3830 |
| §117 | 🎨 **El CSS acotado no llega a los nodos que crea el JS**: 5 tablas y el aviso del catálogo público sin estilo. Gate `verify:css`. | 3857 |
| §118 | 📂 **Expedientes y novedades**: la raíz que `crearContrato` exigía y nadie acuñaba. SLA de 48h con la mora, y validar el RESULTADO y no el parche. | 3913 |
| §119 | ✅ **Sello y export** (TODO-44 cerrado): la cola es una VISTA sin lecturas extra, y el CSV cierra la inyección de fórmulas. Me di un ✅ midiendo ceros. | 3967 |
| §120 | 🛡️ **Kernel v1.12.0**: el ✅ inmerecido mecanizado (#8/#16/#27 degradan si no comparan), trinquete del índice y los 22 caps con su eje bien puesto. | 4025 |
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
| §64 | **TODO-34 F4-w1 ✅: KIT FUNDACIONAL 14 docs + Word + `00-LEEME`** (10 redactores + 5 auditores → 37 fixes aplicados). Patrón redactor→auditor-adversarial→aplicador PROBADO. | 996 |
| §63 | **TODO-34 F2 ✅: verificación legal 6 frentes .gov.co + Gemini integrado**. RUB vencido→YA · CE SAGRILAFT derogada 02-jul-26 · 5 prácticas ILEGALES · canon-neto legal (4 formalidades de mandato) · §63.8 cero contratos vigentes → F4 reordenado. | 985 |
| §62 | **TODO-34 F1 ✅: triaje del corpus (143, 9 lectores) → nace `43-OPERACION`**: doble NIT · matrícula sin resolución · gerente sin mayoría · KYC→FONPRECON · tarifario inexistente. | 975 |
| §61 | ⭐ **PIVOTE DE MISIÓN: Fundación Operativa (TODO-34)** — armar la inmobiliaria completa con datos reales (Claude=abogado+empleados · cerebro dual Code+Chat). Corpus REAL: 83 docs + operación VIVA (2 administrados); gaps: corta estancia · notaría · inquilino · contable. Plan F1-F4. | 965 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
