import { describe, expect, it } from 'vitest';
import {
  claveImagen,
  claveThumb,
  claveValida,
  esClaveThumb,
  explicarRechazo,
  topeDe,
  TOPE_BYTES,
  TOPE_BYTES_THUMB,
  TOPE_IMAGENES,
  validarCuerpo,
} from './media-subida';
import { urlMedia } from './media';

// Contrato de subida a R2 (§107). Lo que se prueba aquí es lo que NO falla en el momento: una clave mal
// formada no rompe nada al guardarse, solo sirve un 404 meses después; y una URL ajena colada en
// `imagenes[]` funciona perfectamente sirviendo la foto desde el servidor de otro, para siempre.

describe('claveImagen — la ruta la compone el servidor, nunca el cliente', () => {
  it('compone la clave canónica', () => {
    expect(claveImagen('INM-202608-0001', 3)).toEqual({ ok: true, clave: 'props/INM-202608-0001/3.webp' });
  });

  it('normaliza la caja del id (el doc-id es siempre en mayúscula)', () => {
    expect(claveImagen('inm-202608-0001', 1)).toEqual({ ok: true, clave: 'props/INM-202608-0001/1.webp' });
  });

  it('rechaza un id que no es el canónico — incluido el del panel viejo', () => {
    for (const id of ['ALT-045', '', '   ', 'INM-2026-0001', 'INM-202608-1', 'props/../etc']) {
      expect(claveImagen(id, 1)).toEqual({ ok: false, motivo: 'id-invalido' });
    }
  });

  it('rechaza posiciones fuera de rango o que no son enteros', () => {
    for (const n of [0, -1, 1.5, NaN, TOPE_IMAGENES + 1]) {
      expect(claveImagen('INM-202608-0001', n)).toEqual({ ok: false, motivo: 'indice-invalido' });
    }
    expect(claveImagen('INM-202608-0001', TOPE_IMAGENES).ok).toBe(true);
  });

  it('la posición va en el nombre: volver a subir la misma REEMPLAZA, no deja basura', () => {
    const a = claveImagen('INM-202608-0001', 2);
    const b = claveImagen('INM-202608-0001', 2);
    expect(a).toEqual(b);
  });
});

describe('claveValida — una URL disfrazada de clave no se guarda', () => {
  it('acepta la clave canónica', () => {
    expect(claveValida('props/INM-202608-0001/1.webp')).toBe(true);
  });

  it('🔴 rechaza URLs absolutas: son el defecto que tiene la semilla del proyecto', () => {
    expect(claveValida('https://picsum.photos/seed/x/800/600')).toBe(false);
    expect(claveValida('http://cdn.ajeno/x.webp')).toBe(false);
    expect(claveValida('//cdn.ajeno/x.webp')).toBe(false);
  });

  it('rechaza rutas del sitio y travesías', () => {
    expect(claveValida('/assets/demo.webp')).toBe(false);
    expect(claveValida('props/../../secreto.webp')).toBe(false);
  });

  it('rechaza formas casi-buenas', () => {
    expect(claveValida('props/ALT-045/1.webp')).toBe(false);
    expect(claveValida('props/INM-202608-0001/1.jpg')).toBe(false);
    expect(claveValida('otro/INM-202608-0001/1.webp')).toBe(false);
    expect(claveValida('')).toBe(false);
  });

  it('🎯 lo que `claveValida` acepta, `urlMedia` NO lo deja pasar sin tocar', () => {
    // Este es el contrato real: si `urlMedia` devolviera la clave tal cual, es que la tomó por una URL
    // — y entonces el día que se apunte la base al bucket propio esa foto seguiría viniendo de fuera.
    const clave = 'props/INM-202608-0001/1.webp';
    expect(claveValida(clave)).toBe(true);
    expect(urlMedia(clave)).not.toBe(clave);
  });
});

describe('validarCuerpo — solo WebP y con techo', () => {
  it('acepta WebP, con o sin parámetros en el content-type', () => {
    expect(validarCuerpo('image/webp', 1000)).toEqual({ ok: true });
    expect(validarCuerpo('image/WEBP; charset=binary', 1000)).toEqual({ ok: true });
  });

  it('rechaza los formatos que el contrato del proyecto no sirve', () => {
    for (const t of ['image/jpeg', 'image/png', 'image/heic', 'application/pdf', null, '']) {
      expect(validarCuerpo(t, 1000)).toEqual({ ok: false, motivo: 'tipo-no-aceptado' });
    }
  });

  it('rechaza vacío y rechaza pasarse del tope', () => {
    expect(validarCuerpo('image/webp', 0)).toEqual({ ok: false, motivo: 'vacio' });
    expect(validarCuerpo('image/webp', TOPE_BYTES + 1)).toEqual({ ok: false, motivo: 'demasiado-grande' });
    expect(validarCuerpo('image/webp', TOPE_BYTES)).toEqual({ ok: true });
  });
});

describe('explicarRechazo — un 400 sin explicación es una llamada de teléfono', () => {
  it('todos los motivos tienen un mensaje para una persona', () => {
    for (const m of ['id-invalido', 'tipo-no-aceptado', 'vacio', 'demasiado-grande', 'indice-invalido'] as const) {
      const txt = explicarRechazo(m);
      expect(txt.length).toBeGreaterThan(10);
      expect(txt).not.toContain('undefined');
    }
  });

  it('el tope que se nombra es el de SU variante, no el de la otra', () => {
    expect(explicarRechazo('demasiado-grande', 'thumb')).toContain('KB');
    expect(explicarRechazo('demasiado-grande', 'full')).toContain('MB');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// §304 — LAS DOS DERIVADAS. «Nunca servir originales» estaba adoptado como invariante VERIFICABLE
// y se cumplía a medias: había una sola talla y el índice la usaba como tarjeta. Lo que se fija
// aquí es que el thumb se DERIVE (no se pueda equivocar) y que lo que no es una clave de R2 salga
// intacto — inventarle un `-thumb` a una ruta demo es un 404 en cada tarjeta.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

describe('claveImagen con variante · claveThumb — el thumb se deriva, no se teclea', () => {
  it('la variante cambia el nombre, no la carpeta', () => {
    expect(claveImagen('INM-202608-0001', 3)).toEqual({ ok: true, clave: 'props/INM-202608-0001/3.webp' });
    expect(claveImagen('INM-202608-0001', 3, 'full')).toEqual({ ok: true, clave: 'props/INM-202608-0001/3.webp' });
    expect(claveImagen('INM-202608-0001', 3, 'thumb')).toEqual({ ok: true, clave: 'props/INM-202608-0001/3-thumb.webp' });
  });

  it('🎯 `claveThumb` de una foto es su miniatura, y de su miniatura es ella misma (idempotente)', () => {
    const full = 'props/INM-202608-0001/3.webp';
    const thumb = 'props/INM-202608-0001/3-thumb.webp';
    expect(claveThumb(full)).toBe(thumb);
    expect(claveThumb(thumb)).toBe(thumb); // no encadena `-thumb-thumb`
  });

  it('🔴 lo que NO es clave de R2 sale INTACTO: inventarle un thumb es un 404 en cada tarjeta', () => {
    for (const x of ['/assets/villa-pool.webp', 'https://cdn.ajeno/x.webp', '', 'props/otra-cosa.webp']) {
      expect(claveThumb(x)).toBe(x);
    }
  });

  it('la clave del thumb es tan VÁLIDA como la de la foto (si no, el endpoint la rechazaría)', () => {
    expect(claveValida('props/INM-202608-0001/3-thumb.webp')).toBe(true);
    expect(esClaveThumb('props/INM-202608-0001/3-thumb.webp')).toBe(true);
    expect(esClaveThumb('props/INM-202608-0001/3.webp')).toBe(false);
  });

  it('y sigue sin colarse una URL disfrazada por la puerta del thumb', () => {
    expect(claveValida('https://ajeno/props/INM-202608-0001/3-thumb.webp')).toBe(false);
    expect(claveValida('/props/INM-202608-0001/3-thumb.webp')).toBe(false);
    expect(claveValida('props/../INM-202608-0001/3-thumb.webp')).toBe(false);
  });
});

describe('topeDe / validarCuerpo por variante — el thumb no puede pesar como la foto', () => {
  it('🎯 un WebP de 1 MB pasa como foto y NO pasa como miniatura', () => {
    const unMega = 1024 * 1024;
    expect(validarCuerpo('image/webp', unMega, 'full')).toEqual({ ok: true });
    expect(validarCuerpo('image/webp', unMega, 'thumb')).toEqual({ ok: false, motivo: 'demasiado-grande' });
  });

  it('los bordes de cada tope', () => {
    expect(validarCuerpo('image/webp', TOPE_BYTES_THUMB, 'thumb')).toEqual({ ok: true });
    expect(validarCuerpo('image/webp', TOPE_BYTES_THUMB + 1, 'thumb')).toEqual({ ok: false, motivo: 'demasiado-grande' });
    expect(topeDe('thumb')).toBeLessThan(topeDe('full'));
  });

  it('sin variante se comporta como antes (la foto): no hay regresión en el camino viejo', () => {
    expect(validarCuerpo('image/webp', TOPE_BYTES)).toEqual({ ok: true });
    expect(validarCuerpo('image/webp', TOPE_BYTES + 1)).toEqual({ ok: false, motivo: 'demasiado-grande' });
  });
});
