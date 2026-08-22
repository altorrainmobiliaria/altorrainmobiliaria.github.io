/*
 * CONTRATO DE SUBIDA DE MEDIA — la mitad PURA del endpoint que escribe en R2 (§107).
 *
 * Vive aparte del endpoint a propósito: aquí está todo lo que se puede probar sin un Worker, sin red y
 * sin bucket, que es justo donde se cometen los errores caros (una clave mal formada no falla, solo
 * sirve un 404 meses después). El endpoint se queda con lo que no se puede probar sin runtime: leer el
 * cuerpo, hablar con el binding y devolver la respuesta.
 *
 * REGLA QUE MANDA AQUÍ ([[L-45]] y el contrato de `media.ts`): lo que se guarda en `Propiedad.imagenes[]`
 * son CLAVES de R2 (`props/INM-…/1.webp`), nunca URLs ni rutas absolutas. La semilla del propio
 * proyecto ya viola ese contrato escribiendo URLs de un tercero, y el error no se ve —las fotos cargan
 * igual— hasta el día que se apunta la base a nuestro bucket y esas siguen sirviéndose desde fuera.
 * Por eso `claveValida()` existe y por eso el endpoint devuelve la CLAVE, no la URL.
 */

/**
 * Solo WebP. El contrato del proyecto es «derivados WebP fijos; NUNCA servir originales»: convertir en
 * el navegador (que es donde ya hay un canvas) sale gratis, mientras hacerlo en el edge costaría CPU
 * por subida y una dependencia de imagen dentro del Worker.
 */
export const TIPOS_ACEPTADOS = ['image/webp'] as const;

/**
 * Tope por archivo. Un derivado WebP de una foto de inmueble bien exportada ronda los 150-400 KB; 3 MB
 * deja margen de sobra para una panorámica y sigue siendo un techo que evita que un despiste llene el
 * bucket. El límite duro del cuerpo en Workers es mucho mayor, así que este es NUESTRO criterio y por
 * eso se declara.
 */
export const TOPE_BYTES = 3 * 1024 * 1024;

/** Máximo de imágenes por inmueble. El mockup del wizard promete «15+ fotos»; 30 es holgura, no límite real. */
export const TOPE_IMAGENES = 30;

/** `INM-YYYYMM-XXXX`. El MISMO formato que exige `buscar-ficha`, para que la clave y la ruta no diverjan. */
const ID_PROPIEDAD = /^INM-\d{6}-\d{4}$/i;

export type MotivoRechazoSubida =
  | 'id-invalido'
  | 'tipo-no-aceptado'
  | 'vacio'
  | 'demasiado-grande'
  | 'indice-invalido';

export type ResultadoClave =
  | { ok: true; clave: string }
  | { ok: false; motivo: MotivoRechazoSubida };

/**
 * Compone la clave de R2 de una imagen.
 *
 * `props/INM-202608-0001/3.webp`. El índice va en el nombre en vez de un aleatorio o una fecha por dos
 * razones: (a) subir dos veces la misma posición SOBRESCRIBE en lugar de dejar basura huérfana en el
 * bucket, que nadie limpia nunca; (b) la clave es predecible, así que se puede reconstruir sin
 * consultar nada. Nada del nombre original del archivo entra aquí: los nombres que pone una cámara o
 * un móvil traen espacios, tildes y a veces el nombre de la persona.
 */
export function claveImagen(idPropiedad: string, indice: number): ResultadoClave {
  const id = (idPropiedad ?? '').trim().toUpperCase();
  if (!ID_PROPIEDAD.test(id)) return { ok: false, motivo: 'id-invalido' };
  if (!Number.isInteger(indice) || indice < 1 || indice > TOPE_IMAGENES) {
    return { ok: false, motivo: 'indice-invalido' };
  }
  return { ok: true, clave: `props/${id}/${indice}.webp` };
}

/**
 * ¿Es una CLAVE de R2 y no una URL disfrazada?
 *
 * Lo usa el endpoint y lo usará el formulario antes de guardar. `urlMedia()` deja pasar sin tocar todo
 * lo que empiece por `http` o por `/`, así que una URL ajena guardada en `imagenes[]` funciona
 * perfectamente… sirviendo la foto desde el servidor de otro, para siempre y sin avisar.
 */
export function claveValida(clave: string): boolean {
  const c = (clave ?? '').trim();
  if (!c) return false;
  if (/^(https?:)?\/\//i.test(c)) return false; // URL absoluta o protocol-relative
  if (c.startsWith('/')) return false; // ruta del sitio, no clave
  if (c.includes('..')) return false; // travesía
  return /^props\/INM-\d{6}-\d{4}\/\d{1,2}\.webp$/i.test(c);
}

/** Valida el cuerpo recibido ANTES de tocar el bucket. */
export function validarCuerpo(tipo: string | null, bytes: number): { ok: true } | { ok: false; motivo: MotivoRechazoSubida } {
  const t = (tipo ?? '').split(';')[0].trim().toLowerCase();
  if (!(TIPOS_ACEPTADOS as readonly string[]).includes(t)) return { ok: false, motivo: 'tipo-no-aceptado' };
  if (bytes <= 0) return { ok: false, motivo: 'vacio' };
  if (bytes > TOPE_BYTES) return { ok: false, motivo: 'demasiado-grande' };
  return { ok: true };
}

/** Mensaje para una persona. Un 400 sin explicación en un panel interno es una llamada de teléfono. */
export function explicarRechazo(motivo: MotivoRechazoSubida): string {
  switch (motivo) {
    case 'id-invalido':
      return 'El código del inmueble no tiene el formato esperado (INM-AAAAMM-NNNN).';
    case 'tipo-no-aceptado':
      return 'Solo se aceptan imágenes WebP. El panel las convierte antes de subirlas.';
    case 'vacio':
      return 'El archivo llegó vacío.';
    case 'demasiado-grande':
      return `La imagen supera el tope de ${Math.round(TOPE_BYTES / (1024 * 1024))} MB.`;
    case 'indice-invalido':
      return `La posición de la foto debe estar entre 1 y ${TOPE_IMAGENES}.`;
  }
}
