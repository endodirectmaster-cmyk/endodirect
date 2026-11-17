#!/usr/bin/env node
// DASHBOARD COMPACTO NO CELULAR (proposta 1 da revisão de formatação; professor, 16/11/2026: "Pode ser").
// 🧨 Os modos de quebrar isto em silêncio:
//  - os 6 números do acervo voltarem a um por linha no celular (meia tela só de números);
//  - o trio Flashcards / Cards p/ revisar / Meus mapas voltar a empilhar (o .g3 vira 1 coluna no celular);
//  - Cronograma, Revisão e Notas voltarem a três cartões, ou perderem os ids que os preenchem e os botões;
//  - o cartão de atalhos perder as três colunas no computador.
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const blocoCel = (html.match(/\/\* DASHBOARD COMPACTO NO CELULAR[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('existe o bloco do celular (até 820 px)', !!blocoCel);
ok('🧨 números do acervo em 2 colunas no celular', /\.dash-acervo\{grid-template-columns:1fr 1fr/.test(blocoCel));
ok('números menores para caber em 2 colunas', /\.acv-num\{font-size:1\.45rem/.test(blocoCel) && /\.acv-ico\{width:30px;height:30px/.test(blocoCel));
ok('🧨 trio numa linha de 3 no celular (vence o .g3 de 1 coluna)', /\.g3\.dash-mini\{grid-template-columns:repeat\(3,1fr\)/.test(blocoCel) && /<div class="g3 dash-mini"[^>]*>\s*<div class="card"[^>]*id="dc-flash"/.test(html));
const atalhos = (html.match(/<div class="card dash-atalhos">([\s\S]*?)\n {8}<\/div>\n {7}<\/div>/) || ['', ''])[1];
ok('🧨 Cronograma, Revisão e Notas num cartão só', (atalhos.match(/class="dash-at"/g) || []).length === 3);
for (const id of ['d-crono-btn', 'd-crono-prev', 'd-sr-btn', 'd-sr-prev', 'd-notas-btn', 'd-notas-prev']) ok('🧨 mantém #' + id, atalhos.indexOf('id="' + id + '"') > 0);
ok('título e botão na mesma linha (sem o card-head que empilha no celular)', !/card-head/.test(atalhos) && /\.dash-at-h\{display:flex;align-items:center;justify-content:space-between/.test(html));
ok('🧨 computador: três colunas com divisória', /\.card\.dash-atalhos\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);padding:0\}/.test(html) && /\.dash-at\+\.dash-at\{border-left:1px solid var\(--bd\)\}/.test(html));
ok('celular: uma coluna com divisória horizontal', /\.card\.dash-atalhos\{grid-template-columns:1fr\}/.test(blocoCel) && /\.dash-at\+\.dash-at\{border-left:0;border-top:1px solid var\(--bd\)\}/.test(blocoCel));
if (bad) { console.log('✗ dashboard compacto: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ dashboard compacto: acervo 2×3 e trio numa linha no celular; Cronograma/Revisão/Notas num cartão (3 colunas no computador, 1 no celular)');
