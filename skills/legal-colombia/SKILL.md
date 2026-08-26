---
name: legal-colombia
description: "Guardrail + método para CUALQUIER tarea legal de un negocio COLOMBIANO (e-commerce, joyería, datos personales). Garantiza que todo lo legal se haga en marco jurídico de COLOMBIA, con investigación profunda en fuentes oficiales (.gov.co), NUNCA con plugins extranjeros. GATILLOS OBLIGATORIOS: redactar/revisar términos y condiciones, política de privacidad / tratamiento de datos / habeas data, aviso de privacidad, política de cookies, política de devoluciones/garantías/retracto, política de envíos, contrato, 'es legal esto', cumplimiento normativo, derecho de retracto, garantía legal, reversión de pago, datos personales, Ley 1581, Ley 1480, SIC, RUCOM, lavado de activos / SARLAFT / SAGRILAFT, UIAF, factura electrónica, IVA, DIAN, registrar base de datos / RNBD. Dispara TAMBIÉN como guardrail si se va a usar un skill/plugin legal extranjero para contenido del sitio o del negocio: DETENTE y usa este marco colombiano. NO disparar para temas legales de OTRO país explícitamente solicitados."
---

# ⚖️ Legal Colombia — guardrail + método

> **Por qué existe:** los plugins legales cargados (`legal:*`, `legalzoom:*`, etc.) están hechos
> para **EE.UU. / marco corporativo general** y **excluyen explícitamente la ley no-estadounidense**.
> Usarlos para el contenido legal de un negocio colombiano produciría texto de **jurisdicción
> equivocada** en el sitio. Esta skill garantiza que TODO lo legal se haga en **marco colombiano**.

---

## 🛑 Guardrail (lo primero, SIEMPRE)

Si estás por usar un skill/plugin legal extranjero (`legal:review-contract`, `legalzoom:*`,
`small-business:contract-review`, o cualquier herramienta cuyo marco sea US/EU/general) para
**contenido legal del sitio o del negocio colombiano** → **DETENTE**. No produce derecho colombiano.
Usa este método. (Puedes usar esos plugins solo si el usuario pide EXPLÍCITAMENTE un asunto de OTRO país.)

---

## 📚 Método (en orden)

1. **Lee el lóbulo legal del proyecto PRIMERO** si existe (su número varía por proyecto, p.ej.
   el lóbulo legal del proyecto, si existe): marco colombiano curado — Ley 1480, Ley 1581, RUCOM, SAGRILAFT, DIAN/IVA,
   páginas legales del sitio, TODOs `LEGAL-NN`. Si el proyecto no tiene lóbulo legal, ve directo al paso 2.
2. **Investigación profunda con agentes/workflow** (directiva del cliente: *siempre, con workflows y
   agentes*). Para algo sustantivo (redactar una política, decidir cumplimiento, verificar un
   umbral), despacha subagentes que verifiquen en **fuentes OFICIALES** `.gov.co`:
   funcionpublica.gov.co · secretariasenado.gov.co · **sic.gov.co** (consumidor + datos) ·
   **dian.gov.co** (tributario/factura) · **supersociedades.gov.co** + **uiaf.gov.co** (LA/FT) ·
   **anm.gov.co** (RUCOM/minerales). **Nunca** de memoria ni de plugins extranjeros. Marca lo no
   verificado como **[a verificar]**.
3. **Produce SIEMPRE en marco colombiano**, citando la norma (Ley/Decreto Nº y año) + fuente oficial.
4. **Disclaimer obligatorio** (del lóbulo legal del proyecto, si existe): esto es **orientación, NO asesoría legal**;
   antes de **publicar** texto legal o decidir cumplimiento, **validar con un abogado colombiano**.
5. **Es Decisión Fuerte** (ver la doctrina de comité del proyecto + el nodo de Consejo Externo, p.ej. `docs/15-CONSEJO-EXTERNO.md`): redactar/decidir algo
   legal sustantivo → activa **Comité ×3** + prepara **2ª opinión externa** (provider configurado, docs/15).
6. **Captura** lo nuevo en el lóbulo legal del proyecto (Reflejo de Frescura; créalo si no existe — Trigger 🔵). Tarea legal grande cerrada →
   ADR en `99` + fila en `00-INDICE`.

---

## ⚠️ Señales específicas de Colombia que un marco extranjero ignora (no las pierdas)

- **Retracto (Ley 1480 Art. 47):** 5 días hábiles; pero piezas **a la medida/personalizadas NO admiten
  retracto** — clave en joyería; advertirlo.
- **Habeas Data (Ley 1581):** **consentimiento tácito PROHIBIDO** — autorización previa, expresa, informada.
- **Habeas Data en la INTERFAZ, no solo en el papel (regla operativa, 2026-08-21):** la autorización
  solo vale si es **informada**, y eso se juzga por lo que el titular VIO, no por lo que quedó
  guardado. Tres formas de romperlo sin darse cuenta: (a) el texto legal se guarda **partido en
  fragmentos** para poder enlazar documentos, y una plantilla pinta la mitad — la frase termina en
  «conforme a su» y suena completa; (b) la casilla viene **premarcada** o el envío se acepta sin ella
  (el silencio jamás equivale a autorización, D.1377/2013 art. 7); (c) el correo periódico **no lleva
  salida**, cuando revocar debe ser tan fácil como autorizar (Ley 1581 art. 8 lit. e). **Verificación
  barata que caza (a):** compara el `textContent` renderizado contra la cadena completa que se archiva
  como prueba; si no coinciden carácter a carácter, lo que se firmó y lo que se enseñó no son lo
  mismo. Y guarda con cada aceptación la **versión del texto** más fecha, IP y user-agent: una
  autorización que no se puede probar equivale a no tenerla.
- **Palabras que nombran una PROFESIÓN REGULADA (regla operativa, 2026-08-21):** en Colombia varias
  actividades solo puede ejercerlas quien está inscrito en un registro, y **usar su nombre en la
  publicidad ya es ejercerla a ojos del regulador**, aunque por dentro sea otra cosa. El caso que más
  se repite en inmobiliaria es **«avalúo»** (Ley 1673/2013: solo avaluadores inscritos en el **RAA**);
  la misma lógica cubre «perito», «auditoría» o «asesoría jurídica» ofrecidas por quien no lo es.
  **La señal de alarma es el combo `gratis` + `nuestro`**: si lo regalas es porque no lo estás
  encargando a un profesional inscrito, y entonces lo que ofreces no es eso. **Qué hacer:** (1) di
  «valoración», «estimación» o «rango», nunca el término regulado; (2) acompáñalo del aviso de que
  **no tiene validez legal** y de a quién acudir si hace falta el documento; (3) distingue dos casos
  al auditar un sitio — el texto que describe *tu propia estimación* se corrige sin preguntar a nadie,
  mientras que el que **reclama una línea de servicio** («ofrecemos avalúos») depende de un HECHO
  (¿lo contratas a un inscrito?) que solo tiene el dueño: ahí no reescribas, pregunta. **Trampa
  frecuente:** el sitio ya tiene una página que lo hace BIEN y otra que lo hace mal — dos páginas
  ofreciendo lo mismo con nombres distintos es la firma de este defecto, y la buena te da el texto.
- **RUCOM (ANM):** comercializar oro/esmeraldas sin registro o sin certificado de origen → **decomiso**.
- **SAGRILAFT / UIAF:** la joyería es **sector de alto riesgo de lavado**; obligaciones según umbral de tamaño.
- **IVA 19%** sobre joyería terminada (no asumir exclusión del oro). **Factura electrónica DIAN** obligatoria.

---

- **El SILENCIO de un reglamento NO es un permiso (regla operativa, 2026-08-26).** Caso canónico:
  alojamiento turístico en propiedad horizontal — el reglamento debe autorizarlo **previamente y de
  manera expresa** (D.1074/2015 art. 2.2.4.1.2.2 num. 8, confirmado por el Consejo de Estado; la
  destinación de unidades privadas la manda el reglamento, Ley 675/2001 art. 18 num. 1, con sanción
  en el art. 59). *«No lo prohíbe»* y *«lo autoriza»* son cosas distintas, y la ley pide la segunda.
  **Cómo se rompe sin darse cuenta**: modelar el permiso como un **booleano**. Ausente o `false`
  mezcla «me dijeron que no» con «nadie lo preguntó», y el estado por defecto acaba siendo el
  permisivo. **Regla portable**: cuando la ley exige autorización EXPRESA, el modelo lleva **tres**
  valores —`no-aplica` · `autoriza-expreso` · `sin-autorizacion`— y el silencio se archiva en el
  tercero. *Un tipo debe obligar al estado peligroso a decir su nombre.*
- **Declarar vs. verificar: mira en cabeza de QUIÉN puso la ley el deber (regla operativa,
  2026-08-26).** Antes de exigirle documentos a un cliente, comprueba si la norma te obliga a ti a
  comprobarlos o si obliga al prestador a declararlos. En el caso PH la declaración es del prestador
  y **ninguna norma obliga a la plataforma a leerse cada reglamento**: pedir copia de todos habría
  sido inventarse un deber y frenar el inventario. Pero la declaración **se guarda con fecha**,
  porque el riesgo propio de la plataforma llega por otro lado (publicidad engañosa, Ley 1480) y
  porque una declaración sin fecha no es evidencia de nada. **Y deja el campo del documento creado
  desde el día 1** aunque hoy nadie lo mire: si el borrador de norma que ya circula convierte la
  declaración en PRUEBA, el cambio es llenar un campo y no migrar un modelo.
- **La web pública es una fuente de requisitos legales que tu propio backoffice suele incumplir
  (regla operativa, 2026-08-26).** Si una página tuya le dice al cliente «comprueba X antes de
  comprar», tu formulario de alta tiene que preguntar X. Pasó literal: `/invertir` exigía verificar
  la autorización del reglamento y el alta solo pedía el RNT. **Barrido barato**: extrae del HTML
  servido las frases en imperativo o con «debe/exige/autorice» y contrástalas una a una con los
  campos que el sistema pide de verdad. Aconsejar lo que no se comprueba es la forma más cara de
  tener razón.

## Prueba social FABRICADA en una maqueta que ya es pública (Ley 1480, arts. 29-30)

Las réplicas de mockup llegan con reseñas, ratings y anfitriones de relleno. En cuanto esa página es
alcanzable —enlazada desde un menú, indexable, compartible— dejan de ser *placeholder* y pasan a ser
**publicidad engañosa**: un testimonio con nombre y fecha afirma que una persona real dijo eso.

- **No lo cura etiquetarlo.** «Ejemplo» o «datos de muestra» se pierde en una captura de pantalla; la
  reseña no. Tampoco lo cura el `noindex`: un enlace en el menú principal ya es publicación.
- **Cúralo sin perder el diseño**: haz la sección **dependiente de datos** y pásale una lista vacía.
  Con `[]` no se pinta; el día que haya reseñas reales vuelve sola con el diseño aprobado intacto.
  Borrarla obliga a rehacer la UI —y a re-aprobar el mockup— cuando lleguen los datos.
- **Qué cuenta como fabricado**: nombres de personas, fechas, notas y conteos («4.97 · 128 reseñas»),
  sellos de verificación, años de antigüedad, tiempos de respuesta. El texto de una amenidad no; una
  cifra que se lee como medición, sí.
- **Tres clases de cifra, tres tratamientos.** Una **medición de mercado** («+7% de valorización»)
  sin fuente citable pasa a ser TU afirmación, y quien invierta por ella te la reclamará a ti. Un
  **hecho comprobable** («128 verificadas») o es verdad o es falso, y el visitante puede contarlo. Un
  **compromiso** («respondemos en 5 minutos») es verdad si lo cumples — pero etiquetarlo como
  «promedio» lo convierte en un dato que nadie mide. Reetiquétalo como promesa: obliga, y es honesto.
- **Ponle gate.** No prohíbas cifras: exige que cada una se declare con su fuente en un archivo que
  el CI lee. Una cifra que nadie quiere firmar es exactamente la que no debería estar publicada.
- **Al quitar una cifra, arregla la copia que la enmarcaba.** Un titular «Los mejor valorados» sin
  notas detrás sigue afirmando un ranking: cablear los datos y dejar el titular cambia una mentira
  por otra.
- Aplica igual a `sameAs`, a `aggregateRating` en el JSON-LD y a los logos de «confían en nosotros».
  El buscador los trata como afirmaciones, y las penaliza cuando no las respalda nada.

## Cuándo NO usar esta skill

- El usuario pide explícitamente un asunto legal de **otro país** (ahí sí los plugins extranjeros aplican).
- Pregunta trivial no-legal. (Pero ante la duda sobre legalidad/cumplimiento, dispárala.)
