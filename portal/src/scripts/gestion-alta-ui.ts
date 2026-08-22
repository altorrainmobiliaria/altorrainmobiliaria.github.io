/*
 * PANTALLA «NUEVO INMUEBLE» — el cableado del formulario (§108).
 *
 * Réplica del mockup `ALTORRA Gestion-Alta.dc.html`, aprobado por Daniel el 2026-08-22.
 *
 * Este módulo es SOLO pegamento: lee el formulario, llama al dominio y pinta lo que el dominio
 * responde. Ni una regla de negocio vive aquí — ni qué es obligatorio, ni cómo se acuña el código, ni
 * qué hace que un inmueble se vea. Todo eso está en `domain/alta-propiedad.ts` y en
 * `domain/catalogo.ts`, con tests. Si una condición aparece escrita en este archivo, es un bug: sería
 * una segunda copia de la verdad, que es exactamente cómo nació §103.
 *
 * LAS FOTOS SE CONVIERTEN AQUÍ. El endpoint solo acepta WebP a propósito: el navegador ya tiene un
 * canvas y lo hace gratis, mientras convertir en el Worker costaría CPU en cada subida. De paso se
 * reescalan — una foto de móvil son 4000 px y en la ficha se ven 1600 como mucho.
 */

import { cargarAuth } from './auth';
import { acunarCodigo, guardarPropiedadNueva, explicarFallo } from './gestion-alta';
import { revisarAlta, type EntradaAlta } from '../lib/domain/alta-propiedad';
import { explicarProblema } from '../lib/domain/catalogo';
import { TOPE_IMAGENES } from '../lib/media-subida';
import { urlMedia } from '../lib/media';

/** Lado mayor del derivado. Más allá de esto no se gana nitidez visible y sí peso. */
const LADO_MAX = 1600;
/** Calidad WebP. 0.82 es el punto donde una foto de inmueble deja de mejorar a ojo. */
const CALIDAD = 0.82;

interface FotoEnCurso {
  /** Clave de R2 una vez subida; vacía mientras sube. */
  clave: string;
  /** Vista previa local (objectURL) mientras no hay clave. */
  previa: string;
  estado: 'subiendo' | 'lista' | 'fallo';
}

const fotos: FotoEnCurso[] = [];
const amenidades = new Set<string>();

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value ?? '';

/** Lo que hay ahora mismo en el formulario, tal cual, sin interpretar. */
function leerEntrada(): EntradaAlta {
  const campos = [
    'operacion', 'tipo', 'vertical', 'titulo', 'descripcion', 'ciudad', 'barrio', 'rnt',
    'lat', 'lng', 'valorVenta', 'canon', 'administracion', 'precioNoche',
    'habitaciones', 'banos', 'areaConstruidaM2', 'estrato', 'parqueaderos', 'piso',
  ] as const;
  const e = Object.fromEntries(campos.map((c) => [c, val(`a-${c}`)])) as unknown as EntradaAlta;
  e.estado = (document.querySelector<HTMLInputElement>('input[name="estado"]:checked')?.value) || 'borrador';
  e.imagenes = fotos.filter((f) => f.estado === 'lista').map((f) => f.clave);
  e.amenidades = Object.fromEntries([...amenidades].map((a) => [a, true]));
  return e;
}

// ─────────────────────────────────────────────────────────────────────────────
// PINTAR — sin `innerHTML` en ningún sitio: los textos van por `textContent`
// ─────────────────────────────────────────────────────────────────────────────

function limpiarErrores(): void {
  document.querySelectorAll('.gx-err').forEach((n) => n.remove());
  document.querySelectorAll('.alt-input.is-mal').forEach((n) => n.classList.remove('is-mal'));
}

function pintarErrores(errores: Array<{ campo: string; mensaje: string }>): void {
  limpiarErrores();
  for (const e of errores) {
    const campo = $(`a-${e.campo}`) ?? $(`a-${e.campo === 'imagenes' ? 'fotos' : e.campo}`);
    const p = document.createElement('p');
    p.className = 'gx-err';
    p.textContent = e.mensaje;
    if (campo) {
      campo.classList.add('is-mal');
      campo.insertAdjacentElement('afterend', p);
    } else {
      // Sin campo al que colgarse (p.ej. las fotos) el mensaje va al pie, no se pierde.
      $('gx-alta-msg')?.appendChild(p);
    }
  }
}

/**
 * El aviso de arriba: si se vería y, si no, por qué.
 *
 * Lo interesante no es el texto sino de dónde sale: `revisarAlta` le pregunta a los mismos predicados
 * que usa el índice del catálogo. Cuando esto dice «se verá», el listado NO lo puede omitir — hay un
 * test que lo fija en las dos direcciones.
 */
function pintarAviso(): void {
  const caja = $('gx-alta-aviso');
  if (!caja) return;
  const r = revisarAlta(leerEntrada(), new Date());
  caja.replaceChildren();
  caja.hidden = false;

  const cuerpo = document.createElement('div');
  const t = document.createElement('p');
  t.className = 'gx-aviso__t';

  if (r.seVeria) {
    t.textContent = 'Listo: al guardarlo aparecerá en el portal.';
    cuerpo.appendChild(t);
  } else {
    t.textContent = 'Todavía no se vería en el portal';
    cuerpo.appendChild(t);
    const ul = document.createElement('ul');
    const razones = r.errores.length ? r.errores.map((e) => e.mensaje) : r.problemas.map(explicarProblema);
    for (const razon of razones) {
      const li = document.createElement('li');
      li.textContent = razon;
      ul.appendChild(li);
    }
    cuerpo.appendChild(ul);
  }
  caja.appendChild(cuerpo);
}

function pintarFotos(): void {
  const cont = $('gx-alta-fotos');
  if (!cont) return;
  cont.replaceChildren(
    ...fotos.map((f, i) => {
      const div = document.createElement('div');
      div.className = 'gx-foto';
      if (f.estado === 'subiendo') {
        div.classList.add('gx-foto--subiendo');
        const s = document.createElement('span');
        s.textContent = 'Subiendo…';
        div.appendChild(s);
        return div;
      }
      const img = document.createElement('img');
      img.src = f.estado === 'lista' ? urlMedia(f.clave) : f.previa;
      img.alt = '';
      div.appendChild(img);
      if (i === 0) {
        const sello = document.createElement('span');
        sello.className = 'gx-foto__sello';
        sello.textContent = 'PORTADA';
        div.appendChild(sello);
      }
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'gx-foto__x';
      x.textContent = '×';
      x.setAttribute('aria-label', `Quitar la foto ${i + 1}`);
      x.addEventListener('click', () => {
        fotos.splice(i, 1);
        pintarFotos();
        pintarAviso();
      });
      div.appendChild(x);
      return div;
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOTOS — convertir en el navegador y subir
// ─────────────────────────────────────────────────────────────────────────────

/** Archivo del disco → Blob WebP reescalado. Devuelve `null` si el navegador no sabe hacer WebP. */
async function aWebp(file: File): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const lienzo = document.createElement('canvas');
  lienzo.width = w;
  lienzo.height = h;
  lienzo.getContext('2d')?.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((res) => lienzo.toBlob((b) => res(b && b.type === 'image/webp' ? b : null), 'image/webp', CALIDAD));
}

/** Sube una foto y devuelve su CLAVE de R2 (`props/<CÓDIGO>/N.webp`), o `null` si falló. */
async function subir(blob: Blob, codigo: string, indice: number, token: string): Promise<string | null> {
  const resp = await fetch(`/api/media/subir?propiedad=${encodeURIComponent(codigo)}&n=${indice}`, {
    method: 'POST',
    headers: { 'content-type': 'image/webp', authorization: `Bearer ${token}` },
    body: blob,
  }).catch(() => null);
  if (!resp?.ok) return null;
  const j = (await resp.json().catch(() => null)) as { clave?: string } | null;
  return j?.clave ?? null;
}

async function tokenActual(): Promise<string | null> {
  const { auth } = await cargarAuth();
  return (await auth.currentUser?.getIdToken()) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTAJE
// ─────────────────────────────────────────────────────────────────────────────

/** Muestra solo los campos de la operación elegida (precio y RNT). */
function ajustarPorOperacion(): void {
  const op = val('a-operacion');
  document.querySelectorAll<HTMLElement>('[data-solo]').forEach((n) => {
    n.hidden = n.dataset.solo !== op;
  });
}

export function montarAlta(): void {
  const vistaPanel = $('gx-vista-panel');
  const vistaAlta = $('gx-vista-alta');
  const form = $<HTMLFormElement>('gx-alta-form');
  if (!vistaPanel || !vistaAlta || !form) return;

  /*
   * El CÓDIGO se acuña al ABRIR, no al guardar.
   *
   * Las fotos se suben a `props/<CÓDIGO>/N.webp` mientras la persona rellena el formulario, así que el
   * código tiene que existir antes que ellas. Acuñarlo al guardar dejaría la galería colgando de una
   * carpeta provisional: no falla en el momento —la foto se ve— y por eso es de los errores que se
   * descubren tarde. El precio es que un formulario abandonado quema un número, y un hueco en la
   * secuencia no le hace daño a nadie.
   */
  let codigo = '';

  const ver = (alta: boolean) => {
    vistaPanel.hidden = alta;
    vistaAlta.hidden = !alta;
    if (alta) {
      ajustarPorOperacion();
      pintarAviso();
      window.scrollTo({ top: 0 });
    }
  };

  document.querySelector('.gx-new')?.addEventListener('click', async () => {
    ver(true);
    if (codigo) return;
    const msg = $('gx-alta-msg');
    const r = await acunarCodigo();
    if (r.ok) {
      codigo = r.codigo;
      if (msg) msg.textContent = `Código asignado: ${codigo}`;
      return;
    }
    // Sin código no se pueden subir fotos ni guardar. Se dice, en vez de dejar que el primer intento
    // de subida falle con un mensaje que no explica nada.
    if (msg) msg.textContent = `No se pudo asignar el código del inmueble. ${explicarFallo(r.fallo)}`;
  });
  $('gx-alta-volver')?.addEventListener('click', () => ver(false));
  $('gx-alta-cancelar')?.addEventListener('click', () => ver(false));

  // El aviso se recalcula con cada tecla: la pregunta «¿esto se va a ver?» tiene respuesta en todo
  // momento, así que esconderla hasta pulsar Guardar sería esconderla a propósito.
  form.addEventListener('input', () => {
    ajustarPorOperacion();
    pintarAviso();
  });
  form.addEventListener('change', () => {
    document.querySelectorAll('.gx-estado').forEach((l) => {
      l.classList.toggle('is-on', !!l.querySelector<HTMLInputElement>('input')?.checked);
    });
    pintarAviso();
  });

  $('gx-alta-amenidades')?.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>('.gx-chip');
    if (!btn) return;
    const a = btn.dataset.amenidad ?? '';
    const puesta = amenidades.has(a);
    if (puesta) amenidades.delete(a);
    else amenidades.add(a);
    btn.setAttribute('aria-pressed', String(!puesta));
  });

  $<HTMLInputElement>('a-fotos')?.addEventListener('change', async (ev) => {
    const input = ev.target as HTMLInputElement;
    const elegidas = [...(input.files ?? [])];
    input.value = ''; // permite volver a elegir el MISMO archivo si la subida falló
    if (!codigo) {
      pintarErrores([{ campo: 'imagenes', mensaje: 'Todavía no hay código de inmueble asignado. Vuelve al panel y entra de nuevo.' }]);
      return;
    }
    const token = await tokenActual();
    if (!token) {
      pintarErrores([{ campo: 'imagenes', mensaje: 'Tu sesión caducó. Recarga la página y vuelve a entrar.' }]);
      return;
    }
    for (const file of elegidas) {
      if (fotos.length >= TOPE_IMAGENES) break;
      const hueco: FotoEnCurso = { clave: '', previa: '', estado: 'subiendo' };
      fotos.push(hueco);
      pintarFotos();
      const blob = await aWebp(file).catch(() => null);
      if (!blob) {
        hueco.estado = 'fallo';
        hueco.previa = URL.createObjectURL(file);
        pintarFotos();
        continue;
      }
      const clave = await subir(blob, codigo, fotos.indexOf(hueco) + 1, token);
      if (clave) {
        hueco.clave = clave;
        hueco.estado = 'lista';
      } else {
        hueco.estado = 'fallo';
        hueco.previa = URL.createObjectURL(blob);
      }
      pintarFotos();
      pintarAviso();
    }
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = $<HTMLButtonElement>('gx-alta-guardar');
    const msg = $('gx-alta-msg');
    limpiarErrores();
    if (msg) msg.textContent = '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando…';
    }

    const r = await guardarPropiedadNueva(leerEntrada(), codigo);

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Guardar inmueble';
    }
    if (r.ok) {
      if (msg) msg.textContent = `Guardado como ${r.propiedad.id}.`;
      return;
    }
    if (r.fallo.tipo === 'validacion') pintarErrores(r.fallo.errores);
    if (msg) msg.textContent = explicarFallo(r.fallo);
  });
}
