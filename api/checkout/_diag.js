// TEMPORÁRIO — diagnóstico do checkout pagar.me (sandbox). REMOVER após uso.
// GET /api/checkout/_diag?t=endodiag2026
// Roda token -> customer -> card -> subscription -> charges e devolve tudo.
const API = 'https://api.pagar.me/core/v5';
const PUB = process.env.PAGARME_PUBLIC_KEY || '';
const SK = process.env.PAGARME_SECRET_KEY || '';
const auth = 'Basic ' + Buffer.from(SK + ':').toString('base64');

async function call(method, path, body, useAuth, query) {
  const url = API + path + (query ? query : '');
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (useAuth) headers.Authorization = auth;
  const r = await fetch(url, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
  let data; try { data = await r.json(); } catch (e) { data = { _parse_error: true }; }
  return { status: r.status, data: data };
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const t = (req.query && (req.query.t || req.query.T)) || '';
  if (t !== 'endodiag2026') { res.statusCode = 403; return res.end(JSON.stringify({ ok: false, error: 'forbidden' })); }
  if (!PUB || !SK) { res.statusCode = 500; return res.end(JSON.stringify({ ok: false, error: 'keys ausentes', hasPub: !!PUB, hasSk: !!SK })); }
  const out = {};
  try {
    const tok = await call('POST', '/tokens', { type: 'card', card: { number: '4111111111111111', holder_name: 'TESTE DIAG', exp_month: 12, exp_year: 30, cvv: '123' } }, false, '?appId=' + encodeURIComponent(PUB));
    out.token = { status: tok.status, id: tok.data && tok.data.id, body: tok.data };
    if (!tok.data || !tok.data.id) { res.statusCode = 200; return res.end(JSON.stringify(out)); }

    const cus = await call('POST', '/customers', { name: 'TESTE DIAG', email: 'diag@endodirect.com.br', type: 'individual' }, true);
    out.customer = { status: cus.status, id: cus.data && cus.data.id, body: cus.data };
    if (!cus.data || !cus.data.id) { res.statusCode = 200; return res.end(JSON.stringify(out)); }

    const card = await call('POST', '/customers/' + cus.data.id + '/cards', { token: tok.data.id }, true);
    out.card = { status: card.status, id: card.data && card.data.id, body: card.data };

    const body = { customer_id: cus.data.id, payment_method: 'credit_card', interval: 'month', interval_count: 1, billing_type: 'prepaid', installments: 1, items: [{ description: 'Endodirect — Gold', quantity: 1, pricing_scheme: { scheme_type: 'unit', price: 7000 } }] };
    if (card.data && card.data.id) body.card_id = card.data.id; else body.card_token = tok.data.id;
    out.subRequest = body;
    const sub = await call('POST', '/subscriptions', body, true);
    out.subscription = { status: sub.status, subStatus: sub.data && sub.data.status, id: sub.data && sub.data.id, body: sub.data };

    if (sub.data && sub.data.id) {
      const ch = await call('GET', '/subscriptions/' + sub.data.id + '/charges', null, true);
      out.charges = { status: ch.status, body: ch.data };
    }
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  } catch (e) {
    out.error = (e && e.message) || String(e);
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  }
};
module.exports.config = { maxDuration: 30 };
