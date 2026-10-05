---
tags: [cofre, produto, precos]
atualizado: 2026-10-05
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

## 💰 ECONOMIA DA PLATAFORMA — base medida em 2026-10-05

Pedido do professor: *"Baseado nos custos da plataforma, simule quantos alunos
devemos ter para que os professores (Rodolpho, Rafael, Bruno e Eduardo) tenham
uma receita recorrente da plataforma."* Simulador publicado (parâmetros
ajustáveis, valores mensais): https://claude.ai/artifact/9b4fGGoDwRBVVVCEw1MF3p

**Assinantes (tabela de acessos, 05/10):** 38 pagantes ativos — 32 fundadores
(Gold anual R$ 540 = R$ 45/mês), 1 Gold anual (R$ 828), 4 Gold mensais (R$ 99),
1 Standard mensal (R$ 69). Receita mensal equivalente **R$ 1.974**; preço médio
**R$ 52**. Fora da receita: 3 Gold sem registro de cobrança, 2 cortesias, a conta
de vitrine. Vendas por mês (pagar.me): jun 18 · jul 15 · ago 4 · set 3 · out 2.
Vagas de fundador: 32 de 100.

**Custos mensais (o que a plataforma paga):**

| item | valor | origem |
|---|---|---|
| Supabase | US$ 25 | plano Pro confirmado na organização (`get_organization`) |
| Resend | US$ 20 | plano pago desde 03/08 (ver [[Integrações]]) |
| Vercel | US$ 0 | Hobby: a API de cobrança devolve "Plan not found" |
| IA do servidor | US$ 15–40 (usei 25) | 660 resumos/30d e classificação de notícias em `claude-sonnet-5` (≈US$ 0,004/item, system curto, sem cache); 86 discussões/30d em `claude-opus-4-8`, `max_tokens` 6000, ≈US$ 0,15 cada |
| Bunny Stream | US$ ~10 | **não medido** — conferir na fatura |
| Assinatura Claude (desenvolvimento) | US$ ~100 | **não medido** — ajustar ao plano contratado; é a maior linha |
| Domínio e outros | R$ ~5 | estimado |

Câmbio assumido R$ 5,40. **Custo fixo ≈ R$ 980/mês.** Variáveis por aluno:
IA usada pelo aluno (hoje baixíssima: 9 simulados e 8 prescrições em toda a
base; ≈US$ 0,08–0,20 por ação com o núcleo de 20k tokens em cache — usei R$ 8/mês),
taxa do pagar.me (assumi 4,5%) e impostos sobre a receita (assumi 6%).

**Resultado com esses padrões (preço médio R$ 60):** contribuição R$ 45,70 por
aluno; ponto de equilíbrio **22 alunos**; sobra hoje ≈ **R$ 120 por professor**.
Para cada professor receber por mês: R$ 1.000 → **109 alunos**; R$ 2.500 →
**241**; R$ 5.000 → **460**; R$ 10.000 → **897**. A R$ 45 (fundador) os números
quase dobram; a R$ 99 (Gold mensal) caem a pouco mais da metade. Os custos
fixos ficam estáveis até ~1.600 alunos (teto do plano de e-mail).

**O que falta confirmar com o professor:** fatura do Bunny, plano do Claude,
taxa contratada no pagar.me e enquadramento tributário.

## FAQ
- Direito de arrependimento: **7 dias** de uso e cancelamento (adicionado na FAQ, #147).

Ver [[Pagamentos pagar.me]] para o fluxo de cobrança.
