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
// setas na curva (professor, 18/11/2026: "colocar uma seta na curva, no gráfico, onde foi iniciado"), no lugar das faixas
ok((svg.match(/class="tp-seta"/g) || []).length === 5 && !/<rect /.test(svg), 'uma seta por início de dose e uma na suspensão; sem as faixas de baixo');
ok(/>Tirzepatida 2,5 mg\/sem</.test(svg) && />Tirzepatida 5 mg\/sem</.test(svg) && />Tirzepatida 7,5 mg\/sem</.test(svg) && />Tirzepatida suspensa</.test(svg) && />Orlistate 120 mg 3×\/dia</.test(svg) && !/>5 mg\/sem</.test(svg), 'rótulos: nome da medicação e dose em todas as setas (professor, 19/11/2026), e a suspensão');
const s360 = run("tpGraficoSVG(R,'kg',R.pts[0].t,360)");
ok(/>Tirzepatida [\d,]+ mg</.test(s360) && !/mg\/sem</.test(s360), 'no celular, nome e dose sem "/sem"');
ok((svg.match(/paint-order="stroke">/g) || []).length >= 2, 'números do 1º, último e menor peso com contorno do fundo (legíveis sobre as setas)');
// setas curtas, junto do ponto (professor, 19/11/2026: "as setas ficaram muito longas. Colocar uma seta menor, mais discreta, próxima do ponto")
const hastes = svg.split('<g class="tp-seta">').slice(1).map((s) => s.split('</g>')[0]).map((s) => { const m = s.match(/<line x1="[\d.]+" y1="([\d.]+)" x2="[\d.]+" y2="([\d.]+)"/); return m ? +m[2] - +m[1] : 0; });
ok(hastes.length === 5 && Math.max(...hastes) <= 46 && Math.min(...hastes) <= 12, 'setas curtas, logo acima do ponto: ' + hastes.join('/'));
// o peso em cada seta (professor, 19/11/2026: "faltou o peso na dose de 0,5 mg por semana ... e também ... na dose de 1 mg")
const PJ = run(`tpGraficoSVG(tpAnalisa({alt:'168',pesos:[{d:'2026-05-05',p:'85'},{d:'2026-07-05',p:'79'},{d:'2026-09-05',p:'74'},{d:'2026-11-05',p:'71'}],meds:[{n:'Semaglutida SC',dose:'0,25 mg/sem',ini:'2026-05-05'},{n:'Semaglutida SC',dose:'0,5 mg/sem',ini:'2026-07-05'},{n:'Semaglutida SC',dose:'1 mg/sem',ini:'2026-09-05'}]}),'kg',0,1100)`);
ok(['85,0', '79,0', '74,0', '71,0'].every((v) => PJ.includes('>' + v + ' kg<')) && (PJ.match(/class="tp-seta-p"/g) || []).length === 2 && (PJ.match(/>85,0 kg</g) || []).length === 1, 'peso escrito em cada seta (0,25 → 85, 0,5 → 79, 1 mg → 74), sem repetir o do 1º ponto');
ok(/≈[\d,]+ kg</.test(svg), 'seta numa data sem pesagem: peso da curva com ≈');
const cel = run("tpGraficoSVG(R,'kg',R.pts[0].t,320)");
ok(!/≈[\d,]+ kg</.test(cel), 'no celular, sem os pesos estimados (≈) nas setas');
const caixasTxt = (s) => [...s.matchAll(/<text x="([\d.]+)" y="([\d.]+)" text-anchor="(start|end|middle)" font-size="9\.5" font-weight="700"[^>]*>([^<]+)</g)].map((m) => { const w = m[4].length * 5.4 + 2, x = +m[1], y = +m[2]; const xa = m[3] === 'start' ? x : (m[3] === 'end' ? x - w : x - w / 2); return [xa, xa + w, y - 8, y + 2, m[4]]; });
const encostam = (s) => { const c = caixasTxt(s), r = []; for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) if (c[i][0] < c[j][1] && c[i][1] > c[j][0] && c[i][2] < c[j][3] && c[i][3] > c[j][2]) r.push(c[i][4] + ' × ' + c[j][4]); return r; };
ok(!encostam(cel).length && !encostam(svg).length && !encostam(PJ).length, 'números de peso não se encostam (celular, padrão e largo): ' + encostam(cel).concat(encostam(svg), encostam(PJ)).join('; '));
ok(/>100,0 kg</.test(svg) && />90,5 kg</.test(svg) && />88,0 kg</.test(svg), 'rótulos do primeiro, do último e do menor peso');
ok(/<path d="M[\d.]+ [\d.]+ L[\d.]+ [\d.]+ L[\d.]+ [\d.]+ Z" fill="#60a5fa"\/>/.test(svg), 'ponta da seta na curva');
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
// medicação e dose em lista de escolha, com todas as opções sempre à vista (professor, 19/11/2026: "sempre aparecer todas as doses para preenchimento")
ok(lm.querySelector('select[data-tp-msel="n"]').options.length === run('TP_MEDS.length') + 2 && lm.querySelector('[data-tp-m="n"]').hidden, 'medicação: lista com todas as medicações, "Escolha…" e "Outra medicação…"');
setv(lm.querySelector('select[data-tp-msel="n"]'), 'Semaglutida SC', 'change');
const lm1 = () => root.querySelector('.tp-lm');
ok([...lm1().querySelector('select[data-tp-msel="dose"]').options].map((o) => o.textContent).join('|') === 'Escolha…|0,25 mg/sem|0,5 mg/sem|1 mg/sem|1,7 mg/sem|2,4 mg/sem|Outra dose…', 'dose: todas as doses da semaglutida SC, sempre');
ok(lm1().querySelector('select[data-tp-msel="dose"]').value === '0,25 mg/sem' && J("ls['trajpeso_u1'].pac[0].meds[0].dose") === '0,25 mg/sem', 'ao escolher a medicação, a dose começa na inicial');
setv(lm1().querySelector('select[data-tp-msel="dose"]'), '1 mg/sem', 'change');
ok(lm1().querySelector('select[data-tp-msel="dose"]').value === '1 mg/sem' && [...lm1().querySelector('select[data-tp-msel="dose"]').options].length === 7, 'com 1 mg escolhido, as outras doses continuam na lista');
setv(lm1().querySelector('select[data-tp-msel="dose"]'), '__outra', 'change');
ok(!lm1().querySelector('[data-tp-m="dose"]').hidden, '"Outra dose…" abre o campo para digitar');
setv(lm1().querySelector('[data-tp-m="dose"]'), '0,75 mg/sem');
root.querySelector('[data-tp-addm]').click(); root.querySelector('[data-tp-delm="1"]').click();
ok(lm1().querySelector('select[data-tp-msel="dose"]').value === '__outra' && lm1().querySelector('[data-tp-m="dose"]').value === '0,75 mg/sem' && !lm1().querySelector('[data-tp-m="dose"]').hidden, 'dose digitada fica como "Outra" ao redesenhar');
setv(lm1().querySelector('select[data-tp-msel="dose"]'), '0,25 mg/sem', 'change');
setv(lm.querySelector('[data-tp-m="ini"]'), '2026-01-12');
root.querySelector('[data-tp-addm]').click();
ok(root.querySelectorAll('.tp-lm')[1].querySelector('[data-tp-m="n"]').value === 'Semaglutida SC', 'nova dose já vem com a mesma medicação');
// pré-preenchida pela pesagem e pela titulação (professor, 18/11/2026: "a próxima dose já ser cadastrada para essa data")
ok(root.querySelectorAll('.tp-lm')[1].querySelector('[data-tp-m="dose"]').value === '0,5 mg/sem' && root.querySelectorAll('.tp-lm')[1].querySelector('[data-tp-m="ini"]').value === '2026-05-10', 'nova dose: a seguinte da titulação, na data da pesagem seguinte');
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
ok(/^Trajetória do peso — AB \(altura 1,65 m\)/.test(txt) && /Semaglutida SC \(0,25 mg\/sem → 0,5 mg\/sem\)/.test(txt) && /aos 3 meses −/.test(txt), 'resumo em texto para o prontuário');
root.querySelector('[data-tp-exemplo]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 2 && root.querySelector('[data-tp-pac]').options.length === 2 && /Exemplo \(fictício\)/.test(root.querySelector('[data-tp-pac]').textContent), 'exemplo vira um paciente a mais');
ok(/Tirzepatida/.test(root.querySelector('[data-tp-res]').textContent) && /reganho de/.test(root.querySelector('[data-tp-res]').textContent), 'exemplo mostra duas medicações e o reganho');
run('confirma=false'); root.querySelector('[data-tp-excluir]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 2, 'excluir pede confirmação');
run('confirma=true'); root.querySelector('[data-tp-excluir]').click();
ok(J("ls['trajpeso_u1'].pac.length") === 1 && J("ls['trajpeso_u1'].pac[0].rot") === 'AB', 'excluir apaga só o paciente aberto');
run("currentUser={id:'u2',role:'aluno'};document.getElementById('calc').innerHTML='';tpRender(document.getElementById('calc'))");
ok(root.querySelector('[data-tp-pac]').options.length === 1 && root.querySelector('[data-tp-campo="rot"]').value === '', 'outra conta no mesmo aparelho não vê os pacientes');

// 3b) preencher mais rápido (professor, 18/11/2026: "mais fluida, mais prática, mais rápida de preencher" → "Vamos ver como fica")
{
  const L = J("tpLerLista('05/04/26 82\\n15/06/2026\\t77,9 kg\\n2026-08-01: 75.5\\nabril 80\\n31/02/26 70\\n10/10/26 5\\n\\n')");
  ok(L.ok.map((x) => x.d + '=' + x.p).join() === '2026-04-05=82,2026-06-15=77,9,2026-08-01=75.5' && L.ruins === 3, 'colar lista: dd/mm/aa, dd/mm/aaaa com tab e kg, aaaa-mm-dd; ignora sem data, data impossível e peso absurdo: ' + JSON.stringify(L));
  ok(run("tpMaisMeses('2026-01-31',1)") === '2026-03-03' || run("tpMaisMeses('2026-01-31',1)") === '2026-03-02', '+1 mês segue o calendário');
  ok(run("tpMaisMeses('2026-05-10',3)") === '2026-08-10', '+3 meses');
  const E = J("tpEscalaLinhas('Semaglutida SC','2026-01-05',4)");
  ok(E.length === 5 && E.map((x) => x.ini).join() === '2026-01-05,2026-02-02,2026-03-02,2026-03-30,2026-04-27' && E[4].dose === '2,4 mg/sem' && E.every((x) => x.fim === ''), 'escalonamento da semaglutida: 5 doses de 4 em 4 semanas');
  const EP = J("tpEscalaLinhas('Semaglutida SC','2026-04-05',4,['2026-04-05','2026-06-05','2026-08-05','2026-03-01'])");
  ok(EP.map((x) => x.dose + '@' + x.ini).join() === '0,25 mg/sem@2026-04-05,0,5 mg/sem@2026-06-05,1 mg/sem@2026-08-05', 'escalonamento pelas pesagens: uma dose por pesagem a partir do início, até a última pesagem');
  ok(run("tpProxDose('semaglutida sc','0,5 mg/sem')") === '1 mg/sem' && run("tpProxDose('Tirzepatida','15 mg/sem')") === '15 mg/sem' && run("tpProxDose('Outra','x')") === '', 'próxima dose da titulação');
  const EL = J("tpEscalaLinhas('Liraglutida','2026-01-05',2)");
  ok(EL.length === 3 && EL[2].ini === '2026-01-19' && EL[2].dose === '1,8 mg/dia', 'liraglutida semanal, parando na dose-alvo escolhida');
  run(`var M=tpAnalisa({alt:'170',meta:'85',pesos:[{d:'2026-01-01',p:'100'},{d:'2026-03-01',p:'90'},{d:'2026-05-01',p:'84'},{d:'2026-07-01',p:'86'}],meds:[]});`);
  ok(run('M.meta') === 85 && run('M.metaT') === Date.UTC(2026, 4, 1), 'peso-meta: valor e data em que foi atingido');
  const hm = run('tpResumoHTML(M)');
  ok(/Peso-meta/.test(hm) && /85,0 kg/.test(hm) && /atingida em 01\/05\/26/.test(hm) === false && /faltam 1,0 kg/.test(hm), 'quadro do peso-meta: com o peso atual acima da meta, mostra quanto falta');
  run("M=tpAnalisa({meta:'85',pesos:[{d:'2026-01-01',p:'100'},{d:'2026-05-01',p:'84'}],meds:[]})");
  ok(/atingida em 01\/05\/26/.test(run('tpResumoHTML(M)')), 'quadro do peso-meta: atingida, com a data');
  ok(/meta 85,0 kg/.test(run("tpGraficoSVG(M,'kg',M.pts[0].t)")) && /stroke="#34d399" stroke-width="1.6" stroke-dasharray="7 4"/.test(run("tpGraficoSVG(M,'kg',M.pts[0].t)")), 'gráfico: linha da meta');
  ok(/Peso-meta: 85,0 kg \(atingida\)/.test(run("tpResumoTexto({meta:'85',pesos:[{d:'2026-01-01',p:'100'},{d:'2026-05-01',p:'84'}],meds:[]})")), 'resumo em texto com a meta');
  // na tela: atalhos de data, colar lista, escalonamento e imprimir
  // contêiner novo, como no app (cada abertura da calculadora cria o seu)
  const r3 = doc.createElement('div'); r3.id = 'calc3'; doc.body.appendChild(r3);
  run("currentUser={id:'u3',role:'admin'};tpRender(document.getElementById('calc3'))");
  setv(r3.querySelector('[data-tp-np]'), '90'); setv(r3.querySelector('[data-tp-nd]'), '2026-02-10', 'change'); r3.querySelector('[data-tp-addp]').click();
  r3.querySelector('[data-tp-dt="2"]').click();
  ok(r3.querySelector('[data-tp-nd]').value === '2026-04-10', 'atalho "+2 meses" (professor, 19/11/2026)');
  r3.querySelector('[data-tp-dt="3"]').click();
  ok(r3.querySelector('[data-tp-nd]').value === '2026-05-10', 'atalho "+3 meses" conta do último peso');
  r3.querySelector('[data-tp-dt="0"]').click();
  ok(r3.querySelector('[data-tp-nd]').value === run('tpHojeISO()'), 'atalho "hoje"');
  r3.querySelector('[data-tp-colar]').click();
  ok(r3.querySelector('[data-tp-colar-box]').hidden === false, 'colar lista abre a caixa');
  r3.querySelector('[data-tp-lista]').value = '10/03/26 88\n10/04/26 86,5\nxx';
  run('avisos.length=0'); r3.querySelector('[data-tp-colar-ok]').click();
  ok(J("ls['trajpeso_u3'].pac[0].pesos").map((x) => x.d).join() === '2026-02-10,2026-03-10,2026-04-10' && /2 pesos adicionados · 1 linha ignorada/.test(run('avisos[0][0]')) && r3.querySelector('[data-tp-colar-box]').hidden === true, 'colar lista grava em ordem e avisa quantos entraram');
  r3.querySelector('[data-tp-esc]').click();
  const sel = r3.querySelector('[data-tp-esc-med]'); sel.value = 'Tirzepatida'; sel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(r3.querySelectorAll('[data-tp-esc-alvo] option').length === 6 && r3.querySelector('[data-tp-esc-alvo]').value === '5', 'escalonamento: doses da medicação escolhida, dose máxima pré-selecionada');
  r3.querySelector('[data-tp-esc-alvo]').value = '2'; setv(r3.querySelector('[data-tp-esc-ini]'), '2026-02-12', 'change');
  r3.querySelector('[data-tp-esc-ok]').click();
  ok(J("ls['trajpeso_u3'].pac[0].meds").map((x) => x.dose + '@' + x.ini).join() === '2,5 mg/sem@2026-02-12,5 mg/sem@2026-03-10,7,5 mg/sem@2026-04-10' && r3.querySelector('details[data-tp-det="meds"]').open, 'escalonamento nas datas das pesagens: cada dose nova na pesagem seguinte, e abre a lista para ajustar');
  setv(r3.querySelector('[data-tp-campo="meta"]'), '80');
  ok(J("ls['trajpeso_u3'].pac[0].meta") === '80' && /Peso-meta/.test(r3.querySelector('[data-tp-res]').textContent), 'peso-meta na tela');
  run(`var impresso='';window.open=function(){return {document:{write:function(h){impresso+=h;},close:function(){}},focus:function(){},print:function(){}};};`);
  r3.querySelector('[data-tp-imprimir]').click();
  const imp = run('impresso');
  ok(/<title>Trajetória do peso<\/title>/.test(imp) && /<svg viewBox="0 0 900 /.test(imp) && /Peso-meta/.test(imp) && /Tirzepatida/.test(imp) && /Não substitui a avaliação clínica/.test(imp) && /--surface:#fff/.test(imp), 'imprimir/PDF: gráfico, resumo e medicações em fundo branco');
}

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
ok(/@media \(hover:none\) and \(pointer:coarse\)\{\.tp input,\.tp select,\.tp textarea\{font-size:16px\}\}/.test(html), 'campos com 16 px no toque (iPhone não amplia)');
// Layout (professor, 18/11/2026: "essa parte aqui de baixo ficou muito espremida ... deixar mais centralizado, junto com o gráfico")
ok(/@container \(min-width:1050px\)\{\s*\.tp\{display:grid;grid-template-columns:minmax\(0,25rem\) minmax\(0,1fr\)/.test(html) && /\[data-calc-render\]:has\(> \.tp\)\{container-type:inline-size\}/.test(html),
  'cartão largo: preenchimento à esquerda e gráfico + resumo à direita (pela largura do cartão)');
ok(/\.tp-kpis\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(9rem,1fr\)\)/.test(html), 'quadros do resumo ocupam a largura toda (auto-fit), sem ficar espremidos à esquerda');
ok(/Math\.min\(1200,Math\.round\(larg\)\)/.test(html) && /y1=208\+faixa\+Math\.max\(0,Math\.min\(120,/.test(html), 'gráfico desenhado na largura real (até 1200 px) e mais alto quando largo: a letra não estica');

if (falhas.length) {
  console.error('✗ Trajetória do peso:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ Trajetória do peso: curva de peso/IMC/% com uma seta na curva em cada dose, perda desde cada início, 3 meses, menor peso e reganho; dados só no aparelho');
