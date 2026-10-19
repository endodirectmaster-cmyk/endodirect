// App nas lojas em Chromium REAL — A/B (19/10/2026).
//
// O que precisa valer, e por quê (cofre/App nas Lojas.md):
//   - no APP (?app=android), nada de preço, "assine" nem checkout: o Google, no
//     Brasil, não aceita app que leve a pagar fora da loja. No SITE, nada muda;
//   - a conta pode ser excluída dentro do app (Meu perfil), com confirmação, e a
//     página pública /excluir-conta leva até lá;
//   - a conta de revisão das lojas não é derrubada pelo limite de aparelhos;
//   - o professor gera a senha dela no painel.
// O mesmo arquivo roda contra a main (LADO=antes RAIZ_APP=<pasta>) e o branch.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const NOVO = /function isAppLoja\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '33333333-4444-4555-8666-777777777777';
const PORTA = LADO === 'depois' ? 8825 : 8826;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
// Chamada para comprar, no texto visível. "Assinatura" (o título do cartão) e
// "assinantes" (informação) não contam; mandar assinar, preço e pacote contam.
const COMPRA = /\bassine\b|\bassinar\b|R\$\s?\d|ver pacotes|ver planos|ver o plano|fazer upgrade|adquir/i;

const FAKE_SUPABASE = `
(function(){
  window.__rede = Object.assign({ acessos: [], chamadas: {}, email: 'aluna@exemplo.com', semSessao: false }, window.__redeInicial || {});
  var R = window.__rede;
  function conta(n){ R.chamadas[n] = (R.chamadas[n]||0)+1; }
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:R.email, user_metadata:{ nome:'Aluna Teste' } } };
  try{ if(R.semSessao||sessionStorage.getItem('__semSessao'))session=null; }catch(e){}
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
      getUser: function(){ return Promise.resolve({ data:{ user: session&&session.user } }); },
      onAuthStateChange: function(cb){ setTimeout(function(){ try{ if(session)cb('SIGNED_IN', session); }catch(e){} }, 5); return { data:{ subscription:{ unsubscribe: function(){} } } }; },
      signOut: function(){ conta('signOut'); try{ sessionStorage.setItem('__semSessao','1'); }catch(e){} session=null; return Promise.resolve({ error:null }); },
      signInWithPassword: function(){ return Promise.resolve({ error:{ message:'x' } }); },
      signInWithOAuth: function(){ return Promise.resolve({ error:null }); }
    },
    rpc: function(nome){
      conta(nome);
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data: R.acessos.slice(), error:null });
      if (nome === 'endodirect_member_content' || nome === 'endodirect_member_content_sem_provas')
        return Promise.resolve({ data:{ acessos: R.acessos.slice(), member: R.acessos.length > 0, adm_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:0,diretrizes:0} }, error:null });
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

function serve(dir, port) {
  return new Promise((res) => {
    const s = http.createServer((req, r) => {
      let rota = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (rota === '/') rota = '/index.html';
      if (!path.extname(rota)) rota += '.html';
      const p = path.join(dir, rota);
      fs.readFile(p, (e, b) => {
        if (e) { r.statusCode = 404; return r.end('nao encontrado'); }
        r.setHeader('Content-Type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript');
        r.end(b);
      });
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}

const resultados = [];
const reg = (nome, ok, det) => resultados.push({ nome, ok: !!ok, det: det || '' });
// O que foi visto, nos dois lados: é a tabela do A/B.
const obs = {};

async function abrir(browser, URL, rede, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, wn, rede }) => {
    window.__redeInicial = rede;
    if (!sessionStorage.getItem('__iniciado')) {
      sessionStorage.setItem('__iniciado', '1');
      localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
      localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
      localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', residencia: 'HUPES', crm: '12345', uf: 'BA', atuacao: 'adulto' }));
    }
  }, { uid: UID, wn: WHATSNEW_VER, rede });
  const api = [];
  await page.route('**', async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    if (u.startsWith('http://127.0.0.1:') && u.indexOf('/api/ai') >= 0) {
      let corpo = {}; try { corpo = JSON.parse(req.postData() || '{}'); } catch (e) {}
      api.push({ corpo, auth: req.headers().authorization || '' });
      const r = (opts.apiResposta || (() => ({ status: 200, body: { ok: true } })))(corpo);
      return route.fulfill({ status: r.status, contentType: 'application/json', body: JSON.stringify(r.body) });
    }
    if (u.startsWith('http://127.0.0.1:') && u.indexOf('/api/') >= 0) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(opts.espera || 2500);
  await page.evaluate(() => { document.querySelectorAll('.modal-bg,.qotd-overlay').forEach((m) => { m.style.display = 'none'; }); });
  return { ctx, page, erros, api };
}
// O script do app é uma função autoexecutada: nada dele é global. Tudo passa
// pela interface, como o aluno faria.
const nav = (page, id) => page.evaluate((p) => { const b = document.querySelector('.sb-item[data-p="' + p + '"]'); if (b) b.click(); return !!b; }, id);
const clica = (page, sel) => page.evaluate((q) => { const b = document.querySelector(q); if (b) b.click(); return !!b; }, sel);
const visivel = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return false;
  const cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0;
}, sel);
// Texto visível do app (barra, topo e painel aberto), sem o que está escondido.
const textoVisivel = (page) => page.evaluate(() => {
  const out = [];
  const walk = (el) => {
    if (!el || el.nodeType !== 1) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    for (const n of el.childNodes) {
      if (n.nodeType === 3) out.push(n.textContent);
      else walk(n);
    }
    if (el.title) out.push(el.title);
  };
  walk(document.body);
  return out.join(' ').replace(/\s+/g, ' ');
});

async function rodar() {
  const servidor = await serve(RAIZ, PORTA);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const B = 'http://127.0.0.1:' + PORTA;
  try {
    // 1. Site, sem sessão: a landing (com os preços) continua.
    let s = await abrir(browser, B + '/', { semSessao: true });
    reg('site deslogado: landing aparece', await visivel(s.page, '#landing-screen'));
    reg('site deslogado: sem erro de JS', !s.erros.length, s.erros.join(' | '));
    await s.ctx.close();

    // 2. App, sem sessão: direto no login, sem landing.
    s = await abrir(browser, B + '/?app=android', { semSessao: true });
    const landApp = await visivel(s.page, '#landing-screen'), loginApp = await visivel(s.page, '#login-screen');
    obs['app sem sessão: landing de preços à vista'] = landApp;
    reg('app deslogado: sem landing', NOVO ? !landApp : landApp, 'landing=' + landApp);
    reg('app deslogado: login aparece', NOVO ? loginApp : true, 'login=' + loginApp);
    const hint = await s.page.evaluate(() => { const b = document.getElementById('btn-toggle-mode'); if (b) b.click(); const h = document.getElementById('signup-hint'); return h ? h.innerText : ''; });
    reg('app deslogado: o cadastro não manda assinar', NOVO ? !COMPRA.test(hint) : COMPRA.test(hint), hint);
    reg('app deslogado: marca o app na aba', NOVO ? (await s.page.evaluate(() => document.documentElement.classList.contains('app-loja') && sessionStorage.getItem('endo_app_loja') === 'android')) : true);
    reg('app deslogado: sem erro de JS', !s.erros.length, s.erros.join(' | '));
    // O que um visitante novo já recebe no aparelho (flashcards de exemplo etc.).
    const chavesDeVisitante = await s.page.evaluate(() => Object.keys(localStorage).filter((k) => k.indexOf('endodirect_v1_') === 0));
    await s.ctx.close();

    // 3. Site, aluna em degustação: os convites para assinar continuam.
    s = await abrir(browser, B + '/', { acessos: [] });
    const ctaSite = await visivel(s.page, '#degustacao-cta');
    await nav(s.page, 'perfil');
    await s.page.waitForTimeout(300);
    const upSite = await visivel(s.page, '#btn-pf-upgrade');
    obs['site em degustação: botão de pacotes na barra'] = ctaSite;
    obs['site em degustação: "Assinar agora" no perfil'] = upSite;
    reg('site degustação: barra com o botão de pacotes', ctaSite);
    reg('site degustação: perfil com "Assinar agora"', upSite);
    const cartaoSite = await visivel(s.page, '#perfil-excluir');
    obs['perfil: cartão "Excluir conta"'] = cartaoSite;
    reg('site degustação: cartão de exclusão no perfil', NOVO ? cartaoSite : !cartaoSite);
    await clica(s.page, '#degustacao-cta');
    await s.page.waitForTimeout(300);
    reg('site degustação: a tela de pacotes abre', await visivel(s.page, '#assine-screen'));
    reg('site degustação: sem erro de JS', !s.erros.length, s.erros.join(' | '));
    await s.ctx.close();

    // 4. App, aluna em degustação: nenhum caminho de compra à vista.
    s = await abrir(browser, B + '/?app=android', { acessos: [] });
    const achados = [];
    for (const p of ['dash', 'quest', 'qotd', 'flash', 'mmap', 'podcast', 'cursos', 'resu', 'ref', 'perfil', 'support', 'simfull', 'sim', 'mural', 'art', 'chat', 'plano', 'crono', 'calc', 'presc', 'rx', 'notas', 'erros', 'favs', 'sr', 'aovivo']) {
      await nav(s.page, p);
      await s.page.waitForTimeout(250);
      const t = await textoVisivel(s.page);
      const m = t.match(COMPRA);
      if (m) achados.push(p + ': "' + t.slice(Math.max(0, m.index - 60), m.index + 40) + '"');
    }
    obs['app em degustação: painéis com texto de compra (de 26)'] = achados.length;
    reg('app degustação: nenhum texto de compra em 26 painéis', NOVO ? !achados.length : achados.length > 0, achados.slice(0, 4).join(' || '));
    reg('app degustação: barra sem o botão de pacotes', NOVO ? !(await visivel(s.page, '#degustacao-cta')) : true);
    // O botão está escondido no app; o clique direto testa a porta (showAssineScreen).
    await clica(s.page, '#degustacao-cta');
    await s.page.waitForTimeout(300);
    const assineApp = await visivel(s.page, '#assine-screen');
    const aviso = await s.page.evaluate(() => Array.from(document.querySelectorAll('.notify')).map((n) => n.textContent).join(' | '));
    obs['app em degustação: a tela de pacotes abre'] = assineApp;
    reg('app degustação: a tela de pacotes não abre', NOVO ? !assineApp : assineApp);
    reg('app degustação: no lugar, aviso neutro', NOVO ? /não está liberado na sua conta/.test(aviso) && !COMPRA.test(aviso) : true, aviso);
    await nav(s.page, 'art'); // Resumidor: fora da degustação → tela de bloqueio
    await s.page.waitForTimeout(250);
    const bloq = await s.page.evaluate(() => { const p = document.querySelector('.panel.on'); return p ? p.innerText : ''; });
    reg('app degustação: bloqueio sem botão e sem mandar assinar', NOVO ? (!(await visivel(s.page, '#locked-cta')) && !COMPRA.test(bloq)) : true, bloq.slice(0, 160));
    await nav(s.page, 'perfil');
    await s.page.waitForTimeout(250);
    reg('app degustação: cartão de exclusão no perfil', NOVO ? await visivel(s.page, '#perfil-excluir') : true);
    reg('app degustação: sem erro de JS', !s.erros.length, s.erros.join(' | '));
    await s.ctx.close();

    // 4b. App, assinante Standard: o perfil não oferece upgrade.
    s = await abrir(browser, B + '/?app=android', { acessos: ['plano', 'plano:standard'] });
    await nav(s.page, 'perfil');
    await s.page.waitForTimeout(300);
    const tPerfil = await textoVisivel(s.page);
    reg('app Standard: perfil sem upgrade', NOVO ? !COMPRA.test(tPerfil) && !(await visivel(s.page, '#perfil-upgrade')) : true, (tPerfil.match(COMPRA) || [''])[0]);
    reg('app Standard: sem erro de JS', !s.erros.length, s.erros.join(' | '));
    await s.ctx.close();

    if (NOVO) {
      // 5. Exclusão: confirma, chama o servidor com o token, limpa o aparelho e cai no login.
      s = await abrir(browser, B + '/?app=android', { acessos: ['plano', 'plano:gold'] });
      await s.page.evaluate(() => { localStorage.setItem('endodirect_v1_notes', JSON.stringify([{ t: 'nota' }])); });
      await nav(s.page, 'perfil');
      await s.page.waitForTimeout(300);
      const temAvisoPago = await s.page.evaluate(() => /plano termina agora/.test((document.getElementById('perfil-excluir') || {}).innerText || ''));
      reg('exclusão: quem paga é avisado de que o plano termina e não há reembolso automático', temAvisoPago);
      await s.page.click('#btn-pf-excluir');
      await s.page.fill('#pf-excluir-txt', 'excluir agora');
      await s.page.click('#btn-pf-excluir-ok');
      await s.page.waitForTimeout(300);
      const excl = () => s.api.filter((a) => a.corpo.kind === 'excluir_conta');
      reg('exclusão: palavra errada não chama o servidor', excl().length === 0 && /digite EXCLUIR/.test(await s.page.innerText('#pf-excluir-err')));
      await s.page.fill('#pf-excluir-txt', 'excluir');
      await Promise.all([s.page.waitForURL(/\/$|conta-excluida/, { timeout: 15000 }).catch(() => {}), s.page.click('#btn-pf-excluir-ok')]);
      await s.page.waitForTimeout(2500);
      const chamada = excl()[0] || { corpo: {} };
      reg('exclusão: chama o servidor uma vez, com o token e a confirmação', excl().length === 1 && chamada.corpo.confirmar === 'EXCLUIR' && chamada.auth === 'Bearer t', JSON.stringify(s.api));
      reg('exclusão: o corpo não leva usuário nem e-mail', chamada.corpo && !('user_id' in chamada.corpo) && !('email' in chamada.corpo));
      const depois = await s.page.evaluate(() => ({
        url: location.pathname + location.search,
        login: getComputedStyle(document.getElementById('login-screen')).display,
        aviso: (document.getElementById('login-ok') || {}).innerText || '',
        restos: Object.keys(localStorage).filter((k) => k.indexOf('endodirect_v1_') === 0),
        app: document.documentElement.classList.contains('app-loja')
      }));
      reg('exclusão: volta ao login com o aviso, e o endereço fica limpo', depois.url === '/' && depois.login === 'flex' && /conta foi exclu/.test(depois.aviso), JSON.stringify(depois));
      const sobra = depois.restos.filter((k) => chavesDeVisitante.indexOf(k) < 0);
      reg('exclusão: no aparelho sobra só o que um visitante novo tem', !sobra.length && depois.restos.indexOf('endodirect_v1_notes') < 0 && depois.restos.indexOf('endodirect_v1_user_profile') < 0, 'sobra: ' + sobra.join(','));
      reg('exclusão: continua no modo app depois de recarregar', depois.app);
      reg('exclusão: sem erro de JS', !s.erros.length, s.erros.join(' | '));
      await s.ctx.close();

      // 6. Exclusão que falha no servidor: mostra o motivo, libera o botão, não sai da conta.
      s = await abrir(browser, B + '/', { acessos: [] }, { apiResposta: () => ({ status: 502, body: { ok: false, error: 'Não conseguimos cancelar a renovação da sua assinatura, por isso nada foi apagado.' } }) });
      await nav(s.page, 'perfil');
      await s.page.waitForTimeout(300);
      await s.page.click('#btn-pf-excluir');
      await s.page.fill('#pf-excluir-txt', 'EXCLUIR');
      await s.page.click('#btn-pf-excluir-ok');
      await s.page.waitForTimeout(1200);
      const f = await s.page.evaluate(() => ({ err: (document.getElementById('pf-excluir-err') || {}).innerText || '', dis: (document.getElementById('btn-pf-excluir-ok') || {}).disabled, url: location.search, app: getComputedStyle(document.getElementById('app-screen')).display }));
      reg('exclusão com falha: mostra o motivo do servidor', /nada foi apagado/.test(f.err), f.err);
      reg('exclusão com falha: botão liberado e aluno continua dentro', f.dis === false && f.url === '' && f.app !== 'none', JSON.stringify(f));
      await s.ctx.close();

      // 7. Link da página pública (#excluir-conta): com sessão abre o perfil no cartão; sem sessão, o login.
      s = await abrir(browser, B + '/#excluir-conta', { acessos: [] }, { espera: 3500 });
      const lk = await s.page.evaluate(() => {
        const c = document.getElementById('perfil-excluir');
        const r = c ? c.getBoundingClientRect() : null;
        return { painel: (document.querySelector('.panel.on') || {}).id || '', noCartao: !!(r && r.top < innerHeight && r.bottom > 0), hash: location.hash };
      });
      reg('link #excluir-conta com sessão: abre o perfil já no cartão', lk.painel === 'panel-perfil' && lk.noCartao && lk.hash === '', JSON.stringify(lk));
      await s.ctx.close();
      s = await abrir(browser, B + '/#excluir-conta', { semSessao: true });
      reg('link #excluir-conta sem sessão: login, não a landing', (await visivel(s.page, '#login-screen')) && !(await visivel(s.page, '#landing-screen')));
      await s.ctx.close();

      // 8. Conta de revisão: o limite de aparelhos não a derruba.
      s = await abrir(browser, B + '/', { acessos: ['plano', 'plano:gold'], email: 'revisao@endodirect.com.br' }, { espera: 7000 });
      const cRev = await s.page.evaluate(() => ({ claim: window.__rede.chamadas.endodirect_session_claim || 0, check: window.__rede.chamadas.endodirect_session_check || 0 }));
      await s.ctx.close();
      s = await abrir(browser, B + '/', { acessos: ['plano', 'plano:gold'] }, { espera: 7000 });
      const cAluno = await s.page.evaluate(() => ({ claim: window.__rede.chamadas.endodirect_session_claim || 0, check: window.__rede.chamadas.endodirect_session_check || 0 }));
      await s.ctx.close();
      reg('conta de revisão: nem registro nem checagem de aparelho', cRev.claim === 0 && cRev.check === 0, JSON.stringify(cRev));
      reg('aluno comum: o limite de aparelhos segue funcionando', cAluno.claim >= 1 && cAluno.check >= 1, JSON.stringify(cAluno));

      // 9. Cartão do professor: gera a senha e a mostra; gerar outra pede confirmação.
      let n = 0;
      s = await abrir(browser, B + '/', { acessos: [], email: 'nakamura.epm79@gmail.com' }, { apiResposta: (c) => (c.kind === 'conta_revisao' ? { status: 200, body: { ok: true, email: 'revisao@endodirect.com.br', senha: ['abcd-EFGH-2345-jkmn', 'pqrs-TUVW-6789-xyza'][n++ % 2], criada: n === 1 } } : { status: 200, body: { ok: true } }) });
      await clica(s.page, '.adm-nav[data-asec="estudantes"]');
      await s.page.waitForTimeout(800);
      reg('cartão da revisão: aparece em Estudantes, no painel do professor', await visivel(s.page, '#adm-revisao-card'));
      const antesDeGerar = s.api.filter((a) => a.corpo.kind === 'conta_revisao').length;
      reg('cartão da revisão: nada é gerado só de abrir a seção', antesDeGerar === 0);
      await s.page.click('[data-adm-revisao]');
      await s.page.waitForTimeout(800);
      const t1 = await s.page.innerText('#adm-revisao-card');
      let pediu = '';
      s.page.once('dialog', (d) => { pediu = d.message(); d.accept(); });
      await s.page.click('[data-adm-revisao]');
      await s.page.waitForTimeout(800);
      const t2 = await s.page.innerText('#adm-revisao-card');
      reg('cartão da revisão: a senha aparece depois de gerar', /abcd-EFGH-2345-jkmn/.test(t1) && /Conta criada/.test(t1), t1.slice(0, 200));
      reg('cartão da revisão: gerar outra pede confirmação e troca a senha', /para de funcionar/.test(pediu) && /pqrs-TUVW-6789-xyza/.test(t2) && !/abcd-EFGH/.test(t2), pediu);
      const revs = s.api.filter((a) => a.corpo.kind === 'conta_revisao');
      reg('cartão da revisão: chama o servidor com o token', revs.length === 2 && revs.every((a) => a.auth === 'Bearer t'), JSON.stringify(s.api.map((a) => a.corpo.kind)));
      reg('cartão da revisão: sem erro de JS', !s.erros.length, s.erros.join(' | '));
      await s.ctx.close();

      // 10. Página pública, também no celular.
      s = await abrir(browser, B + '/excluir-conta', { semSessao: true }, { viewport: { width: 375, height: 780 }, espera: 500 });
      const pg = await s.page.evaluate(() => ({
        titulo: document.title,
        link: !!document.querySelector('a[href="/#excluir-conta"]'),
        rolagem: document.documentElement.scrollWidth <= innerWidth + 1,
        secoes: Array.from(document.querySelectorAll('h2')).map((h) => h.textContent)
      }));
      reg('página /excluir-conta: abre, tem o caminho e cabe no celular', pg.link && pg.rolagem && /Excluir sua conta/.test(pg.titulo) && pg.secoes.length >= 4, JSON.stringify(pg));
      await s.ctx.close();
    }
  } finally {
    await browser.close();
    servidor.close();
  }
  const falhas = resultados.filter((r) => !r.ok);
  console.log('LADO=' + LADO + ' (código novo: ' + NOVO + ')');
  console.log('OBSERVADO: ' + JSON.stringify(obs));
  if (!NOVO) console.log('(na main as conferências do app são invertidas: provam que o comportamento antigo era o de mostrar a compra)');
  resultados.forEach((r) => console.log((r.ok ? '✓ ' : '✗ ') + r.nome + (r.ok || !r.det ? '' : '  → ' + r.det)));
  console.log(falhas.length ? falhas.length + ' falha(s)' : 'tudo certo');
  process.exit(falhas.length ? 1 : 0);
}
rodar().catch((e) => { console.error(e); process.exit(2); });
