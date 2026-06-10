---
tags: [cofre, dados, supabase]
atualizado: 2026-06-10
---

# Dados e Supabase

## Tabelas

- `endodirect_global_state` — `id='main'`, coluna `payload` (JSONB). Estado global compartilhado (provas, avisos, radar, podcasts, cursos, estudantes, chaves de newsletter). Ver mecanismo `globalServerKeys` em [[Arquitetura]].
- `endodirect_app_state` — estado por usuário: `email` + `payload` (JSONB). Inclui `user_profile`.
- `endodirect_admins` — e-mails de administradores.
- `endodirect_cursos` — cursos (coluna `tier`).
- `endodirect_state_backup` — backups manuais do estado.
- `endodirect_acessos` — acessos liberados (escopo, status, validade). Alimentada pelo checkout e pelo [[Pagamentos pagar.me|webhook]].

## RLS e RPCs (security-definer)
- `endodirect_member_content` — conteúdo do membro.
- `endodirect_admin_overview` — visão do admin (inclui contagem de fundadores).

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
