// A TABELA DO ARTIGO CHEGA ALINHADA À DISCUSSÃO.
//
// ⚠️ 14/10/2026. O Eduardo mandou um vídeo do mural: numa revisão de disruptores
// tireoidianos, três tabelas apareciam como texto cru, cheio de barras, e nas
// outras as linhas que continuavam uma célula mesclada saíam deslocadas uma
// coluna para a esquerda, com o número de referência na coluna do nome da
// substância. Duas causas no `tableToMarkdown` (lib/fulltext.js):
//   - o rowspan era ignorado: a linha de baixo não reservava a coluna ocupada;
//   - o `<thead>` de duas linhas virava cabeçalho com a linha de CIMA, que era
//     um rótulo de largura total (uma célula preenchida e o resto vazio), e o
//     mural não reconhece cabeçalho assim como tabela.
//
// 🧨 O QUE ESTE TESTE PRENDE (tabelas sintéticas, nenhuma de artigo):
// (1) rowspan no corpo reserva a coluna e repete o texto; (2) rowspan na última
// coluna também; (3) rótulo de largura total no `<thead>` desce para o corpo e
// os nomes das colunas viram o cabeçalho; (4) cabeçalho em duas linhas se junta
// coluna a coluna, com o grupo do colspan em cada coluna dele; (5) sem
// `<thead>`, a primeira linha é o cabeçalho e a linha de agrupamento do corpo
// fica como era; (6) cabeçalho de uma linha com colspan continua como antes;
// (7) todas as linhas saem com o mesmo número de colunas.
'use strict';
const { tableToMarkdown } = require('../lib/fulltext');

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { console.error('test-tabela-do-artigo-alinhada: o teste parou no meio'); process.exitCode = 1; }
});

const linhas = (md) => String(md || '').split('\n');
const colunas = (l) => l.replace(/\\\|/g, '').split('|').length - 2;
const tem = (md, l) => linhas(md).indexOf(l) >= 0;

// (1) rowspan no corpo, na primeira coluna.
const t1 = tableToMarkdown('<table><thead><tr><th>Substância</th><th>Código</th><th>Duração</th></tr></thead><tbody>'
  + '<tr><td rowspan="2">Composto A</td><td>11</td><td>7 d</td></tr>'
  + '<tr><td>12</td><td>21 d</td></tr>'
  + '<tr><td>Composto B</td><td>13</td><td>14 d</td></tr></tbody></table>');
ok(tem(t1, '| Composto A | 11 | 7 d |'), '(1) primeira linha do rowspan: ' + t1);
ok(tem(t1, '| Composto A | 12 | 21 d |'), '(1) a linha de baixo reserva a coluna e repete o nome: ' + t1);
ok(!/\| 12 \| 21 d \|\s*\|$/m.test(t1), '(1) nada desliza para a esquerda com célula vazia no fim');
ok(tem(t1, '| Composto B | 13 | 14 d |'), '(1) a linha seguinte ao rowspan fica normal');

// (2) rowspan na última coluna: a reserva vem DEPOIS da última célula da linha.
const t2 = tableToMarkdown('<table><thead><tr><th>Grupo</th><th>n</th><th>Nota</th></tr></thead><tbody>'
  + '<tr><td>X</td><td>1</td><td rowspan="2">mesma nota</td></tr>'
  + '<tr><td>Y</td><td>2</td></tr></tbody></table>');
ok(tem(t2, '| Y | 2 | mesma nota |'), '(2) rowspan na última coluna chega à linha de baixo: ' + t2);

// (3) Rótulo de largura total no <thead>, em cima dos nomes das colunas.
const t3 = tableToMarkdown('<table><thead>'
  + '<tr><th colspan="3">Padrão A</th></tr>'
  + '<tr><th>Substância</th><th>Código</th><th>Dose</th></tr></thead><tbody>'
  + '<tr><td>Composto C</td><td>21</td><td>5 - 10</td></tr></tbody></table>');
ok(linhas(t3)[0] === '| Substância | Código | Dose |', '(3) os nomes das colunas viram o cabeçalho: ' + linhas(t3)[0]);
ok(linhas(t3)[2] === '| Padrão A |  |  |', '(3) o rótulo desce para o topo do corpo como linha de agrupamento: ' + linhas(t3)[2]);
ok(tem(t3, '| Composto C | 21 | 5 - 10 |'), '(3) os dados seguem abaixo do rótulo');

// (4) Cabeçalho em duas linhas, com grupos em colspan e uma célula em rowspan.
const t4 = tableToMarkdown('<table><thead>'
  + '<tr><th rowspan="2">Desfecho</th><th colspan="2">Homens</th><th colspan="2">Mulheres</th></tr>'
  + '<tr><th>n</th><th>%</th><th>n</th><th>%</th></tr></thead><tbody>'
  + '<tr><td>Fratura</td><td>4</td><td>10</td><td>6</td><td>12</td></tr></tbody></table>');
ok(linhas(t4)[0] === '| Desfecho | Homens · n | Homens · % | Mulheres · n | Mulheres · % |', '(4) cabeçalho juntado coluna a coluna: ' + linhas(t4)[0]);
ok(tem(t4, '| Fratura | 4 | 10 | 6 | 12 |'), '(4) os dados ficam embaixo do grupo certo');

// (5) Sem <thead>: a primeira linha é o cabeçalho; agrupamento do corpo intacto.
const t5 = tableToMarkdown('<table><tbody>'
  + '<tr><td>Item</td><td>Valor</td><td>Unidade</td></tr>'
  + '<tr><td colspan="3">Seção 1</td></tr>'
  + '<tr><td>Glicose</td><td>90</td><td>mg/dL</td></tr></tbody></table>');
ok(linhas(t5)[0] === '| Item | Valor | Unidade |', '(5) sem thead, a primeira linha é o cabeçalho: ' + linhas(t5)[0]);
ok(tem(t5, '| Seção 1 |  |  |'), '(5) linha de agrupamento do corpo continua com uma célula preenchida');

// (6) Cabeçalho de UMA linha com colspan: como antes, o texto só na 1ª coluna.
const t6 = tableToMarkdown('<table><thead><tr><th>Exame</th><th colspan="2">Resultado</th></tr></thead><tbody>'
  + '<tr><td>TSH</td><td>2,1</td><td>mUI/L</td></tr></tbody></table>');
ok(linhas(t6)[0] === '| Exame | Resultado |  |', '(6) cabeçalho de uma linha não repete o colspan: ' + linhas(t6)[0]);

// (7) Todas as linhas com o mesmo número de colunas, em todas as tabelas acima.
[t1, t2, t3, t4, t5, t6].forEach((md, i) => {
  const ns = new Set(linhas(md).map(colunas));
  ok(ns.size === 1, '(7) tabela ' + (i + 1) + ' tem linhas com número de colunas diferente: ' + [...ns].join(','));
});

terminou = true;
if (falhas.length) {
  console.error('test-tabela-do-artigo-alinhada: ' + falhas.length + ' falha(s)');
  falhas.forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
console.log('test-tabela-do-artigo-alinhada: ok (rowspan reserva a coluna; rótulo do thead desce para o corpo; cabeçalho em duas linhas se junta; sem thead e colspan simples como antes)');
