import { describe, expect, it } from 'vitest';
import {
  cadenaAFirmar,
  claveIdempotente,
  codigoDeRespuesta,
  decidir,
  estadoDelMandato,
  explicarVeredicto,
  igualEnTiempoConstante,
  valorEnRuta,
  type EventoWompi,
} from './wompi-evento';

const SECRETO = 'prod_events_XXXXXXXX';

/** Un evento como los que manda Wompi, con `properties` explícito. */
const evento = (extra: Partial<EventoWompi> = {}, tx: Record<string, unknown> = {}): EventoWompi => ({
  id: 'evt-001',
  event: 'transaction.updated',
  timestamp: 1_724_700_000,
  signature: {
    properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
    checksum: 'no-usado-en-estas-pruebas',
  },
  data: { transaction: { id: '113-1234', status: 'APPROVED', amount_in_cents: 230_000_000, ...tx } },
  ...extra,
});

describe('valorEnRuta — resolver las rutas del `properties`', () => {
  it('resuelve una ruta con puntos contra `data`', () => {
    expect(valorEnRuta(evento(), 'transaction.amount_in_cents')).toBe(230_000_000);
    expect(valorEnRuta(evento(), 'transaction.status')).toBe('APPROVED');
  });

  it('devuelve undefined si el camino se rompe, no una cadena vacía', () => {
    expect(valorEnRuta(evento(), 'transaction.no_existe')).toBeUndefined();
    expect(valorEnRuta(evento(), 'nada.de.nada')).toBeUndefined();
  });
});

describe('cadenaAFirmar — 🔑 el conjunto de campos es DINÁMICO', () => {
  it('concatena los valores en el ORDEN del `properties`, luego timestamp, luego el secreto', () => {
    expect(cadenaAFirmar(evento(), SECRETO)).toBe(`113-1234APPROVED2300000001724700000${SECRETO}`);
  });

  it('🎯 si `properties` cambia, la cadena cambia — hardcodear los 3 campos de siempre rompería', () => {
    const otro = evento({
      signature: { properties: ['transaction.status', 'transaction.id'] },
    });
    // Orden invertido y sin el monto: exactamente el caso que la skill avisa que rompe.
    expect(cadenaAFirmar(otro, SECRETO)).toBe(`APPROVED113-12341724700000${SECRETO}`);
  });

  it('el secreto va de SUFIJO, nunca de prefijo', () => {
    const c = cadenaAFirmar(evento(), SECRETO)!;
    expect(c.endsWith(SECRETO)).toBe(true);
    expect(c.startsWith(SECRETO)).toBe(false);
  });

  it('🔴 devuelve null si una ruta NO resuelve: una firma a medias sería una firma inventada', () => {
    const roto = evento({
      signature: { properties: ['transaction.id', 'transaction.campo_que_no_existe'] },
    });
    expect(cadenaAFirmar(roto, SECRETO)).toBeNull();
  });

  it('devuelve null sin `properties` o sin `timestamp`', () => {
    expect(cadenaAFirmar(evento({ signature: {} }), SECRETO)).toBeNull();
    expect(cadenaAFirmar(evento({ signature: { properties: [] } }), SECRETO)).toBeNull();
    expect(cadenaAFirmar(evento({ timestamp: undefined }), SECRETO)).toBeNull();
  });

  it('el timestamp entra tal cual, sin formatear', () => {
    const c = cadenaAFirmar(evento({ timestamp: 1 }), SECRETO)!;
    expect(c).toContain('APPROVED2300000001' + SECRETO);
  });
});

describe('igualEnTiempoConstante', () => {
  it('acepta iguales y rechaza distintos', () => {
    expect(igualEnTiempoConstante('abc123', 'abc123')).toBe(true);
    expect(igualEnTiempoConstante('abc123', 'abc124')).toBe(false);
  });
  it('rechaza longitudes distintas sin explotar', () => {
    expect(igualEnTiempoConstante('abc', 'abcd')).toBe(false);
    expect(igualEnTiempoConstante('', '')).toBe(true);
  });
});

describe('claveIdempotente — 🔁 la trampa que deja un cobro pendiente para siempre', () => {
  it('prefiere el `id` del EVENTO', () => {
    expect(claveIdempotente(evento())).toBe('evt-001');
  });

  it('🎯 PENDING y APPROVED de la MISMA transacción son claves DISTINTAS', () => {
    // Es el caso de PSE y Nequi. Con `transaction.id` como clave, el APPROVED —el que confirma el
    // pago— se descartaría por duplicado y el cobro quedaría eternamente pendiente.
    const pendiente = evento({ id: undefined }, { status: 'PENDING' });
    const aprobado = evento({ id: undefined }, { status: 'APPROVED' });
    expect(claveIdempotente(pendiente)).toBe('113-1234:PENDING');
    expect(claveIdempotente(aprobado)).toBe('113-1234:APPROVED');
    expect(claveIdempotente(pendiente)).not.toBe(claveIdempotente(aprobado));
  });

  it('nunca es solo el id de la transacción', () => {
    const sinId = evento({ id: undefined });
    expect(claveIdempotente(sinId)).not.toBe('113-1234');
  });

  it('devuelve null si no hay con qué identificarlo', () => {
    expect(claveIdempotente(evento({ id: '   ' }, { id: undefined }))).toBeNull();
    expect(claveIdempotente({ signature: {}, data: {} })).toBeNull();
  });
});

describe('estadoDelMandato — ⚠️ APPROVED no es «liberado»', () => {
  it('APPROVED deja el dinero RETENIDO, no liberado', () => {
    expect(estadoDelMandato('APPROVED')).toBe('retenido');
  });
  it('mapea el resto de estados', () => {
    expect(estadoDelMandato('PENDING')).toBe('esperando');
    expect(estadoDelMandato('VOIDED')).toBe('reversado');
    expect(estadoDelMandato('DECLINED')).toBe('fallido');
    expect(estadoDelMandato('ERROR')).toBe('fallido');
  });
  it('un estado desconocido no se da por bueno', () => {
    expect(estadoDelMandato('LO_QUE_SEA')).toBe('esperando');
  });
});

describe('decidir — el orden importa', () => {
  const vacias = new Set<string>();

  it('procesa un evento auténtico y nuevo', () => {
    expect(decidir(evento(), 'abc', 'abc', vacias)).toBe('procesar');
  });

  it('marca duplicado el que ya se vio', () => {
    expect(decidir(evento(), 'abc', 'abc', new Set(['evt-001']))).toBe('duplicado');
  });

  it('🔴 comprueba la FIRMA ANTES que la idempotencia', () => {
    // Si fuera al revés, bastaría con mandar basura con la clave de un evento legítimo para que el
    // de verdad se descartara después como «duplicado». Un guardia que apunta en la lista antes de
    // mirar el carnet no es un guardia.
    expect(decidir(evento(), 'abc', 'OTRO', new Set(['evt-001']))).toBe('firma-invalida');
  });

  it('distingue «sin firma» de «firma inválida»', () => {
    expect(decidir(evento(), null, 'abc', vacias)).toBe('sin-firma');
    expect(decidir(evento(), 'abc', null, vacias)).toBe('firma-invalida');
  });

  it('marca malformado lo que no se puede juzgar', () => {
    expect(decidir(evento({ signature: {} }), 'abc', 'abc', vacias)).toBe('malformado');
    expect(decidir(evento({ timestamp: undefined }), 'abc', 'abc', vacias)).toBe('malformado');
  });

  it('malformado si es auténtico pero no hay clave con qué identificarlo', () => {
    const sinClave = evento({ id: '  ' }, { id: undefined });
    expect(decidir(sinClave, 'abc', 'abc', vacias)).toBe('malformado');
  });
});

describe('codigoDeRespuesta — 🚦 200 hasta para lo falsificado', () => {
  it('todos los veredictos devuelven 200', () => {
    for (const v of ['procesar', 'duplicado', 'firma-invalida', 'sin-firma', 'malformado'] as const) {
      expect(codigoDeRespuesta(v)).toBe(200);
    }
  });

  it('el 500 se reserva para una caída NUESTRA, que es la que sí conviene reintentar', () => {
    expect(codigoDeRespuesta('fallo-interno')).toBe(500);
  });
});

describe('explicarVeredicto', () => {
  it('cada veredicto se explica, y el desconocido también', () => {
    for (const v of ['procesar', 'duplicado', 'firma-invalida', 'sin-firma', 'malformado'] as const) {
      expect(explicarVeredicto(v).length).toBeGreaterThan(20);
    }
    expect(explicarVeredicto('vaya-usted-a-saber' as never).length).toBeGreaterThan(10);
  });
});
