'use strict';
// GERA O UPDATE QUE LEVA AS ILUSTRAÇÕES DE UM CAPÍTULO AO BANCO, sem o texto do capítulo
// no SQL: só trocas pontuais por replace() no servidor —
//   · ilustração nova: "<âncora>\n" → "<âncora>\n\n![legenda](url)\n\n";
//   · ilustração já gravada: a linha da imagem inteira → a linha atual (legenda nova).
// Guardas: md5 do resumo de antes e md5 esperado depois (o mesmo texto da prévia,
// montado pelo texto.js); backup do estado inteiro na mesma instrução; e a conferência
// de que o resto do item, os outros itens e o estado fora de `diretrizes` não mudaram.
//   node gera-sql.js <capítulo.json> <posição> <id do backup> <motivo> > saída.sql
// O capítulo exportado fica na pasta da sessão (nunca no repositório).
const fs = require('fs');
const crypto = require('crypto');
const T = require('./texto.js');
const [arq, pos, idBkp, motivo] = process.argv.slice(2);
if (!arq || !/^\d+$/.test(pos || '') || !idBkp || !motivo) { console.error('uso: node gera-sql.js <capítulo.json> <posição> <id do backup> <motivo>'); process.exit(2); }
const BASE = 'https://www.endodirect.com.br';
const cap = JSON.parse(fs.readFileSync(arq, 'utf8'));
const md5 = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex');
const antes = String(cap.resumo || ''), depois = T.textoComIlustracoes(cap, BASE);
const pares = [];
for (const i of T.ilustracoesDo(cap)) {
  const linha = '![' + T.escAlt(i.legenda) + '](' + BASE + '/figuras/resumos/ilustracoes/' + T.arquivoDe(i) + ')';
  const m = antes.match(T.linhaGravada(T.arquivoDe(i)));
  if (m) { if (m[0] !== linha) pares.push([m[0] + '\n', linha + '\n']); continue; }
  const p = antes.indexOf(i.depoisDe) + i.depoisDe.length;
  if (antes.split(i.depoisDe).length !== 2) throw new Error(i.id + ': âncora não é única no capítulo');
  if (antes[p] !== '\n') throw new Error(i.id + ': a âncora não fecha a linha (a troca no servidor não reproduziria a prévia)');
  pares.push([i.depoisDe + '\n', i.depoisDe + '\n\n' + linha + '\n\n']);
}
let sim = antes;
pares.forEach(([a, b]) => { if (sim.split(a).length !== 2) throw new Error('troca não é única: ' + a.slice(0, 60)); sim = sim.replace(a, b); });
if (sim !== depois) throw new Error('as trocas não reproduzem o texto da prévia');
if (!pares.length) { console.error('nada a gravar: o capítulo já está como a prévia'); process.exit(3); }
const dq = (s, tag) => { if (s.indexOf('$' + tag + '$') >= 0) throw new Error('marcador $' + tag + '$ dentro do texto'); return '$' + tag + '$' + s + '$' + tag + '$'; };
let expr = "g0.payload->'diretrizes'->" + pos + "->>'resumo'";
pares.forEach(([a, b], k) => { expr = 'replace(' + expr + ', ' + dq(a, 'a' + k) + ', ' + dq(b, 'b' + k) + ')'; });
const MA = md5(antes), MD = md5(depois);
process.stdout.write(`-- ${cap.tema}: ${pares.length} troca(s); md5 ${MA} → ${MD}
with antes as (
  select md5(((payload->'diretrizes'->${pos}) - 'resumo')::text) as resto, md5(((payload->'diretrizes') - ${pos})::text) as outras, md5((payload - 'diretrizes')::text) as fora
  from endodirect_global_state where id='main'
), novo as (
  select ${expr} as r from endodirect_global_state g0 where g0.id='main'
), bkp as (
  insert into endodirect_global_state_backup (id, payload, backed_up_at, motivo)
  select ${dq(idBkp, 'i')}, payload, now(), ${dq(motivo, 'm')} from endodirect_global_state
  where id='main' and md5(payload->'diretrizes'->${pos}->>'resumo')='${MA}'
  returning 1
), upd as (
  update endodirect_global_state g set payload = jsonb_set(g.payload, '{diretrizes,${pos},resumo}', to_jsonb((select r from novo))), updated_at = now()
  where g.id='main' and md5(g.payload->'diretrizes'->${pos}->>'resumo')='${MA}'
    and g.payload->'diretrizes'->${pos}->>'tema'=${dq(cap.tema, 't')}
    and md5((select r from novo))='${MD}' and exists(select 1 from bkp)
  returning md5(g.payload->'diretrizes'->${pos}->>'resumo') as novo_md5, md5(((g.payload->'diretrizes'->${pos}) - 'resumo')::text) as resto,
    md5(((g.payload->'diretrizes') - ${pos})::text) as outras, md5((g.payload - 'diretrizes')::text) as fora, jsonb_array_length(g.payload->'diretrizes') as n
)
select (select count(*) from bkp) as backup, u.novo_md5, u.novo_md5='${MD}' as md5_ok, u.resto=a.resto as resto_igual, u.outras=a.outras as outras_iguais, u.fora=a.fora as fora_igual, u.n
from upd u, antes a;
`);
