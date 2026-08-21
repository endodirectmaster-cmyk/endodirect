// ⚠️ A peneira de citação truncada não pode reprovar DIRETRIZ BRASILEIRA GRADUADA.
//
// `cobertura-extracao.js` reprova o extrato quando mais de 25% das citações
// terminam em preposição, conjunção ou hífen — sinal de frase cortada pela
// intercalação de colunas do PDF. A lista de caudas ruins tem `a`, para o "a"
// preposição do português e o artigo do inglês.
//
// A SBD fecha cada recomendação com o grau em duas linhas — "Classe I / Nível A" —
// e a citação que inclui o grau (como DEVE, para sustentar a FORÇA da recomendação)
// termina na letra do nível. Medido em 21/08/2026 nas três diretrizes SBD 2026:
// 8 de 16 (DM2), 9 de 30 (doença renal) e 5 de 17 (IC) reprovavam — exatamente o
// número de recomendações Nível A de cada uma, e nenhuma truncada de verdade.
//
// Este teste trava as DUAS pontas: a cauda de graduação passa, e a cauda ruim de
// verdade continua reprovando. Afrouxar a segunda para consertar a primeira é o
// erro que ele existe para impedir.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(RAIZ, 'scripts', 'cobertura-extracao.js'), 'utf8');

// Carrega as duas constantes e a função do próprio arquivo, sem executá-lo.
const pega = (nome) => {
  const m = src.match(new RegExp('const ' + nome + ' = (/.*/[a-z]*);'));
  if (!m) { console.error('✗ não achei ' + nome + ' em cobertura-extracao.js'); process.exit(1); }
  return eval(m[1]); // eslint-disable-line no-eval
};
const CAUDA_RUIM = pega('CAUDA_RUIM');
const CAUDA_GRADUACAO = pega('CAUDA_GRADUACAO');
const caudaTruncada = (c) => {
  const t = String(c || '').trim();
  return CAUDA_GRADUACAO.test(t) ? false : CAUDA_RUIM.test(t);
};

const falhas = [];
const checa = (rot, cit, esperado) => {
  const obtido = caudaTruncada(cit);
  if (obtido !== esperado) {
    falhas.push(`${rot}: esperava truncada=${esperado}, obtive ${obtido} → "${String(cit).slice(-58)}"`);
  }
};

// ── 1. Cauda de GRADUAÇÃO: completa por construção, não pode reprovar ────────
checa('Nível A', 'R5 - Em adultos assintomáticos com DM2, a METFORMINA É RECOMENDADA. Classe I Nível A', false);
checa('Nível B', 'R2 - O rastreamento deve ser iniciado no momento do diagnóstico. Classe I Nível B', false);
checa('Nível C', 'R23 - A meta de pressão arterial é abaixo de 130/80 mmHg. Classe I Nível C', false);
checa('Classe IIa', 'R7 - A metformina DEVE SER CONSIDERADA em adição ao inibidor do SGLT2. Classe IIa', false);
checa('Classe IIb', 'R13 - O antagonista esteroidal PODE SER CONSIDERADO. Classe IIb', false);
checa('Classe III', 'R8 - O uso combinado de IECA e BRA NÃO É RECOMENDADO. Classe III', false);
checa('acentuado (Nivel)', 'R1 - Os inibidores do SGLT2 ESTÃO RECOMENDADOS como inicial. Classe I Nivel A', false);

// ── 2. Cauda RUIM de verdade: tem de continuar reprovando ────────────────────
// Se alguém "consertar" a peneira alargando CAUDA_GRADUACAO, estes quebram.
checa('preposição pt', 'a excreção renal de albumina aumenta quando o paciente é tratado com', true);
checa('artigo en', 'none of these approaches has been proven effective in a', true);
checa('conjunção pt', 'o inibidor de SGLT2 reduz hospitalização por IC e', true);
checa('hífen de quebra', 'o risco de acidose lática aumenta com a piora da função re-', true);
checa('travessão', 'a meta de HbA1c deve ser individualizada —', true);
// A armadilha: "nível" seguido de algo que NÃO é grau não pode passar de graça.
checa('nível sem grau', 'o desfecho foi avaliado no mesmo nível de', true);
checa('classe sem grau', 'a droga pertence à mesma classe da', true);

if (falhas.length) {
  console.error('✗ peneira de cauda truncada com comportamento errado:');
  falhas.forEach((f) => console.error('   · ' + f));
  process.exit(1);
}
console.log('✓ cauda truncada: grau de diretriz (Classe/Nível) passa, cauda cortada de verdade segue reprovando');
