---
tags: [cofre, processo]
atualizado: 2026-06-15
---

# Convenções de Trabalho

## Git / deploy
- **Branch de desenvolvimento:** `claude/funny-brahmagupta-9n8yT`.
- Fluxo: commitar na branch → abrir PR → **squash merge** em `main` → deploy automático na Vercel.
- ⚠️ Após cada merge, a `main` avança e a branch local fica defasada. Antes do próximo PR, **rebasear** sobre a `main` nova para evitar conflito:
  - `git fetch origin main`
  - `git rebase --onto origin/main <último-commit-já-mergeado>` (ou `git reset --hard origin/main` e reaplicar só o que falta).
- O container é efêmero e às vezes re-clona em commit antigo — **sempre** `git fetch origin main && git reset --hard origin/main` antes de começar.
- Identidade de commit: `Claude <noreply@anthropic.com>`.
- **Não** criar PR sem combinar (neste projeto o fluxo PR+squash já está acordado).

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
