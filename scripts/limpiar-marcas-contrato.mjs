// Saca del papel las marcas de trabajo de un documento del kit.
//   · borra el bloque "NOTA PARA DANIEL" (bloque contiguo de citas '>')
//   · borra las notas de justificacion (lineas que SON una nota entre corchetes)
//   · convierte los corchetes de relleno restantes en espacios diligenciables
// Uso: node limpiar-marcas-contrato.mjs <archivo.md> [--dry]
import fs from 'node:fs'

const [, , file, flag] = process.argv
const dry = flag === '--dry'
const A = '⟦', C = '⟧'
const src = fs.readFileSync(file, 'utf8')
const lineas = src.split(/\r?\n/)

const out = []
let borradas = 0, notas = 0, rellenos = 0

for (let i = 0; i < lineas.length; i++) {
  const l = lineas[i]

  // 1) bloque NOTA PARA DANIEL: se come las lineas de cita contiguas
  if (l.includes('NOTA PARA DANIEL')) {
    while (i < lineas.length && (lineas[i].startsWith('>') || lineas[i].trim() === '>')) { i++; borradas++ }
    while (out.length && out[out.length - 1].trim() === '') out.pop()
    if (lineas[i] !== undefined && lineas[i].trim() === '') i++
    i--
    continue
  }

  // 2) nota de justificacion: la linea ES la nota (empieza con corchete)
  //    o es la continuacion de una nota multilinea abierta
  if (l.trimStart().startsWith(A)) {
    let bloque = l
    while (!bloque.includes(C) && i + 1 < lineas.length) { i++; bloque += '\n' + lineas[i] }
    notas++
    if (lineas[i + 1] !== undefined && lineas[i + 1].trim() === '') i++
    continue
  }

  // 3) relleno inline -> espacio diligenciable proporcional a la etiqueta
  if (l.includes(A)) {
    out.push(l.replace(new RegExp(A + '([^' + C + ']*)' + C, 'g'), (_, etq) => {
      rellenos++
      const n = Math.min(40, Math.max(14, Math.round(etq.length * 0.8)))
      return '_'.repeat(n)
    }))
    continue
  }

  out.push(l)
}

const res = out.join('\n')
if (!dry) fs.writeFileSync(file, res, 'utf8')
console.log(`${file}: ${borradas} linea(s) de NOTA PARA DANIEL · ${notas} nota(s) de justificacion · ${rellenos} relleno(s) -> espacio${dry ? ' (DRY RUN)' : ''}`)
