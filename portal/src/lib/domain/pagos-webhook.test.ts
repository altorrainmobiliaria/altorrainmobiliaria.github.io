import { describe, expect, it } from 'vitest';
import { planCoherente, planDelEvento, type EntradaWebhook } from './pagos-webhook';
import type { EventoWompi } from './wompi-evento';
import type { Mandato } from './mandato';

const HOY = '2026-08-26';
const CHECKSUM = 'abc123';

const evento = (status: string, extra: Partial<EventoWompi> = {}, tx: Record<string, unknown> = {}): EventoWompi => ({
  id: 'evt-001',
  event: 'transaction.updated',
  timestamp: 1_724_700_000,
  signature: { properties: ['transaction.id', 'transaction.status'], checksum: CHECKSUM },
  data: { transaction: { id: 'tx-1', status, reference: 'MND-001', ...tx } },
  ...extra,
});

const mandato = (estado: Mandato['estado'], extra: Partial<Mandato> = {}): Mandato => ({
  id: 'MND-001',
  estado,
  monto: 2_500_000,
  ...extra,
});

const entrada = (over: Partial<EntradaWebhook> = {}): EntradaWebhook => ({
  evento: evento('APPROVED'),
  checksumCalculado: CHECKSUM,
  yaVisto: false,
  mandato: mandato('esperando'),
  hoy: HOY,
  ...over,
});

describe('planDelEvento — el camino feliz', () => {
  it('APPROVED sobre un mandato esperando lo deja RETENIDO, y lo anota', () => {
    const p = planDelEvento(entrada());
    expect(p.veredicto).toBe('procesar');
    expect(p.codigo).toBe(200);
    expect(p.mandatoNuevo?.estado).toBe('retenido');
    expect(p.mandatoNuevo?.aprobadoEl).toBe(HOY);
    expect(p.anotar).toBe(true);
    expect(p.referencia).toBe('MND-001');
  });

  it('🔴 APPROVED no libera NADA: el dinero queda retenido (§165)', () => {
    const p = planDelEvento(entrada());
    expect(p.mandatoNuevo?.estado).not.toBe('liberado');
    expect(p.mandatoNuevo?.giradoEl).toBeUndefined();
  });

  it('VOIDED reversa, y DECLINED/ERROR fallan', () => {
    expect(planDelEvento(entrada({ evento: evento('VOIDED') })).mandatoNuevo?.estado).toBe('reversado');
    expect(planDelEvento(entrada({ evento: evento('DECLINED') })).mandatoNuevo?.estado).toBe('fallido');
    expect(planDelEvento(entrada({ evento: evento('ERROR') })).mandatoNuevo?.estado).toBe('fallido');
  });

  it('PENDING no mueve nada, pero se anota para no volver a mirarlo', () => {
    const p = planDelEvento(entrada({ evento: evento('PENDING') }));
    expect(p.mandatoNuevo).toBeNull();
    expect(p.anotar).toBe(true);
    expect(p.codigo).toBe(200);
  });
});

describe('🔴 un evento TARDÍO no camina el mandato hacia atrás', () => {
  it('un PENDING que llega después de liberar NO toca el mandato', () => {
    const p = planDelEvento(entrada({ evento: evento('PENDING'), mandato: mandato('liberado', { giradoEl: HOY }) }));
    expect(p.mandatoNuevo).toBeNull();
    expect(p.codigo).toBe(200);
  });

  it('un APPROVED repetido sobre un mandato ya liberado se ignora, y NO es un error', () => {
    // Es el caso que borraría del sistema que la plata ya salió hacia el propietario.
    const p = planDelEvento(entrada({ mandato: mandato('liberado', { giradoEl: HOY }) }));
    expect(p.mandatoNuevo).toBeNull();
    expect(p.anotar).toBe(true);
    expect(p.codigo).toBe(200);
    expect(p.detalle).toMatch(/no admite|hacia atr/i);
  });

  it('pero un VOIDED sobre un mandato liberado SÍ pasa: el contracargo es real', () => {
    const p = planDelEvento(entrada({ evento: evento('VOIDED'), mandato: mandato('liberado', { giradoEl: HOY }) }));
    expect(p.mandatoNuevo?.estado).toBe('reversado');
  });

  it('sobre un estado terminal (fallido) no se mueve nada', () => {
    const p = planDelEvento(entrada({ mandato: mandato('fallido') }));
    expect(p.mandatoNuevo).toBeNull();
    expect(p.anotar).toBe(true);
  });
});

describe('🔑 autenticidad e idempotencia — nada se escribe sin las dos', () => {
  it('firma que no coincide: ni escribe, ni anota, y responde 200', () => {
    const p = planDelEvento(entrada({ checksumCalculado: 'otra-cosa' }));
    expect(p.veredicto).toBe('firma-invalida');
    expect(p.mandatoNuevo).toBeNull();
    expect(p.anotar).toBe(false);
    expect(p.codigo).toBe(200);
  });

  it('🔴 un evento NO autenticado no puede ocupar una clave del libro', () => {
    // Si anotara, un atacante podria quemar la clave del evento legitimo para que se descarte.
    for (const mal of [
      entrada({ checksumCalculado: null }),
      entrada({ evento: evento('APPROVED', { signature: { properties: ['transaction.id'] } }) }),
      entrada({ evento: evento('APPROVED', { timestamp: undefined }) }),
    ]) {
      expect(planDelEvento(mal).anotar).toBe(false);
    }
  });

  it('un duplicado no vuelve a aplicar el movimiento', () => {
    const p = planDelEvento(entrada({ yaVisto: true }));
    expect(p.veredicto).toBe('duplicado');
    expect(p.mandatoNuevo).toBeNull();
    expect(p.codigo).toBe(200);
  });
});

describe('🚦 referencia desconocida — la única salida con 500', () => {
  it('responde 500 para que Wompi reintente', () => {
    const p = planDelEvento(entrada({ mandato: null }));
    expect(p.veredicto).toBe('referencia-desconocida');
    expect(p.codigo).toBe(500);
  });

  it('🔴 y NO anota: anotar + 500 perderia el pago en el reintento', () => {
    // El reintento llegaria, encontraria la clave en el libro y se descartaria como duplicado.
    const p = planDelEvento(entrada({ mandato: null }));
    expect(p.anotar).toBe(false);
  });

  it('un evento autentico sin `reference` es malformado, no un mandato desconocido', () => {
    const sinRef = evento('APPROVED', {}, { reference: '   ' });
    const p = planDelEvento(entrada({ evento: sinRef, mandato: null }));
    expect(p.veredicto).toBe('malformado');
    expect(p.codigo).toBe(200);
  });
});

describe('🧮 el INVARIANTE del carril se cumple en TODOS los caminos', () => {
  it('jamas se anota una clave junto a un 500, ni se escribe un mandato sin anotar', () => {
    const casos: EntradaWebhook[] = [
      entrada(),
      entrada({ evento: evento('PENDING') }),
      entrada({ evento: evento('VOIDED') }),
      entrada({ evento: evento('DECLINED') }),
      entrada({ evento: evento('ERROR') }),
      entrada({ yaVisto: true }),
      entrada({ checksumCalculado: 'no' }),
      entrada({ checksumCalculado: null }),
      entrada({ mandato: null }),
      entrada({ mandato: mandato('liberado', { giradoEl: HOY }) }),
      entrada({ mandato: mandato('reversado') }),
      entrada({ mandato: mandato('fallido') }),
      entrada({ evento: evento('APPROVED', {}, { reference: '' }) }),
    ];
    for (const c of casos) {
      const p = planDelEvento(c);
      expect(planCoherente(p), `roto en: ${p.veredicto} / ${p.detalle}`).toBe(true);
    }
  });
});
