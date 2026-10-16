/*
 * «Hace cuánto», en cristiano (§279).
 *
 * Vivía dentro de `scripts/gestion-leads.ts`, que es el PANEL. La portada la necesita para decir
 * cuándo entró un inmueble, y hacer que una página pública importe del panel habría sido el
 * acoplamiento que §277 acababa de deshacer por el otro lado. Es una función pura sin DOM: su sitio
 * es el dominio, donde las dos pueden verla sin verse entre ellas.
 */

/**
 * Una fecha de Firestore, venga como venga: `Timestamp` (SDK cliente o Admin) o texto ISO (el endpoint
 * REST). Asumir una sola forma no da error: pinta un guion y nadie sabe por qué ([[L-17]]). Lo que no
 * es ninguna de las dos devuelve `null`, nunca una fecha inventada.
 */
export function fechaDe(v: unknown): Date | null {
  if (v && typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
    const d = (v as { toDate: () => Date }).toDate();
    return d instanceof Date && Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof v === 'string' && Number.isFinite(Date.parse(v))) return new Date(v);
  return null;
}

/** «hace 12 min» · «hace 3 h» · «ayer» · «hace 2 días». Una fecha ISO no la lee nadie. */
export function haceCuanto(d: Date | null): string {
  if (!d) return '—';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.floor(h / 24);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
}
