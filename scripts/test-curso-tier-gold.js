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

// ── O PORTÃO DO PAINEL ──────────────────────────────────────────────────────
// ⚠️ AQUI O FUNIL VIVE OU MORRE. A "primeira aula grátis para quem se cadastrar"
// só converte se quem NÃO assina conseguir abrir a tela onde ela está.
//
// 🧨 RETARGETADO EM 02/09/2026. Este bloco media o item de menu "Educação
// Médica Continuada" (`sb-emc`, `emcAplicarNav`) e o desvio `goPanel('emc')`.
// O professor mandou tirar o item: ele e "Cursos" levavam à MESMA tela, e o
// menu mostrava os dois. Só que aquele item era a ÚNICA porta da degustação
// para a aula-amostra, porque `cursos` não está em DEGUSTACAO_PANELS. A porta
// passou para o próprio painel `cursos`; o teste passou a medir a porta nova,
// não a antiga — e a exigir que a antiga não deixe restos.
{
  const src = html;

  // A porta: `cursos` aberto a todo mundo, inclusive à degustação VENCIDA
  // (mesma regra do `aovivo`), porque é por ela que se chega à aula-amostra.
  const ctx = vm.createContext({});
  vm.runInContext(
    'function isAdminUser(){return false;}function prescAllowed(){return false;}\n'
    + 'function isDegustacao(){return true;}function degExpired(){return true;}\n'
    + 'function muralTrialActive(){return false;}\n'
    + 'var DEGUSTACAO_PANELS={};var TRIAL_PANELS={};function trialLeft(){return 0;}\n'
    + corpo('canSeePanel'), ctx);
  ok(ctx.canSeePanel('cursos') === true,
    '🧨 o painel Cursos fechou para a degustação — sem o item de menu da EMC, que foi removido, o não-assinante não chega à aula-amostra e o funil morre');
  ok(ctx.canSeePanel('resu') === false,
    '⚠️ a abertura do painel Cursos vazou para outros painéis: a degustação vencida não deve ver Resumos');

  // ⚠️ ABRIR O PAINEL NÃO ABRE O CONTEÚDO — quem garante isso é `aulaLiberada`,
  // medido acima. Aqui só se confere que a porta existe.

  // A porta antiga não pode deixar restos: item de menu, função que o mostrava,
  // desvio de painel e rótulo. Estado lido sem quem o escreva é tela sem porta.
  ok(src.indexOf('sb-emc') < 0,
    '🧨 voltou o item de menu `sb-emc` — ele e "Cursos" levam à mesma tela, e foi por isso que o professor mandou tirar');
  ok(src.indexOf('emcAplicarNav') < 0,
    '🧨 sobrou `emcAplicarNav` no arquivo: função que mostra um botão que não existe mais');
  ok(!/id===.emc./.test(src),
    '🧨 sobrou um caminho de painel `emc` que nenhum controle aciona — é a tela sem porta que a guarda de 02/09 existe para impedir');
  ok(!/emc:'Educação Médica Continuada'/.test(src.slice(src.indexOf('var PANEL_LABELS='), src.indexOf('var PANEL_LABELS=') + 900)),
    '⚠️ sobrou o rótulo do painel `emc` em PANEL_LABELS, para um painel que não existe');
  // O nome do CURSO continua necessário — é outro mapa, e a EMC segue no catálogo.
  ok(/emc:'Educação Médica Continuada'/.test(src),
    '⚠️ o nome de reserva do curso `emc` sumiu junto: sem ele o card mostraria o slug cru');

  // goPanel continua marcando o item certo do menu.
  const gp = src.slice(src.indexOf('function goPanel(id){'), src.indexOf('function goPanel(id){') + 1400);
  ok(/menuAlvo/.test(gp), 'goPanel perdeu o `menuAlvo`: o item aceso e o `last_panel` sairiam errados');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ curso por tier: Gold entra, standard e degustação não, amostra grátis abre só a aula liberada, e sem catálogo o portão fecha');
