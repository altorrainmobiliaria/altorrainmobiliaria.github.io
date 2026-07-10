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
  slogan: 'Gestión integral en soluciones inmobiliarias',
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
