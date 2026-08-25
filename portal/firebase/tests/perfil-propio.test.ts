/*
 * ¿Puede una persona del equipo LEER SU PROPIA ficha de `usuarios`?
 *
 * Nace de un fallo reportado en vivo (§135): tras entrar bien, el panel decía «No se encontró tu perfil
 * de usuario». `loadUserProfile()` devuelve `null` tanto si el documento NO EXISTE como si la lectura
 * se DENIEGA — dos causas muy distintas bajo el mismo mensaje. El documento estaba intacto, así que
 * había que descartar la regla, y descartarla con una prueba y no con una lectura del texto.
 *
 * Se cubren los tres casos que importan, incluido el del DÍA CERO: alguien acaba de darse de alta y su
 * token todavía no lleva claims (viajan dentro del token y tardan hasta una hora en renovarse). Si su
 * propia ficha dependiera del claim, no podría entrar nunca a pedirlo — un candado con la llave dentro.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;
const UID = 'daniel-uid';

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-altorra-perfil',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `usuarios/${UID}`), {
      rol: 'super_admin', activo: true, bloqueado: false, email: 'info@altorrainmobiliaria.co',
    });
    await setDoc(doc(ctx.firestore(), 'usuarios/otro-uid'), { rol: 'editor', activo: true });
  });
});

describe('la ficha propia de `usuarios` (§135)', () => {
  it('CON claims: lee su propia ficha', async () => {
    const db = env.authenticatedContext(UID, { admin: true, rol: 'super_admin' }).firestore();
    await assertSucceeds(getDoc(doc(db, `usuarios/${UID}`)));
  });

  it('🎯 SIN claims (día cero): TAMBIÉN lee su propia ficha', async () => {
    // Si esto fallara, nadie podría entrar la primera vez: el panel necesita la ficha para saber tu
    // rol, y el claim solo llega DESPUÉS. Sería un candado con la llave dentro.
    const db = env.authenticatedContext(UID).firestore();
    await assertSucceeds(getDoc(doc(db, `usuarios/${UID}`)));
  });

  it('la ficha AJENA sigue cerrada para quien no es super_admin', async () => {
    const db = env.authenticatedContext(UID, { admin: true, rol: 'editor' }).firestore();
    await assertFails(getDoc(doc(db, 'usuarios/otro-uid')));
  });
});
