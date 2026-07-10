# ⚖️ 42 — LÓBULO LEGAL (Altorra Inmobiliaria · Colombia)

> Lóbulo hijo de `40-LOBULOS-DOMINIO`. Esencia LEGAL operativa del portal (R3 2026-07-10, 17 agentes,
> claims verificados). Detalle completo con artículos/fuentes → `specs/R3-LEGAL-COLOMBIA-2026-07.md`.
> ⛔ NO es asesoría legal: gate de ABOGADO obligatorio antes de lanzar features/textos con implicación legal.
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
| Recaudo recurrente de cánones (Ola 2) | Concepto de abogado sobre D.1981/88 num.2 (>20 mandatos/3 meses) | D.1981/1988 art.1 |
| Expansión de administración a otro municipio | Matrícula propia en ESE municipio | D.51/2004 art.2 par.3 |
| Garantía de arriendo al propietario | Partner asegurador + rol legal definido (❓ tema sin investigar — gate abogado íntegro) | EOSF / C.Pol. art.335 |
| "Certificado de buen pagador" | Solo versión "constancia privada al titular, sin score" | Ley 1266 arts.3,12-13,18 |
| Estimador como "Avalúo Altorra" | Bloqueado el nombre; solo "Rango" con disclaimer | Ley 1673 arts.3,9-10,21-22 |
| Cualquier cobro del portal | Facturación electrónica DIAN habilitada | Res. DIAN 000165/2023 |
| Preaviso de terminación 100% digital | Validar equivalente funcional electrónico (zona gris) | Ley 820 arts.22.7,24 vs Ley 527 |

## Checklist de lanzamiento (textos/páginas obligatorios — MVP)

T&C por vertical · Política de Tratamiento de Datos (responsable+finalidades+derechos+transmisión internacional EE.UU./Firebase declarada) · Aviso de Privacidad en cada formulario (checkbox no premarcado) · Autorización explícita separada para datos sensibles · Política de cancelación + reversión + retracto (art. 47, validar con abogado antes de publicar) · Página PQR · Número de matrícula de arrendador (footer + fichas + pauta) · Número RNT (propio + por alojamiento) · Disclaimer del estimador ("Rango", no avalúo) + Rentímetro (no garantía de rentabilidad) · Declaración PH del anfitrión (checkbox+timestamp) · Identificación del proveedor + tarifario público · Contrato de mandato de recaudo (redactado por abogado, firmado antes de habilitar calendario). Ola 2 suma: Acuerdo de uso de firma electrónica (clic-wrap) · Autorización de consulta a centrales · Plantillas de arrendamiento/administración versionadas sin cláusulas de cobro al inquilino · Formato de garantía de servicios públicos. Regla transversal: TODO texto legal se versiona (fecha+hash) y la aceptación referencia esa versión exacta; nada marcado "→ abogado" se publica con redacción provisional.

## Agenda del abogado (top 10, deduplicada — íntegra en spec §4)

1. **URGENTE (2026-07-11)**: consulta pública del decreto RNT de MinCIT cierra mañana — ¿comentar a nombre de Altorra?
2. Mandato de recaudo vs D.1981/1988 num. 2 (>20 anfitriones/3 meses + ofertas a innominados): ¿basta cuenta separada + destinación específica, o exige fiducia?
3. Vehículo de retención de fondos: cuenta separada + mandato vs. encargo fiduciario; ¿"Pagos a terceros" de Wompi cubre contractualmente el modelo marketplace?
4. Retracto art. 47 L.1480 en reservas con fecha determinada: ¿aplica la ventana de 5 días hábiles? — define la política de cancelación.
5. RNT: ¿inscripción de la plataforma es independiente y adicional al RNT como prestador? ¿La operación actual de alojamientos por días ya exige RNT hoy?
6. Exclusión de plataformas del art. 3 num. 8 Ley 2068 (solo listado, sin intermediación de pago): ¿decide el secuenciamiento del roadmap?
7. Fee de "estudio/verificación" al aplicante de vivienda (patrón Zillow): ¿caución indirecta prohibida por art. 16 Ley 820?
8. Consulta a centrales de riesgo: ¿formato de autorización (checkbox+evidencia vs. OTP/firma) y alcance por consulta?
9. Preaviso de terminación 100% digital: ¿equivalente funcional electrónico del "servicio postal autorizado" (Ley 527)?
10. Garantía al propietario (Ola 2-3): estructura con aseguradora/afianzadora y rol legal permitido de Altorra — tema sin investigación propia, encargar completo.
