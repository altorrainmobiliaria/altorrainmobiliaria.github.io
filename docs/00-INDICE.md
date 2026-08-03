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
| Diseño YA sellado del portal (paleta/superficies/tipografía/glass/neumorfismo · retrieval, NO re-decidir) | `99 §23` (D1 dual-mode · Cormorant/Hanken · paleta oficial) + `portal/src/styles/tokens.css` (SSoT) |
| Identidad, reglas absolutas, gobernanza | `CLAUDE.md` (router) |
| **Voy a escribir o editar CÓDIGO** (CSS/JS/HTML/Astro): stack real de los 2 mundos · performance · CSS del legacy · observadores/concurrencia | 🖥️ `34-DOCTRINA-CODIGO` (hoja de `30`; salió del router en §84) |
| Estado actual (build/cache/branch/flags) | `05-ESTADO-GLOBAL` |
| ¿Está desplegado? / antes de afirmar qué hay en PRODUCCIÓN / "ya pusheé" | `git fetch` + `git log origin/main` SIEMPRE; el `05` se auto-marca "no re-verificado" → NO autoritativo sin git real (§3.3) |
| En qué se está trabajando / pendientes (TODO-NN) | `10-MEMORIA-CORTO-PLAZO` |
| Dónde vive un componente, flujo, **schema Firestore**, blog | `20-MEMORIA-ESPACIAL` |
| Un bug/síntoma que "te suena", receta, gotcha | `30-LECCIONES` |
| Mapa (MapLibre/Protomaps/pmtiles/tiles/marcadores/R2 tiles) · binding CF desde ruta SSR | `99 §55` + `30 L-33` (`cloudflare:workers`) + `50 §Tiles` (subir .pmtiles) |
| **Funciona en dev pero NO en producción** (Cloudflare) · el mapa no carga en prod | `30 L-34` (Workers Static Assets IGNORA `Range`; `astro dev` SÍ lo honra → paridad dev↔prod FALSA) + `99 §55.9` |
| **¿Quién firma como ARRENDADOR?** figura de firma · mandato sin representación · quién demanda | `99 §66` (ALTORRA en NOMBRE PROPIO, C.Co. 1262 — decidido y blindado; el propietario NO es parte) + `42-LEGAL` |
| Catálogo (índice denormalizado `indices/*` · `catalogo.get` · `/api/catalogo` · SERP con datos reales) | `99 §54`decisión · `§56`lectura · `§57`núcleo · `§58`Functions · `§59`SERP+flag · **`§60`frontera+ficha** · `30 L-35`/`L-36` |
| Verificar UI (screenshot/computed/scroll/interacción · panel congelado vs Chrome) | hoja `31-VERIFICACION-UI` (L-22/L-26/L-28 completas; lápidas en `30`) |
| Redactar/corregir/renumerar/retirar un entregable legal u operativo · auditar documentos | hoja `32-LECCIONES-DOCUMENTALES` (familia `LD-NN` completa; antes eran `L-31..L-34` "del kit", ADR §68) |
| El cerebro me falló COMO MEMORIA (nodo stale, ruteo errado, regla mala) · meta-aprendizajes `M-NN` | hoja `33-LECCIONES-META.md` (stub en `30`, detalle allá) |
| **Algo societario**: precio de acciones · mayorías · quién manda · pleito entre socios · quién es gerente | 📜 **ESTATUTOS V5 primero** (`Downloads/ALTORRA Company (Legal)/Estatutos/`) — mandan sobre todo el kit. Resumen y qué NO cubren → `99 §70` |
| Project ID, cuentas IAM, deploy, secrets | `50-CONFIG-INFRA` |
| Competencia/mercado inmobiliario, benchmark | `40-LOBULOS` → `41-MERCADO` |
| Legal Colombia: Ley 820/RNT/Habeas Data/pagos/firma/SIC — gates de features y agenda abogado | `40-LOBULOS` → `42-LEGAL` (detalle: `specs/R3-LEGAL-COLOMBIA-2026-07.md`) |
| **Operación real del negocio**: tarifas y estándares · procesos · matrícula/RNT · **cómo se GENERAN los documentos corporativos** (no se editan a mano) | `40-LOBULOS` → `43-OPERACION` |
| El "por qué" de una decisión / detalle histórico | este índice → `99-HISTORIAL` (offset) |
| Decisión cara de revertir (2ª opinión externa) | `15-CONSEJO-EXTERNO` |
| "Access denied / permission-denied al login" | `30 L-01`/`L-02` |
| Deploy de Cloud Functions falla (Eventarc) | `30 L-07` + `50-CONFIG-INFRA` |
| smart-search / hero / replicar patrón de cars | `99 §10` (§12 rescatado) |
| ¿Una regla de SEO/rich-results sigue vigente? (FAQPage, price, GBP, indexación) | `30 L-30` (features del SERP mueren: fecha+fuente primaria) + skills del paquete de visibilidad (corregidas 2026-07-18, `99 §33`) |
| Skills: qué hay, dónde vive cada una, parejas repo↔user | `docs/skills-inventory.md` (re-auditado 2026-07-18; editar AMBAS copias) |

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
| §13 | Consejo Externo: corrección factual "el provider (Antigravity) SÍ ve el repo, solo-lectura" + skill comité ×4. Propagación de cars §224. | 100 |
| §14 | Guardián del índice `brain-index.mjs`: auto-reconcilia §→línea + valida tombstones (de cars TODO-32/§229). | 104 |
| §15 | **Arranque Fable 5**: misión GREENFIELD + liderazgo kernel ×4 + MODO OBRA live (mantenimiento + 65 redirects + SW v5 kill-switch). Obsoleta TODO-01..08 del sitio viejo. | 114 |
| §16 | **STACK sellado** (W-11): Workers+Astro híbrido+Firebase+R2+Wompi+MapLibre+Resend + adenda Gemini (veto-Firestore refutado) → `specs/R5-STACK-2026-07.md`. | 128 |
| §17 | **MEGA-PLAN por olas** (`specs/MEGA-PLAN-INMOBILIARIA.md` = SSoT) + relevo a Opus (Fable audita por ola). | 138 |
| §18 | **Programa R0-R5 COMPLETO en un día** (~74 agentes · 6 workflows · live) + cierre de planificación Fable. | 145 |
| §19 | **Ola 0.1 scaffold** del portal (Astro+Cloudflare Workers, híbrido `output:server`, capa de datos FINA, CI gated). Gotcha: `main` = entrypoint unificado (→ L-14). | 152 |
| §20 | **Repaso estratégico del plan con Fable 5** (auditoría final pre-ejecución): dossier del corpus (7 lectores + 2ª pasada FTI-01) + 12 omisiones corregidas (abogado en 2 · DIAN/Wompi a O1 · candado 1B→O2 · continuidad DNS/email). SSoT ejecución → `specs/PLAN-ENDURECIDO-FABLE-2026-07-10.md`. ⟦OPUS-4.8+FABLE-5⟧ | 162 |
| §51 | **CEREBRO v2 · F1 ejecutada**: kernel CANÓNICO en `brain-private/kernel/` + `brain:pull` (1 línea npm/repo) + **gate #0 BLOQUEANTE** (hash vs stamp + versión vs canónico) · **×4 flipeados v1.4.1** (test: fix propagado <2 min) · bersaglio "divergente" era CRLF · cars/bersaglio deuda visible (7/8 problemas reales). | 859 |
| §50 | **CEREBRO v2 · F0 ejecutada** (Daniel aprobó): kernel **v1.3** — #6b/#11 muertos · #1⊂#10 · #13 resoluble · +5c ⚰️ · +7b bóveda-fs · +tableFile · masa-neta 491≤492 · ssotFact paleta · **offsite OneDrive PROBADO** (SPOF-disco muerto). Siguiente: F1 kernel único. | 847 |
| §49 | **Auditoría Nivel-2 #4** (encargo Daniel pre-TODO-30): SANO · retrieval 5/5 · 2 mentiras en boot curadas · **TODO-30 blindado** (tiles sellados + criterio de mapa + home excluida) · **M-03** (recurso compartido → gate EN el recurso) · TODO-31 SPOF/costo (proxy commits 49%>30%). | 834 |
| §48 | **TODO-27 CERRADO — HOME+PUBLICAR FIEL** (re-audit 4/4). 🏁 **6 páginas fieles** (balance de la saga §43-§48). | 806 |
| §47 | **TODO-27: SERP FIEL** (`[operacion].astro`): /comprar=4 venta + /arrendar=1 arriendo REALES (sin listings inventados) + filtros/sombra/3ª vía. Re-audit 8/8. | 767 |
| §46 | **TODO-27: ESTANCIAS FIEL** (`estancias.astro`): galería mosaico · reserva prellena fechas · breadcrumb · íconos. Re-audit 8/8. | 733 |
| §45 | **TODO-27: TURISMO FIEL** (`turismo.astro`): #inversión (grid 3 cards vidrio, sin foto) · zonas card-blanca + kicker · copy/CTA/hero. Re-audit 8/8. | 700 |
| §44 | **brain-kit v1.0** (encargo Daniel): kit de neurogénesis PORTABLE (kernel fork + plantillas §G + 38 skills + runbook 10 fases). Verif. adversarial: 25 hallazgos aplicados, 0 fugas. En `GitHub/brain-kit/`. | 668 |
| §43 | **TODO-27: FICHA FIEL** (`ficha.astro`, 8+1): specs · favorito · POIs · banda de cierre · ALTA 3ª card→Crespo. Re-audit 8/9; L-28 recurrió. | 629 |
| §42 | **HUMO MONTADA y ENCENDIDA** (campaña `120250036063330588` Leads+CTWA $4.000/día Cartagena+40km; Meta aprobó). Gotcha página default de CARS → L-32. | 595 |
| §41 | **TODO-28 #2 ✅ candado del boot** (`boot-gate.mjs` bloqueante + poda router + one-in-one-out) + fix kernel ✅-falso ×3 + HUMO bloqueada por rollout Ads-MCP (runbook en bóveda). | 566 |
| §40 | **Meta 100% operativo + pieza de humo APROBADA** (embudo `pauta-captacion §0b` + L-31) + caja negra anti-saturación (TODO-28 #1, session-handoff). | 530 |
| §39 | **Constancias ×3 COMPLETAS + pauta de humo + cierre** (TODO-20 cerrado ×3; humo ~COP 5k → playbook §4b; WhatsApp Web "Sin conexión" = abrir app en el teléfono). | 516 |
| §38 | **Meta Business ORDENADO**: cuenta ads reclamada al portafolio + píxel `1032884172712946` + inventario `activos-meta.md`; gotcha: Business Suite en pestaña de fondo NO renderiza. | 489 |
| §37 | **Skill `pauta-captacion`** (orquestadora: playbook + gates go/no-go) + 8 parches de vigencia (CTWA→Leads · AEM muerto · CAPI $0 vía Worker · benchmarks ❓→ planilla CPQL propia). Crudo/blueprint en bóveda. | 463 |
| §36 | **Lote 2 TikTok + BACKLOG acumulador** (`compartido-marketing/BACKLOG-material-tiktok.md` = SSoT cross-proyecto) + 2 plantillas ad-creative + guías Nova. | 443 |
| §35 | **Material TikTok + minería marketingskills** (linaje Corey Haines MIT → 9 adopciones curadas: `paid-ads` v2.2 · `ad-creative` v2.8 · video/offers/loops/image). | 419 |
| §34 | **Masterclass de captación adoptada** (`marketing-psicologico-conversion`) + Housing Meta NO aplica a pauta→Colombia (verificado en fuente primaria; caducable L-30) + voz EN FORJA. | 397 |
| §33 | **Skills visibilidad corregidas** (→ L-30: FAQPage muerto · Offer-sin-price inválido) + **Auditoría Nivel-2 #3** (retrieval 5/5 · M-02 · bóveda respaldada · memoria espejada) + comité futuro-del-cerebro (Obsidian=downgrade) → TODO-28. | 353 |
| §32 | **Saga fidelidad + elevación del portal** (L-23→L-29): home 17/17 (§32.15) · `.alt-rail` + 5 cards NO intercambiables (§32.10-.13) · home-map ilustrado (§32.18) · re-audit adversarial → 35 pendientes = TODO-27. Síntesis en bóveda 07-17. | 293 |
| §31 | **Ola 1: GESTIÓN** (`/gestion`, panel admin) — 8º y último mockup → **portal COMPLETO (8/8)**. Sidebar navy + KPIs + tabla pipeline + actividad + demanda; segmentado 3 roles (Admin/Aliado/Propietario) en JS vanilla sin innerHTML; noindex (prop `BaseLayout`); datos DEMO. 0 off-palette. | 283 |
| §30 | **Auditoría Nivel-2 del cerebro #2** (post-Ola 1): SANO + retrieval funcional; 7 hallazgos in-repo curados (F-01 `05` rezagada→**M-01** 1ª meta-lección) + 10 kernel (Sonda 7)→TODO-23/24/25. GC pareado (boot<target). | 264 |
| §29 | **Ola 1: TURISMO** (`/turismo`) — HITO: todas las públicas mockup-backed LIVE. | 257 |
| §28 | **Ola 1: ESTANCIAS** (`/estancias`): detalle alojamiento + widget de reserva funcional (pago Wompi = Ola 2). | 251 |
| §27 | **Ola 1: 404 + PUBLICAR** (`/publicar`): form avalúo client-side + 4 pasos + 3 planes. | 243 |
| §26 | **Ola 1: FICHA de inmueble** (`/ficha`): galería + aside sticky (CTA/sello/asesora) + similares. | 233 |
| §25 | **Ola 1: SERP resultados** (`[operacion].astro` → /comprar+/arrendar): filtros glass + aside mapa esquemático (MapLibre real → TODO-30). | 223 |
| §24 | **Ola 1: Header compartido + HOME parte 1** (`Header.astro` nav 3 capas + hero neumórfico + buscador segmentado). | 207 |
| §23 | **D1 design system** (de los 8 mockups): DUAL-MODE (blanco / neu `#E6EDF2` / navy) · `tokens.css`+`base`+`components` · styleguide `/design-system` · a11y AA · §23.8 paleta oficial · §23.9 tipografía Cormorant/Hanken. → L-22. | 193 |
| §22 | **Ola 0.7 (parte 3/3): capa de datos `client.ts`** (lecturas públicas Firestore REST + Workers Caching, edge-safe). Decisión Fuerte OD1 `[REVISAR-FABLE]`: comité ×3 cazó BLOCKER de decode (mapa/array vacío) + anti-traversal + memo footgun + TTL por-PoP. Gate empírico: tsc + vitest 26/26 + build + rules 15/15 en emulador. | 181 |
| §21 | **Ola 0.2: portal VIVO en Cloudflare Workers staging** (`altorra-portal.altorrainmobiliaria.workers.dev`): dueño creó cuenta CF+R2+token+secrets (guiado, Fincaraíz), CI desplegó. Verificado en vivo (home+SSR+noindex+favicon). KV auto-provisionado, R2 conectado. Gotcha: registrar subdominio workers.dev antes del 1er deploy (→ L-16). | 173 |
| §52 | **CEREBRO v2 · F2 piloto** (TODO-32): 💓 heartbeat (sidecar `.estado-auto` — el 05 pierde lo derivable; costo-cerebro midió 52% 🔴) · 🧊 consolidación-en-frío · 📦 brain:archive (este ADR nació de él) · punto ciego gate #0 cazado EN VIVO → v1.5.1 compara contenido. | 871 |
| §53 | **CEREBRO v2 · F3 — 🏁 v2 NÚCLEO COMPLETO** (TODO-32): gate #14 escala con gracia (probado con cars: gap 22 → WARN) · 🧭 banner en cristiano en cada boot · skill `mantenimiento-general` (ejecutor, jamás calendario) · kernel v1.6.0 ×4 · bundles frescos. Restos: hooks hermanos + TODO-31 c/d. | 881 |
| §66 | **CONTRATOS 03/04 BLINDADOS**: pagaré RETIRADO · ALTORRA arrienda EN NOMBRE PROPIO (C.Co. 1262) · dictámenes propios en vez de "pendiente de abogado". Comité ×6 + consejo externo ×2: 136 hallazgos → 126, 14 descartados con razón. Cláusulas reescritas: 12ª del 04 pagaré→PÓLIZA · fondo de reserva · fallecimiento · art. 22 · pena/intereses. | 1016 |
| §67 | **KIT COMPLETO (24 docs) + GATE DE EMISIÓN**: el doc 03 no se había enterado del cambio de figura (el mandato contradecía al arriendo). Comité R3 + consejo R3. Ningún doc de firma se emite con marcas: 24/24, 11/11 en verde. | 1068 |
| §68 | **FUENTE ÚNICA DEL MANUAL**: el cap. 2 estaba DOS VECES en el maestro y las copias habían divergido en la fila del pagaré RETIRADO → el maestro ahora se GENERA de los fragmentos (`ensamblar-manual.ps1`). Namespace `LD-NN` + hoja `32` (colisión L-31..L-34, M-04). C.Co. 1096/1099 verificados. Auditoría B-03: 14/14 docs, 191 hallazgos. | 1123 |
| §69 | **Auditoría Nivel-2 #5** (la disparó el GATE de pre-commit, no un encargo): retrieval frío **5/6** y la hoja nueva 32 enruta limpio · 2 fallos de ruteo CURADOS (faltaba la fila del ARRENDADOR; dev-sí/prod-no citaba L-33 en vez de L-34) · **REINCIDENTE**: TODO-31 perdió su fila y A-01/A-03 llevaban 11 días invisibles · **CRÍTICO: el kit legal no tiene linter** → TODO-35. | 1191 |
| §70 | **B-03 APLICADA (14 críticos) + los ESTATUTOS entran al cerebro**: la auditoría revisó el kit contra el kit y nunca abrió los estatutos → 3 de las 4 decisiones subidas al dueño YA estaban resueltas ahí (precio por peritos art. 8º e · supramayoría 70% art. 13º · arbitramento art. 24º). Daniel RETIRA el doc 13. [[LD-05]] + LD-02 reincidente. | 1247 |
| §71 | **23 ALTOS de B-03 aplicados + los 2 primeros gates documento↔documento** (12 planificadores + 1 revisor de colisiones). 21 vigentes · 12 degradados. El revisor cazó 2 choques de escritura. → [[LD-06]] | 1306 |
| §72 | **Heartbeat+handoff a los 3 hermanos (TODO-32a ✅)**: sin él, el estado derivable se copia a mano y se desincroniza — el 05 de cars declaraba una cache de 8 días atrás. insemastereo no tenía NINGÚN SessionStart. Re-midió el SPOF: 2 de 3 pendientes eran falsos. Destapó que el boot-gate solo existía en inmobiliaria (→ §81) y que `brain-kit` sigue congelado. | 1372 |
| §73 | **Auditoría de insemastereo aplicada + bersaglio destilado**: 36 hallazgos → 14 en un cerebro que el linter daba SANO; 5 sondas cazaron el mismo `05` mintiendo sobre git. El heartbeat generaba la verdad y ningún nodo la enrutaba (§72 a medias). bersaglio llevaba tiempo sin poder commitear → destilado. 6 chequeos de kernel a TODO-23. | 1422 |
| §74 | **cars destilado 35.9k→33.9k + `brain-kit` descongelado**: la tabla de topes de §G.5 tapaba 2 hojas SIN cap (una de 27k, ningún gate la miraba) → nace el chequeo #23. Los caps se MIDEN, no se inventan. | 1477 |
| §75 | **kernel v1.7.0 — chequeos #17 y #23**: el kernel nunca miraba el git del repo que audita (por eso un 05 mintió 42 días con 16 gates en verde), ni vigilaba las neuronas que el manifest no declara (44 sin techo ×4). Verificados ENCENDIDOS: la v1 de #17 no cazaba el caso real y la v2 acusaba a un inocente ([[M-06]]). | 1520 |
| §76 | **52 neuronas bajo techo + shard de §Meta → `33-LECCIONES-META`**: las 44 sin cap quedaron decididas (cap medido o noCap con razón). Y la trampa que estuve a punto de hacer DOS veces: subir un límite en vez de cumplirlo — el gate pasa, la deriva sigue, y queda evidencia falsa de control (M-05). | 1555 |
| §77 | **El kernel corregido 3 veces POR PROBARLO** (v1.7.2): #17 no disparaba, luego acusaba a un puntero de neurona, luego a una skill. Y el gate #4 quedó obsoleto por el arreglo que él provocó: exigía en el 05 un dato que la doctrina nueva elimina. bersaglio: 05 en tope por primera vez. → M-06. | 1591 |
| §78 | **cars en presupuesto (35.9k→29.7k) por MOVER, no por raspar**: sus 25 pendientes congelados (§302) salían del boot en cada sesión → hoja `11`. Congelado ≠ cerrado y el shard es reversible. Caps coherentes ×4 (22 apretados). Los 308c que restaron se dejan A LA VISTA en vez de subir el techo ([[M-05]]). | 1631 |
| §79 | **bersaglio −23% de boot (43.1k→33.3k)**: gobernanza y doctrinas que inmobiliaria ya había destilado y los hermanos nunca recibieron + el backlog sin empezar sale del boot (decisión del dueño). El gate me paró: abreviar nombres de archivo ganó 542c y dejó 5 neuronas inalcanzables. | 1667 |
| §80 | **CIERRE 31-jul/01-ago: los 4 cerebros mergeados a main** (28 commits, cero producto — verificado antes). El #17 cazó que yo mismo dejé cars fuera de su rama única. Balance: 23 altos del kit aplicados · 4/4 SANOS · 44 neuronas sin techo → 0 · kernel v1.6→v1.7.2. Queda 2.1k de boot y lo de Daniel. | 1697 |
| §83 | **AUDITORÍA Nivel-2 #6: 109 brutos → 44 vivos** (47 refutados). Kernel **v1.9.0** ×5: #9 ciego a la fila ✅ sin ADR · borrar clave del manifest apagaba gates · el boot mentía «cache verificada» · +#26 fila del índice. CRÍTICO N6-01: precios y regla anti-strike de Bersaglio vivían solo en la memoria del harness. El workflow murió 2 veces → [[M-08]]. | 1839 |
| §84 | **PODA REAL del router (TODO-32b): boot 31.4k→28.4k sin subir el techo.** Nace `34-DOCTRINA-CODIGO` (perf/observadores/stack/CSS legacy salen del always-on) · `§0` deja de duplicar los triggers de `§G.2` · 3 cifras copiadas del manifest, cortadas. Criterio → [[M-09]]. | 1965 |
| §82 | **TODO-35 CERRADO: el kit de firma estrena sus 6 gates cruzados** (cifras vs doc 02 · remisiones a docs RETIRADOS · identidad/canales · anclas de la figura del ARRENDADOR). Cierra el crítico N5-05. Las 2 excepciones que solo salen probando: la cita que DEROGA y la cifra AJENA ([[LD-07]]). Cazó 2 remisiones vivas al doc 13 RETIRADO. Nuevo `-SoloGates`. | 1792 |
| §81 | **TODO-36 CERRADO: trinquete de boot ×4 y el candado SUBE AL KERNEL v1.8.0.** bersaglio 33.3k→31.4k e insema 28.4k→27.5k **sin subir un techo** ([[M-05]]); el mapa de poda de §G.5 bajó a `60-WORKFLOWS`. `boot-gate.mjs` borrado (one-in-one-out) → chequeos #2 (bloqueante) + #24 canario. Hallazgo: **insema no tenía pre-commit** → nace el #25 (¿alguien me invoca?) y [[M-07]]. | 1741 |
| §65 | **TODO-34 F4-w2 ✅: MANUAL MAESTRO (10 caps) + mercado → sistema documental 00-23 COMPLETO**. Tarifas comerciales adoptadas-vetables con costumbre certificada · FE gratuita DIAN soporta mandato nativo · prompt consejo externo del manual listo. | 1006 |
| §64 | **TODO-34 F4-w1 ✅: KIT FUNDACIONAL 14 docs + Word + `00-LEEME`** (10 redactores + 5 auditores → 37 fixes aplicados). Patrón redactor→auditor-adversarial→aplicador PROBADO. | 996 |
| §63 | **TODO-34 F2 ✅: verificación legal 6 frentes .gov.co + Gemini integrado**. RUB vencido→YA · CE SAGRILAFT derogada 02-jul-26 · 5 prácticas ILEGALES · canon-neto legal (4 formalidades de mandato) · §63.8 cero contratos vigentes → F4 reordenado. | 985 |
| §62 | **TODO-34 F1 ✅: triaje del corpus (143, 9 lectores) → nace `43-OPERACION`**: doble NIT · matrícula sin resolución · gerente sin mayoría · KYC→FONPRECON · tarifario inexistente. | 975 |
| §61 | ⭐ **PIVOTE DE MISIÓN: Fundación Operativa (TODO-34)** — armar la inmobiliaria completa con datos reales (Claude=abogado+empleados · cerebro dual Code+Chat). Corpus REAL: 83 docs + operación VIVA (2 administrados); gaps: corta estancia · notaría · inquilino · contable. Plan F1-F4. | 965 |
| §60 | **Hallazgo: la FICHA pide 4 datos que el modelo NO tiene** (dirección exacta=PII prohibida · financiación=afirmación financiera · asesor · POIs) → NO construirla a ciegas (L-29) + **frontera pre-cutover verificada** (Republicar sin auth · purga sin secreto). | 956 |
| §59 | **§54 obra — SERP cableado al catálogo REAL** (isla tras flag `demo\|live`; markup clonado del `<template>` de PropertyCard = un solo dueño · `setMarkers` · hover delegado · estados vacío/error). **Cutover = flip de flag.** Bug del fallo parcial → L-36. | 946 |
| §58 | **§54 obra — PLOMERÍA del catálogo**: `portal/functions/` como CODEBASE APARTE (deploy aislado del legacy) · `rebuildCatalogo` con **guarda anti-adelantamiento** (→ L-35) · triggers onWrite+barrido+Republicar (coalescencia que NO pierde ediciones). Emulador 33/33 (GATE-CRASH+CARRERA). Deploy=cutover. | 936 |
| §57 | **§54 obra — NÚCLEO del camino de ESCRITURA** (`construirIndices` rebuild TOTAL idempotente + determinista · `propiedadAResumen` · omitidas REPORTADAS con motivo · lógica PURA en dominio, no en la Function). vitest 42/42. Falta la PLOMERÍA (Functions+trigger+purga, deploy=cutover). **Gobernanza: implementador = desde 2026-07-24.** | 926 |
| §56 | **§54 obra — catálogo camino de LECTURA** (índice denormalizado `indices/catalogo-{shard}`): `catalogo.get()` + rules `indices` + ruta `/api/catalogo/*.json` + tests (33 unit + 20 rules). Ruta DORMIDA (SERP sigue demo) hasta la mitad de ESCRITURA (Function) + cutover. | 916 |
| §55 | **TODO-30: mapa REAL MapLibre v6 + Protomaps** en ficha+SERP (isla · marcadores navy/oro · card↔pin · degradación esquemática). **§55.8: tiles Cartagena GENERADOS (go-pmtiles) + empacados como ASSET ESTÁTICO** (`public/basemap/`, 3.33 MB, §3.7 refina el sello R2) → falta solo visto bueno visual. BUG: `locals.runtime.env` removido v6 → `cloudflare:workers` (L-33). | 902 |
| §54 | **TODO-22: §22 auditado ✅ + OD-Catálogo = B doc-índice SELLADA** (comité 3/3 + Gemini convergió doble-ciego §54.8 · rebuild total idempotente · gates G1-G12+2 · purga Workers Cache ~GLOBAL verificada en docs vivas · `s-maxage` desactiva SWR → deuda headers a la obra). | 891 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
