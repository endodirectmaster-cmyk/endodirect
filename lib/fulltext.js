// Texto integral de artigo em acesso aberto (PubMed Central), em JATS XML.
//
// POR QUE ISTO EXISTE: o radar (lib/radar.js) trabalha só com o ABSTRACT. Um
// abstract tem ~250 palavras e não traz figuras nem tabelas — escrever uma
// "discussão completa" a partir dele seria inventar o que o artigo diz. É
// exatamente o erro de 2026-07-28 nos artigos de Obesidade, em que afirmações
// de segurança plausíveis para a classe não correspondiam ao que o ensaio
// mediu. Só o texto integral sustenta discussão.
//
// ⚠️ LIMITE INTRÍNSECO: isto só funciona onde há PMC (acesso aberto). Em
// 28/07/2026 eram 76 dos 253 itens do mural (30%). Nos outros 177 o mural
// continua com o resumo do abstract, e é assim que tem de ser.
//
// Sem dependência externa de propósito: o parser é por regex, no mesmo estilo
// do `fetchAbstracts` do radar. JATS é regular o bastante para isso, e o custo
// de errar é baixo (o campo sai vazio e a discussão não é gerada).
'use strict';

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const FETCH_TIMEOUT_MS = 30000;

// "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13395687/" → "PMC13395687"
function pmcIdFromLink(link) {
  const m = String(link || '').match(/\/pmc\/articles\/(PMC\d+)/i);
  return m ? m[1].toUpperCase() : '';
}

function stripTags(s) {
  return String(s || '')
    .replace(/<xref[^>]*>([\s\S]*?)<\/xref>/g, '$1')   // citação: mantém o número
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();
}

// Só o que a licença permite REDISTRIBUIR. Estar no PMC não basta: boa parte do
// acervo é "free to read" sem licença aberta. Sem CC, a discussão se apoia no
// texto (que é leitura nossa, não cópia) e NÃO reproduz figura.
function parseLicense(xml) {
  const bloco = (xml.match(/<permissions>[\s\S]*?<\/permissions>/) || [''])[0];
  const href = (bloco.match(/<license[^>]*xlink:href="([^"]+)"/) || ['', ''])[1];
  const texto = stripTags((bloco.match(/<license-p>([\s\S]*?)<\/license-p>/) || ['', ''])[1]);
  const alvo = (href + ' ' + texto).toLowerCase();
  let cc = '';
  const m = alvo.match(/creativecommons\.org\/licenses\/([a-z-]+)\//);
  if (m) cc = 'CC ' + m[1].toUpperCase().replace(/-/g, '-');
  else if (/\bcc[ -]?by\b/.test(alvo)) cc = 'CC BY';
  else if (/public domain|cc0/.test(alvo)) cc = 'CC0';
  return { url: href, texto, cc, redistribuivel: /^CC (BY|0)/.test(cc) };
}

// Cabeçalho de coluna que é só bibliografia. Casa o inglês do JATS e o português,
// com ou sem pontuação/plural. NÃO casa "Study"/"Estudo": ali o número identifica
// a linha, e sem ele a tabela fica sem rótulo de linha.
const RE_COL_REFERENCIA = /^(refer[êe]ncias?|references?|refs?\.?|cita[çc][õo]es|citations?|ref\s*(no\.?|number|n[ºo]\.?)?)$/i;

// ⚠️ TABELA DE CARACTERÍSTICAS DOS ESTUDOS INCLUÍDOS — sai inteira.
// Pedido do professor (30/07): numa metanálise de HIIT vs MICT, a discussão
// reproduziu a tabela de 8 colunas × 20 estudos, com protocolo de cada braço por
// extenso. No card ela vira um bloco com rolagem horizontal que ninguém lê, e o
// aluno não tira dali nenhuma conduta — quem precisa desse detalhe vai ao artigo.
// O que interessa da metanálise é o efeito combinado, e essas tabelas (resultado,
// subgrupo, heterogeneidade) continuam passando.
//
// A assinatura é o que identifica: coluna de estudo/autor NA PRIMEIRA POSIÇÃO,
// muitas colunas, e cabeçalhos de característica. Uma tabela de resultado com
// coluna de estudo ("Estudo | Efeito | IC 95% | Peso") tem 4 colunas e sobrevive.
// ⚠️ Casa em INGLÊS porque o corte é no JATS do PMC, que é a fonte; o português
// vai junto só para o caso raro de artigo já traduzido.
const RE_COL_ESTUDO = /^(stud(y|ies)|trials?|first\s+author|authors?|estudos?|autor(es)?|ensaios?)\b/i;

// ⚠️ O CRITÉRIO DE FORMA É ESTRUTURAL, NÃO DE VOCABULÁRIO — e foi calibrado nas
// tabelas que já estavam gravadas, medindo colunas e linhas de cada:
//
//   7 col × 17 lin (transportadores de aminoácidos)  → sai
//   8 col × 20 lin (HIIT vs MICT, a do print)        → sai
//   7 col ×  7 lin (microbioma e GLP-1)              → sai
//   5 col ×  5 lin (definições e taxas de HPTT)      → FICA — ver abaixo
//
// A primeira versão exigia 3 cabeçalhos de um vocabulário de características
// ("sample size", "age", "duration"…) e pegava só UMA das quatro: as outras
// diziam "População", "Nº de pacientes", "Metodologia", que nenhuma lista de
// palavras prevê inteira. Contar coluna e linha não depende de adivinhar o
// vocabulário do autor.
//
// ⚠️ A DE 5 COLUNAS FICA POR SER TABELA DE RESULTADO, NÃO POR SER COMPACTA.
// "Estudo | Definição | PTx pré | PTx pós | Observações" traz 1/23 (4,3%),
// 4/75 (5,3%), P = 0,36 — é o desfecho por estudo, o dado da revisão. Cortá-la
// esvaziaria a discussão. Tamanho é consequência, não critério.
const MIN_COL_ESTUDOS = 6;
const MIN_LIN_ESTUDOS = 5;

// ⚠️ A LEGENDA DECIDE OS CASOS QUE A FORMA NÃO RESOLVE.
// Contar coluna separa bem os extremos, mas não distingue duas tabelas de 5
// colunas com "Estudo" na frente:
//   "Estudo | Definição | PTx pré | PTx pós | Observações"  → 1/23 (4,3%), P=0,36
//        é tabela de RESULTADO por estudo. FICA: é o dado da revisão.
//   "Estudo | Perda de peso | Dieta | Metformina | Comentários" → "sem ajuste formal"
//        é característica metodológica. SAI.
// A diferença está no que o <caption> do JATS declara — e ele é a fonte, escrito
// pelo autor. Por isso a legenda entra na decisão junto com a forma, e não a
// contagem de números nas células, que confunde as duas (a de resultado tem
// número, mas a de características também tem: n, idade, IMC).
const RE_LEGENDA_ESTUDOS = new RegExp('(' + [
  'characteristics?', 'caracter[íi]sticas?',
  'included\\s+stud', 'estudos\\s+inclu[íi]dos', 'studies\\s+included',
  'summary\\s+of\\s+(the\\s+)?(included\\s+)?(stud|trial)',
  'risk\\s+of\\s+bias', 'risco\\s+de\\s+vi[ée]s',
  'quality\\s+assessment', 'avalia[çc][ãa]o\\s+d[ae]\\s+qualidade',
  'confounding', 'confundidor', 'fatores\\s+de\\s+confus[ãa]o'
].join('|') + ')', 'i');

// `legenda` é opcional: sem ela, vale só o critério de forma.
function ehTabelaDeEstudosIncluidos(cabecalhos, nLinhasDeDados, legenda) {
  if (!RE_COL_ESTUDO.test(String(cabecalhos[0] || '').trim())) return false;
  if (nLinhasDeDados < MIN_LIN_ESTUDOS) return false;
  if (cabecalhos.length >= MIN_COL_ESTUDOS) return true;
  // 5 colunas: só sai se o próprio autor disser que a tabela é dos estudos.
  return cabecalhos.length >= 5 && RE_LEGENDA_ESTUDOS.test(String(legenda || ''));
}

// <table> → markdown. O renderizador do mural (muralTextHTML) já entende tabela
// markdown, então não precisa de nada novo no cliente.
// colspan/rowspan são ACHATADOS: a célula é repetida. Uma tabela de dados
// continua legível; uma de layout sai torta — por isso o limite de colunas.
function tableToMarkdown(tabelaXml, legenda) {
  const linhas = [...tabelaXml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((tr) => {
    const cels = [...tr[1].matchAll(/<(th|td)([^>]*)>([\s\S]*?)<\/\1>/g)];
    const out = [];
    for (const c of cels) {
      const span = Number((c[2].match(/colspan="(\d+)"/) || ['', 1])[1]) || 1;
      const txt = stripTags(c[3]).replace(/\|/g, '\\|');
      for (let k = 0; k < Math.min(span, 8); k++) out.push(k === 0 ? txt : '');
    }
    return out;
  }).filter((r) => r.length);
  if (linhas.length < 2) return '';
  let nCol = Math.max(...linhas.map((r) => r.length));
  if (nCol < 2 || nCol > 10) return '';   // 1 coluna não é tabela; >10 não cabe no card
  let corpoLinhas = linhas.map((r) => { const c = r.slice(); while (c.length < nCol) c.push(''); return c; });

  // ⚠️ A COLUNA DE REFERÊNCIAS SAI AQUI, na origem (pedido do professor, 29/07:
  // "essa coluna de referências pode sempre tirar dos artigos"). Ela traz os
  // números da bibliografia do artigo — "(122, 124, 126)" — e a discussão não
  // publica a lista de referências, então para o aluno é coluna de ruído.
  // Cortar aqui, e não no prompt, é o que garante o resultado: se a IA nunca vê
  // a coluna, não tem como reproduzi-la nem copiar os números para outra célula.
  const descartar = corpoLinhas[0]
    .map((h, i) => (RE_COL_REFERENCIA.test(String(h || '').trim()) ? i : -1))
    .filter((i) => i >= 0);
  if (descartar.length) {
    corpoLinhas = corpoLinhas.map((r) => r.filter((_, i) => descartar.indexOf(i) < 0));
    nCol -= descartar.length;
    if (nCol < 2) return '';   // se o que sobra não é mais tabela, melhor não mandar
  }

  // Depois do corte das referências: o que sobrou ainda é a lista dos estudos
  // incluídos? Se for, a tabela inteira não vai — não adianta encurtá-la.
  if (ehTabelaDeEstudosIncluidos(corpoLinhas[0], corpoLinhas.length - 1, legenda)) return '';

  const pad = (r) => '| ' + r.join(' | ') + ' |';
  const cabec = pad(corpoLinhas[0]);
  const sep = '|' + Array(nCol).fill('---').join('|') + '|';
  const corpo = corpoLinhas.slice(1).map(pad);
  return [cabec, sep, ...corpo].join('\n');
}

function parseFiguras(xml) {
  return [...xml.matchAll(/<fig\b[^>]*>([\s\S]*?)<\/fig>/g)].map((m) => {
    const b = m[1];
    return {
      rotulo: stripTags((b.match(/<label>([\s\S]*?)<\/label>/) || ['', ''])[1]) || 'Figura',
      legenda: stripTags((b.match(/<caption>([\s\S]*?)<\/caption>/) || ['', ''])[1]),
      grafico: (b.match(/<graphic[^>]*xlink:href="([^"]+)"/) || ['', ''])[1]
    };
  }).filter((f) => f.legenda);
}

function parseTabelas(xml) {
  return [...xml.matchAll(/<table-wrap\b[^>]*>([\s\S]*?)<\/table-wrap>/g)].map((m) => {
    const b = m[1];
    const tab = (b.match(/<table[^>]*>[\s\S]*?<\/table>/) || [''])[0];
    // A legenda vai junto para a conversão: é ela que decide as tabelas de 5
    // colunas, em que a forma sozinha não distingue resultado de característica.
    const legenda = stripTags((b.match(/<caption>([\s\S]*?)<\/caption>/) || ['', ''])[1]);
    return {
      rotulo: stripTags((b.match(/<label>([\s\S]*?)<\/label>/) || ['', ''])[1]) || 'Tabela',
      legenda,
      markdown: tab ? tableToMarkdown(tab, legenda) : '',
      // Rodapé de tabela costuma trazer a definição das abreviaturas — sem ele a
      // tabela reproduzida fica indecifrável.
      nota: stripTags((b.match(/<table-wrap-foot>([\s\S]*?)<\/table-wrap-foot>/) || ['', ''])[1])
    };
  }).filter((t) => t.markdown);
}

// Seções de 1º nível do corpo. Figuras e tabelas são removidas do texto da
// seção (voltam pelos campos próprios), senão a legenda entra no meio do
// parágrafo e a IA a lê como se fosse afirmação do autor.
function parseSecoes(xml) {
  const body = (xml.match(/<body>([\s\S]*)<\/body>/) || ['', ''])[1];
  if (!body) return [];
  const limpo = body
    .replace(/<fig\b[^>]*>[\s\S]*?<\/fig>/g, ' ')
    .replace(/<table-wrap\b[^>]*>[\s\S]*?<\/table-wrap>/g, ' ');
  const secs = [...limpo.matchAll(/<sec\b[^>]*>([\s\S]*?)<\/sec>/g)];
  const fonte = secs.length ? secs.map((s) => s[1]) : [limpo];
  return fonte.map((s) => ({
    titulo: stripTags((s.match(/<title>([\s\S]*?)<\/title>/) || ['', ''])[1]),
    paragrafos: [...s.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((p) => stripTags(p[1])).filter((t) => t.length > 40)
  })).filter((s) => s.paragrafos.length);
}

function parseJats(xml) {
  xml = String(xml || '');
  if (!/<body[ >]/.test(xml)) return null;   // registro só com metadados: não serve
  const secoes = parseSecoes(xml);
  const palavras = secoes.reduce((a, s) => a + s.paragrafos.join(' ').split(/\s+/).length, 0);
  // Abaixo disto é resumo estendido, não artigo — não sustenta discussão.
  if (palavras < 600) return null;
  return {
    licenca: parseLicense(xml),
    secoes,
    figuras: parseFiguras(xml),
    tabelas: parseTabelas(xml),
    palavras
  };
}

async function fetchPmcXml(pmcid) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = `${EUTILS}/efetch.fcgi?db=pmc&id=${encodeURIComponent(pmcid)}&retmode=xml`;
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/xml' } });
    if (!r.ok) return '';
    return await r.text();
  } catch (e) {
    return '';
  } finally {
    clearTimeout(t);
  }
}

async function fetchFullText(link) {
  const pmcid = pmcIdFromLink(link);
  if (!pmcid) return null;
  const xml = await fetchPmcXml(pmcid);
  if (!xml) return null;
  const ft = parseJats(xml);
  if (ft) ft.pmcid = pmcid;
  return ft;
}

// Texto que vai para a IA. Truncado por seção para caber no contexto sem cortar
// no meio de uma frase, e com as tabelas por extenso — são elas que carregam os
// números que a discussão precisa citar.
// ⚠️ FIGURAS E TABELAS SÃO MONTADAS PRIMEIRO E NUNCA ENTRAM NO CORTE. Elas iam
// no fim e o truncamento por caractere cortava justamente elas: num artigo de
// 8.100 palavras o bloco das tabelas ficava inteiro fora do prompt, e a discussão
// saía dizendo "a Tabela 1 (referida no artigo) sintetiza…" — o modelo só via a
// menção no corpo, nunca a tabela. O prompt mandava reproduzi-las e o material
// para isso não estava lá. Quem cede espaço agora é o corpo do texto.
function fullTextForPrompt(ft, maxChars) {
  const teto = maxChars || 60000;
  const anexos = [];
  if (ft.figuras.length) {
    anexos.push('## Figuras do artigo\n' + ft.figuras
      .map((f) => `${f.rotulo}: ${f.legenda}`).join('\n\n'));
  }
  if (ft.tabelas.length) {
    // ⚠️ CADA TABELA VAI COM UM MARCADOR. A IA não copia mais a tabela: escreve
    // `[[TABELA:n]]` sozinho numa linha e o servidor cola a do artigo, palavra
    // por palavra. Ver `inserirTabelas` em lib/discussao.js.
    anexos.push('## Tabelas do artigo\n' + ft.tabelas
      .map((t, i) => `[[TABELA:${i + 1}]] — ${t.rotulo}: ${t.legenda}\n${t.markdown}${t.nota ? '\n' + t.nota : ''}`)
      .join('\n\n'));
  }
  const fim = anexos.length ? '\n\n' + anexos.join('\n\n') : '';
  const corpo = ft.secoes
    .map((s) => '## ' + (s.titulo || 'Seção') + '\n' + s.paragrafos.join('\n\n'))
    .join('\n\n');
  // Sobra para o corpo depois de reservar os anexos. Piso de 20% do teto para o
  // caso patológico de anexos gigantescos: sem ele, um artigo com dezenas de
  // tabelas entraria sem corpo nenhum.
  const espacoCorpo = Math.max(Math.floor(teto * 0.2), teto - fim.length);
  const corte = corpo.length > espacoCorpo
    ? corpo.slice(0, espacoCorpo).replace(/\s+\S*$/, '') + '\n\n[…texto truncado]'
    : corpo;
  return corte + fim;
}

module.exports = { pmcIdFromLink, parseJats, parseLicense, parseSecoes, parseFiguras, parseTabelas, tableToMarkdown, ehTabelaDeEstudosIncluidos, stripTags, fetchPmcXml, fetchFullText, fullTextForPrompt };
