# CLAUDE.md — altorrainmobiliaria · 🌉 PUENTE (este repo es el SITIO, no el cerebro)

## Tu cerebro NO está aquí

Este repo es **solo el sitio** (ALTORRA Inmobiliaria). Tu memoria vive en `../brain-private/altorrainmobiliaria/`:
`CLAUDE.md` (el router), `docs/05-ESTADO-GLOBAL.md`, `docs/10-MEMORIA-CORTO-PLAZO.md`, `specs/` y las demás.

Los tres primeros entran **ENTEROS** por los imports de abajo (desde el 14-nov-2026; medido en una sesión
nueva). El hook de arranque añade los avisos vivos, y su eco llega **cortado** si pasa de 10.000 c: no te
fíes de él para el router, el `05` ni el `10`. **Si no los ves en tu contexto, falta el permiso de imports
externos de esta carpeta: LÉELOS POR RUTA** y avísale a Daniel.

@../brain-private/altorrainmobiliaria/CLAUDE.md
@../brain-private/altorrainmobiliaria/docs/05-ESTADO-GLOBAL.md
@../brain-private/altorrainmobiliaria/docs/10-MEMORIA-CORTO-PLAZO.md

## Dónde va cada cosa

- Cerebro (`docs/`, `specs/`, router, ADRs) → **en la bóveda** `../brain-private/` (su pre-commit corre el
  linter). Aquí solo se miran secretos y contratos del legacy.
- Sitio (legacy, `portal/`, `functions/`) → **aquí**, en `main` (push = Pages; `portal-ci` despliega el
  Worker). Nunca los dos en el mismo commit.

## Reglas de oro DE ESTE SITIO

- **NO borres `CNAME`** (`altorrainmobiliaria.co`) ni `_config.yml` (Jekyll `exclude` con `portal/`);
  sin `.nojekyll`. **NO dispares `og-publish.yml`**: pisaría los stubs de redirect.
- Cloud Functions: a MANO (Claude). El SW legacy es un kill-switch: no se bumpea.
- Vanilla en el legacy · Astro en `portal/`. La `apiKey` de Firebase es pública;
  **JAMÁS** secretos ni el móvil personal: repo PÚBLICO (`secretos.yml` en CI).
- `git add` específico, jamás `-A`. **NUNCA** `--amend`, `--no-verify` ni push `-f`.

*(Puente F8 · kernel en `../brain-private/kernel/`, vía `.claude/settings.json`.)*
