#!/usr/bin/env node
// PROPOSTAS 6, 8 E 15 DA REVISÃO DE FORMATAÇÃO (professor, 17/11/2026: "Concordo com tudo").
// 🧨 Os modos de quebrar isto em silêncio:
//  - contadores de Revisão, Caderno de erros e Enquete voltarem a empilhar no celular (meia tela só de números);
//  - Calculadoras voltarem a 3 linhas por cartão no celular, ou a unidade virar "CATEGO…" de tão espremida;
//  - a lista da Questão do Dia do aluno voltar a mostrar só a data (sem área nem começo do enunciado).
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
const painel = (id) => (html.match(new RegExp('<div class="panel" id="' + id + '">[\\s\\S]*?<div class="pc">\\s*<div class="g3 contadores"')) || [''])[0];
// 8
ok('🧨 Revisão: contadores com a classe da linha única', !!painel('panel-sr'));
ok('🧨 Caderno de erros: contadores com a classe da linha única', !!painel('panel-erros'));
ok('🧨 Enquete EMC: 4 contadores em 2×2', /var cab='<div class="g4 contadores" style="margin-bottom:1rem">'/.test(html));
const cel = (html.match(/\/\* CONTADORES NUMA LINHA[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
ok('no celular: 3 numa linha, 4 em 2×2', /\.g3\.contadores\{grid-template-columns:repeat\(3,1fr\)/.test(cel) && /\.g4\.contadores\{grid-template-columns:repeat\(2,1fr\)/.test(cel));
ok('"Dominados" sem o "(≥7d)"', !/Dominados \(≥7d\)/.test(html));
// 15
ok('🧨 Calculadoras no celular: nome e unidade numa linha, sem "Abrir →"', /\.calc-area-grid \.calc-card\{flex-direction:row;/.test(cel) && /\.calc-area-grid \.calc-card \.calc-go\{display:none\}/.test(cel) && /\.calc-area-grid \.calc-card\{flex-wrap:nowrap\}/.test(cel));
ok('🧨 a unidade tem até 46% da linha (não vira "CATEGO…")', /\.calc-card-ft\{margin-top:0;padding-top:0;flex:0 1 auto;min-width:0;max-width:46%/.test(cel) && /\.calc-card-nm\{flex:1 1 0;min-width:0\}/.test(cel));
// 6
const ctx = { Math, Date, esc: (x) => String(x), qotdCardHTML: (q) => '[cartão ' + q.id + ']', QOTD_POR_OPCOES: [10, 30, 50] };
vm.createContext(ctx);
vm.runInContext((html.match(/var MESES_PT=\[[^\]]*\];/) || [''])[0] + ['qotdArchDate', 'qotdArchOrdenadas', 'qotdArchPaginas', 'qotdArchListHTML', 'muralPagerHTML', 'admQotdTrecho'].map(corpo).join('\n'), ctx);
const dia = (d) => new Date(2026, 10, d, 10).getTime();
const all = [{ id: 'a', postedAt: dia(17), sub: 'Adrenal', stem: 'Mulher de 58 anos com incidentaloma adrenal de 2 cm...' }, { id: 'b', postedAt: new Date(2026, 9, 30, 10).getTime(), sub: 'Tireoide', stem: 'Homem de 40 anos com nódulo tireoidiano.' }];
const h = vm.runInContext('qotdArchListHTML', ctx)(all, { b: { ok: true } }, null, 'recent', null, 'qa', { por: 10, pagina: 0 });
ok('🧨 lista do aluno no formato do professor (mês, data em bloco, área, trecho)', /class="adm-qa-lista qa-lista-aluno"/.test(h) && /<div class="adm-qa-mes">Novembro de 2026<\/div>/.test(h) && /<div class="adm-qa-mes">Outubro de 2026<\/div>/.test(h) && /<span class="aqa-data"[^>]*><b>17<\/b><small>nov<\/small><\/span>/.test(h) && /<span class="aqa-sub">Adrenal<\/span>/.test(h) && /<span class="aqa-trecho">Mulher de 58 anos/.test(h), h.slice(0, 600));
ok('situação (Responder/Acertou) segue no cabeçalho', /<span class="qa-badge new">Responder<\/span>/.test(h) && /<span class="qa-badge ok">✓ Acertou<\/span>/.test(h));
ok('o toque continua abrindo a questão (mesmo atributo)', /data-qa-toggle="a"/.test(h));
if (bad) { console.log('✗ contadores, Calculadoras e Questão do Dia: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ contadores numa linha no celular, Calculadoras compactas, Questão do Dia do aluno no formato do professor');
