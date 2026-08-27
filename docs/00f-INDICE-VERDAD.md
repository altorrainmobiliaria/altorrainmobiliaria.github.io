# 🗂️ 00f — ÍNDICE DE LA VERDAD MEDIDA (§161-§200 · cuando el cerebro se auditó a sí mismo)

> **Sexto shard de rango de `00-INDICE`** (ADR §229). El kernel descubre las hermanas por PATRÓN
> (`00[a-z]?-INDICE*.md`) y trata a las siete como UN índice: los chequeos #3 (desync), #5a (ADRs
> indexados) y #9 (consolidado) leen todas. Mover filas aquí **no** las saca del cerebro.
>
> **Por qué ESTAS**: es el tramo en que dejó de bastar con que algo estuviera hecho y empezó a
> exigirse que estuviera MEDIDO. Aquí caen los ocho gates cableados después de encontrarlos verdes
> sin mirar nada, los gemelos que ningún compilador podía ver, el censo de Cloud Functions que
> contradecía al `05`, el dictamen del recaudo, el preaviso que no puede ser digital, el rail de pago
> probado contra el emulador, y la primera vez que un pendiente del ledger se auditó una por una y
> resultó que solo un tercio describía la realidad.
> Historia CERRADA: se consulta, no se edita — las filas nuevas van al `00` vivo.

| § | Qué decidió / qué enseñó | Línea en `99` |
|---|---|---|
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
