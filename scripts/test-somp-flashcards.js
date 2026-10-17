// SOMP NO LUGAR DE SOP NOS BARALHOS DOS ALUNOS.
//
// ⚠️ 17/10/2026. O professor adotou SOMP no lugar de SOP. O #876 trocou 8 textos fixos
// de flashcard (FC_SEED e FC_MEMBER). Como a semente casa pelo texto da frente, o
// painel do professor publicou 7 cartões gêmeos no fc_shared, e os baralhos dos alunos
// receberam a versão SOMP ao lado da SOP antiga. Agora o seedFlashcards renomeia os
// cards SEED (sompFcDeck) antes da auto-cura por frente (dedupFcDeck).
//
// 🧨 O QUE ESTE TESTE PRENDE, com as funções recortadas do index.html:
// (1) a troca: nome por extenso, sigla e caixa alta; nomes antigos e títulos
//     protegidos; idempotente;
// (2) os textos fixos de hoje são ponto fixo da troca, e os 8 textos de antes do #876
//     viram exatamente os de hoje: amostra, fc_shared e baralho casam;
// (3) baralho de membro com o card antigo e os gêmeos: sobra um card por frente, o
//     antigo (com o histórico de revisão), e o card criado pelo aluno não muda;
// (4) o card que o aluno deletou antes não volta com o nome novo (ledger);
// (5) a renomeação roda antes do dedupFcDeck;
// (6) todo rótulo das regras de tema (FC_TEMA_RULES) está na lista de temas da área
//     (FC_SUBTOPICS). O #876 trocou o rótulo para 'SOMP' só nas regras, e a lista de
//     Endocrinologia Feminina continuou com 'SOP': o mesmo assunto saía em dois temas.
// Uso: node scripts/test-somp-flashcards.js [index.html alternativo, para mutação]
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

function trecho(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) throw new Error('não achei function ' + nome);
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j < 0 ? undefined : j);
}
function constante(nome) {
  const i = SRC.indexOf('var ' + nome + '={');
  if (i < 0) throw new Error('não achei var ' + nome);
  return SRC.slice(i, SRC.indexOf('\n};', i) + 3);
}
function mundo(fc, ledgers, fcShared) {
  const store = Object.assign({}, JSON.parse(JSON.stringify(ledgers || {})));
  const ctx = vm.createContext({
    console, DB: { fc: JSON.parse(JSON.stringify(fc || [])) }, fcShared: fcShared || [],
    lsGet: (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
    lsSet: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); },
    isDegustacao: () => false, canonSub: (s) => s, store,
  });
  vm.runInContext([constante('FC_SEED'), constante('FC_MEMBER'), trecho('sompTxt'), trecho('sompChaveFc'),
    trecho('sompFcDeck'), trecho('dedupFcDeck'), trecho('seedFlashcards'),
    'this.FC_SEED=FC_SEED;this.FC_MEMBER=FC_MEMBER;'].join('\n'), ctx);
  return ctx;
}
const M = mundo();
const t = (s) => M.sompTxt(s);

// (1) a troca
const casos = [
  ['Critérios de Rotterdam para SOP?', 'Critérios de Rotterdam para SOMP (antiga SOP)?'],
  ['Critérios de Rotterdam para SOMP (antiga SOP)?', 'Critérios de Rotterdam para SOMP (antiga SOP)?'],
  ['**Síndrome dos ovários policísticos (SOP)** é comum. Na SOP, o LH sobe.',
   '**Síndrome ovariana metabólica poliendócrina (SOMP)** é comum. Na SOMP, o LH sobe.'],
  ['SÍNDROME DOS OVÁRIOS POLICÍSTICOS', 'SÍNDROME OVARIANA METABÓLICA POLIENDÓCRINA'],
  ['Síndrome dos Ovários Policísticos', 'Síndrome Ovariana Metabólica Poliendócrina'],
  ['Primeira linha na SOP sem desejo de gestar?', 'Primeira linha na SOMP sem desejo de gestar?'],
  ['Diretriz Internacional de SOP 2023', 'Diretriz Internacional de SOP 2023'],
  ['segundo a diretriz de SOP', 'segundo a diretriz de SOP'],
  ['o termo SOP segue em uso', 'o termo SOP segue em uso'],
  ['SOMP (antiga SOP)', 'SOMP (antiga SOP)'],
  ['antiga síndrome dos ovários policísticos (SOP)', 'antiga síndrome dos ovários policísticos (SOP)'],
  ['as diretrizes internacionais de SOP', 'as diretrizes internacionais de SOP'],
  ['ovários policísticos ao US', 'ovários policísticos ao US'],
  ['SOPs e POP', 'SOPs e POP'],
  ['Hirsutismo com escore ≥ 4–6 (SOP 2023)', 'Hirsutismo com escore ≥ 4–6 (SOP 2023)'],
];
for (const [de, para] of casos) {
  ok(t(de) === para, '(1) ' + JSON.stringify(de) + ' → ' + JSON.stringify(t(de)) + ', esperado ' + JSON.stringify(para));
  ok(t(t(de)) === t(de), '(1) a troca não é idempotente em ' + JSON.stringify(de));
}
ok(M.sompChaveFc('critérios de rotterdam para sop?') === 'critérios de rotterdam para somp (antiga sop)?', '(1) chave de ledger de Rotterdam: ' + M.sompChaveFc('critérios de rotterdam para sop?'));
ok(M.sompChaveFc('por que usar metformina na sop?') === 'por que usar metformina na somp?', '(1) chave de ledger: ' + M.sompChaveFc('por que usar metformina na sop?'));

// (2) textos fixos: ponto fixo, e os de antes do #876 viram os de hoje
const fixos = [];
for (const set of [M.FC_SEED, M.FC_MEMBER]) for (const cat of Object.keys(set)) for (const p of set[cat]) fixos.push(p);
for (const [f, b] of fixos) ok(t(f) === f && t(b) === b, '(2) texto fixo muda com a troca: ' + f);
const ANTES_876 = [
  ['Critérios de Rotterdam para SOP?', '2 de 3: oligo/anovulação, hiperandrogenismo (clínico ou laboratorial) e ovários policísticos ao US, após excluir outras causas.'],
  ['Primeira linha na SOP sem desejo de gestar?', 'Mudança de estilo de vida + anticoncepcional combinado; metformina se houver alteração metabólica.'],
  ['Causa mais comum de amenorreia secundária?', 'Gestação. Depois: SOP, amenorreia hipotalâmica funcional, hiperprolactinemia e falência ovariana.'],
  ['Manifestações de hiperandrogenismo na SOP?', 'Hirsutismo, acne e alopecia androgenética.'],
  ['Por que usar metformina na SOP?', 'Melhora a resistência insulínica e auxilia no controle metabólico, podendo regularizar ciclos.'],
  ['Risco endometrial na SOP e prevenção?', 'A anovulação crônica aumenta o risco de hiperplasia/câncer de endométrio; progestágeno ou ACO protege.'],
  ['Riscos metabólicos a rastrear na SOP?', 'Intolerância à glicose/DM2, dislipidemia e síndrome metabólica.'],
  ['Indução de ovulação na SOP: opções?', 'Letrozol (1ª linha) e citrato de clomifeno; metformina como adjuvante.'],
];
for (const [f, b] of ANTES_876) {
  const hoje = fixos.find((p) => p[0] === t(f));
  ok(hoje && hoje[1] === t(b), '(2) o texto de antes do #876 não vira o de hoje: ' + f + ' → ' + t(f));
}

// (3) baralho de membro com o card antigo e os gêmeos
const FEM = 'Endocrinologia Feminina';
// Ledger de um membro semeado antes do #876: as frentes que mudaram entram com o texto
// antigo; a única chave nova é a do gêmeo que ele recebeu depois do #876 (id 3).
const antigaDe = {};
for (const [f] of ANTES_876) if (t(f) !== f) antigaDe[t(f)] = f;
const ledgerMembro = { 'primeira linha na somp sem desejo de gestar?': 1 };
for (const cat of Object.keys(M.FC_MEMBER)) for (const p of M.FC_MEMBER[cat]) ledgerMembro[(antigaDe[p[0]] || p[0]).trim().toLowerCase()] = 1;
ok(!ledgerMembro['por que usar metformina na somp?'] && ledgerMembro['por que usar metformina na sop?'], '(4) o cenário precisa do ledger só com a chave antiga da metformina');
const baralho = [
  { id: 1, front: 'Critérios de Rotterdam para SOP?', back: ANTES_876[0][1], cat: FEM, seed: true, box: 4, due: 111 },
  { id: 2, front: 'Primeira linha na SOP sem desejo de gestar?', back: ANTES_876[1][1], cat: FEM, seed: true, member: true, box: 3, due: 222 },
  { id: 3, front: 'Primeira linha na SOMP sem desejo de gestar?', back: ANTES_876[1][1], cat: FEM, seed: true, member: true, box: 1, due: 333 },
  { id: 4, front: 'Critérios de Rotterdam para SOMP (antiga SOP)?', back: ANTES_876[0][1], cat: FEM, seed: true, shared: true, box: 1, due: 444 },
  { id: 5, front: 'Minha anotação sobre SOP', back: 'SOP e insulina', cat: FEM, seed: false, box: 2, due: 555 },
];
const W = mundo(baralho, { fc_member_seeded: ledgerMembro, fc_shared_seeded: { 'critérios de rotterdam para somp (antiga sop)?': 1 } });
W.seedFlashcards();
const fc = W.DB.fc;
const frentes = fc.map((c) => String(c.front).trim().toLowerCase());
ok(new Set(frentes).size === frentes.length, '(3) sobrou frente duplicada: ' + frentes.filter((f, i) => frentes.indexOf(f) !== i).join(' | '));
const rot = fc.filter((c) => c.front === 'Critérios de Rotterdam para SOMP (antiga SOP)?');
ok(rot.length === 1 && rot[0].id === 1 && rot[0].box === 4, '(3) Rotterdam: devia sobrar o card antigo (id 1, caixa 4): ' + JSON.stringify(rot));
ok(rot.length === 1 && rot[0].shared === true, '(3) Rotterdam: a marca de publicado do gêmeo devia passar ao card antigo');
const pl = fc.filter((c) => c.front === 'Primeira linha na SOMP sem desejo de gestar?');
ok(pl.length === 1 && pl[0].id === 2 && pl[0].box === 3, '(3) primeira linha: devia sobrar o card antigo (id 2, caixa 3): ' + JSON.stringify(pl));
ok(!fc.some((c) => c.seed && (t(c.front) !== c.front || t(c.back) !== c.back)), '(3) sobrou card SEED com o nome antigo');
const meu = fc.find((c) => c.id === 5);
ok(meu && meu.front === 'Minha anotação sobre SOP' && meu.back === 'SOP e insulina', '(3) o card criado pelo aluno mudou');

// (4) card deletado antes não volta com o nome novo
ok(!fc.some((c) => /metformina na SOMP/.test(c.front)), '(4) o card de metformina, deletado pelo aluno, voltou com o nome novo');
ok(W.store.fc_member_seeded && W.store.fc_member_seeded['por que usar metformina na somp?'] === 1, '(4) o ledger do membro não ganhou a chave nova');

// (5) a renomeação roda antes da auto-cura
const corpo = trecho('seedFlashcards');
ok(corpo.indexOf('sompFcDeck()') > 0 && corpo.indexOf('sompFcDeck()') < corpo.indexOf('dedupFcDeck()'), '(5) o sompFcDeck tem de rodar antes do dedupFcDeck');

// (6) rótulos das regras de tema na lista de temas da área
const T = vm.createContext({});
vm.runInContext(constante('FC_SUBTOPICS') + constante('FC_TEMA_RULES') + 'this.S=FC_SUBTOPICS;this.R=FC_TEMA_RULES;', T);
for (const sub of Object.keys(T.R)) for (const [rotulo] of T.R[sub]) {
  ok((T.S[sub] || []).indexOf(rotulo) >= 0, '(6) o tema "' + rotulo + '" das regras de ' + sub + ' não está em FC_SUBTOPICS');
}

if (falhas.length) { console.log(falhas.length + ' falha(s):\n- ' + falhas.join('\n- ')); process.exit(1); }
console.log('SOMP nos baralhos: ok (' + casos.length + ' trocas, ' + fixos.length + ' textos fixos, cenário de membro)');
