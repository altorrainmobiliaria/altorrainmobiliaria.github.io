# 🎯 Visión FUNCIONAL del producto — Portal ALTORRA Inmobiliaria

> **Qué es · para qué sirve · qué hace · quién lo usa** — la visión de producto del portal, destilada del
> `MEGA-PLAN-INMOBILIARIA.md` (SSoT del roadmap) + el kickoff Fable + el mandato verbatim del dueño.
> **Sin diseño** (el diseño lo decide el dueño en Claude Design). Pensada para tenerla a la mano y no
> perder la visión, y para pasársela a la herramienta de diseño como contexto funcional.
> Fuente: `specs/MEGA-PLAN-INMOBILIARIA.md`, `specs/2026-07-10-INMOBILIARIA-KICKOFF-fable5.md`,
> `specs/2026-07-10-INMOBILIARIA-MANDATO-DUENO-verbatim.md`. Escrito 2026-07-11 (OPUS 4.8).

---

## 1. Qué es y para qué sirve

El portal digital de **ALTORRA COMPANY S.A.S** (línea inmobiliaria), con sede en Cartagena. No es solo la
vitrina de los inmuebles de ALTORRA: es una **plataforma inmobiliaria completa de 3 lados (+ back-office)**
que cubre todo el sector — buscar, publicar, gestionar, cobrar — pensada para superar a los portales líderes
del país (ciencuadras, metrocuadrado, fincaraiz, coninsa, araujoysegovia, arenas) y traer el estándar de
QuintoAndar / Zillow / Airbnb a Cartagena. Meta declarada del dueño: la web inmobiliaria más completa, que
"acapare todo el sector y todas las necesidades".

## 2. Líneas de negocio (lo que el portal opera y monetiza)

1. **Venta** de inmuebles captados por ALTORRA.
2. **Administración** de inmuebles (contratos reales ya operando; honorarios ~8-12% mensual) = el módulo GESTIÓN.
3. **Arriendo tradicional / larga estancia**.
4. **Arriendo de corta estancia** (turístico, con RNT) — con RESERVA REAL.

**Secundaria/futura:** tours / turismo inmobiliario (gancho; sin convenio aún; se integra más adelante, no en el MVP).

## 3. La plataforma de 3 lados (+ back-office)

- **B2C listado propio:** inmuebles captados por ALTORRA (venta / arriendo / estancias).
- **Marketplace por SUSCRIPCIÓN self-service:** "véndelo tú mismo / arriéndalo tú mismo / nosotros lo hacemos por ti". Los propietarios pagan un plan para publicar y gestionar, con upsell al servicio full de ALTORRA. Monetización vía suscripciones (Wompi).
- **Portal de ALIADOS / BROKERS:** gestionan sus propiedades y clientes en un solo lugar, con seguimiento de prospectos, citas/visitas/tareas y control de equipo en tiempo real. Suscripción.
- **Panel de ADMINISTRACIÓN ALTORRA:** inventario + CRM + automatización, superior al de la línea cars y pensado para inmobiliaria.

## 4. Quiénes lo usan (actores) y qué hace cada uno

### a) Visitante (público, sin registro)
- Busca por operación (comprar / arrendar / corta estancia / invertir), zona, tipo, precio, habitaciones.
- Ve resultados con mapa de Cartagena y filtros; abre fichas con galería, precio transparente (arriendo: canon + administración por separado; estancia: noche + aseo con total), frescura + historial de precio, sellos legales (RNT, matrícula) y similares.
- Contacta por WhatsApp sin registro (WhatsApp-first, sin gating) y agenda visita por slots.
- En corta estancia: busca por fechas/huéspedes, ve calendario y solicita reserva.
- Consulta la página de PRECIOS pública, las landings por sector, el Journal y el Rango ALTORRA / Rentímetro (estimación de valor y renta; nunca se llama "avalúo", por ley).

### b) Usuario registrado (panel de usuario)
- Cuenta con autenticación (email/contraseña).
- Guarda **favoritos** y listas.
- Configura **alertas** de búsqueda (email + digest diario) con consentimiento de datos.
- **Perfil de inquilino reutilizable 1→N:** sube sus documentos una sola vez (checklist + revisión humana, sin codeudor) y postula a varias propiedades.
- Ve el estado de sus solicitudes/postulaciones y su historial.

### c) Propietario (dos caminos + su portal)
- **Self-service (suscripción):** publica su inmueble con un wizard generoso (15+ fotos, sin caducidad), lo gestiona y ve sus leads.
- **Delegar en ALTORRA (consignación/administración):** entrega el inmueble; ALTORRA lo capta, publica y administra.
- **Portal del propietario (GESTIÓN v3):** ve su inmueble administrado, sus pagos recibidos, reportes, documentos y novedades. Lema: "usted descansa, nosotros nos encargamos".

### d) Inquilino (portal del inquilino, GESTIÓN v3)
- Paga el canon en plataforma (v2), reporta novedades/tickets, descarga paz y salvos y documentos, consulta su contrato y sus fechas.

### e) Anfitrión de corta estancia
- Publica alojamiento (RNT obligatorio + declaración PH), gestiona calendario/disponibilidad, recibe y confirma solicitudes de reserva, coordina check-in/out y limpieza (liquidaciones en v2).

### f) Aliado / Broker (portal de aliados)
- Gestiona su inventario de propiedades y su cartera de clientes.
- Pipeline de prospectos; organiza citas, visitas y tareas; reporte y control de su equipo en tiempo real; cierra más ventas y arriendos.
- Acceso por suscripción (propuesta de valor superior a Fincaraíz OV / Proppit).

### g) Admin ALTORRA (panel de administración)
- CRUD de propiedades + cola de verificación humana → sello "Verificado por ALTORRA".
- CRM: leads con scoring automático + SLA de respuesta de 5 minutos (protocolo del dueño) + notificación por email/WhatsApp.
- Módulo GESTIÓN completo (ver §6).
- Automatización de tareas repetitivas del sector, exportaciones y control.

## 5. Módulos funcionales del portal público

- **Home** (buscador + categorías + zonas + confianza).
- **Resultados de búsqueda (SERP)** por operación, con mapa (MapLibre), filtros por chips y paginación.
- **Ficha de inmueble:** galería, características, precio transparente con desglose, frescura + historial de precio, ubicación en mapa, sellos legales (RNT/matrícula), datos estructurados para SEO, similares y acción clara (WhatsApp + agendar visita).
- **Landings por sector/barrio (13+):** contenido editorial real por zona (solo zonas seguras), con conteos.
- **Corta estancia con RESERVA:** búsqueda por fechas/huéspedes, calendario por propiedad, solicitud → confirmación del anfitrión → coordinación (v1 sin dinero; v2 con pago protegido Wompi).
- **Publica tu propiedad:** wizard de 3 pasos, gratis y generoso, con verificación humana.
- **Página de PRECIOS pública** (comisiones y planes transparentes) — diferenciador.
- **Alertas guardadas** (email + digest).
- **Rango ALTORRA + Rentímetro turístico** (estimación de valor y de renta por barrio).
- **Journal Inmobiliario** (mercado, inversión, guías) — autoridad + visibilidad (SEO/AEO).
- **Captura de leads** (solicitudes + scoring + notificación al admin).

## 6. Módulo GESTIÓN (back-office operativo — el negocio de administración)

Digitaliza la operación real del dueño (hoy "en la mente y por WhatsApp"):

- **v1 (Ola 1):** expediente por inmueble; contratos (administración + arriendo) con partes, canon, día de pago, vigencia, renovación automática y % de honorarios, con documentos en bóveda privada; calendario de recordatorios (pago del canon, pago al propietario antes del día 10, servicios públicos, renovación con alerta a 4 meses, incremento IPC anual); novedades/tickets (inquilino → seguimiento → resolución); registro de pagos con estado de mora (día 5/10/15/30/45).
- **v2 (Ola 2):** cobro del canon EN plataforma (Wompi recurrente + payout al propietario con honorarios descontados); liquidaciones de corta estancia al anfitrión; pipeline de VENTA de 7 etapas (oferta → promesa → escritura → registro ORIP) con documentos.
- **v3 (Ola 3):** portal del propietario + portal del inquilino.

## 7. Integraciones e infraestructura (funcional)

- **Autenticación y datos:** Firebase (Auth, Firestore, Cloud Functions, notificaciones).
- **Imágenes:** Cloudflare R2 (las fotos de los inmuebles).
- **Pagos y suscripciones:** Wompi (PSE, tarjetas, Nequi) — booking protegido, suscripciones, cobro de canon, payouts.
- **Mapas:** MapLibre (resultados y ficha).
- **Búsqueda:** Firestore (fase 1) → Typesense al escalar (fase 2).
- **Mensajería:** WhatsApp-first (enlaces trazables) → WhatsApp Business API al crecer.
- **Entrega/hosting:** Cloudflare Workers + Astro sobre altorrainmobiliaria.co (rápido y SEO-first).
- **Visibilidad:** SEO técnico (datos estructurados, sitemaps), GA4, Search Console, Google Business Profile.
- **Todo pensado free-tier y escalable:** arranca sin presupuesto y crece con la empresa.

## 8. Diferenciales (por qué supera a la competencia)

- Corta estancia con RESERVA real (hueco del mercado colombiano).
- Transparencia radical de precios y costos.
- Frescura verificada de los avisos + sello "Verificado por ALTORRA".
- Publicación generosa a particulares (gratis, sin caducidad).
- WhatsApp-first sin gating.
- Perfil de inquilino reutilizable sin codeudor.
- Módulo GESTIÓN (administración digitalizada) que la competencia no ofrece integrado.
- A futuro: garantía de arriendo con aseguradora.

## 9. Legalidad y seguridad (por diseño funcional)

- Matrícula de Arrendador visible (footer + cada aviso de arriendo): requisito legal + sello de confianza.
- RNT obligatorio en corta estancia (bloqueante al publicar alojamiento).
- Habeas Data (Ley 1581): consentimiento en el primer formulario; documentos privados protegidos.
- Retención de fondos en booking (gate legal antes de mover dinero).
- Footer legal con razón social y NIT exactos (ALTORRA COMPANY S.A.S · NIT 902063965-4).
- Jamás se publica el contacto personal/registral del dueño.

## 10. Roadmap funcional por olas

- **Ola 0 (fundaciones):** infraestructura, modelo de datos (propiedades, solicitudes, disponibilidad, config + entidades de GESTIÓN desde el día 1), página de obra, textos legales, Google Business Profile.
- **Ola 1 (MVP público):** home, búsqueda con mapa, ficha, landings de sectores, corta estancia sin dinero, publica tu propiedad, precios, alertas, Rango/Rentímetro, admin v1, leads y GESTIÓN v1.
- **Ola 2 (dinero + arriendo digital):** booking con pago protegido Wompi, portal de aliados/brokers self-service, perfil de inquilino reutilizable, GESTIÓN v2 (cobro + payout + pipeline de venta), destacados de particulares.
- **Ola 3 (expansión):** garantía de arriendo, loop inversión → renta turística, pagos recurrentes de canon, búsqueda Typesense, Índice ALTORRA, portal del propietario y del inquilino.

## 11. Visión de crecimiento

Cartagena es la raíz; el horizonte es la Costa Caribe, luego nacional, con mira internacional. Arranca sin
presupuesto y escala con la empresa, sin re-plataformar. El sello innegociable en cada función:
**Seguridad, Legalidad y Confianza.**
