---
tags: [cofre, integracoes]
atualizado: 2026-06-24
---

# Integrações

## Resend (e-mail)
Newsletter diária + relatório do health check. Envio em batch, List-Unsubscribe. Env: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLYTO`. Ver [[Newsletter e Radar]].

### E-mails de autenticação (Supabase) via Resend
Os e-mails de auth (confirmação de cadastro, redefinir senha) devem sair do Endodirect, não do remetente padrão `noreply@mail.app.supabase.io`. Solução: **Custom SMTP no Supabase apontando para o Resend** (`smtp.resend.com:465`, user `resend`, senha = API key do Resend, sender `nao-responda@endodirect.com.br`) + **templates branded em PT** versionados em `supabase/email-templates/` (`confirm-signup.html`, `reset-password.html`). Aplicação é manual no painel (Authentication → Emails). Ver [[Pendências]].

## Suporte (formulário do app → caixa no painel do professor)
- **Fluxo:** o aluno usa o formulário em `panel-support` → `submitSupport` faz `POST /api/ai {kind:'support',...}` → `lib/support.js`: **(a)** salva um **ticket** na tabela `endodirect_support` (Supabase) e **(b)** notifica o suporte por e-mail (Resend, de `Endodirect Suporte <suporte@endodirect.com.br>`, `reply_to`=e-mail do aluno; destino `SUPPORT_TO`→`contato@endodirect.com.br`).
- **Caixa no painel (professor):** painel → **Suporte** lista os tickets (mais novos primeiro) com **badge "(N)"** das não respondidas. Responder ali envia a resposta ao aluno (de `suporte@`, citando a mensagem original) e marca o ticket como respondido. Endpoints via `kind` no `api/ai.js`: `support_list` e `support_reply` (exigem **admin** — `lib/admin-auth.js` valida Bearer token de sessão Supabase contra a tabela `endodirect_admins`).
- **Tabela `endodirect_support`:** `id, created_at, name, email, category, context, message, status('new'|'answered'), reply, answered_at, answered_by`. **RLS ON sem policies** → só `service_role` acessa; a PII do aluno **não** é exposta a clientes (não fica no `endodirect_global_state`).
- **Env:** `RESEND_API_KEY`, `SUPPORT_FROM` (opcional), `SUPPORT_TO` (opcional), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Limitação v1:** a resposta do aluno por e-mail chega na caixa de e-mail do suporte, não no painel; thread completa in-app = v2 (precisa webhook de e-mail de entrada → +1 função, barrado pelo teto 12/12). Ver [[Decisões]] (2026-06-24).

## Anthropic (IA)
Chat IA, simulador de casos, prescrição (treino) e o radar (`summarizeWithAI`). Env: `ANTHROPIC_API_KEY`. (Chave foi rotacionada pelo usuário após exposição anterior.) No sandbox de desenvolvimento, `api.anthropic.com` é dos poucos hosts liberados.

## Memed (Assistente de Prescrição)
- **STATUS (2026-06-19): EM PRODUÇÃO e funcionando** — chaves de produção configuradas (`configured:true`), `MEMED_ALLOW=rodolphomend@gmail.com` (gating: só o médico vê o Consultório), e o módulo de prescrição **renderiza em produção** (confirmado pelo médico). Ver [[Decisões]] #392 (fix do SDK) e #393 (estética + paciente obrigatório).
- Decisão: usar a **API da Memed** para o Assistente de Prescrição (substitui o builder próprio). Recurso fica **gated**; perfil ganhou `crm`/`uf`.
- **Onboarding** (primeiro login) coleta **CRM + UF obrigatórios** para todos os perfis → salvos em `user_profile.crm`/`.uf` (sincronizados). É o que `/api/memed/token` (exige `crm` e `uf`) e o Assistente de Prescrição (`prof.crm`/`prof.uf`) consomem. Endpoint `api/memed/token.js` já existe (gating: responde `configured:false` sem chave).
- ~~**Pendente:** assinatura do contrato + configurar `MEMED_API_KEY`/`MEMED_SECRET`~~ **RESOLVIDO (2026-06-19):** chaves de **produção** configuradas na Vercel e integração **no ar** (`configured:true`). Usuários que onboardaram antes da exigência preenchem CRM na tela do Assistente de Prescrição.
- **⚠️ Ambiente: API e SDK do front-end TÊM QUE CASAR (homologação × produção).** Um token de produção só renderiza no SDK de produção e vice-versa — usar o SDK errado faz o módulo "abrir" mas **travar a tela** (iframe não autentica; ver [[Decisões]] 2026-06-19). As 4 variáveis da Memed: `API Key`, `Secret Key`, **API Domain** e **Front-end Domain**.
  - **API Domain** (`MEMED_API_BASE`): homologação `https://integrations.api.memed.com.br` · produção `https://api.memed.com.br`.
  - **Front-end Domain / SDK** (`MEMED_SCRIPT`): homologação `https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js` · **produção `https://partners.memed.com.br/integration.js`** (formato totalmente diferente!).
  - No código: `api/memed/token.js` **deriva** o SDK do ambiente do `MEMED_API_BASE` (se não for `integrations.api.memed`, usa o de produção), então **não precisa** setar `MEMED_SCRIPT` na Vercel — mas ele sobrescreve se definido. O loader de produção (`integration.js`) injeta o `MdSinapsePrescricao` de forma **assíncrona** (o front faz poll por ele).
- **Dados/LGPD (#394):** dados do **paciente** (CPF/e‑mail/telefone) vão **direto p/ a Memed** (client-side `setPaciente`) — não passam pelo nosso backend nem ficam no banco. O `presc_emitidas` (histórico de emissões, sincronizado por usuário com RLS) guarda **só `{ts, rxId}`** (sem PII do paciente; `prescScrubLog` limpa legados no boot). `privacidade.html` cita a Memed como operador e descreve esse fluxo. **Pendência: DPA com a Memed** (lado do usuário). Ver [[Decisões]].
- Doc: https://doc.memed.com.br/docs/primeiros-passos · URLs por ambiente: doc.memed.com.br → Front-end → Configurações → URLs

## Podcasts (Anchor / Spotify for Podcasters)
- **Feed RSS do podcast:** `https://anchor.fm/s/6e257fc4/podcast/rss` (show "EndoDirect — Endocrinologia e Metabologia"). Áudio servido pelo Anchor/CloudFront. O campo "Feed RSS" no painel já vem pré-preenchido com ele (#310).
- **Atualização automática (diária):** roda **dentro do cron do radar** (`/api/cron/endocrine-radar`, 10:30 UTC) em vez de um cron/endpoint próprio. Motivo: o plano da Vercel (Hobby) limita o projeto a **12 serverless functions** e o projeto já está **no teto (12)** — criar `api/cron/podcast-refresh.js` virava a 13ª função e fazia o **deploy falhar** (build conclui, ERROR em "Deploying outputs"); o limite de **2 cron jobs** reforça a decisão. A lógica fica em `lib/podcasts.js` (`refreshPodcastsFromFeed`) — um **módulo** (não conta como função), chamado de forma fail-safe (nunca derruba o radar) e compartilhado com o endpoint de importação manual `/api/podcast-feed` (que usa `fetchFeed`). Dedup por URL do áudio/título; só grava se houver episódio novo (read-modify-write curto). Usa `payload.pod_rss_feed` se existir, senão o feed padrão acima. **Atenção (cofre):** não recriar `api/cron/podcast-refresh.js` nem outra função em `api/` sem remover outra — estourar 12 funções derruba TODO o deploy. Ver [[Decisões]].
- **Como adicionar episódios manualmente (ainda disponível):** Painel do professor → Podcasts → **🔄 Atualizar episódios (RSS)** com esse feed. Traz os episódios novos no **modelo de áudio nativo** (`tipo:'rss'`, `<audio>`) e **no topo** da lista (#308). Útil para forçar a atualização fora da janela semanal.
- **Modelo dos itens:** os episódios usam `{title, area, desc, audio, tipo:'rss', at}`. O player embute Spotify só quando `tipo:'spotify'` + `src` `open.spotify.com` válido; `spotify.link`/embed que falha cai em link "Abrir no Spotify". Por isso, **preferir RSS** (player nativo confiável). `at` controla a ordem (mais-novo-primeiro).
- Anchor bloqueia bots (403) em fetch direto/WebFetch — para ler o feed fora do app, usar o endpoint `/api/podcast-feed?url=` da própria plataforma (tem User-Agent + guarda anti-SSRF).

## Vídeo
Hoje Vimeo/YouTube. Avaliados como alternativas (advisory): **Bunny Stream** (custo-benefício), Mevo, Panda Video. Sem mudança implementada.

## pagar.me
Ver [[Pagamentos pagar.me]].
