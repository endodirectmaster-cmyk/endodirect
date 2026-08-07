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
// Cada área é um array de blocos. Um bloco = um artigo primário lido.
// Campos: tema, fonte (periódico + ano + autores quando couber), texto.
// O `texto` só contém o que foi CONFERIDO no PDF.
const DEEP = {
  Diabetes: [
    {
      tema: 'Diabetes monogênico e MODY',
      fonte: 'Bonnefond A, et al. Monogenic diabetes. Nature Reviews Disease Primers 2023;9:12 (DOI 10.1038/s41572-023-00421-w)',
      texto:
        'Grupo de diabetes de início precoce causado por alteração em UM gene, com secreção de insulina deficiente NA AUSÊNCIA de obesidade — o paciente costuma ser rotulado como DM2 ou DM1. ' +
        'O mesmo gene pode produzir formas de início precoce ou tardio conforme o impacto funcional da variante, e a mesma variante patogênica pode dar fenótipos diferentes DENTRO DA MESMA FAMÍLIA. ' +
        'MODY é a forma mais prevalente: 0,5–5% dos diagnosticados com diabetes não autoimune, provavelmente subdiagnosticado por falta de teste genético (no Reino Unido, estima-se que >80% dos casos de MODY não sejam diagnosticados). ' +
        'Herança autossômica dominante na maioria dos casos de MODY e de diabetes neonatal; história familiar forte; início <25 anos pela definição original. ' +
        'Diabetes NEONATAL: ~1 em 90.000 nascidos vivos, nos primeiros 6 meses de vida. ' +
        'Mais de 40 subtipos descritos; os mais prevalentes são deficiências de GCK e de HNF1A. ' +
        'CONDUTA POR GENE — é aqui que o diagnóstico genético muda o tratamento: ' +
        '(1) GCK (dominante): o tratamento do diabetes é DESNECESSÁRIO, por dois motivos explícitos no documento — nenhum tratamento modifica a glicemia desses pacientes, que é firmemente controlada pela atividade enzimática da GCK; e eles foram inequivocamente demonstrados NÃO desenvolver as complicações típicas do diabetes (como retinopatia e nefropatia). ' +
        'Suspeitar de GCK diante de macrossomia fetal em gestações prévias, ou de insulina usada apenas durante a gestação anterior e suspensa após o parto. ' +
        '(2) HNF1A e HNF4A (dominantes): diabetes grave de início precoce, frequentemente revelado na PUBERDADE (quando surge resistência à insulina). São otimamente tratados com SULFONILUREIA EM BAIXA DOSE — a baixa dose é eficaz por causa do aumento da secreção e da sensibilidade à insulina, o que também diminui o risco de hipoglicemia. ' +
        '(3) HNF1B (dominante): ⚠️ NÃO responde adequadamente à sulfonilureia, possivelmente por atrofia pancreática e resistência hepática à insulina — a regra do HNF1A NÃO se estende a ele; esses pacientes costumam ser tratados com insulina. ' +
        'ERRO CLÍNICO FREQUENTE: sem diagnóstico genético, o quadro é confundido com DM1 e a sulfonilureia só é introduzida após DÉCADAS de insulinoterapia, sobretudo quando o diabetes aparece na adolescência ou no adulto jovem. ' +
        'Após o diagnóstico genético, acompanhar as manifestações extrapancreáticas: coração nos deficientes de GATA4 ou GATA6, e rim nos de HNF1B.'
    }
  ]
};

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
