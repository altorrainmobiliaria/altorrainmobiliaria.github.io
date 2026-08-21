# Firebase del PORTAL (nuevo) — reglas, índices y Cloud Functions greenfield

> Stack sellado (ADR §16): el proyecto Firebase `altorra-inmobiliaria-345c6` se **REUSA**. Las reglas,
> índices y Functions NUEVAS del portal viven AQUÍ, separadas del sitio viejo.
> **Frontera dura**: edge/render = Cloudflare · datos/auth/lógica = Firebase.

## Contenido (Ola 0.7 — modelo de datos v1)

- `firestore.rules` — frontera **PÚBLICO vs INTERNO/PII** (OD3), **fail-closed**. Schema TS en `../src/lib/domain/`.
- `firestore.indexes.json` — 13 índices compuestos declarados de antemano (tope 200; incluye barridos de cron).
- `storage.rules` — docs PRIVADOS (cédulas, contratos — B5): deny público total, solo staff/Functions.
- `firebase.json` — apunta a los tres anteriores.
- **Escritura server-side ONLY** (OD1, ratificación Fable pendiente): TODA escritura pasa por Cloud
  Functions (Admin SDK) → `allow write: if false` en las reglas. Los invariantes viven en las Functions
  (contador INM atómico OD8, `_version`, transacción anti-overbooking, `leadScore`, validación de garantía OD9).
  El client SDK del admin es SOLO lectura acotada. Seeding = scripts Admin SDK.
- Cloud Functions (lead intake + scoring, purga onWrite de caché, cron de recordatorios, transacción
  anti-overbooking, CRUD de admin): **pendientes** (Ola 1). Van aquí.

## ⚠️ Deploy = lo ejecuta el DUEÑO, y COORDINADO (nunca Claude)

`docs/50-CONFIG-INFRA.md`. Comando (desde `portal/firebase/`):

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project altorra-inmobiliaria-345c6
```

**RULESET ÚNICO Y FUSIONADO** (ADR §100). Firestore no fusiona rulesets: el último despliegue REEMPLAZA.
Por eso `firestore.rules` y `storage.rules` de esta carpeta contienen **legacy + portal**, y los DOS
`firebase.json` (el de la raíz y el de aquí) apuntan a estos mismos archivos — antes había dos ficheros
con el mismo nombre y desplegar desde la carpeta equivocada revertía el otro en silencio. Los rulesets
anteriores quedaron en `_legacy/*.PRE-FUSION` (son la vuelta atrás).

🔴 **ORDEN DE DESPLIEGUE, no negociable** (los permisos salen de custom claims, ADR §99):
1. `firebase deploy --only functions:default` (trigger `claimsStaffSync` + `sincronizarClaimsV2`).
2. El dueño pulsa **«Sincronizar permisos»** en admin.html → Usuarios.
3. Comprobar que admin.html sigue entrando y que `/gestion` abre el panel.
4. **Solo entonces** desplegar las reglas.
Si se despliegan antes de que existan los claims, NADIE es staff y el panel queda inaccesible.

✅ **Tests de reglas contra el emulador: HECHOS** (`npm run test:rules`, 80 verdes) — cubren que las
colecciones del legacy siguen vivas, que un autenticado SIN permisos no consigue nada, la distinción
viewer/editor/super_admin, y los dos agujeros cerrados (`system` y `newsletter`).

## Nota de acceso (OD1 — decisión fuerte, marcada para ratificación Fable)

Lecturas SSR/edge → **REST v1 de Firestore** detrás del edge-cache (el cache-miss es la única lectura).
Escrituras/lógica sensible (scoring, contadores atómicos, contratos, reserva) → **Cloud Functions**
(Admin SDK, que bypassa estas reglas). `firebase-admin` NO corre en Workers. Ver `../src/lib/data/client.ts`.
