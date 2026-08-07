#!/usr/bin/env node
/* Terceira peneira da extração: o extrato COBRE o artigo, ou parou no meio?
 *
 * POR QUE ISTO EXISTE. A auditoria adversarial do consenso de prolactinoma
 * (07/08/2026) achou 9 erros de sentido em 175 fatos — 5,1%. Mas o achado que
 * pesou não foi nenhum deles:
 *
 *   O artigo tem 151 recomendações graduadas. O extrato cobria as primeiras e
 *   PAROU em "Aggressive prolactinomas". Gestação (15 recomendações),
 *   criança/adolescente, doença psiquiátrica, menopausa, pessoa trans e doença
 *   renal crônica ficaram INTEIRAMENTE de fora — e o campo `tema` do extrato
 *   ANUNCIAVA todos eles.
 *
 * ⚠️ ERRO DE OMISSÃO NÃO DEIXA RASTRO. O verificador de citações passa 100%: o
 * que está lá está certo. A auditoria de sentido também passa: ela audita o que
 * existe. Nada no JSON diz que o extrator parou no meio — e quem consome o
 * extrato confia no `tema` e supõe cobertura completa. É pior que um fato errado,
 * porque um fato errado alguém pode contestar; uma seção ausente é invisível.
 *
 * As três peneiras aqui são as que a auditoria recomendou:
 *   1. COBERTURA   — razão entre recomendações graduadas no PDF e fatos que
 *                    declaram força. Abaixo do limiar, reprova.
 *   2. PROMESSA    — cada tema anunciado no campo `tema` aparece em algum fato?
 *   3. CITAÇÃO CURTA/TRUNCADA — citação terminada em preposição, conjunção ou
 *                    hífen não sustenta a afirmação sozinha. Foi por aí que
 *                    entraram os dois fatos que tive de apagar (o PDF de duas
 *                    colunas parte a frase no meio).
 *
 * Uso:  node scripts/cobertura-extracao.js [--dir scratchpad/acervo] [--min 0.5]
 * Saída: relatório por extrato; código 1 se algum reprovar.
 */
const fs = require('fs');
const path = require('path');

const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
};
const DIR = path.resolve(arg('--dir', path.join('scratchpad', 'acervo')));
// Limiar deliberadamente FROUXO: nem todo artigo usa GRADE, e um fato pode
// cobrir dois bullets. O objetivo é pegar o extrato que parou no MEIO (cobertura
// perto de 0,6 no prolactinoma), não exigir paridade 1:1.
const MIN = parseFloat(arg('--min', '0.55'));

// Palavras que, aparecendo no `tema`, prometem uma seção inteira. Só entram
// termos que o extrator não usaria por acaso.
const PROMESSAS = [
  ['gestação', /gesta[çc][ãa]o|gestante|gr[áa]vida/i, /gesta[çc]|gestante|pregnan|gravid/i],
  ['criança/adolescente', /crian[çc]a|pedi[áa]tric|adolescen/i, /crian[çc]|pedi[áa]tric|adolescen|paediatric|children/i],
  ['doença psiquiátrica', /psiqui[áa]tric|antipsic[óo]t/i, /psiqui[áa]tric|antipsic[óo]t|antipsychot|risperidon|aripiprazol/i],
  ['menopausa', /menopaus/i, /menopaus/i],
  ['pessoa trans', /transg[êe]ner|pessoa trans/i, /transg[êe]ner|transgender/i],
  ['doença renal', /renal cr[ôo]nica|di[áa]lise/i, /renal|dial[íi]s|dialys/i],
  ['lactação', /lacta[çc][ãa]o|amamenta/i, /lacta[çc]|amamenta|breastfeed/i],
  ['idoso', /idoso/i, /idoso|elderly/i]
];

// Citação que termina assim não prova nada sozinha — a frase foi cortada.
const CAUDA_RUIM = /\b(and|or|with|for|of|in|to|the|a|an|that|which|as|by|from|is|are|was|were|but|than|se|de|do|da|e|ou|que|com|para|em|no|na)\s*$|[-–—]\s*$/i;

function ler(dir) {
  const d = path.join(DIR, dir);
  return fs.existsSync(d) ? fs.readdirSync(d) : [];
}

function main() {
  const arquivos = ler('extratos').filter((f) => f.endsWith('.json'));
  if (!arquivos.length) { console.error('✗ nenhum extrato em ' + DIR); process.exit(1); }

  let reprovados = 0;
  const avisos = [];
  console.log('COBERTURA DA EXTRAÇÃO (o extrato representa o artigo inteiro?)\n');

  for (const arq of arquivos) {
    const e = JSON.parse(fs.readFileSync(path.join(DIR, 'extratos', arq), 'utf8'));
    const fatos = Array.isArray(e.fatos) ? e.fatos : [];
    const rotulo = (e.tema || e.titulo || arq).slice(0, 46);
    const problemas = [];

    // ── 1. cobertura das recomendações graduadas ────────────────────────────
    // Só se aplica quando o artigo REALMENTE usa GRADE; senão o teste não diz nada.
    const pTexto = path.join(DIR, 'textos', (e.fileId || '') + '.txt');
    let razao = null;
    if (fs.existsSync(pTexto)) {
      const txt = fs.readFileSync(pTexto, 'utf8');
      const graduados = (txt.match(/\((strong|weak|forte|fraca)\)/gi) || []).length;
      if (graduados >= 20) {
        const comForca = fatos.filter((f) => /\((forte|fraca|strong|weak)\)|recomenda[çc][ãa]o (forte|fraca)/i.test(f.afirmacao)).length;
        razao = comForca / graduados;
        if (razao < MIN) {
          problemas.push(`COBERTURA ${(razao * 100).toFixed(0)}% — o artigo tem ${graduados} recomendações graduadas e só ${comForca} fato(s) declaram força. Provável parada no meio do artigo.`);
        }
      }
    }

    // ── 2. o `tema` promete o que o extrato não entrega? ─────────────────────
    const tema = String(e.tema || '');
    const corpo = fatos.map((f) => f.afirmacao + ' ' + f.citacao).join(' ');
    for (const [nome, reTema, reCorpo] of PROMESSAS) {
      if (reTema.test(tema) && !reCorpo.test(corpo)) {
        problemas.push(`PROMESSA NÃO CUMPRIDA: o campo \`tema\` anuncia "${nome}" e nenhum fato menciona o assunto.`);
      }
    }

    // ── 3. citações cortadas no meio da frase ───────────────────────────────
    const truncadas = fatos.filter((f) => CAUDA_RUIM.test(String(f.citacao || '').trim()));
    if (truncadas.length) {
      const pct = truncadas.length / fatos.length;
      // ⚠️ Desde 07/08/2026 isto TEM conserto: `verifica-extracao.js` aceita
      // ELISÃO DECLARADA — `citacao: "…primeira parte […] continuação…"`, com
      // cada pedaço literal, na ordem e com o buraco limitado. A causa quase
      // sempre é a INTERCALAÇÃO DE COLUNAS do PDF: a frase verdadeira continua
      // depois de um respingo de ~50 chars da outra coluna. Antes disso, o
      // extrator só podia cortar a citação (deixando a afirmação sem respaldo)
      // ou jogar o fato fora.
      const msg = `${truncadas.length} de ${fatos.length} citações terminam em preposição/conjunção/hífen (frase cortada — o PDF de 2 colunas faz isso; reconstrua com elisão declarada "[…]")`;
      if (pct > 0.25) problemas.push(msg + ' — acima de 25%, reprova');
      else if (truncadas.length) avisos.push(`  ${rotulo}: ${msg}`);
    }

    if (problemas.length) {
      reprovados++;
      console.log(`✗ ${rotulo}`);
      problemas.forEach((p) => console.log('    · ' + p));
    } else {
      console.log(`✓ ${rotulo}${razao != null ? `  (cobertura ${(razao * 100).toFixed(0)}%)` : ''}`);
    }
  }

  if (avisos.length) { console.log('\nAvisos (não reprovam):'); avisos.forEach((a) => console.log(a)); }

  if (reprovados) {
    console.error(`\n✗ ${reprovados} extrato(s) com cobertura insuficiente. Erro de OMISSÃO não deixa rastro: o verificador de citações passa 100% e a auditoria de sentido também, porque as duas olham só o que está lá.`);
    process.exit(1);
  }
  console.log('\n✓ nenhum extrato aparenta ter parado no meio do artigo.');
}

main();
