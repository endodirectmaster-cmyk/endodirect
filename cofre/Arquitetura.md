---
tags: [cofre, arquitetura]
atualizado: 2026-06-14
---

# Arquitetura

## Frontend — `index.html`

- **Single-file SPA**, JS vanilla, scripts inline. Arquivo grande (~7k+ linhas).
- ⚠️ **Funções são redefinidas mais adiante no arquivo** em alguns casos — sempre editar a **versão ATIVA (última)** de uma função.
- Recursos externos via `<script src>`: Supabase JS, tus-js-client, e `growth-lms.js` (tabelas LMS das [[Calculadoras]]).

### Estado e sincronização
- `DB` (objeto cliente) com chaves: `q` (questões salvas), `fc` (flashcards), `mm` (mapas mentais), `notes` (caderno), `crono`, `sf_results`, `perf` (desempenho agregado por categoria). `provas` (banco principal) fica em `provasDB`.
- `persist()` grava `DB` no localStorage e chama `queueRemoteStateSave()`.
- **Estado global** (`endodirect_global_state`, payload JSONB): `globalStatePayload()` **substitui o payload inteiro** ao salvar. Por isso há o mecanismo `globalServerKeys` + captura em `applyStatePayload` para **preservar chaves geridas pelo servidor** (`newsletter_extra`, `newsletter_unsub`, `newsletter_sent`, `newsletter`). Esquecer isso já causou apagar a newsletter (corrigido em #166).
- **Estado por usuário** (`endodirect_app_state`): `userStatePayload` / `REMOTE_STATE_KEYS` espelham chaves para o localStorage. Inclui `user_profile`, `ck_billing`, `deg_trials`.

### Navegação (tela inicial vs. reload) — #284
- **Reload mantém a tela**; **logout+login volta ao padrão** (professor → Analytics; aluno → Mural). Mecanismo: `goPanel()` persiste `last_panel` (aluno) e `renderAdmSec()` persiste `adm_sec` (professor); `doLogout()` **limpa** `last_panel`+`adm_sec`. No `startApp`: admin chama `goPanel('adm')` (que restaura via `admRestoreSec()`, default `analytics`); aluno restaura `last_panel` se visível, senão `homePanel()` (Mural-first).
- ⚠️ `admRestoreSec()` default passou de `ref` → `analytics`.

### Diretrizes (antiga "Referência") — #276–#284
- Hierarquia **subespecialidade → tema → diretriz**; cada diretriz tem `resumo` (texto+bullets), `flashcards`, `mapa`. Taxonomia canônica de 11 subespecialidades (`DIR_SUBS`).
- **Aluno**: `diretrizesViewHTML()`/`renderDiretrizesInto()` com 3 botões de formato (📄 Resumo / 🃏 Flashcards / 🧠 Mapas), só leitura, flip 3D e mapas expansíveis. Gated por `DIRETRIZES_PUBLICADO=false` → mostra "Em breve" (ver [[Pendências]]).
- **Professor** (`admRefSecHTML`/`bindAdmSec`): mesma navegação; ao abrir um **tema** vê a **mesma tela do aluno** (formatos), acrescida de ✏️ Editar / 🗑 Excluir por diretriz (#284). Editor com importação de PDF via IA (gera resumo/bullets/flashcards/mapa, todos editáveis) + chat assistente. A IA usa a conta Anthropic do servidor (`/api/ai`), **não** consome créditos de aluno.

## Backend

### `lib/`
- `newsletter.js` — envio diário + teste. Ver [[Newsletter e Radar]].
- `radar.js` + `news.js` — radar/mural automático (RSS + IA).
- `healthcheck.js` — verificação semanal da plataforma.
- `founder.js` — regras da oferta de fundador. Ver [[Planos e Preços]].

### `api/`
- `checkout/config.js` — config pública (chave pública, valores, founder).
- `checkout/order.js` — plano **anual** (pagamento único, 365 dias).
- `checkout/subscribe.js` — **assinatura mensal** recorrente.
- `webhooks/pagarme.js` — libera/revoga acesso conforme eventos.
- `cron/endocrine-radar.js` — radar diário.
- `cron/healthcheck.js` — health check semanal.

### `vercel.json` (crons)
- `endocrine-radar`: `30 10 * * *` (diário)
- `healthcheck`: `0 11 * * 1` (segundas)
- Crons autenticam via `Authorization: Bearer $CRON_SECRET`.

## Validação
Ver [[Convenções de Trabalho]] para os comandos de validação (scripts inline e `node --check`).
