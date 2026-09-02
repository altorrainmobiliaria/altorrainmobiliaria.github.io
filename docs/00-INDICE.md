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
| **El gate estaba bien escrito y nunca opinó** · ¿bajo qué condición corre? · predicado/`paths:`/entorno/ancla borrada | hoja `38a-ARMADO-DEL-GATE.md` — L-56 cableado · L-65 entorno · L-70 predicado · L-71 ancla (§289) |
| **Un gate sale ✅ pero el cerebro dice que BLOQUEA** · verde que nadie ha visto fallar · exención de entorno | `38-GATES-QUE-MIENTEN` L-65 + `99 §240` — el comando está en `specs/CUTOVER-RUNBOOK.md` |
| **¿Puedo publicar este dato de contacto?** teléfono/correo público · el móvil PERSONAL del dueño | `99 §241` + §250. SSoT: `portal/src/lib/config/site.ts`; lo vigila un gate de `portal/scripts/verify-build.mjs` |
| **Genero un fichero y llega CORRUPTO sin que nada falle** · heredoc · barras invertidas comidas · `/tmp` que no es el mismo | `36-LECCIONES-UTILLAJE` L-46 y L-66 |
| **¿Puedo mergear a main AQUÍ?** las reglas git de cada repo hermano difieren | `CLAUDE.md §2` (este repo) + skill `sinapsis-cerebros` + `99 §245` — ⚠️ en INSEMA mergea el dueño |
| **Voy a tocar una página pública**: qué está prohibido y qué gates me van a frenar | `34-DOCTRINA-CODIGO` + los `portal/scripts/verify-*.mjs` (§247 · §248 · §249) |
| Mapa (MapLibre/Protomaps/pmtiles/tiles/marcadores/R2 tiles) · binding CF desde ruta SSR | `99 §55` + `30 L-33` (`cloudflare:workers`) + `50 §Tiles` (subir .pmtiles) |
| **Funciona en dev pero NO en producción** (Cloudflare) · el mapa no carga en prod | `30 L-34` (Workers Static Assets IGNORA `Range`; `astro dev` SÍ lo honra → paridad dev↔prod FALSA) + `99 §55.9` |
| **¿Quién firma como ARRENDADOR?** figura de firma · mandato sin representación · quién demanda | `99 §66` (ALTORRA en NOMBRE PROPIO, C.Co. 1262 — decidido y blindado; el propietario NO es parte) + `42-LEGAL` |
| Catálogo (índice denormalizado `indices/*` · `catalogo.get` · `/api/catalogo` · SERP con datos reales) | `99 §54`decisión · `§56`lectura · `§57`núcleo · `§58`Functions · `§59`SERP+flag · **`§60`frontera+ficha** · `30 L-35`/`L-36` |
| Verificar UI (screenshot/computed/scroll/interacción · panel congelado vs Chrome) | hoja `31-VERIFICACION-UI` (L-22/L-26/L-28 completas; lápidas en `30`) |
| Redactar/corregir/renumerar/retirar un entregable legal u operativo · auditar documentos | hoja `32-LECCIONES-DOCUMENTALES` (familia `LD-NN` completa; antes eran `L-31..L-34` "del kit", ADR §68) |
| El cerebro me falló COMO MEMORIA (nodo stale, ruteo errado, regla mala) · meta-aprendizajes `M-NN` | hoja `33-LECCIONES-META.md` (stub en `30`, detalle allá) |
| **Reincidí teniendo la lección delante** · la regla estaba escrita y no me protegió · «¿por qué no disparó?» | hoja `33a-LECCION-QUE-NO-DISPARA.md` — M-11 pendiente · M-24 disparador · M-25 mecanismo · M-26 ruteo · M-28 momento |
| **Algo societario**: precio de acciones · mayorías · quién manda · pleito entre socios · quién es gerente | 📜 **ESTATUTOS V5 primero** (`Downloads/ALTORRA Company (Legal)/Estatutos/`) — mandan sobre todo el kit. Resumen y qué NO cubren → `99 §70` |
| **Encender el portal** / cutover / DNS / «¿por qué sale noindex?» / orden de despliegue | 🚀 `specs/CUTOVER-RUNBOOK.md` (SSoT del orden; 6 fases con verificación y vuelta atrás) |
| **Dar de alta, editar o listar un inmueble** desde el panel · «¿por qué no aparece lo que guardé?» | `99 §108` alta · `§110` listado+columna «¿se ve?» · `§111` edición · mapa en `21` |
| **Subir una foto** / R2 / «¿quién puede escribir en el bucket?» / verificar identidad en el edge | `99 §107` (JWT RS256 con WebCrypto; a R2 NO llegan las Rules) |
| **El catálogo sale VACÍO** y no hay ningún error · una propiedad que no aparece | `99 §103` (esquema del panel viejo) · `§104` (RNT) · `problemasParaPublicar()` en `domain/catalogo.ts` dice el motivo |
| **¿Puedo llamarlo «avalúo»?** · usar en publicidad el nombre de una profesión regulada | `99 §105` + `42-LEGAL §9` (Ley 1673/RAA) + skill `legal-colombia` |
| **Permisos del panel**: claim de staff, `isStaff()`, quién ve `/gestion`, ruleset fusionado | `99 §99` claim · `§100` ruleset único (desplegar el del portal MATABA `admin.html`) |
| **Alertas guardadas / digest diario / Resend** | `99 §96` (gate vivo: clave + dominio verificado → fase 0.2 del runbook) |
| **La ficha de inmueble** (`/inmueble/<slug>`, slug, gate de publicación, Open Graph) | `99 §97` + `§111` (el slug se CONGELA al crear) |
| **Auditoría del cerebro**: qué falla, qué gate quitar, por qué un ✅ puede no valer | `99 §109` (la clase del *✅ inmerecido*) + tabla en la bóveda |
| **Vencimientos, renovaciones, mora, pagos del canon** · «¿qué vence esta semana?» | `99 §112` (agenda pura, `hoy` inyectado) + `domain/gestion.ts` el modelo |
| **Registrar un contrato** · depósito/garantía · «¿puedo pedir un mes de depósito?» | `99 §113` (callable `crearContrato`; en VIVIENDA el depósito está PROHIBIDO, art. 16 Ley 820) |
| **Cobrar el canon, honorarios, IVA, giro al propietario** · «¿cuánto le toca al dueño?» | `99 §115` (`cifrasDePago`: el IVA va sobre los honorarios, la administración no es del propietario) |
| **Una tabla/lista sale despintada, sin rejilla ni tarjeta** · «el CSS no aplica y no falla nada» | `99 §117` (Astro acota con `data-astro-cid`; los nodos de runtime no lo llevan → `npm run verify:css`) |
| **PQRS, tickets del inquilino, plazo de 48h** · «¿qué se me está pasando?» | `99 §118` (`estadoDeSla` vive con la mora en `agenda.ts`; no se cierra sin escribir qué se hizo) |
| **Exportar a CSV/Excel** · «se abre con las columnas corridas» · «¿esto es seguro?» | `99 §119` (RFC 4180 + BOM + anti-fórmula CWE-1236: `src/lib/domain/csv.ts`) |
| **Reseñas / testimonios / rating en el sitio** · «es solo la maqueta» · ¿cómo se guarda una calificación que no se pueda inventar? | `99 §122` (fabricarlos es Ley 1480; secciones dependientes de datos, no borradas) + **`§281`** (agregado server-only, mínimo de reseñas, nunca promedio sin recuento) |
| **«En local pasa y en CI falla»** · el sitio vivo contradice al repo | `99 §125` ([[L-48]]: un prerrequisito GENERADO y gitignored; que lo genere el propio script) |
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
| §01-§20 | 🗄️ **Era del sitio viejo (RETIRADO) + arranque del cerebro** → shard `docs/00a-INDICE-HISTORICO.md`. | → `00a` |
| §21-§60 | 🏗️ **Era de CONSTRUCCIÓN del greenfield** (scaffold, modelo de datos, design system, las superficies del portal, mapa y catálogo) → shard `docs/00b-INDICE-CONSTRUCCION.md`. | → `00b` |
| §66-§90 | 🏛️ **Era de FUNDACIÓN** (kit societario de 24 docs, gates legales, operación real del dueño, auditorías del cerebro y el cierre de OLA 1) → shard `docs/00c-INDICE-FUNDACION.md`. | → `00c` |
| §91-§120 | 🏗️ **Era de CONSTRUCCIÓN DEL PORTAL** (SERP, ficha, alertas, precios, ruleset fusionado, leads, R2 y el runbook del cutover) → shard `docs/00d-INDICE-PORTAL.md`. | → `00d` |
| §121-§160 | 🔐 **Era de ACCESO Y CUTOVER** (recuperación de clave, 2FA de punta a punta, las 5 puertas de escritura, la bóveda, lo que nunca se desplegó, el mapa de 301) → shard `docs/00e-INDICE-ACCESO.md`. | → `00e` |
| §161-§200 | 🔬 **Era de la VERDAD MEDIDA** (los gates que pasaban en verde sin mirar, los gemelos invisibles, el censo de Functions, el dictamen del recaudo y el rail de pago) → shard `docs/00f-INDICE-VERDAD.md`. | → `00f` |
| §201-§240 | 🧮 **Era del CENSO** (los oyentes, los identificadores, los 30 pasos del cutover, las hermanas — y el ✅ que no prueba que se mirara) → shard `docs/00g-INDICE-CENSO.md`. |
| §241-§280 | 🔍 **Era del BARRIDO DEL PRODUCTO** (lo que la pantalla afirmaba y el sistema no tenía: obra nueva, panel y papeles inventados; y los gates puestos que no gateaban) → shard `docs/00h-INDICE-PRODUCTO.md`. | → `00h` |
| §281 | ⭐ **La calificación, diseñada para que NO SE PUEDA inventar**: agregado server-only (las Rules lo niegan al staff), nunca promedio sin recuento, y sin mínimo de reseñas no hay nota. | 12844 |
| §282 | 🚧 **Bloqueado NO es protegido**: el gate del RNT frena /estancias por una razón que no es «la casa no existe». + el menú servía un penthouse fantasma en 45 páginas. ⚠️ Y escalé antes de leer la pantalla entera. | 12891 |
| §283 | 🧮 **Iba a desplegar a producción por una frase del cerebro sin comprobar** — ya estaba desplegada. Y el TOTAL cuadraba: dos errores que se compensan dejan una suma exacta y una lista falsa. | 12940 |
| §284 | 🏗️ **OBRA NUEVA — el modelo**: el bloqueo era un campo mal planteado (el precio se DERIVA de las tipologías, no se teclea) + un proyecto existe si tiene LICENCIA DE CONSTRUCCIÓN. | 12977 |
| §285 | 🔖 **JSON-LD del proyecto: un Offer por tipología** (patrón de La Haus, del crudo de la bóveda). ⛔ NO se usa `AggregateOffer` — su definición es «un producto, varios vendedores» y la nuestra es al revés. | 13032 |
| §286 | 🧾 **La licencia también en las RULES** — el dominio solo corre en la app; quien escriba por otro camino se lo salta. Gate en create Y update. ⛔ Y la ficha para: falta MOCKUP. | 13076 |
| §287 | 🔬 **Auditoría #18: el cerebro está LLENO** — 8 neuronas al 100 % y la válvula `33`→`37` bloqueada también. La medición del GC comparaba LF contra CRLF e inventó +140c; y juzgué mal a N17-04, que §269 ya arregló. | 13115 |
| §288 | 🚦 **El predicado que decide si un gate CORRE es parte del gate** — el escáner de secretos saltaba 55/100 commits. Reverso: el gate que miente en ROJO; su único arreglo obediente que compilaba rompía producción. | 13200 |
| §289 | 🧱 **La vía de ESCRITURA estaba cerrada** — 33/37/38 llenos por ejes DISTINTOS. Nacen `33a` (la lección que no dispara) y `38a` (el armado del gate); entran M-34, M-35 y L-70..L-72. | 13336 |
| §290 | 🧮 **Kernel v1.27 · el instrumento medía media casa** — el #10 filtraba `^\d{2}-` y no auditaba 9 nodos con sufijo; el candado daba 31485 de un boot REAL de 43030c. Nace `bootRealTarget`. Y el kit nacía sin escáner de secretos. | 13466 |
| §291 | 🚩 **El instrumento que mintió 44 días en SILENCIO** — el PreCompact emitía un JSON que el esquema rechaza en la raíz: 0/15 entregas. La orden se muda a SessionStart y nace el TOKEN que solo mata un commit a `10`/`99`. | 13608 |
| §292 | 🎭 **Kernel v1.29 · un `\b` casaba DETRÁS de los dos puntos** — `[[CARS:L-01]]` se leía `L-01` y resolvía contra OTRA lección EN VERDE (y `BERS:L-84` daba colgante falso). Lookbehind en #5b y #5c. Prerequisito del lote 1 de F2. | 13781 |
| §293 | 🧠 **Nace el CEREBRO MAESTRO con sus 6 primeras lecciones** (F2 lote 1, INMO): esqueleto + linter propio con 3 cerraduras + cuarentena con stub. `35` liberó 2987c. SELLADO. | 13918 |
| §294 | 🧠 **Lote 4: 20 lecciones de INMO al maestro** — `31` baja del 100 % de su cap al 49 % y `36` al 68 % (−21 776c en 4 nodos). Estrena **D1-bis** (prefijo AMBIENTAL en `migradas/`). D7-ter NO dispara: medido. | 14034 |
| §295 | 🧠 **Lote 5: 20 lecciones más al maestro** — `39` cae del 96 % al 48 % y `38` deja de rozar su tope (−21 755c en 5 nodos). El índice del maestro se PARTE en `firebase` + `nube-despliegue`; nace el shard `00h`. | 14150 |
| §296 | 🧠 **Lote 13: se abre la cola de INMO y la de bersaglio llega a CERO** — `L-52` (del `38`) y `L-53` (del `35`) mudan su cuerpo a la bóveda. Censo **2/2** ×3 vías; `38` −5,4 %, `35` −10,9 %. Estrena el 2º destino del #6b. Quedan **44**. | 14257 |
| §297 | 🧠 **Lote 14: veinte de INMO y el pre-paso de los 49 punteros** — todas tenían el cuerpo en hoja hija: −25 695c en 7 nodos y `38a` SALE de pre-shard (98 %→27 %). Nace el tema `gate-desarmado` en el maestro. Quedan **24**. | 14335 |
| §298 | 🧠 **Lote 15: las veinte META de INMO** (`M-01`..`M-11` · `M-23`..`M-31`) — `37` −61,6 % y **SALE de pre-shard**, `33a` sin un cuerpo vivo; −18 701c en 4 nodos. Once entraron como 2º destino del índice, no como fila nueva. Quedan **4**. | 14447 |
| §299 | 🧠 **Lote 16: las CUATRO últimas de INMO** (`M-32`..`M-35`) y la **cola del programa en CERO** — `33` y `37` quedan sin un solo cuerpo vivo (−5104c en tres nodos). En el maestro nace el 23º tema, `donde-archivarlo`. | 14570 |

---

## 🗺️ Mapa de neuronas (registro)

> ⚠️ El 27-ago este censo AFIRMÓ estar completo (N16-09) con las OCHO aún fuera: **el aviso era el trabajo** (`39` aplicado al propio registro; §289.7). Entraron de verdad el 31-ago. Un nodo que el registro no nombra existe pero **nadie lo alcanza**.

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` (+ hijas `21-MAPA-PORTAL` · `22-MAPA-GESTION`) ·
`30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` · `33-LECCIONES-META` ·
`33a-LECCION-QUE-NO-DISPARA` · `34-DOCTRINA-CODIGO` · `35-LECCIONES-PLATAFORMA` · `36-LECCIONES-UTILLAJE` ·
`37-META-FUNDACIONALES` · `38-GATES-QUE-MIENTEN` · `38a-ARMADO-DEL-GATE` · `39-ESCRITO-NO-ES-VIGENTE`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` (+ hijas `44-DICTAMENES` ·
`45-COSTOS-TRANSACCION`) · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
