---
tags: [cofre, moc]
atualizado: 2026-06-22
---

# Cofre Endodirect — base de conhecimento

Este é o **cofre de conhecimento do projeto Endodirect**, mantido pelo assistente (Claude) e versionado no repositório. Serve para preservar contexto entre sessões e dar consistência ao desenvolvimento.

> [!info] Como abrir no Obsidian
> Aponte o Obsidian para a pasta `cofre/` do repositório clonado ("Open folder as vault"). Os arquivos usam `[[wikilinks]]` e `tags`, então o grafo e os backlinks funcionam normalmente. O cofre **não** vai para o deploy da Vercel (está no `.vercelignore`).

> [!warning] Regra de ouro
> **Nunca** registrar segredos aqui (chaves, tokens, valores de variáveis de ambiente, dados de cartão). Só nomes de variáveis, estrutura e decisões. O repositório é **público**.

## Mapa do cofre (MOC)

- [[Visão Geral]] — o que é o produto e a stack
- [[Arquitetura]] — como o código é organizado
- [[Dados e Supabase]] — tabelas, estado, RPCs, shapes
- [[Pagamentos pagar.me]] — checkout, webhook, chaves, modo LIVE
- [[Planos e Preços]] — pacotes, oferta de fundador
- [[Newsletter e Radar]] — envio diário e mural automático
- [[Calculadoras]] — calculadoras clínicas (inclui z-score e TmP/GFR)
- [[Banco de Questões]] — provas, questões, histórico de correções
- [[Integrações]] — Resend, Anthropic, Memed, vídeo
- [[Instagram Stories (Questão do Dia)]] — post diário de questão em Stories (planejamento)
- [[Pendências]] — o que falta (lado do usuário e do código)
- [[Decisões]] — log de decisões de produto/técnicas
- [[Convenções de Trabalho]] — fluxo de git, validação, regras

## Manutenção

Ao final de cada mudança relevante, atualizar a nota correspondente e, se for uma decisão, registrar em [[Decisões]]. Campo `atualizado:` no topo de cada nota.
