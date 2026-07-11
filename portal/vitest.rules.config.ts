import { defineConfig } from 'vitest/config';

// Tests de Firestore Security Rules (T6) contra el EMULADOR (Java). Viven FUERA de `src/` (no entran
// al bundle del Worker ni al gate `verify:data`, porque usan el SDK `firebase/firestore`). Se corren con:
//   cd firebase && firebase emulators:exec --project demo-altorra "npx vitest run --config ../vitest.rules.config.ts --root .."
export default defineConfig({
  test: {
    environment: 'node',
    include: ['firebase/tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
