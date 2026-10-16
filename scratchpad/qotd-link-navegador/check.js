// Harness do LINK DA QUESTÃO DO DIA para o PROFESSOR (16/10/2026, vídeo do Eduardo).
//
// O professor toca "Conferir a resposta na plataforma" no e-mail (ou a notificação)
// e o app tem de abrir o arquivo da Questão do Dia do painel do professor NA
// questão do link, com gabarito e comentário. Antes, o pedido era descartado e o
// professor caía em Analytics.
//
// Cenários (celular 392×850, como o aparelho do vídeo):
//   1. professor entra pelo link /#qotd/ig-2 → seção qotdarq, ig-2 aberta, comentário à vista;
//   2. professor com o app aberto em Analytics, troca do "#" para /#qotd/ig-3 → ig-3;
//   3. aluno entra pelo link /#qotd/ig-2 → painel do aluno na questão (o que já valia).
// Uso: LADO=antes RAIZ_APP=<pasta com o index.html da main> | LADO=depois (padrão)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TEM_CORRECAO = /function abrirLinkNoPainelDoProfessor\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = LADO === 'depois' ? 8851 : 8852;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
const STORIES = [1, 2, 3].map((i) => ({ id: 'ig-' + i, status: 'posted', postedAt: Date.UTC(2026, 9, 13 + i), sub: i === 2 ? 'Transgeneridade' : 'Tireoide', stem: 'Enunciado da questão ' + i + '. Qual a melhor conduta inicial?', options: { A: 'Alternativa A' + i, B: 'Alternativa B' + i, C: 'Alternativa C' + i, D: 'Alternativa D' + i }, answer: 'B', explanation: 'Comentário da questão ' + i + ': a alternativa B é a correta.' }));

function fakeSupabase(email, uid) {
  return `
(function(){
  var STORIES = ${JSON.stringify(STORIES)};
  var session = { access_token:'t', user:{ id:${JSON.stringify(uid)}, email:${JSON.stringify(email)}, user_metadata:{ nome:'Teste' } } };
  function builder(tabela){
    var st = { single:false }, b = {};
    ['select','eq','neq','in','order','limit','upsert','insert','update','delete','gte','lte','is','contains','range','or','not','filter'].forEach(function(m){ b[m] = function(){ return b; }; });
    b.maybeSingle = function(){ st.single = true; return b; };
    b.single = function(){ st.single = true; return b; };
    b.then = function(ok, ko){
      var data = st.single ? null : [];
      if (tabela === 'endodirect_global_state' && st.single) data = { payload:{ ig_stories: STORIES, adm_avisos:[], radar_avisos:[] }, updated_at:'2026-10-16T10:00:00Z' };
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
      if (nome === 'endodirect_qotd_publicadas') return Promise.resolve({ data: STORIES, error:null });
      if (nome === 'endodirect_is_admin') return Promise.resolve({ data: ${JSON.stringify(email.indexOf('admin@') === 0)}, error:null });
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

async function novaPagina(browser, url, email, uid) {
  const ctx = await browser.newContext({ viewport: { width: 392, height: 850 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, wn }) => {
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
    localStorage.setItem('endodirect_v1_adm_sec', JSON.stringify('analytics'));
  }, { uid, wn: WHATSNEW_VER });
  const fake = fakeSupabase(email, uid);
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: fake });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1600);
  return { ctx, page, erros };
}
const semModais = (page) => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
const estado = (page) => page.evaluate(() => {
  // O script do app é uma IIFE: o estado interno não é global. Lê-se pela tela.
  const navOn = document.querySelector('.adm-nav.on[data-asec]');
  const adm = navOn ? navOn.getAttribute('data-asec') : null;
  const abertoAdm = [...document.querySelectorAll('#adm-main .qa-item.open [data-admqa-toggle]')].map((b) => b.getAttribute('data-admqa-toggle'));
  const abertoAluno = [...document.querySelectorAll('#panel-qotd-body .qa-item.open [data-qa-toggle]')].map((b) => b.getAttribute('data-qa-toggle'));
  const painelAluno = (document.querySelector('.panel.on') || {}).id || '';
  const textoAdm = (document.getElementById('adm-main') || {}).innerText || '';
  const alvo = document.querySelector('#adm-main .qa-item.open');
  const r = alvo ? alvo.getBoundingClientRect() : null;
  return { adm, abertoAdm, abertoAluno, painelAluno, papel: (document.getElementById('app-screen') || { classList: { contains: () => false } }).classList.contains('admin-mode') ? 'professor' : 'aluno', comentario: /Comentário da questão \d/.test(textoAdm), titulo: (document.getElementById('adm-sec-title') || {}).textContent || '', alvoNaTela: r ? (r.top >= -5 && r.top < innerHeight) : null, hash: location.hash };
});

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };

  // 1. professor entra pelo link
  {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#qotd/ig-2', 'admin@endodirect.com.br', '99999999-2222-3333-4444-555555555555');
    await semModais(page);
    await page.waitForTimeout(600);
    const e = await estado(page);
    achados.push('1 professor pelo link: papel ' + e.papel + ', seção ' + e.adm + ' (' + e.titulo + '), abertas ' + JSON.stringify(e.abertoAdm) + ', comentário ' + e.comentario + ', na tela ' + e.alvoNaTela + ', # "' + e.hash + '"');
    if (TEM_CORRECAO) {
      ok(e.adm === 'qotdarq' && JSON.stringify(e.abertoAdm) === '["ig-2"]', '1: o professor não caiu no arquivo da Questão do Dia aberto em ig-2');
      ok(e.comentario, '1: o comentário (resposta) da questão não aparece');
      ok(e.alvoNaTela === true, '1: a questão aberta não está na tela (não rolou até ela)');
    } else {
      ok(e.adm === 'analytics' && !e.abertoAdm.length, '1 (antes): esperava reproduzir o vídeo (Analytics, nada aberto)');
    }
    ok(e.hash === '', '1: o "#" do link ficou no endereço');
    await page.screenshot({ path: path.join(__dirname, LADO + '-professor-link.png') });
    // 2. com o app aberto: volta a Analytics e troca o "#"
    if (TEM_CORRECAO) {
      await page.evaluate(() => { const b = document.querySelector('.adm-nav[data-asec="analytics"]'); if (b) b.click(); });
      await page.waitForTimeout(300);
      await page.evaluate(() => { location.hash = '#qotd/ig-3'; });
      await page.waitForTimeout(700);
      const e2 = await estado(page);
      achados.push('2 professor com o app aberto: seção ' + e2.adm + ', abertas ' + JSON.stringify(e2.abertoAdm));
      ok(e2.adm === 'qotdarq' && JSON.stringify(e2.abertoAdm) === '["ig-3"]', '2: com o app aberto, a troca do "#" não levou o professor à questão');
    }
    ok(erros.length === 0, '1/2: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // 3. aluno entra pelo link (o que já valia)
  {
    const { ctx, page, erros } = await novaPagina(browser, URL + '#qotd/ig-2', 'aluna@exemplo.com', '11111111-2222-3333-4444-555555555555');
    await semModais(page);
    await page.waitForTimeout(800);
    const e = await estado(page);
    achados.push('3 aluno pelo link: papel ' + e.papel + ', painel ' + e.painelAluno + ', abertas ' + JSON.stringify(e.abertoAluno));
    ok(e.painelAluno === 'panel-qotd' && JSON.stringify(e.abertoAluno) === '["ig-2"]', '3: o aluno não caiu no arquivo aberto em ig-2');
    ok(erros.length === 0, '3: sem pageerror (' + JSON.stringify(erros) + ')');
    await page.screenshot({ path: path.join(__dirname, LADO + '-aluno-link.png') });
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + ' (correção: ' + TEM_CORRECAO + ')');
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
