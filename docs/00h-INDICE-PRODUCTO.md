# 🗂️ 00h — ÍNDICE DEL BARRIDO DEL PRODUCTO (§241-§280 · lo que la pantalla AFIRMABA)

> **Octavo shard de rango de `00-INDICE`** (ADR §295). El kernel descubre las hermanas por PATRÓN
> (`00[a-z]?-INDICE*.md`) y trata a las nueve como UN índice: los chequeos #3 (desync), #5a (ADRs
> indexados) y #9 (consolidado) leen todas. Mover filas aquí **no** las saca del cerebro.
>
> **Por qué ESTAS**: es el tramo en que el producto se miró con los ojos del cliente que va a firmar,
> y casi todo sale de la MISMA avería — **la pantalla afirmaba algo que el sistema no tenía**: seis
> proyectos de obra nueva inventados con dirección, seis clientes falsos en el panel, cifras propias
> en `/publicar`, un «1000 %» y un NIT inventado en papeles que firma el cliente, y el móvil PERSONAL
> del dueño publicado en el dominio. El hilo gemelo es el mismo error visto desde el otro lado: los
> **gates que estaban puestos y no gateaban** — un 301 que aterriza en 404, un candado cuya única
> aplicación vivía en `.git/config`, el escáner de secretos saltándose 55 de 100 commits.

---

| § | Qué decidió / qué destapó | Línea en `99` |
|---|---|---|
| §241 | 🧭 **Lo que decide qué ve el dueño arriba no tenía prueba** (2 `urgencia()` puras, 13 tests) · y **«el móvil personal JAMÁS se publica» no tenía mecanismo**: censo de 45 páginas (0 fugas) + gate que lee el permitido de `site.ts`. | 10518 |
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
| §263 | 💰 **Barrido del PRODUCTO: 12 fallos, la mitad en papeles que firma el cliente** — «1000 %», NIT inventado, certificado descuadrado, contratos mezclados · el panel afirmaba una terminación que la ley no da · 5 suites fijaban el error. | 11437 |
| §264 | 📱 **Segunda tanda del barrido: seis cosas que la pantalla AFIRMABA** — tablero con un negocio inventado · «Ordenar por» que no ordenaba · tabla que perdía una columna · sin «Ingresar» en móvil · zoom de iOS. | 11532 |
| §265 | 🚪 **La puerta de entrada hablaba un vocabulario que el sistema no tiene** — el hero mandaba zona/tipo y nadie los leía · ofrecía «Penthouse», que el dominio no puede guardar · 20 enlaces del menú, 2 destinos. | 11644 |
| §266 | 🪪 **El panel: quién eres, qué cifras enseña y el día uno** — saludaba a una persona inventada y las pestañas borraban tu identidad · quedaban $186M y $1.400M en los roles ocultos · con la base vacía medio panel estaba muerto. | 11755 |
| §267 | ⚖️ **El Journal afirmaba de más** — la ley que reparte el impuesto NO reparte la estampilla · prometía un cálculo de IPC inexistente, y la agenda anclaba en la firma · la llamada del propietario en los artículos de inquilinos. | 11851 |
| §268 | 🔬 **Auditoría #17 (parcial): el paso que calla al gate y el que deja rastro no son el mismo** — la #16 puso los 2 campos que apagan el nudge y no los 2 que la sonda 0 necesita. | 11925 |
| §269 | 🧱 **TODO-50: `30` estaba llena de CUERPOS, no de lecciones** — 16 entradas se llevaban 103 de 240 líneas · shard `39` (verbatim) la deja en 193 · pero «lleno» eran DOS problemas y el boot sigue. | 11991 |
| §270 | 🚨 **La portada publicaba SEIS proyectos de obra nueva inventados** —con dirección y «Preventa»— y el gate no los veía porque busca CIFRAS · «Penthouse» no es tipo en ningún líder · una sola lista pública. | 12161 |
| §271 | 🏝️ **«Penthouse» se DERIVA (piso === pisosTotales), no se declara** — una etiqueta que pone el interesado no la sella nadie · +cabaña +parqueadero (≥2 líderes + real en Cartagena) · el tipo cazó una TERCERA tabla de etiquetas. | 12274 |
| §272 | 🔏 **DOS sellos de fecha en `05`** (`verificado-vivo:` vs `(al …)`) y re-sellé el que no lee el aviso — el aviso siguió encendido y lo leí como recordatorio nuevo. Kernel v1.26.0: ahora CITA el sello. | 12337 |
| §273 | 🎛️ **Los 4 chips de filtro del SERP se encendían y NO filtraban** — ahora son campos del `<form get>`. La caja traía la CIUDAD y vaciaba todo resultado. Un fixture con valores IGUALES no puede suspender. | 12399 |
| §274 | 📏 **El header tapaba 90% de la barra de filtros — justo al SUBIR a cambiar uno.** Publica su altura MEDIDA en `--alt-hdr-h` (el token decía 116, la realidad 67). ⚠️ Y [[L-26]]+[[L-28]] las re-derivé sin leerlas. | 12465 |
| §275 | 👥 **El panel SERVÍA 6 clientes inventados, 4 actividades falsas y «92% de demanda»** — §266 arregló el runtime y no el build. Ahora se calculan de los leads ya cargados; gate `persona-de-mockup` con prueba negativa. | 12525 |
| §276 | 🏚️ **Un build de producción habría publicado ~25 inmuebles inventados en la PORTADA** — el candado #7 existía para eso y vigilaba una VARIABLE que esas 6 secciones no leen. Ahora cuelgan de ella. | 12591 |
| §277 | 🔌 **La portada, cableada al catálogo** (destacadas + arriendo, 3 estados verificados). 🎯 Y un gate puede tener razón POR DEBAJO de su mensaje: se quejó de un id y el problema era el ACOPLAMIENTO. | 12658 |
| §278 | 🧾 **«Sale en el cutover» no es un motivo, es una promesa** — 3 conteos de inventario declarados como deuda y esperando que alguien se acordara. Ahora salen solos. Y una deuda RETIRADA que el gate demostró. | 12713 |
| §279 | 🧩 **Las 5 secciones de la portada, del catálogo real** — lo que el índice no guarda NO se inventa, se quita. Y a un gate con falso positivo se le ENSEÑA A VER, no se le declara excepción (con prueba negativa). | 12754 |
| §280 | 🧾 **Tres cifras inventadas en `/publicar`**, donde un propietario decide confiarte su inmueble. Sustituidas por credenciales verificables (matrícula, 3% al registro, $0 Ley 820) — DERIVADAS, no tecleadas. | 12810 |
