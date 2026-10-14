// Endodirect — "Este e-mail já tem o plano?" antes de qualquer cobrança.
// =====================================================================
// ⚠️ POR QUE EXISTE (14/10/2026). Um assinante Gold (oferta de Sócio-fundador)
// viu na fatura DUAS compras do Gold anual no mesmo dia (29/06/2026, 12× R$45
// cada). No banco havia uma linha de acesso só: o webhook libera e grava por
// e-mail + escopo, então a segunda compra apenas regravou a mesma linha e o
// pedido duplicado ficou invisível. O caminho que leva a isso estava aberto:
// se a cobrança passa e algo falha depois (gravar o acesso, ou a função passa
// dos 30 s), o navegador dizia "Pagamento não aprovado" ou "tente novamente", e
// a nova tentativa COBRAVA DE NOVO — nem order.js nem subscribe.js conferiam se
// o e-mail já tinha o plano ativo.
//
// A regra (usada pelas duas rotas de checkout, ANTES de chamar o pagar.me):
//   · acesso RECORRENTE ativo do mesmo plano, ainda no período  → não cobra;
//     (vale também para quem tenta o anual tendo o mensal ativo: pagaria os dois.
//      Trocar de ciclo passa pelo suporte, que cancela a assinatura antes.)
//   · acesso AVULSO (anual, cortesia) ativo com mais de 30 dias  → não cobra;
//     nos últimos 30 dias a compra é renovação e segue normalmente.
// Falha ao consultar o banco NÃO bloqueia a venda (fail-open, com log): a
// proteção é contra a cobrança repetida, não um novo ponto de falha do checkout.
// =====================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

const RENOVACAO_DIAS = 30;
const DIA_MS = 86400000;

// Uma linha de endodirect_acessos impede nova cobrança do mesmo plano?
function vigenteBloqueia(row, agoraMs) {
  if (!row || String(row.status || '') !== 'active') return false;
  const agora = typeof agoraMs === 'number' ? agoraMs : Date.now();
  const fim = row.expires_at ? Date.parse(row.expires_at) : NaN;
  if (!row.expires_at) return true;                 // ativo sem data de fim
  if (isNaN(fim)) return false;                      // data ilegível: não trava a venda
  if (String(row.tipo || '') === 'recorrente') return fim > agora;
  return fim > agora + RENOVACAO_DIAS * DIA_MS;      // anual/cortesia: renova nos últimos 30 dias
}

function dataBR(iso) {
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  const d = new Date(t);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return dd + '/' + mm + '/' + d.getUTCFullYear();
}

function mensagemJaAtivo(row, rotulo) {
  const plano = rotulo || 'plano';
  let quando = '';
  if (row && String(row.tipo || '') === 'recorrente') quando = ' (assinatura mensal)';
  else if (row && row.expires_at && dataBR(row.expires_at)) quando = ' até ' + dataBR(row.expires_at);
  return 'Este e-mail já tem o ' + plano + ' ativo' + quando + '. Não é preciso pagar de novo: entre na plataforma com este e-mail. '
    + 'Se o acesso não aparecer, ou se quiser trocar de plano, fale com o suporte.';
}

// Consulta o banco (service role). Devolve a linha que bloqueia, ou null.
async function acessoVigente(email, scope, agoraMs) {
  email = String(email || '').trim().toLowerCase();
  if (!email || !scope || !SERVICE_ROLE) return null;
  try {
    // ilike + conferência exata abaixo: o webhook pode ter gravado o e-mail com
    // maiúsculas; o "_" de e-mails é curinga no ilike, por isso a conferência.
    const q = SUPABASE_URL + '/rest/v1/endodirect_acessos?email=ilike.' + encodeURIComponent(email)
      + '&scope=eq.' + encodeURIComponent(scope) + '&status=eq.active&select=id,email,scope,status,tipo,expires_at';
    const r = await fetch(q, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
    if (!r.ok) { console.log('[acesso-vigente] consulta falhou (' + r.status + '); segue sem bloquear'); return null; }
    const rows = await r.json().catch(function () { return []; });
    const lista = Array.isArray(rows) ? rows : [];
    for (const row of lista) {
      if (String(row.email || '').trim().toLowerCase() !== email) continue;
      if (vigenteBloqueia(row, agoraMs)) return row;
    }
    return null;
  } catch (e) {
    console.log('[acesso-vigente] erro na consulta; segue sem bloquear:', (e && e.message) || e);
    return null;
  }
}

module.exports = { acessoVigente, vigenteBloqueia, mensagemJaAtivo, RENOVACAO_DIAS };
