import type { Propiedad } from '../../src/lib/domain/propiedades';

/** Genera `n` propiedades SEMILLA realistas (Cartagena), determinista por `seed`. Ver el `.mjs`. */
export function generarPropiedades(n?: number, seed?: number): Propiedad[];
