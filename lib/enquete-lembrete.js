// Endodirect — LEMBRETE DA ENQUETE de Educação Médica Continuada (e-mail + celular).
//
// Pedido do professor (04/11/2026): "essa enquete já está rolando para os demais
// alunos que ainda não responderam. Acho que vale a pena uma nova cobrança." E
// sobre quem já respondeu: "não precisam responder novamente".
//
// Quem recebe: assinante Gold ATIVO que ainda não votou, sem contas de teste nem
// admins e sem quem saiu da lista — tudo decidido no banco pela RPC
// `endodirect_enquete_cme_pendentes()` (só service_role), com a mesma régua da
// apuração. O link leva à plataforma, onde a janela da enquete já abre sozinha
// para o Gold sem voto.
//
// ⚠️ UMA VEZ POR CAMPANHA. Pega carona no cron diário (o plano limita os crons e a
// Vercel está em 12/12 funções) e grava o envio em
// `endodirect_global_state.payload.enquete_lembrete_sent` ({ '<campanha>': {dia, emails, push} }).
// Essa chave está nas chaves do servidor do gatilho
// `endodirect_global_preserve_server_keys` (supabase/enquete-lembrete.sql): sem
// isso, um save do painel apagaria o registro e o lembrete sairia de novo.
// Nova cobrança no futuro = nova entrada em CAMPANHAS, com outro id.

const crypto = require('crypto');
const { sendToEmail } = require('./push');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const MAX_PER_RUN = 300; // trava contra disparo em massa
const CAMPANHAS = [
  { id: 'enquete-cme-2026-11-05', aPartirDe: '2026-11-05', ate: '2026-11-12' }
];

function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || ''; }
function serviceHeaders(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function publicBase() { return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, ''); }
function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
function unsubSecret() { return process.env.NEWSLETTER_SECRET || serviceKey() || 'endodirect-newsletter'; }
function unsubToken(email) { return crypto.createHmac('sha256', unsubSecret()).update(String(email || '').trim().toLowerCase()).digest('hex').slice(0, 32); }
function unsubUrl(email) { const e = encodeURIComponent(String(email || '').trim().toLowerCase()); return `${publicBase()}/api/newsletter/unsubscribe?e=${e}&t=${unsubToken(email)}`; }
// Dia em Brasília (UTC-3), para a data de início valer no fuso do professor.
function diaBR(ms) { return new Date((ms || Date.now()) - 3 * 3600000).toISOString().slice(0, 10); }

async function loadPayload(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main&select=payload`, { headers: serviceHeaders(key) });
  if (!r.ok) return null;
  const rows = await r.json().catch(() => []);
  return (rows && rows[0] && rows[0].payload) || {};
}
// Relê o payload na hora de gravar e muda SÓ a chave do lembrete: o cron mexe em
// outras chaves no mesmo minuto, e gravar o payload lido no início desfaria isso.
async function marcarEnviado(key, campanhaId, registro) {
  const atual = await loadPayload(key);
  if (!atual) return false;
  const sent = Object.assign({}, atual.enquete_lembrete_sent || {});
  sent[campanhaId] = registro;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_global_state?id=eq.main`, {
    method: 'PATCH',
    headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
    body: JSON.stringify({ payload: Object.assign({}, atual, { enquete_lembrete_sent: sent }) })
  });
  return r.ok;
}
async function pendentes(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/endodirect_enquete_cme_pendentes`, {
    method: 'POST', headers: serviceHeaders(key), body: '{}'
  });
  if (!r.ok) return null;
  const rows = await r.json().catch(() => null);
  if (!Array.isArray(rows)) return null;
  const vistos = new Set(), out = [];
  for (const row of rows) {
    const e = String((row && row.email) || '').trim().toLowerCase();
    if (!e || !e.includes('@') || vistos.has(e)) continue;
    vistos.add(e); out.push(e);
    if (out.length >= MAX_PER_RUN) break;
  }
  return out;
}

const ASSUNTO = 'Faltam só os seus temas: Educação Médica Continuada (Gold)';
function corpoHtml(email) {
  const url = `${publicBase()}/`;
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:28px 20px;color:#e6ecf5">
  <img src="${publicBase()}/icons/icon-192.png" width="44" height="44" alt="Endodirect" style="border-radius:10px;display:block;margin-bottom:18px">
  <div style="display:inline-block;background:#f5b301;color:#0b1220;font-size:12px;font-weight:700;letter-spacing:.05em;padding:4px 10px;border-radius:999px">EXCLUSIVO DO PLANO GOLD</div>
  <h1 style="font-size:24px;line-height:1.3;margin:14px 0 10px;color:#fff">Quais aulas você quer ver primeiro?</h1>
  <p style="font-size:15px;line-height:1.65;color:#c9d6e8;margin:0 0 12px">Estamos montando o calendário do <b style="color:#fff">Programa de Educação Médica Continuada</b>: aulas <b style="color:#fff">mensais</b> de atualização nos diversos temas da endocrinologia, só para assinantes Gold.</p>
  <p style="font-size:15px;line-height:1.65;color:#c9d6e8;margin:0 0 18px">Você ainda não indicou os seus temas. Leva menos de um minuto: escolha até <b style="color:#fff">3 subespecialidades</b> e, se quiser, os temas dentro de cada uma, ou descreva outro em "Outros". A enquete abre assim que você entra na plataforma.</p>
  <a href="${url}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px">Escolher meus temas →</a>
  <p style="font-size:13px;line-height:1.6;color:#8b9cb5;margin:20px 0 0">Os temas mais pedidos entram primeiro no calendário.</p>
  <hr style="border:0;border-top:1px solid #1e2a40;margin:26px 0 14px">
  <p style="font-size:11px;color:#6b7a93;margin:0">Você recebe este aviso porque é assinante Gold do Endodirect. <a href="${unsubUrl(email)}" style="color:#6b7a93">Descadastrar</a>.</p>
</div></body></html>`;
}

// Nunca lança: o cron não pode cair por causa disto.
async function sendLembreteEnquete(agoraMs) {
  const agora = agoraMs || Date.now();
  const hoje = diaBR(agora);
  const campanha = CAMPANHAS.find((c) => hoje >= c.aPartirDe && hoje <= c.ate);
  if (!campanha) return { ok: true, skipped: 'sem campanha ativa' };
  const key = serviceKey();
  if (!key) return { ok: false, skipped: 'sem service key' };
  const payload = await loadPayload(key);
  if (!payload) return { ok: false, skipped: 'payload ilegivel' };
  if ((payload.enquete_lembrete_sent || {})[campanha.id]) return { ok: true, skipped: 'ja enviado', campanha: campanha.id };

  const lista = await pendentes(key);
  if (lista === null) return { ok: false, skipped: 'rpc de pendentes falhou' };
  if (!lista.length) {
    await marcarEnviado(key, campanha.id, { dia: hoje, emails: 0, push: 0, alvo: 0 });
    return { ok: true, emails: 0, push: 0, campanha: campanha.id, motivo: 'ninguem pendente' };
  }

  // Celular: só os aparelhos dos próprios pendentes (não é aviso geral).
  let push = 0;
  for (const email of lista) {
    try {
      const r = await sendToEmail(email, { title: '🎓 Educação Médica Continuada', body: 'Faltam só os seus temas. Leva menos de um minuto.', url: '/' });
      push += (r && r.sent) || 0;
    } catch (e) { /* aparelho falho não derruba o resto */ }
  }

  const RESEND = process.env.RESEND_API_KEY;
  let enviados = 0;
  if (RESEND) {
    const from = process.env.TRIAL_FROM || process.env.NEWSLETTER_FROM || 'Endodirect <noticias@endodirect.com.br>';
    for (const lote of chunk(lista, 50)) {
      const body = lote.map((email) => ({
        from, to: [email], subject: ASSUNTO, html: corpoHtml(email),
        headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      }));
      try {
        const r = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST', headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (r.ok) enviados += lote.length;
      } catch (e) { /* lote falho não derruba o cron */ }
    }
  }
  // Só marca como enviado se algo saiu; senão a próxima rodada tenta de novo
  // (até o fim da janela da campanha).
  if (enviados || push) await marcarEnviado(key, campanha.id, { dia: hoje, emails: enviados, push: push, alvo: lista.length });
  return { ok: true, emails: enviados, push: push, alvo: lista.length, campanha: campanha.id, motivo: RESEND ? '' : 'sem RESEND_API_KEY' };
}

module.exports = { sendLembreteEnquete, CAMPANHAS, ASSUNTO, corpoHtml };
