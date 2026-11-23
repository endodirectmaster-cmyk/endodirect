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
// tela cheia (professor, 19/11/2026: "deixar a opção de poder clicar no gráfico e ele ampliar em tela cheia")
const sCheia = run("tpGraficoSVG(R,'kg',R.pts[0].t,1900,880)");
ok(/^<svg viewBox="0 0 1900 880"/.test(sCheia), 'tela cheia: desenha na largura e na altura da tela');
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
ok(!!root.querySelector('[data-tp-pac]') && /Ver exemplo/.test(root.textContent) && /não vão para o servidor/.test(root.textContent), 'tela: paciente, exemplo e aviso de que fica no aparelho');
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
// medicações: linha de adicionar como a do peso (professor, 23/11/2026: "ao invés do botão de mais medicação ou nova
// dose, deixar o botão de adicionar como existe no peso. E aí deixar só o botão de escalonamento padrão")
const am = () => root.querySelector('.tp-add-med');
ok(!root.querySelector('details[data-tp-det="meds"]') && !!am() && am().querySelector('[data-tp-am-n]').value === '' && am().querySelector('[data-tp-am-i]').value === '10/01/2026', 'sem medicação: linha de adicionar, com o início sugerido no 1º peso');
ok(!/Medicação ou nova dose/.test(root.textContent) && !!root.querySelector('.tp-sec-acoes [data-tp-esc]') && root.querySelectorAll('[data-tp-addm]').length === 1, 'sem o botão antigo; "Escalonamento padrão" no cabeçalho da seção');
detP.open = true; detP.dispatchEvent(new dom.window.Event('toggle'));
setv(root.querySelector('[data-tp-np]'), '95,5'); setv(root.querySelector('[data-tp-nd]'), '2026-05-10', 'change');
root.querySelector('[data-tp-addp]').click();
ok(root.querySelector('details[data-tp-det="pesos"]').open === true && /último: 95,5 kg/.test(root.querySelector('[data-tp-pres]').textContent), 'aberta continua aberta ao redesenhar; mesmo dia troca o peso');
setv(root.querySelector('[data-tp-pp="1"]'), '96');
ok(/último: 96 kg/.test(root.querySelector('[data-tp-pres]').textContent), 'título acompanha a edição do peso');
const nAvisos = run('avisos.length');
root.querySelector('[data-tp-addm]').click();
ok(!root.querySelector('.tp-lm') && run('avisos.length') === nAvisos + 1 && run('avisos[avisos.length-1][1]') === 'err', 'sem medicação escolhida, "Adicionar" não grava (aviso)');
// medicação e dose em lista de escolha, com todas as opções sempre à vista (professor, 19/11/2026: "sempre aparecer todas as doses para preenchimento")
ok(am().querySelector('select[data-tp-am-n]').options.length === run('TP_MEDS.length') + 2 && am().querySelector('[data-tp-am-nt]').hidden, 'adicionar: todas as medicações, "Escolha…" e "Outra medicação…"');
setv(am().querySelector('[data-tp-am-n]'), 'Semaglutida SC', 'change');
ok([...am().querySelector('select[data-tp-am-d]').options].map((o) => o.textContent).join('|') === 'Escolha…|0,25 mg/sem|0,5 mg/sem|1 mg/sem|1,7 mg/sem|2,4 mg/sem|Outra dose…' && am().querySelector('[data-tp-am-d]').value === '0,25 mg/sem', 'adicionar: todas as doses da semaglutida SC, começando na inicial');
setv(am().querySelector('[data-tp-am-d]'), '__outra', 'change');
ok(!am().querySelector('[data-tp-am-dt]').hidden, 'adicionar: "Outra dose…" abre o campo para digitar');
setv(am().querySelector('[data-tp-am-dt]'), '0,75 mg/sem');
root.querySelector('[data-tp-addm]').click();
const m0 = J("ls['trajpeso_u1'].pac[0].meds[0]");
ok(m0 && m0.n === 'Semaglutida SC' && m0.dose === '0,75 mg/sem' && m0.ini === '2026-01-10' && m0.fim === '', '"Adicionar" grava medicação, dose digitada e início');
const lm = root.querySelector('.tp-lm');
const lm1 = () => root.querySelector('.tp-lm');
ok(lm1().querySelector('select[data-tp-msel="dose"]').value === '__outra' && lm1().querySelector('[data-tp-m="dose"]').value === '0,75 mg/sem' && !lm1().querySelector('[data-tp-m="dose"]').hidden, 'na lista, a dose digitada aparece como "Outra"');
ok([...lm1().querySelector('select[data-tp-msel="dose"]').options].length === 7, 'na lista: todas as doses da semaglutida SC');
setv(lm1().querySelector('select[data-tp-msel="dose"]'), '0,25 mg/sem', 'change');
setv(lm.querySelector('[data-tp-m="ini"]'), '2026-01-12');
// pré-preenchida pela pesagem e pela titulação (professor, 18/11/2026: "a próxima dose já ser cadastrada para essa data")
ok(am().querySelector('[data-tp-am-n]').value === 'Semaglutida SC' && am().querySelector('[data-tp-am-d]').value === '0,5 mg/sem' && am().querySelector('[data-tp-am-i]').value === '10/05/2026', 'próxima dose sugerida: a mesma medicação, a dose seguinte da titulação, na pesagem seguinte');
am().querySelector('[data-tp-am-i]').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
ok(J("ls['trajpeso_u1'].pac[0].meds.length") === 2 && J("ls['trajpeso_u1'].pac[0].meds[1].dose") === '0,5 mg/sem' && J("ls['trajpeso_u1'].pac[0].meds[1].ini") === '2026-05-10', 'Enter no início adiciona a dose sugerida');
ok(root.querySelectorAll('.tp-lm')[1].querySelector('[data-tp-m="n"]').value === 'Semaglutida SC' && root.querySelector('[data-tp-mres]').textContent === 'Semaglutida SC (2 doses) · ver e editar', 'lista com as duas doses, título com a contagem');
ok(am().querySelector('[data-tp-am-d]').value === '1 mg/sem', 'a linha já sugere a dose seguinte (1 mg)');
setv(am().querySelector('[data-tp-am-n]'), 'Tirzepatida', 'change');
ok(am().querySelector('[data-tp-am-d]').value === '2,5 mg/sem', 'trocar a medicação na linha: a dose começa na inicial dela');
setv(root.querySelector('[data-tp-pp="1"]'), '96');
ok(am().querySelector('[data-tp-am-n]').value === 'Tirzepatida', 'o que o médico escolheu na linha não é apagado pela sugestão');
const res = root.querySelector('[data-tp-res]');
ok(/Semaglutida SC/.test(res.textContent) && /−8,5 kg/.test(res.textContent) && /−8,1%/.test(res.textContent) && /obesidade grau I/.test(res.textContent), 'resumo: variação total, IMC atual e a medicação');
ok(/Aos 3 meses/.test(res.textContent) && /resposta \(perda ≥ 5%\)/.test(res.textContent), 'resposta aos 3 meses');
ok(res.classList.contains('tp-col-res') && root.querySelector('.tp > .tp-col-ent') && res.querySelectorAll('.tp-med .tp-med-grid .tp-med-st').length === 3, 'resultado em coluna própria; medicação em faixa com período, peso e 3 meses');
res.querySelector('[data-tp-modo="pct"]').click();
ok(!!res.querySelector('[data-tp-base]') && /variação do peso/.test(res.innerHTML), 'modo %: escolhe o ponto de partida');
const sb = res.querySelector('[data-tp-base]'); sb.value = 'semaglutida sc'; sb.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
ok(run('tpBase') === 'semaglutida sc' && /início de Semaglutida SC/.test(res.querySelector('[data-tp-base] option[selected]').textContent), 'modo %: a partir do início da medicação');
// tela cheia: clicar no gráfico abre a camada com o gráfico grande; × e Esc fecham
res.querySelector('.tp-graf[data-tp-cheia]').click();
let cheia = doc.querySelector('.tp-cheia');
ok(!!cheia && !!cheia.querySelector('[data-tp-cheia-g] svg') && cheia.getAttribute('role') === 'dialog' && /Trajetória do peso · AB/.test(cheia.textContent), 'clicar no gráfico abre a tela cheia com o gráfico');
cheia.querySelector('[data-tp-modo="kg"]').click();
ok(run('tpModo') === 'kg' && cheia.querySelector('[data-tp-modo="kg"]').getAttribute('aria-pressed') === 'true' && res.querySelector('[data-tp-modo="kg"]').getAttribute('aria-pressed') === 'true', 'tela cheia: troca a escala ali e no cartão');
cheia.querySelector('[data-tp-fecha]').click();
ok(!doc.querySelector('.tp-cheia') && doc.body.style.overflow === '', '× fecha a tela cheia e devolve a rolagem');
res.querySelector('.tp-graf[data-tp-cheia]').click();
doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
ok(!doc.querySelector('.tp-cheia'), 'Esc fecha a tela cheia');
// animação ao abrir (professor, 19/11/2026: "Deixa uma animação quando o gráfico abrir em tela cheia")
{
  const box = doc.createElement('div'); box.innerHTML = run("tpGraficoSVG(R,'kg',R.pts[0].t,900)"); doc.body.appendChild(box);
  const chamadas = [];
  dom.window.Element.prototype.animate = function (k, o) { chamadas.push({ el: this, k, o }); return {}; };
  box.querySelectorAll('polyline').forEach((pl) => { pl.getTotalLength = () => 500; });
  ctx.__box = box; run('tpAnimaGrafico(__box)');
  const linha = chamadas.filter((c) => c.el.tagName.toLowerCase() === 'polyline'), pts = chamadas.filter((c) => c.el.tagName.toLowerCase() === 'circle');
  const rot = chamadas.filter((c) => c.el.tagName.toLowerCase() !== 'polyline' && c.el.tagName.toLowerCase() !== 'circle');
  ok(linha.length === 1 && linha[0].k[0].strokeDashoffset === 500 && linha[0].k[1].strokeDashoffset === 0 && box.querySelector('polyline').style.strokeDasharray === '500 500', 'a curva se desenha da esquerda para a direita');
  const ds = pts.map((c) => c.o.delay);
  ok(pts.length === box.querySelectorAll('circle').length && ds.every((d, i) => i === 0 || d >= ds[i - 1]) && ds[ds.length - 1] > ds[0], 'cada ponto acende quando a linha passa (atraso cresce com a posição)');
  ok(rot.length >= 5 && rot.every((c) => c.o.delay >= Math.max(...ds) - 100), 'setas e números surgem no fim');
  chamadas.length = 0; dom.window.matchMedia = () => ({ matches: true });
  box.innerHTML = run("tpGraficoSVG(R,'kg',R.pts[0].t,900)"); run('tpAnimaGrafico(__box)');
  ok(chamadas.length === 0, 'com "reduzir movimento" no aparelho, sem animação');
  delete dom.window.matchMedia; delete dom.window.Element.prototype.animate; box.remove();
}
res.querySelector('[data-tp-modo="pct"]').click();
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
  ok(r3.querySelector('[data-tp-nd]').value === '10/04/2026' && r3.querySelector('.tp-add [data-tp-cal]').value === '2026-04-10', 'atalho "+2 meses" (professor, 19/11/2026), no campo e no calendário');
  r3.querySelector('[data-tp-dt="3"]').click();
  ok(r3.querySelector('[data-tp-nd]').value === '10/05/2026', 'atalho "+3 meses" conta do último peso');
  r3.querySelector('[data-tp-dt="0"]').click();
  ok(r3.querySelector('[data-tp-nd]').value === run('tpBR(tpHojeISO())'), 'atalho "hoje"');
  // Data digitada ou no calendário (professor, 21/11/2026: "deixa dentro do canto a opção de digitar manualmente e um
  // botão do calendáriozinho ao lado para inserir no calendário mesmo").
  ok(J("[tpDeBR('21/11/2026'),tpDeBR('21/11/26'),tpDeBR('21112026'),tpDeBR('2026-11-21'),tpDeBR('1/2/2026'),tpDeBR('31/02/2026'),tpDeBR('2026-02-31'),tpDeBR('21/13/2026'),tpDeBR('abc'),tpDeBR('')]").join('|') === '2026-11-21|2026-11-21|2026-11-21|2026-11-21|2026-02-01|||||', 'lê dd/mm/aaaa, dd/mm/aa, só dígitos e aaaa-mm-dd; recusa dia que não existe');
  ok(J("[tpMascaraData('2'),tpMascaraData('211'),tpMascaraData('21112'),tpMascaraData('21112026'),tpMascaraData('211120261')]").join('|') === '2|21/1|21/11/2|21/11/2026|21/11/2026', 'máscara: barras entram sozinhas, até 8 dígitos');
  // contêiner e conta próprios: o resto do r3 (colar lista, escalonamento) conta com os pesos dele
  const r9 = doc.createElement('div'); r9.id = 'calc9'; doc.body.appendChild(r9);
  run("currentUser={id:'u9',role:'admin'};tpRender(document.getElementById('calc9'))");
  setv(r9.querySelector('[data-tp-np]'), '90'); setv(r9.querySelector('[data-tp-nd]'), '10/02/2026', 'input'); r9.querySelector('[data-tp-addp]').click();
  const nd3 = r9.querySelector('[data-tp-nd]');
  ok(nd3.type === 'text' && nd3.getAttribute('inputmode') === 'numeric' && nd3.getAttribute('placeholder') === 'dd/mm/aaaa', 'campo de data digitável, com teclado numérico');
  const cal3 = r9.querySelector('.tp-add .tp-data [data-tp-cal]');
  ok(!!cal3 && cal3.type === 'date' && cal3.closest('.tp-cal') && /calendário/.test(cal3.getAttribute('aria-label')), 'botão de calendário ao lado, no mesmo campo');
  nd3.value = ''; nd3.setSelectionRange(0, 0);
  setv(nd3, '01032026');
  ok(nd3.value === '01/03/2026' && cal3.value === '2026-03-01', 'digitar só os números põe as barras e leva o calendário ao dia');
  setv(cal3, '2026-03-15', 'change');
  ok(nd3.value === '15/03/2026', 'escolher no calendário preenche o campo');
  setv(r9.querySelector('[data-tp-np]'), '87'); r9.querySelector('[data-tp-addp]').click();
  ok(J("ls['trajpeso_u9']").pac[0].pesos.some((x) => x.d === '2026-03-15' && x.p === '87'), 'peso entra na data escolhida no calendário');
  run('avisos.length=0');
  setv(nd3, '31/02/2026'); setv(r9.querySelector('[data-tp-np]'), '86'); r9.querySelector('[data-tp-addp]').click();
  ok(run('avisos.length') === 1 && /dd\/mm\/aaaa/.test(run('avisos[0][0]')) && !J("ls['trajpeso_u9']").pac[0].pesos.some((x) => x.p === '86'), 'data que não existe não entra (aviso)');
  // na lista: mudar a data de um peso digitando ou pelo calendário; data ruim volta à anterior
  const det3 = r9.querySelector('details[data-tp-det="pesos"]'); det3.open = true; det3.dispatchEvent(new dom.window.Event('toggle'));
  const pd0 = r9.querySelector('[data-tp-pd="0"]');
  ok(pd0 && pd0.type === 'text' && pd0.value === '10/02/26' && pd0.parentNode.querySelector('[data-tp-cal]').value === '2026-02-10', 'lista: data em dd/mm/aa (linha estreita), com o calendário ao lado');
  setv(pd0, '12/02/2026', 'change');
  ok(J("ls['trajpeso_u9']").pac[0].pesos[0].d === '2026-02-12', 'lista: data digitada grava');
  setv(r9.querySelector('[data-tp-pd="0"]').parentNode.querySelector('[data-tp-cal]'), '2026-02-14', 'change');
  ok(J("ls['trajpeso_u9']").pac[0].pesos[0].d === '2026-02-14' && r9.querySelector('[data-tp-pd="0"]').value === '14/02/26', 'lista: data do calendário grava');
  run('avisos.length=0');
  setv(r9.querySelector('[data-tp-pd="0"]'), '99/99', 'change');
  ok(J("ls['trajpeso_u9']").pac[0].pesos[0].d === '2026-02-14' && r9.querySelector('[data-tp-pd="0"]').value === '14/02/26' && run('avisos.length') === 1, 'lista: data inválida volta à anterior, com aviso');
  run("currentUser={id:'u3',role:'admin'}");
  // tela cheia no iPhone/iPad: sem a tela cheia do sistema, que punha um × cinza por cima do título (21/11/2026)
  ok(/iosFS=\/iPad\|iPhone\|iPod\|EndodirectApp\/\.test\(uaFS\)/.test(html) && /if\(!iosFS\)\{try\{if\(ov\.requestFullscreen\)/.test(html), 'tela cheia: no iPhone/iPad não pede a tela cheia do sistema');
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

// 4) COMPOSIÇÃO CORPORAL (professor, 19/11/2026: "adicionar de forma opcional ... a massa magra, a massa gorda, percentual de gordura")
{
  const C = (x, p) => J('tpComp(' + JSON.stringify(x) + ',' + p + ')');
  const c1 = C({ gp: '32' }, 85), c2 = C({ mg: '27,2' }, 85), c3 = C({ mm: '57,8' }, 85), c4 = C({ gp: '30', mm: '60' }, 85);
  ok(Math.abs(c1.mg - 27.2) < 1e-9 && Math.abs(c1.mm - 57.8) < 1e-9 && Math.abs(c2.gp - 32) < 1e-9 && Math.abs(c3.mg - 27.2) < 1e-9 && Math.abs(c3.gp - 32) < 1e-9, 'basta um dado: com o peso, os outros são calculados');
  ok(c4.mm === 60 && Math.abs(c4.mg - 25.5) < 1e-9 && C({ gp: '90' }, 85) === null && C({}, 85) === null, 'o digitado prevalece; valor absurdo ou vazio não conta');
  run(`var RC=tpAnalisa({alt:'168',pesos:[{d:'2026-01-01',p:'100',gp:'40'},{d:'2026-03-01',p:'94'},{d:'2026-06-01',p:'90',mg:'32',mm:'58'}],meds:[{n:'Semaglutida SC',dose:'0,25 mg/sem',ini:'2026-01-01'}]});`);
  ok(run('RC.comp.length') === 2 && Math.abs(run('tpCompResumo(RC).fMagra') - 20) < 1e-9, 'composição da perda: 2 kg de massa magra em 10 kg perdidos = 20%');
  const kp = run('tpKpisHTML(RC)');
  ok(/Gordura corporal/.test(kp) && /40,0 → 35,6%/.test(kp) && /Massa gorda/.test(kp) && /40,0 → 32,0 kg/.test(kp) && /Massa magra/.test(kp) && /60,0 → 58,0 kg/.test(kp) && /Composição da perda/.test(kp) && /20% <small>massa magra/.test(kp), 'quadros: % de gordura, massa gorda, massa magra e composição da perda');
  ok(/Composição/.test(run('tpModosHTML(RC)')) && !/Composição/.test(run("tpModosHTML(tpAnalisa({pesos:[{d:'2026-01-01',p:'100',gp:'40'},{d:'2026-02-01',p:'98'}],meds:[]}))")), 'escala "Composição" só com duas medidas ou mais');
  const sc = run("tpGraficoSVG(RC,'comp',RC.pts[0].t,900)");
  ok((sc.match(/<polyline /g) || []).length === 2 && /stroke="#fb923c"/.test(sc) && /stroke="#34d399"/.test(sc) && /massa gorda \(% de gordura\)/.test(sc) && /massa magra/.test(sc) && />40,0 kg \(40,0%\)</.test(sc) && />58,0 kg</.test(sc) && /massa \(kg\)/.test(sc), 'gráfico de composição: massa gorda (com %) e massa magra, com legenda');
  ok((sc.match(/class="tp-seta"/g) || []).length === 1 && !/tp-seta-p/.test(sc), 'na composição, a seta da medicação fica na curva da massa gorda, sem o peso ao lado');
  ok(/Composição corporal \(01\/01\/26 → 01\/06\/26\): gordura 40,0 → 35,6%; massa gorda 40,0 → 32,0 kg; massa magra 60,0 → 58,0 kg \(20% do peso perdido foi massa magra\)/.test(run('tpResumoTexto({alt:"168",pesos:[{d:"2026-01-01",p:"100",gp:"40"},{d:"2026-06-01",p:"90",mg:"32",mm:"58"}],meds:[]})')), 'resumo copiado com a composição');
  // número em cada medida do meio, não só na 1ª e na última (professor, 19/11/2026: "faltou os percentuais de gordura,
  // massa gorda e massa magra no meio do tratamento também")
  run(`var RC5=tpAnalisa({alt:'168',comp:true,pesos:[{d:'2025-11-10',p:'98',gp:'45',mg:'44',mm:'53'},{d:'2026-01-10',p:'90',mg:'38',mm:'52'},
    {d:'2026-03-10',p:'86',mg:'34',mm:'52'},{d:'2026-05-10',p:'84',mg:'31',mm:'53'},{d:'2026-07-10',p:'82',gp:'35',mg:'28',mm:'52'}],
    meds:[{n:'Tirzepatida',dose:'2,5 mg/sem',ini:'2025-11-10'},{n:'Tirzepatida',dose:'5 mg/sem',ini:'2026-01-10'},{n:'Semaglutida SC',dose:'1 mg/sem',ini:'2026-05-10'}]});`);
  for (const [larg, nome] of [[1900, 'tela cheia'], [900, 'computador']]) {
    const s5 = run(`tpGraficoSVG(RC5,'comp',RC5.pts[0].t,${larg})`);
    const meio = ['38,0 kg (42,2%)', '34,0 kg (39,5%)', '31,0 kg (36,9%)'].filter((t) => s5.indexOf('>' + t + '<') >= 0);
    const magra = (s5.match(/class="tp-comp-p"[^>]*>5[23],0 kg</g) || []).length;
    ok(meio.length === 3 && magra === 3, 'composição (' + nome + '): massa gorda com % e massa magra em cada medida do meio', meio.join(' | ') + ' · magra ' + magra);
  }
  const L = J("tpLerLista('05/04/26 82 31,5\\n15/06/2026 77,9')");
  ok(L.ok.length === 2 && L.ok[0].gp === '31,5' && !L.ok[1].gp, 'lista colada: 3º número é o % de gordura (opcional)');
  // tela
  const r4 = doc.createElement('div'); r4.id = 'calc4'; doc.body.appendChild(r4);
  run("currentUser={id:'u4',role:'admin'};tpRender(document.getElementById('calc4'))");
  ok(!r4.querySelector('[data-tp-nc]') && !!r4.querySelector('[data-tp-comp]'), 'composição desligada: só a caixa para ligar');
  const cb = r4.querySelector('[data-tp-comp]'); cb.checked = true; cb.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(r4.querySelectorAll('[data-tp-nc]').length === 3 && J("ls['trajpeso_u4'].pac[0].comp") === true, 'ligada: % de gordura, massa gorda e massa magra na linha de adicionar');
  setv(r4.querySelector('[data-tp-nd]'), '2026-01-01', 'change'); setv(r4.querySelector('[data-tp-np]'), '100'); setv(r4.querySelector('[data-tp-nc="gp"]'), '40');
  r4.querySelector('[data-tp-addp]').click();
  setv(r4.querySelector('[data-tp-nd]'), '2026-06-01', 'change'); setv(r4.querySelector('[data-tp-np]'), '90'); setv(r4.querySelector('[data-tp-nc="mm"]'), '58');
  r4.querySelector('[data-tp-addp]').click();
  ok(J("ls['trajpeso_u4'].pac[0].pesos").map((x) => (x.gp || '') + '/' + (x.mm || '')).join() === '40/,/58' && r4.querySelector('[data-tp-nc="gp"]').value === '', 'a composição vai junto com o peso e os campos se limpam');
  ok(r4.querySelector('[data-tp-pc="mg"][data-tp-pci="0"]').placeholder === '≈ 40,0 kg' && r4.querySelector('[data-tp-pc="gp"][data-tp-pci="1"]').placeholder === '≈ 35,6%', 'na lista, os valores calculados aparecem como sugestão');
  setv(r4.querySelector('[data-tp-pc="gp"][data-tp-pci="1"]'), '35');
  ok(J("ls['trajpeso_u4'].pac[0].pesos[1].gp") === '35' && r4.querySelector('[data-tp-pc="mg"][data-tp-pci="1"]').placeholder === '≈ 31,5 kg', 'editar na lista recalcula a sugestão');
  ok(/Massa magra/.test(r4.querySelector('[data-tp-res]').textContent) && !!r4.querySelector('[data-tp-modo="comp"]'), 'quadros e escala "Composição" na tela');
  r4.querySelector('[data-tp-modo="comp"]').click();
  ok(/massa gorda \(% de gordura\)/.test(r4.querySelector('.tp-graf').innerHTML), 'escala "Composição" desenha as duas massas');
  // tela cheia com os quadros embaixo (professor, 19/11/2026)
  r4.querySelector('.tp-graf[data-tp-cheia]').click();
  const ch = doc.querySelector('.tp-cheia');
  ok(!!ch && /Peso inicial → atual/.test(ch.querySelector('[data-tp-cheia-kpis]').textContent) && /Variação total/.test(ch.textContent) && /Menor peso/.test(ch.textContent) && /Massa magra/.test(ch.textContent), 'tela cheia: quadros do resumo embaixo do gráfico');
  ch.querySelector('[data-tp-fecha]').click();
  run("tpModo='kg'");
  // desligar esconde os campos, mas guarda os valores
  const cb2 = r4.querySelector('[data-tp-comp]'); cb2.checked = false; cb2.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(!r4.querySelector('[data-tp-nc]') && J("ls['trajpeso_u4'].pac[0].pesos[0].gp") === '40', 'desligar esconde os campos e guarda o que foi anotado');
  // privacidade (professor, 19/11/2026: "apenas o usuário vai ter acesso aos seus pacientes. Nenhum dos professores, nem
  // tampouco os demais alunos"): cada conta lê só a própria chave; nada vai para o servidor
  ok(/Só você vê estes pacientes/.test(r4.textContent) && /Professores e outros usuários não têm acesso/.test(r4.textContent), 'a tela diz que só o usuário vê os pacientes');
  const r5 = doc.createElement('div'); r5.id = 'calc5'; doc.body.appendChild(r5);
  run("currentUser={id:'u5',role:'admin'};tpRender(document.getElementById('calc5'))");
  // aparelho sem espaço: avisa uma vez (lsSet devolve false só para os dados que existem apenas no aparelho)
  run("var lsSetVelho=lsSet;lsSet=function(){return false;};avisos.length=0;tpGrava({pac:[]});tpGrava({pac:[]});lsSet=lsSetVelho;tpAvisoCheio=false;");
  ok(J('avisos').length === 1 && /Sem espaço neste aparelho/.test(J('avisos')[0][0]), 'sem espaço no aparelho: avisa (uma vez) que a alteração não foi salva');
  ok(!r5.querySelector('[data-tp-res] .tp-graf') && r5.querySelector('[data-tp-pac]').options.length === 1 && !/trajpeso_u4/.test(run('tpChave()')) && J("ls['trajpeso_u4'].pac.length") === 1, 'outra conta (mesmo professor) no mesmo aparelho não vê os pacientes de quem cadastrou');
  // HOMÔNIMOS (professor, 19/11/2026): mesmas iniciais não misturam dados; a lista diferencia, avisa e busca
  const r6 = doc.createElement('div'); r6.id = 'calc6'; doc.body.appendChild(r6);
  run("currentUser={id:'u6',role:'admin'};tpRender(document.getElementById('calc6'))");
  ok(/nº do prontuário/.test(r6.textContent) && r6.querySelector('[data-tp-campo="rot"]').placeholder === 'ex.: JMS 4821', 'identificação sugere iniciais ou nº do prontuário');
  setv(r6.querySelector('[data-tp-campo="rot"]'), 'JMS');
  setv(r6.querySelector('[data-tp-nd]'), '2026-05-05', 'change'); setv(r6.querySelector('[data-tp-np]'), '85'); r6.querySelector('[data-tp-addp]').click();
  r6.querySelector('[data-tp-novo]').click();
  setv(r6.querySelector('[data-tp-campo="rot"]'), 'j.m.s');
  setv(r6.querySelector('[data-tp-nd]'), '2025-02-12', 'change'); setv(r6.querySelector('[data-tp-np]'), '98'); r6.querySelector('[data-tp-addp]').click();
  const dup = r6.querySelector('[data-tp-dup]');
  ok(!dup.hidden && /Já existe um paciente "JMS" \(desde 05\/05\/26\)/.test(dup.textContent) && /nº do prontuário/.test(dup.textContent), 'mesma identificação (sem ligar para pontos e maiúsculas): avisa, com a data do outro');
  const ops = [...r6.querySelector('[data-tp-pac]').options].map((o) => o.textContent);
  ok(ops[0] === 'JMS · desde 05/05/26 · 85 kg' && ops[1] === 'j.m.s · desde 12/02/25 · 98 kg', 'lista diferencia pelos dados: desde quando e último peso');
  ok(J("ls['trajpeso_u6'].pac").map((x) => x.pesos[0].p).join() === '85,98' && J("ls['trajpeso_u6'].pac[0].id") !== J("ls['trajpeso_u6'].pac[1].id"), 'dados não se misturam: cada paciente tem id próprio');
  setv(r6.querySelector('[data-tp-campo="rot"]'), 'JMS 4821');
  ok(r6.querySelector('[data-tp-dup]').hidden, 'com o nº do prontuário, o aviso some');
  ok(!r6.querySelector('[data-tp-busca]'), 'com poucos pacientes, sem busca');
  ['AB', 'CD', 'EF', 'JMX'].forEach((rot) => { r6.querySelector('[data-tp-novo]').click(); setv(r6.querySelector('[data-tp-campo="rot"]'), rot); });
  r6.querySelector('[data-tp-novo]').click();
  const bus = r6.querySelector('[data-tp-busca]');
  ok(!!bus, 'com 6 pacientes ou mais, aparece a busca');
  setv(bus, 'jm');
  const res = [...r6.querySelectorAll('[data-tp-busca-res] [data-tp-ir]')].map((b) => b.textContent);
  ok(res.length === 3 && res[0].indexOf('JMS · desde') === 0 && res[1].indexOf('JMS 4821') === 0 && res[2] === 'JMX', 'busca por iniciais acha os parecidos');
  r6.querySelectorAll('[data-tp-busca-res] [data-tp-ir]')[1].click();
  ok(r6.querySelector('[data-tp-campo="rot"]').value === 'JMS 4821' && J("ls['trajpeso_u6'].atual") === J("ls['trajpeso_u6'].pac[1].id"), 'tocar no resultado abre o paciente');
  setv(r6.querySelector('[data-tp-busca]'), 'zz');
  ok(/Nenhum paciente com "zz"/.test(r6.querySelector('[data-tp-busca-res]').textContent), 'busca sem resultado avisa');
}

// 4) fiação e privacidade
ok(!/trajpeso|tpCarrega/.test(corpo('userStatePayload')), 'pacientes fora do app_state (não vão para o servidor)');
const iCalc = html.indexOf("  {id:'trajpeso',"), iImc = html.indexOf("  {id:'imc',name:'IMC'"), iPep = html.indexOf("  {id:'pep',");
ok(iImc > 0 && iImc < iCalc && iCalc < iPep, 'na lista, logo depois do IMC (Obesidade)');
ok(/\{id:'trajpeso',name:'Trajetória do peso no tratamento',area:'Obesidade',[\s\S]{0,800}render:function\(root\)\{tpRender\(root\);\}/.test(html), 'calculadora de tela própria em Obesidade');
// Publicada para os médicos (23/11/2026: "pode liberar também para o painel dos alunos, tendo a atenção especial de
// deixar apenas liberado para médicos, que são os prescritores, não liberar para alunos"). Foi piloto só do professor.
const entTxt = html.slice(iCalc, iPep);
ok(!/soProfessor:/.test(entTxt), 'publicada: não é mais piloto só do professor (sem soProfessor)');
{
  // as marcas reais da entrada, lidas do index.html
  const ent = { id: 'trajpeso', soProfessor: /soProfessor:true,/.test(entTxt), soMedico: /soMedico:true,/.test(entTxt), foraDoAppIos: /foraDoAppIos:true,/.test(entTxt) };
  const ctx2 = vm.createContext({ admin: false, perfil: '', APP_LOJA: '', ent });
  vm.runInContext('function isAdminUser(){return admin;}\n' + corpo('prescProfileOk').replace('userPerfil()', 'perfil') + '\n' + corpo('calcVisivel'), ctx2);
  const ve = (p, a, loja) => { ctx2.perfil = p; ctx2.admin = !!a; ctx2.APP_LOJA = loja || ''; return vm.runInContext('calcVisivel(ent)', ctx2); };
  ok(!ve('Estudante') && !ve('') && !ve('Estudante', false, 'ios'), '🧨 estudante e conta sem perfil NÃO veem (site e app do iPhone)');
  ok(ve('Residente') && ve('Endocrinologista') && ve('Outros') && ve('Endocrinologista', false, 'ios'), 'médicos (residente, endocrinologista, outros com CRM) veem, no site e no app');
  ok(ve('', true), 'o professor vê');
}
// Só profissionais de saúde (professor, 19/11/2026: "a calculadora deve ser liberada apenas para os profissionais de
// saúde. Usuários e estudantes não devem utilizar"): vale mesmo depois de tirar o soProfessor
ok(/soMedico:true,/.test(html.slice(iCalc, iPep)), 'marcada como só para profissionais de saúde (soMedico)');
{
  const ctx3 = vm.createContext({ admin: false, perfil: '', APP_LOJA: '' });
  vm.runInContext('function isAdminUser(){return admin;}\nfunction prescProfileOk(){return perfil===\'Residente\'||perfil===\'Endocrinologista\'||perfil===\'Outros\';}\n' + corpo('calcVisivel'), ctx3);
  ctx3.ent = { id: 'trajpeso', soMedico: true };
  const ve = (p, a) => { ctx3.perfil = p; ctx3.admin = !!a; return vm.runInContext('calcVisivel(ent)', ctx3); };
  ok(!ve('Estudante') && !ve('') && ve('Residente') && ve('Endocrinologista') && ve('Outros') && ve('', true), 'publicada: estudante e conta sem perfil não veem; residente, endocrinologista e outros médicos (com CRM) veem; professor vê');
  ok(/function prescProfileOk\(\)\{var pf=userPerfil\(\);return pf==='Residente'\|\|pf==='Endocrinologista'\|\|pf==='Outros';\}/.test(html), 'critério de profissional de saúde = o do Consultório (perfis com CRM)');
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
