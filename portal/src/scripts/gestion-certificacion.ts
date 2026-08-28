/*
 * CERTIFICACIÓN ANUAL AL PROPIETARIO — la puerta que le faltaba a `domain/certificacion.ts`
 * (§168 · §222 · ADR §233).
 *
 * QUÉ ES. **No es un informe nuestro: es un insumo de la declaración de OTRA persona.** El
 * D.1625/2016 art. 1.2.4.11 dice que el mandante declara esos ingresos «según la información que le
 * suministre el mandatario». Entregársela es obligación de ALTORRA, y el papel que sale de aquí se
 * lo pasa a su contador. Todo lo demás se deduce de eso.
 *
 * 🧾 DE DÓNDE SALEN LOS MESES, y por qué no del contrato. Los períodos se leen de `pagos` —los
 * `payout_propietario` que de verdad se giraron—, no de recorrer doce meses del calendario. Un año
 * puede empezar en marzo, y un certificado que dice «enero a diciembre» sumando nueve meses es un
 * documento que PARECE correcto y hace daño.
 *
 * 🔍 EL CONTRASTE QUE HACE ESTA PANTALLA, y que es su parte más valiosa. El desglose por mes (cuota
 * de copropiedad, honorarios, IVA, retención) **no está guardado**: solo se guarda el monto girado.
 * Así que se RECALCULA con las condiciones del contrato… y eso tiene un riesgo real: si el canon
 * subió por IPC a mitad de año, aplicar las condiciones de hoy a enero miente. En vez de callarlo,
 * cada mes se compara contra el giro que quedó REGISTRADO, y los que no cuadran se dicen con su
 * diferencia. *Un riesgo silencioso convertido en una línea que se lee.*
 *
 * 🖨️ SE IMPRIME, no genera un PDF. Montar una tubería de PDF sería plantilla, almacenamiento y su
 * gate, código nuevo para un documento que el navegador ya sabe producir.
 *
 * ⚖️ NO lleva la fórmula «bajo la gravedad del juramento»: el módulo de dominio ya dejó dicho que
 * ese inciso no aparece en el texto que se pudo leer del artículo, y una fórmula jurídica sin
 * verificar no se imprime en un papel que firma la empresa (§3.3). Su ausencia es una decisión.
 */

import {
  certificar,
  explicarProblemaCertificacion,
  mesesFaltantes,
  problemasDeCertificacion,
  type Certificacion,
  type MesCertificado,
} from '../lib/domain/certificacion';
import { liquidarPeriodo, type Liquidacion } from '../lib/domain/liquidacion';
import { pesos } from '../lib/domain/dinero';
import { SITE } from '../lib/config/site';
import { mesDePeriodo } from '../lib/domain/meses-es';
import type { Contrato, Pago } from '../lib/domain/gestion';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value.trim() ?? '';


/** `2026-03` → «marzo». El nombre del mes vive en `domain/meses-es.ts`, su dueño único. */
export const mesEnLetras = mesDePeriodo;

/** Un mes cuyo giro calculado NO coincide con el que quedó registrado. */
export interface Descuadre {
  periodo: string;
  calculado: number;
  registrado: number;
}

/**
 * Arma los meses a certificar a partir de los pagos REALES, y de paso denuncia los que no cuadran.
 *
 * Se ordena por período aquí además de en el dominio: `certificar()` ya no confía en el orden de
 * entrada, pero los descuadres se leen en orden cronológico o no se leen.
 */
export function mesesDesdePagos(
  contrato: Contrato,
  pagos: Pago[],
  anio: string,
): { meses: MesCertificado[]; descuadres: Descuadre[] } {
  const liquidacion: Liquidacion = liquidarPeriodo({
    canon: contrato.canon ?? 0,
    administracionPH: contrato.administracion,
    adminIncluidaEnCanon: contrato.adminIncluidaEnCanon,
    // Porcentaje → fracción, igual que en la liquidación mensual: el contrato guarda 10 y el
    // dominio calcula con 0.10 (ver la nota de `Contrato.honorariosPct`).
    honorariosPct: contrato.honorariosPct === undefined ? undefined : contrato.honorariosPct / 100,
    ivaSobreHonorarios: contrato.ivaSobreHonorarios,
    arrendatarioEsAgenteRetencion: false,
  });

  const delAnio = pagos
    .filter((p) => p.tipo === 'payout_propietario' && (p.periodo ?? '').startsWith(`${anio}-`))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  const meses: MesCertificado[] = delAnio.map((p) => ({ periodo: p.periodo, liquidacion }));
  const descuadres: Descuadre[] = delAnio
    .map((p) => ({
      periodo: p.periodo,
      calculado: liquidacion.giroAlPropietario,
      registrado: p.montoRecibido ?? p.montoEsperado ?? 0,
    }))
    .filter((d) => d.calculado !== d.registrado);

  return { meses, descuadres };
}

const linea = (concepto: string, detalle: string, monto: number, apagada = false): HTMLElement => {
  const fila = document.createElement('div');
  fila.className = 'gx-cf__fila';
  const izq = document.createElement('div');
  const t = document.createElement('span');
  t.className = 'gx-cf__concepto';
  t.textContent = concepto;
  const d = document.createElement('span');
  d.className = 'gx-cf__detalle';
  d.textContent = detalle;
  izq.appendChild(t); izq.appendChild(d);
  const v = document.createElement('span');
  v.className = apagada ? 'gx-cf__monto gx-cf__monto--off' : 'gx-cf__monto';
  v.textContent = pesos(monto);
  fila.appendChild(izq); fila.appendChild(v);
  return fila;
};

function pintar(
  c: Certificacion,
  contrato: Contrato,
  anio: string,
  descuadres: Descuadre[],
): DocumentFragment {
  const frag = document.createDocumentFragment();

  const cabecera = document.createElement('p');
  cabecera.className = 'gx-cf__certifica';
  cabecera.textContent =
    `ALTORRA Inmobiliaria, NIT ${c.mandatario.documento}, en calidad de mandatario, hace constar los ` +
    `ingresos recibidos y los pagos efectuados por cuenta de ${c.mandante.nombre}, documento ` +
    `${c.mandante.documento}, entre ${mesEnLetras(c.desde)} y ${mesEnLetras(c.hasta)} de ${anio}, en ` +
    `desarrollo del contrato de mandato ${contrato.id}.`;
  frag.appendChild(cabecera);

  frag.appendChild(
    linea(
      'Ingresos recibidos por su cuenta',
      'Solo el canon. NO incluye la cuota de administración: ésa nunca fue ingreso suyo, pasó por ' +
        'nosotros camino de la copropiedad. Sumarla le inflaría la base gravable.',
      c.ingresosRecibidos,
    ),
  );
  frag.appendChild(
    linea('Cuota de copropiedad', '→ a la administración del edificio.', c.detallePagos.cuotaCopropiedad),
  );
  frag.appendChild(
    linea('Honorarios de administración', '→ a ALTORRA. Es gasto deducible del inmueble.', c.detallePagos.honorarios),
  );
  frag.appendChild(
    linea('IVA sobre los honorarios', '→ a la DIAN, facturado por ALTORRA.', c.detallePagos.ivaHonorarios),
  );
  frag.appendChild(
    linea(
      'Retenciones practicadas y giradas',
      c.retencionesPracticadas
        ? '→ a la DIAN, por cuenta suya.'
        : 'Ninguna este año: el arrendatario no es agente de retención, así que no hubo qué practicar.',
      c.retencionesPracticadas,
      !c.retencionesPracticadas,
    ),
  );

  const total = document.createElement('div');
  total.className = 'gx-cf__total';
  const et = document.createElement('span');
  et.textContent = `Neto girado al propietario · ${c.meses} mes(es)`;
  const vt = document.createElement('strong');
  vt.textContent = pesos(c.netoGirado);
  total.appendChild(et); total.appendChild(vt);
  frag.appendChild(total);

  // 🔍 Los meses que no cuadran, dichos con su diferencia.
  if (descuadres.length) {
    const aviso = document.createElement('div');
    aviso.className = 'gx-aviso';
    const t = document.createElement('strong');
    t.textContent = `${descuadres.length} mes(es) no cuadran con el giro registrado.`;
    const p = document.createElement('p');
    p.textContent =
      'El desglose se recalcula con las condiciones ACTUALES del contrato, así que si el canon ' +
      'cambió durante el año estos meses hay que revisarlos antes de entregar el papel: ' +
      descuadres
        .map((d) => `${mesEnLetras(d.periodo)} (calculado ${pesos(d.calculado)}, registrado ${pesos(d.registrado)})`)
        .join(' · ');
    aviso.appendChild(t); aviso.appendChild(p);
    frag.appendChild(aviso);
  }

  const nota = document.createElement('p');
  nota.className = 'gx-hint';
  nota.textContent =
    'Este certificado no lleva la fórmula «bajo la gravedad del juramento»: ese inciso no aparece en ' +
    'el texto del D.1625/2016 art. 1.2.4.11 que se pudo verificar, y una fórmula jurídica sin ' +
    'comprobar no se imprime en un papel que firma la empresa. Su ausencia es una decisión.';
  frag.appendChild(nota);

  return frag;
}

/** Contratos + pagos que ya cargó la vista. Se guardan para no releer Firestore por cada cambio. */
let CONTRATOS: Contrato[] = [];
let PAGOS: Pago[] = [];

/** Los años que de verdad tienen giros. Ofrecer 2019 cuando no hay nada es ruido. */
export function aniosConPagos(pagos: Pago[]): string[] {
  const set = new Set(
    pagos.filter((p) => p.tipo === 'payout_propietario').map((p) => (p.periodo ?? '').slice(0, 4)),
  );
  return [...set].filter(Boolean).sort().reverse();
}

function armar(): void {
  const salida = $('gx-cf-salida');
  const cobertura = $('gx-cf-cobertura');
  const imprimir = $('gx-cf-imprimir');
  if (!salida) return;

  const contrato = CONTRATOS.find((c) => c.id === val('gx-cf-contrato'));
  const anio = val('gx-cf-ano');
  if (!contrato || !anio) return;

  const { meses, descuadres } = mesesDesdePagos(contrato, PAGOS, anio);
  const cert = certificar(
    { nombre: SITE.legalName, documento: SITE.nit },
    {
      nombre: contrato.partes?.propietario?.nombre ?? '',
      documento: val('gx-cf-nit') || (contrato.partes?.propietario?.documento ?? ''),
    },
    meses,
  );

  const problemas = problemasDeCertificacion(cert);
  const faltan = mesesFaltantes(cert);

  if (cobertura) {
    cobertura.textContent = cert.meses
      ? `Cubre ${mesEnLetras(cert.desde)} a ${mesEnLetras(cert.hasta)} · ${cert.meses} mes(es)` +
        (faltan.length ? ` · faltan ${faltan.map(mesEnLetras).join(', ')}` : '')
      : '';
  }

  salida.textContent = '';
  if (problemas.length) {
    const aviso = document.createElement('div');
    aviso.className = 'gx-aviso';
    const t = document.createElement('strong');
    // `periodos-repetidos` es el único que produce un papel impecable Y hace daño: duplica un
    // ingreso en la declaración de otra persona. Por eso bloquea en vez de avisar.
    t.textContent = problemas.includes('periodos-repetidos')
      ? 'No se puede emitir: hay un mes repetido.'
      : 'Todavía no se puede emitir.';
    const p = document.createElement('p');
    p.textContent = problemas.map(explicarProblemaCertificacion).join(' ');
    aviso.appendChild(t); aviso.appendChild(p);
    salida.appendChild(aviso);
    if (imprimir) imprimir.hidden = true;
    return;
  }

  salida.appendChild(pintar(cert, contrato, anio, descuadres));
  if (imprimir) imprimir.hidden = false;
}

/** Cablea el bloque con los contratos y pagos que la vista de liquidación ya tiene en la mano. */
export function montarCertificacion(contratos: Contrato[], pagos: Pago[]): void {
  CONTRATOS = contratos;
  PAGOS = pagos;

  const selC = $('gx-cf-contrato') as HTMLSelectElement | null;
  const selA = $('gx-cf-ano') as HTMLSelectElement | null;
  if (!selC || !selA) return;

  selC.textContent = '';
  for (const c of contratos) {
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = `${c.id} · ${c.partes?.propietario?.nombre ?? 'sin propietario'}`;
    selC.appendChild(o);
  }

  selA.textContent = '';
  const anios = aniosConPagos(pagos);
  if (!anios.length) {
    const o = document.createElement('option');
    o.value = '';
    o.textContent = 'Todavía no hay giros registrados';
    selA.appendChild(o);
    selA.disabled = true;
  } else {
    selA.disabled = false;
    for (const a of anios) {
      const o = document.createElement('option');
      o.value = a;
      o.textContent = a;
      selA.appendChild(o);
    }
  }

  $('gx-cf-armar')?.addEventListener('click', armar);
  $('gx-cf-imprimir')?.addEventListener('click', () => window.print());
}
