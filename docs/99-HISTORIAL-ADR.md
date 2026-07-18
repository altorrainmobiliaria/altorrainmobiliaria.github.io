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
