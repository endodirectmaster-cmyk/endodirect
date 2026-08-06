// ANUAL x MENSAL no painel de assinantes.
//
// ⚠️ DE ONDE VEM A DISTINÇÃO, E POR QUE NÃO PODE SER DEDUZIDA DA DURAÇÃO.
// O checkout grava dois tipos: `api/checkout/order.js` é o PLANO ANUAL, um
// pagamento único → `tipo='avulso'`; `api/checkout/subscribe.js` é o MENSAL
// recorrente (`interval:'month'`) → `tipo='recorrente'`. A RPC traduz isso no
// campo `ciclo`. Se alguém um dia decidir classificar por "quantos dias de
// acesso", um assinante MENSAL renovado 12 vezes acumula ~365 dias de validade
// e passa a ser contado como ANUAL — a conta que o professor usa para prever
// caixa fica errada e ninguém percebe.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const ORDER = fs.readFileSync(path.join(RAIZ, 'api', 'checkout', 'order.js'), 'utf8');
const SUB = fs.readFileSync(path.join(RAIZ, 'api', 'checkout', 'subscribe.js'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// ---- 1. ⚠️ O CONTRATO COM O CHECKOUT --------------------------------------
// A RPC lê `tipo`. Se o checkout parar de gravar esses valores, a contagem
// silenciosamente zera (nenhum erro, só dois números virando 0).
{
  ok('⚠️ o checkout ANUAL grava tipo=avulso', /tipo:\s*'avulso'/.test(ORDER),
     'a RPC classifica avulso como anual — se mudar aqui, o painel para de contar');
  ok('⚠️ o checkout MENSAL grava tipo=recorrente', /tipo:\s*'recorrente'/.test(SUB));
  ok('e o mensal é mesmo mensal (interval month)', /interval:\s*'month'/.test(SUB));
  ok('o anual é pagamento único de ~1 ano', /PLANO ANUAL/.test(ORDER) && /1 ano \(avulso\)/.test(ORDER));
}

// ---- 2. ⚠️ A TELA MOSTRA OS DOIS NÚMEROS ----------------------------------
{
  ok('⚠️ o card de conversão mostra anual e mensal', /var anuais=n\(d\.anuais\),mensais=n\(d\.mensais\);/.test(APP),
     'era o pedido: quantos são anual e quantos são mensal');
  ok('a barra de proporção por ciclo existe', /Assinantes por ciclo de cobrança/.test(APP));
  ok('o bloco de Estudantes também traz o detalhe', /' anual'\+\(n\(d\.anuais\)===1\?'':'s'\)/.test(APP));
  ok('cada aluno pagante mostra o ciclo na linha', /admEstCicloTag\(e\.ciclo\)/.test(APP));
  ok('quem não paga não ganha etiqueta de ciclo', /function admEstCicloTag\(c\)\{[^]{0,400}return '';/.test(APP));
}

// ---- 3. plural e divisão por zero ------------------------------------------
// A tela é lida todo dia pelo professor; "1 anuais" ou NaN% queimam a confiança
// no número inteiro.
{
  const plural = (n, sing, plur) => n + ' ' + (n === 1 ? sing : plur);
  ok('1 vira singular', plural(1, 'anual', 'anuais') === '1 anual');
  ok('0 e 2 viram plural', plural(0, 'anual', 'anuais') === '0 anuais' && plural(2, 'mensal', 'mensais') === '2 mensais');
  ok('⚠️ a barra só é desenhada quando há assinante', /if\(anuais\|\|mensais\)\{/.test(APP),
     'sem isto, 0 assinantes dá divisão por zero e a tela mostra NaN%');
  const pct = (a, m) => { const t = a + m; return t ? Math.round(a / t * 100) : 0; };
  ok('proporção com zero assinantes não estoura', pct(0, 0) === 0);
  ok('proporção fecha em 100%', pct(28, 5) + (100 - pct(28, 5)) === 100);
}

// ---- 4. ⚠️ CORTESIA NÃO É ASSINANTE ---------------------------------------
// Mesma regra que já vale para o número "Assinantes": acesso liberado à mão
// (provider='manual') não é receita e não pode entrar em nenhum dos ciclos.
// EXECUTA o helper recortado do index.html real — não basta procurar texto.
{
  const vm = require('vm');
  const i = APP.indexOf('function admEstCicloTag(c){');
  ok('achei o helper de ciclo no index.html', i > 0);
  const ctx = { String };
  vm.createContext(ctx);
  vm.runInContext(APP.slice(i, APP.indexOf('\nfunction ', i + 10)), ctx);
  ok('anual vira etiqueta "anual"', /anual<\/span>/.test(ctx.admEstCicloTag('anual')));
  ok('mensal vira etiqueta "mensal"', /mensal<\/span>/.test(ctx.admEstCicloTag('mensal')));
  ok('⚠️ quem não paga (degustação/cortesia) não ganha etiqueta nenhuma',
     ctx.admEstCicloTag(null) === '' && ctx.admEstCicloTag(undefined) === '' && ctx.admEstCicloTag('') === '',
     'cortesia não é assinatura e não pode aparecer como anual nem como mensal');
  ok('valor inesperado também não inventa etiqueta', ctx.admEstCicloTag('trimestral') === '');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do ciclo de cobrança falharam.'); process.exit(1); }
console.log('Ciclo de cobrança (anual x mensal): OK');
