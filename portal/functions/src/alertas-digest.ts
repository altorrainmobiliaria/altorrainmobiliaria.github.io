// DIGEST DIARIO de alertas guardadas — plomería del ítem 8 de OLA 1 (ADR §96).
//
// Vive SEPARADO de `index.ts` (que solo registra triggers) por la misma razón que `catalogo-rebuild`:
// importar `index.ts` desde un test registraría Cloud Functions de verdad. La lógica de NEGOCIO —qué
// coincide con qué y qué cuenta como novedad— tampoco está aquí: vive en `src/lib/domain/alertas.ts`,
// que es el MISMO módulo que usa el endpoint web. Un solo dueño del contrato.
//
// COSTO POR CORRIDA (free-tier, §3.2):
//   · 3 lecturas de `indices/catalogo-*` (constante, no importa el tamaño del catálogo)
//   · ≤ 200 lecturas de `bajasAlertas` pendientes + ≤ 500 de `alertas` activas
//   · ≤ 90 escrituras (una por correo enviado)
// Con el free-tier de Firestore en 50.000 lecturas/día, una corrida diaria usa ~1,4% del cupo.
//
// TOPES QUE NO SE SILENCIAN: si se toca cualquiera de los dos límites, el reporte lo dice. Un recorte
// callado se lee como «no había nada», que es justo lo contrario de lo que pasó.

import type { Firestore } from 'firebase-admin/firestore';
import {
  seleccionarNovedades,
  resumenCriterios,
  operacionARuta,
  criteriosAQuery,
  formatoPrecio,
  etiquetaOperacion,
  TOPE_ALERTAS_POR_CORRIDA,
  TOPE_CORREOS_POR_CORRIDA,
} from '../../src/lib/domain/alertas';
import type { Alerta, CriteriosAlerta } from '../../src/lib/domain/alertas';
import type { CatalogoResumen } from '../../src/lib/domain/catalogo';
import { CATALOGO_SHARDS, operacionAShard } from '../../src/lib/domain/catalogo';
import { normFecha, refShard } from './catalogo-rebuild';

/** Dominio público. Los enlaces de un correo NUNCA pueden apuntar al staging. */
export const SITE_URL = 'https://altorrainmobiliaria.co';
/** Remitente. Exige el dominio verificado en Resend (gate del dueño; ver el ADR §96). */
export const REMITENTE = 'ALTORRA Inmobiliaria <alertas@altorrainmobiliaria.co>';
/** Tope de bajas pendientes que se aplican por corrida. El resto entra en la siguiente. */
export const TOPE_BAJAS_POR_CORRIDA = 200;

export interface ReporteDigest {
  corridaAt: string;
  bajasAplicadas: number;
  bajasIgnoradas: number;
  alertasLeidas: number;
  conNovedades: number;
  enviados: number;
  fallidos: number;
  /** Correos que TOCABA mandar y no se mandaron por el tope diario. Se reintentan mañana. */
  pospuestos: number;
  topeAlertasTocado: boolean;
  /** Motivo por el que no se envió nada, cuando lo hay. Se REPORTA, nunca se calla. */
  omitido?: 'sin-clave-resend' | 'sin-alertas' | 'sin-novedades';
}

/** Lo que la Function le pasa al digest. Inyectable para poder probarlo sin red ni claves. */
export interface OpcionesDigest {
  apiKeyResend: string;
  /** Inyectable en tests; por defecto el `fetch` global de Node 20. */
  fetchImpl?: typeof fetch;
  /** Inyectable en tests para tener un «ahora» determinista. */
  ahora?: Date;
}

interface CorreoPreparado {
  ref: FirebaseFirestore.DocumentReference;
  alerta: Alerta;
  asunto: string;
  html: string;
  texto: string;
  urlBaja: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BAJAS — se aplican ANTES de preparar nada (revocar tiene prioridad sobre enviar)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica las peticiones de baja pendientes.
 *
 * El token se comprueba AQUÍ y no en el endpoint web porque solo el Admin SDK puede leer `alertas`.
 * Una petición con token que no cuadra se marca `aplicada` igual, con `motivo`: si se dejara pendiente
 * volvería a intentarse cada día para siempre, y una cola que nunca vacía es una cola rota.
 */
export async function aplicarBajas(
  db: Firestore,
  ahoraISO: string,
): Promise<{ aplicadas: number; ignoradas: number }> {
  const pendientes = await db
    .collection('bajasAlertas')
    .where('aplicada', '==', false)
    .limit(TOPE_BAJAS_POR_CORRIDA)
    .get();

  let aplicadas = 0;
  let ignoradas = 0;

  for (const doc of pendientes.docs) {
    const { alertaId, token } = doc.data() as { alertaId?: string; token?: string };
    const refAlerta = alertaId ? db.collection('alertas').doc(alertaId) : null;
    const snap = refAlerta ? await refAlerta.get() : null;
    const alerta = snap?.exists ? (snap.data() as Alerta) : null;

    if (!alerta || !token || alerta.token !== token) {
      await doc.ref.set({ aplicada: true, motivo: 'token-no-coincide', resueltaEn: ahoraISO }, { merge: true });
      ignoradas++;
      continue;
    }

    await refAlerta!.set(
      { estado: 'baja', updatedAt: ahoraISO, _version: (alerta._version ?? 1) + 1 },
      { merge: true },
    );
    await doc.ref.set({ aplicada: true, resueltaEn: ahoraISO }, { merge: true });
    aplicadas++;
  }

  return { aplicadas, ignoradas };
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO — 3 lecturas y ya
// ─────────────────────────────────────────────────────────────────────────────

/** Lee los 3 shards del índice. Un shard que aún no existe es estado-cero legítimo, no un error (§54.4). */
export async function leerCatalogo(db: Firestore): Promise<Map<string, CatalogoResumen[]>> {
  const mapa = new Map<string, CatalogoResumen[]>();
  await Promise.all(
    CATALOGO_SHARDS.map(async (shard) => {
      const snap = await db.doc(refShard(shard)).get();
      const items = snap.exists ? ((snap.data()?.items ?? []) as CatalogoResumen[]) : [];
      mapa.set(shard, items);
    }),
  );
  return mapa;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO DEL CORREO
// ─────────────────────────────────────────────────────────────────────────────

/** Escapa para HTML. Los títulos vienen de datos de propiedades, así que nunca se inyectan crudos. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function asuntoDigest(n: number, c: CriteriosAlerta): string {
  const que = n === 1 ? 'inmueble nuevo' : 'inmuebles nuevos';
  return `${n} ${que} ${etiquetaOperacion(c.operacion)} en tu búsqueda`;
}

/**
 * Cuerpo del correo. SIN IMÁGENES a propósito en esta versión: el `thumb` del índice es una clave de
 * R2 y la base pública se resuelve en el navegador (`PUBLIC_MEDIA_BASE`), no aquí; y un primer correo
 * ligero desde un dominio recién verificado llega mejor que uno cargado de fotos. Cuando el catálogo
 * real entre (TODO-22) se decide si compensa añadirlas.
 */
export function cuerpoDigest(
  alerta: Alerta,
  items: CatalogoResumen[],
  total: number,
  urlBaja: string,
): { html: string; texto: string } {
  const c = alerta.criterios;
  const urlBusqueda = `${SITE_URL}${operacionARuta(c.operacion)}?${criteriosAQuery(c)}`;
  const resumen = resumenCriterios(c);
  const restantes = total - items.length;

  const filasHtml = items
    .map((it) => {
      const url = `${SITE_URL}/ficha?id=${encodeURIComponent(it.id)}`;
      const meta = [it.hab ? `${it.hab} hab` : '', it.ban ? `${it.ban} baños` : '', it.area ? `${it.area} m²` : '']
        .filter(Boolean)
        .join(' · ');
      return `<tr><td style="padding:14px 0;border-bottom:1px solid #e6edf2">
  <a href="${esc(url)}" style="color:#062743;font-size:16px;font-weight:600;text-decoration:none">${esc(it.titulo)}</a>
  <div style="color:#5a6b82;font-size:14px;margin-top:4px">${esc(it.sector || 'Cartagena')}${meta ? ` · ${esc(meta)}` : ''}</div>
  <div style="color:#7d6119;font-size:15px;font-weight:600;margin-top:4px">${esc(formatoPrecio(it.precio, it.operacion))}</div>
</td></tr>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f2f6f9;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px">
  <p style="margin:0 0 4px;color:#7d6119;font-size:12px;letter-spacing:.08em;text-transform:uppercase">ALTORRA Inmobiliaria</p>
  <h1 style="margin:0 0 6px;color:#062743;font-size:22px;font-weight:600">Entró algo que estabas buscando</h1>
  <p style="margin:0 0 20px;color:#5a6b82;font-size:14px">Tu alerta: ${esc(resumen)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filasHtml}</table>
  ${restantes > 0 ? `<p style="margin:18px 0 0;color:#5a6b82;font-size:14px">Y ${restantes} más que también cumplen lo que pediste.</p>` : ''}
  <p style="margin:24px 0 0"><a href="${esc(urlBusqueda)}" style="background:#062743;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;display:inline-block">Ver la búsqueda completa</a></p>
  <p style="margin:28px 0 0;color:#98a9ba;font-size:12px;line-height:1.6">
    Recibes este correo porque guardaste esta búsqueda en nuestro portal.
    <a href="${esc(urlBaja)}" style="color:#7d6119">Darme de baja</a>.<br />
    ALTORRA COMPANY S.A.S. · Cartagena de Indias · Matrícula de Arrendador No. 6636
  </p>
</div>
</body></html>`;

  const texto = [
    'ALTORRA Inmobiliaria',
    'Entró algo que estabas buscando.',
    `Tu alerta: ${resumen}`,
    '',
    ...items.map((it) => `- ${it.titulo} (${it.sector || 'Cartagena'}) ${formatoPrecio(it.precio, it.operacion)}\n  ${SITE_URL}/ficha?id=${it.id}`),
    restantes > 0 ? `\nY ${restantes} más que también cumplen lo que pediste.` : '',
    '',
    `Ver la búsqueda completa: ${urlBusqueda}`,
    `Darme de baja: ${urlBaja}`,
    'ALTORRA COMPANY S.A.S. · Cartagena de Indias · Matrícula de Arrendador No. 6636',
  ]
    .filter((l) => l !== '')
    .join('\n');

  return { html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVÍO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manda el lote por la API de Resend en UNA sola petición (`/emails/batch`, hasta 100 por llamada).
 * Se elige el batch y no envíos sueltos porque el plan gratuito limita las peticiones por segundo:
 * 90 envíos sueltos serían 45 segundos de espera artificial, y una sola petición son milisegundos.
 *
 * Si la petición falla NO se marca nada como enviado, así que el lote entero se reintenta en la
 * siguiente corrida. El riesgo residual, aceptado a conciencia: si Resend acepta el lote y la
 * respuesta se pierde en el camino, esas personas reciben el mismo digest dos veces. Repetir un correo
 * es un ruido menor; perderlo es romper la promesa que hizo la página.
 */
export async function enviarLote(
  correos: CorreoPreparado[],
  opts: OpcionesDigest,
): Promise<{ ok: boolean; status: number }> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const payload = correos.map((c) => ({
    from: REMITENTE,
    to: [c.alerta.email],
    subject: c.asunto,
    html: c.html,
    text: c.texto,
    headers: {
      // RFC 8058: el cliente de correo pinta su propio botón «Cancelar suscripción» y lo resuelve
      // con un POST. Sin esto, Gmail empuja a la gente a marcar como spam para dejar de recibir.
      'List-Unsubscribe': `<${c.urlBaja}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }));

  const res = await fetchImpl('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${opts.apiKeyResend}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRIDA
// ─────────────────────────────────────────────────────────────────────────────

export async function correrDigest(db: Firestore, opts: OpcionesDigest): Promise<ReporteDigest> {
  // El «ahora» se toma ANTES de leer el catálogo, y es el que se guardará como `ultimoEnvio`. Si se
  // tomara después del envío, todo lo publicado entre la lectura y el envío quedaría por debajo de la
  // marca y no se avisaría NUNCA. Adelantar la marca pierde inmuebles; atrasarla solo repite alguno.
  const inicio = opts.ahora ?? new Date();
  const corridaAt = inicio.toISOString();

  const base: ReporteDigest = {
    corridaAt,
    bajasAplicadas: 0,
    bajasIgnoradas: 0,
    alertasLeidas: 0,
    conNovedades: 0,
    enviados: 0,
    fallidos: 0,
    pospuestos: 0,
    topeAlertasTocado: false,
  };

  // Las bajas se aplican SIEMPRE, incluso sin clave de Resend: revocar no puede depender de que el
  // envío esté configurado.
  const bajas = await aplicarBajas(db, corridaAt);
  base.bajasAplicadas = bajas.aplicadas;
  base.bajasIgnoradas = bajas.ignoradas;

  if (!opts.apiKeyResend) return { ...base, omitido: 'sin-clave-resend' };

  const snap = await db
    .collection('alertas')
    .where('estado', '==', 'activa')
    .limit(TOPE_ALERTAS_POR_CORRIDA)
    .get();

  base.alertasLeidas = snap.size;
  base.topeAlertasTocado = snap.size >= TOPE_ALERTAS_POR_CORRIDA;
  if (snap.empty) return { ...base, omitido: 'sin-alertas' };

  const catalogo = await leerCatalogo(db);

  const candidatos: CorreoPreparado[] = [];
  for (const doc of snap.docs) {
    const alerta = doc.data() as Alerta;
    const items = catalogo.get(operacionAShard(alerta.criterios.operacion)) ?? [];
    // `normFecha` porque `ultimoEnvio` puede llegar como Timestamp o como string según quién lo
    // escribiera (el endpoint escribe ISO, el Admin SDK puede escribir Timestamp) — [[L-17]].
    const desde = normFecha(alerta.ultimoEnvio);
    const { items: novedades, total } = seleccionarNovedades(alerta.criterios, items, desde);
    if (!novedades.length) continue;

    const urlBaja = `${SITE_URL}/alertas/baja?id=${encodeURIComponent(doc.id)}&t=${encodeURIComponent(alerta.token)}`;
    const { html, texto } = cuerpoDigest(alerta, novedades, total, urlBaja);
    candidatos.push({
      ref: doc.ref,
      alerta,
      asunto: asuntoDigest(total, alerta.criterios),
      html,
      texto,
      urlBaja,
    });
  }

  base.conNovedades = candidatos.length;
  if (!candidatos.length) return { ...base, omitido: 'sin-novedades' };

  // Reparto JUSTO cuando hay más candidatos que cupo: primero quien lleva más tiempo sin recibir. Con
  // cualquier orden fijo, las mismas alertas quedarían siempre al final de la cola.
  candidatos.sort((a, b) => Date.parse(normFecha(a.alerta.ultimoEnvio)) - Date.parse(normFecha(b.alerta.ultimoEnvio)));
  const lote = candidatos.slice(0, TOPE_CORREOS_POR_CORRIDA);
  base.pospuestos = candidatos.length - lote.length;

  const envio = await enviarLote(lote, opts);
  if (!envio.ok) {
    base.fallidos = lote.length;
    return base;
  }

  // Solo tras un envío aceptado se mueve la frontera. Al revés, un fallo de red dejaría la marca
  // adelantada y esos inmuebles no se avisarían jamás.
  for (const c of lote) {
    await c.ref.set(
      {
        ultimoEnvio: corridaAt,
        enviados: (c.alerta.enviados ?? 0) + 1,
        updatedAt: corridaAt,
        _version: (c.alerta._version ?? 1) + 1,
      },
      { merge: true },
    );
  }
  base.enviados = lote.length;
  return base;
}

/** Reporte a líneas de log. Mismo patrón que `lineasReporte` del catálogo: legible en Cloud Logging. */
export function lineasDigest(r: ReporteDigest): string[] {
  const l = [
    `[alertas] corrida ${r.corridaAt} · alertas=${r.alertasLeidas} · con novedades=${r.conNovedades} · enviados=${r.enviados} · fallidos=${r.fallidos}`,
    `[alertas] bajas aplicadas=${r.bajasAplicadas} · ignoradas por token=${r.bajasIgnoradas}`,
  ];
  if (r.omitido) l.push(`[alertas] no se envió nada · motivo=${r.omitido}`);
  if (r.pospuestos) l.push(`[alertas] ⚠️ ${r.pospuestos} correo(s) POSPUESTOS por el tope diario — salen en la próxima corrida`);
  if (r.topeAlertasTocado) l.push(`[alertas] ⚠️ se leyó el tope de ${TOPE_ALERTAS_POR_CORRIDA} alertas — hay más sin procesar`);
  return l;
}
