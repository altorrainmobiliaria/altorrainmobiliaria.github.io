# 🔐 50 — CONFIG / INFRA (Altorra Inmobiliaria)

> Identificadores de infraestructura y deploy. **Deploy WEB (GH Pages) = Claude** (delegación 2026-07-10,
> ADR §15.7); **deploy FIREBASE (functions/rules) = DUEÑO**.
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
| Registrador del dominio | **Hostinger** (dueño, 2026-07-10) — relevante para la delegación de NS a Cloudflare (stack ADR §16) |
| Razón social DEFINITIVA | **ALTORRA COMPANY S.A.S · NIT 902063965-4** (dueño 2026-07-10). ⛔ La vieja "ALTORRA S.A.S. NIT 901.976.611-7" entra en LIQUIDACIÓN — jamás en contratos/facturas/footer nuevos (las plantillas del corpus que la citan se actualizan al adaptarlas) |
| Plan Firebase | **Blaze** (dueño, 2026-07-10). ⚠️ El MCP reportó "Billing Enabled: No" — discrepancia a verificar en consola |
| Cuenta CLI activa (este dir) | `altorrainmobiliaria@gmail.com` fijada con `firebase login:use` (2026-07-10; las 3 cuentas del dueño están en `login:list`) |
| Email admin/login | `info@altorrainmobiliaria.co` · UID super_admin `J1sXuV78OhPA5KyCoWNYFVQehF23` |

## Cloudflare (portal greenfield — cuenta CREADA por el dueño 2026-07-10, protocolo Fincaraíz)
| Clave | Valor |
|---|---|
| Cuenta | `altorrainmobiliaria@gmail.com` (email del negocio) — plan Free |
| **Account ID** (público, no secreto) | `df76de75877f4a0750967f6231a8f4cd` |
| Worker | `altorra-portal` — **LIVE**: `https://altorra-portal.altorrainmobiliaria.workers.dev` (staging, noindex; deploy vía CI en cada push a `portal/**`) |
| Subdominio workers.dev | `altorrainmobiliaria.workers.dev` (registrado por el dueño 2026-07-11; requisito del 1er deploy → L-16) |
| R2 bucket | `altorra-portal-media` ✅ creado (nombre EXPLÍCITO; NO se auto-crea) |
| KV Sessions | binding `SESSION` = namespace `altorra-portal-session` (id `35ff8d8d9c09414eb8e0abf63c401fa6`) — auto-aprovisionado OK en el 1er deploy |
| API token (secreto, lo crea/carga el DUEÑO) | scopes: `Workers Scripts:Edit` + `Workers KV Storage:Edit` + `Workers R2 Storage:Edit` + `Account Settings:Read` |
| GitHub Actions | secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` · variable `CF_DEPLOY_ENABLED=true` (enciende deploy-staging) |

## ⚙️ Deploy de Firebase = CLAUDE (delegado por el dueño 2026-07-11)
> Daniel delegó a Claude el deploy de Firebase (rules/functions), además del git/web ya delegado. **El dueño NO
> hace nada técnico** — solo responde dudas puntuales. Claude ejecuta `firebase deploy` (requiere CLI `firebase`
> autenticado como `altorrainmobiliaria@gmail.com` — **CONFIRMAR al primer deploy**; si no hay auth, es lo único que
> el dueño tocaría, una vez).
> ⚠️ El deploy de las **rules/indexes/storage del portal** es **COORDINADO**: reemplaza el ruleset del proyecto
> compartido con el legacy → NO desplegar hasta el retiro del legacy / cutover (ver `portal/firebase/README.md`).

## Cloud Functions (7 DESPLEGADAS — verificado `functions:list` 2026-07-10)
`onNewSolicitud` (email admin + lead scoring) · `onSolicitudStatusChanged` (email cliente) · `onPropertyChange`
(regen SEO debounce 5min) · `triggerSeoRegeneration` (HTTPS callable super_admin) · `createManagedUserV2`
· `deleteManagedUserV2` · `updateUserRoleV2`. ⚠️ `cleanupOldLoginAttempts` NO está desplegada (la doc vieja decía 8).
Siguen vivas sin sitio que las use (modo obra) — su apagado/mantenimiento se decide con el MEGA-PLAN.

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

## Datos vivos (censo REAL 2026-07-10 vía REST pública + rules — reemplaza al seed de abril)
**`propiedades/` = VACÍA** (las 5 de abril ya no existen; `system/meta.lastModified` = 2026-04-17). Fichas de las 5
rescatadas del git (`6149652:p/*.html`) → bóveda `research-archive/2026-07-10-cosecha-propiedades/`. `config/general`
vivo (contacto correcto) · `solicitudes` protegida (conteo pendiente) · Storage sin censar. Detalle → `specs/R0-INVENTARIO-COSECHA.md`.

## 🛡️ Respaldo OFFSITE (Cerebro v2 F0, ADR §50 — mata la mitad "disco" del SPOF)
- **Default vigente**: `git bundle` de los repos git del ecosistema (4 negocios + `brain-private` + `bersaglio-design`) → `C:\Users\romad\OneDrive\backups-cerebro\` (OneDrive sincroniza fuera de la máquina). Sello: `lastOffsiteBackup` en `.brain-manifest.json` (lo lee el banner de F3).
- **Comando** (por repo): `git bundle create <OneDrive>\backups-cerebro\<repo>-<fecha>.bundle --all` · **Restaurar**: `git clone <archivo>.bundle carpeta` (probado 2026-07-20 ×2: repo HEAD íntegro + bóveda 55 crudos). ⚠️ **Gotcha cazado EN la prueba**: en Windows el checkout de la bóveda falla con "Filename too long" (MAX_PATH 260) si la ruta destino es profunda → `git config --global core.longpaths true` (YA aplicado en esta máquina 2026-07-20) o restaurar en ruta corta (`C:\r\`). Un backup sin restore probado es teatro.
- **Cadencia**: en cada resonancia mensual (F3 lo automatiza). **Pendiente-opcional (decisión Daniel)**: espejo remoto push-mirror en 2ª cuenta git — mataría también la mitad "cuenta".
- ⚠️ `brain-kit/` NO es repo git (no bundleable) — su respaldo es el ZIP del Desktop + el kit se regenera desde el canónico en F1.

## 🚑 Runbook: recuperación de cuenta GitHub (TODO-31c — ✅ EJECUTADO por Daniel 2026-07-23: recovery codes de GitHub Y Cloudflare descargados → su **Google Drive personal**; la guía queda para re-generarlos si rota el 2FA)
> Ataca la mitad "cuenta" del SPOF (§49 A-01). La cuenta que administra los repos es `altorracars` (git user actual).
1. **PREVENIR (una vez, HOY — dueño, ~5 min). Guía EN CRISTIANO, clic por clic**:
   - **GitHub**: entrar a `github.com` → clic en tu **foto** (arriba a la derecha) → **Settings** → menú izquierdo **Password and authentication** → bajar a **Two-factor authentication** → **Recovery codes** → botón **View** (puede pedir confirmar identidad) → botón **Download** → se descarga un archivito de texto.
   - **Cloudflare**: entrar a `dash.cloudflare.com` → icono de **persona** (arriba a la derecha) → **My Profile** → pestaña **Authentication** → **Backup Codes** → **View/Download**.
   - **Guardar AMBOS archivos FUERA de este PC**: subirlos a tu OneDrive PERSONAL (carpeta privada) y/o imprimirlos. 🔒 Son SECRETOS: **jamás pegarlos en un chat** (ni a Claude) ni mandarlos por WhatsApp/email.
   - Confirmar que el **email de recuperación** de ambas cuentas está vigente y accesible. ⚠️ [VERIFICA-DANIEL]
2. **Si se pierde el 2FA** (teléfono dañado/robado) pero hay recovery codes: login normal → "Use a recovery code" → entrar → re-configurar 2FA. Cada código sirve UNA vez.
3. **Si se pierde TODO** (password + 2FA + códigos): proceso oficial de account-recovery de GitHub (verificación por email + historial de dispositivos) — **tarda DÍAS y puede fallar**; por eso el paso 1 es el que de verdad importa.
4. **Mientras tanto el negocio NO se detiene**: los bundles offsite (§Respaldo OFFSITE) restauran código+cerebro completos en cualquier máquina (`git clone <bundle>`); se trabaja local y al recuperar (o migrar a cuenta nueva) se re-apunta el remote: `git remote set-url origin <nueva-url>` + push.
5. **Continuidad de superficies**: si la cuenta GitHub cae, el dominio sigue sirviendo el ÚLTIMO deploy de Pages (no se borra solo); el portal staging vive en **Cloudflare** (cuenta separada `altorrainmobiliaria@gmail.com`, 2FA propio ⚠️ [VERIFICA-DANIEL: recovery codes de CF también]) → las dos superficies no caen juntas.
