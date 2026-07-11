// Capa de acceso a datos — FACTORY + repositorios por agregado. Es la ÚNICA frontera con Firestore
// en RUNTIME/edge (páginas, islas y endpoints NUNCA importan el REST ni un SDK directo). Read-only
// público en el MVP (escrituras = Cloud Functions con Admin SDK; lecturas privilegiadas SA-JWT = post-MVP).
//
// Endurecido por comité OD1 (Decisión Fuerte [REVISAR-FABLE]): validación de forma del id (anti-traversal),
// guard de config espejando la RULE (deny-list), colapso denied+not-found → 'unavailable' (no filtra
// existencia de borradores), memo POR-REQUEST.

import { getDoc, type LowLevelResult } from './firestore-rest';
import type { Propiedad, Disponibilidad } from '../domain/propiedades';
import type { ConfigGeneral } from '../domain/config';

// Config PÚBLICA de Firebase (la apiKey es pública por diseño; misma que `js/firebase-config.js` legacy).
// Se usa como fallback: prioridad env runtime (wrangler [vars]) → build-time (import.meta.env) → esta constante.
const PUBLIC_FIREBASE = {
  apiKey: 'AIzaSyCLxOwj3837m6p9QFDBWzVTuNUFhBkCg_I',
  projectId: 'altorra-inmobiliaria-345c6',
} as const;

/** Subset del env de runtime de Cloudflare que este cliente consume (todo PÚBLICO). */
export interface RuntimeEnv {
  PUBLIC_FIREBASE_API_KEY?: string;
  PUBLIC_FIREBASE_PROJECT_ID?: string;
}

/**
 * Resultado de lectura PÚBLICA. `denied` (borrador que la rule niega) y `not-found` se COLAPSAN en
 * `unavailable` a propósito: el render público JAMÁS debe poder distinguir "existe pero no publicado"
 * de "no existe" (evita un oráculo de listings sin publicar — comité OD1). `error` = fallo transitorio.
 */
export type ReadResult<T> = { ok: true; data: T } | { ok: false; reason: 'unavailable' | 'error' };

// Forma válida de un docId/segmento: alfanumérico + '-'/'_'. Cubre `INM-YYYYMM-XXXX`, `ALT-AR-*`,
// `general`/`system-meta` y `{propiedadId}_{YYYY-MM-DD}`. Excluye '/', '.', '..' y control chars
// (anti path-traversal — las Rules son la frontera real; esto es defensa en profundidad, comité OD1).
const ID_RE = /^[A-Za-z0-9_-]{1,256}$/;
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
// Espeja la RULE de `config` (que solo NIEGA estos dos); deny-list, no allow-list, para no divergir
// del comportamiento real cuando se agregue un doc público nuevo (comité OD1).
const CONFIG_DENY = new Set(['gestion', 'counters']);

function resolveConfig(env?: RuntimeEnv): { apiKey: string; projectId: string } {
  const apiKey =
    env?.PUBLIC_FIREBASE_API_KEY ??
    (import.meta.env.PUBLIC_FIREBASE_API_KEY as string | undefined) ??
    PUBLIC_FIREBASE.apiKey;
  const projectId =
    env?.PUBLIC_FIREBASE_PROJECT_ID ??
    (import.meta.env.PUBLIC_FIREBASE_PROJECT_ID as string | undefined) ??
    PUBLIC_FIREBASE.projectId;
  return { apiKey, projectId };
}

/** Colapsa el resultado de bajo nivel al contrato público (sin `reason`/`status` que filtren existencia). */
function toPublic<T>(r: LowLevelResult): ReadResult<T> {
  if (r.ok) return { ok: true, data: r.data as T }; // NOTA: cast sin validación runtime (hardening futuro: zod).
  if (r.reason === 'error') return { ok: false, reason: 'error' };
  return { ok: false, reason: 'unavailable' }; // not-found + denied colapsados
}

export interface DataClient {
  propiedades: { get(id: string): Promise<ReadResult<Propiedad>> };
  config: {
    /** Lectura genérica de un doc de `config` (rechaza `gestion`/`counters` sin ir a la red). */
    get(doc: string): Promise<ReadResult<Record<string, unknown>>>;
    /** Atajo tipado para el doc de marca/legal (footer, matrícula de arrendador). */
    getGeneral(): Promise<ReadResult<ConfigGeneral>>;
  };
  disponibilidad: { get(propiedadId: string, fecha: string): Promise<ReadResult<Disponibilidad>> };
}

/**
 * Crea la capa de datos. Edge-safe, lazy (no hace red hasta un `.get()`), read-only público.
 *
 * ⚠️ CREAR POR-REQUEST — NUNCA a nivel de módulo. En Cloudflare Workers el estado de módulo PERSISTE
 * entre requests del mismo isolate: una instancia izada convertiría el memo en un caché fantasma
 * cross-request (datos obsoletos) + fuga de memoria (comité OD1). En Astro, cablear 1 instancia por
 * request en `locals.altorra` (ver `middleware.ts`) y pasarla hacia abajo; las páginas ESTÁTICAS
 * (build-time) la crean directas con la config pública por defecto.
 *
 * @param env  env de runtime de Cloudflare (`Astro.locals.runtime?.env`); opcional.
 * @param opts `fetchImpl` inyectable para tests.
 */
export function getDataClient(env?: RuntimeEnv, opts?: { fetchImpl?: typeof fetch }): DataClient {
  const { apiKey, projectId } = resolveConfig(env);
  const fetchImpl = opts?.fetchImpl;
  // Memo POR-REQUEST: dos lecturas del mismo doc en un render = 1 fetch. Vive con la instancia
  // (que es request-scoped por construcción — ver la advertencia anti-hoist de arriba).
  const memo = new Map<string, Promise<LowLevelResult>>();

  function read(segments: readonly string[]): Promise<LowLevelResult> {
    const key = segments.join('/');
    let p = memo.get(key);
    if (!p) {
      p = getDoc(segments, { apiKey, projectId, fetchImpl });
      memo.set(key, p);
    }
    return p;
  }

  return {
    propiedades: {
      async get(id) {
        if (!ID_RE.test(id)) return { ok: false, reason: 'unavailable' };
        return toPublic<Propiedad>(await read(['propiedades', id]));
      },
    },
    config: {
      async get(doc) {
        if (!ID_RE.test(doc) || CONFIG_DENY.has(doc)) return { ok: false, reason: 'unavailable' };
        return toPublic<Record<string, unknown>>(await read(['config', doc]));
      },
      async getGeneral() {
        return toPublic<ConfigGeneral>(await read(['config', 'general']));
      },
    },
    disponibilidad: {
      async get(propiedadId, fecha) {
        if (!ID_RE.test(propiedadId) || !FECHA_RE.test(fecha)) return { ok: false, reason: 'unavailable' };
        // docId determinista, top-level, byte-idéntico al que escribirá la Cloud Function (OD6/anti-overbooking).
        return toPublic<Disponibilidad>(await read(['disponibilidad', `${propiedadId}_${fecha}`]));
      },
    },
  };
}
