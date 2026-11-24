// Contador regressivo do Sócio-fundador (24/11/2026; professor: "Pode colocar").
// O prazo é real (founder.ate = 30/11 23h59). Este teste prende o formato (dias/horas/minutos
// até faltar 1 dia; horas:minutos:segundos nas últimas 24 h; vazio quando acaba), os lugares
// onde o contador aparece e o desligamento sozinho no fim (nada de "00:00:00" parado na tela).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const i = SRC.indexOf('window.fundadorContagemTxt=function(fim,agora){');
ok('função do contador existe', i > 0);
const fimF = SRC.indexOf('};', i) + 2;
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(SRC.slice(i, fimF), ctx);
const f = (ms) => ctx.window.fundadorContagemTxt(1e12 + ms, 1e12);
const S = 1000, M = 60 * S, H = 60 * M, D = 24 * H;
ok('mais de 1 dia: dias, horas e minutos', f(5 * D + 6 * H + 12 * M + 30 * S) === 'Termina em 5d 06h 12min', f(5 * D + 6 * H + 12 * M + 30 * S));
ok('exatamente 1 dia ainda mostra dias', f(D) === 'Termina em 1d 00h 00min', f(D));
ok('últimas 24 h: horas:minutos:segundos', f(5 * H + 42 * M + 17 * S) === 'Termina em 05:42:17', f(5 * H + 42 * M + 17 * S));
ok('último segundo', f(1500) === 'Termina em 00:00:01', f(1500));
ok('acabou: vazio (o elemento some)', f(0) === '' && f(-5000) === '');
ok('prazo inválido: vazio', ctx.window.fundadorContagemTxt(NaN, 1e12) === '');

// Lugares
ok('faixa do topo tem o contador', /<b data-founder-prazo>A oferta encerra na segunda, 30\/11, às 23h59<\/b>\.<span class="fd-cont" data-founder-cont hidden><\/span>/.test(SRC));
ok('quadro do Sócio-fundador em Ver planos tem o contador', /ou antes, se as vagas acabarem\.<span class="fd-cont" data-founder-cont hidden><\/span><\/div>/.test(SRC));
ok('selo do cartão Gold tem o contador', /cupom FUNDADOR<\/span><span class="fd-cont fd-mini" data-founder-cont hidden><\/span>/.test(SRC));
ok('tela de planos dentro da plataforma tem o contador', /ou antes, se as vagas acabarem\.<span class="fd-cont" data-founder-cont hidden><\/span><\/div>'/.test(SRC));
ok('tela de pagamento tem o contador sob o cupom', /id="ck-founder-cont" data-founder-some[^>]*><span class="fd-cont" data-founder-cont hidden/.test(SRC));
// Liga e desliga
ok('landing liga o contador com o prazo do servidor', /if\(founderOn&&f\.ate\)try\{window\.fundadorContagem\(f\.ate\);\}catch\(e\)\{\}/.test(SRC));
ok('ao zerar, os blocos da oferta somem', /querySelectorAll\('\[data-founder-some\]'\)\.forEach\(function\(el\)\{el\.style\.display='none';\}\)/.test(SRC));
ok('faixa do topo some junto', /<div id="lp-bf" data-founder-some/.test(SRC));
ok('no app do iPhone a landing e a tela de planos seguem escondidas', /html\.app-loja #landing-screen,html\.app-loja #assine-screen,html\.app-loja #checkout-modal/.test(SRC));
ok('últimas 24 h ganham a cor de alerta', /classList\.toggle\('fd-urg',!!urg\)/.test(SRC) && /\.fd-cont\.fd-urg\{/.test(SRC));

if (bad) { console.error('\n' + bad + ' falha(s)'); process.exit(1); }
console.log('✓ contador do Sócio-fundador: formato certo, nos 5 lugares da oferta e some sozinho no fim');
