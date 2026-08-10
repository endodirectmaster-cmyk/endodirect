// Teste de ordem nas 4 áreas grandes — onde os blocos disputam de verdade.
// A pergunta do médico tem de receber PRIMEIRO o bloco que a responde.
const { canonArea, deepFor, DEEP } = require('../../lib/clinical-deep.js');
// ⚠️ A chave TEM de ser o tema, não a linha inteira. `• {tema} — {fonte}: {texto}`
// carrega o corpo do bloco, e o corpo de um artigo de 100+ fatos contém quase
// qualquer expressão — foi assim que estas sondas deram verde em caminhos que
// estavam quebrados. Quarto falso verde meu pela mesma causa.
const temaDoPrimeiro = (area, saida) => {
  const l1 = saida.split('\n').find((l) => l.startsWith('• ')) || '';
  const b = (DEEP[area] || []).find((x) => l1.startsWith('• ' + x.tema + ' — '));
  return b ? b.tema : '';
};

// [pergunta, área esperada, regex do 1º bloco]
const CASOS = [
  // ── Tireoide (9 blocos, 98% do teto)
  ['crise tireotóxica com febre e taquicardia, o que faço agora', 'Tireoide', /^crise tireotóxica/i],
  ['escore de Burch-Wartofsky, quando chamo de tempestade', 'Tireoide', /^crise tireotóxica/i],
  ['T3 baixo e T4 normal em paciente de UTI, trato?', 'Tireoide', /eutireoidiano|NTIS/i],
  ['T3 reverso alto no doente grave', 'Tireoide', /eutireoidiano|NTIS/i],
  ['amiodarona causou tireotoxicose, qual tipo', 'Tireoide', /fármaco e tireoide/i],
  ['biotina falseia o TSH?', 'Tireoide', /fármaco e tireoide/i],
  ['lítio e hipotireoidismo, monitorizo como', 'Tireoide', /fármaco e tireoide/i],
  ['TSH na gestante do primeiro trimestre, qual referência', 'Tireoide', /gestacao/i],
  ['metimazol ou propiltiouracil na gravidez', 'Tireoide', /gestacao/i],
  ['doença de Graves no adulto, por quanto tempo o metimazol', 'Tireoide', /ADULTO/],
  // ── Osteometabolismo (8 blocos)
  ['fosfatase alcalina baixa, posso dar bisfosfonato?', 'Osteometabolismo', /hipofosfatasia/i],
  ['cálcio 11,4 com PTH normal-alto', 'Osteometabolismo', /HIPERPARATIREOIDISMO PRIMÁRIO/],
  ['cálcio 13 com PTH suprimido, que investigo', 'Osteometabolismo', /PTH SUPRIMIDO|PTH-INDEPENDENTE/i],
  ['paciente em prednisona há 4 meses, previno fratura?', 'Osteometabolismo', /GLICOCORTICOIDE|GIOP/i],
  ['escore T de -2,8 na coluna, trato?', 'Osteometabolismo', /osteoporose no adulto/i],
  ['fratura de quadril após queda da própria altura', 'Osteometabolismo', /osteoporose no adulto/i],
  ['esclera azulada e fraturas de repetição na criança', 'Osteometabolismo', /osteogênese/i],
  ['hipocalcemia após tireoidectomia total, manejo crônico', 'Osteometabolismo', /hipoparatireoidismo/i],
  // ── Diabetes (8 blocos)
  ['CAD com pH 7,1, quando começo insulina', 'Diabetes', /Cetoacidose diabética|CRISES HIPERGLIC/i],
  ['cetoacidose com glicemia 180 em uso de dapagliflozina', 'Diabetes', /euglic/i],
  ['glicemia de jejum 110, é pré-diabetes?', 'Diabetes', /Pré-diabetes/i],
  ['diabetes em jovem magro com história familiar forte', 'Diabetes', /MODY|monogênico/i],
  ['hiperglicemia após pulso de metilprednisolona', 'Diabetes', /glicocorticoide/i],
  ['diabetes novo após transplante renal', 'Diabetes', /transplante/i],
  ['náusea persistente com semaglutida, o que faço', 'Diabetes', /GLP-1/i],
  // ── Obesidade (8 blocos)
  ['indico cirurgia bariátrica para IMC 38 com DM2?', 'Obesidade', /bariátrica/i],
  ['dumping tardio dois anos após bypass', 'Obesidade', /dumping/i],
  ['esteatose hepática com ALT elevada no obeso', 'Obesidade', /hepatica gordurosa|esteatose/i],
  ['qual remédio emagrece mais', 'Obesidade', /farmacoterapia/i],
  ['qual dieta a ABESO recomenda', 'Obesidade', /nutricional/i],
];

let falhas = [];
for (const [q, areaEsp, rx] of CASOS) {
  const a = canonArea(q);
  const saida = a ? deepFor(a, 400000, q) : '';
  const l1 = temaDoPrimeiro(a, saida);
  const okA = a === areaEsp, okB = rx.test(l1);
  if (!okA || !okB) falhas.push([q, a, l1.slice(0, 66), okA, okB, areaEsp]);
}
for (const [q, a, l1, okA, okB, esp] of falhas) {
  console.log(`✖ ${q}`);
  console.log(`   área: ${a || '(nenhuma)'}${okA ? '' : `  ← esperada ${esp}`}`);
  console.log(`   1º:   ${l1}${okB ? '' : '  ← não é o bloco que responde'}`);
}
console.log(falhas.length ? `\n${falhas.length} de ${CASOS.length} com problema.`
                          : `\n✓ ${CASOS.length} caminhos: área certa e bloco certo em primeiro.`);
