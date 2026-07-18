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
| **WhatsApp Business (WABA)** | `1089080446378494` — nombre "propietario" | ✅ en el portafolio · número **+57 300 2439810** vinculado ✅ · ⚠️ estado "Sin conexión" → **Daniel** abre la app WhatsApp Business en el teléfono para sincronizar · nit: renombrar el asset a algo claro |
| **Píxel / Dataset** | `1032884172712946` — **"ALTORRA Inmobiliaria - Web"** | ✅ CREADO 2026-07-18 (sin categorías restrictivas a propósito — Housing no aplica a CO, §34). Sin actividad: se cablea al portal (setup-previo §3) + CAPI Worker (§7) |
| Cuenta publicitaria vieja | `36557834` | CERRADA — se deja quieta (sin acción) |
| Personas | Daniel (FB, acceso total, activo) + Daniel (identidad IG, inactivo) | ✅ sin terceros |

## Pendientes que solo el dueño puede hacer (cazarlos en el próximo lote)
1. **Login de Instagram** en Business Suite (desbloquea asignaciones/apps del perfil).
2. **Abrir WhatsApp Business en el teléfono** → el número pasa de "Sin conexión" a conectado (requisito CTWA).
3. **Recargar saldo/confirmar método de pago** antes de encender (prepago actual ≈ COP 5k).
4. (Opcional, cosmético) Quitar el espacio final del nombre de la página · renombrar el WABA "propietario".

## Nota MCP
El conector oficial (`mcp.facebook.com/ads`) está instalado y responde; la cuenta activa aún dice
*"Ads MCP is gradually being rolled out"* → hasta que Meta la habilite, la operación fina va por el
navegador (como hoy). Re-verificar la habilitación al montar la campaña.
