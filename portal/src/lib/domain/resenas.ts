/*
 * CALIFICACIÓN DE HUÉSPEDES — diseñada para que una cifra inventada sea IMPOSIBLE (§281).
 *
 * Daniel decidió el 31-ago añadirla al modelo, con la condición que él mismo puso sobre la mesa:
 * *«si la pone ALTORRA sin reseñas reales detrás, volvemos al mismo problema»*. Todo lo que sigue
 * existe para cumplir esa condición, no para pintar estrellas.
 *
 * ┌─ LAS CUATRO REGLAS, Y NINGUNA ES DECORATIVA ────────────────────────────────────────────────┐
 *
 * 1. 🔒 **No hay un campo «calificación» que alguien pueda teclear.** Lo que guarda la propiedad es
 *    un AGREGADO —promedio y número de reseñas— que recalcula el servidor a partir de documentos de
 *    reseña. Las Rules niegan la escritura desde el cliente. Un número que solo puede aparecer como
 *    resultado de una suma no se puede inventar sin inventar también los sumandos.
 *
 * 2. 🧾 **Una reseña exige una estancia terminada.** No es una opinión de internet: es de alguien
 *    que se alojó. Mientras no exista el flujo de reserva, NO PUEDE HABER reseñas — y entonces no
 *    hay agregado, y la sección se queda honestamente vacía. Eso es correcto, no un fallo.
 *
 * 3. 🔢 **Nunca un promedio sin su recuento.** «4,9» solo significa algo acompañado de sobre
 *    cuántos. Este módulo no ofrece forma de obtener el promedio suelto: quien lo pinte tiene el `n`
 *    en la mano, porque viajan juntos o no viajan.
 *
 * 4. 📉 **Por debajo del mínimo, NO hay calificación.** Un promedio de una reseña no es un promedio;
 *    es una anécdota con decimales, y encima la más fácil de conseguir de un conocido. Por debajo de
 *    `MINIMO_RESENAS` la propiedad simplemente no tiene nota que enseñar.
 * └────────────────────────────────────────────────────────────────────────────────────────────┘
 */

/** Escala de la nota. Se declara para que nadie tenga que deducirla de los datos. */
export const NOTA_MIN = 1;
export const NOTA_MAX = 5;

/**
 * Cuántas reseñas hacen falta para poder enseñar una nota.
 *
 * Tres es poco, y es a propósito: el objetivo no es rigor estadístico —con este volumen no lo habrá
 * en años— sino impedir que UNA sola reseña se convierta en un «5,0» en la portada.
 */
export const MINIMO_RESENAS = 3;

/**
 * Lo que la propiedad guarda. **Lo escribe el servidor y nadie más.**
 *
 * `actualizado` no es adorno: sin él no se puede saber si el agregado quedó rezagado respecto de sus
 * reseñas, y un promedio viejo se lee exactamente igual que uno al día.
 */
export interface AgregadoResenas {
  /** Promedio en la escala [NOTA_MIN, NOTA_MAX], sin redondear a la baja: lo redondea quien pinta. */
  promedio: number;
  /** Cuántas reseñas lo componen. Viaja SIEMPRE con el promedio (regla 3). */
  n: number;
  /** ISO del último recálculo. */
  actualizado: string;
}

/** Lo que se puede ENSEÑAR: o hay nota con su recuento, o no hay nota. No hay término medio. */
export interface NotaVisible {
  promedio: number;
  n: number;
}

/**
 * ¿Este agregado se puede enseñar? Devuelve la nota **con su recuento**, o `null`.
 *
 * 🎯 Es la única puerta de salida del módulo, y por eso no existe un `promedioDe()` suelto: si se
 * pudiera pedir el promedio sin el recuento, alguien lo pediría, y la regla 3 duraría hasta el
 * siguiente que tuviera prisa.
 *
 * Rechaza además lo que no es un número usable —ausente, `NaN`, fuera de escala, recuento negativo—
 * porque un dato corrupto que se pinta es peor que uno que falta: el que falta se ve.
 */
export function notaVisible(agregado: AgregadoResenas | undefined | null): NotaVisible | null {
  if (!agregado) return null;
  const { promedio, n } = agregado;
  if (!Number.isFinite(promedio) || !Number.isInteger(n)) return null;
  if (n < MINIMO_RESENAS) return null;
  if (promedio < NOTA_MIN || promedio > NOTA_MAX) return null;
  return { promedio, n };
}

/**
 * Cómo se escribe una nota para leerla: «4,8 · 12 reseñas».
 *
 * Coma decimal porque es español de Colombia, y un decimal porque dos fingen una precisión que 12
 * opiniones no tienen.
 */
export function textoNota({ promedio, n }: NotaVisible): string {
  const nota = promedio.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${nota} · ${n} ${n === 1 ? 'reseña' : 'reseñas'}`;
}

/**
 * Recalcula el agregado desde las notas de las reseñas. **Esto lo llama el servidor**, nunca el
 * cliente: está aquí porque es lógica pura y así se puede probar sin emulador.
 *
 * Descarta las notas fuera de escala en vez de arrastrarlas: una reseña corrupta no debe mover el
 * promedio de las buenas. Y si no queda ninguna válida, devuelve `null` — que es «no hay agregado»,
 * distinto de «el agregado es cero».
 */
export function recalcular(notas: readonly number[], ahora: string): AgregadoResenas | null {
  const validas = notas.filter((x) => Number.isFinite(x) && x >= NOTA_MIN && x <= NOTA_MAX);
  if (!validas.length) return null;
  const suma = validas.reduce((a, b) => a + b, 0);
  return { promedio: suma / validas.length, n: validas.length, actualizado: ahora };
}
