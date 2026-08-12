// Regressão: assinatura que vence sem renovar tem de APARECER no painel.
//
// ⚠️ O CASO REAL (11/08/2026). Uma assinante MENSAL venceu às 21h e o único sinal foi
// o contador de assinantes cair de 34 para 33 — o professor percebeu por acaso, ao
// notar que um assinante novo não tinha "somado". Não existe registro local de
// cobrança recorrente (`endodirect_assinaturas` está vazia): a verdade da renovação
// mora só no pagar.me.
//
// O sinal visível daqui é a linha ainda marcada `status='active'` com `expires_at` no
// PASSADO. Isso não distingue cancelamento de cobrança falhada — mas tira o evento da
// invisibilidade. ⚠️ A CTE `plano` da RPC FILTRA vencidos, então quem caducou sumia
// do painel por completo; por isso a RPC ganhou `expira_em`/`recorrente` por uma CTE
// que NÃO filtra por vencimento.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

function corpo(nome) {
  const i = html.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('função ' + nome + ' não encontrada');
  let d = 0;
  for (let j = html.indexOf('{', i); j < html.length; j++) {
    if (html[j] === '{') d++;
    else if (html[j] === '}') { d--; if (!d) return html.slice(i, j + 1); }
  }
  throw new Error('não fechou ' + nome);
}

const ctx = {};
vm.createContext(ctx);
vm.runInContext(
  'var admEstData=null;' +
  html.match(/var ADM_VENCE_EM_DIAS = \d+;/)[0] + '\n' +
  corpo('admVencimentoInfo') + '\n' + corpo('admVencidasLista'), ctx);

const dia = 864e5;
const em = (d) => new Date(Date.now() + d * dia).toISOString();
function set(students) { ctx.admEstData = { students: students }; }
const lista = () => vm.runInContext('admVencidasLista()', ctx);

// 1) ⚠️ O CASO DO PROFESSOR: mensal que venceu ontem tem de aparecer.
set([{ email: 'venceu@x', plano: 'Gold', expira_em: em(-1), recorrente: true }]);
ok(lista().length === 1, 'REGRESSÃO: assinatura mensal já vencida TEM de aparecer no painel');
ok(lista()[0].v.dias <= 0, 'a vencida tem de ser marcada como vencida (dias <= 0)');

// 2) Quem vence dentro da janela entra; quem vence depois, não.
set([
  { email: 'hoje@x', plano: 'Gold', expira_em: em(0.2), recorrente: true },
  { email: 'em3@x', plano: 'Gold', expira_em: em(3), recorrente: true },
  { email: 'em30@x', plano: 'Gold', expira_em: em(30), recorrente: true },
  { email: 'anual@x', plano: 'Gold', expira_em: em(300), recorrente: false }
]);
const l2 = lista().map((x) => x.e.email);
ok(l2.indexOf('em3@x') >= 0, 'quem vence em 3 dias tem de aparecer');
ok(l2.indexOf('em30@x') < 0 && l2.indexOf('anual@x') < 0,
   'quem vence longe NÃO pode poluir a lista (veio ' + JSON.stringify(l2) + ')');

// 3) ⚠️ Ordem: o mais urgente primeiro — a lista existe para agir.
set([
  { email: 'em5@x', plano: 'Gold', expira_em: em(5), recorrente: true },
  { email: 'venceu10@x', plano: 'Gold', expira_em: em(-10), recorrente: true },
  { email: 'venceu1@x', plano: 'Gold', expira_em: em(-1), recorrente: true }
]);
ok(JSON.stringify(lista().map((x) => x.e.email)) === JSON.stringify(['venceu10@x', 'venceu1@x', 'em5@x']),
   'a lista tem de vir da mais vencida para a que vence depois');

// 4) Quem não tem assinatura (degustação) não entra, e data inválida não quebra.
set([
  { email: 'degusta@x', plano: 'Degustação' },
  { email: 'semdata@x', plano: 'Gold', expira_em: null },
  { email: 'lixo@x', plano: 'Gold', expira_em: 'nao-e-data' }
]);
ok(lista().length === 0, 'sem vencimento (ou com data inválida) ninguém entra na lista');

// 4b) ⚠️ CONTRATO da função, não só o efeito no filtro: data inválida devolve NULL.
//     A 1ª versão desta guarda só olhava a lista final — e o mutante que removia a
//     checagem de data inválida SOBREVIVEU, porque NaN falha toda comparação e o item
//     caía fora por acidente. Acidente não é garantia: quem mudar o operador do filtro
//     depois herda um NaN solto (que também desestabiliza o sort).
{
  const info = vm.runInContext('admVencimentoInfo', ctx);
  ok(info({ expira_em: 'nao-e-data' }) === null, 'data inválida tem de devolver null, não um NaN disfarçado');
  ok(info({ expira_em: null }) === null && info({}) === null && info(null) === null,
     'sem data, a função devolve null em vez de quebrar');
  const bom = info({ expira_em: em(-2), recorrente: true });
  ok(bom && !isNaN(bom.ms) && bom.dias === -2 && bom.recorrente === true,
     'data válida devolve ms, dias e o ciclo (veio ' + JSON.stringify(bom) + ')');
}

// 5) Lista vazia / dados ausentes não quebram.
ctx.admEstData = null;
ok(lista().length === 0, 'sem dados carregados, a lista é vazia e não quebra');

// ── Ligações ────────────────────────────────────────────────────────────────────
ok(/html\+=admVencidasCardHTML\(\);/.test(html), 'o card tem de estar ligado na tela de Estudantes');
ok(/function admVencidasCardHTML/.test(html), 'o card precisa existir');
// ⚠️ A lista sozinha induz à conclusão errada: vencer não prova que a cobrança falhou.
ok(/pagou e perdeu o acesso/.test(html) && /pagar\.me distingue/.test(html),
   'o card tem de dizer que só o pagar.me distingue cancelamento de cobrança falhada');
ok(/Cortesias não entram/.test(html), 'o card tem de deixar claro que cortesia não conta');

if (falhas.length) {
  console.error('✗ assinatura vencida:');
  falhas.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✓ assinatura vencida: a renovação que não entrou aparece no painel, na ordem de urgência');
