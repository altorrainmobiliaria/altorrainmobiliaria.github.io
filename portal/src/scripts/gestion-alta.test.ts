import { describe, expect, it } from 'vitest';
import { cuerpoDeAlta, explicarFallo, siguienteSecuencia, type RefsAlta, type TxAlta } from './gestion-alta';
import type { EntradaAlta } from '../lib/domain/alta-propiedad';

// Transacción del alta (§108). Se prueba el CUERPO, separado del SDK a propósito: lo que puede salir
// mal aquí —contador desincronizado, código ocupado, secuencia agotada— no se reproduce con un
// emulador sin montar carreras, y sí se reproduce exactamente con una `tx` falsa.

const AHORA = new Date('2026-08-22T10:00:00.000Z');

function entrada(over: Partial<EntradaAlta> = {}): EntradaAlta {
  return {
    operacion: 'venta',
    tipo: 'apartamento',
    estado: 'disponible',
    titulo: 'Apartamento con vista al mar',
    ciudad: 'Cartagena de Indias',
    barrio: 'Bocagrande',
    valorVenta: '450000000',
    imagenes: ['props/INM-202608-0001/1.webp'],
    ...over,
  };
}

/** `tx` falsa: guarda lo leído y lo escrito para poder afirmar sobre el orden y el contenido. */
function txFalsa(opciones: { contadores?: Record<string, unknown>; ocupados?: string[] } = {}) {
  const escrituras: Array<{ ref: string; datos: unknown; merge: boolean }> = [];
  const lecturas: string[] = [];
  const refs: RefsAlta = {
    contadores: 'config/counters',
    propiedad: (codigo) => `propiedades/${codigo}`,
  };
  const tx: TxAlta = {
    async get(ref) {
      lecturas.push(String(ref));
      if (ref === refs.contadores) {
        return { exists: () => !!opciones.contadores, data: () => opciones.contadores };
      }
      const codigo = String(ref).split('/')[1];
      const existe = (opciones.ocupados ?? []).includes(codigo);
      return { exists: () => existe, data: () => (existe ? { id: codigo } : undefined) };
    },
    set(ref, datos, op) {
      escrituras.push({ ref: String(ref), datos, merge: !!op?.merge });
    },
  };
  return { tx, refs, escrituras, lecturas };
}

describe('siguienteSecuencia — un contador con basura no rompe el alta', () => {
  it('empieza en 1 cuando no hay contador para ese mes', () => {
    expect(siguienteSecuencia(undefined, 'INM-202608')).toBe(1);
    expect(siguienteSecuencia({}, 'INM-202608')).toBe(1);
    expect(siguienteSecuencia({ 'INM-202607': 12 }, 'INM-202608')).toBe(1);
  });

  it('incrementa el del mes, sin tocar los otros', () => {
    expect(siguienteSecuencia({ 'INM-202608': 6, 'INM-202607': 99 }, 'INM-202608')).toBe(7);
  });

  it('un valor imposible se trata como «no hay contador», no como 0 por accidente', () => {
    for (const v of ['siete', -3, 1.5, null, {}]) {
      expect(siguienteSecuencia({ 'INM-202608': v }, 'INM-202608')).toBe(1);
    }
  });
});

describe('cuerpoDeAlta — el camino bueno', () => {
  it('acuña el código del mes y escribe propiedad + contador', async () => {
    const { tx, refs, escrituras } = txFalsa({ contadores: { 'INM-202608': 6 } });
    const r = await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.propiedad.id).toBe('INM-202608-0007');
    expect(escrituras).toHaveLength(2);
    expect(escrituras[0]).toMatchObject({ ref: 'propiedades/INM-202608-0007', merge: false });
    expect(escrituras[1]).toMatchObject({ ref: 'config/counters', merge: true });
  });

  it('🔴 el contador se escribe con MERGE: borrarlo entero se llevaría los otros meses', async () => {
    const { tx, refs, escrituras } = txFalsa({ contadores: { 'INM-202607': 40, 'INM-202608': 1 } });
    await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    const contador = escrituras.find((e) => e.ref === 'config/counters');
    expect(contador?.merge).toBe(true);
    expect(contador?.datos).toEqual({ 'INM-202608': 2 });
  });

  it('la propiedad se crea ENTERA, sin merge (L-09)', async () => {
    const { tx, refs, escrituras } = txFalsa();
    await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    expect(escrituras.find((e) => e.ref.startsWith('propiedades/'))?.merge).toBe(false);
  });

  it('el primer alta de un mes empieza en 0001', async () => {
    const { tx, refs } = txFalsa();
    const r = await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    expect(r.ok && r.propiedad.id).toBe('INM-202608-0001');
  });
});

describe('🔴 cuerpoDeAlta — lo que impide perder datos', () => {
  it('🎯 si el código ya está ocupado NO escribe nada: no sobrescribe un inmueble existente', async () => {
    // Esta es la red que las Rules NO ponen para el super_admin, que es justo quien usa el panel.
    const { tx, refs, escrituras } = txFalsa({ contadores: { 'INM-202608': 0 }, ocupados: ['INM-202608-0001'] });
    const r = await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.fallo).toEqual({ tipo: 'id-ocupado', codigo: 'INM-202608-0001' });
    expect(escrituras).toEqual([]);
  });

  it('con la secuencia agotada falla y no escribe', async () => {
    const { tx, refs, escrituras } = txFalsa({ contadores: { 'INM-202608': 9999 } });
    const r = await cuerpoDeAlta(tx, refs, entrada(), AHORA);
    expect(r.ok === false && r.fallo.tipo).toBe('secuencia-agotada');
    expect(escrituras).toEqual([]);
  });

  it('una entrada inválida no gasta ni la lectura del documento ni una escritura', async () => {
    const { tx, refs, escrituras, lecturas } = txFalsa();
    const r = await cuerpoDeAlta(tx, refs, entrada({ titulo: '', imagenes: [] }), AHORA);
    expect(r.ok === false && r.fallo.tipo).toBe('validacion');
    expect(escrituras).toEqual([]);
    // Solo se leyó el contador; el documento de la propiedad NO, porque ni siquiera era guardable.
    expect(lecturas).toEqual(['config/counters']);
  });

  it('el fallo de validación viaja con los campos, para pintarlos donde están', async () => {
    const { tx, refs } = txFalsa();
    const r = await cuerpoDeAlta(tx, refs, entrada({ titulo: '', ciudad: '' }), AHORA);
    expect(r.ok).toBe(false);
    if (r.ok || r.fallo.tipo !== 'validacion') return;
    expect(r.fallo.errores.map((e) => e.campo)).toEqual(expect.arrayContaining(['titulo', 'ciudad']));
  });
});

describe('explicarFallo — cada fallo dice qué hacer, no solo qué pasó', () => {
  it('distingue permiso de red, que son acciones distintas', () => {
    expect(explicarFallo({ tipo: 'permiso' })).toMatch(/sesión|sesion/i);
    expect(explicarFallo({ tipo: 'red', detalle: 'x' })).toMatch(/conexión|conexion/i);
  });

  it('el código ocupado avisa de que NO se guardó nada', () => {
    expect(explicarFallo({ tipo: 'id-ocupado', codigo: 'INM-202608-0001' })).toContain('INM-202608-0001');
    expect(explicarFallo({ tipo: 'id-ocupado', codigo: 'X' })).toMatch(/no se guardó|no se guardo/i);
  });

  it('ninguno sale vacío ni con undefined', () => {
    const todos = [
      { tipo: 'validacion', errores: [] },
      { tipo: 'secuencia-agotada' },
      { tipo: 'id-ocupado', codigo: 'X' },
      { tipo: 'permiso' },
      { tipo: 'red', detalle: 'x' },
    ] as const;
    for (const f of todos) {
      expect(explicarFallo(f).length).toBeGreaterThan(15);
      expect(explicarFallo(f)).not.toContain('undefined');
    }
  });
});
