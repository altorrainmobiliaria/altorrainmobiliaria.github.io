import { describe, expect, it } from 'vitest';
import {
  accionDeMora,
  cifrasDePago,
  agenda,
  diasDeMora,
  diasEntre,
  DIA_TOPE_PAYOUT,
  estadoDePago,
  hitosDeContrato,
  honorariosDe,
  idPago,
  periodoDe,
  MESES_AVISO_RENOVACION,
  proximoDiaDePago,
  sumarMeses,
  tierDeMora,
} from './agenda';
import type { Contrato } from './gestion';

// Agenda operativa (§112). Todo con `hoy` inyectado: se prueba el día 4 de mora sin esperar cuatro
// días, y el aviso de renovación sin esperar ocho meses. Lo que se fija aquí son DECISIONES —cuándo
// avisar, cuándo empieza la mora— no formato.

const HOY = '2026-08-22';

function contrato(over: Partial<Contrato> = {}): Contrato {
  return {
    _version: 1,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
    id: 'CTR-1',
    expedienteId: 'EXP-1',
    tipo: 'arriendo',
    vertical: 'vivienda',
    estado: 'vigente',
    partes: {},
    canon: 2_500_000,
    diaPago: 5,
    vigenciaInicio: '2025-11-01',
    vigenciaFin: '2026-11-01',
    renovacionAutomatica: true,
    ...over,
  } as Contrato;
}

describe('aritmética de fechas — donde JavaScript miente', () => {
  it('🔴 sumar un mes al 31 NO se va a marzo', () => {
    // `setMonth` desborda en silencio: 31-ene + 1 mes da 3 de marzo. En una agenda de contratos eso
    // mueve un vencimiento a otro mes sin que nadie lo note.
    expect(sumarMeses('2026-01-31', 1)).toBe('2026-02-28');
    expect(sumarMeses('2024-01-31', 1)).toBe('2024-02-29'); // bisiesto
    expect(sumarMeses('2026-03-31', -1)).toBe('2026-02-28');
  });

  it('suma y resta meses conservando el día cuando existe', () => {
    expect(sumarMeses('2026-11-01', -4)).toBe('2026-07-01');
    expect(sumarMeses('2026-08-15', 12)).toBe('2027-08-15');
  });

  it('cuenta días con signo', () => {
    expect(diasEntre('2026-08-22', '2026-08-25')).toBe(3);
    expect(diasEntre('2026-08-22', '2026-08-22')).toBe(0);
    expect(diasEntre('2026-08-22', '2026-08-20')).toBe(-2);
  });

  it('el próximo día de pago incluye HOY, no lo salta', () => {
    expect(proximoDiaDePago('2026-08-01', 5)).toBe('2026-08-05');
    expect(proximoDiaDePago('2026-08-05', 5)).toBe('2026-08-05'); // hoy cuenta
    expect(proximoDiaDePago('2026-08-06', 5)).toBe('2026-09-05');
  });

  it('un día de pago imposible se recorta en vez de producir una fecha absurda', () => {
    expect(proximoDiaDePago('2026-08-01', 31)).toBe('2026-08-28');
    expect(proximoDiaDePago('2026-08-01', 0)).toBe('2026-08-01');
  });
});

describe('hitos de un contrato', () => {
  const tipos = (c: Contrato, hoy = HOY) => hitosDeContrato(c, hoy).map((h) => h.tipo).sort();

  it('un arriendo vigente genera canon, payout, preaviso y renovación', () => {
    expect(tipos(contrato())).toEqual(['canon', 'payout', 'preaviso', 'renovacion']);
  });

  it('🎯 el aviso de renovación llega 4 meses antes, no 3', () => {
    // El preaviso LEGAL es de 3 meses (Ley 820). Avisar a los 3 es avisar el día del plazo: no deja
    // tiempo para decidir, hablar con el propietario y mandar la comunicación.
    const h = hitosDeContrato(contrato({ vigenciaFin: '2026-11-01' }), HOY).find((x) => x.tipo === 'preaviso');
    expect(h?.fecha).toBe('2026-07-01');
    expect(MESES_AVISO_RENOVACION).toBe(4);
    // Y el detalle CITA la norma: quien lo lea sabe por qué no puede posponerlo.
    expect(h?.detalle).toMatch(/Ley 820/);
  });

  it('un contrato TERMINADO no genera nada: llenar la lista esconde lo urgente', () => {
    expect(hitosDeContrato(contrato({ estado: 'terminado' }), HOY)).toEqual([]);
  });

  it('el pago al propietario va antes del día 10 (proceso del dueño)', () => {
    const h = hitosDeContrato(contrato(), HOY).find((x) => x.tipo === 'payout');
    expect(DIA_TOPE_PAYOUT).toBe(10);
    expect(h?.fecha.endsWith('-10')).toBe(true);
  });

  it('el IPC cae en el ANIVERSARIO, y salta los que ya pasaron', () => {
    // Un contrato de 2023 renovado varias veces no debe proponer un aniversario de hace tres años.
    const h = hitosDeContrato(contrato({ incrementoIPC: true, vigenciaInicio: '2023-03-15' }), HOY)
      .find((x) => x.tipo === 'ipc');
    expect(h?.fecha).toBe('2027-03-15');
    expect(h!.dias).toBeGreaterThan(0);
  });

  it('sin IPC no aparece el hito', () => {
    expect(tipos(contrato({ incrementoIPC: false }))).not.toContain('ipc');
  });

  it('un contrato de administración no genera cobro de canon', () => {
    expect(tipos(contrato({ tipo: 'administracion' }))).not.toContain('canon');
  });

  it('la renovación automática y la que no lo es dicen cosas DISTINTAS', () => {
    const auto = hitosDeContrato(contrato({ renovacionAutomatica: true }), HOY).find((h) => h.tipo === 'renovacion');
    const no = hitosDeContrato(contrato({ renovacionAutomatica: false }), HOY).find((h) => h.tipo === 'renovacion');
    expect(auto?.titulo).toMatch(/autom/i);
    expect(no?.titulo).toMatch(/[Tt]ermina/);
    expect(auto?.titulo).not.toBe(no?.titulo);
  });
});

describe('urgencia', () => {
  const urgenciaDe = (fin: string, hoy: string) =>
    hitosDeContrato(contrato({ vigenciaFin: fin }), hoy).find((h) => h.tipo === 'renovacion')?.urgencia;

  it('clasifica por cercanía', () => {
    expect(urgenciaDe('2026-08-20', HOY)).toBe('vencido');
    expect(urgenciaDe('2026-08-22', HOY)).toBe('hoy');
    expect(urgenciaDe('2026-08-26', HOY)).toBe('semana');
    expect(urgenciaDe('2026-09-15', HOY)).toBe('mes');
    expect(urgenciaDe('2027-05-01', HOY)).toBe('despues');
  });
});

describe('agenda — la lista que se mira cada mañana', () => {
  it('ordena por fecha', () => {
    const lista = agenda([contrato(), contrato({ id: 'CTR-2', diaPago: 1, vigenciaFin: '2026-09-01' })], HOY);
    const fechas = lista.map((h) => h.fecha);
    expect([...fechas].sort()).toEqual(fechas);
  });

  it('recorta por ventana hacia delante', () => {
    const corta = agenda([contrato()], HOY, 15);
    expect(corta.every((h) => h.dias <= 15)).toBe(true);
    expect(agenda([contrato()], HOY, 400).length).toBeGreaterThan(corta.length);
  });

  it('🎯 lo VENCIDO entra siempre, aunque quede fuera de la ventana', () => {
    // Una fecha que se pasó no deja de importar porque el calendario avance: es lo primero que hay
    // que ver, no lo primero que se cae de la lista.
    const viejo = contrato({ vigenciaFin: '2026-01-15', incrementoIPC: false });
    const lista = agenda([viejo], HOY, 7);
    expect(lista.some((h) => h.urgencia === 'vencido')).toBe(true);
  });

  it('no revienta con una lista vacía', () => {
    expect(agenda([], HOY)).toEqual([]);
  });
});

describe('mora — el protocolo del dueño, ejecutable', () => {
  const pago = (over: Record<string, unknown> = {}) =>
    ({ fechaVencimiento: '2026-08-05', montoEsperado: 2_500_000, ...over }) as never;

  it('cuenta los días de retraso', () => {
    expect(diasDeMora(pago(), '2026-08-05')).toBe(0);
    expect(diasDeMora(pago(), '2026-08-12')).toBe(7);
    expect(diasDeMora(pago(), '2026-08-01')).toBe(0); // aún no vence
  });

  it('🎯 si ya se pagó, la mora deja de crecer: es la que hubo AL PAGAR', () => {
    expect(diasDeMora(pago({ fechaPago: '2026-08-08' }), '2026-09-30')).toBe(3);
  });

  it('el escalón entra el día exacto, no al día siguiente', () => {
    // El protocolo dice «al día 5». Redondear a favor del moroso es cómo una cobranza se retrasa sola.
    expect(tierDeMora(4)).toBe(0);
    expect(tierDeMora(5)).toBe(1);
    expect(tierDeMora(10)).toBe(2);
    expect(tierDeMora(15)).toBe(3);
    expect(tierDeMora(30)).toBe(4);
    expect(tierDeMora(45)).toBe(5);
    expect(tierDeMora(200)).toBe(5);
  });

  it('estado derivado del CALENDARIO, no del campo guardado', () => {
    expect(estadoDePago(pago(), '2026-08-01').estado).toBe('pendiente');
    expect(estadoDePago(pago(), '2026-08-20').estado).toBe('mora');
    expect(estadoDePago(pago({ montoRecibido: 2_500_000 }), '2026-08-20').estado).toBe('al_dia');
  });

  it('🔴 «parcial» NO es «al día»: recibir la mitad no salda nada', () => {
    const r = estadoDePago(pago({ montoRecibido: 1_000_000 }), '2026-08-20');
    expect(r.estado).toBe('parcial');
    expect(r.diasMora).toBe(15);
    expect(r.moraTier).toBe(3);
  });

  it('pagar de más sigue siendo estar al día', () => {
    expect(estadoDePago(pago({ montoRecibido: 3_000_000 }), '2026-08-20').estado).toBe('al_dia');
  });

  it('cada escalón dice QUÉ HACER, no solo su número', () => {
    for (let t = 0; t <= 5; t++) {
      expect(accionDeMora(t).length).toBeGreaterThan(10);
      expect(accionDeMora(t)).not.toContain('undefined');
    }
    expect(accionDeMora(1)).not.toBe(accionDeMora(5));
    expect(accionDeMora(5)).toMatch(/jur/i);
  });
});

describe('cifras de un pago (§115) — salen del CONTRATO, no del teclado', () => {
  const c = (over: Partial<Contrato> = {}) =>
    contrato({ canon: 2_500_000, administracion: 300_000, honorariosPct: 10, ...over });

  it('el id es DETERMINISTA: registrar dos veces escribe el mismo documento', () => {
    const a = idPago('CTR-1', '2026-08', 'canon_inquilino');
    expect(a).toBe('CTR-1_2026-08_canon_inquilino');
    expect(idPago('CTR-1', '2026-08', 'canon_inquilino')).toBe(a);
    // El TIPO entra en el id: el canon y el giro al propietario del mismo mes son documentos distintos.
    expect(idPago('CTR-1', '2026-08', 'payout_propietario')).not.toBe(a);
  });

  it('el arrendatario debe canon + administración, y vence su día de pago', () => {
    const r = cifrasDePago(c(), '2026-08', 'canon_inquilino');
    expect(r).toEqual({ montoEsperado: 2_800_000, fechaVencimiento: '2026-08-05' });
  });

  it('si la administración ya va dentro del canon, no se suma dos veces', () => {
    const r = cifrasDePago(c({ adminIncluidaEnCanon: true }), '2026-08', 'canon_inquilino');
    expect(r?.montoEsperado).toBe(2_500_000);
  });

  it('🎯 el IVA va sobre los HONORARIOS, jamás sobre el canon', () => {
    // Confundirlos multiplicaría por cinco lo que se le cobra al propietario: el 19% de 250.000 son
    // 47.500; el 19% de 2.500.000 serían 475.000.
    expect(honorariosDe(c({ ivaSobreHonorarios: false }))).toBe(250_000);
    expect(honorariosDe(c({ ivaSobreHonorarios: true }))).toBe(297_500);
  });

  it('sin porcentaje pactado no hay honorarios que cobrar', () => {
    expect(honorariosDe(c({ honorariosPct: undefined }))).toBe(0);
    expect(cifrasDePago(c({ honorariosPct: undefined }), '2026-08', 'honorarios')).toBeNull();
  });

  it('🎯 el propietario recibe canon − honorarios, y la administración NO es suya', () => {
    // La administración es de la copropiedad; meterla en el giro sería pagarle al propietario un
    // dinero que tiene que salir hacia otro sitio.
    const r = cifrasDePago(c({ ivaSobreHonorarios: true }), '2026-08', 'payout_propietario');
    expect(r?.montoEsperado).toBe(2_500_000 - 297_500);
  });

  it('el giro al propietario vence el día 10, no el día de pago del canon', () => {
    const r = cifrasDePago(c({ diaPago: 5 }), '2026-08', 'payout_propietario');
    expect(r?.fechaVencimiento).toBe('2026-08-10');
  });

  it('los servicios públicos no salen del contrato: los trae la factura', () => {
    expect(cifrasDePago(c(), '2026-08', 'servicios_publicos')).toBeNull();
  });

  it('un contrato sin canon no genera cobro ni giro', () => {
    expect(cifrasDePago(c({ canon: undefined }), '2026-08', 'canon_inquilino')).toBeNull();
    expect(cifrasDePago(c({ canon: undefined }), '2026-08', 'payout_propietario')).toBeNull();
  });

  it('periodoDe recorta a año-mes', () => {
    expect(periodoDe('2026-08-22T10:00:00Z')).toBe('2026-08');
    expect(periodoDe('')).toBe('');
  });
});
