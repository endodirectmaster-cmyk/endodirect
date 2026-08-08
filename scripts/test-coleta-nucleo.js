#!/usr/bin/env node
/* Entrada de núcleo com valor de exame carrega a CONDIÇÃO DE COLETA?
 *
 * POR QUE ISTO EXISTE. A regra é do professor e estava no cofre sem nenhuma
 * guarda automática: **um valor de exame sem a condição em que foi colhido é
 * outro número.** Testosterona de 300 às 7 h em jejum não é a mesma coisa que
 * 300 às 16 h. Cortisol de 5 µg/dL de manhã não é o mesmo de meia-noite.
 * Prolactina colhida sob estresse de punção não é prolactina.
 *
 * O núcleo vai em TODA chamada de IA, então uma entrada que manda pedir um exame
 * sem dizer como colhê-lo ensina o erro em toda geração da plataforma.
 *
 * O MODELO CERTO já está no núcleo, na entrada de hiperaldosteronismo:
 *   "pela manhã, sentado, SEM restringir sódio; dosar potássio junto
 *    (hipocalemia reduz a aldosterona e dá falso-negativo)"
 * — condição E o porquê dela.
 *
 * ⚠️ COMO ESTA PENEIRA PODE MENTIR, e o que fiz contra isso. A primeira versão
 * marcava 11 entradas e 7 eram lixo: ela casava a palavra "insulina" em
 * "prescrever glucagon para todos em insulina" (fármaco, não exame) e "GH" em
 * "tratar com GH". Peneira que grita demais é ignorada tão depressa quanto
 * peneira cega. O filtro passou a exigir CONTEXTO DE DOSAGEM antes do analito
 * (dosar, colher, rastrear, "diagnóstico bioquímico por"…).
 *
 * E ela é conferida por CONTROLE POSITIVO: as entradas de hiperaldosteronismo e
 * de incidentaloma adrenal têm condição declarada e NÃO podem ser marcadas. Sem
 * isso eu não saberia distinguir "peneira limpa" de "peneira cega" — que é o
 * defeito que já cegou três scripts deste repositório.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const ini = s.indexOf('CLINICAL_GUIDELINES');
const fim = s.indexOf('__ENDODIRECT_SYS_SPLIT', ini);
const entradas = s.slice(ini, fim > 0 ? fim : ini + 400000).split(/•\s/).slice(1);

// Só conta como EXAME quando o analito vem depois de um verbo de dosagem —
// é isso que separa "dosar cortisol" de "tratar com hidrocortisona".
const EXAME = /(dosar|dosagem|colher|coleta|colhid|medir|rastrei|diagn[oó]stico bioqu[ií]mico|n[ií]vel de|niveis de|concentra[cç][aã]o)/i;

// Analito → marcas aceitas de condição de coleta.
const ANALITO = {
  'testosterona': /(jejum|manh[aã]|7[–\-]10|matinal)/i,
  'cortisol': /(manh[aã]|matinal|meia[- ]noite|noturn|salivar|24 h|dexametasona)/i,
  'prolactina': /(repouso|sem estresse|pun[cç]|manh[aã])/i,
  'aldosterona': /(sentad|manh[aã]|s[oó]dio|postur)/i,
  'renina': /(sentad|manh[aã]|s[oó]dio|postur)/i,
  'metanefrina': /(postur|deitad|supin|dec[uú]bito|dieta|30 min|20 min|repouso|sentad)/i,
  '17-hidroxiprogesterona': /(manh[aã]|matinal|folicular)/i,
};

// ⚠️ LACUNA CONHECIDA, registrada em código para não ser esquecida nem
// silenciada. A entrada de feocromocitoma manda pedir metanefrinas plasmáticas
// livres e não diz em que posição colher — e a posição é a causa clássica de
// FALSO-POSITIVO desse rastreio, que manda o paciente para tomografia e teste
// genético à toa.
//
// Não consertei porque não tenho como embasar: **não há nenhum artigo de
// feocromocitoma no acervo** (conferido em toda a base profunda). Escrever a
// condição de memória seria exatamente o que este projeto proíbe. Sai daqui
// quando o professor mandar o material — e aí a linha abaixo some.
const PENDENTES = {
  'metanefrina': 'sem artigo de feocromocitoma no acervo para embasar a condição de coleta',
};

let emDosagem = 0, controles = 0;
const falhas = [], pendentes = [];

// ⚠️ A CONDIÇÃO TEM DE ESTAR PERTO DO ANALITO — e isto foi aprendido por
// mutação, não por raciocínio. A primeira versão procurava a marca em QUALQUER
// lugar da entrada, e as entradas têm até 2 000 caracteres. Apaguei "pela manhã,
// sentado, SEM restringir sódio" do hiperaldosteronismo para ver a peneira
// reprovar — e ela PASSOU, porque a palavra "sódio" reaparecia 900 caracteres
// adiante, em "restrição de sódio (<5 g de sal/dia)", que é TRATAMENTO e não
// coleta. Distância importa: condição de coleta que não está ao lado do exame
// não é condição de coleta, é coincidência de vocabulário.
const JANELA = 130;

entradas.forEach((e, k) => {
  const t = e.replace(/\\n/g, ' ').replace(/\s+/g, ' ');
  for (const [analito, cond] of Object.entries(ANALITO)) {
    const m = t.match(new RegExp('(.{0,70})(' + analito + ')', 'i'));
    if (!m || !EXAME.test(m[1])) continue;
    emDosagem++;
    const at = m.index + m[1].length;
    const perto = t.slice(Math.max(0, at - JANELA), at + analito.length + JANELA);
    if (cond.test(perto)) { controles++; break; }
    (PENDENTES[analito] ? pendentes : falhas).push(
      `  #${k + 1} [${analito}] ${t.slice(0, 62)}…`
    );
    break;
  }
});

console.log(`condição de coleta no núcleo: ${emDosagem} entrada(s) pedem exame sensível à coleta`);

// ⚠️ A TRAVA CONTRA A CEGUEIRA. Se nenhuma entrada casou, não é que o núcleo
// esteja perfeito — é que o formato mudou e a peneira parou de enxergar.
if (!emDosagem) {
  console.error('\n✗ NENHUMA entrada casou. Isto é cegueira da peneira, não limpeza do núcleo:');
  console.error('  provavelmente o formato do CLINICAL_GUIDELINES mudou. Conserte antes de confiar.');
  process.exit(1);
}
if (!controles) {
  console.error('\n✗ nenhum CONTROLE POSITIVO reconhecido. As entradas de hiperaldosteronismo e de');
  console.error('  incidentaloma adrenal declaram a coleta e têm de ser reconhecidas como corretas —');
  console.error('  sem isso não dá para distinguir peneira limpa de peneira cega.');
  process.exit(1);
}

if (pendentes.length) {
  console.log(`  (${pendentes.length} lacuna(s) conhecida(s), aguardando material:`);
  pendentes.forEach((p) => console.log(p));
  Object.entries(PENDENTES).forEach(([a, r]) => console.log(`     · ${a}: ${r}`));
  console.log('  )');
}

if (falhas.length) {
  console.error(`\n✗ ${falhas.length} entrada(s) mandam pedir exame sem dizer como colhê-lo:`);
  falhas.forEach((f) => console.error(f));
  console.error('\n  Um valor de exame sem a condição de coleta é outro número, e o núcleo vai');
  console.error('  em TODA chamada de IA. Modelo do que escrever está na entrada de');
  console.error('  hiperaldosteronismo: "pela manhã, sentado, SEM restringir sódio" — a');
  console.error('  condição E o porquê dela.');
  process.exit(1);
}
console.log(`✓ ${controles} com condição declarada, nenhuma pendência nova.`);
