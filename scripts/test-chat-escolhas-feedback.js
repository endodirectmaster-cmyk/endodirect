#!/usr/bin/env node
// PROPOSTAS 13, 14 E 16 DA REVISÃO DE FORMATAÇÃO + FEEDBACK FORA DO TOPO (professor, 17/11/2026: "Concordo com tudo").
// 🧨 Os modos de quebrar isto em silêncio:
//  - a caixa do Chat voltar ao topo no celular (resto da tela vazio) ou deixar de ficar presa embaixo;
//  - o Chat parar de rolar até a resposta no celular (quem rola lá é a página, não a caixa);
//  - as escolhas voltarem a bolinhas pequenas, ou os rádios sumirem (o JS lê :checked; a degustação desliga IA/Misto);
//  - o botão de Feedback voltar ao topo, ou sumir de vez (fica no menu e no Perfil; o convite automático segue).
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome) {
  const ini = html.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  return html.slice(ini + 1, html.indexOf('\n}', ini) + 2);
}
// 13. Chat
const chat = (html.match(/<div class="panel" id="panel-chat"[\s\S]*?\n    <\/div>\n/) || [''])[0];
ok('🧨 conversa primeiro; sugestões e caixa juntas embaixo', /<div class="chat-msgs" id="chat-msgs">[\s\S]*<div class="chat-rodape">\s*(<!--[\s\S]*?-->\s*)?<div class="chat-sugg" id="chat-sugg">[\s\S]*<div class="chat-input-row">[\s\S]*id="btn-clear-chat"[\s\S]*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/.test(chat) && chat.indexOf('chat-msgs') < chat.indexOf('chat-sugg'));
ok('🧨 no celular a caixa fica presa embaixo e a conversa ocupa a tela', /#panel-chat\{overflow:visible!important\}/.test(html) && /#panel-chat \.chat-wrap\{height:auto;min-height:calc\(100dvh - 58px - env\(safe-area-inset-top,0px\)\)/.test(html) && /#panel-chat \.chat-rodape\{position:sticky;bottom:0;/.test(html));
ok('no celular, sugestões somem depois da 1ª pergunta e voltam ao limpar', /#panel-chat \.chat-em-conversa \.chat-sugg\{display:none\}/.test(html) && /classList\.toggle\('chat-em-conversa'/.test(corpo('appendMsg')) && /_cw\.classList\.remove\('chat-em-conversa'\)/.test(html));
ok('🧨 rolar até o fim rola também a página no celular', /window\.scrollTo\(0,document\.documentElement\.scrollHeight\)/.test(corpo('chatRolarFim')) && /chatRolarFim\(\);/.test(corpo('appendMsg')) && /chatRolarFim\(\);\n  \}\)\.catch\(/.test(corpo('sendChat')));
// 14. Escolhas
['Preferência de horário', 'Modo de resposta', 'Fonte das questões'].forEach((r) => ok('🧨 grupo "' + r + '" em botões grandes', html.indexOf('<div class="seg" role="radiogroup" aria-label="' + r + '">') > 0));
['crono-sess', 'sim-mode', 'sf-fonte'].forEach((n) => ok('rádios de ' + n + ' seguem no HTML (o JS lê :checked)', (html.match(new RegExp('<input type="radio" name="' + n + '"', 'g')) || []).length >= 2));
ok('🧨 botão de 44 px, rádio escondido mas presente, marcado em azul, travado sem cursor', /\.seg>label\{[^}]*min-height:44px/.test(html) && /\.seg>label input\[type=radio\]\{position:absolute;opacity:0;/.test(html) && /\.seg>label:has\(input:checked\)\{background:var\(--blue\)/.test(html) && /\.seg>label:has\(input:disabled\)\{cursor:not-allowed\}/.test(html));
ok('trava da degustação continua mexendo no label (closest)', /var lab=r\.closest\('label'\);/.test(corpo('applyDegLocks')));
// 16. Feedback
ok('🧨 sem botão de Feedback no topo', !/id="btn-feedback-cta"/.test(html));
ok('🧨 "Enviar feedback" no menu, antes do Suporte, abrindo o formulário', /<button class="sb-item" id="sb-feedback" type="button">💬 Enviar feedback<\/button>\n\s*<button class="sb-item" data-p="support">/.test(html) && /getElementById\('sb-feedback'\);if\(_sbfb\)_sbfb\.addEventListener\('click',function\(\)\{document\.body\.classList\.remove\('mobile-nav-open'\);openFeedback\(\);\}\)/.test(html));
ok('"Sua opinião" no Perfil, ligado no wirePerfil', /<span class="card-title">💬 Sua opinião<\/span>/.test(html) && /getElementById\('perfil-feedback'\);if\(_pfb\)_pfb\.addEventListener\('click',openFeedback\)/.test(corpo('wirePerfil')));
ok('o convite automático de feedback segue', /maybeAskFeedback\(\);/.test(html) && /function maybeAskFeedback\(\)/.test(html));
if (bad) { console.log('✗ Chat, escolhas e feedback: ' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ Chat com a caixa embaixo no celular, escolhas em botões grandes, Feedback no menu e no Perfil (fora do topo)');
