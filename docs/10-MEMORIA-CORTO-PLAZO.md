# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual — RELEVO CURADO (cierre 2026-07-12 por saturación de contexto)

> ⚡ **ESTADO — RECONSTRUCCIÓN POR FIDELIDAD + ELEVACIÓN DE DISEÑO** (Ola 1, §32). El portal está en staging PERO
> **DIFIERE de los mockups aprobados** (Daniel lo cazó; la verificación vieja §24-§29 revisó COLOR, no estructura → L-24).
> **32 ADRs; cerebro SANO.** Mapa de fidelidad de las 7 páginas → **§32.2**.
>
> **✅ LAS 5 PÁGINAS RECONSTRUIDAS + interactividad** (§32.8-§32.22): Home (17 secc, lienzo neu, `#cerca`=buscador+MAPA) ·
> Turismo (+Pasadías, zonas 6) · Estancias (+Reseñas, meta 4) · Publicar (+franja 4 beneficios) · SERP (filtros/fav/
> hover-pin vivos). Fix sistémico `[hidden]{display:none!important}` (§32.20). Todo pusheado a `main` + staging.
>
> ⚠️ **PERO — la RE-AUDITORÍA adversarial (§32.24) desmintió "fidelidad lograda"**: **5 DIVERGENTES · 48 hallazgos**.
> **13 ALTA → ✅ corregidos** (§32.23/§32.24, commit `3a66a69`): cifra "+18%" INVENTADA retirada · favorito muerto 8/13
> · pins SERP desemparejados · galería estancias muerta · amenities/tarjetas/props inventadas restauradas.
> **⏳ 35 MEDIA/BAJA PENDIENTES** (síntesis+crudo en bóveda `2026-07-17-reauditoria-fidelidad-*`): ver SIGUIENTE.
> **LECCIÓN L-29**: el contenido INVENTADO se ve BIEN → solo lo caza CONTAR contra la fuente con auditor adversarial;
> **3 de los 6 ALTA los introduje YO "corrigiendo"**. Declarar fidelidad sin re-auditar = repetir §24-29.
>
> **🎨 DISEÑO ELEVADO (mandato Daniel, §32.3 = detalle)**: fusión neu+skeu+glass+liquid, app-like; que NO peleen
> (header=glass+metal · cards=neu · overlays=glass). Íconos NO `astro-icon` (L-23) → paths Lucide/Simple inline.
> Emblema `altorra-emblema.webp` (Canva `DAGxI7p5OBk`; el viejo `altorra-mark-t.webp` RETIRADO). Componentes → `20 §Portal`.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `portal/src/styles/tokens.css` + ADR §23-§23.9 + memorias
> `identidad-marca-inmobiliaria`/`sello-marca-altorra`; ratificaciones TODAS cerradas): paleta OFICIAL
> (navy `#062743` · blanco · dorado `#D4AF37` · plata `#BFC3C9` · grises `#E6EDF2`/`#F2F6F9`) · **disciplina
> ESTRICTA** (fondo blanco · DORADO predomina · navy discreto · SIN verde/rojo/ajeno; estados navy+oro+ÍCONO) ·
> **Cormorant Garamond** (display) + **Hanken Grotesk** (cuerpo) · neumorfismo protagonista + glass sutil,
> DUAL-MODE (`#fff` contenido / `#E6EDF2` home+nav / `#062743` secciones).
>
> **▶ CÓMO RETOMAR**: boot normal (§G.1). Dev: `npm --prefix portal run dev` (`portal`, 4321). 👁️ **VERIFICA MIRANDO
> con la extensión de CHROME** (`mcp__claude-in-chrome__*`: renderiza/captura; el panel integrado tiene rAF=0, solo
> computed styles/espía) — **pero mirar NO basta**: para "¿esto lo dijo el diseño o lo inventé?" hace falta DIFF contra
> el `.dc.html` + auditor adversarial (L-29). Verificación por capas: build → estructura → computed (⚠️ MIENTE en
> propiedades con `transition`, L-28) → screenshot → **diff vs fuente**. Off-palette = `getComputedStyle` vs allowlist
> (incluir base hairline `rgb(27,39,51)` o da falsos positivos).
>
> **▶ SIGUIENTE (cierre 2026-07-17 por contexto reventado; retomar así)**:
> 0. **⭐ PRIMERO: Daniel dejó un TRABAJO para el arranque de la próxima conversación** — pedir/leer ese encargo ANTES
>    de seguir con lo de abajo. ("continua pero... al iniciar la próxima conversación te tengo un trabajo").
> 1. **Cerrar los 35 hallazgos MEDIA/BAJA de la re-auditoría** (§32.24; lista COMPLETA en la síntesis de bóveda
>    `2026-07-17-reauditoria-fidelidad-sintesis.md`). Por página: **ficha 8 — LA MÁS URGENTE, SIN TOCAR AÚN**
>    (favorito del header MUERTO · sello "Verificado" INVENTADO en card de precio · specs de "similares" cambiadas ·
>    íconos de POI perdidos) · **turismo 8** (cards de Zonas cambiaron de patrón + perdieron kicker/enlace · copy de
>    #inversion reescrito · eyebrows/CTA renombrados) · **estancias 8** (thumbnails INVENTADOS + layout de galería 2×2
>    + widget no prellena fechas hoy+7/hoy+10) · **serp 7** (6ª card INVENTADA en /comprar · card Getsemaní mutada ·
>    "Más filtros" y sombra-al-scroll muertos · falta 3ª línea del mapa) · **home 2** · **publicar 2**.
> 2. **MÉTODO OBLIGATORIO (L-29 + L-24)**: leer el bloque del `.dc.html`, corregir TEXTUAL, y **re-auditar
>    adversarialmente** (reejecutar el workflow de bóveda) ANTES de decir "fiel". NUNCA inventar contenido para
>    rellenar un hueco del diseño — inventar es PEOR que omitir (una cifra falsa = riesgo legal). Piezas ya hechas
>    (reusar, NO reinventar): `.alt-rail`/`.alt-rnav`/`.home-railsec` · `.alt-btn-sweep`/`-frost` · `.home-oppill` ·
>    6 cards NO intercambiables (`PropertyCard`/`LuCard`/`StayCard`/`RankCard`/`ProjectCard` + tiles inline).
> 3. Después: transversales (MapLibre · forms→`solicitudes` vía CF [needs Blaze, TODO-26] · datos Firestore reales [TODO-22] · Wompi Ola 2) ·
>    páginas SIN mockup (invertir/aliados/journal/Nosotros/Contacto/favoritos/ingreso → requieren diseño de Daniel, NO inventar).
>
> **🚦 BLOQUEADORES DE PRODUCCIÓN (solo Daniel los da)**: Nº **matrícula de arrendador** real (footer trae
> `000000`) · **dirección física** exacta (hoy solo ciudad) · **RNT** real (blocker alojamientos). Contacto
> oficial YA cableado ✅ (`+57 300 243 9810` / `info@altorrainmobiliaria.co` vía `SITE`).
>
> **🚫 Callejones / cuidados (NO reintentar)**:
> (a) ⛔ **NADA del sitio/código/diseño viejo como base** (regla innegociable; sus TODO/gaps obsoletos, ADR §15.7).
> (b) **NUNCA UI sin mockup aprobado** (§3.2/carril D) — ver punto 4 de SIGUIENTE.
> (c) **Verificar POR CAPAS** (L-29): build → estructura → computed (miente en `transition`, L-28) → screenshot en Chrome → **diff vs `.dc.html`**. Ni el ojo caza el contenido INVENTADO; solo el diff + auditor adversarial. **Datos del portal = DEMO estáticos** (`client.ts` listo para cablear).
> (d) **NUNCA dinero sin gate** · **NUNCA pedir reindexación** antes del contenido sustantivo · **JAMÁS el nº personal del dueño** (323…) en la web · sin gráficas/charts (regla Daniel) · ALTORRA siempre MAYÚSCULA.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 — ejecución Opus**: ✅ 0.1 scaffold (§19) · ✅ 0.2 staging LIVE (§21) · ✅ 0.7 modelo de datos (tipos+rules+`client.ts`+E2E 21/21, §22/§22.8) · ✅ 0.3 D0/D1 (§23). **Falta**: E2E "tras cache" (Workers Caching en staging, gate T9) + deploy de rules (coordinado con retiro legacy — NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-18** | **Ola 1 páginas** ⚠️ **"completo" era FALSO** (§32): las páginas se construyeron pero **DIFIEREN de los mockups** → superado por **TODO-27** (rebuild de fidelidad). D1 sellado (§23) sigue válido. | ➡️ TODO-27 | corregido por §32 |
| **TODO-20** | **Constancias liderazgo ×3**: payloads en la skill; los aplican los operadores cars/bersaglio/insema. | ⏸️ externo | |
| **TODO-21** | **Lote-dueño**: ✅ Cloudflare hecho. Restante: matrícula real · dirección física · RNT · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`) · allowlist git (opcional). | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable** (al volver su cuota): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) **decisión catálogo público SSG build-time vs doc-índice denormalizado** (gatea datos reales del portal). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (cross-repo, owner=cars; `brain-check.mjs` byte-idéntico ×3 → NO editar aquí): K-01 `verificado-vivo` obligatorio · K-02 gate boot vs target real · K-03 nudge deepAudit en `--boot` · K-04 regex frescura +"cierre" · K-05 #7 exige crudo local · K-09 anclas `§`. Detalle → §30. | 🔴 kernel | sinapsis cars |
| **TODO-24** | 🧷 **SSoT/memoria frágil** (K-06/07/10, §30): diseño sellado depende de memoria del harness NO versionada → reforzar boot→`tokens.css`/§23 + evaluar espejo; ssotFact paleta con cuidado; re-apuntar ssotFact cache→portal al cutover. | 🟡 abierto | |
| **TODO-25** | 📟 **deploy-info.json congelado** (F-03, §30): 76 commits atrás pese a `bump-version.yml on:push`. Verificar runs GH Actions + reconciliar claim CLAUDE.md §1/§4. Legacy → baja urgencia. | 🟡 abierto | sin `gh` |
| **TODO-26** | 🔥 **Firebase Blaze** ✅ **RESTAURADO** (2026-07-12): bajó a Spark por aviso de Google; **Daniel re-vinculó tarjeta → Blaze** el mismo día (listo para cablear CFs/Wompi). Sin costo/impacto. | ✅ dueño | resuelto |
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD** (WIP, §32): ✅ **5 páginas reconstruidas** (§32.8-§32.22) PERO la re-auditoría adversarial (§32.24) las desmintió → **13 ALTA ✅ corregidos, 35 MEDIA/BAJA PENDIENTES** (ficha 8 = sin tocar; síntesis en bóveda). Método: diff vs `.dc.html` + re-auditar adversarialmente, NUNCA inventar (L-29). | 🔄 OPUS | 35 pendientes |

---

## 📝 Bitácora (efímera)

> **2026-07-17 (OPUS 4.8 — §32.14-§32.24; CIERRE por contexto reventado)**: reconstruidas las 5 páginas fieles
> (home 17 secc · turismo · estancias · publicar · SERP), fix sistémico `[hidden]`. Daniel corrigió que SÍ puedo ver
> con la extensión de Chrome → 4 bugs cazados MIRANDO (L-26/L-28). Luego, en vez de seguir, **re-auditoría adversarial
> (§32.24)** que desmintió "fidelidad": **48 hallazgos, 3 de los ALTA los introduje YO "corrigiendo"** — incl. una
> cifra "+18%" INVENTADA (retirada). 13 ALTA ✅, **35 MEDIA/BAJA pendientes**. **PRÓXIMO**: (0) Daniel dejó un TRABAJO
> para el arranque de la próxima conversación → pedirlo PRIMERO. (1) cerrar los 35 pendientes (ficha=8, la más urgente).

> *(Bitácora 07-12 Header v3 + Hero podada — consolidada en ADR §32.4/§32.5/§32.6 + L-23/L-24. §G.4 GC.)*

> *(Bitácora §30 auditoría + §31 gestion podadas — consolidadas en sus ADRs. §G.4 GC.)*

> *(Bitácora D0-marca/voz/D1 del 07-11 podada — consolidada en ADRs §23-§29 + memorias `identidad-marca` +
> `sello-marca-altorra` + bóveda `2026-07-11-*`. §G.4 GC.)*

> *(Bitácora 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-22. §G.4 GC.)*
