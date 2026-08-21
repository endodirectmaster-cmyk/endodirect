---
tags: [cofre, questoes]
atualizado: 2026-08-21
---

# Banco de Questões

- **`provas` / `provasDB`** — banco principal de questões.
- **`DB.q`** — questões **salvas pelo aluno** (ex.: geradas por IA e mantidas).
- Shape normalizado: `{stem, options:{A..E}, answer, explanation, area, inst, ano?, code, type, at}` (ver `normalizeImportedQuestion`). Ver [[Dados e Supabase]].

## Entrega das provas ao aluno (member_content)
- O aluno **não** lê o `global_state`; recebe as provas via **`endodirect_member_content()`**. Regra (2026-07-21): **assinante (plano) recebe todas as questões que NÃO são do TEEM** — ou seja, banco **Endodirect + todas as de residência**. EndoTEEM (sem plano) = só Endodirect (+TEEM). Degustação = 50 do Endodirect. Ver [[Dados e Supabase]].
- ⚠️ Consequência: para o aluno ver questões novas de residência, elas só precisam ter `inst` ≠ 'TEEM' (não precisam ser 'Endodirect'). Não esquecer: inserir no `global_state` **e** garantir que o member_content as inclui.

### ✅ A RPC NÃO FAZIA ISSO — CORRIGIDO EM 2026-08-21
Ao ler o `prosrc` de `endodirect_member_content()` para garantir que as 500 novas
chegariam ao aluno, achei o ramo de `provas` assim: **`plano` e `curso:endoteem`
caíam no MESMO ramo**, `where v->>'inst' = 'Endodirect'`. Não havia ramo algum para
as demais instituições — ou seja, **as 254 questões de residência (11 instituições,
entre elas USP-R3 90 e FUVEST 29) não eram entregues a ninguém**, contrariando a
regra registrada em 21/07 logo acima.

O professor decidiu: *"As 254 questões pode distribuir para os assinantes"*. Migração
`member_content_entrega_provas_residencia_ao_plano`. Os ramos agora são:

| perfil | recebe | antes → depois |
|---|---|---|
| `plano` | tudo que **não é TEEM** (Endodirect + residência) | 1.769 → **2.023** |
| `curso:endoteem` sem plano | só Endodirect, + TEEM | 2.649 (inalterado) |
| plano **+** endoteem | tudo | 2.903 |
| degustação (sem acesso) | 50 do Endodirect, ordem `md5` | 50 (inalterado) |

⚠️ **A ORDEM DOS RAMOS PASSOU A IMPORTAR.** `plano` tem de ser testado **antes** de
`curso:endoteem`: quem tem os dois precisa cair no ramo mais amplo e ainda receber o
TEEM pela concatenação. Invertido, o assinante com EndoTEEM perderia as de residência.

⚠️ **`coalesce(v->>'inst','')` no filtro, não `v->>'inst' <> 'TEEM'` puro.** Em SQL
`null <> 'TEEM'` é **NULL, não true** — uma questão sem instituição sumiria em
silêncio. Hoje são 0, mas o filtro não pode depender disso.

## Lote autoral Endodirect 2026 — 500 questões difíceis (2026-08-21)

Pedido: *"produza 500 novas questões ao todo, de nível difícil/muito difícil, envolvendo
todas as subespecialidades... instituição 'Endodirect' e ano 2026. 4 alternativas cada
questão com comentário"*. Banco **2.403 → 2.903**. Todas `inst:'Endodirect'`, `ano:2026`,
`dificuldade:'avancado'`, códigos **`ENDODIRECT-1506` … `ENDODIRECT-2005`**.

Distribuição: Diabetes 55 · Adrenal 45 · Osteometabolismo 45 · Tireoide 50 ·
Neuroendocrinologia 40 · Obesidade 40 · Endocrinologia Feminina 40 ·
Endocrinologia Pediátrica 40 · Lípides 35 · Endocrinologia Masculina 30 ·
Endocrinologia Básica 20 · Endocrinopatias 20 · Endocrinologia do Esporte 20 ·
Transgeneridade 20. Gabarito **A=125 B=125 C=125 D=125**.

### 🧨 NÃO EXISTE TIER "MUITO DIFÍCIL" — e inventar um não dá erro, dá "Médio"
`diffTag()` (`index.html`, ~5575) é `lbl={basico:'F',intermediario:'M',avancado:'D'}` e
retorna **`lbl[d]||'M'`**. Um valor fora desse vocabulário fechado **não quebra nada**: a
questão simplesmente renderiza como **"M" (Médio)** — o oposto do que o professor pediu, e
sem nenhum sinal. Por isso as 500 são `avancado`, o tier mais alto que existe. **Criar um
tier novo é mexer em `diffTag`, no filtro e na legenda** — não é só escrever outra string.

### ⚠️ Código duplicado funde o estado de repetição espaçada
`srsKey(q)` (~3699) é `String(q.code||q.id||q.stem||'')`. Dois itens com o mesmo `code`
**compartilham o SRS** — o aluno acerta um e o outro sai da fila. Por isso a numeração
começou em 1506: o maior `ENDODIRECT-<n>` existente era **1505** (a série tem lacunas;
são 1.267 códigos para um máximo de 1505). Conferido no banco: **0 códigos duplicados**
entre as 2.903.

### Dedup: tokenizador portado para SQL e conferido contra o JS
O sandbox **não alcança o Supabase** (host fora do allowlist do proxy → 403), então tudo
passou por `mcp__Supabase__execute_sql`. Para varrer 500×2.403 sem trazer o banco para o
contexto, `igTokensStem` (~13027) foi portado para SQL e **verificado idêntico ao JS** em
três strings, incluindo uma com acento **maiúsculo** (`ÀS`) — o `lower()` do Postgres e o
`.toLowerCase()` do JS podiam divergir aí, e não divergem. Jaccard com o corte da casa
(**`IG_SIM_LIMITE = 0.32`**), por **índice invertido** (token → questão), não produto
cartesiano.

Resultado: **1 par acima do corte** e dois quase-clones abaixo dele. **3 questões reescritas:**
- `ENDODIRECT-1943` (**0,333** com `ENDODIRECT-564`/`TEEM2023-031`) — a mesma moral
  "TSH pouco alto, anti-TPO negativo, não tratar". Virou **interferência do anti-Tg na
  tireoglobulina** do seguimento do carcinoma diferenciado.
- `ENDODIRECT-1953` (**0,316** com `TEEM2025-031`) — abaixo do corte, mas a vinheta era
  quase a mesma (*homem, 68 anos, UTI, sepse, T3 baixo*). Virou o **rebote do TSH na
  convalescença**, que é outra armadilha.
- `ENDODIRECT-1861` (**0,281** com a `1945` do próprio lote) — duas questões com a mesma
  punch line ("corrigir o magnésio") no mesmo lote. Virou **doença óssea adinâmica na DRC**.

⚠️ **A automação não pegaria as duas de baixo.** 0,316 e 0,281 passam no corte de 0,32,
que está calibrado para *duplicata literal*, não para *mesma pergunta com outra roupa*.
Quem lê tem de olhar a faixa 0,28–0,32 à mão.

### 🧨 FAIXA DE CÓDIGO EM TEXTO MENTE — e a conferência quase passou
`where code between 'ENDODIRECT-1506' and 'ENDODIRECT-2005'` **pega `ENDODIRECT-16`,
`-17`, `-160`…**, porque a comparação é alfabética: `'16' > '1506'` e `'16' < '2005'`. A
verificação final deu **509** em vez de 500, com "9 questões com dificuldade errada" que
eram legado. Conferir sempre pelo **sufixo numérico**
(`(regexp_replace(code,'\D','','g'))::int between 1506 and 2005`).

### Merge e rollback
Um único `UPDATE ... jsonb_set(payload,'{provas}', (payload->'provas') || <agg>)`, com
`order by code`. Depois: as **2.403 antigas conferidas byte a byte** contra o backup
(igualdade de `jsonb`, não contagem). Payload **4.806 → 5.124 kB** (+318 kB; todo cliente
baixa isso).

- 💾 **`bkp_provas_20260821`** guarda o array `provas` anterior (1.886 kB), sem grant para
  `anon`/`authenticated`. **É o único caminho de rollback** — o banco de questões vive só
  no Supabase, não é versionado em git (mesma convenção do lote de residência). Pode ser
  dropado quando o professor confirmar o lote.
- Trigger `endodirect_global_preserve_server_keys` só atua para `authenticated`/`anon` e só
  sobre chaves de newsletter/radar — não interfere em `provas`.
- Os 28 JSON de origem e o validador ficaram em `scratchpad/questoes/` (**não versionados**,
  são scratch), com `checa.js` conferindo formato, vocabulário fechado, gabarito órfão,
  **citação de alternativa por letra no comentário** e duplicata interna.

### Jargão de IA: medido contra a régua da casa, não contra o meu gosto (2026-08-21)
Pedido do professor: *"evitar sempre jargões de IA. Deixar sempre os comentários em
linguagem técnica"*. A régua não foi inventada — está escrita em `lib/discussao.js`
(`SISTEMA`): metáfora de efeito, superlativo vago, autoelogio de método, a fórmula
"não é apenas X, é Y", `profundo` como reforço e `FT4`/`FT3`.

Rodada nos 500 comentários (301.719 caracteres): **jargão genérico de IA = 0**
("desempenha um papel", "em suma", "mergulhar", "holístico" — nenhuma ocorrência).
Mas **9 violações reais da régua da casa**, todas corrigidas por termo técnico:

| onde | era | virou |
|---|---|---|
| 1553 | supressão **profunda** do eixo | supressão **sustentada** |
| 1727 | evidência menos **robusta** | evidência mais **escassa** |
| 1742 | testosterona **profundamente** reduzida | **redução discreta** da testosterona |
| 1751 | suprimem **profundamente** o eixo | suprimem **de forma sustentada** |
| 1765 | benefício mais **robusto** | benefício mais **consistente** |
| 1772 | concentrações **extremamente** altas | **acima da faixa de medição** |
| 1840 | evidências mais **robustos** | evidências mais **consistentes** |
| 1960 | **supressão profunda** | **supressão do TSH abaixo da faixa de referência** |
| 1995 | reduz **drasticamente** a espermatogênese | leva a **oligozoospermia ou azoospermia** |

⚠️ **As 33 violações restantes no banco são do acervo antigo, não do lote** — medido
separando as 2.403 das 500. Não mexi nelas: é conteúdo já publicado.

📏 **Tique meu que sobrevive à régua:** `justamente` aparece **68×** em 500 comentários,
com `é justamente o/a/essa` em 21 delas. Não é jargão de IA nem viola regra escrita —
é ênfase repetida. Fica registrado; se o professor quiser, dá para afinar.

### Variedade temática: medida, não afirmada (2026-08-21)
Pergunta do professor: *"as questões estão variadas nos temas, correto?"*. Medido com
o Jaccard da casa sobre os **124.750 pares** possíveis:

| faixa | pares | % |
|---|---:|---:|
| ≥ 0,30 | 6 | 0,00% |
| 0,25–0,30 | 16 | 0,01% |
| 0,20–0,25 | 74 | 0,06% |
| **< 0,20** | **124.654** | **99,92%** |

Nenhum par ≥ 0,32. O maior de todos é **0,316** (SOP × HAC não clássica, que é a
comparação didática de propósito). Endocrinopatias e Esporte não têm **nenhum** par
acima de 0,20; as áreas com mais aproximação relativa são Pediátrica e Lípides, com
10 pares cada acima de 0,20 — ainda assim longe do corte.

### 📌 Ancoragem em diretriz: as 500 NÃO têm (regra nova de 2026-08-21)
Pedido do professor: *"priorizar questões sobretudo referentes a consensos/diretrizes
publicadas em 2026"*. Medido nas 500: **0 sociedades nomeadas** (ADA, SBD, ABESO, ATA,
Endocrine Society…), **0 anos de publicação citados**, 5 menções genéricas à palavra
"diretriz/consenso". Elas foram escritas sobre raciocínio clínico consolidado — o que
não as torna erradas, mas **não atende ao critério novo**.

A matéria-prima existe: **107 diretrizes com `ano='2026'`** já no `payload->'diretrizes'`,
em 11 subespecialidades — Diabetes 20, Obesidade 17, Tireoide 13, Pediátrica 11,
Neuroendocrinologia 8, Adrenal 7, Osteometabolismo 7, Lípides 6, Masculina 6, Feminina 6,
Básica 6. Várias já nomeiam a fonte no tema: *Algoritmo AACE 2026 para o manejo do DM2*,
*Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)*, *SURMOUNT-MAINTAIN (2026)*,
*Hipogonadismo masculino — Posicionamento SBEM/SBU/ABEMSS (2026)*.

### Efeito na degustação (medido, não estimado)
`provasPool()` no cliente ordena por `degHash(code|stem)` e corta em 50; a RPC do servidor
ordena por **`md5(v::text)`** — **são ordenações diferentes**, cada caminho entrega um 50
distinto. Pela regra do servidor (a que vale), das 50 atuais **43 permanecem** e **7 novas
entram**. Pela do cliente, 36 e 14. Nada se perde; o recorte apenas se renova.

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
