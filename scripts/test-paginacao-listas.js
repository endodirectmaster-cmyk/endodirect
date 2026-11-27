#!/usr/bin/env node
// PAGINAÇÃO 10/30/50 EM PODCASTS E REVISÃO (proposta 5 da revisão de formatação; professor, 16/11/2026: "Pode ser").
// 🧨 Os modos de quebrar isto em silêncio:
//  - os ~210 episódios ou os ~930 cards voltarem numa página só;
//  - trocar o filtro dos Podcasts deixar a página antiga (ex.: página 15 de um filtro com 2 páginas → lista vazia);
//  - a escolha "N por página" não ficar guardada, ou aceitar um valor fora de 10/30/50;
//  - um episódio ou card sumir na emenda entre páginas.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  return html.slice(ini + 1, html.indexOf('\n}', ini) + 2);
}
const ls = {};
const ctx = { QOTD_POR_OPCOES: [10, 30, 50], lsGet: (k) => ls[k], esc: (x) => String(x) };
vm.createContext(ctx);
vm.runInContext(['listaPorLido', 'listaPaginas', 'listaPorHTML'].map(corpo).join('\n'), ctx);
ok('sem escolha guardada: 10 por página', vm.runInContext("listaPorLido('x')", ctx) === 10);
ls.x = '30'; ok('escolha guardada vale (30)', vm.runInContext("listaPorLido('x')", ctx) === 30);
ls.x = '7'; ok('🧨 valor fora de 10/30/50 volta a 10', vm.runInContext("listaPorLido('x')", ctx) === 10);
const pg = (t, p, n) => JSON.stringify(vm.runInContext('listaPaginas(' + t + ',' + p + ',' + n + ')', ctx));
ok('210 episódios em 10: 21 páginas', pg(210, 10, 0) === '{"paginas":21,"pagina":0}');
ok('🧨 página além do fim encosta na última', pg(25, 10, 14) === '{"paginas":3,"pagina":2}');
ok('lista vazia: 1 página, página 0', pg(0, 10, 3) === '{"paginas":1,"pagina":0}');
const h = vm.runInContext("listaPorHTML('pod',30,210,'episódios')", ctx);
ok('caixa com as três opções e a escolhida marcada', /id="pod-por"/.test(h) && /value="30" selected/.test(h) && (h.match(/<option/g) || []).length === 3 && /210 episódios/.test(h));
ok('sem rótulo: sem contagem repetida (Revisão já mostra o total no título)', !/933/.test(vm.runInContext("listaPorHTML('srl',10,933,'')", ctx)));
// emenda entre páginas: nenhum item some nem repete
const itens = Array.from({ length: 933 }, (_, i) => i);
let vistos = [];
for (let p = 0; p < 94; p++) vistos = vistos.concat(itens.slice(p * 10, p * 10 + 10));
ok('🧨 a fatia por página cobre todos os itens, sem repetir', vistos.length === 933 && new Set(vistos).size === 933);

const pod = corpo('renderPodcasts');
ok('🧨 Podcasts mostram só a fatia da página', /var _mostra=(?:list|_ver)\.slice\(podPagina\*podPor,podPagina\*podPor\+podPor\);/.test(pod) && /listaPorHTML\('pod',podPor,(?:list|_ver)\.length,/.test(pod) && /_mostra\.map\(function\(p\)/.test(pod) && !/el\.innerHTML=list\.map/.test(pod));
ok('Podcasts: navegação e caixa ligadas, escolha guardada', /muralPagerHTML\(podPagina,_pg\.paginas,'pod-pag'\)/.test(pod) && /qotdArchLigaPaginacao\(el,'pod',function\(n\)\{podPor=n;lsSet\('pod_por_pagina',n\);podPagina=0;renderPodcasts\(\);\}/.test(pod));
ok('🧨 trocar o filtro dos Podcasts volta à página 1', /k==='podfilter'\)\{podFilter=v;podPagina=0;renderPodcasts\(\);\}/.test(html));
ok('estado dos Podcasts lido do aparelho', /\nvar podPor=listaPorLido\('pod_por_pagina'\),podPagina=0,podMaisLigado=false;/.test(html));
const sr = corpo('renderSR');
ok('🧨 Revisão mostra só a fatia da página', /DB\.fc\.slice\(srPagina\*srPor,srPagina\*srPor\+srPor\)\.map\(/.test(sr) && !/el\.innerHTML=DB\.fc\.map/.test(sr));
ok('Revisão: navegação e caixa ligadas, escolha guardada', /muralPagerHTML\(srPagina,_pg\.paginas,'srl-pag'\)/.test(sr) && /qotdArchLigaPaginacao\(el,'srl',function\(n\)\{srPor=n;lsSet\('sr_por_pagina',n\);srPagina=0;renderSR\(\);\}/.test(sr) && /\nvar srPor=listaPorLido\('sr_por_pagina'\),srPagina=0;/.test(html));
ok('caixa com 16 px no celular (o iPhone não amplia)', /@media \(max-width:820px\)\{\.lista-por select\{font-size:16px\}\}/.test(html));
if (bad) { console.log('✗ paginação de Podcasts e Revisão: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ paginação de Podcasts e Revisão: 10/30/50 guardado no aparelho, filtro volta à página 1, nenhum item some na emenda');
