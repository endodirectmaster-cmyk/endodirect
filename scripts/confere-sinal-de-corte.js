#!/usr/bin/env node
/* O PDF come o sinal de menos, e o corte diagnóstico inverte de lado.
 *
 * ── O CASO (09/08/2026) ─────────────────────────────────────────────────────
 * A auditoria adversarial do Manual Brasileiro de Osteoporose achou um fato
 * publicando **`escore T ≤ 2,5`** — sem o menos. O quadro do capítulo 1 sai do
 * PDF assim (offset 26371 do texto extraído): o hífen do `−2,5` se perde na
 * conversão, junto com metade da pontuação da tabela.
 *
 * Recuperado sozinho, esse fato **diagnostica osteoporose em quem tem escore T
 * zero ou positivo** — isto é, em todo mundo com densidade normal — e manda
 * tratar com antirreabsortivo. É o defeito de maior consequência de prescrição
 * que esta base já produziu.
 *
 * ⚠️ E O EXTRATOR SABIA DO RISCO: ele declarou, em `extracao`, ter deixado de
 * publicar DOIS outros escores T do capítulo 8 exatamente porque tinham perdido
 * o sinal. Cuidou de dois, e o terceiro passou. **Cuidado manual não escala —
 * por isso virou peneira.**
 *
 * ── POR QUE ESTA VIRA CI E A "CABEÇA PERDIDA" NÃO VIROU ─────────────────────
 * No mesmo dia, medi a varredura de cabeça-de-citação-no-meio-da-frase sobre as
 * 6.625 citações da base: ~85% de falso positivo, e o gatilho de limiar acertou
 * 0 de 3. Aquilo ficou como TÉCNICA no brief do auditor, não como guarda —
 * alarme ruidoso vira paisagem.
 *
 * Esta é o oposto: **falso positivo essencialmente nulo**. Corte diagnóstico de
 * escore T ou Z com `≤`/`<` é negativo por definição (a OMS define osteoporose
 * como T ≤ −2,5; osteopenia entre −1 e −2,5). Um `≤` seguido de número POSITIVO
 * é sempre erro de extração, nunca conteúdo legítimo.
 *
 * ⚠️ NÃO generalize esta peneira para "todo número negativo". Ela é estreita de
 * propósito: só sabe de escore T e escore Z, onde a direção é conhecida. Um
 * verificador que tenta adivinhar o sinal de qualquer número volta a ser ruído.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'scratchpad', 'acervo', 'extratos');

// `escore T` / `escore Z` / `T-score` / `Z-score`, seguido de ≤ ou <, e então um
// número SEM sinal de menos. O trecho do meio é curto para não atravessar frase.
const CORTE = /(escore\s*[tz]|[tz]-?\s*score)([^.;:\n]{0,30}?)([≤<]=?)\s*(-|−|–|—)?\s*(\d+[,.]?\d*)/gi;

const arquivos = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];
const problemas = [];
let conferidos = 0;

for (const nome of arquivos) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(DIR, nome), 'utf8')); } catch (e) { continue; }
  (j.fatos || []).forEach((f, i) => {
    const a = String(f.afirmacao || '');
    let m;
    const re = new RegExp(CORTE.source, 'gi');
    while ((m = re.exec(a))) {
      conferidos++;
      const temSinal = !!m[4];
      const valor = parseFloat(String(m[5]).replace(',', '.'));
      // `≤ 0` e afins não existem como corte; qualquer positivo sem menos é erro.
      if (!temSinal && valor > 0) {
        problemas.push({ nome, i, trecho: m[0].replace(/\s+/g, ' '),
          volta: a.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, ' ') });
      }
    }
  });
}

if (problemas.length) {
  console.error(`\n✗ ${problemas.length} corte(s) de escore T/Z SEM o sinal de menos.`);
  console.error('  O PDF come o hífen na conversão, e o corte troca de lado: "≤ 2,5" diagnostica');
  console.error('  osteoporose em densidade NORMAL e manda tratar com antirreabsortivo.\n');
  for (const p of problemas) {
    console.error(`  ${p.nome}  fato #${p.i}`);
    console.error(`     achado: "${p.trecho}"`);
    console.error(`     …${p.volta}…`);
  }
  console.error('\n  Confira o valor no texto-fonte. Se a fonte também perdeu o sinal, NÃO o');
  console.error('  invente: encolha a afirmação e aponte para onde o corte está citado íntegro.');
  process.exit(1);
}

console.log(`✓ sinal dos cortes: ${conferidos} corte(s) de escore T/Z conferido(s), nenhum sem o menos.`);
