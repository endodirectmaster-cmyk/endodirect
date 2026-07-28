// Analytics: CORTESIA não conta como assinante.
//
// O defeito que este teste existe para pegar: um acesso liberado à mão pelo
// professor (`provider='manual'`) sendo contado como receita. Não é só um
// número inflado — qualquer métrica de retenção/LTV construída em cima passa a
// medir alguém que nunca pagou, e o professor acaba cobrando engajamento de
// quem ganhou o acesso de presente.
'use strict';
const fs = require('fs');
const SRC = fs.readFileSync('/home/user/endodirect/index.html', 'utf8');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. o card usa `pagos` e mostra a cortesia à parte ----------------------
const card = SRC.slice(SRC.indexOf('adm-bigstat-l">Assinantes') - 700, SRC.indexOf('adm-bigstat-l">Assinantes') + 400);
ok('card "Assinantes" usa d.pagos', /n\(d\.pagos\)[^]*?Assinantes/.test(card));
ok('card mostra a contagem de cortesias', /n\(d\.cortesias\)/.test(card), card.slice(-260));

// ---- 2. o fallback do cliente não classifica Cortesia como pagante ---------
const fnPag = SRC.slice(SRC.indexOf('function admConvIsPaying'), SRC.indexOf('function admConversionCardHTML'));
const isPaying = new Function(fnPag + '; return admConvIsPaying;')();
ok('Gold é pagante', isPaying({ plano: 'Gold' }) === true);
ok('Standard é pagante', isPaying({ plano: 'Standard' }) === true);
ok('Cortesia NÃO é pagante', isPaying({ plano: 'Cortesia' }) === false);
ok('Degustação NÃO é pagante', isPaying({ plano: 'Degustação' }) === false);

// ---- 3. cortesia sai da degustação E da base da conversão ------------------
const conv = SRC.slice(SRC.indexOf('function admConversionCardHTML'), SRC.indexOf('function admConversionCardHTML') + 2200);
ok('degustação desconta a cortesia', /degust=Math\.max\(0,total-pagos-cortesias\)/.test(conv), conv.match(/var degust=[^;]*/));
ok('base da conversão desconta a cortesia', /baseConv=Math\.max\(0,total-cortesias\)/.test(conv));
ok('taxa usa a base sem cortesia', /conv=baseConv\?Math\.round\(pagos\/baseConv\*100\)/.test(conv));

// ---- 4. ARITMÉTICA com os números reais de 28/07 ----------------------------
// 81 cadastrados, 28 pagantes, 1 cortesia (Walid), 52 em degustação.
const total = 81, pagos = 28, cortesias = 1;
const degust = Math.max(0, total - pagos - cortesias);
const baseConv = Math.max(0, total - cortesias);
ok('degustação = 52', degust === 52, String(degust));
ok('base da conversão = 80 (exclui a cortesia)', baseConv === 80, String(baseConv));
ok('as partes somam o total', pagos + cortesias + degust === total);
// Sem o desconto, a taxa sairia menor por diluir o denominador com quem não paga.
ok('taxa com cortesia fora é maior que a ingênua',
   Math.round(pagos / baseConv * 100) >= Math.round(pagos / total * 100));

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ cortesia separada de assinante no Analytics');
process.exit(bad ? 1 : 0);
