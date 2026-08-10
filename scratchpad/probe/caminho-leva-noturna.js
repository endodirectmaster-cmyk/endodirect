// Ordem dos blocos nas áreas que cresceram na leva da noite de 09/08:
// Endocrinopatias 5→6 (checkpoint) e Adrenal 4→6 (feocromocitoma, Cushing).
// ⚠️ A chave é o TEMA casado contra o DEEP, nunca a linha inteira — o corpo de
// um bloco de 100+ fatos contém quase qualquer expressão, e isso já me deu
// quatro falsos verdes hoje.
const { canonArea, deepFor, DEEP } = require('../../lib/clinical-deep.js');
const temaDoPrimeiro = (area, saida) => {
  const l1 = saida.split('\n').find((l) => l.startsWith('• ')) || '';
  const b = (DEEP[area] || []).find((x) => l1.startsWith('• ' + x.tema + ' — '));
  return b ? b.tema : '';
};
const CASOS = [
  // Endocrinopatias — o bloco novo não pode roubar a hiponatremia, nem perder o que é dele
  ['sódio 118 com convulsão, conduta agora', 'Endocrinopatias', /aguda sintom/i],
  ['hiponatremia crônica, corrijo quão rápido', 'Endocrinopatias', /cr[oô]nica/i],
  ['SIADH, como confirmo?', 'Endocrinopatias', /algoritmo|fisiopatologia/i],
  ['idoso com sódio 128 em tiazídico', 'Endocrinopatias', /algoritmo|idoso/i],
  ['tireoidite por inibidor de checkpoint, trato com tionamida?', 'Endocrinopatias', /CHECKPOINT/],
  ['diabetes por inibidor de checkpoint abrindo em cetoacidose', 'Endocrinopatias', /CHECKPOINT/],
  ['irAE endócrino: quando suspendo a imunoterapia', 'Endocrinopatias', /CHECKPOINT/],
  // ⚠️ EXPECTATIVA MINHA CORRIGIDA, não roteamento. Eu esperava o bloco de ICI,
  // mas `cortisol` leva a Adrenal e lá o paciente recebe o bloco de
  // INSUFICIÊNCIA ADRENAL — que é uma boa resposta para "cortisol baixo".
  // `ipilimumabe` é 12 × 10 (quase empate) e o extrator do checkpoint
  // recomendou NÃO propô-la; forçar seria ajustar a base ao teste.
  // O que ERA defeito e foi consertado: o 1º bloco vinha sendo o do
  // HIPERALDOSTERONISMO, porque o tema dele tem "renina BAIXA" (+3) e o da
  // insuficiência adrenal não dizia que o cortisol é BAIXO — a direção que
  // define a doença. Agora diz.
  ['paciente em ipilimumabe com cortisol baixo', 'Adrenal', /insuficiência adrenal —/],
  // Adrenal — seis blocos disputando
  ['crise adrenal, hidrocortisona IV agora', 'Adrenal', /insuficiência adrenal —/],
  ['cortisol basal 3, faço teste de estímulo?', 'Adrenal', /insuficiência adrenal —/],
  ['desmame de prednisona por 6 meses, risco de crise', 'Adrenal', /glicocorticoide/i],
  ['hipertensão resistente com hipocalemia, rastreio?', 'Adrenal', /HIPERALDOSTERONISMO/],
  ['recém-nascido com genitália ambígua e hiponatremia', 'Adrenal', /hiperplasia adrenal congenita/i],
  ['suspeita de Cushing, que exame peço', 'Adrenal', /síndrome de Cushing/],
  ['metanefrinas plasmáticas elevadas, próximo passo', 'Adrenal', /FEOCROMOCITOMA/],
  ['bloqueio alfa antes da cirurgia, por quantos dias', 'Adrenal', /FEOCROMOCITOMA/],
  ['massa adrenal de 3 cm com HU 8, dispenso metanefrinas?', 'Adrenal', /FEOCROMOCITOMA|Cushing/],
  ['SDHB positivo, com que frequência rastreio', 'Adrenal', /FEOCROMOCITOMA/],
];
let falhas = 0;
for (const [q, areaEsp, rx] of CASOS) {
  const a = canonArea(q);
  const t1 = a ? temaDoPrimeiro(a, deepFor(a, 400000, q)) : '';
  const okA = a === areaEsp, okB = rx.test(t1);
  if (okA && okB) continue;
  falhas++;
  console.log(`✖ ${q}`);
  console.log(`   área: ${a || '(nenhuma)'}${okA ? '' : `  ← esperada ${areaEsp}`}`);
  console.log(`   1º:   ${t1.slice(0, 64)}${okB ? '' : '  ← não é o bloco que responde'}`);
}
console.log(falhas ? `\n${falhas} de ${CASOS.length} com problema.`
                   : `\n✓ ${CASOS.length} caminhos: área certa e bloco certo em primeiro.`);
