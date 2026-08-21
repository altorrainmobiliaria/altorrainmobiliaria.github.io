/*
 * URLs de MEDIA — dueño ÚNICO de cómo una clave de R2 se convierte en una URL servible.
 *
 * POR QUÉ EXISTE: la regla vivía SOLO dentro de `scripts/serp-catalogo.ts`, que corre en el navegador.
 * En cuanto una segunda superficie necesita pintar la misma imagen —la ficha, que se renderiza en el
 * servidor— la opción fácil es copiar tres líneas, y a partir de ahí las dos copias divergen sin que
 * nada falle: una sirve la foto y la otra un 404, o peor, una sirve el ORIGINAL pesado en vez del
 * derivado. Un solo dueño lo hace imposible.
 *
 * CONTRATO: `CatalogoResumen.thumb` y `Propiedad.imagenes[]` guardan CLAVES de R2 (`props/x/thumb.webp`),
 * nunca dominios (§3.2: no hardcodear URLs). La base pública se resuelve en build con
 * `PUBLIC_MEDIA_BASE`; si está vacía, la clave se usa tal cual, que es lo que hace hoy el catálogo demo
 * con sus rutas `/assets/*`.
 */

/** Base pública de R2. Vacía en demo ⇒ las claves ya son rutas locales servibles. */
const MEDIA_BASE = (import.meta.env.PUBLIC_MEDIA_BASE ?? '').replace(/\/$/, '');

/**
 * Clave de R2 (o ruta ya absoluta) → URL servible.
 *
 * Deja pasar sin tocar lo que ya es una URL (`https://…`, `//…`) o una ruta absoluta del sitio
 * (`/assets/…`): es lo que permite que los datos DEMO y los reales convivan en la misma plantilla sin
 * un `if` por superficie.
 */
export function urlMedia(key: string): string {
  if (!key) return '';
  if (/^(https?:)?\/\//.test(key) || key.startsWith('/')) return key;
  if (MEDIA_BASE) return `${MEDIA_BASE}/${key.replace(/^\//, '')}`;
  // ⚠️ SIN base configurada, la clave se sirve desde la RAÍZ del sitio, no relativa a la ruta actual.
  // La versión anterior devolvía la clave tal cual y eso la hacía depender de dónde estuviera el
  // visitante: `props/a.webp` resolvía a `/props/a.webp` en `/comprar` y a `/inmueble/props/a.webp` en
  // una ficha. Mismo dato, misma plantilla, y las fotos rotas solo en una de las dos páginas — sin
  // error de build y sin nada en consola salvo un 404 de imagen.
  return `/${key}`;
}

/** Base configurada (para diagnósticos y tests). Cadena vacía = modo «la clave ya es la ruta». */
export const mediaBase = (): string => MEDIA_BASE;
