# 🎭 38 — GATES QUE MIENTEN (hoja hija de `36-LECCIONES-UTILLAJE`)

> **Por qué existe.** Un gate roto AVISA; un gate que miente no. Aquí vive la ESCALERA de cuando
> el ✅ **no significa lo que parece**; el stub con el título vive en `30`, que es donde se busca.
> ⚠️ **Los OCHO cuerpos están MIGRADOS al maestro** (F2, lotes 5/13/14): lo que queda aquí es el
> ruteo —la escalera de arriba y un stub anclado por lección—, no el texto.
>
> **La escalera, de menos a más grave** — y cada peldaño se detecta distinto:
> 1. **No hay gate.** Al menos nadie se confía.
> 2. **Lo hay y nadie lo invoca** ([[L-56]]) — existe en `package.json` y no lo corre ni el CI.
> 3. **Corre, pero no abre el archivo** ([[L-52]]) — verde sobre lo que jamás miró.
> 4. **Corre en un sitio y no en otro** ([[L-48]]) — prerrequisito generado y gitignored.
> 5. **Afirma haber pasado sin mirar nada** ([[L-57]]) — le falta su prerrequisito y en vez de
>    fallar PREGUNTA; sin terminal, no contestar sale con código 0.
> 6. **FUERA del CI por un motivo que CADUCÓ** (§177) — el caso se mudó a [[L-70]] en `38a`: es
>    ARMADO, no un verde. **Un motivo para no correr un gate caduca, y nadie lo re-mide.**
> 7. **Corre, mira el archivo, imprime un número CIERTO… de una comparación que no significa nada**
>    ([[L-58]]) — el peldaño más insidioso, porque no hay nada roto que encontrar.
> 8. **Verde sobre código que la configuración por defecto APAGA** (§265) — el caso completo se mudó a
>    [[L-70]] en `38a`, porque el predicado vivía en lo PROBADO. Enciéndelo: `npm run catalogo:live`.
>
> 🔴 **Y la CARA OPUESTA, que la escalera no ordena porque no es un verde**: el gate que miente en
> **ROJO** ([[L-72]]). No es un peldaño más — es el eje contrario: el ✅ falso te deja donde estabas,
> el ❌ falso **te manda a arreglar algo y nombra al culpable**. Verifica la premisa antes que el
> síntoma, y mide a dónde lleva obedecer antes de obedecer.
>
> 🚦 **La capa de ABAJO tiene hoja propia**: `docs/38a-ARMADO-DEL-GATE.md` — el gate que **no llegó a
> mirar** (no lo invoca nadie [[L-56]] · exento por entorno [[L-65]] · excluido por su predicado
> [[L-70]] · su ancla desapareció [[L-71]]). Aquí el gate SÍ respondió y su respuesta miente —en verde
> o **en rojo**—; allí no hubo respuesta que auditar. Si dudas: pregunta si llegó a abrir un archivo.
>
> **Prueba de bolsillo para cualquier gate**: *que imprima CUÁNTO miró* (archivos, enlaces,
> pruebas). Un número es lo único que distingue «revisado» de «no hice nada». Y **estrénalo
> rompiéndolo a propósito EN EL ENTORNO DONDE VA A CORRER**, no solo en tu máquina.
>
> 📝 **Y al revés: comprimir un nodo APAGA el gate que lo lee** — varios chequeos leen PROSA
> (`«CF legacy: N en código»`) y acortar la frase les quita lo que buscaban (§180). Se declaró
> DEGRADADO, no verde. **Al acortar, mira qué patrones dependen de esas palabras.**
>
> ⏱️ **Y el detector más barato de todos: el RELOJ.** El paso «Tipos» tardaba **4 s** en todas sus
> corridas históricas y **21 s** en la primera con checker de verdad. **Un gate sospechosamente
> RÁPIDO no está optimizado: está sin hacer nada** — y la duración por paso la da la API de
> Actions sin credenciales, así que compararla con la del día que funcionaba cuesta un comando.
---

### L-58 — 🎭 Un gate puede imprimir un número CIERTO de una comparación que no significa nada *(§193)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-58]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-57 — 🎭 Una herramienta a la que le falta su prerrequisito puede **PREGUNTAR en vez de fallar** — y sin terminal, «no contestar» sale con código 0 *(§175)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-57]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre** *(§138)*
⇒ **Migrada al maestro** (F2 lote 13): [[INMO:L-52]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-48]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-63 — 💸 DOS validadores correctos del mismo campo, y ninguno comprueba que hablen de la misma UNIDAD *(§233)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-63]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-64 — 🪤 Un gate NUEVO se queda en verde de TRES formas, y las tres se ven solo inyectando el defecto *(§238)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-64]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-72 — 🔴 La otra cara: un gate que miente en ROJO **viene con una instrucción**, y el único arreglo obediente que compilaba rompía producción *(§288.4)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-72]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-74 — 🎭 Un `\b` casa DETRÁS de los dos puntos: `[[CARS:L-01]]` se leyó `L-01` y resolvió contra OTRA lección: ✅ *(§292)*
⇒ **Migrada al maestro** (F2 lote 14): [[INMO:L-74]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).
