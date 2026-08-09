// Qual bloco cai PRIMEIRO quando a área cruzar o teto? Mede pelo caminho real.
// ⚠️ A chave do bloco é o ÍNDICE, não o tema: os temas contêm " — " dentro deles
// (o sufixo de seções), e cortar no primeiro travessão funde blocos distintos.
const { deepFor, DEEP } = require('../../lib/clinical-deep.js');
const AREA = process.argv[2] || 'Tireoide';
const linhaDe = (b) => '• ' + b.tema + ' — ' + b.fonte + ': ' + b.texto;
const total = DEEP[AREA].reduce((s, b) => s + linhaDe(b).length + 1, 0);

const entregues = (saida) => {
  const s = new Set();
  DEEP[AREA].forEach((b, i) => { if (saida.indexOf(linhaDe(b)) >= 0) s.add(i); });
  return s;
};
const rotulo = (i) => `[${i}] ` + DEEP[AREA][i].tema.slice(0, 70);

const PERGUNTAS = process.argv.slice(3).length ? process.argv.slice(3) : [
  'paciente com crise tireotóxica, o que faço agora',
  'nódulo de tireoide de 1,8 cm, qual conduta',
  'TSH 8,2 com T4L normal, trato',
  'hipotireoidismo na gestante, dose de levotiroxina',
  'doença de Graves, metimazol por quanto tempo',
  'tireoidite subaguda, dor cervical',
  'carcinoma papilífero, seguimento com tireoglobulina',
  'amiodarona e tireotoxicose',
  'T3 baixo em paciente internado grave',
  'tempestade tireoidiana com febre e taquicardia',
];

console.log(`${AREA}: ${DEEP[AREA].length} blocos, ${total} chars emitidos, folga ${400000 - total}`);
for (const q of PERGUNTAS) {
  const cheio = entregues(deepFor(AREA, 400000, q));
  let caiu = null, custo = null;
  for (const corte of [1, 2000, 5000, 8237, 12000, 20000, 40000, 70000]) {
    const t = total - corte;
    if (t < 2000) break;
    const agora = entregues(deepFor(AREA, t, q));
    const sumiu = [...cheio].filter((x) => !agora.has(x));
    if (sumiu.length) { caiu = sumiu; custo = corte; break; }
  }
  console.log(`\nQ: ${q}\n   entregues hoje: ${cheio.size}/${DEEP[AREA].length}`);
  console.log(caiu ? `   ⚠️ +${custo} chars na área e SOME: ${caiu.map(rotulo).join(' | ')}`
                   : `   (nada some até -70000)`);
}
