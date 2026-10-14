// ESTORNO, CONTESTAÇÃO, CANCELAMENTO E FALHA DE PAGAMENTO VALEM SÓ PARA O
// ACESSO QUE VEIO DAQUELE PEDIDO OU DAQUELA ASSINATURA.
//
// ⚠️ 14/10/2026. Um assinante Gold pagou o Gold anual duas vezes no mesmo dia
// (dois pedidos pagos, 15 s um do outro). No banco há uma linha de acesso só,
// apontando para um dos pedidos. O webhook revogava por e-mail + escopo (ou
// TODOS os acessos do e-mail, sem escopo no evento): estornar o pedido
// duplicado cancelava o Gold pago pelo outro. A mesma regra deixava em atraso
// um plano já pago quando uma nova tentativa de compra era recusada, e
// derrubava junto a cortesia manual.
//
// 🧨 O QUE ESTE TESTE PRENDE, chamando o handler DE VERDADE com fetch falso
// (uma tabela endodirect_acessos em memória):
// (1) estorno do pedido duplicado não toca no acesso pago pelo outro;
// (2) estorno do pedido que liberou o acesso cancela esse acesso;
// (3) evento sem pedido nem assinatura não muda nada;
// (4) cortesia manual nunca é tocada; (5) cancelamento de assinatura derruba
// só a assinatura; (6) tentativa recusada não deixa em atraso o plano pago;
// (7) falha da mensalidade deixa a assinatura em atraso; (8) pedido com dois
// escopos cancela os dois; (9) pagamento continua liberando; (10) banco fora
// do ar devolve 500 (o pagar.me reenvia) sem mudar nada; e nenhuma mudança de
// status sai por e-mail.
'use strict';
const path = require('path');
const { EventEmitter } = require('events');

const RAIZ = path.join(__dirname, '..');
// O handler registra no console os eventos sem acesso ligado; aqui é ruído.
const consoleOriginal = { log: console.log, error: console.error, warn: console.warn };
console.log = function () {}; console.error = function () {}; console.warn = function () {};
process.env.SUPABASE_URL = 'https://sb.teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv_teste';
process.env.PAGARME_WEBHOOK_BASIC_USER = 'hook';
process.env.PAGARME_WEBHOOK_BASIC_PASS = 'segredo';
// WEBHOOK_ARQ permite rodar os mesmos cenários contra outra versão do arquivo.
const HANDLER = require(process.env.WEBHOOK_ARQ || path.join(RAIZ, 'api', 'webhooks', 'pagarme.js'));

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { consoleOriginal.error('test-estorno-so-do-pedido: o teste parou no meio'); process.exitCode = 1; }
});

// ---- Banco falso: endodirect_acessos + usuários do Auth ----
let tabela = [];
let usuarios = [];
let patches = [];
let bancoFora = false;
let patchFalha = false;
let seq = 0;

function filtrosDe(url) {
  const q = url.split('?')[1] || '';
  const f = {};
  q.split('&').forEach((par) => {
    const i = par.indexOf('=');
    if (i < 0) return;
    const k = par.slice(0, i), v = par.slice(i + 1);
    if (v.indexOf('eq.') === 0) f[k] = decodeURIComponent(v.slice(3));
  });
  return f;
}
function casa(row, f) {
  return Object.keys(f).every((k) => String(row[k] == null ? '' : row[k]) === f[k]);
}
function resposta(status, corpo) {
  return {
    ok: status >= 200 && status < 300, status: status,
    json: async () => corpo, text: async () => JSON.stringify(corpo == null ? '' : corpo)
  };
}
global.fetch = async function (url, opts) {
  url = String(url); opts = opts || {};
  const metodo = (opts.method || 'GET').toUpperCase();
  if (url.indexOf('https://sb.teste/rest/v1/endodirect_acessos') === 0) {
    if (bancoFora) return resposta(503, { message: 'fora do ar' });
    const f = filtrosDe(url);
    if (metodo === 'GET') return resposta(200, tabela.filter((r) => casa(r, f)).map((r) => Object.assign({}, r)));
    if (metodo === 'PATCH') {
      if (patchFalha) return resposta(500, { message: 'falha ao gravar' });
      patches.push(url);
      const corpo = JSON.parse(opts.body || '{}');
      tabela.filter((r) => casa(r, f)).forEach((r) => Object.assign(r, corpo));
      return resposta(204, null);
    }
    if (metodo === 'POST') {
      const corpo = JSON.parse(opts.body || '{}');
      tabela.push(Object.assign({ id: 'novo' + (++seq) }, corpo));
      return resposta(201, null);
    }
  }
  if (url.indexOf('https://sb.teste/auth/v1/admin/users') === 0) {
    if (metodo === 'GET') return resposta(200, { users: usuarios });
    const corpo = JSON.parse(opts.body || '{}');
    if (usuarios.some((u) => u.email === corpo.email)) return resposta(422, { msg: 'já existe' });
    const u = { id: 'u' + (++seq), email: corpo.email };
    usuarios.push(u);
    return resposta(200, u);
  }
  if (url.indexOf('https://sb.teste/auth/v1/admin/generate_link') === 0) return resposta(200, {});
  throw new Error('fetch inesperado: ' + metodo + ' ' + url);
};

function preparar(linhas) {
  tabela = linhas.map((l) => Object.assign({}, l));
  usuarios = [{ id: 'u-aluno', email: 'aluno@exemplo.com' }];
  patches = [];
  bancoFora = false;
  patchFalha = false;
}
const linha = (id) => tabela.find((r) => r.id === id) || {};

function evento(corpo) {
  const req = new EventEmitter();
  req.method = 'POST';
  req.headers = { authorization: 'Basic ' + Buffer.from('hook:segredo').toString('base64') };
  setImmediate(() => { req.emit('data', Buffer.from(JSON.stringify(corpo))); req.emit('end'); });
  return req;
}
async function chama(corpo) {
  let fim; const pronto = new Promise((r) => { fim = r; });
  const res = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; fim(); } };
  await HANDLER(evento(corpo), res);
  await pronto;
  let dados = {}; try { dados = JSON.parse(res.body || '{}'); } catch (e) {}
  return { status: res.statusCode, dados: dados };
}

const CLIENTE = { id: 'cus_1', email: 'aluno@exemplo.com', name: 'Aluno' };
const GOLD_PEDIDO_A = { id: 'a1', email: 'aluno@exemplo.com', scope: 'plano:gold', status: 'active', tipo: 'avulso', provider: 'pagarme', provider_order_id: 'or_PAGO_A', provider_subscription_id: null };
const CORTESIA = { id: 'm1', email: 'aluno@exemplo.com', scope: 'curso:endoteem', status: 'active', tipo: 'avulso', provider: 'manual', provider_order_id: null, provider_subscription_id: null };
const MENSAL = { id: 's1', email: 'aluno@exemplo.com', scope: 'plano:standard', status: 'active', tipo: 'recorrente', provider: 'pagarme', provider_order_id: null, provider_subscription_id: 'sub_1' };

function estornoDoPedido(orderId, extra) {
  return Object.assign({
    type: 'charge.refunded',
    data: Object.assign({ id: 'ch_x', status: 'refunded', amount: 54000, customer: CLIENTE, metadata: { scope: 'plano:gold' } },
      orderId ? { order: { id: orderId, status: 'canceled' } } : {})
  }, extra || {});
}

(async () => {
  // (1) O caso real: dois pedidos pagos do mesmo plano, linha apontando para o A.
  preparar([GOLD_PEDIDO_A]);
  let r = await chama(estornoDoPedido('or_DUPLICADO_B'));
  ok(r.status === 200, '(1) estorno do duplicado responde 200 (status ' + r.status + ')');
  ok(linha('a1').status === 'active', '(1) estorno do pedido DUPLICADO não cancela o Gold pago pelo outro (ficou ' + linha('a1').status + ')');
  ok(r.dados.action === 'nenhum_acesso_do_pedido', '(1) a resposta diz que nenhum acesso era daquele pedido (action ' + r.dados.action + ')');

  // (2) Estorno do pedido que liberou o acesso.
  preparar([GOLD_PEDIDO_A]);
  r = await chama(estornoDoPedido('or_PAGO_A'));
  ok(linha('a1').status === 'canceled', '(2) estorno do pedido que liberou cancela o acesso (ficou ' + linha('a1').status + ')');
  ok(r.dados.action === 'revoked' && String(r.dados.scopes) === 'plano:gold', '(2) a resposta diz o que foi revogado');

  // (3) Evento sem pedido nem assinatura, sem escopo: antes, cancelava TUDO do e-mail.
  preparar([GOLD_PEDIDO_A, CORTESIA]);
  r = await chama({ type: 'charge.refunded', data: { id: 'ch_y', status: 'refunded', customer: CLIENTE } });
  ok(r.status === 200 && linha('a1').status === 'active' && linha('m1').status === 'active', '(3) evento sem pedido identificável não muda nada (a1 ' + linha('a1').status + ', m1 ' + linha('m1').status + ')');

  // (4) Cortesia manual nunca cai junto, mesmo com o evento sem escopo.
  preparar([GOLD_PEDIDO_A, CORTESIA]);
  r = await chama({ type: 'charge.chargedback', data: { id: 'ch_z', customer: CLIENTE, order_id: 'or_PAGO_A' } });
  ok(linha('a1').status === 'canceled', '(4) contestação do pedido cancela o acesso dele (pedido em order_id)');
  ok(linha('m1').status === 'active', '(4) a cortesia manual do mesmo e-mail não é tocada (ficou ' + linha('m1').status + ')');

  // (5) Cancelamento de assinatura derruba só a assinatura.
  preparar([GOLD_PEDIDO_A, MENSAL]);
  r = await chama({ type: 'subscription.canceled', data: { id: 'sub_1', status: 'canceled', customer: CLIENTE } });
  ok(linha('s1').status === 'canceled', '(5) cancelamento da assinatura cancela o acesso dela (ficou ' + linha('s1').status + ')');
  ok(linha('a1').status === 'active', '(5) o anual pago à parte não cai junto');

  // (6) Tentativa de compra recusada não deixa em atraso o plano já pago.
  preparar([GOLD_PEDIDO_A]);
  r = await chama({ type: 'charge.payment_failed', data: { id: 'ch_f', status: 'failed', customer: CLIENTE, order: { id: 'or_RECUSADO' }, metadata: { scope: 'plano:gold' } } });
  ok(linha('a1').status === 'active', '(6) tentativa recusada não deixa em atraso o plano pago por outro pedido (ficou ' + linha('a1').status + ')');

  // (7) Falha da mensalidade deixa a assinatura em atraso.
  preparar([MENSAL]);
  r = await chama({ type: 'invoice.payment_failed', data: { id: 'in_1', status: 'failed', subscription_id: 'sub_1', customer: CLIENTE } });
  ok(linha('s1').status === 'past_due', '(7) falha da mensalidade deixa a assinatura em atraso (ficou ' + linha('s1').status + ')');
  ok(r.dados.action === 'past_due', '(7) a resposta diz past_due (action ' + r.dados.action + ')');

  // (8) Pedido com dois escopos (combo): o estorno cancela os dois e só eles.
  preparar([
    { id: 'c1', email: 'aluno@exemplo.com', scope: 'plano:gold', status: 'active', provider: 'pagarme', provider_order_id: 'or_COMBO' },
    { id: 'c2', email: 'aluno@exemplo.com', scope: 'curso:endoteem', status: 'active', provider: 'pagarme', provider_order_id: 'or_COMBO' },
    { id: 'c3', email: 'aluno@exemplo.com', scope: 'curso:lipides', status: 'active', provider: 'pagarme', provider_order_id: 'or_OUTRO' }
  ]);
  r = await chama(estornoDoPedido('or_COMBO'));
  ok(linha('c1').status === 'canceled' && linha('c2').status === 'canceled', '(8) estorno do combo cancela os dois escopos do pedido');
  ok(linha('c3').status === 'active', '(8) o curso comprado em outro pedido continua');

  // (9) Pagamento continua liberando (o caminho de pago não mudou).
  preparar([]);
  r = await chama({ type: 'order.paid', data: { id: 'or_NOVO', status: 'paid', customer: { id: 'cus_2', email: 'novo@exemplo.com', name: 'Novo' }, metadata: { scope: 'plano:gold' }, items: [{ description: 'Endodirect — Gold' }] } });
  const nova = tabela.find((x) => x.email === 'novo@exemplo.com') || {};
  ok(r.status === 200 && nova.status === 'active' && nova.provider_order_id === 'or_NOVO' && nova.scope === 'plano:gold', '(9) order.paid libera o Gold com o pedido gravado');

  // (10) Banco fora do ar: 500, para o pagar.me reenviar; nada muda.
  preparar([GOLD_PEDIDO_A]);
  bancoFora = true;
  r = await chama(estornoDoPedido('or_PAGO_A'));
  bancoFora = false;
  ok(r.status === 500, '(10) banco fora do ar devolve 500 para o pagar.me reenviar (status ' + r.status + ')');
  ok(linha('a1').status === 'active', '(10) nada muda com o banco fora');
  preparar([GOLD_PEDIDO_A]);
  patchFalha = true;
  r = await chama(estornoDoPedido('or_PAGO_A'));
  patchFalha = false;
  ok(r.status === 500, '(10) falha ao gravar o estorno também devolve 500 (status ' + r.status + ')');

  // Linha achada pelo pedido E pela assinatura no mesmo evento muda uma vez só.
  preparar([{ id: 'd1', email: 'aluno@exemplo.com', scope: 'plano:gold', status: 'active', provider: 'pagarme', provider_order_id: 'or_D', provider_subscription_id: 'sub_D' }]);
  r = await chama({ type: 'charge.refunded', data: { id: 'ch_d', customer: CLIENTE, order: { id: 'or_D' }, invoice: { id: 'in_d', subscription_id: 'sub_D' } } });
  ok(linha('d1').status === 'canceled' && patches.length === 1 && String(r.dados.scopes) === 'plano:gold', 'linha achada pelo pedido e pela assinatura muda uma vez só (' + patches.length + ' PATCH)');

  // Nenhuma mudança de status sai por e-mail: sempre pela linha do pedido/assinatura.
  preparar([GOLD_PEDIDO_A, CORTESIA, MENSAL]);
  await chama(estornoDoPedido('or_PAGO_A'));
  await chama({ type: 'subscription.canceled', data: { id: 'sub_1', customer: CLIENTE } });
  await chama({ type: 'charge.payment_failed', data: { id: 'ch_q', customer: CLIENTE } });
  ok(patches.length === 2 && patches.every((u) => /[?&]id=eq\./.test(u) && !/email=/.test(u)), 'nenhum PATCH por e-mail: só pelo id da linha do pedido/assinatura (' + patches.join(' | ') + ')');

  terminou = true;
  console.log = consoleOriginal.log; console.error = consoleOriginal.error; console.warn = consoleOriginal.warn;
  if (falhas.length) {
    console.error('test-estorno-so-do-pedido: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-estorno-so-do-pedido: ok (estorno do duplicado não derruba o acesso pago; só a linha do pedido/assinatura muda; cortesia intocada; banco fora devolve 500)');
})().catch((e) => { consoleOriginal.error(e); process.exit(1); });
