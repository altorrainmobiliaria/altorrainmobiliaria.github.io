# ⚖️ BRIEFS DE ENCARGO PARA ABOGADO — ALTORRA COMPANY S.A.S. (2026-07-10)

> Materializa la **omisión O9** y el **split R1** del plan endurecido (ADR §20 / `PLAN-ENDURECIDO-FABLE-2026-07-10.md`):
> convierte "contratar abogado" en un trámite reenviable. **Dos encargos SEPARADOS**: Toque (i) valida los
> textos públicos PRE-cutover de Ola 1 (gatea el cutover); Toque (ii) es la mesa de dinero PRE-Ola 2.
> Normas verificadas contra `docs/42-LEGAL.md` + `specs/R3-LEGAL-COLOMBIA-2026-07.md` (no de memoria).
> NIT correcto 902063965-4 · matrícula AMC-OFI-0074376-2026. Daniel: reenvíalos tal cual al abogado.

---

# BRIEF ABOGADO — TOQUE (i): Validación legal pre-lanzamiento (MVP público, SIN dinero)

**Cliente:** ALTORRA COMPANY S.A.S. — NIT 902063965-4
**Contacto:** info@altorrainmobiliaria.co
**Materia:** Derecho inmobiliario · turismo (RNT) · protección de datos personales (Habeas Data) · protección al consumidor / comercio electrónico
**Naturaleza del encargo:** revisión y redacción de textos legales para el lanzamiento de un portal inmobiliario, **acotado a la fase pública sin manejo de dinero**. Existe un segundo encargo separado (mesa de dinero, "Toque ii") que NO forma parte de este.

> ⏰ **ASUNTO URGENTE E INDEPENDIENTE (requiere respuesta inmediata):** el Ministerio de Comercio, Industria y Turismo tiene abierta una **consulta pública sobre un proyecto de decreto de RNT** cuyo plazo de comentarios **cierra el 2026-07-11**. Necesitamos su criterio express sobre si conviene presentar comentarios a nombre de ALTORRA COMPANY S.A.S. (los cambios que se le atribuyen —RNT por unidad, prueba de autorización de propiedad horizontal, verificación semestral, entrega de información tributaria— solo están confirmados por prensa, sin texto oficial verificado). Esto es previo y separado del resto del encargo.

## (a) Contexto del negocio

ALTORRA COMPANY S.A.S. es una inmobiliaria con sede en Cartagena que operará un portal web propio (`altorrainmobiliaria.co`) con tres verticales: (1) **clasificados** de compra/venta y arriendo de inmuebles, (2) **alojamientos por días** (corta estancia turística) y (3) **administración de arriendos** (back-office). El dueño ya administra inmuebles desde agosto de 2025 y cuenta con **matrícula de arrendador AMC-OFI-0074376-2026** expedida en Cartagena. Esta primera fase (MVP) es **exclusivamente informativa y de contacto: NO se recauda ni se mueve dinero por el portal** (los pagos son un desarrollo posterior, objeto de otro encargo). Necesitamos su validación jurídica y la redacción de los textos legales indispensables **antes de abrir el sitio al público**, porque el portal captará datos personales desde el primer formulario y publicará avisos de arriendo y de alojamiento.

## (b) Lo que le pedimos validar y/o redactar

**1. Habeas Data — el gate más temprano del portal (bloquea todo formulario).**
Solicitamos redacción y/o validación de:
- **Política de Tratamiento de Datos Personales** conforme a la **Ley 1581/2012 art. 9** y **Decreto 1377/2013 arts. 13 y ss.** (contenido mínimo): identificación del **responsable** (ALTORRA COMPANY S.A.S., NIT 902063965-4, contacto), finalidades por tratamiento, derechos del titular, procedimientos de consulta (≤10 días hábiles) y reclamo (≤15 días hábiles), y **declaración expresa de transmisión/transferencia internacional a EE.UU.** (usamos Firebase/Google LLC como **encargado**; país con nivel adecuado según la Circular Única de la SIC, Título V, con DPA como contrato de transmisión — D.1377 art. 25).
- **Aviso de Privacidad** para **cada formulario** (**D.1377 arts. 14-15**): texto corto + enlace a la Política + **checkbox de autorización NO premarcado**, con la advertencia de que **el silencio nunca autoriza** (**D.1377 art. 8**). Conservaremos como prueba la versión del texto + timestamp.
- Definición del **rol de responsable vs. encargado** en la arquitectura (Altorra responsable; Google/Firebase encargado) y su reflejo contractual.
- Concepto sobre el **registro RNBD (Registro Nacional de Bases de Datos)**: entendemos que **hoy NO aplica** porque el D.090/2018 lo exige solo a responsables con activos > 100.000 UVT (≈ $5.237M) y estamos por debajo; necesitamos confirmación y su recomendación sobre inscripción voluntaria y sobre si el deber de reportar incidentes de seguridad a la SIC aplica a no inscritos.

**2. Términos y Condiciones del portal (por vertical), incluida la cláusula de fotos/contenido.**
Redacción de T&C que dejen claro el **rol de Altorra como intermediaria/plataforma (no parte del contrato subyacente)**, reglas de publicación, disclaimer del marketplace frente a publicadores terceros (matrícula de arrendador de terceros — **Ley 820/2003 art. 28**), notice-and-takedown para reseñas, y de forma expresa una **cláusula de licencia de uso de las fotos y contenido de propiedades** aportados por publicadores y del uso que el portal hará de ese material.

**3. Disclaimers obligatorios (textos de cumplimiento que no pueden faltar en el MVP).**
- **Estimador de precio SIEMPRE como "Rango", NUNCA como "avalúo"** (gate B13): validar el texto fijo bajo cada resultado — *"Estimación automática de referencia. No constituye un avalúo en los términos de la Ley 1673 de 2013 ni sustituye el dictamen de un avaluador inscrito en el RAA"* — más metodología visible y CTA a avaluador RAA. Base: **Ley 1673/2013 arts. 3, 9-10, 21-22** y **Ley 1480/2011 arts. 29-30**. (Si aplica, mismo criterio para el "Rentímetro" con disclaimer reforzado de NO garantía de rentabilidad.)
- **Exhibición del número de matrícula de arrendador en avisos de arriendo** (gate B4): confirmar la obligación y su alcance (footer, cada ficha de arriendo de vivienda gestionada por Altorra y **todo** material publicitario, incluida pauta en Meta/Google). Base: **Ley 820/2003 art. 31** y **D.51/2004 art. 8.3** (multas hasta 100 SMLMV — art. 34).
- **Exhibición del RNT en anuncios de alojamiento** (gate B3): validar el requisito de exhibir el número de RNT en cada ficha de alojamiento y en el sitio/publicidad de la plataforma. Base: **Ley 2068/2020 art. 38 num. 4**; **D.1836/2021**; **D.1074/2015 arts. 2.2.4.1.1.11 y 2.2.4.4.13.4-13.5**.

**4. Política de cancelación (coordinación de reservas SIN dinero de por medio).**
En el MVP la corta estancia funciona por **solicitud → confirmación, sin pago en línea**. Necesitamos una política de cancelación exhibida por anuncio conforme al **art. 38 num. 5 de la Ley 2068/2020** (deber de exhibir políticas de confirmación/cancelación), redactada para el escenario **sin recaudo** (la interacción con retracto/reversión de pagos pertenece al Toque ii y NO debe resolverse aquí, salvo que usted advierta lo contrario). También necesitamos la **página PQR** del vertical turístico (**Ley 2068 art. 38 num. 7**) y el canal general de consumidor (Ley 1480), con mención de la SIC como autoridad.

## (c) Preguntas concretas que bloquean features

1. **RNT de la PLATAFORMA (bloquea el diseño de la corta estancia).** ¿La inscripción del **portal como plataforma** en el RNT es independiente y adicional al RNT de Altorra **como prestador** de sus propios alojamientos? ¿Cuál es la categoría exacta, la cámara de comercio competente, y el NIT 902063965-4 soporta ambas inscripciones? ¿La **operación ACTUAL** de alojamientos por días del dueño **ya exige RNT hoy** y está vigente para 2026? (Base de la obligación de plataformas: **Ley 2068/2020 art. 3 num. 8 y art. 38** + **D.1836/2021 secc. 13**.)
2. **Fase "solo listado" sin intermediación de pago (decide el secuenciamiento del roadmap).** ¿El parágrafo del **art. 3 num. 8 de la Ley 2068/2020** (exclusión de plataformas sin intermediación de pago) permite que una **fase 1 de solo listado, sin pagos**, quede **fuera** de las obligaciones del art. 38? ¿En qué momento exacto (activar pagos, habilitar calendario, cobrar suscripción al anfitrión) se consolida la calificación de "plataforma" con RNT propio?
3. **PII histórica al CRM (licitud de importar contactos existentes).** El dueño ya administra inmuebles desde ago-2025 y tiene bases de contactos/clientes en Excel. ¿Cuál es la **base de autorización** que permite **importar esos datos históricos** al nuevo CRM del portal bajo la Ley 1581/2012? ¿Se requiere una **re-autorización** de esos titulares, o basta la relación contractual/comercial previa y la finalidad original? ¿Qué evidencia debemos conservar?
4. **Propiedad horizontal en alojamiento (declaración vs. verificación).** ¿Basta que el anfitrión **declare** (checkbox + timestamp) que el reglamento de PH autoriza expresamente el alojamiento turístico —**D.1074/2015 art. 2.2.4.1.2.2 num. 8**, **Ley 675/2001 art. 18 num. 1**—, o publicar una unidad en un edificio que lo prohíbe genera responsabilidad directa/solidaria del portal? ¿Es prudente exigir copia del reglamento/acta?
5. **Normativa local de Cartagena.** ¿Existen restricciones distritales (POT/uso de suelo, Centro Histórico) a la renta de corta estancia y criterios de Control Urbano para ordenar restitución de destinación, que debamos advertir a los anfitriones?
6. **Transmisión internacional en formularios.** ¿Basta con declarar EE.UU. en la Política (lista SIC de países con nivel adecuado + DPA de Google), o debe pedirse **autorización expresa de transferencia** en cada formulario?

## (d) Entregable esperado del abogado

1. **Textos legales listos para publicar** (redactados o revisados y aprobados por usted): Política de Tratamiento de Datos, modelo de Aviso de Privacidad para formularios (con checkbox no premarcado), T&C por vertical con la cláusula de fotos/contenido, textos de los tres disclaimers (estimador "Rango", matrícula, RNT), política de cancelación sin dinero, y página PQR. Cada texto **fechado y versionado**.
2. **Concepto escrito** que responda las 6 preguntas de la sección (c), con indicación clara de **qué features pueden lanzarse ya y cuáles quedan condicionados** (especialmente la decisión RNT-plataforma y la fase "solo listado").
3. **Confirmación express** sobre la consulta pública del decreto RNT (recuadro urgente arriba) antes del 2026-07-11.
4. Señalamiento expreso de cualquier texto que, a su juicio, **no deba publicarse** hasta resolver un punto pendiente.

## Nota para Daniel — decisiones que quedan en tu cancha
- **La consulta del decreto RNT cierra 07-11.** Decide con el abogado si Altorra comenta o no.
- **Contratar/instruir al abogado** y **quitar el sello "DRAFT"** de cualquier texto legal (publicar) son decisiones tuyas.
- **RNT:** confirma el/los número(s) de RNT (plataforma y prestador) y su vigencia 2026. La matrícula AMC-OFI-0074376-2026 ya está en el sistema; confirma vigencia y provee el certificado.
- **CRM histórico:** cuando el abogado defina la base de autorización, decides si importamos los Excel tal cual o con un aviso de re-autorización previo.
- Este toque **NO incluye nada de dinero**; ese engagement es el Brief (ii).

---
---

# BRIEF ABOGADO — TOQUE (ii): Mesa de dinero (pre-Ola 2 — arriendo digital + pagos)

**Cliente:** ALTORRA COMPANY S.A.S. — NIT 902063965-4
**Contacto:** info@altorrainmobiliaria.co
**Materia:** recaudo y retención de fondos / mandato / posible captación · protección al consumidor (retracto y reversión) · datos personales sensibles y centrales de riesgo · firma electrónica · facturación electrónica
**Naturaleza del encargo:** concepto jurídico y redacción contractual para la **fase de pagos** del portal (recaudo de reservas y de cánones, con dispersión a anfitriones/propietarios). Es un encargo **separado y posterior** al Toque (i); **ninguna línea de la integración de pagos se construye antes de recibir este concepto.**

## (a) Contexto del negocio

ALTORRA COMPANY S.A.S. (NIT 902063965-4, matrícula de arrendador AMC-OFI-0074376-2026 en Cartagena) planea, en una segunda ola, habilitar **pagos en línea**: (1) **recaudo de anticipos de reserva** de alojamientos de corta estancia con posterior **payout al anfitrión**, y (2) **recaudo recurrente de cánones de arrendamiento** con **dispersión al propietario** en el módulo de administración. El modelo previsto es de **mandato de recaudo**: Altorra recauda por cuenta del anfitrión/propietario en una **cuenta recaudadora separada** y solo retiene su comisión; la pasarela sería **Wompi**, usando su producto **"Pagos a Terceros"** (Wompi no ofrece split/escrow nativo). Antes de escribir una sola línea de esta integración necesitamos su concepto, porque el punto más gris del modelo es no cruzar la frontera hacia una **captación masiva de dineros** no autorizada.

## (b) Lo que le pedimos validar y/o redactar

**1. Arquitectura de recaudo y retención de fondos (gates B2/B9).**
- Validar la viabilidad del **mandato de recaudo** a cuenta de ALTORRA (rol de **mandataria de recaudo** — **C.Co. arts. 1262 y ss.**), beneficiaria únicamente de su comisión (**E.T. art. 29**; **D.1625/2016 art. 1.6.1.4.9**), con **cuenta recaudadora separada** y **dispersión vía "Pagos a Terceros" de Wompi**.
- Definir el **vehículo de retención**: ¿basta **cuenta bancaria separada + mandato con destinación específica**, o el modelo exige **encargo fiduciario / fiducia de administración y pagos**?
- **Redactar la plantilla del contrato de mandato de recaudo** con anfitriones/propietarios (destinación específica, plazo de payout post-check-in / post-recaudo, **prohibición de disposición de los fondos retenidos como capital de trabajo**, manejo de cancelaciones/reversiones, comisión). Este contrato es **bloqueante**: se firma antes de habilitar el calendario/recaudo.

**2. Derecho de retracto y reversión de pago en el flujo de booking (gate B3-consumidor).**
- **Derecho de retracto — art. 47 de la Ley 1480/2011**: definir si la ventana de 5 días hábiles aplica a reservas de alojamiento **con fecha determinada** o si caben en la excepción de "servicios cuya prestación ha comenzado con acuerdo del consumidor". De esto depende la **política de cancelación** definitiva.
- **Reversión de pago — art. 51 de la Ley 1480/2011 + Decreto 587/2016**: validar el procedimiento de reversión y el estado "reversado" del flujo de checkout.

**3. Datos sensibles y centrales de riesgo (gates B5/B6).**
- **Cédulas y documentos del perfil de inquilino/huésped**: redactar/validar la **autorización EXPLÍCITA separada de datos sensibles** —**Ley 1581/2012 arts. 5-6** y doctrina SIC— que informe que el titular **no está obligado** a autorizar y la finalidad específica; más reglas de acceso mínimo y plan de supresión. Sanción máxima: **cierre definitivo de la operación de tratamiento (Ley 1581 art. 23)**.
- **Consulta a centrales de riesgo** (Datacrédito/TransUnion): condiciones — **afiliación por contrato con el operador + autorización previa, expresa y documentada por consulta** (**Ley 1266/2008 arts. 5, 15**; **Ley 2157/2021 art. 19A**). Redactar el **formato de autorización de consulta**.

**4. Firma electrónica de contratos de arriendo.**
Validar que para la **validez** del contrato de arrendamiento de vivienda basta **firma electrónica simple** (OTP + hash SHA-256 + timestamp) conforme a la **Ley 527/1999 arts. 5-13 y 28** y al **DUR 1074/2015 arts. 2.2.2.47.1 a 47.8**, y redactar/validar el **"Acuerdo de uso de firma electrónica" (clic-wrap previo)** que activa la presunción legal (**DUR 1074/2015 art. 2.2.2.47.7**). Validar la "trilla de evidencia" propuesta y si el cobro de cánones amerita **firma digital certificada** para constituir título ejecutivo.

## (c) Preguntas concretas

1. **Mandato de recaudo vs. captación (el punto más gris del modelo).** Con **más de 20 anfitriones/propietarios firmando mandato en 3 meses** y **ofertas a personas innominadas** (condición **b** del **D.1981/1988 art. 1 num. 2**, ALTERNATIVA a la a): ¿la **destinación específica + prohibición de disposición de fondos** basta para excluir la "libre administración" que configura captación, o conviene un **concepto previo de la Superintendencia Financiera** o una **estructura fiduciaria**? Riesgo residual: el portal como **medio de divulgación colectiva** (**C.P. art. 316 / 316A**).
2. **Concepto sobre recaudo recurrente de cánones (gate B9).** Sobre el **D.1981/1988 num. 2** aplicado a la administración de arriendos: ¿el recaudo mensual de cánones por cuenta de propietarios cruza el umbral de captación? ¿La matrícula de arrendador vigente cubre esta administración con recaudo? (**Ley 820/2003 arts. 28-29**.)
3. **Vehículo y pasarela.** ¿El producto Wompi **"Pagos a Terceros"** + cuenta Wompi **cubre contractualmente** el modelo marketplace? ¿O debemos ir a fiducia? NO queremos ser proveedor de servicios de pago (D.1692/2020 exige registro SFC y capital — fuera de alcance).
4. **Retracto en reservas con fecha determinada** — ¿aplica o no la ventana de 5 días hábiles del art. 47?
5. **Cédula como dato sensible.** ¿Solo el frente, permitir tachar huella/grupo sanguíneo, o basta la autorización explícita? ¿La verificación del huésped tiene **base legal adicional** (TRA / reporte SIRE a Migración para extranjeros)?
6. **Autorización de consulta a centrales.** ¿La finalidad del art. 15 Ley 1266 basta o se exige **siempre** autorización previa expresa? ¿Checkbox + evidencia basta o requiere OTP/firma? ¿Una autorización cubre una o varias consultas? ¿La prohibición de consultas "laborales" (Ley 2157) no se extiende al screening de arrendamiento?
7. **Retención documental.** Plazos máximos para conservar cédulas/extractos de aplicantes **rechazados** y documentos del inquilino **tras terminar el contrato**.

## (d) Entregable esperado del abogado

1. **Concepto jurídico escrito** que resuelva la **arquitectura de pagos**: mandato + cuenta separada vs. fiducia (preguntas 1-3). Esta conclusión **desbloquea la construcción de la integración**.
2. **Plantilla firmada del contrato de mandato de recaudo**.
3. **Textos legales de la Ola 2**, versionados: Acuerdo de firma electrónica (clic-wrap), autorización de consulta a centrales, autorización explícita de datos sensibles (cédulas), y la política de cancelación/retracto/reversión definitiva.
4. **Concepto sobre firma electrónica** (validez de firma simple + trilla de evidencia + si el cobro de cánones amerita firma digital certificada).
5. Definición de la **política de retención documental** (plazos por tipo de documento).

## Nota para Daniel — decisiones que quedan en tu cancha
- **Facturación electrónica DIAN (arrancar en PARALELO, con tu contador).** Es **requisito previo al primer cobro** (**Res. DIAN 000165/2023**; riesgo = clausura — **E.T. arts. 652-1, 657**). IVA 19% sobre comisiones/suscripciones; arriendo de vivienda excluido de IVA (**E.T. art. 476 num. 15**), comercial no. Inícialo ya (semanas de trámite).
- **Apertura de la cuenta Wompi** (da sandbox) también es tuya y puede iniciarse en paralelo, pero **la integración técnica NO se construye hasta que llegue el concepto B2/B9**.
- **Elección del vehículo** (mandato vs. fiducia) y de la **pasarela definitiva** son tuyas tras el concepto.
- **Nada de dinero sale live** antes de: concepto B2/B9 + facturación DIAN habilitada + política de cancelación validada.
