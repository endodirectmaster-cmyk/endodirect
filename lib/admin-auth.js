// Verifica se uma requisição é de um ADMIN. Mesmo padrão do api/admin/refresh-radar.js:
//   Authorization: Bearer <token de sessão Supabase> → /auth/v1/user → e-mail →
//   e-mail presente na tabela endodirect_admins.
// Módulo de lib/ (NÃO conta como função serverless). NUNCA lança: retorna
// { email } quando é admin, ou null caso contrário.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}

function bearerToken(req) {
  const auth = String((req && req.headers && req.headers.authorization) || '');
  return auth.indexOf('Bearer ') === 0 ? auth.slice(7).trim() : '';
}

// Resolve o USUÁRIO autenticado a partir do token de sessão (Bearer) — só
// identidade, NÃO exige admin. Usado pela caixa de suporte do ALUNO (cada um vê
// só os próprios tickets). Retorna { email, id } ou null. NUNCA lança.
async function userFromReq(req) {
  try {
    const token = bearerToken(req);
    if (!token) return null;
    const key = serviceKey();
    if (!key) { console.error('[admin-auth] service key ausente'); return null; }
    const ur = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    if (!ur.ok) return null;
    const user = await ur.json().catch(() => null);
    const email = user && String(user.email || '').toLowerCase();
    if (!email) return null;
    return { email, id: (user && user.id) || null };
  } catch (e) {
    console.error('[admin-auth] userFromReq falha:', (e && e.message) || e);
    return null;
  }
}

async function adminFromReq(req) {
  try {
    // 1) Resolve o usuário a partir do token de sessão.
    const user = await userFromReq(req);
    if (!user) return null;
    const email = user.email;
    const key = serviceKey();
    if (!key) return null;

    // 2) Confere se o e-mail é admin (endodirect_admins).
    const ar = await fetch(
      `${SUPABASE_URL}/rest/v1/endodirect_admins?email=eq.${encodeURIComponent(email)}&select=email`,
      { headers: { apikey: key, Authorization: 'Bearer ' + key, Accept: 'application/json' } }
    );
    if (!ar.ok) return null;
    const rows = await ar.json().catch(() => []);
    return (Array.isArray(rows) && rows.length) ? { email } : null;
  } catch (e) {
    console.error('[admin-auth] falha:', (e && e.message) || e);
    return null;
  }
}

module.exports = { adminFromReq, userFromReq };
