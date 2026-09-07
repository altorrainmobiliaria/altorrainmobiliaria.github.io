/*
 * EL DOMINIO DEL JOURNAL — lo que se puede probar sin abrir un navegador (TODO-48).
 *
 * Aquí vive lo que decide QUÉ se ve y CÓMO se dice: el orden del índice, la etiqueta de cada
 * categoría, la fecha en español y —lo importante— el tiempo de lectura, que se CALCULA y nunca se
 * escribe. La página se queda con pintar.
 */
/**
 * LOS CUATRO CAJONES DEL JOURNAL — y viven AQUÍ, no en `content.config.ts`, aunque sea el esquema
 * quien los valide. Cuáles son las categorías de una publicación es una decisión editorial: es
 * dominio, no configuración del framework. Puestas allá, este módulo tendría que importar
 * `astro:content` para conocerlas, y `astro:content` solo existe dentro del build de Astro — con lo
 * que las pruebas de este archivo dejarían de poder correr. *La dependencia va del framework al
 * dominio, nunca al revés.*
 *
 * Cerrado a propósito: las etiquetas libres paren páginas casi vacías que nadie mantiene. Si algún
 * día hace falta un quinto cajón, se decide aquí, no se improvisa en un frontmatter.
 */
export const CATEGORIAS = ['ley-y-contratos', 'mercado', 'guias-de-zona', 'corta-estancia'] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/** Etiqueta visible de cada cajón. El slug es para la URL y el `data-`; esto es para el ojo. */
export const ETIQUETA: Record<Categoria, string> = {
  'ley-y-contratos': 'Ley y contratos',
  mercado: 'Mercado',
  'guias-de-zona': 'Guías de zona',
  'corta-estancia': 'Corta estancia',
};

/**
 * PALABRAS POR MINUTO. 200 es el consenso para lectura en pantalla de texto corrido en español;
 * se deja explícito y con nombre para que el número no parezca sacado del aire.
 */
export const PPM = 200;

/**
 * Cuenta las palabras REALES del markdown: sin la sintaxis, que no se lee. Un `## Título` son dos
 * caracteres de almohadilla que nadie pronuncia, y una URL de 90 caracteres dentro de un enlace no
 * es una palabra de lectura — contarlos infla el tiempo y lo vuelve tan poco fiable como escribirlo
 * a mano, que es justo lo que esto viene a evitar.
 */
export function palabras(markdown: string): number {
  const limpio = markdown
    // bloques de código enteros: no son prosa
    .replace(/```[\s\S]*?```/g, ' ')
    // imágenes: no se leen — y VAN PRIMERO, antes que los enlaces. Una imagen es un enlace con `!`
    // delante, así que la regla de enlaces se la traga entera y deja el texto alternativo suelto,
    // que entonces se cuenta como prosa. Lo específico antes que lo general, o lo general gana.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    // enlaces: se queda el texto visible, se va la URL
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // marcas de sintaxis que no se pronuncian
    .replace(/[#>*_`~|-]/g, ' ');
  const trozos = limpio.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
  return trozos.length;
}

/**
 * Minutos de lectura, mínimo 1. Se redondea hacia arriba porque prometer «0 min» o «2 min» para
 * algo que toma dos y medio molesta más que sobrar: el lector perdona que sobre, no que falte.
 */
export function minutosDeLectura(markdown: string): number {
  return Math.max(1, Math.ceil(palabras(markdown) / PPM));
}

/** «6 min de lectura» — la frase completa, para no repetirla en tres plantillas. */
export const tiempoDeLectura = (markdown: string): string =>
  `${minutosDeLectura(markdown)} min de lectura`;

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * «25 de agosto de 2026». Se formatea a mano y en UTC a propósito: `toLocaleDateString` depende de
 * los datos de idioma del runtime, y este build corre en workerd, no en el portátil de nadie. Una
 * fecha que cambia de forma según dónde se construya es un diff fantasma esperando a aparecer.
 */
export function fechaLarga(fecha: Date): string {
  return `${fecha.getUTCDate()} de ${MESES[fecha.getUTCMonth()]} de ${fecha.getUTCFullYear()}`;
}

/** `2026-08-25` — la que entiende `<time datetime>` y el JSON-LD. */
export const fechaISO = (fecha: Date): string => fecha.toISOString().slice(0, 10);

/** Forma mínima de un artículo para ordenarlo. Deja fuera todo lo que aquí no se mira. */
export interface Ordenable {
  data: { fecha: Date; destacado: boolean };
}

/** Del más reciente al más viejo. El empate se rompe por destacado, y si no, se queda como estaba. */
export function porFecha<T extends Ordenable>(articulos: readonly T[]): T[] {
  return [...articulos].sort((a, b) => {
    const d = b.data.fecha.getTime() - a.data.fecha.getTime();
    return d !== 0 ? d : Number(b.data.destacado) - Number(a.data.destacado);
  });
}

/**
 * El destacado y el resto. Si nadie está marcado, manda el más reciente: el índice SIEMPRE tiene
 * una portada, porque una lista de iguales no es una portada editorial — es un archivo.
 */
export function destacadoYResto<T extends Ordenable>(articulos: readonly T[]): {
  destacado: T | null;
  resto: T[];
} {
  const orden = porFecha(articulos);
  if (orden.length === 0) return { destacado: null, resto: [] };
  const i = orden.findIndex((a) => a.data.destacado);
  const k = i >= 0 ? i : 0;
  return { destacado: orden[k], resto: orden.filter((_, j) => j !== k) };
}

/** Cuántos hay en cada cajón — incluidos los cajones vacíos, que también se muestran. */
export function conteoPorCategoria(
  articulos: readonly { data: { categoria: Categoria } }[],
): Record<Categoria, number> {
  const conteo = Object.fromEntries(CATEGORIAS.map((c) => [c, 0])) as Record<Categoria, number>;
  for (const a of articulos) conteo[a.data.categoria] += 1;
  return conteo;
}

/**
 * Los «seguir leyendo» de un artículo: primero los de su misma categoría, después el resto por
 * fecha. Nunca se recomienda a sí mismo, y devuelve como mucho `cuantos`.
 */
export function relacionados<T extends Ordenable & { id: string; data: { categoria: Categoria } }>(
  actual: T,
  todos: readonly T[],
  cuantos = 2,
): T[] {
  const otros = porFecha(todos.filter((a) => a.id !== actual.id));
  const mismos = otros.filter((a) => a.data.categoria === actual.data.categoria);
  const demas = otros.filter((a) => a.data.categoria !== actual.data.categoria);
  return [...mismos, ...demas].slice(0, cuantos);
}
