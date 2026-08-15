// Capítulo "Dieta e Exercício Físico na Obesidade" atualizado pela aula 9 do
// EndoTEEM 2026 ("Tratamento não farmacológico", 53 slides, design DAGnvtAbRFQ).
//
// Registro formal/técnico do cofre (2026-07-28). O que a aula acrescenta e o
// capítulo não tinha: metas calóricas por sexo, faixas de densidade energética,
// metas de macronutrientes, jejum intermitente e dieta vegetariana com suas
// carências, dieta cetogênica com o efeito sobre LDL, a POSIÇÃO DA ABESO contra
// low carb/cetogênica/baixo IG, os cortes da rotulagem frontal, as doses de
// exercício para perda × manutenção e as metas da ABESO 2021, incluindo passos.
//
// ⚠️ DOIS NÚMEROS DA AULA NÃO FORAM PROPAGADOS — ver relato ao professor:
//   1. No slide da dieta de baixa caloria: "Alta ingesta de proteínas: 1,5 a
//      2kg/semana". Proteína não se mede em kg/semana; 1,5–2 g/kg é a dose, e
//      1,5–2,5 kg/semana é a perda da VLCD no slide seguinte. Mantive 1,5–2 g/kg,
//      que já estava no capítulo.
//   2. No mesmo slide: "Perda de 15-25% em 4 meses" convive com "8% do peso
//      corporal total em 6 meses". Os dois não podem descrever a mesma dieta;
//      15–25% é magnitude de VLCD/cirurgia. Mantive os 8% em 6 meses.
const fs = require('fs');
const path = require('path');

const TEMA = 'Dieta e Exercício Físico na Obesidade';
const SUB = 'Obesidade';

const resumo = `## Pilares do tratamento

O tratamento não farmacológico assenta em três pilares — **dieta, exercício físico e terapia comportamental** —, aos quais se somam farmacoterapia e cirurgia quando indicadas. Nenhum substitui os demais.

## Terapia nutricional

**Meta calórica.** Déficit de **500–700 kcal/dia** em relação ao gasto estimado, o que corresponde a perda de **0,5–1 kg por semana**. Em valores absolutos, a ingestão situa-se em **1.200–1.500 kcal/dia para mulheres** e **1.500–1.800 kcal/dia para homens**.

**Densidade energética.** Energia disponível por unidade de peso do alimento. Alta: **4–9 kcal/g**; média: **1,5–4 kcal/g**; baixa: **0,7–1,5 kcal/g**. Recomenda-se manter a dieta abaixo de **1,25 kcal/g**. Alimentos ricos em água — frutas, legumes e verduras — têm baixa densidade; farinhas, grãos e óleos, alta. Valor calórico dos macronutrientes: **carboidrato e proteína 4 kcal/g, lipídio 9 kcal/g, álcool 7 kcal/g**.

**Macronutrientes.** Açúcar adicionado **< 10%** do valor energético total; gorduras **< 30%** (com predomínio de ômega-3), saturadas **< 10%** e trans **< 1%**; frutas **400 g/dia**; fibras **25 g/dia**. A potência sacietógena segue a ordem **proteína > carboidrato > gordura**.

**A dieta eficaz é a que produz déficit calórico e é sustentável.** A composição de macronutrientes tem peso menor que a redução total de energia, e pessoas com obesidade subestimam a própria ingestão em até 40%, o que fundamenta o automonitoramento.

### Estratégias dietéticas

**Baixa caloria (1.000–1.500 kcal/dia).** Perda aproximada de **8% do peso em 6 meses**, com déficit controlado de 0,5–1 kg por semana. É a estratégia de primeira linha, por ser nutricionalmente completa e sustentável, e melhora glicemia, insulinemia e triglicerídeos. Efeitos adversos: constipação, queda de cabelo, elevação do ácido úrico e do LDL, litíase biliar e distúrbios hidroeletrolíticos.

**Muito baixa caloria (VLCD, < 800 kcal/dia).** Perda de **1,5–2,5 kg por semana**, por **12–16 semanas**, com proteína de alto valor biológico **1,5–2 g/kg**, reposição de eletrólitos e micronutrientes e supervisão médica. Reduz pressão arterial, colesterol total, LDL, triglicerídeos e glicemia. **A perda no longo prazo é semelhante à da dieta de baixa caloria**, com reganho subsequente. Efeitos adversos: cefaleia, tontura, constipação, queda de cabelo, depleção de volume e colelitíase.
- **Contraindicações:** IMC < 30 (perda desproporcional de massa magra), transtorno alimentar, idosos, DM1, doença sistêmica (insuficiência cardíaca, doença renal crônica, hepatopatia, doença psiquiátrica) e colecistite ou litíase biliar.

**Jejum intermitente.** Modalidades: tempo-restrita (**16–18 h de jejum diário**), dia-restritiva (**5:2**) e dias alternados. Produz perda de **3–8% em 12 semanas** e reduz pressão arterial, LDL, triglicerídeos, esteato-hepatite e resistência insulínica. **Não se mostrou superior à restrição calórica contínua em 12 meses.** Limitações: risco de hipoglicemia em DM1 e DM2, fadiga, irritabilidade e baixa adesão no longo prazo.
- **Contraindicações:** gestação e lactação, crianças e adolescentes, deficiências nutricionais, transtorno alimentar e doença renal ou hepática crônica.

**Vegetariana e vegana.** Ricas em fibras, antioxidantes e gorduras insaturadas; reduzem pressão arterial e LDL, têm menor densidade energética e associam-se a menor risco de câncer colorretal e de doenças crônicas. **Carências a monitorar: vitamina B12, ferro, zinco, cálcio e ômega-3**, com risco de osteopenia e de aporte incompleto de aminoácidos essenciais. Exigem planejamento alimentar e atenção ao consumo de substitutos ultraprocessados. Precaução em gestação e lactação, crianças e adolescentes, idosos e portadores de anemia ferropriva ou osteoporose.

**Cetogênica.** Alto teor de gordura (**~70%**) e razão gordura : (carboidrato + proteína) **> 3:1**, com corpos cetônicos como fonte energética. Melhora a sensibilidade à insulina, aumenta a lipólise visceral e o gasto energético, eleva o HDL e reduz os triglicerídeos. Em contrapartida, **eleva o LDL**, determina perda de massa magra, baixo aporte de vitaminas hidrossolúveis e discreta elevação do sódio, e **a perda não se sustenta em 24 meses**. Cautela em DM1, distúrbio hidroeletrolítico e doença arterial coronariana.

### Posicionamento da ABESO (2022)

- **Recomendados:** aumento de frutas, verduras e legumes; redução de *fast-food* e de bebidas açucaradas; **padrão mediterrâneo**; dietas de baixa e de muito baixa caloria em situações específicas.
- **Não recomendados como estratégia:** **dieta low carb, cetogênica e de baixo índice glicêmico**, bem como suplementos e adoçantes com finalidade de perda de peso.
- O café da manhã é indicado, com efeito neutro sobre o peso.

⚠️ Há distinção entre **eficácia** e **recomendação**: com déficit calórico equivalente, os padrões alimentares produzem perda semelhante, mas a ABESO não os endossa como estratégia. A cobrança em prova costuma incidir sobre a recomendação.

### Rotulagem nutricional frontal

| Conteúdo | Sólidos e semissólidos | Líquidos |
| --- | --- | --- |
| Açúcar adicionado | ≥ 15 g/100 g | ≥ 7,5 g/100 g |
| Gordura saturada | ≥ 6 g/100 g | ≥ 3 g/100 g |
| Sódio | ≥ 600 mg/100 g | ≥ 300 mg/100 g |

## Exercício físico

**Atividade física** é o movimento espontâneo que eleva o gasto energético acima do basal; **exercício físico** é a atividade planejada, repetitiva e estruturada, definida por frequência, duração e intensidade.

**Dose.** Para **manutenção** do peso perdido, **150–200 min/semana**; para **perda de peso**, **300–420 min/semana**, equivalentes a 1.000–1.200 kcal semanais.

**Magnitude do efeito.** Isoladamente, o exercício produz redução modesta (**−1,6 kg**), e cerca de **−2 kg** quando adicionado à dieta. **A combinação de aeróbico com resistido é a mais eficaz** na redução do peso e do percentual de gordura.

**Benefícios independentes da perda de peso:** prevenção do reganho, melhora da resistência insulínica com redução da gordura visceral, redução da pressão arterial e **atenuação da perda de massa magra durante o tratamento farmacológico** — item de relevância crescente com os agonistas do receptor de GLP-1.

**Fisiologia.** O exercício eleva o **PGC-1α** no músculo esquelético, com aumento de **irisina** e da **UCP-1** e ativação da **AMPK**, promovendo a conversão de adipócito branco em bege (efeito *browning*).

| Modalidade | Substrato | Efeito principal |
| --- | --- | --- |
| Aeróbico | Estoques de gordura | Perda de 2–3 kg, sobretudo de gordura visceral; 30–60 min, 3–5×/semana |
| Resistido | Glicogênio | Ganho e manutenção de massa magra; −5,3 kg de massa gorda e −3,8% de gordura |
| HIIT | Misto | Estímulo > 80% da FC máxima com recuperação; ↑ lipólise e termogênese |
| Combinado | — | Maior eficácia na redução de peso e de gordura corporal |

O **treino resistido** reduz TNF-α, IL-1 e proteína C reativa, eleva a taxa metabólica de repouso e a sensibilidade à insulina, aumenta o HDL e reduz o LDL. O **HIIT** reduz glicemia de jejum, HbA1c, circunferência da cintura, IMC, pressão arterial e triglicerídeos.

### Recomendações da ABESO (2021)

- **150–300 min/semana** de atividade moderada, ou **75 min** de atividade vigorosa. Crianças: **60 min/dia** de atividade moderada.
- **Aeróbico:** mais de 150 min/semana em adultos e **250–300 min/semana** em sobrepeso ou obesidade, em intensidade moderada.
- **Resistido:** **2–3 vezes por semana**, com 2–3 séries de 10–12 repetições.
- **Contagem de passos:** 12.000 em crianças e adolescentes, **10.000 em adultos** e 7.000 em idosos.

## Terapia comportamental

Automonitoramento do peso e da ingestão; metas claras e realistas; controle de estímulos, com redução da exposição aos fatores que desencadeiam ingestão inadequada; reforço positivo; entrevista motivacional; aconselhamento psicológico; e prevenção de recaída. **A abordagem deve ser adaptada ao contexto étnico, cultural, socioeconômico e educacional do paciente.**

O reganho é fenômeno fisiológico, decorrente de adaptação metabólica somada a elevação da grelina e redução de leptina, GLP-1 e PYY. A obesidade é doença crônica e exige acompanhamento prolongado, com escalonamento para farmacoterapia ou cirurgia quando indicado.

## Armadilhas de prova

- **A composição de macronutrientes não supera a redução total de energia.** A dieta com restrição de carboidratos é mais eficaz no curto prazo, porém equivale às demais no longo prazo quando a ingestão calórica é semelhante.
- **A dieta muito baixa caloria cursa com depleção de volume, distúrbio eletrolítico e elevação do ácido úrico** — e não com melhora pressórica atribuível a ganho de sensibilidade insulínica.
- **O jejum intermitente equivale à restrição calórica contínua** na perda de peso em 12 meses; a diferença alegada está em marcadores inflamatórios e de estresse oxidativo, não na magnitude da perda.
- **A dieta cetogênica eleva o LDL**, ainda que aumente o HDL e reduza os triglicerídeos — o oposto do que a melhora dos demais parâmetros sugere.
- **Entre as medidas com evidência favorável em ensaios randomizados, a ABESO destaca o aumento de frutas, verduras e legumes**; adoçantes, probióticos e alimentos de baixo índice glicêmico não têm esse respaldo.
- **No efeito *browning*, a sequência é PGC-1α → irisina → UCP-1 → termogênese**, com conversão de adipócito branco em bege — não formação de gordura marrom dentro do músculo esquelético.`;

const pts = [
  'Déficit de 500–700 kcal/dia produz perda de 0,5–1 kg por semana; a ingestão fica em 1.200–1.500 kcal/dia nas mulheres e 1.500–1.800 kcal/dia nos homens.',
  'Densidade energética recomendada abaixo de 1,25 kcal/g; a potência sacietógena segue a ordem proteína > carboidrato > gordura.',
  'A dieta eficaz é a que produz déficit calórico e é sustentável; pessoas com obesidade subestimam a própria ingestão em até 40%.',
  'VLCD (< 800 kcal): 1,5–2,5 kg por semana durante 12–16 semanas, contraindicada com IMC < 30; a perda no longo prazo iguala a da dieta de baixa caloria.',
  'O jejum intermitente reduz 3–8% em 12 semanas, mas não supera a restrição calórica contínua em 12 meses.',
  'A dieta cetogênica eleva o HDL e reduz os triglicerídeos, porém eleva o LDL e determina perda de massa magra, sem sustentação em 24 meses.',
  'A ABESO 2022 preconiza o padrão mediterrâneo e não recomenda low carb, cetogênica, baixo índice glicêmico, suplementos ou adoçantes para perda de peso.',
  'Exercício: 150–200 min/semana para manutenção e 300–420 min/semana para perda; isolado reduz 1,6 kg e cerca de 2 kg somado à dieta.',
  'O treino resistido preserva massa magra e atenua sua perda durante o tratamento farmacológico; a combinação com aeróbico é a mais eficaz.',
  'ABESO 2021: 150–300 min/semana de atividade moderada, resistido 2–3×/semana em 2–3 séries de 10–12 repetições, e 10.000 passos/dia no adulto.',
];

const patch = JSON.stringify({
  resumo: resumo,
  pts: pts,
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (aula 9) + ABESO 2021/2022',
});
if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo');

const q = (s) => "'" + s.replace(/'/g, "''") + "'";
const sql = `-- "${TEMA}" (${SUB}) atualizado pela aula 9 do EndoTEEM 2026.
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case when d->>'tema' = ${q(TEMA)} and d->>'sub' = ${q(SUB)}
         then d || $j$${patch}$j$::jsonb
         else d end
    order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';`;

fs.writeFileSync(path.join(__dirname, 'obesidade-09.sql'), sql);
console.log('resumo: %d caracteres (antes: 4208)', resumo.length);
console.log('pts: %d', pts.length);

// Guarda: números da aula que TÊM de aparecer no capítulo.
const obrigatorios = ['500–700', '1.200–1.500', '1.500–1.800', '1,25 kcal/g', '4–9 kcal/g',
  '3–8%', '12 meses', '1,5–2,5 kg', '12–16 semanas', '150–200 min', '300–420 min',
  '−1,6 kg', '−5,3 kg', '−3,8%', '150–300 min', '10.000', '400 g/dia', '25 g/dia'];
const faltando = obrigatorios.filter((n) => !resumo.includes(n));
if (faltando.length) { console.error('⚠️ dados da aula ausentes: ' + faltando.join(' | ')); process.exit(1); }
console.log('✓ os %d dados-chave da aula estão no capítulo', obrigatorios.length);
