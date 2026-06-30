---
tags: [cofre, processo]
atualizado: 2026-06-30
---

# Convenções de Trabalho

## Git / deploy
- **⚠️ LIÇÃO (2026-06-25) — NÃO empilhar 2 pushes em `main` em segundos:** dois commits enviados em sequência rápida (`672c2a7` filtros, depois `7935cc2` remove ✓) geraram builds concorrentes na Vercel e a **promoção saiu fora de ordem** — o deploy do commit **mais antigo** virou produção ~24s depois, e o site ficou servindo a versão SEM a última correção (o usuário via o ✓ que eu já havia removido). **Correção:** subir **um commit por vez** e, em caso de mudanças rápidas, **agrupar num único commit** ou confirmar via `list_deployments` que o deploy de produção aponta para o SHA mais novo antes de avisar o usuário. Hotfix usado: um commit novo (bump do cache do `sw.js` v4→v5) força um deploy limpo (mais recente, sem corrida) **e** busta o cache do service worker dos clientes. **Webhook GitHub→Vercel pode atrasar ~2–3 min** — não confiar em "deve estar pronto"; checar o estado real.
- **Branch de desenvolvimento:** `claude/funny-brahmagupta-9n8yT`.
- Fluxo: commitar na branch → abrir PR → **squash merge** em `main` → deploy automático na Vercel.
- **⚠️ REGRA ATUAL (reforçada pelo usuário 2026-06-18) — PREVIEW + APROVAÇÃO ANTES DO DEPLOY:** toda mudança que afeta **o app** (frontend `index.html`, prompts, backend `api/`/`lib/`) segue: branch → PR → **CI verde** → **enviar o link do PREVIEW da Vercel no chat** → **esperar o "ok"/"pode dar deploy" do usuário** → só então squash-merge na `main`. **NÃO mergear/deployar sem a aprovação explícita.** Isso **supersede** a antiga "merge automático" abaixo. Exceção: **docs do `cofre/`** (`.md`) não fazem deploy no app → podem ser commitadas/mergeadas direto (mantendo o campo `atualizado:` em dia).
- ~~**Merge + deploy AUTOMÁTICOS — autorização permanente do usuário (2026-06-16):**~~ (SUPERSEDIDO pela regra acima) depois do **CI ficar verde**, fazer **squash-merge na `main` e deixar a Vercel deployar**. Travas mantidas: (1) CI `validate` verde; (2) PR que mexe em **pagamento/acesso** → revisar o diff antes. Para acompanhar o CI sem `sleep`, usar `mcp__github__pull_request_read` (`get_check_runs`/`get_status`).
- **Cofre SEMPRE atualizado (lição 2026-06-18):** ao mexer numa nota do `cofre/`, **atualizar o campo `atualizado:` do frontmatter** (não só o conteúdo) — senão o Obsidian do usuário mostra data velha. O usuário precisa dar `git pull` no vault local p/ ver o que foi mergeado (eu trabalho no container na nuvem).
- ⚠️ Após cada merge, a `main` avança e a branch local fica defasada. Antes do próximo PR, **rebasear** sobre a `main` nova para evitar conflito:
  - `git fetch origin main`
  - `git rebase --onto origin/main <último-commit-já-mergeado>` (ou `git reset --hard origin/main` e reaplicar só o que falta).
- O container é efêmero e às vezes re-clona em commit antigo — **sempre** `git fetch origin main && git reset --hard origin/main` antes de começar.
- Identidade de commit: `Claude <noreply@anthropic.com>`. (O commit de squash-merge na `main` é gerado pelo GitHub e aparece como `committer: GitHub <noreply@github.com>` / "Unverified" — isso é **normal**, não reescrever.)
- O fluxo PR → squash → deploy está **pré-autorizado** (ver acima): criar PR, esperar o CI, mergear e deployar sem pedir ok a cada vez.

## Conteúdo / marketing
- **Posts de feed do Instagram: SEMPRE com a logo do Endodirect (pedido do Rodolpho, 2026-06-29).** Usar a marca real **`logo.png.png`** (marca "ED" dourada, fundo transparente — fica bem sobre fundo escuro) no cabeçalho de toda arte. Gerar os slides com **HTML→PNG via Playwright** (1080×1350, identidade Endodirect: fundo navy `#0b1325`, azul `#3b6fd4`/`#5585e8`, verde `#34d399`, vermelho `#fb7185`; logo embutida em base64). **NÃO** reaproveitar como arte de carrossel as mesmas figuras que já estão no texto do post.
- **Textos de leitura SEMPRE justificados (pedido do Rodolpho, 2026-06-29):** newsletter (`lib/newsletter.js` — `text-align:justify` inline nos blocos `.art-body`) e cards do Mural (`.mural-text` → `text-align:justify;text-align-last:left`; o `text-align-last:left` evita esticar cabeçalhos/última linha de bullet com `white-space:pre-line`). Ao criar novos blocos de texto corrido, manter justificado.
- **Carrossel EDITÁVEL no Canva com o NOSSO design (técnica, 2026-06-29):** para levar o design exato (não a versão recriada pela IA) ao Canva editável: (1) montar o HTML dos slides anotando **cada slide com `data-document-role="page"`** (atributo opcional `data-label`), CSS inline e logo embutida em base64; (2) hospedar num **URL HTTPS público** — usei `raw.githubusercontent.com/<owner>/<repo>/<SHA>/arquivo.html` (por SHA = imutável e sem ambiguidade de branch com `/`); (3) `import-design-from-url` (Canva MCP) → vira design com **layout do HTML + texto editável**. ⚠️ Essa ferramenta **exige permissão no conector do Canva**: se voltar `MCP tool call requires approval`, pedir ao usuário para **reconectar o conector / dar permissão total**, depois repetir. Verificar a copy com `get-design-content` (não consigo renderizar a prévia — o proxy bloqueia o host de imagens do Canva). Alternativa rápida (sem permissão): `generate-design` (`instagram_post`) — mas a IA **condensa** a copy e usa layout próprio. Arquivo HTML de importação fica **só na branch** (nunca em `main`/produção); o URL por SHA continua válido mesmo após apagar o arquivo do tip.
- **⚠️ Onde o design importado vai parar + fidelidade (lição 2026-06-29):** o design criado por `import-design-from-url` **NÃO aparece sozinho na grade de "Projetos"** do Canva do usuário — ele entra na conta, mas só surge em **"Recentes"** depois de aberto pelo link, ou via **busca pelo nome exato**. Os links `/d/<code>` que `get-design`/`start-editing-transaction` retornam **são regenerados a cada chamada** (não são fixos/permanentes) → ao entregar, mandar **o link mais recente E o nome exato do design** pra o usuário poder buscar (o identificador estável é o `design_id`, ex.: `DAHN_PiV6vw`). **Fidelidade:** uma frase longa numa caixa de texto pode importar como **linha única que estoura a borda** — corrigir abrindo transação e inserindo `\n` via `find_and_replace_text` (ex.: quebrei a frase do "Atenção" em 2 linhas), conferir pelo thumbnail e `commit-editing-transaction`.

## Referências clínicas (fontes de verdade médicas)
- **Toda produção de conteúdo médico** (flashcards, Mural/discussões, resumos de aula, questões, newsletter, posts) deve seguir as diretrizes em **`cofre/Diretrizes Clínicas/`** — os cortes, doses, alvos e critérios da diretriz citada mandam; citar a âncora (ex.: "ESE/ES 2024"). Em conflito com a memória, **a diretriz vence** (precisão > fluência, prioridade recorrente do Rodolpho).
- **Quando o Rodolpho mandar um PDF de diretriz e disser "incorpore":** ler o PDF inteiro (`Read` com `pages:`; ⚠️ se o PDF for grande/imagem ou o payload de imagens da sessão já estiver alto, o `Read` **deixa de renderizar** → extrair o texto com **`pdftotext`** [poppler, disponível no sandbox], ex.: `pdftotext -f 1 -l 3 arquivo.pdf -`), criar uma nota-resumo em `cofre/Diretrizes Clínicas/` (citação + DOI + escopo + recomendações + tabelas de doses/cortes/alvos), linkar no `README.md` da pasta e registrar em [[Decisões]]. **Acervo inicial (2026-06-30):** IA por glicocorticoides (ESE/ES 2024), Vitamina D (Endocrine Society 2024), Transgênero (Endocrine Society 2017).

## Validação antes de commitar
- **Automatizado no CI (GitHub Actions `.github/workflows/ci.yml` → `scripts/ci-validate.js`):** roda em cada PR/push p/ `main` e faz as 3 checagens abaixo + **barra se `api/` passar de 12 funções** (limite Vercel que já travou prod). Localmente: `node scripts/ci-validate.js`.
- **Scripts inline do `index.html`:** extrair cada `<script>` sem `src` e rodar `new Function(corpo)` (deve dar 0 erros).
- **`lib/` e `api/`:** `node --check <arquivo>`.
- Calculadoras/IA: testar a lógica com valores de referência conhecidos quando possível.

## Sandbox / rede
- Egress restrito a uma allowlist. Confirmados acessíveis: `raw.githubusercontent.com`, `github.com`, `api.anthropic.com`. Bloqueados: `who.int`, `cdc.gov` (usar mirrors no GitHub).
- Não há ferramenta para gravar variáveis de ambiente na Vercel — isso é feito pelo usuário no painel.
- Verificação de produção (GET): `mcp web_fetch_vercel_url` em `https://www.endodirect.com.br/...` (não satisfaz auth de endpoints protegidos).

## GitHub
- Usar as ferramentas `mcp__github__*` (sem `gh` CLI). Escopo: `endodirectmaster-cmyk/endodirect`.
- Merge 401 transitório às vezes ocorre — apenas re-tentar `merge_pull_request`.

## Manutenção do cofre
Atualizar a nota relevante a cada mudança e registrar decisões em [[Decisões]]. Manter `atualizado:` no topo.
- **Hook SessionStart (2026-06-14, ampliado 2026-06-15):** `.claude/settings.json` injeta no início de toda sessão o lembrete de manter o cofre atualizado **e agora também o conteúdo de `cofre/Convenções de Trabalho.md` + `cofre/Decisões.md`** (via `jq --rawfile`, com fallback se faltar `jq`/arquivo), para começar já ciente de convenções, decisões e lições. Sincronizar o cofre faz parte de toda tarefa, não é opcional. (Há também um hook **Stop** que faz `git push origin HEAD`.)

## Lições operacionais (aprendidas em campo)
Hábitos que evitam retrabalho — ler antes de agir, especialmente em bugs e deploy:
- **Bug de estado/sync? Conferir o dado REAL antes de propor fix.** Usar `mcp execute_sql` no Supabase (`endodirect_global_state.payload`, `endodirect_app_state`, definições de RPC/trigger via `pg_get_functiondef`) para ver o estado de verdade. Lição cara (2026-06-15): empurrei o #312 (`applyStatePayload personalOnly`) como palpite para o "radar volta no F5" e estava errado; a causa real (seed `defaultMuralAvisos` com `at` relativo) só apareceu ao olhar o banco. Diagnóstico empírico > teoria; um fix especulativo custa um ciclo de deploy.
- **Depois de mergear, confirmar que o deploy de produção ficou READY.** Um PR mergeado pode estar **fora do ar**: usar `mcp list_deployments`/`get_deployment` (team `team_fufkQHFICWnQDbeIKmAKo6a8`, project `endodirect`) e checar `state:READY` no `target:production`. Lição (2026-06-15): #311/#312/#313 ficaram em **ERROR** (limite de 12 funções) e o último READY no ar era o #310 — o usuário via o bug "corrigido" persistir. Build pode concluir e ainda dar ERROR em "Deploying outputs" (limites de plano). Logs: `get_deployment_build_logs`.
- **Limites do plano Vercel (Hobby):** **12 serverless functions** em `api/` (projeto no teto) e **2 cron jobs**. Não criar função nova em `api/` sem remover outra; lógica reusável vai em `lib/` (módulo, não conta). Ver [[Decisões]] e [[Integrações]].
- **Aviso "Unverified" do hook Stop é benigno:** ele acusa o commit de **squash-merge do próprio GitHub** (committer `noreply@github.com`) no tip da `main`. NÃO reescrever (é histórico já mergeado). Meus commits usam `Claude <noreply@anthropic.com>`.
- **Validar sempre antes de commitar** (scripts inline + `node --check`), conforme a seção acima — barato e evita deploy quebrado.
