// O Banco de questões em Chromium REAL quando o member_content cai — ponta a ponta.
//
// POR QUE ISTO EXISTE (24/09/2026): o teste em `vm` prova que as funções se
// comportam; este prova que o app INTEIRO, com login de assinante e Supabase
// falso, mostra na tela o que o aluno precisa ver:
//   1. conteúdo caindo 3× → o Banco mostra "Não foi possível carregar…" com
//      o botão "Tentar de novo", e a Gold NÃO vira "Degustação" (os acessos
//      vêm por chamada própria);
//   2. clicar em "Tentar de novo" com a rede de volta → as questões aparecem;
//   3. ao abrir de novo com a rede muda desde o início, o chip de plano
//      continua "Gold" graças aos acessos guardados no aparelho.
//
// Como: o <script> do supabase-js é interceptado e substituído por um cliente
// falso (window.supabase.createClient) com sessão de aluno real; os demais
// CDNs viram stub. O estado da rede é controlado por window.__rede.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = path.join(__dirname, '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '11111111-2222-3333-4444-555555555555';
// Versão das novidades, lida do próprio index.html: a chave guardada tem de bater.
const WHATSNEW_VER = (fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';

const FAKE_SUPABASE = `
(function(){
  window.__rede = Object.assign({ conteudoFalha: true, acessosFalha: false, chamadas: {} }, window.__redeInicial || {});
  function conta(n){ window.__rede.chamadas[n] = (window.__rede.chamadas[n]||0)+1; }
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  var PROVAS = [
    { code:'ED-1', inst:'Endodirect', ano:2024, area:'Diabetes', stem:'Q1 enunciado', options:{A:'a',B:'b',C:'c',D:'d'}, answer:'A', explanation:'x' },
    { code:'ED-2', inst:'Endodirect', ano:2024, area:'Tireoide', stem:'Q2 enunciado', options:{A:'a',B:'b',C:'c',D:'d'}, answer:'B', explanation:'x' },
    { code:'ED-3', inst:'USP', ano:2023, area:'Adrenal', stem:'Q3 enunciado', options:{A:'a',B:'b',C:'c',D:'d'}, answer:'C', explanation:'x' }
  ];
  function builder(){
    var st = { single:false };
    var b = {};
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
    rpc: function(nome){
      conta(nome);
      if (nome === 'endodirect_member_content') {
        if (window.__rede.conteudoFalha) return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve({ data:{ acessos:['plano','plano:gold'], member:true, provas:PROVAS, adm_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:3} }, error:null });
      }
      if (nome === 'endodirect_acessos_ativos') {
        if (window.__rede.acessosFalha) return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve({ data:['plano','plano:gold'], error:null });
      }
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes:[], diretrizes_temas:[] }, error:null });
      if (nome === 'endodirect_mural_discussoes_ids') return Promise.resolve({ data:[], error:null });
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
      const p = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript');
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}

async function novaPagina(browser, url, opts) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  const consoleMsgs = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  // Estado local: mesmo usuário neste navegador, com perfil (senão abre o onboarding).
  await page.addInitScript(({ uid, acessos, rede, wn }) => {
    window.__redeInicial = rede || {};
    // A janela de novidades (1× por versão) cobre a tela e engole os cliques do teste.
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    if (acessos) localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: acessos, at: Date.now() }));
  }, { uid: UID, acessos: opts.acessosGuardados || null, rede: opts.rede || null, wn: WHATSNEW_VER });
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  return { ctx, page, erros, consoleMsgs };
}

(async () => {
  const srv = await serve(RAIZ, 8811);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };

  // ── Cenário A: primeira abertura, conteúdo cai 3×, acessos chegam ──────────
  {
    const { ctx, page, erros, consoleMsgs } = await novaPagina(browser, 'http://127.0.0.1:8811/', {});
    // 3 tentativas com 900+1800 ms de espera: dá tempo.
    await page.waitForTimeout(4500);
    const chamadas = await page.evaluate(() => window.__rede.chamadas);
    ok(chamadas.endodirect_member_content === 3, 'A: esperava 3 chamadas ao member_content, houve ' + chamadas.endodirect_member_content);
    ok(chamadas.endodirect_acessos_ativos >= 1, 'A: os acessos foram pedidos por chamada própria');
    await page.screenshot({ path: path.join(__dirname, 'a-boot.png') });
    const estadoBoot = await page.evaluate(() => ({
      login: (document.getElementById('login-screen') || {}).style ? document.getElementById('login-screen').style.display : '?',
      app: (document.getElementById('app-screen') || {}).style ? document.getElementById('app-screen').style.display : '?',
      onboard: (document.getElementById('onboard-modal') || {}).style ? document.getElementById('onboard-modal').style.display : '?',
      erro: (document.getElementById('login-err') || {}).textContent || ''
    }));
    const storage = await page.evaluate(() => ({ profile: localStorage.getItem('endodirect_v1_user_profile'), last: localStorage.getItem('endodirect_v1_last_uid'), keys: Object.keys(localStorage) }));
    console.log('estado após o boot (A):', JSON.stringify(estadoBoot), 'chamadas:', JSON.stringify(chamadas), 'storage:', JSON.stringify(storage));
    console.log('pageerrors:', JSON.stringify(erros), 'console:', JSON.stringify(consoleMsgs.slice(0, 12)));
    // Janelas modais (novidades, enquete CME, convite de feedback…) cobrem a tela
    // e engolem cliques; não são o objeto deste teste.
    const semModais = () => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
    await semModais();
    await page.click('button.sb-item[data-p="quest"]', { timeout: 8000 });
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => ({
      info: (document.getElementById('q-prova-info') || {}).textContent || '',
      resultados: (document.getElementById('q-gen-results') || {}).innerHTML || '',
      chip: (document.getElementById('tb-plan') || {}).textContent || '',
      degBar: !!document.getElementById('degustacao-bar'),
      appVisivel: (document.getElementById('app-screen') || {}).style ? document.getElementById('app-screen').style.display : ''
    }));
    ok(/Não foi possível carregar o banco de questões/.test(a.info), 'A: #q-prova-info diz que não carregou (veio: "' + a.info.slice(0, 80) + '")');
    ok(/id="btn-banco-retry"/.test(a.resultados), 'A: a área de resultados tem o botão Tentar de novo');
    ok(!/Nenhuma questão/.test(a.resultados), 'A: não diz "Nenhuma questão"');
    ok(a.chip === 'Gold', 'A: chip de plano é "Gold", não "Degustação" (veio: "' + a.chip + '")');
    ok(!a.degBar, 'A: a faixa de degustação NÃO aparece para a Gold com o conteúdo caído');
    // Buscar com o banco vazio também explica, em vez de "Nenhuma questão encontrada".
    await semModais();
    await page.click('#btn-filter-provas');
    await page.waitForTimeout(200);
    const busca = await page.evaluate(() => (document.getElementById('q-gen-results') || {}).innerHTML || '');
    ok(/btn-banco-retry/.test(busca) && !/Nenhuma questão encontrada/.test(busca), 'A: Buscar durante o erro mantém o aviso com o botão');
    await page.screenshot({ path: path.join(__dirname, 'banco-erro.png') });

    // ── Cenário B: rede volta, clique em "Tentar de novo" ───────────────────
    await page.evaluate(() => { window.__rede.conteudoFalha = false; });
    await semModais();
    await page.click('#btn-banco-retry');
    await page.waitForTimeout(1200);
    await semModais();
    const b = await page.evaluate(() => ({
      info: (document.getElementById('q-prova-info') || {}).textContent || '',
      resultados: (document.getElementById('q-gen-results') || {}).innerHTML || '',
      chamadas: window.__rede.chamadas
    }));
    ok(/Mostrando 3 de 3/.test(b.info), 'B: depois do Tentar de novo, "Mostrando 3 de 3" (veio: "' + b.info.slice(0, 80) + '")');
    ok(/Q1 enunciado|Q2 enunciado|Q3 enunciado/.test(b.resultados), 'B: as questões aparecem na tela');
    ok(!/btn-banco-retry/.test(b.resultados), 'B: o botão de tentar de novo sumiu');
    ok(b.chamadas.endodirect_member_content === 4, 'B: o Tentar de novo custou exatamente UMA chamada a mais (total ' + b.chamadas.endodirect_member_content + ')');
    await page.screenshot({ path: path.join(__dirname, 'banco-recuperado.png') });
    ok(erros.length === 0, 'A/B: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── Cenário C: rede muda desde o início; acessos guardados no aparelho ──────
  {
    // Conteúdo E acessos caindo desde o início: só o cache do aparelho segura o plano.
    const { ctx, page, erros } = await novaPagina(browser, 'http://127.0.0.1:8811/', { acessosGuardados: ['plano', 'plano:gold'], rede: { conteudoFalha: true, acessosFalha: true } });
    await page.waitForTimeout(300);
    const c = await page.evaluate(() => ({
      chip: (document.getElementById('tb-plan') || {}).textContent || '',
      degBar: !!document.getElementById('degustacao-bar')
    }));
    ok(c.chip === 'Gold', 'C: com acessos guardados, o chip já nasce "Gold" antes de qualquer resposta (veio: "' + c.chip + '")');
    ok(!c.degBar, 'C: sem faixa de degustação no boot');
    ok(erros.length === 0, 'C: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── Cenário D: uma carga por vez — dois hydrates no boot não duplicam a chamada ──
  {
    const { ctx, page } = await novaPagina(browser, 'http://127.0.0.1:8811/', { rede: { conteudoFalha: false } });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => window.__rede.chamadas);
    // getSession e SIGNED_IN entram os dois no boot; antes eram 2 member_content.
    ok(d.endodirect_member_content === 1, 'D: boot com sessão + SIGNED_IN faz UMA chamada ao member_content (houve ' + d.endodirect_member_content + ')');
    await ctx.close();
  }

  await browser.close(); srv.close();
  if (problemas.length) { console.error('\nREPROVADO:\n- ' + problemas.join('\n- ')); process.exit(1); }
  console.log('OK — em Chromium real: conteúdo caído 3× mostra o aviso com Tentar de novo e a Gold segue Gold; o botão recarrega e as questões aparecem; acessos guardados seguram o plano com a rede muda; o boot faz uma carga só.');
})().catch((e) => { console.error('erro no harness:', e); process.exit(2); });
