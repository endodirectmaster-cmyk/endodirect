#!/usr/bin/env node
/* O radical de "grávida" e o de "gravidade" coincidem até a 6ª letra.
 *
 * POR QUE ESTE TESTE EXISTE: `POPULACAO` em scripts/confere-ancoragem.js marca
 * como DE RISCO a âncora ambígua cuja afirmação fala de população — porque o
 * defeito conhecido é o mesmo texto numa tabela de adulto e numa de criança.
 * Só que `gravid` casava "GRAVIDADE", palavra corrente em texto clínico
 * ("escala de gravidade", "gravidade do quadro"). Medido no acervo em
 * 2026-08-21: 80 afirmações casavam SÓ por isso, nenhuma sobre gestação.
 *
 * Acusação falsa em guarda de CI é pior que guarda ausente: ensina a ignorar o
 * alarme. Mas afrouxar o radical inteiro perderia gestante de verdade — daí o
 * lookahead estreito, e daí este teste, que confere as DUAS pontas.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'confere-ancoragem.js'), 'utf8');
const m = src.match(/const POPULACAO = (\/.*\/i);/);
if (!m) { console.error('✗ não achei POPULACAO em confere-ancoragem.js'); process.exit(1); }
const POPULACAO = eval(m[1]);

// Devem CASAR: são de fato sobre população, que é o alvo da guarda.
const DEVE_CASAR = [
  'Em gestantes com diabetes, a meta de glicemia de jejum é mais baixa.',
  'Na grávida com hipotireoidismo, a levotiroxina sobe já no primeiro trimestre.',
  'A gravidez altera a interpretação do TSH por causa do hCG.',
  'Em crianças com cetoacidose, o edema cerebral é a complicação temida.',
  'Na criança, a dose é por quilo.',
  'Em adultos, o alvo perioperatório é de 100 a 180 mg/dL.',
  'No adolescente com DM1, o rastreio começa após a puberdade.',
  'Em idosos frágeis, a meta de HbA1c é afrouxada.',
  'A dose pediátrica difere da do adulto.',
  'No neonato, a hipoglicemia tem outro limiar.',
  'Em lactentes, a apresentação é inespecífica.',
];

// NÃO devem casar: falam de GRAVIDADE (intensidade), não de gestação.
const NAO_DEVE_CASAR = [
  'Escalas de escore validadas determinam a gravidade dos sintomas neuropáticos.',
  'A gravidade da hipertensão eleva a prevalência de hiperaldosteronismo primário.',
  'Diante da gravidade do vômito, suspender o agonista de GLP-1.',
  'O choque é desproporcional à gravidade do gatilho.',
  'A classificação de gravidade define onde internar.',
];

let falhas = 0;
for (const s of DEVE_CASAR) {
  if (!POPULACAO.test(s)) { console.error('✗ deveria casar e NÃO casou: ' + s); falhas++; }
}
for (const s of NAO_DEVE_CASAR) {
  if (POPULACAO.test(s)) { console.error('✗ NÃO deveria casar e casou: ' + s); falhas++; }
}

// ── Verificação por MUTAÇÃO: o teste tem de reprovar um regex quebrado.
// Sem isto, um teste que só afirma o comportamento atual passa mesmo quando a
// guarda foi desfeita — foi o erro de 06/08 registrado no cofre.
const MUTANTES = [
  ['sem o lookahead (o bug original)', /\b(crianc|criança|pediatr|adolescent|adult|gestant|gravid|idos|neonat|lactent)/i],
  ['sem gestante/grávida (perde gestação)', /\b(crianc|criança|pediatr|adolescent|adult|idos|neonat|lactent)/i],
  ['vazio (não acusa nada)', /(?!)/],
];
for (const [nome, mut] of MUTANTES) {
  const pegou = DEVE_CASAR.some((s) => !mut.test(s)) || NAO_DEVE_CASAR.some((s) => mut.test(s));
  if (!pegou) { console.error('✗ mutação NÃO foi detectada: ' + nome); falhas++; }
}

if (falhas) { console.error('\n✗ ' + falhas + ' falha(s)'); process.exit(1); }
console.log('✓ gravidade não é gestação: ' + DEVE_CASAR.length + ' de população casam, '
  + NAO_DEVE_CASAR.length + ' de intensidade não casam, ' + MUTANTES.length + ' mutações detectadas');
