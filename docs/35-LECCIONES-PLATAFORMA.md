# 🧩 35 — LECCIONES DE PLATAFORMA (hoja hija de `30-LECCIONES`)

> **Gotchas de INFRAESTRUCTURA ya pagados** (`L-01`..`L-21`): Firebase (Auth, RTDB, Firestore, Rules,
> emulador), Cloud Functions gen2, Cloudflare (Workers, cachés, wrangler), Astro y su adapter, el REST
> de Firestore, y GitHub Pages. Son la era de **Ola 0**: se aprendieron montando la plataforma y se
> consultan cuando se vuelve a tocar esa capa, no en el trabajo del día a día.
>
> **Por qué viven aquí y no en `30`**: `30` reventó su tope (§G.5) y este era el grupo con frontera más
> limpia — una capa entera, no un recorte arbitrario. En `30` queda un PUNTERO por lección, así que
> cualquier `[[L-NN]]` de este rango sigue resolviendo desde allí (es lo que comprueba `brain:check` #5).
>
> ⚠️ Al añadir una lección de plataforma nueva, va AQUÍ y su puntero a `30`. Las dos cosas, o el
> siguiente lector no la encuentra.

---
### L-01 — "Access denied for UID" al login (red lenta ≠ permiso denegado)
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-01]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-02 — RTDB `permission_denied` en presencia
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-02]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-03 — Firestore "Failed to obtain primary lease"
**Disparador**: error de lease en Firestore. **Causa**: múltiples tabs compartiendo IndexedDB. **Fix**:
`window.clearFirestoreCache()` desde consola.

### L-04 — ⚗️ FUSIONADA en L-09 (merge:true vs rules/upsert) — regla viva **aquí, en L-09**: `set()` SIN merge para CREAR, `update()` para EDITAR (el puntero apuntaba a `CLAUDE.md §3.5`, que se mudó a `34-DOCTRINA-CODIGO` en la poda §84; el dueño del hecho siempre fue L-09)

### L-05 — ⚰️ (sitio viejo retirado §15) Modals inyectados fuera de index → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md`

### L-06 — ⚰️ (sitio viejo retirado §15) Invalidación de cache `system/meta`→onSnapshot → cuarentena `_legacy/LECCIONES-SITIO-VIEJO.md` (resucitar si el cutover reusa SW/onSnapshot)

### L-07 — Primer deploy de Cloud Functions 2nd gen falla por Eventarc
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-07]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-08 — Reglas Firestore: leer un campo AUSENTE de `resource.data` LANZA (no es null) *(importada de cars — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-08]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-09 — Upsert de ingestión: `merge:true` PISA los campos presentes y NO borra los ausentes *(importada de cars — sinapsis 2026-07-10; ABSORBE L-04)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-09]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-10 — Un GET público linkeado por WhatsApp/email JAMÁS muta estado *(importada de cars — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-10]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-11 — Cloud Functions gen2: tres gotchas de operación que se ven como bugs *(importadas de bersaglio — sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-11]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-13 — GitHub Pages (deploy-from-branch): sin `.nojekyll` Jekyll construye TODO el repo — y si falla, PRODUCCIÓN SE CONGELA EN SILENCIO
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-13]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-12 — Dinero (arriendos/comisiones/pagos): método ANTES de construir *(sinapsis 2026-07-10)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-12]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-14 — Stack que evoluciona rápido (Astro/adapter CF): verificar versión y config contra DOCS, no de memoria *(Ola 0.1, ADR §19)*
⇒ **Migrada al maestro** (F2 lote 1): [[INMO:L-14]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-15 — Windows: `wrangler dev` deja un `workerd.exe` huérfano que bloquea `dist/` *(Ola 0.1)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-15]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.
### L-16 — Cloudflare Workers, primer deploy: registrar el subdominio `workers.dev` ANTES *(relato → §21)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-16]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.
### L-17 — Decodificar el REST de Firestore: mapas/arrays VACÍOS y despacho por clave *(Ola 0.7, ADR §22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-17]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-18 — Cloudflare: DOS cachés distintas; en `workers.dev` solo sirve **Workers Caching** *(Ola 0.7, ADR §22 / sello T8)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-18]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-19 — `@astrojs/cloudflare` v14: `locals.runtime` deprecado/sin tipo; `platformProxy` removido *(Ola 0.7, ADR §22)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-19]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-20 — Firestore Rules: un `get` de doc INEXISTENTE con `resource.data` en la regla → 403, no 404 *(Ola 0.7, ADR §22, confirmado T6 emulador)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-20]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-21 — Aislar tests que comparten un emulador Firestore: projectId PROPIO por archivo *(Ola 0.7, ADR §22.8, confirmado en vivo)*
⇒ **Migrada al maestro** (F2 lote 4): [[INMO:L-21]] · cuerpo íntegro en `_legacy/LECCIONES-MIGRADAS-MAESTRO.md`.

### L-55 — 🧬 Varias copias del MISMO SDK = varios registros, y el error no menciona versiones *(2026-08-25, §141)*
`firebase-admin` (y cualquier SDK con estado global: instancias, apps, conexiones) guarda su registro **por copia instalada**. En un monorepo con `node_modules` anidados conviven varias —aquí CUATRO: 13.8, 13.8, 13.10 y 14.2— y una prueba que inicializa la app con una copia mientras el código bajo prueba llama a `getFirestore()` con otra falla con **`app/no-app` aunque la app exista**. El mensaje no dice «hay dos copias» ni nombra versiones: parece que olvidaste inicializar. **Cómo se caza**: `find . -maxdepth 4 -type d -name "<paquete>"` y compara versiones. **Fix**: alias/dedupe en la config de pruebas apuntando a la copia del **codebase que corre en producción** — así la prueba ejercita la MISMA versión, no una parecida. **Regla portable**: cuando el test y el código bajo prueba pueden resolver a copias distintas, «el mismo código» es cierto del código y falso del entorno.

### L-53 — 🔐 Firebase MFA (TOTP): cuatro conductas que sorprenden y una que NO existe *(2026-08-25, §137)*
Verificadas en el `.d.ts` del SDK instalado, no de memoria. **(1) No avisa antes**: pide el código DESPUÉS de aceptar la contraseña (`auth/multi-factor-auth-required`); quien no atrape ese código responde «credenciales incorrectas» —mentira— y encierra fuera a quien acaba de inscribirse, así que **el resolver va ANTES que la inscripción**. **(2) `enroll()` exige login RECIENTE y REVOCA las demás sesiones**: activar tu 2FA cierra tu panel en los otros dispositivos — decirlo en pantalla convierte un susto en un trámite. **(3) `getMultiFactorResolver` sirve para ingreso Y re-autenticación** (lo dice su firma); importa porque quien ya tiene factor y va a retirarlo también pasa por el reto, y sin eso queda en un callejón. **(4) `revokeRefreshTokens` NO mata el token de acceso vivo** (caduca solo en ≤1h): «cerrar sesiones» corta *en cuanto expire lo que ya tenía*, no *ahora*; inmediato = comprobar `auth_time` en las Rules. **(5) NO hay códigos de respaldo para TOTP** — no existen en la API: el rescate es una SEGUNDA aplicación inscrita, o un admin que vacíe `multiFactor.enrolledFactors` desde el servidor. Prometer en la interfaz algo que la plataforma no emite es peor que no ofrecerlo.

### L-54 — 🌩️ Los tipos de Cloudflare Workers PISAN el DOM: `Element.append` deja de ser la del navegador *(2026-08-25, §138)*
`worker-configuration.d.ts` (lo genera `wrangler types`) declara `Element.append(content: string | ReadableStream | Response)` para HTMLRewriter; como el DOM `HTMLDivElement` hereda de `Element`, esa firma **gana en todo el proyecto** y `nodo.append(hijo)` deja de compilar en código de NAVEGADOR, con un mensaje que no menciona a Cloudflare por ningún lado. **Salida**: `appendChild()`, que HTMLRewriter no define. **Regla portable**: cuando los tipos de un RUNTIME conviven con los del navegador en un mismo `tsconfig`, un error de DOM «imposible» suele ser una colisión de nombres, no un error tuyo.

### L-49 — La configuración de la CONSOLA es parte del sistema y NO está en el repo: ningún gate puede verla *(TODO-47, ADR §129)*
**Disparador**: un botón impecable en el código que no funciona en producción. **Caso**: «Continuar con Google» en `/ingresar` — código correcto, proveedor cableado, y muerto: `authorizedDomains` del proyecto solo lista `localhost` + los dos dominios de Firebase; **`altorrainmobiliaria.co` no está**. El error cae en el `default` del traductor y muestra un mensaje genérico, así que el fallo es INVISIBLE incluso mirando la pantalla. **Por qué importa más de lo que parece**: dominios autorizados, proveedores habilitados, política de contraseña y protección de enumeración viven en una consola web — `verify:*`, `brain:check` y cualquier revisión de código son CIEGOS a todos ellos (es la clase de §126, el botón fantasma, pero al revés: ahí faltaba el código, aquí falta la config). **Sonda barata y definitiva** (sin credenciales, la apiKey es pública): `GET https://identitytoolkit.googleapis.com/v1/projects?key=<apiKey>` devuelve `authorizedDomains`; y `POST accounts:sendOobCode` con un correo inventado dice si la protección de enumeración está ENCENDIDA (responde éxito) o no (`EMAIL_NOT_FOUND`) — sin enviar ningún correo. **Regla**: antes de dar por buena una integración que depende de la consola, CONSÚLTALA por API y púlsala en vivo; y cuando el traductor de errores caiga en su `default`, REGÍSTRALO, porque ahí es donde van a morir estos fallos. Doctrina portable → skill `acceso-y-autenticacion` B-2/B-3/E-3.

### L-60 — 🔀 Antes de desplegar un TRIGGER, mira quién más escucha ese evento y qué escribe *(§199)*
**Disparador**: un trigger sobre una colección que **ya tenía dueño**. Comprobé que el mío era seguro *por dentro* —secreto, `retry:false`, degradación— y no miré el **vecindario**: el viejo escribía **los mismos campos** con un algoritmo ya sustituido. Gana el que termine último.
🎯 **Dos escritores del mismo campo no FALLAN: discrepan a veces** — ni excepción, ni log rojo, ni test en rojo; solo un valor que unas veces es uno y otras otro. **Reglas**: (1) un trigger no se evalúa por lo que hace bien sino por **con quién comparte la colección** — lista los oyentes ANTES de desplegar ([[L-59]]: `functions:list` dice *quién ya está*, no solo *qué falta*); (2) si hay dos, decide **cuál es el DUEÑO** y retira al otro — «que convivan» parece lo prudente y es lo único que no funciona; (3) al retirar, **enumera lo que hacía ADEMÁS**: aquí inicializaba el estado de otra feature, y matarlo le añadió un prerrequisito. *Una función vieja rara vez hace solo lo que dice su nombre.*
