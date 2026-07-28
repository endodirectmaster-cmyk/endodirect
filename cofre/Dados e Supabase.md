---
tags: [cofre, dados, supabase]
atualizado: 2026-07-28
---

# Dados e Supabase

## Hydrate do conteúdo por perfil (RPCs) — IMPORTANTE
Quem lê o quê no hydrate (`hydrateRemoteState`, index.html ~l.3593):
- **Admin** (`role='admin'`): lê o `endodirect_global_state` **direto** (`select payload,updated_at where id='main'`) → vê **tudo**, inclusive resumos privados e todas as provas. (Por isso um bug de entrega ao aluno **não aparece** no painel do professor.)
- **Aluno real** (tem `currentUser.id`): NÃO lê o global direto. Chama **`endodirect_member_content()`** (curado por acesso) **+ `endodirect_member_resumos()`** (diretrizes/Resumos). SECURITY DEFINER; gate por `endodirect_acessos_ativos()` (retorna `'plano'` p/ qualquer assinante ativo standard/gold/premium).
- **Demo/visitante** (sem `id` — inclui a conta demo **`alunopro`**): chama **`endodirect_public_content()`** + (desde 2026-07-21) **`endodirect_member_resumos()`** para os Resumos aparecerem na vitrine/degustação.
- **`endodirect_member_content()`** entrega: `acessos`, `cursos`, `adm_avisos`+`radar_avisos`, `ig_stories`, **diretrizes públicas** (privado≠true), `diretrizes_temas`, **provas** (assinante = tudo que **não é TEEM** → Endodirect + residências; EndoTEEM = Endodirect+TEEM; degustação = 50 do Endodirect), `podcasts`/`mm_shared`/`fc_shared`/`adm_cursos` gated por plano/tier. ~4,6 MB p/ assinante.
- **`endodirect_member_resumos()`** (criado 2026-07-21, RPC leve ~1,5 MB) entrega só `diretrizes` (públicas **+ privadas/Resumos**: assinante recebe todas; degustação recebe **1 por subespecialidade *e por tipo*** — ver abaixo) + `diretrizes_temas`. **Por que separado:** juntar os 106 resumos no member_content levava a resposta a ~5,3 MB e ela **deixava de chegar** ao cliente (Resumos vazio). Separar mantém cada resposta pequena e robusta.
  - **Degustação por tipo (2026-07-25):** o `distinct on` do ramo de degustação passou de `(sub)` para `(sub, coalesce(tipo,'capitulo'))` (migração `member_resumos_degustacao_por_tipo`). Sem isso, com a aba **Artigos**, um trial podia ocupar a vaga única da área e deixar a aba **Capítulos** vazia na degustação. Itens sem `tipo` contam como `capitulo` → nada mudou para o acervo existente (14 áreas × 1 capítulo, conferido).

### Estado `rascunho` — item gravado que só o professor vê (2026-07-25)
Um item de `diretrizes` com **`rascunho:true`** é filtrado **no servidor**, não só no cliente. Migração `diretrizes_rascunho_so_no_painel_do_professor`:
- **`endodirect_member_resumos()`** — `and coalesce(v->>'rascunho','') <> 'true'` nos **3 ramos** (público, assinante `@> array['plano']`, degustação). Os três, senão o filtro vaza pelo ramo esquecido.
- **`endodirect_showcase_resumos()`** — mesmo predicado.
- **`endodirect_member_content()` / `endodirect_public_content()`** — **não** precisaram: já entregam só `privado <> 'true'`, e todo rascunho nasce privado. (Se algum dia existir rascunho público, aí sim precisam do filtro.)
- **Admin não é afetado:** lê o `payload` direto, então vê o rascunho — que é o objetivo.
- **Como conferir depois de mexer nisso** (deve dar 0 em todos os cenários):
  ```sql
  select 'showcase' r, (select count(*) from jsonb_array_elements(endodirect_showcase_resumos()->'diretrizes') v where v->>'tipo'='artigo')
  union all select 'public', (select count(*) from jsonb_array_elements(endodirect_public_content()->'diretrizes') v where v->>'tipo'='artigo');
  ```
- **Estado atual (2026-07-28):** **43 artigos** gravados com `tipo:'artigo'`, `privado:true`, `rascunho:true` — 13 Diabetes, 19 Obesidade (inclui os 3 comparativos em tabela), **6 Lípides** e **5 Osteometabolismo**. **40 têm ficha (`info`)**; os 3 comparativos não têm, de propósito.
  - Conferência: `resumo` e `pts` por md5 (`audit_resumos.js`, 43/43) e a ficha por hash espelhado em SQL (`check_info_db.js` + `check_info_db.sql`, 40/40). Fonte de verdade do conteúdo: `scratchpad/artigos/trials*.js` + `info*.js` + `comparativos.js`.



## Tabelas

- `endodirect_global_state` — `id='main'`, coluna `payload` (JSONB). Estado global compartilhado (provas, avisos, radar, podcasts, cursos, estudantes, chaves de newsletter). Ver mecanismo `globalServerKeys` em [[Arquitetura]].
- `endodirect_app_state` — estado por usuário: `email` + `payload` (JSONB). Inclui `user_profile`. **Só guarda chaves PESSOAIS** (`q/fc/mm/notes/crono/sf_results/perf/adm_perfil/user_profile/deg_trials/ck_billing/presc_emitidas` = `PERSONAL_STATE_KEYS`); o conteúdo global (provas, mural/`radar_avisos`, podcasts, cursos, diretrizes…) vive **só** no `endodirect_global_state`/RPC de membro. Por isso `applyStatePayload(payload, personalOnly=true)` é usado ao hidratar o `app_state` do próprio usuário: aplica apenas as chaves pessoais e **nunca** toca no conteúdo global. Sem isso, um `app_state` com resíduo antigo de `radar_avisos` defasado podia, ao resolver depois do estado global no `Promise.all` do hydrate, sobrescrever os artigos novos do radar — bug "F5 atualiza e ~2s depois volta ao antigo" (recorrente). Fix 2026-06-15.
- `endodirect_admins` — e-mails de administradores.
- `endodirect_cursos` — cursos (coluna `tier`).
- `endodirect_state_backup` — backups manuais do estado. (RLS ON sem policy = só service_role — padrão seguro, item INFO do linter.)
- `endodirect_acessos` — acessos liberados (escopo, status, validade). Alimentada pelo checkout e pelo [[Pagamentos pagar.me|webhook]].
- `endodirect_devices` — anti-compartilhamento: dispositivos ativos por aluno `(user_id, device_id, last_seen)`. Limite de **2**; RPCs `endodirect_session_claim` (login, mantém os 2 mais recentes) e `endodirect_session_check` (heartbeat). Cliente: `device_id` em `localStorage`, heartbeat 60s, expulsa com overlay "Sessão encerrada". Só para `role='aluno'` (admins isentos). DDL em `supabase/device-session-limit.sql` (migration `device_session_limit`).

## Save do estado global (admin) e concorrência
O save do admin (`saveRemoteState`, role=admin) faz read-modify-write do `endodirect_global_state`: relê o payload, **preserva as chaves de servidor** (`radar_avisos`, `newsletter_*` — escritas só pelo cron) e, **se `updated_at` mudou desde o load** (`lastGlobalUpdatedAt`), MESCLA as coleções aditivas (`GLOBAL_MERGE_KEYS`: adm_cursos, podcasts, provas, mm_shared, diretrizes, diretrizes_temas, curso_mods_extra, adm_estudantes). A mescla é **baseada em baseline** (`mergeConcurrent`): parte do estado local atual (honra minhas exclusões/edições) e só acrescenta itens do servidor cuja chave é **nova desde o baseline da sessão** (`captureGlobalBaseline`, capturado junto com `lastGlobalUpdatedAt` no load e em cada save). Assim adições de outro editor/cron são preservadas e exclusões não voltam. **Histórico:** o #305 usava `unionBy` (server∪local), que ressuscitava exclusões — bug "apago tema de Diretrizes e volta no F5", disparado até pelo cron do radar bumpando `updated_at`. Substituído pelo merge com baseline em 2026-06-15.

### ⚠️ Como gravar `diretrizes` pelo SQL sem ser atropelado (2026-07-27)
O merge com baseline vale **entre saves do cliente**. Uma gravação minha, feita direto no Postgres, **não entra nesse baseline**: a aba que já estava aberta segue com o payload antigo em memória e, no save seguinte, reescreve o blob inteiro por cima. Foi assim que **três gravações minhas sumiram** (STEP-2 e os dois comparativos) — e o rastro é sempre o mesmo: `updated_at` recente com um UUID de usuário.

Três regras que ficaram:
1. **Peça o F5 antes.** É o único jeito de a aba do professor passar a carregar o meu estado. Só gravo depois de ele confirmar.
2. **Uma gravação só.** Juntar todas as mudanças num único `UPDATE` encurta a janela de risco de minutos para segundos.
3. **Trava otimista + merge de topo.** O padrão:
   ```sql
   with ops(tema, novo) as (values ('Tema no banco','{...}'::jsonb), ...)
   update endodirect_global_state g
   set payload = jsonb_set(g.payload,'{diretrizes}',
         (select jsonb_agg(case when o.novo is null then d else d || o.novo end order by i)
            from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d,i)
            left join ops o on o.tema = d->>'tema')),
       updated_at = now()
   where g.id='main' and g.updated_at = '<lido segundos antes>'::timestamptz
   returning jsonb_array_length(payload->'diretrizes') as n;
   ```
   - **`d || o.novo` (merge de chaves de topo), nunca substituir o item inteiro:** preserva `rascunho`, `privado`, `ordem`, `id` e qualquer campo editorial que o professor tenha mexido. Substituir o objeto desfaria uma publicação feita entre a minha leitura e a minha escrita.
   - **`where updated_at = <lido antes>`:** se alguém gravou no meio, o `UPDATE` afeta **0 linhas** e eu fico sabendo. Sem isso, eu sobrescreveria em silêncio — sendo exatamente o problema de que estou me defendendo.
   - **`returning` sempre**, e conferir hash/tamanho logo depois. "Não deu erro" não é verificação.

### ACRESCENTAR itens novos: guarda de idempotência em vez de trava otimista (2026-07-28)
Para **inserir** artigos/capítulos (em vez de editar os existentes), a trava por `updated_at` tem um efeito ruim: se ela falhar no meio de uma sequência de inserções, metade do lote entrou e a outra metade não, e reexecutar duplica. Para *append*, a guarda certa é **pelo `tema`**:
```sql
with novos(j) as (values ($a$ {...} $a$::jsonb), ($b$ {...} $b$::jsonb))
update endodirect_global_state g
set payload = jsonb_set(g.payload,'{diretrizes}',
      (g.payload->'diretrizes') || coalesce((
        select jsonb_agg(n.j) from novos n
        where not exists (select 1 from jsonb_array_elements(g.payload->'diretrizes') d
                          where d->>'tema' = n.j->>'tema')), '[]'::jsonb)),
    updated_at = now()
where g.id='main'
returning jsonb_array_length(payload->'diretrizes') as n_total;
```
- **Reexecutar é seguro:** quem já está lá não entra de novo, então dá para quebrar um lote grande em várias chamadas sem medo de duplicar nem de perder o meio.
- **`coalesce(..., '[]')` importa:** sem ele, se *todos* os itens já existissem, o `jsonb_agg` devolveria NULL e o `||` **apagaria o array inteiro**.
- **O `$a$…$a$` é obrigatório** porque o conteúdo tem aspas simples e barras invertidas por todo lado. Escolher um delimitador que comprovadamente não aparece no texto.
- Continua valendo pedir o F5 antes e **conferir depois** (md5 do `resumo` e do `pts`, hash do `info`) — ver `scratchpad/artigos/check_info_db.sql`.

## Endurecimento de segurança (2026-07-01)
Após o linter do Supabase (`get_advisors`), aplicados via MCP (ref. versionada em `supabase/security-hardening-2026-07.sql`):
- **Dropada `public._aulaq_stage`** (colunas `seq/b64`): tabela de STAGING órfã de um upload base64 de um script SQL grande (99 KB, começava com `update endodirect…`, já executado). **RLS estava DESABILITADO** (único caso `critical`) → exposta pela anon key; não referenciada por nada. Removida (sem dado vivo).
- **Revogado EXECUTE público de `endodirect_trial_email_targets()`** (de `anon, authenticated, public`): é SECURITY DEFINER e retorna e-mails de alunos em degustação; devia ser só do cron (service role, `lib/trial-emails.js`), mas o grant público nunca fora revogado → a anon key podia listar e-mails. O service role **ignora grants**, então o cron segue funcionando.
- **Sem ação (por design):** os demais RPCs SECURITY DEFINER executáveis por anon/authenticated são o modelo do app (conteúdo público/membro por `auth.uid()`, sessão de dispositivo, e as de admin que fazem `raise 'forbidden'` internamente). `endodirect_support`/`endodirect_state_backup` com RLS ON sem policy = só service_role (seguro).

## RLS e RPCs (security-definer)
- `endodirect_member_content` — conteúdo do membro.
- **Direito de acesso / planos (`endodirect_acessos`):** o acesso pago é concedido pela RPC `endodirect_acessos_ativos()`, que só conta linhas com **`status='active'` E (`expires_at` nulo ou futuro)** (também soma `endodirect_assinaturas` ativas; hoje 0 linhas). Ranqueia `plano:standard`(1) < `plano:gold`(2) < `plano:premium`(3) e injeta `plano` + os `curso:<slug>` até o tier. O painel Estudantes (`endodirect_admin_students`) mostra o plano com o MESMO gate (`status='active'`). **Para cancelar/remover alguém de um plano:** basta a linha NÃO estar `active` (ou expirar) — `update endodirect_acessos set status='canceled', expires_at=now() where lower(email)=... and scope like 'plano%'`. Preferir MANTER a linha (histórico do pagamento: `provider_order_id`, `notes`) e documentar em `notes`, em vez de deletar. O **webhook do pagar.me** ([[Pagamentos pagar.me]]) já seta `status='canceled'` no estorno/cancelamento — conferir antes de agir manualmente (a conta continua existindo, só cai para Degustação).
- `endodirect_admin_overview` — visão do admin (analytics). Agrega do `app_state` dos alunos. Retorna: `alunos`, `ativos`, `respostas`, `acertos`, `simulados`, `flashcards`, `mapas`, `ultima_atividade`, `por_area`, `simulado_media`, `simulados_recentes`, e **origem geográfica**: `com_uf`/`por_uf` (UF de `user_profile.uf` com fallback `ck_billing.uf` — de todos) e `com_cidade`/`por_cidade` (cidade de `ck_billing.city` — só de quem fez checkout). A definição **não** está no `supabase-setup.sql`; é mantida por migration na base (ex.: `admin_overview_add_geo`). O check de admin é via `auth.jwt()->>'email'` — não dá para chamar pela service role.

## Shapes de dados (cliente)

- **Flashcard:** `{id, front, back, cat, due?, box?, at, seed?}`
- **Mapa mental:** `{id, topic, sub?, data:{root, branches:[{label, leaves:[string]}]}, at, seed?}`
- **Nota (Caderno):** `{id, title, body (HTML do editor contenteditable), at}`
- **Questão:** `{stem, options:{A..E}, answer:'A', explanation, area, inst, ano?, code, type, at}`
- **`perf`:** `{ [categoria]: {total, correct} }` (agregado — **não** há lista de questões erradas individuais).

## `user_profile`
Campos: `perfil` (Residente/Endocrinologista/Outros), `graduacao`, `residencia`, `especialidade`, `displayPerfil`, `crm`, `uf` (prescrição), `newsletterSubs[]` (subespecialidades de interesse — ver [[Newsletter e Radar]]).

## Cobrança cross-device
`ck_billing` (nome, CPF, telefone, endereço) salvo no `app_state` por usuário e pré-preenchido no checkout. **Cartão nunca é armazenado** — ver [[Pagamentos pagar.me]].
