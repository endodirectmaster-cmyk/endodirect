---
tags: [cofre, decisoes]
atualizado: 2026-06-10
---

# Decisões

Log de decisões de produto e técnicas (mais recentes no topo).

## 2026-06
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
