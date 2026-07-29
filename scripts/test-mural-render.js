// Renderização do corpo do card do Mural (muralTextHTML), com as funções
// RECORTADAS do index.html de verdade — cópia diverge com o tempo.
//
// O defeito que este teste existe para pegar: a discussão completa do artigo
// separa as seções com `---`, e o rodapé de origem vem depois de uma. O
// renderizador não tinha caso para régua horizontal, então a linha caía no
// parágrafo comum e o ALUNO VIA "---" escrito na tela. Foi o que o professor
// viu em 28/07 ("ficou esquisito assim"), no primeiro artigo com discussão.
//
// Cuidado que o teste trava junto: o separador de TABELA em markdown também é
// uma linha de tracinhos. Ele exige "|" e é tratado antes — se alguém "melhorar"
// a regra da régua e ela passar a engolir o separador da tabela, as tabelas do
// artigo (que são o ponto da discussão) somem.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Recorta uma função pelo nome, até a próxima declaração no nível zero.
function trecho(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) { console.log('  ✗ não achei function ' + nome); bad++; return ''; }
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j < 0 ? undefined : j);
}
const iCores = SRC.indexOf('var WYS_CORES=[');
const fCores = SRC.indexOf('\n', SRC.indexOf('var WYS_CORES_RE='));

const ctx = { console };
vm.createContext(ctx);
vm.runInContext([
  SRC.slice(iCores, fCores),
  trecho('esc'), trecho('mdSplitRow'), trecho('wysAlignRead'),
  trecho('mdInline'), trecho('muralInlineHTML'), trecho('muralTextHTML')
].join('\n'), ctx);

const R = (txt) => ctx.muralTextHTML(txt);

// ---- 1. régua horizontal ----------------------------------------------------
ok('--- vira <hr>, não parágrafo', R('Antes\n\n---\n\nDepois').indexOf('mural-hr') >= 0, R('Antes\n\n---\n\nDepois'));
ok('--- não sobra como texto', R('Antes\n\n---\n\nDepois').indexOf('>---<') < 0);
ok('*** também vira régua', R('a\n\n***\n\nb').indexOf('mural-hr') >= 0);
ok('___ também vira régua', R('a\n\n___\n\nb').indexOf('mural-hr') >= 0);
ok('traços com espaço entre eles', R('a\n\n- - -\n\nb').indexOf('mural-hr') >= 0);

// ---- 2. o que NÃO pode virar régua -----------------------------------------
ok('item de lista "- texto" continua lista', /<ul class="mural-ul">/.test(R('- primeiro\n- segundo')));
ok('dois traços não bastam', R('a\n\n--\n\nb').indexOf('mural-hr') < 0);
ok('traço solto no meio da frase não vira régua', R('doses de 5 --- 10 mg').indexOf('mural-hr') < 0);

// ---- 3. ⚠️ a TABELA do artigo tem de sobreviver -----------------------------
const tab = R('| Desfecho | Valor |\n|---|---|\n| Fratura vertebral | 6,2% |');
ok('tabela ainda renderiza', /<table class="mural-table">/.test(tab), tab.slice(0, 120));
ok('separador da tabela não virou régua', tab.indexOf('mural-hr') < 0);
ok('conteúdo da tabela preservado', tab.indexOf('6,2%') >= 0);

// ---- 4. o resto do formato da discussão continua de pé ----------------------
ok('## vira título de seção', /<div class="mural-h"/.test(R('## Achados')));
ok('parágrafo comum vira <p>', /<p class="mural-p"/.test(R('Texto simples.')));
ok('**negrito** é interpretado', /<(b|strong)>/.test(R('valor **6,2%** aqui')));

// ---- 5. o rodapé de origem da discussão, que vem depois de uma régua --------
const rodape = R('Fim da discussão.\n\n---\n\n*Discussão elaborada sobre o texto integral (PMC 123).*');
ok('rodapé: régua + texto, sem "---" visível', rodape.indexOf('mural-hr') >= 0 && rodape.indexOf('>---<') < 0);
ok('rodapé mantém o texto da origem', rodape.indexOf('PMC 123') >= 0);

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ mural: régua horizontal renderizada, tabela e lista intactas');
process.exit(bad ? 1 : 0);
