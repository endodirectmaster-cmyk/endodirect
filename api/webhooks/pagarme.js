// Endodirect — Webhook do pagar.me (Fase 2 — ESQUELETO)
// =====================================================================
// O que faz: recebe os eventos de pagamento do pagar.me e libera/revoga
// o acesso do aluno automaticamente, gravando em public.endodirect_acessos
// (Etapa 1) com o ESCOPO correto: 'plano' (assinatura) ou 'curso:<slug>'
// (curso avulso). No pagamento confirmado, cria a conta do aluno
// (Supabase Auth, ja confirmada), ativa o acesso e dispara o e-mail
// para o aluno definir a senha.
//
// ESCOPO (importante): para cursos avulsos, configure metadata.scope no
// link/produto do pagar.me, ex.: { "scope": "curso:endoteem" }. Assinaturas
// sao detectadas automaticamente como 'plano'. Sem metadata.scope, ha uma
// heuristica pelo nome do item; se nada casar, o evento e ignorado (nao
// libera acesso errado).
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

async function patchById(id, row) {
  const up = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos?id=eq.${id}`, {
    method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
  });
  if (!up.ok) throw new Error(`PATCH acesso ${up.status}: ${(await up.text().catch(() => '')).slice(0, 200)}`);
}

async function findAcessoId(email, scope) {
  const q = `${SUPABASE_URL}/rest/v1/endodirect_acessos?email=eq.${encodeURIComponent(email)}&scope=eq.${encodeURIComponent(scope)}&select=id`;
  const r = await fetch(q, { headers: sbHeaders() });
  const rows = r.ok ? await r.json().catch(() => []) : [];
  return rows && rows[0] ? rows[0].id : null;
}

async function upsertAcesso(row) {
  // Idempotente e a prova de corrida: order.paid e charge.paid chegam quase juntos.
  const existingId = await findAcessoId(row.email, row.scope);
  if (existingId) return patchById(existingId, row);
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_acessos`, {
    method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row)
  });
  if (ins.ok) return;
  // Conflito (a outra requisicao inseriu primeiro): busca de novo e atualiza.
  if (ins.status === 409 || ins.status === 422) {
    const again = await findAcessoId(row.email, row.scope);
    if (again) return patchById(again, row);
  }
  throw new Error(`POST acesso ${ins.status}: ${(await ins.text().catch(() => '')).slice(0, 200)}`);
}

// Atualiza status dos acessos do e-mail; se scope for informado, so daquele escopo.
async function setStatusByEmail(email, status, scope) {
  let url = `${SUPABASE_URL}/rest/v1/endodirect_acessos?email=eq.${encodeURIComponent(email)}`;
  if (scope) url += `&scope=eq.${encodeURIComponent(scope)}`;
  await fetch(url, {
    method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ status: status, updated_at: new Date().toISOString() })
  });
}

// ---- Extracao do payload do pagar.me (TODO(pagarme): confirmar campos na doc v5) ----
function extractInfo(body, type) {
  type = type || '';
  const d = (body && body.data) || body || {};
  const sub = d.subscription || (d.invoice && d.invoice.subscription) || (type.indexOf('subscription') >= 0 ? d : null);
  const inv = d.invoice || (type.indexOf('invoice') >= 0 ? d : null);
  const order = d.order || (type.indexOf('order') >= 0 ? d : null);
  const charge = (Array.isArray(d.charges) && d.charges[0]) || (type.indexOf('charge') >= 0 ? d : null);
  const customer = d.customer
    || (sub && sub.customer)
    || (inv && inv.customer)
    || (charge && charge.customer)
    || (order && order.customer)
    || {};
  const cycle = (sub && (sub.current_cycle || sub.cycle)) || d.current_cycle || d.cycle || (inv && inv.cycle) || null;
  // metadata pode vir em varios niveis (order/charge/subscription/raiz)
  const meta = Object.assign({},
    (sub && sub.metadata) || {},
    (order && order.metadata) || {},
    (charge && charge.metadata) || {},
    d.metadata || {},
    body.metadata || {}
  );
  // descricoes dos itens (fallback p/ inferir o curso quando nao ha metadata.scope)
  const items = (sub && sub.items) || (order && order.items) || d.items || [];
  const itemText = Array.isArray(items)
    ? items.map((it) => String((it && (it.description || it.name)) || '')).join(' | ')
    : '';
  return {
    email: String(customer.email || '').toLowerCase(),
    name: customer.name || '',
    customerId: customer.id || '',
    orderId: (order && order.id) || d.order_id || '',
    subscriptionId: (sub && sub.id) || d.subscription_id || (inv && inv.subscription_id) || '',
    nextBilling: (sub && sub.next_billing_at) || d.next_billing_at || d.current_period_end
      || (cycle && (cycle.end_at || cycle.billing_at)) || (inv && inv.due_at) || '',
    scopeHint: String(meta.scope || meta.escopo || meta.curso || '').toLowerCase().trim(),
    itemText: itemText.toLowerCase()
  };
}

// Escopos validos conhecidos (mantenha em sincronia com endodirect_cursos)
const CURSO_SLUGS = ['hiperglicemia', 'lipides', 'endoteem', 'endo_essencial'];
const TIERS = ['standard', 'gold'];

// Normaliza um token de escopo:
//   'gold' / 'plano:gold' -> 'plano:gold' (pacote)
//   'endoteem' / 'curso:endoteem' -> 'curso:endoteem' (curso avulso)
//   'plano' / 'assinatura' -> 'plano' (legado; conta como Gold no banco)
function normScope(s) {
  s = String(s || '').trim().toLowerCase();
  if (!s) return '';
  if (s === 'plano' || s === 'assinatura') return 'plano';
  if (s.indexOf('plano:') === 0) return TIERS.indexOf(s.slice(6)) >= 0 ? s : '';
  if (TIERS.indexOf(s) >= 0) return 'plano:' + s;
  if (s.indexOf('curso:') === 0) return CURSO_SLUGS.indexOf(s.slice(6)) >= 0 ? s : '';
  if (CURSO_SLUGS.indexOf(s) >= 0) return 'curso:' + s;
  return '';
}

// Decide o(s) escopo(s) do acesso a partir do payload. Combos usam
// metadata.scope com lista separada por virgula, ex.: 'plano,curso:endoteem'.
// Prioridade: metadata.scope -> assinatura => 'plano' -> heuristica no nome do item.
function pickScopes(info) {
  const out = [];
  if (info.scopeHint) {
    info.scopeHint.split(/[,;]+/).forEach((tok) => {
      const n = normScope(tok);
      if (n && out.indexOf(n) < 0) out.push(n);
    });
  }
  if (out.length) return out;
  const t = info.itemText || '';
  if (/gold/.test(t)) return ['plano:gold'];
  if (/standard/.test(t)) return ['plano:standard'];
  if (/endoteem|teem/.test(t)) return ['curso:endoteem'];
  if (/hiperglicemia/.test(t)) return ['curso:hiperglicemia'];
  if (/essencial/.test(t)) return ['curso:endo_essencial'];
  if (/l[ií]pid/.test(t)) return ['curso:lipides'];
  if (info.subscriptionId || /plano|assinatura|recorr/.test(t)) return ['plano'];
  return []; // desconhecido -> nao provisiona (evita liberar errado)
}

function computePeriodEnd(scope, info) {
  // Curso avulso, OU plano comprado avulso (combo/one-time, sem assinatura
  // recorrente): acesso fixo (padrao 365 dias).
  if ((scope && scope.indexOf('curso:') === 0) || !info.subscriptionId) {
    return new Date(Date.now() + AVULSO_DIAS * 86400000).toISOString();
  }
  // Plano recorrente: usa a proxima cobranca, se vier no payload.
  if (info.nextBilling) {
    const t = Date.parse(info.nextBilling);
    if (!isNaN(t)) return new Date(t).toISOString();
  }
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
  if (auth === false) return json(res, 401, { ok: false, error: 'Credencial do webhook invalida.' });
  // auth === null => nenhuma credencial configurada (modo esqueleto): aceita, mas sinaliza no retorno.

  let body;
  try { body = JSON.parse((raw && raw.toString('utf8')) || '{}'); } catch (e) { return json(res, 400, { ok: false, error: 'JSON invalido.' }); }

  const type = String(body.type || body.event || '').toLowerCase();
  const info = extractInfo(body, type);

  try {
    const scopes = pickScopes(info);

    if (PAID_EVENTS.indexOf(type) >= 0) {
      if (!info.email) return json(res, 200, { ok: true, skipped: 'payload sem e-mail do cliente', type });
      if (!scopes.length) return json(res, 200, { ok: true, skipped: 'escopo nao identificado (defina metadata.scope no link/produto)', type });
      const user = await ensureUser(info.email, info.name);
      for (const scope of scopes) {
        const tipo = (scope.indexOf('curso:') === 0 || !info.subscriptionId) ? 'avulso' : 'recorrente';
        await upsertAcesso({
          user_id: user.id,
          email: info.email,
          scope: scope,
          status: 'active',
          tipo: tipo,
          expires_at: computePeriodEnd(scope, info),
          provider: 'pagarme',
          provider_customer_id: info.customerId || null,
          provider_subscription_id: info.subscriptionId || null,
          provider_order_id: info.orderId || null,
          updated_at: new Date().toISOString()
        });
      }
      await sendSetPasswordEmail(info.email);
      return json(res, 200, { ok: true, action: 'activated', email: info.email, scopes: scopes, authConfigured: auth !== null });
    }

    if (REVOKE_EVENTS.indexOf(type) >= 0) {
      // Revoga so o(s) escopo(s) afetado(s), se identificavel; senao, todos do e-mail.
      if (info.email) {
        if (scopes.length) { for (const s of scopes) await setStatusByEmail(info.email, 'canceled', s); }
        else await setStatusByEmail(info.email, 'canceled');
      }
      return json(res, 200, { ok: true, action: 'revoked', email: info.email, scopes: scopes.length ? scopes : 'all', authConfigured: auth !== null });
    }

    if (PASTDUE_EVENTS.indexOf(type) >= 0) {
      if (info.email) {
        if (scopes.length) { for (const s of scopes) await setStatusByEmail(info.email, 'past_due', s); }
        else await setStatusByEmail(info.email, 'past_due');
      }
      return json(res, 200, { ok: true, action: 'past_due', email: info.email, scopes: scopes.length ? scopes : 'all', authConfigured: auth !== null });
    }

    return json(res, 200, { ok: true, ignored: type || '(sem type)', authConfigured: auth !== null });
  } catch (e) {
    return json(res, 500, { ok: false, error: (e && e.message) || 'Falha ao processar o webhook.' });
  }
};

// pagar.me pode reenviar o evento; o handler e idempotente (upsert por user_id).
module.exports.config = { maxDuration: 30 };
