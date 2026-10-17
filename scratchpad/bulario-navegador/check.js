// Harness do BULÁRIO (16/10/2026): aluno no celular e no notebook, e professor.
// Desde 17/10/2026 o Bulário é só do professor (chave BULARIO_ALUNOS): para o aluno, o
// harness confere que o item não aparece e que nem um clique forçado abre o painel.
// Abre o painel, espera o bulario.json, busca por princípio ativo e por nome,
// abre um medicamento (ficha, apresentações, preço, link da bula oficial), filtra
// por área e confere que a página não rola na horizontal no celular.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const RAIZ = path.join(__dirname, '..', '..');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = 8871;
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
const raizSel = (adm) => adm ? '#adm-main .bula-raiz' : '#panel-bula .bula-raiz';
async function estado(page, adm) {
  return page.evaluate((sel) => {
    const r = document.querySelector(sel); if (!r) return { raiz: false };
    const itens = [...r.querySelectorAll('.bula-item')].map((it) => ({ nome: (it.querySelector('.bula-nome') || {}).textContent || '', pa: (it.querySelector('.bula-pa') || {}).textContent || '' }));
    const det = r.querySelector('.bula-det');
    const link = det ? det.querySelector('a[data-bula-oficial]') : null;
    return { raiz: true, topo: (r.querySelector('.bula-topo') || {}).textContent || '', conta: (r.querySelector('.bula-conta') || {}).textContent || '', itens, det: !!det, linhas: det ? det.querySelectorAll('.bula-apr-it').length : 0, precos: det ? [...det.querySelectorAll('.bula-apr-preco')].map((x) => x.textContent) : [], link: link ? link.getAttribute('href') : '', alvo: link ? link.getAttribute('target') : '', rolaX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  }, raizSel(adm));
}
(async () => {
  const srv = await serve(RAIZ, PORTA);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  for (const [nome, vp, adm] of [['celular', { width: 392, height: 850 }, false], ['notebook', { width: 1280, height: 900 }, false], ['professor', { width: 1280, height: 900 }, true]]) {
    const email = adm ? 'admin@endodirect.com.br' : 'aluna@exemplo.com';
    const { ctx, page, erros } = await pagina(browser, 'http://127.0.0.1:' + PORTA + '/', vp, email, adm ? '99999999-2222-3333-4444-555555555555' : '11111111-2222-3333-4444-555555555555');
    if (!adm) {
      const f = await page.evaluate(() => {
        const b = document.querySelector('button.sb-item[data-p="bula"]');
        const visivel = !!b && getComputedStyle(b).display !== 'none';
        if (b) b.click();
        const p = document.getElementById('panel-bula'), d = document.getElementById('panel-dash');
        return { visivel, abriu: !!p && p.classList.contains('on'), dash: !!d && d.classList.contains('on') };
      });
      ok(!f.visivel, nome + ': o item Bulário apareceu no menu do aluno');
      ok(!f.abriu && f.dash, nome + ': o clique forçado abriu o Bulário para o aluno (ou não voltou ao início): ' + JSON.stringify(f));
      achados.push(nome + ': aluno sem Bulário (item oculto; clique forçado volta ao início)');
      ok(erros.length === 0, nome + ': pageerror ' + JSON.stringify(erros));
      await ctx.close();
      continue;
    }
    await page.evaluate(() => { const b = document.querySelector('.adm-nav[data-asec="bula"]'); if (b) b.click(); });
    await page.waitForTimeout(2500);
    let e = await estado(page, adm);
    ok(e.raiz && /medicamentos com registro ativo/.test(e.topo), nome + ': o bulário não carregou (' + e.topo + ')');
    // busca por princípio ativo
    await page.fill(raizSel(adm) + ' .bula-q', 'metformina');
    await page.waitForTimeout(500);
    e = await estado(page, adm);
    ok(e.itens.length >= 10 && e.itens.every((x) => /metformina/i.test(x.pa + ' ' + x.nome)), nome + ': a busca "metformina" trouxe itens sem metformina');
    achados.push(nome + ': "metformina" → ' + e.conta + '; primeiros: ' + e.itens.slice(0, 3).map((x) => x.nome).join(', '));
    // busca por nome e abertura
    await page.fill(raizSel(adm) + ' .bula-q', 'glifage xr');
    await page.waitForTimeout(500);
    e = await estado(page, adm);
    ok(e.itens.length >= 1 && /^Glifage XR$/.test(e.itens[0].nome), nome + ': "glifage xr" não trouxe o Glifage XR em primeiro (' + (e.itens[0] || {}).nome + ')');
    await page.click(raizSel(adm) + ' .bula-item .bula-head');
    await page.waitForTimeout(300);
    e = await estado(page, adm);
    ok(e.det && e.linhas >= 2 && e.precos.some((x) => /^R\$ \d+,\d{2}$/.test(x)), nome + ': a ficha do Glifage XR não mostrou apresentações com preço');
    ok(/^https:\/\/consultas\.anvisa\.gov\.br\/#\/bulario\/q\/\?nomeProduto=GLIFAGE%20XR$/.test(e.link) && e.alvo === '_blank', nome + ': link da bula oficial errado: ' + e.link);
    achados.push(nome + ': Glifage XR → ' + e.linhas + ' apresentações, preços ' + e.precos.join(' / ') + ', link ' + e.link);
    if (!adm) await page.screenshot({ path: path.join(__dirname, 'bulario-' + nome + '.png') });
    // área sem busca
    await page.fill(raizSel(adm) + ' .bula-q', '');
    await page.waitForTimeout(400);
    await page.evaluate((sel) => { const b = [...document.querySelectorAll(sel + ' [data-bula-area]')].find((x) => x.textContent.trim() === 'Tireoide'); if (b) b.click(); }, raizSel(adm));
    await page.waitForTimeout(400);
    e = await estado(page, adm);
    ok(e.itens.length >= 5 && e.itens.some((x) => /levotiroxina/i.test(x.pa)), nome + ': a área Tireoide não listou levotiroxina');
    achados.push(nome + ': área Tireoide → ' + e.conta);
    ok(!e.rolaX, nome + ': a página ganhou rolagem horizontal');
    ok(erros.length === 0, nome + ': pageerror ' + JSON.stringify(erros));
    await ctx.close();
  }
  await browser.close(); srv.close();
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
