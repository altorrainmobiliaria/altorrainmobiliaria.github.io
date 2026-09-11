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

/*
 * ══ VIGENCIA — «Confirmada hace N días» (§306) ═════════════════════════════════════════════════
 *
 * 🔴 EL HUECO. `frescuraTexto()` (en `ficha.ts`) lee `Propiedad.ultimaConfirmacion` y la ficha pinta
 * su línea… y **nadie escribía ese campo**. Medido el 2026-09-11: cero escritores en todo el repo.
 * O sea que «frescura verificada de los avisos» —uno de los ocho diferenciales declarados en
 * `specs/VISION-FUNCIONAL-PRODUCTO.md §8`— era una línea que **no aparecía nunca**. Es [[L-87]] por
 * sexta vez: lector, tipo, pruebas y comentario, sin nadie al otro lado.
 *
 * 🎯 CONFIRMAR ES UN ACTO DELIBERADO, NO UN EFECTO SECUNDARIO DE EDITAR. Si guardar una edición
 * estampara la fecha, corregir una errata del título haría que la ficha dijera «Confirmada hoy» —
 * afirmando ante un comprador que alguien llamó al propietario cuando lo único que pasó fue que se
 * arregló una coma. Es el gemelo exacto del historial de precio (§305), y aquí miente más caro:
 * la frescura es el argumento de confianza contra los portales llenos de avisos muertos.
 *
 * ⚠️ SEPARADO DEL SELLO a propósito. `verificadoEn` responde «¿alguien revisó que este aviso es
 * legítimo?» (una vez, y se caduca por otra vía); `ultimaConfirmacion` responde «¿sigue disponible y
 * a este precio?» (recurrente). Fundirlos obligaría a re-verificar el inmueble entero cada mes o a
 * que el sello envejeciera en silencio.
 */

/**
 * Cada cuántos días conviene volver a confirmar.
 *
 * No es un número inventado: el mercado colombiano CADUCA los avisos a los 90 días y ALTORRA
 * publica «sin caducidad» como diferencial (R1 op.6). Prometer eso sin confirmar nada sería el aviso
 * muerto de siempre con mejor titular — así que la contrapartida honesta es confirmar cada 30, que
 * deja cualquier ficha a menos de un mes de haber sido comprobada.
 */
export const DIAS_PARA_RECONFIRMAR = 30;

/** Días desde la última confirmación. `null` si nunca se confirmó — que NO es lo mismo que «hace mucho». */
export function diasSinConfirmar(p: Pick<Propiedad, 'ultimaConfirmacion'>, ahora: Date = new Date()): number | null {
  const t = Date.parse(p.ultimaConfirmacion ?? '');
  if (!Number.isFinite(t)) return null;
  const dias = Math.floor((ahora.getTime() - t) / 86_400_000);
  return dias < 0 ? null : dias;
}

/**
 * ¿Toca volver a confirmarla?
 *
 * **Nunca confirmada ⇒ SÍ.** Es el caso más importante y el más fácil de dejar fuera por un `??`
 * distraído: un inmueble que jamás se confirmó es precisamente el que hay que llamar, no uno que se
 * salta la cola por no tener fecha.
 */
export function necesitaConfirmacion(
  p: Pick<Propiedad, 'ultimaConfirmacion'>,
  ahora: Date = new Date(),
  tope: number = DIAS_PARA_RECONFIRMAR,
): boolean {
  const dias = diasSinConfirmar(p, ahora);
  return dias === null || dias >= tope;
}

/**
 * La cola de «hay que llamar a estos propietarios»: las que más tiempo llevan sin confirmar, primero.
 *
 * 🎯 Existe porque **un sello de frescura que nadie refresca es peor que no tenerlo**: convierte una
 * promesa de confianza en una fecha vieja escrita en grande. La operación tiene que poder ver a
 * quién le toca sin buscarlo a mano.
 */
export function colaDeConfirmacion(
  props: readonly Propiedad[],
  ahora: Date = new Date(),
  tope: number = DIAS_PARA_RECONFIRMAR,
): Propiedad[] {
  return props
    .filter((p) => necesitaConfirmacion(p, ahora, tope))
    .sort((a, b) => (diasSinConfirmar(b, ahora) ?? Infinity) - (diasSinConfirmar(a, ahora) ?? Infinity));
}

/**
 * El parche que confirma la vigencia. Puro, como el del sello: quien escribe decide la transacción.
 *
 * Devuelve `null` si se confirmó HOY — no por ahorrar una escritura, sino porque dos confirmaciones
 * el mismo día no dicen nada nuevo y cada una gasta un `_version` que sirve para detectar conflictos
 * de edición reales.
 */
export function confirmacionDeVigencia(
  p: Pick<Propiedad, 'ultimaConfirmacion' | '_version'>,
  ahora: Date = new Date(),
): { ultimaConfirmacion: string; _version: number; updatedAt: string } | null {
  if (diasSinConfirmar(p, ahora) === 0) return null;
  const iso = ahora.toISOString();
  return { ultimaConfirmacion: iso, _version: (p._version ?? 0) + 1, updatedAt: iso };
}
