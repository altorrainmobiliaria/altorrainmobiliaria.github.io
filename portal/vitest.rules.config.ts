import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Tests de Firestore Security Rules (T6) contra el EMULADOR (Java). Viven FUERA de `src/` (no entran
// al bundle del Worker ni al gate `verify:data`, porque usan el SDK `firebase/firestore`). Se corren con:
//   cd firebase && firebase emulators:exec --project demo-altorra "npx vitest run --config ../vitest.rules.config.ts --root .."
export default defineConfig({
  /*
   * ⚠️ UNA SOLA COPIA DEL ADMIN SDK (§141). En este repo conviven CUATRO `firebase-admin`
   * (raíz 13.8, functions/ 13.8, portal/ 14.2, portal/functions/ 13.10) y cada copia lleva su PROPIO
   * registro de apps. Sin esto, una prueba que inicializa la app con la copia de `portal/` y una
   * Function que llama a `getFirestore()` con la de `portal/functions/` no se ven: la segunda falla
   * con `app/no-app` aunque la app exista.
   *
   * Se fija la del CODEBASE, que es la que corre en producción — así estas pruebas ejercitan la misma
   * versión que se despliega, y no una parecida. Antes de esto, `catalogo-rebuild` decía «el MISMO
   * código que la Function» y era cierto del código y falso del SDK.
   */
  resolve: {
    alias: {
      'firebase-admin': fileURLToPath(new URL('./functions/node_modules/firebase-admin/lib', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['firebase/tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
