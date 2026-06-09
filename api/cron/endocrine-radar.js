// Cron diario do radar de endocrinologia.
// A logica fica em lib/radar.js (compartilhada com /api/admin/refresh-radar).
// Auth: a Vercel envia Authorization: Bearer $CRON_SECRET (defina essa env).
const { runRadar } = require('../../lib/radar');
const { sendDailyNewsletter } = require('../../lib/newsletter');

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
    const result = await runRadar();
    // Newsletter diária (só no cron): envia os 3 mais relevantes do dia.
    // Fail-safe: nunca derruba o cron do radar se o envio falhar.
    let newsletter = { sent: false, reason: 'skipped' };
    try { newsletter = await sendDailyNewsletter(result.topArticles); }
    catch (e) { console.error('[cron-radar] newsletter erro:', (e && e.stack) || e); newsletter = { sent: false, reason: 'error' }; }
    return json(res, 200, { ok: true, ...result, newsletter });
  } catch (error) {
    console.error('[cron-radar] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar o radar.' });
  }
};

module.exports.config = { maxDuration: 300 };
