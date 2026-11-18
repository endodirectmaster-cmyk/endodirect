// Regressão: calculadora "Trajetória do peso no tratamento" (professor, 18/11/2026: "mostrando o segmento do
// paciente ao longo do tempo na sua trajetória da perda de peso ... o uso das medicações, a partir do momento de
// início à medicação, como que foi essa curva, a trajetória da perda de peso, o IMC").
// Pesos e medicações do paciente ficam só no aparelho (chave por conta), nunca no app_state.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}

const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="calc"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var ls={},avisos=[],confirma=true,currentUser={id:'u1',role:'aluno'};
  function lsGet(k){return k in ls?JSON.parse(JSON.stringify(ls[k])):null;}
  function lsSet(k,v){ls[k]=JSON.parse(JSON.stringify(v));}
  function notify(m,t){avisos.push([m,t]);}
  window.confirm=function(){return confirma;};
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
`, ctx);
vm.runInContext(corpo('cliqLe'), ctx);
const i0 = html.indexOf('// ── TRAJETÓRIA DO PESO NO TRATAMENTO (18/11/2026)');
const i1 = html.indexOf('var CALCS=[\n');
ok(i0 > 0 && i1 > i0, 'módulo da trajetória antes da lista de calculadoras');
vm.runInContext(html.slice(i0, i1), ctx);
const run = (c) => vm.runInContext(c, ctx);
const J = (c) => JSON.parse(run('JSON.stringify(' + c + ')'));
const doc = dom.window.document;
const D = 86400000;

// 1) conta: interpolação, doses que terminam sozinhas, resposta aos 3 meses
run(`var P={alt:'170',pesos:[{d:'2026-01-01',p:'100'},{d:'2026-02-01',p:'98'},{d:'2026-04-01',p:'94'},{d:'2026-07-01',p:'88'},{d:'2026-09-01',p:'90,5'}],
  meds:[{n:'Tirzepatida',dose:'2,5 mg/sem',ini:'2026-01-15',fim:''},{n:'tirzepatida',dose:'5 mg/sem',ini:'2026-02-12',fim:''},{n:'Tirzepatida',dose:'7,5 mg/sem',ini:'2026-03-12',fim:'2026-07-01'},
        {n:'Orlistate',dose:'120 mg 3×/dia',ini:'2026-08-20',fim:''},{n:'',dose:'x',ini:'2026-01-01'},{n:'Sem data',dose:'x',ini:''}]};
  var R=tpAnalisa(P);`);
ok(run('R.pts.length') === 5 && Math.abs(run('R.alt') - 1.7) < 1e-9, 'lê pesos (vírgula decimal) e altura em cm');
ok(run('R.grupos.length') === 2 && run('R.grupos[0].nome') === 'Tirzepatida', 'agrupa as doses pela medicação (sem diferenciar maiúscula) e ignora linha sem nome ou sem início');
const segs = J('R.grupos[0].segs.map(function(s){return [s.dose,s.fim];})');
ok(segs[0][1] === Date.UTC(2026, 1, 12) && segs[1][1] === Date.UTC(2026, 2, 12) && segs[2][1] === Date.UTC(2026, 6, 1), 'cada dose termina quando começa a próxima; a última, no fim anotado');
ok(J('R.grupos[0].doses').join('|') === '2,5 mg/sem|5 mg/sem|7,5 mg/sem' && run('R.grupos[0].aberto') === false, 'escalonamento das doses e medicação suspensa');
const pIni = run('R.grupos[0].pIni.p');
ok(Math.abs(pIni - (100 - 2 * 14 / 31)) < 1e-6 && run('R.grupos[0].pIni.aprox') === true, 'peso no início da medicação interpolado entre as medidas vizinhas (≈ quando não há medida a até 7 dias)');
ok(run('R.grupos[0].pFim.p') === 88 && run('R.grupos[0].pFim.aprox') === false, 'peso no fim da medicação');
const p3 = run('R.grupos[0].p3.p'), d3 = (p3 - pIni) / pIni * 100;
ok(d3 < -5 && d3 > -8, 'perda aos 3 meses calculada no dia 91: ' + d3.toFixed(2));
ok(run('R.grupos[1].aberto') === true && run('R.grupos[1].falta3') === true, 'medicação em uso há menos de 3 meses: ainda não avalia a resposta');
ok(run('R.nadir.p') === 88 && Math.abs(run('R.reganho') - 2.5) < 1e-9 && Math.abs(run('R.varPct') - (-9.5)) < 1e-9, 'menor peso, reganho e variação total');
ok(J('R.marcos.map(function(m){return isFinite(m.t)?m.k:0;})').join() === '5,10,0,0', 'marcos de 5% e 10% atingidos');
ok(run("tpPesoEm(R.pts,Date.UTC(2025,9,1))") === null && run("tpPesoEm(R.pts,Date.UTC(2025,11,10)).p") === 100, 'fora das medidas, só até 45 dias da mais próxima');
ok(run("tpAnalisa({alt:'1,62',pesos:[]}).alt") === 1.62 && isNaN(run("tpAnalisa({alt:'50',pesos:[]}).alt")), 'altura em metros também vale; absurda não');
run(`var C=tpAnalisa({pesos:[{d:'2026-01-01',p:'130'},{d:'2026-06-01',p:'100'}],meds:[{n:'Cirurgia bariátrica',dose:'Sleeve',ini:'2026-01-05',fim:''}]});`);
ok(run('C.grupos[0].cirurgia') === true && !run('C.grupos[0].p3'), 'cirurgia bariátrica não entra no critério dos 3 meses');
run(`var S=tpAnalisa({pesos:[{d:'2026-01-01',p:'100'},{d:'2026-06-01',p:'96'}],meds:[{n:'Liraglutida',dose:'3,0 mg/dia',ini:'2026-01-01',fim:'2026-02-10'}]});`);
ok(run('S.grupos[0].antes3') === true, 'suspensa antes de 3 meses');

// 2) gráfico
let svg = run("tpGraficoSVG(R,'kg',R.pts[0].t)");
ok(/<polyline points="[^"]+"/.test(svg) && svg.match(/<polyline points="([^"]+)"/)[1].split(' ').length === 5, 'curva com um ponto por peso');
ok(/>IMC 30</.test(svg) && /stroke="#f59e0b"/.test(svg), 'peso em kg: linhas dos limites de IMC (com altura)');
ok((svg.match(/<rect /g) || []).length === 4 && />Tirzepatida · em uso|>Tirzepatida</.test(svg) && />Orlistate · em uso</.test(svg), 'uma faixa por medicação, um bloco por dose, "em uso" na que segue');
ok(/>100,0 kg</.test(svg) && />90,5 kg</.test(svg) && />88,0 kg</.test(svg), 'rótulos do primeiro, do último e do menor peso');
ok(/stroke-dasharray="4 3"/.test(svg), 'linha tracejada no início de cada medicação');
const svgImc = run("tpGraficoSVG(R,'imc',R.pts[0].t)");
ok(/IMC \(kg\/m²\)/.test(svgImc) && />obesidade I</.test(svgImc), 'modo IMC com as faixas nomeadas');
const svgPct = run("tpGraficoSVG(R,'pct',R.grupos[0].ini)");
ok(/variação do peso/.test(svgPct) && /stroke="#34d399"/.test(svgPct) && />\+0,9%</.test(svgPct), 'modo %: a partir do início da medicação (o 1º peso fica acima), com os marcos de perda');
ok(/viewBox="0 0 360 /.test(run("tpGraficoSVG(R,'kg',R.pts[0].t,360)")) && /viewBox="0 0 640 /.test(svg), 'desenhado na largura do celular (letra legível) ou 640 sem medida');
ok(!/<script|onload|onerror/i.test(run("tpGraficoSVG(tpAnalisa({pesos:[{d:'2026-01-01',p:'90'},{d:'2026-02-01',p:'89'}],meds:[{n:'<img src=x onerror=1>',ini:'2026-01-01'}]}),'kg',0)").replace(/&lt;img src=x onerror=1&gt;/g, '')), 'nome da medicação escapado no gráfico');

// 3) tela
const root = doc.getElementById('calc');
run("tpRender(document.getElementById('calc'))");
ok(!!root.querySelector('[data-tp-pac]') && /Ver exemplo/.test(root.textContent) && /não vai para o servidor/.test(root.textContent), 'tela: paciente, exemplo e aviso de que fica no aparelho');
ok(/Anote os pesos/.test(root.querySelector('[data-tp-res]').textContent), 'tela: sem peso, pede os pesos');
ok(run("Object.keys(ls).length") === 0, 'abrir não grava nada');
const setv = (el, v, ev) => { el.value = v; el.dispatchEvent(new dom.window.Event(ev || 'input', { bubbles: true })); };
setv(root.querySelector('[data-tp-campo="rot"]'), 'AB');
setv(root.querySelector('[data-tp-campo="alt"]'), '165');
setv(root.querySelector('[data-tp-nd]'), '2026-01-10', 'change');
setv(root.querySelector('[data-tp-np]'), '104,5');
root.querySelector('[data-tp-addp]').click();
setv(root.querySelector('[data-tp-nd]'), '2026-05-10', 'change');
setv(root.querySelector('[data-tp-np]'), '96');
root.querySelector('[data-tp-np]').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
setv(root.querySelector('[data-tp-nd]'), '2026-03-01', 'change');
setv(root.querySelector('[data-tp-np]'), '10');
root.querySelector('[data-tp-addp]').click();
ok(run('avisos.length') === 1 && run('avisos[0][1]') === 'err', 'peso absurdo não entra (aviso)');
const salvo = J("ls['trajpeso_u1']");
ok(salvo && salvo.pac.length === 1 && salvo.pac[0].rot === 'AB' && salvo.pac[0].pesos.map((x) => x.d + '=' + x.p).join() === '2026-01-10=104,5,2026-05-10=96', 'grava no aparelho, na chave da conta, em ordem de data');
ok(root.querySelectorAll('.tp-lp').length === 2 && /IMC 38,4/.test(root.querySelector('.tp-lp').textContent), 'lista dos pesos com o IMC de cada um');
const detP = root.querySelector('details[data-tp-det="pesos"]');
ok(detP && !detP.open && detP.querySelector('summary').textContent.trim() === '▸ 2 pesos · último: 96 kg em 10/05/26 · ver e editar', 'lista dos pesos recolhida, com o último peso no título');
ok(!root.querySelector('details[data-tp-det="meds"]') && !!root.querySelector('[data-tp-addm]'), 'sem medicação: só o botão de adicionar');
detP.open = true; detP.dispatchEvent(new dom.window.Event('toggle'));
setv(root.querySelector('[data-tp-np]'), '95,5'); setv(root.querySelector('[data-tp-nd]'), '2026-05-10', 'change');
root.querySelector('[data-tp-addp]').click();
ok(root.querySelector('details[data-tp-det="pesos"]').open === true && /último: 95,5 kg/.test(root.querySelector('[data-tp-pres]').textContent), 'aberta continua aberta ao redesenhar; mesmo dia troca o peso');
setv(root.querySelector('[data-tp-pp="1"]'), '96');
ok(/último: 96 kg/.test(root.querySelector('[data-tp-pres]').textContent), 'título acompanha a edição do peso');
root.querySelector('[data-tp-addm]').click();
const lm = root.querySelector('.tp-lm');
setv(lm.querySelector('[data-tp-m="n"]'), 'Semaglutida SC');
ok(/2,4 mg\/sem/.test(lm.querySelector('datalist').innerHTML), 'doses sugeridas conforme a medicação');
setv(lm.querySelector('[data-tp-m="dose"]'), '0,25 mg/sem');
setv(lm.querySelector('[data-tp-m="ini"]'), '2026-01-12');
root.querySelector('[data-tp-addm]').click();
ok(root.querySelectorAll('.tp-lm')[1].querySelector('[data-tp-m="n"]').value === 'Semaglutida SC', 'nova dose já vem com a mesma medicação');
ok(root.querySelector('details[data-tp-det="meds"]').open === true && root.querySelector('[data-tp-mres]').textContent === 'Semaglutida SC (2 doses) · ver e editar', 'medicações: abre ao adicionar, título com as doses');
const res = root.querySelector('[data-tp-res]');
ok(/Semaglutida SC/.test(res.textContent) && /−8,5 kg/.test(res.textContent) && /−8,1%/.test(res.textContent) && /obesidade grau I/.test(res.textContent), 'resumo: variação total, IMC atual e a medicação');
ok(/Aos 3 meses/.test(res.textContent) && /resposta \(perda ≥ 5%\)/.test(res.textContent), 'resposta aos 3 meses');
ok(res.classList.contains('tp-col-res') && root.querySelector('.tp > .tp-col-ent') && res.querySelectorAll('.tp-med .tp-med-grid .tp-med-st').length === 3, 'resultado em coluna própria; medicação em faixa com período, peso e 3 meses');
res.querySelector('[data-tp-modo="pct"]').click();
ok(!!res.querySelector('[data-tp-base]') && /variação do peso/.test(res.innerHTML), 'modo %: escolhe o ponto de partida');
const sb = res.querySelector('[data-tp-base]'); sb.value = 'semaglutida sc'; sb.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
ok(run('tpBase') === 'semaglutida sc' && /início de Semaglutida SC/.test(res.querySelector('[data-tp-base] option[selected]').textContent), 'modo %: a partir do início da medicação');
const txt = run('tpResumoTexto(tpCarrega().pac[0])');
ok(/^Trajetória do peso — AB \(altura 1,65 m\)/.test(txt) && /Semaglutida SC \(0,25 mg\/sem\)/.test(txt) && /aos 3 meses −/.test(txt), 'resumo em texto para o prontuário');
root.querySelector('[data-tp-exemplo]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 2 && root.querySelector('[data-tp-pac]').options.length === 2 && /Exemplo \(fictício\)/.test(root.querySelector('[data-tp-pac]').textContent), 'exemplo vira um paciente a mais');
ok(/Tirzepatida/.test(root.querySelector('[data-tp-res]').textContent) && /reganho de/.test(root.querySelector('[data-tp-res]').textContent), 'exemplo mostra duas medicações e o reganho');
run('confirma=false'); root.querySelector('[data-tp-excluir]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 2, 'excluir pede confirmação');
run('confirma=true'); root.querySelector('[data-tp-excluir]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 1 && J("ls['trajpeso_u1'].pac[0].rot") === 'AB', 'excluir apaga só o paciente aberto');
run("currentUser={id:'u2',role:'aluno'};document.getElementById('calc').innerHTML='';tpRender(document.getElementById('calc'))");
ok(root.querySelector('[data-tp-pac]').options.length === 1 && root.querySelector('[data-tp-campo="rot"]').value === '', 'outra conta no mesmo aparelho não vê os pacientes');

// 4) fiação e privacidade
ok(!/trajpeso|tpCarrega/.test(corpo('userStatePayload')), 'pacientes fora do app_state (não vão para o servidor)');
const iCalc = html.indexOf("  {id:'trajpeso',"), iImc = html.indexOf("  {id:'imc',name:'IMC'"), iPep = html.indexOf("  {id:'pep',");
ok(iImc > 0 && iImc < iCalc && iCalc < iPep, 'na lista, logo depois do IMC (Obesidade)');
ok(/\{id:'trajpeso',name:'Trajetória do peso no tratamento',area:'Obesidade',[\s\S]{0,800}render:function\(root\)\{tpRender\(root\);\}/.test(html), 'calculadora de tela própria em Obesidade');
// Piloto só do professor (18/11/2026: "Essa calculadora ainda não publica. Deixa apenas no painel do professor").
// Para publicar aos alunos: tirar o soProfessor e trocar esta verificação.
ok(/soProfessor:true,/.test(html.slice(iCalc, iPep)), 'ainda é piloto: só o professor vê (soProfessor)');
{
  const ctx2 = vm.createContext({ admin: false, APP_LOJA: '' });
  vm.runInContext('function isAdminUser(){return admin;}\n' + corpo('calcVisivel'), ctx2);
  const ent = { id: 'trajpeso', soProfessor: /soProfessor:true,/.test(html.slice(iCalc, iPep)) };
  ctx2.ent = ent;
  ok(vm.runInContext('calcVisivel(ent)', ctx2) === false, 'o aluno não vê a calculadora (grade, busca e abrir por id passam por calcVisivel)');
  ctx2.admin = true;
  ok(vm.runInContext('calcVisivel(ent)', ctx2) === true, 'o professor vê a calculadora');
}
ok(/\+\(c\.soProfessor\?'<div class="calc-piloto" style="margin:\.1rem 0 \.6rem">Piloto · visível só para professores<\/div>':''\)\s*\+'<div data-calc-render><\/div>'/.test(html), 'tela da calculadora com o selo de piloto');
ok(/Apovian CM et al\., J Clin Endocrinol Metab 2015/.test(html.slice(iCalc, iPep)), 'nota com a referência do critério dos 3 meses');
ok(/@media \(hover:none\) and \(pointer:coarse\)\{\.tp input,\.tp select\{font-size:16px\}\}/.test(html), 'campos com 16 px no toque (iPhone não amplia)');
// Layout (professor, 18/11/2026: "essa parte aqui de baixo ficou muito espremida ... deixar mais centralizado, junto com o gráfico")
ok(/@container \(min-width:1050px\)\{\s*\.tp\{display:grid;grid-template-columns:minmax\(0,25rem\) minmax\(0,1fr\)/.test(html) && /\[data-calc-render\]:has\(> \.tp\)\{container-type:inline-size\}/.test(html),
  'cartão largo: preenchimento à esquerda e gráfico + resumo à direita (pela largura do cartão)');
ok(/\.tp-kpis\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(9rem,1fr\)\)/.test(html), 'quadros do resumo ocupam a largura toda (auto-fit), sem ficar espremidos à esquerda');
ok(/Math\.min\(1200,Math\.round\(larg\)\)/.test(html) && /y1=208\+Math\.max\(0,Math\.min\(120,/.test(html), 'gráfico desenhado na largura real (até 1200 px) e mais alto quando largo: a letra não estica');

if (falhas.length) {
  console.error('✗ Trajetória do peso:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ Trajetória do peso: curva de peso/IMC/% com as faixas das medicações, perda desde cada início, 3 meses, menor peso e reganho; dados só no aparelho');
