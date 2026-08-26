/*
 * MIGAS DE PAN (BreadcrumbList) — un solo sitio donde se construyen.
 *
 * POR QUÉ NACE (§161). El mismo bloque de nueve líneas estaba copiado en OCHO páginas, y seis
 * páginas públicas —`/aliados`, `/comprar`, `/arrendar`, `/estancias`, `/publicar`, `/turismo`— y
 * las cuatro legales no tenían ninguna. Eso no se nota mirando el sitio: se nota en el resultado de
 * Google, donde unas páginas muestran su ruta («altorrainmobiliaria.co › Invertir») y otras enseñan
 * la URL cruda. Con el bloque copiado, «añadirlo donde falta» era copiarlo diez veces más.
 *
 * DECISIÓN: función pura, sin dependencias de Astro, para que se pueda probar sin montar una página.
 * La página le pasa el origen y los tramos; nada más.
 *
 * ⚠️ `item` SIEMPRE absoluto. Una URL relativa dentro del JSON-LD no rompe nada visible y Google la
 * descarta en silencio — el peor de los fallos, porque el schema sigue ahí pareciendo correcto. Por
 * eso `migaDe` lo construye a partir del origen en vez de aceptar la ruta ya formada.
 */

/** Un tramo de la ruta: lo que se ve y a dónde lleva (relativo al origen, con barra inicial). */
export interface Tramo {
  nombre: string;
  ruta: string;
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

/** El primer tramo es siempre el inicio, y su `item` es el origen pelado (sin barra final). */
const INICIO = 'Inicio';

/**
 * Construye el `BreadcrumbList` de una página.
 *
 * @param base   Origen absoluto, sin barra final (`https://altorrainmobiliaria.co`).
 * @param tramos Los tramos DESPUÉS del inicio, en orden. Vacío = solo el inicio, que no tiene
 *               sentido como miga: por eso `migaDe` con cero tramos devuelve `null` y la página no
 *               pinta nada. Una miga de un solo nivel es ruido para Google, no una ruta.
 */
export function migaDe(base: string, tramos: Tramo[]): BreadcrumbList | null {
  if (!tramos.length) return null;
  const origen = base.replace(/\/+$/, '');
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: INICIO, item: origen },
      ...tramos.map((t, i) => ({
        '@type': 'ListItem' as const,
        position: i + 2,
        name: t.nombre,
        item: origen + (t.ruta.startsWith('/') ? t.ruta : `/${t.ruta}`),
      })),
    ],
  };
}
