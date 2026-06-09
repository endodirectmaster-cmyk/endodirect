// Descadastro da newsletter. Link assinado por token (HMAC) por destinatário.
// GET  → registra o opt-out e mostra página de confirmação.
// POST → one-click (RFC 8058, cabeçalho List-Unsubscribe-Post) — registra e responde 200.
const { addUnsubscribe, unsubToken } = require('../../lib/newsletter');

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function page(msg) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter Endodirect</title></head>`
    + `<body style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center">`
    + `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:30px 34px;max-width:460px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.06)">`
    + `<div style="font-size:21px;font-weight:800;color:#1e3a5f;margin-bottom:12px">Endodirect</div>`
    + `<div style="font-size:15px;color:#111827;line-height:1.65">${msg}</div></div></body></html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const u = new URL(req.url, 'http://localhost');
    const email = String(u.searchParams.get('e') || '').trim().toLowerCase();
    const token = String(u.searchParams.get('t') || '').trim();
    const valid = email && email.indexOf('@') > 0 && token && token === unsubToken(email);
    if (!valid) {
      res.statusCode = 400;
      return res.end(page('Link de cancelamento inválido ou expirado. Se o problema persistir, responda ao e-mail da newsletter.'));
    }
    await addUnsubscribe(email);
    if (req.method === 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Unsubscribed');
    }
    res.statusCode = 200;
    return res.end(page('Pronto! <b>' + esc(email) + '</b> foi removido da newsletter diária.<br>Você não receberá mais esses e-mails.'));
  } catch (error) {
    console.error('[newsletter-unsubscribe] erro:', (error && error.stack) || error);
    res.statusCode = 500;
    return res.end(page('Não foi possível processar o cancelamento agora. Tente novamente em instantes.'));
  }
};
