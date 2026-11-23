// CUPOM DE PARCEIRO (23/11/2026).
//
// Professor: "Vamos desenvolver isso" — cupom de parceiro com desconto, registro de quem trouxe
// cada venda e um quadro no painel. Primeiro caso: parceria com um endocrinologista que divulga em
// grupos de WhatsApp (desconto para os membros, comissão sobre o valor pago no 1º ano).
//
// 🧨 O QUE ESTE TESTE PRENDE (handlers DE VERDADE, fetch falso):
// (1) o preço com desconto é o mesmo no servidor e na tela (centavo arredondado);
// (2) cupom válido: o pagar.me cobra o preço com desconto, o pedido leva o cupom e o preço cheio,
//     a venda entra em endodirect_cupom_vendas (sem nome nem e-mail de aluno) e o acesso marca o cupom;
// (3) cupom inativo, vencido ou de outro plano: 400 e o pagar.me NEM é chamado; banco fora: 503,
//     nunca cobra sem o desconto prometido;
// (4) o FUNDADOR continua funcionando como antes;
// (5) webhook: pedido pago com cupom grava a venda (idempotente pelo pedido) e o estorno a tira;
// (6) a conta da comissão do painel: % base, % maior depois da meta do semestre, estorno fora e o
//     prazo de 7 dias.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { EventEmitter } = require('events');
const RAIZ = path.join(__dirname, '..');

const consoleOriginal = { log: console.log, error: console.error };
console.log = function () {}; console.error = function () {}; console.warn = function () {};
process.env.PAGARME_SECRET_KEY = 'sk_test_teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv_teste';
process.env.SUPABASE_URL = 'https://sb.teste';
process.env.FOUNDER_ATE = new Date(Date.now() + 86400000).toISOString();
process.env.PAGARME_WEBHOOK_BASIC_USER = 'u';
process.env.PAGARME_WEBHOOK_BASIC_PASS = 'p';

const CUPOM = require(path.join(RAIZ, 'lib', 'cupom-parceiro.js'));
const ORDER = require(path.join(RAIZ, 'api', 'checkout', 'order.js'));
const HOOK = require(path.join(RAIZ, 'api', 'webhooks', 'pagarme.js'));
const HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const CUPONS = {
  PARC15: { codigo: 'PARC15', parceiro: 'Parceiro', desconto_pct: 15, planos: ['gold'], ativo: true, valido_ate: null },
  PARADO: { codigo: 'PARADO', parceiro: 'P', desconto_pct: 10, planos: ['gold', 'standard'], ativo: false, valido_ate: null },
  VELHO: { codigo: 'VELHO', parceiro: 'P', desconto_pct: 10, planos: ['gold', 'standard'], ativo: true, valido_ate: '2020-01-01T00:00:00Z' }
};
let st;
function cenario(op) {
  op = op || {};
  st = { pagarme: [], pedidos: [], vendas: [], patches: [], acessos: [] };
  const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => '' }, json: async () => body, text: async () => JSON.stringify(body) });
  global.fetch = async function (url, init) {
    url = String(url); const metodo = (init && init.method) || 'GET';
    if (url.startsWith('https://api.pagar.me/')) {
      const rota = url.replace('https://api.pagar.me/core/v5', '').split('?')[0];
      st.pagarme.push(metodo + ' ' + rota);
      if (rota === '/customers' && metodo === 'POST') return resp(200, { id: 'cus_1' });
      if (rota === '/customers/cus_1') return resp(200, { id: 'cus_1' });
      if (rota === '/customers/cus_1/cards') return resp(200, { id: 'card_1' });
      if (rota === '/orders') { const b = JSON.parse(init.body); st.pedidos.push(b); return resp(200, { id: 'or_9', status: 'paid', amount: b.items[0].amount, charges: [{ status: 'paid', last_transaction: {} }] }); }
      return resp(404, {});
    }
    if (url.indexOf('/rest/v1/endodirect_cupons?codigo=eq.') >= 0) {
      if (op.bancoCai) return resp(500, { message: 'down' });
      const cod = decodeURIComponent(url.split('codigo=eq.')[1].split('&')[0]);
      return resp(200, CUPONS[cod] ? [CUPONS[cod]] : []);
    }
    if (url.indexOf('/rest/v1/rpc/endodirect_ja_pagou') >= 0) {
      st.jaPagou = (st.jaPagou || 0) + 1;
      if (op.jaPagouCai) return resp(500, { message: 'down' });
      return resp(200, !!op.jaPagou);
    }
    if (url.indexOf('/rest/v1/endodirect_cupom_vendas') >= 0) {
      if (metodo === 'POST') { st.vendas.push({ url, prefer: (init.headers || {}).Prefer, linha: JSON.parse(init.body) }); return resp(201, {}); }
      if (metodo === 'PATCH') { st.patches.push({ url, corpo: JSON.parse(init.body) }); return resp(204, {}); }
    }
    if (url.indexOf('/rest/v1/endodirect_acessos') >= 0) {
      if (metodo === 'POST' || metodo === 'PATCH') { st.acessos.push(JSON.parse(init.body)); return resp(201, {}); }
      return resp(200, []); // sem plano vigente, não é fundador, vagas livres
    }
    if (url.indexOf('/auth/v1/admin/users') >= 0) return metodo === 'POST' ? resp(200, { id: 'U1', email: 'x' }) : resp(200, { users: [] });
    return resp(200, {});
  };
}
function pedido(corpo, headers) {
  const req = new EventEmitter(); req.method = 'POST'; req.headers = headers || { origin: 'https://www.endodirect.com.br' };
  setImmediate(() => { req.emit('data', Buffer.from(JSON.stringify(corpo))); req.emit('end'); });
  return req;
}
async function chama(handler, corpo, headers) {
  let fim; const pronto = new Promise((r) => { fim = r; });
  const res = { statusCode: 0, setHeader() {}, end(b) { this.body = b; fim(); } };
  await handler(pedido(corpo, headers), res); await pronto;
  let dados = {}; try { dados = JSON.parse(res.body || '{}'); } catch (e) {}
  return { status: res.statusCode, dados };
}
const compra = (cupom, plano) => ({ plan: plano || 'gold', method: 'credit_card', installments: 12, card_token: 'tok_1', coupon: cupom, email: 'aluno@exemplo.com', name: 'Aluno', document: '12345678901', phone: '11999999999', address: { zip: '01001000', line1: 'Rua A, 1', city: 'São Paulo', state: 'SP' } });

(async function () {
  // (1) preço com desconto: servidor = tela
  ok(CUPOM.precoComCupom(82800, 15) === 70380 && CUPOM.precoComCupom(95880, 15) === 81498 && CUPOM.precoComCupom(54000, 12.5) === 47250 && CUPOM.precoComCupom(82800, 80) === 41400, 'servidor: preço com desconto (e no máximo 50%)');
  const m = /function ckPrecoCupom\(c,pct\)\{[^\n]*\}/.exec(HTML);
  ok(!!m, 'tela: ckPrecoCupom existe');
  if (m) {
    const ctx = {}; vm.createContext(ctx); vm.runInContext(m[0], ctx);
    [[82800, 15], [95880, 15], [54000, 12.5], [59880, 7], [82800, 33.33]].forEach((x) => ok(ctx.ckPrecoCupom(x[0], x[1]) === CUPOM.precoComCupom(x[0], x[1]), 'tela e servidor iguais em ' + x.join(' / ')));
  }
  ok(CUPOM.codigoValido('PARC15') && !CUPOM.codigoValido('FUNDADOR') && !CUPOM.codigoValido('ab') && !CUPOM.codigoValido('A B C'), 'códigos: FUNDADOR reservado, formato conferido');
  ok(CUPOM.cupomVale(CUPONS.PARC15, 'gold') && !CUPOM.cupomVale(CUPONS.PARC15, 'standard') && !CUPOM.cupomVale(CUPONS.PARADO, 'gold') && !CUPOM.cupomVale(CUPONS.VELHO, 'gold'), 'vigência: ativo, no prazo e do plano');

  // (2) cupom válido no Gold anual
  cenario();
  let r = await chama(ORDER, compra('parc15'));
  ok(r.status === 200 && r.dados.ok === true, 'cupom válido: pago (veio ' + r.status + ' ' + JSON.stringify(r.dados) + ')');
  const p = st.pedidos[0] || { items: [{}], metadata: {} };
  ok(p.items[0].amount === 70380 && /cupom PARC15/.test(p.items[0].description), 'pagar.me cobra R$ 703,80 (15% de R$ 828) com o cupom na descrição');
  ok(p.metadata.coupon === 'PARC15' && p.metadata.valor_cheio === '82800', 'o pedido leva o cupom e o preço cheio (para o webhook)');
  const v = st.vendas[0];
  ok(!!v && v.linha.codigo === 'PARC15' && v.linha.valor_pago === 70380 && v.linha.valor_cheio === 82800 && v.linha.order_id === 'or_9' && v.linha.plano === 'gold' && v.linha.metodo === 'credit_card', 'venda registrada com valores e pedido');
  ok(!!v && /on_conflict=order_id/.test(v.url) && /ignore-duplicates/.test(v.prefer || ''), 'venda idempotente pelo pedido');
  ok(!!v && !JSON.stringify(v.linha).match(/aluno@|Aluno|12345678901/), 'a venda não leva e-mail, nome nem CPF do aluno');
  ok(st.acessos.some((a) => /gold:anual:cupom:PARC15/.test(a.notes || '')), 'o acesso marca o cupom');

  // (3) recusas sem cobrar
  for (const [cod, plano, nome] of [['PARADO', 'gold', 'inativo'], ['VELHO', 'gold', 'vencido'], ['PARC15', 'standard', 'de outro plano'], ['NAOEXISTE', 'gold', 'inexistente']]) {
    cenario(); r = await chama(ORDER, compra(cod, plano));
    ok(r.status === 400 && st.pagarme.length === 0 && st.vendas.length === 0, 'cupom ' + nome + ': 400 e o pagar.me não é chamado (veio ' + r.status + ', ' + st.pagarme.length + ' chamadas)');
  }
  cenario({ bancoCai: true }); r = await chama(ORDER, compra('PARC15'));
  ok(r.status === 503 && st.pagarme.length === 0, 'banco fora na conferência do cupom: 503, sem cobrar');

  // (3b) SÓ NA PRIMEIRA COMPRA (professor, 23/11/2026): quem já pagou não usa cupom de parceiro
  cenario({ jaPagou: true }); r = await chama(ORDER, compra('PARC15'));
  ok(r.status === 400 && r.dados.code === 'cupom_primeira_compra' && st.pagarme.length === 0 && st.vendas.length === 0, 'quem já pagou: 400 "primeira assinatura", sem cobrar e sem venda (veio ' + r.status + ' ' + JSON.stringify(r.dados) + ')');
  cenario({ jaPagouCai: true }); r = await chama(ORDER, compra('PARC15'));
  ok(r.status === 503 && st.pagarme.length === 0, 'sem conseguir conferir se já pagou: 503, sem cobrar');
  cenario(); r = await chama(ORDER, compra('PARC15'));
  ok(r.status === 200 && st.jaPagou === 1, 'primeira compra: confere uma vez e cobra com desconto');
  cenario({ jaPagou: true }); r = await chama(ORDER, compra('FUNDADOR'));
  ok(r.status === 200 && !st.jaPagou, 'FUNDADOR não passa pela regra da primeira compra (renovação do fundador continua)');
  ok(/client\.rpc\('endodirect_ja_assinei'\)/.test(HTML) && /Este cupom vale só para a primeira assinatura da plataforma\./.test(HTML), 'tela do pagamento avisa quem já assinou');

  // (4) FUNDADOR intacto
  cenario(); r = await chama(ORDER, compra('FUNDADOR'));
  ok(r.status === 200 && st.pedidos[0] && st.pedidos[0].items[0].amount === 54000 && st.vendas.length === 0, 'FUNDADOR continua a R$ 540 e não vira venda de parceiro');

  // (5) webhook: PIX pago com cupom grava; estorno tira
  const auth = { authorization: 'Basic ' + Buffer.from('u:p').toString('base64') };
  cenario();
  const evPago = { type: 'order.paid', data: { id: 'or_pix', amount: 70380, status: 'paid', metadata: { scope: 'plano:gold', plan: 'gold', cycle: 'anual', coupon: 'PARC15', valor_cheio: '82800' }, customer: { email: 'aluno@exemplo.com', name: 'Aluno', id: 'cus_1' }, charges: [{ payment_method: 'pix', status: 'paid', amount: 70380 }], items: [{ description: 'Endodirect — Plano Gold (anual) (cupom PARC15)' }] } };
  r = await chama(HOOK, evPago, auth);
  const vw = st.vendas[0];
  ok(r.status === 200 && !!vw && vw.linha.order_id === 'or_pix' && vw.linha.valor_pago === 70380 && vw.linha.valor_cheio === 82800 && vw.linha.metodo === 'pix' && vw.linha.codigo === 'PARC15', 'webhook: PIX pago com cupom vira venda (veio ' + r.status + ' ' + JSON.stringify(vw && vw.linha) + ')');
  cenario();
  r = await chama(HOOK, { type: 'order.paid', data: Object.assign({}, evPago.data, { metadata: Object.assign({}, evPago.data.metadata, { coupon: 'FUNDADOR' }) }) }, auth);
  ok(r.status === 200 && st.vendas.length === 0, 'webhook: FUNDADOR não vira venda de parceiro');
  cenario();
  r = await chama(HOOK, { type: 'charge.refunded', data: { id: 'ch_1', order: { id: 'or_pix' }, customer: { email: 'aluno@exemplo.com' } } }, auth);
  ok(st.patches.some((x) => /order_id=eq\.or_pix/.test(x.url) && x.corpo.status === 'estornado'), 'webhook: estorno marca a venda como estornada');

  // (6) conta da comissão no painel
  const fns = ['parcMes', 'parcSemestre', 'parcComissao'].map((n) => { const mm = new RegExp('function ' + n + '\\([^)]*\\)\\{[\\s\\S]*?\\n\\}|function ' + n + '\\([^)]*\\)\\{[^\\n]*\\}').exec(HTML); return mm ? mm[0] : ''; });
  ok(fns.every(Boolean), 'painel: funções da comissão encontradas');
  if (fns.every(Boolean)) {
    const ctx = {}; vm.createContext(ctx); vm.runInContext(fns.join('\n'), ctx);
    const c = { codigo: 'PARC15', comissao_pct: 20, comissao_pct_meta: 25, meta_semestre: 2 };
    const agora = Date.parse('2026-12-20T12:00:00-03:00');
    const vendas = [
      { codigo: 'PARC15', valor_pago: 70380, valor_cheio: 82800, status: 'pago', pago_em: '2026-11-25T10:00:00-03:00' },
      { codigo: 'PARC15', valor_pago: 70380, valor_cheio: 82800, status: 'estornado', pago_em: '2026-11-26T10:00:00-03:00' },
      { codigo: 'PARC15', valor_pago: 70380, valor_cheio: 82800, status: 'pago', pago_em: '2026-12-02T10:00:00-03:00' },
      { codigo: 'PARC15', valor_pago: 70380, valor_cheio: 82800, status: 'pago', pago_em: '2026-12-18T10:00:00-03:00' },
      { codigo: 'OUTRO', valor_pago: 99999, valor_cheio: 99999, status: 'pago', pago_em: '2026-12-18T10:00:00-03:00' },
      { codigo: 'PARC15', valor_pago: 70380, valor_cheio: 82800, status: 'pago', pago_em: '2027-01-05T10:00:00-03:00' }
    ];
    const res = ctx.parcComissao(c, vendas, agora);
    const taxas = res.linhas.map((l) => l.status === 'pago' ? l.taxa : '-').join(',');
    ok(taxas === '20,-,20,25,20', 'comissão: 20% até a meta (2), 25% depois, estorno fora, semestre novo recomeça (veio ' + taxas + ')');
    ok(res.total.vendas === 4 && res.total.estornos === 1 && res.total.comissao === 14076 + 14076 + 17595 + 14076, 'comissão total em centavos (veio ' + JSON.stringify(res.total) + ')');
    const dez = res.porMes.find((x) => x.mes === '2026-12');
    ok(!!dez && dez.vendas === 2 && dez.carencia === 17595, 'venda com menos de 7 dias fica no prazo de arrependimento');
    ok(res.porMes[0].mes === '2027-01', 'meses do mais novo para o mais antigo');
  }

  // tela: link do cupom, só anual, campo sempre no anual, painel
  ok(/\[\?&\]cupom=\(\[A-Za-z0-9_-\]\{3,30\}\)/.test(HTML) && /CK_CUPOM_DIAS=60/.test(HTML), 'link ?cupom= guarda o cupom por 60 dias');
  ok(/client\.rpc\('endodirect_cupom_publico',\{p_codigo:c\}\)/.test(HTML), 'checkout confere o cupom no banco');
  ok(/data-asec="parcerias"/.test(HTML) && /client\.rpc\('endodirect_cupons_admin'\)/.test(HTML) && /client\.rpc\('endodirect_cupom_admin_salvar',\{p:p\}\)/.test(HTML), 'painel: Parcerias lista e salva pelos RPCs de professor');
  ok(/m\.__parcLigado=true/.test(HTML), 'painel: ouvinte de clique ligado uma vez só');

  // (7) MINHA PARCERIA na conta do parceiro (professor, 23/11/2026: "na conta do [parceiro] também aparecer essa
  // ferramenta de parceria para que ele possa acompanhar quantos alunos se inscreveram ... e ... a sua monetização")
  ok(/<button class="sb-item" data-p="parceria" id="sb-parceria" style="display:none">/.test(HTML), 'parceiro: item "Minha parceria" nasce escondido');
  ok(/client\.rpc\('endodirect_minhas_parcerias'\)/.test(HTML) && /b\.style\.display=minhaParc\.dados\?'':'none'/.test(HTML), 'parceiro: o item só aparece quando a RPC devolve cupom da própria conta');
  ok(/try\{carregaMinhaParceria\(\);\}catch\(e\)\{\}/.test(HTML) && /if\(id==='parceria'\)abrirMinhaParceria\(\);/.test(HTML), 'parceiro: carrega no login e abre o painel');
  ok(/if\(id==='parceria'\)return true;/.test(HTML), 'parceiro: acompanha as comissões mesmo sem plano ativo');
  ok(/parceiro_email:pemail,painel_parceiro:ppainel/.test(HTML), 'professor: liga o login do parceiro e libera o quadro no formulário');
  const fnsP = ['parcMes', 'parcMesNome', 'parcSemestre', 'parcPct', 'parcData', 'parcComissao', 'parcLink', 'ckBrl', 'minhaParceriaCupomHTML'].map((n) => { const mm = new RegExp('function ' + n + '\\([^)]*\\)\\{[\\s\\S]*?\\n\\}|function ' + n + '\\([^)]*\\)\\{[^\\n]*\\}').exec(HTML); return mm ? mm[0] : ''; });
  ok(fnsP.every(Boolean), 'parceiro: funções do quadro encontradas (' + fnsP.map((x) => x ? 1 : 0).join('') + ')');
  if (fnsP.every(Boolean)) {
    const ctx = { esc: (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])) }; vm.createContext(ctx); vm.runInContext(fnsP.join('\n'), ctx);
    const agora = Date.parse('2026-12-20T12:00:00-03:00');
    const vendas = [
      { codigo: 'ENDONEWS26', plano: 'gold', metodo: 'pix', valor_pago: 70380, valor_cheio: 82800, status: 'pago', pago_em: '2026-12-02T10:00:00-03:00' },
      { codigo: 'ENDONEWS26', plano: 'gold', metodo: 'credit_card', valor_pago: 70380, valor_cheio: 82800, status: 'estornado', pago_em: '2026-12-03T10:00:00-03:00' },
      { codigo: 'ENDONEWS26', plano: 'standard', metodo: 'boleto', valor_pago: 45900, valor_cheio: 54000, status: 'pago', pago_em: '2026-12-18T10:00:00-03:00' }
    ];
    const ativo = ctx.minhaParceriaCupomHTML({ codigo: 'ENDONEWS26', desconto_pct: 15, comissao_pct: 20, planos: ['gold', 'standard'], ativo: true }, vendas, agora);
    ok(/ENDONEWS26/.test(ativo) && /\?cupom=ENDONEWS26/.test(ativo) && /data-mp-copia="ENDONEWS26"/.test(ativo), 'parceiro: vê o cupom e o link para copiar');
    ok(/Inscrições confirmadas<\/div><div[^>]*>2</.test(ativo), 'parceiro: conta 2 inscrições confirmadas (o estorno fica fora)');
    ok(ativo.indexOf('R$') >= 0 && ativo.indexOf('232,56') >= 0, 'parceiro: comissão total de R$ 232,56 (20% de 703,80 + 459,00)');
    ok(!/Meta do semestre/.test(ativo) && !/Cupom ainda não ativado/.test(ativo), 'parceiro: sem meta configurada, sem barra; cupom ativo, sem aviso');
    const inativo = ctx.minhaParceriaCupomHTML({ codigo: 'ENDONEWS26', desconto_pct: 15, comissao_pct: 20, planos: ['gold'], ativo: false }, [], agora);
    ok(/Cupom ainda não ativado/.test(inativo) && /Nenhuma inscrição com o seu cupom ainda/.test(inativo), 'parceiro: cupom inativo avisa e mostra que não há inscrição');
    const meta = ctx.minhaParceriaCupomHTML({ codigo: 'X26', desconto_pct: 10, comissao_pct: 20, comissao_pct_meta: 25, meta_semestre: 1, planos: ['gold'], ativo: true }, vendas.map((v) => Object.assign({}, v, { codigo: 'X26' })), agora);
    ok(/Meta do semestre/.test(meta) && /2 de 1/.test(meta) && /Meta batida/.test(meta), 'parceiro: com meta, mostra o progresso do semestre');
    ok(!/aluno@|e-mail do aluno|order_id|or_/.test(ativo + inativo + meta), 'parceiro: nada de dado de aluno nem id de pedido no quadro');
  }

  console.log = consoleOriginal.log; console.error = consoleOriginal.error;
  if (falhas.length) { console.error('test-cupom-parceiro: ' + falhas.length + ' falha(s):\n- ' + falhas.join('\n- ')); process.exit(1); }
  console.log('ok: cupom de parceiro (desconto igual na tela e no servidor, venda registrada sem dado de aluno, recusas sem cobrar, webhook e estorno, comissão com meta)');
})().catch((e) => { console.log = consoleOriginal.log; console.error = consoleOriginal.error; console.error(e && e.stack || e); process.exit(1); });
