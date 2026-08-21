#!/usr/bin/env node
/* A citação prova o trecho CERTO, ou só um trecho igual a ele?
 *
 * POR QUE ISTO EXISTE (08/08/2026). O auditor do artigo de exercício no DM1
 * achou dois fatos PEDIÁTRICOS cuja citação apontava para a tabela de ADULTO —
 * e o hash conferia, e `verifica-extracao.js` aprovava. Não havia erro de
 * digitação: o texto das duas tabelas é literalmente igual em várias linhas.
 *
 * A CAUSA É ESTRUTURAL, e vale para a base inteira. `lib/citacao.js › referenciar`
 * localiza a citação com `b.indexOf(alvo, pos)` começando em `pos = 0`, ou seja,
 * **ancora sempre na PRIMEIRA ocorrência do texto**. O extrator original tinha a
 * trava certa (um marco de desambiguação, `cut(ini, fim, apos)`, com o comentário
 * explícito de que "as tabelas de adulto e de criança repetem linhas inteiras"),
 * e a migração para offset a desfez EM SILÊNCIO. Como no artigo a tabela de
 * adulto vem antes, todo texto repetido migrou para a de adulto.
 *
 * ⚠️ POR QUE O HASH NÃO PEGA: `cit_sha` é o hash do texto RESOLVIDO. Se o trecho
 * aparece duas vezes idênticas, as duas ocorrências resolvem para o mesmo texto e
 * portanto para o mesmo hash. O hash prova que o texto não foi adulterado; ele
 * não prova, e nunca provou, que veio do LUGAR certo.
 *
 * O que este script mede: para cada fato, quantas vezes o texto resolvido aparece
 * na base em que ele foi ancorado. Mais de uma → a âncora é AMBÍGUA, e o offset
 * gravado pode ser o de outra ocorrência.
 *
 * ⚠️ AMBÍGUO NÃO É ERRADO. Na maioria dos casos a primeira ocorrência é mesmo a
 * certa. Por isso isto AVISA e não reprova — a decisão de qual ocorrência vale é
 * clínica (a linha é da tabela pediátrica ou da de adulto?) e nenhum código
 * resolve sozinho. O conserto, quando o caso é real, é estender a citação até
 * incluir um trecho ÚNICO.
 *
 * Uso:
 *   node scripts/confere-ancoragem.js              → resumo por extrato
 *   node scripts/confere-ancoragem.js --detalhe    → lista fato a fato
 *   node scripts/confere-ancoragem.js --extrato 1x → só um extrato (prefixo do id)
 */
const fs = require('fs');
const path = require('path');
const C = require('../lib/citacao');

const RAIZ = path.join(__dirname, '..');
const arg = (n, p) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : p; };
const DETALHE = process.argv.includes('--detalhe');
const SO = arg('--extrato', '');

const DIR = path.join(RAIZ, 'scratchpad', 'acervo');
const dirExt = path.join(DIR, 'extratos');
if (!fs.existsSync(dirExt)) { console.error('✗ não existe ' + dirExt); process.exit(1); }

// ⚠️ TRIAGEM: nem toda ambiguidade tem o mesmo peso, e medi a diferença.
//
// As 53 ambíguas da Diretriz de Dislipidemias são recomendações impressas DUAS
// VEZES no mesmo documento (uma no quadro-resumo, outra no corpo) — texto
// idêntico, sentido idêntico, ancorar numa ou noutra dá no mesmo. Benigno.
//
// O caso que fez estrago é outro: o MESMO texto numa tabela de ADULTO e numa de
// CRIANÇA, onde a coluna decide o sentido. Ali escolher a ocorrência errada
// transforma dose pediátrica em dose de adulto. O que separa os dois casos é a
// afirmação falar de população: se o fato se diz pediátrico e o texto que o
// prova também existe na seção de adulto, é exatamente o defeito conhecido.
//
// ⚠️ DOIS DEFEITOS NO MESMO RADICAL (2026-08-21). O radical de grávida
// e o de gravidade são o mesmo até a 6ª letra, e "gravidade" é palavra corrente
// em texto clínico — escala de gravidade, gravidade do quadro. Medido no acervo
// inteiro: 80 afirmações casavam SÓ por isso, nenhuma sobre gestação, enquanto
// as 1.147 legítimas continuam casando com o lookahead. Era acusação falsa, e
// acusação falsa em guarda de CI ensina a ignorar a guarda.
//
// E o buraco oposto, que o teste de mutação achou: `gravid` sem acento NÃO casa
// "grávida" — que é como a palavra é escrita. A guarda deixava passar o caso
// que ela existe para pegar. Por isso `gr[áa]vid`, e não só o lookahead.
const POPULACAO = /\b(crianc|criança|pediatr|adolescent|adult|gestant|gr[áa]vid(?!ade)|idos|neonat|lactent)/i;

// Conta ocorrências sem regex (o texto tem metacaracteres a rodo).
function ocorrencias(hay, alvo) {
  if (!alvo) return 0;
  let n = 0, i = 0;
  while ((i = hay.indexOf(alvo, i)) >= 0) { n++; i += alvo.length; }
  return n;
}

const linhas = [];
let semTexto = 0, medidos = 0, conferidos = 0;

for (const arq of fs.readdirSync(dirExt).filter((f) => f.endsWith('.json'))) {
  if (SO && !arq.startsWith(SO)) continue;
  const e = JSON.parse(fs.readFileSync(path.join(dirExt, arq), 'utf8'));
  const pTxt = path.join(DIR, 'textos', String(e.fileId || '') + '.txt');
  if (!fs.existsSync(pTxt)) { semTexto++; continue; }
  const bs = C.bases(fs.readFileSync(pTxt, 'utf8'));

  const ambiguos = [];
  for (let i = 0; i < (e.fatos || []).length; i++) {
    const f = e.fatos[i];
    if (!Array.isArray(f.cit) || !f.cit.length) continue;
    medidos++;
    // ⚠️ PENEIRA TEM DE CONVERGIR. Sem esta saída, um fato cuja âncora já foi
    // conferida por gente seria acusado para sempre, e peneira que acusa o que
    // já se sabe correto acaba ignorada — que é como uma peneira morre.
    // `cit_ancora_ok` só pode ser escrito depois de abrir as duas ocorrências e
    // decidir qual vale; é registro de conferência, não de conveniência.
    if (f.cit_ancora_ok) { conferidos++; continue; }
    // ⚠️ A AMBIGUIDADE É DA CITAÇÃO INTEIRA, NÃO DE CADA PEDAÇO.
    //
    // Minha primeira versão contava ocorrências pedaço a pedaço e acusou o fato
    // #29 da diretriz de obesidade, cujo 1º pedaço é `é recomendada a redução
    // sustentada de pelo menos` — que aparece duas vezes, uma seguida de **5%**
    // e outra de **10%**. Parecia o achado perfeito. Só que a citação tem DOIS
    // pedaços com elisão declarada, e o segundo traz "5% do peso… risco dascv
    // moderado": junta, ela identifica um lugar só e prova o número.
    //
    // Contar pedaço isolado super-relata, e peneira que grita demais é ignorada
    // tão depressa quanto peneira cega. O que vale é quantos lugares do artigo
    // aceitam a SEQUÊNCIA inteira — pedaços em ordem, cada um depois do anterior
    // e dentro do mesmo buraco máximo que o verificador tolera.
    const GAP_MAX = 400;
    const base0 = f.cit[0][0] | 0;
    const b = bs[base0];
    let pior = 0, ondeCai = null;
    if (b && f.cit.every((c) => (c[0] | 0) === base0 && c[1] + c[2] <= b.length)) {
      const pedacos = f.cit.map(([, o, l]) => b.slice(o, o + l));
      // Cada começo possível do 1º pedaço vira um candidato; a sequência precisa
      // fechar inteira a partir dele para o candidato contar.
      let ini = 0, j;
      const inicios = [];
      while ((j = b.indexOf(pedacos[0], ini)) >= 0) { inicios.push(j); ini = j + 1; }
      for (const start of inicios) {
        let pos = start + pedacos[0].length, ok = true;
        for (let k = 1; k < pedacos.length; k++) {
          const q = b.indexOf(pedacos[k], pos);
          if (q < 0 || q - pos > GAP_MAX) { ok = false; break; }
          pos = q + pedacos[k].length;
        }
        if (ok) pior++;
      }
      if (pior > 1) ondeCai = { trecho: pedacos[0], n: pior, off: f.cit[0][1], base: base0, primeiro: inicios[0] };
    }
    if (pior > 1) {
      // ⚠️ O SINAL QUE IMPORTA: a âncora gravada é a PRIMEIRA ocorrência? Se for,
      // ela pode ser fruto do `indexOf(…, 0)` e não de escolha deliberada. Se o
      // offset aponta para uma ocorrência POSTERIOR, alguém já desambiguou.
      const primeira = ondeCai.primeiro;
      const afirmacao = String(f.afirmacao || '').replace(/\s+/g, ' ');
      ambiguos.push({
        i: i + 1,
        n: ondeCai.n,
        naPrimeira: primeira === ondeCai.off,
        // Ambíguo E fala de população = o padrão exato do defeito conhecido.
        risco: POPULACAO.test(afirmacao) && primeira === ondeCai.off,
        afirmacao: afirmacao.slice(0, 90),
        trecho: ondeCai.trecho.replace(/\s+/g, ' ').slice(0, 70)
      });
    }
  }

  linhas.push({
    arq, titulo: String(e.titulo || e.tema || arq).replace(/\s+/g, ' ').slice(0, 46),
    total: (e.fatos || []).length, ambiguos
  });
}

linhas.sort((a, b) => b.ambiguos.length - a.ambiguos.length);

console.log('ÂNCORA AMBÍGUA — a citação prova o trecho certo, ou só um trecho igual?\n');
console.log('  Mais de uma ocorrência do MESMO texto na fonte significa que o offset');
console.log('  gravado pode ser o da outra. O `cit_sha` não pega isto: as duas');
console.log('  ocorrências resolvem para o mesmo texto e o mesmo hash.\n');
console.log(' RISCO  AMBÍG  1ª ocor.  fatos  artigo');

let totAmb = 0, totPrim = 0, totRisco = 0;
for (const l of linhas) {
  const naPrim = l.ambiguos.filter((x) => x.naPrimeira).length;
  const risco = l.ambiguos.filter((x) => x.risco).length;
  totAmb += l.ambiguos.length; totPrim += naPrim; totRisco += risco;
  const marca = risco ? '⚠️' : (l.ambiguos.length ? '  ' : '✓ ');
  console.log(`${marca}${String(risco || '').padStart(4)}  ${String(l.ambiguos.length).padStart(5)}  ${String(naPrim).padStart(8)}  ${String(l.total).padStart(5)}  ${l.titulo}`);
  if (DETALHE) {
    for (const x of l.ambiguos.slice(0, 12)) {
      console.log(`        #${x.i} · ${x.n}× na fonte · ${x.naPrimeira ? 'na 1ª (suspeito)' : 'em outra (já desambiguado)'}${x.risco ? ' · ⚠️ FALA DE POPULAÇÃO' : ''}`);
      console.log(`           afirma: ${x.afirmacao}`);
      console.log(`           trecho: "${x.trecho}…"`);
    }
    if (l.ambiguos.length > 12) console.log(`        … e mais ${l.ambiguos.length - 12}`);
  }
}

if (semTexto) console.log(`\n(${semTexto} extrato(s) sem texto-fonte local — não medidos)`);
console.log(`\n${medidos} citação(ões) por referência conferida(s) · ${totAmb} ambígua(s), ${totPrim} na 1ª ocorrência, ${totRisco} DE RISCO.`);
if (conferidos) console.log(`(${conferidos} já marcada(s) com cit_ancora_ok — âncora conferida por gente, fora da contagem)`);

if (!totAmb) {
  console.log('\n✓ nenhuma âncora ambígua: cada citação identifica um único trecho da fonte.');
} else if (!totRisco) {
  console.log('\n✓ nenhuma ambiguidade DE RISCO. As ambíguas são de texto repetido que');
  console.log('  significa o mesmo nos dois lugares — tipicamente a recomendação impressa');
  console.log('  no quadro-resumo e de novo no corpo. Ancorar numa ou noutra dá no mesmo.');
} else {
  // ⚠️ AS DE RISCO REPROVAM, e é de propósito. As ambíguas benignas (texto
  // repetido que significa o mesmo nos dois lugares) só avisam; mas fato que
  // FALA DE POPULAÇÃO e ancora na primeira ocorrência de um texto repetido é o
  // padrão exato que pôs dois fatos pediátricos citando a tabela de ADULTO —
  // com hash conferindo e o verificador aprovando. Hoje são zero; deixar que
  // volte a crescer em silêncio seria repetir a história das peneiras cegas.
  //
  // Saída para quem for consertar: abra as duas ocorrências, decida qual vale.
  // Se a âncora está certa, marque o fato com `cit_ancora_ok: true`. Se está
  // errada, reancore e estenda a citação até incluir um trecho ÚNICO.
  console.error(`\n✗ ${totRisco} âncora(s) DE RISCO: o fato fala de população (criança, adulto,`);
  console.error('  gestante) e o texto que o prova também existe noutro lugar do artigo,');
  console.error('  com a âncora na PRIMEIRA ocorrência. É o padrão do defeito que pôs dois');
  console.error('  fatos pediátricos citando a tabela de ADULTO — e o `cit_sha` não pega,');
  console.error('  porque as duas ocorrências resolvem para o mesmo texto e o mesmo hash.');
  console.error('\n  Rode com --detalhe, abra as duas ocorrências e decida qual vale.');
  console.error('  Âncora certa → marque o fato com `cit_ancora_ok: true`.');
  console.error('  Âncora errada → reancore e estenda a citação até um trecho ÚNICO.');
  process.exit(1);
}
