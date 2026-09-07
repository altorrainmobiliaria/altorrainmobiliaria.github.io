// Extrae los resultados de un journal.jsonl de workflow a formato durable.
// Uso: node extraer-journal.mjs <journal.jsonl> <salidaBase>
import fs from 'node:fs'

const [, , journalPath, outBase] = process.argv
const lineas = fs.readFileSync(journalPath, 'utf8').split('\n').filter(Boolean)

const resultados = []
for (const l of lineas) {
  let o
  try { o = JSON.parse(l) } catch { continue }
  if (o.type === 'result') resultados.push({ agentId: o.agentId, key: o.key, result: o.result })
}

fs.writeFileSync(`${outBase}.json`, JSON.stringify(resultados, null, 1), 'utf8')

// --- digest legible -----------------------------------------------------
const esc = (s) => String(s ?? '').trim()
const lentes = resultados.filter((r) => r.result && Array.isArray(r.result.hallazgos))
const veredictos = resultados.filter((r) => r.result && typeof r.result.refutado === 'boolean')
const textos = resultados.filter((r) => typeof r.result === 'string')

// Título y procedencia: se pasan por argv para que el digest diga de QUÉ corrida salió.
// Sin esto el extractor rotulaba todo como "comité R3", que era el primer uso (ADR §67).
const titulo = process.argv[4] || 'Resultados CRUDOS recuperados del journal'
const procedencia = process.argv[5] || journalPath

let md = `# ${titulo}\n\n`
md += `> Extraído del \`journal.jsonl\` de ${procedencia}.\n`
md += `> **Estos son tokens ya gastados.** Si una sesión futura necesita estos hallazgos, los lee de aquí:\n`
md += `> NO se relanza el comité. Relanzarlo es pagar dos veces por lo mismo.\n\n`
md += `- Devoluciones registradas: **${resultados.length}**\n`
md += `- Lentes con hallazgos: **${lentes.length}**\n`
md += `- Veredictos de refutación: **${veredictos.length}** (${veredictos.filter((v) => v.result.refutado).length} refutados / ${veredictos.filter((v) => !v.result.refutado).length} sobreviven)\n`
md += `- Entregas de texto libre (síntesis): **${textos.length}**\n\n---\n\n`

md += `## HALLAZGOS POR LENTE\n\n`
for (const r of lentes) {
  md += `### Lente \`${r.agentId}\` — ${r.result.hallazgos.length} hallazgo(s)\n\n`
  md += `<sub>${esc(r.result.lente).slice(0, 700)}</sub>\n\n`
  for (const h of r.result.hallazgos) {
    md += `#### [${h.severidad}] ${esc(h.titulo)}\n\n`
    md += `- **id:** \`${h.id}\` · **doc:** ${h.doc} · **tipo:** ${h.tipo} · **protege a:** ${h.protege_a}\n`
    md += `- **Ubicación:** ${esc(h.ubicacion)}\n`
    md += `- **Norma:** ${esc(h.norma)}\n\n`
    md += `**Escenario de pérdida:** ${esc(h.escenario_de_perdida)}\n\n`
    md += `**Texto actual:**\n\n> ${esc(h.texto_actual).replace(/\n/g, '\n> ')}\n\n`
    md += `**Corrección propuesta:**\n\n> ${esc(h.correccion_exacta).replace(/\n/g, '\n> ')}\n\n---\n\n`
  }
}

if (veredictos.length) {
  md += `## VEREDICTOS DE REFUTACIÓN\n\n`
  for (const v of veredictos) {
    md += `- **${v.result.refutado ? 'REFUTADO' : 'SOBREVIVE'}** · severidad final: ${v.result.severidad_final} · agente \`${v.agentId}\`\n`
    md += `  - Razón: ${esc(v.result.razon)}\n`
    if (esc(v.result.defecto_de_la_correccion)) md += `  - Defecto de la corrección: ${esc(v.result.defecto_de_la_correccion)}\n`
    if (esc(v.result.correccion_ajustada)) md += `  - Corrección ajustada:\n\n    > ${esc(v.result.correccion_ajustada).replace(/\n/g, '\n    > ')}\n`
    md += `\n`
  }
}

if (textos.length) {
  md += `\n## ENTREGAS DE TEXTO LIBRE\n\n`
  for (const t of textos) md += `### \`${t.agentId}\`\n\n${t.result}\n\n---\n\n`
}

fs.writeFileSync(`${outBase}.md`, md, 'utf8')
console.log(`resultados=${resultados.length} lentes=${lentes.length} veredictos=${veredictos.length} textos=${textos.length}`)
