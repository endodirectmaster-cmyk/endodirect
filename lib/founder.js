// Endodirect — Oferta de Sócio-fundador (cupom FUNDADOR).
// =====================================================================
// Centraliza as regras da oferta de lançamento para o checkout (order.js)
// e a config pública (config.js):
//   - valor promocional do Premium anual (padrão R$ 828 = "Premium pelo
//     preço do Gold");
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
//   PAGARME_FOUNDER_PREMIUM_AMOUNT  Premium anual fundador em CENTAVOS (82800)
// =====================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://auth.endodirect.com.br';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

const FOUNDER_COUPON = String(process.env.FOUNDER_COUPON || 'FUNDADOR').trim().toUpperCase();
const FOUNDER_AMOUNT = Number(process.env.PAGARME_FOUNDER_PREMIUM_AMOUNT || 82800);
const FOUNDER_LIMIT = Math.max(0, Number(process.env.FOUNDER_LIMIT || 100));
const FOUNDER_ENABLED_ENV = String(process.env.FOUNDER_ENABLED || '1') !== '0';

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

// Estado público da oferta (para o front decidir banner/cupom).
async function founderStatus() {
  const used = await countFounderAccesses();
  const remaining = (used == null) ? null : Math.max(0, FOUNDER_LIMIT - used);
  const enabled = FOUNDER_ENABLED_ENV && (remaining == null || remaining > 0);
  return { enabled: enabled, coupon: FOUNDER_COUPON, plan: 'premium', annual_amount: FOUNDER_AMOUNT, limit: FOUNDER_LIMIT, remaining: remaining, used: used };
}

// O cupom ainda pode ser aplicado a uma nova compra?
async function founderCanRedeem() {
  if (!FOUNDER_ENABLED_ENV) return false;
  const used = await countFounderAccesses();
  if (used == null) return true; // falha para o lado seguro (não bloqueia)
  return used < FOUNDER_LIMIT;
}

module.exports = {
  FOUNDER_COUPON, FOUNDER_AMOUNT, FOUNDER_LIMIT, FOUNDER_ENABLED_ENV,
  countFounderAccesses, founderStatus, founderCanRedeem
};
