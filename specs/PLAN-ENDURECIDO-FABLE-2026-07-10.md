# 🏛️ PLAN ENDURECIDO — Auditoría estratégica final Fable 5 → Opus 4.8 (2026-07-10)

> **CAPA DE EJECUCIÓN RATIFICADA** sobre el MEGA-PLAN (ADR §17) y el stack sellado (ADR §16).
> Producto del repaso completo del plan con Fable 5 (cuota casi agotada) pedido por el dueño para
> dejar a Opus 4.8 listo para ejecutar Olas 0→3 sin Fable. **Método**: Opus armó el dossier de
> auditoría de todo el corpus (7 lectores → `research-archive/2026-07-10-dossier-auditoria-plan-crudo.json`,
> 164KB, incluye la 2ª pasada FTI-01 ya hecha); Fable ratificó/corrigió y produjo este documento.
> **Regla de precedencia**: donde este documento corrija al dossier o al MEGA-PLAN, **gana este documento**.
> Registro decisional → ADR §20. Guardado verbatim de Fable abajo.

---

## 0 · Veredicto de readiness

**SÍ — Opus puede ejecutar Olas 0→3 solo con el dossier + este documento.** El dossier es de alta calidad: las 40+ resoluciones propuestas son en su gran mayoría correctas y se ratifican en bloque abajo, con 4 correcciones de secuencia/timing y ~10 omisiones que nadie detectó. Riesgos ROJOS que descarrilarían la ejecución: **(1)** el cuello de botella del dueño — la cuenta Cloudflare (bloqueo activo HOY), la elección D0 y el abogado toque (i) son los tres únicos frenos duros de las Olas 0-1, y hay que pedirlos como UN lote hoy, no gotear; **(2)** la ventana del decreto RNT cierra **MAÑANA 2026-07-11** — avisar a Daniel HOY; **(3)** omisión nueva: el cutover NS Hostinger→Cloudflare arrastra TODA la zona DNS — sin inventariar y replicar MX/SPF/DKIM, **el correo `info@altorrainmobiliaria.co` se cae el día del go-live**; **(4)** operando sin auditoría concurrente, el modo de fallo más probable de Opus no es técnico sino de disciplina (validación optimista + deriva del cerebro) — los guardarraíles §6 son la defensa.

---

## 1 · Ratificación de decisiones

### 1.1 Las `needsDaniel:true` (todas)

| # | Decisión | Veredicto |
|---|---|---|
| R1 | **Split del abogado en dos engagements** — (i) revisión legal MVP pre-cutover Ola 1 (B1 + T&C con cláusula de fotos + disclaimers B13/B3/B4 + política de cancelación sin dinero + preguntas RNT-plataforma #5/#6 + PII histórica del seed CRM); (ii) mesa de dinero pre-Ola 2 (B2/B9 + D.1981/88 num.2 + retracto art.47 + reversión art.51 + B5/B6 + firma electrónica) | **RATIFICADA.** LA corrección estructural del plan. El enmarque "abogado = Ola 2" (TODO-17/21) queda **derogado**. El cutover DNS queda gateado por el toque (i), sin excepción. Opus prepara el BRIEF de ambos toques (O9). |
| R2 | **D0: 3 direcciones de marca + recomendación explícita de Opus, Daniel elige** | **RATIFICADA.** Primer entregable de Ola 0.3, front-loaded. Añadir al paquete D0 el **slogan** (proponer "Seguridad, Legalidad y Confianza" como tagline + "Gestión integral…" como descriptor). |
| R3 | **Alojamientos en Ola 1 pese a ambigüedad RNT-plataforma** — gates diseño-satisfacibles YA; pregunta al toque (i); interim soft-launch noindex | **RATIFICADA.** El fallback noindex no bloquea el cutover del resto. |
| R4 | **DIAN facturación electrónica + apertura Wompi como gates-dueño** | **RATIFICADA con CORRECCIÓN de timing:** pedirlos **durante Ola 1**, NO "al abrir Ola 2" (lead time externo de semanas; paralelo puro; Wompi abierto da sandbox). |
| R5 | **Tarifas Ola 2**: % corta estancia 10-15% + aliados plan escalonado bajo ancla Proppit | **RATIFICADA** en rangos. Daniel fija números en go/no-go Ola 2. |
| R6 | **Seed del CRM desde exports Excel recientes del dueño** | **RATIFICADA.** La licitud de importar PII histórica = pregunta del toque (i). |
| R7 | **Matrícula/RNT config-driven + flag hasta números reales** | **RATIFICADA con CORRECCIÓN factual:** la matrícula **AMC-OFI-0074376-2026** YA está en el corpus (R4 §6) — Opus la extrae a `config` YA; Daniel solo confirma vigencia + certificado + provee los RNT. No esperar a Daniel para lo ya verificado. |
| R8 | **B5 datos sensibles**: Opus redacta v1 + Storage rules; abogado valida en mesa (ii) | **RATIFICADA.** |
| R9 | **Consulta pública decreto RNT (cierra 2026-07-11)** | **RATIFICADA — URGENTE, ítem #1 del lote-dueño de HOY.** `rnt` a nivel de UNIDAD desde 0.7. |
| R10 | **Póliza**: no codificar "arrendatario paga" (riesgo caución art.16); costo lado propietario; garantía opcional | **RATIFICADA.** |
| R11 | **Horario 9-18/Sáb 9-14** + slogan a D0 | **RATIFICADA.** |
| R12 | **Wompi: plumbing vs activación** | **CORREGIDA →** NO construir plumbing Wompi-específico (webhooks/firma/máquina de estados concreta) ANTES del concepto B9 de la mesa (ii) — si el abogado exige fiducia o fuerza plan B (MercadoPago Split), la integración cambia entera. SÍ antes (0.7/Ola 1): interfaz enchufable + estados abstractos `retenido/liberado/reversado` + idempotencia por `reservationRequestId`. Secuencia Ola 2: mesa (ii) → concepto → plumbing → sandbox → test de carrera → activación. |
| R13 | **Allowlist git en `.claude/settings.json`** | **RATIFICADA — opción (b)**: pedir a Daniel HOY que apruebe la regla de permiso push/merge sobre `main`. Nunca burlar el clasificador. |

### 1.2 Decisiones `opusCanDecideSolo` de alto impacto — PRE-RATIFICADAS (selladas salvo evidencia nueva)

- **OD1 edge→Firestore**: REST v1 + apiKey pública para lecturas públicas (rules `read:true`) detrás del edge-cache; Functions/Admin SDK para escrituras y transacciones, JAMÁS en el camino síncrono de render; SA-JWT por WebCrypto solo si imprescindible. Matiz load-bearing: "jamás toca Firestore síncronamente" = jamás VÍA FUNCTION; el cache-miss SÍ lee vía REST edge-native con SWR.
- **Topología de imágenes** (presigned PUT R2 → CF `processImage` sharp vía S3 API → WebP → borrar original; Worker sirve por binding): + guardarraíles (a) `getUploadUrl` con auth + límites tamaño/tipo/número; (b) barrido de originales huérfanos.
- **Modelo de datos OD2-OD9** (FTI-01 autoritativo + proyección pública; partición dura PUBLIC/`captaciones`-PII; 9 estados pipeline; `actividades` polimórfica; `pagos` por período con mora a config; `expedientes` agregado raíz + top-level con FK; INM-* canónico + `codigoLegacy`; `garantia` sin depósito-vivienda): RATIFICADAS en bloque. Añadir enum `vertical: vivienda|comercial|turistico` en `propiedades` Y `contratos`, y `rnt` por unidad.
- **Split Ola 1 en 1A (público, gatea cutover) / 1B (GESTIÓN v1 post-cutover)**: RATIFICADA + **regla dura: Ola 2 NO abre sin 1B cerrado.**
- **Bóveda documental v1 = solo docs contractuales; cédulas diferidas a B5/Ola 2**: RATIFICADA.
- **Corta estancia Ola 1 sin dinero**, diferencial pivotado a verificación in-situ + badge RNT + SLA <1h + precio total transparente; copy "dinero protegido" reservado a Ola 2: RATIFICADA. Híbrido solicitud→confirmación (no instant book); ubicación aproximada (nunca dirección exacta, geo de barrio en JSON-LD); reviews ligadas a RESERVA CONFIRMADA; publicación gratuita generosa (~5 activos, re-confirmación 30-60d → inactivo, nunca borrar); JSON-LD canónico por superficie (RealEstateListing/VacationRental — jamás RentAction en ventas); iCal export Ola 1-2 e import Ola 3; barrios cruzando demanda×inventario con regla anti-Arenas.
- **Obra enriquecida (0.4) SIN formulario — solo CTA WhatsApp**: RATIFICADA (neutraliza B1 en Ola 0). Si el legacy tiene forms que persisten datos, quitarlos en el mismo cambio.
- **GESTIÓN**: mora en dos capas (causación día 1 / cobranza 5-10-15-30-45), ingresos 3x configurable, renovación 120d+90d, IPC con topes, arras "desde 10%", ACM ±15%, cron diario Resend idempotente (WhatsApp Cloud API fast-follow): RATIFICADAS.
- **Gobernanza — carve-out legacy-vs-portal** de §3.2/§4/§1 (ban de frameworks y SW PWA rigen el LEGACY hasta el cutover; `portal/` se rige por ADR §16 conservando el espíritu: JS mínimo, sin Tailwind, free-tier sagrado, limit(9), cero onSnapshot público): **PRE-APROBADA como edición de kernel** — Opus la ejecuta ya, por ADR, marcada [OPUS-4.8]. Reconciliación R6 del interinato: RATIFICADA como principio operativo.
- **TTFB p75<800ms como step de CI real** (staging, distingue cache-hit/miss, rompe build): RATIFICADA + tratar como presupuesto proxy (el runner no es un móvil CO) + RUM post-cutover.
- **pmtiles Cartagena-metro en R2 + isla MapLibre; índice JSON de búsqueda a R2 por Function onWrite; tripwire Typesense documentado-no-construido**: RATIFICADAS.

**Ninguna resolución del dossier queda RECHAZADA.** Correcciones: R4 (timing), R7 (matrícula ya en corpus), R12 (plumbing tras concepto), candado 1B-antes-de-Ola-2.

---

## 2 · Omisiones (lo que nadie detectó)

- **O1 — Continuidad DNS/email en el cutover (ROJO).** Cambiar NS Hostinger→Cloudflare migra TODA la zona. Sin réplica exacta de **MX, SPF, DKIM, DMARC y subdominios** en CF DNS, `info@altorrainmobiliaria.co` muere el día del go-live. Inventario completo de la zona Hostinger (ítem Ola 1) + réplica verificada ANTES del switch.
- **O2 — Runbook de cutover inexistente.** Escribirlo en Ola 1: bajar TTL 48h antes → inventario DNS (O1) → verificación staging → switch NS → smoke tests (web+email+301s) → ROLLBACK (revertir NS) → monitoreo 48h. **Solo NS, no transferir registrar.**
- **O3 — Staging indexable.** `X-Robots-Tag: noindex` + robots.txt disallow en workers.dev desde el primer deploy (0.2), o Google indexa el duplicado.
- **O4 — Backups de Firestore.** Export manual documentado (Ola 1) + export programado (gcloud firestore export → bucket) como gate de entrada de Ola 2.
- **O5 — Monitoreo/alertas de producción.** Budget alert GCP (el free-tier no tiene alarma que muerda), CF notifications, uptime check (dominio + ficha caliente), error logs Workers. Ola 1.
- **O6 — Analytics del portal.** GA4 nueva property o CF Web Analytics + eventos lead/WhatsApp-click + atribución `lead.source`. Definir pre-cutover; el Aviso de Privacidad lo menciona (toque i).
- **O7 — Verificación de dominio Resend requiere DNS.** Recordatorios GESTIÓN v1 dependen de Resend con dominio verificado = registros DNS = acceso del dueño. Al lote-dueño de Ola 1.
- **O8 — Onboarding de la cartera ACTUAL de GESTIÓN.** El dueño administra desde ago-2025; cargar expedientes/contratos vigentes (data entry) + base de autorización Habeas Data de clientes existentes (toque i). Sin esto GESTIÓN v1 nace vacía.
- **O9 — El brief del abogado lo prepara Opus.** Dos documentos listos-para-reenviar (agenda toque (i) y mesa (ii)). Convierte "contratar abogado" de proyecto a trámite.
- **O10 — Higiene del working tree.** Basura untrackeada de la investigación (`home.html`, `fees.html`, `getsemani.html`, `room.html`, `search.html`, `master-index`, `sitemap-*` = capturas de Airbnb). JAMÁS commitear (scrapeado de terceros); mover a bóveda o borrar en Ola 0.
- **O11 — Gates automáticos para las 3 cadenas prohibidas.** Pre-commit grep del portal que FALLE si aparece en superficie pública: nº personal (`323 501`/`3235016747`), NIT viejo (`901.976.611`/`901976611`), o `avalúo`/`avaluo` fuera del disclaimer B13. Convierte 3 reglas [HONOR] en gates con diente.
- **O12 — Fixture del test de carrera anti-overbooking.** Test ejecutable (2 requests concurrentes, misma fecha, contra emulator/staging) cuando se construya la transacción — si no, regla de papel.

---

## 3 · Secuencia de gates CORREGIDA

```
HOY (lote-dueño #0, un solo mensaje):
  G0.a  Aviso decreto RNT — consulta cierra MAÑANA 07-11 (decide él/abogado)
  G0.b  Cuenta Cloudflare + R2 bucket + API token + R2 S3 keys + secrets + CF_DEPLOY_ENABLED (Fincaraíz; +2FA)
  G0.c  Permiso DesignSync (un clic)
  G0.d  Aprobar allowlist git push/merge en .claude/settings.json
  G0.e  Contratar abogado con el BRIEF (i) que Opus entrega redactado
  G0.f  D0: elegir dirección de marca (cuando Opus entregue las 3 propuestas, día 1-2)

OLA 0 (Opus; dev-local no espera a G0.b, staging sí):
  0.3 direcciones D0 → 0.4 obra AEO sin form → 0.5 GBP/Bing → 0.6 textos legales v1 DRAFT +
  brief abogado (i)/(ii) → 0.7 modelo de datos + rules + indexes + client.ts (edge REST) + matrícula a config
  CIERRE = 0.7 verificado en staging (requiere G0.b) + carve-out kernel hecho

OLA 1 — hito 1A (público):
  D1 tokens → D2 mockups en TANDAS (lotes de 3-4) → superficies públicas + admin v1 + Auth +
  estimador "Rango" (B13) + precios (cifras de Daniel) + alojamientos (rnt bloqueante; noindex si legal no cierra)
  EN PARALELO (dueño, al abrir Ola 1): DIAN electrónica · apertura Wompi · RNT + auditoría RNT actual ·
  cifras tarifarias · fuente seed CRM · dominio Resend (DNS) · datos cartera GESTIÓN
  GATE DE CUTOVER: abogado (i) validó textos → matrícula/RNT en config → TTFB CI verde →
  mapa 301 reconciliado (63 vs 65) → runbook cutover + inventario DNS/MX (O1/O2) → staging noindex →
  GO/NO-GO del dueño → CUTOVER NS
OLA 1 — hito 1B (GESTIÓN v1): madura post-cutover; CANDADO: cierra antes de abrir Ola 2.

OLA 2 — GATE DE ENTRADA (mesa de dinero, todo junto):
  abogado (ii) B2/B9 + D.1981/88 num.2 + art.47/51 + B5/B6 + firma electrónica + Wompi contractual  ×
  DIAN ACTIVA  ×  cuenta Wompi abierta  ×  tarifas selladas  ×  1B cerrado  ×  backups programados (O4)
  → SOLO ENTONCES plumbing Wompi (R12) → sandbox → GATE DE SALIDA: test de carrera (fixture O12) +
  cron conciliación diaria.

OLA 3 — gates por feature: B11 (partner asegurador, abogado — sin él NO se diseña garantía) ·
  B12 · B10 (matrícula por municipio antes de expandir) · B14 · tripwire Typesense.
```

Regla transversal: **nada marcado →abogado sale live con redacción provisional; nada de dinero antes de B2/B9; nada de UI sin mockup D2 aprobado; nada "cerrado" sin verify E2E en staging + cerebro alimentado.**

---

## 4 · Lote-dueño (checklist de Daniel, front-loaded)

**LOTE 0 — HOY (un solo pedido):** G0.a-G0.f del §3. G0.a vence mañana. Sin G0.b Opus queda en dev-local; sin G0.e el cutover no tiene fecha.

**LOTE 1 — al abrir Ola 1 (lead time externo, pedir temprano):**
1. Aprobar mockups D2 **por tandas** (3 sesiones ~15 min).
2. Iniciar con el contador la **facturación electrónica DIAN** (semanas de trámite).
3. **Abrir cuenta Wompi** (cuenta recaudadora separada; da sandbox).
4. Confirmar **certificado de matrícula** vigente + proveer **RNT** (plataforma/prestador) + auditar RNT de la operación actual de alojamientos.
5. Dar las **cifras tarifarias publicables** (o aprobar rangos "desde").
6. Confirmar **fuente del seed CRM** + entregar datos de la **cartera administrada actual**.
7. Añadir los **registros DNS de Resend** (o dar acceso).
8. **GO/NO-GO del cutover** (revisando el delta docs→implementación en cristiano).

**LOTE 2 — antes de Ola 2:** agendar **mesa de dinero** (brief (ii) ya redactado); confirmar DIAN activa; sellar % corta estancia + precio aliados; firmar modelo de mandato de recaudo; go/no-go de activación de custodia.

**LOTE 3 — al abrir Ola 3:** partner asegurador (B11), decisión de expansión por municipio (B10), presupuesto Typesense solo si el tripwire dispara.

---

## 5 · Plan endurecido por ola

### OLA 0 — Fundaciones (en curso; scaffold ✅ ADR §19)
**0.2** (gate dueño G0.b; lo demás avanza dev-local) → **0.3** tres direcciones D0 + recomendación + slogan → **0.4** obra AEO SIN formulario (FAQPage JSON-LD, sello matrícula, CTA wa.me/573002439810) → **0.5** GBP reclamada + Bing Webmaster → **0.6** textos legales v1 DRAFT (plantillas R3 §5, marcados, jamás live) + brief abogado (i)/(ii) → **0.7** tipos TS de 8+ colecciones (FTI-01 autoritativo, partición PUBLIC/`captaciones`, GESTIÓN día-1, `vertical`, `rnt` por unidad, disponibilidad race-safe, `garantia` sin depósito-vivienda) + `firestore.rules` (deny-all default, `_version`) + `firestore.indexes.json` declarado + `client.ts` REST edge + matrícula a config. Además: carve-out kernel §3.2/§4, limpieza working tree (O10), gates grep (O11), staging noindex (O3).
**Readiness cierre:** deploy staging OK · 0.7 verificado E2E (query real REST tras cache) · rules/indexes listos para deploy del dueño · D0 elegido · brain:check sano · brief abogado entregado.

### OLA 1 — MVP público sin dinero
**1A (gatea cutover):** D1 tokens → D2 en tandas → home / SERP+mapa / ficha SSR+og:image / publicar (wizard 3 pasos, leer destilado R0) / precios / alojamientos sin dinero (SLA <1h, calendario, rnt bloqueante) / estimador "Rango" / landings-barrio (anti-Arenas) / admin v1+Auth (JWKS edge) / pipeline imágenes / índice JSON búsqueda / TTFB CI / analytics (O6) / mapa 301 reconciliado / runbook cutover+DNS/MX (O1/O2).
**1B (post-cutover, cierra antes de Ola 2):** GESTIÓN v1 — expedientes+contratos+calendario cron Resend+novedades+pagos manuales con mora; leer masters no destilados (Sistema_Operativo_Integral_v2, Protocolo_Maestro_v2) antes de 1.13; onboarding cartera actual (O8); Storage rules B5; backup manual (O4).
**Readiness:** los 8 verdes del gate §3 (1A). Dueño operando GESTIÓN a diario con recordatorios llegando (1B).

### OLA 2 — Dinero + arriendo digital
Gate de entrada completo (§3) → plumbing Wompi (post-concepto, R12) con skills wompi-* + auditoria-financiera (L-12) → booking con pago (hold transaccional + test de carrera O12) → perfil inquilino B5/B6 → GESTIÓN v2 (cobro canon + conciliación diaria + payout <día 10) → suscripción aliados + pipeline venta → firma de contratos solo si la trilla de evidencia se re-validó (B16).
**Readiness:** test de carrera verde · conciliación corriendo · primer cobro real facturado electrónicamente · reversión art.51 probada · cero dinero fuera del diseño validado.

### OLA 3 — Expansión
Portales propietario/inquilino (leen por expediente — schema 0.7 lo prevé) · garantía al propietario solo tras B11 · certificado buen pagador (B12) · iCal import/captación anfitriones · reviews bidireccionales · expansión municipios tras B10 · Typesense/Neon solo al tripwire.

---

## 6 · Guardarraíles para Opus operando solo

1. **Validación optimista.** → Reflejo caza-bugs E2E VINCULANTE: fronteras estado-cero (crear 1er / borrar último, en vivo Y con recarga) por superficie; verify en staging por ítem. R4 del interinato sin excepción "trivial".
2. **Arrastre legacy al portal** (globals `window.*`, SW PWA, onSnapshot cross-tab, smart-search viejo). → El carve-out de kernel delimita; prohibido usar código viejo como base (reimplementar el enfoque, no el código).
3. **Fuga de free-tier silenciosa.** → Checklist por PR: `limit()` (default 9), cero onSnapshot público, imágenes solo R2, purga onWrite verificada; budget alert GCP (O5).
4. **Tocar dinero antes del gate / plumbing prematuro.** → Prohibición B2/B9 + R12: ni una línea Wompi-específica antes del concepto.
5. **Publicar texto legal provisional.** → DRAFT con marca técnica + flag que impide render en producción; cutover exige abogado (i); gates grep (O11).
6. **Deriva del cerebro.** → Cierre §G.4 como gate: 05/10 al día, ADR+00 por decisión, lección→30, CRUDO+SÍNTESIS de toda deliberación, bitácora. Tarea sin cerebro alimentado = NO cerrada.
7. **"Push = desplegado".** → L-13: sentinela + `git fetch` + live check antes de afirmar deploy.
8. **Gotear al dueño.** → Solo lotes por ola (§4) y mockups D2 en tandas. Interrumpir solo por dinero/legal/go-no-go.
9. **Adivinar versiones/APIs de memoria.** → L-14: todo claim de Astro/adapter/wrangler/Wompi contra docs vivas (context7/cloudflare-docs).
10. **Reglas-de-papel.** → TTFB CI y test de carrera solo existen cuando su artefacto ejecutable rompe el build; construirlo ES parte del ítem.
11. **Ediciones de kernel descuidadas.** → Solo las dos pre-aprobadas (carve-out §3.2/§4, derogación "abogado=Ola 2"); cualquier otra: deliberada, por ADR, marcada [OPUS-4.8], en cola para auditoría.
12. **PII en la colección pública.** → Partición `propiedades`/`captaciones` = frontera de RULES, no convención; cada cambio de schema re-verifica que ningún campo NUNCA-publicar cruce a lectura pública.

---

*Fable 5, pasada estratégica final · 2026-07-10. El plan está listo; la propuesta de Opus era ya ~90% correcta y este documento sella el 10% restante. Opus: ejecuta con confianza, marca lo Fuerte para la auditoría por ola, alimenta el cerebro como si tu sucesor naciera mañana — porque nace.*
