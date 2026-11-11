#!/usr/bin/env node
// QUESTÃO DO DIA: LISTA EM PÁGINAS DE 10, 30 OU 50 (11/11/2026).
//
// Pedido do professor: "um filtro também para o aluno escolher se na página vai ter uma
// visualização de 10 ou 30 questões ... e o restante ser na próxima página, e assim
// sucessivamente", e depois: "Deixa paginação 10/30/50".
//  - caixa "N por página" (10, 30 ou 50) ao lado da ordem; padrão 10; a escolha fica no aparelho;
//  - "‹ Anterior · Página X de Y · Próxima ›" no fim da lista;
//  - trocar a ordem ou o tamanho volta à página 1;
//  - a questão aberta sozinha (a de hoje) ou por link abre na página dela;
//  - a aba "Como o aluno vê" do professor tem a mesma paginação, com estado próprio.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a lista voltar a mostrar tudo de uma vez (sem fatiar);
//  - a última página perder as que sobram, ou repetir questões entre páginas;
//  - a questão de hoje (ou do link) cair numa página que não é a mostrada;
//  - a escolha não ser lembrada, ou um valor salvo inválido virar tamanho de página.
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

// ---- 1. as funções, rodando ---------------------------------------------------------------------
const opc = (html.match(/var QOTD_POR_OPCOES=\[[^\]]*\];/) || [''])[0];
ok('🧨 tamanhos de página: 10, 30 e 50 (pedido do professor)', opc === 'var QOTD_POR_OPCOES=[10,30,50];', opc);
const fontes = ['function qotdArchDate(q){', 'function qotdArchOrdenadas(all,ordem){', 'function qotdArchPaginaDe(all,ordem,id,por){',
  'function qotdArchPaginas(n,por){', 'function qotdArchListHTML(all,mm,aberto,ordem,hoje,pre,pag){', 'function muralPagerHTML(page,pages,pfx){'].map(bloco);
fontes.forEach((f, i) => ok('função ' + (i + 1) + ' encontrada', !!f));
const ctx = { Math, Date, esc: s => String(s), qotdCardHTML: q => '[cartão ' + q.id + ']' };
vm.createContext(ctx);
vm.runInContext(opc + fontes.join('\n'), ctx);

// 65 questões, uma por dia: q1 a mais antiga, q65 a mais recente
const all = [];
for (let i = 1; i <= 65; i++) all.push({ id: 'q' + i, postedAt: Date.UTC(2026, 0, i) });
const ids = h => (h.match(/data-qa-toggle="(q\d+)"/g) || []).map(s => s.slice(16, -1));
const pag = (por, pagina, ordem, aberto) => ctx.qotdArchListHTML(all, {}, aberto || null, ordem || 'recent', null, 'qa', { por, pagina });

let h = pag(10, 0);
ok('🧨 página 1 de 10: só 10 questões, as mais recentes', ids(h).length === 10 && ids(h)[0] === 'q65' && ids(h)[9] === 'q56', ids(h).join(','));
ok('contagem de respondidas é do arquivo todo, não da página', /0 de 65 respondidas/.test(h));
ok('navegação "Página 1 de 7", sem Anterior e com Próxima', /Página 1 de 7/.test(h) && /id="qa-pag-prev" disabled/.test(h) && /id="qa-pag-next">/.test(h));
ok('caixa "por página" com 10 marcada', /<select id="qa-por"[^>]*>/.test(h) && /<option value="10" selected>10 por página<\/option>/.test(h) && /<option value="30">30 por página<\/option>/.test(h) && /<option value="50">50 por página<\/option>/.test(h));
h = pag(10, 6);
ok('🧨 última página fica com as que sobram (5)', ids(h).join(',') === 'q5,q4,q3,q2,q1' && /Página 7 de 7/.test(h) && /id="qa-pag-next" disabled/.test(h));
// todas as páginas juntas = o arquivo inteiro, sem repetir
[10, 30, 50].forEach(por => {
  const vistos = [];
  for (let p = 0; p < ctx.qotdArchPaginas(65, por); p++) vistos.push(...ids(pag(por, p)));
  ok('🧨 com ' + por + ' por página, as páginas somam as 65 sem repetir', vistos.length === 65 && new Set(vistos).size === 65);
});
ok('30 por página: 3 páginas; 50: 2', ctx.qotdArchPaginas(65, 30) === 3 && ctx.qotdArchPaginas(65, 50) === 2 && /Página 2 de 2/.test(pag(50, 1)));
ok('página fora do intervalo é presa à última', ids(pag(30, 9)).length === 5 && /Página 3 de 3/.test(pag(30, 9)));
ok('mais antigas primeiro: a página 1 começa por q1', ids(pag(10, 0, 'old'))[0] === 'q1');
ok('🧨 página da questão: q56 cai na 1ª (recentes, 10), q55 na 2ª, q1 na 7ª', ctx.qotdArchPaginaDe(all, 'recent', 'q56', 10) === 0 && ctx.qotdArchPaginaDe(all, 'recent', 'q55', 10) === 1 && ctx.qotdArchPaginaDe(all, 'recent', 'q1', 10) === 6);
ok('página da questão na ordem antiga e com 30', ctx.qotdArchPaginaDe(all, 'old', 'q31', 30) === 1 && ctx.qotdArchPaginaDe(all, 'old', 'nada', 30) === -1);
ok('a aberta mostra o cartão na página dela', /\[cartão q12\]/.test(pag(10, 5, 'recent', 'q12')));
ok('com 10 ou menos questões, sem navegação', !/qa-pag-prev/.test(ctx.qotdArchListHTML(all.slice(0, 8), {}, null, 'recent', null, 'qa', { por: 10, pagina: 0 })));
ok('sem `pag`, a lista continua inteira (compatível)', ids(ctx.qotdArchListHTML(all, {}, null, 'recent', null, 'qa')).length === 65);
ok('prefixo do professor não cruza com o do aluno', /id="admqal-por"/.test(ctx.qotdArchListHTML(all, {}, null, 'recent', null, 'admqal', { por: 10, pagina: 0 })) && /id="admqal-pag-next"/.test(ctx.qotdArchListHTML(all, {}, null, 'recent', null, 'admqal', { por: 10, pagina: 0 })));

// ---- 2. o aluno ---------------------------------------------------------------------------------------
const est = (html.match(/var qotdArchPor=\(function\(\)\{[^\n]*\n/) || [''])[0];
ok('🧨 tamanho lembrado no aparelho (qotd_por_pagina), padrão 10, valor inválido vira 10',
  /lsGet\('qotd_por_pagina'\)/.test(est) && /QOTD_POR_OPCOES\.indexOf\(v\)>=0\?v:10/.test(est));
const ra = bloco('function renderQotdArchive(){');
ok('aluno: lista desenhada com a página e o tamanho', /qotdArchListHTML\(all,mm,qotdArchOpen,qotdArchSort,hoje,'qa',\{por:qotdArchPor,pagina:qotdArchPagina\}\)/.test(ra));
ok('🧨 aluno: a de hoje (aberta sozinha) e a do link vão para a página delas',
  /qotdArchOpen=hoje\.id;qotdArchIrAberto=true;/.test(ra) && /\(qotdArchIrAberto\|\|qotdArchRolar\)&&qotdArchOpen/.test(ra) && /qotdArchPagina=_pg/.test(ra));
ok('aluno: trocar a ordem volta à página 1', /qotdArchSort=so\.value;qotdArchPagina=0;/.test(ra));
ok('🧨 aluno: trocar o tamanho grava a escolha e volta à página 1', /qotdArchPor=n;lsSet\('qotd_por_pagina',n\);qotdArchPagina=0;/.test(ra));
ok('aluno: Anterior/Próxima ligados', /qotdArchLigaPaginacao\(el,'qa',/.test(ra) && /qotdArchPagina\+=d;/.test(ra));
const lig = bloco('function qotdArchLigaPaginacao(el,pre,aoMudarPor,aoMudarPagina){');
ok('trocar de página leva ao topo da lista', /pre\+'-pag-prev'/.test(lig) && /pre\+'-pag-next'/.test(lig) && /scrollIntoView/.test(lig));

// ---- 3. a aba do professor ------------------------------------------------------------------------
const rp = bloco('function renderAdmQotdAluno(){');
ok('professor: estado próprio de página', /admQotdAlunoPor=10,admQotdAlunoPagina=0;/.test(html));
ok('professor: lista com página, de hoje na página dela, ordem volta à 1',
  /\{por:admQotdAlunoPor,pagina:admQotdAlunoPagina\}/.test(rp) && /qotdArchPaginaDe\(all,admQotdAlunoSort,hoje\.id,admQotdAlunoPor\)/.test(rp) && /admQotdAlunoSort=so\.value;admQotdAlunoPagina=0;/.test(rp));
ok('professor: tamanho não grava no aparelho do aluno (só muda a tela)', /qotdArchLigaPaginacao\(el,'admqal',/.test(rp) && !/lsSet\(/.test(rp));

if (bad) { console.log('\n' + bad + ' falha(s): paginação da Questão do Dia'); process.exit(1); }
console.log('✓ Questão do Dia em páginas de 10, 30 ou 50: fatia certa, navegação, escolha lembrada, a de hoje na página dela, e o mesmo na aba do professor');
