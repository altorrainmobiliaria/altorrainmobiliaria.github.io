# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual — RELEVO CURADO (cierre 2026-07-12 por saturación de contexto)

> ⚡ **ESTADO — Ola 1: el PORTAL PÚBLICO está COMPLETO y LIVE** (dev + staging). TODAS las páginas con
> mockup aprobado hechas y verificadas EN VIVO (0 colores off-palette, 0 errores). Todo pusheado a `main`.
> **30 ADRs; cerebro SANO + auditado Nivel-2 (§30 · 2026-07-12, retrieval FUNCIONAL).**
>
> **Páginas LIVE** (`portal/src/pages/`): `index`(home, 8 secciones) · `[operacion]`(=`/comprar`+`/arrendar`
> SERP con filtros+mapa esquemático) · `ficha` (detalle+WhatsApp+sello Verificado) · `publicar` (lead form
> funcional) · `estancias` (reserva funcional por fechas) · `turismo` (landing) · `404` (en construcción) ·
> `design-system` (styleguide dev). **Componentes compartidos** (`portal/src/components/`): `Header` ·
> `Footer` · `PropertyCard`. Detalle de dónde vive cada cosa → `20 §Portal`.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (SSoT `portal/src/styles/tokens.css` + ADR §23-§23.9 + memorias
> `identidad-marca-inmobiliaria`/`sello-marca-altorra`; ratificaciones TODAS cerradas): paleta OFICIAL
> (navy `#062743` · blanco · dorado `#D4AF37` · plata `#BFC3C9` · grises `#E6EDF2`/`#F2F6F9`) · **disciplina
> ESTRICTA** (fondo blanco · DORADO predomina · navy discreto · SIN verde/rojo/ajeno; estados navy+oro+ÍCONO) ·
> **Cormorant Garamond** (display) + **Hanken Grotesk** (cuerpo) · neumorfismo protagonista + glass sutil,
> DUAL-MODE (`#fff` contenido / `#E6EDF2` home+nav / `#062743` secciones).
>
> **▶ CÓMO RETOMAR (sesión fresca)**: boot normal (§G.1). Dev: `npm --prefix portal run dev` (`.claude/launch.json`
> config `portal`, puerto 4321). ⚠️ **Verificar UI por COMPUTED STYLES, no por captura** (L-22: el panel
> desincroniza el viewport de la captura del scroll real del DOM — quirk del renderer); el barrido anti-off-palette = `javascript_tool` con `getComputedStyle`
> sobre `main *,header *,footer *` contra el allowlist de la paleta.
>
> **▶ SIGUIENTE (elegir con Daniel)**:
> 1. ✅ ~~Auditoría Nivel-2~~ HECHA (§30, 2026-07-12): SANA + retrieval funcional; 7 hallazgos in-repo curados + 10 kernel→TODO-23/24/25.
> 2. **Gestion** (`/gestion`, panel admin) — ÚNICO mockup restante; es back-office (capítulo distinto).
> 3. **Transversales**: MapLibre real (hoy mapa esquemático) · cablear formularios (publicar/estancias) → `solicitudes` vía Cloud Function (hoy client-side) · datos Firestore REALES (hoy DEMO estáticos — decisión catálogo SSG-vs-índice DIFERIDA a Fable, TODO-22) · pago Wompi (Ola 2, custodia).
> 4. Páginas SIN mockup (invertir/aliados/journal/Nosotros/Contacto/favoritos/ingreso) → **requieren aprobación de diseño de Daniel (§3.2), NO inventar UI**.
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
| **TODO-18** | **Carril D + Ola 1 páginas** ✅ **COMPLETO (público)**: D0 cerrado · diseño entregado · D1 sellado (§23) · **todas las páginas públicas mockup-backed LIVE** (§24-§29: home/SERP/ficha/publicar/estancias/turismo/404 + Header/Footer/PropertyCard + WebP). ▶ Resta: **Gestion** (panel admin, §29.3) + transversales (ver Foco). | 🔄 OPUS | 0 off-palette verificado |
| **TODO-20** | **Constancias liderazgo ×3**: payloads en la skill; los aplican los operadores cars/bersaglio/insema. | ⏸️ externo | |
| **TODO-21** | **Lote-dueño**: ✅ Cloudflare hecho. Restante: matrícula real · dirección física · RNT · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`) · allowlist git (opcional). | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable** (al volver su cuota): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) **decisión catálogo público SSG build-time vs doc-índice denormalizado** (gatea datos reales del portal). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (cross-repo, owner=cars; `brain-check.mjs` byte-idéntico ×3 → NO editar aquí): K-01 `verificado-vivo` obligatorio · K-02 gate boot vs target real · K-03 nudge deepAudit en `--boot` · K-04 regex frescura +"cierre" · K-05 #7 exige crudo local · K-09 anclas `§`. Detalle → §30. | 🔴 kernel | sinapsis cars |
| **TODO-24** | 🧷 **SSoT/memoria frágil** (K-06/07/10, §30): diseño sellado depende de memoria del harness NO versionada → reforzar boot→`tokens.css`/§23 + evaluar espejo; ssotFact paleta con cuidado; re-apuntar ssotFact cache→portal al cutover. | 🟡 abierto | |
| **TODO-25** | 📟 **deploy-info.json congelado** (F-03, §30): 76 commits atrás pese a `bump-version.yml on:push`. Verificar runs GH Actions + reconciliar claim CLAUDE.md §1/§4. Legacy → baja urgencia. | 🟡 abierto | sin `gh` |

---

## 📝 Bitácora (efímera)

> **2026-07-12 (OPUS 4.8 — Auditoría Nivel-2 #2, §30)**: híbrida (sondas directas + workflow 8-ag para 3/4/7).
> **SANO + retrieval FUNCIONAL**; 7 hallazgos in-repo curados (F-01 `05` rezagada→**M-01**) + 10 kernel → TODO-23/24/25.
> Artefacto+tabla → bóveda `2026-07-12-auditoria-*`. **PRÓXIMO:** Gestion / transversales (elige Daniel).

> *(Bitácora Ola-1 07-12 podada — construcción del portal público completa en ADRs §24-§29. §G.4 GC.)*

> *(Bitácora D0-marca/voz/D1 del 07-11 podada — consolidada en ADRs §23-§29 + memorias `identidad-marca` +
> `sello-marca-altorra` + bóveda `2026-07-11-*`. §G.4 GC.)*

> *(Bitácora 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-22. §G.4 GC.)*
