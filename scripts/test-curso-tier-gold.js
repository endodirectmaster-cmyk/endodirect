// Regressão do PORTÃO DE ACESSO aos cursos de pacote.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (24/08/2026). O portão do Gold era um `if` com o
// slug escrito no código (`if(slug==='endo_essencial')`). Ao criar a "Educação
// Médica Continuada", também em Gold, um segundo slug fixo faria todo curso de
// pacote novo depender de mexer no `index.html`. Passou a ler a coluna `tier` do
// catálogo — a MESMA regra que `endodirect_acessos_ativos()` aplica no servidor.
//
// Este é o teste de um portão que separa quem pagou de quem não pagou: errar
// para o lado frouxo entrega conteúdo Gold de graça, e para o lado apertado
// tranca quem pagou. As duas pontas são verificadas, e por mutação.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function corpo(nome) {
  const marca = '\nfunction ' + nome + '(';
  const i = html.indexOf(marca);
  if (i < 0) throw new Error('função não encontrada: ' + nome);
  const f = html.indexOf('\nfunction ', i + marca.length);
  return html.slice(i + 1, f < 0 ? html.length : f);
}
function trechoVar(nome) {
  const i = html.indexOf('\nvar ' + nome + '=');
  if (i < 0) throw new Error('var não encontrada: ' + nome);
  return html.slice(i + 1, html.indexOf('\n', html.indexOf(';', i)));
}

// Monta um mundo mínimo: só o portão e o que ele consulta.
function mundo({ tier, acessos, plano, admin, ativo }) {
  const ctx = vm.createContext({});
  vm.runInContext(
    trechoVar('SHOWCASE_ONLY_CURSOS') + '\n'
    + 'var catalogoCursos=' + JSON.stringify([
        { slug: 'emc', nome: 'Educação Médica Continuada', tier, ativo: ativo !== false },
        { slug: 'endo_essencial', nome: 'Endocrinologia Essencial', tier: 'gold' },
        { slug: 'avulso', nome: 'Curso Avulso', tier: null },
      ]) + ';\n'
    + 'var userAcessos=' + JSON.stringify(acessos || []) + ';\n'
    + 'function isTestShowcase(){return false;}\n'
    + 'function isAdminUser(){return ' + (admin ? 'true' : 'false') + ';}\n'
    + 'function currentPlanKey(){return ' + JSON.stringify(plano || '') + ';}\n'
    + 'function planRank(){var k=currentPlanKey();return k===\'gold\'?2:(k===\'standard\'?1:0);}\n'
    + trechoVar('CURSO_RANK') + '\n'
    + corpo('cursoAtivo') + '\n' + corpo('cursoTier') + '\n' + corpo('cursoAcessivel') + '\n'
    + corpo('aulaLiberada'), ctx);
  return ctx;
}

// ── Quem PODE ver o curso Gold ───────────────────────────────────────────────
ok(mundo({ tier: 'gold', plano: 'gold' }).cursoAcessivel('emc') === true,
  'assinante GOLD não conseguiu abrir o curso Gold — tranca quem pagou');
ok(mundo({ tier: 'gold', plano: '', acessos: ['curso:emc'] }).cursoAcessivel('emc') === true,
  'quem tem o acesso nominal `curso:emc` foi barrado');
ok(mundo({ tier: 'gold', plano: '', admin: true }).cursoAcessivel('emc') === true,
  'o professor (admin) foi barrado do próprio curso');

// ── Quem NÃO pode ────────────────────────────────────────────────────────────
ok(mundo({ tier: 'gold', plano: '' }).cursoAcessivel('emc') === false,
  '⚠️ DEGUSTAÇÃO abriu o curso Gold inteiro — conteúdo pago de graça');
ok(mundo({ tier: 'gold', plano: 'standard' }).cursoAcessivel('emc') === false,
  '⚠️ plano STANDARD abriu curso de posto GOLD');

// ── Comportamento preservado dos cursos que já existiam ──────────────────────
ok(mundo({ tier: 'gold', plano: 'gold' }).cursoAcessivel('endo_essencial') === true,
  'regrediu: Gold perdeu o Endocrinologia Essencial');
ok(mundo({ tier: 'gold', plano: '' }).cursoAcessivel('endo_essencial') === false,
  'regrediu: não-Gold ganhou o Endocrinologia Essencial');
ok(mundo({ tier: 'gold', plano: 'gold' }).cursoAcessivel('avulso') === false,
  'curso SEM tier virou brinde de plano — ele exige acesso nominal');
ok(mundo({ tier: 'gold', plano: 'gold' }).cursoAcessivel('endoteem') === false,
  'curso de vitrine (SHOWCASE_ONLY) ficou acessível');

// ── Curso DESLIGADO (ativo=false): preparado, mas ainda não estreou ─────────
// 🧨 A RLS de `endodirect_cursos` deixa o ALUNO ler a linha desligada, e o
// catálogo dele não filtrava `ativo`. O card apareceria antes da estreia.
ok(mundo({ tier: 'gold', plano: 'gold', ativo: false }).cursoAcessivel('emc') === false,
  '⚠️ curso DESLIGADO abriu para assinante — ele ainda não estreou');
{
  const w = mundo({ tier: 'gold', plano: 'gold', ativo: false });
  ok(w.cursoAtivo('emc') === false, 'cursoAtivo não leu o `ativo=false` do catálogo');
  ok(w.aulaLiberada({ curso: 'emc', free: true }) === true,
    'a amostra grátis deveria continuar valendo por si (o servidor é quem entrega a aula)');
}

// ── A AMOSTRA GRÁTIS: a 1ª aula abre para quem não tem o curso ───────────────
// É o que converte: o não-assinante vê a aula 1 e só ela.
{
  const w = mundo({ tier: 'gold', plano: '' });
  ok(w.aulaLiberada({ curso: 'emc', free: true }) === true,
    '⚠️ a amostra grátis NÃO abriu para quem não assina — morre a conversão');
  ok(w.aulaLiberada({ curso: 'emc', free: false }) === false,
    '⚠️ aula NÃO marcada como amostra vazou para quem não assina');
  const g = mundo({ tier: 'gold', plano: 'gold' });
  ok(g.aulaLiberada({ curso: 'emc', free: false }) === true,
    'assinante Gold não recebeu as aulas normais do curso');
}

// ── Catálogo ainda não carregado: não pode virar passe livre ────────────────
{
  const ctx = vm.createContext({});
  vm.runInContext(
    trechoVar('SHOWCASE_ONLY_CURSOS') + '\nvar catalogoCursos=[];\nvar userAcessos=[];\n'
    + 'function isTestShowcase(){return false;}function isAdminUser(){return false;}\n'
    + 'function currentPlanKey(){return "gold";}function planRank(){return 2;}\n'
    + trechoVar('CURSO_RANK') + '\n' + corpo('cursoAtivo') + '\n' + corpo('cursoTier') + '\n' + corpo('cursoAcessivel'), ctx);
  ok(ctx.cursoAcessivel('emc') === false,
    'sem catálogo carregado o curso abriu — o portão tem de FECHAR na dúvida');
}

// ── Verificação por MUTAÇÃO ─────────────────────────────────────────────────
const MUTANTES = [
  ['ignora o tier (todo curso vira livre p/ quem tem plano)', (slug, w) => w.plano !== ''],
  ['ignora o plano (só olha acesso nominal)', (slug, w) => (w.acessos || []).indexOf('curso:' + slug) >= 0],
  ['sempre libera', () => true],
];
for (const [nome, mut] of MUTANTES) {
  const cenarios = [
    ['emc', { tier: 'gold', plano: 'gold' }, true],
    ['emc', { tier: 'gold', plano: '' }, false],
    ['emc', { tier: 'gold', plano: 'standard' }, false],
    ['avulso', { tier: 'gold', plano: 'gold' }, false],
  ];
  const pegou = cenarios.some(([slug, w, esperado]) => mut(slug, w) !== esperado);
  if (!pegou) falhas.push('mutação NÃO detectada: ' + nome);
}

// ── O ITEM DE MENU e o PORTÃO DO PAINEL ─────────────────────────────────────
// ⚠️ AQUI O FUNIL VIVE OU MORRE. O painel `cursos` NÃO está em
// DEGUSTACAO_PANELS: se a Educação Médica Continuada dependesse dele, quem está
// na degustação nem abriria a tela — e a "primeira aula grátis para quem se
// cadastrar" não seria alcançável por ninguém que não assina.
{
  const src = html;
  ok(/data-p="emc"[^>]*id="sb-emc"/.test(src) || /id="sb-emc"[^>]*data-p="emc"/.test(src),
    'sumiu o item de menu da Educação Médica Continuada');
  ok(/emc:'Educação Médica Continuada'/.test(src), 'o painel emc ficou sem rótulo (o breadcrumb mostraria "emc")');

  // canSeePanel('emc') tem de ser TRUE mesmo na degustação vencida.
  const ctx = vm.createContext({});
  vm.runInContext(
    'function isAdminUser(){return false;}function prescAllowed(){return false;}\n'
    + 'function isDegustacao(){return true;}function degExpired(){return true;}\n'
    + 'function muralTrialActive(){return false;}\n'
    + 'var DEGUSTACAO_PANELS={};var TRIAL_PANELS={};function trialLeft(){return 0;}\n'
    + corpo('canSeePanel'), ctx);
  ok(ctx.canSeePanel('emc') === true,
    '⚠️ o painel da EMC fechou para a degustação — o não-assinante não chega à aula grátis e o funil morre');
  ok(ctx.canSeePanel('cursos') === false,
    'o painel Cursos comum deveria seguir fechado na degustação vencida (só a EMC é porta de entrada)');

  // O item do menu: só aparece com a linha NO catálogo e LIGADA.
  function navVisivel(catalogo, admin) {
    const c2 = vm.createContext({});
    vm.runInContext(
      'var catalogoCursos=' + JSON.stringify(catalogo) + ';\n'
      + 'function isAdminUser(){return ' + (admin ? 'true' : 'false') + ';}\n'
      + 'var _display=null;\n'
      + 'var document={getElementById:function(){return {style:{set display(v){_display=v;},get display(){return _display;}}};}};\n'
      + corpo('emcAplicarNav') + '\nemcAplicarNav();', c2);
    return c2._display === '';
  }
  ok(navVisivel([{ slug: 'emc', ativo: true }]) === true, 'curso ligado e o item do menu não apareceu');
  ok(navVisivel([{ slug: 'emc', ativo: false }]) === false, 'curso DESLIGADO e o item do menu apareceu — estreia vazada');
  ok(navVisivel([]) === false,
    '⚠️ catálogo ainda não carregado e o item apareceu — levaria a uma tela vazia antes da estreia');
  ok(navVisivel([], true) === true, 'o professor (admin) precisa ver o item para preparar a estreia');

  // goPanel: `emc` reaproveita o painel de Cursos, já filtrado.
  const gp = src.slice(src.indexOf('function goPanel(id){'), src.indexOf('function goPanel(id){') + 1400);
  ok(/if\(id==='emc'\)\{cursoFilter='emc';/.test(gp),
    'goPanel deixou de filtrar o curso ao abrir a EMC — abriria o catálogo inteiro');
  ok(/menuAlvo/.test(gp), 'goPanel perdeu o `menuAlvo`: o item aceso e o `last_panel` voltariam a ser o de Cursos');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ curso por tier: Gold entra, standard e degustação não, amostra grátis abre só a aula liberada, e sem catálogo o portão fecha');
