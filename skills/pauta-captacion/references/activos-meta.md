# Activos Meta de ALTORRA Inmobiliaria — inventario REAL (ordenado 2026-07-18, ADR §38)

> Auditoría + limpieza ejecutada EN VIVO (MCP oficial + Chrome del dueño, con sus aprobaciones explícitas).
> Estos IDs son identificadores operativos (no secretos — el pixel ID viaja en el HTML público igual).
> El token de CAPI, cuando exista, va como SECRET del Worker — JAMÁS aquí.

## Estructura vigente (post-limpieza)
| Activo | ID | Estado |
|---|---|---|
| **Business portfolio** | `807047192483289` — "Altorra Inmobiliaria" | ✅ (hermano: "Altorra Cars", separado) |
| **Cuenta publicitaria** | `1784008112275023` — renombrada **"ALTORRA Inmobiliaria - Ads"** | ✅ RECLAMADA al portafolio 2026-07-18 (permanente; términos comerciales aceptados con ok de Daniel). COP · prepago (saldo ~$4.992 COP al 07-18 — recargar antes de pautar) · ⚠️ aún NO habilitada para Ads MCP (rollout gradual de Meta — reintentar) |
| **Página de Facebook** | `807043122483696` — "Altorra Inmobiliaria " | ✅ en el portafolio como página principal · nit: espacio al final del nombre (editar en la Página, no crítico) |
| **Instagram** | `@altorrainmobiliaria` (asset `102476579273811`) | ✅ en el portafolio · **página↔IG CONECTADO ✅** (`verificado-vivo: 2026-07-18`, settings de la página: cubre contenido, ANUNCIOS, estadísticas, mensajes → **placement IG listo para pauta**) · **login del asset en BM ✅ CERRADO 2026-07-18** (el OAuth web daba "Sorry, something went wrong" — bug de Meta; Daniel lo completó desde el CELULAR y funcionó; quedaron 2 personas asignadas: identidad IG acceso total + FB acceso parcial incl. Anuncios) · toggle "DMs de IG en bandeja de la página" = OFF (decisión dueño) |
| **WhatsApp Business (WABA)** | `1089080446378494` — nombre "propietario" | ✅ en el portafolio · número **+57 300 2439810** vinculado ✅ · **Conectado** ✅ (`verificado-vivo: 2026-07-18` — Daniel abrió la app y el número sincronizó) · vínculo **página FB↔WhatsApp ✅ verificado** (número principal de la página + botón CTA WhatsApp ON + mostrar número ON → **requisito CTWA cumplido**) · nit: renombrar el asset NO está expuesto en la UI actual (intentado 07-18: menú "…" de Business settings y WhatsApp Manager, sin opción) |
| **Píxel / Dataset** | `1032884172712946` — **"ALTORRA Inmobiliaria - Web"** | ✅ CREADO 2026-07-18 (sin categorías restrictivas a propósito — Housing no aplica a CO, §34). Sin actividad: se cablea al portal (setup-previo §3) + CAPI Worker (§7) |
| Cuenta publicitaria vieja | `36557834` | CERRADA — se deja quieta (sin acción) |
| Personas | Daniel (FB, acceso total, activo) + Daniel (identidad IG, inactivo) | ✅ sin terceros |

## Pendientes que solo el dueño puede hacer (cazarlos en el próximo lote)
1. ~~Login de Instagram~~ ✅ **HECHO 2026-07-18** — el OAuth web falló ("Sorry, something went wrong", bug de Meta) pero Daniel lo completó **desde el celular** y funcionó. 📚 Lección reutilizable: cuando un flujo OAuth de Meta falle en web, probar la vía móvil (app Business Suite / IG del teléfono) antes de pelear con cookies.
2. ~~Abrir WhatsApp Business en el teléfono~~ ✅ **HECHO 2026-07-18** — número **Conectado** + vínculo página↔WhatsApp verificado (CTWA listo).
3. **Recargar saldo/confirmar método de pago** antes de encender (prepago actual ≈ COP 5k).
4. (Opcional, cosmético) Quitar el espacio final del nombre de la página. *(El renombre del WABA "propietario" NO está disponible en la UI — verificado 07-18.)*

## Centro de seguridad del portfolio (ordenado 2026-07-18)
- **Dominio de confianza agregado** ✅: `altorrainmobiliaria.co` (aprobación de pares) — ya figura en "Acción completada". Solo el dominio de producción; el staging workers.dev NO se agrega (no recibe pauta).
- **Protección de la cuenta publicitaria**: guardada 2× con "Cambios aplicados" → **Protección predeterminada** (solo anuncios sospechosos requieren aprobación) + **Daniel Romero marcado como aprobador** (checkbox verificado). Se DESCARTÓ "adicional" (aprobar cada anuncio = fricción para operador único) y "personalizada" (tope por presupuesto redundante: la cuenta es prepago).
- ⚠️ **Alerta residual que puede NO desaparecer**: el panel sigue diciendo "0 aprobadores"/"1 cuenta sin la opción". Diagnóstico: recomputo perezoso del panel o el contador solo cuenta pares NO-admin (los admins son revisores implícitos; en negocio unipersonal no existe "par"). **NO bloquea pautar** — no reintentar en loop.
- **2FA del portfolio = "Nadie"** (pendiente decisión del dueño): subirla a "Todos" exige que su FB personal tenga 2FA activo ANTES o se bloquea el acceso. Proponérselo, no tocarlo unilateralmente.
- **Verificación del negocio DISPONIBLE** ("Cumple los requisitos para la verificación"): opcional, NO es gate de pauta; requiere docs del negocio (dueño). Recomendable post-obra.
- **NO se activó** "Require ads to use trusted website domains for all landing pages": interacción con destino CTWA (WhatsApp) sin verificar — revisitar tras la 1ª campaña.
- Completadas previas: acceso total ≤10 usuarios ✅ · administrador alternativo ✅.

## Nota WhatsApp Manager (07-18)
Alerta "Falta un método de pago válido" en WhatsApp Manager: aplica SOLO a conversaciones **iniciadas
por el negocio** (plantillas / API). Las iniciadas por el cliente (CTWA = nuestro playbook) siguen en
período gratuito → **NO es gate para encender la pauta**. Se revisará si algún día enviamos plantillas.

## Nota MCP
El conector oficial (`mcp.facebook.com/ads`) está instalado y responde; la cuenta activa aún dice
*"Ads MCP is gradually being rolled out"* → hasta que Meta la habilite, la operación fina va por el
navegador (como hoy). **Re-verificada 2ª vez el mismo 2026-07-18 (sesión posterior): sigue `false`** —
re-verificar con `ads_get_ad_accounts` al inicio de cada sesión de pauta. Dato útil del API:
`min_daily_budget` COP ≈ 3.319/día. El montaje del HUMO quedó reducido a runbook:
bóveda `pauta/outputs/2026-07-18-humo/montaje-ads-manager-runbook.md` (10 min en vivo, o por MCP si ya habilitó).
