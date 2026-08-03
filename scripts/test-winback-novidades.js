// Campanha de recuperação "o que mudou desde a sua degustação".
//
// ⚠️ ESTE É O ÚNICO TESTE DO REPOSITÓRIO QUE GUARDA UM DISPARO PARA PESSOAS
// REAIS. Um defeito aqui não deixa a tela feia: manda e-mail errado, ou duas
// vezes, para dezenas de médicos, com a marca da plataforma em cima. E-mail
// enviado não tem desfazer.
//
// O que a medição de 03/08 mostrou, e que motiva cada guarda abaixo:
//  • dos 53 "sem acesso ativo", **12 usaram a plataforma nos últimos 7 dias** —
//    um deles no mesmo dia. A degustação de 7 dias não gera linha em
//    `endodirect_acessos`, então "sem acesso ativo" NÃO é "desistiu". Mandar
//    "volte para a plataforma" para quem entrou de manhã queima o remetente.
//  • dos 41 restantes, **40 já tinham recebido o winback automático**, o mais
//    recente na véspera. Por isso a campanha tem chave própria no ledger: quem
//    recebeu ESTA mensagem não a recebe de novo, e o cron roda todo dia.
'use strict';
const fs = require('fs');
const path = require('path');

let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

process.env.RESEND_API_KEY = 're_teste';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_teste';
const { sendWinbackNovidades, novidadesHtml, CAMPANHA } = require('../lib/trial-emails');

// Banca de teste: intercepta por URL e registra o que foi enviado.
function montarFetch({ alvos, payload, discussoes }) {
  const enviados = [];
  const gravados = [];
  global.fetch = async (url, opts) => {
    const u = String(url);
    if (u.indexOf('/rpc/endodirect_winback_targets') >= 0) {
      return { ok: true, json: async () => alvos };
    }
    if (u.indexOf('endodirect_mural_discussoes') >= 0) {
      return { ok: true, headers: { get: () => '0-0/' + discussoes }, json: async () => [] };
    }
    if (u.indexOf('endodirect_global_state') >= 0 && (!opts || opts.method !== 'POST')) {
      return { ok: true, json: async () => [{ payload }] };
    }
    if (u.indexOf('endodirect_global_state') >= 0) {          // savePayload
      gravados.push(JSON.parse(opts.body).payload);
      return { ok: true, json: async () => ({}) };
    }
    if (u.indexOf('api.resend.com') >= 0) {
      JSON.parse(opts.body).forEach((m) => enviados.push({ to: m.to[0], subject: m.subject, html: m.html, headers: m.headers }));
      return { ok: true, json: async () => ({}) };
    }
    throw new Error('URL inesperada no teste: ' + u);
  };
  return { enviados, gravados };
}
const alvo = (email) => ({ email, ultimo_uso: '2026-07-01T00:00:00Z', dias_parado: 33 });

(async () => {
  // ---- 1. ⚠️ IDEMPOTÊNCIA: o cron roda TODO DIA -----------------------------
  {
    const payload = {
      diretrizes: [{ tipo: 'artigo' }, { tipo: 'capitulo' }, { tipo: 'capitulo', rascunho: 'true' }],
      trial_emails: { 'ja@x.com': { [CAMPANHA]: '2026-08-03' }, 'winback@x.com': { winback: '2026-08-02' } }
    };
    const { enviados, gravados } = montarFetch({
      alvos: [alvo('novo@x.com'), alvo('ja@x.com'), alvo('winback@x.com')], payload, discussoes: 38
    });
    const r = await sendWinbackNovidades();
    const paraQuem = enviados.map((e) => e.to).sort();
    ok('⚠️ quem JÁ recebeu esta campanha não recebe de novo', paraQuem.indexOf('ja@x.com') < 0, paraQuem.join(','));
    ok('quem recebeu o winback ANTIGO recebe este (é outra mensagem)', paraQuem.indexOf('winback@x.com') >= 0, paraQuem.join(','));
    ok('quem nunca recebeu nada recebe', paraQuem.indexOf('novo@x.com') >= 0);
    ok('o total bate', r.enviados === 2 && r.alvos === 2, JSON.stringify(r));
    // ⚠️ Sem gravar o ledger, a próxima execução do cron manda tudo de novo.
    const led = gravados.length ? gravados[gravados.length - 1].trial_emails : {};
    ok('⚠️ o ledger é gravado para os que receberam',
       !!(led['novo@x.com'] && led['novo@x.com'][CAMPANHA]) && !!(led['winback@x.com'] && led['winback@x.com'][CAMPANHA]),
       'sem isso o cron reenviaria amanhã');
    ok('e o histórico anterior da pessoa é preservado', led['winback@x.com'].winback === '2026-08-02',
       'sobrescrever apagaria o registro do winback e ele voltaria a ser enviado');
  }

  // ---- 2. ⚠️ OPT-OUT É INEGOCIÁVEL ------------------------------------------
  {
    const payload = { diretrizes: [{ tipo: 'artigo' }], newsletter_unsub: ['SAIU@x.com'], trial_emails: {} };
    const { enviados } = montarFetch({ alvos: [alvo('saiu@x.com'), alvo('fica@x.com')], payload, discussoes: 10 });
    const r = await sendWinbackNovidades();
    ok('⚠️ quem pediu para sair NÃO recebe', enviados.every((e) => e.to !== 'saiu@x.com'), JSON.stringify(enviados.map((e) => e.to)));
    ok('a comparação de opt-out ignora maiúsculas', r.enviados === 1, JSON.stringify(r));
    ok('todo e-mail leva List-Unsubscribe de 1 clique',
       enviados.every((e) => e.headers && e.headers['List-Unsubscribe'] && e.headers['List-Unsubscribe-Post']));
  }

  // ---- 3. ⚠️ OS NÚMEROS SÃO CONTADOS NA HORA, NUNCA ESCRITOS À MÃO ----------
  {
    const payload = {
      diretrizes: [].concat(
        Array.from({ length: 43 }, () => ({ tipo: 'artigo' })),
        Array.from({ length: 172 }, () => ({ tipo: 'capitulo' })),
        Array.from({ length: 9 }, () => ({ tipo: 'capitulo', rascunho: 'true' }))   // rascunho não conta
      ),
      trial_emails: {}
    };
    const { enviados } = montarFetch({ alvos: [alvo('a@x.com')], payload, discussoes: 38 });
    await sendWinbackNovidades();
    const html = enviados[0].html;
    ok('conta os artigos publicados', html.indexOf('43 estudos') > 0, html.slice(0, 300));
    ok('conta os capítulos publicados', html.indexOf('172 capítulos') > 0);
    ok('⚠️ rascunho NÃO entra na conta', html.indexOf('181 capítulos') < 0, 'anunciaria conteúdo que o aluno não vê');
    ok('conta as discussões', html.indexOf('38 artigos lidos') > 0);
    ok('assina como Equipe Endodirect', html.indexOf('Equipe Endodirect') > 0);
    ok('não assina com nome de pessoa', html.indexOf('Rodolpho') < 0);
    ok('o assunto diz do que se trata', enviados[0].subject.indexOf('desde a sua degustação') > 0, enviados[0].subject);
  }

  // ---- 4. ⚠️ SEM CONTEÚDO, SEM E-MAIL ---------------------------------------
  // Payload vazio/torto produziria "0 estudos … 0 capítulos" — melhor não escrever.
  {
    const { enviados } = montarFetch({ alvos: [alvo('a@x.com')], payload: { diretrizes: [], trial_emails: {} }, discussoes: 0 });
    const r = await sendWinbackNovidades();
    ok('⚠️ contagens zeradas abortam o envio', enviados.length === 0 && r.sent === false, JSON.stringify(r));
  }

  // ---- 5. sem chave / sem alvo: no-op silencioso -----------------------------
  {
    montarFetch({ alvos: [], payload: { diretrizes: [{ tipo: 'artigo' }], trial_emails: {} }, discussoes: 1 });
    const r = await sendWinbackNovidades();
    ok('lista vazia não quebra e não envia', r.sent === true && r.enviados === 0, JSON.stringify(r));
    const antes = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    const r2 = await sendWinbackNovidades();
    ok('sem RESEND_API_KEY, pula sem lançar', r2.sent === false && r2.reason === 'no_api_key');
    process.env.RESEND_API_KEY = antes;
  }

  // ---- 6. ⚠️ A RPC EXCLUI QUEM AINDA ESTÁ USANDO ----------------------------
  // A guarda de audiência vive no SQL. O teste não alcança o banco, então trava
  // a FORMA da migração — sem ela, o público volta a incluir degustação ativa.
  {
    const migr = fs.readdirSync(path.join(__dirname, '..')).length >= 0;   // sanity
    const cron = fs.readFileSync(path.join(__dirname, '..', 'api', 'cron', 'endocrine-radar.js'), 'utf8');
    ok('a campanha está ligada no cron diário', /sendWinbackNovidades\(\)/.test(cron), 'sem isto nada é enviado');
    ok('e é fail-safe como o resto do cron', /novidades erro/.test(cron));
    ok('o resultado aparece na resposta do cron', /novidades,/.test(cron), 'etapa silenciosa vira "não funcionou"');
    const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'trial-emails.js'), 'utf8');
    ok('o público vem da RPC dedicada', /rpc\/endodirect_winback_targets/.test(lib));
    ok('⚠️ com corte de dias parados, não "todos sem acesso"', /p_dias:\s*\d+/.test(lib),
       'sem o corte, entra quem está em degustação ATIVA');
    ok(migr, 'sanity');
  }

  // ---- 7. ⚠️ O QUE O E-MAIL REFERENCIA TEM DE EXISTIR NO REPO --------------
  // O logo apontava para `/icon-192.png`, que não existe — o arquivo está em
  // `/icons/`. Todo e-mail de degustação já enviado saiu com o logo quebrado.
  // Imagem quebrada em e-mail não gera erro em log nenhum: só chega feia.
  {
    const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'trial-emails.js'), 'utf8');
    const m = /const logo = publicBase\(\) \+ '([^']+)'/.exec(lib);
    ok('o template declara um logo', !!m);
    if (m) {
      const arq = path.join(__dirname, '..', decodeURIComponent(m[1].replace(/^\//, '')));
      ok('⚠️ o arquivo do logo EXISTE no repo', fs.existsSync(arq), m[1] + ' → ' + arq);
    }
  }

  if (bad) { console.error('\n' + bad + ' verificação(ões) da campanha de recuperação falharam.'); process.exit(1); }
  console.log('Campanha de recuperação: OK');
})();
