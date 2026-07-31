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

// ---- 4b. ⚠️ ITÁLICO COM UNDERSCORE ------------------------------------------
// O professor viu `_D_` escrito na tela (30/07), no cabeçalho de uma league
// table de metanálise em rede. O JATS traz os códigos dos tratamentos em
// itálico; a IA reproduziu com underscore, a única marca de ênfase que este
// renderizador não conhecia.
//
// ⚠️ O QUE ESTE BLOCO TRAVA JUNTO: `__x__` é SUBLINHADO nesta plataforma (marca
// do editor WYSIWYG), não itálico duplo. Se a regra do underscore simples rodar
// antes, ela come a marca dupla e o sublinhado do professor vira itálico. E
// identificador com underscore no meio de palavra não pode virar ênfase.
ok('_itálico_ é interpretado', /<em>D<\/em>/.test(R('cabeçalho _D_ aqui')), R('cabeçalho _D_ aqui'));
ok('_itálico_ não deixa underscore visível', R('cabeçalho _D_ aqui').indexOf('_D_') < 0);
ok('na célula da tabela também', ctx.muralTextHTML('| _D_ | _A_ |\n|---|---|\n| D | 57,02 |').indexOf('<em>D</em>') > 0,
   ctx.muralTextHTML('| _D_ | _A_ |\n|---|---|\n| D | 57,02 |'));
ok('__sublinhado__ continua sublinhado', /<u>x<\/u>/.test(R('marca __x__ aqui')), R('marca __x__ aqui'));
ok('identificador com underscore no meio fica intacto',
   R('a chave user_profile e o gene SLC38A1_v2').indexOf('<em>') < 0, R('a chave user_profile e o gene SLC38A1_v2'));
ok('underscore solto não vira ênfase', R('faixa de 5 _ 10 mg').indexOf('<em>') < 0);

// ---- 5. o rodapé de origem da discussão, que vem depois de uma régua --------
const rodape = R('Fim da discussão.\n\n---\n\n*Discussão elaborada sobre o texto integral (PMC 123).*');
ok('rodapé: régua + texto, sem "---" visível', rodape.indexOf('mural-hr') >= 0 && rodape.indexOf('>---<') < 0);
ok('rodapé mantém o texto da origem', rodape.indexOf('PMC 123') >= 0);

// ---- 6. ⚠️ PRÉVIA DA DISCUSSÃO NO CARD --------------------------------------
// Pedido do professor (29/07): ele colou o card que quer — as duas linhas de
// cabeçalho e, em seguida, "Pergunta e contexto" e "Métodos" à vista; "o resto
// aparece quando clicar no maximizar". O que ele NÃO colou foi o resumo de
// quatro linhas do radar, que a discussão cobre por extenso.
//
// Dois defeitos que este bloco existe para pegar:
//  1. cortar o resumo de artigo SEM discussão — o card ficaria só com duas
//     linhas de cabeçalho e nada de conteúdo;
//  2. cortar as linhas de identificação (data, tipo de estudo) junto com o
//     resumo: elas não são repetição, e a discussão não as traz.
{
  vm.runInContext([
    'var muralDiscIds={}, muralDiscPrev={};',
    'function isFormalMuralType(){return false;}',
    'function muralDisplayType(a){return (a&&a.tipo)||"";}',
    SRC.slice(SRC.indexOf('var MURAL_ROTULOS_COBERTOS_PELA_DISCUSSAO='), SRC.indexOf('\nfunction muralTemFullText(')),
    trecho('muralDiscussaoHTML')
  ].join('\n'), ctx);

  const TXT = '📅 Data de publicação: 2026\n🔬 Tipo de estudo: Revisão narrativa\n'
    + '📝 Resumo: Esta revisão narrativa sintetiza evidências.\n'
    + '💡 Por que importa na prática: modula a resposta.\n'
    + '⚠️ Cautela/limitação: confirmar critérios.';
  const art = { sourceId: 'pubmed:1', texto: TXT, tipo: 'Artigo de Revisão' };

  // Sem discussão: nada muda.
  ctx.muralDiscIds = {}; ctx.muralDiscPrev = {};
  const semDisc = ctx.muralBodyText(art);
  ok('sem discussão, o resumo do radar FICA', semDisc.indexOf('📝 Resumo:') > 0);
  ok('sem discussão, não há prévia nem bloco', ctx.muralDiscussaoHTML(art) === '');

  // Com discussão, mas sem prévia (RPC legado): o resumo fica, e o bloco existe.
  ctx.muralDiscIds = { 'pubmed:1': 1 }; ctx.muralDiscPrev = {};
  ok('sem prévia, o resumo do radar FICA', ctx.muralBodyText(art).indexOf('📝 Resumo:') > 0);
  const soBotao = ctx.muralDiscussaoHTML(art);
  ok('sem prévia, ainda há o bloco recolhido', soBotao.indexOf('<details') === 0 || soBotao.indexOf('<details') > 0);
  ok('sem prévia, nenhum bloco de prévia', soBotao.indexOf('data-disc-previa') < 0);

  // Com prévia: o resumo sai, o cabeçalho fica.
  ctx.muralDiscPrev = { 'pubmed:1': '## Pergunta e contexto\n\nOs agonistas reduzem HbA1c.\n## Métodos\n\nRevisão narrativa.' };
  const corpo = ctx.muralBodyText(art);
  ok('com prévia, o resumo do radar SAI', corpo.indexOf('📝 Resumo:') < 0, corpo);
  ok('com prévia, "Por que importa" SAI', corpo.indexOf('💡 Por que importa') < 0);
  ok('com prévia, "Cautela" SAI', corpo.indexOf('⚠️ Cautela') < 0);
  ok('com prévia, a data FICA', corpo.indexOf('Data de publicação: 2026') > 0);
  ok('com prévia, o tipo de estudo FICA', corpo.indexOf('Tipo de estudo: Revisão narrativa') > 0);

  const html = ctx.muralDiscussaoHTML(art);
  ok('a prévia é renderizada fora do <details>', html.indexOf('data-disc-previa') < html.indexOf('<details'));
  ok('a prévia traz as duas seções', html.indexOf('Pergunta e contexto') > 0 && html.indexOf('Métodos') > 0);
  ok('a prévia é markdown renderizado, não texto cru', html.indexOf('>## ') < 0 && /<div class="mural-h"/.test(html));
  ok('o controle continua existindo', /<summary>.*Ver a discussão completa/.test(html), html.slice(0, 200));
  ok('o corpo lazy continua lá', html.indexOf('data-disc-body') > 0);

  // Texto que é SÓ resumo (sem cabeçalho) não pode virar card vazio.
  const soResumo = { sourceId: 'pubmed:1', texto: '📝 Resumo: só isto.', tipo: 'Artigo de Revisão' };
  ok('texto sem cabeçalho não vira card vazio', ctx.muralBodyText(soResumo).indexOf('só isto') > 0);
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ mural: régua horizontal, tabela e lista intactas, prévia da discussão no lugar do resumo repetido');
process.exit(bad ? 1 : 0);
