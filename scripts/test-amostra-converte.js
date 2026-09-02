// A AMOSTRA GRÁTIS PRECISA FAZER O PEDIDO.
//
// ⚠️ POR QUE ESTE TESTE EXISTE (02/09/2026). O professor ligou a Educação
// Médica Continuada e explicou o objetivo: *"a ideia é utilizar essa aula para
// conversão de mais alunos para o plano gold"*. O cofre registra o desenho
// desde 24/08 — aula mensal do Gold, primeira aberta a qualquer cadastrado.
//
// 🧨 O FUNIL TINHA ISCA E NÃO TINHA ANZOL. O card dizia "🎁 amostra grátis", o
// aluno abria, assistia — e acabava ali. A lista de aulas FILTRA por
// `aulaLiberada`, então a aula que ele não pode ver simplesmente não existe na
// tela: nenhuma frase dizendo que o programa continua, nenhum botão para
// assinar. Um recurso de conversão que nunca faz o pedido não converte.
//
// ⚠️ E O CONVITE NÃO PODE MENTIR: o posto sai do `tier` do catálogo (não de um
// slug preso no código — lição de 24/08), o texto sai da `descricao` que o
// professor escreve, e a contagem de aulas presas é contada na hora.
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
function linhaVar(nome) {
  const m = html.match(new RegExp('^var ' + nome + '=.*$', 'm'));
  if (!m) throw new Error('var ausente: ' + nome);
  return m[0];
}

const caixa = { console };
vm.createContext(caixa);
vm.runInContext([
  linhaVar('CURSO_RANK'), linhaVar('SHOWCASE_ONLY_CURSOS'), linhaVar('TIER_NOME'),
  linhaVar('CURSO_NOME_FALLBACK'),
  corpo('esc'), corpo('cursoNomeBySlug'), corpo('cursoTier'), corpo('cursoAtivo'),
  corpo('isAdminUser'), corpo('isTestShowcase'), corpo('currentPlanKey'), corpo('planRank'),
  corpo('cursoAcessivel'), corpo('aulaLiberada'), corpo('cursoTemLiberada'),
  corpo('cursoDescricao'), corpo('cursoAmostraCTA'),
].join('\n'), caixa);

// O estado real de 02/09: EMC ligado, tier gold, 1 aula marcada como amostra.
const CATALOGO = [
  { slug: 'emc', nome: 'Educação Médica Continuada', tier: 'gold', ativo: true,
    descricao: 'Uma aula nova por mês sobre os temas que mudam a prática em endocrinologia.' },
  { slug: 'avulso', nome: 'Curso à Parte', tier: null, ativo: true, descricao: '' },
];
function cenario(acessos, aulas) {
  caixa.catalogoCursos = JSON.parse(JSON.stringify(CATALOGO));
  caixa.admCursos = aulas;
  caixa.userAcessos = acessos;
  caixa.currentUser = { role: 'aluno', email: 'aluno@exemplo.com' };
  return caixa.cursoAmostraCTA('emc');
}
const HOJE = [{ curso: 'emc', free: true, title: 'Massa magra' }];
const OUTUBRO = HOJE.concat([{ curso: 'emc', free: false, title: 'Aula 2' },
                             { curso: 'emc', free: false, title: 'Aula 3' }]);

// ── 1. Quem só prova é convidado ─────────────────────────────────────────
{
  const deg = cenario([], HOJE);
  ok(deg, '🧨 a degustação assiste à amostra e não recebe convite nenhum — o funil morre depois da isca');
  ok(/plano Gold/.test(deg), '🧨 o convite não nomeia o plano que abre o resto do programa');
  ok(/data-curso-upsell="1"/.test(deg),
    '🧨 o convite não tem botão — `[data-curso-upsell]` é o que abre a tela de planos (mesmo caminho do card bloqueado)');
  ok(/Uma aula nova por mês/.test(deg),
    '⚠️ a descrição que o professor escreveu no catálogo não aparece no convite');

  const std = cenario(['plano:standard'], HOJE);
  ok(std && /plano Gold/.test(std),
    '🧨 o assinante Standard — que também só vê a amostra — não é convidado ao Gold');
}

// ── 2. Quem já tem NÃO é convidado a comprar de novo ─────────────────────
{
  ok(cenario(['plano:gold'], HOJE) === '',
    '🧨 o assinante Gold é convidado a assinar o que já paga');
  caixa.currentUser = { role: 'admin', email: 'admin@endodirect.com.br' };
  ok(caixa.cursoAmostraCTA('emc') === '', '⚠️ o convite aparece para o admin');
}

// ── 3. O convite conta a verdade sobre o que falta ───────────────────────
// Hoje só existe a aula 1: não há o que dizer que está preso. Em outubro, sim.
{
  const hoje = cenario([], HOJE);
  ok(!/aula[s]? deste programa/.test(hoje),
    '🧨 o convite anuncia aulas presas quando não há nenhuma — promessa de conteúdo que não existe');

  const out = cenario([], OUTUBRO);
  ok(/<b>2 aulas<\/b> deste programa/.test(out),
    '🧨 a contagem de aulas presas saiu errada: ' + (out.match(/<b>[^<]*<\/b> deste programa/) || ['(nenhuma)'])[0]);
  const uma = cenario([], HOJE.concat([{ curso: 'emc', free: false, title: 'Aula 2' }]));
  ok(/<b>1 aula<\/b> deste programa está esperando/.test(uma),
    '⚠️ o singular quebrou com uma aula presa só');
}

// ── 4. Curso fora dos planos não vira promessa de plano ──────────────────
{
  caixa.currentUser = { role: 'aluno', email: 'aluno@exemplo.com' };
  caixa.userAcessos = [];
  caixa.admCursos = [{ curso: 'avulso', free: true, title: 'Amostra' }];
  ok(caixa.cursoAmostraCTA('avulso') === '',
    '🧨 curso sem `tier` gerou convite a um plano — nenhum plano o inclui, seria promessa falsa');
  ok(caixa.cursoAmostraCTA('') === '' && caixa.cursoAmostraCTA(null) === '',
    '⚠️ curso vazio devolveu convite');
}

// ── 5. O posto vem do CATÁLOGO, não de um slug no código ─────────────────
// Lição de 24/08: `if(slug==='endo_essencial')` fazia todo curso novo depender
// de mexer no index.html.
{
  caixa.catalogoCursos = [{ slug: 'emc', nome: 'EMC', tier: 'standard', ativo: true, descricao: '' }];
  caixa.admCursos = HOJE;
  caixa.userAcessos = [];
  const cta = caixa.cursoAmostraCTA('emc');
  ok(/plano Standard/.test(cta) && !/plano Gold/.test(cta),
    '🧨 o convite ignora o `tier` do catálogo — trocar o curso de pacote no painel deixaria o texto mentindo');
  ok(corpo('cursoAmostraCTA').indexOf("'emc'") < 0 && corpo('cursoAmostraCTA').indexOf('"emc"') < 0,
    '🧨 o slug `emc` foi preso dentro de `cursoAmostraCTA` — todo curso novo passaria a depender de editar o index.html');
}

// ── 6. O convite está NA TELA, nos dois níveis do curso ──────────────────
// Escrever a função e não chamá-la é o modo silencioso de não entregar nada.
{
  const chamadas = (html.match(/cursoAmostraCTA\(cursoFilter\)/g) || []).length;
  ok(chamadas === 2,
    '🧨 o convite é montado em ' + chamadas + ' lugar(es) da tela de cursos — eram 2 (grade de subespecialidades e lista de aulas)');
  ok(/\[data-curso-upsell\]/.test(html),
    '⚠️ sumiu o tratador de `[data-curso-upsell]` — o botão do convite não abriria a tela de planos');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ amostra converte: quem só prova recebe o convite ao plano certo, com a contagem real de aulas presas, e quem já paga não é convidado');
