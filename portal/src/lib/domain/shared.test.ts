/**
 * EL VOCABULARIO DE TIPO — el test que habría cazado el «Penthouse» (§265).
 *
 * El desplegable del hero llevaba desde el principio ofreciendo un tipo que el dominio no tiene. No
 * lo cazó nadie porque no había nada que comparase LO QUE LA INTERFAZ ENSEÑA con LO QUE EL SISTEMA
 * PUEDE GUARDAR: eran dos listas escritas a mano, cada una correcta por su cuenta.
 *
 * Este fichero es esa comparación. Las etiquetas de abajo NO son inventadas para el test: son las que
 * salen hoy en el selector del hero y en el megamenú de la cabecera. Si alguien añade una etiqueta
 * nueva sin puente, este test cae — que es exactamente lo que no pasó la primera vez.
 */
import { describe, it, expect } from 'vitest';
import { TIPOS_INMUEBLE, tipoCanonico, type TipoInmueble } from './shared';

/** Lo que el visitante VE hoy en la web pública, copiado de `index.astro` y `Header.astro`. */
const ETIQUETAS_DE_LA_WEB = [
  'Apartamento', 'Casa', 'Penthouse', 'Local', 'Lote', 'Finca',
  'Apartamentos', 'Casas', 'Penthouse', 'Locales', 'Lotes', 'Fincas',
];

describe('tipoCanonico — el puente entre lo que la web dice y lo que el sistema guarda', () => {
  it('traduce TODA etiqueta que la web pública enseña hoy', () => {
    const huerfanas = ETIQUETAS_DE_LA_WEB.filter((e) => tipoCanonico(e) === null);
    expect(huerfanas).toEqual([]);
  });

  it('cada tipo canónico se reconoce por su propio nombre (ida y vuelta)', () => {
    for (const t of TIPOS_INMUEBLE) expect(tipoCanonico(t)).toBe(t);
  });

  it('todo lo que devuelve es un tipo REAL del dominio, nunca una etiqueta suelta', () => {
    const devueltos = ETIQUETAS_DE_LA_WEB.map((e) => tipoCanonico(e)).filter((t): t is TipoInmueble => t !== null);
    for (const t of devueltos) expect(TIPOS_INMUEBLE).toContain(t);
  });

  it('«Penthouse» no es un tipo del dominio: se ENSANCHA a apartamento, y eso queda escrito', () => {
    expect((TIPOS_INMUEBLE as readonly string[])).not.toContain('penthouse');
    expect(tipoCanonico('Penthouse')).toBe('apartamento');
  });

  it('no depende de tildes, mayúsculas ni espacios de sobra (llega por URL, y una URL viene sucia)', () => {
    expect(tipoCanonico('  CASA  ')).toBe('casa');
    expect(tipoCanonico('Apartaestudios')).toBe('apartaestudio');
    expect(tipoCanonico('casas   lote')).toBe('casa_lote');
  });

  it('los plurales en -es también: «Locales» es la trampa que rompe el singularizado ingenuo', () => {
    // Quitar la «s» final daría «locale», que no existe — y el fallo sería CERO RESULTADOS en
    // silencio, no un error. Por eso la tabla es explícita.
    expect(tipoCanonico('Locales')).toBe('local');
  });

  it('lo desconocido devuelve null y no un valor por defecto que parezca un dato', () => {
    expect(tipoCanonico('chalet')).toBeNull();
    expect(tipoCanonico('')).toBeNull();
  });
});
