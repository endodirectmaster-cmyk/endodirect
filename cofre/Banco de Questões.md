---
tags: [cofre, questoes]
atualizado: 2026-07-21
---

# Banco de Questões

- **`provas` / `provasDB`** — banco principal de questões.
- **`DB.q`** — questões **salvas pelo aluno** (ex.: geradas por IA e mantidas).
- Shape normalizado: `{stem, options:{A..E}, answer, explanation, area, inst, ano?, code, type, at}` (ver `normalizeImportedQuestion`). Ver [[Dados e Supabase]].

## Entrega das provas ao aluno (member_content)
- O aluno **não** lê o `global_state`; recebe as provas via **`endodirect_member_content()`**. Regra (2026-07-21): **assinante (plano) recebe todas as questões que NÃO são do TEEM** — ou seja, banco **Endodirect + todas as de residência**. EndoTEEM (sem plano) = só Endodirect (+TEEM). Degustação = 50 do Endodirect. Ver [[Dados e Supabase]].
- ⚠️ Consequência: para o aluno ver questões novas de residência, elas só precisam ter `inst` ≠ 'TEEM' (não precisam ser 'Endodirect'). Não esquecer: inserir no `global_state` **e** garantir que o member_content as inclui.

## Estado do banco de residência (2026-07-21) — total 254 questões
Banco geral: **2401** questões (`payload.provas`). Das quais **254 de residência** (`origem='provas_residencia_drive'`), sourceIds distintos, 0 answer-fora, 0 sem-comentário.
- **Lote 1 (124):** Einstein 2023/24/25, Enamed 2025, ENARE 2023/24, IAMSPE 2023/25, Santa Casa-SP 2025, SUS-SP 2023/25, USP-RP 2023/24/25, USP-SP 2023/24/25.
- **Lote 2 (11):** UNIFESP-EPM R3 2023 (7) + recuperadas Einstein 2024 Q12/13/40 (3, tabelas/gasometrias lidas por imagem) + Santa Casa-SP 2025 #64 (1).
- **FUVEST (29):** USP-FMUSP/FUVEST 2023 (prova E19 Endocrinologia + endócrino da Clínica Médica prova B). ⚠️ **`revisar_gabarito:true`** — os PDFs **não tinham gabarito oficial**; respostas deduzidas por raciocínio clínico + aviso no início do comentário. **A revisar.**
- **USP R3 Ano Adicional (90):** USP-R3 Endocrinologia 2023 (30), 2024 (40), 2025 (20) — provas de acesso R3 de Endócrino, com gabarito oficial. Obs: gabaritos oficiais controversos sinalizados no próprio comentário (ex.: USP R3 2025 Q19, nódulo subcentimétrico).

## Pendências de provas (Drive)
- [ ] **Revisar as 29 FUVEST 2023** (`revisar_gabarito:true`) — confirmar/corrigir gabarito (não havia oficial).
- [ ] **USP-SP 2024 #76 (US de ovário) e #104 (painel de CAD):** não recuperáveis — PDF de 20 MB acima do teto de 10 MB do download do Drive via MCP; hosts do Google bloqueados no proxy. Precisam de PDF menor ou das figuras avulsas.

## Provas de residência (Drive → banco) — 2026-07-21
- **124 questões de endocrinologia** extraídas das provas de residência da pasta "Provas de residência" do Google Drive e inseridas em `endodirect_global_state.payload.provas` (total 2147 → 2271). Conteúdo **member-only** (`free:false`).
- **17 provas / 8 instituições novas** no filtro Instituição: Einstein (2023/24/25), Enamed (2025), ENARE (2023/24), IAMSPE (2023/25), Santa Casa-SP (2025), SUS-SP (2023/25), USP-RP (2023/24/25), USP-SP (2023/24/25).
- Cada item tem **comentário do gabarito** próprio (campo `explanation`) explicando a correta e refutando as demais.
- **Idempotência:** cada item traz `sourceId='provas_residencia:<SLUG>:<ano>:<num>'` e `origem='provas_residencia_drive'`; a inserção é anti-join por `sourceId`, então re-rodar não duplica. Assembler/insert em `scratchpad/provas/` (assemble.js + gen.js + batch*.sql; não versionados — são scratch).
- **Descartadas** (não versionadas): questões que dependem de imagem/tabela não extraível do PDF (opção/enunciado com placeholder) e questões **ANULADAS** (mc sem gabarito). ~10 no total.
- Taxonomia por subárea: Diabetes 37, Endocrinologia Feminina 23, Endocrinologia Pediátrica 17, Tireoide 13, Osteometabolismo 10, Neuroendocrinologia 8, Obesidade 7, Adrenal 5, Lípides 4.

## Histórico de curadoria
- **794 comentários** do TEEM aplicados ao banco (via tabela de staging no Supabase).
- Questões **anuladas** (6 sem resposta possível) tratadas em Provas/Simulado/editor admin.
- Correções de gabarito e unidades: TEEM2022-046 (mg→mcg), TEEM2025-034 (g/dL→mg/dL), TEEM2026-088 (gabarito D), TEEM2026-007 (gabarito A). TEEM2019-083 reintegrada (imagem/enunciado corrigidos). Figura `teem2026-q7.png` recortada para remover alternativas embutidas.

## Pendência
- Revisar **Grupo 2** (29 gabaritos ambíguos) listado em `gabaritos-suspeitos.md` (enviado ao usuário). Ver [[Pendências]].
