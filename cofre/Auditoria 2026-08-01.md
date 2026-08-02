---
tags: [cofre, seguranca, auditoria]
atualizado: 2026-08-02
---

# Auditoria de funcionalidade e segurança — 2026-08-01

## STATUS: 6 de 7 corrigidos — o achado 2 teve a correção REVERTIDA em 02/08

⚠️ Este documento dizia **"TUDO CORRIGIDO"** e **"não regrediu nada"**. As duas frases
estavam erradas: a correção do achado 2 quebrou a conta vitrine e ficou assim por um dia,
até o professor reportar duas vezes. O relato de verificação abaixo foi reescrito para
dizer o que foi realmente medido, e não o que eu supus ter medido.

| # | Achado | Antes | Depois |
|---|---|---|---|
| 🔴 1 | `public_content` sem gate | 2.401 provas / 195 podcasts / 41 mapas pagos / 105 aulas | **50 / 0 / 0 / 3** |
| 🔴 2 | `showcase_resumos` sem filtro de `privado` | 138 capítulos pagos a anon | ⚠️ **correção REVERTIDA em 02/08** — quebrou a vitrine (ver abaixo) |
| 🟠 3 | Discussões do Mural sem login | 35 ids + markdown inteiro | **0 / null** |
| 🟠 4 | `/api/ai` proxy aberto | qualquer `curl` gastava crédito | **401 sem sessão** |
| 🟡 5 | 11 rascunhos | Lípides 6 + Osteo 5 | **0** (professor clicou) |
| 🟡 6 | `.gitignore` sem `.env` | — | coberto |
| 🟡 7 | acesso vencido com `status='active'` | 1 linha | `status='expired'` |

**O que foi de fato medido e não regrediu:** aluno logado segue recebendo as 35
discussões e os 24.921 caracteres do artigo; `member_content`/`member_resumos` não foram
tocadas. Carga anônima caiu de **6.676 kB para 1.700 kB**, tirando o payload público de
cima do teto de ~5,3 MB.

⚠️ **A frase "a conta vitrine segue recebendo os 215 capítulos" era FALSA.** Ela veio de
uma simulação em que eu mesmo injetei o `request.jwt.claims` com o e-mail que supus —
não da chamada que a vitrine realmente faz, que é **anônima, sem JWT**. Medido de
verdade em 02/08: a vitrine recebia **0**. **Verificação que constrói a própria premissa
não é verificação.** A pergunta que faltou: *"quem chama isto na vida real, e com qual
credencial?"*

⚠️ **`endodirect_acessos_ativos()` já conferia `expires_at`** — o acesso vencido nunca
concedeu nada. A pendência era de **contagem**, não de direito de acesso.


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

> ### ⚠️ A CORREÇÃO DESTE ACHADO FOI REVERTIDA EM 02/08 — ela quebrou a vitrine
>
> O gate que apliquei exigia `request.jwt.claims ->> 'email' = 'alunopro@…'`. **Essa
> conta não tem sessão no Supabase:** é conta local do bundle (`var USERS` no
> `index.html`), com a senha publicada no próprio código; o `index.html` até diz
> "a conta demo (alunopro, **sem id**)". Sem JWT, o gate caía sempre no `else` e a
> função devolvia vazio **para todo mundo, inclusive a vitrine**.
>
> **O efeito:** a aba Resumos só mostra capítulo com `privado:true`
> (`dirIsVisibleAnyTipo`), e esses chegavam **exclusivamente** por esta função. A
> vitrine perdeu **149 capítulos** e ficou com a tela em branco — cabeçalho, subtítulo
> e nenhum card. O `public_content` continuava entregando 66 capítulos, mas todos
> públicos, então nenhum aparecia ali.
>
> **⚠️ E eu projetei a falha para ser SILENCIOSA:** escrevi, no registro de 01/08,
> "qualquer outro recebe vazio (**não erro, para o cliente antigo degradar em
> silêncio**)". Foi essa escolha que transformou a quebra numa tela em branco em vez
> de um erro. O professor precisou reportar duas vezes.
>
> **⚠️ E a "verificação" de 01/08 não verificou nada.** Registrei "vitrine segue com
> os 215 capítulos" — medido simulando `request.jwt.claims` com o e-mail que eu mesmo
> supus. Testei o e-mail que inventei, não a chamada que a vitrine faz. É a terceira
> vez na semana que a sonda mede o caminho errado (`window[fn]` 31/07; regex truncado
> por `;` 31/07). **A pergunta que faltou: "quem chama isto na vida real, e com qual
> credencial?"** — bastava um `select ... from auth.users where email ilike '%alunopro%'`,
> que devolve **zero linhas**.
>
> **O gate defendia pouco.** As credenciais da vitrine são públicas no bundle: quem
> lê o código já alcançava esse conteúdo. Ele encarecia marginalmente o mesmo acesso
> e custou uma superfície de produto inteira.
>
> **A defesa de verdade, proposta ao professor e ainda não decidida:** dar
> **identidade real** à vitrine — usuário no Supabase, login de fato, acesso
> revogável e auditável. Aí o gate volta a fazer sentido, e a vitrine pode até usar
> o `member_resumos` comum, sem função especial. Ver [[Pendências]].

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
