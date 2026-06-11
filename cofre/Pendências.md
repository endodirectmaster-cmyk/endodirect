---
tags: [cofre, pendencias]
atualizado: 2026-06-10
---

# Pendências

## Lado do usuário (fora do código)
- [x] **Domínio apex (`endodirect.com.br`):** resolvido em 2026-06-11. O registro A do apex no Registro.br foi trocado do IP antigo da Vercel (`76.76.21.21`) para o novo (`216.198.79.1`); a Vercel passou a "Valid Configuration" e o apex faz **307 → `www`**. (Auth já estava blindado pelo `www` no código, #183.)
- [ ] **Supabase (URL Configuration):** **Site URL = `https://www.endodirect.com.br`**; em Redirect URLs, manter `https://www.endodirect.com.br/**` e `https://endodirect.com.br/**`.
- [ ] **pagar.me:** fazer compra real de teste (PIX) + estorno para validar liberação/revogação de acesso ponta a ponta. (Migração para LIVE já feita — ver [[Pagamentos pagar.me]].)
- [ ] **Memed:** resolver assinatura do contrato e configurar `MEMED_API_KEY`/`MEMED_SECRET`. Ver [[Integrações]].
- [x] **Newsletter:** Eduardo e Bruno **confirmaram o recebimento** (2026-06-11). O fix do `globalServerKeys` (#166) resolveu a perda do `newsletter_extra`. Ver [[Newsletter e Radar]].
- [x] **Supabase (e-mails de auth):** Confirm email **ON** + **Custom SMTP via Resend** (remetente `Endodirect <nao-responda@endodirect.com.br>`) + **templates branded PT** (Confirm sign up / Reset password). Validado por teste em 2026-06-11: e-mail chega do domínio próprio, com visual do Endodirect. Fontes em `supabase/email-templates/`. Ver [[Integrações]].

## Lado do código / curadoria
- [ ] Revisar **Grupo 2** — 29 gabaritos ambíguos (`gabaritos-suspeitos.md`). Ver [[Banco de Questões]].

## Concluídas recentes
- [x] pagar.me TEST → LIVE (chaves + webhook) — 2026-06-10.
- [x] Health check reconhece formato de chave LIVE do pagar.me (#169).
- [x] Newsletter por subespecialidade (#168).
- [x] Calculadoras TmP/GFR + escore-z estatura/idade (#170).
- [x] Exportação Obsidian no painel do aluno — **removida** (#172); base de conhecimento migrada para este cofre.
