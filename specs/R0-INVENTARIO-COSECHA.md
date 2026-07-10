# 🧺 R0 — INVENTARIO DE COSECHA (greenfield 2026-07-10)

> **Artefacto R0** (kickoff §5): lo ÚNICO que el portal nuevo hereda del viejo. Estado: 🔄 EN CURSO.
> Regla innegociable: código/diseño/arquitectura del viejo NO entran — solo lo listado aquí.

## Checklist

- [x] Censo de URLs indexadas (63, del `sitemap.xml` viejo vía git `6149652`) — base del mapa 301 (2026-07-10)
- [x] Destilado `_legacy` (requisitos + datos + lecciones) — workflow `wf_a8b895c6` 9/9 agentes → `specs/R0-DESTILADO-LEGACY.md` (52 features · 21 activos · 39 lecciones candidatas · crudo en la bóveda `research-archive/2026-07-10`) (2026-07-10)
- [x] Censo Firestore REAL (2026-07-10, REST pública + rules): **`propiedades` VACÍA** (las 5 propiedades ya NO están en la BD; `system/meta` sin tocar desde 2026-04-17) · `config/general` vivo y correcto (+57 300 243 9810 / info@) · `solicitudes` protegida por rules (conteo PENDIENTE — requiere MCP re-arrancado o consola) · **fichas de las 5 propiedades RESCATADAS del git (`6149652:p/*.html`, JSON-LD completo) → bóveda `research-archive/2026-07-10-cosecha-propiedades/`**
- [x] Estado real Firebase (2026-07-10): **7 CFs gen2 vivas** (`functions:list` — `cleanupOldLoginAttempts` NO desplegada, la doc decía 8) · plan **Blaze** (confirmado por el dueño; ⚠️ el MCP reportó "Billing Enabled: No" — verificar en consola) · cuenta CLI `altorrainmobiliaria@gmail.com` activada como default del directorio · Storage sin censar
- [ ] Auditoría docs maestros del dueño (`ALTORRA Company (Legal)` + `all_docx_content.txt` 690KB)
- [x] Estado matrícula de arrendador: **OBTENIDA** ✅ (dueño, 2026-07-10) — certificado/Nº se ve al final de la construcción; va al footer del portal como sello de confianza
- [ ] Plan de migración de datos → modelo nuevo (se sella en R5)

## 1. Censo de URLs indexadas (mapa 301 — destino se asigna en R5)

Fuente: `git show 6149652:sitemap.xml` (último sitemap del sitio viejo, 2026-07-10). Hoy todas
responden stub meta-refresh→home (ADR §15). Al lanzar el portal nuevo, cada una recibe su 301
definitivo (Cloudflare) según el mapa de secciones del MEGA-PLAN.

**Núcleo (6)**: `/` · `propiedades-comprar.html` · `propiedades-arrendar.html` · `propiedades-alojamientos.html` · `busqueda.html` · `detalle-propiedad.html`
**Inversión/recursos (16)**: `invertir` · `renta-turistica` · `turismo-inmobiliario` · `foreign-investors` · `guia-inversionista-2026` · `estudios-mercado-cartagena` · `glosario-inmobiliario` · `prensa` · `videos` · `simulador` · `simulador-notarial` · `arrendar-vs-comprar` · `faq` · `recursos` · `costos-cierre` · `casos-exito`
**Empresa/servicio (10)**: `colecciones` · `equipo` · `avaluo` · `mapa` · `contacto` · `quienes-somos` · `publicar-propiedad` · `favoritos` · `servicios-mantenimiento` · `servicios-mudanzas` (+ `privacidad`)
**Blog (7)**: `blog.html` + 6 posts (`vale-la-pena-invertir-cartagena-2026` · `mejores-zonas-airbnb-cartagena` · `impuestos-inmobiliarios-colombia-2026` · `por-que-invertir-cartagena-2026` · `renta-turistica-vs-arriendo-tradicional` · `guia-legal-inversionistas-extranjeros`)
**Landings SEO sector/zona (17)**: `comprar-apartamento-cartagena` · `arrendar-apartamento-cartagena` · `invertir-airbnb-cartagena` · `propiedades-baru` · `lotes-campestres-cartagena` · `serena-del-mar` · `karibana` · `manzanillo-del-mar` · `la-boquilla` · `cielo-mar` · `san-diego` · `el-laguito` · `marbella` · `el-cabrero` · `pie-de-la-popa` · `alto-bosque` · `tierrabomba`
**Fichas de propiedad (5)**: `p/101-27` · `p/102-11402` · `p/103-B305` · `p/104-01` · `p/105-4422`

💎 Lectura estratégica: las 17 landings de zona + 6 posts son la semilla del SEO programático del
portal nuevo (las zonas de Cartagena YA tienen historial); las 5 fichas `p/` mapean a las 5
propiedades reales de Firestore (IDs 101-105).

## 2. Datos a migrar (censo REAL 2026-07-10 — REST pública contra Firestore vivo)

- **`propiedades`: VACÍA en la BD** (rules `allow read: if true` + lista `{}` = vacío auténtico; doc directo `101-27` → 404). Las 5 propiedades que la doc de abril registraba se rescataron del historial git con TODO su detalle (JSON-LD: nombre, precio, specs, imágenes) → bóveda privada `2026-07-10-cosecha-propiedades/`:
  | ID | Inmueble | Precio COP |
  |---|---|---|
  | 101-27 | Apartamento exclusivo — Edificio Allure | 5.350.000.000 |
  | 102-11402 | Apartamento moderno amoblado — Conj. Milán | 386.000.000 |
  | 103-B305 | Apartamento amoblado — Conj. Trevi | 565.000.000 |
  | 104-01 | Casa familiar — Barrio Country | 380.000.000 |
  | 105-4422 | Apartamento moderno — Conj. Milán | 350.000.000 |
  ✅ RESPUESTA DEL DUEÑO (2026-07-10): **ya NO son inventario — descartadas** (copia de bóveda borrada;
  el git history del repo las retiene). → **La migración de datos queda reducida a**: conteo/rescate de
  `solicitudes` (leads) + los valores de `config/general` (ya censados). El portal nuevo arranca con
  catálogo desde cero.
- `config/general`: contacto/redes correctos (censado ✓ — mismo dato que la página de mantenimiento).
- `solicitudes` (leads históricos, PII): protegida por rules ✓; CONTEO pendiente (MCP con credencial stale — reiniciar sesión o consola).
- Storage (imágenes): sin censar; las fichas rescatadas apuntan también a postimg.cc (host externo).
- SEO: censo §1 + meta GSC preservada (doble: meta tag + archivo HTML).

## 3. Documentos del dueño (fuente R2/R3/R4)

`C:\Users\romad\Downloads\ALTORRA Company (Legal)\` — RUT/Cámara (validados en kickoff §1),
contratos reales de administración/arrendamiento + otrosíes, protocolo de leads + scripts WA,
`all_docx_content.txt` (690KB, todos los docx parseados). Auditar, no asumir (advertencia del dueño).
