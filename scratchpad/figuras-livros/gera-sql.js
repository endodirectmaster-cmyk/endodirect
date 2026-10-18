'use strict';
// GERA O UPDATE QUE LEVA OS RECORTES DE LIVROS AOS CAPÍTULOS, numa instrução só e sem o texto
// dos capítulos no SQL: só trocas pontuais por replace() no servidor —
//   · recorte novo: "<trecho>\n" → "<trecho>\n\n![legenda](url)\n\n";
//   · ilustração própria substituída: a linha da imagem SVG → a linha do recorte;
//   · recorte já gravado: a linha inteira → a linha atual (legenda nova).
// Guardas: md5 do resumo de cada capítulo antes e o md5 esperado depois (o mesmo texto da
// prévia, montado pelo texto.js); backup do estado inteiro na mesma instrução; e a conferência
// de que o resto de cada item, os outros itens e o estado fora de `diretrizes` não mudaram.
//   node gera-sql.js <id do backup> <motivo> <capítulo.json>... > saída.sql
// Os capítulos exportados ficam na pasta da sessão (nunca no repositório).
const fs = require('fs');
const crypto = require('crypto');
const T = require('./texto.js');
const [idBkp, motivo, ...arqs] = process.argv.slice(2);
if (!idBkp || !motivo || !arqs.length) { console.error('uso: node gera-sql.js <id do backup> <motivo> <capítulo.json>...'); process.exit(2); }
const md5 = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex');
const dq = (s, tag) => { if (s.indexOf('$' + tag + '$') >= 0) throw new Error('marcador $' + tag + '$ dentro do texto'); return '$' + tag + '$' + s + '$' + tag + '$'; };

const caps = arqs.map((arq) => {
  const cap = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const pos = Number(cap.pos);
  if (!Number.isInteger(pos)) throw new Error(arq + ': sem posição');
  const antes = String(cap.resumo || ''), depois = T.textoComFiguras(cap);
  const pares = [];
  for (const f of T.figurasDo(cap)) {
    const linha = T.linhaDe(f);
    const ja = antes.match(T.linhaGravada(T.arquivoDe(f)));
    if (ja) { if (ja[0] !== linha) pares.push([ja[0], linha]); continue; }
    if (f.substitui) {
      const m = antes.match(T.linhaGravada(f.substitui));
      if (!m) throw new Error(f.id + ': a ilustração a substituir não está no capítulo');
      pares.push([m[0], linha]);
      continue;
    }
    if (antes.split(f.depoisDe).length !== 2) throw new Error(f.id + ': o trecho não é único no capítulo');
    const p = antes.indexOf(f.depoisDe) + f.depoisDe.length;
    if (antes[p] !== '\n') throw new Error(f.id + ': o trecho não fecha a linha (a troca no servidor não reproduziria a prévia)');
    pares.push([f.depoisDe + '\n', f.depoisDe + '\n\n' + linha + '\n\n']);
  }
  let sim = antes;
  pares.forEach(([a, b]) => { if (sim.split(a).length !== 2) throw new Error(pos + ': troca não é única: ' + a.slice(0, 60)); sim = sim.replace(a, () => b); });
  if (sim !== depois) throw new Error(pos + ': as trocas não reproduzem o texto da prévia');
  if (!pares.length) throw new Error(pos + ': nada a gravar, o capítulo já está como a prévia');
  let expr = "g0.payload->'diretrizes'->" + pos + "->>'resumo'";
  pares.forEach(([a, b], k) => { expr = 'replace(' + expr + ', ' + dq(a, 'a' + pos + '_' + k) + ', ' + dq(b, 'b' + pos + '_' + k) + ')'; });
  return { pos, tema: cap.tema, MA: md5(antes), MD: md5(depois), expr, n: pares.length };
});

const D = (c) => "payload->'diretrizes'->" + c.pos;
const todos = (f) => caps.map(f).join(' and ');
// os outros itens: tira as posições de trás para a frente, para os índices não andarem
const semEles = (p) => caps.map((c) => c.pos).sort((a, b) => b - a).reduce((e, pos) => '(' + e + ' - ' + pos + ')', "(" + p + "->'diretrizes')");
let novoPayload = 'g.payload';
caps.forEach((c) => { novoPayload = "jsonb_set(" + novoPayload + ", '{diretrizes," + c.pos + ",resumo}', to_jsonb((select r" + c.pos + " from novo)))"; });

process.stdout.write(`-- ${caps.map((c) => c.pos + ' (' + c.n + ' troca(s); ' + c.MA.slice(0, 8) + ' → ' + c.MD.slice(0, 8) + ')').join(', ')}
with antes as (
  select ${caps.map((c) => 'md5(((' + D(c) + ") - 'resumo')::text) as resto" + c.pos).join(', ')},
    md5(${semEles('payload')}::text) as outras, md5((payload - 'diretrizes')::text) as fora,
    jsonb_array_length(payload->'diretrizes') as n
  from endodirect_global_state where id='main'
), novo as (
  select ${caps.map((c) => c.expr + ' as r' + c.pos).join(',\n    ')}
  from endodirect_global_state g0 where g0.id='main'
), bkp as (
  insert into endodirect_global_state_backup (id, payload, backed_up_at, motivo)
  select ${dq(idBkp, 'i')}, payload, now(), ${dq(motivo, 'm')} from endodirect_global_state
  where id='main' and ${todos((c) => 'md5(' + D(c) + "->>'resumo')='" + c.MA + "'")}
  returning 1
), upd as (
  update endodirect_global_state g set payload = ${novoPayload}, updated_at = now()
  where g.id='main' and ${todos((c) => 'md5(g.' + D(c) + "->>'resumo')='" + c.MA + "'")}
    and ${todos((c) => 'g.' + D(c) + "->>'tema'=" + dq(c.tema, 't' + c.pos))}
    and ${todos((c) => 'md5((select r' + c.pos + " from novo))='" + c.MD + "'")}
    and exists(select 1 from bkp)
  returning g.payload
)
select (select count(*) from bkp) as backup,
  ${todos((c) => 'md5(u.' + D(c) + "->>'resumo')='" + c.MD + "'")} as md5_ok,
  ${todos((c) => 'md5(((u.' + D(c) + ") - 'resumo')::text)=a.resto" + c.pos)} as resto_igual,
  md5(${semEles('u.payload')}::text)=a.outras as outras_iguais,
  md5((u.payload - 'diretrizes')::text)=a.fora as fora_igual,
  jsonb_array_length(u.payload->'diretrizes')=a.n as n_igual
from upd u, antes a;
`);
