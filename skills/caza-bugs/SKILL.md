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
