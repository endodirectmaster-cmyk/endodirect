// Lê um feed RSS de podcast (ex.: Spotify for Podcasters / Anchor) e devolve a
// lista de episódios em JSON, para o painel admin importar todos de uma vez.
// Feito server-side para contornar CORS do host do feed. A leitura/guarda do
// feed é compartilhada com o cron semanal em lib/podcasts.js.

const { fetchFeed } = require('../lib/podcasts');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  const feed = (req.query && (req.query.url || req.query.feed)) || '';
  if (!feed) return json(res, 400, { ok: false, error: 'Informe ?url=<feed RSS>' });
  try {
    const { show, episodes } = await fetchFeed(feed);
    return json(res, 200, { ok: true, show, count: episodes.length, episodes });
  } catch (e) {
    const status = e && e.code === 'BAD_URL' ? 400 : 502;
    return json(res, status, { ok: false, error: (e && e.message) || 'Falha ao buscar o feed.' });
  }
};

module.exports.config = { maxDuration: 30 };
