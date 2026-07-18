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
| **Instagram** | `@altorrainmobiliaria` (asset `102476579273811`) | ✅ en el portafolio · ⚠️ "Inicio de sesión necesario" → **Daniel** debe loguear IG desde Configuración→Cuentas de Instagram |
| **WhatsApp Business (WABA)** | `1089080446378494` — nombre "propietario" | ✅ en el portafolio · número **+57 300 2439810** vinculado ✅ · **Conectado** ✅ (`verificado-vivo: 2026-07-18` — Daniel abrió la app y el número sincronizó) · vínculo **página FB↔WhatsApp ✅ verificado** (número principal de la página + botón CTA WhatsApp ON + mostrar número ON → **requisito CTWA cumplido**) · nit: renombrar el asset NO está expuesto en la UI actual (intentado 07-18: menú "…" de Business settings y WhatsApp Manager, sin opción) |
| **Píxel / Dataset** | `1032884172712946` — **"ALTORRA Inmobiliaria - Web"** | ✅ CREADO 2026-07-18 (sin categorías restrictivas a propósito — Housing no aplica a CO, §34). Sin actividad: se cablea al portal (setup-previo §3) + CAPI Worker (§7) |
| Cuenta publicitaria vieja | `36557834` | CERRADA — se deja quieta (sin acción) |
| Personas | Daniel (FB, acceso total, activo) + Daniel (identidad IG, inactivo) | ✅ sin terceros |

## Pendientes que solo el dueño puede hacer (cazarlos en el próximo lote)
1. **Login de Instagram** en Business Suite (desbloquea asignaciones/apps del perfil). *(07-18: pantalla dejada abierta en Chrome con el botón "Iniciar sesión" listo.)*
2. ~~Abrir WhatsApp Business en el teléfono~~ ✅ **HECHO 2026-07-18** — número **Conectado** + vínculo página↔WhatsApp verificado (CTWA listo).
3. **Recargar saldo/confirmar método de pago** antes de encender (prepago actual ≈ COP 5k).
4. (Opcional, cosmético) Quitar el espacio final del nombre de la página. *(El renombre del WABA "propietario" NO está disponible en la UI — verificado 07-18.)*

## Nota WhatsApp Manager (07-18)
Alerta "Falta un método de pago válido" en WhatsApp Manager: aplica SOLO a conversaciones **iniciadas
por el negocio** (plantillas / API). Las iniciadas por el cliente (CTWA = nuestro playbook) siguen en
período gratuito → **NO es gate para encender la pauta**. Se revisará si algún día enviamos plantillas.

## Nota MCP
El conector oficial (`mcp.facebook.com/ads`) está instalado y responde; la cuenta activa aún dice
*"Ads MCP is gradually being rolled out"* → hasta que Meta la habilite, la operación fina va por el
navegador (como hoy). Re-verificar la habilitación al montar la campaña.
