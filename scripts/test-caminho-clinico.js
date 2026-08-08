#!/usr/bin/env node
/* A pergunta do médico chega ao artigo que a responde?
 *
 * POR QUE ISTO EXISTE. Extração verificada não é entrega. Este projeto já perdeu
 * artigos inteiros por ROTEAMENTO, com o conteúdo certo na base e inalcançável:
 *
 *   · `bisphosphonates are contraindicated` na hipofosfatasia — a pergunta
 *     "osteoporose refratária, fosfatase alcalina baixa, posso dar bisfosfonato?"
 *     devolvia bloco de ZERO caractere;
 *   · 154 fatos de hirsutismo arquivados em Adrenal, inalcançáveis;
 *   · a área de Esporte sequestrada pela palavra "diabetes";
 *   · `CAD` — o que o médico brasileiro escreve — devolvendo "".
 *
 * Cada um desses foi achado por MEDIÇÃO, não por leitura do código. Este arquivo
 * transforma essas medições em regressão, para que o próximo a mexer nos pesos
 * tenha rede.
 *
 * ⚠️ COMO ESTE ARQUIVO PODE MENTIR, e a proteção contra isso. Rotear certo não
 * basta: se o bloco devolvido não contém o assunto, a pergunta chegou na área
 * certa e no artigo errado. Medido em 08/08/2026: "EHH em idoso com glicemia
 * 900" roteava para Diabetes e o bloco voltava SEM a palavra "hiperosmolar",
 * porque o `tema` do extrato não a trazia e Diabetes está em 232k contra teto de
 * 120k — bloco não escolhido é bloco que não existe. Daí o bloco CHEGADA no fim.
 */
'use strict';
const deep = require('../lib/clinical-deep');

let falhas = 0;
const ok = (cond, msg) => { if (!cond) { falhas++; console.error('  - ' + msg); } };

// ─────────────────────────────────────────────────────────────────────────────
// 1. ROTEAMENTO — a pergunta cai na subespecialidade certa?
// ─────────────────────────────────────────────────────────────────────────────
const CAMINHO = [
  // Os defeitos históricos, cada um com o seu nome no cofre.
  ['osteoporose refrataria com fosfatase alcalina baixa: posso dar bisfosfonato?', 'Osteometabolismo'],
  ['mulher de 30 anos com testosterona total normal: trato o hirsutismo?', 'Endocrinologia Feminina'],
  ['DM2 descompensado apos pulso de corticoide', 'Diabetes'],

  // Emergências hiperglicêmicas: `CAD` e `EHH` devolviam "" até 08/08/2026, e o
  // extrato da CAD é o ÚNICO da base com conteúdo de estado hiperosmolar.
  ['paciente com CAD, pH 7,1: quando comeco a insulina?', 'Diabetes'],
  ['EHH em idoso com glicemia 900', 'Diabetes'],
  ['estado hiperglicemico hiperosmolar: qual a reposicao de volume?', 'Diabetes'],
  ['crise hiperglicemica na emergencia', 'Diabetes'],

  // Hiperglicemia por corticoide vive na INTERSEÇÃO fármaco × achado. A resposta
  // errada de "em que horário medir" (medir o jejum) é a armadilha do capítulo.
  ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'Diabetes'],
  ['quanta NPH comecar para prednisona 40 mg em paciente de 80 kg?', 'Diabetes'],
  ['esquema basal-bolus para paciente em dexametasona: como dividir?', 'Diabetes'],
  ['NPH com prednisona em reducao: como ajustar a insulina no desmame?', 'Diabetes'],

  // O EIXO ADRENAL é o outro prato da balança: não pode quebrar para o diabetes
  // ganhar. Estas quatro são as que a promoção do achado glicêmico ameaçava.
  ['em corticoide cronico, glicemia normal exclui supressao do eixo?', 'Adrenal'],
  ['paciente em insulina e prednisona 5 mg: ja posso dosar o cortisol matinal?', 'Adrenal'],
  ['posso acelerar o desmame do corticoide se o paciente esta bem?', 'Adrenal'],
  ['teste de tolerancia a insulina para avaliar o eixo hipofise-adrenal', 'Adrenal'],

  // Esporte só existe na INTERSEÇÃO com diabetes, e a promoção é condicional.
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'Endocrinologia do Esporte'],
  ['adolescente com diabetes tipo 1, futebol a tarde, hipoglicemia noturna', 'Endocrinologia do Esporte'],
  ['quanto reduzir a basal para o exercicio no diabetes tipo 1', 'Endocrinologia do Esporte'],
  ['durante o exercicio aerobico prolongado', 'Endocrinologia do Esporte'],
  // …e as condições da promoção, uma sentinela para cada:
  ['maratonista com hipotireoidismo', 'Tireoide'],                       // topo ≠ Diabetes
  ['atleta com TSH de 8: trato?', 'Tireoide'],                           // idem
  ['prolactinoma em quem faz treino resistido', 'Neuroendocrinologia'],  // idem
  ['osteoporose grave: libero o exercicio resistido?', 'Osteometabolismo'],
  ['mulher com DM1 e osteoporose que faz musculacao: bisfosfonato?', 'Osteometabolismo'], // 3 áreas
  ['DM1 em cetoacidose apos treino intenso', 'Diabetes'],                // outro tema diabetológico
  ['DM1 em uso de dapagliflozina que treina: risco de cetoacidose', 'Diabetes'],
  ['pre-diabetes: exercicio previne a progressao?', 'Diabetes'],

  // Prolactinoma: a tríade clássica caía em Feminina porque `amenorreia`(3010)
  // vencia `prolactina`, que é ACHADO (1010).
  ['prolactina de 90 com amenorreia e galactorreia', 'Neuroendocrinologia'],
  ['galactorreia isolada com prolactina normal', 'Neuroendocrinologia'],
  ['amenorreia secundaria em atleta', 'Endocrinologia Feminina'],
  ['atleta amenorreica com baixa disponibilidade energetica', 'Endocrinologia Feminina'],

  // Sentinelas de outras áreas — o achado glicêmico não pode sequestrá-las.
  ['hiperglicemia em paciente com acromegalia', 'Neuroendocrinologia'],
  ['obeso em insulina: indico cirurgia bariatrica?', 'Obesidade'],
  ['hipoglicemia pos-prandial dois anos apos bypass gastrico', 'Obesidade'],
  ['paciente em insulina com nodulo tireoidiano de 2 cm', 'Tireoide'],
  ['tempestade tireoidiana com Burch-Wartofsky 55', 'Tireoide'],
  ['crise adrenal: dose de hidrocortisona', 'Adrenal'],
  ['LDL 190 sem doenca cardiovascular: estatina de alta potencia?', 'Lípides'],
  ['hiponatremia de 118 com osmolalidade urinaria alta', 'Endocrinopatias'],
  ['craniofaringioma com obesidade hipotalamica apos cirurgia', 'Neuroendocrinologia'],
  ['etilista cronico, dor abdominal e anion gap alto: o que penso?', 'Diabetes'],
];

for (const [pergunta, esperado] of CAMINHO) {
  const veio = deep.canonArea(pergunta) || '(vazio)';
  ok(veio === esperado, `"${pergunta}" → esperado ${esperado}, veio ${veio}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHEGADA — o bloco devolvido contém mesmo o assunto?
// ─────────────────────────────────────────────────────────────────────────────
// Rotear certo e receber o bloco errado é falha silenciosa: a IA responde com
// conteúdo da área certa e do assunto errado, sem nenhum sinal.
const CHEGADA = [
  ['EHH em idoso com glicemia 900', 'hiperosmolar'],
  ['paciente em corticoide em dose alta: em que horario medir a glicemia?', 'corticoide'],
  ['cetoacidose alcoolica em paciente sem diabetes: preciso de insulina?', 'alcool'],
  ['osteoporose refrataria com fosfatase alcalina baixa: posso dar bisfosfonato?', 'bisfosfonato'],
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'exerc'],
];

for (const [pergunta, marca] of CHEGADA) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, 120000, pergunta) : '';
  ok(txt.toLowerCase().includes(marca),
    `"${pergunta}" roteia para ${area || '(vazio)'} mas o bloco (${(txt.length / 1000).toFixed(0)}k) `
    + `NÃO contém "${marca}" — área certa, assunto errado`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUAL BLOCO VEM PRIMEIRO — a peneira mais fina das três
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ ESTE BLOCO EXISTE PORQUE O TESTE ACIMA NÃO BASTOU. Consertei uma cegueira
// real do `deepFor` (o nome da área era removido como SUBSTRING, e
// "pre-diabetes" virava "pre-", morrendo no filtro de 4 letras), reintroduzi o
// defeito por mutação para conferir a rede — e as 46 medições acima passaram
// alegremente. Peneira que não pega o defeito que acabou de ser consertado não
// é rede, é enfeite.
//
// O que discrimina é a ORDEM. Diabetes tem 232k de conteúdo contra teto de
// 120k, então o que importa não é o bloco existir, é ele ser escolhido. Com a
// cegueira, "Pré-diabetes pode reverter sozinho?" devolvia o bloco de
// hiperglicemia por CORTICOIDE em primeiro e o de pré-diabetes sumia inteiro.
const PRIMEIRO = [
  ['Pre-diabetes pode reverter sozinho?', 'pré-diabetes'],
  ['Como confirmo prediabetes?', 'pré-diabetes'],
  ['paciente com CAD e pH 7,1: quando comeco a insulina?', 'cetoacidose'],
  ['maratonista com diabetes tipo 1: alvo de glicose antes do treino', 'exerc'],
];

for (const [pergunta, esperado] of PRIMEIRO) {
  const area = deep.canonArea(pergunta);
  const txt = area ? deep.deepFor(area, 120000, pergunta) : '';
  const cab = ((txt.match(/• ([^\n]{0,80})/) || [])[1] || '(nenhum bloco)').toLowerCase();
  ok(cab.includes(esperado),
    `"${pergunta}" → o PRIMEIRO bloco é "${cab.slice(0, 56)}", esperado um que contenha "${esperado}"`);
}

if (falhas) {
  console.error(`\n✗ caminho clínico: ${falhas} falha(s) de ${CAMINHO.length + CHEGADA.length + PRIMEIRO.length} medição(ões).`);
  process.exit(1);
}
console.log(`✓ caminho clínico: ${CAMINHO.length} roteamento(s) + ${CHEGADA.length} chegada(s) + ${PRIMEIRO.length} ordem(ns)`);
