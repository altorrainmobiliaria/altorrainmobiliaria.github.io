/*
 * DINERO — la red que faltaba bajo las primitivas de plata.
 *
 * `dinero.ts` nació para acabar con tres `COP_FMT` repartidos, pero se quedó SIN una sola prueba: era
 * el módulo de dinero más usado del panel y de la ficha, y nada fijaba lo que produce. Estas pruebas
 * no comprueban que `Intl` funcione —eso es de la plataforma— sino las tres cosas que este negocio
 * decidió y que se pueden romper en silencio: el formato que aprobó el dueño, que los céntimos no
 * existan, y que la tarifa impresa y la calculada sean la misma.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { IVA, TARIFA_IVA, pesos } from './dinero';

describe('pesos — el formato que aprobó el dueño', () => {
  /*
   * El precio va PEGADO al símbolo. No es gusto: son 48 precios en cinco mockups aprobados
   * (Ficha · Resultados · Gestión · Liquidación · Certificación) y ni uno solo lleva espacio.
   * `Intl` mete un espacio duro U+00A0 por su cuenta, y por eso hubo que quitarlo a mano.
   */
  it('pega el símbolo a la cifra, como los mockups', () => {
    expect(pesos(1_450_000_000)).toBe('$1.450.000.000');
    expect(pesos(300_000)).toBe('$300.000');
    expect(pesos(4_850)).toBe('$4.850');
  });

  /*
   * Esta es la prueba que de verdad importa, y merece decir por qué: el carácter que se cuela es
   * INVISIBLE. `'$ 300.000'` con espacio duro y `'$300.000'` se ven idénticos en un diff, en una
   * revisión a ojo y en una captura de pantalla. Si alguien vuelve a poner el formateador crudo,
   * la única cosa en todo el repositorio que lo va a notar es esta línea.
   */
  it('no deja ni un espacio duro, que es la forma invisible de romperlo', () => {
    for (const v of [0, 1, 4_850, 2_500_000, -450_000]) {
      expect(pesos(v)).not.toContain('\u00a0'); // el duro, el que mete Intl
      expect(pesos(v)).not.toContain(' '); // y el normal, por si alguien lo 'arregla'
    }
  });

  it('no imprime céntimos: en un canon no existen', () => {
    expect(pesos(2_500_000.5)).toBe('$2.500.001');
    expect(pesos(1_234_567.89)).toBe('$1.234.568');
    expect(pesos(0.4)).toBe('$0');
  });

  it('redondea alejándose del cero, no al par', () => {
    /* Medido, no supuesto: 2,5 → 3. Con redondeo bancario habría dado 2. */
    expect(pesos(0.5)).toBe('$1');
    expect(pesos(1.5)).toBe('$2');
    expect(pesos(2.5)).toBe('$3');
  });

  it('pone el signo delante del símbolo cuando hay que devolver plata', () => {
    /* Sale en la liquidación cuando los descuentos superan al recaudo. */
    expect(pesos(-450_000)).toBe('-$450.000');
  });

  it('dice «$0», no un hueco: un cero que no se ve parece una pantalla rota', () => {
    expect(pesos(0)).toBe('$0');
  });

  /*
   * RATCHET DE ENTORNO. `Intl.NumberFormat('es-CO')` en un Node compilado con ICU reducido cae a
   * `en-US` SIN AVISAR, y entonces todas las cifras de todos los comprobantes pasan a `$2,500,000.00`.
   * No falla nada, no hay excepción: solo cambian los separadores en cada documento que ve un cliente.
   * Aquí se comprueba el resultado, no la configuración, porque lo que importa es lo que se imprime.
   */
  it('usa los separadores colombianos, no los que deja un ICU capado', () => {
    const s = pesos(2_500_000);
    expect(s).toBe('$2.500.000');
    expect(s).not.toContain(','); // el fallback a en-US pondría comas de millar
  });
});

describe('IVA — la tarifa impresa y la calculada son la misma', () => {
  it('la etiqueta sale del número, no de un literal', () => {
    expect(TARIFA_IVA).toBe('19 %');
    expect(TARIFA_IVA).toBe(`${Math.round(IVA * 100)} %`);
  });

  /*
   * El fallo real que esto cierra: el comprobante de liquidación imprimía «· 19 %» a pelo mientras
   * el importe salía de `IVA`. Subir la tarifa habría producido un recibo que dice una cosa y cobra
   * otra — y un `grep 0.19` no encuentra un literal escrito con letras.
   */
  it('si la tarifa cambiara, la etiqueta cambia con ella', () => {
    const conOtraTarifa = (t: number) => `${Math.round(t * 100)} %`;
    expect(conOtraTarifa(0.21)).toBe('21 %');
    expect(conOtraTarifa(IVA)).toBe(TARIFA_IVA);
  });
});

/*
 * LA PUERTA ÚNICA — lo que `verify:simbolos` NO puede ver.
 *
 * Ese gate caza símbolos EXPORTADOS con el mismo nombre. Pero el duplicado que hizo nacer este
 * módulo era `COP_FMT`, que es **privado**: tres módulos lo declararon por su cuenta y ningún gate
 * podía enterarse, porque una constante privada no colisiona con nada. Esto lo cierra por el otro
 * lado: nadie más construye un formateador de MONEDA.
 */
describe('nadie más formatea moneda por su cuenta', () => {
  const SRC = join(import.meta.dirname, '..', '..');
  const DUENO = join('lib', 'domain', 'dinero.ts');

  const fuentes = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) return fuentes(p);
      return /\.(ts|astro)$/.test(n) && !n.endsWith('.test.ts') ? [p] : [];
    });

  it('solo dinero.ts construye un Intl con currency', () => {
    const culpables = fuentes(SRC).filter(
      (p) => relative(SRC, p) !== DUENO && /currency\s*:/.test(readFileSync(p, 'utf8')),
    );
    /*
     * Si esto falla, el arreglo NO es añadir una excepción: es importar `pesos`. Un formateador de
     * moneda nuevo diverge del aprobado el día que alguien toque uno de los dos, y la única señal
     * será que dos pantallas escriben el mismo precio distinto.
     */
    expect(culpables.map((p) => relative(SRC, p))).toEqual([]);
  });
});
