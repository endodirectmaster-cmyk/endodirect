// FIGURAS DOS RESUMOS NA TELA DO ALUNO (16/10/2026) — em Chromium, no celular e no notebook.
//
// O confere.js mede cada SVG sozinho. Este check mede o que o aluno vê: a figura
// montada pela função do próprio app (`dirFigurasHTML`, tirada do index.html), com o
// CSS do app, dentro de uma coluna de celular (390 px) e de notebook (1280 px).
// Confere que todas as imagens carregam, cabem na coluna (sem rolagem lateral) e
// mantêm a proporção; toca numa figura e confere o ampliador (no celular, o esquema
// abre no tamanho natural e rola; no notebook, cabe na tela); grava as capturas.
//
// Como rodar (da raiz do repositório):
//   PLAYWRIGHT_CORE=/opt/node22/lib/node_modules/playwright node scratchpad/figuras-resumos-navegador/check.js
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const RAIZ = path.join(__dirname, '..', '..');
const PORTA = 8872;
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chave sem par: ' + nome);
}
// As regras de CSS das figuras, como estão no app.
const css = (html.match(/^\.dfx-title\{[^\n]*$/m) || [''])[0] + '\n' + (html.match(/^\.dir-texto \.wys-img,\.dir-fig img\{[^\n]*$/m) || [''])[0];

const svgs = fs.readdirSync(path.join(RAIZ, 'figuras', 'resumos')).filter((f) => f.endsWith('.svg')).sort();
const figs = svgs.map((f) => ({ titulo: f.replace(/\.svg$/, ''), url: 'http://127.0.0.1:' + PORTA + '/figuras/resumos/' + f, fonte: 'Esquema Endodirect — ilustração original a partir do texto do capítulo.' }));

const pagina = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  + '<style>:root{--tx:#e8edf5}body{margin:0;background:#0b1424;color:#e8edf5;font-family:sans-serif}.coluna{padding:0 16px}' + css + '</style></head><body><div class="coluna" id="c"></div>'
  + '<script>' + corpo('esc') + '\n' + corpo('safeImgSrc') + '\n' + corpo('dirFigurasHTML') + '\n' + corpo('ensureLightbox') + '\n'
  + 'document.getElementById("c").innerHTML=dirFigurasHTML(' + JSON.stringify(figs) + ');ensureLightbox();</script></body></html>';

const tipos = { '.svg': 'image/svg+xml', '.html': 'text/html; charset=utf-8' };
const servidor = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.writeHead(200, { 'content-type': tipos['.html'] }); return res.end(pagina); }
  const arq = path.join(RAIZ, u);
  if (!arq.startsWith(RAIZ) || !fs.existsSync(arq)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': tipos[path.extname(arq)] || 'application/octet-stream' });
  fs.createReadStream(arq).pipe(res);
});

(async () => {
  await new Promise((r) => servidor.listen(PORTA, '127.0.0.1', r));
  const nav = await chromium.launch({ executablePath: CHROME });
  const falhas = [];
  try {
    for (const [nome, largura] of [['celular', 390], ['notebook', 1280]]) {
      const pg = await nav.newPage({ viewport: { width: largura, height: 900 } });
      await pg.goto('http://127.0.0.1:' + PORTA + '/', { waitUntil: 'load' });
      // O app usa loading="lazy": a figura só carrega quando chega perto da tela, então
      // o check rola a página inteira, como o aluno, antes de medir.
      await pg.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      await pg.waitForFunction(() => [...document.querySelectorAll('.dir-fig img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 60000 });
      const r = await pg.evaluate(() => {
        const col = document.getElementById('c').clientWidth;
        const imgs = [...document.querySelectorAll('.dir-fig img')];
        return {
          n: imgs.length,
          quebradas: imgs.filter((i) => !i.naturalWidth).map((i) => i.src.split('/').pop()),
          largas: imgs.filter((i) => i.getBoundingClientRect().width > col + 0.5).map((i) => i.src.split('/').pop()),
          proporcao: imgs.filter((i) => i.naturalWidth && Math.abs(i.getBoundingClientRect().height / i.getBoundingClientRect().width - i.naturalHeight / i.naturalWidth) > 0.01).map((i) => i.src.split('/').pop()),
          rolagem: document.documentElement.scrollWidth > window.innerWidth,
          menor: Math.min(...imgs.map((i) => i.getBoundingClientRect().width / i.naturalWidth)),
        };
      });
      if (r.n !== svgs.length) falhas.push(nome + ': ' + r.n + ' imagens na tela, esperava ' + svgs.length);
      if (r.quebradas.length) falhas.push(nome + ': não carregaram ' + r.quebradas.join(', '));
      if (r.largas.length) falhas.push(nome + ': mais largas que a coluna ' + r.largas.join(', '));
      if (r.proporcao.length) falhas.push(nome + ': proporção distorcida ' + r.proporcao.join(', '));
      if (r.rolagem) falhas.push(nome + ': a página rola na horizontal');
      console.log('  · ' + nome + ' (' + largura + ' px): ' + r.n + ' figuras carregadas; menor escala ' + (r.menor * 100).toFixed(0) + '%');
      await pg.screenshot({ path: path.join(__dirname, 'figuras-' + nome + '.png'), clip: { x: 0, y: 0, width: largura, height: 900 } });
      // O ampliador, com o toque do aluno na primeira figura.
      await pg.click('.dir-fig img');
      const lb = await pg.evaluate(() => {
        const ov = document.getElementById('img-lightbox'), im = ov.firstChild, r = im.getBoundingClientRect();
        return { aberto: getComputedStyle(ov).display === 'flex', largura: Math.round(r.width), natural: im.naturalWidth, rola: ov.scrollWidth > ov.clientWidth + 1 };
      });
      const esperaRolar = nome === 'celular';
      if (!lb.aberto) falhas.push(nome + ': o toque na figura não abriu o ampliador');
      else if (esperaRolar && (lb.largura !== lb.natural || !lb.rola)) falhas.push(nome + ': o ampliador devia mostrar a figura no tamanho natural, com rolagem: ' + JSON.stringify(lb));
      else if (!esperaRolar && (lb.largura > largura * 0.96 + 1 || lb.rola)) falhas.push(nome + ': no notebook a figura devia caber no ampliador: ' + JSON.stringify(lb));
      console.log('    ampliador: ' + lb.largura + ' px de ' + lb.natural + (lb.rola ? ', com rolagem' : ', cabe na tela'));
      await pg.screenshot({ path: path.join(__dirname, 'ampliador-' + nome + '.png') });
      await pg.mouse.click(5, 5);
      if (await pg.evaluate(() => getComputedStyle(document.getElementById('img-lightbox')).display !== 'none')) falhas.push(nome + ': o toque não fechou o ampliador');
      await pg.close();
    }
  } finally {
    await nav.close();
    servidor.close();
  }
  if (falhas.length) { console.error('falhas:\n  ✗ ' + falhas.join('\n  ✗ ')); process.exit(1); }
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
