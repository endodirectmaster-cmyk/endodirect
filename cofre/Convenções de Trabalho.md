---
tags: [cofre, processo]
atualizado: 2026-06-10
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
