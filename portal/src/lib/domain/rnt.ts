/*
 * EL NÚMERO DE RNT — dueño único de «¿qué cuenta como un RNT que se puede exhibir?».
 *
 * 🔴 POR QUÉ EXISTE. Hasta aquí el gate legal preguntaba `p.rnt?.trim()`: cualquier texto no vacío
 * valía como RNT. «pendiente», «en trámite desde 2024» o «R-1» pasaban el gate, entraban al índice
 * y la ficha los pintaba detrás de la etiqueta «RNT» — un anuncio que cumple la letra del formulario
 * y no la de la Ley 300/1996, que pide el NÚMERO del Registro Nacional de Turismo en toda publicidad
 * de alojamiento turístico. Una sigla seguida de «pendiente» es justo lo contrario de exhibirlo.
 *
 * 🎯 Lo preguntan todos al MISMO sitio: el gate de publicación (`motivoLegalNoPublicable`, y con él
 * la ficha vía `publicable`), el alta del panel (`construirPropiedad`), el índice
 * (`propiedadAResumen`) y los lectores del índice que pintan tarjetas (`esAnunciable`: el endpoint
 * del catálogo, las «similares» de la ficha y el correo de alertas). Si cada uno decidiera por su
 * cuenta qué es «un RNT», el día que diverjan se guarda algo que el índice descarta en silencio — la
 * clase de §103. Y lo que se EXHIBE junto a un precio sale de `rntDeResumen` (`catalogo.ts`) en las
 * tarjetas y el correo, y de `precioFicha` en la ficha: los dos terminan en `textoRnt`.
 *
 * ⚠️ Lo que NO sabe: si el número existe en el registro. Comprueba la FORMA, no la verdad.
 */

/**
 * Lo que va DELANTE del número, en cualquier orden: la sigla («RNT», «R.N.T.», «(RNT)» o el nombre
 * entero), lo que se escribe entre una sigla y su número —espacios, «:», «#», «.», «·», guion o
 * raya— y las abreviaturas de «número» («No.», «Nro.», «Núm.», «N.º», «nº», «N°», «número»). El
 * campo del panel es texto libre y cada operador lo teclea a su manera; lo que viene DETRÁS del
 * número, en cambio, no se perdona («100001 en trámite» no es un registro exhibible).
 *
 * ⚠️ «número» va ANTES que «Núm»: `replace` se queda con la primera alternativa que casa y no vuelve
 * atrás, así que en el orden inverso se comía «Núm» y dejaba «ero 12345», que ya no es un número.
 */
const ETIQUETA =
  /^(?:\(?R\.?N\.?T\.?\)?|Registro\s+Nacional\s+de\s+Turismo|n[úu]mero|N(?:o|ro|[úu]m)\.?|N\.?[º°]\.?|[\s:#.·–—-])*/i;
/**
 * El número en sí: cifras seguidas, o agrupadas de a tres con punto de miles («12.345»). Nada más.
 *
 * 🔴 Antes valía cualquier separador [ .-] entre dos cifras cualesquiera, y al pegarlas se inventaba
 * un número que nadie escribió: «RNT 87654-2025» (número y año de renovación) salía como
 * «876542025», «300 243 9810» (un teléfono) como RNT, y «RNT 3 2 8 5» como «3285». Exhibir un RNT
 * que no es el registrado es publicidad engañosa: el punto de miles es la única agrupación cuyo
 * pegado no cambia el número.
 */
const CIFRAS = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/;
/** Menos de 4 cifras SIGNIFICATIVAS no es un número de registro: es un dato suelto («RNT 123», «0012»). */
const MIN_CIFRAS = 4;
/**
 * Más de 8 cifras tampoco. El tope NO sale de una especificación del registro (no la tenemos): está
 * para que un celular (10 cifras) o un NIT (9 + el de verificación) pegado en el campo no se exhiba
 * como RNT. Si el registro emitiera números más largos, el alta lo dice en voz alta en el panel —la
 * dirección segura— y es aquí donde hay que mirar.
 */
const MAX_CIFRAS = 8;
/**
 * Un año suelto de 4 cifras: «RNT 2026» habla de la renovación del registro, no lo exhibe. Es la
 * misma exclusión que hace la sonda del build sobre el HTML (`scripts/lib/senales-estadia.mjs`); si
 * algún RNT real tuviera esa forma, el alta lo rechazará con un mensaje que lo dice.
 */
const ANIO = /^(?:19|20)\d\d$/;

/**
 * El número de RNT en DÍGITOS juntos, o `null` si el texto no trae uno exhibible.
 *
 * `'RNT-100001'` → `'100001'` · `'RNT No. 12.345'` → `'12345'` · `'pendiente'` → `null`.
 *
 * Fail-closed, como todo el gate: lo que no es claramente un número es `null`, y un `null` en
 * alojamiento es «no se publica». Solo ceros también es `null` (no hay cifras significativas):
 * «RNT-000000» es la plantilla del campo del panel sin rellenar, no un registro.
 *
 * 🎯 Lo que acepta, exhibido con `textoRnt` —y también tal cual tras la etiqueta «RNT», que es como
 * lo pinta la fila de la ficha técnica—, lo reconoce la sonda del build; `rnt.test.ts` lo comprueba
 * caso a caso.
 * Al revés no: la sonda lee páginas enteras y admite texto detrás del número y cifras unidas con
 * guion, que aquí no valen.
 *
 * El `typeof` no es ceremonia: el rebuild del índice lee los documentos con un `as Propiedad` a
 * ciegas, y un `rnt` numérico colado por otro escritor haría saltar un `.trim()` — y con él el
 * rebuild de los tres shards, no solo el de esta ficha.
 */
export function numeroRnt(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  // El punto final se perdona: «RNT 12345.» es una frase terminada, no otro número.
  const resto = raw.trim().replace(ETIQUETA, '').replace(/\.$/, '');
  if (!CIFRAS.test(resto)) return null;
  const digitos = resto.replace(/\D/g, '');
  if (digitos.replace(/^0+/, '').length < MIN_CIFRAS || digitos.length > MAX_CIFRAS) return null;
  if (ANIO.test(digitos)) return null;
  return digitos;
}

/**
 * El RNT tal como se EXHIBE: `RNT 100001`. Recibe el número ya normalizado por `numeroRnt`, no el
 * texto del operador, así que la ficha, las tarjetas y el correo enseñan el MISMO formato aunque el
 * panel lo tecleara como «R.N.T. No. 12.345».
 */
export function textoRnt(numero: string): string {
  return `RNT ${numero}`;
}
