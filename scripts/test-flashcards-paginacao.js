#!/usr/bin/env node
// FLASHCARDS EM PÁGINAS, COM "N POR PÁGINA" (13/11/2026).
//
// Professor, com print da grade de Tireoide (50 cards de uma vez): "Limitar o número de
// aparecimentos de flashcards por página e o restante nas páginas seguintes. E deixar um campo
// também de filtro de números por página. Por exemplo, 10, 30 ou 50." E logo depois: "Deixa 5, 10
// ou 30, é melhor. E o padrão sendo de 5".
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a grade voltar a despejar todos os cards de uma vez;
//  - a caixa "por página" sumir, ou aceitar um número fora de 5/10/30;
//  - trocar de subespecialidade/subtópico/tamanho e continuar numa página que não existe;
//  - o card recém-criado ficar escondido numa página que o aluno não está vendo.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}
const decl = (html.match(/var FC_POR_OPCOES=\[5,10,30\];\nvar fcPor=[^\n]*\n/) || [''])[0];
ok('🧨 opções 5, 10 e 30 por página; a escolha fica guardada (fc_por_pagina); começa em 5', !!decl && /lsGet\('fc_por_pagina'\)/.test(decl) && /:5;\}\)\(\),fcPagina=0;/.test(decl));

// ── A grade, rodando ─────────────────────────────────────────────────────────────────────
let grade = '', linha = '';
const ctx = {
  Math, String, Array, Object, parseInt,
  DB: { fc: [] }, fcFilter: 'Tireoide', fcTema: '',
  lsGet: () => null,
  renderFcProfBadge() {}, subOf: (c) => c.cat, temaOf: () => 'Geral', temaListFor: () => [],
  fcCatColor: () => '#0f766e', favStarHTML: () => '', novoSeloHTML: () => '',
  dirSubIcon: () => '', fcSubList: () => [], novosSufixoHTML: () => '',
  document: {
    getElementById: (id) => ({
      'fc-grid': { set innerHTML(v) { grade = v; }, get innerHTML() { return grade; }, className: '' },
      'fc-filter-row': { style: {}, set innerHTML(v) { linha = v; }, get innerHTML() { return linha; } },
    })[id] || null,
  },
};
vm.createContext(ctx);
vm.runInContext(decl + ['esc', 'filtroCaixaHTML', 'muralPagerHTML', 'renderFC'].map(corpo).join('\n'), ctx);
vm.runInContext("for(var i=0;i<53;i++)DB.fc.push({id:'c'+i,front:'Pergunta '+(i+1),back:'R',cat:'Tireoide'});", ctx);
const cards = () => (grade.match(/class="fc-card"/g) || []).length;
const primeiro = () => (grade.match(/<div class="fc-front">([^<]*)</) || [, ''])[1];
const rodar = (js) => { vm.runInContext(js + ';renderFC()', ctx); };

rodar('fcPor=fcPor;fcPagina=0');
ok('🧨 padrão 5 por página: a grade mostra 5 cards, não os 53 (veio ' + cards() + ')', cards() === 5 && primeiro() === 'Pergunta 1');
ok('a navegação diz onde o aluno está ("1–5 de 53", "Página 1 de 11")', /1–5 de 53 flashcards/.test(grade) && /Página 1 de 11/.test(grade) && /id="fc-pag-next"/.test(grade));
ok('🧨 caixa "Por página" ao lado do Subtópico, com 5/10/30 e a atual marcada',
  /data-filtro="fcpor"/.test(linha) && /<option value="5" selected>5 por página<\/option><option value="10">10 por página<\/option><option value="30">30 por página<\/option>/.test(linha));
rodar('fcPagina=1');
ok('página 2 começa no 6º card', primeiro() === 'Pergunta 6' && cards() === 5);
rodar('fcPor=10;fcPagina=5');
ok('a última página tem o resto (3 cards) e "Próxima" desligada', cards() === 3 && /id="fc-pag-next" disabled/.test(grade));
rodar('fcPor=30;fcPagina=0');
ok('30 por página: 30 cards, 2 páginas', cards() === 30 && /Página 1 de 2/.test(grade));
rodar('fcPor=30;fcPagina=99');
ok('🧨 página que não existe cai na última (sem grade vazia)', cards() === 23 && /31–53 de 53/.test(grade));
rodar('fcPor=30;fcPagina=0;DB.fc=DB.fc.slice(0,4)');
ok('com poucos cards, sem navegação', cards() === 4 && !/fc-pag-next/.test(grade));

// ── Ligações ────────────────────────────────────────────────────────────────────────────
ok('🧨 a caixa só aceita 10/30/50, guarda a escolha e volta à 1ª página',
  /else if\(k==='fcpor'\)\{var _n=\+v;if\(FC_POR_OPCOES\.indexOf\(_n\)>=0\)\{fcPor=_n;lsSet\('fc_por_pagina',_n\);\}fcPagina=0;renderFC\(\);\}/.test(html));
ok('🧨 trocar de subtópico volta à 1ª página', /else if\(k==='fctema'\)\{fcTema=v;fcPagina=0;renderFC\(\);\}/.test(html));
ok('🧨 trocar de subespecialidade volta à 1ª página', /fcFilter=_fv===''\?null:_fv;fcTema='';fcPagina=0;renderFC\(\);/.test(html));
ok('abrir os Flashcards começa da 1ª página', /if\(id==='flash'\)\{fcFilter=null;fcPagina=0;renderFC\(\);\}/.test(html));
ok('🧨 card recém-criado: abre a última página, onde ele está', /fcTema='';fcPagina=1e9;/.test(corpo('saveFC')));
ok('Anterior/Próxima andam e levam ao topo da grade', /fcPagina--;renderFC\(\);topo\(\);/.test(corpo('renderFC')) && /fcPagina\+\+;renderFC\(\);topo\(\);/.test(corpo('renderFC')));

if (bad) { console.log('✗ flashcards em páginas: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ flashcards em páginas: 5/10/30 por página (padrão 5), navegação e volta à 1ª ao trocar o filtro');
