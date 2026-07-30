// %PEP e %PPT pós-bariátrica, com a calculadora RECORTADA do index.html de
// verdade — cópia do código no teste diverge com o tempo.
//
// O defeito que este teste existe para pegar: %PEP tem um denominador que é
// escolha, não medida. Trocar o "peso ideal" de IMC 25 por outro valor muda o
// resultado sem mudar o paciente, e o número é justamente o que o operado
// acompanha. Aqui os valores são conferidos à mão, um por um.
//
// O segundo: quem opera já abaixo de IMC 25 não tem excesso de peso, e a
// divisão daria número negativo ou infinito. Tem de recusar, não devolver
// resultado bonito.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Recorta a entrada do CALCS com id 'pep', da abertura até o fechamento dela.
const iPep = SRC.indexOf("{id:'pep',name:");
const iProx = SRC.indexOf("\n  {id:'", iPep + 5);
if (iPep < 0 || iProx < 0) { console.log('  ✗ não achei a calculadora pep no CALCS'); process.exit(1); }
const ctx = { console };
vm.createContext(ctx);
vm.runInContext('var PEP=' + SRC.slice(iPep, iProx).replace(/,\s*$/, '') + ';', ctx);
const P = ctx.PEP;

const v = (p0, altCm, pa) => ({ pep_p0: String(p0), pep_alt: String(altCm), pep_pat: String(pa) });
const perto = (a, b, tol) => Math.abs(a - b) <= (tol || 0.05);

// ---- 1. identidade da calculadora -------------------------------------------
ok('id e unidade', P.id === 'pep' && P.unit === '% do excesso');
ok('os três campos na ordem da fonte',
   P.fields.map((f) => f.id).join(',') === 'pep_p0,pep_alt,pep_pat', P.fields.map((f) => f.id).join(','));

// ---- 2. ⚠️ VALORES CONFERIDOS À MÃO ----------------------------------------
// 120 kg, 1,70 m → IMC 25 = 25 × 2,89 = 72,25 kg. Excesso = 47,75 kg.
// Peso atual 96 kg → perdeu 24 kg → 24 / 47,75 = 50,26%.
ok('120→96 kg, 1,70 m = 50,3% do excesso', perto(P.calc(v(120, 170, 96)), 50.2618, 0.01), String(P.calc(v(120, 170, 96))));
// Peso atual 72,25 kg (exatamente IMC 25) → 100%.
ok('chegar a IMC 25 dá exatamente 100%', perto(P.calc(v(120, 170, 72.25)), 100, 0.01), String(P.calc(v(120, 170, 72.25))));
// Abaixo de IMC 25 passa de 100% — é a natureza da métrica, não um bug.
ok('abaixo de IMC 25 passa de 100%', P.calc(v(120, 170, 65)) > 100);
// Sem perda nenhuma = 0%.
ok('sem perda dá 0%', perto(P.calc(v(120, 170, 120)), 0, 0.001));
// Ganho de peso dá negativo.
ok('ganho de peso dá negativo', P.calc(v(120, 170, 125)) < 0);
// Outro caso: 150 kg, 1,60 m → ideal 64 kg, excesso 86; atual 107 → 43/86 = 50%.
ok('150→107 kg, 1,60 m = 50,0%', perto(P.calc(v(150, 160, 107)), 50, 0.01), String(P.calc(v(150, 160, 107))));

// ---- 3. ⚠️ SEM EXCESSO NÃO HÁ %PEP ----------------------------------------
ok('operado abaixo de IMC 25 não calcula', Number.isNaN(P.calc(v(70, 170, 65))));
ok('e a interpretação explica, oferecendo o %PPT',
   /não é calculável/.test(P.interp(NaN, v(70, 170, 65)).t) && /%PPT/.test(P.interp(NaN, v(70, 170, 65)).t),
   P.interp(NaN, v(70, 170, 65)).t);
ok('exatamente em IMC 25 também não calcula', Number.isNaN(P.calc(v(72.25, 170, 70))));

// ---- 4. campo faltando não devolve número ----------------------------------
[[0, 170, 96], [120, 0, 96], [120, 170, 0]].forEach(function (a, i) {
  ok('campo vazio ' + i + ' não devolve número', Number.isNaN(P.calc(v(a[0], a[1], a[2]))));
});
ok('campo vazio pede o preenchimento', /Preencha/.test(P.interp(NaN, v(0, 170, 96)).t));

// ---- 5. o %PPT que acompanha ------------------------------------------------
// 120 → 96 kg: 24/120 = 20,0% do peso total.
{
  const t = P.interp(P.calc(v(120, 170, 96)), v(120, 170, 96)).t;
  ok('mostra o %PPT calculado certo', t.indexOf('%PPT 20.0%') > 0, t);
  ok('mostra o IMC atual', t.indexOf('33.2') > 0, t);           // 96 / 2,89 = 33,22
  ok('mostra o peso de IMC 25', t.indexOf('72.3') > 0, t);      // 72,25 kg arredonda para 72,3
}

// ---- 6. faixas de leitura ---------------------------------------------------
ok('<50% é sinalizado como insuficiente', /insuficiente/.test(P.interp(P.calc(v(120, 170, 105)), v(120, 170, 105)).t));
ok('entre 50 e 100% é adequado', /adequada/.test(P.interp(P.calc(v(120, 170, 90)), v(120, 170, 90)).t));
ok('ganho de peso é sinalizado', /Ganho de peso/.test(P.interp(P.calc(v(120, 170, 125)), v(120, 170, 125)).t));

// ---- 7. a nota diz de onde vem o denominador -------------------------------
ok('a nota explicita o IMC 25 como referência', /IMC 25/.test(P.note));
ok('a nota traz os valores esperados por técnica', /sleeve/i.test(P.note) && /bypass/i.test(P.note));
ok('a nota cita as fontes', /Brolin/.test(P.note) && /Zilberstein/.test(P.note));

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ %PEP: denominador em IMC 25, valores conferidos à mão, recusa quem não tem excesso de peso');
process.exit(bad ? 1 : 0);
