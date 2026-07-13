// Expansão dos resumos de Tireoide (2ª rodada):
// (A) Novo capítulo próprio "Oftalmopatia de Graves" (INSERT).
// (B) "Doença de Graves" reescrito mais completo, foco no hipertireoidismo (UPDATE por tema).
// (C) "Tireoidites" reescrito mais completo (UPDATE por tema).
// Síntese própria (não reproduz livros), atualizada com EUGOGO/ATA.
const FONTE = 'Síntese Endodirect · Vilar 8ed + Williams/Greenspan + EUGOGO/ATA';

// (A) ─── NOVO: Oftalmopatia de Graves ───────────────────────────────────
const OFTALMO = {
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Oftalmopatia de Graves (Doença Ocular Tireoidiana)',
  fonte:FONTE,
  resumo:`## Definição e epidemiologia
Também chamada **orbitopatia de Graves** ou **doença ocular tireoidiana (TED)**. É a **manifestação extratireoidiana mais comum** da Doença de Graves — afeta ~**25–50%** dos pacientes (a maioria leve; **3–5% moderada-grave**). Pode **preceder, coincidir ou surgir após** o hipertireoidismo; raramente ocorre em eutireóideos ou hipotireóideos (Hashimoto).

## Patogênese
Os **fibroblastos orbitários** expressam o **receptor de TSH** e o **receptor de IGF-1** — alvos comuns com a tireoide. **TRAb + linfócitos T** ativam esses fibroblastos → produção de **glicosaminoglicanos** (edema hidrofílico), **inflamação** e **adipogênese** → **aumento dos músculos extraoculares e da gordura retro-orbitária** num compartimento ósseo fechado → **proptose** e, no ápice, **compressão do nervo óptico**.

## Fatores de risco (modificáveis!)
- **Tabagismo** — o **mais importante**: aumenta risco/gravidade e **reduz a resposta ao tratamento** (dose-dependente).
- **Radioiodo** (pode desencadear/piorar, sobretudo em fumantes e TRAb alto).
- **Disfunção tireoidiana descontrolada** (tanto hiper quanto hipo).
- **TRAb elevado**, sexo masculino/idade (formas mais graves).

## Quadro clínico
- **Retração palpebral** (sinal de Dalrymple), **lid lag** (von Graefe), **proptose/exoftalmia** (exoftalmômetro de Hertel).
- **Sinais inflamatórios (atividade):** dor/pressão retro-ocular, hiperemia e edema conjuntival (**quemose**), edema palpebral, hiperemia das carúnculas.
- **Diplopia** por restrição/fibrose dos músculos (reto inferior e medial mais acometidos).
- **Ceratite de exposição / lagoftalmo** (olho seco, úlcera de córnea).
- **⚠️ Neuropatia óptica compressiva** (2–5%): baixa acuidade, **discromatopsia** (perda da visão de cores), defeito de campo, edema de papila — **ameaça à visão**, emergência.

## Avaliação: atividade × gravidade (EUGOGO)
- **Atividade** pelo **CAS (Clinical Activity Score, 0–7)** — dor espontânea/ao movimento, hiperemia e edema palpebral, hiperemia/edema conjuntival, edema de carúncula. **CAS ≥ 3/7 = doença ativa** (inflamatória).
- **Gravidade:** **leve** × **moderada-grave** × **muito grave (ameaça à visão)**.
- **Fases (curva de Rundle):** fase **ativa** (inflamatória, ~**18–24 meses**) → fase **inativa/fibrótica** (sequelar). **Imunossupressão só age na fase ATIVA**; sequelas → cirurgia reabilitadora.
- **Imagem:** **TC/RM de órbitas** (espessamento muscular poupando o tendão, aumento de gordura, apinhamento do ápice); avaliar **acuidade, campo, visão de cores, motilidade, exoftalmometria**.

## Tratamento
**Para todos:** **parar de fumar** (medida isolada mais importante), **restaurar e manter o eutireoidismo**, **lágrimas artificiais/lubrificação**, elevar a cabeceira. Na Graves com oftalmopatia ativa, **evitar radioiodo** (ou cobrir com **corticoide profilático**); preferir antitireoidiano ou cirurgia.
- **Leve:** medidas locais + **selênio** (6 meses; melhora qualidade de vida em doença leve/recente).
- **Moderada-grave e ATIVA:** **1ª linha = glicocorticoide IV em pulsos** (metilprednisolona, esquema EUGOGO — cumulativo ~4,5 g em 12 semanas; melhor eficácia e menos toxicidade que via oral). Opções/associações: **teprotumumabe** (anticorpo anti-IGF-1R — reduz proptose e diplopia de forma marcante), **micofenolato** (associado ao corticoide), **rituximabe**, **radioterapia orbitária** (útil na diplopia/inflamação).
- **Muito grave (neuropatia óptica compressiva / úlcera de córnea):** **pulsoterapia de corticoide em alta dose**; se não responder em ~1–2 semanas → **descompressão orbitária cirúrgica urgente**.
- **Reabilitação (fase inativa):** cirurgia na sequência **descompressão → cirurgia de estrabismo → cirurgia palpebral**.`,
  pts:[
    'Manifestação extratireoidiana mais comum da Graves (~25–50%); a maioria é leve, 3–5% moderada-grave.',
    'Pode preceder, coincidir ou seguir o hipertireoidismo; rara em eutireóideos.',
    'Patogênese: fibroblastos orbitários expressam receptor de TSH e IGF-1; TRAb/linfócitos T → glicosaminoglicanos, inflamação e adipogênese → proptose.',
    'Tabagismo é o principal fator de risco modificável — piora e reduz resposta ao tratamento.',
    'Radioiodo pode desencadear/piorar (evitar na doença ativa ou cobrir com corticoide).',
    'Sinais: retração palpebral, lid lag, proptose, quemose, diplopia por restrição muscular.',
    'Neuropatia óptica compressiva (discromatopsia, baixa acuidade) é emergência que ameaça a visão.',
    'Avaliar atividade pelo CAS (≥3/7 = ativa) e gravidade (leve/moderada-grave/muito grave — EUGOGO).',
    'Curva de Rundle: fase ativa ~18–24 meses → fase inativa; imunossupressão só age na fase ativa.',
    'Todos: parar de fumar, eutireoidismo, lubrificação. Leve: selênio. Moderada-grave ativa: pulso de corticoide IV (± teprotumumabe). Neuropatia óptica: pulso + descompressão.'
  ],
  mapa:{ central:'Oftalmopatia de Graves',
    nodes:[
      { label:'Patogênese', children:[
        {label:'Fibroblasto orbitário', children:['Receptor de TSH','Receptor de IGF-1']},
        {label:'TRAb + linfócitos T'},
        {label:'GAG + adipogênese', children:['Proptose','Compressão do óptico']} ]},
      { label:'Fatores de risco', children:[
        {label:'Tabagismo (o principal)'},
        {label:'Radioiodo'},
        {label:'Disfunção descontrolada'},
        {label:'TRAb alto'} ]},
      { label:'Clínica', children:[
        {label:'Retração / lid lag'},
        {label:'Proptose / quemose'},
        {label:'Diplopia (restrição)'},
        {label:'Neuropatia óptica', children:['Discromatopsia','Ameaça à visão']} ]},
      { label:'Avaliar', children:[
        {label:'Atividade: CAS ≥3/7'},
        {label:'Gravidade (EUGOGO)'},
        {label:'Curva de Rundle', children:['Ativa ~18–24m','Depois fibrótica']},
        {label:'TC/RM órbitas'} ]},
      { label:'Tratamento', children:[
        {label:'Todos', children:['Parar de fumar','Eutireoidismo','Lubrificação']},
        {label:'Leve → selênio'},
        {label:'Mod-grave ativa → pulso IV', children:['± teprotumumabe','± rituximabe/RT']},
        {label:'Neuropatia → pulso + descompressão'} ]}
    ]},
  flashcards:[
    {q:'Por que a tireoide e a órbita são acometidas na mesma doença autoimune?',a:'Porque os fibroblastos orbitários expressam o receptor de TSH (e o de IGF-1), alvos comuns com as células tireoidianas; os TRAb e linfócitos T os ativam, gerando glicosaminoglicanos, inflamação e adipogênese que causam a proptose.'},
    {q:'Qual o principal fator de risco modificável da oftalmopatia de Graves?',a:'O tabagismo — aumenta o risco e a gravidade de forma dose-dependente e reduz a resposta ao tratamento; parar de fumar é a medida isolada mais importante.'},
    {q:'Como se avalia atividade e gravidade da oftalmopatia?',a:'A atividade pelo Clinical Activity Score (CAS ≥ 3/7 indica doença ativa/inflamatória) e a gravidade em leve, moderada-grave e muito grave (ameaça à visão), conforme a EUGOGO.'},
    {q:'Qual o tratamento de 1ª linha da oftalmopatia moderada a grave e ativa?',a:'Glicocorticoide intravenoso em pulsos (metilprednisolona, esquema EUGOGO), podendo associar teprotumumabe (anti-IGF-1R), micofenolato, rituximabe ou radioterapia orbitária; sempre com cessação do tabagismo e eutireoidismo.'},
    {q:'Quando há ameaça à visão e o que fazer?',a:'Na neuropatia óptica compressiva (baixa acuidade, discromatopsia, defeito de campo) ou úlcera de córnea grave — trata-se com pulso de corticoide em alta dose e, se não houver resposta, descompressão orbitária cirúrgica urgente.'}
  ],
  fluxogramas:[{
    titulo:'Oftalmopatia de Graves: conduta por atividade e gravidade',
    fonte:'Síntese Endodirect (baseado em EUGOGO)',
    nos:[
      {tipo:'inicio', texto:'Oftalmopatia de Graves — parar de fumar, restaurar eutireoidismo, lubrificação; avaliar atividade (CAS) e gravidade'},
      {tipo:'decisao', texto:'Ameaça à visão (neuropatia óptica / úlcera de córnea)?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Emergência: pulso de corticoide em alta dose → descompressão orbitária se não responder'},
        {rotulo:'NÃO', tipo:'acao', texto:'Classificar em leve × moderada-grave e verificar atividade (CAS ≥ 3/7)'} ]},
      {tipo:'decisao', texto:'Moderada-grave E ativa?', ramos:[
        {rotulo:'SIM', tipo:'fim', texto:'Glicocorticoide IV em pulsos (± teprotumumabe / micofenolato / rituximabe / radioterapia)'},
        {rotulo:'NÃO (leve)', tipo:'fim', texto:'Medidas locais + selênio 6 meses'},
        {rotulo:'INATIVA (sequela)', tipo:'fim', texto:'Reabilitação cirúrgica: descompressão → estrabismo → pálpebra'} ]}
    ]
  }]
};

// (B) ─── Doença de Graves (reescrito, mais completo, foco hipertireoidismo) ─
const GRAVES = {
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Doença de Graves (Hipertireoidismo)',
  fonte:FONTE,
  resumo:`## Definição e epidemiologia
Doença **autoimune** e **causa mais comum de hipertireoidismo** (~60–80% dos casos). Incidência maior em **mulheres (5–10:1)**, pico entre **20–50 anos**. Associa-se a outras doenças autoimunes (DM1, vitiligo, anemia perniciosa, insuficiência adrenal — poliglandular).

## Patogênese
Autoanticorpos **TRAb estimuladores (TSI)** ligam-se ao **receptor de TSH** nas células foliculares → estímulo contínuo, **hiperfunção difusa** e **crescimento glandular (bócio difuso)**. Gatilhos: **estresse, tabagismo, pós-parto, excesso de iodo, infecções**; predisposição **HLA/genética**. Os mesmos anticorpos, atuando em fibroblastos que expressam receptor de TSH/IGF-1, explicam a **oftalmopatia** e a **dermopatia** (ver capítulo próprio de Oftalmopatia).

## Quadro clínico
- **Tireotoxicose:** taquicardia/palpitação, **fibrilação atrial** (idoso), perda de peso com apetite preservado, intolerância ao calor, sudorese, tremor fino, ansiedade/insônia, hiperdefecação, fraqueza muscular proximal, **osteoporose**, oligomenorreia.
- **Específico de Graves:** **bócio difuso com sopro/frêmito**, **oftalmopatia**, **mixedema pré-tibial** (dermopatia) e **acropaquia** (raros e patognomônicos).

## Diagnóstico
- **TSH suprimido** + **T4L e/ou T3 elevados** (subclínico se T4L/T3 normais).
- **TRAb (TSI) positivo** → confirma. Dispensa cintilografia na apresentação típica (bócio difuso + oftalmopatia).
- Quando necessário: **RAIU difusa aumentada**; **US com Doppler** = hipervascularização ("thyroid inferno").

## Tratamento — 3 opções (individualizar)
**1) Antitireoidianos (tionamidas)** — bloqueiam a **tireoperoxidase** (síntese hormonal):
- **Metimazol (MMI):** **1ª linha** (dose única diária, mais potente, menos hepatotóxico).
- **Propiltiouracil (PTU):** reservado ao **1º trimestre da gestação** e à **crise tireotóxica** (também inibe a conversão periférica T4→T3).
- Curso **12–18 meses**; **remissão ~40–50%**. **Preditores de remissão:** bócio pequeno, doença leve, **TRAb baixo/negativo ao fim**, mulher. Recidiva → radioiodo/cirurgia (ou novo curso).
- **Efeitos adversos:** rash/artralgia (comuns); **agranulocitose** (febre + odinofagia → **suspender e hemograma**); **hepatotoxicidade** (PTU: hepatocelular, pode ser fulminante; MMI: colestática); **vasculite ANCA** (mais com PTU). Orientar sinais de alarme.

**2) Radioiodo (I-131)** — definitivo, ambulatorial:
- Indicações: recidiva/falha de tionamida, preferência, contraindicação à cirurgia.
- Evolui para **hipotireoidismo** (esperado → repor LT4). **Contraindicado na gestação/lactação** (afastar gravidez; evitar concepção por ~6 meses). Pode **desencadear/piorar oftalmopatia** (cobrir com corticoide em pacientes de risco; **evitar na oftalmopatia moderada-grave ativa**).

**3) Tireoidectomia (total)** — definitivo e rápido:
- Indicações: bócios volumosos/compressivos, suspeita de nódulo maligno, **oftalmopatia grave**, gestante sem controle com tionamida, hiperparatireoidismo associado, preferência.
- Exige **eutireoidismo prévio** e **iodeto/Lugol pré-operatório** (reduz vascularização). Complicações: **hipoparatireoidismo** e **lesão do nervo laríngeo recorrente** (rouquidão).

**Adjuvante:** **betabloqueador** (propranolol) para sintomas adrenérgicos e FC em todos, até o eutireoidismo.

## Situações especiais
- **Gestação:** PTU no 1º trimestre → metimazol depois; menor dose para T4L no limite superior; radioiodo contraindicado (ver capítulo Gestação).
- **Crise tireotóxica:** ver capítulo de Emergências.
- **Graves subclínico** (TSH baixo, hormônios normais): tratar se idoso, cardiopatia/FA, osteoporose ou TSH persistentemente < 0,1.`,
  pts:[
    'Graves é autoimune e a causa mais comum de hipertireoidismo (~60–80%); mulheres 20–50 anos.',
    'TRAb estimulador (TSI) ativa o receptor de TSH → hiperfunção difusa e bócio; gatilhos: estresse, tabagismo, pós-parto, iodo.',
    'Sinais específicos: bócio difuso com sopro, oftalmopatia, mixedema pré-tibial e acropaquia.',
    'Diagnóstico: TSH↓ com T4L/T3↑ e TRAb+; RAIU difusa/US Doppler se necessário.',
    'Metimazol é 1ª linha; PTU só no 1º trimestre e na crise; curso de 12–18 meses, remissão ~40–50%.',
    'Preditores de remissão: bócio pequeno, doença leve, TRAb baixo ao fim.',
    'Efeitos adversos das tionamidas: agranulocitose (febre/odinofagia → suspender), hepatotoxicidade, vasculite ANCA (PTU).',
    'Radioiodo é definitivo, causa hipotireoidismo, é contraindicado na gestação e pode piorar a oftalmopatia.',
    'Tireoidectomia total exige eutireoidismo e Lugol; complica com hipoparatireoidismo e lesão do laríngeo recorrente.',
    'Betabloqueador controla sintomas até o eutireoidismo; Graves subclínico se trata em idoso/cardiopata/osteoporose.'
  ],
  mapa:{ central:'Doença de Graves',
    nodes:[
      { label:'Patogênese', children:[
        {label:'Autoimune (TRAb/TSI)', children:['Estimula receptor TSH','Bócio difuso']},
        {label:'Mulheres 20–50a'},
        {label:'Gatilhos', children:['Estresse, pós-parto','Tabagismo, iodo']} ]},
      { label:'Clínica', children:[
        {label:'Tireotoxicose', children:['Taquicardia/FA','Perda de peso','Tremor, calor']},
        {label:'Específico', children:['Bócio c/ sopro','Oftalmopatia','Mixedema pré-tibial']} ]},
      { label:'Diagnóstico', children:['TSH↓ / T4L/T3↑','TRAb (TSI)+','RAIU difusa / US Doppler'] },
      { label:'Tionamidas', children:[
        {label:'Metimazol 1ª linha'},
        {label:'PTU: 1º tri e crise'},
        {label:'12–18 meses (remissão 40–50%)'},
        {label:'Adversos', children:['Agranulocitose','Hepatotoxicidade','Vasculite ANCA']} ]},
      { label:'Definitivo', children:[
        {label:'Radioiodo', children:['→ hipotireoidismo','Não na gestação','Piora oftalmopatia']},
        {label:'Cirurgia', children:['Eutireoidismo + Lugol','Hipopara / laríngeo recorrente']} ]}
    ]},
  flashcards:[
    {q:'Qual anticorpo causa a Doença de Graves e como ele age?',a:'O TRAb estimulador (TSI), que se liga ao receptor de TSH e o ativa continuamente, causando hiperfunção difusa e crescimento da glândula (bócio difuso).'},
    {q:'Quais são os preditores de remissão com tionamida na Doença de Graves?',a:'Bócio pequeno, doença leve, sexo feminino e TRAb baixo ou negativo ao final do curso; a remissão ocorre em cerca de 40–50% após 12–18 meses.'},
    {q:'Quais os principais efeitos adversos das tionamidas e a conduta?',a:'Rash e artralgia (comuns); agranulocitose (febre e odinofagia obrigam a suspender e colher hemograma); hepatotoxicidade (PTU hepatocelular, metimazol colestática) e vasculite ANCA (mais com PTU).'},
    {q:'Quais as desvantagens do radioiodo na Doença de Graves?',a:'Evolui para hipotireoidismo (requer levotiroxina), é contraindicado na gestação/lactação e pode desencadear ou piorar a oftalmopatia — deve ser evitado na oftalmopatia moderada-grave ativa ou coberto com corticoide.'},
    {q:'Que cuidados e complicações envolvem a tireoidectomia na Graves?',a:'Exige eutireoidismo prévio e Lugol pré-operatório (reduz vascularização); as principais complicações são o hipoparatireoidismo e a lesão do nervo laríngeo recorrente (rouquidão).'},
    {q:'Quando tratar o hipertireoidismo subclínico de Graves?',a:'Em idosos, cardiopatas ou com fibrilação atrial, osteoporose, ou quando o TSH está persistentemente muito baixo (< 0,1), pelo risco cardiovascular e ósseo.'}
  ],
  fluxogramas:[]
};

// (C) ─── Tireoidites (reescrito, mais completo) ──────────────────────────
const TIREOIDITES = {
  sub:'Tireoide', privado:true, titulo:'', ano:'2026', url:'',
  tema:'Tireoidites',
  fonte:FONTE,
  resumo:`Grupo heterogêneo de inflamações da tireoide, classificadas por **evolução (aguda/subaguda/crônica)**, **dor** e **mecanismo**. Nas **tireoidites destrutivas**, a lesão folicular libera **hormônio pré-formado** → **fase tireotóxica transitória com captação de iodo (RAIU) BAIXA** → **hipotireoidismo** (transitório ou definitivo) → recuperação. Isso as separa da Doença de Graves (RAIU alta) e dita o tratamento: **suporte, sem antitireoidiano nem radioiodo**.

## 1) Tireoidite de Hashimoto (crônica autoimune)
- **Causa mais comum de hipotireoidismo** em áreas suficientes em iodo; predomínio feminino.
- **Autoimune** (**anti-TPO+** em >90%, anti-Tg+); infiltrado linfocítico com centros germinativos. Formas **bociogênica** (bócio firme) e **atrófica**.
- Associa-se a outras autoimunes (DM1, vitiligo, doença celíaca, poliglandular) e a **risco aumentado de linfoma tireoidiano primário** (raro; suspeitar em crescimento rápido). Entidade rara associada: **encefalopatia de Hashimoto** (responsiva a corticoide).
- **Tratamento:** levotiroxina se hipotireoidismo (franco ou subclínico com critérios).

## 2) Tireoidite subaguda (De Quervain / granulomatosa)
- **Dolorosa**, pós-**infecção viral** de vias aéreas; associada ao **HLA-B35**. Predomínio feminino, 30–50 anos.
- Tireoide **dolorosa e endurecida** (dor pode migrar), febre, mal-estar; **VHS e PCR muito elevados**; captação **baixa**. Curso clássico: **tireotoxicose (2–8 sem) → hipotireoidismo transitório → eutireoidismo** em meses.
- **Autolimitada:** **AINE** na dor leve; **corticoide (prednisona)** nos casos intensos (resposta rápida); **betabloqueador** na fase tireotóxica. **Sem antitireoidiano.** Hipotireoidismo definitivo é incomum.

## 3) Tireoidite silenciosa (indolor) e pós-parto
- **Indolores, autoimunes** (anti-TPO+), captação baixa; mesmo curso trifásico da subaguda, **sem dor** e **sem VHS elevado**.
- **Pós-parto:** ocorre no **1º ano após o parto** (ou pós-aborto), em ~5–10%; maior risco se **anti-TPO+ ou DM1**. Pode **recorrer** em gestações futuras e evoluir para **hipotireoidismo definitivo**. Suporte; tratar o hipotireoidismo sintomático; rastrear função residual.

## 4) Tireoidite aguda (supurativa)
- **Infecção bacteriana** (rara): tireoide dolorosa, quente, febre, sinais flogísticos; geralmente **eutireóidea**. Fatores: imunossupressão, **fístula do seio piriforme** (crianças, recorrente à esquerda).
- **Tratamento:** **antibiótico** ± **drenagem** de abscesso; corrigir a fístula.

## 5) Tireoidite de Riedel (fibrosante)
- Rara; **fibrose invasiva** que ultrapassa a cápsula e adere a estruturas cervicais (espectro de **doença relacionada a IgG4**). Tireoide **pétrea, fixa**, com **sintomas compressivos**; pode causar hipotireoidismo e **hipoparatireoidismo**.
- **Tratamento:** **glicocorticoide** e/ou **tamoxifeno**; cirurgia limitada à **descompressão** (istmectomia).

## 6) Induzida por fármacos
| Fármaco | Efeito | Conduta |
| --- | --- | --- |
| **Amiodarona — AIT tipo 1** | Hiper por **iodo** em glândula anormal (bócio/autonomia) | **Tionamida** ± perclorato |
| **Amiodarona — AIT tipo 2** | **Tireoidite destrutiva** | **Corticoide** |
| **Amiodarona — AIH** | Hipotireoidismo (efeito Wolff-Chaikoff) | Levotiroxina |
| **Lítio** | Hipotireoidismo, bócio | Levotiroxina |
| **Inibidores de checkpoint** | Tireoidite (tireotoxicose → hipo) | Suporte; repor LT4 |
| **Interferon-α, TKI** | Disfunção variável | Monitorar |

- **Amiodarona:** o **US com Doppler** ajuda a diferenciar AIT tipo 1 (hipervascular) de tipo 2 (avascular, destrutivo); formas mistas existem.`,
  pts:[
    'Tireoidites destrutivas: liberam hormônio pré-formado → fase tireotóxica com RAIU baixa → hipotireoidismo → recuperação; tratamento de suporte, sem antitireoidiano.',
    'Hashimoto: causa mais comum de hipotireoidismo (área com iodo); anti-TPO+ >90%; risco (raro) de linfoma tireoidiano.',
    'Hashimoto associa-se a outras autoimunes; entidade rara é a encefalopatia de Hashimoto (responde a corticoide).',
    'Subaguda (De Quervain): dolorosa, pós-viral, HLA-B35, VHS/PCR muito altos; AINE/corticoide, betabloqueador, sem antitireoidiano.',
    'Silenciosa e pós-parto: indolores, autoimunes, sem VHS elevado; curso trifásico.',
    'Pós-parto ocorre no 1º ano, pode recorrer e evoluir para hipotireoidismo definitivo (maior risco se anti-TPO+/DM1).',
    'Aguda supurativa: infecção bacteriana, tireoide dolorosa/flogística; antibiótico ± drenagem; pensar em fístula do seio piriforme na criança.',
    'Riedel: fibrose invasiva pétrea (espectro IgG4), compressiva; corticoide/tamoxifeno, cirurgia só descompressiva.',
    'Amiodarona: AIT tipo 1 (iodo → tionamida) vs tipo 2 (destrutiva → corticoide); Doppler ajuda a diferenciar; também causa hipotireoidismo (AIH).',
    'Lítio, inibidores de checkpoint, interferon e TKI também causam disfunção tireoidiana.'
  ],
  mapa:{ central:'Tireoidites',
    nodes:[
      { label:'Autoimunes', children:[
        {label:'Hashimoto', children:['Anti-TPO+ (>90%)','Hipotireoidismo','Risco de linfoma (raro)']},
        {label:'Silenciosa / pós-parto', children:['Indolor, sem VHS↑','1º ano pós-parto','Pode ficar definitiva']} ]},
      { label:'Dolorosas', children:[
        {label:'Subaguda (De Quervain)', children:['Pós-viral, HLA-B35','VHS/PCR↑↑','AINE/corticoide']},
        {label:'Aguda supurativa', children:['Bacteriana','Fístula seio piriforme','Antibiótico ± drenagem']} ]},
      { label:'Riedel (fibrosante)', children:['Pétrea, invasiva (IgG4)','Compressão','Corticoide/tamoxifeno'] },
      { label:'Fármacos', children:[
        {label:'Amiodarona', children:['AIT1: tionamida','AIT2: corticoide','AIH: LT4']},
        {label:'Lítio (hipo/bócio)'},
        {label:'Checkpoint / IFN / TKI'} ]},
      { label:'Regra de ouro', children:['Destrutiva = RAIU baixa','Fase tóxica → suporte','Sem antitireoidiano/RAI'] }
    ]},
  flashcards:[
    {q:'Qual o mecanismo e o padrão laboratorial das tireoidites destrutivas?',a:'A destruição folicular libera hormônio pré-formado, gerando uma fase tireotóxica transitória com captação de iodo (RAIU) baixa, seguida de hipotireoidismo e, em geral, recuperação.'},
    {q:'Como diferenciar clínica e laboratorialmente a tireoidite subaguda de De Quervain?',a:'Tireoide dolorosa e endurecida após infecção viral, febre e VHS/PCR muito elevados, associada ao HLA-B35; captação de iodo baixa e curso trifásico. Trata-se com AINE ou corticoide, sem antitireoidiano.'},
    {q:'O que caracteriza a tireoidite pós-parto e seu risco?',a:'Tireoidite autoimune indolor no primeiro ano após o parto (anti-TPO+), com tireotoxicose seguida de hipotireoidismo; pode recorrer em gestações futuras e evoluir para hipotireoidismo definitivo.'},
    {q:'Como diferenciar e tratar a tireotoxicose por amiodarona tipo 1 e tipo 2?',a:'Tipo 1 é hiperfunção induzida por iodo em glândula anormal (Doppler hipervascular) — trata-se com tionamida (± perclorato); tipo 2 é tireoidite destrutiva (Doppler avascular) — trata-se com corticoide. Há formas mistas.'},
    {q:'O que é a tireoidite de Riedel?',a:'Uma fibrose invasiva rara da tireoide (espectro da doença relacionada a IgG4) que a torna pétrea e aderida, causando sintomas compressivos; trata-se com glicocorticoide e/ou tamoxifeno, reservando a cirurgia para descompressão.'},
    {q:'Qual tireoidite pensar numa criança com quadro infeccioso cervical recorrente?',a:'Tireoidite aguda supurativa por fístula do seio piriforme (geralmente à esquerda), que se trata com antibiótico, drenagem do abscesso e correção da fístula.'}
  ],
  fluxogramas:[]
};

// ── Geração do SQL ──
const fs=require('fs');
function jq(obj,tag){ const j=JSON.stringify(obj); if(j.indexOf('$'+tag+'$')>=0)throw new Error('colisão de tag '+tag); return '$'+tag+'$'+j+'$'+tag+'$'; }

// UPDATE: substitui Graves (tema antigo) e Tireoidites por tema, preservando ordem
const updateSql =
`-- Reescreve "Doença de Graves e Oftalmopatia" -> "Doença de Graves (Hipertireoidismo)" e "Tireoidites"\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', (\n`+
`  SELECT jsonb_agg(\n`+
`    CASE\n`+
`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='Doença de Graves e Oftalmopatia' THEN ${jq(GRAVES,'gv')}::jsonb\n`+
`      WHEN a->>'sub'='Tireoide' AND a->>'privado'='true' AND a->>'tema'='Tireoidites' THEN ${jq(TIREOIDITES,'ti')}::jsonb\n`+
`      ELSE a\n`+
`    END ORDER BY ord)\n`+
`  FROM jsonb_array_elements(payload->'diretrizes') WITH ORDINALITY AS x(a, ord)\n`+
`))\n`+
`WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/update2.sql', updateSql);

// INSERT: novo capítulo Oftalmopatia
const insertSql =
`-- Novo capítulo próprio: Oftalmopatia de Graves\n`+
`UPDATE endodirect_global_state\n`+
`SET payload = jsonb_set(payload, '{diretrizes}', coalesce(payload->'diretrizes','[]'::jsonb) || ${jq([OFTALMO],'of')}::jsonb)\n`+
`WHERE payload ? 'diretrizes';`;
fs.writeFileSync(__dirname+'/insert_oftalmo.sql', insertSql);

console.log('OK. update2.sql bytes:', updateSql.length, '| insert_oftalmo.sql bytes:', insertSql.length);
console.log('Novo:', OFTALMO.tema, '| pts', OFTALMO.pts.length, 'fc', OFTALMO.flashcards.length, 'flux', OFTALMO.fluxogramas.length);
console.log('Graves:', GRAVES.tema, '| pts', GRAVES.pts.length, 'fc', GRAVES.flashcards.length);
console.log('Tireoidites:', TIREOIDITES.tema, '| pts', TIREOIDITES.pts.length, 'fc', TIREOIDITES.flashcards.length);
