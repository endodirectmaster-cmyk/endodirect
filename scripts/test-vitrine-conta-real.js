// A VITRINE (alunopro) É CONTA REAL — e a senha não mora mais no bundle.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (31/08/2026). O professor pediu que a conta demo
// "se comporte como se fosse conta gold, mas não seja contabilizada e misturada
// com os alunos reais", e perguntou, olhando a tela de login: "essa conta demo
// não está aparecendo pra todo mundo assim, certo?".
//
// 🧨 O FORMULÁRIO NÃO A MOSTRAVA — O CÓDIGO-FONTE MOSTRAVA. `alunopro` era conta
// LOCAL do bundle, com `pass:'AlunoPro@2026'` em texto puro no index.html, que é
// servido a qualquer um: um `curl` na home devolvia a senha.
//
// 🧨 E A CONSEQUÊNCIA ERA ESTRUTURAL, não cosmética. Sem sessão no Supabase,
// **nenhum gate de servidor conseguia distinguir a vitrine de um visitante
// qualquer** — qualquer regra que ela passasse, um `curl` também passava. Foi
// exatamente isso que deixou `endodirect_showcase_resumos` aberta a `anon`,
// entregando 161 itens PRIVADOS de assinante a quem pedisse. Estava aberto
// desde 01/08/2026 e o cofre já registrava a causa desde 02/08.
//
// Fechado dando identidade de verdade à vitrine. Este teste guarda as três
// pontas: a senha fora do bundle, a rota especial fora do cliente, e o login
// caindo no Supabase — sem quebrar as outras contas locais, que dividem o
// mesmo fluxo (é a ressalva que o cofre faz: o login é compartilhado com o
// admin).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── 1. 🧨 NENHUMA SENHA DA VITRINE NO ARQUIVO SERVIDO ──────────────────────
{
  ok(html.indexOf('AlunoPro@2026') < 0,
    '🧨 a senha da vitrine voltou ao index.html — este arquivo é servido a qualquer um: `curl` na home a devolve');
  // A entrada inteira tem de sair, não só a senha: enquanto `alunopro` estiver
  // em USERS, a restauração de `demo_session` a ressuscita como conta local.
  const iU = html.indexOf('var USERS=[');
  const users = html.slice(iU, html.indexOf('\n];', iU));
  ok(users.indexOf('alunopro@endodirect.com.br') < 0,
    '🧨 `alunopro` voltou para `USERS` — mesmo sem senha, a restauração de `demo_session` a faria entrar como conta LOCAL, sem sessão no servidor');
  // As demais contas locais continuam: o professor usa `aluno@` (degustação) e
  // `admin@` no dia a dia, e elas não têm acesso a conteúdo de assinante.
  ['aluno@endodirect.com.br', 'admin@endodirect.com.br'].forEach((e) => {
    ok(users.indexOf(e) >= 0, '⚠️ a conta local `' + e + '` sumiu do bundle junto — não era para sair');
  });
}

// ── 2. A rota especial não é mais chamada pelo cliente ─────────────────────
// Enquanto o cliente a chamar, ela precisa existir aberta — e é essa abertura
// que vazava. O caminho da vitrine passou a ser o do assinante comum.
{
  const codigo = html.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  ok(codigo.indexOf('endodirect_showcase_resumos') < 0,
    '🧨 o cliente voltou a chamar `endodirect_showcase_resumos` — a rota que entregava 161 itens privados a anônimos');
  ok(/rpc='endodirect_member_resumos'/.test(codigo),
    'o recarregamento dos Resumos deixou de usar a rota comum de assinante');
}

// ── 3. 🧨 O LOGIN DA VITRINE CAI NO SUPABASE (e o do admin, não) ───────────
// O atalho local é `USERS.find(email && pass && pass===digitada)`. Com a
// vitrine fora da lista ele não casa, e o fluxo segue para
// `signInWithPassword`. ⚠️ O MESMO TRECHO ATENDE AS CONTAS DE ADMIN — o cofre
// avisa que mexer aqui é mexer no login delas. Por isso as duas pontas são
// exercitadas de verdade, não conferidas por texto.
{
  const iU = html.indexOf('var USERS=[');
  const usersSrc = html.slice(iU, html.indexOf('\n];', iU) + 3);
  const iL = html.indexOf('var doLoginAttempt=function(){');
  const corpo = html.slice(iL, html.indexOf('\n  };', iL) + 5);

  function tentar(email, pass) {
    const ctx = vm.createContext({ console });
    ctx.__res = { local: null, supabase: null, erro: null };
    vm.runInContext(
      usersSrc
      + 'var __campos={"login-email":{value:' + JSON.stringify(email) + '},'
      + '"login-pass":{value:' + JSON.stringify(pass) + '},"btn-login":{disabled:false}};'
      + 'var document={getElementById:function(id){return __campos[id]||null;}};'
      + 'var loggingOut=true;'
      + 'function clearLoginError(){}'
      + 'function showLoginError(m){__res.erro=m;}'
      + 'function lsSet(){}'
      + 'function doLogin(u){__res.local=u&&u.email;}'
      + 'function getSupabaseClient(){return {auth:{signInWithPassword:function(o){'
      + '  __res.supabase=o.email;return {then:function(f){return {catch:function(){return {then:function(){}};}};}};'
      + '}}};}'
      + corpo + '\ndoLoginAttempt();', ctx);
    return ctx.__res;
  }

  const vitrine = tentar('alunopro@endodirect.com.br', 'AlunoPro@2026');
  ok(vitrine.local === null,
    '🧨 a vitrine voltou a entrar por atalho LOCAL, sem sessão no servidor — é a raiz do vazamento: nenhum gate consegue distingui-la de um visitante');
  ok(vitrine.supabase === 'alunopro@endodirect.com.br',
    '⚠️ o login da vitrine não chegou ao `signInWithPassword` — ela não conseguiria entrar de jeito nenhum');

  // ⚠️ A OUTRA PONTA: as contas locais que sobraram NÃO podem ter quebrado.
  const admin = tentar('admin@endodirect.com.br', 'Admin@2026');
  ok(admin.local === 'admin@endodirect.com.br',
    '🧨 o login local do ADMIN parou de funcionar — é o risco que o cofre aponta ao mexer neste trecho');
  ok(admin.supabase === null, 'o login do admin local não devia ir para o Supabase');
  const degus = tentar('aluno@endodirect.com.br', 'Aluno@2026');
  ok(degus.local === 'aluno@endodirect.com.br', '⚠️ a conta de degustação parou de entrar');

  // Senha errada não pode virar atalho para ninguém.
  const errada = tentar('admin@endodirect.com.br', 'senha-errada');
  ok(errada.local === null, '🧨 senha errada entrou pelo atalho local');
}

// ── 4. A vitrine continua reconhecida como vitrine (cursos exclusivos) ─────
// `isTestShowcase()` é por E-MAIL, então segue valendo com a sessão real — é o
// que mantém os cursos de demonstração visíveis só para ela e para o professor.
{
  ok(/function isTestShowcase\(\)\{return String\(\(currentUser&&currentUser\.email\)\|\|''\)\.toLowerCase\(\)==='alunopro@endodirect\.com\.br';\}/.test(html),
    '⚠️ `isTestShowcase` mudou de critério — se deixar de ser por e-mail, para de valer com a sessão real e os cursos de vitrine somem dela');
  ok(/SHOWCASE_ONLY_CURSOS=\{endoteem:1,hiperglicemia:1,lipides:1\}/.test(html),
    'a lista de cursos exclusivos da vitrine mudou');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ vitrine: conta real (senha fora do bundle, login pelo Supabase), rota aberta desligada e contas locais restantes intactas');
