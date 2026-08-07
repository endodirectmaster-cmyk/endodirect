// Regressão: capa dos cursos (painel do aluno E do professor).
//
// Pedido do professor (07/08/2026): "Depois deixa uma imagem mais bonitinha para
// cada um dos cursos, tanto no painel do professor quanto do aluno" — e, vendo o
// resultado do primeiro corte, "Porque está muito feio esses ícones".
//
// Antes, TODO curso saía com o mesmo 🎓 cinza: quatro cards idênticos. Duas
// coisas quebram esse conserto sem quebrar teste nenhum, e é o que se trava aqui:
//
//  1. VOLTAR AO EMOJI. Emoji é desenhado por cada sistema operacional (o 🩸 do
//     Windows não é o do iPhone) e destoa do resto da interface. As capas são
//     SVG de traço, iguais em qualquer aparelho.
//  2. DOIS CURSOS COM O MESMO DESENHO. Se uma regex nova cobrir demais (ou uma
//     antiga deixar de casar), duas subespecialidades passam a dividir o mesmo
//     glifo e volta-se ao problema original — cards que não se distinguem.
//
// E o defeito que apareceu junto: o card mostrava o SLUG CRU ("endo_essencial")
// quando o catálogo do banco não tinha chegado. Nome técnico na tela do aluno
// parece defeito, então cursoNomeBySlug nunca mais devolve slug.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
function ok(cond, msg) { if (!cond) falhas.push(msg); }

function fatia(inicio, fim, rotulo) {
  const a = html.indexOf(inicio);
  if (a < 0) throw new Error('não achei o início de ' + rotulo + ' no index.html');
  const b = html.indexOf(fim, a);
  if (b < 0) throw new Error('não achei o fim de ' + rotulo + ' no index.html');
  return html.slice(a, b);
}

// ── carrega os helpers reais do index.html num sandbox ─────────────────────
const js = fatia('var CURSO_GLIFOS={', 'function renderCursosAluno(){', 'bloco das capas');
const nomes = fatia('var CURSO_NOME_FALLBACK=', 'function loadCursoCatalogo(', 'cursoNomeBySlug');
const caixa = {
  esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  safeHttpUrl: (u) => /^https?:\/\//i.test(String(u || '').trim()),
  catalogoCursos: []
};
vm.createContext(caixa);
vm.runInContext(js + '\n' + nomes, caixa);

// ── 1. nenhum emoji nas capas ──────────────────────────────────────────────
// Faixa de emoji + os símbolos de gênero que eu tinha usado (♂️/🏳️‍⚧️).
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
for (const k of Object.keys(caixa.CURSO_GLIFOS)) {
  ok(!EMOJI.test(caixa.CURSO_GLIFOS[k]), `o glifo "${k}" tem emoji — a capa tem de ser SVG de traço`);
  ok(/^<(path|circle)\s/.test(caixa.CURSO_GLIFOS[k]), `o glifo "${k}" não começa com <path>/<circle>`);
}

// ── 2. um desenho DIFERENTE por subespecialidade ───────────────────────────
const vistos = new Map();
for (const t of caixa.CURSO_TEMAS) {
  const g = caixa.CURSO_GLIFOS[t.k];
  ok(!!g, `o tema ${t.re} aponta para o glifo "${t.k}", que não existe em CURSO_GLIFOS`);
  if (vistos.has(t.k)) falhas.push(`dois temas dividem o glifo "${t.k}" — os cards ficam iguais de novo`);
  vistos.set(t.k, t.re);
  ok(Array.isArray(t.g) && t.g.length === 2 && t.g.every((c) => /^#[0-9a-f]{6}$/i.test(c)),
    `o tema ${t.re} não tem um par de cores hex válido`);
}

// ── 3. os cursos REAIS caem cada um no seu tema ────────────────────────────
// (os quatro do supabase-setup.sql; se um deixar de casar, volta ao capelo)
const REAIS = [
  ['Hiperglicemia Hospitalar', 'hiperglicemia', 'gota'],
  ['Lípides', 'lipides', 'coracao'],
  ['Endocrinologia Essencial', 'endo_essencial', 'livro'],
  ['EndoTEEM 2026', 'endoteem', 'medalha']
];
const cores = new Set();
for (const [nome, slug, glifo] of REAIS) {
  const c = caixa.cursoCapa(nome, slug);
  ok(c.svg === caixa.CURSO_GLIFOS[glifo], `"${nome}" devia usar o glifo "${glifo}" e não usa`);
  cores.add(c.g.join('|'));
}
ok(cores.size === REAIS.length, 'dois cursos reais receberam o MESMO gradiente — os cards não se distinguem');

// Curso sem tema conhecido: capelo + gradiente ESTÁVEL (mesma cor toda vez).
const a1 = caixa.cursoCapa('Curso inventado', 'curso_x');
const a2 = caixa.cursoCapa('Curso inventado', 'curso_x');
ok(a1.svg === caixa.CURSO_GLIFOS.capelo, 'curso sem tema devia cair no capelo');
ok(a1.g.join() === a2.g.join(), 'o gradiente do curso sem tema mudou entre duas chamadas — não é estável');

// ── 4. o HTML da capa ──────────────────────────────────────────────────────
const capa = caixa.cursoCapaHTML('Lípides', 'lipides', '', 78, false);
ok(/class="curso-capa"/.test(capa), 'a capa perdeu a classe .curso-capa');
ok(/--cg1:#[0-9a-f]{6};--cg2:#[0-9a-f]{6}/i.test(capa), 'a capa não injeta o par de cores em --cg1/--cg2');
ok(/<svg viewBox="0 0 24 24"/.test(capa), 'a capa não desenha o SVG');
ok(/height:78px/.test(capa), 'a capa ignorou a altura pedida');

// Curso bloqueado: dessatura, NÃO some (o aluno precisa ver que existe).
ok(/class="curso-capa cc-off"/.test(caixa.cursoCapaHTML('Lípides', 'lipides', '', 78, true)),
  'a capa do curso bloqueado não recebe .cc-off');

// Imagem própria do professor: só http(s), e escapada.
ok(/<img class="cc-img" src="https:\/\/ex\.com\/a\.jpg"/.test(caixa.cursoCapaHTML('X', 'x', 'https://ex.com/a.jpg', 78, false)),
  'a capa não usa a imagem própria quando o link é https');
const sujo = caixa.cursoCapaHTML('X', 'x', 'javascript:alert(1)', 78, false);
ok(!/cc-img/.test(sujo) && /<svg/.test(sujo), 'link não-http virou <img> — tem de cair no desenho gerado');
// O que importa não é a palavra "onerror" aparecer — escapada, ela é texto
// inerte. É a ASPA não fechar o atributo src e abrir um atributo novo.
const injecao = caixa.cursoCapaHTML('X', 'x', 'https://e.com/"onerror="alert(1)', 78, false);
ok(/&quot;/.test(injecao) && !/"\s*onerror/i.test(injecao),
  'a aspa da URL da capa não foi escapada — dá para fechar src=" e injetar atributo');

// ── 5. nunca mostrar o slug cru ────────────────────────────────────────────
caixa.catalogoCursos = [];   // catálogo do banco ainda não chegou
ok(caixa.cursoNomeBySlug('endo_essencial') === 'Endocrinologia Essencial',
  'sem catálogo, "endo_essencial" tem de virar "Endocrinologia Essencial"');
ok(caixa.cursoNomeBySlug('endoteem') === 'EndoTEEM 2026',
  'sem catálogo, "endoteem" tem de virar "EndoTEEM 2026"');
ok(caixa.cursoNomeBySlug('curso_novo_2027') === 'Curso Novo 2027',
  'curso fora da lista devia virar "Curso Novo 2027", e veio ' + JSON.stringify(caixa.cursoNomeBySlug('curso_novo_2027')));
ok(caixa.cursoNomeBySlug('') === '', 'slug vazio devia devolver string vazia');
caixa.catalogoCursos = [{ slug: 'endoteem', nome: 'EndoTEEM 2027' }];
ok(caixa.cursoNomeBySlug('endoteem') === 'EndoTEEM 2027',
  'o catálogo do banco tem de prevalecer sobre a lista fixa');

// ── 6. as duas telas usam a capa (e o emoji sumiu das duas) ────────────────
const aluno = fatia('function aTile(slug,nome,n,capa){', 'var allCount=', 'aTile do aluno');
ok(/cursoCapaHTML\(nome,slug,capa,78,true\)/.test(aluno), 'o card bloqueado do aluno não usa cursoCapaHTML');
ok(/cursoCapaHTML\(nome,slug,capa,78,false\)/.test(aluno), 'o card liberado do aluno não usa cursoCapaHTML');
ok(!EMOJI.test(aluno.replace(/🔒|🎁/g, '')), 'sobrou emoji decorativo no card do aluno');

const prof = fatia("verHTML='<div style=\"font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:.6rem\">Escolha um curso para abrir",
  '}else if(!admCursoMod){', 'grade de cursos do professor');
ok(/cursoCapaHTML\(nm,cc\.slug,cc\.capa,86,false\)/.test(prof), 'a grade do professor não usa cursoCapaHTML');
ok(!/dsb-ico">🎓/.test(prof), 'a grade do professor ainda tem o 🎓 genérico');

// ── 7. o CSS que a capa precisa ────────────────────────────────────────────
for (const regra of ['.curso-capa{', '.curso-capa::after{', '.curso-capa svg{', '.curso-capa .cc-img{', '.curso-capa.cc-off{', '.curso-tile{']) {
  ok(html.indexOf(regra) >= 0, 'falta a regra CSS ' + regra);
}
// Largura ELÁSTICA: com largura fixa de 176px não cabiam dois cards num celular.
const cssTile = fatia('.curso-tile{', '}', '.curso-tile');
ok(/flex:1 1 \d+px/.test(cssTile) && /max-width:\d+px/.test(cssTile),
  '.curso-tile voltou a ter largura fixa — no celular fica um card por linha');

// ── 8. o catálogo é buscado quando falta (era só para admin) ───────────────
const render = fatia('function renderCursosAluno(){', 'function aTile(', 'renderCursosAluno');
ok(/cursoCatPedido/.test(render) && /loadCursoCatalogo\(/.test(render),
  'renderCursosAluno não busca o catálogo quando ele está vazio — o aluno fica sem os cursos sem aula');
ok(html.indexOf('var cursoCatPedido=false;') >= 0, 'falta a trava cursoCatPedido (evita laço de re-render)');

if (falhas.length) {
  console.error('✗ capa dos cursos:\n- ' + falhas.join('\n- '));
  process.exit(1);
}
console.log('✓ capa dos cursos: SVG (sem emoji), um desenho por subespecialidade, aluno e professor iguais, sem slug cru');
