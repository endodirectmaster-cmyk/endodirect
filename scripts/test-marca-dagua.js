// Regressão: marca d'água do aluno (professor, 17/11/2026: "meu receio é ele baixar as aulas ou os resumos
// ... e começar a distribuir para outras pessoas via WhatsApp"; "em qualquer tipo de vídeo, deixar algum tipo
// de identificação do aluno também, com alguma marca d'água"; "vamos deixar de um modo que também não fique
// distraindo o aluno nessas mudanças").
// Nome e e-mail do aluno em diagonal sobre os capítulos dos Resumos e a figura ampliada, e num canto de todo
// vídeo (troca de canto a cada 60 s sumindo e reaparecendo devagar, nunca no meio). Tela cheia do vídeo:
// a do quadro (com a marca), não a nativa do player, que a esconderia.
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
const dom = new JSDOM('<body><div id="emc"><video src="a.m3u8" controls></video></div><div id="ee"><iframe src="https://iframe.mediadelivery.net/embed/1/2"></iframe></div><div id="outro"><iframe src="https://www.google.com/maps"></iframe></div></body>',
  { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var currentUser=null,timers=[],intervalos=[];
  function isAdminUser(){return !!(currentUser&&currentUser.role==='admin');}
  setTimeout=function(f,ms){timers.push([f,ms]);return timers.length;};
  setInterval=function(f,ms){intervalos.push([f,ms]);return intervalos.length;};
  clearInterval=function(){};
`, ctx);
vm.runInContext(html.slice(html.indexOf('\nvar MARCA_VIDEO_SEL='), html.indexOf('\nvar marcaRelogioId=') + 50).split('\n').slice(0, 3).join('\n'), ctx);
vm.runInContext((html.match(/\nvar MARCA_TC_SVG=[^\n]*\n[^\n]*\n/) || [''])[0], ctx);
['marcaTexto', 'marcaSvgURL', 'marcaAplicar', 'marcaCanto', 'marcaPosicao', 'marcaFsTroca', 'marcaVideos', 'marcaChromiumMouse', 'marcaBotaoBaixo', 'marcaTelaCheia', 'marcaTelaCheiaFalsa', 'marcaIniciar', 'marcaParar', 'videoCliquePausa']
  .forEach((n) => vm.runInContext(corpo(n), ctx));
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

// 1) quem tem marca
ok(run('marcaTexto()') === '', 'sem login, sem marca');
run('currentUser={id:"p",name:"Professor",email:"prof@x.y",role:"admin"}');
ok(run('marcaTexto()') === '', 'professor (admin) não tem marca');
run('currentUser={id:"u1",name:"Ana <b>Lima</b> & Cia",email:"ana@x.y"}');
ok(run('marcaTexto()') === 'Ana <b>Lima</b> & Cia · ana@x.y', 'aluno: nome · e-mail');
run('currentUser.name=""');
ok(run('marcaTexto()') === 'ana@x.y', 'sem nome: só o e-mail');
run('currentUser.name="Ana <b>Lima</b> & Cia"');

// 2) o desenho (SVG) escapa o texto e fica claro
const url = run('marcaSvgURL(marcaTexto())');
const svg = decodeURIComponent(url.replace(/^url\("data:image\/svg\+xml;charset=utf-8,/, '').replace(/"\)$/, ''));
ok(/^url\("data:image\/svg\+xml;charset=utf-8,/.test(url) && !/["']/.test(url.slice(5, -2)), 'marca não é uma URL de imagem segura para o CSS: ' + url.slice(0, 80));
ok(/Ana &lt;b&gt;Lima&lt;\/b&gt; &amp; Cia · ana@x\.y/.test(svg) && !/<b>/.test(svg), 'nome com < & > tem de ser escapado no SVG');
ok(/fill-opacity="0\.2"/.test(svg) && /rotate\(-24/.test(svg), 'marca clara e em diagonal');
ok(/width="520" height="380"/.test(svg), 'marca espaçada (uma a cada 520×380 px): o professor pediu menos marca na tela');
run('marcaAplicar()');
ok(doc.body.style.getPropertyValue('--marca-aluno').indexOf('data:image/svg+xml') >= 0, 'marcaAplicar não pôs a marca no body (--marca-aluno)');

// 3) vídeos: Bunny/<video>, iframe do Bunny; um iframe que não é vídeo fica sem
run('marcaVideos(document.body)');
run('marcaVideos(document.body)'); // de novo: não duplica
const emc = doc.getElementById('emc'), ee = doc.getElementById('ee'), outro = doc.getElementById('outro');
ok(emc.querySelectorAll(':scope > .marca-video').length === 1 && ee.querySelectorAll(':scope > .marca-video').length === 1, 'cada vídeo ganha uma (e só uma) marca');
ok(!outro.querySelector('.marca-video'), 'iframe que não é vídeo não ganha marca');
ok(emc.querySelector('.marca-video span').textContent === 'Ana <b>Lima</b> & Cia\nana@x.y' && !emc.querySelector('.marca-video b'), 'marca do vídeo: nome numa linha e e-mail na outra, como texto (nunca HTML): ' + JSON.stringify(emc.querySelector('.marca-video span').textContent));
ok(emc.querySelector('.marca-video').getAttribute('aria-hidden') === 'true', 'leitor de tela não lê a marca');
ok(emc.style.position === 'relative', 'o quadro do vídeo vira referência para a marca');
const v = emc.querySelector('video');
ok(v.getAttribute('controlslist') === 'nofullscreen', 'tela cheia nativa (esconde a marca) não foi desligada');
ok(emc.querySelectorAll('.marca-tc').length === 1 && !ee.querySelector('.marca-tc'), 'botão ⛶ (tela cheia com a marca) no <video>, e só uma vez');
// posição: sempre num canto/borda, nunca no meio; desvia do ⛶ (em cima à direita) e da barra do player (embaixo)
const pct = (x) => parseFloat(x);
const cantos = {};
for (let k = 0; k < 300; k++) {
  const s = doc.createElement('span');
  run('marcaCanto')(s);
  const alto = s.style.top !== 'auto', esq = s.style.left !== 'auto';
  const vert = alto ? pct(s.style.top) : pct(s.style.bottom);
  const hor = esq ? pct(s.style.left) : pct(s.style.right);
  cantos[(alto ? 'alto' : 'baixo') + '-' + (esq ? 'esq' : 'dir')] = 1;
  const errado = alto === (s.style.bottom !== 'auto') || esq === (s.style.right !== 'auto')
    || !(hor >= 3 && hor <= 10) || (alto ? !(vert >= 4 && vert <= 12) : !(vert >= 0 && vert <= 6))
    || s.style.marginBottom !== (alto ? '0px' : '52px') && s.style.marginBottom !== (alto ? '0' : '52px')
    || (alto && !esq ? !/^46px$/.test(s.style.marginRight) : !/^0(px)?$/.test(s.style.marginRight))
    || s.style.textAlign !== (esq ? 'left' : 'right');
  if (errado) { falhas.push('marca fora dos cantos (ou sobre o ⛶/barra do player): ' + s.getAttribute('style')); break; }
}
ok(Object.keys(cantos).length === 4, 'a marca precisa usar os quatro cantos: ' + Object.keys(cantos));
// troca de canto: some, troca enquanto invisível, reaparece; a cada 60 s
ok(run('intervalos.length') === 1 && run('intervalos[0][1]') === 60000, 'a marca do vídeo troca de canto a cada 60 s (uma vez só o relógio): ' + run('JSON.stringify(intervalos.map(function(x){return x[1];}))'));
const sp = emc.querySelector('.marca-video span');
const antes = sp.getAttribute('style');
run('timers.length=0;intervalos[0][0]()');
ok(sp.style.opacity === '0' && sp.getAttribute('style').replace(/;?\s*opacity:\s*0;?/, '') === antes.replace(/;$/, '') || sp.style.opacity === '0', 'primeiro a marca some (sem deslizar pela tela)');
ok(run('timers.length') >= 1 && run('timers[0][1]') >= 2000, 'troca o canto só depois de sumir (≥ 2 s)');
run('timers.forEach(function(t){t[0]();})');
ok(sp.style.opacity === '', 'depois de trocar o canto, a marca reaparece');

// 4) tela cheia: a do quadro do vídeo (com a marca); no iPhone, dentro da página
run('marcaTelaCheia')(emc);
ok(emc.classList.contains('marca-tc-falsa') && doc.body.classList.contains('marca-tc-aberta'), 'sem tela cheia de elemento (iPhone): tela cheia dentro da página');
run('marcaTelaCheia')(emc);
ok(!emc.classList.contains('marca-tc-falsa') && !doc.body.classList.contains('marca-tc-aberta'), 'segundo toque sai da tela cheia');
const vids = ctx.__ev = [];
v.dispatchEvent(new dom.window.Event('webkitbeginfullscreen'));
run('timers.forEach(function(t){t[0]();})');
ok(emc.classList.contains('marca-tc-falsa'), 'player nativo do iPhone abriu: precisa voltar para a tela cheia com a marca');
run('marcaTelaCheiaFalsa')(emc, false);
// tela cheia NATIVA do vídeo (botão do player / duplo clique): troca pela do quadro, com a marca
let fsEl = v, pedidos = 0, recusa = false;
Object.defineProperty(doc, 'fullscreenElement', { configurable: true, get: () => fsEl });
doc.exitFullscreen = () => { fsEl = null; return Promise.resolve(); };
emc.requestFullscreen = () => { pedidos++; if (recusa) return Promise.reject(new Error('sem gesto')); fsEl = emc; return Promise.resolve(); };
run('marcaFsTroca()');
ok(pedidos === 1 && fsEl === emc, 'tela cheia nativa do vídeo (esconde a marca) não foi trocada pela do quadro');
fsEl = v; recusa = true;
run('marcaFsTroca()');
(async () => {
  await new Promise((r) => setImmediate(r));
  ok(emc.classList.contains('marca-tc-falsa') && fsEl === null, 'navegador recusou a troca: sai da tela cheia nativa e usa a tela cheia dentro da página');
  run('marcaTelaCheiaFalsa')(emc, false);
  fsEl = doc.createElement('div'); pedidos = 0;
  run('marcaFsTroca()');
  ok(pedidos === 0, 'tela cheia de outra coisa (não o vídeo) não é mexida');
  fsEl = null; delete emc.requestFullscreen;
})();

// 4b) botão de tela cheia de BAIXO e clique que pausa (25/11/2026). Professor: "o botão de maximizar lá de baixo
// não está funcionando, apenas do canto superior direito" e "ao clicar com o botão esquerdo do mouse em qualquer
// região da tela, pausar a aula".
ok(!emc.querySelector('.marca-tc-baixo') && !emc.classList.contains('marca-cr'), 'sem Chrome/Edge com mouse (celular, iPhone, Firefox, Safari): nada de botão de baixo, o player fica como era');
ok(typeof run('MARCA_TC_SVG') === 'string' && /class="tc-entra"/.test(run('MARCA_TC_SVG')) && /class="tc-sai"/.test(run('MARCA_TC_SVG')), 'ícones de entrar e sair da tela cheia');
Object.defineProperty(dom.window.navigator, 'userAgentData', { configurable: true, value: { brands: [{ brand: 'Not A Brand' }, { brand: 'Chromium' }, { brand: 'Google Chrome' }] } });
let fino = true;
dom.window.matchMedia = () => ({ matches: fino });
ok(run('marcaChromiumMouse()') === true, 'Chrome/Edge com mouse: precisa do botão de baixo');
fino = false;
ok(run('marcaChromiumMouse()') === false, 'Chrome no celular (toque): sem botão de baixo');
fino = true;
const cr = doc.createElement('div');
cr.innerHTML = '<video src="b.m3u8" controls></video>';
doc.body.appendChild(cr);
run('timers=[]');
run('marcaVideos(document.body)');
const crv = cr.querySelector('video'), bb = cr.querySelector(':scope > .marca-tc-baixo');
ok(!!bb && cr.querySelectorAll('.marca-tc-baixo').length === 1, 'Chrome com mouse: o vídeo ganha o botão de tela cheia de baixo (um só)');
ok(cr.classList.contains('marca-cr'), 'o quadro marca-cr esconde o botão nativo apagado do Chrome');
ok(bb && bb.getAttribute('aria-label') === 'Tela cheia' && bb.type === 'button', 'botão de baixo acessível');
ok(cr.classList.contains('marca-ctl'), 'vídeo parado: a barra está à vista, e o botão de baixo também');
run('marcaVideos(document.body)');
ok(cr.querySelectorAll('.marca-tc-baixo').length === 1, 'marcar de novo não duplica o botão de baixo');
let pedCr = 0;
cr.requestFullscreen = () => { pedCr++; return Promise.resolve(); };
const fsAntes = fsEl; fsEl = null; // nada em tela cheia agora (a seção 4 ainda resolve a dela depois)
bb.click();
fsEl = fsAntes;
ok(pedCr === 1, '🧨 o botão de baixo põe o QUADRO (com a marca) em tela cheia, como o ⛶ de cima');
delete cr.requestFullscreen;
Object.defineProperty(crv, 'paused', { configurable: true, get: () => false });
cr.classList.remove('marca-ctl');
cr.dispatchEvent(new dom.window.MouseEvent('mousemove', { bubbles: true }));
ok(cr.classList.contains('marca-ctl'), 'mexer o mouse sobre o vídeo mostra o botão de baixo');
const esc = run('timers').filter((t) => t[1] === 2500);
ok(esc.length >= 1, 'tocando: o botão some 2,5 s depois do último movimento (o tempo da barra do Chrome)');
esc.forEach((t) => t[0]());
ok(!cr.classList.contains('marca-ctl'), 'tocando e mouse parado: o botão de baixo some com a barra');
cr.classList.add('marca-ctl');
cr.dispatchEvent(new dom.window.MouseEvent('mouseleave'));
ok(!cr.classList.contains('marca-ctl'), 'tocando e o mouse saiu do vídeo: o botão some');
delete crv.paused;
// clique na imagem pausa / retoma
let acao = '', prevenido = 0;
const vc2 = doc.createElement('video'); vc2.controls = true;
Object.defineProperty(vc2, 'paused', { configurable: true, get: () => acao !== 'play' });
vc2.play = () => { acao = 'play'; return Promise.resolve(); };
vc2.pause = () => { acao = 'pause'; };
const clique = (o) => Object.assign({ target: vc2, button: 0, pointerType: 'mouse', preventDefault: () => { prevenido++; } }, o || {});
run('videoCliquePausa')(clique());
ok(acao === 'play' && prevenido === 1, '🧨 clique com o botão esquerdo na imagem parada: toca (e tira o play/pause próprio do navegador, para não alternar duas vezes)');
run('videoCliquePausa')(clique());
ok(acao === 'pause' && prevenido === 2, '🧨 clique com o botão esquerdo na imagem tocando: pausa a aula');
acao = 'x'; prevenido = 0;
run('videoCliquePausa')(clique({ button: 2 }));
run('videoCliquePausa')(clique({ pointerType: 'touch' }));
run('videoCliquePausa')(clique({ ctrlKey: true }));
run('videoCliquePausa')(clique({ target: doc.createElement('div') }));
vc2.controls = false; run('videoCliquePausa')(clique()); vc2.controls = true;
ok(acao === 'x' && prevenido === 0, 'botão direito, toque no celular, Ctrl+clique, fora do vídeo ou vídeo sem controles (vitrine): nada muda');
fino = false;
run('videoCliquePausa')(clique({ pointerType: undefined }));
ok(acao === 'x', 'navegador sem pointerType e sem mouse: o toque não pausa');
fino = true;
run('videoCliquePausa')(clique({ pointerType: undefined }));
ok(acao === 'play', 'navegador sem pointerType, com mouse: o clique funciona');
cr.remove();
delete dom.window.navigator.userAgentData;
delete dom.window.matchMedia;
ok(/\ndocument\.addEventListener\('click',videoCliquePausa,true\);/.test(html), 'o clique que pausa fica ligado para a página toda, na captura (antes do player do navegador)');
ok(/if\(marcaChromiumMouse\(\)\)marcaBotaoBaixo\(p,v\);/.test(corpo('marcaVideos')), 'marcaVideos põe o botão de baixo no Chrome/Edge com mouse');
ok(/\.marca-cr>video::-webkit-media-controls-fullscreen-button\{visibility:hidden\}/.test(html), 'CSS: o nativo apagado fica invisível, mas guarda o lugar na barra');
ok(/\.marca-tc-baixo\{position:absolute;right:49px;bottom:24px;[^}]*opacity:0;pointer-events:none;/.test(html) && /\.marca-ctl>\.marca-tc-baixo,\.marca-tc-baixo:focus-visible\{opacity:1;pointer-events:auto\}/.test(html), 'CSS: o botão de baixo no lugar do nativo, à vista só com a barra');
ok(/:fullscreen>\.marca-tc-baixo \.tc-sai\{display:block\}/.test(html), 'em tela cheia, o botão de baixo mostra "sair"');

// 5) vídeo que entra depois (troca de aula) também ganha a marca; Sair tira tudo
run('marcaIniciar()');
const nova = doc.createElement('div');
nova.innerHTML = '<iframe src="https://player.vimeo.com/video/1"></iframe>';
doc.body.appendChild(nova);
(async () => {
  await new Promise((r) => dom.window.queueMicrotask(r));
  await new Promise((r) => setImmediate(r));
  ok(!!nova.querySelector('.marca-video'), 'vídeo que entra depois na tela (outra aula) ficou sem marca');
  run('marcaParar()');
  ok(!doc.querySelector('.marca-video') && !doc.querySelector('.marca-tc') && !doc.querySelector('.marca-tc-baixo') && !doc.body.style.getPropertyValue('--marca-aluno'), '"Sair": a marca do aluno tem de sair da tela');
  const nova2 = doc.createElement('div');
  nova2.innerHTML = '<video></video>';
  doc.body.appendChild(nova2);
  await new Promise((r) => setImmediate(r));
  ok(!nova2.querySelector('.marca-video'), 'depois de sair, o observador continua marcando vídeos');
  run('currentUser={id:"p",email:"prof@x.y",role:"admin"};marcaIniciar()');
  ok(!doc.querySelector('.marca-video') && !doc.body.style.getPropertyValue('--marca-aluno'), 'professor: sem marca');

  // 6) ligações (estático)
  ok(/marcaIniciar\(\)/.test(corpo('startApp')), 'a marca não liga ao entrar (startApp)');
  ok(/document\.addEventListener\('fullscreenchange',marcaFsTroca\);document\.addEventListener\('webkitfullscreenchange',marcaFsTroca\);/.test(corpo('marcaIniciar')), 'a tela cheia nativa do vídeo não é vigiada');
  ok(/marcaParar\(\)/.test(corpo('doLogout')), 'a marca não sai no "Sair" (doLogout)');
  ok(/'<div class="dir-card'\+\(refPrivadoMode\?' dir-marca':''\)\+'" style="position:relative"/.test(corpo('dirCardHTML')), 'capítulo dos Resumos sem a classe dir-marca');
  ok(/marcaAplicar\(\);/.test(corpo('resuPosRender')), 'a tela dos Resumos não reaplica a marca');
  ok(/ov\.className='lb-marca';/.test(corpo('ensureLightbox')), 'figura ampliada sem a marca');
  ok(/var MARCA_VIDEO_SEL='video,iframe\[src\*="vimeo\.com"\],iframe\[src\*="youtube\.com"\],iframe\[src\*="mediadelivery\.net"\]';/.test(html), 'a marca precisa cobrir vídeo próprio, Bunny, Vimeo e YouTube');
  // CSS: a marca não pega cliques, só aparece onde deve e não se move pela tela
  ok(/\.dir-marca::after\{content:"";position:absolute;inset:0;pointer-events:none;background-image:var\(--marca-aluno,none\)/.test(html), 'CSS .dir-marca::after (marca sobre o capítulo, sem pegar o toque)');
  ok(/\.lb-marca::after\{content:"";position:absolute;inset:0;pointer-events:none;background-image:var\(--marca-aluno,none\)/.test(html), 'CSS .lb-marca::after');
  ok(/\.dir-marca \.dir-video\{position:relative;z-index:4\}/.test(html), 'o padrão diagonal do capítulo não pode cobrir a videoaula (nela vale só a marca do canto)');
  ok(/\.marca-video\{position:absolute;inset:0;pointer-events:none;/.test(html), 'CSS .marca-video (não pode pegar o toque nos controles do vídeo)');
  const regra = (html.match(/\.marca-video span\{[^}]*\}/) || [''])[0];
  ok(/transition:opacity 2s/.test(regra) && !/transition:[^;]*(top|left)/.test(regra), 'marca do vídeo: só some e reaparece (sem deslizar): ' + regra);
  ok(/color:rgba\(255,255,255,\.3\d\)/.test(regra) && /font:600 11px/.test(regra) && /white-space:pre;/.test(regra), 'marca do vídeo pequena e clara (não distrai), em duas linhas');
  ok(/@media \(prefers-reduced-motion:reduce\)\{\.marca-video span\{transition:none\}\}/.test(html), 'movimento reduzido: sem transição');
  ok(/\.marca-tc-falsa\{position:fixed!important;inset:0!important;/.test(html), 'CSS da tela cheia dentro da página');

  if (falhas.length) {
    console.error('✗ Marca d\'água do aluno:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Marca d\'água do aluno: nome e e-mail sobre os Resumos, a figura ampliada e todo vídeo (num canto, trocando a cada 60 s sem deslizar); tela cheia com a marca; o professor não tem marca; "Sair" tira');
})().catch((e) => { console.error('✗ Marca d\'água do aluno: ' + (e && e.stack || e)); process.exit(1); });
