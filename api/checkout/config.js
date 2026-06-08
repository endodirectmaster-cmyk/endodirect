// Endodirect — Config pública do checkout
// =====================================================================
// Expõe a CHAVE PÚBLICA do pagar.me (publishable, segura no navegador) e os
// valores dos planos para o front montar o formulário de cartão. A chave fica
// em variável de ambiente — nunca commitada no repositório.
//
// VARIÁVEIS DE AMBIENTE (Vercel):
//   PAGARME_PUBLIC_KEY            (pk_test_... / pk_live_...) — usada p/ tokenizar o cartão
//   PAGARME_TIER_STANDARD_AMOUNT  mensal em CENTAVOS (padrão 5000 = R$50)
//   PAGARME_TIER_GOLD_AMOUNT      mensal em CENTAVOS (padrão 7000 = R$70)
//   PAGARME_TIER_PREMIUM_AMOUNT   mensal em CENTAVOS (padrão 9000 = R$90)
// =====================================================================

module.exports = function handler(req, res) {
  var PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY || '';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    enabled: !!PUBLIC_KEY,
    public_key: PUBLIC_KEY,
    amounts: {
      standard: Number(process.env.PAGARME_TIER_STANDARD_AMOUNT || 5000),
      gold: Number(process.env.PAGARME_TIER_GOLD_AMOUNT || 7000),
      premium: Number(process.env.PAGARME_TIER_PREMIUM_AMOUNT || 9000)
    },
    annual: {
      standard: Number(process.env.PAGARME_ANNUAL_STANDARD_AMOUNT || 50000),
      gold: Number(process.env.PAGARME_ANNUAL_GOLD_AMOUNT || 70000),
      premium: Number(process.env.PAGARME_ANNUAL_PREMIUM_AMOUNT || 90000)
    },
    max_installments: Number(process.env.PAGARME_MAX_INSTALLMENTS || 12)
  }));
};
