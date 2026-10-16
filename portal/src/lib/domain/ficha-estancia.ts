/*
 * FICHA DE UN ALOJAMIENTO (§329) — lo que el diseño «ALTORRA Estancias» pinta sobre un inmueble REAL.
 *
 * 🔴 POR QUÉ EXISTE. El mockup aprobado es el detalle de UNA casa: galería, «Lo que ofrece este
 * lugar» y un panel con el precio por noche, las fechas y el total. Vivió en /estancias sobre una casa
 * que no existía, y §327 lo retiró de allí porque un precio por noche es publicidad de hospedaje y la
 * Ley 300/1996 le exige un RNT que esa casa no podía tener. Su sitio es la ficha de CADA alojamiento,
 * que sí lo tiene. Este módulo decide QUÉ se enseña; la plantilla solo decide cómo.
 *
 * ⚖️ FAIL-CLOSED POR CONSTRUCCIÓN. Sin número de RNT exhibible devuelve `null` y la plantilla no
 * pinta el panel: el gate del build no ve las páginas SSR (§317.5), así que el invariante «ningún
 * precio por noche sin su RNT» tiene que vivir aquí, en el dominio, con pruebas. La ruta ya da 404 a un
 * alojamiento sin RNT (`publicable`); esto es la segunda llave, no la primera.
 *
 * ⛔ LO QUE EL MOCKUP TRAE Y AQUÍ NO ENTRA, porque no hay dato que lo respalde (§60.3: un bloque sin
 * dato se omite, y [[L-29]]: inventar es peor que omitir): el aforo de huéspedes y las camas (el
 * modelo no los tiene), el anfitrión con nombre y «Superanfitrión», las barras por categoría y las
 * citas de reseñas (el agregado solo guarda promedio y recuento), «Cancelación gratuita hasta 5 días
 * antes» (no hay política modelada) y la línea «Servicio ALTORRA» (ver `desgloseEstadia`: ese cargo no
 * existe y su ausencia es la decisión).
 */

import type { Propiedad } from './propiedades';
import type { COP } from './shared';
import { numeroRnt, textoRnt } from './rnt';
import { pesos } from './dinero';
import { aseoDe, desgloseEstadia, fechasSugeridas, lineasDesglose, type DesgloseEscrito } from './reserva';
import { avisoEstado, ciudadDe, type AvisoEstado } from './ficha';
import { notaVisible, textoNota } from './resenas';

export interface FichaEstancia {
  /** «Centro Histórico · Cartagena de Indias»: la línea pequeña sobre el título del mockup. */
  lugar: string;
  /** «4,9 · 12 reseñas», o `null` por debajo del mínimo de reseñas (`notaVisible`). */
  nota: string | null;
  /** «4,9» — la cifra sola, junto al precio. Sale de la MISMA nota: nunca hay una sin la otra. */
  notaCorta: string | null;
  /**
   * «12 reseñas» — el recuento solo. La cabecera del mockup pinta la cifra en negrita y el recuento
   * aparte, más pequeño y en gris; el texto es el mismo de `nota`, partido, no reescrito.
   */
  notaRecuento: string | null;
  /** «RNT 100001». Nunca falta: sin número exhibible no hay ficha de alojamiento (`null` arriba). */
  rnt: string;
  /** El precio por noche escrito y en número (el navegador recalcula con él), o `null` si no hay. */
  noche: { valor: COP; texto: string } | null;
  /** Lo que se cobra de limpieza, una vez por estadía; `0` si no se cobra (y entonces no hay línea). */
  aseo: COP;
  /** Las fechas con las que abre el panel. */
  sugeridas: { llegada: string; salida: string };
  /** El desglose de ESAS fechas, ya escrito; `null` sin precio por noche. */
  desglose: DesgloseEscrito | null;
  /** Reservado, cerrado o inactivo: el panel lo dice en vez de pedir fechas. */
  aviso: AvisoEstado | null;
}

/** Un precio por noche que se puede multiplicar: número finito y mayor que cero. */
function nocheValida(v: unknown): v is COP {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

/**
 * Lo que pinta la ficha de un alojamiento, o `null` si la propiedad no es un alojamiento con su RNT.
 *
 * `hoy` en `YYYY-MM-DD`: lo pasa quien llama porque la fecha es justo donde están los casos límite, y
 * una función que lee el reloj por su cuenta no se puede probar.
 */
export function fichaEstancia(p: Propiedad, hoy: string): FichaEstancia | null {
  if (p.operacion !== 'alojamiento') return null;
  const numero = numeroRnt(p.rnt);
  if (numero === null) return null;

  const v = p.precio?.precioNoche;
  const noche = nocheValida(v) ? { valor: v, texto: pesos(v) } : null;
  const sugeridas = fechasSugeridas(hoy);
  const d = noche ? desgloseEstadia(p.precio, sugeridas.llegada, sugeridas.salida) : null;
  const nota = notaVisible(p.resenas);

  return {
    lugar: [p.geo?.barrio?.trim(), ciudadDe(p)].filter(Boolean).join(' · '),
    nota: nota ? textoNota(nota) : null,
    // La cifra es el trozo de `textoNota` antes del «·», no un segundo formateo: si mañana la nota se
    // escribe con otra precisión, el panel y la cabecera no pueden decir dos números distintos.
    notaCorta: nota ? textoNota(nota).split(' · ')[0] : null,
    notaRecuento: nota ? textoNota(nota).split(' · ').slice(1).join(' · ') || null : null,
    rnt: textoRnt(numero),
    noche,
    aseo: aseoDe(p.precio),
    sugeridas,
    desglose: d ? lineasDesglose(d) : null,
    aviso: avisoEstado(p),
  };
}
