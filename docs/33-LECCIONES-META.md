# 🪞 33 — LECCIONES META (M-NN) · el cerebro aprendiendo de sus propios fallos

> **Hoja hija de `30-LECCIONES`** (§G.5). El stub `### M-NN` con su título vive en `30` —el kernel los
> lee ahí—; el detalle completo vive aquí. Se llena cuando **el cerebro contribuyó a un error**
> (Reflejo de Autocrítica, §G.4): no es una bitácora de bugs, es el registro de dónde la memoria
> falló como memoria.

---

> 🧩 **Dos hermanas, dos cortes distintos** — el stub del título sigue en `30`, que es donde se busca:
> - `docs/37-META-FUNDACIONALES.md` — corte por **ERA**: **M-01..M-10** + **M-33**, las que
>   establecieron cómo se opera este cerebro. Es un **archivo CERRADO**: no crece.
> - `docs/33a-LECCION-QUE-NO-DISPARA.md` — corte por **TEMA** (§289): **M-11 · M-24 · M-25 · M-26 ·
>   M-28**, la cadena de por qué una lección escrita y correcta no llega a tiempo.
>
> ➡️ **La válvula de este nodo es `33a`, no `37`.** Promover a `37` era el diseño y **no funcionaba**:
> `37` es un archivo cerrado por definición, así que la presión de `33` se alivia por TEMA. Aquí
> quedan las **vivas** que no pertenecen a esa cadena.

---

### M-23 — Un paso de procedimiento que nadie ha ejecutado no es documentación: es una HIPÓTESIS *(auditoría #10, 2026-08-25, ADR §140 · §145 · reincidencia ×3 de N9-02)*
El runbook del cutover ha fallado **cuatro veces por lo mismo**: un botón que prometía y no existía (§126), un comando que no funcionaba desde el día que se escribió (§140.1), un paso 🤖 imposible para 🤖 (§140.5) y un mapa de 301 que **jamás se ejecutó** (§145). Los cuatro se descubrieron **ENSAYANDO**, ninguno leyendo — y ninguno lo puede cazar un gate: no son rutas ni tipos, son **promesas**. El agravante de §145: el código era correcto y las pruebas unitarias verdes; lo que faltaba es que **alguien llamara a la función**. *Una prueba unitaria demuestra que la función responde bien, no que alguien la use.* **Regla**: todo paso de un procedimiento marcado como automático lleva su `ensayado: <fecha>`, y se ensaya ANTES del día D — porque un runbook se ejecuta cuando el DNS ya se movió, que es el único paso que tarda horas en revertirse. Corolario de método: **si mides sin reconstruir, no estás midiendo tu cambio.**

### M-27 — Escribí tres sondas de censo sin que ninguna dijera QUÉ había mirado, el mismo día que arreglé un gate por exactamente eso *(§202)*
**Qué pasó**: por la mañana amplié `verify:claims` porque no abría los artículos del journal, y le pegué un contador —*«47 archivos leídos»*— con este argumento escrito en el commit: *«ese número es lo único que distingue “lo revisé” de “no hice nada”»*. Por la tarde escribí **tres sondas ad-hoc** de censo y **ninguna imprimía cuántos archivos había abierto**. Las tres devolvieron *«0 colecciones escritas por ambos lados»*, y las tres estaban mal: la 1.ª no entendía la API modular, la 2.ª seguía siendo línea a línea —así que era **ciega al código bien factorizado**, donde la referencia se construye en un helper y el verbo cae en otra línea— y **ninguna de las dos abrió `js/`**, que es donde vive medio panel legacy.
🎯 **La asimetría que lo explica**: esa misma mañana otra sonda mía reportó **94 % de discrepancia** y la comprobé **en el acto**, porque un número catastrófico pide explicación. Estas susurraron *«todo limpio»* tres veces seguidas y solo las cacé porque yo **sabía** que `propiedades` tiene que escribirse. **Un resultado tranquilizador no se audita solo.** Y su forma más peligrosa es el cero: *«no encontré nada»* es indistinguible de *«no miré en ningún sitio»*.
**Regla**: 🎯 **una sonda ad-hoc debe imprimir su COBERTURA —cuántos archivos, qué directorios— junto al resultado, y con más razón cuando el resultado es cero.** Aplico a mis scripts de una vez el mismo listón que le exijo a un gate del CI; la diferencia entre los dos es que el gate lo vuelve a decir cada día y el script solo tenía una oportunidad. **Y el defecto del cerebro que esto destapa**: [[L-52]] («verde sobre archivos que nunca abre») estaba escrita para los **gates**, y yo la leía como una regla de gates. No lo es: es una regla de **cualquier cosa que enumere**. Corregido su alcance.

### M-29 — Un gate de un repo hermano infería una causa de una correlación, y quien rompió la premisa fui yo *(§216.9)*
**Qué pasó**: el canario de arranque de cars deduce *«los hooks del harness no disparan aquí»* de *«hay
actividad git reciente y ningún `SessionStart` escribió el marcador»*. Me bloqueó un commit. Sus hooks estaban
perfectos: la actividad era un commit de **distribución de kernel** que empujé desde la sesión de OTRO repo.
**El defecto**: la premisa *«commits ⇒ alguien trabajó aquí en sesión»* era cierta cuando escribí el gate, y
dejó de serlo cuando adopté el kernel compartido entre repos. **Nadie revisó la premisa porque el gate seguía
pasando** — hasta que un día no.
**Cómo se aplica**: (1) un gate que infiere una CAUSA de una CORRELACIÓN debe nombrar su premisa por escrito,
para que se pueda auditar; (2) al adoptar una práctica nueva que cruza repos o entornos, pregunta *«¿qué gate
supone que esto no pasa?»*; (3) ante un gate que bloquea, **verifica la premisa antes que el síntoma** —y
prefiere el remedio que la vuelve cierta sobre el interruptor que lo apaga (`SKIP=1` es ceguera permanente
a cambio de un commit).

### M-30 — Me inventé un identificador CUATRO veces en una noche, y las cuatro por escribir de memoria en vez de leer *(§235)*
**Los cuatro**: `RAIZ` en un gate (la constante se llamaba `raiz`) · `htmlDeCliente()`, un helper que no existía · `'autoriza-expresamente'` y `'silencio-reglamento'` **dentro de una regla de seguridad** (los reales eran otros: habría bloqueado TODO alojamiento) · `'en_gestion'`, un estado de solicitud que no está en `ESTADOS_SOLICITUD`.
**El patrón**: los cuatro aparecieron al escribir código *sobre* un módulo que ya conocía «de antes» — nunca al leerlo. Y 🎯 **la gravedad no la fija el error sino DÓNDE cae**: el mismo descuido fue ruido en un script de scratch y habría sido un bloqueo total en una regla de Firestore. Los tres primeros los cazó una **aserción o el typecheck**; el cuarto lo habría aceptado un `Record<string, …>` y el aviso simplemente no habría salido nunca, sin fallar nada.
**Reglas**: (1) 🎯 **un identificador que no acabas de leer es un identificador inventado** — antes de citar una constante, un enum o un helper, ábrelo; el coste es un `grep`. (2) **Deja que el TIPO lo rechace** donde se pueda: `Partial<Record<TipoReal, …>>` en vez de `Record<string, …>` convierte mi defecto en un error de compilación — es el único remedio que no depende de que yo recuerde la regla. (3) **En una regla de seguridad, un enum recordado se lee del fichero, sin excepción**: allí el error no degrada, bloquea. (4) ⚠️ *Que tres de cuatro los cazara una aserción no es suerte: es que las escribí. La cuarta no tenía ninguna.*

### M-31 — 🎯 Un hallazgo que escribí YO apuntaba al nodo que acababa de tocar, no al que peor estaba *(§240)*
**Disparador**: cerré la auditoría #15 anotando que lo siguiente era **partir `38-GATES-QUE-MIENTEN` por tema**, porque le había subido el techo dos veces en 24 h. Al ir a ejecutarlo, medí: `38` estaba al **79 %** y ni entraba en el top-12 de saturación. Los clavados eran otros siete, y **`30-LECCIONES` estaba en 240/240 LÍNEAS** — literalmente bloqueado, no cabía la lección siguiente. El nodo que marqué era simplemente el que tenía las manos encima.
**El patrón**: un hallazgo propio hereda el foco del turno que lo escribió. No mentí ni me equivoqué de dato — **el dato que usé fue el único que tenía delante**, y una auditoría que sale de lo que recuerdas reproduce tu último turno, no el estado del sistema.
**Reglas**: (1) 🎯 **Todo hallazgo que proponga un OBJETO —este nodo, este archivo, este gate— nombra la medición que lo eligió, o no lo eligió nadie.** Un remedio sin denominador es una corazonada con formato de tabla. (2) Al ejecutar un hallazgo heredado, **re-mide su objeto antes de obedecerlo**: la sonda 0 ya re-verifica la premisa, y esto es lo mismo un nivel más abajo. (3) ⚠️ Sospecha en especial del hallazgo que escribiste **al final** de una sesión larga: es cuando el foco pesa más y la medición cuesta más. (4) Cuando el objeto resulte falso, el remedio se **RETIRA** con su evidencia; cerrarlo afirmaría que había algo que arreglar ahí. (5) 🎯 **Y la medición que haces PARA construir un gate suele valer más que el gate** *(§243)*: al contar enlaces internos para saber si había alguno roto —no había ninguno— salió que **38 apuntan a la misma ruta**, o sea que moverla mata el botón principal del sitio. *Nadie había puesto número a esa fragilidad, y no hacía falta un hallazgo para verla: hacía falta contar.* Cuando una sonda salga limpia, mira igualmente su distribución antes de cerrarla.

### M-32 — ⚙️ Un hecho que ya BLOQUEA un gate no pertenece a un nodo always-on *(§244)*
**Disparador**: el `05` afirmaba «cero «próximamente»», «`noindex`», «sin el 307» y «cero cifras inventadas» — los **cuatro** los bloquea ya un gate (`verify:claims`, `verify:build`), comprobado abriéndolos, no de memoria. Un nodo always-on paga su peso **en cada arranque**, y esas frases eran una promesa de segunda mano sobre algo que el CI no deja pasar. Retiradas: **−113c** del presupuesto más escaso, sin perder un hecho.
**Reglas**: (1) 🎯 **Cuando conviertas una promesa en gate, RETÍRALA del nodo que la afirmaba** — si no, pagas el hecho dos veces y la copia del nodo es la que envejece. (2) Deja en su lugar **un puntero corto**, no la lista: sin él alguien las vuelve a añadir de buena fe. (3) ⚠️ **Aplica la regla, no la narres**: mi primer intento cambió las cuatro frases por las mismas *más* el porqué de que sobraran — el nodo **creció 53c**. Explicar una poda es lo contrario de podar. (4) Verifica el gate ANTES de retirar: quitar una afirmación que nadie vigila no es GC, es perder un hecho ([[M-30]]). (5) 🎯 **Un número que describe una relación MUTABLE tampoco cabe: escribe el mecanismo** *(§245)*. Puse «dev +10» en el tablero de un repo hermano y mergeé esos diez **diez minutos después**: mi propia frase caducó en el mismo turno. Un tablero guarda lo que seguirá siendo cierto mañana.
