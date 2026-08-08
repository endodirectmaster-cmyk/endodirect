#!/usr/bin/env node
/* Bateria de caminho — conferência PRÓPRIA do pacote de roteamento que os
 * auditores de 08/08/2026 pediram (hiperglicemia por corticoide, cetoacidose,
 * cetoacidose euglicêmica).
 *
 * POR QUE EU NÃO ACEITO O NÚMERO DELES DE GRAÇA: já aconteceu nesta mesma
 * empreitada de um agente relatar "regressão de roteamento passa" quando não
 * passava ("DM2 após pulso de corticoide" caía em Adrenal). Relato de agente é
 * pista, não prova. E de fato: o auditor do corticoide mediu a linha de base em
 * GIH 6/12, e a MINHA bateria de 12 perguntas mede 3/12. Não é contradição — são
 * perguntas diferentes —, mas é exatamente por isso que o número que vale é o
 * que eu medir aqui, contra o módulo de verdade.
 *
 * O QUE ESTE ARQUIVO NÃO FAZ: não afirma qual área é a "certa" para as
 * sentinelas. Para elas o teste é de MOVIMENTO — a pergunta pode estar hoje numa
 * área discutível, mas o pacote não pode ser o que a muda. Daí o instantâneo.
 *
 * Uso:
 *   node scratchpad/bateria-caminho.js --grava   → grava a linha de base
 *   node scratchpad/bateria-caminho.js           → mede e compara com a base
 */
const fs = require('fs');
const path = require('path');
const { canonArea, deepFor } = require('../lib/clinical-deep');

const BASE = path.join(__dirname, 'bateria-caminho-base.json');
const GRAVA = process.argv.includes('--grava');

// ── Alvos: têm resposta certa conhecida ──────────────────────────────────────
const ALVO = {
  // Hiperglicemia induzida por glicocorticoide. O capítulo está na base desde
  // ontem e o auditor mediu que 2 de 4 vinhetas nem alcançavam o extrato.
  GIH: [
    ['DM2 em prednisona 15 mg pela manha, glicemia pre-jantar de 171', 'Diabetes'],
    ['dexametasona 12 mg intravenosa semanal na quimioterapia, glicemia 280 a tarde', 'Diabetes'],
    ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'Diabetes'],
    ['NPH com prednisona em reducao: como ajustar a insulina no desmame?', 'Diabetes'],
    ['quanta NPH comecar para prednisona 40 mg em paciente de 80 kg?', 'Diabetes'],
    ['esquema basal-bolus para paciente em dexametasona: como dividir?', 'Diabetes'],
    ['hiperglicemia por corticoide: a glicemia de jejum normal descarta?', 'Diabetes'],
    ['prednisona matinal: NPH matinal ou basal-bolus?', 'Diabetes'],
    ['glicemia 280 a tarde em paciente que tomou corticoide de manha', 'Diabetes'],
    ['equivalencia de dexametasona para prednisona para dimensionar a insulina', 'Diabetes'],
    ['metilprednisolona em pulso: preciso de insulina extra?', 'Diabetes'],
    ['paciente sem diabetes previo, em corticoide, glicemia 250: como trato?', 'Diabetes'],
  ],
  // O eixo — o lado que NÃO pode quebrar para o outro ganhar.
  ADRENAL: [
    ['prednisona 5 mg ha dois anos: como desmamar sem crise adrenal?', 'Adrenal'],
    ['em corticoide cronico, glicemia normal exclui supressao do eixo?', 'Adrenal'],
    ['paciente em insulina e prednisona 5 mg: ja posso dosar o cortisol matinal?', 'Adrenal'],
    ['cortisol matinal de 4 ug/dl apos desmame de corticoide: o que fazer?', 'Adrenal'],
    ['teste de tolerancia a insulina para avaliar o eixo hipofise-adrenal', 'Adrenal'],
    ['posso acelerar o desmame do corticoide se o paciente esta bem?', 'Adrenal'],
    ['sindrome de cushing exogena por corticoide inalatorio', 'Adrenal'],
    ['cushing exogeno: como diferenciar do endogeno?', 'Adrenal'],
    ['teste de cosintropina apos corticoterapia prolongada', 'Adrenal'],
    ['hidrocortisona na crise adrenal: qual dose?', 'Adrenal'],
    ['hiperpigmentacao e avidez por sal: penso em insuficiencia adrenal?', 'Adrenal'],
    ['fludrocortisona na doenca de Addison', 'Adrenal'],
    ['sindrome de retirada de corticoide com eletrolitos normais', 'Adrenal'],
    ['metirapona no Cushing', 'Adrenal'],
  ],
  // Emergências hiperglicêmicas — os termos que o auditor da CAD achou mudos.
  // Este extrato é o ÚNICO da base com conteúdo de estado hiperosmolar.
  EMERG: [
    ['paciente com CAD, pH 7,1: quando comeco a insulina?', 'Diabetes'],
    ['estado hiperglicemico hiperosmolar: qual a reposicao de volume?', 'Diabetes'],
    ['EHH em idoso com glicemia 900', 'Diabetes'],
    ['coma hiperosmolar: difere da cetoacidose em que?', 'Diabetes'],
    ['crise hiperglicemica na emergencia', 'Diabetes'],
    ['emergencia hiperglicemica: CAD ou hiperosmolar?', 'Diabetes'],
  ],
  // Cetoacidose alcoólica — o achado do auditor da euglicêmica: a vinheta que
  // não diz "cetoacidose" não tinha termo que a levasse a lugar nenhum.
  ETIL: [
    ['etilista cronico, dor abdominal e anion gap alto: o que penso?', 'Diabetes'],
    ['cetoacidose alcoolica em paciente sem diabetes: preciso de insulina?', 'Diabetes'],
    ['alcoolismo com cetonemia e glicemia de 90', 'Diabetes'],
  ],
};

// ── Sentinelas: teste de MOVIMENTO, não de acerto ────────────────────────────
// Perguntas de outras áreas que o pacote poderia sequestrar, porque ele sobe
// `insulina` e `hiperglicemia` para peso de doença.
const SENTINELA = [
  'etilista cronico com ginecomastia',
  'etilista com osteoporose e fratura de fragilidade',
  'paciente em insulina com nodulo tireoidiano de 2 cm',
  'paciente em insulina cronica com osteoporose e T-score -3,0',
  'mulher em insulina com prolactina de 90 e amenorreia',
  'obeso em insulina: indico cirurgia bariatrica?',
  'hiperglicemia em paciente com acromegalia',
  'hiperglicemia e hipertensao em suspeita de feocromocitoma',
  'hiperglicemia na sindrome dos ovarios policisticos',
  'hiperglicemia apos transplante renal em uso de tacrolimo',
  'hiponatremia com cortisol baixo',
  'insulina no eutireoidiano doente da UTI',
  'hiperglicemia em paciente com hipertireoidismo descompensado',
  'paciente com hiperglicemia e hipercalcemia: penso em NEM1?',
  'osteoporose apos bypass gastrico: como reponho calcio?',
  'hipoglicemia pos-prandial dois anos apos bypass gastrico',
  'paciente em insulina apos gastrectomia vertical: posso reduzir a dose?',
  'deficiencia de ferro apos cirurgia bariatrica',
];

const medir = () => {
  const m = {};
  for (const bloco of Object.keys(ALVO)) for (const [q] of ALVO[bloco]) m[q] = canonArea(q) || '(vazio)';
  for (const q of SENTINELA) m[q] = canonArea(q) || '(vazio)';
  return m;
};

const agora = medir();

if (GRAVA) {
  fs.writeFileSync(BASE, JSON.stringify(agora, null, 1) + '\n');
  console.log('linha de base gravada em ' + path.relative(process.cwd(), BASE));
}

let totalOk = 0, totalN = 0;
for (const bloco of Object.keys(ALVO)) {
  let ok = 0; const falhas = [];
  for (const [q, esperado] of ALVO[bloco]) {
    if (agora[q] === esperado) ok++;
    else falhas.push(`     ✗ ${q}\n       esperado ${esperado} · veio ${agora[q]}`);
  }
  totalOk += ok; totalN += ALVO[bloco].length;
  console.log(`${ok === ALVO[bloco].length ? '✓' : '·'} ${bloco}: ${ok}/${ALVO[bloco].length}`);
  falhas.forEach((f) => console.log(f));
}
console.log(`\nALVOS ${totalOk}/${totalN}`);

// ── Comparação com a linha de base ───────────────────────────────────────────
if (!GRAVA && fs.existsSync(BASE)) {
  const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));
  const mudou = Object.keys(agora).filter((q) => base[q] !== undefined && base[q] !== agora[q]);
  const sent = mudou.filter((q) => SENTINELA.includes(q));
  console.log(`\nMOVIMENTO desde a linha de base: ${mudou.length} pergunta(s)`);
  mudou.forEach((q) => console.log(`   ${SENTINELA.includes(q) ? '⚠ SENTINELA' : '  alvo    '} ${base[q]} → ${agora[q]}   ${q}`));
  if (sent.length) {
    console.log(`\n⚠ ${sent.length} sentinela(s) MUDARAM de área. Isso é dano colateral até prova em contrário —`);
    console.log(`   julgue uma a uma se a área nova é melhor ou pior que a antiga.`);
  } else {
    console.log('   (nenhuma sentinela se moveu)');
  }
}

// ── O bloco chega mesmo? Roteamento certo com bloco vazio não serve de nada ──
const AMOSTRA = [
  ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'corticoide'],
  ['EHH em idoso com glicemia 900', 'hiperosmolar'],
  ['cetoacidose alcoolica em paciente sem diabetes: preciso de insulina?', 'alcool'],
];
console.log('\nCHEGADA (o bloco devolvido contém o assunto?)');
for (const [q, marca] of AMOSTRA) {
  const a = canonArea(q);
  const txt = a ? deepFor(a, 120000, q) : '';
  const achou = txt.toLowerCase().includes(marca);
  console.log(`   ${achou ? '✓' : '✗'} ${a || '(vazio)'} · ${(txt.length / 1000).toFixed(0)}k · "${marca}" ${achou ? 'presente' : 'AUSENTE'} — ${q}`);
}
