---
tags: [cofre, pagamentos, area/pagamentos]
atualizado: 2026-06-10
---

# Pagamentos pagar.me

API **v5**. Cartão **tokenizado no navegador** (`POST /core/v5/tokens?appId=PUBLIC_KEY`); o número do cartão **nunca** passa pelo backend nem é armazenado.

## ⚠️ Formato das chaves (importante)
- **Produção (LIVE):** `pk_<id>` e `sk_<id>` — **sem** o segmento `_live_`.
- **Teste:** `pk_test_<id>` / `sk_test_<id>`.
- O health check foi corrigido (#169) para reconhecer LIVE como "qualquer chave que não seja `pk_test_`/`sk_test_`". Não usar regex `^pk_live_`.

## Estado atual
- **Migrado para LIVE** em 2026-06-10. Conta aprovada para produção (CNPJ ativo).
- Chave pública live em produção começa com `pk_2PQDZ...` (confirmado via `/api/checkout/config`).
- **Webhook** criado no ambiente Live com Basic Auth.

## Variáveis de ambiente (Vercel) — só nomes
`PAGARME_PUBLIC_KEY`, `PAGARME_SECRET_KEY`, `PAGARME_WEBHOOK_BASIC_USER`, `PAGARME_WEBHOOK_BASIC_PASS`, `PAGARME_MAX_INSTALLMENTS`, e os valores de plano (ver [[Planos e Preços]]).

## Endpoints
- `api/checkout/config.js` — expõe chave pública + valores + estado da oferta de fundador.
- `api/checkout/order.js` — **plano anual** (pagamento único, 365 dias). Cartão/PIX/boleto. Cartão aprovado libera na hora; PIX/boleto liberam pelo webhook.
- `api/checkout/subscribe.js` — **assinatura mensal** recorrente (preço inline por env).
- `api/webhooks/pagarme.js` — `URL https://www.endodirect.com.br/api/webhooks/pagarme`. Basic Auth (mesmos valores das env). Eventos: `order.paid`, `charge.paid`, `subscription.charged`, `invoice.paid` (libera) · `charge.refunded`, `charge.chargedback`, `subscription.canceled` (revoga) · `*.payment_failed` (past_due). Idempotente. Escopo via `metadata.scope` (ex.: `plano:gold`, `curso:endoteem`).

## ⚠️ Preços em DOIS lugares — manter em sincronia
Os valores MENSAIS aparecem em `config.js` (o que a TELA mostra) **e** em `subscribe.js` (o que COBRA). Os env `PAGARME_TIER_*_AMOUNT` **não estão setados**, então cada arquivo usava seu próprio default. Bug encontrado em 2026-06-11: tela mostrava Gold R$99 (`config.js` 9900) mas a assinatura cobrava R$70 (`subscribe.js` 7000). **Corrigido**: defaults do `subscribe.js` alinhados ao `config.js` (6900/9900/13900). O anual (`order.js`) já batia. **Recomendação:** setar `PAGARME_TIER_STANDARD_AMOUNT=6900`, `PAGARME_TIER_GOLD_AMOUNT=9900`, `PAGARME_TIER_PREMIUM_AMOUNT=13900` na Vercel como fonte única.

## Validação ponta a ponta — FEITA (2026-06-11)
Compra real (cartão, Gold mensal) por gabysfernandes@gmail.com: acesso liberado em `endodirect_acessos` (`plano:gold`, `active`, `recorrente`, `sub_XO3Rq6hPzH5yWmBe`). Confirma pagar.me LIVE → webhook → provisionamento. Pendente do usuário: **cancelar a assinatura** (recorrente — senão cobra de novo) + **estornar** a 1ª cobrança; ao cancelar, o webhook deve revogar o acesso (validar `subscription.canceled`). ⚠️ Cartões de teste não funcionam em LIVE.
