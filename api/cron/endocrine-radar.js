// Cron diario do radar de endocrinologia.
// A logica fica em lib/radar.js (compartilhada com /api/admin/refresh-radar).
// Auth: a Vercel envia Authorization: Bearer $CRON_SECRET (defina essa env).
const { runRadar } = require('../../lib/radar');
const { sendDailyNewsletter } = require('../../lib/newsletter');
const { refreshPodcastsFromFeed } = require('../../lib/podcasts');
const { sendTrialEmails } = require('../../lib/trial-emails');
const { sendAlert } = require('../../lib/alert');

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
    catch (e) {
      console.error('[cron-radar] newsletter erro:', (e && e.stack) || e); newsletter = { sent: false, reason: 'error' };
      try { await sendAlert('Newsletter diária falhou', ['O radar atualizou o mural, mas o envio da newsletter do dia falhou.', 'Erro: ' + ((e && e.message) || e)]); } catch (_) {}
    }
    // Atualização automática dos podcasts a partir do feed RSS. Fica acoplada
    // ao cron do radar (em vez de um cron próprio) porque o plano limita o
    // número de cron jobs; roda diariamente e só grava episódios novos (dedup).
    // Fail-safe: nunca derruba o cron do radar se a importação falhar.
    let podcasts = { added: 0, reason: 'skipped' };
    try { podcasts = await refreshPodcastsFromFeed(); }
    catch (e) { console.error('[cron-radar] podcasts erro:', (e && e.stack) || e); podcasts = { added: 0, reason: 'error' }; }
    // E-mails do ciclo de degustação: aviso ~48h antes do fim + win-back para quem
    // já terminou. Acoplado ao cron do radar (plano limita o nº de crons).
    // Fail-safe: nunca derruba o cron se o envio falhar.
    let trialEmails = { sent: false, reason: 'skipped' };
    try { trialEmails = await sendTrialEmails(); }
    catch (e) { console.error('[cron-radar] trial-emails erro:', (e && e.stack) || e); trialEmails = { sent: false, reason: 'error' }; }
    return json(res, 200, { ok: true, ...result, newsletter, podcasts, trialEmails });
  } catch (error) {
    console.error('[cron-radar] erro:', (error && error.stack) || error);
    try { await sendAlert('Radar diário falhou', ['O cron endocrine-radar lançou erro e NÃO atualizou o mural hoje.', 'Erro: ' + ((error && error.message) || error)]); } catch (_) {}
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar o radar.' });
  }
};

module.exports.config = { maxDuration: 300 };
