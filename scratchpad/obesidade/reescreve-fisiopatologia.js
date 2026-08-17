// Reescreve "Fisiopatologia da Obesidade" no registro formal/técnico.
//
// PEDIDO DO PROFESSOR (16/08/2026, apontando a tela): "Tá cheio de jargão de IA.
// Retire todos." Ele destacou com o mouse exatamente dois títulos:
//   · "Por que a conta fecha com tão pouco"
//   · "Termogênese adaptativa — por que reganhar é a regra"
//
// A REGRA JÁ EXISTE (cofre, 2026-07-28): "Evite termos genéricos de IA. Deixe
// linguagem sempre formal e técnica." A varredura de 13/08 aplicou isso em
// "Ganho de Peso Induzido por Fármacos" — é a CALIBRAÇÃO aprovada, e foi medida
// antes de escrever aqui: aquele capítulo tem ZERO ⚠️, títulos nominais
// ("Conceito central", "Regras de decisão") e conectivos formais ("impõe-se",
// "decorre de", "ao passo que", "Em comparação direta").
//
// ⚠️ A MEDIÇÃO MOSTRA QUE O DEFEITO TEM ENDEREÇO: os três capítulos que a
// propagação do EndoTEEM 2026 engordou são os TRÊS PRIMEIROS em densidade de ⚠️
// da área Obesidade (Comorbidades 2,25/mil · Fisiopatologia 1,76/mil · Avaliação
// Clínica 1,49/mil); o resto da base fica em ≤0,97 e a maioria em zero. Não é
// estilo da casa — é resíduo daquele lote.
//
// SÓ BANCO. Não toca index.html → sem bump de sw.js e sem CI.
'use strict';
const fs = require('fs');

// ── O TEXTO NOVO ────────────────────────────────────────────────────────────
const NOVO = `## Etiologia multifatorial

Interação entre fatores **ambientais** (ambiente obesogênico, sedentarismo, vida urbana, privação de sono, estresse crônico, **microbiota**), **endócrinos**, **perinatais** (programação fetal, diabetes gestacional, ganho de peso materno), **genéticos** (**herdabilidade 40–70%**, predominantemente poligênica) e **iatrogênicos** (glicocorticoides, antipsicóticos, antidepressivos, insulina/sulfonilureias, betabloqueadores, cessação do tabagismo). O peso corporal resulta da **interação gene–ambiente**.

## Balanço e gasto energético

- Componentes do gasto: **metabolismo basal 60–75%** + atividade física 15–30% + **termogênese alimentar ~10%**.
- O **principal determinante do gasto de repouso é a massa magra**; por isso a pessoa com obesidade tem gasto de repouso **absoluto maior** (mais massa magra e gorda), mas com a perda de peso ocorre **adaptação metabólica** (queda do gasto além do esperado), que dificulta a manutenção. Os **triglicerídeos do tecido adiposo (9,3 kcal/g)** são a maior reserva energética do organismo.
- Dinâmica adipocitária na perda de peso: curto prazo ↓ **tamanho** dos adipócitos (hipotrofia); médio/longo prazo ↓ predominantemente o **tamanho** (não o número). O número de adipócitos é relativamente fixo no adulto (baixo turnover), o que contribui para a tendência ao reganho.

{pizza: Metabolismo basal (60–75%) 70, Atividade física (15–30%) 20, Termogênese alimentar (~10%) 10}

## Microbiota e sono

- Pessoas com obesidade: **↑ Firmicutes / ↓ Bacteroidetes** (↑ razão F/B) e mais Gram-negativas → ↑ **LPS** (lipopolissacarídeo) → **endotoxemia metabólica** e inflamação crônica de baixo grau; maior extração calórica dos alimentos (o padrão **reverte com perda de peso** e é transmissível em modelos de transplante fecal).
- **Privação de sono:** ↓ **leptina** e TSH, ↑ **grelina**, ↓ tolerância à glicose e ↑ resistência insulínica; ↓ **melatonina** (que sensibiliza à insulina). O resultado é ↑ apetite (sobretudo por alimentos calóricos) e propensão ao ganho de peso.

## Controle hipotalâmico (núcleo arqueado)

- Neurônios orexígenos **NPY/AgRP** × anorexígenos **POMC/CART**, integrados pela **via melanocortina** (α-MSH → **MC4R**), eixo central do controle do peso.
- No estado **alimentado**: ↑ leptina e insulina → **JAK2/STAT3** ativa POMC/CART e inibe NPY/AgRP; leptina/insulina também sinalizam via **PI3K**. Na obesidade há **resistência à leptina** com ↑ de **SOCS3** e **PTP1B** (feedback negativo da sinalização), perpetuando a hiperfagia apesar de leptina elevada.

## Hormônios do apetite

- **Grelina** (células oxínticas do estômago): único hormônio periférico **orexígeno**; sobe no **pré-prandial** e cai após comer; a supressão pós-prandial é **reduzida na pessoa com obesidade**; concentração **inversa ao IMC** (exceção: **Prader-Willi**, com grelina alta).
- **CCK** (duodeno/jejuno; liberada por gordura e proteína), **PYY** (células L do íleo), **GLP-1** (células L, incretina), **amilina** (cossecretada com insulina, **1:100**): sinais de **saciedade** de curto prazo.
- **Leptina** (tecido adiposo): sinal de **adiposidade/saciedade** de longo prazo; maior em mulheres e na gordura subcutânea; há **resistência à leptina** na pessoa com obesidade.
- **Adiponectina** (produzida **só por adipócitos**): **sensibilizadora de insulina**, anti-inflamatória e antiaterogênica; paradoxalmente **↓ quanto maior a adiposidade** (mais gordura visceral).

## Tecido adiposo e resistência insulínica

- **Visceral** → maior resistência insulínica (mais lipólise, IL-6, TNF-α e **drenagem porta** de AGL para o fígado); **subcutâneo** (maior massa total; o abdominal tem alto turnover e o gluteofemoral é estocador/mais protetor); **ectópico** (deposição em fígado e músculo → ↑ **AGL** → **RI** e lipotoxicidade). O tecido adiposo é órgão **endócrino ativo**, secretor de adipocinas.

## Sistema endocanabinoide

- O receptor **CB1** é **anabolizante** (↑ apetite, lipogênese e resistência insulínica). O **rimonabanto** (antagonista CB1) chegou a ser aprovado, mas foi **retirado** por efeitos psiquiátricos (**depressão/ansiedade e risco de suicídio**).

## Inflamação e ponto de ajuste ponderal

- Na obesidade, o tecido adiposo hipertrofiado torna-se **inflamado** (infiltração de macrófagos M1, ↑ **TNF-α, IL-6, resistina**, ↓ adiponectina), gerando **inflamação crônica de baixo grau** que perpetua a resistência insulínica sistêmica.
- O peso corporal é defendido em torno de um **ponto de ajuste** (*set point*) por mecanismos neuroendócrinos (adaptação metabólica, ↑ grelina, ↓ leptina/gasto energético após emagrecer), o que explica a forte **tendência ao reganho** e o caráter **crônico e recidivante** da doença.

## 📊 Componentes do gasto energético total

| Componente | Fatia | Detalhe |
| --- | --- | --- |
| **Taxa metabólica em repouso** | **70%** | A maior parte do gasto diário; depende de idade, sexo, **composição corporal** e hormônios tireoidianos |
| **Termogênese induzida pela dieta** | **10%** | Energia da digestão, absorção e metabolismo — **proteínas 20 a 30%, carboidratos 5 a 10%, gorduras até 3%** |
| **Gasto por atividade física** | **20%** | **Componente de maior modificabilidade** do gasto total |

## Determinantes do gasto em repouso

A **composição corporal** é o principal determinante: quanto maior a massa muscular, maior a taxa metabólica. **O indivíduo com obesidade apresenta gasto de repouso absoluto MAIOR que o eutrófico**, por dispor de mais massa magra **e** mais massa gorda.

**Comportamento do adipócito na perda de peso:** a curto prazo há **redução de tamanho** (perda de triglicerídeo); a médio e longo prazo, redução de **tamanho e número**.

**Idade:** a taxa metabólica cai com a idade, pela perda gradual de massa muscular. **Sexo:** homens têm taxa maior, por maior massa muscular; as mulheres apresentam **maior frequência de ciclagem ponderal** que os homens.

Somam-se **hormônios** (T3 e T4, leptina, grelina), **fatores genéticos** e a **temperatura ambiente** — frio e calor extremos aumentam o gasto.

## Termogênese adaptativa

Após a perda de peso instalam-se, simultaneamente, redução do gasto e aumento da ingestão, ambos favorecendo o reganho:

**Redução do gasto energético**
- **Queda do gasto energético total de cerca de 300 a 400 kcal/dia** — e isso **mesmo após ajustar para o novo peso**.
- Declínio da taxa metabólica de repouso.
- **Aumento da eficiência muscular**, com menor custo energético para a mesma carga de trabalho.
- Declínio do gasto com atividade física.
- **Redução da oxidação de gordura.**

**Aumento da ingestão**
- **Aumento do consumo de cerca de 100 kcal/dia**, por **queda da leptina** e **aumento da grelina**.
- Somam-se sinais **não homeostáticos**: motivação, recompensa e atenção.

**Sistema neuroendócrino e autonômico:** queda da leptina, **redução da atividade do eixo hipotálamo-hipófise-tireoide** e **predomínio parassimpático**.

## 📊 Tecido adiposo — branco, marrom e bege

**Branco.** Principal armazenador de energia, com **única inclusão lipídica grande** e tecido **pouco vascularizado**. É órgão endócrino: produz **leptina e adiponectina**.

| **Visceral** | **Subcutâneo** |
| --- | --- |
| **Maior lipólise** | **Maior massa adiposa do indivíduo** |
| Mais inflamatório — **IL-6 e TNF-α** | **Maior produtor de leptina e adiponectina** |
| **Drenagem direta para a circulação porta** — é o que leva os ácidos graxos direto ao fígado | Adipócitos menores (**hiperplasia mais que hipertrofia**); o abdominal tem alta absorção de gordura dietética e alto *turnover* lipídico |

**Marrom.** Produz calor pela **UCP-1**. **Mais frequente em mulheres (2:1)**, representa apenas **0,05% do IMC** e é **altamente vascularizado**.
- **Ativadores:** **frio** (o principal, por via **noradrenérgica**), melanocortina (MC4), hormônio tireoidiano (via **D2**) e **irisina**.
- **Inibidores:** **IMC elevado**, idade avançada, calor e **betabloqueadores** — a captação no PET-FDG é, portanto, **inversamente** relacionada ao IMC.

**Bege.** Origina-se do tecido adiposo **branco**, e não do marrom. Estimulado por **frio, irisina, hormônio tireoidiano e FGF-21**, e **expressa UCP-1**, da qual depende sua termogênese.

## Magnitude do balanço energético positivo

**Um excesso calórico de 5% ao ano resulta em ganho de 5 kg de gordura.** O balanço positivo que produz obesidade é de pequena magnitude e longa duração, e não de excessos episódicos.

**Fatores que elevam a ingestão:** ácidos graxos livres induzem **resistência à leptina e à insulina**; alimentos ricos em gordura e açúcar têm **alta densidade calórica e baixa saciedade**; o **excesso de carboidratos reduz a eficiência na queima de gorduras**; e somam-se porções maiores, mais refeições fora de casa, privação de sono e maior acessibilidade a alimentos baratos.

**Alimentos de alta palatabilidade suprimem a regulação homeostática do apetite:** a saciedade é bloqueada e a ingestão passa a ser conduzida pelo componente hedônico.

## O sistema hedônico

O sabor é processado no **tronco encefálico** e transmitido ao hipotálamo. Com alimentos muito palatáveis, a sinalização é **redirecionada ao sistema de recompensa**: bloqueiam-se os peptídeos anorexígenos (leptina e insulina) e aumenta a expressão de orexígenos (grelina). Constitui o substrato do **ruído alimentar** (*food noise*) — pensamentos intrusivos e constantes sobre comida.

Três sistemas o compõem: **endocanabinoide, dopaminérgico e opioide**.

**Endocanabinoide.** Dois endocanabinoides principais e os receptores **CB1 e CB2**; são sintetizados a partir do **ácido araquidônico** e rapidamente inativados — a **anandamida** é um dos ligantes endógenos. A **grelina estimula o sistema endocanabinoide**, que por sua vez **inibe o sistema melanocortina**.
- **CB1** (sistema nervoso central e tecido adiposo): aumenta apetite e peso; promove **lipogênese** por aumento do PPAR-γ; **aumenta a resistência insulínica**; e **reduz a termogênese, inibindo o *browning* e a expressão de UCP-1**.
- **CB2**: sistema imunológico, com papel incerto no tecido adiposo.
- **Rimonabanto**, antagonista de CB1: perda média de **7 kg**, mas **aumento de depressão e ansiedade levou à suspensão da comercialização**.

**Dopaminérgico.** A dopamina é liberada em resposta a alimentos altamente palatáveis e reforça a repetição do comportamento. Age sobretudo no **núcleo accumbens**. A **grelina aumenta a dopamina no accumbens** e a **resistência à leptina reduz a inibição dopaminérgica** — duas vias de conexão entre o eixo homeostático e o hedônico.

**Opioide.** Endorfinas e encefalinas agem em **receptores μ-opioides**, também no accumbens, e **estimulam a liberação de dopamina** ali.

## Neuroinflamação hipotalâmica

Ocorre principalmente no **núcleo arqueado**, por estímulo crônico de carboidratos e **lipídeos saturados**. O resultado é a **perda de sensibilidade às vias anorexígenas**.

**Células envolvidas.** A **microglia**, ativada pelo excesso de nutrientes, secreta **TNF-α, IL-1β e IL-6**. Os **astrócitos** proliferam e formam uma **barreira glial** que reduz o contato dos neurônios POMC/CART com os vasos e com os hormônios circulantes, o que limita o acesso da leptina ao seu sítio de ação.

**Vias moleculares.** Ácidos graxos saturados ativam o **TLR4** → **NF-κB e JNK** → citocinas pró-inflamatórias → **inibição da via JAK/STAT da leptina** (resistência central à leptina) e da **via IRS/PI3K da insulina**.

**Consequências.** Hiperfagia, maior atividade dos neurônios **NPY/AgRP**, redução da termogênese por inibição do **MC4R** e agravamento da metainflamação sistêmica.

## Inflamação e imunidade do tecido adiposo

O **adipócito hipertrofiado** gera **hipóxia local, estresse oxidativo e apoptose**, o que recruta monócitos da circulação. Na obesidade ocorre a **transição de macrófagos M2 (anti-inflamatórios) para M1 (pró-inflamatórios)**, com aumento de **TNF-α, IL-6, IL-1β** e de **MCP-1** — que recruta monócitos adicionais e perpetua o processo. A ativação de **NF-κB e JNK** produz a resistência insulínica.

| Célula | Papel na obesidade |
| --- | --- |
| **T CD8+** | **Aumentam PRECOCEMENTE**, recrutando e ativando os macrófagos M1 |
| **T CD4+ Th1 e Th17** | Secretam **IFN-γ e IL-17**, reforçando a inflamação |
| **Treg (FoxP3+)** | **Reduzidos** — perde-se a ação anti-inflamatória |
| **Linfócitos B** | Secretam anticorpos e citocinas (IL-6, TNF-α) |
| **NK** | Elevam IFN-γ e recrutam macrófagos |
| **Mastócitos** | Histamina, triptase e citocinas pró-inflamatórias |

## Cronobiologia e privação de sono

A organização circadiana compreende um **relógio central** (núcleo supraquiasmático) e **relógios periféricos** (fígado, tecido adiposo, músculo), sincronizados pela **luz** (melatonina e cortisol) e pelo **horário das refeições**. Os **genes clock** regulam a expressão rítmica de enzimas metabólicas, hormônios e receptores de insulina.

A desorganização circadiana — trabalho noturno, *jet lag* social, refeições noturnas — dessincroniza o relógio central dos periféricos: **aumenta o cortisol noturno** (resistência insulínica), **reduz a melatonina** (altera insulina e leptina), **reduz a oxidação de ácidos graxos** (mais adipogênese) e altera a microbiota.

**A privação de sono produz balanço energético positivo, por efeito assimétrico sobre os dois lados da equação:** o gasto energético aumenta cerca de **100 kcal/dia**, ao passo que o consumo aumenta cerca de **250 kcal/dia**. Os mecanismos: **aumento da grelina**, **redução da leptina**, **redução do GLP-1**, **ativação do sistema endocanabinoide**, aumento do cortisol e da resistência insulínica, e queda do gasto com atividade física.

## Armazenamento e a AMPK

O estoque aumenta por **hiperplasia (número) e hipertrofia (tamanho)** dos adipócitos, com **maior atividade da lipase lipoproteica (LPL)**. **O triglicerídeo é a maior reserva energética do corpo: 9,3 kcal/g contra 4,1 kcal/g do glicogênio.**

**AMPK.** Quinase serina-treonina que regula o metabolismo por fosforilação de substratos. É ativada no **jejum** (glucagon → glicogenólise), pelo **exercício e pelo frio** (catecolaminas → lipólise) e pela **adiponectina** do tecido adiposo, que melhora a sensibilidade insulínica.

Na obesidade, a **falha da adiponectina em ativar a AMPK** no músculo e no tecido adiposo branco reduz a oxidação de ácidos graxos, com consequente acúmulo lipídico e resistência à insulina.

## Microbiota

| | **Composição normal** | **Na obesidade** |
| --- | --- | --- |
| **Firmicutes** (Lactobacillus, Enterococcus, Clostridium — gram-positivos) | **60%** | **Aumentam** |
| **Bacteroidetes** (gram-negativos, anaeróbios estritos) | **40%** | **Reduzem** |

O resultado é o **aumento da relação Firmicutes/Bacteroidetes**, com mais **LPS** e **aminoácidos de cadeia ramificada (BCAA)** circulantes — que estimulam **receptores toll-like** e produzem inflamação e resistência insulínica — e **redução dos ácidos graxos de cadeia curta**.

**Ácidos graxos de cadeia curta (butirato, propionato, acetato)** — componente protetor da microbiota, reduzido na obesidade:
- **estimulam GLP-1 e PYY**, aumentando a saciedade;
- **aumentam a secreção de insulina** ativando o **FFAR3** na célula beta;
- **modulam o tecido adiposo**, aumentando a termogênese e a diferenciação;
- ativam a **AMPK** → oxidação de ácidos graxos, mais sensibilidade insulínica e **mais UCP-1** → **maior gasto energético**.

## Ciclagem ponderal e memória epigenética

**Consequências do ciclo de perda e reganho:** aumento da inflamação do tecido adiposo, sobretudo visceral, e da resistência insulínica; **alterações persistentes na expressão gênica e epigenética**, com redução do metabolismo de repouso; e impacto psicológico — frustração, baixa autoestima e risco de transtorno alimentar.

**Memória epigenética da obesidade.** A obesidade altera os padrões de **metilação** do tecido adiposo, favorecendo lipogênese, inflamação e resistência insulínica — e **parte dessas alterações persiste após a perda de peso** (*Nature*, 2024), o que constitui substrato biológico do reganho.

**Programação metabólica precoce (hipótese de Barker).** A exposição intrauterina a ambiente nutricional adverso — **tanto desnutrição quanto obesidade materna** — gera adaptações epigenéticas que favorecem o armazenamento energético e aumentam o risco de obesidade e síndrome metabólica na vida adulta. Filhos de mães com obesidade ou diabetes gestacional têm **maior metilação em genes ligados à insulina**; a **restrição de crescimento intrauterino** produz o **fenótipo poupador**. Esses achados fundamentam a atenção **pré-concepcional** e à nutrição materna.

## 📊 Hormônios reguladores do apetite
| Hormônio | Origem | Efeito |
| --- | --- | --- |
| Grelina | Estômago (células oxínticas) | Orexígeno (fome) |
| Leptina | Tecido adiposo | Saciedade (resistência na obesidade) |
| Adiponectina | Adipócitos | Sensibiliza à insulina |
| GLP-1 | Células L (intestino) | Saciedade; ↑ insulina |
| PYY | Células L (íleo) | Saciedade |
| CCK | Duodeno/jejuno | Saciedade |
| Amilina | Célula β (com insulina) | Saciedade |`;

// ── GUARDAS ─────────────────────────────────────────────────────────────────
const VELHO = null; // a comparacao com o texto antigo roda NO SERVIDOR (conferencia.sql)
const erros = [];

// 1-3. ⚠️ CONSERVAÇÃO (números, termos, seções) roda NO SERVIDOR, contra a linha
//      viva — assim o texto antigo NUNCA passa por transcrição minha, que é onde
//      uma reescrita de estilo perderia conteúdo sem ninguém ver.

// 4. ⚠️ O ALVO: o jargão tem de ter SUMIDO. Calibrado em "Ganho de Peso
//    Induzido por Fármacos", que o professor aprovou em 13/08 e tem ZERO ⚠️.
const PROIBIDO = [
  ['⚠️', 'alerta dentro da prosa (o capítulo aprovado em 13/08 tem zero)'],
  ['a conta fecha', 'coloquialismo'],
  ['a conta é assimétrica', 'coloquialismo'],
  ['por que reganhar é a regra', 'título retórico — destacado pelo professor'],
  ['Por que a conta fecha', 'título retórico — destacado pelo professor'],
  ['Gasta menos', 'subtítulo coloquial'],
  ['Come mais', 'subtítulo coloquial'],
  ['senso comum', 'aforismo avaliativo'],
  ['força de vontade', 'aforismo avaliativo'],
  ['falha de disciplina', 'aforismo avaliativo'],
  ['simplesmente não chega', 'coloquialismo'],
  ['fechando o círculo', 'aforismo'],
  ['empurra a ingesta', 'coloquialismo'],
  ['cicladoras', 'coloquialismo entre aspas'],
  ['desligam', 'personificação do alimento'],
  ['dois lados ao mesmo tempo', 'coloquialismo'],
  ['passa a custar menos energia', 'coloquialismo'],
  ['Efeito sanfona', 'coloquialismo'],
  ['o braço protetor', 'metáfora'],
  ['daí o acúmulo', 'conectivo coloquial'],
  ['É o que justifica', 'conectivo coloquial'],
  ['mais controlável', 'adjetivo avaliativo'],
  ['É o contrário', 'aforismo'],
  ['não um exagero episódico', 'aforismo'],
];
PROIBIDO.forEach(([frag, motivo]) => {
  if (NOVO.includes(frag)) erros.push('JARGÃO QUE SOBREVIVEU: "' + frag + '" (' + motivo + ')');
});

// 5. o encolhimento (perda de conteúdo disfarçada de estilo) também é medido no
//    servidor, em conferencia.sql — aqui só o que dá para saber sem o texto antigo.

if (erros.length) {
  console.error('✗ NÃO GEREI O SQL:');
  erros.forEach((e) => console.error('   · ' + e));
  process.exit(1);
}

console.log('✓ ' + PROIBIDO.length + ' padroes de jargao conferidos no texto NOVO, 0 sobreviveram');
console.log('✓ novo: ' + NOVO.length + ' chars · ' + (NOVO.match(/^## .+$/gm)||[]).length + ' secoes · ' + (NOVO.match(/^## 📊 /gm)||[]).length + ' tabelas 📊 · ' + (NOVO.match(/^\|/gm)||[]).length + ' linhas de tabela');

// ── SQL ─────────────────────────────────────────────────────────────────────
// ⚠️ SNAPSHOT ANTES DE ESCREVER (regra do cofre desde o capítulo apagado pela aba
// aberta do professor): conteúdo não se sobrescreve sem backup.
const sql = `-- Fisiopatologia da Obesidade: registro formal/técnico (jargão de IA removido)
-- Pedido do professor em 16/08/2026: "Tá cheio de jargão de IA. Retire todos."
begin;

insert into endodirect_backup_diretriz (tema, snapshot, motivo)
select d->>'tema', d, 'antes da reescrita no registro formal (jargao de IA) 2026-08-16'
from endodirect_global_state, lateral jsonb_array_elements(payload->'diretrizes') d
where coalesce(d->>'privado','')='true' and d->>'tema'='Fisiopatologia da Obesidade' and d->>'sub'='Obesidade';

update endodirect_global_state
set payload = jsonb_set(payload, '{diretrizes}', (
  select jsonb_agg(
    case when coalesce(d->>'privado','')='true'
          and d->>'tema'='Fisiopatologia da Obesidade'
          and d->>'sub'='Obesidade'
         then jsonb_set(d, '{resumo}', to_jsonb($resumo$${NOVO}$resumo$::text))
         else d end)
  from jsonb_array_elements(payload->'diretrizes') d));

-- conferência no servidor, na mesma transação
select
  (select count(*) from jsonb_array_elements(payload->'diretrizes') d) as total_itens,
  (select count(*) from jsonb_array_elements(payload->'diretrizes') d
    where coalesce(d->>'privado','')<>'true') as publicas,
  (select length(d->>'resumo') from jsonb_array_elements(payload->'diretrizes') d
    where coalesce(d->>'privado','')='true' and d->>'tema'='Fisiopatologia da Obesidade') as chars_novo,
  (select (length(d->>'resumo')-length(replace(d->>'resumo','⚠️','')))/length('⚠️')
    from jsonb_array_elements(payload->'diretrizes') d
    where coalesce(d->>'privado','')='true' and d->>'tema'='Fisiopatologia da Obesidade') as alertas_restantes,
  (select jsonb_array_length(d->'pts') from jsonb_array_elements(payload->'diretrizes') d
    where coalesce(d->>'privado','')='true' and d->>'tema'='Fisiopatologia da Obesidade') as pts,
  (select jsonb_array_length(d->'flashcards') from jsonb_array_elements(payload->'diretrizes') d
    where coalesce(d->>'privado','')='true' and d->>'tema'='Fisiopatologia da Obesidade') as flashcards
from endodirect_global_state;

commit;
`;
fs.writeFileSync('/tmp/fisiopatologia.sql', sql);
console.log('\n→ SQL em /tmp/fisiopatologia.sql (' + sql.length + ' chars)');
