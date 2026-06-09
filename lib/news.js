// Endodirect — "Breaking News" de lançamento/aprovação de medicações em
// endocrinologia. Lê feeds RSS/Atom de fontes regulatórias e de farmacêuticas,
// filtra por droga + termo de aprovação/lançamento, classifica/resume com IA e
// devolve itens para o mural com a etiqueta "Breaking News".
//
// 100% à prova de falhas: feed que falhar é ignorado (nunca derruba o radar).

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const NEWS_AI_TIMEOUT_MS = 18000;
const NEWS_RECENT_DAYS = 30;
const MAX_NEWS_PER_RUN = 6;

// Fontes candidatas. Editável: adicionar/remover é só mexer aqui.
const NEWS_FEEDS = [
  { nome: 'ANVISA', url: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/RSS', lang: 'pt' },
  { nome: 'ANVISA', url: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/@@RSS', lang: 'pt' },
  { nome: 'FDA', url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', lang: 'en' },
  { nome: 'FDA Drugs', url: 'https://www.fda.gov/drugs/spotlight-cder-science/rss.xml', lang: 'en' },
  { nome: 'Novo Nordisk', url: 'https://www.novonordisk.com/news-and-media/latest-news.rss', lang: 'en' },
  { nome: 'Eli Lilly', url: 'https://investor.lilly.com/rss/news-releases.xml', lang: 'en' }
];

// Drogas endócrinas/metabólicas (marcas e princípios ativos).
const DRUG_TERMS = [
  'semaglutid', 'tirzepatid', 'retatrutid', 'orforglipron', 'survodutid', 'cagrilintid', 'cagrisema',
  'dulaglutid', 'liraglutid', 'exenatid', 'lixisenatid', 'ozempic', 'wegovy', 'rybelsus', 'mounjaro',
  'zepbound', 'saxenda', 'victoza', 'trulicity', 'mango', 'glp-1', 'gip', 'sglt2', 'dapagliflozin',
  'empagliflozin', 'canagliflozin', 'insulin', 'insulina', 'tresiba', 'toujeo', 'tirosint', 'levotiroxin',
  'levothyroxin', 'setmelanotid', 'imcivree', 'bimagrumab', 'osilodrostat', 'isturisa', 'mifepristone',
  'pasireotid', 'lanreotid', 'octreotid', 'somatropin', 'somapacitan', 'sogroya', 'lonapegsomatropin',
  'skytrofa', 'vosoritid', 'burosumab', 'crysvita', 'romosozumab', 'evenity', 'denosumab', 'teriparatid',
  'abaloparatid', 'palopegteriparatide', 'yorvipath', 'finerenon', 'bexagliflozin', 'teplizumab', 'tzield',
  'metformin', 'metformina', 'estradiol', 'testosteron', 'inclisiran', 'leqvio', 'bempedoic', 'evolocumab',
  'alirocumab', 'lomitapid', 'volanesorsen', 'pegozafermin', 'efruxifermin', 'resmetirom', 'rezdiffra'
];
const APPROVAL_TERMS = [
  'approv', 'authoriz', 'authorise', 'clearance', 'green light', 'fda accepts', 'fda grant', 'indication',
  'launch', 'now available', 'first patient',
  'aprov', 'registro', 'registrad', 'autoriz', 'lancament', 'lançament', 'liberad', 'disponível', 'disponivel'
];

function cleanText(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}
function pick(block, tag) {
  const m = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return m ? cleanText(m[1]) : '';
}
function pickLink(block) {
  // RSS: <link>url</link>; Atom: <link href="url"/>
  const rss = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (rss && cleanText(rss[1])) return cleanText(rss[1]);
  const atom = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return atom ? atom[1] : '';
}

// Lê um feed e devolve itens normalizados. Nunca lança (devolve [] em erro).
async function fetchFeed(feed) {
  try {
    const r = await fetch(feed.url, { headers: { 'User-Agent': 'EndodirectRadar/1.0', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } });
    if (!r.ok) return { ok: false, status: r.status, items: [] };
    const xml = await r.text();
    const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
    const items = blocks.map((b) => {
      const title = pick(b, 'title');
      const link = pickLink(b);
      const desc = pick(b, 'description') || pick(b, 'summary') || pick(b, 'content');
      const dateStr = pick(b, 'pubDate') || pick(b, 'updated') || pick(b, 'published') || pick(b, 'dc:date');
      let at = Date.parse(dateStr);
      if (isNaN(at)) at = 0;
      return { fonte: feed.nome, title: title, link: link, desc: (desc || '').slice(0, 600), at: at };
    }).filter((it) => it.title);
    return { ok: true, status: r.status, items: items };
  } catch (e) {
    return { ok: false, status: 0, error: (e && e.message) || 'fetch error', items: [] };
  }
}

function hasAny(text, list) {
  const t = String(text || '').toLowerCase();
  return list.some((w) => t.indexOf(w) >= 0);
}
function isRelevant(item) {
  const text = (item.title + ' ' + (item.desc || '')).toLowerCase();
  return hasAny(text, DRUG_TERMS) && hasAny(text, APPROVAL_TERMS);
}
function isRecent(item) {
  if (!item.at) return true; // sem data: deixa a IA decidir
  return (Date.now() - item.at) < NEWS_RECENT_DAYS * 86400000;
}
function newsKey(item) {
  const base = (item.link || item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 60);
  return 'news:' + base;
}

async function classifyNews(apiKey, item) {
  if (!apiKey) {
    // Sem IA: aceita pelo filtro de palavras e gera um resumo simples.
    return { breaking: true, resumo: cleanText(item.desc).slice(0, 400) || item.title, droga: '', orgao: item.fonte };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NEWS_AI_TIMEOUT_MS);
  const system = 'Voce e um endocrinologista que curadoria noticias regulatorias/farmaceuticas para outros medicos, em portugues do Brasil. Responda APENAS JSON valido. Nao invente dados.';
  const prompt = `Noticia (fonte: ${item.fonte}):
Titulo: ${item.title}
Resumo: ${item.desc || '(sem resumo)'}

Esta noticia anuncia APROVACAO ou LANCAMENTO de um MEDICAMENTO relevante para ENDOCRINOLOGIA/METABOLISMO (diabetes, obesidade, tireoide, adrenal, hipofise, osso, lipides, reproducao)?
Responda SOMENTE com JSON:
{"breaking": true|false, "droga":"<nome do medicamento>", "resumo":"<2-3 linhas em portugues: o que foi aprovado/lancado, por qual orgao e para qual indicacao>", "orgao":"<orgao/empresa>"}
Se NAO for aprovacao/lancamento de medicamento endocrino-metabolico, retorne {"breaking": false}.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 500, system, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return null;
    const txt = Array.isArray(data.content) ? ((data.content.find((p) => p && p.type === 'text') || {}).text || '') : '';
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const obj = JSON.parse(m[0]);
    return (obj && obj.breaking) ? obj : { breaking: false };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildBreakingItem(item, ai) {
  const resumo = (ai && ai.resumo) || cleanText(item.desc).slice(0, 400) || item.title;
  const orgao = (ai && ai.orgao) || item.fonte;
  const texto =
`Tipo: Lancamento/Aprovacao de medicamento (endocrinologia/metabolismo)
Resumo: ${resumo}
Fonte: ${orgao}${item.link ? ' (' + item.link + ')' : ''}`;
  return {
    titulo: item.title,
    tipo: 'Breaking News',
    fonte: orgao,
    link: item.link || '',
    texto: texto,
    at: item.at || Date.now(),
    auto: true,
    breaking: true,
    sourceId: newsKey(item),
    subespecialidade: '',
    aiSummary: !!(ai && ai.resumo)
  };
}

// Retorna itens "Breaking News" novos (deduplicados contra excludeKeys).
async function runNews(excludeKeys, apiKey) {
  const exclude = excludeKeys instanceof Set ? excludeKeys : new Set();
  const results = await Promise.all(NEWS_FEEDS.map(fetchFeed));
  const candidates = [];
  const seen = new Set();
  results.forEach((res) => {
    (res.items || []).forEach((it) => {
      if (!isRelevant(it) || !isRecent(it)) return;
      const k = newsKey(it);
      if (seen.has(k) || exclude.has(k) || exclude.has(it.link) || exclude.has(it.title)) return;
      seen.add(k);
      candidates.push(it);
    });
  });
  candidates.sort((a, b) => (b.at || 0) - (a.at || 0));
  const top = candidates.slice(0, MAX_NEWS_PER_RUN * 2);
  const out = [];
  for (const it of top) {
    if (out.length >= MAX_NEWS_PER_RUN) break;
    const ai = await classifyNews(apiKey, it);
    if (ai && ai.breaking) out.push(buildBreakingItem(it, ai));
  }
  return out;
}

// Diagnóstico (sem IA, sem gravar): mostra status por feed e itens que passariam no filtro.
async function probeNews() {
  const results = await Promise.all(NEWS_FEEDS.map(fetchFeed));
  return results.map((res, i) => ({
    fonte: NEWS_FEEDS[i].nome,
    url: NEWS_FEEDS[i].url,
    ok: res.ok, status: res.status, error: res.error || null,
    total: (res.items || []).length,
    relevantes: (res.items || []).filter(isRelevant).length,
    amostra: (res.items || []).slice(0, 3).map((it) => it.title),
    amostraRelevante: (res.items || []).filter(isRelevant).slice(0, 3).map((it) => it.title)
  }));
}

module.exports = { runNews, probeNews, NEWS_FEEDS };
