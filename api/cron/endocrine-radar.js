const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eutizblmrcypzyqzczgq.supabase.co';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const MAX_MURAL_ITEMS = 50;
const AUTO_ITEM_TTL_MS = 45 * 24 * 60 * 60 * 1000;

const JOURNALS = [
  { name: 'The New England Journal of Medicine', query: 'N Engl J Med', weight: 10 },
  { name: 'The Lancet Diabetes & Endocrinology', query: 'Lancet Diabetes Endocrinol', weight: 10 },
  { name: 'Nature Reviews Endocrinology', query: 'Nat Rev Endocrinol', weight: 9 },
  { name: 'Nature Medicine', query: 'Nat Med', weight: 9 },
  { name: 'Diabetes Care', query: 'Diabetes Care', weight: 9 },
  { name: 'Endocrine Reviews', query: 'Endocr Rev', weight: 9 },
  { name: 'Journal of Clinical Endocrinology & Metabolism', query: 'J Clin Endocrinol Metab', weight: 8 },
  { name: 'Diabetes', query: 'Diabetes', weight: 8 },
  { name: 'Obesity', query: 'Obesity (Silver Spring)', weight: 7 },
  { name: 'Endocrinology', query: 'Endocrinology', weight: 7 }
];

const TOPIC_QUERY = [
  'endocrinology',
  'diabetes',
  'obesity',
  'thyroid',
  'adrenal',
  'pituitary',
  'hypogonadism',
  'osteoporosis',
  'bone mineral',
  'metabolism',
  'glucose',
  'insulin',
  'GLP-1',
  'semaglutide',
  'tirzepatide'
].map((term) => `${term}[Title/Abstract]`).join(' OR ');

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentences(text, maxSentences) {
  const clean = cleanText(text);
  if (!clean) return '';
  const parts = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  return parts.slice(0, maxSentences).join(' ').slice(0, 650).trim();
}

function normalizeJournal(title) {
  const clean = cleanText(title);
  const found = JOURNALS.find((journal) => clean.toLowerCase() === journal.query.toLowerCase());
  return found ? found.name : clean;
}

function inferStudyType(article) {
  const haystack = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')}`.toLowerCase();
  if (haystack.includes('randomized') || haystack.includes('randomised') || haystack.includes('clinical trial')) return 'Ensaio clinico';
  if (haystack.includes('guideline') || haystack.includes('consensus')) return 'Diretriz/consenso';
  if (haystack.includes('meta-analysis') || haystack.includes('systematic review')) return 'Revisao sistematica/metanalise';
  if (haystack.includes('cohort') || haystack.includes('prospective')) return 'Coorte';
  if (haystack.includes('review')) return 'Revisao narrativa';
  return 'Artigo cientifico';
}

function practiceRelevance(article) {
  const haystack = `${article.title} ${article.abstract}`.toLowerCase();
  if (haystack.includes('diabetes') || haystack.includes('glucose') || haystack.includes('insulin')) {
    return 'pode refinar decisoes de acompanhamento, tratamento e estratificacao de risco em diabetes e metabolismo.';
  }
  if (haystack.includes('obesity') || haystack.includes('weight') || haystack.includes('glp-1') || haystack.includes('tirzepatide')) {
    return 'ajuda a atualizar condutas em obesidade, farmacoterapia metabolica e reducao de risco cardiometabolico.';
  }
  if (haystack.includes('thyroid')) {
    return 'pode impactar investigacao, seguimento e tomada de decisao em doencas tireoidianas.';
  }
  if (haystack.includes('adrenal') || haystack.includes('pituitary')) {
    return 'traz pontos uteis para diagnostico e manejo de endocrinopatias adrenal/hipofisarias.';
  }
  return 'merece leitura por possivel impacto em ensino, atualizacao clinica e pratica endocrinologica.';
}

function limitationFor(type) {
  if (type.includes('Ensaio')) return 'confirmar criterios de inclusao, desfechos e aplicabilidade ao perfil dos pacientes antes de mudar conduta.';
  if (type.includes('Revisao')) return 'interpretar a luz da qualidade dos estudos incluidos e de eventual heterogeneidade.';
  if (type.includes('Coorte')) return 'associacao observacional nao prova causalidade e pode ter confundimento residual.';
  if (type.includes('Diretriz')) return 'adaptar recomendacoes ao contexto local, disponibilidade e preferencias do paciente.';
  return 'ler o artigo completo antes de extrapolar os achados.';
}

function scoreArticle(article) {
  const journal = JOURNALS.find((item) => article.journal.toLowerCase().includes(item.query.toLowerCase()));
  let score = journal ? journal.weight : 4;
  const haystack = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')}`.toLowerCase();
  ['randomized', 'clinical trial', 'guideline', 'consensus', 'meta-analysis', 'systematic review', 'phase 3'].forEach((term) => {
    if (haystack.includes(term)) score += 2;
  });
  ['editorial', 'letter', 'comment'].forEach((term) => {
    if (haystack.includes(term)) score -= 3;
  });
  if (article.abstract && article.abstract.length > 350) score += 1;
  return score;
}

function pubmedUrl(path, params) {
  const url = new URL(`${PUBMED_BASE_URL}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`PubMed respondeu HTTP ${response.status}`);
  return response.json();
}

async function searchPubMed() {
  const journalQuery = JOURNALS.map((journal) => `"${journal.query}"[Journal]`).join(' OR ');
  const term = `(${journalQuery}) AND (${TOPIC_QUERY}) AND ("last 21 days"[PDat])`;
  const url = pubmedUrl('esearch.fcgi', {
    db: 'pubmed',
    retmode: 'json',
    retmax: '30',
    sort: 'date',
    term
  });
  const data = await fetchJson(url);
  return (data.esearchresult && data.esearchresult.idlist) || [];
}

async function summarizePubMed(ids) {
  if (!ids.length) return [];
  const url = pubmedUrl('esummary.fcgi', {
    db: 'pubmed',
    retmode: 'json',
    id: ids.join(',')
  });
  const data = await fetchJson(url);
  return ids.map((id) => data.result && data.result[id]).filter(Boolean);
}

async function fetchAbstracts(ids) {
  if (!ids.length) return {};
  const url = pubmedUrl('efetch.fcgi', {
    db: 'pubmed',
    retmode: 'xml',
    id: ids.join(',')
  });
  const response = await fetch(url, { headers: { Accept: 'application/xml,text/xml' } });
  if (!response.ok) throw new Error(`PubMed abstracts HTTP ${response.status}`);
  const xml = await response.text();
  const abstracts = {};
  const articles = xml.match(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/g) || [];
  articles.forEach((entry) => {
    const pmid = (entry.match(/<PMID[^>]*>(.*?)<\/PMID>/) || [])[1];
    const abstractParts = [...entry.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((match) => cleanText(match[1]));
    if (pmid) abstracts[pmid] = abstractParts.join(' ');
  });
  return abstracts;
}

function articleLink(summary) {
  const ids = Array.isArray(summary.articleids) ? summary.articleids : [];
  const doi = ids.find((item) => item.idtype === 'doi' && item.value);
  if (doi) return `https://doi.org/${doi.value}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${summary.uid}/`;
}

async function findRelevantArticles() {
  const ids = await searchPubMed();
  const summaries = await summarizePubMed(ids);
  const abstracts = await fetchAbstracts(ids);
  const articles = summaries.map((summary) => {
    const article = {
      pmid: String(summary.uid),
      title: cleanText(summary.title),
      journal: normalizeJournal(summary.fulljournalname || summary.source),
      publicationDate: summary.pubdate || summary.epubdate || '',
      publicationTypes: summary.pubtype || [],
      abstract: abstracts[String(summary.uid)] || '',
      link: articleLink(summary)
    };
    article.studyType = inferStudyType(article);
    article.score = scoreArticle(article);
    return article;
  });
  return articles
    .filter((article) => article.title && article.journal)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}

function buildMuralItem(article) {
  const summary = firstSentences(article.abstract, 2) || 'Artigo recente selecionado pelo radar Endodirect nas principais revistas de endocrinologia e metabolismo.';
  const why = practiceRelevance(article);
  const limitation = limitationFor(article.studyType);
  return {
    titulo: article.title,
    tipo: 'Artigo',
    fonte: article.journal,
    link: article.link,
    texto: `${article.studyType}. ${summary} Por que importa: ${why} Cautela: ${limitation}`,
    at: Date.now(),
    auto: true,
    sourceId: `pubmed:${article.pmid}`,
    pmid: article.pmid,
    publicationDate: article.publicationDate
  };
}

function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

async function loadGlobalPayload(serviceKey) {
  const url = `${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`;
  const response = await fetch(url, { headers: supabaseHeaders(serviceKey) });
  if (!response.ok) throw new Error(`Supabase leitura HTTP ${response.status}`);
  const rows = await response.json();
  return rows && rows[0] && rows[0].payload ? rows[0].payload : {};
}

async function saveGlobalPayload(serviceKey, payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(serviceKey),
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      id: 'main',
      payload,
      updated_by: 'vercel-cron:endocrine-radar',
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error(`Supabase gravacao HTTP ${response.status}`);
}

function mergeMuralItems(payload, incoming) {
  const now = Date.now();
  const current = Array.isArray(payload.adm_avisos) ? payload.adm_avisos : [];
  const existingKeys = new Set(current.map((item) => item && (item.sourceId || item.link || item.titulo)).filter(Boolean));
  const fresh = incoming.filter((item) => !existingKeys.has(item.sourceId) && !existingKeys.has(item.link) && !existingKeys.has(item.titulo));
  const retained = current.filter((item) => {
    if (!(item && item.auto && String(item.sourceId || '').startsWith('pubmed:'))) return true;
    const itemTime = Number(item.at) || 0;
    return now - itemTime < AUTO_ITEM_TTL_MS;
  });
  return {
    payload: {
      ...payload,
      adm_avisos: [...fresh, ...retained].slice(0, MAX_MURAL_ITEMS)
    },
    fresh
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return json(res, 401, { ok: false, error: 'Nao autorizado.' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return json(res, 500, {
      ok: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY ausente nas variaveis de ambiente do Vercel.'
    });
  }

  try {
    const articles = await findRelevantArticles();
    const incoming = articles.map(buildMuralItem);
    const payload = await loadGlobalPayload(serviceKey);
    const merged = mergeMuralItems(payload, incoming);
    await saveGlobalPayload(serviceKey, merged.payload);
    return json(res, 200, {
      ok: true,
      inserted: merged.fresh.length,
      considered: incoming.length,
      items: merged.fresh.map((item) => ({
        titulo: item.titulo,
        fonte: item.fonte,
        link: item.link
      }))
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error && error.message ? error.message : 'Falha ao atualizar o radar de endocrinologia.'
    });
  }
};
