/*
 * El ORDEN de la cola de ventas (§241). La propia función lo dice en su comentario: *"el ORDEN de
 * esta lista es la decisión de producto entera"* — y hasta hoy no tenía una sola prueba. No es
 * deuda de calidad: es la clase de fallo que no rompe nada y que el dueño ve todos los días. Si
 * alguien reordena estos `if`, la pantalla sigue compilando, sigue pintando, y le pone delante lo
 * que menos importa.
 */
import { describe, expect, it } from 'vitest';
import { urgencia } from './gestion-ventas';

describe('urgencia de una venta', () => {
  it('escriturada y sin registrar es lo más urgente que existe', () => {
    // Hasta el registro la propiedad NO ha cambiado de dueño (Ley 1579 de 2012): por eso 3.
    expect(urgencia(['escriturada-sin-registrar'], 'escritura')).toBe(3);
  });

  it('y gana aunque venga acompañada de otros avisos', () => {
    expect(urgencia(['faltan-soportes:promesa-compraventa', 'escriturada-sin-registrar'], 'escritura')).toBe(3);
  });

  it('faltar soportes va por encima de un aviso cualquiera', () => {
    expect(urgencia(['faltan-soportes:certificado-tradicion'], 'promesa')).toBe(2);
    expect(urgencia(['sin-precio-acordado'], 'promesa')).toBe(1);
  });

  it('una venta ya registrada y sin pendientes se va al fondo', () => {
    expect(urgencia([], 'registro')).toBe(-1);
  });

  it('🔴 pero si le falta el folio NO se va al fondo: sube por encima de lo neutro', () => {
    /*
     * El caso que justifica esta prueba. `registro` es la ÚLTIMA etapa, así que la regla del fondo
     * podría tragarse una venta registrada a la que le falta su matrícula inmobiliaria — un
     * expediente incompleto escondido debajo de todo. No pasa, porque el aviso la rescata antes;
     * pero eso depende del ORDEN de los `if`, que es justo lo que aquí queda fijado.
     */
    expect(urgencia(['registrada-sin-folio'], 'registro')).toBe(1);
    expect(urgencia(['registrada-sin-folio'], 'registro')).toBeGreaterThan(urgencia([], 'registro'));
  });

  it('lo que va en curso y sin avisos es neutro, ni arriba ni al fondo', () => {
    expect(urgencia([], 'interes')).toBe(0);
    expect(urgencia([], 'promesa')).toBe(0);
  });

  it('el fondo es SOLO para lo cerrado, no para lo que empieza', () => {
    expect(urgencia([], 'interes')).toBeGreaterThan(urgencia([], 'registro'));
  });
});
