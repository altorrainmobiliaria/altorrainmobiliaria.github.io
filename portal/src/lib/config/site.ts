// Configuración pública del sitio — constantes de MARCA estables (hechos verificados del cerebro).
//
// Lo DINÁMICO (tarifas, textos editables, etc.) migra a la colección `config` de Firestore en
// Ola 0 ítem 7 (doctrina §3.2: no hardcodear lo que cambia). Estas constantes son hechos de marca
// estables y públicos, seguros de fijar en código.
//
// ⛔ REGLA PERMANENTE: JAMÁS publicar el número personal del dueño (323…). El único WhatsApp
//    público es el del negocio (+57 300 243 9810).
export const SITE = {
  name: 'ALTORRA Inmobiliaria',
  // Razón social vigente. La antigua "ALTORRA S.A.S." (NIT 901.976.611-7) entra en liquidación:
  // JAMÁS usarla en contratos/facturas/footer nuevos (ADR §18 / MEGA-PLAN §4.5).
  legalName: 'ALTORRA COMPANY S.A.S.',
  nit: '902063965-4',
  // Matrícula de Arrendador (Ley 820/2003 art. 28) — OBLIGATORIA en toda publicidad de arriendo
  // de vivienda (art. 31). Es el número de la Resolución 6636 del 23-jul-2026 de la Alcaldía de
  // Cartagena: su art. 2º decía «asígnese el número que le corresponda por el sistema», y la
  // Oficina Asesora Jurídica confirmó el 2026-08-20 que ese número ES el de la resolución y que
  // el registro digital ya está inscrito. Detalle y evidencia → `43-OPERACION §Matrícula`.
  matriculaArrendador: '6636',
  // Eslogan OFICIAL (Daniel 2026-07-11, `CLAUDE.md §1`). REEMPLAZA al viejo «Gestión integral en
  // soluciones inmobiliarias», que estuvo aquí hasta 2026-08-21: el kernel se reconcilió en su día
  // pero el código no, y salía en el <title> de la home. No reintroducirlo.
  slogan: 'Seguridad, Legalidad y Confianza',
  city: 'Cartagena de Indias, Colombia',
  domain: 'altorrainmobiliaria.co',
  contact: {
    whatsapp: '+57 300 243 9810',
    whatsappLink: 'https://wa.me/573002439810',
    email: 'info@altorrainmobiliaria.co',
  },
  social: {
    instagram: 'https://instagram.com/altorrainmobiliaria',
    facebook: 'https://facebook.com/altorrainmobiliaria',
    tiktok: 'https://tiktok.com/@altorrainmobiliaria',
  },
} as const;
