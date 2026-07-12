# 🗺️ 20 — MEMORIA ESPACIAL (Altorra Inmobiliaria · arquitectura/flujos verificados)

> Trigger de Desorientación (§G.2): dónde vive cada cosa, schema Firestore, free-tier, flujos.
> ⚠️ Schema/módulos destilados de `_legacy/CLAUDE.md` (constitución) — verificar contra el repo real antes de codear (§3.3).

---

## §Stack y módulos JS
- **Frontend**: vanilla + Firebase **modular v12.9.0 ESM** (CDN gstatic). NO namespacing admin/public (a diferencia de cars).
- **Globals `window.*`**: `db`, `auth`, `storage`, `functions`, `firebaseAnalytics`, `rtdb`, `propertyDB` (clase `PropertyDatabase`), `AltorraCache`, `AltorraUtils`, `AltorraFavoritos`. Readiness: evento `altorra:db-ready` (`await waitForDB()`).
- **Archivos JS** (kebab-case en `js/`): `firebase-config.js`, `database.js` (`PropertyDatabase`), `cache-manager.js` (en `js/cache-manager.js`, **NO** `js/core/`), `render.js` (`renderPropertyCard()`), `components.js` (inyecta header/footer/modals; `loadModalsIfNeeded()`), `smart-search.js` (fuzzy Damerau-Levenshtein), `sector-properties.js`, `admin-*.js` (auth/properties/leads/users/kanban/dashboard), `contact-forms.js`, `favorites-manager.js`, `toast.js`.
- **8 Cloud Functions** (Node 20, `us-central1`): `onNewSolicitud` (email admin + lead scoring), `onSolicitudStatusChanged` (email cliente), `onPropertyChange` (regen SEO debounce 5min), `triggerSeoRegeneration` (callable super_admin), `createManagedUserV2`/`deleteManagedUserV2`/`updateUserRoleV2`, `cleanupOldLoginAttempts`.
- **Admin SPA** = `admin.html`, objeto global `window.IP`. RBAC 3 roles, lockout 5 intentos, sesión 8h, inactividad 30min.

## §Portal (greenfield · Astro 7 + CF Workers) — dónde vive cada cosa
> ⚠️ El portal (`portal/`) es SEPARADO del sitio legacy de §Stack. Stack sellado ADR §16.
- **Diseño fuente (SSoT visual)**: `portal/design/` — `mockups/*.dc.html` (8 pantallas aprobadas por Daniel), `assets/` (logo+fotos), `VISION-DUENO.md` (paleta+visión funcional), `screenshots/`.
- **Design system D1** (ADR §23 + §23.8): `portal/src/styles/tokens.css` (SSoT `--alt-*`; §1 = **paleta OFICIAL** navy #062743/dorado #D4AF37/plateado #BFC3C9/grises fríos; §14 = **Liquid Glass** `--alt-glass-*`) → `base.css` (reset+tipografía+a11y) → `components.css` (primitivas `.alt-btn/.alt-pill/.alt-card/.alt-eyebrow/.alt-chip/.alt-badge/.alt-seal/.alt-field/.alt-alert` + **`.alt-glass`/`.alt-glass--dark`/`.alt-nav-glass`** + firma única **`.alt-card--vitrina`** neu+glass+filo oro). Importados EN ORDEN en `src/layouts/BaseLayout.astro` (+ fuentes Google Cormorant Garamond + Hanken Grotesk). **Styleguide viva** = `/design-system` (dev/noindex — excluir de prod en cutover). **Lenguaje**: NEUMORFISMO protagonista + Liquid Glass SUTIL. **Superficie DUAL-MODE**: `--alt-surface #fff` default (plano) · `--alt-surface-neu #eaf0f7` (home+nav neumórfico) · `--alt-surface-ink #062743` (secciones). A11y AA verificado (WCAG vs #eaf0f7).
- **Capa de datos** (ADR §22): `src/lib/data/` (`client.ts`+`firestore-rest.ts`+`cache.ts`, edge-safe REST) · `src/lib/domain/` (tipos) · `src/middleware.ts` (cablea `locals.altorra`). Firebase emulador+seed en `portal/firebase/`.
- **Componentes** (`src/components/`, ADR §24): **`Header.astro`** (nav sticky COMPARTIDA 3 capas: util+glass+drawer; data-driven `nav[]`; dropdowns CSS; JS drawer+scroll; prop `active`; contacto REAL) · **`Footer.astro`** (navy COMPARTIDO 5 columnas + barra legal; razón social/NIT/contacto REALES; matrícula `000000` placeholder) · **`PropertyCard.astro`** (card de inmueble REUTILIZABLE: imagen+fav+badge+specs+título Cormorant+precio+orbe; props tipados). Assets logo+fotos en `public/assets/` (JPG sin optimizar → TODO WebP <150KB).
- **Páginas** (`src/pages/`): `index.astro` = **HOME** (hero neumórfico `#E6EDF2` + buscador + "Cuatro maneras" + destacadas + arriendo + footer; ADR §24/§24.8, parte 2a — faltan cerca/valoradas/proyectos/journal/brokers) · **`[operacion].astro`** = SERP dinámico (`/comprar`+`/arrendar`, ADR §25: filtros glass + grid PropertyCard + aside mapa esquemático; MapLibre real pendiente) · **`ficha.astro`** = detalle de inmueble (ADR §26: galería + specs + aside precio/CTA-WhatsApp/sello + amenidades + ficha técnica + ubicación + similares) · **`publicar.astro`** = "Publica tu inmueble" (ADR §27: hero + form de avalúo client-side + 4 pasos + 3 planes) · **`estancias.astro`** = detalle de alojamiento (ADR §28: galería + amenidades + host + widget de reserva funcional por fechas; pago Wompi = Ola 2) · **`turismo.astro`** = landing turismo+inversión (ADR §29: hero + zonas + experiencias + inversión navy + CTA) · `404.astro` = página no encontrada / "en construcción" con Header/Footer (para rutas de nav aún sin construir) · `design-system.astro` = styleguide dev.
- **Dev**: `npm --prefix portal run dev` (`astro dev`, `.claude/launch.json` config `portal`, puerto 4321). Staging LIVE = `altorra-portal.altorrainmobiliaria.workers.dev` (noindex).

## §Blaze — free-tier estricto (NUNCA exceder)
Plan Blaze pero diseñado para **NO costar**. Límites: Firestore 50K lecturas / 20K escrituras / 20K borrados día, 1 GiB ·
Auth 50K MAU · Storage 5GB · Functions 2M inv/mes · RTDB 1GB. **Reglas**: NUNCA `onSnapshot` en colecciones completas
desde público (solo admin); NUNCA queries sin `limit()` (paginar 9-20, default `limit(9)`); caché local antes de Firestore;
preferir `getDoc` (1 lectura) sobre `getDocs` (N); imágenes <200KB; GitHub Actions schedule máx 4h. Escalar más allá → consultar al dueño.

## §Schema Firestore (colecciones en español)
- **`propiedades`** (docID = campo `id`, ej. "101-27"): `titulo`, `slug`, `tipo` (apartamento|casa|lote|oficina|bodega|local),
  `operacion` (comprar|arrendar|dias), `estado` (disponible|reservado|vendido|arrendado), `ciudad`, `barrio`, `direccion`,
  `coords{lat,lng}`, `estrato`, `precio` (COP), `admin_fee`, `habitaciones`, `banos`, `sqm`, `sqm_terreno`, `garajes`, `piso`,
  `ano_construccion`, `amoblado`, `imagen` (thumb), `imagenes[]`, `imagen_og` (1200×630), `features[]`, `descripcion`,
  `featured` (bool), `prioridad` (0-100), `disponible` (bool), `createdAt`, `updatedAt`, `_version` (int), `creadoPor` (UID).
  Subcol `auditLog`: `{accion, campo, antes, despues, usuario, timestamp}`. Mapeo migración data.json(inglés)→Firestore(español): title→titulo, beds→habitaciones, baths→banos, available→disponible, highlightScore→prioridad.
- **`solicitudes`** (leads — **create público `true`**, read solo auth): `nombre`, `telefono`, `email`, `tipo`
  (contacto_propiedad|publicar_propiedad|solicitud_avaluo|solicitud_juridica|otro), `origen`, `estado`
  (pendiente|en_gestion|cerrado), `datosExtra{}`, `createdAt`/`updatedAt`, `emailSent` (idempotencia CF), `requiereCita`.
- **`resenas`**: `{autor, rating 1-5, texto, fecha, fuente (google|directo), activa, orden}`.
- **`usuarios`** (docID = Auth UID; solo super_admin): `{nombre, email, rol (super_admin|editor|viewer), activo, bloqueado, creadoEn, creadoPor}`.
- **`config`**: doc `general` (whatsapp/email/redes/slogan), doc `counters` (totalPropiedades/totalCiudades, editable por editor).
- **`system`**: doc `meta` `{lastModified}` — admin lo actualiza al cambiar propiedades; `cache-manager.js` lo escucha (onSnapshot) para invalidar caché en todas las tabs (ver `30 L-06`).
- **`loginAttempts`** (docID = hash email): `{intentos, bloqueado, ultimoIntento}` — bloqueo tras 5 fallidos.
- **`blog`** → ver §Blog abajo.

## §Reglas (firestore.rules) — resumen
Helpers: `hasProfile()`, `getUserRole()`, `isSuperAdmin()`, `isEditorOrAbove()`, `validVersion()` (req._version == prev+1; create==1).
`propiedades`: read `true`; create/update editorOrAbove+validVersion; delete superAdmin. `solicitudes`: read auth, **create `true`**, update/delete superAdmin.
`resenas`: read `true`, write editor. `usuarios`: own-uid o superAdmin. `config`: read `true`, write superAdmin (editor si `counters`).
`system`: read `true`, write editor. `loginAttempts`: read/create/update `true`, delete superAdmin. Default `/{document=**}`: **deny all**.
Storage: `propiedades/{**}` read `true` write auth; path `propiedades/{id}/{nombre}.webp`, thumb <150KB, OG 1200×630 JPEG q85.

## §Blog (hoja de detalle) — colección `blog`
docID = `slug` (minúsculas/guiones, sin tildes/ñ). Campos: `slug`, `titulo` (55-60 chars), `resumen` (140-160 chars, **= meta description**),
`categoria` (UNA de: Inversión|Rentabilidad|Legal & Fiscal|Análisis|Mercado|Guías), `imagen` (1200×630), `fecha`, `tiempoLectura`,
`publicado` (bool), `url` (opcional → `blog/{slug}.html`), `contenido` (HTML), `autor` (default "Altorra Inmobiliaria"), `_version`, `createdAt`, `updatedAt`.
- **Flujo A (estático SEO-first)**: copiar `blog/_plantilla-post.html` → `blog/{slug}.html`, reemplazar placeholders `{{TITULO}}{{SLUG}}{{FECHA}}{{CATEGORIA}}{{TIEMPO}}{{IMAGEN}}{{RESUMEN}}{{CONTENIDO}}`, añadir a `scripts/upload-blog-posts.mjs` + `sitemap.xml`, JSON-LD `BlogPosting`, commit `feat(blog): new post — {slug}`.
- **Flujo B (dinámico)**: crear doc en `blog` desde admin; `blog.html` + `blog-post.html?slug={slug}` renderizan auto.

## §SEO
URLs sociales compartibles = `/p/{id}.html` (lleva los OG tags, regenerado por GitHub Actions `og-publish.yml`); detalle interno = `detalle-propiedad.html?id={id}`. 43 páginas con `BreadcrumbList` JSON-LD. 13 landings de sector con props dinámicas (`sector-properties.js`).
