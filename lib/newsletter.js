// Endodirect — Newsletter diária por e-mail (Resend).
// Envia os 3 artigos mais relevantes do dia (calculados pelo radar) para todos
// os membros. Acionada SÓ pelo cron diário (não pelo refresh manual do admin),
// com trava de idempotência (1 envio por dia) gravada em endodirect_global_state.
//
// Descadastro: link único por destinatário (token HMAC) + cabeçalhos
// List-Unsubscribe (botão nativo do Gmail/Outlook). Opt-outs ficam em
// payload.newsletter_unsub e são filtrados no envio.
//
// Variáveis de ambiente para o envio:
//   RESEND_API_KEY        — chave da API do Resend (sem ela, o envio é pulado)
//   NEWSLETTER_FROM       — remetente verificado, ex.: "Endodirect <newsletter@endodirect.com.br>"
//   NEWSLETTER_REPLYTO    — (opcional) e-mail de resposta
//   PUBLIC_BASE_URL       — (opcional) base do site, ex.: https://www.endodirect.com.br
//   NEWSLETTER_SECRET     — (opcional) segredo p/ assinar links; cai no service key se ausente
//   SUPABASE_SERVICE_ROLE_KEY — ler membros, gravar trava e opt-outs

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}
function serviceHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
function publicBase() {
  return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, '');
}
function unsubSecret() {
  return process.env.NEWSLETTER_SECRET || serviceKey() || 'endodirect-newsletter';
}
function unsubToken(email) {
  return crypto.createHmac('sha256', unsubSecret()).update(String(email || '').trim().toLowerCase()).digest('hex').slice(0, 32);
}
function unsubUrl(email) {
  const e = encodeURIComponent(String(email || '').trim().toLowerCase());
  return `${publicBase()}/api/newsletter/unsubscribe?e=${e}&t=${unsubToken(email)}`;
}

function dateBR(d) {
  const dt = d || new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(dt.getUTCDate())}/${p(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function chunk(arr, size) { const o = []; for (let i = 0; i < arr.length; i += size) o.push(arr.slice(i, i + size)); return o; }

// ── Priorização editorial da newsletter ───────────────────────────────────
// 1º) Revisões/metanálises/diretrizes (síntese de evidência).
// 2º) Ensaios clínicos e artigos originais.
// Desempate por revista: NEJM → Lancet → demais revistas de impacto.
// Por fim, o mais recente primeiro.
function articleTypeTier(tipo) {
  const t = String(tipo || '').toLowerCase();
  if (t.indexOf('revis') >= 0 || t.indexOf('metanal') >= 0 || t.indexOf('meta-anal') >= 0 || t.indexOf('diretriz') >= 0 || t.indexOf('consenso') >= 0) return 0;
  return 1; // ensaios clínicos e artigos originais
}
function journalRank(fonte) {
  const f = String(fonte || '').toLowerCase();
  if (f.indexOf('new england') >= 0 || f.indexOf('n engl j med') >= 0 || f.indexOf('nejm') >= 0) return 0;
  if (f.indexOf('lancet') >= 0) return 1;
  return 2; // demais revistas de impacto
}
function rankArticles(items) {
  return (Array.isArray(items) ? items : []).map((a, i) => ({ a, i })).sort((x, y) => {
    const ta = articleTypeTier(x.a.tipo), tb = articleTypeTier(y.a.tipo);
    if (ta !== tb) return ta - tb;
    const ja = journalRank(x.a.fonte), jb = journalRank(y.a.fonte);
    if (ja !== jb) return ja - jb;
    const da = Date.parse(x.a.data) || 0, db = Date.parse(y.a.data) || 0;
    if (da !== db) return db - da; // mais recente primeiro
    return x.i - y.i; // estável
  }).map((o) => o.a);
}

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

// Registra um opt-out (chamado pelo endpoint /api/newsletter/unsubscribe).
async function addUnsubscribe(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e || e.indexOf('@') < 1) return false;
  const key = serviceKey();
  if (!key) return false;
  const payload = await loadPayload(key);
  const list = Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub.slice() : [];
  if (list.indexOf(e) < 0) {
    list.push(e);
    payload.newsletter_unsub = list;
    await savePayload(key, payload);
  }
  return true;
}

// Lista os e-mails de todos os membros via Admin API do Supabase (paginado).
async function getMemberEmails(key) {
  const out = new Set();
  for (let page = 1; page <= 50; page++) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: serviceHeaders(key) });
    if (!r.ok) break;
    const data = await r.json().catch(() => ({}));
    const users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
    users.forEach((u) => { const e = (u && u.email || '').trim().toLowerCase(); if (e && e.indexOf('@') > 0) out.add(e); });
    if (users.length < 200) break;
  }
  return [...out];
}

function renderEmail(items, replyTo, unsub) {
  const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const n = items.length;
  const blocos = items.map((a, i) => {
    const isReview = articleTypeTier(a.tipo) === 0;
    const tipoBadge = a.tipo ? `<span style="display:inline-block;background:${isReview ? '#e6f6ef' : '#eef2ff'};color:${isReview ? '#0f7a52' : '#3730a3'};border-radius:999px;padding:5px 12px;font-size:13px;font-weight:700;margin:0 8px 8px 0">${esc(a.tipo)}</span>` : '';
    const subBadge = a.subespecialidade ? `<span style="display:inline-block;background:#f1f3f8;color:#475569;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600;margin:0 8px 8px 0">${esc(a.subespecialidade)}</span>` : '';
    return `<tr><td class="pad" style="padding:24px 0;border-top:2px solid #eef1f6">
      <div style="font-size:13px;color:#8a93a6;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px">Artigo ${i + 1} de ${n}${a.data ? ' · ' + esc(a.data) : ''}</div>
      <div style="margin-bottom:10px">${tipoBadge}${subBadge}</div>
      <a class="art-title" href="${esc(a.link)}" style="font-size:23px;font-weight:800;color:#13294b;text-decoration:none;line-height:1.4;display:block">${esc(a.titulo)}</a>
      <div style="font-size:15px;color:#2563eb;font-weight:700;margin:8px 0 14px">${esc(a.fonte)}</div>
      <div class="art-body" style="font-size:17px;color:#1f2937;line-height:1.72">${esc(a.resumo)}</div>
      ${a.porque ? `<div class="art-body" style="margin-top:16px;background:#f4f7fc;border-left:4px solid #2563eb;border-radius:10px;padding:14px 16px;font-size:16px;color:#374151;line-height:1.65"><b style="color:#13294b">Por que importa:</b> ${esc(a.porque)}</div>` : ''}
      <div style="margin-top:18px"><a href="${esc(a.link)}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">Ler o artigo →</a></div>
    </td></tr>`;
  }).join('');
  const logo = publicBase() + '/Icone%20-%20MD%202.png';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{margin:0;padding:0;background:#ffffff;}
    img{border:0;}
    a{text-decoration:none;}
    @media only screen and (max-width:600px){
      .pad{padding-left:18px !important;padding-right:18px !important;}
      .hpad{padding-left:18px !important;padding-right:18px !important;}
      .art-title{font-size:21px !important;}
      .art-body{font-size:16px !important;}
      .brand{font-size:23px !important;}
    }
  </style></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:${FONT}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff">
    <tr><td class="hpad" style="background:#13294b;padding:26px 36px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;padding-right:14px"><img src="${logo}" width="44" height="44" alt="Endodirect" style="display:block;width:44px;height:44px"></td>
        <td style="vertical-align:middle">
          <div class="brand" style="color:#ffffff;font-size:27px;font-weight:800;letter-spacing:.2px;font-family:${FONT}">Endodirect</div>
          <div style="color:#b9c6dc;font-size:15px;margin-top:4px;font-family:${FONT}">Os artigos mais relevantes do dia · ${dateBR()}</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td class="pad" style="padding:6px 36px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${blocos}</table>
    </td></tr>
    <tr><td class="pad" style="padding:22px 36px;background:#f7f9fc;border-top:1px solid #e5e7eb">
      <div style="font-size:14px;color:#6b7280;line-height:1.65;font-family:${FONT}">Seleção do radar Endodirect entre as principais revistas de endocrinologia. Conteúdo educacional — confira sempre a fonte original.</div>
      <div style="font-size:13px;color:#9ca3af;margin-top:10px;font-family:${FONT}">Você recebe este e-mail por ser membro do Endodirect. <a href="${esc(unsub)}" style="color:#6b7280;text-decoration:underline">Cancelar inscrição</a>.</div>
    </td></tr>
  </table></body></html>`;
}

// itemsFor: função (email) => [artigos] — permite personalizar por destinatário
// (subespecialidades de interesse). Aceita também um array fixo (mesmos itens p/ todos).
async function sendViaResend(apiKey, from, replyTo, subject, recipients, itemsFor) {
  const resolve = (typeof itemsFor === 'function') ? itemsFor : (() => itemsFor || []);
  let sent = 0;
  for (const part of chunk(recipients, 100)) {
    const batch = part.map((to) => {
      const u = unsubUrl(to);
      const m = {
        from, to: [to], subject,
        html: renderEmail(resolve(to), replyTo, u),
        headers: {
          'List-Unsubscribe': `<${u}>` + (replyTo ? `, <mailto:${replyTo}?subject=unsubscribe>` : ''),
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      };
      if (replyTo) m.reply_to = replyTo;
      return m;
    });
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    if (r.ok) sent += part.length;
    else { const t = await r.text().catch(() => ''); console.error('[newsletter] Resend HTTP', r.status, t.slice(0, 300)); }
  }
  return sent;
}

// Envia a newsletter do dia. Fail-safe: qualquer pré-condição ausente => pula.
async function sendDailyNewsletter(topArticles) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log('[newsletter] RESEND_API_KEY ausente — envio pulado.'); return { sent: false, reason: 'no_api_key' }; }
  const key = serviceKey();
  if (!key) { console.log('[newsletter] service key ausente — pulado.'); return { sent: false, reason: 'no_service_key' }; }

  const payload = await loadPayload(key);
  const today = todayISO();
  if (payload.newsletter_sent === today) { console.log('[newsletter] já enviada hoje — pulado.'); return { sent: false, reason: 'already_sent' }; }

  // Candidatos: os 3 do radar (do dia) + o pool recente do mural, deduplicados.
  // Em seguida ordenamos pela priorização editorial (revisões → ensaios/originais;
  // NEJM → Lancet → demais) e pegamos os 3 primeiros — assim uma revisão de alto
  // impacto pode ser destacada mesmo que não esteja entre os 3 de maior score.
  let items = Array.isArray(topArticles) ? topArticles.filter((a) => a && a.titulo && a.resumo) : [];
  const seenCand = new Set(items.map((a) => a.link || a.titulo));
  muralItems(payload).forEach((a) => { if (a && a.titulo && a.resumo) { const k = a.link || a.titulo; if (!seenCand.has(k)) { seenCand.add(k); items.push(a); } } });
  items = rankArticles(items);
  if (items.length < 3) { console.log('[newsletter] menos de 3 artigos disponíveis — pulado.'); return { sent: false, reason: 'few_articles' }; }

  const unsub = new Set((Array.isArray(payload.newsletter_unsub) ? payload.newsletter_unsub : []).map((e) => String(e).toLowerCase()));
  // Membros (Supabase) + lista extra manual (payload.newsletter_extra), deduplicada e sem opt-outs.
  const extra = (Array.isArray(payload.newsletter_extra) ? payload.newsletter_extra : [])
    .map((e) => String(e || '').trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  const everyone = new Set([...(await getMemberEmails(key)), ...extra]);
  const recipients = [...everyone].filter((e) => !unsub.has(e));
  if (!recipients.length) { console.log('[newsletter] sem destinatários (após opt-outs) — pulado.'); return { sent: false, reason: 'no_recipients' }; }

  const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const replyTo = process.env.NEWSLETTER_REPLYTO || '';
  const top3 = items.slice(0, 3);
  const subject = `Endodirect — 3 artigos do dia (${dateBR()})`;

  // Personalização por subespecialidade: cada aluno recebe os 3 artigos dos seus
  // temas de interesse (se não escolheu nenhum, recebe os 3 gerais do dia).
  const pool = rankArticles(muralItems(payload).filter((a) => a && a.titulo && a.resumo));
  const prefs = await getMemberPrefs(key);
  function itemsFor(email) {
    const subs = prefs[email];
    if (!Array.isArray(subs) || !subs.length) return top3;
    const want = new Set(subs);
    const sel = pool.filter((a) => want.has(a.subespecialidade)).slice(0, 3);
    if (sel.length < 3) {
      const seen = new Set(sel.map((a) => a.link || a.titulo));
      for (const a of pool) { if (sel.length >= 3) break; const k = a.link || a.titulo; if (!seen.has(k)) { seen.add(k); sel.push(a); } }
    }
    return sel.length ? sel : top3;
  }
  const sent = await sendViaResend(apiKey, from, replyTo, subject, recipients, itemsFor);

  // Relê o estado MAIS RECENTE antes de gravar a trava de idempotência. O envio
  // acima leva vários segundos; nesse intervalo o radar (cron/refresh) ou o
  // admin podem ter gravado. Como savePayload reescreve o payload INTEIRO, usar
  // o snapshot antigo (lido lá em cima) reverteria radar_avisos/adm_avisos. Aqui
  // só tocamos as duas chaves de newsletter sobre o estado fresco.
  let toSave = payload;
  try { toSave = await loadPayload(key); } catch (e) { toSave = payload; }
  toSave.newsletter_sent = today;
  toSave.newsletter = { date: today, items: top3 };
  try { await savePayload(key, toSave); } catch (e) { console.error('[newsletter] falha ao gravar trava', e && e.message); }
  console.log(`[newsletter] enviada para ${sent}/${recipients.length} destinatários.`);
  return { sent: true, recipients: recipients.length, delivered: sent };
}

// ── Teste: envia uma prévia só para um endereço, usando os artigos atuais do
// mural (sem rodar o radar, sem trava de idempotência). Para validar formato,
// remetente e link de descadastro antes do envio em massa.
function extractFromTexto(texto) {
  const t = String(texto || '');
  const grab = (re) => { const m = t.match(re); return m ? m[1].trim() : ''; };
  return {
    resumo: grab(/📝\s*Resumo:\s*([\s\S]*?)(?:\n\s*[💡⚠🔗]|$)/),
    porque: grab(/💡\s*Por que importa[^:]*:\s*([\s\S]*?)(?:\n\s*[⚠🔗]|$)/)
  };
}
// Todos os artigos do mural (não-breaking) mapeados para o formato do e-mail.
function muralItems(payload) {
  const list = Array.isArray(payload.radar_avisos) ? payload.radar_avisos : [];
  return list.filter((a) => a && a.breaking !== true && a.titulo).map((a) => {
    const ex = extractFromTexto(a.texto);
    return {
      titulo: a.titulo,
      resumo: ex.resumo || String(a.texto || '').replace(/\n/g, ' ').slice(0, 300),
      porque: ex.porque,
      fonte: a.fonte || '',
      tipo: a.studyType || '',
      subespecialidade: a.subespecialidade || '',
      data: a.publicationDate || '',
      link: a.link || ''
    };
  });
}
function topFromMural(payload) { return rankArticles(muralItems(payload)).slice(0, 3); }

// Mapa email -> subespecialidades de interesse, lido do app_state de cada aluno.
async function getMemberPrefs(key) {
  const map = {};
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_app_state?select=email,subs:payload->user_profile->newsletterSubs`, { headers: serviceHeaders(key) });
    if (r.ok) {
      const rows = await r.json().catch(() => []);
      rows.forEach((row) => {
        const e = String((row && row.email) || '').trim().toLowerCase();
        const subs = row && row.subs;
        if (e && Array.isArray(subs) && subs.length) map[e] = subs;
      });
    }
  } catch (e) { /* sem prefs => todos recebem tudo */ }
  return map;
}
async function sendTestNewsletter(toEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'no_api_key' };
  const to = String(toEmail || '').trim().toLowerCase();
  if (!to || to.indexOf('@') < 1) return { sent: false, reason: 'bad_email' };
  const key = serviceKey();
  if (!key) return { sent: false, reason: 'no_service_key' };
  const payload = await loadPayload(key);
  const items = topFromMural(payload);
  if (!items.length) return { sent: false, reason: 'no_articles' };
  const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
  const replyTo = process.env.NEWSLETTER_REPLYTO || '';
  const subject = `[TESTE] Endodirect — 3 artigos do dia (${dateBR()})`;
  const sent = await sendViaResend(apiKey, from, replyTo, subject, [to], items.slice(0, 3));
  return { sent: sent > 0, to, articles: items.length };
}

module.exports = { sendDailyNewsletter, addUnsubscribe, unsubToken, sendTestNewsletter };
