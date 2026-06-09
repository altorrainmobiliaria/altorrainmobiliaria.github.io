# 🔐 50 — CONFIG / INFRA (Altorra Inmobiliaria)

> Identificadores de infraestructura y deploy. **El DEPLOY lo ejecuta el DUEÑO** (no Claude en este repo).
> 🔒 **Regla de oro (plan v5 Q7)**: los identificadores PÚBLICOS (Project ID, cuentas, roles IAM, comandos) van
> aquí committeados — son identidades/config, NO secretos. Los valores SECRETOS (claves, SA JSON) **NUNCA** se
> escriben aquí: solo se nombra su ubicación (gitignored / fuera del repo). Destilado de `_legacy/DEPLOY-RUNBOOK.md`.

---

## Identidad del proyecto (PÚBLICO)
| Clave | Valor |
|---|---|
| Project ID | `altorra-inmobiliaria-345c6` |
| GCP Project Number | `794130975989` |
| Cuenta Firebase CLI (deploy) | `altorrainmobiliaria@gmail.com` |
| Storage bucket | `gs://altorra-inmobiliaria-345c6.firebasestorage.app` |
| Firestore region | `nam5` · Functions region `us-central1` (Node 20) |
| GitHub repo | `altorrainmobiliaria/altorrainmobiliaria.github.io` · dominio `https://altorrainmobiliaria.co/` |
| Email admin/login | `info@altorrainmobiliaria.co` · UID super_admin `J1sXuV78OhPA5KyCoWNYFVQehF23` |

## Cloud Functions (8, Node 20, us-central1)
`onNewSolicitud` (email admin + lead scoring) · `onSolicitudStatusChanged` (email cliente) · `onPropertyChange`
(regen SEO debounce 5min) · `triggerSeoRegeneration` (HTTPS callable super_admin) · `createManagedUserV2` (✅ desplegada)
· `deleteManagedUserV2` · `updateUserRoleV2` · `cleanupOldLoginAttempts`.

## Bloqueante Eventarc / CF 2nd gen (IAM — PÚBLICO; son identidades, no secretos)
1er deploy 2nd gen falla con "Eventarc Service Agent permission denied" (ver `30 L-07`). Otorgar en IAM
(`console.cloud.google.com/iam-admin/iam?project=altorra-inmobiliaria-345c6`):
| Cuenta de servicio | Rol |
|---|---|
| `service-794130975989@gcp-sa-eventarc.iam.gserviceaccount.com` | Eventarc Service Agent |
| `794130975989@cloudbuild.gserviceaccount.com` | Cloud Build Service Account |
| `794130975989-compute@developer.gserviceaccount.com` | Cloud Run Invoker |
APIs requeridas: cloudbuild · eventarc · run · pubsub (`.googleapis.com`). Opción A: esperar 10 min y reintentar.

## Comandos de deploy (PowerShell — los corre el dueño)
```powershell
# Functions (2nd gen)
cd functions; npm install; cd ..
firebase deploy --only functions --account altorrainmobiliaria@gmail.com
firebase functions:list --account altorrainmobiliaria@gmail.com   # debe mostrar ~8
# Reglas (MANUAL, no automático)
firebase deploy --only firestore:rules --account altorrainmobiliaria@gmail.com
# Subir propiedades / migrar imágenes (requieren el SA JSON, ver §Secretos)
$env:GOOGLE_APPLICATION_CREDENTIALS = "<ruta-SA-JSON>"; npm run upload
$env:GOOGLE_APPLICATION_CREDENTIALS = "<ruta-SA-JSON>"; $env:DRY_RUN="1"; npm run migrate-images
```

## 🔒 Secretos (NO en este repo — solo se nombra su ubicación)
> NUNCA escribir el valor real aquí ni en ningún archivo versionado.
- **Service Account JSON** (`sa-altorra-inmobiliaria.json`) — vive FUERA del repo (carpeta home del dueño). Generar desde
  Firebase Console → serviceaccounts/adminsdk. Lo usan `npm run upload`/`migrate-images` vía `$env:GOOGLE_APPLICATION_CREDENTIALS`.
- **GitHub Actions secret** `GOOGLE_APPLICATION_CREDENTIALS_JSON` = contenido del SA JSON (lo requiere `og-publish.yml`;
  sin él, cae a fallback `data.json`). Se configura en Settings → Secrets del repo, no en el árbol.
- **Google Maps API key** y **VAPID key (FCM)** — opcionales, en `js/firebase-config.js` (`window.AltorraKeys.gmapsApiKey`/`vapidKey`).
  Restringir GMAPS por HTTP referrer (`https://altorrainmobiliaria.co/*`). La `apiKey` de Firebase SÍ es pública (frontend).

## Datos de seed / verificación
Firestore `propiedades/`: 5 docs (`101-27`, `102-11402`, `103-B305`, `104-01`, `105-4422`) + `system/meta`, `config/general`, `config/counters`.
Storage: 5 carpetas locales → `propiedades/{id}/*`. ⚠️ Doc fechado 2026-04-10 — verificar contra Firebase real antes de afirmar (§3.3).
