// Regressão: clicar na figura do resumo AMPLIA — e no editor NÃO.
//
// O professor pediu "quando clicar ampliar a foto". O ampliador já existia para o
// mural; reusá-lo evita duas telas com a mesma função e comportamentos diferentes.
//
// ⚠️ A ARMADILHA: o editor do resumo tem `class="wys-edit dir-texto"` — as DUAS
// classes. Uma condição por `.dir-texto` sozinha pegaria o editor, e lá o clique na
// imagem é o que a SELECIONA para os botões P/M/G e para o de legenda. Abrir o
// ampliador ali tiraria do professor o único jeito de redimensionar a figura.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', function () {});
const dom = new JSDOM('<body></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(corpo('ensureLightbox'), ctx);
vm.runInContext('ensureLightbox();', ctx);

const doc = dom.window.document;
const ov = doc.getElementById('img-lightbox');
ok(!!ov, 'o ampliador tem de ser criado no documento');

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
function clica(imgHTML, wrapper) {
  if (ov) { ov.style.display = 'none'; ov.firstChild.src = ''; }
  const box = doc.createElement('div');
  box.innerHTML = wrapper.replace('@@', imgHTML);
  doc.body.appendChild(box);
  const img = box.querySelector('img');
  Object.defineProperty(img, 'src', { value: PNG, configurable: true });
  img.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const aberto = ov && ov.style.display === 'flex';
  box.remove();
  return aberto;
}

const IMG = '<img class="wys-img" alt="">';

if (ov) {
  // 1) Na LEITURA do aluno: amplia.
  ok(clica(IMG, '<div class="dir-texto">@@</div>'),
     'clicar na figura do corpo do resumo tem de ampliar');
  ok(clica('<img alt="">', '<figure class="dir-fig">@@</figure>'),
     'clicar na figura do capítulo tem de ampliar');
  ok(clica('<img class="mural-inline-img" alt="">', '<div>@@</div>'),
     'o mural continua ampliando (não pode ter regredido)');

  // 2) ⚠️ No EDITOR: NÃO amplia. O editor carrega as duas classes.
  ok(!clica(IMG, '<div class="wys-edit dir-texto">@@</div>'),
     'REGRESSÃO: no editor o clique SELECIONA a imagem — ampliar aqui tira o P/M/G do professor');
  ok(!clica(IMG, '<div class="wys-edit dir-texto"><figure class="wys-fig">@@</figure></div>'),
     'nem dentro de <figure> no editor');

  // 3) Imagem fora dessas áreas não vira ampliador por engano.
  ok(!clica('<img alt="">', '<div class="adm-qualquer">@@</div>'),
     'imagem fora do mural e dos resumos não abre o ampliador');

  // 4) Fecha ao clicar (é assim que o aluno sai).
  clica(IMG, '<div class="dir-texto">@@</div>');
  ov.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  ok(ov.style.display === 'none', 'clicar no overlay tem de fechar');
}

// 5) A tela de Resumos precisa CRIAR o ampliador — quem entra direto em Resumos
//    sem passar pelo mural não teria overlay nenhum.
ok(/function bindDiretrizesView\(root\)\{[\s\S]{0,400}?ensureLightbox\(\)/.test(html),
   'bindDiretrizesView tem de garantir o ampliador, senão só funciona depois de abrir o mural');
// 6) A lupa no cursor anuncia que dá para clicar — menos no editor.
ok(/\.dir-texto \.wys-img,\.dir-fig img\{cursor:zoom-in\}/.test(html),
   'a figura do resumo precisa do cursor de lupa');
ok(/\.wys-edit \.wys-img\{cursor:default\}/.test(html),
   'no editor o cursor NÃO pode ser de lupa: lá o clique seleciona, não amplia');

if (falhas.length) {
  console.error('✗ ampliar figura:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ ampliar figura: amplia na leitura (resumo e mural) e nunca no editor');
