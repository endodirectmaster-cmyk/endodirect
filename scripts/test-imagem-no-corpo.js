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
  ok(/width:35%/.test(html),
     'a imagem inserida tem de entrar em tamanho médio, não no tamanho natural');
  ok(/data-refimgw="20"/.test(html) && /data-refimgw="35"/.test(html) && /data-refimgw="100"/.test(html),
     'a barra do resumo precisa dos três tamanhos P/M/G');
  // ⚠️ Só a porcentagem não segura a imagem: 40% de uma coluna de 1600 px ainda são
  // 630 px. O teto absoluto é o que dá tamanho físico previsível em monitor largo.
  ok(/\.dir-texto \.wys-img,\.wys-edit \.wys-img\{max-width:min\(100%,820px\)\}/.test(html),
     'a imagem do corpo precisa de teto absoluto além da porcentagem');
  // A imagem fica SEMPRE centralizada (pedido do professor, 10/08). Com display:block
  // é a margem lateral `auto` que centraliza — e ela vale em qualquer largura P/M/G,
  // sem depender do alinhamento do parágrafo em volta.
  ok(/\.wys-edit \.wys-img,\.wys-img\{[^}]*margin:\.5rem auto[^}]*\}/.test(html),
     'a imagem do corpo tem de ficar centralizada (margem lateral auto)');

  // 8) ⚠️ LEGENDA ABAIXO DA FIGURA. Ela viaja no `alt` do markdown
  //    (`![legenda](url){35}`) e tem de sobreviver ao ciclo inteiro, como o tamanho.
  //    Legenda que some ao salvar é o mesmo defeito da imagem que sumia: perder o
  //    trabalho do professor em silêncio.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<p>Antes.</p><figure class="wys-fig"><img class="wys-img" style="width:35%;height:auto" src="' + PNG + '" alt="">'
      + '<figcaption class="wys-cap">Figura 2.2 — regulação do apetite</figcaption></figure><p>Depois.</p>';
    const md = htmlToMd(corpo);
    ok(/!\[Figura 2\.2 — regulação do apetite\]/.test(md),
       'ao salvar, a legenda tem de virar o alt do markdown (veio: ' + JSON.stringify(md.slice(0, 80)) + ')');
    ok(/\)\{35\}/.test(md), 'a figura com legenda não pode perder o tamanho escolhido');

    const devolta = dom.window.document.createElement('div');
    devolta.innerHTML = mdToHtml(md);
    const fc = devolta.querySelector('figcaption');
    ok(!!fc && /Figura 2\.2/.test(fc.textContent || ''),
       'REGRESSÃO: ao reabrir, a legenda sumiu');
    const fim = devolta.querySelector('figure img');
    ok(!!fim && /width:\s*35%/.test(fim.getAttribute('style') || ''),
       'a imagem com legenda mantém o tamanho ao reabrir');
    // A ORDEM importa: legenda ABAIXO da imagem, que foi o pedido.
    const dentro = [...devolta.querySelector('figure').children].map((n) => n.tagName);
    ok(dentro.indexOf('IMG') === 0 && dentro.indexOf('FIGCAPTION') === 1,
       'a legenda tem de vir DEPOIS da imagem (veio: ' + JSON.stringify(dentro) + ')');
  }

  // 9) Sem legenda, nada muda: nem <figure> vazia, nem legenda fantasma.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<figure class="wys-fig"><img class="wys-img" src="' + PNG + '" alt=""><figcaption class="wys-cap"><br></figcaption></figure>';
    const md = htmlToMd(corpo);
    ok(/^!\[\]\(/.test(md.trim()),
       'figcaption vazio (só <br>, como o navegador deixa) não pode virar legenda (veio: ' + JSON.stringify(md.slice(0, 40)) + ')');
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml(md);
    ok(!d.querySelector('figcaption'), 'sem legenda não se desenha legenda vazia');
    ok(!!d.querySelector('img'), 'e a imagem continua lá');
  }

  // 10) ⚠️ `]` NA LEGENDA fecharia o alt cedo e cortaria o texto do professor.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<figure class="wys-fig"><img class="wys-img" src="' + PNG + '" alt="">'
      + '<figcaption class="wys-cap">Figura 2.2 [adaptada] — apetite</figcaption></figure>';
    const md = htmlToMd(corpo);
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml(md);
    const fc = d.querySelector('figcaption');
    ok(!!fc && (fc.textContent || '').indexOf('[adaptada] — apetite') >= 0,
       'legenda com colchete não pode ser truncada nem voltar com barra invertida (veio: '
       + JSON.stringify(fc ? fc.textContent : null) + ')');
  }

  // 11) ⚠️ A FIGURA NÃO PODE SAIR DENTRO DE UM <p>: <figure> é conteúdo de fluxo e o
  //     parser do navegador a EXPULSA do parágrafo, embaralhando a ordem do texto.
  {
    const d = dom.window.document.createElement('div');
    d.innerHTML = mdToHtml('Antes.\n\n![Uma legenda](' + PNG + '){35}\n\nDepois.\n');
    const fig = d.querySelector('figure');
    ok(!!fig && fig.parentNode === d,
       'a figura tem de ser bloco de primeiro nível, nunca filha de um <p>');
    const ordem = [...d.children].map((n) => n.tagName);
    ok(ordem.indexOf('FIGURE') > 0 && ordem.indexOf('FIGURE') < ordem.length - 1,
       'a figura fica ENTRE os parágrafos (veio: ' + JSON.stringify(ordem) + ')');
  }

  // 12) A legenda acrescentada a uma imagem ANTIGA (que está dentro de um <p>) não
  //     pode vazar como texto cru colado no markdown da imagem.
  {
    const corpo = dom.window.document.createElement('div');
    corpo.innerHTML = '<p><figure class="wys-fig"><img class="wys-img" src="' + PNG + '" alt="">'
      + '<figcaption class="wys-cap">Legenda nova</figcaption></figure></p>';
    const md = htmlToMd(corpo);
    ok(md.indexOf(')Legenda nova') < 0 && md.indexOf('![Legenda nova](') >= 0,
       'legenda de figura dentro de <p> tem de virar alt, não texto solto (veio: '
       + JSON.stringify(md.slice(0, 80)) + ')');
  }

  // 13) A opção existe na barra e sabe embrulhar imagem antiga.
  ok(/data-refimgcap=/.test(html), 'a barra do resumo precisa do botão de legenda');
  ok(/function wysGarantirLegenda/.test(html),
     'precisa da função que embrulha a imagem antiga em <figure> para poder legendar');
  ok(/figcaption class="wys-cap"/.test(html),
     'a imagem inserida já entra com o campo de legenda pronto');
  ok(/\.wys-edit \.wys-cap:empty::before\{content:attr\(data-ph\)/.test(html),
     'no editor, a legenda vazia precisa aparecer — senão não há onde clicar');
  // ⚠️ Guarda de CSS (não há comportamento para executar em jsdom): ao legendar uma
  // imagem antiga a figura fica dentro de um <p>, e `.wys-edit p{text-align-last:left}`
  // é HERDADO pela legenda de uma linha só. Sem fixar, o editor mostrava à ESQUERDA
  // o que o aluno vê CENTRALIZADO — medido em Chromium.
  ok(/\.wys-cap\{[^}]*text-align:justify;text-align-last:center/.test(html),
     'a legenda precisa fixar text-align E text-align-last: justificada quando é longa, '
     + 'centralizada quando cabe numa linha — e sem o text-align-last ela herda "left" dentro do <p>');
  // ⚠️ Sem teto de largura a legenda atravessava a coluna inteira (1.512 px) enquanto
  // a figura tinha 302 px: lia-se como parágrafo do texto, não como legenda da figura.
  ok(/\.wys-cap\{[^}]*max-width:min\(100%,720px\)[^}]*margin-left:auto;margin-right:auto/.test(html),
     'a legenda precisa de largura própria centralizada, senão se espalha pela coluna toda');
  ok(/figure/.test((html.match(/\^\(h\[1-6\]\|p\|ul\|ol\|table\|hr\|blockquote\|div\|figure\)/) || [''])[0]),
     'htmlToMd tem de tratar <figure> como BLOCO, senão a legenda vaza como texto');

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
