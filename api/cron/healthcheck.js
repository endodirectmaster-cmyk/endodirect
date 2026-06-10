// Cron SEMANAL de health check da plataforma.
// A lógica fica em lib/healthcheck.js. Auth: Vercel envia
// Authorization: Bearer $CRON_SECRET. Também aceita GET manual com o mesmo header.
const { runHealthcheck } = require('../../lib/healthcheck');

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
    const result = await runHealthcheck();
    return json(res, 200, result);
  } catch (error) {
    console.error('[cron-healthcheck] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha no health check.' });
  }
};

module.exports.config = { maxDuration: 60 };
