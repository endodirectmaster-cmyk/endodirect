// Radar de endocrinologia — logica compartilhada entre o cron
// (/api/cron/endocrine-radar) e o endpoint do admin (/api/admin/refresh-radar).
// Busca artigos recentes no PubMed, resume em PT (Anthropic, com fallback) e
// grava em endodirect_global_state.payload.radar_avisos (campo proprio do cron;
// nunca toca em adm_avisos, que e do professor).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const MAX_MURAL_ITEMS = 160;
const AUTO_ITEM_TTL_MS = 45 * 24 * 60 * 60 * 1000;
const ARTICLES_PER_DAY = 3;
const ARTICLES_PER_SUBSPECIALTY = 3;
const AI_CONCURRENCY = 4;
const AI_TIMEOUT_MS = 20000;

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
  { name: 'Endocrinology', query: 'Endocrinology', weight: 7 },
  // Endocrinologia geral e PEDIÁTRICA (abreviações NLM do PubMed)
  { name: 'European Journal of Endocrinology', query: 'Eur J Endocrinol', weight: 8 },
  { name: 'Hormone Research in Paediatrics', query: 'Horm Res Paediatr', weight: 7 },
  { name: 'Journal of Pediatric Endocrinology and Metabolism', query: 'J Pediatr Endocrinol Metab', weight: 7 },
  { name: 'Annals of Pediatric Endocrinology & Metabolism', query: 'Ann Pediatr Endocrinol Metab', weight: 7 }
];

const TOPIC_QUERY = [
  'endocrinology', 'diabetes', 'obesity', 'thyroid', 'adrenal', 'pituitary',
  'hypogonadism', 'osteoporosis', 'bone mineral', 'metabolism', 'glucose', 'insulin',
  'GLP-1', 'semaglutide', 'tirzepatide',
  'lipid', 'cholesterol', 'LDL', 'statin', 'dyslipidemia',
  'polycystic ovary', 'PCOS', 'testosterone', 'menopause', 'fertility', 'reproductive',
  'pediatric', 'paediatric', 'children', 'puberty', 'precocious puberty', 'growth hormone',
  'short stature', 'congenital adrenal hyperplasia', 'Turner syndrome'
].map((term) => `${term}[Title/Abstract]`).join(' OR ');

// Subespecialidades: o radar seleciona ~3 artigos/dia de cada uma (incluindo
// Pediatria). Cada uma tem seus termos de busca no PubMed.
const SUBSPECIALTIES = [
  { nome: 'Diabetes', terms: ['diabetes', 'glucose', 'insulin', 'HbA1c', 'glycemic', 'SGLT2', 'GLP-1', 'semaglutide', 'tirzepatide', 'continuous glucose'] },
  { nome: 'Obesidade', terms: ['obesity', 'overweight', 'weight loss', 'bariatric', 'tirzepatide', 'semaglutide', 'GLP-1', 'MASH', 'metabolic'] },
  { nome: 'Tireoide', terms: ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'Graves disease', 'Hashimoto', 'thyroid nodule', 'thyroid cancer'] },
  { nome: 'Adrenal', terms: ['adrenal', 'Cushing', 'primary aldosteronism', 'pheochromocytoma', 'adrenal insufficiency', 'congenital adrenal hyperplasia'] },
  { nome: 'Neuroendocrinologia', terms: ['pituitary', 'prolactinoma', 'acromegaly', 'Cushing disease', 'diabetes insipidus', 'hypopituitarism', 'neuroendocrine tumor'] },
  { nome: 'Osteometabolismo', terms: ['osteoporosis', 'bone mineral density', 'parathyroid', 'hyperparathyroidism', 'vitamin D', 'hypophosphatemia', 'fracture risk'] },
  { nome: 'Dislipidemia', terms: ['dyslipidemia', 'LDL cholesterol', 'statin', 'PCSK9', 'triglycerides', 'lipoprotein', 'hypercholesterolemia'] },
  { nome: 'Endocrinologia Feminina', terms: ['polycystic ovary', 'PCOS', 'menopause', 'menopausal hormone therapy', 'female fertility', 'hyperandrogenism'] },
  { nome: 'Endocrinologia Masculina', terms: ['testosterone', 'male hypogonadism', 'andropause', 'erectile dysfunction'] },
  { nome: 'Pediatria', terms: ['pediatric endocrinology', 'precocious puberty', 'growth hormone', 'short stature', 'Turner syndrome', 'congenital hypothyroidism', 'pediatric diabetes', 'pediatric obesity'] }
];

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function journalMatches(title, journal) {
  const clean = cleanText(title).toLowerCase();
  const query = cleanText(journal.query).toLowerCase();
  const name = cleanText(journal.name).toLowerCase();
  return clean === query || clean === name || clean.includes(query) || clean.includes(name);
}

function normalizeJournal(title) {
  const clean = cleanText(title);
  const found = JOURNALS.find((journal) => journalMatches(clean, journal));
  return found ? found.name : clean;
}

function inferStudyType(article) {
  const haystack = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')}`.toLowerCase();
  if (haystack.includes('randomized') || haystack.includes('randomised') || haystack.includes('clinical trial')) return 'Ensaio clinico randomizado';
  if (haystack.includes('guideline') || haystack.includes('consensus')) return 'Diretriz/consenso';
  if (haystack.includes('meta-analysis') || haystack.includes('systematic review')) return 'Revisao sistematica/metanalise';
  if (haystack.includes('cohort') || haystack.includes('prospective')) return 'Estudo de coorte';
  if (haystack.includes('case-control')) return 'Caso-controle';
  if (haystack.includes('review')) return 'Revisao narrativa';
  return 'Artigo cientifico';
}

function portugueseFocus(article) {
  const h = `${article.title} ${article.abstract}`.toLowerCase();
  if (h.includes('lipid') || h.includes('cholesterol') || h.includes('ldl') || h.includes('statin') || h.includes('dyslipid')) return 'lipides, dislipidemia e risco cardiovascular';
  if (h.includes('pcos') || h.includes('polycystic') || h.includes('fertility') || h.includes('reproductive') || h.includes('testosterone') || h.includes('menopause') || h.includes('hypogonad')) return 'reproducao, eixo gonadal e saude hormonal';
  if (h.includes('diabetes') || h.includes('glucose') || h.includes('insulin')) return 'diabetes, tecnologia e controle metabolico';
  if (h.includes('obesity') || h.includes('weight') || h.includes('glp-1') || h.includes('tirzepatide')) return 'obesidade, farmacoterapia metabolica e risco cardiometabolico';
  if (h.includes('thyroid') || h.includes('hypothyroidism')) return 'tireoide, diagnostico e acompanhamento clinico';
  if (h.includes('adrenal') || h.includes('aldosterone') || h.includes('cushing')) return 'adrenal, hipertensao secundaria e endocrinologia clinica';
  if (h.includes('pituitary')) return 'hipofise e neuroendocrinologia';
  if (h.includes('bone') || h.includes('osteoporosis') || h.includes('mineral')) return 'osso, metabolismo mineral e risco de fratura';
  return 'endocrinologia e metabolismo';
}

function practiceRelevance(article) {
  const h = `${article.title} ${article.abstract}`.toLowerCase();
  if (h.includes('lipid') || h.includes('cholesterol') || h.includes('ldl') || h.includes('statin') || h.includes('dyslipid')) return 'pode refinar o manejo da dislipidemia e a reducao de risco cardiovascular.';
  if (h.includes('pcos') || h.includes('polycystic') || h.includes('fertility') || h.includes('reproductive') || h.includes('testosterone') || h.includes('menopause') || h.includes('hypogonad')) return 'ajuda em decisoes de saude reprodutiva, SOP, hipogonadismo e reposicao hormonal.';
  if (h.includes('diabetes') || h.includes('glucose') || h.includes('insulin')) return 'pode refinar decisoes de acompanhamento, tratamento e estratificacao de risco em diabetes e metabolismo.';
  if (h.includes('obesity') || h.includes('weight') || h.includes('glp-1') || h.includes('tirzepatide')) return 'ajuda a atualizar condutas em obesidade, farmacoterapia metabolica e reducao de risco cardiometabolico.';
  if (h.includes('thyroid')) return 'pode impactar investigacao, seguimento e tomada de decisao em doencas tireoidianas.';
  if (h.includes('adrenal') || h.includes('pituitary')) return 'traz pontos uteis para diagnostico e manejo de endocrinopatias adrenal/hipofisarias.';
  return 'merece leitura por possivel impacto em ensino, atualizacao clinica e pratica endocrinologica.';
}

function limitationFor(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('ensaio')) return 'confirmar criterios de inclusao, desfechos e aplicabilidade ao perfil dos pacientes antes de mudar conduta.';
  if (t.includes('revisao') || t.includes('metanalise')) return 'interpretar a luz da qualidade dos estudos incluidos e de eventual heterogeneidade.';
  if (t.includes('coorte') || t.includes('caso-controle')) return 'associacao observacional nao prova causalidade e pode ter confundimento residual.';
  if (t.includes('diretriz')) return 'adaptar recomendacoes ao contexto local, disponibilidade e preferencias do paciente.';
  return 'ler o artigo completo antes de extrapolar os achados.';
}

function scoreArticle(article) {
  const journal = JOURNALS.find((item) => journalMatches(article.journal, item));
  let score = journal ? journal.weight : 4;
  const haystack = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')}`.toLowerCase();
  ['randomized', 'clinical trial', 'guideline', 'consensus', 'meta-analysis', 'systematic review', 'phase 3'].forEach((term) => {
    if (haystack.includes(term)) score += 2;
  });
  ['editorial', 'letter', 'comment', 'erratum', 'retraction'].forEach((term) => {
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
  const term = `(${journalQuery}) AND (${TOPIC_QUERY}) AND ("last 30 days"[PDat])`;
  const url = pubmedUrl('esearch.fcgi', { db: 'pubmed', retmode: 'json', retmax: '80', sort: 'date', term });
  const data = await fetchJson(url);
  return (data.esearchresult && data.esearchresult.idlist) || [];
}

// Busca IDs no PubMed para uma lista de termos (de uma subespecialidade),
// restrita às revistas selecionadas e aos últimos 30 dias.
async function searchPubMedFor(terms) {
  const journalQuery = JOURNALS.map((journal) => `"${journal.query}"[Journal]`).join(' OR ');
  const topicQuery = (terms || []).map((t) => `${t}[Title/Abstract]`).join(' OR ');
  const term = `(${journalQuery}) AND (${topicQuery}) AND ("last 30 days"[PDat])`;
  const url = pubmedUrl('esearch.fcgi', { db: 'pubmed', retmode: 'json', retmax: '30', sort: 'date', term });
  const data = await fetchJson(url);
  return (data.esearchresult && data.esearchresult.idlist) || [];
}

async function summarizePubMed(ids) {
  if (!ids.length) return [];
  const url = pubmedUrl('esummary.fcgi', { db: 'pubmed', retmode: 'json', id: ids.join(',') });
  const data = await fetchJson(url);
  return ids.map((id) => data.result && data.result[id]).filter(Boolean);
}

async function fetchAbstracts(ids) {
  if (!ids.length) return {};
  const url = pubmedUrl('efetch.fcgi', { db: 'pubmed', retmode: 'xml', id: ids.join(',') });
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

function isMetaAnalysis(article) {
  const h = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')} ${article.studyType || ''}`.toLowerCase();
  return h.includes('meta-analysis') || h.includes('meta analysis') || h.includes('metanal') || h.includes('systematic review');
}

async function findRelevantArticles(excludeKeys) {
  const exclude = excludeKeys instanceof Set ? excludeKeys : new Set();
  // 1) Busca IDs por subespecialidade (sequencial p/ respeitar o PubMed).
  const idsBySub = {};
  const allIds = new Set();
  for (const sub of SUBSPECIALTIES) {
    try {
      const ids = await searchPubMedFor(sub.terms);
      idsBySub[sub.nome] = ids;
      ids.forEach((id) => allIds.add(id));
    } catch (e) { idsBySub[sub.nome] = []; }
  }
  if (!allIds.size) return [];
  // 2) Resumos + abstracts em lote (união de todos os IDs).
  const idList = [...allIds];
  const summaries = await summarizePubMed(idList);
  const abstracts = await fetchAbstracts(idList);
  const byId = {};
  summaries.forEach((s) => { if (s && s.uid) byId[String(s.uid)] = s; });
  function toArticle(id) {
    const summary = byId[String(id)];
    if (!summary) return null;
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
  }
  // 3) Top ~N por subespecialidade, deduplicando entre elas e contra o existente.
  const chosen = [];
  const used = new Set();
  for (const sub of SUBSPECIALTIES) {
    const arts = (idsBySub[sub.nome] || [])
      .map(toArticle)
      .filter(Boolean)
      .filter((a) => a.title && a.journal)
      .filter((a) => !exclude.has(`pubmed:${a.pmid}`) && !exclude.has(String(a.pmid)) && !exclude.has(a.link) && !exclude.has(a.title))
      .filter((a) => !used.has(a.pmid))
      .sort((a, b) => b.score - a.score);
    for (const a of arts.slice(0, ARTICLES_PER_SUBSPECIALTY)) {
      a.subespecialidade = sub.nome;
      used.add(a.pmid);
      chosen.push(a);
    }
  }
  return chosen;
}

function existingMuralKeys(payload) {
  // Deduplica contra o radar automatico E contra os avisos manuais do professor.
  const items = (Array.isArray(payload.radar_avisos) ? payload.radar_avisos : [])
    .concat(Array.isArray(payload.adm_avisos) ? payload.adm_avisos : []);
  const keys = new Set();
  items.forEach((item) => {
    if (!item) return;
    if (item.sourceId) keys.add(item.sourceId);
    if (item.pmid) { keys.add(String(item.pmid)); keys.add(`pubmed:${item.pmid}`); }
    if (item.link) keys.add(item.link);
    if (item.titulo) keys.add(item.titulo);
  });
  // Itens ocultados pelo professor nunca voltam.
  (Array.isArray(payload.radar_hidden) ? payload.radar_hidden : []).forEach((k) => {
    if (!k) return;
    keys.add(k);
    keys.add(String(k).replace(/^pubmed:/, ''));
  });
  return keys;
}

async function summarizeWithAI(apiKey, article) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  const system = 'Voce e um endocrinologista que resume evidencias para outros medicos, em portugues do Brasil, com rigor, sem exageros e sem inventar dados. Responda APENAS com JSON valido.';
  const prompt = `Resuma o artigo cientifico abaixo para o mural do Endodirect.
Titulo: ${article.title}
Revista: ${article.journal}
Tipo inferido: ${article.studyType}
Abstract: ${article.abstract || '(abstract nao disponivel)'}

Responda SOMENTE com JSON neste formato exato:
{"tipo":"<tipo de estudo em portugues>","resumo":"<3 a 5 linhas: objetivo, metodo e principal achado, em portugues claro>","porque":"<1-2 frases: por que importa na pratica clinica>","cautela":"<1 frase de cautela/limitacao metodologica>"}
Regras: use apenas informacao presente no abstract/titulo; nao invente numeros; se o abstract faltar, seja conservador. Texto sempre em portugues do Brasil.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, system, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return null;
    const txt = Array.isArray(data.content) ? ((data.content.find((p) => p && p.type === 'text') || {}).text || '') : '';
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const obj = JSON.parse(m[0]);
    if (!obj || !obj.resumo) return null;
    return obj;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function buildMuralItem(article, apiKey) {
  const ai = await summarizeWithAI(apiKey, article);
  const tipoEstudo = (ai && ai.tipo) || article.studyType;
  const resumo = (ai && ai.resumo)
    || `Artigo recente sobre ${portugueseFocus(article)}, publicado em ${article.journal} e selecionado pelo radar Endodirect entre revistas lideres de endocrinologia e metabolismo. Consulte o resumo original (em ingles) pelo link para os detalhes.`;
  const porque = (ai && ai.porque) || practiceRelevance(article);
  const cautela = (ai && ai.cautela) || limitationFor(tipoEstudo);
  const pubmedLink = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;
  const fontes = `PubMed (${pubmedLink})` + (article.link && article.link !== pubmedLink ? ` · Artigo/DOI (${article.link})` : '');
  const dataLinha = article.publicationDate ? `Data de publicacao: ${article.publicationDate}\n` : '';
  const texto =
`${dataLinha}Tipo de estudo: ${tipoEstudo}
Resumo: ${resumo}
Por que importa na pratica: ${porque}
Cautela/limitacao: ${cautela}
Fontes consultadas: ${fontes}`;
  return {
    titulo: article.title,
    tipo: 'Artigo',
    fonte: article.journal,
    link: article.link,
    texto,
    at: Date.now(),
    auto: true,
    sourceId: `pubmed:${article.pmid}`,
    pmid: article.pmid,
    studyType: tipoEstudo,
    subespecialidade: article.subespecialidade || '',
    publicationDate: article.publicationDate,
    aiSummary: !!ai
  };
}

// Executa uma função sobre uma lista com concorrência limitada (evita estourar
// o tempo do cron e o rate limit da API de IA).
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  const workers = [];
  for (let w = 0; w < Math.min(limit, items.length); w++) workers.push(worker());
  await Promise.all(workers);
  return out;
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
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Supabase leitura HTTP ${response.status}${detail ? ': ' + detail.slice(0, 300) : ''}`);
  }
  const rows = await response.json();
  return rows && rows[0] && rows[0].payload ? rows[0].payload : {};
}

async function saveGlobalPayload(serviceKey, payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?on_conflict=id`, {
    method: 'POST',
    headers: { ...supabaseHeaders(serviceKey), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'main', payload, updated_by: null, updated_at: new Date().toISOString() })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Supabase gravacao HTTP ${response.status}${detail ? ': ' + detail.slice(0, 300) : ''}`);
  }
}

function mergeMuralItems(payload, incoming) {
  const now = Date.now();
  // O radar tem campo proprio (radar_avisos); nunca toca em adm_avisos (professor).
  const current = Array.isArray(payload.radar_avisos) ? payload.radar_avisos : [];
  const keyOf = (item) => item && (item.sourceId || item.link || item.titulo);
  const incomingByKey = new Map(incoming.map((item) => [keyOf(item), item]).filter(([key]) => key));
  const existingKeys = new Set(current.map(keyOf).filter(Boolean));
  const fresh = incoming.filter((item) => !existingKeys.has(item.sourceId) && !existingKeys.has(item.link) && !existingKeys.has(item.titulo));
  const retained = current.filter((item) => {
    const itemTime = Number(item.at) || 0;
    return now - itemTime < AUTO_ITEM_TTL_MS;
  }).map((item) => {
    const replacement = incomingByKey.get(keyOf(item));
    return replacement ? { ...item, ...replacement, at: item.at || replacement.at } : item;
  });
  return {
    payload: { ...payload, radar_avisos: [...fresh, ...retained].slice(0, MAX_MURAL_ITEMS) },
    fresh
  };
}

// Executa o radar de ponta a ponta. Le as chaves de servico/IA do ambiente.
async function runRadar() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) ausente nas variaveis de ambiente.');
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const payload = await loadGlobalPayload(serviceKey);
  const articles = await findRelevantArticles(existingMuralKeys(payload));
  const incoming = await mapLimit(articles, AI_CONCURRENCY, (a) => buildMuralItem(a, anthropicKey));
  const merged = mergeMuralItems(payload, incoming);
  await saveGlobalPayload(serviceKey, merged.payload);
  return {
    inserted: merged.fresh.length,
    considered: incoming.length,
    aiSummaries: incoming.filter((i) => i.aiSummary).length,
    items: merged.fresh.map((item) => ({ titulo: item.titulo, fonte: item.fonte, link: item.link }))
  };
}

module.exports = { runRadar };
