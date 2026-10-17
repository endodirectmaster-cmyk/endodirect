// Harness da QUESTÃO DO DIA NA PRANCHETA e da aba "COMO O ALUNO VÊ" (17/10/2026).
//
// Pedido do professor: "Deixe a questão do dia aparecendo no perfil do professor de
// forma semelhante como aparece para o aluno. Deixa uma aba ao lado de 'postados'" e
// "Vamos deixar mais didático a visualização da questão do dia", com a figura de uma
// prancheta (prendedor, folha branca, "Questão do dia" e o caso).
//
// Cenários:
//   1. aluno no celular (390) e no notebook (1280), tema escuro: o arquivo abre na de
//      hoje, em prancheta, com o caso e a pergunta final em destaque; o prendedor não
//      é cortado; nada passa da largura da tela; a tinta da folha tem contraste ≥ 7;
//      responder grava como antes (qotd_answered) e mostra o gabarito comentado;
//   2. o mesmo no tema claro (a folha continua branca e legível);
//   3. aluno que já respondeu outra entra no mural: a janela traz a prancheta inteira;
//   4. professor dono (notebook e celular): a aba "Como o aluno vê" vem logo depois de
//      "Postados", mostra só as publicadas, a de hoje aberta; responder ali mostra o
//      gabarito, NÃO grava (qotd_answered intacto, nenhum salvamento a mais) e
//      "Limpar respostas de teste" zera.
// Uso: LADO=antes RAIZ_APP=<pasta com o index.html da main> | LADO=depois (padrão)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const NOVO = /function renderAdmQotdAluno\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = LADO === 'depois' ? 8861 : 8862;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
const DONO = 'rodolphomend@gmail.com'; // QOTD_OWNERS do index.html (só local: o Supabase aqui é falso)
const DIA = 86400000, BASE = Date.UTC(2026, 9, 14, 11, 0, 0);
const STEMS = [
  'Homem de 45 anos com bócio multinodular e TSH suprimido. Considerando o caso acima, qual a conduta (ex. iniciar metimazol)?',
  'Paciente de 40 anos com TSH 8 mUI/L e T4 livre normal, assintomática. Assinale a alternativa correta.',
  'Mulher de 34 anos, com sarcoidose pulmonar e cutânea confirmada por biópsia há 2 anos, assintomática. Refere banhos de sol diários e cápsulas de vitamina D há 3 meses. Exames: cálcio total 11,8 mg/dL [VR 8,5–10,5], PTH 6 pg/mL [VR 15–65], 1,25(OH)2D 92 pg/mL [VR 19–67]. TC de abdome: nefrocalcinose medular bilateral. Qual a melhor conduta inicial?',
];
const STORIES = STEMS.map((stem, i) => ({ id: 'ig-' + (i + 1), status: 'posted', postedAt: BASE + i * DIA, sub: 'Osteometabolismo', stem, options: { A: 'Suspender vitamina D e exposição solar + prednisolona', B: 'Paratireoidectomia', C: 'Restrição hídrica e tiazídico', D: 'Pamidronato IV como medida isolada' }, answer: 'A', explanation: 'Comentário da questão ' + (i + 1) + ': hipercalcemia mediada por 1,25(OH)2D no granuloma.' }));
const NA_FILA = { id: 'ig-9', status: 'queued', sub: 'Tireoide', stem: 'Questão ainda na fila. Qual a conduta?', options: { A: 'a', B: 'b' }, answer: 'A' };

function fakeSupabase(email, uid) {
  return `
(function(){
  var TODAS = ${JSON.stringify(STORIES.concat([NA_FILA]))};
  var PUBLICADAS = ${JSON.stringify(STORIES)};
  window.__salvos = 0;
  var session = { access_token:'t', user:{ id:${JSON.stringify(uid)}, email:${JSON.stringify(email)}, user_metadata:{ nome:'Teste' } } };
  function builder(tabela){
    var st = { single:false }, b = {};
    ['select','eq','neq','in','order','limit','gte','lte','is','contains','range','or','not','filter','delete'].forEach(function(m){ b[m] = function(){ return b; }; });
    ['upsert','insert','update'].forEach(function(m){ b[m] = function(){ window.__salvos++; return b; }; });
    b.maybeSingle = function(){ st.single = true; return b; };
    b.single = function(){ st.single = true; return b; };
    b.then = function(ok, ko){
      var data = st.single ? null : [];
      if (tabela === 'endodirect_global_state' && st.single) data = { payload:{ ig_stories: TODAS, adm_avisos:[], radar_avisos:[] }, updated_at:'2026-10-17T10:00:00Z' };
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
function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
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
  await page.addInitScript(({ uid, wn, tema, resp, sec, act }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
    if (sec) localStorage.setItem('endodirect_v1_adm_sec', JSON.stringify(sec));
    if (tema) localStorage.setItem('endodirect_theme', tema);
    if (resp && !sessionStorage.getItem('__resp_ok')) { localStorage.setItem('qotd_answered', JSON.stringify(resp)); sessionStorage.setItem('__resp_ok', '1'); }
    // quem já estudou (DB.act não vazio) sai do "Comece por aqui" e passa a ver a janela do mural
    if (act) localStorage.setItem('endodirect_v1_act', JSON.stringify({ '2026-10-16': 1 }));
  }, { uid, wn: WHATSNEW_VER, tema: o.tema || '', resp: o.resp || null, sec: o.sec || '', act: !!o.act });
  const fake = fakeSupabase(email, uid);
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: fake });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1700);
  return { ctx, page, erros };
}
const semModais = (page) => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
// Mede a prancheta aberta dentro de `raiz` (seletor CSS).
const medir = (page, raiz) => page.evaluate((raiz) => {
  const host = document.querySelector(raiz);
  if (!host) return { host: false };
  const item = host.querySelector('.qa-item.open') || host;
  const qp = item.querySelector('.qp');
  const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
  const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const r = { host: true, qp: !!qp, abertas: [...host.querySelectorAll('.qa-item.open .qa-head')].map((b) => b.getAttribute('data-qa-toggle') || b.getAttribute('data-admqal-toggle')), ids: [...host.querySelectorAll('.qa-head')].map((b) => b.getAttribute('data-qa-toggle') || b.getAttribute('data-admqal-toggle')), largura: document.documentElement.scrollWidth, tela: innerWidth };
  if (!qp) { r.cardAntigo = !!item.querySelector('[data-qotd-opt]'); return r; }
  const folha = qp.querySelector('.qp-folha'), caso = qp.querySelector('.qp-caso'), perg = qp.querySelector('.qp-perg'), opt = qp.querySelector('.qp-opt');
  const clip = qp.querySelector('.qp-clip').getBoundingClientRect();
  const head = item.querySelector('.qa-head');
  const teto = head ? head.getBoundingClientRect().bottom : (item.getBoundingClientRect().top);
  const fundo = getComputedStyle(folha).backgroundColor;
  r.titulo = (qp.querySelector('.qp-tit') || {}).textContent || '';
  r.caso = caso ? caso.textContent : '';
  r.perg = perg ? perg.textContent : '';
  r.opcoes = qp.querySelectorAll('.qp-opt .qp-letra').length;
  r.fundoFolha = fundo;
  r.alinhamento = [caso, perg].filter(Boolean).map((e) => getComputedStyle(e).textAlign).join(',');
  r.contrasteCaso = +contraste(getComputedStyle(caso).color, fundo).toFixed(1);
  r.contrasteOpcao = +contraste(getComputedStyle(opt).color, getComputedStyle(opt).backgroundColor).toFixed(1);
  r.folgaPrendedor = Math.round(clip.top - 24 - teto); // topo da "cabeça" do prendedor − teto do contêiner
  r.direita = Math.round(qp.getBoundingClientRect().right);
  r.fb = (qp.querySelector('.qp-fb') || {}).className || '';
  r.fbTexto = (qp.querySelector('.qp-fb') || {}).textContent || '';
  r.classes = [...qp.querySelectorAll('.qp-opt')].map((b) => b.className.replace('qp-opt', '').trim() || '-').join(',');
  r.contador = ((host.querySelector('span') || {}).textContent || '').trim();
  return r;
}, raiz);

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  const prancheta = (m, onde) => {
    ok(m.qp, onde + ': a questão aberta não está na prancheta');
    if (!m.qp) return;
    ok(m.titulo === 'Questão do dia', onde + ': título da folha "' + m.titulo + '"');
    ok(/bilateral\.$/.test(m.caso) && m.perg === 'Qual a melhor conduta inicial?', onde + ': caso e pergunta não se separaram (caso "…' + m.caso.slice(-30) + '", pergunta "' + m.perg + '")');
    ok(m.opcoes === 4, onde + ': ' + m.opcoes + ' alternativas com letra');
    ok(m.fundoFolha === 'rgb(255, 255, 255)', onde + ': a folha não é branca (' + m.fundoFolha + ')');
    ok(m.alinhamento === 'justify,justify', onde + ': o caso e a pergunta não estão justificados (' + m.alinhamento + ')');
    ok(m.contrasteCaso >= 7 && m.contrasteOpcao >= 7, onde + ': contraste baixo na folha (caso ' + m.contrasteCaso + ', alternativa ' + m.contrasteOpcao + ')');
    ok(m.folgaPrendedor >= 0, onde + ': o prendedor sai do contêiner e é cortado (folga ' + m.folgaPrendedor + ' px)');
    ok(m.largura <= m.tela + 1 && m.direita <= m.tela, onde + ': passa da largura da tela (' + m.largura + '/' + m.tela + ', borda direita ' + m.direita + ')');
  };

  // 1 e 2. aluno, celular e notebook, tema escuro e claro
  for (const [nome, vp, tema] of [['aluno-celular', { width: 390, height: 844 }, ''], ['aluno-notebook', { width: 1280, height: 900 }, ''], ['aluno-celular-claro', { width: 390, height: 844 }, 'light']]) {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#qotd', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555', { vp, tema, resp: { 'ig-1': { letter: 'A', ok: true, at: 1 } } });
    await semModais(page);
    await page.waitForTimeout(500);
    const m = await medir(page, '#panel-qotd-body');
    achados.push(nome + ': aberta ' + JSON.stringify(m.abertas) + ', prancheta ' + m.qp + (m.qp ? ', contraste ' + m.contrasteCaso + '/' + m.contrasteOpcao + ', folga do prendedor ' + m.folgaPrendedor + ' px, largura ' + m.largura + '/' + m.tela : ''));
    ok(JSON.stringify(m.abertas) === '["ig-3"]', nome + ': a de hoje (ig-3) não abriu sozinha: ' + JSON.stringify(m.abertas));
    ok(JSON.stringify(m.ids) === '["ig-3","ig-2","ig-1"]', nome + ': ordem/lista do aluno mudou: ' + JSON.stringify(m.ids));
    if (NOVO) prancheta(m, nome); else ok(!m.qp && m.cardAntigo, nome + ' (antes): esperava o cartão antigo');
    await page.screenshot({ path: path.join(__dirname, LADO + '-' + nome + '.png') });
    // responde errado (A é a certa): grava como antes e mostra o gabarito
    await page.click('#panel-qotd-body .qa-item.open [data-qotd-opt="C"]');
    await page.waitForTimeout(300);
    const r = await medir(page, '#panel-qotd-body');
    const gravado = await page.evaluate(() => JSON.parse(localStorage.getItem('qotd_answered') || '{}'));
    ok(gravado['ig-3'] && gravado['ig-3'].letter === 'C' && gravado['ig-3'].ok === false, nome + ': a resposta do aluno não foi gravada em qotd_answered: ' + JSON.stringify(gravado));
    if (NOVO) {
      ok(/err/.test(r.fb) && /Resposta correta: A/.test(r.fbTexto) && /Comentário da questão 3/.test(r.fbTexto), nome + ': gabarito comentado não apareceu (' + r.fb + ' "' + r.fbTexto.slice(0, 60) + '")');
      ok(r.classes === 'certa,apagada,errada,apagada', nome + ': marcação das alternativas após responder: ' + r.classes);
      await page.screenshot({ path: path.join(__dirname, LADO + '-' + nome + '-respondida.png') });
    }
    ok(erros.length === 0, nome + ': pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }
  // 1b. a questão sem pergunta final vai inteira (não corta "ex." nem "Assinale…")
  if (NOVO) {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#qotd/ig-1', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555', { resp: { 'ig-3': { letter: 'A', ok: true, at: 1 } } });
    await semModais(page);
    await page.waitForTimeout(500);
    const m1 = await medir(page, '#panel-qotd-body');
    ok(m1.qp && m1.perg === '' && /\(ex\. iniciar metimazol\)\?$/.test(m1.caso), 'ig-1: o enunciado devia ir inteiro, sem cortar no "ex." (pergunta "' + m1.perg + '")');
    await page.click('#panel-qotd-body [data-qa-toggle="ig-2"]');
    await page.waitForTimeout(250);
    const m2 = await medir(page, '#panel-qotd-body');
    ok(m2.qp && m2.perg === '' && /Assinale a alternativa correta\.$/.test(m2.caso), 'ig-2: o enunciado sem "?" devia ir inteiro');
    achados.push('enunciados sem pergunta final: ig-1 e ig-2 inteiros');
    ok(erros.length === 0, '1b: pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  // 3. mural: a janela da Questão do Dia traz a prancheta inteira
  {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#mural', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555', { resp: { 'ig-1': { letter: 'A', ok: true, at: 1 } }, act: true });
    await semModais(page);
    await page.waitForTimeout(600);
    const j = await page.evaluate(() => {
      const m = document.getElementById('qotd-modal'); if (!m || m.style.display === 'none') return { aberta: false };
      const d = m.querySelector('.qotd-dialog'), qp = m.querySelector('.qp');
      if (!qp) return { aberta: true, qp: false };
      const clip = qp.querySelector('.qp-clip').getBoundingClientRect();
      return { aberta: true, qp: true, folga: Math.round(clip.top - 24 - d.getBoundingClientRect().top + d.scrollTop) };
    });
    achados.push('mural: janela ' + j.aberta + ', prancheta ' + j.qp + (j.qp ? ', folga do prendedor ' + j.folga + ' px' : ''));
    ok(j.aberta, 'mural: a janela da Questão do Dia não abriu');
    if (NOVO) ok(j.qp && j.folga >= 0, 'mural: a janela não traz a prancheta inteira (folga ' + j.folga + ')');
    await page.screenshot({ path: path.join(__dirname, LADO + '-mural-janela.png') });
    ok(erros.length === 0, 'mural: pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  // 4. professor dono: aba "Como o aluno vê"
  for (const [nome, vp] of [['professor-notebook', { width: 1280, height: 900 }], ['professor-celular', { width: 390, height: 844 }]]) {
    const { ctx, page, erros } = await novaPagina(browser, URL, DONO, '99999999-2222-3333-4444-555555555555', { vp, sec: 'stories' });
    await semModais(page);
    await page.waitForTimeout(500);
    const abas = await page.evaluate(() => [...document.querySelectorAll('[data-stview]')].map((b) => b.getAttribute('data-stview') + ':' + b.textContent.trim()));
    achados.push(nome + ': abas ' + JSON.stringify(abas));
    ok(abas.length >= 4 && abas[0].indexOf('lote:') === 0, nome + ': não caiu no painel da Questão do Dia do dono (abas ' + JSON.stringify(abas) + ')');
    if (!NOVO) { ok(!abas.some((a) => /^aluno:/.test(a)), nome + ' (antes): não devia existir a aba'); await ctx.close(); continue; }
    const iPost = abas.findIndex((a) => /^postados:/.test(a)), iAluno = abas.findIndex((a) => /^aluno:/.test(a));
    ok(iAluno === iPost + 1 && /Como o aluno vê/.test(abas[iAluno] || ''), nome + ': a aba "Como o aluno vê" não está logo depois de "Postados"');
    const salvosAntes = await page.evaluate(() => window.__salvos);
    await page.click('[data-stview="aluno"]');
    await page.waitForTimeout(300);
    const m = await medir(page, '#adm-qotd-aluno');
    achados.push(nome + ': lista ' + JSON.stringify(m.ids) + ', aberta ' + JSON.stringify(m.abertas) + ', prancheta ' + m.qp + ', ' + m.contador);
    ok(JSON.stringify(m.ids) === '["ig-3","ig-2","ig-1"]', nome + ': a aba devia listar só as publicadas, da mais recente: ' + JSON.stringify(m.ids));
    ok(JSON.stringify(m.abertas) === '["ig-3"]', nome + ': a de hoje não abriu sozinha na aba');
    prancheta(m, nome);
    await page.screenshot({ path: path.join(__dirname, LADO + '-' + nome + '.png') });
    await page.click('#adm-qotd-aluno .qa-item.open [data-qotd-opt="A"]');
    await page.waitForTimeout(300);
    const r = await medir(page, '#adm-qotd-aluno');
    const gravado = await page.evaluate(() => localStorage.getItem('qotd_answered'));
    const salvosDepois = await page.evaluate(() => window.__salvos);
    ok(/ok/.test(r.fb) && /Você acertou/.test(r.fbTexto), nome + ': o gabarito não apareceu na aba (' + r.fb + ')');
    ok(/1 de 3/.test(r.contador), nome + ': contador da aba "' + r.contador + '"');
    ok(!gravado || gravado === '{}', nome + ': a resposta de teste do professor foi GRAVADA em qotd_answered: ' + gravado);
    ok(salvosDepois === salvosAntes, nome + ': responder na aba disparou salvamento remoto (' + salvosAntes + ' → ' + salvosDepois + ')');
    await page.screenshot({ path: path.join(__dirname, LADO + '-' + nome + '-respondida.png') });
    await page.click('#adm-qal-limpar');
    await page.waitForTimeout(250);
    const z = await medir(page, '#adm-qotd-aluno');
    ok(!z.fb && /0 de 3/.test(z.contador), nome + ': "Limpar respostas de teste" não zerou (' + z.fb + ', "' + z.contador + '")');
    // vai a "Postados" e volta: a aba continua de pé
    await page.click('[data-stview="postados"]');
    await page.waitForTimeout(150);
    await page.click('[data-stview="aluno"]');
    await page.waitForTimeout(250);
    const v = await medir(page, '#adm-qotd-aluno');
    ok(v.qp && JSON.stringify(v.ids) === '["ig-3","ig-2","ig-1"]', nome + ': depois de ir a "Postados" e voltar, a aba não se redesenhou');
    ok(erros.length === 0, nome + ': pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + ' (versão nova: ' + NOVO + ')');
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
