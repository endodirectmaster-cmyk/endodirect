// CAPÍTULOS NAS VIDEOAULAS DOS RESUMOS (09/11/2026).
//
// Pedido do professor: "Nas videoaulas que estão contidas nos resumos, deixa do modo igual a
// da educação médica continuada, com a minutagem em tópicos. Já faz isso nas videoaulas que
// já estão lá nos resumos e, consequentemente, também as próximas (...). Coloca isso como uma
// skill sua."
//
// O que este teste prende:
//   1. o cartão do vídeo mostra "Nesta aula" com número, título e minuto, igual ao da EMC;
//   2. o toque salta o vídeo DO MESMO CARTÃO (um capítulo pode ter sete vídeos) e o tópico em
//      curso acende enquanto o vídeo toca;
//   3. no painel, cada vídeo tem o campo de capítulos e o botão que grava;
//   4. a skill existe, com o script que lê os slides e as regras de gravação.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

function extrai(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let nivel = 0;
  for (let k = SRC.indexOf('{', i); k < SRC.length; k++) {
    if (SRC[k] === '{') nivel++;
    else if (SRC[k] === '}') { nivel--; if (!nivel) return SRC.slice(i, k + 1); }
  }
  return '';
}

// ---- 1. a tela do aluno ----------------------------------------------------------------
// Desde 09/11/2026 (pedido do professor: "Não deixar todas as videoaulas abertas de uma vez
// só (...) deixa uma subjanela onde ele vai escolher"), capítulo com 2+ vídeos mostra a LISTA,
// e só o escolhido (refVideoAberto = src) vira player, com os tópicos embaixo.
const NOMES = ['esc', 'safeHttpUrl', 'ytId', 'vimeoId', 'dirVideosDe', 'dirVideoDur', 'dirVideoPlayerHTML', 'dirVideoCabHTML',
  'dirVideoLiberado', 'capsNormaliza', 'aulaCaps', 'capsFmt', 'aulaCapsHTML', 'dirVideoCapsHTML', 'dirVideoItemHTML', 'dirVideosHTML',
  'capSegundos', 'capsParse', 'capsTexto', 'admRefVideoAcao'];
const avisos = [];
const ctx = { avisos };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n')
  + "\nvar diretrizes=[];var salvou=0;var refVideoAberto='';function persistDiretrizes(){salvou++;}function rerenderRef(){}"
  + 'function notify(m,t){avisos.push([t,m]);}function confirm(){return true;}'
  + 'var __campos={};var document={getElementById:function(id){return __campos[id]?{value:__campos[id]}:null;}};', ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', vm.runInContext('typeof ' + f, ctx) === 'function'));
const run = (c) => vm.runInContext(c, ctx);

const MP4 = 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/resumos/videos/x/lpa.mp4';
const MP4B = MP4.replace('lpa', 'outro');
const YT = 'https://www.youtube.com/watch?v=abcdefghijk';
run(`var cap={videos:[{titulo:'Lipoproteína (a)',src:'${MP4}',dur:849,caps:[{t:111,titulo:'Por que importa'},{t:44,titulo:'O que é a Lp(a)'},{t:771,titulo:'Mensagens para a prática'}]},{titulo:'Sem capítulos',src:'${MP4B}'},{titulo:'YouTube',src:'${YT}',caps:[{t:10,titulo:'X'}]}]};`);

// 1a. nada aberto: a lista
const lista = run(`refVideoAberto='';dirVideosHTML(cap,false)`);
ok('lista: nenhum player carregado de uma vez', lista.indexOf('<video') < 0 && lista.indexOf('<iframe') < 0, lista);
ok('lista: um item por vídeo, com o src para abrir', (lista.match(/data-dir-vidabre="/g) || []).length === 3 && lista.indexOf(`data-dir-vidabre="${MP4}"`) > 0);
ok('lista: rótulo com a quantidade', /<div class="dir-vid-lbl">3 videoaulas · escolha uma para assistir<\/div>/.test(lista));
ok('lista: duração e quantidade de tópicos no item', /<span class="dir-vid-nome">Lipoproteína \(a\)<\/span><span class="dir-vid-meta">14:09 · 3 tópicos<\/span>/.test(lista), lista);
ok('lista: sem duração nem tópicos, o item fica só com o nome', /<span class="dir-vid-nome">Sem capítulos<\/span><\/span>/.test(lista));
ok('lista: YouTube não anuncia tópicos que não vai mostrar', !/YouTube<\/span><span class="dir-vid-meta">/.test(lista));
ok('lista: src com aspas sai escapado', run(`dirVideoItemHTML({titulo:'A',src:'https://x.com/a.mp4" onclick="x'})`).indexOf('" onclick=') < 0);

// 1b. escolhido: só ele, com os tópicos e a volta
const aberto = run(`refVideoAberto='${MP4}';dirVideosHTML(cap,false)`);
const cartoes = aberto.split('<div class="dir-video">').slice(1);
ok('aberto: um só player, o escolhido', cartoes.length === 1 && (aberto.match(/<video/g) || []).length === 1 && aberto.indexOf('Sem capítulos') < 0, aberto);
ok('aberto: a volta à lista em cima, com a quantidade', /^<div class="dir-videos"><button type="button" class="dir-back dir-vid-volta" data-dir-vidvolta>← Videoaulas do capítulo \(3\)<\/button><div class="dir-video">/.test(aberto));
ok('aberto: bloco "Nesta aula" dentro do cartão do vídeo', /<div class="aula-caps"><div class="aula-caps-lbl">Nesta aula<\/div>/.test(cartoes[0]));
const ordem = [...cartoes[0].matchAll(/data-cap="(\d+)"/g)].map((m) => +m[1]);
ok('capítulos em ordem de tempo', JSON.stringify(ordem) === '[44,111,771]', JSON.stringify(ordem));
ok('minuto no formato da EMC', /<span class="aula-cap-h">00:44<\/span>/.test(cartoes[0]) && /<span class="aula-cap-h">12:51<\/span>/.test(cartoes[0]));
ok('número do tópico', /<span class="aula-cap-n">01<\/span><span class="aula-cap-t">O que é a Lp\(a\)<\/span>/.test(cartoes[0]));
ok('vídeo sem capítulos não ganha bloco vazio', run(`refVideoAberto='${MP4B}';dirVideosHTML(cap,false)`).indexOf('aula-caps') < 0);
ok('YouTube não mostra capítulos (o iframe não deixa saltar)', run(`refVideoAberto='${YT}';dirVideosHTML(cap,false)`).indexOf('aula-caps') < 0);
ok('src aberto que não é deste capítulo: mostra a lista', run(`refVideoAberto='https://x.com/de-outro-capitulo.mp4';dirVideosHTML(cap,false)`).indexOf('<video') < 0);
ok('mesma função de capítulos da EMC (aulaCapsHTML)', /return aulaCapsHTML\(v\);/.test(extrai('dirVideoCapsHTML')));

// 1c. um vídeo só: não há o que escolher
const um = run(`refVideoAberto='';dirVideosHTML({videos:[cap.videos[0]]},false)`);
ok('um vídeo só: abre direto, sem lista e sem volta', (um.match(/<video/g) || []).length === 1 && um.indexOf('data-dir-vidabre') < 0 && um.indexOf('data-dir-vidvolta') < 0 && /Nesta aula/.test(um));
ok('degustação: o vídeo liberado abre direto, com os capítulos',
  /Nesta aula/.test(run(`refVideoAberto='';dirVideosHTML({videos:[{titulo:'A',src:'${MP4}',degustacao:true,caps:[{t:5,titulo:'Início'}]}],videos_total:3},true)`)));

// 1d. os toques que abrem, voltam e zeram
const bind = extrai('bindDiretrizesView');
ok('tocar no item abre aquele vídeo e redesenha', /\[data-dir-vidabre\][\s\S]{0,120}refVideoAberto=b\.getAttribute\('data-dir-vidabre'\)\|\|'';renderDiretrizesInto\(root\);_vidRola\('\[data-dir-vidvolta\]'\);/.test(bind));
ok('a volta devolve a lista', /vvolta\.addEventListener\('click',function\(\)\{refVideoAberto='';renderDiretrizesInto\(root\);_vidRola\('\.dir-vid-lista'\);\}\)/.test(bind));
['data-dir-sub', 'data-dir-tema', 'data-dir-fmt', 'data-dir-tipo'].forEach((a) => {
  const i = bind.indexOf("querySelectorAll('[" + a + "]')");
  ok('trocar de ' + a.replace('data-dir-', '') + ' fecha o vídeo aberto', i > 0 && bind.slice(i, i + 260).indexOf("refVideoAberto='';") > 0);
});
ok('voltar à grade ou aos temas fecha o vídeo aberto',
  /back\.addEventListener\('click',function\(\)\{refSubSel='';refTemaSel='';refTipoSel='capitulo';refVideoAberto='';/.test(bind)
  && /tback\.addEventListener\('click',function\(\)\{refTemaSel='';refVideoAberto='';/.test(bind));
ok('entrar em Resumos/Diretrizes começa pela lista', (SRC.match(/refTipoSel='capitulo';refFlashOpen=\{\};refVideoAberto='';/g) || []).length >= 2);
ok('CSS: lista e volta descontam o topo fixo ao rolar', /\.dir-vid-lista\{[^}]*scroll-margin-top:90px/.test(SRC) && /\.dir-vid-volta\{[^}]*scroll-margin-top:90px/.test(SRC));

// ---- 2. o toque e o tópico aceso ------------------------------------------------------------
const cliq = SRC.slice(SRC.indexOf("document.addEventListener('click',function(e){\n  var t=e.target;"), SRC.indexOf('// questões', SRC.indexOf("document.addEventListener('click',function(e){\n  var t=e.target;")));
ok('clique no capítulo: acha o cartão e salta o vídeo dele',
  /var dvc=c\('\.dir-video \.aula-cap'\);/.test(cliq) && /dvb=dvc\.closest\('\.dir-video'\)/.test(cliq) && /aulaSeek\(dvb&&dvb\.querySelector\('video'\),dvt\)/.test(cliq) && /aulaCapAtivo\(dvb,dvt\);return;/.test(cliq));
ok('tópico em curso acende: timeupdate escutado na captura (não borbulha)',
  /document\.addEventListener\('timeupdate',function\(e\)\{[\s\S]{0,160}v\.closest\('\.dir-video'\)[\s\S]{0,80}aulaCapAtivo\(b,v\.currentTime\);\s*\},true\);/.test(SRC));
ok('o player da EMC continua com a sua ligação própria', /if\(curAulaTab==='aula'\)\{montarAulaHls\(box\);ligarAulaCaps\(box\);\}/.test(SRC));
ok('CSS: capítulos com respiro dentro do cartão', /\.dir-video \.aula-caps\{margin:0;padding:/.test(SRC));

// ---- 3. o painel ----------------------------------------------------------------------------
const ed = extrai('admRefVideoHTML');
ok('painel: o professor vê os capítulos no vídeo', /dirVideoCabHTML\(v\)\+dirVideoCapsHTML\(v\)/.test(ed));
ok('painel: campo com os capítulos atuais, uma linha cada', /<textarea id="adm-vid-caps-'\+i\+'-'\+j\+'"[^>]*>'\+esc\(capsTexto\(v\.caps\)\)\+'<\/textarea>/.test(ed));
ok('painel: botão de salvar ligado', /data-advid-caps="'\+i\+'-'\+j\+'"/.test(ed) && extrai('bindAdmSec').indexOf("admRefVideoAcao('caps',b.dataset.advidCaps)") > 0);
run(`diretrizes=[{sub:'Lípides',videos:[{titulo:'Lp(a)',src:'${MP4}'}]}];__campos['adm-vid-caps-0-0']='1  00:00:44 to 00:01:51  O que é a Lp(a)\\n01:52 Por que importa';admRefVideoAcao('caps','0-0');`);
ok('salvar: aceita o formato do Bunny e o curto, grava em segundos', run('JSON.stringify(diretrizes[0].videos[0].caps)') === '[{"t":44,"titulo":"O que é a Lp(a)"},{"t":112,"titulo":"Por que importa"}]', run('JSON.stringify(diretrizes[0].videos[0].caps)'));
ok('salvar: persiste', run('salvou') === 1);
run(`__campos['adm-vid-caps-0-0']='sem horário nenhum';salvou=0;admRefVideoAcao('caps','0-0');`);
ok('texto sem capítulo reconhecível: recusa e não apaga os que havia', run('salvou') === 0 && run('diretrizes[0].videos[0].caps.length') === 2 && run('avisos[avisos.length-1][0]') === 'err');
run(`__campos['adm-vid-caps-0-0']='';admRefVideoAcao('caps','0-0');`);
ok('campo vazio: tira os capítulos', run('diretrizes[0].videos[0].caps') === undefined && run('salvou') === 1);

// ---- 4. a skill -----------------------------------------------------------------------------
const SK = path.join(RAIZ, '.claude', 'skills', 'capitulos-videoaula');
const skill = fs.existsSync(path.join(SK, 'SKILL.md')) ? fs.readFileSync(path.join(SK, 'SKILL.md'), 'utf8') : '';
ok('skill: SKILL.md com nome e descrição', /^---\nname: capitulos-videoaula\ndescription: .+\n---/.test(skill));
ok('skill: cobre Resumos e EMC', /diretrizes\[i\]\.videos\[j\]\.caps/.test(skill) && /adm_cursos\[k\]\.caps/.test(skill));
ok('skill: backup e guarda antes de gravar', /endodirect_global_state_backup/.test(skill) && /confere o `src` e o `titulo`/.test(skill));
const sh = fs.existsSync(path.join(SK, 'slides.sh')) ? fs.readFileSync(path.join(SK, 'slides.sh'), 'utf8') : '';
ok('script: baixa por curl (o ffmpeg não passa pelo proxy) e manda o Referer ao Bunny', /curl -sS -H "Referer: \$REF"/.test(sh) && /curl -sS -L "\$URL"/.test(sh));
ok('script: corte de cena baixo e tesseract com OMP_THREAD_LIMIT=1', /gt\(scene\\,0\.004\)/.test(sh) && /OMP_THREAD_LIMIT=1 xargs/.test(sh) && /-l por/.test(sh));
ok('script: os auxiliares estão lá', ['tabela.py', 'agrupa.py', 'cabecalho.py'].every((f) => fs.existsSync(path.join(SK, f))));

if (bad) { console.log('\n' + bad + ' falha(s) nos capítulos das videoaulas dos Resumos'); process.exit(1); }
console.log('capítulos das videoaulas dos Resumos: ok');
