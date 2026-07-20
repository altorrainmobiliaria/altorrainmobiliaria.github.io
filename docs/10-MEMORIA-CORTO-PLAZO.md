# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo de Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`, es de las primeras
> lecturas de cada sesión (Ignorancia Selectiva, §G.1). SOLO lo vivo: foco actual, pendientes abiertos,
> bitácora. Estado técnico → `05`. Es la **pizarra, no el archivo**: al cerrar una tarea, consolidar a
> ADR (`99`) + fila en `00`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual (re-sellado 2026-07-20, auditoría Nivel-2 #4 → §49)

> **FRENTE 1 — portal**: TODO-27 ✅ CERRADO → §43-§48 + L-29 + bóveda. **Siguiente = TODO-30 (MapLibre, EN FRESCO —
> su fila ya trae tiles sellados + criterio de mapa)**. Método de fidelidad → L-29/L-24/L-28 (`30`); piezas
> reusables → `99 §32.10-.13` (5 cards NO intercambiables + `.alt-rail`/`.alt-btn-sweep`); mockups en `portal/design/mockups/`.
>
> **FRENTE 2 — PAUTA: ✅ LISTA-PARA-ENCENDER** (§33-§37; estado vivo de la humo → flag 📣 de `05`). SSoT = skill
> **`pauta-captacion`** (playbook 1ª campaña + setup en orden + gates + vigencia fechada). El encendido de la campaña
> REAL converge con el CIERRE DE OBRA (números matrícula/RNT + privacidad + píxel/GA4 + landing → EN PAUSA → "sí" de Daniel).
>
> **🎨 DISEÑO SELLADO — NO re-litigar** → `CLAUDE.md §1` + `portal/src/styles/tokens.css` (SSoT) + ADR §23-§23.9.
> Dev: `npm --prefix portal run dev` (4321). (La VOZ sí está EN FORJA — memoria.)
>
> **🚦 BLOQUEADORES (solo Daniel)** → flag ⚖️ de `05` + TODO-21.
>
> **🚫 Callejones (NO reintentar)**: (a) ⛔ NADA del sitio viejo (§15.7) · (b) NUNCA UI sin mockup (única exención
> documentada: el mapa real de TODO-30, ver su fila) · (c) datos del portal = DEMO (`client.ts` listo) · (d) NUNCA
> dinero sin gate · JAMÁS el 323… personal · sin gráficas · ALTORRA MAYÚSCULA · (e) skills portables: editar AMBAS
> copias (repo + user) o se derivan (§33).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Nota |
|---|---|---|---|
| **TODO-17** | **Ola 0 restos**: E2E "tras cache" en staging (gate T9) · deploy de rules (coordinado con retiro legacy, NO ahora) · 0.4 obra AEO · 0.6 legal DRAFT. | 🔄 OPUS | abogado (i)=gate CUTOVER |
| **TODO-21** | **Lote-dueño**: Nº matrícula + Nº RNT (existen ✅; Daniel los da al CIERRE DE OBRA) · dirección física · abogado toque (i) (`specs/BRIEF-ABOGADO-2026-07-10.md`). | ⏸️ dueño (gate=obra lista) | |
| **TODO-22** | **Auditoría Fable**: (a) ADR §22 `[REVISAR-FABLE]` (capa de datos); (b) decisión catálogo público SSG vs doc-índice (gatea datos reales). | 🔮 FABLE | |
| **TODO-23** | 🔧 **Kernel hardening** (owner=INMOBILIARIA, escritor único ×4): K-01/02/04/05/09 + §33 + **§49**: gate #7 git-aware de la bóveda (vía fs, sin child_process) · QUITAR #6b (sentencia G-11, n=2) · #13 regex de evidencia endurecer-o-quitar (tautológica) · fusionar #1⊂#10 · validar `deepAudit.tableFile` · priorizar warns en truncado `--boot` · circularidad boot-budget. Masa-neta del kernel ≤ 0 por commit. | 🔴 kernel | §33 G-09 · §49 |
| **TODO-24** | 🧷 **SSoT/instance**: ssotFact de paleta (K-07, regex anclada) · re-apuntar cache/ssotFact al portal EN EL CUTOVER (K-10/G-12: el SW legacy AÚN se sirve — conservar hasta entonces). | 🟡 abierto | |
| **TODO-28** | 🧠 **Endurecer el cerebro**: #1-#3 ✅ (§40-§41) · **sigue #4** `brain:kernel-pull` · #5 índice `00` generado (destilado manual ✅ §49; generador pendiente) · #6 métrica costo-del-cerebro — **proxy ADOPTADO (§49): % commits `docs(cerebro)`/`archive` del mes = 49% > bandera 30% → medir 2 semanas; si se sostiene, RECORTAR doctrina** · #7 sello de vencimiento (>90d). | 🔄 sigue #4 | $0 |
| **TODO-29** | 📣 **PAUTA**: humo encendida 07-18 → estado vivo en flag 📣 de `05`. **Paso siguiente**: al agotarse el saldo, verificar FACTURACIÓN → cierra fontanería §4b → calibra la CAMPAÑA REAL (gate = cierre de obra). | 🔥 vigilar | no tocar 7d |
| **TODO-30** | 🌊 **MapLibre real (ficha+serp)** ← **siguiente (Opus)**. **Tiles SELLADOS — NO re-litigar**: MapLibre GL + **Protomaps `.pmtiles` en R2** (ADR §16.1 + `specs/R5-STACK-2026-07.md`; 13 sectores con centroides curados; cero APIs de pago). Queda solo IMPLEMENTAR (generar `.pmtiles` Cartagena-metro → subir a R2); si la implementación refuta el sellado → entonces sí §3.7. **Alcance**: SOLO `ficha.astro` (`.ficha-locmap`) + `[operacion].astro` (`.serp-map`) — el mapa de la HOME es ilustrado POR DISEÑO (§32.18), **NO tocarlo**. **Criterio de validación** (los mockups son esquemáticos a propósito → el mapa real es EXENCIÓN documentada al mandato mockup, mecanismo §47.2b): PRESERVAR pins de precio · emparejamiento card↔pin con hover (§47.3) · paleta navy/oro del panel; la fidelidad post-mapa se re-audita contra ESTA lista, no contra el `.dc.html`. Luego: wiring forms→`solicitudes` (gate legal = aviso Ley 1581) · datos Firestore = TODO-22 (Fable). | 🔄 OPUS | próximo Frente 1 |
| **TODO-32** | 🧠 **CEREBRO v2 ×4 — APROBADO por Daniel (2026-07-20)**. SSoT = bóveda `2026-07-20-cerebro-v2-sintesis-propuesta.md` + regla de admisión de maquinaria. **F0 ✅ (§50)**: kernel v1.3 (kill-list, masa-neta −1) + offsite OneDrive probado. **Siguiente → F1** (1 sesión): kernel único en `brain-private/kernel/` + bootstrap `brain:pull` ~20 líneas/repo + hash-gate BLOQUEANTE vs canónico + `core.hooksPath` compartido; doble-modo, flip inmobiliaria→cars→insema→bersaglio; test = 1 fix propagado ×4 en <5 min. Luego F2 (heartbeat sidecar + consolidación-en-frío + `brain:archive`, piloto aquí → pull ×4) · F3 (resonancia empujada por gate #14 + banner cristiano + skill `mantenimiento-general`). | 🔄 F1 next | §50 · bóveda |
| **TODO-31** | 🛡️ **Resiliencia + GC mayor (§49)**: (a) **SPOF** — todo (repos+bóveda+espejos) en 1 cuenta GitHub + 1 disco → respaldo OFFSITE mensual (`git bundle` a medio fuera de GitHub; campo `lastOffsiteBackup` en manifest) — **el medio lo decide Daniel** · (b) ✅ **canario de boot HECHO (§49-bis)**: `boot-gate` BLOQUEA commits si SessionStart no dejó `.boot-marker` fresco (<48h) · (b2) ✅ **guardián bóveda (§49-bis)**: `session-handoff` avisa bóveda-sucia en boot + foto de cierre · (c) runbook recuperación de cuenta en `50-CONFIG-INFRA` (2FA/códigos — verifica Daniel) · (d) GC de `30` (98%): shard L-22/L-26/L-28 → hoja `31-VERIFICACION-UI` + fusión L-04/L-09 (plan en tabla §49 de la bóveda). | 🟡 a/c/d | §49 |

---

## 📝 Bitácora (efímera)

> **▶ 2026-07-20 — Auditoría Nivel-2 #4 CERRADA (§49, Fable, workflow 6 sondas ~850k tok)**: veredicto SANO —
> retrieval frío 5/5 (4 con boot puro) · índice 48/48 sin desync · 0 contradicciones ALTA vs realidad. **Curado en
> este cierre**: 2 datos falsos en boot (constancias ×3 ya cerradas §39 · "35 fidelidad" ya cerrado §48) · footer
> `000000` = PORTAL (no modo obra) · 05 sin SHA (M-01) · **TODO-30 blindado** (tiles sellados + criterio de mapa +
> exención mockup + home excluida) · `20` refrescada (HOME fiel + 5 cards + primitivas) · Poppins acotada a LEGACY ·
> lección de cars prefijada en `60` ×2 · TODO-25 nota de cierre (§30) · /arrendar RESUELTO apéndice (§47) · `00` destilado bajo cap ·
> **M-03** (bóveda compartida sucia otra vez → el gate debe vivir EN el recurso) · bóveda commiteada+pusheada (incl.
> crudos bersaglio huérfanos). **ABIERTO** → TODO-23 (sentencias kernel §49) · TODO-31 (SPOF/canario/GC-30) ·
> TODO-28 #6 (costo 49% > 30% — vigilar). ⛔ NO tocar: HUMO (flag 📣 `05`) · datos Firestore (TODO-22).
