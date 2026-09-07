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
    /*
     * 🔴 UN ARCHIVO A LA VEZ, y no es una preferencia de estilo (§152).
     *
     * Estas pruebas no son unitarias: comparten UNA instancia del emulador, UNA app por defecto de
     * Firebase (las Functions llaman a `getFirestore()` a secas, así que no puede ser otra) y, por
     * tanto, UNA base de datos. Varios archivos limpian `config` en su `beforeEach` porque ahí vive
     * el contador de códigos — y en paralelo, el `beforeEach` de uno borra el contador que otro está
     * usando a mitad de una prueba.
     *
     * Estuvo latente todo el tiempo: con dos archivos la carrera no se daba, y apareció el día que
     * entró el tercero, acusando a una prueba de contadores que llevaba semanas bien. Un fallo que
     * culpa a un inocente es el peor tipo de fallo, así que se cierra la puerta en vez de reordenar.
     */
    fileParallelism: false,
  },
});
