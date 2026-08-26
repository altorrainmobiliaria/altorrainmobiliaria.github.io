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
