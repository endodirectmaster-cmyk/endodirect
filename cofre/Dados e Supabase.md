---
tags: [cofre, dados, supabase]
atualizado: 2026-10-31
---

# Dados e Supabase


## 📦 Armazenamento dos livros e dos recortes (18/10/2026)

- **Bucket `livros` (privado):**
  - limite de 200 MB; aceita pdf, zip, png, jpeg, webp e csv;
  - o professor sobe pelo painel do Supabase;
  - hoje: `endocrinologia_basica_figuras…zip` (68 recortes originais), `imagens_endocrinologia_b…` (os mesmos, traduzidos), `indice.csv` e `indice_PT.csv`.
- **`endodirect-assets/resumos/livros/` (público):** os recortes prontos que os resumos usam (70: 19 do lote 1 e 51 de diabetes, em 19/10). A URL vai direto no markdown do capítulo.
- **Funções temporárias:**
  - `baixar-livros` (URL assinada para baixar do `livros`) e `subir-figuras-livros` (envio para o público).
  - Protegidas por token: só o hash fica no código, o token fica num arquivo da sessão.
  - As duas estão desativadas (410), porque a ferramenta do Supabase não apaga função.
  - A `subir-figuras-livros` voltou a funcionar em 19/10, com token novo e prazo, para as 51 de diabetes. Depois voltou ao 410 (versão 5), e o token foi apagado.
- **⚠️ Chave de serviço na função:** use `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` do supabase-js. Com `fetch` direto e `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`, o Storage respondeu 403 "Invalid Compact JWS" (18/10).

## 🖼️ Open-i fora do ar: figura de artigo fica em cópia própria (25/10/2026)

- **O que aconteceu.** Em 25/10 o Open-i (`openi.nlm.nih.gov`, da NLM) entrou em
  manutenção. Toda URL de imagem passou a devolver uma página HTML ("The web site is
  currently under maintenance"), e as figuras ligadas direto a ele quebraram nos Resumos
  (o professor mandou print de 111 e 113).
- **O que havia:** 12 links do Open-i no acervo.
  - 2 estavam em figuras de capítulo (111 e 113).
  - 10 estavam em `ig_stories` (stories do Instagram, só do professor).
- **Regra:** figura de artigo que vai para os Resumos fica em cópia própria, em
  `endodirect-assets/resumos/pmc/`. Ela não fica ligada ao Open-i nem ao PMC, e só entra se
  a licença for CC BY, CC0 ou domínio público (regra de 16/07).
  - Onde baixar: o espelho do PMC na AWS (`pmc-oa-opendata.s3.amazonaws.com/PMCxxxx.1/`)
    dá a imagem e o `license_code`. Daqui, o PMC, a Europe PMC e o `ftp` do NCBI dão 403
    no proxy.
  - Como subir: pela `subir-figuras-livros`, com prefixo `resumos/pmc/`, token por hash e
    prazo.
- **Feito:**
  - 111 (PMC4745619, CC BY 4.0): a Figura 1 (soro lipêmico e lipemia retinalis) foi para
    `resumos/pmc/PMC4745619_CRIE2016-7515721.001.jpg`. A legenda ganhou título descritivo
    e "CC BY 4.0".
  - 113 (PMC3513909, Dove 2012, "unrestricted noncommercial use"): a figura saiu.
  - Backup: `main-antes-figuras-openi-2026-10-25`.
- **Prazo da função e confirmação do deploy.** O deploy ficou ~25 min esperando a
  confirmação de permissão, e a v12 entrou já vencida, com 20 min de prazo (410
  "expirada", nada gravado). A v13, com 60 min, serviu, e a v14 voltou ao 410.
  - Enquanto a regra do `.claude/settings.json` não valer na sessão em curso, dar 60 min
    de prazo.

## ✍️ Gravar item grande do acervo: função `gravar-diretriz` (25/10/2026)

- **Para quê:** uma Diretriz completa tem ~30 mil caracteres, e o SQL com o item inteiro dá
  ~55 KB por instrução. A função recebe o item por POST e roda **um** comando SQL no banco
  (`postgres` do npm com o `SUPABASE_DB_URL`, que a função já recebe do Supabase).
- **O que o comando faz:** só grava se o md5 do item de hoje (jsonb inteiro) e o do item
  novo, lido pelo Postgres, forem os informados; faz o backup em
  `endodirect_global_state_backup` antes; devolve se o item ficou certo e se o resto do
  acervo e do payload ficou igual. A resposta traz sempre os dois md5 calculados no servidor.
- **Ensaio:** mandar o md5 "de hoje" zerado. A guarda barra, nada é gravado e a função
  devolve os md5 do servidor para comparar com os locais.
- **Proteção:** token só como sha256 no código, prazo e lista de posições permitidas. Depois
  do uso, volta ao 410 e o token é apagado. Usada em 25/10 para as Diretrizes 18 e 35 e
  para o lote 1 da auditoria (1, 45, 46, 47, 50, 232).
- **O prazo curto já salvou uma vez (25/10):** ativei a v3 com prazo de 45 min e a sessão
  parou por 5h40 antes do ensaio. Na volta, a função respondia 410 sozinha, sem ter ficado
  aberta a noite toda. Reativei com token e prazo novos (v4, 30 min), gravei e voltei ao 410
  (v5) em 2 minutos. **Token e prazo novos a cada ativação; nunca reaproveitar.**
  No lote 2 aconteceu de novo: a v6 foi publicada depois de 4 h de sessão parada, já com o
  prazo vencido; v7 com token e prazo novos (20 min) gravou 7, 14, 15, 25 e 59, e a v8 voltou
  ao 410. Em 30/10, a v9 (token e prazo novos, 60 min) gravou 36, 57 e 58, e a v10 voltou ao
  410, com o token apagado. Em 31/10 (lotes 3 e 4) a sessão reiniciou entre a preparação e o
  deploy: a v11 entrou no ar já vencida (410). A v12, com token e prazo novos gerados no
  minuto do deploy, gravou 62, 216, 30 e 63 em 30 s, e a v13 voltou ao 410, com o token
  apagado. **Gerar token e prazo imediatamente antes do deploy, nunca antes de outra etapa.**
  Lote 5 (31/10, 12h30 UTC): v14 (token e prazo de 60 min gerados no minuto do deploy) gravou
  11 e 16, e a v15 voltou ao 410; token apagado. Às 13h08, v16 gravou os capítulos 92 e 121 (mesmo array; o
  backup e o motivo dizem "capítulo", pelo `ferramentas/grava_cap.py`), e a v17 voltou ao 410.
  Desde 25/10 o deploy da função está liberado em `.claude/settings.json`
  (`mcp__Supabase__deploy_edge_function`).
- **md5 do jsonb fora do banco:** o texto do jsonb sai com as chaves ordenadas por tamanho e
  depois por bytes, `", "` entre itens e `": "` entre chave e valor. O `pg()` de
  `scratchpad/cap86-89/monta.py` reproduz isso; o md5 bateu com o do servidor nos 4 itens
  testados.
- **`exportar-capitulos`** passou a devolver o item inteiro (`{pos, item}`), não só o resumo
  (25/10, versão 13). Está em 410 de novo.

## 🧨 O conector segura DELETE até dentro de função (19/10/2026)

- `CREATE FUNCTION` com `delete from ...` no corpo ficou retido para confirmação e
  expirou em 60 s, duas vezes (apply_migration e execute_sql), sem aplicar nada. A
  mesma função só com SELECT e UPDATE foi criada na hora.
- **De novo em 25/10, num ensaio.** O ensaio do cache das páginas dos Resumos tinha
  `delete` dentro de uma função temporária (`pg_temp`), e o `execute_sql` ficou retido e
  expirou em 60 s sem executar nada.
  - A regra vale também para ensaio e função temporária: o texto enviado pelo conector
    não leva DELETE.
  - Para substituir linhas antigas, usar `on conflict ... do update` sobre uma chave fixa.
- **Regra:**
  - função nova que precisa apagar linhas não vai pelo conector;
  - quem apaga é o servidor do app (REST com a chave de serviço), pela chave
    primária que a função devolve;
  - ou o professor cola o SQL no editor.
  - Também vale para recriar função que já tem DELETE: `endodirect_session_claim`
    não pôde receber a isenção da conta de revisão.
- **Aplicado assim:** `endodirect_exclusao(uid, 'listar'|'anonimizar')`, só para
  `service_role` (revoke de public/anon/authenticated e guarda por `auth.role()`).
  Versionada em `supabase/excluir-conta-e-revisao-lojas.sql`; o resto da exclusão está
  em `lib/excluir-conta.js`.
- **Contas fora das contagens** (a régua `endodirect_email_de_teste` e as 4 listas das
  RPCs do painel): `aluno@`, `alunopro@`, `memed.teste@` e, desde 19/10,
  `revisao@endodirect.com.br`.

## 🗑️ Apagar tabela: pelo editor SQL, não pelo conector (17/10/2026)

O conector do Supabase segura `DROP TABLE` até uma confirmação em janela própria, que
expira em 60 s. Expiraram todas as tentativas, inclusive com o professor na conversa
(12/10 e 17/10), e o "Ok" no chat não conta como essa confirmação. O caminho que
funciona: o professor cola o SQL com guarda no editor (SQL Editor → New query → Run).
Assim saiu a `tmp_estudos_2026` em 17/10.

## 🔒 O acervo só é lido direto por administrador (30/10/2026)

- **Furo fechado.** A política de SELECT de `endodirect_global_state` era
  `using (true)` para `authenticated`: qualquer usuário logado, mesmo grátis,
  lia o `payload` inteiro (16,7 MB, 233 diretrizes) direto pela API REST, com a
  chave pública do index.html — furando a degustação.
- **Conserto** (`supabase/acervo-leitura-so-admin.sql`, migração
  `acervo_leitura_so_admin_e_grants`):
  - a leitura direta passa a exigir `endodirect_is_admin()`;
  - a política virou `endodirect_global_state_read_admins`;
  - `revoke all` do anon e tira TRUNCATE/REFERENCES/TRIGGER do authenticated.
- **Por que não quebra:** só o painel do professor lê o acervo direto (sob
  `role==='admin'`); os alunos leem pelas RPCs SECURITY DEFINER, que passam por
  cima da RLS; o servidor usa `service_role`. Escritas já exigiam admin.
- **Conferido** (trocando o papel no banco): autenticado comum 0 linhas, admin 1,
  aluno pela RPC 28 itens, anon permissão negada.
- **Lição:** é a mesma classe do vazamento da vitrine (02/08). Toda leitura do
  acervo por papel de cliente é larga por padrão — conferir a política, não só o
  grant.

## ⚡ Páginas dos Resumos com cache (25/10/2026)

- **A entrega aos alunos.** `endodirect_member_resumos_pagina(p_pagina)` entrega as
  Diretrizes e os Resumos em páginas de 20, a partir da lista de
  `endodirect_member_resumos()`.
  - Desde a 2ª versão (25/10, ~17h40 UTC), as páginas saem prontas de
    `endodirect_resumos_paginas_cache`.
  - O SQL está em `supabase/resumos-em-paginas.sql`, e o teste em
    `scripts/test-resumos-em-paginas.js`.
- **Por que o cache.** A 1ª versão (stable, SQL puro) remontava a lista inteira a cada
  página.
  - Isso custava ~0,2–0,35 s de banco por página, e as 11 páginas paralelas de um
    assinante chegaram a ~7–8,3 s.
  - Resultado: estouro do `statement_timeout` de 8 s do `authenticated` às 12h06 e às
    17h38 UTC (HTTP 500, 57014).
- **Linha e chave.**
  - A linha é (escopos, página). `escopos` é o md5 de `endodirect_acessos_ativos()`
    ordenado; a regra de member_resumos só olha os escopos (conferido em 25/10: não usa
    `now()` nem `auth.uid()` fora deles).
  - A `chave` junta o `updated_at` do acervo em microssegundos (renovado pelo gatilho) e
    o md5 do corpo de `endodirect_member_resumos` e `endodirect_amostra_espalhada`.
  - Chave nova sobrescreve as linhas por `on conflict do update`: uma versão por conjunto
    de escopos, sem DELETE.
  - Em 25/10 eram ~3 conjuntos de escopos de alunos ativos, e o assinante ocupava 2,6 MB.
- **Na falta,** a página sai da lista em memória. A gravação do cache fica num bloco
  `exception` que só avisa no log do Postgres.
- **Fechado para a API.** RLS sem política e `revoke all` de anon/authenticated. Pela
  API, a tabela dá 401 (42501).
- **Medido** (25/10):

  | perfil | 1ª página de uma versão nova | páginas seguintes |
  |---|---|---|
  | assinante | 358 ms | 2–5 ms |
  | visitante | 145 ms | — |

  Por HTTPS como anon, as páginas juntas foram iguais à chamada única.
- **Volátil.** A função é `volatile`; o PostgREST a roda em transação de escrita
  (POST), e a migração termina com `notify pgrst, 'reload schema'`.

## Hydrate do conteúdo por perfil (RPCs) — IMPORTANTE
Quem lê o quê no hydrate (`hydrateRemoteState`, index.html ~l.3593):
- **Admin** (`role='admin'`): lê o `endodirect_global_state` **direto** (`select payload,updated_at where id='main'`) → vê **tudo**, inclusive resumos privados e todas as provas. (Por isso um bug de entrega ao aluno **não aparece** no painel do professor.)
- **Aluno real** (tem `currentUser.id`): NÃO lê o global direto. Chama, em paralelo, **`endodirect_member_content_sem_provas()`** (curado por acesso) **+ as páginas de `endodirect_member_provas_pagina()`** (questões, desde 12/10/2026) **+ `endodirect_acessos_ativos()` + `endodirect_qotd_publicadas()`**, e as **páginas de `endodirect_member_resumos_pagina()`** (diretrizes/Resumos, desde 25/10/2026; recurso à `endodirect_member_resumos()` se a função paginada não existir) depois do conteúdo. SECURITY DEFINER; gate por `endodirect_acessos_ativos()` (retorna `'plano'` p/ qualquer assinante ativo standard/gold/premium).
- **Demo/visitante** (sem `id` — inclui a conta demo **`alunopro`**): chama **`endodirect_public_content()`** + (desde 2026-07-21) os Resumos para aparecerem na vitrine/degustação — desde 25/10/2026 pelas páginas de **`endodirect_member_resumos_pagina()`**, como o aluno.
- **Conteúdo do assinante em DUAS cargas paralelas desde 12/10/2026** (corpo completo em `supabase/provas-em-rpc-propria.sql`; ver [[Decisões]] 2026-10-12):
  - **`endodirect_member_content_sem_provas()`** — o que o app chama (`carregarConteudo`, 3 tentativas): `acervo_totais`, `member`, `acessos`, `cursos`, `adm_avisos` (avisos do professor + **radar janelado nos 200 mais recentes**, ambos sem o que está em `radar_hidden`; o resto do radar vem por `endodirect_mural_radar_more`), `radar_hidden`, `podcasts`/`mm_shared`/`fc_shared`/`adm_cursos` gated por plano/tier. **~1,55 MB p/ Gold** (12/10/2026). ⚠️ NÃO entrega `diretrizes`/`diretrizes_temas` (desde 24/09) nem `provas` (desde 12/10).
  - **`endodirect_member_provas_pagina(p_pagina)`** — o que o app chama para as questões (`carregarProvas`): página de **500** da lista do aluno, com `versao` (md5 da lista inteira), `total`, `paginas` (mínimo 1) e `pagina`; página fora do intervalo devolve `itens` vazio. O app pede a 0, depois as demais em paralelo, cada uma com 3 tentativas; versões diferentes entre páginas → recomeça uma vez, depois erro; **nada parcial é aplicado**. Páginas de ~0,9–1,1 MB: Gold 5 páginas (2.135), Gold com EndoTEEM 7 (3.015), degustação 1 (50).
  - **`endodirect_member_provas()`** — a REGRA das questões, num lugar só: assinante (`plano`) = tudo que **não é TEEM** → Endodirect + residências; `curso:endoteem` sem plano = Endodirect + TEEM; degustação = 50 do Endodirect (ordem md5); TEEM só com `curso:endoteem`. ACL **só `service_role`** (as outras a chamam como dona, SECURITY DEFINER).
  - **Conferido em produção (12/10, 01h45–13h05 UTC, logs de borda):** 14 cargas de conteúdo e 59 páginas, **todas 200**; o `member_content` antigo **não foi chamado nenhuma vez** depois do deploy (o service worker é network-first para o HTML); cada carga do Gold com as 5 páginas, a última ~0,5 s depois da página 0. A única carga torta foi de uma sessão derrubada no próprio login (ver o item de `endodirect_devices` abaixo). **13/10:** desde o reset do `pg_stat_statements` (10h47), 18 cargas de conteúdo e 70 páginas, que fecham com 13 cargas de Gold (5 páginas) + 5 de degustação (1), sem nenhuma repetição; todos os pedidos com uma tentativa no gateway e status 200; nenhum ERROR no Postgres em 24 h; o `member_content` antigo ainda recebeu 3 chamadas de abas abertas antes do deploy, servidas pela composição. ⚠️ Ao contar chamadas no log de borda, filtrar `request.method = 'POST'`: o pré-voo do navegador (`OPTIONS`) aparece como outra linha com a mesma rota.
  - **`endodirect_member_content()`** — **só para o app antigo** em cache: virou a **composição** `sem_provas() || {provas: member_provas()}`; resposta idêntica byte a byte à de antes (md5 conferido em produção para Gold, Gold+EndoTEEM e Standard). 🧨 **Não reescrever com corpo próprio** — duas cópias da regra divergiriam no primeiro ajuste.
  - Histórico de tamanho: 12,3 MB (até 24/09) → ~5,3 MB (24/09) → 5,43 MB com o lote de 12/10 (`provas` 3,88 MB, 71%) → separado. 🧨 **Patch parcial nestas funções já perdeu duas migrações** (janela de 23/07 e filtro de 03/08, derrubados pela `member_content_capa_do_curso` de 07/08) e a chave `ig_stories`: antes de reescrever, ler o `prosrc`; depois, conferir `limit 200` e `radar_hidden` no resultado. O `member-content-mais-leve.sql` (24/09) ficou como histórico.
- **`endodirect_acervo_totais()`** — contagens do acervo (provas, diretrizes, resumos, artigos, mapas, podcasts) **+ `temas` desde 25/09/2026** (`{sub:[tema,…]}`: capítulos privados publicados na ordem do array + temas extras do professor, sem repetição, só nomes). Embutida em `member_content` e `public_content` (chave `acervo_totais`, guardada em `lsGet('acervo_totais')`). Corpo completo em `supabase/temas-dos-resumos-no-acervo.sql`. ACL só `postgres`/`service_role` (chamada de dentro das RPCs).
- **`radar_avisos[].titulo_pt`** (desde 11/10/2026) — título do artigo em português, gerado pela IA do radar junto do resumo; o card exibe-o e mantém o `titulo` original (inglês) como chave (dedup, `radar_hidden`, favoritos, newsletter). Itens anteriores a 08/10 não têm o campo (o professor pediu só as últimas 72 h); o editor inline do painel permite corrigir a tradução. Registro do retroativo em `endodirect_radar_titulos_pt` (RLS, sem acesso de anon/authenticated).
- **`endodirect_qotd_publicadas()`** (jsonb, desde 10/10/2026) — a **Questão do Dia do aluno logado**: só as publicadas (`status='posted'`), na ordem da fila (o app toma a última como "a de hoje"). ~280 KB com 88 questões. O cliente chama direto (`carregarQotd`, 3 tentativas, em paralelo com o conteúdo). ACL: `authenticated` e `service_role` (anon não executa). 🧨 **Por que existe:** a reescrita `member_content_capa_do_curso` (07/08) perdeu a chave `ig_stories` do `member_content` — o terceiro caso de corpo reescrito sem o que veio antes — e o aluno ficou dois meses sem a Questão do Dia (relato de assinante em 06/10; respostas de 86/semana para zero). A lista NÃO voltou ao `member_content` porque ele já tem ~5,2 MB, perto do limite empírico de ~5,3 MB. `endodirect_public_content()` passou a entregar **só as publicadas** (até 10/10 ia a fila inteira, com o gabarito das não postadas). Corpo completo das duas em `supabase/questao-do-dia-volta-ao-aluno.sql`; regressão em `scripts/test-qotd-link-direto.js` (no CI).
- **`endodirect_acessos_ativos()`** (text[]) — desde 24/09 o **cliente a chama direto** (`carregarAcessos`, 3 tentativas, em paralelo com o conteúdo, cache por `uid` no aparelho): o plano do aluno deixa de depender da resposta grande. É também o que o poll do checkout consulta a cada 5 s (antes refazia o `member_content` inteiro).
- **`endodirect_member_resumos()`** (criado 2026-07-21, RPC leve ~1,5 MB) entrega só `diretrizes` (públicas **+ privadas/Resumos**: assinante recebe todas; degustação recebe **1 por subespecialidade *e por tipo*** — ver abaixo) + `diretrizes_temas`. **Por que separado:** juntar os 106 resumos no member_content levava a resposta a ~5,3 MB e ela **deixava de chegar** ao cliente (Resumos vazio). Separar mantém cada resposta pequena e robusta.
  - **Em páginas desde 25/10/2026: `endodirect_member_resumos_pagina(p_pagina)`** (corpo completo em `supabase/resumos-em-paginas.sql`, migração `resumos_em_paginas`). É o que o app chama (`carregarResumos` → `carregarResumosPaginas`). Fatia a lista de `endodirect_member_resumos()` em páginas de **20**, com `versao` (md5 da lista inteira), `total`, `paginas` (mínimo 1), `pagina`, `itens` e `diretrizes_temas` só na página 0 (`null` nas outras). Página fora do intervalo devolve `itens` vazio. O cliente pede a 0, depois as demais em paralelo (teto de 100), cada uma com 3 tentativas só em falha de rede; versões diferentes ou soma diferente do `total` → recarrega uma vez, depois erro com "Tentar de novo"; **nada parcial é aplicado** e lista vazia não apaga a do aparelho. Se a função não existir (PGRST202/42883), cai na chamada única. ACL: anon, authenticated e service_role, nada para PUBLIC.
    - **Por que:** a resposta única era 3,34 MB para o assinante (233 itens) e, com as 72 Diretrizes reescritas pelo documento original (~54 KB cada), passaria de ~6 MB, acima do limite empírico de ~5,3 MB.
    - **Ensaio e produção (25/10):** com a mesma função em `pg_temp`, assinante = 233 itens em 12 páginas, uma versão só, as páginas juntas iguais à lista da chamada única e a maior página com 537 KB; visitante = 28 itens (10 Diretrizes de amostra + 18 capítulos) em 2 páginas. Depois da migração, o `prosrc` tem o md5 do corpo do arquivo (`71b0a402…`) e a chamada por HTTPS como visitante devolveu as 2 páginas com a mesma versão (222 KB + 93 KB).
    - 🧨 **Não copiar a regra para cá.** Quem vê o quê (assinante, degustação, rascunho) mora só em `endodirect_member_resumos()`; esta função só fatia. `endodirect_member_resumos()` fica para o app antigo em cache e como recurso.
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
- `endodirect_app_state` — estado por usuário: `email` + `payload` (JSONB). Inclui `user_profile`. **Só guarda chaves PESSOAIS** (`q/fc/mm/notes/crono/sf_results/perf/perfTema/act/srs/goal/cursoProg/plan/adm_perfil/user_profile/deg_trials/ck_billing/presc_emitidas/feitas/favs/acervoVisto` = `PERSONAL_STATE_KEYS`; `feitas` = questões do Banco já respondidas, `{chave:{ok,at}}`, desde 2026-10-05); o conteúdo global (provas, mural/`radar_avisos`, podcasts, cursos, diretrizes…) vive **só** no `endodirect_global_state`/RPC de membro. Por isso `applyStatePayload(payload, personalOnly=true)` é usado ao hidratar o `app_state` do próprio usuário: aplica apenas as chaves pessoais e **nunca** toca no conteúdo global. Sem isso, um `app_state` com resíduo antigo de `radar_avisos` defasado podia, ao resolver depois do estado global no `Promise.all` do hydrate, sobrescrever os artigos novos do radar — bug "F5 atualiza e ~2s depois volta ao antigo" (recorrente). Fix 2026-06-15.
- `endodirect_admins` — e-mails de administradores.
- `endodirect_cursos` — cursos (coluna `tier`).
- `endodirect_state_backup` — backups manuais do estado. (RLS ON sem policy = só service_role — padrão seguro, item INFO do linter.)
- `endodirect_acessos` — acessos liberados (escopo, status, validade). Alimentada pelo checkout e pelo [[Pagamentos pagar.me|webhook]]. ⚠️ **Uma linha por e-mail + escopo:** a 2ª compra do mesmo plano regrava a linha e não deixa rastro. `endodirect_assinaturas` existe, mas está vazia. Para reconstituir um pagamento antigo o banco não ajuda: `auth.audit_log_entries` está vazio e o Vault não guarda segredos (conferido em 14/10/2026).
### Contas institucionais (parceiros)
Login único no domínio `endodirect.com.br` (não no do parceiro: a recuperação de senha tem de cair numa caixa que o professor controla). Criadas por SQL em `auth.users` **+ `auth.identities`** — sem a linha de identidade o login por senha não funciona — com `email_confirmed_at` já preenchido. ⚠️ `auth.identities.email` é **coluna gerada**, não aceita insert. Direito de acesso como qualquer cortesia: linha em `endodirect_acessos` com `provider='manual'` (para não contar como pagante). **O limite de 2 dispositivos vale para elas** — login compartilhado por 3+ pessoas simultâneas se autoexpulsa em ~5s.

**Hoje: nenhuma ativa.** `novonordisk@endodirect.com.br` foi **cancelada em 04/08/2026** a pedido do professor. Cancelamento **reversível de propósito** — nada foi apagado: `endodirect_acessos` com `status='canceled'` + `expires_at=now()`, `auth.users.banned_until='2099-12-31'` (barra o login), sessões e refresh tokens apagados, 2 linhas de `endodirect_devices` removidas. Para religar: `status='active'`, `expires_at` nova e `banned_until=null` — a conta, a senha e o estado de estudo continuam lá. Para apagar de vez (irreversível): remover de `auth.users`, o que leva junto `endodirect_app_state` por cascata.

- `endodirect_devices` — anti-compartilhamento: dispositivos ativos por aluno `(user_id, device_id, last_seen)`. Limite de **2**; RPCs `endodirect_session_claim` (login, mantém os 2 mais recentes) e `endodirect_session_check` (heartbeat). Cliente: `device_id` em `localStorage`, heartbeat **5 s** (era 60 s) e checagem também a cada navegação/foco (no máximo 1× a cada 4 s), expulsa com overlay "Sessão encerrada". Só para `role='aluno'` (admins isentos). DDL em `supabase/device-session-limit.sql` (migration `device_session_limit`). ⚠️ **O check responde `false` a aparelho SEM registro** — é o que derruba o 3º, mas também derrubava o aparelho NOVO no próprio login, porque a navegação do `doLogin` checava antes do `claim` (corrigido em 12/10/2026: o cliente só checa depois de o registro deste login voltar `true`, `deviceSlot`; e, depois de uma derrubada, nenhuma resposta da rede é aplicada, `sessaoEncerrada`). Ver [[Decisões]] 2026-10-12. **Conferido em produção (12/10 13h45 → 13/10 13h30 UTC):** 15 entradas com registro e **nenhum logout até 2 s depois de um registro** (antes, 2 de ~12 logins); nos boots do app novo o registro sai primeiro e a primeira checagem ≥2 s depois; os dois casos de checagem antes do registro eram abas com versões antigas ainda abertas (uma ainda chamando o `member_content` antigo), sem derrubada porque o aparelho já estava registrado.

## Save do estado global (admin) e concorrência
O save do admin (`saveRemoteState`, role=admin) faz read-modify-write do `endodirect_global_state`: relê o payload, **preserva as chaves de servidor** (`radar_avisos`, `newsletter_*` — escritas só pelo cron) e, **se `updated_at` mudou desde o load** (`lastGlobalUpdatedAt`), MESCLA as coleções aditivas (`GLOBAL_MERGE_KEYS`: adm_cursos, podcasts, provas, mm_shared, diretrizes, diretrizes_temas, curso_mods_extra, adm_estudantes). A mescla é **baseada em baseline** (`mergeConcurrent`): parte do estado local atual (honra minhas exclusões/edições) e só acrescenta itens do servidor cuja chave é **nova desde o baseline da sessão** (`captureGlobalBaseline`, capturado junto com `lastGlobalUpdatedAt` no load e em cada save). Assim adições de outro editor/cron são preservadas e exclusões não voltam. **Histórico:** o #305 usava `unionBy` (server∪local), que ressuscitava exclusões — bug "apago tema de Diretrizes e volta no F5", disparado até pelo cron do radar bumpando `updated_at`. Substituído pelo merge com baseline em 2026-06-15.

### 🐛 O 2º save desfazia o que o 1º tinha adotado do banco (2026-10-19)
- **O caso:** o cap. 109 (vitamina D) foi gravado no banco às 13h11 UTC e voltou ao texto
  antigo às 13h56, num save do painel do professor, que estava aberto desde antes.
- **A causa:** o merge montava certo o objeto enviado (`p`), mas a memória do painel
  continuava com a cópia velha. O save seguinte não fazia merge, porque o servidor não
  tinha mudado desde o save deste mesmo painel; `p` saía da memória e a edição sumia.
  Valia para toda coleção mesclada, inclusive item novo de outro editor.
- **Segunda causa, nos mesmos minutos:** o GET do estado global devolveu 525 e 503, e o
  save engolia o erro. Com `{}` no lugar do servidor, não havia merge, e as chaves que só
  o cron escreve (`newsletter_sent` etc.) voltavam ao valor carregado. Uma `newsletter_sent`
  revertida pode fazer a newsletter reenviar.
- **A correção (`saveRemoteState`, `sw.js` v319):**
  - coleção que trouxe algo do servidor no merge entra também na memória, por
    `applyStatePayload` (o mesmo caminho da carga). As outras ficam como estão. A ordem
    não muda: atualização fica no lugar e item novo vai para o fim, então o índice que o
    editor guarda segue apontando para o mesmo capítulo;
  - leitura com erro não grava. Tenta de novo em 4, 8, 16 e 32 s e depois a cada minuto,
    até conseguir, com um timer só. Não há save ao fechar a aba, então desistir deixaria
    a edição só na memória;
  - na 3ª falha seguida, aviso vermelho para não fechar o painel; quando volta,
    "Salvo: o servidor voltou…". Uma falha passageira não mostra nada (antes saía o
    "Verifique o setup SQL").
- **Testes:**
  - `scripts/test-save-painel.js` (no `ci-validate`) roda o save real num `vm`. Na main
    cai em 16 verificações;
  - A/B em Chromium com supabase-js falso logado como admin (sessão
    `scratchpad/ab-save/save.js`): a main desfaz a troca no 2º save e grava às cegas com
    525; o branch mantém, espera e grava sozinho quando a leitura volta.
- **O que não muda:** gravação minha pelo SQL ainda pede o F5 antes (regra abaixo). A
  correção só vale para quem carregou a versão nova, e item apagado no banco continua
  voltando pelo painel aberto (o merge parte da memória).

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

### ⏱️ Instrução grande demais: os 60 s do `execute_sql` (2026-10-19)
- O `payload` tem 16,5 MB como texto (6,9 MB guardado), e cada `jsonb_set` encadeado
  remonta o documento inteiro.
- 16 capítulos numa instrução só passaram dos 60 s do conector. Nada foi gravado: sem
  backup, md5 iguais, sem consulta presa nem trava.
- **Regra:** no máximo 4 capítulos por instrução, cada grupo com o próprio backup e as
  próprias guardas. Antes de repetir uma instrução que estourou o tempo, conferir que
  ela não gravou: backup, md5, `pg_stat_activity` e travas.

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

## ⚠️ Alerta do Supabase de 26/07 — e a repetição da MESMA falha (2026-07-29)
O Rodolpho recebeu o e-mail *"These issues require your immediate attention — Table publicly accessible (`rls_disabled_in_public`)"*. Duas tabelas com **RLS desligado**, ou seja, legíveis e graváveis por qualquer um com a URL do projeto e a chave anon:

1. **`_fc_stage`** (colunas `i`, `c`; 1 linha) — resto de importação de flashcards: um pedaço de SQL em **base64**, 8.000 caracteres. Sem dado pessoal, não referenciada por nada.
2. **`endodirect_mural_discussoes_bkp_20260729`** — a cópia de segurança das discussões que **eu mesmo criei** uma hora antes, no mesmo dia.

**Correção:** `alter table … enable row level security` nas duas. Sem policy = só `service_role` enxerga, que é o padrão já usado em `endodirect_mural_discussoes`, `endodirect_support` e `endodirect_state_backup`. O linter voltou com **zero item ERROR**.

### ⚠️ A regra que eu deveria ter aplicado sozinho
**`create table … as select …` no schema `public` nasce com RLS DESLIGADO** e o PostgREST expõe o schema inteiro. Toda tabela nova de trabalho — backup, staging, rascunho — nasce pública até alguém ligar o RLS.

É a **terceira** ocorrência da mesma coisa: `_aulaq_stage` (dropada em 01/07), `_fc_stage` e agora uma criada por mim. Passa a valer: **ligar o RLS na mesma transação em que a tabela é criada**, sem exceção para "é só um backup temporário".

```sql
create table public.minha_tabela_bkp as select * from origem;
alter table public.minha_tabela_bkp enable row level security;  -- na MESMA leva
```

**Pendente de decisão do professor:** `_fc_stage` e as tabelas `*_bkp_*`/`*_backup*` antigas são lixo de operação e podem ser dropadas. Ligar o RLS resolveu a exposição; dropar resolveria a bagunça. Não dropei nada por conta própria.

**Os itens WARN não são achado novo:** os RPCs SECURITY DEFINER executáveis por `anon`/`authenticated` são o modelo do app. Reconferidos hoje — `endodirect_admin_overview` e `endodirect_admin_students` começam com `if not public.endodirect_is_admin() then raise exception 'forbidden'`, então o gate está **dentro** da função. Os itens INFO (RLS ligado sem policy) são o padrão "só service_role", que é o desejado.

## RLS e RPCs (security-definer)
- `endodirect_member_content` — conteúdo do membro.
- **Direito de acesso / planos (`endodirect_acessos`):** o acesso pago é concedido pela RPC `endodirect_acessos_ativos()`, que só conta linhas com **`status='active'` E (`expires_at` nulo ou futuro)** (também soma `endodirect_assinaturas` ativas; hoje 0 linhas). Ranqueia `plano:standard`(1) < `plano:gold`(2) < `plano:premium`(3) e injeta `plano` + os `curso:<slug>` até o tier. O painel Estudantes (`endodirect_admin_students`) mostra o plano com o MESMO gate (`status='active'`). **Para cancelar/remover alguém de um plano:** basta a linha NÃO estar `active` (ou expirar) — `update endodirect_acessos set status='canceled', expires_at=now() where lower(email)=... and scope like 'plano%'`. Preferir MANTER a linha (histórico do pagamento: `provider_order_id`, `notes`) e documentar em `notes`, em vez de deletar. O **webhook do pagar.me** ([[Pagamentos pagar.me]]) já seta `status='canceled'` no estorno/cancelamento — conferir antes de agir manualmente (a conta continua existindo, só cai para Degustação).
  - ⚠️ **Uma linha por e-mail + escopo, com o ÚLTIMO pedido** (`order.js`, `subscribe.js` e o webhook fazem upsert por e-mail + escopo). Uma 2ª compra do mesmo plano regrava a linha e o pedido anterior some do banco — foi assim que a cobrança em dobro de 29/06 ficou invisível (ver [[Pagamentos pagar.me]] 2026-10-14). Desde 14/10, as rotas de checkout recusam quem já tem o plano ativo (`lib/acesso-vigente.js`).
- **`endodirect_meu_feedback()`** (03/08) — decide se o app convida ESTE aluno a dar feedback ao abrir a plataforma. Devolve `dias` (tempo de assinatura), `ja_respondeu` e `pedir`. `pedir` = assinatura **ativa** iniciada há **mais de 30 dias** + data **≥ 01/09/2026** + sem feedback nos últimos **180 dias**. Início da assinatura = compra ativa mais antiga, casando por `user_id` **e** por e-mail (acesso não vinculado não pode zerar o tempo de casa). Lê só `auth.uid()`/`auth.jwt()` — ninguém consulta a situação de outro. **A regra mora aqui e não no `index.html`** porque o app fica em cache no celular do aluno (service worker): regra no cliente continuaria valendo a versão velha por dias, e a data pode mudar sem deploy. ⚠️ `proacl` conferido: `anon` **não** executa (ver a lição das duas revogações em [[Decisões]]).
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
