# 🔢 PROPUESTA — las cinco cifras que bloquean el 5.3, con su reemplazo ya escrito

> **Para qué es esto.** §215 encontró cinco cifras publicadas que no podemos sostener, y las dejó
> bloqueando el paso 5.3 del cutover *«a decisión del dueño»*. Una decisión sin opciones escritas es
> una tarea, no una decisión. Aquí están las opciones, con la fuente de cada reemplazo, para que la
> respuesta sea **sí o no** en vez de *«piensa qué poner»*.
>
> ⚠️ **No se toca UI**: los tres reemplazos conservan **la forma exacta** del bloque —una cifra y una
> etiqueta— así que no hay cambio de diseño ni mockup nuevo. Lo que cambia es el CONTENIDO.

---

## El criterio no es nuevo: ya se aplicó y funcionó (§123)

Cuando el mockup del bloque «Invertir» traía tres cifras, §123 las clasificó y **solo sobrevivió lo
que el lector puede comprobar**:

| Cifra del mockup | Veredicto | Por qué |
|---|---|---|
| `+7% valorización anual · zona norte` | ❌ fuera | Medición de mercado **sin fuente**: publicarla la vuelve NUESTRA afirmación |
| `128 propiedades verificadas hoy` | ❌ fuera | **Falso y comprobable**: no había ninguna sellada |
| `5 min tiempo de respuesta promedio` | ✅ **reescrita** | No era una medición, era un **compromiso**. Como «promedio» es un dato que nadie mide; como promesa es verdad **y obliga** |

Y quedó con **DOS tarjetas, no tres**: `5 min · nos comprometemos a responder` y
`6636 · matrícula de arrendador · Alcaldía de Cartagena`.
🎯 **Ése es el precedente que gobierna esta propuesta**: se publica el compromiso (etiquetado como
tal) y el hecho que el visitante puede verificar por su cuenta. Y **si solo sobreviven dos, se
publican dos** — un hueco es más honesto que un relleno.

---

## 1️⃣ EL HERO DE LA HOME — `index.astro`, bloque «Invierte donde la ciudad crece»

**Hoy dice**: `+12%` valorización anual · `8–11%` ROI en USD · `3` zonas premium.
Las dos primeras son mediciones de mercado sin fuente. La tercera afirma **cuáles** son premium, que
es un juicio, no un dato.

### ✅ Opción A — la recomendada: las mismas dos que §123 ya aprobó
```
6636   · matrícula de arrendador · Alcaldía de Cartagena
5 min  · nos comprometemos a responder
```
**Por qué**: cero afirmaciones nuevas. La matrícula está en la **Resolución 6636** y **en el pie de
la propia página**, así que el visitante la comprueba sin salir del sitio; el compromiso ya se publica
en `/invertir` con esas palabras. Coherencia total entre las dos páginas, que hoy no existe.

### Opción B — mantener tres, con la tercera derivada del catálogo REAL
```
6636   · matrícula de arrendador
5 min  · nos comprometemos a responder
N      · inmuebles publicados        ← se llena solo con el inventario real
```
**Por qué funciona**: deja de ser una afirmación y pasa a ser un **conteo**, que o es verdad o se ve
que no. ⚠️ Exige cablearla al catálogo (hoy el hero es estático), y mientras el catálogo esté vacío
la tarjeta debe **no pintarse**, no mostrar `0`.

### Opción C — la cifra se queda, con su fuente al lado
Solo si existe un estudio citable (gremio, Camacol, Lonja) que respalde el `+12%`. Entonces la
tarjeta lleva **la fuente visible**, no una nota al pie. *No conozco hoy ninguna fuente citable para
esa cifra*; si Daniel la tiene, esta opción es la mejor de las tres.

---

## 2️⃣ `/publicar` — la franja de tres estadísticas

**Hoy dice**: `+1.200` inmuebles cerrados · `38 días` promedio de venta · `98%` clientes satisfechos.
Es la página donde un **propietario decide confiarnos su inmueble**, y las tres son inventadas.
Agravante: `/nosotros` promete por escrito **no publicar** esos números.

### ✅ Propuesta — tres cifras, las tres verificables, misma forma
```
6636   · matrícula de arrendador · Alcaldía de Cartagena
10%    · de honorarios de administración, dicho de frente
5 min  · nos comprometemos a responder
```
**De dónde sale cada una**:
- **6636** — Resolución de la Alcaldía de Cartagena, publicada en el pie desde el 20-ago.
- **10%** — es la **tarifa sellada** del producto, no una estimación: vive en el código
  (`HONORARIOS_ADMIN_VIVIENDA = 0.1`) y aparece en la liquidación que el propietario recibe cada mes.
  🎯 **Publicar el precio propio es la prueba social más fuerte que hay** en un mercado donde nadie lo
  dice: el visitante puede compararlo, y quien compara ya confía. Y a diferencia de «98% satisfechos»,
  **no se puede desmentir**.
- **5 min** — el mismo compromiso, con las mismas palabras que el resto del sitio.

---

## 3️⃣ Las otras dos del bloqueo (ya tenían opciones, se listan para cerrar la foto)

- **`/estancias` anuncia con precio y sin RNT** y **la home anuncia noche + un crédito que no
  existe** (§213-§214). Para ésas el runbook ya plantea *«una de tres»*: poner el **RNT**, retirar el
  precio y el formulario de esa página, o dejarla fuera del dominio. **No hay nada que redactar aquí**:
  es dato suyo o es retirada.

---

## 📌 Qué pasa si dice que no

Nada se rompe hoy: el sitio está en `noindex`. Pero **el paso 5.3 sigue bloqueado**, porque publicar
en el dominio real una promesa de rentabilidad sin fuente y una reputación inventada es exactamente lo
que el Estatuto del Consumidor llama publicidad engañosa (Ley 1480, arts. 29-30) — y son las dos
categorías que más daño causan.
Desde §224 el gate `verify:claims` **las lleva congeladas con su motivo**: no bloquean el CI, pero
salen impresas en cada corrida y **una cifra nueva sí rompe**. El gate las hace visibles; no las
arregla.
