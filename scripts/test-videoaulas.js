// Videoaulas nos capítulos dos Resumos (02/11/2026), com o código RECORTADO do index.html.
//
// Pedido do professor: "Insira ao lado de 'Mapas mentais' o botão de 'Videoaulas'. Dentro dela,
// iremos inserir aos poucos pequenos vídeos (...) de no máx 15 min cada."
//
// O que este teste prende:
//   1. `videos` do item: [{titulo, src, dur?, path?, at}]; entrada sem `src` não conta;
//   2. o player: YouTube e Vimeo em iframe, .m3u8 (Bunny) em <video data-hls>, arquivo do Storage
//      em <video src>, link que não é http(s) não vira src, título e src escapados;
//   3. a duração em m:ss (o vídeo do rastreio do HAP tem 673 s = 11:13);
//   4. para o ALUNO a aba só aparece na aba Resumos (não nas Diretrizes nem nos artigos) e só
//      quando o capítulo tem vídeo; ao lado de "Mapas mentais", depois dele;
//   5. no PAINEL ela aparece em todo capítulo dos Resumos, para o professor adicionar;
//   6. o envio do painel usa o upload retomável em resumos/videos e pede confirmação acima de 15 min;
//   7. a renderização do aluno e a do painel montam o HLS.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
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

const NOMES = ['esc', 'safeHttpUrl', 'ytId', 'vimeoId', 'dirVideosDe', 'dirVideoDur', 'dirVideoPlayerHTML', 'dirVideoCabHTML', 'dirVideoLiberado', 'capsNormaliza', 'aulaCaps', 'capsFmt', 'aulaCapsHTML', 'dirVideoCapsHTML', 'dirVideoItemHTML', 'dirVideosHTML'];
const ctx = { String, Math, Array };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n') + "\nvar refVideoAberto='';", ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', typeof ctx[f] === 'function'));

// ---- 1. o campo videos ---------------------------------------------------------------------
const MP4 = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/resumos/videos/2026-11-02/1793663784222-rastreio-hiperaldosteronismo-primario.mp4';
const cap = { tema: 'Hiperaldosteronismo Primário', videos: [{ titulo: 'Rastreio do hiperaldosteronismo primário', src: MP4, dur: 673, at: 1 }, { titulo: 'sem src' }, null, { titulo: 'vazio', src: '' }] };
ok('dirVideosDe só conta as entradas com src', ctx.dirVideosDe(cap).length === 1);
ok('dirVideosDe aceita item sem videos', ctx.dirVideosDe({}).length === 0 && ctx.dirVideosDe(null).length === 0 && ctx.dirVideosDe({ videos: 'x' }).length === 0);

// ---- 2. o player ---------------------------------------------------------------------------
const pMp4 = ctx.dirVideoPlayerHTML(cap.videos[0]);
ok('arquivo do Storage vira <video controls> com src', /^<video controls playsinline preload="metadata" src="https:\/\/eutizblmrcypzyqzczgq\.supabase\.co\/storage\/v1\/object\/public\/endodirect-assets\/resumos\/videos\//.test(pMp4), pMp4);
ok('arquivo do Storage ganha #t=0.1 (1º quadro no iPhone)', pMp4.indexOf('.mp4#t=0.1"') > 0, pMp4);
ok('link que já tem # fica como está', ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'https://x.com/v.mp4#t=5' }).indexOf('v.mp4#t=5"') > 0);
const pYt = ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'https://www.youtube.com/watch?v=abcdEFGH123' });
ok('YouTube vira iframe de embed', pYt.indexOf('<iframe') === 0 && pYt.indexOf('https://www.youtube.com/embed/abcdEFGH123') > 0, pYt);
const pVm = ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'https://vimeo.com/123456789' });
ok('Vimeo vira iframe do player', pVm.indexOf('https://player.vimeo.com/video/123456789') > 0, pVm);
const pHls = ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'https://vz-123.b-cdn.net/abc/playlist.m3u8' });
ok('.m3u8 do Bunny vai em data-hls, sem src', /data-hls="https:\/\/vz-123\.b-cdn\.net\/abc\/playlist\.m3u8"/.test(pHls) && !/ src=/.test(pHls), pHls);
const pJs = ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'javascript:alert(1)' });
ok('link que não é http(s) não vira player', pJs.indexOf('<video') < 0 && pJs.indexOf('<iframe') < 0 && pJs.indexOf('javascript:') < 0 && /inválido/.test(pJs), pJs);
const pAspas = ctx.dirVideoPlayerHTML({ titulo: 'A', src: 'https://x.com/v.mp4" onerror="alert(1)' });
ok('src com aspas sai escapado', pAspas.indexOf('" onerror=') < 0 && pAspas.indexOf('&quot; onerror=') > 0, pAspas);
const pTit = ctx.dirVideoPlayerHTML({ titulo: '<b>x</b>', src: 'https://youtu.be/abcdEFGH123' });
ok('título do iframe sai escapado', pTit.indexOf('<b>') < 0 && pTit.indexOf('&lt;b&gt;') > 0, pTit);

// ---- 3. duração e cabeçalho ----------------------------------------------------------------
ok('673 s → 11:13', ctx.dirVideoDur(673) === '11:13', ctx.dirVideoDur(673));
ok('65 s → 1:05', ctx.dirVideoDur(65) === '1:05');
ok('sem duração → vazio', ctx.dirVideoDur(0) === '' && ctx.dirVideoDur(undefined) === '' && ctx.dirVideoDur('x') === '');
const cab = ctx.dirVideoCabHTML(cap.videos[0]);
ok('cabeçalho com título e duração', cab.indexOf('Rastreio do hiperaldosteronismo primário') > 0 && cab.indexOf('11:13') > 0, cab);
ok('cabeçalho sem duração não mostra o selo', ctx.dirVideoCabHTML({ titulo: 'A', src: MP4 }).indexOf('dir-video-dur') < 0);
ok('capítulo sem vídeo: mensagem, sem player', /ainda não disponíveis/.test(ctx.dirVideosHTML({})) && ctx.dirVideosHTML({}).indexOf('<video') < 0);
ok('capítulo com vídeo: um bloco por vídeo válido', (ctx.dirVideosHTML(cap).match(/class="dir-video"/g) || []).length === 1);

// ---- 4. a aba do aluno ---------------------------------------------------------------------
const view = extrai('diretrizesViewHTML');
ok('aluno: aba só nos Resumos, fora dos artigos e só com vídeo', /var _temVideo=refPrivadoMode&&!_ehArtigo&&list\.some\(function\(x\)\{return _vidsDe\(x\.d\)\.length>0;\}\);/.test(view) && view.indexOf('var _vidsDe=function(d){var v=dirVideosDe(d);return _degFmt?v.filter(dirVideoLiberado):v;};') > 0);
ok('aluno: sem vídeo, o formato volta para o resumo', view.indexOf("if(refFormat==='video'&&!_temVideo)refFormat='resumo';") > 0);
ok('aluno: o botão entra depois de Mapas mentais', /\['mapa','🧠 Mapas mentais'\]\];\s*if\(_temVideo\|\|_vidTrancado\)fmts\.push\(\['video','🎬 Videoaulas'\]\);/.test(view));
ok('aluno: a aba de vídeo fica ativa quando escolhida', view.indexOf("refFormat==='video')?refFormat:'resumo'") > 0);
ok('degustação: o aviso cita as videoaulas quando o capítulo só tem vídeo trancado', /_vidTrancado\?'<b>Flashcards<\/b>, <b>mapas mentais<\/b> e <b>videoaulas<\/b>'/.test(view));
const card = extrai('dirCardHTML');
ok('o card mostra as videoaulas no formato video', card.indexOf("}else if(refFormat==='video'){\n    body=dirVideosHTML(d,refVideoSoLiberado);") > 0);

// ---- 5. o painel ---------------------------------------------------------------------------
const adm = extrai('admRefSecHTML');
ok('painel: aba em todo capítulo dos Resumos (fora dos artigos)', adm.indexOf("var _vidOk=(admRefMode==='res'&&!_fmtArt);") > 0 && adm.indexOf("if(_vidOk)fmts.push(['video','🎬 Videoaulas']);") > 0);
ok('painel: o formato video abre o editor de videoaulas', adm.indexOf("fmtAtivo==='video'?admRefVideoHTML(x.d,x.i)") > 0);
ok('painel: o editor do resumo só abre no formato resumo', adm.indexOf("var isResumo=(fmtAtivo==='resumo');") > 0);
const ed = extrai('admRefVideoHTML');
['data-advid-add', 'data-advid-save', 'data-advid-del', 'data-advid-mv', 'adm-vid-file-', 'adm-vid-link-', 'adm-vid-titulo-', 'adm-vid-prog-'].forEach((k) =>
  ok('painel: o editor tem ' + k, ed.indexOf(k) > 0));
const bind = extrai('bindAdmSec');
['[data-advid-add]', '[data-advid-save]', '[data-advid-del]', '[data-advid-mv]'].forEach((k) => ok('painel: ' + k + ' está ligado', bind.indexOf(k) > 0));

// ---- 6. o envio ----------------------------------------------------------------------------
const add = extrai('admAddRefVideo');
ok('envio: upload retomável em resumos/videos', add.indexOf("uploadAdminAssetResumable(arq,'resumos/videos',") > 0);
ok('envio: confirmação acima de 15 min', add.indexOf('if(dur>15*60+5&&!confirm(') > 0);
ok('envio: título obrigatório', add.indexOf("if(!titulo){notify('Dê um título à videoaula.','err');return;}") > 0);
ok('envio: grava título, src, duração, caminho e data', add.indexOf('grava({titulo:titulo,src:up.url,dur:isFinite(dur)?Math.round(dur):undefined,path:up.path,at:Date.now()})') > 0);
ok('envio: link precisa ser Bunny, YouTube ou Vimeo (http)', add.indexOf('if(!(ytId(link)||vimeoId(link)||safeHttpUrl(link)))') > 0);
ok('envio: grava pelo persistDiretrizes', /d\.videos\.push\(v\);persistDiretrizes\(\);/.test(add));

// ---- 7. HLS --------------------------------------------------------------------------------
ok('aluno: renderDiretrizesInto monta o HLS', /function renderDiretrizesInto\(root\)\{[^\n]*montarVideosHls\(root\);\}/.test(SRC));
ok('painel: bindAdmSec monta o HLS', bind.indexOf('montarVideosHls(main);') > 0);
const hls = extrai('montarVideosHls');
ok('HLS: Safari nativo, hls.js nos outros, até 20 tentativas', hls.indexOf("canPlayType('application/vnd.apple.mpegurl')") > 0 && hls.indexOf('window.Hls.isSupported()') > 0 && hls.indexOf('(tent||0)<20') > 0);

if (bad) { console.log('\n' + bad + ' falha(s) nas videoaulas'); process.exit(1); }
console.log('videoaulas: ok');
