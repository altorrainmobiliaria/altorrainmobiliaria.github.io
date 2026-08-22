/*
 * LISTADO DE INMUEBLES del panel (§110) — cerrar el círculo que dejó abierto el alta.
 *
 * POR QUÉ ESTE Y NO OTRA COSA: desde §108 el panel sabe CREAR un inmueble y no sabe enseñarlo. Quien
 * diera de alta una propiedad no volvería a verla desde el portal — tendría que abrir la consola de
 * Firebase para comprobar si quedó bien, para corregir un precio o para saber si está publicada. Un
 * CRUD que solo hace la C no es un CRUD, es un formulario.
 *
 * LA COLUMNA QUE JUSTIFICA LA PANTALLA es la última: **¿se ve?**. No sale de mirar el estado —eso
 * engaña, porque «disponible» con la foto rota tampoco aparece— sino de `problemasParaPublicar()`, que
 * pregunta a los MISMOS predicados que construyen el índice del catálogo. Así el listado del panel y
 * el listado público no pueden discrepar, y el operador ve de un vistazo cuáles están mudos y por qué.
 * Es la lección de §103 aplicada a la superficie donde más se nota.
 *
 * ⚠️ Como en la bandeja de leads: consulta acotada con `limit()`, SIN listeners, y si falla lo DICE en
 * vez de dejar datos de muestra que hagan creer que hay inventario donde no lo hay.
 */

import { cargarAuth } from './auth';
import { explicarProblema, precioDisplay, problemasParaPublicar } from '../lib/domain/catalogo';
import { formatoPrecio } from '../lib/domain/alertas';
import type { Propiedad } from '../lib/domain/propiedades';

/** Tope de la consulta. `limit()` es OBLIGATORIO: una query sin él es una cuota abierta. */
const TOPE = 50;

export interface FilaInmueble {
  id: string;
  titulo: string;
  operacion: string;
  ubicacion: string;
  precio: string;
  estado: string;
  /** `true` si HOY aparecería en el portal. */
  visible: boolean;
  /** Por qué no se ve, en lenguaje de persona. Vacío si se ve. */
  motivos: string[];
}

const OPERACION_LEGIBLE: Record<string, string> = {
  venta: 'Venta',
  arriendo: 'Arriendo',
  alojamiento: 'Por días',
};

const ESTADO_LEGIBLE: Record<string, string> = {
  borrador: 'Borrador',
  en_verificacion: 'En verificación',
  disponible: 'Disponible',
  reservado: 'Reservado',
  cerrado: 'Vendido/arrendado',
  inactivo: 'Inactivo',
};

/**
 * Documento → fila de la tabla. PURA, para poder probar la parte que engaña.
 *
 * Lo delicado no es el formato: es que `visible` NO se deduzca del estado. Un «disponible» sin foto
 * tampoco sale, y enseñarlo como publicado sería mentirle al operador justo en la columna que va a
 * mirar para decidir si su trabajo está hecho.
 */
export function filaInmueble(p: Propiedad): FilaInmueble {
  const problemas = problemasParaPublicar(p);
  const valor = precioDisplay(p);
  return {
    id: p.id,
    titulo: p.titulo || 'Sin título',
    operacion: OPERACION_LEGIBLE[p.operacion] ?? p.operacion ?? '—',
    ubicacion: [p.geo?.barrio, p.geo?.ciudad].filter(Boolean).join(', ') || '—',
    precio: valor != null ? formatoPrecio(valor, p.operacion) : '—',
    estado: ESTADO_LEGIBLE[p.estado] ?? p.estado ?? '—',
    visible: problemas.length === 0,
    motivos: problemas.map(explicarProblema),
  };
}

/** Cuántos de la lista NO se ven. Lo que el operador quiere saber sin contar filas. */
export function cuentaInvisibles(filas: FilaInmueble[]): number {
  return filas.filter((f) => !f.visible).length;
}

async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

function celda(texto: string, clase = ''): HTMLElement {
  const s = document.createElement('span');
  if (clase) s.className = clase;
  s.textContent = texto;
  return s;
}

function pintarFila(f: FilaInmueble): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr';
  fila.dataset.inmId = f.id;

  const idc = document.createElement('div');
  idc.className = 'gx-cli';
  const cod = document.createElement('span');
  cod.className = 'gx-cod';
  cod.textContent = f.id;
  const tit = document.createElement('span');
  tit.className = 'gx-cli__name';
  tit.textContent = f.titulo;
  idc.append(cod, tit);

  const estado = document.createElement('span');
  const pill = document.createElement('span');
  // Sin verde ni rojo (paleta): oro = pide atención, navy = en reposo.
  pill.className = `gx-pill gx-pill--${f.visible ? 'navy' : 'gold'}`;
  pill.textContent = f.estado;
  estado.appendChild(pill);

  const vis = document.createElement('span');
  vis.className = 'gx-vis';
  if (f.visible) {
    vis.appendChild(celda('En el portal', 'gx-muted'));
  } else {
    vis.appendChild(celda('No se ve', 'gx-vis__no'));
    // El PORQUÉ va en el título del elemento: la fila no puede crecer, pero la respuesta tiene que
    // estar a un hover de distancia y no en otra pantalla.
    vis.title = f.motivos.join(' · ');
  }

  fila.append(idc, celda(f.operacion, 'gx-muted'), celda(f.ubicacion, 'gx-muted gx-ell'), estado, vis);
  return fila;
}

function mensaje(txt: string): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr gx-tr--msg';
  fila.appendChild(celda(txt, 'gx-muted'));
  return fila;
}

/** Monta el listado. Lo llama el panel al entrar en la sección «Inmuebles». */
export async function montarInmuebles(): Promise<void> {
  const cuerpo = document.getElementById('gx-inm-cuerpo');
  const resumen = document.getElementById('gx-inm-resumen');
  if (!cuerpo) return;
  cuerpo.replaceChildren(mensaje('Cargando inmuebles…'));
  if (resumen) resumen.textContent = '';

  try {
    const { db, mod } = await cargarFirestore();
    // `updatedAt` y no `createdAt`: lo último que se TOCÓ es lo que se está trabajando.
    const q = mod.query(mod.collection(db, 'propiedades'), mod.orderBy('updatedAt', 'desc'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);

    if (snap.empty) {
      cuerpo.replaceChildren(
        mensaje('Todavía no hay inmuebles. Usa «+ Nuevo inmueble» para dar de alta el primero.'),
      );
      return;
    }

    const filas = snap.docs.map((d) => filaInmueble({ ...(d.data() as object), id: d.id } as Propiedad));
    cuerpo.replaceChildren(...filas.map(pintarFila));

    if (resumen) {
      const invisibles = cuentaInvisibles(filas);
      const tope = snap.size >= TOPE ? `${TOPE}+` : String(filas.length);
      resumen.textContent = invisibles
        ? `${tope} inmuebles · ${invisibles} no se ven en el portal (pasa el ratón por encima para saber por qué)`
        : `${tope} inmuebles · todos visibles en el portal`;
    }
  } catch (e) {
    cuerpo.replaceChildren(
      mensaje('No pudimos cargar los inmuebles. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    console.error('[gestion] inmuebles:', e);
  }
}
