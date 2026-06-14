---
tags: [cofre, decisoes]
atualizado: 2026-06-14
---

# Decisões

Log de decisões de produto e técnicas (mais recentes no topo).

## 2026-06
- **PWA primeiro, app nativo depois (2026-06-14):** a plataforma vira **PWA instalável** (manifest + service worker network-first + ícones) como ganho imediato para o lançamento. App nas lojas (App Store/Play) será via **Capacitor** embrulhando a mesma SPA — depende de contas dev, build com Mac/CI e resolver a regra de **IAP da Apple** (pagamento de conteúdo digital; checkout pagar.me no navegador pode ser barrado). Não reescrever em React Native/Flutter. Ver [[Arquitetura]] e [[Pendências]].
- **Tema escuro como padrão (#250–#252):** a plataforma adota o visual escuro da landing (`data-theme` no `<html>`, default `dark`, reversível por usuário). Seletor Claro/Escuro no Perfil (aluno + professor) com **botões reais**. Ver [[Arquitetura]].
- **Videoaulas na landing (#244–#246):** card com os 4 professores (HLS via hls.js, grid 2×2); cortes começam no meio; a aula do Rodolpho (Vimeo) toca trecho fixo 00:55→01:05 em loop. Ver [[Arquitetura]].
- **Texto de apoio no Suporte (#248–#249):** mesma copy nos dois painéis (aluno + admin) antes do e-mail `contato@`.
- **Newsletter — priorização editorial (#275) + layout (#283):** ordena por tipo (revisão/metanálise/diretriz/consenso > ensaios/originais) e periódico (NEJM>Lancet>outros), data desc no desempate; e-mail em largura total, fontes maiores, logo no cabeçalho. Ver [[Newsletter e Radar]].
- **Importação de PDF lê texto no navegador (#276):** corrige HTTP 413 enviando texto extraído (pdf.js) em vez do binário. Ver [[Arquitetura]].
- **Navegação determinística (#284):** reload **mantém** a tela atual (professor na seção em que estava, aluno no painel); só **logout+login** volta ao padrão (Analytics / Mural). Substitui o comportamento anterior que forçava Analytics/Mural em todo reload. Ver [[Arquitetura]].
- **Diretrizes (renomeada de "Referência"):** seção subespecialidade→tema→diretriz com conteúdo híbrido (admin escreve resumo+bullets; IA deriva flashcards+mapa, tudo editável). Importação de PDF via IA. **Aluno vê em 3 formatos, só leitura**; no painel do professor, abrir um tema mostra a **mesma tela do aluno** + Editar/Excluir (#284). Gated por `DIRETRIZES_PUBLICADO=false` ("Em breve") até a curadoria liberar. Taxonomia de 11 subespecialidades (sem "Reprodução" → Endocrinologia Masculina).
- **IA do professor não consome créditos de aluno:** o assistente/geração das Diretrizes usa `/api/ai` (conta Anthropic do servidor), não as cotas do aluno.
- **Biblioteca pré-salva (perk de membro):** ~20 flashcards/subespecialidade (5 amostra p/ todos + 15 só membro) e 15 mapas mentais. Os originais **permanecem na degustação**; só os **novos** são member-only (`!isDegustacao()`; mapas novos com `member:true`). Médico deve revisar clinicamente os 180 flashcards gerados por IA — ver [[Pendências]].
- **Newsletter — priorização (lib/newsletter.js):** ordena por tipo (revisão/metanálise/diretriz/consenso > ensaios/originais) e, dentro disso, por periódico (NEJM > Lancet > outros), data desc como desempate. Layout em **largura total** (sem caixa centralizada), fontes maiores, logo do Endodirect no cabeçalho.
- **Calculadoras também no painel do professor (#277):** reaproveita as do aluno; funções escopadas a `calcRoot` para conviverem nos dois contêineres sem colisão de IDs.
- **Login inicial:** aluno sempre no **Mural** (`homePanel` Mural-first); professor no **Analytics** — mas só num login novo (ver navegação determinística acima).
- **Redirects de auth sempre canônicos (`www`):** `authBaseURL()` força confirmação/recuperação/OAuth para `https://www.endodirect.com.br` (origem só em localhost). Antes usava `window.location.origin`, então quem assinava pelo apex caía em `endodirect.com.br` (timeout) após confirmar o e-mail. O apex ainda precisa ser corrigido na Vercel/DNS — ver [[Pendências]].
- **Limite de 2 dispositivos por aluno** (anti-compartilhamento): tabela `endodirect_devices` + RPCs claim/check; heartbeat 60s; admins isentos. Ver [[Dados e Supabase]].
- **Login por usuário (anti-bleed):** o `user_profile`/estudo locais deixam de ser confiados cegamente. `doLogin` rastreia `last_uid`; ao trocar de conta no navegador, `clearLocalUserData()` limpa os dados locais do aluno anterior, e a decisão de onboarding passa a ser feita **após o hydrate** (perfil remoto manda) via `maybeOnboardAfterHydrate`. Corrige: aluno novo pulando o onboarding (CRM/UF) e herdando o perfil de um teste anterior. ⚠️ Editar o **override** de `doLogin` (~l.6583), não a base.
- **Confirmar e-mail = ON** no Supabase + auto-cadastro completo na tela de login: toggle Entrar/Criar conta, confirmar senha, painel persistente "confirme seu e-mail" e botão **Reenviar**. Ao clicar no link, o usuário volta logado (degustação → onboarding CRM/UF). Ver [[Pendências]].
- **CRM + UF obrigatórios no onboarding** (todos os perfis), para alimentar o Memed sem redigitar. Ver [[Integrações]].
- **Cofre de conhecimento no repo** (este cofre) em vez de exportação Obsidian para alunos. O Obsidian é para organizar a IA/projeto, não recurso de estudante. Botão de export removido (#172). Ver [[README]].
- **Calculadoras:** adicionar TmP/GFR (Payne) e escore-z de estatura/idade (OMS+CDC, LMS). OMS como referência padrão. Ver [[Calculadoras]].
- **Newsletter personalizada** por subespecialidade escolhida pelo aluno no Perfil.
- **pagar.me em produção (LIVE).** Detecção de modo LIVE corrigida (chaves v5 são `pk_`/`sk_` sem `_live_`).
- **Login com cadastro e-mail/senha** (além do Google), pois nem todos têm Gmail. Checkout reaproveita dados de cadastro/cobrança (cross-device).
- **Preços:** 2 pacotes (Standard/Gold), não 3. Anual em destaque. Ver [[Planos e Preços]].
- **Oferta de fundador** direcionada ao **Gold** (era Premium antes da simplificação para 2 pacotes); só no ciclo anual.
- **Assistente de Prescrição via API Memed** (substitui builder próprio). Ver [[Integrações]].
- **Automação semanal de health check** da plataforma.

## Regras permanentes
- **Nunca** armazenar dados de cartão (só tokenizar no pagar.me).
- **Nunca** colar segredos no chat, em commits ou neste cofre.
- Não reescrever commits já mergeados em `main`.
- Não incluir identificador de modelo em commits/PRs/artefatos.
