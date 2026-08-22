/*
 * PANTALLA DE CONTRATOS — la agenda de lo que vence y el alta que la alimenta (§114).
 *
 * Cierra GESTIÓN v1 por donde importa: hasta ahora la agenda sabía CALCULAR qué vence (§112) y la
 * Cloud Function sabía GUARDAR un contrato con su gate legal (§113), pero nadie podía ver lo uno ni
 * usar lo otro. Dos piezas correctas y ninguna al alcance del dueño.
 *
 * LO QUE SE VE PRIMERO ES LA AGENDA, no la lista. La lista de contratos contesta «¿qué tengo?»; la
 * agenda contesta «¿qué se me está pasando?», que es la pregunta que hizo falta el módulo. Por eso lo
 * vencido va arriba y en oro.
 *
 * ⚠️ La escritura NO pasa por aquí: `contratos` nace con `allow write: if false` (§100) y la única
 * puerta es la callable `crearContrato`. Este módulo la LLAMA; no escribe Firestore.
 */

import { cargarAuth } from './auth';
import { accionDeMora, agenda, estadoDePago, type Hito, type Urgencia } from '../lib/domain/agenda';
import { explicarProblemaContrato, problemasDeContrato, type Contrato, type Pago } from '../lib/domain/gestion';
import { formatoPrecio } from '../lib/domain/alertas';
import { FIREBASE_PUBLICO } from '../lib/config/firebase-publico';

const TOPE = 50;
/** Ventana de la agenda. Cuatro meses cubre el aviso de renovación, que es el hito más lejano. */
const DIAS_AGENDA = 130;

/** Región de las Functions del portal. Tiene que coincidir con la del despliegue. */
const REGION_FUNCTIONS = 'us-central1';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value.trim() ?? '';

/** `YYYY-MM-DD` de hoy, en UTC — el mismo huso que usa toda la agenda. */
export function hoyISO(ahora: Date = new Date()): string {
  return ahora.toISOString().slice(0, 10);
}

/** Cómo se lee un plazo. «hace 3 días» pesa distinto que «en 3 días», y la lista tiene que notarlo. */
export function textoPlazo(dias: number): string {
  if (dias < -1) return `hace ${Math.abs(dias)} días`;
  if (dias === -1) return 'ayer';
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias <= 31) return `en ${dias} días`;
  const meses = Math.round(dias / 30);
  return `en ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

/** Oro = pide acción; navy = en reposo. La paleta no tiene rojo, y aquí no hace falta. */
export function tonoDeUrgencia(u: Urgencia): 'gold' | 'navy' {
  return u === 'vencido' || u === 'hoy' || u === 'semana' ? 'gold' : 'navy';
}

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
  const f = document.createElement('div');
  f.className = 'gx-tr gx-tr--msg';
  f.appendChild(celda(txt, 'gx-muted'));
  return f;
}

function pintarHito(h: Hito, nombre: string): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr';

  const q = document.createElement('div');
  q.className = 'gx-cli';
  const t = document.createElement('span');
  t.className = 'gx-cli__name';
  t.textContent = h.titulo;
  const d = document.createElement('span');
  d.className = 'gx-cod';
  d.textContent = nombre || h.contratoId;
  q.appendChild(d);
  q.appendChild(t);

  const cuando = document.createElement('span');
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${tonoDeUrgencia(h.urgencia)}`;
  pill.textContent = textoPlazo(h.dias);
  cuando.appendChild(pill);

  for (const n of [q, celda(h.fecha, 'gx-muted'), cuando, celda(h.detalle, 'gx-muted gx-wrap')]) {
    fila.appendChild(n);
  }
  return fila;
}

function pintarContrato(c: Contrato): HTMLElement {
  const fila = document.createElement('div');
  fila.className = 'gx-tr';
  const q = document.createElement('div');
  q.className = 'gx-cli';
  const cod = document.createElement('span');
  cod.className = 'gx-cod';
  cod.textContent = c.id;
  const nom = document.createElement('span');
  nom.className = 'gx-cli__name';
  nom.textContent = c.partes?.arrendatario?.nombre || c.partes?.propietario?.nombre || 'Sin partes';
  q.appendChild(cod);
  q.appendChild(nom);

  const estado = document.createElement('span');
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${c.estado === 'vigente' ? 'navy' : 'gold'}`;
  pill.textContent = c.estado;
  estado.appendChild(pill);

  for (const n of [
    q,
    celda(c.tipo === 'arriendo' ? 'Arriendo' : 'Administración', 'gx-muted'),
    celda(c.canon ? formatoPrecio(c.canon, 'arriendo') : '—', 'gx-muted'),
    estado,
    celda(`${(c.vigenciaInicio ?? '').slice(0, 10)} → ${(c.vigenciaFin ?? '').slice(0, 10)}`, 'gx-muted gx-ell'),
  ]) {
    fila.appendChild(n);
  }
  return fila;
}

/** Carga contratos, pinta la agenda y la lista. */
export async function montarContratos(): Promise<void> {
  const cuerpoAgenda = $('gx-ct-agenda');
  const cuerpoLista = $('gx-ct-lista');
  const resumen = $('gx-ct-resumen');
  if (!cuerpoAgenda || !cuerpoLista) return;

  cuerpoAgenda.replaceChildren(mensaje('Cargando…'));
  cuerpoLista.replaceChildren();

  try {
    const { db, mod } = await cargarFirestore();
    const q = mod.query(mod.collection(db, 'contratos'), mod.orderBy('vigenciaFin', 'asc'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);

    if (snap.empty) {
      cuerpoAgenda.replaceChildren(mensaje('Todavía no hay contratos registrados. Usa «+ Nuevo contrato».'));
      if (resumen) resumen.textContent = '';
      return;
    }

    const contratos = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as Contrato);
    const nombres = new Map(
      contratos.map((c) => [c.id, c.partes?.arrendatario?.nombre || c.partes?.propietario?.nombre || c.id]),
    );

    const hoy = hoyISO();
    const hitos = agenda(contratos, hoy, DIAS_AGENDA);
    cuerpoAgenda.replaceChildren(
      ...(hitos.length ? hitos.map((h) => pintarHito(h, nombres.get(h.contratoId) ?? '')) : [mensaje('Nada vence en los próximos meses.')]),
    );
    cuerpoLista.replaceChildren(...contratos.map(pintarContrato));

    if (resumen) {
      const urgentes = hitos.filter((h) => tonoDeUrgencia(h.urgencia) === 'gold').length;
      resumen.textContent = urgentes
        ? `${contratos.length} contratos · ${urgentes} cosa(s) que atender esta semana o ya vencidas`
        : `${contratos.length} contratos · nada urgente`;
    }
  } catch (e) {
    cuerpoAgenda.replaceChildren(
      mensaje('No pudimos cargar los contratos. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    console.error('[gestion] contratos:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CARTERA — los pagos con su mora, y qué toca hacer con cada uno (§117)
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTO: Record<string, string> = {
  canon_inquilino: 'Canon',
  payout_propietario: 'Giro al propietario',
  honorarios: 'Honorarios',
  servicios_publicos: 'Servicios públicos',
};

/**
 * Fila de la cartera. El estado se RECALCULA aquí con `estadoDePago`, no se lee del documento.
 *
 * El campo `estado` guardado quedó congelado en el instante del registro; la mora, en cambio, crece
 * con el calendario. Enseñar el guardado sería decir «pendiente» de algo que lleva veinte días
 * vencido — exactamente el tipo de dato que parece correcto y ya no lo es.
 */
function pintarPago(p: Pago, hoy: string): HTMLElement {
  const d = estadoDePago(p, hoy);
  const fila = document.createElement('div');
  fila.className = 'gx-tr';

  const q = document.createElement('div');
  q.className = 'gx-cli gx-cli--apilada';
  const cod = document.createElement('span');
  cod.className = 'gx-cod';
  cod.textContent = p.contratoId;
  const nom = document.createElement('span');
  nom.className = 'gx-cli__name';
  nom.textContent = CONCEPTO[p.tipo] ?? p.tipo;
  q.appendChild(cod);
  q.appendChild(nom);

  const est = document.createElement('span');
  const pill = document.createElement('span');
  pill.className = `gx-pill gx-pill--${d.estado === 'al_dia' ? 'navy' : 'gold'}`;
  pill.textContent = d.estado === 'al_dia' ? 'Al día' : d.estado === 'pendiente' ? 'Pendiente' : `${d.estado} · ${d.diasMora} d`;
  est.appendChild(pill);

  for (const n of [
    q,
    celda(p.periodo, 'gx-muted'),
    celda(formatoPrecio(p.montoEsperado, 'arriendo').replace('/mes', ''), 'gx-muted'),
    est,
    celda(d.moraTier ? accionDeMora(d.moraTier) : '—', 'gx-muted gx-wrap'),
  ]) {
    fila.appendChild(n);
  }
  return fila;
}

/** Carga la cartera: los pagos más recientes con su estado recalculado. */
export async function montarPagos(): Promise<void> {
  const cuerpo = $('gx-pg-lista');
  const resumen = $('gx-pg-resumen');
  if (!cuerpo) return;
  cuerpo.replaceChildren(mensaje('Cargando…'));

  try {
    const { db, mod } = await cargarFirestore();
    const q = mod.query(mod.collection(db, 'pagos'), mod.orderBy('fechaVencimiento', 'desc'), mod.limit(TOPE));
    const snap = await mod.getDocs(q);
    if (snap.empty) {
      cuerpo.replaceChildren(mensaje('Todavía no hay pagos registrados.'));
      if (resumen) resumen.textContent = '';
      return;
    }
    const hoy = hoyISO();
    const pagos = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as Pago);
    cuerpo.replaceChildren(...pagos.map((p) => pintarPago(p, hoy)));
    if (resumen) {
      const enMora = pagos.filter((p) => estadoDePago(p, hoy).moraTier > 0).length;
      resumen.textContent = enMora ? `${enMora} en mora de ${pagos.length}` : `${pagos.length} al día`;
    }
  } catch (e) {
    cuerpo.replaceChildren(mensaje('No pudimos cargar la cartera.'));
    console.error('[gestion] pagos:', e);
  }
}

/** Llama a `registrarPago` por HTTP, igual que `crearContrato` y por la misma razón. */
async function llamarRegistrarPago(datos: Record<string, unknown>): Promise<{ ok: boolean; mensaje: string }> {
  let token: string | null = null;
  try {
    const { auth } = await cargarAuth();
    token = (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    token = null;
  }
  if (!token) return { ok: false, mensaje: 'Tu sesión caducó. Recarga la página y vuelve a entrar.' };

  const url = `https://${REGION_FUNCTIONS}-${FIREBASE_PUBLICO.projectId}.cloudfunctions.net/registrarPago`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: datos }),
    });
    const cuerpo = (await resp.json().catch(() => null)) as
      | { result?: { id?: string }; error?: { message?: string } }
      | null;
    if (resp.ok && cuerpo?.result?.id) return { ok: true, mensaje: `Pago ${cuerpo.result.id} registrado.` };
    return { ok: false, mensaje: cuerpo?.error?.message ?? 'No se pudo registrar.' };
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar. Revisa la conexión.' };
  }
}

const numero = (id: string): number | undefined => {
  const n = Number(val(id).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Monta el registro de pagos. */
export function montarRegistroPago(): void {
  const form = $<HTMLFormElement>('gx-pg-form');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = $<HTMLButtonElement>('gx-pg-guardar');
    const caja = $('gx-pg-msg');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Registrando…';
    }
    const r = await llamarRegistrarPago({
      contratoId: val('p-contrato'),
      periodo: val('p-periodo'),
      tipo: val('p-tipo') || 'canon_inquilino',
      montoRecibido: numero('p-recibido'),
      fechaPago: val('p-fecha') || undefined,
      montoEsperado: numero('p-esperado'),
    });
    if (caja) caja.textContent = r.mensaje;
    if (r.ok) {
      form.reset();
      void montarPagos();
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Registrar pago';
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ALTA — llama a la callable; NO escribe Firestore
// ─────────────────────────────────────────────────────────────────────────────

/** Lo que hay en el formulario, con la forma del modelo. */
export function leerContrato(): Partial<Contrato> {
  const canon = Number(val('c-canon').replace(/[^\d]/g, ''));
  const diaPago = Number(val('c-diaPago'));
  const honorarios = Number(val('c-honorarios'));
  const garantia = val('c-garantia');
  return {
    expedienteId: val('c-expediente'),
    tipo: (val('c-tipo') || 'arriendo') as Contrato['tipo'],
    vertical: (val('c-vertical') || 'vivienda') as Contrato['vertical'],
    estado: 'vigente',
    partes: {
      propietario: val('c-propietario') ? { nombre: val('c-propietario') } : undefined,
      arrendatario: val('c-arrendatario') ? { nombre: val('c-arrendatario') } : undefined,
    },
    ...(Number.isFinite(canon) && canon > 0 ? { canon } : {}),
    ...(Number.isFinite(diaPago) && diaPago > 0 ? { diaPago } : {}),
    ...(Number.isFinite(honorarios) && honorarios > 0 ? { honorariosPct: honorarios } : {}),
    vigenciaInicio: val('c-inicio'),
    vigenciaFin: val('c-fin'),
    renovacionAutomatica: ($('c-renovacion') as HTMLInputElement | null)?.checked ?? false,
    incrementoIPC: ($('c-ipc') as HTMLInputElement | null)?.checked ?? false,
    ...(garantia ? { garantia: { tipo: garantia as never } } : {}),
  };
}

function pintarProblemas(msgs: string[]): void {
  const caja = $('gx-ct-msg');
  if (!caja) return;
  caja.replaceChildren();
  if (!msgs.length) return;
  const ul = document.createElement('ul');
  for (const m of msgs) {
    const li = document.createElement('li');
    li.textContent = m;
    ul.appendChild(li);
  }
  caja.appendChild(ul);
}

/**
 * Llama a la callable `crearContrato` por HTTP, SIN el SDK de Firebase.
 *
 * POR QUÉ A MANO Y NO CON `firebase/functions`: el gate `verify:data` prohíbe el SDK cliente en todo
 * `portal/src` —«la capa de datos usa REST, no el SDK»— y lo cazó en cuanto lo importé. Ensanchar la
 * excepción habría sido más rápido y peor: el protocolo de una callable son veinte líneas
 * (`POST {data}` → `{result}` o `{error}`), y el token ya se sabe obtener desde §107. Un gate que se
 * abre cada vez que estorba deja de ser un gate.
 *
 * El mensaje de error se saca de `error.details.mensajes`, que es donde la Function pone los problemas
 * YA redactados: repetir aquí esos textos sería una segunda copia de la misma verdad.
 */
async function llamarCrearContrato(
  entrada: Partial<Contrato>,
): Promise<{ ok: true; id: string } | { ok: false; mensaje: string; mensajes?: string[] }> {
  let token: string | null = null;
  try {
    const { auth } = await cargarAuth();
    token = (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    token = null;
  }
  if (!token) return { ok: false, mensaje: 'Tu sesión caducó. Recarga la página y vuelve a entrar.' };

  const url = `https://${REGION_FUNCTIONS}-${FIREBASE_PUBLICO.projectId}.cloudfunctions.net/crearContrato`;
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: entrada }),
    });
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar. Revisa la conexión y vuelve a intentarlo.' };
  }

  const cuerpo = (await resp.json().catch(() => null)) as
    | { result?: { id?: string }; error?: { message?: string; details?: { mensajes?: string[] } } }
    | null;

  if (resp.ok && cuerpo?.result?.id) return { ok: true, id: cuerpo.result.id };
  return {
    ok: false,
    mensaje: cuerpo?.error?.message ?? 'No se pudo guardar. Revisa tus permisos.',
    mensajes: cuerpo?.error?.details?.mensajes,
  };
}

/** Monta el alta de contratos. */
export function montarAltaContrato(): void {
  const form = $<HTMLFormElement>('gx-ct-form');
  if (!form) return;

  // Aviso EN VIVO con los mismos predicados que impone la Function: el gate del depósito se ve
  // mientras se rellena, no al pulsar Guardar. Ahí es una sugerencia; en la Function, la frontera.
  const revisar = () => pintarProblemas(problemasDeContrato(leerContrato()).map(explicarProblemaContrato));
  form.addEventListener('input', revisar);
  form.addEventListener('change', revisar);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = $<HTMLButtonElement>('gx-ct-guardar');
    const entrada = leerContrato();

    const problemas = problemasDeContrato(entrada);
    if (problemas.length) {
      pintarProblemas(problemas.map(explicarProblemaContrato));
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando…';
    }
    const r = await llamarCrearContrato(entrada);
    const caja = $('gx-ct-msg');
    if (r.ok) {
      pintarProblemas([]);
      if (caja) caja.textContent = `Contrato ${r.id} guardado.`;
      form.reset();
      void montarContratos();
    } else if (r.mensajes?.length) {
      pintarProblemas(r.mensajes);
    } else if (caja) {
      caja.textContent = r.mensaje;
    }
    {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Guardar contrato';
      }
    }
  });
}
