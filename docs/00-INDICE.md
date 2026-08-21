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
| §01-§20 | 🗄️ **Era del sitio viejo (RETIRADO) + arranque del cerebro** — 20 filas movidas al shard `docs/00a-INDICE-HISTORICO.md` (§85). El kernel lee ambos índices como UNO. | → `00a` |
| §21-§60 | 🏗️ **Era de CONSTRUCCIÓN del greenfield** (scaffold, modelo de datos, design system, las superficies del portal, mapa y catálogo) — 40 filas movidas al shard `docs/00b-INDICE-CONSTRUCCION.md` (§100). El kernel lee los tres índices como UNO. | → `00b` |
| §66 | **CONTRATOS 03/04 BLINDADOS**: pagaré RETIRADO · ALTORRA arrienda EN NOMBRE PROPIO (C.Co. 1262) · dictámenes propios en vez de "pendiente de abogado". Comité ×6 + consejo externo ×2: 136 hallazgos → 126. Cláusulas reescritas: 12ª del 04 pagaré→PÓLIZA · fondo de reserva · fallecimiento · art. 22 · pena/intereses. | 1016 |
| §67 | **KIT COMPLETO (24 docs) + GATE DE EMISIÓN**: el doc 03 no se había enterado del cambio de figura (el mandato contradecía al arriendo). Comité R3 + consejo R3. Ningún doc de firma se emite con marcas: 24/24, 11/11 en verde. | 1068 |
| §68 | **FUENTE ÚNICA DEL MANUAL**: el cap. 2 estaba DOS VECES en el maestro y las copias habían divergido en la fila del pagaré RETIRADO → el maestro ahora se GENERA de los fragmentos (`ensamblar-manual.ps1`). Namespace `LD-NN` + hoja `32` (colisión L-31..L-34, M-04). C.Co. 1096/1099 verificados. Auditoría B-03: 14/14 docs, 191 hallazgos. | 1123 |
| §69 | **Auditoría Nivel-2 #5** (la disparó el GATE de pre-commit, no un encargo): retrieval frío **5/6** · 2 fallos de ruteo CURADOS (faltaba la fila del ARRENDADOR; dev-sí/prod-no citaba L-33 en vez de L-34) · **REINCIDENTE**: TODO-31 perdió su fila y A-01/A-03 llevaban 11 días invisibles · **CRÍTICO: el kit legal no tiene linter** → TODO-35. | 1191 |
| §70 | **B-03 APLICADA (14 críticos) + los ESTATUTOS entran al cerebro**: la auditoría revisó el kit contra el kit y nunca abrió los estatutos → 3 de las 4 decisiones subidas al dueño YA estaban resueltas ahí (precio por peritos art. 8º e · supramayoría 70% art. 13º · arbitramento art. 24º). Daniel RETIRA el doc 13. [[LD-05]] + LD-02 reincidente. | 1247 |
| §71 | **23 ALTOS de B-03 aplicados + los 2 primeros gates documento↔documento** (12 planificadores + 1 revisor de colisiones). 21 vigentes · 12 degradados. El revisor cazó 2 choques de escritura. → [[LD-06]] | 1306 |
| §72 | **Heartbeat+handoff a los 3 hermanos (TODO-32a ✅)**: sin él el estado derivable se copia a mano y se desincroniza (el 05 de cars declaraba una cache de 8 días atrás; insema no tenía NINGÚN SessionStart). Re-midió el SPOF: 2 de 3 pendientes eran falsos. Destapó que el boot-gate solo existía en inmobiliaria (→ §81) y que `brain-kit` sigue congelado. | 1372 |
| §73 | **Auditoría de insemastereo aplicada + bersaglio destilado**: 36 hallazgos → 14 en un cerebro que el linter daba SANO; 5 sondas cazaron el mismo `05` mintiendo sobre git. El heartbeat generaba la verdad y ningún nodo la enrutaba (§72 a medias). bersaglio llevaba tiempo sin poder commitear → destilado. 6 chequeos de kernel a TODO-23. | 1422 |
| §74 | **cars destilado 35.9k→33.9k + `brain-kit` descongelado**: la tabla de topes de §G.5 tapaba 2 hojas SIN cap (una de 27k, ningún gate la miraba) → nace el chequeo #23. Los caps se MIDEN, no se inventan. | 1477 |
| §75 | **kernel v1.7.0 — chequeos #17 y #23**: el kernel nunca miraba el git del repo que audita (por eso un 05 mintió 42 días con 16 gates en verde), ni vigilaba las neuronas que el manifest no declara (44 sin techo ×4). Verificados ENCENDIDOS: la v1 de #17 no cazaba el caso real y la v2 acusaba a un inocente ([[M-06]]). | 1520 |
| §76 | **52 neuronas bajo techo + shard de §Meta → `33-LECCIONES-META`**: las 44 sin cap quedaron decididas (cap medido o noCap con razón). Y la trampa que estuve a punto de hacer DOS veces: subir un límite en vez de cumplirlo — el gate pasa, la deriva sigue, y queda evidencia falsa de control (M-05). | 1555 |
| §77 | **El kernel corregido 3 veces POR PROBARLO** (v1.7.2): #17 no disparaba, luego acusaba a un puntero de neurona, luego a una skill. Y el gate #4 quedó obsoleto por el arreglo que él provocó: exigía en el 05 un dato que la doctrina nueva elimina. bersaglio: 05 en tope por primera vez. → M-06. | 1591 |
| §78 | **cars en presupuesto (35.9k→29.7k) por MOVER, no por raspar**: sus 25 pendientes congelados (§302) salían del boot en cada sesión → hoja `11`. Congelado ≠ cerrado y el shard es reversible. Caps coherentes ×4 (22 apretados). Los 308c que restaron se dejan A LA VISTA en vez de subir el techo ([[M-05]]). | 1631 |
| §79 | **bersaglio −23% de boot (43.1k→33.3k)**: gobernanza y doctrinas que inmobiliaria ya había destilado y los hermanos nunca recibieron + el backlog sin empezar sale del boot (decisión del dueño). El gate me paró: abreviar nombres de archivo ganó 542c y dejó 5 neuronas inalcanzables. | 1667 |
| §80 | **CIERRE 31-jul/01-ago: los 4 cerebros mergeados a main** (28 commits, cero producto — verificado antes). El #17 cazó que yo mismo dejé cars fuera de su rama única. Balance: 23 altos del kit · 4/4 SANOS · 44 neuronas sin techo → 0. | 1697 |
| §83 | **AUDITORÍA Nivel-2 #6: 109 brutos → 44 vivos** (47 refutados). Kernel **v1.9.0** ×5: #9 ciego a la fila ✅ sin ADR · borrar clave del manifest apagaba gates · el boot mentía «cache verificada» · +#26 fila del índice. CRÍTICO N6-01: precios y regla anti-strike de Bersaglio vivían solo en la memoria del harness. El workflow murió 2 veces → [[M-08]]. | 1839 |
| §89 | 🏗️ **`/ingresar` y `/favoritos`** — las 2 pantallas que el header enlazaba a un 404. Favoritos en **localStorage, NO tras el login** (el mockup dice «ingresar para SINCRONIZARLOS»). **Crear cuenta NO se abre**: falta publicar la Política (Ley 1581 art. 9). | 2340 |
| §90 | 🔬 **Auditoría Nivel-2 #7** (4 drills fríos): ruteo SANO 4/4 pero **2/4 responderían MAL** por frescura. [[M-10]]: tres gates verdes cubrían MEDIA promesa. **N7-00**: la campaña de humo puede ser ZOMBIE (`05` la da apagada, su SSoT ACTIVA). | 2418 |
| §91 | 🔎 **SEO técnico de OLA 1**: `PUBLIC_SITE_ENV` se leía en 2 sitios y no se declaraba en ninguno ⇒ **todo build salía `noindex`**, el del cutover también. Mapa de 68 URLs → 301, `robots`/`sitemap` conscientes del entorno, candado en `verify:build` #6. | 2464 |
| §92 | 🗺️ **13 landings de zona** (ítem 4): redirects y sitemap **derivados de `ZONAS`**, imposibles de desincronizar. CERO datos cuantitativos (el portal ya se quemó con listings fabricados). Al pasar: el portal no tenía **ni un JSON-LD** ni `canonical`. | 2520 |
| §93 | 💰 **`/precios`** (ítem 7, «el diferenciador gratis»): las cifras SELLADAS de `43`, no las del MEGA-PLAN, que están SUPERADAS. Lo no decidido se dice. ⚠️ §93.6: el footer dice «Avalúo gratis» y B13 lo prohíbe — dos fuentes del cerebro en contradicción legal. | 2560 |
| §94 | 🏷️ **Rango ALTORRA** (ítem 9): parecía gateado por Daniel y NO lo estaba — es contacto-primero, así que sin número en pantalla los rangos no son prerrequisito. Cierra el último `pendiente` del mapa de 301. B13: dice que NO es un avalúo (Ley 1673). Arregla 2 integraciones mudas: `origen` hardcodeado y la allow-list de zonas con 6 de 13. | 2598 |
| §95 | 🔖 **JSON-LD del negocio** en todas las rutas (`RealEstateAgent`, desde `BaseLayout`). Lo valioso son las 2 ausencias deliberadas: **sin `streetAddress`** (falta la dirección comercial) y **sin `aggregateRating`** (no hay reseñas; inventarlas la sanciona la SIC). | 2640 |
| §96 | 🔔 **Alertas guardadas + digest diario** (ítem 8) → **OLA 1 = 13/13**. Matching con UN dueño (web y Function importan el mismo módulo); la baja es **POST, nunca GET**. Al pasar, 3 bugs PREVIOS: `solicitudes` moría en el cutover · redirect + `headers.set()` = 500 sin JS ([[L-41]]) · habeas data a medias en el Rango ([[LD-08]]). | 2686 |
| §97 | 🏠 **La ficha dinámica** (TODO-33): el gate de §60 estaba sobre INVENTAR los 4 bloques sin fuente, no sobre construir — [[L-40]] por 3ª vez. Ruta canónica `/inmueble/<slug>`. Lo grave lo cazó la revisión adversarial: **no comprobaba que la propiedad estuviera publicada** ([[L-42]]). | 2771 |
| §98 | 🔌 **Dos premisas que no eran ciertas**: Workers Caching llevaba sin habilitar desde Ola 0 (todo `s-maxage` era INERTE) y el panel de gestión no tenía puerta. Auditar ANTES de encender salvó un token en caché. 🔴 Y el hallazgo gordo: **`isStaff()` es insatisfacible** — nadie pone nunca el claim, así que el back-office moriría al desplegar las reglas. | 2858 |
| §99 | 🔑 **Decisión Fuerte: el claim de staff** (TODO-42). Se DERIVA de `usuarios/{uid}` con un trigger, en el codebase del legacy, y se despliega SOLO. Mató el `get()` en reglas con coste verificado (se factura aunque deniegue, y `/ingresar` da sesión a cualquiera). 🎁 De regalo: desplegar las reglas del portal tal cual **mata `admin.html`** → TODO-43. | 2914 |
| §100 | 🔐 **Ruleset ÚNICO y fusionado** (TODO-43): había DOS con el mismo nombre y Firestore no fusiona — desplegar el del portal **mataba `admin.html`**. Permisos por CLAIM (cero lecturas), escape de staff en `propiedades`, y 2 agujeros del ruleset VIVO cerrados (`system` y `newsletter`). Storage igual: el deny en la raíz tapaba las fotos públicas. **80 tests de emulador**. | 2992 |
| §101 | 📥 **Bandeja de leads REAL** en el panel (ítem 10, 1ª mitad): los leads entraban desde §88 y solo se veían en la consola de Firebase, con el correo roto. Consulta acotada, sin listeners, teléfono como enlace a WhatsApp. Si falla, **borra los de muestra** — enseñarlos haría llamar a gente que no existe. | 3054 |
| §102 | 🚀 **El runbook del cutover** (`specs/CUTOVER-RUNBOOK.md`) + el interruptor que el CI **no declaraba**: `PUBLIC_SITE_ENV` no existía en ningún sitio del repo, así que TODO build de la historia salía `noindex` — incluido el que iba al cutover. Ahora 3 perillas por variable de repositorio (defaults seguros) y seis fases en orden, cada una con verificación y vuelta atrás. | 3104 |
| §88 | 🏗️ **El formulario de captación deja de perder los leads**: `/publicar` era demo. Endpoint `/api/solicitud` (funciona SIN JS) → `solicitudes` con el contrato del legacy. Probando END-TO-END salió que **el correo de avisos está ROTO** (Gmail). [[L-33]] reincidente. | 2265 |
| §87 | **Leves lotes 2-3 (28/92)**: el grupo «retirados» NO era moot (5 de 7 eran de documentos vivos). En los de FIRMA, 7/7 vivos: la **retención se repartía por mitades** y no había salida para el negocio que muere ya celebrado (FASE G). 2º remedio dañino. | 2199 |
| §86 | **Los "85 leves" del kit eran 92** (el descuento no vio que el doc 13 también está retirado, y el grupo descontado mezclaba documentos VIVOS). Lote 1: **7 aplicados · 1 REFUTADO** — el remedio situaba un blanco de URL en una cláusula sana del 03 y no veía los docs 17/18, que sí lo tenían. Ledger reanudable en bóveda. | 2141 |
| §85 | **TODO-37 CERRADO**: el canario #24 le preguntaba al archivo que vigila si debía vigilarlo (fallo ABIERTO) → `harnessCanary` al manifest, [[M-07]] forma 2. Sin bóveda, 3 gates apagados salían bajo un ✅ → `degrade()` + veredicto 🟠. Mora del kit → B-05. | 2047 |
| §84 | **PODA REAL del router (TODO-32b): boot 31.4k→28.4k sin subir el techo.** Nace `34-DOCTRINA-CODIGO` (perf/observadores/stack/CSS legacy salen del always-on) · `§0` deja de duplicar los triggers de `§G.2` · 3 cifras copiadas del manifest, cortadas. Criterio → [[M-09]]. | 1965 |
| §82 | **TODO-35 CERRADO: el kit de firma estrena sus 6 gates cruzados** (cifras vs doc 02 · remisiones a docs RETIRADOS · identidad/canales · anclas de la figura del ARRENDADOR). Cierra el crítico N5-05. Las 2 excepciones que solo salen probando: la cita que DEROGA y la cifra AJENA ([[LD-07]]). Cazó 2 remisiones vivas al doc 13 RETIRADO. Nuevo `-SoloGates`. | 1792 |
| §81 | **TODO-36 CERRADO: trinquete de boot ×4, candado AL KERNEL v1.8.0.** bersaglio y insema podados **sin subir un techo** ([[M-05]]). `boot-gate.mjs` borrado (one-in-one-out) → chequeos #2 y #24. Hallazgo: **insema no tenía pre-commit** → nace el #25 y [[M-07]]. | 1741 |
| §65 | **TODO-34 F4-w2 ✅: MANUAL MAESTRO (10 caps) + mercado → sistema documental 00-23 COMPLETO**. Tarifas comerciales adoptadas-vetables con costumbre certificada · FE gratuita DIAN soporta mandato nativo · prompt consejo externo del manual listo. | 1006 |
| §64 | **TODO-34 F4-w1 ✅: KIT FUNDACIONAL 14 docs + Word + `00-LEEME`** (10 redactores + 5 auditores → 37 fixes aplicados). Patrón redactor→auditor-adversarial→aplicador PROBADO. | 996 |
| §63 | **TODO-34 F2 ✅: verificación legal 6 frentes .gov.co + Gemini integrado**. RUB vencido→YA · CE SAGRILAFT derogada 02-jul-26 · 5 prácticas ILEGALES · canon-neto legal (4 formalidades de mandato) · §63.8 cero contratos vigentes → F4 reordenado. | 985 |
| §62 | **TODO-34 F1 ✅: triaje del corpus (143, 9 lectores) → nace `43-OPERACION`**: doble NIT · matrícula sin resolución · gerente sin mayoría · KYC→FONPRECON · tarifario inexistente. | 975 |
| §61 | ⭐ **PIVOTE DE MISIÓN: Fundación Operativa (TODO-34)** — armar la inmobiliaria completa con datos reales (Claude=abogado+empleados · cerebro dual Code+Chat). Corpus REAL: 83 docs + operación VIVA (2 administrados); gaps: corta estancia · notaría · inquilino · contable. Plan F1-F4. | 965 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
