// Teste de caminho nas áreas menos varridas. Não altera nada.
// Pergunta do médico → área canônica + bloco que chega em PRIMEIRO lugar.
const { canonArea, deepFor } = require('../../lib/clinical-deep.js');

// [pergunta, área esperada, regex do bloco que DEVE chegar em 1º]
const CASOS = [
  // Lípides
  ['LDL 190 sem outro fator, começo estatina?', 'Lípides', null],
  ['paciente com IAM prévio, alvo de LDL', 'Lípides', null],
  ['hipertrigliceridemia de 900, risco de pancreatite', 'Lípides', null],
  ['lipoproteína(a) elevada, o que faço', 'Lípides', null],
  ['intolerância a estatina, mialgia', 'Lípides', null],
  ['hipercolesterolemia familiar, rastreio em cascata', 'Lípides', null],
  // Endocrinologia Feminina
  ['adolescente com ciclos irregulares e acne, é SOP?', 'Endocrinologia Feminina', /SOP|ovarios policisticos|ovários policísticos/i],
  ['hirsutismo com Ferriman 12, investigo o quê?', 'Endocrinologia Feminina', /hirsutismo/i],
  ['mulher com hirsutismo de início rápido e virilização', 'Endocrinologia Feminina', /hirsutismo/i],
  ['SOP e resistência insulínica, uso metformina?', 'Endocrinologia Feminina', /SOP|policist/i],
  // Adrenal
  ['paciente em prednisona 20 mg há 6 meses, como desmamo?', 'Adrenal', /glicocorticoide/i],
  ['cortisol basal 3, faço teste de estímulo?', 'Adrenal', /classifica|etiologia|insuficiência adrenal —/i],
  ['crise adrenal, hidrocortisona IV', 'Adrenal', null],
  ['doença de Addison, dose de fludrocortisona', 'Adrenal', null],
  // Neuroendocrinologia
  ['prolactina 90, é prolactinoma?', 'Neuroendocrinologia', /prolactin/i],
  ['macroprolactinoma com prolactina baixa, efeito gancho', 'Neuroendocrinologia', /prolactin/i],
  ['craniofaringioma em criança, cirurgia ou radioterapia', 'Neuroendocrinologia', /craniofaringioma/i],
  ['obesidade hipotalâmica após cirurgia de tumor selar', 'Neuroendocrinologia', /craniofaringioma/i],
  // Endocrinopatias
  ['sódio 118 com convulsão, conduta agora', 'Endocrinopatias', /aguda sintom/i],
  ['hiponatremia crônica assintomática, corrijo quão rápido?', 'Endocrinopatias', /cr[oô]nica/i],
  ['idoso com sódio 128 em tiazídico', 'Endocrinopatias', /idoso|algoritmo/i],
  ['SIADH, como confirmo?', 'Endocrinopatias', /algoritmo|fisiopatologia/i],
  // Esporte
  ['DM1 vai correr 10 km, como ajusto o CGM e o carboidrato', 'Endocrinologia do Esporte', /exerc/i],
];

let falhas = 0;
for (const [q, areaEsperada, rx] of CASOS) {
  const a = canonArea(q);
  const saida = a ? deepFor(a, 400000, q) : '';
  const l1 = (saida.split('\n').find((l) => l.startsWith('• ')) || '').slice(2);
  const tema1 = l1.slice(0, 100);
  const okArea = a === areaEsperada;
  const okBloco = !rx || rx.test(l1);
  if (!okArea || !okBloco) {
    falhas++;
    console.log(`✖ ${q}`);
    console.log(`   área: ${a || '(nenhuma)'}${okArea ? '' : `  ← esperada ${areaEsperada}`}`);
    console.log(`   1º:   ${tema1 || '(nada)'}${okBloco ? '' : '  ← não é o bloco que responde'}`);
  }
}
console.log(falhas ? `\n${falhas} de ${CASOS.length} caminhos com problema.`
                   : `\n✓ ${CASOS.length} caminhos: área certa e bloco certo em primeiro.`);
