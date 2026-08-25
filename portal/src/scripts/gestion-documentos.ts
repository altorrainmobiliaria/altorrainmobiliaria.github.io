/*
 * DOCUMENTOS — la bóveda del expediente en el panel (gate B5, §142; mockup `ALTORRA Documentos`).
 *
 * LO PRIMERO QUE SE VE NO SON ARCHIVOS, SON HUECOS. La pantalla arranca por lo que FALTA y lo que
 * CADUCA, porque un cajón de PDFs no cambia nada: el dueño ya tiene ese cajón en WhatsApp. Lo que hoy
 * no puede contestar sin abrir carpetas es «¿qué me falta?», y eso lo calcula `lib/domain/documentos`.
 *
 * ⚠️ NUNCA `getDownloadURL()`. Esa función emite una URL con un token dentro: **cualquiera con ese
 * enlace abre el archivo**, sin sesión y sin que las Reglas puedan impedirlo. Para la cédula de un
 * arrendatario eso es una fuga esperando a un reenvío de WhatsApp. Se usa `getBlob()`, que descarga
 * CON la sesión y sí pasa por las Reglas — y la pantalla lo dice, porque si no alguien va a intentar
 * «copiar el enlace» y no va a entender por qué no puede.
 *
 * ⚠️ Y la ESCRITURA no pasa por aquí: `documentos` nace con `allow write: if false` (§100). El archivo
 * sí sube directo a Storage —pasar 10 MB por una Function sería gastar memoria por nada— pero a una
 * ruta que **acuña el servidor**, y el registro lo cierra el servidor mirando el objeto real. Este
 * módulo conduce la conversación; no decide nada.
 */

import { cargarAuth } from './auth';
import { llamarCallable as llamar } from './callable';
import {
  faltantes,
  NOMBRE_DOCUMENTO,
  porVencer,
  TIPOS_MIME,
  TOPE_BYTES,
  vigente,
  type Caducidad,
  type Documento,
  type TipoDocumento,
} from '../lib/domain/documentos';
import type { Contrato, Expediente } from '../lib/domain/gestion';

/** Tope de las consultas. `limit()` es obligatorio en este proyecto: sin él es una cuota abierta. */
const TOPE = 200;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

/** Lo último que se cargó. Lo comparten las dos vistas para no consultar dos veces. */
const cargados: { documentos: Documento[]; expedientes: Expediente[]; contratos: Contrato[] } = {
  documentos: [],
  expedientes: [],
  contratos: [],
};

async function cargarFirestore() {
  const { app } = await cargarAuth();
  const mod = await import('firebase/firestore');
  return { db: mod.getFirestore(app), mod };
}

/* ─── Pintado ────────────────────────────────────────────────────────────────────────────────── */

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

/** «hace 8 meses», «vence en 12 días». Un número crudo obliga a hacer la cuenta mentalmente. */
function enPalabras(dias: number): string {
  if (dias < 0) {
    const d = Math.abs(dias);
    if (d === 1) return 'venció ayer';
    if (d < 30) return `venció hace ${d} días`;
    const m = Math.round(d / 30);
    return `venció hace ${m} ${m === 1 ? 'mes' : 'meses'}`;
  }
  if (dias === 0) return 'vence hoy';
  if (dias === 1) return 'vence mañana';
  return `vence en ${dias} días`;
}

const kb = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ─── Consulta ───────────────────────────────────────────────────────────────────────────────── */

async function traerTodo(): Promise<void> {
  const { db, mod } = await cargarFirestore();
  const [docs, exps, ctrs] = await Promise.all([
    mod.getDocs(mod.query(mod.collection(db, 'documentos'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE))),
    mod.getDocs(mod.query(mod.collection(db, 'expedientes'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE))),
    mod.getDocs(mod.query(mod.collection(db, 'contratos'), mod.orderBy('createdAt', 'desc'), mod.limit(TOPE))),
  ]);
  cargados.documentos = docs.docs.map((d) => ({ id: d.id, ...d.data() }) as Documento);
  cargados.expedientes = exps.docs.map((d) => ({ id: d.id, ...d.data() }) as Expediente);
  cargados.contratos = ctrs.docs.map((d) => ({ id: d.id, ...d.data() }) as Contrato);
}

/** Qué le falta a cada expediente, según los contratos que tenga. */
function huecos(): { expediente: Expediente; falta: TipoDocumento[] }[] {
  const out: { expediente: Expediente; falta: TipoDocumento[] }[] = [];
  for (const e of cargados.expedientes) {
    const tipos = [...new Set(cargados.contratos.filter((c) => c.expedienteId === e.id).map((c) => c.tipo))];
    // Un expediente SIN contratos todavía no exige nada: pedirle papeles a algo que aún no se
    // formalizó sería inventar un hueco. Aparece cuando su primer contrato existe.
    if (!tipos.length) continue;
    const falta = faltantes(
      cargados.documentos.filter((d) => d.expedienteId === e.id),
      tipos,
    );
    if (falta.length) out.push({ expediente: e, falta });
  }
  return out;
}

/* ─── Vista: qué falta ───────────────────────────────────────────────────────────────────────── */

export async function montarDocumentos(): Promise<void> {
  const conjunto = $('gx-doc-lista');
  if (!conjunto) return;
  conjunto.replaceChildren(mensaje('Cargando…'));

  try {
    await traerTodo();
  } catch (e) {
    // FALLA RUIDOSO: una bóveda que se ve vacía porque la consulta falló haría creer que no falta nada.
    conjunto.replaceChildren(
      mensaje('No pudimos cargar los documentos. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.'),
    );
    console.error('[gestion] documentos:', e);
    return;
  }

  const pendientes = huecos();
  const caducan = porVencer(cargados.documentos, new Date().toISOString());

  const set = (id: string, v: string) => {
    const el = $(id);
    if (el) el.textContent = v;
  };
  set('gx-doc-kpi-faltan', String(pendientes.length));
  set('gx-doc-kpi-vencen', String(caducan.length));
  set('gx-doc-kpi-total', String(cargados.documentos.filter(vigente).length));

  const filas: HTMLElement[] = [];

  // Primero lo que CADUCA: una póliza vencida cuesta más que un papel que falta.
  for (const c of caducan) filas.push(filaCaducidad(c));
  for (const p of pendientes) filas.push(filaHueco(p.expediente, p.falta));

  conjunto.replaceChildren(
    ...(filas.length
      ? filas
      : [mensaje(cargados.expedientes.length
          ? 'No falta nada y no hay documentos por vencer.'
          : 'Todavía no hay expedientes. Cuando abras el primero, aquí aparecerá lo que le falta.')]),
  );
}

function filaCaducidad(c: Caducidad): HTMLElement {
  const f = document.createElement('div');
  f.className = 'gx-tr gx-doc-fila gx-doc-fila--aviso';
  const q = document.createElement('div');
  q.className = 'gx-cli gx-cli--apilada';
  q.appendChild(celda(c.documento.expedienteId, 'gx-cod'));
  q.appendChild(celda(NOMBRE_DOCUMENTO[c.documento.tipo], 'gx-cli__name'));
  f.appendChild(q);
  f.appendChild(celda(enPalabras(c.dias), c.vencido ? 'gx-doc-vencido' : ''));
  f.appendChild(celda(c.documento.vence?.slice(0, 10) ?? '—', 'gx-muted'));
  return f;
}

function filaHueco(e: Expediente, falta: TipoDocumento[]): HTMLElement {
  const f = document.createElement('div');
  f.className = 'gx-tr gx-doc-fila';
  const q = document.createElement('div');
  q.className = 'gx-cli gx-cli--apilada';
  q.appendChild(celda(e.codigoLegacy || e.id, 'gx-cod'));
  q.appendChild(celda(`${falta.length} ${falta.length === 1 ? 'documento' : 'documentos'} por subir`, 'gx-cli__name'));
  f.appendChild(q);
  f.appendChild(celda(falta.map((t) => NOMBRE_DOCUMENTO[t]).join(' · ')));
  f.appendChild(celda('—', 'gx-muted'));
  return f;
}

/* ─── Subir ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * Sube en tres tiempos: el servidor reserva la ruta, el navegador escribe en ELLA, el servidor
 * confirma mirando el objeto real. Lo que el navegador nunca decide es dónde escribe ni cuánto pesa.
 */
export async function subirDocumento(
  archivo: File,
  meta: { expedienteId: string; tipo: TipoDocumento; finalidad: string; vence?: string; avisarDias?: number },
  avisar: (txt: string) => void,
): Promise<boolean> {
  if (!TIPOS_MIME.includes(archivo.type as (typeof TIPOS_MIME)[number])) {
    avisar('Solo se admiten PDF, JPG, PNG o WebP: es lo que sale de un escáner o de un teléfono.');
    return false;
  }
  if (archivo.size > TOPE_BYTES) {
    avisar(`El archivo pasa de ${Math.round(TOPE_BYTES / 1024 / 1024)} MB. Si es un escaneo, bájale la resolución.`);
    return false;
  }

  avisar('Reservando el sitio…');
  const preparado = await llamar('prepararDocumento', {
    ...meta,
    nombreArchivo: archivo.name,
    contentType: archivo.type,
    bytes: archivo.size,
  });
  if (!preparado.ok) {
    avisar(preparado.mensaje);
    return false;
  }
  const id = String(preparado.result.id ?? '');
  const clave = String(preparado.result.claveStorage ?? '');
  if (!id || !clave) {
    avisar('El servidor no devolvió dónde guardar. Inténtalo de nuevo.');
    return false;
  }

  avisar(`Subiendo ${kb(archivo.size)}…`);
  try {
    const { app } = await cargarAuth();
    const st = await import('firebase/storage');
    await st.uploadBytes(st.ref(st.getStorage(app), clave), archivo, { contentType: archivo.type });
  } catch (e) {
    // El registro queda en `subiendo` y se ve como tal: un hueco visible es mejor que uno silencioso.
    avisar('No se pudo subir el archivo. El registro quedó a medias; vuelve a intentarlo.');
    console.error('[documentos] subida:', e);
    return false;
  }

  avisar('Comprobando…');
  const confirmado = await llamar('confirmarDocumento', { id });
  if (!confirmado.ok) {
    avisar(confirmado.mensaje);
    return false;
  }
  avisar(`Guardado como ${id}.`);
  return true;
}

/* ─── Abrir ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * Descarga CON la sesión y entrega el archivo al navegador.
 *
 * ⚠️ `getBlob`, NO `getDownloadURL`. La segunda emite una URL con token que abre cualquiera que la
 * tenga, sin sesión y saltándose las Reglas. La primera pasa por las Reglas y no deja nada que
 * reenviar. El `objectURL` que se crea aquí vive en esta pestaña y muere con ella — se revoca a
 * propósito: si no, el blob se queda en memoria hasta recargar.
 */
export async function abrirDocumento(doc: Documento, avisar: (txt: string) => void): Promise<void> {
  avisar('Abriendo…');
  try {
    const { app } = await cargarAuth();
    const st = await import('firebase/storage');
    const blob = await st.getBlob(st.ref(st.getStorage(app), doc.claveStorage));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.nombreArchivo || `${doc.id}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    avisar('');
  } catch (e) {
    avisar('No se pudo abrir. Si acabas de recibir permisos, cierra sesión y vuelve a entrar.');
    console.error('[documentos] abrir:', e);
  }
}

/** Retirar ≠ eliminar: deja de estar a la vista y queda constancia de quién y por qué. */
export async function retirarDocumento(id: string, motivo: string, avisar: (txt: string) => void): Promise<boolean> {
  const r = await llamar('retirarDocumento', { id, motivo });
  avisar(r.ok ? 'Retirado.' : r.mensaje);
  return r.ok;
}

/** Para las pruebas y para la vista por expediente: lo último cargado, sin volver a consultar. */
export const documentosDe = (expedienteId: string): Documento[] =>
  cargados.documentos.filter((d) => d.expedienteId === expedienteId && vigente(d));
