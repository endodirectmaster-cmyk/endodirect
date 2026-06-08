// Endodirect — Checkout de PLANO ANUAL (pagamento único) via pagar.me v5.
// =====================================================================
// Suporta: cartão de crédito (parcelado), PIX e boleto.
// O acesso vale 1 ano (avulso). O mensal recorrente continua em /subscribe.
//
// Cartão tokenizado no navegador (POST /core/v5/tokens?appId=PUBLIC_KEY).
// Front -> POST /api/checkout/order { plan, method, email, name, document, phone,
//   address:{zip,line1,city,state}, card_token, installments }
//
// Cartão aprovado: libera o acesso na hora (expira em ~365 dias).
// PIX/boleto: devolve QR/linha digitável; o acesso é liberado pelo WEBHOOK
// (order.paid/charge.paid) quando o pagamento é confirmado.
//
// VARIÁVEIS DE AMBIENTE (Vercel):
//   PAGARME_SECRET_KEY
//   PAGARME_ANNUAL_STANDARD_AMOUNT  (centavos, padrão 50000 = R$500)
//   PAGARME_ANNUAL_GOLD_AMOUNT      (centavos, padrão 70000 = R$700)
//   PAGARME_ANNUAL_PREMIUM_AMOUNT   (centavos, padrão 90000 = R$900)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (já existem)
// =====================================================================

const PAGARME_API = 'https://api.pagar.me/core/v5';
const SECRET_KEY = process.env.PAGARME_SECRET_KEY || '';

const ANNUAL = {
  standard: { amount: Number(process.env.PAGARME_ANNUAL_STANDARD_AMOUNT || 50000), label: 'Plano Standard (anual)', scope: 'plano:standard' },
  gold:     { amount: Number(process.env.PAGARME_ANNUAL_GOLD_AMOUNT     || 70000), label: 'Plano Gold (anual)',     scope: 'plano:gold' },
  premium:  { amount: Number(process.env.PAGARME_ANNUAL_PREMIUM_AMOUNT  || 90000), label: 'Plano Premium (anual)',  scope: 'plano:premium' }
};
const ANNUAL_DIAS = 365;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); }
function readRawBody(req) { return new Promise(function (resolve, reject) { var c = []; req.on('data', function (x) { c.push(x); }); req.on('end', function () { resolve(Buffer.concat(c)); }); req.on('error', reject); }); }
function onlyDigits(s) { return String(s || '').replace(/\D+/g, ''); }

function pagarmeHeaders() { return { Authorization: 'Basic ' + Buffer.from(SECRET_KEY + ':').toString('base64'), 'Content-Type': 'application/json', Accept: 'application/json' }; }
async function pagarme(path, body, method) {
  const r = await fetch(PAGARME_API + path, { method: method || 'POST', headers: pagarmeHeaders(), body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(function () { return {}; });
  if (!r.ok) { const e = new Error((data && (data.message || (data.errors && JSON.stringify(data.errors)))) || ('HTTP ' + r.status)); e.status = r.status; e.detail = data; throw e; }
  return data;
}

function sbHeaders() { return { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, 'Content-Type': 'application/json', Accept: 'application/json' }; }
async function findUserByEmail(email) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/admin/users?email=' + encodeURIComponent(email), { headers: sbHeaders() });
  if (!r.ok) return null; const d = await r.json().catch(function () { return {}; });
  const list = Array.isArray(d) ? d : (d.users || []); return list.find(function (u) { return String(u.email || '').toLowerCase() === email; }) || list[0] || null;
}
async function ensureUser(email, name) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/admin/users', { method: 'POST', headers: sbHeaders(), body: JSON.stringify({ email: email, email_confirm: true, user_metadata: name ? { nome: name } : {} }) });
  if (r.ok) return r.json(); const f = await findUserByEmail(email); if (f) return f; throw new Error('Falha ao criar/buscar usuario no Supabase.');
}
async function sendSetPasswordEmail(email) { try { await fetch(SUPABASE_URL + '/auth/v1/admin/generate_link', { method: 'POST', headers: sbHeaders(), body: JSON.stringify({ type: 'recovery', email: email }) }); } catch (e) {} }
async function upsertAcesso(row) {
  const q = SUPABASE_URL + '/rest/v1/endodirect_acessos?email=eq.' + encodeURIComponent(row.email) + '&scope=eq.' + encodeURIComponent(row.scope) + '&select=id';
  const find = await fetch(q, { headers: sbHeaders() }); const rows = find.ok ? await find.json().catch(function () { return []; }) : [];
  if (rows && rows[0]) { const up = await fetch(SUPABASE_URL + '/rest/v1/endodirect_acessos?id=eq.' + rows[0].id, { method: 'PATCH', headers: Object.assign({}, sbHeaders(), { Prefer: 'return=minimal' }), body: JSON.stringify(row) }); if (!up.ok) throw new Error('PATCH acesso ' + up.status); return; }
  const ins = await fetch(SUPABASE_URL + '/rest/v1/endodirect_acessos', { method: 'POST', headers: Object.assign({}, sbHeaders(), { Prefer: 'return=minimal' }), body: JSON.stringify(row) });
  if (!ins.ok && ins.status !== 409 && ins.status !== 422) throw new Error('POST acesso ' + ins.status);
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return json(res, 200, { ok: true, service: 'endodirect-order', ready: !!(SECRET_KEY && SERVICE_ROLE), annual: { standard: ANNUAL.standard.amount, gold: ANNUAL.gold.amount, premium: ANNUAL.premium.amount } });
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false, error: 'Metodo nao permitido.' }); }
  if (!SECRET_KEY) return json(res, 500, { ok: false, error: 'PAGARME_SECRET_KEY ausente no servidor.' });
  if (!SERVICE_ROLE) return json(res, 500, { ok: false, error: 'Chave de servico do Supabase ausente.' });

  let body; try { body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}'); } catch (e) { return json(res, 400, { ok: false, error: 'JSON invalido.' }); }

  const planKey = String(body.plan || '').toLowerCase();
  const cfg = ANNUAL[planKey];
  const method = String(body.method || 'credit_card').toLowerCase();
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const document = onlyDigits(body.document);
  const phone = onlyDigits(body.phone);
  const cardToken = String(body.card_token || '').trim();
  const installments = Math.max(1, Math.min(12, parseInt(body.installments, 10) || 1));
  const addr = body.address || {};
  const zip = onlyDigits(addr.zip || addr.zip_code);
  const line1 = String(addr.line1 || addr.line_1 || '').trim();
  const city = String(addr.city || '').trim();
  const state = String(addr.state || addr.uf || '').trim().toUpperCase().slice(0, 2);

  if (!cfg || !(cfg.amount > 0)) return json(res, 400, { ok: false, error: 'Plano invalido ou preco anual nao configurado.' });
  if (!email || !/.+@.+\..+/.test(email)) return json(res, 400, { ok: false, error: 'E-mail invalido.' });
  if (!document || document.length < 11) return json(res, 400, { ok: false, error: 'CPF e obrigatorio.' });
  if (!phone || phone.length < 10) return json(res, 400, { ok: false, error: 'Telefone (celular com DDD) e obrigatorio.' });
  if (['credit_card', 'pix', 'boleto'].indexOf(method) < 0) return json(res, 400, { ok: false, error: 'Forma de pagamento invalida.' });
  if (method === 'credit_card' && !cardToken) return json(res, 400, { ok: false, error: 'Cartao nao tokenizado.' });
  const precisaEndereco = (method === 'credit_card' || method === 'boleto');
  if (precisaEndereco && (zip.length < 8 || !line1 || !city || state.length !== 2)) return json(res, 400, { ok: false, error: 'Endereco incompleto (CEP, endereco, cidade e UF).' });

  const docType = document.length > 11 ? 'CNPJ' : 'CPF';
  const phones = { mobile_phone: { country_code: '55', area_code: phone.slice(0, 2), number: phone.slice(2) } };
  const enderecoPagarme = precisaEndereco ? { line_1: line1, zip_code: zip, city: city, state: state, country: 'BR' } : null;

  try {
    // 1) Cliente (com documento + telefone; endereco quando necessario).
    const custBody = { name: name || email.split('@')[0], email: email, type: 'individual', document: document, document_type: docType, phones: phones };
    if (enderecoPagarme) custBody.address = enderecoPagarme;
    const customer = await pagarme('/customers', custBody);
    try { await pagarme('/customers/' + customer.id, custBody, 'PUT'); } catch (e) { console.log('[order] update customer:', (e && e.message) || e); }

    // 2) Pagamento conforme o metodo.
    let payment;
    if (method === 'credit_card') {
      let cardId = null;
      try { const card = await pagarme('/customers/' + customer.id + '/cards', { token: cardToken, billing_address: enderecoPagarme }); cardId = (card && card.id) || null; } catch (e) { console.log('[order] criar cartao:', (e && e.message) || e); }
      const cc = { operation_type: 'auth_and_capture', installments: installments, statement_descriptor: 'ENDODIRECT' };
      if (cardId) cc.card_id = cardId; else cc.card_token = cardToken;
      payment = { payment_method: 'credit_card', credit_card: cc };
    } else if (method === 'pix') {
      payment = { payment_method: 'pix', pix: { expires_in: 3600 } };
    } else {
      const due = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      payment = { payment_method: 'boleto', boleto: { instructions: 'Pagar ate o vencimento.', due_at: due } };
    }

    const order = await pagarme('/orders', {
      customer_id: customer.id,
      items: [{ amount: cfg.amount, description: 'Endodirect — ' + cfg.label, quantity: 1 }],
      payments: [payment],
      metadata: { scope: cfg.scope, plan: planKey, cycle: 'anual' }
    });

    const charge = (Array.isArray(order.charges) && order.charges[0]) || {};
    const lt = charge.last_transaction || {};
    const status = String(order.status || charge.status || '').toLowerCase();
    console.log('[order] method=' + method + ' status=' + status + ' order=' + (order.id || ''));

    if (method === 'pix') {
      return json(res, 200, { ok: true, method: 'pix', status: status || 'pending', order_id: order.id,
        pix: { qr_code: lt.qr_code || '', qr_code_url: lt.qr_code_url || '', expires_at: lt.expires_at || '' } });
    }
    if (method === 'boleto') {
      return json(res, 200, { ok: true, method: 'boleto', status: status || 'pending', order_id: order.id,
        boleto: { url: lt.url || charge.payment_link || '', line: lt.line || '', pdf: lt.pdf || '', barcode: lt.barcode || '', due_at: lt.due_at || '' } });
    }

    // Cartao: precisa estar pago para liberar.
    const ok = ['paid', 'captured'].indexOf(status) >= 0 || ['paid', 'captured'].indexOf(String(charge.status || '').toLowerCase()) >= 0;
    if (!ok) {
      let reason = (lt.gateway_response && Array.isArray(lt.gateway_response.errors) && lt.gateway_response.errors[0] && lt.gateway_response.errors[0].message) || lt.acquirer_message || '';
      return json(res, 200, { ok: false, method: 'credit_card', status: status || 'failed', error: 'Pagamento nao aprovado.' + (reason ? ' (' + reason + ')' : '') });
    }
    const user = await ensureUser(email, name);
    await upsertAcesso({ user_id: user.id, email: email, scope: cfg.scope, status: 'active', tipo: 'avulso',
      expires_at: new Date(Date.now() + ANNUAL_DIAS * 86400000).toISOString(),
      provider: 'pagarme', provider_customer_id: customer.id || null, provider_order_id: order.id || null,
      notes: planKey + ':anual', updated_at: new Date().toISOString() });
    await sendSetPasswordEmail(email);
    return json(res, 200, { ok: true, method: 'credit_card', status: 'paid', order_id: order.id });
  } catch (e) {
    return json(res, (e && e.status) || 500, { ok: false, error: (e && e.message) || 'Falha ao processar o pagamento.' });
  }
};
module.exports.config = { maxDuration: 30 };
