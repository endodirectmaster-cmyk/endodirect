---
tags: [cofre, dados, supabase]
atualizado: 2026-07-01
---

# Dados e Supabase

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
