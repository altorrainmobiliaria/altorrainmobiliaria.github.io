# 🎭 38 — GATES QUE MIENTEN (hoja hija de `36-LECCIONES-UTILLAJE`)

> **Por qué existe esta hoja.** Un gate roto AVISA; un gate que miente no. Esta familia nació
> dispersa y creció tres veces en un solo día (2026-08-26), así que se le da casa propia: son las
> lecciones de cuando el ✅ **no significa lo que parece**. El stub con el título sigue en `36`,
> que es donde se busca; el detalle completo vive aquí.
>
> **La escalera, de menos a más grave** — y cada peldaño se detecta distinto:
> 1. **No hay gate.** Al menos nadie se confía.
> 2. **Lo hay y nadie lo invoca** ([[L-56]]) — existe en `package.json` y no lo corre ni el CI.
> 3. **Corre, pero no abre el archivo** ([[L-52]]) — verde sobre lo que jamás miró.
> 4. **Corre en un sitio y no en otro** ([[L-48]]) — prerrequisito generado y gitignored.
> 5. **Afirma haber pasado sin mirar nada** ([[L-57]]) — le falta su prerrequisito y en vez de
>    fallar PREGUNTA; sin terminal, no contestar sale con código 0.
> 6. **Está FUERA del CI por un motivo que CADUCÓ** (§177) — 141 pruebas excluidas «porque necesitan
>    Java»; medido, eran 24 s, y una llevaba meses rota en la rama principal. **Un motivo para no
>    correr un gate caduca, y nadie lo mira si no se vuelve a medir.** Al tocar un fixture, búscale
>    los gemelos: el que corre en el gate se arregla solo; el que no, calla.
> 7. **Corre, mira el archivo, imprime un número CIERTO… de una comparación que no significa nada**
>    ([[L-58]]) — el peldaño más insidioso, porque no hay nada roto que encontrar.
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
**Disparador**: el linter reportaba la pizarra del WIP como `9331c/16000 · 58 %`; su margen real eran **124c**: equivocada **54 veces**, meses y en los TRES repos. **Causa**: no hay bug — falla la **PREMISA**. «El cap de una neurona es su techo» es verdad para 30 nodos y mentira para 3, porque los caps de los `alwaysOn` **suman más que el presupuesto de arranque** y no pueden cumplirse a la vez. Nadie lo dijo en voz alta, así que nadie lo comprobó.
**Por qué es el peldaño peor**: los otros seis dejan rastro; aquí todo funciona y la salida es correcta. Lo único equivocado es la pregunta que uno CREE hacer: `9331/16000` responde *«¿cuánto de mi cap gasté?»* y uno lee *«¿cuánto me cabe?»*. Se detecta al revés: **auditando la ARITMÉTICA de los umbrales**, no el gate.
**Regla portable**: 🎯 **un porcentaje sin su denominador auditado es decoración.** Si un límite local convive con uno global, publica el **efectivo** (`global − lo que ocupan los demás`) donde se lee, y deja **UN** gate bloqueando: repartir la culpa entre partes no tiene respuesta objetiva, y tres avisos iguales enseñan a ignorar los tres.

**2ª aparición (26-ago, kernel v1.20.0)**: el chequeo de refs guardaba las definiciones en un `Set`. Dos lecciones reclamaban `L-60` y el contador dijo «96 definidas» sobre 97 encabezados — **la estructura que deduplica es la que vuelve invisible la duplicación**; el ID colisionado degrada el enlace de ROTO (se ve) a MENTIROSO (no). Cuéntalo sobre ARRAY y por fichero. Estrenó cazando dos que el ojo no vio.
### L-57 — 🎭 Una herramienta a la que le falta su prerrequisito puede **PREGUNTAR en vez de fallar** — y sin terminal, «no contestar» sale con código 0 *(§175)*
**Disparador (condición mínima)**: una CLI que *puede autoinstalarse algo* corre en CI. Basta con que tenga modo interactivo — no hace falta que falle nada para sospechar.
**Caso**: `astro check` sin `@astrojs/check` pregunta «Continue?» y espera; sin TTY nadie responde y sale **exit 0**. «Tipos ✅» sin abrir un archivo, 4 corridas verdes sobre 26 errores, con deploy. **Por qué en local sí**: el paquete estaba en el `node_modules` de la RAÍZ, no en el del subproyecto — Node sube un nivel, el CI instala dentro. *Una dependencia que solo existe por la disposición de carpetas de quien programa no existe.* Familia de [[L-48]] por la cara que no se mira: verde en CI **porque el gate se apagó**. Detalle → §175.
**Cómo se caza**: (a) exige el checker **en el LOCKFILE**, no en `node_modules` — el lockfile es lo que reinstala el CI y `node_modules` es lo que engaña; (b) **estrena cada gate rompiéndolo a propósito EN EL ENTORNO DONDE CORRE**: un worktree con `npm ci` limpio sobre un commit malo conocido da el antes/después en dos comandos; (c) desconfía de un ✅ que no dice **cuántos archivos** miró.
**Regla portable**: *no tener gate < tener uno que nadie invoca ([[L-56]]) < tener uno que **afirma haber pasado***. Una corrida en verde **no prueba que el gate mirara**.

### L-56 — 🧰 Un gate puede existir y NO CORRERLO NADIE — ni el CI ni tú *(§142 · §157 · §174)*
`verify:data` llevaba meses en `package.json` fuera del CI y de toda rutina: vigilaba algo caro (el free-tier) y era **decorativo**. Lo descubrí porque **lo puse en rojo yo mismo dos veces el mismo día** sin enterarme. **Regla portable**: escribir el gate es la mitad; **cablearlo es la otra**, y la que se olvida. Prima de [[L-52]]: allí corría sin mirar el archivo; aquí ni corría.
**CUATRO reincidencias** (la 4ª en bersaglio, 26-ago: 45 `test:*` y el CI sin correr ninguno — la lección no cruzó de un cerebro al otro), **y lo que las une**: (a) *§157* — al CI sí, pero en LOCAL hay que acordarse de siete nombres: corrí cinco y escribí «los 7 en verde». El candado del CI llega TARDE, tras empujar. (b) *§174, la peor* — el meta-gate que vigila el cableado **enumeraba por PREFIJO** (`startsWith('verify:')`), así que `typecheck` y `test` le eran INVISIBLES: `npm run verify` daba verde con **26 errores de tipos en `main`** y **855 pruebas que el CI no corría**. 🎯 **El patrón**: cada vez el hueco estaba en la punta que el guardián no enumeraba — y quien incumple la convención es justo a quien hay que vigilar. Enumera contra **lo que el CI ejecuta de verdad**, nombra aparte los que no encajan en el patrón, y comprueba **las dos puntas** (CI y atajo local). *Un atajo que envejece es peor que no tenerlo: se confía en él.*

### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre** *(§138)*
**Disparador**: `npm run typecheck` pasa y crees que el proyecto está chequeado. **Causa**: `tsc` **no lee los `.astro`**, y ahí vive casi toda la lógica de navegador; al cambiarlo por `astro check` salieron **15 errores reales**, uno un componente ENTERO invisible porque una regex en línea rompe su parser. **Prima hermana en CSS**: `var(--x)` sin declarar **no es un error** — el navegador descarta la propiedad y sigue (así el emblema del login estuvo meses sin relieve en una página declarada «réplica fiel»).
**Cómo se caza**: sonda deliberada (`const x: number = 'texto'`) en un archivo del tipo que dudas; si el gate no la ve, no cubre ese tipo. **Regla portable**: no preguntes «¿pasa mi gate?» sino **«¿qué ARCHIVOS abre, y qué vería si el fallo estuviera delante?»**. Un gate que falla ABIERTO —descarta lo que no entiende— es indistinguible de uno que funciona ([[M-06]]).

### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
`worker-configuration.d.ts` lo produce `wrangler types` y está en `.gitignore`: en la máquina de quien escribió el gate existía; en el checkout limpio del CI, no. Resultado: `typecheck` verde en local y **8 corridas rojas seguidas en CI**, con el deploy saltándose en silencio por `needs: build`. Dos días sin desplegar, y el sitio vivo contradiciendo al repo.
- **Regla**: si un comando necesita un archivo **generado** y no commiteado, **generarlo es parte del comando**, no del entorno (`"typecheck": "wrangler types && tsc --noEmit"`). Un script que se prepara a sí mismo no diverge entre local y CI. Y **NO lo cures commiteando el generado**: quita el síntoma y abre drift contra su fuente.
- **Reproduce antes de arreglar** (§3.3): la 1.ª hipótesis era FALSA; el diagnóstico salió de clonar en limpio. Y **al añadir un paso al CI, míralo correr EN CI** antes de cerrar — 4.ª forma de [[M-06]]: un ❌ que nadie lee para la tubería igual que un ✅ falso la deja pasar.
