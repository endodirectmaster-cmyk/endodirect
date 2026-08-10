#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// PROVA COPIADA: fármaco nomeado na afirmação que não está na citação dela.
//
// O defeito que criou esta peneira (GIOP/ACR 2022, achado pela auditoria
// adversarial em 09/08/2026): QUATRO fatos carregavam a MESMA citação, byte a
// byte — mesmo offset, mesmo tamanho, mesmo `cit_sha`. A fatia provava o
// primeiro deles e mais nada; os outros três afirmavam preferência de fármaco
// ("PTH/PTHrP em vez de antirreabsortivos", "denosumabe ou PTH/PTHrP em vez de
// bisfosfonato") cujas frases ficavam 100 a 400 caracteres ADIANTE, na mesma
// célula da tabela.
//
// ⚠️ O `verifica-extracao.js` passou VERDE nos três. A peneira dele é de
// NÚMEROS, e o único número dessas afirmações era "40" — que está na fatia,
// porque a fatia começa no cabeçalho "adults ≥40 years". Prova fabricada com
// número emprestado do cabeçalho.
//
// ── POR QUE O ESCOPO É "CITAÇÃO COMPARTILHADA", E NÃO A BASE INTEIRA ─────────
// Medido sobre os 6.197 fatos antes de escrever isto:
//   · fármaco na afirmação e ausente da citação, em QUALQUER fato → 176 (2,8%).
//     A maioria é legítima: a fonte escreve a CLASSE ("GLP-1 RA", "oral BP") e o
//     fato nomeia o agente que o cabeçalho da tabela dava. Alarme assim vira
//     paisagem — é técnica de auditor, e está no brief.
//   · o mesmo, restrito a fatos cuja `cit` é IDÊNTICA à de outro fato do mesmo
//     extrato → **2 candidatos**, os dois pela abreviatura da própria diretriz
//     (`rom` por romosozumabe). Com as abreviaturas aceitas: **ZERO**.
// E na versão PRÉ-auditoria do GIOP a peneira dispara nos dois fatos certos.
//
// Citação idêntica é a assinatura do copia-e-cola, e é por isso que o escopo é
// esse: onde o falso positivo cai de 2,8% para 0%, falhar volta a significar
// alguma coisa.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const { bases } = require('../lib/citacao.js');

const DIR = path.join(__dirname, '..', 'scratchpad', 'acervo', 'extratos');
const TXT = path.join(__dirname, '..', 'scratchpad', 'acervo', 'textos');

const deacc = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Radicais que são o MESMO prefixo em português e em inglês, para fármacos em
// que trocar o agente muda a prescrição. `alts` cobre o par quando o prefixo
// não coincide; `sigla` é a abreviatura que as diretrizes usam em tabela.
const FARMACOS = [
  { alts: ['romosozumab'], sigla: 'rom' },
  { alts: ['denosumab'], sigla: 'den' },
  { alts: ['raloxifen'], sigla: 'ral' },
  { alts: ['teriparatid'], sigla: 'ter' },
  { alts: ['abaloparatid'], sigla: 'abl' },
  { alts: ['cinacalcet'] },
  { alts: ['alendronat'] }, { alts: ['risedronat'] }, { alts: ['ibandronat'] },
  { alts: ['zoledron'] }, { alts: ['pamidronat'] },
  { alts: ['bisfosfonat', 'bisphosphonat'], sigla: 'bp' },
  { alts: ['calcitriol'] },
  { alts: ['semaglutid'] }, { alts: ['liraglutid'] }, { alts: ['tirzepatid'] },
  { alts: ['dulaglutid'] }, { alts: ['metformin'] },
  { alts: ['empagliflozin'] }, { alts: ['dapagliflozin'] },
  { alts: ['levotiroxin', 'levothyroxin'] },
  { alts: ['metimazol', 'methimazol'] },
  { alts: ['propiltiouracil', 'propylthiouracil'] },
  { alts: ['hidrocortison', 'hydrocortison'] }, { alts: ['fludrocortison'] },
  { alts: ['cabergolin'] }, { alts: ['octreotid'] }, { alts: ['lanreotid'] },
  { alts: ['pasireotid'] }, { alts: ['tolvaptan'] },
];

// Sigla precisa de fronteira de palavra: `rom` casa dentro de "from" e `den`
// dentro de "sudden". Mesma lição que `bordas()` do roteamento aprendeu com
// `cad` casando em "década".
const temSigla = (texto, sigla) =>
  !!sigla && new RegExp('(^|[^a-z0-9])' + sigla + '([^a-z0-9]|$)').test(texto);

const falhas = [];
let conferidos = 0;
let grupos = 0;

for (const fn of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const id = fn.replace(/\.json$/, '');
  const tp = path.join(TXT, id + '.txt');
  if (!fs.existsSync(tp)) continue; // texto-fonte é gitignored; sem ele não dá para conferir
  let bs;
  try { bs = bases(fs.readFileSync(tp, 'utf8')); } catch (e) { continue; }

  const extrato = JSON.parse(fs.readFileSync(path.join(DIR, fn), 'utf8'));
  const fatos = extrato.fatos || [];

  // agrupa por citação byte-a-byte idêntica
  const porCit = new Map();
  fatos.forEach((f, i) => {
    if (!f || !Array.isArray(f.cit) || !f.cit.length) return;
    const k = JSON.stringify(f.cit);
    if (!porCit.has(k)) porCit.set(k, []);
    porCit.get(k).push(i);
  });

  for (const [k, idxs] of porCit) {
    if (idxs.length < 2) continue;
    grupos++;
    const cit = JSON.parse(k);
    const prova = deacc(cit.map((c) => (bs[c[0]] || '').slice(c[1], c[1] + c[2])).join(' '));
    for (const i of idxs) {
      conferidos++;
      const af = deacc(fatos[i].afirmacao);
      for (const d of FARMACOS) {
        if (!d.alts.some((a) => af.indexOf(a) >= 0)) continue;
        if (d.alts.some((a) => prova.indexOf(a) >= 0)) continue;
        if (temSigla(prova, d.sigla)) continue;
        falhas.push({
          id, i, farmaco: d.alts[0], n: idxs.length,
          af: String(fatos[i].afirmacao).slice(0, 120),
        });
        break;
      }
    }
  }
}

if (falhas.length) {
  console.error('\n✖ PROVA COPIADA: fármaco nomeado na afirmação e AUSENTE da citação dela.\n');
  for (const f of falhas) {
    console.error(`  · ${f.id} idx ${f.i} — "${f.farmaco}" não está na citação`);
    console.error(`    (esta citação é compartilhada por ${f.n} fatos deste extrato)`);
    console.error(`    ${f.af}…`);
  }
  console.error('\n  Citação repetida byte a byte entre fatos é a assinatura do copia-e-cola:');
  console.error('  a fatia prova UM deles, e os outros ficam sem lastro. As saídas legítimas');
  console.error('  são as mesmas de sempre — estender a citação até a frase que prova (se o');
  console.error('  buraco couber em GAP_MAX=400), separar em fato próprio, ou encolher a');
  console.error('  afirmação. NÃO basta trocar o texto: conserte a CITAÇÃO.\n');
  process.exit(1);
}

console.log(`✓ fármaco na citação: ${conferidos} fato(s) de ${grupos} grupo(s) com citação ` +
            'compartilhada conferido(s), nenhum fármaco sem lastro.');
