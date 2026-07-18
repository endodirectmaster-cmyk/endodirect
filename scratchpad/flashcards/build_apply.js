#!/usr/bin/env node
/* Revisão de flashcards: encurtar respostas e quebrar as longas em 2 perguntas.
   Lê a saída do workflow (74 itens revisados) + as 88 chaves originais.
   1) valida cada item (q/a não-vazios; toda RESPOSTA curta; nº de cards sensato);
   2) monta UPDATE atômico por (sub,tema,privado) trocando SÓ o campo flashcards;
   3) reporta as chaves faltantes (a re-processar). */
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || '/tmp/claude-0/-home-user-endodirect/e01a6b7b-c80e-5daa-bda4-d192aa1099f9/tasks/w96uqdtnj.output';
const SUF = process.argv[3] || '';   // sufixo p/ nome dos arquivos de saída (ex.: "14")
const KEYS = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys88.json'), 'utf8'));

const raw = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const results = Array.isArray(raw) ? raw : raw.result;

const ANS_MAX = 220;   // limite de resposta (a meta é ~160; toleramos até 220)
const Q_MAX = 160;
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const keyOf = o => o.sub + '||' + o.tema + '||' + String(o.privado);

let ok = true;
const items = [];
const seen = new Set();
for (const r of results) {
  const k = keyOf(r);
  if (seen.has(k)) { console.log('⚠️ DUPLICADO no output:', k); ok = false; continue; }
  seen.add(k);
  const fcRaw = Array.isArray(r.flashcards) ? r.flashcards : [];
  const fc = fcRaw.map(x => ({ q: norm(x && x.q), a: norm(x && x.a) })).filter(x => x.q && x.a);
  const issues = [];
  if (fc.length < 3) issues.push('poucos cards:' + fc.length);
  if (fc.length > 16) issues.push('cards demais:' + fc.length);
  const longA = fc.filter(x => x.a.length > ANS_MAX);
  if (longA.length) issues.push('respostas longas:' + longA.length + ' (max ' + Math.max(...fc.map(x => x.a.length)) + ')');
  const longQ = fc.filter(x => x.q.length > Q_MAX);
  if (longQ.length) issues.push('perguntas longas:' + longQ.length);
  if (fcRaw.length !== fc.length) issues.push('cards vazios descartados:' + (fcRaw.length - fc.length));
  if (issues.length) { ok = false; console.log('⚠️ ' + r.sub + ' / ' + r.tema + ' [' + r.privado + '] → ' + issues.join(' | ')); }
  items.push({ sub: r.sub, tema: r.tema, privado: String(r.privado) === 'true', flashcards: fc });
}

// chaves faltantes
const doneKeys = new Set(items.map(i => i.sub + '||' + i.tema + '||' + String(i.privado)));
const missing = KEYS.filter(k => !doneKeys.has(k.sub + '||' + k.tema + '||' + String(k.privado)));

// ---- SQL: UPDATE atômico. Casa cada item por sub+tema+privado e troca flashcards.
// Usa jsonb_agg(CASE ...) para reconstruir o array diretrizes preservando o resto.
const map = {};
items.forEach(i => { map[i.sub + '' + i.tema + '' + (i.privado ? 't' : 'f')] = i.flashcards; });
const jsonMap = JSON.stringify(items.map(i => ({ sub: i.sub, tema: i.tema, privado: i.privado, flashcards: i.flashcards })));
const TAG = '$fc$';
if (jsonMap.includes(TAG)) throw new Error('delimitador colide');

const sql =
`with repl as (
  select
    elem->>'sub'    as sub,
    elem->>'tema'   as tema,
    (elem->>'privado')::boolean as privado,
    elem->'flashcards' as fc
  from jsonb_array_elements(${TAG}${jsonMap}${TAG}::jsonb) elem
)
update endodirect_global_state gs
set payload = jsonb_set(
  gs.payload, '{diretrizes}',
  (
    select coalesce(jsonb_agg(
      case
        when r.fc is not null
          then jsonb_set(d, '{flashcards}', r.fc)
        else d
      end
    ), '[]'::jsonb)
    from jsonb_array_elements(coalesce(gs.payload->'diretrizes','[]'::jsonb)) d
    left join repl r
      on r.sub = d->>'sub'
     and r.tema = d->>'tema'
     and r.privado = coalesce((d->>'privado')::boolean, false)
  )
);`;

fs.writeFileSync(path.join(__dirname, 'apply'+SUF+'.sql'), sql);
console.log('\n=== RESUMO ===');
console.log('itens válidos p/ aplicar:', items.length, '| bytes SQL:', Buffer.byteLength(sql, 'utf8'));
console.log('validação:', ok ? 'TUDO OK' : 'HÁ AVISOS (revisar acima)');
console.log('faltantes (re-processar):', missing.length);
missing.forEach(m => console.log('   -', m.sub, '/', m.tema, '[' + m.privado + ']'));
fs.writeFileSync(path.join(__dirname, 'missing'+SUF+'.json'), JSON.stringify(missing, null, 0));
// estatística de tamanho de resposta pós-revisão
const allA = items.flatMap(i => i.flashcards.map(x => x.a.length));
allA.sort((a, b) => a - b);
console.log('respostas:', allA.length, '| max:', allA[allA.length - 1], '| p50:', allA[Math.floor(allA.length / 2)], '| >200:', allA.filter(x => x > 200).length);
