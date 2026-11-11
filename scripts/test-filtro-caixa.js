#!/usr/bin/env node
// FILTROS EM CAIXA DE SELEÇÃO (11/11/2026).
//
// Pedido do professor: as fileiras de botões de filtro (Calculadoras: "Todas 25,
// Lípides 4…"; Flashcards e Mapas Mentais: "Todos (49), DM1, DM2…") ficavam expostas e
// ocupavam a tela. Viraram uma caixa de seleção com rótulo, no painel do professor e
// no do aluno. As opções só aparecem ao abrir a caixa.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - voltar a desenhar a fileira de botões em algum dos cinco lugares;
//  - a caixa perder o ouvinte de 'change' (escolher não filtraria nada);
//  - a opção escolhida não vir marcada ao redesenhar (a caixa voltaria a "Todos").
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

// ---- 1. nenhuma fileira de botões sobrou ------------------------------------------------
['data-calcarea', 'data-fctema', 'data-mmtema', 'data-admfc-tema', 'data-admmm-tema', 'data-podfilter'].forEach((a) =>
  ok('🧨 sem botões ' + a, html.indexOf(a) < 0));

// ---- 2. as cinco caixas existem ------------------------------------------------------------
[["'Área',\\s*'calcarea'", 'Calculadoras'], ["'Subtópico','fctema'", 'Flashcards do aluno'], ["'Subtópico','mmtema'", 'Mapas do aluno'],
 ["'Subtópico','admfctema'", 'Flashcards do professor'], ["'Subtópico','admmmtema'", 'Mapas do professor'], ["'Subespecialidade','podfilter'", 'Podcasts do aluno']].forEach(([re, nome]) =>
  ok('caixa de filtro em ' + nome, new RegExp('filtroCaixaHTML\\(' + re).test(html)));

// ---- 3. um ouvinte de 'change' trata as cinco ----------------------------------------------
const ouv = (html.match(/document\.addEventListener\('change',function\(e\)\{[\s\S]*?\n\}\);/) || [''])[0];
ok('🧨 ouvinte de change para select[data-filtro]', /sel\.matches\('select\[data-filtro\]'\)/.test(ouv));
[["calcarea", /calcAreaFiltro=v;renderCalcGrid\(\);/], ["fctema", /fcTema=v;renderFC\(\);/], ["mmtema", /mmTema=v;renderMMList\(\);/],
 ["admfctema", /admFcTema=v;admFcEditId=null;renderAdmSec\('flashcards'\);/], ["admmmtema", /admMMTema=v;renderAdmSec\('mapas'\);/], ["podfilter", /podFilter=v;renderPodcasts\(\);/]].forEach(([k, re]) =>
  ok('🧨 escolher em ' + k + ' filtra e redesenha', new RegExp("k==='" + k + "'\\)\\{" + re.source).test(ouv)));

// ---- 4. o HTML da caixa ----------------------------------------------------------------------
const fn = (html.match(/function filtroCaixaHTML\(rotulo,chave,opcoes,atual\)\{[\s\S]*?\n\}/) || [''])[0];
ok('função filtroCaixaHTML encontrada', !!fn);
const ctx = { esc: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') };
vm.createContext(ctx);
vm.runInContext(fn + '\nthis.f=filtroCaixaHTML;', ctx);
const h = ctx.f('Subtópico', 'fctema', [{ v: '', t: 'Todos (49)' }, { v: 'DM1', t: 'DM1 (2)' }, { v: 'A & "B"', t: 'A & "B" (1)' }], 'DM1');
ok('rótulo visível e acessível', /<span class="filtro-caixa-rot">Subtópico<\/span>/.test(h) && /aria-label="Subtópico"/.test(h));
ok('🧨 a opção atual vem marcada', /<option value="DM1" selected>DM1 \(2\)<\/option>/.test(h) && !/<option value="" selected>/.test(h), h);
ok('sem filtro, "Todos" vem marcado', /<option value="" selected>Todos/.test(ctx.f('X', 'k', [{ v: '', t: 'Todos (1)' }, { v: 'a', t: 'a (1)' }], '')));
ok('texto e valor escapados', /value="A &amp; &quot;B&quot;"/.test(h));

// ---- 4b. pedidos do mesmo dia (11/11/2026) no painel do aluno -----------------------------
ok('🧨 Flashcards do aluno: sem "Gerar com IA"', !/id="fc-btn-gen"/.test(html) && !/function genFC\(/.test(html));
ok('🧨 Flashcards do aluno: sem botão de excluir', !/class="fc-del"/.test(html) && !/data-fcdel/.test(html));
ok('🧨 Mapas do aluno: sem "Gerar com IA"', !/id="btn-mmgen"/.test(html) && !/function genMM\(/.test(html) && !/genMM=function/.test(html));
ok('Mapas do aluno: o "Manual" continua', /id="btn-mmblank"/.test(html));
ok('🧨 Mapas do aluno: a linha inteira abre, sem "Ver" e sem selo "Professor"',
  /class="mm-item mm-abre" data-mmviewshared="'\+j\+'" role="button" tabindex="0"/.test(html) && /class="mm-item mm-abre" data-mmview="'\+i\+'" role="button" tabindex="0"/.test(html)
  && !/data-mmviewshared="'\+j\+'">Ver<\/button>/.test(html) && !/tag tag-pur" style="font-size:\.55rem">Professor<\/span>/.test(html));
ok('🧨 o "×" do mapa é tratado antes de abrir, e a estrela não abre o mapa',
  html.indexOf("var mmd=c('[data-mmdel]')") > 0 && html.indexOf("var mmd=c('[data-mmdel]')") < html.indexOf("var mmvs=c('[data-mmviewshared]');if(mmvs&&!c('[data-fav-t]'))"));
ok('Enter e espaço abrem a linha do mapa', /if\(!t\|\|!t\.classList\|\|!t\.classList\.contains\('mm-abre'\)\)return;\s*e\.preventDefault\(\);t\.click\(\);/.test(html));
ok('🧨 Mural de artigos: sem o quadro "Avisos para alunos / Calendário, notícias e leituras essenciais"',
  !/class="mural-hero"/.test(html) && !/Avisos para alunos/.test(html) && !/Calendário, notícias e leituras essenciais/.test(html));
ok('Mural de artigos: os filtros continuam', (html.match(/el\.innerHTML='<div class="mural-shell">'/g) || []).length === 2 && /<section class="mural-filter-card">/.test(html));
ok('Banco de questões: sem "Sortear 5"; a caixa "só as que ainda não respondi" fica', !/btn-sortear-5/.test(html) && /id="q-naofeitas"/.test(html));
ok('🧨 Resumidor: sem "Gerar flashcards" (não pede, não salva e não mostra flashcards)',
  !/id="art-gen-fc"/.test(html) && !/genFCck/.test(html) && !/Gere 5 flashcards/.test(html) && !/data-afcflip/.test(html)
  && !/cat:'Artigos'/.test(html));
ok('Resumidor: o "Gerar questões" continua', /<input type="checkbox" id="art-gen-q" checked/.test(html) && /\(genQ\?'Gere 3 questões\.':''\)/.test(html));
ok('🧨 Questão do Dia: sem a legenda embaixo do título (pedido de 11/11/2026)', !/Responda as questões do dia já publicadas/.test(html) && /<div class="ph"><h1>🧠 Questão do Dia<\/h1><\/div>\s*<div class="pc">\s*<div id="panel-qotd-body"><\/div>/.test(html));
ok('Mural: título e título original justificados, última linha à esquerda (pedido de 11/11/2026)', /\.mural-card h3\{[^}]*text-align:justify;text-align-last:left\}/.test(html) && /\.mural-title-orig\{[^}]*text-align:justify;text-align-last:left\}/.test(html));

// ---- 5. estilo ---------------------------------------------------------------------------------
ok('caixa com largura contida e que encolhe no celular', /\.filtro-caixa\{display:flex;flex-direction:column;gap:\.28rem;flex:0 1 19rem;min-width:12rem;max-width:100%\}/.test(html));

if (bad) { console.log('\n' + bad + ' falha(s): filtros em caixa'); process.exit(1); }
console.log('filtros em caixa (Calculadoras, Flashcards, Mapas, Podcasts), painel do aluno enxuto, Resumidor só com questões e Mural sem o quadro de avisos: ok');
