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
> **✅ HOME COMPLETA — las 17 secciones del mockup, en su orden (§32.8-§32.18)**: Header v3 · Hero · propiedad-dia ·
> venta · destacadas · arriendo(LISTA+filtro) · estancias-list · explora-zona · **cerca(buscador+MAPA, divergencia
> GRAVE cerrada)** · recientes(bento) · valoradas · cta-estancias · proyectos · invertir · brokers · journal · redes.
> Lienzo de la home = **neu** (§32.15). **0 off-palette.** Pusheado + deploy a staging verificado (76KB→115KB).
> **⏳ FALTA**: Turismo (Pasadías) · Estancias (reseñas) · Publicar (franja 4 beneficios) · SERP (interactividad JS)
> · deltas MENORES de `#destacadas`/`#journal` (§32.9). Es el WIP activo (TODO-27, §32.7).
>
> **🎨 DISEÑO ELEVADO (mandato Daniel, §32.3)**: fusión **Neumorfismo + Skeuomorfismo + Glassmorfismo + Liquid Glass**,
> sensación de **app** (la app futura = idéntica), moderno/premium. **Que NO peleen**: cada componente lidera con UNA
> técnica — **header=glass+metal · cards=neumorfismo · overlays=glass**. Íconos: NO `astro-icon` (rompe Workers, L-23) →
> paths **Lucide (UI) + Simple Icons (redes)** embebidos inline. Emblema = **`altorra-emblema.webp`** (Canva `DAGxI7p5OBk`,
> solo el "A" metálico; el viejo `altorra-mark-t.webp` pixelado/con-texto está RETIRADO). Componentes → `20 §Portal`.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `portal/src/styles/tokens.css` + ADR §23-§23.9 + memorias
> `identidad-marca-inmobiliaria`/`sello-marca-altorra`; ratificaciones TODAS cerradas): paleta OFICIAL
> (navy `#062743` · blanco · dorado `#D4AF37` · plata `#BFC3C9` · grises `#E6EDF2`/`#F2F6F9`) · **disciplina
> ESTRICTA** (fondo blanco · DORADO predomina · navy discreto · SIN verde/rojo/ajeno; estados navy+oro+ÍCONO) ·
> **Cormorant Garamond** (display) + **Hanken Grotesk** (cuerpo) · neumorfismo protagonista + glass sutil,
> DUAL-MODE (`#fff` contenido / `#E6EDF2` home+nav / `#062743` secciones).
>
> **▶ CÓMO RETOMAR (sesión fresca)**: boot normal (§G.1). Dev: `npm --prefix portal run dev` (config `portal`, puerto 4321).
> 👁️ **VERIFICA MIRANDO, con la extensión de CHROME** (`mcp__claude-in-chrome__*`): renderiza/anima/captura PERFECTO.
> El congelado es solo el **panel integrado** (`mcp__Claude_Browser__*`, `rAF`=0) → sirve para computed styles/espía,
> NO para ver. **L-26** (corregida por Daniel 07-17: creer que "no puedo ver" era falso). Mirar cazó un bug que NI el
> build NI la paleta NI los computed styles vieron (`.alt-sr-only` inexistente → la clase real es `.alt-visually-hidden`).
> Barrido off-palette = `getComputedStyle` del subárbol vs allowlist (⚠️ incluir la base hairline `rgb(27,39,51)` de
> `tokens.css:71` o da falsos positivos).
>
> **▶ SIGUIENTE — REBUILD DE FIDELIDAD (TODO-27, de arriba abajo, mostrando cada bloque a Daniel en staging)**:
> 1. ~~**Home**~~ ✅ **COMPLETA** (§32.8-§32.18; auditoría §32.9 + crudo/síntesis en bóveda
>    `2026-07-16-auditoria-fidelidad-home-*`). **Piezas reutilizables ya construidas** — reusar, NO reinventar:
>    `.alt-rail`+`.alt-rnav`+chasis `.home-railsec` (el `[data-railwrap]` DEBE envolver encabezado Y riel: en el
>    mockup son hermanos y sus flechas están ROTAS) · `.alt-btn-sweep` · `.alt-btn-frost` · `.home-oppill` ·
>    **6 cards, NINGUNA intercambiable**: `PropertyCard`(grillas) · `LuCard`(centrada+swatches) · `StayCard`(SIN
>    caja) · `RankCard`(neu+numeral calado) · `ProjectCard`(póster 3/4) + los tiles de zona/bento inline.
> 2. **SIGUIENTE — mismo método** (leer el `.dc.html` de CADA sección ANTES de construir): **Turismo** (Pasadías +
>    inversión 3-cards + zonas ×6) → **Estancias** (Reseñas + galería) → **Publicar** (franja 4 beneficios) →
>    **SERP** (interactividad JS: filtros/fav/hover-pin) → deltas menores `#destacadas`/`#journal`. `#brokers`=FIEL.
>    ⚠️ **Regla de oro (L-24)**: la infidelidad es ESTRUCTURAL, no de color. Preguntar siempre **"¿tiene diseño
>    propio o es el genérico?"** — pagó ×5 en la home. Matiz: `#destacadas` salió `disenoPropio:false` ⇒
>    **`PropertyCard` NO es el villano**; el fallo fue reutilizar sin preguntar. Y **el mockup tiene bugs**
>    (flechas rotas, `@altorra.co` falso, `href="#"`, scrims casi negros): ser fiel NO es replicarlos.
> 2. **Turismo** (Pasadías + inversión 3-cards glass + zonas ×6) · **Estancias** (sección Reseñas + galería) · **Publicar**
>    (franja 4 beneficios) · **SERP** (interactividad JS: filtros/fav/hover-pin). Detalle de qué falta por página → §32.2.
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
> (c) **Verificar por computed styles, no captura** (L-22). **Los datos del portal son DEMO estáticos** — la capa `client.ts` está lista para cablear cuando haya inventario.
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
| **TODO-27** | 🎨 **REBUILD DE FIDELIDAD + elevación** (WIP ACTIVO, §32): reconstruir páginas fieles a mockups + estética elevada (§32.3, fusión sin choque). ✅ Header + Hero + **Arriendo→lista** (§32.8). ⏳ Home(9 secc restantes)/Turismo/Estancias(reseñas)/Publicar(franja)/SERP(interactividad). Mapa por página → §32.2. | 🔄 OPUS | mostrar a Daniel por bloque |

---

## 📝 Bitácora (efímera)

> **2026-07-16 (OPUS 4.8 — §32.8-§32.13)**: Daniel cazó (2ª vez) una infidelidad ESTRUCTURAL (`#arriendo` era grilla
> genérica; el mockup pide lista + filtro) → corregido (§32.8) y, para no repetirlo 9 veces, **auditoría de la home
> ENTERA** (§32.9: 17 secciones · 10 AUSENTES · `#cerca` GRAVE con contenido inventado · 0 veredictos refutados).
> Daniel aprobó los 2 bloques molde ("todo va bien, sigamos") → **los 4 CARRUSELES hechos** (§32.10-§32.13). El gate
> "¿diseño propio o genérico?" pagó ×3: **5 cards, ninguna intercambiable**; lo único compartido es `.alt-rail`.
> **PRÓXIMO**: los 2 splits → 2 mosaicos → CTA/redes → corregir `#cerca`. Ver el orden en el Foco (arriba).

> *(Bitácora 07-12 Header v3 + Hero podada — consolidada en ADR §32.4/§32.5/§32.6 + L-23/L-24. §G.4 GC.)*

> *(Bitácora §30 auditoría + §31 gestion podadas — consolidadas en sus ADRs. §G.4 GC.)*

> *(Bitácora D0-marca/voz/D1 del 07-11 podada — consolidada en ADRs §23-§29 + memorias `identidad-marca` +
> `sello-marca-altorra` + bóveda `2026-07-11-*`. §G.4 GC.)*

> *(Bitácora 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-22. §G.4 GC.)*
