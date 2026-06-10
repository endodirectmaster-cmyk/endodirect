---
tags: [cofre, integracoes]
atualizado: 2026-06-10
---

# Integrações

## Resend (e-mail)
Newsletter diária + relatório do health check. Envio em batch, List-Unsubscribe. Env: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`. Ver [[Newsletter e Radar]].

## Anthropic (IA)
Chat IA, simulador de casos, prescrição (treino) e o radar (`summarizeWithAI`). Env: `ANTHROPIC_API_KEY`. (Chave foi rotacionada pelo usuário após exposição anterior.) No sandbox de desenvolvimento, `api.anthropic.com` é dos poucos hosts liberados.

## Memed (Assistente de Prescrição)
- Decisão: usar a **API da Memed** para o Assistente de Prescrição (substitui o builder próprio). Recurso fica **gated**; perfil ganhou `crm`/`uf`.
- **Onboarding** (primeiro login) coleta **CRM + UF obrigatórios** para todos os perfis → salvos em `user_profile.crm`/`.uf` (sincronizados). É o que `/api/memed/token` (exige `crm` e `uf`) e o Assistente de Prescrição (`prof.crm`/`prof.uf`) consomem. Endpoint `api/memed/token.js` já existe (gating: responde `configured:false` sem chave).
- **Pendente:** assinatura do contrato (houve erro no fluxo de confirmação/Lexio) + configurar `MEMED_API_KEY`/`MEMED_SECRET`. Ver [[Pendências]]. Usuários que onboardaram antes da exigência preenchem CRM na tela do Assistente de Prescrição.
- Doc: https://doc.memed.com.br/docs/primeiros-passos

## Vídeo
Hoje Vimeo/YouTube. Avaliados como alternativas (advisory): **Bunny Stream** (custo-benefício), Mevo, Panda Video. Sem mudança implementada.

## pagar.me
Ver [[Pagamentos pagar.me]].
