'use strict';
/* Regressão da CAIXA DE SUPORTE (lib/support.js + lib/admin-auth.js).
 * Mocka global.fetch (Supabase REST + Resend) e exercita: armazenamento do
 * ticket, listagem, GATE de admin e o envio da resposta ao aluno. Sem rede.
 * Roda em subprocesso pelo ci-validate.js. */

// Env ANTES de require (admin-auth/support leem SUPABASE_URL no load).
process.env.SUPABASE_URL = 'https://auth.endodirect.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key-test';
process.env.RESEND_API_KEY = 'resend-test';
process.env.SUPPORT_TO = 'contato@endodirect.com.br';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('  ✗ ' + m); } else console.log('  ✓ ' + m); };

// ---- Mock de fetch roteado por URL/método. Cenário configurável por teste. ----
let scenario = {};
const calls = [];
function res(okFlag, body, status) {
  return Promise.resolve({
    ok: okFlag, status: status || (okFlag ? 200 : 400),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body || ''))
  });
}
global.fetch = function (url, opts) {
  url = String(url); opts = opts || {};
  const method = (opts.method || 'GET').toUpperCase();
  calls.push({ url, method, body: opts.body });
  if (url.indexOf('api.resend.com') >= 0) return res(scenario.resendOk !== false, { id: 'email-1' }, scenario.resendOk === false ? 502 : 200);
  if (url.indexOf('/auth/v1/user') >= 0) return scenario.user ? res(true, scenario.user) : res(false, '', 401);
  if (url.indexOf('endodirect_admins') >= 0) return res(true, scenario.adminRows || []);
  if (url.indexOf('endodirect_support') >= 0) {
    if (method === 'POST') return res(scenario.insertOk !== false, [{ id: 'tkt-new' }], scenario.insertOk === false ? 500 : 201);
    if (method === 'PATCH') return res(true, [Object.assign({}, scenario.ticket, { status: 'answered', reply: 'r', answered_at: 'now', answered_by: 'a@b.com' })]);
    return res(true, scenario.ticket ? [scenario.ticket] : []); // GET select
  }
  return res(false, 'unrouted: ' + url, 404);
};

const support = require('../lib/support');
const { adminFromReq, userFromReq } = require('../lib/admin-auth');

(async () => {
  // 0) Exports presentes.
  ['sendSupportEmail', 'storeSupportTicket', 'listSupportTickets', 'listMyTickets', 'replySupportTicket'].forEach((fn) =>
    ok(typeof support[fn] === 'function', 'export support.' + fn));
  ok(typeof adminFromReq === 'function', 'export adminFromReq');
  ok(typeof userFromReq === 'function', 'export userFromReq');

  // 1) adminFromReq — gate de admin.
  scenario = {};
  ok((await adminFromReq({ headers: {} })) === null, 'adminFromReq: sem token → null');
  scenario = { user: { email: 'rodolphomend@gmail.com' }, adminRows: [] };
  ok((await adminFromReq({ headers: { authorization: 'Bearer x' } })) === null, 'adminFromReq: e-mail fora de endodirect_admins → null');
  scenario = { user: { email: 'rodolphomend@gmail.com' }, adminRows: [{ email: 'rodolphomend@gmail.com' }] };
  const adm = await adminFromReq({ headers: { authorization: 'Bearer x' } });
  ok(adm && adm.email === 'rodolphomend@gmail.com', 'adminFromReq: admin válido → { email }');

  // 1b) userFromReq — só identidade (NÃO exige admin); e-mail volta minúsculo.
  scenario = {};
  ok((await userFromReq({ headers: {} })) === null, 'userFromReq: sem token → null');
  scenario = { user: { email: 'Aluno@X.com', id: 'u-1' } };
  const usr = await userFromReq({ headers: { authorization: 'Bearer x' } });
  ok(usr && usr.email === 'aluno@x.com' && usr.id === 'u-1', 'userFromReq: token válido → { email minúsculo, id }');

  // 2) storeSupportTicket.
  scenario = {};
  ok((await support.storeSupportTicket({ email: 'invalido', message: 'oi tudo bem' })).stored === false, 'storeSupportTicket: e-mail inválido → não salva');
  ok((await support.storeSupportTicket({ email: 'a@b.com', message: 'x' })).stored === false, 'storeSupportTicket: mensagem curta → não salva');
  const stored = await support.storeSupportTicket({ name: 'Aluno', email: 'a@b.com', category: 'Dúvida', message: 'mensagem de teste' });
  ok(stored.stored === true && stored.id === 'tkt-new', 'storeSupportTicket: válido → { stored:true, id }');

  // 3) listSupportTickets.
  scenario = { ticket: { id: 't1', email: 'a@b.com', message: 'oi', status: 'new' } };
  const list = await support.listSupportTickets();
  ok(Array.isArray(list) && list.length === 1 && list[0].id === 't1', 'listSupportTickets: retorna o array de tickets');

  // 3b) listMyTickets — tickets do PRÓPRIO aluno; filtra por e-mail e NÃO expõe
  //     answered_by (e-mail interno do professor) no select enviado ao banco.
  scenario = {};
  const invalidMine = await support.listMyTickets('invalido');
  ok(Array.isArray(invalidMine) && invalidMine.length === 0, 'listMyTickets: e-mail inválido → []');
  scenario = { ticket: { id: 't9', email: 'aluno@x.com', message: 'oi', status: 'answered', reply: 'pronto', answered_at: 'now' } };
  calls.length = 0;
  const mine = await support.listMyTickets('aluno@x.com');
  ok(Array.isArray(mine) && mine.length === 1 && mine[0].id === 't9', 'listMyTickets: retorna os tickets do aluno');
  const myUrl = calls.find((c) => c.url.indexOf('endodirect_support') >= 0);
  ok(myUrl && /email=eq\./.test(myUrl.url), 'listMyTickets: filtra pelo e-mail do aluno (email=eq.)');
  ok(myUrl && myUrl.url.indexOf('answered_by') === -1, 'listMyTickets: select NÃO inclui answered_by (não vaza e-mail do professor)');

  // 4) replySupportTicket — validações.
  scenario = {};
  ok((await support.replySupportTicket({ id: '', reply: 'oi' })).ok === false, 'replySupportTicket: sem id → erro');
  ok((await support.replySupportTicket({ id: 't1', reply: '' })).ok === false, 'replySupportTicket: resposta vazia → erro');

  // 5) replySupportTicket — caminho feliz: e-mail ao aluno + marca respondido.
  scenario = { ticket: { id: 't1', email: 'aluno@x.com', name: 'Aluno Teste', category: 'Dúvida', message: 'minha dúvida', status: 'new' }, resendOk: true };
  calls.length = 0;
  const rr = await support.replySupportTicket({ id: 't1', reply: 'Aqui está a resposta.', adminEmail: 'prof@endodirect.com.br' });
  ok(rr.ok === true, 'replySupportTicket: sucesso → ok:true');
  ok(rr.ticket && rr.ticket.status === 'answered', 'replySupportTicket: ticket marcado como answered');
  const mail = calls.find((c) => c.url.indexOf('api.resend.com') >= 0);
  ok(!!mail, 'replySupportTicket: chamou o Resend');
  ok(mail && /aluno@x\.com/.test(String(mail.body)), 'replySupportTicket: e-mail endereçado ao aluno');
  ok(mail && /Aqui está a resposta/.test(String(mail.body)), 'replySupportTicket: corpo contém a resposta do professor');
  const patched = calls.find((c) => c.method === 'PATCH');
  ok(!!patched, 'replySupportTicket: gravou o PATCH (status/reply) no ticket');

  // 6) replySupportTicket — ticket inexistente.
  scenario = { ticket: null };
  ok((await support.replySupportTicket({ id: 'nao-existe', reply: 'oi' })).ok === false, 'replySupportTicket: ticket inexistente → erro');

  console.log('\n' + (fails === 0 ? '✅ CAIXA DE SUPORTE OK (store + list + gate de admin + responder)' : '❌ ' + fails + ' falha(s)'));
  process.exit(fails === 0 ? 0 : 1);
})();
