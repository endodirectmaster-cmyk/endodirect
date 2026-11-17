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

// 7) Zoom com pinça (17/11/2026; antes, 16/10, o SVG largo abria no tamanho natural com
//    rolagem, sem como afastar). Agora toda figura abre INTEIRA e centralizada ("Ajustar");
//    pinça/roda/botões aproximam e afastam em torno do ponto; afastar além do ajuste volta
//    ao ajuste, centralizado.
function abreComo(src, naturalWidth, largTela, naturalHeight) {
  Object.defineProperty(dom.window, 'innerWidth', { value: largTela, configurable: true });
  Object.defineProperty(dom.window, 'innerHeight', { value: 844, configurable: true });
  ov.style.display = 'none'; ov.firstChild.src = '';
  const box = doc.createElement('div');
  box.innerHTML = '<figure class="dir-fig"><img alt=""></figure>';
  doc.body.appendChild(box);
  const img = box.querySelector('img');
  Object.defineProperty(img, 'src', { value: src, configurable: true });
  Object.defineProperty(img, 'naturalWidth', { value: naturalWidth, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: naturalHeight || Math.round(naturalWidth * 1.2), configurable: true });
  img.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const im = ov.firstChild;
  const st = ov.__lb ? ov.__lb.estado() : {};
  const r = { aberto: ov.style.display === 'flex', largura: im.style.width, s: st.s, ajuste: st.ajuste, maxS: st.maxS, tx: st.tx, ty: st.ty, transf: im.style.transform };
  box.remove();
  return r;
}
if (ov) {
  ok(ov.__lb && typeof ov.__lb.zoomEm === 'function', 'o ampliador não expõe o estado do zoom');
  const SVG = 'https://www.endodirect.com.br/figuras/resumos/adrenal--feocromocitoma-e-paraganglioma.svg';
  // celular: área = 390−40 de largura; o esquema de 873 px abre inteiro (escala < 1) e centralizado
  let r = abreComo(SVG, 873, 390, 1000);
  const aW = 390 - 40, aH = 844 - 56 - 76;
  const fit = Math.min(aW / 873, aH / 1000);
  ok(r.aberto && r.largura === '873px' && Math.abs(r.s - fit) < 1e-6 && Math.abs(r.ajuste - fit) < 1e-6,
     'no celular, o esquema SVG tem de abrir inteiro, ajustado à tela: ' + JSON.stringify(r));
  ok(Math.abs(r.tx - (20 + (aW - 873 * fit) / 2)) < 0.5 && Math.abs(r.ty - (56 + (aH - 1000 * fit) / 2)) < 0.5,
     'a figura ajustada tem de ficar centralizada: ' + JSON.stringify(r));
  ok(/scale\(/.test(r.transf) && ov.style.overflow === 'hidden' && ov.style.touchAction === 'none', 'o zoom é por transform, com a página atrás sem rolar: ' + JSON.stringify(r));
  // reabre e amplia: pinça para 3×, depois afasta além do ajuste → volta ao ajuste, centralizado
  abreComo(SVG, 873, 390, 1000);
  ov.style.display = 'flex';
  const a0 = ov.__lb.estado();
  ov.__lb.zoomEm(a0.s * 3, 195, 400);
  const a1 = ov.__lb.estado();
  ok(a1.s > a0.s * 2.9 && a1.tx <= 20 && a1.tx >= 20 + aW - 873 * a1.s, 'ampliar 3× em torno do dedo, sem sobrar borda: ' + JSON.stringify(a1));
  ov.__lb.zoomEm(a1.s * 0.05, 195, 400);
  const a2 = ov.__lb.estado();
  ok(Math.abs(a2.s - a0.s) < 1e-6 && Math.abs(a2.tx - a0.tx) < 0.5 && Math.abs(a2.ty - a0.ty) < 0.5,
     'afastar além do ajuste tem de voltar ao ajuste, centralizado (pedido do professor): ' + JSON.stringify(a2));
  ov.__lb.alterna(195, 400);
  const a3 = ov.__lb.estado();
  ok(a3.s >= 1 - 1e-6, 'toque duplo no esquema ajustado amplia até o tamanho natural, legível: ' + JSON.stringify(a3));
  ov.__lb.alterna(195, 400);
  ok(Math.abs(ov.__lb.estado().s - a0.s) < 1e-6, 'toque duplo de novo volta ao ajuste');
  ok(a1.maxS >= 3, 'o esquema vetorial amplia até pelo menos 3× o tamanho natural');
  // foto grande: cabe na tela; foto pequena: não estica além do tamanho real
  r = abreComo(PNG, 2000, 390, 1500);
  ok(r.aberto && r.s <= Math.min(aW / 2000, aH / 1500) + 1e-6, 'foto continua cabendo na tela: ' + JSON.stringify(r));
  r = abreComo(PNG, 120, 390, 90);
  ok(r.aberto && Math.abs(r.s - 1) < 1e-6, 'foto pequena abre no tamanho real, sem esticar: ' + JSON.stringify(r));
  r = abreComo(SVG, 873, 1280, 1000);
  ok(r.aberto && r.s <= 1 + 1e-6 && Math.abs(r.s - Math.min((1280 - 40) / 873, aH / 1000)) < 1e-6, 'no notebook o esquema também abre ajustado: ' + JSON.stringify(r));
  // tocar na figura não fecha (é onde se faz o zoom); o fundo e o ✕ fecham
  abreComo(SVG, 873, 390, 1000); ov.style.display = 'flex';
  ov.firstChild.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  ok(ov.style.display === 'flex', 'tocar na própria figura não pode fechar o ampliador');
  const bAj = ov.querySelector('[data-lb="ajustar"]'), bMais = ov.querySelector('[data-lb="mais"]'), bMenos = ov.querySelector('[data-lb="menos"]');
  ok(bAj && bMais && bMenos, 'faltam os botões −, Ajustar e + do ampliador');
  if (bMais) { const s0 = ov.__lb.estado().s; bMais.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); ok(ov.__lb.estado().s > s0 && ov.style.display === 'flex', 'o botão + aproxima e não fecha'); }
  if (bAj) { bAj.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); ok(Math.abs(ov.__lb.estado().s - ov.__lb.estado().ajuste) < 1e-6, 'o botão Ajustar volta à figura inteira'); }
  ok(/addEventListener\('touchmove',function\(e\)\{[\s\S]{0,120}?e\.preventDefault\(\)/.test(html) && /\['gesturestart','gesturechange'\]\.forEach\(function\(n\)\{ov\.addEventListener/.test(html),
     'a pinça tem de ser tratada pelo ampliador (touchmove sem rolar a página; gesture* do Safari bloqueado)');
  const botao = ov.querySelector('button');
  ok(botao && botao.style.position === 'fixed', 'o botão de fechar fica fixo na tela mesmo com a figura rolando');
  // iPhone: o ✕ ficava embaixo do relógio/bateria e não dava para tocar (11/11/2026).
  ok(/position:fixed;top:calc\(env\(safe-area-inset-top,0px\) \+ 10px\);right:calc\(env\(safe-area-inset-right,0px\) \+ 14px\);width:44px;height:44px;/.test(html),
     '🧨 o botão de fechar desce abaixo da barra de status do iPhone (safe area) e tem 44 px para o dedo');
  ok(/id='img-lightbox';[\s\S]{0,400}?padding:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 56px\)\)/.test(html),
     'a figura começa abaixo do botão de fechar e da barra de status (margem com safe area)');
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
