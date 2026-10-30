-- O ACERVO SÓ É LIDO DIRETO POR ADMINISTRADOR (30/10/2026).
--
-- 🧨 O QUE ESTAVA ABERTO. A política de SELECT de `endodirect_global_state` era
-- `using (true)` para o papel `authenticated`. Qualquer usuário LOGADO — mesmo
-- grátis, em degustação, sem plano — conseguia ler o `payload` inteiro
-- (~16,7 MB, 233 diretrizes) direto pela API REST
-- (`GET /rest/v1/endodirect_global_state?select=payload`), com a chave pública
-- que está no index.html. Isso furava a degustação: dava para baixar todo o
-- conteúdo pago com um cadastro grátis. Confirmado em 30/10 trocando o papel
-- para `authenticated` comum: 1 linha, 233 diretrizes, 16,7 MB visíveis.
--
-- Mesma classe do vazamento da vitrine (02/08, `endodirect_showcase_resumos`
-- aberta a `anon`): uma regra larga demais numa leitura do acervo.
--
-- ✅ POR QUE FECHAR ASSIM NÃO QUEBRA NINGUÉM.
--   * Só o PAINEL DO PROFESSOR lê o acervo direto — quatro pontos no index.html,
--     todos sob `currentUser.role==='admin'` (hidratação do login, save do
--     painel e os dois botões do mural). Um admin de verdade está em
--     `endodirect_admins`, então `endodirect_is_admin()` devolve true e ele
--     continua lendo.
--   * Os ALUNOS nunca leem o acervo direto: recebem pelas RPCs
--     `endodirect_member_resumos` e `endodirect_member_resumos_pagina`, que são
--     SECURITY DEFINER do dono da tabela (postgres) e, como a tabela não tem
--     FORCE RLS, passam por cima da RLS e aplicam a regra de degustação.
--   * O SERVIDOR escreve com `service_role`, que ignora a RLS.
--
-- Escritas já estavam certas: INSERT/UPDATE/DELETE exigem `endodirect_is_admin()`.
-- Só a leitura estava aberta.
--
-- Verificado depois de aplicar (trocando o papel no banco):
--   autenticado comum → 0 linhas; admin de verdade → 1 linha; aluno pela RPC →
--   28 itens (amostra, não 233); anon → permissão negada.

-- 1. A leitura direta passa a exigir administrador (e o nome da política reflete isso).
alter policy endodirect_global_state_read_authenticated
  on public.endodirect_global_state using (public.endodirect_is_admin());
alter policy endodirect_global_state_read_authenticated
  on public.endodirect_global_state rename to endodirect_global_state_read_admins;

-- 2. Aperto dos privilégios de tabela (defesa em profundidade).
--    O anon nunca toca o acervo direto (não há política para ele); tira os
--    privilégios largos que sobravam. Do authenticated, tira os três que NÃO
--    passam pela RLS (TRUNCATE, REFERENCES, TRIGGER) — o TRUNCATE, em especial,
--    apagaria a tabela sem a RLS olhar (não é exposto pela REST, mas não há
--    razão para o papel tê-lo). O authenticated mantém SELECT/INSERT/UPDATE e o
--    apagar, todos barrados pela RLS para quem não é admin; o upsert do painel
--    (INSERT/UPDATE) segue funcionando.
revoke all on table public.endodirect_global_state from anon;
revoke truncate, references, trigger on table public.endodirect_global_state from authenticated;
