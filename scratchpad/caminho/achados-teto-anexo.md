# Teste de caminho — o que a rede NÃO cobre: o teto do ANEXO (2026-08-14)

Medido enquanto o auditor do checkpoint rodava. Nada foi alterado ainda.

## O que já está coberto (boa notícia)

- **59/59 blocos da base profunda são alcançáveis** por alguma das 349 perguntas
  do `test-caminho-clinico.js`. Nenhum bloco órfão — a leva da noite entrou ligada.
- 8 blocos nunca aparecem **em primeiro**, mas todos os 8 sobem para primeiro
  quando a pergunta nomeia o assunto deles (Cushing, MODY, acromegalia, DIC,
  dumping, hipofosfatasia, tireoide na gestação, hipertireoidismo). Testado.
- As 46 asserções de CHEGADA e ORDEM **continuam valendo a 120k**.

## O buraco: as três asserções sondam a 400k, e produção com anexo usa 120k

`api/ai.js:311` → `temAnexo ? TETO_COM_ANEXO : TETO_PROFUNDO`, e
`TETO_COM_ANEXO = 120000`. O teste chama `deepFor(area, TETO_PROFUNDO, …)` nas
três (linhas 776, 899, 1024). A 400k **toda área cabe inteira** (a maior,
Tireoide, tem 365k) — então ordem e truncamento não podem falhar ali.

⚠️ **Mas duplicar a asserção nos dois tetos seria enfeite, não rede.** Medido:
a marca sobrevive até a 15k, porque o 1º bloco sempre sai inteiro. O que se perde
com anexo é o **2º/3º bloco** — as outras facetas da mesma pergunta.

## Defeito real medido (1 pergunta)

`"nivolumabe: quais toxicidades endocrinas rastrear e com que exames?"`

| | 400k | 120k |
|---|---|---|
| hipofisite | ✓ | **✗** |
| insuficiência adrenal | ✓ | **✗** |
| **crise adrenal** | ✓ | **✗** |
| ACTH / cortisol | ✓ | **✗** |
| cetoacidose | ✓ | **✗** |

A pergunta roteia para **Tireoide** (`nivolumabe` → Tireoide, decisão explícita
em `lib/clinical-deep.js:552`). Com anexo, os 4 blocos que chegam são:
**#0 tireoide na gestação (62k)**, #3 tireoide na gestação (3k), #5
hipertireoidismo (13k), #7 eutireoidiano doente (20k). O eixo que mata —
insuficiência adrenal — **sai inteiro**.

É o mesmo defeito de "atravessa quatro eixos e só alcança o da tireoide"
(commit 2363a47), ressurgindo na condição que nenhum teste sonda.

## Segundo achado: três frases naturais não roteiam para NENHUMA área

- `imunoterapia oncologica: rastreio endocrino antes de cada ciclo`
- `toxicidade endocrina da imunoterapia: quais eixos?`
- `efeito adverso endocrino de anti-PD1`

O bloco dedicado (Endocrinopatias#5, 39k, "ENDOCRINOPATIA INDUZIDA POR INIBIDOR
DE CHECKPOINT") existe e é bom — mas essas frases não chegam nele.

### Por que NÃO consertei sozinha

Contagem por área (ocorrências no corpo dos blocos):

| termo | distribuição |
|---|---|
| `imunoterapia` | Tireoide 5 · Diabetes 4 · Endocrinopatias 3 · Neuro 1 |
| `anti-pd` | **Endocrinopatias 20** · Tireoide 9 · Diabetes 1 |
| `ici` | ⚠️ Obesidade 452 · Adrenal 373 … — casa dentro de "medicina", "início" |

- **`imunoterapia` é ambígua** (5×4×3). Mapear para Endocrinopatias seria inventar
  preferência que o corpus não sustenta — o mesmo motivo pelo qual o arquivo
  recusou forçar `estatina` (linha ~545).
- **`ici` é veneno**: vaza por dentro de outra palavra, como `correr`/`caminhar`.
- **`anti-pd` (20×9×1) é o único candidato limpo**, e hoje não rouba de ninguém
  porque não roteia para lugar nenhum. É a mudança defensável.

## Decisão que é do professor

1. Ligar `anti-pd` → Endocrinopatias (baixo risco, ganho estrito).
2. O que fazer com `nivolumabe`/`pembrolizumabe` → Tireoide: manter (a tireoide é
   a toxicidade mais comum) ou mover para Endocrinopatias (onde está o bloco que
   cobre os quatro eixos)? **Mexer aqui é reponderação, não conserto** — e a
   pergunta "com que exames rastreio" é a que mais perde.
