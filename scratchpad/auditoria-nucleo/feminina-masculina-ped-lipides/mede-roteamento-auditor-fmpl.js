#!/usr/bin/env node
/* Auditor feminina/masculina/pediátrica/lípides — MEDIÇÃO de roteamento.
 * Escrito por mim (este auditor), roda só leitura. Não escreve nada.
 *
 * Pergunta que responde: uma pergunta real sobre o assunto das 4 entradas SEM
 * área canônica cai em que área? E a base profunda entrega alguma coisa?
 */
'use strict';
const { canonArea, deepFor } = require('../../../lib/clinical-deep.js');
const DEEP = require('../../../lib/clinical-deep-data.js');

const casos = [
  // i=11 — GH de ação prolongada
  ['i=11', 'GH de ação prolongada'],
  ['i=11', 'somapacitana semanal em criança com deficiência de GH: como monitorar IGF-1?'],
  ['i=11', 'lonapegsomatropina dose inicial por peso'],
  ['i=11', 'hormônio de crescimento semanal é não inferior ao diário?'],
  // i=36 — Vitamina D
  ['i=36', 'Vitamina D para prevenção de doenças'],
  ['i=36', 'devo dosar 25-OH-vitamina D de rotina em adulto saudável?'],
  ['i=36', 'suplementação de vitamina D em adulto de 80 anos'],
  ['i=36', 'colecalciferol dose em pré-diabetes'],
  // i=53 — Acondroplasia / vosoritida
  ['i=53', 'Acondroplasia'],
  ['i=53', 'vosoritida em criança com acondroplasia e placas de crescimento abertas'],
  ['i=53', 'quando suspender vosoritida?'],
  // i=82 — Transgênero
  ['i=82', 'Cuidado de pessoas transgênero'],
  ['i=82', 'terapia hormonal de afirmação de gênero em mulher trans: alvo de estradiol'],
  ['i=82', 'monitorização laboratorial de homem trans em testosterona'],
  ['i=82', 'WPATH SOC-8 adolescente'],
  // controles — entradas do MESMO lote QUE TÊM área
  ['ctrl i=5', 'hipogonadismo masculino: corte de testosterona total'],
  ['ctrl i=83', 'testosterona transdérmica e risco cardiovascular'],
  ['ctrl i=10', 'PIG sem catch-up aos 4 anos: indico GH?'],
  ['ctrl i=48', 'puberdade precoce central em menina de 7 anos'],
  ['ctrl i=43', 'critérios de Rotterdam para SOP em adolescente'],
  ['ctrl i=15', 'meta de LDL no risco muito alto'],
  ['ctrl i=60', 'síndrome de quilomicronemia familiar'],
  ['ctrl i=80', 'fezolinetante para fogachos'],
  ['ctrl i=81', 'terapia hormonal da menopausa iniciada aos 52 anos'],
  ['ctrl i=59', 'insuficiência ovariana prematura: até quando repor estrogênio?'],
  ['ctrl i=77', 'crinecerfonte na hiperplasia adrenal congênita'],
  ['ctrl i=1', 'meta de LDL no diabético de alto risco'],
];

const pad = (s, n) => { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); };
console.log(pad('CASO', 10) + pad('PERGUNTA', 62) + pad('canonArea', 26) + pad('deepFor→área entregue', 26) + 'chars');
for (const [tag, q] of casos) {
  const ca = canonArea(q);
  const txt = deepFor(q, 12000, q) || '';
  // qual área o deepFor realmente usou
  let usada = '';
  if (txt) {
    for (const a of Object.keys(DEEP)) {
      if (DEEP[a].some((b) => txt.includes(String(b.tema || '').slice(0, 30)))) { usada = a; break; }
    }
  }
  console.log(pad(tag, 10) + pad(q, 62) + pad(ca || '(NENHUMA)', 26) + pad(usada || '(vazio)', 26) + txt.length);
}
