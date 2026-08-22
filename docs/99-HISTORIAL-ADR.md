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

## 15. ADR — Arranque Fable 5: misión GREENFIELD, liderazgo del kernel ×4 asumido, MODO OBRA live ⟦FABLE-5⟧ (2026-07-10)

> Mandato del dueño (VERBATIM en `specs/2026-07-10-INMOBILIARIA-MANDATO-DUENO-verbatim.md` + síntesis operativa en `specs/2026-07-10-INMOBILIARIA-KICKOFF-fable5.md`): *"ALTORRAINMOBILIARIA.CO LO HAREMOS DESDE CERO… de altorra inmobiliaria no me gusta nada de diseño… ERES TU QUIEN TOMARA LAS RIENDAS DEL MEJOR PORTAL INMOBILIARIO"*.

- **15.1 Causa raíz / contexto**: el sitio viejo (primera web del dueño) = diseño anticuado/genérico, contenido ~90% falso, no alineado con la visión real (portal de 3 lados: listado propio + marketplace por suscripción + portal aliados/brokers + panel admin/CRM). Cars pasa a PAUSA; inmobiliaria = prioridad #1 y NUEVO LÍDER del cerebro ×4 (cars §302). ⛔ Regla innegociable: greenfield ABSOLUTO — cero reutilización de código/diseño/arquitectura del sitio viejo; cosecha SOLO datos reales, historial SEO (mapa 301), docs legales/operativos y aprendizaje del cerebro.
- **15.2 Solución estructural**: (a) specs madre copiados a `specs/`; (b) payload sinapsis L-08..L-12 aplicado a `30`; (c) **liderazgo kernel asumido**: skill `sinapsis-cerebros` §1/§4/§5 actualizada (líder=inmobiliaria) + constancia propia en `60-WORKFLOWS` + payloads de constancia ×3 (`references/import-{cars,bersaglio,insema}-2026-07-10-liderazgo.md` — el harness bloquea writes cross-repo, regla 5); (d) **MODO OBRA live**: `index.html` de mantenimiento (copy §9 del kickoff APROBADO verbatim, oscuro+oro, logo real de `Branding y Membretes` en placa marfil, CTA WhatsApp +57 323 501 6747, JSON-LD RealEstateAgent con razón social/NIT) + 65 stubs meta-refresh-0+canonical→home (root+blog+p) + `404.html`→home + `sitemap.xml` solo-home + `service-worker.js` v5 KILL-SWITCH (borra cachés, unregister, recarga clientes) + `og-publish.yml` solo `workflow_dispatch` (su cron 4h regeneraría fichas/sitemap sobre los stubs).
- **15.3 No-regresión**: `CNAME` intacto; GSC preservado DOBLE (meta `google-site-verification` re-inyectado en el index nuevo + `googlec4e47cae776946d9.html` intacto); `admin.html`/`limpiar-cache.html`/`js/`/`css/`/`data/`/`functions/` intactos (consulta + referencia de cosecha); TODO el sitio viejo recuperable por git history.
- **15.4 Verificación**: `brain:check` SANO ×3 corridas; preview local (screenshots desktop+mobile; fix real de layout: centrado flex recortaba el logo → `margin:auto` en `.wrap`, `plateTop=48` en scroll 0 verificado por eval); stubs muestreados (`contacto.html`, `p/0000.html`). Validación LIVE post-deploy en dominio = pendiente inmediato.
- **15.5 Anti-patterns evitados**: sin `git add -A`; sin borrar archivos (history + intactos = cuarentena); sin `noindex` en stubs (quemaría el SEO — meta-refresh 0 ≈ redirect para Google, único mecanismo en GH Pages); SW kill-switch en vez de esperar expiración de caché (clientes con `altorra-pwa-v4` verían el sitio viejo); workflow neutralizado ANTES del push (carrera CI vs stubs).
- **15.6 Archivos**: NUEVOS `specs/`×2 · `assets/brand/altorra-inmobiliaria-logo.png` · 3 payloads en la skill global. MODIF `index.html` · `404.html` · 65 stubs · `service-worker.js` · `sitemap.xml` · `.github/workflows/og-publish.yml` · `docs/{05,10,30,60,00,99,.brain-manifest}` · `~/.claude/skills/sinapsis-cerebros/SKILL.md`. INTACTOS: los listados en 15.3.
- **15.7 Doctrina + cache**: cache bump `altorra-pwa-v5` (§4). Pendientes del sitio viejo **OBSOLETOS por greenfield**: TODO-01..06 y TODO-08 (J2/J3/J5, Eventarc re-deploy, secret CI, keys GMAPS/VAPID, smart-search) — las páginas con esos gaps ya no existen como producto; TODO-07 (destilar `_legacy`) SIGUE vivo. Gobernanza de deploy RENEGOCIADA por mandato de autonomía total (2026-07-10): Claude commitea Y pushea/mergea a `main` (GH Pages auto-deploy); el deploy de FIREBASE (functions/rules) sigue siendo del dueño. Programa vivo → `10` (R0→R5, diseño D0-D4, mega-plan).

> **⚠️ ACTUALIZACIÓN mismo día (corrección del dueño tras ver la página)**: (1) **contacto público** = WhatsApp **+57 300 243 9810** + **info@altorrainmobiliaria.co** — el +57 323 501 6747 del kickoff §9 es el teléfono PERSONAL de Daniel (venía de los docs registrales) y NO se difunde; corregidos index.html + JSON-LD. (2) **Colores de marca inmobiliaria: SIN negro** (el negro es de cars): dorado · plata · blanco · **azul turquí** — página re-diseñada a fondo blanco/navy/oro y CLAUDE.md §1 actualizado (insumo VINCULANTE para D0/D1). (3) Delegación git EXPLÍCITA re-confirmada por el dueño ("los commit, push y merge y deploys debes hacerlos tu") → CLAUDE.md §2 actualizado; el clasificador auto-mode aún puede bloquear push/merge — en ese caso el dueño ejecuta o añade la regla de permiso (no burlar).

## 16. ADR — STACK del portal greenfield SELLADO (W-11: comité ×3 + juez + fallo Fable) ⟦FABLE-5⟧ (2026-07-10)

**16.1 Decisión**: Cloudflare **Workers Static Assets** (NO Pages — en mantenimiento desde 2025) + **Astro híbrido por superficie** (landings SSG · fichas SSR+edge-cache con purga selectiva por URL · SERP shell+isla · booking dinámico · admin SPA) + **Firebase se mantiene** (Firestore/Functions/Auth/RTDB) + **R2 día 1** para imágenes públicas (derivados WebP fijos al subir; Firebase Storage solo docs privados) + **Wompi** rail de recaudo (retención = mandato+estados propios, GATE abogado B2/B9; card-hold descartado por PSE/Nequi sin hold; MercadoPago Split = plan B) + **MapLibre+Protomaps** + búsqueda por fases (client-side → tripwire → **Typesense Cloud** gestionado; BD del tripwire geo = **Neon**, Supabase vetada por pausa-7-días) + **Resend** (3.000/mes·100/día VERIFICADO → alertas en digest) + GA4+CF Analytics+GSC.
**16.2 Proceso**: comité adversarial ×3 en Opus (claims con fuentes 2025-2026) + juez → 5 fricciones y 7 preguntas abiertas → deliberación y fallos de Fable (Q1-Q7). Detalle íntegro → `specs/R5-STACK-2026-07.md`; crudo → bóveda `research-archive/2026-07-10-r5-comite-stack-crudo.txt`.
**16.3 Consejo externo**: ✅ **INTEGRADO** (mismo día — W-11 COMPLETO): Gemini CONVERGIÓ en pagos (mandato+estados+dispersión = nuestro diseño (a), llegando independiente) y aportó 4 adopciones (presupuesto TTFB p75<800ms por el split CF↔Firestore · test de carrera anti-overbooking como gate de Ola 2 · WhatsApp Cloud API · nunca-servir-originales). Su veto a Firestore/pro-Supabase quedó REFUTADO con evidencia (recomendaba Pages-en-mantenimiento con "builds ilimitados" falsos; omitió la pausa de 7 días de Supabase; atacó features fuera del MVP). Detalle → adenda en `specs/R5-STACK-2026-07.md`; crudo → bóveda.
**16.4 No-regresión**: decisión documental; el repo actual (modo obra) queda INTACTO. El portal nuevo nace en repo/estructura que definirá el MEGA-PLAN.
**16.5 Anti-patterns evitados**: SSG puro de fichas (tope 20K archivos + rebuild por cambio) · SSR en Cloud Functions (cold start) · Firebase Storage para públicas (egress) · self-host de búsqueda (viola sin-devops) · custodia de fondos sin gate legal.
**16.6 Reversibilidad**: capa de acceso a datos fina + pagos enchufables + read-model tripwire documentado = las decisiones caras tienen salida escrita.
**16.7 Doctrina**: §3.6 arquitecto · §3.7 comité por iniciativa propia · 15-CONSEJO (humano en el medio) · §3.3 claims verificados (Resend verificado por Fable; resto por comité con fuente).

## 17. ADR — MEGA-PLAN por olas sellado + protocolo de relevo a Opus 4.8 ⟦FABLE-5⟧ (2026-07-10)

**17.1 Decisión**: roadmap en 4 olas (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT): Ola 0 fundaciones (scaffold `portal/` en ESTE repo con CI→Workers staging + D0/D1 diseño + página de obra enriquecida AEO + GBP + textos legales B1 + modelo de datos v1) → Ola 1 MVP público (gate de salida = cutover DNS) → Ola 2 dinero+arriendo digital (post-gate abogado B2/B9) → Ola 3 expansión. Carril D (D0-D4) paralelo: NADA de UI sin mockup aprobado; el dueño elige la dirección en D0.
**17.2 Arquitectura operativa**: mismo repo (cerebro+delegación git ya funcionan), portal en `portal/`, staging continuo en workers.dev, GH Pages sirve la obra hasta el cutover; limpieza del sitio viejo AL cutover (L-13: no fiarse de deploys invisibles).
**17.3 Relevo**: Fable al 91% semanal → **Opus 4.8 implementa desde Ola 0 ítem 1** con el protocolo del §4 del plan (boot G.1 + specs R1-R5 + 42-LEGAL; IAP; mockup-first; verify en staging; tag OPUS-4.8; gates del dueño §5). Fable audita al cierre de cada ola cuando su cuota regrese (protocolo cars §300).
**17.4 No-regresión**: la obra live queda intacta; el plan es documental. **17.5 Anti-patterns**: re-investigar lo verificado · UI sin mockup · dinero sin gate · reindexar sin contenido. **17.6 Basado en**: R0-R4 + ADR §16 + gates B1-B17 + top-10 R2 + 14 oportunidades R1. **17.7 Doctrina**: §3.6 · §G.3 · kickoff §5-§7.

## 18. ADR — Programa R0-R5 COMPLETO en un día + cierre de la sesión de planificación Fable ⟦FABLE-5⟧ (2026-07-10)

**18.1 Qué se cerró**: la fase completa de investigación/planificación del greenfield en UNA sesión (~74 agentes en 6 workflows + navegación live): **R0** cosecha (63 URLs · destilado _legacy 52 features · Firestore censado: propiedades vacía/descartadas · matrícula OBTENIDA) → **R1** competencia 3 lentes (11 portales verificados + live: precios Ciencuadras/Proppit 💎, Airbnb Cartagena 1000+ 💎, Fincaraíz post-login, UI-tour → bóveda) → **R2** referentes (59 features adopt/adapt/discard · top-10 MVP · QuintoAndar 3 fases CO) → **R3** legal (lóbulo 42-LEGAL · 17 gates B1-B17 · decisión: NO comentar consulta RNT, monitorear decreto final) → **R4** operación (docs maestros destilados+sanitizados · SEO local · regla AEO contenido-antes-de-reindexar) → **R5** stack sellado (§16, W-11 completo con Gemini integrado) + MEGA-PLAN (§17) + módulo GESTIÓN (§3b del plan) + regla visión-PRO (docs del dueño = dominio, no estándar).
**18.2 Artefactos**: `specs/R0..R5-*.md` + `MEGA-PLAN-INMOBILIARIA.md` (SSoT roadmap) + lóbulos `41`/`42` + 6 crudos en bóveda privada + L-13.
**18.3 Colas menores absorbidas por el plan**: conteo `solicitudes` (MCP stale) y censo Storage → mueren solos al cutover (datos descartados; solo curiosidad histórica) ó los toma Opus si les ve valor; 2ª pasada .xlsx FTI-01 + piloto ALTORRA-PILOTO-main → insumo del modelo de datos en Ola 0.7 (MEGA-PLAN).
**18.4 Relevo**: Opus 4.8 arranca Ola 0 ítem 1 con MEGA-PLAN §4; Fable audita al cierre de cada ola al volver su cuota (~jueves). **18.5 No-regresión**: obra live intacta y verificada. **18.6 Estado**: cerebro SANO, todo pusheado. **18.7 Doctrina**: §G.3/§G.4 (consolidación+GC), kickoff §5-§7, protocolo cars §300.

## 19. ADR — Ola 0.1: scaffold del portal (Astro 7 + Cloudflare Workers), verificado end-to-end ⟦OPUS-4.8⟧ (2026-07-10)

**19.1 Contexto / decisión ejecutada**: PRIMERA implementación del greenfield (arranque Opus, MEGA-PLAN §4). Scaffold `portal/` autocontenido según stack sellado §16. **Descubrimiento load-bearing (verificado contra docs, NO de memoria — §3.3)**: `npm install @latest` trajo **Astro 7 · @astrojs/cloudflare v14 · wrangler 4.110 · TypeScript 7** — mayores más nuevos que cualquier suposición del cutoff. Gotcha resuelto: en Astro 6+ el `main` del `wrangler.jsonc` apunta al **entrypoint unificado** `@astrojs/cloudflare/entrypoints/server` (existe en build-time), NO a `dist/server/entry.mjs` (no existe aún → rompe el `@cloudflare/vite-plugin`). El adapter LEE el `wrangler.jsonc` raíz y FUSIONA los bindings en el `dist/server/wrangler.json` generado (→ L-14).
**19.2 Qué se construyó**: híbrido `output:'server'` (index `prerender=true` estático + `/api/health` SSR = prueba viva del edge), Workers Static Assets, **capa de acceso a datos FINA** (`src/lib/data`, frontera única con Firestore + contrato de free-tier), CI `portal-ci.yml` (job build+verify SIEMPRE; deploy-staging GATED en `vars.CF_DEPLOY_ENABLED`), `bump-version.yml` del sitio viejo excluye `portal/**`.
**19.3 No-regresión**: obra live intacta (portal-ci aislado por path filters; deploy gated → CERO impacto en producción). Raíz limpia: revertida una contaminación accidental de `@astrojs/check` en el `package.json` de la RAÍZ (npm instaló en el cwd equivocado).
**19.4 Verificación en vivo (interino R4)**: `npm run build` OK · `wrangler deploy --dry-run` OK (bindings SESSION/R2_MEDIA/ASSETS) · **`wrangler dev` real** OK (`/` HTML, `/api/health` JSON con timestamp del edge, `/favicon.svg` 200) · `verify:build` 5/5.
**19.5 Deliberación (revisión adversarial ×4 lentes; crudo → bóveda `research-archive/2026-07-10-ola0-scaffold-review-crudo.json`)**: plan-fidelity **APROBADO** (invariantes duros OK: sin negro, nº personal ausente, razón social vigente, capa FINA real en código, cero scope creep). Fixes aplicados: (a) prereqs de deploy documentados — token con scopes de **CREACIÓN** (Workers Scripts + KV Storage + R2 Storage :Edit + Account Settings:Read), bucket R2 con nombre explícito **NO se auto-crea**, KV `SESSION` auto-provisioning es **OPEN BETA** (wrangler ≥4.45); (b) `wranglerVersion` pin + `concurrency` en CI; (c) verify #5 sobre el `wrangler.jsonc` real; (d) **aislamiento inbound** de `bump-version.yml` (costura cazada — sus globs `**/*.css` matcheaban portal); (e) import extensionless (`ts5097`). Lente render-adapter falló mid-stream → cubierta por la verificación triple propia.
**19.6 Archivos**: NUEVOS `portal/**` (19 fuentes + lock) + `.github/workflows/portal-ci.yml`; MODIFICADO `.github/workflows/bump-version.yml`. INTACTOS: sitio viejo, `functions/`, `admin.html`. Commit `e0751a5`.
**19.7 Doctrina + pendiente**: §3.3 (verificar versiones/config, no memoria) · interino R1/R4/R5 · §3.7 (revisión adversarial por iniciativa) · §G.4 (crudo+síntesis). Sin cache bump (portal sin SW; sitio viejo intacto). **Pendiente en la MISMA sesión**: guía Cloudflare al dueño (Ola 0.2, protocolo Fincaraíz). Siguen ítems 0.2-0.7 + carril D.

## 20. ADR — Repaso estratégico del plan completo con Fable 5 (auditoría final pre-ejecución Opus) ⟦OPUS-4.8 + FABLE-5⟧ (2026-07-10)

**20.1 Contexto (pedido del dueño)**: con Fable al **6% de cuota**, Daniel pidió un repaso estratégico de TODO el plan ANTES de que Opus siga implementando, para blindar el roadmap y que Opus ejecute Olas 0→3 **sin Fable**, "tomando decisiones acertadas, sin omitir nada".
**20.2 Método (división rentable — opción elegida por Daniel: "Opus propone, Fable ratifica")**: Opus (recurso NO escaso) armó el **dossier de auditoría** de todo el corpus (7 lectores en paralelo → crudo 164KB en bóveda; incluye la **2ª pasada FTI-01** ya hecha: schema real de captación + enums del CRM Excel del dueño) con una resolución PROPUESTA por hueco/decisión; Fable (escaso) gastó su 6% en **juicio estratégico**: ratificó/corrigió + cazó omisiones. 1 pasada Fable (211k tok).
**20.3 Veredicto**: **Opus LISTO para ejecutar Olas 0→3 solo.** Dossier ~90% correcto; Fable selló el 10% restante.
**20.4 Correcciones VINCULANTES que cambian el plan** (`PLAN-ENDURECIDO` gana sobre `MEGA-PLAN` donde corrija): (a) **abogado partido en DOS** — toque (i) pre-cutover Ola 1 GATEA el cutover (deroga "abogado=Ola 2"); toque (ii) mesa de dinero pre-Ola 2; (b) **DIAN electrónica + apertura Wompi = gates-dueño de Ola 1** (lead time de semanas), no Ola 2; (c) **plumbing Wompi solo DESPUÉS del concepto B9** (R12 — si el abogado exige fiducia/plan B, la integración cambia entera); (d) **candado**: GESTIÓN v1 (hito 1B) cierra ANTES de abrir Ola 2; (e) matrícula **AMC-OFI-0074376-2026** ya está en el corpus → a `config` YA (no esperar a Daniel). Más **12 omisiones O1-O12** — la ROJA: **continuidad DNS/email en el cutover** (mover NS migra toda la zona; replicar MX/SPF/DKIM o `info@` se cae el día del go-live).
**20.5 Dos ediciones de kernel PRE-APROBADAS por Fable** (marcadas [OPUS-4.8]): (i) **carve-out §3.2/§4** — el ban de frameworks y el SW PWA rigen el sitio LEGACY hasta el cutover; `portal/` se rige por el stack sellado ADR §16 (Astro) conservando el espíritu (JS mínimo/islas, sin Tailwind, free-tier sagrado, limit(9), cero onSnapshot público) — **ejecutada en este cambio**; (ii) **derogación** del enmarque "abogado=Ola 2".
**20.6 Artefactos**: `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md` (**SSoT de EJECUCIÓN** ratificada, capa sobre el MEGA-PLAN) + crudos en bóveda (dossier 164KB + este ADR sintetiza a Fable) + banner en MEGA-PLAN. **FTI-01 2ª pasada HECHA** (cierra parte de TODO-19).
**20.7 Pendiente URGENTE + doctrina**: **lote-dueño #0 HOY** (⏰ RNT decreto cierra 2026-07-11 · cuenta Cloudflare · permiso DesignSync · allowlist git · abogado toque (i) · elección D0). Doctrina: §3.7 (Decisión Fuerte + 2ª opinión externa/estratégica), §G.4 (crudo+síntesis), interino R6.
**20.8 RATIFICACIÓN FINAL (2ª y última pasada Fable, mismo día — pedida por el dueño)**: dictamen ÍNTEGRO confirmado; apéndice vinculante apendado por Fable al `PLAN-ENDURECIDO` (§A-C, línea ~176; **el apéndice gana al cuerpo**). Novedades: (a) **T1 corregida** — staging noindex SOLO con header `X-Robots-Tag` (robots.txt `Disallow` bloquearía el rastreo e impediría ver el noindex); (b) **T8 corregida (material)** — Cache API clásico NO funciona en workers.dev → **Workers Caching** (`cache.enabled`, wrangler ≥4.69 — pin 4.110 del scaffold ya lo satisface, verificado) en staging Y prod, purga programática por tags (`prop:<id>`) vía Function onWrite → endpoint HMAC del Worker, `cross_version_cache` OFF, **scope Cache Purge eliminado del checklist para siempre**; (c) **O13 nueva** — el cache-key de Workers Caching no incluye el host → mitigación en runbook O2 (deploy fresco + deshabilitar workers.dev + purge al cutover); (d) **Carta de derechos de decisión sellada** (§C del apéndice): Opus decide TODO lo técnico solo (duda nueva Fuerte → comité ×3 + ADR `[REVISAR-FABLE]` + SEGUIR, jamás parar); Daniel = lista cerrada de 6 (dinero·legal·identidad/D0/mockups·go-no-go·sus cuentas·sus datos); precedencia: realidad verificada > decisión posterior del dueño > PLAN-ENDURECIDO+apéndice > MEGA-PLAN > specs R* > dossier > prosa kickoff. Hechos del día: cuenta Cloudflare CREADA (Account ID → `50-CONFIG`), O10 ejecutada (13 scrapes cuarentenados a bóveda `2026-07-10-scrapes-live-r1/`).

## 21. ADR — Ola 0.2: portal DESPLEGADO Y VIVO en Cloudflare Workers staging ⟦OPUS-4.8⟧ (2026-07-11)

**21.1 Qué se logró**: el dueño creó (guiado paso a paso, protocolo Fincaraíz — Claude JAMÁS tocó credenciales/tarjeta/token) cuenta Cloudflare + activó R2 + bucket `altorra-portal-media` + API token (template "Edit Cloudflare Workers", 4 scopes clave) + 2 secrets GitHub + variable `CF_DEPLOY_ENABLED=true`; el CI `portal-ci` desplegó el portal a **Workers staging**. **URL**: `https://altorra-portal.altorrainmobiliaria.workers.dev`.
**21.2 Verificado EN VIVO (curl sobre infra real, interino R4)**: `/` → 200 + `<meta robots noindex>` ✅ · `/api/health` → 200 JSON con `renderedAt` del edge + header `X-Robots-Tag: noindex` ✅ · `/favicon.svg` → 200 ✅. Cableado híbrido (estática + SSR) y el candado noindex (O3/T1) funcionando en producción-de-verdad.
**21.3 Recursos provisionados**: KV `SESSION` = namespace `altorra-portal-session` (**auto-provisioning funcionó** en CI — la preocupación F1 de la revisión no se materializó) · R2 `altorra-portal-media` (pre-creado) · subdominio `altorrainmobiliaria.workers.dev`. Todo → `50-CONFIG`.
**21.4 Gotcha resuelto (→ L-16)**: el 1er deploy falló al final porque la cuenta no tenía subdominio `workers.dev` registrado (wrangler no lo registra en CI no-interactivo). El dueño lo registró (Compute → Workers & Pages, auto-asignado) → Re-run failed jobs → éxito. Diagnóstico: el log de Actions requiere login (403 a la API), pero `status`/`jobs`/`steps` son públicos (L-13); pedí captura al dueño con el buscador de logs.
**21.5 No-regresión**: obra legacy intacta (portal-ci aislado por path filters; el portal no toca GH Pages). Marca respetada. **21.6 Doctrina**: interino R4 (verificación en vivo, no asumir "desplegado"), Fincaraíz (credenciales solo el dueño), §3.3. **21.7 Pendiente**: pulir aviso Node 20→24 en CI (menor, no bloquea); seguir Ola 0 — **0.7 modelo de datos DESBLOQUEADO** (FTI-01 digerido, staging vivo para verificar E2E). Commits `6c3bdaf` (código) + este ADR.

## 22. ADR — Ola 0.7 (parte 3/3): capa de acceso a datos `client.ts` (lecturas públicas Firestore REST + Workers Caching) — Decisión Fuerte OD1 `[REVISAR-FABLE]` ⟦OPUS-4.8⟧ (2026-07-11)

**22.1 Contexto / decisión (OD1)**: cierre de la parte 3/3 del modelo de datos v1 (partes 1-2 = tipos `62916e1` + rules/indexes/storage `1750f10`). `client.ts` era skeleton que lanzaba Error; el MECANISMO de acceso desde el edge era la Decisión Fuerte (firebase-admin NO corre en Workers). **Resuelto**: lecturas PÚBLICAS anónimas vía **REST de Firestore** (`https://firestore.googleapis.com/v1/projects/{p}/databases/(default)/documents/{path}?key=`) + **apiKey PÚBLICA** (ya en `js/firebase-config.js` legacy → NO hubo que pedírsela a Daniel; las Security Rules son la frontera real — verificado contra docs Firebase: "for unauthenticated requests, Firestore uses your Security Rules"). El protector de free-tier es **Workers Caching** a nivel de respuesta (sello T8; "the cache belongs to the Worker, not to a domain" → funciona en `workers.dev`, verificado contra docs vivas Cloudflare). Escrituras = solo Cloud Functions; SA-JWT (lecturas privilegiadas) = post-MVP (hook `env?`).
**22.2 Solución estructural**: 3 módulos edge-safe (solo `fetch`/`URL`, cero SDK/node) — `firestore-rest.ts` (decoder REST + `getDoc` que NUNCA lanza: mapea status + captura red/abort/JSON), `client.ts` (`getDataClient(env?)` → repos `propiedades.get`/`config.get`+`getGeneral`/`disponibilidad.get`; guardas), `cache.ts` (tags de purga + constantes `Cache-Control`). Cableado POR-REQUEST en `middleware.ts` → `locals.altorra` (evita el footgun de estado de módulo persistente en el isolate). Gate `verify:data` convierte "sin queries" de HONOR a LINTER.
**22.3 No-regresión**: obra legacy intacta; dominio + rules/indexes/storage de parte 2 INTACTOS; el skeleton `getDataClient` (que solo lanzaba) reemplazado por implementación compatible (mismo nombre exportado). Bundle del Worker compila. Sin cache bump (portal sin SW).
**22.4 Verificación (gate empírico — EVIDENCIA real, no opinión)**: `tsc` estricto **limpio en todo `portal/src`** (único error = `astro.config.mjs` `platformProxy`, PRE-EXISTENTE y ajeno a OD1 → §22.7) · **vitest 26/26** (fixtures adversariales: mapa/array VACÍO, `booleanValue:false`, `nullValue`, integer-como-string, anti-traversal, memo dedupe, colapso denied/not-found, override env) · **astro build** (bundle Worker verde) · `verify:data` (15 archivos) · **T6 Rules 15/15 contra el emulador Firestore REAL** (Java local, owner-free) — confirma el supuesto del comité: GET anónimo de propiedad INEXISTENTE → **403** (no 404), validando el colapso `denied+not-found→unavailable`. E2E con datos vivos = imposible aún (`propiedades` vacía, sin deploy) → pendiente.
**22.5 Deliberación + anti-patterns**: núcleo seco de `proceso-decision-fuerte` — Fase A evidencia (docs vivas Cloudflare+Firestore, L-14) → **comité ×3** (workflow, lentes costo-freetier / runtime-seguridad / ejecutor-tests; crudo → bóveda `research-archive/2026-07-11-comite-od1-client-ts-crudo.json`) → veredicto (verifiqué CADA claim contra realidad, §3.3). Cazados y corregidos: 🔴 **BLOCKER** crash por mapa/array VACÍO (Firestore REST omite `fields`/`values` → `{mapValue:{}}`) · despacho por PRESENCIA de clave (no truthiness; salvaba `false`/`null`) · anti-traversal (`encodeURIComponent('..')` no neutraliza) · footgun de memo cross-request en isolate · TTL largo+purga (Workers Cache es POR-PoP). Refutados con razón: BigInt para COP (innecesario, <2^53) · `WorkerEntrypoint` cacheado extra (sobre-ingeniería MVP). **Sin consejo externo** (Gemini no conectado) → `[REVISAR-FABLE]`.
**22.6 Archivos**: NUEVOS `portal/src/lib/data/{firestore-rest,cache}.ts` + tests `{firestore-rest,client}.test.ts` · `portal/src/env.d.ts` · `portal/{vitest.config,vitest.rules.config}.ts` · `portal/scripts/verify-data-invariants.mjs` · `portal/firebase/tests/rules.test.ts`. MODIFICADOS `portal/src/lib/data/{client.ts,README.md}` · `portal/src/middleware.ts` · `portal/firebase/firebase.json` (emulador) · `portal/package.json`(+lock) (scripts+devDeps: vitest, @firebase/rules-unit-testing, firebase). INTACTOS: `src/lib/domain/**`, rules/indexes/storage, obra legacy.
**22.7 Doctrina + pendiente**: §3.3 (docs vivas) · §3.7 (comité por iniciativa) · §G.4 (crudo+síntesis) · interino R6. **Cola auditoría Fable (TODO-22)**: (a) este ADR `[REVISAR-FABLE]`; (b) decisión DIFERIDA del catálogo público (SSG build-time vs doc-índice denormalizado — Ola 1); (c) hallazgo PRE-EXISTENTE: `platformProxy` no existe en `@astrojs/cloudflare` v14 (afecta solo bindings en `astro dev`, no deploy) → tarea aparte. **Pendiente 0.7**: E2E con datos+deploy (deploy de rules = Claude, COORDINADO con retiro legacy — NO ahora). Lecciones → L-17..L-20.

**22.8 Addendum (2026-07-11) — E2E de la capa de datos VERIFICADO con seed + fusión de skill de navegador.** Cierra el pendiente de E2E de §22.7 (la parte de datos): (a) **seam `baseUrl`** en `firestore-rest.ts`/`client.ts` (opt de test, default = Firestore real); (b) **generador SEMILLA** `firebase/seed/generar-propiedades.mjs` (realista Cartagena: barrios/precios COP/doble-precio arriendo/RNT alojamiento; **imágenes = Lorem Picsum por URL, NO Google/derechos** — L-O10; en prod van por R2); (c) **E2E `firebase/tests/e2e-datalayer.test.ts`** que siembra el emulador y lee con el CLIENTE REAL (`baseUrl`→emulador): camino completo cliente→REST→rules→decode→dominio contra el wire format REAL. **21/21 verdes** (6 E2E + 15 rules); confirmado EN VIVO: decode fiel de mapas/arrays/`false`/integer-string, borrador/inexistente→`unavailable` vía REST, `config/general` (footer legal). Falta SOLO el E2E "tras cache" (Workers Caching en staging desplegado, gate T9). Bug de TEST (no de producto) cazado → **L-21** (aislamiento por projectId; el código-cliente estaba OK). Scripts `test:rules` / `seed:preview`. **Tooling (fuera del repo)**: fusioné la skill GLOBAL `validacion-live-chrome` §0.5 con la regla de cuándo usar el navegador **INTEGRADO** (`mcp__Claude_Browser__*`, default, sin logins del dueño — dev server/staging/URLs públicas/descargas públicas) vs la **EXTENSIÓN** Chrome (`mcp__claude-in-chrome__*`, solo con sesión del dueño) + barandas de descarga/copyright. Verificación: tsc limpio · pure 26/26 · astro build · verify:data 15 · emulador 21/21.

## 23. ADR — Ola 1 · D1: sistema de diseño (tokens + primitivas) extraído de los mockups aprobados `[RATIFICAR-DUEÑO]` ⟦OPUS-4.8⟧ (2026-07-11)

**23.1 Contexto / causa**: D0 cerrado y diseño ENTREGADO por Daniel (8 mockups `.dc.html` + assets, ingeridos en `portal/design/`). El scaffold tenía `tokens.css` PLACEHOLDER vacío y `BaseLayout` sin fuentes ni tokens. D1 = extraer un sistema de tokens COMPLETO y FIEL de los mockups (réplica exacta) y sellarlo como SSoT del design system, sin lo cual no se puede construir home→SERP→ficha.
**23.2 Solución estructural**: workflow `altorra-d1-token-extract` (11 agentes, 0 err, ~1.5M tok): 9 extractores paralelos (8 mockups + support.js) → síntesis canónica `--alt-*` → **crítica adversarial a11y**. Yo (escritor único del kernel, §15) autoré 3 hojas: `portal/src/styles/tokens.css` (SSoT: color/superficie/sombras/radios/tipografía/espaciado/gradientes/movimiento/foco/z-index), `base.css` (reset + globales tipográficos + a11y globales) y `components.css` (primitivas `.alt-*`). Cableado en `BaseLayout.astro` (import ordenado tokens→base→components + fuentes Google `<link>` preconnect). Modelo REAL descubierto (§3.3, corrige la descripción vieja "Liquid Glass"): **DUAL-MODE** — `--alt-surface:#FFFFFF` default (6/8 páginas, elevación plana) · `--alt-surface-neu:#eaf0f7` opt-in neumórfico (home+nav, 2/8) · `--alt-surface-ink:#062743` secciones. Tipografía = Cormorant Garamond (display) + Hanken Grotesk (cuerpo); Playfair (hero Portal) EXCLUIDA del base.
**23.3 No-regresión**: `tokens.css` placeholder (`:root{}` vacío) → implementación; `BaseLayout` `<head>` vacío → fuentes+tokens (sin romper `indexable`/noindex ni el `<slot/>`). Obra legacy INTACTA (portal aislado). Capa de datos/dominio/rules INTACTAS. Sin cache bump (portal sin SW). Nuevos archivos aditivos; cero renombres.
**23.4 Verificación (EN VIVO, no asumir)**: `astro dev` + navegación a `/design-system` (styleguide propia creada para ejercitar TODAS las primitivas) — **0 errores de consola**; **estilos computados verificados**: CTA oro = `linear-gradient(135deg,#ebd27e→#d4af37 52%→#a6801e)` + `min-height:44px`, cuerpo = `rgb(90,107,130)`=`#5a6b82` (token AA, NO el `#6b7c93` que fallaba), eyebrow/link = `#7d6119` accesible, card-neu = sombra extruida sobre `#eaf0f7`, pill `.is-on` = sombra `inset` (up→in real), dual-mode confirmado (body blanco / sección neu). Contrastes verificados con calculadora WCAG contra el peor fondo claro `#eaf0f7` (no contra blanco).
**23.5 Deliberación + anti-patterns**: crítica adversarial cazó fallos que el comité D0 NO marcó — 🔴 **cuerpo `#6b7c93` fallaba AA** (3.71:1 neu) → `#5a6b82` (4.74) · meta `#98a9ba` (2.4:1) → decorativo-only · oro-enlace `#A6801E` (3.2:1) → `#7d6119` (5.09; el `#8A6D1F` de la síntesis FALLABA en neu, lo verifiqué y bajé) · foco ring inexistente (neumorfismo mata affordance) → navy sobre claro / oro sobre navy · faltaban estado semántico (error/éxito/aviso/info color+icono ≥4.5), `prefers-reduced-motion`, `forced-colors`, z-index, `--alt-tap-min:44px`, disabled. Coherencia: escala tipográfica venía en RANGOS (no valores) → fijada; radios 14→7; espaciado a grilla 4/8. **Evitado**: adoptar la paleta de la visión a ciegas (se dejó `--alt-vision-*` reservada); colapsar los dos navies `#062743`/`#1B2733` (matices de sombra distintos). Crudo+síntesis+crítica → bóveda `research-archive/2026-07-11-d1-tokens-*` (3 JSON + SÍNTESIS.md).
**23.6 Archivos**: NUEVOS `portal/src/styles/{base,components}.css` · `portal/src/pages/design-system.astro` (styleguide dev, noindex; gate de exclusión en prod = TODO Ola 1) · `.claude/launch.json` (+config `portal` = `astro dev`). MODIFICADOS `portal/src/styles/tokens.css` (placeholder→SSoT) · `portal/src/layouts/BaseLayout.astro` (imports+fuentes). INTACTOS: `src/lib/**`, `src/pages/index.astro`, `portal/design/**`, obra legacy.
**23.7 Doctrina + `[RATIFICAR-DUEÑO]`**: §3.3 (mockups son SSoT, verifiqué computed styles) · §3.6 (dual-mode = decisión de arquitectura, no monolito) · §3.7 (workflow+crítica por iniciativa) · §G.4 (crudo+síntesis+frescura). **Pendiente ratificación Daniel** (divergencias caras de revertir): (1) sello tipográfico Cardo/Helvetica-Now→Cormorant/Hanken (¿actualizar memoria `sello-marca-altorra` o revertir?); (2) paleta visión vs entregada; (3) ajuste a11y visible de la firma cromática — argumento "premium que NO excluye" ⇒ accesibilidad=marca; (4) Playfair en hero ¿mantener o unificar a Cormorant?. **Bloqueadores de producción (no tokens)**: mockups traen contacto FALSO `+57 605 123 4567`/`hola@altorra.co` y matrícula `000000` → sustituir por oficial antes del cutover. **Siguiente**: construir la HOME real sobre estas primitivas (réplica de `ALTORRA Portal.dc.html`). Lección → L-22 (verificar diseño entregado por computed styles, no por captura — el panel desincroniza scroll).

**23.8 Addendum (2026-07-12) — paleta OFICIAL ratificada + capa Liquid Glass sutil + firma premium.** Daniel compartió la lámina "PALETA COLORES ALTORRA" → **RESUELVE la ratificación de paleta (§23.7 #2)**: azul marino `#062743` · blanco · dorado `#D4AF37` · **plateado `#BFC3C9`** · gris claro `#E6EDF2` · gris azulado `#C9D6E2` + escala (`#F2F6F9`/`#98A9BA`/`#6B7C93`). Confirma el diseño entregado y **jubila la "visión" vieja** (sin papeles cálidos ni turquí/ocre) → quité las vars `--alt-vision-*` y reestructuré §1 de `tokens.css` liderando con los 6 principales + escala + alias semánticos (`--alt-ink`=`var(--alt-navy)`, texto atado a `gray-600/400`). El **plateado entra como color real** (antes reservado) + gradiente `--alt-grad-silver` (plata cepillada, par metálico del oro/logo). **Dirección de lenguaje (Daniel)**: neumorfismo PROTAGONISTA + Liquid Glass SUTIL + dual-mode = algo único/premium. Implementado: **§14 tokens de glass** (`--alt-glass-*` claro/oscuro/oro/plata + `--alt-glass-blur`), sombra de **fusión `--alt-nm-glass`** (extrusión neumórfica + doble sheen de vidrio), primitivas `.alt-glass`/`.alt-glass--dark`/`.alt-nav-glass` (con fallback sólido `@supports`), y la **firma única `.alt-card--vitrina`** (neu + sheen + filo hairline oro que se enciende en hover vía mask). `.alt-card--neu` ahora usa la fusión (más premium). **Verificado por computed styles** (L-22; capturas del panel bloqueadas por infra — backdrop-filter estresa el renderer headless, NO es bug del sitio): paleta oficial resuelve, `backdrop-filter: saturate(1.8) blur(20px)` aplica, vitrina/silver-gradient/metal-clip OK, 0 errores consola/server. **Ratificación restante**: solo el sello tipográfico (Cormorant/Hanken vs Cardo/Helvetica-Now). Archivos: `tokens.css`+`components.css`+`design-system.astro`. ⚠️ Glass = acento, usar con moderación (coste GPU).

**23.9 Addendum (2026-07-12) — disciplina de color estricta + tipografía DECIDIDA + neu oficial.** Mandato Daniel: SOLO paleta (fondo blanco · navy limitado a textos/títulos/menús/algunos botones y cards · **DORADO PREDOMINA** · plata presente · CERO color ajeno — "no metas un verde"). **Corregido:** los estados semánticos que yo había puesto (error rojo `#B42318`, éxito verde `#1F6B44`, aviso marrón, info azul brillante) **violaban la paleta** → reescritos a **solo paleta**: texto navy siempre (AA), acento (borde+ícono) navy (error/info) u oro (éxito/aviso), **el significado lo lleva el ÍCONO** (SC 1.4.1 no-solo-color; mejor a11y). Eliminados los bg-tints ajenos → todas las alertas usan `--alt-status-bg` (=mist). **Oro protagonista:** `.alt-divider` (filete de oro), `.alt-card--gold` (cinta de oro superior), anillo de oro en hover de `.alt-card`, `.alt-metal-gold`/`.alt-metal-silver` (texto metálico). **Superficie neu** `#eaf0f7` → **`var(--alt-gris-claro)` `#E6EDF2`** (gris OFICIAL "soporte"; el fondo de contenido sigue 100% blanco; el neumorfismo necesita un gris apenas para el relieve). **Tipografía ✅ DECIDIDA** (Daniel delegó 2026-07-12): **Cormorant Garamond (display) + Hanken Grotesk (cuerpo)** — coherente con los mockups, premium/editorial, distinta de Bersaglio (Fraunces+Manrope); descarté Fraunces/Playfair/Marcellus → **cierra la última ratificación de §23.7**. **Verificación (L-22, computed styles):** barrido de TODOS los elementos vs allowlist de paleta → **0 colores ajenos en UI renderizada** (los `rgb(0,0,0)` residuales = `<title>`/`<style>`/`<script>` del head + dev-toolbar, no visibles); neu=`rgb(230,237,242)`, alerta error=navy, ícono éxito=oro `#a6801e`, divisor=gradiente oro, 0 errores consola. Archivos: `tokens.css`+`components.css`+`design-system.astro`+`BaseLayout.astro`. **Ratificaciones: TODAS cerradas** (paleta §23.8, tipografía §23.9). Opción abierta a Daniel: reservar un rojo/verde funcional SOLO para validación crítica de formularios (hoy palette-only + ícono).

## 24. ADR — Ola 1: Header compartido + HOME (hero + buscador + "Cuatro maneras") — parte 1 ⟦OPUS-4.8⟧ (2026-07-12)

**24.1 Contexto**: con D1 sellado (§23), arranca la construcción de la Ola 1 empezando por la HOME (réplica de `ALTORRA Portal.dc.html`). Se prioriza el **Header** por ser el componente COMPARTIDO por todas las páginas (arquitectura: construir la nav una vez).
**24.2 Solución**: (a) **`portal/src/components/Header.astro`** — nav sticky de 3 capas (barra utilitaria + barra "liquid glass" `.alt-nav-glass` + drawer móvil), **data-driven** (array `nav` con tipos mega/rich/link → markup por `.map`), tokenizado 100% al design system, dropdowns por CSS `:hover`/`:focus-within` (sin JS), y JS mínimo vanilla (toggle drawer + sombra al scroll, breakpoint único 1300). **Contacto REAL** (`SITE` config): arregla el placeholder FALSO de los mockups (`+57 605 123 4567`/`hola@altorra.co` → `+57 300 243 9810`/`info@altorrainmobiliaria.co`). (b) **`portal/src/pages/index.astro`** (reemplaza el centinela de build) — HOME con hero sobre superficie neumórfica `#E6EDF2` (Cormorant H1 + eyebrow + buscador segmentado neumórfico con orbe de oro `--alt-nm-orb`, tabs Comprar/Arrendar/Estancias/Invertir con JS de placeholder/action) + sección "Cuatro maneras" (4 cards de imagen con scrim navy). Assets del logo + 5 imágenes → `portal/public/assets/`.
**24.3 No-regresión**: `BaseLayout`/`tokens`/`base`/`components` INTACTOS (solo se consumen). `index.astro` centinela → home real (mismo `prerender=true`, mismo `BaseLayout`). Obra legacy intacta. Nuevos: `Header.astro`, `public/assets/*`. Nuevos tokens aditivos: `--alt-nm-orb`, `--alt-grad-gold-145`.
**24.4 Verificación (EN VIVO, computed styles — L-22)**: `astro dev` + `/` → **0 errores consola**; header presente (8 ítems nav), `.alt-nav-glass` con `backdrop-filter: saturate(1.8) blur(20px)`, hero bg `rgb(230,237,242)`=#E6EDF2, H1 Cormorant Garamond navy, orbe con `--alt-nm-orb`, 4 cards, tab activo navy. **Barrido anti-off-palette sobre header+main → `[]` (CERO colores fuera de paleta)**. (Captura del panel bloqueada por `backdrop-filter` en el renderer headless — no es bug del sitio, L-22.)
**24.5 Anti-patterns evitados**: markup repetitivo (nav data-driven, no 300 líneas a mano) · color ajeno (verificado por barrido) · placeholder de contacto falso (arreglado) · bronce `rgba(120,90,20)` del mockup en el orbe → cambiado a gold-raw `rgba(166,128,30)` (disciplina de paleta).
**24.6 Archivos**: NUEVOS `portal/src/components/Header.astro` · `portal/public/assets/*` (logo mark-t/word-t/logo + 5 jpg). MODIFICADOS `portal/src/pages/index.astro` (centinela→home) · `portal/src/styles/tokens.css` (+2 tokens). INTACTOS: layouts, base/components.css, capa de datos, obra legacy.
**24.7 Doctrina + PENDIENTE**: §3.6 (componente compartido = arquitectura, no monolito) · §3.3 (verificación por computed styles) · §G.4. **Pendientes de la home** (parte 2): secciones destacadas/arriendo/cerca/valoradas/proyectos/journal + **`Footer.astro` compartido** + auto-carrusel del hero (opcional). **Perf (§3.1, TODO)**: las imágenes en `public/assets` son JPG 0.9–1.7MB sin optimizar → migrar a WebP <150KB (o Astro `<Image>` / R2) antes de producción — hoy penalizan LCP. **Rutas**: la nav apunta a `/comprar`,`/arrendar`,etc. (SERP aún no construida → 404 hasta su ola, esperado).

**24.8 Addendum (2026-07-12) — HOME parte 2a: Footer + PropertyCard + secciones destacadas/arriendo.** (a) **`Footer.astro`** COMPARTIDO (navy `--alt-surface-ink`, 5 columnas: marca+tagline+redes / Explorar / Servicios / Compañía / Contacto + barra legal), razón social/NIT/contacto REALES de `SITE`, año dinámico `new Date().getFullYear()`. ⚠️ **Matrícula de Arrendador = placeholder `000000`** hasta el Nº real de Daniel; **dirección = solo ciudad** (no calle inventada). (b) **`PropertyCard.astro`** REUTILIZABLE (card plana blanca: imagen+fav+badge+specs beds/baths/area+título Cormorant+precio+orbe; props tipados; filo de oro en hover). (c) Home: secciones **destacadas** (3 cards + card CTA navy "128 propiedades") y **arriendo** (3 cards, canon `/mes`), datos DEMO estáticos (Firestore real → cuando haya inventario + decisión SSG diferida TODO-22). **Verificado (computed styles)**: 6 `.alt-pcard`, footer+CTA navy `rgb(6,39,67)`, título Cormorant, zona/enlaces oro-link `#7d6119`, **barrido header+main+footer → 0 colores off-palette**, 0 errores. **Pendiente parte 2b**: secciones cerca/valoradas/proyectos/journal/brokers/redes + optimización de imágenes WebP + wiring de la home a Header/Footer en el resto de páginas al construirlas.

**24.9 Addendum (2026-07-12) — HOME parte 2b: cerca de ti + brokers + journal (home ~completa).** Añadidas 3 secciones al home: (a) **cerca de ti** (grid de 3 `PropertyCard`), (b) **brokers** (sección navy `--alt-surface-ink` con glow radial dorado, `alt-eyebrow` invertido, checklist de perks con círculos de check en gradiente oro, CTA `.alt-btn--gold`+`--on-ink`, imagen con 2 **stat cards de vidrio** `.alt-glass` — número Cormorant oro), (c) **journal** (editorial: 1 card destacada 16:10 + 3 filas horizontales con categoría/tiempo de lectura). **Verificado (computed styles)**: 7 secciones (hero/cuatro-maneras/destacadas/arriendo/cerca/brokers/journal), 9 property cards, brokers navy `rgb(6,39,67)` + stat glass `backdrop-filter` + número oro Cormorant, journal 1+3, check-circle gradiente oro, **barrido header+main+footer → 0 off-palette**, 0 errores. **La HOME está funcionalmente completa** (hero→cuatro maneras→destacadas→arriendo→cerca→brokers→journal→footer). **Pendiente menor**: secciones secundarias del mockup (recientes/proyectos/invertir/estancias-list/redes) opcionales + **optimización de imágenes = PRIORIDAD** (24 imgs JPG 0.9–1.7MB en `public/assets` → LCP malo; migrar a WebP <150KB vía Astro `<Image>` desde `src/assets` o script sharp, §3.1) + valores reales de Daniel (matrícula, dirección).

**24.10 Addendum (2026-07-12) — imágenes optimizadas a WebP (§3.1 cumplido).** Convertí las 7 imágenes de `public/assets` de JPG/PNG a **WebP** con `sharp` (fotos: ancho ≤1200 q66-72; logos: WebP con alfa ≤200px alto): **~5.5MB → ~546KB (−90%)**, TODAS <150KB (estate-golden 143 · villa-modern 130 · villa-pool 109 · chalet-dusk 107 · hero-keys 23 · logos 15/19). Actualicé las 24 referencias en `Header`/`Footer`/`index` (`.jpg`/`.png`→`.webp`) y borré los originales pesados de `public/assets` (siguen en `design/assets` como fuente). **Verificado en vivo**: 0 errores, 0 imágenes rotas, 7 assets WebP resueltos, lazy-loading below-fold OK. **Refinamiento futuro** (no bloquea): `srcset` responsive + Astro `<Image>` para servir tamaños por viewport. Los originales del diseño (`design/assets`, incl. hero-estancia/invierte de 3.7MB) NO se usan en el sitio.

## 25. ADR — Ola 1: SERP (página de resultados /comprar + /arrendar) ⟦OPUS-4.8⟧ (2026-07-12)

**25.1 Contexto**: segunda página de la Ola 1 (réplica de `ALTORRA Resultados.dc.html`). Los enlaces `Comprar`/`Arrendar` del Header/buscador ya no dan 404.
**25.2 Solución**: **`portal/src/pages/[operacion].astro`** — ruta DINÁMICA prerenderizada (`getStaticPaths` → `/comprar` [128, venta] + `/arrendar` [83, arriendo, canon `/mes`]). Reutiliza **Header** (con `active={op}` → resalta el ítem), **Footer** y **PropertyCard** (consistencia entre páginas). Estructura: barra de filtros glass sticky (búsqueda + Tipo/Precio/Habitaciones/Más filtros + "Guardar búsqueda") · cabecera (eyebrow + H1 Cormorant "N propiedades en Cartagena" + "Ordenar por") · layout 2 columnas (grid de `PropertyCard` + **aside sticky con mapa ESQUEMÁTICO** — placeholder estilizado con gradiente/grid/blobs/labels de zona/pines de precio/controles; **MapLibre real = follow-up**, stack ADR §16) · "Cargar más" · footer.
**25.3 No-regresión**: Header/Footer/PropertyCard/tokens INTACTOS (solo consumidos). Home intacta. Nuevos: 1 ruta dinámica. Sin cache bump.
**25.4 Verificación (EN VIVO, computed styles)**: `/comprar` → title/H1 "128 propiedades", filtros glass `backdrop-filter`, 6 PropertyCard, mapa + 4 pines (pin activo borde oro + texto oro-link), footer, **0 off-palette**, 0 errores. `/arrendar` → "83 propiedades", badge "Arriendo", precio "Canon $8.500.000/mes", nav marca "Arrendar" activo. Ambas correctas.
**25.5 Anti-patterns evitados**: color ajeno (barrido 0) · duplicar la card (reusa PropertyCard) · dos archivos casi idénticos (una ruta dinámica con getStaticPaths).
**25.6 Archivos**: NUEVO `portal/src/pages/[operacion].astro`. INTACTOS: componentes, tokens, home.
**25.7 Doctrina + PENDIENTE**: §3.6 (ruta dinámica DRY) · §3.3 (verificado). **Pendiente**: **ficha** (detalle, las cards enlazan `/ficha`) · MapLibre real en el aside (reemplazar el esquemático) · filtros funcionales (hoy visuales) · datos Firestore reales (TODO-22) · `estancias`/`invertir`/`publicar`/`turismo` (rutas de nav aún 404, se construyen en su turno).

## 26. ADR — Ola 1: FICHA de inmueble (`/ficha`) ⟦OPUS-4.8⟧ (2026-07-12)

**26.1 Contexto**: tercera página de la Ola 1 (réplica de `ALTORRA Ficha.dc.html`). Las cards de home/SERP enlazan `/ficha`.
**26.2 Solución**: **`portal/src/pages/ficha.astro`** (demo estática, 1 propiedad). Reutiliza Header/Footer/PropertyCard. Secciones: breadcrumb · **galería** (imagen principal + 2 celdas + tira de miniaturas con "+20", JS de swap al clic) · título (eyebrow+Cormorant H1+dirección+fav/share) · **6 specs** con íconos · **aside sticky** = card de precio (precio Cormorant + $/m² + admin + **CTA "Agendar visita" → WhatsApp con mensaje prellenado** + "Solicitar información" → email + **sello `.alt-seal` "Verificado por ALTORRA"** [primitiva D1, alineada con Seguridad/Legalidad/Confianza] + card de asesora con WhatsApp) + card de financiación · descripción · **amenidades** (8, `.alt-chip`) · **ficha técnica** (6 filas k-v) · **ubicación** (mapa esquemático + 6 puntos de interés) · **propiedades similares** (3 `PropertyCard`) · footer. **Sin gráficas** (regla Daniel; el mockup tampoco las tiene).
**26.3 No-regresión**: componentes/tokens INTACTOS. Nuevo: 1 página. Sin cache bump.
**26.4 Verificación (EN VIVO, computed styles)**: title/H1 Cormorant, 6 specs, 8 amenidades, 6 ficha-técnica, 6 POIs, 3 similares, 5 miniaturas, sello presente, **CTA = enlace `wa.me`** (WhatsApp con texto), precio Cormorant, **barrido → 0 off-palette**, 0 errores.
**26.5 Anti-patterns evitados**: gráficas (omitidas) · color ajeno (0) · reusar PropertyCard en similares · clase scoped cruzada (corregí `serp-map__grid`→`ficha-locmap__grid` local).
**26.6 Archivos**: NUEVO `portal/src/pages/ficha.astro`. INTACTOS: componentes, tokens, otras páginas.
**26.7 Doctrina + PENDIENTE**: §3.3 · §3.6 · §3.2 (WhatsApp-first sin gating). **Pendiente**: MapLibre real · galería lightbox real (hoy swap simple) · datos Firestore (ficha por `id`, TODO-22) · páginas restantes de la nav (estancias/invertir/publicar/turismo/aliados/gestion/journal) · un **404 con Header/Footer** para las rutas aún no construidas.

## 27. ADR — Ola 1: 404 + PUBLICAR (`/publicar` con lead form) ⟦OPUS-4.8⟧ (2026-07-12)

**27.1**: **`404.astro`** (Header/Footer + "en construcción" + CTAs) → las rutas de nav aún sin construir muestran marca, no error crudo. Verificado (`/estancias`→404 marca).
**27.2**: **`publicar.astro`** (réplica `ALTORRA Publica.dc.html`, el CTA dorado "Publica tu inmueble") — hero (eyebrow+Cormorant H1+3 stats oro) con **formulario de avalúo** (nombre/teléfono/zona/tipo, **validación + estado de éxito client-side**; ⚠️ POST real a `solicitudes` vía Cloud Function = follow-up) + "Cuatro pasos" + **3 planes** (Gratis / Gestión Premium navy "Recomendado" 3% / Concierge Élite). Header `active="vender"`.
**27.3 Verificación (EN VIVO)**: publicar → 3 stats, 4 pasos, 3 planes (featured navy), nav "Vender" activo, **form: submit vacío→error, submit válido→éxito+campos ocultos**, **0 off-palette**, 0 errores.
**27.4 Archivos**: NUEVOS `404.astro`, `publicar.astro`. INTACTOS: resto.
**27.5 Estado Ola 1**: viaje del COMPRADOR (home→SERP→ficha→WhatsApp) y del VENDEDOR (publicar→lead) LIVE. **Pendiente**: estancias (booking) · invertir · turismo · aliados · gestion · journal · Nosotros/Contacto · wiring de forms a `solicitudes` · MapLibre · datos Firestore reales.

## 28. ADR — Ola 1: ESTANCIAS (`/estancias`, detalle de alojamiento con reserva funcional) ⟦OPUS-4.8⟧ (2026-07-12)

**28.1**: **`estancias.astro`** (réplica `ALTORRA Estancias.dc.html`, corta estancia). Detalle de alojamiento: breadcrumb + cabecera (Cormorant H1 + sello "Anfitrión verificado" `.alt-seal` + rating 4.97) + galería (main + 2 celdas + miniaturas, swap JS) + meta (huéspedes/alcobas/baños) + descripción + "Lo que ofrece" (8 amenidades `.alt-chip`) + host card (Superanfitrión) + **widget de reserva FUNCIONAL** (precio/noche + fechas Llegada/Salida + stepper de huéspedes ± + Reservar + desglose noches/subtotal/aseo/servicio-10%/total, **recalcula por JS según fechas**) + confirmación. "No se hará ningún cargo por ahora" (pago Wompi custodia = Ola 2; hoy = solicitud). Header `active="estancia"`.
**28.2 Verificación (EN VIVO)**: nav "Corta estancia" activo, 8 amenidades, **reserva: 5 noches → "$850.000 × 5 noches", total $4.855.000** (850k×5+180k+425k, matemática correcta), stepper +1→3, Reservar→confirmación, **0 off-palette**, 0 errores.
**28.3 Archivos**: NUEVO `estancias.astro`. INTACTOS: resto. **28.4 Pendiente**: SERP de estancias (listado por fechas) · calendario visual real · pago Wompi (Ola 2) · wiring de la solicitud de reserva a `solicitudes`.

## 29. ADR — Ola 1: TURISMO (`/turismo`) — sitio público mockup-backed COMPLETO ⟦OPUS-4.8⟧ (2026-07-12)

**29.1**: **`turismo.astro`** (réplica `ALTORRA Turismo.dc.html`) — landing de turismo + inversión: hero (Cormorant H1 "Vive Cartagena como quien la habita" + 2 CTAs) + **zonas para tu estadía** (4 cards de barrio con scrim) + **experiencias** (4 servicios `.alt-chip`) + **sección de inversión** (navy `--alt-surface-ink` con glow dorado, 3 perks con checks oro, imagen + **stat de vidrio** "+18% retorno") + **CTA de contacto** (WhatsApp + explorar). Header `active="turismo"`.
**29.2 Verificación (EN VIVO)**: nav "Turismo" activo, 4 zonas, 4 servicios, inversión navy + glass stat + 3 perks, 2 CTAs contacto, **0 off-palette**, 0 errores.
**29.3 HITO**: con Turismo, **TODAS las páginas PÚBLICAS con mockup aprobado están LIVE** (home §24 · SERP §25 · ficha §26 · publicar §27 · estancias §28 · turismo §29; Header/Footer compartidos). Falta solo del set de mockups: **Gestion** (panel admin/back-office, no público). **Pendiente sin-mockup** (requieren aprobación de diseño, §3.2): invertir · aliados · journal · Nosotros · Contacto · favoritos · ingreso. **Transversales**: MapLibre · datos Firestore · wiring de forms → `solicitudes` · pago Wompi (Ola 2). **Maintenance debido**: auditoría Nivel-2 del cerebro (16 ADRs nuevos, TODO-19).
**29.4 Archivos**: NUEVO `turismo.astro`. INTACTOS: resto.

## 30. ADR — Auditoría Nivel-2 del cerebro #2 (post-Ola 1): SANO + retrieval funcional; 1ª meta-lección M-01 ⟦OPUS-4.8⟧ (2026-07-12)

**Deliberación:** workflow `auditoria-cerebro-nivel2-sondas` (8 agentes, 955k tok, 7/8 OK — falló solo el drill de tipografía por cap de StructuredOutput) para Sondas 3/4/7 + verificación directa de 0/1/2/5/6. Crudo + tabla falsable → bóveda `research-archive/2026-07-12-auditoria-cerebro-nivel2-inmobiliaria.md`.

**30.1 Causa / gatillo**: TODO-19 VENCIDA — 17 ADRs nuevos (§13→§29) desde la auditoría #1 (§12, 2026-06-15) ≥ `maxAdrGap` 12. El nudge del linter NO la cazó en `--boot` (K-03); la disparó un humano (Daniel eligió "auditoría" en la bifurcación de arranque). Objetivo Nivel-2: validar lo que el linter (estructura) no puede — VERDAD, frescura y FUNCIÓN de la memoria.

**30.2 Método**: 8 sondas (skill `auditoria-cerebro`). Directas — 0 (diff §12: F1/F2/F3 siguen curados, pero reaparece la clase F3), 1 (fidelidad de estado vs `git fetch` real), 2 (frescura), 5 (MEMORY.md: pasa, sin duplicar estado volátil), 6 (economía). Subagentes fríos — 3 (retrieval-drill ×5), 4 (fidelidad de deliberación sobre la síntesis D1), 7 (voz adversarial ×2 lentes).

**30.3 Veredicto**: **SANO + retrieval FUNCIONAL**. Sonda 3: 4/4 drills `clean` (1-3 hops, sin adivinar; el boot ya respondía varias preguntas sin salir de los always-on). Sonda 4: síntesis D1 = `fiel-con-gaps` (cada color refutado carga su ratio de fallo, callejones presentes → una sesión fresca NO re-quema 1.5M tok). La doctrina honesta ("no re-verificado, §3.3") sigue intacta — el tablero NO miente sobre git.

**30.4 Hallazgos**: 7 in-repo, **todos CURADOS en este cierre** — F-01 `05 §Sub-sistemas` rezagada (decía "ADR §23-§27" y listaba estancias/turismo como *pendientes* ya LIVE; contradecía `10`) = clase F3 **REINCIDENTE** → **M-01**; F-02 `10` citaba un SHA que por construcción no puede ser el de cierre; F-03 `deploy-info.json` congelado 76 commits (→ TODO-25); F-04 falta fila semántica de diseño en `00`; F-05 fila §23 con `#eaf0f7`/ratificaciones ya cerradas; F-06 `10` parafraseaba mal la causa de L-22; F-07 índice §28 decía "aseo" recalculado (es fijo). **10 KERNEL** (Sonda 7, owner=operador-cars, `brain-check.mjs` byte-idéntico ×3 → NO editable aquí): K-01 gate `verificado-vivo` dormido (0 marcadores → claims LIVE nunca caducan), K-02 gate boot imprime "✅ ≤ objetivo" con boot 31978 > target 31500 (banda ×1.1), K-03 nudge deepAudit suprimido en `--boot`, K-04 regex frescura no reconoce "cierre" (de-facto mono-archivo), K-05 gate #7 no exige crudo local a ADRs que afirman deliberación cara, K-06/K-07 diseño sellado apoyado en memoria del harness NO versionada + paleta duplicada sin ssotFact, K-08 `00` ruteaba a receta legacy sin marca (curado), K-09 anclas `§` ungated, K-10 ssotFact cache guarda artefacto legacy en retiro. → TODO-23 (kernel) + TODO-24 (SSoT/memoria).

**30.5 No-regresión / GC pareado**: correcciones ADITIVAS a nodos de estado; cero renombres de neuronas/IDs/anclas; §23.2 se deja histórico (§23.9 documenta el cambio de `#eaf0f7`→`#E6EDF2`). **Masa-neta ≤ 0**: `05` reescrito (§Sub-sistemas comprimido + re-sellado + marcador `verificado-vivo:` que ACTIVA el gate #16 → mitiga K-01) + `10` podado (bitácora Ola-1 consolidada) ⇒ boot vuelve < `bootCharsTarget` 31500 (mitiga el síntoma de K-02). `brain-check` + `brain-index` SANOS post-cierre.

**30.6 Archivos**: `05`/`10` (frescura+GC) · `00` (fila semántica diseño + refresco §23 + fix §28 + marca ⚰️ legacy en L-06 + fila §30) · `30` (**M-01**) · `99` (este ADR) · `.brain-manifest.json` (`deepAudit.last=2026-07-12`, `coveredHeaderCount=30`) · bóveda `2026-07-12-auditoria-*` + README. Kernel `brain-check/index/diff.mjs` INTACTO (single-writer=cars).

**30.7 Doctrina + KPIs del lazo**: §3.3 (cada claim adversarial re-verificado contra archivo/git ANTES de escribirlo — deploy-info, líneas de `brain-check.mjs`, drift de §23) · §G.3/§G.4 (consolidación + captura de deliberación + GC pareado) · §G.2 🔵 (skill). KPI: hallazgo reincidente cerrado CON meta-lección (F3→M-01); tasa de re-investigación ≈ 0 (retrieval clean). Sin cache bump (no tocó el shell). `deepAudit` re-sellado → apaga el nudge.
> ✅ Nota de cierre (auditoría §49): **TODO-25 CERRADO** con evidencia en commit `3285f5c` (`bump-version` revivió). El cierre vivía SOLO en el mensaje de commit — se registra aquí para el lector futuro (§2: todo TODO cerrado se marca en los docs).

## 31. ADR — Ola 1: GESTIÓN (`/gestion`, panel admin) — 8º y último mockup; portal COMPLETO ⟦OPUS-4.8⟧ (2026-07-12)

**31.1 Contexto**: último de los 8 mockups aprobados (`portal/design/mockups/ALTORRA Gestion.dc.html`). Panel admin/back-office = capítulo distinto del sitio público. Con él, TODOS los mockups aprobados quedan construidos.
**31.2 Solución**: `portal/src/pages/gestion.astro` — dashboard: **sidebar navy** (`--alt-surface-ink`, logo `mark-t` + nav Resumen[activo]/Inmuebles/Leads/Visitas/Documentos + perfil) + **main** (saludo Cormorant + subtítulo + **segmentado de 3 roles** Admin/Aliado/Propietario + botón "Nuevo inmueble") + 4 KPIs + tabla "Pipeline de leads" (scroll-x) + "Actividad reciente" + "Demanda por zona" (medidores). **Interactividad SIN `innerHTML`** (lo bloquea el hook de seguridad, con razón): las 3 vistas se renderizan server-side y se alternan con `hidden`; los textos por `textContent` (progressive enhancement, sin FOUC). Prop **`noindex` aditivo en `BaseLayout`** (páginas internas/admin siempre noindex).
**31.3 No-regresión**: NUEVO `gestion.astro`; MODIFICADO `BaseLayout.astro` (prop `noindex` opcional, default `false` → `indexable` IDÉNTICO para páginas que no lo pasan). Sin Header/Footer (layout propio). Sin cache bump (portal sin SW). Resto INTACTO.
**31.4 Verificación (EN VIVO, computed styles — L-22)**: `astro dev` + `/gestion` → **0 errores** consola/server; sidebar `rgb(6,39,67)`, KPI Cormorant navy, pill oro = `--alt-link #7d6119` (AA, NO el `#a6801e` que falla), gradiente demanda oro→navy. **Barrido anti-off-palette sobre `.gx-root *` (color+bg+4 bordes) → 0**. Segmentado probado (click real): Admin(6 filas·KPI 48) ↔ Aliado(4·"Mis leads asignados") ↔ Propietario(3·"Interesados") — saludo/subtítulo/tabla/KPIs/actividad/perfil/segmento sincronizados; vuelve a Admin limpio. `robots=noindex,nofollow`; sin scroll-H; SIN backdrop-filter (captura fiable). **Caza-bugs**: rocé `BaseLayout` → verifiqué la home intacta (noindex/Cormorant/header OK).
**31.5 Disciplina de color + nota**: usé los TOKENS D1 (no los hex crudos del mockup): `#a6801e`→`--alt-link` en texto pequeño (AA), `--alt-on-ink*` sobre navy. **"Demanda por zona"** son medidores CSS del mockup aprobado (no un chart de datos), panel INTERNO → replicados fiel pese a la preferencia general "sin gráficas" (revert trivial si Daniel objeta). Datos DEMO estáticos (como el resto del portal; auth+Firestore reales = posterior).
**31.6 Archivos**: NUEVO `portal/src/pages/gestion.astro`. MODIFICADO `portal/src/layouts/BaseLayout.astro` (prop `noindex`). INTACTOS: resto de páginas/componentes/estilos/capa de datos.
**31.7 Doctrina + HITO**: §3.2 (solo mockup aprobado, réplica fiel) · §3.3/L-22 (verificado por computed styles en vivo) · §3.6 (roles/dual-mode = decisión de arquitectura) · §G.4 caza-bugs. Sin deliberación (autoría directa sobre el patrón §24-§29). **HITO: portal Ola 1 COMPLETO — 8/8 mockups aprobados construidos (7 públicos + gestion admin).** ⚠️ **CORREGIDO por §32**: "completo" era falso — las páginas DIFIEREN de los mockups (fidelidad no verificada).

## 32. ADR — Fidelidad al mockup + ELEVACIÓN de diseño (header premium, emblema oficial, íconos pro) ⟦OPUS-4.8⟧ (2026-07-12)

**Deliberación:** workflow `auditoria-fidelidad-mockups` (6 agentes, 785k tok — diff build↔mockup por página; journal en la sesión) + skill `frontend-design` para la dirección visual. Header iterado ×3 con feedback directo de Daniel en staging.

**32.1 Hallazgo GRAVE (Daniel lo cazó, no el cerebro)**: el portal construido (§24-§29) **DIFIERE MUCHO de los mockups aprobados**. La verificación de §24-§29 comprobó COLOR (0 off-palette) + consola, NUNCA fidelidad estructural sección-por-sección contra el `.dc.html`. El mockup (SSoT visual) nunca se usó como checklist de completitud. **Meta-lección → L-24.** Citas: "difiere mucho del original… no te diste cuenta de tantas cosas", "diseñaste un header muy básico y con errores", "se ve terrible".

**32.2 Mapa de fidelidad (7 páginas)**: 🔴 **Home** (7 de 17 secciones; hero era estático 1-banner, arriendo=cards no lista; FALTAN: propiedad-del-día, carrusel venta, estancias-list, explora-zona, recientes, valoradas, CTA corta-estancia, proyectos, invertir, redes) · 🔴 **Turismo** (falta "Pasadías & recreación"; inversión recompuesta; zonas 4≠6) · 🟡 **Estancias** (falta sección RESEÑAS + galería distinta + "5 camas") · 🟡 **Publicar** (falta franja de 4 beneficios) · 🟢 **SERP** (estructura fiel pero **SIN interactividad JS**: filtros/fav/hover-pin muertos; SERP mixto partido en /comprar+/arrendar) · 🟢 **Ficha** (fiel; detalles menores) · 🟢 **Header/Footer** (fieles; bug FB=glyph IG corregido). Cambios INTENCIONALES a NO revertir: contacto/rutas reales vs placeholders, WhatsApp, sello "Verificado", TikTok.

**32.3 Mandato de Daniel — ELEVAR el diseño**: fusión **Neumorfismo + Skeuomorfismo + Glassmorfismo + Liquid Glass**, sensación de **app** (para que la app futura sea idéntica), moderno/tecnológico, "único y premium, que los estilos NO peleen". **Doctrina de fusión (para que no choquen)**: cada componente LIDERA con UNA técnica — **header = glass + metal · cards = neumorfismo · overlays = glass**. NO amontonar las 4 en un elemento. Sistema, no collage.

**32.4 Header rediseñado (v1→v3)**: v1 flotante glass → Daniel "básico/errores/tiembla" → v2 (sin barra-util gris, **sin temblor**: quité la animación de layout al scroll, altura FIJA) → v3 final: barra **vidrio full-bleed**, logo en **esquina izquierda** (layout FLEX, nav alineado-izq → el nav NUNCA se monta sobre el logo), **auto-OCULTAR al bajar / revelar al subir**, controles fantasma + UN CTA dorado metálico (skeuo). **Emblema oficial** `altorra-emblema.webp` (del Canva del dueño `DAGxI7p5OBk`, 248×340, solo el "A" oro+plata; el viejo `altorra-mark-t.webp` pixelado/con-texto RETIRADO; nombre nuevo = anti-caché de staging). **Wordmark** "ALTORRA" en TEXTO Cormorant + "INMOBILIARIA" con interletrado ajustado por JS al ancho EXACTO de ALTORRA. **Íconos** profesionales Lucide (UI) + Simple Icons (redes) embebidos inline (astro-icon rompe con Workers → **L-23**).

**32.5 Hero rebuilt (fiel al mockup)**: carrusel de 4 banners (vivienda/inversión/estancia/propietarios) + Ken Burns + auto-advance por longitud de texto + barra de progreso clicable + **buscador superpuesto** (margin negativo). Imágenes hero re-exportadas HD (2000px; las viejas se veían pixeladas).

**32.6 Archivos**: `Header.astro` (×3) · `Footer.astro` (emblema + fix FB) · `index.astro` (hero carrusel) · `gestion.astro` (emblema) · NUEVO `public/assets/altorra-emblema.webp` + hero HD (`hero-keys/invierte/estancia`, `villa-modern`) · `design/assets/altorra-logo-canva.png` (fuente). `tokens.css` INTACTO (la elevación se hizo con los tokens existentes). Commits `88baba3`→`fde874e`.

**32.7 PENDIENTE (WIP activo = TODO-27)**: header ✅ + hero ✅ + Ficha/SERP/Header ~fieles. **Falta rebuild fiel + elevado**: Home (10 secciones + arriendo→lista) · Turismo · Estancias (reseñas) · Publicar (franja) · SERP (interactividad JS). Daniel revisa cada bloque en staging (governance #1). Doctrina: §3.2 · §3.3/L-22 · frontend-design + §32.3 (fusión sin choque).

**32.8 Home `#arriendo` → LISTA (CORREGIDO 2026-07-16)**. Daniel lo cazó por 2ª vez: la sección se construyó como grilla genérica de 3 `PropertyCard` cuando el mockup (`ALTORRA Portal.dc.html` L628-758) pide **layout PROPIO**: lista horizontal de 4 filas + filtro "Todos/Con/Sin administración". **Solución**: fila = foto + badge "N fotos" · kicker/zona(pin)/título Cormorant/chips de specs + chip oro de amenity · etiqueta-de-administración + precio `/mes` + Contactar/Ver; filtro JS por `data-admin` (misma lógica que el mockup L1548, con `hidden` en vez de `style.display` — más semántico). **Elevado (§32.3)**: lienzo neu `#E6EDF2` + filas blancas elevadas + pills neumórficos (ON = `--alt-nm-in-sm` hundido + texto oro) — cards=neumorfismo, sin choque. 100% tokenizado al D1, 0 off-palette. **Verificación**: computed styles + clicks reales (4 filas · Con→2 · Sin→2 · Todos→4 · `aria-pressed` ok · build limpio) — ⚠️ **la captura del panel hace TIMEOUT** (L-22 agravada: ya no solo desincroniza). Archivo: `portal/src/pages/index.astro`. Commit `e028d51`.

**32.9 AUDITORÍA DE FIDELIDAD DE LA HOME (2026-07-16) — mapa definitivo de las 17 secciones**. Para NO repetir el error 9 veces más, se auditó la home ENTERA antes de construir. **Deliberación**: workflow `altorra-fidelidad-home` (14 agentes = 1 por sección del mockup + verificador adversarial `effort:high` sobre cada veredicto NO-AUSENTE, instruido a REFUTAR; ~2.3M tok). **0 veredictos refutados** → alta confianza. **Crudo + síntesis + workflow reejecutable en la bóveda**: `2026-07-16-auditoria-fidelidad-home-{crudo.json,sintesis.md,workflow.js}`.
**Resultado — 10 AUSENTES · 3 DIVERGENTES · 4 FIELES**: 🔴 AUSENTES (las 10 con `disenoPropio:true`): propiedad-del-día (split + 4 contadores) · venta (carrusel) · estancias-list (carrusel) · explora-zona (mosaico 10 tiles de ZONA) · recientes (bento) · valoradas (carrusel) · CTA corta-estancia (full-bleed) · proyectos (carrusel) · invertir (split) · redes (muro IG). 🔴 **`#cerca` DIVERGENTE GRAVE** (confirmado por el verificador): el mockup (L942-989) pide **split buscador + MAPA navy** (trama de puntos, SVG de calles, glow oro, 5 pins —2 de precio—, 2 mini-cards flotantes, 3 `op-pill`, contador "312 inmuebles en 3 km"); tenemos `.home-pgrid` con 3 `PropertyCard`, **titular reescrito** ("Lo mejor de cada zona segura" vs "Todo lo disponible a tu alrededor.") y **contenido INVENTADO** (array `cerca` = 3 demos que no existen en el mockup). Nuestro único `#cerca` tapa el hueco de DOS secciones (mosaico de zonas + mapa). 🟡 `#destacadas` y `#journal` divergentes MENORES (layout fiel). ✅ `#brokers` FIEL.
**Los 2 hallazgos que valen**: (a) **`#destacadas` salió `disenoPropio:false`** — ahí el mockup SÍ es grilla y somos fieles ⇒ `PropertyCard` NO es el villano; el fallo fue reutilizar **sin preguntar si la sección tiene diseño propio**. (b) **`.arail` es una abstracción REAL del diseño**: venta/estancias/valoradas/proyectos comparten el MISMO riel (`scroll-snap-type:x mandatory` + `.rnav` 46px ocultos ≤640px + `scrollBy(±min(clientWidth*.82,560))` sobre el `[data-railwrap]` más cercano) ⇒ construir **UN** `Rail` + **UNA** `LuCard` ×4 es reutilización legítima (la abstracción existe en el diseño, no se inventa) (§3.6).
**Callejones (NO reintentar)**: NO derivar de `PropertyCard` salvo `#destacadas` (su objeto ni cabe en propiedad-del-día ni en `.lu-card`) · NO inventar contenido (el `#cerca` actual es la prueba) · `#destacadas` del portal ≠ `#venta` del mockup (mapeo falso) · el banner B1 del hero ≠ sección `#invertir` · fondos: leer el hex de CADA sección (`#f2f6f9` ≠ `#E6EDF2`) · `data-reveal` NO existe en el portal (habría que construir el observador) · `<image-slot>` es del mockup, NO portar.
**Meta (fallo del método)**: el workflow reventó en la 1ª corrida — la 2ª etapa del `pipeline` usaba el ítem original `s` sin recibirlo en la firma; tumbó justo las 4 secciones NO-AUSENTE (las AUSENTES retornan antes de tocarlo). **Firma correcta: `(prevResult, originalItem, index)`**; recuperado con `resumeFromRunId` (replay desde caché → solo corrieron los 4 verificadores). → **L-25**.

**32.10 Base de riel reutilizable (`.alt-rail` + `LuCard`) + sección `#venta` (2026-07-16)**. 1ª de las 4 secciones de carrusel (§32.9). **Base** (sirve a estancias-list/valoradas/proyectos, que faltan): `components.css` → **`.alt-rail`** (flex + `scroll-snap-type:x mandatory` + scrollbar oculto + `overscroll-behavior-x:contain`) + **`.alt-rnav`** (botones 46px, variante `--ink` para bandas navy, `[disabled]` en los extremos, ocultos ≤640px → manda el swipe). **Sin JS el riel YA funciona** (snap nativo); los botones son mejora progresiva. **`LuCard.astro`** = card de ANCHO FIJO `clamp(276-330px)`, cuerpo CENTRADO, con lo que `PropertyCard` NO tiene: swatches de tipología + contador + 2ª línea de precio (crédito/entrega). ⚠️ NO confundir con `PropertyCard` (card FLUIDA de las grillas, §32.9). **`#venta`**: 5 `LuCard` + 6ª card-CTA navy con contador "128"; header con "Comparar todas" + prev/next; insertada ANTES de `#destacadas` (orden del mockup).
**🐞 CORRECCIÓN AL MOCKUP (sus botones están ROTOS)**: `railPrev/railNext` hacen `closest('[data-railwrap]').querySelector('.arail')`, pero los botones viven en un `[data-railwrap]` **HERMANO** del riel (L453 vs L467) → `querySelector` devuelve null y **las flechas no hacen nada**. Aquí el `[data-railwrap]` envuelve encabezado Y riel: misma arquitectura, funcionando. *Ser fiel a un mockup no es replicar sus bugs.*
**Disciplina de color** (precedente §23: ante choque mockup↔paleta, **ganan los tokens**): gradientes de placeholder tras la foto (`#efeae2→#e2d8c8` cálido · `#e6ede9→#d0e0d6` verdoso · `#e9e6ef→#d8d2e4` lila) **ELIMINADOS** (con WebP real no se ven nunca) · swatches `#8a6d1f`→`--alt-gold-raw`, `#c7d3dd`/`#cdd8e2`→gris azulado oficial · textos 11-13px en `#6b7c93`/`#98a9ba`→`--alt-text` (los del mockup reprueban AA a ese tamaño; la jerarquía la dan tamaño y peso). Barrido: **152 nodos, 0 off-palette**.
**Autocrítica**: añadí un sangrado del riel hasta el gutter ("que la última card asome") que **no está en el mockup** → con `scroll-snap` el riel arrancaba en `scrollLeft:54` comiéndose el padding. Retirado. *Adornar en vez de ser fiel es el mismo pecado que estamos corrigiendo.*
**Verificación** → **L-26**: el renderer del panel tiene **rAF CONGELADO** (0 frames/500 ms) ⇒ no anima, **no despacha `scroll`** y no captura; el riel parecía roto estándolo el entorno. Probado por **espía sobre `scrollBy`** (next=+560 / prev=−560 `smooth` = paso del mockup `min(cw*.82,560)`) + lógica de `sync` validada en los 3 estados (inicio→prev OFF · medio→ambos ON · fin→next OFF) + favorito `aria-pressed` false→true→false + build limpio. **+a11y**: el riel respeta `prefers-reduced-motion` (`smooth`→`auto`). Archivos: `components.css` · NUEVO `components/LuCard.astro` · `index.astro`. Commit `82b05dd`.

**32.11–32.13 Los 3 carruseles restantes — `#estancias-list` · `#valoradas` · `#proyectos` (2026-07-16). BLOQUE DE RIELES COMPLETO.** Daniel dio luz verde a los 2 bloques molde ("todo va bien, sigamos").
**🎯 EL GATE DE §32.9 PAGÓ 3 VECES**: cada sección es un carrusel, y **cada una usa una CARD DISTINTA**. Casi asumo "carrusel → `LuCard`" — habría sido el error de §32.8 otra vez. **El riel se comparte; la card NO.** Censo definitivo (**5 cards, NINGUNA intercambiable**): `PropertyCard` (FLUIDA, grillas, caja blanca+sombra plana — solo `#destacadas`) · `LuCard` (FIJA 276-330, CENTRADA, swatches + 2ª línea de precio) · **`StayCard`** (FIJA 230-262, **SIN caja**: foto desnuda r16/200px + texto suelto izq., rating ★ + "COP noche" — el `.bnb` del mockup) · **`RankCard`** (FIJA 288-326, **NEUMÓRFICA** `--alt-nm-up`, **numeral gigante CALADO** en oro + píldora navy de rating con reseñas) · **`ProjectCard`** (FIJA 244-300, **PÓSTER 3/4**: foto a sangre + scrim, sin cuerpo; solo NOMBRE Cormorant espaciado + zona, badge oro "Preventa").
**Lo ÚNICO compartido = `.alt-rail`**: los 4 rieles quedan cableados por el **MISMO JS genérico**, sin tocar una línea al añadirlos (verificado por espía en los 4). Refactor: `.home-venta` → **`.home-railsec`** (chasis de las 4; nombrar un patrón compartido según su 1er caso es deuda).
**Hallazgo — RITMO DE FONDOS**: el mockup alterna `var(--surface)` (=`#eaf0f7`, lienzo **neu**) con `#f2f6f9` (banda **mist**). El neu es el que habilita el neumorfismo de las cards. → modificador genérico **`.home-band--neu`**. `#arriendo`/`#valoradas`/`#proyectos` = neu; `#venta`/`#estancias-list` = mist. ⚠️ Nuestro `#destacadas` no pinta fondo (parte de su divergencia menor, §32.9).
**Robustez > fidelidad ciega**: (a) el numeral de `RankCard` va `color:transparent` + `-webkit-text-stroke` → **sin soporte sería INVISIBLE**; añadido `@supports` con relleno sólido (el mockup no lo tiene). (b) ★ como **SVG embebido**, no glifo de texto (doctrina L-23; el glifo ya causó el bug FB/IG del footer). (c) `#proyectos` conserva el **ajuste óptico** del mockup (cada nombre dimensionado según su longitud: MAREA 31px vs CLAUSTRO 1620 27px) pasándolo **por dato** (`titleSize`/`titleTrack`), sin inventar una regla automática. (d) Encabezado de `#proyectos` CENTRADO con variante editorial del h2 (peso **500** + interletrado **positivo** .01em; el resto usa 600/−.014em) — deliberado en el mockup.
**Disciplina de color**: scrim de `ProjectCard` `rgba(9,17,25,…)` = casi NEGRO (ajeno) → `--alt-scrim-img` (base navy) · metas 12.5px `#6b7c93` → `--alt-text` (reprueban AA a ese tamaño). **Barrido final: 0 off-palette en TODA la home** (`main *`).
**32.14–32.18 HOME COMPLETA — las 17 secciones (2026-07-16/17).** Cerrado el rebuild estructural: **17 secciones = las 17 del mockup, en su orden**. Daniel: "todo va bien, sigamos" + "haz los push".
**§32.14 los 2 SPLITS**: `#propiedad-dia` (UNA propiedad + 4 contadores + precio + CTA sweep; foto que ESTIRA al alto del texto) · `#invertir` (texto + 3 tarjetas de cifra; ⚠️ **NO es el banner B1 del hero** — near-miss que §32.9 mandaba descartar). `.alt-btn-sweep` a la capa global. **2 bugs propios**: `pdiaStats is not defined` (datos tras el uso) y **`SITE.contacto` → la clave real es `contact`**: ASUMÍ la forma del dato desde un grep parcial sin verificar el padre — el pecado que §3.3 prohíbe, cazado por el *build*, no por mi cuidado. → **L-27**.
**§32.15 `#explora-zona`** (10 tiles de BARRIO con contador, neumórficos) **+ HALLAZGO: el LIENZO de la home estaba mal**. El mockup declara `:root{--surface:#eaf0f7}` + `body{background:var(--surface)}` ⇒ la home entera vive sobre el lienzo NEU; la nuestra usaba blanco, así que TODAS las secciones sin fondo propio (`#maneras`/`#destacadas`/`#cerca`/`#invertir`/`#journal`) divergían (explica parte de la divergencia menor de `#destacadas`, §32.9). El D1 ya lo preveía (`--alt-surface-neu` = OPT-IN "home+nav") → `main{background:var(--alt-surface-neu)}` **scoped a la home**, sin tocar `tokens.css` (el resto del portal conserva el blanco, mandato de Daniel). **Es lo que hace que el neumorfismo LEA**: una card `--alt-nm-up` sobre blanco no tiene relieve. Ritmo resultante = el del mockup: **neu (default) ↔ mist `#f2f6f9` ↔ navy**.
**§32.16 `#recientes`** (bento 4-col con colocación EXPLÍCITA; verificado: 4 áreas distintas 570×374/278×374/570×180/278×180 = bento real). Lógica del mockup preservada: los tiles CON título revelan el precio al **hover**; los tiles SIN título lo muestran siempre. Móvil ≤860px: se aplana a 2 col y el precio-hover pasa a visible (en táctil no hay hover) + `focus-visible` para teclado.
**§32.17 `#cta-estancias`** (banda full-bleed, scrim direccional, CTA de vidrio) **+ `#redes`** (muro IG, 6 posts 1:1, 3 reels, overlay de likes al hover). `.alt-btn-frost` a la capa global con `@supports` de respaldo (sin `backdrop-filter`, el 14% de blanco no separa del fondo → navy 55%). **HANDLE REAL**: el mockup pone `@altorra.co` con `href="#"` — NO es el handle de ALTORRA → `@altorrainmobiliaria` + `SITE.social.instagram`.
**§32.18 `#cerca` — CERRADA LA DIVERGENCIA GRAVE**: era grilla de 3 `PropertyCard` con titular REESCRITO y **3 propiedades INVENTADAS**; tapaba el hueco de DOS secciones. Ahora es el split del mockup: buscador (input + 3 op-pills + contador "312 inmuebles en 3 km" + CTA oro) + **MAPA ILUSTRADO** (panel navy + trama de puntos + 4 calles SVG + glow oro + 5 pins [2 de precio] + 2 mini-cards). El mapa es **ilustrado por diseño**; MapLibre real sigue siendo follow-up (§16) — ser fiel NO es adelantarlo. `.home-arr__pill` → **`.home-oppill`** (el mockup usa `.op-pill` en AMBOS sitios: es compartido). Mejora sobre el mockup: el selector apunta el CTA al destino real arrastrando la zona escrita.
**Disciplina de color (3 correcciones al mockup)**: scrim de `ProjectCard` `rgba(9,17,25)` y del CTA `rgba(18,22,26)` = casi NEGRO (prohibido) → navy de paleta · swatches `#8a6d1f`/`#c7d3dd` → tokens · textos 11-13px `#6b7c93`/`#98a9ba` → `--alt-text` (reprueban AA a ese tamaño). **Barrido final: 0 off-palette en TODA la home.** Commits `0a1b5de`→`899ecbf` (pusheados; deploy a staging verificado por curl: 76KB→115KB).

**32.19 TURISMO fiel + 👁️ LA CORRECCIÓN DE DANIEL: SÍ PUEDO VER (2026-07-17)**. Daniel: *"Si puedes verla con la extensión de chrome"*. **Tenía razón y L-26 estaba MAL por sobre-generalización**: lo congelado es el **panel** (`mcp__Claude_Browser__*`); la **extensión de Chrome** (`mcp__claude-in-chrome__*`) renderiza, ANIMA y CAPTURA perfecto. Llevaba toda la sesión construyendo a ciegas **con la herramienta al lado**. L-26 corregida con el procedimiento. **En 5 minutos de mirar salieron 3 defectos que NINGÚN otro chequeo vio** (ni build, ni paleta, ni computed styles — mi batería era rigurosa y **estructuralmente ciega**: medía lo que yo le preguntaba, y nunca le pregunté "¿se ve bien?"): (a) **etiqueta VISIBLE** en el buscador de `#cerca` (texto duplicado): usé `.alt-sr-only` (convención Bootstrap/Tailwind) y la de este repo es **`.alt-visually-hidden`** — **L-27 repetida literalmente**; (b) **la flecha de `.alt-link-ul` partía el enlace en 2 líneas** en 4 secciones (nuestro `.alt-link-ul` es `inline-block` y no contempla icono). Fix FIEL, no parche: el mockup declara `.link-ul svg{display:none}` ⇒ esos enlaces **nunca** llevan icono → retirados los 6 `<svg>` (markup muerto además de roto); (c) gotcha: capturar justo tras un scroll pilla imágenes `lazy` a medio decodificar → recapturar antes de diagnosticar. ⇒ **el screenshot NO es "confirmación secundaria": es la ÚNICA capa que ve lo que ve el usuario.**
**Turismo (§32.2 cerrado)** — mismo patrón que `#cerca`: ausencia + renombres + invención. (1) **AUSENTE → "Pasadías & recreación"** ("Cartagena, más allá de la ciudad", mockup L146-168): card partida con foto que ESTIRA + 6 chips + CTA navy (eyebrow a `.24em`, no `.28em`). (2) **ZONAS 4→6** con textos exactos: "Centro Histórico" estaba **RENOMBRADA** (→ "Ciudad Amurallada"), **"Manga" INVENTADA** (fuera), faltaban Castillogrande/Rooftop & Piscina/Zona Campestre. (3) **SERVICIOS**: "Guías locales" **renombrado** (→ "Guías turísticos certificados"), **"Transporte privado" INVENTADO** (→ "Concierge 24/7"), eyebrow "Experiencias"→"A tu servicio" + párrafo faltante. **Los fondos de Turismo son `#FFFFFF`** ⇒ confirma que el lienzo neu era opt-in SOLO para la home (§32.15). Verificado en Chrome. Commits `384033d`→`503ab73`.

**Verificación** (L-26: espía + computed styles + build de producción): 5 StayCard sin caja confirmado (fondo transparente·sombra none·borde 0) · 4 RankCard ranks 01-04 + numeral calado (contorno oro 1.4px) + sombra neumórfica · 6 ProjectCard 3/4 con tamaños ópticos distintos (29.4/25.6/26.9px) y Preventa en 2 · orden de secciones = mockup · los 4 rieles OK. Archivos: NUEVOS `StayCard.astro`/`RankCard.astro`/`ProjectCard.astro` · `index.astro`. Commits `065ff16`, `92dbd34`, `8fcda42`.

**32.20 ESTANCIAS fiel + 🐞 BUG SISTÉMICO `[hidden]` (2026-07-17)**. Estancias: +sección **Reseñas** (estrella oro + "4.97·128 reseñas" + 4 barras de nota + 2 reseñas con avatar), meta **3→4** (faltaba "5 camas", "habitaciones" estaba renombrado a "alcobas"). **BUG REAL cazado MIRANDO en 2 páginas**: el atributo `hidden` NO ocultaba nada — el `[hidden]{display:none}` del UA tiene especificidad MÍNIMA y cualquier `display` de autor lo gana ⇒ estancias `#est-confirm`(`.alt-alert{display:flex}`) mostraba "Solicitud enviada" al CARGAR, y publicar `.pub-form__ok{display:flex}` mostraba el éxito ANTES de enviar. **Fix sistémico**: `[hidden]{display:none!important}` en `base.css`. Ningún chequeo técnico lo vio; el ojo en Chrome sí. → **L-26**. Commit `976be88`.
**32.21 PUBLICAR: franja de 4 beneficios** (la sección ausente §32.2): Máxima exposición · Avalúo justo · Respaldo legal · Seguridad total, íconos oro sobre mist. Commit `29232bc`.
**32.22 SERP: interactividad VIVA** (estaba MUERTA — 0 `<script>`). 3 handlers del mockup con estado en CSS+ARIA: filtros (`aria-pressed`) · favoritos (delegado + `preventDefault`/`stopPropagation` porque la card es un `<a>`) · **hover-pin** (`PropertyCard` gana prop `pin`, los pins ganan `id`; `.is-hot` = oro+scale). +`focusin`/`focusout` (teclado). → **L-28** (`getComputedStyle` MIENTE en propiedades con `transition`: pestaña de fondo ⇒ rAF a 0 ⇒ la transición no avanza y el computed se queda en el valor INICIAL; INVIERTE L-22). Commit `8c4eecb`.

**32.23–32.24 RE-AUDITORÍA ADVERSARIAL — "fidelidad lograda" era PREMATURA (2026-07-17)**. Tras declarar las 5 páginas fieles, corrí una re-auditoría (workflow `altorra-reauditoria-fidelidad`: 6 auditores + verificador `effort:high` que REFUTA cada FIEL; ~1.1M tok). **Veredicto: 1 FIEL · 5 DIVERGENTES · 48 hallazgos (13 ALTA · 17 MEDIA · 18 BAJA)**. Crudo+síntesis+workflow en bóveda `2026-07-17-reauditoria-fidelidad-*`.
**Los 13 ALTA → ✅ corregidos** (commits `566d8ec` §32.23 + `3a66a69` §32.24): 🚨 **cifra de rentabilidad "+18% retorno anual" INVENTADA** en turismo → RETIRADA (riesgo legal/comercial, no fidelidad; contradice "Seguridad·Legalidad·Confianza" y el mandato de no dar cifras sin respaldo) · 🐞 **favorito muerto en 8/13 cards** de la home (bug MÍO: el handler solo capturaba `.alt-lucard__fav`; y en StayCard el corazón NAVEGABA por burbujeo) → un handler para las 3 cards + `preventDefault`/`stopPropagation` · 🐞 **pins del SERP desemparejados** (bug MÍO: `pin={i}` + mismo array en ambas rutas ⇒ `/arrendar` mostraba precios de VENTA) → `pinsVenta`/`pinsArriendo` · 🐞 **galería de estancias MUERTA** (thumbs sin listener; `ficha.astro` sí lo tenía) → cableada · **estancias**: 2 amenities INVENTADOS ("Seguridad 24h"/"Zona colonial") sustituían a "Check-in 24 horas"/"Conserjería 24/7", barrio RENOMBRADO, descripción REESCRITA → restaurados textuales · **turismo #inversion**: 2 tarjetas desaparecidas + 1 inventada → las 3 restauradas · **#destacadas**: 3ª propiedad INVENTADA ("Penthouse frente al mar" $2.100M) → retirada (§32.23).
**PATRÓN (→ L-29)**: **5 secciones con contenido INVENTADO** y ninguna se veía rota — se veía BIEN (relleno plausible donde el diseño callaba). Ningún chequeo técnico (build/paleta/computed/screenshot) lo caza; solo **contar contra la fuente**, y **3 de los 6 ALTA los introduje YO mientras "corregía"**. Declarar fidelidad sin re-auditar adversarialmente = repetir §24-29.
**⏳ PENDIENTE (35 hallazgos MEDIA/BAJA, TODO-27)**: turismo 8 (patrón de cards de Zonas + kickers + copy #inversion reescrito) · estancias 8 (thumbnails INVENTADOS + layout de galería + widget no prellena fechas) · **ficha 8 — SIN TOCAR AÚN** (favorito del header MUERTO, sello inventado en card de precio, specs de similares cambiadas, íconos de POI perdidos) · serp 7 (6ª card INVENTADA en /comprar + card Getsemaní mutada + "Más filtros"/sombra-scroll muertos) · home 2 · publicar 2. Detalle → síntesis en bóveda.

## 33. ADR — Aprendizajes SEO/AEO/GEO a las skills + Auditoría Nivel-2 #3 + Comité "futuro del cerebro" ⟦FABLE-5⟧ (2026-07-18)

> Encargo directo de Daniel (el "TRABAJO" anunciado al cierre de §32): portar los aprendizajes REALES de producción
> bersaglio a las skills de visibilidad, auditar TODAS las skills, y auditar el cerebro holísticamente + responder
> "¿hay algo mejor que esta idea del cerebro?". `Deliberación:` crudos en bóveda `2026-07-18-auditoria-skills-crudo.json`
> + `2026-07-18-comite-futuro-cerebro-crudo.json` + `2026-07-18-sondas-3-4-7-crudo.json` + síntesis
> `2026-07-18-auditoria-cerebro-nivel2-3-inmobiliaria.md` (workflow 11 agentes, 1.4M tok, 0 errores).

**33.1 Causa raíz / disparador**: el doc fuente (`bersaglio/docs/superpowers/specs/2026-07-17-aprendizajes-SEO-AEO-GEO-para-skills.md`)
trae 3 CORRECCIONES al borrador del 07-10 que nuestras skills repetían: (a) `Offer` sin `price` es **INVÁLIDO** (GSC 17/17;
el pseudo-código de `semantic-schema-aeo` emitía exactamente ese patrón PreOrder-sin-price); (b) keyword+ciudad en el
NOMBRE del GBP = riesgo de SUSPENSIÓN; (c) "Solicitar indexación" solo sirve para DESCUBRIMIENTO. + `FAQPage` sin rich
result desde 2026-05-07 (doc oficial) y `aggregateRating` del GBP = self-serving prohibido (ambas vendidas por las skills).

**33.2 Solución estructural**: (1) **4 skills actualizadas** (`search-console-…`, `ssg-static-prerender`, `semantic-schema-aeo`,
`maps-gbp-local`) — correcciones EDITADAS sobre el texto viejo (no apendizadas), ❓ portados como HIPÓTESIS, + tabla de 4
estados GSC, CONTAR≠MUESTREAR, cáscara-noindex+horneada, truco geo del GBP, orden de palancas; también `seo-auditor.md`
(agente ×3 copias), `tenant-config.md` (priceDisplay:consulta → OMITIR offers) y anotación fechada en `schema-markup`.
(2) **Auditoría de ~30 skills** (32 hallazgos): ALTA Wompi (contratos OPUESTOS ante firma inválida de webhook → unificado
a HTTP-200-sin-procesar + idempotencia event.id/transaction.id+status) · voz-altorra (ejemplo del Test de Alma usaba el
literal PROHIBIDO "somos de aquí" → corregido; Meta Housing marcado [A VERIFICAR] consistente) · proceso-decision-fuerte
(Entrega (c) contradecía su REGLA DURA → reporte-live; citas L-NN prefijadas cars-) · validacion-live-chrome (description
vendía el fallback como default → DIRECTO primero) · ga4 (variable `utm` MUERTA → hash en texto+evento) · +bajas
(deadcode:check cars-only, 2.3.3=AAA, 5 días HÁBILES, rutas). **5 gemelas repo↔user DERIVADAS re-sincronizadas**
(proceso 109 líneas atrás; onboarding AUSENTE en user-level). (3) **Auditoría Nivel-2 #3 del cerebro** (tabla G-01..G-12
en bóveda): retrieval 5/5 ✅ · REINCIDENCIA M-01 (05 59 commits atrás → curado + **M-02**) · **TODA la bóveda estaba sin
commitear** (un mes de deliberaciones solo en disco → commit+push `8398213`) · memoria del harness espejada a bóveda
privada (`memory-mirror/`, cierra K-06/G-03) · `.claude/settings.json` versionado (G-04) · síntesis re-auditoría 07-17
parcheada (exenciones intencionales + rutas mockups + aritmética 13→6, G-06) · GC pareado (05: 3860→3072c; 10 podado).
(4) **Comité ×3 + presidente** (unánime): la idea del cerebro es CORRECTA; a $0 no hay nada mejor; Obsidian/Notion =
downgrade; RAG vectorial/Letta RECHAZADOS (corpus 248KB: grep+índice curado es superior). El defecto real: consolidación
al FINAL de sesión (saturación) → 7 mejoras priorizadas → TODO-28. Criterio de salida: boot revienta de nuevo / M-01
reincide tras fix / mantenimiento >30% sostenido ⇒ recortar doctrina.

**33.3 No-regresión**: skills = solo texto/documentación (0 código de producción tocado); portal INTACTO; kernel NO tocado
(single-writer cars); `settings.json` versionado sin cambios de contenido. **33.4 Verificación**: greps post-parche (0
patrones obsoletos residuales), hashes repo==user en las 12 parejas tocadas, `brain:check` SANO al cierre, bóveda pusheada
`4edc40f..8398213`. **33.5 Anti-patterns evitados**: correcciones editadas EN el texto viejo (no apéndice que convive con
la regla obsoleta) · hipótesis ❓ NO convertidas en reglas · no borrar la huérfana (límite de guardián) · no burlar el
clasificador de push (pasos git separados, naturales). **33.6 Modificados**: 19 archivos `skills/` + 6 docs (05/10/30/
skills-inventory/99/00) + manifest deepAudit + `.claude/settings.json` (nuevo en git) + bóveda (52 archivos). INTACTOS:
`portal/`, kernel `scripts/brain-*.mjs`, CNAME, service-worker. **33.7 Doctrina**: §3.3 (verificado en prod > entrenamiento),
§G.4 ampliado (bóveda commit+push en el cierre), L-30 + M-02 nuevas. Sin cache bump (shell intacto).

## 34. ADR — Adopción de la masterclass de captación + Housing verificado + principios "libre albedrío" ⟦FABLE-5⟧ (2026-07-18)

**34.1 Disparador**: Daniel aclaró el origen de la huérfana (SUYA: destilado de TikTok vía Antigravity para las
piezas de captación) y sentó 2 principios operativos: skills/cerebro = herramientas que POTENCIAN (no límites;
libre albedrío para modificarlas/mejorarlas) y la VOZ de ALTORRA está EN FORJA (norte: confianza→#1→ROI de
pauta→leads→orgánico). **34.2 Hecho**: (1) `marketing-psicologico-conversion` ADOPTADA a `skills/` + user-level
(cierra TODO-30): frontmatter con triggers, paso 8 que faltaba, **§10 puente ALTORRA** (guardarraíles de pauta CO:
RNT/matrícula/sin cifras inventadas/dolor-con-salida/paleta; fondos oscuros OK en PAUTA — la regla "sin negro" es
de la WEB); original de Antigravity intacto en `.agents/`. (2) `Brief_Diseño_Piezas_Captacion.docx` LEÍDO (3 piezas:
arriendo/venta/renta corta con ganchos de dolor), respaldado en bóveda `pauta/` y gitignored del repo público.
(3) **Meta Special Ad Category (Housing) VERIFICADO en fuente primaria** (transparency.meta.com, Discriminatory
Practices): aplica a anunciantes de/dirigidos a **EE.UU./Canadá/partes de Europa** → **pauta→Colombia NO la exige**
(hoy; hecho caducable L-30 — re-verificar por campaña; si se pauta a EE.UU./Canadá —compradores extranjeros— SÍ se
declara). `catalogo-voz-altorra §0/§6.3` actualizada ×2 copias. (4) Memorias del harness actualizadas
(`reglas-operacion-daniel` + `identidad-marca-inmobiliaria`) + re-espejadas a bóveda. **34.3 No-regresión**: solo
documentación/skills; portal y kernel INTACTOS. **34.4 Verificación**: doc oficial de Meta citada; hashes repo==user;
brain:check SANO. **34.5 Anti-patterns**: material del dueño adoptado ÍNTEGRO con mejoras marcadas y fechadas (no
reescrito); el hecho Housing con fecha+fuente (L-30), no como verdad eterna. **34.6 Modificados**: skills/marketing-
psicologico-conversion (nueva) + catalogo-voz-altorra ×2 + docs (05/10/inventory/99/00) + .gitignore + memorias +
bóveda `pauta/`. **34.7 Doctrina**: L-30 aplicada; principios nuevos capturados en memoria del harness (no en el
router — anti-engorde M-02).

## 35. ADR — Material TikTok procesado + minería marketingskills v2.8.12: 9 adopciones curadas ⟦FABLE-5⟧ (2026-07-18)

**35.1 Disparador**: Daniel entregó el lote de material TikTok anunciado (§34) + repo descargado `marketingskills-main`.
**35.2 Hecho — material TikTok** (criterio: verificar→adoptar; no medido→hipótesis): 40 ganchos → `marketing-psicologico-conversion §9b`
(adaptación voseo→tuteo + ejemplos ALTORRA) · cronograma semanal mini-embudo → `§9c` (mapeado a captación) · feed=vitrina/
reels=contenido + horarios ❓HIPÓTESIS-inicial → `§9d` (regla real: métricas propias mandan; cuentas ALTORRA nuevas) ·
pre-pauta auditar landing + espionaje Ads Library con navegador → `meta-ads-diagnostico`. **Verificaciones que tumbaron humo**:
repo "Karpathy" REAL pero el claim 65%→94% NO existe en él (invento del video) y sus 4 principios YA son nuestras doctrinas
§3.2-3.6 — nada que adoptar; herramientas Talos/Attention-Insights marcadas ❓ sin verificar. **35.3 Minería del repo (workflow
6 agentes, 1M tok; crudo en bóveda `2026-07-18-mineria-marketingskills-crudo.json`)**: LINAJE confirmado — nuestras ~34 skills
de marketing son copias v1.x de ESTE repo (MIT, Corey Haines; él va en 2.8.12). **Adoptado (9, cada una con nota de capa
ALTORRA + LICENSE)**: REFRESH `paid-ads`←ads v2.2.0 (Meta era-Andromeda + meta-decision-system TCPL + google-search-playbook —
**la base de la pauta**) · REFRESH `ad-creative` v2.8.0 (grounded anti-invención≈L-29 + hook-system + motion-video) · 🆕
user+repo: `video`, `offers`, `marketing-loops`, `image` · 🆕 repo-referencia: `competitor-profiling`, `prospecting`,
`marketing-council`. **Reparado**: references rotas de `ab-test-setup`/`copywriting` (nuestras v1.x citaban archivos
inexistentes). **Saltado con razón**: aso/co-marketing/directory-submissions/PR/sms/marketing-plan (US/SaaS-céntricas) ·
`tools/` DESCARTADO (CLIs con APIs Meta v18/Google v14 MUERTAS — el MCP oficial de Meta Ads del entorno es superior; solo se
rescató la chuleta GAQL como materia prima marcada). **35.4 Verificación**: licencia MIT leída · repo==user hash-verificado ×6 ·
notas presentes ×9. **35.5 Anti-patterns**: no pisar las 7 skills PROPIAS (falsos amigos identificados: image≠image-pipeline,
etc.) · hipótesis marcadas ❓ · APIs muertas NO vendorizadas. **35.6 Modificados**: 9 dirs de skills nuevos/refrescados + 2
references reparadas + marketing-psicologico-conversion + meta-ads-diagnostico + inventario + docs. INTACTOS: portal, kernel,
paquete visibilidad. **35.7 Doctrina**: L-30 aplicada (verificar antes de portar); TODO-29 pasa a fase de CONSTRUCCIÓN
(investigación seria + skills de pauta propias sobre la base paid-ads v2.2).

## 36. ADR — Lote 2 TikTok + guías Nova evaluadas + BACKLOG acumulador ×proyectos ⟦FABLE-5⟧ (2026-07-18)

**36.1**: Daniel formalizó su flujo (cura TikTok periódicamente para TODOS los proyectos) → se creó el
**acumulador único** `brain-private/compartido-marketing/BACKLOG-material-tiktok.md` (cada ítem con estado:
adoptado→dónde / hipótesis / descartado+razón; lotes 1 y 2 ya registrados) + memoria actualizada. **36.2 Lote 2
procesado**: (a) 4 formatos de "ads ganadoras" → 3 YA existían en `ad-creative` v2.8 (Review Card/Testimonial/
Before-After); **2 añadidos** como §Aportes ALTORRA (Search-Bar Ad con query real de GSC + Offer-Deadline con
regla de urgencia VERDADERA — urgencia falsa = práctica engañosa SIC; testimonio "Nathan" del TikTok citado como
ejemplo de lo que NO se fabrica, L-29); (b) "Meta hace pruebas con tu dinero" → `meta-ads-diagnostico §Higiene`
CON MATIZ (apagar lo que rompe marca; dejar entrega/Andromeda; ❓ nombres de UI por verificar); (c) 5 sistemas de
negocio → transcritos ÍNTEGROS al backlog (candidato a skill futura; mapeados a ALTORRA). **36.3 Guías descargadas
(Downloads/guia, "Ads Mastery by Nova") evaluadas**: guía 1 = instalar el conector OFICIAL `mcp.facebook.com/ads`
→ **YA CUMPLIDA** (tools `ads_*` vivas en esta sesión; validación en vivo de cuentas BLOQUEADA por el clasificador
en modo autónomo → hacerla con Daniel); guía 2 + SKILL.md incluida = la v1.0.0 de `meta-ads-diagnostico` → **YA
SUPERADA** (la nuestra es superconjunto). Nada nuevo que portar. **36.4 Verificación**: pypdf extrajo ambas guías
(5+6 págs, leídas completas); parches ×2 copias verificados. **36.5 Anti-patterns**: no duplicar formatos ya
existentes; urgencia falsa vetada; UI de Meta marcada ❓ (cambia seguido). **36.6 Modificados**: ad-creative/
references/static-ad-templates.md ×2 · meta-ads-diagnostico ×2 · backlog+memoria (bóveda) · .gitignore (tmp).
INTACTOS: portal, kernel. **36.7**: flujo de lotes institucionalizado (backlog = SSoT cross-proyecto).

## 37. ADR — Skill `pauta-captacion` construida sobre investigación OFICIAL + 8 parches de vigencia ⟦FABLE-5⟧ (2026-07-18)

**37.1**: TODO-29 fase construcción ejecutada. Workflow `investigacion-pauta-oficial` (5 agentes, 681k tok, 0 errores;
crudo+blueprint+workflow reejecutable en bóveda `2026-07-18-investigacion-pauta-*`): 4 frentes contra fuente PRIMARIA
fechada 2026-07-18 (Meta Business Help/developers + support.google.com + docs Cloudflare). **37.2 Hallazgos mayores**:
(a) el objetivo "Mensajes" fue RETIRADO (11→6 objetivos; CTWA hoy va bajo LEADS con "Maximizar conversaciones");
(b) Meta recomienda OFICIALMENTE audiencia amplia (Advantage+) y CBO default — el filtro "propietario" lo hace
copy/form/conversación, no el targeting; (c) regla ~50 eventos/semana VIGENTE → con presupuesto COP chico se acepta
"learning limited" A PROPÓSITO (el diseño 1-campaña/1-conjunto/amplio/evento-frecuente ES la mitigación oficial);
(d) **AEM/verify-domain/top-8-events iOS14 = MUERTO** (verificación de dominio ya no es requisito); (e) CAPI a $0
vía Cloudflare Worker (event_id dedup, SHA-256, token secret; Gateway de Meta descartado — AWS/GCP); (f) Google:
Maximize Clicks PRIMERO en campañas nuevas (textual), baseline 15 conv/30d, cambio 17-ago-2026 (tCPA ejecuta más
cerca del target); housing Google = solo US/CA (espejo Meta); (g) benchmarks: CPM CO ~USD 2-4 ❓, CPL LatAm 5-15 ❓,
**captación de PROPIETARIOS sin benchmark público → la planilla CPQL propia es el benchmark**. **37.3 Construido**:
skill **`pauta-captacion`** (repo+user; SKILL.md orquestador + references/playbook-primera-campana + setup-previo)
— dueña SOLO de: playbook COP, setup en orden, gates go/no-go (números matrícula/RNT al cierre de obra §36-bis),
doctrina de escala (TCPL→CPQL-propietario, work-email→OTP) y capa de vigencia; TODO lo demás delega (tabla §0).
**37.4 Los 8 parches de vigencia aplicados** a skills existentes ×2 copias: conversion-tracking (AEM muerto + Gateway
descartado) · platform-setup-checklists (AEM + alcance geográfico Special Ad) · meta-decision-system (números USD
B2B inoperables — método sí, números no) · google-search-playbook (bidding oficial 2026) · meta-ads-diagnostico
(taxonomía Mensajes + claim website>form re-etiquetado ❓ con palanca oficial Higher-Intent+OTP). **37.5
Anti-patterns**: cero benchmarks convertidos en reglas (❓ explícitos con vía de cierre por dato propio) · URLs+fecha
en todo claim de plataforma (L-30) · campañas EN PAUSA + "sí" de Daniel para dinero. **37.6 Modificados**:
skills/pauta-captacion (nueva ×2) · 6 references parcheadas ×2 · inventario · docs. INTACTOS: portal, kernel.
**37.7**: el ENCENDIDO de la pauta converge con el cierre de obra (entrega de números). Todo listo-para-encender.

## 38. ADR — Meta Business ORDENADO en vivo + alineación de cerebros ×4 ejecutada ⟦FABLE-5⟧ (2026-07-18)

**38.1**: Daniel conectó el MCP oficial de Meta + su Chrome y delegó la organización ("hoy no pautamos; ordenar
todo"). **38.2 Meta (MCP + Business Suite en vivo, con sus 2 aprobaciones explícitas)**: diagnóstico completo →
el desorden central era la cuenta publicitaria ACTIVA (`1784008112275023`, COP) flotando FUERA de los 2 portafolios
→ **RECLAMADA al portafolio Altorra Inmobiliaria** (`807047192483289`; acción permanente + términos comerciales —
ambas con ok explícito de Daniel vía AskUserQuestion) y **renombrada "ALTORRA Inmobiliaria - Ads"** · **píxel/dataset
CREADO**: "ALTORRA Inmobiliaria - Web" `1032884172712946` (sin categorías restrictivas — Housing no aplica a CO §34)
· inventario verificado: página `807043122483696` ✅ en portafolio · IG @altorrainmobiliaria ✅ (⚠️ login pendiente
del dueño) · WABA `1089080446378494` con +57 300 2439810 ✅ (⚠️ "Sin conexión" → abrir app en el teléfono) · personas
= solo Daniel ×2 identidades · cuenta vieja `36557834` CERRADA se deja quieta · saldo prepago ≈ COP 5k (recargar
antes de encender). Cuenta activa aún NO habilitada para Ads MCP (rollout). Inventario completo + pendientes-dueño →
`skills/pauta-captacion/references/activos-meta.md` (repo+user). Gotcha operativo: Business Suite en pestaña de
FONDO nunca renderiza (throttling) → pestaña en primer plano (pariente de L-26). **38.3 Alineación de cerebros
(workflow 3 agentes, mandato "alinea todos")**: constancias de liderazgo del 2026-07-10 POR FIN aplicadas —
**bersaglio ✅ commit+push `486640f`** (rama Desarrollo; payload de lecciones cars —detached-HEAD y metas— documentado como bloqueado por su shard
TODO-77 con instrucciones) · **insema ✅ commit+push `a042494`** (rama activa `cerebro/todo-32`; merge a main =
dueño) · **cars ⚠️ aplicado + 45 archivos staged, commit BLOQUEADO por su propio pre-commit** (su `10` sobre cap
PREEXISTENTE; sin burlar — resolución: poda del operador cars o `--no-verify` autorizado). Skills re-sincronizadas
×15 por repo (verdad SEO §33 + refreshes paid-ads v2.2/ad-creative v2.8 + parches de vigencia §37) con verificación
byte-idéntica; brain:check SANO en bersaglio/insema, preexistentes reportados sin tocar (límite de guardián).
**38.4 Anti-patterns**: acciones irreversibles/términos SOLO con ok explícito · categorías restrictivas NO marcadas
(evita recorte de entrega sin obligación legal) · clasificador/hooks jamás burlados · credenciales jamás tocadas
(login IG = dueño). **38.5 Modificados**: pauta-captacion/references/activos-meta.md (nuevo ×2) + 10 + 05 + repos
hermanos (sus commits). **38.6**: pauta lista-para-encender ahora también del lado META (faltan solo los 3
pendientes-dueño + números al cierre de obra).

## 39. ADR — Constancias ×3 COMPLETAS (cars no-verify autorizado) + pauta de humo + cierre de sesión §33-§39 ⟦FABLE-5⟧ (2026-07-18)

**39.1**: Daniel autorizó EXPLÍCITAMENTE el `--no-verify` para cars (su pre-commit bloqueaba por cap PREEXISTENTE
de su `10`, ajeno a la sinapsis) → **commit `6a26ba83` + push a `dev` EJECUTADOS** · protocolo del payload
CERRADO: constancia cars ✅ en `sinapsis-cerebros/SKILL.md §4` + archivo del payload borrado ⇒ **×3 CONSTANCIA DE
LIDERAZGO COMPLETA (cars ✅ bersaglio ✅ insema ✅) — TODO-20 CERRADO** tras 8 días. Nota para el operador cars: su
`10` sigue sobre cap (debe podar). **39.2 Pauta de HUMO** (idea de Daniel): mini-campaña de ~COP 5.000 (saldo
prepago) para verificar FONTANERÍA (entrega/facturación/métricas/clic-a-WhatsApp/revisión de política) antes de
la campaña real → `pauta-captacion/references/playbook-primera-campana.md §4b`; sujeta a los mismos gates (o usar
la pieza de VENTA, que no exige matrícula). **39.3 Respuestas operativas dadas**: WhatsApp Web NO quita el "Sin
conexión" (es espejo del teléfono; abrir la app en el celular sí) · guía de login IG entregada (credenciales =
solo el dueño). **39.4 Cierre**: sesión saturada → relevo curado en `10` (3 frentes para retomar), TODO commiteado
y pusheado en los 4 repos + bóveda, brain:check SANO. Racha del día: ADR §33→§39 en una sola sesión Fable.

## 40. ADR-040 — Meta operativo al 100% + pieza de humo por EMBUDO completo + TODO-28 #1 (caja negra anti-saturación)

**40.1 Meta cerrado EN VIVO** (Chrome del dueño + tools oficiales): WhatsApp del WABA pasó a **Conectado** (Daniel
abrió la app en el cel) + vínculo página↔WhatsApp VERIFICADO (número principal + CTA + mostrar número = CTWA listo) ·
IG↔página ya estaba conectado (cubre anuncios) y el login del asset en BM se cerró **VÍA CELULAR** (el OAuth web
daba "Sorry, something went wrong" — bug de Meta; lección portátil: OAuth de Meta fallando en web → probar vía
móvil) · Centro de seguridad ORDENADO: dominio `altorrainmobiliaria.co` en aprobación de pares ✅ + protección
predeterminada con Daniel como aprobador (2× "Cambios aplicados"; la alerta residual "0 aprobadores" = recomputo
perezoso o no cuenta al único admin — NO bloquea pautar, no reintentar en loop) · 2FA "Nadie" y verificación del
negocio quedan como decisiones OPCIONALES del dueño. **Único pendiente-dueño: saldo.** SSoT → `activos-meta.md`.
**40.2 Pieza de humo v1→v4 (APROBADA por Daniel 2026-07-18)**: v1 tipográfica (Brief P2) → feedback del dueño
(menos texto · CERO "valoración experta" — no somos expertos valorando · usar TikTok+Ads Library) → v3 híbrida
(fondo Google Flow del dueño + composición HTML + render Playwright 1080²/1080×1920) → **comité ×3 lentes**
(copywriter DR / guardián de voz / propietario-avatar; crudo `comite-copy-crudo.jsonl`) → v4 FINAL **en USTED**
(violación §3.1 del catálogo detectada y corregida: propietarios que consignan = usted): gancho "¿Su casa lleva
meses en venta y solo llegan curiosos?" + "Véndala con ALTORRA. Usted descansa, nosotros nos encargamos." Hallazgos
finos del comité: "con calma" = promesa equivocada para quien espera hace meses · el texto no repite gancho/ancla
del arte · "papeles" como respaldo (no auditoría al dueño) · CTA con micro-expectativa. Artes+copy+crudos →
bóveda `pauta/outputs/2026-07-18-humo/`.
**40.3 Proceso cableado** (mandato Daniel: "el marketing debe ser pro, no 1 skill"): **EMBUDO CREATIVO obligatorio**
en `pauta-captacion §0b` (grounding sweep completo → ≥3 candidatos → filtro de voz → comité ×3 → Daniel →
métricas→iteración) + **L-31** + receta visual sellada (la IA genera SOLO el fondo; texto/logo por HTML+Playwright).
Espionaje Ads Library ejecutado con tool oficial (390 ads activas "vende tu propiedad" CO; patrón ganador =
pregunta-dolor corta).
**40.4 TODO-28 #1 ✅** (caja negra anti-saturación, comité §33): `scripts/session-handoff.mjs` + hooks
PreCompact (foto de git + ORDEN de consolidar `10`) / Stop·SessionEnd (foto cada turno, async) / SessionStart
`--boot-echo` (el próximo operador la lee). El linter atajó el archivo nuevo como huérfano → `orphanAllowlist`
del manifest (gate #10 validado en vivo). Pendientes #2-#7 (#2 arreglaría el bug cazado hoy: boot-budget imprime
"✅ ≤ objetivo" estando por encima → kernel, sinapsis a cars).
**40.5 No-regresión**: cero código de producto tocado (solo skills/docs/hooks/bóveda); modo obra intacto; SW v5
sin cambios (no se tocó el shell → sin cache bump).
**40.6 OKs del dueño al cierre**: pieza ✅ · continuar TODO-28 ✅ · lotes TikTok ✅. El "sí" de DINERO sigue
pendiente y es aparte (contrato de seguridad §2 del playbook).
**40.7 Doctrina**: §3.3 (todo verificado en vivo con captura) · §G.4 captura completa (crudos del comité en bóveda,
commiteada y pusheada) · L-31 nace y se aplica en la misma sesión · embudo §0b vinculante para toda pieza a dinero.

## 41. ADR-041 — TODO-28 #2: candado del boot + dieta del router + fix kernel · HUMO bloqueado por rollout MCP (runbook listo)

**41.1 Causa raíz** (verificada leyendo código/API): (a) el presupuesto de boot solo ADVERTÍA y se ignoró 3 veces
(3 podas forzadas en 6 semanas — comité §33/bóveda futuro-cerebro); (b) bug del kernel: `brain-check.mjs:142-144`
imprimía "✅ ≤ objetivo" con el boot ENTRE objetivo y 1.1× (rama else sin caso intermedio); (c) HUMO: la cuenta
`1784008112275023` sigue `is_ads_mcp_enabled:false` ("gradually being rolled out") — 2ª verificación con
`ads_get_ad_accounts` el mismo 07-18; el fallback navegador es EN VIVO con Daniel, no desatendido (superficie de dinero).
**41.2 Solución estructural**: (i) `scripts/boot-gate.mjs` — replica la medición EXACTA del kernel
(`readFileSync utf-8 → .length`; validado: mismo 31111c) y BLOQUEA el commit si always-on > `bootCharsTarget`;
cableado en `githooks/pre-commit`; (ii) poda quirúrgica del router **−982c netos (31111→30129, margen 1371c)**:
duplicación (§7↔G.1/G.2 · §4↔§1), violaciones SSoT (secrets/áreas → `50`/`20`) y 2 hechos STALE corregidos
(marca decía "design system nace en D0/D1" → SELLADO §23; §7 decía "deploy lo hace el dueño" → delegado §2);
(iii) regla **one-in-one-out** en §G.5 con gate declarado (Regla de ADMISIÓN, no [HONOR]); (iv) fix del kernel
(rama leve-exceso) + propagación byte-idéntica ×3 (md5 `d060c3da` en inmobiliaria/cars/bersaglio — los peers
la commitean en su próxima sesión); (v) HUMO reducido a runbook ejecutable:
bóveda `pauta/outputs/2026-07-18-humo/montaje-ads-manager-runbook.md` (push `b459ab1`) — por MCP si Meta habilita, o 10 min en vivo.
**41.3 No-regresión**: kernel sigue READ-ONLY (reporta, no modifica); gate inerte si el manifest no declara target;
cero código de producto tocado; SW `v5` intacto (sin cache bump).
**41.4 Verificación**: `boot-gate` OK (30129≤31500) · `brain:check` SANO 16 checks · md5 kernel idéntico ×3 ·
`activos-meta.md` sincronizada repo↔user.
**41.5 Anti-patterns evitados**: montar pauta por UI desatendida (NO — dinero exige a Daniel presente) · responder
la auditoría con MÁS doctrina (comité: va a hooks/gates; la única línea nueva pagó con poda 4×) · wording stale
"kernel owner=cars" corregido: el escritor único ×4 es INMOBILIARIA (ADR §15 + skill sinapsis).
**41.6 Archivos**: mod `CLAUDE.md` · `scripts/brain-check.mjs` (+copias cars/bersaglio) · `githooks/pre-commit` ·
`skills/pauta-captacion/references/activos-meta.md` (+user) · docs `00/05/10/99`; nuevo `scripts/boot-gate.mjs`;
INTACTOS `portal/`, `service-worker.js`, todo el sitio.
**41.7 Doctrina**: §3.3 (cada afirmación con evidencia de ESTE turno) · §G.4 (bóveda commiteada y pusheada en el
cierre) · §G.5 one-in-one-out vigente desde hoy. Dato útil: mínimo diario API para COP ≈ 3.319/día.

## 42. ADR-042 — Campaña de HUMO MONTADA Y PUBLICADA EN PAUSA (vía extensión Chrome, con Daniel en vivo)

**42.1 Contexto/causa**: Ads-MCP siguió bloqueado (3ª verificación 07-18) → Daniel ordenó "intentamos con la
extensión". Montaje completo por claude-in-chrome sobre SU Ads Manager, con él presente (subió los 2 JPG:
el file-picker de la extensión solo acepta adjuntos del chat, y el CSP de Facebook bloquea todo fetch/localhost).
**42.2 Lo montado** (IDs: campaña `120250036063330588` · conjunto `...340588` · anuncio `...320588`):
campaña `META_HUMO_Leads_CTWA_Propietarios-CTG_2026Q3` Leads/Subasta/CBO **$4.000 COP/día** · conjunto
`HUMO_CTWA_CTG_amplio`: WhatsApp +57 300 2439810 ("Maximizar conversaciones"), **página Altorra Inmobiliaria**
(⚠️ defaulteó a la de CARS — corregida; ver L-32), SOLO **Cartagena de Indias +40km**, Advantage+ amplio, 0
intereses · anuncio `HUMO_venta_v4`: pieza FINAL 1080² + 1080x1920, copy v4 exacto (texto/título/desc), CTA
"Enviar mensaje de WhatsApp", plantilla **"Iniciar conversaciones 18/07/2026"** (bienvenida USTED + prellenado
"Hola, ALTORRA. Quiero vender mi propiedad en Cartagena." — SIN formulario) · **5 auto-mejoras Meta-AI APAGADAS**
(música/retoques/animación/superposición/mejoras-texto; §36 verificado en vivo: TODAS venían ON por default) ·
0 imágenes IA aceptadas · sin categoría especial (UI no la exigió — reconfirma §34).
**42.3 Desviaciones documentadas del runbook**: edad mínima **25** (Advantage+ CAPA el control en 25 — no existe
28; sugerencia igual) · idiomas "Todos" (la UI oficial dice limitar solo si el idioma NO es común en el lugar) ·
"Optimizar texto por persona" quedó ON (Meta no expone apagarlo; solo re-ubica NUESTROS textos entre campos).
**42.4 Verificación**: publicación confirmada por Meta ("1 campaña, 1 conjunto y 1 anuncio") · lista de campañas:
**Entrega=Desactivado, toggle OFF, $0 gastado** · anuncio "Procesando" (revisión de Meta corre sin entregar —
parte de la prueba de fontanería) · vista previa renderiza pieza+copy+botón WhatsApp correcto en feed y stories.
**42.5 Contrato de seguridad INTACTO**: todo en pausa; ENCENDER = "sí" explícito de Daniel + saldo (~$5k cubre
~1 día al mínimo). Gotchas de proceso: radio-clicks de Meta a veces NO registran (verificar con zoom ANTES de
Siguiente — el 1er intento de plantilla editó la equivocada) · listbox de edad virtualizado ignora scroll/teclado
sintético (escalera: seleccionar visible → reabrir).
**42.6 Archivos**: cero código tocado; bóveda humo actualizada AS-BUILT; `activos-meta.md` (repo+user) con nota.
**42.7 Doctrina**: dinero con Daniel presente ✅ · §0b intacto (pieza aprobada sin alteración IA) · §3.3 (cada
paso verificado por screenshot/DOM; el resumen stale de plantilla se re-verificó por DOM antes de publicar).
**42.8 ENCENDIDA (mismo 2026-07-18, "sí" explícito de Daniel: "Listo encendamos la pauta")**: toggle de campaña
ON → toast "Campaña actualizada" → estado del anuncio **"Activo"** (la revisión de Meta APROBÓ la pieza en ~40
min, sin sorpresas de política — check (d) de la fontanería ✅). Presupuesto $4.000/día contra prepago ~$4.992
→ vuelo ~1 día y muere sola. Reglas vigentes: días 1-7 NO tocar NADA (editar resetea aprendizaje) · responder
los chats entrantes (saludo automático ya configurado) · planilla CPQL desde el 1er chat · al agotarse el saldo,
verificar facturación (check (a)) + CPM real (b) + clic→chat correcto (c).

## 43. ADR-043 — TODO-27: FICHA del portal FIEL (8 hallazgos + 1 del crítico) ⟦OPUS-4.8⟧ (2026-07-18)

**43.1 Contexto/causa raíz**: Relevo de Fable a Opus (07-18). TODO-27 = cerrar los 35 MEDIA/BAJA de fidelidad del
portal; la **ficha era la más urgente (8 hallazgos)**. Causa raíz de los 8: el rebuild §32.8-22 replicó color/estructura
pero dejó **contenido inventado y interactividad muerta** donde el mockup callaba (el defecto de método de L-29). Método
obligatorio: leer la síntesis de bóveda `2026-07-17-...` → diff vs `ALTORRA Ficha.dc.html` → corregir textual → **re-audit
adversarial ANTES de decir "fiel"**. **Hallazgo capital**: leyendo el mockup REAL (no la síntesis) descubrí que la **3ª card
ALTA de "Propiedades similares" NUNCA se corrigió** — la síntesis madre decía "13 ALTA ✅ (commit `3a66a69`)" pero ese commit
arregló la 3ª card de `#destacadas` (HOME), homónima pero distinta; la de la ficha seguía inventada (Castillogrande/"Casa con
jardín"/4·4·260/$3.400M/chalet-dusk). *(Refuerza L-29: contar contra la FUENTE, no contra el "✅" del corrector.)*
**43.2 Solución (9 correcciones, todas en `ficha.astro`)**: **MEDIA** — M1 specs 2ª card similares → 4·4·260 (era 3·4·188) ·
M2 sello "Verificado por ALTORRA" inventado → RETIRADO del aside (+ CSS `.ficha-seal` muerto) · M3 favorito del encabezado
muerto → `ficha-fav`+`aria-pressed` + regla CSS `[aria-pressed='true']{bg navy·border navy·color gold-bright}` + listener que
alterna (réplica del `toggleFav` del mockup; OFF usa `--alt-link` #7d6119 por a11y) · M4 badge "En venta" + "Desde" inventados
→ retirados de las 3 cards (precio pelado). **BAJA** — B1 filas POI sin ícono → 6 íconos DISTINTOS del mockup (olas/ancla/bolsa/
birrete/edificio/avión) navy · B2 flecha "Simular mi crédito" → SVG + hover `translateY(-2px)` · B3 "Propiedades similares"
como `<section class="ficha-closer">` FUERA de `.ficha-secs` (fondo blanco·border-top·padding clamp(44,5vw,68)·h2 clamp(26,3vw,36))
· B4 4ª miniatura chalet-dusk → villa-modern (chalet-dusk = 0 en la ficha). **+ ALTA 3ª card** → villa-pool/Crespo/3·2·120/
"Casa familiar cerca del mar"/$760M. **+ 9ª (del crítico de completitud, fuera de la lista de 8, omitida por 2 auditorías
previas)**: ícono "Muelle privado" perdió su 2º sub-path `M6 7h1M6 11h1M6 15h1` → restaurado.
**43.3 No-regresión**: solo se editó `ficha.astro` (frontmatter + template + `<style>` + `<script>`). IDs/clases existentes
intactos; PropertyCard/Header/Footer/tokens SIN tocar. `similares` sigue usando `<PropertyCard>` (fav/orbe = reuso de componente,
exención #4). Build de Astro OK (10 rutas prerender, `/ficha` incluida), 0 errores de consola.
**43.4 Verificación (capas L-29)**: (1) build ✅ · (2) HTML construido (grep: sello=0, chalet-dusk=0, Crespo/$760M/120m² ✓,
2º sub-path Muelle ✓) · (3) DOM+computed en vivo (6 POI con svg navy, banda fuera de `.ficha-secs`, h2 36px) · (4) **interactividad
real**: toggle del favorito disparado → `aria-pressed` alterna, estado ON = color `#ebd27e`·bg `#062743`·border navy (idéntico al
mockup) · (5) **re-audit adversarial** (workflow 9 refutadores `effort:high` + 1 crítico completitud, ~1.1M tok): **8/9 FIEL high**
(ALTA-card3 = verificador falló por tooling, confirmado por crítico+M1/M4+vivo) + crítico declara TODA la ficha fiel salvo la 9ª
(ya corregida). ⚠️ **L-28 recurrió**: al medir el toggle, `color` leía gold-link (valor a mitad de `transition`) mientras `background`
(no transicionado) leía bien; `transition:none` reveló el valor final correcto — debí consultar `30-LECCIONES` al ver la asimetría.
**43.5 Anti-patterns evitados**: NO inventar (todo dato citado del mockup, archivo:línea) · NO declarar "fiel" sin re-audit
adversarial (§3.7/L-29) · NO tocar exenciones "Qué NO corregir" (rutas/contacto reales, tokens de color, a11y, PropertyCard reuso,
píxel) · scope-discipline: solo la ficha (Opus no toca Ads Manager ni `scripts/brain-*.mjs`, carril Fable).
**43.6 Archivos**: `portal/src/pages/ficha.astro` (código). Bóveda: `2026-07-18-ficha-reaudit-{crudo.json,sintesis.md}`.
Cerebro: este ADR + `00` + `10` + `05`. INTACTOS: PropertyCard/Header/Footer/tokens/base/components.css.
**43.7 Doctrina + cache**: L-29 (contar contra la fuente + re-audit adversarial), L-28 (getComputedStyle miente con `transition`),
§3.3 (evidencia archivo:línea), §3.7 (comité adversarial por iniciativa propia). **Sin cache bump** (portal greenfield no tiene
SW; el `altorra-pwa-v5` rige solo el legacy — L-24/K-10). Sigue TODO-27: turismo 8 · estancias 8 · serp 7 · home 2 · publicar 2.

## 44. ADR-044 — brain-kit v1.0: kit de neurogénesis portable para terceros (encargo Daniel) ⟦FABLE-5⟧ (2026-07-18)

**44.1 Contexto**: Daniel pidió migrar el cerebro (versión vigente) + skills + agents al proyecto de un amigo
(MacBook, Node+Firebase+GitHub, cerebro viejo monolítico con mucha documentación). Decisión de canal (suya): ZIP
por WhatsApp; el amigo descomprime en su repo y SU Fable 5 ejecuta la instalación. Este operador = escritor único
del kernel ×4 → empaquetar la versión vigente es su carril.
**44.2 Solución**: **kit de neurogénesis** en `C:\Users\romad\Documents\GitHub\brain-kit\` (carpeta NO-repo, fuente
de futuras versiones) → `Desktop\brain-kit-v1.0.zip` (0,6 MB, 205 entradas). Contenido: kernel 5 scripts + pre-commit
(**fork deliberado**: procedencia limpiada, mensajes portables, PATH homebrew/nvm — funcionalidad idéntica; el amigo
NO es peer: su manifest lleva `peers:[]`, el check #11 nuestro no lo ve) · plantillas (CLAUDE genérico §0/§G completo
parametrizado + 6 neuronas + manifest + settings con `$CLAUDE_PROJECT_DIR`) · **38 skills** (todas las user-level
MENOS catalogo-voz ×2 / pauta-captacion / sinapsis-cerebros — datos/estrategia nuestros — y ssg-static-prerender —
infra HUB no portable) · 5 agents · `INSTALACION-HUMANO.md` (5 pasos) + `INSTALACION-FABLE.md` (10 fases con gates:
preflight → cuarentena `_legacy/` → kernel → neurogénesis+entrevista al dueño (nombre/trato/rol/git/reglas) → bóveda
→ skills/agents → hooks → **F7 minería exhaustiva del cerebro viejo con `_legacy/TRIAJE.md` al 100%** → verificación+
commit → **F9 escaneo total + comité ×3 + consejo externo → propuestas al dueño**; F7/F9 ampliadas por orden de Daniel).
**44.3 No-regresión**: cero archivos del repo tocados por el kit (vive fuera); nuestras skills user-level INTACTAS
(el kit lleva copias); kernel nuestro intacto (peer-hash ×3 sigue verde).
**44.4 Verificación**: workflow adversarial 4 rompedores (654k tok) — dry-run EJECUTANDO el kernel en repo simulado
(2 escenarios: con/sin cerebro previo) + fugas + macOS + coherencia → **25 hallazgos (1 bloqueante), TODOS aplicados**
y re-verificados: QA final = 0 fugas (altorra/bersaglio/Daniel = 0 archivos) · 0 RELLENAR · 0 rutas de máquina ·
sintaxis 5 scripts + sh OK · LF puro · JSONs válidos · ZIP abre con `brain-kit/` raíz.
**44.5 Anti-patterns evitados**: copiar contenido de memoria nuestro al tercero (neurogénesis contra SU repo —
lección de cars: un copy que no aplica = no-op silencioso = falsa cobertura) · pisar lo del amigo (merge de
package.json/settings/hooks husky documentado) · borrar historia (cuarentena
`_legacy/` + TRIAJE) · confiar en el "a ojo" (el dry-run halló 1 bloqueante garantizado que el autor no vio).
**44.6 Archivos**: kit completo (fuera del repo) + ZIP. Bóveda: `2026-07-18-brain-kit-verificacion-{crudo.json,sintesis.md}`.
Cerebro: este ADR + fila `00` + bitácora `10`.
**44.7 Doctrina**: §3.7 (verificación adversarial por iniciativa propia) · L-29 extendida a **documentación ejecutable**
(un runbook que otros ejecutan sin ti exige dry-run mecánico contra el código real) · §G.4 captura (crudo+síntesis).
Sin cache bump (nada del sitio). Futuras versiones: editar `brain-kit/` → re-verificar → re-zipear vX.Y.

## 45. ADR-045 — TODO-27: TURISMO del portal FIEL (8 hallazgos) ⟦OPUS-4.8⟧ (2026-07-18)

**45.1 Contexto/causa raíz**: 2ª página de TODO-27 (fidelidad del portal) tras la ficha (§43). Turismo tenía 8 hallazgos
MEDIA/BAJA del re-audit §32.24. Causa raíz: el rebuild replicó el contenido pero divergió en el LAYOUT de dos secciones
(#inversión y Zonas) y en 6 textos. Método L-29: leer el mockup real `ALTORRA Turismo.dc.html` → diff → corregir textual
→ re-audit adversarial. A diferencia de la ficha, aquí los ALTA de turismo (§32.24: +18% retirado, 3 tarjetas de inversión
restauradas) SÍ estaban aplicados — pero se verificó igual, no se dio por hecho (lección de la ficha §43).
**45.2 Solución (8 correcciones, todas en `turismo.astro`)**: **MEDIA** — T1 #inversión reestructurada de split-2col+foto+
lista-vertical → **copy arriba + grid de 3 cards de vidrio** (íconos distintos gráfico/lupa+/casa, caja translúcida gold-
bright) + CTA; retirada la foto `.tur-inv__media` + CSS muerto del stat/perks · T2 párrafo #inversión restaurado ("más
deseados del Caribe… sin que muevas un dedo") · T3 CTA #inversión "Hablar con un asesor" → "Agenda tu asesoría" · T4 6
kickers de zonas (Frente al mar/Historia viva/Bohemio & vibrante/Tranquilo & exclusivo/Vistas & piscina/Naturaleza & calma)
+ enlace "Ver estadías →" · T5 zonas de foto-full-bleed+scrim+texto-blanco → **card blanca, foto arriba 196px, cuerpo
debajo** (kicker oro + h3 navy + p gris) · T6 eyebrow contacto "Contacto" → "Tu Cartagena empieza aquí". **BAJA** — T7 hero
1er CTA "Ver estancias" → "Explorar estadías" · T8 contacto 2º CTA de nav "/estancias" → **mailto al email real** (info@
altorrainmobiliaria.co, exención #1). + limpieza de `const check` muerto.
**45.3 No-regresión**: solo `turismo.astro`. Header/Footer/SITE/tokens INTACTOS. Secciones NO tocadas (servicios ×4,
Pasadías, footer) verificadas fieles por el crítico. Build OK (10 rutas prerender).
**45.4 Verificación (capas L-29)**: build ✅ · HTML construido (kickers ×6, "Ver estadías" ×6, tur-inv__card ×3, sin
tur-inv__media/stat/perk/scrim, "Agenda tu asesoría", "Tu Cartagena empieza aquí", email real ✓) · DOM/computed en vivo
(zona card bg blanco + título navy · inversión grid 3 cols, íconos distintos, ico gold-bright, `__in` display=block) ·
render (get_page_text 1:1) · **re-audit adversarial** (workflow 8 refutadores effort:high + 1 crítico, ~919k tok): **8/8
FIEL** (7 por refutador dedicado high; T1 = verificador falló por `StructuredOutput retry cap` tooling, confirmado por DOM
en vivo + crítico) + crítico de completitud: **0 divergencias nuevas** en las 7 secciones.
**45.5 Anti-patterns evitados**: NO inventar (todo del mockup, archivo:línea) · NO declarar "fiel" sin re-audit (§3.7/
L-29) · NO tocar exenciones (contacto/rutas reales, tokens de color, superficie navy sellada, image-slots no portados,
Pasadías/6-zonas deliberadas) · anti-código-muerto (retiré media/stat/perks/check muertos) · scope: solo turismo.
**45.6 Archivos**: `portal/src/pages/turismo.astro`. Bóveda: `2026-07-18-turismo-reaudit-{crudo.json,sintesis.md}`.
Cerebro: este ADR + `00` + `10` + `05`. INTACTOS: Header/Footer/PropertyCard/tokens/base/components.css.
**45.7 Doctrina + cache**: L-29 (contar contra la fuente + re-audit adversarial), §3.3, §3.7. Nota: el tooling falla ~1
agente/workflow (retry cap) — hit T1 aquí, ALTA-card3 en ficha; el crítico+DOM cubren el hueco. Sin cache bump (portal
sin SW). Sigue TODO-27: estancias 8 · serp 7 · home 2 · publicar 2 (19).

## 46. ADR-046 — TODO-27: ESTANCIAS del portal FIEL (8 hallazgos + 2 íconos) ⟦OPUS-4.8⟧ (2026-07-18)

**46.1 Contexto/causa raíz**: 3ª página de TODO-27 (fidelidad) tras ficha (§43) y turismo (§45). Estancias tenía 8
hallazgos MEDIA/BAJA del re-audit §32.24. Causa raíz: el rebuild divergió en la galería (layout + tira de miniaturas
inventada) y el widget de reserva (fechas sin prellenar → desglose mentiroso), + 4 detalles. Método L-29: mockup real
`ALTORRA Estancias.dc.html` → diff → corregir → re-audit adversarial. **Tensión conocida ejecutada**: el ALTA "galería
muerta" (§32.24 cableó la tira de miniaturas) se REEMPLAZÓ a propósito — la tira era invento; el mockup pide botón
"Ver 18 fotos" (la síntesis madre lo anticipaba).
**46.2 Solución (8 correcciones + 2 del crítico, todas en `estancias.astro`)**: **MEDIA** — E-M1+E-M2 tira de miniaturas
inventada RETIRADA (+ handler JS muerto) + botón "Ver 18 fotos" sobre la foto (mockup L126) · E-M3 galería → mosaico
`1.6fr 1fr`+`grid-auto-rows:1fr`, principal `grid-row:span 2` (era 3col×1fila) · E-M4 reserva PRELLENA fechas (llegada
hoy+7, salida hoy+10) + `min` en ambos + `recalc()` al cargar (antes: inputs vacíos + "$850.000 × 3 noches" estático
mentiroso + fechas pasadas posibles). **BAJA** — E-B1 breadcrumb inventado RETIRADO · E-B2 amenities "Parqueadero
incluido"/"WiFi" ya OK (ALTA §32.24), verificado · E-B3 foto Interior chalet-dusk → villa-modern (chalet-dusk=0 en la
página) · E-B4 cabecera derecha: rating ANTES del sello (estaba invertido). **+2 del crítico de completitud** (íconos de
amenities, fuera de la lista, omitidos por 2 auditorías previas): "Terraza con vista" glifo de edificios → parasol/mesa
(mockup L155) · "WiFi" +banda exterior (2 arcos → 3, mockup L150).
**46.3 No-regresión**: solo `estancias.astro`. Header/Footer/tokens INTACTOS. Sección Reseñas + meta ×4 (adiciones
§32.20) verificadas fieles por el crítico. Build OK (10 rutas prerender).
**46.4 Verificación (capas L-29)**: build ✅ · HTML construido (est-bc=0, est-thumb=0, "Ver 18 fotos", chalet-dusk=0,
íconos WiFi/Terraza corregidos ✓) · DOM/computed vivo (galería 2-col + main span 2, rating antes del sello, **fechas
prellenadas 25/28-jul + min + 3 noches honestas**) · **re-audit adversarial** (workflow 8 refutadores effort:high + 1
crítico, ~930k tok): **8/8 FIEL** (6 por refutador dedicado high; E-M4+E-B2 = verificadores fallaron por `StructuredOutput
retry cap` tooling, confirmados por DOM en vivo + HTML) + crítico halló **2 divergencias nuevas** (íconos) → corregidas.
**46.5 Anti-patterns evitados**: NO inventar · NO declarar "fiel" sin re-audit (§3.7/L-29) · NO tocar exenciones
(Reseñas/meta deliberadas, botón "Ver 18 fotos" sin handler = igual que el mockup, .alt-seal reuso de componente,
contacto/color/pixel) · anti-código-muerto (retiré tira + handler de miniaturas) · scope: solo estancias.
**46.6 Archivos**: `portal/src/pages/estancias.astro`. Bóveda: `2026-07-18-estancias-reaudit-{crudo.json,sintesis.md}`.
Cerebro: este ADR + `00` + `10` + `05`. INTACTOS: Header/Footer/tokens/base/components.css.
**46.7 Doctrina + cache**: L-29 (contar contra la fuente + re-audit), §3.3, §3.7. **El crítico de completitud gana su
costo en las 3 páginas** (íconos SVG mal portados = patrón recurrente que las auditorías por-sección omiten). El tooling
falla ~1-2 agentes/workflow (retry cap) — cubierto por DOM+crítico; pendiente: reintentar el agente caído. Sin cache bump
(portal sin SW). Sigue TODO-27: serp 7 · home 2 · publicar 2 (11).

## 47. ADR-047 — TODO-27: SERP (/comprar + /arrendar) FIEL (7 hallazgos + ALTA de arriendo) ⟦OPUS-4.8⟧ (2026-07-18)

**47.1 Contexto/causa raíz**: 4ª página de TODO-27 (fidelidad) — `[operacion].astro`, ruta dinámica que sirve /comprar y
/arrendar contra `ALTORRA Resultados.dc.html`. El mockup es un SERP MIXTO (4 venta + 1 arriendo + 1 corta-estancia en UNA
lista); el rebuild lo partió a propósito en 2 rutas (§32.22) pero **rellenó ambas con listings INVENTADOS**. Verificando
el ⚠️ de la ficha (los "ALTA ✅" no son de fiar), confirmé que el ALTA de /arrendar (5 listings inventados, §32.24) NUNCA
se corrigió — mismo patrón que la 3ª card de la ficha (§43).
**47.2 Solución (7 hallazgos + ALTA, en `[operacion].astro`)**: **MEDIA** — S-M1 card /comprar inventada 'San Fernando
$540M' RETIRADA · S-M2 corta-estancia de Getsemaní reetiquetada como venta $690M/88m² RETIRADA (no va en SERP de compra
→ dominio de estancias). /comprar = 4 venta reales (Castillogrande/Manga/Bocagrande/Crespo). **ALTA /arrendar** — 5
listings inventados + zona fabricada 'Alameda La Victoria' + count 83 → /arrendar = **1 arriendo REAL** (Casona colonial,
Centro Histórico, $8.500.000/mes); count → 24 (titular DEMO). pinsArriendo → 1 pin coherente. **BAJA** — S-B1 'Más filtros'
→ `data-filter`+`aria-pressed` (responde) · S-B2 barra sin sombra al scroll → `transition:box-shadow` + listener `scrollY>4`
(string byte-idéntico al mockup) · S-B3 3ª vía VERTICAL del mapa añadida (2px×60%, rot 9°) · S-B4 'Desde'/'Canon' inventados
RETIRADOS (precio pelado; priceSuffix `/mes` conservado). **2 decisiones documentadas**: (a) /arrendar 1 card = honesto,
trasladado a Daniel (¿demo-padding o esperar Firestore?); (b) favorito = CORAZÓN (no el '+' del mockup serp) — unificación
de design system: PropertyCard usa corazón en home/ficha/serp y el mockup de la ficha también; mockups inconsistentes entre
sí. El re-audit aceptó ambas.
**47.3 No-regresión**: solo `[operacion].astro`. PropertyCard/Header/Footer/tokens INTACTOS. Pins per-ruta (§32.24) y la
interactividad (filtros/fav/hover-pin) conservadas. Build OK (10 rutas prerender, /comprar + /arrendar incluidas).
**47.4 Verificación (capas L-29)**: build ✅ · HTML construido (San Fernando/Alameda=0, /comprar 4 cards, /arrendar 1 card,
priceLabel=0, road--3 ✓) · DOM/computed vivo (/comprar 4 cards + pines $1.450M/$980M/$2.100M/$760M, 'Más filtros' toggle
false→true, 3ª vía 2px×336px rotada, /arrendar 1 card + pin $8,5M/mes) · S-B2 por código+valor-forzado (el preview NO
scrollea — limitación del entorno, familia L-26; el string de sombra computa exacto al mockup) · **re-audit adversarial**
(workflow 7 refutadores effort:high + 1 crítico, ~838k tok): **8/8 FIEL, 0 fallos de tooling, crítico 0 divergencias nuevas**
(verificó las 5 cards 1:1 + card↔pin coherente + mapa + barra).
**47.5 Anti-patterns evitados**: NO inventar listings (cero fakes en web inmobiliaria — reduje a cards reales del mockup,
por eso /arrendar=1) · NO declarar "fiel" sin re-audit · NO fragmentar el componente sellado (corazón unificado) · NO tocar
exenciones (split, contacto/color, counts demo) · scope: solo serp.
**47.6 Archivos**: `portal/src/pages/[operacion].astro`. Bóveda: `2026-07-18-serp-reaudit-{crudo.json,sintesis.md}`.
Cerebro: este ADR + `00` + `10` + `05`. INTACTOS: PropertyCard/Header/Footer/tokens/base/components.css.
**47.7 Doctrina + cache**: L-29 (contar contra la fuente; el ALTA de /arrendar era el mismo defecto que la ficha), §3.3,
§3.7. **Aprendizaje: las páginas con PropertyCard NO sufren deriva de íconos SVG (crítico 0 nuevas) vs ficha/estancias con
SVG inline bespoke (1-2 nuevas)** — escrutar más las páginas con íconos propios. Sin cache bump. Sigue TODO-27: home 2 ·
publicar 2 (4, los más livianos).
> ✅ RESUELTO 2026-07-18 (decisión de Daniel, registrada en auditoría §49): **/arrendar = 1 card honesto hasta datos
> Firestore (TODO-22)** — la opción demo-padding quedó descartada. La síntesis serp de la bóveda aún dice "PENDIENTE";
> esta línea es la verdad.

## 48. ADR-048 — TODO-27 CERRADO: HOME + PUBLICAR FIEL (últimos 4 hallazgos) ⟦OPUS-4.8⟧ (2026-07-18)

**48.1 Contexto**: Últimas 2 páginas del re-trabajo de fidelidad (TODO-27), tras ficha/turismo/estancias/serp (§43-§47).
home 2 + publicar 2 = 4 hallazgos MEDIA/BAJA, los más livianos. Método L-29.
**48.2 Solución**: **HOME** (`index.astro`) — H-1 texto card 04 'Estancias' en #maneras restaurado al mockup ("Vive
Cartagena por unos días en propiedades verificadas, listas para habitar") · H-2 4 fotos del #journal → las del mockup
(principal hero-invierte · Rentas hero-estancia · Inversión villa-pool · Legal villa-modern). **PUBLICAR** (`publicar.astro`)
— P-1 h2 'Solicita tu avalúo gratis' + subtítulo movidos FUERA de `.pub-form__fields` → persisten como encabezado sobre el
mensaje de éxito (el script oculta SOLO los campos) · P-2 sección 'Cuatro pasos' → override `.pub-steps { padding-block:
clamp(56px,7vw,96px) }` (el `.alt-section` genérico llegaba a 112px vs 96px del mockup).
**48.3 No-regresión**: solo `index.astro` + `publicar.astro`. Componentes/otras secciones INTACTOS. Build OK.
**48.4 Verificación**: build ✅ · HTML construido (maneras 04 texto, journal imgs, pub-steps padding, h2 fuera de fields) ·
DOM/computed vivo (journal = [hero-invierte, hero-estancia, villa-pool, villa-modern]; **P-1: al enviar el form el h2
PERSISTE** + éxito visible; P-2 padding 89.6px=7vw) · **re-audit adversarial** (4 refutadores + 2 críticos, ~660k tok):
**4/4 FIEL + ambos críticos 0 divergencias nuevas** — el crítico de home barrió anti-invención (L-29) y verificó TODAS las
cifras del home contra el mockup (hero/ROI/reseñas/brokers/cerca), sin fakes.
**48.5 🏁 CIERRE DE TODO-27** (fidelidad del portal, §32.24 → §43-§48): las **6 páginas fieles**. Total corregido: **35
MEDIA/BAJA + 3 ALTA "fantasma"** (marcados ✅ pero nunca corregidos: ficha 3ª card §43, estancias galería §46, serp
/arrendar §47) **+ 3 íconos SVG** que cazó el crítico de completitud (ficha Muelle §43, estancias Terraza/WiFi §46).
**3 aprendizajes transversales**: (1) los "ALTA ✅" del corrector NO son de fiar 1:1 → contar contra la FUENTE (L-29); (2)
el crítico caza íconos SVG solo en páginas con markup bespoke (ficha/estancias), no en las de componentes compartidos
(turismo/serp/home/publicar); (3) el tooling (StructuredOutput retry cap) falla intermitente, cubierto por DOM+crítico.
**48.6 Archivos**: `portal/src/pages/{index,publicar}.astro`. Bóveda: `2026-07-18-home-publicar-reaudit-{crudo.json,
sintesis.md}`. Cerebro: este ADR + `00` + `10` + `05`.
**48.7 Doctrina + go-forward**: L-29/§3.3/§3.7. Sin cache bump (portal sin SW). **Follow-ups del portal Ola 1 (NO parte de
TODO-27)**: 🔸 /arrendar ✅ RESUELTO (1 card honesto, apéndice §47) · MapLibre real (TODO-30) · datos Firestore
(TODO-22) · wiring forms→`solicitudes`. (El "redeploy pendiente" era STALE — la CI auto-despliega cada push, `c0b7b8b`.)

## 49. ADR — Auditoría Nivel-2 del cerebro #4 (encargo Daniel pre-TODO-30): SANO · 2 mentiras en boot curadas · TODO-30 blindado · M-03 ⟦FABLE-5⟧ (2026-07-20)

**Deliberación:** workflow `auditoria-cerebro-nivel2-4` (6 sondas paralelas, ~850k tok, 6/6 OK, 0 errores) + sondas 0/5 directas. Crudo + tabla falsable → bóveda `research-archive/2026-07-20-auditoria-cerebro-nivel2-4-inmobiliaria.md`.

**49.1 Causa/gatillo**: encargo directo de Daniel ("escaneo profundo holístico ANTES de TODO-30": errores, eficiencia, vacíos, pérdida de memoria, huérfanos). Previa #3 = §33 (2026-07-18, cubrió 39 headers).
**49.2 Veredicto**: **SANO y FUNCIONAL** — retrieval frío 5/5 (4 respuestas con el boot puro, 0 saltos; la 5ª en 2 saltos deterministas vía índice, offset EXACTO) · índice §→línea 48/48 sin desync · hechos calientes consistentes entre nodos · memoria del harness espejada EN SYNC (diff = 0) · 0 contradicciones ALTA nodo-vs-realidad. PERO: **2 datos FALSOS en el boot** (05 decía "constancias ×3 pendientes" — §39 las cerró; y "Pendiente: 35 fidelidad" — §48 lo cerró), **1 vacío ALTO en el relevo de TODO-30** (sin criterio de validación del mapa real: los mockups son esquemáticos a propósito → chocaba con "NUNCA UI sin mockup"; y el proveedor de tiles se enmarcaba como decisión ABIERTA cuando §16 ya la selló: Protomaps `.pmtiles` en R2), y **REINCIDENCIA de la clase G-02** (bóveda compartida sucia otra vez a <48h de la "cura", carril bersaglio) → **M-03** (el gate debe vivir EN el recurso, no en rituales por-operador).
**49.3 Curado en este cierre** (~20 hallazgos; tabla completa en bóveda): `05` re-sellado sin SHA (M-01) + footer `000000`=PORTAL (el modo obra no exhibe matrícula) + conteo 66 redirects reproducible + humo "verificar si agotada a D+2" · **TODO-30 blindado** (tiles SELLADOS · alcance SOLO ficha+serp, home ilustrada §32.18 · criterio de preservación pins/hover/paleta · exención mockup documentada) · `20` refrescada (HOME COMPLETA 17/17 fiel + 5 cards + primitivas §32) · `CLAUDE.md`: **Poppins acotada a LEGACY** (contradecía §1 Cormorant/Hanken — deriva semántica viva en el router) + Globals→puntero `20` (one-in-one-out) · `60`: la lección de cars citada sin prefijo → prefijada `cars-` ×2 · `30`: guardarraíl TODO-01 ⚰️ + L-05/L-06 cuarentenadas → `_legacy/LECCIONES-SITIO-VIEJO.md` + **M-03** · `42`: URGENTE vencida marcada · `99`: apéndices /arrendar RESUELTO (§47) + TODO-25 cerrado (§30) + follow-ups §48.7 reconciliados · `00`: fila-síntoma muerta retirada + 10 filas-miniADR destiladas a hooks (cura el excedido 17.6k→<16k) · **bóveda commiteada+pusheada** (incl. los crudos bersaglio huérfanos — respaldo ajeno, M-03).
**49.4 ABIERTO (trackeado)**: **TODO-23 += sentencias kernel §49** (gate #7 git-aware de la bóveda vía fs · QUITAR #6b — sentencia G-11 con n=2 sin ejecutar · #13 regex de evidencia tautológica: endurecer o quitar · fusionar #1⊂#10 · validar `deepAudit.tableFile`) · **TODO-31 NUEVO**: SPOF (repos+bóveda+espejos+config en 1 cuenta GitHub + 1 disco; las curas G-03/G-04 CONCENTRARON en vez de redundar) → respaldo offsite mensual `git bundle` (medio = Daniel) + canario de boot (los hooks del harness mueren EN SILENCIO; marker+edad en boot-gate) + runbook de recuperación + GC mayor de `30` (shard L-22/26/28 → `31-VERIFICACION-UI` + fusión L-04/L-09) · **TODO-28 #6: proxy de costo ADOPTADO** — % commits `docs(cerebro)`/`archive` del mes = **49% > bandera roja 30%** → medir 2 semanas; si se sostiene, RECORTAR doctrina (criterio de salida §33), no añadir.
**49.5 Sonda 0 (diff vs #3)**: G-01/G-05 curados y **SOSTENIDOS** (boot-gate funciona; 0 drift — primera auditoría a la que el cerebro llega fresco) · G-09/G-10/G-12 abiertos-tracked · clase G-02 REINCIDENTE → M-03 (el lazo KPI exige meta-lección).
**49.6 Archivos**: `05`/`10` (re-sello + GC + TODO-30/31) · `CLAUDE.md` ×2 · `20`/`30`/`42`/`60`/`00`/`99` · `_legacy/LECCIONES-SITIO-VIEJO.md` (cuarentena nueva) · `.brain-manifest.json` (deepAudit 2026-07-20 · 49 headers · +`tableFile`) · bóveda `2026-07-20-auditoria-*` + README. **Kernel INTACTO** (sentencias → TODO-23).
**49.7 Doctrina + KPIs**: §3.3 (cada hallazgo con evidencia `archivo:línea` re-verificable) · §G.3/§G.4 (GC pareado: boot 31184c → menor; `00` bajo cap) · §G.2 🔵 (skill `auditoria-cerebro`). KPI reincidencia: 1 (G-02→M-03, con meta-lección). Sin cache bump (no tocó el shell). **Nota Obsidian** (pregunta de Daniel): veredicto del comité §33 RATIFICADO con la validación empírica de HOY (retrieval 5/5) — markdown+git+ruteo curado sigue siendo superior a Obsidian/RAG/Letta **para ESTE cliente (un LLM sin memoria) a $0**; Obsidian optimiza para ojos humanos y ni compite en este nicho.
> ✚ **§49-bis (mismo día — mandato de Daniel: "garantiza que no vuelvan a ocurrir")**: las 2 clases reincidentes de HOY pasaron de doctrina a **AUTOMATISMO instance-side** (M-02 cumplida): (1) **canario de boot** (TODO-31b ✅) — `session-handoff --boot-echo` estampa `docs/.boot-marker` (gitignored) en cada SessionStart y `boot-gate` (pre-commit) **BLOQUEA** si el marker falta o tiene >48h ⇒ hooks muertos ya no pasan en silencio (clase A-03/G-04); (2) **guardián de la bóveda** (M-03 gate, TODO-31b2 ✅) — `session-handoff` avisa en CADA boot si `brain-private` tiene archivos sin commitear y lo estampa en la foto de cierre (clase G-02: detección automática en ambos extremos de la sesión; el gate kernel #7 sigue → TODO-23). Verificado con simulación de fallo: bóveda-sucia dispara el aviso · marker envejecido (3d) bloquea con exit 1 · foto de cierre incluye estado de bóveda. Kernel INTACTO.

## 50. ADR — CEREBRO v2 · F0 "Restar y Blindar" EJECUTADA: kernel v1.3 (kill-list) + offsite default ⟦FABLE-5⟧ (2026-07-20)

**Deliberación:** propuesta v2 completa (comité ×3 + consejo Antigravity + síntesis) → bóveda `research-archive/2026-07-20-cerebro-v2-sintesis-propuesta.md` + crudos. **Daniel APROBÓ TODO** (2026-07-20) → F0 en la misma sesión.

**50.1 Causa**: plan Cerebro v2 (TODO-32). F0 = probar que el sistema sabe RESTAR antes de ganarse el derecho a sumar + matar la mitad "disco" del SPOF sin esperar decisiones.
**50.2 Solución — kernel v1.2 → v1.3** (escritor único = este repo): **QUITADOS** #6b (0 señal en 3 auditorías) y **#11 peer-hash** (warn-solo-full que no cazó 3 kernels divergentes en producción; F1 lo reemplaza con hash-gate BLOQUEANTE vs canónico) · **#1 FUSIONADO en #10** (BFS + registro directo §G.5 en un solo gate) · **#13 ENDURECIDA** (solo evidencia RESOLUBLE: §/TODO/ruta/URL/sha — la vieja aceptaba cualquier backtick/fecha) · **NUEVOS**: 5c tombstones-lite (nodo vivo que cita lección ⚰️ = warn; consejo Antigravity D) · 7b bóveda-vía-fs (HEAD local ≠ origin = warn, sin child_process; M-03) · #14 valida `deepAudit.tableFile` · `KERNEL_VERSION` stamp (prepara F1) · código muerto purgado (`sha`/`norm`/`createHash` sin caller tras morir #11). **Masa-neta: 492 → 491 líneas (≤ 0 ✅)**. Manifest: `kernelFiles`=5 (entran session-handoff + boot-gate) · ssotFact de PALETA (K-07 ✅: hex solo en CLAUDE.md §1+tokens.css; 05/10/00 apuntan) · `lastOffsiteBackup`.
**50.3 Offsite default (SPOF-disco MUERTO)**: `git bundle` de los repos git del ecosistema → `OneDrive/backups-cerebro/` + **restauración PROBADA** (clone desde bundle). Sin cuentas nuevas, sin decisión pendiente; el espejo remoto (2ª cuenta) queda como mejora opcional de F3.
**50.4 Verificación**: brain-check v1.3 **verde en --full y --boot** · la regex nueva de #13 MORDIÓ de inmediato (3 ticks históricos sin ancla → curados con anclas resolubles en 2 specs) · el 5c nuevo CAZÓ una cita viva a L-06 cuarentenada (`20`:43 → curada) · 7b da verde con bóveda pusheada (y warn probado en diseño con HEAD≠origin).
**50.5 Anti-patterns**: masa-neta ≤0 verificada por conteo (no promesa) · gates nuevos presence-guarded (repos sin tableFile/⚰️/bóveda no se rompen) · severidades HARDCODEADAS (anti green-tuning intacto) · NO se copió el kernel a mano a los peers (regla F1: todo llega vía `brain:pull` — los peers corren su kernel viejo sin romperse hasta el flip de F1).
**50.6 Archivos**: `scripts/brain-check.mjs` (v1.3) · `docs/.brain-manifest.json` (kernelFiles×5 + ssotFact paleta + lastOffsiteBackup) · `specs/{KICKOFF,R0-INVENTARIO}` (anclas) · `20`:43 (cita ⚰️) · `50-CONFIG-INFRA` (runbook offsite) · `00`/`10`/`99`. INTACTOS: brain-index/brain-diff/peers.
**50.7 Doctrina**: regla de admisión de maquinaria (v2) cumplida — F0 solo RESTÓ (2 gates muertos, 1 fusionado, código muerto purgado) y lo añadido es bloqueante-o-warn colgado del linter existente. Sin cache bump. **Siguiente: F1 (kernel único en `brain-private/kernel/` + `brain:pull` + hash-gate) — sesión fresca.**

## 51. ADR — CEREBRO v2 · F1 "Un Solo Kernel" EJECUTADA: canónico en bóveda + brain:pull + gate #0 BLOQUEANTE ×4 ⟦FABLE-5⟧ (2026-07-20)

**Deliberación:** diseño F1 en la síntesis v2 (bóveda) + hallazgo en vivo: la "divergencia" de bersaglio eran puros CRLF (0 líneas reales — el censo previo comparaba bytes sin normalizar); insema solo estaba 2 líneas atrás (le faltaba el fix §41). Los 3 hermanos flipearon limpio.

**51.1 Causa**: TODO-32 F1 — el kernel se copiaba a MANO ×4 (3 versiones distintas convivieron en producción sin que el warn #11 lo cazara).
**51.2 Solución**: (a) **canónico** = `brain-private/kernel/` (5 archivos + `VERSION` + `pull.mjs`); la bóveda ya existe, ya se clona, cero repos nuevos. (b) **`pull.mjs`** (vive UNA vez): copia al repo invocante SOLO los `kernelFiles` que SU manifest declara (inmobiliaria=5 · cars=3 · insema/bersaglio=2 — respeta divergencia por-repo) y escribe `scripts/.kernel-version.json` (stamp COMMITEADO). (c) **bootstrap por repo = 1 línea** npm: `"brain:pull": "node ../brain-private/kernel/pull.mjs"`. (d) **gate #0 BLOQUEANTE** en brain-check v1.4 (corre también en --boot): hash de cada kernelFile vs stamp (edición local = fork prohibido) + versión del stamp vs `VERSION` del canónico (stale → "corre brain:pull"); presence-guarded (sin stamp = repo pre-F1, info; sin bóveda clonada = compara solo stamp). (e) `REQUIRED_MANIFEST_MAJOR` con degradación RUIDOSA. (f) canario de boot-gate ahora **kernel-safe** (solo aplica donde settings.json cablea session-handoff — un repo sin hooks no se bloquea por un marker que nada escribe). (g) v1.4.1: #13 agrega POR SPEC (33 warns idénticos en cars eran ruido inaccionable → 6 legibles con conteo + 1er ejemplo).
**51.3 Test falsable CUMPLIDO**: editar el canónico (agregación #13) → bump `VERSION` 1.4.0→1.4.1 → `brain:pull` ×4 → **hash idéntico ×4 en <2 minutos** (la propagación a 2 repos midió 1.36s). Gate #0 verde en los 4 ("kernel v1.4.1 íntegro == canónico").
**51.4 Estado ×4 post-flip**: inmobiliaria SANO · insema SANO · cars 7 problemas REALES (33 ticks sin ancla en 6 specs + `10` sobre cap; su auditoría Nivel-2 vencida 22 ADRs) · bersaglio 8 problemas reales → deuda de SUS carriles, ahora VISIBLE y accionable (los gates haciendo su trabajo). Push a la branch de TRABAJO de cada repo (cars=`dev` [su main lo puebla la CI y el merge es de su carril] · insema=`cerebro/todo-32` · bersaglio=`Desarrollo`), con rebase donde origin iba adelante.
**51.5 Anti-patterns**: NO se mergeó dev→main de cars (13 commits de su carril — no míos) · NUNca --no-verify · el flip fue doble-modo (pull + check ANTES de commitear; rollback = git restore) · pull respeta el manifest de cada repo (cero archivos forzados).
**51.6 Archivos**: bóveda `kernel/` (canónico) · aquí: `package.json` (+brain:pull) + `scripts/*` v1.4.1 + `scripts/.kernel-version.json` · ×3 hermanos: ídem (sus kernelFiles). DIFERIDO a F2/F3: `core.hooksPath` compartido (riesgo alto, valor bajo hoy — los hooks por-repo funcionan).
**51.7 Doctrina**: regla de admisión (gate #0 = bloqueante; reemplaza al #11 muerto en F0) · M-03 estructuralmente atacada (1 fix = 1 comando ×4, se acabó la copia manual) · §3.3 (la "divergencia" de bersaglio se VERIFICÓ antes de actuar — era CRLF). **Siguiente: F2** (heartbeat sidecar + consolidación-en-frío + brain:archive; piloto aquí → pull ×4).

## 52. ADR — CEREBRO v2 · F2 piloto: heartbeat + consolidación-en-frío + brain:archive (kernel v1.5.1) ⟦FABLE-5⟧ (2026-07-23)

**52.1 Causa raíz**: TODO-32 F2 — el 49-52% del trabajo era mantener el cerebro, y el grueso: escribir A MANO estado derivable (M-01 ×2) + consolidar al FINAL saturado (M-02). Diagnóstico del comité: defecto de DISEÑO, no de disciplina.
**52.2 Solución estructural (3 órganos, nacidos EN el canónico y distribuidos vía pull)**: (a) **💓 heartbeat** en `session-handoff --boot-echo` (hook SessionStart YA existente): genera en CADA boot la mitad DERIVABLE (branch/HEAD/sucios/edad-de-origin vía mtime FETCH_HEAD/SW-cache/CNAME/**costo-cerebro 30d por paths**/consolidación-pendiente) → sidecar GITIGNORED `docs/.estado-auto.md` + eco al contexto. SOLO local, CERO red (sondas de red = resonancia F3). Degradación RUIDOSA: sonda fallida = "❌ NO VERIFICADO (motivo)", jamás valor viejo con sello fresco. **Atómico**: el `05` PERDIÓ la fila de cache y el claim git del header (solo JUICIO queda) y CLAUDE.md §4 perdió el paso manual "actualiza 05" — la clase "05 miente sobre lo derivable" muere porque el 05 ya no contiene derivables. **ssotFact re-apuntado**: dueño de `altorra-pwa-v\d+` = el SW mismo; 05/10 en scan → NO PUEDEN regresar a duplicarla (candado anti-regresión del escéptico). (b) **🧊 consolidación-en-frío**: el heartbeat detecta ≥3 commits de producto sin ADR y ordena consolidar como 1ª TAREA de la sesión FRESCA (contexto limpio > saturado; mata la causa raíz de M-02). (c) **📦 brain:archive** (consejo Antigravity C, parte MECÁNICA): esqueleto ADR 7-puntos + fila en 00 + brain-index automático + checklist de cierre; el JUICIO lo escribe Claude. Kill-switch declarado por órgano (falla 2×/mes sin costo medible → se borra).
**52.3 No-regresión**: hooks/gates previos intactos (canario, guardián bóveda, boot-gate, gate #0) · el `05` conserva TODO el juicio (misión/flags/sub-sistemas) · peers: solo consumen sus kernelFiles (el heartbeat les llega cuando su carril cablee el hook — no se les forzó nada).
**52.4 Tests/verificación**: heartbeat en vivo → sidecar + eco con costo-cerebro **52% 🔴** (métrica TODO-28 #6 midiendo sola por primera vez) y consolidación "al día" · brain:archive dogfood: ESTE ADR §52 nació de `npm run brain:archive -- --adr 52` (esqueleto+fila+índice reconciliado) · **punto ciego del gate #0 CAZADO EN VIVO**: edité el canónico sin bump (const de banner) → un repo quedó divergente con TODOS los gates verdes → cura v1.5.1: con el canónico presente, el gate compara CONTENIDO (probado: gritó "STALE v1.5.0 vs v1.5.1" antes del pull y verde tras él) · los 4 repos: "kernel v1.5.1 íntegro == canónico" · brain:check full+boot SANO · boot-gate OK.
**52.5 Anti-patterns evitados (§3)**: heartbeat NO commitea (churn saboteaba la métrica — sidecar gitignored, patrón .handoff probado) · NO red en el boot · NO destilación automática de ADRs prometida (la plomería es del script, el juicio es mío) · regla de admisión cumplida: los 3 órganos cuelgan de hook existente o son herramienta-de-cierre, y BORRARON en el mismo commit los pasos manuales que reemplazan.
**52.6 Archivos**: canónico `brain-private/kernel/` → v1.5.1 (session-handoff +heartbeat · brain-archive NUEVO · brain-check gate#0-contenido + #4 era-heartbeat) · aquí: `05` (−derivables) · CLAUDE.md §4 (−paso manual) · manifest (kernelFiles=6 · ssotFact SW-dueño · orphanAllowlist +.estado-auto) · `.gitignore` · package.json (+brain:archive) · stamps ×4 (v1.5.1 pusheado también en cars/insema/bersaglio).
**52.7 Doctrina + cache**: M-02 cumplida por DISEÑO (automatismo, no promesa) · §3.3 (el punto ciego se probó con el grito real del gate, no con fe) · §G.5 one-in-one-out (router: bullet §4 swap 1:1; 05 más chico). Sin cache bump (no tocó el shell). **F2 sesión-2 pendiente**: cablear el hook SessionStart en los 3 hermanos (instance, carril de cada repo o F3) · **Siguiente: F3** (resonancia por gate #14 + banner cristiano + skill mantenimiento-general).

## 53. ADR — CEREBRO v2 · F3: resonancia auto-disparada (gate #14 con gracia + banner en cristiano + skill mantenimiento-general) — v2 NÚCLEO COMPLETO ⟦FABLE-5⟧ (2026-07-23)

**53.1 Causa raíz**: TODO-32 F3 — el mantenimiento por calendario/disciplina es doctrina disfrazada (unánime comité + M-01/M-02: todo ritual pull-del-humano decayó). El sistema debe EMPUJAR.
**53.2 Solución estructural (kernel v1.6.0)**: (a) **gate #14 con ESCALACIÓN Y GRACIA**: auditoría vencida dentro de gracia (maxDays+7 / gap+6) = info; gracia agotada = **WARN** (bloquea commits del cerebro vía pre-commit — el empuje que el nudge-info nunca logró: la kill-list estuvo 3 semanas dictada bajo un info). (b) **🧭 banner EN CRISTIANO** en el heartbeat (3 líneas para Daniel en CADA arranque: costo % · edad del backup [`lastOffsiteBackup`] · estado de la revisión profunda) — cuando algo dice **TOCA**, su única acción es UN mensaje: "haz el mantenimiento mensual". (c) **skill `mantenimiento-general`** (repo+user, portable ×4) = EJECUTOR del runbook, jamás disparador: bundle offsite+restore probado → kernel ×4 al día → rotación Nivel-2 (con sonda de contradicción inter-doctrina + banco de retrieval) → PODA one-in-one-out (incl. doctrina que compensaba modelos viejos + kill-switches de órganos) → deuda de hermanos LISTADA sin invadir carriles → cierre con sellos.
**53.3 No-regresión**: severidades siguen HARDCODEADAS (la gracia también — anti green-tuning) · el nudge-info se conserva dentro de gracia · repos sin deepAudit/lastOffsiteBackup degradan a "⚠️ nunca" (presence-guarded) · hooks previos intactos.
**53.4 Tests/verificación**: banner EN VIVO ("52% 🔴 · backup hace 3 día(s) ✅ · revisión al día") · escalación probada con el caso REAL de cars: gap 22 ≥ 12+6 → "⚠️ MUY vencida; gracia agotada" (WARN, 9 problemas) mientras inmobiliaria (3d) queda "al día" · pull ×4 → `kernel v1.6.0 íntegro == canónico` en los 4 · bundles frescos ×5 en OneDrive (2026-07-23) + sello · este ADR nació de `brain:archive` (2º dogfood).
**53.5 Anti-patterns evitados (§3)**: cero calendario/cron (el empuje vive en gates+banner que YA corren) · el runbook NO cura deuda de otros carriles (solo la lista; respaldo-ajeno de bóveda es la única excepción, M-03) · skill con anti-patterns explícitos (no correr "por si acaso", no engordar el runbook sin podar).
**53.6 Archivos**: canónico → v1.6.0 (session-handoff: banner+costoPct · brain-check: #14 escalación) · `skills/mantenimiento-general/` (repo + copia user ✅ ambas) · `docs/skills-inventory.md` (+fila) · manifest (`lastOffsiteBackup` 2026-07-23) · stamps ×4 (v1.6.0 pusheado en cars/insema/bersaglio) · bundles ×5 OneDrive.
**53.7 Doctrina + cierre de Cerebro v2**: M-02 llevada a su forma final (hasta el MANTENIMIENTO es empujado por automatismo) · §G.5 one-in-one-out. Sin cache bump. **🏁 v2 NÚCLEO COMPLETO (F0 §50 · F1 §51 · F2 §52 · F3 §53) en 2 sesiones — el plan estimaba 5-6.** Restos vivos (no bloquean): F2-s2 cablear hooks SessionStart en los 3 hermanos (instrucción = kernelFiles+settings, carril de cada repo) · TODO-31 c/d (runbook recuperación de cuenta · shard de `30`) · la PODA REAL de doctrina cuando la métrica mande 2 meses (criterio de salida). Veredicto honesto: v2 convirtió las 4 clases de dolor probadas (estado-miente · consolidación-saturada · kernel-divergente · mantenimiento-olvidado) en imposibles-por-diseño o empujadas-por-gate.

## 54. ADR — TODO-22: auditoría Fable de la capa de datos (§22 ✅) + Decisión Fuerte OD-Catálogo → doc-índice denormalizado (B condicionada; adenda de consejo externo PENDIENTE) ⟦FABLE-5⟧ (2026-07-23)

**54.1 Causa raíz / contexto**: §22 quedó `[REVISAR-FABLE]` (su comité corrió SIN consejo externo) y §22.7b DIFIRIÓ la decisión del catálogo público — la compuerta de los datos reales del portal (SERP + filtros + pins del mapa TODO-30 + similares). Mandato Daniel 2026-07-23: continuar sin preguntar (él aporta visión, no decisiones técnicas).
**54.2 Auditoría (a) — §22 AUDITADO ✅ con evidencia de HOY, no del ADR**: vitest **26/26** verdes (2026-07-23) · `verify:data` 30 archivos limpio (cero SDK/onSnapshot/query-sin-límite) · lectura línea a línea de `client.ts`/`firestore-rest.ts`/`cache.ts`/`middleware.ts`: los 5 endurecimientos del comité OD1 PRESENTES (defaults mapa/array vacío · despacho por presencia de clave · `getDoc` nunca lanza · anti-traversal por segmentos · memo por-request + deny-list `config` + colapso anti-oráculo `denied+not-found→unavailable`). El E2E 21/21 (§22.8) no se re-corrió (requiere emulador+Java) — sello vigente.
**54.3 Decisión (b) — OD-Catálogo = OPCIÓN B: doc-índice denormalizado** `indices/catalogo-{operacion}` mantenido por Cloud Function `onWrite(propiedades)`; leído por UNA ruta Worker (`/api/catalogo/[operacion].json`) vía `client.ts` (get por id conocido — NO viola `verify:data`) + Workers Caching con purga por tag YA diseñada. Comité ×3 **UNÁNIME** (arquitecto-costo · escéptico-consistencia · ejecutor; 4/5 c/u; crudo → bóveda `2026-07-23-comite-od-catalogo-CRUDO.json`). **DESCARTES**: A (SSG-por-CI) por BLOCKER doble — token GitHub en la Function = muerte SILENCIOSA de la frescura al expirar (el devops que el invariante prohíbe) + acopla plano de DATOS al de CÓDIGO (una edición de precio redespliega main, builds fuera de orden) + reabre el callejón cerrado en Q1; C (JSON en R2) DOMINADA — paga la misma maquinaria de purga/reconciliación MÁS un segundo store con secretos S3, para ahorrar menos del 1% de una cuota que B ni roza (queda como optimización futura B→C: solo cambia el destino de escritura de la Function).
**54.4 CONDICIONES VINCULANTES** (sin ellas B es bomba — hallazgos BLOCKER/ALTA del escéptico; tensión incremental-vs-total resuelta por Fable a favor del escéptico): (1) **rebuild TOTAL idempotente** del índice (query Admin `estado==publicada` + `limit(2000)`) — patch incremental **PROHIBIDO** (lost updates + drift permanente sin reparación); costo domado con **debounce** (patrón legacy `onPropertyChange` 5min) + warn a 700KB/shard; (2) el doc índice **SIEMPRE existe** (seed `{items:[],version}` al deploy; despublicar el último escribe lista VACÍA, no borra) y el repo `catalogo.get()` distingue: not-found→vacío canónico (estado-cero legítimo — el índice es público por definición) / denied→`unavailable` (reglas rotas JAMÁS se disfrazan de vacío); (3) **TTL = techo duro de staleness** (catálogo `s-maxage` 300-900) y la purga = aceleración best-effort — ⚠️ el claim del comité "purga Cache API es POR-PoP, no global" queda **NO VERIFICADO** (§3.3) → GATE-1 lo mide en staging + docs vivas; si se confirma, AUDITAR el TTL 86400 de fichas (deuda propagada a `cache.ts`); (4) rules: `allow read` explícito a `indices/{doc}` + tests de rules en emulador; (5) retries del trigger habilitados + scheduled rebuild diario + botón "Republicar catálogo" en `gestion` (palanca humana cero-técnica); (6) flag `PUBLIC_CATALOGO_SOURCE=demo|live` SIN fallback automático (un fallo real jamás se disfraza de demo) + `coords` nullable (card sin pin). Contrato JSON (resumen ~0.5KB/item: id·slug·título·op·tipo·precio·sector·hab/ban/área·lat/lng·thumb-key R2·badges·pub) + orden de obra de 9 artefactos → crudo.
**54.5 Verificación / gates**: la LISTA CERRADA estado-cero/borde para la implementación = G1-G12 del ejecutor (índice inexistente · vacío post-unpublish · 1ª publicada en vivo+recarga · última despublicada colapsa limpio · borrador jamás en el JSON · edición+purga · sin-coords · doc corrupto→degradado · economía 1-read/miss · flag demo/live única rama · shards independientes · rules anónimo) + GATE-CRASH y GATE-CARRERA del escéptico (idempotencia y concurrencia PROBADAS en emulador, no asumidas). **Implementación = carril OPUS (después de TODO-30)**; auditoría por gates = Fable.
**54.6 Archivos**: NINGUNO de producto (decisión, no implementación). Cerebro: `99`(+§54) · `00`(+fila) · `10`(TODO-22) · `05`(sub-sistemas) · bóveda (crudo + fila README, mismo cierre — M-03).
**54.7 Doctrina + estado**: W-11 núcleo seco (Fase A evidencia empírica → comité ×3 → veredicto Fable) · §3.3 (claims del comité marcados verificados/no-verificados) · §3.7 · §G.4. Sin cache bump (portal sin SW). **Consejo externo: prompt DOBLE-CIEGO entregado a Daniel (Gemini 3.1 Pro High, per `15 §0b`) — problema crudo + opciones + invariantes, SIN el veredicto. La decisión queda PROVISIONAL-B hasta integrar la adenda** (si Gemini refuta con evidencia que YO verifique, se re-abre; si converge, se sella — patrón R5).
**54.8 Adenda (2026-07-23, mismo día) — consejo externo INTEGRADO → B SELLADA.** Gemini 3.1 Pro High (doble-ciego, crudo → bóveda `2026-07-23-gemini-od-catalogo-CRUDO.md`) **CONVERGIÓ en B** sin conocer el veredicto = 4ª opinión independiente, 2ª familia (señal fuerte). **✅ Converge además**: BLOCKER del PAT en A · reconciliador nocturno (= scheduled rebuild ya adoptado) · `catalogo.get()` explícito (= artefacto #2). **🔄 Adoptado**: carrera sin transacciones en R2 (ángulo nuevo; refuerza la dominancia de B sobre C) · omit-nulls y thumb sin dominio en el contrato · alerta de stampede post-purga (mitigada: escala local + TTL techo). **⚖️ Contradicción comité↔Gemini (purga) RESUELTA en docs vivas CF (2026-07-23)**: el Cache API CLÁSICO purga solo su data-center (el comité era correcto… para el API viejo); el **Workers Cache NUEVO (el nuestro, `ctx.cache.purge`) monta la infra de zone-purge → purga ~GLOBAL — Gemini acierta para NUESTRO mecanismo**; GATE-1 pasa de "decidir" a "confirmar"; la condición TTL-techo-duro SE MANTIENE (la purga aún puede fallar por HMAC/deploy). **❌ Refutado con evidencia**: (a) su contrato JSON omite TÍTULO y SLUG → no renderiza card ni enlaza ficha (su "150 bytes / 6.000 items" es óptica sin los campos obligatorios; se mantiene el contrato del comité ~0.5KB); (b) "SWR defiende PoPs fríos" — un PoP frío no tiene copia stale que servir; (c) "activen SWR" tal cual — **la doc viva dice que `s-maxage` (lo que `cache.ts` usa) DESACTIVA el stale-serving**; la decisión real es la ESTRATEGIA DE HEADERS y va a la obra. **🎯 Bonus de la verificación (drift real cazado)**: `cache.ts` FICHA `s-maxage=86400` diverge de R5-Q1 (`600`+SWR) Y la receta R5-Q1 era letra muerta (SWR nunca operaría junto a s-maxage) → **deuda a la obra del catálogo: re-decidir headers CONSCIENTE** (edge-only purgeable con s-maxage corto VS `max-age`+SWR que también cachea en navegador donde la purga no llega). L-18 ACTUALIZADA con la semántica verificada. **FALLO FINAL: B SELLADA con las 6 condiciones del §54.4 + deuda de headers.** Implementación = Opus post-TODO-30.

## 55. ADR — TODO-30: mapa REAL (MapLibre GL v6 + Protomaps .pmtiles en R2) en ficha y SERP — implementación + degradación limpia ⟦OPUS-4.8⟧ (2026-07-23)

**55.1 Contexto**: los mapas de ficha (`.ficha-locmap`) y SERP (`.serp-map`) eran ESQUEMÁTICOS (placeholders CSS). TODO-30 (fila blindada: tiles Protomaps sellados, solo ficha+serp, home ilustrada NO se toca) = reemplazarlos por el mapa real. Exención documentada al mandato-mockup (los mockups son esquemáticos a propósito); criterio de validación = PRESERVAR pines de precio + emparejamiento card↔pin (hover) + paleta navy/oro.
**55.2 Solución estructural**: (a) **isla client-side compartida** `src/scripts/altorra-map.ts` (cargada por `import()` dinámico → code-split, solo en ficha/SERP): registra el protocolo pmtiles, arma un basemap claro Protomaps (`@protomaps/basemaps` v5 `layers()`+`namedFlavor('light')`; glyphs/sprites de GitHub Pages estático, no API de pago), coloca los pines-precio como **marcadores MapLibre navy/oro** (reusan el look sellado), encuadra a los pines (SERP). APIs verificadas contra docs vivas (L-14) + `worker-configuration.d.ts` (`wrangler types`). (b) **Fuente del basemap = `.pmtiles` servido desde R2** vía ruta Worker con RANGE `src/pages/tiles/[file].ts` (honra el sello "binarios a R2"); URL configurable `PUBLIC_PMTILES_URL`, default = ruta R2. (c) **Degradación limpia**: hasta que el `.pmtiles` exista, el ESQUEMÁTICO sellado permanece; `is-live` se activa SOLO al confirmar `isSourceLoaded` (no en `load`, que pintaría un mapa EN BLANCO si la fuente falla — caza-bugs). Emparejamiento card↔pin por `data-pin-idx` → idéntico sobre esquemático (fallback) y marcador vivo. Coords reales de los centroides del seed por barrio.
**55.3 No-regresión**: home ilustrada INTACTA (§32.18, fuera de alcance) · contenedores sellados `.serp-map`/`.ficha-locmap` conservan borde/sombra/chrome (zoom cableado a MapLibre, dibujar-zona visual) · el esquemático completo queda como fallback (cero pérdida visual sin tiles) · deps nuevas (maplibre-gl/pmtiles/@protomaps/basemaps) NO añaden vulnerabilidades (las 6 del audit son pre-existentes: astro/sharp/svgo). Sin cache bump (portal sin SW).
**55.4 Verificación (gate empírico — evidencia real)**: `astro build` ✓ · `astro check` con MIS archivos LIMPIOS (único error = `index.astro` LuCard `swatches`, **PRE-EXISTENTE**, no tocado → chip) · `verify:data` 32 ✓ · `verify:build` (R2_MEDIA cableado) ✓ · vitest **26/26** ✓. **Camino vivo en dev (reflejo caza-bugs §G.4)**: fallback correcto (`is-live=false` sin tiles), MapLibre monta canvas WebGL + **4 marcadores en coords reales**, **card↔pin hover enciende/apaga** `data-pin-idx`, cero errores de consola. **BUG cazado + corregido**: la ruta R2 daba **500** por `Astro.locals.runtime.env` REMOVIDO en Astro v6 → `import { env } from 'cloudflare:workers'` (L-33); tras el fix, 404 limpio con R2 vacío + anti-traversal OK. Otro gotcha del mismo montaje: maplibre-gl v6 sin default export → named imports (L-33).
**55.5 Anti-patterns evitados**: NO tercer-party runtime para tiles (build.protomaps.com queda solo como opción de smoke-test por env; prod = R2, honra el sello) · NO `load` como señal de "vivo" (pintaría mapa en blanco) · NO romper el esquemático sellado (es el fallback) · NO tocar la home ilustrada · NO adivinar el 500 (leí el stack, systematic-debugging) · NO `git add -A` · NO arreglar deuda pre-existente ajena (chip).
**55.6 Archivos**: NUEVOS `portal/src/scripts/{altorra-map.ts,altorra-map.css}` · `portal/src/pages/tiles/[file].ts`. MODIF `portal/src/pages/{[operacion],ficha}.astro` (canvas + data-attrs + boot + coords + hover por data-pin-idx) · `portal/src/env.d.ts` (runtime + PUBLIC_PMTILES_URL) · `portal/package.json`(+lock). Generado (gitignored) `worker-configuration.d.ts`. INTACTOS: home, capa de datos, rules, legacy.
**55.7 Doctrina + PENDIENTE (2 compuertas)**: L-14 (verificar stack vivo) · §3.3 (leer el stack, no adivinar) · §G.4 (caza-bugs camino vivo + captura). **Faltan para CERRAR TODO-30**: (a) **generar+subir `cartagena.pmtiles` a R2** (extracto bbox Cartagena con go-pmtiles CLI — tooling ausente esta sesión; runbook en `50-CONFIG-INFRA §Tiles`; el `wrangler r2 object put` es deploy delegado a Claude, §2); (b) **verificación VISUAL en el Chrome del dueño** (un mapa WebGL NO renderiza en el panel integrado, L-26; + sin tiles no hay imagen). Hasta cerrarlas: implementación LISTA y con fallback verificado-vivo, mapa real NO visto aún.

**55.8 Adenda (2026-07-23, mismo día) — compuerta (a) DESTRABADA: tiles GENERADOS y empacados como ASSET ESTÁTICO** (Daniel: "¿no puedes hacer nada?"). Ruta que evita AMBOS bloqueos (tooling + credenciales R2): (1) descargué go-pmtiles v1.31.2 (CLI oficial Protomaps, Windows) → `pmtiles extract https://build.protomaps.com/20260722.pmtiles --bbox=-75.60,10.30,-75.42,10.52 --maxzoom=15` → **`cartagena.pmtiles` 3.33 MB** (válido: spec v3, MVT, bounds Cartagena); (2) empacado en `portal/public/basemap/cartagena.pmtiles` = **asset estático** (se despliega con el portal, cero R2, cero credenciales del dueño). **Refinamiento del sello "pmtiles en R2" (§3.7)**: para UN basemap chico e inmutable el asset estático es más simple (R2 sigue siendo el hogar de las FOTOS: muchas/grandes/de-usuario); la ruta Worker R2 `/tiles/[file]` queda como alternativa para tiles futuros grandes; `PUBLIC_PMTILES_URL` default → `/basemap/cartagena.pmtiles`. **Verificado en dev**: asset servido **206 + rangos byte-correctos** (magic "PMTiles", spec 3, 3.488.713 B), MapLibre monta canvas 595×700 + 4 marcadores, build empaca a `dist/client/basemap`. **Última compuerta**: el RENDER visual solo se ve en navegador REAL (L-26: el panel integrado congela el WebGL, rAF=0 → el mapa monta pero no pinta tiles ahí) → visto bueno de Daniel en su Chrome / staging. **`50 §Tiles` actualizado**. Commit `934596a`.

**55.9 Adenda (2026-07-23) — el mapa NO cargaba en PROD; bug de RANGE + trampa de paridad dev↔prod (feedback Daniel + captura).** Con el asset ya empacado, Daniel reportó que en su Chrome el mapa seguía ESQUEMÁTICO. Diagnóstico con la extensión Chrome sobre staging: un `GET Range: bytes=0-99` a `/basemap/cartagena.pmtiles` devolvía **200 + el archivo ENTERO** (3.488.713 B) — **Cloudflare Workers Static Assets IGNORA el header Range**, y pmtiles.js lo NECESITA. **Trampa**: `astro dev` SÍ honra Range (206) → el bug NO se reprodujo en dev (paridad dev↔prod falsa; ver L-34). **FIX**: la ruta Worker `tiles/[file].ts` ahora lee el `.pmtiles` por el binding **ASSETS** y **trocea el rango ella misma** (206 + Content-Range; cache module-scope del buffer, seguro por inmutable); `PUBLIC_PMTILES_URL` → `/tiles/cartagena.pmtiles` (Worker, no asset plano). **BUG-2 (feedback)**: quitado el pre-resaltado `is-on` del pin Manga (ningún pin se ilumina sin hover; confirmado visualmente). **Verificación END-TO-END** (la visual del render WebGL NO es posible en pestañas automatizadas: rAF congelado en 2º plano — afecta al panel Y a la extensión Chrome cuando la pestaña está en segundo plano, ver L-34/31): pmtiles.js (la MISMA librería de MapLibre) leyó **tiles REALES de Cartagena** desde staging a **z10/z12/z14 (37/45/15 KB)** vía Range 206 → el camino de datos entero funciona; el render corre en foreground. Refuerzo: `is-live` también se activa por `idle`+`isSourceLoaded`. Commits `7d9515e`+`aaf5825`. **TODO-30: código COMPLETO y verificado a nivel de datos; la vista final la confirma Daniel en su navegador.**

## 56. ADR — TODO-22/§54 obra: camino de LECTURA del catálogo denormalizado (mitad 1/2) ⟦OPUS-4.8⟧ (2026-07-23)

**56.1 Contexto**: §54 SELLÓ OD-Catálogo = doc-índice denormalizado (comité ×3 + Gemini). La obra se parte en 2 porque el portal **NO tiene subsistema de Cloud Functions** (su emulador es solo Firestore; las functions legacy viven en la raíz). Esta mitad = el camino de LECTURA (el portal ya puede LEER `indices/catalogo-{shard}`); la de ESCRITURA (la Function que lo puebla) es el siguiente incremento (levanta functions nuevas; deploy gateado al cutover TODO-17).
**56.2 Solución estructural**: (a) `domain/catalogo.ts`: `CatalogoResumen` (contrato del comité §54.4: **titulo+slug OBLIGATORIOS** — refutación a Gemini —, `coords` nullable = card sin pin) · `CatalogoIndice` · `CATALOGO_SHARDS`=venta|arriendo|dias · `operacionAShard`/`rutaAShard` · `catalogoVacio()`. (b) `client.ts` `catalogo.get(shard)`: GET puntual del doc (id de lista CERRADA → sin traversal, respeta `verify:data`); **estado-cero** — not-found→**vacío canónico** (legítimo: el índice es público por definición), denied/error→**`unavailable`** (RUIDOSO, JAMÁS vacío silencioso — §54.4 cond.2), doc corrupto→degradado seguro (G8). (c) `firestore.rules` `indices/{doc}`: `get` público SOLO de shards conocidos (allow-list, defensa en profundidad); list/write denegados. (d) ruta `/api/catalogo/[operacion].json`: sirve el índice con **cache EDGE-ONLY purgeable** (`s-maxage=600` + `cache-tag: catalogo:{shard}`, resuelve la deuda de headers §54.8 en la rama correcta: sin `max-age` → no cachea en navegador donde la purga no llega) + 404/503 explícitos.
**56.3 No-regresión**: NADA se despliega a usuarios aún — el SERP sigue en datos DEMO (la ruta queda DORMIDA: sin rules desplegadas + índice inexistente devuelve 503; el wiring del SERP tras el flag `PUBLIC_CATALOGO_SOURCE=demo|live` es incremento posterior). Capa de datos existente INTACTA (solo se AÑADE `catalogo`); rules previas intactas (solo +bloque `indices`). Sin cache bump.
**56.4 Verificación (4 capas)**: **vitest 33/33** (+7 unit: shard inválido·404→vacío·403/500→unavailable·corrupto→vacío·decode fiel·items:[]) · **rules emulador 20/20** (+5: anón lee `catalogo-venta`, deniega shard desconocido/list/write, **borrador sigue oculto** = anti-oráculo G12; Java local JDK25) · **ruta viva en dev** (404 ruta inválida · 503 unavailable sin crash — Firestore real deniega `indices` sin rules desplegadas, comportamiento CORRECTO) · gates `astro check` 0 errores · `build` ✓ · `verify:data` 34.
**56.5 Anti-patterns evitados**: NO query/list (get puntual, `verify:data` verde) · NO disfrazar denied/error de vacío (loud) · NO `max-age` en el catálogo (la purga no llega al navegador) · NO wirear el SERP con la ruta dormida (evita regresión a 503) · cwd correcto para `astro check` (L-33-bis: `npm --prefix` no cambia cwd → correr desde `portal/`).
**56.6 Archivos**: NUEVOS `portal/src/lib/domain/catalogo.ts` · `portal/src/lib/data/catalogo.test.ts` · `portal/src/pages/api/catalogo/[operacion].json.ts`. MODIF `portal/src/lib/domain/index.ts`(barrel) · `portal/src/lib/data/{client.ts,cache.ts}` · `portal/firebase/{firestore.rules,tests/rules.test.ts}`. INTACTOS: SERP/ficha (siguen demo), mapa, legacy.
**56.7 Doctrina + SIGUIENTE**: §3.7 (obra de la decisión sellada) · §G.4 (caza-bugs camino vivo). **Mitad 2/2 (siguiente incremento Opus)**: subsistema de Cloud Functions del portal + Function `onWrite(propiedades)` = **rebuild TOTAL idempotente** (query Admin publicadas + `limit(2000)`) + **debounce** + purga `catalogo:{shard}` + seed vacío + reconciliación (scheduled + botón "Republicar" en gestion) + retries — con los gates G3/G6/GATE-CRASH/GATE-CARRERA del §54.5 en el emulador. Deploy = COORDINADO con cutover (TODO-17). Luego: wiring SERP tras el flag demo|live. **→ el NÚCLEO de esa mitad ya está hecho en §57.**

## 57. ADR — §54 obra: núcleo del camino de ESCRITURA del catálogo (rebuild total idempotente, lógica pura) ⟦OPUS-5⟧ (2026-07-24)

**57.1 Contexto**: §56 dejó la LECTURA lista; la ESCRITURA se parte en (a) **la lógica que ARMA el índice** y (b) la plomería (subsistema de Functions + trigger + purga, gateada al cutover). Este ADR cierra (a) **como código PURO en el dominio, no dentro de la Function** — decisión deliberada: así es testeable sin emulador, el CONTRATO tiene un solo dueño (`domain/catalogo.ts`), y la Function queda como cascarón delgado (leer→llamar→escribir).
**57.2 Solución estructural**: `construirIndices(propiedades, actualizado)` = **REBUILD TOTAL** de los 3 shards (§54.4 cond.1: patch incremental PROHIBIDO — el escéptico del comité lo marcó BLOCKER por lost-updates y drift permanente). **DETERMINISTA**: ordena por `pub` desc con desempate por `id` asc ⇒ mismo conjunto → **mismo doc byte-a-byte** sin importar el orden de entrada, que es lo que hace que dos rebuilds concurrentes CONVERJAN (idempotencia real, no declarada). Los **3 shards SIEMPRE existen** aunque vacíos (despublicar el último escribe `items:[]`, NO borra — estado-cero cond.2). `propiedadAResumen()` mapea al contrato del comité (**titulo+slug obligatorios** — la refutación a Gemini §54.8 —, `coords` nullable = card sí/pin no, thumb R2, badges SOLO de flags reales del dominio: `verificadoAltorra`/`featured`). `esPublicada()` espeja la whitelist de las Rules (borrador/inactivo JAMÁS entran, anti-oráculo). **Decisión de diseño propia**: una publicada que NO puede pintar card honesta (sin precio/imagen/título) se **OMITE *y se REPORTA*** con motivo (`OmitidaCatalogo`) — nunca desaparece en silencio ni se rellena con dato inventado (L-29); la plomería (b) logueará esos motivos como señal de calidad de datos.
**57.3 No-regresión**: aditivo puro (nuevas funciones exportadas + tests); `CatalogoResumen`/`CatalogoIndice`/`catalogoVacio()` de §56 INTACTOS → el camino de lectura no cambia. Nada se despliega (el SERP sigue en DEMO). Sin cache bump.
**57.4 Verificación**: **vitest 42/42** (+9: filtro de publicadas · sharding por operación · precio de display por operación —arriendo=canon, no administración— · coords null · omisiones REPORTADAS con motivo · estado-cero 3 shards vacíos · **DETERMINISMO probado con input desordenado → `JSON.stringify` idéntico**) · `astro check` **0 errores** · `verify:data` 34 · `build` ✓.
**57.5 Anti-patterns evitados**: NO lógica de negocio dentro de la Cloud Function (intestable sin emulador) · NO patch incremental · NO borrar el doc al quedar vacío · NO inventar badges/campos para "completar" la card (L-29) · NO silenciar datos malos.
**57.6 Archivos**: MODIF `portal/src/lib/domain/catalogo.ts` (+construirIndices/propiedadAResumen/esPublicada/precioDisplay/ESTADOS_PUBLICADOS). NUEVO `portal/src/lib/domain/catalogo.test.ts`. INTACTOS: capa de datos, rules, SERP, mapa. Commit `0a2a8d0`.
**57.7 Doctrina + SIGUIENTE**: §3.7 · §G.4 · L-29 (contra el dato inventado). **Falta la PLOMERÍA (b)**: crear el subsistema `portal/functions/` (el portal aún no tiene Functions; las legacy viven en la raíz) → `onWrite(propiedades/{id})` con debounce ~5min (patrón `onPropertyChange` legacy) → query Admin `estado in publicados` + `limit(2000)` → `construirIndices` → escribir los 3 docs con `_version+1` en transacción → purgar `catalogo:{shard}` → seed inicial + scheduled diario de reconciliación + botón "Republicar catálogo" en gestion + retries. Gates G3/G6/GATE-CRASH/GATE-CARRERA (§54.5) en emulador. **Deploy = COORDINADO con el cutover** (TODO-17).

## 58. ADR — §54 obra: PLOMERÍA del catálogo — Cloud Functions del portal (codebase aislado) + gates en emulador ⟦OPUS-5⟧ (2026-07-24)

**58.1 Contexto**: §57 dejó el NÚCLEO (qué entra al índice); faltaba la plomería (quién lo dispara y lo escribe). El portal NO tenía subsistema de Functions (las 7 legacy viven en `functions/` de la raíz, JS gen2 v6). **Decisión estructural**: crear `portal/functions/` como **CODEBASE APARTE** (`codebase: "portal"` en `portal/firebase/firebase.json`) — el `firebase.json` raíz ya usaba el formato de array de codebases, así que es el mecanismo NATIVO: deploy independiente (`--only functions:portal`), cero riesgo de tocar las legacy, y el portal sigue autocontenido. TS→CommonJS Node 20, misma API v6 gen2 que el legacy (verificado leyendo su `index.js`, no de memoria). **Reúso sin duplicar**: `tsconfig` con `rootDir: ".."` compila también `src/lib/domain/` ⇒ la Function usa la MISMA `construirIndices` ya probada (§57) y el contrato tiene UN dueño; `catalogo.ts` solo tiene imports de TIPO ⇒ su JS emitido no arrastra dependencias (verificado en el emitido).
**58.2 Solución estructural**: (a) `catalogo-rebuild.ts` **separado de los triggers** (importar `index.ts` en un test registraría Functions reales) → `rebuildCatalogo(db, motivo)`: query publicadas + `limit(2000)` FUERA de la transacción (2K docs dentro es inviable) → `construirIndices` → transacción sobre los 3 docs con `_version+1`, `set` SIN merge (el doc ES el índice completo). **🎯 Guarda ANTI-ADELANTAMIENTO (hallazgo propio, → L-35)**: si el doc ya tiene `actualizado` MÁS NUEVO que el `snapshotAt` de este rebuild, **NO se escribe** — la idempotencia sola NO cubre dos rebuilds concurrentes, porque cada uno leyó un snapshot distinto y el que arrancó ANTES puede aterrizar DESPUÉS con datos viejos. Normaliza `Timestamp|string→ISO` (L-17: el Admin SDK escribe Timestamp, el seed escribe string). Reporta `omitidas` y avisa a 700KB/shard (tripwire operativo del §54.4). (b) **Triggers**: `onWrite(propiedades)` con `retry:true` (SEGURO por idempotente) · **barrido cada 5 min** · callable **"Republicar catálogo"** (solo staff, palanca humana cond.5). **MEJORA deliberada sobre el debounce del legacy**: un debounce clásico DESCARTA la última edición si nadie más edita — aquí la edición dentro de la ventana marca `pending` y el barrido la ejecuta ⇒ edición normal = instantánea, import masivo = coalescido, **nada queda sin reflejar**; y el MISMO job hace de reconciliador diario (Cloud Scheduler free = 3 jobs: se usa UNO). Control en `indices/_control` — dentro de `indices/` pero FUERA de la allow-list de las Rules ⇒ privado por diseño, sin regla nueva.
**58.3 No-regresión**: las 7 Functions legacy INTACTAS (codebase separado; su `firebase.json` raíz no se tocó). Nada desplegado (deploy = cutover, TODO-17). El SERP sigue en DEMO. `functions/lib` gitignored + excluido del `tsconfig` del portal (evita drift fuente↔compilado y ruido en el gate).
**58.4 Verificación**: **+7 tests contra el EMULADOR con el Admin SDK REAL** (el mismo código que correrá en producción, no un doble), con **projectId propio** (L-21: `rules.test.ts` hace `clearFirestore()` y habría arrasado la semilla): estado-cero (3 shards existen con `items:[]`) · anti-oráculo (borrador/inactivo jamás) · omitidas REPORTADAS · **GATE-CRASH** idempotencia (2 rebuilds → contenido idéntico, `_version` sube ⇒ retry seguro) · **GATE-CARRERA** (rebuild viejo NO pisa al nuevo; el reporte lo marca `escrito:false`) · colapso al despublicar el último · `Timestamp→ISO`. **Emulador 33/33** · vitest 42/42 · `astro check` **0 errores 0 warnings** · `verify:data` 34 · `build` ✓ · `tsc` de functions ✓ con `main` verificado en el emitido.
**58.5 Anti-patterns evitados**: NO meter las functions del portal en el codebase legacy (deploy acoplado) · NO duplicar la lógica del índice en la Function · NO debounce que descarta ediciones · NO 2 jobs de Scheduler (free tier escaso) · NO tests contra un doble del SDK (se usó el Admin real) · NO commitear el compilado.
**58.6 Archivos**: NUEVOS `portal/functions/{package.json,tsconfig.json,src/index.ts,src/catalogo-rebuild.ts}` · `portal/firebase/tests/catalogo-rebuild.test.ts`. MODIF `portal/firebase/firebase.json` (codebase+emulador functions) · `portal/{tsconfig.json,.gitignore,package.json}` (+firebase-admin devDep para el test). INTACTOS: legacy, capa de datos, rules, SERP, mapa. Commit `c2f1362`.
**58.7 Doctrina + SIGUIENTE**: §3.3 (API leída del legacy real) · L-17/L-21 aplicadas · §G.4. **Falta para que el portal muestre datos REALES**: (1) wiring del SERP a `/api/catalogo/*.json` tras el flag `PUBLIC_CATALOGO_SOURCE=demo|live` · (2) endpoint de purga HMAC (hoy la frescura la da el TTL de 10 min, §54.8) · (3) botón "Republicar" en `gestion` · (4) **deploy COORDINADO en el cutover** (rules + functions:portal) — hasta entonces todo verificado en emulador.

## 59. ADR — §54 obra: isla del catálogo REAL en el SERP tras flag `demo|live` (el cutover = flip de flag) ⟦OPUS-5⟧ (2026-07-24)

**59.1 Contexto**: con la lectura (§56), el núcleo (§57) y la plomería (§58) listos, faltaba que el SERP CONSUMIERA el índice. Requisito del stack sellado (R5): **shell prerenderizado + isla JSON** (los filtros son client-side sobre ese JSON) — así que las cards reales se pintan en el cliente, no en SSR.
**59.2 Solución estructural**: isla `src/scripts/serp-catalogo.ts`, cargada por `import()` dinámico. **Con `PUBLIC_CATALOGO_SOURCE=demo` (default) es un NO-OP absoluto** ⇒ el SERP sigue idéntico (cero regresión, verificada); en `live` pide `/api/catalogo/{op}.json` y sustituye cards + pines. **El cutover es un FLIP DE FLAG, no un cambio de código** (§54.4 cond.6). **🎯 Markup con UN dueño**: la card NO se re-escribe en JS — se **CLONA de un `<template>` que renderiza el propio `PropertyCard.astro`** (con todas las partes opcionales presentes; la isla elimina las que no apliquen) ⇒ imposible que el HTML de la isla divierja del componente (L-29). `altorra-map.ts` expone **`setMarkers()`** (estado por contenedor en `WeakMap`) para reemplazar los pines al llegar el catálogo, y los pines esquemáticos del shell se retiran en live. El **hover card↔pin pasa a DELEGACIÓN** en el grid: los listeners por-card se perdían con el re-render. Estados HONESTOS en paleta sellada (`role="status"`): vacío ("Aún no hay propiedades publicadas") y error; **"Cargar más" se retira en live** (la paginación no existe: no se promete lo que no hay). Precio COP formateado (card completa · pin compacto `$1.450M`/`$8,5M/mes`/`$400K/noche`); specs ausentes se ELIMINAN (no se inventan ceros); **sin coords ⇒ card SÍ, pin NO** (contrato §57).
**59.3 No-regresión**: modo demo VERIFICADO intacto (4 cards demo, "128 propiedades", "Cargar más", hover OK). Ficha/home/mapa/capa de datos/functions INTACTOS. Nada desplegado en live (el flag no se ha activado en ningún entorno). Sin cache bump.
**59.4 Verificación EN VIVO (con fixture temporal, borrado tras la prueba)**: 3 cards reales · precios `$1.450.000.000` · `href=/ficha?id=INM-…` · **2 marcadores para 3 cards** (el ítem sin coords no genera pin) · pines demo retirados (0) · **hover ilumina el pin correcto TRAS el re-render** (la delegación funciona) · estado vacío correcto (0 cards, contador 0, mensaje accesible) · sin errores de consola. Gates: `astro check` **0 errores 0 warnings** · `build` ✓ · vitest 42/42 · `verify:data` 35.
**59.5 🐞 BUG cazado por la verificación (no por los gates) → L-36**: el `<template>` NO trae nodo de texto en el precio (el placeholder es `""`), así que `insertBefore(txt, sfx)` con el sufijo **ya eliminado** lanzaba `NotFoundError` y **abortaba el render dejando el DEMO en pantalla, sin señal visible** (el contador SÍ se había actualizado a 3: la página quedó INCOHERENTE — 4 cards demo bajo un "3 propiedades"). Fix: reconstrucción DETERMINISTA del precio (insertar ANTES de eliminar) + `try/catch` POR CARD (una card mala ya no tumba el listado) + estado de error si nada se pudo construir. **Gotcha hermano**: usar `appendChild` y NO `append` — los tipos de Cloudflare Workers fusionan `Element.append(string)` (HTMLRewriter) con el `Element` del DOM y matan la sobrecarga con `Node`.
**59.6 Archivos**: NUEVO `portal/src/scripts/serp-catalogo.ts`. MODIF `portal/src/scripts/altorra-map.ts` (+`setMarkers`, estado en WeakMap) · `portal/src/pages/[operacion].astro` (`data-serp`, `<template>`, delegación del hover, estilos `.serp-msg`, boot de la isla) · `portal/src/env.d.ts` (3 vars nuevas). Commit `d4b8a65`.
**59.7 Doctrina + SIGUIENTE**: L-29 (markup con un dueño; no inventar datos) · §3.3 (leí el DOM real del template en vez de suponerlo) · §G.4 (caza-bugs en el camino vivo). **Para que el visitante VEA datos reales falta SOLO**: (1) **deploy COORDINADO en el cutover** (rules + `functions:portal`) · (2) poner `PUBLIC_CATALOGO_SOURCE=live` · (3) sembrar propiedades reales. Opcionales de calidad: endpoint de purga HMAC (hoy la frescura la da el TTL de 10 min), botón "Republicar" en `gestion`, ficha dinámica por `id`/slug (hoy `/ficha` es la demo), paginación.

## 60. ADR — Hallazgo: la FICHA pide datos que el modelo NO tiene (2 con filo legal) + frontera pre-cutover del catálogo ⟦OPUS-5⟧ (2026-07-24)

**60.1 Causa raíz / disparador**: tras §59 las cards reales enlazan a la ficha, así que tocaba hacerla dinámica. Al inventariar `ficha.astro` (el diseño SELLADO §26/§43) **campo por campo contra `Propiedad`** (§3.3, no de memoria) aparece un desajuste que nadie había notado: **4 bloques del diseño no tienen fuente de datos**, y rellenarlos con los valores del demo en una propiedad REAL sería exactamente L-29 (contenido inventado que se ve legítimo).
**60.2 Inventario (evidencia)**. ✅ **CON dato real** (≈75% de la página): breadcrumb/eyebrow (`geo.barrio`) · galería y conteo (`imagenes[]`) · badge (`operacion`) · título · descripción · specs (hab/baños/m²/parqueaderos/estrato/antigüedad) · precio + $/m² + administración (`precio.*`) · ficha técnica · mapa y pin (`geo.lat/lng`) · CTA WhatsApp (`SITE`) · similares (vía `/api/catalogo`). ⛔ **SIN fuente**: (a) **dirección exacta** ("Carrera 5 · …") — **PROHIBIDA por diseño** en el doc público (PII/seguridad; vive en `captaciones`, §20/OD3) ⇒ jamás se rellena, se muestra barrio+ciudad; (b) **financiación** ("Desde $7.9M/mes") — no modelada **y es una AFIRMACIÓN FINANCIERA** sobre un crédito ⇒ carril legal (42-LEGAL), no se improvisa; (c) **asesor nombrado** ("María Restrepo · Zona Norte") — no existe en el modelo (¿campo nuevo? ¿asignación por zona? decisión de producto); (d) **POIs con minutos** — no modelados (requieren fuente de tiempos; una API de rutas es costo recurrente).
**60.3 Decisión**: **NO construir la ficha dinámica en esta sesión.** Las 4 casillas obligan decisiones de MODELO DE DATOS y dos de ellas tocan legal/seguridad — improvisarlas al final de una sesión larga sería el anti-patrón que §3.7 existe para evitar. Se deja ESPECIFICADA con las opciones por bloque: (a) omitir siempre · (b) omitir hasta que legal defina el disclaimer, o bloque genérico sin cifra · (c) `asesorId` en el modelo + colección `asesores`, o bloque genérico "Equipo ALTORRA" con el WhatsApp REAL (honesto) · (d) omitir en v1 (los POIs del demo son ilustrativos). **Regla dura**: en modo real, un bloque sin dato se OMITE — nunca se hereda el valor del demo.
**60.4 Frontera pre-cutover VERIFICADA (por qué se para aquí, no por falta de tiempo)**: los 4 pendientes restantes del catálogo están bloqueados por causas DISTINTAS y comprobadas: ficha dinámica → §60.2/.3 (datos+legal) · **botón "Republicar" en `gestion` → el panel NO tiene auth cableada** (`grep` de `getAuth|onAuthStateChanged|signIn` = **0**) y la callable exige claim `admin` · **purga HMAC → requiere un SECRETO de Cloudflare** (credenciales del dueño, protocolo Fincaraíz) · deploy → decisión de CUTOVER de Daniel. ⇒ El código del catálogo (§56-§59) está **COMPLETO hasta donde es construible y verificable hoy**; añadir más sería escribir código que no se puede probar.
**60.5 No-regresión**: cero cambios de código en este ADR (es un hallazgo + decisión). El enlace de las cards (`/ficha?id=…`) se DEJA: es forward-compatible y hoy lleva a la ficha demo — documentado aquí para que no se lea como bug.
**60.6 Archivos**: solo cerebro (`99`+§60, `00`, `10`). **60.7 Doctrina**: §3.3 (inventario contra el código, no de memoria) · L-29 (omitir > inventar) · §3.7 (lo caro de revertir no se improvisa) · "nunca dinero sin gate".

## 61. ADR — PIVOTE DE MISIÓN: Fundación Operativa de la inmobiliaria completa (arco TODO-34) + inventario del corpus real ⟦FABLE-5⟧ (2026-07-24)

**61.1 Mandato (Daniel, literal en esencia)**: aún no hay propiedades que subir, pero la ayuda debe pasar de *construir el portal* a **armar LA INMOBILIARIA con datos reales**: captación, atención de clientes, documentos por etapa, cierre legal hasta notaría (venta), vinculación de inquilino (arriendo), corta estancia (hoy CERO), equipo/delegación/capacitaciones — "Claude = mi abogado y todos los empleados a la vez"; **cerebro dual** (Claude Code + Claude Chat); "no te limites — libre albedrío para decidir, investigar y organizar". Se suma a [[reglas-operacion-daniel]] (docs del dueño traen ERRORES: son verdad de DOMINIO, no verdad PRO).
**61.2 Inventario del corpus (verificado HOY, §3.3 — corrige el propio diagnóstico de Daniel)**: en `Downloads/ALTORRA Company (Legal)/` hay **83 documentos de la inmobiliaria** (30 docx · 44 pdf · 9 xlsx, excluyendo Cars) + volcado `all_docx_content.txt` (675K pre-extraído) + espejo en Google Drive (conector MCP disponible: `search_files`/`read_file_content`; fallback = carpeta local). Estructura: **Contratos y Otrosíes** (arrendamiento actualizado · 2 contratos de administración FIRMADOS · modelo administración · otrosí) · **Fichas e Inventarios** (FTI-01 + formatos de inventario) · **Inspecciones y Evidencias** (informes reales) · **⭐ Liquidaciones y Pagos** — prueba de **OPERACIÓN VIVA**: liquidaciones mensuales reales de 2 inmuebles administrados (aptos 612 y 1721, Milán/Parque Heredia) con comprobantes · **MAESTRO** (Sistema Operativo Integral + Protocolo Maestro + Capacitación de leads) · **Operación** (scripts WhatsApp v4 · guía comercial v3 · tarifarios 2026 · glosario) · **Estatutos** ALTORRA COMPANY S.A.S. **Hallazgo**: "no tengo casi nada" es FALSO — hay negocio operando; los **GAPS reales**: corta estancia (0 docs) · cierre venta→notaría · vinculación de inquilino (estudio/garantías, Ley 820) · contable/financiero formal.
**61.3 Decisión**: arco nuevo **TODO-34 (FRENTE 0)** con plan F1-F4 (fila en `10`): F1 ingesta+triaje del corpus → F2 investigación web + consejo externo (`15 §0b`) → F3 neurogénesis (lóbulo OPERACIÓN + skills financiero/legal/contable/administración/arriendos larga-corta + diseño del **cerebro dual Code+Chat**) → F4 producción de entregables reales (manuales, contratos faltantes, checklists, capacitaciones). Se ejecuta en **SESIÓN FRESCA** (mandato explícito: "documenta y cerremos") — este cierre ES el relevo curado.
**61.4 Gates vinculantes del arco**: legal = best-effort con fuentes `.gov.co` fechadas (sin abogado; Claude redacta, Daniel decide — [[altorra-abogado-y-legal]]) · L-29 (nada inventado: todo con fuente o marcado DRAFT) · L-30 (hechos caducables con fecha) · triaje obligatorio de los docs del dueño (real vs genérico vs error) · dinero/legal/go-no-go = Daniel. **61.5-61.6**: sin código tocado; cerebro `99`+`00`+`10`+memoria. **61.7 Doctrina**: §G.4 (relevo curado > contexto saturado) · §3.3 (inventario contra el filesystem real).
**61.8 Adenda (mismo día, verificada)**: Daniel volcó el Drive a la carpeta local → **corpus CONSOLIDADO 100% LOCAL: 143 archivos** (45 docx · 47 pdf · 13 xlsx · 3 doc · 2 xls · 3 txt, sin Cars). Carpetas NUEVAS respecto al inventario de 61.2: **`RUT y Cámara de Comercio/` (Cámara ACTUALIZADA 09-06-2026)** · **`Representante Legal/`** · **`ALTORRA COMPANY SAS/DOCUMENTOS LEGALES/`** · `Branding y Membretes/` + `Membretes y Gantt/` · `EVIDENCIA ALTORRA I 612/`. ⇒ La identidad legal COMPLETA de la empresa (RUT + Cámara + estatutos + representante) está en el corpus — insumo directo para contratos/membretes PRO en F4. **El conector de Drive queda INNECESARIO para F1.**

**⟦Nota de gobernanza (2026-07-24)⟧**: desde el ADR §57 el rol de IMPLEMENTADOR lo ejerce **Opus 5** (Daniel: "todo lo que era Opus 4.8 ahora pasa a ser implementado por Opus 5"). El rol se define por la POSICIÓN (el Opus vigente), no por un número congelado. Los ADRs ⟦OPUS-4.8⟧ previos **NO se reescriben**: son la historia real de quién los hizo.

## 62. ADR — TODO-34 F1: triaje del corpus fundacional (143 archivos) + nace el lóbulo OPERACIÓN ⟦FABLE-5⟧ (2026-07-24)

**62.1 Causa raíz**: el arco Fundación Operativa (§61) exigía F1 = ingesta+triaje ANTES de investigar o producir (L-29: nada inventado). El corpus era ilegible a máquina en un 40%: 16 docx nunca extraídos (todo el paquete compliance), 3 .doc antiguos, 13 libros Excel.
**62.2 Solución estructural**: (a) textualización total — Word COM para 9 docx + extracción ZIP de `word/document.xml` para los 7 que Word rechaza + Excel COM→CSV (19 hojas); único ilegible: `ALTORRA_LIMPIO_FINAL.xlsx` (corrupto). (b) Workflow `wf_5acd4002` — 9 lectores en paralelo por dominio con salida estructurada (estado/canónica/datos/errores/gaps), 1.89M tokens, 162 lecturas, 9/9 OK. (c) Neurogénesis: **`docs/43-OPERACION.md`** (lóbulo hijo, sin PII — repo público) + bóveda ×4 (CRUDO 322K, DIGEST 176K, censo, SÍNTESIS curada con dictámenes y callejones).
**62.3 No-regresión**: cero código tocado; solo cerebro (43 nuevo, 40 registry, 99, 00, 10) + bóveda.
**62.4 Verificación**: corpus contado contra filesystem (143 = 578 − 435 Cars, cuadra con §61.8); identidad legal leída de los certificados reales (no de los manuales); los 6 hallazgos estructurales citan documento fuente.
**62.5 Hallazgos que gobiernan el arco** (detalle → 43 + bóveda SINTESIS): doble identidad societaria (contratos vivos en ALTORRA S.A.S. NIT 901.976.611-7 vs la real ALTORRA COMPANY S.A.S. 902.063.965-4) · matrícula de arrendador SIN resolución en el corpus (solo subsanación; Daniel la declaró obtenida 07-18 → pedir el acto) · la Alcaldía rechazó el modelo "digital sin local" · gerente sin mayoría accionaria (estructural = multi-socio) · formularios KYC autorizan a FONPRECON (inservibles) y la Política de Tratamiento de Datos NO existe (gate #1 del portal) · tarifario inmobiliario inexistente (scripts con `[%]`) · cifras en guerra entre docs vigentes · corta estancia con CERO marco pese a operar (anticipos Nequi sin recibo).
**62.6 Archivos**: NUEVOS `docs/43-OPERACION.md` + 4 en bóveda; MODIFICADOS `docs/40/99/00/10`; INTACTOS todo lo demás.
**62.7 Doctrina**: §G.4 (crudo+síntesis ANTES de cerrar; bóveda commiteada en el mismo cierre) · §3.3 (identidad legal desde certificados, no manuales) · L-29 (los manuales del dueño = verdad de dominio, no verdad PRO — cada error marcado "verificar F2"). Callejón capturado: hashtable de PowerShell NO preserva orden → 7 txt con nombres cruzados (el lector triajeó por CONTENIDO; F4 re-extrae con mapeo verificado). Sin cache bump (§4 no aplica).

## 63. ADR — TODO-34 F2: verificación legal operativa (6 frentes .gov.co) + consejo externo integrado → F4 reordenado por riesgo ⟦FABLE-5⟧ (2026-07-24)

**63.1 Causa raíz**: el triaje F1 dejó ~20 prácticas/cláusulas del dueño marcadas "verificar contra fuente oficial" (L-29) y el plan F4 necesitaba orden defendible; sin verificación, los manuales heredarían los errores del corpus.
**63.2 Solución**: (a) **F2a** workflow `wf_a1e9f3fc` — 6 investigadores (Ley 820 operativa · venta→notaría · tributario-contable · LA/FT+contacto comercial · civil-mercantil · hospedaje), 45+ claims con norma exacta, cita verbatim y URL oficial, 1.04M tok, 277 lecturas web; no_verificados honestos → agenda del abogado. (b) **F2b** consejo externo (Gemini 3.1 Pro High vía Antigravity, corrido por Daniel) integrado como peer-review: ADOPTADO el reorden tesorería-primero + Protocolo de Caja + acuerdo de accionistas + blind spot Cars-misma-sociedad; REFUTADO diferir compliance de datos (obligación sin umbral + gate del portal) y su "cesión imposible" (C.Co 887 ss. la permite CON aceptación del cedido); su cita SAGRILAFT nació derogada (ver 63.4).
**63.3 No-regresión**: solo cerebro (43 §Marco-legal nuevo + §Estado, 42 agenda #4, 99, 00, 10) + bóveda ×3.
**63.4 Hallazgos capitales**: 🔴 **RUB vence ~jul-2026** (2 meses desde el RUT de may-2026, Res. 164/2021 §10; sanción E.T. 658-3) → acción YA · 🔴 **CE 100-000016 (SAGRILAFT) DEROGADA el 2-jul-2026** por CE 100-000020 (Cap. IX, umbrales UVB) — ALTORRA NO obligada, pero su Habeas Data autodeclara cumplimiento de un régimen inexistente · 5 prácticas ILEGALES (depósito en vivienda · preaviso 2 meses · renuncia a reclamación · cláusulas probatorias FII-000 "por no escritas" CGP 13 · corta estancia sin RNT = cierre inmediato) · esquema canon-neto LEGAL con 4 formalidades de mandato (D.1625 §1.6.1.4.9) — la espina dorsal del Protocolo de Tesorería · retención en venta con tarifa VOLÁTIL 2026 (D.572/2025 suspendido y revivido).
**63.5 Anti-patterns**: monocultivo evitado (el externo citó norma derogada — la verificación multi-fuente lo cazó); ninguna cifra de Gemini entró sin cruzar contra .gov.co (15 §3).
**63.6 Archivos**: MODIFICADOS `docs/43/42/99/00/10`; bóveda NUEVOS `f2-verificacion-legal-CRUDO.json` + `gemini-fundacion-{CRUDO,INTEGRACION}.md`; INTACTO todo el código.
**63.7 Doctrina**: L-29 (cero afirmaciones sin fuente leída) · L-30 (hechos caducables fechados: D.572/2025, CE 100-000020, UVB) · 15 §2.4 (el externo asesora, Fable delibera). Sin cache bump.
**63.8 Adenda (mismo día, Daniel)**: **NO quedan contratos vigentes** — todos los arrendamientos/administraciones finalizaron; COMPANY arranca de CERO y las plantillas canónicas son las de última actualización del Drive (= CONSOLIDADO, confirma el dictamen F1). ⇒ Se EVAPORA la migración de contratos vivos (el #2 "refirma/cesión" del reorden original); el pasado se cierra documentalmente bajo la SAS vieja y el **KIT DE ARRANQUE (contrato canónico limpio + tarifario + umbrales) sube a #2** — es el gate para firmar el próximo cliente. **F4 final**: #0 RUB-YA + tesorería → #1 factura/IVA → #2 kit de arranque → #3 matrícula → #4 societario liviano (acuerdo accionistas + destino SAS vieja) → #5 datos → #6 corta estancia.

## 64. ADR — TODO-34 F4 wave 1: KIT FUNDACIONAL completo (14 documentos redactados, auditados, corregidos y en Word) ⟦FABLE-5⟧ (2026-07-25)

**64.1 Causa raíz**: con F1+F2 cerrados y las decisiones de Daniel selladas (tarifario 10%+IVA cargo integral · venta 3% · colocación 1/2/3 · umbrales 2×/2× · corta estancia SE FORMALIZA — mandato "hagamos todo lo que falte, yo no sé nada de esto"), el negocio no podía firmar NADA: sin tarifario, sin contratos limpios, sin política de datos, sin marco de hospedaje.
**64.2 Solución**: workflow `wf_c571fccf` (15 agentes, 2.38M tok): **10 redactores** escribieron 14 documentos directo a la bóveda (`entregables-fundacion/`) con brief duro (identidad única COMPANY · tarifas selladas · prohibiciones F2 · placeholders ⟦⟧ · NOTA-para-Daniel por doc) → **5 auditores adversariales** contra `43 §Marco legal` + CRUDO F2: 5× APROBADO-CON-AJUSTES, **37 hallazgos (1 ALTA: el tarifario publicitaba corta estancia sin RNT · 11 MEDIA · 25 BAJA), todos con FIX exacto** → agente aplicador ejecutó los 37 (0 fallos) → conversión a Word (npx marked → HTML → Word COM, 14/14 en `docx/`) → índice `00-LEEME.md` (orden de uso + 4 acciones inmediatas + 7 decisiones pendientes).
**64.3 No-regresión**: cero código; entregables viven en brain-private (PRIVADO — contratos y datos de negocio jamás al repo público).
**64.4 Verificación**: cada documento auditado contra los veredictos F2 con cita; los auditores confirmaron: cero depósitos · preavisos 3 meses · probatorias sanas (sin 48h/irrefragable) · restitución solo judicial · 4 formalidades del mandato en el 03 · contenido mínimo §3 en el 04 · retracto prevalece en el 11 · identidad limpia en los 14 (cero 323/gmail/NIT viejo).
**64.5 Anti-patterns evitados**: sobre-promesa cazada por el auditor (factura del anticipo de hospedaje afirmada cuando F2 la dejó sin verificar → degradada a ⟦PENDIENTE contador⟧); citas fuera del marco F2 (D.1981/1988, Formato 2687, rutas Siigo/DIAN) marcadas ⟦VERIFICAR⟧ en vez de afirmadas; base legal sobredimensionada corregida (honorarios-solo-propietario = política de casa, NO imperativo del art. 16).
**64.6 Archivos**: bóveda NUEVOS `entregables-fundacion/` (00-14 + docx/) + `2026-07-25-f4-wave1-kit-CRUDO.json`; repo: 99/00/10.
**64.7 Doctrina**: L-29 aplicada por 3 capas (brief→auditor→aplicador) · §G.4 crudo+kit commiteados y pusheados en el cierre · el patrón redactor→auditor-adversarial→aplicador con FIX-exacto queda probado para producción documental. **Restos del arco**: ejecución de Daniel (RUB · Siigo · cuenta escudo · resolución matrícula · OKs del LEEME) · % comercial · skills F3 (cuando el kit se use en la práctica) · cerebro dual Code+Chat (diseño pendiente). Sin cache bump.

## 65. ADR — TODO-34 F4 wave 2: MANUAL MAESTRO (10 caps) + investigación de mercado → sistema documental 00-23 COMPLETO ⟦FABLE-5⟧ (2026-07-25)

**65.1 Causa raíz**: Daniel devolvió TODAS las decisiones con mandato explícito ("no sé absolutamente nada... todo basado en investigación real, tuya y del consejo externo... el documento maestro completo con todos los procesos sin saltarse nada") + 2 correcciones de estado (RUB YA reportado · la FE/Siigo 2025 era de la SAS VIEJA → COMPANY sin habilitación = gate del primer cobro).
**65.2 Solución — dos workflows en paralelo**: (a) **wave 2a mercado** (`wf_3dacbdb0`, 6 frentes, 140 consultas): tarifas comerciales con costumbre mercantil CERTIFICADA (CC Cali/CCB/Medellín) + tarifarios publicados → **adoptadas** (admin comercial 10%+IVA banda-8 · colocación 1 canon · venta 3% · derechos de contrato 50% canon al arrendatario comercial) · ACM GRATIS (práctica universal) · escala de cancelación DUAL estacional · ⭐ **el facturador gratuito DIAN soporta MANDATO nativo (fuente oficial)** → FE de COMPANY a $0 esta semana · benchmark 7+2 competidores Cartagena (solo 1 publica tarifas, NINGUNA exhibe RNT → transparencia = diferenciador) → doc `22-RECOMENDACIONES-MERCADO` + tarifario 01 completado. (b) **wave 2b manual** (`wf_412f5520`, 7 redactores + 3 auditores, 2.33M tok): 10 capítulos (355KB — gobierno·comercial·arriendo·venta·estancias·marketing·PQRS·legal·finanzas) + anexos 16-21 (liquidación·acta·solicitud·carta-intención·checklist-notaría·PQRS); auditores legal/completitud/usabilidad → 45 hallazgos (5 ALTA) → aplicador 43/45 + 3 resoluciones del orquestador (escala dual propagada → doc 11 V2 · doc 23 stub pagaré-encargo-abogado · sincronía comercial) + exclusividad resuelta con fuente del corpus (venta 90 días=CIC-01 · arriendo 60) → ensamblado `15-MANUAL-MAESTRO-ALTORRA.md` + 12 docx.
**65.3 No-regresión**: cero código; todo en brain-private.
**65.4 Verificación**: cada tarifa adoptada con fuente citada (gremial/competidor); el auditor de completitud validó contra el mandato "sin saltarse nada" y contra DOCUMENTOS FALTANTES del corpus; sincronías cross-doc cazadas y cerradas (doc 22 vs 11; tarifario vs caps).
**65.5 Anti-patterns**: cifras de mercado sin fuente → NO adoptadas (cliente misterioso listado) · "garantizamos el pago" y renta-garantizada-con-caja-propia = PROHIBIDOS por regla de marca (anti-modelo Coninsa) · el manual DELEGA en el kit (auditor de usabilidad cazó duplicaciones).
**65.6 Archivos**: bóveda — `15-MANUAL...` + fragmentos + 16-23 + 22 + docx ×12 + CRUDOs 2a/2b + prompt consejo-externo-manual; repo — 99/00/10/43.
**65.7 Doctrina**: delegación total de Daniel operada como "recomendación-con-fuente ADOPTADA y vetable" (dinero/legal sigue siendo suyo: veta, no decide a ciegas) · L-30 (Airbnb reestructuró oct-2025; precios Siigo = comparador). **Restos del arco TODO-34**: Daniel ejecuta LEEME (FE-DIAN · cuenta escudo · cotizaciones póliza · acuse RUB · resolución matrícula al final) + corre el consejo externo del manual (prompt listo) · abogado (doc 23 + agenda cap 8 §8.4) · skills F3 cuando el sistema ruede · cerebro dual Code+Chat. Sin cache bump.

## 66. ADR — TODO-34: blindaje de los contratos 03 y 04 (pagaré retirado · figura de firma en nombre propio · comité ×6 + consejo externo ×2) ⟦OPUS-5⟧ (2026-07-28)

> Daniel: *"los contratos de ALTORRA deben ser altamente blindados para proteger a la compañía y proteger la propiedad
> de nuestro cliente… que el inquilino no la tenga fácil"* · *"el abogado mío eres tú"* · *"toma tú las decisiones"*.

**66.1 Causa raíz.** El kit fundacional (§64-§65) nació del corpus heredado y arrastraba supuestos nunca confirmados
con el dueño ni contrastados con la operación real: exigía **pagaré** en todo arriendo, no tenía cláusula de **póliza**
pese a que la garantía real es un seguro, pactaba la prima **anual** cuando El Libertador la cobra **mensual**, y dejaba
la figura de firma ambigua (comparecencia vs. bloque de firmas). Además, el método de trabajo parqueaba las preguntas
legales en un "gate de abogado" que no existe.

**66.2 Solución estructural.** (a) **Pagaré RETIRADO** del kit (decisión de Daniel): la garantía es la **póliza** y,
sin ella, **codeudor solidario**; el título de cobro es el propio contrato (mérito ejecutivo). Barrido en 11 piezas; la
cláusula DÉCIMA SEGUNDA del 04 pasó de pagaré a **PÓLIZA DE ARRENDAMIENTO** —vacío que el contrato tenía—; doc 23
conservado con banner de retiro (§G.4). (b) **Figura de firma: ALTORRA arrienda EN NOMBRE PROPIO** por cuenta del
propietario (C.Co. art. 1262) — decisión tomada por Claude bajo delegación expresa, revirtiendo la de representación
del 27-jul. Motivo: como representante no podía otorgar poder al abogado y cada demanda dependía de que el propietario
firmara y presentara personalmente el poder (**CGP art. 74**), con la aseguradora negando el siniestro por inacción.
Contrapartida asumida y compensada en el 03 (fondo de reserva · obligación de fondear reparaciones · indemnidad con
mérito ejecutivo). (c) **Dictámenes propios** en vez de "pendiente de abogado": art. 16 L820 (el pagaré es garantía
personal, no caución real) · art. 1617 reglas 3ª-4ª (los intereses sobre cánones son rubro EN RIESGO → van fuera del
capital) · art. 2149 C.C. (basta mandato escrito para firmar) · art. 74 CGP (la facultad de nombrar abogado sirve; le
falta la forma).

**66.3 No-regresión.** Numeración de cláusulas intacta (la DÉCIMA SEGUNDA se repurposó, no se eliminó, para no romper
las ~35 remisiones cruzadas que el lente de coherencia verificó una por una). Contratos regenerados a Word con el
membrete corporativo; kit copiado a la carpeta de trabajo de Daniel.

**66.4 Verificación.** **Dos rondas adversariales sobre el pagaré** (28 hallazgos → V3 → 26 más → V3.1/V3.2) y
**comité ×6 + consejo externo ×2 rondas sobre los contratos**: 6/6 CORREGIR, 136 hallazgos → **126 sobrevivientes**
(2 CRÍTICOS, 56 MAYORES, 68 menores), **1 sola** corrección con riesgo ALTO de nulidad y **14 descartadas con razón
escrita**. Normas leídas literalmente en fuente oficial esta sesión: C.C. 1600, 1617, 1634, 2149, 2189, 2194, 2195 ·
C.Co. 886 · CGP 74 · Ley 820 art. 16 · Ley 2157/2021 art. 13 par. 2.

**66.5 Anti-patterns evitados.** El consejo externo propuso una **retoma privada del inmueble con dos testigos** —vía
de hecho prohibida (Ley 820 + CGP 384)— y la concedió al ser refutada: evidencia dura de que un asesor externo puede
recomendar algo **ilegal con total seguridad**. El comité propuso bajar la pena de 3 a 2 cánones (regalaba un canon en
toda la cartera), reciprocidad de la pena (**válida, y por eso peligrosa**: se ejecutaría contra el propietario) y
varias **presunciones probatorias** que el art. 13 del CGP tiene por no escritas y que arrastran consigo el efecto
buscado. Todas descartadas con su porqué.

**66.6 Archivos.** Bóveda: `03`, `04`, `23` (retirado), `00-LEEME`, `02`, `18`, `17`, manual caps 00/02/03/08 + maestro,
`_plantilla/` (generador de Word con membrete real), `research-archive/2026-07-27-pagare-*` y `2026-07-28-consejo-*`.
Repo: `42-LEGAL` (dictámenes + instrumentos de cobro) · `43-OPERACION` (§documentos corporativos) · `32` (LD-01, LD-02) ·
`15` (consejo = 3 rondas) · skill `proceso-decision-fuerte` (§🥊 debate + 🪜 escalera del desacuerdo) · `10` · `99`/`00`.

**66.7 Doctrina.** **LD-01** (los defectos nuevos nacen de las correcciones → lente de regresión + refutación) ·
**LD-02** (confirmar que el mecanismo sigue vigente antes de construir el instrumento) · el consejo externo es un
**debate de 3 rondas** con criterio de cierre · la **escalera del desacuerdo persistente** (hecho → fuente; riesgo →
dueño; incertidumbre → posición conservadora declarada; diseño empatado → reversibilidad) · y la regla de entrega:
**lo que Daniel ejecuta va en el chat**, no en una carpeta.

## 67. ADR — TODO-34: consolidación del KIT COMPLETO (24 docs) · gate de emisión · comité R3 + consejo R3 ⟦OPUS-5⟧ (2026-07-28)

> Daniel: *"revisar los demás documentos para que todo quede alineado y corregir todo en caso de fugas, vacíos legales,
> errores y demás"* · *"la rapidez hace que erremos mucho, podemos trabajar documento por documento y consolidarlo"*.

**67.1 Causa raíz.** El §66 blindó los contratos 03/04 pero dejó tres deudas que sólo se ven al mirar el kit como
sistema: (a) el **doc 03 nunca se enteró del cambio de figura** —su objeto no autorizaba arrendar en nombre propio y
su DÉCIMA TERCERA seguía diciendo que el arrendador y la parte procesal era el PROPIETARIO—, de modo que el mandato
que firma el propietario **contradecía** al arriendo que firma el inquilino; (b) el generador de Word **no filtra
nada**, así que ~570 marcas `⟦⟧` y 131 líneas de "NOTA PARA DANIEL" —incluida *"NO es asesoría legal"*— se imprimían
en el papel que firma un tercero; (c) los 22 documentos restantes **nunca habían sido auditados** y arrastraban cifras
que contradecían a los contratos.

**67.2 Solución estructural.** (a) **GATE DE EMISIÓN** en `_plantilla/generar-documentos.ps1`: aborta la generación de
los 11 documentos **de firma** que traigan marcas de trabajo, advierte en los internos, `-Force` para saltarlo. Es
determinista: el problema era de *pipeline*, no de disciplina. (b) **Comité R3** (121 agentes) sobre la figura en
nombre propio + el fondo de reserva: 57 hallazgos → 32 vivos → **12 correcciones (4 críticas)**, aplicadas. (c)
**Consejo externo R3** (caza de regresiones): 3 hallazgos, los 3 reales; **2 de sus 3 remedios se refutaron o
ampliaron**. (d) **Consolidación documento por documento** de los 24, con el método que fijó Daniel.

**67.3 No-regresión.** Todas las remisiones internas de 03 y 04 resuelven tras renumerar parágrafos en TERCERA,
DÉCIMA PRIMERA y VIGÉSIMA SÉPTIMA (verificado con barrido). **24/24 documentos generan** y los 11 de firma pasan el
gate en verde. Numeración de cláusulas intacta en todo el kit.

**67.4 Verificación.** Comité R3: 6 lentes independientes → **doble refutación adversarial por hallazgo** (existencia
del defecto + daño de la corrección); basta que UN escéptico refute para que caiga. Consejo R3 verificado contra el
texto literal antes de aplicar: su H1 (crítico) era correcto y se **mejoró** poniendo la regla en la cláusula de
terminación; su H2 proponía suprimir una frase que se llevaba por delante **recibir títulos judiciales**, y se
desambiguó en vez de borrar; su H3 exceptuaba sólo al PROPIETARIO cuando la cesión admite cualquier cesionario.

**67.5 Anti-patterns evitados.** No se limpiaron con script las 257 marcas internas restantes: **muchas no son notas
de redacción sino el inventario de lo que falta decidir** — una de ellas escondía que ALTORRA **no tiene contrato de
usuario con DataCrédito ni TransUnion** (B-04), y borrarla habría eliminado el hallazgo. Tampoco se contractualizó el
protocolo D1→D45 completo (sólo el D5 es promesa válida; elevar cada hito convierte un retraso operativo en
incumplimiento demandable).

**67.6 Hallazgos de dinero.** `02` mandaba liquidar la mora a **1,5×IBC** (techo *mercantil*) contra un contrato civil
al **6%** → cobrarlo hace **perder todos los intereses** (C.Co. 884), devolver el exceso doblado (L.45/1990 art. 72) y
expone a usura · `02` y el manual cotizaban la prima de la póliza al **doble** de la real (2,05% mensual) · `01`
cotizaba **el mismo servicio a dos precios** (filas 2b vs 4, la 4 sin decir "vivienda") · `03` dejaba sin tarifa los
contratos de **9 a 10 años** · `23` (pagaré retirado) **afirmaba la figura derogada** · el `04` exigía un **Anexo C-1
que no existía** en el kit.

**67.7 Doctrina.** **LD-03** (una nota "para retirar" suele ser el inventario de lo que falta: leerla antes de
borrarla) · **LD-04** (renumerar un documento rompe las remisiones de los demás: al renumerar, buscar quién cita) ·
el gate determinista vence a la disciplina · el asesor externo se verifica **en ambas direcciones**.

**67.8 Archivos.** Bóveda: los 24 `entregables-fundacion/*.md` · `_plantilla/generar-documentos.ps1` (gate) ·
`_notas/NOTAS-DE-REDACCION` + `_notas/BACKLOG-REVISION-KIT` (B-01..B-04) ·
`research-archive/2026-07-28-comite-r3-contratos/` (journal, resultados, síntesis, dictamen R3, registro de cambios,
121 transcripciones). Repo: `42-LEGAL` · `32` (LD-03, LD-04) · `10` · `99`/`00` · `scripts/extraer-journal.mjs` +
`scripts/limpiar-marcas-contrato.mjs`.

---

## 68. ADR — Fuente única del manual (cap. 2 duplicado y divergente) · namespace `LD-NN` · art. 1096 verificado · auditoría B-03 ⟦OPUS-5⟧ (2026-07-28/31)

> Daniel: *"HAS TODO LO QUE ESTA PENDIENTE DEL CEREBRO"*. Barrido de todo lo abierto, no de una tarea suelta.

**68.1 Causa raíz.** Cuatro defectos independientes, todos de la misma familia — **una fuente de verdad
duplicada a mano**: (a) el **capítulo 2 del manual estaba DOS VECES** dentro del maestro (666 líneas), y las
dos copias habían **divergido justo en la fila que manda**: una decía "garantía = póliza o codeudor, **sin
pagarés**" y la otra seguía exigiendo *"en TODOS los casos pagaré con carta de instrucciones"* — el documento
**RETIRADO** del kit. Un asesor que leyera el manual encontraba las dos, y la última gana. Origen: el maestro
y los 10 fragmentos se mantenían a mano por duplicado, así que cada corrección tenía que aplicarse dos veces.
(b) Las lecciones **`L-31`..`L-34` estaban asignadas dos veces cada una** (frente técnico y frente legal las
tomaron el mismo día), con citas apuntando a sentidos contrarios en `10`, `00`, `20`, `31`, `99 §55`/`§66`/`§67`
y en dos skills. (c) `.auditoria-contratos/` guardaba **copias íntegras de los contratos 03 y 04** dentro de un
repo **público** de GitHub Pages, sin gitignore. (d) La única cita del kit escrita sin leer la fuente
(**C.Co. art. 1096**) seguía abierta como deuda declarada.

**68.2 Solución estructural.** (a) **El maestro se GENERA**: `_plantilla/ensamblar-manual.ps1` +
`15-manual-fragmentos/_portada.md`; los fragmentos son la fuente y `-Verificar` falla si alguien parcheó el
maestro a mano. La duplicación deja de ser posible por construcción, en vez de depender de acordarse.
(b) **Namespace `LD-NN` y hoja propia** `docs/32-LECCIONES-DOCUMENTALES.md` para la familia legal/documental
(LD-01..LD-04), con el mapa viejo→nuevo escrito y las citas reparadas una por una. (c) Gate de `.gitignore`
para `.auditoria-contratos/` y `.astro/`. (d) Art. 1096 leído en dos fuentes independientes que coinciden
literalmente, más el **art. 1099** (no alcanza al arrendatario): el PARÁGRAFO 4 de la DÉCIMA SEGUNDA pasa a
**seguir la norma** — "por ministerio de la ley y hasta concurrencia del importe" — e incorpora la segunda
frase del artículo (excepciones oponibles), que la ley concede igual y cuya omisión solo daba cara de abusiva.

**68.3 No-regresión.** El maestro regenerado difiere del anterior en **exactamente** lo previsto: −666 líneas
(la copia rancia) y las tres reescrituras de cabecera. Verificado: 0 encabezados duplicados · el capítulo 2
aparece 1 vez · 0 menciones del pagaré como regla vigente. La comparación fragmentos↔maestro daba **31 líneas
de diferencia sobre 358.000 caracteres** antes de tocar nada — prueba de que el maestro ya era la
concatenación y el generador no inventa nada. `brain:check`: 7/7 neuronas dentro de tope, boot 31.294c.

**68.4 Verificación.** Auditoría **B-03** por workflow: un auditor dedicado por documento (método de Daniel:
*uno a la vez*) + un escéptico independiente por hallazgo serio. **14/14 documentos auditados · 191 hallazgos
(25 críticos, 74 altos)**. La corrida se cortó por límite semanal de la cuenta con 72 de 99 veredictos; **no se
perdió ninguna auditoría** — los crudos se extrajeron del journal a la bóveda ANTES de relanzar, y el resto se
completó con `resumeFromRunId` (los 86 resultados pagados vuelven cacheados).

**68.4-bis Adenda (2026-07-31) — la corrida cerró y el filtro adversarial cambió el titular.** 113 agentes,
0 errores. De los **191 brutos**, los 99 serios pasaron por un escéptico independiente: **57 murieron refutados**
y quedan **134 vivos (14 críticos · 28 altos · 67 medios · 25 bajos)**. Los medios/bajos NO se refutaron por
diseño: son *sin verificar*, no *confirmados*. **El hallazgo que importa no está en el kit sino en la auditoría**:
en **33 de los 42 serios supervivientes (79%)** el escéptico dictaminó que **la corrección propuesta por el
auditor rompe algo** — el defecto es real, el remedio no. Aplicar los hallazgos tal como vienen habría metido
defectos nuevos en cuatro de cada cinco parches; se aplica el `remedio_mejor` del escéptico. Es [[LD-01]] medido:
ya no es una anécdota del pagaré, es una tasa. Síntesis curada por documento en la bóveda
(`SINTESIS-CURADA.md`), crudos y retorno emparejado al lado.

**68.5 Anti-patterns evitados.** No se limpiaron las 112 marcas `⟦PENDIENTE⟧` del manual: el propio manual
**declara ⟦⟧ como convención** en su cap. 0, así que ahí no son suciedad sino el inventario de lo que falta
(LD-03 otra vez). Lo que sí salió fueron las **"NOTA PARA DANIEL"** de la portada y de los caps 01/02, que
decían *"NO es asesoría legal"* y *"validar con abogado"* en el documento que leen los empleados. Tampoco se
recortó `00-INDICE` para callar al linter: es un **registro** que crece ~200c por ADR, así que se subió su cap
con la razón escrita y se fijó el control real (**longitud de fila ≤200c**, no el total).

**68.6 Doctrina.** **M-04** — un ID lo asigna quien escribe, y dos frentes en paralelo colisionan en silencio;
cuando una familia crece en su propio frente, **namespace y hoja propios** en vez de estirar una secuencia
compartida. Corolario general de §68: **todo lo que se mantiene por duplicado a mano diverge**, y siempre por
la línea que importa — la cura es un generador, no disciplina.

**68.7 Archivos.** Bóveda: `_plantilla/ensamblar-manual.ps1` · `15-manual-fragmentos/_portada.md` + caps 00/01/02
· `15-MANUAL-MAESTRO` (regenerado) · `04` (PARÁGRAFO 4) · `_notas/NOTAS-DE-REDACCION` ·
`research-archive/2026-07-28-auditoria-kit-b03/` (00-LEEME + 191 hallazgos + 72 veredictos).
Repo: `32-LECCIONES-DOCUMENTALES` (nueva) · `30` (M-04, −gobernanza) · `60` (§Gobernanza) · `CLAUDE.md` §0 ·
`00` · `10` · `.gitignore` · `.brain-manifest.json` · `scripts/extraer-journal.mjs` (título parametrizado).

---

## 69. ADR — Auditoría de cerebro Nivel-2 #5: el retrieval funciona, la cobertura no llega al kit ⟦OPUS-5⟧ (2026-07-31)

> No la pidió nadie: la disparó el **gate de pre-commit** (`brain:check #13`: *"19 ADRs nuevos ≥ 12; gracia
> agotada"*), que bloqueó el commit de §68. El gate hizo exactamente lo que se diseñó para hacer.

**69.1 Causa raíz.** La auditoría #4 (§49) dejó tres hallazgos ABIERTOS con dueño declarado — **A-01** (todo el
sistema ×4 cuelga de 1 cuenta + 1 disco), **A-02** (costo del cerebro 49% > bandera 30%) y **A-03** (canario del
harness) — y los tres fueron a parar a `TODO-31`… que **perdió su fila en `10`** y sobrevivía como media frase
dentro de la celda de `TODO-32`. Once días invisibles. Es la clase **H-11 ("cierre-invisible") REINCIDENTE**: un
accionable que existe pero que ningún boot muestra deja de existir en la práctica.

**69.2 Solución estructural.** Fila `TODO-31` restituida con sus tres items explícitos. Los **dos fallos de
enrutamiento** que cazó el retrieval-drill se curaron en el acto, no se anotaron para después: (a) el índice
**no tenía fila para la decisión más consecuente del proyecto** —quién firma como ARRENDADOR—, así que un
operador frío tenía que escanear ~70 títulos de ADR y reconocer el correcto por intuición; (b) la fila de mapa
citaba **`L-33`** (binding removido, error de build) para un síntoma que es **`L-34`** (Range ignorado: *carga
en dev, no en prod*). Ambas filas nuevas.

**69.3 No-regresión.** Las 18 curaciones de la #4 aguantaron 11 días sin reabrirse. `brain:check` en verde
(7/7 neuronas, 68 ADRs indexados, bóveda == origin). **GC pareado: masa-neta del boot −37c** — la auditoría no
engordó lo que audita. Poda real ejecutada: `CLAUDE.md §4` (cache bump) era un **casi-duplicado** del bullet de
SW de §3.2 → fusionada, referencias repuntadas.

**69.4 Verificación — RETRIEVAL-DRILL (la sonda que mide la FUNCIÓN, no el almacén).** Agente frío, sin
contexto, arrancando solo con el boot: **5 de 6 preguntas sin perderse**, dos de ellas (callejones prohibidos ·
qué significa `⟦PENDIENTE⟧`) **sin salir del boot**. La hoja `32` recién creada enrutó limpio desde `CLAUDE.md §0`
a `LD-01` y `LD-03`: **el shard de §68 no rompió el ruteo**. Y el agente **redescubrió por su cuenta** la
contradicción del `00-LEEME` — buena señal del cerebro, mala del kit.

**69.5 Anti-patterns evitados.** No se saltó el gate con `--no-verify` (habría sido un `git commit` limpio y una
deuda escondida). No se retiró ningún chequeo del linter por "no cazar nada": los tres candidatos llevan **una**
auditoría en blanco y la regla pide dos. No se maquilló A-02: el costo **subió de 49% a 55%** y queda escrito.

**69.6 El hallazgo que importa (N5-05, crítico).** **El kit legal no tiene linter.** `brain:check` protege con
16 chequeos la documentación *sobre* el negocio; los **24 documentos con los que la empresa firma contratos**
solo tienen el gate de marcas de trabajo, y **ningún gate cruza documento↔documento**. Por eso el `00-LEEME`
—lo primero que se lee del kit— pudo proclamar la figura de arrendador DEROGADA sin que nada saltara, hasta que
lo encontró una auditoría de 191 hallazgos pagada aparte. **El activo más caro es el menos protegido** → TODO-35.

**69.7 Doctrina.** Un hallazgo sin fila en el ledger es un hallazgo cerrado de facto: al cerrar una auditoría,
**cada ABIERTO se verifica en el boot, no en la tabla**. Y el corolario de N5-05: la protección automática debe
seguir al VALOR (lo que se firma), no al artefacto que resulta más cómodo de lintar.

**69.7-bis Adenda — la poda apagó un gate, en el mismo commit que lo condenaba.** Fusionar §4 en §3.2 dejó al
chequeo #4 del linter sin su ancla (`/## §4 — Cache bump/`) y el cruce SW↔heartbeat pasó a **"omitido" en
silencio** — la clase exacta que este ADR llama crítica. Se restituyó §4 como **ancla + puntero** (120c en vez de
407c) y los chars se buscaron en **§7 ("Cómo retomar")**, que era un recap literal de §G.1/§2/§3.4 — esta vez
**verificando primero** que ningún gate anclara ahí. Masa-neta final **−149c**. Regla que queda: antes de borrar
una sección del router, `grep` del kernel — un heading puede ser la API de un chequeo.

**69.8 Archivos.** Bóveda: `2026-07-31-auditoria-cerebro-nivel2-5-inmobiliaria.md` (tabla falsable N5-01..N5-06 +
diff contra la #4) + fila en el README del archive. Repo: `10` (TODO-31 restituido · TODO-35 nuevo) · `00`
(2 filas de enrutamiento) · `CLAUDE.md` (§4 fusionada en §3.2) · `05` · `.brain-manifest.json` (`deepAudit`).

---

## 70. ADR — B-03 aplicada (14 críticos) · los ESTATUTOS entran al cerebro · el doc 13 se retira ⟦OPUS-5⟧ (2026-07-31)

> Daniel, tras leer las 4 "decisiones" que le subí sobre el acuerdo de accionistas: *"No entiendo eso de las
> acciones… nosotros no estamos vendiendo acciones en Altorra"* → adjuntó los estatutos → *"No no es necesario"*.

**70.1 Causa raíz.** Dos fallos de método, uno encima del otro. (a) **La auditoría B-03 revisó el kit CONTRA EL
KIT**: su paquete de contexto traía decisiones vigentes, contexto legal, póliza y los contratos 03/04, pero **no
los ESTATUTOS de la sociedad** — el documento que gobierna todo lo societario. 14 auditores y sus escépticos
revisaron un pacto parasocial sin abrir la norma que lo rige, y la señal estaba impresa en el propio documento
(*"en caso de contradicción prevalecerán los estatutos"*). (b) **Nunca se preguntó si el acuerdo se iba a usar**,
que es exactamente el disparador de [[LD-02]] — reincidencia del pagaré, a cuatro días de distancia.

**70.2 Lo que los estatutos ya resolvían** (V5, constitución 30-abr-2026, registrada en Cámara): **precio de las
acciones en desacuerdo** → peritos, o los designa la Cámara de Comercio (art. 8º e) · **derecho de preferencia**
con plazos de 5 y 10 días hábiles (art. 8º) · **supramayoría del 70%** para reformas y para enajenar la totalidad
de los bienes sociales (art. 13º) — el mismo 70% que los docs 14/15 citaban y que la auditoría dio por inventado ·
**conciliación + tribunal de arbitramento** de la Cámara de Comercio para toda diferencia entre socios (art. 24º),
que hace innecesario el poder irrevocable que un auditor propuso y su escéptico tumbó por peligroso. **De las 4
preguntas que se le llevaron al dueño, 3 no existían.**

**70.3 Decisión del dueño: el doc 13 se RETIRA del kit** (no se firma, se conserva auditado, sale de la lista de
documentos de firma del generador). **Riesgos asumidos conscientemente y escritos en su banner**: la **muerte** de
un accionista deja entrar a los herederos (el art. 8º somete a preferencia la *enajenación*, y heredar no lo es) ·
**no hay arrastre** · y la **gerencia no queda blindada**: los estatutos permiten a la Asamblea remover libremente
al Gerente (arts. 14º e y 16º) con quórum >50% y mayoría simple, y en un **40/40/20 cualquier pareja suma 60%**.
**Efecto en el backlog de B-03** (verificado en `SINTESIS-CURADA.md`: total 134 = 14 críticos · 28 altos · 92 leves;
sección `## 13` = 0 críticos · **5 altos · 7 leves**): al salir el 13, el pendiente real baja a **23 altos y 85
leves**. `05` había quedado con el 28 y ambos nodos con el 92 — corregidos el 31-jul en este mismo cierre.

**70.4 Verificación.** Las normas nuevas se leyeron en fuente ANTES de escribirlas: **Ley 675/2001 art. 46** (70%
para reformar el reglamento de PH), **C.Co. art. 164** (el inscrito conserva su carácter), **Ley 1258 art. 24**
(representante para información, 5 días comunes) y **Ley 1480 art. 43 num. 5** (ineficacia de la cláusula de
no-reintegro). Gate de emisión en verde tras cada documento; `brain:check` SANO; boot dentro de presupuesto.

**70.5 Los 14 críticos aplicados** (6 commits `kit B-03 (n/n)` en la bóveda): `00-LEEME` proclamaba la figura de
arrendador DEROGADA y vendía una escritura pública por propietario · `11-HOSPEDAJE` pactaba una retención del 100%
**ineficaz de pleno derecho**, retenía IVA de un servicio no prestado y calculaba la escala sobre *lo pagado*, lo
que premiaba con $1.500.000 a quien no pagaba el saldo · `16-LIQUIDACIÓN` descontaba la prima **una vez al año**
siendo mensual (~$497.000/inmueble/año de fuga) y no sabía expresar un mes sin recaudo · `12-CORTA-ESTANCIA`
mandaba a cobrar sin facturación habilitada y dejaba en blanco el caso más frecuente de PH · `07` negaba tratar
datos sensibles cuando la biometría es el proceso estándar · `06` tenía vacía la sección del "cómo" · `14`
derivaba a un abogado inexistente · y cuatro entregables se autodesacreditaban.

**70.6 Anti-patterns evitados.** **El 79% de las correcciones del auditor fueron marcadas dañinas por sus
escépticos y NO se aplicaron** — entre ellas: crear un cobro contra un consumidor que canceló, autoatribuirse ante
la SIC un tratamiento biométrico que ejecuta la aseguradora, rotular la cédula como dato sensible, y dar poder
irrevocable al Gerente. Los **92 hallazgos medios/bajos NO se aplicaron a ciegas**: no pasaron por escéptico, así
que son *sin verificar*, no *confirmados*.

**70.7 Doctrina.** **[[LD-05]]** (nueva): auditar el kit contra el kit no basta — identifica el **documento madre
fuera del kit** e inclúyelo en el paquete de contexto. **[[LD-02]] reincidente**: la pregunta *"¿esto lo vas a
usar?"* se hace antes de la primera línea **y otra vez antes de mandarlo a auditar**, porque auditar es el gasto
grande. Corolario del §68 que se confirma: lo que se mantiene por duplicado a mano diverge — aquí, el kit y los
estatutos vivían sin hablarse.

**70.8 Archivos.** Bóveda: `13` (retirado) · `00-LEEME` (retiro + puntero a los estatutos + regla de prevalencia) ·
`_plantilla/generar-documentos.ps1` (13 fuera de la lista de firma) · `02` `04` `05` `06` `07` `11` `12` `14` `16`
`23` + manual y fragmentos. Repo: `32` (LD-05 + reincidencia de LD-02) · `10` · `05` · `99`/`00`.

## 71. ADR — los 23 ALTOS de B-03 aplicados · el kit estrena sus 2 primeros gates documento↔documento ⟦OPUS-5⟧ (2026-07-31)

**71.1 Causa raíz.** No había una: los 23 altos eran deuda conocida de §68. Lo que sí apareció fue una
**causa raíz de método**: los remedios se escribieron el 28-jul contra un texto que cambió el 31-jul al
aplicar los 14 críticos. Al re-verificarlos contra el papel de hoy, **1 ya estaba resuelto** y **12 de 23
bajaron de gravedad**. Un remedio es una hipótesis con fecha ([[LD-06]] corolario).

**71.2 Solución estructural.** Workflow de 13 agentes (`wf_7c4b1723-5c1`, ~2M tok): 12 planificadores —uno
por documento, que **planifican pero no editan**— y 1 revisor que cruza los 12 planes. La aplicación la
hace un solo escritor, en serie, con un aplicador que **aborta si el ancla no es única**. Ese diseño no es
estético: 2 de los 3 bloqueantes que apareció fueron choques de escritura que sólo existen si hay
concurrencia, y uno de ellos —dos planes con el mismo `old_string` sobre 05:62— **habría perdido un edit
sin dejar rastro**.

**71.3 Los 3 bloqueantes.** (a) El doc 16 recibía el bloque del Fondo de Reserva **dos veces**, con dos
nombres (`C-bis` vs `C3`); fusionado, canónico `C-bis` porque la `D` ya era SOPORTES ANEXOS. (b) 05:62 con
ancla compartida; fusionado a mano en C1/C2 + C-bis. (c) **El grave**: los planes 07 y 08 iban a escribir
filas mutuamente excluyentes en el control de versiones de la Política, y la del 08 declaraba *«sin cambios
en finalidades… no se configura cambio sustancial del art. 5 del D.1377»*. El git lo desmiente (`edc269e`:
*"07 y 08 V2 — el Anexo C-1 que el contrato exige NO existía"*). **Decisión: se sube a V2 y la fila dice el
cambio real.** El deber de comunicar no aplica —pero porque la Política **nunca se publicó**, no porque no
hubiera cambio. Mismo destino, sin firmar algo falso.

**71.4 Lo que ningún plan reportó y sí vio el revisor.** El **Formato C** se encabezaba *"Responsable:
ALTORRA"* en el formato que autoriza la **validación biométrica facial**, cuyo Responsable —según la propia
Política (07 §6.1) y el contrato (04, Anexo C-1)— es la **aseguradora**: el titular firmaba autorizando a
quien no trata el dato. Separado, y añadido el traslado de sus derechos a la aseguradora en 2 días hábiles.
El **doc 14** mandaba *«contrasta contra ella el Doc 13… antes de firmar nada»* —retirado el día anterior—
y afirmaba que no hay copia de los estatutos, falso desde el 31-jul; purgadas también 3 referencias vivas
al doc 13 en los fragmentos del manual. El **día cero del giro**: el plan 16 lo ataba a *"la última fecha
de la tabla A"*, que incluye **recobros** — un recobro del día 28 habría corrido el plazo **contra el
propietario y contra el contrato** (03 Cl. Quinta parág. 2: acreditación del *cargo mensual integral*).

**71.5 Normas.** Verificadas en fuente oficial ANTES de escribirlas: **Ley 1336/2009 arts. 1 y 5**
(*«adoptar, fijar en lugar público y actualizar»* el código ESCNNA, e incluye alojamientos **no
turísticos**; el doc 11 se lo exigía al huésped sin declararlo cumplido) · **Resolución MinCIT 3840/2009**
· **E.T. art. 847**. Registradas en `DECISIONES-VIGENTES §4`. ⚠️ **D.572/2025 queda marcado EN LITIGIO**:
el normograma DIAN muestra vigente su art. 6 y fuentes secundarias sostienen que la suspensión del Consejo
de Estado (exp. 11001-03-27-000-2025-00055-00, 07-05-2026) cubre los arts. 2 a 8. **Discrepancia no
resuelta y no ocultada**: los docs 20 y 15/cap04 prohíben cotizar con la tabla — manda la liquidación de la
notaría. Ningún agente había mirado si la norma seguía viva.

**71.6 Anti-patterns evitados.** **NO** se borró el rótulo `Matrícula` (la regla que proponía el plan 07
habría abortado la emisión de **7 de los 10 documentos de firma**, y el blanco es legítimo por decisión
cerrada del dueño: el número llega al cierre de obra). **NO** se borró un blanco en 1 de 9 documentos —
eso cambia un hueco por una discrepancia. **NO** se tocaron las `V1` propias de cada documento al subir la
Política a V2. **NO** se aplicaron los 85 leves: no pasaron por escéptico (§70.6).

**71.7 Verificación.** Aplicador con chequeo de unicidad: **46/48 edits, 0 anclas fallidas**, 2 descartados
y rehechos a mano. Manual reensamblado desde fragmentos + `ensamblar-manual.ps1 -Verificar` OK. Gate de
emisión **verde, 24/24 emitidos**. Detector de cicatrices probado 8/8 (5 campos legítimos no marcados,
3 cicatrices reales detectadas). Los 22 Word vivos regenerados en la carpeta del dueño.

**71.8 TODO-35 arranca.** El generador estrena los **dos primeros cruces documento↔documento**, que es el
hueco por el que se coló el `00-LEEME`: (1) **detector de cicatrices de redacción** —guiones que cierran
una frase ya terminada— con *lookbehind* de abreviaturas, porque sin él abortaba el doc 11 por su propio
encabezado de partes (`RNT No. ____` es campo, no cicatriz); (2) **coherencia de la versión de la
Política**: se calcula del doc 07 y aborta si cualquier documento le declara otra al titular (Ley 1581
art. 8 num. 2). Faltan los cruces de cifras vs 01/02, remisiones y URLs declaradas.

**71.9 Doctrina.** **[[LD-06]]** (nueva): con fan-out sobre documentos que se citan entre sí, el defecto
deja de vivir en un documento y pasa a vivir ENTRE ellos — la fase de colisiones no es opcional, se
planifica en paralelo y se aplica en serie, y el aplicador verifica unicidad de anclas. Corolario: **un
remedio es una hipótesis con fecha**; se re-verifica contra el archivo, no contra el informe. Crudos +
síntesis → `research-archive/2026-07-31-kit-b03-altos/`.

## 72. ADR — el heartbeat llega a los 3 hermanos: TODO-32(a) cerrado y el SPOF re-medido ⟦OPUS-5⟧ (2026-08-01)

**72.1 Causa raíz.** Los 4 repos comparten kernel v1.6.0, pero `kernelFiles` es **por-repo** y los
hermanos solo declaraban 2-3 archivos: tenían el linter en `SessionStart` y nada más. Sin heartbeat, el
estado DERIVABLE (branch, sucios, cache del SW, costo, consolidación) **se copia a mano al `05`** — y un
dato copiado a mano se desincroniza siempre. Se verificó mordiendo el mismo día: el `05` de cars declaraba
`v20260724020458` mientras el SW iba en `v20260801024429`, 8 días de desfase. Su propia lección L-02 ya
había diagnosticado el drift como ESTRUCTURAL y había respondido *"sincronizar a mano en cada merge"* —
tratar el síntoma. **insemastereo estaba peor: no tenía NINGÚN hook `SessionStart`**, así que tampoco
corría la auto-auditoría.

**72.2 Solución.** `session-handoff.mjs` (canónico v1.6.0) declarado en los `kernelFiles` de los 3 y
distribuido con `brain:pull`; hooks `SessionStart` (+`--boot-echo`), `PreCompact`, `SessionEnd` y `Stop`
cableados; sidecars generados al `.gitignore`. A insemastereo se le añadió además `brain-check --boot`.
El script ya estaba **escrito para ser portable** —sondea 4 rutas de service-worker, degrada CNAME a
"(no aplica)", lee el manifest de cada repo y jamás bloquea (exit 0 siempre)—, así que no hubo que
bifurcarlo: cero strings de inmobiliaria dentro.

**72.3 Verificación en los 3 repos.** Se corrió el heartbeat en cada uno y **produjo señal REAL desde el
primer arranque**, no plantilla: bersaglio detecta `sw.js`/`bersaglio-v98`, insemastereo reporta
"(sin service worker)" —correcto, es una landing—, y ambos CNAME "(no aplica)". Y destapó deuda que nadie
estaba mirando: **cars con 9 commits de producto sin ADR** e insemastereo con 4.

**72.4 El SPOF re-medido (TODO-31), y dos de tres eran falsos.** (a) *"falta bundle offsite mensual"* —
**FALSO**: `OneDrive/backups-cerebro/` tiene los 5 repos + la bóveda, último set 23-jul, y el heartbeat ya
lo vigila. (b) *"canario del harness"* — **ya no**: el marker de boot viaja con este cambio a los 4.
Queda solo (c), los recovery codes, que son de Daniel. **Un pendiente que describe un mundo que ya no
existe es peor que ninguno**: ocupa boot y desvía trabajo.

**72.5 Lo que este cambio DESTAPÓ y no cierra.** (1) **El `boot-gate` solo existe en inmobiliaria**, y es
—no por casualidad— el único repo dentro de presupuesto: cars va **+4.1k** y bersaglio **+11.6k (37%)**
sobre su objetivo, quemados en cada arranque de cada sesión. Encenderlo hoy les bloquearía todo commit de
cerebro, así que el orden correcto es **destilar primero y poner el trinquete después** (techo = el valor
ya destilado). (2) **`brain-kit/` está congelado el 18-jul, pre-v1.6.0**: quien instale un cerebro nuevo
desde la plantilla lo estrena viejo. (3) El banner de costo supera el 30% en **los cuatro** (cars 43 ·
bersaglio 61 · insema 56 · inmo 56): segundo mes ⇒ toca poda real. → **TODO-36** y **TODO-32(b)**.

**72.6 Anti-patterns evitados.** NO se instaló `boot-gate` como bloqueante en repos que ya lo violan
(sería un gate que nadie puede satisfacer: se desactiva y muere la disciplina). NO se editó
`session-handoff.mjs` por-repo: el canónico es uno y se distribuye. NO se pusheó a `main` en insemastereo
—su CLAUDE.md reserva el merge al dueño—, se pushó la rama `cerebro/todo-32`.

**72.7 Higiene del mismo turno.** Las 4 copias de la skill `meta-ads-diagnostico` quedaron idénticas
(verificado por hash ignorando CRLF) y commiteadas en los 3 hermanos, que la tenían sincronizada pero sin
commitear. bersaglio: `session-report-*.html` al `.gitignore` (llevaba desde el 8-jul ensuciando el árbol).

**72.8 Doctrina.** Corolario de [[LD-04]] aplicado al ecosistema: **si un gate existe en un repo y no en
sus hermanos, los hermanos derivan** — y la deriva se mide, no se supone (cars +4.1k, bersaglio +11.6k).
Corolario del §52 confirmado: el estado derivable se GENERA o miente.

## 73. ADR — auditoría Nivel-2 de insemastereo aplicada · bersaglio vuelve a ser commiteable · 6 chequeos a la cola del kernel ⟦OPUS-5⟧ (2026-08-01)

**Deliberación:** `brain-private/insemastereo/research-archive/2026-08-01-auditoria-nivel2-*` (tabla + crudo +
workflow). Síntesis por-repo → insemastereo `99` ADR-F. Aquí queda lo que es **del ecosistema**.

**73.1 Lo que la auditoría probó del método, no solo del repo.** Corrió sobre el hermano más pequeño y
encontró **36 hallazgos (14 tras filtrar)** en un cerebro que el linter declaraba SANO en sus 16 gates. El de
más peso —el `05` afirmando *«main == origin/main, pusheado ✓, 3 commits»* cuando el HEAD estaba en otra rama
y `main` iba 24 detrás— **lo reportaron cinco sondas por separado**, sin verse entre ellas. Un defecto que
cinco lentes independientes encuentran no es un descuido: es **estructural**, y su causa es la de siempre —
un dato **volátil** copiado a mano en un nodo que se lee en cada arranque.

**73.2 La ironía que vale como doctrina (N2-02).** La respuesta correcta **ya existía en el repo**: el
heartbeat instalado ese mismo día (§72) genera `docs/.estado-auto.md` con rama, HEAD, sucios y deuda de
consolidación en cada boot. Pero **ningún nodo de ruteo llegaba a él**. Es decir: yo cerré §72 declarando el
TODO-32(a) hecho, y horas después una auditoría demostró que había dejado la mitad — **generar la verdad no
basta, hay que ENRUTARLA**. Corregido en los tres hermanos (fila en el §0 con la regla de desempate: *si
contradice al `05`, manda el sidecar*). Y salió un defecto de kernel: el gate #10 **no puede ver dotfiles** —
su `edgeRe` exige que el nombre empiece por carácter de palabra— así que un sidecar generado queda marcado
huérfano para siempre; hoy se tapa con `orphanAllowlist`, el arreglo de fondo va a la cola (#17-bis).

**73.3 bersaglio llevaba tiempo sin poder commitear su cerebro.** Su `CLAUDE.md` estaba **2.6k chars sobre su
tope duro** y el gate bloqueaba *cualquier* commit de cerebro. No era una advertencia: era una parálisis, y
explica por qué era el hermano más rezagado. **30.009c → 26.719c**, sin perder una sola regla: (a) **§G.4**
6.5k→4.4k — inmobiliaria ya había destilado esa misma gobernanza a la mitad y los hermanos nunca recibieron la
versión corta (doctrina vigente: *escritor único de §G = inmobiliaria*); (b) **§G.5** 2.9k→1.7k — su tabla
copiaba **a mano 15 topes que ya viven en `.brain-manifest.json`** y que el linter valida; los números vuelven
a su dueño y queda la estrategia de poda, que es juicio. La tabla además **tapaba un hueco real**:
`docs/35-LECCIONES-DINERO.md` existía desde el 27-jul con 6.1k y **ningún cap lo vigilaba**.

**73.4 El patrón, ya en tres repos el mismo día.** cars: la caché del SW copiada al `05` (8 días de desfase).
insemastereo: el estado de git copiado al `05` (42 días). bersaglio: los caps copiados al `CLAUDE.md` (uno
faltaba). **Tres cerebros, tres nodos distintos, un solo defecto**: un hecho cuyo dueño es otro (el cron, git,
el manifest) copiado a un nodo que se lee siempre. Ninguno se detectó por revisión: los tres se detectaron
**contrastando el nodo contra la fuente**.

**73.5 Los 6 chequeos que suben a TODO-23** (kernel canónico, `../brain-private/kernel/` + `brain:pull` ×4):
**#17** leer el git del PROPIO repo (hoy el único bloque git del kernel mira la bóveda, no el repo — habría
cazado 73.1 el primer día) · **#18** cambio sin consolidar (existe el gate inverso, no este) · **#19** la
cobertura de fiabilidad invertida: hoy da ✅ con cobertura CERO, o sea el opt-in premia no usarlo · **#20**
anclas de deliberación fuera de `archiveDir` (dos punteros rotos convivían con un «✅ archiveDir íntegro») ·
**#21** `deepAudit` sin `tableFile` — el sub-gate se apaga solo si falta la clave · **#22** `ssotFact` del tag
de modelo. Más **#17-bis**: admitir el punto inicial en `edgeRe` (73.2).

**73.6 Anti-patterns evitados.** NO se usó `--no-verify` para saltar el gate de bersaglio: el gate tenía razón
y el arreglo era destilar. NO se subió el cap del manifest para «resolver» el exceso (eso es apagar la alarma).
NO se editó `brain-check.mjs` en ningún repo: el kernel se toca en el canónico y se propaga. NO se pusheó a
`main` en insemastereo — su regla reserva el merge al dueño.

**73.7 Doctrina.** **[[LD-06]] tiene un hermano de infraestructura**: así como con fan-out el defecto vive
ENTRE documentos, con un ecosistema de repos el defecto vive **ENTRE cerebros** — un gate que existe en uno y
no en sus hermanos garantiza deriva, y la deriva no se supone: se mide. Corolario operativo verificado hoy:
**un pendiente que describe un mundo que ya no existe es peor que ninguno** (2 de los 3 puntos del TODO-31
eran falsos y desviaban trabajo).

## 74. ADR — cars destilado, `brain-kit` descongelado, y el hueco que deja crecer una neurona sin techo ⟦OPUS-5⟧ (2026-08-01)

**74.1 cars: 35.946c → 33.944c de boot**, y su `CLAUDE.md` vuelve dentro de tope (24.438 → 22.592). El
espacio salió de tres sitios, ninguno por recorte a ojo: (a) **§G.4** 6.2k→4.4k, la misma gobernanza que
inmobiliaria ya había destilado a la mitad y que los hermanos nunca recibieron — de paso se plegó el reflejo
de **catalogación de skills, que cars no tenía escrito** aunque su gate #6 sí lo vigila; (b) el **`05` soltó
caché y rama**: ahora que cars tiene heartbeat esos valores se generan, y copiarlos era lo que hacía reincidir
L-02 (el día anterior declaraba una caché de 8 días atrás); (c) **§G.5**, cuya tabla copiaba a mano los topes
del manifest y además **había envejecido** — declaraba UNA hija de `30` cuando ya hay tres.

**74.2 El hueco que la tabla tapaba, y que es general.** Al sustituir la tabla por el manifest aparecieron dos
hojas **sin cap declarado**: `31-LECCIONES-GIT` y `32-LECCIONES-META`. La segunda tenía **27.4k** y **ningún
gate la miraba**. No es un caso aislado: el barrido ×4 encontró neuronas sin cap en los cuatro repos. **El
linter solo vigila lo que el manifest declara, y el manifest calla sobre el resto** — así una hoja crece sin
techo y en silencio hasta que alguien tropieza con ella. → chequeo **#23**: toda `docs/*.md` sin `cap` ni
pertenencia a una lista `noCap` explícita **con razón** es un warn; la ausencia deja de ser una opción por
omisión y pasa a ser una decisión escrita. (Mismo día, mismo patrón que bersaglio §73.3.)

**74.3 Error propio, corregido en el mismo turno.** Al declarar el cap de `32-LECCIONES-META` puse **16.000
inventado** sin medir el archivo: creó un gate bloqueante falso sobre una hoja de 27.4k. Corregido fijándolo
desde el **tamaño real medido + holgura**. La regla que queda escrita en su manifest: **un cap se mide, no se
supone** — es exactamente el mismo defecto que llevo tres ADRs persiguiendo (un número puesto a mano sin
contrastar contra su fuente), esta vez cometido por mí.

**74.4 `brain-kit` descongelado.** La plantilla de instalación estaba en el **18-jul, pre-v1.6.0**: su
`brain-check` era de la era v1.x y su `session-handoff` (2.8k vs 9.5k) **no tenía heartbeat**. Un cerebro
instalado desde ahí nacía sin la mitad de la maquinaria y **sin avisar de nada**. Refrescado a v1.6.0 (6/6
idénticos al canónico, `brain-archive` incluido, que faltaba) + aviso en su README con el comando de refresco
y el de verificación, porque **volverá a envejecer**: es una copia, y las copias se desincronizan. ⚠️ Y no
está bajo git: sin historial y **fuera de los bundles offsite** — a diferencia del kernel, que vive en la
bóveda versionada.

**74.5 Lo que NO se hizo, y por qué.** No se instaló el `boot-gate` en los hermanos. Su propia cabecera
condiciona la subida al kernel a que **los 3 repos estén bajo presupuesto**, y cars sigue +2.4k. Se podía
"cumplir" subiendo su `bootCharsTarget` al valor de hoy — y eso es exactamente la trampa que el gate existe
para impedir: **un techo que se mueve para alcanzarlo no es un techo**. Se deja el objetivo intacto y la
distancia visible. Tampoco se hizo GC del `10` de cars: su ledger está limpio (gate #9 pasa) y sus 25 filas
son pendientes reales de un proyecto pausado, no narrativa consolidable — podarlas sería perder estado.

**74.6 Doctrina.** Corolario de §73.7, ahora medido: **el silencio de la configuración es una decisión que
nadie tomó**. Un cap ausente, una clave que ningún gate lee, una copia sin fecha de caducidad — las tres dan
verde y las tres esconden deriva. Un gate que solo comprueba lo declarado premia no declarar.

## 75. ADR — kernel v1.7.0: los dos chequeos que habrían cazado todo lo de hoy ⟦OPUS-5⟧ (2026-08-01)

**75.1 #17 — el kernel no miraba el git del repo que audita.** Su único bloque git (#7b) mira la **bóveda**.
Del propio repo no sabía nada, y por eso el `05` de insemastereo declaró *«main == origin/main, pusheado ✓,
3 commits»* durante **42 días** con el HEAD en otra rama y `main` 24 commits detrás, mientras los 16 gates
daban SANO. Ahora se lee `.git/HEAD` + refs por fs (sin `child_process`, como #7b) y se contrasta contra lo
que declaran los nodos always-on. **Por ARCHIVO, no en bolsa común**: el defecto era que el nodo que se lee
PRIMERO mentía aunque otro dijera la verdad — sumar los tokens de todos daba por sana la mentira.

**75.2 Se verificó ENCENDIDO, y hubo que corregirlo dos veces.** Un gate que nunca dispara es
indistinguible de uno que funciona, así que se probó **restituyendo la mentira histórica** en el `05`:
- **v1 no cazó nada**: buscaba `rama X` / `branch X` y el texto real decía *«Local \`main\` == \`origin/main\`»*.
  Era teatro puro, y solo se supo porque se probó contra el defecto vivo en vez de darlo por bueno.
- **v2 disparó de más**: acusaba a `CLAUDE.md` de *«declarar la rama \`05\`»* — en un cerebro los backticks
  son casi siempre punteros a nodos, no ramas. **Un gate ruidoso se acaba ignorando: así es como muere.**
- **v3**: dispara solo en el archivo que miente, calla con el texto correcto, y **no da falso positivo en
  cars**, que declara un flujo `dev`→`main` legítimo. Las tres condiciones se comprobaron, no se supusieron.

**75.3 #23 — el silencio del manifest.** El linter solo vigila lo declarado; sobre el resto, el manifest
callaba. Así `32-LECCIONES-META` de cars llegó a **27k sin que ningún gate la mirara**, y el barrido ×4
encontró **44 neuronas sin techo** (cars 19 · bersaglio 11 · inmobiliaria 10 · insema 4). Ahora cada
`docs/*.md` necesita **cap medido** o entrada en **`noCap` con su razón**: no declarar deja de ser una opción
por omisión y pasa a ser una decisión que alguien escribe.

**75.4 El linter me cazó a mí, dos veces, en este mismo turno.** Al declarar los caps de inmobiliaria (a)
añadí la clave `noCap` sin registrarla en `KNOWN_KEYS` → el gate #15 la marcó como desconocida (*«un typo
apaga gates en silencio»*), y (b) calculé los caps de líneas con una media inventada de 110 chars/línea en
vez de contar → dos neuronas nacieron violando su propio tope. **Es el defecto de §74.3 repetido por mí, un
ADR después**: estimar en lugar de medir. Corregido midiendo archivo por archivo. Que el gate me lo cazara
en el mismo turno es la mejor prueba de que sirve.

**75.5 Doctrina.** **Un gate se verifica ENCENDIDO**: se restituye el defecto que lo motivó y se comprueba
que dispara, que calla cuando debe y que no acusa a un inocente. Sin esas tres, lo que hay es un ✅ decorativo
— exactamente lo que la Regla de ADMISIÓN (§G.4) llama anti-teatro, aplicada ahora al propio linter.

## 76. ADR — 52 neuronas bajo techo, shard de `§Meta`, y la trampa que estuve a punto de hacer dos veces ⟦OPUS-5⟧ (2026-08-01)

**76.1 Las 44 sin techo, decididas.** El chequeo #23 (v1.7.0) las sacó a la luz; ahora cada `docs/*.md` de los
4 repos tiene **cap medido** o **`noCap` con su razón**. Total: **52 con cap · 17 sin tope declarado**. La
clasificación no es cosmética — son tres clases con destinos distintos: (a) **neuronas** `NN-NOMBRE` → cap
medido (tamaño real + 35%); (b) **`99` y `skills-inventory`** → `noCap`, porque el `99` nunca se lee entero y
el inventario es 1:1 con `skills/` (ya lo vigila el gate #6); (c) **documentos que viven en `docs/` y NO son
neuronas** —planes, manuales, handoffs— → `noCap` con esa razón escrita. Esa tercera clase es un hallazgo en
sí: cars tiene un plan de ejecución de **93k** dentro de `docs/`, que el router nunca enruta y nadie poda.

**76.2 La trampa, dos veces en un turno.** Estuve a punto de **subir un límite en vez de cumplirlo**:
(1) el `boot-gate` no se podía instalar en los hermanos porque cars iba +2.4k, y bastaba subir su
`bootCharsTarget` al valor de hoy para que la condición *«los 3 bajo presupuesto»* se cumpliera sola;
(2) el script que declaraba los 44 caps **subía automáticamente** cualquier cap ya declarado que el archivo
excediera — habría elevado en silencio **9 topes deliberados**, incluido el del `05` de cars (2.800c, decisión
editorial explícita: *«tablero, no bitácora»*). Las dos veces el resultado inmediato es un ✅ y ningún gate se
queja; el límite sigue ahí, el linter pasa, y la deriva continúa **con la bendición del gate**. Eso es peor que
no tener el gate: hay evidencia falsa de control. → **[[M-05]]**, y la regla dura: **un cap excedido es la
señal de destilar, no de subir el techo**; un límite solo sube con una razón que no sea «hoy no lo cumplo».

**76.3 Shard de `§Meta` → `33-LECCIONES-META.md`.** `30` estaba al **98% de su cap** y marcada pre-shard desde
hacía días; añadir M-05 ahí habría sido exactamente lo que §G.5 prohíbe. Los M-NN salen a una hoja hija con la
convención ya establecida (stub `### M-NN` en `30`, que es donde el kernel los lee; detalle en la hija). `30`:
39.328c → **35.111c**. Cierra el **#8 de TODO-28**, que llevaba desde §68 a medias.

**76.4 El linter cazó la neurogénesis incompleta en caliente.** Al crear la hija, el gate saltó de inmediato
con las dos cosas que §G.4/§G.5 exigen y yo aún no había hecho: *«neurona sin registro DIRECTO en CLAUDE.md
§0»* y *«sin caps ni noCap»*. No hubo que acordarse del protocolo: la maquinaria lo pidió. Es la diferencia
entre una regla `[HONOR]` y una mecanizada, y aquí se vio funcionando el mismo día que se escribió el gate.
La fila del §0 se **extendió** en vez de añadirse una nueva, por economía del boot (one-in-one-out §G.5).

**76.5 Doctrina.** Tres formas de que un gate mienta, las tres vistas hoy: **no dispara** cuando debería
(§75.2, la v1 de #17), **dispara contra un inocente** (§75.2, la v2), o **se puede ajustar para que pase**
(§76.2). Las tres dan ✅. Un gate solo vale si se verificó contra el defecto vivo *y* su umbral es más difícil
de mover que el problema de arreglar.

## 77. ADR — el kernel corregido tres veces por probarlo, y un gate que su propio arreglo dejó obsoleto ⟦OPUS-5⟧ (2026-08-01)

**77.1 Tres correcciones a #17, ninguna por razonar.** El chequeo *«¿el cerebro miente sobre en qué rama
estás?»* nació en §75 y hubo que arreglarlo **tres veces**, cada una al probarlo contra la realidad: (a) **no
disparaba** —buscaba `rama X` y el texto real decía «Local \`main\` == \`origin/main\`»—; (b) **acusaba a
`CLAUDE.md`** de declarar la rama \`05\`, que es un puntero a neurona; (c) **volvió a acusar** en bersaglio, a
una skill (\`arquitecto-software\`) y a un tag de modelo (\`OPUS-5\`), por recoger cualquier backtick de una
línea git-ish. La v4 se queda con **dos señales inequívocas**: `origin/<x>` —que nadie escribe salvo para
hablar de una rama— y un token pegado a la palabra *rama/branch*. **Precisión sobre recall**: perder una
mentira rara cuesta menos que perder la confianza en el gate ([[M-05]]).

**77.2 El gate #4, obsoleto por el arreglo que él mismo provocó.** Vigilaba que el `05` declarara la versión
de caché igual que el SW. Pero la doctrina cambió hoy —ese dato es DERIVABLE y lo genera el heartbeat, el `05`
ya no debe declararlo— así que el gate empezó a gritar **«05 STALE» exactamente en los repos que acababan de
hacer lo correcto**, tomando el puntero \`docs/.estado-auto.md\` por un número de versión. Corregido: el
candidato tiene que **parecer** una versión, no ser cualquier backtick de la fila. **Al cambiar una doctrina
hay que preguntarse qué gate la vigilaba** — puede estar defendiendo el mundo anterior.

**77.3 bersaglio: el `05` en tope por primera vez** (4.725c → **4.216c**, 25/25 líneas). Suelta caché y
alineación de ramas al heartbeat —**tercer repo con el mismo dato copiado a mano**, tras cars e insemastereo—,
la narrativa del interinato baja a §192-§194 dejando solo las reglas vivas (marca `[OPUS-5]`, el gotcha de
auditar por AMBOS marcadores, el gate de Daniel), y la regla de deploy manual deja de estar escrita **en dos
filas**: el comando sube a la fila que ya la declaraba.

**77.4 Doctrina → [[M-06]].** Un gate no está terminado cuando compila, sino cuando lo has visto **(a)**
disparar restituyendo el defecto vivo que lo motivó, **(b)** callar con el texto correcto y **(c)** no acusar
a un caso legítimo vecino. Sin las tres, es un ✅ decorativo — y eso es **peor** que no tener gate, porque
genera confianza falsa. Las tres formas de que un gate mienta, todas vistas en 24h: no dispara · acusa a un
inocente · se puede ajustar para que pase.

**77.5 Los pares de caps eran incoherentes entre sí** (hallazgo N2-13 de la auditoría, generalizado). Cada
neurona tiene tope de **líneas** y de **chars**, y yo los derivaba por separado (`real × 1.35`) sin mirar la
**densidad real** de cada archivo. Resultado: el eje equivocado disparaba primero. `31-VERIFICACION-UI` tiene
306 chars/línea y `40-LOBULOS` 84 — con el mismo criterio uniforme, en una manda un eje y en la otra el otro.
Ahora `lines = chars / densidad-real`, así ambos aprietan en el mismo punto. **11 pares corregidos, y 7 se
APRETARON** (`CLAUDE.md` 320→230 líneas · `20` 280→90 · `30` 350→180 · `00` 450→160). Los 4 que subieron
—`10`, `60`, `15`, `33`— **no tocaron su cap de chars**, que sigue siendo el vinculante: el presupuesto de
contexto no se movió ni un carácter, solo dejó de dispararse el eje secundario antes de tiempo. Eso lo
distingue de la trampa de [[M-05]]: ahí se mueve **el techo**; aquí se corrige **cuál de los dos ejes es**.

## 78. ADR — cars entra en presupuesto por una decisión estructural, no por raspar ⟦OPUS-5⟧ (2026-08-01)

**78.1 El último tramo no salió de recortar.** cars llevaba toda la noche bajando de a 50c: soltar la caché
al heartbeat, destilar §G.4/§G.5, compactar la bitácora. De 35.946c llegó a 33.4k y ahí se atascó — porque lo
que quedaba era **contenido legítimo**. El cierre vino de mirar qué hace ese contenido en el boot: su `10`
cargaba **25 pendientes CONGELADOS** (4.5k) de un proyecto **en PAUSA por el pivote §302**, releídos en cada
arranque para trabajo que nadie iba a tomar. Salen a `11-PENDIENTES-CONGELADOS.md`. **35.946 → 29.715c.**

**78.2 Congelado ≠ cerrado, y el shard es reversible.** Ninguno de los 25 se cierra: cerrar uno sigue
exigiendo su ADR. Y la hoja declara **cuándo volver a leerla** («cuando el dueño diga: volvemos a cars») y
que entonces **regresan al `10`** — el shard fue por PAUSA, no por tamaño. En el boot queda lo que de verdad
sirve a una sesión nueva: el **Foco** (caminos A/B/C) y los **🚫 callejones**, que el drill de retrieval de la
auditoría identificó como el mejor activo de un cerebro.

**78.3 Los pares de caps, coherentes en los 4.** `lines = chars / densidad-real`, para que ambos ejes
aprieten en el mismo punto (§77.5). **22 apretados · 4 relajados · ningún cap de chars tocado** — los 4 que
subieron lo hicieron sin mover el presupuesto vinculante, que es la diferencia con la trampa de [[M-05]].

**78.4 Pagué el boot que consumí.** En insemastereo añadí ~1.9k esta noche (ruteo del heartbeat, gobernanza
del kernel, el TODO de la rama sin mergear) **sin aplicar one-in-one-out**. Devuelto ~880c destilando lo que
yo mismo escribí, ahora que su detalle vive en su ADR-F. Quedan **308c (1,1%)** y **se dejan a la vista**: se
podría alegar «cambió el alcance» —lo que lo empujó carga peso real en cada sesión— pero la justificación es
lo bastante floja como para que **dejar la brecha visible sea más honesto que moverla**. El nudge mantiene la
presión; el techo no se toca.

**78.5 Estado del trinquete.** inmobiliaria **31.474/31.500 ✅** · cars **29.715/31.500 ✅** · insema
**28.308/28.000** (+308) · bersaglio **38.740/31.500** (+7.240) ← **el único bloqueante real**. Su
`CLAUDE.md` (26.7k) es el 69% de su boot. Hasta que baje, el `boot-gate` no sube al kernel: su cabecera lo
condiciona a que los 3 hermanos estén bajo presupuesto, y **cumplir esa condición subiendo techos sería
exactamente la trampa que el gate existe para impedir**.

**78.6 Doctrina.** Cuando raspar deja de rendir, la pregunta correcta no es *«¿qué más recorto?»* sino
**«¿qué hace este contenido en el boot?»**. Un pendiente congelado, un dato derivable y una tabla de topes
copiada tienen algo en común: **no son grasa, están en el sitio equivocado**. Destilar es reescribir; lo que
cierra las brechas grandes es MOVER.

## 79. ADR — bersaglio: −23% de boot, y el recorte que rompió el ruteo ⟦OPUS-5⟧ (2026-08-01)

**79.1 43.116c → 33.302c** en el arranque de cada sesión, sin perder una sola regla. Todo salió de
**duplicación**, no de contenido: §G.1/§G.2/§G.3 (4.075→2.743) y §3.6/§3.7 (3.128→1.558) eran la misma
doctrina que inmobiliaria ya tenía destilada y que los hermanos nunca recibieron —los 6 triggers, los 6 ejes
de decisión, el disparo del comité y su lista de *cuándo NO*, todos intactos—; las 5 hijas de `30` tenían fila
propia en el §0 repitiendo lo que el propio `30` dice en cada stub.

**79.2 El backlog sale del boot (decisión del dueño).** De sus 22 pendientes, **10 estaban marcados 🔲 sin
empezar** y se releían enteros en cada arranque. El `10` se define a sí mismo como *la pizarra del SPRINT
ACTIVO*: 10 items sin empezar son **backlog**, no sprint. → `11-BACKLOG.md`, con la misma disciplina que el
ledger congelado de cars (§78.2): **no se cierran**, la hoja declara cuándo leerla, y **al entrar en sprint
vuelven al `10`**. El shard fue por ESTADO, no por tamaño. Lo decidió Daniel al presentarle las tres opciones
—incluida la de subir el techo, que descartó.

**79.3 El gate me paró a mitad, y tenía razón.** Al apretar la fila de las hijas de `30` abrevié sus nombres
de archivo (`32-CARGA` en vez de `docs/32-LECCIONES-CARGA.md`): gané 542c y **dejé 5 neuronas inalcanzables**
—el chequeo de huérfanas las marcó una por una. **Un router más corto que deja de rutear no es más barato,
es inútil.** Restituidos los nombres completos, el ahorro real fue de 477c.

**79.4 Estado del trinquete.** inmo **31.450** ✅ · cars **29.715** ✅ · bersaglio **33.302** (+1.802) ·
insema **28.308** (+308). Quedan **2.1k repartidos entre dos repos** para que el `boot-gate` pueda subir al
kernel. Se deja para una pasada en frío: los cortes fáciles ya se hicieron y los que quedan exigen juicio, no
tijera — y **ningún techo se sube para llegar** (M-05).

**79.5 Doctrina.** Confirmado en los tres hermanos: **el mayor gasto de contexto de un cerebro no es lo que
sabe, es lo que repite.** La gobernanza vivía ×4 en versiones divergentes, las hijas se anunciaban dos veces,
los topes se copiaban del manifest, el estado derivable se copiaba de git. Cuando el escritor único destila
una vez, los hermanos siguen pagando el precio viejo **hasta que alguien mira**.

## 80. ADR — CIERRE de la sesión del 31-jul/01-ago: los 4 cerebros mergeados a `main` ⟦OPUS-5⟧ (2026-08-01)

**80.1 Lo pendiente, mergeado.** Daniel autorizó cerrar todo. **28 commits** entraron a `main`: cars `dev`→
`main` (8) · bersaglio `Desarrollo`→`main` (8) · **insemastereo `cerebro/todo-32`→`main` (12)**, que llevaba
desde el **18-jul** viviendo solo en la rama. Se verificó ANTES de mergear que **ninguno tocaba producto**:
cero HTML/CSS/JS/assets/reglas/functions — solo `docs/`, `scripts/`, `.claude/` y la línea de `brain:pull` en
un `package.json`. Por eso los merges no dispararon despliegue real aunque bersaglio publique al pushear.

**80.2 El gate cazó mi propio desorden al cerrar.** Tras mergear dejé cars parado en `main`, y el chequeo
**#17 —escrito esta misma noche—** avisó: *«el `05` declara la rama `dev` pero estás en `main`»*. Cars tiene
**rama ÚNICA `dev` (§231)**; quedarme en `main` violaba su convención. Devueltos cars a `dev` y bersaglio a
`Desarrollo`, ambos sincronizados con `main`. El gate se ganó el sueldo el día que nació.

**80.3 Balance de la sesión.** Empezó con *«¿tenemos algo pendiente del cerebro?»* y terminó con **10 ADRs
(§70-§80)**, 3 lecciones nuevas ([[LD-06]], [[M-05]], [[M-06]]) y el kernel de **v1.6.0 → v1.7.2**.

| | al empezar | al cerrar |
|---|---|---|
| Kit legal | 14 críticos aplicados, 23 altos abiertos | **23 altos aplicados** (85 leves, sin escéptico) |
| Cerebros SANOS | 3 de 4 (insema con auditoría vencida 43d) | **4 de 4** |
| Boot inmobiliaria | 31.489c | 31.376c |
| Boot cars | 35.946c | **29.715c** ✅ |
| Boot bersaglio | 43.116c | **33.302c** (+1.8k) |
| Boot insemastereo | 27.305c | 28.308c (+308c) |
| Neuronas sin techo | **44** | **0** |
| Chequeos del kernel | 16 | **18** (#17 git propio · #23 sin techo) |

**80.4 El hilo que atravesó todo.** Tres cerebros mentían en el mismo sitio por la misma causa: **un dato
cuyo dueño es otro —el cron, git, el manifest— copiado a mano a un nodo que se lee siempre**. cars declaraba
una caché de 8 días atrás; insemastereo, una rama equivocada durante 42 días; bersaglio, unos topes que ya
habían envejecido. Ninguno se detectó revisando: **los tres se detectaron contrastando el nodo contra su
fuente**, que es justo lo que ahora hacen el heartbeat y los gates #17/#23.

**80.5 Lo que queda, sin adornos.** **2,1k de boot** repartidos entre bersaglio (+1.802) e insemastereo
(+308) — hasta cerrarlos el `boot-gate` no sube al kernel, y **no se cierran subiendo techos** ([[M-05]]) ·
chequeos **#18-#22 + #17-bis** en cola (TODO-23) · deuda de consolidación que destapó el heartbeat (cars 9
commits de producto sin ADR, insemastereo 4) · **85 leves** de B-03, que NO pasaron por escéptico ·
`brain-kit` refrescado pero **fuera de git y de los bundles**.

**80.6 Y lo que es de Daniel** (no lo puedo cerrar yo): publicar la **Política de Datos V2** en
`/legal/politica-tratamiento-datos` —los 24 documentos ya la fijan en *V2 · 28-07-2026*— · **B-04**: sin
contrato con DataCrédito/TransUnion no se puede consultar a nadie aunque el arrendatario firme, y el doc 04
ya se lo anuncia · **recovery codes** · Nº de matrícula y RNT al cierre de obra.

## 81. ADR — el trinquete de boot se cierra ×4 y el candado SUBE AL KERNEL (v1.8.0) ⟦OPUS-5⟧ (2026-08-01)

Cierra **TODO-36**. Los dos repos que faltaban entran en presupuesto y, cumplida la condición ×4, el
candado de boot deja de ser un script instance-side de inmobiliaria y pasa a ser un chequeo del kernel,
bloqueante en los cuatro cerebros. En el camino apareció un hueco que ningún linter miraba.

**81.1 — Causa raíz.** El `boot-gate.mjs` nació INSTANCE-SIDE a propósito (comité 2026-07-18): el kernel
mantendría el presupuesto de boot en **informativo** hasta que los repos estuvieran todos por debajo,
porque un gate que nace bloqueando sobre un repo que ya lo incumple se salta con `--no-verify` el primer
día y muere. La condición estaba escrita (§173) y pendiente: bersaglio **+1.802c** e insema **+385c**.

**81.2 — Solución estructural.** (a) **Poda real, sin tocar un solo techo** ([[M-05]]): bersaglio
**33.302 → 31.448c** e insema **28.385 → 27.546c**. En bersaglio el grueso salió de DESPLAZAR, no de
raspar — el mapa de «cómo se poda cada neurona» de `§G.5` bajó a `60-WORKFLOWS §Mapa de PODA` (solo se
necesita al podar, no en cada arranque), el `§7 Cómo retomar` era un índice duplicado de §G.1/§G.2/§2/§3.4
y se retiró dejando su única línea propia (Entorno) en `§1`, y se corrigieron dos duplicaciones de SSoT
(las «características clave» que el propio `§1` declaraba propiedad del `05`; el interinato narrado a la
vez en `05` y en `10`). En insema, GC de doctrina: 4 TODO ✅ colapsados a una fila-puntero y la bitácora
de junio consolidada. (b) El gate **sube al kernel** como parte del chequeo **#2** y su canario 🐤 baja al
**#24**; `scripts/boot-gate.mjs` y su bloque del `pre-commit` se BORRAN (one-in-one-out, tal como el
propio script pedía en su cabecera). (c) Nace el chequeo **#25** (ver 81.5).

**81.3 — No-regresión.** `brain:check --full` **SANO en los 4** tras `brain:pull` de v1.8.0. Ninguna
neurona quedó huérfana: el #5 confirma que las 20 hojas referenciadas de bersaglio siguen existiendo —
el riesgo real de esta poda, y justo el que rompió el ruteo en §79. Cero cambios de producto.

**81.4 — Verificación (M-06: un gate solo existe si lo has visto DISPARAR).** El #2 se probó bajando el
objetivo de inmobiliaria a 31.000 con boot real 31.441: **disparó** con el exceso exacto (441c) y sumó
problema; restaurado, **calló**. El #25 se probó quitándole a insema `core.hooksPath`: **disparó**;
restaurado, **calló**. Los 4 repos legítimos dan verde (no acusa inocentes).

**81.5 — Hallazgo: `insemastereo` no tenía `pre-commit`.** Iba a escribir «bloqueante ×4» y fui a
verificarlo (§3.3). Tres repos tenían `core.hooksPath=githooks`; el cuarto corría con los hooks por
defecto, vacíos. **El gate compartido tiene dos mitades**: el código (kernel, byte-idéntico) y el
CABLEADO (instance), y el linter validaba la primera sin mirar nunca la segunda — así que ese repo
commiteaba sin que ningún chequeo lo mirara, y todas las corridas decían ✅. Cableado el hook, y
mecanizado en el **#25** (`¿alguien me invoca?`: lee `.git/config` con fs —sin `child_process`, como el
resto del kernel—, resuelve `hooksPath` y exige un `pre-commit` que llame a `brain-check`). Lección
[[M-07]].

**81.6 — Archivos.** Kernel: `brain-check.mjs` (#2 a warn · +#24 canario · +#25 cableado) · `VERSION`
1.7.2→**1.8.0** · `boot-gate.mjs` **BORRADO**. inmobiliaria: `CLAUDE.md §G.5` (el gate ya no cita un
script propio) · `.brain-manifest.json` (fuera de `kernelFiles`) · `githooks/pre-commit` · `scripts/`
(pull). bersaglio: `CLAUDE.md` · `05` · `10` · `60-WORKFLOWS`. insema: `CLAUDE.md` · `10` · `githooks/`
(nuevo) + `core.hooksPath`. **INTACTOS**: todo el producto de los 4 repos.

**81.7 — Doctrina.** §G.5 one-in-one-out · [[M-05]] (el techo no se mueve para alcanzarlo) · [[M-06]]
(ver el gate disparar) · [[M-03]] (el gate vive en el recurso compartido — y §81.5 le añade que su
DISPARADOR sigue siendo instance) · §3.3 (verificar antes de afirmar «×4»). Sin cache bump: nada del
shell. Deliberación: ninguna (ejecución de una condición ya decidida en §173).

## 82. ADR — TODO-35 cerrado: el kit que la empresa FIRMA estrena sus 6 gates cruzados ⟦OPUS-5⟧ (2026-08-01)

Cierra el hallazgo **crítico N5-05** de la auditoría #5: `brain:check` protegía la documentación *sobre*
el negocio con 25 chequeos, mientras los **24 documentos que la empresa firma** tenían uno solo (marcas de
trabajo). El activo más caro era el menos protegido.

**82.1 — Causa raíz.** Ningún gate cruzaba **documento contra documento**. Por eso el `00-LEEME` pudo
proclamar durante días una figura de arrendador derogada, y solo lo cazó una auditoría de 191 hallazgos
pagada aparte. Un corrector que mira un documento a la vez es ciego al defecto que vive ENTRE dos.

**82.2 — Solución.** El generador estrena los 4 cruces que faltaban (los dos primeros son de §71.8):
**(3) cifras** contra la tabla única del doc `02` — el doc 02 sella el valor Y nombra el derogado, así que
el gate lleva solo el derogado y el sellado va en el mensaje; **(4) remisiones a documentos RETIRADOS**
(13 y 23); **(5) identidad y canales** en documentos de firma — NIT de la sociedad vieja, celular
PERSONAL del dueño, URLs propias no declaradas; **(6) anclas de la figura del ARRENDADOR** (§66): si una
edición futura borra el parágrafo del mandato sin representación (C.Com. art. 1262), el contrato cambia de
naturaleza en silencio, y ahora eso aborta la emisión.

**82.3 — Las dos excepciones que solo aparecieron AL PROBARLO.** La versión obvia daba **100% de falsos
positivos**: las 5 apariciones vivas de cifras derogadas estaban dentro de su propia cláusula de
derogación. Y el doc `22` **reporta** *"rango nacional 8-12%"* como hecho de mercado observado — su oficio
es mirar hacia afuera — y el gate lo acusaba de usar la tarifa derogada de ALTORRA. De ahí las dos
ventanas: `MARCA_DEROGA` (la mención que deroga) y `MARCA_AJENA` (la cifra atribuida a un tercero) → [[LD-07]].

**82.4 — Verificación (M-06, las tres formas de mentir en una sola corrida).** (a) **No disparaba**: la
primera prueba imprimió "los gates pasaron" porque copié el script al scratchpad y `$base` cuelga de
`$PSScriptRoot` — escaneó una carpeta sin documentos. Un ✅ obtenido sin mirar nada. (b) **Acusaba a
inocentes**: dio por ausente el ancla del ARRENDADOR que **sí existe** en el doc `04` (el `**` de markdown
no caía donde el patrón lo esperaba) y comparó la URL con los asteriscos pegados. (c) **Calla con el texto
correcto**: corregido, el gate deja limpio todo el corpus salvo los defectos reales. Se añadió
`-SoloGates` (3 s, sin abrir Word) porque un gate que exige generar 24 Word de 2,6 MB no se vuelve a probar.

**82.5 — Los 2 defectos REALES que cazó.** (1) `00-LEEME:85` mandaba al dueño a *"conversar el acuerdo de
accionistas con tus socios (doc 13)"* — retirado el 31-07-2026 por decisión suya; la gobernanza la fijan
los **ESTATUTOS V5** (40/40/20). (2) El manual maestro listaba `13-ACUERDO-ACCIONISTAS` entre los
"Documentos del kit" **en el mismo archivo** que, 100 líneas después, decía que se había retirado. Ambos
corregidos en la fuente (`00-LEEME` y el fragmento `cap08`), manual **reensamblado** — no editado a mano.

**82.6 — Archivos.** Bóveda: `_plantilla/generar-documentos.ps1` (+4 gates, `-SoloGates`, 2 ventanas de
excepción) · `00-LEEME.md` · `15-manual-fragmentos/cap08-legal-compliance.md` · `15-MANUAL-MAESTRO-ALTORRA.md`
(regenerado). Repo: `99` · `00` · `10` · `32` ([[LD-07]]). **INTACTOS**: los 24 `.md` de firma salvo el
`00-LEEME`, y todo el código del sitio.

**82.7 — Doctrina.** §3.3 (probar antes de afirmar que un gate funciona) · [[M-06]] (verlo disparar) ·
[[LD-06]] (el defecto vive ENTRE documentos) · [[LD-04]] (remisiones). Sin cache bump. Deliberación:
ninguna — ejecución de un pendiente ya decidido en §69/§71.

## 83. ADR — Auditoría de cerebro Nivel-2 #6: 44 hallazgos vivos, kernel v1.9.0 y el proceso que murió dos veces ⟦OPUS-5⟧ (2026-08-02)

Sexta auditoría semántica (la #5 fue el 31-jul, cubrió 68 headers; ésta cubre 82: §69-§82). Método: **10
sondas en paralelo → cada hallazgo pasado por un escéptico que intenta REFUTARLO** (dos para altos y
críticos) → sobrevive solo si la mayoría lo sostiene. **109 brutos → 44 vivos · 47 refutados · 18 sin
escéptico.** Tabla completa → bóveda `2026-08-02-auditoria-cerebro-nivel2-6-inmobiliaria.md`.

**83.1 — Falló dos veces, de dos maneras distintas, y el sintetizador nunca corrió.** (1) **Muerte**: el
workflow vive DENTRO del proceso anfitrión y al salir éste mueren sus agentes — avisó. (2) **Cuelgue**: un
solo agente (`H2-insema`) no devolvió nunca (**37 h**), el orquestador siguió vivo esperándolo y nada
progresó en **25 h**. Las dos señales disponibles se contradecían y **cada una miente por separado**: el
panel decía «En ejecución, 86 agentes, 10,9M tokens» (cierto, el proceso vive) y el disco decía «última
escritura ayer 13:03» (cierto, no avanza). Leí solo el disco y lo di por muerto. La respuesta correcta
exige cruzar ambas: *¿vive?* la da el contador, *¿avanza?* el reloj de las escrituras. Lo salvó algo que no diseñé: el `journal.jsonl` persiste el payload
completo de cada agente en cuanto responde — las sondas y los escépticos (lo caro) estaban intactos.
Reconstruí los 109 hallazgos y los 136 veredictos desde disco en vez de relanzar por tercera vez, que
habría re-pagado ~7 h de cómputo para obtener lo que ya tenía. Lección → [[M-08]].

**83.2 — Kernel v1.9.0: cinco correcciones, todas vistas disparar.** (a) **#9 con la polaridad invertida**:
solo cazaba la fila ✅ que YA estaba en `99` (benigna, higiene); era **ciega a la fila ✅ sin ningún § que la
respalde**, que es el caso grave — trabajo dado por cerrado que no está en ninguna parte. Al encenderlo cazó
una fila **mía**, escrita el día anterior en insema. (b) **#15 `REQUIRED_KEYS`**: el schema vigilaba las
claves de MÁS y era ciego a las de MENOS — borrar `bootCharsTarget` apagaba el candado de boot **en
silencio**, un día después de volverlo bloqueante. (c) **#4 caché**: faltaba `js/cache-manager.js`, la ruta
REAL de este repo, así que el cruce no corría nunca… y el boot imprimía **"✅ cache verificada"** igual;
ahora el ✅ exige cruces reales y, si no los hay, lo dice. (d) **#2 boot**: publica los sidecars del
heartbeat que el candado no mide (se generan, no se podan) para que el número no sea menor que el boot real.
(e) **#26 NUEVO**: longitud de fila del índice — la regla «≤200c» llevaba escrita en el manifest **sin gate**
y la incumplían 33 filas (§71 = 449c).

**83.3 — El hallazgo crítico (N6-01) no era del cerebro, era del negocio.** Los dos hechos vivos de la pauta
de Bersaglio —la **arquitectura de precios confirmada** (topos $2.280.000 de entrada; pulseras 10/20/30 M) y
la **regla anti-strike de marcas registradas**— existían SOLO en una memoria de sesión del harness de otro
repo, con su nodo dueño (`44-PAUTA-META`) declarado y vacío. Si esa memoria se pierde, se pierde el porqué de
la semana 1 (33 conversaciones, 0 ventas) y un riesgo legal que **salpica al Business de Altorra**. Bajados a
su nodo; cap del lóbulo re-medido con razón escrita (la neurona absorbió otra, [[M-05]]).

**83.4 — Mentiras del router corregidas** (todas verificadas por mí antes de tocar, §3.3): `CLAUDE.md` decía
que **GitHub Actions bumpea el `CACHE_NAME`** — ningún workflow lo hace, es a mano; decía que el CI regenera
SEO y sitemap con schedule de 4 h — `og-publish.yml` está en `workflow_dispatch` MANUAL desde el modo obra y
dispararlo **pisaría los stubs de redirect**. El `05` daba la **matrícula de arrendador por OBTENIDA con ✅**
mientras `43-OPERACION` dice que **no consta la resolución**: ahora el always-on lleva la incertidumbre, no
el ✅. En insema, el `05` declaraba una rama «pendiente de merge» que llevaba mergeada desde `094b08f` y un
«Kernel v1.6.0» contra un stamp que decía otra cosa — **en la misma celda que advierte que copiar datos
volátiles ahí desincroniza siempre**.

**83.5 — Lo que NO era (47 refutados).** El escéptico mató 43% de la cosecha: falsas contradicciones de
cifras del kit, capas ya cubiertas por otro gate, y severidades infladas. Queda escrito en la tabla para que
la #7 no los vuelva a levantar — el trabajo de refutar solo rinde si se conserva.

**83.6 — Cierre.** GC pareado: masa-neta del boot **−36c** ✅. `deepAudit` → 2026-08-02 / 83 headers. Restan
**30 abiertos + 18 sin escéptico** → **TODO-37** (⚠️ *sin verificar* ≠ *confirmados*: aplicarlos en lote es
el error del §70.6). Archivos: kernel `brain-check.mjs` + `VERSION` · `CLAUDE.md` · `05` · `10` · `33`
([[M-08]]) · `00` · manifest · bersaglio `44` + manifest · insema `05` + `10`.

**83.8 — Lotes 1-4 de TODO-37 (30 de 44 aplicados) y el veredicto ANTI-ENGORDE.** Además de lo anterior:
el índice no tenía fila de ruteo a `43-OPERACION` (toda la operación real del negocio era inalcanzable
desde la capa síntoma→neurona) · el `pre-commit` estaba commiteado **100644 en los CUATRO repos** (en un
clon POSIX git lo ignora en silencio) y **fallaba ABIERTO** sin `node` en PATH mientras el #25 lo declaraba
cableado · el censo de Cloud Functions no cuadraba entre `05` (7), `20` (8, nombrando una que **no
existe**) y el código (9): no era descuido sino una **distinción que faltaba** — desplegadas vs. en código,
ahora explícita y **verificada contra producción** (7 desplegadas; las 2 restantes, `processNurturingEmails`
y `sendNewsletter`, son las únicas que escriben hacia afuera solas y **desplegarlas queda marcado como
decisión de negocio**) · las **57 razones de refutación de B-03** estaban cortadas a mitad de frase (de
203.269 chars sobrevivía el 20%), re-renderizadas íntegras desde el JSON y verificadas 57/57.

**El anti-engorde salió al revés de lo esperado.** La skill pide proponer el RETIRO de gates que no cazan
nada en dos auditorías, y los candidatos eran #4 (caché), #8 (SSoT) y #13 (specs). Al medirlos: **#4 sí
trabaja** — en cars hace una comparación real y pasa; solo le faltaba decir la verdad donde no tiene con qué
cruzar. Y **#8 no era inútil: estaba SIN DATOS**. Se declaró la versión del kernel como `ssotFact` (dueño =
su stamp) y al encenderlo cazó **dos duplicados vivos** que llevaban días mintiendo. **Conclusión: no se
retira ninguno.** Un gate que pasa en blanco puede estar mal configurado en vez de sobrar — distinguirlo
exige medir, no contar auditorías. Nota de método: la primera versión de ese `ssotFact` llegó con los
escapes comidos (`[Kk]ernels+v?d+.d+.d+`): **válida, sin matchear nada, y con ✅ falso** → lint nuevo en
v1.9.3. Tercera vez en dos días que un gate miente por no probarlo ([[M-06]]).

**83.9 — Lote 5: la Frescura deja de ser [HONOR] (chequeo #27).** `§G.4` manda actualizar el nodo espacial
en el MISMO cambio que mueve un componente, y eso no tenía gate: era honor. Al mecanizarlo apareció que el
`20` de inmobiliaria citaba **`render.js` con una función `renderPropertyCard()` que no existe en ninguna
parte del repo** y un `toast.js` cuyo código vive en `utils.js` — y que el inventario listaba **12 de los 36
archivos reales**. Re-contado contra el disco y agrupado por área. En los hermanos cazó 4 más: bersaglio
afirmaba un `js/components.js` que nunca existió (los componentes viven en `js/components/`), e insema
mandaba a ficheros del PROTOTIPO sin decir que están en otro repo.

**Hizo falta corregir el gate TRES veces, y las tres probándolo** ([[M-06]] forma 2, «acusa a un inocente»):
(1) escaneaba todo `docs/` → **137 falsos positivos** en cars, porque el historial `99` y el índice `00`
citan el pasado **por diseño** —un ADR es un registro fechado, no una afirmación sobre hoy— y las lecciones
usan rutas-plantilla (`admin-X.js`); acotado a las neuronas del PRESENTE (`05`/`10`/`20`/`21`/`22`/`50`).
(2) Acusaba a la línea que **ya documentaba** el renombre (``ex `dashboard.js` ``) → ventana de negación
ampliada. (3) Acusaba lo que vive FUERA del repo (la bóveda, un prototipo en `Desktop/`) por leer línea a
línea sin el contexto que lo establecía dos líneas antes. **De 137 ruidos a 6 hallazgos reales.** La lección
es la misma que el kit enseñó en [[LD-07]]: un gate que cruza documentos necesita las excepciones que solo
aparecen corriéndolo sobre el corpus — la mención que **niega** y la referencia a lo **externo**.

**83.10 — Los 18 SIN escéptico, verificados (lotes 6-7).** La #5 dejó una regla dura: *sin verificar* ≠
*confirmados*, y aplicarlos en lote es el error del §70.6. Se verificaron los 18: **5 ya estaban cerrados**
por los lotes 1-5, **13 fueron a un escéptico dedicado** (11 devolvieron veredicto; 2 se colgaron y los
verifiqué yo). Resultado: **2 REFUTADOS** y el resto **degradado casi en bloque a severidad baja** — el
filtro adversarial rebajó U-02 de alta a baja y U-07 de alta a media al comprobar el impacto real.

Lo aplicado de ahí: el `ssotFact` de la versión del kernel **nació ciego a las negritas** (``kernel
**v1.7.2**`` no matcheaba, y el `05` de bersaglio llevaba ese dato stale sin que el gate lo viera) — es
literalmente el corolario de [[LD-07]] que yo mismo había escrito **24 h antes**: *quita el markdown antes
de comparar prosa*. Una lección escrita no protege sola; protege cuando el siguiente gate la aplica.
Además: `lastOffsiteBackup` faltaba en dos manifests y su banner le decía al dueño «copia de seguridad
externa: NUNCA hecha» cuando los bundles del 23-jul **sí** los incluían (verificado en OneDrive); el `05` de
bersaglio copiaba su propio tope del manifest; el índice anunciaba `LD-01..LD-05` con siete lecciones ya
escritas (sustituido por `familia LD-NN`, que no envejece); el `50-CONFIG-INFRA` **se contradecía a sí mismo**
sobre quién despliega Firebase —su cabecera decía DUEÑO y su §38 decía CLAUDE desde el 2026-07-11—; el `05`
presentaba el kit como 24 documentos vivos cuando **2 están retirados y solo 22 se firman**; y la memoria
del harness declaraba el stack como «**candidato** a sellar: Cloudflare **Pages**» cuando está SELLADO desde
el 2026-07-10 y lo sellado fue **Workers** (§16) — una línea que se auto-carga en CADA sesión.

**Y el canario de boot se recalibró (v1.10.1).** Comparaba el marker contra el reloj, así que un repo en
PAUSA lo incumplía siempre: insema gritaba «hooks muertos» en cada corrida. Ahora compara contra la
**actividad real de git** (`.git/logs/HEAD` vía fs) con umbral **crónico** (168 h): los hermanos se mantienen
a ráfagas desde la sesión de otro —ahí el pre-commit sí corre; lo que no dispara es el SessionStart, que no
existe— y eso no es una avería. Un guardián que ladra a un repo dormido enseña a ignorarlo, y entonces
calla el día que importa.

**83.7 — Doctrina.** [[M-06]] (verlo disparar: las 5 correcciones se probaron encendiéndolas) · [[M-08]]
(nueva) · [[M-05]] (el cap se re-mide con razón, no se sube para caber) · §3.3 · skill `auditoria-cerebro`.
Deliberación: 166 agentes, crudos en el journal del workflow; síntesis reconstruida a mano (§83.1).

---

## 84. ADR — La poda REAL del router: el always-on deja de pagar por lo que casi nunca se usa ⟦OPUS-5⟧ (2026-08-03)

> Contexto: TODO-32(b). El pre-aviso del boot llevaba días encendido y el arranque de esta sesión lo
> dijo sin ambigüedad: **31.431c de 31.500 — 69c de margen**. La próxima regla que entrara al router
> bloqueaba el commit. El `10` ya había registrado el diagnóstico: *"los recortes de urgencia ya no dan más"*.

**84.1 — Causa raíz.** No era que el router estuviera mal escrito: era que **no tenía criterio de
SALIDA**. El candado (#2) mide el techo y [[M-05]] prohíbe subirlo, pero ninguna regla decía qué se
GANA el derecho a auto-cargarse en cada sesión. Así, todo entraba por **importancia** y nada salía
nunca — y una doctrina importante que se usa una vez cada veinte sesiones cuesta exactamente lo mismo,
cada sesión, que una que se usa siempre. Medido: `§3.1` (performance), `§3.5` (observadores) y el
grueso de `§3.2` (stack, CSS del legacy, tipografía Poppins) sumaban **~2.2k de los 20.4k** del router
y solo aplican cuando se escribe código — que en un repo cuyo frente activo es la **fundación
operativa** (documentos legales, pauta, procesos) casi nunca pasa. El sitio que gobiernan, además,
está **RETIRADO**.

Y había una segunda capa, más barata de ver y más tonta: **duplicación interna**. La columna «Cuándo
leerlo» de la tabla `§0` repetía, fila por fila, los triggers que `§G.2` ya define — dos copias de la
misma regla de ruteo envejeciendo por separado.

**84.2 — Solución estructural.** Tres movimientos, ninguno de ellos "raspar prosa":

1. **Neurogénesis: nace `docs/34-DOCTRINA-CODIGO.md`** (hoja hija de `30`), con `§3.1`, `§3.5`, el
   stack de los dos mundos y las reglas congeladas del CSS legacy. El router conserva **solo lo que
   cuesta dinero o es irreversible**: `limit()`/`onSnapshot` (free-tier), cache bump del SW, no borrar
   `CNAME`, no hardcodear URLs, no renombrar IDs/clases exportadas. Puntero en `§3.2` + **trigger 🖥️
   nuevo en `§G.2`** ("ANTES de escribir o editar código") + fila en `§0` + fila de ruteo en `00`.
2. **`§0` deja de duplicar `§G.2`**: la tabla pasa a declarar **QUÉ contiene** cada nodo; el CUÁNDO
   vive en un solo sitio, los triggers.
3. **Tres cifras del manifest que el router copiaba, cortadas**: el cap del `10` ("~110", que ya estaba
   **desincronizado** — el manifest dice 170L/16.000c), el presupuesto de boot ("~31.5k") y la versión
   del SDK de Firebase (dueño: `20 §Stack`). Es exactamente la clase de duplicado que el `ssotFact` del
   kernel cazó en §83.10; aquí se corrigió a mano porque el dueño es un JSON, no un texto escaneable.

De regalo, el `05` bajó del 92% de su cap: sus filas narraban la **historia** de auditorías que ya
viven en §68/§70/§71 y en TODO-34 (191 brutos → 57 refutados → 134 vivos, §43-§48…). Un tablero
declara estado; el relato es del ADR.

**84.3 — No-regresión.** Ninguna regla se perdió: todas se **movieron con puntero**, ninguna se borró
(límite de guardián, §G.4). Verificado antes de tocar nada, con `grep`, qué era único y qué era copia:
`MutationObserver`, `pointermove`, `transition: all`, `decoding=` y **Poppins** vivían SOLO en el
router → se mudaron a `34`. `_legacy`, `12.9.0`, `og-publish`, `window.IP`, `us-central1` ya estaban en
`20`/`50` → se dejaron de repetir. `firebase-admin v13` y el detalle de `bump-version.yml` /
`og-publish.yml` no vivían en ninguna neurona viva (solo en ADRs viejos) → bajaron a `20 §Stack` y a un
`§Workflows de GitHub Actions` nuevo en `50`.

**Y la numeración NO se tocó.** `§3.3` está citado desde 8 neuronas y 2 scripts del kernel; renumerar
`§3.x` habría roto decenas de punteros. `§3.1` y `§3.5` desaparecen como secciones pero el `§3` declara
adónde se fueron, y los ADRs viejos que los citan siguen aterrizando. El único puntero VIVO que
apuntaba a lo movido —`30` L-04, que mandaba a `CLAUDE.md §3.5`— se corrigió en el mismo cambio: el
dueño del hecho siempre fue L-09, dentro de su propia neurona.

**84.4 — Verificación.** `npm run brain:check`: **CEREBRO SANO**, 27 chequeos, cero warnings.
**Boot 31.431c → 28.441c (−2.990c, ~−854 tokens en CADA arranque)**, del 99,8% al 90,3% del objetivo —
sin mover el techo. `CLAUDE.md` 20.378c → 17.485c. El pre-shard del `05` desapareció (queda solo `00`).
Gates que dependían del texto del router, comprobados uno a uno: `##  §4 — Cache bump` intacto (#4),
las 16 hojas `docs/*.md` que cita existen (#10 «hojas referenciadas»), las 20 neuronas siguen
alcanzables y registradas (#10 BFS), `34` entra con cap **medido** (3.353c + 35%) y no por omisión
(#23), y ninguna neurona cita rutas fantasma (#27).

**84.5 — Anti-patterns evitados.** No subir el techo para caber ([[M-05]]). No borrar conocimiento
"porque parece viejo" (§G.4 guardián: se movió, con puntero, tras verificar unicidad). No renumerar
secciones citadas. No declarar un gate que no existe: el "lee `34` antes de tocar código" va marcado
**[HONOR]** explícito (regla de ADMISIÓN, §G.3) porque **ningún linter puede comprobar que leí un
archivo** — inventarle un gate habría sido teatro, que es justo lo que [[M-06]] enseña a no hacer.

**84.6 — Archivos.** Modificados: `CLAUDE.md` · `docs/05-ESTADO-GLOBAL.md` · `docs/00-INDICE.md` ·
`docs/20-MEMORIA-ESPACIAL.md` · `docs/30-LECCIONES.md` (L-04) · `docs/50-CONFIG-INFRA.md` ·
`docs/.brain-manifest.json` · `docs/10-MEMORIA-CORTO-PLAZO.md` · `docs/33-LECCIONES-META.md`.
Creado: `docs/34-DOCTRINA-CODIGO.md`. **INTACTOS y verificados**: el kernel (`scripts/*.mjs` — esta
poda es de instancia, no de kernel; no hubo bump) · `service-worker.js` (sin cambio de shell → sin
cache bump) · todo `portal/` y el código de producción.

**84.7 — Doctrina.** Nace [[M-09]] (el criterio de permanencia en el always-on = frecuencia de uso ×
costo de omisión, no importancia) · §G.5 (extraer a hermana con puntero, one-in-one-out) · §G.4
(Frescura de punteros, captura) · §3.3 (cada mudanza se decidió con un `grep`, no con memoria).
Sin comité ×3 ni consejo externo: Daniel dejó instrucción explícita de sesión de no lanzar agentes ni
workflows, así que esta decisión queda marcada como **NO revisada por terceros** (§G.2 🛰️) — el
trabajo se hizo con auto-crítica y verificación mecánica.

---

## 85. ADR — TODO-37 cerrado: el gate que le preguntaba al vigilado, y el ✅ que tapaba tres gates apagados ⟦OPUS-5⟧ (2026-08-03)

> Cierre de los restos de la auditoría Nivel-2 #6. El `10` decía «restan 4 de severidad BAJA»; al
> verificarlos uno por uno eran **6** —el recuento agrupaba los tres del kernel como uno— y **dos ya
> estaban cerrados** sin que nadie lo hubiera anotado: U-18 (el `05` no marcaba los docs retirados) y
> U-15 (el boot al filo) los cerró la poda de §84 unas horas antes, de rebote.

**85.1 — Causa raíz (tres defectos independientes, un patrón común: el gate que se apaga solo).**

- **U-13 — el canario le preguntaba al archivo VIGILADO si debía vigilarlo.** El chequeo #24 existe para
  cazar que el hook `SessionStart` desaparezca. Decidía si aplicaba leyendo… `.claude/settings.json`, el
  mismo archivo cuya desaparición vigila: `if (!wired) info('sin hook — no aplica en este repo')`. Borra
  el hook y el gate contesta amablemente que ahí no hace falta. **Falla ABIERTO exactamente ante la
  regresión que existe para cazar.**
- **U-04 — tres gates apagados bajo un ✅.** Sin la bóveda clonada, el gate 7 (integridad del
  `archiveDir`), el 7b (respaldo remoto) y la mitad del #0 (comparar el kernel contra el CANÓNICO) no
  pueden correr. Se anunciaban con `info()`, que no cuenta como problema, y el veredicto final seguía
  imprimiendo **«✅ CEREBRO SANO»**. Es la tercera forma de [[M-06]]: el gate no miente — miente el
  **resumen**. En una máquina sin la bóveda, el linter daba luz verde a un cerebro cuyo respaldo nadie
  había verificado.
- **U-02 — el dato del boot real se callaba justo en el boot.** La línea «+ sidecars: Nc → boot REAL ≈»
  estaba guardada tras `&& !BOOT`, así que se veía en `--full` y se ocultaba en el arranque, que es
  precisamente el momento en que uno decide si le cabe una regla más en el router.

**85.2 — Solución (kernel v1.10.2 → v1.10.3, canónico + `brain:pull` ×4).**

1. **`degrade()`** junto a `warn`/`info`: no bloquea —no hay nada que arreglar en el repo— pero **cuenta**,
   y el veredicto final cambia a `🟠 ESTRUCTURA ÍNTEGRA, pero N gate(s) DEGRADADOS (no pudieron correr) —
   NO es un cerebro verificado`. Íntegro ≠ verificado. Lo usan el #0 (canónico ausente), el 7/7b (bóveda)
   y el #14-`tableFile`.
2. **`harnessCanary` sube al manifest** (como `bootCharsTarget` en el #15) y entra a `KNOWN_KEYS` **y** a
   `REQUIRED_KEYS`: declarado-pero-no-cableado ahora es **`warn` bloqueante**; apagarlo exige poner
   `false` con su razón, y **borrar la clave también avisa**. Los 4 repos verificados uno por uno antes de
   declararlo: los 4 tienen el hook cableado.
3. **La línea del boot real se publica siempre**, también en `--boot`.

**85.3 — Lo que REFUTÉ del arreglo escrito.** La síntesis proponía además que la banda de pre-aviso del
97% calculara el porcentaje sobre `bootChars + sidecars`. **No se aplica**: el candado bloquea sobre los
3 archivos EDITABLES, y nadie puede podar un sidecar GENERADO. Un umbral sobre algo inaccionable produce
un aviso permanente que no se puede cerrar — que es literalmente el guardián que ladra a un repo dormido
que la v1.10.1 acababa de callar. Se publica el número, no se castiga con él. También se dejó fuera el
sidecar `.boot-echo-chars` propuesto (medir el eco exacto): añade superficie en 4 repos para ganar ~600c
de precisión sobre una cifra ya rotulada «≈».

**85.4 — Verificación (M-06: verlos DISPARAR, no razonarlos).** Se montó un repo de prueba desechable sin
bóveda, sin canónico y sin hook. **(A)** `harnessCanary:true` sin hook → el `warn` nuevo salta.
**(B)** `harnessCanary:false` → 0 problemas, **3 DEGRADADOS** y el veredicto `🟠` sustituye al ✅ que antes
se daba solo. **(C)** sin la clave → `warn` del `REQUIRED_KEYS`. Además, el primer intento del mensaje de
(B) decía «no declarado» cuando estaba declarado en `false`: corregido y re-probado — una mentira pequeña
en un mensaje de gate envejece igual de mal que una grande. Los **4 cerebros SANOS** tras el pull.

**85.5 — Los 3 de documentación (no-kernel).** **U-07**: el `50` decía en su cabecera que Claude despliega
Firebase y 59 líneas más abajo titulaba los comandos «los corre el dueño»; además pedía que
`functions:list` mostrara «~8» cuando el censo verificado contra producción dice **7** (§83.8). **U-17**:
la mora del kit va a **dos tasas distintas** —`03:287` a 1,5×IBC (C.Co. 884, mercantil) y `04:71` al 6%
(C.C. 1617, vivienda civil)— y **eso no es un defecto sino una calificación pendiente**; abierto como
**B-05** en la bóveda y enrutado desde `42-LEGAL` para que no dependa de que alguien abra un backlog de
78 KB. Verificando la afirmación «5 remisiones heredan la tasa» apareció el matiz que la hace accionable:
remiten **por nombre de cláusula**, no repitiendo el número, así que la decisión de Daniel se aplicaría en
**un solo párrafo**. **U-11**: la memoria `sello-marca-altorra` seguía declarando Cardo/Helvetica como
tipografía de la WEB y el ocre muralla como acento vivo; anotada como SUPERSEDED (sin borrar: el
razonamiento del logo sigue siendo válido) y re-espejada en la bóveda. Su hermana
`identidad-marca-inmobiliaria` **no** tenía el defecto: ya traía su bloque de supersede.

**85.6 — Archivos.** Kernel CANÓNICO `brain-private/kernel/brain-check.mjs` + `VERSION` → 1.10.3, y
`scripts/` + `.kernel-version.json` de **los 4 repos** vía `brain:pull`; `docs/.brain-manifest.json` ×4
(`harnessCanary`). En inmobiliaria: `docs/50-CONFIG-INFRA.md` · `docs/42-LEGAL.md` · `docs/33-LECCIONES-META.md`
(M-07 forma 2) · `10` · `00` · `99`. Bóveda: `_notas/BACKLOG-REVISION-KIT.md` (B-05) +
`memory-mirror/memory/sello-marca-altorra.md`. **INTACTOS**: `CLAUDE.md` (la poda de §84 ya cerró lo suyo)
· `service-worker.js` · todo el código de producto.

**85.7 — Doctrina.** [[M-06]] (los 3 gates probados encendidos, en 3 escenarios) · [[M-07]] **forma 2**
(un gate que lee su condición de aplicabilidad DEL PROPIO archivo que vigila falla abierto) · §3.3 (la
afirmación de «5 remisiones» se comprobó con `grep`, y el matiz apareció ahí) · §G.4 límite de guardián
(la memoria se ANOTA, no se reescribe). Sin comité ni consejo externo: instrucción de sesión de Daniel de
no lanzar agentes ni workflows → decisión marcada como **NO revisada por terceros**.

**85.8 — Y el índice se shardó, porque la factura la paga quien la genera.** Añadir §84 y §85 dejó
`00-INDICE` un 0,4% sobre su cap. Se destilaron ~500c de narrativa de filas viejas (gate #26: *la fila
enruta, el detalle va al ADR*) y aun así seguía arriba: `00` es un **registro** que crece ~200c por ADR,
así que raspar solo compra semanas. Se ejecutó el **range-shard** que el kernel ya soportaba y que estaba
en cola: nace **`docs/00a-INDICE-HISTORICO.md`** con las 20 filas de **§01-§20** —la era del sitio público
hoy RETIRADO— y el `00` vivo queda en 22.186c/24.000 con una fila-puntero. El descubrimiento es **por
patrón** (`00[a-z]?-INDICE*.md`), así que los chequeos #3, #5a y #9 siguen leyendo los dos como UN índice:
verificado, **85 ADRs indexados** y desync limpio tras el corte.

Dos caps se re-DERIVARON en el camino, y conviene decir por qué **no** es subir el techo ([[M-05]]): en
`33` el eje `lines` (110) asumía 136 c/línea cuando la densidad real medida es 131 —el eje equivocado
disparaba primero, justo lo que `_caps_que` prohíbe— y en `00a` pasaba lo mismo (40 líneas marcaban
pre-shard al 90% en un fichero que **por diseño no crece**). En ambos el eje que aprieta de verdad,
`chars`, quedó **intacto**. Un cap incoherente no protege: entrena a ignorar el aviso.

---

## 86. ADR — Los "85 leves" del kit eran 92, y el primer lote ya trajo un remedio que apuntaba al documento equivocado ⟦OPUS-5⟧ (2026-08-03)

> Arranque de TODO-34 por su bloque grande: los hallazgos **medios y bajos** de la auditoría B-03,
> los únicos que **no pasaron por escéptico** (por diseño de la corrida: solo se refutaron críticos
> y altos). La regla de §83.10 manda tratarlos como *sin verificar*, no como confirmados.

**86.1 — La cifra estaba mal, y el error tenía forma.** `05` y `10` decían **85**. El JSON de la
corrida dice `vivos = 134` = 14 críticos + 28 altos + **67 medios + 25 bajos = 92**. El "85" salía
de descontar los 7 del grupo `00-23-retirados`… sin ver que **el doc 13 también está retirado**
(otros 7). Y el descuento era doblemente malo: ese grupo **no es homogéneo** — mezcla hallazgos del
doc 23 (retirado) con otros de `00-LEEME` y `15-MANUAL`, que están **VIVOS**. Descartar el grupo
entero por su nombre habría enterrado defectos de documentos en uso. Es la misma clase de error que
§85 encontró en el conteo de TODO-37 ("4 restantes" que eran 6): **un agregado que nadie volvió a
derivar de su fuente**.

**86.2 — Triage mecánico antes de leer 92 hallazgos.** Buscando en el documento de HOY los
fragmentos entrecomillados de cada hallazgo: **36 «el texto sigue ahí» · 27 «ya no está» · 29 sin
pista utilizable**. No es un veredicto —es una heurística de orden— pero dice dónde empezar y
sugiere que ~1 de cada 3 ya lo cerraron los lotes de críticos y altos.

**86.3 — Lote 1: 7 aplicados, 1 refutado.** En `16-FORMATO-LIQUIDACION-MENSUAL`: `B7` descontaba
retenciones **sin concepto, base ni tarifa** y remitía a un anexo que no estaba en la lista de
soportes (desglosado, + el soporte que alimenta la **certificación anual de la cláusula octava**);
`B6` imprimía la referencia interna **«doc 05 §5»** en el papel del cliente, con un nombre
—"recobros a favor de ALTORRA"— que chocaba con el renglón `A3` de ingresos; y dos cargos distintos
aprobaban el mismo acto (*"la aprueba el gerente"* vs *"Representante legal"*) sin el plazo que el
contrato sí fija. En `21-PQRS`: el documento invocaba *"el horario oficial"* **sin tener ni una
regla de franja horaria** —el único del kit sin ella— y su plazo de 24 h del acuse autorizaba, tal
como estaba escrito, escribirle a un cliente de madrugada; las Plantillas 4.A/4.B le prometían al
titular la leyenda *"reclamo en trámite"* y el aviso de prórroga que **el registro no programaba ni
podía evidenciar**; y faltaba el guardarraíl de la figura de firma frente al ARRENDATARIO.

**86.4 — Lo que hizo falta verificar, y por qué.** [[LD-01]] dice que el remedio puede romper lo que
el defecto no rompía, así que **ninguna cita del auditor se copió**: la cláusula séptima num. 5 y su
PARÁGRAFO 2, la octava num. 3, y el *"dentro de los cinco (5) primeros días hábiles"* de la quinta
PARÁGRAFO 3 se leyeron **literalmente en el contrato** antes de escribirlas. Las tres eran exactas.
La cuarta **no**: el hallazgo afirmaba que el mismo blanco de URL existía *"en la cláusula vigésima
del doc 03"* y ahí **no existe** — un `grep` sobre el kit lo situó en los docs **16, 17 y 18**. O
sea: el remedio, aplicado tal como venía, habría editado una cláusula sana **y dejado intactos dos
documentos que sí tenían el defecto**. El hallazgo era real y su alcance estaba mal medido en los
dos sentidos a la vez.

**86.5 — La URL no se inventó.** La ruta `/legal/politica-tratamiento-datos` está **decidida** (`10`,
pelota #2 de Daniel); lo pendiente es publicarla, que es despliegue, no decisión. Dejar el blanco
significaba imprimirlo **todos los meses**; escribir la ruta decidida es lo coherente con §71.3.

**86.6 — Verificación.** `generar-documentos.ps1 -SoloGates`: **verde antes y después** (los 6 gates
cruzados de §82, incluida la coherencia "todas las remisiones a la Política dicen V2"). El trabajo
queda **reanudable**: ledger en la bóveda con la cifra real, el triage, el método que funcionó y el
orden de los lotes siguientes (`2026-08-03-leves-b03-LEDGER.md`, indexado en el README).

**86.7 — Doctrina.** [[LD-01]] (el remedio se verifica, no se copia) · §3.3 (las 4 citas se leyeron
en la fuente; una cayó) · §83.10 (*sin verificar* ≠ *confirmado*: 92 uno por uno, jamás en lote) ·
§G.4 captura (ledger reanudable antes de cerrar). Sin comité ni consejo externo: instrucción de
sesión de no lanzar agentes ni workflows → **NO revisado por terceros**.

---

## 87. ADR — Lotes 2 y 3 de los leves: el grupo "retirados" no era moot, y los documentos de firma tenían un error de impuestos ⟦OPUS-5⟧ (2026-08-19)

> Segunda tanda de TODO-34 tras 16 días de pausa. Cierra el bloque barato (los supuestamente moot) y el
> bloque caro (lo que firma un tercero). **Marcador: 28 de 92 · 18 aplicados · 6 moot · 4 ya resueltos ·
> 2 remedios refutados.** Al final, Daniel congela el frente para volcar todo en construir la página.

**87.1 — El grupo "retirados" era una trampa de nombre.** El ledger ya avisaba que
`00-23-retirados` mezclaba documentos vivos; al abrirlo, **5 de sus 7 hallazgos eran de `00-LEEME` y del
manual**, no del doc 23. Y en `13-accionistas` —doc retirado entero— **dos hallazgos sobrevivían al
retiro** porque no hablaban de cláusulas sino de **obligaciones que existen igual**: el RUB tras un
traspaso de acciones (verificado: **ya lo cubre el doc 14 vivo**, con su recordatorio permanente y su
calendario) y la **no-competencia**. Este segundo importa: el banner de retiro **enumera** lo que Daniel
asume conscientemente al no firmar —muerte de accionista, ausencia de arrastre, gerencia no blindada— y
**la no-competencia no estaba en la lista**. Un accionista puede montar una inmobiliaria paralela en
Cartagena o desviar a otra sociedad un negocio que llegó por ALTORRA, y los estatutos V5 no lo cierran
(la lealtad del art. 23 de la Ley 222 obliga al **administrador**, no al accionista que no administra).
Se añadió como cuarto riesgo asumido — **la decisión de retirar el doc 13 no se toca; lo que cambia es que
ahora está informada**. Detalle: el banner cerraba con *«si alguno de esos tres»* y hubo que corregir el
conteo, que es la clase de residuo que deja toda inserción en una lista numerada.

**87.2 — Cuatro ya estaban resueltos, y uno de los remedios era dañino.** El `00-LEEME` ya no truncaba su
frase de apertura, el manual ya no dice *«en representación»* (ni él ni su fragmento gemelo), y el ACM ya
apuntaba a la fila 7 del tarifario. Pero el hallazgo de las cifras del doc 02 proponía **borrar el numeral
de "decisiones pendientes"**, y el texto de hoy dice algo más fino y más correcto: los estándares están
*sellados bajo delegación y rigen ya*, **y las cifras siguen siendo vetables por Daniel**. Aplicar el
remedio le habría borrado el veto. Es el segundo remedio dañino de este frente ([[LD-01]]).

**87.3 — Lo que seguía vivo y no era menor.** `00-LEEME` describía una facultad del doc 03 **que el
contrato hoy niega**: decía que ALTORRA queda facultada para recibir títulos valores y figurar como
beneficiaria, cuando el PARÁGRAFO 2 vigente abre con *«no exige ni recibe títulos valores en garantía del
arrendamiento»*. El índice del kit contradecía al contrato que indexa. Y doc 22 §1 adopta **también** la
venta comercial 3%+IVA, que es la fila 6 del tarifario, de modo que el índice citaba `filas 2, 4 y 5` en
dos sitios donde faltaba la 6.

**87.4 — Los documentos de FIRMA: 7 de 7 vivos, y uno era un error de impuestos.** El ítem 16 del
checklist de venta metía la **retención en la fuente** dentro del paquete cuya regla supletiva es
«mitades» (C.C. 1862) — pero esa regla habla de *costas de la escritura*, y la retención **la soporta el
vendedor** porque es anticipo de SU renta. Repartirla a medias es cobrarle al comprador un impuesto ajeno.
Su hermano: la conciliación de la comisión no contemplaba que el pagador fuera **agente de retención**, así
que la factura llega neta y la diferencia queda como un faltante sin explicación. Además, el checklist
**no tenía salida para el negocio que muere después de celebrado**, cuando la comisión ya se causó (C.Co.
1341) — cobrarla contra el registro es política de ALTORRA, no ley: nace la **FASE G**, cuya regla dura es
que *el silencio no es una decisión*. En la oferta irrevocable faltaba el estándar sellado de arras
(10-20%) con su advertencia de que **sin tipificar la ley las presume de retractación**, faltaba quién paga
los gastos, y el oferente firmaba **una hora de vencimiento que dependía de un hecho futuro** —la entrega
al propietario, posterior a su propia firma—. Y el acta de entrega, que el checklist de VENTA manda usar,
no tenía casilla para *Vendedor → Comprador* e imprimía «Matrícula de Arrendador» en una compraventa.

**87.5 — El gate me cazó a mí.** Al escribir el banner del doc 23 cité **literalmente** la fórmula
prohibida para declarar que no rige, y el gate del kit la contó como marca de trabajo nueva (231 → 232).
Es [[LD-07]] otra vez —*la cita que DEROGA*— y la ventana de negación no la cubre. Reformulado sin citar
el literal: 231 de vuelta. Se deja anotado en el ledger; endurecer el gate no compensa hoy (el documento
está retirado y es interno, no bloquea la emisión).

**87.6 — Frescura al cerrar.** El `05` llevaba 16 días sin re-sellar y su claim más viejo, 40. **Re-verificado
en vivo hoy**: el sitio público responde 200 con la sentinela «portal en construcción» (modo obra intacto) y
el portal staging responde 200, 135 KB, con `noindex, nofollow`. Ambos re-sellados a 2026-08-19 — importa
doblemente porque el frente que arranca ahora se construye sobre ese staging.

**87.7 — Doctrina.** [[LD-01]] (2 remedios dañinos ya en este frente) · [[LD-07]] (la cita que deroga, esta
vez contra mí) · §3.3 (todo verificado contra el texto de hoy: 4 hallazgos murieron ahí) · §83.10 (*sin
verificar* ≠ *confirmado*) · §G.4 (ledger reanudable + `05` re-sellado antes de pausar). Sin comité ni
consejo externo: instrucción de sesión de no lanzar agentes ni workflows → **NO revisado por terceros**.

---

## 88. ADR — El formulario de captación deja de perder los leads (y al probarlo, el correo de avisos lleva roto quién sabe cuánto) ⟦OPUS-5⟧ (2026-08-19)

> Arranque del frente PÁGINA tras congelar cerebro y kit. Primera pieza: que el portal **capture** de
> verdad. Hasta hoy `/publicar` era una demo bonita — el propietario llenaba "Solicita tu avalúo gratis",
> veía *"¡Solicitud recibida!"* y **el lead se evaporaba**: el código tenía un `TODO: POST real`.

**88.1 — Por qué se pudo hacer HOY y no en el cutover.** El instinto decía "esto va bloqueado como el
catálogo". No: §60.4 bloquea la ficha, el botón Republicar y la purga, no los formularios. Lo que
decide es si las reglas permiten crear. Se consultaron las **reglas VIVAS de producción** (no el archivo
del repo, que TODO-17 dice que tiene cambios sin desplegar): `solicitudes` → **`allow create: if true`**.
Y `onNewSolicitud` ya está **desplegada** esperando esos documentos. O sea: cero deploys, cero secretos,
cero cutover. La distinción archivo-del-repo vs reglas-vivas es la que evitó parar sin motivo.

**88.2 — Endpoint, no SDK en el navegador.** Se añadió `src/pages/api/solicitud.ts` en vez de meter el
SDK modular de Firestore en el cliente. Tres razones: **(a)** cero peso extra —el SDK son ~100 KB en una
página de captación, justo donde el LCP paga—; **(b)** la validación vive en el servidor, donde no se
salta desde la consola; **(c)** el formulario **funciona sin JavaScript**: el `<form>` lleva
`method="post" action="/api/solicitud"` y el endpoint responde 303 a `/publicar?ok=1` (POST-Redirect-GET,
así un F5 no reenvía el lead). Con JS, la isla hace `fetch` y pinta el mismo estado de éxito sin recargar.
La capa `firestore-rest.ts` **nació read-only**; gana `encodeValue` + `createDoc` de forma **aditiva**,
con su mismo contrato: edge-safe, sin SDK, y **no lanza nunca**.

**88.3 — Tres detalles que habrían roto el lead en silencio.** (1) El `<select name="tipo">` del
formulario es el tipo de **INMUEBLE**, y el campo `tipo` del documento es el tipo de **LEAD** (taxonomía
de `calculateLeadScore`). Escribir `tipo: 'Apartamento'` no habría fallado: habría dado 5 puntos en vez
de 15 y un asunto de correo equivocado, para siempre y sin error visible. Va como
`tipo: 'solicitud_avaluo'` y el inmueble en `datosExtra.tipoInmueble`. (2) El correo al admin renderiza
literalmente «*{tipoInmueble} en {ciudad}*», así que `datosExtra.ciudad` lleva la zona
(«Bocagrande, Cartagena»): sin eso el lead le llega a Daniel sin saber de qué barrio es. (3) Las
allow-lists de zona y tipo se copiaron del `<select>` **real**; las que había escrito de memoria tenían
"Centro" y "Getsemaní" donde el formulario dice "Centro Histórico", y habrían descartado zonas válidas.

**88.4 — Verificación END-TO-END contra Firestore real (no contra el diff).** Validación: nombre vacío
**422** · teléfono basura **422** · URL en el nombre **422** (anti-bot) · cuerpo >4 KB **413**. Camino
feliz: **200**, y el documento aterrizó con la forma exacta —`createdAt` es un **Timestamp real**, no una
cadena; `precioAproximado: null` sobrevivió sin corromperse— y `onNewSolicitud` **disparó 2 segundos
después** (log de Cloud Logging). El lead de prueba quedó borrado. En el navegador: con campos vacíos
muestra el error, **no toca la red** y no pinta éxito; consola limpia. `astro check` 0 errores ·
**vitest 53/53** (11 nuevos sobre `encodeValue`/`createDoc`, incluido el ida-y-vuelta con `decodeValue`
y el 403 de las Rules) · build OK.

**88.5 — Lo que apareció al probar, y que no es mío: el aviso de leads está ROTO en producción.**
`onNewSolicitud` disparó y falló al enviar: `Invalid login: 535-5.7.8 Username and Password not accepted`.
Las credenciales de Gmail (`EMAIL_USER`/`EMAIL_PASS`) no sirven. **Consecuencia: hoy, cualquier lead que
entre por el sitio viejo tampoco le avisa a nadie** — llega a Firestore y ahí se queda. Además el
documento quedó **sin `leadScore`, sin `leadTier` y sin `nurturing`**, aunque el código del repo los
escribe ANTES del envío: eso apunta a que la versión desplegada no es la del repo (`05` ya declara
9 en código / 7 desplegadas), pero **no está verificado** y se deja dicho como hipótesis, no como hecho.
→ Sube a `10` como pendiente de dueño (rotar la contraseña de aplicación) + revisar el deploy de la Function.

**88.6 — L-33 volvió a cobrar, y el cerebro ya la tenía escrita.** La primera versión leía
`locals.runtime.env` para la config; Astro v6 lo removió y el camino feliz devolvió **500**. La lección
estaba en `30 L-33` desde TODO-30 — la escribí yo. El trigger 🖥️ me llevó a `34-DOCTRINA-CODIGO` (que
leí), pero el gotcha vive en `30`, y a `30` solo se va cuando *el síntoma suena*: aquí el síntoma llegó
después del error. El arreglo es además más simple que el original: `getPublicFirebaseConfig()` sin
argumentos, igual que hace `middleware.ts` con el cliente de lectura.

**88.7 — No-regresión.** `firestore-rest.ts` y `client.ts` solo GANAN exports (ninguna firma existente
cambió; los 42 tests previos siguen verdes). `publicar.astro` conserva su markup fiel al mockup —no se
añadió ni un campo, aunque el scoring premia el correo con 10 puntos (§88.8)—. Ninguna otra colección se
toca: el endpoint escribe **solo** `solicitudes`. Frescura: `20 §Portal` documenta la ruta nueva en el
mismo cambio (§G.4).

**88.8 — Hallazgo para decidir, no para arreglar solo.** El mockup de `/publicar` pide 4 campos y **no
incluye correo**. Sin correo, un lead legítimo de propietario puntúa ~35 y le llega a Daniel etiquetado
**`[COLD]`**, que es una señal falsa. Son dos caminos y ninguno lo decide el implementador: añadir el
campo al mockup, o re-pesar el scoring. Queda anotado en `10`.

**88.9 — Doctrina.** §3.3 (reglas VIVAS, no el archivo; allow-lists del `<select>` real, no de memoria) ·
§G.4 caza-bugs (el camino END-TO-END destapó el correo roto, que el diff jamás habría mostrado) ·
[[L-33]] (reincidente) · §G.4 Frescura (`20` en el mismo cambio) · callejón (b) *nunca UI sin mockup*
(por eso `/ingresar` y `/favoritos` NO se construyeron: no existe mockup de ninguna).

---

## 89. ADR — `/ingresar` y `/favoritos`: las dos pantallas que el header llevaba enlazando a un 404 desde el primer día ⟦OPUS-5⟧ (2026-08-19)

> El `Header.astro` es fiel al mockup y siempre trajo *Favoritos* e *Ingresar*. Sus páginas nunca se
> construyeron: eran las 2 de las 8 pantallas que faltaban, y **no tenían mockup propio**, así que el
> callejón (b) —*nunca UI sin mockup*— las mantuvo cerradas. Daniel generó el mockup hoy; se importó con
> el **MCP de Claude Design** y quedó guardado como los otros ocho.

**89.0 — Nota de método sobre el mockup.** El primer enlace que llegó devolvía `file not found`: Claude
Design **cambia el id del bundle en cada guardado**, así que un enlace compartido muere en cuanto se
vuelve a guardar. El MCP (`list_files` + `get_file` sobre el `projectId`) lo trae sin caducidad y sin
depender de que el enlace siga vivo. Queda como la vía por defecto.

**89.1 — La decisión que ordena todo lo demás: los favoritos NO van detrás del login.** Viven en
`localStorage`. No es una simplificación: **es lo que dice el propio mockup** —*«Ingresar para
sincronizarlos»*, *«Tus favoritos se sincronizan en todos tus dispositivos»*—. El acceso es para
**sincronizar**, no la puerta de entrada. Un corazón que exige crear cuenta es un corazón que nadie
toca, y en un portal inmobiliario esa fricción se paga en captación. Consecuencia: **funciona hoy para
el 100% de los visitantes**, sin auth, sin cuentas, sin cutover.

**89.2 — La instantánea, en vez de una consulta.** Al dar corazón se guarda una **foto de la card leída
del DOM** (imagen, badge, zona, título, precio, specs, enlace). Dos ventajas: `/favoritos` se pinta sin
tocar la red, y sirve igual con el catálogo en `demo` o en `live` — no hay que esperar al cutover. La
contrapartida se asume y se escribe: si el inmueble cambia de precio, la tarjeta guardada envejece hasta
que se vuelva a visitar; se refrescará contra `/api/catalogo` cuando el catálogo pase a vivo (TODO-22).
Se lee del DOM **en el momento del clic** en vez de imprimir un `data-` en cada card: serían ~300 bytes
de más **por card** en todos los listados del sitio, pagados por todos para que unos pocos guarden.

**89.3 — Las cards se CLONAN, no se re-escriben.** `/favoritos` construye cada tarjeta clonando el
`<template id="tpl-pcard">` que contiene el `PropertyCard` real y rellenándolo con `textContent` — el
mismo patrón de la isla del SERP (§59). Así el markup de la card tiene **un solo dueño** y no puede
divergir (L-29), y no entra `innerHTML` en el portal. El primer borrador sí lo usaba: lo frenó el hook
de seguridad del harness, y al buscar la alternativa apareció que el patrón correcto **ya existía en la
casa**. Fue una corrección afortunada — el resultado es mejor código, no solo más seguro.

**89.4 — El corazón se cablea una vez, en el layout.** `BaseLayout` llama a `cablearCorazones()`, que
toma **toda `.alt-pcard`** de la página y sincroniza su estado con lo guardado. Va ahí y no en cada
página porque las cards salen en home, SERP, ficha y turismo: repetir el import página por página es la
vía segura a que una se quede sin él. Es idempotente, así que la isla del SERP puede re-cablear las
cards que inyecta.

**89.5 — Dos defectos cazados mirando la pantalla, no el diff.** (1) Las specs se guardaban como
`["4","3","210 m²"]`, **sin decir cuál era cuál**: el molde re-pinta los íconos en orden fijo, así que
una card sin baños —un lote— habría puesto el ícono de cama junto a los metros cuadrados. `PropertyCard`
ahora etiqueta cada span con `data-spec` (bed/bath/area) y la instantánea guarda el **tipo** junto al
valor. (2) Usé `.alt-field` para los campos de `/ingresar` creyendo que era la pila etiqueta+campo, y
esa primitiva es un contenedor **horizontal** (ícono + input): la etiqueta salía **al lado** del campo.
Se vio en la captura y se corrigió al patrón real del portal (`publicar.astro`). Ninguno de los dos
aparece en un `astro check` verde.

**89.6 — Lo que NO se abrió, y por qué no es deuda técnica.** **Crear cuenta** no funciona: captar los
datos de una cuenta nueva exige la **Política de Tratamiento de Datos PUBLICADA** (Ley 1581 art. 9, gate
de `42-LEGAL`: *«Política + Aviso + checkbox con prueba»*), y sigue sin publicarse — es la pelota #2 de
Daniel. Además, la línea legal que trae el mockup (*«Al continuar aceptas…»*) es **consentimiento
tácito**, que no satisface ese gate para una captura de datos. El botón dice la verdad —*las cuentas
abren muy pronto, y mientras tanto no las necesitas*— en vez de ofrecer un formulario que hoy no debería
existir. **Ingresar** sí funciona: el proveedor de correo/contraseña está **verificado activo** (lo usa
el admin); el de Google no tiene evidencia de estarlo, así que su `auth/operation-not-allowed` se traduce
a un mensaje humano en vez de reventar con un código.

**89.7 — Verificación (las dos fronteras del estado-cero, §G.4).** Guardar el primero desde `/comprar`
→ aparece en `/favoritos` con foto, badge, zona, specis correctas y corazón lleno. Quitar hasta el
último → el contador pasa a *«Nada guardado todavía»*, la lista se oculta y entra el estado vacío, con
el singular/plural bien resuelto en el paso intermedio. En `/ingresar`: el ojo alterna, el envío vacío
avisa sin ir a la red, «olvidé mi contraseña» sin correo pide el correo. `astro check` **0 errores** ·
**vitest 53/53** · build OK · consola limpia.

**89.8 — No-regresión.** `PropertyCard` solo GANA atributos (`data-spec`); ninguna firma cambió y las 4
páginas que la usan siguen idénticas. `BaseLayout` gana un script que degrada solo si `localStorage` no
está disponible (Safari privado, cuota llena) — los favoritos son una comodidad y **jamás** deben romper
la página que los muestra. `firebase` pasa de `devDependencies` a `dependencies`: viaja al bundle del
cliente y no puede depender de que el CI instale las de desarrollo (hoy `npm ci` las instala, pero un
`--omit=dev` futuro rompería el deploy sin decir por qué).

**89.9 — Doctrina.** Callejón (b) *nunca UI sin mockup* (respetado: se esperó al mockup) · L-29 (un dueño
por markup) · §G.4 caza-bugs (los 2 defectos salieron del navegador, no del diff) · §G.4 Frescura (`20`
en el mismo cambio) · gate legal de `42-LEGAL` por encima de la fidelidad al mockup · §3.3 (proveedores
de acceso verificados contra Firebase, no supuestos).

## 90. ADR — Auditoría Nivel-2 #7: el ruteo está sano, el territorio no; y tres gates verdes cubrían media promesa ⟦OPUS-5⟧ (2026-08-20)

> Encargo directo de Daniel («audita el cerebro»), NO por nudge del linter (verde: 18d < 30, gap 6 ADRs < 12).
> Deliberación: `../brain-private/altorrainmobiliaria/research-archive/2026-08-20-auditoria-cerebro-nivel2-7-inmobiliaria.md`

**90.1 — Causa raíz (RCA).** 16 hallazgos vivos. La clase dominante **no es ruteo, es frescura**: los 4
retrieval-drills fríos (boot puro) llegaron **4/4 a la neurona correcta**, sin adivinar y sin leer `99`
de más — pero **2 de 4 habrían respondido MAL** porque la neurona correcta estaba desactualizada. El
cerebro sabe a dónde mandarte; lo que falla es lo que encuentras al llegar. La raíz mecánica es [[M-10]]:
**#27** valida `neurona→archivo inexistente` pero no el inverso (`creas` sin gate, 7 páginas huérfanas);
**#5** valida que una ref EXISTA, no que sea CORRECTA (`10:38` mandaba a `L-34`=Range donde iba
`L-39`=rAF, con 48/48 en verde); y la **memoria del harness no la mira NINGÚN gate** (`grep`=0 hits),
que es por qué N6-22 y N6-30 llegaron **reincidentes** desde la #6.

**90.2 — Solución estructural.** (a) [[M-10]] nombra la clase y fija la regla: *al declarar un gate,
escribe al lado la mitad que NO cubre; toda capa sin gate se declara sin-gate, o su silencio se lee como
✅*. (b) Los 2 reincidentes se CURARON en la capa donde vivían (memoria del harness). (c) Los punteros
podridos y las cifras contradictorias se corrigieron contra evidencia verificada, no contra memoria.

**90.3 — No-regresión.** Ningún ID, función ni callsite tocado. `brain:check` SANO; gate #5 pasa a
**49/49** con M-10 registrada por su stub en `30` (la convención stub-en-30 / cuerpo-en-33 se descubrió
leyendo el kernel, no se supuso). Caps de `30` y `33` **NO se subieron**: quedan visiblemente en `↗`
como deuda declarada — subir el techo para alcanzarlo es justo lo que [[M-05]] prohíbe.

**90.4 — Verificación.** Todo hallazgo trae `archivo:línea` + comando. En vivo: `curl` 200 · 62.344 B en
`/legal/politica-tratamiento-datos/` · `curl` 200 + sentinela «en construcción» en el dominio ·
`git fetch` + `origin/main` contiene `e80306c` · `ls` de mockups = 9 · `find` de páginas = 18.

**90.5 — Anti-patterns evitados.** Cero score numérico (no reproducible). Un refutado registrado CON su
porqué (la «contradicción de versión» de `L-33` era coherente: `v6+` = de v6 en adelante, verificado
contra `portal/package.json:23,25`). No se re-litigaron los 47 refutados de la #6. No se tocó la conducta
del botón «Crear cuenta»: es decisión de producto de Daniel, no del auditor.

**90.6 — Lo más caro que salió, y no lo encontró el linter.** **N7-00**: el tablero `05` declaraba la
campaña de humo **DESACTIVADA**, y su **propio SSoT declarado** (`pauta-captacion` playbook §4b) dice que
**sigue ACTIVA y arranca sola al recargar saldo**. La lección general —[[D-15]] «sin saldo» ≠ «apagado»,
6 zombies con $32.000/día armados— se destiló **el mismo día** desde Bersaglio y **no se re-aplicó al caso
propio abierto**. Destilar hacia arriba sin barrer hacia atrás deja el riesgo justo donde estaba.

**90.7 — Gobernanza: el límite que se levantó a mitad de auditoría.** La sesión arrancó respetando
`10:50-52` («sin ultracode — nada de agentes ni workflows»). Daniel la levantó en vivo («no podemos poner
límites a la inteligencia»). Los 4 drills fríos se lanzaron entonces y **encontraron 3 hallazgos que la
verificación directa NO vio** (N7-04 · la 4ª cifra de páginas · N7-06), además de N7-00. Queda escrito
que lo del 19-ago era un límite de **ALCANCE** (la página primero), no de **CAPACIDAD** — confundirlos
costó, medible, cuatro hallazgos. **GC pareado: boot 31481 → 31394c (−87c)**, margen 19c → 106c.

## 91. ADR — SEO técnico de OLA 1: el mapa de 301 y el interruptor que desindexaba el dominio en silencio ⟦OPUS-5⟧ (2026-08-21)

> Ítem 11 de OLA 1 (MEGA-PLAN), el primero de los 5 que §90 encontró sin construir. Gate del cutover.

**91.1 — Causa raíz (RCA).** Al abrir el ítem apareció algo que no se buscaba: **`PUBLIC_SITE_ENV` se
LEE en dos sitios (`BaseLayout.astro:22`, `middleware.ts:14`) y no se DECLARA en ninguno** — ni en
`portal-ci.yml`, ni en `wrangler.toml` (`[vars]` no existe), ni en un `.env`. O sea: **todo build que
se ha hecho jamás sale `noindex, nofollow`**, y el del cutover también saldría así. El sitio se vería
perfecto para un humano mientras le pide a Google que lo desindexe. Es exactamente *«el bug clásico»*
que nombra la skill `search-console-setup-y-diagnostico` («un `noindex` global de "en construcción"
que nadie quitó»), y de la clase [[M-10]]: un mecanismo correcto en UNA dirección (proteger el
staging) sin nada que vigile la otra (abrirlo en producción).

**91.2 — Solución estructural.** (a) **`src/lib/seo/redirects.ts`**: las **68 URLs públicas** del
sitio viejo mapeadas a la página que responde la MISMA intención — nunca "todo a la home", que Google
trata como soft-404 y no transfiere señal. Donde la superficie ideal aún no existe (13 barrios, Rango
ALTORRA) se apunta al destino real más cercano con un campo `pendiente` que dice a qué re-apuntarlo:
re-apuntar un 301 después es barato, mandarlo hoy a un 404 pierde la señal para siempre. Un `§NO-TOCAR`
enumera las **9 rutas exentas y por qué**, para que nadie las "complete" por simetría. (b) Se aplica en
`middleware.ts` **antes** de montar la capa de datos. (c) `robots.txt` y `sitemap.xml` como endpoints
prerenderizados conscientes del entorno. (d) **El candado**: `verify-build.mjs` #6 **FALLA** el build
si en producción sobrevive un `noindex` o un `Disallow: /`, y **avisa en amarillo** cuando no es
producción. Los dos sentidos, que es lo que [[M-10]] exige.

**91.3 — No-regresión.** Sitemap escrito a mano y NO con `@astrojs/sitemap`: el integrador barre todas
las rutas emitidas y aquí hay tres que jamás deben entrar (`/gestion`, `/design-system`, `/404`).
Declarar la lista cuesta unas líneas y hace imposible filtrar una interna por descuido. Cero IDs,
funciones o rutas renombradas; el cambio es aditivo salvo el eslogan (§91.6).

**91.4 — Verificación (en vivo, no por diff).** `npm run build` + `verify:build` en los **dos** modos:
staging avisa y confirma `noindex=true · Disallow=true`; **producción compilada por primera vez en la
historia del repo** y verde (`noindex-en-home=false · Disallow-total=false · sitemap-declarado=true`).
Servidor de dev y `curl`: 8 redirects de muestra devuelven **301** al destino correcto (barrio,
listado, blog, ficha, captación, legal); `/robots.txt` y `/sitemap.xml` **200** (13 URLs, dominio de
producción); `googlec4e47cae776946d9.html` **200**.

**91.5 — Anti-patterns evitados.** No se redirigió en bloque a `/`. No se tocó `@astrojs/sitemap`. No
se metió el archivo de verificación de GSC en el mapa de 301 (redirigirlo = perder la propiedad y con
ella el histórico): se **duplicó** a `portal/public/`, porque tras el cutover el dominio lo sirve el
Worker y el archivo del legacy deja de ser alcanzable. Eso salió de PROBARLO: daba 404.

**91.6 — Archivos.** NUEVOS: `portal/src/lib/seo/redirects.ts` · `portal/src/pages/robots.txt.ts` ·
`portal/src/pages/sitemap.xml.ts` · `portal/public/googlec4e47cae776946d9.html`. MODIFICADOS:
`middleware.ts` (+6 líneas) · `scripts/verify-build.mjs` (verificación #6) · `lib/config/site.ts`
(**bug de marca cazado al pasar**: el eslogan era el viejo *«Gestión integral en soluciones
inmobiliarias»*, que `CLAUDE.md §1` REEMPLAZÓ por **«Seguridad, Legalidad y Confianza»** — el kernel
se reconcilió en su día y el código no, y salía en el `<title>` de la home). INTACTOS: astro.config,
wrangler, todas las páginas.

**91.7 — Doctrina aplicada.** §G.2 🖥️ (`34` leída antes de tocar código) · §G.2 🔵 (skill del dominio
ANTES de decidir: de ahí salió "cero noindex residual" y la regla de re-enviar el sitemap) · §3.3
(el inventario de 74 URLs se CONTÓ, no se estimó) · §G.4 caza-bugs (el 404 del archivo de GSC y el
eslogan salieron de recorrer el camino vivo, no del diff) · **§G.4 Frescura a mano**: el gate #27 es
CIEGO a archivos nuevos ([[M-10]] (a)), así que `20` se actualizó manualmente o estos 4 archivos
habrían nacido indocumentados. Sin cache bump: el portal no tiene SW.

## 92. ADR — Las 13 landings de zona: contenido honesto donde el legacy tenía posicionamiento ⟦OPUS-5⟧ (2026-08-21)

> Ítem 4 de OLA 1. Cierra el `pendiente` que §91 dejó abierto en los 13 redirects de barrio.

**92.1 — Causa raíz.** El sitio viejo tenía 13 landings de barrio con posicionamiento ganado. El
portal nuevo no tenía ninguna, así que el mapa de 301 las apuntaba al SERP: destino correcto pero
genérico, que no responde la intención de «cómo es El Laguito». Sin estas páginas el cutover conserva
la URL y pierde la razón por la que Google la premiaba.

**92.2 — Solución estructural.** `lib/content/zonas.ts` (contenido, dueño del censo de zonas) +
`pages/zona/[slug].astro` (plantilla, prerender). **Los redirects de barrio y las filas del sitemap se
DERIVAN de `ZONAS`**: es imposible que nazca una landing sin su 301 o sin entrar al sitemap, que es el
olvido más común al añadir contenido. Los 13 `pendiente` de §91 quedan cerrados; sobrevive uno solo
(`/avaluo.html` → Rango ALTORRA, ítem 9).

**92.3 — Veracidad (la decisión de diseño que manda aquí).** CERO datos cuantitativos: ni precio por
m², ni valorización, ni proyectos, ni número de unidades. Todo el contenido es cualitativo y
verificable caminando la ciudad. No es prudencia abstracta: `[operacion].astro:20` documenta que este
portal YA tuvo 5 listings y una zona («Alameda La Victoria») **fabricados**, retirados después. Lo que
solo puede aportar Daniel vive en `PENDIENTE_DUENO` y **no se renderiza**. Un hueco honesto vale más
que una cifra que nadie puede sostener, y en una inmobiliaria un dato falso cuesta el negocio.

**92.4 — Voz.** Cada texto pasó el checklist anti-IA de `catalogo-voz-altorra` §3.3. La afirmación de
cobertura se hace UNA vez por página y vive en la plantilla: repetirla catorce veces la habría
convertido en muletilla, que es justo lo que la §Regla de variedad prohíbe.

**92.5 — Verificación en vivo.** 4 redirects de muestra → 301 a su landing · `/zona/el-laguito` 200
con `<title>` único, canonical al dominio de producción y JSON-LD completo · sitemap 13 → **26 URLs**.

**92.6 — Dos hallazgos al pasar.** (a) **El portal no tenía NI UN JSON-LD** (`grep` = 0), cuando el
legacy tenía `BreadcrumbList` en 43 páginas: **el structured data entero se perdió en la migración**.
Estas landings estrenan el patrón; extenderlo a home, SERP y ficha entra en TODO-39. (b) **`BaseLayout`
no emitía `canonical` en ninguna página** y su `description` por defecto arrastraba el eslogan viejo
con la marca en minúscula mixta. El canonical se resuelve ahora en el layout para TODAS las páginas,
sobre el dominio de producción y nunca sobre el host del request (en staging sería `*.workers.dev`).

**92.7 — Doctrina.** §G.2 🔵 skill del dominio ANTES de escribir (`catalogo-voz-altorra`) · §3.3
(el inventario de zonas se contó contra los 301 reales) · §G.4 caza-bugs (el JSON-LD ausente y el
canonical faltante salieron de mirar el camino vivo) · §G.4 Frescura a mano en `20` ([[M-10]] (a)).

## 93. ADR — `/precios`: publicar lo que se cobra, con las cifras selladas y los huecos a la vista ⟦OPUS-5⟧ (2026-08-21)

> Ítem 7 de OLA 1. El MEGA-PLAN lo llama «el diferenciador gratis» (op.7).

**93.1 — Causa raíz.** En el mercado inmobiliario de Cartagena casi nadie publica sus comisiones y el
cliente las descubre al final del proceso, cuando ya invirtió tiempo. Publicarlas antes es la versión
operativa de la voz «los números van claros y de frente», y no cuesta nada construirla.

**93.2 — El error que se evitó, y es el hallazgo de este ADR.** El MEGA-PLAN ítem 7 trae «venta 2-3%»
y «captación arriendo 50-100% del primer canon». Antes de escribir una cifra se fue al nodo dueño:
`43 §Tarifario y umbrales OFICIALES`, **sellado por Daniel el 2026-07-25 y encabezado «derogan toda
cifra previa»**, dice **venta 3%** y colocación por **DURACIÓN del contrato** (1 canon <3 años · 2
entre 3-9 · 3 desde 10), que no es un porcentaje. **Las del plan están superadas.** Copiar el
documento de planificación en vez de consultar al dueño del hecho habría publicado precios
equivocados. Clase [[M-10]] en su variante de datos: dos fuentes, una autoritativa, y ningún gate que
avise cuál manda. Queda escrito en la cabecera de `tarifas.ts`.

**93.3 — Lo que no está decidido se dice.** Comercial y alojamiento por días salen como «Sin tarifa
cerrada» con su explicación, porque en el sellado el comercial está literalmente ⟦PENDIENTE decisión
Daniel⟧ y el de alojamientos tiene tarifario propio por temporada. La voz §6.1 prohíbe «precios
desde»: inventar un rango para tapar el hueco habría sido peor que el hueco.

**93.4 — El argumento central no es una cifra.** `42-LEGAL` confirma **cero depósitos y cauciones al
arrendatario de vivienda** (Ley 820/2003 arts. 15, 16 y 18, directas, indirectas o con otro nombre):
el ingreso sale solo del lado propietario. Tiene sección propia porque en el mercado se cobra igual, y
quien lo ha vivido reconoce la diferencia sin que haya que explicársela.

**93.5 — Verificación en vivo.** `/precios` 200 · `<title>` único · canonical al dominio de producción
· `BreadcrumbList` + **`FAQPage`** con las 4 preguntas que llegan por WhatsApp, cada respuesta atada a
una tarifa sellada o a una obligación legal verificada · las 5 filas rindiendo sus cifras · sitemap
26 → **27 URLs** · enlazada desde el footer (sin eso nacía huérfana).

**93.6 — Riesgo abierto que NO se tocó.** El footer ofrece **«Avalúo gratis»**, y el MEGA-PLAN B13 dice
**NUNCA llamar «avalúo»** a nuestra estimación (en Colombia el avalúo es actividad regulada, Ley
1673/2013 y su RAA). La skill `catalogo-voz-altorra`, en cambio, usa «Avalúo» suelto en §8 y en el
menú de WhatsApp §6.4. **Dos fuentes del cerebro se contradicen en algo con peso legal**, así que no
se cambió por cuenta propia: queda para Daniel en TODO-39.

## 94. ADR — Rango ALTORRA: el ítem que parecía gateado por el dueño y no lo estaba ⟦OPUS-5⟧ (2026-08-21)

> Ítem 9 de OLA 1. Deja OLA 1 en **12 de 13**.

**94.1 — Causa raíz / el desbloqueo.** El ítem se había clasificado como «necesita los rangos de 10
barrios de Daniel». Releyendo el MEGA-PLAN dice **«landing multi-step CONTACTO-PRIMERO»**: el
visitante deja sus datos y un asesor le devuelve el rango. **Sin número en pantalla, los rangos no
son un prerrequisito para construirlo.** Lección de método: «gateado por el dueño» merece releerse
antes de aceptarse, porque el gate puede estar en una parte del alcance y no en toda.

**94.2 — B13 manda en este archivo.** En Colombia el avalúo es actividad **REGULADA** (Ley 1673/2013,
avaluadores inscritos en el RAA). Ofrecer «avalúo gratis» desde una inmobiliaria no es impreciso, es
exponerse. La página dice con todas las letras que es una estimación orientativa y **no** un avalúo
con validez legal, y que para ese documento remitimos a quien corresponde.

**94.3 — Dos integraciones que habrían roto EN SILENCIO.** (a) `api/solicitud.ts` hardcodeaba
`origen: 'portal-publicar'`: los leads del Rango habrían llegado indistinguibles de los de
`/publicar`, y el censo de `43 §LEADS` se hizo justamente mapeando `origen` → formulario. Ahora hay
**lista blanca** de formularios (aceptar cadena libre sería regalarle el campo a un bot). (b) La
allow-list de zonas del endpoint tenía **6** nombres y las landings de §92 tienen **13**: el
formulario habría ofrecido zonas que el backend **descartaba sin un solo error**. Se compone como
unión derivada de `zonas.ts`. Las dos son [[M-10]]: correcto en un sentido, mudo en el otro.

**94.4 — Progresivamente mejorado, de verdad.** Sin JavaScript los dos fieldsets están visibles y el
POST nativo funciona; el botón «Continuar» nace `hidden` y lo revela el JS, para no mostrar un botón
que no haría nada. El fallo de red **falla RUIDOSO**: un «gracias» tras un error pierde al
propietario y encima le hace creer que lo llamaremos.

**94.5 — Verificación.** `/avaluo.html` → 301 al Rango (cierra el ÚLTIMO `pendiente` del mapa §91) ·
página 200 con `<title>` único · los **3 gates** del endpoint responden 422 con el campo nuevo
presente (habeas data · teléfono · spam) · 13 zonas y 5 tipos renderizando · sitemap 27 → **28**.
⚠️ **El POST exitoso NO se probó a propósito**: escribiría un lead de prueba en la colección de
producción que Daniel acaba de dejar en cero, y Claude no borra datos. Los gates recorren el mismo
camino de código hasta la escritura.

**94.6 — El riesgo de §93.6 se agrava.** La palabra «Avalúo» aparece **en esta misma página**, la
única cuyo propósito es no decirla, porque viene de los componentes compartidos:
`Footer.astro:15` («Avalúo gratis»), `Header.astro:56` («Avalúo, marketing y cierre») y
`Header.astro:78` («Avalúos»). No se tocó: la skill `catalogo-voz-altorra` usa «Avalúo» con
normalidad en §8 y §6.4, así que **dos fuentes del cerebro se contradicen en algo con peso legal** y
esa la decide Daniel. Sigue en TODO-39.

## 95. ADR — La identidad del negocio en JSON-LD, y las dos cosas que NO se declararon ⟦OPUS-5⟧ (2026-08-21)

**95.1 — Causa raíz.** §92 destapó que el portal no tenía **ningún** structured data mientras el
legacy lo tenía en 43 páginas: la migración se lo dejó entero por el camino. Sin él, Google y los
motores de respuesta saben lo que dice cada página pero no **quién** es ALTORRA.

**95.2 — Solución.** `components/JsonLdNegocio.astro` emitido desde `BaseLayout`, o sea en TODAS las
rutas. Tipo **`RealEstateAgent`** (subtipo de `LocalBusiness`), no `Organization` a secas: perder la
señal local en una inmobiliaria de una sola ciudad sería regalar la única ventaja estructural que
tiene. Va en el layout porque la identidad no cambia entre rutas y repetirla por página es la vía
segura a que una se quede sin ella.

**95.3 — Las dos ausencias deliberadas, que son el contenido real de este ADR.**
(a) **Sin `streetAddress`**: `05` dice que la dirección COMERCIAL todavía falta (la del acto
administrativo es el domicilio del representante). Un `PostalAddress` sin calle es válido; uno con
una calle inventada es una mentira que Google indexa y que además chocaría con el Perfil de Empresa
el día que se reclame.
(b) **Sin `aggregateRating` ni `review`**: no hay reseñas propias. Inventarlas es lo que sanciona la
SIC y por lo que Google aplica acciones manuales. Es el mismo criterio de §92.3 aplicado al markup.

**95.4 — Verificación.** Presente en home, SERP, `/precios` y `/zona/*` · JSON parseado y válido ·
comprobado explícitamente que NO salen `streetAddress` ni `aggregateRating` · matrícula `6636`, NIT
y eslogan correctos en el markup.

**95.5 — Lo que sigue faltando y por qué.** Falta el markup a nivel de INMUEBLE en la ficha
(MEGA-PLAN ítem 3). No se hizo a propósito: el catálogo es DEMO (§56-§60), y emitir
`RealEstateListing` de propiedades que no existen es publicar datos estructurados falsos. Entra con
el catálogo real.

**95.6 — Lo que destapó el barrido END-TO-END, y por qué se hace.** Al cerrar la noche se recorrió el
build de PRODUCCIÓN entero en vez de confiar en los diffs, y salieron dos cosas que ningún commit
individual habría enseñado:

(a) **`/invertir.html` no tenía redirect.** El comentario de `redirects.ts` decía «68 públicas + 6
técnicas» y el disco tiene 74 archivos: **68+6=74 cuadraba de casualidad y era falso por los dos
lados** (son 65 y 9). Ese descuadre escondía una URL del sitio viejo que habría dado **404 tras el
cutover**. Corregido y, más importante, **verificado por conteo contra el disco**: 74 = 65 con 301 +
9 exentas, **0 sin cubrir**. La cifra que no se puede reproducir con un comando no es una cifra.

(b) **`/design-system` era INDEXABLE en producción.** Confiaba en el gate de staging en vez de forzar
`noindex` como hace `/gestion`, así que un build de producción habría publicado la guía de estilos
de desarrollo. El `Disallow` del `robots.txt` **no basta**: impide RASTREAR, no INDEXAR — Google
puede indexar una URL que no puede leer si la descubre por un enlace. Ahora lo fuerza explícito.

Las dos son de la misma familia: un número que nadie recontó y un gate que cubría una dirección.

## 96. ADR — Alertas guardadas: OLA 1 cerrada, y tres cosas que ya estaban rotas ⟦OPUS-5⟧ (2026-08-21)

> Ítem 8 de OLA 1. **Deja OLA 1 en 13 de 13.**

**96.1 — El gate que no era gate.** El `10` daba las alertas por bloqueadas por «clave de Resend Y
catálogo real». Los dos son gates de EJECUCIÓN, no de construcción: sin clave el digest no manda, y
sin catálogo no hay contra qué disparar, pero ninguna de las dos cosas impide escribir el sistema.
Es la segunda vez seguida que pasa (§94.1 con el Rango): **«gateado» merece releerse antes de
aceptarse**, porque el gate suele estar en una parte del alcance y no en toda. Es la SEGUNDA vez
que se cumple [[L-40]] en dos días: la lección ya estaba escrita y aun así el `10` seguía diciendo
«gateado». Escribir la lección no basta si el pendiente no se re-etiqueta.

**96.2 — El botón que ya existía.** «Guardar búsqueda» está en el mockup aprobado
`ALTORRA Resultados.dc.html` desde el principio y apuntaba a `/favoritos`. Favoritos guarda
INMUEBLES; una búsqueda guardada es otra cosa. No hubo que inventar UI: hubo que darle su destino.

**96.3 — Un solo dueño del matching.** `src/lib/domain/alertas.ts` lo importan LOS DOS lados: el
endpoint de Astro y la Cloud Function. Si el matching viviera en la Function, la web podría aceptar
criterios que el digest no sabría interpretar, y ese desajuste **no da error: da silencio**. Mismo
patrón que `catalogo.ts` (§57). El `tsconfig` de `portal/functions` ya tenía `rootDir: ".."` para
justo esto.

**96.4 — Las cuatro decisiones que sostienen el envío.**
(a) **`ultimoEnvio` solo avanza si Resend aceptó el lote.** Al revés, un fallo de red dejaría la
marca adelantada y esos inmuebles no se avisarían jamás. Se acepta el riesgo simétrico: si Resend
acepta y la respuesta se pierde, alguien recibe el correo dos veces. Repetir es ruido; perder rompe
la promesa que hizo la página.
(b) **El «ahora» se toma ANTES de leer el catálogo.** Tomarlo después dejaría lo publicado entre la
lectura y el envío por debajo de la marca, invisible para siempre.
(c) **Costo constante**: el digest lee los 3 shards de `indices/catalogo-*`, no `propiedades`. El
costo crece con las alertas, no con el catálogo: una corrida diaria usa ~1,4% del cupo de lecturas.
(d) **La baja vive en `bajasAlertas`, append-only.** El público no puede leer `alertas` (dentro va el
token), así que no puede haber un update que verifique el token desde el cliente. Un append con
validación estricta es el permiso MÁS PEQUEÑO que resuelve el caso y además deja rastro de la
revocación, que es lo que la Ley 1581 art. 8 espera poder demostrar. La Function la aplica ANTES de
enviar nada, así que surte efecto antes del siguiente correo.

**96.5 — La baja es un POST, y esa es la parte que se olvida.** Los escáneres de Gmail, Outlook y los
antivirus corporativos **abren los enlaces** de un correo para revisarlos. Con la baja en el GET,
esos robots darían de baja a gente que ni abrió el mensaje y nadie entendería por qué dejan de llegar
las alertas. El enlace abre una página con un botón; la baja ocurre en el POST. Se soporta además el
one-click de **RFC 8058**, que es el botón «Cancelar suscripción» que pinta el propio Gmail: sin esa
cabecera, la gente usa «marcar como spam» para dejar de recibir, y eso sí quema el dominio.

**96.6 — TRES BUGS CAZADOS AL PASAR, ninguno de las alertas** (§G.4 caza-bugs: el camino vivo, no el
diff).
(a) **`solicitudes` moría en el cutover.** Las reglas del repo dicen `allow write: if false` y
`api/solicitud.ts` escribe ahí por REST público. Hoy funciona porque el ruleset VIVO sigue siendo el
del legacy; el día que se desplieguen las del portal, `/publicar` y el Rango dejarían de captar leads
**sin un solo error en pantalla**. Ahora hay alta pública ACOTADA (`solicitudes`, `alertas`,
`bajasAlertas`: crear sí, leer/editar/borrar no) con 14 tests de reglas nuevos.
(b) **`Response.redirect()` devuelve cabeceras INMUTABLES** y `middleware.ts` les hacía `set()` para
el `X-Robots-Tag` de staging: 500 en **todo** endpoint que responda con un redirect, o sea el
fallback SIN JavaScript de los formularios de leads. Solo ocurría fuera de producción, que es
justamente donde se verifica todo. El §94.4 afirmaba que ese camino funcionaba: no era cierto en
staging. → [[L-41]].
(c) **`/rango-altorra` cortaba el texto de habeas data** en «conforme a su»: se perdían el enlace a
la Política y la mención de transmisión a EE. UU., mientras la prueba archivada (`plano`) sí los
incluye. Enseñar menos de lo que se archiva rompe la regla del kit `08` §2.2 de que el titular acepte
exactamente lo que leyó. `/publicar` lo pintaba completo desde el principio; el §94 lo copió a medias.
→ [[LD-08]].

**96.7 — Un gate en rojo es un gate muerto.** `verify:data` fallaba desde que existe `/ingresar`,
porque el login con Google exige el SDK de Auth y no hay REST equivalente. Un candado que suena
siempre se ignora igual que uno apagado. Excepción **estrecha**: por archivo y por patrón, con el
motivo escrito, y `firebase/firestore` sigue prohibido ahí. Se comprobó que el gate SIGUE cazando una
violación real (archivo de prueba → falla → borrado). → TODO-38.

**96.8 — Verificación.** 76 tests unitarios (23 nuevos, puros) + 59 contra el emulador (14 de reglas
y 12 del digest, nuevos) · `build` OK · `verify:build` y `verify:data` verdes · gates del endpoint
422/413 en vivo · POST nativo → 303 conservando la búsqueda · `X-Robots-Tag` sobrevive al redirect ·
sitemap 28 → **29** · texto legal completo con sus DOS enlaces en `/alertas` y `/rango-altorra` ·
tokens de marca correctos en el render (Cormorant, navy, dorado, fondo blanco, cero negro).
⚠️ **El envío real NO se probó**: exige la clave de Resend con el dominio verificado, que es del
dueño. Los 12 tests del digest recorren el mismo código con el `fetch` inyectado.

**96.9 — Lo que queda abierto y NO puedo cerrar yo.** (1) `RESEND_API_KEY` como secreto + dominio
verificado en Resend. (2) El catálogo real (TODO-22): hasta entonces el digest corre, aplica bajas y
reporta `sin-novedades`. (3) Cloud Scheduler va por **2 de 3** jobs del free tier.

**96.10 — Doctrina aplicada.** §3.3 (cada afirmación contra el código o el navegador) · §3.4 IAP ·
§G.2 🖥️ (`34` antes de tocar código) · §G.4 caza-bugs (los 3 hallazgos salieron de recorrer el camino
vivo, no el diff) · §G.4 destilar a skills (`caza-bugs`, `legal-colombia`, `marketing-loops`) ·
§G.4 Frescura en `20`.

## 97. ADR — La ficha dinámica: el gate estaba sobre inventar, no sobre construir ⟦OPUS-5⟧ (2026-08-21)

> TODO-33 desbloqueado y construido. La ficha era la última superficie del portal que seguía siendo
> una maqueta con datos de muestra.

**97.1 — El gate, releído (tercera vez en tres días).** §60.3 decidió NO construir la ficha porque 4
bloques del diseño no tenían fuente de datos. Releyéndolo campo por campo, **tres ya traían decisión
escrita**: la dirección exacta está PROHIBIDA por diseño (PII, vive en `captaciones`), los POIs con
minutos se omiten en v1, y la financiación es una afirmación sobre un crédito que tiene carril legal
propio. El cuarto —el asesor— traía default honesto en el mismo ADR: bloque genérico del equipo. O
sea que el gate estaba sobre **inventar** esos bloques, no sobre construir la página. Es [[L-40]] por
tercera vez esta semana (§94.1 el Rango, §96.1 las alertas, y ahora esta). La lección ya estaba
escrita las tres veces; lo que faltó fue re-etiquetar el pendiente. → [[M-11]].

**97.2 — Ruta canónica `/inmueble/<slug>`.** En un portal inmobiliario la ficha ES la página que trae
tráfico, y una URL con el barrio dentro se comparte por WhatsApp y se posiciona; una con parámetro de
consulta, no. Hay además una trampa concreta que el recon destapó: `BaseLayout` construye el canonical
con `Astro.url.pathname`, que **ignora el query string** — con `/ficha?id=X` las N fichas del catálogo
habrían emitido el MISMO canonical y Google habría indexado una sola propiedad, con la página
perfecta en pantalla. `/ficha?id=` responde 301 hacia la canónica; sin parámetro sostiene el andamio
demo, que muere en el cutover.

**97.3 — Un solo dueño del markup.** Dos rutas pintan la ficha, así que el cuerpo vive en
`components/FichaInmueble.astro` y en ningún otro sitio. Copiarlo habría sido el mismo error que las
cards del SERP (L-29): dos copias que divergen sin que nada falle. La lógica de VISTA vive aparte en
`lib/domain/ficha.ts`, pura y testeada; la plantilla solo decide si pinta.

**97.4 — La regla que gobierna cada bloque.** *Un bloque sin dato se OMITE; jamás hereda el valor del
demo.* Por eso casi todas las funciones del modelo de vista devuelven listas que pueden venir vacías,
y por eso la mayoría de los 47 tests comprueba una **ausencia**: el fallo que importa no es verse
feo, es verse bien y ser mentira. La columna que dejaron los POIs la ocupa algo que sí es verdad: la
ZONA, con enlace a su landing de §92 — dato real y enlazado interno hacia contenido.

**97.5 — Tres gates nuevos, los tres fail-closed.** (a) **Alojamiento sin RNT NO se publica**: el
tipo lo deja opcional, la ley no, y la sanción es cierre del establecimiento (gate B3). (b) La
**matrícula de arrendador** solo se exhibe en arriendo Y en Cartagena: la habilitación es municipal y
enseñarla sobre un inmueble de otra ciudad afirmaría algo que allí no existe. (c) **`reservado` y
`cerrado`** son estados PÚBLICOS por las Rules (la ficha se conserva por SEO): ahora llevan aviso
visible, badge coherente y el CTA deja de ofrecer una visita a un inmueble ya vendido.

**97.6 — El hallazgo que más pesa, y no lo vi yo.** La ficha **no comprobaba que la propiedad
estuviera publicada**. Las Rules del portal filtran por estado pero **no están desplegadas**: el
ruleset vivo es el del legacy, con `allow read: if true` sobre `propiedades`. Y con un id canónico la
búsqueda se salta el índice —que sí filtra— y va directo al documento. Un BORRADOR se habría
publicado entero e indexable. El gate está ahora en el DOMINIO (`esPublicada`, la misma whitelist del
índice). → [[L-42]]: **una defensa que solo vive en las Rules no existe hasta que las Rules se
despliegan**; mientras tanto es un comentario.

**97.7 — Seis bugs propios más, todos cazados por la revisión adversarial antes de commitear.**
`urlMedia` devolvía la clave relativa sin base configurada, así que la misma foto resolvía distinto
según la ruta y en la ficha daba 404 · favoritos derivaba su id estable del `?id=` del enlace, así que
cambiar la URL habría dejado huérfano lo guardado en `localStorage` (→ [[L-43]]) · el área se
rotulaba «Construidos» aunque el dato fuera privada · el JSON-LD declaraba `geo` con el centroide del
BARRIO como si fuera la posición del inmueble, y el barrio como `addressLocality` borrando la ciudad ·
sin canonical explícito, id y slug se declaraban canónicos cada uno de sí mismo · y la demo llevaba
sello «Verificado por ALTORRA» sobre un inmueble que no existe, que es fabricar una verificación.

**97.8 — Tres bugs PREVIOS arreglados de paso** (§G.4 caza-bugs, el camino vivo): el evento
`altorra:catalogo-pintado` **no lo despachaba nadie**, así que en `live` todas las cards del SERP
salían con el corazón muerto · el portal **no emitía ni una etiqueta Open Graph**, y en Colombia un
inmueble se comparte por WhatsApp: salía un enlace pelado · una administración que va aparte y sin
cifra no se decía, y callarlo hace que el visitante asuma que está incluida (drip pricing, Ley 1480
art. 26).

**97.9 — Coste, contado.** Una visita cuesta **2 lecturas** por id canónico o por slug de venta, y 4
en el peor caso. El slug se resuelve contra el índice **en serie parando al primer acierto**: en
paralelo eran siempre 3. La ficha usa TTL de 5 minutos y no el de un día, porque la constante larga
presupone la purga por tag y §60.4 dejó verificado que la purga no existe.

**97.10 — Lo que NO se arregló aquí, y por qué.** `wrangler.jsonc` no tiene la clave `cache`: **Workers
Caching no está habilitado**, así que HOY todas las cabeceras `s-maxage` del portal son inertes y cada
visita paga sus lecturas. Es infraestructura con efectos de coste y de frescura en producción, y no se
toca como efecto colateral de un cambio de ficha. Queda en `10` con el cambio exacto.

**97.11 — Verificación.** 141 tests (61 nuevos) · `build`, `verify:build` y `verify:data` verdes · en
el navegador: 301 de `/ficha?id=`, 404 de slug inexistente, y las ramas de arriendo, zona con landing
y «vendido» comprobadas UNA A UNA con fixtures temporales revertidas · JSON-LD sin `streetAddress`,
sin `geo` y sin reseñas · cero recursos fallidos en pestaña limpia. ⚠️ **Contra datos reales no se
probó**: no hay catálogo. Los 14 tests de `buscar-ficha` recorren el mismo código con el cliente
inyectado y contando lecturas.

**97.12 — Método.** Se usaron dos workflows: uno de reconocimiento (5 lectores + síntesis) que produjo
la lista de trampas ANTES de escribir, y uno de revisión adversarial (4 lentes + un refutador por
hallazgo) que produjo 33 hallazgos de los que sobrevivieron 17. **La revisión encontró más bugs reales
que el recon**, y el refutador tumbó la mitad — incluidos los que yo ya había arreglado mientras
corría. Doctrina: §3.3 · §3.4 IAP · §G.2 🖥️ · §G.4 caza-bugs y destilar a skills.

## 98. ADR — Dos premisas que el portal daba por ciertas y no lo eran ⟦OPUS-5⟧ (2026-08-21)

> Ni una línea de funcionalidad nueva. Las dos cosas que se arreglan aquí estaban DOCUMENTADAS como si
> ya funcionaran.

**98.1 — Workers Caching llevaba sin habilitar desde Ola 0.** `lib/data/cache.ts` explica desde el
primer día que la caché se sienta DELANTE del Worker y que por eso un acierto cuesta CERO lecturas de
Firestore; sobre esa premisa se eligieron todos los TTL del portal. Pero `wrangler.jsonc` **no tenía la
clave `cache`**, así que cada `s-maxage` emitido era inerte y cada visita pagaba sus lecturas. El
modelo de coste entero descansaba sobre algo que nadie encendió. Se habilitó con
`cache: { enabled: true, cross_version_cache: false }`, y las dos decisiones tienen razón:
· la **clave se verificó contra `node_modules/wrangler/config-schema.json`** (definición `CacheOptions`)
y no de memoria ([[L-14]]);
· **`cross_version_cache: false`** hace que un DESPLIEGUE invalide lo cacheado — hoy no existe la purga
por tag (§60.4), así que republicar es la única palanca de invalidación que tenemos y conviene que
funcione.

**98.2 — Auditar ANTES de encender, no después.** Con la caché apagada, una ruta sin cabecera no tenía
consecuencia. Al encenderla, sí. El barrido de las 10 rutas SSR encontró dos sin ninguna cabecera, y
una de ellas es **`/alertas/baja?id=…&t=TOKEN`**: una URL con un secreto dentro que se habría guardado
en una caché compartida. Las dos van ahora `private, no-store`. El orden importó: encender primero
habría metido el token en la caché el mismo día.

**98.3 — El panel de gestión no tenía puerta.** §60.4 lo dejó anotado y hoy se verificó: **cero**
referencias a Auth en `gestion.astro`. La interfaz completa de administración se le mostraba a
cualquiera que escribiera la dirección. Ahora el panel **nace `hidden` en el HTML servido** (fail-closed:
si el script no corre, no se abre), sin sesión redirige a `/ingresar?volver=/gestion`, y con sesión sin
permiso muestra un mensaje claro en vez de un panel vacío que parece roto. Se espera a que Firebase
RESTAURE la sesión antes de decidir: leer el usuario sin esperar devuelve `null` en la primera pintura y
echaría al login a quien sí está dentro.
⚠️ **Está escrito en el código con todas las letras: esto NO es la frontera de seguridad.** Corre en el
navegador y se salta con la consola. La frontera real son las Rules, que aún no se despliegan.

**98.4 — Dos duplicaciones que iban a divergir.** La config pública de Firebase estaba en `client.ts` y
OTRA VEZ, a mano, dentro del script de `/ingresar` — con un `authDomain` que solo existía en la segunda
copia. Y el cargador de Auth vivía dentro de esa página, así que `/gestion` habría necesitado una
tercera. Ahora: `lib/config/firebase-publico.ts` (el valor) y `scripts/auth.ts` (el cargador). **La
excepción del gate `verify:data` se MUDÓ con el cargador**: el permiso apunta al dueño de la
responsabilidad en vez de multiplicarse por cada página que necesite sesión.

**98.5 — 🔴 EL HALLAZGO GORDO, verificado y sin resolver aquí: `isStaff()` es INSATISFACIBLE.** Las
reglas del portal definen `isStaff()` como `request.auth.token.admin == true` —un **custom claim**— y
con eso gatean toda la superficie interna: leads, captaciones (PII), contratos, pagos, expedientes,
alertas y el `list` de propiedades. Pero **`setCustomUserClaims` no aparece en NINGÚN sitio del
proyecto** (`grep` verificado; el único acierto es una plantilla dentro de una skill ajena). Nadie pone
ese claim nunca. Y el legacy usa un mecanismo DISTINTO: `get(/usuarios/{uid}).data.rol`.
⇒ El día que las reglas del portal se desplieguen, **el back-office queda inaccesible para todos,
incluido el dueño**, y no por un bug sino por un hueco entre dos sistemas de permisos que nunca se
presentaron. La decisión de cómo cerrarlo (claims sincronizados · reglas con `get()` · arranque manual)
toca seguridad y es cara de revertir, así que va a su propio ADR con deliberación adversarial.

**98.6 — Doctrina.** [[L-42]] cubre esto y se amplía: **lo que está escrito en un comentario no está
desplegado**. Pasó dos veces el mismo día — una defensa de seguridad que dependía de reglas sin
desplegar (§97.6) y un modelo de coste que dependía de una clave de configuración que nadie puso.
§3.3 (cada afirmación contra el archivo real) · §G.4 caza-bugs.

## 99. ADR — Decisión Fuerte: el claim de staff que nadie ponía ⟦OPUS-5⟧ (2026-08-21)

> Resuelve TODO-42, el hallazgo de §98.5. Deliberación adversarial (3 diseños independientes + un
> revisor de seguridad rompiendo cada uno + síntesis). Crudo → bóveda `2026-08-21-decision-claims-staff-crudo.json`.

**99.1 — El problema, verificado.** Las reglas del portal gatean su superficie interna con
`request.auth.token.admin == true` —un custom claim— y `setCustomUserClaims` **no aparecía en ningún
sitio del proyecto**. El legacy usa otro mecanismo (`usuarios.rol` leído con `get()` dentro de la
regla). ⇒ `isStaff()` era insatisfacible: al desplegar, el back-office moría para todos.

**99.2 — La decisión.** El claim `admin` se **DERIVA** del documento `usuarios/{uid}` mediante un
trigger `onDocumentWritten`, y vive en el codebase del **LEGACY** (`functions/index.js`), no en el del
portal. El documento manda; el token es su espejo, y nadie lo escribe a mano nunca. Se acompaña de una
callable de backfill y reconciliación, guardada por `requireSuperAdmin` — que lee el DOCUMENTO y no el
claim, y por eso funciona el día cero, sin ningún claim puesto y sin service account.

**99.3 — Por qué el claim y no un `get()` en las reglas.** El argumento que mató a la alternativa es de
COSTE y está verificado: un `get()` dentro de una regla **se ejecuta y se factura aunque la petición
acabe denegada**. Y en este portal `request.auth != null` no es un estado raro: `/ingresar` da sesión a
cualquiera con un Gmail. Un bucle desde la consola del navegador vaciaría las 50.000 lecturas diarias
del free-tier sin ser staff. Un claim cuesta CERO lecturas y ese vector no existe.
**Segundo motivo, que ninguna propuesta vio y sí el revisor**: `portal/firebase/storage.rules` tiene EL
MISMO helper insatisfacible gateando `/{allPaths=**}` del bucket privado donde viven cédulas y
contratos escaneados. Las Storage Rules **no pueden leer Firestore**, así que el claim es el único
mecanismo que arregla las dos mitades a la vez.

**99.4 — Por qué el documento como fuente de verdad.** El claim es buen caché y pésimo registro: no
tiene listado, ni autoría, ni interfaz — nadie puede responder «¿quién tiene acceso hoy?» mirando
tokens. `usuarios` ya tiene todo eso, ya está cerrado a `super_admin` y ya lo gestionan tres callables
probadas en producción. La pregunta nunca fue «claims sí o no» (es el único mecanismo que las Rules
leen gratis), sino **quién los escribe**. Respuesta: nadie a mano.

**99.5 — Por qué se despliega SOLO, separado del cutover.** Este cambio no toca una línea de reglas: el
ruleset vivo sigue siendo el del legacy, que no lee claims, así que nada cambia de comportamiento y
nada se puede romper. El claim empieza a existir hoy y queda verificado semanas antes de que el cutover
lo necesite. Atarlo al despliegue de reglas sería atar algo que funciona a algo que todavía no.

**99.6 — Detalles que salieron de intentar romperlo, no de razonarlo.** (a) El trigger **relee el
documento** en vez de usar el payload: los triggers son at-least-once y sin orden, así que un reintento
viejo tras una revocación dejaría el claim pegado en «concedido». (b) La revocación va **antes** del
corte por idempotencia: si el claim se escribió y la revocación falló, el reintento salía por el
early-return y no revocaba nunca. (c) `activo === true` **estricto**: un `"false"` tecleado como TEXTO
en la consola no puede conceder acceso. (d) El backfill **pagina de verdad** y su barrido de huérfanos
lleva **fusible** — solo corre si el censo salió COMPLETO, porque un censo parcial jamás puede
significar «revócaselo a todos». (e) `listUsers(1000)` a secas miente en silencio por encima de 1000
cuentas.

**99.7 — Riesgo residual, dicho sin adornos.** Al **revocar** hay hasta ~60 minutos de acceso de
LECTURA que sobreviven: las reglas validan la firma y la expiración del token, no si el permiso sigue
vigente, y ni revocar refresh tokens ni borrar la cuenta matan un token ya emitido. En un despido
conflictivo eso es una hora de descarga libre de `captaciones` (PII, dirección, comisión), `contratos`
y `pagos`. Para ese caso el procedimiento es manual y explícito. **Al conceder** pasa lo simétrico, y
ese sí se mitigó: el estado de «sin permiso» ofrece *Volver a comprobar*, que fuerza el refresco del
token. Y un `viewer` lee hoy lo mismo que un `super_admin` en el portal, porque `isStaff()` es un
único booleano; el claim lleva `rol` desde el primer despliegue precisamente para poder afinarlo
después sin re-emitir los tokens de todo el mundo.

**99.8 — Hallazgo de regalo, y es del tamaño del anterior: DESPLEGAR LAS REGLAS DEL PORTAL TAL CUAL
MATA `admin.html`.** Su `deny-all` final tumba las colecciones que el legacy sigue usando
(`loginAttempts`, `resenas`, `blog`, `auditLog`, `drafts_activos`, `newsletter`, `analytics_events`,
`system`, `usuarios/{uid}/drafts`), y el camino está trazado: `resetLoginAttempts()` corre dentro del
`try` del login sin catch propio, así que el rechazo salta al catch general y el dueño ve «Error
inesperado» **después de autenticar bien**. El ruleset del cutover tiene que ser FUSIONADO, no
sustituido, y las reglas del portal necesitan además un bloque para `usuarios` (o el dueño se queda
sin panel de permisos) y un escape de staff en `propiedades` (o el equipo pierde sus propias fichas de
vendidos y arrendados). Todo ello → TODO-43.

**99.9 — Verificación.** Las tres premisas del fallo se comprobaron contra el código ANTES de escribir
nada: `requireSuperAdmin` lee el documento · `storage.rules` tiene el mismo helper · la forma de
`usuarios` es la que escribe `createManagedUserV2`. Sintaxis del archivo validada (`node --check`);
141 tests del portal verdes; `verify:data` y `verify:build` verdes. ⚠️ **NO desplegado**: desplegar una
función que CONCEDE permisos de administrador es una acción que Daniel debe saber que ocurre, y además
él tiene que pulsar el botón de sincronizar después.

**99.10 — Doctrina.** §3.7 comité por iniciativa propia (decisión con consecuencias, cara de revertir) ·
§G.2 🛰️ Decisión Fuerte · §3.3 (las premisas del fallo verificadas por mí, no aceptadas) · §G.4
captura: crudo en bóveda + síntesis aquí, commiteados en el mismo cierre.

## 100. ADR — Ruleset ÚNICO y fusionado: desplegar deja de ser un acto de fe ⟦OPUS-5⟧ (2026-08-21)

> Cierra TODO-43, el bloqueador que destapó §99.8. Con esto el cutover deja de tener una bomba dentro.

**100.1 — El problema.** Había **dos** rulesets con el mismo nombre: el de la raíz (el VIVO, del sitio
legacy) y el del portal (escrito en Ola 0.7 y nunca desplegado). Firestore **no fusiona**: el último
despliegue REEMPLAZA. Así que desplegar el del portal tumbaba de golpe las colecciones que `admin.html`
sigue usando, y el camino estaba trazado hasta el síntoma: `resetLoginAttempts()` corre dentro del
`try` del login sin catch propio, así que el rechazo salta al catch general y el dueño vería
**«Error inesperado» DESPUÉS de autenticar bien**. Y con dos `firebase.json` apuntando cada uno al
suyo, desplegar desde la carpeta equivocada revertía el otro **en silencio**.

**100.2 — La forma de la solución.** Un solo `firestore.rules` y un solo `storage.rules`, en
`portal/firebase/`, con los DOS `firebase.json` apuntando a ellos. Los anteriores quedan en
`_legacy/*.PRE-FUSION` — no se borran: son la vuelta atrás de dos minutos.

**100.3 — Permisos por CLAIM: cero lecturas.** Los helpers ya no hacen `get()` a `usuarios`. Un `get()`
dentro de una regla **se factura aunque la petición se deniegue**, y aquí cualquiera con un Gmail está
autenticado: era un vector de agotamiento de cuota, no una preferencia de estilo (§99.3). El precio es
un **ORDEN de despliegue** que está escrito en el propio archivo: Functions del claim → sincronizar →
comprobar → reglas. Desplegarlas antes deja a todos sin ser staff.

**100.4 — Las decisiones de la fusión, que no fue copiar y pegar.**
(a) **`propiedades`**: el legacy tenía `allow read: if true`, o sea que cualquiera podía leer un
BORRADOR con su precio y sus notas. Se adopta la whitelist por estado del portal **más un escape de
staff** — sin él, el equipo perdería sus propias fichas de vendidos y arrendados en el panel.
(b) **Las escrituras de `propiedades` y `solicitudes` siguen permitidas POR ROL desde el cliente.** La
postura «toda escritura por Functions» es el destino, no el presente: `js/admin-properties.js` y
`js/admin-leads.js` escriben desde el navegador y las Functions de CRUD del portal no existen. Imponer
hoy la postura habría dejado el panel sin poder editar el catálogo. Lo que ya nace cerrado, nace cerrado.
(c) **`usuarios` sin recursión** (antes había que LEER `usuarios` para saber si podías leerla) y con la
escritura cerrada a las callables: **esa es la puerta que sostiene todo el modelo de §99**, porque
alguien que pudiera escribir su propio `rol` haría que el trigger se lo convirtiera en permisos reales.

**100.5 — Dos agujeros cerrados, los dos del ruleset VIVO.** `system` tenía
`allow write: if isEditorOrAbove() || !exists(...)`, y esa segunda mitad dejaba que un **anónimo**
creara cualquier documento nuevo. `newsletter` tenía `allow update: if true`: cualquiera podía
reescribir la suscripción de otro, correo incluido.

**100.6 — Y Storage, que nadie había mirado.** El ruleset del portal ponía `allow read, write: if
isStaff()` sobre `match /{allPaths=**}`. Eso no solo chocaba con el del legacy: lo **tapaba**. Las
imágenes de propiedades y la multimedia del sitio son de LECTURA PÚBLICA y habrían dejado de cargar el
día del despliegue. **Un bucket no se protege con un candado en la raíz**: lo privado —cédulas,
contratos escaneados— tiene ahora su propio prefijo, y lo público sigue público.

**100.7 — Verificación.** **80 tests contra el emulador real**, 21 nuevos, y el gate T6 que este mismo
archivo llevaba pendiente desde Ola 0.7 queda cumplido. Cubren: el legacy VIVO (`loginAttempts` abierto
—que es el que mata el login si se cierra—, reseñas y blog públicos, editor escribiendo, `auditLog`
inmutable incluso para el super_admin) · **el adversario que importa**, autenticado y sin permisos: no
lee leads ni captaciones ni contratos ni pagos, no lista propiedades, no lee un borrador y **no se
asciende a sí mismo** · la distinción viewer/editor/super_admin · los dos agujeros cerrados · el escape
de staff. Más 141 tests del portal y `verify:build` verdes.

**100.8 — Lo que queda para el día del cutover.** Desplegar en el orden escrito, y con los ojos en
`admin.html` inmediatamente después. La vuelta atrás está preparada y probada como concepto, no como
promesa: los ficheros anteriores están en `_legacy/` y el comando es el mismo apuntando allí.

**100.9 — Doctrina.** §3.3 (cada colección del legacy se verificó contra el código que la usa, no
contra una lista) · §3.4 IAP · §G.4 caza-bugs (los dos agujeros y el choque de Storage salieron de
recorrer el ruleset vivo, no el diff) · [[M-06]] (un gate solo existe si lo has visto disparar: por eso
21 tests nuevos y no una afirmación).

## 101. ADR — La bandeja de leads: la primera pantalla del back-office con datos reales ⟦OPUS-5⟧ (2026-08-21)

> Ítem 10 de OLA 1 («Admin v1 tras Auth»), su primera mitad de verdad. El panel ya tenía puerta (§98.3);
> ahora tiene contenido.

**101.1 — Por qué ESTA pantalla y no otra.** `/publicar` y el Rango capturan leads REALES desde §88 y
§94, y el aviso por correo lleva roto desde entonces (credenciales de Gmail, pelota 1 del `10`). O sea
que los leads entran y el dueño solo puede verlos abriendo la consola de Firebase. Esta pantalla cierra
ese hueco **sin depender de que el correo vuelva** — que es lo importante, porque el correo depende de
él y esto no.

**101.2 — Por qué aquí sí se usa el SDK de Firestore.** El gate `verify:data` lo prohíbe en todo el
portal, y con razón: protege las superficies PÚBLICAS, donde una lectura de más se multiplica por cada
visitante. **El panel no es público** — lo abren una o dos personas tras sesión y claim de staff — y la
propia doctrina lo contempla al decir «cero `onSnapshot` PÚBLICO (solo admin)». La excepción es por
patrón de archivo (`scripts/gestion-*.ts`), con el motivo escrito, y se comprobó que el gate **sigue
cazando** el mismo import fuera del panel (M-06: un gate solo existe si lo has visto disparar).

**101.3 — Decisiones que no son de maquetación.** (a) **Sin listeners**: `onSnapshot` en una pestaña
olvidada toda la tarde es el patrón que arruina una cuota, y aquí no compra nada porque los leads no
llegan cada segundo. Consulta acotada con `limit(50)` y a otra cosa. (b) **El teléfono es un enlace a
WhatsApp con el nombre ya dentro**: copiar un número a mano es la diferencia entre llamar en cinco
minutos o en cinco horas, y el proceso del dueño pide SLA de 5 minutos. (c) **Si la consulta toca el
tope, el KPI dice «50+»**, no «50»: un número exacto que en realidad está recortado es una cifra falsa
con aspecto de dato.

**101.4 — La regla que gobierna el fallo.** Si la lectura falla, los leads de MUESTRA se BORRAN y se
dice qué pasó. Dejarlos sería peor que un panel vacío: alguien llamaría a personas que no existen. Es
la misma disciplina de la ficha (§97.4) aplicada al back-office.

**101.5 — Dos trampas documentadas en el código.** `createdAt` llega con DOS formas —`Timestamp` del
SDK o texto ISO del endpoint REST— y asumir una sola no da error: pinta un guion en la columna de fecha
y nadie sabe por qué ([[L-17]] otra vez). Y un `orderBy` **excluye** los documentos que no tengan ese
campo: un lead sin `createdAt` sería invisible aquí y nadie lo sabría; hoy los dos caminos que escriben
leads lo ponen siempre, y ese comentario está justo encima de la consulta para el día que cambie.

**101.6 — Verificación.** 155 tests (14 nuevos, sobre la normalización, que es donde este proyecto ya
se quemó) · build, `verify:build` y `verify:data` verdes · el gate probado en las dos direcciones · el
panel sigue viajando `hidden` en el HTML servido. ⚠️ **NO verificado en vivo con datos reales**:
requiere una sesión de staff con el claim, que todavía no está desplegado (§99). Lo probado es la
lógica pura y que el panel no se abre sin permisos.

**101.7 — Lo que le falta al ítem 10.** CRUD de propiedades, cola de verificación y export. El CRUD
desde el panel ya es posible con el ruleset fusionado (§100 mantiene la escritura por rol), así que no
está gateado por nadie: es trabajo. **101.8 — Doctrina**: §3.2 (`limit()` obligatorio, cero listeners
públicos) · §3.3 (las clases del KPI se corrigieron contra el markup REAL, no de memoria — [[L-27]]) ·
§G.4 caza-bugs.

---

## 102. ADR — El runbook del cutover, y el interruptor que el CI no tenía ⟦OPUS-5⟧ (2026-08-21)

Con OLA 1 completa en código, la pregunta dejó de ser «¿está construido?» y pasó a ser «¿cómo se
enciende?». Al ir a responderla aparecieron dos cosas, y la segunda es la que asusta.

**102.1 — Causa raíz (doble).**

*(a) El interruptor que no existía.* §91 dejó el portal con un candado anti-`noindex`: sale
`noindex` + `Disallow: /` salvo que `PUBLIC_SITE_ENV=production`. Correcto — pero esa variable **no se
declaraba en ningún sitio del repositorio**. El workflow `portal-ci.yml` no la mencionaba, así que
TODOS los builds de la historia del repo, incluido el que habría ido al cutover, salían no indexables.
Y el fallo es silencioso: el sitio se ve perfecto, con la etiqueta que le pide a Google que lo ignore.
§91 nombró el riesgo en un comentario; el comentario no despliega nada ([[L-42]]).

*(b) El orden que solo existía en mi cabeza.* Los pasos del cutover estaban repartidos en seis
documentos (`50`, `portal/firebase/README`, §91, §99, §100, §101) y con dependencias de orden que fui
AÑADIENDO esta misma sesión: §99 obliga a desplegar los claims ANTES que las reglas, porque el ruleset
nuevo lee un claim que hasta hoy no ponía nadie; si se hiciera al revés, nadie sería staff y el panel
quedaría cerrado para todos, Daniel incluido. Reconstruir ese orden de memoria, un día de cutover, con
el dominio en producción, es exactamente cómo se rompen las cosas.

**102.2 — Solución estructural.** (a) Un bloque `env:` de nivel superior en `portal-ci.yml` con las
TRES perillas del cutover leídas de variables de repositorio y con valor por defecto seguro:
`PORTAL_SITE_ENV` (→ `staging`), `PORTAL_CATALOGO_SOURCE` (→ `demo`) y `PORTAL_MEDIA_BASE` (→ vacío).
Encender el sitio pasa a ser un cambio de variable en la interfaz de GitHub, sin tocar código ni pedir
una terminal. (b) **`specs/CUTOVER-RUNBOOK.md`**: un solo documento con las seis fases en orden, quién
hace cada paso (🧑 dueño / 🤖 Claude), **la verificación con evidencia de cada uno y su vuelta atrás**.
Los seis documentos que tenían trozos ahora APUNTAN al runbook en vez de repetir media secuencia — un
hecho, un dueño (§G.3).

**102.3 — No-regresión.** El bloque `env` no cambia el comportamiento por defecto: sin variables de
repositorio definidas, el CI construye exactamente igual que ayer (staging, catálogo demo, medios
locales). Ningún workflow más se toca; `og-publish.yml` y `bump-version.yml` siguen excluyendo
`portal/**`. `50` conserva su checklist SEO, que es la mitad que más caro sale equivocarse.

**102.4 — Verificación.** El interruptor probado **en las dos direcciones**, que es lo que faltaba:
con `PUBLIC_SITE_ENV=production` el build sale indexable (`noindex-en-home=false`,
`robots-Disallow-total=false`, `sitemap-declarado=true`) y de vuelta en staging vuelve a salir
bloqueado (`noindex=true`, `Disallow=true`). YAML válido con las tres claves. `brain:check` SANO, con
el runbook alcanzable desde el cerebro (gate #28) y su checklist con evidencia (gate #13).

**102.5 — Anti-patterns evitados.** No se puso `production` como valor por defecto «para que ya quede»:
un portal en `*.workers.dev` compitiendo con el dominio real es peor que uno no indexado. No se
escribió un runbook de pasos sin verificación — un paso sin evidencia es una intención. No se dio por
buena la cifra de pruebas que sostiene la fase 2: se contó (55 en `rules.test.ts`) en vez de repetir de
memoria el 80 del total de la suite.

**102.6 — Archivos.** Nuevo: `specs/CUTOVER-RUNBOOK.md`. Modificados: `.github/workflows/portal-ci.yml`
(bloque `env` + el porqué), `docs/50-CONFIG-INFRA.md` (apunta al runbook; su paso 1 ya no miente),
`specs/MEGA-PLAN-INMOBILIARIA.md` (OLA 1 completa en código; el gate de salida se ejecuta con el
runbook). INTACTOS: todo el código del portal, los rulesets y las Functions.

**102.7 — Doctrina.** §3.3 (el interruptor se probó, no se supuso) · §G.3 SSoT (el runbook es el dueño
del orden; los demás apuntan) · [[L-42]] (lo que está en un comentario no está desplegado) · §G.4
frescura: el runbook se actualiza en el MISMO cambio que añada una dependencia nueva.

---

## 103. ADR — El otro escritor: dos modelos en la misma colección, y un catálogo que salía vacío sin decir por qué ⟦OPUS-5⟧ (2026-08-21)

Salió de una pregunta de prioridad, no de un bug reportado. Con OLA 1 cerrada en código, ¿tocaba
construir el CRUD del panel nuevo (TODO-44) si `admin.html` ya tiene uno funcionando? Al ir a
comprobar si duplicaba trabajo, apareció que no duplicaba nada: **escriben cosas distintas**.

**103.1 — Causa raíz.** `admin.html` y el portal comparten la colección `propiedades` y escriben
modelos INCOMPATIBLES. El viejo (`js/admin-properties.js`) deja campos planos (`barrio`,
`habitaciones`, `coords`), el precio como **entero** y la operación como **`comprar|arrendar|dias`**;
el portal espera `geo`/`specs` anidados, el precio como **objeto** (`{valorVenta|canon|precioNoche}`) y
la operación como **`venta|arriendo|alojamiento`** — cero solapamiento en el enum. Y `leerPublicadas()`
hace `doc.data() as Propiedad`: un cast que el compilador acepta y que **no comprueba nada**. El
documento viejo entra, **pasa el filtro de publicadas** (su `estado: 'disponible'` sí coincide) y se
cae después, al leer un campo que en su modelo vive en otro sitio.

El síntoma es de los peores: **índice vacío, SERP diciendo «no hay resultados», cero excepciones, cero
logs de error.** Y encima con un diagnóstico equivocado — la omisión se atribuía a `sin-precio`, cuando
el precio SÍ estaba, solo que como entero. Eso manda a mirar donde no es.

**103.2 — Solución estructural.** `esEsquemaLegacy()` en el dominio, con un motivo PROPIO
(`esquema-legacy`) evaluado ANTES que los demás. No adivina: mira exactamente las dos cosas que el
modelo sellado cierra — que la `operacion` esté en `OPERACIONES` y que `precio` sea un objeto. Basta
una para delatarlo, porque una migración a medias es tan inservible como ninguna. El MISMO predicado se
aplica en `buscarFicha()`: el índice ya filtra, pero el id del legacy **lo teclea una persona** y nada
le impide escribir uno con forma canónica, y esa rama se salta el índice — sin el guardián saldría una
ficha con título y foto, sin precio, con aspecto de correcta y encima indexable. Y el doc de control
pasa a guardar `omitidasPorMotivo`: «omitidas: 5» a secas no responde ninguna pregunta.

**103.3 — No-regresión.** Ni una propiedad del modelo nuevo cambia de comportamiento (hay test que lo
fija). El predicado es puro y aditivo; `precioDisplay`, `esPublicada` y `construirIndices` intactos en
su lógica. `admin.html` y su CRUD, sin tocar: sigue siendo el panel del legacy y sigue funcionando para
lo suyo.

**103.4 — Verificación.** La prueba se escribió ANTES del arreglo y con la carga REAL que arma
`js/admin-properties.js` (no una inventada): reprodujo el índice vacío y el motivo `sin-precio`
engañoso. 163 tests verdes (8 nuevos) · `build`, `verify:build` y `verify:data` verdes.

**103.5 — Anti-patterns evitados.** NO se metió una capa anticorrupción que tradujera el modelo viejo
al nuevo: con ~5 propiedades legacy sería sostener dos esquemas para siempre a cambio de ahorrar cinco
altas a mano. NO se dejó el desajuste dentro del cubo de `sin-precio` «porque total, se omite igual»:
el motivo ES el diagnóstico. NO se afirmó el defecto de memoria — se leyeron los dos escritores y se
demostró con un test.

**103.6 — Archivos.** Modificados: `portal/src/lib/domain/catalogo.ts` (+ test),
`portal/src/lib/data/buscar-ficha.ts` (+ test), `portal/functions/src/catalogo-rebuild.ts`,
`specs/CUTOVER-RUNBOOK.md` (aviso en la fase 4). INTACTOS: `admin.html`, `js/admin-properties.js`,
rulesets, el resto del portal.

**103.7 — Lo que esto DESBLOQUEA, y por qué TODO-44 deja de ser opcional.** La fase 4 del runbook decía
«cargar las primeras propiedades» y **no tenía herramienta detrás**: el único CRUD que existe escribe el
modelo que el portal descarta. O sea que el portal necesita su propio alta de propiedades no como mejora
del back-office, sino como **requisito del cutover**. El runbook ya lo dice donde se va a leer.
**103.8 — Doctrina**: §3.3 (evidencia antes de afirmar: se leyeron los dos escritores) · §G.4 caza-bugs
(al tocar el catálogo se recorrió también la ficha, que era donde estaba el hueco) · nueva [[L-45]].

---

## 104. ADR — El gate legal del RNT protegía la ficha y dejaba pasar la card ⟦OPUS-5⟧ (2026-08-21)

Encontrado aplicando la regla (e) de [[L-45]] —*el mismo guardián en TODOS los lectores del almacén*—
una hora después de escribirla. Es la segunda vez en el mismo día que esa regla cobra, lo cual dice
menos de la suerte y más de que era la regla correcta.

**104.1 — Causa raíz.** `publicable()` bloquea la ficha de un **alojamiento turístico sin RNT** (gate
B3: anunciar hospedaje sin Registro Nacional de Turismo expone a cierre inmediato del establecimiento).
Está bien escrita, es fail-closed y tiene tests. Pero **solo la llamaba la ruta de la ficha**: el índice
del catálogo, que construye las cards del SERP, no la miraba. O sea que un alojamiento sin RNT habría
salido en `/estancias` con su foto, su título y su precio —**que es exactamente la publicidad que el
gate existe para impedir**— y encima enlazando a una ficha que devuelve 404. El guardián estaba puesto
en la puerta que menos tráfico tiene.

**104.2 — Solución estructural.** `publicable()` se muda de `ficha.ts` a **`propiedades.ts`**: no es un
detalle de la vista de ficha, es un **invariante legal del modelo**, y además `catalogo.ts` no puede
importar de `ficha.ts` sin crear un ciclo (`ficha` → `catalogo` ya existe). El modelo es el dueño de sus
invariantes, así que cualquier lector puede exigirlo sin acoplarse a una vista. `propiedadAResumen` lo
aplica con motivo **propio** (`sin-rnt`) y **antes** que los gates de datos: un bloqueo legal no se
diagnostica como «le falta el precio».

**104.3 — No-regresión.** Venta y arriendo no cambian (hay test). La ficha se comporta igual: el mismo
predicado, movido, con sus llamantes reapuntados (`inmueble/[slug].astro` y el test). Ningún otro
lector, ninguna regla, ninguna Function.

**104.4 — Verificación.** 168 tests verdes, 5 nuevos, incluido uno que fija explícitamente que **listado
y ficha no pueden discrepar**. Y la propia suite delató algo: el fixture `D1` de la prueba de sharding
era un **alojamiento sin `rnt`** — la batería de pruebas llevaba modelando un anuncio ilegal como si
fuera el caso normal. Corregido, con el porqué escrito al lado para que no vuelva.

**104.5 — Anti-patterns evitados.** NO se dejó `publicable()` en `ficha.ts` importándolo con un ciclo
«porque total, funciona». NO se metió el bloqueo legal en el cubo de `sin-precio`. NO se relajó el gate
para que el fixture siguiera pasando — se corrigió el fixture, que era el que estaba mal.

**104.6 — Archivos.** Modificados: `portal/src/lib/domain/propiedades.ts` (recibe `publicable`),
`ficha.ts` (lo cede), `catalogo.ts` (lo aplica), `inmueble/[slug].astro` y los dos tests. INTACTOS:
rulesets, Functions, resto del portal.

**104.7 — Lo que deja dicho para el CRUD (TODO-44).** El formulario de alta **no puede permitir guardar
un alojamiento sin RNT como disponible**: si lo permite, el sistema aceptará el dato y luego lo
esconderá, que es la forma más cara de decir que no. El escritor tiene que validar con los MISMOS
predicados que el lector — es la lección entera de [[L-45]] aplicada al alta.
**104.8 — Doctrina**: §3.3 · §G.4 caza-bugs (recorrer TODOS los lectores, no solo el que tocaste) ·
[[L-45]](e) · gate legal B3 de `42-LEGAL`.

---

## 105. ADR — «Avalúo»: dos páginas ofreciendo lo mismo con nombres distintos ⟦OPUS-5⟧ (2026-08-21)

Era el punto (a) de TODO-39, aparcado en §93.6 como *«dos fuentes del cerebro se contradicen en algo con
peso legal, así que no se cambió por cuenta propia»*. Se desbloqueó leyendo la regla de verdad en vez
del resumen de la regla.

**105.1 — Causa raíz, y por qué la nota estaba mal planteada.** El `10` lo resumía como «B13 PROHÍBE la
palabra». `42-LEGAL §9` dice algo más estrecho y más útil: **nunca llamar «avalúo» a NUESTRA
estimación** (Ley 1673/2013 — el avalúo es actividad regulada; solo avaluadores inscritos en el RAA).
No es un veto al vocabulario: es un veto a **atribuirse una actividad regulada**. Con esa lectura, el
caso deja de ser ambiguo y se parte limpio en dos.

Y el sitio contenía su propia contradicción, página contra página: `/rango-altorra` capta propietarios
llamándolo «Rango», con disclaimer y sin usar jamás la palabra (§94), mientras `/publicar` capta
**exactamente lo mismo** —el dueño deja sus datos, un asesor le devuelve un precio— bajo el título
**«Solicita tu avalúo gratis»** y sin aviso ninguno. Gratis + nuestro + llamado avalúo es la forma
exacta que la norma persigue: si lo regalas es porque no lo estás encargando a un inscrito.

**105.2 — Solución estructural: el corte por quién produce el número.** (a) Donde el texto describe **a
un asesor de ALTORRA fijando el precio** —H2 del formulario, botón, mensaje de éxito, hero, paso 02,
tarjeta de beneficio, CTA del plan, «Avalúo gratis» del footer, subtítulo del menú— se renombra a
**valoración**, y `/publicar` gana el **disclaimer** con el mismo tratamiento visual que el de
`/rango-altorra` (filo de oro, texto suave: se lee como nota honesta, no como letra pequeña). (b) Donde
el texto **reclama una línea de servicio** —«Avalúos» en el menú Gestión, «Avalúo y fotografía
profesional» en el plan Premium— **no se toca**: si ALTORRA lo contrata a un avaluador inscrito son
correctos, y si no, sobran. Eso es un **HECHO que solo tiene Daniel**, no una decisión de redacción, y
el porqué quedó escrito EN EL CÓDIGO junto a cada uno para que no parezca un olvido.

**105.3 — La otra mitad de la contradicción.** La skill `catalogo-voz-altorra` usaba «Avalúo» suelto en
el menú de WhatsApp y en la guía de registro por línea de negocio. Corregida en AMBAS copias (§33): sin
esto, el próximo «yo» vuelve a escribir la palabra con toda la razón del mundo, porque la voz de marca
se la estaba pidiendo. Arreglar el sitio y dejar la fuente intacta es arreglar el síntoma.

**105.4 — Verificación EN VIVO** (no solo build): `/publicar` sirve H2 «Pide tu valoración gratis»,
botón «Pedir valoración», y el aviso con `border-left` **`rgb(212,175,55)`** — el dorado oficial, no un
color inventado. Barrido del texto renderizado: solo quedan dos «avalúo» en la página, el del propio
disclaimer y el del plan pagado que se dejó a propósito. 168 tests + `build` + `verify:build`.

**105.5 — Anti-patterns evitados.** NO se borró la línea de servicio del menú «para ir a lo seguro»:
quitarle a un negocio un servicio que quizá sí presta no es prudencia, es decidir por él. NO se dejó el
formulario gratuito como estaba esperando a que Daniel opinara: ahí no había nada que opinar, había una
norma y una página hermana que ya la cumplía. NO se tocó solo el sitio dejando la skill contradiciéndolo.

**105.6 — Archivos.** `portal/src/pages/publicar.astro` (copy + disclaimer + estilo), `Footer.astro`,
`Header.astro`, `skills/catalogo-voz-altorra/SKILL.md` (×2 copias),
`skills/legal-colombia/SKILL.md` (×2 — la regla transferible). INTACTOS: `/rango-altorra`, que ya
estaba bien, y toda la capa de datos.

**105.7 — Lo transferible** (a `legal-colombia`): usar en publicidad el nombre de una **profesión
regulada** ya es ejercerla a ojos del regulador; la señal de alarma es el combo **`gratis` + `nuestro`**;
y al auditar, distinguir el texto que describe *tu propia estimación* (se corrige sin preguntar) del que
**reclama una línea de servicio** (depende de un hecho del dueño: se pregunta, no se reescribe).
**105.8 — Doctrina**: §3.3 (se leyó `42-LEGAL §9`, no el resumen del `10` — que es lo que llevaba el
caso bloqueado) · §G.4 destilar a skills · gate B13.

---

## 106. ADR — Dos campos con tres lectores cada uno, y el recon que tumbó el plan del CRUD ⟦OPUS-5⟧ (2026-08-21)

Iba a construir el alta de propiedades (TODO-44). Antes de escribir una línea lancé un reconocimiento
de 4 lectores independientes —legal, lectores del dato, formulario del panel viejo, design system— con
un adversario verificando el dossier contra el repo. **Ninguno de los hallazgos que más importan estaba
en el dossier: salieron de la crítica.** Crudo en la bóveda, 852k tokens.

**106.1 — Dos defectos VIVOS, ya desplegables, del patrón [[L-45]](e).**

*(a) `geo.ciudad`.* Tres lectores del mismo campo, dos optimistas y uno fail-closed.
`exhibeMatricula()` decide con `startsWith('cartagena')`, así que sin ciudad devuelve `false` y oculta
la matrícula; pero `ubicacionPublica()` y el JSON-LD caían en `|| 'Cartagena de Indias'`. Con el campo
vacío, el resultado era **un arriendo afirmándole al visitante Y a Google estar en Cartagena mientras
omitía la Matrícula de Arrendador que la Ley 820 art. 31 exige en TODA publicidad de arriendo**. Un
dato ausente convertido en publicidad sin habilitación, sin un solo error por ninguna parte. Y encima
`addressRegion: 'Bolívar'` iba FIJO: un inmueble de otra ciudad salía en el departamento equivocado.

*(b) `imagenPortada`.* El índice y el Open Graph usaban `??` —que solo cae al respaldo con
`null`/`undefined`, **no** con cadena vacía— mientras el componente de la ficha usaba `||`, que sí cae.
Con `imagenPortada: ''` la ficha se veía entera y, a la vez, no había card en el listado **ni imagen al
compartir el enlace** — que en este negocio es el canal principal.

**106.2 — Solución: un dueño por campo, y nadie inventa.** `ciudadDe()` y `departamentoDe()` en
`ficha.ts`, `portadaDe()` en `propiedades.ts`. Sin ciudad no se afirma ninguna y el `address` sale
incompleto —que es válido en Schema.org; uno que miente, no—; el departamento se DERIVA de la ciudad y
se omite si no se sabe. Una cadena vacía es **ausencia**, no un valor. 8 tests nuevos que fijan
explícitamente que los tres lectores coincidan pase lo que pase con el dato.

**106.3 — Lo que el recon le hizo al plan de TODO-44 (esto es lo caro).** Cuatro premisas sobre las que
iba a construir, refutadas con evidencia:

1. **Las fotos no tienen camino.** `R2_MEDIA` existe **solo** como binding en `wrangler.jsonc`: cero
   usos en `portal/src`, ni endpoint de subida ni URL firmada. Y copiar el flujo del panel viejo rompe
   el build: `verify:data` prohíbe `firebase/storage` en TODO `portal/src`, y la excepción de
   `scripts/gestion-*` cubre `app|auth|firestore` — **storage no**. Sin portada no hay card, así que
   **el alta no puede producir una propiedad publicable hasta que exista un endpoint de subida a R2**.
   Ese endpoint es ahora el primer trabajo de TODO-44, no un extra.
2. **`_version` no protege a quien de verdad usa el panel.** La regla es
   `esSuperAdmin() || (esEditorOMas() && versionCreacionValida())`: Daniel es super_admin y **bypassa**
   el bloqueo optimista en create y en update. El compare-and-set del servidor es real para editores;
   para el dueño, no. La defensa del alta tiene que ser un `tx.get()` dentro de la misma transacción.
3. **`captaciones` es `write: false`** en el ruleset nuevo y ni existe en el vivo, y la Function que
   sería su escritor no está escrita. Así que «la PII se mueve al documento privado» **no es
   implementable desde el cliente**: o el alta pasa por un callable, o la primera fase no captura PII.
4. **Nada de lo que guarde el formulario aparecería todavía.** La Function que escribe el índice es la
   FASE 3 del cutover (sin desplegar) y el SERP corre con `PUBLIC_CATALOGO_SOURCE=demo`. El panel debe
   **decirlo en pantalla**, o el primer alta real dispara la cacería de un bug que no existe.

**106.4 — La respuesta a la trampa de §103, que es el corazón del alta.** El escritor debe correr los
MISMOS predicados que el lector, **llamándolos**, no reimplementándolos: una función
`problemasParaPublicar(p)` que invoque `esPublicada` + `propiedadAResumen` y devuelva los motivos. Y un
test que fije el contrato: *para todo documento que el formulario acepte publicar, `construirIndices`
devuelve `omitidas: []`*. Sin ese test, la próxima regla que se añada al lector reabre el hueco.

**106.5 — Anti-patterns evitados.** NO se construyó el formulario con el dossier: cuatro de sus
premisas eran falsas o estaban desfasadas, y el adversario costó una fracción de lo que habría costado
descubrirlo con el código escrito. NO se «arreglaron» los lectores optimistas poniéndolos a todos a
inventar Cartagena: la dirección correcta es la fail-closed.

**106.6 — Archivos.** `domain/ficha.ts` (+`ciudadDe`/`departamentoDe`), `domain/propiedades.ts`
(+`portadaDe`), `domain/catalogo.ts`, `components/FichaInmueble.astro`, `pages/inmueble/[slug].astro`,
+8 tests. **106.7 — Doctrina**: [[L-45]](e) por tercera vez en un día · §3.3 · §G.4 (crudo en bóveda +
esta síntesis) · §3.7 (el recon fue por iniciativa propia, y pagó).

---

## 107. ADR — Identidad en el edge, y las fotos ya tienen camino ⟦OPUS-5⟧ (2026-08-22)

Primer eslabón de TODO-44, en el orden que fijó el recon de §106: antes del formulario, el sitio donde
van las fotos. `R2_MEDIA` llevaba declarado desde Ola 0 —binding en `wrangler.jsonc`, bucket creado por
Daniel en §21— y **sin una sola línea de código que subiera nada**. Como `propiedadAResumen` omite con
`sin-imagen`, sin portada no hay card: el alta no podía producir una propiedad publicable.

**107.1 — El problema real no era R2, era la puerta.** A R2 **no llegan las Security Rules de
Firebase**. El Worker es el único sitio donde se puede decidir quién escribe en el bucket, y hasta hoy
toda la superficie pública del portal era lectura anónima: no existía ninguna forma de contestar
«¿quién eres?» en el edge. Descartados, con su razón: `firebase-admin` no corre en Workers y además
`verify:data` lo prohíbe en todo `portal/src`; un secreto compartido con el cliente no es un secreto;
y preguntarle el rol a Firestore es una lectura facturable por subida, justo lo que §99 decidió evitar
al meter el permiso DENTRO del token.

**107.2 — Solución: verificar el ID token con WebCrypto.** Un ID token de Firebase es un JWT RS256
sobre claves públicas de Google. `lib/auth/verificar-id-token.ts` lo verifica sin dependencias, sin
lecturas y comprobando el **mismo claim `admin`** que leen las Rules — así una puerta no puede abrirse
con la otra cerrada. Decisiones que importan: `alg` **fijo** a RS256 (aceptar el de la cabecera es el
agujero clásico del JWT: con `none`, o con un HMAC cuya clave es la pública de Google, cualquiera se
firma sus propios tokens); las comprobaciones baratas van **antes** que la criptografía, porque
rechazar mirando datos sin firmar es seguro —nunca se ACEPTA por ellos— y evita que un token inventado
nos haga trabajar; el motivo del rechazo **viaja al cliente**, porque no le dice nada útil a un
atacante y le ahorra una tarde a quien tenga el reloj desfasado; y las claves de Google se cachean
respetando SU `max-age`, con la copia vieja como red si Google no responde.

**107.3 — El endpoint.** `POST /api/media/subir?propiedad=INM-…&n=N`. Comprueba identidad **antes de
leer el cuerpo** (uno que carga 3 MB y luego dice «no autorizado» es un amplificador); la clave la
compone el SERVIDOR y el cliente nunca propone la ruta; solo WebP y 3 MB, porque convertir en el
navegador —donde ya hay un canvas— sale gratis y hacerlo en el edge cuesta CPU por subida; la posición
va en el nombre, así que resubir **reemplaza** en vez de dejar basura huérfana que nadie limpia; y
devuelve la **CLAVE, nunca la URL** — devolver una URL sería invitar a guardarla en `imagenes[]`, que
es exactamente el defecto que ya tiene la semilla del proyecto. Sin binding (en `astro dev`) lo dice en
vez de fingir que guardó.

**107.4 — Verificación.** 30 tests nuevos (210 en total). Los del token **no usan tokens de mentira**:
generan un par RSA de verdad, firman el JWT y lo verifican — cubren `alg:none`, confusión de algoritmo,
carga manipulada conservando la firma, otro proyecto de Firebase, caducidad con la holgura de reloj,
rotación de claves y caída de red. El endpoint JWK de Google se comprobó **en vivo** antes de escribir
código contra él (`{keys:[{kty,alg,use,kid,n,e}]}`, 4 claves), en vez de asumir su forma. En vivo: sin
token `401 ausente`, token basura `401 malformado`. `build`, `verify:build` y `verify:data` verdes.

**107.5 — Lo que NO está verificado, y dónde se verifica.** El `put` real contra el bucket **no se ha
ejercitado**: hace falta un token con el claim `admin`, y ese claim depende de la **fase 1 del
runbook** (§99). Está anotado en el runbook como paso de verificación en vez de darse por bueno — un
camino que nunca ha corrido no es un camino probado, por muchos tests que tenga alrededor.

**107.6 — Archivos.** Nuevos: `lib/auth/verificar-id-token.ts` (+test), `lib/media-subida.ts` (+test),
`pages/api/media/subir.ts`. INTACTOS: la capa de datos, las Rules, las Functions y el resto del portal.
**107.7 — Doctrina**: §3.3 (el contrato externo se verificó, no se supuso) · §3.6 (la puerta vive donde
está la frontera real) · §99 (el permiso viaja en el token) · contrato de `media.ts`.

---

## 108. ADR — El alta de propiedades: todo menos la pantalla ⟦OPUS-5⟧ (2026-08-22)

Eslabones 2 y 3 de TODO-44, en el orden que fijó §106. El formulario se queda para el final por una
razón de gobernanza, no técnica: el `10` prohíbe **UI sin mockup** y el recon confirmó que el mockup
del panel no tiene ni un `<form>`. Así que primero todo lo que no es pantalla — que además es donde
están las decisiones.

**108.1 — El contrato del escritor, que es la respuesta a §103.** El defecto de fondo de aquel caso no
fue el esquema viejo: fue que **escritor y lector no compartían las reglas**, y por eso se podía
guardar algo que el catálogo descartaba en silencio. La defensa no es «acordarse de validar». Es
`problemasParaPublicar()`, que **llama** a `esPublicada` y a `propiedadAResumen` en vez de reproducir
sus condiciones: si mañana el índice añade un motivo, el formulario se entera solo. Para poder darlos
TODOS de una vez —un formulario que revela los fallos de uno en uno obliga a guardar cuatro veces— las
condiciones se extrajeron a `motivosDeOmision()`; `propiedadAResumen` sigue devolviendo el primero,
porque al índice le basta. El test del contrato va en las **dos direcciones**: lo que el alta acepta
publicar, `construirIndices` no lo omite; y si el índice omite algo, el escritor tenía que haberlo
visto venir. Ese test es lo que impide que la próxima regla del lector reabra el hueco.

**108.2 — Dos parsers numéricos, y no por gusto.** El primer intento tenía uno solo. Una prueba falló
con `$ 450.000.000` y al arreglarla apareció lo interesante: en un **precio** colombiano el punto
separa miles, pero en una **coordenada** el mismo punto es el decimal. Un parser «listo» que intentara
adivinar convertiría `lat: 10.399` en la latitud **10399** — un inmueble de Cartagena en mitad del
Ártico, sin un solo error. Son dos dominios distintos y ahora son dos funciones distintas. Lo destapó
un test, no un repaso: es exactamente lo que valen.

**108.3 — Lo que se arregló de paso.** (a) El **slug**: el generador de semilla usa
`replace(/[^a-z]+/g,'-')`, que **borra los dígitos y convierte cada tilde en un guion** («Centro
Histórico» → `centro-hist-rico`, «Villa 7» → `villa-`). La versión buena normaliza NFD y conserva
dígitos. (b) El **código va al final del slug** por construcción, no por estética: el índice lo escribe
una Function con retardo, así que dos altas seguidas no pueden comprobar la unicidad la una contra la
otra. (c) La **vertical** sube al dominio con tests, y ante la duda sugiere **vivienda** — equivocarse
ahí solo prohíbe de más, mientras clasificar una vivienda como comercial permitiría cobrar un depósito
PROHIBIDO por el art. 16 de la Ley 820. (d) Al agotarse la secuencia del mes se **PARA**: emitir
`INM-202608-10000` daría un id que `ID_PROPIEDAD_RE` no sabe leer y la ficha devolvería 404 para un
inmueble que existe.

**108.4 — La transacción, y el `_version` que no protege a quien usa el panel.** El código sale de un
contador compartido por DOS escritores (este panel y el legacy), así que leer-modificar-escribir fuera
de una transacción es la condición de carrera de manual — [[M-04]] ya la pagó. Pero lo que obliga al
`tx.get` del documento es otra cosa: la regla es `esSuperAdmin() || (esEditorOMas() &&
versionCreacionValida())`, o sea que **el compare-and-set del servidor existe para los editores y NO
para el super_admin**, que es justo el usuario real del panel. Si el contador se desincronizara, un
`set` sin comprobar BORRARÍA el inmueble que hubiera en ese código. El cuerpo de la transacción va
separado del SDK para poder probarlo entero: un contador con basura o un código ocupado no se
reproducen en un emulador sin montar carreras, y sí con una `tx` falsa.

**108.5 — Anti-patterns evitados.** NO se reimplementaron las condiciones del lector en el escritor
«porque son cuatro líneas» — esa copia ES §103. NO se escribió el contador entero (habría borrado las
secuencias de los otros meses y las del panel viejo). NO se construyó la pantalla saltándose la regla
del mockup: se hizo el mockup y se pidió el visto bueno.

**108.6 — Archivos.** Nuevos: `domain/alta-propiedad.ts` (+test), `scripts/gestion-alta.ts` (+test),
`design/mockups/ALTORRA Gestion-Alta.dc.html`. Modificado: `domain/catalogo.ts`
(`motivosDeOmision` + `problemasParaPublicar` + `explicarProblema`), con el comportamiento del índice
INTACTO — sus 20 pruebas pasan sin tocarlas. **262 tests** en total.

**108.7 — Lo que falta y qué lo gatea.** Solo la pantalla, y la gatea el visto bueno del mockup. El
resto del CRUD (editar, cola de verificación, export) sigue abierto en TODO-44.
**108.8 — Doctrina**: §3.3 · §3.6 (la validación vive donde no puede divergir) · [[L-45]] · [[M-04]] ·
[[L-09]] (`set` sin merge para crear) · regla del `10`: NUNCA UI sin mockup.

---

## 109. ADR — Auditoría Nivel-2 #8: el ✅ que no se había ganado ⟦OPUS-5⟧ (2026-08-22)

> **Deliberación**: cruda en `research-archive/2026-08-22-auditoria-cerebro-nivel2-8-inmobiliaria.md`
> (tabla de 14 hallazgos) + `journal.jsonl` de `wf_5668d8cb-f02`. 9 agentes, 1,4 M tokens.

**109.1 — La disparó el GATE, no una persona.** Es la primera de la serie: `maxAdrGap: 12` con 18 ADRs
nuevos y la gracia agotada, así que `brain:check` empezó a **bloquear los commits**. Se corrió en vez
de saltarla, que era la otra opción y la mala.

**109.2 — El hallazgo que engloba a los demás: el ✅ INMERECIDO.** Todos los gates verifican integridad
**referencial** —¿existe la referencia?, ¿la línea apunta a un header?— y **ninguno verifica que la
comparación que dicen hacer se haya hecho**. Tres pruebas independientes: el **#27** imprime «ninguna
ruta fantasma» habiendo perdonado **90 rutas por coincidencia de nombre base** (`21` escribe `src/…`,
el repo tiene `portal/src/…`); el **#16** aprueba «CF: 9 en código» contra **11 exports reales**,
porque mide la EDAD del claim y jamás el claim; y el **#4** lleva desde siempre con cero cruces
posibles sin decirlo. El remedio ya está inventado DENTRO del kernel y no se generalizó —el contador
`cacheCruces` de v1.9.0—: **un gate con 0 comparaciones útiles debe DEGRADAR (🟠), no aprobar**. Eso
convierte «¿qué gate lleva dos auditorías sin cazar nada?», que hoy cuesta una auditoría entera, en una
línea gratis de cada arranque. Es el ataque real al 68 % de coste de mantenimiento.

**109.3 — GC pareado, con una poda que la auditoría se ganó.** Se **borra `CLAUDE.md §4`** (271 c en un
router al 99,5 %). Su gate no puede cruzar nada, verificado en tres frentes: `APP_VERSION` no existe en
`js/`, el `05` dejó de traer el dato de caché por diseño en la era heartbeat, y el valor sí existe pero
en un sidecar que el gate no lee. Encima vigila el Service Worker del **legacy RETIRADO**, sin tocar en
43 días. **No se destruye conocimiento**: la regla de bumpear `CACHE_NAME` sigue viva en §3.2. Boot
**31 345 → 31 106 c**, y con TODO-45 dentro cierra en **31 448 c** — por debajo de donde empezó.

**109.4 — Cuatro reincidentes, una sola raíz.** Censo de páginas (4 respuestas otra vez), memoria del
harness (dos hechos derogados en el índice que se auto-carga entero), gate #27 unidireccional y el
conteo de mockups. Los cuatro comparten lo que la #7 ya había nombrado en [[M-10]]: **una capa o una
dirección sin gate no produce hallazgos, produce silencio — y el silencio se lee igual que un ✅.** Que
se repita no refuta la lección: la confirma, y prueba que el remedio no es otra lección sino el
`degrade()`.

**109.5 — El aviso con fecha.** A los 200 ADRs no revienta el `99` (3 931 c por ADR, se lee por
offset): revienta el **ÍNDICE**, y no en 92 ADRs sino en **unos 4**. Está en 22 k/24 k y la fila se ha
triplicado por era (104 c → 220 c → 314 c; las nuevas, 440-455 c) porque se escribe como **resumen del
ADR** en vez de como ruteo. La regla ya está escrita —el propio gate #26 declara ≤200 c— y no se
aplica. Con 2 lápidas en 108 ADRs, además, el shard por rango crece sin techo.

**109.6 — Y la contradicción entre sondas, que es la parte útil.** La sonda de economía quiere podar
995 c de bitácora del `10` porque ya son ADRs cerrados; la sonda de drills documenta que **esas líneas
exactas son lo que hizo acertar a 3 de los 4 drills**. Las dos tienen razón por separado y juntas dan
una instrucción destructiva. El orden correcto queda fijado en TODO-45: **primero la capa semántica,
después la poda**. Al revés se cambia margen de contexto por ceguera de ruteo. Los 4 drills acertaron
sin adivinar, pero **ninguno pasó por el enrutador oficial**: pasaron por la pizarra.

**109.7 — Curado en la sesión.** `TODO-44` declaraba pendiente trabajo ya pusheado · el `05` copiaba un
censo viejo y remitía al dueño equivocado (ahora APUNTA a `21`, que es el dueño) · `21` con el conteo
real (24 `.astro` + 9 endpoints) · el `10` con 10 mockups · `MEMORY.md` con sus dos hechos derogados ·
y un dump de 117 KB del panel `/gestion` que había quedado en `portal/public/`, que Astro copia
VERBATIM al build. Ese último destapa un hueco de ALCANCE: `workDirs` es `["specs"]`, así que **nada en
el cerebro mira lo que el portal PUBLICA**.

**109.8 — Doctrina**: §G.4 (auditoría + captura de deliberación) · [[M-10]] · [[M-05]] (el techo no se
mueve: se podó para que TODO-45 entrara) · §G.3 SSoT (el `05` apunta, no copia).

---

## 110. ADR — El listado de inmuebles, y la columna que desmiente al estado ⟦OPUS-5⟧ (2026-08-22)

**110.1 — El hueco.** Desde §108 el panel sabía CREAR un inmueble y no sabía enseñarlo. Quien diera de
alta una propiedad no volvería a verla desde el portal: tendría que abrir la consola de Firebase para
comprobar si quedó bien, corregir un precio o saber si está publicada. **Un CRUD que solo hace la C es
un formulario.** Y el hueco no lo señaló ningún gate — lo señaló preguntarse qué hace el operador
justo DESPUÉS de pulsar Guardar.

**110.2 — La columna que justifica la pantalla: «¿se ve?».** No sale del estado, y ahí está todo el
valor. El estado ENGAÑA en las dos direcciones: un **«disponible» sin foto** no aparece en ningún
listado, y un **«vendido» SÍ sigue publicado** con su aviso (decisión de SEO — retirar la página le
regala el posicionamiento a otro). Un operador que mirara la casilla de estado para dar su trabajo por
hecho se equivocaría en los dos casos. La columna sale de `problemasParaPublicar()`, o sea de los
MISMOS predicados que construyen el índice del catálogo, así que el listado del panel y el listado
público no pueden discrepar. Y el porqué viaja en el `title`: la respuesta está a un hover, no en otra
pantalla.

**110.3 — Lo que se respetó del resto del panel.** Consulta acotada con `limit(50)`, **sin listeners**
(el patrón que arruina una cuota es una pestaña olvidada toda la tarde), ordenada por `updatedAt` —lo
último TOCADO es lo que se está trabajando, no lo último creado— y con fallo RUIDOSO: si la lectura no
va, lo dice, en vez de dejar datos de muestra que hagan creer que hay inventario donde no lo hay.

**110.4 — Verificación.** 279 tests (11 nuevos, todos sobre la columna que puede mentir: «disponible»
sin foto, alojamiento sin RNT, y el caso contraintuitivo de «vendido»). En vivo: cabecera y filas con
la MISMA rejilla —si no cuadran, la tabla sale descuadrada y eso el build no lo ve—, «No se ve» en oro
`#7d6119` porque en esta paleta el rojo no existe, y sin scroll horizontal.

**110.5 — Anti-patterns evitados.** NO se calculó la visibilidad a partir del estado «porque es lo
obvio»: habría sido una tercera copia de una regla que ya tiene dueño, y la copia habría mentido en dos
casos reales. NO se añadió un listener «para que se actualice solo».

**110.6 — Archivos.** Nuevos: `scripts/gestion-inmuebles.ts` (+test). Modificados: `gestion.astro`
(tercera vista + estilos) y `gestion-alta-ui.ts` (el conmutador pasa de dos vistas a tres).
**110.7 — Lo que queda de TODO-44**: EDITAR un inmueble ya creado, la cola de verificación y el export.
Y el recordatorio honesto: **nada de esto ha corrido con un claim real** — es el paso 1.5 del runbook.
**110.8 — Doctrina**: §3.2 (`limit()`, cero listeners) · [[L-45]] (el mismo predicado en todos los
lectores) · §31 (verificación en navegador, no solo build).

---

## 111. ADR — Editar un inmueble, y la red que el ruleset no pone debajo de quien salta ⟦OPUS-5⟧ (2026-08-22)

Cierra el CRUD: crear (§108), ver (§110), editar. Pulsar una fila del listado abre ese inmueble en el
MISMO formulario del alta — un segundo formulario para lo mismo serían dos sitios donde divergir.

**111.1 — El control de concurrencia va en el cliente, y no por comodidad.** `versionValida()` del
ruleset es un compare-and-set correcto (`_version == resource.data._version + 1`), pero la regla
completa es `esSuperAdmin() || (esEditorOMas() && versionValida())`: **al super_admin no le aplica**, y
el super_admin es exactamente quien usa este panel. Confiar en el servidor aquí sería confiar en una
red que no está puesta debajo de quien salta. Así que se compara **dentro de la transacción** contra la
versión que se leyó al ABRIR el formulario: si alguien guardó entretanto, se PARA sin escribir. Perder
un formulario a medio llenar es preferible a perder los cambios de otra persona sin que nadie se
entere. Lo cazó el recon de §106; aquí se aplica.

**111.2 — Dos cosas que una edición NO puede reinventar.** El **slug se congela**: regenerarlo cada vez
que alguien corrige una errata del título —que es justo lo que hace el panel viejo— rompe el enlace que
ya está en Google, en WhatsApp y en el correo que alguien mandó. Y **`createdAt` es del alta**: si se
pisara, la «frescura» del inmueble se rejuvenecería sola cada vez que se toca un precio, que es
mentirle al visitante sobre cuánto lleva publicado.

**111.3 — El detalle que un repaso pierde.** Tras guardar, el testigo de versión **avanza en memoria**.
Sin eso, pulsar Guardar dos veces seguidas hace que el segundo intento se rechace a sí mismo creyendo
que otro tocó el documento — un bug que solo aparece al usar el formulario de verdad.

**111.4 — Verificación.** 292 tests (24 nuevos) + 80 de emulador + `build` + `verify:build` +
`verify:data`. Lo probado a conciencia es lo que puede PERDER datos: guardar con la versión buena,
rechazar con una versión distinta sin escribir nada, el documento que ya no existe, y el caso de borde
de un documento sin `_version` (cuenta como 0, no como «cualquiera»). Más un ida-y-vuelta
documento → formulario → documento que comprueba que no se pierde ningún campo por el camino.

**111.5 — Anti-patterns evitados.** NO se hizo un segundo formulario para editar. NO se confió en la
regla del servidor «porque está escrita»: está escrita para un rol que no es el que la necesita. NO se
regeneró el slug «para que refleje el título nuevo».

**111.6 — Archivos.** `domain/alta-propiedad.ts` (`construirEdicion`, `baseDe`, `entradaDe`),
`scripts/gestion-alta.ts` (`cuerpoDeEdicion`, `guardarEdicion`), `gestion-alta-ui.ts` (modo edición),
`gestion-inmuebles.ts` (la fila avisa por evento), `gestion.astro` (fila pulsable, con foco de teclado).
**111.7 — Qué queda de TODO-44**: cola de verificación y export. **111.8 — Doctrina**: §3.6 (la
defensa vive donde de verdad protege) · [[L-09]] · §106 (el recon que destapó el bypass).

---

## 112. ADR — La agenda operativa: un esquema sin lógica no recuerda fechas ⟦OPUS-5⟧ (2026-08-22)

Primer trozo de **GESTIÓN v1** (ítem 13 de OLA 1) y respuesta directa a lo que el dueño describió como
su problema real: *«llevamos todo en la mente y por WhatsApp… se pierden los contratos, se olvidan
fechas»*.

**112.1 — El hueco.** El módulo tenía desde el día 1 el MODELO completo —`gestion.ts`: expedientes,
contratos, pagos, novedades, 104 líneas de tipos bien pensados— y **ni una línea que derivara nada de
él**. Un esquema guarda fechas; no las recuerda. Nada calculaba qué vence, a quién hay que avisar ni
quién está en mora.

**112.2 — Decisiones que quedan fijadas con test, no con un comentario.**
· **El aviso de renovación llega a 4 meses, no a 3.** El preaviso legal de la Ley 820 es de tres:
avisar a los tres es avisar el día del plazo, sin margen para decidir, hablar con el propietario y
mandar la comunicación. El detalle del hito CITA la norma, para que quien lo lea sepa por qué no puede
posponerlo.
· **El escalón de mora entra el día EXACTO** (`>=`), no al siguiente. El protocolo del dueño dice «al
día 5»; redondear a favor del moroso es cómo una cobranza se retrasa sola.
· **«Parcial» no es «al día».** Recibir la mitad no salda nada, y enseñarlo como saldado es cómo se
pierde la otra mitad.
· **Si ya se pagó, la mora deja de crecer**: es la que hubo AL PAGAR, no la que habría hoy.
· **Lo vencido entra SIEMPRE en la agenda**, aunque quede fuera de la ventana. Una fecha que se pasó no
deja de importar porque el calendario avance: es lo primero que hay que ver.
· **El estado del pago se DERIVA del calendario**, no se lee del documento. Guardar «mora» y confiar en
el campo es garantizar que un día se quede viejo: eso cambia solo con el tiempo, sin que nadie escriba.
· **Un contrato terminado no genera agenda.** Llenar la lista de ruido esconde lo urgente.

**112.3 — Una trampa de JavaScript que aquí cuesta caro.** `setMonth` **desborda en silencio**: 31 de
enero + 1 mes da **3 de marzo**, no 28 de febrero. En una agenda de contratos eso mueve un vencimiento
a otro mes sin que nadie lo note. `sumarMeses()` se queda en el último día del mes destino, con test de
año bisiesto.

**112.4 — Todo puro y con `hoy` inyectado**, y por dos razones que importan: se prueba el día 4 de mora
sin esperar cuatro días, y **la misma función servirá para pintar el panel Y para la Cloud Function del
recordatorio** — sin que las dos puedan discrepar sobre qué vence, que es el defecto que este proyecto
ya conoce de sobra ([[L-45]]).

**112.5 — Verificación.** 25 tests nuevos (317 en total), y lo probado son las decisiones: los días
exactos de cada escalón, el aviso a 4 meses, el bisiesto, el aniversario del IPC saltando los que ya
pasaron, y el vencido que sobrevive a la ventana.

**112.6 — Lo que falta de GESTIÓN v1.** La pantalla, el alta de contratos y expedientes, las novedades
y los adjuntos privados (gate B5). Lo construido es el cerebro del módulo, no su cara.
**112.7 — Doctrina**: §3.6 · [[L-45]] (un solo dueño de la regla) · [[L-46]] (nació de esta sesión) ·
gate legal de la Ley 820 en `42-LEGAL`.
