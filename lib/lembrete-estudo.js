// Endodirect — LEMBRETE DIÁRIO DE ESTUDO NA HORA QUE O ALUNO ESCOLHE (27/11/2026).
//
// Professor, da lista de sugestões: "Faz a 1, 5, 6 e 10" (a 5: "Hora das suas 10 questões").
// O aluno liga no Perfil, escolhe a hora e quantas questões (user_profile.lembrete =
// {on, h, q, tz}, sincronizado com o resto do perfil). De hora em hora o pg_cron do banco chama
// /api/admin/refresh-radar (action 'tarefas_hora'), que chama isto aqui.
//
// Regras:
//   · a hora é a do fuso do aparelho do aluno (tz, gravado junto), não a de Brasília;
//   · uma vez por dia (do aluno): a reserva no banco é atômica (endodirect_lembrete_reservar);
//   · se ele já fez a meta do dia (act do dia >= q), não incomoda;
//   · se já fez parte, a mensagem diz quantas faltam.
// Só vai para quem tem aparelho com notificação ativa (o banco já filtra).

const push = require('./push');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const METAS = [5, 10, 15, 20, 30, 50];

function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || ''; }
function serviceHeaders(key) { return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' }; }
function publicBase() { return (process.env.PUBLIC_BASE_URL || 'https://www.endodirect.com.br').replace(/\/+$/, ''); }

// Dia (AAAA-MM-DD) e hora (0–23) de `ms` no fuso `tz`. Fuso inválido → Brasília.
function agoraNoFuso(ms, tz) {
  const fmt = (zona) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms));
  let partes;
  try { partes = fmt(String(tz || '') || 'America/Sao_Paulo'); } catch (e) { partes = fmt('America/Sao_Paulo'); }
  const p = {}; partes.forEach((x) => { p[x.type] = x.value; });
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: (+p.hour) % 24 };
}

// Quem recebe agora e o quê. Exportado para o teste.
function quemRecebe(rows, ms) {
  const out = [];
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    const l = r && r.lembrete;
    if (!r || !r.user_id || !l || l.on !== true) return;
    const h = +l.h;
    if (!(h >= 0 && h <= 23) || Math.floor(h) !== h) return;
    const local = agoraNoFuso(ms, l.tz);
    if (local.hora !== h) return;
    const meta = METAS.indexOf(+l.q) >= 0 ? +l.q : 10;
    const feitas = Math.max(0, +((r.act && r.act[local.dia]) || 0) || 0);
    if (feitas >= meta) return;
    out.push({ user_id: r.user_id, dia: local.dia, meta, feitas });
  });
  return out;
}

function mensagem(alvo) {
  const falta = alvo.meta - alvo.feitas;
  return {
    title: `📚 Hora das suas ${alvo.meta} questões`,
    body: alvo.feitas > 0
      ? `Faltam ${falta} das suas ${alvo.meta} questões de hoje. Bora fechar a meta?`
      : `Seu lembrete de estudo: ${alvo.meta} questões hoje mantêm o ritmo.`,
    url: publicBase() + '/#quest',
    tag: 'endodirect-lembrete'
  };
}

async function rpc(key, nome, corpo) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, { method: 'POST', headers: serviceHeaders(key), body: JSON.stringify(corpo || {}) });
  if (!r.ok) throw new Error(nome + ' HTTP ' + r.status);
  return r.json().catch(() => null);
}

// Fail-safe: nunca lança.
async function sendLembretesEstudo(opts) {
  opts = opts || {};
  const key = serviceKey();
  if (!key) return { ok: false, motivo: 'sem chave de serviço' };
  if (!push.isConfigured() && !push.apnsConfigured()) return { ok: false, motivo: 'notificações não configuradas' };
  const ms = opts.now || Date.now();
  let alvos = [];
  try { alvos = quemRecebe(await rpc(key, 'endodirect_lembrete_candidatos', {}), ms); }
  catch (e) { console.error('[lembrete] candidatos falhou:', (e && e.message) || e); return { ok: false, motivo: 'candidatos' }; }
  if (!alvos.length) return { ok: true, alvos: 0, enviados: 0 };
  let reservados = [];
  try { reservados = (await rpc(key, 'endodirect_lembrete_reservar', { p_users: alvos.map((a) => a.user_id), p_dias: alvos.map((a) => a.dia) })) || []; }
  catch (e) { console.error('[lembrete] reservar falhou:', (e && e.message) || e); return { ok: false, motivo: 'reservar' }; }
  const ok = new Set((reservados || []).map((x) => (x && typeof x === 'object') ? x.endodirect_lembrete_reservar || x.user_id : x));
  const porUser = {}; alvos.forEach((a) => { if (ok.has(a.user_id)) porUser[a.user_id] = a; });
  const ids = Object.keys(porUser);
  if (!ids.length) return { ok: true, alvos: alvos.length, enviados: 0, jaEnviados: alvos.length };
  let subs = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/endodirect_push_subs?select=endpoint,p256dh,auth,user_id&user_id=in.(${ids.map(encodeURIComponent).join(',')})`, { headers: serviceHeaders(key) });
    if (r.ok) subs = (await r.json().catch(() => [])) || [];
  } catch (e) { return { ok: false, motivo: 'subs' }; }
  let enviados = 0, falhas = 0;
  for (const s of subs) {
    const alvo = porUser[s.user_id]; if (!alvo) continue;
    try {
      const res = await push.sendPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, mensagem(alvo), {});
      if (res && res.ok) enviados++; else falhas++;
    } catch (e) { falhas++; }
  }
  return { ok: true, alvos: alvos.length, alunos: ids.length, enviados, falhas };
}

module.exports = { sendLembretesEstudo, quemRecebe, agoraNoFuso, mensagem, METAS };
