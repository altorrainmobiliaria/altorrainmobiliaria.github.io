/*
 * COLA DE VERIFICACIÓN (§119) — quién se gana el sello «Verificado por ALTORRA».
 *
 * El sello es una PROMESA AL COMPRADOR, no una etiqueta decorativa: el eslogan del negocio es
 * «Seguridad, Legalidad y Confianza», y la ficha lo enseña junto al precio. Ponerlo a algo que nadie
 * miró convierte la promesa en ruido — y a la primera propiedad sellada que resulte tener el área
 * mal o una foto de otro inmueble, deja de valer para todas las demás.
 *
 * Por eso el modelo tiene DOS campos (`verificadoAltorra` + `verificadoEn`) y no un booleano suelto:
 * un sello sin fecha no se puede caducar ni auditar, y «¿cuándo se revisó esto?» es la primera
 * pregunta que se hace cuando algo sale mal.
 */

import type { Propiedad } from './propiedades';
import { problemasParaPublicar } from './catalogo';

/**
 * Por qué una propiedad no puede llevar el sello todavía.
 *
 * NO incluye «sin dirección», aunque el sello signifique que alguien fue a verla: la dirección vive
 * en `captaciones` —otra colección, PII, admin-only, con el mismo id— y comprobarla desde aquí
 * costaría UNA LECTURA POR FILA de la cola. El free-tier no se gasta en confirmar algo que de todos
 * modos tiene que mirar la persona que sella. El software bloquea lo que puede ver; el juicio es
 * humano y así queda dicho.
 */
export type ReparoVerificacion = 'no-publicable' | 'sin-fotos-suficientes' | 'sin-area';

/** Mínimo de fotos para que una revisión humana signifique algo. */
export const MINIMO_FOTOS_SELLO = 3;

/**
 * Qué le falta a una propiedad para poder sellarse.
 *
 * `no-publicable` va PRIMERO y absorbe lo básico (precio, título, portada): si ni siquiera se puede
 * publicar, enumerar además que le faltan fotos es ruido — el operador arregla lo de arriba y vuelve.
 * Es el mismo criterio con el que `esEsquemaLegacy` se evalúa antes que `sin-precio` (§103).
 */
export function reparosParaSellar(p: Propiedad): ReparoVerificacion[] {
  if (problemasParaPublicar(p).length) return ['no-publicable'];

  const out: ReparoVerificacion[] = [];
  if ((p.imagenes?.length ?? 0) < MINIMO_FOTOS_SELLO) out.push('sin-fotos-suficientes');
  if (!p.specs?.areaConstruidaM2 && !p.specs?.areaPrivadaM2) out.push('sin-area');
  return out;
}

export function explicarReparo(r: ReparoVerificacion): string {
  const t: Record<ReparoVerificacion, string> = {
    'no-publicable': 'Todavía no se puede ni publicar: arregla eso primero.',
    'sin-fotos-suficientes': `Con menos de ${MINIMO_FOTOS_SELLO} fotos no hay nada que verificar.`,
    'sin-area': 'Falta el área construida o la privada. Es el dato que más se reclama al cerrar.',
  };
  return t[r];
}

/** ¿Está esperando el sello? Publicable, sin sello y con todo lo que hace falta para dárselo. */
export function esperaSello(p: Propiedad): boolean {
  return !p.verificadoAltorra && reparosParaSellar(p).length === 0;
}

/** Las que aparecen en la cola: primero las que ya se pueden sellar, luego las que tienen reparos. */
export function colaDeVerificacion(props: readonly Propiedad[]): Propiedad[] {
  return props
    .filter((p) => !p.verificadoAltorra)
    .sort((a, b) => Number(esperaSello(b)) - Number(esperaSello(a)));
}

/**
 * El parche que otorga el sello. Puro: quien escribe decide cómo y dentro de qué transacción.
 *
 * Devuelve `null` si la propiedad no se lo ha ganado, en vez de sellarla igual. Es lo que impide que
 * un doble clic en la cola —o una fila pintada con datos viejos— selle algo que ya no cumple.
 */
export function selloDeVerificacion(
  p: Propiedad,
  ahora: Date = new Date(),
): { verificadoAltorra: true; verificadoEn: string; _version: number; updatedAt: string } | null {
  if (p.verificadoAltorra || reparosParaSellar(p).length) return null;
  const iso = ahora.toISOString();
  return {
    verificadoAltorra: true,
    verificadoEn: iso,
    _version: (p._version ?? 0) + 1,
    updatedAt: iso,
  };
}
