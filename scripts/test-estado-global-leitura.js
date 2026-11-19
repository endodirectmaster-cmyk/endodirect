// Leitura do estado global que FALHA não pode virar "servidor vazio".
//
// Incidente de 19/11/2026, 07:46 BRT: o Supabase respondeu 503 por alguns segundos durante o
// cron diário. A rotina de e-mails lia o payload com `if (!r.ok) return {}`, achava o ledger
// vazio, reenviava as campanhas e gravava `{ trial_emails }` como o payload INTEIRO: provas,
// Resumos, cursos, podcasts e a fila da Questão do Dia sumiram para todos até a restauração.
// Este teste reproduz a falha de leitura em cada rotina do servidor que regrava o payload.
'use strict';

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

process.env.RESEND_API_KEY = 're_teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_teste';

const { payloadDaResposta, confereParaGravar } = require('../lib/estado-global');
const trial = require('../lib/trial-emails');
const newsletter = require('../lib/newsletter');
const instagram = require('../lib/instagram');

const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo, text: async () => '' });
const CHEIO = { provas: [{ id: 'q1' }], diretrizes: [{ id: 'd1' }], ig_stories: [{ id: 's1', status: 'queued' }], trial_emails: {} };

// Banca: as leituras do estado global seguem a fila `leituras` (status por chamada).
function banca(leituras, extra) {
  const gravados = [], enviados = [];
  let n = 0;
  global.fetch = async (url, opts) => {
    const u = String(url);
    const metodo = (opts && opts.method) || 'GET';
    if (u.indexOf('endodirect_global_state') >= 0 && metodo === 'GET') {
      const st = leituras[Math.min(n, leituras.length - 1)]; n++;
      return st === 200 ? resp(200, [{ payload: JSON.parse(JSON.stringify(CHEIO)) }]) : resp(st, { message: 'upstream' });
    }
    if (u.indexOf('endodirect_global_state') >= 0) { gravados.push(JSON.parse(opts.body)); return resp(200, {}); }
    if (u.indexOf('api.resend.com') >= 0) { (JSON.parse(opts.body) || []).forEach(() => enviados.push(1)); return resp(200, {}); }
    if (extra) { const r = extra(u, opts); if (r) return r; }
    return resp(200, []);
  };
  return { gravados, enviados };
}

(async () => {
  // 1. O ajudante: leitura que falhou lança; payload montado do nada não grava.
  for (const [nome, r] of [['503', resp(503, {})], ['sem linha', resp(200, [])], ['payload nulo', resp(200, [{ payload: null }])], ['payload lista', resp(200, [{ payload: [] }])]]) {
    let lancou = false;
    try { await payloadDaResposta(r); } catch (e) { lancou = true; }
    ok('payloadDaResposta lança com ' + nome, lancou);
  }
  ok('payloadDaResposta devolve o payload lido', (await payloadDaResposta(resp(200, [{ payload: { provas: [] } }]))).provas.length === 0);
  let recusou = false;
  try { confereParaGravar({ trial_emails: { 'a@b.c': { winback: '2026-11-19' } } }); } catch (e) { recusou = true; }
  ok('o payload do incidente ({ trial_emails }) é recusado na gravação', recusou);
  ok('payload com provas grava', confereParaGravar({ provas: [] }));

  // 2. Rotina de e-mails com a 1ª leitura em 503: não envia nada e não grava nada.
  {
    const b = banca([503], (u) => (u.indexOf('/rpc/endodirect_trial_email_targets') >= 0 ? resp(200, [{ email: 'x@y.z', kind: 'winback' }]) : null));
    let lancou = false;
    try { await trial.sendTrialEmails(); } catch (e) { lancou = true; }
    ok('e-mails de degustação: leitura em 503 interrompe a rotina', lancou);
    ok('e-mails de degustação: nenhum e-mail enviado sem o ledger', b.enviados.length === 0, b.enviados.length + ' enviados');
    ok('e-mails de degustação: nada gravado', b.gravados.length === 0, b.gravados.length + ' gravações');
  }
  // 3. O caso exato de 19/11: 1ª leitura OK, a releitura antes de gravar em 503. Grava sobre
  //    a cópia da 1ª leitura, com tudo dentro, e nunca um payload só com o ledger.
  {
    const b = banca([200, 503], (u) => (u.indexOf('/rpc/endodirect_trial_email_targets') >= 0 ? resp(200, [{ email: 'x@y.z', kind: 'winback' }]) : null));
    await trial.sendTrialEmails();
    const g = b.gravados[0] && b.gravados[0].payload;
    ok('releitura em 503: grava 1 vez', b.gravados.length === 1, b.gravados.length + ' gravações');
    ok('releitura em 503: o que vai ao banco mantém provas, Resumos e a fila', !!g && g.provas.length === 1 && g.diretrizes.length === 1 && g.ig_stories.length === 1);
    ok('releitura em 503: e o ledger novo', !!g && g.trial_emails['x@y.z'] && !!g.trial_emails['x@y.z'].winback);
  }
  // 4. Descadastro da newsletter durante a falha: não grava { newsletter_unsub } por cima de tudo.
  {
    const b = banca([503]);
    let lancou = false;
    try { await newsletter.addUnsubscribe('x@y.z'); } catch (e) { lancou = true; }
    ok('descadastro: leitura em 503 lança (o endpoint responde erro)', lancou);
    ok('descadastro: nada gravado', b.gravados.length === 0);
  }
  // 5. Questão do Dia automática durante a falha: não posta nem grava.
  {
    const b = banca([503]);
    const r = await instagram.autoPostDailyQotd(new Date('2026-11-19T10:45:00Z'));
    ok('Questão do Dia: leitura em 503 não posta', r && r.posted === false, JSON.stringify(r));
    ok('Questão do Dia: nada gravado', b.gravados.length === 0);
  }

  if (bad) { console.log(bad + ' falha(s) no teste do estado global.'); process.exit(1); }
  console.log('ok — leitura do estado global que falha não vira payload vazio');
})().catch((e) => { console.error(e); process.exit(1); });
