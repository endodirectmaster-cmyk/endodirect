// Ficha visual dos artigos (infográfico) — dados estruturados por trial.
// O card do app monta a ficha a partir daqui; nada é imagem.
//
// Schema de cada entrada (todos os campos opcionais exceto `chips` e `bracos`):
//   desenho  string   — tipo de estudo, sai no topo junto com periódico/ano
//   pergunta string   — a pergunta do estudo, em uma linha
//   chips    string[] — n, seguimento, população (o "|" vira <b> no valor)
//   bracos   {int:{n,s}, ctl:{n,s}}  — n = nome do braço, s = subtítulo
//   desfechos[] {
//     lab   string  — rótulo da seção ("Desfecho primário", "Co-primário 1"…)
//     nome  string  — o desfecho por extenso
//     dir   'menor'|'maior' — qual direção é boa (vira a legenda ↓/↑)
//     escala number — teto do eixo das barras (mesma escala p/ os dois braços)
//     barras[] {n,t,v,i} — n=rótulo, t=texto exibido, v=valor p/ largura, i=1 se intervenção
//     efeito {k,v,p}     — k=medida (HR/RR/Diferença), v=valor, p=IC/p/NNT
//     curva  {dur,un}    — desenha a curva de incidência cumulativa no lugar das
//                          barras. dur = duração do seguimento, un = 'anos' |
//                          'meses' | 'semanas'. Os pontos finais vêm das próprias
//                          `barras` (têm de ser % cumulativa nos DOIS braços).
//                          ⚠️ A curva é PROJETADA (risco constante) a partir das
//                          taxas publicadas — NÃO é a Kaplan-Meier do artigo. Só
//                          usar onde o trial reporta taxa cumulativa + seguimento.
//     forest {e,lo,hi,fav,des} — ⚠️ NÃO É MAIS RENDERIZADO (o professor pediu para
//                          tirar o bloco "Efeito e precisão" em 2026-07-27). O
//                          campo fica no dado porque o IC já aparece por extenso
//                          em `efeito.p`; se um dia voltar, é só reintroduzir o
//                          renderizador — os números não precisam ser refeitos.
//   }
//   tiles[]  {v,k,t}  — v=número, k=rótulo, t='good'|'bad'|'warn'|undefined
//   seg      string   — faixa de segurança
//   segIco   string   — ícone da faixa (padrão ⚠️)
//   prat     string   — faixa "o que muda na prática"
'use strict';

const INFO = {

  // ---------------------------------------------------------------- Diabetes

  'UKPDS 33 (1998)': {
    desenho: 'ECR, DM2 recém-diagnosticado',
    pergunta: 'O controle glicêmico intensivo reduz complicações no DM2 recém-diagnosticado?',
    chips: ['n = |3.867', 'mediana de |10 anos', 'DM2 ao diagnóstico'],
    bracos: {
      int: { n: 'Intensivo — sulfonilureia ou insulina', s: 'alvo de glicemia de jejum <108 mg/dL' },
      ctl: { n: 'Convencional — dieta', s: 'medicação só se sintomas ou glicemia >270' }
    },
    desfechos: [
      {
        lab: 'Separação glicêmica alcançada',
        nome: 'HbA1c média ao longo do seguimento',
        dir: 'menor', escala: 10,
        barras: [
          { n: 'Intensivo', t: '7,0%', v: 7.0, i: 1 },
          { n: 'Convencional', t: '7,9%', v: 7.9 }
        ]
      },
      {
        lab: 'Desfecho primário',
        nome: 'Qualquer desfecho relacionado ao diabetes',
        dir: 'menor',
        efeito: { k: 'RR', v: '0,88', p: 'IC95% 0,79–0,99 · p=0,029 — redução de 12%' },
        forest: { e: 0.88, lo: 0.79, hi: 0.99, fav: 'intensivo', des: 'convencional' }
      }
    ],
    tiles: [
      { v: '0,75', k: 'Componente microvascular (RR) — p=0,0099', t: 'good' },
      { v: '0,84', k: 'IAM (RR) — p=0,052, não significativo no estudo original' }
    ],
    seg: 'Mais **hipoglicemia** e **ganho de peso** no braço intensivo, maior com insulina. **Sem** excesso de mortalidade.',
    prat: 'Fundou a ideia de que o controle glicêmico protege a **microvasculatura**. O benefício macrovascular só apareceu no seguimento de mais 10 anos (UKPDS 80, 2008) — o **efeito legado** —, base para tratar o DM2 de forma agressiva já ao diagnóstico.'
  },

  'EMPA-REG OUTCOME (2015)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'Em DM2 com doença cardiovascular estabelecida, a empagliflozina é segura — e talvez benéfica — do ponto de vista CV?',
    chips: ['n = |7.020', 'mediana de |3,1 anos', 'doença CV estabelecida'],
    bracos: {
      int: { n: 'Empagliflozina 10 ou 25 mg/dia', s: 'somada ao tratamento padrão' },
      ctl: { n: 'Placebo', s: 'sobre tratamento padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — morte CV, IAM não fatal ou AVC não fatal',
        dir: 'menor', escala: 15,
        barras: [
          { n: 'Empagliflozina', t: '10,5%', v: 10.5, i: 1 },
          { n: 'Placebo', t: '12,1%', v: 12.1 }
        ],
        efeito: { k: 'HR', v: '0,86', p: 'IC95% 0,74–0,99 · p=0,04 para superioridade' },
        curva: { dur: 3.1, un: 'anos' },
        forest: { e: 0.86, lo: 0.74, hi: 0.99, fav: 'empagliflozina', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,62', k: 'Morte cardiovascular (HR) — 3,7% vs 5,9%', t: 'good' },
      { v: '0,65', k: 'Hospitalização por IC (HR)', t: 'good' },
      { v: '0,68', k: 'Morte por qualquer causa (HR)', t: 'good' }
    ],
    seg: 'Aumento de **infecção genital micótica: 6,4% vs 1,8%**. Sem excesso de cetoacidose, fratura ou amputação nesta coorte.',
    prat: 'Primeiro antidiabético a **reduzir mortalidade cardiovascular**. Inaugurou a era dos iSGLT2 e deslocou a escolha do 2º fármaco de "quanto baixa a A1c" para "qual protege o coração e o rim".'
  },

  'LEADER (2016)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'Em DM2 de alto risco cardiovascular, a liraglutida reduz eventos cardiovasculares?',
    chips: ['n = |9.340', 'mediana de |3,8 anos', '~81% com doença CV estabelecida'],
    bracos: {
      int: { n: 'Liraglutida até 1,8 mg/dia SC', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — morte CV, IAM não fatal ou AVC não fatal',
        dir: 'menor', escala: 18,
        barras: [
          { n: 'Liraglutida', t: '13,0%', v: 13.0, i: 1 },
          { n: 'Placebo', t: '14,9%', v: 14.9 }
        ],
        efeito: { k: 'HR', v: '0,87', p: 'IC95% 0,78–0,97 · p=0,01 para superioridade' },
        curva: { dur: 3.8, un: 'anos' },
        forest: { e: 0.87, lo: 0.78, hi: 0.97, fav: 'liraglutida', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,78', k: 'Morte cardiovascular (HR)', t: 'good' },
      { v: '0,85', k: 'Morte por qualquer causa (HR)', t: 'good' },
      { v: '0,78', k: 'Composto renal (HR) — por macroalbuminúria nova', t: 'good' }
    ],
    seg: 'Eventos **gastrointestinais** (náusea) foram a causa mais comum de descontinuação. Mais **colelitíase**. Sem aumento de pancreatite ou de carcinoma medular de tireoide.',
    prat: 'Primeiro GLP-1 a demonstrar benefício cardiovascular. Estabeleceu os GLP-1 como opção preferencial na **doença aterosclerótica**, com padrão de benefício diferente do dos iSGLT2 — aterosclerótico e mais tardio.'
  },

  'SUSTAIN-6 (2016)': {
    desenho: 'ECR duplo-cego, não inferioridade',
    pergunta: 'Em DM2 de alto risco cardiovascular, a semaglutida subcutânea é segura do ponto de vista cardiovascular?',
    chips: ['n = |3.297', '|104 semanas', 'alto risco CV'],
    bracos: {
      int: { n: 'Semaglutida SC 0,5 ou 1,0 mg/semana', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — desenho de NÃO INFERIORIDADE',
        dir: 'menor', escala: 12,
        barras: [
          { n: 'Semaglutida', t: '6,6%', v: 6.6, i: 1 },
          { n: 'Placebo', t: '8,9%', v: 8.9 }
        ],
        efeito: { k: 'HR', v: '0,74', p: 'IC95% 0,58–0,95 · p<0,001 para não inferioridade — a superioridade é NOMINAL' },
        curva: { dur: 104, un: 'semanas' },
        forest: { e: 0.74, lo: 0.58, hi: 0.95, fav: 'semaglutida', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,61', k: 'AVC não fatal (HR) — dirigiu a redução', t: 'good' },
      { v: '1,76', k: 'Complicações de retinopatia (HR) — 3,0% vs 1,8%', t: 'bad' }
    ],
    seg: '⚠️ **Complicações de retinopatia diabética aumentaram: 3,0% vs 1,8% — HR 1,76** (IC95% 1,11–2,78). Mais eventos gastrointestinais e descontinuação por náusea.',
    prat: 'Consolidou o benefício CV dos GLP-1, mas trouxe o **alerta da retinopatia**: em quem tem retinopatia proliferativa ou muito avançada com HbA1c muito alta, avaliar o fundo de olho e evitar quedas glicêmicas abruptas.'
  },

  'DECLARE-TIMI 58 (2019)': {
    desenho: 'ECR duplo-cego, dois co-primários',
    pergunta: 'Em DM2 de amplo espectro — a maioria em prevenção primária —, a dapagliflozina reduz eventos?',
    chips: ['n = |17.160', 'mediana de |4,2 anos', '|59% em prevenção primária'],
    bracos: {
      int: { n: 'Dapagliflozina 10 mg/dia', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Co-primário 1 — negativo',
        nome: 'MACE-3 — morte CV, IAM não fatal ou AVC não fatal',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,93', p: 'IC95% 0,84–1,03 — NÃO significativo' },
        forest: { e: 0.93, lo: 0.84, hi: 1.03, fav: 'dapagliflozina', des: 'placebo' }
      },
      {
        lab: 'Co-primário 2 — positivo',
        nome: 'Morte cardiovascular ou hospitalização por insuficiência cardíaca',
        dir: 'menor', escala: 8,
        barras: [
          { n: 'Dapagliflozina', t: '4,9%', v: 4.9, i: 1 },
          { n: 'Placebo', t: '5,8%', v: 5.8 }
        ],
        efeito: { k: 'HR', v: '0,83', p: 'IC95% 0,73–0,95' },
        curva: { dur: 4.2, un: 'anos' },
        forest: { e: 0.83, lo: 0.73, hi: 0.95, fav: 'dapagliflozina', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,73', k: 'Hospitalização por IC (HR) — dirigiu o composto', t: 'good' },
      { v: '0,98', k: 'Morte cardiovascular (HR) — sem efeito' }
    ],
    seg: '**Cetoacidose diabética** mais frequente: **0,3% vs 0,1%** (p=0,02). Mais infecção genital. Gangrena de Fournier: rara, numericamente menor com dapagliflozina.',
    prat: 'Mostrou que, **fora da prevenção secundária**, o ganho dos iSGLT2 está na insuficiência cardíaca e no rim, não na aterosclerose. Sustenta indicar iSGLT2 por **fenótipo de IC ou DRC**, mesmo sem doença coronariana.'
  },

  'CREDENCE (2019)': {
    desenho: 'ECR duplo-cego, desfecho renal primário',
    pergunta: 'Em DM2 com doença renal crônica albuminúrica, a canagliflozina protege o rim?',
    chips: ['n = |4.401', 'mediana de |2,6 anos', 'TFG 30–90 · RAC 300–5.000 mg/g'],
    bracos: {
      int: { n: 'Canagliflozina 100 mg/dia', s: 'todos com IECA ou BRA em dose máxima' },
      ctl: { n: 'Placebo', s: 'todos com IECA ou BRA em dose máxima' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Composto renal — doença renal terminal, duplicação da creatinina, morte renal ou CV',
        dir: 'menor',
        efeito: { k: 'HR', v: '0,70', p: 'IC95% 0,59–0,82 · p=0,00001 — redução de 30%; estudo interrompido por eficácia' },
        forest: { e: 0.70, lo: 0.59, hi: 0.82, fav: 'canagliflozina', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,66', k: 'Desfecho renal "puro" (HR)', t: 'good' },
      { v: '0,68', k: 'Doença renal terminal (HR)', t: 'good' },
      { v: '0,61', k: 'Hospitalização por IC (HR)', t: 'good' },
      { v: '1,11', k: 'Amputação (HR) — SEM aumento, ao contrário do CANVAS' }
    ],
    seg: '**Sem** aumento de amputação (HR 1,11) ou fratura (HR 0,98) — ao contrário do sinal do CANVAS. Cetoacidose mais frequente, porém rara: **2,2 vs 0,2 por 1.000 pacientes-ano**.',
    prat: 'Primeiro estudo com **desfecho renal primário positivo** desde o RENAAL/IDNT. Tornou o iSGLT2 terapia de base da nefropatia diabética, somado ao bloqueio do SRAA.'
  },

  'SURPASS-2 (2021)': {
    desenho: 'ECR com comparador ativo, aberto p/ o injetável',
    pergunta: 'Em DM2 não controlado com metformina, a tirzepatida é superior à semaglutida?',
    chips: ['n = |1.879', '|40 semanas', 'HbA1c basal ~8,3% · IMC ~34'],
    bracos: {
      int: { n: 'Tirzepatida 5, 10 ou 15 mg/semana', s: 'agonista duplo GIP/GLP-1' },
      ctl: { n: 'Semaglutida 1,0 mg/semana', s: 'dose de diabetes, não a de obesidade' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação da HbA1c em 40 semanas',
        dir: 'maior', escala: 2.5,
        barras: [
          { n: 'Tirzepatida 15 mg', t: '−2,30', v: 2.30, i: 1 },
          { n: 'Tirzepatida 10 mg', t: '−2,24', v: 2.24, i: 1 },
          { n: 'Tirzepatida 5 mg', t: '−2,01', v: 2.01, i: 1 },
          { n: 'Semaglutida 1,0 mg', t: '−1,86', v: 1.86 }
        ],
        efeito: { k: 'Superioridade', v: 'em todas as doses', p: 'após não inferioridade da dose de 5 mg' }
      },
      {
        lab: 'Desfecho secundário',
        nome: 'Perda de peso em 40 semanas',
        dir: 'maior', escala: 12,
        barras: [
          { n: 'Tirzepatida 15 mg', t: '−11,2 kg', v: 11.2, i: 1 },
          { n: 'Tirzepatida 10 mg', t: '−9,3 kg', v: 9.3, i: 1 },
          { n: 'Tirzepatida 5 mg', t: '−7,6 kg', v: 7.6, i: 1 },
          { n: 'Semaglutida 1,0 mg', t: '−5,7 kg', v: 5.7 }
        ]
      }
    ],
    tiles: [
      { v: '60%', k: 'Alvo composto com 15 mg — HbA1c ≤6,5% + perda ≥10% sem hipoglicemia', t: 'good' },
      { v: '51%', k: 'Alvo composto com 10 mg', t: 'good' },
      { v: '22%', k: 'Alvo composto com semaglutida 1,0 mg' }
    ],
    seg: 'Eventos **gastrointestinais semelhantes** entre os grupos (náusea, diarreia, vômito), predominantes na titulação. Hipoglicemia grave rara em ambos.',
    prat: 'Primeira demonstração **head-to-head** de que o agonismo duplo GIP/GLP-1 supera o GLP-1 isolado em glicemia e peso. Atenção ao comparador: **semaglutida 1,0 mg**, não 2,0 mg — o SURMOUNT-5 depois refez a comparação na dose de obesidade.'
  },

  'FLOW (2024)': {
    desenho: 'ECR duplo-cego, desfecho renal primário',
    pergunta: 'Em DM2 com doença renal crônica, a semaglutida protege o rim?',
    chips: ['n = |3.533', 'mediana de |3,4 anos', 'a maioria com IECA/BRA'],
    bracos: {
      int: { n: 'Semaglutida SC 1,0 mg/semana', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Composto renal — queda ≥50% da TFGe, doença renal terminal, morte renal ou CV',
        dir: 'menor', escala: 10,
        barras: [
          { n: 'Semaglutida', t: '5,8', v: 5.8, i: 1 },
          { n: 'Placebo', t: '7,5', v: 7.5 }
        ],
        efeito: { k: 'HR', v: '0,76', p: 'eventos por 100 pessoas-ano · IC95% 0,66–0,88 · p=0,0003 — redução de 24%' },
        forest: { e: 0.76, lo: 0.66, hi: 0.88, fav: 'semaglutida', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,71', k: 'Morte cardiovascular (HR)', t: 'good' },
      { v: '0,80', k: 'Morte por qualquer causa (HR)', t: 'good' }
    ],
    seg: 'Perfil conhecido da classe: eventos **gastrointestinais** e mais descontinuações por eles. Sem sinal de segurança novo.',
    prat: 'Primeiro **GLP-1 com desfecho renal primário positivo**. Coloca a semaglutida ao lado dos iSGLT2 e da finerenona na proteção renal do DM2 — e sustenta a terapia combinada na nefropatia diabética.'
  },

  'SOUL (2025)': {
    desenho: 'ECR duplo-cego, superioridade',
    pergunta: 'Em DM2 de alto risco, a semaglutida ORAL reduz eventos cardiovasculares?',
    chips: ['n = |9.650', 'média de |47,5 meses', '≥50 anos · HbA1c 6,5–10%'],
    bracos: {
      int: { n: 'Semaglutida oral até 14 mg/dia', s: 'sobre terapia padrão' },
      ctl: { n: 'Placebo', s: 'sobre terapia padrão' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — tempo até o primeiro evento',
        dir: 'menor', escala: 16,
        barras: [
          { n: 'Semaglutida oral', t: '12,0%', v: 12.0, i: 1 },
          { n: 'Placebo', t: '13,8%', v: 13.8 }
        ],
        efeito: { k: 'HR', v: '0,86', p: 'IC95% 0,77–0,96 · p=0,006 — redução de 14%' },
        curva: { dur: 47.5, un: 'meses' },
        forest: { e: 0.86, lo: 0.77, hi: 0.96, fav: 'semaglutida oral', des: 'placebo' }
      }
    ],
    seg: 'Perfil de classe: eventos **gastrointestinais**. Sem sinal novo de segurança.',
    prat: 'Estende o benefício cardiovascular comprovado à **formulação oral** — opção para quem não aceita ou não pode usar injetável. Confirma, com desenho adequado de superioridade, o que o SUSTAIN-6 só sugeriu.'
  },

  // --------------------------------------------------------------- Obesidade

  'STEP-1 (2021)': {
    desenho: 'ECR duplo-cego',
    pergunta: 'Em adultos com obesidade e sem diabetes, qual a eficácia da semaglutida 2,4 mg na perda de peso?',
    chips: ['n = |1.961', '|68 semanas', 'IMC ≥30, ou ≥27 com comorbidade'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'com aconselhamento de estilo de vida' },
      ctl: { n: 'Placebo', s: 'com aconselhamento de estilo de vida' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 18,
        barras: [
          { n: 'Semaglutida', t: '−14,9%', v: 14.9, i: 1 },
          { n: 'Placebo', t: '−2,4%', v: 2.4 }
        ],
        efeito: { k: 'Diferença', v: '−12,4 pp', p: '≈ −15,3 kg' }
      }
    ],
    tiles: [
      { v: '86,4%', k: 'Perda ≥5% (vs 31,5%)', t: 'good' },
      { v: '69,1%', k: 'Perda ≥10% (vs 12,0%)', t: 'good' },
      { v: '50,5%', k: 'Perda ≥15% (vs 4,9%)', t: 'good' }
    ],
    seg: '**Náusea e diarreia** foram os eventos mais comuns, transitórios e na titulação. Descontinuação por eventos adversos **7,0% vs 3,1%**. Mais colelitíase.',
    prat: 'Marcou a entrada da farmacoterapia da obesidade num patamar antes só alcançado por cirurgia. Perda de **~15%** passou a ser meta realista com medicamento. O tratamento é **crônico**: o STEP-4 mostrou reganho após a suspensão.'
  },

  'SURMOUNT-1 (2022)': {
    desenho: 'ECR duplo-cego',
    pergunta: 'Em adultos com obesidade e sem diabetes, qual a eficácia da tirzepatida?',
    chips: ['n = |2.539', '|72 semanas', 'IMC ≥30, ou ≥27 com comorbidade'],
    bracos: {
      int: { n: 'Tirzepatida 5, 10 ou 15 mg/semana SC', s: 'com aconselhamento de estilo de vida' },
      ctl: { n: 'Placebo', s: 'com aconselhamento de estilo de vida' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso corporal',
        dir: 'maior', escala: 24,
        barras: [
          { n: 'Tirzepatida 15 mg', t: '−20,9%', v: 20.9, i: 1 },
          { n: 'Tirzepatida 10 mg', t: '−19,5%', v: 19.5, i: 1 },
          { n: 'Tirzepatida 5 mg', t: '−15,0%', v: 15.0, i: 1 },
          { n: 'Placebo', t: '−3,1%', v: 3.1 }
        ],
        efeito: { k: 'Perda absoluta', v: 'até −23,6 kg', p: 'na dose de 15 mg' }
      }
    ],
    tiles: [
      { v: '85–91%', k: 'Perda ≥5% conforme a dose (vs 35%)', t: 'good' },
      { v: '57%', k: 'Perda ≥20% com 15 mg (vs 3%)', t: 'good' },
      { v: '50%', k: 'Perda ≥20% com 10 mg', t: 'good' }
    ],
    seg: '**Gastrointestinais** predominantes (náusea, diarreia, constipação), leves a moderados e ligados à titulação. Descontinuação por eventos adversos **4,3–7,1% vs 2,6%**.',
    prat: 'O agonismo duplo GIP/GLP-1 aproximou a farmacoterapia dos resultados da **gastrectomia vertical**. Atenção à perda de massa magra: aporte proteico adequado e treino resistido durante o tratamento.'
  },

  'SELECT (2023)': {
    desenho: 'ECR duplo-cego, desfecho CV',
    pergunta: 'Em obesidade com doença cardiovascular estabelecida e SEM diabetes, a semaglutida reduz eventos cardiovasculares?',
    chips: ['n = |17.604', 'média de |39,8 meses', '≥45 anos · IMC ≥27'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'sobre terapia CV otimizada' },
      ctl: { n: 'Placebo', s: 'sobre terapia CV otimizada' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'MACE-3 — morte CV, IAM não fatal ou AVC não fatal',
        dir: 'menor', escala: 10,
        barras: [
          { n: 'Semaglutida', t: '6,5%', v: 6.5, i: 1 },
          { n: 'Placebo', t: '8,0%', v: 8.0 }
        ],
        efeito: { k: 'HR', v: '0,80', p: 'IC95% 0,72–0,90 · p<0,001 · NNT ≈ 67 em ~3 anos' },
        // Curva REAL, extraída da Figura 1A do artigo (o professor mandou o PDF).
        // Método em [[Convenções de Trabalho]]: pdftocairo -svg → calibrar pelos
        // ticks dos eixos → converter os pontos do traçado para (mês, %).
        // Os 7,7% e 9,6% aos 48 meses são de Kaplan-Meier e por isso MAIORES que
        // os 6,5% e 8,0% do texto, que são proporções brutas no seguimento todo.
        curva: {
          dur: 48, un: 'meses', real: 1, fig: 'Figura 1A',
          pts: [[0,0,0],[1.5,0.2,0.4],[3,0.4,0.7],[4.5,0.6,1],[6,0.8,1.3],[7.5,1.1,1.6],
                [9,1.3,1.8],[10.5,1.6,2.2],[12,1.8,2.6],[13.5,1.9,2.7],[15,2.2,3],
                [16.5,2.4,3.3],[18,2.6,3.6],[19.5,3,3.8],[21,3.3,4.1],[22.5,3.5,4.3],
                [24,3.8,4.7],[25.5,4.1,4.9],[27,4.3,5.2],[28.5,4.6,5.5],[30,4.8,5.8],
                [31.5,5,6.1],[33,5.2,6.4],[34.5,5.5,6.7],[36,5.8,7],[37.5,6,7.4],
                [39,6.2,7.8],[40.5,6.4,8.1],[42,6.6,8.4],[43.5,6.8,8.6],[45,7,8.8],
                [46.5,7.4,9],[48,7.7,9.6]]
        },
        forest: { e: 0.80, lo: 0.72, hi: 0.90, fav: 'semaglutida', des: 'placebo' }
      }
    ],
    tiles: [
      { v: '0,72', k: 'IAM não fatal (HR) — o mais reduzido', t: 'good' },
      { v: '0,85', k: 'Morte CV (HR) — IC 0,71–1,01, não significativa' },
      { v: '0,81', k: 'Morte por qualquer causa (HR)', t: 'good' },
      { v: '−9,4%', k: 'Peso (vs −0,9% no placebo)', t: 'good' }
    ],
    seg: 'Descontinuação por eventos adversos **16,6% vs 8,2%** — quase o dobro, quase toda **gastrointestinal**. Sem aumento de pancreatite ou de neoplasia.',
    prat: 'Primeira prova de que **tratar a obesidade reduz eventos cardiovasculares**, independentemente do diabetes. As curvas separaram **antes** da perda máxima de peso, sugerindo benefício além do emagrecimento.'
  },

  'STEP-HFpEF (2023)': {
    desenho: 'ECR duplo-cego, dois co-primários',
    pergunta: 'Em ICFEp relacionada à obesidade, sem diabetes, a semaglutida melhora sintomas?',
    chips: ['n = |529', '|52 semanas', 'FE ≥45% · IMC ≥30 · sem diabetes'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'IC sintomática classe II–IV' },
      ctl: { n: 'Placebo', s: 'IC sintomática classe II–IV' }
    },
    desfechos: [
      {
        lab: 'Co-primário 1',
        nome: 'KCCQ-CSS — escore de sintomas e limitação física',
        dir: 'maior', escala: 20,
        barras: [
          { n: 'Semaglutida', t: '+16,6', v: 16.6, i: 1 },
          { n: 'Placebo', t: '+8,7', v: 8.7 }
        ],
        efeito: { k: 'Diferença', v: '+7,8 pontos', p: 'IC95% 4,8–10,9 · p<0,001 — 5 pontos já é clinicamente relevante' }
      },
      {
        lab: 'Co-primário 2',
        nome: 'Variação percentual do peso',
        dir: 'maior', escala: 16,
        barras: [
          { n: 'Semaglutida', t: '−13,3%', v: 13.3, i: 1 },
          { n: 'Placebo', t: '−2,6%', v: 2.6 }
        ],
        efeito: { k: 'Diferença', v: '−10,7 pp', p: 'p<0,001' }
      }
    ],
    tiles: [
      { v: '+21,5 m', k: 'Teste de caminhada de 6 minutos (diferença)', t: 'good' },
      { v: '−43,5%', k: 'PCR — reforça o componente inflamatório', t: 'good' }
    ],
    segIco: '✅',
    seg: 'Contraintuitivamente, **menos** eventos adversos graves com semaglutida: **13,3% vs 26,7%** — por menos eventos cardíacos. Gastrointestinais mais frequentes.',
    prat: 'Definiu a **ICFEp da obesidade** como fenótipo próprio, tratável com perda de peso farmacológica. O ganho sintomático supera o de espironolactona, sacubitril-valsartana ou iSGLT2 nessa população. Sem poder para mortalidade ou hospitalização.'
  },

  'SURMOUNT-OSA (2024)': {
    desenho: 'Dois ECR paralelos, mesmo protocolo',
    pergunta: 'Em apneia obstrutiva do sono moderada a grave com obesidade, a tirzepatida reduz a gravidade da apneia?',
    chips: ['n = |469', '|52 semanas', 'IAH ≥15 · sem diabetes'],
    bracos: {
      int: { n: 'Tirzepatida até 15 mg/semana SC', s: 'desfecho medido por polissonografia' },
      ctl: { n: 'Placebo', s: 'desfecho medido por polissonografia' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário — Estudo 1',
        nome: 'Variação do IAH em quem NÃO usava pressão positiva',
        dir: 'maior', escala: 32,
        barras: [
          { n: 'Tirzepatida', t: '−27,4/h', v: 27.4, i: 1 },
          { n: 'Placebo', t: '−4,8/h', v: 4.8 }
        ],
        efeito: { k: 'Redução relativa', v: '−55,0%', p: 'vs −5,0% no placebo' }
      },
      {
        lab: 'Desfecho primário — Estudo 2',
        nome: 'Variação do IAH em quem MANTEVE a pressão positiva',
        dir: 'maior', escala: 32,
        barras: [
          { n: 'Tirzepatida', t: '−30,4/h', v: 30.4, i: 1 },
          { n: 'Placebo', t: '−6,0/h', v: 6.0 }
        ],
        efeito: { k: 'Redução relativa', v: '−62,8%', p: 'vs −6,4% no placebo' }
      }
    ],
    tiles: [
      { v: '51,5%', k: 'Atingiram remissão ou doença leve', t: 'good' },
      { v: '↓', k: 'Peso, PA sistólica, hsPCR e sonolência', t: 'good' }
    ],
    seg: 'Perfil da classe: **diarreia, náusea e vômito**, leves a moderados e concentrados no escalonamento. Sem sinal novo.',
    prat: 'Primeiro fármaco aprovado para **AOS associada à obesidade** — alternativa ou complemento ao CPAP, cuja adesão é notoriamente baixa. Desfecho é **fisiológico** (IAH), não evento clínico: não substitui o CPAP na doença grave sintomática sem reavaliar a polissonografia após a perda de peso.'
  },

  'SURMOUNT-5 (2025)': {
    desenho: 'ECR aberto, comparador ativo',
    pergunta: 'Na dose máxima de ambos, a tirzepatida supera a semaglutida em perda de peso?',
    chips: ['n = |751', '|72 semanas', 'obesidade sem diabetes'],
    bracos: {
      int: { n: 'Tirzepatida 10–15 mg/semana', s: 'dose máxima tolerada' },
      ctl: { n: 'Semaglutida 2,4 mg/semana', s: 'dose de obesidade' }
    },
    desfechos: [
      {
        lab: 'Desfecho primário',
        nome: 'Variação percentual do peso em 72 semanas',
        dir: 'maior', escala: 25,
        barras: [
          { n: 'Tirzepatida', t: '−20,2%', v: 20.2, i: 1 },
          { n: 'Semaglutida', t: '−13,7%', v: 13.7 }
        ],
        efeito: { k: 'Diferença', v: '6,5 pp', p: 'a favor da tirzepatida · −22,8 kg vs −15,0 kg' },
        // Painel B da Figura 1, na mesma forma do artigo: as 4 metas que a figura
        // plota. A ≥30% existe (19,7% vs 6,9%) mas é exploratória e sai só na
        // Tabela 2 — fica na nota, como no artigo, e não vira barra.
        grupos: {
          bracos: ['Tirzepatida', 'Semaglutida'],
          eixo: 'meta de redução do peso em 72 semanas',
          fig: 'Figura 1B',
          cats: [
            { k: '≥10%', vs: [81.6, 60.5] },
            { k: '≥15%', vs: [64.6, 40.1] },
            { k: '≥20%', vs: [48.4, 27.3] },
            { k: '≥25%', vs: [31.6, 16.1] }
          ],
          nota: 'Quanto mais exigente a meta, **maior a distância relativa** entre os braços: 1,3 vez em ≥10% e 2,0 vezes em ≥25%. Como desfecho **exploratório**, a meta de ≥30% foi atingida por **19,7% vs 6,9%** (2,8 vezes).'
        }
      },
      {
        // Painel C da Figura 1 — era só um ícone nos "outros achados"; virou
        // desfecho com número, porque o artigo publica a magnitude.
        lab: 'Desfecho secundário principal',
        nome: 'Variação da circunferência abdominal em 72 semanas',
        dir: 'maior', escala: 25,
        barras: [
          { n: 'Tirzepatida', t: '−18,4 cm', v: 18.4, i: 1 },
          { n: 'Semaglutida', t: '−13,0 cm', v: 13.0 }
        ],
        efeito: { k: 'Diferença', v: '5,4 cm', p: 'a favor da tirzepatida · IC 95% −7,1 a −3,6' }
      }
    ],
    tiles: [
      { v: '↓', k: 'PA sistólica e diastólica', t: 'good' },
      { v: '↓', k: 'HbA1c e insulina de jejum', t: 'good' },
      { v: '↓', k: 'Triglicerídeos · ↑ HDL', t: 'good' }
    ],
    segIco: '✅',
    seg: 'Perfis semelhantes. Contra a intuição, a descontinuação por eventos gastrointestinais foi **menor** com tirzepatida: **2,7% vs 5,6%**.',
    prat: 'Encerra a comparação indireta entre STEP-1 e SURMOUNT-1. Mas o contraponto importa: quem tem **doença CV estabelecida** tem no SELECT uma prova de desfecho que a potência isolada não substitui. Desenho **aberto** e desfecho substituto.'
  },

  'ESSENCE (2025)': {
    desenho: 'ECR 2:1, análise interina pré-especificada',
    pergunta: 'Em MASH com fibrose F2–F3 confirmada por biópsia, a semaglutida melhora a histologia hepática?',
    chips: ['n = |1.197| randomizados', 'análise nos |800| primeiros', '|72| de 240 semanas'],
    bracos: {
      int: { n: 'Semaglutida 2,4 mg/semana SC', s: 'randomização 2:1' },
      ctl: { n: 'Placebo', s: 'fibrose F2–F3 · cirrose F4 excluída' }
    },
    desfechos: [
      {
        lab: 'Co-primário 1',
        nome: 'Resolução da esteato-hepatite sem piora da fibrose',
        dir: 'maior', escala: 70,
        barras: [
          { n: 'Semaglutida', t: '62,9%', v: 62.9, i: 1 },
          { n: 'Placebo', t: '34,3%', v: 34.3 }
        ],
        efeito: { k: 'Diferença', v: '+28,7 pp', p: 'IC95% 21,1–36,2 · p<0,001' }
      },
      {
        lab: 'Co-primário 2',
        nome: 'Melhora da fibrose ≥1 estágio sem piora da esteato-hepatite',
        dir: 'maior', escala: 70,
        barras: [
          { n: 'Semaglutida', t: '36,8%', v: 36.8, i: 1 },
          { n: 'Placebo', t: '22,4%', v: 22.4 }
        ],
        efeito: { k: 'Diferença', v: '+14,4 pp', p: 'IC95% 7,5–21,3 · p<0,001' }
      },
      {
        // Figura 2 do artigo: marcadores NÃO invasivos ao longo do tempo. Importa
        // porque biópsia não é rotina — é por estes exames que a resposta será
        // acompanhada na prática. Pontos extraídos do vetor do PDF, calibrados
        // pelas marcas dos eixos (não lidos a olho).
        lab: 'Marcadores não invasivos (Figura 2)',
        nome: 'Escore ELF e rigidez hepática até a semana 72',
        series: [
          {
            tit: 'Escore ELF (média observada)',
            eixo: 'semanas desde a randomização', fig: 'Figura 2A',
            min: 9.2, max: 10.0, ticks: [9.2, 9.6, 10.0], dec: 2, tempos: [0, 24, 48, 72],
            linhas: [
              { n: 'Semaglutida 2,4 mg', pts: [[0, 9.95], [24, 9.38], [48, 9.34], [72, 9.33]] },
              { n: 'Placebo', pts: [[0, 9.95], [24, 9.90], [48, 9.90], [72, 9.92]] }
            ],
            nota: 'Queda média de **0,62** com semaglutida — coerente com os **55,8% vs 25,5%** que atingiram redução ≥0,5 no texto.'
          },
          {
            tit: 'Rigidez hepática — elastografia (kPa, média geométrica)',
            eixo: 'semanas desde a randomização', fig: 'Figura 2B',
            min: 7, max: 12, ticks: [7, 9, 11], dec: 1, tempos: [0, 48, 72],
            linhas: [
              { n: 'Semaglutida 2,4 mg', pts: [[0, 11.45], [48, 8.12], [72, 7.63]] },
              { n: 'Placebo', pts: [[0, 11.57], [48, 10.63], [72, 10.0]] }
            ],
            nota: 'Queda de **33%** com semaglutida contra **14%** com placebo — coerente com os **52,0% vs 30,3%** que atingiram redução ≥30%.'
          }
        ]
      }
    ],
    tiles: [
      { v: '32,7%', k: 'Resolução E melhora da fibrose (vs 16,1%)', t: 'good' }
    ],
    segIco: '🔍',
    seg: 'Leia com cuidado: a resposta no placebo foi alta (**34,3%**) — fenômeno conhecido nos estudos de MASH, por variabilidade da leitura histológica e mudança de estilo de vida. O que importa é a **diferença entre grupos**. Eventos gastrointestinais mais frequentes; sem sinal hepático novo.',
    prat: 'Reforça **rastrear fibrose** (FIB-4, elastografia) em quem tem diabetes e obesidade — porque agora existe conduta a oferecer. O desfecho clínico (cirrose, descompensação, transplante, morte) só virá no seguimento de **240 semanas**.'
  }
};

module.exports = { INFO };
