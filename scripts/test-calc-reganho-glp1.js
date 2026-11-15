// Regressão: calculadora de reganho de peso após semaglutida/tirzepatida (Mayo Clinic),
// PILOTO visível só para professores.
//
// Professor, 15/11/2026, com prints de glp1regainrisk.com: "Da pra introduzir na
// plataforma?" e "Vamos fazer uma versão piloto dessa calculadora, apenas para os
// professores". O modelo ainda não foi publicado (artigo em revisão; ObesityWeek,
// 15/11/2026), então o cartão é externo, como o FRAX: explicação em português e link.
//
// O que este teste prende:
//   1) a entrada existe em CALCS, em Obesidade, externa, com link https para
//      glp1regainrisk.com e `soProfessor:true`;
//   2) o texto em português traz o desfecho (TR50), o guia de preenchimento, a coorte,
//      o índice C e o aviso de uso só em pesquisa;
//   3) `calcVisivel` esconde o cartão de quem não é professor e o mostra ao professor,
//      e ele é usado no índice por área, na contagem "Todas as áreas" e no `openCalc`;
//   4) o cartão mostra a marca "Piloto · só professores" e o rótulo "Ferramenta dos
//      autores" no lugar de "Ferramenta oficial".
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ── 1. a entrada ─────────────────────────────────────────────────────────────
const i0 = html.indexOf("{id:'reganhoglp1',");
const i1 = html.indexOf("\n  {id:'", i0 + 10);
ok(i0 > 0 && i1 > i0, "não achei a entrada {id:'reganhoglp1'} em CALCS");
const entrada = html.slice(i0, i1);
ok(/area:'Obesidade'/.test(entrada), 'a calculadora tem de ficar em Obesidade');
ok(/soProfessor:true/.test(entrada), 'a calculadora tem de ser só de professores (soProfessor:true)');
ok(/external:true/.test(entrada) && /link:'https:\/\/glp1regainrisk\.com'/.test(entrada), 'a calculadora tem de ser externa, com link https para glp1regainrisk.com');
ok(/rotuloExt:'Ferramenta dos autores'/.test(entrada), 'o rótulo do cartão tem de ser "Ferramenta dos autores" (não é ferramenta oficial de sociedade)');

// ── 2. o texto ───────────────────────────────────────────────────────────────
ok(/TR<sub>50<\/sub>/.test(entrada) && /metade ou mais do peso perdido/.test(entrada), 'o texto tem de explicar o desfecho (TR50: recuperar metade do peso perdido)');
ok(/<i>Weight at 3 months<\/i>/.test(entrada) && /<i>Treatment duration<\/i>/.test(entrada), 'falta o guia de preenchimento dos campos em inglês');
ok(/21\.882/.test(entrada) && /14\.513/.test(entrada) && /0,77/.test(entrada) && /0,82/.test(entrada), 'o texto tem de trazer a coorte (21.882 / 14.513) e o índice C (0,77 / 0,82)');
ok(/pesquisa/.test(entrada) && /sem validação em brasileiros/.test(entrada) && /em revisão/.test(entrada), 'o texto tem de trazer os limites: só pesquisa, sem validação em brasileiros, artigo em revisão');
ok(!/'/.test(entrada.replace(/'[^'\n]*'/g, '')), 'aspas soltas na entrada');

// ── 3. visibilidade ──────────────────────────────────────────────────────────
function trecho(nome) {
  const a = html.indexOf('function ' + nome + '(');
  if (a < 0) { falhas.push('não achei function ' + nome); return ''; }
  const b = html.indexOf('\n}', a);
  return html.slice(a, b + 2);
}
const fnVis = html.slice(html.indexOf('function calcVisivel('), html.indexOf('\n', html.indexOf('function calcVisivel(')));
ok(/function calcVisivel\(c\)/.test(fnVis), 'falta a função calcVisivel');
const ctx = vm.createContext({ admin: false });
vm.runInContext('function isAdminUser(){return admin;}\n' + fnVis + '\n' + trecho('calcAreasIndex') + '\nvar CALCS=[{id:"imc",area:"Obesidade"},{id:"reganhoglp1",area:"Obesidade",soProfessor:true},{id:"tsh",area:"Tireoide"}];', ctx);
const run = (c) => vm.runInContext(c, ctx);
run('admin=false');
ok(run('calcAreasIndex().porArea.Obesidade.map(function(c){return c.id;}).join()') === 'imc', 'o aluno não pode ver o cartão de piloto no índice');
ok(run('calcVisivel(CALCS[1])') === false, 'calcVisivel tem de esconder o piloto do aluno');
run('admin=true');
ok(run('calcAreasIndex().porArea.Obesidade.map(function(c){return c.id;}).join()') === 'imc,reganhoglp1', 'o professor tem de ver o cartão de piloto');
ok(run('calcVisivel(CALCS[0])') === true && run('calcVisivel(CALCS[2])') === true, 'calcVisivel não pode esconder as calculadoras comuns');
ok(/CALCS\.filter\(calcVisivel\)\.length/.test(html), 'a contagem "Todas as áreas" tem de contar só o que a pessoa vê');
ok(/CALCS\.find\(function\(x\)\{return x\.id===id&&calcVisivel\(x\);\}\)/.test(html), 'openCalc tem de recusar o piloto para quem não é professor');

// ── 4. cartão ────────────────────────────────────────────────────────────────
ok(/\(c\.soProfessor\?'<span class="calc-piloto">Piloto · só professores<\/span>':''\)/.test(html), 'o cartão tem de mostrar "Piloto · só professores"');
ok(/esc\(c\.rotuloExt\|\|'Ferramenta oficial'\)/.test(html), 'o rodapé do cartão externo tem de aceitar rotuloExt');
ok(/\.calc-piloto\{/.test(html), 'falta o CSS da marca de piloto');

if (falhas.length) { console.error('✗ calculadora de reganho pós-GLP-1 (piloto)'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
console.log('✓ calculadora de reganho pós-GLP-1: piloto só para professores, externa, texto em português e limites');
