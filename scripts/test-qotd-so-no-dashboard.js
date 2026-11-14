// A JANELA DA QUESTÃO DO DIA ABRE SÓ NO DASHBOARD — NUNCA NO MURAL DE ARTIGOS.
//
// 🧨 POR QUE ESTE TESTE EXISTE (14/11/2026). O professor abriu o Mural de artigos no
// celular e a janela da Questão do Dia apareceu por cima dele. Mandou o print com:
// *"Retirar essa questão do dia quando abre a ferramenta do mural de artigos. Deixa ela
// somente no dashboard, a questão do dia assim que o aluno abre o aplicativo ou o site.
// Não é para aparecer no mural de artigos."*
//
// A janela nasceu no Mural quando ele era a tela de entrada. Em 30/08/2026 a entrada
// virou o Dashboard (`homePanel`), mas `goPanel` continuou abrindo a janela só no Mural:
// quem entrava pelo Dashboard não a via, e quem ia ler artigos levava com ela na cara.
//
// O teste roda o trecho de verdade de `goPanel` (a linha que decide a janela) e o
// gancho do carregamento tardio (`ig_stories` chega depois do hydrate) com o DOM falso.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let j = html.indexOf('{', i), n = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

// ── 1. goPanel: a linha que liga/desliga a janela ─────────────────────────
const gp = corpo('goPanel');
const linha = gp.split('\n').find((l) => /qotd-modal/.test(l) && /renderQotd\(\)/.test(l));
ok(!!linha, '⚠️ goPanel não decide mais a janela da Questão do Dia (linha com qotd-modal + renderQotd sumiu)');
if (linha) {
  const rodar = (id) => {
    const modal = { style: { display: '' } };
    const cx = { id, chamou: 0, document: { getElementById: (x) => (x === 'qotd-modal' ? modal : null) } };
    cx.renderQotd = () => { cx.chamou++; modal.style.display = ''; };
    vm.createContext(cx);
    vm.runInContext(linha, cx);
    return { abriu: cx.chamou > 0, escondeu: modal.style.display === 'none' };
  };
  const dash = rodar('dash');
  ok(dash.abriu, '🧨 abrir o Dashboard não mostra mais a Questão do Dia — ela é da tela de entrada');
  const mural = rodar('mural');
  ok(!mural.abriu, '🧨 a janela da Questão do Dia voltou a abrir no Mural de artigos (professor, 14/11: "Não é para aparecer no mural de artigos")');
  ok(mural.escondeu, '🧨 ir para o Mural de artigos não esconde a janela aberta no Dashboard');
  ['flash', 'quest', 'cursos', 'ref', 'qotd'].forEach((p) => {
    const r = rodar(p);
    ok(!r.abriu && r.escondeu, '🧨 a janela da Questão do Dia aparece (ou fica aberta) no painel "' + p + '"');
  });
}

// ── 2. Carregamento tardio: as questões chegam depois do hydrate ──────────
{
  const i = html.indexOf('if(Array.isArray(payload.ig_stories)){');
  const trecho = i >= 0 ? html.slice(i, html.indexOf('\n', i)) : '';
  ok(/getElementById\('panel-dash'\)[^;]*;[^]*renderQotd\(\)/.test(trecho),
    '🧨 quando as questões chegam depois do login, a janela é reaberta olhando outro painel que não o Dashboard');
  ok(!/panel-mural'\)[^;]*qotd-modal/.test(trecho) && !/getElementById\('panel-mural'\)/.test(trecho),
    '🧨 o carregamento tardio voltou a abrir a Questão do Dia sobre o Mural de artigos');
}

// ── 3. O botão depois de responder não manda para o Mural ─────────────────
{
  const rm = corpo('qotdRenderModal');
  ok(!/Ver o mural/i.test(rm), '⚠️ o botão depois de responder ainda diz "Ver o mural", mas a janela está no Dashboard');
}

// ── 4. A tela de entrada continua sendo o Dashboard ───────────────────────
ok(/if\(canSeePanel\('dash'\)\)return 'dash';/.test(corpo('homePanel')),
  '⚠️ a tela de entrada deixou de ser o Dashboard — a janela da Questão do Dia ficaria fora do caminho do aluno');

if (falhas.length) {
  console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - '));
  process.exit(1);
}
console.log('✓ Questão do Dia: janela só no Dashboard (tela de entrada), nunca no Mural de artigos nem nos outros painéis');
