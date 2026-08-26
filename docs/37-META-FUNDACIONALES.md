# 🏛️ 37 — META FUNDACIONALES (M-01..M-11) · hoja hermana de `33`

> **Tercer shard de la familia de lecciones**, y nace por la misma razón que los del índice: `33` rozó
> su tope y la respuesta correcta a un nodo lleno de historia CERRADA no es comprimir, es mudar
> (§164). Aquí viven las meta-lecciones **fundacionales** —julio y principios de agosto de 2026—, las
> que establecieron cómo se opera este cerebro. Las **vivas** (hoy, de la M-23 en adelante) siguen en `33`.
>
> **El stub `### M-NN` con su título sigue viviendo en `30`**, que es el único sitio donde buscar: el
> kernel los lee ahí y el gate #5 valida contra ese archivo. Mover el detalle no las saca del cerebro.
>
> **Por qué se citan igual de a menudo aunque sean viejas**: M-05, M-06 y M-07 son la familia de «cómo
> miente un gate», y esa se invoca cada vez que se escribe uno. Estar aquí no es estar jubilada.

---

### M-01 — El tablero `05` se rezaga si el CIERRE no lo re-fresca en el MISMO commit *(auditoría §30, reincidencia de §12)*
**Patrón (reincidente ×2)**: el commit de cierre consolida `10` y los ADRs, y `05` se queda con el estado de la ola ANTERIOR — contradiciendo a `10` sin que nada falle. Ningún gate cruza `05`↔`10`↔git, y la frescura valida una fecha TECLEADA, o sea jugable. **Regla**: todo commit que cierra ola o hito toca `05` en el mismo cambio que `10`; re-sella la fecha, reconcilia §Sub-sistemas y pon `verificado-vivo:` en los claims LIVE (eso sí activa el gate #16). **Corolario**: `10`/`05` NUNCA citan su «último commit `<SHA>`» — el commit de cierre nace DESPUÉS de escribir el nodo.

### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación se AUTOMATIZA, no se promete *(auditoría §33, 2ª reincidencia de M-01)*
**Patrón**: M-01 se escribió, y la clase reincidió igual cinco días después (`05` a 59 commits de `10`), porque la sesión murió por contexto reventado — justo cuando la doctrina pide «consolida antes de cerrar». **Dictamen del comité (unánime)**: el defecto es de DISEÑO, no de disciplina; el sistema exige escribir la memoria AL FINAL, cuando el contexto está más saturado y el modelo menos fiable. Una lección no arregla eso, y M-01 es la prueba. **Regla**: los dolores REINCIDENTES del cerebro se curan con AUTOMATISMOS (hooks de cierre, gates bloqueantes, scripts), nunca con más doctrina always-on — y cada regla nueva del router desplaza una existente.

### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales por-operador: el gate vive EN EL RECURSO *(auditoría §49)*
**Patrón**: «bóveda sin commitear» se curó con un ritual ampliado en la doctrina… y a menos de 48 h la bóveda estaba sucia otra vez, con crudos de otro repo dentro. El ritual es por-operador, pero `brain-private` es UN recurso compartido ×4: basta que uno cierre sin commitear para que el respaldo falle, y el gate #7 es ciego a git POR DISEÑO. **Regla**: los invariantes de un recurso compartido se protegen con un gate EN el recurso (que mire `git -C <bóveda> status`), no con doctrina replicada en N operadores. **Complemento**: quien ENCUENTRE la bóveda sucia la commitea él mismo — respaldo ajeno también se enriquece.

### M-04 — Un ID lo asigna quien escribe, y dos frentes en paralelo colisionan en SILENCIO *(2026-07-28, ADR §68)*
**Patrón**: `L-31`..`L-34` quedaron asignadas DOS veces cada una — el frente técnico y el legal las tomaron el mismo día sin verse. Nadie sobrescribió a nadie: ambas se apendaron (la doctrina manda enriquecer), así que el archivo quedó consistente A LA VISTA y roto en las referencias, con citas apuntando a sentidos contrarios en seis nodos y dos skills. **Por qué pasó**: el ID se elige leyendo «el número más alto que veo» en un archivo de 350 líneas, con el contexto ya cargado, y ningún gate valida unicidad. **Regla**: cuando una familia de conocimiento crece en un frente propio, dale **namespace y hoja propios** (`LD-NN` en `32`) en vez de estirar una secuencia compartida — el namespace hace la colisión imposible; la disciplina, no. **Corolario**: al reparar citas rotas, deja escrito el mapa viejo→nuevo en la hoja nueva, porque la próxima cita rota la escribirá alguien que no leyó ese commit.

### M-05 — Un techo que se mueve para alcanzarlo no es un techo *(2026-08-01, ADR §74-§75)*
**Patrón**: en un solo turno estuve DOS veces a punto de subir un límite en vez de cumplirlo. Bastaba subir el `bootCharsTarget` de un hermano para que «los 3 bajo presupuesto» se cumpliera solo; y un script que declaraba caps **subía automáticamente** cualquier tope que el archivo excediera, incluidos 9 deliberados. **Por qué es insidioso**: las dos veces el resultado inmediato es un ✅ y ningún gate se queja. El límite sigue ahí, el linter pasa, y la deriva que el límite frenaba continúa **con la bendición del gate** — peor que no tenerlo, porque ahora hay evidencia falsa de control. **Regla**: **un cap excedido es la señal de DESTILAR, no de subir el techo.** Un límite solo se sube por una razón que NO sea «hoy no lo cumplo» —cambió el alcance, se midió mal, la neurona absorbió otra— y esa razón se escribe.

### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, y las tres dan ✅ *(2026-08-01, ADR §75-§77)*
**Patrón**: un chequeo nuevo hubo que corregirlo TRES veces, cada una descubierta probándolo y ninguna razonándolo. (1) **No disparaba**: buscaba un texto que el comando real no imprime — teatro puro, y habría quedado como ✅ decorativo para siempre. (2) **Acusaba a un inocente**. (3) **Volvió a acusar** en otro repo, a una skill y a un tag de modelo. Y el mismo día otro gate **quedó obsoleto por el propio arreglo que él provocó**: exigía un campo justo cuando lo correcto pasó a ser no declararlo, así que gritaba precisamente en los repos que ya habían hecho lo correcto.
**Las tres formas de mentir de un gate**, y las tres imprimen verde: **no dispara** cuando debe · **dispara contra un inocente** · **se puede ajustar para que pase** ([[M-05]]).
**Regla**: un gate no está terminado cuando compila, sino cuando lo has visto **(a)** disparar restituyendo el defecto vivo que lo motivó, **(b)** callar con el texto correcto y **(c)** no acusar a un caso legítimo vecino. **Corolario**: al cambiar una doctrina, revisa qué gate la vigilaba.

### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado *(2026-08-01, ADR §81)*
**Patrón**: subí el candado de boot al kernel como bloqueante «×4» y fui a verificar la frase (§3.3). Tres repos tenían `core.hooksPath=githooks`; **`insemastereo` no tenía `pre-commit` en absoluto**. El kernel estaba byte-idéntico en los cuatro ([[M-03]] cumplida), pero un gate compartido tiene **DOS mitades**: el **código** y el **CABLEADO** (`core.hooksPath` + `githooks/pre-commit` + `.claude/settings.json`). El linter validaba la primera y nunca la segunda: ese repo commiteaba sin que nada lo revisara, imprimiendo ✅ en cada corrida. **Su fallo es por AUSENCIA** — no hay línea mala que leer, hay una llamada que nadie hace; variante silenciosa del ✅ decorativo de [[M-06]].
**Regla**: «está en el kernel» ≠ «está activo». Verifica el DISPARADOR **repo por repo** en el mismo cambio y mecanízalo (el **#25** lee `.git/config` y exige un `pre-commit` que invoque a `brain-check`). Todo automatismo tiene un punto de enganche, y el enganche también necesita su gate.

**⚠️ Forma 2 — el gate que le pregunta al VIGILADO si debe vigilarlo** *(2026-08-03, ADR §85, U-13)*. El canario #24 caza que el hook `SessionStart` desaparezca, y decidía si aplicaba leyendo **el propio `.claude/settings.json`**: borras el hook y contesta *amablemente* «no aplica aquí». **Falla ABIERTO ante justo la regresión que existe para cazar. Regla**: la condición de aplicabilidad de un gate NO vive dentro de su objeto vigilado — sube a una declaración aparte y auditable (`harnessCanary` en el manifest), de modo que apagarla sea explícito **y borrarla también avise** (`REQUIRED_KEYS`). Test de bolsillo: *si el atacante es la ausencia de X, ¿mi gate le pregunta a X?*

### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega *(auditoría #6, 2026-08-01/02, ADR §83)*
**Patrón**: lancé la auditoría Nivel-2 #6 como workflow en segundo plano y **falló dos veces, de dos maneras que desde fuera se ven IGUAL**. (1) **Muerte**: el workflow vive DENTRO del proceso anfitrión; al salir éste, sus agentes mueren — avisó. (2) **Cuelgue**: un agente no devolvió NUNCA (37 h) y **nada progresó en 25 h**. Las dos señales disponibles se contradicen y **cada una miente por separado**: el panel decía «En ejecución, 86 agentes» (cierto: vive) y el disco «última escritura ayer 13:03» (cierto: no avanza). Leí solo el disco y lo llamé muerto; el panel solo, y lo habría llamado sano. **Coste de no cruzarlas: 10,9M tokens** ardiendo en un agente colgado.
**Lo que salvó el trabajo** fue algo que yo no diseñé: el `journal.jsonl` persiste **el payload de cada agente en cuanto responde**. Las sondas y los escépticos —lo caro— estaban intactos; lo perdido fue el sintetizador, que es lo barato. Reconstruí los 109 hallazgos y los 136 veredictos leyendo el journal.
**Reglas**: (1) **el paso que consolida no va en el proceso frágil** — si N agentes producen y uno sintetiza, sintetiza TÚ con lo que quedó en disco; (2) **«¿vive?» y «¿avanza?» son dos preguntas y hacen falta las dos**: el contador responde la primera, el reloj de las escrituras la segunda; vivo-y-sin-avanzar es un cuelgue y exige matarlo, no esperarlo — ponle **techo de tiempo por agente**; (3) antes de relanzar, pregunta si los datos ya están en disco. **Corolario**: un contador que no distingue «trabajando» de «muerto a media faena» es un ✅ decorativo con otra ropa ([[M-06]]).

### M-09 — El always-on se ganó por importancia y nunca se perdió por desuso: el criterio es frecuencia × costo de omisión *(2026-08-03, ADR §84)*
**Patrón**: el router llegó al **99,8% del boot** y el diagnóstico escrito en `10` era *"los recortes de
urgencia ya no dan más"*. Al medirlo, el problema no era el estilo: **`§3.1`, `§3.5` y el grueso de `§3.2`
pesaban ~2.2k de 20.4k y gobiernan un sitio RETIRADO**, en un repo cuyo frente vivo es la fundación
operativa. Se auto-cargaban en CADA sesión para no usarse en casi ninguna.
**Por qué el cerebro contribuyó**: había gate para el TECHO (#2) y doctrina para no subirlo ([[M-05]]), pero
**ninguna regla decía qué se gana el derecho a estar siempre cargado**. Con criterio de entrada y sin
criterio de salida, un always-on solo puede crecer: toda doctrina es importante para alguien, y el que la
escribe nunca paga su renta.
**Regla**: lo que se queda en el always-on se decide por **frecuencia de uso × costo de omitirlo**, no por
importancia. Alto costo aunque sea raro (borrar `CNAME`, una query sin `limit()` contra el free-tier) → se
queda. Importante pero de uso episódico (cómo animar un CSS) → **hoja hija + puntero + trigger en §G.2**;
sigue siendo vinculante, deja de cobrar renta en cada arranque.
**Corolario operativo**: antes de mudar una regla, `grep` para saber si es ÚNICA o copia; **NO renumerar
secciones citadas** (`§3.3` lo citan 8 neuronas y 2 scripts); y **corregir en el mismo commit el puntero
que apuntaba a lo movido** — aquí `30` L-04, que mandaba a un `§3.5` ya inexistente. Un puntero roto es una
regla apagada en silencio.

### M-10 — Un gate cubre UNA DIRECCIÓN; la doctrina promete las DOS — y el ✅ se lee como cobertura total *(auditoría #7, 2026-08-20, ADR §90)*
Cuatro hallazgos de la #7 son **la misma falla**, y ninguno lo cazó un gate porque los cuatro estaban en verde:
(a) **#27 rutas fantasma** valida `neurona → archivo inexistente`, pero §G.4 promete *«mueves/**creas**/renombras/eliminas → actualiza `20`»*: el verbo **creas** —el más frecuente, porque nace de trabajar rápido— no tiene gate. 7 páginas del portal quedaron sin documentar bajo un ✅.
(b) **#5 refs `L-`/`M-`** valida que la ref EXISTA, no que sea CORRECTA: `10` citaba `L-34` donde iba `L-39`, y un drill frío confirmó que habría diagnosticado mal. 48/48 «resuelven» ✅.
(c) **la memoria del harness** no la mira **ningún** gate. Por eso dos hallazgos llegaron reincidentes desde la #6: una capa fuera de alcance no produce hallazgos, produce **silencio**, y el silencio se lee igual que un ✅.
(d) **#3 desync del índice** valida `00 → 99`, pero un `§NN` suelto en PROSA no lo mira nadie: el `10` arrastraba un `§195` inexistente — un puntero muerto **dentro del boot**.
**Regla**: al declarar un gate, escribe la **mitad que NO cubre** al lado de la que sí, en su comentario y en la doctrina que lo cita. Un gate sin su complemento declarado no es cobertura parcial: es cobertura **aparente**. Y **toda capa sin gate se declara sin-gate**, o su ausencia de hallazgos se confundirá con salud.

### M-11 — Escribir la lección NO la aplica: si el PENDIENTE no se re-etiqueta, el cerebro la ignora *(2026-08-21, ADR §94.1 · §96.1 · §97.1)*
Una lección escrita y un pendiente que sigue diciendo lo de antes conviven sin fricción: la próxima sesión lee el pendiente, no la lección. **Cobró TRES veces seguidas.** Regla: al escribir una lección que invalida un pendiente, se re-etiqueta el pendiente **en el mismo commit** — o no se ha aplicado, solo se ha documentado.
