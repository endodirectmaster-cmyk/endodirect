// Ponte RSS → PubMed: achar o PMID pelo TÍTULO para o item que entrou por RSS.
//
// O BURACO QUE ISTO FECHA (2026-08-01): a repescagem de 31/07 só olhava item do
// PubMed, porque só ele tem PMID. Só que quase um terço do mural vem por RSS de
// revista, e esses itens entram com o link da EDITORA e SEM PMID — logo
// `pmcIdFromLink` é vazio, `qualifica()` é falso, e a repescagem nem os
// considerava. Medido: 97 itens de RSS, ZERO com PMC, ZERO com PMID, 23 deles de
// um tipo que renderia discussão. Travados não por falta de texto aberto, mas
// por falta de caminho até ele — foi assim que o consenso de coma mixedematoso
// (European Thyroid Journal, revista inteiramente aberta) ficou sem discussão.
//
// ⚠️ O DEFEITO QUE ESTE TESTE MAIS EXISTE PARA PEGAR É O CASAMENTO ERRADO.
// Busca por título no PubMed devolve PARECIDOS. Aceitar um parecido não deixa o
// card como estava: REESCREVE o link para outro artigo, e o aluno leria a
// discussão de um estudo diferente do que o card anuncia. Errar aqui é pior que
// não fazer nada — por isso a exigência é igualdade EXATA do título normalizado.
'use strict';
const {
  candidatosSemPmid, resolverPmidsPorTitulo, aplicarTitulos, normTitulo,
  urlEsearch, pmcidDoResumo, LOTE_TITULO, REPETIR_BUSCA_APOS_MS
} = require('../lib/pmc-repescagem');
const { qualifica } = require('../lib/discussao-auto');
const fs = require('fs');
const path = require('path');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const AGORA = 1785600000000;
const DIA = 86400000;
const TITULO = 'Management of endocrine emergencies: joint consensus statement for management of myxoedema coma';
const rss = (o) => Object.assign({ sourceId: 'journalrss:ETJ:x', titulo: TITULO, tipo: 'Diretriz',
                                   link: 'https://journals.bioscientifica.com/etj/a', oa: false, at: AGORA }, o);

// ---- 1. quem entra na fila da ponte ----------------------------------------
{
  const lista = [
    rss({ sourceId: 'journalrss:A', at: AGORA - 1000 }),
    rss({ sourceId: 'pubmed:1', pmid: '1' }),                       // já tem PMID
    rss({ sourceId: 'journalrss:B', oa: true }),                    // já é aberto
    rss({ sourceId: 'journalrss:C', titulo: '' }),                  // sem título: nada a buscar
    rss({ sourceId: 'journalrss:D', pmidTent: AGORA - DIA }),       // procurado ontem
    rss({ sourceId: 'journalrss:E', pmidTent: AGORA - 10 * DIA })   // procurado há 10 dias
  ];
  const ids = candidatosSemPmid(lista, { agora: AGORA }).map((x) => x.sourceId);
  ok('item de RSS sem PMID entra', ids.indexOf('journalrss:A') >= 0, ids.join(','));
  ok('quem já tem PMID não entra', ids.indexOf('pubmed:1') < 0, ids.join(','));
  ok('quem já é acesso aberto não entra', ids.indexOf('journalrss:B') < 0, ids.join(','));
  ok('sem título não entra', ids.indexOf('journalrss:C') < 0, ids.join(','));
  // ⚠️ Sem a marca de tentativa, os 97 sem PMID seriam reperguntados TODO DIA.
  ok('procurado ontem NÃO é reperguntado', ids.indexOf('journalrss:D') < 0, ids.join(','));
  ok('procurado há 10 dias É reperguntado (artigo pode ter sido indexado depois)',
     ids.indexOf('journalrss:E') >= 0, ids.join(','));
  ok('a janela de reteste é de dias, não de horas', REPETIR_BUSCA_APOS_MS >= 3 * DIA);
  ok('o lote por execução é pequeno (2 chamadas por item)', LOTE_TITULO > 0 && LOTE_TITULO <= 20, String(LOTE_TITULO));
  ok('o teto do lote é respeitado', candidatosSemPmid(lista, { agora: AGORA, limite: 1 }).length === 1);
  ok('mais NOVOS primeiro', candidatosSemPmid(lista, { agora: AGORA })[0].sourceId !== 'journalrss:A');
}

// ---- 2. ⚠️ A GUARDA DE TÍTULO ----------------------------------------------
{
  const mockar = (recTitulo, comPmc) => ({
    fetchJson: async (u) => {
      if (u.indexOf('esearch') >= 0) return { esearchresult: { idlist: ['4242'] } };
      return { result: { 4242: {
        title: recTitulo,
        articleids: comPmc ? [{ idtype: 'pmc', value: 'PMC12345' }] : [{ idtype: 'doi', value: '10.1/x' }]
      } } };
    }
  });
  const um = async (recTitulo, comPmc) =>
    (await resolverPmidsPorTitulo([rss({})], mockar(recTitulo, comPmc)))['journalrss:ETJ:x'];

  return Promise.resolve()
    .then(async () => {
      let r = await um(TITULO, true);
      ok('título idêntico casa', r && r.pmid === '4242' && r.pmcid === 'PMC12345');
      r = await um(TITULO.toUpperCase().replace(/:/g, ' '), true);
      ok('difere só em caixa/pontuação: casa', r && r.pmid === '4242');
      // Os perigosos: parecidos que NÃO são o mesmo artigo.
      r = await um('Management of endocrine emergencies: joint consensus statement for management of thyroid storm', true);
      ok('⚠️ outro artigo da MESMA série (thyroid storm) NÃO casa', r === null,
         'casar aqui reescreveria o link do card para outro estudo');
      r = await um(TITULO + ': a systematic review', true);
      ok('⚠️ título com sufixo a mais NÃO casa', r === null);
      r = await um('Management of endocrine emergencies', true);
      ok('⚠️ título truncado NÃO casa', r === null);
      r = await um(TITULO, false);
      ok('casa sem PMC: devolve só o pmid', r && r.pmid === '4242' && !r.pmcid,
         'o idconv cuida dele nos dias seguintes');
      // rede fora do ar / resposta torta não pode derrubar o radar
      const semRede = await resolverPmidsPorTitulo([rss({})], { fetchJson: () => Promise.reject(new Error('NCBI fora')) });
      ok('falha de rede vira null, sem lançar', semRede['journalrss:ETJ:x'] === null);
      const vazio = await resolverPmidsPorTitulo([rss({})], { fetchJson: async () => ({ esearchresult: { idlist: [] } }) });
      ok('busca sem resultado vira null', vazio['journalrss:ETJ:x'] === null);
    })
    .then(resto)
    .then(fim);
}

function resto() {
  // ---- 3. o que aplicarTitulos grava ---------------------------------------
  {
    const lista = [rss({ sourceId: 'a' }), rss({ sourceId: 'b' }), rss({ sourceId: 'c' })];
    const { avisos, resolvidos } = aplicarTitulos(lista, {
      a: { pmid: '111', pmcid: 'PMC9' },   // casou e já está no PMC
      b: { pmid: '222', pmcid: '' },       // casou, sem PMC ainda
      c: null                              // procurado, não achou
    }, AGORA);
    ok('casou com PMC: link vira PMC e oa:true', avisos[0].link.indexOf('/pmc/articles/PMC9/') > 0 && avisos[0].oa === true);
    ok('casou com PMC: o pmid fica gravado (custo de uma vez, não por dia)', avisos[0].pmid === '111');
    ok('casou sem PMC: grava o pmid e NÃO mexe no link', avisos[1].pmid === '222'
       && avisos[1].link.indexOf('bioscientifica') > 0 && avisos[1].oa === false);
    ok('não achou: marca a tentativa e não inventa pmid', avisos[2].pmidTent === AGORA && avisos[2].pmid === undefined);
    ok('só os que casaram são relatados', resolvidos.length === 2);
    ok('item fora do mapa não é tocado', aplicarTitulos([rss({ sourceId: 'z' })], {}, AGORA).avisos[0].pmidTent === undefined);
  }

  // ---- 4. ⚠️ A CADEIA: a ponte destrava a discussão -------------------------
  {
    const artigo = rss({});
    ok('antes da ponte o consenso do ETJ NÃO qualifica', qualifica(artigo) === false);
    const { avisos } = aplicarTitulos([artigo], { 'journalrss:ETJ:x': { pmid: '999', pmcid: 'PMC77' } }, AGORA);
    ok('depois da ponte ele QUALIFICA para discussão automática', qualifica(avisos[0]) === true,
       'é o que o professor pediu: revista aberta, discussão gerada');
  }

  // ---- 5. a ligação no runRadar --------------------------------------------
  {
    const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'radar.js'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
    const bloco = src.slice(src.indexOf('async function runRadar'));
    const iBusca = bloco.indexOf('resolverPmidsPorTitulo(');
    const iArtigos = bloco.indexOf('findRelevantArticles(');
    const iPonte = bloco.indexOf('aplicarTitulos(');
    const iPmc = bloco.indexOf('aplicarPmc(');
    const iSave = bloco.indexOf('saveGlobalPayload(');
    ok('runRadar usa a ponte', iBusca > 0 && iPonte > 0);
    ok('a busca começa ANTES de findRelevantArticles (corre em paralelo)', iBusca < iArtigos, iBusca + ' vs ' + iArtigos);
    // ⚠️ A ponte GRAVA o pmid; é ele que faz o item existir para o aplicarPmc.
    // Invertido, o artigo resolvido hoje só seria repescado amanhã.
    ok('aplicarTitulos vem ANTES de aplicarPmc', iPonte < iPmc, iPonte + ' vs ' + iPmc);
    ok('e tudo antes da gravação', iPmc < iSave);
    ok('a promessa nasce com .catch', /resolverPmidsPorTitulo\([\s\S]{0,160}?\.catch\(/.test(bloco));
    ok('reusa o fetch paceado do radar', /resolverPmidsPorTitulo\([\s\S]{0,120}?\{\s*fetchJson\s*\}/.test(bloco));
  }
}

function fim() {
  if (bad) { console.error('\n' + bad + ' verificação(ões) da ponte RSS→PubMed falharam.'); process.exit(1); }
  console.log('Ponte RSS → PubMed: OK');
}
