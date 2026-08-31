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
**Disparador**: el código confía en que la base filtrará («las reglas ya no dejan leer los borradores»),
y las reglas que hacen eso están en el repo, no en producción. **Caso**: la ficha de inmueble no
comprobaba el estado de publicación porque `firestore.rules` tiene `allow get: if resource.data.estado in
[...]`. Pero ese archivo NO estaba desplegado —el ruleset vivo era el del sitio viejo, con `allow read: if
true`— así que un BORRADOR se habría publicado entero, con precio, contacto e indexable. **La distancia
entre `git` y el proyecto de Firebase no la cubre nadie**: no hay gate que compare el ruleset del repo con
el vivo, y el comentario del código describía una frontera que en producción no estaba puesta.
**Reglas**: (1) el invariante que protege un dato se implementa en el CÓDIGO aunque también esté en las
Rules — defensa en profundidad, no delegación; (2) usa la MISMA lista que ya use otro camino (aquí, la
whitelist de estados con la que se construye el índice del catálogo) para que no puedan discrepar;
(3) desconfía de todo comentario que diga «las reglas ya lo impiden» sin decir **desplegadas desde cuándo**.
Portátil a cualquier backend con reglas declarativas (Firebase, Supabase RLS, políticas de S3).
**SEGUNDO CASO, el mismo día (§98.1)**: `lib/data/cache.ts` explicaba desde Ola 0 que la caché del edge se sienta DELANTE del Worker y que por eso un acierto cuesta CERO lecturas — y sobre esa premisa se eligieron todos los TTL del portal. La clave `cache` **nunca se puso en `wrangler.jsonc`**: cada `s-maxage` emitido era inerte y cada visita pagaba sus lecturas. **La clase es la misma y es más ancha que la seguridad**: un comentario describe cómo funciona el sistema, no cómo está configurado. **Regla ampliada**: cuando un archivo explique una premisa de arquitectura —una caché, un índice, un trigger, una política— comprueba que exista la CONFIGURACIÓN que la enciende, y déjalo escrito con la fecha. Barato: `grep` de la clave en el archivo de config, o el esquema del propio proveedor. **Y audita ANTES de encender**: con la caché apagada, una ruta sin cabecera no tenía consecuencia; con la caché encendida, una URL con un token dentro se habría guardado en una caché compartida el mismo día.

---

### L-44 — 🔐 Un ruleset se REEMPLAZA, no se fusiona: dos archivos con el mismo nombre son una trampa silenciosa *(2026-08-21, ADR §100)*
**Disparador**: dos ficheros `firestore.rules` en un mismo repo —uno en la raíz y otro en la carpeta de un
subproyecto— cada uno con su `firebase.json`. **Causa**: Firestore y Storage guardan UN ruleset por
proyecto; el último despliegue **sustituye** al anterior. No hay fusión, no hay aviso, no hay conflicto:
desplegar desde la carpeta equivocada revierte el trabajo de la otra **en silencio**, y el síntoma
aparece lejos —en una pantalla que deja de cargar— y sin nada que lo relacione con el despliegue.
**Y el `deny-all` final del archivo nuevo tumba TODO lo que el viejo declaraba** y él no: colecciones,
subcolecciones y prefijos de bucket que otra parte del sistema sigue usando.
**Reglas**: (1) **un proyecto, un ruleset**: si hay dos archivos, fusiónalos y haz que todas las
configuraciones apunten al mismo — y guarda el anterior como vuelta atrás, no lo borres; (2) antes de
desplegar un ruleset nuevo, **inventaría contra el CÓDIGO qué colecciones y rutas usa cada consumidor
vivo**, no contra una lista de memoria: el `grep` de `collection('x')` es la fuente; (3) **un bucket no
se protege con un candado en la raíz** — `match /{allPaths=**}` con permiso restringido no «añade»
seguridad, TAPA lo que era público (fotos, adjuntos), así que lo privado va en su propio prefijo;
(4) escribe el ORDEN de despliegue dentro del propio archivo si depende de otra cosa (aquí, que los
permisos existieran antes de exigirlos). **Prueba que funcionó**: el emulador con un contexto por rol
Y un adversario autenticado-sin-permisos; sin ese último, el test más importante no existe.

---

### L-49 — La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate puede verla (un botón impecable, muerto en producción)

---

### L-40 — 🚪 «Gateado por el dueño» merece releerse: el gate puede estar en UNA PARTE del alcance, no en todo *(2026-08-21, ADR §94)*
**Disparador**: un ítem lleva meses etiquetado como bloqueado por un dato que solo tiene el dueño, y nadie
lo vuelve a abrir. **Caso**: el Rango ALTORRA figuraba como «necesita los rangos de 10 barrios de Daniel».
Al releer su definición decía **contacto-primero**: el visitante deja sus datos y un asesor devuelve el
número. Sin cifra en pantalla, los rangos **no eran prerrequisito** — la página se construyó entera esa
misma noche, y encima es captación de propietarios, que era la necesidad más urgente del negocio.
**Regla**: antes de aceptar una etiqueta de bloqueo heredada, relee la definición del ítem y pregunta *qué
parte exacta* toca el gate. Un gate sobre el 20% del alcance congela el 100% solo si nadie lo mira.
**Corolario**: al ESCRIBIR un pendiente bloqueado, anota qué queda hacible sin el gate — se lo estás diciendo a alguien que no podrá preguntarte.

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
