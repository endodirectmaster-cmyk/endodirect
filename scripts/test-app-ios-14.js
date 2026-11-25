#!/usr/bin/env node
// APP DO IPHONE, VERSÃO 1.4 (25/11/2026). Professor: "Faz os 3".
//  1) Gravação de tela e print: o app avisa (CapturaPlugin.swift); a página pausa a aula, esconde o
//     vídeo, mostra o aviso e anota no painel de contas suspeitas (endodirect_captura_registrar).
//  2) Áudio da aula com a tela bloqueada: sessão "playback" + UIBackgroundModes audio no app; se o
//     iPhone pausar o vídeo ao bloquear, a página passa o som para um <audio> do mesmo ponto.
//  3) Widget da Questão do Dia (extensão QuestaoDoDia): lê a rota pública rota=qotd-widget, que só
//     entrega id, área e enunciado (sem alternativas nem gabarito).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const RAIZ = path.join(__dirname, '..');
const IOS = path.join(RAIZ, 'app-ios', 'ios', 'App');
const ler = (...p) => fs.readFileSync(path.join(...p), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

(async () => {
  // ── 1. lado nativo ─────────────────────────────────────────────────────────────────────────
  const cap = ler(IOS, 'App', 'CapturaPlugin.swift');
  const vc = ler(IOS, 'App', 'AppViewController.swift');
  const del = ler(IOS, 'App', 'AppDelegate.swift');
  const info = ler(IOS, 'App', 'Info.plist');
  const pbx = ler(IOS, 'App.xcodeproj', 'project.pbxproj');
  const wid = ler(IOS, 'QuestaoDoDia', 'QuestaoDoDiaWidget.swift');
  const widInfo = ler(IOS, 'QuestaoDoDia', 'Info.plist');
  const wf = ler(RAIZ, '.github', 'workflows', 'app-ios.yml');

  ok('🧨 plugin Captura: nome e método que o site chama', /public let jsName = "Captura"/.test(cap) && /CAPPluginMethod\(name: "estado", returnType: CAPPluginReturnPromise\)/.test(cap));
  ok('🧨 plugin ouve gravação/espelhamento e print', /UIScreen\.capturedDidChangeNotification/.test(cap) && /UIApplication\.userDidTakeScreenshotNotification/.test(cap));
  ok('plugin avisa a página com "mudou" {gravando} e "print"', /notifyListeners\("mudou", data: \["gravando": self\.gravando\(\)\]\)/.test(cap) && /notifyListeners\("print"/.test(cap) && /isCaptured/.test(cap));
  ok('🧨 plugin registrado no controlador do app', /bridge\?\.registerPluginInstance\(CapturaPlugin\(\)\)/.test(vc));
  ok('🧨 sem Picture in Picture (a janelinha sairia sem marca d\'água)', /allowsPictureInPictureMediaPlayback = false/.test(vc) && /override open func webViewConfiguration\(for instanceConfiguration: InstanceConfiguration\)/.test(vc) && /super\.webViewConfiguration\(for: instanceConfiguration\)/.test(vc));
  ok('🧨 sessão de áudio "playback" na abertura', /import AVFoundation/.test(del) && /AVAudioSession\.sharedInstance\(\)\.setCategory\(\.playback/.test(del));
  ok('🧨 áudio em segundo plano no Info.plist', /<key>UIBackgroundModes<\/key>\s*<array>\s*<string>audio<\/string>\s*<\/array>/.test(info));

  // projeto do Xcode
  ok('🧨 CapturaPlugin.swift na fase Sources do app', /\/\* CapturaPlugin\.swift in Sources \*\/,/.test(pbx));
  const alvoWid = (pbx.match(/([0-9A-F]{24}) \/\* QuestaoDoDia \*\/ = \{\s*isa = PBXNativeTarget;[\s\S]*?productType = "([^"]+)";/) || []);
  ok('🧨 alvo do widget é uma extensão de app', alvoWid[2] === 'com.apple.product-type.app-extension', alvoWid[2]);
  ok('🧨 widget embutido no app (Embed Foundation Extensions, PlugIns)', /isa = PBXCopyFilesBuildPhase;[\s\S]*?dstSubfolderSpec = 13;[\s\S]*?QuestaoDoDia\.appex in Embed Foundation Extensions/.test(pbx)
    && /\/\* Embed Foundation Extensions \*\/,\n\t\t\t\);\n\t\t\tbuildRules/.test(pbx));
  ok('o app depende do widget (compila junto)', /dependencies = \(\n\t\t\t\t[0-9A-F]{24} \/\* PBXTargetDependency \*\/,/.test(pbx) && /remoteInfo = QuestaoDoDia;/.test(pbx));
  ok('🧨 identificador do widget dentro do do app', (pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = br\.com\.endodirect\.app\.QuestaoDoDia;/g) || []).length === 2);
  const versoes = pbx.match(/MARKETING_VERSION = ([\d.]+);/g) || [];
  ok('🧨 app e widget na mesma versão (1.4)', versoes.length === 4 && versoes.every((v) => v === 'MARKETING_VERSION = 1.4;'), versoes.join(' '));
  ok('widget no iOS 16 ou mais novo (tela de bloqueio)', (pbx.match(/IPHONEOS_DEPLOYMENT_TARGET = 16\.0;/g) || []).length === 2);
  ok('🧨 Info.plist do widget: extensão do WidgetKit e versão do projeto', /<key>NSExtensionPointIdentifier<\/key>\s*<string>com\.apple\.widgetkit-extension<\/string>/.test(widInfo)
    && /<key>CFBundleShortVersionString<\/key>\s*<string>\$\(MARKETING_VERSION\)<\/string>/.test(widInfo) && /<key>CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/.test(widInfo));

  // widget
  ok('🧨 widget lê a rota pública da Questão do Dia', wid.includes('URL(string: "https://www.endodirect.com.br/api/publico?rota=qotd-widget")!'));
  ok('🧨 toque abre o app na questão (#qotd/<id>, id filtrado)', /"https:\/\/www\.endodirect\.com\.br\/#qotd"/.test(wid) && /\^\[A-Za-z0-9_-\]\{1,80\}\$/.test(wid) && /\.widgetURL\(entrada\.link\)/.test(wid));
  ok('widget não decodifica gabarito nem alternativas', !/\b(answer|explanation|gabarito)\b|let options/i.test(wid.replace(/\/\/.*$/gm, '')) && /struct Questao: Decodable \{\s*let id: String\?\s*let sub: String\?\s*let stem: String\s*\}/.test(wid));
  ok('tamanhos: tela inicial e tela de bloqueio', /\.supportedFamilies\(\[\.systemSmall, \.systemMedium, \.accessoryRectangular, \.accessoryInline\]\)/.test(wid));
  ok('fundo do widget no iOS 17 (containerBackground) e antes', /containerBackground\(for: \.widget\)/.test(wid) && /#available\(iOS 17\.0, \*\)/.test(wid));
  ok('@main no widget', /@main\s+struct QuestaoDoDiaWidget: Widget/.test(wid));
  ok('🧨 a compilação confere o widget embutido e o áudio', /PlugIns\/QuestaoDoDia\.appex/.test(wf) && /com\.apple\.widgetkit-extension/.test(wf) && /UIBackgroundModes/.test(wf));

  // ── 2. rota pública do widget ──────────────────────────────────────────────────────────────
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-teste';
  let pedidos = [];
  let respostaRpc = { id: 'ig-1', sub: 'Tireoide', stem: 'Enunciado da questão', answer: 'B', options: ['a', 'b'], explanation: 'segredo' };
  global.fetch = async (url, op) => { pedidos.push({ url: String(url), op }); return { ok: true, status: 200, json: async () => respostaRpc }; };
  const handler = require(path.join(RAIZ, 'api', 'publico.js'));
  const chama = async () => {
    const res = { headers: {}, statusCode: 0, corpo: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(c) { this.corpo = c; } };
    await handler({ url: '/api/publico?rota=qotd-widget', headers: {}, method: 'GET' }, res);
    return res;
  };
  let r = await chama();
  let j = {};
  try { j = JSON.parse(r.corpo); } catch (e) {}
  ok('🧨 rota qotd-widget responde a questão', r.statusCode === 200 && j.ok === true && j.qotd && j.qotd.id === 'ig-1' && j.qotd.stem === 'Enunciado da questão' && j.qotd.sub === 'Tireoide', r.corpo);
  ok('🧨 rota qotd-widget nunca entrega gabarito, alternativas ou comentário', !/answer|options|explanation|segredo/.test(r.corpo), r.corpo);
  ok('lê pela RPC endodirect_qotd_widget com o service role', pedidos.some((p) => /\/rest\/v1\/rpc\/endodirect_qotd_widget$/.test(p.url) && p.op.headers.apikey === 'svc-teste'));
  ok('cache de borda de 5 min', /s-maxage=300/.test(r.headers['cache-control'] || ''), r.headers['cache-control']);
  respostaRpc = null;
  r = await chama();
  try { j = JSON.parse(r.corpo); } catch (e) { j = {}; }
  ok('sem questão publicada: ok com qotd nulo', r.statusCode === 200 && j.ok === true && j.qotd === null);

  // ── 3. site: captura e áudio ───────────────────────────────────────────────────────────────
  const html = ler(RAIZ, 'index.html');
  function corpo(nome) {
    const i = html.indexOf('\nfunction ' + nome + '(');
    if (i < 0) throw new Error('função ' + nome + ' não encontrada');
    let d = 0;
    for (let k = html.indexOf('{', i); k < html.length; k++) {
      if (html[k] === '{') d++;
      else if (html[k] === '}') { d--; if (!d) return html.slice(i, k + 1); }
    }
    throw new Error('não fechou ' + nome);
  }
  const vcon = new VirtualConsole(); vcon.on('jsdomError', () => {});
  const dom = new JSDOM('<body><div class="panel" id="panel-dash"></div><div class="panel on" id="panel-cursos"><div id="box"><video id="aula-video" data-hls="https://vz-0161a494-b29.b-cdn.net/g/playlist.m3u8"></video></div></div></body>',
    { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vcon });
  const ctx = vm.createContext(dom.getInternalVMContext());
  vm.runInContext(`
    var rpcs=[],timers=[],avisos=[],ehApp=true,plugin=null;
    var currentUser={id:'u1',role:'aluno'},admCursos=[{title:'Cetoacidose'}],curAulaIdx=0;
    function getSupabaseClient(){return {rpc:function(n,a){rpcs.push([n,a]);return Promise.resolve({data:true});}};}
    function appNativoIOS(){return ehApp;}
    function pluginNativo(n){return n==='Captura'?plugin:null;}
    setTimeout=function(f,ms){timers.push([f,ms]);return timers.length;};
    // mídia falsa (o jsdom não toca vídeo)
    function midia(el){
      el.__p=true;el.__t=0;el.__rate=1;el.plays=0;el.pauses=0;
      Object.defineProperty(el,'paused',{get:function(){return this.__p;},configurable:true});
      Object.defineProperty(el,'ended',{get:function(){return false;},configurable:true});
      Object.defineProperty(el,'readyState',{get:function(){return this.__rs||0;},configurable:true});
      Object.defineProperty(el,'currentTime',{get:function(){return this.__t;},set:function(x){this.__t=x;},configurable:true});
      Object.defineProperty(el,'playbackRate',{get:function(){return this.__rate;},set:function(x){this.__rate=x;},configurable:true});
      el.play=function(){this.__p=false;this.plays++;this.dispatchEvent(new Event('play'));return Promise.resolve();};
      el.pause=function(){this.__p=true;this.pauses++;};
      el.load=function(){};
      return el;
    }
    var criarOriginal=document.createElement.bind(document);
    document.createElement=function(t){var e=criarOriginal(t);if(t==='audio')midia(e);return e;};
    var meta=null;window.MediaMetadata=function(o){this.title=o.title;this.artist=o.artist;};
    Object.defineProperty(navigator,'mediaSession',{value:{set metadata(m){meta=m;},get metadata(){return meta;},handlers:{},setActionHandler:function(k,f){this.handlers[k]=f;}},configurable:true});
  `, ctx);
  const nomes = ['capturaPainelAtual', 'capturaOnde', 'capturaRegistrar', 'capturaAviso', 'capturaAplicar', 'iniciarCapturaApp', 'aulaVideoTocando', 'aulaTituloDoVideo', 'aulaAudioFundoComecar', 'aulaAudioFundoParar'];
  const blocoIni = html.indexOf('var CAPTURA_PAINEIS=');
  const blocoFim = html.indexOf('\nfunction videoFalhaMostrar(v){');
  ok('bloco da captura e do áudio antes do aviso de falha do vídeo', blocoIni > 0 && blocoFim > blocoIni);
  vm.runInContext(html.slice(blocoIni, blocoFim), ctx);
  const run = (c) => vm.runInContext(c, ctx);
  run("var v=midia(document.getElementById('aula-video'));");
  nomes.forEach((n) => ok('função ' + n + ' existe', run('typeof ' + n) === 'function'));

  // gravação começa
  run('v.play();');
  run('capturaAplicar(true)');
  ok('🧨 gravação: aula pausada', run('v.paused') === true);
  ok('🧨 gravação: aviso por cima do vídeo e vídeo escondido', !!dom.window.document.querySelector('#box > .video-captura') && dom.window.document.documentElement.classList.contains('tela-gravando'));
  ok('🧨 gravação com aula na tela vai para o painel', run('rpcs.length') === 1 && run('rpcs[0][0]') === 'endodirect_captura_registrar' && run('rpcs[0][1].p_tipo') === 'gravacao' && run('rpcs[0][1].p_onde') === 'cursos', run('JSON.stringify(rpcs)'));
  run('v.play();');
  ok('🧨 play durante a gravação: pausa de novo', run('v.paused') === true && dom.window.document.querySelectorAll('.video-captura').length === 1);
  run('capturaAplicar(false)');
  ok('fim da gravação: aviso sai, aula fica pausada', !dom.window.document.querySelector('.video-captura') && !dom.window.document.documentElement.classList.contains('tela-gravando') && run('v.paused') === true);
  run('v.play();');
  ok('fim da gravação: play volta a funcionar', run('v.paused') === false);

  // print
  run('rpcs=[];capturaUltimo={};');
  ok('print com conteúdo na tela: anotado', run("capturaRegistrar('print')") === true && run('rpcs.length') === 1 && run('rpcs[0][1].p_tipo') === 'print');
  ok('print repetido em 30 s: uma anotação só', run("capturaRegistrar('print')") === false && run('rpcs.length') === 1);
  run("capturaUltimo={};document.getElementById('panel-cursos').classList.remove('on');document.getElementById('panel-dash').classList.add('on');");
  ok('print fora de aula/conteúdo (Dashboard): não anota', run("capturaRegistrar('print')") === false);
  run("capturaUltimo={};document.getElementById('panel-dash').classList.remove('on');document.getElementById('panel-cursos').classList.add('on');currentUser.role='admin';");
  ok('professor: não anota', run("capturaRegistrar('print')") === false);
  run("currentUser.role='aluno';");
  ok('tipo desconhecido: não anota', run("capturaRegistrar('outro')") === false);

  // plugin do app
  run(`capturaIniciada=false;capturaAtiva=false;rpcs=[];capturaUltimo={};
    var ouvintes={};plugin={addListener:function(n,f){ouvintes[n]=f;},estado:function(){return Promise.resolve({gravando:false});}};
    iniciarCapturaApp();`);
  ok('🧨 app 1.4: ouve "mudou" e "print" do plugin', run("typeof ouvintes.mudou") === 'function' && run("typeof ouvintes.print") === 'function');
  run("v.play();ouvintes.mudou({gravando:true});");
  ok('evento do app pausa a aula', run('v.paused') === true && run('capturaAtiva') === true);
  run("ouvintes.mudou({gravando:false});");
  run("rpcs=[];capturaUltimo={};ouvintes.print();");
  ok('evento de print do app anota', run('rpcs.length') === 1 && run('rpcs[0][1].p_tipo') === 'print');
  run('capturaIniciada=false;plugin=null;');
  run('iniciarCapturaApp();');
  ok('app sem o plugin (1.3 ou anterior): nada liga', run('capturaIniciada') === false);
  run('ehApp=false;plugin={addListener:function(){},estado:function(){return Promise.resolve({gravando:true});}};iniciarCapturaApp();');
  ok('site no navegador: nada liga', run('capturaIniciada') === false);
  run('ehApp=true;');

  // áudio com a tela bloqueada
  run('capturaAtiva=false;v.__t=0;v.play();v.__t=312.5;v.__rate=1.5;');
  ok('vídeo tocando é achado', run('aulaVideoTocando()===v') === true);
  ok('🧨 troca para o áudio', run('aulaAudioFundoComecar(v)') === true);
  run("var a=aulaFundo.audio;a.__rs=1;a.dispatchEvent(new Event('loadedmetadata'));");
  ok('🧨 áudio com o mesmo endereço HLS, do mesmo ponto e na mesma velocidade', run('a.getAttribute("src")') === 'https://vz-0161a494-b29.b-cdn.net/g/playlist.m3u8' && run('a.currentTime') === 312.5 && run('a.playbackRate') === 1.5 && run('a.paused') === false, run('a.getAttribute("src")+" "+a.currentTime'));
  ok('vídeo pausado durante o áudio', run('v.paused') === true);
  ok('tela de bloqueio com o nome da aula', run('meta&&meta.title') === 'Cetoacidose' && run('meta.artist') === 'Endodirect' && run("typeof navigator.mediaSession.handlers.pause") === 'function');
  run('a.__t=400;');
  ok('🧨 volta ao app: vídeo segue de onde o áudio parou', run('aulaAudioFundoParar(true)') === true && run('v.currentTime') === 400 && run('v.paused') === false && run('a.paused') === true);
  run('capturaAtiva=true;');
  ok('🧨 com a tela sendo gravada, o áudio de fundo não liga', run('aulaAudioFundoComecar(v)') === false);
  run('capturaAtiva=false;');
  run("var s2=midia(document.createElement('video'));s2.setAttribute('src','blob:abc');");
  ok('endereço que não é https: não troca', run('aulaAudioFundoComecar(s2)') === false);

  // ouvintes do documento (estático)
  ok('🧨 a troca só acontece se o iPhone pausar o vídeo (espera 700 ms)', /setTimeout\(function\(\)\{if\(document\.visibilityState==='hidden'&&v\.paused&&!v\.ended&&!capturaAtiva\)aulaAudioFundoComecar\(v\);\},700\);/.test(html));
  ok('🧨 só no app do iPhone', /document\.addEventListener\('visibilitychange',function\(\)\{\n  if\(!appNativoIOS\(\)\)return;/.test(html));
  ok('🧨 captura ligada na abertura do app', /iniciarCapturaApp\(\); \/\/ app do iPhone 1\.4/.test(html));
  ok('painel de contas suspeitas mostra prints e gravações', /📸 Prints: <b>'\+\(\+c\.prints_30d\|\|0\)\+'<\/b> · 🎥 Gravações de tela: <b>'\+\(\+c\.gravacoes_30d\|\|0\)/.test(html));
  ok('SQL no repositório: tabela, registro e painel', /create table if not exists public\.endodirect_capturas/.test(ler(RAIZ, 'supabase', 'capturas-de-tela.sql')) && /endodirect_captura_registrar/.test(ler(RAIZ, 'supabase', 'capturas-de-tela.sql')) && /gravacoes_30d/.test(ler(RAIZ, 'supabase', 'capturas-de-tela.sql')));

  if (bad) { console.log('✗ app do iPhone 1.4: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ app do iPhone 1.4: gravação de tela pausa a aula e vai ao painel, áudio com a tela bloqueada, widget da Questão do Dia sem gabarito');
})().catch((e) => { console.log('✗ app do iPhone 1.4: ' + (e && e.stack || e)); process.exit(1); });
