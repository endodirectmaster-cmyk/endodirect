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
  trecho('esc'), trecho('mdSplitRow'), trecho('wysAlignRead'), trecho('safeHttpUrl'),
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
  // ⚠️ AQUI HAVIA UM STUB — `function isFormalMuralType(){return false;}` — e ele
  // é a razão de este arquivo ter passado verde enquanto o professor via o card
  // errado. As asserções abaixo dizem "o emoji FICA"; o stub desligava exatamente
  // o código que o tirava (`formalizeMuralText`, removido em 02/08). O teste
  // media um caminho que a tela não usava. Mesma família do `window[fn]` de 31/07:
  // sonda errada é pior que teste nenhum, porque compra confiança.
  // Sem stub: o que roda aqui é o que roda no navegador.
  vm.runInContext([
    'var muralDiscIds={}, muralDiscPrev={};',
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

  // ---- ⚠️ OS EMOJIS CHEGAM À TELA ("sumiram os emojis", 02/08/2026) ----------
  // Até 02/08 os tipos "formais" passavam por uma limpeza que arrancava o símbolo
  // inicial de cada linha. Dois estragos: (a) comia o emoji que o PROFESSOR
  // escolhe no seletor do editor, nos tipos que ele escreve à mão; (b) depois da
  // renomeação do rótulo, deixava a linha pela metade — sem a lâmpada, com o
  // rótulo nu ("Na prática: …"), diferente do mesmo card num tipo não-formal.
  ctx.muralDiscIds = {}; ctx.muralDiscPrev = {};
  const NOVO = '📅 Data de publicação: 2026\n🔬 Tipo de estudo: Revisão narrativa\n'
    + '📝 Resumo: Esta revisão sintetiza evidências.\n'
    + '💡 Na prática: o fenótipo ficou mais heterogêneo.\n'
    + '⚠️ Cautela/limitação: sujeita a viés de seleção.';
  // Todo tipo formal de antes — é neles que a limpeza agia.
  ['Artigo de Revisão', 'Comunicado', 'Diretriz', 'Consenso', 'Discussão Clínica'].forEach(function (tipo) {
    const c = ctx.muralBodyText({ sourceId: 'pubmed:9', texto: NOVO, tipo: tipo });
    ok('💡 sobrevive em "' + tipo + '"', c.indexOf('💡 Na prática:') > 0, c.split('\n')[3]);
    ok('⚠️ sobrevive em "' + tipo + '"', c.indexOf('⚠️ Cautela') > 0);
    ok('📝 sobrevive em "' + tipo + '"', c.indexOf('📝 Resumo:') > 0);
    ok('nunca sai o rótulo NU, sem o emoji, em "' + tipo + '"', !/(^|\n)Na prática:/.test(c),
       'era o que o professor via no card: a lâmpada some e o rótulo fica');
  });
  // Emoji escolhido à mão no seletor do editor (MURAL_EMOJIS) — o caso silencioso.
  const aviso = { sourceId: '', texto: '🚨 Prova na sexta.\n✅ Inscrições abertas.', tipo: 'Comunicado' };
  ok('emoji digitado pelo professor no aviso chega à tela',
     ctx.muralBodyText(aviso).indexOf('🚨 Prova na sexta.') === 0
     && ctx.muralBodyText(aviso).indexOf('✅ Inscrições') > 0,
     ctx.muralBodyText(aviso));
}

// ---- ⚠️ LINHA DE AGRUPAMENTO COM CÉLULAS VAZIAS (02/08/2026, "ficou estranho")
// Tabela de características de base tem linhas que só agrupam seções — uma
// célula preenchida, o resto vazio. O `isRow` original filtrava as vazias e
// exigia DUAS com conteúdo, então o laço do corpo PARAVA na primeira dessas: as
// 4 primeiras linhas viravam tabela e as outras 30 vazavam como markdown cru na
// tela do aluno. Célula vazia é markdown válido e é como o JATS agrupa seções.
{
  const tab = [
    '| Characteristic | Total | Placebo | Mg-oxide | p |',
    '| --- | --- | --- | --- | --- |',
    '| Females | 131 (53.04) | 72 (55.81) | 59 (50.00) | 0.360 |',
    '| **DM history and complication** | | | | |',
    '| Duration of DM | 16 (10-22) | 16 (10-21) | 18 (10-23) | 0.597 |',
    '| **Laboratory data** | | | | |',
    '| LDL | 2.2 | 2.4 | 2.2 | 0.280 |'
  ].join('\n');
  const h = ctx.muralTextHTML(tab);
  const linhas = (h.match(/<tr>/g) || []).length;
  ok('a tabela inteira vira UMA tabela (1 cabecalho + 5 do corpo, nao 2)', linhas === 6, linhas + ' <tr>');
  ok('a linha de agrupamento vira linha da tabela', h.indexOf('DM history and complication') > 0);
  ok('nada de markdown cru sobrando na tela', h.indexOf('| Duration of DM') < 0 && h.indexOf('| LDL') < 0,
     'era isto que o aluno via: dezenas de linhas de pipes');
  ok('as linhas depois do agrupamento continuam na tabela', h.indexOf('Duration of DM') > 0 && h.indexOf('LDL') > 0);
  ok('a celula vazia vira <td> vazio, mantendo o alinhamento das colunas',
     (h.match(/<td[^>]*><\/td>/g) || []).length >= 8);
  const prosa = ctx.muralTextHTML('O custo | beneficio foi discutido.\nOutra linha.');
  ok('prosa com uma barra NAO vira tabela', prosa.indexOf('<table') < 0, prosa.slice(0, 120));
}

// ---- TABELA LONGA RECOLHIDA AO CLIQUE (pedido do professor, 02/08/2026) ------
// "Ampliável ao clique para não ficar muito extensa a discussão": o escore de
// Popoveniuc do consenso de coma mixedematoso tem 30 linhas e ocupava duas telas
// NO MEIO do texto. O que este bloco trava é o par: recolher as longas SEM
// recolher as curtas (trocar três linhas de dado por um clique não economiza
// rolagem) e sem perder nenhuma linha dentro do <details>.
{
  const linhasDe = (n) => {
    const l = ['| Marcador | Pontos |', '| --- | --- |'];
    for (let k = 1; k <= n; k++) l.push('| Item ' + k + ' | ' + (k * 5) + ' |');
    return l.join('\n');
  };
  const LIM = /var MURAL_TABELA_LINHAS_INLINE=(\d+)/.exec(SRC);
  ok('o limite está declarado no index.html', !!LIM);
  const lim = LIM ? +LIM[1] : 0;
  ok('o limite é de poucas linhas, não de dezenas', lim >= 4 && lim <= 15, String(lim));

  const curta = ctx.muralTextHTML(linhasDe(lim));
  ok('tabela curta continua ABERTA, sem clique', curta.indexOf('<details') < 0, curta.slice(0, 120));
  ok('tabela curta continua sendo uma tabela', /<table class="mural-table">/.test(curta));

  const longa = ctx.muralTextHTML(linhasDe(lim + 1));
  ok('uma linha acima do limite já recolhe', /<details class="mural-tab">/.test(longa), longa.slice(0, 160));
  ok('o controle diz quantas linhas estão escondidas',
     longa.indexOf('Ver a tabela (' + (lim + 1) + ' linhas)') > 0, longa.slice(0, 220));

  // ⚠️ ASSERÇÃO ABSOLUTA, não derivada da constante. As duas de cima calculam a
  // entrada a partir de `lim`, então continuariam verdes com lim=999 — mediriam a
  // coerência do código consigo mesmo, não o que o professor pediu. O caso real é
  // este: a tabela do escore de Popoveniuc tem 30 linhas e TEM de vir dobrada.
  const trinta = ctx.muralTextHTML(linhasDe(30));
  ok('⚠️ a tabela de 30 linhas do consenso vem RECOLHIDA', /<details class="mural-tab">/.test(trinta),
     'é a tabela que ocupava duas telas no meio da discussão');
  // ⚠️ Recolher não pode PERDER linha: o <details> é dobra, não corte.
  ok('a tabela de 30 linhas tem as 30 dentro do <details>', (trinta.match(/<tr>/g) || []).length === 31,
     (trinta.match(/<tr>/g) || []).length + ' <tr> (esperado 31 = 1 cabeçalho + 30)');
  ok('a última linha continua lá', trinta.indexOf('Item 30') > 0);
  ok('a tabela fica DENTRO do details', trinta.indexOf('<details') < trinta.indexOf('<table'));
  ok('o details fecha depois da tabela', trinta.indexOf('</table>') < trinta.indexOf('</details>'));
  ok('nada de markdown cru vazando', trinta.indexOf('| Item 30') < 0);

  // A legenda fica FORA, à vista: o aluno precisa saber o que está dobrado.
  const comLegenda = ctx.muralTextHTML('**Tabela 1. Escore de Popoveniuc.**\n\n' + linhasDe(30));
  ok('a legenda fica fora do details', comLegenda.indexOf('Escore de Popoveniuc') < comLegenda.indexOf('<details'),
     'dobrar a legenda junto esconderia o que a tabela é');
}

// ---- FIGURA DO ARTIGO: imagem inline + clique para ampliar ------------------
// 02/08/2026, "colocar a figura 1 original do artigo": a discussão do consenso do
// ETJ (CC BY 4.0, reprodução permitida com atribuição) descrevia a Figura 1 em
// prosa. O renderizador já sabia converter ![alt](url); o que este bloco trava é
// que ela saia com a classe que o LIGHTBOX escuta — sem ela a imagem aparece mas
// não amplia, e num algoritmo de tratamento em letra miúda isso é o mesmo que não
// ter figura.
{
  const url = 'https://endodirect.com.br/figuras/etj-26-0044-fig1.png';
  const h = ctx.muralTextHTML('![Figura 1 — algoritmo](' + url + ')\n\n*Figura 1. Algoritmo. Reproduzida do artigo (European Thyroid Journal, licença CC BY 4.0).*');
  ok('a figura vira <img>', h.indexOf('<img') >= 0, h.slice(0, 160));
  ok('com a classe que o lightbox escuta', h.indexOf('class="mural-inline-img"') > 0,
     'sem mural-inline-img o clique não amplia (ensureMuralLightbox)');
  ok('apontando para o arquivo do repo', h.indexOf('src="' + url + '"') > 0);
  ok('o texto alternativo é preservado', h.indexOf('alt="Figura 1 — algoritmo"') > 0);
  ok('a atribuição CC BY fica visível ao lado', h.indexOf('CC BY 4.0') > 0);
  ok('o markdown da imagem não sobra como texto', h.indexOf('![Figura') < 0);
  // O arquivo tem de existir no repo, senão o card mostra um vão (onerror remove).
  const fig = path.join(__dirname, '..', 'figuras', 'etj-26-0044-fig1.png');
  ok('o PNG da Figura 1 está no repo', fs.existsSync(fig), fig);
  if (fs.existsSync(fig)) {
    const kb = fs.statSync(fig).size / 1024;
    ok('e num tamanho que carrega no celular', kb < 600, Math.round(kb) + ' KB');
  }
}

console.log(bad ? '\nFALHOU: ' + bad : '\n✓ mural: régua horizontal, tabela e lista intactas, prévia da discussão no lugar do resumo repetido');
process.exit(bad ? 1 : 0);
