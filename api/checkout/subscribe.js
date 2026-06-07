// Endodirect — Checkout de ASSINATURA (Fase 2b — pagar.me API v5, preco inline)
// =====================================================================
// Cria uma assinatura recorrente no pagar.me a partir de um cartao
// TOKENIZADO no navegador (o numero do cartao NUNCA passa por aqui),
// e ja libera o acesso do aluno (cria a conta + assinatura ativa).
//
// Nao depende de "Planos" no painel: o preco e a periodicidade sao
// definidos aqui (inline) e configurados por variaveis de ambiente.
//
// Fluxo:
//   1. Front: aluno preenche o cartao -> tokeniza direto no pagar.me
//      (POST https://api.pagar.me/core/v5/tokens?appId=PUBLIC_KEY) -> card_token
//   2. Front -> POST /api/checkout/subscribe { plan, card_token, email, name, document }
//   3. Aqui (secret key): cria customer + subscription (preco inline) no pagar.me
//   4. Em caso de sucesso: cria a conta (Supabase Auth) + assinatura ativa
//      e dispara o e-mail de "definir senha". O webhook mantem sincronizado.
//
// VARIAVEIS DE AMBIENTE (Vercel):
//   PAGARME_SECRET_KEY               (sk_test_... / sk_live_...) — NUNCA no front
//   PAGARME_TIER_STANDARD_AMOUNT     mensal em CENTAVOS (padrao 4500 = R$45)
//   PAGARME_TIER_GOLD_AMOUNT         mensal em CENTAVOS (padrao 6000 = R$60)
//   PAGARME_TIER_PREMIUM_AMOUNT      mensal em CENTAVOS (padrao 8500 = R$85)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) — ja existem
//
// OBS: alguns nomes de campos da API v5 estao marcados com TODO(pagarme)
// para confirmarmos no 1o teste de sandbox (lendo a resposta da API).
// =====================================================================

const PAGARME_API = 'https://api.pagar.me/core/v5';
const SECRET_KEY = process.env.PAGARME_SECRET_KEY || '';

// Pacotes (tiers) — assinatura MENSAL recorrente. Cada tier libera um nivel
// de acesso (Standard < Gold < Premium). Valores em CENTAVOS, sobrescritiveis
// por env: Standard R$45, Gold R$60, Premium R$85.
const SUB_PLANS = {
  standard: { interval: 'month', interval_count: 1, amount: Number(process.env.PAGARME_TIER_STANDARD_AMOUNT || 4500), label: 'Pacote Standard', scope: 'plano:standard' },
  gold:     { interval: 'month', interval_count: 1, amount: Number(process.env.PAGARME_TIER_GOLD_AMOUNT     || 6000), label: 'Pacote Gold',     scope: 'plano:gold' },
  premium:  { interval: 'month', interval_count: 1, amount: Number(process.env.PAGARME_TIER_PREMIUM_AMOUNT  || 8500), label: 'Pacote Premium',  scope: 'plano:premium' }
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function onlyDigits(s) { return String(s || '').replace(/\D+/g, ''); }

function pagarmeHeaders() {
  // pagar.me v5: Basic auth com a secret key como usuario e senha vazia.
  return {
    Authorization: 'Basic ' + Buffer.from(SECRET_KEY + ':').toString('base64'),
    'Content-Type': 'application/json', Accept: 'application/json'
  };
}
async function pagarme(path, body) {
  const r = await fetch(`${PAGARME_API}${path}`, { method: 'POST', headers: pagarmeHeaders(), body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && (data.message || (data.errors && JSON.stringify(data.errors)))) || ('HTTP ' + r.status);
    const err = new Error(msg); err.status = r.status; err.detail = data; throw err;
  }
  return data;
}

// ---- Supabase (service role) ----
function sbHeaders() {
  return { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, 'Content-Type': 'application/json', Accept: 'application/json' };
}
async function findUserByEmail(email) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, { headers: sbHeaders() });
  if (!r.ok) return null;
  const d = await r.json().catch(() => ({}));
  const list = Array.isArray(d) ? d : (d.users || []);
  return list.find((u) => String(u.email || '').toLowerCase() === email) || list[0] || null;
}
async function ensureUser(email, name) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST', headers: sbHeaders(),
    body: JSON.stringify({ email: email, email_confirm: true, user_metadata: name ? { nome: name } : {} })
  });
  if (r.ok) return r.json();
  const found = await findUserByEmail(email);
  if (found) return found;
  throw new Error('Falha ao criar/buscar usuario no Supabase.');
}
async function sendSetPasswordEmail(email) {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST', headers: sbHeaders(), body: JSON.stringify({ type: 'recovery', email: email })
    });
  } catch (e) {}
}
// Upsert por (email, scope) em endodirect_acessos. Idempotente.
async function upsertAcesso(row) {
  const q = `${SUPABASE_URL}/rest/v1/endodirect_acessos?email=eq.${encodeURIComponent(row.email)}&scope=eq.${encodeURIComponent(row.scope)}&select=id`;
  const find = await fetch(q, { headers: sbHeaders() });
  const rows = find.ok ? await find.json().catch(() => []) : [];
  if (rows && rows[0]) {
    const up = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos?id=eq.${rows[0].id}`, {
      method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
    });
    if (!up.ok) throw new Error('PATCH acesso ' + up.status);
    return;
  }
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos`, {
    method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
  });
  if (!ins.ok && ins.status !== 409 && ins.status !== 422) throw new Error('POST acesso ' + ins.status);
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true, service: 'endodirect-subscribe',
      ready: !!(SECRET_KEY && SERVICE_ROLE),
      plans: {
        standard: SUB_PLANS.standard.amount > 0,
        gold: SUB_PLANS.gold.amount > 0,
        premium: SUB_PLANS.premium.amount > 0
      }
    });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }
  if (!SECRET_KEY) return json(res, 500, { ok: false, error: 'PAGARME_SECRET_KEY ausente no servidor.' });
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente.' });

  let body;
  try { body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}'); } catch (e) { return json(res, 400, { ok: false, error: 'JSON invalido.' }); }

  const planKey = String(body.plan || '').toLowerCase();
  const cfg = SUB_PLANS[planKey];
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const document = onlyDigits(body.document);
  const cardToken = String(body.card_token || body.cardToken || '').trim();

  if (!cfg || !(cfg.amount > 0)) return json(res, 400, { ok: false, error: 'Plano invalido ou preco nao configurado.' });
  if (!email || !/.+@.+\..+/.test(email)) return json(res, 400, { ok: false, error: 'E-mail invalido.' });
  if (!cardToken) return json(res, 400, { ok: false, error: 'Cartao nao tokenizado.' });

  try {
    // 1) Cliente. TODO(pagarme): confirmar 'document_type'/'type'.
    const customer = await pagarme('/customers', {
      name: name || email.split('@')[0], email: email, type: 'individual',
      document: document || undefined, document_type: document ? 'CPF' : undefined
    });

    // 2) Assinatura com preco inline (sem plano). TODO(pagarme): confirmar
    //    'card_token', 'billing_type', 'items[].pricing_scheme.price' (centavos).
    const sub = await pagarme('/subscriptions', {
      customer_id: customer.id,
      payment_method: 'credit_card',
      card_token: cardToken,
      interval: cfg.interval,
      interval_count: cfg.interval_count,
      billing_type: 'prepaid',
      installments: 1,
      items: [{ description: 'Endodirect — ' + cfg.label, quantity: 1, pricing_scheme: { scheme_type: 'unit', price: cfg.amount } }]
    });

    const status = String(sub.status || '').toLowerCase();
    const okStatuses = ['active', 'trialing', 'future', 'paid'];
    if (status && okStatuses.indexOf(status) < 0) {
      return json(res, 200, { ok: false, status: status, error: 'Pagamento nao aprovado.', subscriptionId: sub.id });
    }

    // 3) Libera o acesso imediatamente; o webhook mantem sincronizado.
    const user = await ensureUser(email, name);
    const nextBilling = sub.next_billing_at || (sub.current_cycle && sub.current_cycle.end_at) || null;
    await upsertAcesso({
      user_id: user.id, email: email, scope: cfg.scope, status: 'active', tipo: 'recorrente',
      expires_at: nextBilling ? new Date(Date.parse(nextBilling)).toISOString() : null,
      provider: 'pagarme', provider_customer_id: customer.id || null,
      provider_subscription_id: sub.id || null,
      notes: planKey, updated_at: new Date().toISOString()
    });
    await sendSetPasswordEmail(email);

    return json(res, 200, { ok: true, status: status || 'active', subscriptionId: sub.id, email: email });
  } catch (e) {
    return json(res, (e && e.status) || 500, { ok: false, error: (e && e.message) || 'Falha ao criar a assinatura.' });
  }
};

module.exports.config = { maxDuration: 30 };
