#!/usr/bin/env node
// Gera 5 SQLs AUTO-VERIFICÁVEIS (um por capítulo). Cada um embute o resumo em
// base64 + o md5 esperado; só grava o resumo se md5(decode(b64)) == esperado.
// Corrupção em trânsito → 0 linhas afetadas (detectável), nunca escrita errada.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = process.argv[2] || '/tmp/claude-0/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/tasks/wz6n46w1c.output';
const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const chapters = data.result;
const SUB = 'Endocrinologia Básica';
const dir = path.join(__dirname, 'apply');
fs.mkdirSync(dir, { recursive: true });

function dq(tag, s) { const d = '$' + tag + '$'; if (String(s).includes(d)) throw new Error('delim ' + d + ' no texto'); return d + s + d; }

const index = [];
chapters.forEach((c, i) => {
  const resumo = String(c.resumo);
  const b64 = Buffer.from(resumo, 'utf8').toString('base64');
  const md5 = crypto.createHash('md5').update(resumo, 'utf8').digest('hex');
  const temaLit = dq('TEMA', c.tema);
  const sql =
`-- Capítulo ${i}: ${c.tema} (len=${resumo.length}, md5=${md5})
update endodirect_global_state gs
set payload = jsonb_set(
  gs.payload, '{diretrizes}',
  (
    select jsonb_agg(
      case
        when d->>'sub' = '${SUB}'
         and d->>'tema' = ${temaLit}
         and md5(convert_from(decode('${b64}','base64'),'UTF8')) = '${md5}'
          then jsonb_set(d, '{resumo}', to_jsonb(convert_from(decode('${b64}','base64'),'UTF8')))
        else d
      end
      order by ord
    )
    from jsonb_array_elements(gs.payload->'diretrizes') with ordinality as t(d, ord)
  )
)
where exists (
  select 1 from jsonb_array_elements(gs.payload->'diretrizes') d
  where d->>'sub' = '${SUB}' and d->>'tema' = ${temaLit}
    and md5(convert_from(decode('${b64}','base64'),'UTF8')) = '${md5}'
);`;
  const file = path.join(dir, 'apply_' + i + '.sql');
  fs.writeFileSync(file, sql);
  index.push({ i, tema: c.tema, len: resumo.length, md5, file, bytes: Buffer.byteLength(sql, 'utf8') });
});

fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2));
console.log('Gerados', index.length, 'arquivos em', dir);
index.forEach(r => console.log(`  apply_${r.i}.sql  ${r.bytes}B  len=${r.len}  md5=${r.md5}  ${r.tema}`));
