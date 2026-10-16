import { describe, expect, it } from 'vitest';
import { puedeContactar } from './calendario-co';
import {
  aperturaSiguiente,
  cuandoColombia,
  enVentana,
  fechaHoraColombia,
  MINUTOS_SLA_LEAD,
  msEnVentana,
  resumenSla,
  slaDeLead,
  SLA_LEAD_DESDE,
  textoCsvSla,
  textoDuracion,
  textoQuedan,
  vencimientoEnHorario,
  vistaSla,
  type DatosSla,
} from './lead-sla';

/** Un instante dado en hora de COLOMBIA (UTC−5), para que las pruebas se lean como un reloj de pared. */
const col = (fecha: string, hh: number, mm = 0, ss = 0): number =>
  Date.parse(`${fecha}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}Z`) +
  5 * 3_600_000;
const MIN = 60_000;
/** Todas las pruebas miden desde el 1-oct, para no depender de la fecha de estreno real. */
const DESDE = col('2026-10-01', 0);
const lead = (o: Partial<{ estado: string; createdAt: number | null; contactadoAt: number | null }>): DatosSla => ({
  estado: o.estado ?? 'pendiente',
  createdAt: o.createdAt == null ? null : new Date(o.createdAt),
  contactadoAt: o.contactadoAt == null ? null : new Date(o.contactadoAt),
});

describe('la ventana de contacto (Ley 2300) es la de calendario-co, no una copia', () => {
  it('coincide hora a hora con puedeContactar durante dos semanas, festivo incluido', () => {
    // Del sábado 10 al viernes 23 de octubre de 2026: un domingo, el festivo del lunes 12, sábados.
    for (let d = 10; d <= 23; d++) {
      const fecha = `2026-10-${d}`;
      for (let h = 0; h < 24; h++) {
        expect(enVentana(col(fecha, h, 30)), `${fecha} ${h}:30`).toBe(puedeContactar(fecha, h));
      }
    }
  });

  it('la apertura siguiente salta la noche, el domingo y el festivo', () => {
    expect(aperturaSiguiente(col('2026-10-16', 10))).toBe(col('2026-10-16', 10)); // ya dentro
    expect(aperturaSiguiente(col('2026-10-16', 6))).toBe(col('2026-10-16', 7));
    expect(aperturaSiguiente(col('2026-10-16', 19))).toBe(col('2026-10-17', 8)); // viernes 19:00 → sábado 8:00
    expect(aperturaSiguiente(col('2026-10-11', 10))).toBe(col('2026-10-13', 7)); // domingo → el lunes 12 es festivo
  });
});

describe('vencimientoEnHorario — los 5 minutos se gastan solo dentro del horario', () => {
  it('a media mañana vence a los 5 minutos de reloj', () => {
    expect(vencimientoEnHorario(col('2026-10-16', 10))).toBe(col('2026-10-16', 10, 5));
  });

  it('a las 18:58 gasta 2 minutos hoy y 3 el sábado desde las 8:00', () => {
    expect(vencimientoEnHorario(col('2026-10-16', 18, 58))).toBe(col('2026-10-17', 8, 3));
  });

  it('el sábado a las 14:58 salta el domingo hasta el lunes 7:03', () => {
    expect(vencimientoEnHorario(col('2026-10-17', 14, 58))).toBe(col('2026-10-19', 7, 3));
  });

  it('de madrugada el reloj arranca a las 7:00', () => {
    expect(vencimientoEnHorario(col('2026-10-13', 3))).toBe(col('2026-10-13', 7, 5));
  });

  it('en Semana Santa salta jueves y viernes santos hasta el sábado', () => {
    // Pascua de 2027: 28 de marzo → jueves 25 y viernes 26 son festivos; el sábado 27 se trabaja.
    expect(vencimientoEnHorario(col('2027-03-24', 18, 59))).toBe(col('2027-03-27', 8, 4));
  });

  it('msEnVentana cuenta solo los tramos permitidos', () => {
    expect(msEnVentana(col('2026-10-16', 18, 58), col('2026-10-17', 8, 3))).toBe(5 * MIN);
    expect(msEnVentana(col('2026-10-16', 20), col('2026-10-16', 22))).toBe(0);
    expect(msEnVentana(col('2026-10-16', 11), col('2026-10-16', 10))).toBe(0);
  });
});

describe('slaDeLead — el reloj de cada lead', () => {
  const entro = col('2026-10-16', 10);

  it('corre: a los 2 minutos quedan 3', () => {
    const s = slaDeLead(lead({ createdAt: entro }), col('2026-10-16', 10, 2), DESDE);
    expect(s).toMatchObject({ fase: 'en-plazo', abierto: true, restanMs: 3 * MIN });
  });

  it('a los 5 minutos justos ya está vencido: el plazo es MENOS de 5', () => {
    expect(slaDeLead(lead({ createdAt: entro }), col('2026-10-16', 10, 5), DESDE)).toMatchObject({ fase: 'vencido', retrasoMs: 0 });
  });

  it('a los 40 minutos va 35 tarde', () => {
    expect(slaDeLead(lead({ createdAt: entro }), col('2026-10-16', 10, 40), DESDE)).toMatchObject({ fase: 'vencido', retrasoMs: 35 * MIN });
  });

  it('un lead de las 18:58 queda en PAUSA esa noche y sigue mañana a las 8:00', () => {
    const s = slaDeLead(lead({ createdAt: col('2026-10-16', 18, 58) }), col('2026-10-16', 21), DESDE);
    expect(s).toMatchObject({ fase: 'pausa', abierto: true, restanMs: 3 * MIN, reanudaMs: col('2026-10-17', 8) });
  });

  it('un lead nocturno no amanece vencido: a las 7:02 le quedan 3 minutos', () => {
    const s = slaDeLead(lead({ createdAt: col('2026-10-15', 23) }), col('2026-10-16', 7, 2), DESDE);
    expect(s).toMatchObject({ fase: 'en-plazo', restanMs: 3 * MIN });
  });

  it('con el PC atrasado no promete más de 5 minutos ni da negativo', () => {
    const s = slaDeLead(lead({ createdAt: entro }), col('2026-10-16', 9, 58), DESDE);
    expect(s).toMatchObject({ fase: 'en-plazo', restanMs: 5 * MIN });
  });

  it('contactado a los 4 min y a los 5 justos es a tiempo; a los 5:01, tarde', () => {
    expect(slaDeLead(lead({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 4) }), 0, DESDE)).toMatchObject({
      fase: 'contactado', abierto: false, aTiempo: true, tardoMs: 4 * MIN,
    });
    expect(slaDeLead(lead({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 5) }), 0, DESDE)).toMatchObject({ aTiempo: true });
    expect(slaDeLead(lead({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 5, 1) }), 0, DESDE)).toMatchObject({
      aTiempo: false, retrasoMs: 1000,
    });
  });

  it('una marca anterior a la entrada (relojes desfasados) cuenta como a tiempo, en 0', () => {
    expect(slaDeLead(lead({ createdAt: entro, contactadoAt: entro - 3000 }), 0, DESDE)).toMatchObject({ aTiempo: true, tardoMs: 0 });
  });

  it('lo que entró antes del estreno no recibe veredicto, abierto o cerrado', () => {
    const antes = DESDE - MIN;
    expect(slaDeLead(lead({ createdAt: antes }), col('2026-10-16', 10), DESDE)).toEqual({ fase: 'sin-medir', abierto: true, porque: 'anterior' });
    expect(slaDeLead(lead({ createdAt: antes, contactadoAt: col('2026-10-16', 10) }), 0, DESDE)).toEqual({
      fase: 'sin-medir', abierto: false, porque: 'anterior',
    });
  });

  it('lo que movió el panel viejo (u otro estado) se para SIN hora inventada', () => {
    for (const estado of ['en_gestion', 'visita', 'cerrado', 'contactado', 'descartado']) {
      expect(slaDeLead(lead({ estado, createdAt: entro }), col('2026-10-16', 12), DESDE), estado).toEqual({
        fase: 'sin-medir', abierto: false, porque: 'otro-panel',
      });
    }
  });

  it('«nuevo» y el vacío corren como «pendiente»', () => {
    for (const estado of ['nuevo', '']) {
      expect(slaDeLead(lead({ estado, createdAt: entro }), col('2026-10-16', 10, 1), DESDE).fase).toBe('en-plazo');
    }
  });

  it('una entrada en el FUTURO no corre: sin hora, sin contar en el título (§330)', () => {
    // El create de las Rules es anónimo y no mira la fecha: un lead fechado en 2099 pintaría un
    // «Quedan 5 min» eterno. Diez minutos de margen cubren un PC atrasado.
    const ahora = col('2026-10-16', 10);
    expect(slaDeLead(lead({ createdAt: Date.parse('2099-01-01T15:00:00Z') }), ahora, DESDE)).toEqual({ fase: 'sin-medir', abierto: true, porque: 'sin-hora' });
    expect(slaDeLead(lead({ createdAt: ahora + 9 * MIN }), ahora, DESDE).fase).toBe('en-plazo');
    expect(resumenSla([lead({ createdAt: Date.parse('2099-01-01T15:00:00Z') })], ahora, DESDE)).toEqual({ sinContactar: 1, enPlazo: 0, vencidos: 0 });
    expect(slaDeLead(lead({ createdAt: Date.parse('2099-01-01T15:00:00Z'), contactadoAt: ahora }), ahora, DESDE)).toEqual({ fase: 'sin-medir', abierto: false, porque: 'sin-hora' });
  });

  it('sin hora de entrada: abierto, sin veredicto', () => {
    expect(slaDeLead(lead({ createdAt: null }), col('2026-10-16', 10), DESDE)).toEqual({ fase: 'sin-medir', abierto: true, porque: 'sin-hora' });
  });

  it('por defecto mide desde el estreno declarado', () => {
    expect(Number.isFinite(Date.parse(SLA_LEAD_DESDE))).toBe(true);
    expect(MINUTOS_SLA_LEAD).toBe(5);
  });
});

describe('resumenSla — lo que cuenta el tablero', () => {
  it('el atraso anterior cuenta como sin contactar, pero no como vencido', () => {
    const ahora = col('2026-10-16', 10, 20);
    const r = resumenSla(
      [
        lead({ createdAt: col('2026-10-16', 10, 18) }), // en plazo
        lead({ createdAt: col('2026-10-16', 10) }), // vencido
        lead({ createdAt: DESDE - MIN }), // anterior, abierto
        lead({ estado: 'en_gestion', createdAt: col('2026-10-16', 9) }), // otro panel: cerrado
        lead({ createdAt: col('2026-10-16', 9), contactadoAt: col('2026-10-16', 9, 3) }), // contactado
      ],
      ahora,
      DESDE,
    );
    expect(r).toEqual({ sinContactar: 3, enPlazo: 1, vencidos: 1 });
  });
});

describe('cómo se dice', () => {
  it('lo que queda se redondea hacia abajo', () => {
    expect(textoQuedan(4 * MIN + 59_000)).toBe('quedan 4 min');
    expect(textoQuedan(90_000)).toBe('queda 1 min');
    expect(textoQuedan(40_000)).toBe('menos de 1 min');
  });

  it('un retraso se redondea en contra nuestra', () => {
    expect(textoDuracion(20_000)).toBe('1 min');
    expect(textoDuracion(59 * MIN)).toBe('59 min');
    expect(textoDuracion(60 * MIN)).toBe('1 h');
    // La revisión (§330): entre 59 y 60 minutos salía «0 h» — minutos hacia arriba, horas hacia abajo.
    expect(textoDuracion(59 * MIN + 1)).toBe('1 h');
    expect(textoDuracion(59.5 * MIN)).toBe('1 h');
    expect(textoDuracion(25 * 60 * MIN)).toBe('1 día');
    expect(textoDuracion(49 * 60 * MIN)).toBe('2 días');
  });

  it('las horas son las de Colombia', () => {
    expect(fechaHoraColombia(col('2026-10-16', 10, 42))).toBe('16 oct, 10:42');
    expect(cuandoColombia(col('2026-10-16', 15), col('2026-10-16', 10))).toBe('hoy a las 15:00');
    expect(cuandoColombia(col('2026-10-17', 8), col('2026-10-16', 21))).toBe('mañana a las 8:00');
    expect(cuandoColombia(col('2026-10-19', 7), col('2026-10-17', 16))).toBe('el lunes 19 a las 7:00');
  });

  it('el oro solo empuja cuando se puede escribir', () => {
    const entro = col('2026-10-16', 10);
    const dia = col('2026-10-16', 10, 30);
    const noche = col('2026-10-16', 22);
    expect(vistaSla(slaDeLead(lead({ createdAt: entro }), dia, DESDE), dia)).toMatchObject({ texto: 'Vencido · +25 min', tono: 'gold' });
    expect(vistaSla(slaDeLead(lead({ createdAt: entro }), noche, DESDE), noche).tono).toBe('navy');
    const corre = col('2026-10-16', 10, 1);
    expect(vistaSla(slaDeLead(lead({ createdAt: entro }), corre, DESDE), corre)).toMatchObject({ texto: 'Quedan 4 min', tono: 'gold' });
  });

  it('cada veredicto tiene su texto exacto', () => {
    const entro = col('2026-10-16', 10);
    const v = (o: Parameters<typeof lead>[0], ahora: number) => vistaSla(slaDeLead(lead(o), ahora, DESDE), ahora, o.contactadoAt ? new Date(o.contactadoAt) : null);
    expect(v({ createdAt: entro, contactadoAt: entro + 70_000 }, 0).texto).toBe('A tiempo · 2 min');
    expect(v({ createdAt: entro, contactadoAt: entro + 40_000 }, 0).texto).toBe('A tiempo · menos de 1 min');
    expect(v({ createdAt: entro, contactadoAt: entro }, 0).texto).toBe('A tiempo · menos de 1 min');
    expect(v({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 11) }, 0).texto).toBe('Tarde · +6 min');
    expect(v({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 11) }, 0).titulo).toContain('16 oct, 10:11');
    expect(v({ createdAt: col('2026-10-16', 18, 58) }, col('2026-10-16', 21)).texto).toBe('En pausa · 3 min');
    expect(v({ createdAt: col('2026-10-16', 18, 58) }, col('2026-10-16', 21)).titulo).toContain('mañana a las 8:00');
    expect(v({ createdAt: DESDE - MIN }, col('2026-10-16', 10)).texto).toBeNull();
  });

  it('el CSV dice el mismo veredicto', () => {
    const entro = col('2026-10-16', 10);
    expect(textoCsvSla(slaDeLead(lead({ createdAt: entro, contactadoAt: col('2026-10-16', 10, 3) }), 0, DESDE))).toBe('A tiempo (3 min)');
    expect(textoCsvSla(slaDeLead(lead({ createdAt: entro }), col('2026-10-16', 12), DESDE))).toBe('Vencido (+1 h)');
    expect(textoCsvSla(slaDeLead(lead({ createdAt: null }), 0, DESDE))).toBe('Sin medir');
  });
});
