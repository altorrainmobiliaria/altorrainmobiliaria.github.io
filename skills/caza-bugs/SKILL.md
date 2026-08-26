---
name: caza-bugs
description: Usar al TOCAR o ROZAR un subsistema con estado observable (render, listener/onSnapshot, CRUD, flujo de pasos) — editarlo, refactorizarlo con cambio de comportamiento, o cambiar el estado compartido (doc de base de datos, sessionStorage, caché) que otro flujo lee — ANTES de darlo por bueno. Recorre su CAMINO VIVO end-to-end, en especial las dos fronteras del estado-cero (crear el 1er ítem y verlo aparecer; borrar el último y ver colapsar limpio), no solo el cambio puntual. Encapsula el reflejo barato siempre-on y la escalera de escalado calibrada (revisión adversarial + comité + consejo externo) sin gastar de más en lo trivial. NO es para depurar un fallo ya reproducible (eso es systematic-debugging) ni para el gate de evidencia del claim final (verification-before-completion). Triggers — "verifica que no rompí nada", "probé el cambio pero no el flujo", "edité X y lo di por bueno", "esto se rozó con Y", "antes de cerrar/commitear esta funcionalidad".
---

# 🐛 Caza-bugs — recorrer el camino vivo de lo que tocas, no solo tu diff

> Nace de un bug real: edité un módulo de render bajo UNA lente, lo di por bueno, y nunca
> probé "crear el 1er ítem → ¿aparece?". El bug solo emergía desde CERO ítems. La lección no
> fue "faltó maquinaria pesada" — fue que faltó el chequeo BARATO de 30 segundos.
> PORTABLE: cero rutas de un repo; adapta al stack del proyecto activo (lee su cerebro).

## 0. Cuándo aplica / cuándo NO
- **SÍ**: al MODIFICAR o ROZAR un subsistema con estado observable por el usuario.
- **NO**: un bug YA reproducible → `systematic-debugging`. El claim final "hecho/pasa" →
  `verification-before-completion`. Edit trivial sin camino de usuario (copy, color, refactor
  puro sin cambio de comportamiento).

## 1. La Ley (siempre-on, casi gratis)
Toco/rozo una pieza → mi unidad de verificación es el **CAMINO VIVO end-to-end que pasa por
ella**, NO "mi cambio quedó como yo quería". Mirar la pieza con una sola lente (la del cambio)
es exactamente como se escapan los bugs.

## 2. Checklist del estado-cero (el filo — lidera con esto)
La clase de bug nº1: el contenedor se **ACTUALIZA** pero nunca se **CREA** cuando arranca vacío.
Recorre las **dos fronteras** + la carrera de carga:
- **vacío → 1**: crea el 1er ítem. ¿Aparece en vivo? ¿Persiste tras **recarga dura**? (el 1er
  paint suele ser async-vacío — si el render no monta el contenedor vacío, el refresh no puede
  crearlo y el ítem nunca aparece).
- **N → vacío**: borra el último. ¿La vista colapsa limpio, o queda un contenedor/encabezado
  huérfano?
- **carrera de carga**: ¿el listener puede llegar ANTES de que monte el DOM? ¿doble render por
  dos listeners?
Los demás estados (lleno, idempotencia/re-montar) son secundarios; no diluyas el filo en una
lista de QA genérica.

## 2b. Checklist del DINERO (obligatorio si el subsistema mueve plata)
Nace de un bug REAL (traslado duplicado de $5.6M, 2026-07-09): el camino vivo del dinero tiene
fronteras propias que el checklist visual no cubre. Si el diff toca caja/pagos/stock/saldos:
- **Ida-y-vuelta con recarga**: haz la operación → navega a OTRA página → VUELVE (recarga
  completa). ¿La UI pide repetir la operación? ¿El estimado cuadra? (El bug real: 4 listeners
  llegaban en desorden al recargar y el modal pedía trasladar de nuevo lo ya trasladado.)
- **Foto incompleta**: ¿alguna decisión AUTOMÁTICA (modal, bloqueo, alerta, cálculo) se dispara
  con datos a medio llegar? Toda automatización sobre datos remotos exige un gate de "fuentes
  listas". Los botones manuales pueden ser optimistas; lo automático NO.
- **Conservación**: después de cada operación, suma las tres vistas del mismo peso — UI
  estimada, sello/ecuación del servidor y ledger. ¿Dan el MISMO número? Un descuadre entre
  vistas es el bug, aunque cada vista "se vea bien" sola.
- **El camino de deshacer**: anula/reversa/cancela la operación recién hecha. ¿TODAS las vistas
  se netean (no solo una)? (Bug real #2: la reversa arreglaba la bóveda pero el cierre del turno
  seguía contando el fantasma.) ¿Deshacer dos veces está bloqueado?
- **Negativos a la vista**: fuerza un estado imposible (deshacer tras mover el dinero). ¿El
  número negativo SE VE en rojo, o un formateador lo recorta a $0 y esconde la anomalía?
- **Doble sesión**: la misma operación desde dos pestañas/sesiones. ¿Idempotencia real o
  duplicado con id nuevo?
Donde caces uno, blíndalo con un test de integración del ESCENARIO completo (no del paso).

## 3. "Rozar" — el disparador (con su frontera)
- **SÍ dispara** si mi diff cambia una entrada/salida/contrato, **O el estado compartido** (doc
  de BD, sessionStorage, caché) que **otro** subsistema lee — aunque no edite su archivo.
- **NO dispara**: color, copy, refactor puro sin cambio de comportamiento, edición mecánica.
- **Alcance (regla de parada, anti-infinito y anti-atrofia)**: recorre hasta el primer punto
  donde el usuario VE el efecto de mi cambio, **+ un salto a quien comparte mi estado**. No el
  producto entero; tampoco solo mi pantalla (ese fue el error original).

## 4. Ejecutar > razonar — y donde lo caces, blíndalo
Prefiere **EJECUTAR** el camino (emulador / preview / correr el flujo) sobre razonar que
"debería funcionar" — razonar fue lo que falló. Donde el preview no pinte lo dinámico, traza el
flujo por código de forma **adversarial** (¿qué monta el nodo? ¿quién dispara el refresh? ¿en
qué orden?), no una sola pasada complaciente. **Donde caces el bug, blíndalo con un test del
estado-cero** (p. ej.: `renderX()` con 0 ítems emite el contenedor que `refreshX()` puede
poblar) vía `test-driven-development` — ese test es el único gate mecanizable real.

## 4b. 🔇 El fallback SILENCIOSO — el bug que se disfraza de "funciona"
Un `catch {}` vacío o un `on('error', () => {})` puesto "para degradar con elegancia" **no degrada:
OCULTA**. La UI muestra el estado de reserva, nadie ve un error, y el sistema queda en un fallo
PERMANENTE que además se documenta como verdad ("solo falta X"). Caso propio 2026-08-20: el basemap
de un portal llevaba semanas sin pintar y el estado registraba «falta solo la vista en foreground»;
el error real (`There is no tile manager with ID …`) solo apareció al añadir un `console.error` en DEV.
**⚠️ Antes de culpar a una librería, comprueba `document.visibilityState`**: en una pestaña `hidden`
(y toda pestaña automatizada suele estarlo) Chrome congela `requestAnimationFrame` → mapas, canvas,
WebGL y animaciones **nunca completan su carga** y producen síntomas idénticos a un bug real, con
errores internos incluidos que parecen la causa. Caso propio 2026-08-20: 4 cambios de dependencia
probados contra un "bug" que era una pestaña oculta. **Bisecciona hacia abajo hasta el caso mínimo**
(un estilo sin fuentes, un canvas que solo pinta un color): si el mínimo TAMPOCO funciona, el problema
no está donde crees. Y si el mismo síntoma sobrevive a **dos versiones mayores distintas** de la
librería, la hipótesis es errónea, no la versión.

**Reglas**: (1) todo fallback **grita en DEV aunque calle en PROD** — silenciar es una decisión de UX,
nunca de observabilidad; (2) al auditar un subsistema con modo degradado, busca **la señal binaria que
distingue vivo de fallback** (aquí: la clase `.is-live` que el propio código añade) y compruébala — no
juzgues por captura de pantalla, porque el fallback se ve BIEN; (3) si el código no expone su estado,
**añade una sonda gateada por DEV** antes de seguir adivinando; (4) desconfía de un estado que diga
"verificado" sin decir QUÉ se verificó: aquí se había verificado el SERVIDOR de tiles, no el render.

## 4c. 🕳️ El camino que el JS TAPA — el fallback que nadie ejecuta jamás
Un formulario progresivamente mejorado tiene DOS caminos: el `fetch` de la isla y el POST nativo del
navegador. Al probar en un navegador **siempre corre el primero**, así que el segundo puede llevar
meses roto sin que ninguna verificación lo note — y es justo el que atiende a quien tiene el JS
bloqueado, la red a medias o un bot de accesibilidad. **Ejercítalo con `curl`**, que es lo único que
lo dispara de verdad:
- POST nativo = `Content-Type: application/x-www-form-urlencoded` **y** cabecera `Origin` del propio
  sitio. Sin `Origin` muchos frameworks (Astro, SvelteKit, Next con Server Actions) devuelven **403**
  por su comprobación anti-CSRF, y ese 403 se confunde con un bug tuyo: no lo es, es que `curl` no
  simula un navegador salvo que se lo digas.
- Espera un **303 con `Location`**, no un 200: el patrón correcto es POST-Redirect-GET (un F5 no
  puede reenviar el formulario).
- Comprueba que el redirect **conserva el contexto** (la búsqueda, los filtros, lo ya escrito). Un
  error que devuelve el formulario en blanco pierde al usuario igual que un fallo.

**Y desconfía del middleware que toca TODAS las respuestas.** Una cabecera añadida a cada respuesta
(noindex de staging, request-id, CORS) alcanza también a las respuestas que el framework fabrica, y
algunas son **inmutables** por el estándar Fetch — `Response.redirect()` y `Response.error()` nacen
con las cabeceras congeladas y cualquier `set()` **lanza**. Resultado: 500 en todo endpoint que
redirija, o sea exactamente el fallback sin JS. Si además la cabecera solo se añade fuera de
producción, el 500 aparece **solo en staging**, que es donde se verifica todo. Patrón seguro:
`try { headers.set(...) } catch { reconstruir la Response con Headers nuevas }`.

**Regla portable**: cuando un subsistema tenga un camino A (el que usa la gente con todo funcionando)
y un camino B (degradado, de error, sin JS, sin permisos), **B no está probado hasta que lo hayas
disparado tú**. Enuméralos antes de cerrar: es una lista corta y casi siempre hay uno que nadie ha
ejecutado nunca.

## 4d. 🚧 La defensa que vive en la CONFIGURACIÓN y no en el código
Un comentario que dice *«esto no puede pasar, las reglas ya lo impiden»* apunta a un archivo del repo,
y lo que corre en producción es **el que está desplegado**. Entre los dos no hay nada: ningún gate
compara el ruleset del repo con el vivo, así que la diferencia no produce error, produce **confianza**.
Caso propio (2026-08-21): una página no comprobaba el estado de publicación de un registro porque las
Security Rules filtraban por estado — y esas reglas llevaban semanas sin desplegarse; el ruleset vivo
era el anterior, con lectura abierta. Un borrador se habría publicado entero, con precio y contacto, e
indexable.
**Comprobación**, no razonamiento: pregúntale al proveedor qué hay desplegado (`firebase deploy --only
… --dry-run`, la consola, `terraform plan`, el panel del CDN) y compáralo con el archivo. Si no puedes
comprobarlo en el momento, **asume que NO está** y pon el invariante también en el código.
**Regla portable**: el invariante que protege un dato se implementa en el código *aunque* también viva
en la configuración — defensa en profundidad, no delegación. Y reutiliza la MISMA lista que ya use otro
camino del sistema (aquí, la whitelist de estados con la que se construye el índice del catálogo), para
que las dos no puedan discrepar. Aplica igual a Firebase Rules, RLS de Supabase, políticas de bucket,
reglas de WAF y CORS del CDN.

## 4e. 🔑 Identificadores que se derivan de la presentación
Antes de cambiar el formato de una URL, busca quién la está PARSEANDO. Es un patrón silencioso:
guardas algo con una clave sacada de la dirección (`?id=`, un segmento del path) y el día que la
dirección cambia, todo lo guardado deja de reconocerse — sin error, sin log, y con la interfaz
pintándose perfectamente. Caso propio: los favoritos en `localStorage` sacaban su clave del `?id=` del
enlace de cada tarjeta. **Regla**: la clave de persistencia sale del DATO (un atributo que pone quien
conoce el registro), nunca de parsear la presentación; y un *slug* tampoco sirve, porque cambia al
corregir una tilde del título. Aceptar el formato viejo además del nuevo evita romper a partir de hoy,
pero **no reconstruye lo que ya se perdió**: por eso se arregla la fuente, no solo el lector.

## 4f. ✅ El ÉXITO que no está cableado — el peor de los fallos silenciosos

Un `mostrarExito()` conectado a nada: el botón revela el mensaje de confirmación y **no envía**. Es
la forma más dañina del fallback silencioso (§4b), porque las otras solo fallan — ésta **miente**, y
quien se lo cree es una persona esperando una respuesta que no va a llegar.

- **Dónde vive**: en réplicas de mockup y prototipos que se dieron por terminados. El mockup pintaba
  el estado de éxito para enseñarlo, y al implementar quedó el `hidden`/`removeAttribute` como si
  fuera el comportamiento. Nadie lo nota porque **la pantalla hace exactamente lo que se espera**.
- **Cómo cazarlo, en un minuto**: por cada mensaje de éxito de la interfaz, busca su emisor y sigue
  el hilo hasta una llamada de red o una escritura. `grep` de los ids de confirmación contra `fetch`
  / `submit` / el cliente de datos. Si el hilo se corta antes, es un éxito de mentira.
- **La misma sonda en negativo**: ¿qué mensaje sale cuando el envío FALLA? Si no existe ninguno,
  probablemente tampoco existe el envío.
- **Al arreglarlo, arregla también el TEXTO.** Si el flujo no es lo que el mensaje promete
  («reserva confirmada» cuando es una solicitud), cablearlo sin tocar la copia sustituye una mentira
  técnica por una comercial.

## 4g. 🕹️ El control que NO RESPONDE — hermano del éxito no cableado

Un botón o un enlace que nadie escucha. No falla, no avisa, no ensucia la consola: se pulsa y **no
pasa nada**. Si §4f miente diciendo que algo salió bien, éste no dice nada — y el silencio se
interpreta igual de mal: *«esto está roto»*, no *«esto todavía no existe»*.

- **Dónde vive**: menús laterales de paneles (secciones planeadas y no construidas), «Ver todo →»
  junto a tablas topadas, y cualquier `<a href="#">` que en realidad quería ser un botón. Casi
  siempre viene del mockup: allí el menú tenía siete entradas porque el diseño las imaginaba todas.
- **Cómo cazarlo, con un barrido**: por cada `<button>` y cada `<a href="#">`, comprueba si alguien
  lo BUSCA por su `id`, su clase o su `data-*`. Se automatiza en 60 líneas y encuentra en minutos
  lo que a mano no se ve nunca.
- **⚠️ Y el barrido tiene tres trampas** — las tres son «buscar al oyente donde no mira nadie», y las
  tres producen falsos positivos que matan el gate antes de que sirva:
  1. **El CSS no escucha.** Si lees el archivo entero, una regla `.mi-clase { … }` del `<style>`
     hace pasar por cableado a un control que no lo está. Mira SOLO el `<script>`.
  2. **Mencionar no es escuchar.** `el.className = 'mi-clase'` es una asignación. Solo cuentan los
     contextos donde la clase SIRVE PARA ENCONTRAR el elemento (`querySelector`, `closest`,
     `matches`, `getElementsByClassName`).
  3. **La delegación existe.** Medio panel puede estar cableado con un único oyente en el documento
     que pregunta `e.target.closest('#miBoton')`. Sin esa rama acusarás a controles perfectamente
     vivos.
- **Tres salidas legítimas, y el silencio no es una**: cablearlo · quitarlo · o dejar que **diga** por
  qué todavía no puede hacer nada, y dónde se hace hoy esa tarea. La tercera es la que se olvida, y
  suele ser la correcta cuando la sección es real pero futura.
- **Regla del gate, y vale para cualquier gate**: corrige sus **falsos positivos ANTES de encenderlo**.
  Un gate que acusa a un inocente se desactiva solo —en la cabeza de quien lo lee— y el día que grite
  de verdad, nadie mira.

## 4h. 👻 El ancla que no aterriza — y el hueco ENTRE dos gates

Primo de §4g, pero se escapa de su red: `href="#seccion"` cuyo `id` **no existe en la página de
destino**. El navegador no protesta ni ensucia la consola; se queda exactamente donde está. Para
quien lo pulsa no es un error, es *«esta web no responde»* — y es peor que un 404, porque un 404 al
menos se ve.

- **Dónde vive**: en el header y el pie, o sea en TODAS las páginas a la vez. Casi siempre nace del
  mockup, que dibujó el enlace como `href="#"` porque el destino aún no estaba decidido; alguien le
  puso después un nombre plausible (`#nosotros`, `#servicios`) y nadie comprobó que existiera.
- **Cómo cazarlo**: por cada `<a href="#x">` o `<a href="/ruta#x">` del **HTML construido**, mira si
  `id="x"` (o `name="x"`) está en el HTML de esa página. No hace falta red ni navegador: el destino
  está dentro del archivo que ya tienes abierto. Si la ruta destino se sirve en el servidor y no hay
  HTML que abrir, **no lo juzgues** — un gate que adivina, miente.
- **Agrupa el informe por ANCLA, no por página.** Un `#x` roto en un componente compartido son 74
  filas idénticas, y el informe deja de leerse justo cuando más hay que leerlo.

### Las tres lecciones transferibles (valen para cualquier proyecto)

1. **El defecto vive en la JUNTURA de dos gates, no dentro de ninguno.** Un gate miraba rutas
   `/algo`; el otro, el `href="#"` literal. Nadie miraba `href="#algo"`. Al auditar una red de
   verificación, no preguntes *«¿es profundo cada gate?»* sino **«¿qué cae entre dos?»** — dibuja el
   universo de casos y marca cuál gate cubre cada uno. Los sistemas de verificación fallan más por
   solapamiento incompleto que por falta de profundidad.
2. **Una exclusión MAL RAZONADA envejece peor que una sin razonar.** La cabecera del gate justificaba
   por escrito dejar las anclas fuera «porque comprobarlas exige red». Era cierto de los enlaces
   externos y se extendió al ancla sin volver a mirarlo. Nadie la re-cuestionó **porque parecía ya
   pensada**. Cuando leas el `ALCANCE` de un gate, trátalo como una hipótesis a refutar, no como
   documentación: cada exclusión debe nombrar el caso que excluye y por qué ESE caso.
3. **Cuando el defecto vive en un componente compartido, la medición AGREGADA es el único ángulo que
   lo revela.** Buscar el síntoma conocido a mano encuentra una instancia; contar todas las
   ocurrencias del patrón contra su condición de validez encuentra el sistema entero. Aquí: buscar
   `#nosotros` daba un ancla; medir las 664 anclas del build dio **468 enlaces muertos en el menú
   principal**, que nadie iba a buscar. *Si acabas de encontrar una instancia de un patrón, mide el
   patrón antes de arreglar la instancia.*

## 5. Escalar (no gastar de más — CITA a los dueños, no redefinas)
- **N0 — reflejo barato (default, ~90%)**: el checklist §2 + auto-crítica de una pasada. Lo
  trivial se queda aquí; subir "por si acaso" es gastar peor.
- **N1 — maquinaria pesada (SOLO no-trivial / caro de revertir)**: el bug toca dinero/datos/
  seguridad, cruza varios subsistemas, el síntoma no encaja, o es caro de revertir →
  `systematic-debugging` (síntoma no encaja) → `dispatching-parallel-agents` / fan-out
  adversarial (multi-subsistema) → `comite-expertos` + consejo externo para DECISIÓN con
  consecuencias. El criterio de "cuándo comité" lo manda la doctrina del proyecto, no esta skill.
- **Freno**: 2 fallos en el MISMO bug → DETENTE, busca el caso análogo en el historial antes del
  3er intento (prohibido adivinar).

## 6. Salida
Un veredicto **concreto y citable**, no un "OK" genérico:
`camino vivo recorrido: [vacío→1 OK · N→vacío OK · recarga OK]` — o `FALLA en [estado]`. Si
escalé, a qué nivel y por qué.
