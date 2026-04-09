# CLAUDE.md — Altorra Inmobiliaria
## Guía maestra para la transformación a plataforma dinámica con Firebase

> **Documento vivo.** Actualizar cuando cambien decisiones de arquitectura, schema o convenciones.
> Última actualización: 2026-04-09

---

## ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Estado actual del repositorio](#2-estado-actual-del-repositorio)
3. [Arquitectura de referencia — Altorra Cars](#3-arquitectura-de-referencia--altorra-cars)
4. [Schema Firestore + Config Firebase](#4-schema-firestore--config-firebase)
5. [Plan de migración por etapas](#5-plan-de-migración-por-etapas)
6. [Convenciones de código y reglas del proyecto](#6-convenciones-de-código-y-reglas-del-proyecto)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 ¿Qué es Altorra Inmobiliaria?

Sitio web de una inmobiliaria colombiana con sede en Cartagena. Actualmente es una **web 100% estática** alojada en GitHub Pages con dominio personalizado `altorrainmobiliaria.co`. Los datos de propiedades viven en un archivo JSON local (`properties/data.json`) que se edita manualmente y se commitea a GitHub.

### 1.2 El problema

- Agregar o editar una propiedad requiere hacer un commit a GitHub.
- No existe panel de administración.
- Los formularios de contacto dependen de un tercero (FormSubmit).
- Los favoritos solo existen en `localStorage` del navegador (se pierden al cambiar de dispositivo).
- No hay autenticación de usuarios.
- Las imágenes OG se generan en GitHub Actions solo cuando cambia `data.json`.
- No hay analytics en tiempo real ni historial de leads.

### 1.3 El objetivo

Transformar Altorra Inmobiliaria en una **plataforma dinámica** usando el mismo stack de **Altorra Cars** (Firebase + Firestore + Cloud Functions + GitHub Actions), pero:

- **Manteniendo el diseño actual** (paleta dorada, Poppins, layout de tarjetas, toda la esencia visual).
- **Mejorando la tecnología sin romper la experiencia** del usuario actual.
- **Añadiendo capacidades comerciales y de marketing** que hoy no existen.

### 1.4 Stack objetivo

```
Frontend          → HTML + Vanilla JS (sin frameworks, igual que hoy)
Base de datos     → Firestore (Firebase)
Autenticación     → Firebase Authentication
Almacenamiento    → Cloud Storage (imágenes de propiedades)
Funciones         → Cloud Functions (Node.js) — emails, OG, SEO
Hosting           → GitHub Pages (se mantiene) + Firebase Hosting (alternativa futura)
CI/CD             → GitHub Actions (regeneración de páginas SEO)
Analytics         → Google Analytics 4 + eventos Firestore
```

### 1.5 Repositorios relevantes

| Repo | URL | Rol |
|---|---|---|
| Altorra Inmobiliaria | `altorrainmobiliaria/altorrainmobiliaria.github.io` | Este repo — el que se migra |
| Altorra Cars | `altorracars/altorracars.github.io` | **Referencia arquitectónica** — copiar patrones |

---

## 2. ESTADO ACTUAL DEL REPOSITORIO

### 2.1 Estructura de archivos

```
altorrainmobiliaria.github.io/
├── .github/workflows/
│   └── og-publish.yml          # Genera /p y /og cuando cambia data.json
├── css/
│   └── whatsapp-float.css
├── js/
│   ├── analytics.js            # Analytics sin cookies (solo localStorage)
│   ├── cache-manager.js        # Legacy
│   ├── favoritos.js            # Favoritos en localStorage + badge nav
│   ├── form-validation.js      # Validación formularios en tiempo real
│   ├── listado-propiedades.js  # Filtrado/búsqueda/paginación de listados
│   ├── performance.js          # Legacy
│   ├── smart-search.js         # Búsqueda con typos + sinónimos + presupuesto
│   └── utils.js                # Utilidades: formatCOP, WhatsApp, toast, caché
├── og/                         # Imágenes OG 1200×630 (generadas por Actions)
├── p/                          # Páginas redirect con metadatos OG (generadas)
├── properties/
│   └── data.json               # FUENTE ÚNICA DE VERDAD — será reemplazada por Firestore
├── snippets/
│   ├── detalle-share.html
│   └── inject-jsonld.html
├── tools/
│   ├── generate_og_pages.js    # Script Node.js que genera /p y /og
│   └── og.config.json          # baseUrl: "https://altorrainmobiliaria.co"
├── header.html                 # Header inyectado dinámicamente
├── footer.html                 # Footer inyectado dinámicamente
├── header-footer.js            # Sistema de inyección con caché 7 días
├── scripts.js                  # Script principal: carruseles, reviews, buscador, JSON-LD
├── style.css                   # CSS principal con variables y diseño
├── service-worker.js           # PWA: network-first HTML/JS, SWR CSS, cache-first IMG
├── manifest.json               # PWA manifest
├── reviews.json                # 10 reseñas Google Maps (estáticas)
├── index.html                  # Home
├── propiedades-comprar.html    # Listado venta
├── propiedades-arrendar.html   # Listado arriendo
├── propiedades-alojamientos.html # Listado por días
├── detalle-propiedad.html      # Detalle de propiedad (query param ?id=)
├── contacto.html               # Formulario + generador mensaje WhatsApp
├── publicar-propiedad.html     # Formulario para publicar (solo email hoy)
├── favoritos.html              # Favoritos guardados
├── quienes-somos.html
├── privacidad.html
├── gracias.html                # Post-envío formulario
├── servicios-mantenimiento.html
├── servicios-mudanzas.html
├── 404.html
├── sitemap.xml
├── robots.txt
└── CNAME                       # altorrainmobiliaria.co
```

### 2.2 Diseño y estilos — NO TOCAR

Variables CSS en `style.css` que definen la identidad visual. **Estas NO se cambian:**

```css
:root {
  --gold:     #d4af37;   /* Color principal — oro elegante */
  --accent:   #ffb400;   /* Amarillo acentuado — botones CTA */
  --bg:       #ffffff;
  --text:     #111827;
  --muted:    #6b7280;
  --header-h: 72px;
  --page-max: 1200px;
  --card-r:   18px;
  --card-p:   12px;
  --card-gap: 16px;
}
```

- **Tipografía:** `Poppins` (300, 500, 700, 800) desde Google Fonts.
- **Paleta:** Fondo blanco, texto casi negro (`#111827`), oro como color de marca.
- **Footer:** Background `#0b0b0b` (negro profundo), grid 4 columnas.
- **Tarjetas:** `border-radius: 18px`, `hover: translateY(-4px)`, shadow suave.
- **Botón primario:** Gradient `--gold → --accent`, texto `#000`.

### 2.3 Schema actual de propiedad (`properties/data.json`)

```json
{
  "id":             "101-27",
  "title":          "Apartamento exclusivo en venta - Edificio Allure",
  "city":           "Cartagena",
  "type":           "apartamento",
  "operation":      "comprar",
  "price":          5350000000,
  "beds":           4,
  "baths":          5,
  "sqm":            240,
  "image":          "/allure/allure.webp",
  "images":         ["..."],
  "available":      1,
  "admin_fee":      230000,
  "neighborhood":   "Bocagrande",
  "strata":         4,
  "garages":        2,
  "floor":          17,
  "year_built":     2018,
  "features":       ["Aire Acondicionado", "Balcón", "Vista al mar"],
  "coords":         { "lat": 10.402567, "lng": -75.552746 },
  "description":    "Exclusivo apartamento...",
  "featured":       1,
  "highlightScore": 95,
  "added":          "2025-01-15",
  "shareImage":     "/allure/share.webp"
}
```

**Propiedades actuales en data.json (5 total):**

| ID | Título | Operación | Precio COP |
|---|---|---|---|
| 101-27 | Apartamento Allure, Bocagrande | comprar | 5.350.000.000 |
| 102-11402 | Milán Amoblado | comprar | 386.000.000 |
| 103-B305 | Trevi - Serena | comprar | 565.000.000 |
| 104-01 | Casa Country | comprar | 380.000.000 |
| 105-4422 | Milán Moderno | comprar | 350.000.000 |

### 2.4 JavaScript clave — qué hace cada archivo

| Archivo | Función principal |
|---|---|
| `header-footer.js` | Inyecta header/footer con caché localStorage 7 días |
| `scripts.js` | Carruseles home, reseñas, buscador rápido, JSON-LD Organization |
| `js/listado-propiedades.js` | Carga `data.json`, filtra, pagina (9 por página), renderiza tarjetas |
| `js/smart-search.js` | Búsqueda con typos (Levenshtein), sinónimos, presupuesto semántico |
| `js/favoritos.js` | localStorage favoritos + badge contador en nav |
| `js/utils.js` | `formatCOP()`, `buildWhatsAppLink()`, `showToast()`, `getJSONCached()` |
| `js/form-validation.js` | Validación en tiempo real (email, tel Colombia, nombre) |
| `js/analytics.js` | Eventos en localStorage: page_view, whatsapp_click, time_on_page |

### 2.5 Formularios actuales

| Formulario | Proveedor | Destino |
|---|---|---|
| Contacto (`contacto.html`) | FormSubmit | `info@altorrainmobiliaria.co` |
| Publicar propiedad | FormSubmit | `info@altorrainmobiliaria.co` |
| Contactar sobre propiedad (`detalle-propiedad.html`) | FormSubmit | `info@altorrainmobiliaria.co` |

**Todos se migrarán a Firestore** (colección `solicitudes`) + Cloud Function que envía email.

### 2.6 Limitaciones actuales (lo que no puede hacer)

| Limitación | Impacto de negocio |
|---|---|
| Sin panel admin | Publicar/editar propiedad requiere Git |
| Sin autenticación | No hay usuarios ni roles |
| Sin BD dinámica | No hay historial de leads ni contactos |
| Sin imágenes en la nube | Fotos viven en el repo (pesa y es lento) |
| Favoritos solo locales | Se pierden al cambiar de dispositivo |
| Sin analytics real | No sabe cuántos visitan, qué buscan |
| Sin push notifications | No puede avisar al admin de nuevos leads |
| Búsqueda carga TODO el JSON | No escala con muchas propiedades |
| Sin SEO dinámico | Páginas OG solo se regeneran con commits |
