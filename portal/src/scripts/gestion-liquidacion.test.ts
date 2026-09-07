/*
 * LA FRONTERA DEL PORCENTAJE — la prueba que faltaba y que costaba dinero (ADR §233).
 *
 * QUÉ PASÓ. `Contrato.honorariosPct` guarda lo que teclea una persona —el formulario pide
 * «Honorarios %» con marcador `10`— y su validador acepta hasta 100. `domain/liquidacion.ts` calcula
 * con una **fracción** y rechaza cualquier cosa mayor que 0.5; su propio comentario llama a ese
 * valor «el error de dedo que más caro sale aquí». Entre los dos extremos no había conversión, así
 * que **un contrato normal del 10 % no se podía liquidar**: la pantalla mostraba «honorarios fuera de
 * rango» en el paso 1.6 del runbook, que es literalmente el primer contrato real del dueño.
 *
 * Nadie lo veía porque cada lado, por separado, era correcto: el contrato validaba bien SU unidad y
 * la liquidación validaba bien LA SUYA. *Dos validadores correctos del mismo campo, y ninguno
 * comprobaba que hablaran de lo mismo.*
 *
 * El número contra el que se comprueba —$1.726.300— sale del mockup APROBADO de liquidación, no de
 * repetir aquí la aritmética del dominio: una prueba que recalcula lo que prueba no prueba nada.
 */
import { describe, expect, it } from 'vitest';
import { entradaDeLiquidacion } from './gestion-liquidacion';
import { liquidarPeriodo, problemasDeLiquidacion } from '../lib/domain/liquidacion';
import type { Contrato } from '../lib/domain/gestion';

/** El contrato del mockup: canon 2.000.000, administración 300.000 aparte, 10 % + IVA. */
const CONTRATO_DEL_MOCKUP = {
  id: 'CTO-1',
  expedienteId: 'EXP-1',
  tipo: 'arriendo',
  vertical: 'vivienda',
  estado: 'vigente',
  partes: {},
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
} as Contrato;

describe('el porcentaje del contrato llega al dominio como FRACCIÓN', () => {
  it('10 en el contrato se convierte en 0.10 para calcular', () => {
    expect(entradaDeLiquidacion(CONTRATO_DEL_MOCKUP, false).honorariosPct).toBe(0.1);
  });

  it('🔴 un contrato del 10 % SE PUEDE liquidar: antes salía «fuera de rango»', () => {
    expect(problemasDeLiquidacion(entradaDeLiquidacion(CONTRATO_DEL_MOCKUP, false))).toEqual([]);
  });

  it('las cifras coinciden con el mockup aprobado, peso por peso', () => {
    const l = liquidarPeriodo(entradaDeLiquidacion(CONTRATO_DEL_MOCKUP, false));
    expect(l.cobroAlArrendatario).toBe(2_300_000);
    expect(l.giroAPH).toBe(300_000);
    expect(l.honorarios).toBe(230_000);
    expect(l.ivaHonorarios).toBe(43_700);
    expect(l.retencionCanon).toBe(0);
    expect(l.giroAlPropietario).toBe(1_726_300);
  });

  it('cuadra: todo lo que sale iguala lo que se cobró, sin un peso suelto', () => {
    const l = liquidarPeriodo(entradaDeLiquidacion(CONTRATO_DEL_MOCKUP, false));
    const salidas = l.giroAlPropietario + l.giroAPH + l.honorarios + l.ivaHonorarios + l.retencionCanon;
    expect(salidas).toBe(l.cobroAlArrendatario);
  });

  it('un contrato sin honorarios pactados no inventa un 0 %: deja el default del dominio', () => {
    const sinPacto = { ...CONTRATO_DEL_MOCKUP, honorariosPct: undefined } as Contrato;
    expect(entradaDeLiquidacion(sinPacto, false).honorariosPct).toBeUndefined();
  });

  it('con retención, el canon la lleva y el giro baja: la conversión no la estropea', () => {
    const l = liquidarPeriodo(entradaDeLiquidacion(CONTRATO_DEL_MOCKUP, true));
    expect(l.retencionCanon).toBeGreaterThan(0);
    expect(l.giroAlPropietario).toBeLessThan(1_726_300);
  });
});
