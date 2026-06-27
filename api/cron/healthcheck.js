// Cron DIÁRIO da plataforma (13:00 UTC = 10h BRT):
//  1) Health check (lib/healthcheck.js) — resumo semanal às segundas; alerta sempre
//     que houver falha (qualquer dia); silêncio caso contrário.
//  2) Publica a Questão do Dia NA PLATAFORMA (lib/instagram.js autoPostDailyQotd):
//     promove o 1º item da fila a "postada", às 10h. Acoplado aqui porque o plano
//     limita o nº de cron jobs (2 no teto) — a newsletter/radar seguem no cron das
//     07:30 BRT (/api/cron/endocrine-radar), sem mudança.
// Auth: Vercel envia Authorization: Bearer $CRON_SECRET. Também aceita GET manual
// com o mesmo header.
const { runHealthcheck } = require('../../lib/healthcheck');
const { autoPostDailyQotd } = require('../../lib/instagram');
const { sendStreakReminders } = require('../../lib/push');

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
  // Health check e auto-post são independentes: publica a Questão do Dia mesmo que
  // o health check falhe.
  let result, status = 200;
  try {
    result = await runHealthcheck();
  } catch (error) {
    console.error('[cron-healthcheck] erro:', (error && error.stack) || error);
    result = { ok: false, error: (error && error.message) || 'Falha no health check.' };
    status = 500;
  }
  let qotd = { posted: false, reason: 'skipped' };
  try { qotd = await autoPostDailyQotd(); }
  catch (e) { console.error('[cron-healthcheck] auto-post QotD erro:', (e && e.stack) || e); qotd = { posted: false, reason: 'error' }; }
  // Lembrete diário de ofensiva (streak em risco) — push só p/ quem tem sequência
  // ativa e não estudou hoje. Fail-safe: nunca derruba o cron.
  let streak = { sent: 0, reason: 'skipped' };
  try { streak = await sendStreakReminders(); }
  catch (e) { console.error('[cron-healthcheck] streak push erro:', (e && e.stack) || e); streak = { ok: false, reason: 'error' }; }
  return json(res, status, { ...result, qotd, streak });
};

module.exports.config = { maxDuration: 60 };
