/*
 * EL ALOJAMIENTO QUE PIDE UNA SOLICITUD DE ESTANCIA (§329) — comprobado en el servidor.
 *
 * 🔴 POR QUÉ EXISTE. Hasta §327 toda solicitud de estancia salía del panel GENERAL de /estancias y el
 * documento lo decía («sin alojamiento elegido»). Desde la ficha de cada alojamiento el visitante
 * elige UNO, y el lead tiene que llegar diciendo cuál: si no, quien lo atiende llama a preguntar lo
 * que ya estaba elegido.
 *
 * 🎯 DEL NAVEGADOR SOLO VIAJA EL ID, nunca el precio. El total se calcula AQUÍ con el precio del
 * documento: un `POST` se fabrica desde la consola en diez segundos, y un total escrito por el cliente
 * llegaría al correo del equipo como si fuera nuestro.
 *
 * ⚖️ Y NUNCA SE PIERDE EL LEAD por esta comprobación: si el inmueble ya no está publicado se guarda
 * como consulta general (diciendo qué pidió), y si la base no responde se guarda el id marcado como
 * «sin comprobar». Lo único que se descarta es un id sin la forma canónica: eso no es una elección,
 * es basura, y un bot no puede colarle al equipo un «inmueble» que no existe.
 */

import type { DataClient } from './client';
import { ID_PROPIEDAD_RE } from './buscar-ficha';
import { esEsquemaLegacy, esPublicada } from '../domain/catalogo';
import { publicable } from '../domain/propiedades';
import { desgloseEstadia, type DesgloseEstadia } from '../domain/reserva';

export type AlojamientoPedido =
  /** Existe, está publicado, es un alojamiento con su RNT: el lead lo lleva con su total. */
  | { estado: 'ok'; id: string; titulo: string; desglose: DesgloseEstadia | null }
  /** Tiene la forma de un id nuestro pero no es un alojamiento publicado (vendido, retirado, borrador). */
  | { estado: 'no-publicado'; id: string }
  /** La base no respondió: no se puede afirmar ni negar. */
  | { estado: 'sin-comprobar'; id: string };

/**
 * `null` si no vino un id con forma canónica (`INM-YYYYMM-XXXX`): la solicitud sigue siendo la
 * consulta general de siempre.
 */
export async function comprobarAlojamiento(
  cliente: DataClient | undefined,
  raw: string,
  fechas: { llegada: string; salida: string },
): Promise<AlojamientoPedido | null> {
  const clave = raw.trim();
  if (!ID_PROPIEDAD_RE.test(clave)) return null;
  const id = clave.toUpperCase();
  if (!cliente) return { estado: 'sin-comprobar', id };

  const r = await cliente.propiedades.get(id);
  if (!r.ok) return r.reason === 'error' ? { estado: 'sin-comprobar', id } : { estado: 'no-publicado', id };

  // Los MISMOS predicados que la ficha (`buscarFicha` + `publicable`): si la ficha no lo enseñaría,
  // el lead no lo puede dar por elegido.
  const p = r.data;
  if (!esPublicada(p) || esEsquemaLegacy(p) || !publicable(p) || p.operacion !== 'alojamiento') {
    return { estado: 'no-publicado', id };
  }
  return {
    estado: 'ok',
    id,
    titulo: typeof p.titulo === 'string' ? p.titulo.trim().slice(0, 120) : '',
    desglose: desgloseEstadia(p.precio, fechas.llegada, fechas.salida),
  };
}
