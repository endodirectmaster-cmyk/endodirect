#!/usr/bin/env node
// Repadroniza títulos de TABELA com o prefixo "📊" nos 5 capítulos de
// Endocrinologia Básica. Identifica cada "## Título" cuja seção contém uma
// tabela markdown (linha separadora | --- |) e que NÃO comece com 📊, e gera
// um UPDATE que faz replace() SÓ nesses títulos (não reescreve o resumo).
// O emoji é gerado no SQL via chr(128202) — nenhum emoji no texto do SQL.
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || '/tmp/claude-0/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/tasks/wz6n46w1c.output';
const chapters = JSON.parse(fs.readFileSync(OUT, 'utf8')).result; // {tema, resumo}
const SUB = 'Endocrinologia Básica';
const BAR = String.fromCodePoint(0x1F4CA); // 📊

function tableHeadingsNeeding(md) {
  const lines = md.split('\n');
  const heads = [];
  // marca índices de cabeçalhos ##
  const idxs = [];
  for (let i = 0; i < lines.length; i++) if (/^##\s+/.test(lines[i])) idxs.push(i);
  for (let k = 0; k < idxs.length; k++) {
    const start = idxs[k], end = (k + 1 < idxs.length) ? idxs[k + 1] : lines.length;
    const heading = lines[start];
    const body = lines.slice(start + 1, end);
    const hasTable = body.some(l => /^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|/.test(l) && l.includes('|'));
    if (!hasTable) continue;
    if (/^##\s+📊/.test(heading)) continue; // já tem
    // texto após "## "
    const title = heading.replace(/^##\s+/, '');
    heads.push({ heading, title });
  }
  return heads;
}

function dq(tag, s) { const d = '$' + tag + '$'; if (String(s).includes(d)) throw new Error('delim ' + d + ' no texto'); return d + s + d; }

const plan = [];
chapters.forEach((c) => {
  const heads = tableHeadingsNeeding(String(c.resumo));
  if (heads.length) plan.push({ tema: c.tema, heads });
});

console.log('=== PLANO (títulos de tabela que receberão 📊) ===');
plan.forEach(p => { console.log('\n• ' + p.tema); p.heads.forEach(h => console.log('   "' + h.heading + '"  ->  "## 📊 ' + h.title + '"')); });
if (!plan.length) { console.log('Nada a fazer — todos os títulos de tabela já têm 📊.'); process.exit(0); }

// gera UPDATE único: para cada capítulo, replace() aninhado dos seus títulos.
// old = dollar-quoted; new = '## ' || chr(128202) || ' ' || <título> (sem emoji no SQL)
function replExpr(inner, h) {
  const oldLit = dq('O', h.heading);                 // "## Título"
  const newLit = "('## ' || chr(128202) || ' ' || " + dq('N', h.title) + ")";
  return 'replace(' + inner + ', ' + oldLit + ', ' + newLit + ')';
}
const cases = plan.map(p => {
  let expr = "d->>'resumo'";
  p.heads.forEach(h => { expr = replExpr(expr, h); });
  return "        when d->>'sub' = '" + SUB + "' and d->>'tema' = " + dq('T', p.tema) + "\n          then jsonb_set(d, '{resumo}', to_jsonb(" + expr + "))";
}).join('\n');

const sql =
`update endodirect_global_state gs
set payload = jsonb_set(
  gs.payload, '{diretrizes}',
  (
    select jsonb_agg(
      case
${cases}
        else d
      end
      order by ord
    )
    from jsonb_array_elements(gs.payload->'diretrizes') with ordinality as t(d, ord)
  )
);`;

fs.writeFileSync(path.join(__dirname, 'emoji_fix.sql'), sql);
console.log('\nSQL:', path.join(__dirname, 'emoji_fix.sql'), '(' + Buffer.byteLength(sql, 'utf8') + ' bytes)');
