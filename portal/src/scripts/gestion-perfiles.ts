/*
 * PERFILES — la revisión humana en el panel (Ola 2 · §153; mockup `ALTORRA Perfiles.dc.html`).
 *
 * EL CUELLO DE BOTELLA DE ESTE PRODUCTO ES UNA PERSONA LEYENDO PAPELES. La promesa pública son 24
 * horas hábiles, y una promesa sin un sitio donde se vea cuánto lleva esperando cada quien no es una
 * promesa: es un deseo. Por eso la lista se ordena por ESPERA y no por fecha de llegada, y quien se
 * pasó del plazo va primero.
 *
 * ⚖️ AQUÍ HAY CÉDULAS Y NÓMINAS DE PERSONAS QUE NO SON DEL EQUIPO. Dos consecuencias, las dos con
 * código detrás y no solo con buena intención:
 *   · se descargan con `getBlob`, que pasa por las Reglas y no deja enlace que reenviar. NUNCA
 *     `getDownloadURL`, que emite una URL con token que abre cualquiera (§142);
 *   · abrir un soporte QUEDA ESCRITO, con el uid del token, en `auditLog`.
 *
 * 🚫 Y lo que esta pantalla NO hace: puntaje, semáforo de riesgo o «score». Sin contrato con una
 * central, consultar a alguien es ilegal (B-04) — y pintar un color de riesgo a partir de sus
 * papeles sería inventar exactamente eso con otro nombre.
 */

import { cargarAuth } from './auth';
import { llamarCallable as llamar } from './callable';
import {
  diasDeVigencia,
  diasEsperando,
  faltantes,
  NOMBRE_ESTADO,
  NOMBRE_REQUISITO,
  slaVencido,
  vigente,
  type PerfilInquilino,
} from '../lib/domain/perfil-inquilino';

const TOPE = 200;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

let cargados: PerfilInquilino[] = [];

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

const hoy = () => new Date().toISOString().slice(0, 10);

/**
 * Cuánto urge un perfil. Alto = míralo primero. Se calcula aparte porque el ORDEN de esta cola es la
 * decisión de producto entera: es lo que decide a quién se le cumple la promesa y a quién no.
 */
export function urgencia(p: PerfilInquilino, dia: string): number {
  if (slaVencido(p, dia)) return 3;
  if (p.estado === 'enviado' || p.estado === 'revisando') return 2;
  if (p.estado === 'observaciones') return 1;
  return 0;
}

export async function montarPerfiles(): Promise<void> {
  const lista = $('gx-pf-lista');
  if (!lista) return;
  lista.replaceChildren(mensaje('Cargando…'));

  try {
    const { db, mod } = await cargarFirestore();
    const snap = await mod.getDocs(mod.query(mod.collection(db, 'perfiles'), mod.limit(TOPE)));
    cargados = snap.docs.map((d) => d.data() as PerfilInquilino);
  } catch (e) {
    // FALLA RUIDOSO: una cola vacía porque la consulta falló diría que no hay nadie esperando.
    lista.replaceChildren(
      mensaje('No pudimos cargar los perfiles. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    console.error('[gestion] perfiles:', e);
    return;
  }

  const dia = hoy();
  const orden = [...cargados].sort(
    (a, b) => urgencia(b, dia) - urgencia(a, dia) || diasEsperando(b, dia) - diasEsperando(a, dia),
  );

  const set = (id: string, n: number) => {
    const el = $(id);
    if (el) el.textContent = String(n);
  };
  set('gx-pf-kpi-tarde', cargados.filter((p) => slaVencido(p, dia)).length);
  set('gx-pf-kpi-cola', cargados.filter((p) => p.estado === 'enviado' || p.estado === 'revisando').length);
  set('gx-pf-kpi-vigentes', cargados.filter((p) => vigente(p, dia)).length);

  lista.replaceChildren(
    ...(orden.length
      ? orden.map((p) => fila(p, dia))
      : [mensaje('Todavía no hay perfiles. Aparecerán aquí cuando alguien envíe el suyo a revisión.')]),
  );
}

function fila(p: PerfilInquilino, dia: string): HTMLElement {
  const f = document.createElement('div');
  f.className = slaVencido(p, dia) ? 'gx-tr gx-vta-alerta' : 'gx-tr';

  const quien = document.createElement('div');
  quien.className = 'gx-cli gx-cli--apilada';
  quien.appendChild(celda(p.nombre || '(sin nombre)', 'gx-cod'));
  const faltan = faltantes(p);
  const total = p.primerArriendo ? 3 : 4;
  quien.appendChild(celda(`${p.email} · ${total - faltan.length} de ${total} soportes`, 'gx-cli__name'));
  f.appendChild(quien);

  f.appendChild(celda(NOMBRE_ESTADO[p.estado], 'gx-cod'));

  // La ESPERA es lo que se mira, así que se dice en palabras y no en una fecha que hay que restar.
  let espera = '';
  if (p.estado === 'enviado' || p.estado === 'revisando') {
    const d = diasEsperando(p, dia);
    espera = d === 0 ? 'hoy' : `${d} día${d === 1 ? '' : 's'}`;
    if (slaVencido(p, dia)) espera += ' · fuera de plazo';
  } else if (p.estado === 'verificado') {
    const q = diasDeVigencia(p, dia);
    espera = q > 0 ? `vence en ${q} días` : 'caducado: pídele refresco';
  }
  f.appendChild(celda(espera, slaVencido(p, dia) ? '' : 'gx-muted'));

  const acc = document.createElement('span');
  acc.className = 'gx-doc-acc';
  if (p.estado === 'enviado' || p.estado === 'revisando') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gx-link gx-link--btn';
    b.textContent = 'Revisar';
    b.addEventListener('click', () => abrirPerfil(p.uid));
    acc.appendChild(b);
  }
  f.appendChild(acc);

  return f;
}

/* ─── La decisión (mockup 2a) ────────────────────────────────────────────────────────────────── */

export function abrirPerfil(uid: string): void {
  const panel = $('gx-pf-detalle');
  const lista = $('gx-pf-det-soportes');
  const p = cargados.find((x) => x.uid === uid);
  if (!panel || !lista || !p) return;

  const titulo = $('gx-pf-det-titulo');
  if (titulo) titulo.textContent = p.nombre || '(sin nombre)';
  const resumen = $('gx-pf-det-resumen');
  if (resumen) {
    const d = diasEsperando(p, hoy());
    resumen.textContent = [p.email, p.telefono, d === 0 ? 'llegó hoy' : `lleva ${d} día${d === 1 ? '' : 's'} esperando`]
      .filter(Boolean)
      .join(' · ');
  }

  const filas: HTMLElement[] = p.soportes.map((s) => {
    const f = document.createElement('div');
    f.className = 'gx-tr';
    f.appendChild(celda(NOMBRE_REQUISITO[s.requisito], 'gx-cod'));
    f.appendChild(celda(s.nombreArchivo, 'gx-muted'));
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gx-link gx-link--btn';
    b.textContent = 'Abrir';
    b.addEventListener('click', () => void abrirSoporte(p, s.claveStorage, s.requisito));
    f.appendChild(b);
    return f;
  });
  for (const r of faltantes(p)) {
    const f = document.createElement('div');
    f.className = 'gx-tr gx-doc-falta';
    f.appendChild(celda(NOMBRE_REQUISITO[r], 'gx-cod'));
    f.appendChild(celda('no lo ha subido', 'gx-muted'));
    f.appendChild(celda(''));
    filas.push(f);
  }
  lista.replaceChildren(...(filas.length ? filas : [mensaje('No ha subido nada todavía.')]));

  const obs = $<HTMLInputElement>('gx-pf-obs');
  if (obs) obs.value = '';
  pintarDecision(p);
  panel.removeAttribute('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Descarga CON la sesión y deja constancia. Ver §142 para por qué no `getDownloadURL`. */
async function abrirSoporte(p: PerfilInquilino, clave: string, requisito: string): Promise<void> {
  const msg = $('gx-pf-det-msg');
  const avisar = (t: string) => {
    if (msg) msg.textContent = t;
  };
  avisar('Abriendo…');
  try {
    const { app } = await cargarAuth();
    const st = await import('firebase/storage');
    const blob = await st.getBlob(st.ref(st.getStorage(app), clave));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = clave.split('/').pop() || 'documento';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    avisar('');

    // Va DESPUÉS de entregar el archivo y sin esperar: una bitácora no debe poder retrasar —ni mucho
    // menos impedir— que quien revisa vea lo que tiene que revisar.
    void llamar('registrarEvento', {
      accion: 'perfil-abierto',
      origen: 'portal-gestion',
      objetivo: p.uid,
      detalle: `${requisito} · ${p.email}`,
    });
  } catch (e) {
    avisar('No se pudo abrir. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.');
    console.error('[perfiles] abrir soporte:', e);
  }
}

function pintarDecision(p: PerfilInquilino): void {
  const caja = $('gx-pf-det-acciones');
  if (!caja) return;

  if (document.body.dataset.puedeEditar === 'false') {
    caja.replaceChildren(mensaje('Tu rol puede consultar los perfiles, no dictaminarlos.'));
    return;
  }

  const verificar = document.createElement('button');
  verificar.type = 'button';
  verificar.className = 'alt-btn alt-btn--navy gx-btn-fila';
  verificar.textContent = 'Verificar';
  verificar.addEventListener('click', () => void dictaminar(p, 'verificado'));

  const devolver = document.createElement('button');
  devolver.type = 'button';
  devolver.className = 'alt-btn alt-btn--outline gx-btn-fila';
  devolver.textContent = 'Devolver con observaciones';
  devolver.addEventListener('click', () => void dictaminar(p, 'observaciones'));

  caja.replaceChildren(verificar, devolver);
}

async function dictaminar(p: PerfilInquilino, estado: 'verificado' | 'observaciones'): Promise<void> {
  const msg = $('gx-pf-det-msg');
  const avisar = (t: string) => {
    if (msg) msg.textContent = t;
  };

  const obs = $<HTMLInputElement>('gx-pf-obs')?.value.trim() ?? '';
  /*
   * El servidor rechaza devolver sin motivo, así que esto no es cortesía: es decirlo antes de gastar
   * el viaje. Y el texto le llega a la persona tal cual — quien lee «la cédula está borrosa» sube
   * otra en dos minutos; quien lee «rechazado» empieza de cero o se va.
   */
  if (estado === 'observaciones' && !obs) {
    avisar('Escribe qué falta: ese texto es lo que la persona va a leer.');
    return;
  }

  avisar('Guardando…');
  const r = await llamar('revisarPerfil', {
    uid: p.uid,
    estado,
    ...(obs ? { observaciones: obs } : {}),
  });
  if (!r.ok) {
    avisar(r.mensaje);
    return;
  }
  void llamar('registrarEvento', {
    accion: 'perfil-dictaminado',
    origen: 'portal-gestion',
    objetivo: p.uid,
    detalle: estado === 'verificado' ? 'verificado' : `devuelto: ${obs}`,
  });
  avisar('');
  $('gx-pf-detalle')?.setAttribute('hidden', '');
  await montarPerfiles();
}

export function montarPanelPerfiles(): void {
  $('gx-pf-det-cerrar')?.addEventListener('click', () => {
    $('gx-pf-detalle')?.setAttribute('hidden', '');
  });
}
