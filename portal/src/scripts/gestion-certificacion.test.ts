/*
 * Lo PURO de la certificación anual (ADR §233). El cálculo lo prueba `domain/certificacion.ts`;
 * aquí van las dos decisiones que esta pantalla añade y que pueden equivocarse solas: de dónde
 * salen los meses, y el contraste contra lo que de verdad se giró.
 */
import { describe, expect, it } from 'vitest';
import { aniosConPagos, mesEnLetras, mesesDesdePagos } from './gestion-certificacion';
import type { Contrato, Pago } from '../lib/domain/gestion';

const contrato = (extra: Partial<Contrato> = {}): Contrato =>
  ({
    id: 'CTO-1',
    expedienteId: 'EXP-1',
    tipo: 'arriendo',
    vertical: 'vivienda',
    estado: 'vigente',
    partes: { propietario: { nombre: 'Daniel Romero', documento: '1.047.000.000' } },
    canon: 2_000_000,
    administracion: 300_000,
    honorariosPct: 10,
    ivaSobreHonorarios: true,
    vigenciaInicio: '2026-03-01',
    vigenciaFin: '2027-02-28',
    renovacionAutomatica: true,
    _version: 1,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }) as Contrato;

const pago = (periodo: string, extra: Partial<Pago> = {}): Pago =>
  ({
    id: `PG-${periodo}`,
    expedienteId: 'EXP-1',
    contratoId: 'CTO-1',
    periodo,
    tipo: 'payout_propietario',
    montoEsperado: 1_726_300,
    fechaVencimiento: `${periodo}-05`,
    estado: 'al_dia',
    _version: 1,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }) as Pago;

describe('mesEnLetras', () => {
  it('traduce el período a lo que diría una persona', () => {
    expect(mesEnLetras('2026-03')).toBe('marzo');
    expect(mesEnLetras('2026-12')).toBe('diciembre');
  });

  it('ante un período que no entiende devuelve el original, no `undefined`', () => {
    expect(mesEnLetras('2026-13')).toBe('2026-13');
    expect(mesEnLetras('')).toBe('');
  });
});

describe('los meses salen de los GIROS reales, no del calendario', () => {
  it('un mandato que empezó en marzo certifica marzo en adelante, no doce meses', () => {
    const pagos = ['2026-03', '2026-04', '2026-05'].map((p) => pago(p));
    const { meses } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(meses.map((m) => m.periodo)).toEqual(['2026-03', '2026-04', '2026-05']);
  });

  it('ignora los pagos que no son giro al propietario', () => {
    const pagos = [pago('2026-03'), pago('2026-04', { tipo: 'canon_inquilino' })];
    const { meses } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(meses).toHaveLength(1);
  });

  it('ignora los pagos de otro año gravable', () => {
    const pagos = [pago('2026-12'), pago('2027-01')];
    const { meses } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(meses.map((m) => m.periodo)).toEqual(['2026-12']);
  });

  it('ordena por período aunque lleguen al revés: el `desde` y el `hasta` dependen de eso', () => {
    const pagos = [pago('2026-05'), pago('2026-03'), pago('2026-04')];
    const { meses } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(meses.map((m) => m.periodo)).toEqual(['2026-03', '2026-04', '2026-05']);
  });
});

describe('🔍 el contraste contra lo que de verdad se giró', () => {
  it('cuando el giro registrado coincide con el calculado, no hay descuadre', () => {
    const { meses, descuadres } = mesesDesdePagos(contrato(), [pago('2026-03')], '2026');
    // El calculado para este contrato es el giro que lleva el pago sembrado.
    expect(meses[0].liquidacion.giroAlPropietario).toBe(1_726_300);
    expect(descuadres).toHaveLength(0);
  });

  it('🔴 si el canon cambió durante el año, el mes que no cuadra se DICE con su diferencia', () => {
    // Enero se giró con el canon viejo; el desglose se recalcula con el de hoy.
    const pagos = [pago('2026-03', { montoEsperado: 1_500_000 }), pago('2026-04')];
    const { descuadres } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(descuadres).toHaveLength(1);
    expect(descuadres[0].periodo).toBe('2026-03');
    expect(descuadres[0].registrado).toBe(1_500_000);
    expect(descuadres[0].calculado).toBe(1_726_300);
  });

  it('manda lo RECIBIDO sobre lo esperado: es lo que de verdad entró', () => {
    const pagos = [pago('2026-03', { montoEsperado: 1_726_300, montoRecibido: 1_700_000 })];
    const { descuadres } = mesesDesdePagos(contrato(), pagos, '2026');
    expect(descuadres[0].registrado).toBe(1_700_000);
  });
});

describe('🔴 el certificado NO mezcla contratos (§263)', () => {
  /*
   * Filtraba por tipo y por año, nunca por `contratoId` — que el modelo guarda en cada pago desde
   * el principio. Con dos contratos, a la propietaria del A se le entregaba un papel firmado que
   * declara como INGRESO SUYO el dinero girado al propietario del B. Muerde el segundo día.
   */
  const contrato = { id: 'CTO-A', canon: 2_000_000, administracionPH: 300_000 } as never;
  const pagos = [
    { id: 'p1', contratoId: 'CTO-A', tipo: 'payout_propietario', periodo: '2026-01', montoRecibido: 1_726_300 },
    { id: 'p2', contratoId: 'CTO-B', tipo: 'payout_propietario', periodo: '2026-02', montoRecibido: 9_999_999 },
    { id: 'p3', contratoId: 'CTO-A', tipo: 'payout_propietario', periodo: '2026-03', montoRecibido: 1_726_300 },
  ] as never[];

  it('certifica SOLO los meses de su contrato', () => {
    const { meses } = mesesDesdePagos(contrato, pagos, '2026');
    expect(meses.map((m) => m.periodo)).toEqual(['2026-01', '2026-03']);
  });

  it('el mes del OTRO contrato no entra ni por el año', () => {
    const { meses } = mesesDesdePagos(contrato, pagos, '2026');
    expect(meses.map((m) => m.periodo)).not.toContain('2026-02');
  });

  it('los años ofrecidos son los de ESE contrato, no los de todos', () => {
    const conB = [...pagos, { id: 'p4', contratoId: 'CTO-B', tipo: 'payout_propietario', periodo: '2024-05' }] as never[];
    expect(aniosConPagos(conB, 'CTO-A')).toEqual(['2026']);
    expect(aniosConPagos(conB, 'CTO-B')).toEqual(['2026', '2024']);
  });
});

describe('aniosConPagos', () => {
  it('ofrece solo los años que tienen giros, y el más reciente primero', () => {
    const pagos = [pago('2025-11'), pago('2026-03'), pago('2026-04')];
    expect(aniosConPagos(pagos)).toEqual(['2026', '2025']);
  });

  it('sin giros no ofrece ningún año: un selector con años vacíos es ruido', () => {
    expect(aniosConPagos([pago('2026-03', { tipo: 'honorarios' })])).toEqual([]);
  });
});
