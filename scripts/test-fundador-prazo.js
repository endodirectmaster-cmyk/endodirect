// SÓCIO-FUNDADOR ENCERRA NA BLACK FRIDAY (30/11/2026, 23h59).
//
// Professor, 23/11/2026: "fechar o sócio fundador na segunda, dia 30/11, e já anunciar
// isso no nosso site". O cupom FUNDADOR deixa de valer sozinho depois da hora (mesmo com
// vagas), sem ninguém mexer em variável de ambiente; os fundadores que já entraram
// mantêm o preço (o acesso deles não passa por aqui).
//
// 🧨 O QUE ESTE TESTE PRENDE (handlers DE VERDADE, fetch falso, cada cenário num processo):
// (1) antes do prazo: o cupom cobra R$ 540 do Gold anual;
// (2) depois do prazo: 400 `fundador_encerrado` e o pagar.me NEM é chamado; a config
//     pública diz `enabled:false` e `encerrada:true`;
// (3) o prazo padrão é 30/11/2026 23:59:59 de Brasília;
// (4) as faixas do site anunciam o encerramento e o selo do Gold só aparece com a oferta aberta.
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { EventEmitter } = require('events');
const RAIZ = path.join(__dirname, '..');

if (process.argv[2] === 'cenario') {
  // ── processo filho: um cenário com o FOUNDER_ATE dado ──
  const consoleOriginal = { log: console.log };
  console.log = function () {}; console.error = function () {};
  process.env.PAGARME_SECRET_KEY = 'sk_test_teste';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'srv_teste';
  process.env.SUPABASE_URL = 'https://sb.teste';
  process.env.FOUNDER_ATE = process.argv[3];
  const JA_FUNDADOR = process.argv[4] === 'fundador';
  const st = { pedidos: [] };
  const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, headers: { get: () => '' }, json: async () => body, text: async () => JSON.stringify(body) });
  global.fetch = async function (url, init) {
    url = String(url); const metodo = (init && init.method) || 'GET';
    if (url.startsWith('https://api.pagar.me/')) {
      const rota = url.replace('https://api.pagar.me/core/v5', '').split('?')[0];
      if (rota === '/customers' && metodo === 'POST') return resp(200, { id: 'cus_1' });
      if (rota === '/customers/cus_1') return resp(200, { id: 'cus_1' });
      if (rota === '/customers/cus_1/cards') return resp(200, { id: 'card_1' });
      if (rota === '/orders') { st.pedidos.push(JSON.parse(init.body)); return resp(200, { id: 'or_1', status: 'paid', charges: [{ status: 'paid', last_transaction: {} }] }); }
      return resp(404, {});
    }
    // ehFundador (e-mail + notas "fundador"): a conta já é fundadora?
    if (url.indexOf('/rest/v1/endodirect_acessos?email=ilike.') >= 0 && url.indexOf('notes=') >= 0) return resp(200, JA_FUNDADOR ? [{ id: 'f1' }] : []);
    if (url.indexOf('/rest/v1/endodirect_acessos') >= 0 && url.indexOf('notes=') >= 0) return resp(200, []);
    if (url.indexOf('/rest/v1/endodirect_acessos?email=') >= 0) return resp(200, []);
    if (url.indexOf('/auth/v1/admin/users') >= 0) return metodo === 'POST' ? resp(200, { id: 'U1' }) : resp(200, { users: [] });
    return resp(200, {});
  };
  const ORDER = require(path.join(RAIZ, 'api', 'checkout', 'order.js'));
  const FOUNDER = require(path.join(RAIZ, 'lib', 'founder.js'));
  (async function () {
    const req = new EventEmitter(); req.method = 'POST'; req.headers = { origin: 'https://www.endodirect.com.br' };
    const corpo = { plan: 'gold', method: 'credit_card', installments: 12, card_token: 'tok_1', coupon: 'FUNDADOR', email: 'aluno@exemplo.com', name: 'Aluno', document: '12345678901', phone: '11999999999', address: { zip: '01001000', line1: 'Rua A, 1', city: 'São Paulo', state: 'SP' } };
    setImmediate(() => { req.emit('data', Buffer.from(JSON.stringify(corpo))); req.emit('end'); });
    let fim; const pronto = new Promise((r) => { fim = r; });
    const res = { statusCode: 0, setHeader() {}, end(b) { this.body = b; fim(); } };
    await ORDER(req, res); await pronto;
    const status = await FOUNDER.founderStatus();
    consoleOriginal.log(JSON.stringify({ http: res.statusCode, corpo: JSON.parse(res.body || '{}'), pedidos: st.pedidos.map((p) => p.items[0].amount), status }));
  })();
  return;
}

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const roda = (ate, quem) => JSON.parse(execFileSync(process.execPath, [__filename, 'cenario', ate, quem || ''], { encoding: 'utf8' }).trim().split('\n').pop());

// (1) antes do prazo
const antes = roda(new Date(Date.now() + 86400000).toISOString());
ok(antes.http === 200 && antes.corpo.ok === true && antes.pedidos.length === 1 && antes.pedidos[0] === 54000, 'antes do prazo: FUNDADOR cobra R$ 540 (veio ' + JSON.stringify(antes.corpo) + ' ' + JSON.stringify(antes.pedidos) + ')');
ok(antes.status.enabled === true && antes.status.encerrada === false && !!antes.status.ate, 'antes do prazo: config com a oferta aberta e a data de encerramento');

// (2) depois do prazo
const depois = roda(new Date(Date.now() - 60000).toISOString());
ok(depois.http === 400 && depois.corpo.code === 'fundador_encerrado' && /encerrada/.test(depois.corpo.error || ''), 'depois do prazo: 400 fundador_encerrado (veio ' + depois.http + ' ' + JSON.stringify(depois.corpo) + ')');
ok(depois.pedidos.length === 0, 'depois do prazo: o pagar.me NÃO é chamado');
ok(depois.status.enabled === false && depois.status.encerrada === true, 'depois do prazo: config pública desliga a oferta (faixas somem do site)');

// (2b) RENOVAÇÃO de quem já é fundador: "preço travado para sempre" vale depois do prazo
const renova = roda(new Date(Date.now() - 60000).toISOString(), 'fundador');
ok(renova.http === 200 && renova.corpo.ok === true && renova.pedidos.length === 1 && renova.pedidos[0] === 54000, 'depois do prazo, quem JÁ é fundador renova a R$ 540 (veio ' + renova.http + ' ' + JSON.stringify(renova.corpo) + ' ' + JSON.stringify(renova.pedidos) + ')');
const src0 = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
ok(/client\.rpc\('endodirect_sou_fundador'\)/.test(src0) && /function ckFounderAberto\(\)\{var f=ckFounder\(\);return !!\(f&&\(f\.enabled\|\|_ckSouFundador===true\)\);\}/.test(src0), 'checkout: o fundador vê o campo e o preço de R$ 540 na renovação');

// (3) prazo padrão
const src = fs.readFileSync(path.join(RAIZ, 'lib', 'founder.js'), 'utf8');
ok(/process\.env\.FOUNDER_ATE == null \? '2026-11-30T23:59:59-03:00'/.test(src), 'prazo padrão: 30/11/2026 23:59:59 de Brasília');

// (4) o site
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
ok(/🔥 BLACK FRIDAY<\/span><b>Últimas vagas de Sócio-fundador:<\/b>[^<]*<b>12× R\$ 45,00<\/b>, com preço travado para sempre\. <b data-founder-prazo>A oferta encerra na segunda, 30\/11, às 23h59<\/b>/.test(html), 'landing: faixa da Black Friday com o prazo');
ok(/<div id="lp-bf" style="display:none;/.test(html) && /if\(bf\)bf\.style\.display=founderOn\?'':'none';/.test(html), 'landing: barra do topo da Black Friday, só com a oferta aberta');
ok(!/Válido para os primeiros 100 assinantes/.test(html), 'o texto antigo ("primeiros 100") saiu das faixas');
ok(/assineAnnual&&t\.key==='gold'&&!!\(ckFounder\(\)&&ckFounder\(\)\.enabled\)/.test(html), 'selo "Sócio-fundador" no cartão Gold só com a oferta aberta');
ok(/function fundadorPrazoTxt\(iso\)/.test(html) && /A oferta encerra hoje, às /.test(html), 'tela de planos: prazo com "hoje" no último dia');

if (falhas.length) { console.error('test-fundador-prazo: ' + falhas.length + ' falha(s):\n- ' + falhas.join('\n- ')); process.exit(1); }
console.log('ok: Sócio-fundador encerra sozinho em 30/11 23h59 (cupom recusado sem cobrar, config desliga, faixas anunciam)');
