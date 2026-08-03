// A caixa "Na prática" da newsletter diária — e o defeito que ela deixou passar.
//
// ⚠️ O DEFEITO QUE ESTE TESTE EXISTE PARA PEGAR (02/08/2026): o rótulo do mural
// virou "Na prática:" em `lib/radar.js`, os 376 itens gravados foram migrados —
// e `extractFromTexto`, aqui na newsletter, continuou conhecendo só o rótulo
// ANTIGO. O `porque` passou a sair string vazia, e o template do e-mail monta a
// caixa azul dentro de um `${a.porque ? … : ''}`: **valor vazio não quebra nada,
// só apaga o bloco**. A newsletter do dia foi enviada com a caixa em 1 de 3
// artigos, sem erro em log nenhum, e ninguém teria notado — apareceu porque o
// professor perguntou de outra coisa.
//
// A lição que estas asserções guardam: quando um dado alimenta um bloco
// OPCIONAL do template, perdê-lo é invisível. O teste é o único lugar onde
// "veio vazio" vira ruído.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'lib', 'newsletter.js'), 'utf8');
let bad = 0;
const ok = (nome, cond, det) => { if (cond) return; bad++; console.log('  ✗ ' + nome + (det ? ' — ' + det : '')); };

// Recorta uma declaração pelo nome, até a próxima no nível zero.
function trecho(cabeca) {
  const i = SRC.indexOf(cabeca);
  if (i < 0) { console.log('  ✗ não achei ' + cabeca); bad++; return ''; }
  const j = SRC.indexOf('\nfunction ', i + 1);
  return SRC.slice(i, j < 0 ? undefined : j);
}
const ctx = { console };
vm.createContext(ctx);
vm.runInContext([
  trecho('const RE_PORQUE ='),
  trecho('function extractFromTexto('),
  trecho('function muralItems(')
].join('\n'), ctx);

const item = (o) => Object.assign({ titulo: 'T', breaking: false, link: 'x', texto: '' }, o);
const TXT = (rotulo) => '📝 Resumo: O estudo avaliou X.\n' + rotulo + ' Muda a escolha do exame.\n'
  + '⚠️ Cautela/limitação: amostra pequena.';
const um = (o) => ctx.muralItems({ radar_avisos: [item(o)] })[0];

// ---- 1. ⚠️ O RÓTULO NOVO PRODUZ A CAIXA ------------------------------------
// Esta é a asserção que teria evitado o envio de 02/08.
{
  const a = um({ texto: TXT('💡 Na prática:') });
  ok('⚠️ rótulo NOVO ("Na prática") preenche o porque', a.porque === 'Muda a escolha do exame.',
     'vazio aqui APAGA a caixa azul do e-mail, sem erro nenhum — foi o que aconteceu em 02/08');
  ok('o resumo continua sendo lido', a.resumo === 'O estudo avaliou X.', a.resumo);
  ok('a cautela NÃO entra no porque', a.porque.indexOf('amostra pequena') < 0, a.porque);
}

// ---- 2. o rótulo ANTIGO continua valendo ------------------------------------
// Item que escape de uma migração futura fica com o texto antigo para sempre.
{
  const a = um({ texto: TXT('💡 Por que importa na prática:') });
  ok('rótulo ANTIGO ainda preenche o porque', a.porque === 'Muda a escolha do exame.', a.porque);
  const b = um({ texto: TXT('💡 Por que importa:') });
  ok('a variante curta do rótulo antigo também', b.porque === 'Muda a escolha do exame.', b.porque);
}

// ---- 3. ⚠️ O CAMPO ESTRUTURADO VENCE O TEXTO -------------------------------
// `runRadar` grava `porque` no item, sem rótulo dentro. Ler dele é o que tira a
// newsletter da dependência de como o rótulo está escrito no dia.
{
  const a = um({ texto: TXT('💡 Na prática:'), porque: 'Vindo do campo do radar.' });
  ok('⚠️ o campo `porque` do item vem primeiro', a.porque === 'Vindo do campo do radar.', a.porque);
  const b = um({ texto: TXT('🙂 Rótulo que ninguém previu:'), porque: 'Ainda assim aparece.' });
  ok('com o campo, um rótulo desconhecido no texto não derruba a caixa', b.porque === 'Ainda assim aparece.',
     'é o ponto: a caixa deixa de depender do rótulo');
  const c = um({ texto: TXT('💡 Na prática:'), porque: '   ' });
  ok('campo só com espaços cai para o texto', c.porque === 'Muda a escolha do exame.', c.porque);
  const d = um({ texto: '📝 Resumo: só isto.', porque: '' });
  ok('sem porque em lugar nenhum, fica vazio (o e-mail omite a caixa)', d.porque === '', d.porque);
}

// ---- 4. ⚠️ A CAIXA É OPCIONAL NO TEMPLATE — por isso o vazio é invisível ----
// Se algum dia o bloco deixar de ser condicional, some o motivo do teste; se
// continuar, a asserção acima é a única rede.
{
  ok('a caixa do e-mail é condicional ao porque', /\$\{a\.porque \? `<div/.test(SRC),
     'se isto mudar, revisar o porquê deste arquivo');
  ok('o rótulo impresso no e-mail é "Na prática:"', /<b[^>]*>Na prática:<\/b>/.test(SRC));
  ok('o rótulo antigo não é mais impresso', !/<b[^>]*>Por que importa:<\/b>/.test(SRC));
  // A regex do resumo termina no 💡 — trocar o emoji do rótulo quebraria o corte.
  ok('o corte do resumo ainda reconhece o 💡 que abre a linha seguinte',
     /Resumo:[^/]*\[💡/.test(SRC), 'sem isso o resumo engoliria a linha do "Na prática"');
}

// ---- 5. o filtro do mural continua o mesmo ---------------------------------
{
  const l = ctx.muralItems({ radar_avisos: [
    item({ titulo: 'A' }), item({ titulo: 'B', breaking: true }), item({ titulo: '' }), null
  ] });
  ok('breaking fica de fora do e-mail', !l.some((x) => x.titulo === 'B'), JSON.stringify(l.map((x) => x.titulo)));
  ok('item sem título fica de fora', l.length === 1, String(l.length));
  ok('lista vazia/torta não quebra', ctx.muralItems({}).length === 0);
}

// ---- ⚠️ TRAVA CLAIM-FIRST CONTRA ENVIO DUPLICADO ---------------------------
// A trava `newsletter_sent` era lida no INÍCIO e gravada só DEPOIS do envio, que
// leva vários segundos (um POST à Resend por destinatário). Dois disparos
// concorrentes liam ambos "ainda não enviada" e mandavam a edição DUAS VEZES
// para a lista inteira.
//
// ⚠️ ESTAS ASSERÇÕES SÃO DE ORDEM, e ordem é o defeito inteiro aqui. Reservar
// depois de enviar é literalmente o código antigo — o mesmo texto, na linha
// errada, não protege nada.
{
  const src = SRC.replace(/^\s*\/\/.*$/gm, '');
  const i0 = src.indexOf('async function sendDailyNewsletter');
  const bloco = src.slice(i0);
  const iClaim = bloco.indexOf('claimNewsletterDay(');
  const iEnvio = bloco.indexOf('sendViaResend(');
  const iGrava = bloco.indexOf('newsletter_sent = today');
  const iSolta = bloco.indexOf('releaseNewsletterDay(');

  ok('a reserva do dia existe', iClaim > 0);
  ok('⚠️ a reserva vem ANTES do envio', iClaim > 0 && iEnvio > 0 && iClaim < iEnvio,
     'reservar depois de enviar é o código antigo: não protege de nada');
  ok('e antes de gravar a trava no payload', iClaim < iGrava);
  ok('a reserva usa a RPC atômica, não um select+update',
     /rpc\/\$\{fn\}/.test(src) && /endodirect_newsletter_claim/.test(src));

  // ⚠️ Reservar antes cria um risco novo: falha da Resend queimaria o dia.
  ok('há devolução da reserva', iSolta > 0);
  ok('⚠️ a devolução vem DEPOIS do envio (só faz sentido sabendo o resultado)', iSolta > iEnvio);
  ok('⚠️ e só quando ZERO destinatários receberam', /claim === true && sent === 0/.test(bloco),
     'devolver com 1 entregue faria o reprocesso duplicar para esse destinatário');

  // ⚠️ RPC ausente (deploy anterior à migração) não pode travar o envio.
  ok('claim === false pula o envio', /claim === false/.test(bloco));
  ok('⚠️ claim === null NÃO pula o envio', /claim === null/.test(bloco) && !/claim !== true/.test(bloco),
     'entre não enviar e um risco raro de duplicata, o comportamento antigo é o menos ruim');
}

if (bad) { console.error('\n' + bad + ' verificação(ões) da caixa "Na prática" da newsletter falharam.'); process.exit(1); }
console.log('Newsletter (caixa "Na prática"): OK');
