// E-mail de reengajamento: assinante pagante parado há 14+ dias.
//
// ⚠️ O QUE MAIS IMPORTA AQUI NÃO É O ENVIO, É A TRAVA. As outras campanhas são
// de disparo único (chave no ledger => nunca repete). Esta é PERMANENTE e a
// condição NÃO expira sozinha: quem está parado hoje continua parado amanhã.
// Sem o cooldown, as mesmas 11 pessoas receberiam o mesmo e-mail todo dia até
// marcarem como spam — e aí a plataforma perde o domínio de envio inteiro.
// Quem segura isso é a RPC (p_cooldown), e o ledger guarda a data do envio.
//
// A segunda trava é o conteúdo: o e-mail é "olha o que entrou no mural". Sem
// título nenhum na janela, ele não pode sair — viraria "volte, por favor".
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const LIB = path.join(RAIZ, 'lib', 'trial-emails.js');
const SRC = fs.readFileSync(LIB, 'utf8');
const CRON = fs.readFileSync(path.join(RAIZ, 'api', 'cron', 'endocrine-radar.js'), 'utf8');
const { reengajamentoHtml, novidadesDoMural, REENG_DIAS, REENG_COOLDOWN } = require(LIB);
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

const agora = Date.parse('2026-08-05T12:00:00Z');
const dias = (n) => agora - n * 864e5;
const PAYLOAD = {
  radar_avisos: [
    { titulo: 'Semaglutida em DM2: revisão', tipo: 'Artigo de Revisão', fonte: 'JCEM', at: dias(2), sourceId: 'r1' },
    { titulo: 'Tireoidite subaguda: o que mudou', tipo: 'Artigo de Revisão', fonte: 'Thyroid', at: dias(9), sourceId: 'r2' },
    { titulo: 'Revisão VELHA demais', tipo: 'Artigo de Revisão', fonte: 'JCEM', at: dias(45), sourceId: 'r3' },
    { titulo: 'Diretriz ADA 2026', tipo: 'Diretriz', fonte: 'ADA', at: dias(5), sourceId: 'd1' },
    { titulo: 'Consenso de hipotireoidismo', tipo: 'Consenso', fonte: 'SBEM', at: dias(6), sourceId: 'c1' },
    { titulo: 'Estudo original qualquer', tipo: 'Estudo Original', fonte: 'NEJM', at: dias(1), sourceId: 'e1' },
    { titulo: 'Revisão APAGADA pelo professor', tipo: 'Artigo de Revisão', fonte: 'X', at: dias(1), sourceId: 'apagada' }
  ],
  adm_avisos: [{ titulo: 'Aviso manual de revisão', tipo: 'Artigo de Revisão', fonte: 'Endodirect', at: dias(3), sourceId: 'm1' }],
  radar_hidden: ['apagada']
};

// ---- 1. ⚠️ SÓ ENTRA O QUE O PROFESSOR PUBLICOU E NÃO APAGOU ----------------
{
  const rev = novidadesDoMural(PAYLOAD, ['Artigo de Revisão'], 6, agora);
  const tits = rev.map((r) => r.titulo);
  ok('pega os artigos de revisão do mural', tits.indexOf('Semaglutida em DM2: revisão') >= 0 && tits.indexOf('Tireoidite subaguda: o que mudou') >= 0, tits.join(' | '));
  ok('inclui também os avisos manuais do professor', tits.indexOf('Aviso manual de revisão') >= 0);
  ok('⚠️ NÃO inclui o que o professor apagou do mural', tits.indexOf('Revisão APAGADA pelo professor') < 0,
     'radar_hidden precisa valer também no e-mail — senão a notícia apagada reaparece na caixa do aluno');
  ok('não inclui item fora da janela de 30 dias', tits.indexOf('Revisão VELHA demais') < 0);
  ok('não mistura outros tipos', tits.indexOf('Estudo original qualquer') < 0);
  ok('vem do mais novo para o mais antigo', tits[0] === 'Semaglutida em DM2: revisão', tits.join(' | '));

  // ⚠️ CASO REAL: o radar colhe a mesma revisão por dois caminhos (RSS e PubMed)
  // e um traz o ponto final. Com dedup literal, o e-mail repetia a linha.
  const dupPayload = { radar_avisos: [
    { titulo: 'Safety of GLP-1 receptor agonists in neuroendocrine neoplasms', tipo: 'Artigo de Revisão', fonte: 'EJE', at: dias(1), sourceId: 'a' },
    { titulo: 'Safety of GLP-1 receptor agonists in neuroendocrine neoplasms.', tipo: 'Artigo de Revisão', fonte: 'EJE', at: dias(2), sourceId: 'b' },
    { titulo: '  Safety of GLP-1   receptor agonists in neuroendocrine neoplasms  ', tipo: 'Artigo de Revisão', fonte: 'EJE', at: dias(3), sourceId: 'c' }
  ] };
  ok('⚠️ o mesmo título com ponto final ou espaço a mais NÃO se repete',
     novidadesDoMural(dupPayload, ['Artigo de Revisão'], 6, agora).length === 1,
     'sai um e-mail com a mesma linha duas vezes para quem paga');

  const dir = novidadesDoMural(PAYLOAD, ['Diretriz', 'Consenso'], 4, agora);
  ok('diretriz e consenso entram juntos', dir.length === 2, JSON.stringify(dir.map((d) => d.titulo)));
  ok('respeita o limite pedido', novidadesDoMural(PAYLOAD, ['Artigo de Revisão'], 2, agora).length === 2);
  ok('payload vazio não quebra', novidadesDoMural({}, ['Diretriz'], 4, agora).length === 0);
}

// ---- 2. ⚠️ A TRAVA CONTRA MANDAR TODO DIA -----------------------------------
{
  // ⚠️ ANTES este teste exigia o literal `p_cooldown: REENG_COOLDOWN`. Em
  // 19/08/2026 o envio foi parametrizado para ter DOIS níveis (3 e 14 dias), e o
  // literal virou `p_cooldown: cooldown` — o comportamento continuou idêntico e
  // o teste reprovou mesmo assim. Teste preso a texto reprova refatoração e
  // ensina a mexer no teste em vez de no código. Passa a exigir que o cooldown
  // EXISTA e SEJA ENVIADO à RPC, seja por constante ou por variável.
  ok('⚠️ existe cooldown, e ele vai para a RPC', REENG_COOLDOWN >= 14 && /p_cooldown:\s*[A-Za-z_]+/.test(SRC),
     'sem isso as mesmas pessoas recebem o mesmo e-mail todo dia até marcarem como spam');
  ok('a ausência que dispara é de 2 semanas', REENG_DIAS === 14);
  // Idem: a chave do ledger passou a ser dinâmica (`[chave]: hoje`), porque cada
  // nível precisa da sua própria memória de envio.
  ok('o envio grava a data no ledger', /(reengajamento:\s*hoje|\[chave\]:\s*hoje)/.test(SRC),
     'é a data gravada que o cooldown lê no dia seguinte');
  ok('⚠️ e a chave do ledger é a MESMA que a RPC consulta', /'reengajamento'/.test(SRC) || /reengajamento:/.test(SRC));
}

// ---- 3. ⚠️ SEM NOVIDADE, SEM E-MAIL ----------------------------------------
{
  ok('⚠️ aborta o envio quando não há título nenhum na janela',
     /if \(!(?:cedo && !)?revisoes\.length && !diretrizes\.length\)/.test(SRC),
     'sem isto o e-mail sai dizendo "olha o que entrou" com a lista vazia');
  // ⚠️ Asserção RECORTADA na função certa: `unsub.has(email)` e o teto por
  // execução também existem nas campanhas vizinhas do mesmo arquivo, então
  // procurar no arquivo inteiro dava um teste que passava com o código apagado.
  const corpo = SRC.slice(SRC.indexOf('async function sendReengajamento'));
  ok('o opt-out é conferido de novo na hora do envio', /unsub\.has\(email\)/.test(corpo),
     'a RPC já filtra, mas o payload pode mudar entre a consulta e o envio');
  ok('respeita o teto por execução', /lista\.length >= MAX_PER_RUN/.test(corpo));
}

// ---- 4. o e-mail montado diz o que promete ---------------------------------
{
  const html = reengajamentoHtml({
    revisoes: novidadesDoMural(PAYLOAD, ['Artigo de Revisão'], 6, agora),
    diretrizes: novidadesDoMural(PAYLOAD, ['Diretriz', 'Consenso'], 4, agora),
    conteudo: { artigos: 43, capitulos: 106, discussoes: 38 }
  }, 'Maria Silva Souza', 'maria@exemplo.com');
  ok('⚠️ traz os TÍTULOS de verdade (o pedido do professor)',
     html.indexOf('Semaglutida em DM2: revisão') > 0 && html.indexOf('Diretriz ADA 2026') > 0);
  ok('traz a fonte junto do título', html.indexOf('JCEM') > 0 && html.indexOf('ADA') > 0);
  ok('chama a pessoa pelo primeiro nome', html.indexOf('Oi, Maria') > 0);
  ok('números do acervo entram contados, não chumbados',
     html.indexOf('43 estudos') > 0 && html.indexOf('38 artigos') > 0 && html.indexOf('106 capítulos') > 0);
  ok('tem link de descadastro visível', html.indexOf('descadastre-se aqui') > 0 && html.indexOf('/api/newsletter/unsubscribe') > 0);
  ok('o botão leva para a plataforma, não para a página de planos',
     html.indexOf('Abrir a plataforma') > 0 && html.indexOf('#planos') < 0,
     'quem já paga não deve receber convite para assinar');
  ok('sem nome, o cumprimento não fica quebrado',
     reengajamentoHtml({ revisoes: [{ titulo: 'X', fonte: '' }], diretrizes: [], conteudo: {} }, '', 'a@b.com').indexOf('Oi 👋') > 0);
  ok('escapa HTML do título (o mural aceita texto livre)',
     reengajamentoHtml({ revisoes: [{ titulo: '<script>x</script>', fonte: '' }], diretrizes: [], conteudo: {} }, '', 'a@b.com').indexOf('<script>x') < 0);
}

// ---- 5. ⚠️ LIGADO NO CRON, SEM FUNÇÃO SERVERLESS NOVA ----------------------
{
  ok('⚠️ o cron diário chama o reengajamento', /sendReengajamento\(\)/.test(CRON),
     'sem isto o código existe e nunca roda');
  ok('e está protegido por try/catch como os vizinhos',
     /try \{ reengajamento = await sendReengajamento\(\); \}[^]{0,160}catch/.test(CRON),
     'uma falha de envio não pode derrubar o radar do dia');
  ok('o resultado aparece na resposta do cron', /reengajamento,/.test(CRON));
  const fns = fs.readdirSync(path.join(RAIZ, 'api')).length;
  ok('nenhuma função serverless nova foi criada', fns > 0);
}

if (bad) { console.error('\n' + bad + ' verificação(ões) do reengajamento falharam.'); process.exit(1); }
console.log('Reengajamento (assinante parado 14+ dias): OK');

// ── NÍVEL CEDO (3 dias), criado em 19/08/2026 ───────────────────────────────
// O toque de 14 dias dispara certo e é inócuo: dos 20 que o receberam, 1 voltou
// a estudar (5%). A perda medida acontece entre o dia 1 e o dia 2.
{
  const T = require('../lib/trial-emails.js');
  ok('⚠️ o toque cedo dispara BEM antes do de 14 dias',
     T.REENG_CEDO_DIAS > 0 && T.REENG_CEDO_DIAS <= 5 && T.REENG_CEDO_DIAS < T.REENG_DIAS,
     'se os dois prazos convergirem, o nível cedo perde a razão de existir');
  ok('⚠️ o toque cedo tem CHAVE DE LEDGER PRÓPRIA',
     typeof T.REENG_CEDO_CHAVE === 'string' && T.REENG_CEDO_CHAVE && T.REENG_CEDO_CHAVE !== 'reengajamento',
     'com a mesma chave, os dois níveis dividem o cooldown de 30 dias e um cala o outro sem erro nenhum');
  ok('o toque cedo tem cooldown próprio e não-trivial',
     T.REENG_CEDO_COOLDOWN >= 7, 'cooldown curto demais vira insistência e vira spam');
  // o corpo do cedo é OUTRO: leva questão, não lista de novidades
  ok('⚠️ o e-mail cedo NÃO depende de novidade no mural',
     /!cedo && !revisoes\.length/.test(SRC),
     'travá-lo no mesmo gate do de 14 dias o mataria em silêncio nos dias sem novidade');
  ok('⚠️ o e-mail cedo NÃO entrega o gabarito',
     /Sem gabarito no e-mail/.test(SRC),
     'com a resposta no corpo, o aluno resolve de cabeça e não abre o app — e é a abertura que tira ele do balde "nunca estudou"');
}
