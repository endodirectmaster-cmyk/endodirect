#!/usr/bin/env node
/* O primeiro artigo de uma subespecialidade VAZIA muda o roteamento da base inteira.
 *
 * POR QUE ISTO EXISTE (19/08/2026). O Posicionamento ABESO/SBP 2026 é o PRIMEIRO
 * extrato de Endocrinologia Pediátrica — a área saiu de ZERO bloco. Isso quebrou
 * duas coisas de uma vez, e nenhuma delas é sobre o conteúdo novo:
 *
 *   1. ROUBO DE ÁREA. `deepFor` só desce para a segunda colocada quando a
 *      primeira está VAZIA. A vinheta "menina de 9 anos com cefaleia, baixa
 *      estatura e calcificação suprasselar" roteava para Endocrinologia
 *      Pediátrica e chegava em Neuroendocrinologia POR ACIDENTE, pela descida.
 *      No dia em que a pediatria ganhou conteúdo, ela passou a receber obesidade
 *      pediátrica no lugar dos 295k de craniofaringioma — o assunto exato da
 *      pergunta. O comentário do teste de teto já previa isso em 2026-08-08.
 *
 *   2. TETO DA ÁREA VIZINHA. O documento inteiro num bloco só levava Obesidade a
 *      405.254 contra o teto de 400.000, e 400k é o TETO_MAXIMO. Daí o extrato
 *      nascer PARTIDO: a CONDUTA vai para as duas áreas (Endocrinologia
 *      Pediátrica e Obesidade) e o CONTEXTO (epidemiologia, linguagem inclusiva,
 *      síndromes genéticas, instrumentos de rastreio, equidade) fica só na
 *      subespecialidade. Nenhum fato foi descartado.
 *
 * ⚠️ E POR QUE A CONDUTA TEM DE FICAR TAMBÉM EM OBESIDADE. Medido em 12 perguntas
 * realistas de obesidade pediátrica: DEZ canonizam para Obesidade e NENHUMA para
 * Endocrinologia Pediátrica — quem pergunta escreve "obesidade", não o nome da
 * subespecialidade. Arquivado só na pediatria, este bloco seria inalcançável
 * justamente para as perguntas que ele responde, e "adolescente com obesidade
 * grave, quando indicar cirurgia?" receberia os blocos de ADULTO sem o pediátrico
 * junto — a inversão de régua que o núcleo existe para impedir.
 *
 * Uso:  node scripts/test-pediatria-obesidade.js
 */
const fs = require('fs');
const path = require('path');
const deep = require('../lib/clinical-deep');

const RAIZ = path.join(__dirname, '..');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

// ── 1. a conduta pediátrica CHEGA a quem pergunta por ela ───────────────────
// ⚠️ Cada caso confere o CONTEÚDO, não a área. Teste de roteamento que aceita
// qualquer coisa da área certa mede meia coisa — a lição já está escrita na
// vinheta de dumping do test-teto-diretrizes.js.
const CHEGA = [
  ['crianca de 3 anos com IMC +2,5 DP, e obesidade?', /OMS 2006/, 'a régua dos MENORES DE 5 ANOS'],
  ['adolescente de 15 anos com obesidade grave, quando indicar cirurgia bariatrica?', /2\.429\/2025/, 'a Resolução CFM (idade de cirurgia no Brasil)'],
  ['obesidade em adolescente de 12 anos, posso usar semaglutida?', /STEP TEENS/, 'o ensaio pediátrico da semaglutida'],
  ['obesidade infantil, quais exames laboratoriais pedir?', /26 U\/L/, 'o corte pediátrico de ALT'],
  ['crianca com obesidade e triglicerideos de 120, esta alterado?', /> ?100 mg\/dL|100 mg\/dL/, 'o corte de triglicerídeo dos 2 aos 9 anos']
];
for (const [q, re, oque] of CHEGA) {
  const b = deep.deepFor(q, deep.TETO_PROFUNDO, q);
  ok(re.test(b), `⚠️ "${q.slice(0, 46)}…" NÃO recebeu ${oque} — o bloco de obesidade pediátrica não está chegando a quem pergunta por ele (saiu de Obesidade a declaração de área do extrato?)`);
}

// ── 2. e não ROUBA de quem tem o conteúdo certo ─────────────────────────────
const NAO_ROUBA = [
  ['Menina de 9 anos com cefaleia, baixa estatura e calcificação suprasselar na tomografia. Conduta?', /craniofaringioma/i, 'craniofaringioma'],
  ['crianca com baixa estatura e calcificacao supra-selar', /craniofaringioma/i, 'craniofaringioma'],
  ['crianca com baixa estatura e hipotireoidismo', /levotiroxina|tireoid/i, 'tireoide']
];
for (const [q, re, area] of NAO_ROUBA) {
  const b = deep.deepFor(q, deep.TETO_PROFUNDO, q);
  ok(re.test(b), `⚠️ "${q.slice(0, 46)}…" deixou de receber o bloco de ${area} — a área pediátrica, agora que TEM conteúdo, está roubando de quem responde a pergunta`);
}

// ── 3. o corte do extrato em dois não perdeu fato nem prometeu o que não tem ─
const A = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scratchpad/acervo/extratos/abeso-sbp-2026-obesidade-pediatrica.json'), 'utf8'));
const B = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scratchpad/acervo/extratos/abeso-sbp-2026-obesidade-pediatrica-contexto.json'), 'utf8'));
ok(A.fatos.length + B.fatos.length === 161,
  `⚠️ o documento foi extraído em 161 fatos e os dois blocos somam ${A.fatos.length + B.fatos.length} — o corte por área não pode DESCARTAR fato`);
ok(/obesidade/i.test(String(A.area)) && /pedi/i.test(String(A.area)),
  '⚠️ o bloco de CONDUTA precisa das duas áreas (Endocrinologia Pediátrica e Obesidade): 10 de 12 perguntas reais canonizam para Obesidade');

// ⚠️ O `tema` é a VITRINE e pontua a escolha do bloco. Prometer nele o que ficou
// no bloco irmão é o defeito do prolactinoma (o campo anunciava seções que o
// extrato não tinha) — e aqui o risco é estrutural, porque os dois blocos vêm do
// mesmo documento e a tentação é reaproveitar o tema inteiro nos dois.
const DISTINTIVOS = ['OMS 2006', 'RCEst', 'Lancet 2025', 'MC4R', 'setmelanotida', 'NHLBI',
  'STEP TEENS', 'CFM 2.429/2025', 'Teen-LABS', 'USPSTF', '5As', 'Guia Alimentar',
  'Atlas Mundial', 'linguagem inclusiva', 'Prader-Willi', 'Bardet-Biedl', 'ECAP', 'EDE-Q', 'telemedicina'];
for (const bloco of [A, B]) {
  const tema = String(bloco.tema || '').toLowerCase();
  const corpo = bloco.fatos.map((f) => f.afirmacao + ' ' + f.secao).join(' ').toLowerCase();
  for (const t of DISTINTIVOS) {
    const k = t.toLowerCase();
    ok(!(tema.includes(k) && !corpo.includes(k)),
      `⚠️ PROMESSA NÃO CUMPRIDA em ${bloco.fileId}: o \`tema\` anuncia "${t}" e nenhum fato DESTE bloco trata disso — ele ficou no bloco irmão`);
  }
}

// ── 4. Obesidade continua abaixo do teto ────────────────────────────────────
{
  const tot = (deep.DEEP['Obesidade'] || []).reduce((s, b) => s + String(b.texto || '').length + String(b.tema || '').length, 0);
  ok(tot < deep.TETO_PROFUNDO,
    `⚠️ Obesidade voltou a estourar o teto (${tot}/${deep.TETO_PROFUNDO}) — acima dele os últimos blocos somem em silêncio e 400k já é o TETO_MAXIMO`);
}

if (falhas.length) {
  console.error('✗ obesidade pediátrica na base profunda:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ obesidade pediátrica: chega a quem pergunta, não rouba de quem responde, e o corte em dois não perdeu fato');
