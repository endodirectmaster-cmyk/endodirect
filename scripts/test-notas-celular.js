#!/usr/bin/env node
// NOTAS NO CELULAR (proposta 4 da revisão de formatação; professor, 16/11/2026: "Pode ser").
// 🧨 Os modos de quebrar isto em silêncio:
//  - lista (195 px) e editor voltarem lado a lado no celular, espremidos;
//  - a nota abrir no celular sem caminho de volta para a lista;
//  - o "← Notas" perder o que foi escrito (voltar sem salvar);
//  - excluir a nota deixar o celular numa tela vazia (editor fechado, lista escondida);
//  - a regra do celular vazar para o computador (as duas colunas seguem lá).
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
  const fim = html.indexOf('\n}', ini);
  return html.slice(ini + 1, fim + 2);
}
const blk = (html.match(/\/\* NOTAS NO CELULAR[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('achei o bloco CSS das Notas no celular', !!blk);
ok('🧨 uma coluna no celular (vence o estilo em linha do painel)', /#panel-notas\{flex-direction:column!important\}/.test(blk) && /#panel-notas \.notas-lista\{width:auto!important;border-right:0!important;flex:1\}/.test(blk));
ok('🧨 sem nota aberta: só a lista; com nota aberta: só o editor', /#panel-notas:not\(\.nota-aberta\) \.notas-editor-col\{display:none!important\}/.test(blk) && /#panel-notas\.nota-aberta \.notas-lista\{display:none!important\}/.test(blk));
ok('busca com 16 px (o iPhone não amplia ao tocar)', /#panel-notas #note-search\{font-size:16px!important\}/.test(blk));
ok('barra do editor numa linha só no celular', /#panel-notas \.notas-barra\{[^}]*flex-wrap:nowrap!important/.test(blk));
ok('🧨 "← Notas" só no celular', /\n\.note-voltar\{display:none\}\n/.test(html) && /#panel-notas \.note-voltar\{display:inline-flex/.test(blk));

const painel = (html.match(/<div class="panel" id="panel-notas"[\s\S]*?\n    <\/div>\n/) || [''])[0];
ok('as duas colunas e a barra têm as classes que o CSS usa', /<div class="notas-lista" style="width:195px/.test(painel) && /<div class="notas-editor-col"/.test(painel) && /<div class="notas-barra"/.test(painel));
ok('🧨 botão "← Notas" no começo da barra do editor', /<div class="notas-barra"[^>]*>\s*<button class="note-tb-btn note-voltar" id="btn-note-back"/.test(painel));
ok('botão ligado à função de voltar', /getElementById\('btn-note-back'\)\.addEventListener\('click',voltarNotasCelular\)/.test(html));

// comportamento: abrir marca o painel; voltar salva o que mudou e desmarca; excluir desmarca
const els = {};
const el = (id) => (els[id] = els[id] || { id, value: '', innerHTML: '', style: {}, cls: new Set(), classList: { toggle(c, on) { on ? els[id].cls.add(c) : els[id].cls.delete(c); }, contains(c) { return els[id].cls.has(c); } } });
const salvos = [];
const ctx = {
  DB: { notes: [{ id: 7, title: 'A', body: '<p>x</p>', at: 1 }] }, noteId: null,
  document: { getElementById: el }, window: { scrollTo() {} },
  persist() { salvos.push('persist'); }, renderNoteList() {}, refreshDash() {}, notify() {},
};
vm.createContext(ctx);
vm.runInContext('var noteId=null;' + ['openNote', 'saveNote', 'deleteNote', 'notaAbertaCelular', 'voltarNotasCelular'].map(corpo).join('\n'), ctx);
vm.runInContext('openNote(7)', ctx);
ok('🧨 abrir a nota marca o painel (.nota-aberta)', el('panel-notas').classList.contains('nota-aberta'));
vm.runInContext('voltarNotasCelular()', ctx);
ok('voltar sem mudar nada não grava', salvos.length === 0 && !el('panel-notas').classList.contains('nota-aberta'), JSON.stringify(salvos));
vm.runInContext('openNote(7)', ctx);
el('note-title-input').value = 'A editada';
vm.runInContext('voltarNotasCelular()', ctx);
ok('🧨 voltar com mudança salva antes', salvos.length === 1 && vm.runInContext('DB.notes[0].title', ctx) === 'A editada' && !el('panel-notas').classList.contains('nota-aberta'));
vm.runInContext('openNote(7);deleteNote()', ctx);
ok('🧨 excluir volta para a lista no celular', !el('panel-notas').classList.contains('nota-aberta') && vm.runInContext('DB.notes.length', ctx) === 0);
if (bad) { console.log('✗ Notas no celular: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Notas no celular: uma coluna, nota em tela própria com "← Notas" (salva o que mudou), excluir volta à lista; computador como antes');
