#!/usr/bin/env node
// Lê o resultado do workflow de expansão, valida cada capítulo e gera o SQL
// (UPDATE atômico por-tema, trocando SÓ o campo resumo). Preserva pts/mapa/
// flashcards/fluxogramas/figuras (não os toca).
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || '/tmp/claude-0/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/tasks/wz6n46w1c.output';
const raw = fs.readFileSync(OUT, 'utf8');
const data = JSON.parse(raw);
const chapters = data.result;
if (!Array.isArray(chapters)) { console.error('result não é array'); process.exit(1); }

const SUB = 'Endocrinologia Básica';
const dir = path.join(__dirname, 'expanded');
fs.mkdirSync(dir, { recursive: true });

// ---- validação por capítulo ----
function emptyTableCells(md) {
  const lines = md.split('\n');
  const bad = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue; // linha separadora --- OK
    // células = entre pipes, ignorando os pipes das bordas
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    if (cells.some(c => c === '')) bad.push(t);
  }
  return bad;
}

let allOk = true;
const report = [];
for (const c of chapters) {
  const md = String(c.resumo || '');
  const issues = [];
  if (md.length < 5000) issues.push('curto (' + md.length + ' < 5000)');
  if (!/^##\s/m.test(md)) issues.push('sem títulos ##');
  if (!/\|\s*---/.test(md)) issues.push('sem tabela');
  const empt = emptyTableCells(md);
  if (empt.length) issues.push('células vazias: ' + empt.length + ' → ' + empt[0]);
  if (/\bPMID[:\s]*\d/i.test(md) || /\b10\.\d{4,9}\/\S+/.test(md)) issues.push('possível PMID/DOI inventado');
  if (/https?:\/\//.test(md)) issues.push('contém link http');
  // delimitadores dollar-quote não podem aparecer no texto
  report.push({ tema: c.tema, len: md.length, ok: c.ok, verifyIssues: (c.issues || []).length, valIssues: issues });
  if (issues.length) allOk = false;
  // salva .md durável
  fs.writeFileSync(path.join(dir, c.tema.replace(/[^\w]+/g, '_').slice(0, 40) + '.md'), md);
}

console.log('=== RELATÓRIO DE VALIDAÇÃO ===');
for (const r of report) {
  console.log(`\n• ${r.tema}`);
  console.log(`  len=${r.len}  verify.ok=${r.ok}  verifyIssues=${r.verifyIssues}`);
  console.log(`  validação: ${r.valIssues.length ? r.valIssues.join(' | ') : 'OK'}`);
}

// ---- gera SQL atômico (CTE VALUES + jsonb_set por tema) ----
function dq(tag, s) {
  const d = '$' + tag + '$';
  if (String(s).includes(d)) throw new Error('delimitador ' + d + ' aparece no texto de ' + tag);
  return d + s + d;
}
const rows = chapters.map((c, i) => {
  const tTag = 'TEM' + i, rTag = 'RES' + i;
  return '    (' + dq(tTag, c.tema) + ', ' + dq(rTag, String(c.resumo)) + ')';
}).join(',\n');

const sql =
`with nv(tema, resumo) as (
  values
${rows}
)
update endodirect_global_state gs
set payload = jsonb_set(
  gs.payload, '{diretrizes}',
  (
    select jsonb_agg(
      case
        when d->>'sub' = '${SUB}' and nv.tema is not null
          then jsonb_set(d, '{resumo}', to_jsonb(nv.resumo))
        else d
      end
      order by ord
    )
    from jsonb_array_elements(gs.payload->'diretrizes') with ordinality as t(d, ord)
    left join nv on nv.tema = d->>'tema'
  )
);`;

fs.writeFileSync(path.join(__dirname, 'expand.sql'), sql);
console.log('\n=== SQL gerado ===');
console.log('bytes:', Buffer.byteLength(sql, 'utf8'));
console.log('arquivo:', path.join(__dirname, 'expand.sql'));
console.log('validação global:', allOk ? 'TUDO OK' : 'HÁ PENDÊNCIAS — revisar antes de aplicar');
