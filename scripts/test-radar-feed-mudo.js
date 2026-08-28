// Regressão do RADAR DE NOTÍCIAS: feed oficial mudo tem de FALAR.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (28/08/2026). O professor mandou o print da
// aprovação do FDA para o Mounjaro (tirzepatida) reduzir risco cardiovascular no
// diabetes tipo 2 e disse: "não pegou essa info no mural".
//
// 🧨 O DEFEITO NÃO ERA O FILTRO — ERA O SILÊNCIO. `fetchFeed` nunca lança, de
// propósito: feed fora do ar não pode derrubar o radar. Só que ele também não
// AVISA. Medido no acervo antes do conserto: **ZERO item da Lilly em 1.019**,
// com o feed oficial na lista desde sempre, enquanto o feed oficial do FDA
// entregava. Um feed morto degradava em silêncio pelo acervo inteiro, e quem
// descobriu foi o professor, lendo a notícia na fonte.
//
// Fail-safe é para NÃO DERRUBAR, não para não contar. Este teste guarda as duas
// pontas: a notícia do professor tem de atravessar o pipeline, e o feed que não
// entrega tem de sair no relatório que o cron transforma em alerta.
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const LILLY = 'https://investor.lilly.com/rss/news-releases.xml';
// A manchete e a linha de apoio são as do comunicado que o professor mostrou.
const ITEM_REAL = `<item>
  <title>FDA approves Lilly's Mounjaro (tirzepatide) to reduce cardiovascular risk in adults with type 2 diabetes</title>
  <link>https://investor.lilly.com/news-releases/news-release-details/fda-approves-lillys-mounjaro-tirzepatide-reduce-cardiovascular</link>
  <description>Mounjaro is the first and only GIP and GLP-1 receptor agonist proven to lower heart attack, stroke or cardiovascular death risk in adults with type 2 diabetes at high risk for these events</description>
  <pubDate>${new Date().toUTCString()}</pubDate>
</item>`;
const feedCom = (itens) => '<rss><channel>' + itens + '</channel></rss>';

// Troca o fetch global: cada feed responde o que o cenário mandar. Nenhuma
// chamada de rede sai daqui, e nenhuma chamada de IA (sem apiKey, `classifyNews`
// aceita pelo filtro de palavras — que é justamente o que se quer exercitar).
function comFeeds(mapa) {
  global.fetch = async (url) => {
    const r = mapa[String(url)] || mapa['*'] || { status: 200, body: feedCom('') };
    if (r.status !== 200) return { ok: false, status: r.status, text: async () => '' };
    return { ok: true, status: 200, text: async () => r.body };
  };
}
// `require` limpo a cada cenário: a saúde é estado de módulo.
function carregarNews() {
  delete require.cache[require.resolve(path.join(REPO, 'lib', 'news.js'))];
  return require(path.join(REPO, 'lib', 'news.js'));
}

(async () => {
  // ── 1. A notícia do professor atravessa o pipeline ────────────────────────
  {
    comFeeds({ [LILLY]: { status: 200, body: feedCom(ITEM_REAL) } });
    const news = carregarNews();
    const itens = await news.runNews(new Set(), '');
    const mounjaro = itens.filter((i) => /Mounjaro/i.test(i.titulo));
    ok(mounjaro.length === 1,
      '⚠️ a aprovação cardiovascular do Mounjaro NÃO atravessou o radar — é exatamente a notícia que o professor viu antes do mural em 28/08/2026');
    if (mounjaro[0]) {
      const it = mounjaro[0];
      ok(it.tipo === 'Comunicado', 'aprovação de medicamento tem de entrar como Comunicado, veio ' + it.tipo);
      ok(it.breaking === true, 'a flag `breaking` é o que põe o item no topo do mural');
      ok(it.official === true, 'item de feed oficial tem de ficar marcado como oficial');
      ok(/investor\.lilly\.com/.test(it.link), 'o link do comunicado se perdeu');
      ok(/^news:/.test(it.sourceId), 'sem `sourceId` a próxima rodada duplicaria o item');
    }
  }

  // ── 2. Feed OFICIAL que falha aparece no relatório de saúde ───────────────
  {
    comFeeds({ [LILLY]: { status: 404, body: '' } });
    const news = carregarNews();
    await news.runNews(new Set(), '');
    const saude = news.saudeDosFeeds();
    ok(saude.length === news.NEWS_FEEDS.length,
      'o relatório de saúde tem de cobrir TODOS os feeds, veio ' + saude.length + ' de ' + news.NEWS_FEEDS.length);
    const lilly = saude.find((f) => f.url === LILLY);
    ok(lilly && lilly.ok === false && lilly.status === 404,
      '⚠️ feed oficial com 404 não foi registrado como falho — é assim que o defeito volta a durar o acervo inteiro em silêncio');
    const mudos = saude.filter((f) => f.official && (!f.ok || f.itens === 0));
    ok(mudos.some((f) => f.url === LILLY), 'o feed morto tem de entrar na lista que o cron transforma em alerta');
  }

  // ── 3. Feed oficial que RESPONDE mas não entrega também é mudo ────────────
  // Este é o caso mais traiçoeiro: HTTP 200, XML válido, zero itens. Sem contar
  // itens, um feed assim passa por saudável para sempre.
  {
    comFeeds({ '*': { status: 200, body: feedCom('') } });
    const news = carregarNews();
    await news.runNews(new Set(), '');
    const lilly = news.saudeDosFeeds().find((f) => f.url === LILLY);
    ok(lilly && lilly.ok === true && lilly.itens === 0,
      '⚠️ feed que responde 200 com ZERO item tem de ser contado — é o modo de falha que passa por saudável');
  }

  // ── 4. Feed de BUSCA vazio não é alarme ───────────────────────────────────
  // Alerta que dispara por rotina ensina a ignorar alerta. Busca sem resultado
  // num dia é o normal; só os OFICIAIS entram no aviso.
  {
    comFeeds({ '*': { status: 200, body: feedCom('') } });
    const news = carregarNews();
    await news.runNews(new Set(), '');
    const mudos = news.saudeDosFeeds().filter((f) => f.official && (!f.ok || f.itens === 0));
    ok(mudos.every((f) => f.official),
      'feed de busca vazio entrou no alerta — alerta que dispara por rotina ensina a ignorar alerta');
    ok(news.saudeDosFeeds().some((f) => !f.official),
      'o relatório perdeu os feeds de busca: sem eles não dá para diagnosticar o conjunto');
  }

  // ── 4b. Os nomes da droga continuam no filtro ─────────────────────────────
  // ⚠️ Tirar `tirzepatid` do filtro NÃO derrubou o teste do item 1: a linha de
  // apoio do comunicado diz "GLP-1", que também é termo. O pipeline é robusto
  // por sobreposição — e por isso a perda de um nome de droga passaria calada
  // até chegar um comunicado que só o cite pelo nome. Cobrado por nome.
  {
    const news = carregarNews();
    const fonte = fs.readFileSync(path.join(REPO, 'lib', 'news.js'), 'utf8');
    ['tirzepatid', 'mounjaro', 'zepbound', 'semaglutid', 'orforglipron'].forEach((t) => {
      ok(fonte.indexOf("'" + t + "'") >= 0, 'o termo `' + t + '` saiu do filtro de drogas do radar');
    });
    ok(news.NEWS_FEEDS.length >= 10, 'a lista de feeds encolheu: menos rotas, mais chance de silêncio');
  }

  // ── 5. A Lilly deixou de ter rota única ───────────────────────────────────
  {
    const news = carregarNews();
    const lilly = news.NEWS_FEEDS.filter((f) => /lilly/i.test(f.nome));
    ok(lilly.length >= 2,
      '⚠️ a Lilly voltou a ter UMA rota só — foi a rota única e muda que deixou a aprovação do Mounjaro fora do mural');
    ok(lilly.some((f) => f.official) && lilly.some((f) => !f.official),
      'as duas rotas da Lilly têm de ser de naturezas diferentes (feed oficial + busca); duas iguais falham juntas');
  }

  // ── 6. A fiação: radar carrega, cron alerta ───────────────────────────────
  {
    const radar = fs.readFileSync(path.join(REPO, 'lib', 'radar.js'), 'utf8');
    ok(/saudeDosFeeds\(\)\.filter\(\(f\) => f\.official && \(!f\.ok \|\| f\.itens === 0\)\)/.test(radar),
      'o radar deixou de separar os feeds oficiais mudos');
    ok(/feedsMudos,/.test(radar),
      '⚠️ o radar parou de DEVOLVER os feeds mudos — o cron não tem como alertar sobre o que não recebe');
    const cron = fs.readFileSync(path.join(REPO, 'api', 'cron', 'endocrine-radar.js'), 'utf8');
    ok(/result\.feedsMudos.*length/s.test(cron) && /sendAlert\('Feed oficial do radar sem notícias'/.test(cron),
      '⚠️ o cron parou de alertar sobre feed oficial mudo — volta o silêncio que durou 1.019 itens');
    // ⚠️ Procurar `catch (_) {}` "depois do alerta" achava o catch de OUTRO
    // trecho e passava com o alerta desprotegido. A janela é o bloco do alerta.
    const i0 = cron.indexOf('if (result && Array.isArray(result.feedsMudos)');
    const bloco = i0 >= 0 ? cron.slice(i0, cron.indexOf('let qotd', i0)) : '';
    ok(/catch \(_\) \{\}/.test(bloco),
      'o alerta tem de ser fail-safe como os outros: falha ao avisar não pode derrubar o cron');
  }

  if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('✓ radar: a aprovação do Mounjaro atravessa o pipeline, e feed oficial mudo (404 ou 200 com zero itens) vira alerta');
})().catch((e) => { console.error('✗ erro inesperado: ' + ((e && e.stack) || e)); process.exit(1); });
