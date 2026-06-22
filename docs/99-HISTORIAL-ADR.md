# 📚 99 — HISTORIAL (ADRs · Largo Plazo · Altorra Inmobiliaria)

> **NUNCA leer completo** (muerte por contexto). Usa `00-INDICE.md` para el offset exacto y lee SOLO ese tramo
> (`offset/limit`). Largo plazo: decisiones verificadas. **Convención**: `## NN. ADR — <título>`.
>
> ⚠️ **ADRs §01–§10 son SEMILLAS de migración** (2026-06-09): destilados de la bitácora monolítica
> `_legacy/AVANCES.md` (3420 líneas) al instalar el cerebro neuronal. NO siguen el formato canónico de 7 puntos
> (§2) — son hitos históricos con puntero al detalle íntegro en `_legacy/AVANCES.md`. Los ADRs §11+ sí son canónicos.

---

## 01. ADR — Etapa 0: proyecto Firebase + primer admin (2026-04-10)
Proyecto Firebase `altorra-inmobiliaria-345c6` creado: Firestore (Standard, nam5, prod), Auth (Email+Anónimo),
Storage, RTDB. Primer admin `info@altorrainmobiliaria.co` (UID `J1sXuV78OhPA5KyCoWNYFVQehF23`, `super_admin`).
**0-C**: deploy Cloud Functions — solo `createManagedUserV2` OK; las que llevan triggers Eventarc fallaron
(error Eventarc/Cloud Build perms — común en 1er deploy 2nd gen). Receta → `30 L-07` + `50-CONFIG-INFRA`. Detalle → `_legacy/AVANCES.md`.

## 02. ADR — Etapas 1-3: frontend dinámico + formularios + admin SPA (abr 2026)
Lectura de propiedades desde Firestore · formularios → `solicitudes` + Cloud Function email · panel admin SPA
`admin.html` (objeto global `window.IP`, patrón `window.AP` de cars). `updateUserRoleV2` añadida (RBAC 3 roles).

## 03. ADR — Catálogo 100% Firestore (2026-04-14/15)
Eliminado `fetch('properties/data.json')`; `data.json` borrado del filesystem; **Firestore = única fuente de verdad**
(como cars). Red de eventos de sync admin→público: `altorra:firebase-ready`/`db-ready`/`db-refreshed`
(`onSnapshot` sobre `system/meta.lastModified`)/`cache-invalidated`. Commits `d28437e`/`f5fc70a`. Ver `30 L-06`.

## 04. ADR — Etapas 4-8: Storage + SEO + favoritos + analytics + comercial (abr 2026)
Imágenes a Cloud Storage · SEO dinámico (GitHub Actions) · favoritos sincronizados Firestore · GA4 ·
features comerciales (simulador hipotecario amortización francesa, comparador hasta 3, mapa Google Maps,
avalúo, reseñas Firestore, push FCM, newsletter).

## 05. ADR — Bloques A-D: features de confianza/conversión (abr 2026)
Comparador · propiedades similares · wizard 3 pasos "Agenda visita"/"Publica propiedad" · selector multi-país
(10) · simulador hipotecario + PDF · lead scoring en CF `onNewSolicitud` · CRM Kanban admin (nuevo→contactado→
visita→cierre) · nurturing email · WhatsApp tracking UTM · blog inversionista · dashboard analytics admin ·
i18n ES/EN (~800 strings) · "Propiedades exclusivas" (prioridad ≥90).

## 06. ADR — SEO E1-E5 + landings de sector (abr 2026)
Meta/canonical/OG + JSON-LD (RealEstateAgent/LocalBusiness/BreadcrumbList) + sitemap · landings por intención
(Barú/La Boquilla/lotes) · blog dinámico · FAQ JSON-LD + lead magnet Guía Inversionista · LocalBusiness enriquecido.

## 07. ADR — Bloques F-I: perf/UX/nav + expansión SEO sectores (abr-may 2026)
Reorg home · Core Web Vitals · UX/a11y · `js/sector-properties.js` (props dinámicas en 13 landings) ·
workflow `bump-version.yml` ([skip ci]) · landing Tierrabomba (10.3633/-75.5786) · **BreadcrumbList en 43 páginas** ·
consolidar utilidades (`AltorraUtils`).

## 08. ADR — Auditoría profunda del repo (2026-05-04)
Inventario verificado: admin 7 archivos (~2.700 L), 20 features JS, 8 Cloud Functions (Node 20, us-central1),
13 sector landings, 5 propiedades Firestore. **Gaps J1-J5** identificados (ver `10` TODO-01..03). J1/J3/J4 cerrados
en el Mega-Plan; J2/J5 abiertos al cierre de bitácora.

## 09. ADR — Mega-Plan Fases 1-12 + FAQs masivas (2026-05-05/07)
Ejecución masiva de microfases (confianza, búsqueda, detalle premium, herramientas financieras, contenido,
conversión, humanización, inversión, equipo/marca, UX/perf, SEO avanzado). 2026-05-07: FAQs + FAQPage JSON-LD
en ~23 páginas, favoritos rediseñados, **130+ bloques JSON-LD en 66+ HTML**. `deploy-info` bumpeado a 2026-05-07.
⚠️ Numeración de fases DESORDENADA en el cuerpo de AVANCES — no asumir orden lineal.

## 10. ADR — §12 rescatado: smart-search.js + referencia Cars 1:1 (2026-04-16)
> ÚNICO contenido propio de inmobiliaria dentro del `ALTORRACARSCLAUDE.md` legacy (el resto era copia de cars,
> ahora en `_legacy/`). Rescatado al `99` ANTES de cuarentenar (límite de guardián).

**`js/smart-search.js` de inmobiliaria @2026-04-16 (verificado entonces) YA SUPERA a cars**:
| Feature | Cars | Inmobiliaria |
|---|---|---|
| Fuzzy typos | Levenshtein | **Damerau-Levenshtein** ✨ |
| Presupuesto (350m / 0.35b / 250-400m) | ❌ | ✅ |
| Sinónimos features ES/EN auto-aprendizaje | ❌ | ✅ |
| Re-ranking por clicks (popularidad) | ❌ | ✅ |
| Recientes localStorage + atajo `/` | ✅ | ✅ (añadido A1a) |
| Conteo por sugerencia · indicador `~` · ARIA completa | ✅ | 🔲 pendiente (A1b/A1c) |

→ Pendiente de portar de cars: conteo por sugerencia (A1b), indicador `~` fuzzy + ARIA (A1c) — ver `10` TODO-08
(⚠️ fechado 2026-04-16, ~2 meses atrás; **verificar contra `js/smart-search.js` real** antes de tratar como actual).
Referencia Cars para replicar 1:1 (Bloque A): hero (`#heroSearchInput`/`#heroSearchDropdown`), trust bar
(`#trustStatPropiedades`/`#trustStatCiudades`), featured-week-banner (`#fw-banner`), wizard (`#vendeWizardFill`
33/66/100%), country selector 10 países (+57 CO default,+58 VE,+593 EC,+507 PA,+52 MX,+1 US,+51 PE,+56 CL,+54 AR,+34 ES),
flujo home 10 secciones (categorías Apartamento/Casa/Lote/Oficina/Local/Bodega; barrios Bocagrande/Manga/Castillogrande/
Centro/Crespo/Manzanillo; 3 columnas Comprar|Arrendar|Invertir). Detalle íntegro → `_legacy/ALTORRACARSCLAUDE.md §12`.

## 11. ADR — Instalación del cerebro neuronal (2026-06-09)
**11.1 Causa raíz**: inmobiliaria no tenía cerebro neuronal (376KB de monolitos cruzados en la raíz, sin gobernanza,
sin linter) — banco de pruebas del macro-proyecto Cerebro Multi-Proyecto (ADR §170 del repo `altorracars`).
**11.2 Solución**: neurogénesis — linter canónico `brain-check.mjs` (KERNEL idéntico en los 3 repos) + `docs/.brain-manifest.json`
(budgets INSTANCE en chars) + githooks + `.claude/settings.json` (`--boot`) + estructura `docs/00..99` + lóbulo `41-MERCADO`.
**11.3 No-regresión**: Fase A `git mv` (no borrado) — los 7 monolitos preservados íntegros en `_legacy/` con history
intacta (renames detectados por git). El `§12` único de ALTORRACARSCLAUDE rescatado al `99 §10` antes de cuarentenar.
**11.4 Verificación**: `npm run brain:check` SANO (`--boot` + `--full`). **11.5 Anti-patterns**: cero pérdida (cuarentenar
no borrar §G.4); honestidad de estado (05/10 marcan "no re-verificado vs hoy"). **11.6 Modificados**: + `CLAUDE.md` (lean,
reemplaza monolito), + `docs/*`, + tooling; **INTACTO** todo el código del sitio (`js/`, `css/`, HTML, `functions/`, `data/`).
**11.7 Doctrina**: §170 + plan v5 (3 capas, single-writer, economía en chars). Detalle del macro → repo `altorracars`.

## 12. ADR — Auditoría Nivel-2 del cerebro (1ª REAL con artefacto) ⟦OPUS-4.8⟧ (2026-06-15)
**12.1 Causa/contexto**: el `deepAudit.last` del manifest declaraba `2026-06-09`, pero esa fue la fecha de INSTALACIÓN del cerebro (§11), NO de una auditoría semántica — sin artefacto (research-archive vacío, ningún ADR de auditoría). **Fachada de la fecha** (clase H-07 del fleet bersaglio: "etiqueta sin sustancia"). Coordinada por el operador del fleet (sesión `altorracars`) tras las Nivel-2 de cars (§207) y bersaglio (§82). **Modo DIRECTO/inline**: el workflow multiagente no sobrevivió a reinicios de sesión → se corrieron las sondas clave por verificación directa (fidelidad-git, frescura, fachada-deepAudit, cache, economía, ruteo). Artefacto: `research-archive/2026-06-15-auditoria-cerebro-nivel2-inmobiliaria.md`.
**12.2 Veredicto**: cerebro SANO y —a diferencia de sus hermanos— su `05`/`10` **NO mienten sobre git**: se auto-etiquetan "no re-verificado, verificar §3.3" (doctrina honesta CORRECTA). La falencia raíz del fleet (el tablero miente y el linter dice SANO) NO está aquí.
**12.3 Hallazgos**: **(F1·media) deepAudit FACHADA** → CURADO: esta auditoría es la 1ª real; deepAudit re-sellado a `2026-06-15` con artefacto. **(F2·baja) `00` sin fila de ruteo "¿está desplegado?"** (el gap más reincidente del fleet) → añadida (harmoniza con cars). **(F3·baja) `05` branch line stale** ("HEAD 165bfaa", main se movió 7 commits) → reconciliado lo VERIFICABLE (cerebro/instalacion `d4e1870` pushed, contenido en `main`); el estado de PRODUCTO/Firebase (pendientes J) sigue honestamente "no re-verificado".
**12.4 Positivo (no re-auditar)**: `05`/`10` honestamente-stale (modelo correcto cuando no puedes re-verificar) · monolitos en `_legacy` (cero pérdida) · gate SSoT activado (harmonización cross-repo previa, cf. cars §207.9) · cache no-stale (`altorra-pwa-v4` == SW). Sin M-NN aún (cerebro nuevo, no ha acumulado auto-crítica — normal).
**12.5 Pendiente real (owner-assisted)**: re-verificar el PRODUCTO (J2/J3/J5, CF Eventarc, secret CI, keys reales) contra Firebase/git — dominio del dueño, no hacible inline.
**12.6 Kernel/cross-repo**: `brain-check.mjs` byte-idéntico ×3, NO se toca aquí (single-writer = operador-cars). brain:check SANO. GC pareado: boot con headroom amplio (2079/4000 en 05, 5000/16000 en 10).

## 13. ADR — Consejo Externo: corrección factual "el provider externo (Antigravity) SÍ ve el repo" (2026-06-21) ⟦OPUS-4.8⟧

Propagación cross-repo desde **cars §224**. El `docs/15` (§2 paso 1) afirmaba "el provider externo NO ve el repo ni el cerebro → TODO el contexto va en el prompt". **FALSO**: Gemini **vía Antigravity** tiene acceso LOCAL al repo (solo-lectura), como Claude Code → el prompt **apunta a rutas/archivos reales**. Corregido en `docs/15`. La skill global `comite-expertos` (Paso 5) también corregida, **byte-idéntica ×4** (sha `48a5e2f6`). Preservado el límite VERDADERO: **NUNCA edita/implementa**. Sin cache bump (documental). Decisión + deliberación (workflow 7 ag.) + matriz de cuándo consultar → cars §224 + bóveda. **TIER COMPLETO** (ampliar triggers) = decisión del dueño.

## 14. ADR — Guardián del índice (`brain-index.mjs`): auto-reconcilia el mapa §→línea + valida tombstones (de cars TODO-32/§229) ⟦OPUS-4.8⟧ (2026-06-22)

Propagación cross-repo desde **cars TODO-32 / §229**. Instalado `scripts/brain-index.mjs` (byte-idéntico al canon cars, sha256 `CAFCAB9E…`), registrado en `kernelFiles` (lo vigila el check #11) + alias `npm run brain:index`.

**.1 Qué hace** — parsea los headers `## NN.` de `99`, arma el mapa §→línea ACTUAL y **RECONCILIA solo la columna de línea** de cada fila `| §X | … | N |` del `00` (preserva la descripción humana y la capa de ruteo semántico — esas filas no matchean y quedan intactas). Cura el drift de offsets que CUALQUIER inserción en `99` provoca — el toil que antes se arreglaba a mano. GATE (exit 1): header sin título, id duplicado, o tombstone `⛔ REEMPLAZADO POR §M` con destino inexistente (puntero colgante).
**.2 Por qué aplica aquí** — inmob usa headers numéricos (`## 01.`…`## 14.`) e índice con nº de línea → convención compatible con el canon cars. *(Contraste: bersaglio = headers fecha-leading sin anclaje mecánico de §N; insema = índice-por-proveniencia sin columna de línea → guardián N/A en ambos; ver sus ADRs. Matriz ×4 → cars §229.)*
**.3 Doctrina §228 (heredada)** — el índice es ON-DEMAND (no boot) → su tamaño casi no cuesta contexto → NUNCA se comprime con pérdida; si crece se tiera/sharda. El generador es GUARDIÁN, no reemplazo del índice a mano. Cap de `00` SIN cambios (índice pequeño; el ratchet §173 solo SUBE con justificación citada).
**.4 Tombstones (anti-Data-Rot)** — convención disponible: una marca `> ⛔ REEMPLAZADO POR §M` bajo un ADR superado avisa de NO aplicarlo y a dónde ir; el guardián valida que §M exista. (Sin casos en inmob aún.)
**.5 Verificación** — `brain:index` corrió y reconcilió el índice (incl. esta fila §14); `brain:check` SANO. Sin cache bump (documental/tooling). Decisión completa + matriz de compatibilidad ×4 → cars §229.
