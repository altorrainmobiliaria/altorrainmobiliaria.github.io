# 🗂️ 00 — ÍNDICE SINÁPTICO (Altorra Inmobiliaria)

> Dos capas: (1) **enrutamiento semántico** (síntoma/tema → neurona) para no escanear el cerebro;
> (2) **mapa § → línea** del `99-HISTORIAL` para leerlo por offset (regla de oro anti-saturación, §0).
> ⚠️ Las líneas son **pistas** (pueden desincronizarse). `npm run brain:check` valida el desync.
> 🛡️ **`npm run brain:index` AUTO-RECONCILIA la columna Línea** desde los headers de `99` (cura el drift; guardián de cars TODO-32/§14). 🪦 **Tombstone**: `> ⛔ REEMPLAZADO POR §M` bajo un ADR superado = NO lo apliques, ve a §M (el guardián valida que §M exista).

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona)

| Si necesitas… | Ve a |
|---|---|
| Decisión Fuerte / auditoría / revisión / diseño-UI no trivial (¿aplico el flujo del dueño?) | 🔁 `60-WORKFLOWS` **W-11** (COMPLETO o nada + 3 artefactos: mockup·prompt-Gemini·prompt-Chrome) + skill `proceso-decision-fuerte` |
| Identidad, stack, reglas absolutas, gobernanza | `CLAUDE.md` |
| Estado actual (build/cache/branch/flags) | `05-ESTADO-GLOBAL` |
| ¿Está desplegado? / antes de afirmar qué hay en PRODUCCIÓN / "ya pusheé" | `git fetch` + `git log origin/main` SIEMPRE; el `05` se auto-marca "no re-verificado" → NO autoritativo sin git real (§3.3) |
| En qué se está trabajando / pendientes (TODO-NN) | `10-MEMORIA-CORTO-PLAZO` |
| Dónde vive un componente, flujo, **schema Firestore**, blog | `20-MEMORIA-ESPACIAL` |
| Un bug/síntoma que "te suena", receta, gotcha | `30-LECCIONES` |
| Project ID, cuentas IAM, deploy, secrets | `50-CONFIG-INFRA` |
| Competencia/mercado inmobiliario, benchmark | `40-LOBULOS` → `41-MERCADO` |
| El "por qué" de una decisión / detalle histórico | este índice → `99-HISTORIAL` (offset) |
| Decisión cara de revertir (2ª opinión externa) | `15-CONSEJO-EXTERNO` |
| "No se actualiza el sitio tras editar admin" | `30 L-06` (cache `system/meta` → onSnapshot) |
| "Access denied / permission-denied al login" | `30 L-01`/`L-02` |
| Deploy de Cloud Functions falla (Eventarc) | `30 L-07` + `50-CONFIG-INFRA` |
| smart-search / hero / replicar patrón de cars | `99 §10` (§12 rescatado) |

---

## 📚 Mapa de ADRs § → línea (99-HISTORIAL)

> `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.

| § | Tema | Línea |
|---|---|---|
| §01 | Etapa 0: Firebase + primer admin (0-C Eventarc) | 12 |
| §02 | Etapas 1-3: frontend dinámico + forms + admin SPA | 18 |
| §03 | Catálogo 100% Firestore (data.json eliminado) | 22 |
| §04 | Etapas 4-8: Storage/SEO/favoritos/analytics/comercial | 27 |
| §05 | Bloques A-D: features confianza/conversión | 32 |
| §06 | SEO E1-E5 + landings de sector | 38 |
| §07 | Bloques F-I: perf/UX/nav + expansión SEO | 42 |
| §08 | Auditoría profunda 2026-05-04 (gaps J1-J5) | 47 |
| §09 | Mega-Plan Fases 1-12 + FAQs masivas | 52 |
| §10 | §12 rescatado: smart-search + referencia Cars 1:1 | 58 |
| §11 | Instalación del cerebro neuronal (2026-06-09) | 80 |
| §12 | Auditoría Nivel-2 #1 REAL (mata la fachada del deepAudit) | 92 |
| §13 | Consejo Externo: corrección factual "el provider (Antigravity) SÍ ve el repo, solo-lectura" + skill comité ×4. Propagación de cars §224. ⟦OPUS-4.8⟧ | 100 |
| §14 | Guardián del índice `brain-index.mjs`: auto-reconcilia §→línea + valida tombstones (de cars TODO-32/§229). ⟦OPUS-4.8⟧ | 104 |
| §15 | **Arranque Fable 5**: misión GREENFIELD (specs madre en `specs/`) + liderazgo kernel ×4 asumido + MODO OBRA live (mantenimiento + 65 redirects + SW v5 kill-switch). Obsoleta TODO-01..06/08 del sitio viejo. ⟦FABLE-5⟧ | 114 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` · `00-INDICE` (este) · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijo `41-MERCADO`) · `50-CONFIG-INFRA`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
