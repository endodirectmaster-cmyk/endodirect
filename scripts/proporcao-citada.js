#!/usr/bin/env node
/* Quanto de cada artigo está citado LITERALMENTE nos extratos versionados.
 *
 * POR QUE ISTO EXISTE (08/08/2026). O cofre registra que já se empurrou texto
 * integral de artigo para este repositório — que é PÚBLICO — e foi preciso
 * reescrever o histórico. Desde então a regra é: versiona-se o EXTRATO (fatos em
 * português com citações curtas), nunca o texto integral, e `textos/` está no
 * .gitignore.
 *
 * ⚠️ MAS A REGRA OLHA A CITAÇÃO, E O RISCO É A SOMA. Cada citação isolada é um
 * trecho de uma ou duas frases — uso legítimo, sem discussão. Medindo o
 * agregado, porém, alguns extratos chegam a 60-72% do artigo reconstituído
 * verbatim dentro do JSON. Ninguém decidiu isso; é o efeito colateral de extrair
 * exaustivamente e exigir citação para cada fato. As duas exigências são certas
 * e, juntas, produzem uma terceira coisa que nenhuma das duas pediu.
 *
 * Este script não decide nada — só torna o número visível, porque a proporção
 * cresce em silêncio a cada extração e ninguém olha o total.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTE MEDIDOR FICOU CEGO POR HORAS, E A CEGUEIRA ERA PIOR QUE A AUSÊNCIA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Achado pelo auditor do exercício no DM1 (08/08/2026). A migração para
 * referência (`cit` + `cit_sha`, ver `lib/citacao.js`) esvaziou o campo
 * `citacao` de todos os 27 extratos. Este script somava `f.citacao.length`.
 * Resultado: **0% para todos**, seguido de `✓ nenhum extrato acima de 55%`.
 *
 * O selo verde não era medida nenhuma — era a soma de nada. Se o script
 * simplesmente tivesse quebrado, alguém teria consertado. Passando, ele
 * ATESTAVA. É a terceira peneira que a migração cegou (as outras duas:
 * `cobertura-extracao.js` e a peneira CABEÇA_SOLTA dentro dela), e é a mesma
 * lição das três: **limpo é sintoma, não resultado — peneira que não pode
 * reprovar não é peneira.** Daí a trava no fim deste arquivo: se nenhum extrato
 * mediu nada, o script FALHA em vez de dar o selo.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ E AO CONSERTAR, QUASE DISPAREI UM ALARME FALSO — DUAS COISAS DIFERENTES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Com a resolução funcionando, seis extratos apareceram entre 57% e 72% e o
 * script gritou "citado verbatim num repositório PÚBLICO". **Isso teria sido
 * mentira**, e mentira na direção que assusta.
 *
 * Depois da migração o JSON versionado não guarda TEXTO nenhum: guarda
 * `[[0,418,271]]` e um hash. Quem clona o repositório e não tem o artigo não
 * reconstitui uma palavra. Confirmei os dois lados antes de reescrever:
 * `test-citacao-nao-publicada.js` passa (nenhum extrato versionado carrega
 * texto), e `lib/clinical-deep-data.js` — que É versionado — é gerado só de
 * `f.afirmacao`, ou seja, português nosso, nunca a citação.
 *
 * Então são DOIS números, e confundi-los é que era o erro:
 *
 *   EXPOSTO  = união das citações guardadas como TEXTO. É o risco de direito
 *              autoral de verdade. Hoje é zero, e é isto que reprova.
 *   COBERTO  = união de tudo, inclusive o que é só referência. Mede DEPENDÊNCIA
 *              do artigo, não publicação: só reconstitui quem já tem o PDF.
 *              É número editorial (extrato que cobre 72% é extrato que virou
 *              tradução), e por isso informa sem reprovar.
 *
 * Medindo de verdade, o extrato do exercício no DM1 cobre 41% do artigo —
 * abaixo de qualquer limite, mas ninguém sabia disso.
 *
 * ⚠️ E A CONTA É DE UNIÃO, NÃO DE SOMA. Duas citações podem se sobrepor (uma
 * estendida a partir da outra, coisa que as auditorias de hoje fizeram muito).
 * Somar comprimentos conta o mesmo trecho duas vezes e pode passar de 100%. O
 * que importa para direito autoral é QUANTO DO ARTIGO é reconstituível, ou
 * seja, a união dos intervalos.
 *
 * Uso:  node scripts/proporcao-citada.js [--limite 55]
 * Saída: tabela ordenada; código 1 se algum extrato passar do limite.
 */
const fs = require('fs');
const path = require('path');
const C = require('../lib/citacao');

const RAIZ = path.join(__dirname, '..');
const arg = (n, p) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : p; };
const LIMITE = parseFloat(arg('--limite', '55'));

const DIR = path.join(RAIZ, 'scratchpad', 'acervo');
const dirExt = path.join(DIR, 'extratos');
if (!fs.existsSync(dirExt)) { console.error('✗ não existe ' + dirExt); process.exit(1); }

const linhas = [];
let semTexto = 0;
for (const arq of fs.readdirSync(dirExt).filter((f) => f.endsWith('.json'))) {
  const e = JSON.parse(fs.readFileSync(path.join(dirExt, arq), 'utf8'));
  const pTxt = path.join(DIR, 'textos', String(e.fileId || '') + '.txt');
  // Sem o texto-fonte local não dá para medir (ele é gitignored de propósito,
  // então em CI limpo este script mede zero extratos — e isso está certo).
  if (!fs.existsSync(pTxt)) { semTexto++; continue; }
  const bruto = fs.readFileSync(pTxt, 'utf8');
  const bs = C.bases(bruto);
  // ⚠️ TUDO MEDIDO NUM SISTEMA DE COORDENADAS SÓ. Um fato pode ancorar na base 0
  // (normalizada) ou na 1 (sem hífen de quebra), e os offsets das duas não são
  // comparáveis. Para unir intervalos preciso de uma régua única, então resolvo
  // a citação para TEXTO e localizo esse texto na base 1, que é a mais
  // permissiva. Sem isto, um extrato com metade das citações em cada base teria
  // dois conjuntos de intervalos que não dá para somar sem contar duas vezes.
  const regua = bs[1];
  const iv = [], ivExposto = [];
  let naoLocalizados = 0;
  for (const f of e.fatos || []) {
    const r = C.resolver(f, bs);      // devolve { texto, origem } ou null
    const txt = r && r.texto;
    if (!txt) { naoLocalizados++; continue; }
    // `origem: 'texto'` = a citação está gravada como TEXTO no JSON versionado.
    // Só esses trechos estão de fato publicados.
    const exposto = r.origem === 'texto';
    // A citação com elisão declarada vira vários pedaços — cada um é um
    // intervalo próprio, e o buraco entre eles NÃO está publicado.
    for (const pedaco of String(txt).split(C.ELISAO).map((p) => p.trim()).filter(Boolean)) {
      const alvo = C.semHifenDeQuebra(C.norm(pedaco));
      const i = regua.indexOf(alvo);
      if (i < 0) { naoLocalizados++; continue; }
      iv.push([i, i + alvo.length]);
      if (exposto) ivExposto.push([i, i + alvo.length]);
    }
  }
  // União dos intervalos: duas citações sobrepostas reconstituem uma região só,
  // e somar comprimentos contaria o mesmo trecho duas vezes (as auditorias de
  // hoje estenderam muitas citações a partir de outras, então sobreposição é
  // regra, não exceção — somando dava para passar de 100%).
  const uniao = (lista) => {
    lista.sort((a, b) => a[0] - b[0]);
    let tot = 0, fimAtual = -1;
    for (const [ini, fim] of lista) {
      if (ini > fimAtual) { tot += fim - ini; fimAtual = fim; }
      else if (fim > fimAtual) { tot += fim - fimAtual; fimAtual = fim; }
    }
    return tot;
  };
  const citado = uniao(iv);
  const exposto = uniao(ivExposto);
  const fonte = regua.length;
  linhas.push({
    titulo: String(e.titulo || e.tema || arq).replace(/\s+/g, ' ').slice(0, 46),
    pct: fonte ? (citado / fonte) * 100 : 0,
    pctExp: fonte ? (exposto / fonte) * 100 : 0,
    citado, exposto, fonte, fatos: (e.fatos || []).length, naoLocalizados
  });
}

if (!linhas.length) {
  console.log('(nenhum texto-fonte local — `scratchpad/acervo/textos/` é gitignored; rode onde os PDFs foram extraídos)');
  process.exit(0);
}

linhas.sort((a, b) => b.pct - a.pct);
console.log('QUANTO DE CADA ARTIGO O EXTRATO ALCANÇA\n');
console.log('  EXPOSTO = citação gravada como TEXTO no JSON versionado. É o risco real,');
console.log('            e é o que reprova. COBERTO = união de tudo, inclusive o que é só');
console.log('            referência (offset+hash): mede DEPENDÊNCIA, e só reconstitui quem');
console.log('            já tem o artigo. Alto é sinal editorial, não jurídico.\n');
console.log('  EXPOSTO  COBERTO  união/fonte   fatos  artigo');
let acima = 0;
for (const l of linhas) {
  const marca = l.pctExp > LIMITE ? '⚠️' : '  ';
  if (l.pctExp > LIMITE) acima++;
  const perdidos = l.naoLocalizados ? `  (${l.naoLocalizados} não localizada(s))` : '';
  console.log(`${marca} ${l.pctExp.toFixed(0).padStart(5)}%  ${l.pct.toFixed(0).padStart(6)}%  ${(Math.round(l.citado / 1000) + 'k/' + Math.round(l.fonte / 1000) + 'k').padEnd(11)} ${String(l.fatos).padStart(5)}  ${l.titulo}${perdidos}`);
}
const densos = linhas.filter((l) => l.pct > LIMITE);
if (densos.length) {
  console.log(`\nℹ️  ${densos.length} extrato(s) COBREM mais de ${LIMITE}% do artigo (nenhum deles publicado).`);
  console.log('   Não é falha: é aviso de que o extrato virou quase uma tradução do artigo.');
  console.log('   Vale olhar se a extração está atomizando demais — mas ninguém está exposto.');
}
if (semTexto) console.log(`\n(${semTexto} extrato(s) sem texto-fonte local — não medidos)`);

// ⚠️ A TRAVA CONTRA A CEGUEIRA. Se TODOS mediram zero, não é que os extratos
// estejam limpos — é que o medidor parou de enxergar, como aconteceu de fato
// com a migração para referência. Peneira que não pode reprovar não é peneira.
if (linhas.length && linhas.every((l) => l.citado === 0)) {
  console.error('\n✗ TODOS os extratos mediram 0% — isto é cegueira do medidor, não limpeza.');
  console.error('  Provável causa: mudou o formato da citação e a resolução parou de funcionar.');
  console.error('  Conserte o medidor antes de confiar no selo.');
  process.exit(1);
}

if (acima) {
  console.error(`\n⚠️ ${acima} extrato(s) com mais de ${LIMITE}% do artigo gravado como TEXTO num repositório PÚBLICO.`);
  console.error('Cada citação isolada é uso legítimo; a SOMA é que não foi decidida por ninguém.');
  console.error('Conserto direto: `node scripts/protege-citacoes.js` troca o texto por referência');
  console.error('(offset + hash), que prova o mesmo sem publicar nada.');
  process.exit(1);
}
console.log(`\n✓ nenhum extrato acima de ${LIMITE}%.`);
