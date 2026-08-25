/*
 * COLECCIONES DE CONTENIDO — hoy solo el Journal (TODO-48 · VISIÓN §5).
 *
 * POR QUÉ UNA COLECCIÓN Y NO IMPORTAR LOS `.md` A MANO, como hacen las páginas legales: porque el
 * esquema de aquí abajo es un GATE. La regla editorial del Journal —«un artículo sin fuentes no se
 * publica»— no se sostiene con buena voluntad; se sostiene porque `fuentes` es obligatoria y con al
 * menos una entrada, así que un artículo sin fuentes ROMPE EL BUILD. Lo mismo con la categoría: es
 * un enum cerrado de cuatro, y no hay forma de inventarse una quinta sin tocar este archivo y
 * pensarlo. *Una regla que solo vive en un comentario es una sugerencia.*
 *
 * ⚠️ LO QUE NO ESTÁ AQUÍ, A PROPÓSITO: el tiempo de lectura. No es un campo del frontmatter porque
 * un campo se escribe a mano, y a mano se escribe cualquier cosa — que es exactamente cómo la home
 * acabó anunciando cuatro artículos con «8 min de lectura» que no existían (§138.3). Se CALCULA de
 * las palabras del cuerpo, en `lib/content/journal.ts`.
 *
 * Las páginas legales (`src/content/legal/*.md`) siguen importándose directamente: son una por
 * página, no se listan ni se filtran, y no ganarían nada con una colección.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
/* Los cuatro cajones NO se declaran aquí: son decisión editorial, o sea dominio. Este archivo los
   importa para validarlos, y no al revés — si vivieran aquí, el módulo de dominio tendría que
   importar `astro:content`, que solo existe dentro del build, y sus pruebas dejarían de correr. */
import { CATEGORIAS } from './lib/content/journal';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    titulo: z.string().max(110),
    /** Bajada de la tarjeta y `<meta name="description">`. Google trunca cerca de 160. */
    resumen: z.string().max(300),
    categoria: z.enum(CATEGORIAS),
    /** Fecha REAL de publicación. La usa el orden del índice y el JSON-LD. */
    fecha: z.coerce.date(),
    /** Solo si el texto se revisó de verdad; se muestra como «última revisión». */
    actualizado: z.coerce.date().optional(),
    /** Portada: ruta de un asset que EXISTE en `public/assets` (lo vigila `verify:enlaces`). */
    portada: z.string().startsWith('/assets/'),
    portadaAlt: z.string().min(8),
    /**
     * La respuesta corta, en una o dos frases. Es el bloque «En corto» del artículo y lo que un
     * motor de respuestas puede citar entero sin tener que resumir por su cuenta — que es el punto
     * del AEO: si no le damos la frase, se la inventa él.
     */
    enCorto: z.string().min(40).max(600),
    /**
     * LAS FUENTES. Obligatorias y al menos una: es la diferencia entre «confíe en nosotros» y
     * «compruébelo usted», y es lo único que hace defendible publicar sobre norma sin abogado.
     */
    fuentes: z
      .array(
        z.object({
          titulo: z.string(),
          entidad: z.string(),
          url: z.string().url(),
        }),
      )
      .min(1),
    /** Un solo destacado manda en el índice y en la home. Si hay varios, gana el más reciente. */
    destacado: z.boolean().default(false),
  }),
});

export const collections = { journal };
