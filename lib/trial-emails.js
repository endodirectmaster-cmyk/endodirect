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
  const logo = publicBase() + '/icon-192.png';
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

module.exports = { sendTrialEmails, warnHtml, winbackHtml };
