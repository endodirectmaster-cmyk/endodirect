#!/usr/bin/env node
/* Caractere de CONTROLE no texto-fonte — o símbolo que virou byte invisível.
 *
 * POR QUE ISTO EXISTE (08/08/2026, auditoria do pré-diabetes). O extrator de PDF
 * trocou `≥` por U+0002 em oito lugares de um artigo. O efeito no extrato:
 *
 *    "IMC de 25,0 a 29,9 para sobrepeso e 30 para obesidade"
 *
 * quando a fonte diz **≥30**. O corte virou PONTO em vez de piso — quem tem IMC
 * 34 deixa de ter obesidade pela leitura do fato. O mesmo apagou o `≥` de
 * `≥150 min/semana` de atividade física.
 *
 * ⚠️ POR QUE NENHUMA PENEIRA PEGAVA: `norm()` em `lib/citacao.js` normaliza
 * aspas, travessões e espaços, mas não toca em caractere de controle. A citação
 * resolve, o hash confere, o verificador aprova — e o operador de comparação
 * simplesmente não está lá. É primo do problema da âncora ambígua: a prova está
 * íntegra, e mesmo assim diz outra coisa.
 *
 * Este script não conserta: conserto exige ler o PDF e decidir QUAL símbolo era
 * (≥, ≤, ±, →), e isso é leitura humana. Ele mostra onde olhar, com o contexto
 * ao redor de cada ocorrência, priorizando as que estão coladas em número —
 * que são as que mudam conduta.
 *
 * Uso:
 *   node scripts/confere-controle.js            → resumo por artigo
 *   node scripts/confere-controle.js --detalhe  → contexto de cada ocorrência
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DETALHE = process.argv.includes('--detalhe');
const DIR = path.join(RAIZ, 'scratchpad', 'acervo', 'textos');

if (!fs.existsSync(DIR)) {
  console.log('(sem textos-fonte locais — `scratchpad/acervo/textos/` é gitignored)');
  process.exit(0);
}

// Controle C0/C1, menos os três que são formatação legítima (tab, LF, CR).
const eControle = (c) => {
  const n = c.charCodeAt(0);
  return (n < 32 && n !== 9 && n !== 10 && n !== 13) || (n >= 127 && n <= 159);
};

const linhas = [];
let totalGeral = 0, totalPerto = 0;

for (const arq of fs.readdirSync(DIR).filter((f) => f.endsWith('.txt'))) {
  const s = fs.readFileSync(path.join(DIR, arq), 'utf8');
  const achados = [];
  for (let i = 0; i < s.length; i++) {
    if (!eControle(s[i])) continue;
    const antes = s.slice(Math.max(0, i - 40), i);
    const depois = s.slice(i + 1, i + 40);
    // ⚠️ O QUE IMPORTA É ESTAR COLADO EM NÚMERO. Controle no meio de prosa é
    // sujeira; controle antes de um número é um OPERADOR que sumiu, e operador
    // que some inverte o sentido de um corte diagnóstico.
    const pertoDeNumero = /^\s*[<>=]?\s*\d/.test(depois) || /\d\s*$/.test(antes);
    achados.push({
      cod: 'U+' + s.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0'),
      pertoDeNumero,
      contexto: (antes + '␦' + depois).replace(/\s+/g, ' ')
    });
  }
  if (!achados.length) continue;
  const perto = achados.filter((a) => a.pertoDeNumero).length;
  totalGeral += achados.length; totalPerto += perto;
  linhas.push({ arq, n: achados.length, perto, achados });
}

linhas.sort((a, b) => b.perto - a.perto || b.n - a.n);

console.log('CARACTERE DE CONTROLE NO TEXTO-FONTE (o símbolo que virou byte invisível)\n');
console.log('  ␦ marca a posição. "perto de número" é o que muda conduta: um ≥ que');
console.log('  some transforma um PISO diagnóstico num PONTO.\n');
console.log(' PERTO   total  artigo');
for (const l of linhas) {
  console.log(`${l.perto ? '⚠️' : '  '}${String(l.perto).padStart(4)}  ${String(l.n).padStart(6)}  ${l.arq.slice(0, 26)}`);
  if (DETALHE) {
    for (const a of l.achados.filter((x) => x.pertoDeNumero).slice(0, 10)) {
      console.log(`        ${a.cod}  …${a.contexto}…`);
    }
  }
}

if (!linhas.length) {
  console.log('\n✓ nenhum caractere de controle nos textos-fonte.');
} else {
  console.log(`\n${totalGeral} caractere(s) de controle em ${linhas.length} artigo(s), ${totalPerto} colado(s) em número.`);
  console.log('\n⚠️ AVISO, não reprovação — o conserto exige abrir o PDF e decidir QUAL');
  console.log('   símbolo era (≥, ≤, ±, →), e isso é leitura humana. Nenhuma peneira pega');
  console.log('   isto sozinha: a citação resolve, o hash confere, o verificador aprova, e');
  console.log('   o operador de comparação simplesmente não está lá.');
  console.log('   Rode com --detalhe para ver o contexto de cada um.');
}
