// Ordem dos blocos nas duas áreas que cresceram hoje (Adrenal 2→4, Neuro 4→6).
// Área certa não basta: o bloco que responde tem de chegar em PRIMEIRO.
const { canonArea, deepFor, DEEP } = require('../../lib/clinical-deep.js');
// ⚠️ A regex tem de bater no TEMA, não na linha inteira. A primeira versão
// testava `l1`, que é `• {tema} — {fonte}: {texto}` — e o corpo de um bloco de
// 115 fatos contém quase qualquer expressão. Ela deu 17/17 enquanto a sonda das
// áreas magras acusava o MESMO caminho como quebrado. Falso verde meu, dentro do
// meu próprio teste, pela terceira vez hoje: chave frouxa mente a favor.
const temaDoPrimeiro = (area, saida) => {
  const l1 = saida.split('\n').find((l) => l.startsWith('• ')) || '';
  const b = (DEEP[area] || []).find((x) => l1.startsWith('• ' + x.tema + ' — '));
  return b ? b.tema : '';
};
const CASOS = [
  // Adrenal
  ['recém-nascido com genitália ambígua e hiponatremia', 'Adrenal', /hiperplasia adrenal congenita/i],
  ['crise perdedora de sal no lactente com 21-hidroxilase', 'Adrenal', /hiperplasia adrenal congenita/i],
  ['HAC não clássica na adolescente, quando trato?', 'Adrenal', /hiperplasia adrenal congenita/i],
  ['hipertensão resistente com hipocalemia, rastreio?', 'Adrenal', /HIPERALDOSTERONISMO/],
  ['cateterismo de veias adrenais ou só TC?', 'Adrenal', /HIPERALDOSTERONISMO/],
  ['espironolactona no hiperaldosteronismo, titulo por quê?', 'Adrenal', /HIPERALDOSTERONISMO/],
  ['crise adrenal, hidrocortisona IV agora', 'Adrenal', /insuficiência adrenal/i],
  ['desmame de prednisona por 6 meses, risco de crise', 'Adrenal', /glicocorticoide/i],
  ['cortisol basal 3, faço teste de estímulo?', 'Adrenal', /insuficiência adrenal/i],
  // Neuroendocrinologia
  ['poliúria hipotônica de 6 L/dia, investigo como?', 'Neuroendocrinologia', /DIABETES INSIPIDUS/],
  ['paciente adípsico com hipernatremia', 'Neuroendocrinologia', /DIABETES INSIPIDUS/],
  ['resposta trifásica após transesfenoidal', 'Neuroendocrinologia', /DIABETES INSIPIDUS|craniofaringioma/i],
  ['prolactina 90, é prolactinoma?', 'Neuroendocrinologia', /prolactin/i],
  ['efeito gancho na dosagem de prolactina', 'Neuroendocrinologia', /prolactin/i],
  ['craniofaringioma em criança, cirurgia ou radioterapia', 'Neuroendocrinologia', /craniofaringioma/i],
  ['obesidade hipotalâmica após ressecção de tumor selar', 'Neuroendocrinologia', /craniofaringioma/i],
  ['desmopressina na gestante com diabetes insipidus', 'Neuroendocrinologia', /DIABETES INSIPIDUS/],
];
let falhas = 0;
for (const [q, areaEsp, rx] of CASOS) {
  const a = canonArea(q);
  const saida = a ? deepFor(a, 400000, q) : '';
  const l1 = temaDoPrimeiro(a, saida);
  const okA = a === areaEsp, okB = rx.test(l1);
  if (okA && okB) continue;
  falhas++;
  console.log(`✖ ${q}\n   área: ${a || '(nenhuma)'}${okA ? '' : `  ← esperada ${areaEsp}`}`);
  console.log(`   1º:   ${l1.slice(0, 66)}${okB ? '' : '  ← não é o bloco que responde'}`);
}
console.log(falhas ? `\n${falhas} de ${CASOS.length} com problema.`
                   : `\n✓ ${CASOS.length} caminhos: área certa e bloco certo em primeiro.`);
