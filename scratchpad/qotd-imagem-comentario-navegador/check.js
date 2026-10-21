// Harness da FIGURA DO COMENTÁRIO da Questão do Dia (21/10/2026), no Chromium.
//
// Pedido do professor: "sempre que possível, jogar uma imagem nos comentários para
// contextualizar e reforçar o comentário por escrito [...] as imagens podem ser novas,
// retiradas do PubMed, ou dos próprios resumos dos capítulos."
//
// Cenários (LADO=antes roda os mesmos passos na main, para provar que nada mais mudou):
//   1. aluno no celular (390, escuro e claro) e no notebook (1280): a de hoje tem figura
//      no comentário; antes de responder ela NÃO aparece; depois, aparece dentro do
//      gabarito, carregada, dentro da folha, com a legenda legível e o capítulo de
//      origem; tocar amplia e Esc fecha. A do PubMed sai com a minirreferência; a
//      antiga, sem figura, continua igual;
//   2. a janela do mural: responder ali mostra a figura, e o ampliador fica por cima;
//   3. professor dono: "Gerar lote" com a IA de mentira — a questão sai com a figura dos
//      Resumos e o porquê; "Tirar" a remove de uma; "Distribuir" leva às Pendências, que
//      mostram a figura com a opção de tirar; aprovar publica com a figura; "✓ Postada"
//      e "Como o aluno vê" mostram a figura depois da resposta, e o estado salvo a tem;
//   4. formulário manual: "Gerar 1 com IA" traz a figura e a legenda editável; ✕ tira;
//      "Sugerir" traz de volta; "Enviar uma imagem" sobe para o armazenamento (URL, não
//      base64); aprovar e reabrir na Fila mantém a imagem e a legenda editada.
// Uso: LADO=antes RAIZ_APP=<pasta com o index.html da main> | LADO=depois (padrão)
//      SAIDA=<pasta das capturas> (padrão: a pasta deste arquivo)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const REPO = path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const SAIDA = process.env.SAIDA || __dirname;
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const NOVO = /function igAttachExpImage\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = LADO === 'depois' ? 8871 : 8872;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
const DONO = 'rodolphomend@gmail.com'; // QOTD_OWNERS e curador de Obesidade (só local: o Supabase aqui é falso)
const DIA = 86400000, BASE = Date.UTC(2026, 9, 14, 11, 0, 0);
const LIVRO = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/resumos/livros/';
const UPLOAD = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/qotd/2026-10-21/';

// PNG de teste (faixas, para a figura aparecer na captura) sem dependência externa.
function png(w, h, cor) {
  const linha = Buffer.alloc(1 + w * 3), dados = [];
  for (let y = 0; y < h; y++) {
    linha[0] = 0;
    for (let x = 0; x < w; x++) {
      const faixa = ((x >> 5) + (y >> 5)) % 2;
      linha[1 + x * 3] = faixa ? cor[0] : 255; linha[2 + x * 3] = faixa ? cor[1] : 255; linha[3 + x * 3] = faixa ? cor[2] : 255;
    }
    dados.push(Buffer.from(linha));
  }
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const x of b) r = t[(r ^ x) & 0xff] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
  const bloco = (tipo, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(tipo), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('IDAT', zlib.deflateSync(Buffer.concat(dados))), bloco('IEND', Buffer.alloc(0))]);
}
const PNG_LIVRO = png(900, 560, [37, 99, 235]);
const PNG_OPENI = png(512, 400, [22, 163, 74]);
const PNG_UPLOAD = png(640, 420, [217, 119, 6]);
const UP_ARQ = path.join(SAIDA, 'upload-teste.png');
fs.writeFileSync(UP_ARQ, PNG_UPLOAD);

const LEG_GLP1 = 'Ações do GLP-1 e dos agonistas do seu receptor: menos apetite e mais saciedade no cérebro, esvaziamento gástrico mais lento, mais insulina e menos glucagon. Fonte: traduzida de Kopelman PG, Clinical Obesity in Adults and Children, 4ª ed., fig. 24.3.';
const DIRETRIZES = [
  { sub: 'Obesidade', tema: 'Tratamento Farmacológico da Obesidade', privado: true,
    resumo: '## Agonistas do GLP-1\nReduzem o apetite e retardam o esvaziamento gástrico.\n![' + LEG_GLP1 + '](' + LIVRO + 'teste-glp1.png)\nA tirzepatida soma o GIP.',
    figuras: [{ titulo: 'Onde agem os fármacos antiobesidade', url: 'https://www.endodirect.com.br/figuras/resumos/obesidade--tratamento-farmacologico-da-obesidade.svg', fonte: 'Esquema Endodirect — ilustração original a partir do texto do capítulo.' }] },
  { sub: 'Tireoide', tema: 'Hipotireoidismo', privado: true, resumo: 'Texto sem figura.', figuras: [] },
];
const OPC = { A: 'Agonista do receptor de GLP-1', B: 'Inibidor da lipase', C: 'Simpaticomimético', D: 'Antagonista opioide' };
const STORIES = [
  { id: 'ig-1', status: 'posted', postedAt: BASE, sub: 'Obesidade', stem: 'Questão antiga, sem figura no comentário. Qual o mecanismo da semaglutida?', options: OPC, answer: 'A', explanation: 'Comentário da questão antiga, sem figura.' },
  { id: 'ig-2', status: 'posted', postedAt: BASE + DIA, sub: 'Tireoide', stem: 'Mulher de 30 anos com tireotoxicose e bócio difuso. Qual o padrão esperado na cintilografia?', options: { A: 'Captação difusa e aumentada', B: 'Nódulo quente', C: 'Captação ausente', D: 'Captação normal' }, answer: 'A', explanation: 'Na doença de Graves, a cintilografia mostra captação difusa e aumentada.',
    expImg: 'https://openi.nlm.nih.gov/imgs/512/10/20/teste-openi.png', expImgRef: 'Silva A et al. · Thyroid Res · 2019 · Open-i · PMID 123456', expImgTema: '', expImgOrigem: 'pubmed' },
  { id: 'ig-3', status: 'posted', postedAt: BASE + 2 * DIA, sub: 'Obesidade', stem: 'Homem de 45 anos com obesidade grau II quer emagrecer com remédio que reduza o apetite e retarde o esvaziamento gástrico. Qual a classe indicada?', options: OPC, answer: 'A', explanation: 'Os agonistas do receptor de GLP-1 reduzem o apetite no hipotálamo e retardam o esvaziamento gástrico; o orlistate inibe a lipase intestinal.',
    expImg: LIVRO + 'teste-glp1.png', expImgRef: LEG_GLP1, expImgTema: 'Tratamento Farmacológico da Obesidade', expImgOrigem: 'resumo' },
];
const NA_FILA = { id: 'ig-9', status: 'queued', sub: 'Tireoide', stem: 'Questão ainda na fila. Qual a conduta?', options: { A: 'a', B: 'b', C: 'c', D: 'd' }, answer: 'A', explanation: 'x' };

function fakeSupabase(email, uid) {
  return `
(function(){
  var TODAS = ${JSON.stringify(STORIES.concat([NA_FILA]))};
  var PUBLICADAS = ${JSON.stringify(STORIES)};
  var DIRETRIZES = ${JSON.stringify(DIRETRIZES)};
  window.__salvos = 0; window.__payloads = []; window.__uploads = [];
  var session = { access_token:'t', user:{ id:${JSON.stringify(uid)}, email:${JSON.stringify(email)}, user_metadata:{ nome:'Teste' } } };
  function builder(tabela){
    var st = { single:false }, b = {};
    ['select','eq','neq','in','order','limit','gte','lte','is','contains','range','or','not','filter','delete'].forEach(function(m){ b[m] = function(){ return b; }; });
    ['upsert','insert','update'].forEach(function(m){ b[m] = function(row){ window.__salvos++; if (tabela === 'endodirect_global_state' && row && row.payload) window.__payloads.push(JSON.parse(JSON.stringify(row.payload))); return b; }; });
    b.maybeSingle = function(){ st.single = true; return b; };
    b.single = function(){ st.single = true; return b; };
    b.then = function(ok, ko){
      var data = st.single ? null : [];
      if (tabela === 'endodirect_global_state' && st.single) data = { payload:{ ig_stories: TODAS, ig_pending: [], diretrizes: DIRETRIZES, adm_avisos:[], radar_avisos:[] }, updated_at:'2026-10-17T10:00:00Z' };
      return Promise.resolve({ data: data, error: null }).then(ok, ko);
    };
    b.catch = function(ko){ return b.then(null, ko); };
    return b;
  }
  var client = {
    auth: {
      getSession: function(){ return Promise.resolve({ data:{ session: session } }); },
      getUser: function(){ return Promise.resolve({ data:{ user: session.user } }); },
      onAuthStateChange: function(cb){ setTimeout(function(){ try{ cb('SIGNED_IN', session); }catch(e){} }, 5); return { data:{ subscription:{ unsubscribe: function(){} } } }; },
      signOut: function(){ return Promise.resolve({ error:null }); },
      signInWithPassword: function(){ return Promise.resolve({ data:{ session: session }, error:null }); }
    },
    storage: { from: function(bucket){ return {
      upload: function(p, f){ window.__uploads.push({ bucket: bucket, path: p, type: f && f.type }); return Promise.resolve({ data:{ path:p }, error:null }); },
      getPublicUrl: function(p){ return { data:{ publicUrl: ${JSON.stringify(UPLOAD)} + p.split('/').pop() } }; }
    }; } },
    rpc: function(nome){
      if (nome === 'endodirect_member_content' || nome === 'endodirect_member_content_sem_provas') return Promise.resolve({ data:{ acessos:['plano','plano:gold'], member:true, adm_avisos:[], radar_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[] }, error:null });
      if (nome === 'endodirect_member_provas_pagina') return Promise.resolve({ data:{ versao:'v1', total:0, por_pagina:500, paginas:1, pagina:0, itens:[] }, error:null });
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data:['plano','plano:gold'], error:null });
      if (nome === 'endodirect_qotd_publicadas') return Promise.resolve({ data: PUBLICADAS, error:null });
      if (nome === 'endodirect_is_admin') return Promise.resolve({ data: ${JSON.stringify(email === DONO)}, error:null });
      return Promise.resolve({ data:null, error:null });
    },
    from: function(t){ return builder(t); },
    channel: function(){ var c = { on:function(){ return c; }, subscribe:function(){ return c; }, unsubscribe:function(){} }; return c; },
    removeChannel: function(){}
  };
  window.supabase = { createClient: function(){ return client; } };
})();`;
}
// A IA de mentira: gera a questão de obesidade e, na escolha da figura, aponta a 1ª
// candidata da lista (o que a IA de verdade faz quando a figura serve).
let iaChamadas = [], iaComDesenho = 0;
function respostaIA(body) {
  if (body.kind === 'openi') return { ok: true, items: [] };
  const sys = String(body.system || ''), pr = String(body.prompt || '');
  iaChamadas.push(/Você escolhe a figura/.test(sys) ? 'escolha' : 'questao');
  if (/Você escolhe a figura/.test(sys) && /No desenho:/.test(pr)) iaComDesenho++;
  if (/Você escolhe a figura/.test(sys)) {
    const m = pr.match(/\[(r\d+-\d+)\]/) || pr.match(/\[(f\d+-\d+)\]/);   // a figura do livro, se estiver na lista
    return { text: JSON.stringify({ id: m ? m[1] : '', busca: '', motivo: 'Mostra onde o agonista do GLP-1 age: apetite no hipotálamo e esvaziamento gástrico.' }) };
  }
  const n = iaChamadas.filter((x) => x === 'questao').length;
  return { text: JSON.stringify({
    stem: 'Mulher de ' + (30 + n) + ' anos com obesidade grau ' + (n % 2 ? 'I' : 'II') + ' e compulsão alimentar noturna quer um remédio que reduza o apetite e retarde o esvaziamento gástrico (caso ' + n + '). Qual a classe indicada?',
    options: OPC, answer: 'A',
    explanation: 'Os agonistas do receptor de GLP-1 reduzem o apetite no hipotálamo, aumentam a saciedade e retardam o esvaziamento gástrico (caso ' + n + '); o orlistate inibe a lipase e não age no apetite.',
    imageQuery: '' }) };
}
function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      if (req.url.split('?')[0] === '/api/ai' && req.method === 'POST') {
        let b = ''; req.on('data', (c) => { b += c; });
        req.on('end', () => { let j = {}; try { j = JSON.parse(b); } catch (e) {} r.setHeader('Content-Type', 'application/json'); r.end(JSON.stringify(respostaIA(j))); });
        return;
      }
      const p = path.join(dir, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript');
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}
async function novaPagina(browser, url, email, uid, o) {
  o = o || {};
  const vp = o.vp || { width: 390, height: 844 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vp.width < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  page.on('dialog', (d) => d.accept());
  await page.addInitScript(({ uid, wn, tema, resp, sec, act }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
    if (sec) localStorage.setItem('endodirect_v1_adm_sec', JSON.stringify(sec));
    if (tema) localStorage.setItem('endodirect_theme', tema);
    if (resp && !sessionStorage.getItem('__resp_ok')) { localStorage.setItem('qotd_answered', JSON.stringify(resp)); sessionStorage.setItem('__resp_ok', '1'); }
    if (act) localStorage.setItem('endodirect_v1_act', JSON.stringify({ '2026-10-16': 1 }));
  }, { uid, wn: WHATSNEW_VER, tema: o.tema || '', resp: o.resp || null, sec: o.sec || '', act: !!o.act });
  const fake = fakeSupabase(email, uid);
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: fake });
    if (u.startsWith(LIVRO) || u.startsWith(UPLOAD)) return route.fulfill({ status: 200, contentType: 'image/png', body: u.startsWith(UPLOAD) ? PNG_UPLOAD : PNG_LIVRO });
    if (u.startsWith('https://openi.nlm.nih.gov/')) return route.fulfill({ status: 200, contentType: 'image/png', body: PNG_OPENI });
    const fig = u.match(/^https:\/\/www\.endodirect\.com\.br\/figuras\/resumos\/([a-z0-9-]+\.svg)$/);
    if (fig && fs.existsSync(path.join(REPO, 'figuras', 'resumos', fig[1]))) return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: fs.readFileSync(path.join(REPO, 'figuras', 'resumos', fig[1])) });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1700);
  return { ctx, page, erros };
}
const semModais = (page) => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
// A figura do comentário dentro de `raiz` (o item aberto do arquivo, a janela ou um cartão).
const medirFig = (page, raiz) => page.evaluate((raiz) => {
  const host = document.querySelector(raiz);
  if (!host) return { host: false };
  const item = host.querySelector('.qa-item.open') || host;
  const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
  const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const fig = item.querySelector('.qp-expfig');
  const r = { host: true, figs: item.querySelectorAll('.qp-expfig').length, noFb: !!item.querySelector('.qp-fb .qp-expfig'), largura: document.documentElement.scrollWidth, tela: innerWidth, fb: !!item.querySelector('.qp-fb') };
  if (!fig) return r;
  const img = fig.querySelector('img'), cap = fig.querySelector('figcaption'), folha = item.querySelector('.qp-folha') || item;
  const rf = fig.getBoundingClientRect(), rl = folha.getBoundingClientRect();
  r.src = img.getAttribute('src'); r.carregou = img.complete && img.naturalWidth > 0; r.zoom = img.classList.contains('qp-zoom');
  r.legenda = cap ? cap.textContent : '';
  r.contraste = cap ? +contraste(getComputedStyle(cap).color, getComputedStyle(fig).backgroundColor).toFixed(1) : 0;
  r.dentro = rf.left >= rl.left - 1 && rf.right <= rl.right + 1;
  r.alturaImg = Math.round(img.getBoundingClientRect().height); r.larguraFig = Math.round(rf.width);
  return r;
}, raiz);
const lightbox = (page) => page.evaluate(() => { const lb = document.getElementById('img-lightbox'); if (!lb) return { existe: false }; const im = lb.querySelector('img'); const cx = innerWidth / 2, cy = innerHeight / 2; const topo = document.elementFromPoint(cx, cy); return { existe: true, aberto: lb.style.display === 'flex', src: im && im.getAttribute('src'), porCima: !!(topo && (topo === lb || lb.contains(topo))) }; });

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  const shot = (page, nome) => page.screenshot({ path: path.join(SAIDA, LADO + '-' + nome + '.png') });

  // 1. aluno: celular escuro, notebook, celular claro
  for (const [nome, vp, tema] of [['aluno-celular', { width: 390, height: 844 }, ''], ['aluno-notebook', { width: 1280, height: 900 }, ''], ['aluno-celular-claro', { width: 390, height: 844 }, 'light']]) {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#qotd', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555', { vp, tema, resp: { 'ig-1': { letter: 'A', ok: true, at: 1 } } });
    await semModais(page);
    await page.waitForTimeout(400);
    const antesResp = await medirFig(page, '#panel-qotd-body');
    ok(antesResp.host && antesResp.figs === 0, nome + ': a figura do comentário apareceu ANTES da resposta (entrega o gabarito)');
    await page.click('#panel-qotd-body .qa-item.open [data-qotd-opt="B"]');
    await page.waitForTimeout(700);
    const m = await medirFig(page, '#panel-qotd-body');
    achados.push(nome + ': figuras ' + m.figs + (m.figs ? ', no gabarito ' + m.noFb + ', carregou ' + m.carregou + ', contraste da legenda ' + m.contraste + ', dentro da folha ' + m.dentro + ', ' + m.larguraFig + '×' + m.alturaImg + ' px' : '') + ', largura ' + m.largura + '/' + m.tela);
    ok(m.largura <= m.tela + 1, nome + ': a página passou da largura da tela (' + m.largura + '/' + m.tela + ')');
    if (NOVO) {
      ok(m.figs === 1 && m.noFb, nome + ': a figura do comentário não apareceu dentro do gabarito comentado');
      ok(m.carregou && m.src === STORIES[2].expImg, nome + ': a figura não carregou ou veio de outro endereço (' + m.src + ')');
      ok(m.dentro, nome + ': a figura passou da borda da folha');
      ok(m.contraste >= 4.5, nome + ': legenda da figura com contraste baixo (' + m.contraste + ')');
      ok(/📚 Resumos · Tratamento Farmacológico da Obesidade/.test(m.legenda) && /Fonte: traduzida de Kopelman/.test(m.legenda), nome + ': a legenda não traz o capítulo e a fonte: "' + m.legenda.slice(0, 90) + '"');
      // a captura mostra o gabarito comentado com a figura, não o topo da página
      await page.evaluate(() => { const f = document.querySelector('#panel-qotd-body .qa-item.open .qp-fb'); if (f) f.scrollIntoView({ block: 'start' }); });
      await page.waitForTimeout(150);
      await shot(page, nome + '-respondida');
      await page.click('#panel-qotd-body .qa-item.open .qp-expfig img');
      await page.waitForTimeout(250);
      const lb = await lightbox(page);
      ok(lb.aberto && lb.src === STORIES[2].expImg && lb.porCima, nome + ': tocar na figura não abriu o ampliador por cima de tudo (' + JSON.stringify(lb) + ')');
      if (nome === 'aluno-celular') await shot(page, nome + '-ampliada');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      ok(!(await lightbox(page)).aberto, nome + ': Esc não fechou o ampliador');
    } else {
      ok(m.figs === 0, nome + ' (antes): a main não devia ter figura no comentário');
      await page.evaluate(() => { const f = document.querySelector('#panel-qotd-body .qa-item.open .qp-fb'); if (f) f.scrollIntoView({ block: 'start' }); });
      await page.waitForTimeout(150);
      await shot(page, nome + '-respondida');
    }
    // a do PubMed (ig-2)
    await page.click('#panel-qotd-body [data-qa-toggle="ig-2"]');
    await page.waitForTimeout(300);
    await page.click('#panel-qotd-body .qa-item.open [data-qotd-opt="A"]');
    await page.waitForTimeout(600);
    const p = await medirFig(page, '#panel-qotd-body');
    if (NOVO) ok(p.figs === 1 && p.carregou && /Open-i · PMID 123456/.test(p.legenda) && !/📚/.test(p.legenda), nome + ': a figura do PubMed não saiu com a minirreferência (' + p.legenda + ')');
    else ok(p.figs === 0, nome + ' (antes): figura do PubMed na main?');
    // a antiga (ig-1, já respondida): sem figura, como sempre
    await page.click('#panel-qotd-body [data-qa-toggle="ig-1"]');
    await page.waitForTimeout(300);
    const a = await medirFig(page, '#panel-qotd-body');
    ok(a.fb && a.figs === 0, nome + ': a questão antiga, sem figura, mudou (gabarito ' + a.fb + ', figuras ' + a.figs + ')');
    ok(erros.length === 0, nome + ': pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  // 2. a janela do mural
  {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#mural', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555', { resp: { 'ig-1': { letter: 'A', ok: true, at: 1 } }, act: true });
    await semModais(page);
    await page.waitForTimeout(600);
    const aberta = await page.evaluate(() => { const m = document.getElementById('qotd-modal'); return !!m && m.style.display !== 'none'; });
    ok(aberta, 'mural: a janela da Questão do Dia não abriu');
    if (aberta) {
      await page.click('#qotd-modal [data-qotd-opt="C"]');
      await page.waitForTimeout(700);
      const m = await medirFig(page, '#qotd-modal');
      achados.push('mural: figuras ' + m.figs + (m.figs ? ', carregou ' + m.carregou + ', dentro da folha ' + m.dentro : ''));
      if (NOVO) {
        ok(m.figs === 1 && m.noFb && m.carregou && m.dentro, 'mural: a janela não mostrou a figura do comentário depois da resposta');
        await page.evaluate(() => { const f = document.querySelector('#qotd-modal .qp-expfig'); if (f) f.scrollIntoView({ block: 'center' }); });
        await page.waitForTimeout(200);
        await shot(page, 'mural-janela-respondida');
        await page.click('#qotd-modal .qp-expfig img');
        await page.waitForTimeout(250);
        const lb = await lightbox(page);
        ok(lb.aberto && lb.porCima, 'mural: o ampliador não ficou por cima da janela (' + JSON.stringify(lb) + ')');
        await page.keyboard.press('Escape');
      } else { ok(m.figs === 0, 'mural (antes): figura na main?'); await shot(page, 'mural-janela-respondida'); }
    }
    ok(erros.length === 0, 'mural: pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  // 3. professor dono: lote → tirar de uma → distribuir → Pendências → aprovar → postar → "Como o aluno vê"
  {
    iaChamadas = [];
    const { ctx, page, erros } = await novaPagina(browser, URL, DONO, '99999999-2222-3333-4444-555555555555', { vp: { width: 1280, height: 900 }, sec: 'stories' });
    await semModais(page);
    await page.waitForTimeout(500);
    await page.click('[data-stview="lote"]').catch(() => {});
    await page.selectOption('#ig-lote-qty', '3');
    await page.selectOption('#ig-lote-sub', 'Obesidade');
    await page.selectOption('#ig-lote-formato', 'direta').catch(() => {});
    await page.click('#ig-lote-gen');
    await page.waitForFunction(() => { const b = document.getElementById('ig-lote-gen'); return b && !b.disabled; }, null, { timeout: 30000 });
    await page.waitForTimeout(300);
    const lote = await page.evaluate(() => [...document.querySelectorAll('#ig-lote-results [data-iglote-dist]')].map((b) => { const card = b.closest('div[style*="border-radius:12px"]'); return { tag: /🖼️ comentário/.test(card.textContent), figs: card.querySelectorAll('.qp-expfig').length, porque: /Por que esta figura/.test(card.textContent) }; }));
    const nEscolha = iaChamadas.filter((x) => x === 'escolha').length, nQuestao = iaChamadas.filter((x) => x === 'questao').length;
    achados.push('lote: ' + lote.length + ' questões, com figura no comentário ' + lote.filter((x) => x.tag).length + '; chamadas à IA: ' + nQuestao + ' de questão e ' + nEscolha + ' de escolha da figura');
    ok(lote.length === 3, 'lote: não saíram as 3 questões (' + lote.length + ')');
    if (NOVO) {
      ok(lote.every((x) => x.tag && x.figs === 1 && x.porque), 'lote: nem toda questão veio com a figura do comentário, a marca e o porquê: ' + JSON.stringify(lote));
      ok(nEscolha === 3, 'lote: a escolha da figura não foi pedida uma vez por questão (' + nEscolha + ')');
      ok(iaComDesenho === 3, 'lote: a escolha não recebeu o texto do esquema (figuras/resumos/textos.json não foi lido?): ' + iaComDesenho + ' de 3');
      // abre o 1º cartão e confere a figura; clicar nela amplia sem recolher o cartão
      await page.click('[data-iglote-toggle="0"]');
      await page.waitForTimeout(200);
      await shot(page, 'professor-lote');
      await page.click('[data-iglote-full="0"] .qp-expfig img');
      await page.waitForTimeout(200);
      const lb = await lightbox(page);
      const aindaAberto = await page.evaluate(() => document.querySelector('[data-iglote-full="0"]').style.display !== 'none');
      ok(lb.aberto && aindaAberto, 'lote: clicar na figura não ampliou, ou recolheu o cartão (' + JSON.stringify(lb) + ', aberto ' + aindaAberto + ')');
      await page.keyboard.press('Escape');
      // tira a figura do 3º
      await page.click('[data-iglote-toggle="2"]');
      await page.waitForTimeout(150);
      await page.click('[data-iglote-rmexp="2"]');
      await page.waitForTimeout(200);
      const tags = await page.evaluate(() => [...document.querySelectorAll('#ig-lote-results [data-iglote-dist]')].map((b) => /🖼️ comentário/.test(b.closest('div[style*="border-radius:12px"]').textContent)));
      ok(JSON.stringify(tags) === '[true,true,false]', 'lote: "Tirar a imagem do comentário" não tirou só a do 3º cartão: ' + JSON.stringify(tags));
    } else {
      ok(lote.every((x) => !x.tag && x.figs === 0), 'lote (antes): figura no comentário na main?');
      ok(nEscolha === 0, 'lote (antes): a main pediu escolha de figura?');
    }
    // distribui o 1º (vai para as Pendências do próprio dono, curador de Obesidade)
    await page.click('[data-iglote-dist="0"]');
    await page.waitForTimeout(400);
    await page.click('.adm-nav[data-asec="pendencias"]');
    await page.waitForTimeout(500);
    const pend = await page.evaluate(() => { const c = document.querySelector('[data-pend-card]'); if (!c) return { card: false }; return { card: true, figs: c.querySelectorAll('.qp-expfig').length, check: !!c.querySelector('[id^="pend-rmexp-"]'), carregou: [...c.querySelectorAll('.qp-expfig img')].every((i) => i.complete && i.naturalWidth > 0) }; });
    achados.push('pendências: cartão ' + pend.card + ', figuras ' + pend.figs + ', opção de tirar ' + pend.check);
    ok(pend.card, 'pendências: a questão distribuída não chegou');
    if (NOVO) ok(pend.figs === 1 && pend.check && pend.carregou, 'pendências: o revisor não vê a figura do comentário e a opção de tirá-la');
    if (pend.card) {
      await page.evaluate(() => { const c = document.querySelector('[data-pend-card]'); if (c) c.scrollIntoView({ block: 'start' }); });
      await shot(page, 'professor-pendencias');
      await page.click('[data-pend-ok]');
      await page.waitForTimeout(500);
    }
    // posta e vê como o aluno
    await page.click('.adm-nav[data-asec="stories"]');
    await page.waitForTimeout(500);
    await page.click('[data-stview="fila"]');
    await page.waitForTimeout(200);
    const nFila = await page.evaluate(() => document.querySelectorAll('#stview-fila [data-ig-toggle]').length);
    // a aprovada entra no fim da fila (depois da que já estava): marca a última como postada
    await page.evaluate(() => { const bs = document.querySelectorAll('#stview-fila [data-ig-toggle]'); bs[bs.length - 1].click(); });
    await page.waitForTimeout(500);
    await page.click('[data-stview="aluno"]');
    await page.waitForTimeout(400);
    const postadaTopo = await page.evaluate(() => { const h = document.querySelector('#adm-qotd-aluno .qa-head'); return h ? h.getAttribute('data-admqal-toggle') : ''; });
    await page.evaluate(() => { const h = document.querySelector('#adm-qotd-aluno .qa-item.open'); if (!h) { const b = document.querySelector('#adm-qotd-aluno .qa-head'); if (b) b.click(); } });
    await page.waitForTimeout(300);
    await page.click('#adm-qotd-aluno .qa-item.open [data-qotd-opt="B"]');
    await page.waitForTimeout(600);
    const comoAluno = await medirFig(page, '#adm-qotd-aluno');
    const salvo = await page.evaluate(() => { const p = window.__payloads[window.__payloads.length - 1]; return p ? (p.ig_stories || []).filter((s) => s && s.expImg).map((s) => ({ id: s.id, origem: s.expImgOrigem, motivo: '_expMotivo' in s, status: s.status })) : null; });
    achados.push('publicada: fila ' + nFila + ', topo "' + postadaTopo + '", figuras no "Como o aluno vê" ' + comoAluno.figs + '; no estado salvo, com figura: ' + JSON.stringify(salvo));
    if (NOVO) {
      ok(comoAluno.figs === 1 && comoAluno.carregou, '"Como o aluno vê": a questão publicada do lote não mostrou a figura do comentário depois da resposta');
      ok(salvo && salvo.some((s) => s.origem === 'resumo' && s.status === 'posted' && !s.motivo), 'o estado salvo não tem a questão publicada com a figura dos Resumos (ou gravou o porquê): ' + JSON.stringify(salvo));
      await shot(page, 'professor-como-o-aluno-ve');
    }
    ok(erros.length === 0, 'professor (lote): pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  // 4. formulário manual
  if (NOVO) {
    iaChamadas = [];
    const { ctx, page, erros } = await novaPagina(browser, URL, DONO, '99999999-2222-3333-4444-555555555555', { vp: { width: 390, height: 844 }, sec: 'stories' });
    await semModais(page);
    await page.waitForTimeout(500);
    await page.click('[data-stview="manual"]');
    await page.waitForTimeout(200);
    await page.selectOption('#ig-sub', 'Obesidade');
    await page.click('#ig-gen');
    await page.waitForFunction(() => { const b = document.getElementById('ig-gen'); return b && !b.disabled; }, null, { timeout: 30000 });
    await page.waitForTimeout(400);
    const f1 = await page.evaluate(() => ({ status: (document.getElementById('ig-gen-status') || {}).textContent || '', figs: document.querySelectorAll('#ig-expimg-prev .qp-expfig').length, leg: (document.getElementById('ig-expimg-ref') || {}).value || '', origem: ((document.getElementById('ig-expimg-prev') || {}).textContent || '').match(/Imagem do comentário [^\n✕]*/) }));
    achados.push('manual: "' + f1.status + '", figuras na prévia ' + f1.figs + ', legenda ' + (f1.leg ? f1.leg.slice(0, 40) + '…' : '(vazia)'));
    ok(/com figura no comentário/.test(f1.status) && f1.figs === 1 && /Fonte: traduzida de Kopelman/.test(f1.leg), 'manual: "Gerar 1 com IA" não trouxe a figura do comentário com a legenda editável');
    await page.evaluate(() => { const e = document.getElementById('ig-expimg-prev'); if (e) e.scrollIntoView({ block: 'center' }); });
    await shot(page, 'manual-gerada');
    await page.click('#ig-expimg-clear');
    await page.waitForTimeout(150);
    ok(await page.evaluate(() => !document.querySelector('#ig-expimg-prev .qp-expfig')), 'manual: ✕ não tirou a figura do comentário');
    await page.click('#ig-expimg-sug');
    await page.waitForFunction(() => { const b = document.getElementById('ig-expimg-sug'); return b && !b.disabled; }, null, { timeout: 20000 });
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.querySelectorAll('#ig-expimg-prev .qp-expfig').length === 1), 'manual: "Sugerir dos Resumos / PubMed" não trouxe a figura de volta');
    // envia uma nova: vai para o armazenamento e fica só a URL
    await page.setInputFiles('#ig-expimg-file', UP_ARQ);
    await page.waitForFunction(() => { const b = document.getElementById('ig-expimg-up'); return b && !b.disabled && /enviada/.test((document.getElementById('ig-expimg-prev') || {}).textContent || ''); }, null, { timeout: 20000 });
    const up = await page.evaluate(() => ({ uploads: window.__uploads, src: (document.querySelector('#ig-expimg-prev .qp-expfig img') || {}).getAttribute && document.querySelector('#ig-expimg-prev .qp-expfig img').getAttribute('src') }));
    ok(up.uploads.length === 1 && /^qotd\//.test(up.uploads[0].path) && /^https:\/\//.test(up.src || '') && !/^data:/.test(up.src || ''), 'manual: a imagem nova não foi para o armazenamento (ou ficou em base64): ' + JSON.stringify(up));
    await page.fill('#ig-expimg-ref', 'Figura enviada pelo professor: mecanismo do GLP-1.');
    await page.click('#ig-approve');
    await page.waitForTimeout(500);
    await page.click('[data-stview="fila"]');
    await page.waitForTimeout(200);
    await page.evaluate(() => { const bs = document.querySelectorAll('#stview-fila [data-ig-load]'); bs[bs.length - 1].click(); });
    await page.waitForTimeout(400);
    const f2 = await page.evaluate(() => ({ figs: document.querySelectorAll('#ig-expimg-prev .qp-expfig').length, leg: (document.getElementById('ig-expimg-ref') || {}).value || '', src: (document.querySelector('#ig-expimg-prev .qp-expfig img') || { getAttribute: () => '' }).getAttribute('src') }));
    achados.push('manual: reaberta da fila com figura ' + f2.figs + ', legenda "' + f2.leg + '", ' + (f2.src || '').slice(-30));
    ok(f2.figs === 1 && f2.leg === 'Figura enviada pelo professor: mecanismo do GLP-1.' && /qotd\/2026-10-21\//.test(f2.src), 'manual: aprovar e reabrir na Fila perdeu a imagem enviada ou a legenda editada: ' + JSON.stringify(f2));
    ok(erros.length === 0, 'manual: pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + ' (versão nova: ' + NOVO + ')');
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
