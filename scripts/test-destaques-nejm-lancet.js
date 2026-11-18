// Regressão: destaques NEJM e Lancet no Dashboard (professor, 18/11/2026: "principais artigos publicados no
// dashboard do painel do aluno/professor (NEJM / Lancet)"). Os 5 artigos mais recentes do Mural vindos do NEJM,
// do The Lancet e do Lancet Diabetes & Endocrinology; tocar abre o artigo no Mural já filtrado.
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
const dom = new JSDOM('<body><div id="dash-destaques" style="display:none"></div><aside id="dash-rail"><div id="dash-destaques-rail"></div></aside><div id="mural-pc"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
const dia = 86400000, base = Date.UTC(2026, 10, 18);
vm.runInContext(`
  var ls={};function lsGet(k){return k in ls?ls[k]:null;}function lsSet(k,v){ls[k]=v;}
  var muralFilter='x',muralTipoFilter='y',muralPeriodicoFilter='z',muralPage=3,podeMural=true,abriu=[],refVisita=${base - 3 * dia};
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function canSeePanel(p){return p==='mural'&&podeMural;}
  function acervoRefVisita(){return refVisita;}
  function goPanel(p){abriu.push(p);if(p==='mural')document.getElementById('mural-pc').innerHTML=admAvisos.map(function(a){return '<article class="mural-card" data-mural-card><h3>'+esc(muralTitulo(a))+'</h3></article>';}).join('');}
  function muralDisplayType(a){return a.tipoTeste||'Artigo';}
  function normalizeMuralSource(f){return f;}
  function muralSubspecialty(a){return a.subespecialidade||'';}
  function muralPeriodicoKey(a){return String(a.fonte||'').toLowerCase().replace(/[^a-z]/g,'');}
  var admAvisos=[
    {fonte:'The New England Journal of Medicine',titulo:'Tirzepatide trial',titulo_pt:'Ensaio da tirzepatida <b>',at:${base - 1 * dia},subespecialidade:'Obesidade',sourceId:'a1'},
    {fonte:'The lancet. Diabetes & endocrinology',titulo:'Thyroid study',at:${base - 2 * dia},subespecialidade:'Tireoide',sourceId:'a2'},
    {fonte:'Lancet (London, England)',titulo:'Big trial',at:${base - 4 * dia},sourceId:'a3'},
    {fonte:'JAMA',titulo:'JAMA study',at:${base},sourceId:'a4'},
    {fonte:'The Lancet',titulo:'Comunicado',tipoTeste:'Comunicado',at:${base},sourceId:'a5'},
    {fonte:'The New England Journal of Medicine',titulo:'Tirzepatide trial',titulo_pt:'Ensaio da tirzepatida <b>',at:${base - 1 * dia},sourceId:'a1'},
    {fonte:'NEJM',titulo:'Old 1',at:${base - 10 * dia},sourceId:'a6'},
    {fonte:'NEJM',titulo:'Old 2',at:${base - 11 * dia},sourceId:'a7'},
    {fonte:'NEJM',titulo:'Old 3',at:${base - 12 * dia},sourceId:'a8'}
  ];
`, ctx);
['muralJournalRank', 'muralPeriodicoDisplay', 'muralNoticeKey', 'muralTitulo'].forEach((n) => vm.runInContext(corpo(n), ctx));
const i0 = html.indexOf('// ── DESTAQUES NEJM E LANCET NO DASHBOARD'), i1 = html.indexOf('function renderDashAvisos(){');
vm.runInContext(html.slice(i0, i1), ctx);
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

(async () => {
  const lista = JSON.parse(run('JSON.stringify(destaquesLista().map(function(a){return a.sourceId;}))'));
  ok(JSON.stringify(lista) === '["a1","a2","a3","a6","a7"]', 'os 5 mais recentes do NEJM e do Lancet, sem repetir, sem JAMA e sem comunicado: ' + JSON.stringify(lista));
  ok(run("destaquesRevista({fonte:'The New England Journal of Medicine'})") === 'NEJM' && run("destaquesRevista({fonte:'The lancet. Diabetes & endocrinology'})") === 'Lancet Diabetes & Endocrinology'
    && run("destaquesRevista({fonte:'Lancet (London, England)'})") === 'The Lancet', 'nome curto da revista');

  run('renderDashDestaques()');
  const el = doc.getElementById('dash-destaques');
  ok(el.style.display === '' && /Destaques: NEJM e Lancet/.test(el.textContent) && el.querySelectorAll('.dest-item').length === 5, 'cartão no Dashboard com 5 artigos');
  ok(/Ensaio da tirzepatida &lt;b&gt;/.test(el.innerHTML) && !/tirzepatida <b>/.test(el.innerHTML), 'título em português, escapado');
  ok(/NEJM/.test(el.querySelector('.dest-item').textContent) && /Obesidade/.test(el.querySelector('.dest-item').textContent), 'revista, data e subespecialidade no item');
  ok(el.querySelectorAll('.dav-novo').length === 2, 'artigos posteriores à última visita marcados como Novo');

  el.querySelector('[data-dest="1"]').click();
  ok(run("abriu[abriu.length-1]") === 'mural' && run('muralFilter') === 'Tireoide' && run('muralTipoFilter') === '' && run('muralPeriodicoFilter') === 'thelancetdiabetesendocrinology' && run('muralPage') === 0,
    'tocar abre o Mural filtrado na revista e na subespecialidade do artigo');
  await new Promise((r) => setTimeout(r, 400));
  const foco = doc.querySelector('.mural-card.dest-foco');
  ok(foco && foco.querySelector('h3').textContent === 'Thyroid study', 'o cartão do artigo fica em destaque no Mural');

  doc.getElementById('dash-dest-mural').click();
  ok(run("abriu[abriu.length-1]") === 'mural', '"Ver no Mural" abre o Mural');

  // trilho da direita (computador): recolhido, com contagem e prévia; aberto fica lembrado
  const rail = doc.getElementById('dash-destaques-rail');
  const det = rail.querySelector('details');
  ok(!!det && !det.open && /Destaques NEJM e Lancet/.test(rail.textContent) && rail.querySelector('.dest-rail-n').textContent === '5', 'trilho: destaques recolhidos, com a contagem');
  ok(/NEJM:<\/b> Ensaio da tirzepatida &lt;b&gt;/.test(rail.querySelector('.dest-rail-previa').innerHTML), 'trilho: prévia do artigo mais novo (escapada)');
  ok(rail.querySelectorAll('.dest-rail-item').length === 5 && !!rail.querySelector('[data-dest-mural]'), 'trilho: a lista curta e "Ver no Mural" ao abrir');
  det.open = true; det.dispatchEvent(new dom.window.Event('toggle'));
  ok(run('ls.dash_dest_aberto') === true, 'trilho: aberto fica lembrado no aparelho');
  run('renderDashDestaquesRail()');
  ok(doc.querySelector('#dash-destaques-rail details').open === true, 'trilho: volta aberto na próxima vez');
  rail.querySelector('[data-dest="2"]').click();
  ok(run("abriu[abriu.length-1]") === 'mural' && run('muralPeriodicoFilter') === 'lancetlondonengland', 'trilho: tocar abre o artigo no Mural');
  ok(/@media \(min-width:1081px\)\{\.dash-wrap:has\(#dash-destaques-rail:not\(:empty\)\) #dash-destaques\{display:none!important\}\}/.test(html)
    && /@media \(max-width:1080px\)\{#dash-destaques-rail\{display:none\}\}/.test(html), 'CSS: no computador só no trilho; no celular só no corpo');
  ok(/<div id="dash-destaques-rail"><\/div>';\n\s*try\{renderDashDestaquesRail\(\);\}catch\(e\)\{\}/.test(corpo('renderDashRail')), 'o trilho do aluno tem o lugar dos destaques');
  run('renderDashDestaques()');

  run('podeMural=false;renderDashDestaques()');
  ok(el.style.display === 'none' && el.innerHTML === '' && rail.innerHTML === '', 'sem acesso ao Mural: o cartão some (também do trilho)');
  run('podeMural=true;admAvisos=[{fonte:"JAMA",titulo:"x",at:1,sourceId:"q"}];renderDashDestaques()');
  ok(el.style.display === 'none', 'sem artigo do NEJM ou do Lancet: o cartão some');

  // fiação
  ok(/<div id="qotd-card" style="display:none;margin-bottom:10px"><\/div>\s*<div id="dash-destaques" style="display:none;margin-bottom:10px"><\/div>/.test(html), 'lugar do cartão no Dashboard (abaixo do Mural de avisos e da Questão do Dia)');
  ok(/try\{renderDashDestaques\(\);\}catch\(e\)\{\}/.test(corpo('refreshDash')), 'o Dashboard desenha os destaques');
  ok(/admAvisos=mergeRadarAvisos\([^\n]*\n\s*try\{renderDashDestaques\(\);\}catch\(e\)\{\}/.test(html), 'artigos novos do Mural atualizam os destaques');

  if (falhas.length) {
    console.error('✗ Destaques NEJM e Lancet:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Destaques NEJM e Lancet: os 5 artigos mais recentes no Dashboard, tocar abre no Mural já filtrado');
})().catch((e) => { console.error('✗ Destaques NEJM e Lancet: ' + (e && e.stack || e)); process.exit(1); });
