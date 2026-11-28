// Regressão: o aluno vê só a instituição da questão. O código (ENDODIRECT-…, USPR3ENDOCRINOLOGIA-…) e a dificuldade
// (F/M/D) ficam só no painel do professor. Professor, 28/11/2026, com prints do "Estudar": "Retirar o código da questão
// do painel dos alunos, deixar mostrando somente no painel do professor" e "Retire essa letra, no caso D, também do
// painel do aluno. Do aluno mostra só a instituição mesmo."
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

const ctx = vm.createContext({
  Object, String,
  esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  feitaSeloHTML: () => '<span></span>',
  igShortRef: (s) => s,
});
vm.runInContext([corpo('diffTag'), corpo('qRowHTML'), corpo('qFullHTML')].join('\n'), ctx);

const q = { code: 'USPR3ENDOCRINOLOGIA-2025-9', inst: 'USP-R3 Endocrinologia', dificuldade: 'avancado',
  stem: 'Homem, 26 anos, com espessamento de tendões de Aquiles.', options: { A: 'um', B: 'dois', C: 'três', D: 'quatro' }, answer: 'C', explanation: 'x' };
for (const dif of ['avancado', 'intermediario', 'basico', undefined]) {
  q.dificuldade = dif;
  const full = ctx.qFullHTML(q, 0, 'gen', true);
  const row = ctx.qRowHTML(q, 0, 'gen', true);
  ok(full.indexOf(q.code) < 0 && row.indexOf(q.code) < 0, 'o código da questão aparece para o aluno (Estudar ou lista)');
  ok(!/class="tag tag-(grn|blue|red)"/.test(full) && !/class="tag tag-(grn|blue|red)"/.test(row),
    'a dificuldade (' + dif + ') aparece para o aluno (Estudar ou lista)');
  ok(full.indexOf('USP-R3 Endocrinologia') >= 0 && row.indexOf('USP-R3 Endocrinologia') >= 0, 'a instituição deve continuar aparecendo para o aluno');
}

// Em todo o index.html, código e dificuldade só são desenhados nas funções do painel do professor (admProva*).
function soNoPainel(re, nome) {
  const usos = [];
  html.split('\n').forEach((l, i) => { if (re.test(l) && !/^function diffTag\(/.test(l)) usos.push({ n: i + 1, l }); });
  ok(usos.length > 0 && usos.every((u) => /function admProva(Card|Edit)HTML\(/.test(u.l)),
    nome + ' desenhado fora do painel do professor nas linhas ' + usos.filter((u) => !/function admProva/.test(u.l)).map((u) => u.n).join(', '));
}
soNoPainel(/esc\(\w+\.code\)/, 'código da questão');
soNoPainel(/diffTag\(/, 'dificuldade');
ok(/function admProvaCardHTML\([^)]*\)\{[\s\S]*?esc\(q\.code\)/.test(html), 'o painel do professor deve continuar mostrando o código');

if (falhas.length) { console.error('test-codigo-so-professor: ' + falhas.length + ' falha(s)\n - ' + [...new Set(falhas)].join('\n - ')); process.exit(1); }
console.log('test-codigo-so-professor: ok (aluno vê só a instituição; código e dificuldade só no painel do professor)');
