# 🪞 33 — LECCIONES META (M-NN) · el cerebro aprendiendo de sus propios fallos

> **Hoja hija de `30-LECCIONES`** (§G.5). El stub `### M-NN` con su título vive en `30` —el kernel los
> lee ahí—; el detalle completo vive aquí. Se llena cuando **el cerebro contribuyó a un error**
> (Reflejo de Autocrítica, §G.4): no es una bitácora de bugs, es el registro de dónde la memoria
> falló como memoria.

---

> 🧩 **M-01..M-11 viven en `docs/37-META-FUNDACIONALES.md`** (shard del 2026-08-26): son las
> fundacionales, y ahí están COMPLETAS. Aquí quedan las VIVAS (hoy, M-23 en adelante). El stub con
> el título sigue en `30`, que es donde se busca.

---

### M-23 — Un paso de procedimiento que nadie ha ejecutado no es documentación: es una HIPÓTESIS *(auditoría #10, 2026-08-25, ADR §140 · §145 · reincidencia ×3 de N9-02)*
El runbook del cutover ha fallado **cuatro veces por lo mismo**: un botón que prometía y no existía (§126), un comando que no funcionaba desde el día que se escribió (§140.1), un paso 🤖 imposible para 🤖 (§140.5) y un mapa de 301 que **jamás se ejecutó** (§145). Los cuatro se descubrieron **ENSAYANDO**, ninguno leyendo — y ninguno lo puede cazar un gate: no son rutas ni tipos, son **promesas**. El agravante de §145: el código era correcto y las pruebas unitarias verdes; lo que faltaba es que **alguien llamara a la función**. *Una prueba unitaria demuestra que la función responde bien, no que alguien la use.* **Regla**: todo paso de un procedimiento marcado como automático lleva su `ensayado: <fecha>`, y se ensaya ANTES del día D — porque un runbook se ejecuta cuando el DNS ya se movió, que es el único paso que tarda horas en revertirse. Corolario de método: **si mides sin reconstruir, no estás midiendo tu cambio.**

### M-24 — Una lección CORRECTA archivada bajo el disparador equivocado no dispara *(§160 · reincidencia de [[L-46]] caso b)*
[[L-46]] describe el fallo con precisión quirúrgica y aun así **reincidí dos veces el mismo día** — la segunda, escribiendo *esta misma lección*. La lección no falló: falló su ENTRADA. Estaba archivada bajo *«generas un archivo con heredoc»* y yo parcheaba **una línea**, que no se siente como generar nada: el disparador describía la ESCENA del descubrimiento, no la CONDICIÓN que lo causa.
**Regla**: el disparador se redacta como la **condición mínima detectable** (*«la carga lleva un backslash»*), nunca como la actividad en que apareció. Si solo lo reconoce quien ya recuerda el caso, es un recuerdo, no un reflejo. **Al reincidir en una lección existente, audita primero su disparador**: si tuviste que releerla para reconocerte, el defecto está ahí y no en tu atención.

### M-25 — Una regla ESCRITA da la sensación de estar APLICADA *(§162 · §163 · §172 · §173 — cuatro veces el 2026-08-26)*
Cuatro averías del mismo día, misma forma: **riesgo entendido, escrito, y sin mecanismo detrás.** (a) `sitemap.xml.ts` explicaba en un comentario que «el olvido más común es no meter la URL al sitemap»… y dejó `/nosotros` fuera. (b) `portal-ci.yml` explicaba por qué el interruptor del catálogo vive ahí, y nadie hacía ruido si se olvidaba. (c) `43` tenía escrita la ventana horaria de la Ley 2300 con sus horas exactas mientras **dos crons la incumplían**. (d) La prohibición de decir «avalúo» estaba en **cuatro** sitios y el panel decía «Tu avalúo».
**Por qué engaña**: escribir la regla da la misma sensación de cierre que aplicarla —se entendió, se dejó constancia, se puede citar— y esa sensación **apaga la pregunta siguiente**. Cuanto mejor escrita, más engaña: un comentario que nombra el fallo exacto parece un fallo resuelto.
**Regla**: la misma tarea que escribe una regla **decide su mecanismo o declara que no lo tiene**. Tres salidas, y el silencio no es una: un gate · un `[HONOR]` explícito · hacerla imposible por diseño. **Test de bolsillo**: *si mañana alguien la incumple, ¿qué se pone rojo?* Si es «nada», todavía no es una regla: es una nota.
**Y al detectar un incumplimiento, busca la regla ANTES de escribirla**: las cuatro veces ya estaba, y el hallazgo no era la norma sino su desconexión.

### M-26 — Un nodo que se consulta CUANDO ALGO FALLA no puede evitar el fallo: [[L-54]] estaba escrita, correcta y bien titulada, y aun así la pisé 22 veces en un archivo nuevo *(§174)*
No es [[M-24]] (el disparador estaba **bien** redactado: *«los tipos de Workers pisan el DOM: usa `appendChild`»*) ni [[M-25]] (no era una nota: era una lección con su caso y su fix). Falló el **ENRUTAMIENTO**. §G.2 tiene dos triggers para código y dicen cosas distintas: el **🖥️ Código** manda leer `34-DOCTRINA-CODIGO` **ANTES de escribir**, y el **🧪 Experiencia** manda a `30-LECCIONES` *«si un síntoma te suena»* — que es **reactivo por construcción**. La regla de Workers vivía solo en la rama reactiva. Siguiendo el router al pie de la letra, quien escribe un archivo nuevo **no se la encuentra jamás**: solo la encuentra quien ya tiene el error en pantalla, y para entonces ya la pisó.
Agravante: L-54 se había escrito **el día anterior** (§138), y el error que produce **no nombra a Cloudflare** — así que ni el mensaje devuelve al nodo. El coste real fue mayor que las 22 líneas: el archivo entró a `main` en rojo y bloqueó los despliegues del portal hasta el día siguiente.
**Regla**: al archivar una lección, pregunta **en qué momento hace falta**, no de qué trata. Si hace falta ANTES de teclear —una trampa del stack, un invariante del modelo, una colisión de tipos— su sitio es el nodo que el router abre **antes**, aunque el caso completo viva en el de lecciones; el de lecciones es para RECONOCER un síntoma, no para prevenirlo. **Test de bolsillo**: *¿qué trigger de §G.2 me trae aquí, y llega a tiempo?* Si la única respuesta es «cuando ya falló», está en el nodo equivocado — o le falta una copia en el de antes.

### M-27 — Escribí tres sondas de censo sin que ninguna dijera QUÉ había mirado, el mismo día que arreglé un gate por exactamente eso *(§202)*
**Qué pasó**: por la mañana amplié `verify:claims` porque no abría los artículos del journal, y le pegué un contador —*«47 archivos leídos»*— con este argumento escrito en el commit: *«ese número es lo único que distingue “lo revisé” de “no hice nada”»*. Por la tarde escribí **tres sondas ad-hoc** de censo y **ninguna imprimía cuántos archivos había abierto**. Las tres devolvieron *«0 colecciones escritas por ambos lados»*, y las tres estaban mal: la 1.ª no entendía la API modular, la 2.ª seguía siendo línea a línea —así que era **ciega al código bien factorizado**, donde la referencia se construye en un helper y el verbo cae en otra línea— y **ninguna de las dos abrió `js/`**, que es donde vive medio panel legacy.
🎯 **La asimetría que lo explica**: esa misma mañana otra sonda mía reportó **94 % de discrepancia** y la comprobé **en el acto**, porque un número catastrófico pide explicación. Estas susurraron *«todo limpio»* tres veces seguidas y solo las cacé porque yo **sabía** que `propiedades` tiene que escribirse. **Un resultado tranquilizador no se audita solo.** Y su forma más peligrosa es el cero: *«no encontré nada»* es indistinguible de *«no miré en ningún sitio»*.
**Regla**: 🎯 **una sonda ad-hoc debe imprimir su COBERTURA —cuántos archivos, qué directorios— junto al resultado, y con más razón cuando el resultado es cero.** Aplico a mis scripts de una vez el mismo listón que le exijo a un gate del CI; la diferencia entre los dos es que el gate lo vuelve a decir cada día y el script solo tenía una oportunidad. **Y el defecto del cerebro que esto destapa**: [[L-52]] («verde sobre archivos que nunca abre») estaba escrita para los **gates**, y yo la leía como una regla de gates. No lo es: es una regla de **cualquier cosa que enumere**. Corregido su alcance.

### M-28 — Una lección mía llevaba meses escrita y su remedio estaba del lado equivocado del corte *(§216.8)*
**Qué pasó**: L-47 (desde §118) avisa de que `open(p,'w')` destruye el archivo, y prescribe *«lee a una
variable y **afirma** antes de abrir en `'w'`»*. Hice las dos cosas y **vacié `42-LEGAL` de cars igual**: el
fallo fue un `UnicodeEncodeError` *durante* el `.write()`, ya truncado. El `assert` cubre leer-tras-truncar;
no cubre fallar-tras-truncar.
**El defecto**: la lección estaba redactada como **precaución contra el modo de fallo que la originó**, no
como principio. Al leerla, reconocí la trampa, apliqué su remedio y me quedé tranquilo — la lección **produjo
confianza sin producir protección**, que es peor que no tenerla.
**Cómo se aplica**: al escribir una lección, pregunta *«¿este remedio protege del PELIGRO, o solo del CAMINO
por el que llegué al peligro?»*. Si el peligro tiene un punto de no retorno (truncar, borrar, publicar,
enviar), **el remedio va ANTES de ese punto o no es un remedio**. Y si ya existe una lección y vuelves a
caer, el defecto no es tuyo: **es de su redacción** — reescríbela en principio, no añadas un caso más.

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
**Disparador**: el `05` afirmaba «cero «próximamente»», «`noindex`», «sin el 307» y «cero cifras inventadas» — los **cuatro** los bloquea ya un gate (`verify:claims`, `verify:build`), comprobado abriéndolos, no de memoria. Un nodo always-on paga su peso **en cada arranque de cada sesión**, y esas cuatro frases eran una promesa de segunda mano sobre algo que el CI no deja pasar. Retiradas: **−113c** del presupuesto más escaso del sistema, sin perder un solo hecho.
**Reglas**: (1) 🎯 **Cuando conviertas una promesa en gate, RETÍRALA del nodo que la afirmaba** — si no, pagas el hecho dos veces y la copia del nodo es la que envejece. (2) Deja en su lugar **un puntero corto**, no la lista: sin él alguien las vuelve a añadir de buena fe. (3) ⚠️ **Aplica la regla, no la narres**: mi primer intento sustituyó las cuatro frases por las cuatro frases *más* la explicación de por qué sobraban, y el nodo **creció 53c**. Explicar una poda es lo contrario de podar. (4) Verifica el gate ANTES de retirar: quitar una afirmación que nadie vigila no es GC, es perder un hecho ([[M-30]]).
