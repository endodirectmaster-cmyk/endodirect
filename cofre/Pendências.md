---
tags: [cofre, pendencias]
atualizado: 2026-06-10
---

# Pendências

## Lado do usuário (fora do código)
- [ ] **pagar.me:** fazer compra real de teste (PIX) + estorno para validar liberação/revogação de acesso ponta a ponta. (Migração para LIVE já feita — ver [[Pagamentos pagar.me]].)
- [ ] **Memed:** resolver assinatura do contrato e configurar `MEMED_API_KEY`/`MEMED_SECRET`. Ver [[Integrações]].
- [ ] **Newsletter:** confirmar com Eduardo e Bruno se receberam (checar spam; usar botão "Enviar teste" no admin). Ver [[Newsletter e Radar]].
- [ ] **Supabase (e-mails de auth):** configurar **Custom SMTP via Resend** (remetente `@endodirect.com.br`) e colar os **templates branded** (`supabase/email-templates/`) em Authentication → Emails. Hoje o e-mail de confirmação sai do remetente genérico do Supabase (`mail.app.supabase.io`), que passa cara de spam. Ver [[Integrações]].
- [x] **Supabase:** Confirm email = **ON** (confirmado por teste em 2026-06-10) + Site URL/Redirect URLs com o domínio.

## Lado do código / curadoria
- [ ] Revisar **Grupo 2** — 29 gabaritos ambíguos (`gabaritos-suspeitos.md`). Ver [[Banco de Questões]].

## Concluídas recentes
- [x] pagar.me TEST → LIVE (chaves + webhook) — 2026-06-10.
- [x] Health check reconhece formato de chave LIVE do pagar.me (#169).
- [x] Newsletter por subespecialidade (#168).
- [x] Calculadoras TmP/GFR + escore-z estatura/idade (#170).
- [x] Exportação Obsidian no painel do aluno — **removida** (#172); base de conhecimento migrada para este cofre.
