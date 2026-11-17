// Regressão: Resumos sem internet (pedido do professor, 17/11/2026: "Resumos sem internet no app.
// Baixar uma subespecialidade para ler offline"). O aluno baixa uma área (texto + figuras no IndexedDB);
// sem rede, o app usa a cópia (inclusive com o token vencido); no "Sair" ela some; no app do iPhone 1.3 a
// cópia vai também para arquivos que a tela "Sem conexão" (app-ios/www/erro.html) lê.
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
const dom = new JSDOM('<body><div id="resu-body"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var OFF_VALIDADE_MS=30*86400000,offlineIdx={},offlineFigSet={},offlineFigURL={},offlineUsando=false,offlineSessao=false,offlineBaixando=null;
  var currentUser={id:'u1',email:'a@b.c'},userAcessos=['plano'],refPrivadoMode=true,refFormat='resumo',resumosErro=true,buscaCache={x:1};
  var redesenhou=0,continuar=0,logins=[];
  var diretrizes=[
    {sub:'Tireoide',tema:'Hipotireoidismo',privado:true,resumo:'Texto ![Eixo [TSH\\\\]](https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/fig/eixo%20tsh.png) e ![dado](data:image/png;base64,AAAA)',figuras:[{url:'https://www.endodirect.com.br/figuras/a.jpg'},{svg:'<svg></svg>'}]},
    {sub:'Tireoide',tema:'TRUST (2017)',privado:true,tipo:'artigo',resumo:'sem figura',figuras:[{url:'https://www.endodirect.com.br/figuras/a.jpg'}]},
    {sub:'Tireoide',tema:'Rascunho',privado:true,rascunho:true,resumo:'![x](https://x.y/z.png)'},
    {sub:'Tireoide',tema:'Só vídeo',privado:true,so_video:true},
    {sub:'Tireoide',tema:'Diretriz pública',privado:false},
    {sub:'Adrenal',tema:'Feocromocitoma',privado:true}
  ];
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dirIsRascunho(d){return !!(d&&d.rascunho);}
  function estSubDe(d){return String((d&&d.sub)||'Geral').trim()||'Geral';}
  function isDegustacao(){return !userAcessos.length;}
  function contaAtual(){return currentUser&&currentUser.id||null;}
  function mesmaContaQue(u){return contaAtual()===u;}
  function offlineDisponivel(){return true;}
  function offlineRedesenha(){redesenhou++;}
  function renderDashContinuar(){continuar++;}
  function loginFromSupabaseSession(s){logins.push(s.user.id);}
  function isPasswordRecoveryUrl(){return false;}
  var dirCardHTMLsaida='';
  function dirCardHTML(d,i){return dirCardHTMLsaida;}
`, ctx);
['offlineNormUrl', 'offlinePodeBaixar', 'offlineItensDaSub', 'offlineFigurasDe', 'offlineData', 'offlineProgTxt', 'offlineBarraHTML', 'offlineAvisoHTML',
  'offlineAplicar', 'offlineSessaoGuardada', 'offlineNomeFig', 'offlineHTMLNativo', 'offlineB64', 'offlineSemRede'].forEach((n) => vm.runInContext(corpo(n), ctx));
const run = (c) => vm.runInContext(c, ctx);
const J = (c) => JSON.parse(run('JSON.stringify(' + c + ')'));

// 1) o que vai para o aparelho: só capítulos e artigos publicados da área
ok(JSON.stringify(J('offlineItensDaSub("Tireoide").map(function(d){return d.tema;})')) === '["Hipotireoidismo","TRUST (2017)"]', 'itens da área: sem rascunho, sem vídeo solto, sem diretriz pública, sem outra área');
// 2) figuras: lista + texto, sem repetição, sem data:, endereço normalizado (o mesmo que o <img> resolve)
const figs = J('offlineFigurasDe(offlineItensDaSub("Tireoide"))');
ok(figs.length === 2 && figs.indexOf('https://www.endodirect.com.br/figuras/a.jpg') >= 0 && figs.some((u) => /eixo%20tsh\.png$/.test(u)), 'figuras do item (lista e ![…](…) com ] na legenda), uma vez cada: ' + JSON.stringify(figs));
// 3) faixa da área
let b = run('offlineBarraHTML("Tireoide")');
ok(/data-off-baixar="Tireoide"/.test(b) && /📥 Baixar/.test(b), 'área não baixada: botão Baixar');
run('offlineBaixando={sub:"Tireoide",feito:3,total:10}');
b = run('offlineBarraHTML("Tireoide")');
ok(/Baixando Tireoide/.test(b) && /3 de 10 figuras/.test(b) && /id="off-prog"/.test(b), 'baixando: progresso');
ok(/data-off-baixar="Adrenal"[^>]*disabled/.test(run('offlineBarraHTML("Adrenal")')), 'outra área fica desligada enquanto uma baixa');
run('offlineBaixando=null;offlineIdx={Tireoide:{at:new Date(2026,10,17).getTime(),n:2,figs:2}}');
b = run('offlineBarraHTML("Tireoide")');
ok(/Disponível sem internet/.test(b) && /17\/11/.test(b) && /data-off-remover="Tireoide"/.test(b), 'baixada: data e Remover');
run('userAcessos=[]');
ok(run('offlineBarraHTML("Tireoide")') === '', 'degustação não baixa');
run('userAcessos=["plano"];refPrivadoMode=false');
ok(run('offlineBarraHTML("Tireoide")') === '', 'só nos Resumos (não nas Diretrizes)');
run('refPrivadoMode=true');
ok(run('offlineAvisoHTML()') === '', 'com internet, sem aviso');

// 4) sem internet: a cópia entra no lugar dos Resumos (só as válidas, só se o servidor não mandou nada)
const agora = Date.now();
run(`offlineIdx={};var registros=[];function offlineCarregarIndice(uid){return Promise.resolve(registros.filter(function(r){return r.uid===uid;}));}`);
run(`registros=[{uid:'u1',sub:'Tireoide',at:${agora},itens:[{sub:'Tireoide',tema:'Hipotireoidismo',privado:true}]},
  {uid:'u1',sub:'Adrenal',at:${agora - 31 * 86400000},itens:[{sub:'Adrenal',tema:'Velho',privado:true}]},
  {uid:'u2',sub:'Diabetes',at:${agora},itens:[{sub:'Diabetes',tema:'De outra conta',privado:true}]}];
  diretrizes=[{sub:'Tireoide',tema:'Diretriz pública',privado:false}];`);
(async () => {
  let r = await run('offlineAplicar("u1")');
  ok(r === true && run('offlineUsando') === true && run('resumosErro') === false && run('buscaCache') === null, 'sem rede: a cópia entra, o erro sai e a busca reindexa');
  ok(JSON.stringify(J('diretrizes.map(function(d){return d.tema;})')) === '["Diretriz pública","Hipotireoidismo"]', 'só a área válida da PRÓPRIA conta (30 dias); a pública fica: ' + JSON.stringify(J('diretrizes.map(function(d){return d.tema;})')));
  ok(run('redesenhou') >= 1 && run('continuar') === 1, 'a tela e o "Continuar de onde parou" são redesenhados');
  ok(/Sem internet/.test(run('offlineAvisoHTML()')), 'aviso de sem internet na grade');
  run('offlineIdx={Tireoide:{at:Date.now(),n:1,figs:0}}');
  ok(/Disponível sem internet/.test(run('offlineBarraHTML("Tireoide")')) && !/data-off-remover/.test(run('offlineBarraHTML("Tireoide")')), 'sem internet não oferece Remover');
  run('offlineUsando=false;diretrizes=[{sub:"Tireoide",tema:"Do servidor",privado:true}]');
  r = await run('offlineAplicar("u1")');
  ok(r === false && J('diretrizes.map(function(d){return d.tema;})')[0] === 'Do servidor', 'Resumos do servidor já na tela (a rede caiu depois): a cópia não os substitui');
  run('diretrizes=[]');
  ok((await run('offlineAplicar("u2")')) === false || run('contaAtual()') !== 'u2', 'cópia de outra conta não entra');

  // 5) entrar sem internet com o token vencido: a sessão guardada pelo Supabase
  dom.window.localStorage.setItem('sb-auth-auth-token', JSON.stringify({ access_token: 'x', expires_at: 1, user: { id: 'u9', email: 'z@y.x' } }));
  dom.window.localStorage.setItem('sb-auth-auth-token-code-verifier', '"abc"');
  ok(run('offlineSessaoGuardada().user.id') === 'u9', 'lê a sessão guardada do Supabase (e só a chave -auth-token)');

  // 6) app do iPhone: capítulo já desenhado, sem botões, figura guardada vira arquivo local
  run(`offlineFigSet={'https://www.endodirect.com.br/figuras/a.jpg':true};
    dirCardHTMLsaida='<div class="dir-card"><span><button class="fav">☆</button></span><div class="dir-texto"><p>Texto</p><img src="https://www.endodirect.com.br/figuras/a.jpg" onerror="x()"><img src="https://outro.site/b.png"><img src="data:image/png;base64,AAAA"></div><button data-x>Mapa</button></div>'`);
  const precisa = {};
  ctx.__precisa = precisa;
  const h = run('offlineHTMLNativo({sub:"Tireoide",tema:"Hipotireoidismo"},__precisa)');
  const nome = run('offlineNomeFig("https://www.endodirect.com.br/figuras/a.jpg")');
  ok(!/<button/.test(h) && /<p>Texto<\/p>/.test(h), 'o capítulo do pacote não leva botões (a tela sem conexão só lê)');
  ok(new RegExp('<img data-off="' + nome.replace('.', '\\.') + '">').test(h) && precisa[nome] === 'https://www.endodirect.com.br/figuras/a.jpg', 'figura guardada vira data-off (arquivo local) e entra na lista a gravar: ' + h);
  ok(!/outro\.site/.test(h) && /src="data:image\/png;base64,AAAA"/.test(h), 'figura não guardada sai; a embutida (data:) fica');
  ok(/\.jpg$/.test(nome) && nome === run('offlineNomeFig("https://www.endodirect.com.br/figuras/a.jpg")') && nome !== run('offlineNomeFig("https://www.endodirect.com.br/figuras/b.jpg")'), 'nome do arquivo estável, com a extensão');
  ok(run('offlineB64(new Uint8Array([104,105]).buffer)') === 'aGk=', 'bytes → base64 para o Filesystem');
  ok(run('refFormat') === 'resumo' && run('refPrivadoMode') === true, 'desenhar o pacote não muda a tela');

  // 7) ligações (estático)
  ok(/console\.warn\('Resumos indisponíveis',e\);\n\s*try\{offlineAplicar\(uid\);\}/.test(html), 'a falha da carga dos Resumos não cai na cópia do aparelho');
  ok(/offlineUsando=false;[^\n]*\n\s*try\{offlineAgendarSinc\(\);\}/.test(corpo('aplicarResumos')), 'chegada dos Resumos do servidor: tira a cópia da tela e atualiza as áreas baixadas');
  ok(/payload\.diretrizes\)\)\{diretrizes=payload\.diretrizes;offlineUsando=false;/.test(html), 'professor: o estado global também tira a cópia da tela');
  ok(/offlineAoEntrar\(currentUser\.id\)/.test(corpo('hydrateRemoteState')), 'ao entrar, carrega o índice (e a cópia, sem rede)');
  ok(/offlineEntrarSemRede\(\)/.test(corpo('startSupabaseAuthWatcher')), 'sem rede e com token vencido o app não entra');
  ok(/if\(!travarFaceId\)\{try\{offlineLimparTudo\(\);\}/.test(corpo('doLogout')), '"Sair" tem de apagar a cópia (menos o Face ID, que só trava)');
  ok(/offlineLigarBotoes\(root\);offlineTrocaFiguras\(root\);/.test(corpo('resuPosRender')), 'a tela dos Resumos não liga os botões nem troca as figuras');
  ok(/head2\+\(_deg1\?'':offlineBarraHTML\(refSubSel\)\)/.test(corpo('diretrizesViewHTML')) && /offlineAvisoHTML\(\)/.test(corpo('diretrizesViewHTML')), 'faixa da área ou aviso sem internet fora da tela');
  ok(/addEventListener\('online',offlineReconectou\)/.test(html) && /doLogout\(\)/.test(corpo('offlineReconectou')), 'a volta da rede não recarrega (ou não encerra a sessão recusada)');
  ok(/r\.ok\|\|!\/\^image\\\/\/i\.test|!\/\^image\\\/\/i\.test\(x\.tipo\)/.test(corpo('offlineBaixarFiguras')) && /credentials:'omit'/.test(corpo('offlineBaixarFiguras')), 'só guarda imagem, sem credenciais');
  // service worker: só a supabase-js cruza a origem
  const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
  ok(/url\.hostname === 'cdn\.jsdelivr\.net' && url\.pathname\.indexOf\('\/npm\/@supabase\/supabase-js'\) === 0/.test(sw) && /return;\s+\/\/ demais cross-origin: não intercepta/.test(sw), 'sw.js: a biblioteca de login precisa ficar guardada (e nada mais de fora)');
  // app do iPhone 1.3
  const IOS = path.join(raiz, 'app-ios');
  const pkg = JSON.parse(fs.readFileSync(path.join(IOS, 'package.json'), 'utf8'));
  ok(/^8\./.test(pkg.dependencies['@capacitor/filesystem'] || ''), 'app: falta o plugin @capacitor/filesystem 8');
  ok(/\.product\(name: "CapacitorFilesystem", package: "CapacitorFilesystem"\)/.test(fs.readFileSync(path.join(IOS, 'ios', 'App', 'CapApp-SPM', 'Package.swift'), 'utf8')), 'app: Filesystem fora do Package.swift');
  const priv = fs.readFileSync(path.join(IOS, 'ios', 'App', 'App', 'PrivacyInfo.xcprivacy'), 'utf8');
  const pbx = fs.readFileSync(path.join(IOS, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'), 'utf8');
  ok(/NSPrivacyAccessedAPICategoryFileTimestamp<\/string>\s*<key>NSPrivacyAccessedAPITypeReasons<\/key>\s*<array>\s*<string>C617\.1<\/string>/.test(priv) && /PrivacyInfo\.xcprivacy in Resources \*\/,/.test(pbx), 'app: manifesto de privacidade (datas de arquivo, C617.1) fora do app; a Apple recusa o envio');
  const erro = fs.readFileSync(path.join(IOS, 'www', 'erro.html'), 'utf8');
  ok(/readFile\(\{ path: 'offline\/leitor\.json', directory: 'CACHE', encoding: 'utf8' \}\)/.test(erro) && /getUri\(\{ path: 'offline', directory: 'CACHE' \}\)/.test(erro) && /var OFF_DB='endodirect-offline',OFF_VALIDADE_MS=30\*86400000,OFF_FS_DIR='CACHE';/.test(html), 'app: a tela sem conexão e o site precisam usar a mesma pasta (Caches/offline)');
  ok(/VALIDADE_MS = 30 \* 86400000/.test(erro) && /img\.src = base \+ '\/fig\/'/.test(erro), 'app: tela sem conexão sem a validade de 30 dias ou sem as figuras');
  ok(/location\.replace\(SITE\)/.test(erro) && /id="tentar"/.test(erro), 'app: a tela sem conexão perdeu o "Tentar de novo"');

  if (falhas.length) {
    console.error('✗ Resumos sem internet:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Resumos sem internet: baixar a área (texto e figuras), ler sem rede (mesmo com o login vencido), sair apaga, e a tela "Sem conexão" do app 1.3 lê as áreas baixadas');
})().catch((e) => { console.error('✗ Resumos sem internet: ' + (e && e.stack || e)); process.exit(1); });
