// O Mural em Chromium REAL — a discussão completa com as tabelas do artigo.
//
// POR QUE ISTO EXISTE (14/10/2026): o Eduardo mandou um vídeo do celular com a
// discussão de uma revisão de disruptores tireoidianos. Três tabelas apareciam
// como texto cru (barras e tracinhos) e, nas outras, as linhas que continuavam
// uma célula mesclada saíam deslocadas uma coluna. Este harness abre o app
// INTEIRO, com assinante Gold e Supabase falso que entrega o card e a
// discussão, e conta o que o aluno vê.
//
//   LADO=antes RAIZ_APP=<pasta com o index.html da main>  → o app publicado
//   LADO=depois (padrão, pasta do repositório)            → o app novo
//   DADOS=<pasta>  discussao-antiga.md (tabelas pelo conversor de antes, como
//                  estão gravadas), discussao-nova.md (conversor novo),
//                  previa.md e item.json. Os dados vêm do JATS do artigo e
//                  ficam FORA do repositório.
//
// Cenários:
//   1. Discussão como está gravada hoje. Antes: tabelas em texto cru (o vídeo).
//      Depois: nenhuma barra solta, as 6 tabelas abrem.
//   2. (depois) Discussão com as tabelas reconvertidas: 6 tabelas, toda linha
//      com o mesmo número de células do cabeçalho, e a linha que continua a
//      célula mesclada traz o nome da substância na coluna certa.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const DADOS = process.env.DADOS;
if (!DADOS) { console.error('defina DADOS'); process.exit(2); }
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
// Expectativa pelo que o index.html servido TEM, não pelo rótulo do lado.
const TEM_CORRECAO = /\(isRow\(line\)\|\|isRowCont\(line\)\)&&i\+1<lines\.length&&isSep/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '11111111-2222-3333-4444-555555555555';
const PORTA = LADO === 'depois' ? 8821 : 8822;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
const ITEM = JSON.parse(fs.readFileSync(path.join(DADOS, 'item.json'), 'utf8'));
const PREVIA = fs.readFileSync(path.join(DADOS, 'previa.md'), 'utf8');

const FAKE_SUPABASE = `
(function(){
  var R = window.__rede = Object.assign({ chamadas:{} }, window.__redeInicial || {});
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  function conteudo(){ return { acessos:['plano','plano:gold'], member:true, adm_avisos:[], radar_avisos:[R.item], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:0} }; }
  function builder(){
    var st = { single:false }, b = {};
    ['select','eq','neq','in','order','limit','upsert','insert','update','delete','gte','lte','is','contains','range'].forEach(function(m){ b[m] = function(){ return b; }; });
    b.maybeSingle = function(){ st.single = true; return b; };
    b.single = function(){ st.single = true; return b; };
    b.then = function(ok, ko){ return Promise.resolve({ data: st.single ? null : [], error: null }).then(ok, ko); };
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
    rpc: function(nome, args){
      R.chamadas[nome] = (R.chamadas[nome]||0)+1;
      if (nome === 'endodirect_member_content' || nome === 'endodirect_member_content_sem_provas') return Promise.resolve({ data: conteudo(), error:null });
      if (nome === 'endodirect_member_provas_pagina') return Promise.resolve({ data:{ versao:'v1', total:0, por_pagina:500, paginas:1, pagina:0, itens:[] }, error:null });
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data:['plano','plano:gold'], error:null });
      if (nome === 'endodirect_mural_discussoes_previas') { var p = {}; p[R.item.sourceId] = R.previa; return Promise.resolve({ data:p, error:null }); }
      if (nome === 'endodirect_mural_discussoes_ids') return Promise.resolve({ data:[R.item.sourceId], error:null });
      if (nome === 'endodirect_mural_discussao') return Promise.resolve({ data:{ markdown: R.discussao }, error:null });
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes:[], diretrizes_temas:[] }, error:null });
      if (nome === 'endodirect_qotd_publicadas') return Promise.resolve({ data:[], error:null });
      return Promise.resolve({ data:null, error:null });
    },
    from: function(){ return builder(); },
    channel: function(){ var c = { on:function(){ return c; }, subscribe:function(){ return c; }, unsubscribe:function(){} }; return c; },
    removeChannel: function(){}
  };
  window.supabase = { createClient: function(){ return client; } };
})();`;

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

// Celular do vídeo: 392 × 850.
async function abreDiscussao(browser, url, discussao) {
  const ctx = await browser.newContext({ viewport: { width: 392, height: 850 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, rede, wn }) => {
    window.__redeInicial = rede;
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
  }, { uid: UID, rede: { item: ITEM, previa: PREVIA, discussao: discussao }, wn: WHATSNEW_VER });
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
  // Menu lateral: no celular ele fica recolhido; o clique vai pelo próprio botão.
  await page.evaluate(() => { const b = document.querySelector('button.sb-item[data-p="mural"]'); if (b) b.click(); });
  const sel = 'details.mural-disc[data-disc="' + ITEM.sourceId + '"]';
  await page.waitForSelector(sel, { state: 'attached', timeout: 10000 });
  await page.evaluate((s) => { const d = document.querySelector(s); d.scrollIntoView(); d.open = true; }, sel);
  await page.waitForFunction((s) => {
    const b = document.querySelector(s + ' [data-disc-body]');
    return b && !/Carregando/.test(b.textContent || '');
  }, sel, { timeout: 10000 });
  const leitura = await page.evaluate((s) => {
    const body = document.querySelector(s + ' [data-disc-body]');
    // Texto cru: parágrafo com linha de tabela markdown dentro.
    const crus = [...body.querySelectorAll('p')].filter((p) => /(^|\n)\s*\|.*\||\|---/.test(p.innerText || '')).length;
    const tabelas = [...body.querySelectorAll('table.mural-table')].map((t) => {
      const cab = t.querySelectorAll('thead th');
      const colsCab = [...cab].reduce((a, th) => a + (Number(th.getAttribute('colspan')) || 1), 0);
      const linhas = [...t.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
      return { colsCab, cab: [...cab].map((th) => th.textContent.trim()), linhas };
    });
    return { crus, tabelas };
  }, sel);
  // Foto na Tabela 4, como no vídeo: a janela de enquete que o app abre depois
  // de alguns segundos sai da frente, e a tabela recolhida é aberta.
  await page.evaluate((s) => {
    document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; });
    const body = document.querySelector(s + ' [data-disc-body]');
    const alvo = [...body.querySelectorAll('p,div,strong')].find((e) => /^Table 4\./.test((e.textContent || '').trim()));
    if (!alvo) return;
    let prox = alvo.nextElementSibling;
    while (prox && !(prox.matches('details.mural-tab') || prox.querySelector('table'))) prox = prox.nextElementSibling;
    if (prox && prox.matches('details.mural-tab')) prox.open = true;
    alvo.scrollIntoView();
  }, sel);
  await page.waitForTimeout(200);
  return { ctx, page, erros, leitura };
}

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };

  // ── 1. A discussão como está gravada hoje ───────────────────────────────────
  {
    const md = fs.readFileSync(path.join(DADOS, 'discussao-antiga.md'), 'utf8');
    const { ctx, page, erros, leitura } = await abreDiscussao(browser, URL, md);
    achados.push(`1 gravada hoje: ${leitura.crus} parágrafo(s) com tabela em texto cru; ${leitura.tabelas.length} tabela(s) abertas`);
    if (TEM_CORRECAO) {
      ok(leitura.crus === 0, '1: nenhuma tabela em texto cru (houve ' + leitura.crus + ')');
      ok(leitura.tabelas.length === 6, '1: as 6 tabelas abrem (abriram ' + leitura.tabelas.length + ')');
    } else {
      ok(leitura.crus > 0, '1 (antes): esperava reproduzir o vídeo, com tabela em texto cru (houve ' + leitura.crus + ')');
    }
    await page.screenshot({ path: path.join(__dirname, LADO + '-gravada.png') });
    ok(erros.length === 0, '1: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── 2. As tabelas reconvertidas ─────────────────────────────────────────────
  if (TEM_CORRECAO) {
    const md = fs.readFileSync(path.join(DADOS, 'discussao-nova.md'), 'utf8');
    const { ctx, page, erros, leitura } = await abreDiscussao(browser, URL, md);
    const desalinhadas = leitura.tabelas.reduce((a, t) => a + t.linhas.filter((l) => l.length !== t.colsCab).length, 0);
    const aroclor = leitura.tabelas.some((t) => t.linhas.some((l) => l[0] === 'Aroclor 1254' && l[1] === '1081'));
    const t4 = leitura.tabelas.find((t) => t.cab[0] === 'Chemical name') || { cab: [], linhas: [] };
    achados.push(`2 reconvertida: ${leitura.crus} em texto cru; ${leitura.tabelas.length} tabelas; ${desalinhadas} linha(s) com número de células diferente do cabeçalho; continuação do Aroclor 1254 na coluna certa: ${aroclor}`);
    ok(leitura.crus === 0, '2: nenhuma tabela em texto cru');
    ok(leitura.tabelas.length === 6, '2: as 6 tabelas abrem (abriram ' + leitura.tabelas.length + ')');
    ok(desalinhadas === 0, '2: toda linha com o número de células do cabeçalho (' + desalinhadas + ' fora)');
    ok(aroclor, '2: a linha que continua a célula mesclada traz "Aroclor 1254" e "1081" nas colunas certas');
    ok(t4.cab.length === 5 && /^↓T4/.test((t4.linhas[0] || [])[0] || ''), '2: Tabela 4 com os nomes das colunas no cabeçalho e o padrão como 1ª linha (' + JSON.stringify(t4.cab) + ')');
    await page.screenshot({ path: path.join(__dirname, LADO + '-reconvertida.png') });
    ok(erros.length === 0, '2: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + (TEM_CORRECAO ? ' (com a correção)' : ' (sem a correção)'));
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
