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
import { acunarCodigo, guardarEdicion, guardarPropiedadNueva, explicarFallo } from './gestion-alta';
import { baseDe, entradaDe, revisarAlta, type BaseEdicion, type EntradaAlta } from '../lib/domain/alta-propiedad';
import { explicarProblema } from '../lib/domain/catalogo';
import { TOPE_IMAGENES } from '../lib/media-subida';
import { urlMedia } from '../lib/media';
import { montarExportInmuebles, montarInmuebles } from './gestion-inmuebles';
import { montarLiquidacion } from './gestion-liquidacion';
import { montarAltaContrato, montarContratos, montarPagos, montarRegistroPago } from './gestion-contratos';
import { montarDocumentos, montarFormularioDocumento } from './gestion-documentos';
import { montarFormularioVenta, montarVentas } from './gestion-ventas';
import { montarPanelPerfiles, montarPerfiles } from './gestion-perfiles';
import { montarExpedientes, montarFormularios, montarNovedades } from './gestion-novedades';
import type { Propiedad } from '../lib/domain/propiedades';

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

/**
 * `null` = alta nueva. Con valor = se está EDITANDO ese inmueble, y `version` es el testigo que se
 * leyó al abrirlo: si al guardar la de la base es otra, alguien tocó el documento entretanto.
 */
let edicion: BaseEdicion | null = null;

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

/** Vuelca una entrada en los campos. El camino inverso de `leerEntrada`. */
function escribirEntrada(e: EntradaAlta): void {
  for (const [k, v] of Object.entries(e)) {
    if (k === 'imagenes' || k === 'amenidades') continue;
    const campo = $(`a-${k}`) as HTMLInputElement | null;
    if (campo) campo.value = v == null ? '' : String(v);
  }
  const radio = document.querySelector<HTMLInputElement>(`input[name="estado"][value="${e.estado}"]`);
  if (radio) radio.checked = true;
  document.querySelectorAll('.gx-estado').forEach((l) => {
    l.classList.toggle('is-on', !!l.querySelector<HTMLInputElement>('input')?.checked);
  });

  fotos.length = 0;
  for (const clave of e.imagenes ?? []) fotos.push({ clave, previa: '', estado: 'lista' });

  amenidades.clear();
  for (const [a, puesta] of Object.entries(e.amenidades ?? {})) if (puesta) amenidades.add(a);
  document.querySelectorAll<HTMLButtonElement>('.gx-chip').forEach((b) => {
    b.setAttribute('aria-pressed', String(amenidades.has(b.dataset.amenidad ?? '')));
  });
}

/** Deja el formulario como recién abierto. Sin esto, un alta después de una edición hereda sus fotos. */
function limpiarFormulario(): void {
  escribirEntrada({
    operacion: 'venta', tipo: 'apartamento', vertical: '', estado: 'borrador', titulo: '',
    descripcion: '', ciudad: 'Cartagena de Indias', barrio: '', imagenes: [], amenidades: {},
  } as EntradaAlta);
  const msg = $('gx-alta-msg');
  if (msg) msg.textContent = '';
  limpiarErrores();
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

/** Encabezado y botón, que cambian según se esté creando o editando. */
function tituloPantalla(titulo: string, sub: string, boton: string): void {
  const h = document.querySelector<HTMLElement>('#gx-vista-alta .gx-greet');
  const p = document.querySelector<HTMLElement>('#gx-vista-alta .gx-sub');
  const b = $('gx-alta-guardar');
  if (h) h.textContent = titulo;
  if (p) p.textContent = sub;
  if (b) b.textContent = boton;
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

  const vistaInmuebles = $('gx-vista-inmuebles');
  const vistaContratos = $('gx-vista-contratos');

  /** Solo una vista visible a la vez. `null` = volver al panel. */
  const vistaNovedades = $('gx-vista-novedades');
  const vistaDocumentos = $('gx-vista-documentos');
  const vistaVentas = $('gx-vista-ventas');
  const vistaPerfiles = $('gx-vista-perfiles');
  const vistaLiquidacion = $('gx-vista-liquidacion');
  const ver = (
    cual:
      | 'alta' | 'inmuebles' | 'contratos' | 'novedades' | 'documentos' | 'ventas' | 'perfiles'
      | 'liquidacion' | null,
  ) => {
    vistaPanel.hidden = cual !== null;
    vistaAlta.hidden = cual !== 'alta';
    if (vistaInmuebles) vistaInmuebles.hidden = cual !== 'inmuebles';
    if (vistaContratos) vistaContratos.hidden = cual !== 'contratos';
    if (vistaNovedades) vistaNovedades.hidden = cual !== 'novedades';
    if (vistaDocumentos) vistaDocumentos.hidden = cual !== 'documentos';
    if (vistaVentas) vistaVentas.hidden = cual !== 'ventas';
    if (vistaPerfiles) vistaPerfiles.hidden = cual !== 'perfiles';
    if (vistaLiquidacion) vistaLiquidacion.hidden = cual !== 'liquidacion';
    if (cual === 'alta') {
      ajustarPorOperacion();
      pintarAviso();
    }
    window.scrollTo({ top: 0 });
  };

  // Los DOS botones «+ Nuevo inmueble» (el del panel y el del listado) abren lo mismo.
  document.querySelectorAll('.gx-new').forEach((b) => b.addEventListener('click', async () => {
    /*
     * Guarda de rol DENTRO del botón. Antes esta protección la daba, por accidente, el hecho de no
     * cablear nada para quien solo consulta — y eso dejaba también el MENÚ muerto. Ahora la
     * navegación se monta para todos y la restricción vive donde le toca: en la acción concreta.
     * No es la frontera (esa son las Rules): es que la interfaz no ofrezca lo que la base va a negar.
     */
    if (document.body.dataset.puedeEditar === 'false') return;
    edicion = null;
    limpiarFormulario();
    tituloPantalla('Nuevo inmueble', 'Se guarda como borrador. Solo sale al portal cuando lo pongas en «Disponible».', 'Guardar inmueble');
    ver('alta');
    pintarAviso();
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
  }));

  // La sección «Inmuebles» de la barra lateral.
  // Se enruta por el ID del item, NUNCA por su posición. El orden del menú es una decisión de diseño
  // y puede cambiar cualquier día; atarlo a un índice hace que reordenarlo abra la pantalla
  // equivocada sin un solo error — pasó al añadir «Contratos», que quedó 2.º y no 3.º.
  const DESTINOS: Record<string, () => void> = {
    resumen: () => ver(null),
    inmuebles: () => {
      ver('inmuebles');
      void montarInmuebles();
    },
    contratos: () => {
      ver('contratos');
      void montarContratos();
      void montarPagos();
    },
    expedientes: () => {
      ver('novedades');
      void montarExpedientes();
      void montarNovedades();
    },
    /*
     * «Leads» NO tiene vista propia: la tabla vive en el Resumen. Antes esta entrada no estaba en el
     * mapa y el enrutador salía por `if (!destino) return` — o sea, pulsarla no hacía NADA. Ahora
     * lleva al Resumen y deja la tabla a la vista, que es lo que la persona esperaba.
     */
    documentos: () => {
      ver('documentos');
      void montarDocumentos();
    },
    ventas: () => {
      ver('ventas');
      void montarVentas();
    },
    perfiles: () => {
      ver('perfiles');
      void montarPerfiles();
    },
    liquidacion: () => {
      ver('liquidacion');
      void montarLiquidacion();
    },
    leads: () => {
      ver(null);
      document.getElementById('gx-table-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  };

  /** Textos de las secciones que aún no existen. Vienen del markup para no duplicarlos aquí. */
  const notasPronto: Record<string, string> = (() => {
    try {
      return JSON.parse(document.getElementById('gx-nav-notas')?.textContent || '{}');
    } catch {
      return {};
    }
  })();
  const notaEl = $('gx-nav-nota');

  document.querySelectorAll<HTMLAnchorElement>('.gx-nav__item').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = a.dataset.nav ?? '';
      const destino = DESTINOS[id];

      /*
       * Sección que todavía no existe: se DICE. Antes esto era un `return` mudo, y un menú que no
       * responde no se distingue de un panel roto — es el «botón fantasma» de §126, que ya costó una
       * vez. El menú no cambia de sitio a propósito: no has ido a ninguna parte.
       */
      if (!destino) {
        if (notaEl) {
          notaEl.textContent = notasPronto[id] || 'Esta sección todavía no está lista.';
          notaEl.hidden = false;
        }
        return;
      }

      if (notaEl) notaEl.hidden = true;
      document.querySelectorAll('.gx-nav__item').forEach((n) => n.classList.remove('is-on'));
      a.classList.add('is-on');
      destino();
    });
  });
  $('gx-inm-volver')?.addEventListener('click', () => ver(null));
  $('gx-ct-volver')?.addEventListener('click', () => ver(null));
  $('gx-nv-volver')?.addEventListener('click', () => ver(null));
  $('gx-doc-volver')?.addEventListener('click', () => ver(null));
  $('gx-vta-volver-panel')?.addEventListener('click', () => ver(null));
  $('gx-pf-volver-panel')?.addEventListener('click', () => ver(null));
  $('gx-liq-volver-panel')?.addEventListener('click', () => ver(null));
  montarAltaContrato();
  montarFormularioDocumento();
  montarFormularioVenta();
  montarPanelPerfiles();
  montarRegistroPago();
  montarFormularios();
  montarExportInmuebles();

  // El listado avisa; esta pantalla es la única que sabe pintar un inmueble.
  document.addEventListener('altorra:editar-inmueble', (ev) => {
    const p = (ev as CustomEvent<Propiedad>).detail;
    if (!p) return;
    edicion = baseDe(p);
    codigo = p.id; // las fotos nuevas van a la carpeta del inmueble, no a una provisional
    escribirEntrada(entradaDe(p));
    limpiarErrores();
    tituloPantalla(p.titulo || p.id, `Editando ${p.id}. El enlace público no cambia aunque cambies el título.`, 'Guardar cambios');
    ver('alta');
    ajustarPorOperacion();
    pintarAviso();
  });
  $('gx-alta-volver')?.addEventListener('click', () => ver(null));
  $('gx-alta-cancelar')?.addEventListener('click', () => ver(null));

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

    const r = edicion
      ? await guardarEdicion(leerEntrada(), edicion)
      : await guardarPropiedadNueva(leerEntrada(), codigo);

    if (btn) {
      btn.disabled = false;
      btn.textContent = edicion ? 'Guardar cambios' : 'Guardar inmueble';
    }
    if (r.ok) {
      if (msg) msg.textContent = edicion ? `Cambios guardados en ${r.propiedad.id}.` : `Guardado como ${r.propiedad.id}.`;
      // El testigo AVANZA tras guardar: si no, un segundo guardado seguido se rechazaría a sí mismo
      // creyendo que otro tocó el documento.
      if (edicion) edicion = { ...edicion, version: r.propiedad._version };
      return;
    }
    if (r.fallo.tipo === 'validacion') pintarErrores(r.fallo.errores);
    if (msg) msg.textContent = explicarFallo(r.fallo);
  });
}
