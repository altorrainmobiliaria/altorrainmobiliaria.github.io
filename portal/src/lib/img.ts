/*
 * Imágenes responsive de `/assets` — dueño ÚNICO del `srcset` del portal.
 *
 * ⚠️ HALLAZGO MEDIDO 2026-08-20 — LEE ESTO ANTES DE "OPTIMIZAR" LAS FOTOS:
 * Se probó poner `srcset` a las 7 fotos del portal y se MIDIÓ el resultado. **Empeora**: desktop
 * +63% y móvil +21% de bytes. La causa no es el enfoque, son los DATOS DEMO: hoy 7 fotos se
 * reutilizan en 66 slots de tamaños dispares (un hero de 1265px y una card de 300px comparten
 * archivo), así que el navegador acaba bajando 2-3 variantes de la MISMA foto en vez de una sola.
 * La fragmentación cuesta más de lo que ahorra el tamaño. Por eso las fotos NO llevan srcset aún.
 *
 * ✅ CUÁNDO REACTIVARLO: en el cutover al catálogo real (TODO-22/§60), cuando cada propiedad tenga
 * SU foto y cada foto se use en 1-2 tamaños. Ahí el srcset es ganancia limpia. Regenera las
 * variantes y registra cada archivo abajo.
 *
 * ❌ Lo que NO funciona (medido, no lo repitas): recomprimir los WebP actuales no da nada — a
 * fidelidad equivalente (~40 dB PSNR) el peso queda igual; y AVIF pesa MÁS (518 KB vs 438 KB)
 * porque partimos de un WebP ya lossy. La única palanca real es el TAMAÑO servido.
 *
 * Contrato ADITIVO (§3.2): si un archivo no está registrado, `srcsetDe()` devuelve `undefined`,
 * Astro omite el atributo y el `<img>` se comporta EXACTAMENTE igual que antes.
 */

/** Ancho REAL del original + variantes que existen en disco (`<nombre>-<w>w.webp`). */
const FOTOS: Record<string, { orig: number; variantes: number[] }> = {
  // El emblema SÍ gana y sin fragmentación: se pinta siempre a ~30px (header, footer, gestión) y
  // nunca grande, así que solo baja la de 96w — 8 KB en vez de los 33 KB del original (−76%).
  'altorra-emblema': { orig: 248, variantes: [96, 160] },
};

/** `srcset` de una imagen de `/assets`, o `undefined` si no tiene variantes registradas. */
export function srcsetDe(src: string | undefined): string | undefined {
  const m = /^\/assets\/([a-z0-9-]+)\.webp$/i.exec(src ?? '');
  if (!m) return undefined;
  const foto = FOTOS[m[1]];
  if (!foto) return undefined;
  const tramos = foto.variantes.map((w) => `/assets/${m[1]}-${w}w.webp ${w}w`);
  tramos.push(`${src} ${foto.orig}w`);
  return tramos.join(', ');
}

/** `sizes` por tipo de hueco. Un `sizes` mentiroso hace elegir de más (peso) o de menos (borroso). */
export const SIZES = {
  /** Emblema de header/footer/gestión: se pinta a 29-32px. */
  logo: '32px',
} as const;
