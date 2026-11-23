---
tags: [cofre, produto, precos]
atualizado: 2026-11-23
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

> ⏰ **ENCERRA NA BLACK FRIDAY: SEGUNDA, 30/11/2026, ÀS 23h59 (v480).** Professor, 23/11: "fechar o sócio fundador na
> segunda, dia 30/11, e já anunciar isso no nosso site". Em 23/11 eram 44 fundadores (56 vagas sobrando). Motivo: cada
> fundador novo trava R$ 540 para sempre; com a tabela de 2027 em estudo (Gold anual ~R$ 958,80), fechar antes poupa
> dezembro. `lib/founder.js`: `FOUNDER_ATE` (padrão `2026-11-30T23:59:59-03:00`; env vazia = sem prazo) desliga o cupom
> sozinho, mesmo com vaga; `founderStatus` devolve `ate` e `encerrada`; `order.js` responde 400
> `fundador_encerrado` sem chamar o pagar.me. Avisos: barra roxa no topo da landing (`#lp-bf`, "Ver oferta" leva aos
> planos), faixa "🔥 BLACK FRIDAY · Últimas vagas" nos planos da landing e na tela de planos dentro da plataforma (prazo
> vindo do servidor; no último dia, "encerra hoje, às 23h59"). Tudo some sozinho depois do prazo; o selo do Gold na
> tela de planos agora também depende da oferta aberta. Quem já é fundador mantém o preço (o acesso não passa por
> aqui). Pedido de posts e stories da campanha à conversa do Instagram pelo Docs de sincronia. Teste:
> `scripts/test-fundador-prazo.js`.
> **Renovação do fundador garantida:** o prazo, as vagas e o desligamento valem só para quem ainda não é fundador. Quem
> já tem o Gold marcado ":fundador" (ativo, inadimplente ou vencido; estornado não) renova a R$ 540 para sempre:
> `ehFundador(email)` no `order.js` e, na tela, a RPC `endodirect_sou_fundador()` (só da própria conta) mostra o campo
> com o cupom já preenchido e "Preço de Sócio-fundador garantido na sua renovação". As primeiras renovações são em
> junho de 2027.
- **"Gold pelo preço do Standard"**: Gold anual por **12× R$ 45 (R$ 540)**.
- Cupom **`FUNDADOR`**, **100 vagas**, preço travado.
- **Só no ciclo anual** (some no mensal); faixa/selo somem quando esgota.
- Regras e contagem de vagas em `lib/founder.js` (`FOUNDER_PLAN=gold`, `FOUNDER_AMOUNT` default 54000, `FOUNDER_LIMIT=100`, `FOUNDER_COUPON=FUNDADOR`). Auto-desativa ao esgotar via `endodirect_admin_overview`.

## 🤝 Cupom de parceiro (divulgadores) — v481, 23/11/2026

Professor, 23/11: "Vamos desenvolver isso" (parceria com divulgador de grupos de endocrinologia: cortesia Gold +
cupom próprio + comissão sobre os alunos novos). Combinado de comissão sugerido e aceito: **20% do valor pago no 1º ano**,
**25% depois da meta do semestre**, pago mês a mês conforme o dinheiro entra, nada sobre estorno.
- **Tabelas:** `endodirect_cupons` (codigo, parceiro, `desconto_pct` 0–50, `comissao_pct`, `comissao_pct_meta`,
  `meta_semestre`, `planos`, `ativo`, `valido_ate`, notas) e `endodirect_cupom_vendas` (uma linha por pedido pago:
  codigo, plano, ciclo, método, valor cheio, valor pago, `order_id` único, `pago|estornado`). RLS ligado, sem acesso
  de anon/auth; tudo por RPC. Sem dado de aluno nas vendas (nem e-mail, nem nome).
- **RPCs:** `endodirect_cupom_publico(codigo)` (anon: só código, % e planos de cupom ativo e no prazo),
  `endodirect_cupons_admin()` e `endodirect_cupom_admin_salvar(jsonb)` (só admin), `endodirect_sou_fundador()`.
- **Checkout:** só no **anual** (cartão, PIX, boleto). Link `?cupom=CODIGO` fica guardado 60 dias no aparelho
  (`endo_cupom_link`), mostra a barra verde na landing e abre o checkout no anual com o cupom preenchido. O campo
  confere o cupom ao digitar e mostra "de R$ X por R$ Y". O **servidor** recalcula sempre
  (`lib/cupom-parceiro.js`: `precoComCupom` arredonda ao centavo; desconto máximo 50%); cupom fora do ar = 503 sem
  cobrar. Não acumula com FUNDADOR.
- **Registro da venda:** cartão aprovado na hora → `registrarVenda` no `order.js`; PIX/boleto → no webhook quando
  paga (`meta.coupon` + `valor_cheio`); estorno no webhook → `estornarVenda` (a venda sai da comissão). Idempotente
  por `order_id`.
- **Painel → 🤝 Parcerias** (todos os admins): criar/editar cupom, link pronto para copiar, vendas do mês, semestre,
  meta, comissão a pagar (carência de 7 dias depois do pagamento, para cobrir o direito de arrependimento).
- **Primeiro parceiro:** cupom `ENDONEWS` sugerido (15% de desconto, 20%/25%, meta 20/semestre), **criado inativo até o
  professor fechar os números** com o parceiro. Teste: `scripts/test-cupom-parceiro.js`.

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
| Bunny Stream | US$ ~2 | professor (05/10): *"Bunny é bem baixo"* |
| Assinatura Claude (desenvolvimento) | US$ 100 | professor (05/10): *"Claude max 100 dolares/mes"* — a maior linha |
| Domínio e outros | R$ ~5 | estimado |

Câmbio assumido R$ 5,40. **Custo fixo ≈ R$ 935/mês.** Variáveis por aluno:
IA usada pelo aluno (hoje baixíssima: 9 simulados e 8 prescrições em toda a
base; ≈US$ 0,08–0,20 por ação com o núcleo de 20k tokens em cache — usei R$ 8/mês),
taxa do pagar.me (assumi 4,5%) e impostos sobre a receita (assumi 6%).

**Resultado com esses padrões (preço médio R$ 60):** contribuição R$ 45,70 por
aluno; ponto de equilíbrio **21 alunos**; sobra hoje ≈ **R$ 130 por professor**.
Para cada professor receber por mês: R$ 1.000 → **108 alunos**; R$ 2.500 →
**240**; R$ 5.000 → **459**; R$ 10.000 → **896**. A R$ 45 (fundador) os números
quase dobram; a R$ 99 (Gold mensal) caem a pouco mais da metade. Os custos
fixos ficam estáveis até ~1.600 alunos (teto do plano de e-mail).

**O que falta confirmar com o professor:** taxa contratada no pagar.me e
enquadramento tributário (Bunny e Claude confirmados em 05/10).

## FAQ
- Direito de arrependimento: **7 dias** de uso e cancelamento (adicionado na FAQ, #147).

Ver [[Pagamentos pagar.me]] para o fluxo de cobrança.
