// Regressão: "Continuar de onde parou" (Dashboard) e grifos com nota nos Resumos, reunidos na
// aba Notas (pedido do professor, 17/11/2026). Os dois são pessoais e sincronizam entre aparelhos.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
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
const dom = new JSDOM('<body><div id="dash-continuar" style="display:none"></div><div id="resu-body"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
const salvo = { ls: {}, remoto: 0, persist: 0 };
ctx.__salvo = salvo;
vm.runInContext(`
  var DB={leitura:null,grifos:[]};
  var diretrizes=[
    {sub:'Tireoide',tema:'Hipotireoidismo',privado:true},
    {sub:'Tireoide',tema:'TRUST (2017)',privado:true,tipo:'artigo'},
    {sub:'Tireoide',tema:'Rascunho X',privado:true,rascunho:true}
  ];
  var refPrivadoMode=true,refSubSel='Tireoide',refTipoSel='capitulo',refTemaSel='Hipotireoidismo',refFormat='resumo',refRevArt=null,refVoltaCap=null,noteId=null;
  function lsSet(k,v){__salvo.ls[k]=JSON.parse(JSON.stringify(v));}
  function queueRemoteStateSave(){__salvo.remoto++;}
  function persist(){__salvo.persist++;}
  function notify(){}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dirIsRascunho(d){return !!(d&&d.rascunho);}
  function dirTipoOf(d){return (d&&d.tipo==='artigo')?'artigo':'capitulo';}
  function dirTemaOf(d){return d.tema;}
  function estSubDe(d){return String((d&&d.sub)||'Geral').trim()||'Geral';}
`, ctx);
const ini = html.indexOf('var leituraRestaurando=false');
ok(ini > 0, 'o bloco de leitura/grifos sumiu');
vm.runInContext(html.match(/var GRIFO_CORES=\[[^\n]*\];/)[0], ctx);
['leituraItem', 'leituraSalva', 'leituraPosDe', 'resuPosRender', 'renderDashContinuar', 'grifoCorOk', 'grifoClasse', 'grifoCapituloExiste', 'grifoCoresHTML', 'grifosLista', 'grifosDoCapitulo', 'grifoMarca', 'grifosAplicar',
  'grifosNotasItemHTML', 'grifosNotasHTML', 'grifoRemove', 'grifosNotasAtualiza'].forEach((n) => vm.runInContext(corpo(n), ctx));
vm.runInContext('var leituraRestaurando=false,leituraUltSalva=0,leituraUltRemota=0,grifoSel=null,grifosLigado=true;function grifosInit(){}function renderNoteList(){}function abrirLeitura(){}function offlineLigarBotoes(){}function offlineTrocaFiguras(){}function marcaAplicar(){}', ctx);
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

// 1) abrir um capítulo guarda o último lido; reabrir o MESMO mantém a posição
run('resuPosRender(document.getElementById("resu-body"))');
ok(run('DB.leitura.tema') === 'Hipotireoidismo' && run('DB.leitura.pos') === 0 && salvo.ls.leitura && salvo.remoto === 1, 'abrir o capítulo não guardou a leitura');
run('DB.leitura.pos=0.42;resuPosRender(document.getElementById("resu-body"))');
ok(run('DB.leitura.pos') === 0.42, 'reabrir o mesmo capítulo zerou a posição');
run('refTemaSel="TRUST (2017)";refTipoSel="artigo";resuPosRender(document.getElementById("resu-body"))');
ok(run('DB.leitura.tema') === 'TRUST (2017)' && run('DB.leitura.tipo') === 'artigo' && run('DB.leitura.pos') === 0, 'trocar de capítulo começa do zero');
run('refRevArt={idx:0};DB.leitura=null;resuPosRender(document.getElementById("resu-body"));refRevArt=null');
ok(run('DB.leitura') === null, 'a revisão rápida não é "capítulo lido"');

// 2) cartão do Dashboard
run('DB.leitura={sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo",pos:0.42,at:1};renderDashContinuar()');
let el = doc.getElementById('dash-continuar');
ok(el.style.display === '' && /Continuar de onde parou/.test(el.innerHTML) && /Hipotireoidismo/.test(el.innerHTML) && /42% lido/.test(el.innerHTML), 'o cartão não mostra o capítulo e o quanto foi lido: ' + el.innerHTML);
run('DB.leitura.pos=0.99;renderDashContinuar()');
ok(/lido até o fim/.test(el.innerHTML), 'capítulo terminado diz "lido até o fim"');
run('DB.leitura={sub:"Tireoide",tipo:"capitulo",tema:"Rascunho X",pos:0.1,at:1};renderDashContinuar()');
ok(el.style.display === 'none', 'capítulo que não está disponível (rascunho/sem acesso) não vira cartão');

// 3) grifo: reencontra o trecho mesmo atravessando negrito e quebra entre parágrafos
const box = doc.createElement('div');
box.className = 'dir-texto';
box.innerHTML = '<p>O TSH entre 4,5 e 10 mUI/L com <b>T4 livre normal</b> define o</p><p>hipotireoidismo subclínico.</p>';
doc.body.appendChild(box);
ok(run('grifoMarca(document.querySelector(".dir-texto"),"T4 livre normal define o\\n\\nhipotireoidismo","g1")') === true, 'não reencontrou o trecho que atravessa negrito e parágrafo');
const marks = box.querySelectorAll('mark.grifo[data-grifo="g1"]');
ok(marks.length >= 3 && [...marks].map((m) => m.textContent).join('').replace(/\s+/g, '') === 'T4livrenormaldefineohipotireoidismo', 'o grifo não embrulhou exatamente o trecho: ' + box.innerHTML);
ok(box.textContent === 'O TSH entre 4,5 e 10 mUI/L com T4 livre normal define ohipotireoidismo subclínico.', 'grifar alterou o texto do capítulo: ' + box.textContent);
ok(run('grifoMarca(document.querySelector(".dir-texto"),"trecho que não existe","g2")') === false, 'trecho inexistente não pode virar grifo');
// 4) remover desfaz a marca sem mexer no texto
run('DB.grifos=[{id:"g1",sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo",txt:"T4 livre normal",nota:"",at:2}];grifoRemove("g1")');
ok(!box.querySelector('mark.grifo') && run('DB.grifos.length') === 0 && box.textContent.indexOf('T4 livre normal') > 0, 'remover o grifo não desfez a marca');
// 5) aplicar ao abrir o capítulo
const card = doc.createElement('div'); card.className = 'dir-card';
card.innerHTML = '<div class="dir-texto"><p>Levotiroxina não melhorou sintomas em idosos.</p></div><div class="dir-pts"><ul><li>Desfecho primário negativo</li></ul></div>';
doc.getElementById('resu-body').appendChild(card);
run('refTemaSel="Hipotireoidismo";refTipoSel="capitulo";DB.grifos=[{id:"a",sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo",txt:"não melhorou sintomas",nota:"cai em prova",at:3},{id:"b",sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo",txt:"Desfecho primário negativo",nota:"",at:4},{id:"c",sub:"Tireoide",tipo:"capitulo",tema:"Outro",txt:"Levotiroxina",at:5}];grifosAplicar(document.getElementById("resu-body"))');
ok(card.querySelector('mark[data-grifo="a"]') && card.querySelector('.dir-pts mark[data-grifo="b"]') && !card.querySelector('mark[data-grifo="c"]'), 'ao abrir o capítulo, só os grifos DELE aparecem (texto e pontos-chave)');
// 6) aba Notas
ok(/🖍 Grifos \(Resumos e Diretrizes\)/.test(run('grifosNotasItemHTML()')) && /3 trechos marcados/.test(run('grifosNotasItemHTML()')), 'a lista de Notas não mostra a entrada dos grifos');
const gn = run('grifosNotasHTML()');
ok(/📖 Hipotireoidismo/.test(gn) && /📝 cai em prova/.test(gn) && /data-grifo-abre="a"/.test(gn) && /data-grifo-remove="b"/.test(gn) && (gn.match(/grifos-grupo"/g) || []).length === 2, 'os grifos na aba Notas não estão agrupados por capítulo com nota e ações: ' + gn.slice(0, 400));
// 7) CORES, SUBLINHADO E DIRETRIZES (27/11/2026)
ok(card.querySelector('mark[data-grifo="a"]').className === 'grifo g-amarelo', 'grifo antigo (sem cor) tem de continuar amarelo e grifado: ' + card.querySelector('mark[data-grifo="a"]').className);
ok(run('grifoClasse({cor:"vermelho",estilo:"sub"})') === 'g-vermelho g-sub' && run('grifoClasse({cor:"roxo"})') === 'g-amarelo' && run('grifoClasse(null)') === 'g-amarelo', 'classes de cor/estilo erradas (cor desconhecida volta ao amarelo)');
ok(run('GRIFO_CORES.map(function(c){return c[0];}).join(",")') === 'amarelo,verde,azul,rosa,vermelho', 'as 5 cores (amarelo, verde, azul, rosa, vermelho)');
const coresHTML = run('grifoCoresHTML("azul")');
ok((coresHTML.match(/data-grifo-cor="/g) || []).length === 5 && /data-grifo-cor="azul" aria-label="Azul" title="Azul" aria-pressed="true"/.test(coresHTML) && /data-grifo-cor="vermelho" aria-label="Vermelho" title="Vermelho" aria-pressed="false"/.test(coresHTML), 'botões de cor sem nome acessível ou sem a cor marcada');
// Diretrizes: só os grifos do painel certo
const ref = doc.createElement('div'); ref.id = 'ref-body'; doc.body.appendChild(ref);
const cardRef = doc.createElement('div'); cardRef.className = 'dir-card'; cardRef.innerHTML = '<div class="dir-texto"><p>Levotiroxina não melhorou sintomas em idosos.</p></div>'; ref.appendChild(cardRef);
run('DB.grifos.push({id:"d",sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo",txt:"Levotiroxina",cor:"verde",estilo:"sub",painel:"ref",at:6});refPrivadoMode=false;resuPosRender(document.getElementById("ref-body"))');
ok(cardRef.querySelector('mark[data-grifo="d"]') && cardRef.querySelector('mark[data-grifo="d"]').className === 'grifo g-verde g-sub' && !cardRef.querySelector('mark[data-grifo="a"]'), '🧨 nas Diretrizes têm de aparecer só os grifos das Diretrizes, com a cor e o sublinhado');
ok(!card.querySelector('mark[data-grifo="d"]') && run('grifosDoCapitulo("Tireoide","capitulo","Hipotireoidismo","resu").length') === 2, '🧨 grifo das Diretrizes não pode aparecer no Resumo do mesmo tema');
run('refPrivadoMode=true');
run('diretrizes.push({sub:"Tireoide",tema:"Hipotireoidismo",privado:false})');
ok(run('grifoCapituloExiste({painel:"ref",sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo"})') === true && run('grifoCapituloExiste({painel:"ref",sub:"Tireoide",tipo:"capitulo",tema:"Outro"})') === false
  && run('grifoCapituloExiste({sub:"Tireoide",tipo:"capitulo",tema:"Hipotireoidismo"})') === true, 'achar o capítulo do grifo (Resumos ou Diretrizes)');
const gn2 = run('grifosNotasHTML()');
ok(/📋 Hipotireoidismo<span>Tireoide · Diretrizes<\/span>/.test(gn2) && /<blockquote class="g-verde g-sub">Levotiroxina<\/blockquote>/.test(gn2), 'na aba Notas, o grifo das Diretrizes vem separado e com a cor');
// a barra e a janela
const barra = corpo('grifoBarra');
ok(/data-grifo-modo="grifo" aria-label="Grifar"/.test(barra) && /data-grifo-modo="sub" aria-label="Sublinhar"/.test(barra) && /grifoCoresHTML\(grifoPref\(\)\.cor\)/.test(barra), '🧨 a barra da seleção tem de oferecer grifar/sublinhar e as cores');
ok(/if\(cr\)\{var p1=grifoPref\(\);grifoPrefSalva\(cr\.getAttribute\('data-grifo-cor'\),p1\.estilo\);grifoBarraPinta\(b\);grifoCria\(false\);return;\}/.test(barra), '🧨 tocar numa cor marca o trecho com ela (e lembra a escolha)');
ok(/cor:pf\.cor,estilo:pf\.estilo,painel:s\.painel==='ref'\?'ref':'resu'/.test(corpo('grifoCria')), 'o grifo novo guarda cor, estilo e painel');
ok(/var painel=refPrivadoMode\?'resu':'ref';/.test(corpo('grifoSelecao')) && /document\.getElementById\(painel==='resu'\?'resu-body':'ref-body'\)/.test(corpo('grifoSelecao')), '🧨 selecionar texto nas Diretrizes também oferece grifar');
ok(/data-grifo-modo="sub" aria-pressed=/.test(corpo('grifoModal')) && /grifoRepinta\(g\)/.test(corpo('grifoModal')), 'a janela do grifo troca a cor e o estilo de um grifo que já existe');
ok(/:root mark\.grifo\.g-sub,:root\[data-theme\] mark\.grifo\.g-sub\{background:transparent;/.test(html) && /mark\.grifo\.g-vermelho\{--gc:248,113,113\}/.test(html) && /:root\[data-theme="dark"\] mark\.grifo\{background:rgba\(var\(--gc\),\.3\)\}/.test(html),
  '🧨 CSS: cores via --gc (o tema escuro não pode forçar o amarelo) e o sublinhado sem fundo');
run('DB.grifos=[]');
ok(run('grifosNotasItemHTML()') === '', 'sem grifos, nada na lista de Notas');

// 7) sincronização e ligações (estático)
ok(/var PERSONAL_STATE_KEYS=\[[^\]]*'leitura','grifos'[^\]]*\];/.test(html), 'leitura e grifos têm de ser chaves PESSOAIS');
ok(/var p=\{q:DB\.q,fc:DB\.fc,mm:DB\.mm,notes:DB\.notes,leitura:DB\.leitura,grifos:DB\.grifos,/.test(html), 'leitura e grifos não vão para o servidor (userStatePayload)');
ok(/lsSet\('leitura',DB\.leitura\);lsSet\('grifos',DB\.grifos\);/.test(corpo('persist')), 'leitura e grifos não ficam no aparelho (persist)');
ok(/if\(Array\.isArray\(payload\.grifos\)\)DB\.grifos=payload\.grifos;/.test(html) && /payload\.leitura\.at\|\|0\)>=\(DB\.leitura\.at\|\|0\)\)\)DB\.leitura=payload\.leitura;/.test(html), 'o estado do servidor não aplica grifos/leitura (a leitura mais recente vence)');
ok(/DB\.leitura=null;DB\.grifos=\[\];/.test(html), 'sair da conta não limpa leitura e grifos');
ok(/resuPosRender\(root\)/.test(corpo('bindDiretrizesView')), 'desenhar os Resumos não chama resuPosRender');
ok(/id="dash-continuar"/.test(html) && /renderDashContinuar\(\)/.test(corpo('refreshDash')) && /renderDashContinuar\(\)/.test(corpo('aplicarResumos')), 'o cartão do Dashboard não é desenhado (Dashboard e chegada dos Resumos)');
ok(/data-note-grifos/.test(html) && /grifosNotasAbre\(\)/.test(html), 'a entrada dos grifos na aba Notas não abre a lista');
ok(/selectionchange/.test(corpo('grifosInit')) && /mark\.grifo/.test(corpo('grifosInit')) && /'scroll',leituraNoScroll/.test(corpo('grifosInit')), 'faltam os eventos (seleção, toque no grifo, rolagem)');
ok(/!x\.closest\('\.wys-edit'\)/.test(corpo('grifoSelecao')), 'grifar nunca pode ligar no editor do professor');

if (falhas.length) {
  console.error('✗ continuar de onde parou e grifos:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ continuar de onde parou (Dashboard) e grifos com nota nos Resumos, reunidos na aba Notas e sincronizados');
