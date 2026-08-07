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
const js = fatia('var CURSO_GLIFOS={', 'function renderCursosAluno(){', 'bloco das capas');  // inclui cursoCapaReal + cursoCapaHTML
const nomes = fatia('var CURSO_NOME_FALLBACK=', 'function loadCursoCatalogo(', 'cursoNomeBySlug');
const caixa = {
  esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  safeHttpUrl: (u) => /^https?:\/\//i.test(String(u || '').trim()),
  catalogoCursos: [],
  // aulas de mentira nos MESMOS formatos que estão no banco hoje
  admCursos: [
    { curso: 'endo_essencial', src: 'https://vimeo.com/1199272118?share=copy' },
    { curso: 'endo_essencial', src: 'https://vz-1196f9a8-6ea.b-cdn.net/77f6d123-91c7-4f8a-9888-47c17609a293/playlist.m3u8' },
    { curso: 'endoteem', src: 'https://player.mediadelivery.net/play/680513/37be5953-3d7c-4010-9412-e4c45127283b' },
    { curso: 'endoteem', src: 'https://vz-f9c42905-205.b-cdn.net/d01bcc6b-42b0-428f-895a-4daa14df3563/playlist.m3u8' },
    { curso: 'lipides', src: 'https://vimeo.com/999' }
  ]
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
ok(!/javascript:/i.test(sujo), 'a URL javascript: vazou para o HTML da capa');
// O que importa não é a palavra "onerror" aparecer — escapada, ela é texto
// inerte, e a capa tem um `onerror` LEGÍTIMO (o que troca a foto pelo desenho).
// O que não pode é a ASPA da URL fechar o src e abrir um atributo novo: isso
// apareceria como um SEGUNDO onerror e como um src cortado no meio.
const injecao = caixa.cursoCapaHTML('X', 'x', 'https://e.com/"onerror="alert(1)', 78, false);
const src = injecao.match(/src="([^"]*)"/);
ok(src && src[1] === 'https://e.com/&quot;onerror=&quot;alert(1)',
  'a aspa da URL da capa não foi escapada — o src fechou antes da hora: ' + JSON.stringify(src && src[1]));
// Contar "onerror=" no texto cru não serve: escapado, ele aparece DENTRO do
// valor do src e o teste acusaria injeção onde não há. Tira os valores entre
// aspas primeiro — o que sobrar são atributos de verdade.
const semValores = injecao.replace(/="[^"]*"/g, '=""');
ok((semValores.match(/onerror=/g) || []).length === 1,
  'apareceu um onerror FORA de valor de atributo — a URL conseguiu injetar atributo');

// ── 4b. miniatura REAL da aula (Bunny) ──────────────────────────────────────
// O professor pediu "imagens mais reais". A fonte é o quadro da aula dele
// mesmo, derivado do playlist.m3u8 que já está gravado. Se este trecho quebrar,
// a capa volta a ser só desenho SEM ninguém perceber — daí o teste.
ok(caixa.cursoCapaReal('endo_essencial') === 'https://vz-1196f9a8-6ea.b-cdn.net/77f6d123-91c7-4f8a-9888-47c17609a293/thumbnail.jpg',
  'não derivou a miniatura da 1ª aula do Bunny em endo_essencial (a 1ª aula é do Vimeo e tem de ser pulada)');
ok(caixa.cursoCapaReal('endoteem') === 'https://vz-f9c42905-205.b-cdn.net/d01bcc6b-42b0-428f-895a-4daa14df3563/thumbnail.jpg',
  'não derivou a miniatura do Bunny em endoteem (o embed mediadelivery tem de ser pulado)');
ok(caixa.cursoCapaReal('lipides') === '', 'curso só com Vimeo não devia render miniatura');
ok(caixa.cursoCapaReal('hiperglicemia') === '', 'curso sem aula não devia render miniatura');

// A foto entra POR CIMA do desenho, e o desenho continua lá: é o que evita capa
// quebrada quando a miniatura não existe.
const comFoto = caixa.cursoCapaHTML('Endocrinologia Essencial', 'endo_essencial', '', 78, false);
ok(/<svg/.test(comFoto), 'o desenho sumiu quando há foto — sem ele, miniatura ausente vira capa quebrada');
ok(/onerror="this.remove\(\)"/.test(comFoto), 'a foto não tem onerror — miniatura ausente deixaria ícone de imagem quebrada');
ok(/cc-img/.test(comFoto), 'a foto do Bunny não foi aplicada');
// A capa do professor tem prioridade sobre a miniatura da aula.
ok(/src="https:\/\/meu\.site\/capa\.jpg"/.test(caixa.cursoCapaHTML('Endocrinologia Essencial', 'endo_essencial', 'https://meu.site/capa.jpg', 78, false)),
  'a imagem própria do professor devia ganhar da miniatura da aula');

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
