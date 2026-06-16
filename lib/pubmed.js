// Endodirect — Grounding por PubMed para a geração de conteúdo por IA.
// =====================================================================
// Dado um tema, busca os artigos recentes mais relevantes (revisões,
// diretrizes, metanálises, ensaios clínicos) e devolve
// {pmid, title, journal, year, abstract} para api/ai.js injetar como FONTES
// verificáveis no prompt de geração (questões, etc.). Assim a IA cita PMIDs
// REAIS em vez de inventar referências.
//
// Reaproveita o padrão de pacing/retry/api-key do lib/radar.js. Falha "para o
// lado seguro": QUALQUER erro devolve [] e a geração segue sem grounding —
// ainda ancorada nas diretrizes nomeadas pelo system prompt (CLINICAL_AUTHORING).
//
// VARIÁVEIS DE AMBIENTE (Vercel, todas opcionais):
//   NCBI_API_KEY   sobe o limite de req/s do PubMed (pacing 380ms -> 130ms)
//   NCBI_TOOL      identificação na NCBI (padrão 'endodirect')
//   NCBI_EMAIL     contato na NCBI (padrão contato@endodirect.com.br)
// =====================================================================
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_TOOL = process.env.NCBI_TOOL || 'endodirect';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'contato@endodirect.com.br';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const MIN_INTERVAL_MS = NCBI_API_KEY ? 130 : 380;

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Pacer global: respeita o limite de req/s da NCBI entre chamadas sequenciais.
let _last = 0;
async function pace() {
  const wait = _last + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  _last = Date.now();
}

function buildUrl(path, params) {
  const u = new URL(PUBMED_BASE_URL + '/' + path);
  Object.keys(params).forEach(function (k) { u.searchParams.set(k, params[k]); });
  u.searchParams.set('tool', NCBI_TOOL);
  u.searchParams.set('email', NCBI_EMAIL);
  if (NCBI_API_KEY) u.searchParams.set('api_key', NCBI_API_KEY);
  return u.toString();
}

// fetch com pacing + retry/backoff em 429/5xx/erro de rede.
async function pfetch(u, opts) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    await pace();
    try {
      const r = await fetch(u, opts);
      if (r.ok) return r;
      if (r.status === 429 || r.status >= 500) { lastErr = new Error('PubMed HTTP ' + r.status); await sleep(600 * (i + 1)); continue; }
      throw new Error('PubMed HTTP ' + r.status);
    } catch (e) { lastErr = e; await sleep(400 * (i + 1)); }
  }
  throw lastErr || new Error('PubMed indisponível');
}

function clean(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function firstTag(entry, tag) {
  const m = entry.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>'));
  return m ? clean(m[1]) : '';
}

// Busca os IDs recentes mais relevantes para o tema, priorizando os tipos de
// estudo de maior nível de evidência e ordenando por relevância.
async function searchIds(query, opts) {
  const years = (opts && opts.years) || 5;
  const retmax = String((opts && opts.max) || 4);
  const term = '(' + query + ') AND (review[pt] OR guideline[pt] OR "practice guideline"[pt] OR meta-analysis[pt] OR "randomized controlled trial"[pt])'
    + ' AND English[lang] AND ("last ' + years + ' years"[PDat]) AND humans[MeSH Terms]';
  const u = buildUrl('esearch.fcgi', { db: 'pubmed', retmode: 'json', retmax: retmax, sort: 'relevance', term: term });
  const r = await pfetch(u, { headers: { Accept: 'application/json' } });
  const d = await r.json();
  return (d.esearchresult && d.esearchresult.idlist) || [];
}

// efetch -> [{pmid,title,journal,year,abstract}].
async function fetchArticles(ids) {
  if (!ids.length) return [];
  const u = buildUrl('efetch.fcgi', { db: 'pubmed', retmode: 'xml', id: ids.join(',') });
  const r = await pfetch(u, { headers: { Accept: 'application/xml,text/xml' } });
  const xml = await r.text();
  const entries = xml.match(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/g) || [];
  return entries.map(function (e) {
    const pmid = (e.match(/<PMID[^>]*>(\d+)<\/PMID>/) || [])[1] || '';
    const title = firstTag(e, 'ArticleTitle');
    const journal = firstTag(e, 'ISOAbbreviation') || firstTag(e, 'Title');
    const year = (e.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/) || [])[1] || '';
    const abstract = [...e.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)]
      .map(function (m) { return clean(m[1]); }).join(' ');
    return { pmid: pmid, title: title, journal: journal, year: year, abstract: abstract };
  }).filter(function (a) { return a.pmid && a.title; });
}

// API principal: tema -> artigos de fonte. Best-effort, NUNCA lança.
async function pubmedGround(query, opts) {
  query = String(query || '').trim();
  if (!query) return [];
  try {
    const ids = await searchIds(query, opts);
    if (!ids.length) return [];
    return await fetchArticles(ids.slice(0, (opts && opts.max) || 4));
  } catch (e) {
    return [];
  }
}

// Formata as fontes como bloco de texto para injetar no prompt de geração.
function formatSources(arts) {
  if (!arts || !arts.length) return '';
  const lines = arts.map(function (a) {
    const ab = a.abstract ? (' — ' + a.abstract.slice(0, 600)) : '';
    return '- [' + (a.year || 's/d') + '] ' + a.title + ' (' + a.journal + '). PMID ' + a.pmid + ab;
  });
  return 'FONTES (PubMed, recentes e verificadas — use SOMENTE estas se for citar artigos; cite no formato "PMID <n>"; se nenhuma servir, baseie-se nas diretrizes nomeadas, NUNCA invente referências):\n' + lines.join('\n');
}

module.exports = { pubmedGround, formatSources };
