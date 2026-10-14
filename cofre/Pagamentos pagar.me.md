---
tags: [cofre, pagamentos, area/pagamentos]
atualizado: 2026-10-14
---

# Pagamentos pagar.me

## 🧨 COBRANÇA EM DOBRO DE UM GOLD ANUAL — E O FURO QUE A PERMITIA (2026-10-14)

**O relato (Instagram, 28/09, só visto em 14/10):** Dr. Pedro Ivo Aranas
(`piaranas@gmail.com`, Sócio-fundador) mandou o print da fatura com **duas compras
"Pg *endodirect en" de 29/06/2026, "Parcela 02 de 12", R$ 45,00 cada** — dois Gold
anuais de R$ 540.

**O que o banco mostra:** uma linha só em `endodirect_acessos` (`plano:gold`, avulso,
`gold:anual:fundador`, pedido `or_wdm1lJJ3TeHAlW20`, cliente `cus_JqQEk0AsMKh62Lpd`,
criada às 09:43:00 e regravada às 09:43:25 UTC, 06:43 em Brasília). ⚠️ **O pedido
duplicado é invisível no banco:**
`order.js` e o webhook gravam por **e-mail + escopo**, então a 2ª compra só regrava a
mesma linha (e o `provider_order_id` fica o do último a gravar). Confirmar os dois
pedidos e estornar exige o pagar.me (painel ou API com a chave secreta).

**O caminho que levava a isso (código até 14/10):**
1. `order.js`/`subscribe.js` **não conferiam se o e-mail já tinha o plano** antes de cobrar.
2. Se a cobrança passava e algo falhava DEPOIS (criar o usuário, gravar o acesso), a
   resposta era 502 "Pagamento temporariamente indisponível. **Tente novamente em
   instantes.**" — com o cartão já cobrado.
3. Se a função passava dos 30 s depois de o pagar.me cobrar, o navegador recebia um 504
   sem JSON e mostrava **"Pagamento não aprovado."** com o botão liberado (A/B no
   Chromium reproduz na main de 14/10).
4. O webhook da 1ª compra liberava o acesso; a nova tentativa cobrava de novo.
No **mensal**, o mesmo caminho criava uma **segunda assinatura** — cobrança em dobro
todo mês, com o id da primeira sobrescrito no banco.

**Correção (14/10):** `lib/acesso-vigente.js` — antes de chamar o pagar.me, as duas
rotas recusam (409 `ja_ativo`, com a data) quem já tem o mesmo plano ativo: mensal no
período, ou anual/cortesia com mais de 30 dias (nos últimos 30 é renovação); quem tem o
mensal também não compra o anual por cima (troca de ciclo passa pelo suporte). Banco fora
do ar não trava a venda (fail-open). Depois da cobrança, falha ao gravar o acesso vira
`ok` com `acesso: 'pendente'` (o webhook libera), nunca "tente novamente"; 5xx vira
`nao_confirmado` com "Não pague de novo". No navegador, resposta que não chega é "não
confirmado": a tela pede para não pagar de novo, trava o botão por 1 minuto e confere
sozinha se o plano comprado apareceu. Teste `scripts/test-cobranca-unica.js` (no CI, 13
de 13 mutações) e harness `scratchpad/checkout-navegador/check.js`.

**Os dois pedidos (print do painel, 14/10):** `Q12T5XANDR` às 06:42:57 (cliente "PEDRO
IVO") e `1ML7SLAV34` às 06:43:12 ("PEDRO IVO S ARANAS"), ambos pagos no cartão, R$ 540
cada, 15 s um do outro. As listas do painel mostram o código e o ID da cobrança (`ch_…`);
o acesso guarda o ID do PEDIDO (`or_…`), que aparece no detalhe do pedido ou buscando
`or_wdm1lJJ3TeHAlW20` em Vendas → Pedidos.

**Como estornar (painel do pagar.me), só com o webhook corrigido no ar (seção abaixo):**
Clientes → `piaranas@gmail.com` (`cus_JqQEk0AsMKh62Lpd`) → manter o pedido
`or_wdm1lJJ3TeHAlW20` (é o que o acesso aponta) e **estornar o outro pelo valor total**.
No parcelado, as parcelas já lançadas voltam como crédito na fatura e as futuras deixam
de ser lançadas; quando isso aparece depende do emissor do cartão.
✅ **Estorno feito em 14/10, às 15h48 UTC (12h48 em Brasília):** a cobrança `Q12T5XANDR`
(pedido `or_dWJ0PX1HwltVQ0LD`), pelo valor total. O webhook corrigido registrou
`nenhum acesso ligado ao evento … pedido=or_dWJ0PX1HwltVQ0LD`, e o Gold dele seguiu
ativo até 29/06/2027, ligado ao `or_wdm1lJJ3TeHAlW20` (`1ML7SLAV34`). **Para o próximo
caso:** no detalhe da cobrança, o campo **ID de origem** é o ID do pedido.
⚠️ Nenhum outro caso conhecido, mas **não dá para descartar pelo banco**: auditar exige
listar os pedidos por cliente no pagar.me (ver [[Pendências]]).

**Auditoria pela API: bloqueada (14/10).** Com a leitura da `PAGARME_SECRET_KEY`
autorizada pelo professor, o conector da Vercel leu o projeto, mas recusou a listagem das
variáveis (403: *"You don't have permission to list the project environment variable"*);
a CLI da Vercel não está no contêiner e não há token. Nada foi contornado, e **a chave não
se pede no chat**. O banco também não reconstitui a 2ª compra: `auth.audit_log_entries`
está vazio (o Auth não grava a auditoria na tabela), o Vault não guarda segredos,
`endodirect_assinaturas` está vazia, e os logs de junho da Vercel (1 h no Hobby) e do
Supabase expiraram. Os 25 s entre a criação e a regravação da linha cabem num pedido só
(checkout e webhook do mesmo pedido), então nem confirmam nem descartam o 2º.
**O que funciona:** o professor confere e estorna no painel; para auditar todos os
clientes, exportar os pedidos do painel (CSV com cliente, valor, data e status) para a
sessão cruzar, ou dar ao conector da Vercel leitura das variáveis de Production. Uma rota
de auditoria no servidor teria de entrar numa função que já existe: `api/` já tem as 12
funções do limite do Hobby.

## 🛡️ ESTORNO VALE SÓ PARA O ACESSO DAQUELE PEDIDO (2026-10-14)

Achado ao preparar o estorno acima, quando o professor perguntou qual pedido manter: o
webhook revogava por **e-mail + escopo** e, quando o evento não trazia escopo, **todos os
acessos do e-mail**. Como as duas compras do mesmo plano são uma linha só, estornar
QUALQUER um dos dois pedidos cancelaria o Gold do assinante. Pela mesma regra, uma
tentativa de compra recusada (`charge.payment_failed`) deixava em atraso um plano já
pago, e a cortesia manual do mesmo e-mail caía junto. O estorno foi segurado até a
correção entrar no ar.

**Correção:** estorno, contestação, cancelamento de assinatura e falha de pagamento mudam
**só a linha cujo `provider_order_id` ou `provider_subscription_id` é o do evento**
(`acessosDoEvento` em `api/webhooks/pagarme.js`), com PATCH pelo `id` da linha. Linha
manual ou interna não tem pedido do pagar.me e nunca é tocada. Evento sem pedido nem
assinatura não muda nada: responde `nenhum_acesso_do_pedido` e registra no log
(`[webhook] nenhum acesso ligado ao evento`) para conferência à mão. Falha ao ler ou
gravar no banco devolve 500, e o pagar.me reenvia (antes, o PATCH não era conferido e a
revogação se perdia em silêncio). Conferido no banco em 14/10: todas as linhas do
pagar.me têm o ID que a regra usa (as avulsas com pedido, as recorrentes com
assinatura). Teste `scripts/test-estorno-so-do-pedido.js` (no CI; 9 de 9 mutações
pegas). Os mesmos cenários contra a versão publicada antes reproduzem o problema: o
estorno do duplicado cancela o Gold, o evento sem pedido cancela tudo e a cortesia cai.
⚠️ **Estornar o pedido que o acesso aponta cancela o acesso**, como deve ser num estorno
de verdade. Em compra em dobro, estornar sempre o OUTRO; se o estornado for o que o acesso
aponta, regravar a linha com o pedido que ficou e reativá-la.
✅ **Formato do evento conferido no estorno real de 14/10** (a documentação está bloqueada
no contêiner): o evento trouxe o pedido num campo que a regra lê, e o log registrou
`pedido=or_dWJ0PX1HwltVQ0LD`. O metadata da cobrança traz o escopo
(`"scope": "plano:gold"`, com `coupon`, `cycle` e `plan`), então a versão anterior teria
de fato cancelado o Gold dele. A regra lê o pedido em `data.order.id` ou
`data.order_id`, e a assinatura em `data.invoice.subscription_id` ou `subscription.id`.
O caminho da assinatura ainda não passou por um evento real.

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
