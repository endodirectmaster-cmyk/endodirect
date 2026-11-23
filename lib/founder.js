// Endodirect — Oferta de Sócio-fundador (cupom FUNDADOR).
// =====================================================================
// Centraliza as regras da oferta de lançamento para o checkout (order.js)
// e a config pública (config.js):
//   - valor promocional do Gold anual (padrão R$ 540 = "Gold pelo
//     preço do Standard");
//   - LIMITE DE VAGAS auto-aplicado: conta os acessos já marcados como
//     ":fundador" na tabela endodirect_acessos e, ao atingir FOUNDER_LIMIT
//     (padrão 100), a oferta se DESATIVA SOZINHA — sem precisar mexer em
//     variável de ambiente na Vercel.
//
// Kill-switch manual (opcional): FOUNDER_ENABLED=0 desliga a oferta a
// qualquer momento, independentemente das vagas.
//
// VARIÁVEIS DE AMBIENTE (Vercel, todas opcionais):
//   FOUNDER_ENABLED                 '0' desliga a oferta (padrão ligado)
//   FOUNDER_COUPON                  código do cupom (padrão FUNDADOR)
//   FOUNDER_LIMIT                   nº de vagas (padrão 100)
//   FOUNDER_PLAN                    plano da oferta (padrão gold)
//   PAGARME_FOUNDER_AMOUNT          Gold anual fundador em CENTAVOS (54000 = 12× R$45)
// =====================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

const FOUNDER_COUPON = String(process.env.FOUNDER_COUPON || 'FUNDADOR').trim().toUpperCase();
const FOUNDER_PLAN = String(process.env.FOUNDER_PLAN || 'gold').trim().toLowerCase();
const FOUNDER_AMOUNT = Number(process.env.PAGARME_FOUNDER_AMOUNT || process.env.PAGARME_FOUNDER_PREMIUM_AMOUNT || 54000);
const FOUNDER_LIMIT = Math.max(0, Number(process.env.FOUNDER_LIMIT || 100));
const FOUNDER_ENABLED_ENV = String(process.env.FOUNDER_ENABLED || '1') !== '0';
// ENCERRAMENTO NA BLACK FRIDAY (professor, 23/11/2026: "fechar o sócio fundador na segunda, dia 30/11, e já
// anunciar isso no nosso site"): depois desta hora o cupom não vale mais, mesmo com vaga sobrando. Os fundadores
// que já entraram mantêm o preço travado (o acesso deles não depende daqui). FOUNDER_ATE (ISO) troca a data;
// vazio ou inválido = sem prazo (só as vagas).
const FOUNDER_ATE = String(process.env.FOUNDER_ATE == null ? '2026-11-30T23:59:59-03:00' : process.env.FOUNDER_ATE).trim();
function founderAteMs() { const t = Date.parse(FOUNDER_ATE); return Number.isFinite(t) ? t : null; }
// `agora` só para os testes.
function founderNoPrazo(agora) { const t = founderAteMs(); return t == null || (agora || Date.now()) <= t; }

// Conta quantos acessos de Sócio-fundador já foram concedidos.
// Retorna null se não der para consultar (falha "para o lado seguro": não
// bloqueia a venda só porque a consulta falhou).
async function countFounderAccesses() {
  if (!SERVICE_ROLE) return null;
  try {
    const url = SUPABASE_URL + '/rest/v1/endodirect_acessos?notes=ilike.' + encodeURIComponent('*:fundador*') + '&select=id';
    const r = await fetch(url, {
      headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json', Prefer: 'count=exact', Range: '0-0' }
    });
    const cr = r.headers.get('content-range') || '';
    const slash = cr.indexOf('/');
    if (slash >= 0) {
      const total = parseInt(cr.slice(slash + 1), 10);
      if (Number.isFinite(total)) return total;
    }
    const rows = await r.json().catch(function () { return []; });
    return Array.isArray(rows) ? rows.length : null;
  } catch (e) {
    return null;
  }
}

// Quem JÁ É fundador tem "preço travado para sempre": a renovação continua a R$ 540 mesmo
// depois do fim da oferta (30/11/2026), com as vagas esgotadas ou com a oferta desligada.
// Lê o acesso Gold da conta marcado ":fundador" (estornado/contestado não conta).
// Devolve true/false, ou null se o banco não respondeu.
async function ehFundador(email) {
  email = String(email || '').trim().toLowerCase();
  if (!email || !SERVICE_ROLE) return null;
  try {
    const url = SUPABASE_URL + '/rest/v1/endodirect_acessos?email=ilike.' + encodeURIComponent(email.replace(/[%_*]/g, ''))
      + '&scope=eq.plano:gold&notes=ilike.' + encodeURIComponent('*fundador*') + '&status=in.(active,past_due,expired)&select=id';
    const r = await fetch(url, { headers: { apikey: SERVICE_ROLE, Authorization: 'Bearer ' + SERVICE_ROLE, Accept: 'application/json' } });
    if (!r.ok) return null;
    const rows = await r.json().catch(function () { return null; });
    return Array.isArray(rows) ? rows.length > 0 : null;
  } catch (e) {
    return null;
  }
}

// Estado público da oferta (para o front decidir banner/cupom).
async function founderStatus() {
  const used = await countFounderAccesses();
  const remaining = (used == null) ? null : Math.max(0, FOUNDER_LIMIT - used);
  const enabled = FOUNDER_ENABLED_ENV && founderNoPrazo() && (remaining == null || remaining > 0);
  const ate = founderAteMs();
  return { enabled: enabled, coupon: FOUNDER_COUPON, plan: FOUNDER_PLAN, annual_amount: FOUNDER_AMOUNT, limit: FOUNDER_LIMIT, remaining: remaining, used: used,
    ate: ate == null ? null : new Date(ate).toISOString(), encerrada: !founderNoPrazo() };
}

// O cupom ainda pode ser aplicado a uma nova compra?
async function founderCanRedeem() {
  if (!FOUNDER_ENABLED_ENV || !founderNoPrazo()) return false;
  const used = await countFounderAccesses();
  if (used == null) return true; // falha para o lado seguro (não bloqueia)
  return used < FOUNDER_LIMIT;
}

module.exports = {
  FOUNDER_COUPON, FOUNDER_AMOUNT, FOUNDER_LIMIT, FOUNDER_ENABLED_ENV, FOUNDER_PLAN, FOUNDER_ATE,
  founderNoPrazo, ehFundador, countFounderAccesses, founderStatus, founderCanRedeem
};
