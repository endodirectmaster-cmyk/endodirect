// Endodirect — E-mails do ciclo de degustação (Resend).
// (1) WARN: aviso ~48h antes do término dos 7 dias de degustação.
// (2) WINBACK: para quem já terminou a degustação — incentivo à assinatura.
//
// Acionado pelo cron diário (pega carona no endocrine-radar, pois o plano
// limita o número de cron jobs). Os destinatários vêm da RPC
// endodirect_trial_email_targets() (SECURITY DEFINER, só service role) — que já
// exclui admins e quem tem assinatura/acesso ativo. Idempotente: registra os
// envios em endodirect_global_state.payload.trial_emails ({emailLower:{warn,winback}}),
// então cada pessoa recebe cada e-mail no máximo uma vez. Respeita os opt-outs da
// newsletter (payload.newsletter_unsub) e manda List-Unsubscribe (1-clique).
//
// Envs: RESEND_API_KEY (sem ela, pula), SUPABASE_SERVICE_ROLE_KEY,
//   TRIAL_FROM/NEWSLETTER_FROM (remetente), PUBLIC_BASE_URL, NEWSLETTER_SECRET.

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const MAX_PER_RUN = 300; // trava de segurança contra disparo em massa

function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || ''; }
function serviceHeaders(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function publicBase() { return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, ''); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
function unsubSecret() { return process.env.NEWSLETTER_SECRET || serviceKey() || 'endodirect-newsletter'; }
function unsubToken(email) { return crypto.createHmac('sha256', unsubSecret()).update(String(email || '').trim().toLowerCase()).digest('hex').slice(0, 32); }
function unsubUrl(email) { const e = encodeURIComponent(String(email || '').trim().toLowerCase()); return `${publicBase()}/api/newsletter/unsubscribe?e=${e}&t=${unsubToken(email)}`; }

async function loadPayload(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: serviceHeaders(key) });
  if (!r.ok) return {};
  const rows = await r.json().catch(() => []);
  return (rows && rows[0] && rows[0].payload) || {};
}
async function savePayload(key, payload) {
  await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?on_conflict=id`, {
    method: 'POST',
    headers: { ...serviceHeaders(key), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: 'main', payload, updated_by: null, updated_at: new Date().toISOString() })
  });
}
async function fetchTargets(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/endodirect_trial_email_targets`, { method: 'POST', headers: serviceHeaders(key), body: '{}' });
  if (!r.ok) { console.error('[trial-emails] RPC HTTP', r.status); return []; }
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

function shell(inner) {
  // ⚠️ O CAMINHO ERA `/icon-192.png` E NÃO EXISTE — o arquivo está em `/icons/`.
  // Todo e-mail de degustação já enviado (warn e winback) saiu com o logo
  // quebrado no topo. Imagem quebrada em e-mail de marca não gera erro em lugar
  // nenhum: só chega feia na caixa de quem a gente está tentando reconquistar.
  const logo = publicBase() + '/icons/icon-192.png';
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">`
    + `<div style="max-width:600px;margin:0 auto;padding:24px">`
    + `<div style="text-align:center;margin-bottom:18px"><img src="${logo}" width="44" height="44" alt="Endodirect" style="display:inline-block;width:44px;height:44px"></div>`
    + `<div style="background:#fff;border-radius:16px;padding:30px 28px;box-shadow:0 1px 4px rgba(0,0,0,.06)">${inner}</div>`
    + `<div style="text-align:center;color:#8a93a6;font-size:12px;margin-top:18px">Endodirect — Educação Médica em Endocrinologia</div>`
    + `</div></body></html>`;
}
function btn(href, label) {
  return `<div style="margin:24px 0 6px"><a href="${esc(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:10px">${esc(label)}</a></div>`;
}
function warnHtml(daysLeft) {
  const dl = Math.max(1, daysLeft | 0);
  const cta = publicBase() + '/#planos';
  return shell(
    `<h1 style="font-size:22px;color:#13294b;margin:0 0 10px">Sua degustação termina em ${dl} dia${dl > 1 ? 's' : ''} ⏳</h1>`
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 14px">Você está aproveitando os <b>7 dias de degustação</b> do Endodirect — faltam <b>${dl} dia${dl > 1 ? 's' : ''}</b> para o acesso encerrar.</p>`
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 6px">Assine um plano e continue com:</p>`
    + `<ul style="font-size:15px;color:#39435a;line-height:1.7;margin:0 0 6px;padding-left:20px">`
    + `<li>Flashcards e mapas mentais por subespecialidade</li>`
    + `<li>Banco de questões de provas</li>`
    + `<li>Ferramentas de IA (casos, simulado, prescrição e chat)</li>`
    + `<li>Mural de atualizações e novidades</li></ul>`
    + btn(cta, 'Assinar e manter o acesso')
    + `<p style="font-size:12px;color:#8a93a6;margin:16px 0 0">Se você já assinou, pode ignorar este aviso.</p>`
  );
}
function winbackHtml() {
  const cta = publicBase() + '/#planos';
  return shell(
    `<h1 style="font-size:22px;color:#13294b;margin:0 0 10px">Sentimos sua falta 👋</h1>`
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 14px">Sua <b>degustação de 7 dias</b> do Endodirect terminou. Para voltar a estudar com tudo o que a plataforma oferece, escolha um plano:</p>`
    + `<ul style="font-size:15px;color:#39435a;line-height:1.7;margin:0 0 6px;padding-left:20px">`
    + `<li>Flashcards e mapas mentais sempre atualizados</li>`
    + `<li>Banco de questões e ferramentas de IA</li>`
    + `<li>Conteúdo das principais diretrizes (ADA, ATA, Endocrine Society…)</li></ul>`
    + btn(cta, 'Ver planos e assinar')
  );
}

async function sendBatch(apiKey, from, subject, recips, htmlFor) {
  let sent = 0;
  for (const part of chunk(recips, 100)) {
    const batch = part.map((to) => {
      const u = unsubUrl(to);
      return { from, to: [to], subject, html: htmlFor(to), headers: { 'List-Unsubscribe': `<${u}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
    });
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    if (r.ok) sent += part.length;
    else { const t = await r.text().catch(() => ''); console.error('[trial-emails] Resend HTTP', r.status, t.slice(0, 300)); }
  }
  return sent;
}

// Envia os e-mails do ciclo de degustação. Fail-safe: qualquer pré-condição
// ausente => pula sem lançar.
async function sendTrialEmails() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log('[trial-emails] RESEND_API_KEY ausente — pulado.'); return { sent: false, reason: 'no_api_key' }; }
  const key = serviceKey();
  if (!key) { console.log('[trial-emails] service key ausente — pulado.'); return { sent: false, reason: 'no_service_key' }; }

  const targets = await fetchTargets(key);
  if (!targets.length) { console.log('[trial-emails] sem alvos hoje.'); return { sent: true, warn: 0, winback: 0, reason: 'no_targets' }; }

  const payload = await loadPayload(key);
  const ledger = (payload.trial_emails && typeof payload.trial_emails === 'object') ? payload.trial_emails : {};
  const unsub = new Set((Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub : []).map((e) => String(e).toLowerCase()));
  const today = todayISO();

  const warnMap = {}; // email -> days_left
  const winMap = {};  // email -> 1
  let count = 0;
  for (const t of targets) {
    const email = String(t.email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') < 1 || unsub.has(email)) continue;
    const kind = (t.kind === 'winback') ? 'winback' : 'warn';
    if (ledger[email] && ledger[email][kind]) continue; // já enviado
    if (count >= MAX_PER_RUN) break;
    if (kind === 'warn') { if (!(email in warnMap)) { warnMap[email] = Math.max(1, (t.days_left | 0) || 2); count++; } }
    else { if (!(email in winMap)) { winMap[email] = 1; count++; } }
  }

  const from = process.env.TRIAL_FROM || process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const warnList = Object.keys(warnMap), winList = Object.keys(winMap);
  let warnSent = 0, winSent = 0;
  if (warnList.length) warnSent = await sendBatch(apiKey, from, 'Sua degustação Endodirect está terminando ⏳', warnList, (to) => warnHtml(warnMap[to]));
  if (winList.length) winSent = await sendBatch(apiKey, from, 'Sua degustação terminou — volte com um plano', winList, () => winbackHtml());

  // Grava o ledger sobre o estado MAIS FRESCO (o envio leva segundos; savePayload
  // reescreve o payload inteiro, então relemos para não reverter o radar/newsletter).
  let toSave = payload;
  try { toSave = await loadPayload(key); } catch (e) { toSave = payload; }
  const led = (toSave.trial_emails && typeof toSave.trial_emails === 'object') ? toSave.trial_emails : {};
  warnList.forEach((e) => { led[e] = Object.assign({}, led[e], { warn: today }); });
  winList.forEach((e) => { led[e] = Object.assign({}, led[e], { winback: today }); });
  toSave.trial_emails = led;
  try { await savePayload(key, toSave); } catch (e) { console.error('[trial-emails] falha ao gravar ledger', e && e.message); }

  console.log(`[trial-emails] warn=${warnSent}/${warnList.length} winback=${winSent}/${winList.length}`);
  return { sent: true, warn: warnSent, winback: winSent };
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPANHA DE RECUPERAÇÃO — "o que mudou desde a sua degustação" (2026-08-03)
//
// Pedido do professor: convidar de volta quem parou. ⚠️ Não é um segundo
// `winbackHtml`: 40 dos 41 do público JÁ receberam aquele e-mail ("sentimos sua
// falta / assine"), o mais recente na véspera. Repetir o mesmo apelo a quem já
// o ignorou é insistência, não convite. Este traz o que NÃO existia quando essa
// pessoa saiu — é o único motivo honesto para escrever de novo.
//
// ⚠️ OS NÚMEROS SÃO CONTADOS NA HORA DO ENVIO, nunca escritos à mão. Número
// chumbado em texto de e-mail envelhece calado, e aqui ele iria para dezenas de
// médicos com a marca da plataforma em cima.
const CAMPANHA = 'novidades_2026_08';   // chave no ledger: cada campanha manda UMA vez

async function contarDiscussoes(key) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_mural_discussoes?select=source_id&limit=1`,
      { headers: { ...serviceHeaders(key), Prefer: 'count=exact' } });
    const cr = r.headers.get('content-range') || '';        // formato "0-0/38"
    const n = parseInt(cr.split('/')[1], 10);
    return Number.isFinite(n) ? n : 0;
  } catch (e) { return 0; }
}
function contarDiretrizes(payload) {
  const lista = Array.isArray(payload && payload.diretrizes) ? payload.diretrizes : [];
  const vivos = lista.filter((d) => d && String(d.rascunho) !== 'true');
  return {
    artigos: vivos.filter((d) => String(d.tipo) === 'artigo').length,
    capitulos: vivos.filter((d) => String(d.tipo || 'capitulo') !== 'artigo').length
  };
}
function novidadesHtml(n) {
  const cta = publicBase() + '/#planos';
  const item = (titulo, corpo) =>
    `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 14px">`
    + `<b style="color:#13294b">${esc(titulo)}</b> ${corpo}</p>`;
  return shell(
    `<h1 style="font-size:22px;color:#13294b;margin:0 0 14px">O que entrou no Endodirect desde a sua degustação</h1>`
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 18px">Você testou a plataforma e não seguiu. Escrevo porque ela mudou bastante desde então, e vale um minuto saber o quê.</p>`
    + item('Fichas visuais dos ensaios pivotais.',
        `${n.artigos} estudos — UKPDS 33, EMPA-REG, LEADER, SURMOUNT, SELECT, FOURIER, FIT, FREEDOM, entre outros — cada um com desenho, população, desfecho primário e limitações numa página só.`)
    + item('Discussão completa dos artigos de acesso aberto.',
        `${n.discussoes} artigos lidos no <b>texto integral</b>, não no resumo: o que o estudo mediu de fato, o que os autores admitem como limitação e o que muda na conduta.`)
    + item(`${n.capitulos} capítulos de diretriz`,
        `por subespecialidade, com pontos-chave, flashcards e mapas mentais.`)
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 4px">Além da Questão do Dia, simulado por banca, calculadoras e o consultório com prescrição.</p>`
    + btn(cta, 'Ver os planos')
    + `<p style="font-size:13px;color:#8a93a6;margin:18px 0 0">Equipe Endodirect</p>`
  );
}

// Dispara a campanha. Idempotente pela chave CAMPANHA no ledger: rodar o cron de
// novo não reenvia para ninguém.
async function sendWinbackNovidades() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log('[novidades] RESEND_API_KEY ausente — pulado.'); return { sent: false, reason: 'no_api_key' }; }
  const key = serviceKey();
  if (!key) { console.log('[novidades] service key ausente — pulado.'); return { sent: false, reason: 'no_service_key' }; }

  let alvos = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/endodirect_winback_targets`, {
      method: 'POST', headers: serviceHeaders(key), body: JSON.stringify({ p_dias: 7 })
    });
    if (!r.ok) { console.error('[novidades] RPC HTTP', r.status); return { sent: false, reason: 'rpc_error' }; }
    alvos = await r.json().catch(() => []);
  } catch (e) { console.error('[novidades] RPC erro:', e && e.message); return { sent: false, reason: 'rpc_error' }; }
  if (!Array.isArray(alvos) || !alvos.length) { console.log('[novidades] sem alvos.'); return { sent: true, enviados: 0, reason: 'no_targets' }; }

  const payload = await loadPayload(key);
  const ledger = (payload.trial_emails && typeof payload.trial_emails === 'object') ? payload.trial_emails : {};
  const unsub = new Set((Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub : []).map((e) => String(e).toLowerCase()));

  const lista = [];
  for (const t of alvos) {
    const email = String(t.email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') < 1 || unsub.has(email)) continue;
    if (ledger[email] && ledger[email][CAMPANHA]) continue;      // já recebeu esta campanha
    if (lista.length >= MAX_PER_RUN) break;
    if (lista.indexOf(email) < 0) lista.push(email);
  }
  if (!lista.length) { console.log('[novidades] todos já receberam.'); return { sent: true, enviados: 0, reason: 'ja_enviados' }; }

  const n = Object.assign({ discussoes: await contarDiscussoes(key) }, contarDiretrizes(payload));
  // ⚠️ Sem conteúdo para anunciar, não há e-mail: melhor não escrever do que
  // escrever "0 estudos". Só acontece se o payload vier vazio/torto.
  if (!n.artigos && !n.capitulos && !n.discussoes) {
    console.error('[novidades] contagens zeradas — envio abortado.');
    return { sent: false, reason: 'sem_conteudo' };
  }

  const from = process.env.TRIAL_FROM || process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const enviados = await sendBatch(apiKey, from, 'O que entrou no Endodirect desde a sua degustação', lista, () => novidadesHtml(n));

  // Grava sobre o estado MAIS FRESCO: o envio leva segundos e savePayload
  // reescreve o payload inteiro (mesmo cuidado do resto do arquivo).
  let toSave = payload;
  try { toSave = await loadPayload(key); } catch (e) { toSave = payload; }
  const led = (toSave.trial_emails && typeof toSave.trial_emails === 'object') ? toSave.trial_emails : {};
  const hoje = todayISO();
  lista.forEach((e) => { led[e] = Object.assign({}, led[e], { [CAMPANHA]: hoje }); });
  toSave.trial_emails = led;
  try { await savePayload(key, toSave); } catch (e) { console.error('[novidades] falha ao gravar ledger', e && e.message); }

  console.log(`[novidades] enviados ${enviados}/${lista.length} (artigos=${n.artigos} capitulos=${n.capitulos} discussoes=${n.discussoes})`);
  return { sent: true, enviados, alvos: lista.length, conteudo: n };
}

// ─────────────────────────────────────────────────────────────────────────────
// REENGAJAMENTO — assinante PAGANTE parado há 14+ dias (pedido do professor,
// 05/08/2026, a partir do card do Analytics "Assinantes sem acesso há 14+ dias").
//
// ⚠️ DIFERENÇA CRÍTICA PARA AS CAMPANHAS ACIMA: aquelas são de disparo único
// (chave no ledger => nunca repete). Esta é PERMANENTE e a condição não expira
// sozinha — quem está parado hoje continua parado amanhã. Sem cooldown, as
// mesmas pessoas receberiam o mesmo e-mail todo dia até cancelarem. Quem
// segura isso é a RPC (p_cooldown, 30 dias), e o ledger guarda a data do
// último envio em trial_emails[email].reengajamento.
//
// ⚠️ TÍTULOS E NÚMEROS SÃO LIDOS NA HORA DO ENVIO. É um e-mail que diz "olha o
// que você perdeu": título chumbado em código envelhece calado e vira mentira
// na caixa de quem paga.
const REENG_DIAS = 14;         // ausência que dispara
const REENG_COOLDOWN = 30;     // dias mínimos entre dois e-mails para a mesma pessoa
const REENG_JANELA_MS = 30 * 24 * 60 * 60 * 1000;  // "novidades" = últimos 30 dias

// Títulos novos do mural, por tipo. Lê radar_avisos + adm_avisos (o mural do
// aluno é a soma dos dois) e devolve os mais recentes de cada tipo pedido.
function novidadesDoMural(payload, tipos, limite, agoraMs) {
  const agora = agoraMs || Date.now();
  const todos = []
    .concat(Array.isArray(payload.radar_avisos) ? payload.radar_avisos : [])
    .concat(Array.isArray(payload.adm_avisos) ? payload.adm_avisos : []);
  // O que o professor apagou não pode reaparecer num e-mail (ver radar_hidden).
  const ocultos = new Set((Array.isArray(payload.radar_hidden) ? payload.radar_hidden : []).map(String));
  const chave = (it) => String((it && (it.sourceId || it.link || it.titulo)) || '');
  const vistos = new Set();
  return todos
    .filter((it) => it && it.titulo && tipos.indexOf(String(it.tipo || '')) >= 0)
    .filter((it) => !ocultos.has(chave(it)))
    .filter((it) => (Number(it.at) || 0) > agora - REENG_JANELA_MS)
    .sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0))
    // ⚠️ Dedup TOLERANTE a pontuação. O radar colhe a mesma revisão por dois
    // caminhos (RSS e PubMed) e um deles traz o ponto final no título: com
    // comparação literal, "…neuroendocrine neoplasms" e "…neoplasms." passavam
    // como dois itens e o e-mail sairia repetindo a mesma linha. Achado nos
    // títulos REAIS do mural, não em teste inventado.
    .filter((it) => {
      const t = String(it.titulo).toLowerCase().replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim();
      if (!t || vistos.has(t)) return false;
      vistos.add(t); return true;
    })
    .slice(0, limite)
    .map((it) => ({ titulo: String(it.titulo).trim(), fonte: String(it.fonte || it.sourceName || '').trim() }));
}

function reengajamentoHtml(dados, nome, emailTo) {
  const cta = publicBase() + '/';
  const primeiro = String(nome || '').trim().split(/\s+/)[0] || '';
  const ola = primeiro ? `Oi, ${esc(primeiro)} 👋` : 'Oi 👋';
  const lista = (itens) => `<ul style="font-size:14px;color:#39435a;line-height:1.6;margin:0 0 16px;padding-left:20px">`
    + itens.map((i) => `<li style="margin-bottom:7px"><b style="color:#13294b">${esc(i.titulo)}</b>${i.fonte ? ` <span style="color:#8a93a6">— ${esc(i.fonte)}</span>` : ''}</li>`).join('')
    + `</ul>`;
  const bloco = (titulo, itens) => itens.length
    ? `<p style="font-size:15px;color:#13294b;font-weight:700;margin:0 0 8px">${titulo}</p>` + lista(itens)
    : '';
  const n = dados.conteudo || {};
  const ferramentas = [];
  if (n.artigos) ferramentas.push(`<li><b>Fichas dos ensaios pivotais</b> — ${n.artigos} estudos com desenho, população, desfecho e limitações numa página só.</li>`);
  if (n.discussoes) ferramentas.push(`<li><b>Discussão completa de artigos de acesso aberto</b> — ${n.discussoes} artigos lidos no texto integral, não no resumo.</li>`);
  if (n.capitulos) ferramentas.push(`<li><b>Resumos por subespecialidade</b> — ${n.capitulos} capítulos com pontos-chave, flashcards e mapas mentais.</li>`);
  return shell(
    `<h1 style="font-size:22px;color:#13294b;margin:0 0 12px">${ola}</h1>`
    + `<p style="font-size:15px;color:#39435a;line-height:1.65;margin:0 0 18px">Faz um tempo que você não abre o Endodirect, e entrou coisa nova no mural nesse meio-tempo. Um resumo do que você perdeu:</p>`
    + bloco('🔬 Artigos de revisão', dados.revisoes)
    + bloco('📋 Diretrizes e consensos', dados.diretrizes)
    + (ferramentas.length
      ? `<p style="font-size:15px;color:#13294b;font-weight:700;margin:18px 0 8px">E no estudo</p>`
        + `<ul style="font-size:14px;color:#39435a;line-height:1.7;margin:0 0 6px;padding-left:20px">${ferramentas.join('')}</ul>`
      : '')
    + btn(cta, 'Abrir a plataforma')
    + `<p style="font-size:12px;color:#8a93a6;margin:18px 0 0">Seu acesso está ativo — é só entrar.`
    + (emailTo ? ` Se preferir não receber estes avisos, <a href="${esc(unsubUrl(emailTo))}" style="color:#8a93a6">descadastre-se aqui</a>.` : '')
    + `</p>`
  );
}

// Dispara o reengajamento. Fail-safe: qualquer pré-condição ausente => pula.
async function sendReengajamento() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log('[reengajamento] RESEND_API_KEY ausente — pulado.'); return { sent: false, reason: 'no_api_key' }; }
  const key = serviceKey();
  if (!key) { console.log('[reengajamento] service key ausente — pulado.'); return { sent: false, reason: 'no_service_key' }; }

  let alvos = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/endodirect_reengajamento_alvos`, {
      method: 'POST', headers: serviceHeaders(key),
      body: JSON.stringify({ p_dias: REENG_DIAS, p_cooldown: REENG_COOLDOWN })
    });
    if (!r.ok) { console.error('[reengajamento] RPC HTTP', r.status); return { sent: false, reason: 'rpc_error' }; }
    alvos = await r.json().catch(() => []);
  } catch (e) { console.error('[reengajamento] RPC erro:', e && e.message); return { sent: false, reason: 'rpc_error' }; }
  if (!Array.isArray(alvos) || !alvos.length) { console.log('[reengajamento] ninguém parado hoje.'); return { sent: true, enviados: 0, reason: 'no_targets' }; }

  const payload = await loadPayload(key);
  // A RPC já filtra o opt-out; repetido aqui porque o payload pode ter mudado
  // entre a consulta e o envio, e mandar para quem descadastrou é imperdoável.
  const unsub = new Set((Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub : []).map((e) => String(e).toLowerCase()));
  const nomePorEmail = {};
  const lista = [];
  for (const t of alvos) {
    const email = String(t.email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') < 1 || unsub.has(email)) continue;
    if (lista.length >= MAX_PER_RUN) break;
    if (lista.indexOf(email) < 0) { lista.push(email); nomePorEmail[email] = t.nome || ''; }
  }
  if (!lista.length) { console.log('[reengajamento] nada a enviar.'); return { sent: true, enviados: 0, reason: 'no_targets' }; }

  const revisoes = novidadesDoMural(payload, ['Artigo de Revisão'], 6);
  const diretrizes = novidadesDoMural(payload, ['Diretriz', 'Consenso'], 4);
  // ⚠️ Sem novidade no mural, NÃO manda. O e-mail inteiro é "olha o que entrou";
  // sem título nenhum ele vira spam de "volte, por favor".
  if (!revisoes.length && !diretrizes.length) {
    console.log('[reengajamento] nenhuma novidade no mural na janela — envio pulado.');
    return { sent: true, enviados: 0, reason: 'sem_novidades' };
  }
  const conteudo = Object.assign({ discussoes: await contarDiscussoes(key) }, contarDiretrizes(payload));
  const dados = { revisoes, diretrizes, conteudo };

  const from = process.env.TRIAL_FROM || process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const enviados = await sendBatch(apiKey, from, 'O que entrou no Endodirect enquanto você esteve fora', lista,
    (to) => reengajamentoHtml(dados, nomePorEmail[to], to));

  let toSave = payload;
  try { toSave = await loadPayload(key); } catch (e) { toSave = payload; }
  const led = (toSave.trial_emails && typeof toSave.trial_emails === 'object') ? toSave.trial_emails : {};
  const hoje = todayISO();
  lista.forEach((e) => { led[e] = Object.assign({}, led[e], { reengajamento: hoje }); });
  toSave.trial_emails = led;
  try { await savePayload(key, toSave); } catch (e) { console.error('[reengajamento] falha ao gravar ledger', e && e.message); }

  console.log(`[reengajamento] enviados ${enviados}/${lista.length} (revisões=${revisoes.length} diretrizes=${diretrizes.length})`);
  return { sent: true, enviados, alvos: lista.length, revisoes: revisoes.length, diretrizes: diretrizes.length };
}

module.exports = {
  sendTrialEmails, sendWinbackNovidades, sendReengajamento,
  warnHtml, winbackHtml, novidadesHtml, reengajamentoHtml, novidadesDoMural,
  CAMPANHA, REENG_DIAS, REENG_COOLDOWN
};
