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
| 1.4 | 🧑 | **Estrenar la subida a R2 — REASIGNADO (§140).** Venía marcado 🤖 y **es imposible para 🤖**: el endpoint exige un ID token de Firebase con el claim `admin`, verificado contra las claves de Google, y no hay forma honesta de que Claude obtenga uno (no maneja credenciales del dueño, §124). Un paso asignado a quien no puede hacerlo es un paso que no ocurre nunca. **No hace falta por separado**: el paso 1.5 sube una foto y recorre exactamente este camino. Se deja aquí solo como recordatorio de qué mirar si 1.5 falla al subir — la respuesta del endpoint dice el motivo (`401` = token; `503` = claves de Google). |
| 1.5 | 🧑 | **Estrenar el alta entera**: `/gestion` → «+ Nuevo inmueble» → rellenar, subir una foto, guardar como **borrador**. Debe salir «Guardado como INM-…». Es la primera vez que ese camino corre completo. |
| 1.6 | 🧑 | **Estrenar GESTIÓN**: `/gestion` → **Expedientes** → abrir uno (código antiguo `ALT-AR-…` basta) → registrar una novedad → moverla a HECHO escribiendo qué se hizo. Debe rechazar el cierre si dejas vacío «Qué se hizo». Son tres Cloud Functions que nunca han corrido. ✅ **YA SE PUEDE (§140)**: hasta el 25-ago este paso era IMPOSIBLE y no lo decía — esas Functions viven en el codebase `portal`, que tenía **9 en código y 0 desplegadas**, y su despliegue estaba en la fase 3, detrás del gate de Resend. Las cinco puertas de escritura (`crearExpediente`, `crearNovedad`, `actualizarNovedad`, `crearContrato`, `registrarPago`) están **desplegadas y verificadas contra `functions:list`**. |
| 1.7 | 🧑 | **Estrenar el sello y el export**: en **Inmuebles**, «Pendientes del sello» → **Verificar** la del paso 1.5 (debe rechazarla: un borrador con una foto no se lo ha ganado) → «Exportar CSV» y abrir el archivo en Excel: acentos correctos y columnas en su sitio. |
| 1.8 | 🧑 | **Estrenar la solicitud de estancia** (§122): en `/estancias`, elegir fechas → «Solicitar estas fechas» → nombre, WhatsApp y marcar la autorización → «Enviar solicitud». Debe (a) aparecer el lead en **Gestión → Resumen** con origen `portal-estancias`, y (b) quedar escrito el **puntaje** (`leadScore`/`leadTier`) en el lead. ⚠️ **NO esperes correo aquí**: `onNewSolicitud` fue RETIRADA (§199) —su Gmail estaba roto y su algoritmo lo sustituyó §190— y su relevo `avisoLeadNuevo` envía por **Resend**, que sigue mudo hasta el gate 0.2. Cuando Resend exista y el correo aun así no llegue, mira **`avisoEnviadoEl`** en el lead: si está vacío, el envío falló y el puntaje se guardó igual — esa asimetría es deliberada (§191). |

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
| 3.2 | 🧑 | **REASIGNADO (§210)** — `firebase functions:secrets:set RESEND_API_KEY`. Venía marcado 🤖 y **es una credencial**: el comando PIDE el valor de la clave por pantalla, y Claude no teclea ni recibe claves de nadie. Es un comando y usted es quien tiene la clave. Si la CLI no está en su máquina, también se puede desde la consola de Google Cloud → Secret Manager → `RESEND_API_KEY` → nueva versión. Claude sigue en el 3.3. |
| 3.3 | 🤖 | `firebase deploy --only functions:portal:catalogoBarrido,functions:portal:alertasDigest --project altorra-inmobiliaria-345c6` — **desde la RAÍZ**. ✅ **Ya salieron `catalogoOnPropiedadWrite` y `catalogoRepublicar`** el 25-ago (§144): no son programadas, así que no comprometían nada — el índice del catálogo ya se reconstruye SOLO en cuanto se escriba la primera propiedad, que es lo que necesita el paso 1.5. Aquí quedan **solo las dos programadas**, que sí consumen 2 de los 3 jobs gratuitos de Scheduler. ⚠️ El comando que había aquí (`--config portal/firebase/firebase.json`) **fallaba siempre** (§140): esa config declaraba `source: '../functions'`, que se sale del directorio del proyecto. Ya no existe ese bloque; el codebase `portal` vive en el `firebase.json` de la raíz. Las cinco de GESTIÓN ya están fuera desde el 25-ago, así que aquí solo quedan estas cuatro. |

Esto despliega el rebuild del catálogo (`catalogoOnPropiedadWrite`, `catalogoBarrido`,
`catalogoRepublicar`) y el digest de alertas (`alertasDigest`) — las **cuatro que faltan** del codebase
`portal`; las cinco de GESTIÓN salieron antes (§140).

⚠️ **El secreto ya EXISTE con un centinela** (`SIN-CONFIGURAR`), porque `defineSecret()` bloqueaba el
despliegue de TODO el codebase mientras no existiera — incluidas funciones que no tocan el correo
(§140). El paso 3.2 pasa a ser **sobreescribir** ese valor con la clave real, no crearlo. Si se
desplegara el digest con el centinela puesto, el código lo trata como «sin clave»: aplica las bajas y
no envía, que es la conducta que ya estaba diseñada.

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
| 4.1 | 🧑 | Cargar las primeras propiedades **desde el panel del portal** (TODO-44). ⛔ **La opción «entregárselas a Claude para sembrarlas» se RETIRA** (§209) y por dos motivos, cada uno suficiente: (a) sembrar exige un **service account**, una credencial del dueño que Claude no debe manejar (§124) — el paso estaba asignado a quien no puede hacerlo, como ya pasó con el 1.4 (§140); (b) el único script que existe, `scripts/upload-to-firestore.mjs`, escribe el **modelo LEGACY**, así que su salida **desaparece del catálogo sin dar error** (§103). Ya lleva el aviso en su cabecera. Lo que Claude SÍ puede: preparar los datos y el script; **ejecutarlo con credenciales es del dueño**. |
| 4.3 | 🧑 | Poner la variable de repositorio **`PORTAL_CATALOGO_SOURCE = live`** |
| 4.4 | 🧑 | Poner **`PORTAL_MEDIA_BASE`** con la URL pública del bucket R2 |
| 4.5 | 🤖 | Empujar cualquier cambio a `main` para que el CI reconstruya con esas variables |
| 4.6 | 🤖 | **Comprobar el catálogo en el worker de staging** — era el paso 4.2 y estaba **antes**, cuando aún no había forma de verlo (§210): la CLI de Firebase **no tiene comando de lectura** de documentos y `functions:log` deniega el acceso. Después del 4.3-4.5 el sitio SÍ lo enseña, y así se verifica más: que el índice se pobló **y** que la ficha renderiza. |

**Verificación**: el SERP de `/comprar` muestra los inmuebles REALES, y una ficha abre por su URL
`/inmueble/<slug>`. Si las fotos salen rotas, es 4.4 (§97.7). **Si el SERP sale vacío**, mira
`omitidasPorMotivo` en el doc de control antes de tocar nada: dice exactamente por qué.

**Vuelta atrás**: devolver `PORTAL_CATALOGO_SOURCE` a `demo`. El portal vuelve a las cards de muestra.

---

## FASE 5 — Indexable y DNS *(el punto de no retorno)*

⛔ **TERCER ERROR, y es el único con sanción encima (§213 — hallado el 26-ago).** `/estancias` anuncia
un alojamiento por días **con precio (`$850.000/noche`) y formulario de fechas**, y **sin número de
RNT** — que la ley exige **visible en TODA la publicidad** de alojamiento turístico. Dos agravantes:
(1) la página es **ESTÁTICA**: no lee el catálogo, así que **`PORTAL_CATALOGO_SOURCE=live` NO la
vacía** — el candado que protege a `/comprar` y `/arrendar` no la cubre, porque el aviso de abajo los
enumeró a ellos y a la home, y ella no estaba en la lista; (2) **el propio sitio explica la regla** en
`/invertir` (*«RNT visible en toda la publicidad»*). Hoy no hay exposición —staging es `noindex`—; el
día del DNS sí.
⚠️ **Y no es solo esa página (§214)**: la **HOME** también es estática —sus tarjetas son literales en
`index.astro`— y muestra **`$1.150.000 / noche`** (mismo problema de RNT) y **`o crédito desde
$6.2M/mes`**, una cifra financiera de un producto que **se retiró del menú por no tener nada detrás**
(§159.4): se quitó el enlace y **se dejó el número**. Corrige de paso el §213, que daba la home por
cubierta por el candado — no lo está.
⛔ **CUARTO ERROR, y el peor de todos (§215).** El **hero de la home** publica **`+12%` valorización
anual** y **`8–11%` ROI en USD** —mediciones de mercado **sin fuente**—, y **`/publicar`** anuncia
**`+1.200` inmuebles cerrados**, **`38 días` promedio de venta** y **`98%` clientes satisfechos**, que
son **estadísticas inventadas** en la página donde un propietario decide confiarnos su inmueble. Los
otros tres errores son datos de MUESTRA; éste es una **promesa de rentabilidad** y una **reputación
fabricada** (Ley 1480 arts. 29-30). Agravante doble: `/nosotros` promete por escrito **no publicar esos
números**, y el comentario de §123 dentro de `index.astro` explica —cinco líneas más arriba del hero—
por qué una medición sin fuente no se publica. ✅ **Desde §224 `verify:claims` SÍ los ve** —barre también el
HTML servido— y los lleva **congelados con su motivo**: no bloquean el CI, pero salen impresos en cada
corrida y **una cifra NUEVA sí rompe**. Siguen bloqueando el 5.3: el gate los hace visibles, no los arregla.
⇒ 📄 **Las cinco cifras ya tienen su reemplazo REDACTADO** con su fuente y conservando la forma del
bloque (sin cambio de diseño ni mockup nuevo) → `specs/PROPUESTA-CIFRAS-CUTOVER.md`. La decisión
de Daniel pasa a ser **sí o no**, no «piensa qué poner».

⇒ **Antes del 5.3, una de tres**: poner el RNT (pelota de Daniel), retirar el precio y el formulario de
esa página, o dejarla fuera del dominio. **Es decisión suya, y bloquea el 5.3.**

✅ **Y ya no hay que buscarlas a mano (27-ago).** La sonda del RNT se **corrió de verdad en modo
producción** por primera vez —hasta ahora solo se había visto su verde de staging, que significa «no
miré»— y **bloquea**, nombrando exactamente **DOS**: `/` y `/estancias`. (Antes esta línea decía
«las CUATRO»; eran los cuatro ERRORES de arriba, no cuatro páginas.) El comando, para verlo tú mismo:

```bash
cd portal && PUBLIC_SITE_ENV=production npm run build && PUBLIC_SITE_ENV=production node ./scripts/verify-build.mjs
```

Devuelve los bloqueadores del 5.3 **medidos, no recordados** — el 27-ago salían dos: el RNT y
`PUBLIC_CATALOGO_SOURCE=demo` (paso 5.1b). ⚠️ **Punto ciego declarado**: solo abre el HTML de
`dist/client`, así que **no juzga las páginas SSR** — hoy una, `/alertas`, que no anuncia noches.
Descartó bien `/gestion`, que dice «Precio por noche» como etiqueta de un campo del panel, no como
anuncio: la sonda exige `$NNN / noche` **y** formulario.

⚠️ **Los DOS errores que este runbook existe para evitar** — los dos se ven perfectos para un humano.
El segundo es publicar el **catálogo de muestra** en el dominio real (§163, paso 5.1b). El primero:
el portal indexa **solo** con
`PUBLIC_SITE_ENV=production`; por defecto sale `noindex` + `Disallow: /`. Correcto en staging,
**catastrófico en el dominio real** — Google desindexa y el sitio se ve perfecto. Hasta el 2026-08-21
esa variable no se declaraba en NINGÚN sitio del repo (§91 la cazó, §102 la cableó al CI).

| Paso | Quién | Qué |
|---|---|---|
| 5.1 | 🧑 | Poner la variable de repositorio **`PORTAL_SITE_ENV = production`** |
| 5.1b | 🧑 | Y **`PORTAL_CATALOGO_SOURCE = live`**. ⚠️ Sin ella `/comprar` y `/arrendar` salen con el catálogo de MUESTRA hacia un inmueble que **no existe**. ⛔ **La HOME no obedece esta variable** (§214): es estática y sus tarjetas siguen ahí aunque la pongas — se arregla aparte, con su precio y su barrio. Se ve PERFECTO para un humano, igual que el fallo del 5.1. Lo bloquea la sonda del catálogo en `verify:build` (§163) — pero solo si la fase 4 ya dejó inventario real: **este paso NO se hace antes que la fase 4** |
| 5.2 | 🤖 | Empujar a `main` y comprobar que el CI queda VERDE. Si `verify:build` falla, es el candado #6 haciendo su trabajo: **no se sigue**. ⚠️ **Por qué medio** (§210): no hay `gh` en la máquina, así que el CI no se consulta por su insignia — se comprueba el **resultado desplegado** (el worker sirve el cambio y `deploy-info.json` bumpeado). Un verde que no se puede leer no es evidencia; el artefacto servido sí. |
| 5.3 | 🧑 | Mover el DNS de `altorrainmobiliaria.co` de Hostinger a Cloudflare |
| 5.4 | 🤖 | `curl -s https://altorrainmobiliaria.co \| grep -i noindex` → **vacío**, y `/robots.txt` sin `Disallow: /` |
| 5.5 | 🤖 | Comprobar los 301 del sitio viejo — **los 65, uno por uno**, no una muestra (`scripts` del ensayo). `ensayado: 2026-08-25` sobre el worker de staging: 64/65 + `/index.html` 200 con canonical a `/`, que es consolidación correcta |
| 5.6 | 🧑 | En Search Console: **reenviar `sitemap.xml`** |

🔴 **CONSECUENCIA QUE HAY QUE ACEPTAR A CONCIENCIA (§145.7): `/admin.html` MUERE aquí.** Medido: hoy
responde 200 en el dominio (GitHub Pages) y **404 en el Worker**. En cuanto el DNS se mueva, el panel
al que Daniel entra todos los días deja de existir en el dominio, y su reemplazo es `/gestion` — que
NO tiene todavía todo lo del viejo (reseñas, usuarios, newsletter). Puede ser lo correcto; lo que no
vale es enterarse el día del cambio.

✅ **Los 301 ya funcionan** (§145): 64 de 65 verificados UNO POR UNO contra un servidor real. El
único desvío es `/index.html`, que responde 200 con canonical a `/` — Google consolida.

**⛔ NO borrar `googlec4e47cae776946d9.html`** (verificación de propiedad de GSC). Ya no es un archivo
de `public/`: es la ruta `src/pages/googlec4e47cae776946d9.html.ts`, que responde 200 con el token.
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
- ✅ **Maquinaria de SEO legacy RETIRADA** (§201 → hecho §217, 26-ago): `onPropertyChange` y
  `triggerSeoRegeneration` fuera **del código y de producción** (`functions:delete`; 30 → 28 CF), y
  con ellas el uso de `GITHUB_PAT`. Se fue también `onNewSolicitud`, que llevaba meses retirada de
  Firebase pero **viva en el archivo**, a un deploy de volver con su SMTP roto. ⏭ **Para Daniel**:
  el PAT de GitHub ya no lo usa nada — puede **revocarlo** cuando quiera (es una credencial con
  permiso `repo`+`workflow` al servicio de nada).

---

## Checklist

Se marca con la EVIDENCIA al lado, no con fe.

> 🔴 **REGLA NUEVA — todo paso 🤖 se ENSAYA antes del día D (§145.9, reincidencia N9-02).** Este
> runbook ya ha fallado tres veces por lo mismo: un botón que prometía y no existía (§126), un comando
> que no funcionaba desde el día que se escribió (§140.1), un paso asignado a quien no podía hacerlo
> (§140.5) y un mapa de 301 que nunca se ejecutó (§145). Los cuatro se descubrieron **ensayando**, no
> leyendo. Ningún gate puede cazarlos: no son rutas de archivo ni tipos, son promesas.
>
> Por eso cada paso 🤖 lleva su marca `ensayado: <fecha>` o `ensayado: NO`. Un paso sin ensayar es una
> **hipótesis**, y este documento se ejecuta el día que el DNS ya se movió — el único que tarda horas
> en revertirse.

**Ensayados hasta hoy (2026-08-25)**
- ✅ 1.1 claims desplegados · 3.3 parcial (10 de 12 CF vivas) · 5.5 **301 verificados 64/65 uno por uno, y EN VIVO contra el worker ya desplegado** (§150) — el ensayo destapó de paso que toda página estática respondía 307 hacia su forma con barra
- ⚠️ 1.4 **REASIGNADO**: era 🤖 y es imposible para 🤖 (exige un token con el claim) → §140.5
- ❌ sin ensayar: 4.x (catálogo real, necesita datos) · 5.4 y 6.x (necesitan el DNS movido)

- [ ] F1 · claims desplegados y sincronizados — *evidencia*: Daniel ve el panel en `/gestion`
- [ ] F2 · reglas fusionadas desplegadas — *evidencia*: `admin.html` entra y abre Propiedades y Leads
- [ ] F3 · Functions del portal + secreto de Resend — *evidencia*: logs del barrido sin errores
- [ ] F4 · catálogo real visible — *evidencia*: `/comprar` con inmuebles reales y una ficha que abre
- [ ] F5 · sitio indexable y DNS movido — *evidencia*: `curl` sin `noindex` y `robots.txt` sin `Disallow: /`
- [ ] F6 · sitemap con fichas y reenviado en GSC — *evidencia*: contador de URLs descubiertas en GSC
