// Feedback do aluno: o envio e o convite automático de quem assina há mais de
// 30 dias. Funções RECORTADAS do index.html de verdade — cópia diverge.
//
// ⚠️ O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR JÁ ESTAVA NO AR.
// Até 03/08/2026 o botão "📤 Enviar" do modal de Feedback só fazia isto:
//     document.getElementById('fb-body').style.display='none';
//     document.getElementById('fb-success').style.display='block';
// O aluno escrevia, via "🎉 Obrigado pelo feedback!", e o texto ia para o lixo.
// Nenhum erro em log, nenhuma tela feia: o feedback simplesmente não existia.
// Como agora a plataforma vai PEDIR feedback a quem já paga há mais de um mês,
// um retorno ao comportamento antigo seria pior do que não pedir nada — por
// isso a primeira verificação abaixo é "o envio saiu do navegador".
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };
const tick = () => new Promise((r) => setImmediate(r));

// Recorta uma função pelo nome, até a próxima declaração no nível zero.
function trecho(nome) {
  const i = SRC.indexOf('function ' + nome + '(');
  if (i < 0) { console.log('  ✗ não achei function ' + nome); bad++; return ''; }
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j < 0 ? undefined : j);
}
// Recorta uma linha `var X=…` do fonte (os limites do convite têm de vir do
// index.html, não de um número reescrito aqui).
function linhaVar(nome) {
  const m = new RegExp('^var ' + nome + '[^\\n]*$', 'm').exec(SRC);
  if (!m) { console.log('  ✗ não achei var ' + nome); bad++; return ''; }
  return m[0];
}

// ---------- DOM de mentira, só com o que estas funções tocam ----------
function novoAmbiente(opts) {
  opts = opts || {};
  const els = {};
  const el = (id) => (els[id] || (els[id] = {
    id, style: {}, value: '', textContent: '', disabled: false,
    classList: { remove() {}, toggle() {} }
  }));
  ['fb-body', 'fb-success', 'fb-text', 'fb-status', 'fb-submit', 'fb-email-wrap',
   'fb-email', 'fb-intro', 'fb-cancel', 'feedback-modal'].forEach(el);
  const outros = (opts.modaisAbertos || []).map((id) => { const e = el(id); e.style.display = 'flex'; return e; });

  const enviados = [];
  const store = {};
  const timers = [];
  const ctx = {
    console, Date, Math, Array, String, JSON, parseInt, RegExp, isNaN,
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    document: {
      getElementById: (id) => els[id] || null,
      querySelectorAll: (sel) => {
        if (sel === '.modal-bg') return [el('feedback-modal')].concat(outros);
        return [];
      }
    },
    AI_API_ENDPOINT: '/api/ai',
    currentUser: opts.currentUser === undefined ? { id: 'u1', email: 'aluno@teste.com', name: 'Aluno', role: 'aluno' } : opts.currentUser,
    notify: (m, t) => { ctx.notificado.push([m, t]); },
    lsGet: (k) => (store[k] === undefined ? null : store[k]),
    lsSet: (k, v) => { store[k] = v; },
    canUseRemoteState: () => opts.sessaoReal !== false,
    getSupabaseClient: () => (opts.semClient ? null : {
      rpc: (nome) => { ctx.rpcs.push(nome); return { then: (onOk) => { onOk({ data: opts.rpc === undefined ? [] : [opts.rpc] }); } }; }
    }),
    fetch: (url, o) => {
      enviados.push({ url, body: JSON.parse(o.body) });
      if (opts.falhaHttp) return Promise.resolve({ ok: false, json: () => Promise.resolve({ ok: false, error: 'Não consegui enviar agora.' }) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
    },
    enviados, store, timers, notificado: [], rpcs: []
  };
  vm.createContext(ctx);
  vm.runInContext([
    linhaVar('fbState'), linhaVar('fbSending'),
    linhaVar('FB_ASK_ATRASO_MS'), linhaVar('FB_ASK_ADIA_DIAS'), linhaVar('FB_ASK_MAX'), linhaVar('fbAskChecked'),
    trecho('fbSessionEmail'), trecho('fbSetStatus'), trecho('openFeedback'), trecho('closeFeedback'),
    trecho('submitFeedback'), trecho('fbAskEstado'), trecho('fbAskAdiar'), trecho('fbAskRegistrarEnvio'),
    trecho('anyModalOpen'), trecho('fbAskAbrir'), trecho('maybeAskFeedback')
  ].join('\n'), ctx);
  ctx.el = el;
  return ctx;
}

// Preenche o modal como o aluno preencheria (os cliques vivem no handler global).
function preencher(ctx, { nota, cat, tipo, texto }) {
  ctx.fbState.rating = nota; ctx.fbState.cat = cat; ctx.fbState.tipo = tipo || '';
  ctx.el('fb-text').value = texto || '';
}

(async () => {
  // ---- 1. ⚠️ O ENVIO SAI DO NAVEGADOR ---------------------------------------
  {
    const ctx = novoAmbiente();
    ctx.openFeedback();
    preencher(ctx, { nota: 4, cat: 'Questões', tipo: 'Sugestão', texto: 'Faltam questões de tireoide.' });
    ctx.submitFeedback();
    await tick(); await tick();
    ok('⚠️ manda o feedback para o servidor', ctx.enviados.length === 1, 'nada saiu do navegador');
    const req = ctx.enviados[0] || { body: {} };
    ok('usa o endpoint do app', req.url === '/api/ai', req.url);
    ok('vai pelo caminho que GRAVA o ticket', req.body.kind === 'support', JSON.stringify(req.body.kind));
    ok('a nota em estrelas viaja junto', /4\/5/.test(req.body.message || ''), req.body.message);
    ok('a categoria escolhida viaja junto', /Questões/.test(req.body.message || ''));
    ok('o tipo escolhido viaja junto', /Sugestão/.test(req.body.message || ''));
    ok('o texto do aluno viaja junto', (req.body.message || '').indexOf('Faltam questões de tireoide.') > 0, req.body.message);
    ok('a caixa de suporte separa feedback de dúvida', /^Feedback/.test(req.body.category || ''), req.body.category);
    ok('o e-mail da sessão identifica quem escreveu', req.body.email === 'aluno@teste.com', req.body.email);
    ok('só mostra o "obrigado" depois da confirmação', ctx.el('fb-success').style.display === 'block');
  }

  // ---- 2. ⚠️ FALHA DE REDE NÃO PODE VIRAR "OBRIGADO" ------------------------
  // Dizer "recebemos" sem ter recebido é o mesmo defeito de antes, só que com
  // uma desculpa melhor: o aluno não repete o que já acha que mandou.
  {
    const ctx = novoAmbiente({ falhaHttp: true });
    ctx.openFeedback();
    preencher(ctx, { nota: 2, cat: 'Chat IA', texto: 'trava no celular' });
    ctx.submitFeedback();
    await tick(); await tick();
    ok('⚠️ com erro do servidor, NÃO aparece o "obrigado"', ctx.el('fb-success').style.display !== 'block');
    ok('o formulário continua na tela para o aluno tentar de novo', ctx.el('fb-body').style.display === 'block');
    ok('o erro é dito na tela', String(ctx.el('fb-status').textContent || '').length > 0, 'falhou em silêncio');
    ok('o botão volta a funcionar', ctx.el('fb-submit').disabled === false);
  }

  // ---- 3. nota e categoria são obrigatórias; e-mail idem ---------------------
  {
    const ctx = novoAmbiente();
    ctx.openFeedback();
    preencher(ctx, { nota: 0, cat: '' });
    ctx.submitFeedback();
    ok('sem estrelas não envia', ctx.enviados.length === 0);
    preencher(ctx, { nota: 5, cat: '' });
    ctx.submitFeedback();
    ok('sem categoria não envia', ctx.enviados.length === 0);
  }
  {
    // Visitante/demo sem e-mail na sessão: o campo aparece e trava o envio até
    // ser preenchido — sem endereço o ticket não é gravado nem respondido.
    const ctx = novoAmbiente({ currentUser: null });
    ctx.openFeedback();
    ok('sem e-mail na sessão, o campo aparece', ctx.el('fb-email-wrap').style.display === 'block');
    preencher(ctx, { nota: 5, cat: 'Outro', texto: 'muito bom' });
    ctx.submitFeedback();
    ok('sem e-mail não envia', ctx.enviados.length === 0);
    ctx.el('fb-email').value = 'visitante@teste.com';
    ctx.submitFeedback();
    await tick(); await tick();
    ok('com e-mail digitado, envia', ctx.enviados.length === 1);
    ok('e usa o e-mail digitado', (ctx.enviados[0] || { body: {} }).body.email === 'visitante@teste.com');
  }
  {
    const ctx = novoAmbiente();
    ctx.openFeedback();
    ok('com e-mail na sessão, o campo fica escondido', ctx.el('fb-email-wrap').style.display === 'none');
  }

  // ---- 4. ⚠️ QUEM É CONVIDADO É DECISÃO DO BANCO ----------------------------
  // A regra (assinatura ativa há mais de 30 dias, a partir de 01/09/2026, sem
  // feedback anterior) mora na RPC endodirect_meu_feedback. Se o cliente puder
  // decidir sozinho, o app em cache no celular do aluno continua convidando
  // gente errada por dias depois de qualquer correção.
  {
    const ctx = novoAmbiente({ rpc: { dias: 47, ja_respondeu: false, pedir: true } });
    ctx.maybeAskFeedback();
    ok('pergunta ao banco quem deve ser convidado', ctx.rpcs.indexOf('endodirect_meu_feedback') >= 0, JSON.stringify(ctx.rpcs));
    ok('com pedir=true, agenda o convite', ctx.timers.length === 1, JSON.stringify(ctx.timers.map((t) => t.ms)));
    ok('o convite não pula na cara: espera alguns segundos', (ctx.timers[0] || {}).ms >= 5000, JSON.stringify((ctx.timers[0] || {}).ms));
    ctx.timers[0].fn();
    ok('o modal abre', ctx.el('feedback-modal').style.display === 'flex');
    ok('o convite explica há quanto tempo o aluno é assinante', /47 dias|1 mes|meses/.test(ctx.el('fb-intro').textContent), ctx.el('fb-intro').textContent);
    ok('o botão de sair vira "Agora não"', ctx.el('fb-cancel').textContent === 'Agora não', ctx.el('fb-cancel').textContent);
  }
  {
    const ctx = novoAmbiente({ rpc: { dias: 12, ja_respondeu: false, pedir: false } });
    ctx.maybeAskFeedback();
    ok('⚠️ com pedir=false, NÃO convida', ctx.timers.length === 0, 'convidaria quem o banco excluiu');
  }
  {
    const ctx = novoAmbiente({ rpc: { dias: 400, ja_respondeu: true, pedir: false } });
    ctx.maybeAskFeedback();
    ok('⚠️ quem já respondeu não é convidado de novo', ctx.timers.length === 0);
  }
  {
    const ctx = novoAmbiente({ sessaoReal: false, rpc: { dias: 90, ja_respondeu: false, pedir: true } });
    ctx.maybeAskFeedback();
    ok('⚠️ conta de demonstração não é convidada', ctx.rpcs.length === 0 && ctx.timers.length === 0, 'o convite apareceria nas demos');
  }
  {
    const ctx = novoAmbiente({ currentUser: { id: 'a1', email: 'prof@x.com', role: 'admin' }, rpc: { dias: 90, ja_respondeu: false, pedir: true } });
    ctx.maybeAskFeedback();
    ok('o professor não é convidado', ctx.rpcs.length === 0 && ctx.timers.length === 0);
  }

  // ---- 5. ⚠️ "AGORA NÃO" TEM DE VALER ---------------------------------------
  // Sem isto o app repete o convite a CADA abertura — o jeito mais rápido de
  // transformar um pedido educado em motivo de cancelamento.
  {
    const ctx = novoAmbiente({ rpc: { dias: 60, ja_respondeu: false, pedir: true } });
    ctx.maybeAskFeedback();
    ctx.timers[0].fn();
    ctx.closeFeedback();
    const st = ctx.store['fb_ask'] || {};
    ok('⚠️ fechar o convite conta como "agora não"', !!st.ate, JSON.stringify(st));
    ok('e o silêncio dura semanas, não horas', new Date(st.ate).getTime() - Date.now() > 6 * 864e5, JSON.stringify(st));
    ok('a tentativa é contada', (st.n || 0) === 1, JSON.stringify(st));

    // Próxima abertura do app, com o "agora não" ainda valendo.
    const ctx2 = novoAmbiente({ rpc: { dias: 60, ja_respondeu: false, pedir: true } });
    ctx2.store['fb_ask'] = st;
    ctx2.maybeAskFeedback();
    ok('⚠️ não convida de novo enquanto o adiamento vale', ctx2.rpcs.length === 0 && ctx2.timers.length === 0);

    // Depois do prazo, pode convidar outra vez — até o limite.
    const ctx3 = novoAmbiente({ rpc: { dias: 60, ja_respondeu: false, pedir: true } });
    ctx3.store['fb_ask'] = { n: 1, ate: new Date(Date.now() - 864e5).toISOString() };
    ctx3.maybeAskFeedback();
    ok('passado o prazo, convida de novo', ctx3.timers.length === 1);

    const ctx4 = novoAmbiente({ rpc: { dias: 60, ja_respondeu: false, pedir: true } });
    ctx4.store['fb_ask'] = { n: 3, ate: '' };
    ctx4.maybeAskFeedback();
    ok('⚠️ existe um teto de convites por pessoa', ctx4.rpcs.length === 0 && ctx4.timers.length === 0, 'insistiria para sempre');
  }
  {
    // Quem respondeu neste aparelho não é convidado de novo nem antes de a RPC
    // enxergar o ticket (a gravação e a leitura não são instantâneas).
    const ctx = novoAmbiente();
    ctx.openFeedback();
    preencher(ctx, { nota: 5, cat: 'Outro', texto: 'ótimo' });
    ctx.submitFeedback();
    await tick(); await tick();
    ok('depois de enviar, o aparelho para de convidar', (ctx.store['fb_ask'] || {}).n >= 3, JSON.stringify(ctx.store['fb_ask']));
  }

  // ---- 6. não empilhar janela em cima de janela -----------------------------
  {
    const ctx = novoAmbiente({ modaisAbertos: ['onboard-modal'], rpc: { dias: 60, ja_respondeu: false, pedir: true } });
    ctx.maybeAskFeedback();
    ctx.timers[0].fn();
    ok('⚠️ com o onboarding aberto, o convite espera', ctx.el('feedback-modal').style.display !== 'flex', 'dois modais empilhados');
    ok('e tenta de novo mais tarde', ctx.timers.length === 2, JSON.stringify(ctx.timers.map((t) => t.ms)));
  }

  // ---- 7. o convite está ligado na abertura do app --------------------------
  {
    ok('o app chama o convite ao entrar', (SRC.match(/maybeAskFeedback\(\);/g) || []).length >= 2,
       'sem a chamada em startApp/hydrate, ninguém é convidado');
    ok('a data de início da campanha NÃO está no cliente', !/2026-09-01/.test(SRC),
       'no cliente ela fica presa no cache do celular do aluno');
  }

  if (bad) { console.error('\n' + bad + ' verificação(ões) do feedback falharam.'); process.exit(1); }
  console.log('Feedback (envio + convite de 30 dias): OK');
})();
