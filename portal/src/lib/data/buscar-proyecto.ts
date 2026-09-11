/*
 * BÚSQUEDA del PROYECTO que pinta una ficha de obra nueva (§307).
 *
 * Hermano de `buscar-ficha.ts` y con sus mismas reglas, que no son de estilo:
 *
 * · **No se puede consultar Firestore por un campo.** El gate `verify:data` prohíbe queries (una sin
 *   acotar es la forma más rápida de tirar el free-tier), así que `/proyecto/torre-marea` NO se
 *   resuelve preguntando «dame el del slug X». Se resuelve por el ÍNDICE, que desde §301 lleva los
 *   proyectos —con su `clase: 'proyecto'`— dentro del shard de VENTA.
 *
 * · **Un solo shard, no tres.** Un proyecto se vende: `proyectoAResumen` lo mete SIEMPRE en `venta`.
 *   Recorrer los tres sería pagar dos lecturas por cada visita para buscar donde por construcción no
 *   puede estar. Si algún día una obra nueva se arrienda, esto se entera por su prueba.
 *
 * · **`no-encontrada` y «existe pero no se publica» se ven IGUAL desde fuera** ([[L-20]]): si un
 *   borrador diera un error distinto, cualquiera podría sondear qué proyectos tenemos sin firmar.
 *
 * · **`error` NO se disfraza de 404.** Un 404 se cachea; un 404 nacido de un hipo de red esconde el
 *   proyecto durante todo el TTL, mucho después de que la red se recupere.
 */

import type { DataClient } from './client';
import type { Proyecto } from '../domain/proyectos';
import { puedePublicarseProyecto } from '../domain/proyectos';
import { claseDe } from '../domain/catalogo';

/** Id canónico de proyecto: `PRY-YYYYMM-XXXX`. Namespace propio — un proyecto no es un `INM-…` (§270). */
export const ID_PROYECTO_RE = /^PRY-\d{6}-\d{4}$/i;

export type ResultadoProyecto =
  | { estado: 'ok'; p: Proyecto }
  | { estado: 'no-encontrada' }
  | { estado: 'error' };

/**
 * Resuelve el parámetro de la URL —id canónico o slug— y devuelve el proyecto PUBLICABLE.
 *
 * 🔴 EL GATE DE PUBLICACIÓN VA EN EL DOMINIO, no solo en las Rules. Es la misma razón que en
 * `buscar-ficha.ts`: las Rules del portal filtran por estado, pero el ruleset VIVO del proyecto sigue
 * siendo el del legacy. Y con un id canónico este camino se salta el índice —que sí filtra— y va
 * directo al documento. Sin esta línea, un proyecto SIN LICENCIA se publicaría entero: renders,
 * precios «desde», sala de ventas… y encima indexable. Que es exactamente lo que §270 encontró
 * servido en la portada y §284 convirtió en regla.
 *
 * Se reutiliza `puedePublicarseProyecto`, el MISMO predicado que usan el índice y el JSON-LD: tres
 * lectores que discrepen sobre qué está publicado es el bug siguiente ([[L-45]]).
 */
export async function buscarProyecto(cliente: DataClient, parametro: string): Promise<ResultadoProyecto> {
  const clave = (parametro ?? '').trim();
  if (!clave) return { estado: 'no-encontrada' };

  let id = clave;
  if (ID_PROYECTO_RE.test(clave)) {
    // Los ids de Firestore distinguen mayúsculas y el nuestro va siempre en mayúscula; se acepta
    // cualquier caja para que `/proyecto/pry-202608-0001` no acabe en un 404 absurdo.
    id = clave.toUpperCase();
  } else {
    const r = await cliente.catalogo.get('venta');
    if (!r.ok) return { estado: 'error' }; // sin índice no se puede afirmar que no exista
    const hit = r.data.items.find(
      (it) => claseDe(it) === 'proyecto' && (it.slug ?? '').toLowerCase() === clave.toLowerCase(),
    );
    if (!hit) return { estado: 'no-encontrada' };
    id = hit.id;
  }

  const doc = await cliente.proyectos.get(id);
  if (!doc.ok) return { estado: doc.reason === 'error' ? 'error' : 'no-encontrada' };
  if (!puedePublicarseProyecto(doc.data)) return { estado: 'no-encontrada' };

  return { estado: 'ok', p: doc.data };
}
