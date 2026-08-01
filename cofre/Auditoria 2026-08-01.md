---
tags: [cofre, seguranca, auditoria]
atualizado: 2026-08-01
---

# Auditoria de funcionalidade e segurança — 2026-08-01

Método: papel `anon` simulado **dentro do banco** (`set local role anon`) — o proxy deste
ambiente bloqueia `supabase.co`, mas a simulação exercita exatamente as regras que o
PostgREST aplica. Cada achado foi **medido**, não inferido. O linter do Supabase confirma,
por outro caminho, que as funções abaixo são chamáveis por `anon` via `/rest/v1/rpc/…`.

## 🔴 CRÍTICO 1 — `endodirect_public_content()` não tem gate freemium nenhum

`endodirect_member_content()` implementa o freemium com cuidado (provas por escopo,
podcasts só com `plano`, `mm_shared` sem `tier:member`, cursos por escopo).
`endodirect_public_content()` devolve **`payload->'provas'` cru**, e o mesmo para
podcasts, mapas e cursos. Só filtra `diretrizes.privado` e `fc_shared.tier`.

| Recurso | `public_content` (anon) | `member_content` (o gate certo) |
|---|---|---|
| Questões/provas | **2.401** | 50 |
| Podcasts | **195** | 0 |
| Mapas mentais `tier:member` | **41** | 0 |
| Aulas de curso | **105** | 3 |

**É ao vivo:** `hydratePublicContent()` (index.html ~l.4224) chama essa RPC em **toda
carga sem sessão**. A chave `anon` está no bundle do cliente — qualquer pessoa repete a
chamada com `curl`.

**Correção quase gratuita:** `endodirect_member_content()` **já devolve o payload correto
para anônimo** (medido: 50 provas, 0 podcasts, 3 aulas). Basta o cliente chamar
`member_content` no lugar e **revogar `execute` de `public_content` para anon/authenticated**.
Bônus: a carga anônima cai de **6.676 kB para 1.700 kB**.

## 🔴 CRÍTICO 2 — `endodirect_showcase_resumos()` entrega os Resumos pagos a anon

Filtra `rascunho` e **não filtra `privado`**. Anon recebe **138 capítulos privados**,
**542.878 caracteres** de conteúdo pago, 122 deles com flashcards.
No cliente ela só é usada pela conta-vitrine (`alunopro`), mas o `execute` está aberto —
a exposição independe do que o cliente faz.

## 🟠 ALTO 3 — Discussões do Mural sem qualquer autenticação

`endodirect_mural_discussoes_ids()` devolve os **35 ids** a anon e
`endodirect_mural_discussao(id)` devolve o **markdown inteiro** (24.921 caracteres no
artigo testado). Sem login, sem plano. É o ativo mais caro de gerar (~5.000 palavras,
~US$ 0,19 cada). O cofre já registrava "as RPCs não filtram plano nem rascunho"; o que
faltava dizer é que **não exigem nem estar logado**.

## 🟠 ALTO 4 — `/api/ai` é um proxy Anthropic aberto

Única proteção é Origin/Referer, e o próprio código deixa passar quando o header está
**ausente** ("clientes não-browser") — `curl` sem `Origin` passa. Depois dos blocos
`kind`, o caminho genérico chama a Anthropic com `system` até 60k chars, `prompt` até
200k e `maxTokens` até 8.000, além de aceitar PDF/imagem em base64. Custo na conta do
professor. `kind:'support'` também é aberto (cria ticket + dispara e-mail via Resend) —
vetor de spam.

Mesma fragilidade de origem em `api/checkout/order.js` e `subscribe.js`, que criam
cobranças com a chave **live** do pagar.me — superfície para teste de cartão.

## ✅ O que está correto (testado, não presumido)

- **Escrita como anon: tudo bloqueado.** `endodirect_support`, `global_state`, `acessos`
  (auto-liberar plano), `admins` (virar admin), `mural_discussoes` — todos negados.
- **Leitura direta de tabela como anon: 0 linhas em todas as 15.** RLS ligado em todas.
- **RPCs de admin negam anon:** `admin_students`, `admin_overview`, `admin_overview_perfil`
  levantam `forbidden` via `endodirect_is_admin()`.
- **Webhook do pagar.me é fail-closed:** `auth !== true` rejeita, inclusive quando
  **nenhuma** credencial está configurada (`null`) — sem isso, env sumida viraria acesso grátis.
- **Sem segredo literal versionado** (varredura por padrão de chave em js/html/json/md).
- **Sessão:** `session_claim`/`session_check` devolvem `false` para anon.
- **Produção sem erro:** 24h de logs, só HTTP 200. Cron do radar rodou (artigo mais
  recente de hoje 07h56 BRT).

## 🟡 Funcionalidade

- **11 artigos voltaram a rascunho** — Lípides (6) e Osteometabolismo (5). Diabetes e
  Obesidade seguem liberados. É o clobber do `mergeConcurrent` já documentado; resolve com
  **👁 Liberar todos os rascunhos** nessas duas subs.
- **`payload` em 8,4 MB** e crescendo. O `public_content` (6,7 MB) já passa do teto
  empírico de ~5,3 MB registrado no cofre — corrigir o CRÍTICO 1 resolve os dois.
- **1 linha em `endodirect_acessos`** com `status='active'` e `expires_at` no passado
  (pendência antiga de higiene; toda consulta precisa de `expires_at > now()`).
- **`.gitignore` não cobre `.env`** — hoje não há segredo versionado, mas nada impede.
- **Repescagem de acesso aberto:** mural com 121 de 381 itens com PMC. Não deu para
  atribuir aos logs (retenção curta: só 5 requisições em 24h).
