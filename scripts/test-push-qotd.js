// NOTIFICAÇÃO DA QUESTÃO DO DIA NO CELULAR (15/10/2026).
//
// Relato do professor: no iPhone, o botão do e-mail abre no Safari, não no app
// instalado (regra da Apple: só app da App Store recebe link). A notificação,
// sim, abre dentro do app instalado. Então a Questão do Dia sai também por push,
// no mesmo run da newsletter, e o painel tem um botão para mandar agora.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) a mensagem tem título, corpo cortado no fim de
// palavra, url /#qotd/<id> (id validado) e tag própria; (2) o envio não sai sem
// questão, sem VAPID ou sem função de envio, e falha de envio não lança;
// (3) a newsletter chama o push DEPOIS de confirmar entrega e ANTES de gravar
// `newsletter_qotd_id`, só com questão nova, e devolve o resultado; (4) o
// endpoint admin tem a ação `qotd-push` com a guarda do VAPID; (5) o painel tem
// o botão e chama a ação; (6) o sw.js continua abrindo a url da notificação.
'use strict';
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const { mensagemPushQotd, pushQotd, cortar, CORPO_MAX } = require(path.join(raiz, 'lib', 'push-qotd.js'));

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

(async () => {
  // (1) mensagem
  const longo = 'Paciente de 45 anos com ' + 'hipercalcemia e PTH elevado, '.repeat(12) + 'qual a conduta?';
  const m = mensagemPushQotd({ id: 'q_2026-10-15', stem: longo }, 'https://www.endodirect.com.br/');
  ok(m.title === '🧠 Questão do Dia', '(1) título errado: ' + m.title);
  ok(m.body.length <= CORPO_MAX + 1 && /…$/.test(m.body) && !/ …$/.test(m.body), '(1) corpo não foi cortado no fim de palavra com reticências: ' + m.body.slice(-30));
  ok(m.url === 'https://www.endodirect.com.br/#qotd/q_2026-10-15', '(1) url errada: ' + m.url);
  ok(m.tag === 'endodirect-qotd', '(1) tag errada: ' + m.tag);
  ok(mensagemPushQotd({ id: 'a b', stem: 'x' }).url === 'https://www.endodirect.com.br/#qotd', '(1) id inválido devia cair na raiz do arquivo');
  ok(mensagemPushQotd({ id: 'z' }).body === 'Nova questão publicada. Toque para responder.', '(1) sem enunciado devia usar o texto padrão');
  ok(cortar('abc def ghi', 8) === 'abc def…' && cortar('abcdefghijklmnop', 8) === 'abcdefg…', '(1) cortar: ' + cortar('abc def ghi', 8) + ' / ' + cortar('abcdefghijklmnop', 8));

  // (2) envio
  const q = { id: 'q1', stem: 'Enunciado' };
  let chamadas = 0;
  const enviaOk = async (msg) => { chamadas++; return { ok: true, sent: 9, failed: 0 }; };
  let r = await pushQotd({ qotd: null, enviar: enviaOk, configurado: () => true });
  ok(!r.sent && chamadas === 0, '(2) sem questão não pode enviar');
  r = await pushQotd({ qotd: q, enviar: enviaOk, configurado: () => false });
  ok(!r.sent && chamadas === 0 && /VAPID/.test(r.motivo), '(2) sem VAPID não pode enviar');
  r = await pushQotd({ qotd: q, configurado: () => true });
  ok(!r.sent && /sem função/.test(r.motivo), '(2) sem função de envio devia recusar');
  r = await pushQotd({ qotd: q, enviar: async () => { throw new Error('rede'); }, configurado: () => true });
  ok(!r.sent && /envio falhou: rede/.test(r.motivo), '(2) erro de envio devia virar motivo, não exceção');
  r = await pushQotd({ qotd: q, enviar: async () => ({ ok: false, error: 'x' }), configurado: () => true });
  ok(!r.sent && /recusado: x/.test(r.motivo), '(2) resultado não ok devia virar motivo');
  r = await pushQotd({ qotd: q, enviar: enviaOk, configurado: () => true, base: 'https://x.test' });
  ok(r.sent && chamadas === 1 && r.push.sent === 9 && r.mensagem.url === 'https://x.test/#qotd/q1', '(2) envio bom devia devolver sent com o resultado');

  // (3) newsletter
  const nl = fs.readFileSync(path.join(raiz, 'lib', 'newsletter.js'), 'utf8');
  const iEntrega = nl.indexOf("reason: 'delivery_failed'");
  const iPush = nl.indexOf("pushQdd = await pushQotd({ qotd, enviar: (m) => sendToAll(m), configurado: isConfigured, base: publicBase() })");
  const iGrava = nl.indexOf('toSave.newsletter_qotd_id = qotd.id');
  ok(iEntrega > 0 && iPush > iEntrega && iGrava > iPush, '(3) o push da newsletter não está entre a confirmação de entrega e a gravação do newsletter_qotd_id');
  ok(/\n  if \(qotd\) \{\n    try \{ pushQdd = await pushQotd/.test(nl), '(3) o push não está condicionado à questão nova do e-mail');
  ok(/return \{ sent: true, recipients: recipients\.length, delivered: sent, pushQotd: pushQdd \};/.test(nl), '(3) a newsletter não devolve o resultado do push');
  ok(/const \{ sendToAll, isConfigured \} = require\('\.\/push'\);/.test(nl) && /const \{ pushQotd \} = require\('\.\/push-qotd'\);/.test(nl), '(3) imports do push na newsletter');
  ok(/module\.exports = \{[^}]*currentQotd[^}]*loadPayload, serviceKey \};/.test(nl), '(3) a newsletter precisa exportar loadPayload e serviceKey para o endpoint admin');

  // (4) endpoint admin
  const api = fs.readFileSync(path.join(raiz, 'api', 'admin', 'refresh-radar.js'), 'utf8');
  const iAcao = api.indexOf("payload.action === 'qotd-push'");
  ok(iAcao > 0, '(4) a ação qotd-push não existe no endpoint admin');
  const trecho = api.slice(iAcao, iAcao + 1200);
  ok(/if \(!push\.isConfigured\(\)\) return json\(res, 503/.test(trecho), '(4) a ação qotd-push não guarda o VAPID');
  ok(/const q = currentQotd\(estado\);/.test(trecho) && /pushQotd\(\{ qotd: q, enviar: \(m\) => push\.sendToAll\(m\), configurado: push\.isConfigured \}\)/.test(trecho), '(4) a ação não usa a questão atual nem o mesmo módulo do envio automático');
  ok(/return json\(res, 404, \{ ok: false, error: 'Nenhuma Questao do Dia postada ainda\.' \}\)/.test(trecho), '(4) sem questão postada devia responder 404');

  // (5) painel
  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  ok(/id="ig-qotd-push"/.test(html) && /return avisoPush\+listCard/.test(html), '(5) o botão de notificação não está na aba Postados');
  ok(/admSendPush\(\{action:'qotd-push'\}\)/.test(html), '(5) o botão não chama a ação qotd-push');
  ok(/Object\.assign\(\{action:'push'\},payload\|\|\{\}\)/.test(html), '(5) admSendPush precisa deixar o payload sobrescrever a action');
  ok(/if\(!confirm\('Enviar agora a notificação da Questão do Dia atual/.test(html), '(5) o envio manual não pede confirmação');

  // (6) sw.js
  const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
  ok(/var target = \(e\.notification\.data && e\.notification\.data\.url\) \|\| '\/';/.test(sw) && /data: \{ url: data\.url \|\| '\/' \}/.test(sw), '(6) o sw.js deixou de abrir a url da notificação');

  if (falhas.length) { console.error('test-push-qotd: ' + falhas.length + ' falha(s)'); falhas.forEach((f) => console.error('  ✗ ' + f)); process.exit(1); }
  console.log('test-push-qotd: ok (mensagem, envio fail-safe, gancho na newsletter, ação admin, botão do painel, sw abre a url)');
})().catch((e) => { console.error(e); process.exit(1); });
