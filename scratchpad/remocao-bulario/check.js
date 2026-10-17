// Harness da REMOÇÃO DO BULÁRIO (17/10/2026). Pedido do professor: "vamos abortar essa
// ideia do bulário de uma vez por todas. Vamos excluir da plataforma mesmo."
// Confere, em Chromium, no aluno (celular e notebook) e no professor: nenhum item
// "Bulário" no menu nem no painel do professor, nenhum #panel-bula, nenhum pedido a
// bulario.json; quem tinha o Bulário como último painel salvo (last_panel / adm_sec)
// volta ao início sem erro de página.
//   PLAYWRIGHT_CORE=/opt/node22/lib/node_modules/playwright node scratchpad/remocao-bulario/check.js
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const RAIZ = path.join(__dirname, '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = 8873;
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
function fake(email, uid) {
  return `(function(){
  var session={access_token:'t',user:{id:${JSON.stringify(uid)},email:${JSON.stringify(email)},user_metadata:{nome:'Teste'}}};
  function builder(){var st={single:false},b={};['select','eq','neq','in','order','limit','upsert','insert','update','delete','gte','lte','is','contains','range','or','not','filter'].forEach(function(m){b[m]=function(){return b;};});
    b.maybeSingle=function(){st.single=true;return b;};b.single=function(){st.single=true;return b;};
    b.then=function(ok,ko){return Promise.resolve({data:st.single?null:[],error:null}).then(ok,ko);};b.catch=function(ko){return b.then(null,ko);};return b;}
  var client={auth:{getSession:function(){return Promise.resolve({data:{session:session}});},getUser:function(){return Promise.resolve({data:{user:session.user}});},
    onAuthStateChange:function(cb){setTimeout(function(){try{cb('SIGNED_IN',session);}catch(e){}},5);return {data:{subscription:{unsubscribe:function(){}}}};},
    signOut:function(){return Promise.resolve({error:null});},signInWithPassword:function(){return Promise.resolve({data:{session:session},error:null});}},
    rpc:function(nome){
      if(nome==='endodirect_member_content'||nome==='endodirect_member_content_sem_provas')return Promise.resolve({data:{acessos:['plano','plano:gold'],member:true,adm_avisos:[],radar_avisos:[],podcasts:[],mm_shared:[],fc_shared:[],adm_cursos:[],cursos:[],radar_hidden:[]},error:null});
      if(nome==='endodirect_member_provas_pagina')return Promise.resolve({data:{versao:'v1',total:0,por_pagina:500,paginas:1,pagina:0,itens:[]},error:null});
      if(nome==='endodirect_acessos_ativos')return Promise.resolve({data:['plano','plano:gold'],error:null});
      if(nome==='endodirect_qotd_publicadas')return Promise.resolve({data:[],error:null});
      return Promise.resolve({data:null,error:null});},
    from:function(){return builder();},channel:function(){var c={on:function(){return c;},subscribe:function(){return c;},unsubscribe:function(){}};return c;},removeChannel:function(){}};
  window.supabase={createClient:function(){return client;}};})();`;
}
function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      const p = path.join(dir, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : (p.endsWith('.json') ? 'application/json' : 'application/javascript'));
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}
async function pagina(browser, url, vp, email, uid) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vp.width < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, wn }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
  }, { uid, wn: WHATSNEW_VER });
  const f = fake(email, uid);
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: f });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
  return { ctx, page, erros };
}
(async () => {
  // O app servido não traz mais nada do Bulário (fora a linha que devolve ao início quem
  // tinha o painel salvo).
  const sobras = (APP_HTML.match(/initBulario|admBulaHTML|bulaRender|panel-bula|bulario\.json|BULARIO_ALUNOS|data-asec="bula"|data-p="bula"/g) || []);
  if (sobras.length) { console.log('PROBLEMAS:\n  ✗ index.html ainda traz o Bulário: ' + [...new Set(sobras)].join(', ')); process.exit(1); }
  const srv = await serve(RAIZ, PORTA);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  for (const [nome, vp, adm] of [['aluno-celular', { width: 392, height: 850 }, false], ['aluno-notebook', { width: 1280, height: 900 }, false], ['professor', { width: 1280, height: 900 }, true]]) {
    const email = adm ? 'admin@endodirect.com.br' : 'aluna@exemplo.com';
    const uid = adm ? '99999999-2222-3333-4444-555555555555' : '11111111-2222-3333-4444-555555555555';
    // O Bulário como último painel salvo: era o caso de quem o abriu enquanto existiu.
    const pedidos = [];
    const { ctx, page, erros } = await pagina(browser, 'http://127.0.0.1:' + PORTA + '/', vp, email, uid);
    page.on('request', (r) => { if (/bulario/.test(r.url())) pedidos.push(r.url()); });
    await page.evaluate((a) => { try { localStorage.setItem(a ? 'endodirect_v1_adm_sec' : 'endodirect_v1_last_panel', JSON.stringify('bula')); } catch (e) {} }, adm);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
    const r = await page.evaluate(() => ({
      textoMenu: [...document.querySelectorAll('.sb-item, .adm-nav')].map((b) => b.textContent).join(' | '),
      painelBula: !!document.getElementById('panel-bula'),
      raizBula: !!document.querySelector('.bula-raiz'),
      painelAtivo: (document.querySelector('.panel.on') || {}).id || '',
      admAtivo: (document.querySelector('.adm-nav.on') || {}).getAttribute ? document.querySelector('.adm-nav.on').getAttribute('data-asec') : '',
    }));
    ok(!/Bulário/.test(r.textoMenu), nome + ': ainda há "Bulário" no menu: ' + r.textoMenu.slice(0, 200));
    ok(!r.painelBula && !r.raizBula, nome + ': o painel do Bulário ainda está no documento');
    if (adm) ok(r.admAtivo && r.admAtivo !== 'bula', nome + ': a seção salva "bula" não voltou para uma seção existente (' + r.admAtivo + ')');
    else ok(r.painelAtivo && r.painelAtivo !== 'panel-bula', nome + ': o painel salvo "bula" não voltou ao início (' + r.painelAtivo + ')');
    ok(pedidos.length === 0, nome + ': ainda pede bulario.json: ' + pedidos.join(', '));
    ok(erros.length === 0, nome + ': erro de página ' + JSON.stringify(erros));
    achados.push(nome + ': menu sem Bulário; painel ativo ' + (adm ? r.admAtivo : r.painelAtivo) + '; erros de página ' + erros.length);
    await page.screenshot({ path: path.join(__dirname, 'sem-bulario-' + nome + '.png') });
    await ctx.close();
  }
  await browser.close(); srv.close();
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
