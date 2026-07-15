---
tags: [cofre, pagamentos, area/pagamentos]
atualizado: 2026-07-14
---

# Pagamentos pagar.me

## ⚠️ Mudanças de API do pagar.me — vigência 28/08/2026 (auditado 2026-07-14)
E-mail "Atualização importante na API" + guia https://docs.pagar.me/docs/mudanças-de-apis. São 3 mudanças, com janela de 45 dias (comportamento antigo disponível até ~28/08/26). **Auditoria: nossa integração já é compatível — nenhuma quebra prevista.** Detalhe:
1. **Paginação: dois modelos (`page` OU cursor) → só `forward_cursor`** (offset `page` deixa de funcionar; cursor via headers `x-cursor-nextpage`/`x-cursor-previouspage`). **Impacto: nenhum.** Nossa ÚNICA listagem no pagar.me é `GET /charges?subscription_id=X&size=1` (`subscribe.js`) — só a **1ª página**, com filtro + `size`, **sem `page`** → continua válida no modelo cursor. ⚠️ Não confundir: os `?page=&per_page=` do código (`findUserByEmail` em order.js/subscribe.js/webhook) são do **GoTrue/Supabase Admin**, NÃO do pagar.me — fora do escopo dessa mudança.
2. **Códigos de retorno no padrão ABECS.** **Impacto: mínimo.** Só *exibimos* a string de motivo da recusa (`gateway_response.errors[0].message` / `acquirer_message`), não mapeamos códigos. Hardening feito (2026-07-14): adicionado `acquirer_return_code` como fallback final ao montar o motivo em `order.js` e `subscribe.js` — se o pagar.me remapear os códigos, ainda mostramos algo. Aditivo, sem risco ao fluxo de sucesso.
3. **Cobrança reprocessada após falha de antifraude ganha NOVO `charge_id`** (afeta webhooks de atualização de status). **Impacto: nenhum.** Nosso webhook é **idempotente por e-mail+escopo** (upsert em `endodirect_acessos`), **não** por `charge_id` — não guardamos `charge_id` em lugar nenhum. Um charge reprocessado com id novo ativa o mesmo acesso. (Risco teórico de ordenação: se `charge.payment_failed` do id antigo chegasse DEPOIS do `charge.paid` do id novo, cairia em `past_due` indevido — edge raro, pré-existente; não priorizado.)
**Ação recomendada ao professor:** testar no **sandbox** antes do go-live; nenhuma mudança é forçada. Commit de robustez na branch (não deployado — código de pagamento, aguarda OK p/ subir). Ver [[Integrações]].


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
