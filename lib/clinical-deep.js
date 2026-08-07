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

function deacc(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// A área pode chegar como "Diabetes", "Diabetes — pé diabético" ou o texto de
// grounding ("Tireoide nódulo"): casa pelo prefixo mais longo que bater.
function canonArea(area) {
  const a = deacc(area);
  if (!a) return '';
  if (CANON[a]) return CANON[a];
  let melhor = '';
  for (const k of Object.keys(CANON)) {
    if ((a === k || a.startsWith(k + ' ') || a.includes(k)) && k.length > melhor.length) melhor = k;
  }
  return melhor ? CANON[melhor] : '';
}

// ── CONTEÚDO ────────────────────────────────────────────────────────────────
// O conteúdo vive em lib/clinical-deep-data.js, GERADO a partir dos extratos
// verificados. Cada área é um array de blocos; um bloco = um artigo primário
// lido, com { tema, fonte, texto }. Nada é escrito ali sem citação literal
// conferida contra o PDF (scripts/verifica-extracao.js).
const DEEP = require('./clinical-deep-data');

// Monta o bloco profundo da área, pronto para entrar no prefixo cacheável.
// Devolve '' quando não há conteúdo — o núcleo continua valendo sozinho.
function deepFor(area, limite) {
  const canon = canonArea(area);
  if (!canon || !DEEP[canon] || !DEEP[canon].length) return '';
  const teto = Math.max(2000, Math.min(limite || 120000, 200000));
  const partes = DEEP[canon].map(
    (b) => `• ${b.tema} — ${b.fonte}: ${b.texto}`
  );
  const cabecalho =
    `\n\nAPROFUNDAMENTO — ${canon.toUpperCase()} (extraído dos artigos primários do acervo; ` +
    `use estes dados quando o tema aparecer, e prefira-os a lembranças gerais):\n`;
  let out = cabecalho;
  for (const p of partes) {
    if (out.length + p.length + 1 > teto) break;
    out += p + '\n';
  }
  return out;
}

// Quantos blocos existem por área (usado pelo teste e pelo relatório de cobertura).
function coberturaDeep() {
  const o = {};
  for (const k of Object.keys(DEEP)) o[k] = DEEP[k].length;
  return o;
}

module.exports = { deepFor, canonArea, coberturaDeep, DEEP };
