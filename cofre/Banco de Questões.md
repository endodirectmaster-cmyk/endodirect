---
tags: [cofre, questoes]
atualizado: 2026-10-21
---

# Banco de Questões

- **`provas` / `provasDB`** — banco principal de questões.
- **`DB.q`** — questões **salvas pelo aluno** (ex.: geradas por IA e mantidas).
- Shape normalizado: `{stem, options:{A..E}, answer, explanation, area, inst, ano?, code, type, at}` (ver `normalizeImportedQuestion`). Ver [[Dados e Supabase]].
- **`DB.feitas`** (2026-10-05) — questões do Banco **já respondidas pelo aluno**: `{ chave: {ok:1|0, at} }`, chave = `srsKey(q)` (código, ou enunciado em minúsculas, a mesma do caderno de erros). Pessoal: `persist()` + `PERSONAL_STATE_KEYS` + `userStatePayload` → `app_state`; na hidratação, `mesclarFeitas(servidor, aparelho)` fica com o registro mais recente por questão; `clearLocalUserData` zera ao trocar de conta. Gravada em `selectOpt` (`feitaRegistrar`; anulada entra como `{ok:null,tipo:'anulada'}` — "Anulada · vista em") e em `evalDisc` (discursiva avaliada, `tipo:'disc'` — "Respondida em"). A cópia salva (`saveOneQ`/`saveAllQ`) preserva o código original, então responder no banco salvo marca a mesma questão. Na tela: selo "Acertou/Errou em dd/mm" no card (`feitaSeloHTML`, id `qfeita-<src>-<i>`), contagem "N já respondidas" em `updateProvaInfo`, caixa `#q-naofeitas` ("Mostrar só as que ainda não respondi") e botão `#btn-sortear-5` (`sortearNaoFeitas(5)`: sorteio dentro dos filtros atuais, excluindo as feitas). `genAnswered` continua existindo, mas só para o contador da sessão (zera a cada Buscar) — a memória entre buscas e aparelhos é `DB.feitas`.
- **Explicação das alternativas incorretas** (2026-10-05) — o banco só tem o comentário do gabarito. Depois de responder, o card ganha o botão "Por que as outras alternativas estão incorretas?" (`data-exp-alt="src|idx"` → `explicarAlternativas`): `callAIJson(groundSys(persona), usr, 1100, 0, AI_MODEL_CLINICO)` — **sempre `groundSys`** (sentinela; sem ela o servidor corta o system em 60 mil caracteres e as diretrizes perdem o fim) — com enunciado, alternativas **pelo texto**, gabarito pelo texto e comentário do professor; a IA devolve `{itens:[{alternativa,motivo}]}`; memória por questão na sessão (`altMemo`); exige **pacote** (`blockIfDegustacao`: degustação e curso avulso ficam de fora, com aviso) e o botão só aparece para quem tem; acessos pendentes → "Confirmando o seu plano…" e nova tentativa da RPC. **Sem rótulo "gerado por IA"** no texto: o professor pediu para retirar (05/10/2026). O texto na tela é rotulado "Comentário gerado por IA a partir do gabarito e do comentário do professor".

## Vitrine: "mais de 3 mil questões" (2026-10-21)

O professor, com o print da landing: *"Acho que já pode dar uma atualizada aí na tela para
mais de 3 mil"*.
- **Contado no banco antes de trocar:** 3.015 questões (`endodirect_acervo_totais().provas`)
  e 2.184 flashcards (533 em `fc_shared` + 1.651 nos resumos).
- **O que mudou na landing:**
  - o parágrafo de abertura passou a "Mais de 3 mil questões comentadas";
  - o cartão do Banco, a "Mais de 3.000 questões".
- **O que não mudou:** os flashcards seguem "mais de 2 mil", porque 3 mil ainda não é
  verdade. Os capítulos seguem "mais de 100" (são 118).
- **`scripts/test-vitrine-nao-mente.js`:** o teto passou de 2.965 para 3.015, com a data, e
  agora vale também para os flashcards e para a forma "N mil".
  - Ao subir um anúncio, conte no banco e suba o teto junto.
  - As 4 sabotagens (4 mil e 3.500 questões, 3 mil e 3.000 flashcards) foram acusadas.
- A/B no Chromium da landing (computador e celular): só os dois números mudaram.
- `sw.js` v321.

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

## Lote SBD 2026 ancorado em diretriz — 62 questões (2026-08-21)

Pedido: *"Pode fazer as questões sim, citando a fonte, mas não precisa citar o grau no
comentário. 20% questões de nível médio e 80% de nível difícil"*. Primeiro lote a nascer
sob a regra de ancoragem de 2026-08-21 (ver [[Convenções de Trabalho]]): a vinheta foi
derivada **da diretriz**, não escrita antes e respaldada depois.

Banco **2.903 → 2.965**. Códigos **`ENDODIRECT-2006` … `ENDODIRECT-2067`**, todas
`area:'Diabetes'`, `inst:'Endodirect'`, `ano:2026`.

| fonte (Diretriz SBD 2026) | questões | códigos |
|---|---:|---|
| Manejo do paciente DM2 com insuficiência cardíaca | 19 | 2006–2024 |
| Manejo do Diabetes Mellitus Tipo 2 | 15 | 2025–2039 |
| Doença renal do diabetes | 28 | 2040–2067 |

- **Mistura de dificuldade: 13 `intermediario` (21,0%) · 49 `avancado` (79,0%)** — o
  pedido era 20/80. Não há tier acima de `avancado` (ver a seção do lote de 500).
- Gabarito **A=16 B=16 C=15 D=15**.
- **Fonte citada em 62/62 comentários**; **grau de recomendação citado em 0** — o
  professor pediu a fonte sem o grau, e isso foi medido, não presumido.

### 🧨 `--reequilibrar` apagava a dificuldade em silêncio
`checa.js` carimbava `dificuldade='avancado'` na entrada e, na reescrita, **apagava os
campos que ele mesmo carimba** (`delete c.area; delete c.inst; delete c.ano; …`). Isso
estava certo enquanto a dificuldade era uniforme. Com a mistura 20/80 **vinda do autor**,
o rebalanceamento do gabarito zerou os 13 `intermediario` — sem erro, sem aviso.

É **o mesmo defeito do `lbl[d]||'M'` do `diffTag`, só que na entrada**: valor ausente vira
padrão silencioso em vez de falha. Corrigido — a dificuldade agora só recebe padrão quando
o autor não declarou (`if (!q.dificuldade) q.dificuldade = 'avancado';`) e **não é mais
apagada na reescrita**. Conferido depois: a mistura sobrevive a um `--reequilibrar`.

### Lote ancorado em diretriz estreita bate no corte de dedup por construção
Escritas de um documento só, as vinhetas compartilham o vocabulário obrigatório dele.
Duplicatas **internas** na primeira redação: **18 no lote de IC** (27 vinhetas) e **28 no
de DRD** — neste, *todos* os enunciados abriam com o mesmo esqueleto (*"Paciente com
doença renal do diabetes e filtração glomerular estimada de X mL/min/1,73 m²"*).

A correção **não foi afrouxar o corte**. Foi:
1. **IC: 27 → 19 questões**, uma por decisão clínica distinta — daí o lote ter 62 e não 100.
2. **DRD: 21 enunciados reescritos**, variando o cenário (farmácia clínica, nutricionista,
   auditoria de prontuário, sala de hemodiálise) e **como a função renal é expressa**
   (estágio 3b, creatinina, clearance) em vez de sempre a TFGe em mL/min/1,73 m².

⚠️ Registro para o próximo lote ancorado: **mais questões por documento força quase-clone**.
O limite não é a diretriz, é o número de decisões clínicas distintas que ela contém.

### Dedup contra o banco inteiro: 62 × 2.903 = 180.000 pares
Tokenizador `igTokensStem` inline em SQL (o `pg_temp` **não sobrevive entre chamadas** do
`execute_sql` — cada chamada é uma sessão nova). Conferido contra o **JS real lido do
`index.html`**, não contra uma reescrita de memória: os três pares de maior nota bateram
com 4 casas.

| par | nota |
|---|---:|
| `ENDODIRECT-2013` × `ENDODIRECT-1842` | 0,2553 |
| `ENDODIRECT-2042` × `TEEM2026-037` | 0,2250 |
| `ENDODIRECT-2020` × `ENDODIRECT-1543` | 0,2222 |

Maior de todos **0,2553**, abaixo do corte de 0,32 e também da faixa 0,28–0,32 que exige
olho humano. **Nenhuma reescrita foi necessária.** 0 colisão de `code` (o SRS está a salvo).

### Merge e rollback
`UPDATE ... jsonb_set(payload,'{provas}', (payload->'provas') || <agg order by code>)`.
Conferência dos **dois lados**, por hash e não por contagem:
- as **2.903 antigas** ficaram byte a byte iguais ao backup;
- as **62 novas** hasheiam igual ao arquivo local (`md5` de stem+4 alternativas+gabarito+
  dificuldade+comentário = `66f71d0b0c10c5eb4c4f5cf1f328de11` nos dois lados).

Payload **5.146 → 5.181 kB**. Entrega pela RPC: `plano` **2.023 → 2.085**, `curso:endoteem`
base 1.831, TEEM 880, **0 questões sem instituição**.

- 💾 **`bkp_provas_20260821_sbd`** guarda o array anterior (2.903), sem grant para
  `anon`/`authenticated`. Único caminho de rollback. `tmp_sbd_2026` dropada.

## Lote "estudos de 2025 e 2026" — 50 questões (2026-10-12)

Pedido: *"Gere umas 50 questões de múltipla escolha para o banco de questões da plataforma
sobre os estudos mais importantes publicados em 2025 e 2026"*. Banco **2.965 → 3.015**.
Códigos **`ENDODIRECT-2068` … `ENDODIRECT-2117`**, `inst:'Endodirect'`, `ano:2026`, mesmo
formato dos lotes de 21/08 (sem `id`; a chave de merge do painel fica `stem|answer|inst`).

- **Fonte primeiro, vinheta depois** (regra de ancoragem): cada questão nasce de um ensaio
  cujo resumo foi lido no PubMed antes da redação (ano, desenho, população, resultado
  principal, eventos adversos). O comentário cita o estudo pelo nome, a revista e o ano,
  sem PMID, DOI ou letra de alternativa. Tabela de fontes no fim desta seção.
- **Distribuição:** Diabetes 11 · Obesidade 11 · Lípides 8 · Adrenal 3 ·
  Neuroendocrinologia 3 · Tireoide 3 · Osteometabolismo 3 · Feminina 4 · Masculina 1 ·
  Pediátrica 3. **Dificuldade: 10 `intermediario` (20%) · 40 `avancado` (80%)**, a mistura
  do professor. Gabarito **A=13 B=12 C=13 D=12**.
- 📏 **Pista da alternativa mais longa.** Na primeira redação, o gabarito era a
  alternativa estritamente mais longa em **30 de 50** questões; o acaso daria cerca de
  25%. Depois de reescrever 18 alternativas, ficou em **13 de 50**. Medir isso em todo
  lote: quem já fez prova sabe que "a mais completa é a certa".
- 🧨 **Distrator que o resumo não refuta.** Cinco alternativas erradas afirmavam coisas que
  o resumo apenas não relata, como "mais eventos gastrointestinais com 5 mg"
  (SURMOUNT-MAINTAIN) ou "mais hipoglicemia grave com a alça fechada" (CIRCUIT: um evento
  contra zero, sem teste). Foram trocadas por afirmações que o próprio estudo contraria.
  Regra: alternativa errada precisa ser refutável pela fonte, e não só ausente dela.
- **Jargão:** o `checa-jargao` só acusou siglas (nomes dos ensaios, AVC, JAMA, PSA…),
  nenhuma marca de registro.
- **Duplicata interna** (Jaccard da casa, com o tokenizador lido do `index.html`): um par
  acima do corte na primeira redação, CONFIDENCE × FINE-ONE (**0,354**), com o mesmo
  esqueleto de filtração, relação albumina/creatinina, potássio e "dose máxima". O FINE-ONE
  virou consulta de nefrologia com creatinina e albuminúria em amostra isolada. Maior par
  no fim: 0,256.
- **Duplicata contra o banco (50 × 2.965):** tokenizador inline em SQL, conferido contra o
  JS nas 50 contagens de tokens (todas iguais). Um par acima do corte, elinzanetante ×
  `ENDODIRECT-1675` (**0,364**, a mesma vinheta de tamoxifeno e fogachos), e dois na faixa de
  olho humano, STAREE × `ENDODIRECT-1727` (0,294) e PaTHway × `ENDODIRECT-1890` (0,278). As
  três vinhetas mudaram (letrozol; homem de 72 anos na atenção primária; homem com
  hipoparatireoidismo depois de tireoidectomia por Graves). Maior par no fim: **0,2453**
  (CONFIDENCE × `ENDODIRECT-2015`).

### Merge e rollback
- 💾 **`bkp_provas_20261012_estudos`** guarda o array anterior (2.965 itens, igual ao estado
  ao vivo no momento da cópia), sem grant para `anon`/`authenticated` e com RLS ligado.
- Carga em cinco blocos de dez na tabela de passagem `tmp_estudos_2026`, cada bloco com o
  **mesmo hash do arquivo local** antes do merge; depois, um `UPDATE` único com guarda: o
  `md5` do array `provas` tinha de ser o do backup, a passagem tinha de ter 50 itens e
  nenhum código 2068–2117 podia existir.
- Conferido depois: as **2.965 antigas idênticas ao backup** (igualdade de `jsonb`); as 50
  novas com o hash do arquivo local (`7197648a9a26d2550e580498d1b75b4a`, sobre
  code|stem|A|B|C|D|answer|dificuldade|explanation|area|ano|inst); 0 código repetido.
- Entrega: assinante (`plano`) **2.085 → 2.135**; `curso:endoteem` **2.711 → 2.761**;
  degustação: 46 das 50 seguem, entram as questões 2077, 2080, 2088 e 2089.
- ✅ **`tmp_estudos_2026` apagada em 17/10/2026** pelo professor, no editor SQL do
  Supabase, com guarda: nenhuma das 50 podia faltar no banco. Pelo conector, o `DROP`
  espera confirmação manual e expira em 60 s.

### ✅ (resolvido em 12/10) O `member_content` do Gold passou de ~5,34 para 5,43 MB
> **Resolvido no mesmo dia:** as questões saíram do `member_content` e vêm em páginas de
> 500 (`endodirect_member_provas_pagina`, ~0,9–1,1 MB cada); o conteúdo sem elas tem
> ~1,55 MB. Lote novo aumenta o número de páginas, não o tamanho de nenhuma resposta. Ver
> [[Decisões]] 2026-10-12 e [[Dados e Supabase]]. O texto abaixo é o registro de antes.

Medido com um Gold ativo, simulando o JWT dele (`request.jwt.claims` com o `sub`, a mesma
chamada que o app faz): **5.426.825 bytes**, dos quais `provas` 3.875.392 (2.135 itens) e as
50 novas 83.815. Antes do lote, ~5,34 MB. O cofre registra desde 23/07 que respostas perto
de ~5,3 MB deixam de chegar ao celular, e a poda de 24/09 deixou o Gold em 5,31 MB. As
provas são **71% da resposta**. **Antes do próximo lote, separar `provas` numa RPC própria**,
como já foi feito com `member_resumos` e `qotd_publicadas`; do contrário, cada lote empurra a
resposta inteira para cima. Ver [[Pendências]].

### Fontes (conferidas no PubMed; o DOI fica aqui, nunca no comentário)
| código | área | estudo | revista, ano | DOI |
|---|---|---|---|---|
| `ENDODIRECT-2068` | Diabetes | SOUL (semaglutida oral, desfecho CV) | NEJM 2025 | 10.1056/NEJMoa2501006 |
| `ENDODIRECT-2069` | Diabetes | SURPASS-CVOT (tirzepatida × dulaglutida) | NEJM 2025 | 10.1056/NEJMoa2505928 |
| `ENDODIRECT-2070` | Diabetes | ACHIEVE-1 (orforglipron, DM2 inicial) | NEJM 2025 | 10.1056/NEJMoa2505669 |
| `ENDODIRECT-2071` | Diabetes | Zimislecel, fase 1–2 (FORWARD) | NEJM 2025 | 10.1056/NEJMoa2506549 |
| `ENDODIRECT-2072` | Diabetes | 2IQP (alça fechada no DM2) | NEJM 2025 | 10.1056/NEJMoa2415948 |
| `ENDODIRECT-2073` | Diabetes | CONFIDENCE (finerenona + empagliflozina) | NEJM 2025 | 10.1056/NEJMoa2410659 |
| `ENDODIRECT-2074` | Diabetes | STRIDE (semaglutida na DAP) | Lancet 2025 | 10.1016/S0140-6736(25)00509-4 |
| `ENDODIRECT-2075` | Diabetes | QWINT-1 (efsitora em dose fixa) | NEJM 2025 | 10.1056/NEJMoa2502796 |
| `ENDODIRECT-2076` | Diabetes | COMBINE 4 (IcoSema × glargina) | Lancet Diabetes Endocrinol 2026 | 10.1016/S2213-8587(26)00136-1 |
| `ENDODIRECT-2077` | Diabetes | FINE-ONE (finerenona no DM1) | NEJM 2026 | 10.1056/NEJMoa2512854 |
| `ENDODIRECT-2078` | Diabetes | Análise combinada SELECT/FLOW/SOUL (rim) | Lancet Diabetes Endocrinol 2026 | 10.1016/S2213-8587(26)00134-8 |
| `ENDODIRECT-2079` | Obesidade | SURMOUNT-5 (tirzepatida × semaglutida) | NEJM 2025 | 10.1056/NEJMoa2416394 |
| `ENDODIRECT-2080` | Obesidade | ATTAIN-1 (orforglipron, obesidade) | NEJM 2025 | 10.1056/NEJMoa2511774 |
| `ENDODIRECT-2081` | Obesidade | REDEFINE 1 (CagriSema); REDEFINE 2 no comentário | NEJM 2025 | 10.1056/NEJMoa2502081 · 10.1056/NEJMoa2502082 |
| `ENDODIRECT-2082` | Obesidade | STEP UP (semaglutida 7,2 mg) | Lancet Diabetes Endocrinol 2025 | 10.1016/S2213-8587(25)00226-8 |
| `ENDODIRECT-2083` | Obesidade | OASIS 4 (semaglutida oral 25 mg) | NEJM 2025 | 10.1056/NEJMoa2500969 |
| `ENDODIRECT-2084` | Obesidade | Maridebart cafraglutide, fase 2 | NEJM 2025 | 10.1056/NEJMoa2504214 |
| `ENDODIRECT-2085` | Obesidade | ESSENCE, parte 1 (semaglutida na MASH) | NEJM 2025 | 10.1056/NEJMoa2413258 |
| `ENDODIRECT-2086` | Obesidade | ATTAIN-MAINTAIN (orforglipron após injetável) | Nat Med 2026 | 10.1038/s41591-026-04386-7 |
| `ENDODIRECT-2087` | Obesidade | SURMOUNT-MAINTAIN (dose de manutenção) | Lancet 2026 | 10.1016/S0140-6736(26)00656-2 |
| `ENDODIRECT-2088` | Obesidade | TRIUMPH-1 (retatrutida); TRIUMPH-2 no comentário | NEJM 2026 · Lancet 2026 | 10.1056/NEJMoa2604169 · 10.1016/S0140-6736(26)01861-1 |
| `ENDODIRECT-2089` | Obesidade | BARI-STEP (semaglutida após bariátrica) | Nat Med 2026 | 10.1038/s41591-026-04416-4 |
| `ENDODIRECT-2090` | Lípides | VESALIUS-CV; subgrupo com diabetes | NEJM 2026 · JAMA 2026 | 10.1056/NEJMoa2514428 · 10.1001/jama.2026.3277 |
| `ENDODIRECT-2091` | Lípides | PALISADE (plozasirana) | NEJM 2025 | 10.1056/NEJMoa2409368 |
| `ENDODIRECT-2092` | Lípides | CORE-TIMI 72a e CORE2-TIMI 72b (olezarsena) | NEJM 2026 | 10.1056/NEJMoa2512761 |
| `ENDODIRECT-2093` | Lípides | ALPACA (lepodisirana) | NEJM 2025 | 10.1056/NEJMoa2415818 |
| `ENDODIRECT-2094` | Lípides | BROADWAY (obicetrapibe) | NEJM 2025 | 10.1056/NEJMoa2415820 |
| `ENDODIRECT-2095` | Lípides | CORALreef Lipids (enlicitide) | NEJM 2026 | 10.1056/NEJMoa2511002 |
| `ENDODIRECT-2096` | Lípides | STAREE (atorvastatina ≥70 anos) | NEJM 2026 | 10.1056/NEJMoa2607314 |
| `ENDODIRECT-2097` | Lípides | AMUNDSEN (evolocumabe antes da ICP) | JAMA 2026 | 10.1001/jama.2026.17302 |
| `ENDODIRECT-2098` | Adrenal | BaxHTN; Bax24 no comentário | NEJM 2025 · Lancet 2026 | 10.1056/NEJMoa2507109 · 10.1016/S0140-6736(25)02549-8 |
| `ENDODIRECT-2099` | Adrenal | Launch-HTN (lorundrostate) | JAMA 2025 | 10.1001/jama.2025.9413 |
| `ENDODIRECT-2100` | Neuroendocrinologia | GRACE (relacorilante) | Lancet Diabetes Endocrinol 2026 | 10.1016/S2213-8587(25)00362-6 |
| `ENDODIRECT-2101` | Adrenal | LITESPARK-015 (belzutifano) | NEJM 2025 | 10.1056/NEJMoa2504964 |
| `ENDODIRECT-2102` | Tireoide | IoN; ESTIMABL2 5 anos no comentário | Lancet 2025 · Lancet Diabetes Endocrinol 2025 | 10.1016/S0140-6736(25)00629-4 · 10.1016/S2213-8587(24)00276-6 |
| `ENDODIRECT-2103` | Tireoide | THRIVE (veligrotugue) | Ophthalmology 2026 | 10.1016/j.ophtha.2026.04.022 |
| `ENDODIRECT-2104` | Tireoide | SatraGO-1 e SatraGO-2 (satralizumabe) | Ophthalmology 2026 | 10.1016/j.ophtha.2026.08.039 |
| `ENDODIRECT-2105` | Osteometabolismo | Zoledronato infrequente aos 50–60 anos | NEJM 2025 | 10.1056/NEJMoa2407031 |
| `ENDODIRECT-2106` | Osteometabolismo | LIDA (romosozumabe 3 × 12 meses) | Lancet Diabetes Endocrinol 2026 | 10.1016/S2213-8587(25)00319-5 |
| `ENDODIRECT-2107` | Osteometabolismo | PaTHway 52 semanas; 2 anos (renal) no comentário | JCEM 2025 · JBMR 2026 | 10.1210/clinem/dgae693 · 10.1093/jbmr/zjag085 |
| `ENDODIRECT-2108` | Neuroendocrinologia | PATHFNDR-2 (paltusotina) | JCEM 2026 | 10.1210/clinem/dgaf579 |
| `ENDODIRECT-2109` | Neuroendocrinologia | TRANSCEND (setmelanotida, obesidade hipotalâmica) | NEJM 2026 | 10.1056/NEJMoa2512275 |
| `ENDODIRECT-2110` | Endocrinologia Feminina | OASIS-4 (elinzanetante, terapia endócrina do câncer de mama) | NEJM 2025 | 10.1056/NEJMoa2415566 |
| `ENDODIRECT-2111` | Endocrinologia Feminina | Mio-inositol na gestação com SOP | JAMA 2025 | 10.1001/jama.2025.13668 |
| `ENDODIRECT-2112` | Endocrinologia Feminina | SUGAR-DIP (orais × insulina no DMG) | JAMA 2025 | 10.1001/jama.2024.23410 |
| `ENDODIRECT-2113` | Endocrinologia Feminina | CIRCUIT (alça fechada na gestação com DM1) | JAMA 2025 | 10.1001/jama.2025.19578 |
| `ENDODIRECT-2114` | Endocrinologia Masculina | Testosterona após prostatectomia (fase 2) | JAMA Intern Med 2026 | 10.1001/jamainternmed.2026.1343 |
| `ENDODIRECT-2115` | Endocrinologia Pediátrica | SURPASS-PEDS (tirzepatida no DM2 juvenil) | Lancet 2025 | 10.1016/S0140-6736(25)01774-X |
| `ENDODIRECT-2116` | Endocrinologia Pediátrica | PROPEL 3 (infigratinibe na acondroplasia) | NEJM 2026 | 10.1056/NEJMoa2604565 |
| `ENDODIRECT-2117` | Endocrinologia Pediátrica | TESTO (testosterona no lactente 47,XXY) | JCEM 2025 | 10.1210/clinem/dgaf217 |

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
