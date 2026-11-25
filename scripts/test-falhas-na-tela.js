// Regressão: falhas que o aluno percebe aparecem NA TELA (professor, 25/11/2026, aceitou: "quando algo falha
// e o aluno percebe, a plataforma mostra ali mesmo, 'não deu certo, tente de novo'").
//  1) Progresso que não salvou: aviso claro (sem "setup SQL"), novas tentativas sozinhas e "Pronto: salvo".
//  2) Videoaula que não carrega (erro do <video> ou fatal do hls.js, ou o reprodutor que não chegou):
//     aviso por cima do vídeo, com "Tentar de novo".
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
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
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM('<body></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(`
  var avisos=[],timers=[],salvos=0,currentUser={id:'u',role:'aluno'},aulaHls=null;
  function notify(m,t){avisos.push([t,m]);}
  setTimeout=function(f,ms){timers.push([f,ms]);return timers.length;};
  clearTimeout=function(){};
  function queueRemoteStateSave(){salvos++;return null;}
  function aulaSoltarHls(){aulaHls=null;}
`, ctx);
vm.runInContext('var salvarFalhas=0,salvarRetryTimer=null;\n' + ['salvarFalhou', 'salvarFalhouOk', 'videoHlsLigar', 'videoFalhaMostrar', 'videoRecarregar', 'montarVideosHls'].map(corpo).join('\n'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

// 1) Salvamento
const save = corpo('saveRemoteState');
ok(/\.then\(function\(\)\{salvarFalhouOk\(\);return true;\}\)/.test(save) && /salvarFalhou\(\);/.test(save), 'saveRemoteState não liga salvarFalhou/salvarFalhouOk');
ok(!/notify\('[^']*Verifique o setup SQL/.test(html), 'aviso técnico "Verifique o setup SQL" voltou para o aluno');
run('salvarFalhou()');
ok(run('avisos.length') === 1 && /seu progresso ainda não foi salvo/.test(run('avisos[0][1]')) && run('avisos[0][0]') === 'err', '🧨 1ª falha: aviso claro ao aluno: ' + run('JSON.stringify(avisos)'));
ok(run('timers.length') === 1 && run('timers[0][1]') === 10000, '🧨 1ª falha: nova tentativa em 10 s');
run('timers[0][0]()');
ok(run('salvos') === 1, 'a nova tentativa salva de novo');
run('salvarFalhou()');
ok(run('avisos.length') === 1, 'falhas seguidas não repetem o aviso');
ok(run('timers[1][1]') === 20000, 'espera cresce (20 s na 2ª)');
for (let k = 0; k < 10; k++) run('salvarFalhou()');
ok(run('timers.filter(function(t){return t[1]===60000;}).length') >= 1 && run('timers.length') === 8, 'espera até 60 s e no máximo 8 tentativas: ' + run('timers.length'));
run('salvarFalhouOk()');
ok(run('avisos[avisos.length-1][1]') === 'Pronto: salvo. ✓' && run('salvarFalhas') === 0, '🧨 deu certo depois da falha: "Pronto: salvo" e zera');
run('salvarFalhouOk()');
ok(run('avisos.length') === 2, 'salvamento normal (sem falha antes) não avisa nada');
run('currentUser.role="admin";salvarFalhou()');
ok(/não feche o painel/.test(run('avisos[avisos.length-1][1]')), 'professor: aviso próprio do painel');
run('salvarFalhouOk();currentUser.role="aluno"');
ok(/window\.addEventListener\('online',function\(\)\{if\(salvarFalhas\)queueRemoteStateSave\(true\);\}\)/.test(html), 'volta da conexão tenta salvar de novo');

// 2) Vídeo
const box = doc.createElement('div'); box.className = 'dir-video-player';
box.innerHTML = '<video controls data-hls="https://x/playlist.m3u8"></video>';
doc.body.appendChild(box);
const v = box.querySelector('video');
run('videoFalhaMostrar')(v);
run('videoFalhaMostrar')(v);
const ov = box.querySelectorAll(':scope > .video-falha');
ok(ov.length === 1, '🧨 o aviso aparece por cima do vídeo, uma vez só');
ok(ov[0] && ov[0].getAttribute('role') === 'alert' && /Não foi possível carregar a videoaula/.test(ov[0].textContent) && /Tentar de novo/.test(ov[0].textContent), 'texto e botão do aviso');
ok(box.style.position === 'relative', 'o quadro vira referência para o aviso');
// Tentar de novo com hls.js: remonta, liga o aviso de erro fatal e volta ao minuto
let ouvinte = null, carregou = null, ligou = null;
dom.window.Hls = function () { this.on = (e, f) => { ouvinte = f; }; this.loadSource = (s) => { carregou = s; }; this.attachMedia = (m) => { ligou = m; }; this.destroy = () => {}; };
dom.window.Hls.isSupported = () => true;
dom.window.Hls.Events = { ERROR: 'hlsError' };
v.canPlayType = () => '';
Object.defineProperty(v, 'currentTime', { configurable: true, writable: true, value: 95 });
ov[0].querySelector('button').click();
ok(!box.querySelector('.video-falha') && carregou === 'https://x/playlist.m3u8' && ligou === v, '🧨 "Tentar de novo" tira o aviso e remonta o vídeo');
ok(typeof ouvinte === 'function', 'o novo hls.js também avisa erro fatal');
ouvinte('hlsError', { fatal: false });
ok(!box.querySelector('.video-falha'), 'erro não fatal do hls.js (ele mesmo recupera) não mostra aviso');
ouvinte('hlsError', { fatal: true });
ok(!!box.querySelector('.video-falha'), '🧨 erro fatal do hls.js mostra o aviso');
// Reprodutor que não chegou em 10 s (montarVideosHls desiste FALANDO)
const sec = doc.createElement('div');
sec.innerHTML = '<div class="dir-video"><div class="dir-video-player"><video controls data-hls="https://x/b.m3u8"></video></div></div>';
doc.body.appendChild(sec);
delete dom.window.Hls;
const sv = sec.querySelector('video'); sv.canPlayType = () => '';
run('timers=[]');
run('montarVideosHls')(sec, 0);
ok(run('timers.length') === 1 && !sec.querySelector('.video-falha'), 'ainda esperando o reprodutor: sem aviso');
run('montarVideosHls')(sec, 20);
ok(!!sec.querySelector('.video-falha'), '🧨 reprodutor não chegou: aviso na tela em vez de vídeo preto');
// Ligações (estático)
ok(/aulaHls=new window\.Hls\(\);videoHlsLigar\(v,aulaHls\);/.test(corpo('montarAulaHls')), 'aula dos cursos: hls.js sem o aviso de erro fatal');
ok(/var h=new window\.Hls\(\);videoHlsLigar\(v,h\);/.test(corpo('montarVideosHls')), 'videoaula dos Resumos: hls.js sem o aviso de erro fatal');
const lst = html.slice(html.indexOf("document.addEventListener('error',function(ev){\n  var v=ev.target;"));
ok(/v\.tagName!=='VIDEO'\|\|!v\.controls\|\|!v\.error\|\|!v\.isConnected\|\|v\.id==='aovivo-video'/.test(lst.slice(0, 400)) && /\},true\);/.test(lst.slice(0, 600)), 'erro do <video> na captura (vale para todo player com controles, menos o ao vivo)');
ok(/\.video-falha\{position:absolute;inset:0;z-index:6;/.test(html), 'CSS do aviso (por cima da marca e do botão de tela cheia)');

if (falhas.length) { console.error('✗ Falhas na tela:'); falhas.forEach((f) => console.error('  - ' + f)); process.exit(1); }
console.log('✓ Falhas na tela: progresso que não salvou avisa e tenta de novo; videoaula que não carrega mostra "Tentar de novo"');
