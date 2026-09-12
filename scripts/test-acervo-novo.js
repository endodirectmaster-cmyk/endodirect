// O ACERVO DIZ O QUE ENTROU — E NÃO CONFUNDE "NOVO NA PLATAFORMA" COM "RECENTE".
//
// ⚠️ 12/09/2026. Uma assinante Gold de 63 dias avaliou 3/5: "as diretrizes,
// mapas mentais e revisões precisam ser atualizadas". Medido no banco: no
// período dela os resumos foram de 5 para 161, os mapas de 62 para 82 e as
// diretrizes de 62 para 71 — e a tela não mostrava nenhum sinal disso. Item
// sem data de entrada, grade com contagem total, nada de "novo".
//
// 🧨 DUAS MANEIRAS DE ERRAR, OPOSTAS. Não marcar nada (o defeito original) e
// marcar tudo — inclusive tratar uma diretriz de 2016 publicada ontem como se
// fosse "atualizada". O selo mede a data de ENTRADA (`at`); o ano da diretriz
// segue no cabeçalho, ao lado. Os dois fatos aparecem, cada um no seu lugar.
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
const DIA = 86400000;
const caixa = { console, Date, Number, Array, String };
vm.createContext(caixa);
vm.runInContext([
  'var ACERVO_NOVO_DIAS=' + (html.match(/var ACERVO_NOVO_DIAS=(\d+);/) || [, '0'])[1] + ';',
  corpo('esc'), corpo('acervoEhNovo'), corpo('novoSeloHTML'), corpo('novosSufixoHTML'),
  corpo('dirNovosNaSub'), corpo('acervoNovosDesde'),
  'function nBR(n){return String(n);}',
].join('\n'), caixa);

// ── 1. O selo mede a ENTRADA, não o ano ──────────────────────────────────
{
  const agora = Date.now();
  ok(caixa.ACERVO_NOVO_DIAS === 30, '⚠️ a janela de "novo" mudou de 30 dias para ' + caixa.ACERVO_NOVO_DIAS);
  ok(caixa.acervoEhNovo({ at: agora - 2 * DIA }) === true, '🧨 item que entrou há 2 dias não é "novo"');
  ok(caixa.acervoEhNovo({ at: agora - 45 * DIA }) === false, '🧨 item de 45 dias atrás ainda aparece como "novo"');
  ok(caixa.acervoEhNovo({ at: agora - 2 * DIA, ano: '2016' }) === true,
    '⚠️ diretriz de 2016 publicada ontem deixou de ser "nova no acervo" — o selo é sobre a entrada, o ano fica no cabeçalho');
  ok(caixa.acervoEhNovo({}) === false && caixa.acervoEhNovo(null) === false,
    '🧨 item sem data foi tratado como novo — os 226 itens antigos ganhariam selo de uma vez');
  ok(caixa.acervoEhNovo({ pubAt: agora - DIA, at: agora - 90 * DIA }) === true,
    '🧨 flashcard semeado hoje de uma publicação antiga: `pubAt` (publicação) tem de vencer `at` (semeadura)');
  ok(caixa.acervoEhNovo({ at: agora - 10 * DIA }, agora - 5 * DIA) === false,
    '⚠️ a referência explícita ("desde a última visita") foi ignorada');
  ok(/class="novo-selo"/.test(caixa.novoSeloHTML({ at: agora })) && caixa.novoSeloHTML({ at: agora - 60 * DIA }) === '',
    '⚠️ o selo não acompanha a regra de 30 dias');
}

// ── 2. Contagem por subespecialidade respeita a visibilidade ──────────────
{
  const agora = Date.now();
  caixa.diretrizes = [
    { sub: 'Tireoide', at: agora - DIA, privado: false },
    { sub: 'Tireoide', at: agora - DIA, privado: true },
    { sub: 'Tireoide', at: agora - 60 * DIA },
    { sub: 'Adrenal', at: agora - DIA },
  ];
  ok(caixa.dirNovosNaSub('Tireoide', null) === 2, '🧨 contagem de novos por subespecialidade errada');
  ok(caixa.dirNovosNaSub('Tireoide', d => !d.privado) === 1,
    '🧨 a contagem ignora o filtro de visibilidade — nas Diretrizes contaria resumo privado');
  ok(caixa.novosSufixoHTML(1, true).indexOf('1 nova') >= 0 && caixa.novosSufixoHTML(2, true).indexOf('2 novas') >= 0
    && caixa.novosSufixoHTML(1, false).indexOf('1 novo') >= 0 && caixa.novosSufixoHTML(0, true) === '',
    '⚠️ concordância do sufixo ("nova/novas", "novo/novos") ou zero não vazio');
}

// ── 3. "Desde a última visita" separa os quatro acervos e só conta o visível ─
{
  const agora = Date.now();
  caixa.diretrizes = [
    { sub: 'A', at: agora - DIA, privado: false },
    { sub: 'A', at: agora - DIA, privado: true },
    { sub: 'A', at: agora - DIA, privado: false, escondida: true },
    { sub: 'A', at: agora - 100 * DIA, privado: false },
  ];
  caixa.dirIsVisibleAnyTipo = d => !d.escondida;
  caixa.sharedMM = [{ at: agora - DIA }, { at: agora - 90 * DIA }];
  caixa.fcShared = [{ at: agora - DIA }, { at: agora - DIA }, { at: agora - 90 * DIA }];
  const n = caixa.acervoNovosDesde(agora - 7 * DIA);
  ok(n.diretrizes === 1 && n.resumos === 1 && n.mapas === 1 && n.flashcards === 2,
    '🧨 contagem "desde a última visita" errada: ' + JSON.stringify(n) + ' (esperado 1/1/1/2)');
  ok(n.diretrizes === 1, '🧨 diretriz invisível ao aluno entrou na contagem');
}

// ── 4. A fiação: quem lê e quem grava ─────────────────────────────────────
{
  // Toda diretriz NOVA recebe a data de entrada; a edição preserva e não republica.
  const salvar = html.slice(html.indexOf("var rSave=document.getElementById('btn-adm-ref-save')"), html.indexOf("var rSave=document.getElementById('btn-adm-ref-save')") + 4000);
  ok(/obj\.at=Date\.now\(\);delete obj\.atAprox;diretrizes\.unshift\(obj\)/.test(salvar),
    '🧨 diretriz nova é gravada SEM data de entrada — a partir de agora nada mais seria "novo"');
  ok(/obj\.atEdit=Date\.now\(\);diretrizes\[admRefEdit\]=obj/.test(salvar),
    '⚠️ a edição deixou de registrar `atEdit` (ou passou a mexer em `at`: editar viraria republicar)');

  // O card mostra o selo ao lado da fonte·ano — os dois fatos, cada um no seu lugar.
  const card = corpo('dirCardHTML');
  ok(/esc\(d\.ano\)\)\:''\)\+'<\/span>'\+selo/.test(card),
    '🧨 o selo saiu do cabeçalho do card (ou o ano da diretriz saiu de perto dele)');
  ok(/if\(!head&&selo&&refFormat!=='flash'\)head=/.test(card),
    '⚠️ resumo privado (sem cabeçalho de fonte) ficou sem lugar para o selo');

  // Nível 3: novo primeiro, ordenação estável.
  ok(/list\.sort\(function\(a,b\)\{return \(acervoEhNovo\(b\.d\)\?1:0\)-\(acervoEhNovo\(a\.d\)\?1:0\);\}\);/.test(html),
    '🧨 a lista de diretrizes não põe o que é novo em primeiro');
  // Nível 1: a grade de subespecialidades conta os novos.
  ok(/novosSufixoHTML\(_nv,!refPrivadoMode\)/.test(html),
    '🧨 a grade de subespecialidades das Diretrizes perdeu o "N novas" — é a primeira tela que o aluno vê');

  // Mapas e flashcards: selo + contagem na grade.
  ok(/esc\(m\.topic\)\+novoSeloHTML\(m\)/.test(html), '🧨 o mapa mental perdeu o selo');
  ok(/novosSufixoHTML\(s\.novos,false\)/.test(html), '⚠️ a grade dos mapas perdeu a contagem de novos');
  ok(/pubAt:Number\(card\.at\)\|\|null/.test(html),
    '🧨 a semeadura dos flashcards não guarda a data de PUBLICAÇÃO — o selo usaria a data de semeadura, que é a de hoje');
  ok(/\(c\.shared\?novoSeloHTML\(c\):''\)/.test(html),
    '⚠️ o selo do flashcard passou a valer para cards do próprio aluno (só o publicado pelo professor é "novo no acervo")');
  ok(/novosSufixoHTML\(o\.novos,false\)/.test(html), '⚠️ a grade dos flashcards perdeu a contagem de novos');

  // Dashboard: a linha existe, e a marca de visita é pessoal e sincroniza.
  ok(/\}\)\.join\(''\)\+acervoNovosHTML\(\);/.test(html), '🧨 o Dashboard não mostra mais o que entrou desde a última visita');
  ok(/'plan','acervoVisto'\]\.forEach/.test(html), '🧨 `acervoVisto` não é persistido — a "última visita" nunca avança');
  ok(/'favs','acervoVisto'\]/.test(html), '⚠️ `acervoVisto` fora das chaves pessoais — não sincroniza entre aparelhos');
  const ref = corpo('acervoRefVisita');
  ok(/if\(acervoVistoRef===null\)/.test(ref) && /DB\.acervoVisto=Date\.now\(\)/.test(ref),
    '🧨 a referência da visita não é fixada uma vez por sessão — a contagem zeraria na segunda pintura do dashboard');
  const htmlNovos = corpo('acervoNovosHTML');
  ok(/nos últimos 30 dias/.test(htmlNovos) && /Nenhum conteúdo novo/.test(htmlNovos),
    '⚠️ primeira visita sem janela de 30 dias, ou "nada novo" sem frase — a ausência de novidade também é informação');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ acervo novo: selo pela data de ENTRADA (não pelo ano), novo primeiro, contagem por subespecialidade e "desde a sua última visita" no Dashboard');
