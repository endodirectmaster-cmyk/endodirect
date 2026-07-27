// Ficha visual do 3º lote de artigos. Mesmo schema documentado em info.js.
'use strict';

const INFO3 = {

  'SCOUT (2010)': {
    desenho: 'ECR de segurança cardiovascular',
    pergunta: 'Em quem já tem doença cardiovascular, a sibutramina é segura?',
    chips: ['n = |9.804| randomizados', 'média de |3,4 anos', '≥55 anos · alto risco CV'],
    bracos: {
      int: { n: 'Sibutramina 10–15 mg/dia', s: 'após lead-in aberto de 6 semanas com sibutramina para todos' },
      ctl: { n: 'Placebo', s: 'mesmo lead-in antes de randomizar' }
    },
    desfechos: [
      {
        lab: '⚠️ Desfecho primário',
        nome: 'IAM não fatal, AVC não fatal, parada cardíaca ressuscitada ou morte cardiovascular',
        dir: 'menor', escala: 14,
        barras: [
          { n: 'Sibutramina', t: '11,4%', v: 11.4, i: 1 },
          { n: 'Placebo', t: '10,0%', v: 10.0 }
        ],
        efeito: { k: 'HR', v: '1,16', p: 'IC95% 1,03–1,31 · p=0,02 — MAIS eventos com sibutramina' }
      },
      {
        lab: 'A nuance que costuma se perder',
        nome: 'Mortalidade — não aumentou',
        efeito: { k: 'HR', v: '0,99 e 1,04', p: 'morte cardiovascular e morte por qualquer causa — o excesso foi de eventos NÃO fatais' }
      }
    ],
    tiles: [
      { v: '1,28', k: 'IAM não fatal (HR) — IC 1,04–1,57', t: 'bad' },
      { v: '1,36', k: 'AVC não fatal (HR) — IC 1,04–1,77', t: 'bad' },
      { v: 'B2', k: 'No Brasil: receituário B2 + termo de responsabilidade', t: 'warn' }
    ],
    seg: 'Efeito de classe: **elevação de pressão arterial e de frequência cardíaca** — medir os dois em toda consulta e suspender se houver elevação sustentada.',
    prat: 'É a razão de a sibutramina ser **contraindicada em doença cardiovascular estabelecida**. Retirada na Europa e nos EUA; no Brasil segue autorizada — permanecer disponível **não** é o mesmo que ser indicada, e a seleção do paciente passa a ser inteiramente de quem prescreve.'
  },

  'XENDOS (2004)': {
    desenho: 'ECR duplo-cego de 4 anos',
    pergunta: 'O orlistate somado ao estilo de vida previne diabetes tipo 2 na obesidade?',
    chips: ['n = |3.305', '|4 anos', 'IMC ≥30 · 21% com intolerância à glicose'],
    bracos: {
      int: { n: 'Orlistate 120 mg 3×/dia', s: 'às refeições, sobre dieta e atividade física' },
      ctl: { n: 'Placebo', s: 'mesma dieta e atividade física' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Incidência cumulativa de diabetes tipo 2 em 4 anos',
        dir: 'menor', escala: 10,
        barras: [
          { n: 'Orlistate', t: '6,2%', v: 6.2, i: 1 },
          { n: 'Placebo', t: '9,0%', v: 9.0 }
        ],
        efeito: { k: 'Redução de risco', v: '37,3%', p: 'p=0,0032' },
        curva: { dur: 4, un: 'anos' }
      },
      {
        lab: 'Co-desfecho',
        nome: 'Variação do peso em 4 anos',
        dir: 'maior', escala: 7,
        barras: [
          { n: 'Orlistate', t: '−5,8 kg', v: 5.8, i: 1 },
          { n: 'Placebo', t: '−3,0 kg', v: 3.0 }
        ],
        efeito: { k: 'Diferença', v: '−2,8 kg', p: 'cerca de 3% do peso — a magnitude honesta do fármaco' }
      }
    ],
    tiles: [
      { v: '18,8%', k: 'DM2 na intolerância à glicose (vs 28,8%) — é onde o benefício está', t: 'good' },
      { v: 'nenhum', k: 'Benefício sobre o DM2 em quem tinha glicemia normal', t: 'warn' },
      { v: '52% vs 34%', k: 'Completaram os 4 anos — perda de seguimento assimétrica', t: 'warn' }
    ],
    segIco: '🚽',
    seg: 'Todos os efeitos são **locais**, porque a absorção sistêmica é desprezível: **esteatorreia, urgência e incontinência fecal, flatulência com perda oleosa**, proporcionais à gordura da refeição. Reduz **vitaminas lipossolúveis (A, D, E, K)** — suplementar em horário afastado, e separar da **levotiroxina**.',
    prat: 'Perda modesta, mas com **desfecho clínico** e a melhor segurança sistêmica da classe. Faz sentido em obesidade com **pré-diabetes**, sobretudo quando há contraindicação cardiovascular a outros fármacos.'
  },

  'COR-I (2010)': {
    desenho: 'ECR duplo-cego, três braços',
    pergunta: 'A combinação naltrexona + bupropiona reduz o peso na obesidade sem diabetes?',
    chips: ['n = |1.742', '|56 semanas', 'IMC 30–45 · sem diabetes'],
    bracos: {
      int: { n: 'NB32 — naltrexona 32 mg + bupropiona 360 mg/dia', s: 'titulação em 4 semanas' },
      ctl: { n: 'Placebo', s: 'houve também braço NB16 (16 mg + 360 mg)' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 8,
        barras: [
          { n: 'NB32', t: '−6,1%', v: 6.1, i: 1 },
          { n: 'NB16', t: '−5,0%', v: 5.0, i: 1 },
          { n: 'Placebo', t: '−1,3%', v: 1.3 }
        ],
        efeito: { k: 'Diferença', v: '−4,8 pp', p: 'da dose plena contra placebo' },
        grupos: {
          bracos: ['NB32', 'NB16', 'Placebo'],
          eixo: 'proporção com perda de peso ≥5% em 56 semanas',
          cats: [{ k: 'Perda ≥5%', vs: [48, 39, 16] }],
          nota: 'O **NB16** fica entre os outros dois: a resposta é **dose-dependente**.'
        }
      }
    ],
    tiles: [
      { v: '~30%', k: 'Náusea (vs ~5% no placebo) — principal causa de abandono', t: 'bad' },
      { v: '↑', k: 'Pressão arterial e frequência cardíaca', t: 'bad' },
      { v: '?', k: 'Segurança cardiovascular NÃO estabelecida — o LIGHT foi interrompido', t: 'warn' }
    ],
    seg: 'Além da náusea: constipação, cefaleia, insônia. **Risco de convulsão** pela bupropiona e **advertência de ideação suicida** de classe. Contraindicada em **hipertensão não controlada, epilepsia, uso de opioides, transtorno alimentar e IMAO**.',
    prat: 'Eficácia **intermediária** — mais que o orlistate, muito menos que os incretínicos — com nicho próprio: **compulsão e desejo por comida**, e quem também quer parar de fumar. O ponto fraco não é a eficácia: é a **segurança cardiovascular nunca demonstrada**.'
  },

  'SCALE Obesidade e Pré-diabetes (2015)': {
    desenho: 'ECR duplo-cego, randomização 2:1',
    pergunta: 'Qual a eficácia da liraglutida 3,0 mg na obesidade sem diabetes?',
    chips: ['n = |3.731', '|56 semanas', 'IMC ≥30 · 61% com pré-diabetes'],
    bracos: {
      int: { n: 'Liraglutida 3,0 mg SC uma vez ao dia', s: 'escalonamento semanal 0,6 → 3,0 mg' },
      ctl: { n: 'Placebo', s: 'ambos com dieta e atividade física' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 10,
        barras: [
          { n: 'Liraglutida 3,0 mg', t: '−8,0%', v: 8.0, i: 1 },
          { n: 'Placebo', t: '−2,6%', v: 2.6 }
        ],
        efeito: { k: 'Diferença', v: '−5,4 pp', p: 'cerca de −5,6 kg' },
        grupos: {
          bracos: ['Liraglutida 3,0 mg', 'Placebo'],
          eixo: 'proporção que atinge cada meta em 56 semanas',
          cats: [
            { k: 'Perda ≥5%', vs: [63.2, 27.1] },
            { k: 'Perda >10%', vs: [33.1, 10.6] }
          ],
          nota: 'A vantagem **cresce** conforme a meta fica mais exigente: 2,3× na de 5% e 3,1× na de 10%.'
        }
      },
      {
        lab: 'O dado mais forte — extensão de 3 anos',
        nome: 'Progressão para diabetes tipo 2 no subgrupo com pré-diabetes (160 semanas)',
        dir: 'menor',
        efeito: { k: 'Redução', v: '79%', p: 'tempo até o diagnóstico cerca de 2,7× mais longo — desfecho clínico, não de balança' }
      }
    ],
    tiles: [
      { v: '−8,4 kg', k: 'contra −2,8 kg no placebo', t: 'good' },
      { v: '~40%', k: 'Náusea — na titulação, em geral transitória', t: 'warn' },
      { v: '−6,4%', k: 'O que a liraglutida fez no STEP-8, contra −15,8% da semaglutida', t: 'warn' }
    ],
    seg: 'Perfil da classe: **náusea (~40%) e vômito (~16%)** na titulação. **Colelitíase** pela velocidade da perda de peso; **pancreatite** rara. Contraindicada em **carcinoma medular de tireoide ou NEM2** (pessoal ou familiar) e na gestação.',
    prat: 'Expectativa correta: **~8%** — metade do que se obtém com semaglutida 2,4 mg. Ainda tem lugar pela **aplicação diária** (titulação mais fina em quem tem muita náusea), por ser **liberada a partir dos 12 anos** e por disponibilidade. Em **pré-diabetes**, o dado de 3 anos é o melhor argumento desta molécula.'
  }

};

module.exports = { INFO3 };
