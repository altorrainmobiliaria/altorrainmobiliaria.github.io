/*
 * VENTAS — el pipeline de compraventa en el panel (Ola 2 · GESTIÓN v2, §151;
 * mockup `ALTORRA Venta.dc.html`).
 *
 * ESTA PANTALLA NO EXISTE PARA CELEBRAR VENTAS: EXISTE PARA ENSEÑAR CUÁL SE VA A CAER. Por eso la
 * lista NO se ordena por etapa —eso lo cuenta cualquier tablero— sino por lo que hay que atender
 * hoy: primero lo escriturado sin registrar, después lo que le faltan soportes, y al final lo que va
 * bien. Un kanban de siete columnas se vería bonito con veinte ventas y vacío con tres, no cabría en
 * un portátil, y sobre todo ordenaría por la dimensión que menos importa.
 *
 * ⚖️ Y el aviso que manda: en `escritura` la pantalla GRITA. Es el único punto del proceso donde todo
 * parece terminado y no lo está —la propiedad se transfiere con el REGISTRO, art. 756 C.C.— y si el
 * sistema calla ahí, calla en el peor sitio.
 *
 * La escritura pasa SIEMPRE por `crearVenta`/`moverVenta`: `ventas` nace con `allow write: if false`.
 * Este módulo conduce la conversación; no decide nada.
 */

import { cargarAuth } from './auth';
import { llamarCallable as llamar } from './callable';
import {
  avisosDe,
  ETAPAS,
  NOMBRE_ETAPA,
  posicion,
  problemasAlMover,
  QUE_ES,
  textoDeAviso,
  vendida,
  type Etapa,
  type Venta,
} from '../lib/domain/venta';
import { NOMBRE_DOCUMENTO, vigente, type Documento, type TipoDocumento } from '../lib/domain/documentos';

/** Tope de las consultas. `limit()` es obligatorio: sin él es una cuota abierta. */
const TOPE = 200;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const cargado: { ventas: Venta[]; documentos: Documento[] } = { ventas: [], documentos: [] };

async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

function celda(txt: string, clase = ''): HTMLElement {
  const s = document.createElement('span');
  if (clase) s.className = clase;
  s.textContent = txt;
  return s;
}

function mensaje(txt: string): HTMLElement {
  const p = document.createElement('p');
  p.className = 'gx-vacio';
  p.textContent = txt;
  return p;
}

const pesos = (n?: number): string =>
  typeof n === 'number' ? `$${n.toLocaleString('es-CO')}` : '';

/** Documentos vigentes del expediente de una venta. */
const documentosDe = (v: Venta) =>
  cargado.documentos.filter((d) => d.expedienteId === v.expedienteId && vigente(d));

/**
 * Cuánto URGE una venta. Número alto = mírala primero.
 *
 * Es una función y no un `sort` con tres condiciones enredadas porque el ORDEN de esta lista es la
 * decisión de producto entera: cambiarlo es cambiar qué ve el dueño al abrir la pantalla.
 */
export function urgencia(avisos: readonly string[], etapa: Etapa): number {
  if (avisos.includes('escriturada-sin-registrar')) return 3;
  if (avisos.some((a) => a.startsWith('faltan-soportes:'))) return 2;
  if (avisos.length > 0) return 1;
  // Lo cerrado va al fondo: ya no hay nada que hacer con ello.
  return etapa === 'registro' ? -1 : 0;
}

/* ─── La lista (mockup 1a) ───────────────────────────────────────────────────────────────────── */

export async function montarVentas(): Promise<void> {
  const lista = $('gx-vta-lista');
  if (!lista) return;
  lista.replaceChildren(mensaje('Cargando…'));

  try {
    const { db, mod } = await cargarFirestore();
    const [vs, ds] = await Promise.all([
      mod.getDocs(mod.query(mod.collection(db, 'ventas'), mod.limit(TOPE))),
      mod.getDocs(mod.query(mod.collection(db, 'documentos'), mod.limit(TOPE))),
    ]);
    cargado.ventas = vs.docs.map((d) => d.data() as Venta);
    cargado.documentos = ds.docs.map((d) => d.data() as Documento);
  } catch (e) {
    // FALLA RUIDOSO: una lista vacía porque la consulta falló diría que no hay nada que atender.
    lista.replaceChildren(
      mensaje('No pudimos cargar las ventas. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    console.error('[gestion] ventas:', e);
    return;
  }

  const conAvisos = cargado.ventas.map((v) => {
    const avisos = avisosDe(v, documentosDe(v));
    return { v, avisos, urg: urgencia(avisos, v.etapa) };
  });
  conAvisos.sort((a, b) => b.urg - a.urg || (a.v.updatedAt < b.v.updatedAt ? 1 : -1));

  const set = (id: string, n: number) => {
    const el = $(id);
    if (el) el.textContent = String(n);
  };
  set('gx-vta-kpi-riesgo', conAvisos.filter((x) => x.avisos.includes('escriturada-sin-registrar')).length);
  set('gx-vta-kpi-soportes', conAvisos.filter((x) => x.avisos.some((a) => a.startsWith('faltan-soportes:'))).length);
  set('gx-vta-kpi-abiertas', cargado.ventas.filter((v) => !vendida(v)).length);

  lista.replaceChildren(
    ...(conAvisos.length
      ? conAvisos.map((x) => fila(x.v, x.avisos))
      : [mensaje('Todavía no hay ventas abiertas. Cuando abras la primera, aparecerá aquí.')]),
  );
}

function fila(v: Venta, avisos: readonly string[]): HTMLElement {
  const f = document.createElement('div');
  f.className = avisos.includes('escriturada-sin-registrar') ? 'gx-tr gx-vta-alerta' : 'gx-tr';

  const quien = document.createElement('div');
  quien.className = 'gx-cli gx-cli--apilada';
  quien.appendChild(celda(`${v.id} · ${v.compradorNombre}`, 'gx-cod'));
  const detalle = [v.propiedadId, pesos(v.precioAcordado ?? v.precioOfrecido)].filter(Boolean).join(' · ');
  quien.appendChild(celda(detalle, 'gx-cli__name'));
  f.appendChild(quien);

  f.appendChild(celda(NOMBRE_ETAPA[v.etapa], 'gx-cod'));
  f.appendChild(
    celda(
      avisos.length
        ? avisos.map((a) => textoDeAviso(a, (t) => NOMBRE_DOCUMENTO[t])).join(' ')
        : 'Sin novedades.',
      avisos.length ? '' : 'gx-muted',
    ),
  );

  const ver = document.createElement('button');
  ver.type = 'button';
  ver.className = 'gx-link gx-link--btn';
  ver.textContent = 'Ver';
  ver.addEventListener('click', () => abrirVenta(v.id));
  f.appendChild(ver);

  return f;
}

/* ─── La venta por dentro (mockup 2a) ────────────────────────────────────────────────────────── */

export function abrirVenta(id: string): void {
  const panel = $('gx-vta-detalle');
  const cuerpo = $('gx-vta-det-escalera');
  const v = cargado.ventas.find((x) => x.id === id);
  if (!panel || !cuerpo || !v) return;

  const titulo = $('gx-vta-det-titulo');
  if (titulo) titulo.textContent = `${v.id} · ${v.compradorNombre}`;
  const resumen = $('gx-vta-det-resumen');
  if (resumen) {
    resumen.textContent = [
      v.propiedadId,
      v.precioAcordado ? `acordado ${pesos(v.precioAcordado)}` : 'sin precio acordado',
      `expediente ${v.expedienteId}`,
      v.folioMatricula ? `matrícula ${v.folioMatricula}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  cuerpo.replaceChildren(...ETAPAS.map((e) => peldano(e, v)));

  const hist = $('gx-vta-det-historial');
  if (hist) {
    const filas = [...v.historial].reverse().map((c) => {
      const f = document.createElement('div');
      f.className = 'gx-doc-bit__fila';
      f.appendChild(
        celda(c.de ? `${NOMBRE_ETAPA[c.de]} → ${NOMBRE_ETAPA[c.a]}` : `Abierta en ${NOMBRE_ETAPA[c.a]}`, 'gx-cod'),
      );
      f.appendChild(celda(c.cuando.slice(0, 10), 'gx-muted'));
      f.appendChild(celda(c.motivo ?? '', 'gx-muted'));
      return f;
    });
    hist.replaceChildren(...(filas.length ? filas : [mensaje('Sin movimientos.')]));
  }

  pintarAcciones(v);
  panel.removeAttribute('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Un peldaño de la escalera: cumplido, actual o pendiente. */
function peldano(e: Etapa, v: Venta): HTMLElement {
  const actual = e === v.etapa;
  const cumplido = posicion(e) < posicion(v.etapa);

  const p = document.createElement('div');
  p.className = `gx-vta-paso${actual ? ' is-on' : ''}${cumplido ? ' is-hecho' : ''}`;

  const marca = document.createElement('span');
  marca.className = 'gx-vta-paso__n';
  marca.textContent = cumplido ? '✓' : String(posicion(e) + 1);
  p.appendChild(marca);

  const txt = document.createElement('div');
  const t = document.createElement('div');
  t.className = 'gx-vta-paso__t';
  t.textContent = NOMBRE_ETAPA[e];
  txt.appendChild(t);
  const d = document.createElement('div');
  d.className = 'gx-vta-paso__d';
  // Solo la etapa ACTUAL explica qué significa. Repetirlo en las siete convierte la escalera en un
  // muro de texto y esconde justo la línea que hay que leer.
  d.textContent = actual ? QUE_ES[e] : '';
  txt.appendChild(d);
  p.appendChild(txt);

  return p;
}

/* ─── Moverla (mockup 3a) ────────────────────────────────────────────────────────────────────── */

function pintarAcciones(v: Venta): void {
  const caja = $('gx-vta-det-acciones');
  const msg = $('gx-vta-det-msg');
  if (!caja) return;
  if (msg) msg.textContent = '';

  if (vendida(v)) {
    caja.replaceChildren(mensaje('Registrada. Aquí ya no hay nada que mover.'));
    return;
  }
  if (document.body.dataset.puedeEditar === 'false') {
    caja.replaceChildren(mensaje('Tu rol puede consultar las ventas, no moverlas.'));
    return;
  }

  // Se ofrecen SOLO los destinos que el dominio acepta. Un botón que la puerta va a rechazar enseña
  // a la gente que el sistema está roto — la restricción se ve antes de pulsar, no después.
  const destinos = ETAPAS.filter((e) => problemasAlMover(v.etapa, e).length === 0);
  const atras = ETAPAS.filter((e) => posicion(e) < posicion(v.etapa));

  const botones = destinos.map((e) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'alt-btn alt-btn--navy gx-btn-fila';
    b.textContent = `Pasar a ${NOMBRE_ETAPA[e]}`;
    b.addEventListener('click', () => void mover(v, e));
    return b;
  });

  if (atras.length > 0) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gx-link gx-link--btn gx-muted';
    b.textContent = 'Devolver a una etapa anterior';
    b.addEventListener('click', () => void devolver(v, atras));
    botones.push(b);
  }

  caja.replaceChildren(...botones);
}

async function mover(v: Venta, destino: Etapa, motivo?: string): Promise<void> {
  const msg = $('gx-vta-det-msg');
  const avisar = (t: string) => {
    if (msg) msg.textContent = t;
  };

  const datos: Record<string, unknown> = { id: v.id, etapa: destino, _version: v._version };
  if (motivo) datos.motivo = motivo;

  /*
   * 🔴 EL FOLIO SE PIDE AQUÍ, ANTES DE LLAMAR. El servidor lo exige igual —es donde está la frontera—
   * pero preguntarlo antes evita el viaje perdido y, sobre todo, DICE POR QUÉ: ese número es el
   * registro, y sin él «registrada» sería una casilla marcada.
   */
  if (destino === 'registro' && !v.folioMatricula) {
    const folio = window.prompt(
      'Número de matrícula inmobiliaria del folio en la ORIP.\nSin él no se marca como registrada: ese número ES el registro.',
    );
    if (!folio?.trim()) return;
    datos.folioMatricula = folio.trim();
  }

  avisar('Moviendo…');
  const r = await llamar('moverVenta', datos);
  if (!r.ok) {
    avisar(r.mensaje);
    return;
  }
  avisar('');
  await montarVentas();
  abrirVenta(v.id);
}

async function devolver(v: Venta, atras: readonly Etapa[]): Promise<void> {
  const opciones = atras.map((e, i) => `${i + 1}. ${NOMBRE_ETAPA[e]}`).join('\n');
  const elegido = window.prompt(`¿A qué etapa se devuelve?\n${opciones}`);
  const n = Number(elegido);
  if (!Number.isInteger(n) || n < 1 || n > atras.length) return;

  // Se pide el MOTIVO, no un «¿seguro?». Un «sí» no dice nada en seis meses; «el banco negó el
  // crédito» sí. El servidor rechaza el retroceso sin motivo, así que esto no es cortesía.
  const motivo = window.prompt('¿Por qué se devuelve? Queda escrito en el historial.');
  if (!motivo?.trim()) return;

  await mover(v, atras[n - 1], motivo.trim());
}

/* ─── Abrir una venta nueva ──────────────────────────────────────────────────────────────────── */

export function montarFormularioVenta(): void {
  const form = $<HTMLFormElement>('gx-vta-form');
  if (!form) return;

  $('gx-vta-det-cerrar')?.addEventListener('click', () => {
    $('gx-vta-detalle')?.setAttribute('hidden', '');
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const msg = $('gx-vta-msg');
    const avisar = (t: string) => {
      if (msg) msg.textContent = t;
    };
    const val = (id: string) => ($<HTMLInputElement>(id)?.value ?? '').trim();
    const precio = Number(val('v-precio').replace(/[^\d]/g, ''));

    avisar('Abriendo…');
    const r = await llamar('crearVenta', {
      expedienteId: val('v-expediente'),
      propiedadId: val('v-propiedad'),
      compradorNombre: val('v-comprador'),
      ...(precio > 0 ? { precioOfrecido: precio } : {}),
    });
    if (!r.ok) {
      avisar(r.mensaje);
      return;
    }
    avisar('Venta abierta.');
    form.reset();
    await montarVentas();
  });
}

/** Se exporta para las pruebas: los tipos de documento que sostienen cada etapa, ya legibles. */
export const nombreSoporte = (t: TipoDocumento): string => NOMBRE_DOCUMENTO[t];
