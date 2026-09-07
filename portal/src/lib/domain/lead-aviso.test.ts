import { describe, expect, it } from 'vitest';
import { asuntoDeLead, contactabilidad, cuerpoDeLead } from './lead-aviso';
import type { Solicitud } from './crm';

const lead = (over: Partial<Solicitud> = {}): Solicitud =>
  ({
    id: 'SOL-1',
    estado: 'pendiente',
    contacto: { nombre: 'Ana Restrepo', telefono: '3001234567', email: 'ana@example.com' },
    source: 'portal-publicar',
    _version: 1,
    createdAt: '2026-08-26T22:10:00Z',
    updatedAt: '2026-08-26T22:10:00Z',
    ...over,
  }) as Solicitud;

const PANEL = 'https://altorrainmobiliaria.co/gestion';

describe('contactabilidad — un lead sin contacto es ruido, y hay que decirlo', () => {
  it('distingue los cuatro casos', () => {
    expect(contactabilidad(lead())).toBe('ambos');
    expect(contactabilidad(lead({ contacto: { nombre: 'A', telefono: '300' } }))).toBe('telefono');
    expect(contactabilidad(lead({ contacto: { nombre: 'A', email: 'a@b.co' } }))).toBe('email');
    expect(contactabilidad(lead({ contacto: { nombre: 'A' } }))).toBe('NINGUNO');
  });

  it('un campo en blanco NO cuenta como contacto', () => {
    expect(contactabilidad(lead({ contacto: { nombre: 'A', telefono: '   ', email: '' } }))).toBe('NINGUNO');
  });
});

describe('asunto — se lee en una notificación del móvil', () => {
  it('pone DELANTE lo que decide si se abre ahora: tier y operación', () => {
    const a = asuntoDeLead(lead({ leadTier: 'A', operacionInteres: 'arriendo' }));
    expect(a.startsWith('[A] Arriendo')).toBe(true);
    expect(a).toContain('Ana Restrepo');
  });

  it('🔴 avisa en el ASUNTO cuando el lead no dejó forma de contacto', () => {
    // Si eso solo se ve abriendo el correo, se descubre tarde y se culpa al formulario del día equivocado.
    expect(asuntoDeLead(lead({ contacto: { nombre: 'A' } }))).toContain('SIN CONTACTO');
    expect(asuntoDeLead(lead())).not.toContain('SIN CONTACTO');
  });

  it('sobrevive a un lead sin tier, sin operación y sin nombre', () => {
    const a = asuntoDeLead(lead({ contacto: { nombre: '   ' }, leadTier: undefined, operacionInteres: undefined }));
    expect(a).toContain('sin nombre');
    expect(a).toContain('Contacto');
  });
});

describe('cuerpo — todo lo necesario para llamar SIN abrir el panel', () => {
  it('lleva teléfono, correo y el enlace', () => {
    const c = cuerpoDeLead(lead(), PANEL);
    expect(c).toContain('3001234567');
    expect(c).toContain('ana@example.com');
    expect(c).toContain(PANEL);
  });

  it('los campos ausentes salen como raya, nunca como «undefined»', () => {
    const c = cuerpoDeLead(lead({ contacto: { nombre: 'A' } }), PANEL);
    expect(c).not.toMatch(/undefined/);
    expect(c).toContain('Teléfono: —');
  });

  it('el mensaje del interesado se conserva tal cual', () => {
    const c = cuerpoDeLead(lead({ mensaje: '  Quiero verlo el sábado  ' }), PANEL);
    expect(c).toContain('Quiero verlo el sábado');
  });

  it('y avisa dentro del cuerpo si no hay forma de contactar', () => {
    expect(cuerpoDeLead(lead({ contacto: { nombre: 'A' } }), PANEL)).toMatch(/NO dejó forma de contacto/);
  });
});
