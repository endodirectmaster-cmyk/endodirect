#!/usr/bin/env node
// TEXTO SEMPRE JUSTIFICADO NOS RESUMOS, DIRETRIZES E MURAL (professor, 17/11/2026, prints dos Resumos no iPhone:
// "Deixar todos os textos ... sempre no modo justificado"). Os parágrafos já eram; os itens de lista (•), não.
// 🧨 Quebra silenciosa: um item de lista voltar a text-align:left, ou o justificado valer só no celular.
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond) => { if (cond) return; bad++; console.log('  ✗ ' + nome); };
const regra = (html.match(/\n\.dir-card \.dir-texto p,\.dir-card \.dir-texto li,\.mural-text \.mural-ul li,\.dir-ficha \.fx-band>span:last-child\{([^}]*)\}/) || ['', ''])[1];
ok('🧨 parágrafos e itens de lista dos Resumos/Diretrizes, itens do Mural e faixas da ficha: justificados em toda largura', /text-align:justify;text-align-last:left/.test(regra));
ok('hifenização (pt-BR) para não abrir buracos na coluna estreita', /hyphens:auto/.test(regra) && /<html lang="pt-BR">/.test(html));
ok('🧨 lista do Mural não volta a alinhar à esquerda', /\.mural-text \.mural-ul\{[^}]*text-align:justify/.test(html) && !/\.mural-text \.mural-ul\{[^}]*text-align:left/.test(html));
ok('alinhamento escolhido no editor (L/C/D) continua mandando', /\.mural-text \[style\*="text-align:center"\],\.dir-texto \[style\*="text-align:center"\]\{text-align-last:center\}/.test(html));
if (bad) { console.log('✗ texto justificado: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ texto justificado nos Resumos, Diretrizes e Mural (parágrafos, itens de lista e faixas da ficha)');
