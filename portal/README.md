# Portal ALTORRA Inmobiliaria (`portal/`)

Portal nuevo **greenfield** (MEGA-PLAN, Ola 0). Proyecto **Astro autocontenido** que despliega a
**Cloudflare Workers** (Static Assets). Vive en el mismo repo que el cerebro; el sitio viejo sigue
sirviéndose por GitHub Pages hasta el **cutover** (decisión del dueño, gate de salida de Ola 1).

## Stack (sellado — ADR §16 / `specs/R5-STACK-2026-07.md`)

- **Framework**: Astro + `@astrojs/cloudflare`, **híbrido por superficie**
  (`output: 'server'`; páginas estáticas con `export const prerender = true` explícito).
- **Hosting/edge**: Cloudflare Workers + Static Assets (NO Pages). Binarios públicos → R2.
- **Datos/auth/lógica**: Firebase (Firestore + Functions + Auth) — frontera dura: *edge = CF, datos = Firebase*.
- **Capa de acceso a datos FINA**: `src/lib/data/` es la única frontera con Firestore (ver su README).

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo local (astro dev, con platformProxy para bindings)
npm run build        # build de producción -> dist/
npm run preview      # previsualizar el Worker real (wrangler dev)
npm run verify:build # verificar el cableado híbrido (estática + SSR) en el dist
npm run cf-types     # generar tipos de bindings (worker-configuration.d.ts, para el editor)
npm run deploy       # desplegar a Cloudflare Workers (requiere cuenta CF configurada)
```

## Estado (Ola 0 ítem 1 — scaffold)

Scaffold que **construye y despliega a staging**. Contiene:
- `src/pages/index.astro` — página **estática** (prerenderizada). Centinela de build; el diseño real llega en carril D.
- `src/pages/api/health.ts` — endpoint **SSR** (prueba viva de que el Worker renderiza on-demand en el edge).
- `src/lib/` — capas: `data/` (frontera Firestore, skeleton), `domain/` (tipos, skeleton), `config/` (constantes de marca).
- `firebase/` — reglas/Functions nuevas del portal (placeholder; se pueblan en ítem 7).

Pendiente por ítem del plan: modelo de datos v1 (ítem 7), diseño (carril D), textos legales (ítem 6), AEO (ítem 4).
Nota: no hay typecheck en CI todavía (el scaffold casi no tiene código tipado); se cablea `astro check` en el ítem 7.

## CI/CD

`.github/workflows/portal-ci.yml`: el job **build** verifica el cableado de render en cada push a
`portal/**` (mitigación R2/R3). El job **deploy-staging** despliega a `*.workers.dev` y está *gated*
en la variable de repo `CF_DEPLOY_ENABLED == 'true'`.

### Prerrequisitos de deploy (los realiza el DUEÑO al configurar Cloudflare — Ola 0.2)

1. **Cuenta Cloudflare** creada + **Account ID** a mano.
2. **Bucket R2** creado con nombre exacto: `wrangler r2 bucket create altorra-portal-media`
   (tiene nombre explícito en `wrangler.jsonc` → **no** se auto-crea).
3. **API Token** con scopes de **creación** de recursos (no solo deploy):
   `Workers Scripts:Edit` + `Workers KV Storage:Edit` + `Workers R2 Storage:Edit` + `Account Settings:Read`.
   (El KV `SESSION` lo auto-aprovisiona Wrangler en el primer deploy; requiere esos scopes.)
4. Cargar en el repo: secrets `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`; variable `CF_DEPLOY_ENABLED = true`.

Detalle e infra → `docs/50-CONFIG-INFRA.md`.
