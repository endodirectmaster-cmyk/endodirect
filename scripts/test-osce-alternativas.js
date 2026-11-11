#!/usr/bin/env node
// OSCE: ALTERNATIVAS SEM PISTA DE TAMANHO E LEITOR QUE CONSERTA A PONTUAÇÃO (11/11/2026).
//
// Na medição do OSCE em duas partes (fechada sem merge: o professor manteve a chamada
// única, pelo rigor), duas coisas valiam para a versão no ar também:
//  - a correta era a alternativa MAIS LONGA em 39 de 40 passos (o aluno acerta pelo
//    tamanho). O pedido ganhou a regra das alternativas de tamanho parecido;
//  - 3 de 20 respostas fechavam o objeto das alternativas com chave+colchete, ou só
//    colchete, antes de "correct", e o gerador pedia tudo de novo (o dobro da espera). O
//    leitor (parseJ) passou a acertar essa pontuação, só quando a leitura normal falha.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - perder a regra das alternativas no pedido;
//  - o conserto "consertar" JSON que já era válido, ou aceitar texto que não é JSON;
//  - o pedido do OSCE deixar de ser uma chamada só com os 4 passos (decisão do professor).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function bloco(inicio) {
  const i = html.indexOf(inicio);
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

// ---- 1. o pedido do OSCE ------------------------------------------------------------------------
const iS = html.lastIndexOf('startSim=function(){');
const start = html.slice(iS, html.indexOf('renderSimStep=function(){', iS));
ok('🧨 OSCE em uma chamada só, com os 4 passos (decisão do professor, 11/11/2026)',
  /var sys=groundSys\('Você é preceptor de endocrinologia conduzindo/.test(start) && /Use EXATAMENTE 4 passos PROGRESSIVOS/.test(start) && (start.match(/callAIJson\(/g) || []).length === 1);
ok('🧨 regra: alternativas de tamanho parecido, a correta não se destaca pelo tamanho',
  /As alternativas de cada passo devem ter tamanho parecido: a correta não pode se destacar por ser a mais longa ou a mais detalhada;/.test(start));
ok('regra: nenhuma distratora se contradiz com os números do caso', /nenhuma distratora pode se contradizer com os números do próprio caso\./.test(start));
ok('o resto do pedido fica (feedback rico, diretrizes, distratoras plausíveis, terminologia)',
  /Os feedbacks podem ser ricos, mas mantenha SÓ 4 passos\./.test(start) && /As distratoras devem ser plausíveis\./.test(start) && /doença renal do diabetes/.test(start));

// ---- 2. o leitor ------------------------------------------------------------------------------------
const pj = bloco('function parseJ(raw){');
ok('parseJ encontrado', !!pj);
const ctx = { JSON, String };
vm.createContext(ctx);
vm.runInContext(pj + ';this.p=parseJ;', ctx);
const A = '{"intro":"v","steps":[{"pergunta":"p","options":{"A":"a","B":"b","C":"c","D":"d"';
const r1 = ctx.p(A + '}],"correct":"A","feedback":"f"}]}');
const r2 = ctx.p(A + '],"correct":"A","feedback":"f"}]}');
ok('🧨 alternativas fechadas com chave+colchete: lidas sem pedir tudo de novo', r1 && r1.steps[0].correct === 'A' && Object.keys(r1.steps[0].options).join('') === 'ABCD' && r1.steps[0].feedback === 'f');
ok('🧨 alternativas fechadas só com colchete: lidas', r2 && r2.steps[0].correct === 'A' && r2.steps[0].feedback === 'f');
const q = ctx.p('{"questions":[{"stem":"s","options":{"A":"a","B":"b"}],"answer":"B"}]}');
ok('o conserto vale para "answer" (outros geradores)', q && q.questions[0].answer === 'B');
ok('com cerca de markdown, também', !!ctx.p('```json\n' + A + '}],"correct":"A","feedback":"f"}]}\n```'));
ok('🧨 JSON válido fica igual (alternativas em lista)', JSON.stringify(ctx.p('{"q":[{"options":["a","b"],"answer":"A"}]}')) === '{"q":[{"options":["a","b"],"answer":"A"}]}');
ok('JSON válido normal fica igual', JSON.stringify(ctx.p('{"steps":[{"options":{"A":"x"},"correct":"A"}]}')) === '{"steps":[{"options":{"A":"x"},"correct":"A"}]}');
ok('🧨 texto que não é JSON continua sem leitura', ctx.p('nada aqui') === null && ctx.p('') === null);
ok('sem chaves literais na linha do conserto (os testes extraem funções contando chaves)', !/var fx=c\.replace\([^\n]*[{}]/.test(pj));

if (bad) { console.log('\n' + bad + ' falha(s): OSCE, alternativas e leitor'); process.exit(1); }
console.log('OSCE: chamada única, alternativas sem pista de tamanho, e leitor que acerta a pontuação: ok');
