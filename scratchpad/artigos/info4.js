// Ficha visual do 4º lote de artigos (Lípides e Osteometabolismo).
// Mesmo schema documentado em info.js.
//
// ⚠️ Números escritos de MEMÓRIA, como o trials4.js. `check_numeros.js` prova
//    apenas COERÊNCIA entre a ficha e a prosa — não veracidade. Só passa a
//    valer como "conferido" depois do PDF.
'use strict';

const INFO4 = {

  // ----------------------------------------------------------------- Lípides

  '4S (1994)': {
    desenho: 'ECR duplo-cego, prevenção secundária',
    pergunta: 'Baixar o colesterol com estatina reduz a mortalidade em quem já tem doença coronariana?',
    chips: ['n = |4.444', 'mediana de |5,4 anos', 'angina ou IAM prévio · CT |212–309 mg/dL'],
    bracos: {
      int: { n: 'Sinvastatina 20 mg/dia', s: 'titulada a 40 mg se o alvo de colesterol não fosse atingido' },
      ctl: { n: 'Placebo', s: 'ambos após período de dieta' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário — e é ele que torna o 4S diferente',
        nome: 'Morte por qualquer causa',
        dir: 'menor', escala: 14,
        barras: [
          { n: 'Sinvastatina', t: '8,2%', v: 8.2, i: 1 },
          { n: 'Placebo', t: '11,5%', v: 11.5 }
        ],
        efeito: { k: 'RR', v: '0,70', p: 'IC95% 0,58–0,85 · p=0,0003' },
        curva: { dur: 5.4, un: 'anos' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Eventos coronarianos maiores',
        dir: 'menor', escala: 30,
        barras: [
          { n: 'Sinvastatina', t: '19,4%', v: 19.4, i: 1 },
          { n: 'Placebo', t: '28,0%', v: 28.0 }
        ],
        efeito: { k: 'Redução', v: '34%', p: 'quase 9 pontos percentuais em termos absolutos' }
      }
    ],
    tiles: [
      { v: '−42%', k: 'Morte coronariana', t: 'good' },
      { v: '−37%', k: 'Necessidade de revascularização', t: 'good' },
      { v: '−35%', k: 'LDL (colesterol total −25%, HDL +8%)', t: 'good' }
    ],
    seg: 'Sem excesso de **câncer** nem de **morte não cardiovascular** — exatamente o medo que travava a área até 1994 — e essa ausência de sinal foi tão decisiva quanto o resultado principal.',
    prat: 'Em **doença coronariana estabelecida**, a estatina passou a ser tratamento com prova de **mortalidade**, não apenas de exame. É o argumento para o paciente que resiste: o desfecho aqui é **sobreviver**.'
  },

  'JUPITER (2008)': {
    desenho: 'ECR duplo-cego, prevenção primária',
    pergunta: 'A estatina previne eventos em quem tem LDL normal mas PCR elevada?',
    chips: ['n = |17.802', 'mediana de |1,9 ano — interrompido por benefício', 'LDL |<130| · PCR-us |≥2,0 mg/L'],
    bracos: {
      int: { n: 'Rosuvastatina 20 mg/dia', s: 'homens ≥50 e mulheres ≥60 anos' },
      ctl: { n: 'Placebo', s: 'sem doença cardiovascular e sem hiperlipidemia' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'IAM, AVC, revascularização, internação por angina instável ou morte cardiovascular',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,56', p: 'IC95% 0,46–0,69 · p<0,00001 — redução de 44%' }
      },
      {
        lab: 'Separação alcançada',
        nome: 'LDL sob rosuvastatina',
        dir: 'menor', escala: 120,
        barras: [
          { n: 'Basal', t: '108 mg/dL', v: 108 },
          { n: 'Em tratamento', t: '55 mg/dL', v: 55, i: 1 }
        ],
        efeito: { k: 'Redução', v: '50%', p: 'com queda de 37% na PCR ultrassensível' }
      }
    ],
    tiles: [
      { v: '0,80', k: 'Morte por qualquer causa (HR) — IC 0,67–0,97', t: 'good' },
      { v: '−54%', k: 'Infarto do miocárdio (AVC −48%)', t: 'good' },
      { v: '3,0% vs 2,4%', k: '⚠️ Diabetes de início recente — p=0,01', t: 'bad' }
    ],
    seg: 'O achado que mudou a bula: **diabetes de início recente 3,0% vs 2,4%** (p=0,01) — hoje reconhecido como **efeito de classe**, real, pequeno e concentrado em quem já tem pré-diabetes. Sem excesso de miopatia grave ou rabdomiólise.',
    prat: 'Legitimou indicar estatina por **risco global**, e não só pelo valor do LDL. A PCR ultrassensível como critério de seleção **não pegou** na rotina; o princípio, sim. E dá o número para a conversa honesta sobre diabetes induzido por estatina — que não anula o benefício.'
  },

  'IMPROVE-IT (2015)': {
    desenho: 'ECR duplo-cego, comparador ativo',
    pergunta: 'Somar um fármaco NÃO estatínico traz benefício adicional após síndrome coronariana aguda?',
    chips: ['n = |18.144', 'mediana de |6 anos', 'pós-SCA · LDL |50–125 mg/dL| em estatina'],
    bracos: {
      int: { n: 'Ezetimiba 10 mg + sinvastatina 40 mg', s: 'inibe a absorção intestinal — mecanismo distinto' },
      ctl: { n: 'Sinvastatina 40 mg + placebo', s: 'comparador ativo, não placebo puro' }
    },
    desfechos: [
      {
        lab: 'Separação alcançada',
        nome: 'LDL em 1 ano',
        dir: 'menor', escala: 80,
        barras: [
          { n: 'Ezetimiba + sinvastatina', t: '53,7 mg/dL', v: 53.7, i: 1 },
          { n: 'Sinvastatina', t: '69,5 mg/dL', v: 69.5 }
        ],
        efeito: { k: 'Diferença', v: '~16 mg/dL', p: 'pequena — e é isso que limita o tamanho do efeito esperado' }
      },
      {
        lab: 'Desfecho primário',
        nome: 'Morte cardiovascular, evento coronariano maior ou AVC',
        dir: 'menor', escala: 40,
        barras: [
          { n: 'Ezetimiba + sinvastatina', t: '32,7%', v: 32.7, i: 1 },
          { n: 'Sinvastatina', t: '34,7%', v: 34.7 }
        ],
        // Sem `curva` de propósito: com 7 anos o eixo do tempo do renderizador
        // cai no passo de 6 e sairia com marcas só em 0 e 6, com a curva
        // terminando fora da última marca. As barras dizem o mesmo sem isso.
        efeito: { k: 'HR', v: '0,936', p: 'IC95% 0,89–0,99 · p=0,016 — 2 pontos percentuais em termos absolutos' }
      }
    ],
    tiles: [
      { v: '−13%', k: 'Infarto do miocárdio', t: 'good' },
      { v: '−21%', k: 'AVC isquêmico', t: 'good' },
      { v: '=', k: 'Mortalidade total — sem diferença', t: 'warn' }
    ],
    seg: 'Sem sinal novo em 6 anos: sem excesso de miopatia, hepatotoxicidade ou câncer. A ezetimiba é bem tolerada e barata.',
    prat: 'O efeito é **pequeno de propósito** — a diferença de LDL entre os braços foi de ~16 mg/dL, e o benefício saiu exatamente na proporção esperada. O que o estudo prova é que **o LDL é o alvo e a via para baixá-lo não importa**: é o alicerce lógico dos inibidores de PCSK9 e do "lower is better".'
  },

  'FOURIER (2017)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'Levar o LDL a valores muito baixos com anti-PCSK9 reduz eventos — e é seguro?',
    chips: ['n = |27.564', 'mediana de |2,2 anos', 'DCV aterosclerótica · LDL |≥70| em estatina'],
    bracos: {
      int: { n: 'Evolocumabe SC', s: '140 mg a cada 2 semanas ou 420 mg/mês' },
      ctl: { n: 'Placebo', s: 'ambos sobre estatina de intensidade moderada a alta' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Morte CV, IAM, AVC, angina instável com internação ou revascularização',
        dir: 'menor', escala: 13,
        barras: [
          { n: 'Evolocumabe', t: '9,8%', v: 9.8, i: 1 },
          { n: 'Placebo', t: '11,3%', v: 11.3 }
        ],
        efeito: { k: 'HR', v: '0,85', p: 'IC95% 0,79–0,92 · p<0,001 — 1,5 ponto percentual em 2,2 anos' },
        curva: { dur: 2.2, un: 'anos' }
      },
      {
        lab: 'Separação alcançada',
        nome: 'LDL sob evolocumabe',
        dir: 'menor', escala: 100,
        barras: [
          { n: 'Basal', t: '92 mg/dL', v: 92 },
          { n: 'Em tratamento', t: '30 mg/dL', v: 30, i: 1 }
        ],
        efeito: { k: 'Redução', v: '59%', p: 'mais da metade dos pacientes abaixo de 25 mg/dL' }
      }
    ],
    tiles: [
      { v: '0,80', k: 'Morte CV, IAM ou AVC (HR) — secundário-chave', t: 'good' },
      { v: '−27%', k: 'Infarto do miocárdio (AVC −21%)', t: 'good' },
      { v: '1,05', k: '⚠️ Morte cardiovascular (HR) — sem benefício', t: 'warn' }
    ],
    seg: 'Nenhum sinal novo, mesmo abaixo de 20 mg/dL de LDL: sem excesso de disfunção cognitiva, catarata, hemorragia cerebral, diabetes de início recente ou disfunção hormonal. O adverso característico é **reação no local da injeção**.',
    prat: 'Indicado em **doença aterosclerótica de muito alto risco que não atinge a meta** com estatina + ezetimiba. Tira do caminho o medo do LDL muito baixo — **não há piso conhecido**. Mas é honesto dizer que **não demonstrou benefício de mortalidade**; a explicação mais provável é o seguimento de apenas 2,2 anos.'
  },

  'ODYSSEY OUTCOMES (2018)': {
    desenho: 'ECR duplo-cego, pós-SCA recente',
    pergunta: 'O anti-PCSK9 reduz eventos logo após uma síndrome coronariana aguda?',
    chips: ['n = |18.924', 'mediana de |2,8 anos', 'SCA de |1 a 12 meses| · LDL |≥70 mg/dL'],
    bracos: {
      int: { n: 'Alirocumabe 75–150 mg SC quinzenal', s: 'titulado para manter o LDL entre 25 e 50 mg/dL' },
      ctl: { n: 'Placebo', s: 'ambos em estatina de alta intensidade' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Morte coronariana, IAM não fatal, AVC isquêmico ou angina instável com internação',
        dir: 'menor', escala: 13,
        barras: [
          { n: 'Alirocumabe', t: '9,5%', v: 9.5, i: 1 },
          { n: 'Placebo', t: '11,1%', v: 11.1 }
        ],
        efeito: { k: 'HR', v: '0,85', p: 'IC95% 0,78–0,93 · p<0,001' },
        curva: { dur: 2.8, un: 'anos' }
      },
      {
        lab: 'O achado que o FOURIER não teve',
        nome: 'Morte por qualquer causa',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,85', p: 'IC95% 0,73–0,98 — significância nominal, desfecho hierarquizado' }
      }
    ],
    tiles: [
      { v: '87 → 40', k: 'LDL médio (mg/dL) ao longo do estudo', t: 'good' },
      { v: '≥100', k: 'LDL basal (mg/dL) — é aí que o benefício se concentra', t: 'good' },
      { v: '25–50', k: 'Faixa-alvo de LDL: dose titulada por faixa, desenho incomum' }
    ],
    seg: 'Excesso apenas de **reações no local da injeção**. Nenhum sinal atribuível ao LDL muito baixo — o protocolo reduzia a dose se caísse abaixo de 15 mg/dL.',
    prat: 'É o irmão do FOURIER com **população de maior risco e seguimento maior**, e foi por isso que a mortalidade apareceu. O ganho **não é homogêneo**: concentra-se em quem entra com **LDL basal ≥100 mg/dL**. O anti-PCSK9 rende mais em quem está **mais longe da meta**, não em quem já está perto dela.'
  },

  'REDUCE-IT (2019)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'O icosapento de etila reduz eventos em quem tem LDL controlado mas triglicerídeos altos?',
    chips: ['n = |8.179', 'mediana de |4,9 anos', 'TG |135–499| · LDL |41–100 mg/dL| em estatina'],
    bracos: {
      int: { n: 'Icosapento de etila 4 g/dia', s: 'EPA puro, esterificado — sem DHA' },
      ctl: { n: 'Placebo de óleo mineral', s: '71% em prevenção secundária' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Morte cardiovascular, IAM, AVC, revascularização ou angina instável',
        dir: 'menor', escala: 25,
        barras: [
          { n: 'Icosapento de etila', t: '17,2%', v: 17.2, i: 1 },
          { n: 'Placebo', t: '22,0%', v: 22.0 }
        ],
        efeito: { k: 'HR', v: '0,75', p: 'IC95% 0,68–0,83 · p<0,001 — 4,8 pontos percentuais de redução absoluta' },
        curva: { dur: 4.9, un: 'anos' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Morte cardiovascular',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,80', p: 'no mesmo sentido: IAM −31% e AVC −28%' }
      }
    ],
    tiles: [
      { v: '−18%', k: 'Triglicerídeos — e o benefício NÃO acompanhou essa queda', t: 'warn' },
      { v: '5,3% vs 3,9%', k: '⚠️ Fibrilação atrial', t: 'bad' },
      { v: '2,7% vs 2,1%', k: '⚠️ Sangramento', t: 'bad' }
    ],
    seg: '**Fibrilação atrial 5,3% vs 3,9%** e **sangramento 2,7% vs 2,1%** — atenção redobrada em quem usa anticoagulante ou dupla antiagregação. Perguntar sobre palpitações e sangramento no seguimento.',
    prat: '⚠️ O comparador foi **óleo mineral**, e no braço placebo o LDL subiu ~10% e a PCR ~30%: parte do efeito pode vir de o placebo ter **piorado**. O **STRENGTH**, com óleo de milho, foi negativo. Posição defensável: efeito **provavelmente real, de magnitude incerta**. Faz sentido em prevenção secundária com TG persistentemente altos — e **cápsula de óleo de peixe não é** icosapento de etila.'
  },

  // -------------------------------------------------------- Osteometabolismo

  'FIT (1996)': {
    desenho: 'ECR duplo-cego — braço com fratura vertebral prévia',
    pergunta: 'O alendronato previne novas fraturas em quem já fraturou vértebra?',
    chips: ['n = |2.027', '|3 anos', 'pós-menopausa, |55–81 anos| · fratura vertebral prévia'],
    bracos: {
      int: { n: 'Alendronato 5 mg/dia', s: 'elevado a 10 mg/dia no 3º ano' },
      ctl: { n: 'Placebo', s: 'cálcio e vitamina D oferecidos aos dois braços' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Nova fratura vertebral radiográfica em 3 anos',
        dir: 'menor', escala: 18,
        barras: [
          { n: 'Alendronato', t: '8,0%', v: 8.0, i: 1 },
          { n: 'Placebo', t: '15,0%', v: 15.0 }
        ],
        efeito: { k: 'RR', v: '0,53', p: 'redução de 47% — e já detectável no primeiro ano' }
      },
      {
        lab: 'O desfecho que realmente conta',
        nome: 'Fratura de quadril',
        dir: 'menor', escala: 3,
        barras: [
          { n: 'Alendronato', t: '1,1%', v: 1.1, i: 1 },
          { n: 'Placebo', t: '2,2%', v: 2.2 }
        ],
        efeito: { k: 'RR', v: '0,49', p: 'a fratura que carrega mortalidade em torno de 20% no primeiro ano' }
      }
    ],
    tiles: [
      { v: '0,52', k: 'Fratura de punho (RR)', t: 'good' },
      { v: '−28%', k: 'Qualquer fratura clínica — 13,6% vs 18,2%', t: 'good' },
      { v: '+6,2%', k: 'DMO de coluna (colo femoral +4,1%)', t: 'good' }
    ],
    seg: 'Sem excesso de eventos gastrointestinais graves em relação ao placebo neste estudo. Fratura atípica de fêmur e osteonecrose de mandíbula só apareceriam depois, com a experiência pós-comercialização — o seguimento aqui foi de 3 anos.',
    prat: '**Fratura vertebral prévia = tratar**, independentemente do valor da densitometria: é o cenário de maior benefício absoluto. Cálcio e vitamina D são **base**, não tratamento — o braço placebo já os recebia. No braço sem fratura prévia, o benefício em fratura clínica apareceu só com **T-escore ≤ −2,5**, e é daí que vem o limiar usado até hoje.'
  },

  'HORIZON-PFT (2007)': {
    desenho: 'ECR duplo-cego, infusão anual',
    pergunta: 'Uma infusão anual de zoledronato previne fraturas na osteoporose pós-menopausa?',
    chips: ['n = |3.889', '|3 anos| — 3 infusões', 'pós-menopausa · T-escore |≤ −2,5'],
    bracos: {
      int: { n: 'Ácido zoledrônico 5 mg IV uma vez ao ano', s: 'infusão de 15 minutos' },
      ctl: { n: 'Placebo', s: 'cálcio e vitamina D em ambos os braços' }
    },
    desfechos: [
      {
        lab: 'Co-primário',
        nome: 'Nova fratura vertebral morfométrica em 3 anos',
        dir: 'menor', escala: 12,
        barras: [
          { n: 'Zoledronato', t: '3,3%', v: 3.3, i: 1 },
          { n: 'Placebo', t: '10,9%', v: 10.9 }
        ],
        efeito: { k: 'Redução', v: '70%', p: 'a maior magnitude entre os bisfosfonatos' }
      },
      {
        lab: 'Co-primário',
        nome: 'Fratura de quadril',
        dir: 'menor', escala: 3,
        barras: [
          { n: 'Zoledronato', t: '1,4%', v: 1.4, i: 1 },
          { n: 'Placebo', t: '2,5%', v: 2.5 }
        ],
        efeito: { k: 'Redução', v: '41%' }
      }
    ],
    tiles: [
      { v: '−25%', k: 'Fratura não vertebral — 8,0% vs 10,7%', t: 'good' },
      { v: '−33%', k: 'Qualquer fratura clínica — 8,4% vs 12,8%', t: 'good' },
      { v: '1,3% vs 0,5%', k: '⚠️ Fibrilação atrial como evento adverso grave', t: 'bad' }
    ],
    seg: '**Reação de fase aguda** — febre, mialgia, artralgia, cefaleia — em cerca de **32% após a primeira infusão**, e bem menos nas seguintes (~7% e ~3%). É autolimitada e responde a paracetamol: **avisar antes é o que evita a paciente recusar a segunda dose**. ⚠️ **Fibrilação atrial grave 1,3% vs 0,5%** (p<0,001), nunca bem explicada. Exige clearance acima de ~35 mL/min e correção prévia de hipocalcemia e de vitamina D.',
    prat: 'Primeira escolha **quando a adesão é o problema** — e ela quase sempre é: uma infusão por ano no lugar de 365 comprimidos em jejum. Também na intolerância ou contraindicação gastrointestinal ao oral, e após fratura de quadril.'
  },

  'FREEDOM (2009)': {
    desenho: 'ECR duplo-cego, anti-RANKL',
    pergunta: 'O denosumabe previne fraturas na osteoporose pós-menopausa?',
    chips: ['n = |7.868', '|3 anos', 'pós-menopausa, |60–90 anos| · T-escore |−2,5 a −4,0'],
    bracos: {
      int: { n: 'Denosumabe 60 mg SC a cada 6 meses', s: 'anticorpo anti-RANKL — potente e completamente reversível' },
      ctl: { n: 'Placebo', s: 'cálcio e vitamina D em ambos os braços' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Nova fratura vertebral em 3 anos',
        dir: 'menor', escala: 9,
        barras: [
          { n: 'Denosumabe', t: '2,3%', v: 2.3, i: 1 },
          { n: 'Placebo', t: '7,2%', v: 7.2 }
        ],
        efeito: { k: 'Redução', v: '68%' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Fratura de quadril',
        dir: 'menor', escala: 2,
        barras: [
          { n: 'Denosumabe', t: '0,7%', v: 0.7, i: 1 },
          { n: 'Placebo', t: '1,2%', v: 1.2 }
        ],
        efeito: { k: 'Redução', v: '40%' }
      }
    ],
    tiles: [
      { v: '−20%', k: 'Fratura não vertebral — 6,5% vs 8,0%', t: 'good' },
      { v: '+9,2%', k: 'DMO de coluna (quadril total +6,0%)', t: 'good' },
      { v: 'rebote', k: '⚠️ Suspender causa perda rápida e fratura vertebral múltipla', t: 'bad' }
    ],
    seg: 'Nos 3 anos do estudo, perfil semelhante ao placebo. ⚠️ **O problema real apareceu depois**: como o denosumabe **não se incorpora ao osso**, suspendê-lo provoca **rebote de reabsorção**, com perda rápida de toda a DMO ganha e **fraturas vertebrais múltiplas**, às vezes em quem nunca havia fraturado. **Atraso na dose importa** — a janela de 6 meses não é sugestão.',
    prat: 'Boa opção **quando há disfunção renal** (com atenção redobrada à hipocalcemia) e o maior ganho de DMO entre os antirreabsortivos — que continua subindo ano após ano. Mas quem inicia assume um **compromisso de continuidade** ou de **transição planejada para bisfosfonato**: combinar isso na primeira consulta é parte da prescrição.'
  },

  'Teriparatida — Neer (2001)': {
    desenho: 'ECR duplo-cego, interrompido precocemente',
    pergunta: 'Um agente ANABÓLICO previne fraturas em quem já fraturou vértebra?',
    chips: ['n = |1.637', 'mediana de |21 meses| — interrompido', 'pós-menopausa · fratura vertebral prévia'],
    bracos: {
      int: { n: 'Teriparatida 20 µg SC/dia', s: 'PTH 1-34 em pulsos diários — houve também braço de 40 µg' },
      ctl: { n: 'Placebo', s: 'cálcio e vitamina D em ambos os braços' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Nova fratura vertebral',
        dir: 'menor', escala: 16,
        barras: [
          { n: 'Teriparatida 20 µg', t: '5%', v: 5, i: 1 },
          { n: 'Placebo', t: '14%', v: 14 }
        ],
        efeito: { k: 'Redução', v: '65%', p: 'e 90% nas fraturas vertebrais moderadas ou graves' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Fratura não vertebral por fragilidade',
        dir: 'menor', escala: 8,
        barras: [
          { n: 'Teriparatida 20 µg', t: '3%', v: 3, i: 1 },
          { n: 'Placebo', t: '6%', v: 6 }
        ],
        efeito: { k: 'Redução', v: '53%' }
      }
    ],
    tiles: [
      { v: '+9,7%', k: 'DMO de coluna (colo femoral +2,8%)', t: 'good' },
      { v: '40 µg', k: 'Não foi melhor em fratura e teve mais adversos que 20 µg', t: 'warn' },
      { v: '24 meses', k: 'Limite de uso em bula, herdado do alarme em roedores', t: 'warn' }
    ],
    seg: 'Náusea, cefaleia, cãibras e **hipercalcemia transitória**, em geral leve. O **osteossarcoma em ratos** expostos a doses altas por quase toda a vida interrompeu o estudo e gerou o limite em bula — mas **não se confirmou em humanos** após mais de duas décadas de vigilância. Contraindicada em doença óssea de alto turnover, hiperparatireoidismo, radioterapia óssea prévia e hipercalcemia.',
    prat: 'Reservada para **osteoporose grave**: múltiplas fraturas, T-escore muito baixo ou falha do antirreabsortivo. **A sequência importa — anabólico primeiro, antirreabsortivo depois.** Anabólico depois de antirreabsortivo rende menos, e emendar um antirreabsortivo ao terminar é obrigatório: sem isso, o osso formado se perde.'
  },

  'ARCH (2017)': {
    desenho: 'ECR duplo-cego, comparador ativo',
    pergunta: 'Romosozumabe seguido de alendronato é superior ao alendronato desde o início?',
    chips: ['n = |4.093', '|24 meses', 'pós-menopausa · fratura por fragilidade prévia'],
    bracos: {
      int: { n: 'Romosozumabe 210 mg SC/mês por 12 meses', s: 'anti-esclerostina — forma osso e freia reabsorção; depois alendronato' },
      ctl: { n: 'Alendronato do início ao fim', s: 'comparador ATIVO, não placebo' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Nova fratura vertebral em 24 meses',
        dir: 'menor', escala: 14,
        barras: [
          { n: 'Romo → alendronato', t: '6,2%', v: 6.2, i: 1 },
          { n: 'Alendronato', t: '11,9%', v: 11.9 }
        ],
        efeito: { k: 'Redução', v: '48%', p: 'contra um comparador que já é tratamento eficaz' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Fratura de quadril',
        dir: 'menor', escala: 4,
        barras: [
          { n: 'Romo → alendronato', t: '2,0%', v: 2.0, i: 1 },
          { n: 'Alendronato', t: '3,2%', v: 3.2 }
        ],
        efeito: { k: 'Redução', v: '38%' }
      }
    ],
    tiles: [
      { v: '−19%', k: 'Fratura não vertebral — 8,7% vs 10,6%', t: 'good' },
      { v: '−27%', k: 'Fratura clínica — 9,7% vs 13,0%', t: 'good' },
      { v: '2,5% vs 1,9%', k: '⚠️ Eventos cardiovasculares graves no 1º ano', t: 'bad' }
    ],
    seg: '⚠️ **Eventos cardiovasculares graves 2,5% vs 1,9%** no primeiro ano — o período com romosozumabe —, incluindo infarto, AVC e morte cardiovascular. O sinal **não apareceu no FRAME**, que comparou com placebo, o que levantou a hipótese de um efeito protetor do alendronato; é hipótese, não explicação estabelecida. Consequência regulatória direta: **contraindicado em quem teve infarto ou AVC no último ano**.',
    prat: '**Perguntar sobre infarto e AVC no último ano antes de prescrever** — é a pergunta que muda a conduta, e não é intuitiva num fármaco ósseo. Indicado na osteoporose grave de risco iminente, sobretudo após falha de antirreabsortivo. O efeito dura cerca de **12 meses**: planejar desde o início a transição para bisfosfonato ou denosumabe.'
  }

};

module.exports = { INFO4 };
