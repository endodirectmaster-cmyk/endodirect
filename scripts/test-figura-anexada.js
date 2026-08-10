// Regressão: a imagem ANEXADA pelo professor precisa aparecer no capítulo.
//
// O painel "Imagem do capítulo" tem um botão Anexar que lê o arquivo do computador,
// reduz num canvas e guarda como `data:image/jpeg;base64,...` no `figuras[0].url` —
// é assim que o app carrega imagem sem bucket de storage.
//
// ⚠️ Só que o render da figura validava a URL com `safeHttpUrl`, que aceita apenas
// http(s). O professor anexava, via "Imagem anexada 🖼️", a imagem ficava salva no
// payload — e o capítulo NÃO DESENHAVA NADA. Sem erro, sem aviso: o mesmo defeito
// do mapa mental que aparecia vazio, e do gráfico que saía com uma barra a menos.
//
// ⚠️ E a correção NÃO pode ser afrouxar o `safeHttpUrl`: ele também valida `href` de
// link, onde aceitar `data:` abriria `data:text/html`. Por isso existe um validador
// separado só para SRC de imagem, e este teste guarda as duas pontas.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('function dirFigurasHTML'))
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

const dirFigurasHTML = vm.runInContext('typeof dirFigurasHTML==="function"?dirFigurasHTML:null', ctx);
const safeHttpUrl = vm.runInContext('typeof safeHttpUrl==="function"?safeHttpUrl:null', ctx);
const safeImgSrc = vm.runInContext('typeof safeImgSrc==="function"?safeImgSrc:null', ctx);
ok(!!dirFigurasHTML && !!safeHttpUrl && !!safeImgSrc,
   'dirFigurasHTML, safeHttpUrl e safeImgSrc precisam existir no index.html');

const DATA_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==';

if (dirFigurasHTML && safeImgSrc && safeHttpUrl) {
  // 1) ⚠️ O caso que estava quebrado: anexo do computador tem de virar <img>.
  {
    const h = dirFigurasHTML([{ titulo: 'Regulação do Apetite', url: DATA_JPEG, fonte: 'Crédito da imagem' }]);
    ok(/<img/.test(h),
       'REGRESSÃO: imagem ANEXADA (data:) não foi desenhada — o professor anexa e o capítulo fica vazio');
    ok(h.indexOf(DATA_JPEG) >= 0, 'o src tem de ser a própria imagem anexada');
  }

  // 2) O caminho de sempre (URL externa) continua funcionando.
  ok(/<img/.test(dirFigurasHTML([{ url: 'https://exemplo.org/f.png' }])),
     'figura por URL http(s) continua desenhando');

  // 3) O CRÉDITO fica ABAIXO da imagem — pedido explícito do professor.
  {
    const h = dirFigurasHTML([{ titulo: 'T', url: DATA_JPEG, fonte: 'Apovian CM et al. 3rd ed; 2025, p. 27.' }]);
    const iImg = h.indexOf('<img');
    const iCap = h.indexOf('figcaption');
    ok(iImg >= 0 && iCap > iImg,
       'o crédito tem de vir DEPOIS da imagem (figcaption abaixo), não antes');
    ok(h.indexOf('p. 27.') >= 0, 'o texto do crédito tem de sair na tela');
  }

  // 4) ⚠️ SEGURANÇA: afrouxar isso no validador de LINK abriria data:text/html.
  ok(safeHttpUrl(DATA_JPEG) === false,
     'safeHttpUrl (usado em href de link) NÃO pode passar a aceitar data:');
  ok(safeImgSrc('data:text/html;base64,PHNjcmlwdD4=') === false,
     'safeImgSrc só aceita imagem rasterizada — data:text/html não pode passar');
  ok(safeImgSrc('data:image/svg+xml;base64,PHN2Zz4=') === false,
     'svg+xml carrega script: fica fora do src permitido');
  ok(safeImgSrc('javascript:alert(1)') === false, 'javascript: não pode passar');
  ok(safeImgSrc('data:image/png;base64,iVBORw0KGgo=') === true, 'PNG anexado é válido');

  // 5) Figura sem mídia nenhuma não pode virar <figure> vazio.
  ok(dirFigurasHTML([{ titulo: 'só título' }]).indexOf('<figure') < 0,
     'figura sem url nem svg não vira moldura vazia');
}

if (falhas.length) {
  console.error('✗ figura anexada no capítulo:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ figura anexada: data: de imagem desenha, crédito sai abaixo, e o validador de href segue recusando data:');
