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
| **Reseñas / testimonios / rating en el sitio** · «es solo la maqueta» | `99 §122` (fabricarlos es Ley 1480; secciones dependientes de datos, no borradas) |
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
| §01-§20 | 🗄️ **Era del sitio viejo (RETIRADO) + arranque del cerebro** — 20 filas movidas al shard `docs/00a-INDICE-HISTORICO.md` (§85). El kernel lee ambos índices como UNO. | → `00a` |
| §21-§60 | 🏗️ **Era de CONSTRUCCIÓN del greenfield** (scaffold, modelo de datos, design system, las superficies del portal, mapa y catálogo) — 40 filas movidas al shard `docs/00b-INDICE-CONSTRUCCION.md` (§100). El kernel lee los tres índices como UNO. | → `00b` |
| §66-§90 | 🏛️ **Era de FUNDACIÓN** (kit societario de 24 docs, gates legales, operación real del dueño, auditorías del cerebro y el cierre de OLA 1) — 25 filas movidas al shard `docs/00c-INDICE-FUNDACION.md` (§116). | → `00c` |
| §91-§120 | 🏗️ **Era de CONSTRUCCIÓN DEL PORTAL** (SERP, ficha, alertas, precios, ruleset fusionado, leads, R2 y el runbook del cutover) — 30 filas movidas al shard `docs/00d-INDICE-PORTAL.md` (§156). | → `00d` |
| §121-§160 | 🔐 **Era de ACCESO Y CUTOVER** (recuperación de clave, 2FA de punta a punta, las 5 puertas de escritura, la bóveda, los índices y el codebase que nunca se desplegaron, el mapa de 301 y los gates que miraban a otro lado) — 40 filas movidas al shard `docs/00e-INDICE-ACCESO.md` (§196). | → `00e` |
| §161-§200 | 🔬 **Era de la VERDAD MEDIDA** (los gates que pasaban en verde sin mirar, los gemelos invisibles, el censo de Functions, el dictamen del recaudo y el rail de pago) — 40 filas movidas al shard `docs/00f-INDICE-VERDAD.md` (§229). | → `00f` |
| §201-§240 | 🧮 **Era del CENSO** (los oyentes, los identificadores, los 30 pasos del cutover, las hermanas — y el ✅ que no prueba que se mirara) — 40 filas movidas al shard `docs/00g-INDICE-CENSO.md`. |
| §241 | 🧭 **Lo que decide qué ve el dueño arriba no tenía prueba** (dos `urgencia()` puras, 13 tests) · y **«el móvil personal JAMÁS se publica» no tenía mecanismo**: censo de 45 páginas (cero fugas) y gate que lee el permitido de `site.ts`. | 10518 |
| §242 | 🚧 **El styleguide de desarrollo iba a servirse en el dominio del cliente**: la promesa de excluirlo vivía en la cabecera del propio fichero. Ahora redirige (28,5 KB→284 b) + sonda. Salió de cuadrar 45 páginas con 39 del sitemap. | 10567 |
| §243 | 🔗 **Comprobar anclas no es comprobar rutas**: gate nuevo de enlaces internos (0 rotos de 184 destinos, SSR derivadas de `prerender=false`). Y contar valió más que el gate: **38 enlaces a `/ficha`**. | 10610 |
| §244 | 🩺 **Cuatro comprobaciones en vivo, cero defectos** (`/ficha` y `/alertas` 200 · zstd: portada 19,6 KB · estado cero en las 11 pantallas) → y la poda que salieron: **lo que ya bloquea un gate no se afirma en un nodo always-on**. | 10650 |
| §245 | 🧑‍🤝‍🧑 **Hermanos**: Cars e INSEMA tenían el gate de fiabilidad DEGRADADO (0 marcadores = no comparaba nada) → sellados contra sus sitios vivos. Y Cars ordenaba un protocolo de modelo **derogado** y un `sync` inexistente. | 10691 |
| §246 | 💎 **Bersaglio: el shard que NO hice** — agrupar por regex dio un cajón de sastre, no un tema. B-04 pasa de frase a medición (líneas ya arregladas). Y **medir con el instrumento equivocado no es medir**. | 10740 |
| §247 | 🏷️ **La portada tenía CUATRO `<h1>` visibles** (cuatro banners apilados, no un carrusel) → 1 h1 + 3 h2, invisible porque el CSS va por clase. Gate sobre las páginas del **sitemap**: `/gestion` e `/ingresar` NO eran defectos. | 10781 |
| §248 | ♿ **303 imágenes y 122 campos sin un fallo** — y 28 falsos positivos que eran de mi sonda (plantillas, `<label>` que envuelve, input oculto). Nace la **prueba NEGATIVA** de toda exclusión. | 10825 |
| §249 | 📲 **La vista previa al compartir** (los clientes llegan por WhatsApp): etiquetas completas en las 45, pero **4 imágenes VERTICALES** en 6 artículos del journal. Congeladas + gate; el cambio es decisión del dueño. | 10858 |
| §250 | 🚨 **El móvil PERSONAL estaba publicado en el dominio** (JSON-LD del legacy) mientras mi gate decía «cero fugas»: su denominador excluía el sitio del problema. Lo halló la sonda adversarial de la 1.ª auditoría COMPLETA. | 10898 |
| §251 | 🙈 **Cruzar el 100 % te volvía INVISIBLE** en la alarma de saturación: un nodo al 95 % salía y uno al 105 % no. Kernel v1.21.0 ×4. + mi instrumento medía sin el CRLF que el gate sí cuenta. | 10959 |
| §252 | 🪞 **Tres nodos contradecían su propia re-medición**: el manifest ordenaba un callejón refutado, `TODO-50` tenía dos prohibiciones (una falsa) y cero puertas, y §237 quedó desmentido. | 10994 |
| §253 | 🧬 **El auditor existía en TRES versiones**: tres cerebros auditaban sin las dos lecciones nacidas de auditar. Propagado + gate 6b, que compara CONTENIDO (el 6a solo miraba nombres). | 11039 |
| §254 | ⚖️ **212 KB de derecho propio sin respaldo ni ruta** → bóveda privada + ruta desde `42`. Y el acantilado de los 135 SMLMV **verificado contra el Decreto 0159/2026**. + un hallazgo RETIRADO. | 11073 |
| §255 | 🧭 **El índice no enrutaba, se escaneaba**: 4 de 5 preguntas frías sin fila, 8 nodos sin registrar · «sitio viejo RETIRADO» era media verdad · corregií una instrucción FALSA mía | 11115 |
| §256 | 🎭 **Re-verifiqué los 13 abiertos: TRES nunca fueron ciertos** ([[M-33]]) · orden RUB falsa en la guía del dueño · frescura ciega a los lóbulos (2→6) · constante muerta ([[L-67]]) | 11153 |
| §257 | 💰 **Tres formatos de precio; el del dueño incumplía el mockup** por un espacio INVISIBLE (48 precios, 5 mockups) · puerta única · 10 pruebas + gate probado en NEGATIVO | 11206 |
| §258 | 🛡️ **El catálogo de gates ya tiene dueño, y APUNTA en vez de copiar** (10, contados y probados en negativo) · las reglas git del router son de ESTE repo · auditoría #16: 22 cerrados, 6 retirados, 4 abiertos. | 11241 |
| §259 | 🔁 **Un 301 puede aterrizar en un 404 y el gate seguía verde**: cubría que la URL vieja tuviera regla, no que la regla llevara a algo · volví a parsear donde debía ejecutar (53 vs 65) · la sonda se vigila a sí misma. | 11270 |
| §260 | 📏 **Corrí el gate en producción de verdad: de 23 fallan DOS, y ninguna es código** (catálogo demo + RNT) · el 5.4 comprobaba tras el punto de no retorno lo que el 5.2 ya sabe · 44 páginas, 6 `noindex` y las 6 internas. | 11329 |
| §261 | 🛡️ **Un gate número 11, y su única aplicación era `.git/config`** (que no se clona): el del panel LEGACY, sin tests ni tipos · cableado al CI y probado en negativo · son DOS catálogos, y ahora lo dice. | 11364 |
| §262 | 🚨 **«Nunca commitear secrets» era doctrina SIN mecanismo**, y su único escáner llevaba roto en Windows sin que nadie lo invocara · gate de 10 patrones sobre 903 ficheros, 2 negativas · el validador viejo, a cuarentena. | 11396 |

---

## 🗺️ Mapa de neuronas (registro)

> ⚠️ **Completado el 27-ago (N16-09)**: faltaban OCHO — `21-MAPA-PORTAL` · `22-MAPA-GESTION` · `35-LECCIONES-PLATAFORMA` · `36-LECCIONES-UTILLAJE` · `37-META-FUNDACIONALES` · `38-GATES-QUE-MIENTEN` · `44-DICTAMENES` · `45-COSTOS-TRANSACCION`. Un nodo que el registro no nombra existe pero **nadie lo alcanza**.

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
