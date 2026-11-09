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
const NOMES = ['esc', 'safeHttpUrl', 'ytId', 'vimeoId', 'dirVideosDe', 'dirVideoDur', 'dirVideoPlayerHTML', 'dirVideoCabHTML',
  'dirVideoLiberado', 'capsNormaliza', 'aulaCaps', 'capsFmt', 'aulaCapsHTML', 'dirVideoCapsHTML', 'dirVideosHTML',
  'capSegundos', 'capsParse', 'capsTexto', 'admRefVideoAcao'];
const avisos = [];
const ctx = { avisos };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n')
  + '\nvar diretrizes=[];var salvou=0;function persistDiretrizes(){salvou++;}function rerenderRef(){}'
  + 'function notify(m,t){avisos.push([t,m]);}function confirm(){return true;}'
  + 'var __campos={};var document={getElementById:function(id){return __campos[id]?{value:__campos[id]}:null;}};', ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', vm.runInContext('typeof ' + f, ctx) === 'function'));
const run = (c) => vm.runInContext(c, ctx);

const MP4 = 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/resumos/videos/x/lpa.mp4';
run(`var cap={videos:[{titulo:'Lipoproteína (a)',src:'${MP4}',dur:849,caps:[{t:111,titulo:'Por que importa'},{t:44,titulo:'O que é a Lp(a)'},{t:771,titulo:'Mensagens para a prática'}]},{titulo:'Sem capítulos',src:'${MP4}'},{titulo:'YouTube',src:'https://www.youtube.com/watch?v=abcdefghijk',caps:[{t:10,titulo:'X'}]}]};`);
const html = run('dirVideosHTML(cap,false)');
const cartoes = html.split('<div class="dir-video">').slice(1);
ok('três cartões', cartoes.length === 3, String(cartoes.length));
ok('cartão com capítulos: bloco "Nesta aula" dentro do cartão do vídeo', /<div class="aula-caps"><div class="aula-caps-lbl">Nesta aula<\/div>/.test(cartoes[0]));
const ordem = [...cartoes[0].matchAll(/data-cap="(\d+)"/g)].map((m) => +m[1]);
ok('capítulos em ordem de tempo', JSON.stringify(ordem) === '[44,111,771]', JSON.stringify(ordem));
ok('minuto no formato da EMC', /<span class="aula-cap-h">00:44<\/span>/.test(cartoes[0]) && /<span class="aula-cap-h">12:51<\/span>/.test(cartoes[0]));
ok('número do tópico', /<span class="aula-cap-n">01<\/span><span class="aula-cap-t">O que é a Lp\(a\)<\/span>/.test(cartoes[0]));
ok('vídeo sem capítulos não ganha bloco vazio', cartoes[1].indexOf('aula-caps') < 0);
ok('YouTube não mostra capítulos (o iframe não deixa saltar)', cartoes[2].indexOf('aula-caps') < 0);
ok('mesma função de capítulos da EMC (aulaCapsHTML)', /return aulaCapsHTML\(v\);/.test(extrai('dirVideoCapsHTML')));
ok('degustação: o vídeo liberado leva os capítulos junto',
  /Nesta aula/.test(run(`dirVideosHTML({videos:[{titulo:'A',src:'${MP4}',degustacao:true,caps:[{t:5,titulo:'Início'}]}],videos_total:3},true)`)));

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
