/*
 * Versiones de los textos legales — SSoT única.
 *
 * `42-LEGAL` (regla transversal): «TODO texto legal se versiona (fecha+hash) y la aceptación
 * referencia esa versión exacta». Por eso estas constantes las usan LOS DOS lados:
 *  · las páginas de `/legal/*` para mostrar versión y vigencia, y
 *  · el endpoint de leads para SELLAR en el documento qué versión aceptó el titular.
 * Si un texto cambia, se sube su versión AQUÍ: así la prueba de consentimiento nunca apunta
 * a un texto que ya no existe.
 *
 * ⚠️ La Política V2 es la del kit fundacional (`07-POLITICA-TRATAMIENTO-DATOS`, auditada), la
 * misma versión que citan los 24 documentos. No cambiar la versión sin regenerar el kit.
 */
export const LEGAL = {
  politicaDatos: {
    version: 'V2',
    vigencia: '28 de julio de 2026',
    ruta: '/legal/politica-tratamiento-datos',
    titulo: 'Política de Tratamiento de Datos Personales',
  },
} as const;

/** Texto del consentimiento que acompaña al checkbox. Cambiarlo obliga a subir la versión. */
export const AVISO_AUTORIZACION =
  'Autorizo a ALTORRA COMPANY S.A.S. a tratar mis datos personales conforme a su Política de Tratamiento de Datos.';
