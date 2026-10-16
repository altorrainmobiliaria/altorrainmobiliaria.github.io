import { defineConfig, mergeConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

// Tests unitarios PUROS de la capa de datos (decoder + getDoc + guards) y, desde §329, el RENDER de
// componentes `.astro` con el contenedor de Astro (`ficha-alojamiento.test.ts`). Sin red real: el
// decoder es una función pura y getDoc recibe un `fetchImpl` inyectable. Los tests de RULES contra el
// emulador (T6) viven aparte (`firebase/` + firebase-tools) porque necesitan el emulador Java.
//
// `getViteConfig` es lo que compila `.astro` dentro de vitest. `configFile: false` a propósito: el
// adaptador de Cloudflare (v14) monta el servidor dentro de workerd, y una prueba de render no lo
// necesita — cargar `astro.config.mjs` aquí arrastraría ese runtime a cada corrida. Se FUSIONA con
// `mergeConfig` en vez de pasarle `test` a `getViteConfig`: los tipos de Vite de Astro y los de vitest
// son instancias distintas y la clave `test` no existe para los primeros.
export default defineConfig(async (env) =>
  mergeConfig(await getViteConfig({}, { configFile: false })(env), {
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }),
);
