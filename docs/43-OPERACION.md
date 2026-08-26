# 🏢 43 — LÓBULO OPERACIÓN (Altorra Inmobiliaria · Fundación Operativa)

> Lóbulo hijo de `40-LOBULOS-DOMINIO`. Nace del **triaje F1 del corpus fundacional** (TODO-34, ADR §62,
> 2026-07-24: 9 lectores sobre 143 archivos del dueño). Detalle por-documento + nombres de clientes +
> cifras por cliente → bóveda `2026-07-24-f1-triaje-corpus-fundacion-{SINTESIS,DIGEST,CRUDO,censo}` (PRIVADA
> — este repo es público: JAMÁS subir aquí PII de clientes ni datos societarios internos).
> ⛔ NO es asesoría legal (gate abogado); todo "verificar" se resuelve en F2 con fuentes `.gov.co`.

## Identidad legal (verificada contra certificados del corpus)

- **ALTORRA COMPANY S.A.S.** · NIT 902.063.965-4 · matrícula mercantil 10011978 (CC Cartagena) ·
  constituida por doc privado 30-abr-2026, inscrita 06-may-2026. **"ALTORRA INMOBILIARIA" NO es sociedad**:
  es el establecimiento de comercio (matrícula 10013497, 05-jun-2026, Blas de Lezo). Todo se firma como
  ALTORRA COMPANY S.A.S. Objeto/CIIU: L6820 inmobiliaria (principal) + G4511 vehículos (¡Cars vive en la
  MISMA sociedad!) + M7310 publicidad + M6920 contabilidad. RUT 07/08-may-2026: renta ordinaria, obligado a
  contabilidad, exógena, Informante de Beneficiarios Finales (RUB pendiente de evidencia), NIIF Grupo III.
- ⚠️ **DOBLE IDENTIDAD**: los contratos/actos 2025→feb-2026 son de "ALTORRA S.A.S." NIT 901.976.611-7
  (sociedad ANTERIOR, correos gmail) — contratos vivos SIN cesión a COMPANY. Regularización = F4 #1.
- ⚠️ **Gobernanza**: el gerente NO tiene mayoría accionaria; reformas estatutarias y enajenación total
  exigen supramayoría (70%) y el quórum exige pluralidad → toda decisión estructural es multi-socio.
  Detalle (composición, nombres) → bóveda.
- ✅ **Matrícula de arrendador: OTORGADA — `Resolución 6636` del 23-jul-2026** (Oficina Asesora Jurídica,
  Alcaldía de Cartagena; firma Milton José Pereira Blanco). Daniel entregó el papel el 2026-08-20 y el
  expediente CUADRA con lo que ya sabíamos: radicado EXT-AMC-26-0060455 (13-may) → requerimiento
  AMC-OFI-0074376-2026 (25-may, rechazo del modelo "sin local físico", D.D. 1476/2025) → subsanación
  EXT-AMC-26-0073992 con certificados del 09-jun → otorgamiento 23-jul. Copia → bóveda `expediente-legal/`.
- ✅ **NÚMERO DE MATRÍCULA DE ARRENDADOR = `6636`** (= el número de la Resolución). El art. 2º decía
  «asígnese el número que le corresponda por el sistema» y quedaba la duda; **la Oficina Asesora
  Jurídica lo aclaró por WhatsApp el 2026-08-20**: *«el número de matrícula de arrendador es el número
  de la resolución, el registro quiere decir que en nuestros registros digitales ya se encuentra
  inscrito»*. ⇒ **gate de Ley 820 art. 31 LEVANTADO**: ya se publica en el footer del portal y en la
  Política, y la pauta de arriendo deja de estar bloqueada por este motivo.
  ⚠️ **Fuerza probatoria**: es una afirmación de la entidad por chat, no una constancia sellada. Sirve
  para publicar (es la interpretación oficial de quien administra el registro), pero conviene pedir la
  **constancia escrita de inscripción** para el expediente. NO bloquea nada.
- ⚠️ **Discrepancia de números — verificar en Cámara de Comercio**: la resolución llama al establecimiento
  "ALTORRA INMOBILIARIA **con Matrícula No. 10011978**", pero según este mismo nodo 10011978 es la matrícula
  **mercantil de la SOCIEDAD** y el establecimiento es **10013497**. Lo cazó Daniel al leer el acto. Uno de
  los dos está mal: si es la Alcaldía, conviene corregirlo por vía de reposición (art. 4º) ANTES de que ese
  número circule en documentos; si es nuestro registro, corregir aquí. **Ningún número se publica hasta
  aclararlo.**
- ⛔ **Datos personales del acto que NO se publican**: cédula del rep. legal, `Barrio Santa Lucía Mz E Lt 6`
  (domicilio del representante, no dirección comercial verificada) y el teléfono **323 501 6747** — es el
  personal de Daniel, prohibido publicar (memoria `identidad-marca-inmobiliaria`). El correo del acto
  (`altorracompanysas@gmail.com`) es interno; el público sigue siendo `info@altorrainmobiliaria.co`.

## 🧹 LEADS — los 16 del sitio viejo, BORRADOS el 2026-08-20 (decisión de Daniel)

**Qué hubo**: 16 leads reales en `solicitudes` del 2026-04-16 al 2026-07-09 (14 `pendiente` · 2 `cerrado`),
**todos del SITIO VIEJO** — verificado mapeando cada `origen` a su archivo en `js/` legacy. El portal nuevo
nunca captó uno real (escribe `origen: portal-publicar`; sigue en staging `noindex`). **Ninguno de los 16
tenía `emailSent`**: nadie recibió aviso jamás. Esperaron entre 42 y 126 días.

**Qué se hizo**: Daniel decidió eliminarlos (*«son de la antigua plataforma, crearemos un portal nuevo más
operativo y escalable»*). **Exportados ANTES** a copia local fuera de git (datos personales):
`backups/solicitudes-EXPORT-2026-08-20.json` + `backups/HOJA-LLAMADAS-14-leads.md`. Borrado ejecutado por
Daniel con `firestore:delete --recursive` (Claude no ejecuta destrucción de datos reales) y **verificado
vía REST: la colección quedó en 0 documentos** (`verificado-vivo: 2026-08-20`).

## 🔴 LO QUE EL BORRADO **NO** ARREGLÓ — sigue vivo y muerde al portal nuevo

`onNewSolicitud` falla con **`535-5.7.8 Username and Password not accepted`**: las credenciales de Gmail
(`EMAIL_USER`/`EMAIL_PASS`) no sirven. **Es la misma Function que avisará los leads del portal nuevo.** Si
se lanza sin rotar la contraseña de aplicación (pelota de Daniel), los leads nuevos se pierden EXACTAMENTE
igual que los 16 — solo que esta vez sin evidencia de que pasó. Sospecha sin verificar: el doc tampoco
recibía `leadScore`/`nurturing` aunque el repo los escribe antes del envío ⇒ la Function desplegada podría
no ser la del repo.
⚠️ Al retomar contacto comercial, **Ley 2300/2023**: L-V 7:00-19:00 · Sáb 8:00-15:00 → `42-LEGAL`.
## Cómo opera HOY (probado con papeles reales, no manual)

> ⚡ **Actualización Daniel 2026-07-24**: **NO hay contratos vigentes** — todos los arrendamientos/administraciones
> finalizaron; COMPANY **arranca de cero**. Las plantillas canónicas = las de última actualización del Drive
> (= CONSOLIDADO del corpus, confirma el dictamen F1). ⇒ No hay migración de contratos vivos: el pasado se
> CIERRA documentalmente (soportes bajo la SAS vieja) y lo próximo que se firme nace en COMPANY con el kit limpio.
> Lo de abajo describe el ciclo YA DEMOSTRADO (2025→feb-2026) — es la experiencia real, no el estado presente.

Administración de vivienda bajo mandato, ciclo completo demostrado con 2 aptos en Conjunto Milán (Parque
Heredia): recauda el cargo mensual integral del arrendatario → descuenta **10% + IVA 19%** (la cifra REAL;
las plantillas dicen 8-12%) → paga la cuota PH ella misma vía PSE (aprovecha descuento por pronto pago) →
gira remanente al propietario (5 días hábiles pactados). Factura electrónica por **Siigo** (autorización
DIAN ago-2025). Inspecciones semestrales con informe fotográfico membretado. Cierre contractual con
"constancias espejo" (informativa al propietario + requerimiento al arrendatario el día del vencimiento),
doctrina de llaves (entregar llaves ≠ paz y salvo), plazo de subsanación 8 días, paz y salvo condicionado.
Un arriendo con pago ANTICIPADO de 8 meses (modelo atípico sin soporte contractual en el corpus).
Línea alojamientos por días: tarifario 2026 real (doble tabla confidencial/pública, temporadas, early/late
check-in) pero operación informal (anticipo 50% por Nequi/transferencia, sin recibo ni política de
cancelación ni RNT en ningún doc). Prospectos activos: administración (cotización "simulación de
liquidación" = herramienta de venta), Serena del Mar, y un lote rural 12.000 m² en Turbana (topografía).

## 🖨️ Documentos corporativos — cómo se generan (2026-07-28)

Los `.md` de la bóveda `entregables-fundacion/` son la **fuente**; los Word con membrete se **generan**
con `_plantilla/generar-documentos.ps1` (24 docs, ~3 min). ⚠️ **Editar un Word a mano = perder el cambio**
en la siguiente tanda. Identidad extraída del contrato REAL de ALTORRA, no inventada: **Century Gothic
9 pt · Carta 21,6 × 27,9 · márgenes 2,5/3 cm · membrete con logo + tabla CÓDIGO/VERSIÓN/PÁGINA**.
Códigos por familia (`CAD` administración · `CAR` arriendo · +21 nuevos) → `_plantilla/LEEME.md`.
**Método clave**: el generador **parte del documento original y le vacía el cuerpo** — copiar el
encabezado a un documento nuevo pierde 2 de las 4 imágenes del membrete. Los `.docx` van en `.gitignore`
(2,6 MB c/u = 64 MB por tanda, regenerables). Copia de trabajo de Daniel:
`Downloads\ALTORRA Company (Legal)\…\KIT ALTORRA`.

## Qué documento MANDA por dominio (dictámenes del triaje)

| Dominio | Canónico | Nota |
|---|---|---|
| Doctrina/procesos | `Sistema_Operativo_Integral_v2` (MAESTRO) | v1 raíz OBSOLETO. ⚠️ v2 trae frase con sentido INVERTIDO sobre aprobaciones >$1M |
| Scripts WhatsApp | `..._Scripts_v4` (MAESTRO) | v4 PERDIÓ material único de v3 (ACM 5 pasos, tabla administración, 20 llamadas/día) y v1 (queja/despedida) → consolidar v5. v2 aún apunta al sitio VIEJO |
| Contratos administración | CAD-000 + CAR-000 + PEI-000 (CONSOLIDADO 2026) | ⚠️ CAD-000 CONTAMINADO con datos de un cliente real + fecha inválida — limpiar antes de usar |
| Habeas Data | Fusionar: HD-01 V2 (cuerpo) + REVISADO (formato firma) | La "vigente" es la más pobre |
| Confidencialidad | CCND-01 REVISADO | CCDN-01 viejo → cuarentena |
| SARLAFT/KYC | NINGUNO usable | Ambos formularios autorizan a FONPRECON (plantilla estatal sin adaptar) → rehacer |
| Ficha técnica | FTI-01 v1.0 | El borrador "simple" define la frontera público/"(OCULTO)" → insumo TODO-33 |
| Inventarios | NINGUNO único | 3 modelos incompatibles conviven (uno bajo el NIT VIEJO con tel. personal en membrete) |
| Capacitación leads | Decks PDF (el doc SGC formal PAL01 está a medio construir, NIT en blanco) | Protocolo: SLA <5 min · BANT · 6 escenarios A1/A2/B1/B2/C/D · cadencia D0/1/3/5/8/15 |
| Tarifario | SOLO alojamientos existe | El inmobiliario NO EXISTE (scripts con `[%]`) — F4 con decisión de Daniel |

## Tarifario y umbrales OFICIALES (sellados por Daniel 2026-07-25 — derogan toda cifra previa)

**Administración vivienda: 10% + IVA sobre el cargo mensual integral (canon + cuota PH cuando aplique)** ·
administración/colocación COMERCIAL: ⟦PENDIENTE decisión Daniel⟧ · **venta: 3%** · solo-colocación de
arriendo: 1 canon (<3 años) / 2 (3-9) / 3 (≥10) · **ingresos arrendatario: 2× canon · codeudor: 2×** ·
alojamientos: tarifario 2026 existente. **Corta estancia: FORMALIZAR TODO** (mandato 2026-07-25): RNT +
TRA + SIRE + Fontur + contrato de hospedaje + política de cancelación — no se pausa la línea. Micro-cifras
restantes (fotos, ACM ±%, arras, mora unificada) las propone el KIT en `02-TABLA-UNICA` → OK de Daniel.

## Gaps mayores (backlog F4, por riesgo)

1. **Regularización societaria**: cesión de contratos vivos a COMPANY + cartas de aceptación correctas +
   copia completa firmada de la constitución + RUB/DIAN + actualizar RUT (establecimiento en 0) + contacto
   registral (hoy: celular personal + gmail en Cámara/RUT).
2. **Compliance datos**: Política de Tratamiento (NO existe — la citan ambos Habeas Data; gate #1 del portal,
   `42-LEGAL`) + Aviso de Privacidad + rehacer formularios KYC (FONPRECON→ALTORRA) + resolver huella
   (dato sensible sin autorización específica) + evaluar RNBD.
3. **Tarifario canónico + tabla única de umbrales** (decisión Daniel).
4. **Contratos faltantes núcleo**: promesa de compraventa (el DIC-01 la referencia y no existe) · acta de
   entrega/restitución · formato de liquidación mensual · estudio de arrendatario/codeudor · plantilla de
   otrosí/preaviso/no-prórroga · cesión · arriendo COMERCIAL (C.Co 518-524) · contrato de hospedaje +
   política de cancelación (corta estancia — línea declarada con CERO marco).
5. **Los 35 formatos** que el propio dueño lista en "DOCUMENTOS FALTANTES" (su backlog confeso).
6. **Operación**: matriz de inmuebles administrados · comprobantes de recaudo · conciliación de la cuenta
   separada · recobro de servicios · traslado de titularidad de servicios (caso constructora) · custodia de
   la firma PNG · membrete en blanco (los "membretes" actuales son actos reales con datos de clientes).
7. **Calidad**: el sistema de códigos es heredado de un HSEQ ajeno, formatos vacíos, 2 convenciones
   (NN-XXX vs XXX-NN) → lista maestra + control documental propio.

## Marco legal operativo VERIFICADO (F2 2026-07-24 · citas verbatim + URLs → bóveda `f2-...-CRUDO`)

> 6 frentes `.gov.co` (45+ claims con norma exacta) + consejo externo integrado. ⛔ NO es asesoría — gate abogado.

**ILEGALES (retirar/reescribir):** depósito 1-2 cánones en vivienda (L.820 §16; multa ≤100 SMLMV §34 +
riesgo de matrícula — en arriendo COMERCIAL sí es válido) · preaviso de 2 meses (mínimo legal 3; sin
constancia escrita → renovación automática, §22-8/§24-5) · renuncia del arrendatario a reclamación
administrativa (ineficaz, CC 16 + §33.a.5) · cláusulas probatorias del FII-000 — impugnación 48h, "prueba
irrefragable", renuncia a peritajes = "por no escritas" (CGP 13); reposición a valor de bien NUEVO excede
CC 1613-14 · operar/publicitar corta estancia sin RNT (cierre inmediato por alcaldía, L.1558 §33 par.5).
**RIESGOSAS:** anticipo de 8 meses (lícito como precio; recaracterizable como depósito si respalda
incumplimientos, §16 inc.2) · terminación "con efecto inmediato" (restitución SOLO judicial, CGP 384) ·
FE cobrando IVA con pie "no responsable" (una SAS es SIEMPRE responsable — §437 par.3 es solo para PN;
corregir plantilla Siigo + verificar resp. 48 en RUT) · llamadas frías sin protocolo (Ley 2300 §5: L-V
7-19, Sáb 8-15, mecanismo de exclusión; números sin autorización → L.1581 §9) · anunciar DataCrédito sin
autorización documentada (la finalidad contractual ampara — L.1266 §15/C-1011-08 — pero sin prueba =
indefensión ante SIC) · autodeclarar SAGRILAFT (NO es sujeto obligado por umbrales; y ⚠️ la CE 100-000016
fue DEROGADA el 2-jul-2026 por la **CE 100-000020, Cap. IX, umbrales en UVB** — citar la nueva) · cláusula
penal 3 cánones + perjuicios + 20% cobranza (el cúmulo exige pacto expreso CC 1600; tope mercantil 100%
C.Co 867) · "comprador paga los gastos" (default legal = mitades CC 1862; la retención es SIEMPRE del
vendedor, E.T. 398) · anticipos de hospedaje sin factura (alojamiento turístico = IVA 19%; parafiscal
Fontur 2,5‰ SIN umbral desde L.2068; SIRE obligatorio con extranjeros — multa 105-2.631 UVT; el retracto
de 5 días del art. 47 SÍ aplica a reservas a distancia).
**LEGALES confirmadas:** esquema mandato canon-neto CON 4 formalidades (facturar el canon por cuenta del
mandante · facturar la comisión con IVA · certificación al propietario · contabilidad separada — D.1625
§1.6.1.4.9 y §1.2.4.11). ⚠️ **Del §1.2.4.11 se leyó el texto en fuente oficial el 26-ago (§168)**: dice
que el mandatario practica las retenciones «teniendo en cuenta la calidad del mandante», que debe
«identificar en su contabilidad los ingresos recibidos para el mandante y los pagos y retenciones
efectuadas por cuenta de este», y que el mandante declara «según la información que le suministre el
mandatario». **NO se encontró** el «bajo la gravedad del juramento» que esta nota daba por hecho: hasta
verlo, esa fórmula NO va en el certificado · migración de contratos por CESIÓN (C.Co 887 ss.) CON aceptación del propietario
(intuitu personae) + notificación escrita al arrendatario — o refirma, que con 1-2 contratos es lo simple ·
codeudor/póliza/pagaré-con-carta-de-instrucciones en vivienda (C.Co 622) · comisión solo al registro
verificado (más garantista que C.Co 1341) · prohibir subarriendo turístico al arrendatario (§17 default).
**Datos duros para manuales:** reajuste del canon = tras 12 meses "bajo un mismo precio", ≤100% IPC del año
anterior, NOTIFICADO o es inoponible (§20) · tope canon = 1% del valor comercial (≤2× avalúo catastral,
§18) · terminación por arrendador: en prórrogas 3 meses + 3 cánones (§22-7); al vencimiento con causales
especiales (caución 6 meses) o ≥4 años con 1,5 cánones (§22-8) · retención venta (PN): 1% hasta 10.000 UVT
+ 2,5% exceso (D.572/2025 — tarifa VOLÁTIL en 2026: verificar con el notario al cierre) · retefuente
comisiones a PJ: 11% · retefuente canon: 3,5% y la practica el MANDATARIO · promesa: 4 requisitos (L.153
§89) y la autenticación NO es de validez · el dominio se transfiere con la INSCRIPCIÓN en ORIP (CC 756) ·
contenido mínimo del contrato = §3 de la L.820 (no §11) · paz y salvo predial obligatorio para escriturar
(L.14/83 §27); el de PH no es bloqueante (constancia + solidaridad, L.675 §29) · RNBD: NO obligada
(<100.000 UVT de activos, D.90/2018) · **RUB: 2 meses desde el RUT ⇒ venció ~jul-2026 → reportar YA**
(sanción E.T. 658-3) · EEFF certificados por RL + contador (L.222 §37) · TRA/registro de huéspedes =
prueba del contrato de hospedaje (L.2068 §21-22).
**❓ Agenda abogado (no verificado en fuente oficial):** régimen de intereses sobre cánones (CC 1617 reglas
3a-4a vs mercantil + unificación CSJ) · taxatividad de causales de terminación · tarifa registro Bolívar +
estampillas · aplicación de L.1480 al arriendo de vivienda (concepto SIC) · frecuencia de Ley 2300 en
prospección · valor UVB 2026 · reglamento PH silente vs autorización expresa para vivienda turística.

## Estado del arco TODO-34

**F1 ✅** (§62) · **F2 ✅** (§63: 6 frentes verificados + consejo externo Gemini integrado — adoptado el
reorden tesorería-primero; refutado diferir compliance de datos; su cita SAGRILAFT nació derogada).
**F3** = este lóbulo ES la neurogénesis; skills tras F4. **F4 (orden final, ajustado al "cero contratos
vigentes" §63.8)**: **#0** reporte RUB (✅ Daniel lo declaró reportado 07-25 — archivar acuse) + Protocolo
de Tesorería (cuenta escudo ANTES del primer mandato nuevo; Daniel la tramita) + soportes históricos del
anticipo/giros (SAS vieja) → **#1** **HABILITAR FE de COMPANY** (⚡ Daniel 07-25: la FE/Siigo 2025 era de
la SAS VIEJA; COMPANY sin convenio hoy → gate antes del primer cobro; proveedor en investigación) +
resp. 48 en RUT → **#2** **KIT DE ARRANQUE**: contrato canónico de
administración + arrendamiento LIMPIOS (aplicando veredictos F2) + tarifario oficial + tabla única de
umbrales — sin esto NO se puede firmar el próximo cliente → **#3** matrícula (resolución al expediente;
los modelos se presentan a la autoridad, §29-b — conecta con #2) → **#4** societario liviano: acuerdo de
accionistas + actas/libros + destino de la SAS vieja → **#5** compliance datos (Política + KYC sin
FONPRECON; gate del portal/pauta) → **#6** corta estancia: RECOMENDACIÓN pausar hasta RNT+TRA+SIRE+política
de cancelación (decisión Daniel). Cuestionario de decisiones SOLO-Daniel → bóveda SINTESIS §6.
