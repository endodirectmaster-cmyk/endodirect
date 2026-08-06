// A IA tem de respeitar o posicionamento SBEM/SBU/ABEMSS 2026 de hipogonadismo.
//
// ⚠️ DOIS ERROS DE FATO ESTAVAM NO BLOCO QUE ANCORA TODA A GERAÇÃO DE IA, e a
// plataforma os repetia em questão, comentário e flashcard:
//   1. "repetir em 2 dias" — o documento pede a 2ª amostra IDEALMENTE COM 4
//      SEMANAS de intervalo;
//   2. "Ht > 54%" listado como CONTRAINDICAÇÃO — o que contraindica é o
//      hematócrito BASAL > 48% (relativa); 54% é o gatilho para SUSPENDER
//      durante o tratamento. Confundir os dois nega tratamento a quem podia
//      receber e mantém quem devia parar.
// Faltavam ainda os dois números que mais caem em prova: corte da testosterona
// livre CALCULADA (6,5 ng/dL) e alvo da reposição (450–600 ng/dL).
//
// ⚠️ E MAIS DA METADE DOS GERADORES NÃO RECEBIA DIRETRIZ NENHUMA. Flashcards,
// mapas mentais, caso para prescrição, avaliação da prescrição e as questões do
// simulado mandavam um system CRU — a IA escrevia conduta sem a fonte que o
// professor mantém. Agora passam por `groundSys`, que injeta o mesmo bloco com o
// MESMO sentinela do prompt-cache (prefixo estável, ~0,1x do custo).
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Extrai o bloco REAL de diretrizes (concatenação de dezenas de literais).
const iG = APP.indexOf('var CLINICAL_GUIDELINES=');
const GUIDE = eval(APP.slice(iG + 'var CLINICAL_GUIDELINES='.length, APP.indexOf("';", iG) + 1)); // eslint-disable-line no-eval
const linha = GUIDE.split('\n').find((l) => /hipogonadismo masculino/i.test(l)) || '';

// ---- 1. ⚠️ OS DOIS ERROS NÃO PODEM VOLTAR ----------------------------------
{
  ok('achei a linha de hipogonadismo no bloco de diretrizes', !!linha);
  ok('⚠️ a 2ª amostra é com 4 SEMANAS, não "2 dias"',
     /4 SEMANAS/i.test(linha) && !/repetir em 2 dias/i.test(linha),
     'o documento exige intervalo de ~4 semanas entre as duas coletas');
  ok('⚠️ o que contraindica é o hematócrito BASAL > 48%',
     /BASAL >48%|BASAL > 48%/.test(linha),
     'listar 54% como contraindicação nega tratamento a quem podia receber');
  ok('⚠️ e 54% aparece como gatilho de SUSPENSÃO, não de contraindicação',
     /54% EM TRATAMENTO/.test(linha),
     'os dois números têm papéis opostos e estavam trocados');
}

// ---- 2. os números que o documento fixa ------------------------------------
{
  ok('corte da livre CALCULADA (6,5 ng/dL)', /6,5 ng\/dL/.test(linha));
  ok('alvo da reposição (450–600 ng/dL)', /450–600 ng\/dL/.test(linha));
  ok('os três patamares de TT', /<264 ng\/dL apoia/.test(linha) && />350 ng\/dL exclui/.test(linha) && /264–350/.test(linha));
  ok('coleta 7–10 h em jejum', /7–10 h/.test(linha) && /jejum/.test(linha));
  ok('contra rastreamento populacional', /Classe III\/A/.test(linha));
  ok('RM de sela se T ≤150 ng/dL', /≤150 ng\/dL/.test(linha));
  ok('fertilidade: hCG e FSH com dose', /hCG 1\.500–2\.000 UI/.test(linha) && /FSH 75–150 UI/.test(linha));
  ok('PSA: velocidade e salto que pedem urologista', /0,75 ng\/mL\/ano/.test(linha) && /1,4 ng\/mL/.test(linha));
  ok('cita o documento pelo nome e pela revista',
     /SBEM\/SBU\/ABEMSS/.test(linha) && /Int Braz J Urol/.test(linha),
     'sem a fonte, a próxima pessoa não sabe contra o que conferir');
}

// ---- 3. ⚠️ OS GERADORES CLÍNICOS RECEBEM O BLOCO ---------------------------
{
  ok('existe o helper que ancora sem forçar JSON', /function groundSys\(sys\)\{return CLINICAL_GUIDELINES\+'__ENDODIRECT_SYS_SPLIT_b1f7__'/.test(APP));
  const geradores = [
    ['flashcards', "callAI(groundSys('Endocrinologista educador BR. JSON APENAS: {\"cards\""],
    ['mapas mentais', "callAI(groundSys('Endocrinologista educador. JSON APENAS: {\"root\""],
    ['caso p/ prescrição', "callAI(groundSys('Preceptor de endocrinologia BR. JSON APENAS: {\"caso\""],
    ['avaliação da prescrição', "callAI(groundSys('Preceptor de endocrinologia. Avalie a prescrição"],
    ['questões do simulado', "callAI(groundSys('Examinador de endocrinologia BR. JSON APENAS: {\"questions\""]
  ];
  geradores.forEach(([nome, marca]) => {
    ok('⚠️ ' + nome + ' recebe as diretrizes', APP.indexOf(marca) > 0,
       'sem isto a IA escreve conduta sem a fonte que o professor mantém');
  });

  // EXECUTA o helper: o bloco tem de chegar inteiro e a persona ficar no fim.
  const ctx = { CLINICAL_GUIDELINES: GUIDE, String };
  vm.createContext(ctx);
  const i = APP.indexOf('function groundSys(');
  vm.runInContext(APP.slice(i, APP.indexOf('\n', i)), ctx);
  const out = ctx.groundSys('Endocrinologista educador BR. JSON APENAS: {"cards":[]}');
  ok('o bloco de diretrizes chega ao gerador', out.indexOf('DIRETRIZES RECENTES') === 0 || out.indexOf('DIRETRIZES RECENTES') > 0);
  ok('com a regra nova de hipogonadismo dentro', /BASAL >48%/.test(out) && /450–600/.test(out));
  ok('o sentinela do prompt-cache é preservado', out.indexOf('__ENDODIRECT_SYS_SPLIT_b1f7__') > 0,
     'sem ele o bloco deixa de ser prefixo cacheável e cada chamada paga o preço cheio');
  ok('a persona do gerador continua intacta no fim', out.endsWith('JSON APENAS: {"cards":[]}'));
  ok('⚠️ groundSys NÃO força JSON', out.indexOf('RESPONDA SOMENTE com JSON') < 0,
     'forçar JSON quebraria os geradores que devolvem texto corrido');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do hipogonadismo 2026 falharam.'); process.exit(1); }
console.log('Hipogonadismo SBEM/SBU/ABEMSS 2026 (ancoragem da IA): OK');
