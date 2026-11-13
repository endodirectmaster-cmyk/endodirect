#!/usr/bin/env node
// MAPA MENTAL EM TELA CHEIA (13/11/2026).
//
// Pedido do professor (print no iPhone): "O ideal é que quando abrisse o mapa mental, aparecesse
// na tela toda. Não ficasse aparecendo nada acima dela, preenchesse toda a tela, o mapa mental.
// Claro que com um botão lá em cima de voltar para sair do mapa mental."
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - abrir um mapa (do professor, salvo ou novo) e ele não ocupar a tela;
//  - o "Voltar" sumir, ou sair do mapa e a página continuar travada (sem rolagem);
//  - trocar de painel/sair da conta com o mapa aberto e a tela cheia ficar cobrindo o resto;
//  - a tela cheia passar POR CIMA da janela "Deseja permanecer conectado?" ou do login.
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

const regra = (html.match(/body\.mm-tela-cheia #mm-live\{([^}]*)\}/) || [, ''])[1];
ok('🧨 mapa aberto ocupa a tela inteira (position:fixed; inset:0)', /position:fixed/.test(regra) && /inset:0/.test(regra));
ok('a tela cheia respeita o entalhe do iPhone (safe-area)', /safe-area-inset-top/.test(regra) && /safe-area-inset-bottom/.test(regra));
ok('a página por baixo não rola com o mapa aberto', /body\.mm-tela-cheia\{overflow:hidden\}/.test(html));
ok('a área do mapa estica para preencher a tela', /body\.mm-tela-cheia #mm-svg-wrap\{[^}]*flex:1 1 auto[^}]*max-height:none/.test(html));

const z = +((regra.match(/z-index:(\d+)/) || [, 'NaN'])[1]);
const zModal = +((html.match(/\.modal-bg\{[^}]*z-index:(\d+)/) || [, 'NaN'])[1]);
const zLogin = +((html.match(/#login-screen\{[^}]*z-index:(\d+)/) || [, 'NaN'])[1]);
const zAviso = +((html.match(/\.notify\{[^}]*z-index:(\d+)/) || [, 'NaN'])[1]);
ok('🧨 a tela cheia fica ABAIXO da janela de sessão, do login e dos avisos (z ' + z + ' < ' + [zModal, zLogin, zAviso].join('/') + ')',
  z > 0 && z < zModal && z < zLogin && z < zAviso);

ok('🧨 botão "← Voltar" no topo do mapa', /<div class="mm-live-head">\s*<button[^>]*id="btn-mm-voltar"[^>]*>← Voltar<\/button>/.test(html));
ok('o Voltar aparece só na tela cheia', /\.mm-voltar\{display:none\}/.test(html) && /body\.mm-tela-cheia \.mm-voltar\{display:inline-flex/.test(html));
ok('🧨 o Voltar faz o mesmo que fechar', /getElementById\('btn-mm-voltar'\)\.addEventListener\('click',function\(\)\{document\.getElementById\('btn-mm-close'\)\.click\(\);\}\)/.test(html));

ok('mmTelaCheia liga e desliga a classe no body', /function mmTelaCheia\(on\)\{document\.body\.classList\.toggle\('mm-tela-cheia',!!on\);\}/.test(html));
ok('🧨 abrir mapa do professor liga a tela cheia', /mmTelaCheia\(true\)/.test(corpo('viewMMShared')));
ok('🧨 abrir mapa salvo liga a tela cheia', /mmTelaCheia\(true\)/.test(corpo('viewMM')));
ok('abrir mapa novo (Manual) liga a tela cheia', /mmTelaCheia\(true\)/.test(corpo('newBlankMM')));
ok('🧨 fechar desliga a tela cheia', /getElementById\('btn-mm-close'\)\.addEventListener\('click',function\(\)\{\s*mmTelaCheia\(false\);/.test(html));
ok('🧨 trocar de painel desliga a tela cheia', /if\(id!=='mmap'\)try\{mmTelaCheia\(false\);\}catch\(e\)\{\}/.test(corpo('goPanel')));
ok('sair da conta desliga a tela cheia', /mmTelaCheia\(false\)/.test(corpo('doLogout')));
ok('devolver o mapa ao lugar (edição do professor) desliga a tela cheia', /mmTelaCheia\(false\)/.test(corpo('restoreMMLive')));

if (bad) { console.log('✗ mapa mental em tela cheia: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ mapa mental em tela cheia: abre ocupando a tela, Voltar no topo, e sai certo por todos os caminhos');
