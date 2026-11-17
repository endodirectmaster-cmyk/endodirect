#!/usr/bin/env node
// PROPOSTAS 9 E 10 DA REVISÃO DE FORMATAÇÃO + PEDIDO PONTUAL DE FEEDBACK (professor, 17/11/2026: "Concordo com tudo").
// 🧨 Os modos de quebrar isto em silêncio:
//  - a 3ª aba de Provas & Questões voltar a sair cortada no celular; abas de Cursos quebrando em duas linhas;
//  - capas dos cursos do professor voltarem a uma coluna enorme no celular;
//  - título das Diretrizes/Resumos voltar a ganhar recuo duplo; Simulado com recuo próprio no celular;
//  - "Endocrinologia Esportiva" voltar a aparecer na tela, ou o VALOR mudar (quebraria filtros e dados antigos);
//  - o pedido no fim do simulado virar janela, aparecer a cada simulado depois de respondido, ou sair sem e-mail.
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
const cel = (html.match(/\/\* ACERTOS FINOS[\s\S]*?@media \(max-width:820px\)\{([\s\S]*?)\n\}/) || ['', ''])[1];
// 9
ok('🧨 abas de Provas: três colunas iguais, texto pode quebrar', /\.adm-subtabs \.adm-subtab\{flex:1 1 0;min-width:0;white-space:normal;text-align:center/.test(cel));
ok('🧨 abas de Cursos sem quebrar texto', /<div class="pill-tab-row adm-curso-tabs">/.test(html) && /\.adm-curso-tabs \.pill-tab\{white-space:nowrap;flex:0 0 auto/.test(cel));
ok('🧨 capas dos cursos do professor em 2 colunas no celular', /<div class="dir-sub-grid adm-cursos-grade">/.test(html) && /\.dir-sub-grid\.adm-cursos-grade\{grid-template-columns:1fr 1fr/.test(cel));
// 10
ok('🧨 título dentro do .pc sem recuo duplo (Diretrizes/Resumos)', /\n\.pc>\.ph:first-child\{padding-left:0;padding-right:0;padding-top:0\}/.test(html));
ok('Simulado (montagem e relatório) com o recuo das outras telas no celular', /#sf-setup,#sf-report\{padding:\.85rem \.9rem!important\}/.test(cel));
ok('🧨 nenhuma opção mostra "Endocrinologia Esportiva"', !/>Endocrinologia Esportiva</.test(html));
ok('🧨 o valor guardado segue "Endocrinologia Esportiva" (filtros e dados antigos)', (html.match(/<option value="Endocrinologia Esportiva">Endocrinologia do Esporte<\/option>/g) || []).length >= 5);
const c = {};
vm.createContext(c);
vm.runInContext(corpo('rotuloSubesp'), c);
ok('rótulo: Esportiva → do Esporte; o resto igual', vm.runInContext("rotuloSubesp('Endocrinologia Esportiva')", c) === 'Endocrinologia do Esporte' && vm.runInContext("rotuloSubesp('Diabetes')", c) === 'Diabetes');
ok('Podcasts e Cronograma usam o rótulo', /esc\(rotuloSubesp\(a\)\)/.test(corpo('renderPodcasts')) && /t:rotuloSubesp\(c\)\+' \('/.test(corpo('renderPodcasts')) && /esc\(rotuloSubesp\(a\.name\)\)\+'<\/span><input type="number"[^>]*data-crono-area="'\+esc\(a\.name\)/.test(html));
// Feedback pontual
const ls = {};
const f = { Date, Number, Array, currentUser: { role: 'aluno', id: 'u1', name: 'A' }, lsGet: (k) => ls[k], fbSessionEmail: () => 'a@b.co' };
vm.createContext(f);
vm.runInContext((html.match(/\nvar FB_PONTUAL_DIAS=\d+;/) || [''])[0] + corpo('fbPontualPode') + corpo('fbPontualHTML'), f);
ok('🧨 aluno com conta e e-mail vê a linha no fim do simulado', /Este simulado ajudou\?/.test(vm.runInContext('fbPontualHTML()', f)) && /data-fbp="5"/.test(vm.runInContext('fbPontualHTML()', f)) && /data-fbp="2"/.test(vm.runInContext('fbPontualHTML()', f)));
ls.fb_pontual_simulado = Date.now() - 2 * 86400000;
ok('🧨 respondido há 2 dias: não aparece', vm.runInContext('fbPontualHTML()', f) === '');
ls.fb_pontual_simulado = Date.now() - 8 * 86400000;
ok('respondido há 8 dias: volta', vm.runInContext('fbPontualHTML()', f) !== '');
f.currentUser.role = 'admin';
ok('professor não vê', vm.runInContext('fbPontualHTML()', f) === '');
f.currentUser.role = 'aluno'; f.fbSessionEmail = () => '';
ok('sem e-mail na sessão (demo): não aparece', vm.runInContext('fbPontualHTML()', f) === '');
ok('🧨 vai pelo Suporte como "Feedback · Simulado", nota no formato N/5', /category:'Feedback · Simulado'/.test(corpo('fbPontualEnviar')) && /' '\+nota\+'\/5 · Simulado'/.test(corpo('fbPontualEnviar')));
ok('marca o aparelho só depois de enviar (falha não some com o pedido)', /var ok=function\(\)\{lsSet\('fb_pontual_simulado',Date\.now\(\)\);/.test(corpo('fbPontualLigar')) && /\.then\(ok,function\(\)\{/.test(corpo('fbPontualLigar')));
ok('o resultado do simulado mostra a linha (não é janela)', /getElementById\('sf-report-content'\)\.innerHTML=fbPontualHTML\(\)\+html;\n\s*fbPontualLigar\(\);/.test(html));
if (bad) { console.log('✗ painel do professor, acertos finos e feedback pontual: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ abas e capas do painel do professor no celular, títulos alinhados, "Endocrinologia do Esporte" na tela, feedback pontual no fim do simulado');
