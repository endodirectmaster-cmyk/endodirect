// Semaglutida: dose em cliques (02/11/2026), com o código RECORTADO do index.html.
//
// O que este teste prende:
//   1. as cinco canetas com os números da bula brasileira do Wegovy (2026) e do RCM do Ozempic;
//   2. os cliques da dose marcada vêm do VOLUME da dose da bula (0,37 / 0,74 / 0,75 mL), não de
//      dose ÷ concentração: a caneta de 1 mg dá 74 cliques (0,74 mL), e não 75 (1 ÷ 1,34 = 0,746);
//   3. nenhuma caneta passa da própria dose por aplicação (o seletor para na dose marcada);
//   4. o rendimento conta as 4 doses da caneta;
//   5. o aviso de uso fora da bula está na tela.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// recorta do "var CLIQ_CANETAS" até o fim de cliqRender (a função seguinte começa com "\nvar CALCS=[")
const i0 = SRC.indexOf('var CLIQ_CANETAS=[');
const i1 = SRC.indexOf('\nvar CALCS=[', i0);
if (i0 < 0 || i1 < 0) { console.log('  ✗ não achei o bloco da calculadora de cliques'); process.exit(1); }
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(SRC.slice(i0, i1) + '\nthis.K={CLIQ_CANETAS,cliqCaneta,cliqPadrao,cliqMgClique,cliqDeDose,cliqResultado,cliqLe,cliqResHTML,cliqInfoHTML,cliqRender};', ctx);
const K = ctx.K;
const perto = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-9);

// ---- 1. canetas (bula brasileira do Wegovy, v. 2.0, 2026; RCM do Ozempic) -----------------
const esperado = [
  ['c025', 0.25, '0,68', '1,5', 0.37, 37],
  ['c05', 0.5, '1,34', '1,5', 0.37, 37],
  ['c1', 1, '1,34', '3', 0.74, 74],
  ['c17', 1.7, '2,27', '3', 0.75, 75],
  ['c24', 2.4, '3,2', '3', 0.75, 75]
];
ok('cinco canetas', K.CLIQ_CANETAS.length === 5, String(K.CLIQ_CANETAS.length));
esperado.forEach(([id, dose, conc, vol, ml, cliques]) => {
  const c = K.cliqCaneta(id);
  ok(id + ': dose, concentração, volume e volume da dose', c.id === id && c.dose === dose && c.conc === conc && c.vol === vol && c.mlDose === ml, JSON.stringify(c));
  ok(id + ': ' + cliques + ' cliques na dose marcada', K.cliqPadrao(c) === cliques, String(K.cliqPadrao(c)));
  ok(id + ': mg por clique = dose ÷ cliques', perto(K.cliqMgClique(c), dose / cliques));
  // coerência com a bula: concentração × volume da dose ≈ dose marcada (até 2%)
  const concN = Number(conc.replace(',', '.'));
  ok(id + ': concentração × volume da dose bate com a dose (±2%)', Math.abs(concN * ml - dose) / dose <= 0.02, String(concN * ml));
});
ok('as duas canetas de 1,34 mg/mL dão o mesmo mg por clique', perto(K.cliqMgClique(K.cliqCaneta('c05')), K.cliqMgClique(K.cliqCaneta('c1')), 1e-4));
ok('a Ozempic 2 mg (2,68 mg/mL) não entrou', !K.CLIQ_CANETAS.some((c) => c.conc === '2,68'));
ok('as marcas: Wegovy, Ozempic, Poviztra e Extensior', ['Wegovy', 'Ozempic', 'Poviztra', 'Extensior'].every((m) => K.CLIQ_CANETAS.some((c) => c.marcas.indexOf(m) >= 0)));

// ---- 2. dose → cliques ---------------------------------------------------------------------
const c05 = K.cliqCaneta('c05'), c1 = K.cliqCaneta('c1'), c24 = K.cliqCaneta('c24'), c025 = K.cliqCaneta('c025');
ok('0,25 mg na caneta de 0,25/0,5 (1,34 mg/mL) → 19 cliques (18,5 arredonda para cima)', K.cliqDeDose(c05, 0.25) === 19, String(K.cliqDeDose(c05, 0.25)));
ok('0,5 mg na caneta de 0,5 → 37 cliques', K.cliqDeDose(c05, 0.5) === 37);
ok('1 mg na caneta de 1 mg → 74 cliques', K.cliqDeDose(c1, 1) === 74);
ok('2,4 mg na caneta de 2,4 → 75 cliques', K.cliqDeDose(c24, 2.4) === 75);
ok('0,25 mg na caneta de 2,4 → 8 cliques (0,256 mg)', K.cliqDeDose(c24, 0.25) === 8 && perto(K.cliqResultado(c24, 8).mg, 0.256, 1e-9));
ok('dose vazia ou zero → sem cliques', isNaN(K.cliqDeDose(c1, NaN)) && isNaN(K.cliqDeDose(c1, 0)));

// ---- 3. o seletor para na dose da caneta ---------------------------------------------------
ok('38 cliques na caneta de 0,25 mg passam do máximo', K.cliqResultado(c025, 38).acima === true && K.cliqResultado(c025, 37).acima === false);
const acima = K.cliqResHTML(c025, K.cliqDeDose(c025, 0.5), 0.5);
ok('pedir 0,5 mg na caneta de 0,25 mg avisa que ela para em 37 cliques', /para em 37 cliques/.test(acima) && /dose maior/.test(acima), acima.slice(0, 200));
const abaixo = K.cliqResHTML(c24, K.cliqDeDose(c24, 0.01), 0.01);
ok('dose abaixo de 1 clique avisa', /abaixo de 1 clique/.test(abaixo), abaixo.slice(0, 200));

// ---- 4. resultado e rendimento ---------------------------------------------------------------
const r = K.cliqResultado(c025, 20);
ok('20 cliques na caneta de 0,25 mg: 0,135 mg, 0,20 mL, rende 7 aplicações e sobram 8 cliques',
   perto(r.mg, 20 * 0.25 / 37) && perto(r.ml, 0.2) && r.rende === 7 && r.sobra === 8, JSON.stringify(r));
const html = K.cliqResHTML(c1, 50, 0.68);
ok('o resultado mostra os cliques, a dose real e o rendimento', /clq-big">50</.test(html) && /0,676/.test(html) && /296 cliques/.test(html) && /5 aplicações/.test(html), html.replace(/<[^>]+>/g, ' ').slice(0, 300));
ok('quando o pedido não cai num clique inteiro, mostra o pedido e a dose entregue', /Pedido: 0,680 mg/.test(html));
ok('na dose marcada, diz que é a dose marcada', /é a dose marcada/.test(K.cliqResHTML(c1, 74, NaN)));
ok('a linha da caneta traz concentração, volume e cliques da dose marcada', /1,34 mg\/mL/.test(K.cliqInfoHTML(c1)) && /1 mg = 74 cliques/.test(K.cliqInfoHTML(c1)));

// ---- 5. leitura com vírgula (iPhone) -----------------------------------------------------------
ok('lê vírgula e ponto', K.cliqLe('0,25') === 0.25 && K.cliqLe('0.25') === 0.25 && K.cliqLe(' 1,7 ') === 1.7 && isNaN(K.cliqLe('')));

// ---- 6. entrada no CALCS, campos e aviso ---------------------------------------------------------
const iE = SRC.indexOf("{id:'cliques',name:");
const iP = SRC.indexOf("\n  {id:'", iE + 5);
ok('a calculadora está no CALCS, em Obesidade, com tela própria', iE > 0 && /area:'Obesidade'/.test(SRC.slice(iE, iP)) && /render:function\(root\)\{cliqRender\(root\);\}/.test(SRC.slice(iE, iP)));
const tela = SRC.slice(SRC.indexOf('function cliqRender('), i1);
ok('campo de dose em texto com teclado decimal (vírgula no iPhone)', /inputmode="decimal"[^>]*data-clq-mg/.test(tela));
ok('o aviso de uso fora da bula está na tela', /Uso fora da bula/.test(tela) && /não informa o volume de cada clique/.test(tela) && /outros fabricantes/.test(tela) && /verificação de fluxo/.test(tela));
ok('a nota cita a bula brasileira e deixa a Ozempic 2 mg de fora', /bula brasileira do Wegovy/.test(SRC.slice(iE, iP)) && /Ozempic® 2 mg/.test(SRC.slice(iE, iP)));

if (bad) { console.log('test-calc-cliques: ' + bad + ' falha(s)'); process.exit(1); }
console.log('test-calc-cliques: ok (canetas da bula, cliques pelo volume da dose, seletor que para na dose marcada, rendimento e aviso de uso fora da bula)');
