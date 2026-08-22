import { describe, expect, it } from 'vitest';
import { cuentaInvisibles, filaInmueble } from './gestion-inmuebles';
import type { Propiedad } from '../lib/domain/propiedades';

// Listado de inmuebles del panel (§110). Lo que se prueba es la columna «¿se ve?», que es la única
// que puede MENTIR: si se dedujera del estado, un «disponible» sin foto saldría como publicado y el
// operador daría su trabajo por hecho mirando justo la casilla equivocada.

function prop(over: Partial<Propiedad> = {}): Propiedad {
  return {
    _version: 1,
    createdAt: '2026-08-22T00:00:00Z',
    updatedAt: '2026-08-22T00:00:00Z',
    id: 'INM-202608-0001',
    operacion: 'venta',
    vertical: 'vivienda',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apartamento en Bocagrande',
    descripcion: '',
    geo: { ciudad: 'Cartagena de Indias', barrio: 'Bocagrande' },
    specs: {},
    amenidades: {},
    precio: { moneda: 'COP', valorVenta: 450_000_000 },
    imagenes: ['props/INM-202608-0001/1.webp'],
    ...over,
  } as Propiedad;
}

describe('filaInmueble — la presentación', () => {
  it('trae lo que el operador necesita para reconocer el inmueble', () => {
    const f = filaInmueble(prop());
    expect(f.id).toBe('INM-202608-0001');
    expect(f.titulo).toBe('Apartamento en Bocagrande');
    expect(f.operacion).toBe('Venta');
    expect(f.ubicacion).toBe('Bocagrande, Cartagena de Indias');
    expect(f.estado).toBe('Disponible');
  });

  it('traduce operación y estado, no enseña la clave interna', () => {
    expect(filaInmueble(prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 1 }, rnt: 'R-1' })).operacion).toBe('Por días');
    expect(filaInmueble(prop({ estado: 'cerrado' })).estado).toBe('Vendido/arrendado');
    expect(filaInmueble(prop({ estado: 'en_verificacion' })).estado).toBe('En verificación');
  });

  it('sin datos no inventa: guion, no cadena vacía ni «undefined»', () => {
    const f = filaInmueble(prop({ titulo: '', geo: {} as never, precio: { moneda: 'COP' } }));
    expect(f.titulo).toBe('Sin título');
    expect(f.ubicacion).toBe('—');
    expect(f.precio).toBe('—');
    expect(JSON.stringify(f)).not.toContain('undefined');
  });
});

describe('🎯 «¿se ve?» NO se deduce del estado — es la columna que puede mentir', () => {
  it('completo y disponible: se ve', () => {
    const f = filaInmueble(prop());
    expect(f.visible).toBe(true);
    expect(f.motivos).toEqual([]);
  });

  it('🔴 «disponible» SIN FOTO no se ve, aunque el estado diga que sí', () => {
    const f = filaInmueble(prop({ imagenes: [], imagenPortada: '' }));
    expect(f.estado).toBe('Disponible');
    expect(f.visible).toBe(false);
    expect(f.motivos.join(' ')).toMatch(/foto/i);
  });

  it('🔴 un alojamiento «disponible» sin RNT no se ve: es un bloqueo LEGAL', () => {
    const f = filaInmueble(prop({ operacion: 'alojamiento', precio: { moneda: 'COP', precioNoche: 350_000 } }));
    expect(f.visible).toBe(false);
    expect(f.motivos.join(' ')).toMatch(/RNT/);
  });

  it('un borrador dice que no se ve, y por qué', () => {
    const f = filaInmueble(prop({ estado: 'borrador' }));
    expect(f.visible).toBe(false);
    expect(f.motivos).toHaveLength(1);
  });

  it('«vendido» SÍ se ve — contraintuitivo, y por eso la columna hace falta', () => {
    // Marcar cerrado NO retira el inmueble: sigue publicado con su aviso (decisión de SEO). Quien
    // creyera lo contrario mirando el estado se llevaría una sorpresa; la columna lo desmiente.
    expect(filaInmueble(prop({ estado: 'cerrado' })).visible).toBe(true);
    expect(filaInmueble(prop({ estado: 'reservado' })).visible).toBe(true);
    expect(filaInmueble(prop({ estado: 'inactivo' })).visible).toBe(false);
  });

  it('todo motivo llega redactado para una persona, no como clave', () => {
    const f = filaInmueble(prop({ estado: 'borrador', imagenes: [] }));
    for (const m of f.motivos) {
      expect(m.length).toBeGreaterThan(20);
      expect(m).not.toMatch(/^sin-|^estado-/);
    }
  });
});

describe('cuentaInvisibles — lo que se quiere saber sin contar filas', () => {
  it('cuenta las que no se ven', () => {
    const filas = [
      filaInmueble(prop({ id: 'A' })),
      filaInmueble(prop({ id: 'B', estado: 'borrador' })),
      filaInmueble(prop({ id: 'C', imagenes: [] })),
    ];
    expect(cuentaInvisibles(filas)).toBe(2);
  });

  it('cero cuando todas se ven', () => {
    expect(cuentaInvisibles([filaInmueble(prop())])).toBe(0);
    expect(cuentaInvisibles([])).toBe(0);
  });
});
