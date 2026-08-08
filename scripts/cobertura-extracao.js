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
const CIT = require('../lib/citacao');

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

// ⚠️ E A CABEÇA? O MESMO DEFEITO, DO OUTRO LADO (08/08/2026).
//
// A peneira acima só olha o FIM da citação. O reparo das 40 citações truncadas
// achou o espelho dela, e é pior:
//
//   afirmação: "NENHUMA das abordagens farmacológicas provou ser eficaz…"
//   citação:   "approaches has been proven to be effective in controlled"
//
// A cabeça da frase — `However, none of these` — ficou encalhada na outra coluna.
// Lida literalmente, a citação afirma o OPOSTO da afirmação. E ela não termina
// mal, então `CAUDA_RUIM` passa direto. É o mesmo negativo perdido que já apagou
// um "não" na dislipidemia e inverteu o sentido.
//
// O sinal: a citação começa no MEIO de uma frase do texto-fonte — o caractere
// que a antecede não é fim de frase. Não é prova de defeito (o extrator pode ter
// começado no meio de propósito), mas é onde o defeito mora. Por isso AVISA e não
// reprova: reprovar 84 fatos bons para achar 1 ruim faria o time desligar a peneira.
//
// ⚠️ A 1ª versão testava se a citação começava em MINÚSCULA. Funcionou enquanto o
// JSON guardava o texto original; quando a citação passou a ser resolvida da base
// NORMALIZADA (toda minúscula), virou carimbo — 134 de 135 fatos. Cega pela
// segunda vez, do mesmo jeito, e por minha causa. Olhar o texto-fonte é melhor
// que o original: responde direto "começa no meio de uma frase?", sem depender de
// maiúscula (que o PDF perde) nem de idioma.
const CABECA_SOLTA = /^[a-zà-ÿ]/;
// Palavra que, aparecendo logo depois de uma cabeça encalhada, sinaliza que o
// que se perdeu foi uma NEGAÇÃO ou uma RESSALVA — aí o risco é de inversão.
const RISCO_INVERSAO = /^(?:[a-zà-ÿ]+\s+){0,3}(has been|have been|is|are|was|were|can|could|may|might|should|showed|demonstrated|proven|proved)\b/i;

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
    // ⚠️ A citação não é mais texto no JSON: é REFERÊNCIA para o texto-fonte
    // local (ver lib/citacao.js). Sem resolver, `f.citacao` vem vazio e TODAS as
    // peneiras deste arquivo passam a achar zero — não porque o defeito sumiu,
    // mas porque elas ficaram cegas. Aconteceu comigo na migração: o relatório
    // veio limpo e limpo era o sintoma, não o resultado.
    const pTxtC = path.join(DIR, 'textos', String(e.fileId || '') + '.txt');
    const bsC = fs.existsSync(pTxtC) ? CIT.bases(fs.readFileSync(pTxtC, 'utf8')) : null;
    const fatos = (Array.isArray(e.fatos) ? e.fatos : []).map((f) => {
      if (String(f.citacao || '').trim()) return f;
      const r = bsC ? CIT.resolver(f, bsC) : null;
      if (!r) return f;
      // ⚠️ `meio_de_frase` decidido pelo TEXTO-FONTE, não pela caixa da letra.
      // A peneira original olhava se a citação começava em minúscula. Depois da
      // migração isso virou carimbo: o texto resolvido vem da base NORMALIZADA,
      // que é toda minúscula, e a peneira passou a casar com 134 de 135 fatos —
      // ou seja, ficou cega pela segunda vez, do mesmo jeito e por minha causa.
      // Olhar o que ANTECEDE a citação é melhor que o original: responde
      // diretamente "esta citação começa no meio de uma frase?", sem depender de
      // maiúscula (que o PDF perde) nem de idioma.
      let meio = false;
      if (Array.isArray(f.cit) && f.cit.length) {
        const [base, off] = f.cit[0];
        const b = bsC[base | 0] || '';
        const antes = b.slice(Math.max(0, off - 40), off).replace(/\s+$/, '');
        meio = antes.length > 0 && !/[.!?:;]$/.test(antes);
      }
      return Object.assign({}, f, { citacao: r.texto, _meioDeFrase: meio });
    });
    const rotulo = (e.tema || e.titulo || arq).slice(0, 46);
    const problemas = [];

    // ⚠️ PENEIRA CEGA É PIOR QUE PENEIRA AUSENTE — ela devolve "✓" sem ter olhado.
    // Se o extrato guarda referências e o texto-fonte não está aqui, as peneiras
    // 3 e 4 não têm o que ler e passariam calado.
    const refsSemTexto = fatos.filter((f) => Array.isArray(f.cit) && !String(f.citacao || '').trim()).length;
    if (refsSemTexto) {
      problemas.push(`${refsSemTexto} de ${fatos.length} citações não puderam ser resolvidas (texto-fonte ausente em ${pTxtC}). As peneiras de citação truncada e de cabeça encalhada NÃO foram aplicadas — este "✓" não vale.`);
    }

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

    // ── 4. citações com a CABEÇA encalhada na outra coluna ──────────────────
    // Só reprova o subconjunto perigoso: cabeça em minúscula E verbo logo
    // adiante (o padrão de "…none of these| approaches has been proven…").
    // O resto vira aviso com contagem, para dar tamanho ao problema sem
    // transformar a peneira em ruído.
    const cabecaSolta = fatos.filter((f) => (typeof f._meioDeFrase === 'boolean')
      ? f._meioDeFrase
      : CABECA_SOLTA.test(String(f.citacao || '').trim()));
    // ⚠️ O sinal NÃO é "a afirmação tem a palavra não". A primeira versão desta
    // peneira reprovou "a excreção aumenta quando um ânion NÃO-reabsorvível…" —
    // ali o "não" faz parte do nome do ânion, não nega a frase. E a citação
    // trazia "non-reabsorbable", ou seja, a negação ESTAVA lá.
    //
    // O sinal certo é o DESEQUILÍBRIO: a afirmação nega e a citação não tem
    // nenhuma marca de negação. Aí ou o "não" foi importado, ou ele ficou
    // encalhado na outra coluna junto com a cabeça da frase.
    const NEGA_PT = /(^|[^a-zà-ÿ-])(nao|não|nenhum|nenhuma|nem|sem|jamais|nunca)([^a-zà-ÿ-]|$)/i;
    const NEGA_FONTE = /(^|[^a-z-])(no|not|none|neither|nor|never|without|non|fail|lack|absence|unable|insufficient)([^a-z]|$)/i;
    const podeInverter = cabecaSolta.filter((f) => RISCO_INVERSAO.test(String(f.citacao || '').trim())
      && NEGA_PT.test(String(f.afirmacao || ''))
      && !NEGA_FONTE.test(String(f.citacao || '')));
    // ⚠️ AINDA AVISA, NÃO REPROVA — e isto tem prazo.
    // A peneira nasceu em 08/08/2026 e encontrou 8 fatos de DÍVIDA JÁ EXISTENTE
    // em 4 extratos. Reprovar hoje travaria o montador (e portanto todo deploy)
    // por um defeito que ela acabou de revelar, e um deles está num extrato que
    // outro agente está editando agora. A ordem certa é: consertar os 8, depois
    // virar a chave. ⚠️ Enquanto for aviso, ela não protege nada — quem ler isto
    // e vir a lista vazia, TROQUE `avisos.push` por `problemas.push` aqui.
    if (podeInverter.length) {
      podeInverter.forEach((f) => avisos.push(
        `  ⚠️ ${rotulo}: POSSÍVEL INVERSÃO — citação "${String(f.citacao).slice(0, 62)}…" sustenta "${String(f.afirmacao).slice(0, 62)}…" (a cabeça que carrega a negação ficou na outra coluna)`));
    } else if (cabecaSolta.length) {
      avisos.push(`  ${rotulo}: ${cabecaSolta.length} de ${fatos.length} citações começam no MEIO de uma frase do texto-fonte (pode ser corte deliberado; pode ser cabeça de frase perdida na outra coluna)`);
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
