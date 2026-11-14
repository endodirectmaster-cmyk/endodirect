// Videoaulas na degustação: UMA por subespecialidade (07/11/2026), com o código RECORTADO do index.html.
//
// Pedido do professor: "Para o pessoal do plano Gold, obviamente, eles terão acesso a todas essas
// videoaulas. (...) Para o pessoal do modo degustação, a ideia é que eles tenham acesso a uma
// videoaula de cada subespecialidade."
//
// O que este teste prende:
//   1. na degustação, a aba Videoaulas mostra só o vídeo liberado (`degustacao:true`) e diz quantos
//      faltam para assinantes (`videos_total` vindo do servidor ou os vídeos do próprio item);
//   2. a videoaula liberada de cada área é achada no capítulo-amostra OU no item "só de vídeo", e
//      nunca em artigo, rascunho ou item público;
//   3. o item "só de vídeo" (`so_video`) sai da lista de capítulos (não vira tema, nem contagem);
//   4. no painel, liberar um vídeo desmarca o que estava liberado NA MESMA subespecialidade (e só
//      nela), e clicar de novo tira da degustação;
//   5. a tela do aluno: a grade avisa a área com vídeo liberado, a lista de temas mostra o player
//      e, no capítulo, a aba de vídeo só abre com o vídeo liberado (os outros, com cadeado);
//   6. o .sql: quem tem plano recebe tudo como antes; sem plano, `videos` reduzido ao liberado, um
//      por subespecialidade, e o item só de vídeo sem resumo, flashcards nem mapa.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const SQL = fs.readFileSync(path.join(RAIZ, 'supabase', 'videoaulas-degustacao.sql'), 'utf8');
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

const NOMES = ['esc', 'safeHttpUrl', 'ytId', 'vimeoId', 'dirVideosDe', 'dirVideoDur', 'dirVideoPlayerHTML', 'dirVideoCabHTML',
  'dirVideoLiberado', 'dirVideosHTML', 'dirVideoAmostraDaSub', 'separarSoVideo', 'dirTipoOf', 'dirIsRascunho', 'dirTemaOf',
  'admVideoLiberadoDaSub', 'admRefVideoAcao', 'capsNormaliza', 'aulaCaps', 'capsFmt', 'aulaCapsHTML', 'dirVideoCapsHTML', 'dirVideoItemHTML'];
const avisos = [];
const ctx = { String, Math, Array, Object, avisos };
vm.createContext(ctx);
vm.runInContext(NOMES.map(extrai).join('\n')
  + "\nvar diretrizes=[];var dirVideosAmostra=[];var salvou=0;var refVideoAberto='';"
  + 'function persistDiretrizes(){salvou++;}function rerenderRef(){}function notify(m){avisos.push(m);}function confirm(){return true;}'
  + 'this.__set=function(d,a){diretrizes=d;dirVideosAmostra=a||[];};this.__get=function(){return {diretrizes:diretrizes,amostra:dirVideosAmostra,salvou:salvou};};', ctx);
NOMES.forEach((f) => ok(f + ' foi extraída', typeof ctx[f] === 'function'));

const MP4 = (n) => 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/resumos/videos/' + n + '.mp4';
const V = (t, deg) => Object.assign({ titulo: t, src: MP4(t.replace(/\W+/g, '-')), dur: 600, at: 1 }, deg ? { degustacao: true } : {});

// ---- 1. a aba Videoaulas na degustação -------------------------------------------------------
{
  const cap = { tema: 'T', videos: [V('Liberado', true), V('Outro A'), V('Outro B')] };
  const html = ctx.dirVideosHTML(cap, true);
  ok('degustação: só o vídeo liberado vira player', (html.match(/class="dir-video"/g) || []).length === 1 && html.indexOf('Liberado') > 0 && html.indexOf('Outro A') < 0, html);
  ok('degustação: avisa os outros 2, para assinantes', /Mais 2 videoaulas neste capítulo, para assinantes/.test(html), html);
  const assin = ctx.dirVideosHTML(cap, false);
  // Desde 09/11/2026 o assinante escolhe numa lista (um vídeo aberto por vez).
  ok('assinante: os 3 vídeos na lista de escolha, sem aviso', (assin.match(/data-dir-vidabre=/g) || []).length === 3 && assin.indexOf('<video') < 0 && assin.indexOf('para assinantes') < 0, assin);
  // Como chega do servidor: só o liberado em `videos`, e o total à parte.
  const doServidor = { tema: 'T', videos: [V('Liberado', true)], videos_total: 4 };
  ok('degustação: usa o videos_total do servidor', /Mais 3 videoaulas/.test(ctx.dirVideosHTML(doServidor, true)));
  const semLiberado = { tema: 'T', videos: [], videos_total: 1 };
  const h2 = ctx.dirVideosHTML(semLiberado, true);
  ok('degustação: capítulo sem vídeo liberado mostra só o cadeado', h2.indexOf('<video') < 0 && /1 videoaula neste capítulo, para assinantes/.test(h2) && h2.indexOf('Mais ') < 0, h2);
  ok('degustação: sem vídeo nenhum, a mensagem de sempre', /ainda não disponíveis/.test(ctx.dirVideosHTML({ videos: [] }, true)));
}

// ---- 2. a videoaula liberada de cada área ----------------------------------------------------
{
  const amostra = { sub: 'Adrenal', tema: 'Carcinoma Adrenocortical', privado: true, videos: [V('CAC', true)] };
  const so = { sub: 'Obesidade', tema: 'Obesidade: Avaliação Clínica e Diagnóstico', privado: true, tipo: 'capitulo', so_video: true, videos: [V('Clínica x pré-clínica', true)] };
  const artigo = { sub: 'Lípides', tema: '4S', privado: true, tipo: 'artigo', videos: [V('No artigo', true)] };
  const rasc = { sub: 'Tireoide', tema: 'X', privado: true, rascunho: true, videos: [V('Rascunho', true)] };
  const publica = { sub: 'Diabetes', tema: 'ADA', privado: false, videos: [V('Público', true)] };
  const naoLib = { sub: 'Neuroendocrinologia', tema: 'Acromegalia', privado: true, videos: [V('Não liberado')] };
  ctx.__set([amostra, artigo, rasc, publica, naoLib], [so]);
  const a = ctx.dirVideoAmostraDaSub('Adrenal');
  ok('acha o vídeo liberado no capítulo-amostra', a && a.v.titulo === 'CAC' && a.tema === 'Carcinoma Adrenocortical', JSON.stringify(a));
  const o = ctx.dirVideoAmostraDaSub('Obesidade');
  ok('acha o vídeo liberado no item só de vídeo', o && o.v.titulo === 'Clínica x pré-clínica' && o.tema === 'Obesidade: Avaliação Clínica e Diagnóstico', JSON.stringify(o));
  ok('artigo, rascunho, item público e vídeo não liberado não contam',
    ctx.dirVideoAmostraDaSub('Lípides') === null && ctx.dirVideoAmostraDaSub('Tireoide') === null && ctx.dirVideoAmostraDaSub('Diabetes') === null && ctx.dirVideoAmostraDaSub('Neuroendocrinologia') === null);
}

// ---- 3. o item só de vídeo sai da lista de capítulos -----------------------------------------
{
  const lista = [{ tema: 'A', sub: 'Adrenal' }, { tema: 'B', sub: 'Obesidade', so_video: true, videos: [] }, null, { tema: 'C', sub: 'Lípides' }];
  const caps = ctx.separarSoVideo(lista);
  ok('separarSoVideo: capítulos ficam, só de vídeo sai', caps.length === 3 && caps.every((d) => !d || !d.so_video));
  ok('separarSoVideo: o só de vídeo vai para dirVideosAmostra', ctx.__get().amostra.length === 1 && ctx.__get().amostra[0].tema === 'B');
  const ap = extrai('aplicarResumos');
  ok('aplicarResumos: migra a subespecialidade antes de separar e não apaga com lista só de vídeo',
    /lista\.forEach\(function\(d\)\{if\(d&&d\.sub\)d\.sub=dirMigrateSub\(d\.sub\);\}\);\s*var caps=separarSoVideo\(lista\);\s*if\(!caps\.length\)return;\s*diretrizes=caps;/.test(ap), ap);
  ok('tentarResumos: usa a mesma aplicação', /aplicarResumos\(r2\.data\.diretrizes\)/.test(extrai('tentarResumos')));
}

// ---- 4. o painel: uma por subespecialidade ---------------------------------------------------
{
  const c1 = { sub: 'Obesidade', tema: 'Avaliação', privado: true, videos: [V('Clínica', true)] };
  const c2 = { sub: 'Obesidade', tema: 'Farmacológico', privado: true, videos: [V('GLP-1'), V('Sibutramina')] };
  const c3 = { sub: 'Adrenal', tema: 'HAP', privado: true, videos: [V('Rastreio', true)] };
  ctx.__set([c1, c2, c3]);
  ctx.admRefVideoAcao('deg', '1-1');
  ok('painel: liberar a Sibutramina desmarca a Clínica (mesma área)', c2.videos[1].degustacao === true && !c1.videos[0].degustacao && !c2.videos[0].degustacao);
  ok('painel: a outra área fica como estava', c3.videos[0].degustacao === true);
  ok('painel: grava pelo persistDiretrizes', ctx.__get().salvou === 1);
  const lib = ctx.admVideoLiberadoDaSub('Obesidade');
  ok('painel: o aviso do topo mostra a liberada da área', lib && lib.v.titulo === 'Sibutramina' && lib.tema === 'Farmacológico', JSON.stringify(lib));
  ctx.admRefVideoAcao('deg', '1-1');
  ok('painel: clicar de novo tira da degustação', !c2.videos[1].degustacao && ctx.admVideoLiberadoDaSub('Obesidade') === null && c3.videos[0].degustacao === true);
  const ed = extrai('admRefVideoHTML');
  ok('painel: botão 🎁 Liberar na degustação em cada vídeo, e o selo', ed.indexOf('data-advid-deg="') > 0 && ed.indexOf('🎁 Liberar na degustação') > 0 && ed.indexOf('🎁 Liberada na degustação') > 0);
  ok('painel: o botão está ligado', extrai('bindAdmSec').indexOf("admRefVideoAcao('deg',b.dataset.advidDeg)") > 0);
}

// ---- 5. a tela do aluno ----------------------------------------------------------------------
{
  const view = extrai('diretrizesViewHTML');
  ok('grade: a área com vídeo liberado avisa', view.indexOf("var _vl=(_degFmt&&dirVideoAmostraDaSub(s.sub))?'<div class=\"dsb-vid\">🎬 1 videoaula liberada</div>':'';") > 0);
  ok('temas: o player da videoaula liberada, só nos Capítulos da degustação', view.indexOf('var _vidAm=(_degFmt&&!_isArt)?dirVideoAmostraDaSub(refSubSel):null;') > 0 && view.indexOf("+_blocoVid") > 0 && view.indexOf('dirVideoPlayerHTML(_vidAm.v)') > 0);
  ok('capítulo: a degustação não é jogada de volta ao resumo quando escolhe Videoaulas', view.indexOf("if(_degFmt&&refFormat!=='video')refFormat='resumo';") > 0 && view.indexOf('refVideoSoLiberado=_vidSo;') > 0);
  ok('capítulo: a aba de vídeo abre só com o liberado; sem ele, cadeado (degustação e Standard)',
    view.indexOf("var lk=(_degFmt&&f[0]!=='resumo'&&!(f[0]==='video'&&_temVideo))||(_stdVid&&f[0]==='video'&&!_temVideo);") > 0
    && view.indexOf('var _vidTrancado=_vidSo&&!_ehArtigo&&!_temVideo&&list.some(') > 0
    && view.indexOf('var _vidsDe=function(d){var v=dirVideosDe(d);return _vidSo?v.filter(dirVideoLiberado):v;};') > 0);
  // SÓ GOLD (14/11/2026): o Standard vê os capítulos inteiros, mas das videoaulas só a liberada.
  ok('🧨 Standard: só o vídeo liberado (todas só no Gold; admin e Gold nunca filtram)',
    view.indexOf("var _stdVid=!_degU&&!isAdminUser()&&refPrivadoMode&&currentPlanKey()==='standard';") > 0
    && view.indexOf('var _vidSo=_degFmt||_stdVid;') > 0);
  ok('Standard: flashcards e mapas seguem abertos (o cadeado do Standard é só o do vídeo)', !/_stdVid&&f\[0\]!=='resumo'/.test(view));
  ok('Standard: o convite do cadeado é o upgrade para o Gold',
    /var _std=currentPlanKey\(\)==='standard';[^\n]*showAssineScreen\([^\n]*_std\?\{upgrade:true,highlight:'gold'\}/.test(view + SRC));
  ok('assinante: dirVideosHTML recebe o filtro só na degustação', /var refVideoSoLiberado=false;/.test(SRC) && extrai('dirCardHTML').indexOf('dirVideosHTML(d,refVideoSoLiberado)') > 0);
  ok('o _degU segue o mesmo (admin e plano nunca filtram)', view.indexOf("var _degU=!isAdminUser()&&!hasScope('plano')&&isDegustacao();") > 0 && view.indexOf('var _degFmt=_degU&&refPrivadoMode;') > 0);
}

// ---- 5b. Standard: o aviso diz "no plano Gold" ---------------------------------------------------
{
  const cap = { tema: 'T', videos: [V('Liberado', true), V('Outro A'), V('Outro B')] };
  ctx.currentPlanKey = () => 'standard';
  const h = ctx.dirVideosHTML(cap, true);
  ok('🧨 Standard: avisa os outros 2 "no plano Gold"', /Mais 2 videoaulas neste capítulo, no plano Gold/.test(h) && h.indexOf('Outro A') < 0, h);
  ctx.currentPlanKey = () => '';
  ok('degustação: segue "para assinantes"', /para assinantes/.test(ctx.dirVideosHTML(cap, true)));
  delete ctx.currentPlanKey;
  ok('planos: o Gold lista "Videoaulas dos Resumos" (cartão da plataforma e página inicial)',
    /key:'gold'[^\n]*\n\s*cursos:\[[^\]]*'Videoaulas dos Resumos'/.test(SRC) && /<li class="course">Videoaulas dos Resumos<\/li>/.test(SRC)
    && !/key:'standard'[^\n]*\n\s*cursos:\[[^\]]*Videoaulas/.test(SRC));
}

// ---- 6. o .sql ---------------------------------------------------------------------------------
{
  const s = SQL.replace(/--[^\n]*/g, '');
  ok('sql: redefine endodirect_member_resumos() como security definer com search_path fixo',
    /create or replace function public\.endodirect_member_resumos\(\)/.test(s) && /security definer/.test(s) && /set search_path to 'public'/.test(s));
  ok('sql: no Gold, todas as privadas na ordem do acervo (vídeos inclusive)', /when \(select gold from a\)\s+then coalesce\(\(select jsonb_agg\(v order by o\) from privadas\), '\[\]'::jsonb\)/.test(s));
  ok('🧨 sql: gold = Gold, Premium ou o escopo antigo `plano` sem `plano:standard` (o admin recebe todos)',
    /\(x\.s && array\['plano:gold','plano:premium'\]::text\[\]\)\s+or \(x\.s @> array\['plano'\] and not x\.s @> array\['plano:standard'\]\) as gold/.test(s));
  const std = (s.match(/when \(select scopes from a\) @> array\['plano'\]\s+then coalesce\(\(select jsonb_agg\([\s\S]*?from privadas p\), '\[\]'::jsonb\)/) || [''])[0];
  ok('🧨 sql: no Standard, TODOS os capítulos, com videos reduzido ao liberado e videos_total',
    /jsonb_set\(p\.v, '\{videos\}',\s*coalesce\(\(select jsonb_agg\(d\.video\) from vid_deg d where d\.o = p\.o\), '\[\]'::jsonb\)\)/.test(std) && /'videos_total'/.test(std) && /order by p\.o\)/.test(std), std);
  ok('sql: o Gold vem ANTES do Standard (senão o Gold cairia no ramo do Standard)', s.indexOf('when (select gold from a)') > 0 && s.indexOf('when (select gold from a)') < s.lastIndexOf("when (select scopes from a) @> array['plano']"));
  ok('sql: um vídeo liberado por subespecialidade, só em capítulo e com src',
    /select distinct on \(p\.v->>'sub'\) p\.o, e\.video/.test(s) && /e\.video->>'degustacao' = 'true'/.test(s) && /coalesce\(p\.v->>'tipo','capitulo'\) = 'capitulo'/.test(s) && /coalesce\(e\.video->>'src',''\) <> ''/.test(s));
  ok('sql: a amostra mantém a ordem de antes', /select distinct on \(v->>'sub', coalesce\(v->>'tipo','capitulo'\)\) v, o\s+from privadas\s+order by v->>'sub', coalesce\(v->>'tipo','capitulo'\), v->>'tema' nulls last, v->>'titulo' nulls last/.test(s));
  ok('sql: na amostra, videos vira só o liberado e videos_total conta os do capítulo',
    /jsonb_set\(s\.v, '\{videos\}',\s*coalesce\(\(select jsonb_agg\(d\.video\) from vid_deg d where d\.o = s\.o\), '\[\]'::jsonb\)\)/.test(s) && /jsonb_build_object\('videos_total',/.test(s));
  const stub = (s.match(/jsonb_agg\(jsonb_build_object\(\s*'sub'[\s\S]*?\) order by p\.o\)/) || [''])[0];
  ok('sql: o item só de vídeo leva sub, tema, título, tipo, privado, so_video e o vídeo', /'so_video', true/.test(stub) && /'videos', jsonb_build_array\(d\.video\)/.test(stub), stub);
  ok('sql: e NADA do conteúdo do capítulo', !/'(resumo|pts|flashcards|mapa|figuras|fluxogramas|url|fonte|info)'/.test(stub), stub);
  ok('sql: o só de vídeo é só para capítulo que não é a amostra', /where d\.o not in \(select o from amostra\)/.test(s));
  ok('sql: nenhum comando de apagar no texto (o conector do Supabase segura para confirmação)', !/\b(delete|drop|truncate)\b/i.test(SQL));
}

if (bad) { console.log('\n' + bad + ' falha(s) nas videoaulas da degustação'); process.exit(1); }
console.log('videoaulas na degustação: ok');
