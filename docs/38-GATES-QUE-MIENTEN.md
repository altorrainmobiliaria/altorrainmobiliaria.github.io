# 🎭 38 — GATES QUE MIENTEN (hoja hija de `36-LECCIONES-UTILLAJE`)

> **Por qué existe.** Un gate roto AVISA; un gate que miente no. Aquí viven las lecciones de cuando
> el ✅ **no significa lo que parece**; el stub con el título sigue en `36`, que es donde se busca.
>
> **La escalera, de menos a más grave** — y cada peldaño se detecta distinto:
> 1. **No hay gate.** Al menos nadie se confía.
> 2. **Lo hay y nadie lo invoca** ([[L-56]]) — existe en `package.json` y no lo corre ni el CI.
> 3. **Corre, pero no abre el archivo** ([[L-52]]) — verde sobre lo que jamás miró.
> 4. **Corre en un sitio y no en otro** ([[L-48]]) — prerrequisito generado y gitignored.
> 5. **Afirma haber pasado sin mirar nada** ([[L-57]]) — le falta su prerrequisito y en vez de
>    fallar PREGUNTA; sin terminal, no contestar sale con código 0.
> 6. **FUERA del CI por un motivo que CADUCÓ** (§177) — 141 pruebas excluidas «porque necesitan
>    Java»; medido eran 24 s y una llevaba meses rota en main. **Un motivo para no correr un gate
>    caduca, y nadie lo mira si no se vuelve a medir.**
> 7. **Corre, mira el archivo, imprime un número CIERTO… de una comparación que no significa nada**
>    ([[L-58]]) — el peldaño más insidioso, porque no hay nada roto que encontrar.
> 8. **Verde sobre código que la configuración por defecto APAGA** (§265) — el caso completo se mudó a
>    [[L-70]] en `38a`, porque el predicado vivía en lo PROBADO. Enciéndelo: `npm run catalogo:live`.
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
**Disparador**: el linter reportaba la pizarra del WIP como `9331c/16000 · 58 %`; su margen real eran **124c**: equivocada **54 veces**, meses y en los TRES repos. **Causa**: no hay bug — falla la **PREMISA**. «El cap de una neurona es su techo» es verdad para 30 nodos y mentira para 3, porque los caps de los `alwaysOn` **suman más que el presupuesto de arranque** y no pueden cumplirse a la vez. Nadie lo dijo en voz alta, así que nadie lo comprobó.
**Por qué es el peldaño peor**: los otros seis dejan rastro; aquí todo funciona y la salida es correcta. Lo único equivocado es la pregunta que uno CREE hacer: `9331/16000` responde *«¿cuánto de mi cap gasté?»* y uno lee *«¿cuánto me cabe?»*. Se detecta al revés: **auditando la ARITMÉTICA de los umbrales**, no el gate.
**Regla portable**: 🎯 **un porcentaje sin su denominador auditado es decoración.** Si un límite local convive con uno global, publica el **efectivo** (`global − lo que ocupan los demás`) donde se lee, y deja **UN** gate bloqueando: repartir la culpa entre partes no tiene respuesta objetiva, y tres avisos iguales enseñan a ignorar los tres.
**Su hermano, del mismo día** *(§246)*: **medir con el instrumento equivocado no es medir**, y sale igual de convincente. Dos veces en un turno: (a) para saber si las pantallas del panel cubren el estado cero conté ramas `length===0` **y** frases de un helper concreto — dos señales que no se corresponden, así que la tabla decía «0» de pantallas que sí lo cubrían con otro helper; (b) para elegir qué extraer de un nodo lleno agrupé sus lecciones **por regex** y el grupo mayor mezclaba códigos de error, preview headless, SEO y modelado de roles: un **cajón de sastre**, no un tema — crear una neurona con eso habría sido fabricar el cajón. 🎯 **Antes de actuar sobre el resultado de una medición propia, mira si mide lo que crees**: un recuento sale siempre, y su aplomo no depende de que la pregunta fuera la buena.

**2ª aparición (26-ago, kernel v1.20.0)**: el chequeo de refs guardaba las definiciones en un `Set`. Dos lecciones reclamaban `L-60` y el contador dijo «96 definidas» sobre 97 encabezados — **la estructura que deduplica es la que vuelve invisible la duplicación**; el ID colisionado degrada el enlace de ROTO (se ve) a MENTIROSO (no). Cuéntalo sobre ARRAY y por fichero. Estrenó cazando dos que el ojo no vio.
### L-57 — 🎭 Una herramienta a la que le falta su prerrequisito puede **PREGUNTAR en vez de fallar** — y sin terminal, «no contestar» sale con código 0 *(§175)*
**Disparador (condición mínima)**: una CLI que *puede autoinstalarse algo* corre en CI. Basta con que tenga modo interactivo — no hace falta que falle nada para sospechar.
**Caso**: `astro check` sin `@astrojs/check` pregunta «Continue?» y espera; sin TTY nadie responde y sale **exit 0**. «Tipos ✅» sin abrir un archivo, 4 corridas verdes sobre 26 errores, con deploy. **Por qué en local sí**: el paquete estaba en el `node_modules` de la RAÍZ, no en el del subproyecto — Node sube un nivel, el CI instala dentro. *Una dependencia que solo existe por la disposición de carpetas de quien programa no existe.* Familia de [[L-48]] por la cara que no se mira: verde en CI **porque el gate se apagó**. Detalle → §175.
**Cómo se caza**: (a) exige el checker **en el LOCKFILE**, no en `node_modules` — el lockfile es lo que reinstala el CI y `node_modules` es lo que engaña; (b) **estrena cada gate rompiéndolo a propósito EN EL ENTORNO DONDE CORRE**: un worktree con `npm ci` limpio sobre un commit malo conocido da el antes/después en dos comandos; (c) desconfía de un ✅ que no dice **cuántos archivos** miró.
**Regla portable**: *no tener gate < tener uno que nadie invoca ([[L-56]]) < tener uno que **afirma haber pasado***. Una corrida en verde **no prueba que el gate mirara**.

### L-52 — 🧰 Un gate puede correr en VERDE sobre archivos que **nunca abre** *(§138)*
**Disparador**: `npm run typecheck` pasa y crees que el proyecto está chequeado. **Causa**: `tsc` **no lee los `.astro`**, y ahí vive casi toda la lógica de navegador; al cambiarlo por `astro check` salieron **15 errores reales**, uno un componente ENTERO invisible porque una regex en línea rompe su parser. **Prima hermana en CSS**: `var(--x)` sin declarar **no es un error** — el navegador descarta la propiedad y sigue (así el emblema del login estuvo meses sin relieve en una página declarada «réplica fiel»).
**Cómo se caza**: sonda deliberada (`const x: number = 'texto'`) en un archivo del tipo que dudas; si el gate no la ve, no cubre ese tipo. **Regla portable**: no preguntes «¿pasa mi gate?» sino **«¿qué ARCHIVOS abre, y qué vería si el fallo estuviera delante?»**. Un gate que falla ABIERTO —descarta lo que no entiende— es indistinguible de uno que funciona ([[M-06]]).

### L-48 — 🧪 Un prerrequisito GENERADO y gitignored hace que el gate pase en local y falle en CI *(§125)*
`worker-configuration.d.ts` lo produce `wrangler types` y está en `.gitignore`: en la máquina de quien escribió el gate existía; en el checkout limpio del CI, no. Resultado: `typecheck` verde en local y **8 corridas rojas seguidas en CI**, con el deploy saltándose en silencio por `needs: build`. Dos días sin desplegar, y el sitio vivo contradiciendo al repo.
- **Regla**: si un comando necesita un archivo **generado** y no commiteado, **generarlo es parte del comando**, no del entorno (`"typecheck": "wrangler types && tsc --noEmit"`). Un script que se prepara a sí mismo no diverge entre local y CI. Y **NO lo cures commiteando el generado**: quita el síntoma y abre drift contra su fuente.
- **Reproduce antes de arreglar** (§3.3): la 1.ª hipótesis era FALSA; el diagnóstico salió de clonar en limpio. Y **al añadir un paso al CI, míralo correr EN CI** antes de cerrar — 4.ª forma de [[M-06]]: un ❌ que nadie lee para la tubería igual que un ✅ falso la deja pasar.

### L-63 — 💸 DOS validadores correctos del mismo campo, y ninguno comprueba que hablen de la misma UNIDAD *(§233)*
**Disparador**: el giro al propietario salía **−25.370.000**, y no era la prueba. `Contrato.honorariosPct` guardaba lo que teclea una persona —el formulario pide *«Honorarios %»* con marcador `10`— y su validador aceptaba hasta **100**; `liquidacion.ts` calcula con una **FRACCIÓN** y rechaza todo lo mayor que **0.5**. Entre los dos extremos no había conversión: **un contrato normal del 10 % no se podía liquidar**, y eso muerde en el primer contrato real del dueño.
**Por qué es de esta familia**: 🎯 *cada lado, POR SEPARADO, estaba en verde.* El contrato validaba bien SU unidad y la liquidación la SUYA, ambos con pruebas que pasaban, y el typecheck no ayuda porque las dos son `number`. Lo más elocuente: `liquidacion.ts` **nombra este error de dedo** —*«un porcentaje escrito como 10 en vez de 0.10, el que más caro sale aquí»*— y se protege de él mientras el otro extremo lo aceptaba. **Escribir la defensa no es cerrar el hueco.**
**Reglas**: (1) 🎯 **la unidad se DECLARA en el modelo, no se insinúa en el nombre**: un sufijo no es un contrato. (2) **La conversión ocurre UNA vez, en una frontera con nombre**: dos conversiones son dos oportunidades de olvidar una. (3) ⚠️ **Un `number` que cruza un módulo con unidad implícita es la misma clase de bug que un `string` que cruza con zona horaria implícita** — la misma sospecha vale para los dos. (4) 🎯 **La prueba compara contra el ARTEFACTO APROBADO** (aquí las cifras del mockup de liquidación), no contra la aritmética del módulo que prueba: *una prueba que recalcula lo que prueba solo confirma que la fórmula es igual a sí misma.* (5) Cuando dos validadores miran el mismo campo, **escribe la prueba que los CRUCE**: la que faltaba aquí no era de ninguno de los dos, era del par.

### L-64 — 🪤 Un gate NUEVO se queda en verde de TRES formas, y las tres se ven solo inyectando el defecto *(§238)*
**Disparador**: el gate de habeas data tardó **tres intentos** en morder, y cada versión parecía correcta al leerla. (1) **Contó el marcador**: *«¿hay un `checkbox`?»*, y el formulario tiene DOS —la autorización y un opt-in—, así que al quitar la buena seguía viendo la otra. (2) **Midió por cercanía**: 600 chars alrededor, y las dos casillas están pegadas — *una comprobación por proximidad no distingue dos cosas que están cerca, que es justo el caso a distinguir*. (3) **Leyó una alternativa como si fueran dos**: `(?:name|id)="…"` casa **la primera que aparezca**, y en una página esa era el `id`, así que nunca llegaba al `name` y tumbaba un formulario correcto.
**Reglas**: (1) 🎯 **las tres pasaban la lectura y ninguna el defecto**: revisar el código del gate no sustituye a inyectar el fallo. (2) **Inyecta en TODOS los casos que cubre**: el 3.º solo apareció al probar el segundo formulario. (3) ⚠️ Una alternancia `(a|b)` lee UNA; si necesitas ambas, son dos búsquedas. (4) 🎯 **Comprueba que tu INYECCIÓN casó**: dos pruebas de esa noche salieron verdes sobre una regresión que nunca se inyectó porque el patrón no halló su ancla. *Un test que no llega a lo que quiere probar da el mismo silencio que uno que pasa.* (5) 🎯 **Y para toda EXCLUSIÓN, una prueba NEGATIVA** *(§248)*: inyecta el mismo defecto **dentro** de lo excluido y comprueba que **no bloquea y que el denominador no se mueve**. Sin ella no distingues «la exclusión funciona» de «se está tragando contenido real» — y una exclusión demasiado ancha convierte el gate en decoración sin que nadie lo note, porque su verde no cambia de aspecto.
