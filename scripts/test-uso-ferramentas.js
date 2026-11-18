// Regressão: uso das ferramentas (professor, 18/11/2026: "mapear o que os alunos estão usando de ferramentas
// da plataforma"). Cada tela aberta, aba de capítulo dos Resumos, videoaula iniciada e a Busca somam 1 no dia,
// no servidor (supabase/uso-ferramentas.sql, testado no banco numa transação desfeita); o professor vê o
// resumo em Analytics (7 ou 30 dias) e o retrato do que já estava registrado.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(raiz, 'supabase', 'uso-ferramentas.sql'), 'utf8');
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

// 1) servidor
ok(!/delete/i.test(sql), 'o SQL não pode ter a palavra DELETE (o conector do Supabase recusa)');
ok(/p_item !~ '\^\[a-z0-9_\]\{2,24\}\$'/.test(sql), 'servidor: só aceita nome de item simples');
ok(/at time zone 'America\/Sao_Paulo'/.test(sql) && /- 120/.test(sql), 'servidor: dia de Brasília e 120 dias guardados');
ok(/device_id = '#uso'/.test(sql) && /values \(v_uid, '#uso'/.test(sql), 'servidor: guarda na linha #uso do aluno (some com a conta)');
ok(/raise exception 'forbidden'/.test(sql.slice(sql.indexOf('function public.endodirect_uso_admin('))), 'servidor: resumo só para o professor');
ok(/not public\.endodirect_email_de_teste\(au\.email\)/.test(sql) && /not public\.endodirect_email_de_teste\(s\.email\)/.test(sql), 'servidor: contas de teste fora do resumo');
ok(/coalesce\(x\.provider, ''\) <> 'manual'/.test(sql), 'servidor: assinante = pagante (cortesia fora), como no painel dos Estudantes');

// 2) registro no app
const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="panel-cursos"><video id="v1"></video></div><div class="dir-video"><video id="v2"></video></div><video id="v3"></video><div id="adm-main"><div class="adm-pc"></div></div></body>',
  { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var currentUser={id:'u1',role:'aluno'},chamadas=[],agora=1000000,admCurrentSec='analytics';
  Date.now=function(){return agora;};
  var PANEL_LABELS={quest:'Banco de questões',chat:'Chat IA',calc:'Calculadoras'};
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var respostas={};
  function getSupabaseClient(){return {rpc:function(n,a){chamadas.push([n,a]);return Promise.resolve(respostas[n]||{data:null});}};}
`, ctx);
const ini = html.indexOf('// ── USO DAS FERRAMENTAS (18/11/2026)');
const fim = html.indexOf('function assineBRL(n){');
vm.runInContext(html.slice(ini, fim), ctx);
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

run("usoRegistrar('quest');usoRegistrar('quest');");
ok(run('chamadas.length') === 1 && run("chamadas[0][0]==='endodirect_uso_registrar'&&chamadas[0][1].p_item==='quest'"), 'registra a ferramenta uma vez (a 2ª em seguida não sai)');
run('agora+=600001;usoRegistrar("quest")');
ok(run('chamadas.length') === 2, 'depois de 10 min, a mesma ferramenta volta a contar');
run("usoRegistrar('Chat');usoRegistrar('x;drop');usoRegistrar('');");
ok(run('chamadas.length') === 3 && run("chamadas[2][1].p_item==='chat'"), 'nome em minúsculas; nome inválido não sai');
run("currentUser.role='admin';usoRegistrar('calc');currentUser=null;usoRegistrar('calc');currentUser={id:'u1',role:'aluno'}");
ok(run('chamadas.length') === 3, 'professor e visitante não contam');
doc.getElementById('v1').dispatchEvent(new dom.window.Event('play'));
doc.getElementById('v2').dispatchEvent(new dom.window.Event('play'));
doc.getElementById('v3').dispatchEvent(new dom.window.Event('play'));
ok(run("chamadas.slice(3).map(function(c){return c[1].p_item;}).join()") === 'video_curso,video_resumo', 'videoaula iniciada: dos cursos e dos Resumos (outro vídeo não conta)');
ok(run("usoRotulo('trava_chat')") === '🔒 Chat IA (sem acesso)' && run("usoRotulo('resu_mapa')") === 'Resumos: mapa mental do capítulo' && run("usoRotulo('quest')") === 'Banco de questões', 'rótulos legíveis no painel');

// 3) painel
(async () => {
  ok(/Carregando/.test(run('admUsoHTML()')), 'painel: carregando');
  run(`admUsoData[30]={dias:30,desde:'2026-11-18',alunos:3,pagantes:2,itens:[{item:'quest',alunos:3,pagantes:2,aberturas:9,dias_uso:4},{item:'<x>',alunos:1,pagantes:0,aberturas:1}],
    retrato:{pagantes:51,degustacao:110,itens:[{item:'quest',pagantes:45,degustacao:42},{item:'flash',pagantes:11,degustacao:1}]}}`);
  let h = run('admUsoHTML()');
  ok(/últimos 30 dias \(contagem desde 18\/11\)/.test(h) && /<b>3<\/b> alunos usaram a plataforma, <b>2<\/b> assinantes/.test(h), 'painel: período, desde quando e quantos usaram');
  ok(/Banco de questões<\/span>/.test(h) && /3 alunos · 2 assin\. · 9 aberturas/.test(h), 'painel: linha por ferramenta');
  ok(/&lt;x&gt;/.test(h) && !/<x>/.test(h), 'painel: nome escapado');
  ok(/Retrato do que já estava registrado/.test(h) && /Flashcards \(revisou cartões\)/.test(h) && />11</.test(h) && /de 51 assinantes e 110 na degustação/.test(h), 'painel: retrato do que já estava registrado');
  ok(/data-uso-dias="7"/.test(h) && /data-uso-dias="30"/.test(h), 'painel: 7 ou 30 dias');
  run('admUsoData[30].itens=[]');
  ok(/Ainda sem registros no período/.test(run('admUsoHTML()')), 'painel: sem registros ainda');
  run('admUsoInserir(document.getElementById("adm-main"))');
  ok(!!doc.querySelector('#adm-main .adm-pc > #adm-uso'), 'painel: cartão no topo do Analytics');
  run("respostas.endodirect_uso_admin={data:{dias:7,alunos:0,pagantes:0,itens:[]}};chamadas.length=0");
  doc.querySelector('[data-uso-dias="7"]').click();
  await new Promise((r) => setTimeout(r, 0));
  ok(run("chamadas[0]&&chamadas[0][0]==='endodirect_uso_admin'&&chamadas[0][1].p_dias===7") && run('admUsoDias') === 7 && /últimos 7 dias/.test(doc.getElementById('adm-uso').innerHTML), 'painel: trocar para 7 dias busca e redesenha');

  // 4) fiação
  const gp = corpo('goPanel');
  ok(/if\(!canSeePanel\(id\)\)\{try\{usoRegistrar\('trava_'\+id\);\}catch\(e\)\{\}showLockedPanel\(id\);return;\}/.test(gp), 'goPanel: tentativa de abrir sem acesso conta como "trava_"');
  ok(/var menuAlvo=id;\n\s*try\{usoRegistrar\(menuAlvo\);\}catch\(e\)\{\}/.test(gp), 'goPanel: toda tela aberta conta');
  ok(/usoRegistrar\(refTipoSel==='artigo'\?'resu_artigo':'resu_'\+refFormat\)/.test(corpo('resuPosRender')), 'Resumos: aba do capítulo (texto, flashcards, mapa, vídeo) ou artigo');
  ok(/usoRegistrar\('busca'\)/.test(corpo('abrirBusca')), 'Busca conta');
  ok(/m\.innerHTML=admAnalyticsHTML\(\);admUsoInserir\(m\);carregaAdmUso\(admUsoRedesenha\);/.test(html), 'Analytics: cartão de uso carregado');

  if (falhas.length) {
    console.error('✗ Uso das ferramentas:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Uso das ferramentas: cada tela, aba de capítulo, vídeo e busca contam (1 a cada 10 min), só aluno; Analytics mostra 7/30 dias e o retrato do que já existia');
})().catch((e) => { console.error('✗ Uso das ferramentas: ' + (e && e.stack || e)); process.exit(1); });
