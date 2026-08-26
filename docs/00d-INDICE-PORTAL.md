# 🗂️ 00d — ÍNDICE DE CONSTRUCCIÓN DEL PORTAL (§91-§120 · la Ola 1, de la SERP al cutover)

> **Cuarto shard de rango de `00-INDICE`** (ADR §156). El kernel descubre las hermanas por PATRÓN
> (`00[a-z]?-INDICE*.md`) y trata a las cinco como UN índice: los chequeos #3 (desync), #5a (ADRs
> indexados) y #9 (consolidado) leen todas. Mover filas aquí **no** las saca del cerebro.
>
> **Por qué ESTAS**: es el tramo en que el portal nuevo pasó de existir a estar completo — SERP,
> ficha, alertas, precios, el ruleset fusionado, los leads, la subida a R2 y el runbook del cutover.
> Se consultan cuando la pregunta es «¿por qué esta superficie está hecha así?», no cuando se está
> construyendo lo de hoy.
>
> **Por qué AHORA**: el índice vivo rozó su tope CUATRO veces en un mismo día (2026-08-25) y cada
> vez se pagó comprimiendo filas buenas. Comprimir es la respuesta cuando sobra grasa; cuando lo que
> sobra es historia cerrada, la respuesta es mudarla.

| § | Qué decidió | Línea en `99` |
|---|---|---|
| §91 | 🔎 **SEO técnico de OLA 1**: `PUBLIC_SITE_ENV` se leía en 2 sitios y no se declaraba en ninguno ⇒ **todo build salía `noindex`**, el del cutover también. Mapa de 68 URLs → 301, `robots`/`sitemap` conscientes del entorno, candado en `verify:build` #6. | 2464 |
| §92 | 🗺️ **13 landings de zona** (ítem 4): redirects y sitemap **derivados de `ZONAS`**, imposibles de desincronizar. CERO datos cuantitativos (el portal ya se quemó con listings fabricados). Al pasar: el portal no tenía **ni un JSON-LD** ni `canonical`. | 2520 |
| §93 | 💰 **`/precios`** (ítem 7, «el diferenciador gratis»): las cifras SELLADAS de `43`, no las del MEGA-PLAN, que están SUPERADAS. Lo no decidido se dice. ⚠️ §93.6: el footer dice «Avalúo gratis» y B13 lo prohíbe — dos fuentes del cerebro en contradicción legal. | 2560 |
| §94 | 🏷️ **Rango ALTORRA** (ítem 9): parecía gateado por Daniel y NO lo estaba — es contacto-primero, así que los rangos no son prerrequisito. Cierra el último `pendiente` del mapa de 301. B13: NO es un avalúo (Ley 1673). | 2598 |
| §95 | 🔖 **JSON-LD del negocio** en todas las rutas (`RealEstateAgent`, desde `BaseLayout`). Lo valioso son las 2 ausencias deliberadas: **sin `streetAddress`** (falta la dirección comercial) y **sin `aggregateRating`** (no hay reseñas; inventarlas la sanciona la SIC). | 2640 |
| §96 | 🔔 **Alertas guardadas + digest diario** (ítem 8) → **OLA 1 = 13/13**. Matching con UN dueño (web y Function importan el mismo módulo); la baja es **POST, nunca GET**. Y 3 bugs previos de propina ([[L-41]], [[LD-08]]). | 2686 |
| §97 | 🏠 **La ficha dinámica** (TODO-33): el gate de §60 era sobre INVENTAR los 4 bloques, no sobre construir — [[L-40]] 3ª vez. Ruta canónica `/inmueble/<slug>`. Lo grave lo cazó la revisión adversarial: no comprobaba que estuviera PUBLICADA ([[L-42]]). | 2771 |
| §98 | 🔌 **Dos premisas falsas**: Workers Caching llevaba sin habilitar desde Ola 0 (todo `s-maxage` era INERTE) y el panel no tenía puerta. 🔴 Y el hallazgo gordo: **`isStaff()` es insatisfacible** — el back-office moriría al desplegar las reglas. | 2858 |
| §99 | 🔑 **Decisión Fuerte: el claim de staff** (TODO-42). Se DERIVA de `usuarios/{uid}` con un trigger, en el legacy, y se despliega SOLO. Mató el `get()` en reglas (se factura aunque deniegue). 🎁 De regalo: las reglas del portal **matan `admin.html`** → TODO-43. | 2914 |
| §100 | 🔐 **Ruleset ÚNICO y fusionado** (TODO-43): había DOS con el mismo nombre y Firestore no fusiona — desplegar el del portal **mataba `admin.html`**. Permisos por CLAIM, escape de staff, 2 agujeros cerrados y el deny de Storage que tapaba las fotos. **80 tests**. | 2992 |
| §101 | 📥 **Bandeja de leads REAL** en el panel (ítem 10): entraban desde §88 y solo se veían en la consola de Firebase, con el correo roto. Consulta acotada, sin listeners. Si falla, **borra los de muestra** — enseñarlos haría llamar a gente que no existe. | 3054 |
| §102 | 🚀 **El runbook del cutover** + el interruptor que el CI **no declaraba**: sin `PUBLIC_SITE_ENV`, TODO build de la historia salía `noindex` — incluido el del cutover. 3 perillas con defaults seguros y seis fases con vuelta atrás. | 3104 |
| §103 | 🔀 **Dos escritores, un almacén, dos modelos**: `admin.html` y el portal escriben `propiedades` con esquemas incompatibles → índice vacío y cero errores. Motivo propio `esquema-legacy`. | 3162 |
| §104 | ⚖️ **El gate del RNT protegía la ficha y dejaba pasar la card**. `publicable()` se muda al MODELO; motivo `sin-rnt`. | 3219 |
| §105 | ⚖️ **«Avalúo»**: `42-LEGAL §9` no veta la palabra, veta atribuirse la actividad regulada (Ley 1673/RAA). Corte por quién produce el número. | 3266 |
| §106 | 🔎 **Recon del alta + 2 defectos vivos** (`geo.ciudad` vacía → arriendo sin matrícula; `imagenPortada:''` → sin card ni imagen al compartir). Dueño único. | 3323 |
| §107 | 📤 **Subida a R2 + identidad en el edge** (TODO-44): a R2 **no llegan las Rules**, así que el Worker verifica el ID token con WebCrypto (claim `admin`, cero lecturas). Devuelve la CLAVE, nunca la URL. ⚠️ El `put` real, sin ejercitar hasta la fase 1 del runbook. | 3389 |
| §108 | 🏗️ **El alta de propiedades** (dominio + transacción). `problemasParaPublicar()` LLAMA a los predicados del lector. Dos parsers numéricos: miles vs decimal. | 3443 |
| §109 | 🔬 **Auditoría Nivel-2 #8** — la 1ª que dispara el GATE, no una persona. Aporta una CLASE: el **✅ inmerecido** (el #27 perdona 90 rutas por basename; el #16 aprueba «CF 9» contra 11 exports). Un gate con 0 comparaciones debe DEGRADAR. | 3506 |
| §110 | 📋 **Listado de inmuebles**: se podía crear y no volver a verlo. La columna «¿se ve?» NO sale del estado —engaña en dos casos reales— sino de `problemasParaPublicar()`. | 3565 |
| §111 | ✏️ **Editar un inmueble** (CRUD cerrado). El compare-and-set va en el CLIENTE: la regla del servidor no ata al super_admin, que es quien usa el panel. Slug y `createdAt` congelados. | 3605 |
| §112 | 📅 **Agenda operativa** (GESTIÓN v1, 1er trozo): el modelo no derivaba nada. Aviso de renovación a 4 meses (el legal son 3), mora por escalones el día exacto, y `setMonth` desborda. | 3647 |
| §113 | ⚖️ **`crearContrato`** impone el gate del art. 16 (depósito prohibido en vivienda). Y el portal **no tenía typecheck**: 4 errores, uno en `main` desde §101. | 3695 |
| §114 | 📋 **Pantalla de contratos**: agenda arriba, lista debajo. La callable se llama por HTTP para no ensanchar `verify:data`. El nav se rutea por ID, no por posición. | 3745 |
| §115 | 💵 **Pagos**: las cifras las deriva el contrato, no el teclado. IVA sobre honorarios (nunca sobre el canon) e id determinista contra el cobro duplicado. | 3788 |
| §116 | 🗂️ **Tercer shard del índice** (§66-§90 → `00c`): el corte es semántico y el cap se MIDE, no se elige. | 3830 |
| §117 | 🎨 **El CSS acotado no llega a los nodos que crea el JS**: 5 tablas y el aviso del catálogo público sin estilo. Gate `verify:css`. | 3857 |
| §118 | 📂 **Expedientes y novedades**: la raíz que `crearContrato` exigía y nadie acuñaba. SLA de 48h con la mora, y validar el RESULTADO y no el parche. | 3913 |
| §119 | ✅ **Sello y export** (TODO-44 cerrado): la cola es una VISTA sin lecturas extra, y el CSV cierra la inyección de fórmulas. Me di un ✅ midiendo ceros. | 3967 |
| §120 | 🛡️ **Kernel v1.12.0**: el ✅ inmerecido mecanizado (#8/#16/#27 degradan si no comparan), trinquete del índice y los 22 caps con su eje bien puesto. | 4025 |
