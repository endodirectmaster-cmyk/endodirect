// Harness do LINK DO ARTIGO ORIGINAL nos posts automáticos do mural (16/10/2026).
//
// Pedido do professor: "Colocar o link para o artigo original nos posts automáticos
// do mural. Fica ruim de ter que procurar pelo artigo manualmente." O card já tinha
// "Fonte: <revista>" com link no NOME da revista, no pé do card, depois do texto e
// da discussão: ninguém o lê como "o artigo". Este harness abre o mural do aluno
// (celular 392×850 e notebook 1280) com três posts típicos do radar e confere que o
// botão do artigo aparece logo abaixo da data, com o endereço certo, abrindo em aba
// nova; o PubMed vem ao lado quando há PMID e o link não é do PubMed.
// Uso: LADO=antes RAIZ_APP=<pasta com o index.html da main> | LADO=depois (padrão)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const RAIZ = process.env.RAIZ_APP || path.join(__dirname, '..', '..');
const LADO = process.env.LADO || 'depois';
const APP_HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TEM_BOTAO = /function muralLinkArtigoHTML\(/.test(APP_HTML);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORTA = LADO === 'depois' ? 8861 : 8862;
const UID = '11111111-2222-3333-4444-555555555555';
const WHATSNEW_VER = (APP_HTML.match(/var WHATSNEW_VER='([^']+)'/) || [])[1] || '';
const agora = Date.UTC(2026, 9, 16, 10, 0, 0);
const RADAR = [
  { sourceId: 'pubmed:42877498', auto: true, at: agora - 1000, tipo: 'Artigo de Revisão', fonte: 'Frontiers in Endocrinology', subespecialidade: 'Endocrinologia Pediátrica', titulo: 'Fertility preservation in girls with Turner syndrome', titulo_pt: 'Preservação da fertilidade em meninas e adolescentes com síndrome de Turner', link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13662555/', oa: true, pmid: '42877498', texto: 'Revisão narrativa sobre preservação da fertilidade na síndrome de Turner.\n💡 Na prática: discutir cedo a criopreservação.\n⚠️ Cautela/limitação: séries de casos pequenas.', aiSummary: true, resumo: 'x', porque: 'y' },
  { sourceId: 'journalrss:dom.71385', auto: true, at: agora - 2000, tipo: 'Estudo Original', fonte: 'Diabetes, Obesity and Metabolism', subespecialidade: 'Diabetes', titulo: 'GMI/HbA1c ratio and microvascular complications', titulo_pt: 'Associação entre a razão GMI/HbA1c e complicações microvasculares no diabetes', link: 'https://dom-pubs.onlinelibrary.wiley.com/doi/10.1111/dom.71385?af=R', oa: false, texto: 'Estudo transversal multicêntrico com usuários de MCG.\n💡 Na prática: a discordância GMI/HbA1c merece atenção.\n⚠️ Cautela/limitação: desenho transversal.', aiSummary: true, resumo: 'x', porque: 'y' },
  { sourceId: 'pubmed:41000001', auto: true, at: agora - 3000, tipo: 'Ensaio Clínico', fonte: 'The Journal of Clinical Endocrinology & Metabolism', subespecialidade: 'Tireoide', titulo: 'Trial of levothyroxine timing', titulo_pt: 'Ensaio sobre o horário da levotiroxina', link: 'https://doi.org/10.1210/clinem/dgaf001', oa: false, pmid: '41000001', texto: 'Ensaio randomizado cruzado sobre o horário da levotiroxina.\n💡 Na prática: a regularidade importa mais que o horário.', aiSummary: true, resumo: 'x', porque: 'y' }
];
const FAKE = `
(function(){
  var RADAR = ${JSON.stringify(RADAR)};
  var session = { access_token:'t', user:{ id:${JSON.stringify(UID)}, email:'aluna@exemplo.com', user_metadata:{ nome:'Aluna Teste' } } };
  function builder(){
    var st = { single:false }, b = {};
    ['select','eq','neq','in','order','limit','upsert','insert','update','delete','gte','lte','is','contains','range','or','not','filter'].forEach(function(m){ b[m] = function(){ return b; }; });
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
      if (nome === 'endodirect_member_content' || nome === 'endodirect_member_content_sem_provas') return Promise.resolve({ data:{ acessos:['plano','plano:gold'], member:true, adm_avisos:[], radar_avisos: RADAR, podcasts:[], mm_shared:[], fc_shared:[], adm_cursos:[], cursos:[], radar_hidden:[] }, error:null });
      if (nome === 'endodirect_member_provas_pagina') return Promise.resolve({ data:{ versao:'v1', total:0, por_pagina:500, paginas:1, pagina:0, itens:[] }, error:null });
      if (nome === 'endodirect_acessos_ativos') return Promise.resolve({ data:['plano','plano:gold'], error:null });
      if (nome === 'endodirect_qotd_publicadas') return Promise.resolve({ data:[], error:null });
      if (nome === 'endodirect_mural_discussoes_previas') return Promise.resolve({ data:{}, error:null });
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

(async () => {
  const srv = await serve(RAIZ, PORTA);
  const URL = 'http://127.0.0.1:' + PORTA + '/';
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const problemas = [], achados = [];
  const ok = (c, m) => { if (!c) problemas.push(m); };
  for (const vp of [{ width: 392, height: 850, nome: 'celular' }, { width: 1280, height: 900, nome: 'notebook' }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.nome === 'celular' ? 2 : 1 });
    const page = await ctx.newPage();
    const erros = [];
    page.on('pageerror', (e) => erros.push(String((e && e.message) || e).slice(0, 300)));
    await page.addInitScript(({ uid, wn }) => {
      localStorage.setItem('endodirect_v1_whatsnew_seen', JSON.stringify(wn));
      localStorage.setItem('endodirect_v1_last_uid', JSON.stringify(uid));
      localStorage.setItem('endodirect_v1_user_profile', JSON.stringify({ perfil: 'Endocrinologista', graduacao: 'UFBA', residencia: 'HUPES', crm: '12345', uf: 'BA' }));
      localStorage.setItem('endodirect_v1_acessos', JSON.stringify({ uid: uid.toLowerCase(), lista: ['plano', 'plano:gold'], at: Date.now() }));
    }, { uid: UID, wn: WHATSNEW_VER });
    await page.route('**', (route) => {
      const u = route.request().url();
      if (u.startsWith('http://127.0.0.1:')) return route.continue();
      if (u.indexOf('supabase-js') >= 0) return route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE });
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub offline */' });
    });
    await page.goto(URL + '#mural', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1800);
    await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((m) => { m.style.display = 'none'; }); });
    const cards = await page.evaluate(() => [...document.querySelectorAll('#mural-pc [data-mural-card]')].map((c) => {
      const t = (c.querySelector('h3') || {}).textContent || '';
      const art = c.querySelector('.mural-art-link a[data-art="artigo"]');
      const pm = c.querySelector('.mural-art-link a[data-art="pubmed"]');
      const data = c.querySelector('.mural-date');
      const linha = c.querySelector('.mural-art-link');
      const ordem = (linha && data) ? !!(data.compareDocumentPosition(linha) & Node.DOCUMENT_POSITION_FOLLOWING) : null;
      const r = art ? art.getBoundingClientRect() : null;
      const fonte = c.querySelector('.mural-source a');
      return { t: t.slice(0, 40), art: art ? art.getAttribute('href') : null, artTxt: art ? art.textContent.trim() : null, alvo: art ? art.getAttribute('target') : null, rel: art ? art.getAttribute('rel') : null, pm: pm ? pm.getAttribute('href') : null, ordem, alturaBotao: r ? Math.round(r.height) : 0, fonte: fonte ? fonte.getAttribute('href') : null };
    }));
    const rolaX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    achados.push(vp.nome + ': ' + cards.length + ' cards; ' + cards.map((c) => '[' + c.t + '] artigo=' + (c.art ? 'sim' : 'não') + ' (' + (c.artTxt || '') + ') pubmed=' + (c.pm ? 'sim' : 'não') + ' depois da data=' + c.ordem).join(' | '));
    ok(cards.length === 3, vp.nome + ': esperava 3 cards no mural (vieram ' + cards.length + ')');
    if (TEM_BOTAO) {
      const porTit = (s) => cards.find((c) => c.t.indexOf(s) === 0) || {};
      const oa = porTit('Preservação'), wiley = porTit('Associação'), jcem = porTit('Ensaio');
      ok(oa.art === RADAR[0].link && /texto completo/i.test(oa.artTxt || ''), vp.nome + ': card de acesso aberto sem o botão "texto completo" para o PMC');
      ok(wiley.art === RADAR[1].link.replace('?af=R', '') && !wiley.pm, vp.nome + ': card da revista sem o botão do artigo (sem o ?af=R do feed) ou com PubMed sem PMID: ' + wiley.art);
      ok(jcem.art === RADAR[2].link && jcem.pm === 'https://pubmed.ncbi.nlm.nih.gov/41000001/', vp.nome + ': card com PMID sem o PubMed ao lado do artigo');
      ok(!oa.pm || oa.pm === 'https://pubmed.ncbi.nlm.nih.gov/42877498/', vp.nome + ': PubMed do card PMC com endereço errado');
      ok(cards.every((c) => c.alvo === '_blank' && /noopener/.test(c.rel || '')), vp.nome + ': o link do artigo tem de abrir em aba nova, com noopener');
      ok(cards.every((c) => c.ordem === true), vp.nome + ': o botão do artigo tem de vir logo abaixo da data (antes do texto)');
      ok(cards.every((c) => c.alturaBotao >= 32), vp.nome + ': o botão do artigo ficou pequeno para o toque (' + cards.map((c) => c.alturaBotao).join(',') + ')');
    } else {
      ok(cards.every((c) => !c.art), vp.nome + ' (antes): não deveria haver botão do artigo');
    }
    ok(!rolaX, vp.nome + ': a página ganhou rolagem horizontal');
    await page.evaluate(() => { const c = document.querySelector('#mural-pc [data-mural-card]'); if (c) c.scrollIntoView({ block: 'start' }); });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, LADO + '-mural-' + vp.nome + '.png') });
    ok(erros.length === 0, vp.nome + ': sem pageerror (' + JSON.stringify(erros) + ')');
    await ctx.close();
  }
  await browser.close();
  srv.close();
  console.log('LADO=' + LADO + ' (botão: ' + TEM_BOTAO + ')');
  achados.forEach((a) => console.log('  · ' + a));
  if (problemas.length) { console.log('PROBLEMAS:'); problemas.forEach((p) => console.log('  ✗ ' + p)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
