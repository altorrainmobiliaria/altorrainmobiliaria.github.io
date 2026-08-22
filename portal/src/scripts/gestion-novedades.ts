/*
 * EXPEDIENTES Y NOVEDADES — la pantalla del back-office que faltaba (§118).
 *
 * El expediente es el agregado RAÍZ: contratos, pagos y novedades cuelgan de él por FK. Hasta este
 * módulo `crearContrato` exigía un `expedienteId` que no había forma de acuñar desde ninguna
 * pantalla — la puerta pedía una llave que nadie fabricaba.
 *
 * Las novedades son las PQRS del inquilino y del propietario, con su reloj de 48h. Igual que en la
 * cartera, el estado del plazo se RECALCULA al pintar con `estadoDeSla` y no se lee del documento:
 * el guardado quedó congelado al registrarse y el plazo corre con el reloj.
 *
 * ⚠️ La escritura NO pasa por aquí: `expedientes` y `novedades` nacen con `allow write: if false`
 * (§100) y las únicas puertas son las callables. Este módulo las LLAMA por HTTP —sin el SDK de
 * Functions, que `verify:data` prohíbe— igual que hace `gestion-contratos`.
 */

import { cargarAuth } from './auth';
import { accionDeSla, estadoDeSla } from '../lib/domain/agenda';
import {
  ESTADOS_EXPEDIENTE,
  ESTADOS_NOVEDAD,
  type EstadoNovedad,
  type Expediente,
  type Novedad,
} from '../lib/domain/gestion';
import { FIREBASE_PUBLICO } from '../lib/config/firebase-publico';

const TOPE = 50;
const REGION_FUNCTIONS = 'us-central1';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value.trim() ?? '';

function celda(txt: string, clase = ''): HTMLElement {
  const s = document.createElement('span');
  if (clase) s.className = clase;
  s.textContent = txt;
  return s;
}

function mensaje(txt: string): HTMLElement {
  const f = document.createElement('div');
  f.className = 'gx-tr gx-tr--msg';
  f.appendChild(celda(txt, 'gx-muted'));
  return f;
}

/** Celda de identificador: código arriba, descripción debajo. Mismo patrón que la cartera. */
function identificador(codigo: string, sub: string): HTMLElement {
  const q = document.createElement('div');
  q.className = 'gx-cli gx-cli--apilada';
  q.appendChild(celda(codigo, 'gx-cod'));
  q.appendChild(celda(sub, 'gx-cli__name'));
  return q;
}

async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

/**
 * Llama a una callable por HTTP plano.
 *
 * Sin `firebase/functions`: `verify:data` lo prohíbe en el portal y la excepción no se gana por una
 * comodidad de tres líneas. El contrato del protocolo callable es `{data: …}` → `{result: …}`.
 */
async function llamar(nombre: string, datos: unknown): Promise<{ ok: boolean; mensaje: string }> {
  let token: string | null = null;
  try {
    const { auth } = await cargarAuth();
    token = (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    token = null;
  }
  if (!token) return { ok: false, mensaje: 'Tu sesión caducó. Recarga la página y vuelve a entrar.' };

  const url = `https://${REGION_FUNCTIONS}-${FIREBASE_PUBLICO.projectId}.cloudfunctions.net/${nombre}`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: datos }),
    });
    const cuerpo = (await resp.json().catch(() => null)) as
      | { result?: { id?: string }; error?: { message?: string; details?: { mensajes?: string[] } } }
      | null;
    if (resp.ok && cuerpo?.result?.id) return { ok: true, mensaje: `Guardado como ${cuerpo.result.id}.` };
    // Los `mensajes` del invariante son la parte útil: sin ellos hay que adivinar cuál de los campos.
    const detalle = cuerpo?.error?.details?.mensajes;
    return { ok: false, mensaje: detalle?.length ? detalle.join(' ') : (cuerpo?.error?.message ?? 'No se pudo guardar.') };
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar. Revisa la conexión.' };
  }
}

/** Envuelve el ciclo botón-deshabilitado → llamada → aviso → recarga. Los tres formularios igual. */
function alEnviar(
  idForm: string,
  idBoton: string,
  idAviso: string,
  etiqueta: string,
  datos: () => { fn: string; payload: unknown },
  despues: () => void,
): void {
  const form = $<HTMLFormElement>(idForm);
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = $<HTMLButtonElement>(idBoton);
    const caja = $(idAviso);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando…';
    }
    const { fn, payload } = datos();
    const r = await llamar(fn, payload);
    if (caja) caja.textContent = r.mensaje;
    if (r.ok) {
      form.reset();
      despues();
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = etiqueta;
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPEDIENTES
// ─────────────────────────────────────────────────────────────────────────────

export async function montarExpedientes(): Promise<void> {
  const cuerpo = $('gx-ex-lista');
  if (!cuerpo) return;
  cuerpo.replaceChildren(mensaje('Cargando…'));
  try {
    const { db, mod } = await cargarFirestore();
    const q = mod.query(mod.collection(db, 'expedientes'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);
    if (snap.empty) {
      cuerpo.replaceChildren(mensaje('Todavía no hay expedientes. Abre el primero abajo.'));
      return;
    }
    cuerpo.replaceChildren(
      ...snap.docs.map((d) => {
        const e = { ...(d.data() as object), id: d.id } as Expediente;
        const fila = document.createElement('div');
        fila.className = 'gx-tr';
        const pill = document.createElement('span');
        pill.className = `gx-pill gx-pill--${e.estado === 'activo' ? 'navy' : 'gold'}`;
        pill.textContent = e.estado;
        const est = document.createElement('span');
        est.appendChild(pill);
        for (const n of [identificador(e.id, e.propiedadId || e.codigoLegacy || '—'), est, celda(e.notas ?? '—', 'gx-muted gx-wrap')]) {
          fila.appendChild(n);
        }
        return fila;
      }),
    );
  } catch (e) {
    cuerpo.replaceChildren(mensaje('No pudimos cargar los expedientes.'));
    console.error('[gestion] expedientes:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOVEDADES
// ─────────────────────────────────────────────────────────────────────────────

function pintarNovedad(n: Novedad, ahora: string): HTMLElement {
  const e = estadoDeSla(n, ahora);
  const fila = document.createElement('div');
  fila.className = 'gx-tr';

  const est = document.createElement('span');
  const pill = document.createElement('span');
  // Oro = pide algo de ti. Navy = está bajo control. Ni verde ni rojo: no son de la paleta.
  pill.className = `gx-pill gx-pill--${e.cerrada || !e.vencida ? 'navy' : 'gold'}`;
  pill.textContent = n.estado;
  est.appendChild(pill);

  for (const c of [
    identificador(n.id, `${n.tipo} · ${n.reportadoPor}`),
    celda(n.expedienteId, 'gx-muted'),
    est,
    celda(e.cerrada ? '—' : `${Math.round(e.horasRestantes)} h`, 'gx-muted'),
    celda(accionDeSla(e), 'gx-muted gx-wrap'),
  ]) {
    fila.appendChild(c);
  }
  return fila;
}

export async function montarNovedades(): Promise<void> {
  const cuerpo = $('gx-nv-lista');
  const resumen = $('gx-nv-resumen');
  if (!cuerpo) return;
  cuerpo.replaceChildren(mensaje('Cargando…'));
  try {
    const { db, mod } = await cargarFirestore();
    const q = mod.query(mod.collection(db, 'novedades'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);
    if (snap.empty) {
      cuerpo.replaceChildren(mensaje('No hay novedades registradas.'));
      if (resumen) resumen.textContent = '';
      return;
    }
    const ahora = new Date().toISOString();
    const novedades = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as Novedad);
    cuerpo.replaceChildren(...novedades.map((n) => pintarNovedad(n, ahora)));
    if (resumen) {
      const fuera = novedades.filter((n) => estadoDeSla(n, ahora).vencida).length;
      resumen.textContent = fuera ? `${fuera} fuera de plazo de ${novedades.length}` : `${novedades.length} en plazo`;
    }
  } catch (e) {
    cuerpo.replaceChildren(mensaje('No pudimos cargar las novedades.'));
    console.error('[gestion] novedades:', e);
  }
}

/**
 * Rellena los desplegables desde el dominio: la lista de estados tiene un solo dueño.
 *
 * Se castea a mano en vez de usar `$<HTMLSelectElement>`: los tipos de Cloudflare Workers fusionan
 * `Element.remove()` (que en el HTMLRewriter devuelve `Element`) con el del DOM, y eso deja a
 * `HTMLSelectElement` fuera del constraint `extends HTMLElement`. Misma familia que L-36.
 */
function poblarSelects(): void {
  const ex = document.getElementById('e-estado') as HTMLSelectElement | null;
  if (ex && !ex.options.length) {
    for (const v of ESTADOS_EXPEDIENTE) ex.add(new Option(v, v));
  }
  const nv = document.getElementById('r-estado') as HTMLSelectElement | null;
  if (nv && !nv.options.length) {
    for (const v of ESTADOS_NOVEDAD) nv.add(new Option(v, v));
    nv.value = 'HECHO';
  }
}

/** Cablea los tres formularios de la pantalla. */
export function montarFormularios(): void {
  poblarSelects();

  alEnviar(
    'gx-ex-form',
    'gx-ex-guardar',
    'gx-ex-msg',
    'Abrir expediente',
    () => ({
      fn: 'crearExpediente',
      payload: {
        propiedadId: val('e-propiedad') || undefined,
        codigoLegacy: val('e-legacy') || undefined,
        estado: val('e-estado') || 'activo',
        notas: val('e-notas') || undefined,
      },
    }),
    () => void montarExpedientes(),
  );

  alEnviar(
    'gx-nv-form',
    'gx-nv-guardar',
    'gx-nv-msg',
    'Registrar novedad',
    () => ({
      fn: 'crearNovedad',
      payload: {
        expedienteId: val('n-expediente'),
        reportadoPor: val('n-quien') || 'inquilino',
        tipo: val('n-tipo'),
        descripcion: val('n-descripcion'),
      },
    }),
    () => void montarNovedades(),
  );

  alEnviar(
    'gx-rv-form',
    'gx-rv-guardar',
    'gx-rv-msg',
    'Actualizar',
    () => ({
      fn: 'actualizarNovedad',
      payload: {
        id: val('r-id'),
        estado: (val('r-estado') || 'HECHO') as EstadoNovedad,
        resolucion: val('r-resolucion') || undefined,
      },
    }),
    () => void montarNovedades(),
  );
}
