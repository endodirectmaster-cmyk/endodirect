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

// Fontes. ANVISA/Novo Nordisk não expõem RSS direto utilizável, então usamos
// Google News RSS (confiável) com consultas alvo; FDA e Eli Lilly têm RSS proprio.
// Editável: adicionar/remover é só mexer aqui.
function gnews(q, pt) {
  const base = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q);
  return pt ? (base + '&hl=pt-BR&gl=BR&ceid=BR:pt') : (base + '&hl=en-US&gl=US&ceid=US:en');
}
// `official: true` → o feed inteiro já é uma fonte oficial (RSS proprio do
// fabricante/agencia), aceito sem checar a origem. Feeds do Google News
// (`official` ausente) agregam multiplos veiculos, entao so aceitamos o item
// se a ORIGEM real (tag <source>) estiver na allowlist TRUSTED_SOURCES abaixo.
const NEWS_FEEDS = [
  // ANVISA: feeds oficiais diretos (gov.br atual + portal antigo). official:true
  // → aceitos sem checar origem; o filtro de medicamento/aprovacao recorta o
  // que interessa entre todas as noticias da agencia. Fail-safe: feed que nao
  // responder e ignorado.
  { nome: 'ANVISA oficial', url: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias/RSS', lang: 'pt', official: true },
  { nome: 'ANVISA portal', url: 'http://portal.anvisa.gov.br/rss', lang: 'pt', official: true },
  { nome: 'ANVISA', url: gnews('ANVISA aprova medicamento', true), lang: 'pt' },
  { nome: 'Regulatório BR', url: gnews('(aprovação OR lançamento) medicamento (diabetes OR obesidade OR tireoide OR endocrinologia)', true), lang: 'pt' },
  { nome: 'Novo Nordisk', url: gnews('Novo Nordisk (approval OR launch OR aprovação OR lançamento)', true), lang: 'pt' },
  { nome: 'FDA', url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', lang: 'en', official: true },
  { nome: 'FDA Endócrino', url: gnews('FDA approval (diabetes OR obesity OR thyroid OR endocrine OR weight loss)', false), lang: 'en' },
  { nome: 'Eli Lilly', url: 'https://investor.lilly.com/rss/news-releases.xml', lang: 'en', official: true }
];

// Allowlist de fontes confiaveis (fabricantes + agencias reguladoras + orgaos
// institucionais). Para feeds do Google News, so passa item cuja origem case
// por DOMINIO (sourceUrl) ou por NOME do publisher. Editavel: e so mexer aqui.
const TRUSTED_SOURCE_DOMAINS = [
  'novonordisk.com', 'novonordisk.com.br',
  'lilly.com', 'investor.lilly.com',
  'fda.gov', 'ema.europa.eu', 'anvisa.gov.br', 'gov.br', 'who.int',
  'astrazeneca.com', 'astrazeneca.com.br', 'boehringer-ingelheim.com',
  'sanofi.com', 'sanofi.com.br', 'pfizer.com', 'pfizer.com.br',
  'merck.com', 'msd.com', 'novartis.com', 'amgen.com', 'roche.com',
  'abbvie.com', 'bayer.com', 'gsk.com', 'takeda.com', 'ascendispharma.com'
];
// Nomes de publishers confiaveis (quando o Google News nao traz o dominio).
// Evita tokens curtos/ambiguos (ex.: "fda", "ema") — esses ficam por dominio.
const TRUSTED_SOURCE_NAMES = [
  'novo nordisk', 'eli lilly', 'anvisa', 'astrazeneca', 'boehringer',
  'sanofi', 'pfizer', 'novartis', 'amgen', 'genentech', 'abbvie', 'bayer',
  'merck', 'msd', 'takeda', 'ascendis', 'gsk', 'glaxosmithkline'
];
function isTrustedSource(item) {
  const url = String(item.sourceUrl || '').toLowerCase();
  if (url && TRUSTED_SOURCE_DOMAINS.some((d) => url.indexOf(d) >= 0)) return true;
  const name = String(item.sourceName || '').toLowerCase();
  return !!name && TRUSTED_SOURCE_NAMES.some((n) => name.indexOf(n) >= 0);
}
// Veiculo a partir do titulo do Google News (sufixo " - Nome do veiculo").
function publisherFromTitle(title) {
  const m = String(title || '').match(/\s[-–—]\s([^-–—]{2,60})\s*$/);
  return m ? m[1].trim() : '';
}
// Avalia confianca de um item Breaking News — NOVO ou ja ARMAZENADO no mural.
// Usado tanto na captacao quanto para purgar itens retidos de fontes nao oficiais.
function isBreakingTrusted(item) {
  if (!item) return false;
  if (item.official) return true;                          // feed oficial direto
  if (item.sourceUrl || item.sourceName) return isTrustedSource(item);
  // Itens antigos sem origem gravada: deduz o veiculo pelo sufixo do titulo.
  const pub = publisherFromTitle(item.titulo || item.title).toLowerCase();
  if (!pub) return false;                                  // politica: so oficiais
  return TRUSTED_SOURCE_DOMAINS.some((d) => pub.indexOf(d) >= 0)
      || TRUSTED_SOURCE_NAMES.some((n) => pub.indexOf(n) >= 0);
}

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
// Google News RSS traz a origem real do item em <source url="...">Nome</source>.
function pickSource(block) {
  const withUrl = block.match(/<source[^>]*url=["']([^"']+)["'][^>]*>([\s\S]*?)<\/source>/i);
  if (withUrl) return { url: withUrl[1], name: cleanText(withUrl[2]) };
  const nameOnly = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return { url: '', name: nameOnly ? cleanText(nameOnly[1]) : '' };
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
      const src = pickSource(b);
      // Origem real (publisher). Feeds oficiais nao tem <source>: usam o proprio nome.
      const fonte = src.name || feed.nome;
      return { fonte: fonte, title: title, link: link, desc: (desc || '').slice(0, 600), at: at, sourceUrl: src.url, sourceName: src.name, official: !!feed.official };
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
// Áreas endócrino-metabólicas (para captar "aprova remédio para obesidade" sem
// citar a droga). A IA depois confirma se é mesmo lançamento/aprovação.
const AREA_TERMS = [
  'diabet', 'obesid', 'obesity', 'overweight', 'thyroid', 'tireoid', 'adrenal', 'pituit', 'hipofis',
  'osteopor', 'bone mineral', 'lipid', 'dislipid', 'cholesterol', 'colesterol', 'endocrin', 'metabol',
  'puberty', 'puberdade', 'growth hormone', 'hormonio de crescimento', 'menopaus', 'hypogonad', 'hipogonad', 'weight loss'
];
function isRelevant(item) {
  const text = (item.title + ' ' + (item.desc || '')).toLowerCase();
  return hasAny(text, APPROVAL_TERMS) && (hasAny(text, DRUG_TERMS) || hasAny(text, AREA_TERMS));
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
`🏷️ Tipo: Lancamento/Aprovacao de medicamento (endocrinologia/metabolismo)
📝 Resumo: ${resumo}
🔗 Fonte: ${orgao}${item.link ? ' (' + item.link + ')' : ''}`;
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
    aiSummary: !!(ai && ai.resumo),
    // Origem gravada p/ permitir re-checagem de confianca em runs futuras.
    official: !!item.official,
    sourceUrl: item.sourceUrl || '',
    sourceName: item.sourceName || ''
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
      // Fonte confiavel: feed oficial OU origem (publisher) na allowlist.
      if (!it.official && !isTrustedSource(it)) return;
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
  return results.map((res, i) => {
    const official = !!NEWS_FEEDS[i].official;
    const trusted = (res.items || []).filter((it) => official || isTrustedSource(it));
    const aceitos = trusted.filter(isRelevant);
    return {
      fonte: NEWS_FEEDS[i].nome,
      url: NEWS_FEEDS[i].url,
      ok: res.ok, status: res.status, error: res.error || null,
      total: (res.items || []).length,
      confiaveis: trusted.length,
      relevantes: aceitos.length,
      amostra: (res.items || []).slice(0, 3).map((it) => it.fonte + ': ' + it.title),
      amostraAceita: aceitos.slice(0, 3).map((it) => it.fonte + ': ' + it.title)
    };
  });
}

module.exports = { runNews, probeNews, isBreakingTrusted, NEWS_FEEDS };
