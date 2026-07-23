# 🛰️ 15 — CONSEJO EXTERNO (2ª opinión adversarial · Altorra Inmobiliaria)

> Trigger 🛰️ Decisión Fuerte (§G.2): ANTES de algo caro de revertir (arquitectura, modelo de datos, seguridad/legal,
> op irreversible, fork 50/50), considera crítica adversarial de un **provider externo de otra familia** (no-Claude).
> **Humano en el medio**: tú preparas un prompt autocontenido; el dueño lo corre y trae la respuesta; tú la integras
> como UN peer-review más (adoptar lo correcto, **refutar con razones**, sintetizar). NUNCA te subordines al modelo externo.

## §0 — Provider activo
- **Gemini (Google) vía Antigravity** — el dueño lo corre. (Mismo provider que Altorra Cars.) Si no hay provider/tokens
  disponibles → sigo solo y **marco la decisión como NO revisada externamente** en el ADR.

## §0b — Qué modelo pedir en Antigravity, por situación *(menú verificado por Daniel 2026-07-23 — HECHO CADUCABLE tipo L-30: re-mirar el menú al usarlo; portable ×4, hermanos lo portan por sinapsis)*
> **Regla madre**: el valor del consejo es la **OTRA FAMILIA** (anti-monocultivo). Cada prompt al dueño **nombra el modelo** a elegir.

| Modelo del menú | Cuándo pedirlo |
|---|---|
| **Gemini 3.1 Pro (High)** | ⭐ **DEFAULT de Decisión Fuerte**: crítica adversarial PROFUNDA (arquitectura/datos/seguridad/legal/dinero). El que más razona del menú; que sea lento no importa — se corre una vez. |
| **Gemini 3.6 Flash (High)** | Barridos AMPLIOS donde el volumen pesa más que la profundidad (revisar muchos archivos/documentos, checklist largo, 2ª pasada rápida sobre un artefacto ya criticado). Fallback si 3.1 Pro no está disponible. |
| Gemini 3.6/3.5 Flash (Medium/Low) · 3.1 Pro (Low) | 🚫 NO usarlos para el consejo: la crítica barata ya la da el comité interno ×3; una 2ª opinión débil ANCLA sin aportar. |
| Claude Sonnet 4.6 / Opus 4.6 (Thinking) | ⛔ **MISMA familia que el operador** → NO cuentan como consejo externo (comparten sesgos de entrenamiento; serían espejo, no adversario). |
| **GPT-OSS 120B (Medium)** | **3ª familia** (OpenAI open-weights): DESEMPATE cuando comité interno y Gemini divergen frontalmente. Modelo pequeño → su voto pesa MENOS y se verifica doble (§3.3); jamás árbitro único de arquitectura. |

## §1 — Cuándo SÍ / cuándo NO
- **SÍ**: decisión cara de revertir (arquitectura/datos/seguridad/legal/dinero), incertidumbre genuina con varias opciones válidas, op irreversible.
- **NO**: lo rutinario/reversible (el comité interno ×3 `comite-expertos` basta). No todo necesita 2ª opinión externa.

## §2 — Cómo (protocolo)
1. **Prompt autocontenido**: el provider externo (Gemini vía Antigravity) **SÍ ve el repo y el cerebro locales (solo-lectura)** →
   el prompt **apunta a rutas/archivos reales** (no se pega el código a mano) + estado factual, restricciones, la decisión, las preguntas.
2. **Anti-anclaje** (decisiones TOP): NO incluyas tu postura/respuesta para no sesgarlo; pídele su criterio independiente.
3. **Pausa y entrégaselo al dueño** (humano en el medio). Trae la respuesta.
4. **Integra** como un peer-review más: adopta lo correcto, refuta con razón lo que no, sintetiza. Insumo, no oráculo.

## §3 — Límites
- 🚫 **El consejero externo (Gemini vía Antigravity) NUNCA edita el repo.** Es un IDE agéntico (PUEDE editar), pero aquí es de **SOLO-LECTURA**: recibe únicamente prompts de **CRÍTICA** (preguntas/hallazgos), JAMÁS tareas de implementación. **El comité interno ×3 + el consejero DEBATEN/aportan hallazgos; quien DELIBERA, DECIDE e IMPLEMENTA (edita/commitea/pushea) es Claude** — ellos asesoran, yo resuelvo. (Aprendido en Altorra Cars 2026-06-19: un mensaje de implementación suelto que se pega en Antigravity le abre la puerta a editar en paralelo → colisión; cerrar el ciclo end-to-end uno mismo lo evita.)
- El modelo externo puede equivocarse (verifica sus afirmaciones contra el código, §3.3). No tiene memoria del proyecto.
- Registra en el ADR qué aportó/cambió la 2ª opinión y qué refutaste.

## Refinamiento — pase adversarial de Gemini (2026-06-21)

Se corrió el protocolo SOBRE sí mismo ("¿ampliar el uso del consejo externo?"). Gemini (code-aware vía Antigravity) convergió con el comité interno: **NO ampliar los triggers** (ya cubren seguridad/dinero/arquitectura). En su lugar, 4 refinamientos de CÓMO se usa:
- **R1 · Anti-anclaje fuerte**: en decisiones TOP, preferir pasarle el problema CRUDO en paralelo (igual que al comité interno), no un artefacto ya pulido por Claude (dispara su sesgo de confirmación). Si revisa código de Claude, incluir SIEMPRE las opciones DESCARTADAS/callejones + las invariantes a cumplir → que cace el fallo en la LÓGICA, no que apruebe la sintaxis.
- **R2 · Alcance**: su revisión INCLUYE razonar modos de fallo *runtime-natured* visibles en código estático (race conditions, optimistic-locking, colisiones de transacción, desacoples de contrato cross-artefacto). NO es un linter de sintaxis. Frontera real: "se halla LEYENDO+RAZONANDO (sí consejo externo) vs solo EJECUTANDO (tests/caza-bugs)".
- **R3 · Límite duro**: la revisión externa es ADITIVA, **NUNCA sustituye** los tests (emulador/E2E) ni el gate de staging/aprobación. Un LLM revisando reglas no supera a un unit test → evita la falsa seguridad pre-prod.
- **R4 · Fricción alta**: consultar SOLO en refactores ESTRUCTURALES de dinero/seguridad o NUEVAS arquitecturas de reglas — NO como peaje pre-deploy rutinario (un gate rutinario se abandona → protocolo muerto).

> Decisión + deliberación completa → ADR cars §224(.8) + bóveda `2026-06-21-consejo-externo-cobertura-SINTESIS.md`. Convergencia independiente comité-interno↔Gemini (señal fuerte). El mayor ROI del consejo externo se desbloqueó al CORREGIR su error factual ("no ve código"), no al ampliar triggers.
