import { describe, expect, it } from 'vitest';
import { fichaEstancia } from './ficha-estancia';
import { aseoDe, desgloseEstadia, fechasSugeridas, lineasDesglose, sumarDias } from './reserva';
import { amenidadesDetalladas, amenidadesVisibles } from './ficha';
import type { Propiedad } from './propiedades';

/*
 * LA FICHA DE UN ALOJAMIENTO (§329). Lo que se protege es el invariante legal —ningún precio por
 * noche sin su RNT— y que el panel no AFIRME nada que el documento no diga: ni un total con fechas que
 * no dan una estadía, ni una nota con dos reseñas, ni una línea de limpieza que el total no suma.
 */

const HOY = '2026-10-15';

function aloj(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    id: 'INM-202610-0001',
    operacion: 'alojamiento',
    vertical: 'turistico',
    tipo: 'casa',
    estado: 'disponible',
    titulo: 'Casa con piscina en el Centro',
    descripcion: 'Casa colonial restaurada.',
    geo: { ciudad: 'Cartagena de Indias', zona: 'Centro', barrio: 'Centro Histórico' },
    specs: { habitaciones: 4, banos: 3 },
    amenidades: { piscina: true, terraza: true },
    precio: { moneda: 'COP', precioNoche: 850_000, precioAseo: 180_000 },
    rnt: 'RNT 100001',
    autorizacionPH: { situacion: 'no-aplica', declaradaEn: '2026-09-01T00:00:00.000Z' },
    imagenes: ['props/a/1.webp'],
    ...over,
  };
}

describe('fichaEstancia — solo un alojamiento con su RNT tiene panel de precio', () => {
  it('venta y arriendo no tienen ficha de estancia (siguen con la suya, byte a byte)', () => {
    expect(fichaEstancia(aloj({ operacion: 'venta' }), HOY)).toBeNull();
    expect(fichaEstancia(aloj({ operacion: 'arriendo' }), HOY)).toBeNull();
  });

  it('sin un NÚMERO de RNT exhibible no hay panel: «pendiente» o vacío no son un registro', () => {
    expect(fichaEstancia(aloj({ rnt: 'pendiente' }), HOY)).toBeNull();
    expect(fichaEstancia(aloj({ rnt: '' }), HOY)).toBeNull();
    expect(fichaEstancia(aloj({ rnt: undefined }), HOY)).toBeNull();
    expect(fichaEstancia(aloj({ rnt: 'RNT 2026' }), HOY)).toBeNull(); // un año, no un registro
  });

  it('exhibe el RNT normalizado, el mismo formato que las tarjetas («RNT n»)', () => {
    expect(fichaEstancia(aloj({ rnt: 'R.N.T. No. 12.345' }), HOY)?.rnt).toBe('RNT 12345');
  });

  it('abre con la estadía sugerida y su desglose: 3 noches × precio + limpieza una vez = total', () => {
    const f = fichaEstancia(aloj(), HOY)!;
    expect(f.sugeridas).toEqual({ llegada: '2026-10-22', salida: '2026-10-25' });
    expect(f.noche).toEqual({ valor: 850_000, texto: '$850.000' });
    expect(f.desglose).toEqual({
      alojamiento: { concepto: '$850.000 × 3 noches', valor: '$2.550.000' },
      limpieza: { concepto: 'Tarifa de limpieza', valor: '$180.000' },
      total: '$2.730.000',
    });
  });

  it('⛔ el total NO lleva «servicio ALTORRA»: el 10 % del mockup no existe en el modelo', () => {
    const f = fichaEstancia(aloj(), HOY)!;
    // 2.550.000 + 180.000, sin un peso más. El mockup decía $2.985.000 sumando un 10 % inventado.
    expect(f.desglose?.total).toBe('$2.730.000');
    expect(JSON.stringify(f)).not.toMatch(/servicio/i);
  });

  it('sin precio por noche (o con uno que no se puede multiplicar) no hay cifra ni total', () => {
    for (const precioNoche of [undefined, 0, -5, Number.NaN]) {
      const f = fichaEstancia(aloj({ precio: { moneda: 'COP', precioNoche } }), HOY)!;
      expect(f.noche).toBeNull();
      expect(f.desglose).toBeNull();
      expect(f.rnt).toBe('RNT 100001'); // el número sigue: la ficha anuncia hospedaje igual
    }
  });

  it('sin aseo no hay línea de limpieza en cero, y el total es solo el alojamiento', () => {
    const f = fichaEstancia(aloj({ precio: { moneda: 'COP', precioNoche: 400_000 } }), HOY)!;
    expect(f.aseo).toBe(0);
    expect(f.desglose?.limpieza).toBeNull();
    expect(f.desglose?.total).toBe('$1.200.000');
  });

  it('la nota sale solo con el mínimo de reseñas, y la cifra corta es la MISMA de la cabecera', () => {
    expect(fichaEstancia(aloj({ resenas: { promedio: 4.9, n: 2, actualizado: HOY } }), HOY)?.nota).toBeNull();
    expect(fichaEstancia(aloj({ resenas: { promedio: 4.9, n: 2, actualizado: HOY } }), HOY)?.notaCorta).toBeNull();
    const f = fichaEstancia(aloj({ resenas: { promedio: 4.87, n: 12, actualizado: HOY } }), HOY)!;
    expect(f.nota).toBe('4,9 · 12 reseñas');
    expect(f.notaCorta).toBe('4,9');
  });

  it('el lugar es barrio · ciudad, y sin barrio no deja un «·» colgando', () => {
    expect(fichaEstancia(aloj(), HOY)?.lugar).toBe('Centro Histórico · Cartagena de Indias');
    expect(fichaEstancia(aloj({ geo: { ciudad: 'Cartagena de Indias' } as Propiedad['geo'] }), HOY)?.lugar).toBe('Cartagena de Indias');
  });

  it('un alojamiento reservado lo dice (y el panel no pedirá fechas)', () => {
    const f = fichaEstancia(aloj({ estado: 'reservado' }), HOY)!;
    expect(f.aviso?.titulo).toBe('Reservado');
    expect(f.aviso?.admiteVisita).toBe(false);
  });
});

describe('lineasDesglose — las palabras que pintan el servidor y el navegador', () => {
  it('una noche es «noche», no «noches»', () => {
    const d = desgloseEstadia({ precioNoche: 500_000 }, '2026-11-01', '2026-11-02')!;
    expect(lineasDesglose(d).alojamiento.concepto).toBe('$500.000 × 1 noche');
  });

  it('aseoDe es el mismo criterio que el total: negativo o NaN cuenta como no cobrado', () => {
    expect(aseoDe({ precioAseo: 90_000 })).toBe(90_000);
    expect(aseoDe({ precioAseo: -1 })).toBe(0);
    expect(aseoDe({ precioAseo: Number.NaN })).toBe(0);
    expect(aseoDe(undefined)).toBe(0);
    const d = desgloseEstadia({ precioNoche: 100_000, precioAseo: -1 }, '2026-11-01', '2026-11-03')!;
    expect(lineasDesglose(d).limpieza).toBeNull();
  });
});

describe('sumarDias / fechasSugeridas', () => {
  it('cruza meses y años sin perder ni repetir un día', () => {
    expect(sumarDias('2026-10-28', 7)).toBe('2026-11-04');
    expect(sumarDias('2026-12-29', 7)).toBe('2027-01-05');
    expect(sumarDias('2028-02-25', 4)).toBe('2028-02-29'); // bisiesto
  });

  it('una fecha que no es fecha da vacío, nunca «Invalid Date»', () => {
    expect(sumarDias('mañana', 7)).toBe('');
    expect(fechasSugeridas('')).toEqual({ llegada: '', salida: '' });
  });

  it('la sugerencia es llegada en una semana y tres noches', () => {
    expect(fechasSugeridas('2026-10-15')).toEqual({ llegada: '2026-10-22', salida: '2026-10-25' });
  });
});

describe('amenidadesDetalladas — «Lo que ofrece este lugar» con la clave para el icono', () => {
  it('mismas etiquetas y mismo orden que amenidadesVisibles, con su clave', () => {
    const p = aloj({ amenidades: { piscina: true, gimnasio: false, wifiRapido: true }, otrasAmenidades: ['Muelle', 'Piscina'] });
    expect(amenidadesDetalladas(p)).toEqual([
      { clave: 'piscina', etiqueta: 'Piscina' },
      { clave: 'wifiRapido', etiqueta: 'Wifi rapido' },
      { clave: null, etiqueta: 'Muelle' },
    ]);
    expect(amenidadesVisibles(p)).toEqual(['Piscina', 'Wifi rapido', 'Muelle']);
  });
});
