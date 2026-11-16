#!/usr/bin/env node
// 📲 STORY DA QUESTÃO DO DIA NO METRICOOL (16/11/2026). Professor: "mandar a questão do dia em formato de
// JPG ou PNG ... diretamente para o Metricool, para ele postar diariamente nos stories"; escolheu o caminho
// automático, às 18h, sem sticker. O painel desenha e guarda a arte de cada questão da fila (bucket
// público, {url,hash} em `storyArte`); o cron agenda no Metricool o story da questão que foi ao ar no dia.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - as duas cópias de igArteHash divergirem (o cron passaria a achar toda arte "velha" e nada agendaria);
//  - o hash não cobrir algo que entra no desenho (questão editada → story com a arte antiga);
//  - agendar com arte velha, de fora do bucket, ou de outra questão;
//  - agendar duas vezes no mesmo dia (cron das 7h30 + healthcheck das 17h), ou repetir depois de resposta
//    incerta;
//  - agendar sem a chave, antes de 18/11 (o de 17/11 foi à mão), depois das 17h40, ou com IG_STORY_AUTO=off;
//  - a marca do dia (`ig_story_auto`) sumir no save do painel (o painel precisa preservá-la);
//  - o painel gerar arte de questão já postada, de quem não é professor, ou anotar a arte numa questão
//    editada enquanto a arte subia; uma falha parar as outras.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const libSrc = fs.readFileSync(path.join(raiz, 'lib', 'instagram.js'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
function corpo(nome, src) {
  src = src || html;
  const ini = src.indexOf('\nfunction ' + nome + '(');
  if (ini < 0) { ok('achei function ' + nome, false); return ''; }
  let i = src.indexOf('{', ini), prof = 0, q = null;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); continue; }
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) break; }
  }
  return src.slice(ini + 1, i + 1);
}
for (const k of Object.keys(process.env)) if (/^(METRICOOL_|IG_STORY_AUTO)/.test(k)) delete process.env[k];
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'chave-de-teste';
const lib = require(path.join(raiz, 'lib', 'instagram.js'));
const clone = (x) => JSON.parse(JSON.stringify(x));

// 1. Hash: cópias idênticas e cobrindo o desenho.
ok('🧨 igArteHash idêntica no index.html e no lib/instagram.js', corpo('igArteHash') && corpo('igArteHash') === corpo('igArteHash', libSrc));
const base = { id: 'q1', sub: 'Tireoide', stem: 'Enunciado', teem: '', options: { A: 'a', B: 'b', C: 'c', D: 'd' }, img: '', answer: 'B', explanation: 'x' };
const H = lib.igArteHash(base);
ok('hash de 8 dígitos hex', /^[0-9a-f]{8}$/.test(H));
for (const [campo, mudar] of [['enunciado', (x) => { x.stem += '!'; }], ['alternativa D', (x) => { x.options.D = 'outra'; }], ['TEEM', (x) => { x.teem = 'TEEM 2025'; }], ['imagem', (x) => { x.img = 'data:image/png;base64,AAAA'; }]]) {
  const x = clone(base); mudar(x); ok('🧨 o hash muda quando muda: ' + campo, lib.igArteHash(x) !== H);
}
{
  const x = clone(base); x.status = 'posted'; x.postedAt = 5; x.answer = 'C'; x.explanation = 'outra'; x.storyArte = { url: 'u', hash: 'h' }; x.sub = 'Adrenal';
  ok('o hash não muda com o que não entra no desenho (situação, gabarito, comentário, a própria arte)', lib.igArteHash(x) === H);
}
// 2. Arte válida: hash certo, no bucket, na pasta stories.
const URL_OK = 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/stories/q1-' + H + '.jpg';
ok('arte certa vale', lib.storyArteValida(Object.assign(clone(base), { storyArte: { url: URL_OK, hash: H } })));
ok('🧨 arte de antes da edição não vale', !lib.storyArteValida(Object.assign(clone(base), { stem: 'editado', storyArte: { url: URL_OK, hash: H } })));
ok('🧨 arte fora do nosso bucket não vale', !lib.storyArteValida(Object.assign(clone(base), { storyArte: { url: 'https://drive.google.com/file/d/x/view', hash: H } })));
ok('🧨 arte fora da pasta stories não vale', !lib.storyArteValida(Object.assign(clone(base), { storyArte: { url: URL_OK.replace('/stories/', '/resumos/'), hash: H } })));

// 3. agendarStoryDoDia com fetch falso.
const DIA = (h, m) => new Date(Date.UTC(2026, 10, 18, h + 3, m || 0)); // hora de Brasília em 18/11
function payloadDoDia(extra) {
  const hoje = Object.assign(clone(base), { status: 'posted', postedAt: DIA(7, 30).getTime(), storyArte: { url: URL_OK, hash: H } });
  const ontem = Object.assign(clone(base), { id: 'q0', stem: 'ontem', status: 'posted', postedAt: DIA(7, 30).getTime() - 86400000 });
  return Object.assign({ ig_stories: [ontem, hoje, Object.assign(clone(base), { id: 'q2', status: 'queued' })] }, extra || {});
}
let chamadas = [];
let resposta = () => ({ status: 200, body: JSON.stringify({ data: { id: 999, media: ['https://static.metricool.com/x.jpg'] } }) });
let normal = () => ({ status: 200, body: '"https://static.metricool.com/normalizada.jpg"' });
const fetchFalso = async (url, opt) => {
  chamadas.push({ url, opt: opt || {} });
  const r = /normalize/.test(url) ? normal() : resposta();
  if (r.abort) { const e = new Error('abortou'); e.name = 'AbortError'; throw e; }
  return { ok: r.status >= 200 && r.status < 300, status: r.status, text: async () => r.body, json: async () => JSON.parse(r.body) };
};
const fetchReal = global.fetch;
const erroReal = console.error;
console.error = () => {};
(async () => {
  global.fetch = fetchFalso;
  try {
    let p = payloadDoDia(), r;
    r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('🧨 sem a chave do Metricool: não agenda e não chama nada', r.motivo === 'sem_chave' && !chamadas.length && !p.ig_story_auto);
    process.env.METRICOOL_USER_TOKEN = 'token-de-teste';
    r = await lib.agendarStoryDoDia(payloadDoDia(), new Date(Date.UTC(2026, 10, 17, 10, 30)));
    ok('🧨 17/11 (o teste foi agendado à mão): o automático não agenda', r.motivo === 'antes_do_inicio' && !chamadas.length);

    p = payloadDoDia();
    r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    const post = chamadas.filter((c) => c.opt.method === 'POST')[0];
    const corpoPost = post ? JSON.parse(post.opt.body) : {};
    ok('🧨 agenda: 1 normalização + 1 POST no agendador do Metricool', chamadas.length === 2 && /\/api\/actions\/normalize\/image\/url\?url=/.test(chamadas[0].url) && post && /^https:\/\/app\.metricool\.com\/api\/v2\/scheduler\/posts\?blogId=7486030&userId=\d+$/.test(post.url), chamadas.map((c) => c.url).join(' | '));
    ok('🧨 a chave vai no cabeçalho X-Mc-Auth (nunca na URL)', post && post.opt.headers['X-Mc-Auth'] === 'token-de-teste' && !chamadas.some((c) => /token-de-teste/.test(c.url)));
    ok('normalização recebe a arte do bucket', decodeURIComponent(chamadas[0].url).indexOf(URL_OK) > 0);
    ok('🧨 story do Instagram, publicação automática, às 18h de Brasília do dia', corpoPost.publicationDate && corpoPost.publicationDate.dateTime === '2026-11-18T18:00:00' && corpoPost.publicationDate.timezone === 'America/Sao_Paulo'
      && corpoPost.autoPublish === true && corpoPost.instagramData && corpoPost.instagramData.type === 'STORY' && JSON.stringify(corpoPost.providers) === '[{"network":"instagram"}]' && corpoPost.draft === false);
    ok('🧨 sem texto (story sozinho não leva legenda) e com a mídia normalizada', corpoPost.text === '' && JSON.stringify(corpoPost.media) === '["https://static.metricool.com/normalizada.jpg"]');
    ok('marca do dia gravada no payload', r.agendado === true && r.mudou && p.ig_story_auto && p.ig_story_auto.iso === '2026-11-18' && p.ig_story_auto.ok === true && p.ig_story_auto.itemId === 'q1' && p.ig_story_auto.postId === 999);

    chamadas = [];
    r = await lib.agendarStoryDoDia(p, DIA(17, 0));
    ok('🧨 healthcheck das 17h no mesmo dia: não agenda de novo', r.motivo === 'ja_agendado' && !chamadas.length);

    normal = () => ({ status: 500, body: 'x' });
    chamadas = []; p = payloadDoDia(); r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('normalização falhou: agenda com o endereço do bucket', r.agendado === true && JSON.parse(chamadas[1].opt.body).media[0] === URL_OK);
    normal = () => ({ status: 200, body: '"https://static.metricool.com/normalizada.jpg"' });

    chamadas = []; p = payloadDoDia(); p.ig_stories[1].stem = 'editada depois da arte';
    r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('🧨 arte velha (questão editada depois): não agenda, e anota o motivo', r.motivo === 'sem_arte' && !chamadas.length && p.ig_story_auto.ok === false && p.ig_story_auto.motivo === 'sem_arte' && r.mudou);

    chamadas = []; p = payloadDoDia(); p.ig_stories[1].postedAt = DIA(7, 30).getTime() - 2 * 86400000;
    r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('🧨 nenhuma questão no ar hoje: não agenda a de outro dia', r.motivo === 'sem_questao_hoje' && !chamadas.length);

    chamadas = []; p = payloadDoDia(); r = await lib.agendarStoryDoDia(p, DIA(17, 45));
    ok('🧨 depois das 17h40: não agenda (não daria para as 18h)', r.motivo === 'tarde' && !chamadas.length);

    process.env.IG_STORY_AUTO = 'off';
    chamadas = []; r = await lib.agendarStoryDoDia(payloadDoDia(), DIA(7, 30));
    ok('🧨 IG_STORY_AUTO=off desliga', r.motivo === 'desligado' && !chamadas.length);
    delete process.env.IG_STORY_AUTO;

    resposta = () => ({ status: 401, body: '{"error":"unauthorized"}' });
    chamadas = []; p = payloadDoDia(); r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('Metricool recusou: anota o erro', r.motivo === 'erro' && p.ig_story_auto.ok === false && /401/.test(p.ig_story_auto.erro));
    resposta = () => ({ status: 200, body: JSON.stringify({ data: { id: 7 } }) });
    chamadas = []; r = await lib.agendarStoryDoDia(p, DIA(17, 0));
    ok('🧨 depois de recusa, a tentativa das 17h agenda', r.agendado === true && p.ig_story_auto.ok === true);

    resposta = () => ({ abort: true });
    chamadas = []; p = payloadDoDia(); r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('resposta não chegou: "incerto"', r.motivo === 'incerto' && p.ig_story_auto.ok === 'incerto');
    resposta = () => ({ status: 200, body: JSON.stringify({ data: { id: 8 } }) });
    chamadas = []; r = await lib.agendarStoryDoDia(p, DIA(17, 0));
    ok('🧨 depois de "incerto", não repete (melhor perder um story que postar dois)', r.motivo === 'ja_agendado' && !chamadas.length);

    resposta = () => ({ status: 200, body: JSON.stringify({ data: { id: 9, media: [] } }) });
    chamadas = []; p = payloadDoDia(); r = await lib.agendarStoryDoDia(p, DIA(7, 30));
    ok('🧨 Metricool aceitou mas sem a imagem: fica marcado como "sem_midia" (aparece no painel)', r.motivo === 'sem_midia' && p.ig_story_auto.ok === 'sem_midia');
    resposta = () => ({ status: 200, body: JSON.stringify({ data: { id: 10, media: ['x'] } }) });

    // 4. Integração com o robô da Questão do Dia.
    const gravados = []; let servidor;
    const fetchRobo = async (url, opt) => {
      if (/supabase|endodirect\.com\.br\/rest|\/rest\/v1\//.test(url)) {
        if (opt && opt.method === 'POST') { gravados.push(JSON.parse(opt.body).payload); return { ok: true, json: async () => ({}) }; }
        return { ok: true, json: async () => [{ payload: clone(servidor) }] };
      }
      return fetchFalso(url, opt);
    };
    global.fetch = fetchRobo;
    const naFila = Object.assign(clone(base), { id: 'q9', status: 'queued' }); naFila.storyArte = { url: URL_OK.replace('q1-', 'q9-'), hash: lib.igArteHash(naFila) };
    servidor = { ig_stories: [naFila] };
    chamadas = [];
    let rr = await lib.autoPostDailyQotd(DIA(7, 30));
    const ultimo = gravados[gravados.length - 1] || {};
    ok('🧨 o robô põe a questão no ar e agenda o story dela', rr.posted === true && rr.story && rr.story.agendado === true && chamadas.some((c) => c.opt.method === 'POST' && /scheduler/.test(c.url)));
    ok('🧨 primeiro grava a questão no ar, depois a marca do story', gravados.length === 2 && gravados[0].ig_stories[0].status === 'posted' && !gravados[0].ig_story_auto && ultimo.ig_story_auto && ultimo.ig_story_auto.ok === true);
    gravados.length = 0; chamadas = []; servidor = ultimo;
    rr = await lib.autoPostDailyQotd(DIA(17, 0));
    ok('🧨 healthcheck das 17h: nada de novo (nem story, nem save)', rr.reason === 'already_posted_today' && rr.story.motivo === 'ja_agendado' && !gravados.length && !chamadas.length);
    // "✓ Postada" pelo professor (sem o robô): o robô só agenda.
    const manual = Object.assign(clone(naFila), { status: 'posted', postedAt: DIA(9, 0).getTime() });
    servidor = { ig_stories: [manual] }; gravados.length = 0; chamadas = [];
    rr = await lib.autoPostDailyQotd(DIA(17, 0));
    ok('🧨 questão postada à mão pelo professor: o robô agenda o story dela e grava a marca', rr.reason === 'already_posted_today' && rr.story.agendado === true && gravados.length === 1 && gravados[0].ig_story_auto.ok === true);
  } finally {
    global.fetch = fetchReal;
    delete process.env.METRICOOL_USER_TOKEN;
  }

  // 5. Painel: preservar a marca, sincronizar artes.
  ok('🧨 o painel preserva ig_story_auto no save (chave do servidor)', /'trial_emails','ig_story_auto'\]\.forEach\(function\(k\)\{if\(payload\[k\]!==undefined\)globalServerKeys\[k\]=payload\[k\];\}\);/.test(html));
  ok('🧨 toda mudança da fila agenda a revisão das artes', /function persistIgStories\(immediate\)\{try\{lsSet\('ig_stories',igStories\);\}catch\(e\)\{\}try\{igArtesAgenda\(\);\}catch\(e\)\{\}/.test(html));
  ok('🧨 a fila que chega do servidor também (abrir o painel gera as que faltam)', /renderQotdArchive\(\);\}catch\(e\)\{\}\n\s*try\{igArtesAgenda\(8000\);\}catch\(e\)\{\}\}/.test(html));
  ok('linha de situação na aba Fila', /id="ig-auto-status"[^>]*>'\+igAutoStatusHTML\(\)\+'<\/div>'\+fila/.test(html));

  async function painel(opts) {
    const o = opts || {};
    const subidas = [], salvas = [];
    const cx = {
      console: { warn() {} }, Promise, Object, Math, Date, String, FileReader: function () {}, setTimeout: (f) => { cx.__t = f; }, clearTimeout() {},
      currentUser: { role: o.papel || 'admin' }, igStories: o.fila, globalServerKeys: o.servidor || {}, lsSet() {}, esc: (x) => String(x),
      SUPABASE_ASSET_BUCKET: 'endodirect-assets', queueRemoteStateSave: () => { salvas.push(1); },
      igQuestionSVG: (it) => 'svg:' + it.id, igRenderCanvas: (svg) => (o.falha && svg === 'svg:' + o.falha) ? Promise.reject(new Error('x')) : Promise.resolve({ toBlob: (cb, tipo, q) => cb({ tipo, q }) }),
      getSupabaseClient: () => ({ storage: { from: (b) => ({
        upload: (p, blob, op) => { subidas.push({ b, p, blob, op }); if (o.durante) o.durante(); return Promise.resolve({}); },
        getPublicUrl: (p) => ({ data: { publicUrl: 'https://auth.endodirect.com.br/storage/v1/object/public/' + b + '/' + p } }) }) } }),
      fetch: () => Promise.reject(new Error('sem rede')), document: { getElementById: () => null },
    };
    vm.createContext(cx);
    const src = html.slice(html.indexOf('\nfunction igArteHash('), html.indexOf('\nfunction igCaptionQ('));
    vm.runInContext(src, cx);
    const n = await cx.igArtesSincroniza();
    return { cx, n, subidas, salvas };
  }
  const q = (id, extra) => Object.assign(clone(base), { id, status: 'queued' }, extra || {});
  {
    const fila = [Object.assign(clone(base), { id: 'velha', status: 'posted' })];
    for (let i = 0; i < 12; i++) fila.push(q('f' + i));
    fila[2].storyArte = { url: 'https://x/y.jpg', hash: lib.igArteHash(fila[2]) }; // já pronta
    const r = await painel({ fila });
    const ids = r.subidas.map((s) => s.p.replace(/^stories\/|-[0-9a-f]{8}\.jpg$/g, ''));
    ok('🧨 gera só as 10 próximas da fila, sem as postadas e sem as que já têm arte', r.n === 9 && ids.join(',') === 'f0,f2,f3,f4,f5,f6,f7,f8,f9' && !ids.includes('velha') && !ids.includes('f10') && !ids.includes('f1'), ids.join(','));
    const s0 = r.subidas[0];
    ok('🧨 sobe JPG no bucket público, pasta stories, com o hash no nome, sobrescrevendo', s0.b === 'endodirect-assets' && /^stories\/f0-[0-9a-f]{8}\.jpg$/.test(s0.p) && s0.op.upsert === true && s0.op.contentType === 'image/jpeg' && s0.blob.tipo === 'image/jpeg');
    const f0 = fila[1];
    ok('🧨 a arte anotada vale para o servidor (mesmo hash, URL do bucket)', lib.storyArteValida(f0), JSON.stringify(f0.storyArte));
    ok('grava a fila uma vez só no fim', r.salvas.length === 1);
    const r2 = await painel({ fila });
    ok('rodar de novo: nada a fazer', r2.n === 0 && !r2.subidas.length && !r2.salvas.length);
  }
  {
    const fila = [q('a'), q('b'), q('c')];
    const r = await painel({ fila, falha: 'b' });
    ok('🧨 uma arte que falha não para as outras', r.n === 2 && fila[0].storyArte && !fila[1].storyArte && fila[2].storyArte);
  }
  {
    const fila = [q('a')];
    const r = await painel({ fila, durante: () => { fila[0].stem = 'editada enquanto subia'; } });
    ok('🧨 questão editada enquanto a arte subia: não anota a arte velha', r.n === 0 && !fila[0].storyArte && !r.salvas.length);
  }
  {
    const r = await painel({ fila: [q('a')], papel: 'student' });
    ok('🧨 quem não é professor não gera nada', r.n === 0 && !r.subidas.length);
  }
  {
    const r = await painel({ fila: [q('a', { img: 'https://auth.endodirect.com.br/storage/v1/object/public/endodirect-assets/resumos/x.png' })] });
    ok('🧨 imagem do caso que não carregou: não gera arte sem ela', r.n === 0 && !r.subidas.length);
  }
  {
    const fila = [q('a')]; fila[0].storyArte = { url: 'u', hash: lib.igArteHash(fila[0]) };
    const r1 = await painel({ fila, servidor: { ig_story_auto: { iso: '2026-11-18', ok: true } } });
    const t1 = r1.cx.igAutoStatusHTML();
    ok('situação: artes prontas e último agendado', /1 de 1/.test(t1) && /18\/11, 18h/.test(t1));
    const t2 = (await painel({ fila, servidor: { ig_story_auto: { iso: '2026-11-19', ok: false, motivo: 'sem_arte' } } })).cx.igAutoStatusHTML();
    ok('situação: motivo quando não agendou', /19\/11/.test(t2) && /arte da questão ainda não gerada/.test(t2));
    const t3 = (await painel({ fila, servidor: { ig_story_auto: { iso: '2026-11-20', ok: 'incerto' } } })).cx.igAutoStatusHTML();
    ok('situação: incerto pede conferência no planejador', /não confirmou/.test(t3));
  }

  if (bad) { console.log('✗ stories no Metricool: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ stories no Metricool: arte das próximas 10 da fila no bucket (hash igual nos dois lados); o robô agenda às 18h o story da questão do dia, uma vez, só com arte certa e com a chave; painel preserva a marca e mostra a situação');
})().catch((e) => { console.log('✗ erro no teste:', e && e.stack || e); process.exit(1); });
