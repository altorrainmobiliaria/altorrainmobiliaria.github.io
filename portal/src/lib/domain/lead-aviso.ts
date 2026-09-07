/*
 * AVISO DE LEAD NUEVO — el correo que le llega al equipo cuando alguien deja sus datos (§188).
 *
 * POR QUÉ EXISTE, y no es un refactor por gusto. El aviso de leads del portal dependía de la Function
 * LEGACY `onNewSolicitud`, que manda por SMTP de Gmail con una contraseña de aplicación **rota desde
 * hace semanas** (`535-5.7.8`). Así se perdieron los 16 leads del sitio viejo: nadie recibió aviso y
 * nadie se enteró. Lanzar el portal nuevo sobre ese mismo camino era repetirlo, esta vez sin siquiera
 * la evidencia. Este módulo mueve el aviso a **Resend**, que el portal ya usa para el digest — y de
 * paso le quita una pelota al dueño: en vez de rotar una credencial rota Y configurar Resend, solo
 * configura Resend.
 *
 * 🔴 LA REGLA QUE ALGUIEN VA A QUERER "ARREGLAR", y sería un error caro: **este correo NO lleva
 * guardia de la Ley 2300.** El digest sí lo lleva (§172) porque va a un CONSUMIDOR y la ley acota el
 * horario de contacto comercial. Éste va a ALTORRA, sobre su propio negocio: no es contacto
 * comercial, es una notificación interna. Ponerle la ventana horaria retrasaría un lead de las 22:00
 * hasta las 7:00 del día siguiente — nueve horas de silencio en el único momento en que un lead está
 * caliente. *Copiar una guardia sin mirar a quién protege es cómo una protección se vuelve un daño.*
 *
 * Puro: arma el texto y no lo manda. Lo envía `functions/src/lead-aviso.ts`.
 */

import type { Solicitud } from './crm';

/** Un lead sin forma de contactarlo no es un lead: es ruido, y el asunto tiene que decirlo. */
export function contactabilidad(s: Solicitud): 'telefono' | 'email' | 'ambos' | 'NINGUNO' {
  const tel = Boolean(s.contacto?.telefono?.trim());
  const mail = Boolean(s.contacto?.email?.trim());
  if (tel && mail) return 'ambos';
  if (tel) return 'telefono';
  if (mail) return 'email';
  return 'NINGUNO';
}

/**
 * El asunto. Se lee en una notificación del móvil, así que lleva DELANTE lo que decide si se abre
 * ahora o luego: el tier y la operación. El nombre va al final — es lo que menos discrimina.
 */
export function asuntoDeLead(s: Solicitud): string {
  const tier = s.leadTier ? `[${s.leadTier}] ` : '';
  const op = s.operacionInteres ? etiquetaOperacion(s.operacionInteres) : 'Contacto';
  const quien = s.contacto?.nombre?.trim() || 'sin nombre';
  const alerta = contactabilidad(s) === 'NINGUNO' ? ' ⚠️ SIN CONTACTO' : '';
  return `${tier}${op} · ${quien}${alerta}`;
}

function etiquetaOperacion(op: string): string {
  if (op === 'venta') return 'Compra';
  if (op === 'arriendo') return 'Arriendo';
  if (op === 'alojamiento') return 'Estancia';
  return 'Contacto';
}

/**
 * El cuerpo en texto plano. **Sin HTML a propósito**: es un aviso interno que se lee en el móvil en
 * diez segundos, y el texto plano no se rompe en ningún cliente ni cae en promociones.
 *
 * Va TODO lo que hace falta para llamar sin abrir el panel — porque quien recibe esto suele estar
 * fuera, y obligarle a entrar a un panel para ver un teléfono es cómo se enfría un lead.
 */
export function cuerpoDeLead(s: Solicitud, urlPanel: string): string {
  const l: string[] = [];
  l.push(`Nombre: ${s.contacto?.nombre?.trim() || '—'}`);
  l.push(`Teléfono: ${s.contacto?.telefono?.trim() || '—'}`);
  l.push(`Correo: ${s.contacto?.email?.trim() || '—'}`);
  if (contactabilidad(s) === 'NINGUNO') {
    l.push('⚠️ Este lead NO dejó forma de contacto. Revisa el formulario antes de darlo por perdido.');
  }
  l.push('');
  if (s.operacionInteres) l.push(`Interés: ${etiquetaOperacion(s.operacionInteres)}`);
  if (s.propiedadId) l.push(`Inmueble: ${s.propiedadId}`);
  if (s.leadScore != null) l.push(`Score: ${s.leadScore}${s.leadTier ? ` (${s.leadTier})` : ''}`);
  l.push(`Origen: ${s.source}`);
  if (s.mensaje?.trim()) {
    l.push('');
    l.push('Mensaje:');
    l.push(s.mensaje.trim());
  }
  l.push('');
  l.push(`Abrir en el panel: ${urlPanel}`);
  return l.join('\n');
}
