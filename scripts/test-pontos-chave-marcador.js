// PONTOS-CHAVE SEM MARCADOR DUPLICADO.
//
// ⚠️ 14/10/2026. O professor mandou o print do capítulo "Diabetes Pós-Transplante
// (DMPT)": cada ponto-chave saía com dois marcadores, o da lista e um "•" que
// estava dentro do próprio texto. As três sínteses da SBD 2026 (DMPT, neuropatia
// e perioperatório) foram gravadas com "• " em cada ponto, e a linha
// "— Evidência e notas de aplicação —", que é título de bloco, saía como ponto.
// O banco foi limpo (backup `main-antes-limpar-marcadores-pts-2026-10-14`) e o
// renderizador passou a tirar o marcador do texto, para o caso de um item vir
// assim de novo, e a mostrar a linha de título sem marcador.
//
// 🧨 O QUE ESTE TESTE PRENDE, com as funções recortadas do index.html:
// (1) "• ", "- ", "– " e "* " no início do ponto não viram texto;
// (2) o ponto sem marcador fica como está, e *itálico* no início não é comido;
// (3) "— Título —" vira linha de título, sem marcador e sem os traços;
// (4) negrito dentro do ponto continua funcionando; (5) o card usa a função.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function trecho(nome, src) {
  src = src || SRC;
  const i = src.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('não achei function ' + nome);
  const j = src.indexOf('\nfunction ', i + 1);
  return src.slice(i, j < 0 ? undefined : j);
}
function mundo(src) {
  src = src || SRC;
  const iCores = src.indexOf('var WYS_CORES=[');
  const fCores = src.indexOf('\n', src.indexOf('var WYS_CORES_RE='));
  const ctx = vm.createContext({ console });
  vm.runInContext([
    src.slice(iCores, fCores),
    src.slice(src.indexOf('\nvar mdAltRE='), src.indexOf('\n', src.indexOf('\nvar mdAltRE=') + 1)),
    trecho('esc', src), trecho('mdSplitRow', src), trecho('wysAlignRead', src), trecho('safeHttpUrl', src),
    trecho('safeImgSrc', src), trecho('mdEscAlt', src), trecho('mdUnescAlt', src),
    trecho('mdInline', src), trecho('dirPontoLI', src)
  ].join('\n'), ctx);
  return ctx;
}
const M = mundo();
const li = (p) => M.dirPontoLI(p);

// (1) marcadores no texto saem
ok(li('• Na SBD 2026, a meta de HbA1c é a faixa de 7,0% a 7,5%.') === '<li>Na SBD 2026, a meta de HbA1c é a faixa de 7,0% a 7,5%.</li>', '(1) "• " no início tinha de sair: ' + li('• Na SBD 2026, a meta de HbA1c é a faixa de 7,0% a 7,5%.'));
ok(li('- item com hífen') === '<li>item com hífen</li>', '(1) "- " no início tinha de sair');
ok(li('– item com meia-risca') === '<li>item com meia-risca</li>', '(1) "– " no início tinha de sair');
ok(li('* item com asterisco') === '<li>item com asterisco</li>', '(1) "* " no início tinha de sair');
ok(li('  •  com espaços') === '<li>com espaços</li>', '(1) espaços antes e depois do marcador também saem');

// (2) sem marcador, nada muda; itálico no início não é comido
ok(li('📌 DIRETRIZ SBD 2026 — Avaliação e tratamento do DMPT') === '<li>📌 DIRETRIZ SBD 2026 — Avaliação e tratamento do DMPT</li>', '(2) ponto sem marcador mudou');
ok(/itálico/.test(li('*itálico* no início')) && !/\*itálico/.test(li('*itálico* no início')), '(2) "*itálico*" no início foi tratado como marcador: ' + li('*itálico* no início'));
ok(li('5-10 mg ao dia') === '<li>5-10 mg ao dia</li>', '(2) hífen sem espaço depois não é marcador');

// (3) linha de título
ok(li('— Evidência e notas de aplicação —') === '<li class="dir-pts-sep">Evidência e notas de aplicação</li>', '(3) "— Título —" tinha de virar linha de título: ' + li('— Evidência e notas de aplicação —'));
ok(li('— só abre') === '<li>— só abre</li>', '(3) traço só no início não é título');

// (4) negrito continua
const neg = li('• A metformina **DEVE SER CONSIDERADA** no DMPT');
ok(/DEVE SER CONSIDERADA/.test(neg) && !/\*\*/.test(neg) && /<(b|strong)>/.test(neg), '(4) o negrito do ponto parou de funcionar: ' + neg);

// (5) o card usa a função
ok(/d\.pts\.map\(dirPontoLI\)/.test(SRC), '(5) o card das Diretrizes deixou de usar dirPontoLI');
ok(/\.dir-card \.dir-pts li\.dir-pts-sep\{list-style:none/.test(SRC), '(5) a linha de título perdeu o estilo sem marcador');

// Mutações: cada uma tem de ser pega.
function mutante(de, para) {
  const alvo = trecho('dirPontoLI');
  if (alvo.indexOf(de) < 0) throw new Error('mutação não se aplica: ' + de);
  return mundo(SRC.replace(alvo, alvo.replace(de, para)));
}
ok(mutante("replace(/^\\s*[•▪◦‣·\\-–*]\\s+/,'')", "replace(/^$/,'')").dirPontoLI('• x') !== '<li>x</li>', 'MUTAÇÃO: sem tirar o marcador o teste tinha de reprovar');
ok(!/dir-pts-sep/.test(mutante("if(sep)return", "if(false)return").dirPontoLI('— T —')), 'MUTAÇÃO: sem a linha de título o teste tinha de reprovar');

if (falhas.length) { console.error('test-pontos-chave-marcador: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
console.log('test-pontos-chave-marcador: ok (marcador no texto sai; título de bloco sem marcador; negrito e itálico intactos; o card usa a função)');
