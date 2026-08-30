// Regressão das JANELAS DE ENTRADA do aluno (primeira questão + enquete da EMC).
//
// ⚠️ POR QUE ESTE TESTE EXISTE (30/08/2026). O professor mandou o print do Mural
// e pediu duas coisas: a enquete do Programa de Educação Médica Continuada
// "aparecendo na janela assim que o aluno abre a plataforma — depois que
// responder, não abrir novamente"; e a "Sua primeira questão" logo depois da
// janela inicial de perfil, esclarecendo em seguida: "no primeiro acesso ele vai
// ter aquela janela de se é endocrino, residente, etc; depois de responder isso,
// aí sim mostrar a Primeira questão". E a enquete, "somente para quem é
// assinante do plano Gold".
//
// 🧨 O QUE PODE DAR ERRADO AQUI NÃO É O MARKUP — É A DECISÃO. Uma janela que
// abre para quem não devia é pior que uma que não abre: ela pergunta de novo o
// que o aluno já respondeu, e é irreversível do ponto de vista da confiança.
// Por isso a fila é EXECUTADA de verdade neste teste, num DOM de mentira, em vez
// de conferida por texto: conferir texto prova que a linha existe, não que ela
// escolhe certo.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

// ── O bloco da fila, recortado do index.html e rodado de verdade ───────────
const i0 = html.indexOf('var filaEntradaVista={};');
const i1 = html.indexOf('function fecharJanelaEntrada(id){');
ok(i0 > 0 && i1 > i0, 'o bloco da fila de janelas de entrada sumiu do index.html');
const CORPO = i0 > 0 && i1 > i0 ? html.slice(i0, html.indexOf('\n}', i1) + 2) : '';

// Monta um mundo mínimo: elementos com `style`, relógio controlado, e as
// consultas que a fila faz. `cenario` descreve o aluno.
function mundo(cenario) {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id: id, style: { display: 'none' } });
  ['ativa-modal', 'cme-modal', 'onboard-modal', 'whatsnew-modal'].forEach(el);
  const timers = [];
  const ctx = vm.createContext({
    console: console,
    // relógio de mentira: nada dispara sozinho, o teste é que avança
    setTimeout: (fn, ms) => { timers.push({ fn: fn, ms: ms }); return timers.length; },
    clearTimeout: () => {},
    document: {
      getElementById: (id) => els[id] || null,
      querySelectorAll: (sel) => (sel === '.modal-bg'
        ? { forEach: (f) => Object.keys(els).map((k) => els[k]).forEach(f) }
        : { forEach: () => {} })
    },
    currentUser: cenario.user === undefined ? { role: 'aluno' } : cenario.user,
    remoteStateLoaded: cenario.hydratado !== false,
    canUseRemoteState: () => cenario.remoto !== false,
    anyModalOpen: () => Object.keys(els).some((k) => els[k].style.display === 'flex'),
    precisaAtivacao: () => !!cenario.nuncaEstudou,
    qotdTodays: () => (cenario.temQotd === false ? null : { id: 'q1', answer: 'A' }),
    cmeElegivel: () => !!cenario.gold,
    cmeVoto: () => (cenario.jaVotou ? { temas: ['Diabetes'] } : null),
    renderAtivacao: () => { ctx._render = (ctx._render || []).concat('ativa'); },
    renderEnqueteCme: () => { ctx._render = (ctx._render || []).concat('cme'); }
  });
  vm.runInContext(CORPO, ctx);
  ctx._els = els; ctx._timers = timers;
  // A fila é agendada, não imediata: dispara o timer que ela acabou de criar.
  ctx.correr = () => {
    vm.runInContext('filaEntradaAgendar();', ctx);
    let voltas = 0;
    while (timers.length && voltas++ < 200) { const t = timers.shift(); t.fn(); }
  };
  ctx.aberta = (id) => els[id].style.display === 'flex';
  return ctx;
}

// ── 1. Aluno novo do Gold: primeira questão ANTES, enquete DEPOIS ─────────
// A ordem é a que o professor descreveu: a questão vem colada na janela
// inicial; a enquete vem em seguida.
{
  const m = mundo({ nuncaEstudou: true, gold: true });
  m.correr();
  ok(m.aberta('ativa-modal'), '⚠️ o aluno novo não recebeu a janela da primeira questão');
  ok(!m.aberta('cme-modal'), '⚠️ as DUAS janelas abriram juntas — sobrepostas viram uma ilegível e o aluno fecha as duas');
  vm.runInContext("fecharJanelaEntrada('ativa-modal');", m);
  ok(!m.aberta('ativa-modal'), 'fechar a janela da primeira questão não a fechou');
  ok(m.aberta('cme-modal'), '⚠️ fechada a primeira, a enquete não veio — a fila parou no meio');
}

// ── 2. "Depois que responder, não abrir novamente" ────────────────────────
// É o pedido literal. O voto mora no `app_state` do aluno, então esta guarda
// vale também no segundo aparelho.
{
  const m = mundo({ nuncaEstudou: false, gold: true, jaVotou: true });
  m.correr();
  ok(!m.aberta('cme-modal'),
    '⚠️ a enquete reabriu para quem JÁ RESPONDEU — é exatamente o "depois que responder, não abrir novamente" do pedido');
}

// ── 3. A enquete é SÓ do Gold ─────────────────────────────────────────────
// "E a enquete mostrar somente para quem é assinante do plano Gold." Abrir para
// um plano menor é prometer aula que ele não vai poder assistir.
{
  const m = mundo({ nuncaEstudou: false, gold: false });
  m.correr();
  ok(!m.aberta('cme-modal'),
    '⚠️ a enquete abriu para quem NÃO é Gold — o programa é exclusivo do plano, e perguntar cria expectativa que a assinatura dele não cobre');
}

// ── 4. Quem já estuda não recebe "sua primeira questão" ───────────────────
{
  const m = mundo({ nuncaEstudou: false, gold: true });
  m.correr();
  ok(!m.aberta('ativa-modal'),
    '⚠️ a janela da primeira questão abriu para quem já respondeu questões');
  ok(m.aberta('cme-modal'), 'o aluno Gold sem voto deveria receber a enquete mesmo já estudando');
}

// ── 5. NUNCA antes do servidor responder ──────────────────────────────────
// 🧨 A ARMADILHA CENTRAL. `cmeVoto()` e `precisaAtivacao()` leem estado que vem
// do `app_state` no hydrate. Decidir antes é decidir sobre o localStorage de um
// navegador que pode estar vazio: a enquete voltaria para quem já votou no
// celular e a primeira questão apareceria para quem estuda há meses.
{
  const m = mundo({ nuncaEstudou: true, gold: true, hydratado: false });
  m.correr();
  ok(!m.aberta('ativa-modal') && !m.aberta('cme-modal'),
    '⚠️ a fila abriu ANTES do hydrate — é assim que a enquete volta para quem já respondeu em outro aparelho');
  ok(m._timers.length === 0, 'a espera pelo hydrate tem de reagendar (o teste esgotou as voltas sem abrir, mas sem reagendar ela nunca abre)');
  // Chegou o estado do servidor: agora sim.
  m.remoteStateLoaded = true;
  m.correr();
  ok(m.aberta('ativa-modal'), 'depois do hydrate a fila tem de destravar');
}

// ── 6. Sem sessão remota (demo) a fila não fica travada ───────────────────
// A guarda é `canUseRemoteState() && !remoteStateLoaded`. Numa conta demo não há
// hydrate para esperar — travar ali deixaria a janela sem nunca abrir.
{
  const m = mundo({ nuncaEstudou: true, gold: true, hydratado: false, remoto: false });
  m.correr();
  ok(m.aberta('ativa-modal'),
    '⚠️ a fila travou esperando um hydrate que não existe (conta demo) — a janela nunca abriria');
}

// ── 7. Não empilha sobre outra janela ─────────────────────────────────────
// Onboarding, novidades e convite de feedback disputam a entrada.
{
  const m = mundo({ nuncaEstudou: true, gold: true });
  m._els['onboard-modal'].style.display = 'flex';   // janela inicial de perfil aberta
  m.correr();
  ok(!m.aberta('ativa-modal'),
    '⚠️ a primeira questão abriu POR CIMA da janela inicial de perfil — o pedido é que ela venha DEPOIS de respondê-la');
  m._els['onboard-modal'].style.display = 'none';
  m.correr();
  ok(m.aberta('ativa-modal'), 'fechada a janela inicial, a primeira questão tem de aparecer');
}

// ── 8. Uma vez por sessão, mesmo se o aluno fechar sem responder ──────────
// Fechar e ver a janela voltar na mesma sessão é a diferença entre um convite e
// um incômodo. O card do Mural continua lá para quem quiser responder depois.
{
  const m = mundo({ nuncaEstudou: true, gold: true });
  m.correr();
  vm.runInContext("fecharJanelaEntrada('ativa-modal');fecharJanelaEntrada('cme-modal');", m);
  m.correr();
  ok(!m.aberta('ativa-modal') && !m.aberta('cme-modal'),
    '⚠️ a janela reabriu na MESMA sessão depois de fechada — convite que insiste vira incômodo');
}

// ── 9. Professor não é público-alvo ───────────────────────────────────────
{
  const m = mundo({ nuncaEstudou: true, gold: true, user: { role: 'admin' } });
  m.correr();
  ok(!m.aberta('ativa-modal') && !m.aberta('cme-modal'), 'a fila abriu janela de aluno para o professor');
  const v = mundo({ nuncaEstudou: true, gold: true, user: null });
  v.correr();
  ok(!v.aberta('ativa-modal') && !v.aberta('cme-modal'), 'a fila abriu janela sem ninguém logado');
}

// ── 10. Sem questão publicada não há o que oferecer ───────────────────────
{
  const m = mundo({ nuncaEstudou: true, gold: true, temQotd: false });
  m.correr();
  ok(!m.aberta('ativa-modal'),
    '⚠️ a janela abriu sem questão do dia publicada — o aluno veria um convite vazio');
}

// ── 11. O conteúdo é o MESMO dos cards, não uma cópia ─────────────────────
// 🧨 Markup duplicado diverge na primeira correção, e a correção vai para a
// cópia errada. Os hosts da janela são um terceiro ALVO das mesmas funções.
{
  ok(/\['ativa-card','ativa-card-mural','ativa-card-modal'\]/.test(html),
    '⚠️ o host da janela saiu da lista de alvos de `renderAtivacao` — a janela abriria vazia');
  ok(/\['cme-card', 'cme-card-mural', 'cme-card-modal'\]/.test(html),
    '⚠️ o host da janela saiu da lista de alvos de `renderEnqueteCme`');
  ok(html.indexOf('id="ativa-card-modal"') > 0 && html.indexOf('id="cme-card-modal"') > 0,
    'os hosts das janelas sumiram do markup');
  // Os cards do Mural CONTINUAM: a janela é um convite a mais, não o único caminho.
  ok(html.indexOf('id="ativa-card-mural"') > 0 && html.indexOf('id="cme-card-mural"') > 0,
    '⚠️ o card do Mural sumiu — quem fechar a janela sem responder ficaria sem caminho nenhum');
}

// ── 12. Os ganchos que fazem a fila rodar ─────────────────────────────────
{
  ok(/maybeOnboardAfterHydrate\(\);\s*\n\s*try\{filaEntradaAgendar\(\);\}catch\(e\)\{\}/.test(html),
    '⚠️ a fila deixou de ser chamada ao fim do hydrate — sem esse gancho ela nunca roda para quem já tem perfil');
  const nOnboard = (html.match(/try\{filaEntradaAgendar\(\);\}catch\(e\)\{\} \/\/ respondeu o perfil/g) || []).length;
  ok(nOnboard === 2,
    '⚠️ o gancho do fim do onboarding tem de existir nos DOIS caminhos (Estudante e médico), veio ' + nOnboard
    + ' — no caminho `pendingOnboardCheck` o hydrate já terminou antes da janela abrir, e o `.then` não roda de novo');
  ok(/dismissWhatsNew[\s\S]{0,220}filaEntradaAgendar/.test(html),
    'fechar as novidades tem de destravar a fila, senão ela fica esperando o tempo todo');
  // O envio do voto fecha a janela na hora.
  const iEnv = html.indexOf("DB.enqueteCme = { temas:");
  const bloco = html.slice(iEnv, iEnv + 900);
  ok(/fecharJanelaEntrada\('cme-modal'\)/.test(bloco),
    '⚠️ votar não fecha a janela da enquete — o aluno responderia e continuaria olhando o formulário');
}

// ── 13. Os botões de fechar estão ligados ─────────────────────────────────
{
  ["'ativa-modal-x','ativa-modal-depois'", "'cme-modal-x','cme-modal-depois'"].forEach((par) => {
    ok(html.indexOf('[' + par + '].forEach') > 0, 'a fiação dos botões de fechar (' + par + ') sumiu');
  });
  // ⚠️ "Ver meu painel →" nasce no innerHTML e é redesenhado a cada render: um
  // listener preso nele morre no primeiro redesenho. Tem de ser ouvido na janela.
  ok(/jaM\.addEventListener\('click',function\(ev\)\{[\s\S]{0,160}ativa-card-modal-ir/.test(html),
    '⚠️ o clique em "Ver meu painel" deixou de ser ouvido na JANELA — preso no botão, ele morre no primeiro redesenho do card');
}

if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
console.log('✓ janelas de entrada: primeira questão depois do perfil, enquete só do Gold e só até o voto, uma de cada vez e nunca antes do hydrate');
