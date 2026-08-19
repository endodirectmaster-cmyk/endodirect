// Cron DIÁRIO da plataforma (20:00 UTC = 17h BRT):
//  0) SEGUNDA VARREDURA DO RADAR do dia. ⚠️ É a razão de o horário ter mudado de
//     13:00 para 20:00 UTC. O professor pediu duas varreduras (notícia da ANVISA
//     publicada 3h32 depois da varredura das 07:30 só apareceria no dia seguinte),
//     e o conserto de 17/08 foi mudar o cron do radar para `30 10,20 * * *` — duas
//     execuções na MESMA entrada de cron. O plano só aceita cron DIÁRIO, e a
//     Vercel recusou o `vercel.json` inteiro: nenhum deploy saiu por 33 horas,
//     e a produção ficou congelada na v242. A cadência de duas varreduras
//     continua existindo — mas em DUAS entradas diárias, que é o que o plano
//     aceita: 07:30 BRT aqui embaixo no cron do radar, e 17:00 BRT nesta.
//  1) Health check (lib/healthcheck.js) — resumo semanal às segundas; alerta sempre
//     que houver falha (qualquer dia); silêncio caso contrário.
//  2) BACKUP da Questão do Dia (lib/instagram.js autoPostDailyQotd): a postagem
//     PRIMÁRIA agora ocorre às 07:30 BRT no cron endocrine-radar, ANTES da newsletter,
//     para o e-mail do dia trazer a MESMA questão que está no ar (sincronizadas). Esta
//     chamada às 17h é idempotente (qotd_autopost_date) — só posta se o cron das 07:30
//     tiver falhado. Acoplado aqui porque o plano limita o nº de cron jobs (2 no teto,
//     e cada um só pode disparar UMA vez por dia).
// Auth: Vercel envia Authorization: Bearer $CRON_SECRET. Também aceita GET manual
// com o mesmo header.
const { runRadar } = require('../../lib/radar');
const { runHealthcheck } = require('../../lib/healthcheck');
const { autoPostDailyQotd } = require('../../lib/instagram');
const { sendStreakReminders } = require('../../lib/push');

// Dá a partida na cadeia de discussões do Mural (uma invocação por artigo).
// Não espera a resposta: o que importa é a primeira invocação ter começado.
const { dispararCadeia } = require('../../lib/discussao-kick');

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
  // 2ª varredura do dia, ANTES de tudo: é a etapa com hora marcada (notícia de
  // agência reguladora publicada depois das 07:30). Fail-safe: uma falha aqui não
  // pode derrubar o health check, que é justamente quem avisa quando algo quebrou.
  let radar = { ok: false, reason: 'skipped' };
  try { radar = { ok: true, ...(await runRadar()) }; }
  catch (e) { console.error('[cron-healthcheck] radar erro:', (e && e.stack) || e); radar = { ok: false, reason: 'error' }; }

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
  // Segunda partida diária da cadeia de discussões (a primeira é no cron do
  // radar, 07h30). Duas chances por dia: se a do radar falhar, esta cobre.
  // Fail-safe: nunca derruba o healthcheck.
  let discussoes = { partida: false };
  try { discussoes = { partida: await dispararCadeia() }; }
  catch (e) { console.error('[cron-health] cadeia discussoes erro:', (e && e.stack) || e); }
  return json(res, status, { ...result, radar: { ok: radar.ok, novos: radar.added || radar.novos || 0 }, qotd, streak, discussoes });
};

// ⚠️ 300 é o TETO DECLARADO, não o garantido: a Vercel corta pelo limite do plano
// sem avisar (foi essa confusão que me fez achar que o projeto era Pro). Igual ao
// do cron do radar, porque agora esta função faz o mesmo trabalho pesado.
module.exports.config = { maxDuration: 300 };
