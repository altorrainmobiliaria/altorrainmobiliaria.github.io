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
import { colaDeVerificacion, esperaSello, explicarReparo, reparosParaSellar } from '../lib/domain/verificacion';
import { aCsv, nombreExport, type Columna } from '../lib/domain/csv';
import { descargarTexto } from './descargar';
import { explicarSello, marcarVerificada } from './gestion-alta';
import { explicarProblema, precioDisplay, problemasParaPublicar } from '../lib/domain/catalogo';
import { formatoPrecio } from '../lib/domain/alertas';
import type { Propiedad } from '../lib/domain/propiedades';

/** Tope de la consulta. `limit()` es OBLIGATORIO: una query sin él es una cuota abierta. */
const TOPE = 50;

/**
 * Los documentos tal cual se leyeron, para poder abrirlos a editar sin volver a Firestore.
 *
 * Se guardan CRUDOS y no las filas ya formateadas: el formulario necesita el documento, y reconstruir
 * un documento desde su presentación es cómo se pierden los campos que la tabla no enseña.
 */
const cargados = new Map<string, Propiedad>();

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
  fila.className = 'gx-tr gx-tr--click';
  fila.dataset.inmId = f.id;
  fila.tabIndex = 0;
  fila.setAttribute('role', 'button');
  fila.setAttribute('aria-label', `Editar ${f.titulo}`);
  // Se AVISA en vez de editar en el sitio: el evento lo escucha la pantalla del alta, que es la única
  // que sabe pintar un inmueble. Dos formularios para lo mismo serían dos sitios donde divergir.
  const abrir = () => {
    const p = cargados.get(f.id);
    if (p) document.dispatchEvent(new CustomEvent('altorra:editar-inmueble', { detail: p }));
  };
  fila.addEventListener('click', abrir);
  fila.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrir();
    }
  });

  const idc = document.createElement('div');
  idc.className = 'gx-cli';
  const cod = document.createElement('span');
  cod.className = 'gx-cod';
  cod.textContent = f.id;
  const tit = document.createElement('span');
  tit.className = 'gx-cli__name';
  tit.textContent = f.titulo;
  // `appendChild` y no `append`: los tipos de Workers fusionan `Element.append(string)` del
  // HTMLRewriter con el del DOM y matan la sobrecarga con nodos ([[L-36]]).
  idc.appendChild(cod);
  idc.appendChild(tit);

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

  for (const n of [idc, celda(f.operacion, 'gx-muted'), celda(f.ubicacion, 'gx-muted gx-ell'), estado, vis]) {
    fila.appendChild(n);
  }
  return fila;
}

function mensaje(txt: string): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr gx-tr--msg';
  fila.appendChild(celda(txt, 'gx-muted'));
  return fila;
}

/** Monta el listado. Lo llama el panel al entrar en la sección «Inmuebles». */
// ─────────────────────────────────────────────────────────────────────────────
// COLA DE VERIFICACIÓN (§119) — se deriva de lo YA CARGADO, sin una sola lectura más
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pinta la cola a partir del mismo `Map` que llenó la lista.
 *
 * Cero lecturas extra: la cola es una VISTA de los inmuebles que ya están en memoria, no otra
 * consulta. Una segunda query sobre `propiedades` para enseñar un subconjunto de lo que ya tienes
 * delante es exactamente el gasto que el free-tier no perdona (§20 Blaze).
 */
function pintarCola(): void {
  const cuerpo = document.getElementById('gx-vf-lista');
  const resumen = document.getElementById('gx-vf-resumen');
  if (!cuerpo) return;

  const cola = colaDeVerificacion([...cargados.values()]);
  if (!cola.length) {
    cuerpo.replaceChildren(mensaje('Nada pendiente de verificar.'));
    if (resumen) resumen.textContent = '';
    return;
  }

  cuerpo.replaceChildren(
    ...cola.map((p) => {
      const listo = esperaSello(p);
      const fila = document.createElement('div');
      fila.className = 'gx-tr';

      const q = document.createElement('div');
      q.className = 'gx-cli gx-cli--apilada';
      q.appendChild(celda(p.id, 'gx-cod'));
      q.appendChild(celda(p.titulo ?? '—', 'gx-cli__name'));

      const motivo = listo
        ? celda('Lista para el sello.', 'gx-muted gx-wrap')
        : celda(reparosParaSellar(p).map(explicarReparo).join(' '), 'gx-muted gx-wrap');

      const accion = document.createElement('span');
      if (listo) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'alt-btn alt-btn--navy gx-btn-fila';
        btn.textContent = 'Verificar';
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Verificando…';
          const r = await marcarVerificada(p.id);
          if (r.ok) {
            // Se recarga la lista entera y no solo la fila: el sello cambia también la columna
            // «¿se ve?» y el resumen de arriba. Repintar media pantalla es como se queda una tabla
            // diciendo una cosa y la de al lado otra.
            void montarInmuebles();
            return;
          }
          btn.disabled = false;
          btn.textContent = 'Verificar';
          const caja = document.getElementById('gx-vf-msg');
          if (caja) caja.textContent = explicarSello(r);
        });
        accion.appendChild(btn);
      } else {
        accion.appendChild(celda('—', 'gx-muted'));
      }

      for (const n of [q, motivo, accion]) fila.appendChild(n);
      return fila;
    }),
  );

  if (resumen) {
    const listas = cola.filter(esperaSello).length;
    resumen.textContent = listas
      ? `${listas} lista(s) para sellar de ${cola.length} sin verificar`
      : `${cola.length} sin verificar, ninguna lista todavía`;
  }
}

/** Columnas del export de inmuebles. Lo que el dueño mira en una hoja, no el documento entero. */
const COLUMNAS_INMUEBLE: Columna<Propiedad>[] = [
  { titulo: 'Código', valor: (p) => p.id },
  { titulo: 'Título', valor: (p) => p.titulo },
  { titulo: 'Operación', valor: (p) => p.operacion },
  { titulo: 'Tipo', valor: (p) => p.tipo },
  { titulo: 'Estado', valor: (p) => p.estado },
  { titulo: 'Ciudad', valor: (p) => p.geo?.ciudad },
  { titulo: 'Barrio', valor: (p) => p.geo?.barrio },
  { titulo: 'Venta', valor: (p) => p.precio?.valorVenta },
  { titulo: 'Canon', valor: (p) => p.precio?.canon },
  { titulo: 'Noche', valor: (p) => p.precio?.precioNoche },
  { titulo: 'Área construida m2', valor: (p) => p.specs?.areaConstruidaM2 },
  { titulo: 'Habitaciones', valor: (p) => p.specs?.habitaciones },
  { titulo: 'Baños', valor: (p) => p.specs?.banos },
  { titulo: 'Fotos', valor: (p) => p.imagenes?.length ?? 0 },
  { titulo: 'Verificado', valor: (p) => (p.verificadoAltorra ? 'sí' : 'no') },
  { titulo: 'Verificado el', valor: (p) => p.verificadoEn?.slice(0, 10) },
  { titulo: 'Se ve en el portal', valor: (p) => (problemasParaPublicar(p).length ? 'no' : 'sí') },
  { titulo: 'Actualizado', valor: (p) => p.updatedAt?.slice(0, 10) },
];

/** Cablea el botón de export. Exporta lo CARGADO, y lo dice si está topado. */
export function montarExportInmuebles(): void {
  const btn = document.getElementById('gx-inm-export');
  btn?.addEventListener('click', () => {
    const filas = [...cargados.values()];
    if (!filas.length) return;
    descargarTexto(nombreExport('inmuebles'), aCsv(filas, COLUMNAS_INMUEBLE));
  });
}

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
      cargados.clear();
      pintarCola();
      cuerpo.replaceChildren(
        mensaje('Todavía no hay inmuebles. Usa «+ Nuevo inmueble» para dar de alta el primero.'),
      );
      return;
    }

    cargados.clear();
    const filas = snap.docs.map((d) => {
      const p = { ...(d.data() as object), id: d.id } as Propiedad;
      cargados.set(p.id, p);
      return filaInmueble(p);
    });
    cuerpo.replaceChildren(...filas.map(pintarFila));

    pintarCola();

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
