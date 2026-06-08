// Lê um feed RSS de podcast (ex.: Spotify for Podcasters / Anchor) e devolve a
// lista de episódios em JSON, para o painel admin importar todos de uma vez.
// Feito server-side para contornar CORS do host do feed.

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// Guarda básica contra SSRF: só https e hosts públicos.
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

function stripCdata(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}
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

module.exports = async function handler(req, res) {
  const feed = (req.query && (req.query.url || req.query.feed)) || '';
  if (!feed) return json(res, 400, { ok: false, error: 'Informe ?url=<feed RSS>' });
  if (!isSafeUrl(feed)) return json(res, 400, { ok: false, error: 'URL de feed inválida (use https público).' });

  let xml;
  try {
    const r = await fetch(feed, { headers: { 'User-Agent': 'EndodirectPodcastImporter/1.0', Accept: 'application/rss+xml, application/xml, text/xml, */*' } });
    if (!r.ok) return json(res, 502, { ok: false, error: 'Não foi possível baixar o feed (HTTP ' + r.status + ').' });
    xml = await r.text();
  } catch (e) {
    return json(res, 502, { ok: false, error: 'Falha ao buscar o feed: ' + ((e && e.message) || 'erro') });
  }

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
    desc = stripTags(desc).slice(0, 500);
    const pub = pick(it, 'pubDate');
    let at = Date.parse(pub);
    if (isNaN(at)) at = 0;
    const link = pick(it, 'link');
    if (title && audio) episodes.push({ title: title, desc: desc, audio: audio, at: at, link: link });
  }

  return json(res, 200, { ok: true, show: channelTitle, count: episodes.length, episodes: episodes });
};

module.exports.config = { maxDuration: 30 };
