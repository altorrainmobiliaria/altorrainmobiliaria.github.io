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

/*
 * ══ DOS DERIVADAS, Y POR QUÉ HACÍA FALTA LA SEGUNDA (§304) ═════════════════════════════════════
 *
 * 🔴 LO QUE ESTABA ROTO. El proyecto adoptó «nunca servir originales» como **invariante verificable**
 * (adenda Gemini, `specs/R5-STACK-2026-07.md §ADOPTADO 4`) y lo cumplía a medias: el navegador
 * convertía a WebP y reescalaba a 1600 px, sí — pero ésa era la ÚNICA derivada, y el índice del
 * catálogo la usaba como tarjeta. O sea que una SERP de nueve resultados iba a servir hasta 27 MB de
 * imágenes, con el contrato de `CatalogoResumen.thumb` diciendo «key R2 del thumb (<150KB)» y
 * `media.ts` advirtiendo por escrito contra «servir el ORIGINAL pesado en vez del derivado».
 *
 * Nadie mentía: es que **no había de dónde sacar un thumb**. Un contrato que promete una talla que el
 * sistema no produce se cumple solo por casualidad, y aquí ni eso.
 *
 * 🎯 LA CLAVE DEL THUMB SE DERIVA, NO SE GUARDA. Podrían viajar las dos claves en el resumen; sería
 * más bytes en el shard y, peor, permitiría que discrepen. Derivándola de la de la foto, «el thumb de
 * esta foto» es imposible de equivocar — el mismo principio que el precio de obra nueva (§284.3):
 * lo que solo tiene sentido como resultado no se teclea.
 *
 * ⚠️ Y LA SUBIDA ES TODO-O-NADA. Una foto sin su thumb es una foto que la SERP servirá a tamaño
 * completo: exactamente el defecto que esto arregla, reaparecido en una sola tarjeta. El cliente sube
 * las dos o no cuenta la foto.
 */
export const VARIANTES = ['full', 'thumb'] as const;
export type VarianteImagen = (typeof VARIANTES)[number];

/**
 * Tope del THUMB. No es un número elegido aquí: `34-DOCTRINA-CODIGO` ya decía «thumbnail <150KB»
 * desde antes de que existiera un thumb. Ahora hay quien lo haga cumplir.
 */
export const TOPE_BYTES_THUMB = 150 * 1024;

/** El tope que aplica a cada variante. Un solo sitio donde mirarlo. */
export const topeDe = (v: VarianteImagen): number => (v === 'thumb' ? TOPE_BYTES_THUMB : TOPE_BYTES);

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
export function claveImagen(
  idPropiedad: string,
  indice: number,
  variante: VarianteImagen = 'full',
): ResultadoClave {
  const id = (idPropiedad ?? '').trim().toUpperCase();
  if (!ID_PROPIEDAD.test(id)) return { ok: false, motivo: 'id-invalido' };
  if (!Number.isInteger(indice) || indice < 1 || indice > TOPE_IMAGENES) {
    return { ok: false, motivo: 'indice-invalido' };
  }
  const sufijo = variante === 'thumb' ? '-thumb' : '';
  return { ok: true, clave: `props/${id}/${indice}${sufijo}.webp` };
}

/** La clave del THUMB de una foto, derivada de la suya. `props/…/3.webp` → `props/…/3-thumb.webp`. */
const RE_FULL = /^(props\/INM-\d{6}-\d{4}\/\d{1,2})\.webp$/i;

/**
 * DUEÑO ÚNICO de «¿cuál es el thumb de esta imagen?».
 *
 * ⚠️ Lo que NO es una clave de R2 sale INTACTO: las rutas del catálogo demo (`/assets/villa-pool.webp`)
 * y cualquier URL absoluta no tienen variante que derivar, y fabricarles un `-thumb` inventaría un
 * fichero que nadie subió — un 404 en cada tarjeta, servido con toda confianza. Es la misma tolerancia
 * que ya tiene `urlMedia()`, y por la misma razón: datos demo y reales conviven en la misma plantilla.
 */
export function claveThumb(clave: string): string {
  const c = (clave ?? '').trim();
  const m = RE_FULL.exec(c);
  return m ? `${m[1]}-thumb.webp` : c;
}

/** ¿Esta clave ES la del thumb? Lo usa la prueba del contrato: el índice no puede llevar otra cosa. */
export const esClaveThumb = (clave: string): boolean =>
  /^props\/INM-\d{6}-\d{4}\/\d{1,2}-thumb\.webp$/i.test((clave ?? '').trim());

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
  return /^props\/INM-\d{6}-\d{4}\/\d{1,2}(-thumb)?\.webp$/i.test(c);
}

/**
 * Valida el cuerpo recibido ANTES de tocar el bucket.
 *
 * El tope depende de la VARIANTE: 3 MB para la foto, 150 KB para el thumb. Sin esa diferencia, «subir
 * el thumb» y «subir la foto otra vez» son indistinguibles para el servidor, y el día que el cliente
 * se equivoque de blob el bucket guardará una foto de 1600 px bajo el nombre del thumb — con el
 * agravante de que TODO seguiría funcionando: la imagen carga, solo que pesa veinte veces más.
 */
export function validarCuerpo(
  tipo: string | null,
  bytes: number,
  variante: VarianteImagen = 'full',
): { ok: true } | { ok: false; motivo: MotivoRechazoSubida } {
  const t = (tipo ?? '').split(';')[0].trim().toLowerCase();
  if (!(TIPOS_ACEPTADOS as readonly string[]).includes(t)) return { ok: false, motivo: 'tipo-no-aceptado' };
  if (bytes <= 0) return { ok: false, motivo: 'vacio' };
  if (bytes > topeDe(variante)) return { ok: false, motivo: 'demasiado-grande' };
  return { ok: true };
}

/** Mensaje para una persona. Un 400 sin explicación en un panel interno es una llamada de teléfono. */
export function explicarRechazo(motivo: MotivoRechazoSubida, variante: VarianteImagen = 'full'): string {
  switch (motivo) {
    case 'id-invalido':
      return 'El código del inmueble no tiene el formato esperado (INM-AAAAMM-NNNN).';
    case 'tipo-no-aceptado':
      return 'Solo se aceptan imágenes WebP. El panel las convierte antes de subirlas.';
    case 'vacio':
      return 'El archivo llegó vacío.';
    case 'demasiado-grande':
      return variante === 'thumb'
        ? `La miniatura supera el tope de ${Math.round(TOPE_BYTES_THUMB / 1024)} KB. Es la que se pinta en los listados: si pesa más, el listado entero se arrastra.`
        : `La imagen supera el tope de ${Math.round(TOPE_BYTES / (1024 * 1024))} MB.`;
    case 'indice-invalido':
      return `La posición de la foto debe estar entre 1 y ${TOPE_IMAGENES}.`;
  }
}
