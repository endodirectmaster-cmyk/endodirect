---
tags: [cofre, questoes]
atualizado: 2026-07-21
---

# Banco de Questões

- **`provas` / `provasDB`** — banco principal de questões.
- **`DB.q`** — questões **salvas pelo aluno** (ex.: geradas por IA e mantidas).
- Shape normalizado: `{stem, options:{A..E}, answer, explanation, area, inst, ano?, code, type, at}` (ver `normalizeImportedQuestion`). Ver [[Dados e Supabase]].

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
