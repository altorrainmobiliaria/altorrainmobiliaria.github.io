/*
 * GATE — contratos de retorno del panel LEGACY (§136).
 *
 * EL DEFECTO QUE CAZA. Una función cambia lo que DEVUELVE, se migra un callsite y se olvida otro. El
 * archivo sigue siendo JavaScript válido, `node --check` pasa, el navegador no se queja: simplemente
 * lee una propiedad que ahora vive un nivel más adentro, obtiene `undefined`, y decide con eso.
 *
 * LO QUE COSTÓ. `loadUserProfile()` pasó de devolver el perfil pelado a `{ ok, perfil }`. Se migró
 * `handleLogin` y NO el oyente de `onAuthStateChanged`, que seguía evaluando `!profile.activo` sobre
 * el envoltorio: `undefined` → `true` → `signOut()`. El dueño entraba con la contraseña correcta y un
 * instante después el sistema lo echaba, con siete «permission denied» en cascada que parecían el
 * problema y eran la consecuencia. Dos horas de diagnóstico por un callsite.
 *
 * POR QUÉ UN GATE Y NO UNA LECCIÓN. El panel legacy es vanilla sin tests ni tipos: nada más puede
 * verlo. Es barato, es determinista, y vigila justo la frontera donde el lenguaje no ayuda.
 *
 * CÓMO CRECE. Cada entrada declara la función y la marca que TODO uso de su resultado debe llevar.
 * Al cambiar un contrato, se añade aquí y el gate obliga a repasar los callsites.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** `fn` devuelve un envoltorio; toda captura de su resultado debe consultar `marca`. */
const CONTRATOS = [
  {
    archivo: 'js/admin-auth.js',
    fn: 'loadUserProfile',
    marca: '.ok',
    porque: 'devuelve `{ ok, perfil }` desde §135 — leer `.activo`/`.rol` sobre el envoltorio da `undefined`',
  },
];

const fallos = [];

for (const c of CONTRATOS) {
  const codigo = readFileSync(join(RAIZ, c.archivo), 'utf8');
  const lineas = codigo.split('\n');

  lineas.forEach((linea, i) => {
    // Solo las líneas que CAPTURAN el resultado (`const x = await fn(`), no la definición ni la recursión.
    const m = linea.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*await\s+(\w+)\s*\(/);
    if (!m || m[2] !== c.fn) return;

    const variable = m[1];
    // Se mira la ventana siguiente: si nadie consulta la marca sobre esa variable, el callsite quedó atrás.
    const ventana = lineas.slice(i, i + 12).join('\n');
    if (!ventana.includes(variable + c.marca)) {
      fallos.push({ archivo: c.archivo, linea: i + 1, variable, ...c });
    }
  });
}

if (fallos.length) {
  console.error('❌ verify:contratos — resultado usado con el contrato VIEJO:\n');
  for (const f of fallos) {
    console.error(`   ${f.archivo}:${f.linea}  →  \`${f.variable} = await ${f.fn}(…)\` y nunca se consulta \`${f.variable}${f.marca}\``);
    console.error(`     ${f.porque}`);
  }
  console.error('\n   Un cambio de contrato migra TODOS los callsites en el mismo commit (§3.2: aditivo,');
  console.error('   o migrado entero). Este gate existe porque uno solo ya dejó al dueño fuera del panel.');
  process.exit(1);
}

console.log(`✅ verify:contratos — ${CONTRATOS.length} contrato(s) del legacy: todos los callsites al día.`);
