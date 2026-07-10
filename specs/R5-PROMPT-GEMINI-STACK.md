# 🛰️ PROMPT PARA GEMINI (Antigravity) — 2ª opinión adversarial: stack del portal ALTORRA

> **Instrucciones para Daniel**: abre Antigravity sobre este repo (`altorrainmobiliaria.github.io`),
> pega TODO lo que está debajo de la línea, y tráele a Claude la respuesta completa de Gemini.
> Gemini es SOLO-LECTURA aquí: si intenta editar archivos, cancela.

---

Eres un arquitecto de software senior actuando como **revisor externo adversarial**. NO edites ningún
archivo — tu único entregable es tu análisis escrito. No conoces las conclusiones de otros revisores y
debes formarte un **criterio independiente**.

## El negocio
ALTORRA Inmobiliaria (Cartagena, Colombia) construye desde cero su portal inmobiliario en
`altorrainmobiliaria.co`. Equipo: 1 fundador no-técnico + agentes de IA que implementan. Presupuesto de
infraestructura objetivo: ~$0 en reposo, bajísimo a escala inicial. Lee para el contexto real del
mercado y del producto (solo lectura):
- `docs/41-MERCADO.md` — mercado colombiano, competencia verificada, oportunidades.
- `docs/42-LEGAL.md` — reglas legales duras que el producto no puede violar.
- `specs/R2-REFERENTES-MUNDO-2026-07.md` (secciones 1-4) — el catálogo de features objetivo.
- `specs/R1-COMPETENCIA-2026-07.md` (sección 2) — las 14 oportunidades por ola.

## Requisitos duros del sistema
1. **3 lados**: catálogo propio de la inmobiliaria + marketplace autoservicio para particulares
   (publicar con fotos, planes de pago) + portal de aliados/brokers (leads, panel, suscripción).
2. **Vertical de corta estancia turística**: búsqueda por fechas/huéspedes, calendario de
   disponibilidad por propiedad, reserva con **pago protegido** (anticipo retenido, liberación al
   check-in) vía pasarela colombiana (PSE/tarjetas/Nequi).
3. **SEO programático masivo como canal #1**: cientos de landings barrio×tipo×operación, fichas
   permanentes con JSON-LD server-rendered y og:image dinámica por propiedad, sitemaps segmentados,
   frescura visible (precio actualizado). Core Web Vitals sólidos en móviles de gama media.
4. Leads a BD propia + WhatsApp-first (canal de conversión dominante en Colombia).
5. Operabilidad para no-técnicos: deploys simples, rollbacks, cero mantenimiento de servidores.
6. Datos legacy ≈ cero (arranque limpio). Hay experiencia previa del equipo con Firebase
   (Firestore/Auth/Functions, proyecto Blaze ya existente) — cambiarla tiene costo de re-aprendizaje.

## Tus 3 entregables (en este orden — IMPORTANTE)
**A) TU stack propuesto desde cero** (antes de leer cualquier candidato): por capa — hosting/CDN,
framework y estrategia de rendering POR SUPERFICIE (landing SEO / búsqueda con filtros / ficha /
booking / paneles), base de datos, auth, storage+pipeline de imágenes, pagos con retención, mapas,
búsqueda facetada+geo, email/notificaciones. Justifica cada capa con límites/costos REALES 2025-2026.

**B) Crítica adversarial del candidato** que está sobre la mesa (NO es decisión tomada):
`Cloudflare Pages + Astro (SSG/islands) + Firebase (Auth/Firestore/Functions) + Cloudflare R2 (imágenes)
+ Wompi (pagos) + MapLibre/Protomaps (mapas)`.
¿Dónde se rompe? Puntos ciegos concretos: ¿la búsqueda facetada+geo contra Firestore aguanta?
¿el booking transaccional con retención de fondos? ¿el SSR necesario (dónde corre)? ¿la frescura de
fichas con SSG? ¿el pipeline de imágenes? ¿los límites free-tier reales bajo carga? ¿el split
Cloudflare+Google (dos nubes) para un equipo de 1?

**C) Veredicto**: si TU stack (A) difiere del candidato, ¿el delta de valor justifica renunciar a la
experiencia Firebase acumulada? ¿Qué 3 condiciones le pondrías al stack ganador para firmar tú el ADR?

Sé específico y cita fuentes/documentación donde afirmes límites o precios. Errores factuales míos
esperables: corrígelos con evidencia.
