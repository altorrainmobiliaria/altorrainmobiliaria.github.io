/*
 * Descarga de un archivo generado en el navegador (§119).
 *
 * Vive aparte de `csv.ts` a propósito: aquél es dominio puro y testeable en Node, éste toca el DOM y
 * la vida del objeto URL. Mezclarlos obligaría a simular el navegador para probar un escapado de
 * comas.
 */

/**
 * Ofrece `contenido` como descarga con el nombre dado.
 *
 * El `revokeObjectURL` no es cosmético: sin él, cada export deja el archivo entero retenido en
 * memoria hasta que se cierra la pestaña, y el panel es de los que se dejan abiertos todo el día.
 * Va después del clic porque revocarla antes cancela la descarga que se acaba de pedir.
 */
export function descargarTexto(nombre: string, contenido: string, mime = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
