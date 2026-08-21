# 🗂️ 00b — ÍNDICE DE CONSTRUCCIÓN (§21-§60 · Ola 0 y el arranque de Ola 1)

> **Shard de rango de `00-INDICE`** (ADR §100). El kernel descubre las hermanas por PATRÓN
> (`00[a-z]?-INDICE*.md`) y trata a las tres como UN índice: los chequeos #3 (desync), #5a (ADRs
> indexados) y #9 (consolidado) leen todas. Mover filas aquí **no** las saca del cerebro.
>
> **Por qué ESTAS 40 y no otras**: son la era de CONSTRUCCIÓN del greenfield — scaffold, modelo de
> datos, design system, las superficies del portal una por una, el mapa y el catálogo. Lo que se
> consulta aquí es «cómo se decidió esto», no «qué toca hoy». Las decisiones VIVAS (§61 en adelante:
> fundación operativa, legal, y el tramo que cierra el portal) siguen en `00`.
>
> ⚠️ Las líneas son **pistas**; `npm run brain:check` valida el desync y `brain:index` lo reconcilia.

| § | Qué decidió | Línea |
|---|---|---|
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
| §22 | **Ola 0.7 (parte 3/3): capa de datos `client.ts`** (lecturas públicas Firestore REST + Workers Caching, edge-safe). Decisión Fuerte OD1: comité ×3 cazó BLOCKER de decode (mapa/array vacío) + anti-traversal + memo footgun + TTL por-PoP. Gate empírico: tsc + vitest 26/26 + build + rules 15/15 en emulador. | 181 |
| §21 | **Ola 0.2: portal VIVO en Workers staging** (`altorra-portal.altorrainmobiliaria.workers.dev`): dueño creó cuenta CF+R2+token+secrets (guiado, Fincaraíz), CI desplegó. Verificado en vivo (home+SSR+noindex+favicon). KV auto-provisionado, R2 conectado. Gotcha: registrar subdominio workers.dev antes del 1er deploy (→ L-16). | 173 |
| §52 | **CEREBRO v2 · F2 piloto** (TODO-32): 💓 heartbeat (sidecar `.estado-auto` — el 05 pierde lo derivable; costo-cerebro midió 52% 🔴) · 🧊 consolidación-en-frío · 📦 brain:archive (este ADR nació de él) · punto ciego gate #0 cazado EN VIVO → v1.5.1 compara contenido. | 871 |
| §53 | **CEREBRO v2 · F3 — 🏁 v2 NÚCLEO COMPLETO** (TODO-32): gate #14 escala con gracia (probado con cars: gap 22 → WARN) · 🧭 banner en cristiano en cada boot · skill `mantenimiento-general` (ejecutor, jamás calendario) · kernel v1.6.0 ×4 · bundles frescos. Restos: hooks hermanos + TODO-31 c/d. | 881 |
| §60 | **Hallazgo: la FICHA pide 4 datos que el modelo NO tiene** (dirección exacta=PII prohibida · financiación=afirmación financiera · asesor · POIs) → NO construirla a ciegas (L-29) + **frontera pre-cutover verificada** (Republicar sin auth · purga sin secreto). | 956 |
| §59 | **§54 obra — SERP cableado al catálogo REAL** (isla tras flag `demo\|live`; markup clonado del `<template>` de PropertyCard = un solo dueño · `setMarkers` · hover delegado · estados vacío/error). **Cutover = flip de flag.** Bug del fallo parcial → L-36. | 946 |
| §58 | **§54 obra — PLOMERÍA del catálogo**: `portal/functions/` como CODEBASE APARTE (deploy aislado del legacy) · `rebuildCatalogo` con **guarda anti-adelantamiento** (→ L-35) · triggers onWrite+barrido+Republicar (coalescencia que NO pierde ediciones). Emulador 33/33 (GATE-CRASH+CARRERA). Deploy=cutover. | 936 |
| §57 | **§54 obra — NÚCLEO del camino de ESCRITURA** (`construirIndices` rebuild TOTAL idempotente + determinista · `propiedadAResumen` · omitidas REPORTADAS con motivo · lógica PURA en dominio, no en la Function). vitest 42/42. Falta la PLOMERÍA (Functions+trigger+purga, deploy=cutover). **Gobernanza: implementador = desde 2026-07-24.** | 926 |
| §56 | **§54 obra — catálogo camino de LECTURA** (índice denormalizado `indices/catalogo-{shard}`): `catalogo.get()` + rules `indices` + ruta `/api/catalogo/*.json` + tests (33 unit + 20 rules). Ruta DORMIDA (SERP sigue demo) hasta la mitad de ESCRITURA (Function) + cutover. | 916 |
| §55 | **TODO-30: mapa REAL MapLibre v6 + Protomaps** en ficha+SERP (isla · card↔pin · degradación esquemática). §55.8: tiles de Cartagena generados y empacados. BUG: `locals.runtime.env` removido en v6 → `cloudflare:workers` ([[L-33]]). | 902 |
| §54 | **TODO-22: §22 auditado ✅ + OD-Catálogo = B doc-índice SELLADA** (comité 3/3 + Gemini convergió doble-ciego §54.8 · rebuild total idempotente · gates G1-G12+2 · purga Workers Cache ~GLOBAL verificada en docs vivas · `s-maxage` desactiva SWR → deuda headers a la obra). | 891 |
