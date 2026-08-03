// Radar de endocrinologia — logica compartilhada entre o cron
// (/api/cron/endocrine-radar) e o endpoint do admin (/api/admin/refresh-radar).
// Busca artigos recentes no PubMed, resume em PT (Anthropic, com fallback) e
// grava em endodirect_global_state.payload.radar_avisos (campo proprio do cron;
// nunca toca em adm_avisos, que e do professor).

const { runNews, isBreakingTrusted } = require('./news');
// Repescagem de acesso aberto: o PMC de um artigo costuma aparecer DIAS depois
// da publicação, e o radar pega o artigo no primeiro dia. Ver lib/pmc-repescagem.js.
const { candidatos: pmcCandidatos, consultarPmcids, aplicar: aplicarPmc,
        candidatosSemPmid, resolverPmidsPorTitulo, aplicarTitulos } = require('./pmc-repescagem');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
// Guarda ~90 dias de artigos do radar (a entrega ao aluno é janelada nos 200 mais
// recentes pelas RPCs; o resto vem sob demanda via endodirect_mural_radar_more —
// "Carregar mais" no Mural). O teto é uma trava de segurança dimensionada p/ ~90
// dias na taxa atual (~35/dia). O admin lê tudo direto do global_state.
const MAX_MURAL_ITEMS = 3200;
const AUTO_ITEM_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const ARTICLES_PER_DAY = 3;
const ARTICLES_PER_SUBSPECIALTY = 3;
// Teto de IDs por subespecialidade antes da uniao (10 subs x 15 = 150 <= 200),
// garantindo que toda subespecialidade — inclusive Pediatria — seja resumida.
const IDS_PER_SUBSPECIALTY = 15;
const AI_CONCURRENCY = 4;
const AI_TIMEOUT_MS = 20000;
// PubMed/NCBI: sem api_key o limite é ~3 req/s; com key, ~10/s. O radar faz
// ~10+ buscas sequenciais (uma por subespecialidade) + esummary/efetch, então
// paceamos as chamadas e tentamos de novo em 429/5xx — senão um throttle volta
// vazio em TODAS as buscas e o Mural "não acha nada" (pubmed=0).
const NCBI_API_KEY = (process.env.NCBI_API_KEY || process.env.PUBMED_API_KEY || '').trim();
const NCBI_TOOL = 'endodirect';
const NCBI_EMAIL = (process.env.NCBI_EMAIL || 'contato@endodirect.com.br').trim();
const PUBMED_MIN_INTERVAL_MS = NCBI_API_KEY ? 130 : 380;

const JOURNALS = [
  { name: 'The New England Journal of Medicine', query: 'N Engl J Med', weight: 10 },
  { name: 'The Lancet Diabetes & Endocrinology', query: 'Lancet Diabetes Endocrinol', weight: 10 },
  { name: 'Nature Reviews Endocrinology', query: 'Nat Rev Endocrinol', weight: 9 },
  { name: 'Nature Medicine', query: 'Nat Med', weight: 9 },
  { name: 'Diabetes Care', query: 'Diabetes Care', weight: 9 },
  { name: 'Endocrine Reviews', query: 'Endocr Rev', weight: 9 },
  { name: 'Journal of Clinical Endocrinology & Metabolism', query: 'J Clin Endocrinol Metab', weight: 8 },
  { name: 'Diabetes', query: 'Diabetes', weight: 8 },
  { name: 'Diabetes, Obesity and Metabolism', query: 'Diabetes Obes Metab', weight: 8 },
  { name: 'Obesity', query: 'Obesity (Silver Spring)', weight: 7 },
  { name: 'Endocrinology', query: 'Endocrinology', weight: 7 },
  // Endocrinologia geral e PEDIÁTRICA (abreviações NLM do PubMed)
  { name: 'European Journal of Endocrinology', query: 'Eur J Endocrinol', weight: 8 },
  { name: 'Hormone Research in Paediatrics', query: 'Horm Res Paediatr', weight: 7 },
  { name: 'Journal of Pediatric Endocrinology and Metabolism', query: 'J Pediatr Endocrinol Metab', weight: 7 },
  { name: 'Annals of Pediatric Endocrinology & Metabolism', query: 'Ann Pediatr Endocrinol Metab', weight: 7 },
  // Open-access de alto volume (endocrinologia geral) — peso menor p/ não dominar as líderes
  { name: 'Frontiers in Endocrinology', query: 'Front Endocrinol (Lausanne)', weight: 6 },
  // ── Ampliação de revistas (2026-07-20, pedido do professor: "puxar mais
  // notícias/revistas para o mural"). Todas são periódicos indexados no PubMed;
  // a busca continua restrita a temas endócrinos (TOPIC_QUERY / termos da
  // subespecialidade), então JAMA/Lancet/Cell Metab só entram com artigo endócrino.
  { name: 'The Lancet', query: 'Lancet', weight: 10 },
  { name: 'JAMA', query: 'JAMA', weight: 9 },
  { name: 'Cell Metabolism', query: 'Cell Metab', weight: 9 },
  { name: 'Thyroid', query: 'Thyroid', weight: 9 },
  { name: 'Diabetologia', query: 'Diabetologia', weight: 8 },
  { name: 'Journal of Bone and Mineral Research', query: 'J Bone Miner Res', weight: 8 },
  { name: 'Metabolism: Clinical and Experimental', query: 'Metabolism', weight: 7 },
  { name: 'Journal of the Endocrine Society', query: 'J Endocr Soc', weight: 7 },
  { name: 'Clinical Endocrinology', query: 'Clin Endocrinol (Oxf)', weight: 7 },
  { name: 'Pituitary', query: 'Pituitary', weight: 7 },
  { name: 'European Thyroid Journal', query: 'Eur Thyroid J', weight: 7 },
  { name: 'Osteoporosis International', query: 'Osteoporos Int', weight: 7 },
  { name: 'Archives of Endocrinology and Metabolism', query: 'Arch Endocrinol Metab', weight: 7 },
  { name: 'Bone', query: 'Bone', weight: 6 }
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
// Endocrinologia Pediátrica). Os nomes batem com os do filtro do mural. Cada
// uma tem seus termos de busca no PubMed.
const SUBSPECIALTIES = [
  { nome: 'Diabetes', terms: ['diabetes', 'glucose', 'insulin', 'HbA1c', 'glycemic', 'SGLT2', 'GLP-1', 'semaglutide', 'tirzepatide', 'continuous glucose'] },
  { nome: 'Obesidade', terms: ['obesity', 'overweight', 'weight loss', 'bariatric', 'tirzepatide', 'semaglutide', 'GLP-1', 'MASH', 'metabolic'] },
  { nome: 'Tireoide', terms: ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'Graves disease', 'Hashimoto', 'thyroid nodule', 'thyroid cancer'] },
  { nome: 'Adrenal', terms: ['adrenal', 'Cushing', 'primary aldosteronism', 'pheochromocytoma', 'adrenal insufficiency', 'congenital adrenal hyperplasia'] },
  { nome: 'Neuroendocrinologia', terms: ['pituitary', 'prolactinoma', 'acromegaly', 'Cushing disease', 'diabetes insipidus', 'hypopituitarism', 'neuroendocrine tumor'] },
  { nome: 'Osteometabolismo', terms: ['osteoporosis', 'bone mineral density', 'parathyroid', 'hyperparathyroidism', 'vitamin D', 'hypophosphatemia', 'fracture risk'] },
  { nome: 'Lípides', terms: ['dyslipidemia', 'LDL cholesterol', 'statin', 'PCSK9', 'triglycerides', 'lipoprotein', 'hypercholesterolemia'] },
  { nome: 'Endocrinologia Feminina', terms: ['polycystic ovary', 'PCOS', 'menopause', 'menopausal hormone therapy', 'female fertility', 'hyperandrogenism'] },
  { nome: 'Endocrinologia Masculina', terms: ['testosterone', 'male hypogonadism', 'andropause', 'erectile dysfunction'] },
  { nome: 'Endocrinologia Pediátrica', terms: ['pediatric endocrinology', 'precocious puberty', 'growth hormone', 'short stature', 'Turner syndrome', 'congenital hypothyroidism', 'pediatric diabetes', 'pediatric obesity'] }
];

// Rótulos canônicos para a classificação por IA. DEVEM casar com o cliente
// (MURAL_SUBSPECIALTY_FILTERS e MURAL_TYPES no index.html), senão o filtro do
// mural não reconhece. A IA escolhe 1 de cada; se falhar/devolver algo fora da
// lista, buildMuralItem cai no comportamento atual (bucket da busca / 'Artigo').
const SUB_NAMES = SUBSPECIALTIES.map((s) => s.nome);
const MURAL_TYPE_NAMES = ['Diretriz', 'Metanálise', 'Artigo de Revisão', 'Ensaio Clínico', 'Estudo Genético', 'Perspectiva Clínica', 'Estudo Original'];
function normLabel(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); }
function matchCanonical(value, list) {
  const v = normLabel(value);
  if (!v) return null;
  for (const item of list) { if (normLabel(item) === v) return item; }
  return null;
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function jnorm(s) {
  // Normaliza para comparar periódicos: minúsculas, "&"→"and", sem "the " inicial.
  return cleanText(s).toLowerCase().replace(/&/g, 'and').replace(/^the\s+/, '').replace(/\s+/g, ' ').trim();
}
function journalMatches(title, journal) {
  const clean = jnorm(title);
  const query = jnorm(journal.query);
  const name = jnorm(journal.name);
  if (!clean) return false;
  if (clean === query || clean === name) return true;
  // Substring SÓ para identificadores específicos (multi-palavra). Sem isto, nomes
  // genéricos de 1 palavra ("Endocrinology", "Diabetes", "Obesity") capturavam
  // outros periódicos (ex.: JCEM saía como "Endocrinology").
  if (name && name.indexOf(' ') >= 0 && clean.includes(name)) return true;
  if (query && query.indexOf(' ') >= 0 && clean.includes(query)) return true;
  return false;
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
  // Identificação + chave (recomendado pela NCBI; sem isso o IP leva throttle).
  url.searchParams.set('tool', NCBI_TOOL);
  url.searchParams.set('email', NCBI_EMAIL);
  if (NCBI_API_KEY) url.searchParams.set('api_key', NCBI_API_KEY);
  return url.toString();
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
// Pacer global: respeita o limite de req/s da NCBI entre chamadas sequenciais.
let _pubmedLast = 0;
async function pubmedPace() {
  const wait = _pubmedLast + PUBMED_MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  _pubmedLast = Date.now();
}
// fetch com pacing + retry/backoff em 429/5xx/erro de rede. Sem isto, um único
// 429 derruba a busca da subespecialidade e o radar volta vazio.
async function pubmedFetch(url, opts) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    await pubmedPace();
    try {
      const response = await fetch(url, opts);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) { lastErr = new Error('PubMed HTTP ' + response.status); await sleep(700 * (i + 1)); continue; }
      throw new Error('PubMed respondeu HTTP ' + response.status);
    } catch (e) { lastErr = e; await sleep(500 * (i + 1)); }
  }
  throw lastErr || new Error('PubMed indisponível');
}

async function fetchJson(url) {
  const response = await pubmedFetch(url, { headers: { Accept: 'application/json' } });
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

// Quebra em lotes (o PubMed nao aceita centenas de IDs numa URL so).
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function summarizePubMed(ids) {
  if (!ids.length) return [];
  const out = [];
  for (const part of chunk(ids, 50)) {
    try {
      const url = pubmedUrl('esummary.fcgi', { db: 'pubmed', retmode: 'json', id: part.join(',') });
      const data = await fetchJson(url);
      part.forEach((id) => { const r = data.result && data.result[id]; if (r) out.push(r); });
    } catch (e) { /* lote falho e ignorado */ }
  }
  return out;
}

async function fetchAbstracts(ids) {
  if (!ids.length) return {};
  const abstracts = {};
  for (const part of chunk(ids, 50)) {
    try {
      const url = pubmedUrl('efetch.fcgi', { db: 'pubmed', retmode: 'xml', id: part.join(',') });
      const response = await pubmedFetch(url, { headers: { Accept: 'application/xml,text/xml' } });
      if (!response.ok) continue;
      const xml = await response.text();
      const articles = xml.match(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/g) || [];
      articles.forEach((entry) => {
        const pmid = (entry.match(/<PMID[^>]*>(.*?)<\/PMID>/) || [])[1];
        const abstractParts = [...entry.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((match) => cleanText(match[1]));
        if (pmid) abstracts[pmid] = abstractParts.join(' ');
      });
    } catch (e) { /* lote falho e ignorado */ }
  }
  return abstracts;
}

function articleLink(summary) {
  const ids = Array.isArray(summary.articleids) ? summary.articleids : [];
  // Preferir o TEXTO COMPLETO ABERTO ao público (PubMed Central) quando existir —
  // a presença de um PMC id indica full-text livre. Só então cai no DOI (editora,
  // que pode ser paywall) e, por fim, na página de resumo do PubMed.
  const pmc = ids.find((item) => (item.idtype === 'pmc' || item.idtype === 'pmcid') && item.value);
  if (pmc) {
    const num = String(pmc.value).replace(/[^0-9]/g, '');
    if (num) return `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${num}/`;
  }
  const doi = ids.find((item) => item.idtype === 'doi' && item.value);
  if (doi) return `https://doi.org/${doi.value}`;
  return `https://pubmed.ncbi.nlm.nih.gov/${summary.uid}/`;
}
// Verdadeiro quando o link aponta para o texto completo aberto (PubMed Central).
function isOpenAccessLink(link) { return /\/pmc\/articles\//.test(String(link || '')); }

function isMetaAnalysis(article) {
  const h = `${article.title} ${article.abstract} ${(article.publicationTypes || []).join(' ')} ${article.studyType || ''}`.toLowerCase();
  return h.includes('meta-analysis') || h.includes('meta analysis') || h.includes('metanal') || h.includes('systematic review');
}

async function findRelevantArticles(excludeKeys) {
  const exclude = excludeKeys instanceof Set ? excludeKeys : new Set();
  // 1) Busca IDs por subespecialidade (sequencial p/ respeitar o PubMed).
  // Limita por subespecialidade ANTES da uniao: assim todas (inclusive as
  // ultimas da lista, como Pediatria) cabem no teto de resumos e nao sao
  // cortadas. esearch ja vem ordenado por data, entao ficamos com os recentes.
  const idsBySub = {};
  const allIds = new Set();
  for (const sub of SUBSPECIALTIES) {
    try {
      const ids = (await searchPubMedFor(sub.terms)).slice(0, IDS_PER_SUBSPECIALTY);
      idsBySub[sub.nome] = ids;
      ids.forEach((id) => allIds.add(id));
    } catch (e) { idsBySub[sub.nome] = []; }
  }
  if (!allIds.size) return [];
  // 2) Resumos + abstracts em lote (união de todos os IDs; teto de segurança).
  const idList = [...allIds].slice(0, 200);
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
      .filter((a) => a.abstract && a.abstract.trim().length >= 200) // exige abstract real (corta vazios e avisos de copyright/embargo curtos)
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
  // A regra do "T4 livre" vale nos DOIS lugares que escrevem para o mural: o card
  // (aqui) e a discussao (lib/discussao.js). Pedido do professor em 03/08 olhando
  // a discussao; deixar so la faria o card do mesmo artigo dizer FT4 logo acima.
  const system = 'Voce e um endocrinologista que resume evidencias para outros medicos, em portugues do Brasil, com rigor, sem exageros e sem inventar dados. Escreva "T4 livre" e "T3 livre", nunca "FT4"/"FT3". Responda APENAS com JSON valido.';
  const prompt = `Resuma o artigo cientifico abaixo para o mural do Endodirect.
Titulo: ${article.title}
Revista: ${article.journal}
Tipo inferido: ${article.studyType}
Subespecialidade sugerida pela busca: ${article.subespecialidade || '(nao informada)'}
Abstract: ${article.abstract || '(abstract nao disponivel)'}

Responda SOMENTE com JSON neste formato exato:
{"semAbstract":<true|false>,"tipo":"<tipo de estudo em portugues>","subespecialidade":"<exatamente UM de: ${SUB_NAMES.join(' | ')}>","tipoMural":"<exatamente UM de: ${MURAL_TYPE_NAMES.join(' | ')}>","resumo":"<3 a 5 linhas: objetivo, metodo e principal achado, em portugues claro>","porque":"<1-2 frases: por que importa na pratica clinica>","cautela":"<1 frase de cautela/limitacao metodologica>"}
Defina "semAbstract": true se o campo Abstract estiver ausente, vazio, ou contiver apenas titulo/avisos editoriais/de copyright/embargo, sem conteudo cientifico suficiente para descrever metodos e achados; caso contrario false.
"subespecialidade": escolha a que melhor descreve o FOCO do artigo, usando EXATAMENTE um rotulo da lista (com acentos). "tipoMural": classifique o desenho do estudo em EXATAMENTE um rotulo da lista — Diretriz (guideline/consenso); Metanalise (metanalise ou revisao sistematica); Artigo de Revisao (revisao narrativa); Ensaio Clinico (ensaio/RCT); Estudo Genetico; Perspectiva Clinica (editorial/comentario/perspectiva); Estudo Original (demais: coorte, caso-controle, transversal, etc.).
Regras: use apenas informacao presente no abstract/titulo; nao invente numeros; se o abstract faltar, seja conservador. Texto sempre em portugues do Brasil.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, system, thinking: { type: 'disabled' }, messages: [{ role: 'user', content: prompt }] })
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

// Data do PubMed ("2026 Jun 13", "2026 May", "2026", "2026/06/13") → dd/mm/aaaa
// (ou mm/aaaa / aaaa quando faltam dia/mês). Espelha pubDateBR do index.html.
const PUBDATE_MES = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
function formatPubDateBR(s) {
  s = String(s || '').trim();
  if (!s || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
  let m = s.match(/^(\d{4})\s+([A-Za-z]{3,})\s+(\d{1,2})\b/);
  if (m) { const mo = PUBDATE_MES[m[2].slice(0, 3).toLowerCase()]; if (mo) return ('0' + m[3]).slice(-2) + '/' + mo + '/' + m[1]; }
  m = s.match(/^(\d{4})\s+([A-Za-z]{3,})$/);
  if (m) { const mo = PUBDATE_MES[m[2].slice(0, 3).toLowerCase()]; if (mo) return mo + '/' + m[1]; }
  m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (m) return ('0' + m[3]).slice(-2) + '/' + ('0' + m[2]).slice(-2) + '/' + m[1];
  return s;
}

async function buildMuralItem(article, apiKey) {
  const ai = await summarizeWithAI(apiKey, article);
  // Descarta artigos cujo abstract a IA julgou ausente/insuficiente — não vão ao mural.
  if (ai && ai.semAbstract === true) return null;
  const tipoEstudo = (ai && ai.tipo) || article.studyType;
  // Classificação canônica pela IA (com fallback seguro ao comportamento atual):
  // subespecialidade = rótulo da IA se válido, senão o bucket da busca; tipo do
  // card = rótulo MURAL_TYPES da IA se válido, senão 'Artigo' (cliente deriva).
  const subEsp = (ai && matchCanonical(ai.subespecialidade, SUB_NAMES)) || article.subespecialidade || '';
  const tipoMural = (ai && matchCanonical(ai.tipoMural, MURAL_TYPE_NAMES)) || 'Artigo';
  const resumo = (ai && ai.resumo)
    || `Artigo recente sobre ${portugueseFocus(article)}, publicado em ${article.journal} e selecionado pelo radar Endodirect entre revistas lideres de endocrinologia e metabolismo. Consulte o resumo original (em ingles) pelo link para os detalhes.`;
  const porque = (ai && ai.porque) || practiceRelevance(article);
  const cautela = (ai && ai.cautela) || limitationFor(tipoEstudo);
  const dataLinha = article.publicationDate ? `📅 Data de publicação: ${formatPubDateBR(article.publicationDate)}\n` : '';
  const texto =
`${dataLinha}🔬 Tipo de estudo: ${tipoEstudo}
📝 Resumo: ${resumo}
💡 Na prática: ${porque}
⚠️ Cautela/limitação: ${cautela}`;
  return {
    titulo: article.title,
    tipo: tipoMural,
    fonte: article.journal,
    link: article.link,
    oa: isOpenAccessLink(article.link),
    texto,
    at: Date.now(),
    auto: true,
    sourceId: `pubmed:${article.pmid}`,
    pmid: article.pmid,
    studyType: tipoEstudo,
    subespecialidade: subEsp,
    publicationDate: formatPubDateBR(article.publicationDate),
    aiSummary: !!ai,
    resumo,
    porque
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

// ── Informes das sociedades (SBEM etc.) via RSS do site (WordPress) ──
// Complementa o PubMed com comunicados/posicionamentos/notas oficiais que NÃO
// estão indexados. É best-effort: qualquer falha (rede, parse, IA) devolve []
// e NUNCA derruba o radar. O site é WordPress → cada categoria tem feed em
// /categoria_noticias/<slug>/feed/. "Posicionamentos e Notas Oficiais" = a
// seção "Informes" pedida (slug comunicados-oficiais).
const SOCIETY_SOURCES = [
  {
    sigla: 'SBEM',
    nome: 'Sociedade Brasileira de Endocrinologia e Metabologia',
    feeds: [
      { url: 'https://www.endocrino.org.br/categoria_noticias/comunicados-oficiais/feed/' }
    ]
  },
  {
    sigla: 'SBD',
    nome: 'Sociedade Brasileira de Diabetes',
    // Blog de notícias da SBD (WordPress). Vários candidatos de feed — o fetch
    // tenta cada um; dedup por link cobre sobreposição; cap por feed evita excesso.
    feeds: [
      { url: 'https://diabetes.org.br/blog/feed/' },
      { url: 'https://diabetes.org.br/feed/' }
    ]
  }
  // ATA (American Thyroid Association) e Endocrine Society (Endocrine News) foram
  // REMOVIDAS a pedido do usuário (2026-07-23, "tirar os comunicados da ATA e
  // endocrine society"): o radar não puxa mais esses comunicados, e os 22 itens já
  // gravados foram apagados do mural + adicionados ao radar_hidden. As revistas
  // científicas (Thyroid, J Endocr Soc etc.) via PubMed seguem normalmente.
];
const SOCIETY_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // posicionamentos são esparsos → janela maior
const SOCIETY_MAX_PER_FEED = 8;

function stripHtml(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, function (m, n) { try { return String.fromCharCode(parseInt(n, 10)); } catch (e) { return ' '; } })
    .replace(/&#x([0-9a-f]+);/gi, function (m, n) { try { return String.fromCharCode(parseInt(n, 16)); } catch (e) { return ' '; } })
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}
function rssTag(block, tag) {
  const m = block.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return m ? m[1] : '';
}
function parseRssItems(xml) {
  const items = [];
  // RSS 2.0 (<item>) com fallback para Atom (<entry>, ex.: feed do NEJM).
  const blocks = (String(xml || '').match(/<item\b[\s\S]*?<\/item>/gi))
    || (String(xml || '').match(/<entry\b[\s\S]*?<\/entry>/gi)) || [];
  for (const b of blocks) {
    if (items.length >= 40) break;
    const title = stripHtml(rssTag(b, 'title'));
    let link = stripHtml(rssTag(b, 'link'));
    if (!/^https?:\/\//i.test(link)) { const hm = b.match(/<link\b[^>]*href=["']([^"']+)["']/i); if (hm && /^https?:\/\//i.test(hm[1])) link = hm[1]; } // Atom: <link href="...">
    if (!/^https?:\/\//i.test(link)) { const g = stripHtml(rssTag(b, 'guid') || rssTag(b, 'id')); if (/^https?:\/\//i.test(g)) link = g; }
    const pubDate = stripHtml(rssTag(b, 'pubDate') || rssTag(b, 'dc:date') || rssTag(b, 'published') || rssTag(b, 'updated'));
    const desc = rssTag(b, 'content:encoded') || rssTag(b, 'description') || rssTag(b, 'summary') || rssTag(b, 'content');
    if (title) items.push({ title, link, pubDate, summary: stripHtml(desc) });
  }
  return items;
}
async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || 12000);
  try {
    const r = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'EndodirectRadar/1.0 (+https://www.endodirect.com.br)', Accept: 'application/rss+xml, application/xml, text/xml, */*' } });
    if (!r.ok) return '';
    return await r.text();
  } catch (e) { return ''; } finally { clearTimeout(timer); }
}
async function summarizeSocietyWithAI(apiKey, entry, sigla) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  const system = 'Voce e um endocrinologista que resume comunicados de sociedades medicas para outros medicos, em portugues do Brasil, com rigor e sem inventar dados. Responda APENAS com JSON valido.';
  const prompt = `Resuma o comunicado/posicionamento oficial abaixo (fonte: ${sigla}) para o mural do Endodirect.
Titulo: ${entry.title}
Conteudo: ${String(entry.summary || '').slice(0, 4000)}

Responda SOMENTE com JSON neste formato exato:
{"resumo":"<texto FORMAL e COMPLETO, de 4 a 8 linhas, em prosa corrida, descrevendo o que o comunicado/posicionamento diz, seu contexto e suas orientacoes; SEM topicos, SEM emojis, SEM rotulos como 'Resumo' ou 'Por que importa'>"}
Regras: registro formal e impessoal (como uma nota oficial); use apenas o conteudo fornecido; nao invente numeros nem afirmacoes; portugues do Brasil.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 600, system, thinking: { type: 'disabled' }, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return null;
    const txt = Array.isArray(data.content) ? ((data.content.find((p) => p && p.type === 'text') || {}).text || '') : '';
    const mm = txt.match(/\{[\s\S]*\}/);
    if (!mm) return null;
    const obj = JSON.parse(mm[0]);
    if (!obj || !obj.resumo) return null;
    return obj;
  } catch (e) { return null; } finally { clearTimeout(timer); }
}
// Busca os Informes das sociedades e monta itens no MESMO formato do mural.
async function fetchSocietyItems(excludeKeys, apiKey) {
  const out = [];
  for (const src of SOCIETY_SOURCES) {
    for (const feed of src.feeds) {
      let xml = '';
      try { xml = await fetchText(feed.url, 12000); } catch (e) { xml = ''; }
      if (!xml || xml.indexOf('<item') < 0) continue;
      const entries = parseRssItems(xml).slice(0, SOCIETY_MAX_PER_FEED);
      for (const e of entries) {
        if (!e.title || !/^https?:\/\//i.test(e.link || '')) continue;
        if (excludeKeys.has(e.link) || excludeKeys.has(e.title) || excludeKeys.has(`society:${src.sigla}:${e.link}`)) continue;
        const t = Date.parse(e.pubDate || '');
        if (Number.isFinite(t) && (Date.now() - t) > SOCIETY_MAX_AGE_MS) continue;
        let ai = null;
        try { ai = await summarizeSocietyWithAI(apiKey, e, src.sigla); } catch (er) { ai = null; }
        const resumo = (ai && ai.resumo) || String(e.summary || '').slice(0, 800);
        if (!resumo) continue;
        // Anexo formal opcional (compat. com IA antiga que ainda devolver "porque");
        // NÃO usamos mais o modelo "📝 Resumo / 💡 Por que importa" — o professor
        // pediu que comunicados/diretrizes/consensos sejam texto corrido e formal.
        const porque = (ai && ai.porque) || '';
        const subEsp = '';              // Informe de sociedade nao tem subespecialidade especifica
        const tipoMural = 'Comunicado'; // todos os Informes de sociedade entram como "Comunicado"
        const dataBR = Number.isFinite(t) ? new Date(t).toLocaleDateString('pt-BR') : '';
        const texto =
`${dataBR ? 'Publicado em: ' + dataBR + '\n' : ''}Fonte: ${src.sigla} (${src.nome})

${resumo}${porque ? '\n\n' + porque : ''}`;
        out.push({
          titulo: e.title,
          tipo: tipoMural,
          fonte: src.sigla,
          link: e.link,
          texto,
          at: Date.now(),
          auto: true,
          society: src.sigla,
          sourceId: `society:${src.sigla}:${e.link}`,
          subespecialidade: subEsp,
          publicationDate: dataBR,
          aiSummary: !!ai,
          resumo,
          porque
        });
      }
    }
  }
  return out;
}

// ── Revistas via RSS próprio (complementa o PubMed) ──
// Diferente das SOCIEDADES: estes entram como ARTIGOS (fonte = nome da revista,
// tipo = desenho do estudo), então aparecem no filtro "Periódico" do mural — NÃO
// como "Comunicado". Best-effort: qualquer falha devolve [] e nunca derruba o
// radar. URLs fornecidas/validadas pelo professor + padrão ScienceDirect (Elsevier,
// /publication/science/<ISSN sem hífen>). O `fonte` casa (por fingerprint) com a
// lista-base do filtro. A IA classifica tipo/subespecialidade/resumo como no PubMed.
const JOURNAL_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;
const JOURNAL_MAX_PER_FEED = 6;
const JOURNAL_RSS_SOURCES = [
  { sigla: 'NEJM', journal: 'The New England Journal of Medicine', feeds: [{ url: 'https://onesearch-rss.nejm.org/api/specialty/rss?context=nejm&specialty=endocrinology' }] },
  { sigla: 'EndocrinePractice', journal: 'Endocrine Practice', feeds: [{ url: 'https://rss.sciencedirect.com/publication/science/1530891X' }] },
  { sigla: 'LancetDiabEndo', journal: 'The Lancet Diabetes & Endocrinology', feeds: [{ url: 'https://rss.sciencedirect.com/publication/science/22138587' }] },
  { sigla: 'CellMetabolism', journal: 'Cell Metabolism', feeds: [{ url: 'http://www.cell.com/cell-metabolism/current.rss' }] },
  { sigla: 'Metabolism', journal: 'Metabolism', feeds: [{ url: 'https://rss.sciencedirect.com/publication/science/00260495' }] },
  { sigla: 'MolMetabolism', journal: 'Molecular Metabolism', feeds: [{ url: 'https://rss.sciencedirect.com/publication/science/22128778' }] },
  { sigla: 'Bone', journal: 'Bone', feeds: [{ url: 'https://rss.sciencedirect.com/publication/science/87563282' }] },  { sigla: 'DOM', journal: 'Diabetes, Obesity and Metabolism', feeds: [{ url: 'https://dom-pubs.onlinelibrary.wiley.com/feed/14631326/most-recent' }] },
  // EJE (Oxford University Press): dois feeds — todos os artigos + só open access.
  { sigla: 'EJE', journal: 'European Journal of Endocrinology', feeds: [{ url: 'https://academic.oup.com/rss/site_6501/4141.xml' }, { url: 'https://academic.oup.com/rss/site_6501/OpenAccess.xml' }] },
  // European Thyroid Journal (Bioscientifica): últimos artigos + open issue.
  { sigla: 'ETJ', journal: 'European Thyroid Journal', feeds: [{ url: 'https://journals.bioscientifica.com/rss/site_1000019/1000010.xml' }, { url: 'https://journals.bioscientifica.com/rss/site_1000019/LatestOpenIssueArticles_1000010.xml' }] }
];
// Monta um item de mural (formato de ARTIGO) a partir de uma entrada de RSS de
// revista. Reusa a IA do PubMed (summarizeWithAI) p/ classificar/ resumir.
async function buildJournalRssItem(entry, src, apiKey) {
  const pseudo = { title: entry.title, journal: src.journal, studyType: '', subespecialidade: '', abstract: entry.summary || '' };
  let ai = null;
  try { ai = await summarizeWithAI(apiKey, pseudo); } catch (e) { ai = null; }
  // Só descarta se a IA achou o conteúdo insuficiente E o RSS também é pobre.
  if (ai && ai.semAbstract === true && !(entry.summary && entry.summary.length > 200)) return null;
  const tipoEstudo = (ai && ai.tipo) || 'Artigo';
  const subEsp = (ai && matchCanonical(ai.subespecialidade, SUB_NAMES)) || '';
  const tipoMural = (ai && matchCanonical(ai.tipoMural, MURAL_TYPE_NAMES)) || 'Artigo';
  const resumo = (ai && ai.resumo) || String(entry.summary || '').slice(0, 800);
  if (!resumo) return null;
  const porque = (ai && ai.porque) || '';
  const cautela = (ai && ai.cautela) || '';
  const t = Date.parse(entry.pubDate || '');
  const dataBR = Number.isFinite(t) ? new Date(t).toLocaleDateString('pt-BR') : '';
  const dataLinha = dataBR ? `📅 Data de publicação: ${dataBR}\n` : '';
  const texto =
`${dataLinha}🔬 Tipo de estudo: ${tipoEstudo}
📝 Resumo: ${resumo}${porque ? `\n💡 Na prática: ${porque}` : ''}${cautela ? `\n⚠️ Cautela/limitação: ${cautela}` : ''}`;
  return {
    titulo: entry.title,
    tipo: tipoMural,
    fonte: src.journal,
    link: entry.link,
    oa: isOpenAccessLink(entry.link),
    texto,
    at: Date.now(),
    auto: true,
    sourceId: `journalrss:${src.sigla}:${entry.link}`,
    studyType: tipoEstudo,
    subespecialidade: subEsp,
    publicationDate: dataBR,
    aiSummary: !!ai,
    resumo,
    porque
  };
}
// Busca os RSS das revistas e monta itens (formato de artigo). Coleta as entradas
// candidatas (barato) e resume em paralelo (mapLimit) p/ não estourar o cron.
async function fetchJournalRssItems(excludeKeys, apiKey) {
  const candidates = [];
  const seen = new Set(); // dedup dentro do run (feeds "todos" + "open access" da mesma revista se sobrepõem)
  for (const src of JOURNAL_RSS_SOURCES) {
    for (const feed of src.feeds) {
      let xml = '';
      try { xml = await fetchText(feed.url, 12000); } catch (e) { xml = ''; }
      if (!xml || (xml.indexOf('<item') < 0 && xml.indexOf('<entry') < 0)) continue;
      const entries = parseRssItems(xml).slice(0, JOURNAL_MAX_PER_FEED);
      for (const e of entries) {
        if (!e.title || !/^https?:\/\//i.test(e.link || '')) continue;
        const sid = `journalrss:${src.sigla}:${e.link}`;
        if (seen.has(sid) || seen.has(e.link)) continue;
        if (excludeKeys.has(e.link) || excludeKeys.has(e.title) || excludeKeys.has(sid)) continue;
        const t = Date.parse(e.pubDate || '');
        if (Number.isFinite(t) && (Date.now() - t) > JOURNAL_MAX_AGE_MS) continue;
        seen.add(sid); seen.add(e.link);
        candidates.push({ e, src });
      }
    }
  }
  const built = await mapLimit(candidates, AI_CONCURRENCY, (c) => buildJournalRssItem(c.e, c.src, apiKey).catch(() => null));
  return built.filter(Boolean);
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
    if (now - itemTime >= AUTO_ITEM_TTL_MS) return false;
    // Purga Breaking News de fontes nao oficiais que tenham entrado antes
    // (ou sido re-gravados por uma aba antiga do app).
    if (item && item.breaking && !isBreakingTrusted(item)) return false;
    return true;
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
  const excludeKeys = existingMuralKeys(payload);
  // Repescagem de acesso aberto, EM PARALELO com a busca de artigos. Ela custa 1
  // ou 2 requisições e o bloco abaixo leva 30-45s, então esperar por ela aqui não
  // acrescenta tempo nenhum ao cron — e o cron tem 60s reais (ver a lição de
  // 29/07 em [[Newsletter e Radar]]: etapa pendurada no fim nunca é alcançada).
  // O `.catch` fica NA CRIAÇÃO da promessa: sem ele uma falha de rede vira
  // unhandled rejection antes do await lá embaixo.
  // Injeta o `fetchJson` DAQUI de propósito: o limite de req/s da NCBI é por IP
  // e vale para o conversor de ids também, então a repescagem tem de passar pelo
  // mesmo pacer/retry que as chamadas do E-utilities — senão ela corre solta em
  // paralelo com a busca e as duas juntas levam 429.
  const pmcPendentes = consultarPmcids(pmcCandidatos(payload.radar_avisos), { fetchJson }).catch((e) => {
    console.error('[radar] repescagem de acesso aberto falhou:', (e && e.message) || e);
    return {};
  });
  // PONTE RSS → PUBMED, também em paralelo. Item vindo de RSS de revista entra
  // SEM PMID e com o link da editora, então a repescagem acima nem o enxergava:
  // medido em 01/08, eram 97 itens (23 de tipo que renderia discussão) travados
  // não por falta de texto aberto, mas por falta de caminho até ele. Aqui o PMID
  // é achado pelo TÍTULO e gravado no item — custo de uma vez por artigo, não
  // por dia. Ver a guarda de título em lib/pmc-repescagem.js.
  const titulosPendentes = resolverPmidsPorTitulo(candidatosSemPmid(payload.radar_avisos), { fetchJson })
    .catch((e) => { console.error('[radar] ponte RSS→PubMed falhou:', (e && e.message) || e); return {}; });
  const articles = await findRelevantArticles(excludeKeys);
  const incoming = await mapLimit(articles, AI_CONCURRENCY, (a) => buildMuralItem(a, anthropicKey));
  const incomingClean = incoming.filter(Boolean); // remove descartados (sem abstract útil)
  // "Breaking News": lançamentos/aprovações de medicações (fail-safe, nunca derruba o radar).
  let breaking = [];
  try { breaking = await runNews(excludeKeys, anthropicKey); } catch (e) { breaking = []; }
  // Informes das sociedades (SBEM etc.) via RSS — best-effort, nunca derruba o radar.
  let society = [];
  try { society = await fetchSocietyItems(excludeKeys, anthropicKey); } catch (e) { society = []; }
  // Artigos de revistas via RSS próprio (NEJM, Endocrine Practice, etc.) — best-effort.
  let journals = [];
  try { journals = await fetchJournalRssItems(excludeKeys, anthropicKey); } catch (e) { journals = []; }
  // Dedup CROSS-FONTE na mesma rodada: o mesmo artigo pode chegar pelo PubMed E
  // pelo RSS da revista (sourceIds/links diferentes escapam do dedup por chave).
  // Cross-RUN já é coberto por excludeKeys (inclui o título dos itens gravados);
  // aqui tratamos o caso de ambos serem NOVOS. Mantém o do PubMed (metadados mais
  // ricos: pmid, tipo de estudo) e descarta o do RSS com título equivalente.
  const _norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const pubmedTitles = new Set(incomingClean.map((it) => _norm(it && it.titulo)).filter(Boolean));
  if (journals.length && pubmedTitles.size) {
    journals = journals.filter((it) => !(it && it.titulo && pubmedTitles.has(_norm(it.titulo))));
  }
  const allIncoming = breaking.concat(society, journals, incomingClean); // breaking + sociedades primeiro (topo)
  // Relê o estado MAIS RECENTE logo antes de salvar (read-modify-write curto).
  // O findRelevantArticles/IA leva ~30-45s; nesse intervalo outro run do radar
  // (ex.: cliques repetidos em "Atualizar radar agora", ou cron + manual) pode
  // ter gravado itens novos. Sem isto, este run sobrescreveria com um snapshot
  // velho e os itens do outro run "sumiriam". Mesclando sobre o estado atual,
  // cada run só ACRESCENTA — a janela de corrida cai de ~40s para milissegundos.
  // ⚠️ A repescagem é COLHIDA AQUI, antes da releitura. Ela já terminou (correu
  // junto com a busca de artigos), mas se a NCBI estiver lenta o `await` espera —
  // e esperar DEPOIS do `loadGlobalPayload` alargaria justamente a janela que o
  // parágrafo acima existe para manter em milissegundos.
  const mapaPmc = await pmcPendentes;
  const mapaTitulos = await titulosPendentes;
  const latestPayload = await loadGlobalPayload(serviceKey);
  const merged = mergeMuralItems(latestPayload, allIncoming);
  // Só resta reescrever `link`/`oa` de quem ganhou PMC — trabalho síncrono.
  // ⚠️ Sobre `merged.payload.radar_avisos`, NÃO sobre o snapshot velho: a lista
  // mesclada é a que vai ao banco.
  // ⚠️ A PONTE VEM ANTES da repescagem por id: ela GRAVA o `pmid` no item, e é
  // esse pmid que faz o item passar a existir para o `aplicarPmc` — no mesmo run
  // quando o esummary já trouxe o PMC, e nos runs seguintes quando não trouxe.
  // Invertida a ordem, o artigo de RSS resolvido hoje só seria repescado amanhã.
  const pontes = aplicarTitulos(merged.payload.radar_avisos, mapaTitulos);
  const repescados = aplicarPmc(pontes.avisos, mapaPmc);
  merged.payload = { ...merged.payload, radar_avisos: repescados.avisos };
  if (pontes.resolvidos.length) {
    console.log('[radar] ponte RSS→PubMed: ' + pontes.resolvidos.length + ' artigo(s) ganharam PMID — ' +
      pontes.resolvidos.map((x) => x.sourceId + '→' + x.pmid + (x.abriu ? '/' + x.pmcid : '')).join(', '));
  }
  if (repescados.alterados.length) {
    console.log('[radar] repescagem: ' + repescados.alterados.length + ' artigo(s) viraram acesso aberto — ' +
      repescados.alterados.map((x) => x.sourceId + '→' + x.pmcid).join(', '));
  }
  await saveGlobalPayload(serviceKey, merged.payload);
  // 3 artigos mais relevantes do dia (maior score; sempre com abstract — já filtrado).
  const topArticles = articles
    .map((a, i) => ({ a, item: incoming[i] }))
    .filter((p) => p.item)
    .sort((x, y) => (y.a.score || 0) - (x.a.score || 0))
    .slice(0, 3)
    .map((p) => ({
      titulo: p.item.titulo,
      resumo: p.item.resumo,
      porque: p.item.porque,
      fonte: p.item.fonte,
      tipo: p.item.studyType,
      subespecialidade: p.item.subespecialidade,
      data: p.item.publicationDate,
      link: p.item.link || `https://pubmed.ncbi.nlm.nih.gov/${p.a.pmid}/`
    }));
  return {
    inserted: merged.fresh.length,
    breakingNews: breaking.length,
    considered: allIncoming.length,
    aiSummaries: allIncoming.filter((i) => i.aiSummary).length,
    // Quantos artigos ANTIGOS viraram acesso aberto nesta rodada. Aparece no
    // aviso do botão "Atualizar radar": etapa que não roda precisa DIZER que não
    // rodou, senão silêncio vira "o recurso está quebrado".
    openAccessRepescados: repescados.alterados.length,
    topArticles,
    items: merged.fresh.map((item) => ({ titulo: item.titulo, fonte: item.fonte, tipo: item.tipo, link: item.link }))
  };
}

module.exports = { runRadar, formatPubDateBR };
