#!/usr/bin/env node
/* Quarta peneira: a RESSALVA ainda descreve o núcleo que existe hoje?
 *
 * POR QUE ISTO EXISTE (07/08/2026). O campo `conflito` de um extrato é uma
 * FOTOGRAFIA do núcleo no dia em que o artigo foi lido. Só que a varredura do
 * acervo CORRIGE o núcleo — é metade do objetivo dela. No instante em que eu
 * corrijo o núcleo a partir de um artigo, a ressalva daquele mesmo artigo passa
 * a descrever um núcleo que não existe mais.
 *
 * Não é hipótese. Medido hoje, em produção, sobre 13 ressalvas escritas:
 *
 *   · prolactinoma — a ressalva diz que "o núcleo diz que agonista dopaminérgico
 *     é a 1ª linha MESMO em macroprolactinomas". O núcleo foi corrigido e hoje
 *     decide pelo grau de Knosp. A ressalva mandava a IA sobrescrever uma
 *     entrada JÁ CERTA usando um erro que não existe mais;
 *   · crise tireotóxica — a ressalva alerta que o núcleo enumera "iodo +
 *     glicocorticoide + betabloqueador + ATD" e que ler isso como sequência
 *     inverte a ordem. O núcleo hoje escreve "⚠️ A ORDEM IMPORTA: TIONAMIDA
 *     PRIMEIRO". O alerta virou ruído sobre um texto correto;
 *   · quatro extratos de hiponatremia citam o núcleo como "≤8 mmol/L/24 h se
 *     risco (≤10–12 sem risco)" e "bólus 100–150 mL" — enunciados que foram
 *     substituídos.
 *
 * ⚠️ Ressalva velha é PIOR que ressalva ausente: ela chega com a autoridade de
 * um aviso de segurança e manda desconfiar justamente do que acabou de ser
 * corrigido. E o defeito é AUTOINFLIGIDO — quanto melhor a varredura funciona,
 * mais ressalvas ela apodrece.
 *
 * A trava é a mesma que já vale para os fatos: CITAÇÃO LITERAL, conferida.
 *   `nucleo_citado`  — trechos que a ressalva atribui ao NÚCLEO. Cada um tem de
 *                      aparecer VERBATIM no CLINICAL_GUIDELINES de hoje. Se eu
 *                      reescrever o núcleo, isto quebra e obriga a reescrever a
 *                      ressalva. É o oposto de confiar na memória.
 *   `nucleo_ausente` — termos que a ressalva afirma que o núcleo NÃO tem
 *                      (é como toda `lacuna` se justifica). Se um deles passar a
 *                      existir, a lacuna foi preenchida e a ressalva mente.
 *
 * Uso:  node scripts/confere-ressalvas.js [--dir scratchpad/acervo]
 * Saída: relatório por extrato; código 1 se alguma ressalva estiver defasada.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
};
const DIR = path.resolve(arg('--dir', path.join(RAIZ, 'scratchpad', 'acervo')));

const DIRECOES = ['nucleo_prevalece', 'fonte_prevalece', 'lacuna', 'misto', 'alinhado'];

// Mesma leitura de scripts/nucleo-sobre.js: o núcleo é uma string JS literal.
function nucleo() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = html.indexOf('var CLINICAL_GUIDELINES=');
  const fim = html.indexOf("';", i);
  const sb = {};
  vm.createContext(sb);
  vm.runInContext('var R;' + html.slice(i, fim + 2).replace('var CLINICAL_GUIDELINES=', 'R=') + ';', sb);
  return String(sb.R || '');
}

// Comparação tolerante ao que NÃO muda o sentido: acento, caixa, espaço e a
// família de travessões/aspas que o editor troca sozinho. Intolerante ao resto —
// número, palavra e ordem têm de bater, que é o ponto.
const norm = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[‐-―−]/g, '-')
  .replace(/[‘’“”]/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

function main() {
  const dirExt = path.join(DIR, 'extratos');
  if (!fs.existsSync(dirExt)) { console.error('✗ não existe ' + dirExt); process.exit(1); }
  const arquivos = fs.readdirSync(dirExt).filter((f) => f.endsWith('.json'));
  if (!arquivos.length) { console.error('✗ nenhum extrato em ' + dirExt); process.exit(1); }

  const N = norm(nucleo());
  if (N.length < 10000) { console.error('✗ não consegui ler o CLINICAL_GUIDELINES do index.html'); process.exit(1); }

  let reprovados = 0, comRessalva = 0;
  console.log('RESSALVAS × NÚCLEO DE HOJE (a ressalva ainda descreve o núcleo que existe?)\n');

  for (const arq of arquivos) {
    const e = JSON.parse(fs.readFileSync(path.join(dirExt, arq), 'utf8'));
    const ressalva = String(e.conflito || '').trim();
    if (!ressalva) continue;
    comRessalva++;

    const rotulo = String(e.tema || e.titulo || arq).replace(/\s+/g, ' ').slice(0, 58);
    const problemas = [];
    const dir = String(e.conflito_direcao || '').trim();

    if (!dir) {
      problemas.push('SEM `conflito_direcao`. Sem ela o montador não sabe quem vence e o cabeçalho fixo ("o núcleo prevalece") inverte a conduta onde a fonte contraindica. Valores: ' + DIRECOES.join(' | '));
    } else if (DIRECOES.indexOf(dir) < 0) {
      problemas.push(`\`conflito_direcao\` = ${JSON.stringify(dir)} não é um valor válido. Use: ${DIRECOES.join(' | ')}`);
    }

    const citados = Array.isArray(e.nucleo_citado) ? e.nucleo_citado : [];
    const ausentes = Array.isArray(e.nucleo_ausente) ? e.nucleo_ausente : [];

    // Toda ressalva que AFIRMA algo sobre o núcleo tem de provar o que afirma.
    // `alinhado` é o único isento: ali a ressalva é registro histórico, e o
    // núcleo mudou DE PROPÓSITO — exigir o texto velho seria exigir o erro.
    if (dir && dir !== 'alinhado' && !citados.length && !ausentes.length) {
      problemas.push('não declara `nucleo_citado` nem `nucleo_ausente`: a ressalva fala do núcleo sem nada que possa ser conferido, então ninguém percebe quando ela envelhecer.');
    }

    // ⚠️ PROIBIÇÃO SOB CABEÇALHO DE "O NÚCLEO VENCE" — exige justificativa escrita.
    //
    // Descoberto ao testar por mutação (07/08/2026): trocar o
    // `conflito_direcao` da hipofosfatasia para `nucleo_prevalece` reintroduzia
    // a inversão original — a contraindicação de bisfosfonato entregue sob o
    // cabeçalho "use o núcleo" — e TODOS os testes continuavam verdes. Eles
    // conferem CONSISTÊNCIA (o texto entregue bate com o campo declarado), não
    // CORREÇÃO: quem muda o campo muda o cabeçalho junto.
    //
    // Nenhum teste consegue derivar a direção certa. A prova é que a mesma
    // linguagem de proibição aparece nas duas pontas: na hipofosfatasia é a
    // fonte que proíbe e ela TEM de vencer; no PTDM de 2016 é a fonte que manda
    // evitar iSGLT2 e ela TEM de perder para o ADA 2026 do núcleo. O texto não
    // distingue os dois casos — só o julgamento clínico distingue.
    //
    // O que dá para exigir é que o julgamento esteja ESCRITO. Marcar
    // `nucleo_prevalece` numa ressalva que contém proibição passa a exigir
    // `nucleo_prevalece_porque`: uma frase dizendo por que a proibição da fonte
    // foi superada. Não impede o erro; impede que ele seja cometido de passagem.
    const PROIBE = /contraindicad|contraindicat|should not be used|should not use|desaconselh|proibid|\bavoid\b|manda evitar/i;
    if (dir === 'nucleo_prevalece' && PROIBE.test(ressalva)) {
      const pq = String(e.nucleo_prevalece_porque || '').trim();
      if (pq.length < 40) {
        problemas.push('a ressalva contém uma PROIBIÇÃO e está marcada `nucleo_prevalece` — o cabeçalho vai mandar a IA preferir o núcleo justamente onde a fonte proíbe. Se é isso mesmo (fonte superada), escreva `nucleo_prevalece_porque` explicando por quê. Se não é, a direção está errada.');
      }
    }

    for (const frag of citados) {
      const f = norm(frag);
      if (!f) continue;
      if (N.indexOf(f) < 0) {
        problemas.push(`RESSALVA DEFASADA — atribui ao núcleo um trecho que ele NÃO contém mais:\n        ${JSON.stringify(String(frag).slice(0, 160))}\n        (o núcleo foi reescrito; reescreva a ressalva ou marque \`conflito_direcao: "alinhado"\`)`);
      }
    }
    for (const termo of ausentes) {
      const t = norm(termo);
      if (!t) continue;
      if (N.indexOf(t) >= 0) {
        problemas.push(`LACUNA PREENCHIDA — a ressalva diz que o núcleo não fala de ${JSON.stringify(String(termo))}, mas ele fala. Confira com \`node scripts/nucleo-sobre.js\` e reescreva.`);
      }
    }

    if (problemas.length) {
      reprovados++;
      console.log(`✗ ${rotulo}  [${arq}]`);
      problemas.forEach((p) => console.log('    · ' + p));
    } else {
      const prova = citados.length ? `${citados.length} citação(ões) do núcleo conferida(s)` : `${ausentes.length} ausência(s) conferida(s)`;
      console.log(`✓ ${rotulo}  [${dir}${dir === 'alinhado' ? '' : ' · ' + prova}]`);
    }
  }

  if (!comRessalva) { console.log('(nenhum extrato tem `conflito` — nada a conferir)'); return; }

  if (reprovados) {
    console.error(`\n✗ ${reprovados} de ${comRessalva} ressalva(s) não descrevem o núcleo de hoje.`);
    console.error('Ressalva velha é pior que ressalva ausente: chega com autoridade de aviso de');
    console.error('segurança e manda desconfiar exatamente do que acabou de ser corrigido.');
    process.exit(1);
  }
  console.log(`\n✓ ${comRessalva} ressalva(s) conferidas contra o núcleo de hoje.`);
}

main();
