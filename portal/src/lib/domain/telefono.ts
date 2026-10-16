/*
 * EL TELÉFONO DE QUIEN NOS ESCRIBE — una regla, un dueño ([[L-45]]).
 *
 * Lo leen el endpoint que guarda el lead (`/api/solicitud`, que decide si se acepta) y el panel que
 * arma el enlace de WhatsApp para responderle (`scripts/gestion-leads.ts`). Antes cada uno tenía su
 * versión, y las dos fallaban en el mismo sitio: la forma en que la gente escribe un número.
 *
 * Lo que se GUARDA es lo que la persona tecleó (sin espacios sobrantes): normalizar al guardar
 * cambiaría un contrato que ya leen el panel viejo y los correos. Se normaliza al LEER.
 */

/**
 * Lo que se acepta escribir: dígitos y los separadores con que la gente escribe un número en
 * Colombia —espacios, puntos (el móvil escrito de tres en tres con puntos), guiones, paréntesis y el «+» del prefijo—, de 7 a 20
 * caracteres. Los puntos se aceptan desde §330: rechazarlos devolvía un error a alguien que había
 * escrito bien su número.
 */
const FORMA = /^[+()\d][\d\s().+-]{6,19}$/;

/** 7 dígitos es un fijo local de los de antes; 15 es el máximo de un número internacional (E.164). */
const MIN_DIGITOS = 7;
const MAX_DIGITOS = 15;

/** Solo los dígitos. */
export const digitosDe = (t: string): string => t.replace(/\D/g, '');

/**
 * ¿Se acepta este teléfono? La forma Y la cuenta de dígitos: «(((((((» cumplía la forma de antes
 * y no es un número de nada.
 */
export function telefonoValido(t: string): boolean {
  const s = t.trim();
  if (!FORMA.test(s)) return false;
  const n = digitosDe(s).length;
  return n >= MIN_DIGITOS && n <= MAX_DIGITOS;
}

/**
 * El número en formato internacional, solo dígitos —lo que pide `wa.me/`—, o `null` si no se puede
 * saber de qué país es.
 *
 * 🔴 POR QUÉ EXISTE. El panel armaba `wa.me/` con los dígitos tal cual: un móvil escrito con sus
 * 10 dígitos —lo que el propio formulario sugiere— salía sin el 57 delante, y WhatsApp lo lee como
 * un número internacional que no existe. El botón que tiene que permitir responder en 5 minutos no
 * abría el chat de nadie. (Sin números de ejemplo en este comentario: el build del servidor conserva
 * los comentarios y `verify:build` caza todo teléfono publicado que no sea el del negocio.)
 *
 * Las reglas son las de la marcación colombiana a 10 dígitos (CRC, vigente desde el 1-dic-2021): un
 * móvil son 10 dígitos que empiezan por 3; un fijo, 10 que empiezan por 60 (Cartagena: 605).
 *   · Con «+» delante → ya es internacional: se quedan los dígitos.
 *   · Con «00» delante → prefijo internacional marcado a mano: se quita.
 *   · 10 dígitos que empiezan por 3 o por 60 → es de Colombia: se antepone el 57.
 *   · 12 dígitos que empiezan por 57 y siguen como un número colombiano → ya trae el país.
 *   · Cualquier otra cosa → `null`. No se adivina un país: un enlace a un desconocido es peor que
 *     ningún enlace.
 */
export function numeroWhatsApp(t: string): string | null {
  const s = t.trim();
  if (!telefonoValido(s)) return null;
  const d = digitosDe(s);
  if (s.startsWith('+')) return d;
  if (d.startsWith('00')) {
    const resto = d.slice(2);
    return resto.length >= MIN_DIGITOS ? resto : null;
  }
  const colombiano = (n: string) => n.length === 10 && (n.startsWith('3') || n.startsWith('60'));
  if (colombiano(d)) return `57${d}`;
  if (d.length === 12 && d.startsWith('57') && colombiano(d.slice(2))) return d;
  return null;
}
