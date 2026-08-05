// Andrologia e Endocrinologia Masculina são a MESMA subespecialidade.
//
// ⚠️ O QUE ESTE TESTE EXISTE PARA IMPEDIR: em 04/08/2026 o Analytics mostrava as
// duas como linhas separadas — 84 questões rotuladas "Andrologia" e 3 como
// "Endocrinologia Masculina", com o desempenho dos alunos partido entre elas. O
// banco foi unificado, mas só isso não bastaria: a chave de merge de `provas` é
// enunciado+gabarito+instituição (`GLOBAL_MERGE_KEYS`), a **área não entra
// nela**, então o save de uma aba antiga com a cópia velha em memória
// reescreveria os 84 rótulos de volta sem ninguém perceber. Por isso a
// canonização roda AO CARREGAR, nos dois pontos onde `provasDB` nasce.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Recorta o mapa + a função do index.html real e executa de verdade.
const iMapa = APP.indexOf('var AREA_CANON=');
const iFim = APP.indexOf('var provasDB=', iMapa);
ok('achei o bloco de canonização no index.html', iMapa > 0 && iFim > iMapa);
const ctx = { Array, String };
vm.createContext(ctx);
vm.runInContext(APP.slice(iMapa, iFim), ctx);

// ---- 1. ⚠️ O RÓTULO ANTIGO É CANONIZADO -------------------------------------
{
  const lista = [
    { stem: 'q1', area: 'Andrologia' },
    { stem: 'q2', area: 'Endocrinologia Masculina' },
    { stem: 'q3', area: 'Diabetes' }
  ];
  ctx.canonProvaArea(lista);
  ok('⚠️ "Andrologia" vira "Endocrinologia Masculina"', lista[0].area === 'Endocrinologia Masculina', lista[0].area);
  ok('o rótulo canônico não é alterado', lista[1].area === 'Endocrinologia Masculina');
  ok('nenhuma outra área é tocada', lista[2].area === 'Diabetes', lista[2].area);
}

// ---- 2. sem excesso de zelo, e sem quebrar com lixo -------------------------
{
  const lista = [{ stem: 'sem area' }, null, { stem: 'vazia', area: '' }];
  let erro = null;
  try { ctx.canonProvaArea(lista); } catch (e) { erro = e; }
  ok('questão sem área, nula ou vazia não quebra a canonização', !erro, erro && erro.message);
  ok('e continua sem área', !lista[0].area && !lista[2].area);
  ok('lista inválida devolve array vazio', Array.isArray(ctx.canonProvaArea(null)) && ctx.canonProvaArea(null).length === 0);
  ok('a lista devolvida é a mesma (canoniza no lugar)', (function () { const l = [{ area: 'Andrologia' }]; return ctx.canonProvaArea(l) === l; })());
}

// ---- 3. ⚠️ OS DOIS PONTOS ONDE `provasDB` NASCE PASSAM PELA CANONIZAÇÃO -----
// Se um deles escapar, a cópia velha volta à tela e o Analytics reparte de novo.
{
  const atribuicoes = APP.split('\n')
    .map((l, i) => ({ n: i + 1, t: l }))
    .filter((l) => /(^|[^.\w])provasDB\s*=/.test(l.t) && !/canonProvaArea/.test(l.t));
  ok('⚠️ nenhuma atribuição de provasDB escapa da canonização', atribuicoes.length === 0,
     atribuicoes.map((l) => 'linha ' + l.n).join(', '));
  ok('e as duas atribuições conhecidas continuam lá',
     (APP.match(/provasDB\s*=\s*canonProvaArea\(/g) || []).length === 2,
     'esperado 2, achei ' + (APP.match(/provasDB\s*=\s*canonProvaArea\(/g) || []).length);
}

// ---- 4. o rótulo antigo não pode voltar por um <select> do painel -----------
// A área nova é escolhida em dropdown; se "Andrologia" reaparecer como opção, o
// professor recria a divisão sem querer no próximo cadastro.
{
  const sel = APP.slice(APP.indexOf('var DEFAULT_SUBESP='), APP.indexOf('var DEFAULT_SUBESP=') + 700);
  ok('⚠️ "Andrologia" não é oferecida no cadastro de questão', sel.indexOf('>Andrologia<') < 0);
  ok('e "Endocrinologia Masculina" continua sendo', sel.indexOf('>Endocrinologia Masculina<') > 0);
}

if (bad) { console.error('\n' + bad + ' verificação(ões) da área canônica falharam.'); process.exit(1); }
console.log('Área canônica (Andrologia = Endocrinologia Masculina): OK');
