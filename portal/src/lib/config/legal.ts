/*
 * Textos legales y su VERSIONADO — SSoT única del portal.
 *
 * `42-LEGAL` (regla transversal): «TODO texto legal se versiona (fecha+hash) y la aceptación
 * referencia esa versión exacta». Y el kit `08-AVISO-PRIVACIDAD-Y-AUTORIZACIONES` §2.2 fija la
 * regla de oro (D.1377/2013 art. 7): **el silencio jamás equivale a autorización, ninguna casilla
 * viene premarcada**, y cada aceptación deja prueba consultable (Ley 1581 art. 9).
 *
 * Por eso estas constantes las usan LOS DOS lados: las páginas de `/legal/*` para mostrar qué
 * versión rige, y `/api/solicitud` para SELLAR en el documento qué versión aceptó el titular.
 * Si un texto cambia, se sube su versión AQUÍ — así la prueba nunca apunta a un texto que ya no existe.
 */

export const LEGAL = {
  politicaDatos: {
    version: 'V2',
    vigencia: '28 de julio de 2026',
    ruta: '/legal/politica-tratamiento-datos',
    titulo: 'Política de Tratamiento de Datos Personales',
  },
  /** Versión del TEXTO del checkbox (kit `08` §2.2). Independiente de la versión de la Política. */
  formatoAutorizacion: 'Formato A-digital V1',
} as const;

/**
 * Texto EXACTO del checkbox obligatorio, tomado del kit `08` §2.2. No improvisar variantes:
 * el texto aceptado se archiva y la prueba lo referencia por versión.
 */
export const TEXTO_AUTORIZACION = {
  /** El texto va en partes SOLO para poder enlazar los dos documentos sin trocear cadenas a mano. */
  p1: 'He leído el ',
  linkAviso: 'Aviso de Privacidad',
  p2: ' y autorizo a ALTORRA COMPANY S.A.S. (NIT 902.063.965-4) el tratamiento de mis datos personales para atender esta solicitud y gestionar la relación comercial, conforme a su ',
  linkPolitica: 'Política de Tratamiento de Datos Personales',
  p3: ', incluida la transmisión a proveedores tecnológicos con servidores en EE. UU.',
  /** Cadena completa — la que se archiva como "texto aceptado" (kit `08` §2.2). */
  plano:
    'He leído el Aviso de Privacidad y autorizo a ALTORRA COMPANY S.A.S. (NIT 902.063.965-4) el ' +
    'tratamiento de mis datos personales para atender esta solicitud y gestionar la relación comercial, ' +
    'conforme a su Política de Tratamiento de Datos Personales, incluida la transmisión a proveedores ' +
    'tecnológicos con servidores en EE. UU.',
} as const;

/** Ruta del Aviso de Privacidad (kit `08` Parte 1). */
export const RUTA_AVISO = '/privacidad';

/** Casilla OPCIONAL y separada (no condiciona el servicio). Kit `08` §2.2. */
export const TEXTO_MARKETING =
  'Quiero recibir información comercial de ALTORRA por estos canales (opcional; revocable en cualquier momento).';

/** Sello de consentimiento que se guarda con CADA lead (kit `08` §2.2 «Registro de prueba»). */
export interface PruebaConsentimiento {
  autorizado: true;
  textoVersion: string;
  politicaVersion: string;
  formulario: string;
  marketing: boolean;
  aceptadoEn: string;
  ip: string;
  userAgent: string;
}
