// EndoTEEM 2026 · Complicações crônicas (DAG0Z2oJXdQ, 80 slides)
// -> "Complicações Crônicas do Diabetes" (sub Diabetes, privado)
const fs = require('fs');
const A = '## 📊 Rastreamento das complicações';

const B = `## Retinopatia diabética

**Rastreamento**

- **DM2**: fundoscopia (mapeamento de retina) **anual desde o diagnóstico**.
- **DM1**: fundoscopia anual **após 5 anos** do diagnóstico no adulto; em
  criança/adolescente, **a partir dos 11 anos**, desde que já com 2 anos de doença.
- **Gestante com diabetes PRÉVIO**: **a cada trimestre** — alto risco de progressão.
  ⚠️ **Não confundir com diabetes gestacional: no DMG não há indicação de fundo de
  olho.**
- ⚠️ **O controle glicêmico rápido pode piorar a retinopatia** (semaglutida SC,
  pós-bariátrica) — mas **no longo prazo o prognóstico melhora**.

**Tratamento**

- Controle glicêmico otimizado e acompanhamento seriado (encurtar o intervalo da
  fundoscopia nos casos graves e na proliferativa).
- Controle dos fatores de risco: **hipertensão** e **dislipidemia** (reduz a
  necessidade de fotocoagulação). ⚠️ **Manter o AAS se indicado — retinopatia não
  contraindica aspirina.**
- **RDP e RDNP grave** → **fotocoagulação**.
- **Hemorragia vítrea refratária** ou **descolamento tracional** → **vitrectomia**.
- **Edema macular diabético com perda visual** → **anti-VEGF** (ranibizumabe,
  aflibercepte) ou **corticoide intravítreo** (risco de catarata e glaucoma).

## Neuropatia diabética

**É a complicação crônica mais prevalente — até 90%.** O **diagnóstico é clínico**:
não são necessários ressonância nem eletroneuromiografia, exceto diante de sinais
de alarme.

**Rastreamento**: no diagnóstico do **DM2**, e **após 5 anos** no **DM1**, com
reavaliação **anual**.

**Como rastrear** — um teste para **fibras finas** e um para **fibras grossas**:

- **Fibras finas**: térmica (ponta e cabeça do diapasão), dolorosa (alfinete) ou
  sudomotora.
- **Fibras grossas**: vibratória (biotesiômetro).
- **Diagnóstico definitivo**: **Escore de Comprometimento Neuropático (ECN/NDS)**,
  que avalia fibras finas e grossas. **Não é necessária ENMG.**
- ⚠️ **Monofilamento de nylon 10 g**: avalia **fibras grossas**, tem **baixa
  sensibilidade** e serve como **triagem do risco de ulceração no pé diabético** —
  **não** é o teste de rastreio da polineuropatia.

**Tratamento**

- **Base**: controle glicêmico e dos fatores de risco — HAS, dislipidemia, doença
  renal, etilismo e **deficiência de B12**.
- **Sintomático da neuropatia diabética periférica dolorosa (NDPD)**:
  - **1ª linha**: tricíclicos (amitriptilina, imipramina, nortriptilina),
    anticonvulsivante (**gabapentina**) e duais (**duloxetina, venlafaxina**).
  - **2ª linha**: **pregabalina** **ou** associação de duas classes de 1ª linha.
  - **3ª linha**: estimulação da medula espinhal, acupuntura, tópicos (capsaicina,
    lidocaína, clonidina), vitaminas B1/B2/benfotiamina, paracetamol,
    carbamazepina/lamotrigina, clonazepam/midazolam, acetil-L-carnitina.
- **Terapia restauradora**: **ácido alfa-lipoico (tióctico) 600 mg/dia** — ND leve a
  moderada, para melhora de força e estabilização do déficit (fibras finas).
- ⚠️ **NÃO recomendados**: **opioides**, topiramato, valproato, lacosamida,
  clonidina, pentoxifilina, mexiletina, vitamina E, canabinoides, AINEs, campo
  magnético, laser de baixa intensidade e Reiki.

**Formas raras que caem em prova**

- **Radiculopatia / amiotrofia diabética**: perda de peso, dor lombar irradiada para
  as coxas proximais (plexopatia), **intensidade incapacitante**, fraqueza de padrão
  miopático. Pode usar **corticoide** (componente de vasculite), gabapentinoides e
  tricíclicos.
- **Neuropatia induzida pelo tratamento**: piora da neuropatia com controle
  glicêmico rápido — **queda >2 pontos de HbA1c em 3 meses**.

### Neuropatia autonômica — o quadro por sistema

| Sistema | Sintomas |
|---|---|
| **Cardiovascular** | Taquicardia sinusal em repouso, hipotensão postural, **hipertensão noturna (supina)**, redução da variabilidade da FC, bradicardia, intolerância ao exercício, **isquemia silenciosa** |
| **Gastrointestinal** | DRGE, gastroparesia, diarreia/constipação |
| **Geniturinário** | Bexiga neurogênica, ressecamento vaginal, disfunção erétil, **ejaculação retrógrada** |
| **Sudomotor e vasomotor** | Anidrose ou hiperidrose, pele seca, alteração de temperatura, boca seca, edema periférico, **artropatia de Charcot** |
| **Pupilar** | Dificuldade de adaptação ao escuro (**pseudo-Argyll-Robertson**) |
| **Metabólico** | **Hipoglicemia assintomática** (HAAF — hipoglicemia associada a falha autonômica) |

**Quando rastrear**: **todos** — DM2 no diagnóstico, DM1 após 5 anos — e **a cada
consulta**, com anamnese e exame físico incluindo hipotensão ortostática.

### 📊 Neuropatia autonômica — testes diagnósticos

| Sistema | Teste |
|---|---|
| **Cardiovascular** | **Possível/precoce**: 1 teste alterado · **Definitiva**: ≥2 testes · **Grave/avançada**: ≥2 testes + hipotensão ortostática.<br>**Parassimpática (testes de Ewing)**: resposta da FC à **manobra de Valsalva**, variação da FC na **respiração profunda**, variação da FC com **ortostase (razão 30:15)**.<br>**Adrenérgica**: variação da PA com ortostase (hipotensão ortostática) ou com Valsalva/preensão palmar.<br>**Colinérgica**: reflexo axônico sudomotor quantitativo (QSART), teste termorregulatório do suor, resposta simpática da pele |
| **Gastrointestinal** | Cintilografia de esvaziamento gástrico (gastroparesia) |
| **Geniturinário** | Estudo urodinâmico |

### 📊 Neuropatia autonômica — tratamento por sistema

| Sistema | Conduta |
|---|---|
| **Todos** | Controle glicêmico e das comorbidades (obesidade, HAS, dislipidemia, tabagismo) |
| **Cardiovascular** | Hipotensão ortostática: **midodrina**, **fludrocortisona**; medidas posturais, otimizar ingesta hídrica e salina. **Evitar** o que piora: alfa e betabloqueadores, vasodilatadores, diuréticos, BCC, tricíclicos |
| **Gastrointestinal** | DRGE: IBP + procinético · Gastroparesia: procinético · Diarreia: loperamida, codeína, clonidina (avaliar SIBO, SII, parasitose) · Constipação: fibras e água, exercício, bisacodil, PEG |
| **Geniturinário** | Disfunção erétil: inibidores da fosfodiesterase (sildenafila, tadalafila), injeção de alprostadil, prótese |

## Úlcera e infecção no pé diabético

**Fatores de risco**: neuropatia, DAOP, deformidades (Charcot, dedos em garra),
úlcera ou amputação prévia, DRC, lesões pré-ulcerativas.

**Rastreamento — o exame dos pés**

- Avaliar os fatores de risco.
- **Sensibilidade protetora plantar**: monofilamento de nylon 10 g **ou Ipswich
  Touch Test**.
- **Pesquisa de DAOP**: história de doença coronariana, palpação de pulsos;
  alternativa, **doppler arterial**.
- **Mínimo anual**, encurtando conforme o risco **até 1–3 meses**.

**Prevenção**: autocuidado (calçado fechado, unhas retas, inspeção diária, secagem
interdigital, hidratar pele íntegra e seca), **tratar ativamente as lesões
fúngicas**, monitorar a temperatura dos pés, palmilhas adaptadas e calçados
terapêuticos, fisioterapia dos pés.

**Ipswich Touch Test — como se faz**

1. Paciente **fecha os olhos**.
2. Toque **suave com o dedo, sem pressionar**, por 1–2 segundos.
3. **Um único toque em cada um dos 6 dedos** — se não sentir, **não repetir**.
4. Registrar como **perda sensorial** se não houver resposta em **2 ou mais** dedos.

Acurácia: **S 77% / E 90%** (monofilamento: S 81% / E 91%).

### 📊 Infecção no pé diabético — classificação IWGDF

**A infecção é a complicação mais associada a hospitalização.**

| Grau | Critérios |
|---|---|
| **Infecção** (definição) | Pelo menos **dois** de: edema, **eritema >0,5 cm** além da úlcera, calor, dor/sensibilidade, secreção purulenta — na prática, os sinais flogísticos |
| **Leve** | Superficial, localizada, **eritema <2 cm** ao redor da úlcera |
| **Moderada** | **Eritema >2 cm**, ou mais profunda (tendão, músculo, osso) |
| **Grave** | **≥2 critérios de SIRS**: T >38 ou <36 °C; FC >90; FR >20; leucócitos >12.000 ou <4.000; desvio à esquerda >10%; pCO₂ <32 |
| **Osteomielite** | Presente ou ausente — indicada pela letra **"O"** nas categorias moderada ou grave |

**Diagnóstico de osteomielite**: usar **pelo menos dois** testes — sondagem óssea
(*probe to bone*), VHS/PCR/procalcitonina, RX do pé. Persistindo dúvida: **RM,
PET-CT ou cintilografia**. **Biópsia óssea com cultura** se for preciso identificar
o germe. ⚠️ **Nunca colher a amostra através da úlcera.**

**Antibioticoterapia**

- Maioria por **Gram-positivos** (*S. aureus*, estreptococos) e **polimicrobiana**.
- **Cobrir anaeróbios** se doença isquêmica periférica, formação de gás ou abscesso
  (metronidazol, clindamicina ou betalactâmico com cobertura anaeróbia —
  amoxicilina-clavulanato, piperacilina-tazobactam, meropeném).
- **Cobrir Pseudomonas** se cultura prévia positiva ou alto risco (climas tropicais)
  — ceftazidima, ciprofloxacino, piperacilina-tazobactam ou carbapenêmico.
- ⚠️ **Não usar antibiótico tópico nem oxigenoterapia hiperbárica.**
- **Leve e sem alergia**: cefalosporina de 1ª geração. **Moderada ou grave**:
  inibidor de betalactamase + cefalosporina de 2ª/3ª geração.
- **Tempo**: 1–2 semanas em geral; **osteomielite 6 semanas**; se o osso infectado
  foi amputado e não há infecção residual, **3–5 dias** após a cirurgia.

## Doença renal do diabetes (DRD)

**Estadiamento**: creatinina pelo **CKD-EPI 2021** + **albuminúria**.

**Rastreamento**

- Albuminúria ou **relação albuminúria/creatininúria** em amostra isolada,
  **anual desde o diagnóstico no DM2**; no **DM1**, após 5 anos de doença a partir
  dos 11 anos (ou 2–5 anos de doença, dos 11 aos 17).
- **Pelo menos 2 de 3 amostras alteradas**, em intervalos de 3 a 6 meses.
- ⚠️ **A albuminúria regride em cerca de 30% dos pacientes — sem que isso dependa de
  intervenção terapêutica.**
- **Elevação transitória**: exercício físico, insuficiência cardíaca, febre, infecção
  urinária, hiperglicemia grave, hipertensão grave.

**Como evitar a progressão**

- **Metas**: HbA1c **<7,0%** (ou 7–7,9% se TFG <45); PA **<130×80 mmHg**;
  dieta com **0,8 g/kg/dia de proteína** no pré-dialítico (**1–1,2 g/kg** em DRC 5D)
  e **sódio 1,5 g/dia** (NaCl 3,75 g/dia).
- **iSGLT-2**: se **TFG 30–60 mL/min** (G3–G5ND) **OU albuminúria >30 mg/g** (A2/A3).
  Piso para **iniciar**: empagliflozina ≥20, dapagliflozina ≥25, canagliflozina ≥45.
  **Suspender definitivamente** ao iniciar terapia renal substitutiva; e
  temporariamente em doença aguda.
- **AGLP-1**: **semaglutida** se **TFG >25 e RAC >100 mg/g** (FLOW), para desfecho
  **renal**; os demais (liraglutida, albiglutida, semaglutida, dulaglutida) se
  **TFG >15**, para desfecho **cardiovascular**.
- **IECA/BRA**: se **albuminúria >30 mg/g (A2/A3)**, ⚠️ **independentemente de haver
  hipertensão**.
- **ARM não esteroidal (finerenona)**: reduz desfechos renais combinados e
  cardiovasculares secundários. Associada ao IECA/BRA se **TFG 25–60 com RAC >30
  mg/g e K <4,8**.
- **ARM esteroidal (espironolactona)**: para controle da hipertensão **ou** proteção
  renal associada a IECA/BRA se **TFG 25–60 + RAC >30 mg/g**, desde que **K <5**.

### 📊 O que usar em cada faixa de TFG

| TFG >60 + RAC >30 | 60–45 | 44–30 | 29–20 | <20 |
|---|---|---|---|---|
| IECA ou BRA | IECA ou BRA | IECA ou BRA | IECA ou BRA | **IECA/BRA até 15 mL/min** |
| iSGLT-2 | iSGLT-2 | iSGLT-2 | iSGLT-2 | **Manter iSGLT-2 se já iniciado; suspender se TRS** |
| Finerenona (K <4,8) | Finerenona (K <4,8) | Finerenona (K <4,8) | Finerenona (K <4,8) | **Não usar finerenona** |
| Semaglutida se RAC ≥100 | idem | idem | idem | **Semaglutida até TFG >15** |

### 📊 Os estudos renais

| Medicação | Estudo | População | Desfecho |
|---|---|---|---|
| Dapagliflozina | DAPA-CKD | TFG 25–75 + albuminúria 200–5.000 mg/g | ↓desfecho renal combinado (↓TFG >50%, DRC terminal, morte renal ou cardíaca) |
| Empagliflozina | EMPA-KIDNEY | TFG 20–45, ou 45–90 com albuminúria >200 mg/g | ↓progressão de DRC ou morte CV |
| Canagliflozina | CREDENCE | DM2 + TFG 30–90 + albuminúria 300–5.000 mg/g | ↓desfechos renais, ↓MACE, ↓hospitalização por IC |
| Semaglutida | FLOW | DM2 + TFG >25 + albuminúria >100 mg/g | ↓desfechos renais combinados |
| Finerenona | **FIDELIO-DKD** | DM2 + TFG >25 + albuminúria >30 mg/g | ↓desfechos **renais** combinados |
| Finerenona | **FIGARO-DKD** | DM2 + TFG >25 + albuminúria >30 mg/g | ↓desfechos **cardiovasculares** combinados |
| Finerenona + empagliflozina | **CONFIDENCE** | DM2 + TFG >30 + albuminúria >100 mg/g | ↓RAC além de cada monoterapia isolada |

### Diabetes na DRC avançada (TFG <30)

- **iDPP-4**: só **linagliptina e evogliptina** dispensam ajuste pela TFG.
- **Sulfonilureias**: preferir **gliclazida e glipizida** se TFG <30 — metabólitos
  **inativos**, menor risco de hipoglicemia.
- **iSGLT-2**: podem ser iniciados se **TFG >20**; suspender ao entrar em diálise.
- **AGLP-1** (liraglutida, dulaglutida, semaglutida): com cautela se **TFG >15**,
  para peso, glicemia e redução de risco cardiovascular.
- **Insulina**: preferir **análogos** (menos hipoglicemia) e **sempre considerar
  redução de dose** em relação ao paciente sem DRC.

**No dialítico, o esquema muda nos dias de diálise**: reduzir **25% da basal** no
dia da sessão (se a sessão é pela manhã, ↓25% da NPH da noite anterior; ou ↓25% da
dose imediatamente antes da diálise) e **↓25% do bolus da refeição pré-diálise**.

**Metas lipídicas na DRD**: **diabetes com DRC é no mínimo alto risco** — para a
maioria, incluindo **transplantados**, recomenda-se **estatina de alta potência**.

## Comorbidades no paciente diabético

### Insuficiência cardíaca

- **iSGLT-2 é 1ª linha, independentemente da fração de ejeção**, para reduzir
  mortalidade cardiovascular e hospitalização por IC.
- Fora da meta com terapia dupla (iSGLT-2 + metformina) → **AGLP-1 com benefício
  cardiovascular, se a IC estiver estável** (pode ↑FC 2–4 bpm): melhora qualidade de
  vida na ICFEP (STEP-HFpEF) e reduz eventos (LEADER, HARMONY, REWIND, SUSTAIN-6).
- **iDPP-4 são seguros** — **exceto saxagliptina** (↑hospitalização por IC).
- ⚠️ **Pioglitazona é contraindicada** (↑hospitalização por IC, retenção hídrica).

### Hipertensão arterial

- **Maioria dos diabéticos com HAS**: meta **<130×80 mmHg**.
- **HAS estágio III** (≥180×110) **ou idoso >80 anos saudável**: meta **inicial
  <140×90**.
- **Idoso frágil**: meta inicial **<150×80**.
- ⚠️ **Para todos, evitar baixar a PA diastólica para <70 mmHg** — reduz a perfusão
  coronariana e aumenta eventos cardiovasculares.

### Imunização

A relação diabetes–infecção é **bidirecional**, e **pior controle glicêmico significa
pior resposta vacinal**.

- **Corticoide**: postergar a vacina se ≥2 mg/kg em criança ou ≥20 mg/dia de
  equivalente de prednisona **por ≥14 dias**.
- **Febre**: adiar até **48–72 h sem febre**.
- ⚠️ **Infecção leve (resfriado, gastroenterite) NÃO contraindica vacinar.**

| Vacina | Periodicidade |
|---|---|
| **Influenza** | A partir dos 6 meses de vida, reforço **anual**; no diabético **>60 anos, preferir dose aumentada** |
| **COVID** | A partir dos 6 meses, reforço anual |
| **VSR** | Diabético **>60 anos** (dose única) |
| **Herpes-zóster** | Diabético **>50 anos** (duas doses) |
| **Pneumocócica** | A partir dos 2 meses; doses conforme o tipo de vacina |
| **Hepatite B** | **3 doses (0, 2 e 6 meses)**, independentemente da idade |

**📊 Esquemas pneumocócicos**

| Grupo | Esquema |
|---|---|
| **Criança <2 anos** | **VPC20** é o preferencial (a partir dos 2 meses, sem dose complementar). VPC15/13/10 exigem complementar com **VPP23 a partir dos 2 anos** |
| **>2 anos, adolescente, adulto e idoso não vacinados com VPC20** | **VPC20** preferencial, sem complementar. VPC15 ou VPC13 exigem **VPP23 após 2 meses** e **nova dose 5 anos** depois da primeira |

### Depressão

- Prevalência **2–3× maior** no diabético, com **maior risco de suicídio**; e a
  depressão **dificulta o controle glicêmico**. **Rastrear sintomas depressivos de
  rotina.**
- **Preferir ISRS.** ⚠️ **Evitar tricíclicos, mirtazapina e antipsicóticos atípicos**
  (olanzapina, quetiapina — preferir aripiprazol, brexpiprazol): pioram a resistência
  insulínica, o peso e a glicemia.
- Pioglitazona e metformina têm **potencial** benefício sobre sintomas depressivos —
  **sem recomendação de uso para essa finalidade**.

## ⚠️ Pegadinhas de prova

- **Retinopatia NÃO contraindica aspirina**; **edema macular ocorre em qualquer
  estágio**; manchas algodonosas **não** são "não proliferativa leve"; e o rastreio
  no DM1 começa **após 5 anos**, não ao diagnóstico (TEEM 2019, q. 36).
- **Polineuropatia diabética se diagnostica por exame clínico + escore de
  comprometimento neuropático** — não por ENMG, não por microscopia confocal, e o
  monofilamento de 10 g **não** tem alta sensibilidade para fibras finas
  (TEEM 2022, q. 11).
- **Testes de Ewing** (autonômica cardiovascular): FC na respiração profunda, FC na
  manobra de Valsalva, **razão 30:15** na ortostase, e PA na ortostase / preensão
  palmar. No exame físico da periférica: queda de sensibilidade dolorosa, térmica,
  vibratória, tátil e ao monofilamento, e perda de propriocepção (TEEM 2020).
- **Albuminúria regride em ~30% sem intervenção** — e IECA/BRA **retardam sim** a
  perda de função renal; iDPP-4 **também** têm estudos mostrando redução de
  albuminúria (TEEM 2023, q. 48).
- **HAS estágio III no DM2 → meta inicial <140×90.** Não existe meta <120×70, e
  IECA/BRA são 1ª linha **quando há albuminúria** (TEEM 2024, q. 39).
- **Gliclazida e glipizida** são as sulfonilureias com metabólitos inativos —
  a opção quando a TFG cai; e as de 2ª geração **diferem** entre si no risco de
  hipoglicemia (TEEM 2024, q. 40).

${A}`;

const PTS = [
  'Retinopatia: fundoscopia anual desde o diagnóstico no DM2; no DM1 após 5 anos (ou a partir dos 11 anos com 2 anos de doença)',
  'Gestante com diabetes PRÉVIO faz fundoscopia a cada trimestre — no diabetes gestacional não há indicação',
  'Retinopatia não contraindica AAS; edema macular pode ocorrer em qualquer estágio',
  'RDP e RDNP grave: fotocoagulação. Hemorragia vítrea refratária ou descolamento tracional: vitrectomia. EMD com perda visual: anti-VEGF ou corticoide intravítreo',
  'Neuropatia é a complicação crônica mais prevalente (até 90%) e o diagnóstico é CLÍNICO — ENMG só com sinais de alarme',
  'Rastreio da neuropatia: um teste de fibras finas + um de fibras grossas; diagnóstico definitivo pelo escore de comprometimento neuropático (ECN/NDS)',
  'Monofilamento 10 g avalia fibras grossas, tem baixa sensibilidade e serve para triagem do risco de ulceração — não é o rastreio da polineuropatia',
  'NDPD: 1ª linha tricíclicos, gabapentina e duais; 2ª linha pregabalina ou associação de duas de 1ª linha',
  'Ácido alfa-lipoico 600 mg/dia é a terapia restauradora na ND leve a moderada; opioides NÃO são recomendados',
  'Amiotrofia diabética: perda de peso, dor lombar irradiada para coxas proximais, fraqueza miopática — pode usar corticoide',
  'Neuropatia induzida pelo tratamento: piora com queda >2 pontos de HbA1c em 3 meses',
  'Autonômica cardiovascular: definitiva com ≥2 testes alterados; grave se ≥2 testes + hipotensão ortostática',
  'Testes de Ewing: FC na respiração profunda, FC na Valsalva, razão 30:15 na ortostase e PA na ortostase/preensão',
  'Hipotensão ortostática autonômica: midodrina e fludrocortisona, evitando alfa/betabloqueador, vasodilatador, diurético, BCC e tricíclico',
  'Ipswich Touch Test: toque leve de 1–2 s em 6 dedos, sem repetir; perda sensorial se ≥2 dedos sem resposta (S 77% / E 90%)',
  'Infecção no pé diabético é a complicação mais associada a hospitalização; leve tem eritema <2 cm, moderada >2 cm, grave tem ≥2 critérios de SIRS',
  'Osteomielite: pelo menos dois testes (probe to bone, VHS/PCR/procalcitonina, RX); nunca colher amostra através da úlcera',
  'ATB no pé diabético: 1–2 semanas em geral, 6 semanas na osteomielite, 3–5 dias se o osso infectado foi amputado; não usar tópico nem câmara hiperbárica',
  'Albuminúria: 2 de 3 amostras alteradas em 3–6 meses; regride em ~30% sem intervenção terapêutica',
  'IECA/BRA na DRD se RAC >30 mg/g, INDEPENDENTEMENTE de haver hipertensão',
  'Finerenona associada a IECA/BRA se TFG 25–60, RAC >30 e K <4,8 (FIDELIO renal, FIGARO cardiovascular)',
  'CONFIDENCE: finerenona + empagliflozina reduziu a RAC mais que cada monoterapia',
  'Semaglutida para desfecho renal se TFG >25 e RAC >100 (FLOW); demais AGLP-1 até TFG >15 por desfecho CV',
  'Abaixo de TFG 20: manter iSGLT-2 já iniciado, IECA/BRA até 15, semaglutida até 15 — e NÃO usar finerenona',
  'DRC avançada: linagliptina e evogliptina sem ajuste; gliclazida e glipizida como sulfonilureias de escolha',
  'Dialítico: reduzir 25% da basal no dia da sessão e 25% do bolus da refeição pré-diálise',
  'Diabetes com DRC é no mínimo alto risco — estatina de alta potência para a maioria, incluindo transplantados',
  'IC no diabético: iSGLT-2 é 1ª linha independentemente da FE; pioglitazona é contraindicada e saxagliptina deve ser evitada',
  'Meta pressórica <130×80; estágio III ou idoso >80 saudável <140×90; idoso frágil <150×80 — e nunca PAD <70',
  'Vacinas: hepatite B em 3 doses independentemente da idade; herpes-zóster >50 anos; VSR >60 anos; influenza em dose aumentada >60 anos',
  'Infecção leve não contraindica vacinar; corticoide ≥20 mg/dia de prednisona por ≥14 dias adia a vacina',
  'Depressão é 2–3× mais prevalente no diabético: preferir ISRS, evitar tricíclicos, mirtazapina e atípicos como olanzapina e quetiapina',
];

const NOVOS = [
  'mapeamento de retina', 'a cada trimestre', 'no DMG não há indicação',
  'fotocoagulação', 'vitrectomia', 'aflibercepte', 'corticoide intravítreo',
  'até 90%', 'biotesiômetro', 'ECN/NDS', 'Não é necessária ENMG',
  'benfotiamina', 'acetil-L-carnitina', 'ácido alfa-lipoico (tióctico) 600 mg/dia',
  'Reiki', 'amiotrofia diabética', '>2 pontos de HbA1c em 3 meses',
  'pseudo-Argyll-Robertson', 'HAAF', 'artropatia de Charcot', 'ejaculação retrógrada',
  'razão 30:15', 'QSART', 'Cintilografia de esvaziamento gástrico', 'Estudo urodinâmico',
  'midodrina', 'fludrocortisona', 'bisacodil', 'alprostadil',
  'Ipswich Touch Test', 'S 77% / E 90%', 'IWGDF', 'eritema >0,5 cm',
  'pCO₂ <32', 'probe to bone', 'Nunca colher a amostra através da úlcera',
  'oxigenoterapia hiperbárica', 'osteomielite 6 semanas', '3–5 dias',
  'CKD-EPI 2021', '2 de 3 amostras alteradas', 'regride em cerca de 30%',
  '0,8 g/kg/dia de proteína', 'sódio 1,5 g/dia',
  'empagliflozina ≥20, dapagliflozina ≥25, canagliflozina ≥45',
  'independentemente de haver\n  hipertensão', 'K <4,8', 'K <5',
  'FIDELIO-DKD', 'FIGARO-DKD', 'CONFIDENCE',
  'linagliptina e evogliptina', 'gliclazida e glipizida',
  '25% da basal', 'transplantados',
  'STEP-HFpEF', 'saxagliptina', 'Pioglitazona é contraindicada',
  '<150×80', 'PA diastólica para <70 mmHg',
  'VPC20', 'VPP23', 'Herpes-zóster', 'Hepatite B',
  '48–72 h sem febre', 'NÃO contraindica vacinar',
  'brexpiprazol', '2–3× maior',
  'Pegadinhas de prova', 'TEEM 2019, q. 36', 'TEEM 2022, q. 11', 'TEEM 2020',
  'TEEM 2023, q. 48', 'TEEM 2024, q. 39', 'TEEM 2024, q. 40',
];

const PRESERVADOS = ['## Microvasculares', '## Macrovasculares', '## Pé diabético',
  '## Prevenção (base de tudo)', '## Estratificação de risco cardiovascular (SBD 2025)',
  '## ⚠️ Onde NÃO iniciar estatina', '## Triglicerídeos e ômega-3', A];

let erros = [];
for (const n of NOVOS) if (!B.includes(n)) erros.push('NOVO ausente: ' + JSON.stringify(n));
if (!B.endsWith(A)) erros.push('não termina na âncora');
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }

const q = (t, s) => '$' + t + '$' + s + '$' + t + '$';
const sql = `-- EndoTEEM 2026 · Complicações crônicas -> Complicações Crônicas do Diabetes
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case
      when d->>'sub' <> 'Diabetes' or coalesce(d->>'privado','') <> 'true' then d
      when d->>'tema' = 'Complicações Crônicas do Diabetes' then
        jsonb_set(
          jsonb_set(d, '{resumo}', to_jsonb(replace(d->>'resumo', ${q('anc', A)}, ${q('blk', B)}))),
          '{pts}', (d->'pts') || ${q('pts', JSON.stringify(PTS))}::jsonb
        ) || ${q('fon', JSON.stringify({ fonte: 'Síntese Endodirect · EndoTEEM 2026 (Risco cardiovascular + Complicações crônicas) + SBD 2025 / IWGDF' }))}::jsonb
      else d
    end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';
`;
fs.writeFileSync(__dirname + '/dm-cronicas.sql', sql);
console.log('OK · %d chars · %d pts · %d guards · %d preservados', B.length, PTS.length, NOVOS.length, PRESERVADOS.length);
