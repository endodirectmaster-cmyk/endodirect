// Podcasts — lógica compartilhada entre o endpoint do admin (/api/podcast-feed,
// importação manual) e a atualização automática diária, que roda DENTRO do cron
// do radar (/api/cron/endocrine-radar) — não há cron/endpoint próprio por causa
// do limite de 12 serverless functions da Vercel (ver cofre/Decisões). Lê um
// feed RSS (Anchor/Spotify for Podcasters), extrai os episódios no modelo de
// áudio nativo (tipo:'rss', <audio>) e — na atualização automática — mescla os
// novos no topo de endodirect_global_state.payload.podcasts.

const dns = require('dns').promises;

// Feed oficial do podcast do Endodirect (show "EndoDirect — Endocrinologia e
// Metabologia"). É o padrão usado pelo cron quando o payload não traz um feed.
const DEFAULT_FEED = 'https://anchor.fm/s/6e257fc4/podcast/rss';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const MAX_FEED_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PODCASTS = 400;

// ── Guarda anti-SSRF (só https e hosts públicos) ──────────────────────────────
function isSafeUrl(u) {
  let url;
  try { url = new URL(u); } catch (e) { return false; }
  if (url.protocol !== 'https:') return false;
  const h = url.hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h.endsWith('.local')) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|::1)/.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  return true;
}
function isPrivateIp(ip) {
  ip = String(ip || '').toLowerCase().split('%')[0];
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const p = ip.split('.').map(Number);
    if (p[0] === 127 || p[0] === 10 || p[0] === 0) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // CGNAT
    return false;
  }
  if (ip === '::1' || ip === '::') return true;
  if (ip.startsWith('fe80') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
  const m = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (m) return isPrivateIp(m[1]);
  return false;
}
async function hostResolvesPrivate(host) {
  if (isPrivateIp(host)) return true;
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.some((a) => isPrivateIp(a.address));
  } catch (e) { return true; } // não resolveu → trata como inseguro
}

// ── Parse do RSS ──────────────────────────────────────────────────────────────
function stripCdata(s) { return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim(); }
function decodeEntities(s) {
  return String(s || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
function pick(block, tag) {
  const m = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return m ? decodeEntities(stripCdata(m[1])) : '';
}
function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, '').trim(); }
// Descrição do episódio com os PARÁGRAFOS do feed (14/11/2026). Print do professor na aba
// Podcasts: "As frases ficaram todas juntas. Separar em parágrafos". O feed manda HTML
// (<p>, <br>); tirar as tags sem pôr quebra colava tudo ("endodirect.com.brReferencias:Davies"),
// e o corte em 500 caracteres partia as referências no meio ("2026-2.Eri"). Agora cada <p>/<br>
// vira quebra de linha, e o corte é bem maior e numa palavra inteira.
const DESC_MAX = 2000;
function descTexto(s) {
  let t = String(s || '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n• ')
    .replace(/<\/\s*(p|div|li|ul|ol|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  t = decodeEntities(t).replace(/&nbsp;/g, ' ').replace(/\r/g, '');
  t = t.split('\n').map((l) => l.replace(/[ \t\u00a0]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (t.length > DESC_MAX) {
    const c = t.slice(0, DESC_MAX), k = c.search(/\s\S*$/);
    t = (k > DESC_MAX * 0.8 ? c.slice(0, k) : c).trim() + '…';
  }
  return t;
}
const semEspaco = (s) => String(s || '').replace(/\s+/g, '').replace(/…$/, '');

function parseFeed(xml) {
  const channelTitle = pick(xml, 'title');
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const episodes = [];
  for (let i = 0; i < items.length && episodes.length < 300; i++) {
    const it = items[i];
    const title = pick(it, 'title');
    let audio = '';
    const enc = it.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i);
    if (enc) audio = decodeEntities(enc[1]);
    if (!audio) {
      const media = it.match(/<media:content\b[^>]*\burl=["']([^"']+)["'][^>]*>/i);
      if (media) audio = decodeEntities(media[1]);
    }
    let desc = pick(it, 'itunes:summary') || pick(it, 'description');
    desc = descTexto(desc);
    const pub = pick(it, 'pubDate');
    let at = Date.parse(pub);
    if (isNaN(at)) at = 0;
    const link = pick(it, 'link');
    if (title && audio) episodes.push({ title, desc, audio, at, link });
  }
  return { show: channelTitle, episodes };
}

// Busca o feed e devolve { show, episodes }. Lança em erro de rede/SSRF.
async function fetchFeed(feed) {
  if (!isSafeUrl(feed)) { const e = new Error('URL de feed inválida (use https público).'); e.code = 'BAD_URL'; throw e; }
  if (await hostResolvesPrivate(new URL(feed).hostname)) { const e = new Error('URL de feed não permitida.'); e.code = 'BAD_URL'; throw e; }
  const r = await fetch(feed, { headers: { 'User-Agent': 'EndodirectPodcastImporter/1.0', Accept: 'application/rss+xml, application/xml, text/xml, */*' } });
  if (!r.ok) throw new Error('Não foi possível baixar o feed (HTTP ' + r.status + ').');
  const len = Number(r.headers.get('content-length') || 0);
  if (len && len > MAX_FEED_BYTES) throw new Error('Feed muito grande.');
  let xml = await r.text();
  if (xml.length > MAX_FEED_BYTES) xml = xml.slice(0, MAX_FEED_BYTES);
  return parseFeed(xml);
}

// ── Categorização por subespecialidade (espelha inferPodcastSub do index.html) ─
function inferPodcastSub(text) {
  let t = String(text || '').toLowerCase();
  try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
  const has = (...a) => a.some((x) => t.indexOf(x) >= 0);
  if (has('tireoid', 'tiroid', 'hashimoto', 'graves', 'tsh', 't4 livre', 'nodulo tireo', 'hipotireoid', 'hipertireoid', 'bocio', 'tireotox', 'tireoglobul')) return 'Tireoide';
  if (has('adrenal', 'cushing', 'addison', 'feocromocitoma', 'aldosteron', 'suprarrenal', 'hiperplasia adrenal', 'insuficiencia adrenal', 'liddle')) return 'Adrenal';
  if (has('hipofis', 'prolactin', 'acromegalia', 'diabetes insipidus', 'pan-hipopituit', 'neuroendocrin', 'adenoma hipof')) return 'Neuroendocrinologia';
  if (has('osteoporo', 'osteopen', 'ossea', 'osso', 'calcio', 'vitamina d', 'paratireoid', ' pth', 'raquitismo', 'osteomalacia', 'metabolismo osseo', 'hiperpara')) return 'Osteometabolismo';
  if (has('dislipidem', 'colesterol', 'ldl', 'triglicer', 'estatina', 'pcsk9', 'lipid', 'lipemia')) return 'Dislipidemia';
  if (has('pediatr', 'infantil', 'crianca', 'puberdade', 'baixa estatura', 'crescimento', 'adolescente')) return 'Endocrinologia Pediátrica';
  if (has('esport', 'atleta', 'exercicio', 'anaboliz', 'doping', 'red-s')) return 'Endocrinologia Esportiva';
  if (has('transgener', 'transex', 'hormonizacao', 'afirmacao de genero')) return 'Transgeneridade';
  if (has('sop', 'ovario policist', 'menopausa', 'amenorreia', 'climaterio', 'endometri', 'hormonal feminina', 'ovarian', 'anti-mulleriano', 'antimulleriano', ' amh')) return 'Endocrinologia Feminina';
  if (has('testosteron', 'hipogonadismo masculino', 'disfuncao eretil', 'andropausa')) return 'Endocrinologia Masculina';
  if (has('obesid', 'sobrepeso', 'emagrec', ' peso', 'bariatric', 'tirzepatida', 'orforglipron', 'liraglutida', 'semaglutida', 'wegovy', 'mounjaro', 'glp-1', 'glp1', 'lipedema', 'saciedade', ' fome', 'mash', 'masld', 'esteatose')) return 'Obesidade';
  if (has('diabet', 'dm1', 'dm2', ' dm ', 'glicad', 'hba1c', 'hemoglobina glicada', 'insulin', 'cetoacidose', 'hipoglicemia', 'sglt2', 'sglt-2', 'isglt', 'metformina', 'glargina', 'glicemia')) return 'Diabetes';
  return '';
}

// ── Estado global (Supabase REST, service_role) ───────────────────────────────
function supabaseHeaders(serviceKey) {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
async function loadGlobalPayload(serviceKey) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: supabaseHeaders(serviceKey) });
  if (!r.ok) throw new Error(`Supabase leitura HTTP ${r.status}`);
  const rows = await r.json();
  return rows && rows[0] && rows[0].payload ? rows[0].payload : {};
}
async function saveGlobalPayload(serviceKey, payload) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?on_conflict=id`, {
    method: 'POST',
    headers: { ...supabaseHeaders(serviceKey), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'main', payload, updated_by: null, updated_at: new Date().toISOString() })
  });
  if (!r.ok) { const d = await r.text().catch(() => ''); throw new Error(`Supabase gravacao HTTP ${r.status}${d ? ': ' + d.slice(0, 300) : ''}`); }
}

// Mescla episódios do feed no topo de payload.podcasts, sem duplicar (chave =
// URL do áudio ou título). Mantém os existentes; novos entram à frente.
// Descrição dos já importados (14/11/2026): o episódio do feed (tipo rss, mesmo áudio) cuja
// descrição gravada é a MESMA do feed só sem as quebras (ou cortada em 500) recebe a versão com
// parágrafos. Descrição editada à mão (texto diferente) não é tocada.
function mergePodcasts(existing, episodes, defaultArea) {
  const list = Array.isArray(existing) ? existing.slice() : [];
  const porAudio = {}, porTitulo = {};
  list.forEach((p, i) => {
    if (!p || p.tipo !== 'rss') return;
    const k = String(p.audio || '').trim(), t = String(p.title || '').trim().toLowerCase();
    if (k) porAudio[k] = i;
    if (t) porTitulo[t] = i;
  });
  let updated = 0;
  episodes.forEach((ep) => {
    let i = porAudio[String(ep.audio || '').trim()];
    if (i == null) i = porTitulo[String(ep.title || '').trim().toLowerCase()];
    if (i == null) return;
    const p = list[i], nova = String(ep.desc || ''), velha = String(p.desc || '');
    if (!nova || nova === velha || nova.indexOf('\n') < 0 && nova.length <= velha.length) return;
    if (semEspaco(nova).indexOf(semEspaco(velha)) !== 0) return;
    list[i] = Object.assign({}, p, { desc: nova });
    updated++;
  });
  const seen = {};
  list.forEach((p) => { seen[String((p.audio || p.src || '')).trim()] = 1; seen[String(p.title || '').trim().toLowerCase()] = 1; });
  const novos = [];
  episodes.forEach((ep) => {
    const key = String(ep.audio || '').trim(), tk = String(ep.title || '').trim().toLowerCase();
    if (!key || seen[key] || seen[tk]) return;
    const sub = inferPodcastSub((ep.title || '') + ' ' + (ep.desc || '')) || defaultArea || '';
    novos.push({ title: ep.title, area: sub, desc: ep.desc || '', audio: ep.audio, tipo: 'rss', at: ep.at || Date.now() });
    seen[key] = 1; seen[tk] = 1;
  });
  return { added: novos.length, updated, podcasts: novos.concat(list).slice(0, MAX_PODCASTS) };
}

// Atualização automática (cron): lê o feed do payload (ou o padrão), busca os
// episódios e grava os novos no topo. Read-modify-write curto p/ minimizar corrida
// com edições do admin. Não derruba nada se não houver episódios novos.
async function refreshPodcastsFromFeed() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) ausente nas variaveis de ambiente.');
  const payload = await loadGlobalPayload(serviceKey);
  const feed = (typeof payload.pod_rss_feed === 'string' && payload.pod_rss_feed.trim()) ? payload.pod_rss_feed.trim() : DEFAULT_FEED;
  const { show, episodes } = await fetchFeed(feed);
  // Relê o estado mais recente logo antes de salvar (janela de corrida em ms).
  const latest = await loadGlobalPayload(serviceKey);
  const merged = mergePodcasts(latest.podcasts, episodes, '');
  if (merged.added > 0 || merged.updated > 0) {
    await saveGlobalPayload(serviceKey, { ...latest, podcasts: merged.podcasts });
  }
  return { feed, show, episodesInFeed: episodes.length, added: merged.added, updated: merged.updated, total: merged.podcasts.length };
}

module.exports = {
  DEFAULT_FEED,
  fetchFeed,
  parseFeed,
  descTexto,
  inferPodcastSub,
  mergePodcasts,
  refreshPodcastsFromFeed
};
