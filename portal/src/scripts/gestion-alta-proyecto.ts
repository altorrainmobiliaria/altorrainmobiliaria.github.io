/*
 * PANTALLA DEL ALTA DE OBRA NUEVA (§309) — el último tramo de la quinta línea.
 *
 * Tras §308 el dominio y las puertas estaban cerrados y probados, y la colección seguía vacía por
 * una pantalla. Esto es esa pantalla, y nada más: **toda decisión vive en el dominio**
 * (`domain/alta-proyecto.ts`), aquí solo se leen campos y se pintan errores. Si mañana cambia una
 * regla —el «% vendido» sin fuente, el «desde» en 0— cambia allí y esta pantalla se entera sola.
 *
 * ⚠️ Y el aviso de «¿se va a ver?» pregunta a `problemasParaPublicarProyecto`, el MISMO predicado
 * que usan el índice, la ficha y el JSON-LD. No a una copia: dos listas de condiciones que empiezan
 * iguales terminan distintas, y entonces el operador guarda algo que el catálogo descarta en
 * silencio (§103 · §108).
 *
 * 🎨 Sin marcado propio: las filas de tipología se construyen CLONANDO un `<template>`, como las
 * cards del catálogo, y las clases son las del panel (`gx-*`). Todo lo que un script ASIGNE tiene
 * que estar en un bloque global o `verify:css` lo caza (§117).
 */
import { cargarAuth } from './auth';
import { acunarCodigoProyecto, explicarFallo, guardarProyectoNuevo } from './gestion-alta';
import { construirProyecto, type EntradaProyecto, type EntradaTipologia } from '../lib/domain/alta-proyecto';
import { explicarProblemaProyecto, problemasParaPublicarProyecto } from '../lib/domain/proyectos';
import { TIPOS_PUBLICOS, etiquetaTipo } from '../lib/domain/shared';

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => ($(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';

/** Cuántas filas de tipología nacen con el formulario. Tres es lo que suele traer un proyecto real. */
const FILAS_INICIALES = 3;

let codigo = '';

/** Las filas del DOM → lo que el dominio sabe leer. */
function leerTipologias(): EntradaTipologia[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.gx-tip')).map((fila) => ({
    nombre: (fila.querySelector('[data-c=nombre]') as HTMLInputElement | null)?.value ?? '',
    tipo: (fila.querySelector('[data-c=tipo]') as HTMLSelectElement | null)?.value ?? '',
    areaM2: (fila.querySelector('[data-c=areaM2]') as HTMLInputElement | null)?.value ?? '',
    habitaciones: (fila.querySelector('[data-c=habitaciones]') as HTMLInputElement | null)?.value ?? '',
    banos: (fila.querySelector('[data-c=banos]') as HTMLInputElement | null)?.value ?? '',
    desde: (fila.querySelector('[data-c=desde]') as HTMLInputElement | null)?.value ?? '',
    disponibles: (fila.querySelector('[data-c=disponibles]') as HTMLInputElement | null)?.value ?? '',
  }));
}

export function leerFormularioProyecto(): EntradaProyecto {
  return {
    nombre: val('p-proyecto'),
    constructora: val('p-constructora'),
    licenciaConstruccion: val('p-licencia'),
    curaduria: val('p-curaduria'),
    estadoObra: val('p-estadoObra'),
    // Un `<input type=month>` da `2027-03`; el dominio quiere algo que `Date.parse` entienda.
    entregaEstimada: val('p-entrega') ? `${val('p-entrega')}-01` : '',
    descripcion: val('p-descripcion'),
    ciudad: val('p-ciudad'),
    barrio: val('p-barrio'),
    cuotaInicialPct: val('p-cuota'),
    subsidio: ($('p-subsidio') as HTMLInputElement | null)?.checked === true,
    salaDireccion: val('p-sala-dir'),
    salaHorario: val('p-sala-hor'),
    vendidoPct: val('p-vendido'),
    vendidoFuente: val('p-vendido-fuente'),
    estado: val('p-estado'),
    imagenes: [],
    tipologias: leerTipologias(),
  };
}

/** Una fila de tipología, clonada del template. Nunca `innerHTML` (§31). */
function filaTipologia(): HTMLElement {
  const tpl = $('tpl-gx-tip') as HTMLTemplateElement | null;
  if (!tpl) throw new Error('falta el template de tipología');
  const frag = tpl.content.cloneNode(true) as DocumentFragment;
  const fila = frag.querySelector('.gx-tip') as HTMLElement;
  // ⚠️ Casteo VÍA `unknown` a propósito: los tipos de Workers PISAN los del navegador y
  // `HTMLSelectElement` no satisface ese `HTMLElement` fusionado ([[L-54]] · §174). `HTMLInputElement`
  // sí, y por eso los de arriba no lo necesitan. La doctrina lo predijo; el typecheck lo cobró.
  const sel = fila.querySelector('[data-c=tipo]') as unknown as HTMLSelectElement;
  for (const t of TIPOS_PUBLICOS) {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = etiquetaTipo(t);
    sel.appendChild(o); // appendChild, NUNCA append: los tipos de Workers pisan los del navegador (L-54)
  }
  fila.querySelector('[data-quitar]')?.addEventListener('click', () => {
    fila.remove();
    pintarAvisoProyecto();
  });
  return fila;
}

/**
 * «¿Esto se va a ver?», respondido en todo momento.
 *
 * Se recalcula con cada tecla y no al pulsar Guardar: esconder la respuesta hasta el final es
 * esconderla a propósito, y el operador necesita saber si le falta la licencia ANTES de rellenar
 * tres tipologías.
 */
export function pintarAvisoProyecto(): void {
  const caja = $('gx-pry-aviso');
  if (!caja) return;
  const r = construirProyecto(leerFormularioProyecto(), { codigo: codigo || 'PRY-000000-0000', ahora: new Date() });

  if (!r.ok) {
    caja.hidden = false;
    caja.textContent = `Faltan datos: ${r.errores.map((e) => e.mensaje).join(' ')}`;
    return;
  }
  const problemas = problemasParaPublicarProyecto(r.proyecto);
  caja.hidden = false;
  caja.textContent = problemas.length
    ? `Se guarda, pero NO saldrá al portal: ${problemas.map(explicarProblemaProyecto).join(' ')}`
    : 'Listo: con estos datos el proyecto SÍ sale al portal.';
}

export function montarAltaProyecto(ver: (cual: string | null) => void): void {
  const form = $('gx-pry-form') as HTMLFormElement | null;
  const cajaTips = $('gx-pry-tips');
  if (!form || !cajaTips) return;

  const nuevasFilas = (n: number) => {
    for (let i = 0; i < n; i++) cajaTips.appendChild(filaTipologia());
  };

  document.querySelectorAll('.gx-new-pry').forEach((b) =>
    b.addEventListener('click', async () => {
      // Misma guarda de rol que el alta de inmuebles: la interfaz no ofrece lo que la base va a negar.
      // No es la frontera —esa son las Rules—, es no prometer lo que no se puede cumplir.
      if (document.body.dataset.puedeEditar === 'false') return;
      form.reset();
      cajaTips.replaceChildren();
      nuevasFilas(FILAS_INICIALES);
      ver('alta-pry');
      pintarAvisoProyecto();
      if (codigo) return;
      const msg = $('gx-pry-msg');
      const r = await acunarCodigoProyecto();
      if (r.ok) {
        codigo = r.codigo;
        if (msg) msg.textContent = `Código ${codigo}.`;
      } else if (msg) {
        msg.textContent = explicarFallo(r.fallo);
      }
    }),
  );

  $('gx-pry-add-tip')?.addEventListener('click', () => {
    nuevasFilas(1);
    pintarAvisoProyecto();
  });
  $('gx-pry-volver')?.addEventListener('click', () => ver(null));
  $('gx-pry-cancelar')?.addEventListener('click', () => ver(null));
  form.addEventListener('input', () => pintarAvisoProyecto());

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const msg = $('gx-pry-msg');
    const btn = $('gx-pry-guardar') as HTMLButtonElement | null;
    if (!codigo) {
      if (msg) msg.textContent = 'Todavía no hay código. Vuelve a abrir el formulario.';
      return;
    }
    if (btn) btn.disabled = true;
    const r = await guardarProyectoNuevo(leerFormularioProyecto(), codigo);
    if (btn) btn.disabled = false;

    if (r.ok) {
      codigo = ''; // el siguiente alta acuña el suyo
      if (msg) msg.textContent = `Guardado ${r.proyecto.id}.`;
      ver(null);
      return;
    }
    if (msg) msg.textContent = explicarFallo(r.fallo);
  });
}
