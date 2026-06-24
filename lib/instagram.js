// Instagram "Questão do Dia" — aviso diário por e-mail (Resend), pegando carona
// no cron do radar (/api/cron/endocrine-radar). É um MÓDULO de lib/ (NÃO conta
// como função Vercel; o plano limita a 12 funções / 2 crons, ambos no teto).
//
// Rota C — híbrido com aprovação: o sistema NÃO publica sozinho. O professor
// gera/edita a questão no painel (aba "Questão do Dia"), baixa a arte (render
// client-side, SVG→PNG no navegador) e posta o story às 18h BRT. Este módulo só
// MANDA O LEMBRETE do dia, com a legenda pronta para copiar.
//
// Calendário editorial (BRT): Seg/Qua/Sex = QUESTÃO; Ter/Qui/Sáb = GABARITO da
// anterior; Dom = 2 PROMOS das ferramentas. Idempotente por dia (grava
// ig_notice_sent em endodirect_global_state, igual à trava da newsletter).

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
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Dia da semana e data ISO em horário de Brasília (UTC-3), sem dependências.
function brtParts(d) {
  const t = (d ? d.getTime() : Date.now()) - 3 * 3600000;
  const b = new Date(t);
  return { dow: b.getUTCDay(), iso: b.toISOString().slice(0, 10), dayNum: Math.floor(t / 86400000) };
}

// Ferramentas da plataforma para os stories de domingo (promo). Rotação semanal.
const TOOLS = [
  { nome: 'Banco de Questões', cta: 'Milhares de questões comentadas de endocrinologia.' },
  { nome: 'Simulador de Casos', cta: 'Pratique raciocínio clínico em casos guiados por IA.' },
  { nome: 'Calculadoras', cta: 'Escores e fórmulas da endócrino na palma da mão.' },
  { nome: 'Flashcards', cta: 'Revisão espaçada com os dados que caem na prova.' },
  { nome: 'Mapas Mentais', cta: 'Veja a endocrinologia conectada, tema a tema.' },
  { nome: 'Diretrizes', cta: 'Resumos das diretrizes vigentes, sempre atualizados.' },
  { nome: 'Podcasts', cta: 'Estude de ouvido — episódios curtos de endócrino.' },
  { nome: 'Assistente de Prescrição', cta: 'Receituário, LME e mais, com poucos cliques.' },
  { nome: 'Chat com IA', cta: 'Tire dúvidas clínicas com a IA treinada em diretrizes.' },
  { nome: 'Cursos', cta: 'Aulas das subespecialidades com quem é referência.' }
];

const DOW_NAME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// Plano editorial do dia a partir do dia da semana (BRT).
function igTodayPlan(d) {
  // Calendário (ajuste do usuário 2026-06-23): Seg–Sáb = QUESTÃO (a resposta fica
  // no app — não há mais "dia de gabarito"); Dom = 2 PROMOS das ferramentas.
  const { dow, dayNum } = brtParts(d);
  if (dow === 0) { // domingo → 2 promos
    const i = Math.floor(dayNum / 7) % TOOLS.length;
    const j = (i + 1) % TOOLS.length;
    return { kind: 'promo', dow, tools: [TOOLS[i], TOOLS[j]] };
  }
  return { kind: 'question', dow }; // segunda a sábado → questão
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

async function adminEmails(key) {
  if (!key) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_admins?select=email`, { headers: serviceHeaders(key) });
    if (!r.ok) return [];
    const rows = await r.json().catch(() => []);
    return rows.map((x) => String(x.email || '').trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  } catch (e) { return []; }
}
function recipients(adm) {
  const env = String(process.env.ALERT_TO || process.env.HEALTHCHECK_TO || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.indexOf('@') > 0);
  if (env.length) return env;
  if (adm && adm.length) return adm;
  return ['endodirectmaster@gmail.com'];
}

// Legenda da QUESTÃO (mesma ideia da do painel; o gabarito vai no dia seguinte).
function questionCaption(it) {
  if (!it) return '';
  const op = it.options || {};
  const teem = it.teem ? esc(it.teem).trim() + ' ' : '';
  const lines = [];
  lines.push('🧠 QUESTÃO DO DIA — ' + (it.sub || 'Endocrinologia'));
  lines.push('');
  lines.push(teem + String(it.stem || '').trim());
  lines.push('');
  ['A', 'B', 'C', 'D'].forEach((L) => { if (op[L]) lines.push(L + ') ' + String(op[L]).trim()); });
  lines.push('');
  lines.push('👉 Responda no quiz acima!');
  lines.push('✅ A resposta COMENTADA está no app Endodirect — link na bio. 📲');
  lines.push('');
  lines.push('#endocrinologia #residenciamedica #provadetitulo #endodirect #medicina');
  return lines.join('\n');
}
function answerCaption(it) {
  if (!it) return '';
  const op = it.options || {};
  const L = it.answer || '';
  const lines = [];
  lines.push('🔑 GABARITO — ' + (it.sub || 'Endocrinologia'));
  lines.push('');
  lines.push('Resposta: ' + L + (op[L] ? ') ' + String(op[L]).trim() : ''));
  lines.push('');
  if (it.explanation) { lines.push(String(it.explanation).trim()); lines.push(''); }
  lines.push('Quer treinar com milhares de questões comentadas? Endodirect — link na bio. 📲');
  lines.push('#endocrinologia #residenciamedica #endodirect #medicina');
  return lines.join('\n');
}

// Item da fila a destacar no lembrete: o mais antigo ainda não postado (FIFO).
function nextQueued(list) {
  const arr = (Array.isArray(list) ? list : []).filter((x) => x && x.status !== 'posted');
  arr.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return arr[0] || null;
}
// Para o gabarito, o item mais recente (a questão postada na véspera).
function lastForAnswer(list) {
  const arr = (Array.isArray(list) ? list : []).slice();
  arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return arr[0] || null;
}

function emailHTML(plan, body, caption) {
  const panelUrl = publicBase() + '/#stories';
  const capBlock = caption
    ? `<p style="margin:18px 0 6px;font-size:13px;font-weight:700;color:#111827">Legenda pronta (copie e cole):</p>
       <pre style="white-space:pre-wrap;word-break:break-word;background:#0b1325;color:#e8edf6;border-radius:10px;padding:14px 16px;font-family:Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;margin:0">${esc(caption)}</pre>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0b1325;padding:20px 24px;color:#f5b32c;font-size:18px;font-weight:800">📲 Story do dia — Endodirect</td></tr>
        <tr><td style="padding:20px 24px">
          ${body}
          ${capBlock}
          <p style="margin:20px 0 0"><a href="${esc(panelUrl)}" style="display:inline-block;background:#f5b32c;color:#0b1325;text-decoration:none;font-weight:800;font-size:14px;padding:12px 22px;border-radius:10px">Abrir o painel → Questão do Dia</a></p>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af">Painel → Questão do Dia: gere/edite, baixe a arte (PNG 1080×1920) e poste o story às 18h. Lembrete automático do cron diário.</p>
        </td></tr>
      </table></td></tr></table></body></html>`;
}

// Lembrete diário. Fail-safe: nunca lança (não derruba o cron do radar).
async function sendIgDailyNotice(now) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error('[instagram] RESEND_API_KEY ausente; lembrete não enviado.'); return { sent: false, reason: 'no_resend_key' }; }
    const key = serviceKey();
    if (!key) return { sent: false, reason: 'no_service_key' };

    const payload = await loadPayload(key);
    const { iso } = brtParts(now);
    if (payload.ig_notice_sent === iso) return { sent: false, reason: 'already_sent' };

    const plan = igTodayPlan(now);
    const stories = Array.isArray(payload.ig_stories) ? payload.ig_stories : [];
    const dia = DOW_NAME[plan.dow];
    let subject = '';
    let body = '';
    let caption = '';

    if (plan.kind === 'question') {
      const it = nextQueued(stories);
      subject = `📲 ${dia}: poste a Questão do Dia`;
      if (it) {
        caption = questionCaption(it);
        body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Questão do Dia</b> — subespecialidade <b>${esc(it.sub || 'Endocrinologia')}</b>.</p>
                <p style="margin:10px 0 0;font-size:14px;color:#374151">Abra o painel, baixe a arte (slide da pergunta) e poste o story às <b>18h</b> com o sticker de quiz (4 alternativas). A <b>resposta comentada fica no app</b> — a legenda já chama o seguidor pra responder lá (funil).</p>`;
      } else {
        body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Questão do Dia</b>, mas <b>a fila está vazia</b>.</p>
                <p style="margin:10px 0 0;font-size:14px;color:#374151">Abra o painel → Questão do Dia, gere uma questão com a IA, revise e aprove. Depois baixe a arte e poste às 18h.</p>`;
      }
    } else if (plan.kind === 'answer') {
      const it = lastForAnswer(stories);
      subject = `🔑 ${dia}: poste o Gabarito`;
      if (it) caption = answerCaption(it);
      body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>Gabarito</b> — poste a resposta da questão de ontem.</p>
              <p style="margin:10px 0 0;font-size:14px;color:#374151">No painel → Questão do Dia, baixe a arte do <b>gabarito</b> do item de ontem e poste às 18h.</p>`;
    } else { // promo (domingo)
      const t = plan.tools || [];
      subject = `📣 ${dia}: 2 stories de divulgação`;
      body = `<p style="margin:0;font-size:15px;color:#111827">Hoje (<b>${dia}</b>) é dia de <b>2 stories de divulgação</b> das ferramentas.</p>
              <p style="margin:10px 0 0;font-size:14px;color:#374151">Sugestões da semana: <b>${esc((t[0] && t[0].nome) || 'Banco de Questões')}</b> e <b>${esc((t[1] && t[1].nome) || 'Simulador de Casos')}</b>. No painel → Questão do Dia → Promos, baixe os fundos e poste às 18h.</p>`;
    }

    const from = process.env.NEWSLETTER_FROM || 'Endodirect <newsletter@endodirect.com.br>';
    const to = recipients(await adminEmails(key));
    const html = emailHTML(plan, body, caption);
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(to.map((dest) => ({ from, to: [dest], subject: `Endodirect — ${subject}`, html })))
    });
    if (!r.ok) { const tx = await r.text().catch(() => ''); console.error('[instagram] Resend HTTP', r.status, tx.slice(0, 200)); return { sent: false, reason: 'resend_error' }; }

    // Trava de idempotência (read-modify-write fresco, como a newsletter).
    try {
      const fresh = await loadPayload(key);
      fresh.ig_notice_sent = iso;
      await savePayload(key, fresh);
    } catch (e) { console.error('[instagram] falha ao gravar ig_notice_sent:', (e && e.message) || e); }

    return { sent: true, kind: plan.kind, count: to.length };
  } catch (e) {
    console.error('[instagram] falha no lembrete diário:', (e && e.stack) || e);
    return { sent: false, reason: 'error' };
  }
}

module.exports = { sendIgDailyNotice, igTodayPlan, questionCaption, answerCaption, TOOLS };
