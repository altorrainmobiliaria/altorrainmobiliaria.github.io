import { describe, it, expect } from 'vitest';
import { etiquetaOrigen, haceCuanto, iniciales, normalizar, tonoEstado, zonasDeLeads } from './gestion-leads';
import type { Lead } from './gestion-leads';

// Bandeja de leads del panel (ADR §101). Lo que se prueba aquí es la NORMALIZACIÓN, que es donde este
// proyecto ya se quemó una vez: `createdAt` llega con dos formas distintas según quién lo escribiera
// (Timestamp del SDK, o string ISO del endpoint por REST), y asumir una sola no da error — pinta «—»
// en la columna de fecha y nadie sabe por qué ([[L-17]]).

describe('normalizar — el dato llega con más de una forma', () => {
  it('acepta un Timestamp del SDK', () => {
    const fecha = new Date('2026-08-20T10:00:00.000Z');
    const r = normalizar('id-1', { nombre: 'Ana', createdAt: { toDate: () => fecha } });
    expect(r.createdAt?.toISOString()).toBe(fecha.toISOString());
  });

  it('acepta una fecha ISO en texto (la que escribe el endpoint del portal)', () => {
    const r = normalizar('id-2', { nombre: 'Ana', createdAt: '2026-08-20T10:00:00.000Z' });
    expect(r.createdAt?.toISOString()).toBe('2026-08-20T10:00:00.000Z');
  });

  it('una fecha basura NO revienta la fila: queda en null', () => {
    expect(normalizar('id-3', { nombre: 'Ana', createdAt: 'el martes' }).createdAt).toBeNull();
    expect(normalizar('id-4', { nombre: 'Ana' }).createdAt).toBeNull();
  });

  it('un lead sin nombre no se pinta en blanco', () => {
    expect(normalizar('id-5', {}).nombre).toBe('Sin nombre');
  });

  it('saca la zona de datosExtra, y cae a la ciudad si no hay barrio', () => {
    expect(normalizar('a', { datosExtra: { zona: 'Manga', ciudad: 'Cartagena' } }).zona).toBe('Manga');
    expect(normalizar('b', { datosExtra: { ciudad: 'Cartagena' } }).zona).toBe('Cartagena');
    expect(normalizar('c', {}).zona).toBe('');
  });

  it('un documento sin `datosExtra` no lanza', () => {
    expect(() => normalizar('d', { nombre: 'Ana' })).not.toThrow();
  });

  it('sin estado, se asume pendiente (que es lo que exige atención)', () => {
    expect(normalizar('e', {}).estado).toBe('pendiente');
  });
});

describe('iniciales', () => {
  it('toma la primera y la última palabra', () => {
    expect(iniciales('Valentina Ríos')).toBe('VR');
    expect(iniciales('Ana María Gómez Pérez')).toBe('AP');
  });

  it('con un solo nombre da una letra', () => {
    expect(iniciales('Daniel')).toBe('D');
  });

  it('nunca devuelve vacío', () => {
    expect(iniciales('')).toBe('·');
    expect(iniciales('   ')).toBe('·');
  });
});

describe('haceCuanto', () => {
  const ahora = Date.now();
  const hace = (min: number) => new Date(ahora - min * 60000);

  it('traduce a lenguaje de persona', () => {
    expect(haceCuanto(hace(0))).toBe('ahora');
    expect(haceCuanto(hace(12))).toBe('hace 12 min');
    expect(haceCuanto(hace(180))).toBe('hace 3 h');
    expect(haceCuanto(hace(60 * 24))).toBe('ayer');
    expect(haceCuanto(hace(60 * 24 * 3))).toBe('hace 3 días');
  });

  it('sin fecha muestra un guion, no «Invalid Date»', () => {
    expect(haceCuanto(null)).toBe('—');
  });
});

describe('presentación', () => {
  it('el origen se enseña legible, no con su clave interna', () => {
    expect(etiquetaOrigen('portal-publicar')).toBe('Publicar');
    expect(etiquetaOrigen('portal-rango')).toBe('Rango');
    expect(etiquetaOrigen('')).toBe('—');
  });

  it('el tono es ORO cuando el lead requiere acción (paleta sin rojo ni verde)', () => {
    expect(tonoEstado('pendiente')).toBe('gold');
    expect(tonoEstado('')).toBe('gold');
    expect(tonoEstado('contactado')).toBe('navy');
    expect(tonoEstado('cerrado')).toBe('navy');
  });
});

describe('zonasDeLeads (§275) — de dónde vienen los leads, contado sobre los que HAY', () => {
  const lead = (zona: string): Lead =>
    normalizar('x', { nombre: 'N', datosExtra: { zona } }) as Lead;

  it('cuenta por zona y ordena de mayor a menor', () => {
    const r = zonasDeLeads([lead('Bocagrande'), lead('Manga'), lead('Bocagrande'), lead('Bocagrande'), lead('Manga')]);
    expect(r).toEqual([{ zona: 'Bocagrande', n: 3 }, { zona: 'Manga', n: 2 }]);
  });

  it('🔴 los leads SIN zona se agrupan y se dicen, no se descartan', () => {
    // Si el formulario dejara de capturar la zona, un reparto que los omite se leería completo y
    // correcto mientras esconde justo el agujero que hay que arreglar.
    const r = zonasDeLeads([lead('Manga'), lead(''), lead('   '), lead('')]);
    expect(r).toEqual([{ zona: 'Sin zona', n: 3 }, { zona: 'Manga', n: 1 }]);
  });

  it('el empate se rompe por nombre, para que el orden no baile entre cargas', () => {
    const r = zonasDeLeads([lead('Manga'), lead('Crespo')]);
    expect(r.map((z) => z.zona)).toEqual(['Crespo', 'Manga']);
  });

  it('respeta el tope y devuelve las MÁS pedidas, no las primeras que aparecen', () => {
    const leads = [lead('A'), lead('B'), lead('B'), lead('C'), lead('C'), lead('C'), lead('D'), lead('D'), lead('D'), lead('D'), lead('E')];
    expect(zonasDeLeads(leads, 2)).toEqual([{ zona: 'D', n: 4 }, { zona: 'C', n: 3 }]);
  });

  it('sin leads no inventa nada', () => {
    expect(zonasDeLeads([])).toEqual([]);
  });
});
