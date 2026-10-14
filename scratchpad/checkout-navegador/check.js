// O checkout em Chromium REAL quando a resposta do pagamento não volta — A/B.
//
// POR QUE ISTO EXISTE (14/10/2026): um assinante viu na fatura duas compras do
// Gold anual no mesmo dia. O caminho: o pagar.me cobrava, a função passava dos
// 30 s (ou falhava depois da cobrança), o navegador recebia um 504 sem JSON e
// dizia "Pagamento não aprovado" com o botão liberado — o aluno pagava de novo.
// Este harness abre o checkout de verdade (aluna logada, em degustação), paga
// com cartão e simula a resposta do servidor:
//   1. tempo esgotado (504 em HTML) e o webhook liberando o Gold 3 s depois;
//   2. (com a correção) cobrado com acesso "pendente";
//   3. (com a correção) `ja_ativo` — o servidor não cobrou.
// As expectativas seguem o que o index.html servido TEM (ckNaoConfirmado), então
// o mesmo arquivo compara a main com o branch:
//   LADO=antes RAIZ_APP=<pasta com o index.html da main>   |   LADO=depois
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TEM_CORRECAO = /function ckNaoConfirmado\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '22222222-3333-4444-5555-666666666666';
const PORTA = LADO === 'depois' ? 8815 : 8816;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';

const FAKE_SUPABASE = `
(function(){
  window.__rede = Object.assign({ acessos: [], chamadas: {} }, window.__redeInicial || {});
  var R = window.__rede;
  function conta(n){ R.chamadas[n] = (R.chamadas[n]||0)+1; }
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
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
      signOut: function(){ return Promise.resolve({ error:null }); }
    },
    rpc: function(nome){
      conta(nome);
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data: R.acessos.slice(), error:null });
      if (nome === 'endodirect_member_content' || nome === 'endodirect_member_content_sem_provas')
        return Promise.resolve({ data:{ acessos: R.acessos.slice(), member: R.acessos.length > 0, adm_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:0} }, error:null });
      if (nome === 'endodirect_member_provas_pagina') return Promise.resolve({ data:{ versao:'v', total:0, por_pagina:500, paginas:1, pagina:0, itens:[] }, error:null });
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes:[], diretrizes_temas:[] }, error:null });
      if (nome === 'endodirect_session_claim' || nome === 'endodirect_session_check') return Promise.resolve({ data:true, error:null });
      return Promise.resolve({ data:null, error:null });
    },
    from: function(){ return builder(); },
    channel: function(){ var c = { on:function(){ return c; }, subscribe:function(){ return c; }, unsubscribe:function(){} }; return c; },
    removeChannel: function(){}
  };
  window.supabase = { createClient: function(){ return client; } };
})();`;

const CONFIG = { enabled: true, public_key: 'pk_test_harness', amounts: { standard: 6900, gold: 9900 }, annual: { standard: 54000, gold: 82800 }, max_installments: 12,
  founder: { enabled: false, coupon: 'FUNDADOR', plan: 'gold', annual_amount: 54000, limit: 100, remaining: 0 } };

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

async function cenario(browser, URL, tipo) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, wn }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
  }, { uid: UID, wn: WHATSNEW_VER });
  const estado = { pedidos: 0 };
  await page.route('**', async (route) => {
    const u = route.request().url();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    if (u.indexOf('api.pagar.me/core/v5/tokens') >= 0) {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST' } });
      return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: JSON.stringify({ id: 'tok_harness', type: 'card' }) });
    }
    if (u.startsWith('http://127.0.0.1:') && u.indexOf('/api/checkout/config') >= 0) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CONFIG) });
    if (u.startsWith('http://127.0.0.1:') && u.indexOf('/api/checkout/order') >= 0) {
      estado.pedidos++;
      // O "webhook" libera o Gold 3 s depois do pedido (o pagar.me cobrou).
      if (tipo !== 'ja_ativo') setTimeout(() => { page.evaluate(() => { window.__rede.acessos = ['plano', 'plano:gold']; }).catch(() => {}); }, 3000);
      if (tipo === 'timeout') return route.fulfill({ status: 504, contentType: 'text/html', body: '<html><body>An error occurred with your deployment. FUNCTION_INVOCATION_TIMEOUT</body></html>' });
      if (tipo === 'pendente') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, method: 'credit_card', status: 'paid', order_id: 'or_1', acesso: 'pendente' }) });
      return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'ja_ativo', error: 'Este e-mail já tem o Plano Gold (anual) ativo até 29/06/2027. Não é preciso pagar de novo: entre na plataforma com este e-mail. Se o acesso não aparecer, ou se quiser trocar de plano, fale com o suporte.' }) });
    }
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
  // Escolhe o Gold (anual é o ciclo padrão da tela de planos) pelo mesmo clique delegado do app.
  await page.evaluate(() => { const b = document.createElement('button'); b.className = 'assine-buy'; b.setAttribute('data-plan', 'gold'); document.body.appendChild(b); b.click(); });
  await page.waitForFunction(() => { const m = document.getElementById('checkout-modal'); return m && m.style.display === 'flex'; }, null, { timeout: 8000 });
  const campos = { 'ck-name': 'ALUNA TESTE', 'ck-num': '4111111111111111', 'ck-exp': '12/30', 'ck-cvv': '123', 'ck-doc': '12345678909', 'ck-phone': '11999999999', 'ck-cep': '01001000', 'ck-addr': 'Rua A', 'ck-numero': '1', 'ck-city': 'Sao Paulo', 'ck-uf': 'SP' };
  for (const [id, v] of Object.entries(campos)) { await page.fill('#' + id, v).catch(() => {}); }
  await page.click('#ck-pay');
  await page.waitForTimeout(1500);
  const logo = await page.evaluate(() => {
    const b = document.getElementById('ck-pay');
    return { erro: (document.getElementById('ck-err') || {}).textContent || '', botaoTravado: !!(b && b.disabled), botaoTexto: (b && b.textContent) || '' };
  });
  // Espera o "webhook" (3 s) e a conferência automática (a cada 5 s).
  let liberou = false;
  try { await page.waitForFunction(() => { const m = document.getElementById('checkout-modal'); return m && m.style.display === 'none'; }, null, { timeout: 14000 }); liberou = true; } catch (e) {}
  const depois = await page.evaluate(() => ({ chip: (document.getElementById('tb-plan') || {}).textContent || '' }));
  await ctx.close();
  return { logo, liberou, chip: depois.chip, pedidos: estado.pedidos, erros };
}

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };

  // ── 1. Tempo esgotado depois da cobrança ─────────────────────────────────
  {
    const r = await cenario(browser, URL, 'timeout');
    achados.push(`1 tempo esgotado: mensagem "${r.logo.erro.slice(0, 90)}" | botão ${r.logo.botaoTravado ? 'travado' : 'LIBERADO'} ("${r.logo.botaoTexto}") | acesso confirmado sozinho: ${r.liberou} | pedidos: ${r.pedidos}`);
    ok(r.pedidos === 1, '1: um pedido só (' + r.pedidos + ')');
    if (TEM_CORRECAO) {
      ok(/Não pague de novo/.test(r.logo.erro) && !/não aprovado/i.test(r.logo.erro), '1: a tela pede para NÃO pagar de novo, sem "não aprovado" (veio "' + r.logo.erro + '")');
      ok(r.logo.botaoTravado && /Conferindo/.test(r.logo.botaoTexto), '1: o botão fica travado conferindo o pagamento');
      ok(r.liberou, '1: quando o webhook libera o Gold, a tela confirma sozinha e fecha o checkout');
    } else {
      ok(/não aprovado/i.test(r.logo.erro) && !r.logo.botaoTravado, '1 (sem a correção): reproduz o defeito — "Pagamento não aprovado" com o botão liberado (veio "' + r.logo.erro + '")');
    }
    ok(r.erros.length === 0, '1: sem pageerror (' + JSON.stringify(r.erros) + ')');
  }
  if (TEM_CORRECAO) {
    // ── 2. Cobrado, acesso pendente ─────────────────────────────────────────
    const r2 = await cenario(browser, URL, 'pendente');
    achados.push(`2 cobrado com acesso pendente: "${r2.logo.erro.slice(0, 80)}" | botão ${r2.logo.botaoTravado ? 'travado' : 'liberado'} | confirmado sozinho: ${r2.liberou}`);
    ok(/Pagamento aprovado/.test(r2.logo.erro) && /não pague de novo/i.test(r2.logo.erro) && r2.logo.botaoTravado, '2: diz que foi aprovado, pede para não pagar de novo e trava o botão');
    ok(r2.liberou, '2: quando o acesso chega, confirma e fecha');
    ok(r2.erros.length === 0, '2: sem pageerror (' + JSON.stringify(r2.erros) + ')');
    // ── 3. Já tem o plano: o servidor não cobrou ──────────────────────────
    const r3 = await cenario(browser, URL, 'ja_ativo');
    achados.push(`3 já tem o plano: "${r3.logo.erro.slice(0, 80)}" | botão ${r3.logo.botaoTravado ? 'travado' : 'liberado'}`);
    ok(/já tem o Plano Gold/.test(r3.logo.erro) && /Não é preciso pagar de novo/.test(r3.logo.erro), '3: mostra o motivo do servidor');
    ok(!r3.logo.botaoTravado, '3: o botão volta (nada foi cobrado)');
    ok(r3.erros.length === 0, '3: sem pageerror (' + JSON.stringify(r3.erros) + ')');
  }

  await browser.close(); srv.close();
  console.log('[' + LADO + '] ' + achados.join('\n[' + LADO + '] '));
  if (problemas.length) { console.error('\n[' + LADO + '] REPROVADO:\n- ' + problemas.join('\n- ')); process.exit(1); }
  console.log('[' + LADO + '] OK — todas as expectativas deste lado conferem em Chromium real.');
})().catch((e) => { console.error('erro no harness:', e); process.exit(2); });
