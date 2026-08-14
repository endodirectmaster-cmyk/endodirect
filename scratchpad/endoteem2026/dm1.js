// EndoTEEM 2026 · Diabetes tipo 1: diagnóstico e tratamento (DAG0Z337Q_g, 68 slides)
// -> "Diabetes Tipo 1 e LADA" + "Insulinoterapia" (sub Diabetes, privado)
const fs = require('fs');

const A1 = '## 📊 Tipo 1 × Tipo 2 (diferenciação)';
const A2 = '## 📊 Perfil das insulinas';

const B1 = `## Estágios do DM1 (SBD 2025)

| Estágio | Definição |
|---|---|
| **I** | ≥2 anticorpos anti-célula beta, **glicemia normal**, sem sintomas |
| **II** | ≥2 anticorpos, **glicemia alterada** (faixa de pré-diabetes), sem sintomas — **IIa** valores próximos do normal, **IIb** valores alterados |
| **III** | ≥1 anticorpo + **glicemia de diabetes** — **IIIa** sem sintomas, **IIIb** com sintomas e necessidade de insulina |
| **IV** | DM1 de longa data |

⚠️ **Dois anticorpos com glicemia normal é estágio 1 — não é diagnóstico de
diabetes.** E anti-GAD em título alto com peptídeo C baixo já saiu do estágio 1.

### 📊 Critérios glicêmicos do estágio 2

| Exame | Corte |
|---|---|
| Glicemia de jejum | 100–125 mg/dL |
| HbA1c | 5,7–6,5% |
| TOTG 2 h | 140–200 mg/dL |
| TOTG nos tempos 0, 30, 60 **ou** 90 min | ≥200 mg/dL |
| CGM — tempo acima de 140 mg/dL | >10% |
| Variação da HbA1c | >10% |

### 📊 Critérios glicêmicos do estágio 3 (2 ou mais)

| Exame | Corte |
|---|---|
| Glicemia de jejum | ≥126 mg/dL |
| HbA1c | ≥6,5% |
| TOTG 75 g, 2 h | ≥200 mg/dL |
| Glicemia aleatória **com sintomas** | ≥200 mg/dL |

## Rastreamento — quando pedir anticorpos

**SBD 2025: ainda não há dados suficientes para recomendar rastreamento universal
no Brasil.** Pode ser **considerado** em familiares de 1º grau de pessoas com DM1,
para: reduzir o risco de CAD ao diagnóstico, oferecer educação, selecionar
candidatos a protocolos de prevenção e indicar medicação que atrasa a fase 3
(teplizumabe).

> **Em criança com familiar de 1º grau com DM1**: considerar rastreio aos **2–4
> anos** e repetir aos **6–8** e **10–15** se negativo. Após os 15 anos, se nunca
> feito, pode ser avaliação **única** (baixo risco de soroconversão).

### 📊 Os anticorpos (positivos em 85% dos DM1 — o "DM1a")

| Anticorpo | Característica |
|---|---|
| **Anti-GAD** | Alta prevalência, sobretudo em adultos; pode estar positivo isoladamente |
| **Anti-IA2** | Associado a **progressão rápida** da doença |
| **Anti-insulina** | Geralmente o **1º a positivar na infância**; pode positivar 10–14 dias após uso de insulina |
| **Anti-ZnT8** | Presente em **25%** dos DM1 com GAD e IA2 negativos |
| **Anti-ilhota (ICA)** | Na presença de outros autoanticorpos, aumenta o risco de doença clínica |

### Como acompanhar o assintomático com anticorpo positivo

- **Anticorpo positivo** → **repetir a dosagem em 3 meses**.
- **≥2 anticorpos confirmados** = DM1 estágio 1 → reavaliação frequente,
  seguimento glicêmico a cada **3–12 meses**, avaliar **teplizumabe**.
- **Apenas 1 anticorpo** → repetir anticorpos e glicemia a cada **6 meses se <3
  anos de idade** (por 3 anos) e **anual por 3 anos se >3 anos**; em adultos,
  apenas glicemia por 5 anos.
- **Anticorpos negativos** → reavaliar se surgirem sintomas.

## Teplizumabe — terapia modificadora de história natural

Anticorpo **anti-CD3**, aprovado nos EUA para **retardar** o início da fase clínica
em quem está em fase pré-clínica: **a partir dos 8 anos, no estágio 2**. Infusão
**intravenosa por 14 dias**.

- Retardou o início da doença em **24 meses** em média.
- **56%** do grupo teplizumabe permaneceu sem doença × **28%** do controle.

## Nutrição no DM1

- **Contagem de carboidratos** é o recomendado — maior precisão e melhor controle.
- **Low carb** pode ser considerada como ferramenta de **curto prazo** (faltam
  estudos de segurança de longo prazo); alimentos de **baixo índice glicêmico**
  ajudam na pós-prandial.
- **Não existe quantidade ideal de carboidrato no DM1** → individualizar.
- Em quem já domina a contagem, considerar **contagem de proteínas e gorduras**
  (bolus adicional, ou bolus **quadrado**/**multionda** no SICI) — o efeito na
  glicemia é **tardio, >2 h**.

## Exercício físico no DM1

- Mínimo **150 min/semana** de atividade aeróbica de intensidade moderada.
- **ECG antes** se: exercício de alta intensidade (HIIT), alto risco CV, ou
  sintomas típicos **ou atípicos** de doença cardíaca.
- **Retinopatia**: moderada → evitar manobras de Valsalva; grave → evitar impacto
  e contato; proliferativa → evitar corrida, além de tudo o anterior.
- **Polineuropatia**: avaliar os pés antes e depois; evitar impacto sobre os pés
  (caminhada, esteira, escada) — mas **a caminhada não é proibida**, e sim vigiada.

**A direção do efeito**: exercício **resistido ↑glicemia**; **aeróbico ↓glicemia**;
**combinado → começar pelo resistido**.

**Ajuste pela glicemia pré-exercício**

- **<90 mg/dL**: 15–30 g de carboidrato antes.
- **90–150 mg/dL**: consumir carboidrato durante (0,5–1,0 g/kg/hora).
- **150–250 mg/dL**: monitorar, sem necessidade de carboidrato.
- **>250 mg/dL**: avaliar **cetonemia** e **não realizar** o exercício.
- Reduzir o bolus da refeição pré-exercício **aeróbico** em **25–75%** conforme a
  intensidade (dose normal se anaeróbico), se comer até 90 min antes. Fora do
  pós-prandial e em SICI: reduzir a **basal em 30%, 90 min antes**.

## Insulinoterapia no DM1 — múltiplas doses (MDI)

- Mimetizar a secreção fisiológica: **50% basal / 50% bolus**.
- Dose total diária: **0,4–1,0 UI/kg/dia** no adulto; **1–2,0 UI/kg/dia** no púbere.
- **Análogos rápidos**: menos hipoglicemia grave e noturna que a regular.
- **Análogos longos**: menor variabilidade e menos hipoglicemia noturna que a NPH.
- **CGM sempre que disponível**: menos hipoglicemia e maior queda de HbA1c que a
  glicemia capilar. (A **MARD** — *mean absolute relative difference* — é a margem
  de erro do sensor.)

### Fator de sensibilidade e bolus de correção

**FS** = quanto **1 UI** reduz da glicemia. **FS = 1800 / DTD** (ou 400/DTD; em
bebês, **2100/DTD**).

> Glargina 22 UI + asparte 6 UI no café, almoço e jantar = **DTD 40 UI** →
> FS = 1800/40 = **45**.

**Bolus de correção = (glicemia atual − alvo) / FS**

> DTD 40, FS 45, alvo 100, glicemia 370 → (370−100)/45 = 270/45 = **6 UI**.

E o bolus total soma a correção com a refeição: com FS 60, alvo 100, razão
insulina:carboidrato **1:15** e refeição de 75 g → 5 UI (refeição) + (280−100)/60 =
3 UI (correção) = **8 UI**.

### Sistema de infusão contínua (SICI / bomba)

- Indicação: sem controle adequado no MDI **ou** hipoglicemias graves recorrentes.
- **Preferência em criança <7 anos** (precisa de doses muito pequenas).
- **Transição MDI → SICI**: DTD do MDI **× 80%**, distribuída em **40% basal / 60%
  bolus**. A basal se divide por 24 para obter a taxa horária.
- Exige domínio da contagem de carboidratos (o bolus depende de informar o total).
- Sem SICI disponível, usar seringa/caneta com incremento de **0,5 UI** em criança.

### Dias de doença

- **Hiperglicemia persistente (>250 mg/dL)** → monitorar **cetonemia**: se >0,6
  mmol/L, medir a cada 1–2 h até normalizar (<0,6). **Pronto-socorro** se sintomas
  ou cetonemia >1,5 persistente.
- Cetonemia ou hiperglicemia subindo: **aumentar a basal** e hidratar por via oral
  — líquido **pobre em carboidrato** se glicemia >250, **rico** se normal ou baixa.
- Glicemia capilar a cada **1–4 horas**.
- ⚠️ **Nunca suspender a basal, mesmo em jejum.**
- Educar paciente e família sobre dias de doença **reduz internação e cetoacidose**.

## Rastreamento de comorbidades autoimunes

| Comorbidade | Periodicidade | Exame |
|---|---|---|
| Doença tireoidiana autoimune | **No diagnóstico e anual** | TSH + anti-TPO |
| Doença celíaca | **Criança**: no diagnóstico, no 2º e no 5º ano, e se sintomas (TGI ou baixa estatura) · **Adulto**: só se sintomas (TGI, perda de peso, hipoglicemias) | Antitransglutaminase IgA ou antiendomísio IgA |
| Gastrite autoimune | Só se sintomas (anemia microcítica ou sintomas TGI) | Anticélula parietal |
| Insuficiência adrenal | Só se sintomas | Cortisol sérico basal |

## Transtornos alimentares no diabetes

| Transtorno | Aspectos importantes | Tratamento |
|---|---|---|
| **Anorexia nervosa** — distorção da autoimagem com medo desproporcional de engordar | Gravidade pelo IMC: leve 17–17,5 · moderada 15–16,9 · **grave <15**. **Amenorreia não é critério obrigatório** em mulheres. Maior mortalidade no DM1; hipoglicemias graves | Psicoterapia + reabilitação nutricional |
| **Bulimia nervosa** — compensação após a ingesta | **O mais comum no DM1** (até 30% das mulheres); alto risco de CAD e hipoglicemia grave. Purgativa (pular refeição, jejum, **não aplicar insulina**) × não purgativa (exercício intenso). Peso normal ou sobrepeso | Terapia cognitivo-comportamental; 2ª linha fluoxetina |
| **Compulsão alimentar (TCA)** — episódios ≥1×/semana por >3 meses, comer rápido/em grande quantidade com culpa e perda de controle | **Mais comum no DM2**; sobrepeso/obesidade e hiperglicemia persistente | Lisdexanfetamina (em bula). Off-label: topiramato, AGLP-1 (lira, sema, dula), ISRS |

## Hipoglicemia no DM1 — o que procurar

Classificação: **nível I** 55–70 · **nível II** <54 · **nível III (grave)** qualquer
valor com alteração de consciência e necessidade de terceiros. **Pseudo-hipoglicemia**
= sintomas com medida >70.

Correção: **nível I** 15 g de glicose VO/enteral (0,3 g/kg em criança), repetindo a
cada 15 min; **nível II** 20–30 g VO/enteral; **nível III** glicose EV 20–30 g
(glicose 50%, 5 ampolas) — sem acesso venoso, **glucagon 1 mg IM/SC**.

Quando ela se repete, procurar:

- **Hiperbasalização** — basal >50–60% da dose total ou >0,5 UI/kg/dia.
- **Lipodistrofia** nos sítios de aplicação.
- **Gastroparesia diabética** (se pós-prandial).
- **Anticorpos anti-insulina** (também pós-prandial).
- **Comorbidades**: insuficiência adrenal, doença celíaca, gastrite atrófica, DRC,
  transtornos psiquiátricos (bulimia, anorexia).

## ⚠️ Pegadinhas de prova

- **Anticorpo positivo em assintomático → repetir em 3 meses** e oferecer educação e
  suporte psicossocial se persistir — não é esperar a puberdade nem abandonar os
  anticorpos (TEEM 2025, q. 36).
- **2 anticorpos com glicemia normal = estágio 1**, não diagnóstico. E anemia, DRC
  em hemodiálise e hepatite C **tornam a HbA1c não fidedigna** (TEEM 2024, q. 47).
- **Anti-GAD negativo não descarta DM1**: obeso, 24 anos, peptídeo C 0,3 ng/mL →
  pedir os **outros** anticorpos (TEEM 2025, q. 37).
- **Caminhada não é contraindicada** na neuropatia periférica; avaliação
  cardiológica não é obrigatória para exercício de baixa intensidade sem sintomas;
  e o CGM **é** recomendado para decisão de dose (TEEM 2025, q. 38).
- **Transição MDI → bomba**: DTD × 80%, 40% basal ÷ 24 h = taxa horária;
  FS = 1800/DTD (TEEM 2024, q. 45).
- **Bomba sem sensor** → some a correção automática: ajustar a **relação
  insulina:carboidrato** (menos insulina para o mesmo carboidrato). Reduzir o tempo
  de insulina ativa **aumenta** o risco de hipoglicemia (TEEM 2025, q. 100).

${A1}`;

const B2 = `## Insulina semanal — icodeca (Awiqli 700 UI/mL)

Aprovada pela **ANVISA para DM1 e DM2**.

- **Dose**: 7× a dose diária habitual, uma vez por semana. Na **primeira** semana,
  aplicar **1,5× a dose diária × 7**; a partir da segunda, 7× a dose diária.
- **Titulação**: jejum <80 → ↓20% da dose; >130 mg/dL → ↑20% (gradação de 10 em 10
  UI na seringa).
- **Estudos ONWARDS**: tão eficaz quanto os análogos de longa duração (degludeca e
  glargina no DM2; degludeca no DM1). ⚠️ **No DM1 aumentou episódios de
  hipoglicemia.**

## 📊 Troca entre insulinas basais — o ajuste de dose

| Insulina prévia | Insulina a ser usada | Mudança de dose |
|---|---|---|
| NPH | Glargina, detemir ou degludeca | **Reduzir 20%** da dose total |
| Glargina, detemir ou degludeca | NPH | **Reduzir 20%** da dose total |
| Glargina 100 | Glargina 300 | **Sem ajuste** |
| Glargina 300 | Glargina 100 | **Reduzir 20%** |
| Glargina 300 | Degludeca | **Reduzir 20%** |

*Fonte: bula das medicações.* Regra de bolso: **para glargina 300 ou degludeca,
mantém-se a dose; saindo delas para glargina 100, detemir ou NPH, reduz-se 20%.**

## Técnica de aplicação

- **Não reutilizar agulhas** — risco de lipo-hipertrofia.
- **Misturar NPH com regular/ultrarrápida**: aspirar **primeiro a regular/
  ultrarrápida** — a NPH não é a primeira. **Só seringa com agulha fixa** permite
  misturar.
- ⚠️ **Nunca misturar análogo de longa duração com rápida/ultrarrápida.**
- **Homogeneizar a NPH** com 20 movimentos suaves (rolamento ou pêndulo).
- **Preferir caneta** à seringa: mais fácil, menos hipoglicemia e maior queda de
  HbA1c.
- **Rodízio dos sítios**: reduz lipo-hipertrofia e variabilidade glicêmica.
- **Armazenamento**: lacrada, **2–8 °C** até o fim da validade. Aberta, até **30 °C**,
  fora do sol, pelo prazo do fabricante (geralmente **30–45 dias**).

### Preparo da mistura NPH + regular/ultrarrápida, passo a passo

1. Anotar a **soma** das unidades prescritas antes de começar.
2. Lavar e secar as mãos; reunir insulinas, seringa, algodão e álcool 70% líquido.
3. **Homogeneizar** a NPH.
4. Assepsia da borracha dos frascos com álcool 70% e **esperar secar**.
5. Aspirar **ar** correspondente à dose de **NPH** e injetá-lo no frasco de NPH —
   retirar a agulha **sem aspirar** a insulina.
6. Aspirar **ar** correspondente à dose de **regular/ultrarrápida**, injetá-lo no
   frasco, virar o frasco e **aspirar a dose**.
7. Voltar o frasco à posição inicial e retirar a agulha.
8. Introduzir a agulha (já com a rápida) no frasco de **NPH**, virá-lo e aspirar a
   dose de NPH.
9. Conferir: **o total na seringa deve ser a soma das duas doses**.
10. Retornar o frasco à posição inicial e proteger a agulha até a aplicação.

⚠️ **Se aspirou a mais, o excesso não volta ao frasco nem é "desprezado" na
seringa**: descarta-se a seringa inteira e recomeça-se com outra.

## Falta de NPH e regular em frasco-ampola (posicionamento SBD, 2024/2025)

- **Trocar NPH e regular por análogos.**
- **Emergências hiperglicêmicas**: bomba de infusão EV com **análogo ultrarrápido**
  (lispro, asparte ou glulisina). ⚠️ **Glulisina só dilui em SF**; os demais, em SF
  ou SG. Estabilidade de **12–24 h** (a lispro chega a **48 h**).
- **Cetoacidose leve a moderada** (pH 7,1–7,3 e bicarbonato 10–18) **pode ser
  manejada com insulina subcutânea**.
- Os ultrarrápidos servem para **hipercalemia grave** na mesma proporção da regular.
- São **seguros** para a hiperglicemia hospitalar.

## Cálculo de dose — fator de sensibilidade

**FS = 1800 / dose total diária** (ou 400/DTD; **2100/DTD** em bebês) — quanto 1 UI
baixa da glicemia. **Bolus de correção = (glicemia atual − alvo) / FS.**

${A2}`;

const P1 = [
  'Estágio 1 do DM1 = ≥2 anticorpos com glicemia NORMAL — não é diagnóstico de diabetes',
  'Estágio 2 = ≥2 anticorpos com disglicemia sem sintomas; estágio 3 = glicemia de diabetes (IIIa sem sintomas, IIIb com sintomas e insulina)',
  'No estágio 2 conta também TOTG ≥200 nos tempos 0/30/60/90 min, tempo >140 no CGM acima de 10% e variação de HbA1c >10%',
  'SBD 2025: não há dados para rastreamento universal de DM1 no Brasil — considerar em familiar de 1º grau',
  'Criança com familiar de 1º grau: rastrear aos 2–4 anos, repetir aos 6–8 e 10–15; após os 15 anos, avaliação única',
  'Anti-insulina é geralmente o 1º a positivar na infância e pode positivar 10–14 dias após uso de insulina',
  'Anti-IA2 associa-se a progressão rápida; anti-ZnT8 está em 25% dos DM1 com GAD e IA2 negativos',
  'Anticorpo positivo em assintomático: repetir em 3 meses antes de qualquer conclusão',
  'Teplizumabe (anti-CD3): estágio 2, a partir dos 8 anos, EV por 14 dias — retardou a doença em 24 meses (56% × 28% livres)',
  'Anti-GAD negativo NÃO descarta DM1 — pedir os demais anticorpos quando o peptídeo C é baixo',
  'Contagem de proteínas e gorduras (bolus quadrado/multionda) para o efeito tardio >2 h na glicemia',
  'Exercício resistido ↑glicemia, aeróbico ↓glicemia, combinado começa pelo resistido',
  'Glicemia >250 antes do exercício: avaliar cetonemia e NÃO exercitar; <90: 15–30 g de carboidrato antes',
  'Reduzir o bolus pré-exercício aeróbico em 25–75%; em SICI fora do pós-prandial, reduzir a basal em 30% 90 min antes',
  'MDI no DM1: 50% basal / 50% bolus, 0,4–1,0 UI/kg/dia no adulto e 1–2,0 UI/kg/dia no púbere',
  'FS = 1800/DTD (400/DTD alternativo, 2100/DTD em bebês); bolus de correção = (glicemia − alvo) / FS',
  'MDI → bomba: DTD × 80%, distribuída em 40% basal e 60% bolus; a basal ÷ 24 dá a taxa horária',
  'Bomba é preferência em criança <7 anos pela necessidade de doses muito pequenas',
  'Dias de doença: NUNCA suspender a basal, mesmo em jejum; cetonemia >0,6 medir a cada 1–2 h, PS se >1,5 persistente',
  'Rastrear tireoidiana autoimune no diagnóstico e anualmente (TSH + anti-TPO); celíaca na criança no dx, 2º e 5º ano',
  'Bulimia é o transtorno alimentar mais comum no DM1 (até 30% das mulheres) — a purga inclui não aplicar insulina',
  'Anorexia: amenorreia não é critério obrigatório; gravidade pelo IMC, grave se <15',
  'Hipoglicemia de repetição no DM1: procurar hiperbasalização (basal >50–60% ou >0,5 UI/kg/dia), lipodistrofia, gastroparesia e anti-insulina',
  'Bomba sem sensor: ajustar a relação insulina:carboidrato — reduzir o tempo de insulina ativa AUMENTA a hipoglicemia',
];

const P2 = [
  'Icodeca (Awiqli): 7× a dose diária semanal; na 1ª semana 1,5× a dose diária × 7',
  'Icodeca titula ±20% conforme jejum <80 ou >130; nos ONWARDS foi tão eficaz quanto os análogos longos, mas com mais hipoglicemia no DM1',
  'Troca de basal: saindo de glargina 300 ou degludeca para glargina 100, detemir ou NPH, reduzir 20%; glargina 100 → 300 não ajusta',
  'NPH ⇄ análogo longo: reduzir 20% da dose total nos dois sentidos',
  'Ao misturar, aspirar PRIMEIRO a regular/ultrarrápida; só seringa com agulha fixa permite misturar; nunca misturar análogo longo com rápida',
  'Se aspirou dose maior que a soma, descartar a seringa inteira e recomeçar — não devolver ao frasco',
  'Homogeneizar a NPH com 20 movimentos suaves; caneta é preferível à seringa (menos hipoglicemia, maior ↓HbA1c)',
  'Armazenamento: lacrada 2–8 °C até a validade; aberta até 30 °C, fora do sol, por 30–45 dias conforme o fabricante',
  'Falta de NPH/regular (SBD): trocar por análogos; glulisina só dilui em SF; lispro tem estabilidade de até 48 h',
  'CAD leve a moderada (pH 7,1–7,3, bicarbonato 10–18) pode ser manejada com insulina subcutânea',
];

const NOVOS1 = [
  'Estágios do DM1 (SBD 2025)', 'IIa** valores próximos do normal', 'DM1 de longa data',
  'Critérios glicêmicos do estágio 2', 'Variação da HbA1c | >10%',
  'Critérios glicêmicos do estágio 3', 'Glicemia aleatória **com sintomas**',
  'não há dados suficientes para recomendar rastreamento universal', 'teplizumabe',
  '2–4\n> anos', 'Anti-GAD', 'Anti-IA2', 'Anti-ZnT8', 'Anti-ilhota (ICA)',
  'repetir a dosagem em 3 meses', 'anti-CD3', '56%', '28%',
  'Contagem de carboidratos', 'bolus **quadrado**', 'baixo índice glicêmico',
  '150 min/semana', 'Valsalva', 'resistido ↑glicemia', '0,5–1,0 g/kg/hora',
  '25–75%', 'basal em 30%, 90 min antes',
  '50% basal / 50% bolus', '0,4–1,0 UI/kg/dia', 'MARD',
  'FS = 1800 / DTD', '2100/DTD', '(370−100)/45', '1:15',
  'DTD do MDI **× 80%**', '40% basal / 60%', 'criança <7 anos', '0,5 UI** em criança',
  '>250 mg/dL', 'cetonemia >1,5', 'Nunca suspender a basal',
  'anti-TPO', 'Antitransglutaminase IgA', 'Anticélula parietal', 'Cortisol sérico basal',
  'Anorexia nervosa', 'Bulimia nervosa', 'Lisdexanfetamina', 'Amenorreia não é critério obrigatório',
  'Pseudo-hipoglicemia', 'Hiperbasalização', 'Gastroparesia diabética',
  'Pegadinhas de prova', 'TEEM 2025, q. 36', 'TEEM 2024, q. 47', 'TEEM 2025, q. 100',
];

const NOVOS2 = [
  'icodeca (Awiqli 700 UI/mL)', 'ONWARDS', '1,5× a dose diária × 7',
  'Troca entre insulinas basais', 'Glargina 100 | Glargina 300 | **Sem ajuste**',
  'Não reutilizar agulhas', 'aspirar **primeiro a regular/',
  'Nunca misturar análogo de longa duração', '20 movimentos suaves',
  '2–8 °C', '30–45 dias',
  'Preparo da mistura NPH', 'descarta-se a seringa inteira',
  'posicionamento SBD, 2024/2025', 'Glulisina só dilui em SF', '48 h',
  'pH 7,1–7,3', 'hipercalemia grave',
];

const PRES1 = ['## Conceito', '## Estágios (história natural)', '## LADA (diabetes autoimune latente do adulto)', '## Diagnóstico e diferenciação do DM2', '## Tratamento', A1];
const PRES2 = ['## Tipos de insulina (perfil de ação)', '## Quando iniciar', '## Esquemas', '## Fenômenos glicêmicos e ajustes', '## Titulação e segurança', A2];

let erros = [];
for (const n of NOVOS1) if (!B1.includes(n)) erros.push('B1 NOVO ausente: ' + JSON.stringify(n));
for (const n of NOVOS2) if (!B2.includes(n)) erros.push('B2 NOVO ausente: ' + JSON.stringify(n));
if (!B1.endsWith(A1)) erros.push('B1 não termina na âncora');
if (!B2.endsWith(A2)) erros.push('B2 não termina na âncora');
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }

const q = (t, s) => '$' + t + '$' + s + '$' + t + '$';
const ramo = (tema, anc, blk, pts, fonte, tag) => `      when d->>'tema' = ${q(tag + 'T', tema)} then
        jsonb_set(
          jsonb_set(d, '{resumo}', to_jsonb(replace(d->>'resumo', ${q(tag + 'A', anc)}, ${q(tag + 'B', blk)}))),
          '{pts}', (d->'pts') || ${q(tag + 'P', JSON.stringify(pts))}::jsonb
        ) || ${q(tag + 'F', JSON.stringify({ fonte }))}::jsonb`;

const F = 'Síntese Endodirect · EndoTEEM 2026 (Diabetes tipo 1: diagnóstico e tratamento) + SBD 2025';
const sql = `-- EndoTEEM 2026 · DM1 -> Diabetes Tipo 1 e LADA + Insulinoterapia
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case
      when d->>'sub' <> 'Diabetes' or coalesce(d->>'privado','') <> 'true' then d
${ramo('Diabetes Tipo 1 e LADA', A1, B1, P1, F, 'um')}
${ramo('Insulinoterapia', A2, B2, P2, F, 'do')}
      else d
    end order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';
`;
fs.writeFileSync(__dirname + '/dm1.sql', sql);
console.log('OK · B1 %d chars/%d pts · B2 %d chars/%d pts · guards %d+%d',
  B1.length, P1.length, B2.length, P2.length, NOVOS1.length, NOVOS2.length);
console.log(JSON.stringify({ PRES1, PRES2 }));
