// Repescagem de acesso aberto: o artigo que ganha PMC DEPOIS de entrar no mural.
//
// O defeito que este teste existe para pegar (31/07/2026): o professor apontou
// uma revisão de acesso aberto que não ganhou discussão sozinha. O tipo estava na
// lista certa; faltava o PMC. E faltava o PMC porque `articleLink()` calcula o
// link UMA VEZ, na entrada do artigo — e a editora deposita no PMC dias depois da
// publicação, enquanto o radar pega o artigo no primeiro dia em que ele aparece
// no PubMed. A resposta "não tem PMC" era verdadeira no dia da entrada e
// permanente para sempre: 146 dos 251 itens de PubMed estavam nesse estado, 44
// deles de um tipo que renderia discussão.
//
// Por isso a asserção que importa aqui não é sobre o link — é sobre a CADEIA:
// depois da repescagem, `qualifica()` de lib/discussao-auto.js tem de passar a
// dizer sim para o mesmo artigo. Repescar sem que a fila da discussão enxergue o
// resultado seria consertar no papel.
'use strict';
const fs = require('fs');
const path = require('path');
const { candidatos, aplicar, consultarPmcids, mapaDaResposta, urlDoLote, pmidDoAviso, LOTE } = require('../lib/pmc-repescagem');
const { qualifica } = require('../lib/discussao-auto');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const DOI = 'https://doi.org/10.1111/dom.71163';
const PUBMED = 'https://pubmed.ncbi.nlm.nih.gov/42533758/';
const PMC = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13395687/';
const av = (o) => Object.assign({ sourceId: 'pubmed:1', pmid: '1', tipo: 'Estudo Original', link: DOI, oa: false, at: 1 }, o);

// ---- 1. ⚠️ A CADEIA INTEIRA: repescar tem de destravar a discussão ----------
// O artigo real do relato: "Is Hypercortisolism Treatable?" (pubmed:42533758),
// Artigo de Revisão, entrou com link de DOI e oa:false.
{
  const artigo = av({ sourceId: 'pubmed:42533758', pmid: '42533758', tipo: 'Artigo de Revisão', link: DOI });
  ok('antes da repescagem o artigo do relato NÃO qualifica', qualifica(artigo) === false);
  const { avisos, alterados } = aplicar([artigo], { 42533758: 'PMC13395687' });
  ok('depois da repescagem ele QUALIFICA para discussão automática', qualifica(avisos[0]) === true,
     'link virou ' + avisos[0].link);
  ok('o link passa a apontar para o PMC', avisos[0].link === PMC, avisos[0].link);
  ok('o selo de acesso livre acompanha', avisos[0].oa === true);
  ok('a alteração é relatada', alterados.length === 1 && alterados[0].pmcid === 'PMC13395687');
}

// ---- 2. quem entra na fila da repescagem ------------------------------------
{
  const lista = [
    av({ sourceId: 'pubmed:10', pmid: '10', at: 5 }),
    av({ sourceId: 'pubmed:11', pmid: '11', link: PUBMED, at: 9 }),
    av({ sourceId: 'pubmed:12', pmid: '12', link: PMC, oa: true, at: 8 }),
    av({ sourceId: 'journalrss:Metabolism:x', pmid: undefined, link: 'https://sciencedirect.com/x', at: 7 })
  ];
  const c = candidatos(lista);
  ok('DOI e página do PubMed entram na fila', c.indexOf('10') >= 0 && c.indexOf('11') >= 0, c.join(','));
  ok('quem JÁ é acesso aberto fica de fora', c.indexOf('12') < 0, c.join(','));
  ok('item de RSS sem PMID fica de fora', c.length === 2, c.join(','));
  ok('mais NOVOS primeiro', c[0] === '11', c.join(','));
  ok('sem duplicata', candidatos([av({ pmid: '7', at: 2 }), av({ pmid: '7', at: 1 })]).length === 1);
  ok('o teto de ids é respeitado', candidatos(lista, 1).length === 1);
  ok('lista vazia não quebra', candidatos(undefined).length === 0 && candidatos([]).length === 0);
}

// ---- 3. ⚠️ LINK EDITADO À MÃO NÃO É SOBRESCRITO -----------------------------
// `articleLink()` só emite PMC, doi.org ou pubmed.ncbi.nlm.nih.gov. Qualquer
// outra coisa foi o professor que digitou no card, e a repescagem apagaria a
// edição dele — sem aviso, num campo que ele não esperaria ver mudar sozinho.
{
  const manual = av({ pmid: '20', link: 'https://www.sbem.org.br/artigo-escolhido' });
  ok('link fora do padrão do radar não entra na fila', candidatos([manual]).length === 0);
  const { avisos, alterados } = aplicar([manual], { 20: 'PMC1' });
  ok('link fora do padrão NÃO é sobrescrito', avisos[0].link === manual.link, avisos[0].link);
  ok('e nada é relatado como alterado', alterados.length === 0);
}

// ---- 4. o que o conversor responde ------------------------------------------
{
  const m = mapaDaResposta({ records: [
    { pmid: '1', pmcid: 'PMC111' },
    { pmid: '2', errmsg: 'invalid article id' },
    { pmid: '3' },
    { pmid: '4', pmcid: 'PMC444', live: 'false' },
    { pmid: '5', pmcid: 'pmc555' }
  ] });
  ok('PMID com PMC entra', m['1'] === 'PMC111');
  ok('erro do conversor é ignorado', !m['2']);
  ok('registro sem pmcid é ignorado', !m['3']);
  ok('registro retirado do PMC (live:false) é ignorado', !m['4'], 'não pode virar link quebrado no card');
  ok('pmcid minúsculo é normalizado', m['5'] === 'PMC555');
  ok('resposta vazia/torta não quebra', Object.keys(mapaDaResposta(null)).length === 0
     && Object.keys(mapaDaResposta({ status: 'error' })).length === 0);
}

// ---- 5. a chamada à NCBI: lote, identificação e fail-safe --------------------
{
  const u = urlDoLote(['1', '2']);
  ok('o conversor é chamado com idtype=pmid', /idtype=pmid/.test(u), u);
  ok('sem sufixo de versão no PMCID', /versions=no/.test(u), u);
  ok('identifica a ferramenta e o e-mail (a NCBI exige, senão throttle)',
     /tool=endodirect/.test(u) && /email=/.test(u), u);
  ok('o teto do lote é o do conversor (200)', LOTE === 200);
  ok('pmid vem do campo, com sourceId de reserva',
     pmidDoAviso({ pmid: '9' }) === '9' && pmidDoAviso({ sourceId: 'pubmed:8' }) === '8'
     && pmidDoAviso({ sourceId: 'journalrss:X:y' }) === '');
}

// ---- 6. ⚠️ FAIL-SAFE: a NCBI fora do ar NÃO pode derrubar o radar -----------
// A repescagem é um bônus dentro do `runRadar`. Se ela lançar, o mural do dia
// não é gravado — trocar um artigo antigo por nenhum artigo novo é péssimo negócio.
{
  const p = consultarPmcids(['1', '2'], { fetchJson: () => Promise.reject(new Error('NCBI fora do ar')) })
    .then((m) => { ok('falha da NCBI vira mapa vazio, sem lançar', Object.keys(m).length === 0); })
    .catch(() => { bad++; console.log('  ✗ consultarPmcids LANÇOU — derrubaria o radar do dia'); });
  const q = consultarPmcids([], { fetchJson: () => Promise.reject(new Error('não deveria chamar')) })
    .then((m) => { ok('fila vazia não chama a NCBI', Object.keys(m).length === 0); });
  const r = consultarPmcids(['1', 'abc', ''], { fetchJson: (u) => {
    ok('ids não numéricos são descartados antes da chamada', /ids=1(&|$)/.test(u), u);
    return Promise.resolve({ records: [{ pmid: '1', pmcid: 'PMC1' }] });
  } }).then((m) => { ok('mapa da resposta é devolvido', m['1'] === 'PMC1'); });
  Promise.all([p, q, r]).then(fim);
}

// ---- 7. ⚠️ A LIGAÇÃO NO runRadar: em paralelo, e aplicada ANTES de gravar ----
// Duas ordens que, se trocadas, quebram em silêncio:
//  (a) a consulta tem de COMEÇAR antes de `findRelevantArticles` — pendurada no
//      fim ela vira mais uma etapa dentro dos 60s reais do plano, que é como a
//      geração automática ficou sem rodar por dois dias em 29/07;
//  (b) o `aplicar` tem de vir DEPOIS do merge e ANTES do save, sobre a lista
//      mesclada — aplicar no snapshot velho grava um estado que já é passado.
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'radar.js'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const i = src.indexOf('async function runRadar');
  const bloco = src.slice(i);
  const iConsulta = bloco.indexOf('consultarPmcids(');
  const iBusca = bloco.indexOf('findRelevantArticles(');
  const iMerge = bloco.indexOf('mergeMuralItems(');
  const iAplica = bloco.indexOf('aplicarPmc(');
  const iSave = bloco.indexOf('saveGlobalPayload(');
  ok('runRadar consulta o conversor', iConsulta > 0);
  ok('a consulta começa ANTES da busca de artigos (corre em paralelo, custo ~0)',
     iConsulta > 0 && iBusca > 0 && iConsulta < iBusca, 'consulta em ' + iConsulta + ', busca em ' + iBusca);
  ok('o resultado é aplicado DEPOIS do merge', iAplica > iMerge && iMerge > 0);
  ok('e ANTES da gravação', iAplica > 0 && iSave > 0 && iAplica < iSave);
  // ⚠️ A asserção é sobre a INTENÇÃO, não sobre a expressão literal: a cadeia
  // tem de começar na lista MESCLADA (a que vai ao banco) e nunca no snapshot
  // velho lido no início do run. Desde 01/08 a ponte RSS→PubMed entra antes,
  // então o `aplicarPmc` recebe a saída dela — o que continua sendo a lista
  // mesclada, só que já com os pmids resolvidos.
  ok('a cadeia começa na lista MESCLADA',
     /aplicarTitulos\(\s*merged\.payload\.radar_avisos/.test(bloco)
     || /aplicarPmc\(\s*merged\.payload\.radar_avisos/.test(bloco));
  ok('nunca aplica sobre o snapshot velho',
     !/aplicar(Pmc|Titulos)\(\s*(latestPayload|payload)\.radar_avisos/.test(bloco),
     'payload/latestPayload sao anteriores ao merge');
  ok('a promessa nasce com .catch (senão vira unhandled rejection)',
     /consultarPmcids\([^)]*\)[\s\S]{0,40}\.catch\(/.test(bloco));
  ok('reusa o fetch paceado do radar (o limite da NCBI é por IP)',
     /consultarPmcids\([\s\S]{0,120}?\{\s*fetchJson\s*\}/.test(bloco));
  ok('o resultado é relatado a quem chamou', /openAccessRepescados/.test(bloco));
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  ok('o botão "Atualizar radar" diz quantos viraram acesso livre',
     /openAccessRepescados/.test(html), 'etapa silenciosa vira "o recurso está quebrado"');
}

function fim() {
  if (bad) { console.error('\n' + bad + ' verificação(ões) da repescagem de acesso aberto falharam.'); process.exit(1); }
  console.log('Repescagem de acesso aberto: OK');
}
