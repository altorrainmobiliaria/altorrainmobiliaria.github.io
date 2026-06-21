# 🛰️ 15 — CONSEJO EXTERNO (2ª opinión adversarial · Altorra Inmobiliaria)

> Trigger 🛰️ Decisión Fuerte (§G.2): ANTES de algo caro de revertir (arquitectura, modelo de datos, seguridad/legal,
> op irreversible, fork 50/50), considera crítica adversarial de un **provider externo de otra familia** (no-Claude).
> **Humano en el medio**: tú preparas un prompt autocontenido; el dueño lo corre y trae la respuesta; tú la integras
> como UN peer-review más (adoptar lo correcto, **refutar con razones**, sintetizar). NUNCA te subordines al modelo externo.

## §0 — Provider activo
- **Gemini (Google) vía Antigravity** — el dueño lo corre. (Mismo provider que Altorra Cars.) Si no hay provider/tokens
  disponibles → sigo solo y **marco la decisión como NO revisada externamente** en el ADR.

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
