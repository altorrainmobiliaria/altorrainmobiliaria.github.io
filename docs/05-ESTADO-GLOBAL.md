# 🩺 05 — ESTADO GLOBAL (Altorra Inmobiliaria · Heartbeat)

> Nodo de signos vitales. Se **AUTO-CARGA** (con `CLAUDE.md` + `10`). "¿En qué estado está el sistema AHORA?". Tope ~25 líneas (§G.5) — tablero, no bitácora.
> ⚠️ Estado **inferido de la bitácora** (`_legacy/AVANCES.md`, hasta 2026-05-07); ~1 mes sin registrar → **NO re-verificado** contra git/Firebase de hoy. Verificar antes de afirmar (§3.3).

| Señal | Valor (al 2026-05-07, no re-verificado) |
|---|---|
| **Build** | 🟢 Sitio LIVE y dinámico en `altorrainmobiliaria.co`: catálogo 100% Firestore (5 propiedades), admin SPA (`window.IP`), 8 Cloud Functions (Node 20), 13 landings de sector, 43 páginas con BreadcrumbList, 130+ JSON-LD, blog (7 posts). 🧠 **Cerebro neuronal instalado 2026-06-09** (neurogénesis desde monolitos). |
| **Cache version vigente** | `altorra-pwa-v4` (`service-worker.js`). Ctrl+Shift+R la 1ª vez. |
| **Branch** | prod `main` (HEAD `165bfaa` = bump cron deploy-info). Cerebro instalándose en `cerebro/instalacion`. |
| **deploy-info** | version `2026-05-07T09:04:11Z`, commit `ddce614` (merge PR #79 — análisis competidores). |
| **Deploy** | Lo ejecuta el **DUEÑO** (Firebase + push/merge) vía `docs/50-CONFIG-INFRA.md`. Claude solo commitea. |

## ⚠️ Flags de riesgo activos
- ⚠️ **Estado no re-verificado**: la bitácora cierra 2026-05-07; ~1 mes sin registrar. Antes de afirmar qué está live/pendiente, cruzar con git + Firebase reales.
- ⏳ **Pendientes (al cierre de bitácora — PUEDEN estar resueltos)**: J2 (FormSubmit residual en 4 páginas) · J3 (3 páginas sin firebase-config) · J5 (sin tests) · re-deploy CF con triggers Eventarc · secret CI `GOOGLE_APPLICATION_CREDENTIALS_JSON` · keys GMAPS/VAPID. Detalle → `10` + `docs/50-CONFIG-INFRA.md`.
- 🧠 **Cerebro recién instalado**: validar en la 1ª sesión que boot + `brain:check` funcionen; destilar más de `_legacy/AVANCES.md` (3420 L) a `99`/`30` on-demand (Fase B).

## 🧩 Sub-sistemas
público (vanilla + Firebase modular v12.9.0) ✅ · admin SPA ✅ · 8 Cloud Functions ✅ · SEO (JSON-LD/sitemap/landings) ✅ · cache 3 capas + SW ✅
