# CONTENIDO-EDITORIAL.md — Guía del Blog Inversionista

> **Documento vivo.** Cadencia: 2-3 artículos por semana. Meta: 50+ posts en 6 meses.
> Última actualización: 2026-04-24

---

## 1. Cómo crear un nuevo post (operativa)

### Opción A — Post estático SEO-first (recomendada para artículos pilar)
1. Copiar `blog/_plantilla-post.html` a `blog/{slug}.html`
2. Reemplazar placeholders: `{{TITULO}}`, `{{SLUG}}`, `{{FECHA}}`, `{{CATEGORIA}}`, `{{TIEMPO}}`, `{{IMAGEN}}`, `{{RESUMEN}}`, `{{CONTENIDO}}`
3. Añadir entrada a `scripts/upload-blog-posts.mjs` (para sync con Firestore)
4. Añadir URL a `sitemap.xml`
5. Commit con mensaje `feat(blog): new post — {slug}`

### Opción B — Post dinámico solo en Firestore (para contenido rápido)
1. Crear documento en colección `blog` desde el panel admin con los campos requeridos
2. El índice `blog.html` y el template `blog-post.html?slug={slug}` lo renderizan automáticamente
3. Ideal para noticias, actualizaciones, micro-posts

**Recomendación:** Usa la opción A cuando el post está pensado para rankear en Google, y la B para contenido táctico.

---

## 2. Estructura del documento Firestore

Colección `blog` — documento ID = `slug`:

```js
{
  slug:           "impuestos-inmobiliarios-colombia-2026", // URL-friendly
  titulo:         "Impuestos inmobiliarios en Colombia: guía 2026",
  resumen:        "1-2 frases, 140-160 caracteres (también sirve como meta description)",
  categoria:      "Legal & Fiscal",    // Inversión | Rentabilidad | Legal & Fiscal | Análisis | Mercado | Guías
  imagen:         "https://i.postimg.cc/.../cover.jpg",  // 1200x630 ideal
  fecha:          Timestamp,
  tiempoLectura:  8,                    // minutos
  publicado:      true,                 // toggle de visibilidad
  url:            "blog/impuestos-...html",  // opcional: link a versión estática
  contenido:      "<p>...</p><h2>...</h2>",  // HTML del cuerpo
  autor:          "Altorra Inmobiliaria",    // opcional
  _version:       1,
  createdAt:      Timestamp,
  updatedAt:      Timestamp
}
```

---

## 3. Categorías canónicas

| Categoría | Descripción | Ejemplos |
|-----------|-------------|----------|
| **Inversión** | Tesis, mercado, macro | "¿Por qué invertir en Cartagena 2026?" |
| **Rentabilidad** | ROI, ocupación, comparativas | "Airbnb vs arriendo", "Mejores zonas Airbnb" |
| **Legal & Fiscal** | Impuestos, trámites, regulaciones | "Impuestos inmobiliarios 2026" |
| **Análisis** | Balanceado, datos vs narrativa | "¿Vale la pena invertir?" |
| **Mercado** | Tendencias, cifras por zona | "Reporte mercado Bocagrande Q1 2026" |
| **Guías** | Cómo-hacer, paso a paso | "Cómo comprar sin estar en Colombia" |

**Regla:** Cada post pertenece a UNA sola categoría. Si duda, la más específica gana.

---

## 4. Lineamientos SEO

### Título (H1 y `<title>`)
- 55-60 caracteres, keyword al inicio si posible
- Incluir año cuando sea relevante ("2026")
- Evitar clickbait; preferir claridad

### Meta description
- 140-160 caracteres
- Debe responder "¿qué voy a aprender?"
- Incluir la keyword principal + 1-2 secundarias

### Slug
- Solo minúsculas, guiones, sin tildes ni ñ
- 3-6 palabras clave
- Ejemplos válidos: `mejores-zonas-airbnb-cartagena`, `impuestos-inmobiliarios-colombia-2026`
- Ejemplos inválidos: `mejores-zonas-para-invertir-en-airbnb-en-cartagena-en-el-año-2026`

### Estructura del cuerpo
- Párrafo inicial (lead) responde la pregunta implícita del título
- H2 cada ~250 palabras
- H3 para sub-secciones dentro de un H2
- Tablas, listas o blockquotes cada 400-500 palabras
- CTA final hacia `contacto.html`, `invertir.html` o landing específica

### JSON-LD obligatorio
Cada post estático debe incluir `BlogPosting` con headline, description, datePublished, author, publisher, mainEntityOfPage.

---

## 5. Calendario editorial 2026 Q2–Q3

Cadencia objetivo: **Lunes + Jueves** (+ opcional Sábado para noticias).

### Abril 2026 (completado)
| Fecha | Post | Estado |
|-------|------|--------|
| 2026-04-05 | Guía legal para inversionistas extranjeros | ✅ |
| 2026-04-10 | Renta turística vs arriendo tradicional | ✅ |
| 2026-04-15 | ¿Por qué invertir en Cartagena en 2026? | ✅ |
| 2026-04-18 | Impuestos inmobiliarios Colombia 2026 | ✅ |
| 2026-04-20 | Mejores zonas para Airbnb en Cartagena | ✅ |
| 2026-04-22 | ¿Vale la pena invertir en Cartagena 2026? | ✅ |

### Mayo 2026 (backlog priorizado)
| Fecha objetivo | Título tentativo | Categoría | Keyword principal |
|---|---|---|---|
| 2026-05-02 | Cómo calcular el ROI real de un apartamento en Cartagena | Rentabilidad | roi apartamento cartagena |
| 2026-05-06 | Bocagrande vs Castillogrande: ¿dónde invertir? | Análisis | bocagrande vs castillogrande |
| 2026-05-09 | Checklist de due diligence antes de comprar en Colombia | Guías | due diligence compra inmueble colombia |
| 2026-05-13 | Cómo obtener la visa de inversionista con un inmueble | Legal & Fiscal | visa inversionista colombia |
| 2026-05-16 | Reporte mercado Cartagena Abril 2026 | Mercado | mercado inmobiliario cartagena abril 2026 |
| 2026-05-20 | RNT paso a paso: cómo registrar tu Airbnb | Guías | rnt cartagena como tramitar |
| 2026-05-23 | Tasas hipotecarias para extranjeros en Colombia | Legal & Fiscal | hipoteca extranjero colombia |
| 2026-05-27 | Getsemaní: análisis de saturación y oportunidades | Análisis | getsemani inversion airbnb |
| 2026-05-30 | Errores comunes al comprar propiedad en Cartagena | Guías | errores comprar propiedad cartagena |

### Junio 2026 (backlog inicial)
- Cómo calcular IVA e INC en renta turística
- La Boquilla: ¿la próxima Bocagrande?
- Comparativa Colombia vs México para inversión USD
- Contrato de arrendamiento modelo — qué debe incluir
- Avaluó comercial vs avalúo catastral
- Qué hacer si un huésped daña tu Airbnb
- Guía impuesto predial Cartagena 2026
- Cartagena como sede fiscal para nómadas digitales

---

## 6. Flujo de trabajo

```
1. Research (1-2h)     →  Keywords, data, fuentes, competencia
2. Outline (30 min)    →  H1, H2s, H3s, 1-2 líneas por sección
3. Draft (2-3h)        →  Escribir completo sin revisar
4. Edit (1h)           →  Cortar, reorganizar, añadir tablas/data
5. SEO polish (30 min) →  Meta, title, slug, JSON-LD, internal links
6. Publish (15 min)    →  HTML + Firestore + sitemap + commit
```

**Tiempo total objetivo por post:** 5-6 horas.

---

## 7. Métricas de éxito

Revisar mensualmente en el admin dashboard (D6):

- **Posts publicados/mes:** meta 8-12
- **Páginas vistas por post (promedio):** meta >200 en primer mes
- **Tiempo en página (promedio):** meta >2 min
- **Tasa de rebote:** <65%
- **Clicks a CTA `contacto.html`:** meta >3% de visitantes del blog
- **Conversión blog → lead:** meta >1% (lead = formulario enviado)

Si un post no llega a 100 PV en 30 días, revisar título + meta + internal linking.

---

## 8. Banco de ideas (long backlog)

### Inversión
- El impacto del nuevo aeropuerto de Cartagena en los precios
- Fondos REIT colombianos vs compra directa
- Cartagena vs Medellín: comparativa para extranjeros
- Diversificación USD/COP con inmuebles

### Rentabilidad
- Cómo fijar la tarifa óptima en Airbnb por temporada
- Operador profesional vs gestionar yo mismo
- Amoblar para Airbnb — presupuesto y ROI
- Ocupación mínima viable por zona

### Legal & Fiscal
- Sucesión inmobiliaria para extranjeros
- Sociedad SAS vs persona natural para invertir
- DAS, UGPP y reportes obligatorios para arrendatarios

### Guías
- Cómo pagar desde el exterior (Western Union, SWIFT, crypto)
- Poder notarial para comprar sin viajar
- Cómo elegir un administrador de propiedad confiable
- Checklist de entrega de llaves al inquilino

### Mercado (serie recurrente mensual)
- Reporte mensual: precios por m², ocupación, tarifa promedio
- Top 5 propiedades vendidas del mes
- Noticias macro que impactan el mercado

---

## 9. Plantilla HTML

Ver `blog/_plantilla-post.html` — estructura base lista para copiar.

---

*Fin CONTENIDO-EDITORIAL.md*
