---
name: arquitecto-software
description: "Piensa como ARQUITECTO DE SOFTWARE ANTES de escribir o corregir código en webs y apps. Aplica en CUALQUIER trabajo de código no trivial: implementar una feature, corregir un bug con consecuencias, refactorizar, diseñar un módulo o un esquema de datos, decidir cómo se conecta / escala / asegura / integra el sistema. Un buen arquitecto no escribe más código: toma mejores decisiones, pensando en el SISTEMA COMPLETO (negocio, escala a miles de usuarios, seguridad por diseño, costo, mantenibilidad, integración), no en una sola función. GATILLOS: 'implementa', 'construye', 'crea', 'corrige', 'arregla', 'refactoriza', 'optimiza', 'agrega una feature/módulo', 'diseña el esquema/la estructura', 'cómo conecto/escalo/aseguro/integro X', cualquier decisión técnica o de arquitectura. Úsala ANTES de tocar código en tareas con consecuencias de diseño. NO para edits triviales (un texto, un color, un typo) ni tareas que no son de código."
---

# 🏛️ Arquitecto de Software — decide antes de codear

> El código hace que funcione; **la arquitectura hace que sobreviva.** *Un buen arquitecto no escribe
> más código: toma mejores decisiones.* **Piensa en el sistema completo, no en una sola función.**
> *La mejor arquitectura no es la más compleja: es la que genera más valor con menos fricción.*

## Cuándo aplica
ANTES de cualquier trabajo de código NO trivial: implementar, corregir, refactorizar, agregar un
módulo/feature, diseñar un esquema de datos, o decidir cómo se conecta/escala/asegura/integra algo.
Para edits triviales (un texto, un color, un typo) NO hace falta — sería fricción inútil.

## Las 6 lentes — decide CADA cambio por su impacto en:
1. **Negocio** — ¿qué problema real resuelve y qué impacto tiene? Entiéndelo antes de codear.
2. **Escala (miles de usuarios)** — diseña hoy para el crecimiento de mañana: desacoplar, paginar,
   cachear, evitar cuellos de botella. *Escalar no es "más servidores": es diseñar para crecer sin romperse.*
3. **Seguridad por diseño (desde el inicio, NO al final)** — autenticación · autorización (RBAC
   least-privilege) · datos cifrados en tránsito/reposo · validación server-side · secretos fuera del
   código · monitoreo/auditoría. *Un sistema seguro no es más complejo: es más confiable y resiliente.*
4. **Costo** — toda decisión tiene impacto técnico-financiero (infra · rendimiento · mantenibilidad ·
   equipo · escala). *No se trata de gastar menos, sino de invertir mejor.* "Una mala arquitectura se
   siente en el código, se paga en el servidor y la sufre el negocio."
5. **Mantenibilidad** — módulos limpios, desacoplados, fáciles de evolucionar. **Cero monolitos:**
   límites claros, despliegues independientes, bajo acoplamiento.
6. **Integración** — define CÓMO colaboran los servicios, no solo que funcionen. Patrones y **cuándo
   cada uno**: **REST/HTTP** (request-response, el default) · **GraphQL** (el cliente arma su consulta;
   muchas vistas/campos) · **eventos** (desacoplar productor/consumidor) · **colas/mensajería** (trabajo
   pesado/diferido) · **webhooks** (servicios externos: pago, DIAN) · **gRPC** (alto rendimiento entre
   microservicios — solo si el contexto lo justifica). Elegir por **acoplamiento + latencia + costo**, no por moda.

## UX / Arquitectura de Información TAMBIÉN es arquitectura
El panel/producto se diseña **segmentado y ordenado** (jerarquía clara, estados explícitos,
filtros/orden) como un sistema profesional que escala a más módulos — NO features sueltas en un menú plano.

## Procedimiento
1. **Diseña antes de codear.** Para trabajo no trivial, haz un **Impact Analysis** breve (5 puntos):
   (A) archivos a modificar · (B) archivos que quedan INTACTOS (verificado) · (C) código muerto ·
   (D) alcance del refactor · (E) riesgos + rollback + tests.
2. **Decide por las 6 lentes** y **di explícitamente** la decisión de arquitectura + su porqué (qué
   ejes pesaron) antes o junto al código.
3. **Contexto manda — no cargo-cult.** Elige lo que da más valor con menos fricción/costo para ESTE
   sistema. En serverless/free-tier (p.ej. Firebase) la escala horizontal la da la plataforma → NO
   metas microservicios/gRPC/Kubernetes por moda.
4. **Decisión cara de revertir** (arquitectura, modelo de datos, seguridad, integración de pago) = es
   Decisión Fuerte → **Comité ×3** + 2ª opinión externa, y registra el porqué (ADR).

## En tu proyecto activo (consulta el cerebro del repo — NO rutas fijas)
> Skill PORTABLE: funciona en cualquier proyecto. NO hardcodear rutas/§ de un repo (contaminaría a los demás).
- Lee el resumen always-on de arquitectura del `CLAUDE.md` del proyecto activo (sección de doctrinas) + su IAP.
- Si el proyecto tiene una neurona de arquitectura (north-star/charter) o de escalabilidad, léela ANTES
  de moldear un módulo o una fase: **barrido holístico del sistema completo, no la pieza aislada**.
- Seguridad y mapa de código: consulta los lóbulos/neuronas del proyecto vía su `00-INDICE` / `40-LOBULOS-DOMINIO`.

## Modelos de permiso en backends con reglas declarativas (Firebase, Supabase RLS, S3)

Elegir cómo una regla sabe «quién eres» parece una decisión de estilo y es de coste, de alcance y de
tiempo de revocación. Tres cosas que casi nadie mira antes de decidir, y que deciden por ti:

1. **Una regla que hace `get()` SE FACTURA aunque deniegue.** No es un detalle: si tu app deja
   autenticarse a cualquiera —un login social para clientes, por ejemplo— entonces «estar autenticado»
   no es un estado raro, es el estado por defecto de un desconocido. Un bucle desde la consola del
   navegador dispara esa lectura por petición y te vacía la cuota diaria sin conseguir un solo dato.
   Un **claim dentro del token cuesta cero**: viaja firmado y la regla lo lee sin salir a ninguna parte.
2. **Comprueba que el mecanismo alcance a TODAS las mitades.** Las reglas de almacenamiento de archivos
   normalmente **no pueden consultar la base de datos**. Si eliges «la regla mira un documento», acabas
   de dejar fuera el bucket donde viven los documentos escaneados y los adjuntos privados — que suele
   ser lo más sensible que tienes. Un claim sí llega a los dos sitios.
3. **Un token ya emitido no se puede matar.** Revocar refresh tokens, deshabilitar o incluso borrar la
   cuenta impiden RENOVAR, no invalidan lo que ya se entregó: hay hasta una hora de acceso residual. Si
   lo que proteges es LECTURA de datos sensibles, di el número en voz alta y escribe el procedimiento
   de urgencia (desplegar a mano una regla más estricta). «Total, no puede escribir» no es una
   respuesta cuando el activo es la información.

**El patrón que resuelve los tres**: el **documento manda, el token es su espejo**. Una colección de
usuarios es la fuente de verdad —tiene listado, autoría, interfaz y responde «¿quién tiene acceso
hoy?»—, y un trigger deriva de ella el claim. Nadie escribe el claim a mano nunca.

**Y al implementar ese trigger, cuatro cosas que solo aparecen intentando romperlo:**
- **Relee el documento**, no uses el payload del evento: los triggers son *at-least-once* y sin orden
  garantizado, así que un reintento viejo que llegue después de una revocación deja el permiso pegado
  en «concedido».
- **Revoca antes de cualquier corte por idempotencia**: si en una pasada el permiso se escribió y la
  revocación falló, el reintento sale por el early-return y no revoca jamás.
- **Lista blanca, no lista negra**: exige `activo === true`, no `!== false`. Un `"false"` tecleado como
  TEXTO en una consola de administración no puede concederle acceso a nadie.
- **El barrido de huérfanos lleva fusible**: solo corre si el censo salió COMPLETO. Un censo parcial
  —porque una página falló o porque el listado miente en silencio por encima de su tope— jamás puede
  interpretarse como «revócaselo a todos».

**Despliégalo SOLO**, separado del cambio grande que lo motivó. Si no toca las reglas vivas, no puede
romper nada, y el permiso queda verificado en producción semanas antes de que alguien dependa de él.

## Dos escritores sobre el mismo almacén (migraciones y sistemas que conviven)

Casi ninguna sustitución de sistema es un salto: hay un periodo —meses— en el que el viejo y el nuevo
comparten la base de datos. Es la fase donde más barato es equivocarse y más caro es enterarse tarde.

**1. En una base sin esquema, el cast es una promesa que nadie comprueba.** `doc.data() as Modelo`
(o su equivalente en cualquier lenguaje con tipos borrados en runtime) compila perfectamente sobre un
documento del modelo viejo. El resultado no es una excepción: es que el documento **pasa los filtros**
—porque los campos del filtro sí coinciden— y falla más abajo, al leer lo que en su modelo vive en otro
sitio. Síntoma típico: **lista vacía, cero errores, cero logs.** Valida la FORMA en la frontera de
lectura; el cast solo silencia al compilador.

**2. El desajuste de esquema merece su PROPIO motivo de descarte.** Si lo dejas caer en un cubo que ya
existe («sin precio», «sin imagen»), el sistema te da un diagnóstico **falso**: manda a buscar un
precio que sí está, solo que en otra forma. El motivo ES el diagnóstico — la diferencia entre una
respuesta en un minuto y una tarde de depuración el día del lanzamiento.

**3. Detecta por lo que el modelo CIERRA, no por heurísticas.** Enumeraciones (¿está el valor en la
lista?) y tipo de un campo (¿objeto o escalar?) son verificaciones exactas y baratas. «Parece viejo
porque le falta X» envejece mal. Y basta UNA señal para descartar: una migración a medias es tan
inservible como ninguna.

**4. Los descartes se cuentan POR MOTIVO, nunca en total.** «5 omitidas» no responde ninguna pregunta;
`{ "esquema-legacy": 5 }` responde la única que importa. Y guárdalo donde se pueda mirar sin abrir la
consola de logs.

**5. El guardián va en TODOS los lectores, no solo en el que descubriste.** Un almacén compartido suele
tener varias puertas —el listado, la búsqueda por id, un export— y solo una de ellas filtra. La que se
salta el filtro es justo la que sirve contenido de aspecto correcto. Reutiliza el MISMO predicado en
todas: dos lectores que discrepan sobre qué es válido es el bug siguiente.

**6. Adaptar o migrar es una cuestión de VOLUMEN, no de elegancia.** Una capa que traduce el modelo
viejo al nuevo es correcta ante un corpus grande o un escritor viejo que no puedes apagar. Ante un
puñado de registros es sostener dos esquemas para siempre a cambio de ahorrar unas altas a mano —
**escribe la herramienta nueva y migra**. Y hasta que exista esa herramienta, di en voz alta que el
sistema nuevo **no tiene forma de crear datos**: es un requisito del lanzamiento disfrazado de mejora.

## Cuándo NO usar
- Edits triviales sin consecuencias de diseño (un texto, un color, un typo).
- Tareas que no son de código (salvo que haya una decisión de sistema detrás).
