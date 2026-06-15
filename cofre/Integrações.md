---
tags: [cofre, integracoes]
atualizado: 2026-06-15
---

# Integrações

## Resend (e-mail)
Newsletter diária + relatório do health check. Envio em batch, List-Unsubscribe. Env: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`. Ver [[Newsletter e Radar]].

### E-mails de autenticação (Supabase) via Resend
Os e-mails de auth (confirmação de cadastro, redefinir senha) devem sair do Endodirect, não do remetente padrão `noreply@mail.app.supabase.io`. Solução: **Custom SMTP no Supabase apontando para o Resend** (`smtp.resend.com:465`, user `resend`, senha = API key do Resend, sender `nao-responda@endodirect.com.br`) + **templates branded em PT** versionados em `supabase/email-templates/` (`confirm-signup.html`, `reset-password.html`). Aplicação é manual no painel (Authentication → Emails). Ver [[Pendências]].

## Anthropic (IA)
Chat IA, simulador de casos, prescrição (treino) e o radar (`summarizeWithAI`). Env: `ANTHROPIC_API_KEY`. (Chave foi rotacionada pelo usuário após exposição anterior.) No sandbox de desenvolvimento, `api.anthropic.com` é dos poucos hosts liberados.

## Memed (Assistente de Prescrição)
- Decisão: usar a **API da Memed** para o Assistente de Prescrição (substitui o builder próprio). Recurso fica **gated**; perfil ganhou `crm`/`uf`.
- **Onboarding** (primeiro login) coleta **CRM + UF obrigatórios** para todos os perfis → salvos em `user_profile.crm`/`.uf` (sincronizados). É o que `/api/memed/token` (exige `crm` e `uf`) e o Assistente de Prescrição (`prof.crm`/`prof.uf`) consomem. Endpoint `api/memed/token.js` já existe (gating: responde `configured:false` sem chave).
- **Pendente:** assinatura do contrato (houve erro no fluxo de confirmação/Lexio) + configurar `MEMED_API_KEY`/`MEMED_SECRET`. Ver [[Pendências]]. Usuários que onboardaram antes da exigência preenchem CRM na tela do Assistente de Prescrição.
- Doc: https://doc.memed.com.br/docs/primeiros-passos

## Podcasts (Anchor / Spotify for Podcasters)
- **Feed RSS do podcast:** `https://anchor.fm/s/6e257fc4/podcast/rss` (show "EndoDirect — Endocrinologia e Metabologia"). Áudio servido pelo Anchor/CloudFront. O campo "Feed RSS" no painel já vem pré-preenchido com ele (#310).
- **Atualização automática (semanal):** cron `/api/cron/podcast-refresh` (`0 9 * * 1`, segunda 09:00 UTC) lê o feed e grava os episódios novos no **topo** de `payload.podcasts` — não precisa mais clicar em importar. A lógica fica em `lib/podcasts.js` (`refreshPodcastsFromFeed`), compartilhada com o endpoint de importação manual `/api/podcast-feed` (que usa `fetchFeed`). Dedup por URL do áudio/título; só grava se houver episódio novo (read-modify-write curto p/ não brigar com edições do admin). Usa `payload.pod_rss_feed` se existir, senão o feed padrão acima. Auth via `CRON_SECRET`. Horário escolhido p/ não colidir com o cron do radar (10:30) nem o healthcheck (seg 11:00), que também gravam o payload global.
- **Como adicionar episódios manualmente (ainda disponível):** Painel do professor → Podcasts → **🔄 Atualizar episódios (RSS)** com esse feed. Traz os episódios novos no **modelo de áudio nativo** (`tipo:'rss'`, `<audio>`) e **no topo** da lista (#308). Útil para forçar a atualização fora da janela semanal.
- **Modelo dos itens:** os episódios usam `{title, area, desc, audio, tipo:'rss', at}`. O player embute Spotify só quando `tipo:'spotify'` + `src` `open.spotify.com` válido; `spotify.link`/embed que falha cai em link "Abrir no Spotify". Por isso, **preferir RSS** (player nativo confiável). `at` controla a ordem (mais-novo-primeiro).
- Anchor bloqueia bots (403) em fetch direto/WebFetch — para ler o feed fora do app, usar o endpoint `/api/podcast-feed?url=` da própria plataforma (tem User-Agent + guarda anti-SSRF).

## Vídeo
Hoje Vimeo/YouTube. Avaliados como alternativas (advisory): **Bunny Stream** (custo-benefício), Mevo, Panda Video. Sem mudança implementada.

## pagar.me
Ver [[Pagamentos pagar.me]].
