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

**COORDINACIÓN CRÍTICA**: el proyecto Firestore lo comparte el **sitio legacy** (admin.html de consulta).
Desplegar estas reglas **REEMPLAZA el ruleset del proyecto** → el `default deny-all` deniega toda colección
legacy no declarada aquí. Por eso:
- **NO desplegar** hasta coordinar con el retiro del legacy (idealmente en/cerca del **cutover**), o
- añadir primero las match-rules de las colecciones legacy que el admin de consulta aún necesite.

**Pendiente antes de desplegar** (T6): tests de reglas contra el **emulador de Firebase**
(`firebase emulators:exec`) — la partición PUBLIC/PII y el `deny-all` deben probarse, no asumirse.

## Nota de acceso (OD1 — decisión fuerte, marcada para ratificación Fable)

Lecturas SSR/edge → **REST v1 de Firestore** detrás del edge-cache (el cache-miss es la única lectura).
Escrituras/lógica sensible (scoring, contadores atómicos, contratos, reserva) → **Cloud Functions**
(Admin SDK, que bypassa estas reglas). `firebase-admin` NO corre en Workers. Ver `../src/lib/data/client.ts`.
