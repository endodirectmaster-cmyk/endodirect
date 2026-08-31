// A LETRA DA PLATAFORMA É ESCOLHIDA, NÃO HERDADA DO SISTEMA.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (31/08/2026). O professor apontou o painel de
// referência e pediu "mudar para essa fonte aí das letras". Até aqui o token era
// `'Segoe UI', system-ui, sans-serif` — uma PILHA DE SISTEMA, não uma escolha:
// o Endodirect tinha uma cara diferente em cada aparelho (Segoe no Windows, San
// Francisco no Mac e no iPhone, Roboto no Android). Não havia tipografia própria
// para reconhecer porque não havia tipografia escolhida.
//
// 🧨 DUAS METADES QUE PRECISAM ANDAR JUNTAS. Trocar o token sem carregar a fonte
// dá um `font-family` que não resolve; carregar a fonte sem trocar o token não
// muda nada na tela. As duas falham em silêncio — a tela continua legível, só
// que com a letra errada, que é exatamente o que ninguém percebe numa revisão.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── 1. As duas metades ─────────────────────────────────────────────────────
{
  const token = (html.match(/--font:([^;]+);/) || [])[1] || '';
  ok(/^'Inter'/.test(token.trim()),
    '⚠️ a fonte escolhida saiu da FRENTE do token (`--font` = ' + token.trim() + ') — a pilha de sistema volta a mandar');
  ok(html.indexOf('fonts.googleapis.com/css2?family=Inter') > 0,
    '🧨 o token pede Inter e nada a CARREGA — o `font-family` não resolveria e a tela cairia na pilha de reserva, em silêncio');

  // ⚠️ A RESERVA TEM DE SOBREVIVER. Sem ela, uma falha do Google Fonts (rede da
  // clínica, bloqueio corporativo) devolveria a serifada padrão do navegador —
  // pior do que a aparência de ontem.
  ok(/'Segoe UI',system-ui,sans-serif/.test(token),
    '🧨 a pilha de reserva sumiu do token: uma falha ao carregar a fonte jogaria a plataforma numa serifada de navegador');
}

// ── 2. Ninguém escapa do token ─────────────────────────────────────────────
// Havia três `font-family:Arial,Helvetica,sans-serif` soltos que ignoravam o
// token — trocada a fonte, eles ficariam com a letra antiga no meio da tela nova.
{
  ok(html.indexOf('font-family:Arial') < 0,
    '⚠️ voltou um `font-family:Arial` fixo no CSS — ele ignora o token e mostra a letra antiga no meio da nova');
  // ⚠️ MAS O SVG É OUTRA HISTÓRIA: `font-family="Arial…"` (atributo) fica em
  // SVG GERADO — capas de curso, gráficos —, que é renderizado fora do
  // documento e não enxerga webfont. Ali Arial é a escolha certa, e trocar por
  // `var(--font)` deixaria o texto sem fonte nenhuma.
  ok((html.match(/font-family="Arial,Helvetica,sans-serif"/g) || []).length > 0,
    '⚠️ o Arial dos SVGs gerados foi trocado junto — SVG não carrega webfont, e ali a troca deixa o texto sem fonte');
}

// ── 3. A carga não bloqueia a primeira pintura mais do que o necessário ────
{
  ok(/family=Inter[^"]*&display=swap/.test(html),
    '⚠️ o `display=swap` sumiu do pedido da fonte — a tela ficaria em branco esperando a letra chegar');
  ok(html.indexOf('rel="preconnect" href="https://fonts.gstatic.com"') > 0,
    'o preconnect ao servidor dos arquivos da fonte sumiu — atrasa a primeira pintura à toa');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ fonte: Inter na frente do token, carregada com swap, reserva de sistema intacta e nenhum Arial solto no CSS');
