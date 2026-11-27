'use strict';
// PODCASTS: EPISÓDIO OUVIDO (27/11/2026). Sugestão de uma aluna, repassada pelo professor: "deixar marcado como
// concluído no app na área de podcasts igual tem na parte de cursos e resumos".
// 🧨 Os modos de quebrar isto em silêncio:
//  - o botão marcar e, ao redesenhar, o aluno perder o áudio que estava tocando (o cartão é repintado no lugar);
//  - o ouvido não sincronizar entre aparelhos (chave pessoal fora do payload/PERSONAL_STATE_KEYS);
//  - o áudio marcar antes de 90% ou desmarcar sozinho;
//  - "Esconder os já ouvidos" sumir com a contagem da subespecialidade.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) { falhas.push('sumiu a função ' + nome); return ''; }
  let d = 0, j = html.indexOf('{', i);
  for (let k = j; k < html.length; k++) { if (html[k] === '{') d++; else if (html[k] === '}') { d--; if (!d) return html.slice(i + 1, k + 1); } }
  return '';
}
const vc = new VirtualConsole(); vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="pod-list"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
const salvo = { persist: 0, ls: {} };
ctx.__salvo = salvo;
vm.runInContext(`
  var DB={podOuvidos:{}},podFilter='',podPagina=0,renderizou=0;
  var podcasts=[
    {title:'Hipotireoidismo subclínico',area:'Tireoide',at:1700000000001,audio:'a.mp3'},
    {title:'Doença de Graves',area:'Tireoide',at:1700000000002,tipo:'spotify',src:'https://open.spotify.com/episode/abc'},
    {title:'Tirzepatida',area:'Obesidade',at:1700000000003,audio:'b.mp3'}
  ];
  function persist(){__salvo.persist++;}
  function lsGet(k){return __salvo.ls[k];}
  function lsSet(k,v){__salvo.ls[k]=v;}
  function podArea(p){return (p&&p.area)?p.area:'Miscelânea';}
  function renderPodcasts(){renderizou++;}
`, ctx);
vm.runInContext(html.match(/var POD_OUVIDO_PCT=0\.9,podOcultaOuvidos=!!lsGet\('pod_oculta_ouvidos'\),podOuvidoLigado=false;/)[0], ctx);
['podOuvidosMapa', 'podKey', 'podOuvido', 'podMarcaOuvido', 'podPorChave', 'podListaAtual', 'podProgHTML', 'podBotaoOuvidoHTML', 'podCardPinta', 'podOuvidoLigar', 'podAudioLigar']
  .forEach((n) => vm.runInContext(corpo(n), ctx));
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

// 1) chave estável pelo "at" (o título pode ser editado); sem "at", pelo título
ok(run('podKey(podcasts[0])') === 'a1700000000001' && run("podKey({title:'X'})") === 'tX', 'chave do episódio: pelo "at" e, sem ele, pelo título');
// 2) progresso
ok(/Nenhum episódio marcado como ouvido ainda/.test(run('podProgHTML()')), 'sem nada ouvido, a linha diz isso');
run('podMarcaOuvido(podcasts[0],true)');
ok(run('podOuvido(podcasts[0])') && salvo.persist === 1, 'marcar como ouvido grava (persist → sincroniza)');
ok(run('podMarcaOuvido(podcasts[0],true)') === false && salvo.persist === 1, 'marcar de novo não regrava');
ok(/Você ouviu <b>1 de 3<\/b> episódios/.test(run('podProgHTML()')), 'a linha conta os ouvidos da lista: ' + run('podProgHTML()'));
run("podFilter='Tireoide'");
ok(/1 de 2/.test(run('podProgHTML()')), 'com filtro, conta só a subespecialidade');
run("podMarcaOuvido(podcasts[1],true)");
ok(/todos os 2/.test(run('podProgHTML()')), 'tudo ouvido na subespecialidade: "todos os 2"');
run("podFilter='';podMarcaOuvido(podcasts[1],false)");
ok(!run('podOuvido(podcasts[1])'), 'desfazer tira a marca');
// 3) botão no cartão, repintado no lugar (sem redesenhar a lista)
const lista = doc.getElementById('pod-list');
lista.innerHTML = '<div id="pod-prog"></div><div class="card pod-card" data-pod-key="a1700000000003"><div class="pod-meta"><span class="tag">Obesidade</span></div><audio></audio>' + run('podBotaoOuvidoHTML(false)') + '</div>';
run('podOuvidoLigar()');
const card = lista.querySelector('[data-pod-key="a1700000000003"]');
const btn = card.querySelector('[data-pod-ouvido]');
ok(btn.textContent === 'Marcar como ouvido' && btn.className.indexOf('btn-primary') >= 0, 'botão "Marcar como ouvido" como o "Marcar como concluída" das aulas');
btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
ok(run('podOuvido(podcasts[2])') && card.classList.contains('pod-ouvido') && card.querySelector('.pod-ouvido-tag') && btn.textContent === '✓ Ouvido (desfazer)', '🧨 tocar no botão marca, mostra o selo "✓ Ouvido" e troca o botão');
ok(run('renderizou') === 0 && card.querySelector('audio'), '🧨 marcar NÃO redesenha a lista (o áudio que está tocando continua)');
ok(/Você ouviu <b>2 de 3<\/b>/.test(doc.getElementById('pod-prog').outerHTML), 'a linha de progresso é atualizada no lugar');
btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
ok(!run('podOuvido(podcasts[2])') && !card.querySelector('.pod-ouvido-tag') && btn.textContent === 'Marcar como ouvido', 'tocar de novo desfaz');
// 4) áudio do site: marca sozinho a partir de 90%, nunca antes, nunca desmarca
const a = card.querySelector('audio');
let dur = 1000, pos = 500;
Object.defineProperty(a, 'duration', { get: () => dur });
Object.defineProperty(a, 'currentTime', { get: () => pos });
run('podAudioLigar(document.getElementById("pod-list"))');
a.dispatchEvent(new dom.window.Event('timeupdate'));
ok(!run('podOuvido(podcasts[2])'), '🧨 com 50% ouvido, ainda não marca');
pos = 905; a.dispatchEvent(new dom.window.Event('timeupdate'));
ok(run('podOuvido(podcasts[2])') && card.querySelector('.pod-ouvido-tag'), '🧨 passou de 90% do áudio: marca como ouvido sozinho');
pos = 10; a.dispatchEvent(new dom.window.Event('timeupdate'));
ok(run('podOuvido(podcasts[2])'), 'voltar o áudio para o começo não desmarca');
dur = NaN; run('DB.podOuvidos={}'); a.dispatchEvent(new dom.window.Event('timeupdate'));
ok(!run('podOuvido(podcasts[2])'), 'sem duração conhecida (áudio ainda carregando), não marca');
// 5) "Esconder os já ouvidos"
lista.innerHTML = '<div id="pod-prog">' + run('podProgHTML()') + '</div>';
const cx = doc.getElementById('pod-oculta');
cx.checked = true; cx.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
ok(run('podOcultaOuvidos') === true && salvo.ls.pod_oculta_ouvidos === 1 && run('renderizou') === 1, 'marcar "Esconder os já ouvidos" guarda a escolha e redesenha a lista');

// 6) estático: lista, sincronização e Spotify
const pod = corpo('renderPodcasts');
ok(/var _ver=podOcultaOuvidos\?list\.filter\(function\(p\)\{return !podOuvido\(p\);\}\):list;/.test(pod) && /el\.innerHTML=podProgHTML\(\)\+/.test(pod), '"Esconder os já ouvidos" filtra a lista; a linha de progresso fica no topo');
ok(/data-pod-key="'\+esc\(podKey\(p\)\)\+'"/.test(pod) && /podBotaoOuvidoHTML\(_ok\)/.test(pod) && /podAudioLigar\(el\);/.test(pod), 'cada cartão tem a chave, o botão, e o áudio é ligado depois de desenhar');
ok(/var PERSONAL_STATE_KEYS=\[[^\]]*'podOuvidos'/.test(html), '🧨 podOuvidos tem de ser chave PESSOAL (sincroniza entre aparelhos e não vai para o estado geral)');
ok(/podOuvidos:DB\.podOuvidos,/.test(html) && /lsSet\('podOuvidos',DB\.podOuvidos\);/.test(corpo('persist')), 'podOuvidos vai para o servidor e fica no aparelho');
ok(/if\(payload\.podOuvidos&&typeof payload\.podOuvidos==='object'&&!Array\.isArray\(payload\.podOuvidos\)\)DB\.podOuvidos=payload\.podOuvidos;/.test(html), 'o estado do servidor aplica os ouvidos');
ok(/DB\.lidos=\{\};DB\.podOuvidos=\{\};\}catch\(e\)\{\}/.test(html), 'ao sair da conta, os ouvidos são limpos do aparelho');
ok(/if\(podOcultaOuvidos\)\{if\(podOuvido\(ep\)\)podOcultaOuvidos=false;else lista=lista\.filter\(function\(p\)\{return !podOuvido\(p\);\}\);\}/.test(corpo('podcastAbrirEpisodio')), '🧨 abrir um episódio pelo Mural com "Esconder os já ouvidos" ligado acha a página certa (e mostra o episódio mesmo se já ouvido)');
ok(/\.pod-ouvido-tag\{/.test(html) && /\.pod-prog \.pod-oculta\{/.test(html), 'CSS do selo e da opção de esconder');

if (falhas.length) { console.error('✗ podcasts ouvidos:\n  - ' + falhas.join('\n  - ')); process.exit(1); }
console.log('✓ Podcasts: "Marcar como ouvido" em cada episódio, marca sozinho a partir de 90% do áudio, sincroniza e esconde os já ouvidos');
