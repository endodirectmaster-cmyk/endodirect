// AS DIRETRIZES E OS RESUMOS CHEGAM EM PÁGINAS — E NADA PARCIAL É APLICADO.
//
// ⚠️ 25/10/2026. `endodirect_member_resumos` entregava tudo numa resposta só (~3,2 MB
// para o assinante). A auditoria das Diretrizes (texto completo de cada uma, ~54 KB
// contra ~10 KB) levaria a resposta a ~6,3 MB, acima do limite empírico de ~5,3 MB
// em que ela deixa de chegar ao celular. Agora vem em páginas de 20 itens por
// `endodirect_member_resumos_pagina`, no desenho das questões.
//
// 🧨 O QUE ESTE TESTE PRENDE: (1) as páginas se juntam na ordem e só quando todas
// têm a mesma versão e somam o total; (2) versão trocada no meio recarrega uma vez
// e, se trocar de novo, vira erro sem aplicar nada; (3) cada página tenta 3× só em
// falha de rede; (4) servidor sem a função paginada cai na chamada única de antes;
// (5) troca de conta no meio descarta a carga; (6) lista vazia não apaga o que o
// aparelho tem; (7) o .sql: mesma lista de `endodirect_member_resumos()` (sem cópia
// da regra), 20 por página, versão md5, temas só na página 0 e execução para anon,
// authenticated e service_role; (8) os pontos de entrada do app continuam chamando
// carregarResumos com o nome da RPC antiga (o recurso).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(RAIZ, 'supabase', 'resumos-em-paginas.sql'), 'utf8');
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

const FUNCOES = ['carregarResumos', 'funcaoAusente', 'carregarPaginaResumos', 'carregarResumosPaginas', 'aplicarResumos', 'tentarResumos', 'erroDeRede', 'mesmaContaQue', 'contaAtual'];

// Servidor de mentira: a lista inteira, fatiada em páginas de 20 como o .sql.
function servidor(lista, opc) {
  opc = opc || {};
  const s = { chamadas: [], versao: opc.versao || 'v1', falhasRede: Object.assign({}, opc.falhasRede || {}), trocaVersaoEm: opc.trocaVersaoEm || [] };
  s.rpc = function (nome, args) {
    s.chamadas.push(nome + (args ? ':' + args.p_pagina : ''));
    if (nome === 'endodirect_member_resumos_pagina') {
      if (opc.semPaginada) return Promise.resolve({ data: null, error: { code: 'PGRST202', message: 'Could not find the function public.endodirect_member_resumos_pagina(p_pagina) in the schema cache' } });
      const p = args.p_pagina;
      if (s.falhasRede[p]) { s.falhasRede[p]--; return Promise.resolve({ data: null, error: { message: 'Failed to fetch' } }); }
      const n = s.chamadas.filter((c) => c.startsWith('endodirect_member_resumos_pagina')).length;
      const versao = s.trocaVersaoEm.includes(n) ? 'v-outra-' + n : s.versao;
      const por = 20, total = lista.length;
      return Promise.resolve({ data: { versao, total, por_pagina: por, paginas: Math.max(1, Math.ceil(total / por)), pagina: p, itens: lista.slice(p * por, (p + 1) * por), diretrizes_temas: p === 0 ? [] : null }, error: null });
    }
    if (nome === 'endodirect_member_resumos') return Promise.resolve({ data: { diretrizes: lista, diretrizes_temas: [] }, error: null });
    return Promise.resolve({ data: null, error: { message: 'rpc inesperada: ' + nome } });
  };
  return s;
}

function caixa(extra) {
  const ls = {};
  const c = Object.assign({
    console: { warn() {}, log() {} },
    Date, Number, Array, String, Promise, Object, Math,
    setTimeout: (fn) => { fn(); return 0; },
    lsSet: (k, v) => { ls[k] = v; },
    _ls: ls,
    currentUser: { id: 'U1', role: 'aluno' },
    dirMigrateSub: (s) => s,
  }, extra || {});
  vm.createContext(c);
  vm.runInContext('var sessaoEncerrada=false;var resumosErro=false;var RESUMOS_PAGINADA=' + JSON.stringify((html.match(/var RESUMOS_PAGINADA='([^']+)'/) || [])[1]) + ';var diretrizes=[{tema:"semente"}];\n'
    + FUNCOES.map(corpo).join('\n') + '\n;this.__get=function(){return {diretrizes:diretrizes,resumosErro:resumosErro};};', c);
  return c;
}
const lista = (n, pref) => Array.from({ length: n }, (_, i) => ({ tema: (pref || 'item') + ' ' + (i + 1), sub: 'Diabetes' }));

(async () => {
  // (1) 45 itens = 3 páginas, juntadas na ordem
  {
    const L = lista(45), s = servidor(L), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    const g = c.__get();
    ok(g.diretrizes.length === 45 && g.diretrizes[0].tema === 'item 1' && g.diretrizes[44].tema === 'item 45' && g.diretrizes[20].tema === 'item 21', 'páginas: 45 itens em 3 páginas, aplicados na ordem');
    ok(s.chamadas.filter((x) => x.startsWith('endodirect_member_resumos_pagina')).length === 3 && !s.chamadas.includes('endodirect_member_resumos'), 'páginas: 3 chamadas à função paginada e nenhuma à chamada única');
    ok(Array.isArray(c._ls.diretrizes) && c._ls.diretrizes.length === 45 && g.resumosErro === false, 'páginas: guarda no aparelho e zera o erro');
  }
  // (2a) versão trocada na 1ª carga → recarrega uma vez e aplica
  {
    const L = lista(45), s = servidor(L, { trocaVersaoEm: [3] }), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    const g = c.__get();
    ok(g.diretrizes.length === 45 && s.chamadas.length === 6 && g.resumosErro === false, 'versão: troca no meio recarrega uma vez e aplica a lista consistente');
  }
  // (2b) troca de novo na recarga → erro, nada aplicado
  {
    const L = lista(45), s = servidor(L, { trocaVersaoEm: [3, 6] }), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    const g = c.__get();
    ok(g.diretrizes.length === 1 && g.diretrizes[0].tema === 'semente' && g.resumosErro === true && !c._ls.diretrizes, 'versão: duas trocas seguidas viram erro e não aplicam nada parcial');
  }
  // (3) falha de rede em uma página: até 3 tentativas
  {
    const L = lista(45), s = servidor(L, { falhasRede: { 1: 2 } }), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    ok(c.__get().diretrizes.length === 45 && s.chamadas.filter((x) => x === 'endodirect_member_resumos_pagina:1').length === 3, 'rede: a página que caiu duas vezes é pedida 3× e a carga fecha');
    const s2 = servidor(L, { falhasRede: { 2: 3 } }), c2 = caixa();
    await c2.carregarResumos({ rpc: s2.rpc }, 'endodirect_member_resumos');
    ok(c2.__get().resumosErro === true && c2.__get().diretrizes[0].tema === 'semente' && s2.chamadas.filter((x) => x === 'endodirect_member_resumos_pagina:2').length === 3, 'rede: 3 quedas na mesma página viram erro, sem aplicar as outras');
  }
  // (4) servidor sem a função paginada → chamada única de antes
  {
    const L = lista(12), s = servidor(L, { semPaginada: true }), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    ok(c.__get().diretrizes.length === 12 && s.chamadas.includes('endodirect_member_resumos'), 'recurso: sem a função paginada, cai na chamada única e aplica');
  }
  // (5) troca de conta depois da página 0 → descartado
  {
    const L = lista(45), s = servidor(L), c = caixa();
    const rpc = (nome, args) => { const r = s.rpc(nome, args); if (args && args.p_pagina === 0) c.currentUser = { id: 'OUTRA' }; return r; };
    await c.carregarResumos({ rpc }, 'endodirect_member_resumos');
    ok(c.__get().diretrizes[0].tema === 'semente' && !c._ls.diretrizes, 'conta: trocou de conta no meio, nada da conta anterior é aplicado nem guardado');
  }
  // (6) lista vazia não apaga o que o aparelho tem
  {
    const s = servidor([]), c = caixa();
    await c.carregarResumos({ rpc: s.rpc }, 'endodirect_member_resumos');
    ok(c.__get().diretrizes[0].tema === 'semente', 'vazia: lista vazia não apaga as diretrizes do aparelho');
  }

  // (7) o .sql
  const semComent = (t) => t.replace(/--[^\n]*/g, '');
  const s7 = semComent(sql);
  ok(/create or replace function public\.endodirect_member_resumos_pagina\(p_pagina integer default 0\)/.test(s7), 'sql: define endodirect_member_resumos_pagina(p_pagina integer default 0)');
  ok(/security definer/.test(s7) && /set search_path to 'public'/.test(s7), 'sql: security definer com search_path fixo');
  ok(/select public\.endodirect_member_resumos\(\) as r/.test(s7) && !/endodirect_acessos_ativos|privado|rascunho/.test(s7), 'sql: a lista é a de endodirect_member_resumos() — a regra de acesso não é copiada');
  ok(/select 20 as por_pagina/.test(s7), 'sql: 20 itens por página');
  ok(/'versao',\s+md5\(\(select lista from l\)::text\)/.test(s7), 'sql: versão = md5 da lista inteira');
  ok(/'diretrizes_temas', case when \(select pagina from k\) = 0/.test(s7), 'sql: temas só na página 0');
  ok(/grant execute on function public\.endodirect_member_resumos_pagina\(integer\) to anon, authenticated, service_role;/.test(s7) && /revoke all on function public\.endodirect_member_resumos_pagina\(integer\) from public;/.test(s7), 'sql: execução para anon, authenticated e service_role, e nada para public');

  // (8) pontos de entrada e chamada paginada
  ok(/client\.rpc\(RESUMOS_PAGINADA,\{p_pagina:pagina\}\)/.test(corpo('carregarPaginaResumos')), 'app: a página é pedida pela função paginada com p_pagina');
  ok(/var RESUMOS_PAGINADA='endodirect_member_resumos_pagina';/.test(html), 'app: o nome da função paginada está fixado');
  ok((html.match(/carregarResumos\(client,'endodirect_member_resumos'\)/g) || []).length >= 2, 'app: os pontos de entrada seguem chamando carregarResumos com a RPC antiga (o recurso)');

  if (falhas.length) { console.error('✗ Diretrizes/Resumos em páginas:\n  - ' + falhas.join('\n  - ')); process.exit(1); }
  console.log('✓ Diretrizes/Resumos em páginas: juntam na ordem e só com a mesma versão, 3 tentativas por página, recurso à chamada única, conta trocada descartada, lista vazia não apaga, .sql sem cópia da regra');
})().catch((e) => { console.error(e); process.exit(1); });
