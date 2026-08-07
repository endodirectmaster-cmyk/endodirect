// Endodirect — BASE CLÍNICA PROFUNDA, por subespecialidade.
//
// POR QUE ISTO EXISTE (07/08/2026). O `CLINICAL_GUIDELINES` do index.html é o
// NÚCLEO: uma linha por tema, o que a IA nunca pode errar, enviado em TODA
// geração. Ele é o prefixo cacheável e o `api/ai.js` o corta em um teto fixo.
// Ao planejar a leitura do acervo de artigos do Drive, medi o bloco: **59.659 de
// 60.000 caracteres — 341 de folga**. A entrada de MODY que eu tinha acabado de
// acrescentar consumira ~1.470. Ou seja, o núcleo estava a UMA entrada de começar
// a ser cortado em silêncio, perdendo o FIM do bloco em toda chamada de IA.
//
// Um acervo inteiro de endocrinologia não cabe — e nem deveria caber — num único
// bloco enviado em toda chamada. Daí os dois níveis:
//
//   NÚCLEO  (index.html, CLINICAL_GUIDELINES) → sempre presente, curto, canônico.
//   PROFUNDO (este arquivo)                   → detalhe extraído dos artigos
//                                               primários, anexado SÓ quando o
//                                               gerador é daquela subespecialidade.
//
// ⚠️ Fica no SERVIDOR, e não no index.html, por dois motivos:
//   1. o index.html já tem 1,4 MB e o cofre registra dois apagões causados por
//      mudança de JS nele — engordá-lo em centenas de KB é risco desnecessário;
//   2. este conteúdo não precisa trafegar até o navegador do aluno: ele só existe
//      para ancorar a chamada à IA, que acontece aqui.
//
// ⚠️ REGRA DE ENTRADA, inegociável: nada é escrito aqui sem CITAÇÃO LITERAL do
// artigo de origem. Cada fato carrega `fonte` (com ano e periódico) e a extração
// é conferida contra o texto do PDF. Foi assim que o posicionamento de
// hipogonadismo revelou dois erros que a IA vinha repetindo — e é o oposto de
// escrever de memória, que é onde a alucinação entra.
//
// O cache de prompt continua funcionando: o prefixo passa a ser
// `núcleo + profundo(área)`, estável por subespecialidade, então cada área tem a
// sua entrada de cache reaproveitada em todas as gerações daquela área.

// Sinônimos → nome canônico. Espelha AREA_CANON/MURAL_SUBSPECIALTY_FILTERS do
// index.html; um nome fora desta lista simplesmente não recebe bloco profundo.
const CANON = {
  'diabetes': 'Diabetes',
  'obesidade': 'Obesidade',
  'tireoide': 'Tireoide',
  'tireóide': 'Tireoide',
  'adrenal': 'Adrenal',
  'neuroendocrinologia': 'Neuroendocrinologia',
  'neuroendocrino': 'Neuroendocrinologia',
  'osteometabolismo': 'Osteometabolismo',
  'osso': 'Osteometabolismo',
  'lipides': 'Lípides',
  'lípides': 'Lípides',
  'dislipidemia': 'Lípides',
  'endocrinologia pediatrica': 'Endocrinologia Pediátrica',
  'endocrinologia pediátrica': 'Endocrinologia Pediátrica',
  'endocrinologia feminina': 'Endocrinologia Feminina',
  'endocrinologia masculina': 'Endocrinologia Masculina',
  'andrologia': 'Endocrinologia Masculina',
  'endocrinologia do esporte': 'Endocrinologia do Esporte',
  'endocrinologia esportiva': 'Endocrinologia do Esporte',
  'transgeneridade': 'Transgeneridade',
  'endocrinopatias': 'Endocrinopatias',
  'endocrinologia basica': 'Endocrinologia Básica',
  'endocrinologia básica': 'Endocrinologia Básica'
};

// ⚠️ TERMO CLÍNICO → área. Espelho do CANON, mas para o que o MÉDICO escreve.
//
// POR QUE ISTO EXISTE (07/08/2026). A auditoria da hipofosfatasia/osteogênese
// imperfeita mediu o roteamento e achou o pior resultado possível: a pergunta
// "osteoporose refratária, fosfatase alcalina baixa, posso dar bisfosfonato?"
// canonizava para NADA — bloco profundo de 0 caractere. O único texto que casava
// com Osteometabolismo era a palavra "Osteometabolismo", que nenhum médico
// digita. O artigo que diz `bisphosphonates are contraindicated` estava na base,
// verificado, e não chegava a quem perguntava exatamente por ele.
//
// Regra de entrada: só termo que pertence a UMA subespecialidade sem ambiguidade.
// Nome de doença, de exame ou de classe terapêutica; nunca sintoma genérico
// ("fadiga", "ganho de peso") nem palavra que aparece em outra área.
const TERMOS = {
  // Osteometabolismo
  'osteoporose': 'Osteometabolismo', 'osteopenia': 'Osteometabolismo',
  'osteomalacia': 'Osteometabolismo', 'osteogenese imperfeita': 'Osteometabolismo',
  'hipofosfatasia': 'Osteometabolismo', 'fosfatase alcalina': 'Osteometabolismo',
  'bisfosfonato': 'Osteometabolismo', 'alendronato': 'Osteometabolismo',
  'zoledronato': 'Osteometabolismo', 'risedronato': 'Osteometabolismo',
  'denosumabe': 'Osteometabolismo', 'romosozumabe': 'Osteometabolismo',
  'teriparatida': 'Osteometabolismo', 'abaloparatida': 'Osteometabolismo',
  'asfotase': 'Osteometabolismo', 'densitometria': 'Osteometabolismo',
  'hiperparatireoidismo': 'Osteometabolismo', 'hipoparatireoidismo': 'Osteometabolismo',
  'paratormonio': 'Osteometabolismo', 'raquitismo': 'Osteometabolismo',
  'paget': 'Osteometabolismo', 'fratura por fragilidade': 'Osteometabolismo',
  // Neuroendocrinologia
  'prolactinoma': 'Neuroendocrinologia', 'hiperprolactinemia': 'Neuroendocrinologia',
  'macroprolactina': 'Neuroendocrinologia', 'cabergolina': 'Neuroendocrinologia',
  'acromegalia': 'Neuroendocrinologia', 'craniofaringioma': 'Neuroendocrinologia',
  'hipofise': 'Neuroendocrinologia', 'hipofisario': 'Neuroendocrinologia',
  'hipofisite': 'Neuroendocrinologia', 'apoplexia hipofisaria': 'Neuroendocrinologia',
  'hipopituitarismo': 'Neuroendocrinologia',
  // Adrenal
  'insuficiencia adrenal': 'Adrenal', 'addison': 'Adrenal', 'cushing': 'Adrenal',
  'feocromocitoma': 'Adrenal', 'hiperaldosteronismo': 'Adrenal',
  'incidentaloma adrenal': 'Adrenal', 'cortisol': 'Adrenal',
  'cosintropina': 'Adrenal', 'hidrocortisona': 'Adrenal', 'glicocorticoide': 'Adrenal',
  // Tireoide
  'hipotireoidismo': 'Tireoide', 'hipertireoidismo': 'Tireoide', 'tireotoxicose': 'Tireoide',
  'graves': 'Tireoide', 'hashimoto': 'Tireoide', 'tireoidite': 'Tireoide',
  'levotiroxina': 'Tireoide', 'metimazol': 'Tireoide', 'propiltiouracil': 'Tireoide',
  'radioiodo': 'Tireoide', 'eutireoidiano doente': 'Tireoide',
  'tempestade tireoidiana': 'Tireoide', 'tempestade tireotoxica': 'Tireoide',
  'crise tireotoxica': 'Tireoide', 'tireoidectomia': 'Tireoide',
  'bocio': 'Tireoide', 'nodulo tireoidiano': 'Tireoide',
  // Diabetes
  'cetoacidose': 'Diabetes', 'hipoglicemia': 'Diabetes', 'insulina': 'Diabetes',
  'metformina': 'Diabetes', 'retinopatia': 'Diabetes', 'nefropatia diabetica': 'Diabetes',
  'neuropatia diabetica': 'Diabetes', 'pe diabetico': 'Diabetes', 'mody': 'Diabetes',
  // Obesidade / Lípides
  'semaglutida': 'Obesidade', 'tirzepatida': 'Obesidade', 'liraglutida': 'Obesidade',
  'cirurgia bariatrica': 'Obesidade', 'bariatrica': 'Obesidade',
  'hipercolesterolemia': 'Lípides', 'estatina': 'Lípides', 'ezetimiba': 'Lípides',
  'hipertrigliceridemia': 'Lípides', 'lipoproteina': 'Lípides', 'ldl': 'Lípides',
  // Feminina / Masculina / Pediátrica
  'ovarios policisticos': 'Endocrinologia Feminina', 'hirsutismo': 'Endocrinologia Feminina',
  'amenorreia': 'Endocrinologia Feminina', 'menopausa': 'Endocrinologia Feminina',
  'hipogonadismo': 'Endocrinologia Masculina', 'testosterona': 'Endocrinologia Masculina',
  'ginecomastia': 'Endocrinologia Masculina',
  'puberdade precoce': 'Endocrinologia Pediátrica', 'baixa estatura': 'Endocrinologia Pediátrica',
  // Endocrinopatias (miscelânea do acervo)
  'hiponatremia': 'Endocrinopatias', 'hipernatremia': 'Endocrinopatias',
  'desmielinizacao osmotica': 'Endocrinopatias', 'copeptina': 'Endocrinopatias',
  'tolvaptan': 'Endocrinopatias', 'siad': 'Endocrinopatias', 'siadh': 'Endocrinopatias',
  'dumping': 'Endocrinopatias'
};

function deacc(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// ⚠️ FRONTEIRA DE PALAVRA, e não `includes`. Enquanto `canonArea` só recebia
// NOME DE ÁREA, casar por substring era inofensivo. Ao passar a receber a
// PERGUNTA do médico (o grounding do chat), vira armadilha: a chave 'osso' está
// dentro de "posso" e de "nosso", e "posso dar bisfosfonato?" roteava para
// Osteometabolismo por acidente — acertando o destino pelo motivo errado, o que
// é pior do que errar, porque a próxima frase com "nosso paciente" leva junto.
// O sufixo opcional preserva o plural e a flexão simples ("dislipidemias",
// "bisfosfonatos", "estatinas") que o `includes` pegava de graça.
const RE_CACHE = new Map();
function bate(hay, chave) {
  let re = RE_CACHE.get(chave);
  if (!re) {
    re = new RegExp('(^|[^a-z0-9])' + chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es|as|os)?([^a-z0-9]|$)');
    RE_CACHE.set(chave, re);
  }
  return re.test(hay);
}

// A área pode chegar como "Diabetes", "Diabetes — pé diabético", o texto de
// grounding ("Tireoide nódulo") ou a PERGUNTA CRUA do chat: casa pela chave mais
// longa que aparecer como palavra. Nome de área ganha de termo clínico no
// empate de tamanho, porque quem manda `area` já disse o que quer.
function canonArea(area) {
  const a = deacc(area);
  if (!a) return '';
  if (CANON[a]) return CANON[a];
  if (TERMOS[a]) return TERMOS[a];
  let melhor = '', destino = '';
  for (const k of Object.keys(CANON)) {
    if (k.length > melhor.length && bate(a, k)) { melhor = k; destino = CANON[k]; }
  }
  for (const k of Object.keys(TERMOS)) {
    if (k.length > melhor.length && bate(a, k)) { melhor = k; destino = TERMOS[k]; }
  }
  return destino;
}

// ── CONTEÚDO ────────────────────────────────────────────────────────────────
// O conteúdo vive em lib/clinical-deep-data.js, GERADO a partir dos extratos
// verificados. Cada área é um array de blocos; um bloco = um artigo primário
// lido, com { tema, fonte, texto }. Nada é escrito ali sem citação literal
// conferida contra o PDF (scripts/verifica-extracao.js).
const DEEP = require('./clinical-deep-data');

// Palavras que não distinguem nada dentro de uma subespecialidade.
const VAZIAS = new Set(['para', 'como', 'quando', 'sobre', 'entre', 'pelo', 'pela', 'dos', 'das', 'com', 'sem',
  'diagnostico', 'tratamento', 'manejo', 'clinica', 'clinico', 'doenca', 'sindrome', 'paciente', 'terapia',
  'endocrinologia', 'geral', 'avaliacao', 'conduta', 'caso', 'casos', 'questao', 'prova']);

// ⚠️ SELEÇÃO POR TEMA — a razão de existir desta função.
// A extração do acervo é EXAUSTIVA de propósito: 10 artigos já renderam 1.325
// fatos, e os 245 da fila devem passar de 6 MB. Um único artigo de
// craniofaringioma tem 249 fatos. Mandar a área inteira em toda geração não cabe
// (Osteometabolismo sozinho passaria 7x do teto) e nem faria sentido: questão de
// cetoacidose não precisa da tabela de doses da hipofosfatasia.
//
// Então: ARQUIVO completo, ENTREGA selecionada. Os blocos são ordenados por
// quantas palavras do tema pedido eles contêm; empate desfeito pela ordem de
// autoridade que o montador já gravou (diretriz > revisão > estudo; mais novo
// antes). Bloco sem relação com o tema entra por último, se sobrar espaço.
function deepFor(area, limite, tema) {
  const canon = canonArea(area);
  if (!canon || !DEEP[canon] || !DEEP[canon].length) return '';
  const teto = Math.max(2000, Math.min(limite || 120000, 400000));

  // Termos do tema, tirando o próprio nome da área (que não discrimina nada).
  const alvo = deacc(tema || area).replace(deacc(canon), ' ');
  const termos = alvo.replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
    .filter((w) => w.length >= 4 && !VAZIAS.has(w));

  const pontuados = DEEP[canon].map((b, i) => {
    const hay = deacc(b.tema + ' ' + b.texto);
    let pts = 0;
    for (const t of termos) {
      // radical curto tolera plural e flexão ("nodulo"/"nodulos", "adrenal"/"adrenais")
      const raiz = t.length > 6 ? t.slice(0, t.length - 2) : t;
      if (hay.indexOf(raiz) >= 0) pts += (b.tema && deacc(b.tema).indexOf(raiz) >= 0) ? 3 : 1;
    }
    return { b, pts, i };
  });
  // relevância primeiro; empate mantém a ordem de autoridade do montador
  pontuados.sort((x, y) => (y.pts - x.pts) || (x.i - y.i));

  const cabecalho =
    `\n\nAPROFUNDAMENTO — ${canon.toUpperCase()} (extraído dos artigos primários do acervo, ` +
    `com os dados conferidos no texto original; prefira-os a lembranças gerais):\n`;
  // Corta um bloco no limite de frase, declarando o corte.
  const cortar = (b, espaco) => {
    const cabeca = `• ${b.tema} — ${b.fonte}: `;
    const cabe = espaco - cabeca.length - 60;
    if (cabe < 400) return '';
    let t = b.texto.slice(0, cabe);
    const c = Math.max(t.lastIndexOf('. '), t.lastIndexOf('; '));
    if (c > cabe * 0.5) t = t.slice(0, c + 1);
    return cabeca + t + ' […cortado por limite de tamanho]';
  };

  let out = cabecalho;
  let usados = 0;
  // ⚠️ O bloco MAIS RELEVANTE tem prioridade absoluta, mesmo que não caiba inteiro.
  // Sem isto acontecia o pior caso silencioso: pedindo "diabetes pós-transplante",
  // o bloco do tema (grande) era PULADO por não caber e entrava o de MODY (pequeno)
  // no lugar — a IA recebia conteúdo da área certa e do assunto errado, sem
  // qualquer sinal de que o tema pedido tinha ficado de fora.
  const inicio = pontuados[0];
  if (inicio && inicio.pts > 0) {
    const linha = `• ${inicio.b.tema} — ${inicio.b.fonte}: ${inicio.b.texto}`;
    if (out.length + linha.length + 1 <= teto) { out += linha + '\n'; usados++; }
    else {
      const parcial = cortar(inicio.b, teto - out.length);
      if (parcial) { out += parcial + '\n'; usados++; }
    }
    pontuados.shift();
  }
  for (const p of pontuados) {
    const linha = `• ${p.b.tema} — ${p.b.fonte}: ${p.b.texto}`;
    if (out.length + linha.length + 1 > teto) continue; // tenta o próximo, menor
    out += linha + '\n';
    usados++;
  }
  // ⚠️ Nenhum bloco INTEIRO coube. Um artigo bem extraído passa de 40 mil
  // caracteres, então isto acontece de verdade sempre que o teto é apertado — e
  // devolver vazio seria o pior resultado: a IA perderia o tema mais relevante
  // justamente quando ele foi pedido. Entrega o mais relevante CORTADO, num
  // limite de frase, e diz que foi cortado.
  if (!usados && pontuados.length) {
    const b = pontuados[0].b;
    const cabeca = `• ${b.tema} — ${b.fonte}: `;
    const espaco = teto - out.length - cabeca.length - 60;
    if (espaco > 400) {
      let t = b.texto.slice(0, espaco);
      const corte = Math.max(t.lastIndexOf('. '), t.lastIndexOf('; '));
      if (corte > espaco * 0.5) t = t.slice(0, corte + 1);
      out += cabeca + t + ' […cortado por limite de tamanho]\n';
      usados = 1;
    }
  }
  return usados ? out : '';
}

// Quantos blocos existem por área (usado pelo teste e pelo relatório de cobertura).
function coberturaDeep() {
  const o = {};
  for (const k of Object.keys(DEEP)) o[k] = DEEP[k].length;
  return o;
}

module.exports = { deepFor, canonArea, coberturaDeep, DEEP };
