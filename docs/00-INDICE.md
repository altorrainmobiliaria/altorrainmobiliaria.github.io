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
| §65 | **TODO-34 F4-w2 ✅: MANUAL MAESTRO (10 caps) + mercado → sistema documental 00-23 COMPLETO**. Tarifas comerciales adoptadas-vetables con costumbre certificada · FE gratuita DIAN soporta mandato nativo · prompt consejo externo del manual listo. | 1006 |
| §161 | 🍞 **Migas de pan: 8 copias del mismo bloque y 10 páginas públicas sin ninguna** (las 4 legales incluidas). Helper puro + prop `miga` en `BaseLayout`. Migración con FOTO PREVIA: 23 idénticas byte a byte, 0 cambiadas. | 6147 |
| §162 | 🗺️ **`/nosotros` no estaba en el sitemap** — y el archivo había PREDICHO ese olvido en su propio comentario. Regla nueva: o `noindex`, o anunciada, en los dos sentidos. La sonda mira el FUENTE, y ahí está el porqué. | 6189 |
| §163 | 🏚️ **El cutover podía publicar 38 enlaces a un inmueble que NO EXISTE**. El interruptor estaba cableado; faltaba quien hiciera ruido al olvidarlo. Gemelo del candado de indexabilidad: los dos se ven perfectos. | 6238 |
| §164 | 🔬 **Auditoría Nivel-2 #11** (disparada por el linter, que BLOQUEÓ un commit). La receta del boot crónico llevaba 2 ediciones MAL APUNTADA: el router es el 59% y su cap no disparaba nunca. Cap 25k→19k. | 6280 |
| §165 | ⚖️ **El «gate del abogado» no existía** (Daniel: «mi abogado eres tú»). Dictamen propio: el recaudo de cánones NO es captación masiva (`D.1068/2015 art. 2.18.2.1`), con 3 condiciones de diseño vinculantes. | 6339 |
| §166 | 💵 **La liquidación del mandato**: `payout_propietario` existía como tipo y nadie calculaba su monto. La retefuente del 3,5% NO es constante (depende de quién paga). Invariante: entra = sale, probado con 112 combinaciones. | 6404 |
| §167 | 🧾 **La liquidación como COMPROBANTE**, no calculadora: cada línea dice a quién va el peso, y el cuadre se ve. Y `verify:css` no veía NI UNA clase del módulo — la buena práctica (cero `innerHTML`) lo dejaba ciego. | 6451 |
| §168 | 📄 **Certificación al propietario** (3.ª formalidad del mandato). El kit daba por hecho un «bajo la gravedad del juramento» que NO aparece en la norma: no se escribe lo que no se ha leído. El ingreso es el CANON, no lo cobrado. | 6505 |
| §169 | 🪝 **El webhook de Wompi**, la pieza de más riesgo del carril: no da errores, da cobros dobles. Tres trampas conocidas + una CUARTA propia (validar la firma ANTES que la idempotencia, o se puede tumbar un cobro ajeno). | 6551 |
| §170 | 🔐 **La máquina del mandato**: liberar es una DECISIÓN (retracto de 5 días hábiles, art. 47) y no el efecto de un `APPROVED`. Y «reversado» puede esconder una deuda: prohibir la transición no evita el contracargo, evita VERLO. | 6604 |
| §171 | 🛡️ **La garantía de arriendo**, el último gate «sin investigar»: solo como AGENCIA del asegurador, con su carta de autorización previa (Ley 510/99 art. 101). Corredor no se puede ser; garantía propia, jamás. | 6652 |
| §172 | ⏰ **La Ley 2300 SÍ aplica** a la prospección comercial, no solo a la cobranza — y DOS programadas escribían fuera de ventana (una a la 1 de la madrugada). Nace el calendario de festivos, calculado y no copiado. | 6708 |
| §173 | 🪧 **Una regla escrita da la sensación de estar APLICADA** (M-25, 4× en un día). El panel decía «Tu avalúo» con la prohibición en CUATRO sitios. Sonda nueva + shard de `33` → `37`, que ya iba por la tercera recomendación. | 6773 |
| §174 | 🏠 **El reglamento de PH que CALLA no autoriza** (D.1074 · L.675 18.1): gate de 3 estados. Y **855 pruebas que el CI no corría**. Nace [[M-26]]. ⚠️ §174.3 tenía un dato FALSO → §175. | 6822 |
| §175 | 🎭 **El gate que PREGUNTA en vez de fallar**: `astro check` sin `@astrojs/check` sale **exit 0**. Un día de «Tipos ✅» sin mirar nada, y el CI **nunca estuvo rojo**. Nace [[L-57]]. | 6930 |
| §176 | 💸 **Webhook de Wompi**: mapea a TRANSICIÓN, no a estado — un evento tardío pisaría un mandato ya girado. `anotar`+500 nunca juntos. Enum duplicado → `Exclude`. Y las 9 Functions sin gate de tipos. | 6987 |
| §177 | 🧪 **141 pruebas fuera de todo gate**, y la línea base ROJA por mi §174. «Necesitan Java» había caducado: 24 s. `test:rules` al CI. `firebase-tools` sin declarar = 3ª vez. + atomicidad del webhook. | 7060 |
| §178 | 👯 **Barrido de GEMELOS** (mismo nombre exportado desde 2 módulos): dos `IVA`, tres `COP_FMT`, dos `etiquetaTipo` (singular vs plural). Gate `verify:simbolos` con deuda congelada. | 7114 |
| §179 | 🪞 **Los «espeja las Rules» que nadie comprobaba** — y una prueba con ese nombre que no abría el `.rules`. Cuadran; faltaba el mecanismo. Sonda en `verify:data`, falla si no puede LEER. | 7175 |
| §180 | ✂️ **Poda del arranque**, y debajo 3 hechos rancios: `50` decía 7 CF desplegadas vs 13 · copia atrasada del cutover · «68 URLs», la aritmética que escondió un 404. Un gate me cazó a mí. | 7224 |
| §181 | ⚖️ **La divergencia de tasas no lo era**: doc 03 es mandato COMERCIAL (1,5×IBC) y doc 04 vivienda CIVIL (6%). Pelota (7) cerrada. Antes de escalar: ¿falta una ELECCIÓN (suya) o una CALIFICACIÓN (mía)? | 7277 |
| §182 | 🔬 **Auditoría Nivel-2 #12**: 18 ADRs, y casi todos la misma frase — algo cuyo NOMBRE prometía una comprobación que no ocurría. Gates a medias ×5. 3 abiertos, declarados. | 7326 |
| §183 | ⚖️ **La 1480 y el arriendo: SUPLETORIA**, no sí/no — art. 2 literal: si hay régimen especial (Ley 820) manda ése. NO se publica página de retracto para arriendo. No cierra la de RESERVAS. | 7383 |
| §184 | ⚖️ **Taxatividad de causales**: la Ley 820 NO dice «solamente» ni tiene irrenunciabilidad — el texto no cierra. Aun así no se amplía, por costes asimétricos. Nace [[LD-09]]. | 7430 |
| §185 | 📮 **El preaviso NO puede ser digital**: la Ley 820 pide escrito **Y** servicio postal; la 527 equivale el escrito, no el CANAL. El producto no lo ENVÍA, lo INSTRUMENTA (evidencia del envío). | 7482 |
| §186 | 🌿 **Shard de 42-LEGAL → 44-DICTAMENES**: se parte por lo que CRECE, no por lo que pesa. 19998→13776. Y L-46 por 6a vez, ahora con su gravedad real: backticks = EJECUCION. | 7537 |
| §187 | 📮 **Un preaviso sin evidencia postal no es un preaviso**: modulo nuevo, manda la fecha de IMPOSICION. Gemelo del «3 meses» cazado ANTES de nacer: la alerta DERIVA del plazo legal. | 7585 |
| §188 | 📬 **Aviso de leads a Resend** — mata la dependencia del Gmail roto y FUNDE dos pelotas del dueno en una. Sin guardia de Ley 2300 a proposito: va a ALTORRA, no a un consumidor. | 7633 |
| §189 | 📊 **El puntaje media el FORMULARIO, no al lead**: +10 por un correo que nunca se pide. Dos mitades (intencion + relleno) y fuera el bonus horario, que lo hacia irreproducible. | 7691 |
| §190 | 🔓 **El apaño que escribio su propia condicion de liberacion**: §122 dejo sus 3 razones, las 3 murieron y se retiro. Mapa origen->tipo al dominio, con prueba que rompe el build si falta. | 7743 |
| §191 | 🧪 **La asimetria probada**: el puntaje se guarda SIEMPRE, la marca «avisado» solo si el correo salio. Una marca que miente CIERRA la pregunta — asi se perdieron los 16. | 7781 |
| §192 | 📨 **Nurturing revisado**: Gmail ya no bloquea (Resend), y aparece un 4o bloqueo — las plantillas enlazan al sitio retirado y «ver la propiedad» PIERDE la propiedad. No se porta tal cual. | 7820 |
| §193 | 📏 **El margen que un nodo de boot creia tener**: los caps de los 3 always-on suman mas que el presupuesto, asi que ninguno es su techo. El WIP marcaba 58 por ciento con 124c reales — error de 54x. Kernel v1.15.0 publica el tope EFECTIVO. | 7863 |
| §194 | ⚖️ **Agenda legal a CERO**: UVB 2026 = 12.110 (recomprueba SAGRILAFT) y Bolivar = 1 por ciento + 0,5-1 de estampilla, por mitades. Doctrina: si no puedes cerrar una incertidumbre, busca la COTA que la vuelve irrelevante. Nace `45`. | 7924 |
| §195 | 📰 **Mercado estrena** (costos de cerrar en Cartagena) y `verify:claims` NO abria ni un articulo: solo recogia `.astro`, y el journal es markdown. 39 -> 47 archivos, y el ✅ ya dice cuantos leyo. L-52 reincide 5 ADRs despues. | 7994 |
| §196 | ✂️ **Quinto shard** (§121-§160 → `00e`): el gate paro el commit y funciono. De paso, el router ENUMERABA los rangos de cada shard — un dato que caduca en cada particion, en el nodo que se lee siempre. Margen del arranque: 16c → 42c. | 8061 |
| §197 | 🚀 **`avisoLeadNuevo` no estaba desplegada**: la resta del 05 no daba (20-17=3, explicaba 2). «CF» era CloudFlare Y Cloud Functions en el mismo nodo. Ya vive: 18/20, cero huerfanas. | 8106 |
| §198 | 🔎 **Repo contra produccion**: indices 18=18 (el arreglo del §134 aguanta). Pero el `firestore.indexes.json` de la RAIZ no lo despliega nadie — y era el unico hogar del indice sin el cual el nurturing fallaria. 5.o bloqueo. | 8155 |
| §199 | 🔀 **Desplegue un trigger sobre una coleccion que ya tenia otro**: los dos escribian leadScore con algoritmos distintos. Retirada la legacy. Dos escritores no fallan, DISCREPAN a veces. | 8236 |
| §200 | 🔬 **Auditoria Nivel-2 #13**: 8 hallazgos, 5 cerrados. **2 los cause yo esa misma sesion** y solo salieron mirando PRODUCCION, no el cerebro. Variante nueva: el falso ROJO. Boot 31482->31301. | 8291 |
| §201 | 🧮 **L-60 hecha CENSO**: 9 oyentes, 1 colision mas: `propiedades` con DOS oyentes, la coleccion central. La alarma del router NO era (og-publish ya desarmado), pero queda una maquina inerte que cobra y registra ✅ de un no-op. | 8340 |
| §202 | 🪞 **Tres sondas de censo sin decir QUE miraron**, el mismo dia que arregle un gate por eso. Las tres dijeron «limpio» y las tres estaban mal. Un cero es indistinguible de «no mire en ningun sitio» → M-27. | 8393 |
| §203 | 📄 **Los pendientes de Daniel en SU lenguaje** (artifact): Resend primero, la ruta de 5 tramos, seis preguntas de una frase. El dato ya existia; faltaba decir el coste en su moneda. URL en la memoria del harness. | 8442 |
| §204 | 📮 **De las dos pantallas pendientes, una ya estaba HECHA**. La otra —evidencia postal— no tiene NI UN campo, y su fallo se mide en meses de renta. Una lista de pendientes envejece hacia arriba. | 8484 |
| §205 | 🧪 **K-10 CERRADO midiendo**: 76 identificadores, cero colisiones por dos claves independientes, y el gate que pedia da 9 falsos positivos sobre 0 verdaderos. Un pendiente que afirma un riesgo debe decir como se mediria. | 8542 |
| §206 | ⏳ **Un hallazgo sobre frescura que estaba el mismo caducado**: decia 90 dias y el chequeo 7; son 30 y es el 16, y nunca fue 90. Lo hereda la sonda 0 sin medir la PREMISA. Se retira, no se cierra. | 8594 |
| §207 | 🔁 **El pendiente que avisaba de colisiones ERA una colision**: dos K-10 distintos, y su cita a §152 falsa. Cuatro vueltas, cuatro pendientes que exageraban lo que falta. Un ledger envejece en esa direccion. | 8638 |
| §208 | 📏 **Los cuatro K medidos**: la pizarra del WIP esta fuera de los DOS mecanismos de frescura — dos fichas que eran un solo agujero grave. 9 pendientes medidos, solo un tercio describia la realidad. | 8687 |
| §209 | 🌱 **Sembrar el catalogo: paso imposible y herramienta equivocada**. Exigia una credencial que no debo manejar, y el unico script escribe el modelo legacy — corre con exito y el catalogo queda vacio. Sin un solo aviso. | 8731 |
| §210 | 🧮 **Censo de los 30 pasos del cutover: 5 asignados a quien no puede**. Uno se reasigna, otro se MUEVE (no estaba mal asignado sino mal colocado) y otro necesitaba su MEDIO. Un paso imposible no falla: se detiene. | 8775 |
| §211 | ⚰️ **Retire una Function y tres nodos siguieron diciendo que vive** — uno de ellos contradecia el brief de Daniel. Al retirar algo la pregunta no es «que documente» sino «quien lo menciona». | 8820 |
| §212 | 🛑 **Una orden de «no publicar» que el sitio contradecia — y la orden era la equivocada**: los numeros estaban bien puestos. Auditar el cumplimiento puede acabar corrigiendo la REGLA. | 8862 |
| §213 | ⛔ **Estancias anuncia con PRECIO y sin RNT**, y la pagina es ESTATICA: el candado del catalogo no la vacia porque el aviso enumeraba otras. Y el propio sitio explica esa regla en otra pagina. BLOQUEA el DNS. | 8930 |
| §214 | 🏠 **La HOME tambien es estatica**: anuncia precio por noche sin RNT y una cifra de CREDITO de un servicio retirado por no existir. Se quito el enlace y se dejo el numero. El candado no la obedece. | 8976 |
| §215 | 🚨 **ROI en el hero y estadisticas inventadas en /publicar** — 1.200 inmuebles, 98 por ciento satisfechos. El gate contra la prueba social fabricada pasa VERDE sobre la del propio sitio. Lo mas grave del dia. | 9031 |
| §216 | 🔀 **Censo cruzado a las hermanas**: Bersaglio LIMPIA; Cars publica `4.9 · 247 resenas` sin fuente en 65 paginas vivas y stats que su propio spec dejo «a confirmar». Mi censo midio el ARBOL, no lo publicado. | 9092 |
| §217 | ⚰️ **Retirar de PRODUCCION no es retirar**: la maquinaria SEO legacy fuera (30→28 CF) y con ella onNewSolicitud, que llevaba meses borrada de Firebase y VIVA en el archivo. La instruccion que la resucitaba estaba en su cabecera. | 9205 |
| §218 | 🔬 **Auditoría N2 #14**: 10 hallazgos, **5 reincidentes** y un solo hilo — arreglos correctos con el ALCANCE enumerado a mano (§180 arregló `50` y no `20`). Y el defecto apareció DENTRO del ADR que lo denuncia. | 9277 |
| §219 | 🧬 **Kernel v1.16.0**: los gates de frescura publican su COBERTURA (K-01+K-04 CERRADOS) — y se destapa que en INSEMA era **0/2**, inerte en un repo entero. El canario deja de acusar a la distribución: medido, no apagado. | 9329 |
| §220 | 🔗 **K-05 CERRADO** (#7c): el gate validaba las anclas que EXISTEN y nunca la que FALTA. Patrón medido en tres pasadas (`panel de` daba 90% de falsos). Deuda congelada en 8; en cars destapa **15**. | 9394 |
| §221 | 📏 **TODO-23 CERRADO**: el #27 gradúa la resolución (119 de 123 «perdonadas» eran sufijo ÚNICO — alarmaba sin informar) y el #16/#12 pasan a COMMITS: un sello de 7d llevaba **327 commits** detrás. | 9455 |
| §222 | 🚪 **Dos obligaciones legales en código que NADIE puede usar**: `preaviso` (Ley 820, prórroga de un año) y `certificacion` (D.1625) sin un solo consumidor. Lo que los mantenía vivos era su propio test. Encargo escrito. | 9512 |
| §223 | 🛡️ **`verify:huerfanos`**: mecaniza el 222 — resuelve por RUTA (no por nombre, que fallo 2 veces), publica su denominador, congela la deuda de 3 y se cablea en verify Y en el CI (L-56). | 9575 |
| §224 | 🔎 **verify:claims miraba la superficie equivocada**: en la FUENTE la cifra y su etiqueta viven en campos distintos, en el HTML estan juntas. Ahora barre las dos. 15 de 24 hallazgos eran un patron que ya gano. | 9622 |
| §225 | 🔓 **Un candado que solo existía en su comentario**: «CREAR CUENTA sigue cerrado» era falso —el botón abre, el form crea—. La Ola 2 retenía la pantalla del titular contra una dependencia ya satisfecha. | 9698 |
| §64 | **TODO-34 F4-w1 ✅: KIT FUNDACIONAL 14 docs + Word + `00-LEEME`** (10 redactores + 5 auditores → 37 fixes aplicados). Patrón redactor→auditor-adversarial→aplicador PROBADO. | 996 |
| §63 | **TODO-34 F2 ✅: verificación legal 6 frentes .gov.co + Gemini integrado**. RUB vencido→YA · CE SAGRILAFT derogada 02-jul-26 · 5 prácticas ILEGALES · canon-neto legal (4 formalidades de mandato) · §63.8 cero contratos vigentes → F4 reordenado. | 985 |
| §62 | **TODO-34 F1 ✅: triaje del corpus (143, 9 lectores) → nace `43-OPERACION`**: doble NIT · matrícula sin resolución · gerente sin mayoría · KYC→FONPRECON · tarifario inexistente. | 975 |
| §61 | ⭐ **PIVOTE DE MISIÓN: Fundación Operativa (TODO-34)** — armar la inmobiliaria con datos reales (Claude = abogado + empleados · cerebro dual). Corpus: 83 docs + operación VIVA. Plan F1-F4. | 965 |

---

## 🗺️ Mapa de neuronas (registro)

`CLAUDE.md` (router) · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` ·
`20-MEMORIA-ESPACIAL` · `30-LECCIONES` (+ hojas `31-VERIFICACION-UI` · `32-LECCIONES-DOCUMENTALES` ·
`33-LECCIONES-META` · `34-DOCTRINA-CODIGO`) ·
`00-INDICE` (este) · `60-WORKFLOWS` · `99-HISTORIAL-ADR` ·
`40-LOBULOS-DOMINIO` (+ hijos `41-MERCADO` · `42-LEGAL` · `43-OPERACION`) · `50-CONFIG-INFRA` ·
`skills-inventory`. Tooling: `scripts/brain-check.mjs` (KERNEL) +
`docs/.brain-manifest.json` (budgets) + `githooks/pre-commit` + `.claude/settings.json`. Cuarentena: `_legacy/`.
