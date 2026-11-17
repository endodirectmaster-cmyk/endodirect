#!/usr/bin/env node
// MURAL DE ARTIGOS NO CELULAR (proposta 3 da revisão de formatação; professor, 16/11/2026: "Pode ser").
// 🧨 Os modos de quebrar isto em silêncio:
//  - o título voltar justificado no celular (buracos entre as palavras numa coluna estreita);
//  - os filtros (4 caixas, a chave do Breaking News, 2 faixas e "Limpar") voltarem a ocupar a primeira tela;
//  - o botão "Filtros" ou o "Ler mais" aparecerem no computador, onde nada mudou;
//  - o texto longo ficar recolhido sem o botão para abrir (ou o curto ganhar botão à toa);
//  - o "Ler mais" ser ligado a cada render do Mural (um toque abriria e fecharia na mesma hora).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const blk = (html.match(/\/\* MURAL DE ARTIGOS NO CELULAR[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('achei o bloco CSS do Mural no celular', !!blk);
ok('🧨 título (e título original) alinhados à esquerda no celular', /\.mural-card h3,\.mural-title-orig\{text-align:left\}/.test(blk));
ok('🧨 filtros escondidos no celular até tocar em "Filtros"', /\.mural-filter-card:not\(\.aberto\)\{display:none\}/.test(blk) && /\.mural-filtros-bt\{display:flex/.test(blk));
ok('🧨 texto longo recolhido e aberto pelo cartão', /\.mural-text-longo\{[^}]*max-height:16em;overflow:hidden/.test(blk) && /\.mural-aberto \.mural-text-longo\{max-height:none/.test(blk) && /\.mural-mais\{display:inline-flex/.test(blk));
ok('🧨 no computador o botão "Filtros" e o "Ler mais" não existem', /\n\.mural-filtros-bt,\.mural-mais\{display:none\}\n/.test(html));

const ini = html.indexOf('function muralNoticeCardHTML(a,admin){');
const fim = html.indexOf('\nfunction ', html.indexOf('initMural=function(){', ini));
const card = html.slice(ini, html.indexOf('initMural=function(){', ini));
const init = html.slice(html.indexOf('initMural=function(){', ini), fim);
ok('achei o card e o render do Mural do aluno', ini > 0 && card.length > 200 && init.length > 500);

// o cartão: só o texto longo ganha o botão
const iife = (card.match(/\+\(function\(\)\{var _b=[\s\S]*?\}\)\(\)\n/) || [''])[0].replace(/^\+/, '').trim();
ok('achei o trecho do texto do cartão', !!iife);
const rodar = (texto) => vm.runInNewContext(iife, { a: { texto }, muralBodyText: (a) => a.texto, muralTextHTML: (t) => '<p>' + t + '</p>' });
const curto = rodar('Resumo curto.'), longo = rodar('x'.repeat(900));
ok('🧨 texto curto: sem recolher e sem botão', !/mural-text-longo|data-mural-mais/.test(curto), curto);
ok('🧨 texto longo: recolhido e com "Ler mais"', /class="mural-text mural-text-longo"/.test(longo) && /data-mural-mais aria-expanded="false">Ler mais</.test(longo));
ok('o cartão segue marcado (o "Ler mais" acha o cartão por ele)', /data-mural-card>/.test(card));

// o render: botão antes do cartão de filtros, contagem de filtros ativos, estado aberto lembrado
ok('🧨 botão "Filtros" logo antes do cartão de filtros', /id="mural-filtros-bt"[\s\S]{0,400}\+'<section class="mural-filter-card'\+\(muralFiltrosAbertos\?' aberto':''\)\+'">/.test(init));
ok('botão mostra quantos filtros estão ativos', /var _mfAtivos=\[muralFilter,muralTipoFilter,muralPeriodicoFilter\]\.filter/.test(init) && /'ativo':'ativos'/.test(init));
ok('tocar em "Filtros" abre e fecha sem refazer a lista', /mfb\.addEventListener\('click',function\(\)\{muralFiltrosAbertos=!muralFiltrosAbertos;[^}]*classList\.toggle\('aberto',muralFiltrosAbertos\)/.test(init));
ok('🧨 "Ler mais" ligado uma vez só', /if\(!muralMaisLigado\)\{muralMaisLigado=true;document\.addEventListener\('click'/.test(init) && /\nvar muralFiltrosAbertos=false,muralMaisLigado=false;/.test(html));
ok('"Ler mais" vira "Mostrar menos" e volta', /card\.classList\.toggle\('mural-aberto',abre\)/.test(init) && /'Mostrar menos':'Ler mais'/.test(init));
if (bad) { console.log('✗ Mural no celular: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Mural no celular: título à esquerda, filtros atrás de "Filtros", texto longo com "Ler mais"; computador como antes');
