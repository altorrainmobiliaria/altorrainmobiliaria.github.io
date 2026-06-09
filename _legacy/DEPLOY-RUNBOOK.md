# DEPLOY-RUNBOOK.md — Altorra Inmobiliaria
## Pasos pendientes que solo puede hacer el propietario

> Fecha: 2026-04-10
> Todas las tareas a continuación requieren credenciales, consola de Google Cloud
> o acceso a la máquina local con Firebase CLI. Claude ya dejó el código listo.
>
> Project ID: `altorra-inmobiliaria-345c6`
> Cuenta Firebase CLI: `altorrainmobiliaria@gmail.com`
> Ruta local: `C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io`

---

## ⚠️ BLOQUEANTE 1 — Completar deploy de Cloud Functions

Solo `createManagedUserV2` se desplegó en el intento anterior. Las otras 6 funciones
fallaron por el error "Eventarc Service Agent permission denied". Este es un error
común en el primer deploy de Functions 2nd gen.

### Opción A — Reintentar (lo más probable que funcione)

El error de Eventarc suele resolverse solo tras unos minutos. Espera 10 min
desde el último intento y ejecuta:

```powershell
cd C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io\functions
npm install
cd ..
firebase deploy --only functions --account altorrainmobiliaria@gmail.com
```

### Opción B — Dar permisos manualmente

Si la Opción A falla:

1. Abre IAM:
   https://console.cloud.google.com/iam-admin/iam?project=altorra-inmobiliaria-345c6

2. Click "Grant access" y añade los siguientes roles a estas cuentas de servicio:

   | Cuenta de servicio | Rol a otorgar |
   |---|---|
   | `service-794130975989@gcp-sa-eventarc.iam.gserviceaccount.com` | `Eventarc Service Agent` |
   | `794130975989@cloudbuild.gserviceaccount.com` | `Cloud Build Service Account` |
   | `794130975989-compute@developer.gserviceaccount.com` | `Cloud Run Invoker` |

3. Verifica que estas APIs estén habilitadas:
   - https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=altorra-inmobiliaria-345c6
   - https://console.cloud.google.com/apis/library/eventarc.googleapis.com?project=altorra-inmobiliaria-345c6
   - https://console.cloud.google.com/apis/library/run.googleapis.com?project=altorra-inmobiliaria-345c6
   - https://console.cloud.google.com/apis/library/pubsub.googleapis.com?project=altorra-inmobiliaria-345c6

4. Espera 2-3 minutos y reintenta el deploy:
   ```powershell
   firebase deploy --only functions --account altorrainmobiliaria@gmail.com
   ```

### Qué funciones debe quedar desplegadas al terminar

| Función | Tipo | Lo que hace |
|---|---|---|
| `onNewSolicitud` | Firestore trigger | Email al admin cuando llega un lead |
| `onSolicitudStatusChanged` | Firestore trigger | Email al cliente cuando cambia estado |
| `onPropertyChange` | Firestore trigger | Regenera SEO (debounce 5 min) |
| `triggerSeoRegeneration` | HTTPS callable | Forzar regeneración SEO desde admin |
| `createManagedUserV2` | HTTPS callable | ✅ (ya desplegada) |
| `deleteManagedUserV2` | HTTPS callable | Eliminar usuario admin |
| `updateUserRoleV2` | HTTPS callable | **NUEVO** — cambiar rol de usuario |

Verificación post-deploy:
```powershell
firebase functions:list --account altorrainmobiliaria@gmail.com
```
Debe mostrar las 7 funciones.

---

## BLOQUEANTE 2 — Subir las 5 propiedades a Firestore

Sin esto, el sitio muestra el fallback a `properties/data.json` (que funciona,
pero no usa Firestore).

### Pasos

1. Descargar service account:
   - https://console.firebase.google.com/project/altorra-inmobiliaria-345c6/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Guardar como `C:\Users\romad\sa-altorra-inmobiliaria.json`
   - **NO commitear este archivo al repo**.

2. Ejecutar desde la raíz del repo:
   ```powershell
   cd C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io
   npm install
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\romad\sa-altorra-inmobiliaria.json"
   npm run upload
   ```

3. Verifica en la consola:
   https://console.firebase.google.com/project/altorra-inmobiliaria-345c6/firestore/data/~2Fpropiedades

   Debe haber 5 documentos: `101-27`, `102-11402`, `103-B305`, `104-01`, `105-4422`.

---

## BLOQUEANTE 3 — Subir imágenes a Cloud Storage

### Pasos

1. Primero dry-run para ver qué haría:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\romad\sa-altorra-inmobiliaria.json"
   $env:DRY_RUN = "1"
   npm run migrate-images
   ```

2. Si el dry-run se ve bien, ejecuta de verdad:
   ```powershell
   Remove-Item Env:\DRY_RUN
   npm run migrate-images
   ```

   Esto sube 5 carpetas (`allure/`, `fmia/`, `serena/`, `fotoprop/`, `Milan/`)
   a `gs://altorra-inmobiliaria-345c6.firebasestorage.app/propiedades/{id}/*`
   y actualiza las URLs en los documentos Firestore.

3. Verifica en el navegador que una de las URLs cargue, ej.:
   ```
   https://storage.googleapis.com/altorra-inmobiliaria-345c6.firebasestorage.app/propiedades/101-27/allure.webp
   ```

4. Solo cuando veas que las imágenes cargan desde Storage, puedes eliminar
   las carpetas locales:
   ```powershell
   git rm -r allure/ fmia/ serena/ fotoprop/ Milan/
   git commit -m "chore: eliminar imagenes locales migradas a Cloud Storage"
   ```

---

## BLOQUEANTE 4 — Secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub Actions

Sin esto, el workflow `og-publish.yml` cae al fallback que genera `/p/*.html`
desde `data.json` en vez de Firestore.

### Pasos

1. Abrir el mismo service account JSON que descargaste arriba.

2. Copiar su contenido completo (es un JSON de ~2-3 KB).

3. Ir a:
   https://github.com/altorrainmobiliaria/altorrainmobiliaria.github.io/settings/secrets/actions

4. Click "New repository secret":
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Secret: pegar el contenido del JSON tal cual

5. Verificar disparando el workflow manualmente:
   https://github.com/altorrainmobiliaria/altorrainmobiliaria.github.io/actions/workflows/og-publish.yml
   → click "Run workflow"

   En los logs deberías ver: "Generar páginas SEO desde Firestore" ejecutándose
   (no el paso de fallback).

---

## OPCIONAL 5 — Google Maps API key

Sin esto, la página `/mapa.html` muestra "Mapa no disponible: falta configurar
la clave de Google Maps". El resto del sitio funciona normal.

### Pasos

1. Ir a https://console.cloud.google.com/google/maps-apis/credentials?project=altorra-inmobiliaria-345c6

2. Click "Create credentials" → "API key".

3. Restringir la clave:
   - **Application restrictions:** HTTP referrers
     - `https://altorrainmobiliaria.co/*`
     - `https://*.altorrainmobiliaria.co/*`
     - `http://localhost/*` (para desarrollo)
   - **API restrictions:** Maps JavaScript API

4. Copiar la key.

5. Editar `js/firebase-config.js`, buscar el bloque `window.AltorraKeys`:

   ```javascript
   window.AltorraKeys = Object.assign({
     gmapsApiKey: '',   // ← pegar la key aquí
     vapidKey:    '',
   }, window.AltorraKeys || {});
   ```

6. Commit y push:
   ```powershell
   git add js/firebase-config.js
   git commit -m "chore: agregar Google Maps API key"
   git push
   ```

---

## OPCIONAL 6 — VAPID key para notificaciones push (FCM)

Sin esto, el botón de "Activar alertas" se oculta automáticamente y no hay push.

### Pasos

1. Ir a: https://console.firebase.google.com/project/altorra-inmobiliaria-345c6/settings/cloudmessaging

2. En "Web configuration" → "Web Push certificates" → click "Generate key pair".

3. Copiar la key (es un string largo tipo `BNxD...`).

4. Editar `js/firebase-config.js`, mismo bloque:
   ```javascript
   window.AltorraKeys = Object.assign({
     gmapsApiKey: '...',     // ya está
     vapidKey:    'BNxD...', // ← pegar aquí
   }, window.AltorraKeys || {});
   ```

5. Commit y push.

---

## CHECKLIST DE VERIFICACIÓN FINAL

Una vez hechos los bloqueantes 1-4:

- [ ] `firebase functions:list` muestra 7 funciones
- [ ] Firestore Console muestra 5 documentos en `propiedades/`
- [ ] Firestore Console muestra `system/meta`, `config/general`, `config/counters`
- [ ] Storage Console muestra carpetas en `propiedades/{id}/`
- [ ] Abrir https://altorrainmobiliaria.co/ — debe cargar y mostrar las 5 propiedades
- [ ] Abrir `admin.html` y hacer login con `info@altorrainmobiliaria.co`
- [ ] Crear un lead de prueba desde `contacto.html` → verificar que:
  - Aparece en Firestore `solicitudes/`
  - Llega email a `info@altorrainmobiliaria.co` (función `onNewSolicitud`)
- [ ] Desde el admin, editar una propiedad → verificar que:
  - Se actualiza `updatedAt` en Firestore
  - El workflow `og-publish.yml` se dispara tras 5 min (`onPropertyChange`)
  - La página `/p/{id}.html` refleja los cambios nuevos
- [ ] Abrir `/mapa.html` — muestra el mapa (o el mensaje si falta la Maps key)

---

## TROUBLESHOOTING

### "Firestore Database does not exist in region nam5"
Probable que aún no esté activado. Ve a:
https://console.firebase.google.com/project/altorra-inmobiliaria-345c6/firestore
y click "Create database".

### "Missing or insufficient permissions" en admin panel
El usuario logueado no tiene documento en `/usuarios/{uid}` o `rol !== 'super_admin'`.
Verifica en Firestore que exista `usuarios/J1sXuV78OhPA5KyCoWNYFVQehF23` con
`{ rol: "super_admin", activo: true, bloqueado: false }`.

### Las páginas del admin se ven en blanco
Abre DevTools y mira la consola. Lo más común:
- `window.functions` no definido → el SDK diferido de Firebase no terminó de cargar.
  Refrescar debería resolverlo.
- `onSnapshot` permisos → el usuario logueado no es editor/super_admin.

### El workflow corre pero no genera páginas nuevas
Verifica que el secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` existe y que el
JSON es válido. En los logs del workflow debe decir "Generar páginas SEO desde
Firestore" (no "fallback").

### Las funciones no responden
```powershell
firebase functions:log --account altorrainmobiliaria@gmail.com
```
Revisa errores de secrets o de permisos de Firestore.

---

*Fin del runbook — cuando todos los checkboxes estén verdes, la migración está completa.*
