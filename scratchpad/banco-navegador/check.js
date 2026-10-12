// O Banco de questões em Chromium REAL — ponta a ponta, com A/B contra a main.
//
// POR QUE ISTO EXISTE (24/09/2026): o teste em `vm` prova que as funções se
// comportam; este prova que o app INTEIRO, com login de assinante e Supabase
// falso, mostra na tela o que o aluno precisa ver.
//
// 12/10/2026 — AS QUESTÕES VIERAM PARA PÁGINAS. O Supabase falso agora derruba
// toda resposta acima de LIMITE bytes (padrão 5,3 MB, o limite empírico que o
// cofre registra no celular desde 23/07) e tem os tamanhos medidos em produção:
// conteúdo ~1,55 MB; Gold com 2.135 questões (3,88 MB); Gold com EndoTEEM com
// 3.015. Roda dos dois lados:
//   LADO=antes RAIZ_APP=<pasta com o index.html da main>  → o app antigo
//   LADO=depois (padrão, pasta do repositório)            → o app novo
// Cenários:
//   1. Gold, 2.135 questões: antes, o member_content (5,43 MB) não passa e o
//      Banco fica em erro; depois, conteúdo + 5 páginas chegam e o Banco mostra
//      as 2.135.
//   2. Gold com EndoTEEM, 3.015 questões: idem (antes 7,2 MB; depois 7 páginas).
//   3. Rede caindo só nas questões, banco pequeno: erro com "Tentar de novo",
//      a Gold segue Gold; com a rede de volta, o botão traz as questões.
//   4. (depois) Uma página instável: repetida sozinha, banco completo.
//   5. (depois) O banco muda no meio da carga: nenhuma colcha de duas versões.
//   6. Uma carga por vez no boot (getSession + SIGNED_IN).
//   7. Rede muda desde o início com acessos guardados: o chip nasce "Gold".
//
// Como: o <script> do supabase-js é interceptado e substituído por um cliente
// falso (window.supabase.createClient) com sessão de aluno real; os demais
// CDNs viram stub. O estado da rede é controlado por window.__rede.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const DEPOIS = LADO === 'depois';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '11111111-2222-3333-4444-555555555555';
const PORTA = DEPOIS ? 8811 : 8812;
// Versão das novidades, lida do próprio index.html: a chave guardada tem de bater.
const WHATSNEW_VER = (fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';

const FAKE_SUPABASE = `
(function(){
  window.__rede = Object.assign({
    limite: 5300000,          // resposta maior que isto "não chega" (TypeError, como a rede do celular)
    nProvas: 3,               // questões do aluno
    pad: 1650,                // tamanho do comentário (~1,8 KB por questão, como em produção)
    bytesConteudo: 1550000,   // tamanho do resto do conteúdo (medido: ~1,55 MB no Gold)
    provasFalha: 0,           // quantas vezes CADA chamada de questões cai antes de responder
    paginaInstavel: null,     // {pagina, vezes}: só esta página cai
    versaoMuda: false,        // na 1ª volta, as páginas >= 1 vêm de outra versão
    conteudoFalha: false, acessosFalha: false,
    chamadas: {}, porPagina: {}, maiorResposta: 0
  }, window.__redeInicial || {});
  var R = window.__rede;
  function conta(n){ R.chamadas[n] = (R.chamadas[n]||0)+1; }
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  var cache = {};
  function provas(versao){
    var PAD = new Array(R.pad + 1).join('x');
    var k = versao + ':' + R.nProvas + ':' + R.pad;
    if (cache[k]) return cache[k];
    var out = [];
    for (var i = 0; i < R.nProvas; i++) out.push({ code:'ED-'+(i+1), inst:(i%3===2?'USP':'Endodirect'), ano:2024, area:(i%2?'Tireoide':'Diabetes'),
      stem:'Q'+(i+1)+' enunciado '+versao, options:{A:'a',B:'b',C:'c',D:'d'}, answer:'A', explanation:PAD });
    return (cache[k] = out);
  }
  function conteudo(){ return { acessos:['plano','plano:gold'], member:true, adm_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:R.nProvas}, _enchimento:new Array(R.bytesConteudo+1).join('c') }; }
  // A "travessia": acima do limite, a resposta não chega.
  function entrega(data){
    var n = JSON.stringify(data).length;
    R.maiorResposta = Math.max(R.maiorResposta, n);
    if (n > R.limite) return Promise.reject(new TypeError('Failed to fetch'));
    return Promise.resolve({ data:data, error:null });
  }
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
    rpc: function(nome, args){
      conta(nome);
      // App ANTIGO: conteúdo e questões numa resposta só.
      if (nome === 'endodirect_member_content') {
        if (R.conteudoFalha || R.provasFalha > 0) { if (R.provasFalha > 0) R.provasFalha--; return Promise.reject(new TypeError('Failed to fetch')); }
        var d = conteudo(); d.provas = provas('v1'); return entrega(d);
      }
      // App NOVO: conteúdo sem as questões …
      if (nome === 'endodirect_member_content_sem_provas') {
        if (R.conteudoFalha) return Promise.reject(new TypeError('Failed to fetch'));
        return entrega(conteudo());
      }
      // … e as questões em páginas de 500.
      if (nome === 'endodirect_member_provas_pagina') {
        var pg = (args && args.p_pagina) || 0;
        R.porPagina[pg] = (R.porPagina[pg]||0)+1;
        if (R.provasFalha > 0) { R.provasFalha--; return Promise.reject(new TypeError('Failed to fetch')); }
        if (R.paginaInstavel && R.paginaInstavel.pagina === pg && R.paginaInstavel.vezes > 0) { R.paginaInstavel.vezes--; return Promise.reject(new TypeError('Failed to fetch')); }
        var versao = 'v1';
        if (R.versaoMuda) versao = (pg >= 1 && (R.porPagina[0]||0) === 1) ? 'v2' : ((R.porPagina[0]||0) >= 2 ? 'v2' : 'v1');
        var lista = provas(versao);
        return entrega({ versao: versao, total: lista.length, por_pagina: 500, paginas: Math.max(1, Math.ceil(lista.length/500)), pagina: pg, itens: lista.slice(pg*500, (pg+1)*500) });
      }
      if (nome === 'endodirect_acessos_ativos') {
        if (R.acessosFalha) return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve({ data:['plano','plano:gold'], error:null });
      }
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes:[], diretrizes_temas:[] }, error:null });
      if (nome === 'endodirect_mural_discussoes_ids') return Promise.resolve({ data:[], error:null });
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

async function novaPagina(browser, url, opts) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
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
  return { ctx, page, erros };
}
// Janelas modais (novidades, enquete, convite de feedback…) cobrem a tela e
// engolem cliques; não são o objeto deste teste.
const semModais = (page) => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
async function abreBanco(page) {
  await semModais(page);
  await page.click('button.sb-item[data-p="quest"]', { timeout: 8000 });
  await page.waitForTimeout(300);
}
const lerBanco = (page) => page.evaluate(() => ({
  info: (document.getElementById('q-prova-info') || {}).textContent || '',
  resultados: (document.getElementById('q-gen-results') || {}).innerHTML || '',
  chip: (document.getElementById('tb-plan') || {}).textContent || '',
  degBar: !!document.getElementById('degustacao-bar'),
  rede: { chamadas: window.__rede.chamadas, porPagina: window.__rede.porPagina, maior: window.__rede.maiorResposta },
}));
// Espera a carga assentar: "Mostrando" ou o aviso de erro (com as tentativas e esperas do app).
async function esperaBanco(page, ms) {
  try {
    await page.waitForFunction(() => {
      const t = (document.getElementById('q-prova-info') || {}).textContent || '';
      return /Mostrando|Não foi possível carregar o banco/.test(t);
    }, null, { timeout: ms || 9000 });
  } catch (e) { /* o estado lido em seguida diz o que houve */ }
}

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  const kb = (n) => (n / 1e6).toFixed(2) + ' MB';

  // ── 1 e 2. O tamanho real: Gold (2.135) e Gold com EndoTEEM (3.015) ─────────
  for (const [rotulo, n] of [['1 Gold', 2135], ['2 Gold+EndoTEEM', 3015]]) {
    const { ctx, page, erros } = await novaPagina(browser, URL, { rede: { nProvas: n } });
    await abreBanco(page);
    await esperaBanco(page, 9000);
    await page.waitForTimeout(300);
    const b = await lerBanco(page);
    achados.push(`${rotulo}: "${b.info.slice(0, 70)}" | maior resposta ${kb(b.rede.maior)} | chamadas ${JSON.stringify(b.rede.chamadas)}${DEPOIS ? ' páginas ' + JSON.stringify(b.rede.porPagina) : ''}`);
    if (DEPOIS) {
      ok(new RegExp('Mostrando ' + n + ' de ' + n).test(b.info), rotulo + ': esperava "Mostrando ' + n + ' de ' + n + '" (veio "' + b.info.slice(0, 80) + '")');
      // A maior resposta passa a ser o próprio conteúdo (~1,55 MB); página ~0,9 MB.
      ok(b.rede.maior < 2e6, rotulo + ': nenhuma resposta chega perto do limite (maior: ' + kb(b.rede.maior) + ')');
      ok(!b.rede.chamadas.endodirect_member_content, rotulo + ': o app novo não chama o member_content antigo');
      const nPag = Math.ceil(n / 500);
      ok(Object.keys(b.rede.porPagina).length === nPag && Object.values(b.rede.porPagina).every((v) => v === 1), rotulo + ': ' + nPag + ' páginas, uma chamada cada (' + JSON.stringify(b.rede.porPagina) + ')');
      ok(b.chip === 'Gold' && !b.degBar, rotulo + ': chip "Gold", sem faixa de degustação');
    } else {
      // O defeito que esta mudança corrige: a resposta única não passa do limite.
      ok(/Não foi possível carregar o banco de questões/.test(b.info), rotulo + ' (antes): esperava o Banco em erro com a resposta acima do limite (veio "' + b.info.slice(0, 80) + '")');
      ok(b.rede.chamadas.endodirect_member_content === 3, rotulo + ' (antes): 3 tentativas do member_content (houve ' + b.rede.chamadas.endodirect_member_content + ')');
    }
    await page.screenshot({ path: path.join(__dirname, LADO + '-cenario' + rotulo[0] + '.png') });
    ok(erros.length === 0, rotulo + ': sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── 3. Rede caindo só nas questões (banco pequeno); depois "Tentar de novo" ──
  {
    const { ctx, page, erros } = await novaPagina(browser, URL, { rede: { nProvas: 3, provasFalha: 3 } });
    await abreBanco(page);
    await esperaBanco(page, 9000);
    await page.waitForTimeout(200);
    const a = await lerBanco(page);
    ok(/Não foi possível carregar o banco de questões/.test(a.info), '3: #q-prova-info diz que não carregou (veio: "' + a.info.slice(0, 80) + '")');
    ok(/id="btn-banco-retry"/.test(a.resultados) && !/Nenhuma questão/.test(a.resultados), '3: a área de resultados tem o botão Tentar de novo, sem "Nenhuma questão"');
    ok(a.chip === 'Gold' && !a.degBar, '3: chip "Gold" e sem faixa de degustação com as questões caídas (veio: "' + a.chip + '")');
    await semModais(page);
    await page.click('#btn-filter-provas');
    await page.waitForTimeout(200);
    const busca = await page.evaluate(() => (document.getElementById('q-gen-results') || {}).innerHTML || '');
    ok(/btn-banco-retry/.test(busca) && !/Nenhuma questão encontrada/.test(busca), '3: Buscar durante o erro mantém o aviso com o botão');
    await page.screenshot({ path: path.join(__dirname, LADO + '-banco-erro.png') });
    // a rede volta
    const antesDoClique = a.rede.chamadas[DEPOIS ? 'endodirect_member_provas_pagina' : 'endodirect_member_content'] || 0;
    await semModais(page);
    await page.click('#btn-banco-retry');
    await page.waitForFunction(() => /Mostrando/.test((document.getElementById('q-prova-info') || {}).textContent || ''), null, { timeout: 6000 }).catch(() => {});
    await semModais(page);
    const b = await lerBanco(page);
    ok(/Mostrando 3 de 3/.test(b.info), '3: depois do Tentar de novo, "Mostrando 3 de 3" (veio: "' + b.info.slice(0, 80) + '")');
    ok(/Q1 enunciado|Q2 enunciado|Q3 enunciado/.test(b.resultados) && !/btn-banco-retry/.test(b.resultados), '3: as questões aparecem e o botão some');
    const depoisDoClique = b.rede.chamadas[DEPOIS ? 'endodirect_member_provas_pagina' : 'endodirect_member_content'] || 0;
    ok(depoisDoClique - antesDoClique === 1, '3: o Tentar de novo custou exatamente UMA chamada a mais (' + antesDoClique + ' → ' + depoisDoClique + ')');
    achados.push(`3 rede caindo nas questões: erro "${a.info.slice(0, 50)}" → após o botão "${b.info.slice(0, 40)}" | chamadas ${JSON.stringify(b.rede.chamadas)}`);
    await page.screenshot({ path: path.join(__dirname, LADO + '-banco-recuperado.png') });
    ok(erros.length === 0, '3: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  if (DEPOIS) {
    // ── 4. Uma página instável: repetida sozinha, banco completo ──────────────
    {
      const { ctx, page, erros } = await novaPagina(browser, URL, { rede: { nProvas: 2135, paginaInstavel: { pagina: 2, vezes: 2 } } });
      await abreBanco(page);
      await esperaBanco(page, 9000);
      const b = await lerBanco(page);
      ok(/Mostrando 2135 de 2135/.test(b.info), '4: com a página 2 caindo duas vezes, o banco chega inteiro (veio "' + b.info.slice(0, 80) + '")');
      ok(b.rede.porPagina[2] === 3 && b.rede.porPagina[0] === 1 && b.rede.porPagina[4] === 1, '4: só a página instável é repetida (' + JSON.stringify(b.rede.porPagina) + ')');
      achados.push(`4 página 2 instável: "${b.info.slice(0, 40)}" | páginas ${JSON.stringify(b.rede.porPagina)}`);
      ok(erros.length === 0, '4: sem pageerror (' + JSON.stringify(erros) + ')');
      await ctx.close();
    }
    // ── 5. O banco muda no meio da carga ─────────────────────────────────────
    {
      // Questões curtas aqui: a conferência lê a cópia gravada no aparelho, que tem cota.
      const { ctx, page, erros } = await novaPagina(browser, URL, { rede: { nProvas: 1200, pad: 10, versaoMuda: true } });
      await abreBanco(page);
      await esperaBanco(page, 9000);
      const b = await lerBanco(page);
      const versoes = await page.evaluate(() => {
        // O app roda numa IIFE (provasDB não é alcançável daqui): confere o que ele
        // gravou no aparelho, que é exatamente a lista aplicada (applyStatePayload).
        let lista = null;
        try { lista = JSON.parse(localStorage.getItem('endodirect_v1_provas')); } catch (e) {}
        if (!Array.isArray(lista)) return { erro: 'cópia local ausente' };
        const s = {}; lista.forEach((q) => { const v = (q.stem || '').split(' ').pop(); s[v] = (s[v] || 0) + 1; }); return s;
      });
      ok(/Mostrando 1200 de 1200/.test(b.info), '5: banco completo depois da mudança no meio (veio "' + b.info.slice(0, 80) + '")');
      ok(b.rede.porPagina[0] === 2, '5: a carga recomeçou uma vez (página 0 pedida ' + b.rede.porPagina[0] + '×)');
      ok(JSON.stringify(versoes) === JSON.stringify({ v2: 1200 }), '5: todas as questões da MESMA versão, nenhuma colcha (' + JSON.stringify(versoes) + ')');
      achados.push(`5 banco muda no meio: "${b.info.slice(0, 40)}" | versões na memória ${JSON.stringify(versoes)} | páginas ${JSON.stringify(b.rede.porPagina)}`);
      ok(erros.length === 0, '5: sem pageerror (' + JSON.stringify(erros) + ')');
      await ctx.close();
    }
  }

  // ── 6. Uma carga por vez: getSession e SIGNED_IN no boot ──────────────────
  {
    const { ctx, page } = await novaPagina(browser, URL, { rede: { nProvas: 3 } });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => ({ c: window.__rede.chamadas, p: window.__rede.porPagina }));
    if (DEPOIS) {
      ok(d.c.endodirect_member_content_sem_provas === 1 && d.p[0] === 1 && !d.c.endodirect_member_content, '6: boot com sessão + SIGNED_IN faz UMA chamada de conteúdo e UMA página 0 (' + JSON.stringify(d) + ')');
    } else {
      ok(d.c.endodirect_member_content === 1, '6 (antes): UMA chamada ao member_content (' + JSON.stringify(d.c) + ')');
    }
    achados.push(`6 boot: ${JSON.stringify(d.c)}`);
    await ctx.close();
  }

  // ── 7. Rede muda desde o início; acessos guardados no aparelho ─────────────
  {
    const { ctx, page, erros } = await novaPagina(browser, URL, { acessosGuardados: ['plano', 'plano:gold'], rede: { conteudoFalha: true, acessosFalha: true, provasFalha: 99 } });
    await page.waitForTimeout(300);
    const c = await page.evaluate(() => ({ chip: (document.getElementById('tb-plan') || {}).textContent || '', degBar: !!document.getElementById('degustacao-bar') }));
    ok(c.chip === 'Gold' && !c.degBar, '7: com acessos guardados, o chip já nasce "Gold" e sem faixa de degustação (veio: "' + c.chip + '")');
    ok(erros.length === 0, '7: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  await browser.close(); srv.close();
  console.log('[' + LADO + '] ' + achados.join('\n[' + LADO + '] '));
  if (problemas.length) { console.error('\n[' + LADO + '] REPROVADO:\n- ' + problemas.join('\n- ')); process.exit(1); }
  console.log('[' + LADO + '] OK — todas as expectativas deste lado conferem em Chromium real.');
})().catch((e) => { console.error('erro no harness:', e); process.exit(2); });
