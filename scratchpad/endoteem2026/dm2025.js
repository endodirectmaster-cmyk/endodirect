// EndoTEEM 2026 · aula de revisão "Diabetes 2025" (DAGnvl0qft4, 186 slides)
// Complementos ao que já foi aplicado pelas aulas individuais de 2026.
const fs = require('fs');

const A1 = '## 📊 Pontos de corte diagnósticos';
const A2 = '## 📊 Escolha do 2º agente conforme comorbidade dominante';
const A3 = '## 📊 Perfil das insulinas';
const A4 = '## 📊 Rastreamento das complicações';
const A5 = '## 📊 Metas glicêmicas na gestação';

const B1 = `### MODY — diabetes monogênico

*Maturity Onset Diabetes of the Young*: mutações em genes da regulação da **síntese
de insulina**, com herança **autossômica dominante**.

**Quando suspeitar** — IMC normal · história familiar forte (**3 ou mais gerações
sequenciais**, sem pular gerações) · início **antes dos 25 anos** · **autoanticorpos
pancreáticos negativos**.

⚠️ **A ausência de história familiar não exclui** — pode ser mutação *de novo*, ou
MODY2 (assintomático e sem complicações, passa despercebido nas gerações anteriores).

| | MODY1 | MODY2 | MODY3 | MODY4 | MODY5 |
|---|---|---|---|---|---|
| **Gene** | HNF-4α | **GCK** | HNF-1α | IPF-1 | HNF-1β |
| **Complicações crônicas** | Sim | **Não** | Sim | Sim | Sim |
| **Prevalência** | <10% | 15–31% (**o mais comum segundo a SBD**) | 52–65% | Raro | — |
| **Tratamento** | **Sulfonilureia** | **Dieta** | **Sulfonilureia** | Insulina | Insulina |

- **Formas mais comuns**: MODY3 e MODY2.
- **MODY2 (GCK)** é a única **sem complicações crônicas** — a mutação apenas desloca
  o *setpoint* de secreção de insulina (limiar de glicose mais alto).
- **MODY5 (HNF-1β)** associa-se a **malformações geniturinárias e cistos renais**.
- **MODY1 e MODY3 respondem a sulfonilureia** — é a resposta que a prova cobra.

### 📊 Rastreamento do DM2 — as três diretrizes não coincidem

| Diretriz | Quem rastrear | Periodicidade |
|---|---|---|
| **SBD** | A partir dos **35 anos**; ou **<35 anos com sobrepeso/obesidade + ≥1 fator de risco** (hipertensão, HDL <35 ou TG >250, DMG prévio, bebê GIG, história familiar, acantose nigricans, SOP, doença cardiovascular, sedentarismo, **FINDRISC alto/muito alto**) | **Anual** se ≥3 fatores de risco ou FINDRISC alto/muito alto; **a cada 3 anos** se <3 fatores ou FINDRISC baixo/moderado |
| **ADA** | A partir dos **35 anos** | A cada **3 anos** |
| **USPSTF** | Adultos de **35 a 70 anos com sobrepeso ou obesidade** | — |

### Detalhes que caem nas causas secundárias

- **Diabetes pós-transplante (DMPT)**: o diagnóstico **exclui** a hiperglicemia
  transitória do pós-transplante — exige imunossupressão em **dose estável de
  manutenção**, **sem infecção ativa** e com **enxerto funcionante**. ⚠️ **Não usar
  HbA1c nos primeiros 3 meses.** Meta de HbA1c **igual à do não transplantado: <7%**.
- **Pancreatopatia crônica (tipo 3c)**: destrói células beta **e alfa** — daí a
  **maior variabilidade glicêmica e a tendência à hipoglicemia**.
- **Fibrose cística**: insuficiência exócrina em **2/3**, mas **1/4 desenvolve
  insuficiência endócrina até os 20 anos** — rastreio **anual com TOTG a partir dos
  10 anos**.
- **Lipodistrofia**: **90%** têm prega de coxa **<22 mm (mulheres)** e **<10 mm
  (homens)**. Na dúvida das formas parciais, **densitometria de corpo inteiro**:
  **%gordura de tronco / %gordura de MMII >1,5** sugere o diagnóstico.
- **Glucagonoma**: diarreia, perda de peso, transtornos psiquiátricos, diabetes de
  início recente e **eritema migratório necrolítico**.
- **DM mitocondrial**: **surdez neurossensorial**, oftalmoplegia, miopatia, herança
  **materna**.

${A1}`;

const B2 = `### Detalhes de classe que a revisão de 2025 acrescenta

**Pioglitazona**

- Além do PPAR-γ, ativa **PPAR-α**: ↓TG, ↑HDL e benefício vascular — **reduz o
  espessamento médio-intimal carotídeo** e reduziu **AVC/IAM no estudo IRIS**.
- **Adjuvante na doença hepática gordurosa** — em diabéticos **e não diabéticos**.
- ⚠️ **Contraindicada na insuficiência cardíaca classe III–IV e na insuficiência
  hepática.** O risco de **edema macular** é maior **em associação com insulina**.

**Secretagogos** — **gliclazida e glipizida não têm metabólitos ativos**, e por isso
são as mais seguras na doença renal crônica.

**Análogos de GLP-1**

- Também reduzem **apneia do sono** (liraglutida e semaglutida).
- ⚠️ Contraindicados na história de carcinoma medular **ou NEM2**, e com **TFG <15
  mL/min**.

**iSGLT-2**

- Também **aumentam a secreção de glucagon** — possível mecanismo da cetose — e
  elevam **HDL e LDL**.
- ⚠️ **Evitar no diabético descompensado (HbA1c >10%)**: risco de cetoacidose.
- **Hipotensão**: se o paciente já usa anti-hipertensivo ou diurético e a PA está
  controlada, **reduzir a dose desses** ao iniciar.
- **Amputação de membros inferiores**: sinal atribuído à **canagliflozina**.
- **Suspender** em infecção ativa, doença aguda grave e **3–4 dias antes de cirurgia**.
- **Quando considerar iniciar**: insuficiência cardíaca (qualquer FE), doença
  cardiovascular ou alto risco CV, e doença renal crônica.

**Estudo DEFENDER** (publicação **brasileira**): segurança da introdução de
**dapagliflozina em pacientes de UTI**. **Não** reduziu desfechos intra-hospitalares
(mortalidade, evolução para terapia renal substitutiva, tempo de internação) e
**não** aumentou a evolução para TRS. ⚠️ Limitações: **aberto e sem placebo**.

${A2}`;

const B3 = `### O programa ONWARDS em detalhe

- **ONWARDS-1**: icodeca foi **superior** à glargina-100 no controle glicêmico em
  DM2 **virgem de insulina** — mas com **aumento do total de hipoglicemias graves ou
  clinicamente significativas**.
- **ONWARDS-3**: icodeca foi **superior** à degludeca na redução de HbA1c, às custas
  de **mais hipoglicemias nível 2/3**.
- **ONWARDS-6**: icodeca foi **não inferior** à degludeca em regime basal-bolus no
  **DM1**, também com **mais hipoglicemia**.

### Reúso de agulha — a posição da SBD

O reúso **não é recomendado** (lipodistrofia). ⚠️ Mas a SBD considera **aceitável o
reúso de uma agulha e uma seringa por dia, por tipo de insulina** — por exemplo,
reaproveitar a agulha da NPH nas três aplicações do mesmo dia.

⚠️ **Divergência entre as aulas sobre misturar degludeca**: a aula de DM1 (2026) diz
**nunca misturar análogo de longa duração com rápida/ultrarrápida**; a revisão de
2025 abre exceção — **"degludeca pode ser misturada com insulinas rápidas"**. Na
dúvida de prova, siga a regra geral (não misturar) e lembre-se de que a degludeca é
a exceção citada.

${A3}`;

const B4 = `### Complementos da revisão 2025

**Neuropatia**

- É um **diagnóstico de exclusão**: afastar **etilismo, deficiência de B12,
  disfunção tireoidiana, fármacos e doenças virais crônicas** antes de atribuir ao
  diabetes.
- A **microscopia corneana confocal PODE ser considerada** ferramenta diagnóstica —
  mas **não é rastreio**.
- **Retinopatia diabética proliferativa é preditora de DAOP e de amputação** — a
  correlação entre micro e macrovascular cai em prova.
- **Hipotensão ortostática**: além de midodrina e fludrocortisona, **droxidopa**; e
  medida postural básica — **levantar devagar**.
- **Gastroparesia**: procinéticos nomeados — **domperidona, bromoprida,
  metoclopramida** — e **eritromicina**.
- **Evitar variação abrupta da glicemia**: a revisão de 2025 fala em **reduzir no
  máximo 3 pontos de HbA1c em 3 meses** para não desencadear neuropatia induzida
  pelo tratamento (a aula de 2026 usa **>2 pontos** como limiar — os dois números
  circulam).

**Pé diabético — o intervalo do exame segue o risco**

Risco 0 → **12 meses** · risco 1 → **6–12 meses** · risco 2 → **3–6 meses** ·
risco 3 → **1–3 meses**. **Monitorar a temperatura dos pés** a partir do **risco
2/3**; **palmilhas adaptadas e calçado terapêutico** a partir do **risco 3**.

**Doença renal**

- **IECA/BRA reduzem albuminúria e retardam a progressão da DRD independentemente do
  efeito pressórico.** ⚠️ **Podem elevar a creatinina em até 30% no início — não
  suspender por isso.**
- **Estatina na DRD**: recomendada se **diabetes + TFG <60**; e, em terapia renal
  substitutiva, **se LDL >145 e/ou doença cardiovascular**. **Não iniciar em
  dialítico sem doença cardiovascular clínica.**

${A4}`;

const B5 = `### Complementos da revisão 2025

- **Quando iniciar fármaco**: duas ou mais medidas de glicemia capilar alteradas em
  7–14 dias, após dieta e atividade física. ⚠️ **Pode-se também considerar iniciar se
  a circunferência abdominal fetal estiver >p75 entre 29 e 33 semanas** — mesmo com
  glicemias no alvo.
- **Metformina** é **alternativa** à insulina quando esta é inviável, **ou adjuvante**
  em gestante com **doses altas de insulina (>2 UI/kg/dia)**, ganho de peso materno
  ou fetal elevado. ⚠️ **Evitar se o feto está <p50 ou com restrição de crescimento
  intrauterino.** Há maior chance de a criança ter peso, circunferência braquial e
  abdominal elevados no seguimento.
- ⚠️ **Glibenclamida não é recomendada** — hipoglicemia neonatal e macrossomia. Na
  gestante com DM2, **suspender os antidiabéticos orais e trocar por insulina** assim
  que possível.
- **Bomba de insulina pode ser usada na gestação** — mas **não é superior** ao
  esquema de múltiplas doses.
- **HbA1c não é exame de rotina na gestação**, mas serve para detectar *overt
  diabetes* ou identificar risco de DMG (**HbA1c 5,7–6,5%**).

${A5}`;

const P1 = [
  'MODY: IMC normal, 3+ gerações acometidas, início <25 anos e autoanticorpos negativos — ausência de história familiar NÃO exclui',
  'MODY2 (GCK) é a única sem complicações crônicas e trata-se com dieta; MODY1 e MODY3 respondem a sulfonilureia',
  'MODY5 (HNF-1β) cursa com malformações geniturinárias e cistos renais',
  'MODY3 é o de maior prevalência entre os diagnosticados (52–65%); MODY2 é o mais comum segundo a SBD',
  'Rastreio do DM2: SBD a partir dos 35 anos (ou antes com sobrepeso + 1 fator); ADA aos 35 a cada 3 anos; USPSTF 35–70 anos com sobrepeso',
  'DMPT: não usar HbA1c nos 3 primeiros meses pós-transplante; meta <7%, igual à do não transplantado',
  'Pancreatopatia crônica destrói células alfa também — maior variabilidade e tendência a hipoglicemia',
  'Fibrose cística: rastreio anual com TOTG a partir dos 10 anos',
  'Lipodistrofia: prega de coxa <22 mm (mulher) / <10 mm (homem); DXA com %gordura tronco/MMII >1,5',
];
const P2 = [
  'Pioglitazona reduziu AVC/IAM no IRIS e o espessamento médio-intimal carotídeo; contraindicada na IC III-IV e na insuficiência hepática',
  'iSGLT-2 aumentam a secreção de glucagon (mecanismo da cetose) e elevam HDL e LDL',
  'Evitar iSGLT-2 no descompensado com HbA1c >10% pelo risco de cetoacidose',
  'Ao iniciar iSGLT-2 com PA controlada em uso de diurético/anti-hipertensivo, reduzir a dose destes',
  'AGLP-1 são contraindicados também na NEM2 e com TFG <15; reduzem apneia do sono',
  'DEFENDER (brasileiro): dapagliflozina em UTI foi segura, mas não reduziu desfechos intra-hospitalares — estudo aberto, sem placebo',
];
const P3 = [
  'ONWARDS-1: icodeca superior à glargina-100 em DM2 virgem de insulina, com mais hipoglicemia significativa',
  'ONWARDS-3: icodeca superior à degludeca na HbA1c, com mais hipoglicemia nível 2/3; ONWARDS-6: não inferior no DM1, com mais hipoglicemia',
  'SBD aceita reúso de uma agulha e uma seringa por dia, por tipo de insulina, embora o reúso não seja recomendado',
];
const P4 = [
  'Neuropatia diabética é diagnóstico de EXCLUSÃO: afastar etilismo, B12, tireoide, fármacos e viroses crônicas',
  'Microscopia corneana confocal pode ser considerada no diagnóstico da ND — não é rastreio',
  'Retinopatia proliferativa é preditora de DAOP e amputação',
  'Pé diabético: intervalo do exame por risco — 12 meses (0), 6–12 (1), 3–6 (2), 1–3 (3)',
  'IECA/BRA podem elevar a creatinina em até 30% no início — não suspender',
  'Estatina na DRD: se TFG <60; em diálise, só se LDL >145 e/ou doença cardiovascular',
];
const P5 = [
  'Circunferência abdominal fetal >p75 entre 29 e 33 semanas pode indicar início de fármaco mesmo com glicemias no alvo',
  'Metformina na gestação: alternativa ou adjuvante se >2 UI/kg/dia de insulina; evitar se feto <p50 ou com RCIU',
  'Glibenclamida não é recomendada na gestação (hipoglicemia neonatal e macrossomia)',
  'Bomba de insulina pode ser usada na gestação, mas não é superior às múltiplas doses',
];

const G = {
  B1: ['MODY — diabetes monogênico', 'HNF-4α', 'GCK', 'HNF-1β', '52–65%', 'setpoint',
    'Rastreamento do DM2 — as três diretrizes', 'USPSTF', 'FINDRISC alto/muito alto',
    'Não usar\n  HbA1c nos primeiros 3 meses', 'células beta **e alfa**', '2/3',
    '<22 mm (mulheres)', '>1,5', 'eritema migratório necrolítico', 'surdez neurossensorial'],
  B2: ['IRIS', 'espessamento médio-intimal carotídeo', 'classe III–IV', 'gliclazida e glipizida',
    'NEM2', 'apneia do sono', 'secreção de glucagon', 'HbA1c >10%', 'canagliflozina',
    'DEFENDER', 'aberto e sem placebo'],
  B3: ['ONWARDS-1', 'ONWARDS-3', 'ONWARDS-6', 'virgem de insulina', 'nível 2/3',
    'uma agulha e uma seringa por dia', 'degludeca pode ser misturada'],
  B4: ['diagnóstico de exclusão', 'microscopia corneana confocal', 'droxidopa',
    'domperidona, bromoprida', 'eritromicina', '3 pontos de HbA1c em 3 meses',
    'preditora de DAOP', '1–3 meses', 'até 30% no início', 'LDL >145'],
  B5: ['>p75 entre 29 e 33 semanas', '>2 UI/kg/dia', 'restrição de crescimento',
    'Glibenclamida não é recomendada', 'não é superior', '5,7–6,5%'],
};

const blocos = { B1, B2, B3, B4, B5 };
const ancoras = { B1: A1, B2: A2, B3: A3, B4: A4, B5: A5 };
let erros = [];
for (const k of Object.keys(G)) {
  for (const n of G[k]) if (!blocos[k].includes(n)) erros.push(k + ' NOVO ausente: ' + JSON.stringify(n));
  if (!blocos[k].endsWith(ancoras[k])) erros.push(k + ' não termina na âncora');
}
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }

const q = (t, s) => '$' + t + '$' + s + '$' + t + '$';
const F = 'Síntese Endodirect · EndoTEEM 2026 + revisão Diabetes 2025 · SBD';
const ramo = (tag, tema, anc, blk, pts) => `      when d->>'tema' = ${q(tag + 'T', tema)} then
        jsonb_set(
          jsonb_set(d, '{resumo}', to_jsonb(replace(d->>'resumo', ${q(tag + 'A', anc)}, ${q(tag + 'B', blk)}))),
          '{pts}', (d->'pts') || ${q(tag + 'P', JSON.stringify(pts))}::jsonb
        )`;

const sql = `-- EndoTEEM 2026 · revisão Diabetes 2025 -> complementos em 5 capítulos
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case
      when d->>'sub' <> 'Diabetes' or coalesce(d->>'privado','') <> 'true' then d
${ramo('aa', 'Diagnóstico e Classificação do Diabetes', A1, B1, P1)}
${ramo('bb', 'Tratamento do Diabetes Tipo 2 (ADA 2026 / SBD)', A2, B2, P2)}
${ramo('cc', 'Insulinoterapia', A3, B3, P3)}
${ramo('dd', 'Complicações Crônicas do Diabetes', A4, B4, P4)}
${ramo('ee', 'Diabetes e Gestação', A5, B5, P5)}
      else d
    end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';
`;
fs.writeFileSync(__dirname + '/dm2025.sql', sql);
console.log('OK · %s', Object.keys(blocos).map(k => `${k} ${blocos[k].length}c`).join(' · '));
