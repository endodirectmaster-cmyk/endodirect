#!/usr/bin/env node
// QUESTÃO DO DIA: FILTRO DE SUBESPECIALIDADES NO PERFIL DO ALUNO (19/11/2026).
//
// Pedido do professor: "deixar um filtro no perfil dele para ele escolher as subespecialidades que eles têm interesse em
// receber a questão do dia"; "se ele não quiser endocrinopediatria e hoje tiver uma questão, ele não vai receber
// nenhuma questão".
//  - o perfil guarda as subespecialidades DE FORA (user_profile.qotdSubsFora): uma nova entra marcada para todos;
//  - a de hoje, se for de uma subespecialidade desmarcada, não aparece: nem a janela do Dashboard, nem o "Comece por
//    aqui", nem o selo "De hoje" do arquivo;
//  - o arquivo mostra só as que o aluno acompanha, com "Ver todas";
//  - o e-mail sai sem o bloco da questão (e com o assunto sem "Questão do Dia") para quem a desmarcou;
//  - a notificação não vai para os aparelhos de quem a desmarcou.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - o filtro guardar as de DENTRO (uma subespecialidade nova sumiria para quem já escolheu);
//  - a questão sem subespecialidade sumir para quem tem filtro;
//  - o e-mail continuar levando a questão para quem a desmarcou (ou tirar dela de quem não desmarcou).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
function bloco(inicio) {
  const i = html.indexOf(inicio);
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}

(async () => {
  // ---- 1. as funções do aparelho, rodando ------------------------------------------------------------
  const fontes = ['function qotdTodays(){', 'function qotdSubsFora(){', 'function qotdQuerSub(sub){', 'function qotdTodaysAluno(){'].map(bloco);
  fontes.forEach((f, i) => ok('função ' + (i + 1) + ' encontrada', !!f));
  const dirSubs = (html.match(/var DIR_SUBS=\[[^\]]*\];/) || [''])[0];
  ok('a lista do filtro é a das subespecialidades da Questão do Dia (DIR_SUBS, com Básica e Endocrinopatias)',
    /function qotdSubsLista\(\)\{return \(typeof DIR_SUBS!=='undefined'&&Array\.isArray\(DIR_SUBS\)\)\?DIR_SUBS:\[\];\}/.test(html) && /'Endocrinologia Básica'/.test(dirSubs) && /'Endocrinopatias'/.test(dirSubs) && /'Endocrinologia Pediátrica'/.test(dirSubs));
  const ctx = { currentUser: { profile: {} }, lsGet: () => null, igStories: [] };
  vm.createContext(ctx);
  vm.runInContext(fontes.join('\n'), ctx);
  const Q = (id, sub, status) => ({ id, sub, stem: 'Enunciado ' + id, options: { A: 'a', B: 'b' }, answer: 'A', status: status || 'posted' });
  ctx.igStories = [Q('q1', 'Diabetes'), Q('q2', 'Endocrinologia Pediátrica'), Q('q3', 'Tireoide', 'queued')];
  ok('sem filtro: a de hoje aparece', ctx.qotdTodaysAluno() && ctx.qotdTodaysAluno().id === 'q2');
  ctx.currentUser.profile = { qotdSubsFora: ['Endocrinologia Pediátrica'] };
  ok('🧨 desmarcou Endocrinologia Pediátrica e a de hoje é dela: não aparece nada', ctx.qotdTodaysAluno() === null);
  ok('a questão "de hoje" continua sendo a mesma para o professor (qotdTodays sem filtro)', ctx.qotdTodays().id === 'q2');
  ctx.currentUser.profile = { qotdSubsFora: ['Diabetes'] };
  ok('desmarcou outra subespecialidade: a de hoje aparece', ctx.qotdTodaysAluno() && ctx.qotdTodaysAluno().id === 'q2');
  ctx.igStories = [Q('q1', 'Diabetes'), Q('q4', '')];
  ok('🧨 questão sem subespecialidade aparece mesmo com filtro', ctx.qotdTodaysAluno() && ctx.qotdTodaysAluno().id === 'q4');
  ctx.currentUser.profile = { qotdSubsFora: 'Diabetes' };
  ok('valor estranho no perfil não vira filtro', ctx.qotdSubsFora().length === 0);
  ctx.currentUser = null; ctx.lsGet = (k) => (k === 'user_profile' ? { qotdSubsFora: ['Diabetes'] } : null);
  ok('sem currentUser, lê o perfil guardado no aparelho', ctx.qotdSubsFora()[0] === 'Diabetes');

  // ---- 2. onde o filtro vale (aparelho) --------------------------------------------------------------
  ok('🧨 a janela do Dashboard usa a de hoje filtrada', /function renderQotd\(\)\{\n  var q=qotdTodaysAluno\(\);/.test(html));
  ok('a fila de entrada e o "Comece por aqui" também', /qotdTodaysAluno==='function'&&qotdTodaysAluno\(\)\)return 'ativa'/.test(html)
    && /var q=\(typeof qotdTodaysAluno==='function'\)\?qotdTodaysAluno\(\):null;/.test(html));
  const arq = bloco('function renderQotdArchive(){');
  ok('arquivo: selo "De hoje" filtrado, lista só das acompanhadas, "Ver todas" e atalho para o perfil',
    /var hoje=qotdTodaysAluno\(\);/.test(arq) && /todas\.filter\(function\(q\)\{return qotdQuerSub\(q\.sub\);\}\)/.test(arq)
    && /data-qa-filtro="todas"/.test(arq) && /data-qa-filtro="perfil"/.test(arq) && /perfilRolarQotd=true/.test(arq));
  ok('🧨 link direto para uma questão de fora abre "todas" (senão o link cairia no vazio)', /!qotdQuerSub\(todas\[_i\]\.sub\)\)\{qotdArchTodas=true;/.test(arq));
  ok('o arquivo do professor e "Como o aluno vê" não são filtrados', /function renderAdmQotdAluno\(\)\{[\s\S]{0,200}var hoje=qotdTodays\(\);/.test(html));
  const perfil = bloco('function renderPerfil(){'), liga = html.slice(html.indexOf("var qdSave=document.getElementById('btn-pf-qd-save');"), html.indexOf('// Salvar preferências de newsletter'));
  ok('perfil: cartão com uma caixa por subespecialidade, todas marcadas de início', /id="perfil-qotd"/.test(perfil) && /qotdSubsLista\(\)\.map/.test(perfil) && /var on=qdFora\.indexOf\(s\)<0;/.test(perfil) && /\+qdCard\+nlCard/.test(perfil));
  ok('🧨 salvar grava as DE FORA (e apaga a chave quando todas estão marcadas)', /if\(c\.checked\)dentro\+\+;else fora\.push\(c\.value\);/.test(liga)
    && /if\(fora\.length\)prof\.qotdSubsFora=fora;else delete prof\.qotdSubsFora;/.test(liga) && /queueRemoteStateSave\(\);/.test(liga));
  ok('salvar avisa quando nenhuma ficou marcada', /nenhuma marcada: a Questão do Dia não vai aparecer para você/.test(liga));
  ok('user_profile vai para o servidor (é de lá que o e-mail e a notificação leem o filtro)', /user_profile:lsGet\('user_profile'\)/.test(html));

  // ---- 3. servidor: e-mail e notificação ------------------------------------------------------------
  process.env.RESEND_API_KEY = 're_teste';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_teste';
  delete process.env.VAPID_PRIVATE_KEY;
  const nl = require('../lib/newsletter');
  ok('qotdExcluida: só quem desmarcou a subespecialidade da questão', nl.qotdExcluida(['Endocrinologia Pediátrica'], { sub: 'Endocrinologia Pediátrica' })
    && !nl.qotdExcluida(['Diabetes'], { sub: 'Endocrinologia Pediátrica' }) && !nl.qotdExcluida(['Diabetes'], { sub: '' }) && !nl.qotdExcluida(undefined, { sub: 'Diabetes' }));
  const us = nl.usuariosSemQotd({ porUsuario: { u1: ['Endocrinologia Pediátrica'], u2: ['Diabetes'] } }, { sub: 'Endocrinologia Pediátrica' });
  ok('🧨 notificação: só os aparelhos de quem desmarcou ficam de fora', us.has('u1') && !us.has('u2') && us.size === 1);
  const pushSrc = fs.readFileSync(path.join(RAIZ, 'lib', 'push.js'), 'utf8');
  ok('sendToAll pula os aparelhos de opts.excluirUsuarios (por user_id)', /select=endpoint,p256dh,auth,user_id`/.test(pushSrc)
    && /\.filter\(\(s\) => !\(fora && s && s\.user_id && fora\.has\(s\.user_id\)\)\)/.test(pushSrc));
  const nlSrc = fs.readFileSync(path.join(RAIZ, 'lib', 'newsletter.js'), 'utf8'), rr = fs.readFileSync(path.join(RAIZ, 'api', 'admin', 'refresh-radar.js'), 'utf8');
  ok('a notificação do cron e o reenvio manual do painel passam a lista de fora', /sendToAll\(m, \{ excluirUsuarios \}\)/.test(nlSrc) && /push\.sendToAll\(m, \{ excluirUsuarios \}\)/.test(rr));

  // A edição do dia, de ponta a ponta: a@ não tem filtro; b@ desmarcou a subespecialidade da questão de hoje.
  const QD = { id: 'ig-1', sub: 'Endocrinologia Pediátrica', stem: 'Menino de 8 anos com baixa estatura', options: { A: 'a', B: 'b' }, answer: 'A', status: 'posted', postedAt: Date.now() };
  const payload = { provas: [], diretrizes: [], ig_stories: [QD], radar_avisos: [
    { titulo: 'Artigo 1', texto: 'Resumo do artigo 1 com detalhes suficientes.', link: 'https://x/1', subespecialidade: 'Diabetes', publicationDate: '2026-11-18' },
    { titulo: 'Artigo 2', texto: 'Resumo do artigo 2 com detalhes suficientes.', link: 'https://x/2', subespecialidade: 'Tireoide', publicationDate: '2026-11-18' },
    { titulo: 'Artigo 3', texto: 'Resumo do artigo 3 com detalhes suficientes.', link: 'https://x/3', subespecialidade: 'Obesidade', publicationDate: '2026-11-18' }] };
  const enviados = [];
  global.fetch = async (url, opts) => {
    const u = String(url), metodo = (opts && opts.method) || 'GET';
    const resp = (corpo) => ({ ok: true, status: 200, json: async () => corpo, text: async () => '' });
    if (u.indexOf('endodirect_global_state') >= 0) return metodo === 'GET' ? resp([{ payload: JSON.parse(JSON.stringify(payload)) }]) : resp({});
    if (u.indexOf('/rpc/') >= 0) return resp(true);
    if (u.indexOf('/auth/v1/admin/users') >= 0) return resp({ users: [{ email: 'a@x.com' }, { email: 'b@x.com' }] });
    if (u.indexOf('qotdSubsFora') >= 0) return resp([{ user_id: 'ua', email: 'a@x.com', fora: null }, { user_id: 'ub', email: 'b@x.com', fora: ['Endocrinologia Pediátrica'] }]);
    if (u.indexOf('endodirect_app_state') >= 0 || u.indexOf('newsletter_optin') >= 0) return resp([]);
    if (u.indexOf('api.resend.com') >= 0) { JSON.parse(opts.body).forEach((m) => enviados.push(m)); return resp({}); }
    return resp([]);
  };
  const log = console.log; console.log = () => {};
  let r;
  try { r = await nl.sendDailyNewsletter([]); } finally { console.log = log; }
  const de = (e) => enviados.find((m) => m.to[0] === e) || {};
  ok('a edição saiu para os dois', r && r.sent === true && enviados.length === 2, JSON.stringify(r));
  ok('quem não filtrou recebe a questão (assunto e bloco)', /Questão do Dia \+ 3 artigos/.test(de('a@x.com').subject || '') && /Menino de 8 anos/.test(de('a@x.com').html || ''));
  ok('🧨 quem desmarcou recebe só os artigos, sem a questão nem no assunto', /3 artigos do dia/.test(de('b@x.com').subject || '') && !/Menino de 8 anos/.test(de('b@x.com').html || '') && /Artigo 1/.test(de('b@x.com').html || ''));

  if (bad) { console.log(bad + ' falha(s) no filtro da Questão do Dia.'); process.exit(1); }
  console.log('ok — filtro de subespecialidades da Questão do Dia (tela, e-mail e notificação)');
})().catch((e) => { console.error(e); process.exit(1); });
