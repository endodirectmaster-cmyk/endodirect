// Lembrete da enquete de Educação Médica Continuada (04/11/2026).
//
// Pedido do professor: "essa enquete já está rolando para os demais alunos que
// ainda não responderam. Acho que vale a pena uma nova cobrança." E: os que já
// responderam "não precisam responder novamente".
//
// O que este teste prende:
//   1. quem recebe é decidido no BANCO (RPC `endodirect_enquete_cme_pendentes`, só
//      service_role, Gold ativo sem voto, sem teste/admin/descadastrado);
//   2. sai UMA vez por campanha: o envio é registrado em
//      `payload.enquete_lembrete_sent`, chave protegida pelo gatilho;
//   3. não sai fora da janela da campanha, nem antes dela;
//   4. o e-mail tem descadastro de 1 clique e leva à plataforma;
//   5. o cron chama o lembrete sem poder cair por causa dele.
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-de-teste';
process.env.RESEND_API_KEY = 'resend-de-teste';
process.env.SUPABASE_URL = 'https://supabase.teste';
delete process.env.VAPID_PUBLIC_KEY; delete process.env.VAPID_PRIVATE_KEY;

let estado, chamadas;
function cenario(pendentes, sent) {
  estado = { payload: { radar_avisos: [{ t: 1 }], enquete_lembrete_sent: sent || undefined }, pendentes: pendentes };
  chamadas = { rpc: 0, resend: [], patch: [] };
  global.fetch = async (url, opt) => {
    url = String(url); opt = opt || {};
    if (url.includes('/rpc/endodirect_enquete_cme_pendentes')) { chamadas.rpc++; return { ok: true, json: async () => estado.pendentes.map((e) => ({ email: e })) }; }
    if (url.includes('/rest/v1/endodirect_global_state') && (!opt.method || opt.method === 'GET')) return { ok: true, json: async () => [{ payload: JSON.parse(JSON.stringify(estado.payload)) }] };
    if (url.includes('/rest/v1/endodirect_global_state') && opt.method === 'PATCH') { const b = JSON.parse(opt.body); chamadas.patch.push(b); estado.payload = b.payload; return { ok: true }; }
    if (url.includes('api.resend.com')) { chamadas.resend.push(JSON.parse(opt.body)); return { ok: true, json: async () => ({}) }; }
    if (url.includes('endodirect_push_subscriptions')) return { ok: true, json: async () => [] };
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
  };
}
function carrega() {
  delete require.cache[require.resolve(path.join(RAIZ, 'lib', 'enquete-lembrete.js'))];
  return require(path.join(RAIZ, 'lib', 'enquete-lembrete.js'));
}
const DIA = (iso) => Date.parse(iso);

(async () => {
  const L = carrega();
  const camp = L.CAMPANHAS[0];
  ok(!!camp && camp.aPartirDe === '2026-11-05', 'a 1ª campanha tem de começar em 05/11/2026 (amanhã, para o professor ver o texto antes)');

  // ── 1. Antes da campanha: nada sai ────────────────────────────────────────
  cenario(['a@x.com', 'b@x.com']);
  let r = await L.sendLembreteEnquete(DIA('2026-11-04T20:00:00Z'));
  ok(r.skipped === 'sem campanha ativa' && chamadas.resend.length === 0 && chamadas.rpc === 0, 'o lembrete saiu ANTES do dia combinado (04/11)');

  // ── 2. No dia: sai para os pendentes da RPC, uma vez, e registra ──────────
  cenario(['a@x.com', 'B@x.com', 'a@x.com']);
  r = await L.sendLembreteEnquete(DIA('2026-11-05T10:31:00Z'));
  const enviados = chamadas.resend.flat();
  ok(chamadas.rpc === 1, 'a lista de quem recebe tem de vir da RPC do banco');
  ok(enviados.length === 2, 'esperava 2 e-mails (sem repetir o mesmo aluno), saíram ' + enviados.length);
  ok(enviados.every((m) => m.subject === L.ASSUNTO && /Educação Médica Continuada/.test(m.html)), 'o e-mail não é o lembrete da enquete');
  ok(enviados.every((m) => m.headers && /unsubscribe/.test(m.headers['List-Unsubscribe'] || '')), 'falta o descadastro de 1 clique');
  ok(enviados.every((m) => /Escolher meus temas/.test(m.html) && /href="https:\/\/www\.endodirect\.com\.br\/"/.test(m.html)), 'o botão do e-mail tem de levar à plataforma');
  const reg = (estado.payload.enquete_lembrete_sent || {})[camp.id];
  ok(!!reg && reg.emails === 2 && reg.alvo === 2, 'o envio não ficou registrado em payload.enquete_lembrete_sent: ' + JSON.stringify(estado.payload.enquete_lembrete_sent));
  ok(Array.isArray(estado.payload.radar_avisos) && estado.payload.radar_avisos.length === 1, '⚠️ gravar o registro apagou outras chaves do payload');

  // ── 3. Segunda rodada no mesmo dia (2º cron) ou no dia seguinte: não repete ──
  chamadas.resend = []; chamadas.rpc = 0;
  r = await L.sendLembreteEnquete(DIA('2026-11-05T20:31:00Z'));
  ok(r.skipped === 'ja enviado' && chamadas.resend.length === 0 && chamadas.rpc === 0, '⚠️ o lembrete saiu DE NOVO na segunda rodada');
  r = await L.sendLembreteEnquete(DIA('2026-11-06T10:31:00Z'));
  ok(r.skipped === 'ja enviado' && chamadas.resend.length === 0, '⚠️ o lembrete saiu de novo no dia seguinte');

  // ── 4. Depois da janela da campanha: não sai nem para quem nunca recebeu ──
  cenario(['c@x.com']);
  r = await L.sendLembreteEnquete(DIA('2026-11-20T10:31:00Z'));
  ok(r.skipped === 'sem campanha ativa' && chamadas.resend.length === 0, 'o lembrete saiu fora da janela da campanha');

  // ── 5. RPC falhou: não manda para ninguém e não marca como enviado ────────
  cenario(['a@x.com']);
  global.fetch = (function (f) { return async (url, opt) => (String(url).includes('/rpc/') ? { ok: false, status: 500, json: async () => ({}) } : f(url, opt)); })(global.fetch);
  r = await L.sendLembreteEnquete(DIA('2026-11-05T10:31:00Z'));
  ok(r.ok === false && chamadas.resend.length === 0 && !estado.payload.enquete_lembrete_sent, 'com a RPC fora, o lembrete não pode sair nem ficar marcado');

  // ── 6. SQL: RPC só do servidor e chave protegida pelo gatilho ─────────────
  const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'enquete-lembrete.sql'), 'utf8');
  ok(/revoke all on function public\.endodirect_enquete_cme_pendentes\(\) from authenticated/.test(sql) && /grant execute on function public\.endodirect_enquete_cme_pendentes\(\) to service_role/.test(sql),
    '⚠️ a RPC que devolve e-mail de aluno tem de ser só do service_role');
  ok(/endodirect_email_de_teste/.test(sql) && /newsletter_unsub/.test(sql) && /enquete_cme/.test(sql), 'a RPC tem de tirar teste/admin, descadastrados e quem já votou');
  ok(/server_keys text\[\] := array\[[^\]]*'enquete_lembrete_sent'/.test(sql), '⚠️ enquete_lembrete_sent tem de estar nas chaves do servidor do gatilho — senão um save do painel apaga o registro e o lembrete sai de novo');
  ok(/'aovivo_sent'/.test(sql) && /'radar_feeds_aviso'/.test(sql) && /'radar_avisos'/.test(sql), '⚠️ a nova lista de chaves do gatilho perdeu chaves que já existiam');

  // ── 7. O cron chama, em try/catch ─────────────────────────────────────────
  const cron = fs.readFileSync(path.join(RAIZ, 'api', 'cron', 'endocrine-radar.js'), 'utf8');
  const i = cron.indexOf('await sendLembreteEnquete()');
  ok(i > 0 && cron.lastIndexOf('try {', i) > cron.lastIndexOf('\n', i) - 200, 'o cron não chama o lembrete dentro de try');
  ok(/enqueteLembrete/.test(cron.slice(cron.indexOf('return json(res, 200'))), 'o resultado do lembrete não aparece no retorno do cron');

  if (falhas.length) { console.log(falhas.map((f) => '  ✗ ' + f).join('\n')); process.exit(1); }
  console.log('lembrete da enquete: ok');
})().catch((e) => { console.log('  ✗ erro: ' + (e && e.stack || e)); process.exit(1); });
