#!/usr/bin/env node
// QUESTÃO DO DIA → BANCO DE QUESTÕES (13/11/2026).
//
// Professor: "Com relação às questões do dia, automaticamente, à medida que elas forem subindo
// para a plataforma e forem lançadas, forem postadas, serem incorporadas automaticamente no banco
// de questões. Isso já vale para as questões anteriores que já foram postadas."
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - as duas cópias da regra (painel: index.html; robô das 10h: lib/instagram.js) divergirem
//    e o Banco receber questões em formatos diferentes conforme quem postou;
//  - postar de novo (Reabrir → corrigir → Postada) DUPLICAR a questão no Banco;
//  - questão reaberta continuar no Banco como se estivesse postada;
//  - questão do TEEM entrar como "Endodirect" (vazando o acesso restrito do TEEM);
//  - o robô repor no Banco a questão que o professor apagou de lá;
//  - o robô salvar sem o Banco em mãos e gravar um Banco só com as questões do dia;
//  - o filtro "Subespecialidade" do Banco não oferecer a área da questão (Lípides,
//    Endocrinologia Básica, Endocrinopatias ficavam de fora da lista fixa).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const libSrc = fs.readFileSync(path.join(raiz, 'lib', 'instagram.js'), 'utf8');
let bad = 0;
const ok = (n, c) => { if (!c) { bad++; console.log('  ✗ ' + n); } };
function corpoDe(src, nome) {
  const i = src.indexOf('function ' + nome + '(');
  if (i < 0) return '';
  let j = src.indexOf('{', i), n = 0;
  for (; j < src.length; j++) { if (src[j] === '{') n++; else if (src[j] === '}') { n--; if (!n) break; } }
  return src.slice(i, j + 1);
}
const corpo = (nome) => corpoDe(html, nome);

// ── 1. As duas cópias são a MESMA regra ──────────────────────────────────────────────────
const cli = corpo('qotdNoBanco'), srv = corpoDe(libSrc, 'qotdNoBanco');
ok('qotdNoBanco existe no painel e no robô', !!cli && !!srv);
// O fonte do robô escapa a barra do regex dentro do template do gerador? Não: é JS puro.
ok('🧨 cópias idênticas, letra por letra (painel × robô)', cli === srv);

const ctxCli = vm.createContext({ JSON, Date, Object, String, Array });
vm.runInContext(cli + '\n' + corpo('qotdForaDoBanco'), ctxCli);
const lib = require(path.join(raiz, 'lib', 'instagram.js'));
const AGORA = Date.UTC(2026, 10, 13, 13, 0, 0);
const clone = (x) => JSON.parse(JSON.stringify(x));
const story = (o) => Object.assign({ id: 'ig-1', stem: 'Mulher de 30 anos com amenorreia. Qual o diagnóstico?', answer: 'B',
  options: { A: 'a', B: 'b', C: 'c', D: 'd' }, explanation: 'Porque sim.', sub: 'Endocrinologia Feminina', teem: '',
  status: 'posted', postedAt: Date.UTC(2026, 10, 12, 13, 0, 0) }, o || {});
const banco0 = () => [
  { id: 'endodirect-1', code: 'ENDODIRECT-2117', stem: 'Outra questão', answer: 'A', inst: 'Endodirect', area: 'Diabetes' },
  { id: 'teem-1', code: 'TEEM-2024-01', stem: 'Questão do TEEM', answer: 'C', inst: 'TEEM', area: 'Tireoide' },
];
// roda nas duas cópias e exige o mesmo resultado
function ambos(s, provas, rotulo) {
  const a = clone(provas), b = clone(provas);
  ctxCli.__s = clone(s); ctxCli.__p = a;
  const ra = vm.runInContext('qotdNoBanco(__s,__p,' + AGORA + ')', ctxCli);
  const rb = lib.qotdNoBanco(clone(s), b, AGORA);
  const pa = JSON.parse(JSON.stringify(ctxCli.__p));
  ok('🧨 painel e robô dão o mesmo resultado: ' + rotulo, ra === rb && JSON.stringify(pa) === JSON.stringify(b));
  return { r: rb, provas: b };
}

// ── 2. O que entra no Banco ──────────────────────────────────────────────────────────────
{
  const { r, provas } = ambos(story(), banco0(), 'questão nova');
  const it = provas[provas.length - 1];
  ok('🧨 a postada entra no Banco', r === 'novo' && provas.length === 3);
  ok('código ENDODIRECT seguinte ao maior do Banco (2118)', it.code === 'ENDODIRECT-2118');
  ok('identidade estável: id qotd-<id> e sourceId qotd:<id>', it.id === 'qotd-ig-1' && it.sourceId === 'qotd:ig-1');
  ok('enunciado, alternativas, gabarito, comentário e área vêm da questão do dia',
    it.stem === story().stem && JSON.stringify(it.options) === JSON.stringify(story().options) && it.answer === 'B'
    && it.explanation === 'Porque sim.' && it.area === 'Endocrinologia Feminina');
  ok('🧨 entra como Endodirect (o acesso de assinante), múltipla escolha, ativa', it.inst === 'Endodirect' && it.instituicao === 'Endodirect'
    && it.banca === 'Endodirect' && it.type === 'mc' && it.active === true && it.free === false);
  ok('origem identificada ("Questão do Dia") e data da postagem guardada', it.origem === 'Questão do Dia' && it.qotdPostedAt === story().postedAt);
  ok('sem imagem, sem campo de imagem vazio', !('img' in it) && !('imgRef' in it));
}
{
  const { provas } = ambos(story({ img: 'data:image/webp;base64,AAAA', imgRef: 'Autor X, 2020. CC BY 4.0' }), banco0(), 'com figura');
  const it = provas[provas.length - 1];
  ok('🧨 a figura vai junto, com o crédito (CC BY pede atribuição)', it.img === 'data:image/webp;base64,AAAA' && it.imgRef === 'Autor X, 2020. CC BY 4.0');
}
{
  const fig = { expImg: 'https://www.endodirect.com.br/figuras/qotd/x.svg', expImgRef: 'Gráfico Endodirect a partir de Autor Y, 2026.', expImgTema: '', expImgOrigem: 'upload' };
  const { provas } = ambos(story(fig), banco0(), 'com figura no comentário');
  const it = provas[provas.length - 1];
  ok('🧨 a figura do COMENTÁRIO vai junto (expImg e legenda); campo vazio não entra', it.expImg === fig.expImg && it.expImgRef === fig.expImgRef
    && it.expImgOrigem === 'upload' && !('expImgTema' in it));
  const r = ambos(story(fig), provas, 'mesma figura de novo');
  ok('repostar com a mesma figura do comentário não conta como mudança', r.r === null);
  const r2 = ambos(story(), provas, 'figura do comentário retirada');
  ok('figura do comentário retirada sai da cópia', r2.r === 'atualizado' && !('expImg' in r2.provas[2]) && !('expImgRef' in r2.provas[2]));
  const orfa = ambos(story({ expImgRef: 'legenda órfã', expImgOrigem: 'upload' }), r2.provas, 'legenda do comentário sem figura');
  ok('legenda do comentário sem figura não conta como mudança (nem entra)', orfa.r === null && !('expImgRef' in orfa.provas[2]));
  const semFig = ambos(story(), banco0(), 'sem figura no comentário');
  ok('sem figura no comentário, nenhum campo expImg', !Object.keys(semFig.provas[2]).some((k) => /^expImg/.test(k)));
}
{
  // 01/01/2026 01:00 UTC = 31/12/2025 22:00 em Brasília
  const { provas } = ambos(story({ postedAt: Date.UTC(2026, 0, 1, 1, 0, 0) }), banco0(), 'virada do ano');
  ok('ano da postagem no horário de Brasília', provas[provas.length - 1].ano === 2025);
}

// ── 3. Sem duplicar, sem vazar, sem repor o que saiu ─────────────────────────────────────
{
  const p1 = ambos(story(), banco0(), 'primeira postagem').provas;
  const r2 = ambos(story(), p1, 'postar de novo sem mudança');
  ok('🧨 postar de novo, igual, não duplica nem regrava', r2.r === null && r2.provas.length === 3);
  const corrigida = story({ answer: 'C', explanation: 'Corrigido.', postedAt: Date.UTC(2026, 10, 13, 13, 0, 0) });
  const r3 = ambos(corrigida, p1, 'repostar depois de corrigir');
  const it = r3.provas[r3.provas.length - 1];
  ok('🧨 Reabrir → corrigir → Postada ATUALIZA a cópia (mesmo código, sem duplicar)', r3.r === 'atualizado' && r3.provas.length === 3
    && it.answer === 'C' && it.explanation === 'Corrigido.' && it.code === 'ENDODIRECT-2118');
  const r4 = ambos(story({ img: '' }), (() => { const x = clone(p1); x[2].img = 'data:x'; x[2].imgRef = 'ref'; return x; })(), 'figura retirada');
  const r5 = ambos(story({ imgRef: 'crédito órfão' }), p1, 'crédito sem figura');
  ok('crédito de figura sem figura não conta como mudança (nem entra)', r5.r === null && !('imgRef' in r5.provas[2]));
  ok('figura retirada da questão sai da cópia', r4.r === 'atualizado' && !('img' in r4.provas[2]) && !('imgRef' in r4.provas[2]));
}
{
  const r = ambos(story({ stem: '  Outra questão ' }), banco0(), 'enunciado já no Banco');
  ok('🧨 enunciado que já está no Banco não duplica', r.r === null && r.provas.length === 2);
  const t = ambos(story({ teem: '(TEEM 2026)' }), banco0(), 'atribuição TEEM');
  ok('🧨 questão com atribuição TEEM não entra como Endodirect', t.r === null && t.provas.length === 2);
  const v = ambos(story({ answer: '' }), banco0(), 'sem gabarito');
  ok('questão incompleta (sem gabarito) não entra', v.r === null && v.provas.length === 2);
}
{
  ctxCli.__p = clone(banco0()); ctxCli.__s = story();
  vm.runInContext('qotdNoBanco(__s,__p,' + AGORA + ')', ctxCli);
  const saiu = vm.runInContext('qotdForaDoBanco(__s,__p)', ctxCli);
  ok('🧨 Reabrir tira a cópia do Banco', saiu === true && ctxCli.__p.length === 2 && !ctxCli.__p.some((p) => p.sourceId === 'qotd:ig-1'));
  ok('Reabrir de questão que não está no Banco não mexe em nada', vm.runInContext('qotdForaDoBanco(__s,__p)', ctxCli) === false && ctxCli.__p.length === 2);
}

// ── 4. O robô: as postadas que faltam entram (inclusive as antigas) ──────────────────────
{
  const payload = { provas: banco0(), ig_stories: [
    story({ id: 'b', postedAt: 300, stem: 'Questão B' }),
    story({ id: 'a', postedAt: 100, stem: 'Questão A' }),
    story({ id: 'fila', status: 'queued', stem: 'Na fila' }),
    story({ id: 'apagada', postedAt: 200, stem: 'Apagada do Banco', foraDoBanco: true }),
  ] };
  const n = lib.qotdPostadasNoBanco(payload, AGORA);
  const novas = payload.provas.filter((p) => p.origem === 'Questão do Dia');
  ok('🧨 todas as postadas que faltam entram (as antigas também)', n === 2 && novas.length === 2);
  ok('em ordem de postagem: a mais antiga leva o código menor', novas[0].sourceId === 'qotd:a' && novas[0].code === 'ENDODIRECT-2118' && novas[1].code === 'ENDODIRECT-2119');
  ok('🧨 questão ainda na fila não entra', !payload.provas.some((p) => p.sourceId === 'qotd:fila'));
  ok('🧨 a que o professor apagou do Banco não volta', !payload.provas.some((p) => p.sourceId === 'qotd:apagada'));
  ok('rodar de novo não acrescenta nada', lib.qotdPostadasNoBanco(payload, AGORA) === 0 && payload.provas.length === 4);
  const semBanco = { ig_stories: [story()] };
  ok('🧨 sem o Banco em mãos, o robô não cria um Banco só com as questões do dia', lib.qotdPostadasNoBanco(semBanco, AGORA) === 0 && !('provas' in semBanco));
}

// ── 5. O robô posta e grava no MESMO save ────────────────────────────────────────────────
(async function () {
  const gravados = [];
  let servidor;
  const fetchFalso = async (url, opt) => {
    if (opt && opt.method === 'POST') { gravados.push(JSON.parse(opt.body).payload); return { ok: true, json: async () => ({}) }; }
    return { ok: true, json: async () => [{ payload: clone(servidor) }] };
  };
  const fetchReal = global.fetch;
  global.fetch = fetchFalso;
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'chave-de-teste';
  try {
    servidor = { provas: banco0(), ig_stories: [story({ id: 'velha', postedAt: Date.UTC(2026, 10, 10, 13), stem: 'Velha' }), story({ id: 'hoje', status: 'queued', postedAt: undefined, stem: 'De hoje' })] };
    const r = await lib.autoPostDailyQotd(new Date(Date.UTC(2026, 10, 13, 13, 0, 0)));
    const g = gravados[0] || {};
    ok('🧨 o robô posta a da fila E ela entra no Banco no mesmo save (com a antiga que faltava)', r.posted === true && r.banco === 2 && gravados.length === 1
      && (g.provas || []).some((p) => p.sourceId === 'qotd:hoje') && (g.provas || []).some((p) => p.sourceId === 'qotd:velha'));

    gravados.length = 0;
    servidor = g; // já postou hoje e o Banco está em dia
    const r2 = await lib.autoPostDailyQotd(new Date(Date.UTC(2026, 10, 13, 18, 0, 0)));
    ok('já postada hoje e Banco em dia: não grava nada', r2.posted === false && r2.reason === 'already_posted_today' && r2.banco === 0 && gravados.length === 0);

    gravados.length = 0;
    servidor = { provas: banco0(), ig_stories: [story({ id: 'x', postedAt: Date.UTC(2026, 10, 13, 12), stem: 'Postada por aba antiga' })] };
    const r3 = await lib.autoPostDailyQotd(new Date(Date.UTC(2026, 10, 13, 18, 0, 0)));
    ok('🧨 postada hoje por uma aba antiga do painel (sem a regra): o robô a põe no Banco', r3.reason === 'already_posted_today' && r3.banco === 1
      && gravados.length === 1 && gravados[0].provas.some((p) => p.sourceId === 'qotd:x'));
  } finally {
    global.fetch = fetchReal;
  }

  // ── 6. O painel ────────────────────────────────────────────────────────────────────────
  const tog = (html.match(/main\.querySelectorAll\('\[data-ig-toggle\]'\)[\s\S]*?\}\);\}\);/) || [''])[0];
  ok('🧨 "Postada" põe no Banco ANTES do save (vai no mesmo)', /if\(post\)\{delete it\.foraDoBanco;noBanco=qotdNoBanco\(it,provasDB,Date\.now\(\)\);\}/.test(tog)
    && tog.indexOf('qotdNoBanco(') < tog.indexOf('persistIgStories(true)'));
  ok('🧨 "Reabrir" tira do Banco', /else if\(qotdForaDoBanco\(it,provasDB\)\)noBanco='saiu';/.test(tog));
  ok('o aviso diz que entrou/saiu do Banco', /incluída no Banco de Questões!/.test(tog) && /saiu do Banco de Questões\./.test(tog));
  ok('🧨 apagar do Banco uma questão do dia marca a origem (o robô não a repõe)',
    /_sid\.indexOf\('qotd:'\)===0\)\{var _st=igStories\.filter\(function\(s\)\{return s&&'qotd:'\+s\.id===_sid;\}\)\[0\];if\(_st\)\{_st\.foraDoBanco=true;/.test(html));

  // ── 7. O filtro "Subespecialidade" do Banco oferece a área ─────────────────────────────
  const sel = { value: '', innerHTML: '' };
  const fctx = vm.createContext({ Object, String, Array,
    DIR_SUBS: ['Endocrinologia Básica', 'Diabetes', 'Tireoide', 'Adrenal', 'Obesidade', 'Lípides', 'Osteometabolismo', 'Neuroendocrinologia',
      'Endocrinologia Feminina', 'Endocrinologia Masculina', 'Transgeneridade', 'Endocrinologia Pediátrica', 'Endocrinologia do Esporte', 'Endocrinopatias'],
    document: { getElementById: (id) => (id === 'q-parea' ? sel : null) },
    __pool: [{ area: 'Diabetes', inst: 'Endodirect' }, { area: 'Básica', inst: 'Endodirect' }, { area: 'Endocrinologia Básica', inst: 'TEEM' },
      { area: 'Dislipidemia e Aterosclerose', inst: 'TEEM' }, { area: 'Lípides', inst: 'Endodirect' }, { area: 'Endocrinopatias', inst: 'Endodirect' },
      { area: 'Endocrinologia do Esporte', inst: 'Endodirect' }, { area: '', inst: 'Endodirect' }],
  });
  vm.runInContext(['esc', 'canonSub', 'populateArea'].map(corpo).join('\n') + '\nfunction provasPool(){return __pool;}', fctx);
  vm.runInContext("populateArea('q-parea','')", fctx);
  const opcoes = (sel.innerHTML.match(/<option value="([^"]*)">/g) || []).map((o) => o.replace(/<option value="|">/g, ''));
  ok('🧨 a lista sai das questões, na ordem das Diretrizes, sem rótulo duplicado — veio ' + JSON.stringify(opcoes),
    JSON.stringify(opcoes) === JSON.stringify(['', 'Endocrinologia Básica', 'Diabetes', 'Lípides', 'Endocrinologia do Esporte', 'Endocrinopatias']));
  sel.value = 'Endocrinologia Esportiva';
  vm.runInContext("populateArea('q-parea','Endodirect')", fctx);
  ok('escolha antiga ("Endocrinologia Esportiva") vira a canônica e é mantida', sel.value === 'Endocrinologia do Esporte');
  ok('🧨 o filtro compara pela taxonomia canônica ("Básica" = Endocrinologia Básica)',
    /\(!area\|\|canonSub\(q\.area\)===canonSub\(area\)\)/.test(corpo('filterProvas')) && /if\(v==='Básica'\)return 'Endocrinologia Básica';/.test(corpo('canonSub')));
  ok('a caixa é remontada a cada atualização do Banco', /try\{populateArea\('q-parea',inst\);area=\(document\.getElementById\('q-parea'\)\|\|\{\}\)\.value\|\|'';\}catch\(e\)\{\}/.test(corpo('updateProvaInfo')));
  ok('🧨 a figura no Banco leva o crédito', /\(q\.imgRef\?'<div[^']*'\+esc\(igShortRef\(q\.imgRef\)\)/.test(corpo('qFullHTML')));

  if (bad) { console.log('✗ questão do dia no banco: ' + bad + ' falha(s)'); process.exit(1); }
  console.log('✓ questão do dia no banco: postou, entrou (painel e robô, mesma regra); reaberta sai; sem duplicar, sem TEEM, sem repor a apagada; filtro oferece a área');
})();
