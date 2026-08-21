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

## Cuándo NO usar esta skill

- El usuario pide explícitamente un asunto legal de **otro país** (ahí sí los plugins extranjeros aplican).
- Pregunta trivial no-legal. (Pero ante la duda sobre legalidad/cumplimiento, dispárala.)
