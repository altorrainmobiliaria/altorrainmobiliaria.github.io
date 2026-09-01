# 🖥️ 31 — VERIFICACIÓN DE UI EN NAVEGADOR (hoja de `30-LECCIONES` · shard TODO-31d, plan §49)

> **Madre**: `docs/30-LECCIONES.md` — los IDs **L-22 / L-26 / L-28** viven aquí COMPLETOS; en la madre queda su lápida.
> **Trigger**: vas a VERIFICAR UI (screenshot / computed styles / scroll / interacción) en el panel integrado o en Chrome.
> **Destilado (si solo lees esto)**: el panel integrado tiene el renderer CONGELADO (rAF = 0 frames) → sirve para
> computed styles y espía de métodos, JAMÁS para juicio visual ni nada guiado por frames; **el juicio visual va SIEMPRE
> por la extensión de Chrome** (`mcp__claude-in-chrome__*`); y `getComputedStyle` **MIENTE** en toda propiedad con
> `transition` (mata la transición antes de medir). Orden de capas (L-27): build → estructura → computed → ojo.
>
> **⚠️ MATIZ CRÍTICO (2026-07-23, TODO-30/§55.9) — la extensión Chrome AUTOMATIZADA también congela el rAF de JavaScript**:
> la corrección de L-26 ("la extensión RENDERIZA/ANIMA perfecto") es cierta para **animaciones CSS** (corren en el
> compositor, siguen en 2º plano) pero **FALSA para contenido guiado por `requestAnimationFrame` en JS** — mapas WebGL
> (MapLibre), `<canvas>` animado, bucles de tile-loading: cuando la pestaña automatizada está en 2º plano/sin foco,
> Chrome ESTRANGULA el rAF de JS a 0 (probado: un `await` sobre un loop de rAF hace TIMEOUT del CDP; el mapa monta el
> canvas pero NUNCA pide/pinta tiles). ⇒ un mapa WebGL **NO se puede verificar VISUALMENTE** ni en el panel ni en la
> extensión automatizada. **Verifícalo FUNCIONALMENTE**: lee los datos con la MISMA librería apuntada a PROD (p.ej.
> `pmtiles.js` `getHeader()`+`getZxy()` desde staging → prueba archivo+servicio+rangos end-to-end, L-34). El render en
> sí corre en el navegador FOREGROUND del dueño. Distinción clave: CSS-anim = visible en la extensión · JS-rAF = NO.

---

### L-22 — Verificar un diseño/UI entregado por COMPUTED STYLES, no por captura *(Ola 1 · D1, ADR §23)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-22]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-26 — 🖥️ El panel de navegador tiene el RENDERER CONGELADO (`rAF` = 0 frames): NADA guiado por frames se puede verificar ahí *(ADR §32.10; explica y ENGLOBA L-22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-26]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-28 — 🎭 `getComputedStyle` MIENTE en toda propiedad con `transition` (pestaña de fondo ⇒ rAF estrangulado ⇒ el valor se queda en el INICIAL) *(ADR §32.22; INVIERTE la regla de L-22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-28]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

## §Guarda de medibilidad — una comparación de ceros no es una comparación (§119)

Una comprobación por geometría puede APROBAR sin haber comparado nada: si el contenedor está oculto,
todo mide 0, y `[0,0,0] === [0,0,0]` da verde. Pasó midiendo la cola de verificación —el panel había
aterrizado en otra vista— y el veredicto fue «✅ columnas cuadran».

- **Regla**: antes de emitir veredicto, exige que la medida EXISTA.
  `const medible = cabecera.some(x => x > 0) && altos.every(h => h > 0); if (!medible) return '❌ SIN MEDIR';`
- Es el mismo **«✅ inmerecido»** que TODO-45(b) persigue en los gates del cerebro: *un gate con 0
  comparaciones debe DEGRADAR, no aprobar*. Aquí lo cometí a mano una hora después de escribirlo — la
  regla no protege si solo vive en el nodo que la enuncia.
- Corolario: cuando midas una vista del panel, **comprueba primero que su contenedor es visible**
  (`hidden === false` en toda la cadena hasta `body`), no solo que el elemento existe.

### L-62 — 🔍 Una sonda de semántica que mira el ELEMENTO y no su CONTEXTO acierta poco: 4 de 5 señales fueron falsas *(§231)*
**Disparador**: barrido de accesibilidad sobre las 43 páginas construidas. Cinco tipos de señal; **una real** (un `id` duplicado) y **cuatro falsas, todas mías**. **Las cuatro causas son la misma en tres disfraces**: (a) exigí `alt=` y no vi el atributo **DESNUDO** —`<img src alt>` es `alt=""` válido: sintaxis del atributo—; (b) medí el vacío dentro de `<template>`, que no es DOM vivo sino un molde que **rellena el JS**: ancestro; (c) conté `h1` repetidos sin mirar si su contenedor los oculta —`hidden` y `visibility:hidden` **sí** sacan del árbol de accesibilidad; `opacity:0` NO—: ancestro otra vez.
**Reglas**: (1) 🎯 **el significado en el DOM es CONTEXTUAL y un regex sobre texto plano no ve contexto**: antes de reportar, sube por los ancestros (¿`<template>`? ¿oculto? ¿dentro de un comentario?). (2) **Distingue las tres capas de oculto**, que no son equivalentes: `display:none` y `visibility:hidden` y `hidden` ocultan a las ayudas técnicas; `opacity:0` y sacar de pantalla, no. (3) ⚠️ **Sospecha de la sonda antes que del proyecto** cuando varias señales caen en las MISMAS páginas: eso es firma de un elemento compartido o de un defecto tuyo, no de tres bugs independientes ([[L-59]] regla 4). (4) 🎯 **Y aun así el barrido valió**: la señal real —`#contacto` existiendo dos veces en `/turismo`— no la veía ningún gate, y llevaba viva desde que la página existe. *Una sonda con 80 % de falsos que encuentra lo que nadie mira sigue siendo mejor que no mirar — siempre que verifiques ANTES de reportar.*

### L-68 — 🎭 Una override que COMPILA y se SIRVE puede perder en silencio: `@media` NO aporta especificidad *(§264)*
**Disparador**: subir los campos a 16 px en móvil (Safari en iOS amplía al enfocar por debajo de ese umbral y **no lo deshace**). La regla llegaba al CSS servido, bien acotada — y no aplicaba. Dos intentos perdidos.
**Reglas**: (1) 🎯 **`@media` pesa CERO en especificidad**: `@media { .a input {…} }` empata con `.a input {…}`, y entre iguales decide **el orden de aparición**. Astro acota AMBOS lados con el mismo `[data-astro-cid-…]`, así que una override escrita contra un selector hermano SIEMPRE empata — y puesta arriba del bloque, siempre pierde. **Las overrides de página van al FINAL del `<style>`**, con comentario de por qué ese sitio no es casual. (2) ⚠️ **No concluyas «no está» de un `grep` del BUILD con la sintaxis del FUENTE**: el minificador reescribió `(max-width: 900px)` como `(width<=900px)`, mis búsquedas dieron vacío y leí «no se compiló» cuando llevaba compilado desde el principio. Busca lo que el compilador NO puede reescribir (el nombre de clase) o consulta el CSSOM vivo — misma familia que [[L-59]]: *un patrón que conoce UNA sola de las formas en que algo se escribe cuenta de menos*. (3) Los selectores se sacan de la **cadena del DOM medida**, no de la memoria del marcado: la mitad del mío apuntaba a `.home-cerca`, una clase que no existe (lo real es `.home-cerca__field`). (4) 🚫 **Jamás `maximum-scale=1`** para esto: apaga el zoom a quien lo necesita para leer. Se arregla el tamaño, no se quita la lupa.
