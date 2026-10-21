// A FIGURA DO COMENTÁRIO da Questão do Dia (21/10/2026).
//
// Pedido do professor: "Vamos melhorar os comentários das questões do dia, no sentido
// de, sempre que possível, jogar uma imagem nos comentários para contextualizar e
// reforçar o comentário por escrito. Não precisa ser em todas as questões [...] as
// imagens podem ser novas, retiradas do PubMed, ou dos próprios resumos dos capítulos."
//
// O que este teste segura:
//   1. as candidatas saem dos Resumos: imagem do corpo com URL https e legenda, e o
//      esquema por URL de cada capítulo. ⚠️ Base64 (iria inteira na Questão do Dia de
//      cada aluno), SVG embutido, imagem sem legenda e capítulo em rascunho ficam fora;
//   2. a pré-seleção acha a figura do ponto da resposta e não casa pelo nome do livro;
//   3. a escolha: a figura dos Resumos entra com a legenda e o capítulo; id inventado não
//      entra; o PubMed só quando o enunciado não tem figura, e com as conferências da
//      figura do caso (exame normal no texto → nada); erro da IA não derruba a questão;
//   4. o cartão do aluno mostra a figura SÓ depois da resposta, dentro do gabarito, e
//      ela amplia ao toque; URL que não é de imagem não sai;
//   5. a figura viaja do lote para a fila e para as Pendências, e o revisor pode tirá-la;
//      o "porquê" da escolha não é gravado;
//   6. o lote e o "Gerar 1 com IA" chamam a figura do comentário depois da questão pronta.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); };

const fonte = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('function igAttachExpImage'));
ok(!!fonte, 'não achei igAttachExpImage no index.html (a figura do comentário sumiu?)');
if (!fonte) { console.error('✗ figura do comentário:\n  - ' + falhas[0]); process.exit(1); }
const corpo = fonte.replace(/^\s*\(function\(\)\{\s*/, '').replace(/^\s*['"]use strict['"];\s*/, '').replace(/\}\)\(\);?\s*$/, '');
const vc = new VirtualConsole();
vc.on('jsdomError', function () {});
const dom = new JSDOM('<body><div id="cartao"></div><div id="adm-main"></div></body>', { url: 'https://www.endodirect.com.br/', runScripts: 'outside-only', virtualConsole: vc });
const ctx = vm.createContext(dom.getInternalVMContext());
try { vm.runInContext(corpo, ctx); } catch (e) { /* dependências de CDN ausentes: esperado */ }
const run = (c) => vm.runInContext(c, ctx);
const doc = dom.window.document;

const LIVRO = 'https://eutizblmrcypzyqzczgq.supabase.co/storage/v1/object/public/endodirect-assets/resumos/livros/';
const RESUMO_TIREO = [
  '## Diagnóstico',
  'A cintilografia separa as causas de tireotoxicose.',
  '![Padrões da cintilografia tireoidiana: (A) normal; (B) doença de Graves, com captação difusa e aumentada; (C) adenoma tóxico, com nódulo hipercaptante e supressão do restante; (D) bócio multinodular tóxico. Fonte: Vilar L (ed.), Endocrinologia Clínica, 8ª ed., fig. 31.4.](' + LIVRO + 'vilar-31-4-padroes.png)',
  'Texto com imagem no meio ![no meio da linha](' + LIVRO + 'meio.png) não é figura de bloco.',
  '![](' + LIVRO + 'sem-legenda.png)',
  '![Figura embutida em base64 \\[adaptada\\]](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==)',
  '![Paralisia periódica tireotóxica: a tireotoxicose e a atividade β-adrenérgica ativam a Na/K-ATPase \\[adaptada\\], que desloca o potássio para dentro das células. Fonte: traduzida de Gardner DG, Greenspan\'s Basic & Clinical Endocrinology, 10ª ed., fig. 24-2.](' + LIVRO + 'greenspan-24-2.png){60}',
].join('\n');
const DIRETRIZES = [
  { sub: 'Tireoide', tema: 'Tireotoxicose: Abordagem e Diagnóstico Diferencial', resumo: RESUMO_TIREO,
    figuras: [
      { titulo: 'Tireotoxicose: com e sem hipertireoidismo', url: 'https://www.endodirect.com.br/figuras/resumos/tireoide--tireotoxicose.svg', fonte: 'Esquema Endodirect — ilustração original a partir do texto do capítulo.' },
      { titulo: 'Eixo em SVG embutido', svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', fonte: 'x' },
      { url: 'https://www.endodirect.com.br/figuras/resumos/sem-titulo.svg', fonte: 'x' },
    ] },
  { sub: 'Adrenal', tema: 'Feocromocitoma', resumo: '![Rascunho: metanefrinas plasmáticas no feocromocitoma. Fonte: Williams.](' + LIVRO + 'rascunho.png)', rascunho: true },
  { sub: 'Osteometabolismo', tema: 'Osteoporose', resumo: '![Remodelação óssea: RANKL e osteoprotegerina regulam a reabsorção pelo osteoclasto; o denosumabe bloqueia o RANKL. Fonte: traduzida de Clinical Primer of Metabolic Bone Diseases, 9ª ed., fig. 9.1.](' + LIVRO + 'primer-9-1.png)' },
];
// O texto dos esquemas (figuras/resumos/textos.json): entra na escolha, não na legenda.
const TEXTOS = { 'tireoide--tireotoxicose.svg': 'Tireotoxicose com hipertireoidismo: captação alta na cintilografia · sem hipertireoidismo: tireoidite, captação baixa' };
run('diretrizes=' + JSON.stringify(DIRETRIZES) + ';var __textos=' + JSON.stringify(TEXTOS) + ';');

// ── 1. candidatas ─────────────────────────────────────────────────────────────
const cands = JSON.parse(run('JSON.stringify(igExpCandidatas(__textos))'));
{
  const ids = cands.map((c) => c.id);
  ok(JSON.stringify(ids) === '["r0-0","r0-1","f0-0","r2-0"]', 'candidatas erradas (esperava 2 imagens do corpo e o esquema do cap. 0 e a imagem do cap. 2): ' + JSON.stringify(ids));
  ok(!cands.some((c) => /^data:/.test(c.url)), '⚠️ imagem em base64 virou candidata (iria inteira na Questão do Dia de cada aluno)');
  ok(!cands.some((c) => /rascunho/.test(c.url)), 'figura de capítulo em RASCUNHO virou candidata');
  ok(!cands.some((c) => /meio\.png|sem-legenda|sem-titulo/.test(c.url)), 'imagem no meio da linha, sem legenda ou esquema sem título virou candidata');
  const g = cands.find((c) => c.id === 'r0-1') || {};
  ok(/\[adaptada\]/.test(g.leg || '') && !/\\\]/.test(g.leg || ''), 'a legenda com "]" escapado não foi desescapada: ' + g.leg);
  ok(g.url === LIVRO + 'greenspan-24-2.png', 'a largura {60} grudou na URL da figura: ' + g.url);
  const f = cands.find((c) => c.id === 'f0-0') || {};
  ok(f.cap === 'Tireotoxicose: com e sem hipertireoidismo. Esquema Endodirect — ilustração original a partir do texto do capítulo.', 'a legenda do esquema não juntou título e fonte (ou levou o texto do desenho para o aluno): ' + f.cap);
  ok(f.desenho === TEXTOS['tireoide--tireotoxicose.svg'], 'o esquema não recebeu o texto do desenho (figuras/resumos/textos.json): ' + JSON.stringify(f.desenho));
  ok(cands.filter((c) => c.id !== 'f0-0').every((c) => !c.desenho), 'figura de livro recebeu texto de desenho que não é dela');
  ok(cands.every((c) => c.tema && c.sub), 'candidata sem capítulo ou subespecialidade');
}

// ── 2. pré-seleção ────────────────────────────────────────────────────────────
const QG = {
  sub: 'Tireoide',
  stem: 'Mulher de 32 anos com palpitações, perda de peso e bócio difuso. TSH < 0,01 mUI/L [VR 0,4–4,0], T4 livre 3,1 ng/dL [VR 0,9–1,7] e TRAb negativo. Qual exame define a causa?',
  options: { A: 'Cintilografia de tireoide', B: 'USG com Doppler', C: 'Tireoglobulina', D: 'PAAF' },
  answer: 'A',
  explanation: 'Com TRAb negativo, a cintilografia separa doença de Graves (captação difusa e aumentada) de adenoma tóxico e bócio multinodular tóxico (nódulos hipercaptantes) e da tireoidite (captação baixa).',
};
{
  const r = JSON.parse(run('JSON.stringify(igExpRanking(' + JSON.stringify(QG) + ',igExpCandidatas(__textos),10).map(function(c){return c.id;}))'));
  ok(r[0] === 'r0-0', 'a figura da cintilografia não ficou em 1º para a questão de cintilografia: ' + JSON.stringify(r));
  ok(r.indexOf('r2-0') < 0, 'a figura de remodelação óssea entrou na pré-seleção de uma questão de tireoide');
  // "clínica" e "metabólica" na questão não podem casar com "Clinical Primer of
  // Metabolic Bone Diseases", o nome do livro na fonte da legenda: são dois termos, o
  // mínimo para entrar na pré-seleção
  const so = { sub: 'Osteometabolismo', stem: 'Na avaliação clínica de uma doença metabólica, qual o primeiro exame?', options: { A: 'x', B: 'y' }, answer: 'A', explanation: 'A avaliação clínica orienta; a doença metabólica exige exame.' };
  const r2 = JSON.parse(run('JSON.stringify(igExpRanking(' + JSON.stringify(so) + ',igExpCandidatas(__textos),10).map(function(c){return c.id;}))'));
  ok(r2.length === 0, '⚠️ a pré-seleção casou pela FONTE da legenda (nome do livro), não pelo que a figura mostra: ' + JSON.stringify(r2));
  const t = JSON.parse(run('JSON.stringify(Object.keys(igExpTermos("TSH, T4L e HbA1c com IGF-1 e DM2 na tireoidite")))'));
  ok(['#tsh', '#t4l', '#hba1c', '#igf1', '#dm2', 'tireoid'].every((k) => t.indexOf(k) >= 0), 'siglas ou radical de 7 letras não viraram termo: ' + JSON.stringify(t));
  const sin = JSON.parse(run('JSON.stringify([Object.keys(igExpTermos("cetoacidose")),Object.keys(igExpTermos("CAD euglicêmica")),Object.keys(igExpTermos("GLP-1 e GLP1"))])'));
  ok(sin[0].indexOf('#cad') >= 0 && sin[1].indexOf('cetoaci') >= 0, 'a sigla e o nome por extenso não viraram o mesmo termo (cetoacidose × CAD): ' + JSON.stringify(sin));
  ok(JSON.stringify(sin[2]) === '["#glp1"]', '"GLP-1" e "GLP1" não viraram o mesmo termo: ' + JSON.stringify(sin[2]));
  // a legenda LONGA não ganha da curta e precisa só por ter mais palavras
  const CURTA = { id: 'a', sub: 'Tireoide', tema: 'Tireotoxicose', leg: 'Cintilografia na doença de Graves: captação difusa e aumentada.' };
  const LONGA = { id: 'b', sub: 'Tireoide', tema: 'Tireotoxicose', leg: 'Cintilografia e captação em vários cenários de Graves com bócio, nódulos, tireoidite subaguda, tireoidite pós-parto, amiodarona, iodo, gestação, lactação, criança, idoso, cirurgia, radioiodo, metimazol, propiltiouracila, betabloqueador, oftalmopatia, mixedema, acropatia, recidiva, remissão e seguimento.' };
  const bm = JSON.parse(run('JSON.stringify(igExpRanking(' + JSON.stringify(QG) + ',' + JSON.stringify([LONGA, CURTA]) + ',10).map(function(c){return c.id;}))'));
  ok(bm[0] === 'a', 'a legenda longa e genérica passou na frente da curta e precisa (sem normalização de tamanho): ' + JSON.stringify(bm));
}

// ── 3. a escolha (IA e Open-i com dublês) ─────────────────────────────────────
run(`
  var __ia=[],__iaResp=null,__iaErro=false,__fetch=[],__openiItems=[];
  aiRequest=function(p){__ia.push(p);if(__iaErro)return Promise.reject(new Error('caiu'));return Promise.resolve(typeof __iaResp==='string'?__iaResp:JSON.stringify(__iaResp||{}));};
  var __textosPedidos=0,__textosFalha=false;
  fetch=function(url,opt){
    if(String(url).indexOf('/figuras/resumos/textos.json')>=0){__textosPedidos++;return __textosFalha?Promise.reject(new Error('rede')):Promise.resolve({ok:true,json:function(){return Promise.resolve(__textos);}});}
    __fetch.push(JSON.parse(opt.body));return Promise.resolve({ok:true,json:function(){return Promise.resolve({ok:true,items:__openiItems});}});
  };
`);
function attach(q, resp, extra) {
  run('__ia=[];__fetch=[];__iaErro=' + (!!(extra && extra.erro)) + ';__iaResp=' + JSON.stringify(resp) + ';__openiItems=' + JSON.stringify((extra && extra.openi) || []) + ';');
  return run('igAttachExpImage(' + JSON.stringify(q) + ')').then((r) => ({ q: r, ia: JSON.parse(run('JSON.stringify(__ia)')), fetch: JSON.parse(run('JSON.stringify(__fetch)')) }));
}
// Um caso de cada vez: os dublês guardam estado (o que a IA recebeu e respondeu).
const casos = [];
casos.push(() => attach(QG, { id: 'r0-0', busca: '', motivo: 'Mostra os quatro padrões de captação.' }).then(({ q, ia }) => {
  ok(q.expImg === LIVRO + 'vilar-31-4-padroes.png' && q.expImgOrigem === 'resumo', 'a figura escolhida dos Resumos não entrou: ' + JSON.stringify(q.expImg));
  ok(/Fonte: Vilar/.test(q.expImgRef || '') && q.expImgTema === 'Tireotoxicose: Abordagem e Diagnóstico Diferencial', 'a figura dos Resumos entrou sem a legenda com a fonte ou sem o capítulo');
  ok(q._expMotivo === 'Mostra os quatro padrões de captação.', 'o porquê da escolha não ficou para o professor conferir');
  ok(ia.length === 1 && /\[r0-0\]/.test(ia[0].prompt) && !/Fonte: Vilar/.test(ia[0].prompt), 'a IA não recebeu as candidatas pelo id (ou recebeu a fonte do livro, que não diz o que a figura mostra)');
  ok(/Resposta correta: A\) Cintilografia/.test(ia[0].prompt) && /Comentário: Com TRAb/.test(ia[0].prompt), 'a IA não recebeu a resposta correta e o comentário');
  ok(/JUSTIFICA a resposta correta/.test(ia[0].system) && /Na dúvida, não escolha/.test(ia[0].system), 'a instrução da escolha perdeu o critério (justificar a resposta; na dúvida, nenhuma)');
  ok(/\[f0-0\][^\n]*No desenho: Tireotoxicose com hipertireoidismo/.test(ia[0].prompt), 'a IA não recebeu o texto de dentro do esquema (só o título não basta para julgar)');
  ok(/HIPOTÉTICO/.test(ia[0].system), 'a instrução não proíbe buscar achado hipotético (o resultado esperado de um exame que a resposta manda pedir)');
}));
// o índice dos esquemas falhou: segue sem ele, e tenta de novo na próxima questão
casos.push(() => {
  run('IG_EXP_TEXTOS=null;__textosFalha=true;__textosPedidos=0;');
  return attach(QG, { id: 'r0-0', busca: '' }).then(({ q, ia }) => {
    ok(q.expImg === LIVRO + 'vilar-31-4-padroes.png' && ia.length === 1 && !/No desenho:/.test(ia[0].prompt), 'sem o índice dos esquemas, a figura do comentário não seguiu (ou inventou texto de desenho)');
    run('__textosFalha=false;');
    return attach(QG, { id: '' }).then(({ ia: ia2 }) => {
      ok(JSON.parse(run('__textosPedidos')) === 2 && /No desenho:/.test(ia2[0].prompt), 'depois da falha, o índice dos esquemas não foi pedido de novo');
      return attach(QG, { id: '' }).then(() => {
        ok(JSON.parse(run('__textosPedidos')) === 2, 'o índice dos esquemas foi baixado de novo a cada questão (devia ficar guardado)');
      });
    });
  });
});
casos.push(() => attach(QG, { id: 'r9-9', busca: '' }).then(({ q }) => {
  ok(!q.expImg, '⚠️ um id que não está entre as candidatas virou figura: ' + q.expImg);
}));
casos.push(() => attach(QG, { id: '[r0-0]', busca: '' }).then(({ q }) => {
  ok(q.expImg === LIVRO + 'vilar-31-4-padroes.png', 'o id entre colchetes ("[r0-0]", como vem na lista) não foi reconhecido');
}));
const OPENI_GRAVES = [{ img: 'https://openi.nlm.nih.gov/imgs/512/1/2/graves.png', title: 'Thyroid scintigraphy in hyperthyroidism', caption: 'Thyroid scintigraphy showing diffuse increased uptake in Graves disease.', authors: 'Silva A, Souza B', journal: 'Thyroid Res', date: '2019', pmid: '123' }];
casos.push(() => attach(QG, { id: '', busca: 'thyroid scintigraphy Graves diffuse uptake' }, { openi: OPENI_GRAVES }).then(({ q, fetch }) => {
  ok(fetch.length === 1 && fetch[0].kind === 'openi', 'sem candidata que sirva e sem figura no enunciado, a busca no PubMed não foi feita');
  ok(q.expImg === OPENI_GRAVES[0].img && q.expImgOrigem === 'pubmed' && /PMID 123/.test(q.expImgRef || ''), 'a figura do PubMed não entrou com a minirreferência: ' + JSON.stringify([q.expImg, q.expImgRef]));
}));
casos.push(() => attach(Object.assign({}, QG, { img: 'https://openi.nlm.nih.gov/imgs/512/9/9/caso.png' }), { id: '', busca: 'thyroid scintigraphy Graves diffuse uptake' }, { openi: OPENI_GRAVES }).then(({ q, fetch, ia }) => {
  ok(fetch.length === 0 && !q.expImg, '⚠️ com figura no enunciado, o comentário recebeu OUTRA figura do PubMed');
  ok(ia.length === 1 && /"busca" fica sempre vazia/.test(ia[0].system), 'com figura no enunciado, a instrução não proibiu a busca no PubMed');
}));
const QN = Object.assign({}, QG, { explanation: 'A RM de sela normal afasta macroadenoma; o quadro é de tireotoxicose primária.' });
casos.push(() => attach(QN, { id: '', busca: 'pituitary MRI macroadenoma' }, { openi: OPENI_GRAVES }).then(({ q, fetch }) => {
  ok(fetch.length === 0 && !q.expImg, '⚠️ o comentário diz RM NORMAL e mesmo assim buscou figura de macroadenoma');
}));
casos.push(() => attach(QG, null, { erro: true }).then(({ q }) => {
  ok(q && q.stem === QG.stem && !q.expImg, 'erro da IA derrubou a questão ou deixou figura');
}));
casos.push(() => attach(Object.assign({}, QG, { explanation: '' }), { id: 'r0-0' }).then(({ q, ia }) => {
  ok(ia.length === 0 && !q.expImg, 'questão sem comentário pediu figura para o comentário');
}));
casos.push(() => attach({ sub: 'Lípides', stem: 'Qual o alvo de LDL no muito alto risco?', options: { A: '<55', B: '<70' }, answer: 'A', explanation: 'Diretriz brasileira de 2025.', img: 'https://x.org/a.png' }, { id: 'r0-0' }).then(({ ia }) => {
  ok(ia.length === 0, 'sem candidata e com figura no enunciado, ainda assim chamou a IA (custo sem chance de figura)');
}));

casos.reduce((p, c) => p.then(c), Promise.resolve()).then(() => {
  // ── 4. o cartão do aluno, o de revisão e o ampliador ────────────────────────
  const Q = Object.assign({ id: 'ig-1', status: 'posted' }, QG, { expImg: LIVRO + 'vilar-31-4-padroes.png', expImgRef: 'Padrões da cintilografia tireoidiana. Fonte: Vilar L (ed.), Endocrinologia Clínica, 8ª ed., fig. 31.4.', expImgTema: 'Tireotoxicose', expImgOrigem: 'resumo' });
  doc.getElementById('cartao').innerHTML = run('qotdCardHTML(' + JSON.stringify(Q) + ',null)');
  ok(!doc.querySelector('#cartao .qp-expfig'), '⚠️ a figura do comentário apareceu ANTES da resposta (entrega o gabarito)');
  doc.getElementById('cartao').innerHTML = run('qotdCardHTML(' + JSON.stringify(Q) + ',{letter:"B",ok:false})');
  const fig = doc.querySelector('#cartao .qp-fb .qp-expfig');
  ok(!!fig, 'a figura do comentário não apareceu no gabarito comentado');
  const img = fig && fig.querySelector('img');
  ok(img && img.classList.contains('qp-zoom') && img.getAttribute('src') === Q.expImg && img.getAttribute('referrerpolicy') === 'no-referrer', 'a figura do comentário sem ampliador, sem a URL certa ou sem referrerpolicy');
  const cap = fig && fig.querySelector('figcaption');
  ok(cap && /📚 Resumos · Tireotoxicose/.test(cap.textContent) && /Fonte: Vilar/.test(cap.textContent), 'a legenda da figura dos Resumos não diz o capítulo e a fonte: ' + (cap && cap.textContent));
  const pub = Object.assign({}, Q, { expImg: 'https://openi.nlm.nih.gov/imgs/512/1/2/x.png', expImgRef: 'Silva A et al.. · Thyroid Res : x. · 2019 · Fonte: PubMed Central/Open-i · PMID 1', expImgOrigem: 'pubmed', expImgTema: '' });
  const ph = run('qExpFigHTML(' + JSON.stringify(pub) + ')');
  ok(/Open-i · PMID 1/.test(ph) && !/PubMed Central\/Open-i/.test(ph) && !/📚/.test(ph), 'a figura do PubMed não saiu com a minirreferência abreviada: ' + ph);
  ['javascript:alert(1)', 'data:image/svg+xml;base64,PHN2Zz4=', '/relativa.png', ''].forEach((u) => {
    ok(run('qExpFigHTML(' + JSON.stringify(Object.assign({}, Q, { expImg: u })) + ')') === '', '⚠️ endereço que não é de imagem saiu na figura do comentário: ' + u);
  });
  ok(/<figure class="qp-expfig">/.test(run('qotdReviewCardHTML(' + JSON.stringify(Q) + ')')), 'o cartão de revisão (professores) não mostra a figura do comentário');
  ok(/class="qp-zoom"/.test(run('qFigHTML({img:"https://x.org/a.png"})')), 'a figura do caso não amplia ao toque como a do comentário');
  run('ensureLightbox();');
  doc.querySelector('#cartao .qp-expfig img').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const lb = doc.getElementById('img-lightbox');
  ok(lb && lb.style.display === 'flex', 'tocar na figura do comentário não abriu o ampliador');

  // ── 5. lote → fila / Pendências → fila, e o revisor pode tirar ──────────────
  run('igStories=[];igPending=[];persistIgStories=function(){};persistIgPending=function(){};updateAdmPendBadge=function(){};notify=function(){};renderAdmSec=function(){};admEmail=function(){return "prof@x";};');
  const L = Object.assign({}, Q, { _expMotivo: 'porque sim', id: undefined, status: undefined });
  run('igLoteToQueue(' + JSON.stringify(L) + ')');
  const fila = JSON.parse(run('JSON.stringify(igStories[0])'));
  ok(fila.expImg === Q.expImg && fila.expImgRef === Q.expImgRef && fila.expImgTema === Q.expImgTema && fila.expImgOrigem === 'resumo', 'a figura do comentário se perdeu do lote para a fila');
  ok(!('_expMotivo' in fila), 'o porquê da escolha (só para a tela do professor) foi gravado na fila');
  run('igLoteToQueue(' + JSON.stringify(QG) + ')');
  const sem = JSON.parse(run('JSON.stringify(igStories[1])'));
  ok(!('expImg' in sem) && !('expImgOrigem' in sem), 'questão sem figura no comentário ganhou campos vazios');
  const pend = JSON.parse(run('JSON.stringify(igMakePending(' + JSON.stringify(L) + '))'));
  ok(pend.expImg === Q.expImg && pend.status === 'pending' && !('_expMotivo' in pend), 'a figura do comentário se perdeu do lote para as Pendências');
  run('igPending=[' + JSON.stringify(pend) + '];');
  doc.getElementById('adm-main').innerHTML = run('admPendCardHTML(igPending[0])');
  ok(!!doc.querySelector('#adm-main .qp-expfig') && !!doc.getElementById('pend-rmexp-' + pend.id), 'o revisor não vê a figura do comentário nem a opção de tirá-la');
  run('igStories=[];pendApprove(' + JSON.stringify(pend.id) + ')');
  ok(JSON.parse(run('JSON.stringify(igStories[0]||{})')).expImg === Q.expImg, 'aprovar nas Pendências perdeu a figura do comentário');
  run('igPending=[' + JSON.stringify(Object.assign({}, pend, { id: 'igp-2' })) + '];');
  doc.getElementById('adm-main').innerHTML = run('admPendCardHTML(igPending[0])');
  doc.getElementById('pend-rmexp-igp-2').checked = true;
  run('igStories=[];pendApprove("igp-2")');
  const tirada = JSON.parse(run('JSON.stringify(igStories[0]||{})'));
  ok(tirada.stem && !tirada.expImg, 'o revisor marcou "remover imagem do comentário" e ela foi publicada assim mesmo');

  // ── 6. onde a figura é pedida ───────────────────────────────────────────────
  ok(/igGenOneUnica\([^;]*\)\.then\(function\(r\)\{[\s\S]{0,400}?igAttachExpImage\(r\)/.test(html), 'o lote não pede a figura do comentário depois de a questão ficar pronta');
  ok(/igAttachExamImage\(q,d\)\.then\(function\(qq\)\{[\s\S]{0,200}?igAttachExpImage\(qq\)/.test(html), 'o "Gerar 1 com IA" não pede a figura do comentário');
  ok(/uploadAdminAsset\(f,'qotd'\)/.test(html), 'a imagem nova do professor não vai para o armazenamento (em base64 iria na Questão do Dia de cada aluno)');
  ok(/t\.classList\.contains\('qp-zoom'\)/.test(html), 'o ampliador não conhece a classe qp-zoom');
}).catch((e) => { falhas.push('exceção: ' + (e && e.stack || e)); }).then(() => {
  if (falhas.length) {
    console.error('✗ figura do comentário da Questão do Dia:');
    falhas.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ Questão do Dia: figura no comentário dos Resumos ou do PubMed, conferida, só depois da resposta, ampliável, e mantida do lote à publicação');
});
