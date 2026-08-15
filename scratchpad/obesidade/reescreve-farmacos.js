// Reescrita do capítulo "Ganho de Peso Induzido por Fármacos" no registro formal/técnico
// fixado no cofre em 2026-07-28 ("Evite termos genéricos de IA. Deixe linguagem sempre
// formal e técnica"), a pedido do professor em 2026-08-13 ("Muita linguagem de IA").
//
// ⚠️ CORREÇÃO DE CONTEÚDO EMBUTIDA. O texto tinha "**Reduzem peso:** , agonistas do
// receptor de GLP-1 e inibidores do SGLT2 — as três classes preferenciais": vírgula
// órfã e "três" listando duas. O item perdido é METFORMINA — o ponto-chave 4 do próprio
// capítulo diz "Preferenciais: metformina, AR GLP-1 e iSGLT2". A metformina segue na
// lista de neutros, que é a classificação dela; a frase agora concilia as duas coisas
// em vez de contradizê-las.
//
// NÃO se mexe em: dados numéricos, {barra:...}, títulos de seção (⚠️ "Armadilhas de
// prova" é seção padrão em 15 capítulos), flashcards, mapa e fluxograma.
const fs = require('fs');
const path = require('path');

const TEMA = 'Ganho de Peso Induzido por Fármacos';
const SUB = 'Obesidade';

const resumo = `## Conceito central

O ganho de peso induzido por fármacos constitui causa evitável de obesidade. Antes de instituir tratamento dirigido ao peso, impõe-se revisar a prescrição em curso, identificar os agentes com efeito ponderal desfavorável e verificar a existência de alternativa neutra — ou redutora de peso — com eficácia equivalente para a doença de base.

Os mecanismos são quatro: aumento da ingestão alimentar (antipsicóticos, corticoides), redução do gasto energético (betabloqueadores), redução da perda energética (menor glicosúria com o controle da hiperglicemia) ou associação entre eles.

**O efeito ponderal depende da duração do tratamento.** Determinados fármacos reduzem o peso em uso inferior a 1 ano e o aumentam em uso superior a 1 ano, comportamento descrito para os ISRS. A avaliação restrita a 12 semanas não prediz o efeito em uso prolongado.

## Regras de decisão

- **Decisão compartilhada:** informar o potencial de ganho ponderal antes do início e definir a conduta em conjunto com o paciente.
- **Não suspender medicação essencial** sem discussão com o médico prescritor.
- **Na ausência de alternativa aceitável**, empregar a menor dose eficaz, o que reduz ou minimiza o ganho.
- **Aferir o peso e calcular o IMC em todas as consultas.**

## Antidiabéticos

**Associados a ganho ponderal:** insulina, sulfonilureias e demais secretagogos, e glitazonas — o ganho pode alcançar **10 kg**. Com insulina, a magnitude acompanha a dose diária e a insulinemia média; com sulfonilureia, decorre do aumento da secreção de insulina.

**Neutros:** metformina, inibidores da DPP-4, inibidores da α-glicosidase (acarbose, miglitol) e pramlintida. Em comparação direta, a associação de inibidor da DPP-4 com metformina resultou em **−1,4 kg**, contra **+3,0 kg** com pioglitazona.

**Preferenciais no algoritmo AACE/ACE para o DM2:** metformina, agonistas do receptor de GLP-1 e inibidores do SGLT2. Os agonistas do receptor de GLP-1 e os inibidores do SGLT2 reduzem o peso — os iSGLT2 em até **4,7 kg**, por perda calórica decorrente da glicosúria —, ao passo que a metformina é neutra ou determina redução discreta.

- **Semaglutida** 1,0 mg semanal (dose para DM2) reduziu cerca de **7%** do peso em portadores de DM2 com IMC ≥ 27; a dose de 2,0 mg produz redução maior. É superior a exenatida e a dulaglutida; a formulação **oral, 14 mg/dia**, superou liraglutida 1,8 mg/dia.
- **Tirzepatida** (agonista duplo GIP/GLP-1) reduziu de **11% a 13%** em ensaios de DM2 e superou semaglutida 1,0 mg nas três doses semanais avaliadas (5, 10 e 15 mg). Em portadores de **obesidade sem DM2**, a redução alcançou **20,9%** com 15 mg semanais.
- Doses aprovadas para **obesidade**: liraglutida 3,0 mg/dia, semaglutida 2,4 mg/semana e tirzepatida 5, 10 ou 15 mg/semana.

## Anti-hipertensivos

Os **betabloqueadores tradicionais** reduzem a taxa metabólica em até **10%**. Em análise de oito ensaios randomizados em hipertensão, a diferença mediana de peso foi de **1,2 kg** a mais no grupo tratado com betabloqueador.

**O comportamento não é uniforme na classe:** os agentes com componente vasodilatador — **carvedilol** e **nebivolol** — associam-se a menor ganho ponderal e a menor repercussão sobre a glicemia e o perfil lipídico. Em comparação direta, o carvedilol não se associou a ganho significativo, ao contrário do metoprolol tartarato.

**Sem ganho ponderal e sem piora da resistência insulínica:** IECA, BRA e bloqueadores dos canais de cálcio. A angiotensina encontra-se superexpressa na obesidade e contribui diretamente para a hipertensão associada, o que fundamenta o emprego do IECA. **A Endocrine Society recomenda IECA, BRA ou BCC, em vez de betabloqueador, como primeira linha em portadores de DM2 e obesidade.**

Entre os **alfabloqueadores**, prazosina, doxazosina e terazosina associam-se a ganho ponderal.

## Anticonvulsivantes

**Associados a ganho ponderal:** ácido valproico, gabapentina, pregabalina e vigabatrina. O valproato apresenta a maior magnitude — **47% dos adultos** ganharam mais de **10% do peso basal** em uso prolongado. A **carbamazepina** também se associa a ganho, de magnitude inferior à do valproato e à da gabapentina, sendo por vezes classificada como neutra.

**Neutros:** lamotrigina, levetiracetam e fenitoína.

**Redutores de peso:** topiramato — sobretudo no **primeiro ano** de uso e em portadores de sobrepeso ou obesidade —, zonisamida e felbamato. O topiramato constitui, portanto, alternativa nessa população, preservada a **eficácia antiepiléptica**, que permanece como critério primário de escolha.

## Contraceptivos, hormônios e corticoides

- **Acetato de medroxiprogesterona de depósito:** ganho de **0,63 a 8,04 kg** em 1 ano, progressivo com a manutenção do uso. Ganho superior a **5% em 6 meses** identifica as pacientes que manterão o ganho.
- **Acetato de megestrol:** associa-se a ganho ponderal, sendo empregado com essa finalidade em doenças consumptivas.
- **Contraceptivo oral combinado:** evidência **conflitante**. A revisão Cochrane de 2011, com 49 ensaios, concluiu que os dados são **insuficientes** para estabelecer efeito sobre o peso. Ainda assim, em IMC > 27 com comorbidade ou > 30, a Endocrine Society sugere **métodos de barreira ou DIU não hormonal** em preferência aos métodos hormonais associados a ganho.
- **Terapia hormonal da menopausa:** o ganho ponderal **não constitui achado consistente**, e a distinção entre o efeito do fármaco e o da própria menopausa sobre a composição corporal e o gasto energético é limitada.
- **Corticoides sistêmicos:** retenção hídrica e ganho ponderal; a associação também é descrita para as formulações **inalatórias**. Na artrite reumatoide, preferir AINE e DMARD quando possível — a leflunomida associou-se a **perda** de peso em 6 meses.

## Psicotrópicos

O efeito dos **antidepressivos** é heterogêneo e depende do tempo de uso. **Tricíclicos e IMAO** associam-se a ganho ponderal significativo — de **0,57 kg a cerca de 1,4 kg por mês** de tratamento. Entre os ISRS, a **paroxetina** associa-se a ganho; **fluoxetina e sertralina** reduzem o peso em uso inferior a 1 ano e o aumentam em uso superior a 1 ano. A **bupropiona** é neutra e pode ser considerada nesse contexto, com a ressalva do maior risco de ansiedade e de agravamento de algumas formas de depressão. A **mirtazapina** associa-se a ganho.

**Antipsicóticos** — proporção de pacientes com ganho superior a **7% do peso basal**:

{barra: Olanzapina: 30%; Quetiapina: 16%; Risperidona: 14%; Perfenazina: 12%; Ziprasidona: 7%}

**Clozapina e olanzapina** apresentam a maior magnitude de ganho. Quando clinicamente viável, **ziprasidona e aripiprazol** constituem as alternativas mais neutras. Entre os estabilizadores do humor, o **lítio** associa-se a ganho e o **topiramato**, a redução.

## Outros

- **Anti-histamínicos H1:** a histamina reduz a ingestão alimentar, e seu antagonismo estimula o apetite; o efeito parece **proporcional à potência** do agente. Cetirizina, fexofenadina e desloratadina estimulam o apetite; difenidramina, hidroxizina e ciproeptadina associam-se a ganho ponderal. Os usuários apresentam peso, circunferência abdominal e insulinemia superiores aos dos não usuários. Preferir os agentes de **menor potência e menor penetração central**; a loratadina constitui a opção mais neutra.
- **Antirretrovirais e inibidores de protease:** alteram a **distribuição** da gordura corporal; em série de pequeno porte, o ganho médio foi de cerca de **8,6 kg em 6 meses**.

## Armadilhas de prova

- **A substituição entre betabloqueadores tradicionais não altera o perfil ponderal**; a troca de metoprolol por carvedilol ou nebivolol modifica o perfil metabólico.
- **O efeito de curto prazo não prediz o de longo prazo:** ISRS que reduz o peso em 6 meses pode aumentá-lo após 1 ano.
- A **carbamazepina** é a alternativa incorreta na questão sobre o antiepiléptico de maior ganho ponderal; o valproato apresenta a maior magnitude (47% com ganho superior a 10%).
- O **contraceptivo oral combinado** não tem efeito estabelecido sobre o peso; o ganho documentado corresponde ao **progestágeno injetável de depósito**.
- **Não suspender medicação essencial** em razão do peso sem discussão com o prescritor.`;

const pts = [
  'O ganho de peso induzido por fármacos é causa evitável de obesidade; revisar a prescrição em curso antes de instituir tratamento dirigido ao peso.',
  'São quatro os mecanismos: aumento da ingestão, redução do gasto energético, redução da perda energética ou associação entre eles.',
  'O efeito ponderal depende da duração do tratamento: determinados fármacos reduzem o peso em uso inferior a 1 ano e o aumentam em uso superior a 1 ano (ISRS).',
  'Antidiabéticos associados a ganho: insulina, sulfonilureia e glitazona (até 10 kg). Preferenciais no algoritmo AACE/ACE: metformina, AR GLP-1 e iSGLT2.',
  'A tirzepatida alcançou 20,9% de redução em obesidade sem DM2 (15 mg/semana); a semaglutida 1,0 mg reduziu cerca de 7% em DM2.',
  'O betabloqueador reduz a taxa metabólica em até 10% (diferença mediana de 1,2 kg); carvedilol e nebivolol constituem as exceções.',
  'Em DM2 com obesidade, a Endocrine Society recomenda IECA, BRA ou BCC, em vez de betabloqueador, como primeira linha.',
  'O valproato é o antiepiléptico de maior ganho ponderal: 47% dos adultos ganharam mais de 10% do peso basal; o topiramato reduz o peso.',
  'Antipsicóticos, proporção com ganho superior a 7% do peso: olanzapina 30%, quetiapina 16%, risperidona 14%, perfenazina 12%, ziprasidona 7%.',
  'O contraceptivo oral combinado não tem efeito estabelecido sobre o peso (Cochrane 2011); o ganho documentado corresponde ao progestágeno injetável de depósito.',
];

const patch = JSON.stringify({ resumo: resumo, pts: pts });
if (patch.includes('$j$')) throw new Error('delimitador de dollar-quoting colide com o conteúdo');

const sql = `-- Reescrita formal/técnica de "${TEMA}" (${SUB}).
update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case when d->>'tema' = ${quote(TEMA)} and d->>'sub' = ${quote(SUB)}
         then d || $j$${patch}$j$::jsonb
         else d end
    order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';`;

function quote(s) { return "'" + s.replace(/'/g, "''") + "'"; }

fs.writeFileSync(path.join(__dirname, 'reescreve-farmacos.sql'), sql);
console.log('resumo: %d caracteres (antes: 7349)', resumo.length);
console.log('pts: %d itens', pts.length);
console.log('SQL gravado: %d bytes', sql.length);
