# Divisão de capítulos grandes — spec (2026-08-14)

## Por que dividir

Convenção da casa, registrada em `cofre/Decisões.md` na criação dos 14 capítulos
de Esporte/Endocrinopatias: **cada capítulo = resumo de 4.845–7.234 caracteres +
tabela `## 📊` + 10 pts + 5 flashcards + mapa de 3 níveis.**

O enriquecimento do EndoTEEM estourou isso em vários:

| capítulo | chars | pts | × o padrão |
|---|---|---|---|
| Complicações Crônicas do Diabetes | 29.388 | 63 | ~4,9× |
| Osteoporose: Diagnóstico e Tratamento | 25.334 | 20 | ~4,2× |
| Tratamento do DM2 | 18.785 | 44 | ~3,1× |
| Carcinoma Diferenciado de Tireoide | 17.351 | 41 | ~2,9× |
| Hipotireoidismo | 14.212 | 43 | ~2,4× |

## ⚠️ TRAVA: a escrita é read-modify-write sobre UMA linha jsonb

`endodirect_global_state.payload` é **uma linha só**. Dois agentes escrevendo em
paralelo = **lost update**: o segundo sobrescreve o primeiro sem erro. Por isso a
divisão é **sequencial, um capítulo por vez**, e cada uma é conferida antes da
seguinte.

## Conservação — o que tem de ser provado a cada divisão

1. **Nenhuma seção perdida**: a soma dos `resumo` novos, mais o que ficou no
   original, contém **todas** as seções `##` de antes.
2. **Nenhum pt perdido nem duplicado**: os 63 pts entram em exatamente um destino.
3. **Flashcards e fluxograma redistribuídos**, não recriados.
4. **Mapa por capítulo**, derivado dos ramos do mapa original.
5. **Total de diretrizes** sobe exatamente pelo número de capítulos criados.
6. `sub`, `privado:true`, `ano`, `fonte` herdados.

## Fronteiras medidas — Complicações Crônicas do Diabetes

| seções | assunto | chars |
|---|---|---|
| 1–4 | micro/macro/pé/prevenção (visão geral) | ~3,6k |
| 5–11 | risco CV, estratificadores, metas lipídicas, estatina, TG | ~6,0k |
| 12–13 | retinopatia + neuropatia | ~4,9k |
| 14 | úlcera e infecção no pé diabético | ~3,0k |
| 15 | doença renal do diabetes | ~4,3k |
| 16 | comorbidades (IC, HAS, imunização, depressão) | ~2,8k |
| 17–18 | pegadinhas + 📊 rastreamento | ~3,5k |
