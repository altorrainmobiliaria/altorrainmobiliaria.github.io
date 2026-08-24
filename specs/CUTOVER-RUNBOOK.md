# 🚀 RUNBOOK DEL CUTOVER — encender el portal ALTORRA

> **Qué es esto y por qué existe.** Todo lo que hace falta ya está construido y probado, pero encenderlo
> son **seis fases con dependencias entre ellas**, y hasta hoy vivían repartidas en seis documentos
> distintos (`50-CONFIG-INFRA`, `portal/firebase/README`, y los ADRs §91, §99, §100, §101). Reconstruir
> ese orden de memoria, un día de cutover, con el sitio en producción, es exactamente cómo se rompen
> las cosas. Aquí está en un solo sitio, en orden, con la comprobación de cada paso y su vuelta atrás.
>
> **Regla que gobierna el documento**: cada paso termina con una **verificación con evidencia**, no con
> un «debería funcionar». Si la verificación falla, se aplica la vuelta atrás de ESE paso y se para —
> no se sigue a la siguiente fase «a ver si se arregla solo».
>
> **Quién hace qué**: 🧑 = Daniel · 🤖 = Claude (deploys delegados, `CLAUDE.md §2`). Los pasos de Daniel
> están escritos para alguien que no es técnico: si un paso suyo necesita una terminal, está mal escrito.
>
> Creado el 2026-08-21 (ADR §102). Actualízalo en el MISMO cambio que añada una dependencia nueva.

---

## FASE 0 — Lo que tiene que existir ANTES (gates de Daniel)

Ninguno de estos lo puede resolver Claude. La fase 1 y la 2 se pueden hacer sin ellos; de la 3 en
adelante, no.

| # | Qué falta | Para qué bloquea |
|---|---|---|
| 0.1 | **Inventario real**: al menos unas pocas propiedades para publicar. ⚠️ **Cargarlas en `admin.html` NO sirve** — ver el aviso de la fase 4 | Sin esto el catálogo queda vacío y el portal se estrena sin nada que enseñar (fase 4) |
| 0.2 | **Clave de Resend** + dominio `altorrainmobiliaria.co` verificado en Resend | Sin esto las alertas no mandan ni un correo (fase 3) |
| 0.3 | **Decisión de mover el DNS** Hostinger → Cloudflare | Es el paso final y el único irreversible en horas (fase 5) |
| 0.4 | **Contraseña de aplicación de Gmail rotada** | El aviso de leads por correo. ⚠️ Aplazado por decisión de Daniel; el panel ya enseña los leads sin depender de esto (§101) |

---

## FASE 1 — Permisos de staff *(se puede hacer HOY, aislada de todo)*

**Por qué va primera**: las reglas nuevas leen el permiso de un *custom claim*, y ese claim **no lo
ponía nadie** (§98.5). Si las reglas se desplegaran antes que esto, nadie sería staff y el panel
quedaría inaccesible para todos, Daniel incluido.

**Por qué es segura**: no toca ni una línea de reglas. El ruleset vivo sigue siendo el de siempre, que
ni siquiera lee claims. Nada cambia de comportamiento.

| Paso | Quién | Qué |
|---|---|---|
| 1.1 | 🤖 | ✅ **HECHO 2026-08-24** — pero con alcance ESTRECHADO a propósito: `firebase deploy --only functions:claimsStaffSync,functions:sincronizarClaimsV2 --force`. El `functions:default` del plan habría subido los 11 exports, incluido `processNurturingEmails`, que corre **cada 6 horas** y mandaría seguimientos a leads reales con la contraseña de Gmail aún sin rotar. `--force` fue necesario por el `retry: true` del trigger, y está justificado: `sincronizarClaim` es idempotente y su código documenta por qué. Verificado: `functions:list` da **9**. |
| 1.2 | 🧑 | **← EMPIEZA AQUÍ.** Entrar a **https://altorrainmobiliaria.co/admin.html** → **Usuarios** → pulsar **«Sincronizar permisos del portal»** (el botón se construyó el 2026-08-24: hasta entonces este paso mandaba a pulsar algo que NO EXISTÍA, §126). Sale un mensaje tipo «3 personas sincronizadas». ⚠️ Es lo único que 🤖 NO puede hacer: la callable exige un token de super_admin, y no hay service account en la máquina ni credenciales que Claude deba manejar. |
| 1.3 | 🧑 | Abrir `/gestion` con su cuenta y comprobar que **ve el panel**, no «no tienes permiso». Si sale eso último: cerrar sesión y volver a entrar (el permiso viaja dentro de la sesión). |
| 1.4 | 🤖 | **Estrenar la subida a R2**: con una sesión que ya tenga el claim, `POST /api/media/subir` con una imagen WebP de prueba; debe devolver `201` con la clave, y la foto debe servirse desde el bucket. |
| 1.5 | 🧑 | **Estrenar el alta entera**: `/gestion` → «+ Nuevo inmueble» → rellenar, subir una foto, guardar como **borrador**. Debe salir «Guardado como INM-…». Es la primera vez que ese camino corre completo. |
| 1.6 | 🧑 | **Estrenar GESTIÓN**: `/gestion` → **Expedientes** → abrir uno (código antiguo `ALT-AR-…` basta) → registrar una novedad → moverla a HECHO escribiendo qué se hizo. Debe rechazar el cierre si dejas vacío «Qué se hizo». Son tres Cloud Functions que nunca han corrido. |
| 1.7 | 🧑 | **Estrenar el sello y el export**: en **Inmuebles**, «Pendientes del sello» → **Verificar** la del paso 1.5 (debe rechazarla: un borrador con una foto no se lo ha ganado) → «Exportar CSV» y abrir el archivo en Excel: acentos correctos y columnas en su sitio. |
| 1.8 | 🧑 | **Estrenar la solicitud de estancia** (§122): en `/estancias`, elegir fechas → «Solicitar estas fechas» → nombre, WhatsApp y marcar la autorización → «Enviar solicitud». Debe (a) aparecer el lead en **Gestión → Resumen** con origen `portal-estancias`, y (b) llegarte el correo de `onNewSolicitud` con las fechas dentro. Si el correo llega SIN las fechas, el fallo está en `datosExtra.descripcion`, no en el correo. |

**Verificación**: el paso 1.3 ES la verificación. Además 🤖 comprueba en los logs que
`claimsStaffSync` corrió sin errores.

⚠️ **Por qué los pasos 1.4 a 1.7 están aquí y no se dan por hechos** (§107.5, §108): la subida a R2 tiene 30 pruebas
alrededor —incluidas las del token, con firma RSA de verdad— pero **el `put` contra el bucket real
nunca ha corrido**, porque hasta este momento no existía forma de tener un token con el claim. Un
camino que nunca se ha ejecutado no está probado, por muchos tests que lo rodeen. Este es el primer
instante en que se puede comprobar, así que se comprueba aquí. Lo mismo vale para el alta completa
(1.5): su dominio tiene 268 pruebas y su pantalla se verificó en el navegador, pero **escribir en
Firestore con un claim de verdad no ha ocurrido nunca**. Y lo mismo, por la misma razón, para las
cuatro puertas de escritura nuevas (1.6 y 1.7): `crearExpediente`, `crearNovedad`,
`actualizarNovedad` (§118) y el sello `marcarVerificada` (§119). El **1.8** es de otra clase: la solicitud de
estancia SÍ se probó entera en local —los tres rechazos del servidor y la pantalla completa con la red
simulada— pero el `create` contra `solicitudes` **no se ejecutó a propósito**: dispara el correo real de
`onNewSolicitud`, y meter un lead falso en la bandeja de Daniel para verificar un formulario es pagar la
prueba con su tiempo. Se estrena aquí, una vez, sabiendo lo que se hace. El paso 1.6 pide **provocar el
rechazo** —cerrar sin escribir la resolución— porque un gate que nunca se ha visto negar algo
tampoco está probado: es la mitad del camino que suele quedarse sin recorrer.

**Vuelta atrás**: `firebase functions:delete claimsStaffSync sincronizarClaimsV2`. Los claims ya puestos
no molestan a nadie: hoy nada los mira.

---

## FASE 2 — El ruleset fusionado *(solo si la fase 1 quedó verde)*

**El riesgo real**: hasta §100 había dos rulesets con el mismo nombre y desplegar el del portal
**mataba `admin.html`**. Ahora hay uno solo y fusionado, con 55 pruebas de emulador detrás — pero sigue
siendo el paso que toca todos los datos del negocio.

| Paso | Quién | Qué |
|---|---|---|
| 2.1 | 🤖 | Desde la raíz: `firebase deploy --only firestore:rules,storage --account altorrainmobiliaria@gmail.com` |
| 2.2 | 🧑 | Entrar a `admin.html` **inmediatamente después**: iniciar sesión, abrir Propiedades, abrir Leads. Si algo dice «Error inesperado», avisar YA. |
| 2.3 | 🧑 | Abrir `/gestion` y comprobar que la bandeja de leads carga. |

**Verificación con evidencia**: el login del panel legacy es el canario — su rate-limiting se escribe
ANTES de tener sesión, así que si el ruleset se equivocara ahí, el síntoma sería «Error inesperado»
justo después de autenticar bien.

**Vuelta atrás (2 minutos)**: los rulesets anteriores están en `_legacy/firestore.rules.PRE-FUSION` y
`_legacy/storage.rules.PRE-FUSION`. Se copian sobre los actuales y se re-despliega el mismo comando.

---

## FASE 3 — Cloud Functions del portal

| Paso | Quién | Qué |
|---|---|---|
| 3.1 | 🧑 | Verificar el dominio en Resend y entregar la clave (gate 0.2) |
| 3.2 | 🤖 | `firebase functions:secrets:set RESEND_API_KEY` |
| 3.3 | 🤖 | `firebase deploy --only functions:portal --config portal/firebase/firebase.json` |

Esto despliega el rebuild del catálogo (`catalogoOnPropiedadWrite`, `catalogoBarrido`,
`catalogoRepublicar`) y el digest de alertas (`alertasDigest`).

**Verificación**: 🤖 comprueba en los logs que el barrido corre; el digest solo se podrá comprobar de
verdad cuando haya catálogo y una alerta con novedades.
⚠️ **Cloud Scheduler**: estas dos funciones consumen **2 de los 3 jobs gratuitos**. Queda uno.

**Vuelta atrás**: `firebase functions:delete` de las que fallen. No afectan al sitio público.

---

## FASE 4 — Catálogo real

> ⛔ **AVISO — el panel viejo NO sirve para cargar el catálogo del portal (§103).** `admin.html` y el
> portal escriben la MISMA colección `propiedades` con modelos **incompatibles**: el viejo deja el
> precio como un número entero, la operación como `comprar/arrendar/dias` y los datos planos; el portal
> espera el precio como objeto, la operación como `venta/arriendo/alojamiento` y `geo`/`specs`
> anidados. Una propiedad creada en `admin.html` **pasa el filtro de publicadas y luego se cae**: el
> índice sale vacío, el SERP dice «no hay resultados» y no se registra ningún error.
>
> Desde §103 esa omisión se reporta con el motivo `esquema-legacy` (en el log y en el doc de control,
> campo `omitidasPorMotivo`), así que el diagnóstico es inmediato — pero **el catálogo sigue vacío**.
> **El portal necesita su propio alta de propiedades (TODO-44) antes de que esta fase pueda hacerse.**

| Paso | Quién | Qué |
|---|---|---|
| 4.1 | 🧑 | Cargar las primeras propiedades **desde el panel del portal** (TODO-44), o entregárselas a Claude para sembrarlas |
| 4.2 | 🤖 | Comprobar que `indices/catalogo-*` se pobló (lo escribe la Function de la fase 3) |
| 4.3 | 🧑 | Poner la variable de repositorio **`PORTAL_CATALOGO_SOURCE = live`** |
| 4.4 | 🧑 | Poner **`PORTAL_MEDIA_BASE`** con la URL pública del bucket R2 |
| 4.5 | 🤖 | Empujar cualquier cambio a `main` para que el CI reconstruya con esas variables |

**Verificación**: el SERP de `/comprar` muestra los inmuebles REALES, y una ficha abre por su URL
`/inmueble/<slug>`. Si las fotos salen rotas, es 4.4 (§97.7). **Si el SERP sale vacío**, mira
`omitidasPorMotivo` en el doc de control antes de tocar nada: dice exactamente por qué.

**Vuelta atrás**: devolver `PORTAL_CATALOGO_SOURCE` a `demo`. El portal vuelve a las cards de muestra.

---

## FASE 5 — Indexable y DNS *(el punto de no retorno)*

⚠️ **El error que este runbook existe para evitar**: el portal indexa **solo** con
`PUBLIC_SITE_ENV=production`; por defecto sale `noindex` + `Disallow: /`. Correcto en staging,
**catastrófico en el dominio real** — Google desindexa y el sitio se ve perfecto. Hasta el 2026-08-21
esa variable no se declaraba en NINGÚN sitio del repo (§91 la cazó, §102 la cableó al CI).

| Paso | Quién | Qué |
|---|---|---|
| 5.1 | 🧑 | Poner la variable de repositorio **`PORTAL_SITE_ENV = production`** |
| 5.2 | 🤖 | Empujar a `main` y comprobar que el CI queda VERDE. Si `verify:build` falla, es el candado #6 haciendo su trabajo: **no se sigue** |
| 5.3 | 🧑 | Mover el DNS de `altorrainmobiliaria.co` de Hostinger a Cloudflare |
| 5.4 | 🤖 | `curl -s https://altorrainmobiliaria.co \| grep -i noindex` → **vacío**, y `/robots.txt` sin `Disallow: /` |
| 5.5 | 🤖 | Comprobar una muestra de los 301 del sitio viejo (68 URLs mapeadas) |
| 5.6 | 🧑 | En Search Console: **reenviar `sitemap.xml`** |

**⛔ NO borrar `googlec4e47cae776946d9.html`** (verificación de propiedad de GSC).
**⛔ NO disparar `og-publish.yml`**: en modo obra pisaría los stubs de redirect.

**Vuelta atrás**: devolver `PORTAL_SITE_ENV` a `staging` y volver a empujar. El DNS es lo único que
tarda horas en revertirse — por eso va al final, cuando todo lo demás está verificado.

---

## FASE 6 — Después de encender

- **Fichas al sitemap**: hoy `sitemap.xml.ts` no las incluye porque el índice está vacío. Con catálogo
  real se derivan del índice, igual que las zonas se derivan de `ZONAS`. Y **hay que RE-enviar el
  sitemap en GSC** cada vez que entren URLs nuevas.
- **Purga por tag**: mientras no exista, la ficha usa un TTL corto (5 min) y un despliegue invalida la
  caché. Cuando exista, se vuelve al TTL largo y se borra `CACHE_CONTROL_FICHA_SIN_PURGA`.
- **Vigilar el free-tier los primeros días**: es la primera vez que el catálogo real recibe tráfico.

---

## Checklist

Se marca con la EVIDENCIA al lado, no con fe.

- [ ] F1 · claims desplegados y sincronizados — *evidencia*: Daniel ve el panel en `/gestion`
- [ ] F2 · reglas fusionadas desplegadas — *evidencia*: `admin.html` entra y abre Propiedades y Leads
- [ ] F3 · Functions del portal + secreto de Resend — *evidencia*: logs del barrido sin errores
- [ ] F4 · catálogo real visible — *evidencia*: `/comprar` con inmuebles reales y una ficha que abre
- [ ] F5 · sitio indexable y DNS movido — *evidencia*: `curl` sin `noindex` y `robots.txt` sin `Disallow: /`
- [ ] F6 · sitemap con fichas y reenviado en GSC — *evidencia*: contador de URLs descubiertas en GSC
