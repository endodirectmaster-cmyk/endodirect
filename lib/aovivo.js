// Endodirect — Aviso da AULA AO VIVO (e-mail + notificação no celular).
//
// Pedido do professor (06/08/2026): transmitir aula dentro da plataforma para
// "chamar mais pessoas para entrar". A aula é aberta a QUALQUER pessoa
// cadastrada (inclusive degustação); a gravação, só a assinante.
//
// ⚠️ Por que só um aviso "hoje tem aula", e não "faltam 10 minutos": o plano
// limita os cron jobs e a plataforma já usa os dois que tem (radar 10:30 UTC,
// healthcheck 13:00 UTC). Somar uma função serverless também não dá — a Vercel
// está em 12/12. Então o aviso pega carona no cron diário e sai no DIA da aula.
// O "faltam poucos minutos" é resolvido no cliente: o painel conta o tempo
// sozinho e troca para o player na hora, sem F5 (ver aoVivoIniciarPoll).
//
// Idempotente: grava em endodirect_global_state.payload.aovivo_sent
// ({ '<id da aula>': { dia: 'YYYY-MM-DD' } }). Essa chave está na lista de chaves
// do servidor do gatilho endodirect_global_preserve_server_keys — sem isso, um
// save do painel do professor apagaria o registro e o aviso sairia de novo.
//
// Respeita os mesmos opt-outs da newsletter (payload.newsletter_unsub) e manda
// List-Unsubscribe de 1 clique.

const crypto = require('crypto');
const { sendToAll } = require('./push');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const MAX_PER_RUN = 500; // trava contra disparo em massa

function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || ''; }
function serviceHeaders(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function publicBase() { return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, ''); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
async function marcarEnviado(key, payload, aulaId, dia) {
  const sent = Object.assign({}, payload.aovivo_sent || {});
  sent[aulaId] = { dia };
  await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main`, {
    method: 'PATCH',
    headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
    body: JSON.stringify({ payload: Object.assign({}, payload, { aovivo_sent: sent }) })
  });
}

// Destinatários: todo mundo com e-mail no app_state, menos admins e quem optou
// por sair. A aula é aberta a cadastrado, então NÃO se filtra por assinatura —
// é justamente o não-assinante que se quer trazer de volta.
async function destinatarios(key, unsub) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_app_state?select=email&limit=2000`, { headers: serviceHeaders(key) });
  if (!r.ok) return [];
  const rows = await r.json().catch(() => []);
  const admins = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_admins?select=email`, { headers: serviceHeaders(key) })
    .then((x) => (x.ok ? x.json() : [])).catch(() => []);
  const admSet = new Set((admins || []).map((a) => String(a.email || '').toLowerCase()));
  const vistos = new Set();
  const out = [];
  for (const row of rows || []) {
    const e = String(row.email || '').trim().toLowerCase();
    if (!e || !e.includes('@')) continue;
    if (admSet.has(e) || unsub.has(e) || vistos.has(e)) continue;
    if (e.endsWith('@endodirect.com.br')) continue; // contas de teste/demo
    vistos.add(e);
    out.push(e);
    if (out.length >= MAX_PER_RUN) break;
  }
  return out;
}

function horaBR(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

function corpoHtml(aula, email) {
  const url = `${publicBase()}/#aovivo`;
  const hora = horaBR(aula.inicio);
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:28px 20px;color:#e6ecf5">
  <img src="${publicBase()}/icons/icon-192.png" width="44" height="44" alt="Endodirect" style="border-radius:10px;display:block;margin-bottom:18px">
  <div style="display:inline-block;background:#e5484d;color:#fff;font-size:12px;font-weight:700;letter-spacing:.05em;padding:4px 10px;border-radius:999px">HOJE, AO VIVO</div>
  <h1 style="font-size:24px;line-height:1.3;margin:14px 0 6px;color:#fff">${esc(aula.titulo || 'Aula ao vivo')}</h1>
  ${hora ? `<p style="font-size:15px;color:#9fb0c9;margin:0 0 14px">Hoje às <b style="color:#e6ecf5">${esc(hora)}</b> (horário de Brasília)</p>` : ''}
  ${aula.desc ? `<p style="font-size:15px;line-height:1.65;color:#c9d6e8;margin:0 0 18px">${esc(aula.desc)}</p>` : ''}
  <a href="${url}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px">Assistir na plataforma →</a>
  <p style="font-size:13px;line-height:1.6;color:#8b9cb5;margin:20px 0 0">A aula acontece <b>dentro do Endodirect</b> e é aberta a qualquer pessoa cadastrada. A <b>gravação</b> fica depois em Cursos, para quem assina.</p>
  <hr style="border:0;border-top:1px solid #1e2a40;margin:26px 0 14px">
  <p style="font-size:11px;color:#6b7a93;margin:0">Você recebe este aviso porque tem conta no Endodirect. <a href="${unsubUrl(email)}" style="color:#6b7a93">Descadastrar</a>.</p>
</div></body></html>`;
}

// Envia o aviso do DIA da aula. Retorna um resumo — nunca lança (o cron não pode
// cair por causa disto).
async function sendAvisoAoVivo() {
  const key = serviceKey();
  if (!key) return { ok: false, skipped: 'sem service key' };
  const payload = await loadPayload(key);
  const aula = payload.aovivo;
  if (!aula || typeof aula !== 'object' || !aula.inicio || !aula.titulo) return { ok: true, skipped: 'sem aula agendada' };
  if (aula.arquivada) return { ok: true, skipped: 'aula arquivada' };

  const ini = Date.parse(aula.inicio);
  if (!isFinite(ini)) return { ok: true, skipped: 'inicio invalido' };
  const agora = Date.now();
  // Só avisa se a aula é HOJE e ainda não começou. Aula que já passou não gera
  // e-mail (seria convite para uma sala vazia).
  if (ini < agora) return { ok: true, skipped: 'aula ja comecou ou passou' };
  if (ini - agora > 24 * 3600 * 1000) return { ok: true, skipped: 'ainda falta mais de 24h' };

  const aulaId = String(aula.id || aula.inicio);
  const jaEnviado = (payload.aovivo_sent || {})[aulaId];
  if (jaEnviado) return { ok: true, skipped: 'ja avisado', aulaId };

  const unsub = new Set((Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub : []).map((e) => String(e || '').toLowerCase()));
  const lista = await destinatarios(key, unsub);

  // Notificação no celular: vai para todas as inscrições de push, sem depender
  // do e-mail. É o canal que mais funciona para "começa hoje".
  let push = { sent: 0 };
  try {
    push = await sendToAll({
      title: '🔴 Hoje ao vivo: ' + String(aula.titulo || '').slice(0, 60),
      body: (horaBR(aula.inicio) ? 'Às ' + horaBR(aula.inicio) + '. ' : '') + 'Assista dentro do Endodirect.',
      url: '/#aovivo'
    });
  } catch (e) { push = { sent: 0, error: (e && e.message) || String(e) }; }

  const RESEND = process.env.RESEND_API_KEY;
  if (!RESEND || !lista.length) {
    if (lista.length || push.sent) await marcarEnviado(key, payload, aulaId, new Date().toISOString().slice(0, 10));
    return { ok: true, emails: 0, push: push.sent || 0, motivo: RESEND ? 'sem destinatarios' : 'sem RESEND_API_KEY' };
  }

  const from = process.env.TRIAL_FROM || process.env.NEWSLETTER_FROM || 'Endodirect <noticias@endodirect.com.br>';
  const assunto = '🔴 Hoje ao vivo: ' + String(aula.titulo || 'aula no Endodirect');
  let enviados = 0;
  for (const lote of chunk(lista, 50)) {
    const body = lote.map((email) => ({
      from,
      to: [email],
      subject: assunto,
      html: corpoHtml(aula, email),
      headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
    }));
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.ok) enviados += lote.length;
    } catch (e) { /* lote falho não derruba o cron */ }
  }
  await marcarEnviado(key, payload, aulaId, new Date().toISOString().slice(0, 10));
  return { ok: true, emails: enviados, push: push.sent || 0, aulaId, titulo: aula.titulo };
}

module.exports = { sendAvisoAoVivo };
