# 🧪 30 — LECCIONES (Memoria Procedimental · Altorra Inmobiliaria)

> Trigger de Experiencia (§G.2): ANTES de una op riesgosa/repetitiva o si un síntoma "te suena". Gotchas + recetas.
> Formato `### L-NN — <título>` (disparador + causa + fix). Varias son **heredadas de Altorra Cars** (mismo patrón
> arquitectónico) — destiladas de `_legacy/AVANCES.md §"ERRORES CONOCIDOS"`.
> 🧩 **Hojas hijas**: `31-VERIFICACION-UI.md` — L-22/L-26/L-28 COMPLETAS (verificación de UI: panel congelado ·
> Chrome · computed vs transition) · `37-META-FUNDACIONALES.md` — el detalle de **M-01..M-11** (shard del 26-ago; las vivas siguen en `33`) ·
> `32-LECCIONES-DOCUMENTALES.md` — rama **legal/documental** (`LD-NN`: contratos, manual, formatos).
> ⚠️ **Aquí solo va lo TÉCNICO.** Las viejas `L-31..L-34` "del kit" se mudaron a `32` como **LD-01..LD-04**
> el 2026-07-28 porque **colisionaban** con las L-31..L-34 de esta hoja (ADR §68 · [[M-04]]). Un ADR anterior que diga "L-33" hablando del kit se refiere a **LD-03**.

---

## Lecciones (L-NN)

> 🧩 **`L-01`..`L-21` y `L-49` viven COMPLETAS en `35-LECCIONES-PLATAFORMA.md`** — aquí queda el titular, que es lo que
> hace falta para reconocer el síntoma. Si te suena, ábrelo allá.

### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado)
### L-02 — RTDB `permission_denied` en presencia
### L-03 — Firestore "Failed to obtain primary lease"
### L-04 — ⚗️ FUSIONADA en L-09 (merge:true vs rules/upsert) — regla viva **aquí, en L-09**: `set()` SIN merge para CREAR, `update()` para EDITAR (el puntero apuntaba a `CLAUDE.md §3.5`, que se mudó a `34-DOCTRINA-CODIGO` en la poda §84; el dueño del hecho siempre fue L-09)
### L-05 — ⚰️ (sitio viejo retirado §15) Modals inyectados fuera de index → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md`
### L-06 — ⚰️ (sitio viejo retirado §15) Invalidación de cache `system/meta`→onSnapshot → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` (resucitar si el cutover reusa SW/onSnapshot)
### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc
### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null)
### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes
### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado
### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs
### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir
### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO
### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria
### L-15 — Windows: `wrangler dev` deja un `workerd.exe` huérfano que bloquea `dist/` (`EPERM` en el siguiente build)
### L-16 — Primer deploy a Cloudflare Workers: registrar el subdominio `workers.dev` ANTES (falla en CI no-interactivo)
### L-17 — Decodificar el REST de Firestore: mapas/arrays VACÍOS y despacho por clave
### L-18 — Cloudflare: DOS cachés distintas; en `workers.dev` solo sirve **Workers Caching**
### L-19 — `@astrojs/cloudflare` v14: `locals.runtime` deprecado/sin tipo; `platformProxy` removido
### L-20 — Firestore Rules: un `get` de doc INEXISTENTE con `resource.data` en la regla → 403, no 404
### L-21 — Aislar tests que comparten un emulador Firestore: projectId PROPIO por archivo
### L-49 — 🎛️ La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate la ve → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-53 — 🔐 Firebase MFA (TOTP): pide el código DESPUÉS de la contraseña, `enroll()` revoca las demás sesiones, y NO existen códigos de respaldo
### L-54 — 🌩️ Los tipos de Cloudflare Workers PISAN el DOM: `Element.append` deja de ser la del navegador (usa `appendChild`)
### L-55 — 🧬 Varias copias del MISMO SDK = varios registros: `app/no-app` con la app ya inicializada, y el error no nombra versiones
### L-44 — 🔐 Un ruleset se REEMPLAZA, no se fusiona: dos ficheros con el mismo nombre, uno gana → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-43 — 🔑 Un identificador ESTABLE no se deriva de la URL: cambia la ruta y se te queda huérfano lo guardado *(2026-08-21, ADR §97.7)*
**Disparador**: cambias el formato de una URL (de `?id=X` a `/algo/<slug>`) y algo que la gente había
guardado deja de reconocerse. **Caso**: los favoritos del portal derivaban su clave del `?id=` del enlace
de la card. Migrar la ficha a `/inmueble/<slug>` habría cambiado la clave de TODAS las cards a la vez:
corazones apagados sobre inmuebles que la persona sí guardó, sin un error en consola y sin forma de que
nadie lo notara mirando la pantalla. **Regla**: un id de persistencia sale del DATO (`data-*` puesto por
quien conoce el registro), nunca de parsear la dirección. La URL es presentación y la presentación cambia;
el id del documento no. **Corolario**: si ya tienes claves derivadas de URLs viejas, acepta las dos formas
durante una temporada — pero arregla la fuente, porque aceptar formatos no reconstruye lo que ya se perdió.
**Y un slug tampoco sirve**: basta corregir una tilde del título para que cambie.

### L-42 — 🚧 Lo escrito en un COMENTARIO no está desplegado: reglas, config y premisas → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-41 — 🧱 Las cabeceras de `Response.redirect()` son INMUTABLES: un middleware que hace `headers.set()` revienta todo redirect *(2026-08-21, ADR §96.6b)*
**Disparador**: un endpoint que responde con `Response.redirect(...)` devuelve **500** y el error apunta al
middleware, no al endpoint: «Can't modify immutable headers». **Causa**: la respuesta que fabrica
`Response.redirect()` (igual que `Response.error()`) nace con `headers.guard = "immutable"`; cualquier
`set()`/`append()` posterior **lanza**. Un middleware que añade una cabecera a TODA respuesta —el caso
típico es un `X-Robots-Tag` de staging— alcanza así a todos los endpoints que redirigen. **Dónde muerde de
verdad**: el fallback SIN JavaScript de los formularios (patrón POST-Redirect-GET), que es el camino que
nadie prueba en el navegador porque el JS lo tapa; y si la cabecera solo se añade fuera de producción,
el 500 aparece **únicamente en staging**, o sea justo donde se verifica todo. **Fix**: `try { set() } catch
{ reconstruir la Response con unas `Headers` nuevas }` — la reconstrucción conserva `status`, `statusText`
y `body`. **Anti-patrón**: quitar la cabecera del middleware «porque rompe» (pierdes el candado de
noindex) o dejar de usar `Response.redirect` en los endpoints (arregla el síntoma en uno y deja la trampa
puesta para el siguiente). Portátil a cualquier runtime que siga el estándar Fetch (Workers, Deno, Node 18+).

### L-40 — 🚪 «Gateado por el dueño» merece releerse: el gate puede cubrir UNA PARTE del alcance → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-39 — 🕵️ `document.visibilityState:"hidden"` congela el `rAF` → un mapa que NO carga por eso PARECE un bug de librería, con evidencia falsa incluida *(2026-08-20, TODO-30)*

**Disparador**: el `05` decía «mapa real MapLibre… **falta solo la vista en foreground**» y quise saltarme ese "lo confirma Daniel" auditando el mapa yo mismo por la extensión de Chrome. El mapa mostraba el ESQUEMÁTICO y el contenedor nunca recibía `.is-live` ⇒ **concluí, y llegué a DOCUMENTAR, que «el basemap nunca ha pintado»**. **Era FALSO.** La pestaña estaba `hidden` (la ventana de Chrome no al frente, aunque fuese la única): Chrome congela `requestAnimationFrame`, MapLibre **nunca completa la carga del estilo**, y de ahí en cascada: no pide tiles, no emite `sourcedata`, no va a `.is-live`. **El error que capturé —«There is no tile manager with ID 'protomaps'»— era CONSECUENCIA, no causa.** **Lo que delató la trampa**: probar un estilo **sin ninguna fuente** (solo un `background`) — tampoco cargaba, así que el problema no podía ser pmtiles ni el estilo; y `document.visibilityState` lo confirmó en una línea. **🚫 Callejones (probados y revertidos)**: pmtiles→4.5.0 · maplibre→6.4.1 · maplibre→**5.24.0** · `Protocol().tilev4`. Que el MISMO error saliera en v5 y en v6 fue la primera señal de que la librería no era la culpable — la ignoré una vez. **Reglas**: (1) antes de culpar a una librería, **comprueba `document.visibilityState`/`document.hidden`** en cualquier auditoría de canvas/WebGL/animación automatizada; (2) **bisecciona hacia abajo hasta el caso mínimo** (estilo sin fuentes) antes de tocar dependencias — habría ahorrado 4 intentos; (3) si el mismo síntoma sobrevive a dos versiones mayores distintas, **la hipótesis es errónea**, no la versión; (4) 🎯 **cuando el cerebro dice "esto lo confirma el dueño", hay una razón**: saltárselo produjo un diagnóstico falso con evidencia que PARECÍA sólida. TODO-30 sigue necesitando la mirada de Daniel con la ventana al frente. **Lo que SÍ queda**: el fallback ya no es mudo (§L-39b abajo).

**L-39b · el fallback silencioso**: `map.on('error')` estaba VACÍO a propósito («degradación silenciosa»). Sin él, el diagnóstico anterior habría sido imposible: **un fallback sin telemetría no degrada, OCULTA**. Corregido — grita en DEV, calla en PROD — + sonda `__altorraMap` (solo DEV). Esta parte es válida y quedó en `caza-bugs §4b`.

### L-36 — 🧩 Rellenar un `<template>` clonado: el placeholder VACÍO no crea nodo de texto, y una excepción a mitad deja la UI VIEJA en pantalla — coherente por fuera, mentirosa por dentro *(SERP §59)*
**Disparador**: patrón "markup con un dueño" (renderizar el componente dentro de un `<template>` y clonarlo en JS para pintar datos dinámicos) — bueno contra la divergencia (L-29), pero con dos trampas. **(1) El molde no tiene lo que no renderizaste**: un prop `price=""` NO emite nodo de texto ⇒ código tipo "busca el nodo de texto y reemplázalo" cae a la rama de inserción; y si ANTES eliminaste el nodo que usas como referencia (`insertBefore(nuevo, sufijoYaEliminado)`) → **`NotFoundError`**. **Fix**: reconstruir el subárbol de forma DETERMINISTA (limpiar nodos de texto, insertar, y ELIMINAR opcionales AL FINAL — nunca usar como referencia algo ya removido); `insertBefore(nodo, null)` = append, así que un opcional ausente no rompe. **(2) 🎯 El fallo parcial es el peligroso**: la excepción ocurrió DESPUÉS de actualizar el contador y quitar "Cargar más", pero ANTES de reemplazar las cards ⇒ la página quedó mostrando **4 cards de DEMO bajo un titular de "3 propiedades"**: sin error visible, sin caja rota, y con datos VIEJOS presentados como nuevos. Ningún gate lo caza (build/tsc/tests pasan; el screenshot "se ve bien"). **Reglas**: (a) en un render por lotes, `try/catch` POR ÍTEM — uno malo no puede tumbar el conjunto; (b) si NADA se pudo construir, mostrar estado de error EXPLÍCITO en vez de dejar lo anterior; (c) ordenar las mutaciones para que el estado visible cambie AL FINAL (o todo o nada); (d) verificar el camino vivo con datos reales y **contar** (3 ítems → 3 cards), no mirar si "se ve bien" (L-29).

### L-35 — 🏁 Un rebuild IDEMPOTENTE no basta: dos ejecuciones concurrentes leen snapshots DISTINTOS y la vieja puede aterrizar de última *(catálogo §58; portable a todo derivado/materialized view)*
**Disparador**: cualquier proceso que reconstruye un agregado (índice, contador, vista materializada, caché denormalizada) desde el estado vivo y lo escribe completo — disparado por eventos (`onWrite`) que pueden solaparse. **Trampa**: "el rebuild es idempotente/determinista, así que las carreras no importan" es **FALSO**. Idempotente = mismo INPUT → mismo output. Pero dos rebuilds concurrentes NO comparten input: A lee el estado en T1, B lee en T2>T1; si A es lento y escribe DESPUÉS de B, el agregado queda con datos VIEJOS y **nada lo delata** (la escritura fue "exitosa", el `_version` subió). Una transacción tampoco lo cubre: protege la atomicidad del doc, no la frescura del snapshot que traes de fuera. **Fix**: sellar cada rebuild con el timestamp de SU snapshot y, dentro de la transacción, **NO escribir si el doc ya tiene un sello MÁS NUEVO** (guarda anti-adelantamiento; el resultado se reporta como "omitido: adelantado", no como éxito silencioso). ISO-8601 UTC compara lexicográfico = cronológico, así que basta un `>`. **Regla hermana**: la query pesada va FUERA de la transacción (leer miles de docs dentro es inviable) — por eso mismo aparece la ventana de carrera que la guarda cierra. **Verificarlo así**: sembrar el doc con un sello FUTURO y comprobar que el rebuild NO lo pisa (test determinista, sin depender de temporización real).

### L-34 — 🧊 Cloudflare Workers Static Assets IGNORA el header `Range` (200 + archivo entero) — mata pmtiles y todo lo que lea por rangos; y `astro dev` SÍ honra Range → **paridad dev↔prod FALSA** *(TODO-30, ADR §55.9, cazado en PROD por Daniel)*
**Disparador**: un `.pmtiles` (o cualquier binario que se lea por HTTP-range: pmtiles, algunos video/PDF viewers) servido como **asset estático** en Cloudflare Workers funciona en `astro dev` pero **NO en staging/prod** — el mapa queda en su fallback, sin error visible. **Causa**: **Cloudflare Static Assets NO soporta range-requests**: un `GET Range: bytes=0-99` devuelve **200 + el archivo COMPLETO** (no 206 + 100 bytes). pmtiles.js pide pedacitos (header→directorio→tiles) y con el archivo entero cada vez, falla/no carga. `astro dev` (workerd+vite) SÍ devuelve 206 → **el bug es INVISIBLE en dev** (paridad dev↔prod rota — como L-14/L-18, verificar en la infra REAL). **Fix**: servir el binario por una **ruta Worker** que lea el asset por el binding `ASSETS` (`env.ASSETS.fetch`) y **troceé el rango** (206 + `Content-Range`), o desde **R2** (`bucket.get({range})` sí honra Range nativo). Cache module-scope del buffer = OK si es inmutable. **Verificación sin poder renderizar**: leer el archivo con la MISMA librería (pmtiles.js: `getHeader()`+`getZxy()`) apuntada a PROD prueba servicio+rangos+archivo end-to-end. **Portátil** a cars/bersaglio y a cualquier binario range-served en CF.

### L-33 — 🗺️ Astro v6+/@astrojs/cloudflare v14: `Astro.locals.runtime.env` fue REMOVIDO → `import { env } from 'cloudflare:workers'`; y maplibre-gl v6 = named exports (sin default) *(TODO-30, ADR §55, cazado EN VIVO)*
**Disparador**: una ruta SSR que lee un binding (R2/KV) desde `locals.runtime.env.X` devuelve **500** en runtime (no lo cazan build/tsc/tests — el getter existe pero LANZA). El stack lo dice literal: *"Astro.locals.runtime.env has been removed in Astro v6. Use 'import { env } from \"cloudflare:workers\"' instead."* **Causa**: en @astrojs/cloudflare v14 (Astro 7) los bindings ya NO viven en `locals.runtime.env`; la vía vigente es el **módulo virtual workerd** `cloudflare:workers` (`import { env } from 'cloudflare:workers'` → `env.R2_MEDIA`), externalizado por el CF vite plugin (funciona en `astro dev` y build). **Fix**: importar `env` de `cloudflare:workers`; los tipos salen de `worker-configuration.d.ts` (`npm run cf-types` = `wrangler types`; gitignored por convención). **Gotcha hermano del mismo montaje**: **maplibre-gl v6 dejó de exportar `default`** → `import maplibregl from 'maplibre-gl'` rompe el build (`"default" is not exported`); usar named: `import { Map, Marker, LngLatBounds, addProtocol } from 'maplibre-gl'`. **Regla (pariente de L-14/L-19)**: en este stack que corre rápido, el acceso a bindings y los imports de libs se VERIFICAN contra el stack real (leer el stack del 500, `grep` los exports del `.mjs`), no de memoria; y el reflejo caza-bugs sobre el CAMINO VIVO (fetch a la ruta) cazó el 500 que 4 gates verdes (build/check/verify/tests) no vieron.

### L-32 — 🪤 En Ads Manager multi-marca, los DEFAULTS traen la marca hermana: verificar página/número/identidad ANTES de seguir *(montaje HUMO, ADR §42, 2026-07-18)*
**Disparador**: al crear el conjunto CTWA, Meta preseleccionó la página **"Altorra Cars Usados"** y su WhatsApp (+57 333 2666647) — el usuario personal de Daniel administra ambas marcas y Ads Manager defaultea a "una página tuya", no a la del negocio dueño de la cuenta. Publicar así habría pauteado inmobiliaria hacia el chat de CARS. **Regla**: en CADA campaña nueva, verificar EXPLÍCITAMENTE página + número + identidad IG contra `activos-meta.md` antes del Siguiente; el número correcto salta SOLO al corregir la página. Bonus del mismo montaje: los radio-clicks de Meta a veces NO registran (verificar con zoom antes de avanzar) y el listbox de edad ignora scroll/teclado sintético (escalera: clic a lo visible → reabrir).

### L-31 — 🎯 El proceso creativo es un EMBUDO, no una skill; y la 1ª pasada "correcta" puede violar la voz *(mandato Daniel + pieza de humo, 2026-07-18)*
**Disparador**: la 1ª pieza de captación salió técnicamente bien pero (a) creé usando solo Brief+voz, sin barrer el backlog TikTok ni la Ads Library (Daniel tuvo que recordármelos: "el proceso debe ser pro, no 1 skill"), y (b) el copy trató de TÚ a un PROPIETARIO cuando el catálogo §3.1 exige USTED (ancla: "Usted descansa, nosotros nos encargamos") y sonó "robot" (comprimido sin calidez). **Reglas**: (1) toda pieza que va a DINERO pasa el **embudo de `pauta-captacion §0b`** (grounding sweep completo → ≥3 candidatos → filtro de voz → comité ×3 lentes → Daniel → métricas→iteración); (2) el REGISTRO se verifica ANTES de escribir (propietario=usted, lead comprador=tú); (3) cumplir reglas duras ≠ tener el alma: el filtro incluye la cadencia gold y leer la pieza EN VOZ ALTA; (4) receta visual sellada: la IA genera solo el FONDO (sin texto); tipografía/logo van por HTML+Playwright.

### L-30 — ⏳ Las features del SERP MUEREN: toda regla de SEO/rich-results lleva FECHA + FUENTE PRIMARIA y se re-verifica antes de portarse *(ADR §33; verificado en prod bersaglio 2026-07-17)*
**Disparador**: al portar aprendizajes SEO a las skills se verificó que `FAQPage` **ya no produce rich result** (deprecación TOTAL 2026-05-07, doc oficial de Google; GSC eliminó el informe FAQ) — y nuestras skills + medio internet + el material de entrenamiento pre-2026 seguían vendiendo "añade FAQPage para ganar el acordeón". El mismo corte cazó 2 doctrinas INVERTIDAS en el borrador previo (Offer-sin-price "válido" era FALSO — GSC: 17/17 inválidos; keyword en el nombre del GBP "pesa" era un consejo de SUSPENSIÓN). **Reglas**: (1) una recomendación de posicionamiento es un HECHO CADUCABLE → en skills/documentos va con **fecha de verificación + fuente primaria** (doc de Google > blogs > "siempre se hizo así"); (2) al portar conocimiento SEO entre proyectos, **re-verificar contra la doc oficial HOY**, no copiar; (3) respetar la leyenda de fiabilidad del origen (✅ verificado / ⚠️ corrige / 🚫 peligro / ❓ hipótesis): **lo no medido se porta como HIPÓTESIS, jamás como regla** — una skill que afirma de más es la fuente de verdad de todos los sitios futuros; (4) pariente de L-29: contar contra la fuente aplica también a las FUENTES (el borrador del 07-10 afirmaba cosas que producción desmintió el 07-17).

### L-29 — 🕵️ El contenido INVENTADO se ve BIEN: solo lo caza CONTAR contra la fuente, con un auditor adversarial *(ADR §32.24; el mismo fallo de método de §24-29, ahora en MI trabajo)*
**Disparador**: tras reconstruir 5 páginas "fieles a los mockups" y verificarlas (build + paleta + computed styles + **screenshot en Chrome**), declaré fidelidad lograda. Una re-auditoría adversarial (6 auditores + refutador `effort:high`, contra los `.dc.html`) devolvió **5 DIVERGENTES · 48 hallazgos**, y **3 de los 6 ALTA los había introducido YO mientras "corregía infidelidades"** — incluida una **cifra de rentabilidad "+18%" fabricada** en la web de una inmobiliaria real. **Causa**: **5 secciones tenían contenido inventado** (propiedades demo, zonas, amenities, tarjetas, una cifra) y **ninguna se veía rota — se veía BIEN**: relleno plausible donde el diseño no decía nada. **Ninguna capa de verificación técnica lo detecta**, ni siquiera el ojo: el build compila, la paleta cumple, los estilos aplican, y el screenshot muestra algo coherente. El screenshot ve *lo que el usuario ve*, pero **NO ve lo que el usuario no puede saber que falta o sobra**. **La única prueba** para "¿esto lo dijo el diseño, o me lo inventé?" es el **diff contra la fuente**, y para que sea fiable, hecho por un **agente ADVERSARIAL** apuntado al propio trabajo (uno mismo, recién salido de construirlo, está sesgado a confirmarlo). **Reglas**: (1) al reconstruir desde una fuente (mockup/spec/doc), la fidelidad NO se declara con chequeos internos — se declara con un **diff sección-por-sección, contando contra la fuente**; (2) **inventar > omitir en gravedad**: una omisión se nota como hueco; una invención se disfraza de contenido legítimo y puede ser un claim falso (cifra, dato, promesa) → riesgo legal/comercial, no cosmético; (3) **el que construye no es el que audita**: dispara un verificador adversarial (`comite-expertos`/workflow) ANTES de decir "listo"; (4) generaliza §24-29 y L-24: aquella auditoría revisó COLOR, esta reveló que ni "estructura + ojo" basta — falta **procedencia del contenido**.

### L-28 — 🎭 `getComputedStyle` MIENTE en toda propiedad con `transition` (invierte L-22) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
### L-62 — 🔍 Sonda de semántica que mira el elemento y no su ANCESTRO: 4 de 5 señales falsas (`<template>`, `hidden`, atributo desnudo) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
### L-68 — 🎭 Una override que COMPILA y se SIRVE puede perder en silencio: `@media` NO aporta especificidad → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
### L-69 — 🎭 Retirar un dato de UNA pantalla y dejarlo en otra es ESCONDERLO; el comentario que certifica la retirada lo vuelve invisible → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**
### L-63 — 💸 Dos validadores CORRECTOS del mismo campo y ninguno comprueba que hablen de la misma UNIDAD (un contrato del 10 % no se podía liquidar) → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-64 — 🪤 Un gate NUEVO se queda en verde de TRES formas (contar el marcador · medir por cercanía · leer una alternativa como si fueran dos) → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-65 — 🌗 Un gate con **exención de entorno** da un verde que nadie ha visto fallar JAMÁS (el RNT «bloqueaba el build» mientras el build pasaba a diario) → 🧩 **shard `38-GATES-QUE-MIENTEN.md`**
### L-26 — 🖥️ Panel integrado = renderer CONGELADO (rAF 0 frames) · juicio visual SIEMPRE por Chrome → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá, incl. corrección capital + variante resize)
### L-24 — Verificar un build contra el MOCKUP por ESTRUCTURA (checklist de secciones), no solo por color *(Ola 1, ADR §32; el dueño cazó lo que la verificación no)*
**Disparador**: las páginas §24-§29 se dieron por "completas" verificando 0 off-palette + 0 errores; pero DIFERÍAN mucho del `.dc.html` (secciones enteras faltantes, layouts distintos, interactividad perdida). Daniel lo notó, no el cerebro. **Causa**: "verificado en vivo" = colores correctos, NO = fiel al diseño aprobado; el mockup (SSoT visual) nunca se usó como checklist de completitud. **Regla**: al construir desde un mockup, extraer la lista ORDENADA de secciones del mockup y confirmar 1:1 en el build (secciones + layout + interactividad), ADEMÁS del barrido de color (L-22). El workflow `auditoria-fidelidad-mockups` (diff build↔mockup) lo automatiza. Aplica a toda página mockup-backed.

### L-23 — `astro-icon` es INCOMPATIBLE con el runtime Cloudflare Workers (dev): "module is not defined" *(Ola 1 header, ADR §32)*
**Disparador**: añadí `astro-icon` + `@iconify-json/*` para íconos pro; el dev server (miniflare/workerd) tiró `module is not defined` (la integración usa CJS/virtual-module que workerd no soporta). **Fix**: NO usar la integración. Extraer los paths oficiales del set iconify una vez (`require('@iconify-json/lucide/icons.json').icons[name].body`) y embeberlos inline como `<svg viewBox="0 0 24 24" set:html={body}>`. Lucide trae `stroke="currentColor"`, Simple Icons `fill="currentColor"` en el body → heredan la paleta. Mismo arte, sin dependencia de build/runtime. Desinstalar los 3 paquetes tras extraer.

### L-22 — 🖥️ Verificar UI por computed styles vs captura (el panel desincroniza/timeout el screenshot) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)
---

### L-45 — 🔀 Dos escritores, una colección, dos modelos: el `as T` a ciegas convierte «datos viejos» en «catálogo vacío sin errores» *(2026-08-21, ADR §103)*
**Disparador**: un sistema que se está reemplazando y el nuevo comparten el MISMO almacén (aquí, la
colección `propiedades`), y el viejo sigue siendo el único que sabe escribir. **Causa**: en una base sin
esquema, el lector nuevo hace `doc.data() as Propiedad` — un cast que el compilador acepta y que NO
comprueba nada. El documento viejo entra, **pasa los filtros** (el `estado` sí coincidía) y solo revienta
al leer un campo que en su modelo vive en otro sitio. **Síntoma**: índice vacío, listado sin resultados,
cero excepciones, cero logs de error. **Y el agravante**: la omisión se atribuye al primer campo que dé
nulo — aquí «sin precio», cuando el precio SÍ estaba, solo que como entero en vez de objeto; un
diagnóstico que manda a mirar donde no es. **Reglas**: (a) donde dos escritores comparten un almacén, el
lector VALIDA la forma en la frontera y no se fía del cast; (b) el desajuste de esquema es un motivo
PROPIO, nunca se mete en el cubo de un síntoma existente — el motivo es el diagnóstico; (c) detéctalo por
lo que el modelo cierra (enumeraciones, tipo de un campo), no por heurísticas; (d) el conteo de descartes
se guarda **por motivo**, no como total: «5 omitidas» no responde ninguna pregunta; (e) aplica el mismo
guardián a TODOS los lectores del almacén — aquí el índice filtraba, pero la ficha por id se lo saltaba.

## Guardarraíles de diseño (vinculantes)
- **Carga de propiedades**: SIEMPRE `limit(9)` paginado, NUNCA todo el catálogo (free-tier).
- **Caché frontend 3 capas**: Memory + IndexedDB + localStorage (reducir lecturas Firestore); TTL 5 min CRÍTICO.
- **Deploy de reglas es MANUAL** (`firebase deploy --only firestore:rules`) — NO automático.
- **Formularios** → Firestore `solicitudes` + Cloud Function email. ⚰️ El gap J2 (FormSubmit residual) era del sitio viejo RETIRADO (§15 obsoletó TODO-01..08) → `_legacy/LECCIONES-SITIO-VIEJO.md`.

---

### L-38 — 🖼️ `srcset` puede EMPEORAR el peso cuando la MISMA foto sirve a huecos de tamaños dispares *(2026-08-20, portal)*

**Disparador**: la pizarra pedía «optimizar imágenes del portal a WebP <150KB». Al medir, el diagnóstico era viejo: **ya eran WebP** (10 archivos, 1.4 MB) y no había JPG. Se montó `srcset` en 66 huecos con variantes 480/800/1200w… y **el peso SUBIÓ**: desktop **+63%**, móvil **+21%**. **Causa**: el portal usa **7 fotos demo reutilizadas en 66 huecos** de tamaños muy distintos (un hero de 1265px y una card de 300px comparten archivo) ⇒ el navegador baja **2-3 variantes del MISMO archivo** en vez de una sola, y la fragmentación cuesta más que lo que ahorra el tamaño. **Reglas**: (1) `srcset` gana cuando cada imagen se usa en **1-2 tamaños** (catálogo real, 1 foto por ficha) — con imágenes compartidas hay que MEDIR antes/después y estar dispuesto a NO aplicarlo; (2) lo que gana **siempre y sin fragmentación** son los **logos/íconos** pintados siempre pequeños (el emblema de 248px que se pinta a 30px bajó 33 KB → 8 KB, −76%, en todas las páginas); (3) **recomprimir un WebP ya lossy no da nada** (a ~40 dB PSNR el peso queda igual) y **AVIF desde un WebP lossy pesa MÁS** (518 KB vs 438 KB): la ganancia de formato exige el ORIGINAL sin pérdidas, que no está en el repo; (4) 🎯 **la trampa de medición**: forzar `loading="eager"` para "ver todo cargado" hace que los slides ocultos de un carrusel elijan variantes con anchos equivocados — dio un falso **−78%**. Mide con el layout REAL o calcula la elección de forma determinista (`ancho_css × dpr` → primer candidato ≥ ese valor). Se revirtió todo salvo el emblema; el helper `portal/src/lib/img.ts` conserva el hallazgo y las condiciones para reactivarlo en el cutover.

### M-01 — El tablero `05` se rezaga cuando la realidad avanza si el CIERRE no lo re-fresca en el mismo commit
### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación debe ser AUTOMÁTICA, no prometida
### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales POR-OPERADOR: el gate debe vivir EN EL RECURSO
### M-04 — Un ID lo asigna quien escribe, y dos frentes escribiendo en paralelo colisionan en silencio
### M-05 — Un techo que se mueve para alcanzarlo no es un techo
### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, las tres dan ✅
### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado (el 4º repo no tenía pre-commit)
### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega
### M-09 — El always-on se ganó por importancia y nunca se perdió por desuso: el criterio es frecuencia × costo de omisión
### M-11 — Escribir la lección NO la aplica: si el PENDIENTE no se re-etiqueta, el cerebro la ignora otra vez
### M-23 — Un paso de procedimiento que nadie ha ejecutado no es documentación: es una HIPÓTESIS, y se comprueba el peor día *(auditoría #10, §140 · §145)*
### M-10 — Un gate cubre UNA DIRECCIÓN; la doctrina promete las DOS — y el ✅ se lee como cobertura total
### M-24 — Una lección CORRECTA archivada bajo el disparador equivocado no dispara: se redacta por su condición mínima detectable, no por la escena en que se descubrió *(§160)*
### M-25 — Una regla ESCRITA da la sensación de estar APLICADA: si nadie la vigila, es una nota, no una regla — y cuanto mejor escrita, más engaña *(4× el 26-ago: §162, §163, §172, §173)*
### M-26 — Un nodo que se consulta CUANDO ALGO FALLA no puede evitar el fallo: la lección estaba bien escrita y en su sitio, pero el router solo llevaba a ella DESPUÉS *(§174)*
### M-27 — Una sonda ad-hoc debe imprimir su COBERTURA, no solo su resultado: «no encontré nada» es indistinguible de «no miré en ningún sitio» *(§202)*
### M-28 — Un remedio colocado DESPUÉS del punto de no retorno no protege de nada, y encima tranquiliza: si vuelves a caer teniendo la lección delante, el defecto es de su REDACCIÓN *(§216.8 · detalle en `33`)*
### M-29 — Un gate que infiere una CAUSA de una CORRELACIÓN debe escribir su premisa al lado: caduca cuando cambias de COSTUMBRES, no de código, y entonces no hay diff que la delate *(§216.9 · detalle en `33`)*
### M-30 — Identificador INVENTADO ×4 en una noche (constante, helper, enum de una regla de seguridad, estado): escribir de memoria en vez de leer → 🧩 **shard `33-LECCIONES-META.md`**
### M-31 — 🎯 Un hallazgo que escribí YO apuntaba al nodo que acababa de TOCAR, no al que peor estaba: un remedio sin denominador es una corazonada con formato de tabla → 🧩 **shard `33-LECCIONES-META.md`**
### M-32 — ⚙️ Un hecho que ya BLOQUEA un gate no pertenece a un nodo always-on: se paga en cada arranque y la copia es la que envejece · y **aplica la regla, no la narres** → 🧩 **shard `33-LECCIONES-META.md`**

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> 🧩 **Mudadas a `60-WORKFLOWS §Gobernanza`** el 2026-07-28 (ADR §68): hablan de CÓMO se conduce la
> maquinaria (Chrome live · comité/workflow acotado · asesor externo), que es el dominio de `60`, no una lección de bug. Vinculantes igual.

### 🧰 Utillaje → `docs/36-LECCIONES-UTILLAJE.md`
Las lecciones donde miente la HERRAMIENTA y no el código (shell, intérprete, `grep`, CI, orquestador,
mockups) viven en su hoja. Aquí queda su TÍTULO —igual que con las `M-` de `33`— para que `30` siga
siendo el índice de todas y una cita `[[L-NN]]` resuelva sin salir de aquí (§125).

### L-25 — En `pipeline()` de Workflow las etapas ≥2 reciben `(prevResult, originalItem, index)`: NO captures el ítem por closure *(ADR §32.9, auditoría de fidelidad de la home)*
### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar: el mockup se trae por MCP, no por URL *(2026-08-19, ADR §89)*
### L-46 — El shell (y el lenguaje que lo llama) SE COMEN texto y nada falla: comillas simples o por ARCHIVO
### L-66 — 🪤 Dos herramientas con el MISMO nombre no miden ni apuntan a lo mismo: `/tmp` cambia de sitio · y una fila de 260c es 261 para el gate, que lee con CRLF → 🧩 **shard `36-LECCIONES-UTILLAJE.md`**
### M-33 — 🎭 Un hallazgo abierto que invoca una regla del cerebro **sin abrir el gate que la ejecuta** es una opinión — 3 de 13 eran FALSOS → 🧩 **shard `37-META-FUNDACIONALES.md`**
### L-67 — 🎭 Bumpear una constante que **no lee nadie** (el `CACHE_NAME` del SW), y anotarlo como protección → 🧩 **shard `36-LECCIONES-UTILLAJE.md`**
### L-47 — 🐍 `open(p,'w').write(open(p).read()+X)` **borra el archivo**: el truncado ocurre antes de la lectura *(§118)*
### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
### L-50 — Astro: `:global()` dentro de un `<style is:global>` NO se resuelve — sale literal y el navegador DESCARTA la regla entera, en silencio *(§130)*
### L-51 — Un «Deploy complete!» puede no desplegar NADA: si la CLI no nombra el archivo, no hubo archivo *(§134)*
### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre**: `tsc` no lee los `.astro`, y un `var(--x)` inexistente se descarta sin avisar *(§138)*
### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE: escribirlo es la mitad, cablearlo es la otra *(§142)*
### L-57 — 🎭 Una herramienta sin su prerrequisito puede **PREGUNTAR en vez de fallar**, y sin terminal eso sale **exit 0**: el gate afirma haber pasado sin mirar nada *(§175)*
### L-58 — 🎭 Un gate puede imprimir un número CIERTO de una comparación que no significa nada: un porcentaje sin su denominador auditado es decoración *(§193)*
### L-59 — 📋 Enumera los pares «declarado ↔ desplegado» y compáralos uno a uno: lo que no se puede LEER no es un par verificable, es un sello *(§198)*
### L-60 — 🔀 Antes de desplegar un trigger, mira quién MÁS escucha ese evento: dos escritores del mismo campo no fallan, discrepan a veces *(§199)*
### L-61 — 🔐 Comprobar que las REGLAS están desplegadas, desde fuera y sin credenciales → 🧩 **shard `39-ESCRITO-NO-ES-VIGENTE.md`**