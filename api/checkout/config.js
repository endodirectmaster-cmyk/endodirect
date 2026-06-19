// Endodirect — Config pública do checkout
// =====================================================================
// Expõe a CHAVE PÚBLICA do pagar.me (publishable, segura no navegador) e os
// valores dos planos para o front montar o formulário de cartão. A chave fica
// em variável de ambiente — nunca commitada no repositório.
//
// VARIÁVEIS DE AMBIENTE (Vercel):
//   PAGARME_PUBLIC_KEY            (pk_test_... / pk_live_...) — usada p/ tokenizar o cartão
//   PAGARME_TIER_STANDARD_AMOUNT  mensal em CENTAVOS (padrão 6900 = R$69)
//   PAGARME_TIER_GOLD_AMOUNT      mensal em CENTAVOS (padrão 9900 = R$99)
//   PAGARME_TIER_PREMIUM_AMOUNT   mensal em CENTAVOS (padrão 13900 = R$139)
//   PAGARME_ANNUAL_*_AMOUNT       anual TOTAL em CENTAVOS (padrões 54000/82800/116400)
// =====================================================================

const { founderStatus } = require('../../lib/founder');

module.exports = async function handler(req, res) {
  var PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY || '';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  // Estado da oferta de Sócio-fundador (vagas restantes; desativa ao esgotar).
  var founder;
  try { founder = await founderStatus(); }
  catch (e) { founder = { enabled: String(process.env.FOUNDER_ENABLED || '1') !== '0', coupon: String(process.env.FOUNDER_COUPON || 'FUNDADOR').trim().toUpperCase(), plan: String(process.env.FOUNDER_PLAN || 'gold').trim().toLowerCase(), annual_amount: Number(process.env.PAGARME_FOUNDER_AMOUNT || process.env.PAGARME_FOUNDER_PREMIUM_AMOUNT || 54000), limit: Number(process.env.FOUNDER_LIMIT || 100), remaining: null }; }
  res.end(JSON.stringify({
    ok: true,
    enabled: !!PUBLIC_KEY,
    public_key: PUBLIC_KEY,
    amounts: {
      standard: Number(process.env.PAGARME_TIER_STANDARD_AMOUNT || 6900),
      gold: Number(process.env.PAGARME_TIER_GOLD_AMOUNT || 9900)
    },
    annual: {
      standard: Number(process.env.PAGARME_ANNUAL_STANDARD_AMOUNT || 54000),
      gold: Number(process.env.PAGARME_ANNUAL_GOLD_AMOUNT || 82800),
      platinum: Number(process.env.PAGARME_ANNUAL_PLATINUM_AMOUNT || 199700)
    },
    max_installments: Number(process.env.PAGARME_MAX_INSTALLMENTS || 12),
    founder: founder
  }));
};
