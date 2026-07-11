import type { COP } from './shared';

// Colección `config` — documentos singleton editables (evita hardcodear lo que cambia, §3.2).

/** `config/general` — datos de marca/legales editables. */
export interface ConfigGeneral {
  razonSocial: string; // ALTORRA COMPANY S.A.S. (la vieja 901.976.611-7 JAMÁS)
  nit: string; // 902063965-4
  matriculaArrendador: string; // AMC-OFI-0074376-2026 (exhibir en avisos — B4)
  rntPlataforma?: string; // RNT de la plataforma (pendiente abogado toque i)
  rntPrestador?: string;
  tarifas?: Record<string, number>;
}

/** `config/gestion` — umbrales operativos del back-office (NO hardcodear; default PRO). */
export interface ConfigGestion {
  moraDias: number[]; // escalones de cobranza; default PRO [5, 10, 15, 30, 45]
  ingresosMinMultiplicador: number; // p.ej. 3x canon (configurable)
  renovacionAlertaDias: number; // 120 (alerta) — preaviso legal 90 (Ley 820)
  incrementoIPCTope?: number;
}

/** `config/counters` — contadores atómicos (código INM-YYYYMM-XXXX — OD8). */
export type ConfigCounters = Record<string, number>;

/** `config/promo` y `config/system-meta` — flags de promo y versión de cache (cross-tab). */
export interface ConfigSystemMeta {
  cacheVersion?: string;
  updatedAt?: string;
}
