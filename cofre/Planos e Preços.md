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
- **Premium removido** (2026-06-11): não existe mais como pacote. Tirado de `config.js`, `subscribe.js`, `order.js`, do webhook (`TIERS`/heurística) e do sistema de tiers do `index.html` (`RANK`/`planRank`/labels). Gold é o tier máximo (rank 2); nenhum recurso exige tier 3. `PANEL_MIN_TIER={rx:2, presc:2}` (Prescrição exige Gold).

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
