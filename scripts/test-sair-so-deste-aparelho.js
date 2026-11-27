// Regressão: "Sair" encerra a sessão só do aparelho onde foi tocado.
// Professor, 27/11/2026, com print do iPhone na tela de entrar: "Está saindo do meu iPhone mesmo antes das 48h de
// inatividade. Será porque estou conectando e saindo do meu painel em alguns desktops diferentes?"
// Era isso: o `signOut()` sem escopo do supabase-js é 'global' e revoga a sessão de TODOS os aparelhos da conta.
// Sair num computador (ou a aba parada 48 h nele, que sai sozinha pelo mesmo doLogout) derrubava o iPhone assim
// que o token dele vencia. A troca de aparelho (onSessionEvicted) já usava 'local' desde 12/10.
// A única saída global que fica é a da troca de senha (handlePasswordRecovery): ali sair de todos é o certo.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }
function corpo(nome) {
  const i = html.indexOf('\nfunction ' + nome + '(');
  if (i < 0) throw new Error('função ausente no index.html: ' + nome);
  let n = 0;
  for (let k = html.indexOf('{', i); k < html.length; k++) {
    if (html[k] === '{') n++;
    else if (html[k] === '}') { n--; if (!n) return html.slice(i + 1, k + 1); }
  }
  throw new Error('chaves não fecham em ' + nome);
}

// 1) doLogout rodando de verdade: o que ele pede ao Supabase.
// Tudo o que a função toca e não interessa aqui (DOM, timers, outras rotinas) vira um "faz nada" que aceita
// qualquer chamada ou propriedade; só o cliente do Supabase e o Face ID são de verdade.
function rodaDoLogout(opts) {
  const chamadas = [];
  const cliente = { auth: { signOut(o) { chamadas.push(o === undefined ? 'sem escopo' : o); return Promise.resolve({ error: null }); } } };
  const nada = new Proxy(function () {}, {
    get: (alvo, p) => (p === Symbol.toPrimitive ? () => '' : p === 'then' ? undefined : nada),
    set: () => true,
    apply: () => nada,
  });
  const fixos = {
    getSupabaseClient: () => cliente,
    faceIdPlugin: () => (opts.faceId ? {} : null),
    faceIdConta: () => 'prof@exemplo.com',
    currentUser: { id: 'U1', email: 'prof@exemplo.com' },
    Promise, Date, Math, JSON, Object, Array, String, Number, Boolean, setTimeout, clearTimeout,
  };
  const sb = new Proxy(fixos, {
    has: () => true,
    get: (o, p) => (p in o ? o[p] : p === Symbol.unscopables ? undefined : nada),
    set: (o, p, v) => { o[p] = v; return true; },
  });
  const ctx = vm.createContext({ sb });
  vm.runInContext('with (sb) { (' + corpo('doLogout') + ')(); }', ctx);
  return chamadas;
}
const sair = rodaDoLogout({});
ok(sair.length === 1, '"Sair" deve pedir ao Supabase para encerrar a sessão uma vez (pediu ' + sair.length + ')');
ok(sair.length === 1 && sair[0] && sair[0].scope === 'local',
  '"Sair" deve encerrar só a sessão deste aparelho (scope:\'local\'); recebeu ' + JSON.stringify(sair[0]) +
  ' — sem escopo, o supabase-js derruba também o iPhone e os outros computadores da conta');
ok(rodaDoLogout({ faceId: true }).length === 0, 'com Face ID ligado, "Sair" só trava o app: não encerra a sessão no servidor');

// 2) A saída por inatividade (48 h) passa pelo mesmo doLogout.
ok(/left<=0\)\{[^}]*doLogout\(\)/.test(corpo('showSessionWarning')), 'a saída por inatividade deve usar o doLogout (e com ele o escopo local)');

// 3) Nenhum outro "sair" global, fora a troca de senha.
const globais = [];
const re = /\.auth\.signOut\(\s*\)/g;
let m;
while ((m = re.exec(html))) {
  const antes = html.slice(0, m.index);
  const fn = (antes.match(/\nfunction (\w+)\(/g) || []).pop() || '';
  if (!/handlePasswordRecovery/.test(fn)) globais.push(fn.trim() + ' (linha ' + antes.split('\n').length + ')');
}
ok(!globais.length, 'signOut() sem escopo (sai de todos os aparelhos) fora da troca de senha: ' + globais.join('; '));
ok(/\.auth\.signOut\(\s*\)/.test(corpo('handlePasswordRecovery')), 'depois de trocar a senha continua saindo de todos os aparelhos');
ok(/assine-logout[\s\S]{0,200}signOut\(\{scope:'local'\}\)/.test(html), 'o "Sair" da tela de assinatura também sai só deste aparelho');
ok(/signOut\(\{scope:'local'\}\)/.test(corpo('onSessionEvicted')), 'troca de aparelho: continua saindo só do aparelho removido');

if (falhas.length) {
  console.error('test-sair-so-deste-aparelho: ' + falhas.length + ' falha(s)\n- ' + falhas.join('\n- '));
  process.exit(1);
}
console.log('test-sair-so-deste-aparelho: ok ("Sair" e a saída por inatividade encerram só a sessão deste aparelho)');
