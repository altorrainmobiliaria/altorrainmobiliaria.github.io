# 🚧 39 — LO ESCRITO NO ES LO VIGENTE (hoja hija de `30-LECCIONES`)

> **Por qué existe esta hoja.** El repositorio no es el sistema. Entre lo que está escrito —una
> regla, un comentario, una etiqueta de bloqueo, una casilla de la consola— y lo que la máquina hace
> de verdad hay un hueco, y ese hueco **no lo ve ningún gate**: los gates leen el repo.
>
> Las cinco lecciones de aquí son el mismo error con cinco disfraces, y todas se pagaron. Se les da
> casa propia porque `30` estaba a 240/240 líneas y estas cinco se llevaban **52 de ellas**
> (TODO-50 · §269). El texto está movido **verbatim**: nada se resumió al mudarse.
>
> 🎯 **La regla que las une**: *para saber qué está vigente, mide el EFECTO desde fuera — no leas el
> texto que lo describe.* [[L-61]] es el método; las otras cuatro, las formas de olvidarlo.

---

### L-42 — 🚧 Lo que está escrito en un COMENTARIO no está desplegado: reglas, config y premisas de arquitectura *(2026-08-21, ADR §97.6 · §98.1)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-42]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

---

### L-44 — 🔐 Un ruleset se REEMPLAZA, no se fusiona: dos archivos con el mismo nombre son una trampa silenciosa *(2026-08-21, ADR §100)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-44]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

---

### L-49 — La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate puede verla (un botón impecable, muerto en producción) ⇒ **migrada al maestro**: [[INMO:L-49]]

---

### L-40 — 🚪 «Gateado por el dueño» merece releerse: el gate puede estar en UNA PARTE del alcance, no en todo *(2026-08-21, ADR §94)*
⇒ **Migrada al maestro** (F2 lote 5): [[INMO:L-40]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

---

### L-61 — 🔐 Comprobar que las REGLAS están desplegadas, desde fuera y sin credenciales *(26-ago; las reglas → §132·§137)*
Leer las reglas desplegadas no es trivial; **comprobar su EFECTO sí**, y vale más: mide lo que hace el
sistema, no lo que dice su texto. Con la `apiKey` pública (lo es por diseño), un `curl` anónimo a `firestore.googleapis.com/v1/projects/<proj>/databases/(default)/documents/<col>?key=` y a `firebasestorage.googleapis.com/v0/b/<bucket>/o`.
**Lo que confirma que mandan las reglas es el MENSAJE, no el 403**: Firestore dice *«Missing or insufficient
permissions» · PERMISSION_DENIED* y Storage *«Permission denied.»*; una clave restringida o una API apagada
dan otro texto, y una base **sin reglas desplegadas devuelve 200 con documentos**. 🎯 Sirve para re-sellar un
`verificado-vivo` que el gate marcó **en vez de re-sellarlo a ciegas**, que es el vicio que ese marcador caza.

---

### L-69 — 🎭 Retirar un dato de UNA pantalla y dejarlo en otra no es retirarlo: es ESCONDERLO — y el comentario que certifica la retirada lo vuelve invisible *(§270)*
**Disparador**: `index.astro:141` lleva escrito *«La 3ª card ("Penthouse frente al mar", $2.100.000.000) estaba INVENTADA: retirada (§32.23)»*. La card seguía **viva** en `[operacion].astro`, servida en `/comprar`, con su precio y su pin de mapa. Se retiró de la home y sobrevivió en el SERP.
**Por qué sobrevive tanto**: el comentario no solo NO ayuda — **estorba**. Quien audita ve «retirada (§32.23)», lo da por cerrado y no vuelve a buscar; el `grep` que habría encontrado la copia no se llega a escribir. *Una decisión documentada como cumplida deja de auditarse, y ahí es donde una copia puede vivir años.*
**Reglas**: (1) 🎯 **Retirar un dato es un `grep` GLOBAL, no una edición**: antes de escribir «retirada», busca el valor —el precio, el nombre, el identificador— en TODO el fuente y en el HTML **construido**. Si aparece dos veces, la decisión está a medias. (2) **El comentario se escribe DESPUÉS de que el grep dé cero**, nunca antes: al revés se convierte en un sello que nadie vuelve a levantar. (3) ⚠️ **Sospecha de las familias que se duplican por diseño**: una card de demo vive en la home Y en el listado; una regla vive en el repo Y en producción; un texto vive en el fuente Y en el build. (4) Y si el dato es una AFIRMACIÓN (un precio, un nombre de proyecto, una dirección), su borrado merece un gate — el mismo mecanismo de «declárala con su fuente» que ya usan las cifras (§270.2).
