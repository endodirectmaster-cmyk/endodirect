#!/usr/bin/env node
// LISTAS POR SUBESPECIALIDADE COMPACTAS (proposta 2 da revisão de formatação; professor, 16/11/2026: "Pode ser").
// 🧨 Os modos de quebrar isto em silêncio:
//  - o cartão voltar a ícone numa linha e nome noutra no celular (~100 px por área);
//  - a regra pegar também os cartões de curso (com capa), que não têm ícone;
//  - Flashcards voltarem a outra ordem de áreas (as outras abas seguem DIR_SUBS);
//  - "Transgeneridade · 0 diretrizes" voltar para o aluno;
//  - o "1 capítulo" repetido voltar em cada tema dos Resumos (e o cadeado da degustação sumir).
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
  let i = html.indexOf('{', ini), prof = 0, q = null;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return html.slice(ini + 1, i + 1);
}
const cel = (html.match(/\/\* LISTAS POR SUBESPECIALIDADE EM LINHA NO CELULAR[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('🧨 no celular, cartão em linha: ícone à esquerda, nome e contagem à direita', /\.dir-sub-btn:has\(> \.dsb-ico\)\{display:grid;grid-template-columns:2\.1rem minmax\(0,1fr\)/.test(cel) && /\.dsb-ico\{grid-row:1 \/ span 3/.test(cel) && /\.dsb-cnt,[^{]*\.dsb-vid\{grid-column:2/.test(cel));
ok('🧨 só nos cartões que começam pelo ícone (curso com capa fica como está)', !/\.dir-sub-btn\{display:grid/.test(cel) && /:has\(> \.dsb-ico\)/.test(cel));

// ordem dos Flashcards = DIR_SUBS
const ctx = { DB: { fc: [] }, subOf: (c) => c.sub, acervoEhNovo: () => false };
vm.createContext(ctx);
vm.runInContext((html.match(/\nvar DIR_SUBS=[^;]+;/) || [''])[0] + (html.match(/\nvar FC_CATS=[^;]+;/) || [''])[0] + corpo('fcSubList'), ctx);
const fc = vm.runInContext('fcSubList().map(function(o){return o.sub;})', ctx);
const dirs = vm.runInContext('DIR_SUBS', ctx), cats = vm.runInContext('FC_CATS', ctx);
const naOrdem = fc.filter((s) => dirs.indexOf(s) >= 0);
ok('🧨 Flashcards na ordem das outras abas (DIR_SUBS)', JSON.stringify(naOrdem) === JSON.stringify(dirs.filter((s) => cats.indexOf(s) >= 0)), naOrdem.join(', '));
ok('nenhuma área dos Flashcards se perdeu', cats.every((s) => fc.indexOf(s) >= 0) && fc.length === cats.length);

const dv = corpo('diretrizesViewHTML');
ok('🧨 área sem item não aparece para o aluno (Diretrizes)', /\.filter\(function\(s\)\{return s\.count>0;\}\);/.test(dv));
ok('🧨 contagem do tema só quando passa de 1; cadeado da degustação mantido', /\(lk\?'<div class="dsb-cnt">Exclusivo p\/ assinantes<\/div>':\(t\.count>1\?'<div class="dsb-cnt">'\+_cnt\(t\.count\)\+'<\/div>':''\)\)/.test(dv));
if (bad) { console.log('✗ listas por subespecialidade: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ listas por subespecialidade: em linha no celular (só cartões com ícone), Flashcards na ordem das outras abas, sem área vazia nas Diretrizes, sem "1 capítulo" repetido');
