# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual — RELEVO CURADO (cierre 2026-07-12 por saturación de contexto)

> ⚡ **ESTADO — Ola 1: el PORTAL PÚBLICO está COMPLETO y LIVE** (dev + staging). TODAS las páginas con
> mockup aprobado hechas y verificadas EN VIVO (0 colores off-palette, 0 errores). Todo pusheado a `main`
> (último commit `a32ee82`). **29 ADRs, cerebro SANO.**
>
> **Páginas LIVE** (`portal/src/pages/`): `index`(home, 8 secciones) · `[operacion]`(=`/comprar`+`/arrendar`
> SERP con filtros+mapa esquemático) · `ficha` (detalle+WhatsApp+sello Verificado) · `publicar` (lead form
> funcional) · `estancias` (reserva funcional por fechas) · `turismo` (landing) · `404` (en construcción) ·
> `design-system` (styleguide dev). **Componentes compartidos** (`portal/src/components/`): `Header` ·
> `Footer` · `PropertyCard`. Detalle de dónde vive cada cosa → `20 §Portal`.
>
> **🎨 DISEÑO SELLADO — NO re-litigar** (ADR §23-§23.9 + memorias `identidad-marca-inmobiliaria` +
> `sello-marca-altorra`): paleta OFICIAL (azul marino `#062743` · blanco · dorado `#D4AF37` · plateado
> `#BFC3C9` · grises fríos `#E6EDF2`/`#F2F6F9`) · **disciplina de color ESTRICTA** (fondo blanco · DORADO
> predomina · navy discreto · plata presente · estados navy+oro+ÍCONO, SIN verde/rojo/ajeno) · tipografía
> **Cormorant Garamond (display) + Hanken Grotesk (cuerpo)** · lenguaje **neumorfismo protagonista + Liquid
> Glass sutil**, DUAL-MODE (`#fff` contenido plano / `#E6EDF2` home+nav neumórfico / `#062743` secciones).
> SSoT de tokens = `portal/src/styles/tokens.css`. **Ratificaciones de diseño: TODAS cerradas.**
>
> **▶ CÓMO RETOMAR (sesión fresca)**: boot normal (§G.1). Dev: `npm --prefix portal run dev` (`.claude/launch.json`
> config `portal`, puerto 4321). ⚠️ **Verificar UI por COMPUTED STYLES, no por captura** (L-22: el panel del
> navegador se cuelga con `backdrop-filter`); el barrido anti-off-palette = `javascript_tool` con `getComputedStyle`
> sobre `main *,header *,footer *` contra el allowlist de la paleta.
>
> **▶ SIGUIENTE (elegir con Daniel)**:
> 1. 🧠 **Auditoría Nivel-2 del cerebro** (TODO-19, VENCIDA: 17 ADRs nuevos ≥12) — recomendada PRIMERO, con contexto fresco (skill `auditoria-cerebro`).
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
| **TODO-19** | 🧠 **Auditoría Nivel-2 del cerebro VENCIDA** (17 ADRs nuevos desde 2026-06-15): correr skill `auditoria-cerebro` (§173) + destilar `_legacy/AVANCES.md` Fase B + evaluar lecciones C-01..C-39 vs `30`. **Recomendada como 1er paso de la sesión fresca.** | 🔴 DEBIDA | |
| **TODO-20** | **Constancias liderazgo ×3**: payloads en la skill; los aplican los operadores cars/bersaglio/insema. | ⏸️ externo | |
| **TODO-21** | **Lote-dueño**: ✅ Cloudflare hecho. Restante: matrícula real · dirección física · RNT · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`) · allowlist git (opcional). | ⏸️ dueño | pedir por LOTES |
| **TODO-22** | **Auditoría Fable** (al volver su cuota): (a) ADR §22 `[REVISAR-FABLE]` (capa de datos OD1); (b) **decisión catálogo público SSG build-time vs doc-índice denormalizado** (gatea datos reales del portal). | 🔮 FABLE | |

---

## 📝 Bitácora (efímera)

> **2026-07-12 (OPUS 4.8 — Ola 1, sesión larga; CIERRE por saturación)**: construí TODO el portal público
> sobre D1: alineé la paleta oficial + disciplina de color estricta + tipografía Cormorant/Hanken +
> Liquid Glass sutil (§23.8/§23.9); componentes compartidos `Header`/`Footer`/`PropertyCard`; páginas
> home(§24) · SERP `/comprar`+`/arrendar`(§25) · `/ficha`(§26) · `/404`+`/publicar`(§27) · `/estancias`(§28,
> reserva funcional) · `/turismo`(§29); optimicé 24 imágenes a WebP (−90%, §24.10). Cada página verificada
> por computed styles → **0 colores off-palette, 0 errores** (L-22: capturas del panel bloqueadas por
> backdrop-filter). Regla §3.2 respetada (solo páginas con mockup). Todo pusheado a `main`. **PRÓXIMO
> (sesión fresca):** auditoría Nivel-2 (TODO-19) → Gestion / transversales.

> *(Bitácora D0-marca/voz/D1 del 07-11 podada — consolidada en ADRs §23-§29 + memorias `identidad-marca` +
> `sello-marca-altorra` + bóveda `2026-07-11-*`. §G.4 GC.)*

> *(Bitácora 07-10/07-11-código podada — consolidada en ADRs §15-§22.8 + lecciones L-16..L-22. §G.4 GC.)*
