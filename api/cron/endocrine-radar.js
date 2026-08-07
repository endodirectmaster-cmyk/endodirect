// Cron diario do radar de endocrinologia.
// A logica fica em lib/radar.js (compartilhada com /api/admin/refresh-radar).
// Auth: a Vercel envia Authorization: Bearer $CRON_SECRET (defina essa env).
const { runRadar } = require('../../lib/radar');
const { sendDailyNewsletter } = require('../../lib/newsletter');
const { refreshPodcastsFromFeed } = require('../../lib/podcasts');
const { sendTrialEmails, sendWinbackNovidades, sendReengajamento } = require('../../lib/trial-emails');
const { sendIgDailyNotice, autoPostDailyQotd } = require('../../lib/instagram');
const { sendAvisoAoVivo } = require('../../lib/aovivo');
// Dá a partida na cadeia de discussões: uma requisição ao próprio backend, que
// gera um artigo por invocação e chama a próxima. Não espera a resposta — o que
// importa é a primeira invocação ter começado.
const { dispararCadeia } = require('../../lib/discussao-kick');
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
  const t0 = Date.now(); // marca o início: o orçamento da etapa lenta sai daqui
  try {
    const result = await runRadar();
    // Publica a Questão do Dia ANTES da newsletter, para que o e-mail do dia traga a
    // MESMA questão que vai ao ar na plataforma (sincronizadas). Idempotente por dia
    // (qotd_autopost_date) — o cron healthcheck (10h BRT) só confirma, sem repostar.
    // Fail-safe: nunca derruba o cron.
    let qotd = { posted: false, reason: 'skipped' };
    try { qotd = await autoPostDailyQotd(); }
    catch (e) { console.error('[cron-radar] auto-post QdD erro:', (e && e.stack) || e); qotd = { posted: false, reason: 'error' }; }
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
    // Campanha de recuperação "o que mudou desde a sua degustação". Idempotente
    // pela chave da campanha no ledger: roda todo dia e só manda para quem ainda
    // não recebeu — quando a lista zera, vira no-op silencioso.
    // Fail-safe: nunca derruba o cron se o envio falhar.
    let novidades = { sent: false, reason: 'skipped' };
    try { novidades = await sendWinbackNovidades(); }
    catch (e) { console.error('[cron-radar] novidades erro:', (e && e.stack) || e); novidades = { sent: false, reason: 'error' }; }
    // Reengajamento do ASSINANTE parado há 14+ dias, com os títulos que entraram
    // no mural. Quem decide é a RPC endodirect_reengajamento_alvos (inclusive o
    // cooldown de 30 dias — sem ele o mesmo grupo receberia isto todo dia).
    // Fail-safe: nunca derruba o cron se o envio falhar.
    let reengajamento = { sent: false, reason: 'skipped' };
    try { reengajamento = await sendReengajamento(); }
    catch (e) { console.error('[cron-radar] reengajamento erro:', (e && e.stack) || e); reengajamento = { sent: false, reason: 'error' }; }
    // Aviso da AULA AO VIVO do dia (e-mail + push). Pega carona aqui porque o
    // plano limita os cron jobs e a Vercel está em 12/12 funções serverless.
    // Idempotente por aula (ledger em payload.aovivo_sent). Fail-safe.
    let aovivo = { ok: true, skipped: 'nao rodou' };
    try { aovivo = await sendAvisoAoVivo(); }
    catch (e) { console.error('[cron-radar] aula ao vivo erro:', (e && e.stack) || e); aovivo = { ok: false, error: 'error' }; }
    // Lembrete diário do Story "Questão do Dia" (Instagram). Acoplado ao cron do
    // radar (plano limita o nº de crons). Fail-safe: nunca derruba o cron.
    let igStory = { sent: false, reason: 'skipped' };
    try { igStory = await sendIgDailyNotice(); }
    catch (e) { console.error('[cron-radar] instagram erro:', (e && e.stack) || e); igStory = { sent: false, reason: 'error' }; }
    // Discussão completa dos artigos abertos que RENDEM (metanálise, diretriz,
    // consenso, ensaio clínico) — ver lib/discussao-auto.js para por que não é
    // "todos os abertos". Vai POR ÚLTIMO de propósito: é a etapa lenta (dezenas
    // de segundos por artigo) e não pode roubar tempo da Questão do Dia nem da
    // newsletter, que são as que têm hora marcada. Recebe o tempo que sobrou,
    // com folga, e o que não couber hoje sai amanhã.
    // Fail-safe: nunca derruba o cron.
    // Discussão completa dos tipos que rendem: o cron apenas DÁ A PARTIDA na
    // cadeia — não gera nada aqui dentro.
    //
    // ⚠️ Gerar aqui é impossível e já custou caro (29/07): uma discussão leva
    // ~40s e o teto real do plano é 60s, que radar, Questão do Dia, newsletter,
    // podcasts e e-mails já consumiram. A etapa "cabia" no papel, a função
    // morria antes e a discussão sumia sem erro nenhum. Cada artigo precisa da
    // SUA invocação — é o que `discussao_cadeia` faz, encadeando sozinho até a
    // fila esvaziar.
    // Fail-safe: nunca derruba o cron.
    let discussoes = { partida: false };
    try { discussoes = { partida: await dispararCadeia() }; }
    catch (e) { console.error('[cron-radar] cadeia discussoes erro:', (e && e.stack) || e); discussoes = { partida: false }; }
    return json(res, 200, { ok: true, ...result, qotd, newsletter, podcasts, trialEmails, novidades, reengajamento, aovivo, igStory, discussoes });
  } catch (error) {
    console.error('[cron-radar] erro:', (error && error.stack) || error);
    try { await sendAlert('Radar diário falhou', ['O cron endocrine-radar lançou erro e NÃO atualizou o mural hoje.', 'Erro: ' + ((error && error.message) || error)]); } catch (_) {}
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar o radar.' });
  }
};

module.exports.config = { maxDuration: 300 };
