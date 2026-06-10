---
tags: [cofre, arquitetura]
atualizado: 2026-06-10
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
