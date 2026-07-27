---
tags: [cofre, produto, precos]
atualizado: 2026-07-27
---

# Planos e Preços

## Dois pacotes
| Pacote | Mensal | Anual | Anual (mês equiv.) |
|---|---|---|---|
| **Standard** | R$ 69/mês | 12× R$ 45 = R$ 540 | R$ 45 |
| **Gold** | R$ 99/mês | 12× R$ 69 = R$ 828 | R$ 69 |

- O **anual fica em destaque** (à esquerda); o mensal é secundário (à direita).
- **Platinum CANCELADO (2026-07-27)** — nunca existiu em produção. Foi construído no PR #390 (Gold + curso EndoTEEM, só anual, R$ 1.997/ano, concedendo o combo de escopos `plano:gold` + `curso:endoteem`), ficou aberto de 18/06 a 27/07 e o Rodolpho mandou cancelar. **PR fechado sem merge**; a branch `claude/modest-wozniak-yhytlv` continua no repositório se um dia a ideia voltar. Consequência prática: **o EndoTEEM segue sendo vendido avulso** — era o #390 que o tiraria de `ENDO_CURSOS_AVULSOS`. Não abrir de novo sem pedido explícito.
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
