/*
 * El ORDEN de la cola de perfiles (§241). Su comentario dice que decide *"a quién se le cumple la
 * promesa y a quién no"*, y no tenía prueba. El SLA de revisión es una promesa al cliente: si un
 * cambio la hunde en la cola, nadie se entera hasta que alguien reclama.
 */
import { describe, expect, it } from 'vitest';
import { urgencia } from './gestion-perfiles';
import type { PerfilInquilino } from '../lib/domain/perfil-inquilino';

const perfil = (extra: Partial<PerfilInquilino> = {}): PerfilInquilino =>
  ({
    id: 'PIQ-1',
    uid: 'U1',
    nombre: 'Ana Restrepo',
    email: 'ana@correo.com',
    soportes: [],
    estado: 'borrador',
    autorizaTratamiento: true,
    _version: 1,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...extra,
  }) as PerfilInquilino;

const HOY = '2026-08-25';

describe('urgencia de un perfil de inquilino', () => {
  it('un SLA vencido es lo primero, por encima de todo', () => {
    const p = perfil({ estado: 'enviado', enviadoEn: '2026-08-22T00:00:00.000Z' });
    expect(urgencia(p, HOY)).toBe(3);
  });

  it('esperando revisión va segundo, tanto recién enviado como en curso', () => {
    expect(urgencia(perfil({ estado: 'enviado', enviadoEn: '2026-08-25T00:00:00.000Z' }), HOY)).toBe(2);
    expect(urgencia(perfil({ estado: 'revisando', enviadoEn: '2026-08-25T00:00:00.000Z' }), HOY)).toBe(2);
  });

  it('con observaciones va tercero: la pelota está en la persona, no en nosotros', () => {
    expect(urgencia(perfil({ estado: 'observaciones' }), HOY)).toBe(1);
  });

  it('lo terminado y lo que ni ha salido no piden turno', () => {
    expect(urgencia(perfil({ estado: 'verificado' }), HOY)).toBe(0);
    expect(urgencia(perfil({ estado: 'borrador' }), HOY)).toBe(0);
  });

  it('🔴 nada puede colarse por delante de un SLA vencido', () => {
    // La invariante que de verdad protege la promesa: es un ORDEN, no cuatro números sueltos.
    const vencido = perfil({ estado: 'enviado', enviadoEn: '2026-08-22T00:00:00.000Z' });
    for (const otro of [
      perfil({ estado: 'revisando', enviadoEn: '2026-08-25T00:00:00.000Z' }),
      perfil({ estado: 'observaciones' }),
      perfil({ estado: 'verificado' }),
      perfil({ estado: 'borrador' }),
    ]) {
      expect(urgencia(vencido, HOY)).toBeGreaterThan(urgencia(otro, HOY));
    }
  });

  it('un borrador nunca vence el SLA: no se ha prometido nada todavía', () => {
    expect(urgencia(perfil({ estado: 'borrador' }), '2027-01-01')).toBe(0);
  });
});
