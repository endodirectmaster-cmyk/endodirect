// EndoTEEM 2026 · Diabetes tipo 2: tratamento (DAG0Z8KSb_k, 42 slides)
// -> capítulo "Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)" (sub Diabetes, privado)
const fs = require('fs');

const ANCORA = '## 📊 Escolha do 2º agente conforme comorbidade dominante';

const BLOCO = `## Antes de escolher o fármaco — estratificar

**Todo** paciente com DM2 é estratificado antes da escolha farmacológica: risco
cardiovascular + comorbidades (obesidade, doença cardiovascular / insuficiência
cardíaca, doença renal crônica). A comorbidade dominante — não a HbA1c — decide a
classe.

E as medidas não farmacológicas **não são etapa que se vence**: dieta saudável,
atividade física, redução do tempo sentado, higiene do sono, cessação do tabagismo,
controle do estresse e uso de CGM são recomendadas em **todas** as categorias de
risco, **durante todo** o tratamento (SBD 2025).

## Metformina

Inibe a cadeia respiratória mitocondrial → ↑AMP / ↓ATP → ativa a AMPK → inibe
gliconeogênese e lipogênese; ainda ↑GLP-1 e ↓sinalização do glucagon.

- **Dose máxima 2.550 mg/dia**; 1.000 mg/dia se TFG 30–44 mL/min; **contraindicada
  se TFG <30**.
- **Primeira linha** quando o risco cardiovascular é baixo/intermediário e **não há**
  comorbidade cardiorrenal: monoterapia se HbA1c <7,5%, terapia combinada se >7,5%.

| Prós | Contras |
|---|---|
| Alta potência (↓HbA1c 1–2 pontos) | Intolerância gastrointestinal |
| Neutra / discreta perda de peso | Acidose lática |
| Não induz hipoglicemia | Deficiência de B12 — dosar anualmente após 4 anos de uso |
| Fornecida pelo SUS | Ajuste pela TFG (contraindicada <30 mL/min) |

## Secretagogos — sulfonilureias e glinidas

Agonistas do SUR1: fecham o canal de K-ATP → despolarização → influxo de cálcio →
liberação dos grânulos de insulina. **Independe da glicemia** — daí a hipoglicemia.

- **Preferir 2ª geração**: gliclazida MR, glimepirida.
- **Evitar glibenclamida** — metabólitos ativos, alto risco de hipoglicemia.
- **Meglitinidas** (repaglinida, nateglinida): meia-vida curta → opção para o
  controle da **glicemia pós-prandial**.

| Prós | Contras |
|---|---|
| Alta potência (↓HbA1c 1–2 pontos) | Alto risco de hipoglicemia (principalmente glibenclamida) |
| Fornecidos pelo SUS | Ganho de peso |

## Pioglitazona

Agonista **PPAR-γ** (diferencia células-tronco mesenquimais em adipócitos
periféricos → ↑sensibilidade insulínica) e **PPAR-α** (↓TG, ↑HDL, benefício
cardiovascular).

| Prós | Contras |
|---|---|
| Alta potência (↓HbA1c 1–2 pontos) | Ganho de peso |
| Benefício hepático — opção na doença hepática gordurosa | Retenção hídrica / edema |
| Redução de eventos cardiovasculares em metanálises | Descompensação de insuficiência cardíaca |
| Melhora do perfil lipídico (↓TG, ↑HDL) | Fraturas e edema macular → **evitar em idosos** |

## Inibidores da DPP-4

A DPP-4 cliva o GLP-1 endógeno; inibi-la prolonga a meia-vida do GLP-1 do próprio
paciente — por isso o efeito é modesto e teto baixo.

| Prós | Contras |
|---|---|
| Neutro no peso | Não disponível no SUS |
| Não induz hipoglicemia isoladamente | Saxagliptina: ↑hospitalização por IC no SAVOR-TIMI |
| Uso em DRC — **evogliptina e linagliptina não precisam de ajuste** | Baixa potência (↓HbA1c <1%) |
| Escolha no idoso com DM2 e **IMC <22** | Pancreatite aguda, reações cutâneas, dor articular |

## Análogos do GLP-1

GLP-1: produzido nas **células L** intestinais. Estimula síntese e secreção de
insulina de forma **glicose-dependente**, induz saciedade (efeito no SNC +
gastroparético) e suprime o glucagon.

| Prós | Contras |
|---|---|
| Potência moderada/alta (até ↓2 pontos de HbA1c) | Náusea, vômito, constipação/diarreia, ↑FC ~3–5 bpm |
| Perda de peso significativa | Contraindicado se história pessoal/familiar de **carcinoma medular de tireoide** |
| Melhora do perfil lipídico (↓TG, ↑HDL) e ↓PA | Alto custo |
| ↓desfechos CV e renais; melhora sintomas na ICFEP; ↓inflamação e fibrose hepática na DHGM; melhora dor articular na osteoartrite | Controle glicêmico rápido pode **piorar retinopatia** — fazer fundoscopia antes |

> **No DM2 com sobrepeso/obesidade, cardiopatia ou DRC, o análogo de GLP-1 deve
> fazer parte do tratamento** — de preferência um com benefício CV/renal comprovado
> (ex.: semaglutida).

### NOIA-NA — a controvérsia da semaglutida

Neurite óptica isquêmica anterior não arterítica. Um estudo **observacional**
(Hathaway JT, 2024) apontou aumento de incidência com semaglutida.

- **Não é possível afirmar causalidade**; ensaios clínicos randomizados **não**
  mostraram aumento de risco.
- **Orientação SBD**: suspender a semaglutida se ocorrer NOIA-NA **ou perda visual
  súbita**.
- Manter o rastreio de retinopatia com fundoscopia anual em todo diabético.

## Tirzepatida — agonista duplo GIP/GLP-1

**GIP** (peptídeo insulinotrópico dependente de glicose): produzido pelas **células
K** do intestino delgado em resposta à chegada de **gordura e proteína**;
responde por **50–70%** da insulina secretada no pós-prandial e potencializa a ação
do GLP-1. Vem de um **gene próprio** (pré-pró-GIP) — **não** do proglucagon, como
o GLP-1. E ao contrário do GLP-1, **estimula** o glucagon na normo/hipoglicemia e
o **inibe** na hiperglicemia.

| Prós | Contras |
|---|---|
| Alta potência (>2 pontos de ↓HbA1c) | Intolerância gastrointestinal |
| Perda de peso média >20% | Contraindicada se história pessoal/familiar de carcinoma medular de tireoide |
| Não induz hipoglicemia isoladamente | Alto custo |
| Aprovada para obesidade **+ SAOS** (SURMOUNT-OSA) | Mais reações cutâneas que os AGLP-1 |

## 📊 Agonistas de GLP-1 e GIP/GLP-1 — dose e escalonamento

| Medicação | Dose inicial | Escalonamento | Dose máxima | Benefício CV | Benefício renal |
|---|---|---|---|---|---|
| Liraglutida | 0,6 mg SC/dia | ↑0,6 mg a cada 7 dias | 1,8 mg/dia (DM2) · 3,0 mg/dia (obesidade) | SIM (LEADER) | — |
| Semaglutida SC | 0,25 mg SC/semana | 0,25 → 0,5 → 1,0 → 1,7 → 2,4 a cada 4 semanas | 1,0 mg/sem (DM2) · 2,4 mg/sem (obesidade) | SIM (SELECT, SUSTAIN-6) | SIM (FLOW) |
| Semaglutida VO | 3 mg/dia, 30 min antes do desjejum | 3 → 7 → 14 a cada 4 semanas | 14 mg/dia (DM2) · 25–50 mg (OASIS, obesidade) | SIM (SOUL) | — |
| Dulaglutida | 1,5 mg SC/semana | 0,75 → 1,5 a cada 4 semanas | 1,5 mg/sem (só DM2) | SIM (REWIND) | — |
| Tirzepatida | 2,5 mg SC/semana | ↑2,5 mg a cada 4 semanas | 15 mg/sem (DM2 e obesidade) | SIM (SURPASS-CVOT) | — |

## Inibidores do SGLT-2

Inibem o cotransporte sódio-glicose no **túbulo contorcido proximal, segmento S1**
(90% da reabsorção total de glicose). O benefício renal vem do **feedback
túbulo-glomerular**: ↑sódio filtrado ativa a mácula densa → **vasoconstrição da
arteríola aferente** (lembrar: o IECA vasodilata a **eferente**).

| Prós | Contras |
|---|---|
| ↓eventos CV e morte CV no DM2 com DCV e ICFER | Infecção urogenital |
| Benefício renal (↓progressão da DRC) | **Cetoacidose euglicêmica** |
| ↓hospitalização por IC (ICFER **e** ICFEP) | Queda transitória da TFG (até ↓30%) |
| ↓discreta de peso (2–3 kg) e da PA | Baixa potência (↓HbA1c <1,0%) |
| Dapagliflozina no SUS (farmácia de alto custo) | Suspender antes de cirurgia e em dias de doença |

> **No DM2 com cardiopatia ou doença renal crônica, o iSGLT-2 deve fazer parte do
> tratamento** — de preferência empagliflozina, dapagliflozina ou canagliflozina.

## 📊 iSGLT-2 — dose, TFG de início e indicação

| Medicação | Dose alvo | TFG permitida para **início**\\* | Recomendação de uso (SBD) | Benefício CV/renal |
|---|---|---|---|---|
| Dapagliflozina (Forxiga/Edistride) | 10 mg VO pela manhã | a partir de 25 mL/min | RAC >30 mg/g **OU** TFG 30–60 mL/min independente da RAC | SIM (DAPA-CKD, DECLARE-TIMI, DELIVER) |
| Empagliflozina (Jardiance) | 25 mg VO pela manhã | a partir de 20 mL/min | idem | SIM (EMPA-REG, EMPEROR, EMPA-KIDNEY) |
| Canagliflozina (Invokana) | 300 mg VO pela manhã | a partir de 45 mL/min | idem | SIM (CREDENCE, CANVAS) |

\\***Uma vez iniciado**, só se suspende se o paciente entrar em diálise — ou
temporariamente antes de cirurgia (3 dias) e em dias de doença. A queda de TFG
dos primeiros meses é **esperada** e não motiva suspensão nem redução de dose.

## 📊 Estudos que sustentam a escolha — agonistas de GLP-1

| Medicação | Estudo | População | Desfecho com significância |
|---|---|---|---|
| Liraglutida | LEADER | DM2 + alto risco CV | ↓mortalidade geral, morte CV e MACE |
| Semaglutida SC | SUSTAIN-6 | DM2 + alto risco CV | ↓MACE |
| Semaglutida SC | SELECT | Obesos **não** DM + alto risco CV | ↓MACE |
| Semaglutida SC | STEP-HFpEF | Obesos não DM + ICFEP | ↑qualidade de vida e ↑distância no teste de 6 min — **não** mortalidade |
| Semaglutida SC | FLOW | DM2 + DRC | ↓desfechos renais (MAKE), morte CV e morte geral |
| Semaglutida SC | STRIDE | DM2 + DAOP sintomática | ↑distância máxima percorrida |
| Semaglutida SC | ESSENCE | MASH com fibrose 2 ou 3 | ↓esteato-hepatite e fibrose com 2,4 mg/sem |
| Semaglutida VO | SOUL | DM2 + alto risco CV | ↓MACE |
| Dulaglutida | REWIND | DM2 + alto risco CV | ↓MACE |
| Albiglutida | HARMONY | DM2 + alto risco CV | ↓MACE |
| Tirzepatida | SUMMIT | Obesos + ICFEP | ↓composto morte CV + piora de IC; ↑qualidade de vida |

## 📊 Estudos que sustentam a escolha — iSGLT-2

| Medicação | Estudo | População | Desfecho com significância |
|---|---|---|---|
| Dapagliflozina | DECLARE-TIMI | DM2 + alto risco CV | ↓hospitalização por IC |
| Dapagliflozina | DELIVER | IC com FEVE >40% | ↓piora de IC |
| Dapagliflozina | DAPA-HF | IC com FEVE <40% | ↓piora de IC, morte CV, morte geral |
| Dapagliflozina | DAPA-MI | IAM recente | ↑desfechos cardiometabólicos combinados |
| Dapagliflozina | DAPA-CKD | DRC TFG 25–75 + albuminúria 200–5.000 mg/g | ↓desfecho renal combinado (↓TFG >50%, DRC terminal, morte renal ou cardíaca) |
| Empagliflozina | EMPA-REG OUTCOME | DM2 + alto risco CV | ↓hospitalização por IC, morte CV, morte geral |
| Empagliflozina | EMPEROR-Reduced | IC com FEVE <40% | ↓MACE, ↓hospitalização por IC |
| Empagliflozina | EMPEROR-Preserved | IC com FEVE >40% | ↓hospitalização por IC |
| Empagliflozina | EMPA-KIDNEY | DRC TFG 20–45, ou 45–90 com albuminúria >200 mg/g | ↓progressão de DRC ou morte CV |
| Canagliflozina | CREDENCE | DM2 + DRC TFG 30–90 + albuminúria 300–5.000 mg/g | ↓desfechos renais, ↓MACE, ↓hospitalização por IC |

## Insulinoterapia no DM2 — quando iniciar

- Paciente **francamente sintomático** (catabolismo, poliúria, polidipsia).
- **Emergência hiperglicêmica** ou hiperglicemia grave.
- HbA1c **>9–10%** em assintomático — pode ser considerada se fora da meta já em
  terapia quádrupla.
- Suspeita de **sobreposição com diabetes autoimune**.
- Diabetes de longa data com evolução para **peptídeo C baixo (<0,6 ng/mL)**.
- Terapia de escolha no manejo da **hiperglicemia hospitalar**.

**Antes da insulina isolada**, avaliar o **coformulado insulina + análogo de GLP-1**
(ex.: liraglutida + degludeca) — reduz a dose total de insulina necessária e o
ganho de peso associado.

⚠️ **Ao insulinizar plenamente, suspender secretagogo e iDPP-4.** Podem seguir
combinados à insulina: AGLP-1, metformina, iSGLT-2 e pioglitazona (nesta, cuidado
com anasarca e edema macular).

**Como iniciar e titular**

- **Basal**: 0,1–0,2 UI/kg/dia (análogo de longa duração 1×/dia, ou NPH inicialmente
  ao deitar e depois 2–3×/dia). Meta de jejum 80–130 mg/dL. Ajuste de ±15–20% a cada
  3 dias até a meta de jejum.
- **Jejum na meta mas HbA1c acima / pós-prandiais altas** → iniciar **bolus na
  principal refeição**: 0,05–0,1 UI/kg/refeição ou 4 UI. Meta pós-prandial
  <180 mg/dL. Progredir para basal-bolus se necessário.
- **Esquema fixo do fluxograma da aula** — início: 10 UI SC/dia se em uso apenas de
  antidiabético oral; **16 UI** SC/dia se já em uso de AGLP-1 ou insulina basal
  (suspendendo o AGLP-1). Para o **prandial**: 10 UI antes da refeição se só
  antidiabético oral ou insulina <20 UI/dia; 20 UI se em uso de 20–30 UI; 30 UI se
  em uso de >30 UI. Titulação de ambos: **a cada 3 dias, +2 UI se glicemia de jejum
  >130 ou −2 UI se <80**.

## Cuidados no idoso com DM2

- Alto risco de hipoglicemia — é o eixo de toda a escolha.
- **Evitar redutores de peso se IMC <22** (AGLP-1, iSGLT-2, metformina).
- Evitar sulfonilureia de alto risco (glibenclamida); preferir **gliclazida MR**.
- **IMC <22 + HbA1c <10%** → considerar **iDPP-4 em monoterapia** (baixo risco de
  hipoglicemia, neutro no peso) ou insulina basal em dose baixa.
- Grande variabilidade glicêmica ou hipoglicemias → **análogos** no lugar de
  NPH/regular.

## ⚠️ Pegadinhas de prova

- **Queda de TFG após iniciar iSGLT-2 é esperada** — mantém-se a dose. Não suspende,
  não reduz, não troca (TEEM 2024, questão 42).
- **GIP vem de gene próprio**, não do proglucagon; responde por **50–70%** da
  insulina pós-prandial; é secretado pelas células K em resposta a **gordura e
  proteína**; e **estimula** o glucagon na normo/hipoglicemia (TEEM 2024, q. 41).
- **STEP-HFpEF** melhorou qualidade de vida e capacidade funcional — **não**
  internação nem mortalidade. **STRIDE** aumentou distância percorrida — **não**
  reduziu amputação/revascularização. **ESSENCE** não exigia DM como critério de
  inclusão. **SOUL** é o que reduziu MACE como desfecho primário (TEEM 2025, q. 43).
- **PCDT do DM2 (2024) — elegibilidade para dapagliflozina**: alto risco de DCV com
  **mulher >60 anos** ou **homem >55 anos**, na segunda intensificação de tratamento
  (TEEM 2025, q. 47).

${ANCORA}`;

const PTS = [
  'Estratificação de risco CV + comorbidades vem ANTES da escolha do fármaco; a comorbidade dominante decide a classe, não a HbA1c',
  'Medidas não farmacológicas são recomendadas em todas as categorias de risco durante todo o tratamento — não são etapa que se vence',
  'Metformina: dose máxima 2.550 mg; 1.000 mg se TFG 30–44; contraindicada se TFG <30',
  'Metformina é 1ª linha se risco CV baixo/intermediário e sem comorbidade cardiorrenal — monoterapia se HbA1c <7,5%, combinada se >7,5%',
  'Dosar B12 anualmente após 4 anos de metformina',
  'Preferir gliclazida MR ou glimepirida; evitar glibenclamida (metabólitos ativos, alto risco de hipoglicemia)',
  'Glinidas (repaglinida/nateglinida) têm meia-vida curta — opção para glicemia pós-prandial',
  'Pioglitazona: benefício hepático e lipídico, mas ganho de peso, edema, descompensação de IC, fraturas e edema macular — evitar em idosos',
  'iDPP-4: evogliptina e linagliptina não precisam de ajuste na DRC; saxagliptina aumentou hospitalização por IC no SAVOR-TIMI',
  'iDPP-4 em monoterapia é a escolha no idoso com IMC <22 e HbA1c <10%',
  'DM2 com sobrepeso/obesidade, cardiopatia ou DRC: AGLP-1 deve fazer parte do tratamento (preferir com benefício CV/renal comprovado)',
  'AGLP-1: fundoscopia antes de iniciar — controle glicêmico rápido pode piorar retinopatia',
  'NOIA-NA e semaglutida: só sinal observacional, ECRs não confirmaram; SBD manda suspender se NOIA-NA ou perda visual súbita',
  'GIP vem de gene próprio (não do proglucagon), é secretado pelas células K em resposta a gordura/proteína e responde por 50–70% da insulina pós-prandial',
  'GIP estimula o glucagon na normo/hipoglicemia e o inibe na hiperglicemia — ao contrário do GLP-1',
  'Tirzepatida: perda de peso média >20% e aprovação para obesidade + SAOS (SURMOUNT-OSA)',
  'iSGLT-2 age no TCP segmento S1; o benefício renal vem do feedback túbulo-glomerular com vasoconstrição da AFERENTE (IECA dilata a eferente)',
  'DM2 com cardiopatia ou DRC: iSGLT-2 deve fazer parte do tratamento (empa, dapa ou cana)',
  'TFG mínima para INÍCIO: dapagliflozina 25, empagliflozina 20, canagliflozina 45 mL/min — uma vez iniciado, só suspende na diálise',
  'Queda transitória de até 30% na TFG após iniciar iSGLT-2 é esperada — mantém-se a dose',
  'iSGLT-2: suspender 3 dias antes de cirurgia e em dias de doença (risco de cetoacidose euglicêmica)',
  'Insulina no DM2: sintomático, emergência hiperglicêmica, HbA1c >9–10%, suspeita de autoimune, peptídeo C <0,6 ng/mL ou internação',
  'Ao insulinizar plenamente, suspender secretagogo e iDPP-4; podem ficar AGLP-1, metformina, iSGLT-2 e pioglitazona',
  'Coformulado insulina+AGLP-1 (liraglutida+degludeca) reduz dose total de insulina e ganho de peso',
  'Basal 0,1–0,2 UI/kg/dia com meta de jejum 80–130; bolus na principal refeição 0,05–0,1 UI/kg ou 4 UI, meta pós-prandial <180',
  'Titulação do fluxograma: a cada 3 dias, +2 UI se jejum >130 ou −2 UI se <80',
  'Idoso: evitar redutores de peso se IMC <22; preferir análogos de insulina à NPH/regular quando há variabilidade',
  'PCDT 2024 — dapagliflozina: mulher >60 anos ou homem >55 anos com alto risco de DCV, na 2ª intensificação',
];

const NOVOS = [
  'Inibe a cadeia respiratória mitocondrial', 'Dose máxima 2.550 mg/dia',
  'Agonistas do SUR1', 'gliclazida MR, glimepirida', 'Evitar glibenclamida',
  'Agonista **PPAR-γ**', 'edema macular → **evitar em idosos**',
  'evogliptina e linagliptina não precisam de ajuste', 'SAVOR-TIMI',
  'células L** intestinais', 'carcinoma medular de tireoide',
  'NOIA-NA', 'Hathaway JT, 2024', 'perda visual',
  'células\nK** do intestino delgado', '50–70%', 'pré-pró-GIP', 'SURMOUNT-OSA',
  'Liraglutida | 0,6 mg SC/dia', 'Semaglutida VO | 3 mg/dia', 'Dulaglutida | 1,5 mg SC/semana',
  'Tirzepatida | 2,5 mg SC/semana', 'SURPASS-CVOT',
  'segmento S1', 'feedback\ntúbulo-glomerular', 'arteríola aferente',
  'Dapagliflozina (Forxiga/Edistride)', 'a partir de 25 mL/min', 'a partir de 20 mL/min',
  'a partir de 45 mL/min', 'só se suspende se o paciente entrar em diálise',
  'STEP-HFpEF', 'STRIDE', 'ESSENCE', 'HARMONY', 'SUMMIT', 'DAPA-MI', 'EMPA-KIDNEY',
  'peptídeo C baixo (<0,6 ng/mL)', 'liraglutida + degludeca',
  'suspender secretagogo e iDPP-4', '0,1–0,2 UI/kg/dia', '0,05–0,1 UI/kg/refeição',
  '+2 UI se glicemia de jejum', 'IMC <22', 'gliclazida MR**',
  'Pegadinhas de prova', 'TEEM 2024, questão 42', 'TEEM 2025, q. 47',
  'mulher >60 anos', 'homem >55 anos',
];

const PRESERVADOS = [
  '## Princípio central (abordagem centrada na pessoa)',
  '## Proteção cardiorrenal (independe da HbA1c e da metformina)',
  '## Intensificação glicêmica',
  '## Classes disponíveis (resumo prático)',
  '## Metas e seguimento',
  ANCORA,
];

// --- verificações ---
let erros = [];
for (const n of NOVOS) if (!BLOCO.includes(n)) erros.push('NOVO ausente: ' + JSON.stringify(n));
if (!BLOCO.endsWith(ANCORA)) erros.push('BLOCO não termina na âncora');
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }

const q = (tag, s) => '$' + tag + '$' + s + '$' + tag + '$';
const sql = `-- EndoTEEM 2026 · Diabetes tipo 2: tratamento -> Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case
      when d->>'sub' <> 'Diabetes' or coalesce(d->>'privado','') <> 'true' then d
      when d->>'tema' = 'Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)' then
        jsonb_set(
          jsonb_set(d, '{resumo}', to_jsonb(replace(d->>'resumo', ${q('anc', ANCORA)}, ${q('blk', BLOCO)}))),
          '{pts}', (d->'pts') || ${q('pts', JSON.stringify(PTS))}::jsonb
        ) || ${q('fon', JSON.stringify({ fonte: 'Síntese Endodirect · EndoTEEM 2026 (Diabetes tipo 2: tratamento) + SBD 2025 / ADA 2026' }))}::jsonb
      else d
    end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';
`;
fs.writeFileSync(__dirname + '/dm2-tratamento.sql', sql);
console.log('OK · bloco %d chars · %d pts · %d guards novos · %d preservados',
  BLOCO.length, PTS.length, NOVOS.length, PRESERVADOS.length);
console.log(JSON.stringify({ preservados: PRESERVADOS }));
