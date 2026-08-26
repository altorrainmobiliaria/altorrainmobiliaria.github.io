/*
 * MI PERFIL — el lado del arrendatario (Ola 2 · §155; mockup `ALTORRA Mi perfil.dc.html`).
 *
 * ESTA PANTALLA LA ABRE ALGUIEN NERVIOSO. Está buscando dónde vivir, ya le pidieron papeles en tres
 * sitios y en dos le pidieron codeudor. Todo lo que lea aquí tiene que quitarle miedo — y la forma
 * de quitarlo no es un texto amable: es decirle QUÉ falta, QUÉ sirve como soporte y CUÁNTO tarda.
 *
 * 🔴 SIN SDK DE FIREBASE, y no es purismo. Esta es una página PÚBLICA: meterle el SDK de Firestore o
 * el de Storage la engorda para todo el que pase por ella, y el gate `verify:data` lo prohíbe con
 * razón. Se hace todo con `fetch`:
 *   · leer el perfil → REST de Firestore con el ID token (la lectura la reservan las Rules al
 *     titular, así que la `apiKey` sola no basta; el token va en `Authorization`);
 *   · subir el archivo → REST de Storage, a la ruta EXACTA que acuñó el servidor;
 *   · todo lo que escribe estado → las callables (`guardarPerfil`, `prepararSoporte`,
 *     `confirmarSoporte`, `enviarPerfil`), porque `perfiles` nace con `allow write: if false`.
 *
 * Lo único que sí es SDK es Auth, y de eso ya es dueño `auth.ts` (§98).
 */

import { cargarAuth, estadoAcceso } from './auth';
import { llamarCallable as llamar } from './callable';
import { getDoc } from '../lib/data/firestore-rest';
import { FIREBASE_PUBLICO } from '../lib/config/firebase-publico';
import {
  faltantes,
  NOMBRE_ESTADO,
  NOMBRE_REQUISITO,
  QUE_SIRVE,
  REQUISITOS,
  type PerfilInquilino,
  type Requisito,
} from '../lib/domain/perfil-inquilino';

/** El bucket real del proyecto, tomado de la config del legacy (verificado, no supuesto). */
const BUCKET = 'altorra-inmobiliaria-345c6.firebasestorage.app';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const ver = (id: string, si: boolean) => {
  const el = $(id);
  if (el) el.hidden = !si;
};

let perfil: PerfilInquilino | null = null;
let uid = '';

function avisar(txt: string): void {
  const el = $('mp-msg');
  if (el) el.textContent = txt;
}

async function token(): Promise<string> {
  const { auth } = await cargarAuth();
  const u = auth.currentUser;
  if (!u) throw new Error('sin-sesion');
  return u.getIdToken();
}

/** Lee el perfil del titular. `null` si todavía no existe — que es el estado normal el primer día. */
async function leerPerfil(): Promise<PerfilInquilino | null> {
  const r = await getDoc(['perfiles', uid], {
    apiKey: FIREBASE_PUBLICO.apiKey,
    projectId: FIREBASE_PUBLICO.projectId,
    idToken: await token(),
  });
  return r.ok ? (r.data as unknown as PerfilInquilino) : null;
}

/* ─── Pintado ────────────────────────────────────────────────────────────────────────────────── */

function pintarEstado(): void {
  const banda = $('mp-estado');
  // El TEXTO, no el contenedor: escribir sobre `mp-observaciones` borraría el rótulo «Falta una
  // cosa» y la explicación de qué hacer, que es justo lo que la persona necesita leer.
  const obs = $('mp-observaciones-txt');
  if (!banda) return;

  if (!perfil || perfil.estado === 'borrador') {
    banda.textContent = 'Todavía no lo has enviado. Cuando esté completo, lo revisa una persona.';
    ver('mp-observaciones', false);
    return;
  }
  if (perfil.estado === 'enviado' || perfil.estado === 'revisando') {
    // El estado dice CUÁNTO falta, no cómo se llama: «enviado a revisión» no informa de nada.
    banda.textContent = 'Lo estamos revisando. Te respondemos antes de 24 horas hábiles.';
    ver('mp-observaciones', false);
    return;
  }
  if (perfil.estado === 'observaciones') {
    banda.textContent = 'Falta una cosa para poder verificarlo.';
    if (obs) obs.textContent = perfil.observaciones ?? '';
    ver('mp-observaciones', true);
    return;
  }
  banda.textContent = 'Tu perfil está verificado. Sirve para todos los inmuebles que te interesen.';
  ver('mp-observaciones', false);
}

function pintarRequisitos(): void {
  const caja = $('mp-requisitos');
  if (!caja) return;

  const primero = perfil?.primerArriendo ?? false;
  const faltan = new Set(faltantes({ soportes: perfil?.soportes ?? [], primerArriendo: primero }));
  const enRevision = perfil?.estado === 'enviado' || perfil?.estado === 'revisando';

  const filas = REQUISITOS.filter((r) => !(r === 'referencia' && primero)).map((r) => {
    const subido = perfil?.soportes.find((s) => s.requisito === r);
    const fila = document.createElement('div');
    fila.className = faltan.has(r) ? 'mp-req mp-req--falta' : 'mp-req';

    const izq = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'mp-req__t';
    t.textContent = NOMBRE_REQUISITO[r] + (subido ? ' ✓' : '');
    izq.appendChild(t);

    const d = document.createElement('div');
    d.className = 'mp-req__d';
    // Si ya lo subió, se le dice QUÉ subió; si no, QUÉ SIRVE. Casi todo el reproceso de una revisión
    // documental nace de una etiqueta vaga: «soporte de ingresos» no le dice nada a nadie.
    d.textContent = subido ? `${subido.nombreArchivo} · subido` : QUE_SIRVE[r];
    izq.appendChild(d);
    fila.appendChild(izq);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = subido ? 'alt-btn alt-btn--outline mp-req__b' : 'alt-btn alt-btn--navy mp-req__b';
    boton.textContent = subido ? 'Cambiar' : 'Subir';
    boton.disabled = enRevision;
    boton.addEventListener('click', () => pedirArchivo(r));
    fila.appendChild(boton);

    return fila;
  });

  caja.replaceChildren(...filas);

  const enviar = $<HTMLButtonElement>('mp-enviar');
  if (enviar) {
    enviar.disabled = enRevision || faltan.size > 0;
    enviar.textContent = perfil?.estado === 'observaciones' ? 'Volver a enviar' : 'Enviar a revisión';
  }
  const primeroCheck = $<HTMLInputElement>('mp-primero');
  if (primeroCheck) {
    primeroCheck.checked = primero;
    primeroCheck.disabled = enRevision;
  }
}

/* ─── Subida (tres pasos, como la bóveda §142) ───────────────────────────────────────────────── */

function pedirArchivo(requisito: Requisito): void {
  const input = $<HTMLInputElement>('mp-archivo');
  if (!input) return;
  input.dataset.requisito = requisito;
  input.value = ''; // permite volver a elegir el MISMO archivo si la subida falló
  input.click();
}

async function subir(requisito: Requisito, archivo: File): Promise<void> {
  avisar('Subiendo…');
  try {
    // 1. El servidor acuña la ruta. El navegador NO elige dónde escribe.
    const prep = await llamar('prepararSoporte', {
      requisito,
      contentType: archivo.type,
      bytes: archivo.size,
    });
    if (!prep.ok) {
      avisar(prep.mensaje);
      return;
    }
    const clave = (prep as unknown as { claveStorage: string }).claveStorage;

    // 2. El archivo va directo a Storage, por REST. Pasarlo por una Function sería gastar memoria
    //    por nada, y las Rules ya acotan la carpeta por `uid`.
    const url =
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o` +
      `?uploadType=media&name=${encodeURIComponent(clave)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': archivo.type, authorization: `Bearer ${await token()}` },
      body: archivo,
    });
    if (!res.ok) {
      avisar('No pudimos subir el archivo. Inténtalo otra vez.');
      return;
    }

    // 3. El servidor mira el objeto REAL y solo entonces lo apunta en el perfil.
    const conf = await llamar('confirmarSoporte', {
      requisito,
      claveStorage: clave,
      nombreArchivo: archivo.name,
    });
    if (!conf.ok) {
      avisar(conf.mensaje);
      return;
    }
    perfil = (conf as unknown as { perfil: PerfilInquilino }).perfil;
    avisar('');
    pintarRequisitos();
  } catch (e) {
    avisar('No pudimos subir el archivo. Revisa tu conexión e inténtalo otra vez.');
    console.error('[mi-perfil] subir:', e);
  }
}

/* ─── Arranque ───────────────────────────────────────────────────────────────────────────────── */

export async function montarMiPerfil(): Promise<void> {
  /*
   * Se ESPERA al estado real de la sesión antes de pintar. Leer `currentUser` de una vez devuelve
   * `null` en la primera pintura aunque haya sesión, y esta pantalla le diría «entra primero» a
   * alguien que ya está dentro — el error clásico de esta API, documentado en `auth.ts`.
   */
  const estado = await estadoAcceso();
  if (estado.estado === 'anonimo') {
    ver('mp-anonimo', true);
    return;
  }

  const { auth } = await cargarAuth();
  uid = auth.currentUser?.uid ?? '';
  if (!uid) {
    ver('mp-anonimo', true);
    return;
  }

  perfil = await leerPerfil();
  ver('mp-panel', true);

  const correo = $('mp-correo');
  if (correo) correo.textContent = auth.currentUser?.email ?? '';
  const estadoNombre = $('mp-estado-nombre');
  if (estadoNombre) estadoNombre.textContent = NOMBRE_ESTADO[perfil?.estado ?? 'borrador'];

  pintarEstado();
  pintarRequisitos();

  $<HTMLInputElement>('mp-archivo')?.addEventListener('change', (ev) => {
    const input = ev.target as HTMLInputElement;
    const archivo = input.files?.[0];
    const requisito = input.dataset.requisito as Requisito | undefined;
    if (archivo && requisito) void subir(requisito, archivo);
  });

  $('mp-primero')?.addEventListener('change', async (ev) => {
    const marcado = (ev.target as HTMLInputElement).checked;
    avisar('Guardando…');
    const r = await llamar('guardarPerfil', {
      nombre: perfil?.nombre || auth.currentUser?.displayName || auth.currentUser?.email || '',
      email: auth.currentUser?.email ?? '',
      primerArriendo: marcado,
      // Se conserva lo que ya autorizó: `guardarPerfil` reescribe el documento, y mandar `false`
      // aquí borraría un consentimiento que la persona ya dio.
      autorizaTratamiento: perfil?.autorizaTratamiento ?? true,
    });
    if (!r.ok) {
      avisar(r.mensaje);
      return;
    }
    perfil = (r as unknown as { perfil: PerfilInquilino }).perfil;
    avisar('');
    pintarRequisitos();
  });

  $('mp-enviar')?.addEventListener('click', async () => {
    avisar('Enviando…');
    const r = await llamar('enviarPerfil', {});
    if (!r.ok) {
      avisar(r.mensaje);
      return;
    }
    perfil = (r as unknown as { perfil: PerfilInquilino }).perfil;
    avisar('');
    pintarEstado();
    pintarRequisitos();
  });
}
