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

// <table> → markdown. O renderizador do mural (muralTextHTML) já entende tabela
// markdown, então não precisa de nada novo no cliente.
// colspan/rowspan são ACHATADOS: a célula é repetida. Uma tabela de dados
// continua legível; uma de layout sai torta — por isso o limite de colunas.
function tableToMarkdown(tabelaXml) {
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
  const nCol = Math.max(...linhas.map((r) => r.length));
  if (nCol < 2 || nCol > 10) return '';   // 1 coluna não é tabela; >10 não cabe no card
  const pad = (r) => { const c = r.slice(); while (c.length < nCol) c.push(''); return '| ' + c.join(' | ') + ' |'; };
  const cabec = pad(linhas[0]);
  const sep = '|' + Array(nCol).fill('---').join('|') + '|';
  const corpo = linhas.slice(1).map(pad);
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
    return {
      rotulo: stripTags((b.match(/<label>([\s\S]*?)<\/label>/) || ['', ''])[1]) || 'Tabela',
      legenda: stripTags((b.match(/<caption>([\s\S]*?)<\/caption>/) || ['', ''])[1]),
      markdown: tab ? tableToMarkdown(tab) : '',
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
    anexos.push('## Tabelas do artigo\n' + ft.tabelas
      .map((t) => `${t.rotulo}: ${t.legenda}\n${t.markdown}${t.nota ? '\n' + t.nota : ''}`).join('\n\n'));
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

module.exports = { pmcIdFromLink, parseJats, parseLicense, parseSecoes, parseFiguras, parseTabelas, tableToMarkdown, stripTags, fetchPmcXml, fetchFullText, fullTextForPrompt };
