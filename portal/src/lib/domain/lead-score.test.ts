import { describe, expect, it } from 'vitest';
import { puntuar, techoAlcanzable, tierDe, type CampoLead } from './lead-score';

/** Lo que `/publicar` PUEDE preguntar hoy: no pide correo (fiel a su mockup). */
const CAMPOS_PUBLICAR: readonly CampoLead[] = ['nombre', 'telefono', 'mensaje', 'presupuesto'];
/** Una ficha de inmueble sí pide correo y sabe de qué propiedad se trata. */
const CAMPOS_FICHA: readonly CampoLead[] = ['nombre', 'email', 'telefono', 'mensaje', 'propiedad'];

describe('🔴 el defecto que motivó el módulo: no castigar por lo que no se preguntó (§189)', () => {
  it('un propietario que llena TODO lo que /publicar le pide sale de `D` y llega a `B`', () => {
    // Con el scorer viejo esto daba `cold` SIEMPRE — le faltaban 10 puntos de un campo que el
    // formulario NUNCA muestra. Ahora llega al techo que le permite su intención, que es lo justo.
    const r = puntuar({
      tipo: 'publicar_propiedad',
      camposOfrecidos: CAMPOS_PUBLICAR,
      camposLlenos: CAMPOS_PUBLICAR,
      presupuesto: 1_500_000_000,
    });
    expect(r.tier).toBe('B');
  });

  it('🎯 el techo lo fija la INTENCIÓN, no qué campos tenga el formulario', () => {
    // Ésta es la propiedad que arregla el defecto: pedir un campo MÁS no sube el techo, y no pedirlo
    // no lo baja. Quien pide visita llega a `A`; quien viene a publicar, a `B` — porque quiere menos,
    // no porque su formulario sea más corto.
    expect(techoAlcanzable('agenda_visita', CAMPOS_FICHA)).toBe('A');
    expect(techoAlcanzable('publicar_propiedad', CAMPOS_PUBLICAR)).toBe('B');
    expect(techoAlcanzable('publicar_propiedad', [...CAMPOS_PUBLICAR, 'email'])).toBe('B');
    expect(techoAlcanzable('publicar_propiedad', ['nombre'])).toBe('B');
  });

  it('un campo que el formulario NO ofrecía no resta, aunque venga vacío', () => {
    const sinCorreo = puntuar({ tipo: 'publicar_propiedad', camposOfrecidos: CAMPOS_PUBLICAR, camposLlenos: CAMPOS_PUBLICAR, presupuesto: 2e9 });
    const conCorreo = puntuar({
      tipo: 'publicar_propiedad',
      camposOfrecidos: [...CAMPOS_PUBLICAR, 'email'],
      camposLlenos: [...CAMPOS_PUBLICAR, 'email'],
      presupuesto: 2e9,
    });
    // Llenarlo TODO en ambos casos mide lo mismo: la calidad no depende de cuantas casillas haya.
    expect(conCorreo.score).toBe(sinCorreo.score);
    expect(conCorreo.tier).toBe(sinCorreo.tier);
  });

  it('y un campo ofrecido que se deja VACÍO sí resta: eso sí lo decidió el interesado', () => {
    const lleno = puntuar({ tipo: 'contacto_propiedad', camposOfrecidos: CAMPOS_FICHA, camposLlenos: CAMPOS_FICHA });
    const vacio = puntuar({ tipo: 'contacto_propiedad', camposOfrecidos: CAMPOS_FICHA, camposLlenos: ['nombre'] });
    expect(vacio.score).toBeLessThan(lleno.score);
  });
});

describe('⏱️ el puntaje es REPRODUCIBLE: no depende del reloj', () => {
  it('el mismo lead puntúa igual las veces que se recalcule', () => {
    const e = { tipo: 'contacto_propiedad', camposOfrecidos: CAMPOS_FICHA, camposLlenos: CAMPOS_FICHA };
    const a = puntuar(e);
    const b = puntuar(e);
    expect(a).toEqual(b);
    // Y no hay ninguna entrada de tiempo en el contrato: si la hubiera, un backfill nunca cuadraría.
    expect(Object.keys(e)).not.toContain('ahora');
  });
});

describe('la proporción es lo que compara, no el absoluto', () => {
  it('un formulario corto lleno vale más que uno largo a medias', () => {
    const cortoLleno = puntuar({ tipo: 'contacto_propiedad', camposOfrecidos: ['nombre', 'telefono'], camposLlenos: ['nombre', 'telefono'] });
    const largoAMedias = puntuar({ tipo: 'contacto_propiedad', camposOfrecidos: CAMPOS_FICHA, camposLlenos: ['nombre'] });
    expect(cortoLleno.score).toBeGreaterThan(largoAMedias.score);
  });

  it('devuelve las DOS mitades por separado, para poder explicar el numero', () => {
    const r = puntuar({ tipo: 'publicar_propiedad', camposOfrecidos: CAMPOS_PUBLICAR, camposLlenos: [] });
    expect(r.intencion).toBeGreaterThan(0);
    expect(r.relleno).toBe(0);
  });
});

describe('tiers y bordes', () => {
  it('los cortes son los declarados', () => {
    expect(tierDe(0.8)).toBe('A');
    expect(tierDe(0.79)).toBe('B');
    expect(tierDe(0.6)).toBe('B');
    expect(tierDe(0.4)).toBe('C');
    expect(tierDe(0.39)).toBe('D');
  });

  it('un tipo desconocido cae en la intención mínima, pero el ESFUERZO sigue contando', () => {
    // No es el peor lead posible: no sabemos qué quiere, pero contestó todo lo que se le pidió.
    // Que el desconocimiento NUESTRO lo hundiera a D sería castigarle por nuestra falta de datos.
    const lleno = puntuar({ tipo: 'inventado_xyz', camposOfrecidos: ['nombre'], camposLlenos: ['nombre'] });
    expect(lleno.intencion).toBeCloseTo(5 / 30, 2);
    expect(lleno.tier).toBe('C');
    // Sin intención conocida Y sin esfuerzo, entonces sí: D.
    expect(puntuar({ tipo: 'inventado_xyz', camposOfrecidos: ['nombre'], camposLlenos: [] }).tier).toBe('D');
  });

  it('un lead que no llenó NADA de lo ofrecido cae a D', () => {
    expect(puntuar({ tipo: 'publicar_propiedad', camposOfrecidos: CAMPOS_PUBLICAR, camposLlenos: [] }).tier).toBe('D');
  });

  it('un campo lleno que el formulario no ofrecía se IGNORA (no infla el puntaje)', () => {
    const r = puntuar({ tipo: 'publicar_propiedad', camposOfrecidos: ['nombre'], camposLlenos: ['nombre', 'email', 'cita'] });
    expect(r.relleno).toBe(1); // lleno lo unico que se le ofrecio; lo demas ni suma ni resta
  });
});
