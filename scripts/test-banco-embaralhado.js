// Regressão: o Banco de questões sai embaralhado a cada "Estudar".
// Professor, 28/11/2026, com print da "Questão 23 de 250" de Neuroendocrinologia: "no banco de questões, as questões
// de cada uma delas estão vindo em sequência, ao invés de vir embaralhadas. Embaralhar também no aplicativo".
// A lista saía na ordem em que as questões foram gravadas, e os lotes entram por tema (um tema inteiro, depois o
// outro). O app do iPhone carrega este mesmo index.html, então vale para os dois.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let n = 0;
  for (let k = html.indexOf('{', i); k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i + 1, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

const ctx = vm.createContext({ Math });
vm.runInContext(corpo('bancoEmbaralha'), ctx);
const embaralha = ctx.bancoEmbaralha;

// 250 questões agrupadas por tema, como no banco (10 temas × 25, em sequência).
const banco = [];
for (let t = 0; t < 10; t++) for (let k = 0; k < 25; k++) banco.push({ code: 'Q' + (t * 25 + k), tema: 'T' + t });
const copia = banco.map((q) => q.code).join(',');

const saida = embaralha(banco);
ok(Array.isArray(saida) && saida.length === banco.length, 'devolve a mesma quantidade de questões');
ok(saida.map((q) => q.code).sort().join(',') === banco.map((q) => q.code).sort().join(','), 'é uma permutação: nenhuma questão some nem repete');
ok(banco.map((q) => q.code).join(',') === copia, 'não mexe na ordem do banco guardado (embaralha uma cópia)');
ok(saida !== banco, 'devolve uma lista nova');

// Em sequência, 240 dos 249 vizinhos são do mesmo tema; embaralhado, perto de 10%.
function mesmoTemaSeguido(l) { let n = 0; for (let i = 1; i < l.length; i++) if (l[i].tema === l[i - 1].tema) n++; return n; }
let pior = 0, iguais = 0;
for (let r = 0; r < 50; r++) {
  const s = embaralha(banco);
  pior = Math.max(pior, mesmoTemaSeguido(s));
  if (s.map((q) => q.code).join(',') === copia) iguais++;
}
ok(mesmoTemaSeguido(banco) === 240, 'controle: o banco de teste está agrupado por tema');
ok(pior < 60, 'embaralhado, os temas se misturam (pior caso em 50 rodadas: ' + pior + ' vizinhos do mesmo tema de 249)');
ok(iguais === 0, 'nenhuma rodada devolve a ordem original');
ok(embaralha([]).length === 0 && embaralha(null).length === 0, 'lista vazia ou ausente não quebra');

// O "Estudar" usa o embaralhamento (e é o único caminho que abre o Banco).
ok(/renderProvaResults\(bancoEmbaralha\(qs\)\)/.test(html), 'o botão "Estudar" deve embaralhar antes de abrir as questões');
ok((html.match(/renderProvaResults\(/g) || []).length === 2, 'renderProvaResults só é chamado pelo "Estudar" (1 definição + 1 chamada)');

if (falhas.length) {
  console.error('test-banco-embaralhado: ' + falhas.length + ' falha(s)\n- ' + falhas.join('\n- '));
  process.exit(1);
}
console.log('test-banco-embaralhado: ok (Banco embaralhado a cada "Estudar"; pior caso ' + pior + ' de 249 vizinhos do mesmo tema)');
