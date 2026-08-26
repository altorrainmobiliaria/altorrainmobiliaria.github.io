/*
 * DINERO — las primitivas que TODOS los módulos de plata comparten (§178).
 *
 * Existe porque estaban repartidas: **tres** `COP_FMT` idénticos (`ficha`, `alertas`, `liquidacion`),
 * **dos** `pesos()` con el mismo cuerpo y **dos** `IVA` con el mismo valor. Ninguna divergía todavía
 * —se comprobaron una a una— así que no había ningún fallo que arreglar. Lo que había era el
 * mecanismo para tenerlo: el día que la tarifa del IVA cambie, alguien va a editar la copia que
 * encuentre y la otra va a seguir facturando al 19 % sin decir nada.
 *
 * 🔴 Y lo que lo hacía peor que una simple duplicación: `liquidacion.ts` documentaba su `IVA` con
 * *«si cambia la tarifa, cambia aquí y solo aquí»*. El comentario era falso y, por serlo, ACTIVAMENTE
 * dañino — quien lo leyera cerraría la búsqueda justo antes de encontrar la otra copia. Un comentario
 * que promete unicidad es una promesa que alguien va a cumplir a medias.
 *
 * Se encontró barriendo símbolos exportados con el mismo nombre desde módulos distintos, que es la
 * clase de §176 (`ESTADOS_MANDATO` por duplicado). Ningún gate puede verlo: cada declaración es
 * legítima por separado y solo la coincidencia de NOMBRE delata que hablan de lo mismo.
 */

import type { COP } from './shared';

/**
 * Formato de moneda colombiana, sin decimales.
 *
 * Sin decimales a propósito: en inmuebles y cánones los céntimos no existen, y un `$ 2.500.000,00`
 * en un comprobante solo añade ruido a una cifra que ya es larga.
 */
const COP_FMT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Pesos, a secas. Sin sufijos: quien necesite «al mes» o «por noche» se lo añade (`sufijoPrecio`). */
export function pesos(v: COP): string {
  return COP_FMT.format(v);
}

/**
 * IVA general colombiano. **Parámetro, no verdad eterna** — y ahora sí con un solo dueño.
 *
 * Lo causan los honorarios de administración inmobiliaria (un servicio), NUNCA el canon: el
 * arrendamiento de vivienda urbana está excluido. Esa distinción vive en quien lo aplica
 * (`agenda.ts`, `liquidacion.ts`); aquí solo vive la tarifa.
 */
export const IVA = 0.19;
