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
// Fechado dando identidade de verdade à vitrine. Em 30/10/2026 saíram também as
// contas de demonstração aluno@ e admin@: não há mais nenhuma conta local, e
// todo login passa pelo Supabase. Este teste guarda as três pontas: nenhuma
// senha no bundle, a rota especial fora do cliente, e todo login caindo no
// Supabase.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── 1. 🧨 NENHUMA SENHA LOCAL NO ARQUIVO SERVIDO ───────────────────────────
// Desde 30/10/2026 não há mais conta local: nem a vitrine (alunopro, saiu em
// 31/08), nem as contas de demonstração aluno@ e admin@. Este arquivo é servido
// a qualquer um — um `curl` na home devolvia as senhas.
{
  ['AlunoPro@2026', 'Aluno@2026', 'Admin@2026'].forEach((s) => {
    ok(html.indexOf(s) < 0, '🧨 a senha de demonstração ' + s + ' voltou ao index.html — este arquivo é servido a qualquer um');
  });
  const iU = html.indexOf('var USERS=[');
  const users = html.slice(iU, html.indexOf('\n];', iU));
  ok(!/pass:\s*'[^']+'/.test(users),
    '🧨 alguma conta de USERS voltou a ter senha em texto puro — todo login tem de passar pelo Supabase');
  // As contas de demonstração não podem voltar: mesmo sem senha, a restauração de
  // `demo_session` as ressuscitaria como conta LOCAL, sem sessão no servidor.
  ['alunopro@endodirect.com.br', 'aluno@endodirect.com.br', 'admin@endodirect.com.br'].forEach((e) => {
    ok(users.indexOf(e) < 0, '🧨 a conta de demonstração `' + e + '` voltou para `USERS` — tem de entrar pelo Supabase, não por atalho local');
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

// ── 3. 🧨 TODO LOGIN CAI NO SUPABASE — NÃO HÁ ATALHO LOCAL ─────────────────
// O atalho local é `USERS.find(email && pass && pass===digitada)`. Como nenhuma
// conta de USERS tem mais `pass`, ele nunca casa e o fluxo segue sempre para
// `signInWithPassword`. Exercitado de verdade, não conferido por texto.
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

  // Nenhuma conta local sobrou: TODO login cai no Supabase, não há atalho local.
  [['alunopro@endodirect.com.br', 'AlunoPro@2026'],
   ['admin@endodirect.com.br', 'Admin@2026'],
   ['aluno@endodirect.com.br', 'Aluno@2026']].forEach((par) => {
    const r = tentar(par[0], par[1]);
    ok(r.local === null,
      '🧨 ' + par[0] + ' entrou por atalho LOCAL, sem sessão no servidor — era essa a raiz do vazamento');
    ok(r.supabase === par[0],
      '⚠️ o login de ' + par[0] + ' não chegou ao `signInWithPassword`');
  });

  // Senha errada também cai no Supabase (que a recusa), nunca em atalho local.
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
console.log('✓ vitrine: sem contas locais (nenhuma senha no bundle, todo login pelo Supabase) e rota aberta desligada');
