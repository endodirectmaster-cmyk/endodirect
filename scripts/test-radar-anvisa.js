// Regressão do RADAR: notícia da ANVISA sem feed próprio (04/11/2026).
//
// ⚠️ POR QUE ESTE TESTE EXISTE. O professor mandou o print de "Anvisa aprova
// primeiro medicamento de GLP-1 oral para obesidade" (gov.br, 04/11, 05h06) e
// disse: "Não capturou essa notícia. Tive que implantar manualmente."
//
// A causa: o gov.br virou página React (Volto) sem RSS. O feed oficial
// `.../assuntos/noticias/RSS` responde 404 desde 10/10, e o portal antigo nem
// resolve. O alerta de feed mudo avisou em 10/10, mas a ANVISA ficou com uma rota
// só (uma busca do Google News). O conserto:
//   1. os dois feeds mortos saem da lista (não há endereço oficial que funcione);
//   2. a ANVISA ganha três buscas, todas presas à allowlist (gov.br / "Anvisa");
//   3. o título vindo da busca ("… - Agência Nacional de Vigilância Sanitária -
//      Anvisa") é comparado sem o sufixo com o que já está no mural, para que a
//      notícia lançada à mão pelo professor não volte como card repetido.
const path = require('path');

const REPO = path.join(__dirname, '..');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function carregarNews() {
  delete require.cache[require.resolve(path.join(REPO, 'lib', 'news.js'))];
  return require(path.join(REPO, 'lib', 'news.js'));
}
const TITULO = 'Anvisa aprova primeiro medicamento de GLP-1 oral para obesidade';
const PUBLISHER = 'Agência Nacional de Vigilância Sanitária - Anvisa';
const LINK_GOV = 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2026/anvisa-aprova-primeiro-medicamento-de-glp-1-oral-para-obesidade';
const itemGN = (titulo, fonteUrl, fonteNome, link) => `<item>
  <title>${titulo} - ${fonteNome}</title>
  <link>${link}</link>
  <description>Produto é indicado para tratamento de perda e manutenção do peso em adultos</description>
  <pubDate>${new Date(Date.now() - 3 * 3600 * 1000).toUTCString()}</pubDate>
  <source url="${fonteUrl}">${fonteNome}</source>
</item>`;
const rss = (itens) => '<rss><channel>' + itens + '</channel></rss>';
function comFeeds(mapa) {
  global.fetch = async (url) => {
    const corpo = mapa[String(url)];
    return { ok: true, status: 200, text: async () => rss(corpo || '') };
  };
}

(async () => {
  const news = carregarNews();
  const feeds = news.NEWS_FEEDS;

  // ── 1. Lista de feeds ─────────────────────────────────────────────────────
  ok(!feeds.some((f) => /gov\.br\/anvisa\/.*\/RSS/i.test(f.url)), 'o feed gov.br/anvisa/.../RSS (404 desde 10/10/2026) voltou para a lista');
  ok(!feeds.some((f) => /portal\.anvisa\.gov\.br/i.test(f.url)), 'o portal antigo da ANVISA (não resolve mais) voltou para a lista');
  const anvisa = feeds.filter((f) => /anvisa/i.test(f.nome));
  ok(anvisa.length >= 3, 'a ANVISA precisa de pelo menos 3 rotas de busca (tem ' + anvisa.length + ')');
  ok(anvisa.every((f) => !f.official && /news\.google\.com\/rss\/search/.test(f.url)), 'as rotas da ANVISA são buscas, não feeds oficiais: têm de passar pela allowlist');
  ok(anvisa.some((f) => /site%3Agov\.br/i.test(f.url)), 'falta a busca presa ao site gov.br');

  // ── 2. A notícia do professor atravessa o radar, uma vez só ───────────────
  const urlsAnvisa = anvisa.map((f) => f.url);
  {
    const mapa = {};
    // As três buscas trazem a mesma notícia, com links de redirecionamento diferentes.
    urlsAnvisa.forEach((u, i) => { mapa[u] = itemGN(TITULO, 'https://www.gov.br', PUBLISHER, 'https://news.google.com/rss/articles/abc' + i); });
    comFeeds(mapa);
    const n = carregarNews();
    const itens = await n.runNews(new Set(), '');
    const glp = itens.filter((i) => /GLP-1 oral/i.test(i.titulo));
    ok(glp.length === 1, 'a aprovação do GLP-1 oral pela ANVISA tem de entrar UMA vez (entraram ' + glp.length + ')');
    if (glp[0]) {
      ok(glp[0].breaking === true && glp[0].tipo === 'Comunicado', 'entra como Comunicado com a flag breaking');
      ok(n.isBreakingTrusted(glp[0]), 'origem gov.br tem de contar como confiável (push e destaque)');
    }
  }

  // ── 3. Já lançada à mão: não volta como card repetido ─────────────────────
  {
    const mapa = {};
    urlsAnvisa.forEach((u, i) => { mapa[u] = itemGN(TITULO, 'https://www.gov.br', PUBLISHER, 'https://news.google.com/rss/articles/xyz' + i); });
    comFeeds(mapa);
    const n = carregarNews();
    // Como o `existingMuralKeys` do radar monta: o card manual entra com título e link.
    const exclude = new Set([TITULO, LINK_GOV]);
    const itens = await n.runNews(exclude, '');
    ok(!itens.some((i) => /GLP-1 oral/i.test(i.titulo)), 'a notícia lançada à mão pelo professor voltou como card repetido (o título da busca tem o sufixo do veículo)');
  }

  // ── 4. Veículo fora da allowlist continua fora ────────────────────────────
  {
    const mapa = {};
    urlsAnvisa.forEach((u) => { mapa[u] = itemGN(TITULO, 'https://www.metropoles.com', 'Metrópoles', 'https://news.google.com/rss/articles/m'); });
    comFeeds(mapa);
    const n = carregarNews();
    const itens = await n.runNews(new Set(), '');
    ok(itens.length === 0, 'item de veículo fora da allowlist entrou pelas buscas da ANVISA');
  }

  // ── 5. A comparação de títulos ────────────────────────────────────────────
  ok(news.tituloComparavel(TITULO + ' - ' + PUBLISHER, true) === news.tituloComparavel(TITULO, false), 'o título da busca, sem o sufixo, tem de bater com o título limpo');
  ok(news.tituloComparavel('Ação — Nova aprovação!', false) === 'acao nova aprovacao', 'a comparação ignora acento, pontuação e caixa');

  if (falhas.length) { console.log(falhas.map((f) => '  ✗ ' + f).join('\n')); process.exit(1); }
  console.log('radar ANVISA: ok');
})().catch((e) => { console.log('  ✗ erro: ' + (e && e.stack || e)); process.exit(1); });
