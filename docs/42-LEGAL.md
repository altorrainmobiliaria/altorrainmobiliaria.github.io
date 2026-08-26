# ⚖️ 42 — LÓBULO LEGAL (Altorra Inmobiliaria · Colombia)

> Lóbulo hijo de `40-LOBULOS-DOMINIO`. Esencia LEGAL operativa del portal (R3 2026-07-10, 17 agentes,
> claims verificados). Detalle completo con artículos/fuentes → `specs/R3-LEGAL-COLOMBIA-2026-07.md`.
> ⛔ NO es asesoría certificada, y **no hay abogado externo**: el "gate de abogado" no es esperar a nadie — es
> **dictaminar** (norma en fuente oficial, posición, fundamento, riesgo residual medido). Detalle → §165.
> Prohibido dejar una pregunta legal como pendiente ajeno.
> Convenciones: 🔶 = hallazgo CORREGIDO en verificación adversarial · ❓ = NO-VERIFICABLE, pendiente de abogado.

## Reglas duras que moldean el PRODUCTO (lo que el diseño no puede violar)

1. **Cero depósitos/cauciones al inquilino de vivienda** (Ley 820/2003 arts. 15,16,18, directas/indirectas/con otro nombre). Revenue SOLO del lado propietario (comisión, fee de garantía, success fee). Único depósito legal: garantía de servicios públicos (D.3130/2003, tope = 2×cargo fijo + 2×consumo prom., a favor de la ESP).
2. **Matrícula de arrendador POR MUNICIPIO** para administrar/intermediar arriendo de vivienda (Ley 820 art. 28, umbral >5 contratos/presunción >10 inmuebles; D.51/2004 art. 2 par. 3). Altorra ya la tiene en Cartagena; expandirse a otro municipio dispara trámite nuevo (8 días hábiles, renovación anual automática). Número de matrícula OBLIGATORIO en toda publicidad (art. 31).
3. **RNT propio de la plataforma + RNT vigente de cada anfitrión de corta estancia** (Ley 300/1996 arts. 61-62 mod. D.L. 2106/2019; 🔶 la obligación de PLATAFORMAS nace de Ley 2068/2020 art. 38 + D.1836/2021, no del art. 62). Campo `rnt` bloqueante en el schema; verificar contra rnt.confecamaras.co antes de publicar; exhibir el número en el anuncio; auditar YA el RNT de la operación actual de alojamientos.
4. **Umbral de 30 días** separa "corta estancia turística" (RNT+parafiscal+IVA hospedaje) de "arriendo de vivienda" (Ley 820) — Ley 1101/2006 art. 3 par. (mod. Ley 2068). El vertical de datos/impuestos/reglas cambia exactamente en ese límite.
5. **Pago protegido = mandato de recaudo, NUNCA captación masiva** (D.1981/1988 art. 1: condiciones ALTERNATIVAS a/b; C.P. arts. 316/316A agravado por medio de divulgación colectiva). Contrato de mandato escrito por anfitrión ANTES de habilitar su calendario, cuenta recaudadora separada, jamás usar fondos retenidos como capital de trabajo. Recaudo Wompi checkout → payout vía "Pagos a terceros" (Wompi no tiene split/escrow nativo).
6. **Habeas Data es el gate MÁS TEMPRANO del portal** (Ley 1581/2012 arts. 9,12; D.1377/2013 arts. 7-8,13-24): Política de Tratamiento + Aviso de Privacidad publicados y checkbox de autorización NO premarcado con prueba conservada (timestamp+versión) ANTES del primer formulario (contacto, publicar-propiedad, favoritos).
7. **Datos sensibles (cédula/biometría) exigen autorización EXPLÍCITA separada** (Ley 1581 arts. 5-6 + doctrina SIC); sanción máxima = cierre definitivo de la operación de tratamiento (art. 23). Nunca pedir cédula en un lead; solo en fase contractual/reserva confirmada.
8. **Consulta a centrales de riesgo exige afiliación + autorización previa expresa POR CONSULTA** (Ley 1266/2008 arts. 5,15; Ley 2157/2021 art. 19A prohíbe uso para decisiones laborales).
9. **Estimador NUNCA "avalúo"** (Ley 1673/2013 arts. 3,9-10,21-22 + Ley 1480 arts. 29-30): siempre "Rango" con disclaimer fijo ("no constituye un avalúo…") + metodología visible + CTA a avaluador RAA verificable. Rentímetro con disclaimer de NO garantía de rentabilidad.
10. **Firma electrónica válida = nivel simple + trilla de evidencia** (Ley 527/1999 arts. 5-13,28; DUR 1074/2015 arts. 2.2.2.47.1-47.8): clic-wrap previo del "Acuerdo de uso de firma electrónica" (activa la presunción legal) + verificación identidad + OTP + SHA-256 + timestamps server-side + IP/UA + certificado de firma + copia ≤10 días. Firma digital certificada solo si se busca título ejecutivo.
11. **Reversión de pagos soportada de punta a punta** (Ley 1480 art. 51 + D.587/2016): estado "reversado" + webhook idempotente; mientras el fondo está retenido (mandato) la reversión es trivial — diseñar el flujo así desde el día 1.
12. **Facturación electrónica DIAN activa antes del primer cobro** (Res. DIAN 000165/2023; riesgo = clausura del establecimiento, E.T. arts. 652-1, 657). IVA 19% sobre comisiones/suscripciones; arrendamiento de vivienda excluido de IVA (E.T. art. 476 num. 15) pero NO el comercial.

## Gates bloqueantes por feature (resumen — detalle íntegro en spec §2)

| Feature | No lanza sin… | Norma ancla |
|---|---|---|
| Cualquier formulario que capte datos | Política+Aviso de Privacidad + checkbox con prueba | Ley 1581 arts. 9,12 |
| Booking corta estancia con pago (Wompi) | RNT propio + RNT por anuncio + mandato de recaudo + reversión + política de cancelación validada por abogado | Ley 300, Ley 2068 art.38, D.1981/1988, L.1480 arts.47/51 |
| Publicar anuncio de alojamiento | RNT vigente del anfitrión + declaración PH + RNT exhibido | Ley 2068 art.38.4, D.1836/2021, D.1074/2015 art.2.2.4.1.2.2.8 |
| Fichas/pauta de arriendos Altorra | Número de matrícula visible | Ley 820 art.31, D.51/2004 art.8.3 |
| Guardar cédulas/documentos en Storage | Autorización explícita de datos sensibles + acceso mínimo | Ley 1581 arts.5-6 |
| Screening con centrales de riesgo | Afiliación + autorización previa por consulta | Ley 1266 arts.5,15 |
| Fee "estudio" al aplicante / taxa mensual inquilino | Validación expresa del abogado (por defecto NO lanza en vivienda) | Ley 820 arts.16,18,33-34 |
| Recaudo recurrente de cánones (Ola 2) | ✅ **DICTAMEN TOMADO (§165)**: no es captación, con 3 condiciones de diseño vinculantes — ver dictamen abajo | **D.1068/2015 art. 2.18.2.1** (compiló al D.1981/1988) |
| Expansión de administración a otro municipio | Matrícula propia en ESE municipio | D.51/2004 art.2 par.3 |
| Garantía de arriendo al propietario | ✅ **DICTAMEN TOMADO (§171)**: solo como AGENCIA del asegurador, con su **carta de autorización previa** — corredor no se puede ser, y garantía propia jamás | **Ley 510/1999 art. 101** + C.Pol. art. 335 / EOSF |
| "Certificado de buen pagador" | Solo versión "constancia privada al titular, sin score" | Ley 1266 arts.3,12-13,18 |
| Estimador como "Avalúo Altorra" | Bloqueado el nombre; solo "Rango" con disclaimer | Ley 1673 arts.3,9-10,21-22 |
| Cualquier cobro del portal | Facturación electrónica DIAN habilitada | Res. DIAN 000165/2023 |
| Preaviso de terminación 100% digital | Validar equivalente funcional electrónico (zona gris) | Ley 820 arts.22.7,24 vs Ley 527 |

## 📜 Instrumentos de cobro — reglas estructurales (verificadas 2026-07-27)

> ⚠️ **ALTORRA NO usa pagaré** (decisión de Daniel, 2026-07-27): la garantía del arriendo se maneja con la
> **aseguradora**, con sus propias políticas; sin póliza, con **codeudor solidario**; y el título para cobrar es el
> **propio contrato** (mérito ejecutivo, doc 04 cláusula VIGÉSIMA CUARTA). El doc 23 quedó retirado del kit.
> **Estas reglas se conservan porque no eran del pagaré**: salieron de dos auditorías adversariales sobre él y
> aplican a **TODO instrumento de cobro** que redactemos (acuerdos de pago, cheques, cualquier título futuro).

1. **Un anexo NUNCA autoriza más que su contrato madre.** Si el anexo cobra un concepto que la cláusula del contrato
   no prevé, ese llenado es "contra instrucciones" (C.Co. 622). Ampliar el anexo obliga a parchear el contrato en el
   mismo cambio (así nacieron el PARÁGRAFO 3 de la NOVENA y la DÉCIMA SEGUNDA del doc 04).
2. **El título lleva SOLO capital.** Meter intereses en el valor de cara y luego cobrar intereses sobre ese total es
   anatocismo: el art. 886 C.Co. solo lo admite desde la demanda judicial o por acuerdo POSTERIOR al vencimiento (la
   carta de instrucciones es anterior). Los intereses se piden como accesorio (CGP 424).
3. **Pena e intereses: decide la CAUSA, no la etiqueta** (corregido 2026-07-28, comité R3 §66). El art. 1600 prohíbe
   pedir a la vez *la pena y la indemnización* **por el mismo hecho**; en deudas de dinero los intereses *son* esa
   indemnización (C.C. 1617). Luego: pena que sanciona **el retardo en pagar** = alternativa con los intereses, hay
   que elegir. Pena que sanciona **conductas** (subarriendo, cambio de destinación, no restituir) + intereses por el
   retardo = **causas distintas, se cobran ambos sin violar el 1600** (arquitectura del doc 04: VIGÉSIMA TERCERA y
   PARÁGRAFO 3 de la NOVENA). ⚠️ Esta regla decía antes "ALTERNATIVOS, nunca sumables" en abstracto, y así regalaba
   un rubro en cada conflicto. Al redactar: **separa las causas de forma expresa, o pierdes la acumulación**.
4. **Cero indeterminación en lo que el deudor firma.** "Tasa más baja defendible", casillas ☐ de beneficiario,
   ⟦PENDIENTE⟧ dentro del texto vinculante → deuda no líquida (CGP 424) o beneficiario indeterminado (C.Co. 709
   num. 2). La elección editorial se resuelve generando **archivos distintos**, jamás con una marca de lapicero.
5. **No autoimponerse caducidades que la ley no exige.** La acción cambiaria directa dura 3 años (C.Co. 789); poner
   6 meses en la carta es regalarle al deudor, con su firma, una excepción gratuita. Las metas internas de gestión
   viven en el instructivo interno, nunca en el documento que firma el deudor.
6. **Biometría = dato sensible.** Huella y cédula exigen autorización explícita, separada e informada, con derecho a
   negarse sin consecuencias (Ley 1581 arts. 5-6; sanción art. 23 = cierre definitivo de la operación). Es la regla
   dura #7 de este lóbulo aplicada al papel, no solo al portal.

## 📌 Dictámenes propios (2026-07-27) — normas leídas literalmente, posición tomada

| Pregunta | Posición | Base | Riesgo residual |
|---|---|---|---|
| ¿Puede ALTORRA ofrecerle al propietario una **garantía de arriendo**? *(dictamen 2026-08-26, §171 — el último gate «sin investigar» de este nodo)* | **Sí, pero SOLO como agencia del asegurador y con un papel que hoy no consta** | **Ley 510/1999 art. 101** (verificado): agencias y agentes **«no pueden ejercer su actividad sin autorización PREVIA de las compañías de seguros que pretendan representar»**; la compañía controla su idoneidad y **responde solidariamente**. Y **corredor NO se puede ser**: exige sociedad anónima con **objeto social exclusivo**, y ALTORRA es una S.A.S. inmobiliaria. La frontera práctica: **exigir** que exista póliza no es intermediar; **gestionar su expedición y/o cobrar por colocarla, SÍ** — y eso es justo lo que la Política de Datos ya declara que hacemos («gestionar el aseguramiento o afianzamiento del contrato»). ⛔ Y lo que NUNCA se puede: **garantía propia**. Responder con el patrimonio de ALTORRA si el arrendatario no paga es actividad aseguradora y exige autorización estatal (C.Pol. art. 335 + EOSF) | **ACCIÓN CONCRETA, y no es cara**: pedirle a cada aseguradora con la que se trabaje su **carta de autorización como agencia**. La expide ella, es gratis, y sin ella la actividad es irregular aunque todo lo demás esté bien. ✅ Lo que YA está bien y no hay que tocar: el portal **no promete garantía propia** en ninguna página, `/terminos` la excluye expresamente, y la Política de Datos declara a la aseguradora como **Responsable** del estudio de admisión. ❓ **ABIERTO — «afianzadoras»**: no verifiqué si las sociedades de afianzamiento están vigiladas ni bajo qué régimen. Mientras no se verifique, **el respaldo se ofrece con ASEGURADORA, no con afianzadora**: es la diferencia entre un respaldo vigilado y uno que no se sabe. ⚠️ Lectura literal de la norma, **no revisada por un tercero** (§G.2) |
| ¿Recaudar el canon por cuenta del propietario es **captación masiva y habitual**? *(dictamen 2026-08-26, §165 — el gate que bloqueaba la Ola 2)* | **NO, con tres condiciones de diseño** | **D.1068/2015 art. 2.18.2.1** (norma VIVA; el `D.1981/1988` que citaba este nodo quedó compilado ahí). Num. 2 exige >20 mandatos en 3 meses **«con el objeto de administrar dineros de sus mandantes bajo la modalidad de LIBRE ADMINISTRACIÓN»** — un mandato de RECAUDO no lo es: suma determinada, de un arrendatario determinado, para un propietario determinado, con plazo de giro. Num. 1 exige un pasivo «en el que **no se prevea como contraprestación el suministro de bienes o servicios**» — el canon SÍ tiene contraprestación (el uso del inmueble). Y el **parágrafo 1** añade un filtro ACUMULATIVO que este nodo no registraba: aunque se diera un numeral, solo hay captación si además el total supera el **50 % del patrimonio líquido** o sale de ofertas a **personas innominadas**. Además, la actividad ya tiene su régimen propio y ALTORRA lo cumple: matrícula de arrendador (Ley 820 arts. 28/31, la 6636) | **Las tres condiciones son vinculantes, no recomendaciones**: (1) el dinero **no reposa en cuenta de ALTORRA** — Wompi recauda y dispersa al propietario (decisión ya tomada); (2) el mandato dice **recaudo y giro con plazo**, jamás «libre administración» ni facultad de invertir; (3) **cero oferta a innominados**: solo propietarios con contrato de administración firmado. Si alguna se rompe, el dictamen deja de valer. ⚠️ **NO revisado por un tercero** (§G.2, sin provider externo): es lectura literal de la norma, no concepto de abogado titulado — y antes de ENCENDER el cobro conviene pagar una revisión humana, que es barata comparada con el riesgo |
| ¿Pagaré en blanco = caución prohibida en vivienda? *(dictamen archivado: ALTORRA ya no usa pagaré)* | **NO** | Ley 820 art. 16 prohíbe *"depósitos en dinero efectivo u otra clase de cauciones **reales**"*; la frase antielusión dice *"**tales** garantías… de las indicadas en el inciso anterior"*. El pagaré es garantía **personal** cambiaria | Sin objeto desde el 27-jul. **La misma base sirve para la póliza**: es un seguro contratado por el arrendador a su costa, no un depósito ni una caución real a cargo del arrendatario |
| ¿Intereses de mora sobre cánones? | **Sí al 6%, pero rubro EN RIESGO** | C.C. art. 1617: regla 1ª permite intereses convencionales; **regla 3ª** "los intereses atrasados no producen interés" y **regla 4ª** extiende eso a *"toda especie de rentas, **cánones** y pensiones periódicas"* (lectura estricta recogida por el Consejo de Estado) | Acotado por diseño: los intereses van FUERA del valor de cara del título → si el juez los niega, **el capital sigue exigible** |
| ¿La mora del MANDATO (doc 03) va a 1,5×IBC o al 6%? | ✅ **RESUELTA — no era una decisión** (§181) | **Son DOS contratos bajo DOS regímenes, y cada uno ya lleva el suyo.** El doc 03 es el mandato de administración/recaudo con ALTORRA: **mandato COMERCIAL** — la caracterización no la invento aquí, está verificada en `R3 §GATE 1` (*«Rol de Altorra: mandataria de recaudo del anfitrión, C.Co. 1262 ss.»*) — luego su mora se rige por **C.Co. 884** (1,5× el bancario corriente, con el techo de usura). El doc 04 es el arrendamiento de **vivienda urbana** entre propietario e inquilino: acto civil → **C.C. 1617**, 6 %. No divergen: hablan de obligaciones distintas | ⛔ Sigue en pie: **NO bajar el 03 a 6%** — en un mandato mercantil regala intereses legítimos. Lo que falta NO es una decisión sino **una cláusula que explique POR QUÉ difieren**, para que quien lea el kit no lo tome por incoherencia; tarea EDITORIAL de un párrafo, para cuando TODO-34 se reanude. Las 5 remisiones citan la cláusula por nombre, así que no se tocan. ⚠️ No verificado en fuente esta vuelta: si el propietario NO es comerciante, si el acto mixto arrastra igual al régimen mercantil (C.Co. 22) — no hace falta para la conclusión, pero conviene cerrarlo antes de firmar |
| ¿Mandato escrito basta para firmar el arriendo por el propietario? | **Sí, sin notaría** | C.C. art. 2149: el mandato puede constar por documento privado; el arriendo no es acto solemne | Nulo para la firma |
| ¿El poder de administración sirve para demandar? | **La facultad sí, la forma no** | CGP art. 74: poder general para toda clase de procesos **solo por escritura pública**; el especial exige asunto identificado + **presentación personal**; solo litigan abogados inscritos | Operativo: sin escritura, cada demanda depende de que el propietario firme y presente el poder a tiempo |

## Checklist de lanzamiento (textos/páginas obligatorios — MVP)

T&C por vertical · Política de Tratamiento de Datos (responsable+finalidades+derechos+transmisión internacional EE.UU./Firebase declarada) · Aviso de Privacidad en cada formulario (checkbox no premarcado) · Autorización explícita separada para datos sensibles · Política de cancelación + reversión + retracto (art. 47, validar con abogado antes de publicar) · Página PQR · Número de matrícula de arrendador (footer + fichas + pauta) · Número RNT (propio + por alojamiento) · Disclaimer del estimador ("Rango", no avalúo) + Rentímetro (no garantía de rentabilidad) · Declaración PH del anfitrión (checkbox+timestamp) · Identificación del proveedor + tarifario público · Contrato de mandato de recaudo (redactado por abogado, firmado antes de habilitar calendario). Ola 2 suma: Acuerdo de uso de firma electrónica (clic-wrap) · Autorización de consulta a centrales · Plantillas de arrendamiento/administración versionadas sin cláusulas de cobro al inquilino · Formato de garantía de servicios públicos. Regla transversal: TODO texto legal se versiona (fecha+hash) y la aceptación referencia esa versión exacta; nada marcado "→ abogado" se publica con redacción provisional.

## Agenda del abogado (top 10, deduplicada — íntegra en spec §4)

1. ⏳ **VENCIDA sin atender** (cerró 2026-07-12; marcada en auditoría §49): consulta pública del decreto RNT de MinCIT — no se comentó. Si el decreto sale, revisar impacto (seguimiento normativo).
2. Mandato de recaudo vs D.1981/1988 num. 2 (>20 anfitriones/3 meses + ofertas a innominados): ¿basta cuenta separada + destinación específica, o exige fiducia?
3. Vehículo de retención de fondos: cuenta separada + mandato vs. encargo fiduciario; ¿"Pagos a terceros" de Wompi cubre contractualmente el modelo marketplace?
4b. ✅ **RESUELTA (§183) — ¿la 1480 aplica al ARRIENDO?** No es sí/no: es **supletoria**. El art. 2 lo dice literal: aplica donde *«no exista regulación especial, evento en el cual aplicará la regulación especial y **suplementariamente** las normas de esta Ley»*. El arriendo de vivienda SÍ tiene régimen especial (Ley 820) ⇒ 820 manda y la 1480 llena vacíos. **Operativo: NO publicar página de «retracto» para el arriendo** — anunciaría un derecho que ahí no opera; la protección que muerde es el art. 16 de la 820 (nada al arrendatario fuera del canon). ⚠️ NO cierra la 4: en RESERVAS el régimen especial es turismo (Ley 2068), otra pregunta.
4. Retracto art. 47 L.1480 en reservas con fecha determinada: ¿aplica la ventana de 5 días hábiles? — define la política de cancelación. *(F2 §63 2026-07-24, fuente oficial: el art. 47 —adicionado L.2439/2024— SÍ aplica a ventas a distancia y sus 7 excepciones NO cubren servicios con fecha determinada ⇒ política de no-reembolso solo puede operar FUERA del retracto e informada antes de reservar; queda al abogado solo el matiz doctrinal SIC.)*
5. RNT: ¿inscripción de la plataforma es independiente y adicional al RNT como prestador? ¿La operación actual de alojamientos por días ya exige RNT hoy?
6. Exclusión de plataformas del art. 3 num. 8 Ley 2068 (solo listado, sin intermediación de pago): ¿decide el secuenciamiento del roadmap?
7. Fee de "estudio/verificación" al aplicante de vivienda (patrón Zillow): ¿caución indirecta prohibida por art. 16 Ley 820?
8. Consulta a centrales de riesgo: ¿formato de autorización (checkbox+evidencia vs. OTP/firma) y alcance por consulta?
9. Preaviso de terminación 100% digital: ¿equivalente funcional electrónico del "servicio postal autorizado" (Ley 527)?
10. Garantía al propietario (Ola 2-3): estructura con aseguradora/afianzadora y rol legal permitido de Altorra — tema sin investigación propia, encargar completo.
