// Endodirect — "Breaking News" de lançamento/aprovação de medicações em
// endocrinologia. Lê feeds RSS/Atom de fontes regulatórias e de farmacêuticas,
// filtra por droga + termo de aprovação/lançamento, classifica/resume com IA e
// devolve itens para o mural com a etiqueta "Breaking News".
//
// 100% à prova de falhas: feed que falhar é ignorado (nunca derruba o radar).

// Mesma normalização do api/ai.js e do radar (ver lib/modelos-ia.js; geração 5.5 desde
// 09/11/2026): env com id retirado cai no padrão em vez de calar a curadoria.
const { normModelo, montarCorpo, cabecalhos, lerResposta } = require('./modelos-ia');
const ANTHROPIC_MODEL = normModelo(process.env.ANTHROPIC_MODEL) || 'claude-sonnet-5-5';
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
  // ⚠️ A ANVISA NÃO TEM MAIS FEED PRÓPRIO (conferido em 04/11/2026). O site do
  // gov.br virou uma página React (Volto) sem RSS: `.../assuntos/noticias/RSS`
  // responde 404 desde 10/10 e o portal antigo (portal.anvisa.gov.br) nem resolve
  // mais. O `++api++`, a paginação da pasta e o sitemap também não trazem as
  // notícias novas. Os dois feeds mortos saíram daqui; a ANVISA chega pelo Google
  // News, em TRÊS buscas, e só passa item cuja origem seja gov.br/anvisa.gov.br ou
  // o nome "Anvisa" (allowlist abaixo). Caso que motivou: "Anvisa aprova primeiro
  // medicamento de GLP-1 oral para obesidade" (04/11), que o mural não pegou e o
  // professor lançou à mão.
  { nome: 'ANVISA', url: gnews('ANVISA aprova medicamento', true), lang: 'pt' },
  { nome: 'ANVISA (aprova)', url: gnews('Anvisa aprova', true), lang: 'pt' },
  { nome: 'ANVISA (gov.br)', url: gnews('Anvisa site:gov.br', true), lang: 'pt' },
  { nome: 'Regulatório BR', url: gnews('(aprovação OR lançamento) medicamento (diabetes OR obesidade OR tireoide OR endocrinologia)', true), lang: 'pt' },
  { nome: 'Novo Nordisk', url: gnews('Novo Nordisk (approval OR launch OR aprovação OR lançamento)', true), lang: 'pt' },
  { nome: 'FDA', url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', lang: 'en', official: true },
  // FDA "What's New Related to Drugs" (inclui aprovações de fármacos). Oficial →
  // aceito sem checar origem; o filtro de aprovação/lançamento endócrino-metabólico
  // recorta o que interessa (ex.: aprovação de iPCSK9 oral). Entra como breaking news.
  { nome: 'FDA Drugs', url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml', lang: 'en', official: true },
  { nome: 'FDA Endócrino', url: gnews('FDA approval (diabetes OR obesity OR thyroid OR endocrine OR weight loss)', false), lang: 'en' },
  { nome: 'Eli Lilly', url: 'https://investor.lilly.com/rss/news-releases.xml', lang: 'en', official: true },
  // ⚠️ SEGUNDO CAMINHO PARA A LILLY (28/08/2026). Ela era o único fabricante da
  // lista com UMA rota só — a Novo Nordisk sempre teve a busca. E a rota única
  // não estava entregando: medido no acervo, ZERO item da Lilly em 1.019, contra
  // itens do FDA vindos pelo feed oficial. A aprovação cardiovascular do Mounjaro
  // (28/08) passou batido e o professor viu antes do mural. Fonte confiável pelo
  // domínio `lilly.com`, então a busca não afrouxa nada.
  { nome: 'Eli Lilly (busca)', url: gnews('Eli Lilly (approval OR launch OR aprovação OR lançamento)', true), lang: 'pt' }
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
// ⚠️ CASAMENTO POR SUBSTRING DEIXOU UM CLUBE DE FUTEBOL ENTRAR COMO FARMACÊUTICA.
//
// 03/08/2026, o professor perguntando "essas notícias estão corretas?": dois
// cards de "aprovação do FDA" no mural, com token aleatório no título
// ("View cyRXhxjjE", "*G8NgoFLbt*") e publicador **FC Bayern**. O teste era
// `nome.indexOf('bayer') >= 0` — e `'fc bayern'.indexOf('bayer') === 3`. O
// clube casou com a Bayer e a allowlist inteira virou decoração.
//
// O mesmo valia para domínio: `url.indexOf('gov.br')` casaria
// `naogov.br.spam.com`. Domínio agora é comparado por HOSTNAME (igual ou
// subdomínio) e nome por PALAVRA INTEIRA.
function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hostDe(url) {
  const u = String(url || '').trim().toLowerCase();
  if (!u) return '';
  try { return new URL(u.indexOf('//') >= 0 ? u : 'https://' + u).hostname; } catch (e) { return ''; }
}
function dominioConfiavel(url) {
  const host = hostDe(url);
  if (!host) return false;
  return TRUSTED_SOURCE_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
}
function nomeConfiavel(nome) {
  const n = String(nome || '').toLowerCase().trim();
  if (!n) return false;
  // Palavra inteira: "bayer" casa "Bayer" e "Bayer AG", mas não "FC Bayern".
  return TRUSTED_SOURCE_NAMES.some((t) => new RegExp('(^|[^a-z0-9])' + escRe(t) + '([^a-z0-9]|$)').test(n));
}
function isTrustedSource(item) {
  if (dominioConfiavel(item.sourceUrl)) return true;
  return nomeConfiavel(item.sourceName);
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
  // Mesmo critério de palavra inteira: era aqui que "FC Bayern" entrava também,
  // pelo sufixo do título dos itens antigos sem origem gravada.
  return dominioConfiavel(pub) || nomeConfiavel(pub);
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

// ⚠️ A DATA DO FEED NÃO É A DATA DA APROVAÇÃO (10/11/2026). O feed oficial da FDA
// republicou em 09/11, com data nova, duas páginas de 2024 ("FDA approves
// selpercatinib for RET fusion-positive thyroid cancer", de 12/06/2024, e a do
// carcinoma medular, de 27/09/2024). `isRecent` só olhava o <pubDate>; a IA chegou a
// escrever "Em 12 de junho de 2024" no resumo e mesmo assim marcou como breaking,
// porque ninguém perguntou a ela a data. O item entrou no mural e virou o push
// automático das 07:45, que o professor recebeu como notícia do dia.
// Agora a data do EVENTO vem do próprio texto (as páginas de aprovação da FDA
// começam por "On June 12, 2024, the Food and Drug Administration…"). Vale a MAIS
// RECENTE das datas completas citadas: uma notícia nova que mencione a aprovação
// anterior ("accelerated approval in 2020") continua nova, porque traz a data de hoje.
const MESES = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  janeiro: 0, fevereiro: 1, marco: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7,
  setembro: 8, outubro: 9, novembro: 10, dezembro: 11
};
const MES_RE = Object.keys(MESES).sort((x, y) => y.length - x.length).join('|');
function dataUTC(ano, mes, dia) {
  const a = Number(ano), d = Number(dia);
  if (!(a >= 1990 && a <= 2100) || !(d >= 1 && d <= 31) || mes == null) return 0;
  return Date.UTC(a, mes, d);
}
// Todas as datas completas (dia, mês por extenso e ano) citadas no texto, em ms.
function datasNoTexto(texto) {
  const t = String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const out = [];
  let m;
  const mdy = new RegExp('\\b(' + MES_RE + ')\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b', 'g');
  while ((m = mdy.exec(t))) out.push(dataUTC(m[3], MESES[m[1]], m[2]));
  const dmy = new RegExp('\\b(\\d{1,2})(?:o|º)?\\s+(?:de\\s+)?(' + MES_RE + ')\\.?,?\\s+(?:de\\s+)?(\\d{4})\\b', 'g');
  while ((m = dmy.exec(t))) out.push(dataUTC(m[3], MESES[m[2]], m[1]));
  return out.filter((x) => x > 0);
}
// Data do EVENTO (aprovação/lançamento) lida no texto; 0 se o texto não traz data.
function dataDoEvento(item) {
  const datas = datasNoTexto(String((item && (item.title || item.titulo)) || '') + ' ' + String((item && (item.desc || item.texto)) || ''));
  return datas.length ? Math.max.apply(null, datas) : 0;
}
// O evento é antigo quando a data mais recente citada passou da janela. Sem data no
// texto, não decide (fica com o <pubDate> e com a IA).
function eventoAntigo(item, agora, dias) {
  const d = dataDoEvento(item);
  return d > 0 && (Number(agora) || Date.now()) - d > dias * 86400000;
}
// Título para comparar com o que já está no mural: sem o sufixo " - Veículo" que o
// Google News acrescenta, sem acento, sem pontuação e em minúsculas. Sem isso, a
// notícia que o professor lançou à mão (título limpo) e a mesma notícia vinda da
// busca ("… - Agência Nacional de Vigilância Sanitária - Anvisa") viravam dois cards.
function tituloComparavel(titulo, comSufixo) {
  let t = String(titulo || '');
  if (comSufixo) { for (let i = 0; i < 3; i++) { const u = t.replace(/\s[-–—]\s[^-–—]{2,60}\s*$/, ''); if (u === t) break; t = u; } }
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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

Hoje e ${new Date().toISOString().slice(0, 10)}.
Esta noticia anuncia APROVACAO ou LANCAMENTO de um MEDICAMENTO relevante para ENDOCRINOLOGIA/METABOLISMO (diabetes, obesidade, tireoide, adrenal, hipofise, osso, lipides, reproducao), ocorrido nos ultimos ${NEWS_RECENT_DAYS} dias?
Responda SOMENTE com JSON:
{"breaking": true|false, "droga":"<nome do medicamento>", "data_evento":"<AAAA-MM-DD da aprovacao/lancamento, se o texto disser; senao vazio>", "resumo":"<2-3 linhas em portugues: o que foi aprovado/lancado, por qual orgao e para qual indicacao>", "orgao":"<orgao/empresa>"}
Se NAO for aprovacao/lancamento de medicamento endocrino-metabolico, ou se a aprovacao/lancamento for de mais de ${NEWS_RECENT_DAYS} dias atras (pagina antiga republicada, aniversario, retrospectiva), retorne {"breaking": false}.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: controller.signal,
      headers: cabecalhos(apiKey, ANTHROPIC_MODEL),
      body: JSON.stringify(montarCorpo({ max_tokens: 500, system, messages: [{ role: 'user', content: prompt }] }, ANTHROPIC_MODEL, 'low'))
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return null;
    const txt = lerResposta(data).texto;
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const obj = JSON.parse(m[0]);
    if (!obj || !obj.breaking) return { breaking: false };
    // Segunda trava: a data que a IA leu no texto, se houver, também passa pela janela.
    const dIa = Date.parse(String(obj.data_evento || '').slice(0, 10));
    if (dIa > 0 && Date.now() - dIa > NEWS_RECENT_DAYS * 86400000) return { breaking: false };
    return obj;
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
`🏷️ Tipo: Lancamento/Aprovacao de medicamento
📝 Resumo: ${resumo}
🔗 Fonte: ${orgao}${item.link ? ' (' + item.link + ')' : ''}`;
  return {
    titulo: item.title,
    // Aprovação/lançamento/press release de medicação por regulador (FDA/ANVISA)
    // ou indústria = "Comunicado" (decisão do professor 2026-07-20). A flag
    // `breaking` continua marcando esses itens (toggle do mural + prioridade no topo).
    tipo: 'Comunicado',
    fonte: orgao,
    link: item.link || '',
    texto: texto,
    at: item.at || Date.now(),
    auto: true,
    breaking: true,
    sourceId: newsKey(item),
    subespecialidade: '',
    aiSummary: !!(ai && ai.resumo),
    // Data do evento lida no texto (ou pela IA): o push automático confere por ela,
    // não pela data do feed. 0 = o texto não trouxe data.
    dataEvento: dataDoEvento(item) || (Date.parse(String((ai && ai.data_evento) || '').slice(0, 10)) || 0),
    // Origem gravada p/ permitir re-checagem de confianca em runs futuras.
    official: !!item.official,
    sourceUrl: item.sourceUrl || '',
    sourceName: item.sourceName || ''
  };
}

// ⚠️ FEED MORTO MORRE EM SILÊNCIO — e essa era a falha real de 28/08/2026.
// `fetchFeed` nunca lança, de propósito: um feed fora do ar não pode derrubar o
// radar. O preço é que ele também não AVISA. O feed oficial da Lilly produziu
// ZERO item em 1.019 do acervo, e ninguém soube até o professor ver a aprovação
// do Mounjaro na fonte e perguntar por que o mural não pegou.
//
// A saúde da última rodada fica aqui, o `runRadar` a leva no resultado e o cron
// alerta. Guardar aqui em vez de mudar o retorno de `runNews` mantém a assinatura
// que os chamadores já usam — o que quebraria não é o feed, seria a integração.
let ULTIMA_SAUDE = [];
function saudeDosFeeds() { return ULTIMA_SAUDE.slice(); }
function registrarSaude(results) {
  ULTIMA_SAUDE = results.map((res, i) => ({
    nome: NEWS_FEEDS[i].nome,
    url: NEWS_FEEDS[i].url,
    official: !!NEWS_FEEDS[i].official,
    ok: !!res.ok,
    status: res.status || 0,
    itens: (res.items || []).length,
    erro: res.error || ''
  }));
}

// Retorna itens "Breaking News" novos (deduplicados contra excludeKeys).
async function runNews(excludeKeys, apiKey) {
  const exclude = excludeKeys instanceof Set ? excludeKeys : new Set();
  // Os títulos do mural (radar + avisos do professor) entram em `exclude` crus;
  // aqui viram comparáveis, para casar com o título da busca, que vem com sufixo.
  const titulosNoMural = new Set();
  exclude.forEach((k) => { const t = tituloComparavel(k, false); if (t.length >= 25) titulosNoMural.add(t); });
  const results = await Promise.all(NEWS_FEEDS.map(fetchFeed));
  registrarSaude(results);
  const candidates = [];
  const seen = new Set();
  results.forEach((res) => {
    (res.items || []).forEach((it) => {
      // Fonte confiavel: feed oficial OU origem (publisher) na allowlist.
      if (!it.official && !isTrustedSource(it)) return;
      if (!isRelevant(it) || !isRecent(it) || eventoAntigo(it, Date.now(), NEWS_RECENT_DAYS)) return;
      const k = newsKey(it);
      if (seen.has(k) || exclude.has(k) || exclude.has(it.link) || exclude.has(it.title)) return;
      // A mesma notícia por outra rota (outra busca, ou já lançada à mão).
      const tc = tituloComparavel(it.title, !it.official);
      if (tc.length >= 25 && (titulosNoMural.has(tc) || seen.has('t:' + tc))) return;
      seen.add(k);
      if (tc.length >= 25) seen.add('t:' + tc);
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

module.exports = { runNews, probeNews, saudeDosFeeds, isBreakingTrusted, NEWS_FEEDS, tituloComparavel, datasNoTexto, dataDoEvento, eventoAntigo };
