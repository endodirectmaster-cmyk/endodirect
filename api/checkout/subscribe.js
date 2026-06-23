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
//   PAGARME_TIER_STANDARD_AMOUNT     mensal em CENTAVOS (padrao 6900 = R$69)
//   PAGARME_TIER_GOLD_AMOUNT         mensal em CENTAVOS (padrao 9900 = R$99)
//   IMPORTANTE: os padroes DEVEM bater com api/checkout/config.js (o que a tela
//   mostra). Mantenha os dois em sincronia (ou sete os env acima como fonte unica).
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) — ja existem
//
// OBS: alguns nomes de campos da API v5 estao marcados com TODO(pagarme)
// para confirmarmos no 1o teste de sandbox (lendo a resposta da API).
// =====================================================================

const PAGARME_API = 'https://api.pagar.me/core/v5';
const SECRET_KEY = process.env.PAGARME_SECRET_KEY || '';

// Pacotes (tiers) — assinatura MENSAL recorrente. Cada tier libera um nivel
// de acesso (Standard < Gold). Valores em CENTAVOS, sobrescritiveis por env.
// Padroes ALINHADOS com api/checkout/config.js: Standard R$69, Gold R$99
// (o valor cobrado tem que ser igual ao valor exibido).
const SUB_PLANS = {
  standard: { interval: 'month', interval_count: 1, amount: Number(process.env.PAGARME_TIER_STANDARD_AMOUNT || 6900), label: 'Pacote Standard', scope: 'plano:standard' },
  gold:     { interval: 'month', interval_count: 1, amount: Number(process.env.PAGARME_TIER_GOLD_AMOUNT     || 9900), label: 'Pacote Gold',     scope: 'plano:gold' }
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
async function pagarme(path, body, method) {
  const r = await fetch(`${PAGARME_API}${path}`, { method: method || 'POST', headers: pagarmeHeaders(), body: body ? JSON.stringify(body) : undefined });
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
  email = String(email || '').toLowerCase();
  // Pagina e casa o e-mail EXATO; nunca cai em list[0] (provisionaria a conta errada
  // além de 50 usuários, pois o ?email do GoTrue admin não filtra de forma confiável).
  for (let page = 1; page <= 50; page++) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: sbHeaders() });
    if (!r.ok) return null;
    const d = await r.json().catch(() => ({}));
    const list = Array.isArray(d) ? d : (d.users || []);
    if (!list.length) break;
    const hit = list.find((u) => String(u.email || '').toLowerCase() === email);
    if (hit) return hit;
    if (list.length < 200) break;
  }
  return null;
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
        gold: SUB_PLANS.gold.amount > 0
      }
    });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }
  // Cria assinatura recorrente com a chave LIVE: exige origem do próprio site
  // (valida pelo HOSTNAME; header ausente passa p/ clientes não-browser).
  var okHost = function (h) { return h === 'endodirect.com.br' || h.endsWith('.endodirect.com.br') || /^endodirect[a-z0-9-]*\.vercel\.app$/.test(h); };
  var hostOf = function (s) { try { return new URL(String(s)).hostname.toLowerCase(); } catch (e) { return ''; } };
  var bad = function (s) { if (!s) return false; var h = hostOf(s); return !(h && okHost(h)); };
  if (bad(String(req.headers.origin || '')) || bad(String(req.headers.referer || ''))) return json(res, 403, { ok: false, error: 'Origem nao autorizada.' });
  if (!SECRET_KEY) return json(res, 500, { ok: false, error: 'PAGARME_SECRET_KEY ausente no servidor.' });
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente.' });

  let body;
  try { body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}'); } catch (e) { return json(res, 400, { ok: false, error: 'JSON invalido.' }); }

  const planKey = String(body.plan || '').toLowerCase();
  const cfg = SUB_PLANS[planKey];
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const document = onlyDigits(body.document);
  const phone = onlyDigits(body.phone);
  const cardToken = String(body.card_token || body.cardToken || '').trim();

  if (!cfg || !(cfg.amount > 0)) return json(res, 400, { ok: false, error: 'Plano invalido ou preco nao configurado.' });
  if (!email || !/.+@.+\..+/.test(email)) return json(res, 400, { ok: false, error: 'E-mail invalido.' });
  if (!cardToken) return json(res, 400, { ok: false, error: 'Cartao nao tokenizado.' });
  if (!document || document.length < 11) return json(res, 400, { ok: false, error: 'CPF e obrigatorio para o pagamento.' });
  if (!phone || phone.length < 10) return json(res, 400, { ok: false, error: 'Telefone (celular com DDD) e obrigatorio.' });

  // Endereco de cobranca (exigido pelo antifraude do pagar.me).
  const addr = body.address || {};
  const zip = onlyDigits(addr.zip || addr.zip_code);
  const line1 = String(addr.line1 || addr.line_1 || '').trim();
  const city = String(addr.city || '').trim();
  const state = String(addr.state || addr.uf || '').trim().toUpperCase().slice(0, 2);
  if (zip.length < 8 || !line1 || !city || state.length !== 2) {
    return json(res, 400, { ok: false, error: 'Endereco de cobranca incompleto (CEP, endereco, cidade e UF).' });
  }
  const billingAddress = { line_1: line1, zip_code: zip, city: city, state: state, country: 'BR' };

  // pagar.me exige ao menos um telefone do cliente.
  const phones = { mobile_phone: { country_code: '55', area_code: phone.slice(0, 2), number: phone.slice(2) } };

  try {
    // 1) Cliente.
    const docType = document.length > 11 ? 'CNPJ' : 'CPF';
    const customer = await pagarme('/customers', {
      name: name || email.split('@')[0], email: email, type: 'individual',
      document: document, document_type: docType, phones: phones
    });
    // O pagar.me reaproveita o cliente pelo e-mail; se ja existia sem documento/
    // telefone, o POST nao atualiza. Garante CPF + telefone com um PUT (best-effort).
    try {
      await pagarme('/customers/' + customer.id, {
        name: name || customer.name || email.split('@')[0], email: email, type: 'individual',
        document: document, document_type: docType, phones: phones
      }, 'PUT');
    } catch (e) { console.log('[subscribe] update customer falhou:', (e && e.message) || e); }

    // 2) Salva o cartao no cliente a partir do token (mais confiavel que enviar
    //    card_token solto na assinatura). Fallback: card_token na assinatura.
    let cardId = null;
    try {
      const card = await pagarme(`/customers/${customer.id}/cards`, { token: cardToken, billing_address: billingAddress });
      cardId = (card && card.id) || null;
    } catch (e) {
      console.log('[subscribe] criar cartao falhou, fallback card_token:', (e && e.message) || e);
    }

    // 3) Assinatura com preco inline (sem plano).
    const subBody = {
      customer_id: customer.id,
      payment_method: 'credit_card',
      interval: cfg.interval,
      interval_count: cfg.interval_count,
      billing_type: 'prepaid',
      installments: 1,
      items: [{ code: 'endo-' + planKey + '-mensal', description: 'Endodirect — ' + cfg.label, quantity: 1, pricing_scheme: { scheme_type: 'unit', price: cfg.amount } }]
    };
    if (cardId) subBody.card_id = cardId; else subBody.card_token = cardToken;
    const sub = await pagarme('/subscriptions', subBody);

    const status = String(sub.status || '').toLowerCase();
    console.log('[subscribe] status=' + status + ' cardId=' + (cardId || 'none') + ' subId=' + (sub.id || 'none'));
    const okStatuses = ['active', 'trialing', 'future', 'paid'];
    if (status && okStatuses.indexOf(status) < 0) {
      // Busca a cobranca da assinatura para descobrir o motivo exato da recusa.
      let reason = '';
      try {
        const cr = await fetch(`${PAGARME_API}/charges?subscription_id=${encodeURIComponent(sub.id)}&size=1`, { headers: pagarmeHeaders() });
        const cd = await cr.json().catch(() => ({}));
        const charge = (cd && Array.isArray(cd.data) && cd.data[0]) || null;
        const lt = charge && charge.last_transaction;
        const gw = lt && lt.gateway_response;
        reason = (gw && Array.isArray(gw.errors) && gw.errors[0] && gw.errors[0].message)
          || (lt && lt.acquirer_message) || (charge && charge.status) || '';
        console.log('[subscribe] chargeId=' + ((charge && charge.id) || 'none') + ' chargeStatus=' + ((charge && charge.status) || '') + ' reason=' + (reason || ''));
      } catch (e) { console.log('[subscribe] charges fetch err', (e && e.message) || e); }
      return json(res, 200, { ok: false, status: status, error: 'Pagamento nao aprovado.' + (reason ? ' (' + reason + ')' : ''), subscriptionId: sub.id });
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
    var st = (e && e.status) || 500;
    // 5xx do gateway = indisponibilidade: mensagem amigável, não vaza detalhe técnico.
    if (st >= 500) { console.error('[subscribe] erro', (e && e.message) || e); return json(res, 502, { ok: false, error: 'Pagamento temporariamente indisponível. Tente novamente em instantes.' }); }
    return json(res, st, { ok: false, error: (e && e.message) || 'Falha ao criar a assinatura.' });
  }
};

module.exports.config = { maxDuration: 30 };
