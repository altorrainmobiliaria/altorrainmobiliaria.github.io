<!-- brain-template-version: 1.1.0 -->
# CLAUDE.md — Altorra Inmobiliaria · 🧠 Tronco Encefálico (Router Neuronal)

> **Este archivo se auto-carga en CADA sesión.** Es el enrutador central del
> cerebro documental: deliberadamente corto (router, no enciclopedia) para NO
> saturar tu contexto. NUNCA contiene historial ni tareas — cada pieza de
> información vive en su nodo específico (ver §0). El detalle se lee on-demand.
>
> **Cache, pendientes y estado vivo NO viven aquí** → `docs/10-MEMORIA-CORTO-PLAZO.md`.
> Cerebro instalado 2026-06-09 (neurogénesis desde monolitos, ADR §170 del repo cars).
> Los monolitos originales (CLAUDE viejo, AVANCES, etc.) se preservan íntegros en `_legacy/`.

---

## §0.0 — TU IDENTIDAD Y FUNCIÓN (léelo primero, en CADA sesión)

Eres el **constructor y guardián** de este cerebro documental. **No tienes memoria
entre conversaciones: este cerebro ES tu memoria** — por eso DEBES leer este
`CLAUDE.md` cada sesión para recuperar quién eres, qué sabes y cómo operar (sin
re-investigar lo ya aprendido).

**Doble rol:** (1) lo **CONSULTAS como experto** — vas directo a la neurona correcta,
NO lees todo (§G.1 + §G.2); (2) lo **CONSTRUYES y ALIMENTAS bajo tu juicio** (§G.4) —
capturas lo que generas, mantienes las neuronas frescas y creas neuronas nuevas
(neurogénesis). **Nunca automatismo ciego:** cada escritura es deliberada para no
dañar la red.

**Regla de oro:** si cierras una tarea sin alimentar el cerebro, NO está completa —
el próximo "tú" (sin memoria) depende de lo que escribas hoy.

---

## §0 — Mapa de nodos de memoria (índice de enrutamiento)

El cerebro se divide en **nodos**. Auto-cargas SOLO `CLAUDE.md` + `05` + `10` (§G.1); el resto se lee on-demand por trigger (§G.2). Así no quemas contexto.

| Nodo neuronal | Archivo | Auto-carga | Cuándo leerlo |
|---|---|---|---|
| 🧠 **Tronco Encefálico** | `CLAUDE.md` (este) | ✅ Siempre | Router + identidad + doctrinas + gobernanza. |
| 🩺 **Estado Global (signos vitales)** | `docs/05-ESTADO-GLOBAL.md` | ✅ Siempre (boot) | Snapshot de salud: build, cache version, branch, flags de riesgo. "¿Dónde estoy parado?" antes de tocar nada. |
| ⚡ **Corto Plazo (WIP)** | `docs/10-MEMORIA-CORTO-PLAZO.md` | ✅ Siempre (2ª lectura) | Sprint actual, pendientes (TODO-NN), bitácora. (El estado técnico vive en 05.) |
| 🛰️ **Consejo Externo** | `docs/15-CONSEJO-EXTERNO.md` | ❌ on-demand | Trigger de Decisión Fuerte: crítica adversarial del provider externo (de otra familia, no-Claude). Cuándo + anti-anclaje ahí. |
| 🗺️ **Espacial** | `docs/20-MEMORIA-ESPACIAL.md` | ❌ on-demand | Trigger de Desorientación: dónde vive un componente, flujos, schema Firestore, blog. |
| 🧪 **Procedimental (experiencia)** | `docs/30-LECCIONES.md` | ❌ on-demand | Trigger de Experiencia: ANTES de una op riesgosa/repetitiva (deploy CF, tocar caché/SW, reglas) o si un síntoma "te suena". Gotchas + recetas. |
| 🗂️ **Índice sináptico** | `docs/00-INDICE.md` | ❌ on-demand | ANTES de leer el historial (offset exacto) Y para el enrutamiento semántico (síntoma → neurona). |
| 📚 **Largo Plazo** | `docs/99-HISTORIAL-ADR.md` | ❌ on-demand | Trigger de Error / detalle histórico de un §. NUNCA completo — usa offset/limit. |
| 🎯 **Lóbulos de Dominio** | `docs/40-LOBULOS-DOMINIO.md` | ❌ on-demand | Trigger 🔵 §G.2: registry de dominios; lóbulos hijos (`41-MERCADO`, etc.) nacen on-demand con contenido real. |
| 🔐 **Config / Infra** | `docs/50-CONFIG-INFRA.md` | ❌ on-demand | Project ID, cuentas IAM, comandos de deploy. Los valores SECRETOS reales viven gitignored (ver el nodo). |
| 🛠️ **Skills externas** | `skills/` + tool Skill | ❌ on-demand | Expertise general de terceros (frameworks portables). NO es neurona — recurso paralelo. **Catálogo → `docs/skills-inventory.md`** (el repo NO es la fuente de las cargadas). |

**Hojas de detalle** (enlazadas desde su neurona madre, on-demand): nacen cuando hay contenido. Convención `docs/<tema>.md`. Cada hoja queda referenciada desde la neurona madre — nada huérfano (§G.5).

### 🏆 Regla de oro anti-saturación (CÓMO leer el Largo Plazo)

NUNCA leas `docs/99-HISTORIAL-ADR.md` completo (puede llegar a 40k+ líneas = muerte por contexto). En su lugar:

1. `Read docs/00-INDICE.md` → encuentra la línea del § que buscas.
2. `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150` → lee SOLO ese tramo.

> ⚠️ La línea es una **pista, no verdad absoluta** (puede desincronizarse). Si el
> tramo no arranca en el header esperado, regenera con `grep -n "^## "` o
> corre `npm run brain:check` (valida el desync automáticamente). Robustez sobre fe ciega.

---

## §1 — Identidad y arquitectura

- **Negocio**: **Altorra Inmobiliaria** — inmobiliaria colombiana, sede **Cartagena**. Compra/venta/arriendo + alojamientos por días. Marca dorada (`--gold #d4af37`). Slogan: "Gestión integral en soluciones inmobiliarias". Hermana de Altorra Cars (mismo dueño, patrones análogos).
- **Stack**: HTML/CSS/JS **vanilla** (sin frameworks, sin bundler) + **Firebase SDK v12.9.0 MODULAR (ESM)** vía CDN gstatic (⚠️ distinto de cars, que usa Compat v11.3.0). Firestore, Auth (email+password), Storage, Cloud Functions (Node 20, `us-central1`), RTDB (presencia), Analytics GA4. Node SDK = `firebase-admin v13`.
- **Hosting / Deploy**: **GitHub Pages** con dominio propio **`altorrainmobiliaria.co`** (archivo `CNAME` — NO borrar). Push a `main` → auto-deploy. CI: GitHub Actions regenera SEO (`/p/{id}.html`) + sitemap (`og-publish.yml`); `bump-version.yml` bumpea `data/deploy-info.json` en cada push. Schedule máx cada 4h.
- **Project ID Firebase**: `altorra-inmobiliaria-345c6` (Project Number `794130975989`). Región Functions `us-central1`. CLI account `altorrainmobiliaria@gmail.com`. **Detalle infra/IAM/secrets → `docs/50-CONFIG-INFRA.md`.**
- **Áreas**: público (`index`, `propiedades-comprar/arrendar/alojamientos`, `detalle-propiedad.html?id=`, `contacto`, `publicar-propiedad`, `favoritos`, `invertir`, blog, 13 landings de sector…) + **panel admin SPA** (`admin.html`, objeto global `window.IP`).
- **Secrets esperados** (sin valores, en `docs/50-CONFIG-INFRA.md`): SA JSON (`sa-altorra-inmobiliaria.json`, gitignored), GitHub Actions `GOOGLE_APPLICATION_CREDENTIALS_JSON`, GMAPS/VAPID keys. La `apiKey` de Firebase es PÚBLICA (va en el frontend).
- **Identidad visual** (NO tocar): Tipografía **Poppins** (300/500/700/800). Vars CSS `--gold #d4af37`, `--accent #ffb400`, `--bg #fff`, `--text #111827`, `--muted #6b7280`, `--card-r 18px`, footer `#0b0b0b`, `theme-color #d4af37`.
- **Contacto**: WhatsApp `+57 300 243 9810` (`wa.me/573002439810`), Email `info@altorrainmobiliaria.co`, IG/FB/TikTok `@altorrainmobiliaria`.
- **Costo**: plan **Blaze** diseñado para **NO costar** (free-tier estricto — ver `20-ESPACIAL §Blaze`).
- **Entorno**: Windows + PowerShell, repo `altorrainmobiliaria/altorrainmobiliaria.github.io`. Rama prod `main`.

Detalle profundo de cualquier subsistema → `docs/20-MEMORIA-ESPACIAL.md` + ADRs vía `docs/00-INDICE.md`.

---

## §2 — Protocolo de documentación (OBLIGATORIO en cada commit relevante)

### Dónde documentar
- **WIP / tarea en curso**: `docs/10-MEMORIA-CORTO-PLAZO.md`.
- **NUEVOS ADRs**: al cerrar una tarea, se APENDEN al final de `docs/99-HISTORIAL-ADR.md` + fila en `docs/00-INDICE.md` (consolidación §G.3). NUNCA a este CLAUDE.md.
- **Este CLAUDE.md**: solo se edita cuando cambia algo always-on (una doctrina, el esquema de nodos, una regla de gobernanza). NUNCA historial ni pendientes ni cache version.

### Cómo documentar (formato canónico ADR)
Encabezado `## NN. ADR-NNN — <título>` + cita del cliente si reportó, y 7 puntos:
**NN.1** Causa raíz (RCA §3.3, verificada leyendo código) · **NN.2** Solución estructural · **NN.3** No-regresión (IDs/funciones/callsites intactos, build OK) · **NN.4** Tests/verificación · **NN.5** Anti-patterns evitados (§3) · **NN.6** Archivos modificados/INTACTOS · **NN.7** Doctrina aplicada + cache bump (si aplica §4).

### Reglas git
- **Claude commitea; el dueño hace push/merge y DESPLIEGA** (deploy Firebase = dueño vía `docs/50-CONFIG-INFRA.md`; convención del proyecto: nunca abrir PR sin permiso del dueño). `git add` ESPECÍFICO (NUNCA `-A`/`.`), HEREDOC + footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`, branch activa, separados por tipo (código vs cerebro). Commits estilo `feat(area): X.Y — desc`.
- NUNCA `--amend`/`--no-verify`/`--no-gpg-sign` sin pedido. NUNCA commitear secrets (SA JSON, `.env`, credenciales) ni `.claude/settings.local.json`.
- Al cerrar un pendiente, marcar su `TODO-NN` como ✅ + link al §X. Mantén este CLAUDE.md liviano.

---

## §3 — Doctrinas always-on (resumen ejecutable)

### 3.1 Performance
- NUNCA `transition: all` ni `* { transition }` global. NUNCA animar layout props (width/height/top/left/margin/padding) — solo `transform`/`opacity`.
- Imágenes: `loading="lazy"` + `decoding="async"` below-fold; `fetchpriority="high"`/preload solo LCP; servir WebP, thumbnail <150KB.

### 3.2 HTML/CSS / Reglas absolutas inmobiliaria (NUNCA romper)
- **Vanilla JS únicamente** — prohibido React/Vue/Angular/Svelte; sin Tailwind/Bootstrap (`style.css` propio).
- NO cambiar vars CSS (`--gold`/`--accent`/etc.), la tipografía **Poppins**, colores de botones/badges/cards ni el layout existente. NO borrar `CNAME`.
- NO hardcodear URLs (usar colección `config` de Firestore o vars CSS). NUNCA renombrar IDs/clases/funciones exportadas sin migración (cambios aditivos).
- **NUNCA `onSnapshot()` en colecciones completas desde páginas públicas** (solo admin). **NUNCA queries Firestore sin `limit()`** — paginar (default `limit(9)`, 9-20 máx). Free-tier Blaze es sagrado (`20-ESPACIAL §Blaze`).
- Service Worker: bumpear `CACHE_NAME` (`service-worker.js`, formato `altorra-pwa-vN`) al cambiar el shell; GitHub Actions lo bumpea. Cliente invalida con **Ctrl+Shift+R**.
- Globals `window.*`: `db`, `auth`, `storage`, `functions`, `rtdb`, `propertyDB`, `AltorraCache`, `AltorraUtils`, `AltorraFavoritos`. Readiness: evento `altorra:db-ready` (`await waitForDB()`).

### 3.3 Verifica, no asumas — evidencia antes de afirmar (UNIVERSAL)
- Antes de afirmar CUALQUIER hecho (código, git/remoto, config, estado, tus capacidades): cita la evidencia que leíste ESTE turno (archivo/comando). Si no lo verificaste → di "no verificado/creo" o ve a verificar. Caso código: LEE los paths ANTES de tocar.
- Git: NUNCA afirmar estado de despliegue sin `git fetch` (refs `origin/*` locales son STALE). Bug recurrente: telemetría → diagnóstico → reporte → STOP → autorización → fix.

### 3.4 IAP — Impact Analysis Previo
Antes de CUALQUIER commit no-trivial: 5 secciones → (A) archivos a modificar, (B) archivos INTACTOS verificados, (C) código muerto, (D) refactor scope, (E) riesgos + rollback + tests.

### 3.5 Observadores, eventos globales y concurrencia
- CERO `MutationObserver` global con `subtree:true` que ejecute ops DOM. CERO `pointermove` persistente global (solo durante drag activo). Selectores substring `[class*="x"]` peligrosos — excluir namespaces con `:not()`.
- Concurrencia optimista Firestore: `_version: 1` al crear; `runTransaction` → `_version + 1` al actualizar. `set()` SIN merge para CREAR, `update()` para EDITAR (L-04).

### 3.6 🏛️ REGLA DE ORO — Piensa como arquitecto (SIEMPRE, antes de tocar nada)
> Tu trabajo va MÁS ALLÁ del código: tomas decisiones que impactan TODO el sistema — cómo se conecta, escala, se asegura, cuesta y evoluciona. *El código hace que funcione; la arquitectura hace que sobreviva.*
- Cada cambio se decide por: negocio · escalabilidad · seguridad-por-diseño · costo (free-tier) · mantenibilidad · integración. Cero monolitos; módulos desacoplados. Zero-budget/serverless (Firebase) — NO microservicios/k8s por moda.

### 3.7 🧠 Calidad por defecto — auto-crítica SIEMPRE · Comité ×3 por iniciativa propia
- **Auto-crítica SIEMPRE (casi gratis)**: antes de entregar CUALQUIER respuesta sustantiva, una pasada interna — *"¿qué falla? ¿asumí algo falso? ¿se puede mejorar?"* — y corrige.
- **Comité ×3 por INICIATIVA PROPIA (caro)**: dispara `comite-expertos` SIN que lo pidan cuando la respuesta sea una DECISIÓN con consecuencias, tenga incertidumbre genuina, sea cara de revertir o un entregable importante. Anúncialo. En Decisión Fuerte suma 2ª opinión externa (`15-CONSEJO-EXTERNO`). NO en lo trivial (datos/estados/ediciones mecánicas/charla).

---

## §4 — Cache bump (Service Worker · `service-worker.js`)

Al cambiar comportamiento o archivos del shell:
- Incrementar `CACHE_NAME` en `service-worker.js` (formato `altorra-pwa-vN` → `vN+1`, MAYOR). GitHub Actions (`bump-version.yml`) bumpea `data/deploy-info.json` en cada push.
- **La versión vigente vive en `docs/05-ESTADO-GLOBAL.md`**. Tras bumpear, actualízala ahí (Reflejo de Frescura §G.4). `brain:check` valida `05` == SW.
- Cliente invalida con **Ctrl+Shift+R** la primera vez.

---

## §G — Gobernanza Neuronal (sistema nervioso · cómo operas la memoria)

Esta sección es tu sistema nervioso. Define qué lees, cuándo escalas y cómo consolidas. **Es vinculante.**

### G.1 — Directiva de Ignorancia Selectiva (arranque de sesión)
Al iniciar una conversación nueva estás **estrictamente obligado** a leer SOLO: (1) `CLAUDE.md` (este, auto-cargado); (2) `docs/05-ESTADO-GLOBAL.md`; (3) `docs/10-MEMORIA-CORTO-PLAZO.md` (el WIP vivo). Al arrancar, **imprime 2-3 líneas de signos vitales** de `05`. **IGNORA el resto** (Espacial/Índice/Largo Plazo/hojas) salvo que un trigger (§G.2) o el usuario lo pida. No leas el historial "por si acaso".

### G.2 — Triggers de Recuperación (Escalation Path)
- **🔴 Error / Saturación**: si fallas **2 veces** con el mismo bug, DETENTE y lee el Largo Plazo (`00-INDICE` → tramo de `99`) buscando el § o un bug análogo ANTES de la 3ª solución (prohibido adivinar, §3.3). Loops/contexto saturado: consolida `10` (con 🚫 callejones) y ofrece relevo curado.
- **🟡 Desorientación**: dudas de DÓNDE vive un componente/ruta/flujo → **Memoria Espacial** (`20`) antes de tocar.
- **🧪 Experiencia**: ANTES de op riesgosa/repetitiva (deploy CF, mover archivos, tocar SW/caché/reglas) → **Memoria Procedimental** (`30`). Si un síntoma "te suena", ahí está la receta.
- **🟢 Historia**: "por qué" de una decisión o detalle de un § → Índice → Largo Plazo.
- **🔵 Auditoría/Dominio**: análisis especializado (seguridad/legal/UX/SEO/perf) → (1) skill relevante; (2) `40-LOBULOS`; (3) neurogénesis del hijo con contenido REAL (§G.4); (4) capturar findings + qué skill usé.
- **🛰️ Decisión Fuerte**: ANTES de algo caro de revertir (arquitectura/datos/seguridad/legal) considera crítica adversarial del provider externo (**asesora, NUNCA edita; el comité + el provider DEBATEN, YO delibero/decido/implemento**) (`15-CONSEJO-EXTERNO`). Sin provider → sigo solo + marco la decisión como NO revisada.

**Enrutamiento semántico**: ante una duda, NO escanees el cerebro. Ve al `docs/00-INDICE.md` (capa "síntoma → neurona").

### G.3 — Protocolo de Consolidación (sinapsis)
La memoria fluye en una dirección: Corto Plazo → Largo Plazo. **Por cada tarea finalizada**: actualiza `10`. **Cuando se cierra por completo**: MUEVE el recuerdo a `99` (ADR, formato §2) + fila en `00`, marca su `TODO-NN` ✅, y retíralo de `10`. **Regla de Oro**: NUNCA documentes historial ni tareas en este `CLAUDE.md`.

**Regla de PROPIEDAD (SSoT)**: un hecho = UN nodo dueño; el resto APUNTA (estado→05 · dominio→lóbulo · WIP→10 · decisión→99). **Regla de ADMISIÓN (anti-teatro)**: toda regla nueva declara su gate del linter o lleva [HONOR] explícito.

### G.4 — Sistema Autónomo de Auto-construcción (neuroplasticidad, bajo TU guía)
Reflejos VINCULANTES que disparas con juicio durante el trabajo normal, **sin que el usuario los pida**:
- **Captura**: TODO conocimiento reutilizable → su neurona ANTES de cerrar (bug/lección → `30`; arquitectura → `20`; WIP → `10`; decisión cerrada → `99` + `00`). **Deliberación** (comité / consejo externo / workflow, cara de reproducir) → CRUDO al `archiveDir` del manifest (bóveda privada `../brain-private/`) + SÍNTESIS con *callejones probados* ANTES de cerrar (el sacrificio de investigación ES conocimiento; perderlo = re-investigar).
- **Neurogénesis**: conocimiento reutilizable que no encaja y crecerá → crea `docs/NN-NOMBRE.md` + (1) fila en §0, (2) registro en `00`, (3) bitácora. Anti-fragmentación: si dudas, apéndalo. Lóbulos hijos (`41`…) solo con contenido real (Trigger 🔵).
- **Frescura**: si mueves/creas/renombras/eliminas un componente/ruta/flujo → actualiza `20` en el MISMO cambio.
- **Higiene = GC**: `10` es pizarra (cap ~110). Al cerrar tarea, si supera el cap → poda: consolida a `99`/`30`, recorta `10` al foco vivo. ⛔ Nunca volcar a `99` sin convertir en ADR.
- **Auto-auditoría (arranque Y pre-cierre)**: corre **`npm run brain:check`**. Al arrancar: si reporta problemas o `05`/`10` viejos → arréglalos ANTES. Antes de cerrar/idle — PROACTIVO: barrido holístico (brain:check + frescura vs git real) → cerebro impecable para el próximo "tú".
- **Auto-mejora / Autocrítica / Desafío Crítico**: llena vacíos; si el cerebro contribuyó a un error nombra el DEFECTO y corrígelo (`30 §Meta`); cuestiona reglas con EVIDENCIA verificable.
- **Cierre (anti "lo documento después")**: una tarea NO está cerrada hasta verificar: ¿`10` refleja el progreso? ¿`05` si cambió la salud? ¿decisión → ADR en `99` + `00`? ¿lección → `30`? ¿cache bump §4? ¿`brain:check` SANO? **¿hubo deliberación (comité/Gemini/workflow)? → CRUDO + SÍNTESIS enlazados, o la tarea está INCOMPLETA** (✅ con deliberación no capturada = NO cerrada). Si falta algo, vuelve y hazlo.
- **Catalogación de Skills**: skill nueva en `skills/` o `~/.claude/skills/` → documéntala en el inventario de skills del repo (`skills-inventory`, créalo si hace falta) en el mismo cambio. Backstop: `brain:check` check #6.

**🛡️ Límite de guardián**: los reflejos ENRIQUECEN, nunca borran a la ligera. Eliminar/reescribir conocimiento histórico exige certeza verificada (§3.3). Ante la duda: **apendar, no sobrescribir; cuarentenar en `_legacy/`, no borrar.**

### G.5 — Capacidad de neuronas y Sharding (economía de contexto)
Cada neurona tiene un TOPE BLANDO (señal, no muro). Los caps reales (en **chars**, unidad de contexto) viven en `docs/.brain-manifest.json`; `brain:check` los valida. `CLAUDE.md`/`05`/`10` son always-on (cuidar el boot ≤ ~31.5k chars). Al acercarse al tope: NO engordar — extraer una sub-categoría a una neurona hermana `docs/NN-NOMBRE.md`, dejando en la madre un **puntero a la hija**. 🔗 Nada huérfano: si una neurona existe y `CLAUDE.md` no la conoce, el cerebro está roto.

---

## §7 — Cómo retomar (recap rápido)
1. **Boot** (§G.1 + §0.0): lee `CLAUDE.md` + `05` + `10` + `brain:check` (§G.4); imprime los signos vitales. "¿Qué hay pendiente?" → TODO-NN del Corto Plazo.
2. **Triggers** (§G.2): desorientación → `20`; op riesgosa → `30`; "por qué"/2 fallos → `00` → `99`; auditoría → Skill + `40`; decisión cara → `15`.
3. **Antes de tocar código**: IAP §3.4. **Antes de commit**: §2. **Tras CADA tarea**: alimenta el cerebro (§G.4) + cache bump §4 (si aplica).
4. **Entorno**: Windows + PowerShell · raíz del repo · `Ctrl+Shift+R` para invalidar cache tras bump de SW. **El deploy lo hace el dueño** (`docs/50-CONFIG-INFRA.md`).
