// O CHECKOUT NÃO COBRA DUAS VEZES A MESMA COMPRA.
//
// ⚠️ 14/10/2026. Um assinante Gold (Sócio-fundador) viu na fatura duas compras
// do Gold anual no mesmo dia (29/06, 12× R$45 cada). No banco havia uma linha de
// acesso só — o webhook grava por e-mail + escopo, e a segunda compra apenas
// regravou a mesma linha. O caminho: a cobrança passava, algo falhava depois (ou
// a função passava dos 30 s), a tela dizia "Pagamento não aprovado" / "tente
// novamente", e a nova tentativa cobrava de novo — order.js e subscribe.js não
// conferiam se o e-mail já tinha o plano.
//
// 🧨 O QUE ESTE TESTE PRENDE, chamando os handlers DE VERDADE com fetch falso:
// (1) quem já tem o plano ativo recebe 409 `ja_ativo` e o pagar.me NEM é chamado
// (anual com mais de 30 dias, mensal no período; e-mail sem distinção de caixa);
// (2) anual nos últimos 30 dias é renovação e passa; (3) consulta ao banco que
// falha não trava a venda; (4) cobrado e acesso não gravado = ok com acesso
// "pendente", nunca 502; (5) 5xx do pagar.me = `nao_confirmado`, sem convite a
// pagar de novo; (6) o navegador trata "sem resposta" como não confirmado.
'use strict';
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const RAIZ = path.join(__dirname, '..');
// Os handlers registram cada pedido no console; aqui isso é ruído.
const consoleOriginal = { log: console.log, error: console.error };
console.log = function () {}; console.error = function () {};
process.env.PAGARME_SECRET_KEY = 'sk_test_teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv_teste';
process.env.SUPABASE_URL = 'https://sb.teste';
const LIB = require(path.join(RAIZ, 'lib', 'acesso-vigente.js'));
const ORDER = require(path.join(RAIZ, 'api', 'checkout', 'order.js'));
const SUB = require(path.join(RAIZ, 'api', 'checkout', 'subscribe.js'));
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
let terminou = false;
process.on('exit', (code) => {
  if (!terminou && code === 0) { consoleOriginal.error('test-cobranca-unica: o teste parou no meio'); process.exitCode = 1; }
});

const DIA = 86400000;
const iso = (ms) => new Date(ms).toISOString();

// ── Servidor falso: pagar.me + Supabase ─────────────────────────────────────
function cenario(op) {
  op = op || {};
  const st = { pagarme: [], supabase: [] };
  const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
  global.fetch = async function (url, init) {
    url = String(url); const metodo = (init && init.method) || 'GET';
    if (url.startsWith('https://api.pagar.me/')) {
      const rota = url.replace('https://api.pagar.me/core/v5', '');
      st.pagarme.push(metodo + ' ' + rota.split('?')[0]);
      if (rota === '/customers' && metodo === 'POST') return resp(200, { id: 'cus_1', name: 'Aluno' });
      if (/^\/customers\/cus_1$/.test(rota)) return resp(200, { id: 'cus_1' });
      if (/^\/customers\/cus_1\/cards$/.test(rota)) return resp(200, { id: 'card_1' });
      if (rota === '/orders') {
        if (op.pedidoCai) return resp(500, { message: 'Internal error' });
        return resp(200, { id: 'or_1', status: 'paid', charges: [{ id: 'ch_1', status: 'paid', last_transaction: {} }] });
      }
      if (rota === '/subscriptions') {
        if (op.pedidoCai) return resp(500, { message: 'Internal error' });
        return resp(200, { id: 'sub_1', status: 'active', next_billing_at: iso(Date.now() + 30 * DIA) });
      }
      return resp(404, {});
    }
    if (url.startsWith('https://sb.teste/')) {
      st.supabase.push(metodo + ' ' + url.replace('https://sb.teste', '').split('?')[0]);
      // a checagem de "já tem o plano"
      if (url.indexOf('/rest/v1/endodirect_acessos?email=ilike.') >= 0) {
        if (op.consultaCai) return resp(500, { message: 'down' });
        return resp(200, op.acessos || []);
      }
      // contagem de vagas do fundador (lib/founder)
      if (url.indexOf('/rest/v1/endodirect_acessos') >= 0 && url.indexOf('notes=') >= 0) return resp(200, []);
      if (url.indexOf('/rest/v1/rpc/') >= 0) return resp(200, 0);
      // criar/achar usuário
      if (url.indexOf('/auth/v1/admin/users') >= 0) {
        if (op.usuarioCai) return resp(500, { message: 'auth down' });
        if (metodo === 'POST') return resp(200, { id: 'U1', email: 'x' });
        return resp(200, { users: [] });
      }
      if (url.indexOf('/auth/v1/admin/generate_link') >= 0) return resp(200, {});
      // gravar acesso
      if (url.indexOf('/rest/v1/endodirect_acessos') >= 0) return resp(op.gravarCai ? 500 : 201, []);
      return resp(200, {});
    }
    throw new Error('fetch inesperado: ' + url);
  };
  return st;
}
function pedido(corpo) {
  const req = new EventEmitter();
  req.method = 'POST';
  req.headers = { origin: 'https://www.endodirect.com.br' };
  setImmediate(() => { req.emit('data', Buffer.from(JSON.stringify(corpo))); req.emit('end'); });
  return req;
}
async function chama(handler, corpo) {
  let fim; const pronto = new Promise((r) => { fim = r; });
  const res = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; fim(); } };
  await handler(pedido(corpo), res);
  await pronto;
  let dados = {}; try { dados = JSON.parse(res.body || '{}'); } catch (e) {}
  return { status: res.statusCode, dados };
}
const compraAnual = (email) => ({ plan: 'gold', method: 'credit_card', installments: 12, card_token: 'tok_1', email: email || 'aluno@exemplo.com', name: 'Aluno', document: '12345678901', phone: '11999999999', address: { zip: '01001000', line1: 'Rua A, 1', city: 'São Paulo', state: 'SP' } });
const compraMensal = (email) => ({ plan: 'gold', card_token: 'tok_1', email: email || 'aluno@exemplo.com', name: 'Aluno', document: '12345678901', phone: '11999999999', address: { zip: '01001000', line1: 'Rua A, 1', city: 'São Paulo', state: 'SP' } });
const linha = (o) => Object.assign({ id: 'a1', email: 'aluno@exemplo.com', scope: 'plano:gold', status: 'active', tipo: 'avulso', expires_at: iso(Date.now() + 200 * DIA) }, o || {});

(async function () {
  // ── 1. A regra, sozinha ─────────────────────────────────────────────────
  {
    const agora = Date.parse('2026-10-14T12:00:00Z');
    const v = (o) => LIB.vigenteBloqueia(Object.assign({ status: 'active' }, o), agora);
    ok(v({ tipo: 'avulso', expires_at: '2027-06-29T09:43:24Z' }) === true, 'regra: anual ativo com 8 meses pela frente bloqueia');
    ok(v({ tipo: 'avulso', expires_at: '2026-11-03T12:00:00Z' }) === false, 'regra: anual nos últimos 30 dias NÃO bloqueia (é renovação)');
    ok(v({ tipo: 'avulso', expires_at: null }) === true, 'regra: ativo sem data de fim bloqueia');
    ok(v({ tipo: 'recorrente', expires_at: '2026-10-20T00:00:00Z' }) === true, 'regra: mensal no período bloqueia (mesmo com a próxima cobrança em 6 dias)');
    ok(v({ tipo: 'recorrente', expires_at: '2026-10-01T00:00:00Z' }) === false, 'regra: mensal vencido não bloqueia');
    ok(LIB.vigenteBloqueia({ status: 'canceled', tipo: 'avulso', expires_at: '2027-06-29T00:00:00Z' }, agora) === false, 'regra: cancelado não bloqueia');
    ok(LIB.vigenteBloqueia({ status: 'past_due', tipo: 'recorrente', expires_at: null }, agora) === false, 'regra: inadimplente pode assinar de novo (cartão novo)');
    ok(v({ tipo: 'avulso', expires_at: 'data-ruim' }) === false, 'regra: data ilegível não trava a venda');
    const m1 = LIB.mensagemJaAtivo({ tipo: 'avulso', expires_at: '2027-06-29T09:43:24Z' }, 'Plano Gold (anual)');
    ok(/Plano Gold \(anual\) ativo até 29\/06\/2027/.test(m1) && /Não é preciso pagar de novo/.test(m1) && /suporte/.test(m1), 'mensagem: diz o plano, até quando e que não é preciso pagar (veio: ' + m1 + ')');
    ok(/\(assinatura mensal\)/.test(LIB.mensagemJaAtivo({ tipo: 'recorrente' }, 'Pacote Gold')), 'mensagem: assinatura mensal identificada');
  }

  // ── 2. Anual (order.js) ──────────────────────────────────────────────────
  {
    const st = cenario({ acessos: [linha()] });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 409 && r.dados.code === 'ja_ativo', 'anual: quem já tem o Gold anual recebe 409 ja_ativo (veio ' + r.status + ' ' + JSON.stringify(r.dados).slice(0, 120) + ')');
    ok(st.pagarme.length === 0, 'anual: o pagar.me NEM é chamado para quem já tem o plano (chamou: ' + st.pagarme.join(', ') + ')');
  }
  {
    const st = cenario({ acessos: [linha({ tipo: 'recorrente', expires_at: iso(Date.now() + 10 * DIA) })] });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 409 && st.pagarme.length === 0, 'anual: quem tem o Gold MENSAL ativo também não é cobrado no anual (pagaria os dois)');
  }
  {
    const st = cenario({ acessos: [linha({ email: 'Aluno@Exemplo.COM' })] });
    const r = await chama(ORDER, compraAnual('aluno@exemplo.com'));
    ok(r.status === 409 && st.pagarme.length === 0, 'anual: e-mail gravado com maiúsculas também bloqueia');
  }
  {
    // ilike: "_" é curinga — a linha de OUTRO e-mail não pode bloquear.
    const st = cenario({ acessos: [linha({ email: 'aXb@exemplo.com' })] });
    const r = await chama(ORDER, compraAnual('a_b@exemplo.com'));
    ok(r.status === 200 && r.dados.ok === true && st.pagarme.indexOf('POST /orders') >= 0, 'anual: o curinga do ilike não bloqueia e-mail de outra pessoa');
  }
  {
    const st = cenario({ acessos: [linha({ expires_at: iso(Date.now() + 10 * DIA) })] });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 200 && r.dados.ok === true && r.dados.acesso === 'liberado' && st.pagarme.filter((x) => x === 'POST /orders').length === 1, 'anual: renovação nos últimos 30 dias passa e cobra uma vez');
  }
  {
    const st = cenario({ consultaCai: true });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 200 && r.dados.ok === true && st.pagarme.indexOf('POST /orders') >= 0, 'anual: consulta ao banco que falha NÃO trava a venda');
  }
  {
    const st = cenario({ usuarioCai: true });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 200 && r.dados.ok === true && r.dados.acesso === 'pendente', 'anual: cobrado e acesso não gravado = ok com acesso pendente, NUNCA 502 (veio ' + r.status + ' ' + JSON.stringify(r.dados).slice(0, 120) + ')');
    ok(st.pagarme.filter((x) => x === 'POST /orders').length === 1, 'anual: o pedido foi feito uma vez só');
  }
  {
    cenario({ gravarCai: true });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 200 && r.dados.acesso === 'pendente', 'anual: falha ao GRAVAR o acesso depois da cobrança também não vira erro');
  }
  {
    cenario({ pedidoCai: true });
    const r = await chama(ORDER, compraAnual());
    ok(r.status === 502 && r.dados.code === 'nao_confirmado' && /Não pague de novo/.test(r.dados.error || '') && !/Tente novamente em instantes/.test(r.dados.error || ''), 'anual: 5xx do pagar.me = nao_confirmado, sem "tente novamente em instantes" (veio ' + JSON.stringify(r.dados).slice(0, 160) + ')');
  }

  // ── 3. Mensal (subscribe.js) ─────────────────────────────────────────────
  {
    const st = cenario({ acessos: [linha({ tipo: 'recorrente', expires_at: iso(Date.now() + 12 * DIA) })] });
    const r = await chama(SUB, compraMensal());
    ok(r.status === 409 && r.dados.code === 'ja_ativo' && st.pagarme.length === 0, 'mensal: quem já assina não ganha uma SEGUNDA assinatura (pagar.me não chamado)');
  }
  {
    const st = cenario({ acessos: [] });
    const r = await chama(SUB, compraMensal());
    ok(r.status === 200 && r.dados.ok === true && r.dados.acesso === 'liberado' && st.pagarme.filter((x) => x === 'POST /subscriptions').length === 1, 'mensal: sem plano, assina normalmente');
  }
  {
    const st = cenario({ usuarioCai: true });
    const r = await chama(SUB, compraMensal());
    ok(r.status === 200 && r.dados.ok === true && r.dados.acesso === 'pendente' && st.pagarme.filter((x) => x === 'POST /subscriptions').length === 1, 'mensal: assinatura criada e acesso não gravado = ok pendente, nunca 502');
  }
  {
    cenario({ pedidoCai: true });
    const r = await chama(SUB, compraMensal());
    ok(r.status === 502 && r.dados.code === 'nao_confirmado' && /Não pague de novo/.test(r.dados.error || ''), 'mensal: 5xx = nao_confirmado');
  }

  // ── 4. O navegador (index.html) ──────────────────────────────────────────
  {
    ok((APP.match(/\.then\(lerResposta,semResposta\)/g) || []).length === 2, 'navegador: anual e mensal tratam resposta que não chega (ou não é JSON) como "sem resposta"');
    ok(/var semResposta=function\(\)\{return \{semResposta:true\};\};/.test(APP) && /var lerResposta=function\(r\)\{return r\.json\(\)\.catch\(semResposta\);\};/.test(APP), 'navegador: corpo que não é JSON (o 504 de tempo esgotado) vira "sem resposta", não {} — {} caía em "Pagamento não aprovado"');
    ok(/if\(d&&\(d\.semResposta\|\|d\.code==='nao_confirmado'\)\)\{ckNaoConfirmado\(/.test(APP), 'navegador: sem resposta / nao_confirmado vai para "não confirmado", não para "não aprovado"');
    const iNC = APP.indexOf("if(d&&(d.semResposta||d.code==='nao_confirmado'))");
    const iNA = APP.indexOf("if(!d||!d.ok)throw new Error(((d&&d.error)||'Pagamento não aprovado.')");
    ok(iNC > 0 && iNA > iNC, 'navegador: a checagem de "não confirmado" vem ANTES do "Pagamento não aprovado"');
    ok(/if\(d&&d\.code==='ja_ativo'\)\{ckErr\(d\.error\);done\(\);ckStartAutoVerify\(ckEscopoCompra\(\)\);return;\}/.test(APP), 'navegador: ja_ativo mostra o motivo e confere os acessos');
    ok(/if\(d\.acesso==='pendente'\)\{ckNaoConfirmado\(/.test(APP), 'navegador: cobrado com acesso pendente espera o acesso aparecer');
    const nc = APP.slice(APP.indexOf('function ckNaoConfirmado('), APP.indexOf('function ckRenderResult('));
    ok(/Não pague de novo/.test(nc) && /btn\.disabled=true/.test(nc) && /setTimeout\(done,60000\)/.test(nc) && /ckStartAutoVerify\(ckEscopoCompra\(\)\)/.test(nc), 'navegador: "não confirmado" pede para não pagar de novo, segura o botão por 1 min e confere o plano comprado');
    ok(/var liberado=escopo\?\(Array\.isArray\(userAcessos\)&&userAcessos\.indexOf\(escopo\)>=0\):/.test(APP), 'navegador: a conferência espera o PLANO COMPRADO (troca de plano não vira falso "confirmado")');
  }

  terminou = true;
  console.log = consoleOriginal.log; console.error = consoleOriginal.error;
  if (falhas.length) {
    console.error('test-cobranca-unica: ' + falhas.length + ' falha(s)');
    falhas.forEach((f) => console.error('  ✗ ' + f));
    process.exit(1);
  }
  console.log('test-cobranca-unica: ok (quem já tem o plano não é cobrado; renovação passa; banco fora não trava; cobrado nunca vira "tente novamente"; navegador trata sem resposta como não confirmado)');
})().catch((e) => { consoleOriginal.error(e); process.exit(1); });
