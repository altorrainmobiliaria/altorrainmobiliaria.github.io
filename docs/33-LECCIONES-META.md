# 🪞 33 — LECCIONES META (M-NN) · el cerebro aprendiendo de sus propios fallos

> **Hoja hija de `30-LECCIONES`** (§G.5). El stub `### M-NN` con su título vive en `30` —el kernel los
> lee ahí—; el detalle completo vive aquí. Se llena cuando **el cerebro contribuyó a un error**
> (Reflejo de Autocrítica, §G.4): no es una bitácora de bugs, es el registro de dónde la memoria
> falló como memoria.

---

### M-01 — El tablero `05` se rezaga cuando la realidad avanza si el CIERRE no lo re-fresca en el mismo commit *(auditoría §30, reincidencia de F3/§12)*
**Patrón (reincidente)**: al cerrar una ola/hito, el commit de CIERRE consolida en `10` (WIP) y en ADRs, pero `05` (heartbeat) se queda con el estado de la ola ANTERIOR — su §Sub-sistemas y su sello de fecha **caducan solos** y CONTRADICEN a `10`. La auditoría §12 ya lo cazó (F3: `05` branch stale); reapareció en §30 (F-01: `05` decía "§23-§27" con estancias/turismo "pendientes" cuando ya estaban LIVE). **Por qué el cerebro contribuyó**: `05` es SSoT de estado, pero ningún gate cruza `05`↔`10`↔git en `--boot` y la frescura (#12) valida una fecha tecleada, jugable (K-04). **Regla**: todo commit que cierra ola/hito toca `05` en el MISMO cambio que `10` (frescura pareada, §G.4) — re-sella la fecha, reconcilia §Sub-sistemas, y pon `verificado-vivo: <fecha>` en los claims LIVE (activa el gate #16). **Corolario**: `10`/`05` NUNCA citen su "último commit `<SHA>`" (el commit de cierre nace DESPUÉS de escribir el nodo) → usa "pusheado a `main`" sin SHA. Backstop de linter pendiente → TODO-23 (K-01..K-04).

### M-02 — La disciplina de cierre NO sobrevive a la saturación de contexto: la consolidación debe ser AUTOMÁTICA, no prometida *(auditoría §33, 2ª reincidencia de la clase M-01)*
**Patrón**: M-01 se escribió el 07-12… y la clase reincidió el 07-17 IGUAL (`05` quedó 59 commits atrás contradiciendo a `10`, sello viejo), porque la sesión murió por contexto reventado — exactamente el momento en que la doctrina pide "consolida antes de cerrar". **Diagnóstico del comité (2026-07-18, unánime)**: el defecto es de DISEÑO, no de disciplina — el sistema exige escribir la memoria AL FINAL de la tarea, cuando el contexto está más saturado y el modelo es menos confiable; una LECCIÓN no arregla eso (esta es la prueba: M-01 existía y no evitó nada). **Regla**: los dolores reincidentes del cerebro se curan con AUTOMATISMOS (hooks PreCompact/SessionEnd que vuelcan estado, gates bloqueantes, scripts), NUNCA con más doctrina always-on — cada regla nueva del router debe desplazar una existente (one-in-one-out). Plan concreto → TODO-28 (mejoras #1/#2 del comité; crudo en bóveda `2026-07-18-comite-futuro-cerebro-*`).

### M-03 — Un recurso COMPARTIDO ×4 no se protege con rituales POR-OPERADOR: el gate debe vivir EN EL RECURSO *(auditoría §49, reincidencia de la clase G-02)*
**Patrón**: G-02 (bóveda sin commitear) se "curó" el 07-18 con un ritual ampliado en §G.4… y a <48h la bóveda estaba sucia OTRA VEZ — esta vez con crudos de bersaglio (incluida SU tabla de auditoría Nivel-2, el input de su próxima Sonda 0). El ritual es por-repo/por-operador, pero `brain-private` es UN recurso compartido ×4: basta que UN operador cierre sin commitear para que el respaldo falle, y el gate #7 del linter es ciego a git POR DISEÑO. **Regla**: los invariantes de un recurso compartido se protegen con un gate EN el recurso (hook/check que mire `git -C <bóveda> status`, TODO-23/31), no con doctrina replicada en N operadores. **Gate instalado el mismo día (§49-bis, instance-side)**: `session-handoff.mjs` avisa bóveda-sucia en CADA boot y lo estampa en la foto de cierre; el gate kernel (#7 git-aware) sigue en TODO-23. Complemento: cualquier operador que ENCUENTRE la bóveda sucia la commitea+pushea él mismo (respaldo ajeno = enriquecer, §G.4).

### M-04 — Un ID lo asigna quien escribe, y dos frentes escribiendo en paralelo colisionan en silencio *(2026-07-28, ADR §68 — el cerebro tropezó con su propia [[LD-04]])*
**Patrón**: `L-31`, `L-32`, `L-33` y `L-34` quedaron asignadas **dos veces cada una** — el frente técnico (pieza de humo · Ads Manager · `cloudflare:workers` · Range en Workers) y el frente legal del kit las tomaron el mismo día sin verse. Nadie sobrescribió a nadie: **ambas se apendaron** (§G.4 manda enriquecer, no borrar), así que el archivo quedó consistente a la vista y roto en las referencias. Las citas apuntaban a sentidos contrarios en `10`, `00`, `20`, `31`, `99 §55`/`§66`/`§67` y en dos skills — y `10` usaba los dos sentidos en el mismo archivo. **Por qué el cerebro contribuyó**: el ID se elige leyendo "el número más alto que veo", que es una lectura de un archivo de 350 líneas hecha con el contexto ya cargado; y `brain:check` no valida unicidad. **Regla**: cuando una familia de conocimiento crece en un frente propio, **dale namespace propio y hoja propia** (`LD-NN` en `32`) en vez de seguir estirando una secuencia compartida — el namespace hace la colisión imposible, la disciplina no. **Corolario de [[LD-04]] aplicado a nosotros**: se persiguieron y repararon las citas una por una (6 en `99`/`10` + 1 en la skill `proceso-decision-fuerte`, en sus DOS copias), **y además** se dejó el mapa viejo→nuevo escrito en la hoja nueva — porque la próxima cita rota la escribirá alguien que no leyó este commit. **Backstop determinista pendiente** (chequeo de IDs duplicados en `brain:check`) → TODO-23.

### M-05 — Un techo que se mueve para alcanzarlo no es un techo *(2026-08-01, ADR §74-§75)*
**Patrón**: en un solo turno estuve **dos veces** a punto de subir un límite en vez de cumplirlo. (1) El
`boot-gate` no se podía instalar en los hermanos porque cars iba +2.4k sobre su objetivo — y bastaba subir su
`bootCharsTarget` al valor de hoy para que la condición «los 3 bajo presupuesto» se cumpliera sola. (2) El
script que declaraba los caps de las 44 neuronas sin techo **subía automáticamente** cualquier cap ya
declarado que el archivo excediera: habría elevado en silencio 9 topes deliberados, incluido el del `05` de
cars (2.800c, decisión editorial explícita: *«tablero, no bitácora»*).
**Por qué es insidioso**: las dos veces el resultado inmediato es un ✅ y ningún gate se queja. El límite
sigue ahí, el linter pasa, y la deriva que el límite existía para frenar continúa **con la bendición del
gate**. Es peor que no tener el gate, porque ahora hay evidencia falsa de control.
**Regla**: **un cap excedido es la señal de DESTILAR, no de subir el techo.** Un límite solo se sube con una
razón que NO sea «hoy no lo cumplo» —cambió el alcance, se midió mal al declararlo (§74.3), la neurona absorbió
otra— y esa razón se escribe. Corolario de la Regla de ADMISIÓN (§G.4): un gate que se puede ajustar para que
pase es teatro, igual que uno que nunca dispara ([[M-06]]).

### M-06 — Un gate solo existe si lo has visto DISPARAR: tres formas de que mienta, y las tres dan ✅ *(2026-08-01, ADR §75-§77)*
**Patrón**: escribí el chequeo #17 (*¿el cerebro miente sobre en qué rama estás?*) y **hubo que corregirlo tres
veces** — cada una descubierta **probándolo**, ninguna razonándolo. (1) **No disparaba**: buscaba `rama X` y el
texto real decía «Local `main` == `origin/main`». Teatro puro, y habría quedado como un ✅ decorativo para
siempre. (2) **Acusaba a un inocente**: señalaba a `CLAUDE.md` por «declarar la rama `05`», que es un puntero a
neurona. (3) **Volvió a acusar** en bersaglio, esta vez a una skill (`arquitecto-software`) y a un tag de modelo
(`OPUS-5`), por recoger cualquier backtick de una línea git-ish. Y el mismo día el gate **#4 quedó obsoleto por
su propio arreglo**: exigía que el `05` declarara la caché justo cuando lo correcto pasó a ser que **no** la
declare (la genera el heartbeat), así que gritaba «05 STALE» **precisamente en los repos que ya habían hecho lo
correcto**.
**Las tres formas de mentir de un gate** —y las tres imprimen verde—: **no dispara** cuando debe · **dispara
contra un inocente** · **se puede ajustar para que pase** ([[M-05]]).
**Regla**: un gate no está terminado cuando compila, sino cuando lo has visto **(a)** disparar restituyendo el
defecto vivo que lo motivó, **(b)** callar con el texto correcto, y **(c)** no acusar a ningún caso legítimo
vecino. Sin las tres, lo que tienes es un ✅ decorativo — peor que no tener gate, porque genera confianza falsa.
**Corolario**: un gate puede volverse obsoleto **por el propio arreglo que él provocó**; al cambiar una
doctrina, revisa qué gate la vigilaba (aquí, el #4 vigilaba un campo que la doctrina nueva ELIMINA).

### M-07 — Un gate del kernel solo protege donde su DISPARADOR está cableado *(2026-08-01, ADR §81)*
**Patrón**: subí el candado de boot al kernel para que fuera bloqueante «×4» y, antes de escribirlo, fui a
verificar la frase (§3.3). Tres repos tenían `core.hooksPath=githooks`; **`insemastereo` no tenía
`pre-commit` en absoluto** — corría con los hooks por defecto, vacíos. El kernel estaba byte-idéntico en
los cuatro ([[M-03]] cumplida), pero un gate compartido tiene **DOS mitades**: el **código** (kernel,
byte-idéntico) y el **CABLEADO** (instance: `core.hooksPath` + `githooks/pre-commit` +
`.claude/settings.json`). El linter validaba la primera y **nunca miraba la segunda**, así que ese repo
commiteaba sin que nada lo revisara y todas las corridas imprimían ✅.
**Por qué no se ve**: su fallo es por AUSENCIA — no hay línea mala que leer, hay una llamada que nadie
hace. Variante silenciosa del ✅ decorativo de [[M-06]]: el gate no miente, **nadie lo llama**.
**Regla**: «está en el kernel» ≠ «está activo». Al subir un gate a un recurso compartido, verifica su
DISPARADOR **repo por repo** en el mismo cambio y, si puedes, **mecanízalo**: el **#25** del kernel lee
`.git/config`, resuelve `hooksPath` y exige un `pre-commit` que invoque a `brain-check`. Generaliza: todo
automatismo tiene un punto de enganche, y el enganche también necesita su gate.

### M-08 — El trabajo caro no puede depender de que el proceso sobreviva: escribe el resultado en cuanto llega *(auditoría #6, 2026-08-01/02, ADR §83)*
**Patrón**: lancé la auditoría Nivel-2 #6 como workflow en segundo plano — 10 sondas, un escéptico por
hallazgo, un sintetizador al final. **Murió dos veces**: el workflow vive DENTRO del proceso anfitrión y al
salir éste mueren todos sus agentes. La primera vez avisó; la segunda quedó en silencio y estuve **25 horas
creyendo que trabajaba**, hasta que miré la fecha del último archivo escrito en vez del contador de agentes.
**Lo que salvó el trabajo** fue algo que yo no diseñé: el `journal.jsonl` persiste **el payload completo de
cada agente en cuanto responde**. Las sondas y los escépticos —lo caro— estaban intactos; lo único perdido
fue el sintetizador, que es lo barato. Reconstruí los 109 hallazgos y los 136 veredictos leyendo el journal.
**Reglas**: (1) **el paso que consolida no va dentro del proceso frágil** — si N agentes producen y uno
sintetiza, sintetiza TÚ con lo que quedó en disco; (2) **para saber si un proceso vive, mira el reloj de sus
escrituras, no su contador de tareas**: 13 agentes figuraban "en vuelo" y llevaban un día muertos; (3) antes
de relanzar por tercera vez, pregunta si los datos ya están en disco — relanzar habría re-pagado 7 horas de
cómputo para reconstruir lo que ya tenía. **Corolario**: un contador de progreso que no distingue "trabajando"
de "muerto a media faena" es un ✅ decorativo con otra ropa ([[M-06]]).
