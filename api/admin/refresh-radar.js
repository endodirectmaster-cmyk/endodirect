// Atualiza o radar do mural sob demanda, acionado pelo PROFESSOR no painel.
// Autenticacao: o front envia Authorization: Bearer <access_token da sessao
// Supabase do admin>. Validamos o token, conferimos que o e-mail esta em
// endodirect_admins e so entao rodamos o radar (lib/radar.js).
const { runRadar } = require('../../lib/radar');
const push = require('../../lib/push');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => resolve(Buffer.from('')));
  });
}

async function userFromToken(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + token }
  });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

async function isAdminEmail(email) {
  const url = `${SUPABASE_URL}/rest/v1/endodirect_admins?email=eq.${encodeURIComponent(email)}&select=email`;
  const r = await fetch(url, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
  if (!r.ok) return false;
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, service: 'endodirect-refresh-radar', ready: !!SERVICE_ROLE, pushReady: push.isConfigured() });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente no servidor.' });

  const auth = req.headers.authorization || '';
  const token = auth.indexOf('Bearer ') === 0 ? auth.slice(7).trim() : '';
  if (!token) return json(res, 401, { ok: false, error: 'Sessao ausente.' });

  const user = await userFromToken(token);
  const email = user && String(user.email || '').toLowerCase();
  if (!email) return json(res, 401, { ok: false, error: 'Sessao invalida.' });
  if (!(await isAdminEmail(email))) return json(res, 403, { ok: false, error: 'Apenas administradores podem usar este recurso.' });

  // Corpo opcional. { action: 'push', title, body, url } → dispara a notificação
  // no celular dos alunos inscritos (avisos/breaking news). Sem action → radar.
  let payload = {};
  try { payload = JSON.parse((await readRawBody(req)).toString('utf8') || '{}'); } catch (e) { payload = {}; }

  if (payload && payload.action === 'push') {
    const title = String(payload.title || '').trim();
    if (!title) return json(res, 400, { ok: false, error: 'Titulo do aviso ausente.' });
    if (!push.isConfigured()) return json(res, 503, { ok: false, error: 'Notificacoes nao configuradas no servidor (VAPID_PRIVATE_KEY ausente).' });
    try {
      const result = await push.sendToAll({
        title: title.slice(0, 120),
        body: String(payload.body || '').slice(0, 300),
        url: String(payload.url || 'https://www.endodirect.com.br/').slice(0, 400),
        tag: 'endodirect-aviso'
      });
      return json(res, 200, { ok: true, push: result });
    } catch (error) {
      console.error('[refresh-radar:push] erro:', (error && error.stack) || error);
      return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao enviar as notificacoes.' });
    }
  }

  try {
    const result = await runRadar();
    return json(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error('[refresh-radar] erro:', (error && error.stack) || error);
    return json(res, 500, { ok: false, error: (error && error.message) || 'Falha ao atualizar o radar.' });
  }
};

module.exports.config = { maxDuration: 300 };
