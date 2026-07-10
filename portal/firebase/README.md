# Firebase del PORTAL (nuevo) — reglas y Cloud Functions greenfield

> Stack sellado (ADR §16): el proyecto Firebase `altorra-inmobiliaria-345c6` se **REUSA**. Las 7
> Cloud Functions legacy se apagan **al cutover** (no ahora). Las reglas y Functions NUEVAS del
> portal viven AQUÍ, separadas del sitio viejo.

Se puebla en **Ola 0 ítem 7** (modelo de datos v1) / Ola 1. Placeholder por ahora.

⚠️ **Deploy de Firebase (rules/functions) = lo ejecuta el DUEÑO** (`docs/50-CONFIG-INFRA.md`),
NUNCA Claude. La frontera dura del stack: edge/render = Cloudflare · datos/auth/lógica = Firebase.
