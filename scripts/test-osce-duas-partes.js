#!/usr/bin/env node
// OSCE EM DUAS PARTES (11/11/2026).
//
// Pedido do professor: "deixar o tempo de geração do caso menor sem comprometer a
// qualidade". A 1ª parte escreve a vinheta, o roteiro (plano dos 4 passos, que o aluno não
// vê) e o passo 1, e o caso abre. A 2ª parte escreve os passos 2–4 por trás, com a vinheta,
// o passo 1 e o roteiro na mão.
//
// 🧨 Os modos de quebrar isto em silêncio:
//  - a 2ª parte não receber a vinheta, o passo 1 ou o roteiro (o caso perde a coerência);
//  - o caso acabar no passo 1 porque a 2ª parte ainda não chegou (finishSim cedo demais);
//  - a resposta atrasada de um caso abandonado entrar no caso novo;
//  - a 2ª parte repetir o passo 1 (o aluno responderia a mesma pergunta duas vezes);
//  - uma falha na 2ª parte deixar o aluno sem saída (sem "Tentar de novo");
//  - o roteiro aparecer para o aluno;
//  - as duas partes usarem áreas diferentes (o cache das diretrizes e da área não serviria).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function bloco(inicio) {
  const i = html.indexOf(inicio);
  if (i < 0) return '';
  let j = html.indexOf('{', i), n = 0;
  for (; j < html.length; j++) { if (html[j] === '{') n++; else if (html[j] === '}') { n--; if (!n) break; } }
  return html.slice(i, j + 1);
}
const pecas = [
  (html.match(/var SIM_PASSOS=\d+;/) || [''])[0],
  (html.match(/var SIM_REGRAS='[^\n]*';/) || [''])[0],
  bloco('function simPassoSchema(mode){'), bloco('function simSysParte1(mode){'), bloco('function simSysParte2(mode){'),
  bloco('function simPedidoParte2(st){'), bloco('function simPassosResto(d,p1){'), bloco('function simGerarResto(estado){'),
  'var renderSimStep;' + bloco('renderSimStep=function(){'),
];
ok('peças do OSCE em duas partes encontradas', pecas.every(Boolean), pecas.map((p) => !!p).join(','));

// ---- ambiente mínimo ----------------------------------------------------------------------------
function ambiente() {
  const els = {};
  const el = (id) => (els[id] = els[id] || { id, innerHTML: '', ouvintes: [], addEventListener(t, f) { this.ouvintes.push(f); }, get scrollHeight() { return 0; } });
  const pedidos = [];
  const ctx = {
    console, Promise, Error, JSON, String, Array, Math,
    CLINICAL_GUIDELINES: 'DIRETRIZES', AI_MODEL_SIM_GEN: 'modelo-teste',
    groundSys: (s) => 'DIRETRIZES__SPLIT__' + s,
    esc: (s) => String(s),
    ldHTML: (t) => '<carregando>' + (t || '') + '</carregando>',
    withTimeout: (p) => p, simRetry: (f) => f(),
    callAIJson: (sys, usr, maxTok, ret, model, grounding, opts) => new Promise((res, rej) => { pedidos.push({ sys, usr, maxTok, model, opts, res, rej }); }),
    updateSimCounter() {}, finishSim() { ctx.terminou = (ctx.terminou || 0) + 1; },
    document: { getElementById: el },
    terminou: 0,
  };
  vm.createContext(ctx);
  vm.runInContext(pecas.join('\n') + '\nthis.renderSimStep=renderSimStep;this.simGerarResto=simGerarResto;this.simPassosResto=simPassosResto;this.simPedidoParte2=simPedidoParte2;this.simSysParte1=simSysParte1;this.simSysParte2=simSysParte2;', ctx);
  return { ctx, els, pedidos };
}
const tique = () => new Promise((r) => setImmediate(r));
let terminouTeste = false;
process.on('exit', () => { if (!terminouTeste) { console.log('  ✗ o teste não chegou ao fim (promessa pendurada)'); process.exitCode = 1; } });

(async () => {
  // ---- 1. os pedidos ------------------------------------------------------------------------------
  {
    const { ctx } = ambiente();
    const s1 = ctx.simSysParte1('mc'), s2 = ctx.simSysParte2('mc'), a1 = ctx.simSysParte1('open');
    ok('parte 1: só vinheta, roteiro e passo 1', /"intro":/.test(s1) && /"roteiro":/.test(s1) && /com UM item em steps \(o passo 1\)/.test(s1) && /EXATAMENTE 4 passos PROGRESSIVOS/.test(s1));
    ok('parte 2: passos 2, 3 e 4, sem reescrever a vinheta nem o passo 1', /com EXATAMENTE 3 itens \(os passos 2, 3 e 4\)/.test(s2) && /NÃO os reescreva nem os repita/.test(s2) && !/"intro":/.test(s2));
    ok('as duas partes têm as mesmas regras de rigor', [s1, s2].every((x) => /RIGOR TÉCNICO/.test(x) && /As distratoras devem ser plausíveis/.test(x) && /doença renal do diabetes/.test(x)));
    ok('múltipla escolha pede alternativas; resposta aberta pede a resposta ideal', /"options":/.test(s1) && /"correct":/.test(s1) && !/"options":/.test(a1) && /"ideal":/.test(a1));
    const st = { sub: 'Adrenal', tema: 'Incidentaloma adrenal', level: 'avancado', mode: 'mc', roteiro: 'Dx: adenoma. 2: rastreio hormonal…', data: { intro: 'Mulher, 54 anos, nódulo adrenal de 3,2 cm…', steps: [{ pergunta: 'Qual a primeira pergunta?', options: { A: 'a' }, correct: 'A' }] } };
    const u = ctx.simPedidoParte2(st);
    ok('🧨 a parte 2 recebe a vinheta, o passo 1 e o roteiro', u.includes('Mulher, 54 anos, nódulo adrenal de 3,2 cm') && u.includes('"pergunta":"Qual a primeira pergunta?"') && u.includes('Dx: adenoma. 2: rastreio hormonal'));
    ok('a parte 2 recebe o tema como obrigatório', u.includes('— tema obrigatório do caso: Incidentaloma adrenal') && u.includes('complexidade avancado'));
    const r = ctx.simPassosResto({ steps: [{ pergunta: 'Qual a primeira pergunta?' }, { pergunta: 'P2' }, { pergunta: 'P3' }, { pergunta: 'P4' }, { pergunta: 'P5' }] }, st.data.steps[0]);
    ok('🧨 a parte 2 que repete o passo 1 é limpa, e fica com até 3 passos', r.length === 3 && r[0].pergunta === 'P2' && r[2].pergunta === 'P4');
    ok('resto vazio ou sem pergunta vira lista vazia', ctx.simPassosResto({ steps: [{}, null] }, {}).length === 0 && ctx.simPassosResto(null, {}).length === 0);
  }

  // ---- 2. o caso espera a 2ª parte, não termina no passo 1 ---------------------------------------
  {
    const { ctx, els, pedidos } = ambiente();
    const st = { mode: 'mc', sub: 'Tireoide', tema: '', level: 'medio', roteiro: 'r', simOpts: { area: 'Tireoide' }, totalPassos: 4, step: 0,
      data: { intro: 'Vinheta', steps: [{ pergunta: 'P1', options: { A: 'x' }, correct: 'A' }] } };
    ctx.simState = st;
    ctx.simGerarResto(st);
    ok('a parte 2 sai com a MESMA área (simOpts) e 3000 tokens', pedidos.length === 1 && pedidos[0].opts === st.simOpts && pedidos[0].maxTok === 3000 && pedidos[0].model === 'modelo-teste');
    st.step = 1; // o aluno já respondeu o passo 1
    ctx.renderSimStep();
    ok('🧨 passo 2 ainda não chegou: mostra "Preparando o próximo passo" e NÃO termina o caso', /Preparando o próximo passo/.test(els['sim-input-wrap'].innerHTML) && ctx.terminou === 0);
    pedidos[0].res({ steps: [{ pergunta: 'P2', options: { A: 'y' }, correct: 'A' }, { pergunta: 'P3' }, { pergunta: 'P4' }] });
    await tique(); await tique(); await tique();
    ok('chegou: o caso fica com 4 passos e o passo 2 aparece', st.data.steps.length === 4 && /Passo 2:<\/strong> P2/.test(els['sim-msgs'].innerHTML) && ctx.terminou === 0);
    st.step = 4; ctx.renderSimStep();
    ok('depois do 4º passo, o caso termina', ctx.terminou === 1);
  }

  // ---- 3. resposta atrasada de um caso abandonado -------------------------------------------------
  {
    const { ctx, pedidos } = ambiente();
    const velho = { mode: 'mc', data: { intro: 'v', steps: [{ pergunta: 'P1' }] }, simOpts: {} };
    ctx.simState = velho;
    ctx.simGerarResto(velho);
    const novo = { mode: 'mc', data: { intro: 'n', steps: [{ pergunta: 'N1' }] }, simOpts: {} };
    ctx.simState = novo;
    pedidos[0].res({ steps: [{ pergunta: 'V2' }, { pergunta: 'V3' }, { pergunta: 'V4' }] });
    await tique(); await tique();
    ok('🧨 a resposta atrasada do caso abandonado não entra no caso novo', novo.data.steps.length === 1 && novo.data.steps[0].pergunta === 'N1');
  }

  // ---- 4. falha na 2ª parte: o aluno tem saída -----------------------------------------------------
  {
    const { ctx, els, pedidos } = ambiente();
    const st = { mode: 'mc', data: { intro: 'v', steps: [{ pergunta: 'P1' }] }, simOpts: {}, step: 1, totalPassos: 4 };
    ctx.simState = st;
    ctx.simGerarResto(st);
    pedidos[0].rej(new Error('rede'));
    await tique(); await tique();
    ctx.renderSimStep();
    ok('🧨 falhou: mensagem e botão "Tentar de novo", sem terminar o caso', /Não consegui preparar o próximo passo/.test(els['sim-input-wrap'].innerHTML) && /id="btn-sim-resto"/.test(els['sim-input-wrap'].innerHTML) && ctx.terminou === 0);
    els['btn-sim-resto'].ouvintes.forEach((f) => f());
    ok('"Tentar de novo" pede a 2ª parte outra vez e volta a esperar', pedidos.length === 2 && /Preparando o próximo passo/.test(els['sim-input-wrap'].innerHTML));
    pedidos[1].res({ steps: [{ pergunta: 'P2' }, { pergunta: 'P3' }, { pergunta: 'P4' }] });
    await tique(); await tique(); await tique();
    ok('na 2ª tentativa, o caso segue', st.data.steps.length === 4 && !st.restoErro);
  }

  // ---- 4b. o leitor conserta o fechamento errado das alternativas --------------------------------
  {
    const ctxP = { JSON, String }; vm.createContext(ctxP);
    vm.runInContext(bloco('function parseJ(raw){') + ';this.p=parseJ;', ctxP);
    const A = '{"intro":"v","steps":[{"pergunta":"p","options":{"A":"a","B":"b","C":"c","D":"d"';
    const r1 = ctxP.p(A + '}],"correct":"A","feedback":"f"}]}');   // chave+colchete (visto 2×)
    const r2 = ctxP.p(A + '],"correct":"A","feedback":"f"}]}');    // só colchete (visto 1×)
    ok('🧨 alternativas fechadas com chave+colchete: lidas, sem pedir tudo de novo', r1 && r1.steps[0].correct === 'A' && Object.keys(r1.steps[0].options).join('') === 'ABCD');
    ok('🧨 alternativas fechadas só com colchete: lidas', r2 && r2.steps[0].correct === 'A' && r2.steps[0].feedback === 'f');
    const q = ctxP.p('{"questions":[{"stem":"s","options":{"A":"a","B":"b"}],"answer":"B"}]}');
    ok('o mesmo conserto vale para "answer" (outros geradores)', q && q.questions[0].answer === 'B');
    ok('JSON válido com alternativas em lista fica igual', JSON.stringify(ctxP.p('{"q":[{"options":["a","b"],"answer":"A"}]}')) === '{"q":[{"options":["a","b"],"answer":"A"}]}');
    ok('texto que não é JSON continua sem leitura', ctxP.p('nada aqui') === null);
    ok('leitor sem chaves literais na expressão do conserto (os testes extraem funções contando chaves)', !/var fx=c\.replace\([^\n]*[{}]/.test(bloco('function parseJ(raw){').replace(/\(\\\{\[\\s\\S\]\*\\\}\)/g, '')));
  }

  // ---- 5. a fiação no startSim ------------------------------------------------------------------------
  const iS = html.lastIndexOf('startSim=function(){');
  const start = html.slice(iS, html.indexOf('renderSimStep=function(){', iS));
  ok('a 1ª parte usa simSysParte1 e no máximo 2000 tokens', /var sys=simSysParte1\(mode\);/.test(start) && /'\.',2000,0,AI_MODEL_SIM_GEN,'',simOpts\);/.test(start));
  ok('🧨 o roteiro sai do que o aluno vê e fica só no estado', /simState\.roteiro=String\(d\.roteiro\|\|''\);delete d\.roteiro;/.test(start));
  ok('a 1ª parte fica só com o passo 1', /d\.steps=d\.steps\.slice\(0,1\);/.test(start));
  ok('a 2ª parte começa assim que o caso abre', start.indexOf('simGerarResto(simState);') > start.indexOf('simState.simOpts=simOpts;simState.totalPassos=SIM_PASSOS;') && start.indexOf('simGerarResto(simState);') < start.indexOf('renderSimStep();'));
  ok('o contador mostra os 4 passos previstos enquanto o resto chega', /total=Math\.max\(\(simState\.data\.steps\|\|\[\]\)\.length,simState\.totalPassos\|\|0\)/.test(html));
  ok('a cota da degustação continua uma por caso (a 2ª parte não gasta)', (start.match(/consumeTrial\('sim'\)/g) || []).length === 1 && !/consumeTrial/.test(bloco('function simGerarResto(estado){')));

  terminouTeste = true;
  if (bad) { console.log('\n' + bad + ' falha(s): OSCE em duas partes'); process.exit(1); }
  console.log('OSCE em duas partes: vinheta e passo 1 primeiro, passos 2–4 por trás, coerentes e sem deixar o aluno preso: ok');
})().catch((e) => { console.log('  ✗ erro no teste: ' + (e && e.stack || e)); process.exit(1); });
