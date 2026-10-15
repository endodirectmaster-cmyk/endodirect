// Conduta lipídica no PREVENT e pontos-chave das Diretrizes em Chromium REAL,
// com A/B contra a main.
//
// POR QUE ISTO EXISTE (14/10/2026): dois pedidos do professor no mesmo dia.
//   1. "insira também a conduta terapêutica (dose de estatina, ezetimiba, etc)"
//      na tela do PREVENT: o bloco de conduta, a coluna TERAPIA INICIAL no
//      quadro das metas e a tabela de doses têm de aparecer na tela do app
//      inteiro, com o formulário preenchido como no print dele (mulher de 62
//      anos com diabetes, em uso de estatina).
//   2. "Consertar": os pontos-chave das sínteses da SBD 2026 saíam com dois
//      marcadores. O card das Diretrizes tem de mostrar um só, e a linha
//      "— Evidência e notas de aplicação —" como título, sem marcador.
//
//   LADO=antes RAIZ_APP=<pasta com o index.html da main>  → o app publicado
//   LADO=depois (padrão, pasta do repositório)            → o app novo
// As expectativas seguem o que o index.html servido TEM.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TEM_CONDUTA = /function ldlCondutaHTML\(/.test(APP_HTML);
const TEM_PONTO = /function dirPontoLI\(/.test(APP_HTML);
const TEM_GRADE = /function calcCardHTML\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UID = '11111111-2222-3333-4444-555555555555';
const PORTA = LADO === 'depois' ? 8831 : 8832;
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';

// Um capítulo das Diretrizes gravado como as sínteses da SBD 2026 vinham: "• "
// dentro de cada ponto e uma linha de título entre travessões.
// ITEM_JSON=<arquivo> troca o capítulo pelo que está no arquivo (por exemplo, o
// capítulo reorganizado, com seções e tabelas, para a foto).
const DIRETRIZ = process.env.ITEM_JSON ? JSON.parse(fs.readFileSync(process.env.ITEM_JSON, 'utf8')) : {
  fonte: 'Sociedade Brasileira de Diabetes. Diretriz SBD 2026 — teste', ano: '2026', sub: 'Diabetes',
  tema: 'Diabetes Pós-Transplante (DMPT)', titulo: 'Diabetes Pós-Transplante (DMPT)', resumo: 'Texto de teste do capítulo.',
  pts: ['📌 DIRETRIZ SBD 2026 — Avaliação e tratamento do DMPT', '• Na SBD 2026, a meta de HbA1c é a faixa de 7,0% a 7,5%.',
    '• A atividade física regular é RECOMENDADA no DMPT.', '— Evidência e notas de aplicação —', '• A coorte mostrou menos eventos cardiovasculares.']
};
const SO_FOTO = !!process.env.ITEM_JSON;

const FAKE_SUPABASE = `
(function(){
  var R = window.__rede = Object.assign({ chamadas:{} }, window.__redeInicial || {});
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  function conteudo(){ return { acessos:['plano','plano:gold'], member:true, adm_avisos:[], radar_avisos:[], podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[], acervo_totais:{provas:0} }; }
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
      if (nome === 'endodirect_member_resumos') return Promise.resolve({ data:{ diretrizes:[R.diretriz], diretrizes_temas:[] }, error:null });
      if (nome === 'endodirect_mural_discussoes_previas') return Promise.resolve({ data:{}, error:null });
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

async function novaPagina(browser, url, viewport) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
  await page.addInitScript(({ uid, rede, wn }) => {
    window.__redeInicial = rede;
    localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
    localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
    localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
    localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
  }, { uid: UID, rede: { diretriz: DIRETRIZ }, wn: WHATSNEW_VER });
  await page.route('**', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:')) return route.continue();
    if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_SUPABASE });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(900);
  return { ctx, page, erros };
}
const semModais = (page) => page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
const painel = (page, p) => page.evaluate((p) => { const b = document.querySelector('button.sb-item[data-p="' + p + '"]'); if (b) b.click(); return !!b; }, p);

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };

  // ── 1. PREVENT com o formulário do print do professor ───────────────────────
  {
    const { ctx, page, erros } = await novaPagina(browser, URL);
    await semModais(page);
    ok(await painel(page, 'calc'), '1: o painel Calculadoras não abriu');
    await page.waitForTimeout(300);
    await page.evaluate(() => { const c = document.querySelector('[data-calc="prevent"]'); if (c) c.click(); });
    await page.waitForSelector('[data-calc-field="pv_idade"]', { timeout: 8000 });
    await page.evaluate(() => {
      const v = { pv_sexo: '0', pv_idade: '62', pv_ct: '250', pv_hdl: '51', pv_pas: '130', pv_egfr: '90', pv_imc: '28', pv_dm: '1', pv_fum: '0', pv_ahas: '1', pv_est: '1', pv_hba1c: '6.9', pv_ldl: '150' };
      Object.keys(v).forEach((k) => {
        const el = document.querySelector('[data-calc-field="' + k + '"]'); if (!el) return;
        el.value = v[k]; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const res = document.getElementById('calc-result');
      const t = res ? res.innerText : '';
      const rows = res ? [...res.querySelectorAll('.adm-table-row')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()) : [];
      // Só a tag de abertura do próprio elemento: o outerHTML inclui os filhos.
      return { texto: t, linhas: rows, doisStyles: res ? [...res.querySelectorAll('[style]')].some((e) => { const o = e.outerHTML; return (o.slice(0, o.indexOf('>')).match(/ style="/g) || []).length > 1; }) : false };
    });
    const temConduta = /Conduta terapêutica · SBC 2025/i.test(r.texto), temColuna = /TERAPIA INICIAL/.test(r.texto);
    achados.push(`1 PREVENT: categoria ${(r.texto.match(/CATEGORIA SBC · [A-ZÁÉÍÓÚ ]+/) || ['?'])[0]} | conduta ${temConduta} | coluna ${temColuna} | linhas de tabela ${r.linhas.length}`);
    if (TEM_CONDUTA) {
      ok(/CATEGORIA SBC · ALTO/.test(r.texto), '1: esperava categoria ALTO (diabetes em mulher ≥ 56)');
      ok(temConduta, '1: o bloco "Conduta terapêutica · SBC 2025" não apareceu');
      ok(temColuna && r.linhas.some((l) => /^ALTO/.test(l) && /estatina de alta intensidade \+ ezetimiba desde o início/.test(l)), '1: a linha ALTO do quadro não traz a terapia inicial');
      ok(/além do que a estatina atual já faz/.test(r.texto) && /precisa cair ≥ 54%/.test(r.texto), '1: em uso de estatina com LDL-c 150 (meta 70), esperava "≥ 54%" além da estatina atual');
      ok(/associar anti-PCSK9/.test(r.texto), '1: com 54% a mais, esperava anti-PCSK9');
      ['atorvastatina 40–80 mg', 'Ezetimiba', '180 mg/dia', 'evolocumabe 140 mg', '284 mg SC'].forEach((d) => ok(r.texto.indexOf(d) >= 0, '1: a tabela de doses não mostra ' + d));
      ok(!r.doisStyles, '1: elemento com dois atributos style');
    } else {
      ok(!temConduta && !temColuna, '1 (antes): esperava a tela sem o bloco de conduta');
    }
    await page.evaluate(() => { const e = [...document.querySelectorAll('#calc-result *')].find((x) => /Conduta terapêutica/.test(x.textContent || '') && x.children.length < 4); if (e) e.scrollIntoView(); });
    await page.screenshot({ path: path.join(__dirname, LADO + '-prevent.png') });
    // Celular: o quadro de sete colunas rola em vez de espremer.
    await page.setViewportSize({ width: 392, height: 850 });
    await page.waitForTimeout(300);
    const scroll = await page.evaluate(() => {
      const q = [...document.querySelectorAll('#calc-result [style*="overflow-x:auto"]')];
      return q.map((e) => ({ largura: e.clientWidth, conteudo: e.scrollWidth, rola: e.scrollWidth > e.clientWidth }));
    });
    achados.push(`1 celular: blocos com rolagem horizontal ${JSON.stringify(scroll)}`);
    if (TEM_CONDUTA) ok(scroll.length >= 2 && scroll.every((s) => s.rola), '1: no celular o quadro e a tabela de doses tinham de rolar na horizontal');
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), '1: a página inteira ganhou rolagem horizontal no celular');
    await page.screenshot({ path: path.join(__dirname, LADO + '-prevent-celular.png') });
    ok(erros.length === 0, '1: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── 2. Diretrizes: o card com os pontos-chave da SBD 2026 ───────────────────
  {
    const { ctx, page, erros } = await novaPagina(browser, URL);
    await semModais(page);
    ok(await painel(page, 'ref'), '2: o painel Diretrizes não abriu');
    await page.waitForTimeout(500);
    const abriu = await page.evaluate(() => {
      const s = document.querySelector('[data-dir-sub="Diabetes"]'); if (!s) return 'sem subespecialidade';
      s.click(); return 'sub';
    });
    await page.waitForTimeout(400);
    const tema = await page.evaluate((alvo) => {
      const t = [...document.querySelectorAll('[data-dir-tema]')].find((e) => (e.getAttribute('data-dir-tema') || '') === alvo || (e.textContent || '').indexOf(alvo) >= 0);
      if (!t) return 'sem tema'; t.click(); return 'tema';
    }, DIRETRIZ.tema);
    await page.waitForTimeout(500);
    // textContent, não innerText: o título tem text-transform: uppercase no CSS.
    const pts = await page.evaluate(() => [...document.querySelectorAll('.dir-pts li')].map((li) => ({ texto: li.textContent.trim(), classe: li.className, marcador: getComputedStyle(li).listStyleType })));
    const corpo = await page.evaluate(() => {
      const t = document.querySelector('.dir-texto');
      return { titulos: t ? t.querySelectorAll('h3').length : 0, tabelas: t ? t.querySelectorAll('table').length : 0, cru: t ? (t.innerText.match(/\|---/g) || []).length : 0 };
    });
    achados.push(`2 Diretrizes: ${abriu}/${tema}; ${pts.length} pontos; começam com "•": ${pts.filter((p) => /^•/.test(p.texto)).length}; título sem marcador: ${pts.filter((p) => p.classe === 'dir-pts-sep' && p.marcador === 'none').length}; corpo: ${corpo.titulos} títulos, ${corpo.tabelas} tabelas, ${corpo.cru} tabelas em texto cru`);
    if (SO_FOTO) {
      // Capítulo reorganizado: o que se confere é a estrutura do corpo.
      ok(corpo.titulos >= 6 && corpo.tabelas >= 1 && corpo.cru === 0, '2 (foto): esperava seções e tabela renderizadas no corpo do capítulo');
      ok(pts.length === DIRETRIZ.pts.length && pts.every((p) => !/^•/.test(p.texto)), '2 (foto): pontos-chave do capítulo reorganizado');
    } else ok(pts.length === 5, '2: esperava os 5 pontos do capítulo (vieram ' + pts.length + ')');
    if (SO_FOTO) { /* nada mais a conferir */ } else if (TEM_PONTO) {
      ok(pts.every((p) => !/^•/.test(p.texto)), '2: ainda há ponto começando com "•" (marcador duplicado)');
      ok(pts.some((p) => p.classe === 'dir-pts-sep' && p.marcador === 'none' && /^Evidência e notas de aplicação$/.test(p.texto)), '2: a linha de título não saiu como título sem marcador');
      ok(pts.some((p) => p.texto === 'Na SBD 2026, a meta de HbA1c é a faixa de 7,0% a 7,5%.'), '2: o texto do ponto não ficou limpo');
    } else {
      ok(pts.filter((p) => /^•/.test(p.texto)).length === 3, '2 (antes): esperava reproduzir o print, com "•" dentro dos pontos');
    }
    await page.evaluate(() => { const e = document.querySelector('.dir-pts'); if (e) e.scrollIntoView(); });
    await page.screenshot({ path: path.join(__dirname, LADO + '-diretriz.png') });
    ok(erros.length === 0, '2: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  // ── 3. A grade das calculadoras: colunas, busca, teclado, celular ───────────
  {
    const { ctx, page, erros } = await novaPagina(browser, URL, { width: 1600, height: 900 });
    await semModais(page);
    ok(await painel(page, 'calc'), '3: o painel Calculadoras não abriu');
    await page.waitForTimeout(400);
    const medir = () => page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const cards = [...document.querySelectorAll('#calc-grid [data-calc]')];
      const visiveis = cards.filter(vis);
      const grade = document.querySelector('#calc-grid .calc-area-grid');
      const primeiros = grade ? [...grade.querySelectorAll('[data-calc]')].filter(vis) : [];
      const topo = primeiros.length ? primeiros[0].offsetTop : -1;
      const linha1 = primeiros.filter((c) => c.offsetTop === topo);
      // Colunas da grade: o valor computado de uma grade visível é a lista de faixas em px.
      const colunas = grade && grade.offsetParent !== null ? getComputedStyle(grade).gridTemplateColumns.split(' ').length : 0;
      const titulos = [...document.querySelectorAll('#calc-grid .calc-area-tit')];
      const vazio = document.querySelector('#calc-grid .calc-vazio');
      const busca = document.getElementById('calc-busca');
      return {
        total: cards.length, visiveis: visiveis.length, idsVisiveis: visiveis.map((c) => c.getAttribute('data-calc')),
        porLinha: linha1.length, colunas, alturasIguais: linha1.every((c) => c.offsetHeight === linha1[0].offsetHeight),
        esquerdas: [...new Set(visiveis.map((c) => c.offsetLeft))].length,
        titulosVisiveis: titulos.filter(vis).length, titulos: titulos.length,
        vazioVisivel: !!vazio && vis(vazio), busca: busca ? busca.value : null, buscaVisivel: !!busca && vis(busca),
        unidades: [...document.querySelectorAll('#calc-grid .calc-unit')].filter((u) => (u.textContent || '').trim()).length,
        abrir: document.querySelectorAll('#calc-grid .calc-go').length,
        rolaX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    const m0 = await medir();
    achados.push(`3 grade 1600px: ${m0.total} cartões, ${m0.colunas} colunas (${m0.porLinha} no 1º grupo), alturas iguais ${m0.alturasIguais}, ${m0.titulos} grupos, unidades ${m0.unidades}, "Abrir" ${m0.abrir}, busca ${m0.buscaVisivel}`);
    ok(m0.total > 20 && m0.visiveis === m0.total, '3: cartões escondidos sem busca');
    if (TEM_GRADE) {
      ok(m0.colunas >= 4, '3: a 1600px esperava 4 ou mais colunas (' + m0.colunas + ')');
      ok(m0.alturasIguais, '3: cartões da mesma linha com alturas diferentes');
      ok(m0.unidades >= 15 && m0.abrir === m0.total, '3: unidade do resultado ou o "Abrir" não aparecem nos cartões');
      ok(m0.buscaVisivel, '3: o campo de busca não está visível');
    } else {
      ok(m0.colunas === 3, '3 (antes): esperava 3 colunas fixas (' + m0.colunas + ')');
      ok(!m0.buscaVisivel, '3 (antes): não deveria haver busca');
    }
    await page.screenshot({ path: path.join(__dirname, LADO + '-grade.png'), fullPage: false });
    if (TEM_GRADE) {
      // Busca por nome: "ldl" (sem acento, sem caixa) deixa só os cartões com LDL.
      await page.focus('#calc-busca');
      await page.keyboard.type('LDL');
      await page.waitForTimeout(200);
      const m1 = await medir();
      const esperados = await page.evaluate(() => [...document.querySelectorAll('#calc-grid [data-calc]')].filter((c) => (c.getAttribute('data-busca') || '').indexOf('ldl') >= 0).map((c) => c.getAttribute('data-calc')));
      achados.push(`3 busca "LDL": ${m1.visiveis} visíveis ${JSON.stringify(m1.idsVisiveis)}; grupos visíveis ${m1.titulosVisiveis}/${m1.titulos}; vazio ${m1.vazioVisivel}`);
      ok(m1.visiveis >= 1 && m1.visiveis < m0.total && JSON.stringify(m1.idsVisiveis) === JSON.stringify(esperados), '3: a busca "LDL" não deixou exatamente os cartões com ldl');
      ok(m1.titulosVisiveis < m1.titulos && !m1.vazioVisivel, '3: grupos sem resultado continuaram com título à mostra');
      ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'calc-busca'), '3: o campo perdeu o foco ao digitar (redesenho?)');
      // A busca sobrevive à troca de aba.
      await page.evaluate(() => { const b = [...document.querySelectorAll('#calc-grid [data-calcarea]')].find((x) => x.getAttribute('data-calcarea')); if (b) b.click(); });
      await page.waitForTimeout(200);
      const m2 = await medir();
      achados.push(`3 troca de aba com busca: campo "${m2.busca}", ${m2.visiveis} visíveis de ${m2.total}`);
      ok(m2.busca === 'LDL' && m2.visiveis <= m2.total, '3: a busca não sobreviveu à troca de aba');
      await page.evaluate(() => { const b = document.querySelector('#calc-grid [data-calcarea=""]'); if (b) b.click(); });
      await page.waitForTimeout(200);
      // Sem resultado.
      await page.fill('#calc-busca', 'xyzxyz');
      await page.waitForTimeout(200);
      const m3 = await medir();
      ok(m3.visiveis === 0 && m3.vazioVisivel && m3.titulosVisiveis === 0, '3: busca sem resultado não mostrou o aviso (visíveis ' + m3.visiveis + ', aviso ' + m3.vazioVisivel + ')');
      await page.screenshot({ path: path.join(__dirname, LADO + '-grade-vazia.png') });
      await page.fill('#calc-busca', '');
      await page.waitForTimeout(200);
      const m4 = await medir();
      ok(m4.visiveis === m4.total && !m4.vazioVisivel && m4.titulosVisiveis === m4.titulos, '3: limpar a busca não devolveu todos os cartões');
      // Teclado: Tab até um cartão e Enter abre a calculadora.
      await page.evaluate(() => { const c = document.querySelector('#calc-grid [data-calc="ldl"]'); if (c) c.focus(); });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      const abriu = await page.evaluate(() => ({ fechar: !!document.getElementById('calc-close'), titulo: (document.querySelector('#calc-detail h2, #calc-detail h3, #calc-detail .calc-tit') || {}).textContent || '' }));
      achados.push(`3 Enter no cartão LDL: voltar ${abriu.fechar}`);
      ok(abriu.fechar, '3: Enter no cartão não abriu a calculadora');
      await page.evaluate(() => { const b = document.getElementById('calc-close'); if (b) b.click(); });
      await page.waitForTimeout(300);
      const m5 = await medir();
      ok(m5.visiveis === m5.total, '3: ao voltar da calculadora a grade não voltou inteira');
    }
    // Celular: uma coluna, busca visível, sem rolagem horizontal da página.
    await page.setViewportSize({ width: 392, height: 850 });
    await page.waitForTimeout(400);
    const mc = await medir();
    achados.push(`3 celular 392px: ${mc.esquerdas} coluna(s), rola horizontal ${mc.rolaX}, busca visível ${mc.buscaVisivel}`);
    ok(mc.esquerdas === 1, '3: no celular esperava uma coluna (' + mc.esquerdas + ' posições de esquerda)');
    ok(!mc.rolaX, '3: a página inteira ganhou rolagem horizontal no celular');
    if (TEM_GRADE) ok(mc.buscaVisivel, '3: a busca sumiu no celular');
    await page.screenshot({ path: path.join(__dirname, LADO + '-grade-celular.png') });
    ok(erros.length === 0, '3: sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + ' (conduta: ' + TEM_CONDUTA + ', pontos: ' + TEM_PONTO + ', grade: ' + TEM_GRADE + ')');
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
