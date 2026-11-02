// Semaglutida: dose em cliques (02/11/2026), com o código RECORTADO do index.html.
//
// O que este teste prende:
//   1. as cinco canetas com os números da bula brasileira do Wegovy (2026) e do RCM do Ozempic;
//   2. a dose marcada fica em 37 cliques nas canetas de 1,5 mL e em 74 em TODAS as de 3 mL
//      (1; 1,7 e 2,4 mg: mesmo mecanismo, dose em ~0,75 mL). A 1ª versão dava 75 nas de 1,7 e 2,4
//      (0,75 mL ÷ 0,01); as tabelas da prática usam 74 para as três;
//   3. nenhuma caneta passa da própria dose por aplicação (o seletor para na dose marcada);
//   4. o rendimento conta as 4 doses da caneta;
//   5. sem o quadro de aviso nem o campo de cliques (pedidos do professor, 02/11); a ressalva fica na nota;
//   6. a mesma dose nas outras canetas, a tabela de cliques e a folha impressa;
//   7. sem nome comercial embaixo de cada dose (pedido do professor, 02/11).
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
vm.runInContext(SRC.slice(i0, i1) + '\nthis.K={CLIQ_CANETAS,cliqCaneta,cliqPadrao,cliqMgClique,cliqDeDose,cliqResultado,cliqLe,cliqResHTML,cliqInfoHTML,cliqRender,cliqComparaHTML,cliqTabelaHTML,cliqImprimir};', ctx);
const K = ctx.K;
const perto = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-9);

// ---- 1. canetas (bula brasileira do Wegovy, v. 2.0, 2026; RCM do Ozempic) -----------------
const esperado = [
  ['c025', 0.25, '0,68', 0.68, '1,5', 37],
  ['c05', 0.5, '1,34', 1.34, '1,5', 37],
  ['c1', 1, '1,34', 1.34, '3', 74],
  ['c17', 1.7, '2,27', 2.27, '3', 74],
  ['c24', 2.4, '3,2', 3.2, '3', 74]
];
ok('cinco canetas', K.CLIQ_CANETAS.length === 5, String(K.CLIQ_CANETAS.length));
esperado.forEach(([id, dose, conc, mgml, vol, cliques]) => {
  const c = K.cliqCaneta(id);
  ok(id + ': dose, concentração e volume da caneta', c.id === id && c.dose === dose && c.conc === conc && c.mgml === mgml && c.vol === vol, JSON.stringify(c));
  ok(id + ': ' + cliques + ' cliques na dose marcada', K.cliqPadrao(c) === cliques, String(K.cliqPadrao(c)));
  ok(id + ': mg por clique = dose ÷ cliques', perto(K.cliqMgClique(c), dose / cliques));
  // coerência: a dose marcada sai em ~0,01 mL por clique (±2%)
  ok(id + ': volume da dose (dose ÷ concentração) ≈ cliques × 0,01 mL (±2%)', Math.abs(dose / mgml - cliques * 0.01) / (cliques * 0.01) <= 0.02, String(dose / mgml));
});
ok('as três canetas de 3 mL têm 74 cliques (nenhuma com 75)', ['c1', 'c17', 'c24'].every((id) => K.cliqPadrao(K.cliqCaneta(id)) === 74));
ok('as duas canetas de 1,34 mg/mL dão o mesmo mg por clique', perto(K.cliqMgClique(K.cliqCaneta('c05')), K.cliqMgClique(K.cliqCaneta('c1')), 1e-4));
ok('a Ozempic 2 mg (2,68 mg/mL) não entrou', !K.CLIQ_CANETAS.some((c) => c.conc === '2,68'));
ok('sem nome comercial nos dados das canetas', K.CLIQ_CANETAS.every((c) => !('marcas' in c)));

// ---- 2. dose → cliques ---------------------------------------------------------------------
const c05 = K.cliqCaneta('c05'), c1 = K.cliqCaneta('c1'), c24 = K.cliqCaneta('c24'), c025 = K.cliqCaneta('c025');
ok('0,25 mg na caneta de 0,25/0,5 (1,34 mg/mL) → 19 cliques (18,5 arredonda para cima)', K.cliqDeDose(c05, 0.25) === 19, String(K.cliqDeDose(c05, 0.25)));
ok('0,5 mg na caneta de 0,5 → 37 cliques', K.cliqDeDose(c05, 0.5) === 37);
ok('1 mg na caneta de 1 mg → 74 cliques', K.cliqDeDose(c1, 1) === 74);
ok('2,4 mg na caneta de 2,4 → 74 cliques', K.cliqDeDose(c24, 2.4) === 74);
ok('0,25 mg na caneta de 2,4 → 8 cliques (0,259 mg), como nas tabelas da prática', K.cliqDeDose(c24, 0.25) === 8 && perto(K.cliqResultado(c24, 8).mg, 8 * 2.4 / 74, 1e-12));
ok('1,7 mg: 11 cliques ≈ 0,25 mg e 44 ≈ 1,01 mg', perto(K.cliqResultado(K.cliqCaneta('c17'), 11).mg, 0.2527, 1e-3) && perto(K.cliqResultado(K.cliqCaneta('c17'), 44).mg, 1.0108, 1e-3));
ok('dose vazia ou zero → sem cliques', isNaN(K.cliqDeDose(c1, NaN)) && isNaN(K.cliqDeDose(c1, 0)));

// ---- 3. o seletor para na dose da caneta ---------------------------------------------------
ok('38 cliques na caneta de 0,25 mg passam do máximo', K.cliqResultado(c025, 38).acima === true && K.cliqResultado(c025, 37).acima === false);
const acima = K.cliqResHTML(c025, K.cliqDeDose(c025, 0.5), 0.5);
ok('pedir 0,5 mg na caneta de 0,25 mg avisa que ela para em 37 cliques', /para em 37 cliques/.test(acima) && /dose maior/.test(acima), acima.slice(0, 200));
const abaixo = K.cliqResHTML(c24, K.cliqDeDose(c24, 0.01), 0.01);
ok('dose abaixo de 1 clique avisa', /abaixo de 1 clique/.test(abaixo), abaixo.slice(0, 200));

// ---- 4. resultado e rendimento ---------------------------------------------------------------
const r = K.cliqResultado(c025, 20);
ok('20 cliques na caneta de 0,25 mg: 0,135 mg, ~0,20 mL (dose ÷ 0,68), rende 7 aplicações e sobram 8 cliques',
   perto(r.mg, 20 * 0.25 / 37) && perto(r.ml, (20 * 0.25 / 37) / 0.68) && r.rende === 7 && r.sobra === 8, JSON.stringify(r));
const html = K.cliqResHTML(c1, 50, 0.68);
ok('o resultado mostra os cliques, a dose real, o rendimento e as semanas', /clq-big">50</.test(html) && /0,676/.test(html) && /296 cliques/.test(html) && /5 aplicações/.test(html) && /5 semanas/.test(html), html.replace(/<[^>]+>/g, ' ').slice(0, 300));
ok('quando o pedido não cai num clique inteiro, mostra o pedido e a dose entregue', /Pedido: 0,680 mg/.test(html));
ok('na dose marcada, diz que é a dose marcada', /é a dose marcada/.test(K.cliqResHTML(c1, 74, NaN)));
ok('a linha da caneta traz concentração, volume e cliques da dose marcada', /1,34 mg\/mL/.test(K.cliqInfoHTML(c1)) && /1 mg = 74 cliques/.test(K.cliqInfoHTML(c1)));

// ---- 5. leitura com vírgula (iPhone) -----------------------------------------------------------
// ---- 4b. a mesma dose em outra caneta, tabela e folha impressa --------------------------------
const cmp = K.cliqComparaHTML(c1, 0.5);
ok('0,5 mg nas outras canetas: 0,25 passa; 0,5 = 37; 1,7 = 22; 2,4 = 15',
   /passa da dose da caneta \(37 cliques = 0,25 mg\)/.test(cmp) && /0,5 mg[^<]*<span[^>]*>[^<]*<\/span><\/td><td><b>37</.test(cmp)
   && /1,7 mg[^<]*<span[^>]*>[^<]*<\/span><\/td><td><b>22</.test(cmp) && /2,4 mg[^<]*<span[^>]*>[^<]*<\/span><\/td><td><b>15</.test(cmp) && !/>1 mg </.test(cmp), cmp.replace(/<[^>]+>/g, ' ').slice(0, 400));
ok('sem dose, sem comparação', K.cliqComparaHTML(c1, NaN) === '');
const tab = K.cliqTabelaHTML(K.cliqCaneta('c24'), 8);
ok('a tabela da caneta de 2,4 mg tem 74 linhas, marca a escolhida e a dose marcada',
   (tab.match(/class="clq-cel/g) || []).length === 74 && /clq-cel clq-cel-sel"><b>8<\/b><span>0,259/.test(tab) && /clq-cel-max"><b>74<\/b><span>2,400/.test(tab));
let doc = '';
ctx.window = { open: () => ({ document: { write: (d) => { doc = d; }, close() {} }, focus() {}, print() {} }) };
ctx.notify = () => {};
ctx.setTimeout = () => {};
K.cliqImprimir(c05);
ok('a folha impressa traz a tabela inteira e a caneta, sem o aviso e sem nome comercial',
   /caneta de 0,5 mg/.test(doc) && (doc.match(/<td class="n">/g) || []).length === 37 && !/Uso fora da bula/.test(doc) && !/class="aviso"/.test(doc) && !/Wegovy|Ozempic|Poviztra|Extensior/.test(doc), doc.slice(0, 300));

ok('lê vírgula e ponto', K.cliqLe('0,25') === 0.25 && K.cliqLe('0.25') === 0.25 && K.cliqLe(' 1,7 ') === 1.7 && isNaN(K.cliqLe('')));

// ---- 6. entrada no CALCS, campos e aviso ---------------------------------------------------------
const iE = SRC.indexOf("{id:'cliques',name:");
const iP = SRC.indexOf("\n  {id:'", iE + 5);
ok('a calculadora está no CALCS, em Obesidade, com tela própria', iE > 0 && /area:'Obesidade'/.test(SRC.slice(iE, iP)) && /render:function\(root\)\{cliqRender\(root\);\}/.test(SRC.slice(iE, iP)));
const tela = SRC.slice(SRC.indexOf('function cliqRender('), i1);
ok('campo de dose em texto com teclado decimal (vírgula no iPhone)', /inputmode="decimal"[^>]*data-clq-mg/.test(tela));
ok('o quadro de aviso saiu da tela ("retirar")', !/clq-aviso/.test(tela) && !/Uso fora da bula/.test(tela));
ok('sem campo para editar os cliques; a dose entra pela faixa ou em mg', !/data-clq-n\b/.test(tela) && /data-clq-faixa/.test(tela) && /data-clq-mg/.test(tela));
ok('o cartão da caneta não tem nome comercial', !/clq-marca/.test(tela) && !/c\.marcas/.test(tela));
ok('a nota cita a bula brasileira, os 74 cliques das de 3 mL, a falta de validação do fabricante e deixa a Ozempic 2 mg de fora', /sem validação do fabricante/.test(SRC.slice(iE, iP)) && /bula brasileira do Wegovy/.test(SRC.slice(iE, iP)) && /74 nas de 3 mL/.test(SRC.slice(iE, iP)) && /Ozempic® 2 mg/.test(SRC.slice(iE, iP)));

if (bad) { console.log('test-calc-cliques: ' + bad + ' falha(s)'); process.exit(1); }
console.log('test-calc-cliques: ok (canetas da bula, 37/74 cliques, seletor que para na dose marcada, rendimento em semanas, outra caneta, tabela e folha impressa, sem nome comercial nos cartões, sem aviso nem campo de cliques, ressalva na nota)');
