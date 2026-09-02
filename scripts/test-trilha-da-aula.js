// A ABA DE QUESTÕES NÃO PODE MENTIR SOBRE A ORIGEM DAS QUESTÕES.
//
// 🧨 POR QUE ESTE TESTE EXISTE (02/09/2026). O professor abriu a trilha da aula
// sobre perda de massa magra em terapia incretínica e recebeu questões de
// cirurgia bariátrica na gestação e de teste genético em criança com obesidade.
// Escreveu: *"as questões não têm nada a ver com o tema da aula"*.
//
// As questões não eram inventadas — eram do BANCO, sorteadas pela ÁREA da aula
// (`modulo` = "Obesidade") e embaralhadas. O empréstimo é útil: a alternativa
// seria tela vazia em 105 das 106 aulas. O defeito é o RÓTULO: as duas telas
// chamavam isso de "questões da trilha" / "questões sobre <área>", sem dizer
// que eram emprestadas. Quem lê acredita que são da aula.
//
// A REGRA: questão própria (`aulaQ`) e questão emprestada do banco se anunciam
// de formas diferentes, nas duas telas — a do aluno e a de revisão do professor.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}
const caixa = { console };
vm.createContext(caixa);
vm.runInContext([corpo('aulaQProprias'), corpo('aulaQuestions')].join('\n'), caixa);

const Q = (n) => Array.from({ length: n }, (_, i) => ({ stem: 'q' + i, options: { A: 'a', B: 'b' }, answer: 'A' }));

// ── 1. Quem é própria e quem é emprestada ────────────────────────────────
{
  ok(caixa.aulaQProprias({ aulaQ: Q(8) }) === true, '🧨 aula COM questões próprias foi tratada como emprestada');
  ok(caixa.aulaQProprias({ modulo: 'Obesidade' }) === false, '🧨 aula SEM `aulaQ` foi tratada como se tivesse questões próprias');
  ok(caixa.aulaQProprias({ aulaQ: [] }) === false, '⚠️ `aulaQ` vazio contou como questões próprias');
  // Item malformado não conta: `aulaQuestions` o descarta, e contar aqui faria
  // a tela prometer questão própria e mostrar as do banco.
  ok(caixa.aulaQProprias({ aulaQ: [{ stem: 'só o enunciado' }] }) === false,
    '🧨 questão sem alternativas/gabarito contou como própria — o rótulo diria "desta aula" e o conteúdo viria do banco');
  ok(caixa.aulaQProprias(null) === false && caixa.aulaQProprias(undefined) === false, '⚠️ aula ausente quebrou a checagem');
}

// ── 2. A própria tem precedência, e o teto de 8 continua ─────────────────
{
  caixa.provasDB = [];
  const oito = caixa.aulaQuestions({ aulaQ: Q(12), modulo: 'Obesidade' });
  ok(oito.length === 8, '⚠️ o teto de 8 questões da trilha mudou: veio ' + oito.length);
  caixa.provasDB = [{ stem: 'do banco', options: { A: 'a' }, answer: 'A', area: 'Obesidade' }];
  ok(caixa.aulaQuestions({ aulaQ: Q(3), modulo: 'Obesidade' }).length === 3,
    '🧨 a aula tem questões próprias e o banco entrou junto — a trilha deixaria de ser a da aula');
}

// ── 3. As duas telas dizem de onde vieram ────────────────────────────────
{
  const aluno = corpo('renderAulaQuestBody');
  ok(/aulaQProprias\(c\)/.test(aluno),
    '🧨 a tela do aluno voltou a rotular todas as questões igual — emprestada do banco passa por questão da aula');
  ok(/questões <b>desta aula<\/b>/.test(aluno),
    '⚠️ sumiu o rótulo que identifica a questão própria da aula');
  ok(/questões do banco sobre/.test(aluno) && /ainda não tem questões próprias/.test(aluno),
    '🧨 a tela do aluno não avisa mais que as questões são do banco e não da aula');

  const prof = corpo('admRenderAulaQuestReview');
  ok(/aulaQProprias\(c\)/.test(prof),
    '🧨 a revisão do professor voltou a chamar tudo de "questões da trilha" — foi assim que o erro passou despercebido');
  ok(/emprestadas do banco/.test(prof),
    '⚠️ sumiu o aviso de empréstimo na tela onde o professor revisa a trilha antes de publicar');
  ok(prof.indexOf('questão(ões) da trilha —') < 0,
    '🧨 o rótulo antigo e ambíguo ("questão(ões) da trilha") voltou à revisão do professor');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ trilha da aula: questão própria e questão emprestada do banco se anunciam diferente, no painel do aluno e na revisão do professor');
