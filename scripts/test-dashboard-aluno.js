// Regressão do DASHBOARD DO ALUNO: trilho lateral, tela de início e os nomes.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (30/08/2026). Cinco pedidos do professor na
// mesma sessão, todos sobre a mesma tela:
//   · "Deixa um sidebar de dashboard para o painel do aluno. Nele, mostra o
//      número de resumos publicados, diretrizes, questões no banco. Mostra
//      também como está seu progresso";
//   · mostrando o print do Desempenho: "joga esses dados já no dashboard";
//   · "O dashboard deve ser a tela de início do aluno";
//   · "Muda o nome Questões para Banco de questões" e "Mural" para
//     "Mural de artigos";
//   · "Retirar a opção de Geradas por IA do painel do aluno".
//
// 🧨 O RISCO REAL DE REMOVER ELEMENTO NÃO É A TELA — É O APAGÃO. Um
// `document.getElementById('x').addEventListener(...)` sobre um elemento que
// deixou de existir LANÇA, e um throw na seção de fiação mata todos os
// listeners depois dele. O cofre registra dois apagões assim. A parte final
// deste arquivo varre o arquivo inteiro atrás desse padrão órfão.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// Recorta uma função inteira contando chaves.
function bloco(cab) {
  const i = html.indexOf(cab);
  if (i < 0) return '';
  let j = html.indexOf('{', i), d = 0;
  for (;;) {
    const c = html[j];
    if (c === '{') d++;
    else if (c === '}') { d--; if (!d) return html.slice(i, j + 1); }
    j++;
    if (j > html.length) return '';
  }
}

// ── 1. A tela de início do aluno é o DASHBOARD ────────────────────────────
{
  const ctx = vm.createContext({ console });
  vm.runInContext('var vis={dash:1,mural:1,quest:1};function canSeePanel(p){return !!vis[p];}'
    + bloco('function homePanel(')
    + bloco('function maybeLandMedicoHome('), ctx);
  ok(vm.runInContext('homePanel()', ctx) === 'dash',
    '⚠️ a tela de início do aluno não é o Dashboard — o pedido é literal: "o dashboard deve ser a tela de início do aluno"');
  // Com o Dashboard fora do ar, ainda tem de cair em algo visível.
  vm.runInContext('vis.dash=0;', ctx);
  ok(vm.runInContext('homePanel()', ctx) === 'mural', 'sem Dashboard, a entrada tem de cair num painel visível');
  vm.runInContext('vis.mural=0;', ctx);
  ok(vm.runInContext('homePanel()', ctx) === 'quest', 'a cadeia de fallback da tela inicial quebrou');

  // 🧨 O empurrão pós-hydrate que levava o médico para o Mural TEM de estar
  // desligado: senão ele desfaz a tela de início dois segundos depois de ela
  // aparecer, e o aluno vê o Dashboard piscar e sumir.
  const ctx2 = vm.createContext({ console });
  let foiPara = null;
  vm.runInContext('var currentUser={role:"aluno"};function isAdminUser(){return false;}'
    + 'function prescProfileOk(){return true;}function canSeePanel(){return true;}'
    + 'var document={getElementById:function(){return {classList:{contains:function(){return true;}}};}};'
    + 'function goPanel(p){__ir(p);}'
    + bloco('function maybeLandMedicoHome('), Object.assign(ctx2, { __ir: (p) => { foiPara = p; } }));
  vm.runInContext('maybeLandMedicoHome();', ctx2);
  ok(foiPara === null,
    '⚠️ o reforço pós-hydrate ainda empurra o aluno para o ' + foiPara + ' — o Dashboard abriria e sumiria sozinho');
}

// ── 1b. 🧨 A TELA DE INÍCIO PRECISA DE PORTA ─────────────────────────────
// Eu provei que `homePanel()` devolvia 'dash' e dei por encerrado. Só que
// `applyProfileMenuLayout()` — uma TERCEIRA cópia da regra "médico vive no
// Mural", que eu não tinha lido — escondia o item Dashboard do menu de quem tem
// perfil de médico. A tela de entrada ficou sem porta: quem saísse dela não
// tinha como voltar. Quem viu foi o professor: "não apareceu no menu lateral
// Dashboard".
//
// A lição: **provar que o destino está certo não prova que existe caminho até
// ele**, e regra de produto espalhada por três lugares só está desfeita quando
// os três forem lidos.
{
  const menu = html.slice(html.indexOf('<div id="sb-aluno">'), html.indexOf('<div id="sb-admin"'));
  ok(menu.indexOf('data-p="dash"') >= 0,
    '🧨 o Dashboard não tem item no menu — é a tela de início; sem porta, quem sair dela não volta');
  ok(menu.indexOf('data-p="desemp"') < 0,
    '⚠️ o Desempenho voltou ao menu — ele foi incorporado ao Dashboard ("deve ser incorporada nele e automaticamente desaparecer do menu lateral")');

  // A ORDEM pedida: "ele deve ser o primeiro, acima do mural de artigos".
  const ordem = [...menu.matchAll(/data-p="([a-z]+)"/g)].map((m) => m[1]);
  ok(ordem[0] === 'dash',
    '⚠️ o Dashboard não é o primeiro item do menu, e sim `' + ordem[0] + '` — o pedido é literal');
  ok(ordem[1] === 'mural',
    '⚠️ o "Mural de artigos" deixou de vir logo abaixo do Dashboard, veio `' + ordem[1] + '`');

  // 🧨 E ninguém pode voltar a mexer nesse item em tempo de execução. Foi
  // exatamente uma linha de `dash.style.display='none'` que criou o defeito.
  // ⚠️ Procurar o NOME pegava o comentário que explica a remoção. O que não
  // pode voltar é a DEFINIÇÃO ou a CHAMADA.
  ok(!/function applyProfileMenuLayout|applyProfileMenuLayout\(\);/.test(html),
    '🧨 `applyProfileMenuLayout` voltou — era ela que escondia o Dashboard do menu do médico');
  ok(html.indexOf('.sb-item[data-p="dash"]') < 0,
    '🧨 alguém voltou a selecionar o item Dashboard do menu para manipulá-lo em tempo de execução');
}

// ── 1c. O Desempenho desenha DENTRO do Dashboard, sem repetir os KPIs ────
{
  ok(/renderDesempenhoNoDash\(\)/.test(bloco('function refreshDash(')),
    '⚠️ o Dashboard parou de desenhar o Desempenho incorporado — e ele não está mais no menu, então sumiria da plataforma');
  ok(html.indexOf('id="dash-desemp"') > 0, 'o host do Desempenho dentro do Dashboard sumiu do markup');
  // O card resumido "Desempenho por área" tinha as MESMAS barras, em versão
  // pobre. Os dois na mesma tela seriam a mesma informação duas vezes.
  // ⚠️ O título "Desempenho por área" também é de um card do RELATÓRIO DO
  // SIMULADO (`rep-area-row`), que é outra tela e continua válido. A âncora
  // certa é o host que só o card do Dashboard tinha.
  ok(html.indexOf('id="perf-bars"') < 0,
    '⚠️ voltou o card resumido de barras do Dashboard: ele repete o "Acerto por subespecialidade" logo acima');

  // Executa os dois destinos e compara.
  const ctx = vm.createContext({ console });
  vm.runInContext(
    'var DB={perf:{Diabetes:{correct:8,total:10},Tireoide:{correct:4,total:10}},'
    + 'perfTema:{Diabetes:{Cetoacidose:{correct:1,total:6}}},act:{"2026-08-31":3}};'
    + 'function todayKey(){return "2026-08-31";}'
    + bloco('function esc(') + bloco('function perfPct(') + bloco('function kpiCard(')
    + bloco('function computeStreak(') + bloco('function progressoDoAluno(')
    + bloco('function renderDesempenhoEm(') + bloco('function desempenhoHTML('), ctx);
  const noDash = vm.runInContext('desempenhoHTML(false)', ctx);
  const comoPagina = vm.runInContext('desempenhoHTML(true)', ctx);

  ['Onde focar', 'Acerto por subespecialidade', 'Atividade (14 dias)'].forEach((t) => {
    ok(noDash.indexOf(t) >= 0, '⚠️ "' + t + '" não foi incorporado ao Dashboard');
  });
  // ⚠️ OS QUATRO KPIs JÁ ESTÃO NO TRILHO, na mesma tela. Repetir os mesmos
  // números a dois palmos de distância não informa — só ocupa espaço e cria a
  // dúvida de se são a mesma coisa.
  ok(noDash.indexOf('Acerto geral') < 0,
    '⚠️ os KPIs voltaram ao corpo do Dashboard — eles já estão no trilho, na mesma tela');
  ok(comoPagina.indexOf('Acerto geral') >= 0,
    'o painel de Desempenho (caminho legado, sem trilho ao lado) perdeu os KPIs');
  ok(noDash.indexOf('<h1>') < 0, 'o bloco do Dashboard não pode trazer cabeçalho de página');
  ok(comoPagina.indexOf('<h1>') >= 0, 'o painel legado perdeu o cabeçalho');

  // Aluno sem nenhuma resposta: silêncio no Dashboard (o trilho já convida).
  const ctx0 = vm.createContext({ console });
  vm.runInContext('var DB={perf:{},perfTema:{},act:{}};function todayKey(){return "2026-08-31";}'
    + bloco('function esc(') + bloco('function perfPct(') + bloco('function kpiCard(')
    + bloco('function computeStreak(') + bloco('function progressoDoAluno(')
    + bloco('function renderDesempenhoEm(') + bloco('function desempenhoHTML('), ctx0);
  ok(vm.runInContext('desempenhoHTML(false)', ctx0) === '',
    '⚠️ o aluno que ainda não respondeu nada recebe um bloco de desempenho vazio embaixo do convite do trilho');
  ok(vm.runInContext('desempenhoHTML(true)', ctx0).indexOf('Responda questões') >= 0,
    'o painel legado deixou de explicar por que está vazio');
}

// ── 2. Os números do trilho batem com o que a aba mostra ──────────────────
// 🧨 ESTE É O DEFEITO QUE IMPORTA. Se `acervoContagem` contar por um critério e
// `dirIsVisible` (que a aba usa para listar) por outro, o trilho anuncia um
// número e quem clicar vê outro. Aqui as DUAS rodam sobre o mesmo acervo.
{
  const fixture = [
    { titulo: 'Diretriz pública' },                                   // Diretrizes
    { titulo: 'Outra pública' },                                      // Diretrizes
    { titulo: 'Rascunho público', rascunho: true },                   // nenhuma
    { titulo: 'Capítulo', privado: true },                            // Resumos/capítulos
    { titulo: 'Capítulo 2', privado: true, tipo: 'capitulo' },        // Resumos/capítulos
    { titulo: 'Artigo', privado: true, tipo: 'artigo' },              // Resumos/artigos
    { titulo: 'Rascunho privado', privado: true, rascunho: true },    // nenhuma
    { titulo: 'Artigo público', tipo: 'artigo' }                      // só nos Resumos
  ];
  const ctx = vm.createContext({ console });
  vm.runInContext(
    'var diretrizes=' + JSON.stringify(fixture) + ';'
    + 'var provasDB=new Array(2965);var podcasts=new Array(199);'
    + 'var refPrivadoMode=false, refTipoSel="capitulo";'
    + bloco('function dirTipoOf(') + bloco('function dirIsRascunho(')
    + bloco('function dirSoNosResumos(') + bloco('function dirIsVisible(')
    + bloco('function acervoContagem(') + bloco('function nBR('), ctx);
  const c = vm.runInContext('acervoContagem()', ctx);
  const visiveis = (privado, tipo) => vm.runInContext(
    'refPrivadoMode=' + privado + ';refTipoSel=' + JSON.stringify(tipo) + ';'
    + 'diretrizes.filter(dirIsVisible).length', ctx);

  ok(c.questoes === 2965, 'o trilho perdeu a contagem do banco de questões, veio ' + c.questoes);
  ok(c.podcasts === 199, 'o trilho perdeu a contagem de podcasts, veio ' + c.podcasts);
  ok(c.diretrizes === visiveis(false, 'capitulo'),
    '⚠️ o trilho anuncia ' + c.diretrizes + ' diretriz(es) e a aba lista ' + visiveis(false, 'capitulo')
    + ' — número que não bate com a tela de destino é pior que número nenhum');
  ok(c.resumos === visiveis(true, 'capitulo'),
    '⚠️ o trilho anuncia ' + c.resumos + ' resumo(s) e a aba de Capítulos lista ' + visiveis(true, 'capitulo'));
  ok(c.artigos === visiveis(true, 'artigo'),
    '⚠️ o trilho anuncia ' + c.artigos + ' artigo(s) e a aba de Artigos lista ' + visiveis(true, 'artigo'));
  // Rascunho é trabalho em curso do professor: não é acervo publicado.
  ok(c.diretrizes + c.resumos + c.artigos === 5,
    '⚠️ rascunho entrou na contagem do acervo — o trilho diz "publicado e disponível hoje"');
  ok(nBRde(ctx, 2965) === '2.965', 'o separador de milhar do trilho sumiu: "2965" se lê pior que "2.965"');
  function nBRde(cx, n) { return vm.runInContext('nBR(' + n + ')', cx); }
}

// ── 3. O progresso é UMA conta só, lida pelas duas telas ──────────────────
// Duas contas separadas divergem na primeira correção, e o aluno vê 74% numa
// tela e 71% na outra sem saber em qual acreditar.
{
  const ctx = vm.createContext({ console });
  vm.runInContext(
    'var DB={perf:{Diabetes:{correct:30,total:40},Tireoide:{correct:14,total:20},Adrenal:{correct:0,total:0}},'
    + 'act:{"2026-08-30":12}};'
    + 'function todayKey(){return "2026-08-30";}'
    + bloco('function computeStreak(') + bloco('function progressoDoAluno('), ctx);
  const pr = vm.runInContext('progressoDoAluno()', ctx);
  ok(pr.respondidas === 60, 'total de respondidas errado: ' + pr.respondidas);
  ok(pr.acertos === 44, 'total de acertos errado: ' + pr.acertos);
  ok(pr.acerto === 73, 'acerto geral errado: ' + pr.acerto + '% (44/60 = 73%)');
  ok(pr.hoje === 12, 'o "hoje" do trilho errado: ' + pr.hoje);
  ok(pr.areas === 2,
    '⚠️ área com ZERO questão contou como estudada — `DB.perf` ganha a chave antes de a questão ser respondida');

  ok(/var pr=progressoDoAluno\(\)/.test(bloco('function renderDesempenhoEm(')),
    '⚠️ o painel de Desempenho voltou a fazer a própria conta — é assim que as duas telas passam a discordar');
  ok(/progressoDoAluno\(\)/.test(bloco('function renderDashRail(')),
    'o trilho deixou de usar a conta compartilhada');
  // 🧨 ESCREVER A FUNÇÃO NÃO É CHAMÁ-LA. Tirar a chamada de `refreshDash` deixa
  // o trilho perfeito e invisível — e todo o resto deste arquivo continuaria
  // passando, porque testa `renderDashRail` isolada. Cobrado no chamador.
  ok(/renderDashRail\(\)/.test(bloco('function refreshDash(')),
    '⚠️ `refreshDash` parou de desenhar o trilho — ele existiria no código e nunca apareceria na tela');
  ok(/renderDashAcervo\(\)/.test(bloco('function refreshDash(')),
    '⚠️ `refreshDash` parou de desenhar a faixa do acervo — os números que o professor pediu "na frente" sumiriam da tela');
  ok(html.indexOf('id="dash-acervo"') > 0, 'o host da faixa do acervo sumiu do markup');
}

// ── 4. O trilho desenha, é do ALUNO, e cada linha leva a algum lugar ──────
{
  function montar(prog) {
    const el = { style: {}, innerHTML: '', _btns: [] };
    const ctx = vm.createContext({ console });
    ctx.__ir = [];
    vm.runInContext(
      'var currentUser={role:"aluno"};var DIR_SUBS=new Array(14);'
      + 'function progressoDoAluno(){return ' + JSON.stringify(prog) + ';}'
      + 'function acervoContagem(){return {questoes:2965,diretrizes:71,resumos:118,artigos:43,podcasts:199};}'
      + 'function goPanel(p){__ir.push(p);}'
      + 'var document={getElementById:function(id){return __hosts[id]||null;}};'
      + bloco('function esc(') + bloco('function nBR(')
      + bloco('function renderDashRail(') + bloco('function renderDashAcervo('), ctx);
    // hosts de mentira que registram os listeners que cada render pendura
    const host = (attr) => ({
      style: {}, _f: [],
      set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ''; },
      querySelectorAll() {
        const ids = []; const re = new RegExp(attr + '="([a-z]+)"', 'g'); let m;
        while ((m = re.exec(this._h || ''))) ids.push(m[1]);
        const self = this;
        return ids.map((pn) => ({ getAttribute: () => pn, addEventListener: (_, f) => self._f.push(f) }));
      }
    });
    ctx.__hosts = { 'dash-rail': host('data-rail-ir'), 'dash-acervo': host('data-acv-ir') };
    vm.runInContext('renderDashRail();renderDashAcervo();', ctx);
    return { trilho: ctx.__hosts['dash-rail'], acervo: ctx.__hosts['dash-acervo'], ctx };
  }

  const r = montar({ respondidas: 312, acertos: 231, acerto: 74, ofensiva: 6, hoje: 12, areas: 9 });

  // ── O trilho: só o PROGRESSO ────────────────────────────────────────────
  ok(r.trilho.innerHTML.indexOf('Seu progresso') >= 0, 'o trilho perdeu a seção "Seu progresso"');
  // Os quatro números do print do Desempenho que o professor mandou.
  ['74%', '312', 'Acerto geral', 'Respondidas', 'ofensiva', 'Hoje'].forEach((t2) => {
    ok(r.trilho.innerHTML.toLowerCase().indexOf(t2.toLowerCase()) >= 0,
      '⚠️ "' + t2 + '" sumiu do trilho — são os dados do print que o professor mandou com "joga esses dados já no dashboard"');
  });
  ok(r.trilho.innerHTML.indexOf('9 subespecialidades estudadas de 14') >= 0, 'a cobertura por subespecialidade sumiu');
  // ⚠️ O ACERVO SUBIU PARA A FAIXA DO TOPO ("deixe o dashboard com esses dados
  // na frente"). Mantê-lo também no trilho seria a mesma informação duas vezes
  // na mesma tela — o erro que já corrigi nos KPIs do Desempenho.
  ok(!/2\.965/.test(r.trilho.innerHTML),
    '⚠️ o acervo voltou ao trilho: ele já está na faixa do topo, na mesma tela');

  // ── A faixa do topo: os números que ele pediu, na frente ────────────────
  const A = r.acervo.innerHTML;
  ok(/2\.965/.test(A), '⚠️ "total de questões na plataforma" sumiu da faixa do Dashboard');
  ok(/>71</.test(A), '⚠️ "número de diretrizes publicadas" sumiu da faixa');
  ok(/>118</.test(A), '⚠️ "número de resumos publicados" sumiu da faixa');
  ['Questões no banco', 'Diretrizes', 'Resumos publicados'].forEach((t2) => {
    ok(A.indexOf(t2) >= 0, 'a faixa perdeu o rótulo "' + t2 + '"');
  });

  // Cada card LEVA à aba. Número que não é caminho vira enfeite.
  const alvos = [...A.matchAll(/data-acv-ir="([a-z]+)"/g)].map((m) => m[1]);
  ['quest', 'ref', 'resu', 'podcast'].forEach((pn) => {
    ok(alvos.indexOf(pn) >= 0, '⚠️ o card que leva ao painel `' + pn + '` perdeu o destino');
  });
  ok(r.acervo._f.length === alvos.length,
    'os cards do acervo ficaram sem listener: ' + r.acervo._f.length + ' de ' + alvos.length);
  r.acervo._f.forEach((f) => f());
  ok(r.ctx.__ir.length === alvos.length, 'clicar num card do acervo não navegou');

  // ⚠️ QUEM NUNCA RESPONDEU NÃO LEVA UM PAINEL DE ZEROS no trilho. "0% de
  // acerto" para quem nunca errou nada não é dado, é julgamento — mesma lição
  // da meta semanal, que mostrava "você está atrás" de uma meta jamais
  // escolhida. O ACERVO, esse, aparece igual: é fato da plataforma, não dele.
  const novo = montar({ respondidas: 0, acertos: 0, acerto: 0, ofensiva: 0, hoje: 0, areas: 0 });
  ok(novo.trilho.innerHTML.indexOf('0%') < 0,
    '⚠️ o aluno que ainda não respondeu nada recebe "0% de acerto" — é julgamento, não dado');
  ok(novo.trilho.innerHTML.indexOf('primeira questão') >= 0, 'o estado inicial do trilho deixou de convidar');
  ok(/2\.965/.test(novo.acervo.innerHTML), 'a faixa do acervo tem de aparecer mesmo para quem ainda não respondeu nada');
}

// ── 5. O trilho não é do professor ────────────────────────────────────────
{
  const ctx = vm.createContext({ console });
  const host = { style: {}, innerHTML: 'sujeira', querySelectorAll: () => [] };
  vm.runInContext('var currentUser={role:"admin"};'
    + 'var document={getElementById:function(){return __host;}};'
    + 'function progressoDoAluno(){return {respondidas:1,acerto:1,ofensiva:1,hoje:1,areas:1};}'
    + 'function acervoContagem(){return {questoes:1,diretrizes:1,resumos:1,artigos:1,podcasts:1};}'
    + 'function goPanel(){}' + bloco('function esc(') + bloco('function nBR(')
    + bloco('function renderDashRail(') + bloco('function renderDashAcervo(')
    + 'renderDashRail();renderDashAcervo();',
    Object.assign(ctx, { __host: host }));
  ok(host.style.display === 'none' && host.innerHTML === '',
    'o trilho/faixa do aluno apareceu para o professor, que tem o painel dele');
}

// ── 6. Os nomes que o professor trocou ────────────────────────────────────
{
  ok(html.indexOf('data-p="mural">📢 Mural de artigos<') > 0, '⚠️ o menu voltou a dizer só "Mural"');
  ok(html.indexOf('<h1>Mural de artigos ') > 0, 'o título da tela do Mural não acompanhou o menu');
  ok(html.indexOf("mural:'Mural de artigos'") > 0, 'o rótulo do painel (usado na barra de topo) não acompanhou');
  ok(html.indexOf('data-p="quest">📝 Banco de questões<') > 0, '⚠️ o menu voltou a dizer só "Questões"');
  ok(html.indexOf('<h1>Banco de questões</h1>') > 0, 'o título da tela de questões não acompanhou o menu');
  ok(html.indexOf("quest:'Banco de questões'") > 0, 'o rótulo do painel de questões não acompanhou');
  // ⚠️ A aba interna dizia exatamente o nome que a PÁGINA passou a ter.
  ok(html.indexOf('data-qmode="provas">🏛️ Banco de Questões<') < 0,
    '⚠️ a aba voltou a repetir o título da página — a mesma palavra duas vezes na mesma tela não informa nada');
}

// ── 7. A geração por IA saiu do painel do aluno ───────────────────────────
{
  ok(html.indexOf('data-qmode="ia"') < 0, '⚠️ a aba "Geradas por IA" voltou ao painel do aluno');
  ok(html.indexOf('id="q-panel-ia"') < 0, 'o formulário de geração por IA voltou ao markup');
  ok(html.indexOf('id="btn-genq"') < 0, 'o botão "Gerar questões" voltou ao markup');
  // As outras duas abas continuam: o Banco Salvo guarda o que o aluno já salvou
  // e o que o Resumidor gera.
  ok(html.indexOf('data-qmode="provas"') > 0 && html.indexOf('data-qmode="salvo"') > 0,
    '⚠️ sumiu uma aba a mais: Provas anteriores e Banco Salvo têm de ficar');
  ok(html.indexOf('Questões geradas por IA que você salvou') < 0,
    'o Banco Salvo ainda anuncia um caminho que não existe mais no painel do aluno');
}

// ── 8. 🧨 NENHUMA REFERÊNCIA ÓRFÃ (a guarda do apagão) ────────────────────
// `document.getElementById('x').algo` sobre elemento removido LANÇA, e um throw
// na fiação mata TODOS os listeners depois dele. Esta varredura é geral: vale
// para qualquer remoção futura, não só para a de hoje.
{
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([A-Za-z0-9_-]+)"/g)) ids.add(m[1]);
  // ⚠️ ID MONTADO POR CONCATENAÇÃO TAMBÉM É ID. `id="adm-mq-'+l.toLowerCase()+'"`
  // cria adm-mq-a..d de verdade; sem esta linha o varredor acusaria o formulário
  // de questão manual do professor de estar quebrado — e ele não está. (Eu quase
  // reportei isso como defeito antes de ler a linha que os cria.)
  for (const m of html.matchAll(/\sid="([A-Za-z0-9_-]+)'\s*\+/g)) ids.add(m[1] + 'CONCAT');
  const prefixosDinamicos = [...ids].filter((x) => x.endsWith('CONCAT')).map((x) => x.slice(0, -6));
  const ehDinamico = (id) => prefixosDinamicos.some((p) => id.indexOf(p) === 0);

  // Dívida PRÉ-EXISTENTE, medida e nomeada — não some, mas também não reprova
  // uma mudança que não a criou. `genPresc()` não tem NENHUM chamador (código
  // morto desde antes desta mudança) e lê três campos que não existem.
  const CONHECIDOS = ['presc-dx', 'presc-med', 'presc-pac'];

  const orfaos = [];
  // Só o padrão SEM guarda: `.getElementById('x').` colado num acesso.
  for (const m of html.matchAll(/document\.getElementById\('([A-Za-z0-9_-]+)'\)\s*\./g)) {
    const id = m[1];
    if (ids.has(id) || ehDinamico(id) || CONHECIDOS.indexOf(id) >= 0) continue;
    orfaos.push(id);
  }
  ok(orfaos.length === 0,
    '🧨 acesso SEM GUARDA a elemento que não existe no markup: ' + [...new Set(orfaos)].join(', ')
    + ' — um throw aqui mata todos os listeners seguintes (é o apagão registrado no cofre). '
    + 'Use `var e=document.getElementById(...); if(e)…` ou remova a linha.');
  console.log('  · varredura de órfãos: ' + CONHECIDOS.length + ' pré-existente(s) em `genPresc()` (função sem chamador) — em cofre/Pendências.md');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ dashboard do aluno: acervo na faixa do topo batendo com as abas, progresso no trilho, Desempenho incorporado, Dashboard de entrada e no menu — sem referência órfã');
