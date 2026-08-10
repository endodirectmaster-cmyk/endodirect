// Regressão: imagem inserida NO CORPO do resumo tem de sobreviver ao salvar/reabrir.
//
// O painel "Imagem do capítulo" põe UMA figura por capítulo, posicionada pelo
// marcador `[[figura]]`. O professor pediu outra coisa: inserir imagem **no ponto do
// texto** onde está escrevendo. Isso passa pelo editor WYSIWYG, e o ciclo é
//
//     <img> no contenteditable  --htmlToMd-->  ![](url)  --mdToHtml-->  <img>
//
// ⚠️ A imagem vinda do computador não tem URL http: vira `data:image/...`. Enquanto
// o `mdInline` exigia `https?://`, o ciclo PERDIA a imagem — o htmlToMd gravava
// `![](data:...)` e o render devolvia o markdown CRU na tela do aluno. Mesmo defeito
// do anexo do capítulo, no outro caminho.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function mdToHtml'))
  .replace(/^\s*\(function\(\)\{\s*/, '')
  .replace(/^\s*['"]use strict['"];\s*/, '')
  .replace(/\}\)\(\);?\s*$/, '');

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', function () {});
const dom = new JSDOM('<body></body>', {
  url: 'https://www.endodirect.com.br/',
  runScripts: 'outside-only',
  virtualConsole,
});
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(fonte, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }

const mdToHtml = vm.runInContext('typeof mdToHtml==="function"?mdToHtml:null', ctx);
const htmlToMd = vm.runInContext('typeof htmlToMd==="function"?htmlToMd:null', ctx);
ok(!!mdToHtml && !!htmlToMd, 'mdToHtml e htmlToMd precisam existir no index.html');

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

if (mdToHtml && htmlToMd) {
  // 1) ⚠️ O ciclo completo do editor, que é onde a imagem se perdia.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<p>Antes da imagem.</p><img class="wys-img" src="' + PNG + '" alt=""><p>Depois da imagem.</p>';
    const md = htmlToMd(corpo);
    ok(md.indexOf('![](' + PNG + ')') >= 0 || md.indexOf(PNG) >= 0,
       'ao salvar, a imagem do corpo tem de virar markdown com a própria imagem dentro');

    const devolta = dom.window.document.createElement('div');
    devolta.innerHTML = mdToHtml(md);
    const img = devolta.querySelector('img');
    ok(!!img,
       'REGRESSÃO: ao reabrir, a imagem do corpo virou texto cru em vez de imagem');
    ok(img && img.getAttribute('src') === PNG, 'a imagem que volta tem de ser a mesma');
    ok((devolta.textContent || '').indexOf('data:image') < 0,
       'o data:URL não pode aparecer como TEXTO na tela do aluno');
  }

  // 2) A posição importa: a imagem fica ENTRE os parágrafos onde foi inserida.
  {
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml('Primeiro parágrafo.\n\n![](' + PNG + ')\n\nSegundo parágrafo.\n');
    const nos = [...d.children].map((n) => (n.querySelector && n.querySelector('img')) || n.tagName === 'IMG' ? 'IMG' : n.tagName);
    ok(nos.indexOf('IMG') > 0 && nos.indexOf('IMG') < nos.length - 1,
       'a imagem tem de ficar no MEIO do texto, não empurrada para o fim (veio: ' + JSON.stringify(nos) + ')');
  }

  // 3) Imagem por URL http continua funcionando (o caminho antigo).
  {
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml('![alt](https://exemplo.org/f.png)\n');
    ok(!!d.querySelector('img'), 'imagem por URL http(s) continua renderizando');
  }

  // 4) ⚠️ SEGURANÇA: markdown de imagem não pode virar porta para outros esquemas.
  {
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml('![x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)\n');
    ok(!d.querySelector('img'), 'data:text/html não pode virar <img>');
    ok((d.textContent || '').indexOf('data:text/html') >= 0,
       'o que é recusado continua VISÍVEL como texto — recusar em silêncio esconde o problema');
  }

  // 5) ⚠️ O TAMANHO TEM DE SOBREVIVER AO SALVAR. Escolher P e a imagem voltar
  //    grande ao reabrir é o mesmo que não ter o controle. O ciclo carrega a
  //    largura pelo sufixo {NN} do markdown.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<p>Antes.</p><img class="wys-img" style="width:40%;height:auto" src="' + PNG + '" alt=""><p>Depois.</p>';
    const md = htmlToMd(corpo);
    ok(/\)\{40\}/.test(md),
       'ao salvar, a largura escolhida tem de virar o sufixo {40} no markdown (veio: ' + JSON.stringify(md.slice(0, 60)) + ')');

    const devolta = dom.window.document.createElement('div');
    devolta.innerHTML = mdToHtml(md);
    const img = devolta.querySelector('img');
    ok(img && /width:\s*40%/.test(img.getAttribute('style') || ''),
       'REGRESSÃO: ao reabrir, a imagem perdeu o tamanho escolhido e voltou ao padrão');
  }

  // 6) A inserção já entra em tamanho médio: sem largura, a imagem tomava a tela.
  ok(/width:65%/.test(html),
     'a imagem inserida tem de entrar em tamanho médio, não no tamanho natural');
  ok(/data-refimgw="40"/.test(html) && /data-refimgw="65"/.test(html) && /data-refimgw="100"/.test(html),
     'a barra do resumo precisa dos três tamanhos P/M/G, como no mural');

  // 7) O botão e o caminho de inserção existem de fato na barra do editor.
  ok(/data-wys="img"/.test(html), 'a barra do editor precisa do botão de imagem');
  ok(/id="adm-ref-wysimg"/.test(html), 'precisa do seletor de arquivo ligado ao botão');
  ok(/function wysInserirImagem/.test(html), 'precisa da função que insere a imagem no cursor');
  ok(/cmd==='img'/.test(html), 'o despachante da barra precisa tratar o comando de imagem');
}

if (falhas.length) {
  console.error('✗ imagem no corpo do resumo:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ imagem no corpo: sobrevive ao salvar/reabrir, fica na posição certa e só aceita imagem de verdade');
