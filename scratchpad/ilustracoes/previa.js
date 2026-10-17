'use strict';
// PRÉVIA DAS ILUSTRAÇÕES NO MEIO DO CAPÍTULO, com o código do próprio app.
//
// Monta o texto do capítulo com as ilustrações inseridas (texto.js, o mesmo que vai ao
// banco), renderiza com o `mdToHtml` e o CSS reais do index.html — extraídos com as
// funções de que dependem — e fotografa no celular (390 px) e no notebook (1280 px).
// Confere: cada ilustração aparece logo depois do trecho combinado, com legenda, carrega,
// cabe na coluna; o toque abre o ampliador (no celular, no tamanho natural, com rolagem).
//   PLAYWRIGHT_CORE=… node scratchpad/ilustracoes/previa.js <capítulo.json> <pasta das fotos>
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const { textoComIlustracoes, ilustracoesDo } = require('./texto.js');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const RAIZ = path.join(__dirname, '..', '..');
const PORTA = 8874;
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

// Extrai do index.html uma função ou variável de topo e, recursivamente, as de topo que
// ela usa (o renderizador de markdown depende de umas quinze). O recorte é feito pelo
// analisador do TypeScript, que entende regex e strings (contar chaves erra).
const ts = require(process.env.TYPESCRIPT || '/opt/node22/lib/node_modules/typescript');
const topo = new Map(), ordem = new Map(); let seq = 0;
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const sf = ts.createSourceFile('app.js', m[1], ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
  // O app inteiro está numa função autoexecutada — (function(){ 'use strict'; … })() —
  // e as declarações "de topo" são as do corpo dela.
  const sts = [];
  for (const st of sf.statements) {
    let e = ts.isExpressionStatement(st) ? st.expression : null;
    if (e && ts.isCallExpression(e)) { let f = e.expression; while (ts.isParenthesizedExpression(f)) f = f.expression; if (ts.isFunctionExpression(f) && f.body) { sts.push(...f.body.statements); continue; } }
    sts.push(st);
  }
  for (const st of sts) {
    seq++;
    if (ts.isFunctionDeclaration(st) && st.name && !topo.has(st.name.text)) { topo.set(st.name.text, st.getText(sf)); ordem.set(st.name.text, seq); }
    // variável: num try próprio — se o valor inicial depender de algo que não veio, a
    // falha fica nela (o `var` é içado e a página segue).
    else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && !topo.has(d.name.text)) { topo.set(d.name.text, 'try{' + st.getText(sf) + '}catch(e){console.warn("previa: " + e.message);}'); ordem.set(d.name.text, seq); }
  }
}
// Na ORDEM DO CÓDIGO-FONTE: variável que depende de outra (RE_IMG_BLOCO usa mdAltRE)
// precisa nascer depois dela, senão vira regex com "undefined" e a figura cai num <p>.
function extrai(raizes) {
  const feitos = new Set(), fila = [...raizes], partes = [], vistas = new Set();
  while (fila.length) {
    const nome = fila.shift();
    if (feitos.has(nome)) continue; feitos.add(nome);
    const src = topo.get(nome);
    if (!src || vistas.has(src)) continue;
    vistas.add(src); partes.push({ src, o: ordem.get(nome) || 0 });
    for (const id of new Set(src.match(/[A-Za-z_$][\w$]*/g) || [])) if (!feitos.has(id) && topo.has(id)) fila.push(id);
  }
  return partes.sort((a, b) => a.o - b.o).map((p) => p.src).join('\n');
}
const css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');

(async () => {
  const [arqCap, pastaFotos] = process.argv.slice(2);
  const cap = JSON.parse(fs.readFileSync(arqCap, 'utf8'));
  const base = 'http://127.0.0.1:' + PORTA;
  const texto = textoComIlustracoes(cap, base);
  const ilus = ilustracoesDo(cap);
  const js = extrai(['mdToHtml', 'ensureLightbox', 'esc']);
  const pagina = '<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style></head>'
    + '<body style="margin:0;display:block"><div style="max-width:900px;min-width:0;margin:0 auto;padding:12px"><div class="dir-card" style="padding:14px"><div class="dir-texto" id="t"></div></div></div>'
    + '<script>' + js + '\n;window.__T=' + JSON.stringify(texto) + ';document.getElementById("t").innerHTML=mdToHtml(window.__T);ensureLightbox();</script></body></html>';
  const tipos = { '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(pagina); }
    const arq = path.join(RAIZ, u);
    if (!arq.startsWith(RAIZ) || !fs.existsSync(arq)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': tipos[path.extname(arq)] || 'application/octet-stream' }); fs.createReadStream(arq).pipe(res);
  });
  await new Promise((r) => srv.listen(PORTA, '127.0.0.1', r));
  const nav = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const falhas = [];
  fs.mkdirSync(pastaFotos, { recursive: true });
  try {
    for (const [nome, largura] of [['celular', 390], ['notebook', 1280]]) {
      const pg = await nav.newPage({ viewport: { width: largura, height: 900 }, deviceScaleFactor: largura < 500 ? 2 : 1 });
      const erros = []; pg.on('pageerror', (e) => erros.push(String(e.message || e)));
      await pg.goto(base + '/', { waitUntil: 'load' });
      await pg.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
      await pg.waitForFunction(() => [...document.querySelectorAll('.dir-texto img')].every((i) => i.complete), null, { timeout: 30000 });
      const diag = await pg.evaluate(() => ({ n: document.querySelectorAll('.dir-texto img').length, figs: document.querySelectorAll('.dir-texto figure').length, len: (document.getElementById('t') || {}).innerHTML ? document.getElementById('t').innerHTML.length : -1, srcs: [...document.querySelectorAll('.dir-texto img')].map((i) => i.getAttribute('src')).slice(0, 3) }));
      if (!diag.n) console.log('    diagnóstico: ' + JSON.stringify(diag) + ' erros: ' + JSON.stringify(erros.slice(0, 3)));
      if (process.env.PREVIA_DIAG) console.log('    pais da 1ª imagem: ' + await pg.evaluate(() => { const im = document.querySelector('.dir-texto img'); const c = []; let e = im; while (e && e.id !== 't') { c.push(e.tagName + (e.className ? '.' + e.className : '')); e = e.parentElement; } return c.join(' < ') + ' | ' + im.parentElement.outerHTML.slice(0, 300); }) + ' | largura do body ' + await pg.evaluate(() => document.body.scrollWidth + '/' + window.innerWidth));
      const r = await pg.evaluate((ids) => {
        const col = document.getElementById('t').clientWidth;
        return ids.map((id) => {
          const img = [...document.querySelectorAll('.dir-texto img')].find((i) => i.src.indexOf(id) >= 0);
          if (!img) return { id, achou: false };
          const fig = img.closest('figure'), ant = fig && fig.previousElementSibling;
          return { id, achou: true, carregou: img.naturalWidth > 0, largura: Math.round(img.getBoundingClientRect().width), col, cabe: img.getBoundingClientRect().width <= col + 0.5, legenda: fig ? (fig.querySelector('figcaption') || {}).textContent || '' : '', antes: ant ? ant.textContent.slice(-90) : '' };
        });
      }, ilus.map((i) => i.id));
      r.forEach((x, k) => {
        if (!x.achou) { falhas.push(nome + ': ' + x.id + ' não está no texto'); return; }
        if (!x.carregou) falhas.push(nome + ': ' + x.id + ' não carregou');
        if (!x.cabe) falhas.push(nome + ': ' + x.id + ' mais larga que a coluna');
        if (!x.legenda) falhas.push(nome + ': ' + x.id + ' sem legenda');
        const ancora = ilus[k].depoisDe.replace(/\*\*/g, '').slice(-40);
        if (x.antes.replace(/\s+/g, ' ').indexOf(ancora.replace(/\s+/g, ' ')) < 0) falhas.push(nome + ': ' + x.id + ' não ficou logo depois do trecho combinado (antes: "…' + x.antes + '")');
        console.log('  · ' + nome + ': ' + x.id + ' → ' + x.largura + ' px de ' + x.col + '; antes: "…' + x.antes.slice(-50) + '"');
      });
      // fotos: página inteira e cada ilustração com o texto em volta
      await pg.screenshot({ path: path.join(pastaFotos, 'capitulo-' + nome + '.png'), fullPage: true });
      for (const x of ilus) {
        const el = await pg.$('figure:has(img[src*="' + x.id + '"])');
        if (el) { await el.scrollIntoViewIfNeeded(); await pg.evaluate(() => window.scrollBy(0, -160)); await pg.waitForTimeout(150); await pg.screenshot({ path: path.join(pastaFotos, x.id + '-' + nome + '.png') }); }
      }
      // ampliador: toque na 1ª ilustração
      await pg.click('figure:has(img[src*="' + ilus[0].id + '"]) img');
      const lb = await pg.evaluate(() => { const ov = document.getElementById('img-lightbox'), im = ov.firstChild; return { aberto: getComputedStyle(ov).display === 'flex', w: Math.round(im.getBoundingClientRect().width), nat: im.naturalWidth, rola: ov.scrollWidth > ov.clientWidth + 1 }; });
      if (!lb.aberto) falhas.push(nome + ': o toque não abriu o ampliador');
      else if (largura < 500 && !(lb.w === lb.nat && lb.rola)) falhas.push(nome + ': no celular a ilustração devia abrir no tamanho natural, com rolagem: ' + JSON.stringify(lb));
      console.log('    ampliador: ' + lb.w + ' px de ' + lb.nat + (lb.rola ? ', com rolagem' : ', cabe'));
      await pg.screenshot({ path: path.join(pastaFotos, 'ampliador-' + nome + '.png') });
      if (erros.length) falhas.push(nome + ': erro de página ' + erros.join(' | '));
      await pg.close();
    }
  } finally { await nav.close(); srv.close(); }
  if (falhas.length) { console.log('PROBLEMAS:'); falhas.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
