// Endodirect — Webhook do pagar.me (Fase 2 — ESQUELETO)
// =====================================================================
// O que faz: recebe os eventos de pagamento do pagar.me e libera/revoga
// o acesso do aluno automaticamente, gravando em public.endodirect_assinaturas
// (criada na Fase 1). No pagamento confirmado, cria a conta do aluno
// (Supabase Auth, ja confirmada), ativa a assinatura e dispara o e-mail
// para o aluno definir a senha.
//
// Endpoint (apos deploy): https://SEU-DOMINIO/api/webhooks/pagarme
//
// VARIAVEIS DE AMBIENTE (configurar na Vercel quando for ativar):
//   SUPABASE_URL                  (ja existe)
//   SUPABASE_SERVICE_ROLE_KEY     (ja existe — usado pelo cron)
//   PAGARME_WEBHOOK_BASIC_USER    (recomendado) usuario do Basic Auth da URL do webhook
//   PAGARME_WEBHOOK_BASIC_PASS    (recomendado) senha do Basic Auth da URL do webhook
//   PAGARME_WEBHOOK_SECRET        (alternativa) segredo p/ validar assinatura HMAC
//   ENDODIRECT_AVULSO_DIAS        (opcional, padrao 365) dias de acesso no pagamento avulso
//
// SETUP no painel do pagar.me (Fase 2):
//   1. Crie os planos (assinatura mensal/anual) e/ou produto avulso.
//   2. Configure o webhook apontando para /api/webhooks/pagarme, de
//      preferencia com Basic Auth (usuario:senha) — os mesmos valores das
//      variaveis acima — para que so o pagar.me consiga chamar o endpoint.
//   3. Inscreva os eventos: order.paid, charge.paid, subscription.charged,
//      charge.refunded, charge.chargedback, subscription.canceled,
//      charge.payment_failed.
//
// IMPORTANTE: os nomes exatos de alguns campos do payload do pagar.me (v5)
// devem ser conferidos na documentacao oficial — os pontos marcados com
// "TODO(pagarme)" abaixo concentram isso. O esqueleto ja extrai os campos
// mais comuns de forma defensiva.
// =====================================================================

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
const WEBHOOK_SECRET = process.env.PAGARME_WEBHOOK_SECRET || '';
const BASIC_USER = process.env.PAGARME_WEBHOOK_BASIC_USER || '';
const BASIC_PASS = process.env.PAGARME_WEBHOOK_BASIC_PASS || '';
const AVULSO_DIAS = Number(process.env.ENDODIRECT_AVULSO_DIAS || 365);

const PAID_EVENTS = ['order.paid', 'charge.paid', 'subscription.charged', 'invoice.paid'];
const REVOKE_EVENTS = ['charge.refunded', 'charge.chargedback', 'subscription.canceled', 'subscription.cancelled'];
const PASTDUE_EVENTS = ['charge.payment_failed', 'invoice.payment_failed'];

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

function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a.length || a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch (e) { return false; }
}

// Retorna true (ok), false (invalido) ou null (nenhuma credencial configurada = modo esqueleto)
function verifyAuth(req, raw) {
  if (BASIC_USER || BASIC_PASS) {
    const got = req.headers.authorization || '';
    const expected = 'Basic ' + Buffer.from(BASIC_USER + ':' + BASIC_PASS).toString('base64');
    return safeEqual(got, expected);
  }
  if (WEBHOOK_SECRET) {
    const sig = req.headers['x-hub-signature'] || req.headers['x-pagarme-signature'] || req.headers['x-signature'] || '';
    const hex = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
    return safeEqual(sig, hex) || safeEqual(sig, 'sha256=' + hex);
  }
  return null;
}

// ---- Supabase (service role — ignora RLS) ----
function sbHeaders() {
  return { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, 'Content-Type': 'application/json', Accept: 'application/json' };
}

async function findUserByEmail(email) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const r = await fetch(url, { headers: sbHeaders() });
  if (!r.ok) return null;
  const d = await r.json().catch(() => ({}));
  const list = Array.isArray(d) ? d : (d.users || []);
  return list.find((u) => String(u.email || '').toLowerCase() === email) || list[0] || null;
}

async function ensureUser(email, name) {
  // Cria a conta ja confirmada (pay-first). Se ja existir, busca.
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify({ email: email, email_confirm: true, user_metadata: name ? { nome: name } : {} })
  });
  if (r.ok) return r.json();
  const found = await findUserByEmail(email);
  if (found) return found;
  const detail = await r.text().catch(() => '');
  throw new Error(`Falha ao criar/buscar usuario (${r.status})${detail ? ': ' + detail.slice(0, 200) : ''}`);
}

async function sendSetPasswordEmail(email) {
  // Gera link de definicao de senha; o e-mail so e enviado se houver SMTP configurado no Supabase.
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST', headers: sbHeaders(),
      body: JSON.stringify({ type: 'recovery', email: email })
    });
  } catch (e) { /* best-effort */ }
}

async function upsertAssinatura(row) {
  const find = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_assinaturas?user_id=eq.${row.user_id}&select=id`, { headers: sbHeaders() });
  const existing = find.ok ? await find.json().catch(() => []) : [];
  if (existing && existing[0]) {
    const up = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_assinaturas?id=eq.${existing[0].id}`, {
      method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
    });
    if (!up.ok) throw new Error(`PATCH assinatura ${up.status}: ${(await up.text().catch(() => '')).slice(0, 200)}`);
  } else {
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_assinaturas`, {
      method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
    });
    if (!ins.ok) throw new Error(`POST assinatura ${ins.status}: ${(await ins.text().catch(() => '')).slice(0, 200)}`);
  }
}

async function setStatusByEmail(email, status) {
  await fetch(`${SUPABASE_URL}/rest/v1/endodirect_assinaturas?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ status: status, updated_at: new Date().toISOString() })
  });
}

// ---- Extracao do payload do pagar.me (TODO(pagarme): confirmar campos na doc v5) ----
function extractInfo(body) {
  const d = (body && body.data) || body || {};
  const customer = d.customer
    || (Array.isArray(d.charges) && d.charges[0] && d.charges[0].customer)
    || (d.subscription && d.subscription.customer)
    || (d.order && d.order.customer)
    || {};
  return {
    email: String(customer.email || '').toLowerCase(),
    name: customer.name || '',
    customerId: customer.id || '',
    orderId: d.id || d.order_id || (d.order && d.order.id) || '',
    subscriptionId: (d.subscription && d.subscription.id) || d.subscription_id || '',
    nextBilling: d.next_billing_at || d.current_period_end
      || (d.current_cycle && (d.current_cycle.end_at || d.current_cycle.billing_at)) || ''
  };
}

function computePeriodEnd(tipo, info) {
  if (info.nextBilling) {
    const t = Date.parse(info.nextBilling);
    if (!isNaN(t)) return new Date(t).toISOString();
  }
  if (tipo === 'avulso') return new Date(Date.now() + AVULSO_DIAS * 86400000).toISOString();
  return null; // recorrente sem data informada => ativo ate cancelar
}

module.exports = async function handler(req, res) {
  // Health check simples (GET) para validar o deploy do endpoint.
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      service: 'endodirect-pagarme-webhook',
      ready: !!SERVICE_ROLE,
      authConfigured: !!(BASIC_USER || BASIC_PASS || WEBHOOK_SECRET)
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Metodo nao permitido.' });
  }
  if (!SERVICE_ROLE) {
    return json(res, 500, { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY ausente nas variaveis de ambiente.' });
  }

  let raw;
  try { raw = await readRawBody(req); } catch (e) { return json(res, 400, { ok: false, error: 'Falha ao ler o corpo.' }); }
  if ((!raw || !raw.length) && req.body) { try { raw = Buffer.from(JSON.stringify(req.body)); } catch (e) {} }

  const auth = verifyAuth(req, raw);
  // Diagnostico temporario (sem vazar a senha): vai no log E na resposta 401.
  var diag = {};
  try {
    const got = req.headers.authorization || '';
    let decUser = null, decPassLen = null;
    if (/^Basic /i.test(got)) {
      try {
        const dec = Buffer.from(got.split(' ')[1] || '', 'base64').toString('utf8');
        const idx = dec.indexOf(':');
        decUser = idx >= 0 ? dec.slice(0, idx) : dec;
        decPassLen = idx >= 0 ? (dec.length - idx - 1) : 0;
      } catch (e) {}
    }
    diag = {
      hasAuth: !!got, scheme: got.split(' ')[0] || null,
      recvUser: decUser, recvPassLen: decPassLen,
      expUser: BASIC_USER, expPassLen: (BASIC_PASS || '').length, result: auth
    };
    console.log('[pagarme-webhook] auth-debug', JSON.stringify(diag));
  } catch (e) {}
  if (auth === false) return json(res, 401, { ok: false, error: 'Credencial do webhook invalida.', debug: diag });
  // auth === null => nenhuma credencial configurada (modo esqueleto): aceita, mas sinaliza no retorno.

  let body;
  try { body = JSON.parse((raw && raw.toString('utf8')) || '{}'); } catch (e) { return json(res, 400, { ok: false, error: 'JSON invalido.' }); }

  const type = String(body.type || body.event || '').toLowerCase();
  const info = extractInfo(body);

  try {
    if (PAID_EVENTS.indexOf(type) >= 0) {
      if (!info.email) return json(res, 200, { ok: true, skipped: 'payload sem e-mail do cliente', type });
      const tipo = (type.indexOf('subscription') >= 0 || info.subscriptionId) ? 'recorrente' : 'avulso';
      const user = await ensureUser(info.email, info.name);
      await upsertAssinatura({
        user_id: user.id,
        email: info.email,
        status: 'active',
        plano: body.plano || (tipo === 'recorrente' ? 'assinatura' : 'avulso'),
        tipo: tipo,
        current_period_end: computePeriodEnd(tipo, info),
        provider: 'pagarme',
        provider_customer_id: info.customerId || null,
        provider_subscription_id: info.subscriptionId || null,
        provider_order_id: info.orderId || null,
        updated_at: new Date().toISOString()
      });
      await sendSetPasswordEmail(info.email);
      return json(res, 200, { ok: true, action: 'activated', email: info.email, tipo: tipo, authConfigured: auth !== null });
    }

    if (REVOKE_EVENTS.indexOf(type) >= 0) {
      if (info.email) await setStatusByEmail(info.email, 'canceled');
      return json(res, 200, { ok: true, action: 'revoked', email: info.email, authConfigured: auth !== null });
    }

    if (PASTDUE_EVENTS.indexOf(type) >= 0) {
      if (info.email) await setStatusByEmail(info.email, 'past_due');
      return json(res, 200, { ok: true, action: 'past_due', email: info.email, authConfigured: auth !== null });
    }

    return json(res, 200, { ok: true, ignored: type || '(sem type)', authConfigured: auth !== null });
  } catch (e) {
    return json(res, 500, { ok: false, error: (e && e.message) || 'Falha ao processar o webhook.' });
  }
};

// pagar.me pode reenviar o evento; o handler e idempotente (upsert por user_id).
module.exports.config = { maxDuration: 30 };
