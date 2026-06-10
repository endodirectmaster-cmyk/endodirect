// Envio de TESTE da newsletter (prévia para um único e-mail).
// Autenticação aceita (qualquer uma):
//   1) Admin logado: Authorization: Bearer <access_token da sessao Supabase>
//      (validamos o token e conferimos que o e-mail está em endodirect_admins);
//   2) CRON_SECRET: ?secret=<CRON_SECRET> ou Authorization: Bearer <CRON_SECRET>.
// Uso pelo painel admin: POST /api/newsletter/test?to=voce@exemplo.com
// Envia os 3 artigos atuais do mural só para o endereço informado, sem afetar
// a trava diária nem disparar para a base de membros.
const { sendTestNewsletter } = require('../../lib/newsletter');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function userFromToken(token) {
  if (!SERVICE_ROLE) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + token }
  });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

async function isAdminEmail(email) {
  if (!SERVICE_ROLE) return false;
  const url = `${SUPABASE_URL}/rest/v1/endodirect_admins?email=eq.${encodeURIComponent(email)}&select=email`;
  const r = await fetch(url, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
  if (!r.ok) return false;
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

// Aceita admin (token de sessão Supabase) OU o CRON_SECRET.
async function authorize(req, bearer) {
  if (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) return { ok: true, via: 'cron' };
  if (bearer) {
    const user = await userFromToken(bearer);
    const email = user && String(user.email || '').toLowerCase();
    if (email && (await isAdminEmail(email))) return { ok: true, via: 'admin', email };
  }
  return { ok: false };
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const bearer = url.searchParams.get('secret') || (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  const auth = await authorize(req, bearer);
  if (!auth.ok) return json(res, 401, { ok: false, error: 'Nao autorizado.' });

  // Admin: padrão é enviar para o próprio e-mail logado se ?to não vier.
  const to = url.searchParams.get('to') || auth.email || process.env.NEWSLETTER_REPLYTO || '';
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
