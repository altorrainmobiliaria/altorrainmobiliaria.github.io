# 🖥️ 31 — VERIFICACIÓN DE UI EN NAVEGADOR (hoja de `30-LECCIONES` · shard TODO-31d, plan §49)

> **Madre**: `docs/30-LECCIONES.md` — aquí vive el TRIGGER y el destilado; los cinco IDs de esta hoja
> (**L-22 / L-26 / L-28 / L-62 / L-68**) están MIGRADOS al maestro y aquí queda su stub anclado.
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
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-22]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-26 — 🖥️ El panel de navegador tiene el RENDERER CONGELADO (`rAF` = 0 frames): NADA guiado por frames se puede verificar ahí *(ADR §32.10; explica y ENGLOBA L-22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-26]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-28 — 🎭 `getComputedStyle` MIENTE en toda propiedad con `transition` (pestaña de fondo ⇒ rAF estrangulado ⇒ el valor se queda en el INICIAL) *(ADR §32.22; INVIERTE la regla de L-22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-28]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

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
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-62]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-68 — 🎭 Una override que COMPILA y se SIRVE puede perder en silencio: `@media` NO aporta especificidad *(§264)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-68]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
