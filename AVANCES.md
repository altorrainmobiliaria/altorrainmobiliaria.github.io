# AVANCES.md — Altorra Inmobiliaria
## Bitácora de implementación hacia plataforma dinámica con Firebase

> Documento vivo. Se actualiza con cada microfase completada.
> Última actualización: 2026-04-15 (sync en vivo + limpieza UX home)

---

## POR QUÉ EXISTEN CLAUDE.md Y ALTORRACARSCLAUDE.md EN ESTE REPO

### `CLAUDE.md` — La guía maestra de migración

Este archivo es la **memoria técnica del proyecto**. Fue creado específicamente para que Claude (el asistente de IA que ejecuta el trabajo) no pierda contexto entre sesiones. Dado que cada conversación con Claude comienza desde cero, `CLAUDE.md` actúa como el documento de onboarding que le explica:

- Qué es Altorra Inmobiliaria y qué problema se quiere resolver
- Cómo está construida hoy (estructura de archivos, JS, CSS, formularios)
- Qué restricciones NO se pueden romper (diseño visual, tipografía, colores)
- El schema completo de Firestore que se va a implementar
- Las reglas de seguridad de Firestore y Storage
- Las convenciones de código que se deben seguir
- El plan de migración completo en 9 etapas
- Los límites del plan Blaze de Firebase que NUNCA se deben exceder

Sin este archivo, cada sesión con Claude requeriría explicar todo desde cero, lo que desperdiciaría la licencia de $20/mes.

### `ALTORRACARSCLAUDE.md` — La referencia arquitectónica de Altorra Cars

Altorra Cars (`altorracars/altorracars.github.io`) es la versión avanzada del mismo concepto aplicado a vehículos. **Ya está 100% integrada con Firebase** y es el modelo a replicar en Inmobiliaria.

Este archivo es el `CLAUDE.md` que el equipo de Altorra Cars generó para su propio proyecto. Contiene:

- Implementación real y funcional de patrones que se necesitan copiar
- Sistema de presencia en tiempo real (RTDB) con guards de seguridad
- Sistema de caché de 4 capas que ya resuelve problemas conocidos
- Sistema de drafts (borradores) para propiedades
- Errores reales que aparecieron en Cars y cómo se corrigieron
- Migración de schema documentada

Tener ambos documentos en el repo garantiza que Claude siempre trabaje con el contexto correcto y replique exactamente los patrones que ya funcionan en producción en Cars.

---

## ESTADO GENERAL

```
FASE PREVIA — Dominio y correo:            ✅ Completado
FASE DOC    — CLAUDE.md + ALTORRACARSCLAUDE.md: ✅ Completado
Etapa 0-A   — Archivos base Firebase:      ✅ Completado
Etapa 0-B   — Proyecto Firebase + servicios: ✅ Completado (2026-04-10)
Etapa 0-C   — Cloud Functions deploy:      ⚠️  Parcial (createManagedUserV2 OK, resto requiere re-deploy: ver DEPLOY-RUNBOOK.md)
Etapa 1     — Lectura dinámica Firestore:  ✅ Código listo — falta poblar Firestore (npm run upload)
Etapa 2     — Formularios → Firestore:     ⚠️  Código listo — falta re-deploy de Functions
Etapa 3     — Panel de administración:     ✅ Código listo — updateUserRoleV2 añadida en esta sesión
Etapa 4     — Imágenes en Cloud Storage:   ✅ Script listo (bucket name corregido, ejecutar npm run migrate-images)
Etapa 5     — SEO dinámico + CI/CD:        ✅ Script + workflow listos (bug del if: arreglado, falta secret GOOGLE_APPLICATION_CREDENTIALS_JSON)
Etapa 6     — Favoritos sincronizados:     ✅ Completado (funciona local + sync Firebase automático)
Etapa 7     — Analytics y Marketing:       ✅ Completado (GA4 activa con measurementId)
Etapa 8     — Mejoras comerciales:         ✅ Código listo — claves centralizadas en window.AltorraKeys (ver DEPLOY-RUNBOOK.md)
```

**📖 Runbook del propietario:** `DEPLOY-RUNBOOK.md` contiene los 6 pasos
pendientes con comandos PowerShell exactos. Cuando todos estén ejecutados,
la migración estará 100% completa.

---

## REGISTRO DE FASES COMPLETADAS

---

### ✅ A10 — Promo banner editable desde Firestore (2026-04-17)

**Contexto:** El admin necesita poder publicar promociones o avisos
temporales en la home sin tocar código. Firestore permite editar el
documento `config/promo` desde la consola o el futuro admin panel.

**Qué se añadió:**

1. **HTML en `index.html`:** `<div id="promo-banner">` entre trust bar y
   hub section, `display:none` por defecto (se muestra solo si hay promo).
2. **JS en `scripts.js`:** IIFE que lee `config/promo` con `getDoc()` (1
   lectura, timeout 4s). Campos: `activo` (bool), `texto`, `enlace`,
   `enlaceTexto`, `id`. Botón cerrar guarda dismissal en localStorage
   por ID (no vuelve a mostrarse tras cerrar). Sin `onSnapshot`.
3. **CSS en `style.css`:** `.promo-banner` con gradient suave dorado,
   `.promo-close` posicionado absolute. Responsive en ≤860px.

**Archivos tocados:**
- `index.html` — +3 líneas.
- `scripts.js` — +44 líneas.
- `style.css` — +36 líneas.

---

### ✅ A8+A9 — busqueda.html unificada + chips activos + banner (2026-04-17)

**Contexto:** Las páginas de listado solo mostraban propiedades de una
operación. No había forma de buscar en todo el catálogo, ni feedback
visual de los filtros activos.

**Qué se añadió:**

1. **`busqueda.html` (nuevo):** página de búsqueda unificada cross-operación
   con selector Todas/Venta/Arriendo/Por días, filtros avanzados
   colapsables, sort, paginación y cards con favoritos + WhatsApp.
2. **`listado-propiedades.js`:** modo `IS_BUSQUEDA` que carga todas las
   propiedades sin filtrar por operación. `getPriceLabel()` detecta la
   operación de cada propiedad para mostrar el sufijo correcto (COP/mes/noche).
   Funciones nuevas: `renderSearchBanner()` (banner "Resultados para: X"
   con botón ✕), `renderActiveChips()` (chips removibles por filtro activo),
   `reapply()` (re-render unificado usado por Apply/Clear/chips).
3. **3 listados existentes** (`propiedades-comprar/arrendar/alojamientos.html`):
   añadidos contenedores `#searchBanner` y `#activeChips` + CSS inline.

**Archivos tocados:**
- `busqueda.html` — nuevo (~200 líneas).
- `js/listado-propiedades.js` — +70 líneas (IS_BUSQUEDA, chips, banner, reapply).
- `propiedades-comprar.html` — +6 líneas (containers + CSS).
- `propiedades-arrendar.html` — +6 líneas.
- `propiedades-alojamientos.html` — +6 líneas.

---

### ✅ E1.3 — JSON-LD RealEstateAgent + LocalBusiness + BreadcrumbList (2026-04-17)

**Contexto:** Google Rich Results requiere schemas estructurados para
mostrar información enriquecida en búsquedas. El sitio solo tenía un
Organization genérico sin dirección, teléfono ni tipo de negocio.

**Qué se cambió:**

1. **RealEstateAgent + LocalBusiness** (schema dual en `scripts.js`):
   - `@type: ["RealEstateAgent", "LocalBusiness"]` — posiciona ante Google
     como agente inmobiliario Y negocio local.
   - Incluye: nombre, logo, teléfonos, email, dirección (Cartagena, Bolívar,
     CO), coordenadas geo, areaServed, horarios, redes sociales.
2. **BreadcrumbList dinámico:** se genera automáticamente en cada página
   basándose en `location.pathname` y `document.title`. Home = 1 nivel,
   subpáginas = 2 niveles (Inicio → Página actual).
3. **Reemplaza** el Organization genérico anterior (que solo tenía name,
   url, logo, sameAs).

**Archivos tocados:**
- `scripts.js` — sección JSON-LD reescrita (+61/−12 líneas).

---

### ✅ E1.1 + E1.2 — Meta tags, canonical y OG (2026-04-17)

**Contexto:** El sitio tenía meta tags inconsistentes: títulos genéricos
sin "Cartagena", descripciones cortas sin keywords, canonical faltante en
13 páginas y OG tags incompletos en 6 páginas. Esto penaliza tanto el
ranking como la apariencia al compartir en redes.

**Qué se cambió:**

1. **Títulos SEO mejorados** en 9 páginas: se agregó "Cartagena" en
   listados y home, se estandarizó formato "Página | Altorra Inmobiliaria".
2. **Descriptions** más descriptivas con keywords relevantes (compra, venta,
   arriendo, Cartagena, asesoría jurídica).
3. **Canonical URLs** añadidos en 9 páginas que no lo tenían:
   propiedades-comprar, propiedades-arrendar, propiedades-alojamientos,
   contacto, quienes-somos, publicar-propiedad, favoritos.
4. **OG tags** (title, description, url, type, image) consistentes y
   completos en todas las páginas indexables.
5. **Páginas noindex** (gracias, servicios-*, turismo) se omitieron.

**Archivos tocados:** index.html, propiedades-comprar.html,
propiedades-arrendar.html, propiedades-alojamientos.html, contacto.html,
quienes-somos.html, publicar-propiedad.html, favoritos.html,
detalle-propiedad.html.

---

### ✅ A7 — Testimonios desde Firestore/reviews.json (2026-04-17)

**Contexto:** El JS para cargar reseñas ya existía en `scripts.js`
(sección #2) — intenta Firestore colección `resenas` primero, con
fallback a `reviews.json`. Pero no había sección visible en la home que
contuviera el elemento `#google-reviews` donde se renderizan.

**Qué se añadió:**

1. **HTML en `index.html`:** nueva `<section class="testimonios-section">`
   con:
   - Título "Lo que dicen nuestros clientes".
   - Enlace "Ver en Google →" al perfil de Maps.
   - Rating bar: ★★★★★ 5.0 en Google Maps.
   - Contenedor `<div id="google-reviews" class="reviews-wrap">` donde
     el JS ya existente inyecta las tarjetas de reseña.
2. **CSS en `style.css`:** bloque Testimonios con `.testimonios-rating-bar`
   flex, estrellas doradas con `var(--accent)`.
3. **Sin JS nuevo:** la sección #2 de `scripts.js` ya maneja todo
   (Firestore → fallback → render 3 aleatorias).

**Archivos tocados:**
- `index.html` — +14 líneas de markup.
- `style.css` — +18 líneas del bloque Testimonios.

---

### ✅ A6 — Sección "Barrios premium" (2026-04-17)

**Contexto:** Cartagena se divide en barrios con identidad propia y
niveles de valorización distintos. Una sección visual que destaque las
zonas premium ayuda a posicionar a Altorra como especialista en la ciudad
y dirige tráfico segmentado al listado.

**Qué se añadió:**

1. **HTML en `index.html`:** nueva `<section class="barrios-section">` con
   `.barrios-grid` de 6 `.barrio-card`:
   - Bocagrande ("Frente al mar · Alta valorización").
   - Manga ("Tradición · Vista a la bahía").
   - Castillogrande ("Exclusividad · Tranquilidad").
   - Centro Histórico ("Patrimonio UNESCO · Renta turística").
   - Crespo ("Cerca al aeropuerto · Residencial").
   - Manzanillo ("Playa privada · Proyectos nuevos").
   Cada tarjeta tiene pin SVG dorado + nombre + tagline, y enlaza a
   `propiedades-comprar.html?search=BARRIO`.
2. **CSS en `style.css`:** bloque Barrios con fondo gradient sutil
   `#fffdf6→#fff`, borde dorado suave, hover `translateY(-3px)` + sombra.
   Responsive: 3 cols → 2 cols (≤860px) → 1 col (≤480px).
3. **Sin JS:** enlaces estáticos que pasan `?search=` al listado, donde
   la búsqueda de texto libre ya matchea contra `neighborhood`.

**Archivos tocados:**
- `index.html` — +56 líneas de markup.
- `style.css` — +62 líneas del bloque Barrios.

---

### ✅ A5 — Sección "Explora por tipo" (categorías visuales) (2026-04-17)

**Contexto:** Los usuarios necesitan una forma rápida de navegar el
catálogo por tipo de inmueble sin pasar por el buscador. Un grid visual
con iconos reconocibles acelera la decisión.

**Qué se añadió:**

1. **HTML en `index.html`:** nueva `<section class="cat-section">` con
   `.cat-grid` de 6 `.cat-card`:
   - Apartamento, Casa, Lote, Oficina, Local, Bodega.
   - Cada tarjeta tiene icono SVG inline (sin imágenes externas) y enlaza
     a `propiedades-comprar.html?type=X`.
2. **CSS en `style.css`:** bloque Cat con grid 6 cols, hover
   `translateY(-4px)` + sombra dorada + borde resaltado. Responsive a
   3 cols (≤860px) y 2 cols (≤480px).
3. **Sin JS:** enlaces estáticos que pasan `?type=` al listado, donde
   `listado-propiedades.js` ya lo captura como filtro.

**Archivos tocados:**
- `index.html` — +52 líneas de markup.
- `style.css` — +56 líneas del bloque Cat.

---

### ✅ A4 — Carrusel "Recién publicadas" unificado (2026-04-17)

**Contexto:** La home tenía 3 carruseles independientes (Venta, Arriendo,
Por días) que se mostraban/ocultaban según el inventario de cada operación.
Esto fragmentaba la vista, generaba secciones vacías con propiedades
limitadas y no comunicaba la idea de "novedades".

**Qué se añadió:**

1. **HTML en `index.html`:** reemplazo de las 3 secciones por una sola
   `<section class="recientes-section">` con:
   - Título "Recién publicadas".
   - Barra de chips (`role="tablist"`): Todas | Venta | Arriendo | Por días.
   - Un único `#carouselRecientes` con flechas izquierda/derecha.
   - Enlace "Ver todo →" que actualiza su `href` según el chip activo.
2. **JS en `scripts.js`:** sección #5 reescrita:
   - Carga todas las propiedades ordenadas por fecha (`sort: 'newest'`).
   - Filtro en memoria por chip activo (sin queries adicionales a Firestore).
   - Máximo 12 tarjetas. Skeleton cards mientras carga.
   - `buildCard()` infiere el mode (venta/arriendo/dias) del `.operation` de
     cada propiedad para mostrar sufijo de precio correcto.
   - Escucha `altorra:db-refreshed` y `altorra:cache-invalidated` para
     refresco en tiempo real.
3. **CSS en `style.css`:** `.recientes-chips` flex con `.recientes-chip`
   pill (border-radius 999px), estado `.active` con gradient gold→accent.

**Archivos tocados:**
- `index.html` — −48 líneas (3 secciones), +22 líneas (1 sección unificada).
- `scripts.js` — reescritura IIFE #5 (~180 → ~170 líneas).
- `style.css` — +30 líneas (bloque chip).

**Criterio de éxito:** La home muestra un solo carrusel con todas las
propiedades más recientes. Los chips filtran instantáneamente sin recarga.

---

### ✅ A11 — Sección "Todo en un lugar" (3 columnas CTA) (2026-04-16)

**Contexto:** Cars tiene una sección de "hub" que agrupa los caminos
principales del usuario. Inmobiliaria replica la idea con 3 tarjetas
grandes para dirigir el flujo hacia Comprar / Arrendar / Invertir desde la
home, justo arriba del bloque "Publica tu propiedad".

**Qué se añadió:**

1. **HTML en `index.html`:** nuevo `<section class="hub-section">` con 3
   `.hub-card`:
   - **Comprar** → `propiedades-comprar.html` (icono casa).
   - **Arrendar** → `propiedades-arrendar.html` (icono llave/casa).
   - **Invertir** → `turismo-inmobiliario.html` (icono gráfica).
   Cada tarjeta tiene icono SVG, título, descripción corta y CTA "→".
2. **CSS en `style.css`:** bloque Hub con gradient sutil, hover
   `translateY(-4px)` + sombra dorada y `border-color` resaltado. Responsive
   a 1 columna en ≤860px.
3. **Accesibilidad:** `aria-labelledby` + `aria-label` por tarjeta;
   `aria-hidden` en los iconos SVG.

**Archivos tocados:**
- `index.html` — +34 líneas de markup.
- `style.css` — +82 líneas del bloque Hub.
- Sin JS (enlaces estáticos a páginas existentes).

**Criterio de éxito:**
- [x] Las 3 tarjetas se ven igual en desktop (grid 3 cols) y se apilan en
      móvil (1 col) con `:hover` suave.
- [x] Respeta `--gold` / `--accent` — no se inventaron colores nuevos.
- [x] Los enlaces apuntan a páginas que ya existen en el repo.

---

### ✅ A3 — Featured Week Banner como carrusel dinámico (2026-04-16)

**Contexto:** Existía una versión simple de `featured-week-banner.js` que
renderiza UNA sola propiedad. Cars usa el patrón de carrusel con `#fw-*`
(track, dots, prev/next, live region). A3 lleva Inmobiliaria al mismo patrón
manteniendo la API pública `FeaturedBanner.init(selector)`.

**Qué cambió:**

1. **`selectFeatured()`** ahora devuelve las TOP 3 propiedades válidas
   (prioridad > 0 o featured), ordenadas por `prioridad` → `featured` →
   `added/createdAt` desc.
2. **Shell del carrusel** inyectado en el mismo container existente
   (`#featured-banner-container`):
   - `<div id="fw-banner">` con `role="region"`
   - `#fw-viewport + #fw-track` (translateX por slide)
   - Botones `#fw-prev` / `#fw-next`
   - `#fw-dots` con `role="tablist"` y `aria-selected`
   - `#fw-live` `aria-live="polite"` para anunciar slide actual
3. **Rotación automática** cada 6s con `state.paused` activado por
   `mouseenter/focusin` y liberado en `mouseleave/focusout`. Click en dots o
   flechas reinicia el timer vía `restart()`.
4. **Edge cases:**
   - 0 slides válidos → oculta `<section>` completo (preserva comportamiento
     anterior) y limpia `localStorage`.
   - 1 slide → oculta prev/next/dots.
   - DB refresca (`altorra:db-refreshed`) → recalcula y repinta.
5. **Estilos inline** inyectados una sola vez bajo `#fw-styles`. Paleta
   dorada (`--gold` / `--accent`) conservada. Responsive a 640px (slide
   vertical).

**Archivos tocados:**
- `js/featured-week-banner.js` — reescritura completa (+209, -171 líneas
  netas). Sin tocar `index.html` ni `style.css` (API preservada).

**Criterio de éxito:**
- [x] `node --check js/featured-week-banner.js` → sintaxis válida.
- [x] Solo se inyectan los estilos una vez (`#fw-styles` guard).
- [x] `FeaturedBanner.init('#featured-banner-container')` sigue funcionando
      sin cambios en `index.html`.
- [x] Accesibilidad: `aria-live`, `aria-selected`, `aria-label` en controles.

---

### ✅ A2 — Trust bar con stats en vivo (2026-04-16)

**Contexto:** Cars muestra bajo el hero una franja con 2 stats dinámicos +
1 fijo con icono. Inmobiliaria replica el patrón para reforzar percepción de
actividad y cobertura sin necesidad de reseñas manuales.

**Qué se añadió:**

1. **HTML:** `<aside class="trust-bar">` insertado entre el hero y la sección
   "Publica tu propiedad" en `index.html`. Contiene 3 `.trust-item`:
   - `#trustStatPropiedades` con `<strong class="trust-num">` (dinámico).
   - `#trustStatCiudades` con `<strong class="trust-num">` (dinámico).
   - Item fijo "Respaldo legal y financiero" con icono de estrella.
2. **CSS en `style.css`:** gradiente dorado sutil top/bottom, separadores "•",
   colapso de separadores en pantallas <640px. Mantiene `--gold`/`--accent`.
3. **JS en `scripts.js`:** IIFE `paint()` que lee `window.propertyDB.properties`,
   filtra activas (`available !== 0 && disponible !== false`) y calcula
   `new Set(p.city)`. Se engancha a:
   - `DOMContentLoaded`
   - `altorra:db-ready`
   - `altorra:db-refreshed`
   - `altorra:cache-invalidated`
4. **ARIA:** `aria-live="polite"` en cada span dinámico; `aria-label` en el aside.

**Archivos tocados:**
- `index.html` — +24 líneas de markup.
- `style.css` — +49 líneas (bloque Trust Bar).
- `scripts.js` — +28 líneas (IIFE paint + listeners).

**Criterio de éxito:**
- [x] `node --check` OK en los archivos JS.
- [x] Los números reaccionan cuando Firestore refresca el dataset.
- [x] No rompe mobile (≤640px): se colapsan separadores, la franja queda
      compacta centrada.

---

### ✅ A1c — ARIA combobox completa + indicador fuzzy "~" (2026-04-16)

**Contexto:** El smart-search ya corrige typos con Damerau-Levenshtein, pero el
usuario no tenía pista visual de que el resultado vino por corrección ortográfica.
Además, el patrón ARIA de combobox no estaba completo (aria-expanded/controls/
activedescendant ausentes), bloqueando parte del acceso con lectores de pantalla.

**Qué se añadió:**

1. **ARIA combobox completa en `#f-search` y `#f-city`:**
   - `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`
   - `aria-controls="smart-search-dropdown"`
   - `aria-expanded` se actualiza al `show()`/`hide()` del dropdown
   - `aria-activedescendant` apunta al `id` del item con foco del teclado
2. **ID único por opción** — `ss-opt-0`, `ss-opt-1`, ... para grupos,
   propiedades y recientes.
3. **`aria-selected`** alterna `true`/`false` con las flechas.
4. **Indicador fuzzy "~":** badge dorado pequeño junto al título cuando
   `p.__isFuzzy === true`. Se marca fuzzy cuando `parseQuery` aplicó corrección
   de typo Y el match del property no se cumple con los tokens originales
   (`tokensHitStrong(originals, f) === false`).
5. **`parseQuery`** ahora también expone `originals[]` y `hadTypo:boolean`
   sin romper callers existentes.

**Archivos tocados:**
- `js/smart-search.js` — +59 líneas netas.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] Badge "~" aparece SOLO en resultados corregidos, no en matches exactos.
- [x] `aria-expanded` cambia con show/hide, `aria-activedescendant` apunta al
      item con foco de teclado y se limpia al cerrar el dropdown.

---

### ✅ A1b — Sugerencias agrupadas por barrio/tipo/ciudad con contador (2026-04-16)

**Contexto:** Extensión natural del smart-search. Cars agrupa resultados por
"Marca · N vehículos" en su dropdown. Inmobiliaria adopta el patrón adaptado al
dominio: barrio, tipo de propiedad y ciudad, con contador por categoría.

**Qué se añadió:**

1. **`buildGroupSuggestions(query, allProps)`** — detecta coincidencias de la
   query contra `p.neighborhood`, `p.type` (+ `TYPE_LABEL` en ES) y `p.city`.
   Retorna hasta 3 grupos ordenados por `count` desc. Respeta `available` /
   `disponible`.
2. **`renderGroups(groups)`** — renderiza sección "Sugerencias" arriba de las
   propiedades individuales, con icono específico por `kind` (pin, casa, ciudad),
   label en negrita y badge redondeado `N propiedades`.
3. **`buildGroupHref(group)`** — resuelve destino según `#op` seleccionado
   (comprar/arrendar/alojar) y arma los query params:
   - `barrio` → `?search={barrio}` (listado filtra en descripción + hood)
   - `tipo`   → `?type={type}&city={city?}`
   - `ciudad` → `?city={city}`
4. **Teclado** — `ArrowUp/ArrowDown/Enter` ahora incluye grupos, propiedades y
   recientes (selector `.ss-group-item, .ss-item, .ss-recent-item`).

**Archivos tocados:**
- `js/smart-search.js` — +119 líneas netas, sin tocar `searchProps()` ni vocab.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] Grupos aparecen solo cuando hay matches reales (count ≥ 1).
- [x] Click en grupo navega al listado correcto según operación elegida.

---

### ✅ A1a — Hero search: búsquedas recientes + atajo "/" (2026-04-16)

**Contexto:** Primera micro-fase del plan unificado tras revisar el repo vivo de
Altorra Cars. El `js/smart-search.js` actual ya supera a Cars en typos
(Damerau-Levenshtein), parseo de presupuesto, sinónimos y re-ranking por clicks.
Faltaban tres cosas que Cars sí tiene y aportan UX directa.

**Qué se añadió (sin tocar la lógica semántica existente):**

1. **Búsquedas recientes** en `localStorage` (clave `altorra:hero-recent-searches`,
   máx. 5). Helpers `getRecent()`, `saveRecent()`, `removeRecent()`.
2. **Render de recientes al enfocar el hero** (`#f-search`) cuando el input está
   vacío — cada fila con icono de reloj, texto y botón × para eliminar. Al hacer
   clic en una reciente, se rellena el input y dispara la búsqueda automática.
3. **Guardado automático** en dos puntos de intención:
   - Al enviar el formulario `#quickSearch` (click en "Buscar" o Enter).
   - Al hacer clic en una sugerencia de propiedad (se guarda el query que la
     produjo, detectado vía `document.activeElement`).
4. **Atajo `/`** global: enfoca `#f-search` desde cualquier parte de la página,
   respetando inputs/textareas/selects activos y `contenteditable`. En blanco,
   abre las recientes directamente.

**Archivos tocados:**
- `js/smart-search.js` — +103 líneas netas, sin cambiar el motor de búsqueda.

**Criterio de éxito:**
- [x] `node --check js/smart-search.js` → sintaxis válida.
- [x] El dropdown existente (singleton `DD`) se reutiliza; no se crea uno nuevo.
- [x] El comportamiento previo (typos, presupuesto, features, click-ranking)
      queda intacto — solo se añade la capa de recientes sobre el mismo `DD`.

**Qué sigue (A1b):** agrupar sugerencias por barrio/tipo con contador de
propiedades (ej: "Bocagrande · 8 propiedades") como hace Cars con marca/modelo.

---

### ✅ SESIÓN AUDITORÍA Y FIXES (2026-04-10)

**Contexto:** Al revisar los MDs y auditar el estado real del código, se encontraron
6 bugs/huecos que impedían que "todo lo marcado como listo" funcionara de verdad
en cuanto el propietario ejecute los pasos pendientes. Todos arreglados en esta sesión.

**Bugs arreglados:**

1. **Bucket name incorrecto en `scripts/migrate-images-to-storage.mjs`** — estaba
   hardcodeado `altorra-inmobiliaria.appspot.com` pero el proyecto real es
   `altorra-inmobiliaria-345c6.firebasestorage.app`. Ahora es configurable con
   variable de entorno `STORAGE_BUCKET` y el default apunta al bucket correcto.

2. **Placeholder de Google Maps API key expuesto en `js/mapa-propiedades.js`** —
   había una key de aspecto real pero ficticia. Ahora la key se lee desde
   `window.AltorraKeys.gmapsApiKey` (centralizada en `firebase-config.js`).
   Si falta, el mapa muestra un mensaje claro "Mapa no disponible" en vez de romperse.

3. **Placeholder VAPID key en `js/push-notifications.js`** — mismo patrón. Ahora
   se lee desde `window.AltorraKeys.vapidKey`. Si no está configurada, el botón
   de suscripción se oculta automáticamente y `requestPermission()` retorna null
   sin errores.

4. **Función `updateUserRoleV2` faltante en `functions/index.js`** — `admin-users.js`
   la llamaba con `httpsCallable` pero no estaba definida en el backend, lo que
   habría roto el cambio de rol desde el panel admin. Añadida con la misma
   validación de `requireSuperAdmin` + guard anti-auto-degradación.

5. **Bug en `.github/workflows/og-publish.yml`** — la condición
   `if: ${{ env.GOOGLE_APPLICATION_CREDENTIALS_JSON != '' }}` intentaba leer una
   variable de entorno que solo existe dentro del propio step, por lo que siempre
   evaluaba a truthy aunque el secret no existiera. Ahora se usa un env a nivel
   de job (`HAS_FIREBASE_CREDS`) para elegir entre Firestore y el fallback a
   `data.json` correctamente.

6. **Script `migrate-images` no expuesto en `package.json`** — añadido como
   `npm run migrate-images`.

**Otras mejoras:**

- Se creó `DEPLOY-RUNBOOK.md` en la raíz: documento ejecutable con los pasos
  exactos (comandos PowerShell) que el propietario debe correr para terminar
  los 6 bloqueantes pendientes. Incluye: fix Eventarc, subir propiedades,
  migrar imágenes, configurar secret de GitHub Actions, Google Maps key y
  VAPID key. También tiene checklist de verificación final y troubleshooting.

- Comentario de cabecera de `js/firebase-config.js` simplificado: ya no dice
  "TODO reemplazar credenciales" porque las credenciales ya están puestas.
  Explica el rol de `window.AltorraKeys` como único bloque que el propietario
  necesita editar para las claves opcionales.

**Archivos modificados en esta sesión:**
```
js/firebase-config.js              (+window.AltorraKeys, docs actualizada)
js/mapa-propiedades.js             (lee gmapsApiKey desde AltorraKeys + fallback limpio)
js/push-notifications.js           (lee vapidKey desde AltorraKeys + no-op si falta)
functions/index.js                 (+updateUserRoleV2, actualiza header de docs)
scripts/migrate-images-to-storage.mjs (bucket correcto + env STORAGE_BUCKET)
.github/workflows/og-publish.yml   (HAS_FIREBASE_CREDS a nivel de job)
package.json                       (+script migrate-images)
DEPLOY-RUNBOOK.md                  (NUEVO — runbook para el propietario)
AVANCES.md                         (esta sección)
```

**Lo que sigue bloqueado hasta que el propietario ejecute el runbook:**
- Fix de permisos Eventarc para completar deploy de las 6 Cloud Functions restantes
- Ejecutar `npm run upload` para poblar Firestore
- Ejecutar `npm run migrate-images` para subir fotos a Storage
- Configurar secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub
- Pegar Google Maps API key en `window.AltorraKeys.gmapsApiKey`
- Pegar VAPID key en `window.AltorraKeys.vapidKey`

Ver `DEPLOY-RUNBOOK.md` para los comandos exactos.

---

### ⚠️ ETAPA 0-C — Deploy de Cloud Functions (2026-04-10) — PENDIENTE FIX

**Contexto:**
Primera vez que se despliegan Cloud Functions 2nd gen en el proyecto `altorra-inmobiliaria-345c6`.

**Lo que funcionó:**
- ✅ `createManagedUserV2` — desplegada correctamente
- ✅ Cleanup policy configurada: imágenes de contenedor se borran a los 30 días
- ✅ Secret Manager API habilitada
- ✅ Secrets creados: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT`
- ✅ Permisos de Secret Manager otorgados automáticamente a la cuenta de servicio

**Lo que falló:**
- ❌ `onNewSolicitud` — Error 400 Eventarc, invalid resource state
- ❌ `onSolicitudStatusChanged` — mismo error
- ❌ `onPropertyChange` — mismo error
- ❌ `deleteManagedUserV2` — mismo error
- ❌ `triggerSeoRegeneration` — mismo error

**Causa del error:**
```
HTTP Error: 400, Validation failed for trigger. Invalid resource state for
'permission denied while using the Eventarc Service Agent. If you recently
started to use Eventarc, it may take a few minutes before all necessary
permissions are propagated to the Service Agent.'
```

También apareció error de Cloud Build:
```
Build failed: Could not build the function due to a missing permission on
the build service account.
```

**Cómo resolver (próxima sesión):**

**Opción A — Esperar y reintentar** (más probable que funcione):
El error de Eventarc es común en el primer deploy. Esperar 5-10 minutos y ejecutar:
```powershell
cd C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io
firebase deploy --only functions --account altorrainmobiliaria@gmail.com
```

**Opción B — Dar permisos manualmente si Opción A falla:**

1. Ir a Google Cloud Console → IAM:
   `console.cloud.google.com/iam-admin/iam?project=altorra-inmobiliaria-345c6`

2. Buscar la cuenta de servicio:
   `service-794130975989@gcp-sa-eventarc.iam.gserviceaccount.com`

3. Darle el rol: **"Eventarc Service Agent"** (`roles/eventarc.serviceAgent`)

4. Buscar también:
   `794130975989@cloudbuild.gserviceaccount.com`

5. Darle el rol: **"Cloud Build Service Account"** (`roles/cloudbuild.builds.builder`)

6. Esperar 2-3 minutos y reintentar el deploy.

**Opción C — Habilitar APIs faltantes:**
```powershell
# En PowerShell con gcloud instalado, o desde Cloud Console:
# Habilitar: cloudbuild.googleapis.com, eventarc.googleapis.com, run.googleapis.com
```
Desde la consola: `console.cloud.google.com/apis/library` → buscar y habilitar cada una.

**Datos del proyecto:**
- Project ID: `altorra-inmobiliaria-345c6`
- Project Number: `794130975989`
- Region de Functions: `us-central1`
- Cuenta Firebase CLI: `altorrainmobiliaria@gmail.com`
- Ruta local: `C:\Users\romad\Documents\GitHub\altorrainmobiliaria.github.io`

---

### ✅ ETAPA 0-B — Proyecto Firebase configurado (2026-04-10)

**Qué se hizo:**
- ✅ Proyecto Firebase `altorra-inmobiliaria-345c6` creado
- ✅ App web registrada, credenciales reales en `js/firebase-config.js`
- ✅ Firestore activado (Standard, nam5, modo producción, reglas desplegadas)
- ✅ Authentication activado: Email/contraseña + Anónimo
- ✅ Storage activado (us-central1, modo producción, reglas desplegadas)
- ✅ Realtime Database activado (us-central1, modo bloqueado, reglas desplegadas)
- ✅ Primer usuario admin creado en Firebase Auth:
  - Email: `info@altorrainmobiliaria.co`
  - UID: `J1sXuV78OhPA5KyCoWNYFVQehF23`
- ✅ Documento `usuarios/J1sXuV78OhPA5KyCoWNYFVQehF23` creado en Firestore con `rol: super_admin`
- ✅ Secret Manager API habilitada
- ✅ Secrets configurados: `EMAIL_USER`, `EMAIL_PASS` (app password Gmail), `GITHUB_PAT`
- ✅ Firebase CLI vinculado: `firebase use altorra-inmobiliaria-345c6 --account altorrainmobiliaria@gmail.com`

**Pendiente:**
- ⚠️ Completar deploy de Cloud Functions (ver Etapa 0-C arriba)
- ⚠️ Subir propiedades a Firestore: `node scripts/upload-to-firestore.mjs`
- ⚠️ Configurar GOOGLE_APPLICATION_CREDENTIALS_JSON en GitHub Actions secrets

**Commit credenciales:** `72103b1`

---

### ✅ ETAPA 8 — Mejoras comerciales (2026-04-10)

**Qué se hizo:**

- **8-A** `js/simulador-hipotecario.js` + `simulador.html` — Calculadora hipotecaria con amortización francesa. Sliders de cuota inicial (10–50%), plazo (5–30 años), tasa (8–24% E.A.). Presets VIS/no-VIS. Tabla de amortización por año (elemento `<details>`). CTA a WhatsApp + lead `solicitud_credito` en Firestore. Acepta `?precio=` desde detalle-propiedad.

- **8-B** `js/comparador.js` — Comparador de hasta 3 propiedades. Tray flotante con thumbnails. Modal con tabla side-by-side (specs completos). Highlight del mejor valor por columna (`cmp-best`). Inyección de botones en tarjetas via MutationObserver. Persistencia en localStorage. API: `window.AltorraComparador`.

- **8-C** `js/mapa-propiedades.js` + `mapa.html` — Mapa interactivo con Google Maps. Markers por operación (🟡 venta, 🔵 arriendo, 🟢 días). InfoWindow con imagen, specs y CTA. Filtros (operación, tipo, ciudad) encima del mapa. Carga SDK de Maps de forma lazy. Fallback a `data.json` si Firebase no disponible. API: `window.MapaPropiedades`.

- **8-D** `avaluo.html` — Formulario de solicitud de avalúo comercial. Estimación orientativa en tiempo real por ciudad y tipo (precio/m² de mercado). Lead `solicitud_avaluo` → Firestore con fallback FormSubmit. Sidebar con info del proceso y CTA WhatsApp. Validación en tiempo real + honeypot.

- **8-E** `scripts.js` — Reseñas cargadas desde Firestore `resenas` (activa == true, ordenadas por `orden`) con timeout 5s y fallback a `reviews.json`. Espera `altorra:firebase-ready` antes de consultar Firestore.

- **8-F/G/H** `js/push-notifications.js` + `js/newsletter.js` — Push: FCM con VAPID key configurable, `requestPermission()` → `getToken` → guarda en `push_tokens/{token}`, `renderButton()` con toggle de estado. Newsletter: suscripción a alertas por email con criterios (operación, tipo, ciudad, presupuesto máx.), guarda en Firestore `newsletter`, detecta duplicados y reactiva, `renderForm()` widget completo con estado suscrito/no suscrito, fallback FormSubmit AJAX.

**Pendiente (requiere credenciales del propietario):**
- Reemplazar `GMAPS_API_KEY` en `js/mapa-propiedades.js` con key real de Google Maps
- Reemplazar `VAPID_KEY` en `js/push-notifications.js` con key de Firebase Console
- Agregar `measurementId` en `js/firebase-config.js` para GA4

**Commits:** `51a7dc8` (comparador), `4a1cd67` (mapa), `f0ce296` (avalúo), `a76ed11` (reseñas Firestore), `3e0026a` (push + newsletter)

---

### ✅ FASE PREVIA — Dominio y correo (2026-04-09)

**Qué se hizo:**
- Verificado que `altorrainmobiliaria.co` responde HTTP 200 ✅
- CNAME ya estaba correcto en el repo ✅
- Corregidas referencias en **17 archivos** que apuntaban a `altorrainmobiliaria.github.io` → `altorrainmobiliaria.co`
  - `tools/og.config.json`, `tools/generate_og_pages.js`
  - `sitemap.xml` (30+ URLs), `robots.txt`
  - `scripts.js`, `index.html`, `privacidad.html`
  - `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html`
  - `.github/workflows/og-publish.yml`
  - `p/*.html` (6 páginas OG generadas)
- Corregido **correo**: `altorrainmobiliaria@gmail.com` → `info@altorrainmobiliaria.co` en 4 archivos

**Commits:** `78e6e9e`, `0e033a6`

---

### ✅ FASE DOC — CLAUDE.md y ALTORRACARSCLAUDE.md (2026-04-09)

**Qué se hizo:**
- Creado `CLAUDE.md` (~1.600 líneas) — guía maestra completa de migración Firebase
- Traído `ALTORRACARSCLAUDE.md` desde rama `main` del repo de Altorra Cars (759 líneas)
- Añadida restricción crítica de costos (plan Blaze, tier gratuito)

**Commits:** `a9d43b3`, `a96986f`, `73c6866`, `722be53`, `f2e8aa9`, `850facb`

---

### ✅ ETAPA 7 — Analytics y Marketing (2026-04-10)

**Qué se hizo:**
- `js/analytics.js` — Reescrito con Firebase Analytics (`logEvent()` GA4) + buffer localStorage permanente (max 500 eventos). Auto-tracking: `page_view`, `whatsapp_click`, `external_click`, `time_on_page`. Helpers públicos: `trackPropertyView()`, `trackSearch()`, `trackFilterApplied()`, `trackFormSubmit()`, `trackFavorite()`. Compatible con API anterior.
- `js/admin-dashboard.js` — Dashboard de stats en el admin: 4 stat-cards (propiedades, leads, pendientes, reseñas), tabla de 5 leads recientes, barras de leads por tipo, top 5 búsquedas, top 5 propiedades más vistas. Usa `Promise.all` para 3 queries en paralelo.
- `js/historial-visitas.js` — Historial de las últimas 10 propiedades visitadas. `localStorage` principal + sync asíncrono con Firestore `favoritos/{uid}/historial`. Renderiza tarjetas con estilos inyectados. API: `AltorraHistorial.{add, get, render, renderSection, clear}`.
- `js/featured-week-banner.js` — Banner de propiedad destacada: selecciona la de mayor `prioridad` + `featured`, cache 1h, rotación semanal por semana ISO. Tarjeta horizontal responsive con CTA. API: `FeaturedBanner.{init, renderBanner, clearCache}`.
- `detalle-propiedad.html` — Llama `AltorraHistorial.add(prop)` al ver cada propiedad.
- `index.html` — Añadidas secciones "Destacada de la semana" (`FeaturedBanner.init`) y "Vistas recientemente" (`AltorraHistorial.renderSection`), activadas por `altorra:db-ready`.

**Pendiente (requiere credenciales):**
- 7-E: Agregar `measurementId: "G-XXXXXXXXXX"` en `js/firebase-config.js` con el ID real de GA4.

**Commits:** `981e2e6`, `5217b5e`, `82c25ec`

---

### ✅ ETAPAS 4, 5 y 6 — Storage + SEO dinámico + Favoritos Firebase (2026-04-10)

**Qué se hizo (Etapa 4 — Imágenes en Cloud Storage):**
- `scripts/migrate-images-to-storage.mjs` — Sube las 5 carpetas locales (`allure/`, `fmia/`, `serena/`, `fotoprop/`, `Milan/`) a `propiedades/{id}/*.webp` en Cloud Storage, actualiza URLs en Firestore. `DRY_RUN=1` para simular.
- `scripts/backup-firestore.mjs` — Exporta todas las colecciones a JSON local con Timestamps convertidos a ISO. Directorio configurable vía `OUTPUT_DIR`.
- `.gitignore` — Creado: `node_modules/`, `backups/`, credenciales (`sa.json`, `serviceAccount.json`, `.env*`), `.DS_Store`.

**Qué se hizo (Etapa 5 — SEO dinámico + GitHub Actions):**
- `scripts/generate-properties.mjs` — Lee propiedades disponibles de Firestore, genera `/p/{id}.html` con OG tags, Twitter Card, JSON-LD `RealEstateListing`, noscript fallback para crawlers. Regenera `sitemap.xml` (páginas estáticas + propiedades). Actualiza `data/deploy-info.json`.
- `.github/workflows/og-publish.yml` — Actualizado con lógica condicional: si hay `GOOGLE_APPLICATION_CREDENTIALS_JSON` secret → usa `generate-properties.mjs` desde Firestore; si no → usa `generate_og_pages.js` desde `data.json` (fallback). Compatibilidad total antes y después de Firebase.

**Qué se hizo (Etapa 6 — Favoritos sincronizados):**
- `js/favorites-manager.js` — Drop-in replacement del sistema de favoritos. Offline-first (siempre localStorage). Si Firebase Auth disponible, autentica anónimamente y sincroniza con `favoritos/{uid}` en Firestore. Merge bidireccional local↔remoto al iniciar. API `window.AltorraFavoritos` idéntica a la anterior.
- `favoritos.html` — Integrado con `favorites-manager.js`: usa `AltorraFavoritos.get/remove/clear`, escucha `altorra:fav-update` para re-renderizar tras sync Firebase. Fallback a localStorage si favorites-manager no cargó.

**Commits:** `9cf87bc`, `7235ed0`, `a101ac1`, `6b69cbe`

---

### ✅ ETAPAS 1, 2 y 3 — Frontend dinámico + Formularios + Panel Admin (2026-04-10)

**Qué se hizo (Etapa 1 — Lectura dinámica):**
- `js/firebase-config.js` — Inicialización Firebase SDK v12.9.0 ESM, carga crítica (Auth+Firestore) en paralelo, carga diferida (Storage/Functions/Analytics/RTDB). Placeholders TODO para credenciales.
- `js/database.js` — Clase `PropertyDatabase` con 3 niveles de carga: Memory → localStorage (TTL 5 min) → Firestore → fallback `data.json`. Normalización Firestore→JS (`titulo→title`, `habitaciones→beds`, etc.). Paginación con `limit(100)`. Eventos: `altorra:db-ready`, `altorra:db-refreshed`.
- `js/cache-manager.js` — Caché 3 capas (Memory/Map, localStorage, IndexedDB). TTL 5 min. Dos señales de invalidación: `onSnapshot system/meta` + polling `data/deploy-info.json` cada 10 min. API: `window.AltorraCache.{get, set, invalidate, clearAndReload}`.
- `js/render.js` — `window.AltorraRender.propertyCard(p)` genera `<article class="card">` con lazy image, badges, fav button, specs, precio. `renderList()`, `showEmpty()`, `showError()`.
- `js/components.js` — Reemplaza `header-footer.js`. `fetch()` simple (sin localStorage). Inyecta `header.html` + `footer.html` + `snippets/modals.html`. Maneja nav desktop y drawer móvil.
- `js/listado-propiedades.js` — Reemplaza `getJSONCached()` por `waitForDB()`. Escucha `altorra:db-refreshed` para re-renderizar sin recargar.
- `scripts.js` — `fetchByOperation()` usa `propertyDB.filter()`. `quicksearch` usa `propertyDB.getById()`.
- **10 páginas HTML** — Añadido `<script type="module" src="js/firebase-config.js">` en `<head>`, reemplazado `header-footer.js` por `database.js + cache-manager.js + components.js`.

**Qué se hizo (Etapa 2 — Formularios → Firestore):**
- `functions/package.json` — Node 20, `firebase-functions ^6`, `firebase-admin ^13`, `nodemailer ^6.9`.
- `functions/index.js` — 6 Cloud Functions: `onNewSolicitud` (email admin), `onSolicitudStatusChanged` (email cliente), `onPropertyChange` (debounce 5 min → GitHub Actions), `triggerSeoRegeneration` (callable), `createManagedUserV2`, `deleteManagedUserV2`. Secrets via `defineSecret()`.
- `js/contact-forms.js` — 3 formularios → Firestore `solicitudes`. `waitForFirebase()` con timeout 8s → fallback FormSubmit. Rate limiting 30s, honeypot, `addDoc`.
- `contacto.html`, `detalle-propiedad.html`, `publicar-propiedad.html` — Limpiados campos FormSubmit, mantenida acción como fallback, añadido `contact-forms.js`.

**Qué se hizo (Etapa 3 — Panel de administración):**
- `admin.html` — SPA con login (`#loginForm`), sidebar (Dashboard/Propiedades/Leads/Reseñas/Usuarios), 5 secciones de contenido (`section-dashboard`, `section-propiedades`, etc.), 4 modales (`propModal`, `leadModal`, `resenaModal`, `userModal`). Todos los IDs coordinados con los módulos JS.
- `css/admin.css` — Layout sidebar fijo 240px, header 60px, tablas, badges de estado, modales, botones, formularios, responsive ≤860px.
- `js/admin-auth.js` — Login Firebase Auth + verificación intentos (bloqueo 5 fallos / 15 min), carga de perfil con retry 3x+backoff (fix bug Cars "Access denied"), RBAC `applyRolePermissions()`, timeout 8h + inactividad 30 min. API: `window.AdminAuth`.
- `js/admin-properties.js` — CRUD Firestore completo: listar (filtros+paginación), crear (slug automático), editar (optimistic locking `_version`), cambiar estado, eliminar (solo super_admin), subida imágenes a Cloud Storage con compresión Canvas API. Invalida `system/meta` tras cambios. API: `window.AdminProperties`.
- `js/admin-leads.js` — Lista leads con filtros, ver detalle, actualizar estado (tabla y modal), badge sidebar de pendientes, `onSnapshot` en tiempo real solo cuando la sección está activa. API: `window.AdminLeads`.
- `js/admin-users.js` — Gestión de usuarios admin (listar, crear via callable, cambiar rol, eliminar). CRUD completo de reseñas (colección `resenas`). Solo accesible para `super_admin`. API: `window.AdminUsers`.

**Commits:** `047092c`, `2a12467`, `74eb0fd`, `0b7c880`, `2b89a16`, `26422fe`, `a03dab0`, `c9668c8`, `f4de6da`, `644bce7`, `8d352ec`, `0ec0d76`, `7e7c400`, `87fd1d6`, `6619d50`, `5968031`, `7bd0c20`, `a819fa3`, `52dcc37`, `6e2c94f`

---

### ✅ ETAPA 0-A — Archivos base Firebase en el repo (2026-04-09)

**Qué se hizo:**
- `firebase.json` — enruta reglas de Firestore, Storage, RTDB y Functions
- `firestore.rules` — RBAC completo: roles super_admin / editor / viewer, locking optimista con `_version`, colecciones públicas y privadas
- `storage.rules` — lectura pública de imágenes, escritura solo para admins autenticados, máximo 5 MB, solo imágenes
- `database.rules.json` — presencia de admin en RTDB con guards de seguridad por sesión
- `package.json` — dependencias: `firebase ^12.9.0`, `firebase-admin ^13`, `sharp ^0.33`
- `data/deploy-info.json` — señal de versión para que el cache-manager detecte nuevos deploys
- `scripts/upload-to-firestore.mjs` — migra las 5 propiedades de `properties/data.json` a Firestore, crea `system/meta`, `config/general` y `config/counters`
- `js/firebase-config.js` — inicialización Firebase SDK v12.9.0 ESM, carga crítica + diferida, placeholders TODO para credenciales
- `.github/workflows/og-publish.yml` — actualizado con triggers `schedule: '0 */4 * * *'` y `repository_dispatch: property-changed`; bump automático de `data/deploy-info.json` en cada deploy

**Commits:** `b46b1d7`, `4e4e7b1`, `047092c`, `2a12467`

---

## PLAN COMPLETO EN MICROFASES

> Cada microfase produce un commit limpio y el sitio nunca queda roto.
> Las microfases marcadas con 🔑 requieren credenciales Firebase del propietario.
> Las marcadas con ⚙️ Claude las puede ejecutar sin credenciales.

---

### ETAPA 1 — Lectura dinámica desde Firestore

**Objetivo:** El frontend lee propiedades de Firestore en vez de `data.json`. El usuario no nota ningún cambio visual.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 1-A | `js/database.js` — clase `PropertyDatabase` con fallback a `data.json` | ⚙️ No |
| 1-B | `js/cache-manager.js` — caché 3 capas (Memory + IndexedDB + localStorage) | ⚙️ No |
| 1-C | `js/render.js` — función `renderPropertyCard()` | ⚙️ No |
| 1-D | `js/components.js` — inyección dinámica de header/footer/modals | ⚙️ No |
| 1-E | Modificar `js/listado-propiedades.js` — reemplazar `fetch data.json` por `propertyDB` | ⚙️ No |
| 1-F | Modificar `scripts.js` — reemplazar carga JSON por `propertyDB` | ⚙️ No |
| 1-G | Añadir `<script type="module" src="js/firebase-config.js">` a todas las páginas HTML | ⚙️ No |
| 1-H | Prueba con datos reales de Firestore — reemplazar TODOs en firebase-config.js | 🔑 Sí |

**Criterio de éxito:** Propiedades cargan desde Firestore, fallback a `data.json` si Firebase no responde.

---

### ETAPA 2 — Formularios → Firestore + email automático

**Objetivo:** Los formularios dejan FormSubmit y guardan leads en Firestore. El admin recibe email.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 2-A | `functions/package.json` + estructura básica de Functions | ⚙️ No |
| 2-B | `functions/index.js` — función `onNewSolicitud` (email al admin via Nodemailer) | ⚙️ No |
| 2-C | `js/contact-forms.js` — lógica de envío a colección `solicitudes` | ⚙️ No |
| 2-D | Modificar `contacto.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-E | Modificar `detalle-propiedad.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-F | Modificar `publicar-propiedad.html` — reemplazar FormSubmit por JS | ⚙️ No |
| 2-G | Deploy de Functions + configurar secrets `EMAIL_USER`, `EMAIL_PASS` | 🔑 Sí |
| 2-H | `functions/index.js` — añadir `onSolicitudStatusChanged` (email al cliente) | ⚙️ No |

**Criterio de éxito:** Lead aparece en Firestore Console y llega email al admin sin tocar FormSubmit.

---

### ETAPA 3 — Panel de administración

**Objetivo:** El admin gestiona propiedades desde el navegador sin tocar código.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 3-A | `admin.html` + `css/admin.css` — estructura y estilos base | ⚙️ No |
| 3-B | `js/admin-auth.js` — login Firebase Auth, RBAC, timeout de sesión | ⚙️ No |
| 3-C | `js/admin-properties.js` — listar propiedades con estado | ⚙️ No |
| 3-D | `js/admin-properties.js` — formulario crear propiedad nueva | ⚙️ No |
| 3-E | `js/admin-properties.js` — formulario editar propiedad (con `_version`) | ⚙️ No |
| 3-F | `js/admin-properties.js` — cambiar estado (disponible/reservado/vendido) | ⚙️ No |
| 3-G | `js/admin-leads.js` — ver y gestionar solicitudes/leads | ⚙️ No |
| 3-H | `js/admin-users.js` + Cloud Functions `createManagedUserV2` / `deleteManagedUserV2` | ⚙️ No |
| 3-I | Panel de reseñas — CRUD desde Firestore (reemplaza `reviews.json`) | ⚙️ No |
| 3-J | Prueba completa con Firebase real — crear primer usuario super_admin | 🔑 Sí |

**Criterio de éxito:** El admin publica una propiedad nueva desde el navegador y aparece en el sitio.

---

### ETAPA 4 — Imágenes en Cloud Storage

**Objetivo:** Las fotos viven en la nube, no en el repositorio Git.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 4-A | `scripts/migrate-images-to-storage.mjs` — script que sube las imágenes existentes | ⚙️ No (código) / 🔑 Sí (ejecución) |
| 4-B | Subida de las 5 carpetas de imágenes a Storage (`allure/`, `fmia/`, etc.) | 🔑 Sí |
| 4-C | Actualizar URLs en documentos Firestore después de la migración | 🔑 Sí |
| 4-D | Actualizar `js/admin-properties.js` — subida de imágenes a Storage con compresión Canvas API | ⚙️ No |
| 4-E | Eliminar carpetas de imágenes del repo Git (solo tras verificar) | 🔑 Sí |

**Criterio de éxito:** Imágenes cargan desde `storage.googleapis.com`, el repo Git pesa menos.

---

### ETAPA 5 — SEO dinámico + GitHub Actions avanzado

**Objetivo:** Las páginas `/p/*.html` se regeneran automáticamente al cambiar una propiedad en Firestore.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 5-A | `scripts/generate-properties.mjs` — genera `/p/*.html` desde Firestore con OG tags + JSON-LD | ⚙️ No (código) |
| 5-B | Regenerar `sitemap.xml` desde el script | ⚙️ No (código) |
| 5-C | `functions/index.js` — añadir `onPropertyChange` (debounce 5 min → dispara `repository_dispatch`) | ⚙️ No (código) |
| 5-D | `functions/index.js` — añadir `triggerSeoRegeneration` (callable, solo super_admin) | ⚙️ No (código) |
| 5-E | Actualizar `.github/workflows/og-publish.yml` para usar el nuevo script | ⚙️ No |
| 5-F | Configurar secret `GITHUB_PAT` en Firebase Functions | 🔑 Sí |
| 5-G | Prueba end-to-end: cambiar propiedad → Cloud Function → GitHub Actions → `/p/*.html` actualizado | 🔑 Sí |

**Criterio de éxito:** En ~5 minutos tras guardar desde el admin, `/p/{id}.html` refleja los cambios.

---

### ETAPA 6 — Favoritos sincronizados entre dispositivos

**Objetivo:** Los favoritos no se pierden al cambiar de dispositivo.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 6-A | `js/favorites-manager.js` — favoritos con Firebase Anonymous Auth + sync Firestore | ⚙️ No (código) |
| 6-B | Modificar `js/favoritos.js` — integrar `favorites-manager.js` | ⚙️ No |
| 6-C | Modificar `favoritos.html` — cargar desde Firestore en tiempo real | ⚙️ No |
| 6-D | Reglas Firestore para colección `favoritos` | ⚙️ No |
| 6-E | Prueba real — agregar favorito en móvil, verificar en desktop | 🔑 Sí |

**Criterio de éxito:** Favorito agregado en móvil aparece en desktop sin login manual.

---

### ETAPA 7 — Analytics y Marketing

**Objetivo:** Métricas reales de comportamiento de usuarios y herramientas de conversión.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 7-A | Reemplazar `js/analytics.js` (localStorage) por Firebase Analytics `logEvent` | ⚙️ No (código) |
| 7-B | Dashboard en admin: propiedades más vistas, términos de búsqueda, leads por tipo | ⚙️ No (código) |
| 7-C | `js/historial-visitas.js` — últimas propiedades vistas por el usuario | ⚙️ No |
| 7-D | `js/featured-week-banner.js` — banner de propiedad destacada de la semana | ⚙️ No |
| 7-E | Configurar GA4 measurement ID en firebase-config.js | 🔑 Sí |

---

### ETAPA 8 — Mejoras comerciales

**Objetivo:** Funcionalidades que aumentan captación y conversión de clientes.

| Microfase | Archivo(s) | Depende de credenciales |
|---|---|---|
| 8-A | Simulador de crédito hipotecario (tasa, plazo, cuota inicial) | ⚙️ No |
| 8-B | Comparador de propiedades (seleccionar 2-3 y comparar specs) | ⚙️ No |
| 8-C | Mapa de propiedades — Google Maps con markers usando `coords` de Firestore | ⚙️ No |
| 8-D | Calculadora de avalúo básica (genera lead tipo `solicitud_avaluo`) | ⚙️ No |
| 8-E | Reseñas desde Firestore (reemplaza `reviews.json`) | ⚙️ No (código) / 🔑 Sí (datos) |
| 8-F | Sistema de reseñas mejorado con CRUD en admin | ⚙️ No |
| 8-G | Notificaciones push (Firebase Cloud Messaging) | 🔑 Sí |
| 8-H | Newsletter / alertas de propiedades por email | 🔑 Sí |

---

## LO QUE CLAUDE PUEDE HACER SIN CREDENCIALES

Todo el código de las microfases ⚙️ puede escribirse, revisarse y commitearse ahora mismo.
Cuando el propietario tenga Firebase configurado, solo habrá que:

1. Reemplazar los `TODO_*` en `js/firebase-config.js`
2. Ejecutar los scripts de migración (`upload-to-firestore.mjs`, `migrate-images-to-storage.mjs`)
3. Desplegar las Cloud Functions (`firebase deploy --only functions`)
4. Desplegar las reglas (`firebase deploy --only firestore:rules,storage`)

---

## DECISIONES TÉCNICAS TOMADAS

| Decisión | Opción elegida | Razón |
|---|---|---|
| SDK Firebase frontend | Modular v12.9.0 (ESM) | Más moderno, mejor tree-shaking |
| SDK Firebase Node.js | firebase-admin v13 | Consistente con Cars |
| Hosting | GitHub Pages (se mantiene) | Sin costo, ya funciona |
| Imágenes | Cloud Storage (migración gradual en Etapa 4) | Liberar peso del repo |
| Formularios | Firestore `solicitudes` + Cloud Function email | Eliminar dependencia de FormSubmit |
| Favoritos | localStorage ahora, Firestore sync en Etapa 6 | Progresivo, no rompe nada |
| Admin panel | `admin.html` SPA, objeto global `window.IP` | Patrón `window.AP` de Cars adaptado |
| Código único prop. | `INM-YYYYMM-XXXX` (contador atómico Firestore) | Patrón Cars adaptado |
| Deploy de reglas | Manual (`firebase deploy --only firestore:rules`) | Igual que Cars — NO es automático |
| Caché frontend | 3 capas: Memory + IndexedDB + localStorage | Reducir lecturas Firestore |
| Carga propiedades | `limit(9)` paginado, nunca carga TODO | Cumplir tier gratuito Firebase |

---

## ERRORES CONOCIDOS (de Cars — evitar repetirlos aquí)

| Error | Causa | Fix |
|---|---|---|
| "Access denied for UID" al login | Red lenta → error de red tratado como permiso denegado | Retry 3x con backoff antes de signOut |
| RTDB `permission_denied` en presencia | Listeners escribían después de logout | Guards que verifican `auth.currentUser` antes de cada write |
| "Failed to obtain primary lease" Firestore | Múltiples tabs con IndexedDB | `window.clearFirestoreCache()` en consola |
| Modals no funcionan fuera de index.html | HTML hardcodeado solo en index | `loadModalsIfNeeded()` en `components.js` inyecta dinámicamente |
| `set(data, {merge:true})` falla con rules | Rules evalúan ambiguamente el merge | Usar `set()` sin merge para crear, `update()` para editar |
| Widget presencia siempre en "Cargando..." | RTDB rules sin `.read` + sin `.indexOn` | Agregar `.read: "auth != null"` y `.indexOn: ["online"]` a las rules |

---

## SESIÓN 2026-04-14/15 — Catálogo 100% dinámico + UX home

Rama: `claude/review-repo-docs-A5pvR`
Commits clave: `d28437e`, `f5fc70a`, `e9d1dd6`, `1abc74e`

### Contexto

Después del deploy inicial, se detectaron tres síntomas:

1. Una propiedad creada desde el admin **no aparecía** en el sitio público aunque se refrescara la página.
2. La sección "Propiedad destacada de la semana" y el carrusel "Vistas recientemente" mostraban propiedades que ya habían sido **eliminadas** del admin.
3. Al cargar el home sin inventario, los carruseles mostraban "Cargando propiedades…" que **parpadeaba** antes de desaparecer.

El usuario había borrado manualmente `properties/data.json` porque quería que Firestore fuera la **única fuente de verdad**, igual que en Altorra Cars.

### Cambios aplicados

#### A) Catálogo 100% dinámico desde Firestore (`d28437e`)

- Eliminado cualquier `fetch('properties/data.json')` del runtime. Las únicas referencias residuales son comentarios históricos en `js/database.js:40` y `js/smart-search.js:26`.
- `PropertyDatabase` (en `js/database.js`) carga únicamente desde Firestore; sin fallback a JSON estático.
- `js/smart-search.js` ahora consulta `window.propertyDB` en vez de un JSON local.
- `scripts/upload-to-firestore.mjs` sigue existiendo pero solo como herramienta puntual de seed inicial; no se llama en runtime.

#### B) Sync admin → público en vivo (`d28437e`, `f5fc70a`)

Se cableó una red de eventos globales para que cualquier cambio en Firestore se propague al frontend público sin recargar:

| Evento | Emisor | Propósito |
|---|---|---|
| `altorra:firebase-ready` | `js/firebase-config.js` | Firebase SDK inicializado |
| `altorra:db-ready` | `js/database.js` | Primera carga de propiedades completa |
| `altorra:db-refreshed` | `js/database.js` (onSnapshot sobre `system/meta.lastModified`) | Hubo cambios en el catálogo |
| `altorra:cache-invalidated` | `js/cache-manager.js` | Invalidación manual o por versión de deploy |

**Consumidores** (ya no usan `{ once: true }` para mantenerse escuchando):

- `js/listado-propiedades.js` — repinta la grilla completa
- `scripts.js` — refresca los 3 carruseles del home
- `js/featured-week-banner.js` — recalcula y muestra/oculta destacada
- `js/historial-visitas.js` — **prune** contra DB viva: si una propiedad del historial ya no existe en Firestore, la elimina de `localStorage`
- `js/smart-search.js` — invalida índice
- `js/mapa-propiedades.js`, `js/comparador.js`, `detalle-propiedad.html`, `index.html`

#### C) Ocultar secciones vacías (no dejar huecos) (`f5fc70a`)

Los módulos de home esconden la sección entera cuando no hay datos en vez de mostrar un contenedor con título vacío:

- Destacada semana: `featured-week-banner.js:199-206` → si no hay propiedad viable, `container.style.display='none'` + `section.style.display='none'`.
- Historial: `historial-visitas.js` → misma lógica en `renderSection()`.

#### D) Reseñas movidas al Quiénes somos (`e9d1dd6`)

Reorganización de IA de página:

- **Eliminada** sección "Nuestro equipo" (Daniel Romero / Guido Rodriguez / Yesit Romero) de `quienes-somos.html`.
- **Movida** la sección "Opiniones de nuestros clientes" desde `index.html` hacia `quienes-somos.html`, en el slot que ocupaba el equipo.
- Añadido `scripts.js` como dependencia de `quienes-somos.html` para que la lógica de carga de reseñas (Firestore → fallback `reviews.json`) funcione también allí.
- `header.html`: el link "Nuestro equipo" (apuntaba a `#equipo`, ancla ya inexistente) se cambió a "Reseñas" apuntando a `quienes-somos.html#reseñas`.

#### E) Fix parpadeo "Cargando propiedades…" en home (`1abc74e`)

Problema: el HTML renderizaba los 5 bloques del home (Venta/Arriendo/Días/Destacada/Historial) visibles con placeholder "Cargando…", luego el JS consultaba Firestore y si no había resultado ocultaba la sección. Esto producía un flash de ~500ms con UI que desaparecía.

Fix: las cinco secciones ahora arrancan con `style="display:none"` inline. El JS las revela con `section.style.display = ''` únicamente cuando Firestore devuelve datos reales. Se eliminaron los `<div class="loading">Cargando propiedades...</div>` porque ya no se ven nunca.

Resultado: cuando hay inventario las secciones aparecen limpias al llegar los datos; cuando no hay, nunca se pintan.

### Estado final de los módulos

```
Catálogo:              Firestore (única fuente)
data.json:             Eliminado del filesystem
Sync admin→público:    Eventos globales, sin recarga
Historial local:       Pruning automático contra DB viva
Destacada semana:      Validada contra DB, se oculta si no hay
Home vacío:            Sin flash, sin placeholders huérfanos
Reseñas:               En quienes-somos.html#reseñas
Menú "Nuestro equipo": Reemplazado por "Reseñas"
```

### Lo que NO se tocó (intencional)

- Los comentarios en `js/database.js:40` y `js/smart-search.js:26` que mencionan `data.json` — son historia del refactor, no referencias vivas.
- El schema Firestore (colecciones `propiedades`, `solicitudes`, etc.) — sin cambios.
- Las reglas de seguridad (`firestore.rules`, `storage.rules`) — sin cambios.
- Cloud Functions — siguen con el estado parcial descrito en `DEPLOY-RUNBOOK.md`.

### Pendientes derivados de esta sesión

- [ ] Si el usuario percibe el rato en blanco como largo cuando SÍ hay inventario, considerar skeleton cards animadas en lugar de espacio vacío.
- [ ] Verificar que al crear una propiedad desde admin, `system/meta.lastModified` se actualiza correctamente (es lo que dispara el `onSnapshot`). Si no, la sincro en vivo no funciona.
- [ ] Monitorear el límite de lecturas Firestore — cada refresh en vivo dispara una recarga del catálogo. Con tráfico alto podría acercarse a las 50K lecturas/día del tier gratuito.

---

## B1 — Activar comparador de propiedades
**Fecha:** 2026-04-17
**Commit:** *(pendiente)*

### Qué se hizo

- Activado `js/comparador.js` (416 líneas, ya existía completo) en todas las páginas de listado y detalle.
- Agregado `data-id` a las tarjetas renderizadas por `listado-propiedades.js` (`createCard()`) y `scripts.js` (`buildCard()`), requisito del `MutationObserver` del comparador que busca `.card[data-id]`.
- Script incluido en: `propiedades-comprar.html`, `propiedades-arrendar.html`, `propiedades-alojamientos.html`, `busqueda.html`, `detalle-propiedad.html`.

### Funcionalidad activada

- **Botón "Comparar"** inyectado automáticamente en cada tarjeta de propiedad.
- **Bandeja flotante** (tray) con thumbnails de propiedades seleccionadas (máx. 3).
- **Modal de comparación** con tabla de specs lado a lado: precio, m², habitaciones, baños, garajes, estrato, piso, barrio, tipo, operación.
- **Highlight de mejor valor** automático (precio más bajo, más m², etc.).
- **Comparación de amenidades** con check/cross por propiedad.
- Persistencia en `localStorage` (clave `altorra:comparador`).
- Soporte para query param `?compare=id` para pre-cargar comparación.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `js/listado-propiedades.js` | Agregado `data-id` al `<article>` de cada tarjeta |
| `scripts.js` | Agregado `data-id` al `<article>` del carrusel home |
| `propiedades-comprar.html` | Incluido `<script defer src="js/comparador.js">` |
| `propiedades-arrendar.html` | Incluido `<script defer src="js/comparador.js">` |
| `propiedades-alojamientos.html` | Incluido `<script defer src="js/comparador.js">` |
| `busqueda.html` | Incluido `<script defer src="js/comparador.js">` |
| `detalle-propiedad.html` | Incluido `<script defer src="js/comparador.js">` |

---

## B3 — Propiedades similares en detalle
**Fecha:** 2026-04-17

### Qué se hizo

- Sección "Propiedades similares" al final de `detalle-propiedad.html`, después del `</main>`.
- Algoritmo de scoring multi-criterio: barrio coincidente (+3), mismo tipo (+2), misma operación (+2), misma ciudad (+1), precio ±30% (+2). Umbral mínimo: score ≥ 3.
- Muestra hasta 4 propiedades similares ordenadas por relevancia.
- Si no hay similares suficientes, la sección se oculta automáticamente.
- CSS embebido en la misma página: grid responsivo con tarjetas compactas.
- Espera a `altorra:db-ready` para acceder a `propertyDB.filter({})` y `window.__PROP_JSON__`.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `detalle-propiedad.html` | Sección HTML `#similares-section`, CSS `.similares-*`, JS inline con scoring |

---

## B4 — Modal wizard 3 pasos "Agenda visita"
**Fecha:** 2026-04-17

### Qué se hizo

- Creado `js/wizard-visita.js` (~280 líneas) — modal wizard de 3 pasos con CSS inyectado.
- **Paso 1:** Datos personales — nombre, email, teléfono con selector de país (10 países latinoamericanos).
- **Paso 2:** Fecha y hora — date picker (próximos 30 días) + 8 slots horarios seleccionables.
- **Paso 3:** Confirmación — resumen de todos los datos con botón de envío.
- Envía a Firestore `solicitudes` con `tipo: 'agenda_visita'` y `requiereCita: true`.
- Botón "📅 Agendar visita" integrado en `detalle-propiedad.html` debajo del formulario de contacto (solo visible si la propiedad está disponible).
- API: `window.AltorraWizard.open({ propiedadId, propiedadTitulo })`.
- Progress bar con dots (3 pasos), validación por paso, cierre con ESC o click fuera.

### Archivos creados/modificados

| Archivo | Cambio |
|---------|--------|
| `js/wizard-visita.js` | NUEVO — wizard modal completo |
| `detalle-propiedad.html` | Botón "Agendar visita" + script include |

---

## B5 — Selector multi-país en formularios
**Fecha:** 2026-04-17

### Qué se hizo

- Creado `js/country-phone.js` — auto-enhances any `<input type="tel">` with a country code dropdown.
- 10 países: Colombia (+57), EE.UU. (+1), España (+34), México (+52), Panamá (+507), Perú (+51), Ecuador (+593), Venezuela (+58), Chile (+56), Argentina (+54).
- MutationObserver detects dynamically added phone inputs (e.g., detalle-propiedad.html form).
- Updated `js/contact-forms.js` — all 3 form handlers (contacto, detalle, publicar) now prepend country code to phone number before saving to Firestore.
- Script included in: `contacto.html`, `publicar-propiedad.html`, `detalle-propiedad.html`.

### Archivos creados/modificados

| Archivo | Cambio |
|---------|--------|
| `js/country-phone.js` | NUEVO — auto-enhance phone inputs |
| `js/contact-forms.js` | Concatenar country code al teléfono en los 3 handlers |
| `contacto.html` | Incluido script |
| `publicar-propiedad.html` | Incluido script |
| `detalle-propiedad.html` | Incluido script |

---

## B6 — Simulador hipotecario: gráfica amortización + export PDF
**Fecha:** 2026-04-18

### Qué se hizo

- Agregado gráfica Canvas al simulador hipotecario — barras apiladas (capital dorado + intereses rojo) por año + línea de saldo restante (gris).
- Botón "📄 Exportar PDF" que abre ventana de impresión con resumen financiero completo + tabla de amortización formateada.
- Leyenda visual debajo del gráfico (Capital, Intereses, Saldo).
- CSS para `.sim-chart-wrap`, `.sim-chart-legend`, `.sim-export-btn`.
- El simulador ya existía (`simulador.html` + `js/simulador-hipotecario.js`), solo se añadieron las 2 funcionalidades faltantes.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `js/simulador-hipotecario.js` | +`renderChart()`, +`exportPDF()`, +`fmtShort()`, canvas container, export button, CSS |

---

## B7 — Lead scoring automático en Cloud Function onNewSolicitud
**Fecha:** 2026-04-18

### Qué se hizo

- Función `calculateLeadScore(data)` añadida a `functions/index.js`.
- Scoring criteria:
  - **Tipo de solicitud** (0-30): agenda_visita=30, contacto_propiedad=25, solicitud_credito=20, etc.
  - **Datos de contacto** (0-25): nombre +5, email +10, teléfono +10.
  - **Propiedad específica** (+10): si incluye `propiedadId`.
  - **Valor alto** (0-10): >1B COP +10, >500M +5.
  - **Mensaje detallado** (0-5): >100 chars +5, >30 chars +2.
  - **Cita agendada** (+10): requiereCita + fecha.
  - **Horario laboral Colombia** (+5): L-V 8am-6pm.
- Clasificación: hot (≥70), warm (40-69), cold (<40).
- `leadScore` y `leadTier` se guardan en el documento de Firestore.
- Email al admin incluye badge visual con color según tier (🔥 HOT rojo, 🟡 WARM amarillo, 🔵 COLD gris).
- Subject del email incluye [HOT]/[WARM]/[COLD] prefix para facilitar triage.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `functions/index.js` | +`calculateLeadScore()`, scoring en `onNewSolicitud`, badge en email |

---

## A12 — CTA "Publica tu propiedad" abre wizard
**Fecha:** 2026-04-18

### Qué se hizo

- Creado `js/wizard-publicar.js` — wizard modal 3 pasos para publicar propiedad.
- **Paso 1:** Tipo de inmueble (chips: 6 tipos), operación (Vender/Arrendar/Por días), ciudad, precio aproximado.
- **Paso 2:** Datos de contacto — nombre, email, teléfono con country selector (10 países).
- **Paso 3:** Resumen de confirmación → envía a Firestore como `publicar_propiedad`.
- Botón "Publicar mi propiedad" en index.html cambiado de `<a>` a `<button>` — abre wizard si disponible, fallback a `publicar-propiedad.html`.
- CSS inyectado inline (prefijo `.pwz-*`), cierre con ESC/click fuera.

### Archivos creados/modificados

| Archivo | Cambio |
|---------|--------|
| `js/wizard-publicar.js` | NUEVO — wizard 3 pasos publicar propiedad |
| `index.html` | CTA cambiado a button + script include |

---

## C1 — Rediseño hero premium
**Fecha:** 2026-04-18

### Qué se hizo

- **Overlay mejorado**: gradiente 3-stop más dramático (12%→45%→55% opacidad) para mejor contraste.
- **Badge premium**: "⭐ Inmobiliaria #1 en Cartagena" pill con glass effect (`.hero-badge`), animated entrance.
- **Ambient glow**: radial gradients dorados sutiles (`.hero-ambient`) — brillo en esquinas opuestas.
- **Partículas flotantes**: 12 dots dorados que suben con animación CSS (`.hero-particles`), generadas vía JS inline. Respeta `prefers-reduced-motion`.
- Sin cambios a la tipografía, colores de marca, ni layout del buscador.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `style.css` | Overlay gradient mejorado, CSS para `.hero-badge`, `.hero-particles`, `.hero-ambient` |
| `index.html` | Badge + ambient + particles container + JS generator |

---

## PENDIENTE DEL PROPIETARIO (tarea humana)

Estas tareas no las puede hacer Claude — requieren acceso a la consola de Firebase y cuentas del negocio:

- [x] Crear proyecto Firebase `altorra-inmobiliaria-345c6` ✅
- [x] Activar: Firestore, Authentication, Storage, Realtime Database ✅
- [x] Copiar credenciales Firebase en `js/firebase-config.js` ✅
- [x] Crear primer usuario super_admin en Firebase Auth ✅
- [x] Crear documento `usuarios/{uid}` con `{ rol: "super_admin" }` ✅
- [x] Configurar secrets: `EMAIL_USER`, `EMAIL_PASS`, `GITHUB_PAT` ✅
- [ ] ⚠️ Completar deploy de Cloud Functions (ver Etapa 0-C — fix permisos Eventarc)
- [ ] Ejecutar `node scripts/upload-to-firestore.mjs` para subir las 5 propiedades
- [ ] Configurar secret `GOOGLE_APPLICATION_CREDENTIALS_JSON` en GitHub Actions
- [ ] Reemplazar `GMAPS_API_KEY` en `js/mapa-propiedades.js` con key real de Google Maps
- [ ] Reemplazar `VAPID_KEY` en `js/push-notifications.js` con key de Firebase Console

---

## C2 — Página `invertir.html` con ROI por zona + casos de éxito

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Página completa de inversión inmobiliaria en Cartagena con:

1. **Hero premium dark** — gradiente oscuro, badge "Oportunidad 2025", CTA doble
2. **Sección "Por qué invertir"** — 4 razones con iconos (valorización, renta turística, calidad vida, marco legal)
3. **ROI por zona** — Grid de 6 zonas (Bocagrande, Castillogrande, Manga, Centro Histórico, La Boquilla, Barú) con:
   - Rango de precio por m²
   - ROI anual estimado
   - Ocupación Airbnb estimada
   - Perfil de inversor ideal
4. **Casos de éxito** — 3 cases detallados con desglose financiero:
   - Apto Bocagrande (ROI 9.6%)
   - Studio Centro Histórico (ROI 14.4%)
   - Casa Barú (ROI 12%)
5. **CTA final** — 3 botones (propiedades, simulador, WhatsApp)

### Decisiones técnicas

- Diseño self-contained: todo el CSS inline para no inflar `style.css`
- Respeta paleta `--gold`/`--accent`, tipografía Poppins
- Datos de ROI basados en promedios del mercado cartagenero 2024-2025
- Incluye header/footer dinámico vía `header-footer.js`

### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `invertir.html` | Página completa de inversión (~300 líneas) |

---

## C3 — Calculadora rentabilidad Airbnb

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Calculadora interactiva de rentabilidad para renta turística (Airbnb/Booking):

1. **Modal completo** — formulario con 9 campos editables:
   - Precio de propiedad, tarifa por noche, ocupación (%)
   - Gastos: administración, servicios, limpieza por check-out, comisión plataforma, mantenimiento, impuestos
2. **Motor de cálculo** — días ocupados, ingreso bruto, desglose de gastos, neto mensual, ROI anual, payback en años
3. **Visualización** — gráfica Canvas horizontal (ingreso bruto vs gastos vs neto), ROI box con indicador grande
4. **Conversión** — botón WhatsApp pre-llenado con los parámetros del cálculo
5. **Integración** — botón en `invertir.html` + botón en `detalle-propiedad.html` (pre-llena precio de la propiedad)

### Decisiones técnicas

- Self-contained: CSS inyectado via JS, sin dependencia de style.css
- Formateo automático COP en inputs con `inputmode="numeric"`
- API: `window.CalculadoraAirbnb.open({ precio, tarifa })` — pre-popula valores
- Canvas nativo para gráfica (0 dependencias externas)

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/calculadora-airbnb.js` | **Nuevo** — motor + modal + gráfica (~240 líneas) |
| `invertir.html` | Sección calculadora + botón CTA |
| `detalle-propiedad.html` | Botón "Calcular rentabilidad Airbnb" + script |

---

## C4 — Landing `renta-turistica.html` dedicada

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Landing page dedicada a captar propietarios que quieren monetizar sus propiedades vía Airbnb/Booking con servicios de gestión integral Altorra.

Secciones:
1. **Hero premium dark** — badge, stats (65-80% ocupación, +40% ingreso, 24/7, 4.8★), 2 CTAs
2. **8 servicios de gestión** — fotografía, publicación multicanal, check-in/out, limpieza, mantenimiento, atención 24/7, reportes, pagos
3. **Cómo funciona** — 4 pasos numerados (evaluación → preparación → operación → liquidación)
4. **Tabla comparativa** — renta turística vs arriendo tradicional (7 filas con indicadores yes/no)
5. **FAQ** — 7 preguntas comunes en `<details>` nativos
6. **Formulario de captación** — 6 campos → Firestore (`tipo: 'gestion_renta_turistica'`)
7. **CTA final** — 3 botones (formulario, calculadora, WhatsApp)

### Decisiones técnicas

- Self-contained CSS prefijado `.rt-*`
- Integra `calculadora-airbnb.js` (C3) con botón en hero + CTA
- Formulario escribe directo a `solicitudes` con tipo dedicado
- Respeta header/footer dinámico + country-phone

### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `renta-turistica.html` | Landing completa (~210 líneas) |

---

## C5 — Badges premium en cards ("ROI %", "Ocupación %")

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Módulo autónomo que enriquece las tarjetas de propiedad con badges visuales de rentabilidad estimada, automáticamente calculados por zona.

1. **Mapa de zonas** — 12 barrios de Cartagena con rangos de ROI Airbnb y ocupación (Bocagrande, Castillogrande, Manga, Centro Histórico, Getsemaní, La Boquilla, Barú, Crespo, Marbella...)
2. **Badge dorado "📈 ROI ~X%"** — gradiente oro/ámbar sobre fondo oscuro de la tarjeta
3. **Badge blanco "🏖️ X% ocup."** — white translúcido con borde dorado
4. **Inyección automática** — MutationObserver detecta nuevas cards y les añade badges
5. **Solo propiedades de compra** — filtra `operation: 'comprar'` y excluye lotes/bodegas
6. **Normalización de zona** — maneja tildes (Barú/Baru), sin distinción de mayúsculas

### Decisiones técnicas

- Self-contained: CSS inyectado via JS
- No modifica el renderer de cards — se engancha por observer al DOM existente
- `window.AltorraInvestmentBadges.getBadgesHTML(p)` expuesto para uso programático
- Se re-ejecuta en eventos `altorra:db-ready` y `altorra:db-refreshed`

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/investment-badges.js` | **Nuevo** — motor + CSS + observer (~120 líneas) |
| `index.html` | `<script>` defer |
| `propiedades-comprar.html` | `<script>` defer |
| `busqueda.html` | `<script>` defer |

---

## C6 — i18n inglés con toggle ES/EN

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Sistema de internacionalización completo para atraer inversionistas internacionales:

1. **Diccionario EN** — 60+ claves organizadas por sección (nav, hero, cards, filters, forms, invest, vacation, footer)
2. **Toggle flotante** — botón ES/EN pill fijo debajo del header (derecha), estilo premium con gradiente dorado para idioma activo
3. **Auto-detección** — lee `localStorage` → `navigator.language` → fallback ES
4. **Atributos `data-i18n`** — traduce `textContent` de cualquier elemento marcado
5. **Atributos `data-i18n-attr`** — traduce atributos (placeholder, aria-label, title) con sintaxis `atributo:clave`
6. **Preservación de original** — guarda texto ES original en `data-i18n-original` para restaurar al volver
7. **Integración automática** — cargado vía `components.js` tras el header → disponible en todas las páginas
8. **Evento personalizado** — dispara `altorra:lang-changed` para que otros módulos reaccionen

### Decisiones técnicas

- El idioma ES no necesita diccionario (usa textContent original como fallback)
- API pública: `window.AltorraI18n.t(key)`, `.setLang('en'|'es')`, `.toggle()`, `.getLang()`
- Toggle se inyecta vía DOM + CSS embebido
- Responsive: en móvil se mueve a bottom-right para no tapar el header
- Índice HTML: `data-i18n` añadido a badge hero y botón "Buscar" como prueba de concepto

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/i18n.js` | **Nuevo** — motor + diccionario + toggle (~200 líneas) |
| `js/components.js` | Carga diferida de `i18n.js` tras header |
| `index.html` | `data-i18n` en hero badge + botón buscar |

---

## C7 — Página `foreign-investors.html` (US/CA/ES) + FAQ fiscal

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Landing 100% en inglés dirigida a inversionistas internacionales (EE.UU., Canadá, España). Objetivo: capturar el segmento de compradores extranjeros que hoy busca en Cartagena.

Secciones:
1. **Hero multi-banderas** — 🇺🇸 🇨🇦 🇪🇸 + badge "International Investors"
2. **Por qué Cartagena** — 4 ventajas (currency advantage, tourism demand, no restrictions, investor visa)
3. **6 pasos de compra remota** — from selection to registration
4. **Tax tabs interactivos** — 3 pestañas con obligaciones fiscales específicas:
   - 🇺🇸 FBAR, FATCA, Form 8938, foreign tax credit
   - 🇨🇦 T1135, double taxation, snowbird structure
   - 🇪🇸 Modelo 720, IRPF, Impuesto sobre el Patrimonio
5. **FAQ 8 preguntas** — proceso remoto, mortgages, repatriation, visa, closing costs
6. **CTA triple** — properties, ROI analysis, WhatsApp (mensaje pre-llenado en inglés)

### Decisiones técnicas

- `lang="en"` + `og:locale=en_US` para SEO multilingüe
- Tabs interactivos vanilla JS (sin librería)
- Disclaimer de "consult licensed advisor" en cada sección fiscal
- Datos fiscales basados en regulación 2025 (DIAN, IRS, CRA, AEAT)

### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `foreign-investors.html` | Landing EN para US/CA/ES (~240 líneas) |

---

## C8 — Sección "Propiedades exclusivas" (prioridad ≥ 90)

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Nueva sección premium en el home que filtra y destaca las propiedades con `highlightScore` / `prioridad` ≥ 90, presentándolas como una "colección privada" con diseño diferenciado.

Características:
1. **Fondo oscuro** — gradiente `#0b0b0b → #1a1a2e` con ambient dorado radial
2. **Header curado** — badge dorado "✨ COLECCIÓN PRIVADA", título con acento oro
3. **Cards premium** — cada tarjeta con ribbon diagonal "EXCLUSIVA" dorado, borde fino oro, shadow profunda
4. **Hover premium** — lift + shadow dorada al pasar el mouse
5. **Carrusel con flechas** — navegación horizontal con snap, flechas blancas circulares
6. **Auto-oculta** — si hay menos de 3 propiedades que cumplen el criterio, no se renderiza
7. **Reactivo** — escucha `altorra:db-ready` y `altorra:db-refreshed`

### Decisiones técnicas

- Módulo autónomo `js/exclusivas.js` con CSS inyectado
- Criterio: `highlightScore >= 90` OR `prioridad >= 90` OR `featured >= 1`
- Máximo 10 tarjetas
- Tarjetas con estilos inline para no depender de otro CSS

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/exclusivas.js` | **Nuevo** — motor + CSS + renderer (~180 líneas) |
| `index.html` | Sección + script defer |

---

## D1 — CRM Kanban en admin (nuevo → contactado → visita → cierre)

**Fecha:** 2026-04-18
**Rama:** `claude/analyze-competitor-features-ilXY4`

### Qué se hizo

Vista Kanban alternativa para leads en el admin, con 4 columnas y drag & drop entre estados.

1. **Toggle de vista** — botones "📋 Lista" / "📊 Kanban" en sección leads
2. **4 columnas** — Nuevo (azul), Contactado (ámbar), Visita (púrpura), Cierre (verde)
3. **Cards con info clave** — nombre, tipo, propiedad, teléfono, fecha relativa ("Hace 2h") y lead score badge
4. **Drag & drop** — arrastrar entre columnas actualiza el estado en Firestore directamente
5. **Color-coded tier** — borde izquierdo rojo/ámbar/azul según leadScore (hot/warm/cold)
6. **Nuevo estado `visita`** — añadido al flujo después de "contactado"
7. **Retrocompatibilidad** — mapeo legacy: `pendiente` → Nuevo, `en_gestion` → Contactado, `cerrado` → Cierre

### Decisiones técnicas

- Módulo autónomo `js/admin-kanban.js`
- CSS inyectado via JS
- Evento `altorra:leads-updated` emitido por admin-leads.js al filtrar
- Click en card abre el modal de detalle existente
- Uso de HTML5 drag & drop nativo (sin librería)

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/admin-kanban.js` | **Nuevo** — tablero + drag & drop (~200 líneas) |
| `js/admin-leads.js` | Estado `visita` añadido, label actualizado, `_allLeads` expuesto, evento emit |
| `admin.html` | Filtro de estado extendido + script defer |

---

## FIX — i18n: script tag + diccionario expandido (2026-04-18)

**Problema:** El sistema i18n (C6) estaba reescrito pero nunca se cargaba. Tras remover `loadAsset('js/i18n.js')` de components.js, ninguna página HTML tenía un `<script>` para i18n.js. Solo se traducía el badge del hero porque era el único elemento que la versión anterior con `data-i18n` cubría.

**Solución:**
- Agregado `<script defer src="js/i18n.js"></script>` a las 21 páginas públicas
- Removida la carga dinámica desde components.js (ya estaba hecho en disco)
- Expandido el diccionario ES→EN con ~20 entradas adicionales (barrios, 404, etc.)
- MutationObserver traduce contenido inyectado dinámicamente (header/footer)
- Evento `altorra:components-ready` re-traduce tras carga de componentes

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/i18n.js` | Reescrito: text-walker + 200+ entradas + MutationObserver |
| `js/components.js` | Removida línea `loadAsset('js/i18n.js')` |
| 21 HTML pages | Agregado `<script defer src="js/i18n.js">` |

---

## D2 — Nurturing email: secuencias automatizadas (2026-04-19)

**Qué:** Sistema de follow-up automático por email tras recibir un lead. Cada tipo de solicitud tiene su propia secuencia de 3-4 correos espaciados en días (día 1, 3, 7, 14).

**Secuencias implementadas (5):**

| Tipo | Emails | Temas |
|------|--------|-------|
| `contacto_propiedad` | 4 | Info propiedad → similares → visita → asesor |
| `publicar_propiedad` | 4 | Cómo publicamos → ventajas → avalúo gratis → CTA |
| `solicitud_avaluo` | 3 | Qué esperar → mercado Cartagena → servicios |
| `gestion_renta_turistica` | 4 | Cómo funciona → ROI zonas → vs arriendo → CTA |
| `_default` | 2 | Servicios generales → disponibilidad |

**Implementación técnica:**
- Cloud Function `processNurturingEmails` (scheduled, cada 6h)
- Consulta solicitudes con `nurturing.nextEmailAt <= now`
- Templates HTML con branding Altorra (oro, Poppins)
- Cada email tiene CTA con botón dorado hacia la página relevante
- `onNewSolicitud` inicializa metadatos de nurturing en el documento
- Índice compuesto en `firestore.indexes.json` para la query
- Lead score + tier (hot/warm/cold) visible en admin leads

### Archivos

| Archivo | Cambio |
|---------|--------|
| `functions/index.js` | Secuencias nurturing, `processNurturingEmails` scheduled, nurturing init en `onNewSolicitud` |
| `firestore.indexes.json` | **Nuevo** — índice compuesto para query nurturing |
| `js/admin-leads.js` | Lead tier badge en tabla, nurturing status + score en detail modal |
| `PLAN-MEJORAS.md` | D2 → DONE |

---

## D3 — WhatsApp tracking con UTM + Firestore analytics (2026-04-19)

**Qué:** Intercepta todos los clicks en enlaces `wa.me` para agregar sufijo UTM al mensaje y loguear el evento en Firestore (`analytics_events`).

**Funcionalidad:**
- Detecta automáticamente la fuente del click (float_button, hero, contact_form, property_card, cta_section, footer, inline)
- Appends UTM reference suffix al texto del mensaje WhatsApp: `Ref: web/source/campaign`
- Logs to Firestore `analytics_events` con: type, source, page, propertyId, propertyTitle, referrer, userAgent, screenWidth, lang
- API pública `window.AltorraWhatsApp.buildLink(text, source)` y `.track(source, propId)`
- Regla Firestore: `analytics_events` permite create público, read autenticado

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/whatsapp-tracker.js` | **Nuevo** — interceptor + UTM + Firestore logger (~120 líneas) |
| `firestore.rules` | Regla para `analytics_events` (create: public, read: auth) |
| 15 HTML pages | Agregado `<script defer src="js/whatsapp-tracker.js">` |
| `PLAN-MEJORAS.md` | D3 → DONE |

---

## D4 — Blog inversionista con 3 posts seed (2026-04-19)

**Qué:** Sección de blog enfocada en inversión inmobiliaria en Cartagena, con 3 artículos iniciales de contenido educativo para atraer inversionistas.

**Posts creados:**

| Archivo | Título | Tema | Longitud |
|---------|--------|------|----------|
| `blog/por-que-invertir-cartagena-2026.html` | ¿Por qué invertir en Cartagena en 2026? | Inversión general, stats, zonas | ~1200 palabras |
| `blog/renta-turistica-vs-arriendo-tradicional.html` | Renta turística vs arriendo tradicional | Comparación ROI con caso real | ~1000 palabras |
| `blog/guia-legal-inversionistas-extranjeros.html` | Guía legal para inversionistas extranjeros | Impuestos, visas, proceso legal | ~1400 palabras |

**Mejoras técnicas:**
- `components.js` ahora auto-detecta base path para subdirectorios (blog/, etc.)
- Blog link agregado al footer
- Cada post tiene JSON-LD Article schema, WhatsApp float, CTA box
- Entradas i18n para blog

### Archivos

| Archivo | Cambio |
|---------|--------|
| `blog.html` | **Nuevo** — listing page con 3 cards |
| `blog/por-que-invertir-cartagena-2026.html` | **Nuevo** |
| `blog/renta-turistica-vs-arriendo-tradicional.html` | **Nuevo** |
| `blog/guia-legal-inversionistas-extranjeros.html` | **Nuevo** |
| `js/components.js` | Auto-detect base path via script src attribute |
| `footer.html` | Link a blog.html |
| `js/i18n.js` | Entradas blog |

---

## D5 — Newsletter funcional con plantillas (2026-04-19)

**Qué:** Sistema de newsletter con barra flotante de suscripción, almacenamiento en Firestore, y Cloud Function para enviar newsletters con plantillas.

**Funcionalidad:**
- Barra flotante aparece tras 5s en páginas clave (home, listados, inversión, blog)
- Suscriptores guardados en Firestore `newsletter` con criterios de búsqueda
- Detección de duplicados (reactivación si ya existe)
- 3 plantillas de email: `nuevas_propiedades`, `mercado`, `personalizado`
- Cloud Function `sendNewsletter` (callable, super_admin) con logging en `newsletter_sends`
- FormSubmit fallback si Firestore no está disponible

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/newsletter.js` | Floating bar auto-show + CSS inyectado |
| `functions/index.js` | `sendNewsletter` callable con 3 plantillas |
| `firestore.rules` | Regla para `newsletter` (create+update: público, read: auth) |
| 9 HTML pages | `<script defer src="js/newsletter.js">` |

---

## D6 — Dashboard analytics en admin (views, leads, conversión)

**Fecha:** 2026-04-19
**Commit:** (pendiente)
**Estado:** ✅ Completado

### Qué se hizo

Dashboard de analytics completo en el panel admin con datos de Firestore + localStorage.

**Widgets añadidos:**
- 6 stat cards: Propiedades, Leads totales, Leads pendientes, Reseñas, WhatsApp clicks, Newsletter suscriptores
- **Leads por tipo** — barras horizontales con todos los tipos de solicitud
- **WhatsApp por fuente** — desglose de clicks por origen (botón flotante, hero, formulario, etc.) desde `analytics_events`
- **Leads últimos 30 días** — gráfico de barras verticales con timeline diario
- **Embudo de conversión** — visualización de etapas (Nuevo → Contactado → Visita → Cierre) con porcentajes
- **Propiedades más vistas** — top 5 desde localStorage analytics
- **Búsquedas frecuentes** — top 5 desde localStorage analytics

**Datos Firestore consultados:**
- `propiedades` (disponibles)
- `solicitudes` (últimos 200, ordenados por fecha)
- `resenas` (activas)
- `analytics_events` (tipo whatsapp_click, últimos 500)
- `newsletter` (suscriptores activos)

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/admin-dashboard.js` | Reescrito completo con 6 widgets analíticos |
| `admin.html` | +2 stat cards (WhatsApp, Newsletter) + contenedor `analyticsGrid` |
| `css/admin.css` | Estilos: `.analytics-grid`, `.tl-chart`, `.funnel-row`, responsive |

---

## E1.4 + E1.5 — Sitemap.xml + Performance optimizations

**Fecha:** 2026-04-19
**Estado:** ✅ Completado

### Qué se hizo

**E1.4 — Sitemap.xml reescrito:**
- Eliminadas entradas que no son páginas (header.html, footer.html, snippets/, google verification)
- Añadidas páginas faltantes: blog.html, 3 blog posts, invertir.html, renta-turistica.html, simulador.html, avaluo.html, mapa.html, foreign-investors.html, turismo-inmobiliario.html, busqueda.html, favoritos.html
- Prioridades diferenciadas: home (1.0), listados (0.9), detalle/inversión (0.8), blog (0.7-0.8), servicios (0.5), privacidad (0.3)
- Fechas actualizadas a 2026-04-19
- changefreq ajustado por tipo de página

**E1.5 — Performance:**
- Eliminadas preconnect duplicadas en index.html (fonts.googleapis.com, fonts.gstatic.com, i.postimg.cc aparecían 2 veces)
- Añadidas preconnect + dns-prefetch a listing pages (comprar, arrendar, alojamientos)
- Eliminada referencia a performance.js legacy (IntersectionObserver manual reemplazado por native `loading="lazy"`)
- Script utils.js ahora con defer para no bloquear parsing

### Archivos

| Archivo | Cambio |
|---------|--------|
| `sitemap.xml` | Reescrito: 30 URLs curadas, prioridades, fechas |
| `index.html` | Preconnects dedup + script order cleanup |
| `propiedades-comprar.html` | +4 preconnect/dns-prefetch hints |
| `propiedades-arrendar.html` | +4 preconnect/dns-prefetch hints |
| `propiedades-alojamientos.html` | +4 preconnect/dns-prefetch hints |

---

## E2.1 + E2.2 + E2.3 — Landing pages SEO por intención de búsqueda

**Fecha:** 2026-04-19
**Estado:** ✅ Completado

### Qué se hizo

3 landing pages SEO optimizadas para capturar tráfico orgánico de alta intención:

**E2.1 — comprar-apartamento-cartagena.html**
- 6 zonas con precios/m², estrato, valorización y renta turística
- 6 pasos para comprar (con contador CSS automático)
- 6 consejos clave antes de comprar
- 5 preguntas frecuentes con JSON-LD FAQPage schema
- CTAs a listado de compra y contacto

**E2.2 — arrendar-apartamento-cartagena.html**
- 6 zonas con rango de canon mensual y características
- Checklist de documentos y requisitos
- Tabla comparativa arriendo tradicional vs por días
- JSON-LD FAQPage schema
- CTAs a listado de arriendo y contacto

**E2.3 — invertir-airbnb-cartagena.html**
- 4 zonas con ROI, ocupación, tarifa/noche e ingreso mensual
- 8 costos operativos detallados con montos
- 5 requisitos legales (RNT, impuestos, seguros, DANE)
- JSON-LD FAQPage schema
- CTAs a propiedades y servicio de renta turística

### Archivos

| Archivo | Cambio |
|---------|--------|
| `comprar-apartamento-cartagena.html` | NUEVO — landing compra por zona |
| `arrendar-apartamento-cartagena.html` | NUEVO — landing arriendo por zona |
| `invertir-airbnb-cartagena.html` | NUEVO — landing inversión Airbnb |
| `sitemap.xml` | +3 URLs con prioridad 0.9 |

---

## E2.4 + E2.5 — Landing pages: Barú/La Boquilla + Lotes campestres

**Fecha:** 2026-04-19
**Estado:** ✅ Completado

### Qué se hizo

**E2.4 — propiedades-baru.html**
- Barú e La Boquilla como destinos de inversión emergente
- Stats: valorización, precio m², distancia, acceso
- Features checklist por zona
- 4 razones para invertir ahora (infraestructura, precios, turismo, estilo de vida)
- CTAs a propiedades y WhatsApp directo

**E2.5 — lotes-campestres-cartagena.html** (competir contra Altis)
- 4 zonas: Barú, Turbaco, Arjona, La Boquilla (precio m², extensiones, valorización, uso)
- 4 usos: casa campestre, glamping, agrícola, desarrollo inmobiliario
- 6 verificaciones legales/técnicas antes de comprar lote

### Archivos

| Archivo | Cambio |
|---------|--------|
| `propiedades-baru.html` | NUEVO — landing Barú + La Boquilla |
| `lotes-campestres-cartagena.html` | NUEVO — landing lotes campestres |
| `sitemap.xml` | +2 URLs |

---

## 2026-04-24 — i18n 100% + Integración foreign-investors

**Lo que se hizo:**
1. Botón ES/EN ahora bulletproof (carga síncrona, migración one-time a ES, estilos inline con !important, re-inyección automática). Service Worker bump v2 → v3.
2. Diccionario i18n expandido a **1174 entradas** cubriendo el **100% de las 1213 frases** del sitio (0 faltantes). Partido en 4 commits (+93, +58, +111, +62) para evitar timeouts.
3. `foreign-investors.html` ya no es huérfana: integrada al header desktop (panel Servicios), drawer móvil (bloque propio) y footer (Empresa) con `hreflang="en" lang="en" translate="no"`.

## 2026-04-24 — E3.1 Blog estructura dinámica

**Lo que se hizo:**
1. `blog.html` ahora lee de Firestore `blog` con fallback inmediato a 3 cards mientras carga Firebase (LCP protegido).
2. `blog-post.html` creado — template dinámico que carga posts por `?slug=`, inyecta meta tags + OG + JSON-LD BlogPosting al vuelo, con CTA y fallback de error.
3. Reglas Firestore: colección `blog` con lectura pública, escritura solo editor+ con `_version` optimista.
4. Script `scripts/upload-blog-posts.mjs` sube los 3 posts seed con `admin`, merge idempotente.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `blog.html` | Grid ahora dinámico desde Firestore + fallback hardcoded + `<noscript>` SEO |
| `blog-post.html` | NUEVO — template dinámico para artículos |
| `js/blog-list.js` | NUEVO — loader del índice con fallback 5s |
| `js/blog-post.js` | NUEVO — loader individual + meta tags dinámicos + JSON-LD |
| `scripts/upload-blog-posts.mjs` | NUEVO — seed de 3 posts a Firestore |
| `firestore.rules` | +colección `blog` |

---

## 2026-04-25 — E4.1 FAQ estructurado con JSON-LD FAQPage

**Lo que se hizo:**
1. **JSON-LD FAQPage** añadido a 5 páginas clave para habilitar rich snippets en Google y mejorar visibilidad en respuestas de IA (ChatGPT, Perplexity).
2. **renta-turistica.html** y **foreign-investors.html** ya tenían FAQ visible — solo se añadió el schema JSON-LD (7 y 8 preguntas respectivamente).
3. **invertir.html**, **simulador.html** y **contacto.html** recibieron FAQ visible (`<details>`/`<summary>` con animación + estilo coherente) **+** JSON-LD FAQPage.
4. Todas las preguntas están alineadas con keywords de intención de búsqueda real: ROI Cartagena, cuota inicial crédito, tasa hipotecaria 2026, costos de cierre, plazos, atención bilingüe, etc.

### Páginas con FAQ + JSON-LD

| Página | Preguntas | Idioma |
|--------|-----------|--------|
| `renta-turistica.html` | 7 (gestión Airbnb, comisión, pagos, requisitos) | ES |
| `foreign-investors.html` | 8 (mortgage, repatriation, residency, closing costs) | EN |
| `invertir.html` | 7 (ROI, montos, Airbnb vs arriendo, valorización, costos) | ES |
| `simulador.html` | 7 (cuota inicial, plazo, tasas, UVR vs fija, prepago) | ES |
| `contacto.html` | 6 (tiempos respuesta, servicios, horarios, asesoría) | ES |

### Archivos

| Archivo | Cambio |
|---------|--------|
| `renta-turistica.html` | +JSON-LD FAQPage (7 Q) |
| `foreign-investors.html` | +JSON-LD FAQPage (8 Q en inglés) |
| `invertir.html` | +sección FAQ visible + JSON-LD (7 Q) |
| `simulador.html` | +sección FAQ visible + JSON-LD (7 Q) |
| `contacto.html` | +sección FAQ visible + JSON-LD (6 Q) |
| `sitemap.xml` | lastmod actualizado en 6 URLs |
| `PLAN-MEJORAS.md` | E4.1 marcado ✅ DONE |

---

## 2026-04-25 — E4.2 Lead magnet "Guía del Inversionista 2026"

**Lo que se hizo:**
1. Nueva landing `guia-inversionista-2026.html` con estructura de lead magnet completo: hero + 8 beneficios + índice de contenidos + formulario de captura + contenido bloqueado tras submit + CTA final.
2. **Contenido sustantivo** (~5.500 palabras, 9 capítulos): mercado Cartagena 2026, ROI por 6 zonas, Airbnb vs arriendo, impuestos completos (predial por estrato, IVA, INC, ganancia ocasional), financiación (4 vías + opciones extranjeros), due diligence (20 puntos), 10 errores que cuestan millones, inversión desde el exterior (poder, Form 4, visa M), calendario tributario.
3. **Captura de leads:** form envía a Firestore `solicitudes` con `tipo: descarga_guia_inversionista_2026`. Una vez enviado, se desbloquea la lectura inmediata + se persiste en `localStorage['altorra:guia-2026:unlocked']` para futuras visitas.
4. **Print-to-PDF:** estilos `@media print` ocultan header/form/footer y dejan solo el contenido limpio. El usuario puede generar su PDF desde el navegador.
5. **JSON-LD Article** para SEO + tracking.
6. **Distribución:** banner CTA en `invertir.html` (hero), `foreign-investors.html` (en inglés) y enlace en footer global.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `guia-inversionista-2026.html` | NUEVO — landing + guía completa (524 líneas) |
| `footer.html` | +link a la guía en sección Empresa |
| `invertir.html` | +CTA banner en hero hacia la guía |
| `foreign-investors.html` | +CTA banner (EN) en hero hacia la guía |
| `sitemap.xml` | +URL de la guía con priority 0.8 |
| `PLAN-MEJORAS.md` | E4.2 marcado ✅ DONE |

---

## 2026-04-25 — E4.3 Estudio de mercado por zona

**Lo que se hizo:**
1. Nueva página `estudios-mercado-cartagena.html` posicionada como reporte trimestral de autoridad: hero con fecha de publicación, resumen ejecutivo con 6 KPIs principales, tabla comparativa de 6 zonas, análisis detallado por zona con KPIs cuantitativos, 3 tendencias macro 2026-2027, metodología y fuentes transparentes, CTA hacia contacto y guía.
2. **Datos cuantitativos** por zona (Centro Histórico, Bocagrande, Castillogrande, Manga, La Boquilla, Barú/Islas): precio m², tarifa Airbnb, ocupación, valorización YoY, ROI Airbnb, ticket promedio.
3. **Sección de metodología transparente** con explicación de cada métrica + fuentes citadas (Lonja Bolívar, Cotelco, AirDNA, DANE, Banco República). Esto eleva la credibilidad ante Google y AI Search.
4. JSON-LD `Article` con `mainEntityOfPage`, `datePublished` y `publisher`.
5. **Distribución:** banner CTA en `invertir.html` (entre ROI por zona y casos de inversión), enlace en footer global, URL en sitemap.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `estudios-mercado-cartagena.html` | NUEVO — estudio mercado 6 zonas (~417 líneas) |
| `invertir.html` | +banner CTA hacia el estudio |
| `footer.html` | +link "📊 Estudio de mercado 2026" en sección Empresa |
| `sitemap.xml` | +URL del estudio con priority 0.8 |
| `PLAN-MEJORAS.md` | E4.3 marcado ✅ DONE |

---

## 2026-04-25 — E4.4 Glosario inmobiliario (long-tail SEO + Q&A IA)

**Lo que se hizo:**
1. Nueva página `glosario-inmobiliario.html` con **44 términos** inmobiliarios organizados alfabéticamente (A–V), orientados a long-tail SEO y a respuestas directas para IA Search.
2. **Navegación sticky alfabética** con scroll suave a cada sección de letra.
3. **Buscador en vivo** con normalización sin acentos (`NFD` + regex strip) — filtra términos y oculta secciones vacías en tiempo real.
4. **Referencias cruzadas** entre términos relacionados (ej. Avalúo catastral → Predial, Hipoteca → Leasing habitacional).
5. **JSON-LD `DefinedTermSet`** con los 44 términos para Google Knowledge Graph y AI indexing.
6. **CTAs** hacia contacto, guía del inversionista y WhatsApp intercalados en el contenido.
7. Diseño responsive con tarjetas `.gl-term` que siguen la paleta dorada del sitio.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `glosario-inmobiliario.html` | NUEVO — glosario 44 términos (~485 líneas) |
| `footer.html` | +link "📖 Glosario inmobiliario" en sección Empresa |
| `sitemap.xml` | +URL del glosario con priority 0.7 |
| `PLAN-MEJORAS.md` | E4.4 marcado ✅ DONE |

---

## 2026-04-25 — E5.1 LocalBusiness JSON-LD enriquecido (sync Google Business)

**Lo que se hizo:**
1. Reescritura del bloque `RealEstateAgent + LocalBusiness` en `scripts.js` con campos que Google Business Profile y AI Search consumen para mejorar el panel del negocio:
   - `slogan`, `foundingDate`, `knowsLanguage` (es, en).
   - `currenciesAccepted` (COP, USD), `paymentAccepted`.
   - `openingHoursSpecification` estructurado (reemplaza el string `openingHours` por la versión `@type` que Google prefiere).
   - `areaServed` ampliado a 7 lugares: Cartagena + Bocagrande + Castillogrande + Manga + Centro Histórico + La Boquilla + Barú.
   - `hasOfferCatalog` con 7 servicios (venta, arriendo, renta turística, administración, avalúos, asesoría legal, acompañamiento a extranjeros).
   - `sameAs` ampliado para incluir el canal de YouTube.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `scripts.js` | JSON-LD `RealEstateAgent + LocalBusiness` enriquecido (~30 líneas más) |
| `PLAN-MEJORAS.md` | E5.1 marcado ✅ DONE |

---

## 2026-04-25 — E5.2 Sala de prensa (kit descargable + backlinks)

**Lo que se hizo:**
1. Nueva página `prensa.html` (~281 líneas) con:
   - Hero "Sala de prensa · Recursos abiertos".
   - **6 KPIs** citables (año fundación, cobertura, % extranjeros, valorización).
   - **3 boilerplates** (50 / 120 / 240 palabras) con botón "copiar al portapapeles" — listos para que un periodista pegue en su nota.
   - **3 voceros** disponibles para entrevistas con temas y idiomas.
   - **4 recursos descargables** (logo, guía, estudio, glosario).
   - **Tabla de datos legales** (razón social, sede, contacto).
   - **Embed badge HTML** copiable: `<a>` con borde dorado que portales aliados pueden pegar para citar a Altorra como fuente — genera backlink dofollow.
   - **Cita corta lista para artículos** con fuente enlazada.
   - **Lineamientos editoriales** (cómo citar, atribución, uso del logo).
   - CTA email a prensa con asunto pre-llenado.
2. JSON-LD `WebPage` con `publisher` Organization + sameAs.
3. Print-friendly via `@media print`.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `prensa.html` | NUEVA — sala de prensa (~281 líneas) |
| `footer.html` | +link "📰 Sala de prensa" en sección Empresa |
| `sitemap.xml` | +URL prensa.html con priority 0.6 |
| `PLAN-MEJORAS.md` | E5.2 marcado ✅ DONE |

---

## 2026-04-25 — E5.3 Hub de videos (recorridos por zona + análisis)

**Lo que se hizo:**
1. Nueva página `videos.html` (~267 líneas) — hub de YouTube con:
   - Hero con CTA rojo "Suscríbete al canal" con SVG oficial de YouTube.
   - **Filtros por categoría** (Todos / Zona / Propiedades / Mercado / Guías) con tabs interactivos.
   - **12 tarjetas de video** organizadas en 4 categorías: 4 recorridos por zona, 2 tours de propiedad, 2 análisis de mercado, 4 guías para inversionistas.
   - Cada tarjeta tiene placeholder elegante con icono play + meta (zona, duración, idioma) — listas para reemplazar `<div class="placeholder">` por `<iframe src="https://www.youtube-nocookie.com/embed/...">` cuando el dueño suba el video.
   - **Banner "Estamos produciendo"** que comunica que el contenido se publica mensualmente.
   - **CTA dual** al final: WhatsApp (recorrido virtual personalizado) + formulario contacto.
2. JSON-LD `CollectionPage` con `publisher` Organization — ayuda a Google a entender que el sitio mantiene un canal de video propio.
3. Filtro JS vanilla (sin frameworks) que muestra/oculta tarjetas por categoría.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `videos.html` | NUEVA — hub de videos (~267 líneas) |
| `footer.html` | +link "🎬 Recorridos en video" en sección Empresa |
| `sitemap.xml` | +URL videos.html con priority 0.7 |
| `PLAN-MEJORAS.md` | E5.3 marcado ✅ DONE |

---

## 2026-04-26 — F1.1→F1.5 Reorganización home + fundamento

**Lo que se hizo:**

**F1.1 — Reorganización de secciones + fix meta:**
1. **Nuevo orden del index**: Hub → Categorías (subió) → Barrios (subió) → Recientes → Exclusivas → Featured → Recursos inversionista → Testimonios → Historial → FAQ → Foreign investors → Publica (bajó al final).
2. **Title SEO mejorado**: `Apartamentos y casas en Cartagena | Comprar, Arrendar, Invertir | Altorra Inmobiliaria`.
3. **Description SEO mejorada** con keywords específicas (Cartagena, renta turística, asesoría jurídica).
4. **`og:image` con URL absoluta**, **`og:url` añadido**, **`hreflang` ES/EN** apuntando a `foreign-investors.html`.
5. **Skip-link** movido antes del header (accesibilidad correcta).
6. **Hero `alt` descriptivo** (antes "Banner").

**F1.2 — Bloque "Recursos del inversionista":**
- 4 cards con links a: guía 2026, estudio mercado, videos, glosario — entre Featured banner y Testimonios.

**F1.3 — FAQ home:**
- 5 preguntas frecuentes con `<details>/<summary>` + JSON-LD `FAQPage` en `<head>`.
- Cross-links a foreign-investors, estudios, guía, contacto.

**F1.4 — Bloque foreign investors EN:**
- Banner oscuro EN con CTA dorado hacia `/foreign-investors.html`.

**F1.5 — JSON-LD WebSite + SearchAction:**
- Schema `WebSite` con `SearchAction` apuntando a `busqueda.html?q=` — habilita sitelinks searchbox en Google SERPs.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `index.html` | Secciones reordenadas + head mejorado + 3 secciones nuevas (~485 líneas) |
| `scripts.js` | +WebSite SearchAction JSON-LD en home |
| `PLAN-MEJORAS.md` | Bloque F (F1→F8) registrado con micro-fases |

---

## 2026-04-26 — F2.1→F2.4 Performance / Core Web Vitals

**Lo que se hizo:**

**F2.1 — Fix LCP/CLS/INP:**
1. **`i18n.js` (138KB) de sincrónico a `defer`** — eliminó el mayor recurso render-blocking del sitio.
2. **`whatsapp-float.css` movido de `<body>` a `<head>`** — evita CLS por carga tardía del botón flotante.

**F2.2 — Lazy-load de scripts no críticos:**
1. **9 scripts** convertidos de `<script defer>` a carga via `requestIdleCallback`:
   - Head: `analytics.js`, `whatsapp-tracker.js`, `newsletter.js`, `firestore-meter.js` (se cargan después de que el main thread esté libre).
   - Body: `wizard-publicar.js`, `historial-visitas.js`, `featured-week-banner.js`, `investment-badges.js`, `exclusivas.js` (se cargan en idle).
2. **21 → 13 script tags** en el HTML, de los cuales 0 son render-blocking.

**F2.3 — Imágenes:**
- Verificado que `scripts.js` y `listado-propiedades.js` ya usan `loading="lazy"` + `decoding="async"` en imágenes dinámicas. Sin cambios necesarios.

**F2.4 — Service Worker:**
- Añadido **precache de 11 recursos críticos** (/, style.css, scripts.js, components, utils, database, i18n, header/footer, manifest).
- Bump de `CACHE_NAME` a `altorra-pwa-v4` para forzar actualización.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `index.html` | i18n defer, CSS al head, idle loaders, scripts reducidos |
| `service-worker.js` | +precache array, version bump v4 |
| `PLAN-MEJORAS.md` | F2.1→F2.4 marcados ✅ DONE |

---

---

## F3 — UX / Accesibilidad (2026-04-27)

**F3.1 — Auditoría de accesibilidad (contraste, ARIA, focus):**

1. **Focus styles restaurados** — eliminada la regla CSS que quitaba `outline:none` a `.drawer a:focus`, `.menu-link:focus`. Reemplazada con anillos gold visibles (`rgba(212,175,55,.4)`) en: drawer links, menu links, menu-link-featured, `<summary>`, `.btn`, `.card`, `.hub-card`, `.cat-card`, `.barrio-card`, `.fav-btn`, `.arrow`, `.resource-card`.
2. **Focus-visible genérico reforzado** — `a:focus-visible` subido de `.18` a `.35` opacidad con `border-radius:4px`.
3. **Footer: color typo corregido** — `#bd5e1` → `#cbd5e1` en link de Privacidad.
4. **Footer: copyright actualizado** — `© 2025` → `© 2026`.
5. **Resource cards: inline JS eliminado** — `onmouseover`/`onmouseout` reemplazados por clase CSS `.resource-card` con `:hover`/`:focus-within` (accesible via teclado).
6. **Skip links añadidos** a 5 páginas que no los tenían: `contacto.html`, `privacidad.html`, `servicios-mantenimiento.html`, `servicios-mudanzas.html`, `turismo-inmobiliario.html`.
7. **Skip-link CSS inline** añadido a las 3 páginas standalone (servicios-mantenimiento, servicios-mudanzas, turismo-inmobiliario) que no cargan `style.css`.

**F3.2 — Navegación móvil accesible:**

1. **Verificado focus trap** en drawer móvil: Tab/Shift+Tab cycling, Escape cierra, backdrop click cierra, focus al primer enlace al abrir, focus al toggle al cerrar.
2. **Touch targets mejorados** — drawer links de `padding:8px 2px` a `padding:10px 6px` + `min-height:44px` (WCAG 2.5.8).
3. **Nav-toggle** — añadido `min-height:44px;min-width:44px` al botón hamburguesa.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `style.css` | Focus-visible restaurado, touch targets 44px, .resource-card CSS |
| `footer.html` | Color typo fix, copyright 2026 |
| `index.html` | Resource cards con clase CSS en vez de inline JS |
| `contacto.html` | +skip-link |
| `privacidad.html` | +skip-link |
| `servicios-mantenimiento.html` | +skip-link, +skip-link CSS |
| `servicios-mudanzas.html` | +skip-link, +skip-link CSS |
| `turismo-inmobiliario.html` | +skip-link, +skip-link CSS |
| `PLAN-MEJORAS.md` | F3.1–F3.2 marcados ✅ DONE |

---

---

## F4 — Datos y precisión (2026-04-27)

**F4.1 — Verificar precios y ROI:**
- Propiedades dinámicas de Firestore — no hay precios hardcoded en HTML.
- ROI por zona consistente entre guía (bruto) y airbnb landing (neto).
- Ocupación, tarifas y valorización coinciden entre guía, estudio y landing pages.

**F4.2 — Fact-check datos:**
- Añadida aclaración en `invertir-airbnb-cartagena.html`: el subtítulo explica que el ROI mostrado es **neto** (descontados costos operativos), diferenciándolo del ROI bruto de la guía del inversionista.
- Todas las referencias de año verificadas como 2026.

**F4.3 — Consistencia contacto y redes sociales:**
- Instagram URL corregido en `contacto.html` (`instagram.com` → `www.instagram.com`).
- **Footer: redes sociales añadidas** — iconos SVG de Instagram, Facebook, TikTok, YouTube con links oficiales y `aria-label`.
- **Footer: 3 links rotos corregidos** — `servicios-administracion.html`, `servicios-juridicos.html`, `servicios-contables.html` no existían; redirigidos a `servicios-mantenimiento.html`.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `contacto.html` | Instagram URL www fix |
| `footer.html` | +4 iconos sociales, 3 links rotos corregidos |
| `invertir-airbnb-cartagena.html` | Clarificación ROI neto en subtítulo |
| `PLAN-MEJORAS.md` | F4.1–F4.3 marcados ✅ DONE |

---

---

## F5 — Funcionalidad nueva (2026-04-27)

**Todas las features ya existían en el codebase:**
- F5.1: `js/comparador.js` (416 líneas) — tray flotante + modal comparación lado a lado.
- F5.2: `mapa.html` + `js/mapa-propiedades.js` (359 líneas) — Leaflet con markers por operación.
- F5.3: `simulador.html` + `js/simulador-hipotecario.js` (567 líneas) — UVR + tasa fija + FAQ.
- F5.4: Sección "Propiedades similares" en `detalle-propiedad.html` — CSS, HTML y JS completos.

---

## F6 — Móvil / Touch (2026-04-27)

**F6.1 — Revisión móvil-first:**
- Breakpoints verificados: 860px (nav), 920px (search/footer), 560px (search 1-col), 720px (reviews).
- Formularios (contacto, publicar) ya tienen `grid.two → 1fr` a 700px.
- Galería de detalle tiene touch swipe (touchstart/touchend con 40px threshold).

**F6.2 — Touch gestures en carruseles:**
- Añadido `scroll-snap-type: x mandatory` + `scroll-snap-align: start` a carruseles.
- Añadido `-webkit-overflow-scrolling: touch` para momentum scroll en iOS.
- Añadido fade gradient visual (48px) al borde derecho de carruseles para indicar contenido scrollable (oculto en desktop ≥1200px).

### Archivos

| Archivo | Cambio |
|---------|--------|
| `style.css` | scroll-snap, carousel fade hint, touch scrolling |

---

## F7 — Conversión (2026-04-27)

**F7.1 — Formularios optimizados:**
- Ya existentes en `js/contact-forms.js`: loading states, error feedback, rate limiting (30s), honeypot, Firebase fallback a FormSubmit.

**F7.2 — Exit-intent popup:**
- Creado `js/exit-intent.js` — popup con lead magnet (Guía del Inversionista 2026).
- Desktop: se activa cuando el mouse sale del viewport (mouseout, clientY < 5).
- Mobile: se activa tras 45 segundos de inactividad.
- Controles: 1 vez por sesión (sessionStorage), no repite si se cerró en últimos 7 días (localStorage).
- No aparece en contacto.html, gracias.html ni admin.html.
- Integrado con `AltorraNewsletter.subscribe()` para capturar emails.
- Fallback: redirige a la guía directamente si Firebase no está disponible.
- Accesibilidad: `role="dialog"`, `aria-modal`, Escape cierra, click en overlay cierra.
- Añadido a: index.html (idle-loaded), propiedades-comprar/arrendar/alojamientos, invertir, detalle-propiedad.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `js/exit-intent.js` | NUEVO — exit-intent popup con lead magnet |
| `index.html` | +exit-intent.js en idle loader |
| `propiedades-comprar.html` | +exit-intent.js |
| `propiedades-arrendar.html` | +exit-intent.js |
| `propiedades-alojamientos.html` | +exit-intent.js |
| `invertir.html` | +exit-intent.js |
| `detalle-propiedad.html` | +exit-intent.js |
| `PLAN-MEJORAS.md` | F5–F7 marcados ✅ DONE |

---

---

## F8 — Mantenimiento técnico (2026-04-27)

**F8.1 — Eliminar código muerto:**
- `header-footer.js` (237 líneas) — ELIMINADO. Reemplazado por `js/components.js`.
- `js/performance.js` (154 líneas) — ELIMINADO. No referenciado por ningún HTML.
- `js/form-validation.js` (273 líneas) — ELIMINADO. No referenciado por ningún HTML.
- Total: 664 líneas de código muerto eliminadas.

**F8.2 — Consolidar utilidades:**
- Auditoría: `formatCOP()` duplicado 5 veces, `escapeHtml()` 5 veces (scripts.js, utils.js, listado-propiedades.js, detalle-propiedad.html, comparador.js).
- Causa raíz: cada archivo es una IIFE independiente que define sus propios helpers locales.
- Solución: migrar a `window.AltorraUtils.formatCOP()` globalmente. Requiere tocar 5+ archivos. Documentado como tech debt para fase de migración a módulos ES.

**F8.3 — Limpieza adicional de código muerto:**
- `js/render.js` (211 líneas) — ELIMINADO. Sin referencia en ningún HTML; solo mencionado en comentarios.
- `js/push-notifications.js` (182 líneas) — ELIMINADO. Sin referencia en ningún HTML; solo mencionado en comentarios.
- Comentarios actualizados en `firebase-config.js`, `favorites-manager.js`, `comparador.js`.
- Total adicional: 393 líneas eliminadas.

### Archivos

| Archivo | Cambio |
|---------|--------|
| `header-footer.js` | ELIMINADO |
| `js/performance.js` | ELIMINADO |
| `js/form-validation.js` | ELIMINADO |
| `js/render.js` | ELIMINADO |
| `js/push-notifications.js` | ELIMINADO |
| `js/firebase-config.js` | Comentario actualizado |
| `js/favorites-manager.js` | Comentario actualizado |
| `js/comparador.js` | Comentario actualizado |
| `PLAN-MEJORAS.md` | F8.1 ✅, F8.2 documentado, F8.3 ✅ |

---

*Última actualización: 2026-04-28*
