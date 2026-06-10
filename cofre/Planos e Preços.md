---
tags: [cofre, produto, precos]
atualizado: 2026-06-10
---

# Planos e Preços

## Dois pacotes
| Pacote | Mensal | Anual | Anual (mês equiv.) |
|---|---|---|---|
| **Standard** | R$ 69/mês | 12× R$ 45 = R$ 540 | R$ 45 |
| **Gold** | R$ 99/mês | 12× R$ 69 = R$ 828 | R$ 69 |

- O **anual fica em destaque** (à esquerda); o mensal é secundário (à direita).
- Existe um tier `premium` no código (R$139/mês; anual R$1164) como legado, mas a vitrine usa **2 pacotes**.

## Oferta de Sócio-fundador
- **"Gold pelo preço do Standard"**: Gold anual por **12× R$ 45 (R$ 540)**.
- Cupom **`FUNDADOR`**, **100 vagas**, preço travado.
- **Só no ciclo anual** (some no mensal); faixa/selo somem quando esgota.
- Regras e contagem de vagas em `lib/founder.js` (`FOUNDER_PLAN=gold`, `FOUNDER_AMOUNT` default 54000, `FOUNDER_LIMIT=100`, `FOUNDER_COUPON=FUNDADOR`). Auto-desativa ao esgotar via `endodirect_admin_overview`.

## Valores em env (centavos)
- Mensais: `PAGARME_TIER_STANDARD_AMOUNT=6900`, `..._GOLD_AMOUNT=9900`, `..._PREMIUM_AMOUNT=13900`.
- Anuais: `PAGARME_ANNUAL_STANDARD_AMOUNT=54000`, `..._GOLD_AMOUNT=82800`, `..._PREMIUM_AMOUNT=116400`.
- Fundador: `PAGARME_FOUNDER_AMOUNT=54000`.

## FAQ
- Direito de arrependimento: **7 dias** de uso e cancelamento (adicionado na FAQ, #147).

Ver [[Pagamentos pagar.me]] para o fluxo de cobrança.
