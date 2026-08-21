# 🧪 30 — LECCIONES (Memoria Procedimental · Altorra Inmobiliaria)

> Trigger de Experiencia (§G.2): ANTES de una op riesgosa/repetitiva o si un síntoma "te suena". Gotchas + recetas.
> Formato `### L-NN — <título>` (disparador + causa + fix). Varias son **heredadas de Altorra Cars** (mismo patrón
> arquitectónico) — destiladas de `_legacy/AVANCES.md §"ERRORES CONOCIDOS"`.
> 🧩 **Hojas hijas**: `31-VERIFICACION-UI.md` — L-22/L-26/L-28 COMPLETAS (verificación de UI: panel congelado ·
> Chrome · computed vs transition) · `32-LECCIONES-DOCUMENTALES.md` — rama **legal/documental** (`LD-NN`:
> contratos, manual, formatos, auditorías de entregables).
> ⚠️ **Aquí solo va lo TÉCNICO.** Las viejas `L-31..L-34` "del kit" se mudaron a `32` como **LD-01..LD-04**
> el 2026-07-28 porque **colisionaban** con las L-31..L-34 de esta hoja (ADR §68 · [[M-04]]). Un ADR anterior
> que diga "L-33" hablando del kit se refiere a **LD-03**.

---

## Lecciones (L-NN)

### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-02 — RTDB `permission_denied` en presencia → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-03 — Firestore "Failed to obtain primary lease" → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-04 — ⚗️ FUSIONADA en L-09 (merge:true vs rules/upsert) — regla viva **aquí, en L-09**: `set()` SIN merge para CREAR, `update()` para EDITAR (el puntero apuntaba a `CLAUDE.md §3.5`, que se mudó a `34-DOCTRINA-CODIGO` en la poda §84; el dueño del hecho siempre fue L-09) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-05 — ⚰️ (sitio viejo retirado §15) Modals inyectados fuera de index → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-06 — ⚰️ (sitio viejo retirado §15) Invalidación de cache `system/meta`→onSnapshot → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` (resucitar si el cutover reusa SW/onSnapshot) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-15 — Windows: `wrangler dev` deja un `workerd.exe` huérfano que bloquea `dist/` (`EPERM` en el siguiente build) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-16 — Primer deploy a Cloudflare Workers: registrar el subdominio `workers.dev` ANTES (falla en CI no-interactivo) → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-17 — Decodificar el REST de Firestore: mapas/arrays VACÍOS y despacho por clave → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-18 — Cloudflare: DOS cachés distintas; en `workers.dev` solo sirve **Workers Caching** → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-19 — `@astrojs/cloudflare` v14: `locals.runtime` deprecado/sin tipo; `platformProxy` removido → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-20 — Firestore Rules: un `get` de doc INEXISTENTE con `resource.data` en la regla → 403, no 404 → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)
### L-21 — Aislar tests que comparten un emulador Firestore: projectId PROPIO por archivo → 🧩 **shard `35-LECCIONES-PLATAFORMA.md`** (completa allá)

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

### L-42 — 🚧 Una defensa que solo vive en las Security Rules NO EXISTE hasta que las Rules se despliegan *(2026-08-21, ADR §97.6)*
**Disparador**: el código confía en que la base filtrará («las reglas ya no dejan leer los borradores»),
y las reglas que hacen eso están en el repo, no en producción. **Caso**: la ficha de inmueble no
comprobaba el estado de publicación porque `firestore.rules` tiene `allow get: if resource.data.estado in
[...]`. Pero ese archivo NO estaba desplegado —el ruleset vivo era el del sitio viejo, con `allow read: if
true`— así que un BORRADOR se habría publicado entero, con precio, contacto e indexable. **La distancia
entre `git` y el proyecto de Firebase no la cubre nadie**: no hay gate que compare el ruleset del repo con
el vivo, y el comentario del código describía una frontera que en producción no estaba puesta.
**Reglas**: (1) el invariante que protege un dato se implementa en el CÓDIGO aunque también esté en las
Rules — defensa en profundidad, no delegación; (2) usa la MISMA lista que ya use otro camino (aquí, la
whitelist de estados con la que se construye el índice del catálogo) para que no puedan discrepar;
(3) desconfía de todo comentario que diga «las reglas ya lo impiden» sin decir **desplegadas desde cuándo**.
Portátil a cualquier backend con reglas declarativas (Firebase, Supabase RLS, políticas de S3).

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

### L-40 — 🚪 «Gateado por el dueño» merece releerse: el gate puede estar en UNA PARTE del alcance, no en todo *(2026-08-21, ADR §94)*
**Disparador**: un ítem lleva meses etiquetado como bloqueado por un dato que solo tiene el dueño, y nadie
lo vuelve a abrir. **Caso**: el Rango ALTORRA figuraba como «necesita los rangos de 10 barrios de Daniel».
Al releer su definición decía **contacto-primero**: el visitante deja sus datos y un asesor devuelve el
número. Sin cifra en pantalla, los rangos **no eran prerrequisito** — la página se construyó entera esa
misma noche, y encima es captación de propietarios, que era la necesidad más urgente del negocio.
**Regla**: antes de aceptar una etiqueta de bloqueo heredada, relee la definición del ítem y pregunta *qué
parte exacta* toca el gate. Un gate sobre el 20% del alcance congela el 100% solo si nadie lo mira.
**Corolario**: al ESCRIBIR un pendiente bloqueado, anota qué queda hacible sin el gate — se lo estás
diciendo a alguien que no podrá preguntarte.

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

### L-27 — Un `grep` te da la HOJA, no la RAMA: nunca asumas la forma del dato sin leer el padre *(ADR §32.14; §3.3 incumplida por mí mismo)*
**Disparador**: necesitaba el WhatsApp oficial. `grep -n "whatsapp" site.ts` devolvió `19: whatsapp: '+57 300 243 9810'` / `20: whatsappLink: 'https://wa.me/...'`. Escribí `SITE.contacto.whatsappLink` → **página caída**: `Cannot read properties of undefined (reading 'whatsappLink')`. La clave real es **`contact`** (en inglés); mi `contacto` (español) no existe. **Causa**: el grep muestra la línea que coincide, **NO su ANIDAMIENTO**. Vi las hojas (`whatsappLink`) y ALUCINÉ la rama (`contacto`) por inercia del idioma del repo — que mezcla español (dominio) con inglés (código). **Fix**: `Read` del archivo (12 líneas) antes de usar la ruta. **Reglas**: (1) para **leer un valor**, grep basta; para **escribir una ruta de acceso** (`a.b.c`), LEE la estructura — el grep no muestra el padre; (2) sospecha de tu propia inercia lingüística en repos bilingües (`contact`/`contacto`, `date`/`fecha`); (3) 🎯 **quién cazó el bug importa**: NO fue el barrido de paleta ni los computed styles — fue el **build**. Cada capa ve un fallo distinto y ninguna sustituye a las otras: build (existe/compila) → estructura (está) → computed styles (se aplica) → comportamiento (funciona). Ordénalas así; la primera es la más barata.

### L-26 — 🖥️ Panel integrado = renderer CONGELADO (rAF 0 frames) · juicio visual SIEMPRE por Chrome → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá, incl. corrección capital + variante resize)

### L-25 — En `pipeline()` de Workflow las etapas ≥2 reciben `(prevResult, originalItem, index)`: NO captures el ítem por closure *(ADR §32.9, auditoría de fidelidad de la home)*
**Disparador**: workflow de 14 secciones; la 2ª etapa (verificador adversarial) usaba `s.desde`/`s.hasta` (el ítem original) dentro del prompt → `s is not defined`. Tumbó 4 de 14… y **no 4 cualesquiera**: justo los NO-AUSENTE, los del veredicto caro. Los AUSENTE sobrevivieron porque su rama hace `return` ANTES de tocar `s`. **Causa**: en `pipeline(items, stage1, stage2)` el callback de stage1 es `(item)=>…` pero el de stage2 es **`(prevResult, originalItem, index)=>…`**; escribí `(spec)=>{…}` y usé la `s` del `map`, que no existe en ese scope. **Fix**: firmar `(spec, s)=>{…}`. **Recuperación BARATA**: `Workflow({scriptPath, resumeFromRunId})` → los agentes con `(prompt, opts)` sin cambios replayan desde caché; solo corrieron en vivo los 4 verificadores (no se re-pagaron los 14 specs). **Reglas portátiles**: (1) en etapas ≥2 tomar el ítem del **2º parámetro**, nunca del closure; (2) **leer SIEMPRE el bloque `<failures>`** de la notificación — un workflow dice "completed" aunque haya perdido ítems (aquí: `resumen.devueltas 10/14`, el fallo solo aparecía en `<failures>`); (3) 🎯 **un bug que vive en UNA rama sesga el resultado**: aquí sobrevivió el 100% de lo barato (AUSENTE, early-return) y murió el 100% de lo caro (los que necesitaban verificación). Un "10/14 ✅" habría sido una conclusión falsa y tranquilizadora.

### L-24 — Verificar un build contra el MOCKUP por ESTRUCTURA (checklist de secciones), no solo por color *(Ola 1, ADR §32; el dueño cazó lo que la verificación no)*
**Disparador**: las páginas §24-§29 se dieron por "completas" verificando 0 off-palette + 0 errores; pero DIFERÍAN mucho del `.dc.html` (secciones enteras faltantes, layouts distintos, interactividad perdida). Daniel lo notó, no el cerebro. **Causa**: "verificado en vivo" = colores correctos, NO = fiel al diseño aprobado; el mockup (SSoT visual) nunca se usó como checklist de completitud. **Regla**: al construir desde un mockup, extraer la lista ORDENADA de secciones del mockup y confirmar 1:1 en el build (secciones + layout + interactividad), ADEMÁS del barrido de color (L-22). El workflow `auditoria-fidelidad-mockups` (diff build↔mockup) lo automatiza. Aplica a toda página mockup-backed.

### L-23 — `astro-icon` es INCOMPATIBLE con el runtime Cloudflare Workers (dev): "module is not defined" *(Ola 1 header, ADR §32)*
**Disparador**: añadí `astro-icon` + `@iconify-json/*` para íconos pro; el dev server (miniflare/workerd) tiró `module is not defined` (la integración usa CJS/virtual-module que workerd no soporta). **Fix**: NO usar la integración. Extraer los paths oficiales del set iconify una vez (`require('@iconify-json/lucide/icons.json').icons[name].body`) y embeberlos inline como `<svg viewBox="0 0 24 24" set:html={body}>`. Lucide trae `stroke="currentColor"`, Simple Icons `fill="currentColor"` en el body → heredan la paleta. Mismo arte, sin dependencia de build/runtime. Desinstalar los 3 paquetes tras extraer.

### L-22 — 🖥️ Verificar UI por computed styles vs captura (el panel desincroniza/timeout el screenshot) → 🧩 **shard `31-VERIFICACION-UI.md`** (completa allá)

---

## Guardarraíles de diseño (vinculantes)
- **Carga de propiedades**: SIEMPRE `limit(9)` paginado, NUNCA todo el catálogo (free-tier).
- **Caché frontend 3 capas**: Memory + IndexedDB + localStorage (reducir lecturas Firestore); TTL 5 min CRÍTICO.
- **Deploy de reglas es MANUAL** (`firebase deploy --only firestore:rules`) — NO automático.
- **Formularios** → Firestore `solicitudes` + Cloud Function email. ⚰️ El gap J2 (FormSubmit residual) era del sitio viejo RETIRADO (§15 obsoletó TODO-01..08) → `_legacy/LECCIONES-SITIO-VIEJO.md`.

---


### L-38 — 🖼️ `srcset` puede EMPEORAR el peso cuando la MISMA foto sirve a huecos de tamaños dispares *(2026-08-20, portal)*

**Disparador**: la pizarra pedía «optimizar imágenes del portal a WebP <150KB». Al medir, el diagnóstico era viejo: **ya eran WebP** (10 archivos, 1.4 MB) y no había JPG. Se montó `srcset` en 66 huecos con variantes 480/800/1200w… y **el peso SUBIÓ**: desktop **+63%**, móvil **+21%**. **Causa**: el portal usa **7 fotos demo reutilizadas en 66 huecos** de tamaños muy distintos (un hero de 1265px y una card de 300px comparten archivo) ⇒ el navegador baja **2-3 variantes del MISMO archivo** en vez de una sola, y la fragmentación cuesta más que lo que ahorra el tamaño. **Reglas**: (1) `srcset` gana cuando cada imagen se usa en **1-2 tamaños** (catálogo real, 1 foto por ficha) — con imágenes compartidas hay que MEDIR antes/después y estar dispuesto a NO aplicarlo; (2) lo que gana **siempre y sin fragmentación** son los **logos/íconos** pintados siempre pequeños (el emblema de 248px que se pinta a 30px bajó 33 KB → 8 KB, −76%, en todas las páginas); (3) **recomprimir un WebP ya lossy no da nada** (a ~40 dB PSNR el peso queda igual) y **AVIF desde un WebP lossy pesa MÁS** (518 KB vs 438 KB): la ganancia de formato exige el ORIGINAL sin pérdidas, que no está en el repo; (4) 🎯 **la trampa de medición**: forzar `loading="eager"` para "ver todo cargado" hace que los slides ocultos de un carrusel elijan variantes con anchos equivocados — dio un falso **−78%**. Mide con el layout REAL o calcula la elección de forma determinista (`ancho_css × dpr` → primer candidato ≥ ese valor). Se revirtió todo salvo el emblema; el helper `portal/src/lib/img.ts` conserva el hallazgo y las condiciones para reactivarlo en el cutover.

### L-37 — 🎨 Los enlaces de Claude Design CADUCAN al re-guardar: el mockup se trae por MCP, no por URL *(2026-08-19, ADR §89)*

**Disparador**: Daniel comparte el enlace de una pantalla recién diseñada («el enlace caduca en 10 min») y al abrirlo responde **`file not found`** — por `curl` y por navegador con sesión, o sea no es permisos. **Causa**: la URL apunta a un **bundle** (`/serve/.bundles/<uuid>.html`) y Claude Design **genera un uuid nuevo en cada guardado**. El enlace no expira por tiempo: muere en cuanto el diseño se vuelve a guardar, aunque hayan pasado segundos. Perseguir un enlace nuevo es una carrera que se pierde sola. **Receta**: traerlo por el **MCP de Claude Design** (herramienta `DesignSync`), que direcciona por `projectId` y no depende del bundle: 1. `list_files` con el `projectId` (sale de la URL `claude.ai/design/p/<projectId>`) → los paths reales. 2. `get_file` con el path del `.dc.html` → el contenido íntegro. 3. Guardarlo en `portal/design/mockups/ALTORRA <Pantalla>.dc.html`, que es donde viven los demás y donde `20 §Portal` los declara como SSoT visual. **Corolario**: el mockup **se archiva en el repo**, no se consume desde un enlace. Un diseño que solo existe en una URL no es fuente de verdad de nada — la siguiente sesión no lo alcanza.

## §Meta — meta-aprendizajes del propio cerebro
> Se llena cuando el cerebro contribuye a un error — Reflejo de Autocrítica §G.4.

### M-01 — El tablero `05` se rezaga cuando la realidad avanza si el CIERRE no lo re-fresca en el mismo commit → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación debe ser AUTOMÁTICA, no prometida → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales POR-OPERADOR: el gate debe vivir EN EL RECURSO → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-04 — Un ID lo asigna quien escribe, y dos frentes escribiendo en paralelo colisionan en silencio → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-05 — Un techo que se mueve para alcanzarlo no es un techo → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, las tres dan ✅ → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado (el 4º repo no tenía pre-commit) → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-09 — El always-on se ganó por importancia y nunca se perdió por desuso: el criterio es frecuencia × costo de omisión → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-11 — Escribir la lección NO la aplica: si el PENDIENTE no se re-etiqueta, el cerebro la ignora otra vez → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)
### M-10 — Un gate cubre UNA DIRECCIÓN; la doctrina promete las DOS — y el ✅ se lee como cobertura total → 🧩 **shard `33-LECCIONES-META.md`** (completa allá)

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> 🧩 **Mudadas a `60-WORKFLOWS §Gobernanza`** el 2026-07-28 (ADR §68): hablan de CÓMO se conduce la
> maquinaria (Chrome live · comité/workflow acotado · asesor externo), que es el dominio de `60`, no una
> lección de bug. Vinculantes igual.
