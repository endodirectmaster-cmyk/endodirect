// Conta de revisão do Google Play e da App Store. O revisor precisa entrar para ver
// o app por dentro, e as duas lojas pedem usuário e senha no formulário do app.
// Módulo de lib/ (NÃO conta como função serverless): roda em api/ai.js,
// kind:'conta_revisao', só para professor (adminFromReq).
//
// ⚠️ A SENHA NASCE AQUI e só vai na resposta ao professor que pediu: não fica no
// repositório, nem em texto no banco, nem no log. Para trocar, ele gera outra, e a
// anterior para de valer na hora.
//
// A conta é Gold com o EndoTEEM (o que um assinante completo vê), fica fora das
// contagens de aluno real (`endodirect_email_de_teste` e as listas das RPCs do
// painel) e não tem o limite de 2 aparelhos (o cliente não a derruba), porque o
// revisor do Google, o da Apple e os robôs do relatório de pré-lançamento entram ao
// mesmo tempo.

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const EMAIL_REVISAO = 'revisao@endodirect.com.br';
const ESCOPOS_REVISAO = ['plano:gold', 'curso:endoteem'];
const NOTA = 'Conta de revisão do Google Play e da App Store — fora das contagens de aluno real';
// Sem 0/O, 1/l/I: o revisor digita a senha lendo do formulário da loja.
const ALFABETO = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function sbHeaders(key, extra) {
  return Object.assign({ apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Accept: 'application/json' }, extra || {});
}

// 4 grupos de 4 (≈ 92 bits), com minúscula, maiúscula e dígito garantidos, para
// passar em qualquer regra de senha que o Auth tenha.
function gerarSenha() {
  for (;;) {
    const grupos = [];
    for (let g = 0; g < 4; g++) {
      let s = '';
      for (let i = 0; i < 4; i++) s += ALFABETO[crypto.randomInt(ALFABETO.length)];
      grupos.push(s);
    }
    const senha = grupos.join('-');
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha) && /[0-9]/.test(senha)) return senha;
  }
}

// O ?email do Admin API do Auth não filtra de forma confiável: pagina e casa o
// e-mail exato (mesmo cuidado do checkout).
async function acharUsuario(key, email) {
  for (let page = 1; page <= 50; page++) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: sbHeaders(key) });
    if (!r.ok) throw new Error('listar usuários: HTTP ' + r.status);
    const d = await r.json().catch(() => ({}));
    const list = Array.isArray(d) ? d : (d.users || []);
    if (!list.length) return null;
    const hit = list.find((u) => String(u.email || '').toLowerCase() === email);
    if (hit) return hit;
    if (list.length < 200) return null;
  }
  return null;
}

async function garantirAcesso(key, uid, scope) {
  const q = `${SUPABASE_URL}/rest/v1/endodirect_acessos?email=eq.${encodeURIComponent(EMAIL_REVISAO)}&scope=eq.${encodeURIComponent(scope)}&select=id`;
  const f = await fetch(q, { headers: sbHeaders(key) });
  if (!f.ok) throw new Error('ler acesso: HTTP ' + f.status);
  const rows = await f.json().catch(() => []);
  const row = { user_id: uid, email: EMAIL_REVISAO, scope, status: 'active', provider: 'interno', expires_at: null, notes: NOTA };
  const r = (rows && rows[0])
    ? await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos?id=eq.${encodeURIComponent(rows[0].id)}`, { method: 'PATCH', headers: sbHeaders(key, { Prefer: 'return=minimal' }), body: JSON.stringify(row) })
    : await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos`, { method: 'POST', headers: sbHeaders(key, { Prefer: 'return=minimal' }), body: JSON.stringify(row) });
  if (!r.ok) throw new Error(`gravar ${scope}: HTTP ${r.status}`);
}

// Cria a conta (se não existir) ou troca a senha, e garante os acessos.
// Devolve { ok, email, senha, criada } ou { ok:false, code, error }. NUNCA lança.
async function contaRevisao() {
  try {
    const key = serviceKey();
    if (!key) return { ok: false, code: 500, error: 'Indisponível agora: falta a chave do servidor.' };
    const senha = gerarSenha();
    let user = await acharUsuario(key, EMAIL_REVISAO);
    let criada = false;
    if (user) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'PUT', headers: sbHeaders(key), body: JSON.stringify({ password: senha, email_confirm: true })
      });
      if (!r.ok) throw new Error('trocar senha: HTTP ' + r.status);
    } else {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST', headers: sbHeaders(key),
        body: JSON.stringify({ email: EMAIL_REVISAO, password: senha, email_confirm: true, user_metadata: { name: 'Revisão das lojas' } })
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d || !d.id) throw new Error('criar conta: HTTP ' + r.status);
      user = d;
      criada = true;
    }
    for (const scope of ESCOPOS_REVISAO) await garantirAcesso(key, user.id, scope);
    console.log('[conta-revisao]', criada ? 'conta criada' : 'senha trocada');
    return { ok: true, email: EMAIL_REVISAO, senha, criada };
  } catch (e) {
    console.error('[conta-revisao] falha:', (e && e.message) || e);
    return { ok: false, code: 502, error: 'Não foi possível preparar a conta de revisão. Tente de novo em alguns minutos.' };
  }
}

module.exports = { contaRevisao, gerarSenha, EMAIL_REVISAO, ESCOPOS_REVISAO };
