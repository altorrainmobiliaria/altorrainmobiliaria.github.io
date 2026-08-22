# 🖥️ 34 — DOCTRINA DE CÓDIGO (hoja hija de `30-LECCIONES`)

> **Trigger 🖥️: LÉEME ANTES de escribir o editar código** (CSS/JS/HTML/Astro). El router
> (`CLAUDE.md §3.2`) conserva SOLO las reglas cuyo incumplimiento **cuesta dinero o es irreversible**;
> el resto —stack real, performance, CSS del legacy, observadores— vive aquí. [HONOR: no hay gate que
> compruebe que me leíste; el gate #27 solo caza las rutas fantasma que cite.]
>
> **DÓNDE vive cada archivo → `20-MEMORIA-ESPACIAL`** (dueño del inventario) · **por qué se decidió →
> `99` vía `00`** · **gotchas ya pagados → `30`**.
> Nació el 2026-08-03 en la poda del router (ADR §84): nada de esto se inventó aquí — todo venía de
> `CLAUDE.md §3.1/§3.2/§3.5`, que se auto-cargaban en CADA sesión aunque casi nunca se tocara código.

---

## §Los dos mundos (hasta el cutover)

|  | **LEGACY** (`admin.html`, sitio viejo) | **PORTAL** (`portal/`, greenfield) |
|---|---|---|
| Build | ninguno — HTML/CSS/JS **vanilla** | **Astro + islas** (stack SELLADO, ADR §16) |
| Firebase | SDK **modular (ESM)** vía CDN gstatic — **≠ cars, que usa Compat v11** | ídem modular |
| Estilos | `style.css` propio + tipografía **Poppins** | `tokens.css` = SSoT + Cormorant Garamond / Hanken Grotesk |
| SW / `CACHE_NAME` | ✅ rige (`CLAUDE.md §4`) | ❌ el portal aún no tiene SW |

- **Versiones exactas, módulos, globals y censo de Cloud Functions → `20 §Stack`** (dueño único: no
  se copian aquí, que fue justo la triple contabilidad que la auditoría #6 tuvo que deshacer).
- **Prohibido en AMBOS mundos**: React/Vue/Angular/Svelte · Tailwind/Bootstrap. Astro es el **build**
  del portal, no una excusa para una SPA pesada: JS mínimo, islas, free-tier sagrado, `limit(9)`,
  cero `onSnapshot` público (esas dos últimas son reglas de router, `CLAUDE.md §3.2`).

## §Performance (ambos mundos) — ex `CLAUDE.md §3.1`

- NUNCA `transition: all` ni `* { transition }` global. NUNCA animar layout props
  (width/height/top/left/margin/padding) — **solo `transform` y `opacity`**.
- Imágenes: `loading="lazy"` + `decoding="async"` below-fold; `fetchpriority="high"`/preload **solo en
  el LCP**; servir **WebP**, thumbnail **<150KB**. (Precedente medido: §24.10 bajó 5.5MB → 546KB, −90%.)

## §HTML/CSS del LEGACY (congelado — no "mejorar")

- NO cambiar vars CSS (`--gold`/`--accent`/…), la tipografía **Poppins**, colores de
  botones/badges/cards ni el layout existente.
- El portal **NO hereda** esto: su design system está sellado aparte (`CLAUDE.md §1`, ADR §23-§23.9).
- Las reglas de **contrato** —no hardcodear URLs, no renombrar IDs/clases/funciones exportadas, no
  borrar `CNAME`— se quedaron en el router (`§3.2`): rompen callsites o el dominio, y eso es irreversible.

## §Observadores, eventos globales y concurrencia — ex `CLAUDE.md §3.5`

- **CERO `MutationObserver` global con `subtree:true`** que ejecute operaciones DOM.
- **CERO `pointermove` persistente global** — solo durante un drag activo.
- Los selectores substring `[class*="x"]` son **peligrosos**: excluye namespaces ajenos con `:not()`.
- **Concurrencia Firestore** (`set()` SIN merge para CREAR · `update()` para EDITAR · `_version`
  optimista create==1/update==prev+1 vía `runTransaction`): la regla y sus trampas viven completas en
  **`30` L-09** (dueño único, con el caso de la ventana de crash y el sello anti-adelantamiento).

## §CSS del PORTAL — el acotado de Astro y los nodos de runtime (§117)

**Antes de escribir un `<style>` en una página que renderice contenido por JS, lee esto.** Astro
compila `.fila` a `.fila[data-astro-cid-XXXX]` y le pone el atributo a los elementos **de la
plantilla**. Un nodo hecho con `document.createElement` NO lo lleva → la regla no le aplica **jamás**,
sin error, sin warning y con el build verde. Costó 4 ADRs de tablas despintadas.

- **Regla**: toda clase que un script ASIGNE a un nodo nuevo tiene que estar en un `<style is:global>`
  o marcada `:global(.clase)`. **Gate: `npm run verify:css`** (en CI, antes del build).
- Bloque entero global solo si la página tiene **namespace exclusivo** (`gx-`) y su DOM es casi todo
  de runtime; si no, `:global()` regla a regla.
- Al globalizar, ancla al contenedor de la página toda regla apoyada en una clase del design system
  (`.gx-root .alt-input.is-mal`) o se aplicará a todo el sitio.
- `classList.add/toggle` sobre un elemento de la plantilla **no** falla: ese ya lleva el atributo.
