// Regressão: o botão "H" (título) não pode DESTRUIR o conteúdo.
//
// ⚠️ O CASO REAL (11/08). O professor editou "Comorbidades e Gestação" e o capítulo
// saiu todo em negrito, com as frases coladas. O diff contra o backup mostrou o que
// tinha acontecido: os QUATRO itens da lista viraram UMA linha começando com `## `.
// Ele selecionou a lista e clicou em "H".
//
// A culpa NÃO é do nosso serializador — o `htmlToMd` gravou fielmente o `<h3>` único
// que o navegador criou. `document.execCommand('formatBlock')` sobre uma seleção que
// abrange mais de um bloco FUNDE todos num só. Reproduzido em Chromium:
//     lista de 3 itens → "## Item um.Item dois.Item três."   (3 blocos → 1)
//     3 parágrafos     → "## Um. Dois. Três."                (3 blocos → 1)
//     1 parágrafo      → vira título normalmente             (uso legítimo)
//
// Não dá para consertar o formatBlock; dá para não deixá-lo rodar onde ele destrói.
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
const dom = new JSDOM('<body><div id="ed"></div></body>', { url: 'https://x/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
vm.runInContext(corpo('wysBlocoDe') + '\n' + corpo('wysSelecaoNumBlocoSo'), ctx);
const podeRodar = vm.runInContext('wysSelecaoNumBlocoSo', ctx);
const doc = dom.window.document;
const ed = doc.getElementById('ed');

function selecionar(de, ate) {
  const r = doc.createRange();
  r.setStart(de, 0);
  r.setEnd(ate, ate.childNodes.length);
  const s = dom.window.getSelection();
  s.removeAllRanges(); s.addRange(r);
}

// 1) ⚠️ O CASO QUE DESTRUIU: seleção abrangendo a lista inteira.
ed.innerHTML = '<p>Antes.</p><ul><li>Item um.</li><li>Item dois.</li><li>Item três.</li></ul>';
const lis = ed.querySelectorAll('li');
selecionar(lis[0], lis[lis.length - 1]);
ok(podeRodar(ed) === false,
   'REGRESSÃO: seleção que abrange a LISTA inteira tem de ser recusada — foi assim que 4 itens viraram um título só');

// 2) Vários parágrafos funde igual — também recusado.
ed.innerHTML = '<p>Um.</p><p>Dois.</p><p>Três.</p>';
const ps = ed.querySelectorAll('p');
selecionar(ps[0], ps[ps.length - 1]);
ok(podeRodar(ed) === false, 'seleção com vários parágrafos também tem de ser recusada');

// 3) ⚠️ O USO LEGÍTIMO NÃO PODE SER BLOQUEADO: uma linha só vira título.
ed.innerHTML = '<p>Um.</p><p>Dois.</p><p>Três.</p>';
selecionar(ed.querySelectorAll('p')[1], ed.querySelectorAll('p')[1]);
ok(podeRodar(ed) === true, 'seleção dentro de UM parágrafo tem de continuar permitida');

// 4) Um item de lista sozinho também é um bloco só.
ed.innerHTML = '<ul><li>Item um.</li><li>Item dois.</li></ul>';
selecionar(ed.querySelectorAll('li')[0], ed.querySelectorAll('li')[0]);
ok(podeRodar(ed) === true, 'um item de lista sozinho é um bloco só — permitido');

// 5) Sem seleção (só o cursor) não pode travar o botão.
dom.window.getSelection().removeAllRanges();
ok(podeRodar(ed) === true, 'sem seleção o botão tem de funcionar (o cursor está num bloco só)');

// 6) Seleção colapsada (clique simples) idem.
{
  const r = doc.createRange();
  const li = ed.querySelector('li');
  r.setStart(li, 0); r.collapse(true);
  const s = dom.window.getSelection(); s.removeAllRanges(); s.addRange(r);
  ok(podeRodar(ed) === true, 'clique simples (seleção colapsada) não pode ser tratado como multibloco');
}

// 7) Texto solto no editor, sem bloco identificável: não atrapalhar.
ed.innerHTML = 'texto sem bloco nenhum';
{
  const r = doc.createRange();
  r.selectNodeContents(ed);
  const s = dom.window.getSelection(); s.removeAllRanges(); s.addRange(r);
  ok(podeRodar(ed) === true, 'sem bloco identificável, o botão não pode ser bloqueado por precaução');
}

// ── Ligações: a guarda tem de estar nos DOIS editores, e no `p` também ──────────
const usos = (html.match(/wysSelecaoNumBlocoSo\(ed\)/g) || []).length;
ok(usos >= 2, 'a guarda tem de estar nos dois editores (resumo e mural) — achei ' + usos);
ok(/cmd==='h'\|\|cmd==='p'/.test(html),
   'o "P" usa o mesmo formatBlock e funde igual: tem de estar sob a mesma guarda');
ok(!/else if\(cmd==='h'\)document\.execCommand\('formatBlock'/.test(html),
   'não pode sobrar caminho que chame formatBlock sem a guarda');
ok(/Selecione UMA linha só/.test(html),
   'ao recusar, tem de dizer o que fazer — recusar em silêncio parece botão quebrado');

if (falhas.length) {
  console.error('✗ título fundindo blocos:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ título: recusa a seleção multibloco que fundia listas e parágrafos, e mantém o uso de uma linha');
