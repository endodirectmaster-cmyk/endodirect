// Cron semanal: atualiza automaticamente os episódios do podcast a partir do
// feed RSS (lib/podcasts.js), gravando os novos no topo de
// endodirect_global_state.payload.podcasts. Substitui a importação manual no
// painel do professor (que continua disponível).
// Auth: a Vercel envia Authorization: Bearer $CRON_SECRET (defina essa env).
const { refreshPodcastsFromFeed } = require('../../lib/podcasts');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return json(res, 401, { ok: false, error: 'Nao autorizado.' });
  }
  try {
    const result = await refreshPodcastsFromFeed();
    return json(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error('[cron-podcast] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar os podcasts.' });
  }
};

module.exports.config = { maxDuration: 60 };
