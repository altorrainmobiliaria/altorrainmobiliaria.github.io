# 🧨 33a — LA LECCIÓN QUE NO DISPARA (hoja hija de `30-LECCIONES`)

> **Por qué existe esta hoja.** Las cinco de aquí son la misma avería con cinco disfraces: **la
> lección estaba escrita, era correcta y estaba en su sitio — y aun así no protegió.** No hablan de
> lo que el cerebro ignora, sino de lo que **ya sabía** cuando volvió a caer.
>
> 🎯 **La regla que las une**: *una lección solo existe en el instante en que hace falta.* Escribirla
> es la mitad; la otra es que **llegue**, y cada una nombra un eslabón distinto por donde se pierde:
> 1. [[M-11]] — el **pendiente** sigue diciendo lo de antes, y la próxima sesión lee el pendiente.
> 2. [[M-24]] — el **disparador** se redactó por la escena, no por su condición mínima detectable.
> 3. [[M-25]] — la regla no tiene **mecanismo** detrás: escribirla se siente igual que aplicarla.
> 4. [[M-26]] — el **ruteo** solo lleva a ella DESPUÉS de fallar, y entonces ya no evita nada.
> 5. [[M-28]] — el **remedio** cae del lado malo del punto de no retorno: tranquiliza sin proteger.
>
> 🔀 **Vecina, no la misma**: `39-ESCRITO-NO-ES-VIGENTE` es este hueco en el SISTEMA (lo escrito en
> el repo no está desplegado); aquí es el hueco en el **CEREBRO** (lo escrito en la neurona no llega
> a tiempo). Por eso allí viven `L-NN` y aquí `M-NN`.
>
> **El stub `### M-NN` con su título sigue en `30`**, que es el único sitio donde se busca: el kernel
> resuelve las refs contra ese fichero (chequeo #5). El texto está movido **verbatim** (§269.3):
> nada se resumió al mudarse.

---
### M-11 — Escribir la lección NO la aplica: si el PENDIENTE no se re-etiqueta, el cerebro la ignora *(2026-08-21, ADR §94.1 · §96.1 · §97.1)*
Una lección escrita y un pendiente que sigue diciendo lo de antes conviven sin fricción: la próxima sesión lee el pendiente, no la lección. **Cobró TRES veces seguidas.** Regla: al escribir una lección que invalida un pendiente, se re-etiqueta el pendiente **en el mismo commit** — o no se ha aplicado, solo se ha documentado.

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
