// Regressão: reordenar a FILA da Questão do Dia por ARRASTE (pedido do professor,
// 11/08 — "ao invés da seta para cima e para baixo, deixa a opção de pressionar e
// rolar"). As setas ↑/↓ saíram; a alça ⠿ entrou.
//
// ⚠️ O QUE NÃO PODE QUEBRAR: `igStories` guarda POSTADAS e NÃO POSTADAS no mesmo
// array, e a fila mostra só as não postadas. Reordenar tem de escrever apenas nas
// posições que as não postadas já ocupavam — senão a postagem de ontem "anda" no
// histórico, que é perda silenciosa de ordem.
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

const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM('<body></body>', { url: 'https://x/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext('var igStories=[];' + corpo('igAplicarOrdemFila'), ctx);
const set = (arr) => { ctx.igStories = arr; };
const aplicar = (o) => vm.runInContext('igAplicarOrdemFila', ctx)(o);
const temas = () => ctx.igStories.map((x) => x.t + (x.status === 'posted' ? '*' : ''));

// 1) Reordenar a fila move só as não postadas.
set([{ t: 'A' }, { t: 'B' }, { t: 'C' }]);
ok(aplicar([2, 0, 1]) === true, 'reordenação simples tem de ser aceita');
ok(JSON.stringify(temas()) === JSON.stringify(['C', 'A', 'B']),
   'a fila tem de ficar na ordem arrastada (veio ' + JSON.stringify(temas()) + ')');

// 2) ⚠️ AS POSTADAS FICAM ONDE ESTÃO. Aqui a postada está no MEIO do array.
set([{ t: 'A' }, { t: 'P', status: 'posted' }, { t: 'B' }, { t: 'C' }]);
ok(aplicar([3, 0, 2]) === true, 'reordenação com postada no meio tem de ser aceita');
ok(JSON.stringify(temas()) === JSON.stringify(['C', 'P*', 'A', 'B']),
   'REGRESSÃO: a postada tem de ficar na posição dela (veio ' + JSON.stringify(temas()) + ')');

// 3) Recusa quando a contagem não bate — melhor não gravar do que gravar errado.
set([{ t: 'A' }, { t: 'B' }, { t: 'C' }]);
const antes = JSON.stringify(temas());
ok(aplicar([0, 1]) === false, 'ordem incompleta tem de ser RECUSADA');
ok(aplicar([0, 1, 2, 2]) === false, 'ordem com item a mais tem de ser recusada');
ok(aplicar(null) === false && aplicar('x') === false, 'entrada inválida não pode quebrar');
ok(JSON.stringify(temas()) === antes, 'ao recusar, NADA pode ter sido alterado');

// 4) Índice apontando para uma POSTADA é recusado (a fila não a contém).
set([{ t: 'A' }, { t: 'P', status: 'posted' }, { t: 'B' }]);
ok(aplicar([1, 0]) === false, 'índice de questão postada não pode entrar na ordem da fila');

// 5) Fila vazia não quebra.
set([{ t: 'P', status: 'posted' }]);
ok(aplicar([]) === true && temas()[0] === 'P*', 'fila vazia é caso válido e inerte');

// ── Ligações no index.html ────────────────────────────────────────────────────
ok(!/data-ig-up=/.test(html) && !/data-ig-down=/.test(html),
   'as setas ↑/↓ da fila têm de ter saído — foi o pedido');
ok(/data-ig-drag=/.test(html), 'a fila precisa da alça de arraste');
ok(/id="ig-fila-lista"/.test(html), 'a fila precisa de um contêiner próprio para o arraste');
ok(/data-ig-idx=/.test(html), 'cada card precisa carregar o índice real em igStories');
ok(/function bindIgFilaDrag/.test(html) && /bindIgFilaDrag\(main\)/.test(html),
   'o arraste tem de estar ligado ao renderizar a tela');
// ⚠️ Pointer Events, não drag-and-drop do HTML5: o professor usa iPhone.
ok(/bindIgFilaDrag[\s\S]{0,2600}pointerdown/.test(html),
   'tem de usar Pointer Events (o drag nativo do HTML5 não funciona em toque)');
// ⚠️ Ouvintes no DOCUMENTO e sem setPointerCapture — o insertBefore reanexa o card
//    e liberaria a captura, cortando o arraste no meio.
ok(/bindIgFilaDrag[\s\S]{0,2600}document\.addEventListener\('pointermove'/.test(html),
   'o pointermove tem de ficar no document, não na alça');
ok(!/bindIgFilaDrag[\s\S]{0,2600}setPointerCapture/.test(html),
   'não pode usar setPointerCapture: o insertBefore libera a captura e corta o arraste');
// ⚠️ Sem touch-action:none o navegador ROLA a página em vez de arrastar no toque.
ok(/\.ig-drag\{[^}]*touch-action:none/.test(html),
   'a alça precisa de touch-action:none, senão no toque a página rola em vez de arrastar');
// A dica de uso não pode continuar mandando usar as setas.
ok(/alça ⠿ e arraste/.test(html) && !/Use <b>↑ \/ ↓<\/b> para reordenar/.test(html),
   'o texto de ajuda da fila tem de falar do arraste, não das setas');

if (falhas.length) {
  console.error('✗ arrastar a fila:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ fila por arraste: reordena as não postadas, não move as postadas e recusa ordem inconsistente');
