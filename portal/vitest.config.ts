import { defineConfig } from 'vitest/config';

// Tests unitarios PUROS de la capa de datos (decoder + getDoc + guards). Sin Astro, sin red real:
// el decoder es una función pura y getDoc recibe un `fetchImpl` inyectable. Los tests de RULES contra
// el emulador (T6) viven aparte (`firebase/` + firebase-tools) porque necesitan el emulador Java.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
