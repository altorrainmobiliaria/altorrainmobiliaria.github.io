/*
 * DUEÑO ÚNICO de los nombres de mes en castellano (ADR §233).
 *
 * POR QUÉ EXISTE. Había **cuatro** copias idénticas de la misma lista —`bitacora.ts`,
 * `content/journal.ts` y las dos pantallas nuevas del preaviso y la certificación— y ninguna sabía
 * de las otras. Una lista repetida no falla el día que se escribe: falla el día que alguien corrige
 * una sola, y entonces el mismo mes se llama distinto en dos sitios del mismo producto. Es la
 * familia de [[L-45]] y la misma decisión que ya se tomó con `pesos()` y con el IVA en `dinero.ts`
 * (§178): un hecho, un dueño.
 *
 * NO usa `Intl` a propósito. `toLocaleDateString('es-CO')` daría los nombres, pero exige construir
 * un `Date` —y construir fechas a partir de un `YYYY-MM` es exactamente donde se cuela el desfase de
 * huso que este proyecto ya pagó dos veces—. Doce cadenas no necesitan una librería de
 * internacionalización; necesitan estar escritas una vez.
 */

/** Los doce, en minúscula: se usan dentro de frases («entre marzo y diciembre»). */
export const MESES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/**
 * `1..12` → «enero»…«diciembre». Fuera de rango devuelve cadena vacía en vez de `undefined`:
 * un mes que no existe no debe imprimir la palabra «undefined» en un documento que firma la empresa.
 */
export function nombreDeMes(n: number): string {
  return MESES_ES[n - 1] ?? '';
}

/**
 * `2026-03` o `2026-03-15` → «marzo». Devuelve **el original** si no lo entiende, no un guion ni
 * un vacío: si algo llega mal formado, verlo tal cual es lo que permite arreglarlo.
 */
export function mesDePeriodo(periodo: string): string {
  const n = Number((periodo ?? '').slice(5, 7));
  return nombreDeMes(n) || periodo;
}

/**
 * `2027-06-30` → «30 de junio de 2027». Sin `Date` por la razón de la cabecera.
 * Devuelve `—` cuando no hay fecha legible: en una pantalla, un guion se lee como «esto está vacío»
 * y una fecha inventada no.
 */
export function fechaEnLetras(iso: string): string {
  const m = (iso ?? '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '—';
  const mes = nombreDeMes(Number(m[2]));
  return mes ? `${Number(m[3])} de ${mes} de ${m[1]}` : '—';
}
