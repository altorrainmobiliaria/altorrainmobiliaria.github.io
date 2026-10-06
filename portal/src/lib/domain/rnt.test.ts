import { describe, expect, it } from 'vitest';
import { numeroRnt, textoRnt } from './rnt';
import { muestraRnt } from '../../../scripts/lib/senales-estadia.mjs';

// El número de RNT (Ley 300/1996: va en TODA publicidad de alojamiento turístico). Lo que se fija
// aquí es la FORMA que cuenta como número exhibible; quién la usa lo prueban catalogo y alta.

/** Lo que el dominio da por número, de todas las formas en que un operador lo teclea. */
const ACEPTADOS: [string, string][] = [
  ['RNT-100001', '100001'],
  ['100001', '100001'],
  ['RNT No. 12.345', '12345'],
  ['  RNT: 100001  ', '100001'],
  ['RNT # 100001', '100001'],
  ['RNT N.º 98765', '98765'],
  ['rnt n.º 98765', '98765'],
  ['RNT nº 54321', '54321'],
  ['RNT N° 54321', '54321'],
  ['RNT Nro. 123456', '123456'],
  // «número» se escribe con la misma «Núm» por la que empieza su abreviatura: el orden importa.
  ['RNT número 123456', '123456'],
  ['R.N.T. 123456', '123456'],
  ['RNT100001', '100001'],
  ['(RNT) 123456', '123456'],
  ['RNT – 123456', '123456'],
  ['RNT — 123456', '123456'],
  ['RNT · 123456', '123456'],
  ['Registro Nacional de Turismo 12345', '12345'],
  ['RNT 12345.', '12345'], // el punto que cierra la frase no es parte del número
  ['RNT 12.345.678', '12345678'],
  ['012345', '012345'], // el cero a la izquierda se respeta: no se reescribe el número de nadie
];

describe('numeroRnt — el número, no «algo escrito en el campo»', () => {
  it.each(ACEPTADOS)('%s → %s', (raw, esperado) => {
    expect(numeroRnt(raw)).toBe(esperado);
  });

  it.each([
    ['pendiente'],
    ['en trámite desde 2024'],
    ['R-1'],
    ['   '],
    [''],
    ['RNT 123'], // tres cifras: un dato suelto, no un registro
    ['RNT 0012'], // cuatro caracteres, pero dos cifras significativas
    ['RNT'],
    ['RNT pendiente'],
    ['RNT-000000'], // la plantilla del campo del panel, sin rellenar
    ['RNT 12..345'], // dos separadores seguidos: no es un número escrito con puntos de miles
    ['100001 en trámite'],
    ['RNT 12345 (vigente)'],
  ])('%s → null', (raw) => {
    expect(numeroRnt(raw)).toBeNull();
  });

  // 🔴 Lo que pegar las cifras convertiría en un número que nadie escribió. Exhibirlo sería anunciar
  // un RNT distinto del registrado: peor que no exhibir ninguno.
  it.each([
    ['RNT 87654-2025'], // número y año de renovación
    ['RNT 87654 2025'],
    ['RNT 87654.2025'], // un punto que no es de miles
    ['RNT 100-001'],
    ['RNT 100 001'],
    ['RNT 1558 2012'], // una norma citada sin el «de»
    ['RNT 1558 de 2012'],
    ['RNT 3 2 8 5'], // habitaciones, baños y área de una tarjeta aplanada
    ['1 2 3 4'],
    ['300 243 9810'], // un celular
    ['3002439810'],
    ['901.234.567-8'], // un NIT con su dígito de verificación
    ['901.234.567'],
    ['1'.repeat(40)],
  ])('%s → null (no se inventa un número)', (raw) => {
    expect(numeroRnt(raw)).toBeNull();
  });

  it.each([['RNT 2026'], ['RNT 1996'], ['2.026']])('%s → null: un año habla del registro, no lo exhibe', (raw) => {
    expect(numeroRnt(raw)).toBeNull();
  });

  it('ausente o de otro tipo → null, sin lanzar (el rebuild lee documentos a ciegas)', () => {
    expect(numeroRnt(undefined)).toBeNull();
    expect(numeroRnt(null)).toBeNull();
    // Un escritor ajeno al panel podría dejar un número en vez de un texto: no debe tumbar nada.
    expect(numeroRnt(100001 as unknown as string)).toBeNull();
  });
});

describe('textoRnt — el formato que se exhibe desde el índice', () => {
  it('sigla, un espacio y el número normalizado', () => {
    expect(textoRnt('100001')).toBe('RNT 100001');
  });

  it('lo que el operador teclee de cualquier forma sale exhibido de UNA forma', () => {
    const tecleos = ['RNT-100001', 'RNT No. 100.001', '100001', 'rnt: 100001'];
    const exhibidos = new Set(tecleos.map((t) => textoRnt(numeroRnt(t) as string)));
    expect([...exhibidos]).toEqual(['RNT 100001']);
  });
});

// 🎯 El dominio y la sonda del build no pueden discrepar en la dirección peligrosa: todo lo que aquí
// cuenta como número tiene que leerse como RNT exhibido allí. Si el dominio aceptara algo que la
// sonda no reconoce, se publicaría un «RNT» que el propio gate del build da por ausente.
describe('numeroRnt ⊂ la sonda del build (`scripts/lib/senales-estadia.mjs`)', () => {
  it.each(ACEPTADOS)('%s: exhibido desde el índice Y como lo pinta hoy la ficha', (raw) => {
    expect(muestraRnt(textoRnt(numeroRnt(raw) as string))).toBe(true);
    // La ficha pone la etiqueta «RNT» y detrás el texto tal como se tecleó (`ficha.ts`).
    expect(muestraRnt(`RNT ${raw}`)).toBe(true);
  });
});
