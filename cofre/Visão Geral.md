---
tags: [cofre, produto]
atualizado: 2026-06-14
---

# Visão Geral

**Endodirect** é uma plataforma de **educação médica em Endocrinologia e Metabologia** (público brasileiro): banco de questões comentadas, flashcards, mapas mentais, simulador de casos, simulado, prescrição, assistente de prescrição, podcasts, cursos, **Diretrizes** (resumos por subespecialidade→tema, ver [[Arquitetura]]), mural/radar de atualizações e ferramentas com IA. Baseado nas diretrizes SBEM, SBD, ADA.

## Stack

- **Frontend:** SPA single-file (`index.html`, JS vanilla, scripts inline). Ver [[Arquitetura]].
- **Backend:** funções serverless em `api/` + módulos em `lib/`.
- **Hospedagem:** Vercel (deploy de produção a cada merge em `main`).
- **Banco/Auth:** Supabase. Ver [[Dados e Supabase]].
- **E-mail:** Resend. **IA:** Anthropic. **Pagamentos:** pagar.me. Ver [[Integrações]] e [[Pagamentos pagar.me]].

## Domínio

- App: `www.endodirect.com.br`
- Auth/Supabase: `auth.endodirect.com.br`

## Modelo de acesso

- **Degustação** (sem pacote): flashcards e mapas pré-salvos, ~50 questões, mural por 7 dias e **3 usos** de cada ferramenta com IA (cota).
- **Pacotes** liberam o conteúdo completo. Ver [[Planos e Preços]].
