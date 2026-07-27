// Ficha visual do 2º lote de artigos. Mesmo schema documentado em info.js.
// Os 3 artigos-comparativo (Programa STEP / SURMOUNT / SURPASS) NÃO entram aqui
// de propósito: sem `info`, o card cai no texto corrido e renderiza a tabela.
'use strict';

const INFO2 = {

  'DCCT (1993)': {
    desenho: 'ECR, duas coortes',
    pergunta: 'No diabetes tipo 1, o controle glicêmico intensivo previne complicações microvasculares?',
    chips: ['n = |1.441', 'média de |6,5 anos', '13–39 anos · sem doença CV'],
    bracos: {
      int: { n: 'Intensivo — 3+ aplicações/dia ou bomba', s: 'automonitorização ≥4×/dia, alvo quase normal' },
      ctl: { n: 'Convencional — 1 a 2 aplicações/dia', s: 'o padrão da época, sem ajuste por glicemia' }
    },
    desfechos: [
      {
        lab: 'Separação glicêmica alcançada',
        nome: 'HbA1c média ao longo do seguimento',
        dir: 'menor', escala: 11,
        barras: [
          { n: 'Intensivo', t: '~7,2%', v: 7.2, i: 1 },
          { n: 'Convencional', t: '~9,1%', v: 9.1 }
        ],
        efeito: { k: 'Separação', v: '~1,9 ponto', p: 'maior que a de qualquer estudo moderno — é o que dá poder ao DCCT' }
      },
      {
        lab: 'Desfecho primário',
        nome: 'Retinopatia — aparecimento (prevenção primária) e progressão (intervenção secundária)',
        dir: 'menor',
        efeito: { k: 'Redução', v: '−76% e −54%', p: 'aparecimento na coorte sem retinopatia; progressão na coorte com retinopatia leve' }
      }
    ],
    tiles: [
      { v: '−39%', k: 'Microalbuminúria', t: 'good' },
      { v: '−54%', k: 'Albuminúria', t: 'good' },
      { v: '−60%', k: 'Neuropatia clínica', t: 'good' },
      { v: '~3×', k: 'Hipoglicemia grave — o preço do intensivo', t: 'bad' }
    ],
    seg: '**Hipoglicemia grave cerca de 3 vezes mais frequente** no braço intensivo, além de mais ganho de peso. É o efeito que define o limite da estratégia.',
    prat: 'Prova fundadora de que a **glicemia causa** complicação microvascular. O seguimento EDIC mostrou que o benefício persistiu por décadas mesmo depois da HbA1c se igualar — a **memória metabólica** —, o que justifica ser agressivo **desde o diagnóstico**.'
  },

  'ACCORD (2008)': {
    desenho: 'ECR, interrompido por dano',
    pergunta: 'Em DM2 de alto risco cardiovascular, levar a HbA1c a menos de 6,0% reduz eventos?',
    chips: ['n = |10.251', 'parado em |3,5| anos', 'HbA1c basal 8,1% · alto risco CV'],
    bracos: {
      int: { n: 'Intensivo — alvo de HbA1c <6,0%', s: 'combinação agressiva, sem restrição de classe' },
      ctl: { n: 'Padrão — alvo de 7,0 a 7,9%', s: 'terapia convencional' }
    },
    desfechos: [
      {
        lab: 'Separação glicêmica alcançada',
        nome: 'HbA1c média alcançada',
        dir: 'menor', escala: 9,
        barras: [
          { n: 'Intensivo', t: '6,4%', v: 6.4, i: 1 },
          { n: 'Padrão', t: '7,5%', v: 7.5 }
        ]
      },
      {
        lab: '⚠️ O achado que parou o estudo',
        nome: 'Morte por qualquer causa',
        dir: 'menor', escala: 7,
        barras: [
          { n: 'Intensivo', t: '5,0%', v: 5.0, i: 1 },
          { n: 'Padrão', t: '4,0%', v: 4.0 }
        ],
        efeito: { k: 'HR', v: '1,22', p: 'IC95% 1,01–1,46 — 257 mortes contra 203; MAIS morte no braço intensivo' }
      },
      {
        lab: 'Desfecho primário',
        nome: 'MACE — IAM não fatal, AVC não fatal ou morte cardiovascular',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,90', p: 'IC95% 0,78–1,04 — NÃO significativo' }
      }
    ],
    tiles: [
      { v: '1,35', k: 'Morte cardiovascular (HR) — IC 1,04–1,76', t: 'bad' },
      { v: '0,76', k: 'IAM não fatal (HR) — menos infarto, mais morte', t: 'good' },
      { v: '16,2%', k: 'Hipoglicemia grave (vs 5,1%)', t: 'bad' },
      { v: '27,8%', k: 'Ganho de peso >10 kg (vs 14,1%)', t: 'warn' }
    ],
    segIco: '🛑',
    seg: '**Hipoglicemia grave exigindo assistência: 16,2% vs 5,1%.** Ganho de peso acima de 10 kg em **27,8% vs 14,1%**. O mecanismo do excesso de mortalidade **nunca foi estabelecido** — a honestidade aqui importa: o estudo prova o dano, não a explicação.',
    prat: 'Encerrou a lógica do "quanto menor, melhor" e fundou a **individualização do alvo**. Reposicionou a pergunta: o que reduz evento cardiovascular no DM2 não é a **intensidade** do controle, e sim **qual fármaco**.'
  },

  'REWIND (2019)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'Em DM2 majoritariamente SEM doença cardiovascular prévia, a dulaglutida reduz eventos cardiovasculares?',
    chips: ['n = |9.901', 'mediana de |5,4 anos', '|69%| em prevenção primária'],
    bracos: {
      int: { n: 'Dulaglutida 1,5 mg/semana SC', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — morte CV, IAM não fatal ou AVC não fatal',
        dir: 'menor', escala: 17,
        barras: [
          { n: 'Dulaglutida', t: '12,0%', v: 12.0, i: 1 },
          { n: 'Placebo', t: '13,4%', v: 13.4 }
        ],
        efeito: { k: 'HR', v: '0,88', p: 'IC95% 0,79–0,99 · p=0,026 — efeito consistente com e sem doença CV prévia' },
        curva: { dur: 5.4, un: 'anos' }
      }
    ],
    tiles: [
      { v: '0,76', k: 'AVC não fatal (HR) — o que mais contribuiu', t: 'good' },
      { v: '0,85', k: 'Composto renal (HR) — por albuminúria', t: 'good' },
      { v: '0,90', k: 'Morte por qualquer causa (HR) — não significativa' },
      { v: '7,3%', k: 'HbA1c basal — população já controlada' }
    ],
    seg: 'Eventos **gastrointestinais** foram os mais comuns. Sem excesso de pancreatite ou de neoplasia.',
    prat: 'É o estudo que sustenta GLP-1 em **prevenção primária** no DM2. Com HbA1c basal de 7,3% e queda de apenas 0,61 ponto, o benefício **não veio de corrigir descontrole** — veio do fármaco.'
  },

  'STEP-2 (2021)': {
    desenho: 'ECR duplo-cego, três braços',
    pergunta: 'Em adultos com obesidade E diabetes tipo 2, qual a eficácia da semaglutida 2,4 mg?',
    chips: ['n = |1.210', '|68 semanas', 'IMC ≥27 · HbA1c 7–10%'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'dose de obesidade' },
      ctl: { n: 'Placebo', s: 'houve também braço de semaglutida 1,0 mg' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 12,
        barras: [
          { n: 'Semaglutida 2,4 mg', t: '−9,6%', v: 9.6, i: 1 },
          { n: 'Semaglutida 1,0 mg', t: '−7,0%', v: 7.0, i: 1 },
          { n: 'Placebo', t: '−3,4%', v: 3.4 }
        ],
        efeito: { k: 'Diferença', v: '−6,2 pp', p: 'da dose de 2,4 mg contra placebo' },
        // Painel C da Figura 2 (período in-trial): proporção que atinge cada meta
        // nos TRÊS braços. É o painel que mostra a dose de 1,0 mg no meio do
        // caminho — a resposta é dose-dependente no eixo inteiro, não só na média.
        grupos: {
          bracos: ['Semaglutida 2,4 mg', 'Semaglutida 1,0 mg', 'Placebo'],
          eixo: 'meta de redução do peso em 68 semanas',
          fig: 'Figura 2C',
          cats: [
            { k: '≥5%',  vs: [68.8, 57.1, 28.5] },
            { k: '≥10%', vs: [45.6, 28.7, 8.2] },
            { k: '≥15%', vs: [25.8, 13.7, 3.2] },
            { k: '≥20%', vs: [13.1, 4.7, 1.6] }
          ],
          nota: 'A dose de **1,0 mg** fica sistematicamente entre as outras duas.'
        },
        // Painel A da Figura 2: peso ao longo das 68 semanas, nos três braços.
        // Pontos extraídos do vetor do PDF e calibrados pelas marcas do eixo.
        // ⚠️ São médias OBSERVADAS (o que a figura publica). Os números-manchete
        // −9,6 / −7,0 / −3,4 são ESTIMADOS pelo estimando — daí a pequena
        // diferença nas pontas. A nota do gráfico diz isso.
        series: [{
          tit: 'Peso ao longo do tempo (média observada, in-trial)',
          eixo: 'semanas desde a randomização', fig: 'Figura 2A',
          min: -11, max: 0, ticks: [0, -5, -10], dec: 1, tempos: [0, 20, 36, 52, 68],
          linhas: [
            { n: 'Semaglutida 2,4 mg', pts: [[0,0],[4,-1.8],[8,-3.2],[12,-4.8],[16,-6.1],[20,-7.4],[28,-8.7],[36,-9.4],[44,-9.8],[52,-10.1],[60,-10.1],[68,-9.9]] },
            { n: 'Semaglutida 1,0 mg', pts: [[0,0],[4,-1.6],[8,-2.9],[12,-4.2],[16,-5.1],[20,-5.8],[28,-6.5],[36,-7.1],[44,-7.5],[52,-7.6],[60,-7.3],[68,-7.2]] },
            { n: 'Placebo', pts: [[0,0],[4,-0.8],[8,-1.5],[12,-1.8],[16,-2.1],[20,-2.6],[28,-2.7],[36,-3.0],[44,-3.0],[52,-3.3],[60,-3.1],[68,-3.2]] }
          ],
          nota: 'A curva é de médias **observadas**; os números do desfecho (−9,6 / −7,0 / −3,4) são **estimados** pelo estimando, por isso as pontas não coincidem exatamente. O platô vem por volta da **semana 52**.'
        }]
      }
    ],
    tiles: [
      { v: '68,8%', k: 'Perda ≥5% com 2,4 mg (vs 28,5%)', t: 'good' },
      { v: '−1,6', k: 'Ponto de HbA1c com 2,4 mg', t: 'good' },
      { v: '−9,6%', k: 'contra −14,9% do STEP-1, sem diabetes', t: 'warn' }
    ],
    seg: 'Perfil da classe: **gastrointestinais** na titulação. **Hipoglicemia** é rara com semaglutida isolada, mas o risco existe com **sulfonilureia ou insulina** — reduzir a dose desses ao iniciar.',
    prat: 'O número que importa na consulta: **ter diabetes reduz a perda**. Prometer 15% para quem tem DM2 é prometer o que o estudo não mostrou — a expectativa correta é de **~10%**.'
  },

  'SURMOUNT-2 (2023)': {
    desenho: 'ECR duplo-cego',
    pergunta: 'Em adultos com obesidade E diabetes tipo 2, qual a eficácia da tirzepatida?',
    chips: ['n = |938', '|72 semanas', 'IMC ≥27 · HbA1c 7–10%'],
    bracos: {
      int: { n: 'Tirzepatida 10 ou 15 mg/semana SC', s: 'agonista duplo GIP/GLP-1' },
      ctl: { n: 'Placebo', s: 'ambos com estilo de vida' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 18,
        barras: [
          { n: 'Tirzepatida 15 mg', t: '−14,7%', v: 14.7, i: 1 },
          { n: 'Tirzepatida 10 mg', t: '−12,8%', v: 12.8, i: 1 },
          { n: 'Placebo', t: '−3,2%', v: 3.2 }
        ],
        efeito: { k: 'Diferença', v: '−11,5 pp', p: 'da dose de 15 mg contra placebo' }
      }
    ],
    tiles: [
      { v: '79–83%', k: 'Perda ≥5% conforme a dose (vs 32%)', t: 'good' },
      { v: '~−2,1', k: 'Pontos de HbA1c', t: 'good' },
      { v: '−14,7%', k: 'contra −20,9% do SURMOUNT-1, sem diabetes', t: 'warn' }
    ],
    seg: 'Perfil da classe: **náusea, diarreia, vômito, constipação**, no escalonamento. **Hipoglicemia** rara sem sulfonilureia ou insulina.',
    prat: 'Mesma lição do STEP-2, do outro lado da classe: **com diabetes a perda é menor**. Ainda assim é a maior magnitude disponível nessa população, e a queda de ~2 pontos de HbA1c costuma permitir **desescalonar insulina ou sulfonilureia**.'
  },

  'STEP-4 (2021)': {
    desenho: 'Retirada randomizada 2:1',
    pergunta: 'Depois de emagrecer com semaglutida, o que acontece ao suspender o tratamento?',
    chips: ['n = |803| randomizados', 'semana |20| à |68', 'após escalonamento aberto'],
    bracos: {
      int: { n: 'Continuar semaglutida 2,4 mg', s: 'já haviam perdido ~10,6% na fase aberta' },
      ctl: { n: 'Trocar por placebo', s: 'mesma fase aberta antes de randomizar' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação do peso da semana 20 à 68 — o período APÓS a randomização',
        dir: 'maior', escala: 10,
        barras: [
          { n: 'Continuou', t: '−7,9%', v: 7.9, i: 1 },
          { n: 'Suspendeu', t: '+6,9%', v: 6.9 }
        ],
        efeito: { k: 'Diferença', v: '−14,8 pp', p: 'IC95% −16,0 a −13,5 · p<0,001 — quem parou REGANHOU' }
      }
    ],
    tiles: [
      { v: '−17,4%', k: 'Total em 68 semanas, continuando', t: 'good' },
      { v: '−5,0%', k: 'Total em 68 semanas, tendo suspendido', t: 'bad' },
      { v: '↩', k: 'Pressão, lipídios e PCR também regrediram', t: 'bad' }
    ],
    seg: 'Perfil da classe no braço que continuou: **gastrointestinais** predominantes.',
    prat: 'A prova de que a obesidade se comporta como **doença crônica**. Muda a conversa de "quando eu paro?" para "como eu mantenho?" — e isso precisa entrar na **primeira** consulta, junto com custo e acesso.'
  },

  'SURMOUNT-4 (2024)': {
    desenho: 'Retirada randomizada',
    pergunta: 'Depois de emagrecer com tirzepatida, manter ou suspender o tratamento?',
    chips: ['n = |670| randomizados', 'semana |36| à |88', 'lead-in aberto de −20,9%'],
    bracos: {
      int: { n: 'Continuar tirzepatida', s: 'dose máxima tolerada, 10 ou 15 mg' },
      ctl: { n: 'Trocar por placebo', s: 'mesmo lead-in antes de randomizar' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação do peso da semana 36 à 88 — o período APÓS a randomização',
        // SEM `dir`: mesma razão do SURMOUNT-MAINTAIN — a barra maior (+14,0%)
        // é a pior, então "↑ maior é melhor" inverteria a leitura.
        escala: 16,
        barras: [
          { n: 'Continuou', t: '−5,5%', v: 5.5, i: 1 },
          { n: 'Suspendeu', t: '+14,0%', v: 14.0 }
        ],
        efeito: { k: 'Diferença', v: '−19,5 pp', p: 'o reganho de quem parou consumiu dois terços do que havia perdido' }
      }
    ],
    tiles: [
      { v: '89,5%', k: 'Mantiveram ≥80% da perda, continuando', t: 'good' },
      { v: '16,6%', k: 'Mantiveram ≥80% da perda, tendo suspendido', t: 'bad' },
      { v: '−25,3%', k: 'Total em 88 semanas, continuando', t: 'good' },
      { v: '−9,9%', k: 'Total em 88 semanas, tendo suspendido' }
    ],
    seg: 'Perfil da classe: **gastrointestinais**, leves a moderados.',
    prat: 'Confirma com a tirzepatida o que o STEP-4 mostrou com a semaglutida — e com 52 semanas de observação, o dobro. Dá o número para a conversa: **suspender devolve cerca de dois terços** do que se perdeu, em um ano.'
  },

  'STEP-9 (2024)': {
    desenho: 'ECR duplo-cego, dois co-primários',
    pergunta: 'Em obesidade com osteoartrite de joelho sintomática, a semaglutida reduz a DOR?',
    chips: ['n = |407', '|68 semanas', 'IMC ≥30 · gonartrose moderada'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'com aconselhamento de estilo de vida' },
      ctl: { n: 'Placebo', s: 'com aconselhamento de estilo de vida' }
    },
    desfechos: [
      {
        lab: 'Co-primário 1',
        nome: 'Dor no joelho — escore WOMAC (0 a 100; menor é melhor)',
        dir: 'maior', escala: 50,
        barras: [
          { n: 'Semaglutida', t: '−41,7', v: 41.7, i: 1 },
          { n: 'Placebo', t: '−27,5', v: 27.5 }
        ],
        efeito: { k: 'Diferença', v: '−14,1 pontos', p: 'IC95% −20,3 a −7,8 · p<0,001' }
      },
      {
        lab: 'Co-primário 2',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 16,
        barras: [
          { n: 'Semaglutida', t: '−13,7%', v: 13.7, i: 1 },
          { n: 'Placebo', t: '−3,2%', v: 3.2 }
        ],
        efeito: { k: 'Diferença', v: '−10,5 pp', p: 'p<0,001' }
      }
    ],
    tiles: [
      { v: '↑', k: 'Função física (SF-36)', t: 'good' },
      { v: '−27,5', k: 'Resposta no placebo — efeito placebo em dor é grande', t: 'warn' }
    ],
    segIco: '🔍',
    seg: 'Perfil da classe: **gastrointestinais**. Leia com cuidado o desfecho: **dor é relatada pelo paciente** e quem perde 14% do peso percebe — o cegamento é imperfeito, e a resposta no placebo foi expressiva (−27,5 pontos).',
    prat: 'Dá desfecho **centrado no sintoma** para tratar a obesidade em quem tem gonartrose — a queixa que traz o paciente ao consultório. Não avalia estrutura articular nem necessidade de artroplastia, e não substitui fisioterapia.'
  },

  'SURMOUNT-MAINTAIN (2026)': {
    desenho: 'Retirada e redução randomizadas',
    pergunta: 'Depois de emagrecer com tirzepatida na dose máxima, manter a dose, reduzir para 5 mg ou parar?',
    chips: ['n = |378| randomizados', 'semana |60| à |112', 'lead-in aberto de 60 semanas'],
    bracos: {
      int: { n: 'Manter a dose máxima tolerada', s: '10 ou 15 mg/semana' },
      ctl: { n: 'Placebo', s: 'houve também braço de redução para 5 mg' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso da semana 0 à 112 — inclui a fase aberta',
        dir: 'maior', escala: 25,
        barras: [
          { n: 'Tirzepatida MTD', t: '−21,9%', v: 21.9, i: 1 },
          { n: 'Tirzepatida 5 mg', t: '−16,6%', v: 16.6, i: 1 },
          { n: 'Placebo', t: '−9,9%', v: 9.9 }
        ],
        efeito: { k: 'Diferença', v: '−12,0 pp', p: 'da MTD contra placebo; −6,6 pp com 5 mg — p<0,0001 nos dois' }
      },
      {
        lab: 'O período que responde à pergunta',
        nome: 'Variação do peso da semana 60 à 112 — depois da randomização',
        // SEM `dir` de propósito: as barras aqui misturam perda (−0,2%) e reganho
        // (+15,2%) na mesma escala de magnitude. O rótulo "↑ maior é melhor"
        // leria a maior barra — a do placebo — como a melhor, que é o oposto.
        escala: 17,
        barras: [
          { n: 'Manteve a MTD', t: '−0,2%', v: 0.2, i: 1 },
          { n: 'Reduziu para 5 mg', t: '+7,0%', v: 7.0, i: 1 },
          { n: 'Trocou por placebo', t: '+15,2%', v: 15.2 }
        ],
        efeito: { k: 'Diferença', v: '−15,4 pp', p: 'manter contra parar; reduzir para 5 mg contra parar dá −8,2 pp' },
        // Duas proporções do mesmo sentido (maior é melhor), nos três braços.
        // A de resgate (8% · 25% · 67%) fica FORA daqui de propósito: é o único
        // número em que maior é pior, e misturá-lo inverteria a leitura do gráfico.
        grupos: {
          bracos: ['Tirzepatida MTD', 'Tirzepatida 5 mg', 'Placebo'],
          eixo: 'proporção de participantes na semana 112',
          cats: [
            { k: 'Manteve ≥80% da perda', vs: [77.5, 42.4, 10.4] },
            { k: 'Pré-diabetes com HbA1c <5,7%', vs: [92.7, 84.4, 51.0] }
          ],
          nota: 'A dose de **5 mg** fica entre as outras duas nas duas medidas — reduzir preserva parte do resultado, mas não tudo.'
        }
      }
    ],
    tiles: [
      { v: '−0,2%', k: 'Peso na manutenção, mantendo a dose máxima', t: 'good' },
      { v: '+7,0%', k: 'Reganho ao reduzir para 5 mg', t: 'warn' },
      { v: '+15,2%', k: 'Reganho ao trocar por placebo', t: 'bad' },
      { v: '67%', k: 'Precisaram de resgate tendo parado — contra 8% mantendo', t: 'bad' }
    ],
    seg: 'Perfil da classe: **eventos gastrointestinais**, em geral **leves a moderados** e concentrados na fase de escalonamento.',
    prat: 'É o **STEP-4 da tirzepatida com um terceiro braço que importa**: reduzir não é o mesmo que parar. **Manter a dose máxima mantém o peso**; **5 mg** preserva boa parte do resultado; **parar devolve cerca de metade** do que se perdeu.'
  }

};

module.exports = { INFO2 };
