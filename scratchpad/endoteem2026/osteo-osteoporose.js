// Capítulo "Osteoporose: Diagnóstico e Tratamento" reescrito a partir das TRÊS
// aulas de Osteoporose do EndoTEEM 2026 (156 slides no total):
//   parte 1 — fisiopatologia e diagnóstico (DAG4nbqGa4o, 51 slides)
//   parte 2 — tratamento                   (DAG4naPGlK4, 53 slides)
//   parte 3 — complicações e populações    (DAG4nRTRNDU, 52 slides)
//
// O capítulo tinha 3.533 caracteres para um assunto que as aulas cobrem em 156
// slides — era o mais desproporcional de toda a área. Aqui ele é REESCRITO, não
// remendado, mas o guard exige que o que o capítulo já dizia de bom continue
// presente (osteoporose estabelecida, a ressalva da ACR 2022 sobre romosozumabe
// sob corticoide, os sítios extravertebrais que definem osteoporose com
// osteopenia associada).
//
// ⚠️ FORA DESTE CAPÍTULO, DE PROPÓSITO:
//   • o bloco de vitamina D da parte 1 vai para o capítulo próprio
//     ("Deficiência e Metabolismo da Vitamina D"), em script separado;
//   • "Osteoporose na pós-menopausa" e "Osteoporose induzida por glicocorticoide"
//     são DIRETRIZES PÚBLICAS (privado ausente), não capítulos da aba Resumos —
//     não são tocadas aqui. A duplicação com este capítulo já está sinalizada ao
//     professor junto com os casos de Lípides e Adrenal.
const fs = require('fs');
const path = require('path');

const TEMA = 'Osteoporose: Diagnóstico e Tratamento';
const SUB = 'Osteometabolismo';

const resumo = `## Conceito

Doença esquelética sistêmica com **redução da massa óssea** e **deterioração da microarquitetura**, resultando em **fragilidade** e maior risco de **fratura** — sobretudo vértebra, quadril, punho e úmero.

## Fisiologia óssea

**Osteoclasto — reabsorção.** Deriva de célula-tronco hematopoiética; diferencia-se em pré-osteoclasto e funde-se em célula gigante multinucleada. O fator de diferenciação é o **RANK-L**, produzido por osteoblastos e osteócitos, que recruta o **TRAF6**. Outros ativadores: TNF-α, IL-1, IL-6, IL-11, TGF-β, APRIL, BAFF, IGF-1 e IGF-2. A regulação negativa cabe à **osteoprotegerina (OPG)**, produzida pelo osteoblasto, que sequestra o RANK-L e impede sua ligação ao RANK.

**Osteoblasto — formação.** Origina-se de célula mesenquimal pluripotente (medula óssea, músculo, gordura). É regulado pela via **Wnt/β-catenina**: o Wnt liga-se ao receptor Frizzled e aos correceptores **LRP5/LRP6**, a β-catenina dissocia-se e ativa a transcrição gênica no núcleo, aumentando a expressão de OPG. **Esclerostina, DKK-1 e Sostdc** ligam-se ao LRP5/LRP6, induzem sua internalização e **inativam a via**. O osteoblasto também produz RANK-L — ou seja, é capaz de ativar o osteoclasto.

**Osteócito.** Principal componente celular da matriz óssea (**90–95%**), derivado do osteoblasto. Funciona como **mecanoceptor**: converte estímulo mecânico em sinal bioquímico (**PGE2 e óxido nítrico**, que ativam a via Wnt/β-catenina). Na **ausência de estímulo**, produz **esclerostina, DKK-1 e SFRP1**, inativando a via. Osteócitos e osteoblastos produzem ainda o **FGF-23**, principal regulador da fosfatemia: estimula fosfatúria pelos canais NaPi-IIa e NaPi-IIc do túbulo contorcido proximal e reduz a atividade da 1-α-hidroxilase (menos calcitriol).

## 📊 O que empurra para cada lado

| Formação | Reabsorção |
| --- | --- |
| Via Wnt/β-catenina | Eixo RANK/RANK-L |
| PGE2 e óxido nítrico | TNF-α, TGF-β, IL-1, IL-6, IL-11 |
| Estímulo mecânico do osteócito | Imobilidade |
| Osteoprotegerina (inibe RANK/RANK-L) | Esclerostina |
| Estrógeno (via OPG) e PTH **intermitente** | Glicocorticoide, PTH **contínuo**, 1,25-vitamina D (estimula RANK-L) |

## Densitometria óssea (DXA)

**Sítios.** Coluna lombar (osso **trabecular**), colo do fêmur e fêmur total (osso **cortical**) e **1/3 distal do rádio** (cortical) — este indicado em **hiperparatireoidismo** ou quando o peso excede o limite do aparelho (**136–159 kg**).

**Escores.** O **Z-score** compara com população de mesma idade, sexo e etnia — útil na avaliação de **causas secundárias**. O **T-score** compara com população jovem (20–40 anos) e é o que **estabelece o diagnóstico**.

**Cuidados na leitura.** Vértebra discrepante (**> 1 DP** de diferença das demais) deve ser **excluída** da avaliação; usar **sempre o mesmo aparelho** para comparação (Lunar, Hologic etc.); conferir a imagem e a ROI considerada.

**Variação mínima significativa (VMS).** É a menor variação de DMO clinicamente relevante com intervalo de confiança de 95%, calculada como **2,77 × coeficiente de variação** do serviço. Variações **dentro da VMS não são relevantes** — podem ser apenas erro de aferição. Em linhas gerais: **colo do fêmur ~6%**; **coluna lombar e fêmur total ~4,2%**.

**Rastreamento (SBEM).** Mulheres **> 65 anos**; homens **> 70 anos**; pós-menopausa **com fator de risco**; adultos com fator de risco (baixo peso, fratura prévia, medicações de alto risco ou comorbidades que reduzem massa óssea).

## Diagnóstico

**Mulheres na pós-menopausa e homens ≥ 50 anos**
- **T-score ≤ −2,5** em coluna lombar, colo do fêmur ou fêmur total; **ou**
- **fratura por fragilidade**, que estabelece o diagnóstico **independentemente do T-score** quando em quadril ou vértebra. Fraturas de outros sítios (úmero, punho, pelve) definem osteoporose quando há **osteopenia** associada.
- **Osteopenia:** T entre **−1,0 e −2,5**, sem fratura.

**Mulheres na pré-menopausa e homens < 50 anos**
- **Z-score < −2,0** = **baixa densidade óssea para a idade** — não é, por si, diagnóstico de osteoporose.
- Pelo critério da **IOF (2012)**, firma-se osteoporose com **T-score < −2,5 associado a fator de risco** ou com **fratura de fragilidade**.

## VFA e classificação de Genant

O **VFA (Vertebral Fracture Assessment)** é uma radiografia de perfil da coluna feita no próprio densitômetro, com **20 a 30 vezes menos radiação** que a radiografia lateral convencional. Indicado com **T-score < −1,0** associado a pelo menos um dos seguintes: mulher > 70 anos ou homem > 80 anos; **redução de altura > 4 cm**; relato de fratura vertebral prévia não documentada; corticoide **> 5 mg/dia de prednisona ou equivalente por > 3 meses**.

**Genant** gradua a fratura vertebral pela perda de altura do corpo vertebral: **grau 1** — 20 a 25%; **grau 2** — 25 a 40%; **grau 3** — acima de 40%.

## TBS e HR-pQCT

**TBS (Trabecular Bone Score).** Software que correlaciona a textura da imagem da DXA a um índice de microarquitetura. Complementa a avaliação nas situações em que a DMO **subestima** o comprometimento microarquitetural: **diabetes tipo 2, uso de glicocorticoide, doença renal crônica e hiperparatireoidismo**. Limitações: **não serve para monitorar tratamento** e **não se aplica a extremos de IMC** (< 15 ou > 37 kg/m²).

**HR-pQCT.** Tomografia quantitativa periférica de alta resolução, na tentativa de aproximar-se da histomorfometria. Avalia osso trabecular e cortical, central ou periférico, e pode ser usada mesmo em escoliose e obesidade grave; alterações degenerativas não comprometem o resultado. A desvantagem é a **dose de radiação maior** que a da DXA.

## FRAX

Algoritmo que estima o **risco em 10 anos de fratura maior e de fratura de quadril**, calibrado por país (**FRAX Brasil 2.0, 2024**). Válido dos **40 aos 90 anos**. A principal utilidade é resolver a **dúvida quanto à indicação de tratamento farmacológico**.

**Fatores considerados:** idade, sexo, peso, altura e densitometria (opcional), mais os fatores clínicos resumidos no mnemônico **2F2A2C1S** — **2F**: fratura prévia pessoal e fratura de quadril nos pais; **2A**: artrite reumatoide e álcool (3 ou mais doses ao dia); **2C**: corticoide (≥ 5 mg de prednisolona por > 3 meses) e cigarro; **1S**: osteoporose secundária (DM1, osteogênese imperfeita, hipertireoidismo, hipogonadismo, desnutrição, disabsorção, doença hepática).

**Zonas do FRAX Brasil 2.0**
- **Verde** — baixo risco: sem tratamento farmacológico.
- **Amarela** — solicitar densitometria para melhor estratificação.
- **Vermelha** — alto risco: tratamento farmacológico indicado.
- **Vinho** — muito alto risco: tratamento **anabólico** ou encaminhamento ao especialista.

**Limitações.** Não considera o **número** de fraturas prévias, nem a carga de tabaco, de corticoide ou de álcool, e usa apenas a **DMO do quadril**.

## Marcadores de remodelação óssea

Servem para complementar a avaliação de risco, sinalizar causa secundária, aferir **adesão** e direcionar o tratamento (por exemplo, indicar antirreabsortivo a quem tem marcadores de reabsorção elevados).

| Reabsorção (osteoclasto) | Formação (osteoblasto) |
| --- | --- |
| **CTX** | **P1NP** |
| NTX | Fosfatase alcalina óssea |
| TRACP | Osteocalcina |

**Resposta esperada:** antirreabsortivos reduzem o **CTX em 30%**; anabólicos elevam o **P1NP em 30%**. O **CTX tem ritmo circadiano** — colher pela manhã e em jejum. O **P1NP** pode ser colhido a qualquer hora, com ou sem jejum. Da fosfatase alcalina total, **metade é óssea e metade hepática**.

## Investigação de causas secundárias

**Quando investigar:** homens, mulheres na pré-menopausa, fraturas inexplicadas, densidade óssea muito baixa, **Z-score < −2,0**, dor ou fraqueza muscular e deformidades.

**Exames:** hemograma (hemoglobinopatias, mieloma), função renal e hepática; perfil de cálcio (cálcio, PTH, fósforo, 25-OH-vitamina D, fosfatase alcalina, calciúria); eletroforese de proteínas, VHS/PCR, fator reumatoide e FAN; anti-transglutaminase IgA, endoscopia e colonoscopia quando se suspeita de doença celíaca ou disabsorção; e rastreio de **hipogonadismo, hipercortisolismo, hipertireoidismo, hiperprolactinemia** e alterações de GH/IGF-1.

**Biópsia óssea com dupla marcação por tetraciclina** (padrão-ouro) está indicada em: osteodistrofia renal; osteoporose inexplicada no adulto jovem após investigação extensa; DMO extremamente baixa; fratura por fragilidade com **DMO normal**; e ausência de resposta à terapia convencional.

## Tratamento não farmacológico

- **Atividade física:** aeróbico de baixo a moderado impacto associado a resistidos leves.
- **Prevenção de quedas** e tratamento das comorbidades.
- **Cessar ou reduzir fatores de risco:** corticoide, tabagismo e álcool.
- **Cálcio preferencialmente da dieta** — três porções de leite ou derivados; suplementar apenas se a ingesta não for atingida.
- **Vitamina D:** colecalciferol, ou **calcifediol 10 mcg/dia** nas doenças disabsortivas e hepáticas. Meta de **30–60 ng/mL** de 25-OH-vitamina D. Com **25-OH-D < 20 ng/mL e risco de fratura**: colecalciferol **50.000 UI/semana por 6 a 8 semanas**.

## 📊 Necessidade diária de cálcio e vitamina D

| Faixa etária | Cálcio | Vitamina D (mínimo) |
| --- | --- | --- |
| 0–6 meses | 200 mg | 400 UI |
| 6–12 meses | 260 mg | 400 UI |
| 1–3 anos | 700 mg | 600 UI |
| 4–8 anos | 1.000 mg | 600 UI |
| 9–18 anos | 1.300 mg | 600 UI |
| 19–50 anos | 1.000 mg | 600 UI |
| 51–70 anos | 1.200 mg (mulheres) / 1.000 mg (homens) | 600 UI |
| > 70 anos | 1.200 mg | 800 UI |

## Sais de cálcio

- **Carbonato:** 40% de cálcio elementar; **depende da acidez gástrica**.
- **Citrato:** 21% de cálcio elementar; **independe da acidez gástrica** — escolha nas doenças disabsortivas e no pós-bariátrico.
- **Gluconato:** 9% de cálcio elementar; sal de escolha para **reposição endovenosa**.

A reposição de escolha continua sendo o **cálcio da dieta** — o cálcio de origem vegetal tem **baixa biodisponibilidade**. Há controvérsia quanto ao aumento de risco cardiovascular com suplementação oral, e a dose excessiva aumenta o risco de **nefrolitíase**.

## Bisfosfonatos

**Mecanismo.** Bloqueiam a **farnesil-pirofosfato-sintase** do osteoclasto e induzem sua apoptose — **antirreabsortivos**.

**Posologia.** Orais: **alendronato 70 mg/semana**, **risedronato 35 mg/semana ou 150 mg/mês**, **ibandronato 150 mg/mês**. Endovenoso: **ácido zoledrônico 5 mg ao ano**.

**Eficácia.** Reduzem fraturas vertebrais e não vertebrais — **exceto o ibandronato**, que não reduz fratura de quadril.

**Duração.** Via oral **5 + 5 anos**; endovenoso **3 + 3 anos**, com pausa entre os ciclos.

**Riscos.** Esofagite e perfuração esofágica com os orais (manter jejum de 30 a 60 minutos e não se deitar no período); **osteonecrose de mandíbula**; **fratura atípica de fêmur**; fibrilação atrial; e síndrome *flu-like* após a infusão de zoledrônico.

**Contraindicações.** TFG **< 35 mL/min**, hipocalcemia e gestação.

## Denosumabe (inibidor do RANK-L)

**Mecanismo.** Inibe o RANK-L e, portanto, a osteoclastogênese — **antirreabsortivo**. **Dose:** 60 mg SC a cada 6 meses. Reduz fratura vertebral e não vertebral, e é **seguro a longo prazo** (estudo FREEDOM).

⚠️ **Fratura de rebote após suspensão abrupta** — sempre **deixar um bisfosfonato após a suspensão**. Outros riscos: hipocalcemia, infecções, osteonecrose de mandíbula e fratura atípica. **Contraindicado** na gestação e na hipocalcemia.

## Romosozumabe (inibidor da esclerostina)

A esclerostina é produzida pelo **osteócito** e inibe a via Wnt/β-catenina — inibi-la é **inibir o inibidor**, o que estimula a formação óssea (**efeito osteoformador/anabólico**); há ainda **redução da expressão de RANK-L**, com efeito **antirreabsortivo** associado. **Dose:** 210 mg SC **1×/mês por 12 meses**. Reduz fratura vertebral e não vertebral, e é recomendado no **muito alto risco**.

⚠️ **Contraindicado se houve AVC ou infarto nos últimos 12 meses** (aumento de risco cardiovascular).

**PCDT (SUS):** mulheres **> 70 anos** com muito alto risco de fratura que falharam a tratamento prévio (**2 ou mais fraturas**).

## Análogos do PTH

O PTH em ação **intermitente** estimula a formação óssea (**osteoanabólico**); em ação **contínua**, estimula a reabsorção — é o que explica a perda óssea do hiperparatireoidismo.

- **Teriparatida** (PTH 1-34): **20 mcg/dia SC por 24 meses**.
- **Abaloparatida** (PTHrP 1-34): mais seletiva, com **janela anabólica mais ampla** por induzir **menor estímulo à reabsorção**; **80 mcg/dia SC por 18 meses**.

Reduzem fratura vertebral e não vertebral, **com exceção de fêmur/quadril**.

**Riscos:** osteossarcoma, hipercalcemia, hipotensão pós-dose, elevação de ácido úrico e de calciúria. **Contraindicações:** hiperparatireoidismo, malignidade com metástase óssea, radioterapia óssea prévia, doença de Paget e hipercalcemia.

## Terapia hormonal e SERMs

- **TRH.** Indicada na pós-menopausa com **sintomas vasomotores + osteoporose + menopausa há menos de 10 anos**. Reduz fratura de quadril e vertebral. ⚠️ Pelo FDA, é aprovada para **prevenção**, mas **não para tratamento** da osteoporose.
- **Raloxifeno.** Reduz também o risco de câncer de mama, mas **não reduz fratura de fêmur** e aumenta o risco de TEV e AVC, além de poder piorar os fogachos. Reservar à pós-menopausa **sem fraturas** em que bisfosfonatos e denosumabe não sejam opção.
- **Bazedoxifeno + estrógeno conjugado.** Reduz risco de câncer de mama e melhora fogachos e atrofia vaginal pela associação com estrógeno; mesmo perfil de efeitos adversos do raloxifeno. **Não reduz fratura não vertebral.** Opção para mulheres na pós-menopausa com osteoporose **e sintomas vasomotores**.
- **Tamoxifeno.** **Não** é aprovado para tratamento nem prevenção de osteoporose na pós-menopausa — não reduziu fraturas e aumentou o risco de câncer de endométrio.

## Muito alto risco de fratura

**T-score < −2,5 associado a pelo menos um** dos seguintes:
- **1 fratura vertebral** ou **1 fratura de fragilidade de quadril**;
- **múltiplas fraturas vertebrais** ou **2 ou mais fraturas osteoporóticas não vertebrais**, independentemente do T-score;
- **fratura de fragilidade durante uso de corticoide** (≥ 3 meses com ≥ 5 mg/dia de prednisona ou equivalente);
- **T-score ≤ −3,0 associado a fator de risco** (idoso, fratura prévia, risco de queda ou uso de glicocorticoide).

**Conduta.** Muito alto risco tem indicação de **terapia osteoanabólica**: **teriparatida** (preferência na osteoporose induzida por glicocorticoide) ou **abaloparatida**; **romosozumabe** é a escolha em quem já está em uso de antirreabsortivo. Após a terapia anabólica, é **obrigatório manter antirreabsortivo**.

⚠️ **Teriparatida após bisfosfonato ou denosumabe não é recomendada** — há **perda de massa óssea em fêmur** após a troca.

## 📊 Redução de fratura por fármaco

| Medicamento | Fratura vertebral | Fratura de quadril |
| --- | --- | --- |
| TRH | Sim | Sim |
| Cálcio + vitamina D | Não | Sim |
| Raloxifeno | Sim | Não |
| Alendronato | Sim | Sim |
| Ibandronato | Sim | Não |
| Risedronato | Sim | Sim |
| Ácido zoledrônico | Sim | Sim |
| Denosumabe | Sim | Sim |
| Teriparatida | Sim | Não |
| Romosozumabe | Sim | Sim |

## Acompanhamento, falha e suspensão

**Acompanhamento.** Densitometria **anual ou bienal**, sempre atenta à VMS. Marcadores de remodelação sinalizam efeito da medicação e **adesão**.

**Falha ao tratamento.** Perda de DMO **acima da VMS** ou fratura na vigência do tratamento. Avaliar **causas secundárias** (disabsorção, hiperparatireoidismo, hipogonadismo, Cushing, neoplasia) e **adesão** — o **CTX não suprimido em jejum** sob terapia antirreabsortiva sugere má adesão. Excluídas as causas secundárias, considerar **troca para terapia anabólica**.

**Quando suspender.** Reestratificar o risco de fratura:
- **Fratura prévia ou durante o tratamento, ou T-score < −2,5:** manter bisfosfonato **oral por 10 anos** ou **endovenoso por 6 anos**.
- **Sem fraturas e T-score > −2,5:** considerar ***drug holiday*** e reavaliar em **1 a 3 anos**.

## Osteonecrose de mandíbula

Osso mandibular **exposto por pelo menos 8 semanas**. É **muito rara**: **0,01 a 0,04%** dos usuários de terapia antirreabsortiva.

**Fatores de risco:** duração do tratamento (**> 3 anos**), medicações associadas (corticoide, imunossupressores, inibidores de bomba de prótons), doenças sistêmicas (artrite reumatoide, diabetes, Cushing, hipertireoidismo, câncer), tabagismo e má higiene oral.

**Conduta.** O benefício da prevenção de fraturas **supera** o risco de osteonecrose — **não há recomendação de suspender de rotina antes de procedimentos odontológicos**. Se houver cirurgia dentária **antes** de iniciar o antirreabsortivo, adiar o início do bisfosfonato por alguns meses. Se o paciente **já está em terapia**, explicar os riscos e aplicar termo de consentimento: não há contraindicação formal, e não há evidência de que descontinuar o bisfosfonato antes do procedimento reduza o risco.

## Fratura atípica de fêmur

**Magnitude.** Uma fratura atípica para cada **1.200 fraturas prevenidas** — o benefício supera largamente o risco.

**Fatores de risco:** duração do tratamento antirreabsortivo, etnia asiática, uso de corticoide e geometria óssea (fêmur arqueado). **Fisiopatologia:** microtraumas repetitivos somados à inibição da remodelação.

**Quadro clínico.** **Dor em coxa ou virilha, uni ou bilateral, atraumática, que PRECEDE a fratura.**

**Definição.** Fratura **diafisária** do fêmur associada a pelo menos **2** dos seguintes: atraumática ou por trauma mínimo; traço iniciando no **córtex lateral** e **transverso**; ausência de cominuição; espessamento periosteal ou endosteal do córtex lateral no sítio da fratura; podendo ou não haver formação de **calo medial**.

**Conduta.** Prevenir com pausas (***holidays***) a cada 3 a 5 anos de uso, cálcio e vitamina D, e suspender diante de iminência ou de fratura. Na **iminência** (espessamento cortical com linha de fratura): suspender o antirreabsortivo, **remover a carga por 2 a 3 meses** e considerar **cirurgia profilática** se não houver melhora com tratamento conservador — a teriparatida é uma opção. Na **fratura completa**: fixação com haste intramedular ou extramedular.

## Osteoporose induzida por glicocorticoide

**Mecanismo multifatorial.** Reduz a absorção intestinal de cálcio, aumenta a calciúria e eleva o PTH compensatoriamente; **aumenta a expressão de RANK-L** e ativa osteoclastos; e **inibe a via Wnt/β-catenina** (↓OPG e ↑DKK-1), reduzindo a formação. A perda óssea é **bifásica** — maior nos primeiros 6 meses, depois lenta e gradual — e acomete sobretudo o **osso trabecular**, daí o predomínio de **fratura vertebral**. O risco depende de dose e tempo: **≥ 5 mg/dia de equivalente de prednisona por mais de 3 meses**.

**Estratificação de risco (American College of Rheumatology)**
- **Muito alto:** fratura por fragilidade **ou** FRAX de muito alto risco **ou** T-score < −3,5 **ou** prednisona ≥ 30 mg/dia por mais de 30 dias ou dose cumulativa ≥ 5 g/ano.
- **Alto (> 40 anos):** FRAX de alto risco **ou** T-score entre −2,5 e −3,5.
- **Moderado:** acima de 40 anos, T-score entre −1,0 e −2,4; abaixo de 40 anos, dose ≥ 7,5 mg/dia de equivalente de prednisona por ≥ 6 meses **e** Z-score < −3,0 **ou** perda de DMO acima da VMS.

**Tratamento.** **Cálcio 1.000–1.200 mg/dia e vitamina D 600–800 UI/dia para todos.** Risco **moderado** (em qualquer idade): bisfosfonato, denosumabe ou teriparatida. Risco **alto** (≥ 40 anos): **teriparatida**, com denosumabe como alternativa. Risco **muito alto** (≥ 40 anos): **anabólico — teriparatida**. Em mulheres em idade fértil, garantir **anticoncepção**. Sob glicocorticoide, a ACR 2022 reserva o **romosozumabe** a quem é intolerante aos demais agentes no risco alto e muito alto, e recomenda **contra** o seu uso no risco moderado, pelo risco de infarto, AVC ou morte.

## Osteoporose no homem

Sempre **investigar causas secundárias**: hipogonadismo, hipertireoidismo, Cushing, hiperparatireoidismo, mieloma, hipercalciúria idiopática, doença celíaca, entre outras.

**Hipogonadismo.** O benefício da reposição de testosterona sobre a DMO está estabelecido nas **causas orgânicas**. No **hipogonadismo funcional** o benefício é **incerto** — o estudo **TRAVERSE Fracture** mostrou **aumento do risco de fraturas** com reposição de testosterona em homens hipogonádicos de alto risco cardiovascular, à custa de fraturas **apendiculares/periféricas**.

**Indicações de tratamento farmacológico.** Homem com osteoporose (fratura por fragilidade **ou** T-score < −2,5 com ≥ 50 anos) ou FRAX de alto risco. Em homens com hipogonadismo, tratar se: altas doses de corticoide; caidor frequente; fratura por fragilidade (especialmente com T-score ≤ −2,5); T-score ≤ −3,0; ou T-score ≤ −2,5 após pelo menos 2 anos de reposição de testosterona.

**Escolha.** Bisfosfonato como primeira opção em geral; **teriparatida** como primeira linha no muito alto risco. Em **tratamento de câncer de próstata**, o bloqueio da formação de testosterona **e de estradiol** aumenta o risco de fratura — avaliar o risco antes e depois do tratamento e usar bisfosfonatos ou denosumabe.

## Gestação e lactação

O mecanismo é incerto — perda mediada por **PTHrP**? déficit de cálcio e vitamina D? A perda de massa óssea na gestação predomina na **coluna vertebral**, com recuperação após o fim da lactação. **Fratura por fragilidade é rara** nesse contexto e, quando ocorre, é no **final da gestação ou início do puerpério**. Sempre descartar causas secundárias. **Bisfosfonatos são teratogênicos** (evidência em ratos). Nos casos graves, considerar tratamento farmacológico **após o parto**.

## Osteoporose no diabetes

O risco de fratura é maior tanto no **DM1** quanto no **DM2**. A hiperglicemia e a queda de insulina inibem a formação óssea, os osteoblastos e a sinalização Wnt/β-catenina. A **DMO no DM2 é 10–15% maior**, e ainda assim há **mais fraturas**, com **maior porosidade cortical** e **TBS reduzido**; no **DM1 a DMO é 20–30% menor**. Soma-se o **maior risco de quedas** por hipoglicemia, retinopatia, neuropatia autonômica e polineuropatia.

**Fatores de risco de fratura ligados ao diabetes:** mais de 10 anos de doença; HbA1c persistentemente **≥ 9%**; risco de fratura intermediário, alto ou muito alto pelo FRAX ajustado; hipoglicemias frequentes; neuropatia, retinopatia ou nefropatia; e uso de insulina, tiazolidinedionas ou canagliflozina.

**Cálculo do risco.** Usar o **FRAX 2.0**, ajustando no DM2 por uma destas vias: somar **10 anos** à idade, marcar **artrite reumatoide**, reduzir o **T-score do colo femoral em 0,5 DP**, ou ajustar pelo **TBS** — quando disponível, combinar TBS e FRAX (SBD, 2025).

**Antidiabéticos que pioram o prognóstico ósseo** (não contraindicam, mas exigem cautela): **iSGLT-2** (aumento de fraturas no CANVAS) e **glitazonas** (redução de DMO e aumento de fraturas).

**Quando tratar.** Alto ou muito alto risco pelo FRAX; **T-score < −2,0**; ou fratura de fragilidade prévia.

**Tratamento.** Cálcio **com** vitamina D — ⚠️ **não usar cálcio isolado no diabetes**, pelo maior risco de eventos cardiovasculares. Alto risco: bisfosfonato (1ª linha) e denosumabe (2ª). Muito alto risco: teriparatida (1ª linha); romosozumabe como 2ª linha, opção para mulheres com diabetes **apenas na ausência de eventos cardiovasculares prévios**, com cautela se o risco cardiovascular for alto ou muito alto.

## Osteoporose na mulher com câncer de mama

**Maior risco** com inibidores de aromatase (anastrozol, letrozol), análogos de GnRH e ooforectomia. O **tamoxifeno** é adjuvante no câncer de mama, mas **não reduz fratura**; o **raloxifeno** não é adjuvante, mas **reduz fratura**.

**Quando tratar:** uso de inibidor de aromatase com **T-score < −2,0**, **ou** T-score < −1,5 com **1 fator de risco adicional**, **ou** 2 ou mais fatores de risco independentemente da DMO.

Os **antirreabsortivos** reduzem não só o risco de fratura como também o de **metástase óssea** e a dor óssea quando há metástase — escolha por **ácido zoledrônico ou denosumabe**. Recomenda-se bisfosfonato em mulheres na pós-menopausa com câncer de mama de **alto risco de recorrência, independentemente da massa óssea**, pela redução do risco de metástase óssea.

## Osteoporose pós-bariátrica

**Mecanismo.** Carências nutricionais (cálcio, vitamina D) e **hiperparatireoidismo secundário**; e a própria perda de peso, que reduz a carga mecânica, elevando esclerostina e inibindo Wnt/β-catenina. Somam-se alterações pró-reabsortivas: ↑adiponectina, ↑PYY, ↓insulina, ↓estradiol, ↓leptina, ↓GIP, ↓grelina e ↓estrógenos periféricos.

**Evolução.** Perda de DMO nos primeiros anos seguida de estabilização, sobretudo em fêmur — solicitar densitometria **1 a 2 anos após a cirurgia**.

**Tratamento.** Atividade física, cálcio e vitamina D. Na osteoporose, antirreabsortivos com **preferência pela via endovenosa ou subcutânea** nas cirurgias disabsortivas. ⚠️ **Sempre corrigir vitamina D e cálcio ANTES de prescrever o antirreabsortivo**, pelo risco de hipocalcemia.

## 📊 Interpretação da densitometria (DXA)

| Categoria | T-score |
| --- | --- |
| Normal | ≥ −1,0 |
| Osteopenia (baixa massa óssea) | Entre −1,0 e −2,5 |
| Osteoporose | ≤ −2,5 |
| Osteoporose estabelecida | ≤ −2,5 + fratura por fragilidade |`;

const pts = [
  'O RANK-L, produzido por osteoblastos e osteócitos, diferencia o osteoclasto; a osteoprotegerina o sequestra e freia a reabsorção.',
  'A esclerostina, produzida pelo osteócito na ausência de estímulo mecânico, inativa a via Wnt/β-catenina e reduz a formação óssea.',
  'O T-score compara com população jovem e faz o diagnóstico; o Z-score compara com a mesma idade e orienta a busca de causas secundárias.',
  'A variação mínima significativa é 2,77 vezes o coeficiente de variação do serviço — cerca de 6% no colo do fêmur e 4,2% na coluna e no fêmur total.',
  'Rastreamento pela SBEM: mulheres acima de 65 anos, homens acima de 70, pós-menopausa com fator de risco e adultos com fator de risco.',
  'Na pré-menopausa e em homens abaixo de 50 anos, Z-score menor que −2,0 indica baixa densidade óssea para a idade, não osteoporose.',
  'O TBS complementa a DMO quando ela subestima o dano — diabetes tipo 2, corticoide, doença renal crônica e hiperparatireoidismo —, mas não monitora tratamento nem serve a IMC abaixo de 15 ou acima de 37.',
  'O FRAX vale dos 40 aos 90 anos e resolve a dúvida quanto a tratar; suas zonas vão do verde (sem tratamento) ao vinho (anabólico).',
  'Antirreabsortivos reduzem o CTX em 30% e anabólicos elevam o P1NP em 30% — o CTX tem ritmo circadiano e exige coleta matinal em jejum.',
  'Bisfosfonatos orais duram 5 mais 5 anos e o endovenoso 3 mais 3, com pausa; são contraindicados com TFG abaixo de 35 mL/min, hipocalcemia e na gestação.',
  'O denosumabe nunca deve ser suspenso sem um bisfosfonato subsequente, pelo risco de fratura de rebote.',
  'O romosozumabe é contraindicado se houve infarto ou AVC nos últimos 12 meses.',
  'Teriparatida e abaloparatida reduzem fratura vertebral e não vertebral, mas não a de fêmur ou quadril.',
  'No muito alto risco a terapia é anabólica; teriparatida após bisfosfonato ou denosumabe não é recomendada, pela perda de massa óssea em fêmur após a troca.',
  'A osteonecrose de mandíbula ocorre em 0,01 a 0,04% dos usuários e não justifica suspender o antirreabsortivo antes de procedimento odontológico.',
  'A fratura atípica de fêmur é diafisária, transversa e atraumática, precedida de dor em coxa ou virilha; ocorre uma para cada 1.200 fraturas prevenidas.',
  'Na osteoporose por glicocorticoide a perda é bifásica, predomina no osso trabecular e o risco começa em 5 mg/dia de prednisona por mais de 3 meses.',
  'No DM2 a DMO é 10 a 15% maior e ainda assim há mais fraturas — ajustar o FRAX 2.0 e não usar cálcio isolado, pelo risco cardiovascular.',
  'Sob inibidor de aromatase, tratar com T-score abaixo de −2,0, ou abaixo de −1,5 com um fator de risco, ou com dois ou mais fatores independentemente da DMO.',
  'No pós-bariátrico, corrigir vitamina D e cálcio antes de prescrever o antirreabsortivo, pelo risco de hipocalcemia.',
];

const patch = JSON.stringify({
  resumo: resumo, pts: pts,
  fonte: 'Síntese Endodirect · EndoTEEM 2026 (Osteoporose partes 1, 2 e 3) + SBEM/ABRASSO / ACR / FRAX Brasil 2.0 / SBD 2025',
});
if (patch.includes('$j$')) throw new Error('delimitador colide com o conteúdo');

const q = (s) => "'" + s.replace(/'/g, "''") + "'";
fs.writeFileSync(path.join(__dirname, 'osteo-osteoporose.sql'),
`update endodirect_global_state g
set payload = jsonb_set(g.payload, '{diretrizes}', (
  select jsonb_agg(
    case when d->>'tema' = ${q(TEMA)} and d->>'sub' = ${q(SUB)}
         then d || $j$${patch}$j$::jsonb
         else d end
    order by ord)
  from jsonb_array_elements(g.payload->'diretrizes') with ordinality t(d, ord)
))
where g.payload ? 'diretrizes';`);

console.log('resumo: %d caracteres · %d pontos-chave', resumo.length, pts.length);

// ── guard 1: o conteúdo das TRÊS aulas entrou ────────────────────────────────
const novos = [
  'TRAF6', 'LRP5/LRP6', '90–95%', 'NaPi-IIa', '136–159 kg', '2,77 × coeficiente',
  '~4,2%', '> 65 anos', 'IOF (2012)', '20 a 30 vezes menos radiação', '> 4 cm',
  'grau 3** — acima de 40%', '< 15 ou > 37 kg/m²', 'HR-pQCT', '40 aos 90 anos',
  '2F2A2C1S', 'Vinho', 'ritmo circadiano', 'dupla marcação por tetraciclina',
  'calcifediol 10 mcg/dia', '50.000 UI/semana', '1.300 mg', 'Carbonato:** 40%',
  'Citrato:** 21%', 'Gluconato:** 9%', 'farnesil-pirofosfato-sintase',
  '150 mg/mês', '5 + 5 anos', '3 + 3 anos', '< 35 mL/min', 'FREEDOM',
  '210 mg SC', 'PCDT (SUS)', '20 mcg/dia SC por 24 meses', '80 mcg/dia SC por 18 meses',
  'osteossarcoma', 'Bazedoxifeno', 'Tamoxifeno', '≤ −3,0 associado a fator de risco',
  'perda de massa óssea em fêmur', 'Ibandronato | Sim | Não', 'oral por 10 anos',
  '0,01 a 0,04%', '1.200 fraturas prevenidas', 'calo medial', 'DKK-1',
  '≥ 5 g/ano', 'TRAVERSE', 'PTHrP', '10–15% maior', 'canagliflozina', 'CANVAS',
  'não usar cálcio isolado no diabetes', 'inibidores de aromatase', 'metástase óssea',
  '↑PYY', '1 a 2 anos após a cirurgia',
];
// ── guard 2: o que o capítulo já dizia de bom continua lá ────────────────────
const preservados = [
  'Osteoporose estabelecida', 'úmero, punho, pelve', 'ACR 2022',
  'infarto, AVC ou morte', 'Interpretação da densitometria (DXA)',
];
const f1 = novos.filter((n) => !resumo.includes(n));
const f2 = preservados.filter((n) => !resumo.includes(n));
if (f1.length) { console.error('⚠️ dados novos ausentes: ' + f1.join(' | ')); process.exit(1); }
if (f2.length) { console.error('⚠️ conteúdo antigo PERDIDO: ' + f2.join(' | ')); process.exit(1); }
console.log('✓ %d dados das aulas entraram; %d âncoras do capítulo antigo preservadas', novos.length, preservados.length);
