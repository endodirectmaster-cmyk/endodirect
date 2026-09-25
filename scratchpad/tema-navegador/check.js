// O filtro de TEMA do OSCE e da Prescrição em Chromium REAL, com Supabase falso.
//
// 25/09/2026. O teste em `vm` prova as funções; este prova que, no app inteiro,
// com login de assinante: (1) o select de tema nasce com os temas da
// subespecialidade escolhida (do acervo do servidor E dos capítulos locais);
// (2) "Todas" agrupa por subespecialidade; (3) a lista chega também à
// Prescrição; (4) trocar a subespecialidade repopula.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = path.join(__dirname, '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '11111111-2222-3333-4444-555555555555';
const WHATSNEW_VER = (fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';

const FAKE_SUPABASE = `
(function(){
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  function builder(){
    var st = { single:false }; var b = {};
    ['select','eq','neq','in','order','limit','upsert','insert','update','delete','gte','lte','is','contains','range'].forEach(function(m){ b[m] = function(){ return b; }; });
    b.maybeSingle = function(){ st.single = true; return b; }; b.single = b.maybeSingle;
    b.then = function(ok, ko){ return Promise.resolve({ data: st.single ? null : [], error: null }).then(ok, ko); };
    b.catch = function(ko){ return b.then(null, ko); };
    return b;
  }
  var CAPS = [
    { sub:'Diabetes', tema:'Insulinoterapia', titulo:'Insulinoterapia', privado:true, tipo:'capitulo', texto:'x' },
    { sub:'Diabetes', tema:'Diabetes e Gestação', titulo:'Diabetes e Gestação', privado:true, tipo:'capitulo', texto:'x' },
    { sub:'Tireoide', tema:'Hipotireoidismo', titulo:'Hipotireoidismo', privado:true, tipo:'capitulo', texto:'x' }
  ];
  var client = {
    auth: {
      getSession: function(){ return Promise.resolve({ data:{ session: session } }); },
      getUser: function(){ return Promise.resolve({ data:{ user: session.user } }); },
      onAuthStateChange: function(cb){ return { data:{ subscription:{ unsubscribe: function(){} } } }; },
      signOut: function(){ return Promise.resolve({ error:null }); }
    },
    rpc: function(nome){
      if (nome === 'endodirect_member_content') return Promise.resolve({ data:{ acessos:['plano','plano:gold'], member:true, provas:[], adm_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[],
        // O tema extra do professor (sem capítulo) chega pela lista do servidor:
        // carregarResumos não aplica diretrizes_temas ao aluno (os extras são do editor).
        // "HAC" existe em duas subespecialidades, como em produção.
        acervo_totais:{ provas:3, temas:{ 'Diabetes':['Diagnóstico e Classificação do Diabetes','Insulinoterapia','Rastreamento do diabetes mellitus tipo 1'], 'Adrenal':['Hiperplasia Adrenal Congênita (HAC)','Síndrome de Cushing'], 'Endocrinologia Pediátrica':['Puberdade Precoce','Hiperplasia Adrenal Congênita (HAC)'], 'Endocrinologia do Esporte':['RED-S e Tríade da Mulher Atleta'] } } }, error:null });
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data:['plano','plano:gold'], error:null });
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes: CAPS, diretrizes_temas:[{ sub:'Diabetes', tema:'Rastreamento do diabetes mellitus tipo 1' }] }, error:null });
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

(async () => {
  const srv = await serve(RAIZ, 8812);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, wn }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
  }, { uid: UID, wn: WHATSNEW_VER });
  // Pedidos à IA são capturados: é o que prova que o TEMA chegou ao prompt.
  const pedidos = [];
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.indexOf('/api/ai') >= 0) {
      try { pedidos.push(JSON.parse(route.request().postData() || '{}')); } catch (e) { pedidos.push({ erro: String(e) }); }
      return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"stub"}' });
    }
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto('http://127.0.0.1:8812/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);
  const semModais = () => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
  const problemas = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  const opcoes = (id) => page.evaluate((id) => {
    const s = document.getElementById(id);
    return { opts: [...s.querySelectorAll('option')].map((o) => o.value), grupos: [...s.querySelectorAll('optgroup')].map((g) => g.label) };
  }, id);

  // OSCE
  await semModais();
  await page.click('button.sb-item[data-p="sim"]');
  await page.waitForTimeout(300);
  let o = await opcoes('sim-tema');
  ok(o.opts[0] === '' && o.grupos.length >= 3 && o.grupos.indexOf('Diabetes') >= 0 && o.grupos.indexOf('Tireoide') >= 0 && o.grupos.indexOf('Endocrinologia do Esporte') >= 0,
    'OSCE com "Todas": temas agrupados por subespecialidade (veio ' + JSON.stringify(o) + ')');
  await page.selectOption('#sim-sub', 'Diabetes');
  await page.waitForTimeout(150);
  o = await opcoes('sim-tema');
  ok(JSON.stringify(o.opts) === JSON.stringify(['', 'Diagnóstico e Classificação do Diabetes', 'Insulinoterapia', 'Rastreamento do diabetes mellitus tipo 1', 'Diabetes e Gestação']) && o.grupos.length === 0,
    'OSCE Diabetes: lista do servidor (com o tema extra) primeiro, capítulo só local depois, sem repetir (veio ' + JSON.stringify(o.opts) + ')');
  await page.selectOption('#sim-sub', 'Endocrinologia Esportiva');
  await page.waitForTimeout(150);
  o = await opcoes('sim-tema');
  ok(JSON.stringify(o.opts) === JSON.stringify(['', 'RED-S e Tríade da Mulher Atleta']), 'OSCE "Endocrinologia Esportiva" acha os temas de "Endocrinologia do Esporte" (veio ' + JSON.stringify(o.opts) + ')');
  await page.selectOption('#sim-sub', 'Obesidade');
  await page.waitForTimeout(150);
  o = await opcoes('sim-tema');
  ok(JSON.stringify(o.opts) === JSON.stringify(['']), 'OSCE Obesidade sem tema: só Sortear');

  // "Todas" + o HAC do grupo Pediátrica → o pedido à IA sai com a subespecialidade CERTA.
  await page.selectOption('#sim-sub', '');
  await page.waitForTimeout(150);
  const iHacPed = await page.evaluate(() => [...document.querySelectorAll('#sim-tema option')].findIndex((op) => op.value === 'Hiperplasia Adrenal Congênita (HAC)' && op.getAttribute('data-sub') === 'Endocrinologia Pediátrica'));
  ok(iHacPed > 0, 'OSCE "Todas": existe a option HAC do grupo Pediátrica (índice ' + iHacPed + ')');
  await page.selectOption('#sim-tema', { index: iHacPed });
  await semModais();
  await page.click('#btn-sim-start');
  await page.waitForTimeout(1500);
  const pSim = pedidos.find((p) => p && typeof p.prompt === 'string' && p.prompt.indexOf('Caso de ') === 0);
  ok(!!pSim && pSim.prompt.indexOf('Caso de Endocrinologia Pediátrica — tema obrigatório do caso: Hiperplasia Adrenal Congênita (HAC)') === 0,
    '⚠️ OSCE: o pedido à IA leva a subespecialidade da option ESCOLHIDA (Pediátrica, não Adrenal) e o tema (veio ' + JSON.stringify(pSim && pSim.prompt) + ')');

  // Prescrição: Tireoide + Hipotireoidismo → o pedido leva o tema (prova de que o OVERRIDE foi alterado).
  await semModais();
  await page.click('button.sb-item[data-p="rx"]');
  await page.waitForTimeout(300);
  await page.selectOption('#rx-sub', 'Tireoide');
  await page.waitForTimeout(150);
  o = await opcoes('rx-tema');
  ok(JSON.stringify(o.opts) === JSON.stringify(['', 'Hipotireoidismo']), 'Prescrição Tireoide: capítulo local (veio ' + JSON.stringify(o.opts) + ')');
  await page.selectOption('#rx-tema', 'Hipotireoidismo');
  const antes = pedidos.length;
  await page.click('#btn-rx-gen');
  await page.waitForTimeout(1500);
  const pRx = pedidos.slice(antes).find((p) => p && typeof p.prompt === 'string' && p.prompt.indexOf('Caso clínico de ') === 0);
  ok(!!pRx && pRx.prompt.indexOf('Caso clínico de Tireoide — tema obrigatório do caso: Hipotireoidismo') === 0,
    '⚠️ Prescrição: o pedido à IA leva o tema — só acontece se o genRxCase VIVO (override) o lê (veio ' + JSON.stringify(pRx && pRx.prompt) + ')');
  ok(erros.length === 0, 'sem pageerror (' + JSON.stringify(erros) + ')');
  await page.screenshot({ path: path.join(__dirname, 'osce-tema.png') }).catch(() => {});

  await ctx.close(); await browser.close(); srv.close();
  if (problemas.length) { console.error('\nREPROVADO:\n- ' + problemas.join('\n- ')); process.exit(1); }
  console.log('OK — em Chromium real: o tema aparece nas duas ferramentas, com os temas do servidor e dos capítulos locais na ordem dos Resumos; "Todas" agrupa; trocar a subespecialidade repopula.');
})().catch((e) => { console.error('erro no harness:', e); process.exit(2); });
