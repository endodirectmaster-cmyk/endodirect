// Envio de TESTE da newsletter (prévia para um único e-mail).
// Protegido pelo CRON_SECRET. Uso:
//   GET /api/newsletter/test?secret=<CRON_SECRET>&to=voce@exemplo.com
// Envia os 3 artigos atuais do mural só para o endereço informado, sem afetar
// a trava diária nem disparar para a base de membros.
const { sendTestNewsletter } = require('../../lib/newsletter');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const secret = url.searchParams.get('secret') || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return json(res, 401, { ok: false, error: 'Nao autorizado.' });
  }
  const to = url.searchParams.get('to') || process.env.NEWSLETTER_REPLYTO || '';
  if (!to) return json(res, 400, { ok: false, error: 'Informe ?to=email_de_teste.' });
  try {
    const result = await sendTestNewsletter(to);
    return json(res, result.sent ? 200 : 400, { ok: !!result.sent, ...result });
  } catch (error) {
    console.error('[newsletter-test] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao enviar teste.' });
  }
};

module.exports.config = { maxDuration: 60 };
